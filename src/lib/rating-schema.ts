import { z } from "zod";

const scoreOptional = z.number().min(1).max(10).nullable().optional();

export const ratingSchema = z.object({
  watchItemId: z.string().min(1),
  overallScore: z.number().min(1).max(10),
  plotScore: scoreOptional,
  actingScore: scoreOptional,
  emotionScore: scoreOptional,
  pacingScore: scoreOptional,
  musicScore: scoreOptional,
  endingScore: scoreOptional,
  rewatchValue: z.boolean().optional(),
});
export type RatingInput = z.infer<typeof ratingSchema>;

export const reviewSchema = z.object({
  watchItemId: z.string().min(1),
  content: z.string().min(1).max(5000),
  spoilers: z.boolean().optional(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

/** Các khía cạnh chấm điểm chi tiết (khớp field trong model Rating). */
export const RATING_ASPECTS = [
  { key: "plotScore", label: "Kịch bản" },
  { key: "actingScore", label: "Diễn xuất" },
  { key: "emotionScore", label: "Cảm xúc" },
  { key: "pacingScore", label: "Nhịp phim" },
  { key: "musicScore", label: "Âm nhạc" },
  { key: "endingScore", label: "Kết thúc" },
] as const;

export type RatingAspectKey = (typeof RATING_ASPECTS)[number]["key"];
