"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Film,
  Menu,
  X,
  Home,
  Search,
  List,
  BarChart3,
  Plus,
  Bell,
  ChevronDown,
  PlayCircle,
  Layers,
  Calendar,
  Sparkles,
  Settings,
  LogOut,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuickAdd } from "@/components/shared/QuickAddDialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { useT } from "@/lib/i18n";

const PUBLIC_NAV_LINKS = [
  { key: "nav.features", href: "/#features" },
  { key: "nav.how-it-works", href: "/#how-it-works" },
  { key: "nav.start", href: "/#cta" },
] as const;

const AUTH_MAIN_NAV = [
  { nameKey: "nav.home", href: "/", icon: <Home size={16} /> },
  { nameKey: "nav.library", href: "/library", icon: <Film size={16} /> },
  { nameKey: "nav.discover", href: "/discover", icon: <Search size={16} /> },
  { nameKey: "nav.watchlist", href: "/watchlist", icon: <List size={16} /> },
  { nameKey: "nav.stats", href: "/stats", icon: <BarChart3 size={16} /> },
];

const AUTH_SUB_NAV = [
  { nameKey: "nav.continue-watching", href: "/continue-watching", icon: <PlayCircle size={16} /> },
  { nameKey: "nav.lists", href: "/lists", icon: <Layers size={16} /> },
  { nameKey: "nav.calendar", href: "/calendar", icon: <Calendar size={16} /> },
  { nameKey: "nav.ai", href: "/ai", icon: <Sparkles size={16} /> },
  { nameKey: "nav.settings", href: "/settings", icon: <Settings size={16} /> },
];

