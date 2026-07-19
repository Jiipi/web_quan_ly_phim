/**
 * Smoke test thật cho Groq provider.
 * Yêu cầu: GROQ_API_KEY đã điền trong .env.
 * Chạy:  npx vitest run src/lib/ai/groq.smoke.test.ts
 *
 * Bỏ qua trong CI: file này được exclude khỏi `npm test` (chỉ match `groq.*.test.ts`
 * nhưng nội dung không phụ thuộc key — nếu không có key, test bị skip).
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Vitest không tự load .env ở root — load thủ công.
const envPath = join(process.cwd(), ".env");
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"#]*)"?\s*$/);
    if (m && m[1] && m[2] !== undefined && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2];
    }
  }
}

const hasKey = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "gsk_paste_your_key_here";
const itWithKey = hasKey ? it : it.skip;

describe("Groq smoke (cần GROQ_API_KEY)", () => {
  itWithKey("GROQ_API_KEY hợp lệ (bắt đầu bằng gsk_)", () => {
    expect(process.env.GROQ_API_KEY).toMatch(/^gsk_/);
  });

  itWithKey(
    "tasteProfile trả JSON tiếng Việt hợp lệ",
    async () => {
      const { groqProvider } = await import("./groq");
      const result = await groqProvider.tasteProfile({
        genres: ["Romance", "Drama", "Mystery"],
        countries: ["KR", "JP"],
        ratedTitles: [{ title: "Crash Landing on You", score: 9 }],
      });
      console.log("Groq response:", JSON.stringify(result, null, 2));
      expect(result.profileText.length).toBeGreaterThan(20);
      expect(result.topGenres.length).toBeGreaterThan(0);
      expect(result.topCountries.length).toBeGreaterThan(0);
    },
    30_000,
  );

  itWithKey(
    "summarize trả JSON tiếng Việt hợp lệ",
    async () => {
      const { groqProvider } = await import("./groq");
      const result = await groqProvider.summarize({
        title: "Crash Landing on You",
        originalTitle: "사랑의 불시착",
        mediaType: "tv",
        currentEpisode: 16,
        totalEpisodes: 16,
        overview: "Một nữ CEO Hàn Quốc bất ngờ hạ cánh khẩn cấp ở Bắc Triều Tiên.",
      });
      console.log("Summarize response:", JSON.stringify(result, null, 2));
      expect(result.summary.length).toBeGreaterThan(50);
    },
    30_000,
  );

  itWithKey(
    "summarize edge: phim lẻ currentEpisode=0, không overview",
    async () => {
      const { groqProvider } = await import("./groq");
      const result = await groqProvider.summarize({
        title: "Inception",
        originalTitle: "Inception",
        mediaType: "movie",
        currentEpisode: 0,
        overview: undefined,
      });
      console.log("Movie summarize:", JSON.stringify(result, null, 2));
      expect(result.summary.length).toBeGreaterThan(30);
    },
    30_000,
  );

  itWithKey(
    "recommend trả 3 phim gợi ý",
    async () => {
      const { groqProvider } = await import("./groq");
      const result = await groqProvider.recommend({
        favGenres: ["Romance", "Drama"],
        favCountries: ["KR"],
        preferTvShows: true,
        mood: "muốn xem gì đó nhẹ nhàng",
        libraryTitles: ["Crash Landing on You"],
      });
      expect(result.recommendations).toHaveLength(3);
      expect(result.recommendations[0].title).toBeTruthy();
      expect(result.recommendations[0].reason.length).toBeGreaterThan(10);
    },
    30_000,
  );
});
