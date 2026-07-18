const BASE_URL = "https://www.omdbapi.com";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OMDb API error: ${res.status}`);
  return res.json();
}

export interface OmdbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: "movie" | "series" | "episode";
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  totalSeasons?: string;
  Season?: string;
  Episode?: string;
}

export interface OmdbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: "movie" | "series";
  Poster: string;
}

export interface OmdbSearchResponse {
  Search: OmdbSearchResult[];
  totalResults: string;
  Response: "True" | "False";
  Error?: string;
}

export const omdb = {
  async searchMovies(
    query: string,
    apiKey: string,
    type: "movie" | "series" | "episode" = "movie",
    page = 1
  ): Promise<OmdbSearchResult[]> {
    if (!apiKey) {
      console.warn("OMDb API key not configured");
      return [];
    }

    try {
      const params = new URLSearchParams({
        apikey: apiKey,
        s: query,
        type,
        page: String(page),
      });

      const data = await fetcher<OmdbSearchResponse>(`${BASE_URL}/?${params}`);

      if (data.Response === "False") {
        console.warn("OMDb search error:", data.Error);
        return [];
      }

      return data.Search || [];
    } catch (error) {
      console.error("OMDb search error:", error);
      return [];
    }
  },

  async getByImdbId(imdbId: string, apiKey: string): Promise<OmdbMovie | null> {
    if (!apiKey) {
      console.warn("OMDb API key not configured");
      return null;
    }

    try {
      const params = new URLSearchParams({
        apikey: apiKey,
        i: imdbId,
        plot: "full",
      });

      const data = await fetcher<OmdbMovie & { Response: string; Error?: string }>(
        `${BASE_URL}/?${params}`
      );

      if (data.Response === "False") {
        console.warn("OMDb getById error:", data.Error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("OMDb getById error:", error);
      return null;
    }
  },

  async getByTitle(title: string, year: string | null, apiKey: string): Promise<OmdbMovie | null> {
    if (!apiKey) {
      console.warn("OMDb API key not configured");
      return null;
    }

    try {
      const params = new URLSearchParams({
        apikey: apiKey,
        t: title,
        plot: "full",
      });

      if (year) {
        params.append("y", year);
      }

      const data = await fetcher<OmdbMovie & { Response: string; Error?: string }>(
        `${BASE_URL}/?${params}`
      );

      if (data.Response === "False") {
        return null;
      }

      return data;
    } catch (error) {
      console.error("OMDb getByTitle error:", error);
      return null;
    }
  },
};
