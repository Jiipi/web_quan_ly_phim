import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { logAdminAction, ADMIN_ACTIONS } from "@/lib/audit";
import { enforceRateLimit } from "@/lib/api-guard";
import { isAdmin, ROLES, isValidRole } from "@/types/role";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const userAdmin = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!isAdmin(userAdmin?.role ?? "")) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 403 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { watchItems: true },
        },
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (err: unknown) {
    console.error("Admin Users GET Error:", err);
    return NextResponse.json({ error: "Không thể lấy danh sách người dùng." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const rl = enforceRateLimit(`admin:users:patch:${userId}`, 10, 60_000);
    if (rl) return rl;

    const userAdmin = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!isAdmin(userAdmin?.role ?? "")) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.targetUserId || !body.role) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const { targetUserId, role } = body;
    if (!isValidRole(role)) {
      return NextResponse.json({ error: "Quyền hạn không hợp lệ." }, { status: 400 });
    }

    if (targetUserId === userId) {
      return NextResponse.json(
        { error: "Bạn không thể tự thay đổi quyền hạn của bản thân." },
        { status: 400 },
      );
    }

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await logAdminAction(userId, ADMIN_ACTIONS.USER_TOGGLE_ROLE, `user:${targetUserId}`, {
      previousRole: role === "admin" ? "user" : "admin",
      newRole: role,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: unknown) {
    console.error("Admin Users PATCH Error:", err);
    return NextResponse.json({ error: "Không thể cập nhật người dùng." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
