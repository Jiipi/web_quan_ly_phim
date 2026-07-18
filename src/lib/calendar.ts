/** Parse 'YYYY-MM' -> {year, month(0-indexed)}. Sai/thiếu -> tháng hiện tại. */
export function parseMonth(
  monthStr?: string | null,
  now: Date = new Date(),
): { year: number; month: number } {
  if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
    const [y, m] = monthStr.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year: y, month: m - 1 };
  }
  return { year: now.getFullYear(), month: now.getMonth() };
}

/** Khoảng [start, end) của một tháng (giờ địa phương). */
export function monthBounds(year: number, month: number): { start: Date; end: Date } {
  return { start: new Date(year, month, 1), end: new Date(year, month + 1, 1) };
}

/** Khoá ngày 'YYYY-MM-DD' theo giờ địa phương. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Định dạng tham số tháng 'YYYY-MM' từ Date. */
export function toMonthParam(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
