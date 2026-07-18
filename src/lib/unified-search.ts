import { tmdb, TmdbSearchResult } from "./tmdb";
import { omdb, OmdbSearchResult } from "./omdb";
import { tvmaze, TvMazeSearchResult } from "./tvmaze";

export type MediaSource = "tmdb" | "omdb" | "tvmaze";
export type MediaType = "movie" | "tv" | "anime";

export interface UnifiedSearchResult {
  id: string;
  title: string;
  originalTitle?: string;
  year?: string;
  type: "movie" | "tv";
  mediaType?: MediaType;
  poster?: string;
  overview?: string;
  sources: MediaSource[];
  tmdbId?: number;
  imdbId?: string;
  tvmazeId?: number;
  score: number;
  genres?: string[];
  rating?: number;
}

export interface SearchOptions {
  query: string;
  type?: "movie" | "tv" | "multi";
  sources?: MediaSource[];
  limit?: number;
  year?: string;
  tmdbApiKey?: string;
  omdbApiKey?: string;
}

/**
 * Normalize string for comparison (remove accents, lowercase, trim)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

/**
 * Calculate fuzzy match score between two strings
 * Returns a score from 0 to 1, where 1 is an exact match
 */
function fuzzyMatchScore(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  // Levenshtein distance based similarity
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 0;

  const distance = levenshteinDistance(s1, s2);
  const similarity = 1 - distance / maxLen;

  // Bonus for matching first characters
  if (s1.startsWith(s2.slice(0, 3)) || s2.startsWith(s1.slice(0, 3))) {
    return Math.min(1, similarity + 0.2);
  }

  return similarity;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
      }
    }
  }

  return dp[m][n];
}

/**
 * Generate a unique key for deduplication
 */
function generateKey(
  title: string,
  year?: string,
  type?: "movie" | "tv"
): string {
  const normalized = normalizeString(title);
  return `${normalized}|${year || ""}|${type || ""}`;
}

/**
 * Unified Search Service - Combines multiple sources with fuzzy matching
 */
