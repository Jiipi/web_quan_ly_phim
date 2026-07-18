import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { aiRecommendSchema, aiSummarySchema, aiTasteProfileSchema, type AIProvider } from "./types";

const MODEL = "gpt-4o-mini";

/**
 * Provider AI thật dùng OpenAI qua Vercel AI SDK (generateObject + zod schema).
 * Chỉ được chọn khi AI_PROVIDER=openai và có OPENAI_API_KEY (xem factory ở index.ts).
 */
export const openaiProvider: AIProvider = {
  name: "openai",

  async summarize(input) {
    const scope =
      input.mediaType === "tv"
        ? `tính tới HẾT tập ${input.currentEpisode}`
        : "toàn bộ phim (không tiết lộ twist/kết thúc)";
    const { object } = await generateObject({
      model: openai(MODEL),
      schema: aiSummarySchema,
      prompt:
        `Bạn là trợ lý tóm tắt phim, tuyệt đối KHÔNG SPOIL. ` +
        `Tóm tắt "${input.title}" (${input.originalTitle ?? ""}) ${scope}. ` +
        `KHÔNG được tiết lộ bất kỳ diễn biến nào sau mốc đó. ` +
        `Mô tả tham khảo: ${input.overview ?? "không có"}. ` +
        `Trả về: summary (đoạn văn), characters (tên + ghi chú ngắn), conflicts (mâu thuẫn chính). Viết bằng tiếng Việt.`,
    });
    return object;
  },

  async recommend(input) {
    const { object } = await generateObject({
      model: openai(MODEL),
      schema: aiRecommendSchema,
      prompt:
        `Gợi ý 3 phim cho người dùng. ` +
        `Gu thể loại: ${input.favGenres.join(", ") || "đa dạng"}. ` +
        `Quốc gia ưa thích: ${input.favCountries.join(", ") || "đa dạng"}. ` +
        (input.mood ? `Tâm trạng hiện tại: ${input.mood}. ` : "") +
        `Đã có trong thư viện (tránh trùng): ${input.libraryTitles.join(", ") || "chưa có"}. ` +
        `Mỗi gợi ý gồm title, reason (lý do hợp gu), matchScore (0-100). Viết bằng tiếng Việt.`,
    });
    return object;
  },

  async tasteProfile(input) {
    const { object } = await generateObject({
      model: openai(MODEL),
      schema: aiTasteProfileSchema,
      prompt:
        `Phân tích gu xem phim. ` +
        `Thể loại đã xem: ${input.genres.join(", ") || "chưa có"}. ` +
        `Quốc gia: ${input.countries.join(", ") || "chưa có"}. ` +
        `Phim đã chấm điểm: ${input.ratedTitles.map((r) => `${r.title} (${r.score})`).join(", ") || "chưa có"}. ` +
        `Trả về: profileText (nhận định gu, tiếng Việt), topGenres (genre+count), topCountries (country+count).`,
    });
    return object;
  },
};
