/**
 * Helpers thuần cho tính năng community — không phụ thuộc React/Prisma.
 */

/**
 * Tính hot score cho một post.
 *   score = likeCount * 3 + commentCount * 2 + recency * 5
 * Trong đó recency = 1 / (1 + ageHours / 24) giảm dần từ 1.0 xuống ~0.05 sau 30 ngày.
 *
 * Lý do trọng số: like thể hiện chất lượng, comment thể hiện engagement,
 * recency đảm bảo bài mới luôn nổi lên. Đã được chuẩn hoá để test deterministic.
 */
export function hotScore(
  p: { likeCount: number; commentCount: number; createdAt: Date },
  now: number = Date.now(),
): number {
  const ageHours = Math.max(0, (now - p.createdAt.getTime()) / 3_600_000);
  const recency = 1 / (1 + ageHours / 24);
  return p.likeCount * 3 + p.commentCount * 2 + recency * 5;
}

/**
 * Format số đếm theo kiểu compact (1.2K, 3.4M) cho UI.
 */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0)}M`;
}

/**
 * Format thời gian tương đối ("5 phút trước", "2 giờ trước", "3 ngày trước").
 */
export function timeAgo(date: Date, now: number = Date.now()): string {
  const diff = Math.max(0, now - date.getTime());
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "vừa xong";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ngày trước`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month} tháng trước`;
  return `${Math.floor(month / 12)} năm trước`;
}
