import { z } from "zod";

/** Thể loại gợi ý cho onboarding (tên khớp với genres từ TMDb/seed). */
export const GENRE_OPTIONS = [
  "Romance",
  "Drama",
  "Action",
  "Comedy",
  "Mystery",
  "Animation",
  "Thriller",
  "Crime",
  "Sci-Fi",
  "Fantasy",
  "Horror",
  "Historical",
] as const;

/** Quốc gia gợi ý (mã ISO + nhãn tiếng Việt). */
export const COUNTRY_OPTIONS = [
  { code: "VN", label: "Việt Nam" },
  { code: "KR", label: "Hàn Quốc" },
  { code: "CN", label: "Trung Quốc" },
  { code: "JP", label: "Nhật Bản" },
  { code: "US", label: "Mỹ" },
  { code: "TH", label: "Thái Lan" },
  { code: "GB", label: "Anh" },
] as const;

export const preferencesSchema = z.object({
  favGenres: z.array(z.string().min(1).max(40)).max(30).default([]),
  favCountries: z.array(z.string().min(1).max(10)).max(30).default([]),
  preferTvShows: z.boolean().default(false),
  // Các trường dùng lại cho trang Settings (Task 21) — tùy chọn.
  theme: z.enum(["dark", "light"]).optional(),
  language: z.string().min(2).max(10).optional(),
  ratingScale: z.enum(["5", "10", "100"]).optional(),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;