export function AppHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { t } = useT();

  const userName = session?.user?.name || "Người dùng";
  const userEmail = session?.user?.email || "";
  const userInitial = (session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Mock Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      type: "ai",
      title: "Gợi ý phim từ Trợ lý AI",
      message:
        "Dựa trên thư viện và gu xem phim của bạn, AI vừa đề xuất bộ phim 'Dune: Part Two'. Thử xem nhé!",
      time: "10 phút trước",
      read: false,
    },
    {
      id: "notif-2",
      type: "streak",
      title: "Đạt mốc Streak mới! 🔥",
      message:
        "Chúc mừng! Bạn đã duy trì thói quen xem phim 5 ngày liên tiếp. Hãy tiếp tục duy trì nhé!",
      time: "2 giờ trước",
      read: false,
    },
    {
      id: "notif-3",
      type: "reminder",
      title: "Lịch phát sóng hôm nay",
      message: "Tập mới của bộ phim 'House of the Dragon' bạn đang theo dõi sẽ phát sóng tối nay.",
      time: "5 giờ trước",
      read: true,
    },
    {
      id: "notif-4",
      type: "system",
      title: "Cập nhật hệ thống CineOS v3.0",
      message:
        "Chào mừng đến với hệ điều hành xem phim cá nhân mới. Khám phá các tính năng AI ngay!",
      time: "1 ngày trước",
      read: true,
    },
  ]);

  const hasUnread = notifications.some((n) => !n.read);

  const { openQuickAdd } = useQuickAdd();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
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
  }, [isLoggedIn, openQuickAdd]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || isLoggedIn || pathname !== "/"
            ? "h-16 border-b border-primary/30 bg-bg/85 backdrop-blur-xl dark:shadow-[0_0_24px_var(--neon-pink-soft)]"
            : "h-16 bg-transparent",
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2">
              <Film
                className="logo-breathe text-primary transition-all group-hover:rotate-12 group-hover:scale-110"
                size={22}
                style={{
                  filter: "drop-shadow(0 0 8px var(--neon-pink))",
                }}
              />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-lg font-black tracking-tight text-transparent">
                CINEOS
              </span>
            </Link>

            {/* Desktop Navigation */}
            {isLoggedIn ? (
              <nav className="hidden items-center gap-1 lg:flex">
                {AUTH_MAIN_NAV.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || (pathname?.startsWith(item.href) ?? false);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200",
                        active
                          ? "border border-primary/60 bg-primary/15 text-primary dark:shadow-[0_0_16px_var(--neon-pink-soft),inset_0_0_8px_oklch(0.72_0.32_330_/_0.25)]"
                          : "text-text-secondary hover:text-text hover:border hover:border-secondary/40 hover:bg-secondary/5",
                      )}
                    >
                      {t(item.nameKey)}
                    </Link>
                  );
                })}
              </nav>
            ) : (
              <nav className="hidden items-center gap-1 md:flex">
                {PUBLIC_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary transition-all hover:border hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary"
                  >
                    {t(link.key)}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Right Area */}
          <div className="flex items-center gap-2.5">
            {isLoggedIn ? (
              <>
                {/* Quick Add Button */}
                <button
                  type="button"
                  onClick={() => openQuickAdd()}
                  aria-label={`${t("nav.quick-add")} (Alt+N)`}
                  title={`${t("nav.quick-add")} (Alt+N)`}
                  className="hidden sm:flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-all dark:shadow-[0_0_16px_var(--neon-pink-soft),inset_0_0_6px_oklch(0.72_0.32_330_/_0.3)] hover:bg-primary-hover hover:scale-105 active:scale-95"
                >
                  <Plus size={13} />
                  <span>{t("nav.quick-add")}</span>
                  <kbd className="ml-1 rounded border border-white/30 bg-white/10 px-1 py-0 text-[8px] font-mono">
                    N
                  </kbd>
                </button>

                {/* Search Bar (opens command palette) */}
                <button
                  type="button"
                  onClick={() => setCmdOpen(true)}
                  aria-label="Mở tìm kiếm nhanh"
                  className="relative hidden sm:flex w-44 lg:w-52 items-center gap-2 rounded-md border border-primary/30 bg-bg/60 py-1.5 pl-8 pr-3 text-left text-xs text-text-muted transition-all hover:border-primary/60 hover:bg-bg/80 dark:hover:shadow-[0_0_12px_var(--neon-pink-soft)]"
                >
                  <Search
                    className="absolute left-2.5 top-2 text-primary"
                    size={13}
                    style={{
                      filter: "drop-shadow(0 0 4px var(--neon-pink))",
                    }}
                  />
                  <span className="flex-1 font-mono text-[10px]">
                    {t("common.search")} library...
                  </span>
                  <kbd className="rounded border border-secondary/40 bg-secondary/10 px-1 py-0.5 font-mono text-[9px] text-secondary">
                    Ctrl K
                  </kbd>
                </button>

                <ThemeToggle />

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifOpen(!isNotifOpen);
                      setIsDropdownOpen(false);
                    }}
                    aria-label={t("nav.notifications")}
                    title={t("nav.notifications")}
                    className="relative rounded-md border border-transparent p-2 text-text-secondary transition-all hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
                  >
                    <Bell
                      size={16}
                      style={{
                        filter: "drop-shadow(0 0 4px transparent)",
                      }}
                    />
                    {hasUnread && (
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary pulse-glow" />
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-xl border border-primary/40 bg-bg/95 p-1.5 dark:shadow-[0_0_24px_var(--neon-pink-soft)] backdrop-blur-xl z-50 animate-fade-in-up">
                      <div className="flex items-center justify-between border-b border-primary/20 px-3.5 py-2.5">
                        <span className="font-mono text-xs font-bold text-text uppercase tracking-wider">
                          {t("nav.notifications")}
                        </span>
                        {hasUnread && (
                          <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            className="font-mono text-[9px] font-bold uppercase tracking-wider text-secondary hover:text-secondary-hover transition-colors"
                          >
                            {t("notifications.mark-all-read")}
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto py-1 divide-y divide-primary/10">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-text-muted">
                            {t("notifications.empty")}
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            let Icon = Bell;
                            let iconColor = "text-text-muted bg-surface/50 border-border";
                            if (notif.type === "ai") {
                              Icon = Sparkles;
                              iconColor =
                                "text-secondary bg-secondary/15 border-secondary/30 dark:shadow-[0_0_8px_var(--neon-cyan-soft)]";
                            } else if (notif.type === "streak") {
                              Icon = BarChart3;
                              iconColor =
                                "text-primary bg-primary/15 border-primary/30 dark:shadow-[0_0_8px_var(--neon-pink-soft)]";
                            } else if (notif.type === "reminder") {
                              Icon = Calendar;
                              iconColor =
                                "text-accent bg-accent/15 border-accent/30 dark:shadow-[0_0_8px_var(--neon-violet-soft)]";
                            } else if (notif.type === "system") {
                              Icon = Terminal;
                              iconColor = "text-text bg-card border-border";
                            }

                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleToggleRead(notif.id)}
                                className={cn(
                                  "flex gap-3 px-3.5 py-3 transition-colors cursor-pointer text-left relative",
                                  notif.read
                                    ? "hover:bg-white/5"
                                    : "bg-primary/5 hover:bg-primary/10",
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs",
                                    iconColor,
                                  )}
                                >
                                  <Icon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <p
                                      className={cn(
                                        "text-xs font-bold truncate",
                                        notif.read ? "text-white/90" : "text-white",
                                      )}
                                    >
                                      {notif.title}
                                    </p>
                                    {!notif.read && (
                                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    )}
                                  </div>
                                  <p className="mt-1 text-[11px] leading-relaxed text-text-secondary break-words">
                                    {notif.message}
                                  </p>
                                  <span className="mt-1.5 block font-mono text-[9px] text-text-muted">
                                    {notif.time}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((o) => !o)}
                    className="flex items-center gap-1.5 rounded-md border border-secondary/40 bg-secondary/5 px-2.5 py-1.5 transition-all hover:border-secondary/80 dark:hover:shadow-[0_0_12px_var(--neon-cyan-soft)] focus:outline-none"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 font-mono text-[11px] font-bold text-primary glow-text">
                      {userInitial}
                    </div>
                    <ChevronDown
                      size={12}
                      className={cn(
                        "text-text-muted transition-transform duration-200",
                        isDropdownOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-primary/40 bg-bg/95 p-1.5 dark:shadow-[0_0_24px_var(--neon-pink-soft)] backdrop-blur-xl z-50 animate-fade-in-up">
                      <div className="border-b border-primary/20 px-3.5 py-2.5">
                        <p className="font-mono text-xs font-bold text-text truncate">{userName}</p>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-text-muted">
                          {userEmail}
                        </p>
                      </div>
                      <div className="py-1">
                        {AUTH_SUB_NAV.map((item) => (
                          <Link
                            key={item.nameKey}
                            href={item.href}
                            onClick={() => setIsDropdownOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                              pathname === item.href
                                ? "border border-primary/40 bg-primary/15 text-primary dark:shadow-[inset_0_0_8px_var(--neon-pink-soft)]"
                                : "text-text-secondary hover:border hover:border-secondary/30 hover:bg-secondary/5 hover:text-secondary",
                            )}
                          >
                            {item.icon}
                            {t(item.nameKey)}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-1 border-t border-primary/20 pt-1">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold text-dropped transition-all hover:bg-dropped/10 dark:hover:shadow-[inset_0_0_8px_var(--neon-red)]"
                        >
                          <LogOut size={16} />
                          {t("nav.sign-out")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary transition-all hover:border hover:border-secondary/40 hover:text-secondary md:block"
                >
                  {t("nav.sign-in")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all dark:shadow-[0_0_16px_var(--neon-pink-soft),inset_0_0_6px_oklch(0.72_0.32_330_/_0.3)] hover:bg-primary-hover hover:scale-105 active:scale-95"
                >
                  {t("nav.activate")}
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="rounded-md border border-transparent p-2 text-text-secondary transition-all hover:border-primary/40 hover:bg-primary/10 md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <div className="absolute inset-x-0 top-full border-b border-primary/30 bg-bg/95 p-4 backdrop-blur-xl cyber-panel md:hidden animate-fade-in-up">
            <nav className="flex flex-col gap-1">
              {isLoggedIn
                ? AUTH_MAIN_NAV.map((item) => (
                    <Link
                      key={item.nameKey}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all",
                        pathname === item.href
                          ? "border border-primary/40 bg-primary/15 text-primary"
                          : "text-text-secondary hover:border hover:border-secondary/30 hover:bg-secondary/5",
                      )}
                    >
                      {item.icon}
                      {t(item.nameKey)}
                    </Link>
                  ))
                : PUBLIC_NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-4 py-3 text-sm font-semibold uppercase tracking-wider text-text-secondary transition-all hover:border hover:border-secondary/30 hover:bg-secondary/5"
                    >
                      {t(link.key)}
                    </Link>
                  ))}

              {!isLoggedIn && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-4 py-3 text-sm font-semibold uppercase tracking-wider text-text-secondary transition-all hover:border hover:border-secondary/30 hover:bg-secondary/5"
                >
                  {t("nav.sign-in")}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </>
  );
}
