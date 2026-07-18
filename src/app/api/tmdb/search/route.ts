import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb";
import { getCurrentUserId } from "@/lib/session";
import { enforceRateLimit } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const limited = enforceRateLimit(`tmdb:${userId}`, 60, 60_000);
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const rawType = searchParams.get("type");
    const type: "movie" | "tv" | "multi" =
      rawType === "movie" || rawType === "tv" ? rawType : "multi";

    if (!query.trim()) {
      return NextResponse.json({ error: "Tham số tìm kiếm 'q' là bắt buộc." }, { status: 400 });
    }

    const userApiKey = req.cookies.get("tmdb_api_key")?.value;

    const results = await tmdb.search(query, type, userApiKey);
    return NextResponse.json(results);
  } catch (err: unknown) {
    console.error("TMDb Route Search Error:", err);
    const message = err instanceof Error ? err.message : "Không thể tìm kiếm phim.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
