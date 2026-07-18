import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { addListItemSchema, reorderListSchema } from "@/lib/list-schema";

type Ctx = { params: Promise<{ id: string }> };

async function assertOwnedList(userId: string, listId: string) {
  const list = await db.customList.findUnique({ where: { id: listId } });
  return list && list.userId === userId ? list : null;
}

// Thêm phim vào danh sách.
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { id } = await params;
    if (!(await assertOwnedList(userId, id))) {
      return NextResponse.json({ error: "Không tìm thấy danh sách." }, { status: 404 });
    }

    const parsed = addListItemSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Thiếu mediaItemId." }, { status: 400 });
    }

    const media = await db.mediaItem.findUnique({ where: { id: parsed.data.mediaItemId } });
    if (!media) return NextResponse.json({ error: "Không tìm thấy phim." }, { status: 404 });

    const count = await db.listItem.count({ where: { customListId: id } });
    const item = await db.listItem.create({
      data: { customListId: id, mediaItemId: parsed.data.mediaItemId, position: count },
    });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Phim đã có trong danh sách." }, { status: 409 });
    }
    console.error("List items POST Route Error:", err);
    return NextResponse.json({ error: "Không thể thêm phim." }, { status: 500 });
  }
}

// Đổi thứ tự phim trong danh sách.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { id } = await params;
    if (!(await assertOwnedList(userId, id))) {
      return NextResponse.json({ error: "Không tìm thấy danh sách." }, { status: 404 });
    }

    const parsed = reorderListSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu thứ tự không hợp lệ." }, { status: 400 });
    }

    await db.$transaction(
      parsed.data.orderedMediaItemIds.map((mediaItemId, index) =>
        db.listItem.updateMany({
          where: { customListId: id, mediaItemId },
          data: { position: index },
        }),
      ),
    );
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("List items PATCH Route Error:", err);
    return NextResponse.json({ error: "Không thể đổi thứ tự." }, { status: 500 });
  }
}

// Gỡ phim khỏi danh sách. ?mediaItemId=...
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { id } = await params;
    if (!(await assertOwnedList(userId, id))) {
      return NextResponse.json({ error: "Không tìm thấy danh sách." }, { status: 404 });
    }

    const mediaItemId = new URL(req.url).searchParams.get("mediaItemId");
    if (!mediaItemId) return NextResponse.json({ error: "Thiếu mediaItemId." }, { status: 400 });

    await db.listItem.deleteMany({ where: { customListId: id, mediaItemId } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("List items DELETE Route Error:", err);
    return NextResponse.json({ error: "Không thể gỡ phim." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
