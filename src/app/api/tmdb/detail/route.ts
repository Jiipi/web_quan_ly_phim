import { NextRequest, NextResponse } from "next/server";
import { getMediaDetail } from "@/lib/media-detail";
import { getCurrentUserId } from "@/lib/session";
import { enforceRateLimit } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const limited = enforceRateLimit(`tmdb-detail:${userId}`, 60, 60_000);
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type || (type !== "movie" && type !== "tv")) {
      return NextResponse.json(
        { error: "Tham số 'id' và 'type' (movie/tv) là bắt buộc." },
        { status: 400 },
      );
    }

    const tmdbId = Number(id);
    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: "Tham số 'id' phải là một số." }, { status: 400 });
    }

    const userApiKey = req.cookies.get("tmdb_api_key")?.value;

    const detail = await getMediaDetail(tmdbId, type, userApiKey);
    if (!detail) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin chi tiết phim." },
        { status: 404 },
      );
    }

    return NextResponse.json(detail);
  } catch (err: unknown) {
    console.error("TMDb Route Detail Error:", err);
    const message = err instanceof Error ? err.message : "Không thể lấy chi tiết phim.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
