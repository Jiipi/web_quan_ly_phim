import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { createPostSchema } from "@/lib/community-schema";
import { flattenFieldErrors } from "@/lib/auth-schemas";
import { enforceRateLimit } from "@/lib/api-guard";
import { logAudit, clientIp } from "@/lib/audit";
import { deriveHandle } from "@/lib/community-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/community/posts
 *
 * Body: multipart/form-data
 *   - metadata: JSON string (content, optional movieRef fields)
 *   - image: optional, tối đa 5MB, image/jpeg|png|webp
 *
 * Lưu post + upload ảnh (nếu có) + tăng postsCount denormalize.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const rl = enforceRateLimit(`community:post:${userId}`, 10, 60 * 60 * 1000);
    if (rl) return rl;

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Body phải là multipart/form-data hợp lệ." },
        { status: 400 },
      );
    }

    const rawMeta = form.get("metadata");
    if (typeof rawMeta !== "string") {
      return NextResponse.json(
        { error: "Thiếu trường 'metadata' (JSON string)." },
        { status: 400 },
      );
    }

    let meta: Record<string, unknown>;
    try {
      meta = JSON.parse(rawMeta);
    } catch {
      return NextResponse.json({ error: "Metadata không phải JSON hợp lệ." }, { status: 400 });
    }

    const parsed = createPostSchema.safeParse(meta);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Lưu ảnh (nếu có)
    let imagePath: string | null = null;
    const file = form.get("image");
    if (file instanceof File && file.size > 0) {
      if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
        return NextResponse.json(
          { error: `File "${file.name}" không phải định dạng ảnh được phép.` },
          { status: 400 },
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: `File "${file.name}" vượt quá 5MB.` }, { status: 400 });
      }
      const ext = mimeToExt(file.type);
      const safeName = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
      const dir = path.join(process.cwd(), "public", "uploads", "community", userId);
      await mkdir(dir, { recursive: true });
      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, safeName), buf);
      imagePath = `/uploads/community/${userId}/${safeName}`;
    }

    // Auto-fill imagePath từ schema (nếu client đã upload qua API riêng)
    const finalImagePath = imagePath ?? data.imagePath ?? null;

    // Đảm bảo user có handle (backfill user cũ chưa có)
    const me = await db.user.findUnique({
      where: { id: userId },
      select: { handle: true, name: true, email: true },
    });
    if (!me) {
      return NextResponse.json({ error: "Người dùng không tồn tại." }, { status: 404 });
    }
    if (!me.handle) {
      let handle = deriveHandle(me.email, me.name);
      // Nếu trùng thì thêm suffix random (best-effort)
      const exists = await db.user.findUnique({ where: { handle }, select: { id: true } });
      if (exists) handle = `${handle.slice(0, 24)}_${randomBytes(2).toString("hex")}`;
      await db.user.update({ where: { id: userId }, data: { handle } });
    }

    const post = await db.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          authorId: userId,
          content: data.content,
          imagePath: finalImagePath,
          movieRefType: data.movieRefType ?? null,
          movieRefTmdbId: data.movieRefTmdbId ?? null,
          movieRefTitle: data.movieRefTitle ?? null,
          movieRefPoster: data.movieRefPoster ?? null,
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { postsCount: { increment: 1 } },
      });
      return created;
    });

    await logAudit(userId, "community.post.create", { postId: post.id }, clientIp(req));

    return NextResponse.json({ success: true, post });
  } catch (err: unknown) {
    console.error("[community/posts POST] error:", err);
    return NextResponse.json({ error: "Không thể tạo bài viết." }, { status: 500 });
  }
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return "";
  }
}
