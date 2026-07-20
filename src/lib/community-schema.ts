import { z } from "zod";

// ==========================================
// Posts
// ==========================================

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Nội dung không được để trống")
    .max(4000, "Nội dung tối đa 4000 ký tự"),
  imagePath: z.string().nullable().optional(),
  movieRefType: z.enum(["movie", "tv"]).nullable().optional(),
  movieRefTmdbId: z.number().int().positive().nullable().optional(),
  movieRefTitle: z.string().max(300).nullable().optional(),
  movieRefPoster: z.string().max(500).nullable().optional(),
  isSpoiler: z.boolean().optional().default(false),
  communityRating: z.number().int().min(1).max(5).nullable().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

// ==========================================
// Comments
// ==========================================

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Bình luận không được để trống")
    .max(2000, "Bình luận tối đa 2000 ký tự"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// ==========================================
// Pagination
// ==========================================

export const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return 20;
      const n = Number(v);
      if (!Number.isFinite(n)) return 20;
      return Math.min(Math.max(1, Math.floor(n)), 50);
    }),
  authorId: z.string().optional(),
  movieTmdbId: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .pipe(z.number().int().positive().optional()),
  tab: z.enum(["explore", "following", "popular"]).optional().default("explore"),
});

export type FeedQuery = z.infer<typeof feedQuerySchema>;

export const commentListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return 30;
      const n = Number(v);
      if (!Number.isFinite(n)) return 30;
      return Math.min(Math.max(1, Math.floor(n)), 100);
    }),
});

export type CommentListQuery = z.infer<typeof commentListQuerySchema>;

// ==========================================
// Notifications
// ==========================================

export const notificationListQuerySchema = z.object({
  unreadOnly: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  limit: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return 30;
      const n = Number(v);
      if (!Number.isFinite(n)) return 30;
      return Math.min(Math.max(1, Math.floor(n)), 100);
    }),
});

export const markReadSchema = z
  .object({
    ids: z.array(z.string().min(1)).optional(),
    all: z.boolean().optional(),
  })
  .refine((v) => Boolean(v.ids?.length) || v.all === true, {
    message: "Cần cung cấp `ids` hoặc `all: true`",
  });

// ==========================================
// Handle (username) — validation cho seed/lookup
// ==========================================

export const HANDLE_RE = /^[a-z0-9_]{3,30}$/;

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((v) => HANDLE_RE.test(v), {
    message: "Handle phải từ 3-30 ký tự, chỉ gồm chữ thường, số, dấu gạch dưới",
  });

/**
 * Sinh handle mặc định từ email hoặc name (dùng trong seed/migration user cũ).
 * Lấy phần trước @ của email, làm sạch ký tự không hợp lệ, fallback về slug từ name.
 */
export function deriveHandle(
  email: string | null | undefined,
  name: string | null | undefined,
): string {
  const source =
    email?.split("@")[0] || "" || name || "" || `user${Math.random().toString(36).slice(2, 8)}`;
  const cleaned = source
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 28);
  const base = cleaned.length >= 3 ? cleaned : `user_${cleaned}`.slice(0, 30);
  return base;
}
