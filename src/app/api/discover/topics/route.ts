import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tmdb } from "@/lib/tmdb";

// GET /api/discover/topics?topic=Trung Quốc&mediaType=tv
export async function GET(req: NextRequest) {
  try {
    const userApiKey = req.cookies.get("tmdb_api_key")?.value;
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic");
    const mediaType = searchParams.get("mediaType") || "all";

    if (!topic) {
      return NextResponse.json({ error: "Thiếu topic" }, { status: 400 });
    }

    // Country topics -> map to language code
    const countryMap: Record<string, string> = {
      "Trung Quốc": "zh",
      "Hàn Quốc": "ko",
      "Nhật Bản": "ja",
      "Việt Nam": "vi",
      "Mỹ": "en",
      "Thái Lan": "th",
      "Ấn Độ": "hi",
      "Pháp": "fr",
      "Đức": "de",
      "Tây Ban Nha": "es",
      "Ý": "it",
      "Nga": "ru",
    };

    // Genre topics -> map to TMDb genre IDs
    const genreMap: Record<string, string> = {
      "Anime": "16",
      "Hoạt hình": "16",
      "Hành động": "28",
      "Kinh dị": "27",
      "Hài": "35",
      "Lãng mạn": "10749",
      "Khoa học viễn tưởng": "878",
      "Giả tưởng": "14",
      "Chiến tranh": "10752",
      "Phiêu lưu": "12",
      "Trinh thám": "9648",
      "Drama": "18",
      "Documentary": "99",
      "Kids": "10751",
      "Animation": "16",
    };

    interface TopicResult {
      tmdbId: number;
      title: string;
      originalTitle: string;
      mediaType: "movie" | "tv";
      posterPath: string | null;
      releaseDate: string | null;
      rating: number;
    }
    
    const results: TopicResult[] = [];
    const isCountry = !!countryMap[topic];
    const isGenre = !!genreMap[topic];
    const filterLang = isCountry ? countryMap[topic] : undefined;
    const filterGenre = isGenre ? genreMap[topic] : undefined;

    console.log("Topic results:", topic, "isCountry:", isCountry, "isGenre:", isGenre, "filterLang:", filterLang, "filterGenre:", filterGenre);

    // Build common params
    const commonParams: Record<string, string | number> = {
      page: 1,
      sort_by: "popularity.desc",
    };
    if (filterLang) commonParams.with_original_language = filterLang;
    if (filterGenre) commonParams.with_genres = filterGenre;

    // Fetch movies
    if (mediaType === "movie" || mediaType === "all") {
      const movieData = await tmdb.fetchFromTmdb("/discover/movie", commonParams, userApiKey);
      console.log("Movie data:", movieData);
      if (movieData.results) {
        for (const item of movieData.results) {
          results.push({
            tmdbId: item.id,
            title: item.title ?? item.name ?? "",
            originalTitle: item.original_title ?? item.original_name ?? "",
            mediaType: "movie" as const,
            posterPath: item.poster_path || null,
            releaseDate: item.release_date || null,
            rating: item.vote_average || 0.0,
          });
        }
      }
    }

    // Fetch TV shows
    if (mediaType === "tv" || mediaType === "all") {
      const tvData = await tmdb.fetchFromTmdb("/discover/tv", commonParams, userApiKey);
      console.log("TV data:", tvData);
      if (tvData.results) {
        for (const item of tvData.results) {
          results.push({
            tmdbId: item.id,
            title: item.name ?? item.title ?? "",
            originalTitle: item.original_name ?? item.original_title ?? "",
            mediaType: "tv" as const,
            posterPath: item.poster_path || null,
            releaseDate: item.first_air_date || null,
            rating: item.vote_average || 0.0,
          });
        }
      }
    }

    console.log("Final results count:", results.length);

    // Cache the results
    const cacheId = `topic_${topic}_${mediaType}`;
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);

    await db.discoveryCache.upsert({
      where: { id: cacheId },
      update: {
        data: results,
        refreshedAt: new Date(),
        expiresAt,
      },
      create: {
        id: cacheId,
        category: "topic",
        mediaType: mediaType,
        params: topic,
        data: results,
        refreshedAt: new Date(),
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      topic,
      results,
    });
  } catch (err: unknown) {
    console.error("Discover by topic error:", err);
    return NextResponse.json({ error: "Không thể lấy dữ liệu" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