export const unifiedSearch = {
  /**
   * Search across all configured sources
   */
  async search(options: SearchOptions): Promise<UnifiedSearchResult[]> {
    const {
      query,
      type = "multi",
      sources = ["tmdb", "tvmaze"],
      limit = 15,
      tmdbApiKey,
      omdbApiKey,
    } = options;

    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = normalizeString(query);

    // Fetch from all sources in parallel
    const promises: Promise<UnifiedSearchResult[]>[] = [];

    if (sources.includes("tmdb")) {
      promises.push(this.searchTmdb(query, type, tmdbApiKey));
    }

    if (sources.includes("tvmaze")) {
      promises.push(this.searchTvmaze(query, type));
    }

    if (sources.includes("omdb") && omdbApiKey) {
      promises.push(this.searchOmdb(query, type, omdbApiKey));
    }

    const resultsArrays = await Promise.allSettled(promises);
    let allResults: UnifiedSearchResult[] = [];

    for (const result of resultsArrays) {
      if (result.status === "fulfilled") {
        allResults = allResults.concat(result.value);
      }
    }

    // Deduplicate and re-rank
    const deduplicated = this.deduplicateAndRank(allResults, normalizedQuery);

    return deduplicated.slice(0, limit);
  },

  /**
   * Search TMDB
   */
  async searchTmdb(
    query: string,
    type: "movie" | "tv" | "multi",
    userApiKey?: string
  ): Promise<UnifiedSearchResult[]> {
    try {
      const searchType = type === "multi" ? "multi" : type;
      const results = await tmdb.search(query, searchType, userApiKey);

      return results.map((r: TmdbSearchResult) => ({
        id: `tmdb-${r.id}`,
        title: r.title || "",
        originalTitle: r.originalTitle,
        year: this.extractYear(r.releaseDate ?? undefined),
        type: r.mediaType,
        poster: r.posterPath
          ? r.posterPath
          : undefined,
        overview: r.overview,
        sources: ["tmdb"],
        tmdbId: r.id,
        score: r.rating || 0,
      }));
    } catch (error) {
      console.error("TMDB search failed:", error);
      return [];
    }
  },

  /**
   * Search TVMaze
   */
  async searchTvmaze(
    query: string,
    type: "movie" | "tv" | "multi"
  ): Promise<UnifiedSearchResult[]> {
    if (type === "movie") {
      return []; // TVMaze only has TV shows
    }

    try {
      const results = await tvmaze.searchShows(query);

      return results.map((r: TvMazeSearchResult) => ({
        id: `tvmaze-${r.show.id}`,
        title: r.show.name,
        year: r.show.premiered ? r.show.premiered.split("-")[0] : undefined,
        type: "tv" as const,
        mediaType: this.detectMediaType(r.show.genres),
        poster: r.show.image?.medium,
        overview: r.show.summary?.replace(/<[^>]*>/g, ""),
        sources: ["tvmaze"],
        tvmazeId: r.show.id,
        imdbId: r.show.externals?.imdb || undefined,
        score: r.score * 100,
        genres: r.show.genres,
        rating: undefined, // TVMaze doesn't provide this in search
      }));
    } catch (error) {
      console.error("TVMaze search failed:", error);
      return [];
    }
  },

  /**
   * Search OMDb
   */
  async searchOmdb(
    query: string,
    type: "movie" | "tv" | "multi",
    apiKey: string
  ): Promise<UnifiedSearchResult[]> {
    try {
      const searchType = type === "tv" ? "series" : "movie";
      const results = await omdb.searchMovies(query, apiKey, searchType);

      return results.map((r: OmdbSearchResult) => ({
        id: `omdb-${r.imdbID}`,
        title: r.Title,
        year: r.Year,
        type: r.Type as "movie" | "tv",
        poster: r.Poster !== "N/A" ? r.Poster : undefined,
        sources: ["omdb"],
        imdbId: r.imdbID,
        score: 0, // OMDb doesn't provide relevance score
      }));
    } catch (error) {
      console.error("OMDb search failed:", error);
      return [];
    }
  },

  /**
   * Deduplicate results and re-rank based on fuzzy matching
   */
  deduplicateAndRank(
    results: UnifiedSearchResult[],
    query: string
  ): UnifiedSearchResult[] {
    const seen = new Map<string, UnifiedSearchResult>();
    const normalizedQuery = normalizeString(query);

    for (const result of results) {
      const key = generateKey(result.title, result.year, result.type);
      const fuzzyScore = fuzzyMatchScore(result.title, normalizedQuery);

      if (seen.has(key)) {
        // Merge sources
        const existing = seen.get(key)!;
        existing.sources = [...new Set([...existing.sources, ...result.sources])];
        existing.tmdbId = result.tmdbId || existing.tmdbId;
        existing.tvmazeId = result.tvmazeId || existing.tvmazeId;
        existing.imdbId = result.imdbId || existing.imdbId;
        existing.poster = existing.poster || result.poster;
        existing.overview = existing.overview || result.overview;
        existing.score = Math.max(
          existing.score,
          fuzzyScore * 100 + (result.score || 0)
        );
      } else {
        // Add new entry with fuzzy score boost
        seen.set(key, {
          ...result,
          score: fuzzyScore * 100 + (result.score || 0),
        });
      }
    }

    // Sort by score descending
    return Array.from(seen.values()).sort((a, b) => b.score - a.score);
  },

  /**
   * Extract year from date string
   */
  extractYear(dateStr?: string): string | undefined {
    if (!dateStr) return undefined;
    const year = dateStr.split("-")[0];
    return /^\d{4}$/.test(year) ? year : undefined;
  },

  /**
   * Detect if content is anime based on genres
   */
  detectMediaType(genres: string[]): MediaType | undefined {
    const genreLower = genres.map((g) => g.toLowerCase());
    if (
      genreLower.some((g) =>
        ["anime", "animation"].includes(g)
      )
    ) {
      return "anime";
    }
    return undefined;
  },

  /**
   * Get trending/popular content from all sources
   */
  async getTrending(options: {
    type?: "movie" | "tv";
    limit?: number;
    tmdbApiKey?: string;
  }): Promise<UnifiedSearchResult[]> {
    const { type = "multi", limit = 10, tmdbApiKey } = options;
    const results: UnifiedSearchResult[] = [];

    try {
      // Get TMDB trending
      const tmdbType = type === "multi" ? "all" : type;
      const tmdbTrending = await tmdb.search("trending", tmdbType as "movie" | "tv", tmdbApiKey);
      results.push(
        ...tmdbTrending.map((r: TmdbSearchResult) => ({
          id: `tmdb-${r.id}`,
          title: r.title || "",
          originalTitle: r.originalTitle,
          year: this.extractYear(r.releaseDate ?? undefined),
          type: r.mediaType,
          poster: r.posterPath || undefined,
          overview: r.overview,
          sources: ["tmdb"] as MediaSource[],
          tmdbId: r.id,
          score: r.rating || 0,
        }))
      );
    } catch (error) {
      console.error("Failed to get TMDB trending:", error);
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },
};
