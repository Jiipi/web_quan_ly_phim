import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { parseMonth, monthBounds, toDateKey } from "@/lib/calendar";

// Nhật ký xem theo tháng (từ WatchSession). ?month=YYYY-MM (mặc định tháng hiện tại).
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const { year, month } = parseMonth(new URL(req.url).searchParams.get("month"));
    const { start, end } = monthBounds(year, month);

    const sessions = await db.watchSession.findMany({
      where: { userId, watchedAt: { gte: start, lt: end } },
      orderBy: { watchedAt: "desc" },
    });

    // WatchSession không có relation -> tra title theo watchItemId (1 truy vấn).
    const ids = [...new Set(sessions.map((s) => s.watchItemId))];
    const items = ids.length
      ? await db.watchItem.findMany({
          where: { id: { in: ids } },
          include: { mediaItem: { select: { title: true, posterPath: true } } },
        })
      : [];
    const titleMap = new Map(items.map((i) => [i.id, i.mediaItem.title]));

    const entries = sessions.map((s) => ({
      id: s.id,
      date: toDateKey(s.watchedAt),
      watchedAt: s.watchedAt.toISOString(),
      title: titleMap.get(s.watchItemId) ?? "Không rõ",
      episodeNumber: s.episodeNumber,
      mediaType: s.mediaType,
    }));

    return NextResponse.json({ year, month, entries });
  } catch (err: unknown) {
    console.error("Calendar Route Error:", err);
    return NextResponse.json({ error: "Không thể tải nhật ký." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
