import { describe, it, expect } from "vitest";
import { preferencesSchema } from "./preferences-schema";

describe("preferencesSchema", () => {
  it("áp default khi bỏ trống", () => {
    const r = preferencesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.favGenres).toEqual([]);
      expect(r.data.favCountries).toEqual([]);
      expect(r.data.preferTvShows).toBe(false);
    }
  });

  it("nhận danh sách hợp lệ", () => {
    const r = preferencesSchema.safeParse({
      favGenres: ["Romance", "Mystery"],
      favCountries: ["VN", "KR"],
      preferTvShows: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.favGenres).toHaveLength(2);
      expect(r.data.preferTvShows).toBe(true);
    }
  });

  it("từ chối genre rỗng hoặc quá dài", () => {
    expect(preferencesSchema.safeParse({ favGenres: [""] }).success).toBe(false);
    expect(preferencesSchema.safeParse({ favGenres: ["x".repeat(41)] }).success).toBe(false);
  });

  it("từ chối ratingScale không hợp lệ", () => {
    expect(preferencesSchema.safeParse({ ratingScale: "7" }).success).toBe(false);
  });

  it("nhận ratingScale hợp lệ", () => {
    expect(preferencesSchema.safeParse({ ratingScale: "10" }).success).toBe(true);
  });
});
