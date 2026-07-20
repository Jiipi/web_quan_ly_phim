import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { notificationListQuerySchema, markReadSchema } from "@/lib/community-schema";
import { flattenFieldErrors } from "@/lib/auth-schemas";

export const dynamic = "force-dynamic";

/** GET /api/notifications?unreadOnly=true&limit=30 */
export async function GET(req: NextRequest) {
  try {
    const me = await getCurrentUserId();
    if (!me) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }
    const url = new URL(req.url);
    const parsed = notificationListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Query không hợp lệ.", fieldErrors: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { unreadOnly, limit } = parsed.data;

    const [items, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: {
          recipientId: me,
          ...(unreadOnly ? { readAt: null } : {}),
        },
        include: {
          actor: { select: { id: true, name: true, image: true, handle: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.notification.count({
        where: { recipientId: me, readAt: null },
      }),
    ]);

    return NextResponse.json({
      notifications: items.map((n) => ({
        id: n.id,
        kind: n.kind,
        postId: n.postId,
        commentId: n.commentId,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
        actor: n.actor,
      })),
      unreadCount,
    });
  } catch (err: unknown) {
    console.error("[notifications GET] error:", err);
    return NextResponse.json({ error: "Không thể tải thông báo." }, { status: 500 });
  }
}

/** PATCH /api/notifications — mark read: { ids: [...] } | { all: true } */
export async function PATCH(req: NextRequest) {
  try {
    const me = await getCurrentUserId();
    if (!me) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }
    const parsed = markReadSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const where: { recipientId: string; id?: { in: string[] }; readAt?: null } = {
      recipientId: me,
    };
    if (parsed.data.ids?.length) {
      where.id = { in: parsed.data.ids };
    } else if (parsed.data.all) {
      where.readAt = null;
    }

    const result = await db.notification.updateMany({
      where,
      data: { readAt: new Date() },
    });
    return NextResponse.json({ updated: result.count });
  } catch (err: unknown) {
    console.error("[notifications PATCH] error:", err);
    return NextResponse.json({ error: "Không thể cập nhật." }, { status: 500 });
  }
}
