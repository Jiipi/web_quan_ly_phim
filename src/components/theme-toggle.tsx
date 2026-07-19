"use client";

import * as React from "react";
import { Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Switch giữa Cinematic Dark (neon cyberpunk) và Light Mode.
 * Lưu trong localStorage (next-themes) và đồng bộ xuống DB `pref.theme`
 * khi user đã đăng nhập (xem useThemeSync hook).
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useT();
  // Tránh flash sai icon khi mount (next-themes chưa hydrate).
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const current = (theme === "system" ? resolvedTheme : theme) ?? "dark";
  const isDark = current === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("theme.toggle.aria.dark") : t("theme.toggle.aria.light")}
      title={isDark ? t("theme.toggle.aria.dark") : t("theme.toggle.aria.light")}
      className={cn(
        "relative inline-flex h-9 w-[68px] items-center gap-1 overflow-hidden rounded-full",
        "border border-primary/60 bg-primary/10 px-2 text-[10px] font-bold uppercase tracking-wider text-primary",
        "transition-all duration-200 hover:bg-primary/20",
        // Cyber glow chỉ áp dụng khi dark mode.
        "dark:shadow-[0_0_12px_var(--neon-pink-soft),inset_0_0_8px_var(--neon-pink-soft)]",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!mounted ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-1"
          >
            <Loader2 size={11} className="animate-spin" />
            <span>—</span>
          </motion.span>
        ) : isDark ? (
          <motion.span
            key="dark"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1"
          >
            <Moon size={12} className="fill-current" />
            <span>{t("theme.toggle.dark")}</span>
          </motion.span>
        ) : (
          <motion.span
            key="light"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1"
          >
            <Sun size={12} className="fill-current" />
            <span>{t("theme.toggle.light")}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
