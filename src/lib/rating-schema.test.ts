import { describe, it, expect } from "vitest";
import { ratingSchema, reviewSchema, RATING_ASPECTS } from "./rating-schema";

describe("ratingSchema", () => {
  it("chấp nhận overallScore hợp lệ, aspect tùy chọn", () => {
    const r = ratingSchema.safeParse({ watchItemId: "w1", overallScore: 8 });
    expect(r.success).toBe(true);
  });

  it("chấp nhận aspect null + rewatch", () => {
    const r = ratingSchema.safeParse({
      watchItemId: "w1",
      overallScore: 9,
      plotScore: null,
      actingScore: 7,
      rewatchValue: true,
    });
    expect(r.success).toBe(true);
  });

  it("từ chối overallScore ngoài 1-10", () => {
    expect(ratingSchema.safeParse({ watchItemId: "w1", overallScore: 11 }).success).toBe(false);
    expect(ratingSchema.safeParse({ watchItemId: "w1", overallScore: 0 }).success).toBe(false);
  });

  it("từ chối thiếu watchItemId", () => {
    expect(ratingSchema.safeParse({ overallScore: 5 }).success).toBe(false);
  });

  it("có đủ 6 khía cạnh chi tiết", () => {
    expect(RATING_ASPECTS).toHaveLength(6);
  });
});

describe("reviewSchema", () => {
  it("chấp nhận content hợp lệ", () => {
    expect(reviewSchema.safeParse({ watchItemId: "w1", content: "Hay" }).success).toBe(true);
  });

  it("từ chối content rỗng", () => {
    expect(reviewSchema.safeParse({ watchItemId: "w1", content: "" }).success).toBe(false);
  });
});
