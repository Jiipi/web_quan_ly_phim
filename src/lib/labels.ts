/**
 * Label tiếng Việt dùng chung cho country (ISO 3166-1 alpha-2) và watch status.
 * Tách ra để tránh 3 file trùng định nghĩa giống hệt nhau.
 */
import type { WatchStatus } from "@/components/shared/StatusBadge";

/** Mã quốc gia ISO-3166 alpha-2 → tên tiếng Việt. Mã lạ sẽ fallback về chính nó. */
export const COUNTRY_LABELS: Record<string, string> = {
  VN: "Việt Nam",
  KR: "Hàn Quốc",
  CN: "Trung Quốc",
  JP: "Nhật Bản",
  US: "Mỹ",
  TH: "Thái Lan",
  GB: "Anh",
  HK: "Hồng Kông",
  TW: "Đài Loan",
  FR: "Pháp",
  IN: "Ấn Độ",
};

/** Trả về tên quốc gia tiếng Việt, fallback "Khác" khi không có code. */
export function countryLabel(code?: string | null): string {
  if (!code) return "Khác";
  return COUNTRY_LABELS[code] ?? code;
}

/** Tùy chọn trạng thái dùng cho filter dropdown (kèm "Tất cả"). */
export const STATUS_FILTER_OPTIONS: { value: WatchStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "want_to_watch", label: "Muốn xem" },
  { value: "watching", label: "Đang xem" },
  { value: "paused", label: "Tạm dừng" },
  { value: "completed", label: "Đã xong" },
  { value: "dropped", label: "Bỏ ngang" },
];

/** Tùy chọn trạng thái dùng cho StatusPicker (không có "Tất cả"). */
export const STATUS_OPTIONS: { value: WatchStatus; label: string }[] = STATUS_FILTER_OPTIONS.filter(
  (o): o is { value: WatchStatus; label: string } => o.value !== "all",
).map(({ value, label }) => ({ value, label }));
