import { db } from "./db";

/** Ghi nhật ký audit (fire-and-forget; nuốt lỗi để không chặn request chính). */
export async function logAudit(
  userId: string,
  action: string,
  details?: unknown,
  ipAddress?: string | null,
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        ipAddress: ipAddress ?? null,
        details: details === undefined ? undefined : JSON.parse(JSON.stringify(details)),
      },
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}

/**
 * Ghi nhật ký hành động quản trị.
 * Wrapper trên `logAudit` với cấu trúc details nhất quán cho admin actions.
 */
export async function logAdminAction(
  userId: string,
  action: AdminAction,
  target: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  await logAudit(userId, action, { target, ...detail });
}

/** Các action hợp lệ cho admin operations. */
export const ADMIN_ACTIONS = {
  USER_PROMOTE: "admin.user.promote",
  USER_DEMOTE: "admin.user.demote",
  USER_TOGGLE_ROLE: "admin.user.toggle_role",
  MOVIE_IMPORT: "admin.movie.import",
  MOVIE_DELETE: "admin.movie.delete",
  SETTINGS_CHANGE: "admin.settings.change",
  MAINTENANCE_ENABLE: "admin.maintenance.enable",
  MAINTENANCE_DISABLE: "admin.maintenance.disable",
  LOGIN_FAILED: "auth.login_failed",
  LOGIN_SUCCESS: "auth.login",
} as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[keyof typeof ADMIN_ACTIONS];

/** Lấy IP client từ header (x-forwarded-for). */
export function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : null;
}
