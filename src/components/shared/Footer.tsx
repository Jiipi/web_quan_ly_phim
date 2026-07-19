"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Film,
  GitFork,
  Terminal,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  Settings,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isLoggedIn = !!session?.user;

  // Paths where the mobile bottom navigation bar is visible
  // The bottom navigation is shown on almost all logged-in pages.
  const hasBottomNav = isLoggedIn;

  return (
    <footer
      className={cn(
        "relative border-t border-primary/20 bg-bg/40 backdrop-blur-md w-full z-10 transition-all",
        hasBottomNav ? "pb-24 lg:pb-12" : "pb-12",
      )}
    >
      {/* Neon glowing line on top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-secondary/80"
        style={{
          boxShadow: "0 0 10px oklch(0.72 0.32 330 / 0.5)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Column 1: Brand & Logo */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/20 border border-primary/30 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:bg-primary/30 group-hover:border-primary/50"
                style={{ filter: "drop-shadow(0 0 6px oklch(0.72 0.32 330 / 0.4))" }}
              >
                <Film size={18} />
              </div>
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-lg font-black tracking-tight text-transparent">
                CINEOS
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-text-secondary max-w-sm">
              Hệ điều hành xem phim cá nhân tối tân. Quản lý thư viện phim lẻ, phim bộ, theo dõi tập
              phim đang xem, tóm tắt nội dung bằng AI không spoil và trực quan hóa gu xem phim của
              bạn.
            </p>
            {/* TMDb Attribution */}
            <div className="mt-2 flex flex-col gap-1.5 border-l border-primary/10 pl-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-text-muted">
                Data Provider
              </span>
              <p className="text-[10px] leading-relaxed text-text-muted">
                Dữ liệu và hình ảnh được cung cấp bởi{" "}
                <a
                  href="https://www.themoviedb.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-secondary hover:underline"
                >
                  TMDb
                </a>
                . Sản phẩm này sử dụng API của TMDb nhưng không được chứng thực hoặc chứng nhận bởi
                TMDb.
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-primary/10 pb-2">
              Chức năng
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-mono uppercase tracking-wider">
              {isLoggedIn ? (
                <>
                  <li>
                    <Link
                      href="/"
                      className={cn(
                        "text-text-muted transition-colors hover:text-primary",
                        pathname === "/" && "text-primary font-bold",
                      )}
                    >
                      {"// Trang chủ"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/library"
                      className={cn(
                        "text-text-muted transition-colors hover:text-primary",
                        pathname?.startsWith("/library") && "text-primary font-bold",
                      )}
                    >
                      {"// Thư viện"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/discover"
                      className={cn(
                        "text-text-muted transition-colors hover:text-primary",
                        pathname?.startsWith("/discover") && "text-primary font-bold",
                      )}
                    >
                      {"// Khám phá"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/watchlist"
                      className={cn(
                        "text-text-muted transition-colors hover:text-primary",
                        pathname?.startsWith("/watchlist") && "text-primary font-bold",
                      )}
                    >
                      {"// Watchlist"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/stats"
                      className={cn(
                        "text-text-muted transition-colors hover:text-primary",
                        pathname?.startsWith("/stats") && "text-primary font-bold",
                      )}
                    >
                      {"// Thống kê"}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/#features"
                      className="text-text-muted transition-colors hover:text-primary"
                    >
                      {"// Tính năng"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#how-it-works"
                      className="text-text-muted transition-colors hover:text-primary"
                    >
                      {"// Cách hoạt động"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="text-text-muted transition-colors hover:text-primary"
                    >
                      {"// Đăng nhập"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="text-text-muted transition-colors hover:text-primary"
                    >
                      {"// Đăng ký"}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Utilities */}
          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-primary/10 pb-2">
              Tiện ích {isLoggedIn && "& Trợ lý"}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-mono">
              {isLoggedIn ? (
                <>
                  <li className="flex items-center gap-2">
                    <Sparkles size={12} className="text-primary" />
                    <Link
                      href="/ai"
                      className={cn(
                        "text-text-muted uppercase tracking-wider transition-colors hover:text-primary",
                        pathname?.startsWith("/ai") && "text-primary font-bold",
                      )}
                    >
                      Trợ lý AI No-Spoil
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar size={12} className="text-secondary" />
                    <Link
                      href="/calendar"
                      className={cn(
                        "text-text-muted uppercase tracking-wider transition-colors hover:text-secondary",
                        pathname?.startsWith("/calendar") && "text-secondary font-bold",
                      )}
                    >
                      Lịch xem phim
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <Layers size={12} className="text-accent" />
                    <Link
                      href="/lists"
                      className={cn(
                        "text-text-muted uppercase tracking-wider transition-colors hover:text-accent",
                        pathname?.startsWith("/lists") && "text-accent font-bold",
                      )}
                    >
                      Danh sách tùy biến
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <Settings size={12} className="text-text-muted" />
                    <Link
                      href="/settings"
                      className={cn(
                        "text-text-muted uppercase tracking-wider transition-colors hover:text-text",
                        pathname?.startsWith("/settings") && "text-text font-bold",
                      )}
                    >
                      Cài đặt hệ thống
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-text-secondary text-xs">
                      Theo dõi tiến độ phim lẻ & phim bộ chuẩn xác
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-0.5">•</span>
                    <span className="text-text-secondary text-xs">
                      Đồ thị thống kê thói quen & gu xem phim
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span className="text-text-secondary text-xs">
                      Tóm tắt tập phim cá nhân hóa không spoil
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-primary/10 py-6 font-mono text-[10px] uppercase tracking-widest text-text-muted sm:flex-row sm:justify-between">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} CINEOS</span>
            <span>{"//"}</span>
            <span className="flex items-center gap-1">
              MADE_WITH <Heart size={10} className="text-primary animate-pulse" /> FOR_CINEPHILES
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/#" className="transition-colors hover:text-primary">
              Terms
            </Link>
            <Link href="/#" className="transition-colors hover:text-secondary">
              Privacy
            </Link>
            <span className="text-primary/30">|</span>
            <div className="flex items-center gap-1 text-[9px]">
              <Terminal size={10} className="text-secondary" />
              <span>V3.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
