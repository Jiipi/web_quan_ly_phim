import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { feedQuerySchema } from "@/lib/community-schema";
import { hotScore } from "@/lib/community";

/**
 * GET /api/community/feed
 *
 * Feed with tab-based filtering:
 *   - explore: All recent posts (global)
 *   - following: Posts from people I follow + myself
 *   - popular: Posts sorted by likeCount (last 7 days)
 *
 * Additional filters:
 *   - authorId: filter by specific user
 *   - movieTmdbId: filter by specific movie
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const url = new URL(req.url);
    const parsed = feedQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Query không hợp lệ.", fieldErrors: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { limit, authorId, movieTmdbId, tab } = parsed.data;

    // Build where clause based on tab + filters
    const cutoff = new Date(Date.now() - 14 * 24 * 3600 * 1000);
    const popularCutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (authorId) {
      // Profile page: show only this user's posts
      where.authorId = authorId;
      where.createdAt = { gte: cutoff };
    } else if (movieTmdbId) {
      // Movie-specific discussion: all posts about this movie
      where.movieRefTmdbId = movieTmdbId;
    } else if (tab === "following") {
      // Following tab: posts from people I follow + myself
      const follows = await db.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const allowedAuthorIds = [userId, ...follows.map((f) => f.followingId)];
      where.authorId = { in: allowedAuthorIds };
      where.createdAt = { gte: cutoff };
    } else if (tab === "popular") {
      // Popular tab: last 7 days, sorted by likeCount
      where.createdAt = { gte: popularCutoff };
    } else {
      // Explore tab: all recent posts (global)
      where.createdAt = { gte: cutoff };
    }

    const candidateLimit = Math.min(limit * 3, 150);

    const posts = await db.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            handle: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: tab === "popular" ? { likeCount: "desc" } : { createdAt: "desc" },
      take: candidateLimit,
    });

    // Sort by hot score for explore/following tabs
    const now = Date.now();
    let sorted;
    if (tab === "popular" || movieTmdbId) {
      sorted = posts.slice(0, limit);
    } else {
      sorted = posts
        .map((p) => ({ p, score: hotScore(p, now) }))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return b.p.createdAt.getTime() - a.p.createdAt.getTime();
        })
        .slice(0, limit)
        .map(({ p }) => p);
    }

    const items = sorted.map((p) => ({
      id: p.id,
      content: p.content,
      imagePath: p.imagePath,
      movieRefType: p.movieRefType,
      movieRefTmdbId: p.movieRefTmdbId,
      movieRefTitle: p.movieRefTitle,
      movieRefPoster: p.movieRefPoster,
      isSpoiler: p.isSpoiler,
      communityRating: p.communityRating,
      likeCount: p.likeCount,
      commentCount: p.commentCount,
      createdAt: p.createdAt.toISOString(),
      likedByMe: p.likes.length > 0,
      author: {
        id: p.author.id,
        name: p.author.name,
        image: p.author.image,
        handle: p.author.handle,
      },
    }));

    const nextCursor =
      sorted.length === limit && posts.length === candidateLimit
        ? sorted[sorted.length - 1].id
        : null;

    return NextResponse.json({ posts: items, nextCursor });
  } catch (err: unknown) {
    console.error("[community/feed] error:", err);
    return NextResponse.json({ error: "Không thể tải feed." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
