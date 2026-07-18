import type { Metadata } from "next";
import Link from "next/link";
import { Film, Sparkles, Tv, ListPlus, Terminal } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký — CineOS",
};

const HIGHLIGHTS = [
  { Icon: Film, title: "Personal Library", desc: "Lưu phim yêu thích với tiến độ từng tập." },
  { Icon: Tv, title: "Watch Journal", desc: "Theo dõi streak, thời gian và biểu đồ thói quen." },
  { Icon: Sparkles, title: "AI Summary", desc: "Không spoil, theo dõi tiến độ tập của bạn." },
  { Icon: ListPlus, title: "List Manager", desc: "Tạo list riêng, đánh dấu ưu tiên, chia sẻ sau." },
];

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen min-w-0 flex-col overflow-hidden md:flex-row">
      <aside className="aside-hud relative min-h-[420px] w-full min-w-0 flex-1 basis-1/2 flex-col justify-between overflow-hidden p-6 sm:p-10 lg:p-14 md:flex md:min-h-screen">
        {/* Ambient drifting orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="ambient-orb"
            style={{
              width: 300, height: 300,
              background: "radial-gradient(circle, oklch(0.7 0.32 290 / 0.5) 0%, transparent 70%)",
              top: "5%", right: "-5%",
              animationDuration: "14s",
            }}
          />
          <div
            className="ambient-orb-b"
            style={{
              width: 260, height: 260,
              background: "radial-gradient(circle, oklch(0.85 0.18 200 / 0.4) 0%, transparent 70%)",
              bottom: "20%", left: "0%",
              animationDuration: "16s",
              animationDelay: "-5s",
            }}
          />
          <div
            className="ambient-orb"
            style={{
              width: 200, height: 200,
              background: "radial-gradient(circle, oklch(0.72 0.32 330 / 0.45) 0%, transparent 70%)",
              top: "40%", left: "40%",
              animationDuration: "20s",
              animationDelay: "-10s",
            }}
          />
        </div>

        {/* Background gradient — neon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 80% 30%, oklch(0.7 0.32 290 / 0.4) 0%, transparent 55%), radial-gradient(circle at 30% 70%, oklch(0.85 0.18 200 / 0.3) 0%, transparent 55%), radial-gradient(circle at 50% 10%, oklch(0.72 0.32 330 / 0.4) 0%, transparent 55%)",
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
            maskImage:
              "linear-gradient(180deg, black 0%, transparent 70%)",
            WebkitMaskImage:
              "linear-gradient(180deg, black 0%, transparent 70%)",
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
          <div className="aside-particle" style={{ width: 3, height: 3, background: "oklch(0.7 0.32 290 / 0.7)", left: "20%", bottom: "15%", animationDuration: "9s", animationDelay: "0s" }} />
          <div className="aside-particle-alt" style={{ width: 2, height: 2, background: "oklch(0.85 0.18 200 / 0.6)", left: "50%", bottom: "8%", animationDuration: "11s", animationDelay: "-3s" }} />
          <div className="aside-particle" style={{ width: 4, height: 4, background: "oklch(0.72 0.32 330 / 0.5)", left: "75%", bottom: "30%", animationDuration: "13s", animationDelay: "-5s" }} />
          <div className="aside-particle-alt" style={{ width: 2, height: 2, background: "oklch(0.7 0.32 290 / 0.6)", left: "30%", bottom: "45%", animationDuration: "10s", animationDelay: "-7s" }} />
          <div className="aside-particle" style={{ width: 3, height: 3, background: "oklch(0.85 0.18 200 / 0.7)", left: "88%", bottom: "20%", animationDuration: "12s", animationDelay: "-1s" }} />
          <div className="aside-particle-alt" style={{ width: 2, height: 2, background: "oklch(0.72 0.32 330 / 0.5)", left: "60%", bottom: "40%", animationDuration: "8s", animationDelay: "-4s" }} />
          <div className="aside-particle" style={{ width: 1, height: 1, background: "oklch(0.7 0.32 290 / 0.9)", left: "12%", bottom: "55%", animationDuration: "15s", animationDelay: "-6s" }} />
          <div className="aside-particle-alt" style={{ width: 3, height: 3, background: "oklch(0.85 0.18 200 / 0.6)", left: "65%", bottom: "5%", animationDuration: "14s", animationDelay: "-8s" }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full w-full max-w-xl mx-auto grow gap-10">
          {/* Logo with breathing glow */}
          <div className="flex items-center gap-2.5 text-text">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary neon-border logo-breathe">
              <Film className="text-primary-foreground" size={22} />
            </div>
            <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-lg font-black tracking-tight text-transparent">
              CINEOS
            </span>
          </div>

          <div className="flex flex-col gap-6">
            {/* Badge with blinking */}
            <span className="badge-pulse inline-flex w-fit items-center gap-2 rounded-md border border-accent/50 bg-accent/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent pulse-glow" />
              INIT.NEW_USER
            </span>

            {/* Heading with shimmer */}
            <h1 className="text-4xl font-black leading-tight tracking-tight xl:text-5xl">
              <span className="glitch block heading-shimmer" data-text="KHỞI TẠO">
                KHỞI TẠO
              </span>
              <span className="holo-text block mt-1">Thư Viện Điện Ảnh</span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
              Đăng ký miễn phí, đồng bộ dữ liệu xem phim cá nhân, gợi ý từ AI và
              biểu đồ thói quen trên mọi thiết bị.
            </p>

            {/* Animated divider */}
            <div className="divider-flow max-w-xl rounded-full" />

            <div className="grid max-w-xl grid-cols-2 gap-3">
              {HIGHLIGHTS.map(({ Icon, title, desc }, idx) => (
                <div
                  key={title}
                  className={`highlight-card card-entrance card-entrance-${idx + 1} flex flex-col gap-1.5 rounded-md border border-accent/20 bg-card/40 p-4 backdrop-blur-md`}
                >
                  <div className="card-glow-ring" />
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-accent transition-all duration-300"
                      style={{
                        filter: "drop-shadow(0 0 4px oklch(0.7 0.32 290 / 0.5))",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="number-badge font-mono text-[8px] text-text-muted">
                      INIT.0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold">{title}</h3>
                  <p className="text-[10px] leading-relaxed text-text-secondary">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer with typing cursor */}
          <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            <Terminal size={10} className="mr-1 inline-block text-accent" />
            © 2026 PHIMFLOW // READY_FOR_REGISTRATION
            <span className="typing-cursor" />
          </div>
        </div>
      </aside>

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
          <div className="absolute -inset-4 cyber-panel-strong rounded-2xl opacity-90" />
          <div className="absolute -left-3 -top-3 z-10 h-6 w-6 border-l-2 border-t-2 border-accent" style={{ filter: "drop-shadow(0 0 4px oklch(0.7 0.32 290 / 0.7))" }} />
          <div className="absolute -right-3 -top-3 z-10 h-6 w-6 border-r-2 border-t-2 border-secondary" style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.18 200 / 0.7))" }} />
          <div className="absolute -bottom-3 -left-3 z-10 h-6 w-6 border-b-2 border-l-2 border-secondary" style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.18 200 / 0.7))" }} />
          <div className="absolute -bottom-3 -right-3 z-10 h-6 w-6 border-b-2 border-r-2 border-accent" style={{ filter: "drop-shadow(0 0 4px oklch(0.7 0.32 290 / 0.7))" }} />

          <div className="relative z-10 rounded-xl bg-bg/80 p-6 backdrop-blur-md sm:p-8">
            <div className="mb-6 flex items-center gap-2 md:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary neon-border">
                <Film className="text-primary-foreground" size={22} />
              </div>
              <span className="bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-lg font-black tracking-tight text-transparent">
                CINEOS
              </span>
            </div>

            <div className="mb-8">
              <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                <span className="inline-block h-1 w-1 rounded-full bg-accent pulse-glow" />
                AUTH.REGISTER
              </span>
              <h1 className="text-2xl font-black tracking-tight">
                Tạo tài khoản
              </h1>
              <p className="mt-2 text-xs text-text-secondary">
                Bắt đầu hành trình xem phim cá nhân của bạn — hoàn toàn miễn phí.
              </p>
            </div>

            <RegisterForm />

            <p className="mt-8 text-center text-xs text-text-secondary">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-bold uppercase tracking-wider text-secondary transition-all hover:text-accent hover:[text-shadow:0_0_6px_oklch(0.7_0.32_290/0.7)]"
              >
                Đăng nhập →
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
