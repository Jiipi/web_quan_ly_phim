import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { createListSchema } from "@/lib/list-schema";
import { flattenFieldErrors } from "@/lib/auth-schemas";

// Danh sách tùy chỉnh của user (kèm số lượng phim).
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

  const lists = await db.customList.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(
    lists.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      isPublic: l.isPublic,
      itemCount: l._count.items,
    })),
  );
}

// Tạo danh sách mới.
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const parsed = createListSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const list = await db.customList.create({
      data: {
        userId,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        isPublic: parsed.data.isPublic ?? false,
      },
    });
    return NextResponse.json({ success: true, list }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Bạn đã có danh sách trùng tên." }, { status: 409 });
    }
    console.error("Lists POST Route Error:", err);
    return NextResponse.json({ error: "Không thể tạo danh sách." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
