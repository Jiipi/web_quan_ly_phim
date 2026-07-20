import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ handle: string }> };

/**
 * GET /api/users/[handle]
 * Trả về public profile: avatar/name/bio/counts + trạng thái follow của mình.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const me = await getCurrentUserId();
    if (!me) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }
    const { handle } = await params;
    const user = await db.user.findUnique({
      where: { handle },
      select: {
        id: true,
        name: true,
        handle: true,
        image: true,
        bio: true,
        createdAt: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    const followingEdge = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: me, followingId: user.id } },
      select: { id: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        handle: user.handle,
        image: user.image,
        bio: user.bio,
        joinedAt: user.createdAt.toISOString(),
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        isMe: user.id === me,
        isFollowing: !!followingEdge,
      },
    });
  } catch (err: unknown) {
    console.error("[users/handle GET] error:", err);
    return NextResponse.json({ error: "Không thể tải hồ sơ." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
