import { describe, it, expect } from "vitest";
import { hotScore, formatCount, timeAgo } from "./community";

describe("hotScore", () => {
  it("bài mới đăng không có like/comment có score dương (recency)", () => {
    const now = new Date("2026-07-20T10:00:00Z").getTime();
    const score = hotScore(
      { likeCount: 0, commentCount: 0, createdAt: new Date(now - 60_000) },
      now,
    );
    // recency ≈ 1.0, score ≈ 5
    expect(score).toBeGreaterThan(4.9);
    expect(score).toBeLessThan(5.1);
  });

  it("like và comment tăng điểm với trọng số 3 và 2", () => {
    const now = new Date("2026-07-20T10:00:00Z").getTime();
    const score = hotScore({ likeCount: 10, commentCount: 5, createdAt: new Date(now) }, now);
    // recency = 1.0 → score = 10*3 + 5*2 + 1*5 = 45
    expect(score).toBe(45);
  });

  it("score giảm theo thời gian (recency decay)", () => {
    const now = new Date("2026-07-20T10:00:00Z").getTime();
    const newScore = hotScore({ likeCount: 5, commentCount: 2, createdAt: new Date(now) }, now);
    const oldScore = hotScore(
      { likeCount: 5, commentCount: 2, createdAt: new Date(now - 7 * 24 * 3600 * 1000) },
      now,
    );
    expect(newScore).toBeGreaterThan(oldScore);
    // Sau 7 ngày recency = 1/(1+7) ≈ 0.125 → score ≈ 15 + 4 + 0.625 = 19.625
    expect(oldScore).toBeGreaterThan(15);
    expect(oldScore).toBeLessThan(20);
  });

  it("post tương lai (clock skew) không bị âm", () => {
    const now = new Date("2026-07-20T10:00:00Z").getTime();
    const score = hotScore(
      { likeCount: 0, commentCount: 0, createdAt: new Date(now + 60_000) },
      now,
    );
    expect(score).toBeGreaterThanOrEqual(5); // recency = 1.0
  });
});

describe("formatCount", () => {
  it("giữ nguyên số nhỏ", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(42)).toBe("42");
    expect(formatCount(999)).toBe("999");
  });
  it("compact cho K", () => {
    expect(formatCount(1500)).toBe("1.5K");
    expect(formatCount(1234)).toBe("1.2K");
    expect(formatCount(50000)).toBe("50K");
  });
  it("compact cho M", () => {
    expect(formatCount(2_500_000)).toBe("2.5M");
    expect(formatCount(12_500_000)).toBe("13M");
  });
});

describe("timeAgo", () => {
  it("'vừa xong' cho dưới 1 phút", () => {
    const now = new Date("2026-07-20T10:00:00Z").getTime();
    expect(timeAgo(new Date(now - 30_000), now)).toBe("vừa xong");
  });
  it("phút", () => {
    const now = new Date("2026-07-20T10:00:00Z").getTime();
    expect(timeAgo(new Date(now - 5 * 60_000), now)).toBe("5 phút trước");
  });
  it("giờ", () => {
    const now = new Date("2026-07-20T10:00:00Z").getTime();
    expect(timeAgo(new Date(now - 3 * 3600_000), now)).toBe("3 giờ trước");
  });
  it("ngày / tháng / năm", () => {
    const now = new Date("2026-07-20T10:00:00Z").getTime();
    expect(timeAgo(new Date(now - 2 * 86_400_000), now)).toBe("2 ngày trước");
    expect(timeAgo(new Date(now - 90 * 86_400_000), now)).toBe("3 tháng trước");
    expect(timeAgo(new Date(now - 800 * 86_400_000), now)).toBe("2 năm trước");
  });
});
