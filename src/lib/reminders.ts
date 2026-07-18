import { z } from "zod";

export const FORGOTTEN_THRESHOLD_DAYS = 7;

/** Số ngày kể từ `date` tới `now`. null -> Infinity (chưa từng xem). */
export function daysSinceDate(date: Date | string | null, now: Date = new Date()): number {
  if (!date) return Infinity;
  const t = typeof date === "string" ? new Date(date).getTime() : date.getTime();
  return Math.floor((now.getTime() - t) / (1000 * 60 * 60 * 24));
}

/** Phim "bị bỏ quên": đã từng xem nhưng quá `thresholdDays` ngày chưa cập nhật. */
export function isForgotten(
  lastWatchedAt: Date | string | null,
  now: Date = new Date(),
  thresholdDays: number = FORGOTTEN_THRESHOLD_DAYS,
): boolean {
  if (!lastWatchedAt) return false;
  return daysSinceDate(lastWatchedAt, now) > thresholdDays;
}

export const createReminderSchema = z.object({
  watchItemId: z.string().min(1),
  message: z.string().max(200).optional(),
  remindInDays: z.number().int().min(1).max(365).optional(),
});
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
