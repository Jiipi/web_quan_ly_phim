import { z } from "zod";

/**
 * Validate & type hoá biến môi trường phía server.
 *
 * Nguyên tắc:
 * - DATABASE_URL: BẮT BUỘC (chuỗi kết nối PostgreSQL).
 * - AUTH_SECRET: bắt buộc ở production (Auth.js v5). Chấp nhận NEXTAUTH_SECRET (tên cũ) làm fallback.
 * - Tích hợp ngoài (TMDb, AI, Google OAuth): TÙY CHỌN — thiếu key thì tính năng tự tắt / dùng mock.
 *
 * KHÔNG import module này vào Client Component: nó đọc secret phía server.
 */

function isValidUrl(value: string): boolean {
  try {
    void new URL(value);
    return true;
  } catch {
    return false;
  }
}

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Bắt buộc
    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL là bắt buộc")
      .refine(
        (v) => v.startsWith("postgres://") || v.startsWith("postgresql://"),
        "DATABASE_URL phải là chuỗi kết nối PostgreSQL (postgres:// hoặc postgresql://)",
      ),

    // Auth (bắt buộc ở production — kiểm tra bên dưới)
    AUTH_SECRET: z.string().min(16, "AUTH_SECRET cần tối thiểu 16 ký tự").optional(),
    AUTH_URL: z.string().refine(isValidUrl, "AUTH_URL phải là URL hợp lệ").optional(),

    // TMDb (tùy chọn — thiếu thì dùng mock)
    TMDB_API_KEY: z.string().min(1).optional(),

    // AI (tùy chọn — provider mặc định 'mock')
    AI_PROVIDER: z.enum(["openai", "google", "groq", "mock"]).default("mock"),
    OPENAI_API_KEY: z.string().min(1).optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
    GROQ_API_KEY: z.string().min(1).optional(),

    // Google OAuth (tùy chọn — thiếu thì tắt nút đăng nhập Google)
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

    // Mail (SMTP Gmail App Password — dùng cho form báo lỗi). Tất cả optional.
    GMAIL_USER: z.string().email("GMAIL_USER phải là email hợp lệ").optional(),
    GMAIL_APP_PASSWORD: z.string().min(1).optional(),
    GMAIL_REPORT_TO: z.string().email("GMAIL_REPORT_TO phải là email hợp lệ").optional(),
  })
  .refine((v) => !(v.NODE_ENV === "production" && !v.AUTH_SECRET), {
    message: "AUTH_SECRET là bắt buộc ở môi trường production",
    path: ["AUTH_SECRET"],
  });

export type Env = z.infer<typeof envSchema>;

type EnvSource = Record<string, string | undefined>;

/** Gộp tên biến cũ (NEXTAUTH_*) vào tên chuẩn Auth.js v5 (AUTH_*). */
function buildSource(src: EnvSource): EnvSource {
  return {
    ...src,
    AUTH_SECRET: src.AUTH_SECRET ?? src.NEXTAUTH_SECRET,
    AUTH_URL: src.AUTH_URL ?? src.NEXTAUTH_URL,
  };
}

export function parseEnv(src: EnvSource = process.env) {
  return envSchema.safeParse(buildSource(src));
}

export interface Features {
  /** TMDb dùng dữ liệu thật (có API key) hay mock. */
  tmdb: boolean;
  /** Đăng nhập Google khả dụng (có đủ client id + secret). */
  googleOAuth: boolean;
  /** Provider AI đang chọn. */
  aiProvider: Env["AI_PROVIDER"];
  /** AI sẵn sàng chạy thật (mock luôn sẵn sàng; provider thật cần key tương ứng). */
  aiReady: boolean;
  /** SMTP Gmail sẵn sàng (đủ user + app password) để gửi mail báo lỗi. */
  mailerReady: boolean;
}

export function deriveFeatures(e: Env): Features {
  const aiReady =
    e.AI_PROVIDER === "mock" ||
    (e.AI_PROVIDER === "openai" && !!e.OPENAI_API_KEY) ||
    (e.AI_PROVIDER === "google" && !!e.GOOGLE_GENERATIVE_AI_API_KEY) ||
    (e.AI_PROVIDER === "groq" && !!e.GROQ_API_KEY);

  return {
    tmdb: !!e.TMDB_API_KEY,
    googleOAuth: !!(e.GOOGLE_CLIENT_ID && e.GOOGLE_CLIENT_SECRET),
    aiProvider: e.AI_PROVIDER,
    aiReady,
    mailerReady: !!(e.GMAIL_USER && e.GMAIL_APP_PASSWORD),
  };
}

export function formatEnvError(error: z.ZodError): string {
  return error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
}

const parsed = parseEnv(process.env);

// Ở production, cấu hình sai là lỗi nghiêm trọng -> chặn khởi động ngay khi import.
if (!parsed.success && process.env.NODE_ENV === "production") {
  throw new Error("❌ Cấu hình môi trường không hợp lệ:\n" + formatEnvError(parsed.error));
}

/**
 * Env đã validate. Ở dev/test nếu cấu hình thiếu, ta vẫn trả về best-effort để
 * không chặn công cụ/test cục bộ; fail-fast "cứng" được thực hiện qua assertEnv()
 * trong instrumentation lúc server khởi động.
 */
export const env: Env = parsed.success
  ? parsed.data
  : ({
      NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"] | undefined) ?? "development",
      AI_PROVIDER: "mock",
      ...buildSource(process.env),
    } as unknown as Env);

export const features: Features = deriveFeatures(env);

/** Ném lỗi rõ ràng nếu env không hợp lệ. Gọi lúc server khởi động (instrumentation). */
export function assertEnv(src: EnvSource = process.env): Env {
  const result = parseEnv(src);
  if (!result.success) {
    throw new Error(
      "❌ Cấu hình môi trường không hợp lệ:\n" +
        formatEnvError(result.error) +
        "\n\nXem file .env.example để biết các biến cần thiết.",
    );
  }
  return result.data;
}
