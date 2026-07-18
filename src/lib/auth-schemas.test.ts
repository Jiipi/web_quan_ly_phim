import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, flattenFieldErrors } from "./auth-schemas";

describe("loginSchema", () => {
  it("hợp lệ với email + mật khẩu", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("lỗi khi email sai định dạng", () => {
    const r = loginSchema.safeParse({ email: "not-email", password: "x" });
    expect(r.success).toBe(false);
  });

  it("lỗi khi thiếu mật khẩu", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(r.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    name: "Người Test",
    email: "new@phimflow.com",
    password: "Password123!",
    confirmPassword: "Password123!",
  };

  it("hợp lệ với dữ liệu đầy đủ", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("lỗi khi mật khẩu quá ngắn", () => {
    const r = registerSchema.safeParse({ ...base, password: "123", confirmPassword: "123" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(flattenFieldErrors(r.error).password?.[0]).toMatch(/tối thiểu/);
    }
  });

  it("lỗi khi nhập lại mật khẩu không khớp", () => {
    const r = registerSchema.safeParse({ ...base, confirmPassword: "khac-nhau" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(flattenFieldErrors(r.error).confirmPassword?.[0]).toMatch(/không khớp/);
    }
  });

  it("lỗi khi thiếu tên", () => {
    const r = registerSchema.safeParse({ ...base, name: "" });
    expect(r.success).toBe(false);
  });
});

describe("flattenFieldErrors", () => {
  it("gom nhiều lỗi theo field", () => {
    const r = registerSchema.safeParse({
      name: "",
      email: "bad",
      password: "x",
      confirmPassword: "y",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errs = flattenFieldErrors(r.error);
      expect(Object.keys(errs).length).toBeGreaterThan(0);
      expect(errs.email?.[0]).toMatch(/Email/);
    }
  });
});
