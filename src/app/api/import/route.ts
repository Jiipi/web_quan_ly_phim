import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { importSchema } from "@/lib/export-schema";
import { enforceRateLimit } from "@/lib/api-guard";
import { logAudit, clientIp } from "@/lib/audit";

// Nhập dữ liệu từ file export (upsert, không xoá dữ liệu hiện có).
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const limited = enforceRateLimit(`import:${userId}`, 5, 60_000);
    if (limited) return limited;

    const parsed = importSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "File nhập không hợp lệ." }, { status: 400 });
    }
    const data = parsed.data;
    const counts = { library: 0, ratings: 0, reviews: 0, lists: 0 };

    // Preferences.
    if (data.preferences) {
      const p = data.preferences;
      await db.userPreference.upsert({
        where: { userId },
        update: {
          favGenres: p.favGenres,
          favCountries: p.favCountries,
          preferTvShows: p.preferTvShows,
          ...(p.theme ? { theme: p.theme } : {}),
          ...(p.language ? { language: p.language } : {}),
          ...(p.ratingScale ? { ratingScale: p.ratingScale } : {}),
        },
        create: {
          userId,
          favGenres: p.favGenres,
          favCountries: p.favCountries,
          preferTvShows: p.preferTvShows,
          ...(p.theme ? { theme: p.theme } : {}),
          ...(p.language ? { language: p.language } : {}),
          ...(p.ratingScale ? { ratingScale: p.ratingScale } : {}),
        },
      });
    }

    // Library (+ rating/review).
    for (const entry of data.library) {
      const mediaItem = await db.mediaItem.upsert({
        where: { tmdbId: entry.tmdbId },
        update: {},
        create: {
          tmdbId: entry.tmdbId,
          mediaType: entry.mediaType,
          title: entry.title,
          originalTitle: entry.originalTitle ?? "",
          posterPath: entry.posterPath ?? null,
          overview: entry.overview ?? null,
          genres: entry.genres ?? [],
          countries: entry.countries ?? [],
          runtime: entry.runtime ?? null,
        },
      });

      const watchItem = await db.watchItem.upsert({
        where: { userId_mediaItemId: { userId, mediaItemId: mediaItem.id } },
        update: {
          status: entry.status,
          personalScore: entry.personalScore ?? null,
          notes: entry.notes ?? null,
          favorite: entry.favorite,
          priority: entry.priority,
          currentEpisode: entry.currentEpisode,
          totalEpisodes: entry.totalEpisodes,
        },
        create: {
          userId,
          mediaItemId: mediaItem.id,
          status: entry.status,
          personalScore: entry.personalScore ?? null,
          notes: entry.notes ?? null,
          favorite: entry.favorite,
          priority: entry.priority,
          currentEpisode: entry.currentEpisode,
          totalEpisodes: entry.totalEpisodes,
        },
      });
      counts.library++;

      if (entry.rating) {
        await db.rating.upsert({
          where: { userId_watchItemId: { userId, watchItemId: watchItem.id } },
          update: { ...entry.rating },
          create: { userId, watchItemId: watchItem.id, ...entry.rating },
        });
        counts.ratings++;
      }
      if (entry.review) {
        await db.review.upsert({
          where: { userId_watchItemId: { userId, watchItemId: watchItem.id } },
          update: { content: entry.review.content, spoilers: entry.review.spoilers ?? false },
          create: {
            userId,
            watchItemId: watchItem.id,
            content: entry.review.content,
            spoilers: entry.review.spoilers ?? false,
          },
        });
        counts.reviews++;
      }
    }

    // Lists.
    for (const list of data.lists) {
      const existing = await db.customList.findFirst({ where: { userId, name: list.name } });
      const created =
        existing ??
        (await db.customList.create({
          data: {
            userId,
            name: list.name,
            description: list.description ?? null,
            isPublic: list.isPublic,
          },
        }));
      counts.lists++;

      let position = await db.listItem.count({ where: { customListId: created.id } });
      for (const tmdbId of list.itemTmdbIds) {
        const media = await db.mediaItem.findUnique({ where: { tmdbId } });
        if (!media) continue;
        await db.listItem.upsert({
          where: { customListId_mediaItemId: { customListId: created.id, mediaItemId: media.id } },
          update: {},
          create: { customListId: created.id, mediaItemId: media.id, position: position++ },
        });
      }
    }

    await logAudit(userId, "data.import", counts, clientIp(req));
    return NextResponse.json({ success: true, counts });
  } catch (err: unknown) {
    console.error("Import Route Error:", err);
    return NextResponse.json({ error: "Không thể nhập dữ liệu." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
