"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Film,
  Terminal,
  Cpu,
  Sparkles,
  Calendar,
  Settings,
  Layers,
  Zap,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar } from "./StatusBar";

export function Footer() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <footer
        className={cn(
          "relative border-t border-primary/20 bg-bg/40 backdrop-blur-md w-full z-10 transition-all",
          isLoggedIn ? "pb-24 lg:pb-0" : "pb-12",
        )}
      >
        {/* Neon glowing line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-secondary/80"
          style={{ boxShadow: "0 0 10px oklch(0.72 0.32 330 / 0.5)" }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {/* Column 1: Brand */}
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
                Hệ điều hành xem phim cá nhân tối tân. Quản lý thư viện phim lẻ, phim bộ, theo dõi
                tập phim đang xem, tóm tắt nội dung bằng AI không spoil và trực quan hóa gu xem phim
                của bạn.
              </p>
              {/* ASCII-ish tagline */}
              <div className="mt-1 font-mono text-[9px] text-primary/70 leading-relaxed">
                <p>{"/* CINEOS // v0.1.0 */"}</p>
                <p>{"// personal streaming OS"}</p>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-primary/10 pb-2 flex items-center gap-2">
                <Terminal size={11} className="text-primary" />
                Navigation
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs font-mono uppercase tracking-wider">
                {isLoggedIn ? (
                  <>
                    <NavItem href="/" label="Trang chủ" pathname={pathname} prefix="//" />
                    <NavItem
                      href="/library"
                      label="Thư viện"
                      pathname={pathname}
                      prefix="//"
                      startsWith
                    />
                    <NavItem
                      href="/discover"
                      label="Khám phá"
                      pathname={pathname}
                      prefix="//"
                      startsWith
                    />
                    <NavItem
                      href="/watchlist"
                      label="Watchlist"
                      pathname={pathname}
                      prefix="//"
                      startsWith
                    />
                    <NavItem
                      href="/stats"
                      label="Thống kê"
                      pathname={pathname}
                      prefix="//"
                      startsWith
                    />
                  </>
                ) : (
                  <>
                    <NavItem href="/#features" label="Tính năng" pathname="" prefix="//" />
                    <NavItem href="/#how-it-works" label="Cách hoạt động" pathname="" prefix="//" />
                    <NavItem href="/login" label="Đăng nhập" pathname="" prefix="//" />
                    <NavItem href="/register" label="Đăng ký" pathname="" prefix="//" />
                  </>
                )}
              </ul>
            </div>

            {/* Column 3: Utilities */}
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-primary/10 pb-2 flex items-center gap-2">
                <Cpu size={11} className="text-secondary" />
                Utilities
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs font-mono">
                {isLoggedIn ? (
                  <>
                    <NavItem
                      href="/ai"
                      label="AI No-Spoil"
                      pathname={pathname}
                      icon={<Sparkles size={12} className="text-primary" />}
                      startsWith
                    />
                    <NavItem
                      href="/calendar"
                      label="Lịch xem phim"
                      pathname={pathname}
                      icon={<Calendar size={12} className="text-secondary" />}
                      startsWith
                    />
                    <NavItem
                      href="/lists"
                      label="Danh sách tùy biến"
                      pathname={pathname}
                      icon={<Layers size={12} className="text-accent" />}
                      startsWith
                    />
                    <NavItem
                      href="/settings"
                      label="Cài đặt"
                      pathname={pathname}
                      icon={<Settings size={12} className="text-text-muted" />}
                      startsWith
                    />
                  </>
                ) : (
                  <>
                    <FeatureItem color="text-primary" dot="•">
                      Theo dõi tiến độ phim lẻ &amp; phim bộ chuẩn xác
                    </FeatureItem>
                    <FeatureItem color="text-secondary" dot="•">
                      Đồ thị thống kê thói quen &amp; gu xem phim
                    </FeatureItem>
                    <FeatureItem color="text-accent" dot="•">
                      Tóm tắt tập phim cá nhân hóa không spoil
                    </FeatureItem>
                    <FeatureItem color="text-primary" dot="•">
                      Gợi ý phim thông minh bằng AI
                    </FeatureItem>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-primary/10 pt-6">
            <div className="flex flex-col items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-text-muted sm:flex-row sm:justify-between">
              <div className="flex items-center gap-1">
                <span>© {new Date().getFullYear()} CINEOS</span>
                <span className="text-primary/30 mx-1">{"//"}</span>
                <Zap size={10} className="text-primary animate-pulse" />
                <span>Built for Cinephiles</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 transition-colors hover:text-text"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-text-muted"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Source</span>
                  <ExternalLink size={8} />
                </a>
                <span className="text-primary/30">|</span>
                <Link href="/#" className="transition-colors hover:text-primary">
                  Terms
                </Link>
                <span className="text-primary/30">|</span>
                <Link href="/#" className="transition-colors hover:text-secondary">
                  Privacy
                </Link>
                <span className="text-primary/30">|</span>
                <div className="flex items-center gap-1">
                  <Terminal size={10} className="text-secondary" />
                  <span>v0.1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Status bar: always rendered but only visible on desktop */}
      <div className="hidden lg:block">
        <StatusBar />
      </div>
    </>
  );
}

function NavItem({
  href,
  label,
  pathname,
  prefix,
  icon,
  startsWith,
}: {
  href: string;
  label: string;
  pathname: string;
  prefix?: string;
  icon?: React.ReactNode;
  startsWith?: boolean;
}) {
  const active = startsWith ? pathname?.startsWith(href) : pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 transition-colors",
          active ? "text-primary font-bold" : "text-text-muted hover:text-text",
        )}
      >
        {icon}
        <span className="text-text-muted/40">{prefix}</span>
        <span>{label}</span>
      </Link>
    </li>
  );
}

function FeatureItem({
  children,
  color,
  dot,
}: {
  children: React.ReactNode;
  color: string;
  dot: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <span className={cn("mt-0.5", color)}>{dot}</span>
      <span className="text-text-secondary text-xs normal-case tracking-normal font-mono">
        {children}
      </span>
    </li>
  );
}
