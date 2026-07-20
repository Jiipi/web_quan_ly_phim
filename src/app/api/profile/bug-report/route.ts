import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  bugReportFormMetadataSchema,
  BUG_REPORT_ALLOWED_MIME,
  BUG_REPORT_CATEGORY_LABELS,
  BUG_REPORT_MAX_FILES,
  BUG_REPORT_MAX_FILE_SIZE_BYTES,
} from "@/lib/bug-report-schema";
import { sendBugReportEmail, getReportTo } from "@/lib/mailer";
import { enforceRateLimit } from "@/lib/api-guard";
import { features } from "@/lib/env";
import { logAudit } from "@/lib/audit";

// Tăng giới hạn body: route nhận multipart có thể có nhiều file ảnh.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/profile/bug-report
 *
 * Body: multipart/form-data
 *   - metadata: JSON string (category, subject, description)
 *   - attachments[]: optional, tối đa 3 file ảnh (image/*, <=3MB)
 *
 * Response 200: { ok: true, reportId, emailSent }
 * Response 4xx/5xx: { error, fieldErrors? }
 *
 * Lưu ý:
 *  - Bắt buộc đăng nhập (401 nếu thiếu).
 *  - Rate-limit: 5 báo cáo / 10 phút / user.
 *  - Luôn LƯU DB trước. Nếu gửi mail lỗi, vẫn trả 200 với emailSent=false (DB đã ghi nhận).
 *  - Nếu mailer chưa cấu hình: vẫn lưu DB, emailSent=false, emailError giải thích.
 */
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
  }

  // Rate-limit theo user
  const rl = enforceRateLimit(`bug-report:${userId}`, 5, 10 * 60 * 1000);
  if (rl) return rl;

  // Parse form-data
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
    return NextResponse.json({ error: "Thiếu trường 'metadata' (JSON string)." }, { status: 400 });
  }

  const parsedMeta = bugReportFormMetadataSchema.safeParse(rawMeta);
  if (!parsedMeta.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ.", fieldErrors: parsedMeta.error.flatten() },
      { status: 400 },
    );
  }
  const meta = parsedMeta.data;

  // Lấy files
  const fileEntries = form.getAll("attachments").filter((f): f is File => f instanceof File);
  if (fileEntries.length > BUG_REPORT_MAX_FILES) {
    return NextResponse.json(
      { error: `Tối đa ${BUG_REPORT_MAX_FILES} file đính kèm.` },
      { status: 400 },
    );
  }

  // Validate mime/size + lưu file
  const savedPaths: string[] = [];
  for (const file of fileEntries) {
    if (!BUG_REPORT_ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: `File "${file.name}" không phải định dạng ảnh được phép.` },
        { status: 400 },
      );
    }
    if (file.size > BUG_REPORT_MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: `File "${file.name}" vượt quá 3MB.` }, { status: 400 });
    }
    if (file.size === 0) continue;

    const ext = mimeToExt(file.type);
    const safeName = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "bug-reports", userId);
    await mkdir(dir, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, safeName), buf);
    savedPaths.push(`/uploads/bug-reports/${userId}/${safeName}`);
  }

  // Lưu DB
  let reportId: string;
  try {
    const created = await db.bugReport.create({
      data: {
        userId,
        category: meta.category,
        subject: meta.subject,
        description: meta.description,
        attachments: savedPaths,
        emailSent: false,
      },
      select: { id: true },
    });
    reportId = created.id;
  } catch (err) {
    console.error("[bug-report] DB create failed:", err);
    return NextResponse.json(
      { error: "Không thể lưu báo lỗi. Vui lòng thử lại." },
      { status: 500 },
    );
  }

  // Gửi mail (best-effort — lỗi không rollback DB)
  let emailSent = false;
  let emailError: string | null = null;

  if (features.mailerReady) {
    const session = await auth();
    const userName = session?.user?.name ?? "Người dùng";
    const userEmail = session?.user?.email ?? "";

    const result = await sendBugReportEmail({
      category: BUG_REPORT_CATEGORY_LABELS[meta.category],
      subject: meta.subject,
      description: meta.description,
      userEmail,
      userName,
      attachmentPaths: savedPaths,
    });

    emailSent = result.ok;
    emailError = result.ok ? null : (result.error ?? "Unknown error");

    // Cập nhật DB với trạng thái gửi mail
    try {
      await db.bugReport.update({
        where: { id: reportId },
        data: { emailSent, emailError },
      });
    } catch (err) {
      console.error("[bug-report] Failed to persist email status:", err);
    }

    await logAudit(userId, "bug-report.submit", { reportId, emailSent });
  } else {
    // Mailer chưa cấu hình — vẫn ghi log để admin biết
    emailError = `Mailer chưa cấu hình (thiếu GMAIL_USER/GMAIL_APP_PASSWORD). Báo cáo được lưu DB (id=${reportId}). GMAIL_REPORT_TO mặc định sẽ là: ${getReportTo() || "(chưa đặt)"}.`;
    await logAudit(userId, "bug-report.submit", {
      reportId,
      emailSent: false,
      reason: "mailer-not-configured",
    });
  }

  return NextResponse.json({
    ok: true,
    reportId,
    emailSent,
    ...(emailSent ? {} : { emailError }),
  });
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}
