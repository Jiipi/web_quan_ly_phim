import { verifyPassword } from "./password";

/** Bản ghi user tối thiểu cần để xác thực bằng email/mật khẩu. */
export interface CredentialUserRecord {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  passwordHash: string | null;
}

/** User trả về cho NextAuth sau khi xác thực thành công. */
export interface AuthorizedUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

/**
 * Xác thực credentials (email + mật khẩu) một cách thuần logic, tách khỏi NextAuth/DB
 * để dễ test. `findUserByEmail` được inject (thực tế là Prisma; trong test là hàm giả).
 *
 * Trả về null cho mọi trường hợp thất bại (thiếu field, không tìm thấy user,
 * user không có mật khẩu, hoặc mật khẩu sai) — không phân biệt để tránh lộ thông tin.
 */
export async function authorizeCredentials(
  credentials: Record<string, unknown> | undefined,
  findUserByEmail: (email: string) => Promise<CredentialUserRecord | null>,
): Promise<AuthorizedUser | null> {
  const email =
    typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
  const password = typeof credentials?.password === "string" ? credentials.password : "";

  if (!email || !password) return null;

  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) return null;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;

  return { id: user.id, name: user.name, email: user.email, image: user.image };
}
