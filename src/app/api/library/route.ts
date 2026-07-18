import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { tmdb } from "@/lib/tmdb";
import { updateWatchItemSchema } from "@/lib/library-schema";
import { flattenFieldErrors } from "@/lib/auth-schemas";
import { logAudit, clientIp } from "@/lib/audit";

/** Shape lỏng của chi tiết TMDb dùng khi tạo MediaItem. */
interface TmdbCreateDetail {
  name?: string;
  title?: string;
  original_name?: string;
  original_title?: string;
  tagline?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_episodes?: number;
  vote_average?: number;
  genres?: { name: string }[];
  production_countries?: { iso_3166_1: string }[];
  credits?: { crew?: { job: string; name: string }[]; cast?: { name: string }[] };
  videos?: { results?: { type: string; site: string; key: string }[] };
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const items = await db.watchItem.findMany({
      where: { userId, ...(status && status !== "all" ? { status } : {}) },
      include: {
        mediaItem: true,
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { lastWatchedAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err: unknown) {
    console.error("Library GET Route Error:", err);
    return NextResponse.json(
      { error: "Hệ thống cơ sở dữ liệu chưa sẵn sàng hoặc bị lỗi." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const body = await req.json();
    const { tmdbId, mediaType, status, personalScore, notes, platform, watchUrl } = body;
    const userApiKey = req.cookies.get("tmdb_api_key")?.value;

    if (!tmdbId || !mediaType || !status) {
      return NextResponse.json({ error: "Thiếu tham số bắt buộc." }, { status: 400 });
    }

    let mediaItem = await db.mediaItem.findUnique({ where: { tmdbId: Number(tmdbId) } });

    if (!mediaItem) {
      const details = (await tmdb.getDetails(
        Number(tmdbId),
        mediaType,
        userApiKey,
      )) as TmdbCreateDetail;

      const genresList = details.genres?.map((g) => g.name) || [];
      const countriesList = details.production_countries?.map((c) => c.iso_3166_1) || [];
      const directorsList =
        details.credits?.crew?.filter((c) => c.job === "Director")?.map((d) => d.name) || [];
      const actorsList = details.credits?.cast?.slice(0, 5)?.map((a) => a.name) || [];
      const trailer = details.videos?.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube",
      );
      const releaseRaw = details.release_date || details.first_air_date;

      mediaItem = await db.mediaItem.create({
        data: {
          tmdbId: Number(tmdbId),
          mediaType,
          title: (mediaType === "tv" ? details.name : details.title) ?? "Không rõ",
          originalTitle:
            (mediaType === "tv" ? details.original_name : details.original_title) ?? "",
          tagline: details.tagline || "",
          overview: details.overview || "",
          posterPath: details.poster_path || "",
          backdropPath: details.backdrop_path || "",
          releaseDate: releaseRaw ? new Date(releaseRaw) : null,
          runtime: mediaType === "tv" ? details.episode_run_time?.[0] || 45 : details.runtime,
          genres: genresList,
          countries: countriesList,
          directors: directorsList,
          actors: actorsList,
          trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
          tmdbRating: details.vote_average || 0.0,
        },
      });
    }

    let totalEpisodes = 1;
    if (mediaType === "tv") {
      const tvDetails = (await tmdb.getDetails(
        Number(tmdbId),
        "tv",
        userApiKey,
      )) as TmdbCreateDetail;
      totalEpisodes = tvDetails.number_of_episodes || 0;
    }

    const watchItem = await db.watchItem.upsert({
      where: { userId_mediaItemId: { userId, mediaItemId: mediaItem.id } },
      update: {
        status,
        personalScore: personalScore ? Number(personalScore) : null,
        notes: notes || null,
        totalEpisodes,
        lastWatchedAt: status === "watching" || status === "completed" ? new Date() : undefined,
        completedAt: status === "completed" ? new Date() : undefined,
      },
      create: {
        userId,
        mediaItemId: mediaItem.id,
        status,
        personalScore: personalScore ? Number(personalScore) : null,
        notes: notes || null,
        totalEpisodes,
        startedAt: status === "watching" ? new Date() : null,
        lastWatchedAt: status === "watching" ? new Date() : null,
        completedAt: status === "completed" ? new Date() : null,
        ...(platform
          ? { sources: { create: [{ platformName: platform, watchUrl: watchUrl || null }] } }
          : {}),
      },
    });

    await logAudit(userId, "watchitem.create", { tmdbId: Number(tmdbId), status }, clientIp(req));
    return NextResponse.json({ success: true, watchItem });
  } catch (err: unknown) {
    console.error("Library POST Route Error:", err);
    const message = err instanceof Error ? err.message : "Không thể lưu phim.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Cập nhật WatchItem (status / priority / score / notes / favorite).
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = updateWatchItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const { watchItemId, status, priority, personalScore, notes, favorite } = parsed.data;

    const existing = await db.watchItem.findUnique({ where: { id: watchItemId } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: "Không tìm thấy phim trong thư viện của bạn." },
        { status: 404 },
      );
    }

    const data: Record<string, unknown> = {};
    if (status !== undefined) {
      data.status = status;
      if (status === "completed") data.completedAt = new Date();
      if (status === "watching") data.lastWatchedAt = new Date();
    }
    if (priority !== undefined) data.priority = priority;
    if (personalScore !== undefined) data.personalScore = personalScore;
    if (notes !== undefined) data.notes = notes;
    if (favorite !== undefined) data.favorite = favorite;

    const updated = await db.watchItem.update({
      where: { id: watchItemId },
      data,
      include: { mediaItem: true },
    });

    return NextResponse.json({ success: true, watchItem: updated });
  } catch (err: unknown) {
    console.error("Library PATCH Route Error:", err);
    return NextResponse.json({ error: "Không thể cập nhật phim." }, { status: 500 });
  }
}

// Xoá WatchItem khỏi thư viện. Nhận id qua query ?id=...
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const watchItemId = new URL(req.url).searchParams.get("id");
    if (!watchItemId) {
      return NextResponse.json({ error: "Thiếu tham số 'id'." }, { status: 400 });
    }

    const existing = await db.watchItem.findUnique({ where: { id: watchItemId } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: "Không tìm thấy phim trong thư viện của bạn." },
        { status: 404 },
      );
    }

    await db.watchItem.delete({ where: { id: watchItemId } });
    await logAudit(userId, "watchitem.delete", { watchItemId }, clientIp(req));
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Library DELETE Route Error:", err);
    return NextResponse.json({ error: "Không thể xoá phim." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
