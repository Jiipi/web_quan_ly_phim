"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { LibraryProvider } from "@/lib/use-library";
import { useQuickAdd } from "@/components/shared/QuickAddDialog";
import { AppHeader } from "@/components/shared/AppHeader";
import { LandingHero } from "./LandingHero";
import { UserDashboardSection } from "./UserDashboardSection";
import { LandingFeatures } from "./LandingFeatures";
import { LandingHowItWorks } from "./LandingHowItWorks";
import { LandingCTA } from "./LandingCTA";
import { LandingFooter } from "./LandingFooter";
import { Plus, Home, Film, Search, List } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function LandingInner() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { openQuickAdd } = useQuickAdd();
  const pathname = usePathname();

  const mainNavigation = [
    { name: "Trang chủ", href: "/", icon: <Home size={18} /> },
    { name: "Thư viện", href: "/library", icon: <Film size={18} /> },
    { name: "Khám phá", href: "/discover", icon: <Search size={18} /> },
    { name: "Watchlist", href: "/watchlist", icon: <List size={18} /> },
  ];

  return (
    <div className="min-h-screen text-text font-sans flex flex-col relative">
      <AppHeader />
      <LandingHero />

      {/* When logged in, render the user's dashboard right inside the landing page flow */}
      {isLoggedIn && <UserDashboardSection />}

      {!isLoggedIn && (
        <>
          <LandingFeatures />
          <LandingHowItWorks />
          <LandingCTA />
          <LandingFooter />
        </>
      )}

      {/* Floating Action Button (FAB) for Quick Add when logged in */}
      {isLoggedIn && (
        <>
          <button
            onClick={() => openQuickAdd()}
            className="hidden lg:flex fixed bottom-6 right-6 z-40 h-14 w-14 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover hover:scale-110 active:scale-95 transition-all duration-200 neon-border"
            title="Thêm phim nhanh (Alt+N)"
            aria-label="Thêm phim nhanh"
          >
            <Plus size={26} />
          </button>

          {/* Mobile Bottom Navigation (< 1024px) */}
          <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-primary/30 bg-surface/95 backdrop-blur-md z-40 lg:hidden flex items-center justify-around px-2 pb-safe cyber-panel">
            {mainNavigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold uppercase tracking-wider gap-1",
                    active ? "text-primary glow-text" : "text-text-muted hover:text-text",
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
              className="flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold uppercase tracking-wider gap-1 text-primary"
            >
              <div className="rounded-full bg-primary p-1.5 text-white neon-border">
                <Plus size={16} />
              </div>
              <span>Thêm nhanh</span>
            </button>
          </nav>
        </>
      )}
    </div>
  );
}

/**
 * Unified Landing Page for both authenticated and unauthenticated users.
 * Seamlessly integrates user dashboard widgets into the landing page flow when logged in.
 */
export function LandingContent() {
  return (
    <LibraryProvider>
      <LandingInner />
    </LibraryProvider>
  );
}
