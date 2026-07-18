import { z } from "zod";

export const WATCH_STATUSES = [
  "want_to_watch",
  "watching",
  "paused",
  "completed",
  "dropped",
] as const;

export type WatchStatus = (typeof WATCH_STATUSES)[number];

/** Cập nhật một WatchItem (status/priority/score/notes/favorite). */
export const updateWatchItemSchema = z.object({
  watchItemId: z.string().min(1, "watchItemId là bắt buộc"),
  status: z.enum(WATCH_STATUSES).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  personalScore: z.number().min(0).max(10).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  favorite: z.boolean().optional(),
});

export type UpdateWatchItemInput = z.infer<typeof updateWatchItemSchema>;
