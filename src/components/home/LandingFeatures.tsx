import React from "react";
import { PlayCircle, Sparkles, BarChart3, ListPlus, Eye, Clock } from "lucide-react";

const FEATURES = [
  {
    Icon: PlayCircle,
    title: "Xem Tiếp Thông Minh",
    desc: "Ghi nhớ chính xác tập phim đang xem dở. Cập nhật tiến độ chỉ trong 1 click với nút +1 tập ngay trên dashboard.",
    accent: "primary" as const,
  },
  {
    Icon: Sparkles,
    title: "AI Tóm Tắt Không Spoil",
    desc: "Lỡ bỏ quên phim vài tuần? AI sẽ tóm tắt cốt truyện chính xác đến tập bạn đang xem, cam kết không tiết lộ tương lai.",
    accent: "secondary" as const,
  },
  {
    Icon: BarChart3,
    title: "Thống Kê & Phân Tích Gu",
    desc: "Xem báo cáo trực quan về thói quen xem phim: quốc gia nhiều nhất, thể loại yêu thích và biểu đồ nhiệt lịch sử.",
    accent: "accent" as const,
  },
  {
    Icon: ListPlus,
    title: "Watchlist Thông Minh",
    desc: "Gom phim muốn xem theo list riêng, đánh dấu ưu tiên, và nhận gợi ý cá nhân hoá dựa trên gu xem của bạn.",
    accent: "primary" as const,
  },
  {
    Icon: Eye,
    title: "Theo Dõi Đa Nền Tảng",
    desc: "Ghi chú platform đang xem (Netflix, Disney+, ...) và link xem hợp pháp. Tất cả tập trung trong một nơi duy nhất.",
    accent: "secondary" as const,
  },
  {
    Icon: Clock,
    title: "Nhật Ký Xem Chi Tiết",
    desc: "Đếm streak xem liên tục, theo dõi thời gian xem và biểu đồ thói quen giúp bạn hiểu hành vi xem phim của mình.",
    accent: "accent" as const,
  },
];

const ACCENT_STYLES = {
  primary: {
    iconBg: "bg-primary/10 border-primary/40",
    iconText: "text-primary glow-text",
    glow: "group-hover:shadow-[0_0_32px_oklch(0.72_0.32_330_/_0.35)] group-hover:border-primary/60",
    bar: "bg-primary shadow-[0_0_8px_oklch(0.72_0.32_330_/_0.7)]",
  },
  secondary: {
    iconBg: "bg-secondary/10 border-secondary/40",
    iconText: "text-secondary glow-text-cyan",
    glow: "group-hover:shadow-[0_0_32px_oklch(0.85_0.18_200_/_0.35)] group-hover:border-secondary/60",
    bar: "bg-secondary shadow-[0_0_8px_oklch(0.85_0.18_200_/_0.7)]",
  },
  accent: {
    iconBg: "bg-accent/10 border-accent/40",
    iconText: "text-accent glow-text-purple",
    glow: "group-hover:shadow-[0_0_32px_oklch(0.7_0.32_290_/_0.35)] group-hover:border-accent/60",
    bar: "bg-accent shadow-[0_0_8px_oklch(0.7_0.32_290_/_0.7)]",
  },
};

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      {/* Section background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 border-y border-primary/10 bg-bg/40 backdrop-blur-sm"
      />

      {/* Faint cyber grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.85 0.18 200 / 0.6) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.18 200 / 0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-lg text-center md:mb-20">
          <span className="mb-4 inline-flex items-center gap-2 rounded-md border border-primary/50 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <span className="inline-block h-1 w-1 rounded-full bg-primary pulse-glow" />
            TÍNH_NĂNG // CORE_MODULES
          </span>
          <h2 className="text-3xl font-black tracking-tight md:text-4xl lg:text-5xl">
            Được Thiết Kế Cho
            <br />
            <span className="text-gradient-cinema">Người Nghiện Phim</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            Giải quyết triệt để các vấn đề thường gặp khi theo dõi danh sách phim lẻ, phim bộ dài
            tập trên nhiều nền tảng.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, desc, accent }, idx) => {
            const styles = ACCENT_STYLES[accent];
            return (
              <div
                key={title}
                className={`group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-white/10 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${styles.glow}`}
              >
                {/* Top accent bar */}
                <div className={`absolute inset-x-0 top-0 h-px ${styles.bar}`} />
                {/* Corner brackets */}
                <div
                  className="pointer-events-none absolute right-3 top-3 h-2 w-2 border-r border-t border-current opacity-40 transition-all group-hover:h-3 group-hover:w-3 group-hover:opacity-100"
                  style={{ color: "var(--primary)" }}
                />
                <div
                  className={`mb-1 inline-flex h-11 w-11 items-center justify-center rounded-md border ${styles.iconBg} ${styles.iconText} transition-all group-hover:scale-110 group-hover:[transform:rotate(-8deg)_scale(1.1)]`}
                  style={{
                    filter: "drop-shadow(0 0 8px currentColor)",
                  }}
                >
                  <Icon size={20} />
                </div>
                {/* Module label */}
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  MODULE.{String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="-mt-3 text-base font-bold">{title}</h3>
                <p className="text-xs leading-relaxed text-text-secondary">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
