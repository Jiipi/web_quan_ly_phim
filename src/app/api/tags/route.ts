import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";

// GET - Lấy tất cả tags của user
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

  const tags = await db.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { mediaTags: true },
      },
    },
  });

  return NextResponse.json(tags);
}

// POST - Tạo tag mới
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { name, color } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Tên tag không hợp lệ." }, { status: 400 });
    }

    const tag = await db.tag.create({
      data: {
        userId,
        name: name.trim(),
        color: color || "#DC2626",
      },
    });

    return NextResponse.json({ success: true, tag });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Tag đã tồn tại." }, { status: 409 });
    }
    console.error("Tags POST Error:", err);
    return NextResponse.json({ error: "Không thể tạo tag." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
