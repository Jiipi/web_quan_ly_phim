const TMDB_API_URL = "https://api.tmdb.org/3";
const apiKey = process.env.TMDB_API_KEY;

export interface TmdbSearchResult {
  id: number;
  title: string;
  originalTitle: string;
  mediaType: "movie" | "tv";
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  rating: number;
}

interface TmdbRawItem {
  id: number;
  media_type?: string;
  name?: string;
  title?: string;
  original_name?: string;
  original_title?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string | null;
  release_date?: string | null;
  vote_average?: number;
}

// Hỗ trợ bóc tách ID phim từ URL của TMDb hoặc IMDb
function parseMediaUrl(
  query: string,
): { id: number; type: "movie" | "tv"; externalId?: string } | null {
  const trimmed = query.trim();

  // TMDB URL: themoviedb.org/tv/114479 or themoviedb.org/movie/414906
  const tmdbRegex = /themoviedb\.org\/(tv|movie)\/(\d+)/i;
  const tmdbMatch = trimmed.match(tmdbRegex);
  if (tmdbMatch) {
    return {
      type: tmdbMatch[1] as "movie" | "tv",
      id: parseInt(tmdbMatch[2], 10),
    };
  }

  // IMDb URL: imdb.com/title/tt1234567
  const imdbRegex = /imdb\.com\/title\/(tt\d+)/i;
  const imdbMatch = trimmed.match(imdbRegex);
  if (imdbMatch) {
    return {
      type: "movie", // tạm để movie, endpoint find sẽ xử lý
      id: 0,
      externalId: imdbMatch[1],
    };
  }

  return null;
}

