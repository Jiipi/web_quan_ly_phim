"use client";

import * as React from "react";
import { Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Cyber theme indicator — fixed to NEON_CYBER dark mode.
 * Acts as a stylish neon status badge instead of a theme switch.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  return (
    <button
      type="button"
      aria-label="Cyber Neon Mode"
      title="Cyber Neon Mode đang bật"
      className={cn(
        "relative inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-full",
        "border border-primary/60 bg-primary/10 px-2.5 text-[10px] font-bold uppercase tracking-wider text-primary",
        "transition-all duration-200 hover:bg-primary/20",
        "shadow-[0_0_12px_oklch(0.72_0.32_330_/_0.45),inset_0_0_8px_oklch(0.72_0.32_330_/_0.25)]",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key="neon"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center gap-1.5"
        >
          <Zap size={13} className="fill-current" />
          <span>Cyber</span>
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

