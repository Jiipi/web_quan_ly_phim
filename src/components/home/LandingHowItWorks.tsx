import React from "react";
import { Search, Plus, Sparkles } from "lucide-react";

const STEPS = [
  {
    step: "01",
    Icon: Search,
    title: "Tìm & Thêm Phim",
    desc: "Tìm kiếm nhanh từ kho dữ liệu TMDb khổng lồ. Thêm phim vào thư viện chỉ trong 2 giây với Quick Add.",
    accent: "primary" as const,
  },
  {
    step: "02",
    Icon: Plus,
    title: "Track Tiến Độ",
    desc: "Ghi nhận tập phim đang xem, đánh dấu trạng thái, ghi chú riêng tư. Mọi tiến trình được lưu tự động.",
    accent: "secondary" as const,
  },
  {
    step: "03",
    Icon: Sparkles,
    title: "AI Gợi Ý & Phân Tích",
    desc: "Nhận tóm tắt không spoil, gợi ý phim hợp gu và phân tích thói quen xem phim cá nhân bằng AI.",
    accent: "accent" as const,
  },
];

const ACCENT_COLORS = {
  primary: {
    ring: "border-primary/40 bg-primary/5",
    stepText: "text-primary glow-text",
    iconBg: "bg-primary/15",
    iconText: "text-primary",
    line:
      "from-primary/60 to-transparent via-primary/30",
    glow: "shadow-[0_0_24px_oklch(0.72_0.32_330_/_0.35)]",
  },
  secondary: {
    ring: "border-secondary/40 bg-secondary/5",
    stepText: "text-secondary glow-text-cyan",
    iconBg: "bg-secondary/15",
    iconText: "text-secondary",
    line:
      "from-secondary/60 to-transparent via-secondary/30",
    glow: "shadow-[0_0_24px_oklch(0.85_0.18_200_/_0.35)]",
  },
  accent: {
    ring: "border-accent/40 bg-accent/5",
    stepText: "text-accent glow-text-purple",
    iconBg: "bg-accent/15",
    iconText: "text-accent",
    line:
      "from-accent/60 to-transparent via-accent/30",
    glow: "shadow-[0_0_24px_oklch(0.7_0.32_290_/_0.35)]",
  },
};

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-lg text-center md:mb-20">
          <span className="mb-4 inline-flex items-center gap-2 rounded-md border border-secondary/50 bg-secondary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
            <span className="inline-block h-1 w-1 rounded-full bg-secondary pulse-glow-cyan" />
            WORKFLOW // 3_STEPS
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl lg:text-5xl">
            <span className="text-gradient-cinema">3 Bước Đơn Giản</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            Từ việc tìm phim đến nhận phân tích AI — tất cả diễn ra nhanh chóng
            và trực quan.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map(({ step, Icon, title, desc, accent }, idx) => {
            const colors = ACCENT_COLORS[accent];
            return (
              <div
                key={step}
                className="group relative flex flex-col items-center text-center"
              >
                {/* Connector line (not on last) */}
                {idx < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={`absolute left-[calc(50%+40px)] top-10 hidden h-px w-[calc(100%-80px)] bg-gradient-to-r ${colors.line} md:block`}
                    style={{
                      filter:
                        "drop-shadow(0 0 4px currentColor)",
                    }}
                  />
                )}

                {/* Step number ring */}
                <div
                  className={`mb-6 flex h-20 w-20 rotate-3 items-center justify-center rounded-xl border ${colors.ring} transition-all group-hover:rotate-0 group-hover:${colors.glow}`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-md ${colors.iconBg}`}
                    style={{
                      filter: "drop-shadow(0 0 6px currentColor)",
                    }}
                  >
                    <Icon size={24} className={colors.iconText} />
                  </div>
                </div>

                {/* Step number */}
                <span
                  className={`mb-1 font-mono text-xs font-bold uppercase tracking-[0.18em] ${colors.stepText}`}
                >
                  BƯỚC {step}
                </span>

                <h3 className="mb-2 text-lg font-bold">{title}</h3>
                <p className="max-w-xs text-xs leading-relaxed text-text-secondary">
                  {desc}
                </p>

                {/* HUD bracket bottom */}
                <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 border-b border-l border-current opacity-40" style={{ color: idx === 0 ? "oklch(0.72 0.32 330)" : idx === 1 ? "oklch(0.85 0.18 200)" : "oklch(0.7 0.32 290)" }} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
