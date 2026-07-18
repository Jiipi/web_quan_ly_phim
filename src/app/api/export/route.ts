import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { EXPORT_VERSION } from "@/lib/export-schema";

// Xuất toàn bộ dữ liệu người dùng thành JSON tải về.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

  const [preferences, watchItems, ratings, reviews, lists] = await Promise.all([
    db.userPreference.findUnique({ where: { userId } }),
    db.watchItem.findMany({ where: { userId }, include: { mediaItem: true } }),
    db.rating.findMany({ where: { userId } }),
    db.review.findMany({ where: { userId } }),
    db.customList.findMany({
      where: { userId },
      include: { items: { include: { mediaItem: { select: { tmdbId: true } } } } },
    }),
  ]);

  const ratingByWatch = new Map(ratings.map((r) => [r.watchItemId, r]));
  const reviewByWatch = new Map(reviews.map((r) => [r.watchItemId, r]));

  const library = watchItems.map((wi) => {
    const r = ratingByWatch.get(wi.id);
    const rv = reviewByWatch.get(wi.id);
    return {
      tmdbId: wi.mediaItem.tmdbId,
      mediaType: wi.mediaItem.mediaType,
      title: wi.mediaItem.title,
      originalTitle: wi.mediaItem.originalTitle,
      posterPath: wi.mediaItem.posterPath,
      overview: wi.mediaItem.overview,
      genres: wi.mediaItem.genres,
      countries: wi.mediaItem.countries,
      runtime: wi.mediaItem.runtime,
      status: wi.status,
      personalScore: wi.personalScore,
      notes: wi.notes,
      favorite: wi.favorite,
      priority: wi.priority,
      currentEpisode: wi.currentEpisode,
      totalEpisodes: wi.totalEpisodes,
      rating: r
        ? {
            overallScore: r.overallScore,
            plotScore: r.plotScore,
            actingScore: r.actingScore,
            emotionScore: r.emotionScore,
            pacingScore: r.pacingScore,
            musicScore: r.musicScore,
            endingScore: r.endingScore,
            rewatchValue: r.rewatchValue,
          }
        : null,
      review: rv ? { content: rv.content, spoilers: rv.spoilers } : null,
    };
  });

  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    preferences: preferences
      ? {
          favGenres: preferences.favGenres,
          favCountries: preferences.favCountries,
          preferTvShows: preferences.preferTvShows,
          theme: preferences.theme,
          language: preferences.language,
          ratingScale: preferences.ratingScale,
        }
      : null,
    library,
    lists: lists.map((l) => ({
      name: l.name,
      description: l.description,
      isPublic: l.isPublic,
      itemTmdbIds: l.items.map((it) => it.mediaItem.tmdbId),
    })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="phimflow-export-${Date.now()}.json"`,
    },
  });
}

export const dynamic = "force-dynamic";
