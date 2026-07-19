import { describe, it, expect } from "vitest";
import { from10, to10, formatScore, SCALE_CONFIG, type RatingScale } from "./rating-scale";

describe("rating-scale", () => {
  it("5-sao: 8/10 -> 4/5", () => {
    expect(from10(8, "5")).toBe(4);
    expect(formatScore(8, "5")).toBe("★ 4/5");
  });

  it("5-sao: 7.5/10 -> 4/5 (làm tròn về step 0.5)", () => {
    // 7.5/10 = 3.75/5 -> step 0.5 gần nhất = 4.0
    expect(from10(7.5, "5")).toBe(4);
    expect(formatScore(7.5, "5")).toBe("★ 4/5");
  });

  it("5-sao: 6.5/10 -> 3.5/5 (làm tròn về step 0.5)", () => {
    // 6.5/10 = 3.25/5 -> step 0.5 gần nhất = 3.5
    expect(formatScore(6.5, "5")).toBe("★ 3.5/5");
  });

  it("10: 8/10 -> 8/10", () => {
    expect(formatScore(8, "10")).toBe("8/10");
  });

  it("100: 8/10 -> 80%", () => {
    expect(formatScore(8, "100")).toBe("80%");
  });

  it("round-trip không lệch quá 0.5 đơn vị scale 5", () => {
    for (const v of [1, 3, 5, 7, 8, 9, 10]) {
      const back = to10(from10(v, "5"), "5");
      // sai số tối đa 1 đơn vị trên thang 10
      expect(Math.abs(back - v)).toBeLessThanOrEqual(1);
    }
  });

  it("config scale hợp lệ", () => {
    const scales: RatingScale[] = ["5", "10", "100"];
    for (const s of scales) {
      const c = SCALE_CONFIG[s];
      expect(c.max).toBeGreaterThan(0);
      expect(c.step).toBeGreaterThan(0);
      expect(c.step).toBeLessThanOrEqual(c.max);
    }
  });
});
