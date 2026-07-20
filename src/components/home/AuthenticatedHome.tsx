"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import {
  Film,
  Home,
  List,
  Sparkles,
  BarChart3,
  Calendar,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  PlayCircle,
  Layers,
  Plus,
  LogOut,
  ChevronDown,
  Play,
  AlertCircle,
  BookOpen,
  RotateCw,
  ListPlus,
  Award,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuickAdd } from "@/components/shared/QuickAddDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LibraryProvider, useLibrary, type LibraryItem } from "@/lib/use-library";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroBanner, type HeroBannerItem } from "@/components/shared/HeroBanner";
import { MovieRow } from "@/components/shared/MovieRow";
import { MovieGrid } from "@/components/shared/MovieGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { type WatchStatus } from "@/components/shared/StatusBadge";

// --- Helper functions (from original dashboard) ---
function daysSince(date: string | null): number {
  if (!date) return 999;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function toCardProps(item: LibraryItem) {
  return {
    id: item.id,
    tmdbId: item.mediaItem.tmdbId,
    mediaType: item.mediaItem.mediaType as "movie" | "tv",
    title: item.mediaItem.title,
    originalTitle: item.mediaItem.originalTitle,
    posterPath: item.mediaItem.posterPath,
    backdropPath: item.mediaItem.backdropPath,
    rating: item.mediaItem.tmdbRating,
    releaseDate: null as string | null,
    genres: item.mediaItem.genres,
    status: item.status as WatchStatus,
    currentEpisode: item.currentEpisode,
    totalEpisodes: item.totalEpisodes,
  };
}

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

// --- Dashboard Content (extracted from original dashboard page) ---
function DashboardContent() {
  const { items, loading, error, reload } = useLibrary();
  const { success, error: toastError } = useToast();
  const { openQuickAdd } = useQuickAdd();

  const watching = useMemo(() => items.filter((i) => i.status === "watching"), [items]);
  const wants = useMemo(() => items.filter((i) => i.status === "want_to_watch"), [items]);
  const completed = useMemo(() => items.filter((i) => i.status === "completed"), [items]);

  const stats = useMemo(() => {
    const now = new Date();
    const completedThisMonth = completed.filter((i) => {
      if (!i.completedAt) return false;
      const d = new Date(i.completedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const episodesWatched = items.reduce((sum, i) => sum + i.currentEpisode, 0);
    return { episodesWatched, completedThisMonth };
  }, [items, completed]);

  const forgotten = useMemo(
    () =>
      items
        .filter(
          (i) =>
            (i.status === "watching" || i.status === "paused") && daysSince(i.lastWatchedAt) > 7,
        )
        .sort((a, b) => daysSince(b.lastWatchedAt) - daysSince(a.lastWatchedAt))[0],
    [items],
  );

  const suggestion = useMemo(
    () => [...wants].sort((a, b) => b.mediaItem.tmdbRating - a.mediaItem.tmdbRating)[0],
    [wants],
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
      (i) => i.mediaItem.tmdbId === item.tmdbId && i.mediaItem.mediaType === item.mediaType,
    );
    if (!matchedItem) return;
    const res = await api.post<{ currentEpisode: number; completed: boolean }>("/api/progress", {
      watchItemId: matchedItem.id,
    });
    if (res.success) {
      if (res.data?.completed) success(`Đã xem xong "${item.title}"! 🎉`);
      else success(`+1 tập "${item.title}".`);
      await reload();
    } else {
      toastError(res.error ?? "Không thể cập nhật tiến độ.");
    }
  }

  async function handleStartWatching(item: LibraryItem) {
    const res = await api.patch("/api/library", { watchItemId: item.id, status: "watching" });
    if (res.success) {
      success(`Bắt đầu xem "${item.mediaItem.title}".`);
      await reload();
    } else {
      toastError(res.error ?? "Không thể cập nhật trạng thái.");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-[420px] w-full rounded-3xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-dropped">{error}</p>
        <Button variant="outline" onClick={() => reload()}>
          <RotateCw size={14} /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <FadeIn className="flex flex-col gap-8">
      {/* HERO BANNER */}
      {featuredItems.length > 0 ? (
        <HeroBanner items={featuredItems.map(toHeroItem)} onPlay={handlePlusOne} />
      ) : (
        <Card className="relative overflow-hidden border-dashed border-primary/30 bg-gradient-to-br from-card to-surface">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, oklch(0.68 0.22 18 / 0.25) 0%, transparent 60%), radial-gradient(circle at 80% 30%, oklch(0.82 0.16 75 / 0.18) 0%, transparent 50%)",
            }}
          />
          <CardContent className="relative flex flex-col items-center gap-5 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[0_0_24px_oklch(0.68_0.22_18_/_0.4)]">
              <Film className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Chào mừng bạn đến với CineOS!
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
                Thêm những bộ phim hoặc anime yêu thích từ TMDb để bắt đầu ghi chú tiến trình, điểm
                số và nhận gợi ý phân tích xu hướng xem phim.
              </p>
            </div>
            <Button size="lg" onClick={() => openQuickAdd()}>
              <Plus size={16} />
              Thêm phim mới ngay
            </Button>
          </CardContent>
        </Card>
      )}

      {/* FORGOTTEN ITEM WARNING */}
      {forgotten && (
        <FadeIn delay={0.1}>
          <Card className="overflow-hidden border-secondary/30 bg-gradient-to-r from-secondary/10 to-transparent">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary">
                <AlertCircle className="animate-pulse" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <Badge
                  variant="outline"
                  className="mb-2 bg-secondary/15 text-secondary border-secondary/30"
                >
                  Mạch phim bị bỏ quên &gt; 7 ngày
                </Badge>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Bạn đã lâu không cập nhật tiến độ xem{" "}
                  <span className="font-semibold text-text">{forgotten.mediaItem.title}</span> (lần
                  cuối {daysSince(forgotten.lastWatchedAt)} ngày trước). Đọc lại tóm tắt không spoil
                  để tiếp tục.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/ai?tab=summary&show=${forgotten.mediaItem.tmdbId}`}>
                      <BookOpen size={13} />
                      AI Tóm tắt không spoil
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* MAIN GRID */}
      <div className="grid gap-8 lg:grid-cols-4 items-start">
        {/* LEFT: Continue watching + Recently added */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <MovieRow
            title="Tiếp tục xem dở"
            subtitle={watching.length > 0 ? `${watching.length} phim đang theo dõi` : undefined}
            items={watching.map((i) => toCardProps(i))}
            emptyMessage="Chưa có phim nào đang theo dõi. Bấm Thêm nhanh để bắt đầu."
          />

          <section className="flex flex-col gap-4">
            <header className="flex items-end justify-between">
              <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-text">
                <Film className="text-secondary" size={16} />
                Mới thêm gần đây
              </h3>
              {items.length > 8 && (
                <Link
                  href="/library"
                  className="text-xs font-semibold text-text-secondary hover:text-text transition-colors"
                >
                  Xem tất cả →
                </Link>
              )}
            </header>
            {items.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-sm text-text-secondary">
                  Thư viện trống — nhấp Thêm nhanh để bắt đầu xây dựng bộ sưu tập của bạn.
                </CardContent>
              </Card>
            ) : (
              // showQuickActions tắt: phim ở dashboard đã có trong thư viện.
              <MovieGrid items={items.slice(0, 8).map((i) => toCardProps(i))} />
            )}
          </section>
        </div>

        {/* RIGHT: Sidebar */}
        <aside className="lg:col-span-1 flex flex-col gap-5">
          {/* KPI strip */}
          <Stagger className="grid grid-cols-2 gap-3">
            <StaggerItem>
              <Card className="hover-lift">
                <CardContent className="flex flex-col gap-1 p-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    <TrendingUp size={12} className="text-primary" />
                    Số tập đã cày
                  </div>
                  <div className="font-mono text-2xl font-extrabold text-gradient-cinema">
                    {stats.episodesWatched}
                  </div>
                  <div className="text-[9px] text-text-secondary">Tập phim bộ</div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="hover-lift">
                <CardContent className="flex flex-col gap-1 p-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    <Play size={12} className="text-watching" />
                    Đang dở dang
                  </div>
                  <div className="font-mono text-2xl font-extrabold text-watching">
                    {watching.length}
                  </div>
                  <div className="text-[9px] text-text-secondary">Phim bộ</div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="hover-lift">
                <CardContent className="flex flex-col gap-1 p-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    <CheckCircle2 size={12} className="text-completed" />
                    Hoàn thành
                  </div>
                  <div className="font-mono text-2xl font-extrabold text-completed">
                    {completed.length}
                  </div>
                  <div className="text-[9px] text-text-secondary">Tổng cộng</div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="hover-lift">
                <CardContent className="flex flex-col gap-1 p-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    <Calendar size={12} className="text-accent" />
                    Tháng này
                  </div>
                  <div className="font-mono text-2xl font-extrabold text-accent">
                    {stats.completedThisMonth}
                  </div>
                  <div className="text-[9px] text-text-secondary">Phim hoàn thành</div>
                </CardContent>
              </Card>
            </StaggerItem>
          </Stagger>

          {/* AI Suggestion */}
          <Card className="overflow-hidden border-accent/30">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, oklch(0.74 0.14 195 / 0.5) 0%, transparent 70%)",
              }}
            />
            <CardContent className="relative flex flex-col gap-3 p-4">
              <header className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-text-muted">
                  <Sparkles size={14} className="text-secondary" />
                  Gợi ý tối nay
                </h3>
                <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30">
                  AI
                </Badge>
              </header>
              {suggestion ? (
                <div className="flex flex-col gap-2.5">
                  <h4 className="text-sm font-bold leading-tight">{suggestion.mediaItem.title}</h4>
                  <p className="line-clamp-3 text-xs leading-relaxed text-text-secondary">
                    Phim này nằm trong Watchlist của bạn với điểm TMDb rất tốt (
                    {suggestion.mediaItem.tmdbRating.toFixed(1)}). Thể loại chính:{" "}
                    {suggestion.mediaItem.genres.slice(0, 2).join(", ")}.
                  </p>
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="font-mono text-[10px] font-bold text-secondary">
                      {Math.round(suggestion.mediaItem.tmdbRating * 10)}% match
                    </span>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleStartWatching(suggestion)}
                    >
                      <Play size={12} />
                      Bắt đầu
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-secondary">
                  Thêm phim vào Watchlist để nhận gợi ý cá nhân hoá.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Watchlist quick */}
          <section className="flex flex-col gap-3">
            <header className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-text-muted">
                <ListPlus size={14} className="text-accent" />
                Watchlist
              </h3>
              <Link
                href="/watchlist"
                className="text-[10px] font-bold text-secondary hover:underline"
              >
                Tất cả
              </Link>
            </header>
            {wants.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-xs text-text-secondary">
                  Watchlist trống.
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {wants.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.mediaItem.mediaType === "tv" ? "show" : "movie"}/${item.mediaItem.tmdbId}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-2.5 transition-all hover:border-border-hover hover:bg-card"
                  >
                    <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-card">
                      <img
                        src={
                          item.mediaItem.posterPath
                            ? item.mediaItem.posterPath.startsWith("http")
                              ? item.mediaItem.posterPath
                              : `https://image.tmdb.org/t/p/w200${item.mediaItem.posterPath}`
                            : "/placeholder.svg"
                        }
                        alt={item.mediaItem.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-xs font-bold">{item.mediaItem.title}</h4>
                      <p className="truncate text-[10px] text-text-muted">
                        {item.mediaItem.originalTitle}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1 text-[9px] font-mono text-text-secondary">
                        <Award size={9} className="text-secondary" />
                        {item.mediaItem.tmdbRating.toFixed(1)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </FadeIn>
  );
}

// --- App Shell (header, nav, FAB) ---
function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || "Người dùng";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image || null;

  const [cmdOpen, setCmdOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openQuickAdd } = useQuickAdd();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        openQuickAdd();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openQuickAdd]);

  const mainNavigation = [
    { name: "Trang chủ", href: "/", icon: <Home size={18} /> },
    { name: "Thư viện", href: "/library", icon: <Film size={18} /> },
    { name: "Khám phá", href: "/discover", icon: <Search size={18} /> },
    { name: "Watchlist", href: "/watchlist", icon: <List size={18} /> },
    { name: "Thống kê", href: "/stats", icon: <BarChart3 size={18} /> },
  ];

  const subNavigation = [
    { name: "Tiếp tục xem", href: "/continue-watching", icon: <PlayCircle size={16} /> },
    { name: "Danh sách phim", href: "/lists", icon: <Layers size={16} /> },
    { name: "Lịch xem phim", href: "/calendar", icon: <Calendar size={16} /> },
    { name: "Trợ lý AI", href: "/ai", icon: <Sparkles size={16} /> },
    { name: "Cài đặt", href: "/settings", icon: <Settings size={16} /> },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans">
      {/* TOP NAVIGATION BAR */}
      <header className="h-16 border-b border-white/5 bg-surface/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full transition-all">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Film
                className="text-primary fill-primary/10 group-hover:scale-105 transition-transform"
                size={22}
              />
              <span className="font-bold text-base bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-tight">
                CineOS
              </span>
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavigation.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || (pathname?.startsWith(item.href) ?? false);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-text-secondary hover:text-text hover:bg-white/5 border border-transparent",
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openQuickAdd()}
              aria-label="Thêm nhanh (Alt+N)"
              title="Thêm nhanh (Alt+N)"
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary-hover text-white px-4 py-2 text-xs font-bold transition-all shadow-glow-primary hover:scale-105 active:scale-95"
            >
              <Plus size={14} />
              <span>Thêm nhanh</span>
            </button>
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              aria-label="Mở tìm kiếm nhanh"
              className="relative hidden sm:flex w-48 lg:w-56 items-center gap-2 rounded-full border border-white/8 bg-white/5 py-2 pl-9 pr-3 text-left text-xs text-text-muted transition-all hover:border-primary/50 hover:bg-white/8"
            >
              <Search className="absolute left-3.5 top-2.5 text-text-muted" size={14} />
              <span className="flex-1 text-[11px]">Tìm nhanh...</span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-text-muted">
                Ctrl K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              aria-label="Mở tìm kiếm nhanh"
              className="rounded-full p-2 text-text-secondary hover:bg-white/5 hover:text-text sm:hidden"
            >
              <Search size={18} />
            </button>
            <ThemeToggle />
            <button
              type="button"
              aria-label="Thông báo"
              className="p-2 rounded-full text-text-secondary hover:text-text hover:bg-white/5 relative"
            >
              <Bell size={18} />
              <span
                aria-hidden="true"
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary pulse-glow"
              />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((o) => !o)}
              className="p-2 rounded-full text-text-secondary hover:text-text hover:bg-white/5 lg:hidden"
              aria-label="Mở menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/3 hover:bg-white/5 px-2.5 py-1.5 transition-colors focus:outline-none"
              >
                <UserAvatar src={userImage} name={userName} size="xs" />
                <ChevronDown
                  size={12}
                  className={cn(
                    "text-text-muted transition-transform duration-200",
                    isDropdownOpen && "rotate-180",
                  )}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/8 bg-surface p-1.5 shadow-2xl z-50 animate-fade-in-up">
                  <div className="px-3.5 py-2.5 border-b border-white/5">
                    <p className="text-xs font-bold text-white truncate">{userName}</p>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    {subNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsDropdownOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-text-secondary hover:text-white hover:bg-white/5",
                        )}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-white/5 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-dropped hover:bg-dropped/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 z-40 bg-surface/95 backdrop-blur-lg border-b border-white/5 p-4 flex flex-col gap-3 animate-fade-in-up">
          <nav className="flex flex-col gap-1">
            {mainNavigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-white/5 hover:text-text",
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col w-full py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-w-0 pb-24 lg:pb-12">
        <LibraryProvider>
          <div className="flex-1 w-full flex flex-col">{children}</div>
        </LibraryProvider>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-white/5 bg-surface/90 backdrop-blur-md z-40 lg:hidden flex items-center justify-around px-2 pb-safe">
        {mainNavigation.slice(0, 4).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold uppercase tracking-wider gap-1",
                active ? "text-primary" : "text-text-muted hover:text-text",
              )}
            >
              <div
                className={cn(
                  "transition-transform duration-200",
                  active && "scale-110 text-primary",
                )}
              >
                {item.icon}
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => openQuickAdd()}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold uppercase tracking-wider gap-1 text-text-muted"
        >
          <div className="rounded-full bg-primary p-1.5 text-white shadow-glow-primary">
            <Plus size={16} />
          </div>
          <span>Thêm nhanh</span>
        </button>
      </nav>

      {/* FAB */}
      <button
        onClick={() => openQuickAdd()}
        className="hidden lg:flex fixed bottom-6 right-6 z-40 h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-glow-primary hover:bg-primary-hover hover:scale-110 active:scale-95 transition-all duration-200"
        title="Thêm phim nhanh (Alt+N)"
        aria-label="Thêm phim nhanh"
      >
        <Plus size={24} />
      </button>

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </div>
  );
}

/**
 * Authenticated home page — renders the full app shell (header, nav, FAB)
 * with the dashboard content. Used at "/" when the user is logged in.
 */
export function AuthenticatedHome() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}
