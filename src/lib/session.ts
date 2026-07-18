import { auth } from "@/lib/auth";

/**
 * Trả về id của user đang đăng nhập, hoặc null nếu chưa đăng nhập.
 * Dùng trong route handler / server component để cô lập dữ liệu theo user.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
