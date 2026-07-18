import { describe, it, expect } from "vitest";
import { computeStats, type StatsItem, type StatsSession } from "./stats";

const items: StatsItem[] = [
  {
    status: "completed",
    currentEpisode: 25,
    mediaItem: { runtime: 45, genres: ["Romance", "Drama"], countries: ["CN"] },
  },
  {
    status: "watching",
    currentEpisode: 10,
    mediaItem: { runtime: 45, genres: ["Romance"], countries: ["CN"] },
  },
  {
    status: "watching",
    currentEpisode: 2,
    mediaItem: { runtime: 120, genres: ["Action"], countries: ["US"] },
  },
];

describe("computeStats", () => {
  it("đếm completed + tổng tập + tổng giờ", () => {
    const r = computeStats(items, [], new Date("2026-07-09T12:00:00Z"));
    expect(r.totalCompleted).toBe(1);
    expect(r.totalEpisodes).toBe(37); // 25 + 10 + 2
    // (25*45 + 10*45 + 2*120)/60 = (1125+450+240)/60 = 1815/60 ≈ 30
    expect(r.totalHours).toBe(30);
  });

  it("gộp theo quốc gia (nhãn VN) và thể loại", () => {
    const r = computeStats(items, [], new Date("2026-07-09T12:00:00Z"));
    expect(r.byCountry[0]).toEqual({ name: "Trung Quốc", count: 2 });
    expect(r.byGenre[0]).toEqual({ name: "Romance", value: 2 });
  });

  it("lịch sử 7 ngày + trung bình theo ngày hoạt động", () => {
    const now = new Date("2026-07-09T12:00:00Z");
    const sessions: StatsSession[] = [
      { watchedAt: new Date("2026-07-09T09:00:00Z") },
      { watchedAt: new Date("2026-07-09T10:00:00Z") },
      { watchedAt: new Date("2026-07-08T10:00:00Z") },
    ];
    const r = computeStats(items, sessions, now);
    expect(r.history).toHaveLength(7);
    expect(r.history[r.history.length - 1].episodes).toBe(2); // hôm nay
    expect(r.avgPerActiveDay).toBe("1.5"); // 3 tập / 2 ngày hoạt động
  });

  it("thư viện trống -> số 0, history vẫn 7 ngày", () => {
    const r = computeStats([], [], new Date("2026-07-09T12:00:00Z"));
    expect(r.totalEpisodes).toBe(0);
    expect(r.avgPerActiveDay).toBe("0");
    expect(r.history).toHaveLength(7);
  });
});
