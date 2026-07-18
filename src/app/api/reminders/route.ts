import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { createReminderSchema, isForgotten } from "@/lib/reminders";
import { findOwnedWatchItem } from "@/lib/watch-item-access";

// Danh sách nhắc đang chờ + các phim bị bỏ quên (>7 ngày chưa xem).
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

  const [reminders, active] = await Promise.all([
    db.reminder.findMany({
      where: { userId, status: "scheduled" },
      orderBy: { remindAt: "asc" },
      include: { watchItem: { include: { mediaItem: { select: { title: true } } } } },
    }),
    db.watchItem.findMany({
      where: { userId, status: { in: ["watching", "paused"] } },
      include: { mediaItem: { select: { title: true, tmdbId: true, mediaType: true } } },
    }),
  ]);

  const forgotten = active
    .filter((i) => isForgotten(i.lastWatchedAt))
    .map((i) => ({
      watchItemId: i.id,
      title: i.mediaItem.title,
      tmdbId: i.mediaItem.tmdbId,
      mediaType: i.mediaItem.mediaType,
      lastWatchedAt: i.lastWatchedAt?.toISOString() ?? null,
    }));

  return NextResponse.json({
    reminders: reminders.map((r) => ({
      id: r.id,
      watchItemId: r.watchItemId,
      title: r.watchItem.mediaItem.title,
      message: r.message,
      remindAt: r.remindAt.toISOString(),
    })),
    forgotten,
  });
}

// Tạo nhắc xem tiếp cho một phim.
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const parsed = createReminderSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const watchItem = await findOwnedWatchItem(userId, parsed.data.watchItemId);
    if (!watchItem) {
      return NextResponse.json({ error: "Không tìm thấy phim." }, { status: 404 });
    }

    const media = await db.mediaItem.findUnique({
      where: { id: watchItem.mediaItemId },
      select: { title: true },
    });
    const remindAt = new Date(Date.now() + (parsed.data.remindInDays ?? 3) * 24 * 60 * 60 * 1000);

    const reminder = await db.reminder.create({
      data: {
        userId,
        watchItemId: parsed.data.watchItemId,
        remindAt,
        message: parsed.data.message ?? `Xem tiếp "${media?.title ?? "phim"}"`,
        status: "scheduled",
      },
    });
    return NextResponse.json({ success: true, reminder }, { status: 201 });
  } catch (err: unknown) {
    console.error("Reminders POST Route Error:", err);
    return NextResponse.json({ error: "Không thể tạo nhắc." }, { status: 500 });
  }
}

// Bỏ nhắc (xoá). ?id=...
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Thiếu id." }, { status: 400 });

    const existing = await db.reminder.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Không tìm thấy nhắc." }, { status: 404 });
    }

    await db.reminder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Reminders DELETE Route Error:", err);
    return NextResponse.json({ error: "Không thể xoá nhắc." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
