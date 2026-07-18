const BASE_URL = "https://api.tvmaze.com";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TVMaze API error: ${res.status}`);
  return res.json();
}

export interface TvMazeShow {
  id: number;
  name: string;
  url: string;
  language: string | null;
  genres: string[];
  status: string;
  premiered: string | null;
  ended: string | null;
  officialSite: string | null;
  runtime: number | null;
  averageRuntime: number | null;
  weight: number;
  network: TvMazeNetwork | null;
  webChannel: TvMazeNetwork | null;
  dvdCountry: string | null;
  externals: {
    tvrage: number | null;
    thetvdb: number | null;
    imdb: string | null;
  };
  image: {
    medium: string;
    original: string;
  } | null;
  summary: string | null;
  updated: number;
  _embedded?: {
    episodes?: TvMazeEpisode[];
  };
}

export interface TvMazeEpisode {
  id: number;
  url: string;
  name: string;
  season: number;
  number: number;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number | null;
  rating: { average: number | null };
  image: { medium: string; original: string } | null;
  summary: string | null;
}

export interface TvMazeNetwork {
  id: number;
  name: string;
  country: {
    name: string;
    code: string;
    timezone: string;
  } | null;
  officialSite: string | null;
}

export interface TvMazeSearchResult {
  score: number;
  show: TvMazeShow;
}

export const tvmaze = {
  async searchShows(query: string, limit = 10): Promise<TvMazeSearchResult[]> {
    try {
      const data = await fetcher<TvMazeSearchResult[]>(
        `${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`
      );
      return data.slice(0, limit);
    } catch (error) {
      console.error("TVMaze search error:", error);
      return [];
    }
  },

  async searchShowsWithEpisodes(query: string, limit = 10): Promise<TvMazeSearchResult[]> {
    try {
      const data = await fetcher<TvMazeSearchResult[]>(
        `${BASE_URL}/search/shows?q=${encodeURIComponent(query)}&embed=episodes`
      );
      return data.slice(0, limit);
    } catch (error) {
      console.error("TVMaze search error:", error);
      return [];
    }
  },

  async getShow(id: number): Promise<TvMazeShow | null> {
    try {
      return await fetcher<TvMazeShow>(`${BASE_URL}/shows/${id}`);
    } catch (error) {
      console.error("TVMaze getShow error:", error);
      return null;
    }
  },

  async getEpisodes(showId: number): Promise<TvMazeEpisode[]> {
    try {
      return await fetcher<TvMazeEpisode[]>(`${BASE_URL}/shows/${showId}/episodes`);
    } catch (error) {
      console.error("TVMaze getEpisodes error:", error);
      return [];
    }
  },

  async getPopularShows(limit = 20): Promise<TvMazeShow[]> {
    try {
      const [shows, schedule] = await Promise.all([
        fetcher<TvMazeShow[]>(`${BASE_URL}/shows?page=0`),
        fetcher<Array<{ show: TvMazeShow }>>(`${BASE_URL}/schedule?country=US&date=${new Date().toISOString().split("T")[0]}`),
      ]);
      
      const scheduleIds = new Set(schedule.map((s) => s.show.id));
      const popularShows = shows.filter((s) => scheduleIds.has(s.id) || s.weight > 70);
      
      return popularShows.slice(0, limit);
    } catch (error) {
      console.error("TVMaze getPopularShows error:", error);
      return [];
    }
  },

  async lookupShow(imdbId: string): Promise<TvMazeShow | null> {
    try {
      return await fetcher<TvMazeShow>(`${BASE_URL}/lookup/shows?imdb=${imdbId}`);
    } catch (error) {
      console.error("TVMaze lookup error:", error);
      return null;
    }
  },
};
