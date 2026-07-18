import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai";
import { enforceRateLimit } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit";

// Lấy taste profile đã lưu (nếu có).
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

  const saved = await db.tasteProfile.findUnique({ where: { userId } });
  if (!saved) return NextResponse.json(null);
  return NextResponse.json({ profileText: saved.profileText, ...(saved.visualData as object) });
}

// Phân tích gu xem phim từ thư viện + điểm đã chấm, lưu TasteProfile.
export async function POST() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const limited = enforceRateLimit(`ai:${userId}`, 30, 60_000);
    if (limited) return limited;

    const items = await db.watchItem.findMany({
      where: { userId },
      include: { mediaItem: true },
      take: 500,
    });

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Thư viện trống — hãy thêm và chấm điểm vài phim trước." },
        { status: 400 },
      );
    }

    const genres = items.flatMap((i) => i.mediaItem.genres);
    const countries = items.flatMap((i) => i.mediaItem.countries);
    const ratedTitles = items
      .filter((i) => i.personalScore != null)
      .map((i) => ({ title: i.mediaItem.title, score: i.personalScore as number }));

    const provider = getAIProvider();
    const result = await provider.tasteProfile({ genres, countries, ratedTitles });

    const visualData = { topGenres: result.topGenres, topCountries: result.topCountries };
    await db.tasteProfile.upsert({
      where: { userId },
      update: { profileText: result.profileText, visualData },
      create: { userId, profileText: result.profileText, visualData },
    });

    await logAudit(userId, "ai.taste-profile");
    return NextResponse.json({ success: true, provider: provider.name, ...result });
  } catch (err: unknown) {
    console.error("AI Taste Profile Route Error:", err);
    return NextResponse.json({ error: "Không thể phân tích gu xem phim." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
