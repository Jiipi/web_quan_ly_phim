import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { enforceRateLimit } from "@/lib/api-guard";
import { db } from "@/lib/db";
import type { Trending } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const limited = enforceRateLimit(`trending:${userId}`, 30, 60_000);
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

    // Get user API key
    const userApiKey = req.cookies.get("tmdb_api_key")?.value;

    // Try to get cached trending from database
    let cachedTrending: Trending[] = [];
    try {
      cachedTrending = await db.trending.findMany({
        where: type ? { type: type as "movie" | "tv" } : undefined,
        orderBy: { views: "desc" },
        take: limit,
      });
    } catch {
      // Table might not exist yet
    }

    // If no cached data, fetch fresh from API
    if (cachedTrending.length === 0) {
      const { unifiedSearch } = await import("@/lib/unified-search");
      const freshTrending = await unifiedSearch.getTrending({
        type: type as "movie" | "tv" | undefined,
        limit,
        tmdbApiKey: userApiKey,
      });

      // Try to cache the results
      try {
        for (const item of freshTrending) {
          await db.trending.upsert({
            where: { id: item.tmdbId?.toString() || item.title },
            create: {
              id: item.tmdbId?.toString() || item.title,
              tmdbId: item.tmdbId || 0,
              title: item.title,
              type: item.type,
              poster: item.poster,
              overview: item.overview,
              views: item.score || 0,
              updatedAt: new Date(),
            },
            update: {
              views: { increment: 1 },
              updatedAt: new Date(),
            },
          });
        }
      } catch {
        // Ignore caching errors
      }

      return NextResponse.json({
        results: freshTrending,
        source: "api",
      });
    }

    // Return cached results
    const results = cachedTrending.map((row) => ({
      id: `tmdb-${row.tmdbId}`,
      title: row.title,
      type: row.type,
      poster: row.poster,
      overview: row.overview,
      sources: ["tmdb"],
      tmdbId: row.tmdbId,
      score: row.views,
    }));

    return NextResponse.json({
      results,
      source: "cache",
    });
  } catch (err: unknown) {
    console.error("Trending Error:", err);
    const message = err instanceof Error ? err.message : "Không thể lấy trending.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
