import { describe, it, expect } from "vitest";
import { mockProvider } from "./mock";
import { getAIProvider } from "./index";
import { aiSummarySchema, aiRecommendSchema, aiTasteProfileSchema } from "./types";

describe("mockProvider", () => {
  it("summarize: đúng schema + nhắc tới tập hiện tại (không spoil)", async () => {
    const r = await mockProvider.summarize({
      title: "Phim Test",
      mediaType: "tv",
      currentEpisode: 5,
    });
    expect(aiSummarySchema.safeParse(r).success).toBe(true);
    expect(r.summary).toContain("tập 5");
    expect(r.summary).toContain("Phim Test");
  });

  it("recommend: trả danh sách hợp lệ dựa trên gu", async () => {
    const r = await mockProvider.recommend({
      favGenres: ["Romance"],
      favCountries: ["VN"],
      libraryTitles: ["A", "B"],
    });
    expect(aiRecommendSchema.safeParse(r).success).toBe(true);
    expect(r.recommendations.length).toBeGreaterThan(0);
    expect(r.recommendations[0].matchScore).toBeGreaterThanOrEqual(0);
  });

  it("tasteProfile: đếm đúng top genre/country từ input", async () => {
    const r = await mockProvider.tasteProfile({
      genres: ["Romance", "Romance", "Action"],
      countries: ["VN", "KR"],
      ratedTitles: [{ title: "A", score: 8 }],
    });
    expect(aiTasteProfileSchema.safeParse(r).success).toBe(true);
    expect(r.topGenres[0]).toEqual({ genre: "Romance", count: 2 });
  });
});

describe("getAIProvider", () => {
  it("mặc định trả về provider mock khi chưa cấu hình key", () => {
    expect(getAIProvider().name).toBe("mock");
  });
});
