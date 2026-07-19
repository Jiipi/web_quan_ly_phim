/**
 * Map giữa thang điểm người dùng chọn (5 / 10 / 100) và điểm chuẩn 1-10
 * được lưu trong DB (model Rating.overallScore).
 *
 * Quy ước:
 * - 5 sao: bước 0.5, hiển thị "★ 4.5/5"
 * - 10: bước 1, hiển thị "8/10"
 * - 100: bước 5, hiển thị "80%"
 *
 * Mọi rating trong DB luôn là số 1-10 (schema hiện tại giữ vậy cho tương thích).
 */

export type RatingScale = "5" | "10" | "100";

export const RATING_SCALES: RatingScale[] = ["5", "10", "100"];

export const RATING_SCALE_LABELS: Record<RatingScale, string> = {
  "5": "Thang 5 sao",
  "10": "Thang 10",
  "100": "Thang 100%",
};

interface ScaleConfig {
  /** Giá trị lớn nhất slider. */
  max: number;
  /** Bước nhảy. */
  step: number;
  /** Số chữ số thập phân hiển thị. */
  digits: number;
  /** Hậu tố / tiền tố khi hiển thị. */
  suffix: string;
  /** Có vẽ sao không (chỉ áp dụng scale 5). */
  star: boolean;
}

export const SCALE_CONFIG: Record<RatingScale, ScaleConfig> = {
  "5": { max: 5, step: 0.5, digits: 1, suffix: "/5", star: true },
  "10": { max: 10, step: 1, digits: 0, suffix: "/10", star: false },
  "100": { max: 100, step: 5, digits: 0, suffix: "%", star: false },
};

/** Điểm 1-10 (DB) -> giá trị hiển thị theo scale người dùng chọn. */
export function from10(score10: number, scale: RatingScale): number {
  const cfg = SCALE_CONFIG[scale];
  const raw = (score10 / 10) * cfg.max;
  // Làm tròn về step gần nhất.
  const stepped = Math.round(raw / cfg.step) * cfg.step;
  return Number(stepped.toFixed(cfg.digits));
}

/** Giá trị slider theo scale -> điểm 1-10 (DB). */
export function to10(value: number, scale: RatingScale): number {
  const cfg = SCALE_CONFIG[scale];
  const ratio = cfg.max === 0 ? 0 : value / cfg.max;
  const score10 = ratio * 10;
  // Luôn trả về số 1-10, làm tròn 1 chữ số.
  return Math.max(1, Math.min(10, Number(score10.toFixed(1))));
}

/** Format hiển thị đẹp theo scale. */
export function formatScore(score10: number, scale: RatingScale): string {
  const cfg = SCALE_CONFIG[scale];
  const display = from10(score10, scale);
  // Nếu tròn số nguyên thì bỏ phần thập phân (.0) cho gọn.
  const text = Number.isInteger(display) ? display.toString() : display.toFixed(cfg.digits);
  if (cfg.star) {
    return `★ ${text}${cfg.suffix}`;
  }
  return `${text}${cfg.suffix}`;
}
