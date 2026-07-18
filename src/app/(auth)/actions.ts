"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { loginSchema, registerSchema, flattenFieldErrors } from "@/lib/auth-schemas";

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const DASHBOARD = "/";

/** Đăng nhập bằng email/mật khẩu. Thành công -> redirect /; sai -> trả lỗi. */
export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
      redirectTo: DASHBOARD,
    });
  } catch (error) {
    // signIn ném redirect (NEXT_REDIRECT) khi thành công -> phải re-throw.
    if (error instanceof AuthError) {
      return { error: "Email hoặc mật khẩu không đúng." };
    }
    throw error;
  }
  return {};
}

/** Đăng ký tài khoản mới rồi tự đăng nhập. */
export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const email = parsed.data.email.trim().toLowerCase();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: ["Email này đã được đăng ký."] } };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.user.create({
    data: { email, name: parsed.data.name.trim(), passwordHash },
  });

  try {
    // User mới -> đưa qua onboarding (chỉ hiện 1 lần) trước khi vào dashboard.
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Đăng ký thành công. Vui lòng đăng nhập." };
    }
    throw error;
  }
  return {};
}
