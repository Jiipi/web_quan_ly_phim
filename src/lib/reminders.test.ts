import { describe, it, expect } from "vitest";
import { daysSinceDate, isForgotten, createReminderSchema } from "./reminders";

const NOW = new Date("2026-07-09T12:00:00Z");

describe("daysSinceDate", () => {
  it("tính số ngày; null -> Infinity", () => {
    expect(daysSinceDate(new Date("2026-07-02T12:00:00Z"), NOW)).toBe(7);
    expect(daysSinceDate(null, NOW)).toBe(Infinity);
  });
});

describe("isForgotten", () => {
  it("true khi > 7 ngày", () => {
    expect(isForgotten(new Date("2026-06-30T12:00:00Z"), NOW)).toBe(true); // 9 ngày
  });
  it("false khi <= 7 ngày", () => {
    expect(isForgotten(new Date("2026-07-05T12:00:00Z"), NOW)).toBe(false); // 4 ngày
    expect(isForgotten(new Date("2026-07-02T12:00:00Z"), NOW)).toBe(false); // đúng 7 ngày (không > 7)
  });
  it("false khi chưa từng xem (null)", () => {
    expect(isForgotten(null, NOW)).toBe(false);
  });
  it("tôn trọng ngưỡng tuỳ chỉnh", () => {
    expect(isForgotten(new Date("2026-07-07T12:00:00Z"), NOW, 1)).toBe(true); // 2 ngày > 1
  });
});

describe("createReminderSchema", () => {
  it("chấp nhận watchItemId + optional", () => {
    expect(createReminderSchema.safeParse({ watchItemId: "w1" }).success).toBe(true);
    expect(
      createReminderSchema.safeParse({ watchItemId: "w1", message: "Xem tiếp", remindInDays: 3 })
        .success,
    ).toBe(true);
  });
  it("từ chối remindInDays ngoài khoảng / thiếu watchItemId", () => {
    expect(createReminderSchema.safeParse({ watchItemId: "w1", remindInDays: 0 }).success).toBe(
      false,
    );
    expect(createReminderSchema.safeParse({}).success).toBe(false);
  });
});
