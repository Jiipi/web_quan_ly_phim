import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { computeStats } from "@/lib/stats";

// Thống kê tổng hợp của user (KPIs + theo quốc gia/thể loại + lịch sử 7 ngày).
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const [items, sessions] = await Promise.all([
      db.watchItem.findMany({
        where: { userId },
        include: { mediaItem: { select: { runtime: true, genres: true, countries: true } } },
      }),
      db.watchSession.findMany({
        where: { userId },
        select: { watchedAt: true },
        orderBy: { watchedAt: "asc" },
      }),
    ]);

    const stats = computeStats(
      items.map((i) => ({
        status: i.status,
        currentEpisode: i.currentEpisode,
        mediaItem: {
          runtime: i.mediaItem.runtime,
          genres: i.mediaItem.genres,
          countries: i.mediaItem.countries,
        },
      })),
      sessions,
    );

    return NextResponse.json(stats);
  } catch (err: unknown) {
    console.error("Stats Route Error:", err);
    return NextResponse.json({ error: "Không thể tải thống kê." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
