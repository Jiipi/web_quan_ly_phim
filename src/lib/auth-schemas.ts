import { z } from "zod";

// Regex email đơn giản (dùng refine thay z.email() để đồng nhất & tránh phụ thuộc phiên bản zod).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmail = (v: string) => EMAIL_RE.test(v);

const emailField = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập email")
  .refine(isEmail, "Email không hợp lệ");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Vui lòng nhập tên hiển thị").max(80, "Tên quá dài"),
    email: emailField,
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(100, "Mật khẩu quá dài"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại không khớp",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Gom lỗi zod thành map field -> danh sách message (robust theo mọi phiên bản zod,
 * không phụ thuộc .flatten()).
 */
export function flattenFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
