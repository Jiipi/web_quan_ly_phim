import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("băm ra hash bcrypt, không phải plaintext", async () => {
    const hash = await hashPassword("Password123!");
    expect(hash).not.toBe("Password123!");
    expect(hash).toMatch(/^\$2[aby]\$/); // tiền tố hash bcrypt
  });

  it("verify true với mật khẩu đúng", async () => {
    const hash = await hashPassword("Password123!");
    expect(await verifyPassword("Password123!", hash)).toBe(true);
  });

  it("verify false với mật khẩu sai", async () => {
    const hash = await hashPassword("Password123!");
    expect(await verifyPassword("wrong-pass", hash)).toBe(false);
  });

  it("verify false khi hash rỗng/null/undefined", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", null)).toBe(false);
    expect(await verifyPassword("x", undefined)).toBe(false);
  });

  it("cùng mật khẩu -> hash khác nhau (salt) nhưng đều verify được", async () => {
    const h1 = await hashPassword("same-input");
    const h2 = await hashPassword("same-input");
    expect(h1).not.toBe(h2);
    expect(await verifyPassword("same-input", h1)).toBe(true);
    expect(await verifyPassword("same-input", h2)).toBe(true);
  });
});
