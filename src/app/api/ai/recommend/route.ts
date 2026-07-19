import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { tmdb } from "@/lib/tmdb";
import { getAIProvider } from "@/lib/ai";
import { enforceRateLimit } from "@/lib/api-guard";
import { logAudit, clientIp } from "@/lib/audit";

const bodySchema = z.object({ mood: z.string().max(100).optional() });

interface ResolvedRec {
  title: string;
  reason: string;
  matchScore: number;
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  posterPath?: string | null;
}

// Sinh gợi ý phim theo gu + tâm trạng, cố gắng resolve tựa -> TMDb để thêm nhanh.
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const limited = enforceRateLimit(`ai:${userId}`, 30, 60_000);
    if (limited) return limited;

    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    const mood = parsed.success ? parsed.data.mood : undefined;

    const [pref, items] = await Promise.all([
      db.userPreference.findUnique({ where: { userId } }),
      db.watchItem.findMany({ where: { userId }, include: { mediaItem: true }, take: 100 }),
    ]);

    const provider = getAIProvider();
    const result = await provider.recommend({
      mood,
      favGenres: pref?.favGenres ?? [],
      favCountries: pref?.favCountries ?? [],
      preferTvShows: pref?.preferTvShows ?? false,
      libraryTitles: items.map((i) => i.mediaItem.title),
    });

    // Resolve tựa -> TMDb (best-effort, song song). Thất bại -> rec dạng text-only.
    const resolved: ResolvedRec[] = await Promise.all(
      result.recommendations.map(async (r) => {
        try {
          const hits = await tmdb.search(r.title, "multi");
          const top = hits[0];
          if (top) {
            return {
              ...r,
              tmdbId: top.id,
              mediaType: top.mediaType,
              posterPath: top.posterPath,
            };
          }
        } catch {
          // bỏ qua lỗi resolve
        }
        return { ...r };
      }),
    );

    // Lưu lịch sử gợi ý (Json). Round-trip để loại undefined + hợp kiểu Json.
    const responseJson = JSON.parse(JSON.stringify(resolved));
    await db.aIRecommendation.create({
      data: { userId, query: mood ?? null, response: responseJson },
    });

    await logAudit(userId, "ai.recommend", { mood: mood ?? null }, clientIp(req));
    return NextResponse.json({ success: true, provider: provider.name, recommendations: resolved });
  } catch (err: unknown) {
    console.error("AI Recommend Route Error:", err);
    return NextResponse.json({ error: "Không thể tạo gợi ý AI." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
