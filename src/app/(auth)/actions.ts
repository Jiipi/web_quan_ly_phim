"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { loginSchema, registerSchema, flattenFieldErrors } from "@/lib/auth-schemas";

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  /** Báo cho client biết đăng nhập/đăng ký thành công để tự refresh session + điều hướng. */
  success?: boolean;
  /** URL cần điều hướng tới khi success === true. */
  redirectTo?: string;
}

const DASHBOARD = "/";
const ONBOARDING = "/onboarding";

/**
 * Đăng nhập bằng email/mật khẩu.
 *
 * Lưu ý: KHÔNG truyền `redirectTo` cho `signIn` ở server-action. Lý do:
 * - Khi xác thực thành công, Auth.js v5 set cookie session rồi ném `NEXT_REDIRECT`.
 * - Next.js sẽ client-side navigate tới `redirectTo`, nhưng `SessionProvider` ở root
 *   layout KHÔNG tự refetch → `useSession()` vẫn trả về session cũ (null).
 * - Buộc người dùng phải reload trang mới thấy đã đăng nhập.
 *
 * Thay vào đó: trả về `{ success, redirectTo }`, để client form tự gọi
 * `useSession().update()` + `router.push()` + `router.refresh()` — đảm bảo session
 * được đồng bộ trước khi điều hướng.
 */
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
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email hoặc mật khẩu không đúng." };
    }
    throw error;
  }
  return { success: true, redirectTo: DASHBOARD };
}

/** Đăng ký tài khoản mới rồi tự đăng nhập (qua onboarding cho user mới). */
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
    // Không truyền redirectTo — client sẽ tự điều hướng sau khi update session.
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Đăng ký thành công. Vui lòng đăng nhập." };
    }
    throw error;
  }
  return { success: true, redirectTo: ONBOARDING };
}
