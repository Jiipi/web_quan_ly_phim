import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { logAudit, clientIp } from "@/lib/audit";
import { isAdmin } from "@/types/role";

type Ctx = { params: Promise<{ id: string }> };

/** Lấy chi tiết 1 post kèm author + trạng thái likedByMe. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }
    const { id } = await params;
    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true, handle: true } },
        likes: { where: { userId }, select: { id: true } },
      },
    });
    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    }
    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        imagePath: post.imagePath,
        movieRefType: post.movieRefType,
        movieRefTmdbId: post.movieRefTmdbId,
        movieRefTitle: post.movieRefTitle,
        movieRefPoster: post.movieRefPoster,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        createdAt: post.createdAt.toISOString(),
        likedByMe: post.likes.length > 0,
        author: post.author,
      },
    });
  } catch (err: unknown) {
    console.error("[community/posts GET] error:", err);
    return NextResponse.json({ error: "Không thể tải bài viết." }, { status: 500 });
  }
}

/** Xoá post. Chỉ author hoặc admin. Cascade PostLike/Comment. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }
    const { id } = await params;
    const post = await db.post.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    }

    const me = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const admin = isAdmin(me?.role ?? "");
    if (post.authorId !== userId && !admin) {
      return NextResponse.json({ error: "Bạn không có quyền xoá bài viết này." }, { status: 403 });
    }

    await db.$transaction(async (tx) => {
      await tx.post.delete({ where: { id } });
      await tx.user.update({
        where: { id: post.authorId },
        data: { postsCount: { decrement: 1 } },
      });
    });

    await logAudit(
      userId,
      "community.post.delete",
      { postId: id, originalAuthor: post.authorId },
      clientIp(req),
    );
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[community/posts DELETE] error:", err);
    return NextResponse.json({ error: "Không thể xoá bài viết." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
