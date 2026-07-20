import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { enforceRateLimit } from "@/lib/api-guard";
import { logAudit, clientIp } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

/** Toggle like. Nếu đã like → unlike, ngược lại → like. Trả về trạng thái mới. */
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const rl = enforceRateLimit(`community:like:${userId}`, 60, 60 * 1000);
    if (rl) return rl;

    const { id } = await params;
    const post = await db.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    }

    const existing = await db.postLike.findUnique({
      where: { postId_userId: { postId: id, userId } },
    });

    let liked: boolean;
    if (existing) {
      await db.$transaction([
        db.postLike.delete({ where: { id: existing.id } }),
        db.post.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      liked = false;
    } else {
      await db.$transaction([
        db.postLike.create({ data: { postId: id, userId } }),
        db.post.update({
          where: { id },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      liked = true;
      // Notify author (skip self)
      await notify({
        recipientId: post.authorId,
        actorId: userId,
        kind: "post.like",
        postId: id,
      });
    }

    await logAudit(
      userId,
      liked ? "community.post.like" : "community.post.unlike",
      { postId: id },
      clientIp(req),
    );

    return NextResponse.json({ liked });
  } catch (err: unknown) {
    console.error("[community/like] error:", err);
    return NextResponse.json({ error: "Không thể thích bài viết." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
