"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  PlayCircle,
  Zap,
  Plus,
  Search,
  Film,
  Sparkles,
  ArrowRight,
  TerminalSquare,
} from "lucide-react";
import { useOptionalLibrary, type LibraryItem } from "@/lib/use-library";
import { HeroBanner, type HeroBannerItem } from "@/components/shared/HeroBanner";
import { useQuickAdd } from "@/components/shared/QuickAddDialog";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

function toHeroItem(item: LibraryItem): HeroBannerItem {
  return {
    tmdbId: item.mediaItem.tmdbId,
    mediaType: item.mediaItem.mediaType as "movie" | "tv",
    title: item.mediaItem.title,
    originalTitle: item.mediaItem.originalTitle,
    tagline: item.mediaItem.overview ?? undefined,
    overview: item.mediaItem.overview ?? undefined,
    posterPath: item.mediaItem.posterPath,
    backdropPath: item.mediaItem.backdropPath,
    rating: item.mediaItem.tmdbRating,
    releaseDate: null,
    genres: item.mediaItem.genres,
    status: item.status as HeroBannerItem["status"],
    currentEpisode: item.currentEpisode,
    totalEpisodes: item.totalEpisodes,
  };
}

export function LandingHero() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const userName = session?.user?.name || "Bạn";

  const { items, reload } = useOptionalLibrary();
  const { openQuickAdd } = useQuickAdd();
  const { success, error: toastError } = useToast();

  const watching = useMemo(
    () => items.filter((i) => i.status === "watching"),
    [items],
  );
  const featuredItems = useMemo<LibraryItem[]>(() => {
    if (items.length === 0) return [];
    const sorted = [...items].sort((a, b) => {
      if (a.status === "watching" && b.status !== "watching") return -1;
      if (a.status !== "watching" && b.status === "watching") return 1;
      if (a.status === "paused" && b.status !== "paused") return -1;
      if (a.status !== "paused" && b.status === "paused") return 1;
      return b.mediaItem.tmdbRating - a.mediaItem.tmdbRating;
    });
    return sorted.slice(0, 5);
  }, [items]);

  async function handlePlusOne(item: HeroBannerItem) {
    const matchedItem = items.find(
      (i) => i.mediaItem.tmdbId === item.tmdbId && i.mediaItem.mediaType === item.mediaType
    );
    if (!matchedItem) return;
    const res = await api.post<{ currentEpisode: number; completed: boolean }>(
      "/api/progress",
      { watchItemId: matchedItem.id },
    );
    if (res.success) {
      if (res.data?.completed) success(`Đã xem xong "${item.title}"! 🎉`);
      else success(`+1 tập "${item.title}".`);
      await reload();
    } else {
      toastError(res.error ?? "Không thể cập nhật tiến độ.");
    }
  }

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 text-center pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* Ambient floating orbs */}
      <div aria-hidden="true" className="ambient-orb pointer-events-none absolute -left-24 top-12 z-0 h-96 w-96 bg-primary opacity-30" />
      <div aria-hidden="true" className="ambient-orb-b pointer-events-none absolute -right-32 top-40 z-0 h-80 w-80 bg-secondary opacity-20" />
      <div aria-hidden="true" className="ambient-orb pointer-events-none absolute left-1/3 top-60 z-0 h-64 w-64 bg-accent opacity-25" style={{ animationDelay: "-6s" }} />

      {/* Floating particles */}
      <div aria-hidden="true" className="aside-particle pointer-events-none absolute left-8 top-1/4 z-0 h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "0s", animationDuration: "8s" }} />
      <div aria-hidden="true" className="aside-particle pointer-events-none absolute right-12 top-1/3 z-0 h-1 w-1 rounded-full bg-secondary" style={{ animationDelay: "-2s", animationDuration: "10s" }} />
      <div aria-hidden="true" className="aside-particle pointer-events-none absolute left-1/4 bottom-1/3 z-0 h-1.5 w-1.5 rounded-full bg-accent" style={{ animationDelay: "-4s", animationDuration: "12s" }} />
      <div aria-hidden="true" className="aside-particle pointer-events-none absolute right-1/4 top-1/2 z-0 h-1 w-1 rounded-full bg-primary" style={{ animationDelay: "-6s", animationDuration: "9s" }} />
      <div aria-hidden="true" className="aside-particle-alt pointer-events-none absolute left-10 top-1/2 z-0 h-1 w-1 rounded-full bg-secondary" style={{ animationDelay: "-3s", animationDuration: "11s" }} />

      {/* Neon orbs local to hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 35%, oklch(0.72 0.32 330 / 0.25) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 75% 55%, oklch(0.85 0.18 200 / 0.15) 0%, transparent 60%), radial-gradient(ellipse 35% 35% at 25% 65%, oklch(0.7 0.32 290 / 0.18) 0%, transparent 60%)",
        }}
      />

      {/* Floating grid dots */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, oklch(0.9 0 0) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Status / hacker badge */}
      <div className="mb-6 inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur-md neon-border">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary pulse-glow" />
        {isLoggedIn
          ? `WELCOME BACK, ${userName.toUpperCase()}`
          : "CINEOS // V3.0 CYBERPUNK BUILD"}
        <Zap size={12} className="fill-current" />
      </div>

      {/* Headline with glitch + holographic gradient text */}
      <h1 className="animate-fade-in-up max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
        {isLoggedIn ? (
          <>
            <span
              className="glitch block"
              data-text="TIẾP TỤC HÀNH TRÌNH"
            >
              TIẾP TỤC HÀNH TRÌNH
            </span>
            <span className="holo-text block">Xem Phim Của Bạn</span>
          </>
        ) : (
          <>
            <span
              className="glitch block"
              data-text="QUẢN LÝ TOÀN BỘ"
            >
              QUẢN LÝ TOÀN BỘ
            </span>
            <span className="holo-text block">Hành Trình Xem Phim</span>
          </>
        )}
      </h1>

      {/* Subtitle */}
      <p className="mx-auto mt-8 max-w-2xl animate-fade-in-up text-base leading-relaxed text-text-secondary sm:text-lg">
        {isLoggedIn
          ? watching.length > 0
            ? `Bạn đang có ${watching.length} bộ phim đang xem dở. Cập nhật tiến độ ngay bên dưới hoặc khám phá bộ phim mới!`
            : "Tự động ghi nhớ tiến độ, nhận gợi ý AI và theo dõi danh sách xem phim hoàn chỉnh."
          : "Hệ điều hành xem phim thế hệ mới — ghi nhớ tiến độ, AI tóm tắt không spoil, cá nhân hoá theo gu của bạn."}
      </p>

      {/* CTA buttons */}
      <div className="mt-10 flex animate-fade-in-up flex-col items-center gap-4 sm:flex-row">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => openQuickAdd()}
              className="group flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_24px_oklch(0.72_0.32_330_/_0.55),0_0_48px_oklch(0.72_0.32_330_/_0.3)] transition-all hover:bg-primary-hover hover:scale-105 active:scale-95"
            >
              <Plus size={18} className="transition-transform group-hover:rotate-90" />
              Thêm Phim Nhanh
              <kbd className="ml-1 rounded border border-white/30 bg-white/10 px-1.5 py-0.5 text-[9px] font-mono">
                ALT+N
              </kbd>
            </button>
            <Link
              href="/discover"
              className="group flex items-center gap-2 rounded-full btn-neon-cyan px-8 py-4 text-sm font-bold uppercase tracking-widest backdrop-blur-md"
            >
              <Search size={16} />
              Khám Phá Phim
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_24px_oklch(0.72_0.32_330_/_0.55),0_0_48px_oklch(0.72_0.32_330_/_0.3)] transition-all hover:bg-primary-hover hover:scale-105 active:scale-95"
            >
              <PlayCircle size={18} className="transition-transform group-hover:scale-110" />
              Kích Hoạt Hệ Thống
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-full btn-neon-cyan px-8 py-4 text-sm font-bold uppercase tracking-widest"
            >
              <TerminalSquare size={14} />
              Xem Demo
            </a>
          </>
        )}
      </div>

      {/* Quick stats / capability strip */}
      {!isLoggedIn && (
        <div className="mt-12 grid w-full max-w-3xl animate-fade-in-up grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "AI Powered", value: "GPT-4o", color: "primary" as const },
            { label: "Database", value: "100K+", color: "cyan" as const },
            { label: "Uptime", value: "99.9%", color: "accent" as const },
            { label: "Privacy", value: "100%", color: "primary" as const },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-3 backdrop-blur-md transition-all hover:border-primary/40 hover:bg-card/50"
            >
              <div
                className={`mb-1 inline-block h-1 w-8 rounded-full ${
                  stat.color === "cyan"
                    ? "bg-secondary shadow-[0_0_8px_oklch(0.85_0.18_200)]"
                    : stat.color === "accent"
                      ? "bg-accent shadow-[0_0_8px_oklch(0.7_0.32_290)]"
                      : "bg-primary shadow-[0_0_8px_oklch(0.72_0.32_330)]"
                }`}
              />
              <div className="text-left font-mono text-[10px] uppercase tracking-widest text-text-muted">
                {stat.label}
              </div>
              <div
                className={`text-left font-mono text-base font-bold ${
                  stat.color === "cyan"
                    ? "text-secondary glow-text-cyan"
                    : stat.color === "accent"
                      ? "text-accent glow-text-purple"
                      : "text-primary glow-text"
                }`}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive hero content: live banner for logged-in, mockup for guests */}
      <div className="relative mx-auto mt-16 w-full max-w-5xl animate-fade-in-up text-left">
        {/* Bracket decoration */}
        <div className="absolute -inset-2 rounded-3xl border border-primary/20 opacity-70 [mask-image:linear-gradient(180deg,black,transparent_70%)]" />

        {/* Glow halo */}
        <div
          aria-hidden="true"
          className="absolute -inset-4 rounded-3xl blur-3xl opacity-60"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.32 330 / 0.25), oklch(0.7 0.32 290 / 0.18), oklch(0.85 0.18 200 / 0.18))",
          }}
        />

        <div className="relative overflow-hidden rounded-2xl cyber-panel-strong">
          {/* Corner HUD brackets */}
          <div className="absolute left-3 top-3 z-10 h-3 w-3 border-l-2 border-t-2 border-primary" />
          <div className="absolute right-3 top-3 z-10 h-3 w-3 border-r-2 border-t-2 border-secondary" />
          <div className="absolute left-3 bottom-3 z-10 h-3 w-3 border-b-2 border-l-2 border-secondary" />
          <div className="absolute right-3 bottom-3 z-10 h-3 w-3 border-b-2 border-r-2 border-primary" />

          {isLoggedIn ? (
            featuredItems.length > 0 ? (
              <div className="p-1">
                <HeroBanner
                  items={featuredItems.map(toHeroItem)}
                  onPlay={handlePlusOne}
                />
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center p-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary neon-border">
                  <Film size={32} className="glow-text" />
                </div>
                <h3 className="mb-2 text-xl font-bold holo-text">
                  Thư Viện Đang Trống
                </h3>
                <p className="mb-6 max-w-md text-sm leading-relaxed text-text-secondary">
                  Bắt đầu hành trình của bạn bằng cách thêm những bộ phim đã
                  xem hoặc đang theo dõi. PhimFlow sẽ tự động đồng bộ tiến độ
                  và đưa ra gợi ý AI phù hợp.
                </p>
                <button
                  onClick={() => openQuickAdd()}
                  className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_24px_oklch(0.72_0.32_330_/_0.5)] transition-all hover:scale-105 active:scale-95"
                >
                  <Plus size={16} />
                  Thêm bộ phim đầu tiên
                </button>
              </div>
            )
          ) : (
            <div>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-primary/20 bg-bg/80 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-dropped/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-paused/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-completed/70" />
                </div>
                <div className="ml-4 flex-1 rounded-md border border-primary/30 bg-bg/60 px-3 py-1 font-mono text-[10px] text-text-muted">
                  <span className="text-primary">$</span> phimflow.app
                  <span className="ml-2 inline-block h-2.5 w-1.5 animate-pulse bg-secondary align-middle" />
                </div>
                <Sparkles size={12} className="text-secondary glow-text-cyan" />
              </div>
              {/* Dashboard content preview */}
              <div className="flex gap-3 p-4">
                <div className="flex-1 space-y-3">
                  <div
                    className="h-36 rounded-xl sm:h-48"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.72 0.32 330 / 0.25) 0%, oklch(0.7 0.32 290 / 0.18) 50%, oklch(0.85 0.18 200 / 0.15) 100%)",
                      boxShadow:
                        "inset 0 0 24px oklch(0.72 0.32 330 / 0.15), 0 0 24px oklch(0.72 0.32 330 / 0.2)",
                    }}
                  />
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`aspect-[2/3] rounded-lg ${
                          i === 4 ? "hidden sm:block" : ""
                        }`}
                        style={{
                          background: `linear-gradient(135deg, oklch(${0.45 + i * 0.06} ${0.2 + i * 0.04} ${330 - i * 30}) 0%, oklch(${0.35 + i * 0.06} ${0.2 + i * 0.04} ${290 - i * 30}) 100%)`,
                          boxShadow: `0 0 ${8 + i * 4}px oklch(${0.6 + i * 0.05} ${0.25 + i * 0.02} ${330 - i * 30} / 0.4)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="hidden w-36 space-y-3 lg:block">
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-14 rounded-lg border border-secondary/20 bg-secondary/5"
                      />
                    ))}
                  </div>
                  <div className="h-32 rounded-lg border border-accent/20 bg-accent/5" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator for guests */}
      {!isLoggedIn && (
        <div className="mt-12 flex animate-bounce flex-col items-center gap-1 text-text-muted md:mt-16">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Khám phá tiếp
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6L8 10L12 6"
              stroke="oklch(0.72 0.32 330)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: "drop-shadow(0 0 4px oklch(0.72 0.32 330 / 0.7))",
              }}
            />
          </svg>
        </div>
      )}
    </section>
  );
}
