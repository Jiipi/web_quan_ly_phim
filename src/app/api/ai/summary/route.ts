import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai";
import { flattenFieldErrors } from "@/lib/auth-schemas";
import { enforceRateLimit } from "@/lib/api-guard";
import { logAudit, clientIp } from "@/lib/audit";

const bodySchema = z.object({ watchItemId: z.string().min(1) });

/** Kiểm tra watchItem thuộc về user; trả về watchItem+mediaItem hoặc null. */
async function getOwnedWatchItem(userId: string, watchItemId: string) {
  const wi = await db.watchItem.findUnique({
    where: { id: watchItemId },
    include: { mediaItem: true },
  });
  return wi && wi.userId === userId ? wi : null;
}

// Lấy tóm tắt đã lưu (nếu có) cho một watchItem.
export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
  }
  const watchItemId = new URL(req.url).searchParams.get("watchItemId");
  if (!watchItemId) {
    return NextResponse.json({ error: "Thiếu watchItemId." }, { status: 400 });
  }
  const wi = await getOwnedWatchItem(userId, watchItemId);
  if (!wi) {
    return NextResponse.json({ error: "Không tìm thấy phim." }, { status: 404 });
  }
  const saved = await db.aISummary.findUnique({ where: { watchItemId } });
  if (!saved) return NextResponse.json(null);
  return NextResponse.json({
    summary: saved.summaryText,
    characters: JSON.parse(saved.charactersInfo || "[]"),
    conflicts: JSON.parse(saved.conflictsInfo || "[]"),
    episodeNumber: saved.episodeNumber,
  });
}

// Sinh tóm tắt không spoil + lưu vào AISummary.
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const limited = enforceRateLimit(`ai:${userId}`, 30, 60_000);
    if (limited) return limited;

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const watchItem = await getOwnedWatchItem(userId, parsed.data.watchItemId);
    if (!watchItem) {
      return NextResponse.json(
        { error: "Không tìm thấy phim trong thư viện của bạn." },
        { status: 404 },
      );
    }

    const provider = getAIProvider();
    const summary = await provider.summarize({
      title: watchItem.mediaItem.title,
      originalTitle: watchItem.mediaItem.originalTitle,
      mediaType: watchItem.mediaItem.mediaType === "tv" ? "tv" : "movie",
      currentEpisode: watchItem.currentEpisode,
      totalEpisodes: watchItem.totalEpisodes,
      overview: watchItem.mediaItem.overview ?? undefined,
    });

    // Lưu lịch sử tóm tắt (upsert theo watchItemId).
    await db.aISummary.upsert({
      where: { watchItemId: watchItem.id },
      update: {
        episodeNumber: watchItem.currentEpisode,
        summaryText: summary.summary,
        charactersInfo: JSON.stringify(summary.characters),
        conflictsInfo: JSON.stringify(summary.conflicts),
      },
      create: {
        watchItemId: watchItem.id,
        episodeNumber: watchItem.currentEpisode,
        summaryText: summary.summary,
        charactersInfo: JSON.stringify(summary.characters),
        conflictsInfo: JSON.stringify(summary.conflicts),
      },
    });

    await logAudit(userId, "ai.summary", { watchItemId: watchItem.id }, clientIp(req));
    return NextResponse.json({ success: true, provider: provider.name, summary });
  } catch (err: unknown) {
    console.error("AI Summary Route Error:", err);
    return NextResponse.json({ error: "Không thể tạo tóm tắt AI." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
