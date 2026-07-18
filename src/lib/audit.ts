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

/** Lấy IP client từ header (x-forwarded-for). */
export function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : null;
}
