import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { enforceRateLimit } from "@/lib/api-guard";
import { logAudit, clientIp } from "@/lib/audit";

type Ctx = { params: Promise<{ handle: string }> };

/** Toggle follow. Nếu đang follow → unfollow, ngược lại → follow. Trả về trạng thái mới + counts. */
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const me = await getCurrentUserId();
    if (!me) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const rl = enforceRateLimit(`community:follow:${me}`, 30, 60 * 1000);
    if (rl) return rl;

    const { handle } = await params;
    const target = await db.user.findUnique({
      where: { handle },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }
    if (target.id === me) {
      return NextResponse.json({ error: "Bạn không thể tự theo dõi chính mình." }, { status: 400 });
    }

    const existing = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: me, followingId: target.id } },
    });

    let following: boolean;
    if (existing) {
      await db.$transaction([
        db.follow.delete({ where: { id: existing.id } }),
        db.user.update({
          where: { id: me },
          data: { followingCount: { decrement: 1 } },
        }),
        db.user.update({
          where: { id: target.id },
          data: { followersCount: { decrement: 1 } },
        }),
      ]);
      following = false;
    } else {
      await db.$transaction([
        db.follow.create({ data: { followerId: me, followingId: target.id } }),
        db.user.update({
          where: { id: me },
          data: { followingCount: { increment: 1 } },
        }),
        db.user.update({
          where: { id: target.id },
          data: { followersCount: { increment: 1 } },
        }),
      ]);
      following = true;
      await notify({
        recipientId: target.id,
        actorId: me,
        kind: "user.follow",
      });
    }

    await logAudit(
      me,
      following ? "community.follow" : "community.unfollow",
      { target: target.id },
      clientIp(req),
    );

    return NextResponse.json({ following });
  } catch (err: unknown) {
    console.error("[users/follow] error:", err);
    return NextResponse.json({ error: "Không thể theo dõi." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
