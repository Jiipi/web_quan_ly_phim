import type { Metadata } from "next";
import Link from "next/link";
import { Film, Sparkles, Tv, ListPlus, Terminal } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập — PhimFlow",
};

const HIGHLIGHTS = [
  { Icon: Film, title: "Library Manager", desc: "Lưu phim lẻ và phim bộ với tiến độ theo tập." },
  {
    Icon: Tv,
    title: "Watch History",
    desc: "Nhật ký xem chi tiết, đếm streak, biểu đồ thói quen.",
  },
  {
    Icon: Sparkles,
    title: "AI No-Spoil",
    desc: "Tóm tắt đến tập bạn đang xem, gợi ý theo tâm trạng.",
  },
  {
    Icon: ListPlus,
    title: "Smart Watchlist",
    desc: "Gom phim muốn xem, đánh dấu ưu tiên và quản lý list riêng.",
  },
];

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen min-w-0 flex-col overflow-hidden md:flex-row">
      {/* Left: Cinematic cyberpunk hero */}
      <aside className="aside-hud relative min-h-[420px] w-full min-w-0 flex-1 basis-1/2 flex-col justify-between overflow-hidden p-6 sm:p-10 lg:p-14 md:flex md:min-h-screen">
        {/* Ambient drifting orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="ambient-orb"
            style={{
              width: 320,
              height: 320,
              background: "radial-gradient(circle, oklch(0.72 0.32 330 / 0.5) 0%, transparent 70%)",
              top: "10%",
              left: "-5%",
              animationDuration: "12s",
            }}
          />
          <div
            className="ambient-orb-b"
            style={{
              width: 240,
              height: 240,
              background:
                "radial-gradient(circle, oklch(0.85 0.18 200 / 0.45) 0%, transparent 70%)",
              bottom: "15%",
              right: "5%",
              animationDuration: "15s",
              animationDelay: "-4s",
            }}
          />
          <div
            className="ambient-orb"
            style={{
              width: 180,
              height: 180,
              background: "radial-gradient(circle, oklch(0.7 0.32 290 / 0.4) 0%, transparent 70%)",
              top: "50%",
              left: "30%",
              animationDuration: "18s",
              animationDelay: "-8s",
            }}
          />
        </div>

        {/* Background gradient — neon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, oklch(0.72 0.32 330 / 0.45) 0%, transparent 55%), radial-gradient(circle at 80% 70%, oklch(0.7 0.32 290 / 0.35) 0%, transparent 55%), radial-gradient(circle at 50% 90%, oklch(0.85 0.18 200 / 0.25) 0%, transparent 60%)",
          }}
        />

        {/* Cyber grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.85 0.18 200 / 0.7) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.18 200 / 0.7) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "linear-gradient(180deg, black 0%, transparent 70%)",
            WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 70%)",
          }}
        />

        {/* Scanlines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            background:
              "repeating-linear-gradient(180deg, transparent 0px, transparent 2px, rgba(255,255,255,0.025) 3px, transparent 4px)",
          }}
        />

        {/* Aside scan beam sweep */}
        <div aria-hidden="true" className="aside-scan-beam" />

        {/* Floating particles */}
        <div aria-hidden="true" className="aside-particles">
          <div
            className="aside-particle"
            style={{
              width: 3,
              height: 3,
              background: "oklch(0.72 0.32 330 / 0.7)",
              left: "15%",
              bottom: "20%",
              animationDuration: "8s",
              animationDelay: "0s",
            }}
          />
          <div
            className="aside-particle-alt"
            style={{
              width: 2,
              height: 2,
              background: "oklch(0.85 0.18 200 / 0.6)",
              left: "40%",
              bottom: "10%",
              animationDuration: "10s",
              animationDelay: "-2s",
            }}
          />
          <div
            className="aside-particle"
            style={{
              width: 4,
              height: 4,
              background: "oklch(0.7 0.32 290 / 0.5)",
              left: "70%",
              bottom: "25%",
              animationDuration: "12s",
              animationDelay: "-4s",
            }}
          />
          <div
            className="aside-particle-alt"
            style={{
              width: 2,
              height: 2,
              background: "oklch(0.72 0.32 330 / 0.6)",
              left: "25%",
              bottom: "40%",
              animationDuration: "9s",
              animationDelay: "-6s",
            }}
          />
          <div
            className="aside-particle"
            style={{
              width: 3,
              height: 3,
              background: "oklch(0.85 0.18 200 / 0.7)",
              left: "85%",
              bottom: "15%",
              animationDuration: "11s",
              animationDelay: "-1s",
            }}
          />
          <div
            className="aside-particle-alt"
            style={{
              width: 2,
              height: 2,
              background: "oklch(0.72 0.32 330 / 0.5)",
              left: "55%",
              bottom: "35%",
              animationDuration: "7s",
              animationDelay: "-3s",
            }}
          />
          <div
            className="aside-particle"
            style={{
              width: 1,
              height: 1,
              background: "oklch(0.85 0.18 200 / 0.9)",
              left: "10%",
              bottom: "50%",
              animationDuration: "14s",
              animationDelay: "-5s",
            }}
          />
          <div
            className="aside-particle-alt"
            style={{
              width: 3,
              height: 3,
              background: "oklch(0.7 0.32 290 / 0.6)",
              left: "60%",
              bottom: "5%",
              animationDuration: "13s",
              animationDelay: "-7s",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full w-full max-w-xl mx-auto grow gap-10">
          {/* Logo with breathing glow */}
          <div className="flex items-center gap-2.5 text-text">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary neon-border logo-breathe">
              <Film className="text-primary-foreground" size={22} />
            </div>
            <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-lg font-black tracking-tight text-transparent">
              PHIMFLOW
            </span>
          </div>

          <div className="flex flex-col gap-6">
            {/* Badge with blinking dot */}
            <span className="badge-pulse inline-flex w-fit items-center gap-2 rounded-md border border-primary/50 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary pulse-glow" />
              CINEMA_OS // V3.0
            </span>

            {/* Heading with shimmer */}
            <h1 className="text-4xl font-black leading-tight tracking-tight xl:text-5xl">
              <span className="glitch block heading-shimmer" data-text="HỆ ĐIỀU HÀNH">
                HỆ ĐIỀU HÀNH
              </span>
              <span className="holo-text block mt-1">Xem Phim Cá Nhân</span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
              Ghi chú tiến độ, đánh dấu ưu tiên, tóm tắt không spoil và khám phá gu xem phim của
              chính mình — tất cả trong một dashboard cinematic.
            </p>

            {/* Animated divider */}
            <div className="divider-flow max-w-xl rounded-full" />

            <div className="grid max-w-xl grid-cols-2 gap-3">
              {HIGHLIGHTS.map(({ Icon, title, desc }, idx) => (
                <div
                  key={title}
                  className={`highlight-card card-entrance card-entrance-${idx + 1} flex flex-col gap-1.5 rounded-md border border-primary/20 bg-card/40 p-4 backdrop-blur-md`}
                >
                  <div className="card-glow-ring" />
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary transition-all duration-300"
                      style={{
                        filter: "drop-shadow(0 0 4px oklch(0.72 0.32 330 / 0.5))",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="number-badge font-mono text-[8px] text-text-muted">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold">{title}</h3>
                  <p className="text-[10px] leading-relaxed text-text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer with typing cursor */}
          <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            <Terminal size={10} className="mr-1 inline-block text-primary" />
            © 2026 PHIMFLOW // ALL_SYSTEMS_OPERATIONAL
            <span className="typing-cursor" />
          </div>
        </div>
      </aside>

      {/* Right: Form */}
      <main className="relative flex min-h-screen w-full min-w-0 flex-1 basis-1/2 items-center justify-center overflow-hidden p-6 sm:p-12">
        <div className="absolute right-4 top-4 z-20">
          <Link
            href="/"
            className="rounded-md border border-secondary/40 bg-secondary/5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-secondary transition-all hover:border-secondary/80 hover:bg-secondary/10 hover:[text-shadow:0_0_6px_oklch(0.85_0.18_200/0.7)]"
          >
            ← BACK_HOME
          </Link>
        </div>
        <div className="relative w-full max-w-md">
          {/* Corner HUD */}
          <div className="absolute -inset-4 cyber-panel-strong rounded-2xl opacity-90" />
          <div
            className="absolute -left-3 -top-3 z-10 h-6 w-6 border-l-2 border-t-2 border-primary"
            style={{ filter: "drop-shadow(0 0 4px oklch(0.72 0.32 330 / 0.7))" }}
          />
          <div
            className="absolute -right-3 -top-3 z-10 h-6 w-6 border-r-2 border-t-2 border-secondary"
            style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.18 200 / 0.7))" }}
          />
          <div
            className="absolute -bottom-3 -left-3 z-10 h-6 w-6 border-b-2 border-l-2 border-secondary"
            style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.18 200 / 0.7))" }}
          />
          <div
            className="absolute -bottom-3 -right-3 z-10 h-6 w-6 border-b-2 border-r-2 border-primary"
            style={{ filter: "drop-shadow(0 0 4px oklch(0.72 0.32 330 / 0.7))" }}
          />

          <div className="relative z-10 rounded-xl bg-bg/80 p-6 backdrop-blur-md sm:p-8">
            <div className="mb-6 flex items-center gap-2 md:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary neon-border">
                <Film className="text-primary-foreground" size={22} />
              </div>
              <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-lg font-black tracking-tight text-transparent">
                PHIMFLOW
              </span>
            </div>

            <div className="mb-8">
              <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <span className="inline-block h-1 w-1 rounded-full bg-primary pulse-glow" />
                AUTH.LOGIN
              </span>
              <h1 className="text-2xl font-black tracking-tight">Chào mừng trở lại</h1>
              <p className="mt-2 text-xs text-text-secondary">
                Đăng nhập để tiếp tục hành trình xem phim cá nhân của bạn.
              </p>
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-xs text-text-secondary">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="font-bold uppercase tracking-wider text-primary transition-all hover:text-secondary hover:[text-shadow:0_0_6px_oklch(0.85_0.18_200/0.7)]"
              >
                Tạo tài khoản →
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
