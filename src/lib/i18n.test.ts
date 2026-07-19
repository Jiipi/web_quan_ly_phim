import { describe, it, expect } from "vitest";
import { translate, DICTS_INTERNAL } from "./i18n";

describe("i18n", () => {
  it("VI: dịch đúng các key", () => {
    expect(translate("common.save", "vi")).toBe("Lưu");
    expect(translate("nav.home", "vi")).toBe("Trang chủ");
    expect(translate("tmdb.mock", "vi")).toBe("Mock Mode — dữ liệu giả lập");
  });

  it("EN: dịch đúng các key", () => {
    expect(translate("common.save", "en")).toBe("Save");
    expect(translate("nav.home", "en")).toBe("Home");
    expect(translate("tmdb.mock", "en")).toBe("Mock Mode — simulated data");
  });

  it("fallback VI khi key không tồn tại ở EN", () => {
    // Force: nếu EN thiếu key, trả VI
    expect(translate("nav.settings", "en")).toBe("Settings");
  });

  it("fallback key gốc khi không có ở cả 2 dict", () => {
    expect(translate("totally.missing.key", "en")).toBe("totally.missing.key");
    expect(translate("totally.missing.key", "vi")).toBe("totally.missing.key");
  });

  it("Mọi key VI đều có key tương ứng ở EN (kiểm tra coverage)", () => {
    const viKeys = Object.keys(DICTS_INTERNAL.vi);
    const enKeys = new Set(Object.keys(DICTS_INTERNAL.en));
    const missing = viKeys.filter((k) => !enKeys.has(k));
    expect(missing).toEqual([]);
  });
});
