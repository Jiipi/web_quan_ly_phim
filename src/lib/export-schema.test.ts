import { describe, it, expect } from "vitest";
import { importSchema } from "./export-schema";

describe("importSchema", () => {
  it("chấp nhận payload tối thiểu (mặc định mảng rỗng)", () => {
    const r = importSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.library).toEqual([]);
      expect(r.data.lists).toEqual([]);
    }
  });

  it("chấp nhận library entry đầy đủ + rating/review", () => {
    const r = importSchema.safeParse({
      version: 1,
      library: [
        {
          tmdbId: 414906,
          mediaType: "movie",
          title: "Người Dơi",
          status: "completed",
          personalScore: 9,
          rating: { overallScore: 9, plotScore: 8 },
          review: { content: "Hay", spoilers: false },
        },
      ],
      lists: [{ name: "Yêu thích", itemTmdbIds: [414906] }],
    });
    expect(r.success).toBe(true);
  });

  it("từ chối mediaType lạ / thiếu title", () => {
    expect(
      importSchema.safeParse({
        library: [{ tmdbId: 1, mediaType: "book", title: "x", status: "completed" }],
      }).success,
    ).toBe(false);
    expect(
      importSchema.safeParse({ library: [{ tmdbId: 1, mediaType: "movie", status: "completed" }] })
        .success,
    ).toBe(false);
  });
});
