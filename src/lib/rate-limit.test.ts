import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

beforeEach(() => resetRateLimit());

describe("checkRateLimit", () => {
  it("cho phép tới `limit` lần rồi chặn", () => {
    const now = 1000;
    expect(checkRateLimit("k", 3, 60_000, now).ok).toBe(true);
    expect(checkRateLimit("k", 3, 60_000, now).ok).toBe(true);
    expect(checkRateLimit("k", 3, 60_000, now).ok).toBe(true);
    const blocked = checkRateLimit("k", 3, 60_000, now);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("reset sau khi hết cửa sổ thời gian", () => {
    expect(checkRateLimit("k", 1, 1000, 0).ok).toBe(true);
    expect(checkRateLimit("k", 1, 1000, 500).ok).toBe(false);
    expect(checkRateLimit("k", 1, 1000, 1500).ok).toBe(true); // cửa sổ mới
  });

  it("các key khác nhau độc lập", () => {
    expect(checkRateLimit("a", 1, 1000, 0).ok).toBe(true);
    expect(checkRateLimit("b", 1, 1000, 0).ok).toBe(true);
    expect(checkRateLimit("a", 1, 1000, 0).ok).toBe(false);
  });

  it("remaining giảm dần", () => {
    expect(checkRateLimit("r", 3, 60_000, 0).remaining).toBe(2);
    expect(checkRateLimit("r", 3, 60_000, 0).remaining).toBe(1);
    expect(checkRateLimit("r", 3, 60_000, 0).remaining).toBe(0);
  });
});
