"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Film, Search, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/shared/AppHeader";
import { useQuickAdd } from "@/components/shared/QuickAddDialog";
import { Footer } from "@/components/shared/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { openQuickAdd } = useQuickAdd();

  const mainNavigation = [
    { name: "Trang chủ", href: "/", icon: <Home size={18} /> },
    { name: "Thư viện", href: "/library", icon: <Film size={18} /> },
    { name: "Khám phá", href: "/discover", icon: <Search size={18} /> },
    { name: "Watchlist", href: "/watchlist", icon: <List size={18} /> },
  ];

  return (
    <>
      <AppHeader />
      <main className="flex-1 flex flex-col w-full mt-16 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-w-0 pb-24 lg:pb-12">
        <div className="flex-1 w-full flex flex-col">{children}</div>
      </main>
      <Footer />

      {/* Mobile Bottom Navigation (< 1024px) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-primary/30 bg-bg/95 backdrop-blur-md z-40 lg:hidden flex items-center justify-around px-2 pb-safe cyber-panel">
        {mainNavigation.map((item) => {
          const active = item.href === "/" ? pathname === "/" : (pathname === item.href || (pathname?.startsWith(item.href) ?? false));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold uppercase tracking-wider gap-1 transition-all",
                active ? "text-primary glow-text" : "text-text-muted hover:text-text",
              )}
            >
              <div className={cn("transition-transform duration-200", active && "scale-110")}>
                {item.icon}
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => openQuickAdd()}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold uppercase tracking-wider gap-1 text-primary"
        >
          <div className="rounded-full bg-primary p-1.5 text-white neon-border">
            <Plus size={16} />
          </div>
          <span>Thêm nhanh</span>
        </button>
      </nav>

      {/* Floating Action Button (FAB) for Quick Add (Desktop only) */}
      <button
        onClick={() => openQuickAdd()}
        className="hidden lg:flex fixed bottom-6 right-6 z-40 h-14 w-14 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover hover:scale-110 active:scale-95 transition-all duration-200 neon-border"
        title="Thêm phim nhanh (Alt+N)"
        aria-label="Thêm phim nhanh"
      >
        <Plus size={26} />
      </button>
    </>
  );
}
