import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { aiRecommendSchema, aiSummarySchema, aiTasteProfileSchema, type AIProvider } from "./types";

// llama-3.3-70b-versatile: chất lượng tiếng Việt tốt nhất free tier.
// Tự generate text + parse JSON (Groq strict json_schema chỉ hỗ trợ trên
// openai/gpt-oss-* và schema không flexible bằng Zod).
const MODEL = "llama-3.3-70b-versatile";

/**
 * Provider AI dùng Groq (free tier, có API key).
 *
 * Groq chạy Llama 3.3 70B siêu nhanh, free ~30 req/min.
 * Lấy key miễn phí tại https://console.groq.com/keys.
 *
 * Yêu cầu: AI_PROVIDER=groq + GROQ_API_KEY trong .env.
 */
function makeGroq() {
  return createGroq({ apiKey: process.env.GROQ_API_KEY });
}

/**
 * Generate raw text rồi parse JSON an toàn.
 * Một số model Groq trả kèm ```json ... ``` nên strip trước khi parse.
 */
async function callJson<T>(
  prompt: string,
  schema: { parse: (data: unknown) => T },
  retries = 1,
): Promise<T> {
  const groq = makeGroq();
  let lastErr: unknown = null;
  let lastRaw = "";
  for (let i = 0; i <= retries; i++) {
    const { text } = await generateText({
      model: groq(MODEL),
      prompt:
        `${prompt}\n\nQUAN TRỌNG: Chỉ trả về JSON thuần (không markdown, không giải thích). ` +
        `Đảm bảo JSON hợp lệ, không có comment, không trailing comma.`,
      temperature: 0.4,
    });
    lastRaw = text;
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    try {
      const parsed = JSON.parse(cleaned) as unknown;
      return schema.parse(parsed);
    } catch (err) {
      lastErr = err;
      if (i === retries) break;
    }
  }
  // Log raw output để debug khi Groq trả lệch schema.
  console.error(
    `[Groq] JSON parse thất bại sau ${retries + 1} lần thử. Raw output:`,
    lastRaw.slice(0, 500),
  );
  throw new Error(
    `Groq trả JSON không hợp lệ sau ${retries + 1} lần thử: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  );
}

export const groqProvider: AIProvider = {
  name: "groq",

  async summarize(input) {
    const scope =
      input.mediaType === "tv"
        ? `tính tới HẾT tập ${input.currentEpisode}`
        : "toàn bộ phim (không tiết lộ twist/kết thúc)";
    return callJson(
      `Bạn là trợ lý tóm tắt phim, tuyệt đối KHÔNG SPOIL. ` +
        `Tóm tắt "${input.title}" (${input.originalTitle ?? ""}) ${scope}. ` +
        `KHÔNG được tiết lộ bất kỳ diễn biến nào sau mốc đó. ` +
        `Mô tả tham khảo: ${input.overview ?? "không có"}. ` +
        `Trả về: summary (đoạn văn), characters (tên + ghi chú ngắn), conflicts (mâu thuẫn chính). Viết bằng tiếng Việt.`,
      aiSummarySchema,
    );
  },

  async recommend(input) {
    return callJson(
      `Gợi ý 3 phim cho người dùng. ` +
        `Gu thể loại: ${input.favGenres.join(", ") || "đa dạng"}. ` +
        `Quốc gia ưa thích: ${input.favCountries.join(", ") || "đa dạng"}. ` +
        (input.preferTvShows
          ? `Ưu tiên phim bộ (TV series) hơn phim lẻ (movie). `
          : "Có thể gợi ý cả phim bộ lẫn phim lẻ. ") +
        (input.mood ? `Tâm trạng hiện tại: ${input.mood}. ` : "") +
        `Đã có trong thư viện (tránh trùng): ${input.libraryTitles.join(", ") || "chưa có"}. ` +
        `Trả về JSON có đúng cấu trúc: ` +
        `{"recommendations":[{"title":"<tên phim>","reason":"<lý do hợp gu, tiếng Việt>","matchScore":<0-100>},...]} ` +
        `BẮT BUỘC bọc trong object có key "recommendations" là mảng 3 phần tử.`,
      aiRecommendSchema,
    );
  },

  async tasteProfile(input) {
    return callJson(
      `Phân tích gu xem phim. ` +
        `Thể loại đã xem: ${input.genres.join(", ") || "chưa có"}. ` +
        `Quốc gia: ${input.countries.join(", ") || "chưa có"}. ` +
        `Phim đã chấm điểm: ${input.ratedTitles.map((r) => `${r.title} (${r.score})`).join(", ") || "chưa có"}. ` +
        `Trả về: profileText (nhận định gu, tiếng Việt), topGenres (mảng {genre, count}), topCountries (mảng {country, count}).`,
      aiTasteProfileSchema,
    );
  },
};
