import { z } from "zod";

/**
 * Schema validate form "Báo lỗi" phía server.
 * Client dùng cùng schema để hiển thị lỗi inline trước khi gửi.
 */

export const BUG_REPORT_CATEGORIES = ["bug", "ui", "content", "other"] as const;
export type BugReportCategory = (typeof BUG_REPORT_CATEGORIES)[number];

export const BUG_REPORT_CATEGORY_LABELS: Record<BugReportCategory, string> = {
  bug: "Lỗi chức năng",
  ui: "Giao diện / hiển thị",
  content: "Nội dung / dữ liệu phim",
  other: "Khác",
};

// Subject: 1-200 ký tự, không chỉ whitespace.
const subjectField = z
  .string()
  .trim()
  .min(3, "Tiêu đề quá ngắn (tối thiểu 3 ký tự)")
  .max(200, "Tiêu đề tối đa 200 ký tự");

// Description: 10-4000 ký tự — đủ chi tiết để debug, không quá dài.
const descriptionField = z
  .string()
  .trim()
  .min(10, "Mô tả tối thiểu 10 ký tự")
  .max(4000, "Mô tả tối đa 4000 ký tự");

export const bugReportMetadataSchema = z.object({
  category: z.enum(BUG_REPORT_CATEGORIES, {
    message: "Vui lòng chọn loại lỗi hợp lệ",
  }),
  subject: subjectField,
  description: descriptionField,
});

export type BugReportMetadataInput = z.infer<typeof bugReportMetadataSchema>;

/**
 * Metadata đi kèm trong FormData (multipart/form-data) kèm route handler.
 * Route handler parse JSON từ trường "metadata" rồi validate bằng schema trên.
 */
export const bugReportFormMetadataSchema = z
  .string()
  .min(2, "Thiếu metadata")
  .transform((s, ctx) => {
    try {
      return JSON.parse(s) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Metadata phải là JSON hợp lệ" });
      return z.NEVER;
    }
  })
  .pipe(bugReportMetadataSchema);

/** Giới hạn upload ảnh: tối đa 3 file, mỗi file <= 3MB, chỉ image/* */
export const BUG_REPORT_MAX_FILES = 3;
export const BUG_REPORT_MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
export const BUG_REPORT_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
