import { describe, it, expect } from "vitest";
import { parseMonth, monthBounds, toDateKey, toMonthParam } from "./calendar";

describe("parseMonth", () => {
  it("parse 'YYYY-MM' hợp lệ (month 0-indexed)", () => {
    expect(parseMonth("2026-07")).toEqual({ year: 2026, month: 6 });
  });

  it("thiếu/sai -> tháng hiện tại (now)", () => {
    const now = new Date(2026, 2, 15);
    expect(parseMonth(null, now)).toEqual({ year: 2026, month: 2 });
    expect(parseMonth("bad", now)).toEqual({ year: 2026, month: 2 });
    expect(parseMonth("2026-13", now)).toEqual({ year: 2026, month: 2 });
  });
});

describe("monthBounds", () => {
  it("trả [start, end) đúng tháng", () => {
    const { start, end } = monthBounds(2026, 6); // July
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(6);
    expect(end.getMonth()).toBe(7); // Aug 1
    expect(end.getDate()).toBe(1);
  });
});

describe("toDateKey / toMonthParam", () => {
  it("toDateKey pad 2 chữ số", () => {
    expect(toDateKey(new Date(2026, 6, 9))).toBe("2026-07-09");
  });
  it("toMonthParam 'YYYY-MM'", () => {
    expect(toMonthParam(new Date(2026, 0, 5))).toBe("2026-01");
  });
});
