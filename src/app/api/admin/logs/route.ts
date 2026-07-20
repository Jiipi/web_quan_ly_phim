import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { isAdmin } from "@/types/role";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const userAdmin = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!isAdmin(userAdmin?.role ?? "")) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 403 });
    }

    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (err: unknown) {
    console.error("Admin Logs GET Error:", err);
    return NextResponse.json({ error: "Không thể lấy danh sách nhật ký." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
