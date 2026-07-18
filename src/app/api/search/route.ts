import { NextRequest, NextResponse } from "next/server";
import { unifiedSearch, MediaSource } from "@/lib/unified-search";
import { getCurrentUserId } from "@/lib/session";
import { enforceRateLimit } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const limited = enforceRateLimit(`search:${userId}`, 60, 60_000);
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const rawType = searchParams.get("type");
    const type: "movie" | "tv" | "multi" =
      rawType === "movie" || rawType === "tv" ? rawType : "multi";
    const rawSources = searchParams.get("sources");
    const sources: MediaSource[] = rawSources
      ? (rawSources.split(",") as MediaSource[])
      : ["tmdb", "tvmaze"];
    const limit = Math.min(parseInt(searchParams.get("limit") || "15"), 30);

    if (!query.trim()) {
      return NextResponse.json({ error: "Tham số tìm kiếm 'q' là bắt buộc." }, { status: 400 });
    }

    // Get user API keys from cookies
    const userApiKey = req.cookies.get("tmdb_api_key")?.value;
    const omdbApiKey = req.cookies.get("omdb_api_key")?.value;

    const results = await unifiedSearch.search({
      query,
      type,
      sources,
      limit,
      tmdbApiKey: userApiKey,
      omdbApiKey,
    });

    return NextResponse.json({
      results,
      count: results.length,
      query,
    });
  } catch (err: unknown) {
    console.error("Unified Search Error:", err);
    const message = err instanceof Error ? err.message : "Không thể tìm kiếm.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
