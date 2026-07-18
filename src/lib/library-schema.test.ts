import { describe, it, expect } from "vitest";
import { updateWatchItemSchema, WATCH_STATUSES } from "./library-schema";

describe("updateWatchItemSchema", () => {
  it("cần watchItemId", () => {
    expect(updateWatchItemSchema.safeParse({}).success).toBe(false);
    expect(updateWatchItemSchema.safeParse({ watchItemId: "w1" }).success).toBe(true);
  });

  it("nhận status hợp lệ, từ chối status lạ", () => {
    expect(updateWatchItemSchema.safeParse({ watchItemId: "w1", status: "watching" }).success).toBe(
      true,
    );
    expect(updateWatchItemSchema.safeParse({ watchItemId: "w1", status: "xyz" }).success).toBe(
      false,
    );
  });

  it("priority phải trong [0,100]", () => {
    expect(updateWatchItemSchema.safeParse({ watchItemId: "w1", priority: 5 }).success).toBe(true);
    expect(updateWatchItemSchema.safeParse({ watchItemId: "w1", priority: -1 }).success).toBe(
      false,
    );
    expect(updateWatchItemSchema.safeParse({ watchItemId: "w1", priority: 101 }).success).toBe(
      false,
    );
  });

  it("personalScore chấp nhận null hoặc 0..10", () => {
    expect(
      updateWatchItemSchema.safeParse({ watchItemId: "w1", personalScore: null }).success,
    ).toBe(true);
    expect(updateWatchItemSchema.safeParse({ watchItemId: "w1", personalScore: 8.5 }).success).toBe(
      true,
    );
    expect(updateWatchItemSchema.safeParse({ watchItemId: "w1", personalScore: 11 }).success).toBe(
      false,
    );
  });

  it("có đủ 5 trạng thái", () => {
    expect(WATCH_STATUSES).toHaveLength(5);
  });
});
