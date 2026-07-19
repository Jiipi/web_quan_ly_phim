import { z } from "zod";

export const WATCH_STATUSES = [
  "want_to_watch",
  "watching",
  "paused",
  "completed",
  "dropped",
] as const;

export type WatchStatus = (typeof WATCH_STATUSES)[number];

/** Ngày hợp lệ (YYYY-MM-DD hoặc ISO); không chấp nhận tương lai xa quá 1 ngày. */
const dateStringSchema = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), "Ngày không hợp lệ")
  .transform((s) => new Date(s));

export const createWatchItemSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  status: z.enum(WATCH_STATUSES),
  personalScore: z.number().min(0).max(10).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  platform: z.string().max(100).optional(),
  watchUrl: z.string().url().max(2000).optional(),
  /** ISO date string. Mặc định = now nếu status=watching. */
  startedAt: dateStringSchema.optional(),
  /** ISO date string. Mặc định = now nếu status=completed. */
  completedAt: dateStringSchema.optional(),
});

export type CreateWatchItemInput = z.infer<typeof createWatchItemSchema>;

/** Cập nhật một WatchItem (status/priority/score/notes/favorite/ngày). */
export const updateWatchItemSchema = z.object({
  watchItemId: z.string().min(1, "watchItemId là bắt buộc"),
  status: z.enum(WATCH_STATUSES).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  personalScore: z.number().min(0).max(10).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  favorite: z.boolean().optional(),
  startedAt: dateStringSchema.nullable().optional(),
  completedAt: dateStringSchema.nullable().optional(),
  lastWatchedAt: dateStringSchema.nullable().optional(),
});

export type UpdateWatchItemInput = z.infer<typeof updateWatchItemSchema>;

/** Cập nhật ngày tháng của WatchItem (route riêng nếu cần PATCH riêng). */
export const patchWatchDatesSchema = z.object({
  watchItemId: z.string().min(1),
  startedAt: dateStringSchema.nullable().optional(),
  completedAt: dateStringSchema.nullable().optional(),
  lastWatchedAt: dateStringSchema.nullable().optional(),
});
export type PatchWatchDatesInput = z.infer<typeof patchWatchDatesSchema>;