export const tmdb = {
  async fetchFromTmdb(
    endpoint: string,
    params: Record<string, string | number> = {},
    userApiKey?: string,
  ) {
    const activeKey = userApiKey || apiKey;
    if (!activeKey) {
      console.warn("TMDb API key is missing. Ensure TMDB_API_KEY is configured.");
      throw new Error("TMDb API Key chưa được cấu hình.");
    }

    const queryParams = new URLSearchParams({
      api_key: activeKey,
      language: "vi-VN",
      ...Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
    });

    const url = `${TMDB_API_URL}${endpoint}?${queryParams.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error(`TMDb API request failed with status: ${res.status}`);
    }

    return res.json();
  },

  async search(
    query: string,
    type: "movie" | "tv" | "multi" = "multi",
    userApiKey?: string,
  ): Promise<TmdbSearchResult[]> {
    if (!query) return [];

    const activeKey = userApiKey || apiKey;

    // 1. Phân tích nếu query là một đường dẫn URL
    const parsedUrl = parseMediaUrl(query);
    if (parsedUrl && activeKey) {
      try {
        // IMDb ID search qua find API
        if (parsedUrl.id === 0 && parsedUrl.externalId) {
          const findRes = await this.fetchFromTmdb(
            `/find/${parsedUrl.externalId}`,
            {
              external_source: "imdb_id",
            },
            activeKey,
          );

          const movie = findRes.movie_results?.[0];
          const tv = findRes.tv_results?.[0];
          const item = movie || tv;

          if (!item) return [];
          const isTv = !!tv;
          return [
            {
              id: item.id,
              title: (isTv ? item.name : item.title) ?? "",
              originalTitle: (isTv ? item.original_name : item.original_title) ?? "",
              mediaType: isTv ? "tv" : "movie",
              overview: item.overview || "",
              posterPath: item.poster_path || null,
              backdropPath: item.backdrop_path || null,
              releaseDate: isTv ? item.first_air_date || null : item.release_date || null,
              rating: item.vote_average || 0.0,
            },
          ];
        }

        // TMDb ID search qua getDetails
        const detail = await this.getDetails(parsedUrl.id, parsedUrl.type, activeKey);
        if (detail) {
          const isTv = parsedUrl.type === "tv";
          return [
            {
              id: parsedUrl.id,
              title: (isTv ? detail.name : detail.title) ?? "",
              originalTitle: (isTv ? detail.original_name : detail.original_title) ?? "",
              mediaType: parsedUrl.type,
              overview: detail.overview || "",
              posterPath: detail.poster_path || null,
              backdropPath: detail.backdrop_path || null,
              releaseDate: isTv ? detail.first_air_date || null : detail.release_date || null,
              rating: detail.vote_average || 0.0,
            },
          ];
        }
      } catch (err) {
        console.error("TMDb URL Parse Search Error:", err);
      }
    }

    // 2. Mock mode nếu không có API Key
    if (!activeKey) {
      const mockDb = [
        {
          id: 114479,
          title: "Vụng Trộm Không Thể Giấu",
          originalTitle: "Hidden Love",
          mediaType: "tv" as const,
          overview: "Tang Trĩ từ nhỏ đã thích thầm bạn thân của anh trai cô là Đoàn Gia Hứa...",
          posterPath: "/images/posters/hidden-love.jpg",
          backdropPath: "/vug-trom-khong-the-giau-backdrop.jpg",
          releaseDate: "2023-06-20",
          rating: 8.7,
        },
        {
          id: 34307,
          title: "Thám Tử Lừng Danh Conan",
          originalTitle: "Detective Conan",
          mediaType: "tv" as const,
          overview:
            "Kudo Shinichi, một thám tử trung học thiên tài, bị ép uống thuốc độc APTX 4869...",
          posterPath: "/images/posters/conan.jpg",
          backdropPath: "/conan-backdrop.jpg",
          releaseDate: "1996-01-08",
          rating: 8.9,
        },
        {
          id: 414906,
          title: "Người Dơi",
          originalTitle: "The Batman",
          mediaType: "movie" as const,
          overview:
            "Năm thứ hai chiến đấu chống tội phạm tại thành phố Gotham, Người Dơi phát hiện...",
          posterPath: "/images/posters/the-batman.jpg",
          backdropPath: "/the-batman-backdrop.jpg",
          releaseDate: "2022-03-02",
          rating: 7.7,
        },
        {
          id: 196454,
          title: "Chiếc Bật Lửa Và Váy Công Chúa",
          originalTitle: "Lighter and Princess",
          mediaType: "tv" as const,
          overview: "Câu chuyện kể về cuộc đời lập trình viên thiên tài Lý Tuân và Chu Vận...",
          posterPath: "/images/posters/chiec-bat-lua.jpg",
          backdropPath: "/chiec-bat-lua-backdrop.jpg",
          releaseDate: "2022-11-03",
          rating: 8.6,
        },
      ];

      return mockDb.filter((item) => {
        const matchesQuery =
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.originalTitle.toLowerCase().includes(query.toLowerCase());
        const matchesType = type === "multi" || item.mediaType === type;
        return matchesQuery && matchesType;
      });
    }

    // 3. Thực hiện gọi API thật với Fallback đa ngôn ngữ
    const endpoint = type === "multi" ? "/search/multi" : `/search/${type}`;

    try {
      // Đầu tiên tìm kiếm với ngôn ngữ tiếng Việt
      let data = await this.fetchFromTmdb(endpoint, { query }, activeKey);

      // Nếu không có kết quả, thử lại với tiếng Anh (giúp tìm phim/anime chưa dịch tốt hơn)
      if (!data.results || data.results.length === 0) {
        data = await this.fetchFromTmdb(endpoint, { query, language: "en-US" }, activeKey);
      }

      if (!data.results) return [];

      return (data.results as TmdbRawItem[])
        .filter(
          (item) => item.media_type === "movie" || item.media_type === "tv" || type !== "multi",
        )
        .map((item) => {
          const isTv = item.media_type === "tv" || type === "tv";
          return {
            id: item.id,
            title: (isTv ? item.name : item.title) ?? "",
            originalTitle: (isTv ? item.original_name : item.original_title) ?? "",
            mediaType: (isTv ? "tv" : "movie") as "movie" | "tv",
            overview: item.overview || "",
            posterPath: item.poster_path || null,
            backdropPath: item.backdrop_path || null,
            releaseDate: isTv ? item.first_air_date || null : item.release_date || null,
            rating: item.vote_average || 0.0,
          };
        });
    } catch (err) {
      console.error("TMDb API Search Method Error:", err);
      return [];
    }
  },

  async getDetails(id: number, type: "movie" | "tv", userApiKey?: string) {
    const activeKey = userApiKey || apiKey;
    if (!activeKey) {
      const mockDetails: Record<number, Record<string, unknown>> = {
        114479: {
          id: 114479,
          name: "Vụng Trộm Không Thể Giấu",
          original_name: "Hidden Love",
          tagline: "Mối tình ngọt ngào thầm kín của Tang Trĩ và Đoàn Gia Hứa",
          overview: "Tang Trĩ từ nhỏ đã thích thầm bạn thân của anh trai cô là Đoàn Gia Hứa...",
          poster_path: "/images/posters/hidden-love.jpg",
          backdrop_path: "/vug-trom-khong-the-giau-backdrop.jpg",
          first_air_date: "2023-06-20",
          episode_run_time: [45],
          number_of_episodes: 25,
          genres: [{ name: "Romance" }, { name: "Drama" }],
          production_countries: [{ iso_3166_1: "CN" }],
          credits: {
            crew: [{ job: "Director", name: "Sa Duy Kỳ" }],
            cast: [{ name: "Triệu Lộ Tư" }, { name: "Trần Triết Viễn" }],
          },
          vote_average: 8.7,
        },
        34307: {
          id: 34307,
          name: "Thám Tử Lừng Danh Conan",
          original_name: "Detective Conan",
          tagline: "Sự thật chỉ có một!",
          overview:
            "Kudo Shinichi, một thám tử trung học thiên tài, bị ép uống thuốc độc APTX 4869...",
          poster_path: "/images/posters/conan.jpg",
          backdrop_path: "/conan-backdrop.jpg",
          first_air_date: "1996-01-08",
          episode_run_time: [25],
          number_of_episodes: 1100,
          genres: [{ name: "Animation" }, { name: "Mystery" }],
          production_countries: [{ iso_3166_1: "JP" }],
          credits: {
            crew: [{ job: "Director", name: "Kenji Kodama" }],
            cast: [{ name: "Minami Takayama" }],
          },
          vote_average: 8.9,
        },
        414906: {
          id: 414906,
          title: "Người Dơi",
          original_title: "The Batman",
          tagline: "Unmask the truth.",
          overview:
            "Năm thứ hai chiến đấu chống tội phạm tại thành phố Gotham, Người Dơi phát hiện...",
          poster_path: "/images/posters/the-batman.jpg",
          backdrop_path: "/the-batman-backdrop.jpg",
          release_date: "2022-03-02",
          runtime: 176,
          genres: [{ name: "Action" }, { name: "Crime" }],
          production_countries: [{ iso_3166_1: "US" }],
          credits: {
            crew: [{ job: "Director", name: "Matt Reeves" }],
            cast: [{ name: "Robert Pattinson" }],
          },
          vote_average: 7.7,
        },
        196454: {
          id: 196454,
          name: "Chiếc Bật Lửa Và Váy Công Chúa",
          original_name: "Lighter and Princess",
          tagline: "Một tình yêu rực rỡ vượt qua mọi thử thách",
          overview: "Câu chuyện kể về cuộc đời lập trình viên thiên tài Lý Tuân và Chu Vận...",
          poster_path: "/images/posters/chiec-bat-lua.jpg",
          backdrop_path: "/chiec-bat-lua-backdrop.jpg",
          first_air_date: "2022-11-03",
          episode_run_time: [45],
          number_of_episodes: 36,
          genres: [{ name: "Romance" }, { name: "Drama" }],
          production_countries: [{ iso_3166_1: "CN" }],
          credits: {
            crew: [{ job: "Director", name: "Lưu Tuấn Kiệt" }],
            cast: [{ name: "Trần Phi Vũ" }, { name: "Trương Tịnh Nghi" }],
          },
          vote_average: 8.6,
        },
      };
      return mockDetails[id] || mockDetails[114479];
    }

    const endpoint = `/${type}/${id}`;
    return this.fetchFromTmdb(endpoint, { append_to_response: "videos,credits" }, activeKey);
  },

  async getTvSeason(id: number, seasonNumber: number, userApiKey?: string) {
    const activeKey = userApiKey || apiKey;
    const endpoint = `/tv/${id}/season/${seasonNumber}`;
    return this.fetchFromTmdb(endpoint, {}, activeKey);
  },
};
