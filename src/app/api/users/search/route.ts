import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * GET /api/users/search?q=...
 * Trả về tối đa 10 user match theo name/handle (autocomplete).
 * Bỏ qua chính mình.
 */
export async function GET(req: NextRequest) {
  try {
    const me = await getCurrentUserId();
    if (!me) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    if (q.length < 2) {
      return NextResponse.json({ users: [] });
    }
    const users = await db.user.findMany({
      where: {
        id: { not: me },
        OR: [
          { handle: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        handle: true,
        image: true,
      },
      take: 10,
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ users });
  } catch (err: unknown) {
    console.error("[users/search] error:", err);
    return NextResponse.json({ error: "Không thể tìm kiếm." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
