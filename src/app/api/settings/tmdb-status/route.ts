import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { enforceRateLimit } from "@/lib/api-guard";

/**
 * Trả về trạng thái thật của TMDb API key đang dùng.
 * KHÔNG bao giờ trả về key — chỉ metadata.
 *
 * - serverKeyConfigured: server có TMDB_API_KEY trong .env không
 * - userKeySet: client có gửi cookie tmdb_api_key không
 * - activeSource: "user" | "server" | "mock"
 * - lastCheckedAt: ISO timestamp, dùng để debug
 */
export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
  }

  const limited = enforceRateLimit(`tmdb-status:${userId}`, 30, 60_000);
  if (limited) return limited;

  const serverKey = Boolean(process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.length > 0);
  const userKey = Boolean(req.cookies.get("tmdb_api_key")?.value);

  const activeSource: "user" | "server" | "mock" = userKey ? "user" : serverKey ? "server" : "mock";

  return NextResponse.json({
    serverKeyConfigured: serverKey,
    userKeySet: userKey,
    activeSource,
    lastCheckedAt: new Date().toISOString(),
  });
}

export const dynamic = "force-dynamic";
