import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cn, formatRelativeTime, formatDate, toDateInputValue } from "./utils";

describe("cn", () => {
  it("nối nhiều class thành chuỗi", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("bỏ qua giá trị falsy (điều kiện)", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });

  it("gộp class Tailwind trùng nhóm, giữ cái sau (twMerge)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm text-red-500", "text-blue-500")).toBe("text-sm text-blue-500");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("trả '-' khi null", () => {
    expect(formatRelativeTime(null)).toBe("-");
  });

  it("trả 'Hôm nay' khi cùng thời điểm", () => {
    expect(formatRelativeTime(new Date("2026-01-15T12:00:00.000Z"))).toBe("Hôm nay");
  });

  it("trả 'Hôm qua' khi cách đúng 1 ngày", () => {
    expect(formatRelativeTime(new Date("2026-01-14T12:00:00.000Z"))).toBe("Hôm qua");
  });

  it("trả 'N ngày trước' khi trong vòng 1 tuần", () => {
    expect(formatRelativeTime(new Date("2026-01-12T12:00:00.000Z"))).toBe("3 ngày trước");
  });

  it("trả ngày tuyệt đối khi quá 1 tuần", () => {
    // Quá 7 ngày -> rơi vào nhánh formatDate (dd/mm/yyyy vi-VN)
    const result = formatRelativeTime(new Date("2026-01-01T12:00:00.000Z"));
    expect(result).toMatch(/2026/);
    expect(result).not.toBe("Hôm nay");
  });
});

describe("formatDate", () => {
  it("trả '-' khi null", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("định dạng ngày theo vi-VN", () => {
    expect(formatDate(new Date("2026-03-09T00:00:00.000Z"))).toMatch(/2026/);
  });
});

describe("toDateInputValue", () => {
  it("trả chuỗi rỗng khi null/undefined/invalid", () => {
    expect(toDateInputValue(null)).toBe("");
    expect(toDateInputValue(undefined)).toBe("");
    expect(toDateInputValue("not-a-date")).toBe("");
  });

  it("trả 'yyyy-MM-dd' theo local time", () => {
    // Sử dụng local date để tránh phụ thuộc vào timezone khi test.
    const d = new Date(2026, 6, 19, 10, 0, 0); // 19/07/2026 10:00 local
    expect(toDateInputValue(d)).toBe("2026-07-19");
  });
});
