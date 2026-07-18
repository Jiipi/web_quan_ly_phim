"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PlayCircle, ArrowRight, Plus } from "lucide-react";
import { useQuickAdd } from "@/components/shared/QuickAddDialog";

export function LandingCTA() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { openQuickAdd } = useQuickAdd();

  return (
    <section id="cta" className="relative overflow-hidden py-24 md:py-32">
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.72 0.32 330 / 0.22) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 80%, oklch(0.7 0.32 290 / 0.16) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 20%, oklch(0.85 0.18 200 / 0.14) 0%, transparent 60%)",
        }}
      />

      {/* Cyber grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.85 0.18 200 / 0.7) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.18 200 / 0.7) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-2xl px-6 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-md border border-primary/50 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <span className="inline-block h-1 w-1 rounded-full bg-primary pulse-glow" />
          READY_TO_DEPLOY // V3.0
        </span>

        <h2 className="text-3xl font-black tracking-tight md:text-4xl lg:text-6xl">
          {isLoggedIn ? (
            <>
              <span className="glitch block" data-text="BUILD YOUR">
                BUILD YOUR
              </span>
              <span className="holo-text block">Ultimate Library</span>
            </>
          ) : (
            <>
              <span className="glitch block" data-text="INITIALIZE">
                INITIALIZE
              </span>
              <span className="holo-text block">Your Cinema OS</span>
            </>
          )}
        </h2>

        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
          {isLoggedIn
            ? "Tìm kiếm bộ phim ưa thích tiếp theo hoặc kiểm tra biểu đồ phân tích gu xem phim cá nhân hóa."
            : "Đăng ký miễn phí, không cần thẻ tín dụng. Bắt đầu track ngay bộ phim bạn đang xem dở hôm nay."}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => openQuickAdd()}
                className="group flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_24px_oklch(0.72_0.32_330_/_0.55),0_0_48px_oklch(0.72_0.32_330_/_0.3)] transition-all hover:bg-primary-hover hover:scale-105 hover:shadow-[0_0_32px_oklch(0.72_0.32_330_/_0.7),0_0_64px_oklch(0.72_0.32_330_/_0.4)] active:scale-95"
              >
                <Plus size={18} className="transition-transform group-hover:rotate-90" />
                Add Movie
              </button>
              <Link
                href="/stats"
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-secondary transition-all hover:gap-3 hover:text-secondary hover:[text-shadow:0_0_12px_oklch(0.85_0.18_200_/_0.7)]"
              >
                View Statistics
                <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_24px_oklch(0.72_0.32_330_/_0.55),0_0_48px_oklch(0.72_0.32_330_/_0.3)] transition-all hover:bg-primary-hover hover:scale-105 hover:shadow-[0_0_32px_oklch(0.72_0.32_330_/_0.7),0_0_64px_oklch(0.72_0.32_330_/_0.4)] active:scale-95"
              >
                <PlayCircle
                  size={18}
                  className="transition-transform group-hover:scale-110"
                />
                Deploy Free
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/login"
                className="font-mono text-xs uppercase tracking-[0.2em] text-text-secondary transition-colors hover:text-secondary"
              >
                [ Have an account? Login → ]
              </Link>
            </>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
          <span className="flex items-center gap-1.5 rounded-md border border-completed/30 bg-completed/5 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-completed shadow-[0_0_6px_oklch(0.82_0.22_145_/_0.7)]" />
            Free Forever
          </span>
          <span className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_oklch(0.72_0.32_330_/_0.7)]" />
            No Piracy
          </span>
          <span className="flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/5 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_oklch(0.7_0.32_290_/_0.7)]" />
            Encrypted Data
          </span>
        </div>
      </div>
    </section>
  );
}
