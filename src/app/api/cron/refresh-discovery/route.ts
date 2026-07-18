import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tmdb } from "@/lib/tmdb";

const CRON_SECRET = process.env.CRON_SECRET || process.env.CRON_API_KEY;

interface CachedItem {
  tmdbId: number;
  title: string;
  originalTitle: string;
  mediaType: "movie" | "tv";
  posterPath: string | null;
  rating: number;
  releaseDate: string | null;
}

function transformTmdbResults(results: Awaited<ReturnType<typeof tmdb.getTrending>>): CachedItem[] {
  return results.map((r) => ({
    tmdbId: r.id,
    title: r.title,
    originalTitle: r.originalTitle,
    mediaType: r.mediaType,
    posterPath: r.posterPath,
    rating: r.rating,
    releaseDate: r.releaseDate,
  }));
}

async function refreshCache(
  category: string,
  mediaType: string,
  params: string | undefined,
  fetchFn: () => Promise<CachedItem[]>,
) {
  const cacheId = [category, mediaType, params].filter(Boolean).join("_");
  const freshData = await fetchFn();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.discoveryCache.upsert({
    where: { id: cacheId },
    update: {
      data: freshData,
      refreshedAt: new Date(),
      expiresAt,
    },
    create: {
      id: cacheId,
      category,
      mediaType,
      params: params || null,
      data: freshData,
      refreshedAt: new Date(),
      expiresAt,
    },
  });

  return { id: cacheId, count: freshData.length };
}

// POST /api/cron/refresh-discovery - Refresh all discovery caches
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = req.cookies.get("cron_secret")?.value;

    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && secret !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await Promise.allSettled([
      refreshCache("trending", "all", undefined, async () =>
        transformTmdbResults(await tmdb.getTrending("all", "day"))),
      refreshCache("trending", "movie", undefined, async () =>
        transformTmdbResults(await tmdb.getTrending("movie", "day"))),
      refreshCache("trending", "tv", undefined, async () =>
        transformTmdbResults(await tmdb.getTrending("tv", "day"))),
      refreshCache("toprated", "movie", undefined, async () =>
        transformTmdbResults(await tmdb.getTopRated("movie"))),
      refreshCache("toprated", "tv", undefined, async () =>
        transformTmdbResults(await tmdb.getTopRated("tv"))),
      refreshCache("new", "movie", undefined, async () =>
        transformTmdbResults(await tmdb.getNowPlaying())),
      refreshCache("airing", "tv", undefined, async () =>
        transformTmdbResults(await tmdb.getAiringToday())),
    ]);

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message || "Unknown error");

    return NextResponse.json({
      success: true,
      refreshed: successful,
      failed: failed.length,
      errors: failed.length > 0 ? failed : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cron Refresh Error:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
