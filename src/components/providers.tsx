"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { LibraryProvider } from "@/lib/use-library";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { QuickAddProvider } from "@/components/shared/QuickAddDialog";
import { api } from "@/lib/api";
import type { Preferences } from "@/lib/use-preferences";

/**
 * Đọc theme + language + ratingScale từ DB (chỉ khi đã đăng nhập) và áp lên DOM
 * + localStorage, đồng bộ next-themes.
 *
 * Quan trọng: phải đợi SessionProvider load session xong thì request /api/preferences
 * mới không bị 401. Nếu status là "loading" thì chờ; "unauthenticated" thì thôi,
 * giữ nguyên giá trị mặc định (do Settings page sẽ lo khi user đăng nhập).
 */
function ThemeSync() {
  const { status } = useSession();
  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    api
      .get<Preferences | null>("/api/preferences")
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) applyDom(res.data);
      })
      .catch(() => {
        /* nếu lỗi mạng thì thôi, không crash app */
      });
    return () => {
      active = false;
    };
  }, [status]);
  return null;
}

function applyDom(p: Preferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const theme = p.theme === "light" ? "light" : "dark";
  // Gắn class .dark lên <html> ngay để tránh flash.
  root.classList.toggle("dark", theme === "dark");
  root.lang = p.language || "vi";
  try {
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("cineos:language", p.language || "vi");
    window.localStorage.setItem("cineos:rating-scale", p.ratingScale || "10");
  } catch {
    /* ignore */
  }
}

/** Gom các context provider phía client (session, toast, confirm dialog...) để mount ở root layout. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LibraryProvider>
        <ToastProvider>
          <ConfirmProvider>
            <QuickAddProvider>
              <ThemeSync />
              {children}
            </QuickAddProvider>
          </ConfirmProvider>
        </ToastProvider>
      </LibraryProvider>
    </SessionProvider>
  );
}
