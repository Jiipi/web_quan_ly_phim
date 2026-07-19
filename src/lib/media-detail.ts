import { tmdb } from "@/lib/tmdb";
import { db } from "@/lib/db";

/** Trạng thái theo dõi cá nhân của user cho một media (dùng cho trang chi tiết). */
export interface DetailInitial {
  inLibrary: boolean;
  watchItemId: string | null;
  status: string | null;
  currentEpisode: number;
  currentMinute: number;
  startedAt: string | null;
  completedAt: string | null;
  lastWatchedAt: string | null;
  /** Map episodeNumber -> minute (cho trang chi tiết TV). */
  episodeMinutes?: Record<number, number | null>;
  tags?: Array<{ tagId: string; tag: { id: string; name: string; color: string } }>;
}

/** Lấy trạng thái WatchItem của user cho tmdbId (null user hoặc chưa thêm -> inLibrary false). */
export async function loadWatchInitial(
  userId: string | null,
  tmdbId: number,
): Promise<DetailInitial> {
  const empty: DetailInitial = {
    inLibrary: false,
    watchItemId: null,
    status: null,
    currentEpisode: 0,
    currentMinute: 0,
    startedAt: null,
    completedAt: null,
    lastWatchedAt: null,
  };
  if (!userId) return empty;
  const wi = await db.watchItem.findFirst({
    where: { userId, mediaItem: { tmdbId } },
    include: {
      tags: {
        include: { tag: true },
      },
      progress: {
        select: { episodeNumber: true, minute: true },
      },
    },
  });
  if (!wi) return empty;
  const minutes: Record<number, number | null> = {};
  for (const p of wi.progress) {
    minutes[p.episodeNumber] = p.minute ?? null;
  }
  return {
    inLibrary: true,
    watchItemId: wi.id,
    status: wi.status,
    currentEpisode: wi.currentEpisode,
    currentMinute: wi.currentMinute,
    startedAt: wi.startedAt?.toISOString() ?? null,
    completedAt: wi.completedAt?.toISOString() ?? null,
    lastWatchedAt: wi.lastWatchedAt?.toISOString() ?? null,
    episodeMinutes: minutes,
    tags: wi.tags,
  };
}

export interface MediaDetail {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  originalTitle: string;
  tagline: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  runtime: number | null;
  numberOfEpisodes: number;
  genres: string[];
  countries: string[];
  directors: string[];
  cast: string[];
  trailerKey: string | null;
  rating: number;
}

/** Shape lỏng của dữ liệu chi tiết trả về từ TMDb (thật hoặc mock). */
interface TmdbDetailRaw {
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  tagline?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_episodes?: number;
  vote_average?: number;
  genres?: { name: string }[];
  production_countries?: { iso_3166_1: string }[];
  credits?: { crew?: { job: string; name: string }[]; cast?: { name: string }[] };
  videos?: { results?: { type: string; site: string; key: string }[] };
}

/** Lấy + chuẩn hoá chi tiết phim/series từ TMDb (dùng ở server component). */
export async function getMediaDetail(
  id: number,
  type: "movie" | "tv",
  userApiKey?: string,
): Promise<MediaDetail | null> {
  try {
    const d = (await tmdb.getDetails(id, type, userApiKey)) as TmdbDetailRaw | null;
    if (!d) return null;

    const isTv = type === "tv";
    const trailer = (d.videos?.results ?? []).find(
      (v) => v.type === "Trailer" && v.site === "YouTube",
    );

    return {
      tmdbId: id,
      mediaType: type,
      title: (isTv ? d.name : d.title) ?? d.title ?? d.name ?? "Không rõ",
      originalTitle: (isTv ? d.original_name : d.original_title) ?? "",
      tagline: d.tagline ?? "",
      overview: d.overview ?? "",
      posterPath: d.poster_path ?? null,
      backdropPath: d.backdrop_path ?? null,
      releaseDate: (isTv ? d.first_air_date : d.release_date) ?? null,
      runtime: isTv ? (d.episode_run_time?.[0] ?? null) : (d.runtime ?? null),
      numberOfEpisodes: isTv ? (d.number_of_episodes ?? 0) : 1,
      genres: (d.genres ?? []).map((g) => g.name),
      countries: (d.production_countries ?? []).map((c) => c.iso_3166_1),
      directors: (d.credits?.crew ?? []).filter((c) => c.job === "Director").map((c) => c.name),
      cast: (d.credits?.cast ?? []).slice(0, 8).map((c) => c.name),
      trailerKey: trailer?.key ?? null,
      rating: d.vote_average ?? 0,
    };
  } catch {
    return null;
  }
}
