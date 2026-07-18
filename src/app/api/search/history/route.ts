import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    const history = await db.searchHistory.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Aggregate and deduplicate
    const queryMap = new Map<string, { query: string; type: string | null; frequency: number; createdAt: Date }>();
    
    for (const item of history) {
      if (!queryMap.has(item.query)) {
        queryMap.set(item.query, {
          query: item.query,
          type: item.type,
          frequency: 1,
          createdAt: item.createdAt,
        });
      } else {
        const existing = queryMap.get(item.query)!;
        existing.frequency++;
        if (item.createdAt > existing.createdAt) {
          existing.createdAt = item.createdAt;
        }
      }
    }

    const results = Array.from(queryMap.values())
      .sort((a, b) => b.frequency - a.frequency || b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map((r) => ({ query: r.query, type: r.type }));

    return NextResponse.json({ results });
  } catch (err: unknown) {
    console.error("Search History GET Error:", err);
    const message = err instanceof Error ? err.message : "Không thể lấy lịch sử.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const body = await req.json();
    const { query, type } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Query là bắt buộc." }, { status: 400 });
    }

    await db.searchHistory.create({
      data: {
        userId,
        query: query.trim(),
        type: type || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Search History POST Error:", err);
    const message = err instanceof Error ? err.message : "Không thể lưu lịch sử.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (query) {
      await db.searchHistory.deleteMany({
        where: { userId, query },
      });
    } else {
      await db.searchHistory.deleteMany({
        where: { userId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Search History DELETE Error:", err);
    const message = err instanceof Error ? err.message : "Không thể xóa lịch sử.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
