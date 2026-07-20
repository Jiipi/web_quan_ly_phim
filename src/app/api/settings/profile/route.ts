import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// GET /api/settings/profile — return current user profile
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    const [watchItems, reviews, ratings] = await Promise.all([
      db.watchItem.count({ where: { userId } }).catch(() => 0),
      db.review.count({ where: { userId } }).catch(() => 0),
      db.rating.count({ where: { userId } }).catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      profile: {
        ...user,
        memberSince: user.createdAt.toISOString(),
        stats: {
          watchItems,
          reviews,
          ratings,
        },
      },
    });
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ." }, { status: 500 });
  }
}

// PATCH /api/settings/profile — update name, bio, or avatar
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    // Handle multipart form data (avatar upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("avatar") as File | null;
      const name = formData.get("name") as string | null;
      const bio = formData.get("bio") as string | null;

      const updateData: Record<string, unknown> = {};

      // Process avatar file
      if (file && file.size > 0) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: "Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF." },
            { status: 400 },
          );
        }
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ error: "Kích thước ảnh tối đa là 2MB." }, { status: 400 });
        }

        // Determine file extension from mime
        const extMap: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "image/gif": "gif",
        };
        const ext = extMap[file.type] || "jpg";
        const filename = `${userId}.${ext}`;

        // Ensure directory exists
        await mkdir(AVATAR_DIR, { recursive: true });

        // Write file
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(AVATAR_DIR, filename);
        await writeFile(filePath, buffer);

        // Store URL with cache-busting timestamp
        updateData.image = `/uploads/avatars/${filename}?t=${Date.now()}`;
      }

      // Process text fields
      if (name !== null && name !== undefined) {
        const trimmedName = name.trim();
        if (trimmedName.length > 50) {
          return NextResponse.json({ error: "Tên hiển thị tối đa 50 ký tự." }, { status: 400 });
        }
        if (trimmedName.length > 0) {
          updateData.name = trimmedName;
        }
      }

      if (bio !== null && bio !== undefined) {
        if (bio.length > 500) {
          return NextResponse.json({ error: "Tiểu sử tối đa 500 ký tự." }, { status: 400 });
        }
        updateData.bio = bio;
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "Không có dữ liệu để cập nhật." }, { status: 400 });
      }

      const updated = await db.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, name: true, email: true, image: true, bio: true },
      });

      return NextResponse.json({ success: true, profile: updated });
    }

    // Handle JSON body (name/bio only, no file)
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Body không hợp lệ." }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const trimmedName = String(body.name).trim();
      if (trimmedName.length > 50) {
        return NextResponse.json({ error: "Tên tối đa 50 ký tự." }, { status: 400 });
      }
      if (trimmedName.length > 0) {
        updateData.name = trimmedName;
      }
    }

    if (body.bio !== undefined) {
      if (String(body.bio).length > 500) {
        return NextResponse.json({ error: "Tiểu sử tối đa 500 ký tự." }, { status: 400 });
      }
      updateData.bio = body.bio;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Không có dữ liệu cập nhật." }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, image: true, bio: true },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    console.error("Profile PATCH error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
