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

  it("recommend: gợi ý tuân theo favGenres - Romance/KR", async () => {
    const r = await mockProvider.recommend({
      favGenres: ["Romance", "Drama"],
      favCountries: ["KR"],
      libraryTitles: [],
    });
    const titles = r.recommendations.map((x) => x.title);
    // Phim Romance/KR trong pool phải lên top
    expect(titles[0]).toMatch(/Chiếc Bật Lửa|Hạ Cánh|Reply 1988|Điều Kỳ Diệu|Oldboy|Parasite/);
    expect(r.recommendations[0].reason).toMatch(/Romance|Drama|KR/);
  });

  it("recommend: preferTvShows=true ưu tiên phim bộ", async () => {
    const r = await mockProvider.recommend({
      favGenres: [],
      favCountries: [],
      preferTvShows: true,
      libraryTitles: [],
    });
    // Ít nhất rec đầu phải là phim bộ
    const tvTitles = ["Chiếc Bật Lửa Và Váy Công Chúa", "Hạ Cánh Nơi Anh", "Reply 1988"];
    expect(tvTitles).toContain(r.recommendations[0].title);
  });

  it("recommend: loại bỏ phim đã có trong thư viện", async () => {
    const r = await mockProvider.recommend({
      favGenres: [],
      favCountries: [],
      libraryTitles: [
        "Chiếc Bật Lửa Và Váy Công Chúa",
        "Hạ Cánh Nơi Anh",
        "Reply 1988",
        "Điều Kỳ Diệu Ở Phòng Giam Số 7",
      ],
    });
    const titles = r.recommendations.map((x) => x.title);
    // Sau khi loại 4 phim, còn ít nhất 1 gợi ý không nằm trong libraryTitles
    for (const t of titles) {
      expect(t).not.toMatch(/Chiếc Bật Lửa|Hạ Cánh|Reply 1988|Điều Kỳ Diệu/);
    }
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
