import { describe, it, expect } from "vitest";
import { parseEnv, deriveFeatures, assertEnv } from "./env";

const VALID_DB = "postgresql://postgres:pw@localhost:5432/phimflow?schema=public";
const STRONG_SECRET = "abcdefghijklmnopqrstuvwxyz123456";

describe("parseEnv", () => {
  it("hợp lệ với cấu hình tối thiểu (chỉ DATABASE_URL)", () => {
    const r = parseEnv({ DATABASE_URL: VALID_DB });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.NODE_ENV).toBe("development");
      expect(r.data.AI_PROVIDER).toBe("mock");
    }
  });

  it("thất bại khi thiếu DATABASE_URL", () => {
    const r = parseEnv({});
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("DATABASE_URL"))).toBe(true);
    }
  });

  it("thất bại khi DATABASE_URL không phải PostgreSQL", () => {
    const r = parseEnv({ DATABASE_URL: "mysql://root@localhost:3306/db" });
    expect(r.success).toBe(false);
  });

  it("gộp NEXTAUTH_SECRET (tên cũ) vào AUTH_SECRET", () => {
    const r = parseEnv({ DATABASE_URL: VALID_DB, NEXTAUTH_SECRET: STRONG_SECRET });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.AUTH_SECRET).toBe(STRONG_SECRET);
    }
  });

  it("production yêu cầu AUTH_SECRET", () => {
    const r = parseEnv({ DATABASE_URL: VALID_DB, NODE_ENV: "production" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("AUTH_SECRET"))).toBe(true);
    }
  });

  it("production từ chối AUTH_SECRET quá ngắn", () => {
    const r = parseEnv({ DATABASE_URL: VALID_DB, NODE_ENV: "production", AUTH_SECRET: "short" });
    expect(r.success).toBe(false);
  });

  it("production hợp lệ khi có AUTH_SECRET đủ mạnh", () => {
    const r = parseEnv({
      DATABASE_URL: VALID_DB,
      NODE_ENV: "production",
      AUTH_SECRET: STRONG_SECRET,
    });
    expect(r.success).toBe(true);
  });
});

describe("deriveFeatures", () => {
  const base = {
    NODE_ENV: "development" as const,
    DATABASE_URL: VALID_DB,
    AI_PROVIDER: "mock" as const,
  };

  it("tmdb=false khi không có TMDB_API_KEY, true khi có", () => {
    expect(deriveFeatures({ ...base }).tmdb).toBe(false);
    expect(deriveFeatures({ ...base, TMDB_API_KEY: "key" }).tmdb).toBe(true);
  });

  it("googleOAuth chỉ bật khi có cả client id và secret", () => {
    expect(deriveFeatures({ ...base, GOOGLE_CLIENT_ID: "id" }).googleOAuth).toBe(false);
    expect(
      deriveFeatures({ ...base, GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "secret" })
        .googleOAuth,
    ).toBe(true);
  });

  it("aiReady: mock luôn sẵn sàng", () => {
    expect(deriveFeatures({ ...base, AI_PROVIDER: "mock" }).aiReady).toBe(true);
  });

  it("aiReady: openai cần OPENAI_API_KEY", () => {
    expect(deriveFeatures({ ...base, AI_PROVIDER: "openai" }).aiReady).toBe(false);
    expect(deriveFeatures({ ...base, AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-x" }).aiReady).toBe(
      true,
    );
  });

  it("aiReady: google cần GOOGLE_GENERATIVE_AI_API_KEY", () => {
    expect(deriveFeatures({ ...base, AI_PROVIDER: "google" }).aiReady).toBe(false);
    expect(
      deriveFeatures({ ...base, AI_PROVIDER: "google", GOOGLE_GENERATIVE_AI_API_KEY: "g-key" })
        .aiReady,
    ).toBe(true);
  });
});

describe("assertEnv", () => {
  it("ném lỗi rõ ràng khi cấu hình sai", () => {
    expect(() => assertEnv({})).toThrowError(/Cấu hình môi trường không hợp lệ/);
  });

  it("trả về env đã validate khi hợp lệ", () => {
    const data = assertEnv({ DATABASE_URL: VALID_DB });
    expect(data.DATABASE_URL).toBe(VALID_DB);
  });
});
