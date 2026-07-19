import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { tmdb } from "@/lib/tmdb";
import { logAudit } from "@/lib/audit";

interface TmdbImportDetails {
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  tagline?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  runtime?: number | null;
  episode_run_time?: number[];
  vote_average?: number;
  genres?: { name: string }[];
  production_countries?: { iso_3166_1: string }[];
  credits?: { crew?: { job: string; name: string }[]; cast?: { name: string }[] };
  videos?: { results?: { type: string; site: string; key: string }[] };
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const userAdmin = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (userAdmin?.role !== "admin") {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 403 });
    }

    const movies = await db.mediaItem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { watchItems: true },
        },
      },
    });

    return NextResponse.json({ success: true, movies });
  } catch (err: unknown) {
    console.error("Admin Movies GET Error:", err);
    return NextResponse.json({ error: "Không thể lấy danh sách kho phim." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const userAdmin = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (userAdmin?.role !== "admin") {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.tmdbId || !body.mediaType) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ. Cần tmdbId và mediaType." },
        { status: 400 },
      );
    }

    const tmdbId = Number(body.tmdbId);
    const mediaType = body.mediaType as "movie" | "tv";
    if (!["movie", "tv"].includes(mediaType) || isNaN(tmdbId)) {
      return NextResponse.json({ error: "Tham số không hợp lệ." }, { status: 400 });
    }

    // Check if already cached
    const existing = await db.mediaItem.findUnique({ where: { tmdbId } });
    if (existing) {
      return NextResponse.json(
        { error: "Phim này đã tồn tại trong kho lưu trữ." },
        { status: 409 },
      );
    }

    // Fetch details
    const userApiKey = req.cookies.get("tmdb_api_key")?.value;
    const details = (await tmdb.getDetails(
      tmdbId,
      mediaType,
      userApiKey,
    )) as TmdbImportDetails | null;
    if (!details) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin phim trên TMDb." },
        { status: 404 },
      );
    }

    const genresList = details.genres?.map((g) => g.name) || [];
    const countriesList = details.production_countries?.map((c) => c.iso_3166_1) || [];
    const directorsList =
      details.credits?.crew?.filter((c) => c.job === "Director")?.map((d) => d.name) || [];
    const actorsList = details.credits?.cast?.slice(0, 8)?.map((a) => a.name) || [];
    const trailer = details.videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube",
    );
    const releaseRaw = details.release_date || details.first_air_date;

    const mediaItem = await db.mediaItem.create({
      data: {
        tmdbId,
        mediaType,
        title: (mediaType === "tv" ? details.name : details.title) ?? "Không rõ",
        originalTitle: (mediaType === "tv" ? details.original_name : details.original_title) ?? "",
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

    await logAudit(userId, "document.create", { tmdbId, title: mediaItem.title, type: mediaType });

    return NextResponse.json({ success: true, mediaItem }, { status: 201 });
  } catch (err: unknown) {
    console.error("Admin Movies POST Error:", err);
    return NextResponse.json({ error: "Không thể nhập phim từ TMDb." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
