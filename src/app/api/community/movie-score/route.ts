import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/movie-score?tmdbId=123
 *
 * Returns community average score, total rating votes, and total post count for a movie.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tmdbIdStr = url.searchParams.get("tmdbId");
    if (!tmdbIdStr) {
      return NextResponse.json({ error: "tmdbId là bắt buộc." }, { status: 400 });
    }
    const tmdbId = Number(tmdbIdStr);
    if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
      return NextResponse.json({ error: "tmdbId không hợp lệ." }, { status: 400 });
    }

    const [ratedPosts, totalPostsCount] = await Promise.all([
      db.post
        .findMany({
          where: {
            movieRefTmdbId: tmdbId,
            communityRating: { not: null },
          },
          select: { communityRating: true },
        })
        .catch(() => []),
      db.post
        .count({
          where: { movieRefTmdbId: tmdbId },
        })
        .catch(() => 0),
    ]);

    const ratings = ratedPosts
      .map((p) => p.communityRating)
      .filter((r): r is number => typeof r === "number" && r > 0);

    const avgScore =
      ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
        : null;

    return NextResponse.json({
      avgScore,
      totalVotes: ratings.length,
      totalPosts: totalPostsCount,
    });
  } catch (err) {
    console.error("[community/movie-score] error:", err);
    return NextResponse.json({ avgScore: null, totalVotes: 0, totalPosts: 0 });
  }
}

export const dynamic = "force-dynamic";
