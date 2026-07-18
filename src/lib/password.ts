import bcrypt from "bcryptjs";

/** Số vòng salt cho bcrypt. 10 là cân bằng hợp lý giữa bảo mật và tốc độ. */
const SALT_ROUNDS = 10;

/** Băm mật khẩu thô bằng bcrypt. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * So khớp mật khẩu thô với hash bcrypt.
 * Trả về false (không ném lỗi) nếu hash rỗng/không hợp lệ để tránh lộ thông tin.
 */
export async function verifyPassword(
  plain: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
