import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tmdb } from "@/lib/tmdb";
import { Prisma } from "@prisma/client";

const CACHE_TTL_HOURS = 24;

interface CachedItem {
  tmdbId: number;
  title: string;
  originalTitle: string;
  mediaType: "movie" | "tv";
  posterPath: string | null;
  rating: number;
  releaseDate: string | null;
}

async function getCachedOrFetch(
  category: string,
  mediaType: string,
  params?: string,
  fetchFn?: () => Promise<CachedItem[]>,
): Promise<{ data: CachedItem[]; refreshed: boolean }> {
  const cacheId = [category, mediaType, params].filter(Boolean).join("_");

  const cached = await db.discoveryCache.findUnique({ where: { id: cacheId } });

  if (cached && cached.expiresAt > new Date()) {
    return { data: cached.data as unknown as CachedItem[], refreshed: false };
  }

  if (fetchFn) {
    const freshData = await fetchFn();
    const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000);

    await db.discoveryCache.upsert({
      where: { id: cacheId },
      update: {
        data: freshData as unknown as Prisma.InputJsonValue,
        refreshedAt: new Date(),
        expiresAt,
      },
      create: {
        id: cacheId,
        category,
        mediaType,
        params: params || null,
        data: freshData as unknown as Prisma.InputJsonValue,
        refreshedAt: new Date(),
        expiresAt,
      },
    });

    return { data: freshData, refreshed: true };
  }

  if (cached) {
    return { data: cached.data as unknown as CachedItem[], refreshed: false };
  }

  return { data: [], refreshed: false };
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

// GET /api/discover - Get all discovery sections
export async function GET(req: NextRequest) {
  try {
    const userApiKey = req.cookies.get("tmdb_api_key")?.value;

    const results: Record<string, unknown> = {};

    // Fetch all in parallel for better performance
    const fetchResults = await Promise.allSettled([
      getCachedOrFetch("trending", "all", undefined, async () =>
        transformTmdbResults(await tmdb.getTrending("all", "day", userApiKey)),
      ),
      getCachedOrFetch("trending", "movie", undefined, async () =>
        transformTmdbResults(await tmdb.getTrending("movie", "day", userApiKey)),
      ),
      getCachedOrFetch("trending", "tv", undefined, async () =>
        transformTmdbResults(await tmdb.getTrending("tv", "day", userApiKey)),
      ),
      getCachedOrFetch("toprated", "movie", undefined, async () =>
        transformTmdbResults(await tmdb.getTopRated("movie", userApiKey)),
      ),
      getCachedOrFetch("toprated", "tv", undefined, async () =>
        transformTmdbResults(await tmdb.getTopRated("tv", userApiKey)),
      ),
      getCachedOrFetch("new", "movie", undefined, async () =>
        transformTmdbResults(await tmdb.getNowPlaying(userApiKey)),
      ),
      getCachedOrFetch("airing", "tv", undefined, async () =>
        transformTmdbResults(await tmdb.getAiringToday(userApiKey)),
      ),
    ]);

    // Map results to response object
    const categories = [
      "trending",
      "trendingMovies",
      "trendingTv",
      "topRatedMovies",
      "topRatedTv",
      "newMovies",
      "airingToday",
    ];

    fetchResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const data = result.value.data;
        if (index === 0) {
          results.trending = data;
          results.trendingRefreshed = result.value.refreshed;
        } else {
          results[categories[index]] = data;
        }
      } else {
        console.error(`Failed to fetch ${categories[index]}:`, result.reason);
        results[categories[index]] = [];
      }
    });

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (err) {
    console.error("Discover API Error:", err);
    return NextResponse.json({ error: "Không thể lấy dữ liệu khám phá." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
