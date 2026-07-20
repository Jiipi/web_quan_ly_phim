import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { createCommentSchema, commentListQuerySchema } from "@/lib/community-schema";
import { flattenFieldErrors } from "@/lib/auth-schemas";
import { enforceRateLimit } from "@/lib/api-guard";
import { notify } from "@/lib/notifications";
import { logAudit, clientIp } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

/** List comment theo post (oldest first, cursor theo createdAt). */
export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }
    const { id } = await params;
    const post = await db.post.findUnique({ where: { id }, select: { id: true } });
    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    }

    const url = new URL(req.url);
    const parsed = commentListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Query không hợp lệ.", fieldErrors: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { cursor, limit } = parsed.data;

    const comments = await db.comment.findMany({
      where: { postId: id, ...(cursor ? { id: { gt: cursor } } : {}) },
      include: { author: { select: { id: true, name: true, image: true, handle: true } } },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
    });

    const hasMore = comments.length > limit;
    const items = (hasMore ? comments.slice(0, limit) : comments).map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      authorId: c.authorId,
      author: c.author,
    }));
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({ comments: items, nextCursor });
  } catch (err: unknown) {
    console.error("[community/comments GET] error:", err);
    return NextResponse.json({ error: "Không thể tải bình luận." }, { status: 500 });
  }
}

/** Tạo comment mới vào post. */
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const rl = enforceRateLimit(`community:comment:${userId}`, 30, 60 * 60 * 1000);
    if (rl) return rl;

    const { id } = await params;
    const post = await db.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    }

    const parsed = createCommentSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const comment = await db.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: {
          postId: id,
          authorId: userId,
          content: parsed.data.content,
        },
        include: {
          author: { select: { id: true, name: true, image: true, handle: true } },
        },
      });
      await tx.post.update({
        where: { id },
        data: { commentCount: { increment: 1 } },
      });
      return created;
    });

    await notify({
      recipientId: post.authorId,
      actorId: userId,
      kind: "post.comment",
      postId: id,
      commentId: comment.id,
    });

    await logAudit(
      userId,
      "community.comment.create",
      { postId: id, commentId: comment.id },
      clientIp(req),
    );

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        authorId: comment.authorId,
        author: comment.author,
      },
    });
  } catch (err: unknown) {
    console.error("[community/comments POST] error:", err);
    return NextResponse.json({ error: "Không thể gửi bình luận." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
