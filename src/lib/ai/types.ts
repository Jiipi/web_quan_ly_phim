import { z } from "zod";

// ===== Tóm tắt không spoil =====
export const aiSummarySchema = z.object({
  summary: z.string(),
  characters: z.array(z.object({ name: z.string(), note: z.string() })).default([]),
  conflicts: z.array(z.string()).default([]),
});
export type AISummaryResult = z.infer<typeof aiSummarySchema>;

export interface AISummaryInput {
  title: string;
  originalTitle?: string;
  mediaType: "movie" | "tv";
  currentEpisode: number;
  totalEpisodes?: number;
  overview?: string;
}

// ===== Gợi ý theo mood/gu =====
export const aiRecommendSchema = z.object({
  recommendations: z.array(
    z.object({
      title: z.string(),
      reason: z.string(),
      matchScore: z.number().min(0).max(100),
    }),
  ),
});
export type AIRecommendResult = z.infer<typeof aiRecommendSchema>;

export interface AIRecommendInput {
  mood?: string;
  favGenres: string[];
  favCountries: string[];
  /** Khi true, AI ưu tiên gợi ý phim bộ hơn phim lẻ. */
  preferTvShows?: boolean;
  libraryTitles: string[];
}

// ===== Taste profile =====
export const aiTasteProfileSchema = z.object({
  profileText: z.string(),
  topGenres: z.array(z.object({ genre: z.string(), count: z.number() })).default([]),
  topCountries: z.array(z.object({ country: z.string(), count: z.number() })).default([]),
});
export type AITasteProfileResult = z.infer<typeof aiTasteProfileSchema>;

export interface AITasteProfileInput {
  genres: string[];
  countries: string[];
  ratedTitles: { title: string; score: number }[];
}

/** Giao diện chung cho mọi provider AI (mock / openai / google). */
export interface AIProvider {
  readonly name: string;
  summarize(input: AISummaryInput): Promise<AISummaryResult>;
  recommend(input: AIRecommendInput): Promise<AIRecommendResult>;
  tasteProfile(input: AITasteProfileInput): Promise<AITasteProfileResult>;
}
