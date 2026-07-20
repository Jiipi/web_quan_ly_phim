import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/trending
 *
 * Returns top 10 movies discussed in the community (last 7 days).
 * Public endpoint (no auth gate required).
 */
export async function GET() {
  try {
    const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    // Get all posts with movie refs in last 7 days
    const posts = await db.post.findMany({
      where: {
        movieRefTmdbId: { not: null },
        createdAt: { gte: cutoff },
      },
      select: {
        movieRefTmdbId: true,
        movieRefType: true,
        movieRefTitle: true,
        movieRefPoster: true,
        communityRating: true,
      },
    });

    // Aggregate by tmdbId
    const movieMap = new Map<
      number,
      {
        tmdbId: number;
        type: string;
        title: string;
        poster: string | null;
        postCount: number;
        ratings: number[];
      }
    >();

    for (const p of posts) {
      if (!p.movieRefTmdbId) continue;
      const existing = movieMap.get(p.movieRefTmdbId);
      if (existing) {
        existing.postCount++;
        if (p.communityRating) existing.ratings.push(p.communityRating);
      } else {
        movieMap.set(p.movieRefTmdbId, {
          tmdbId: p.movieRefTmdbId,
          type: p.movieRefType || "movie",
          title: p.movieRefTitle || "Không rõ",
          poster: p.movieRefPoster,
          postCount: 1,
          ratings: p.communityRating ? [p.communityRating] : [],
        });
      }
    }

    // Sort by postCount descending, take top 10
    const trending = Array.from(movieMap.values())
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 10)
      .map((m) => ({
        tmdbId: m.tmdbId,
        type: m.type,
        title: m.title,
        poster: m.poster,
        postCount: m.postCount,
        avgRating:
          m.ratings.length > 0
            ? Math.round((m.ratings.reduce((s, r) => s + r, 0) / m.ratings.length) * 10) / 10
            : null,
      }));

    return NextResponse.json({ trending });
  } catch (err) {
    console.error("[community/trending] error:", err);
    return NextResponse.json({ trending: [] });
  }
}

export const dynamic = "force-dynamic";
