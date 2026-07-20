import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { logAudit, clientIp } from "@/lib/audit";
import { isAdmin } from "@/types/role";

type Ctx = { params: Promise<{ id: string }> };

/** Xoá comment. Chỉ author của comment hoặc admin. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }
    const { id } = await params;
    const comment = await db.comment.findUnique({
      where: { id },
      select: { id: true, authorId: true, postId: true },
    });
    if (!comment) {
      return NextResponse.json({ error: "Không tìm thấy bình luận." }, { status: 404 });
    }

    const me = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const admin = isAdmin(me?.role ?? "");
    if (comment.authorId !== userId && !admin) {
      return NextResponse.json({ error: "Bạn không có quyền xoá bình luận này." }, { status: 403 });
    }

    await db.$transaction(async (tx) => {
      await tx.comment.delete({ where: { id } });
      await tx.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      });
    });

    await logAudit(
      userId,
      "community.comment.delete",
      { commentId: id, postId: comment.postId },
      clientIp(req),
    );
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[community/comments DELETE] error:", err);
    return NextResponse.json({ error: "Không thể xoá bình luận." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
