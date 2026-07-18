"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { MovieCard, type MovieCardProps } from "./MovieCard";

interface MovieGridProps {
  items: Array<Omit<MovieCardProps, "variant" | "showQuickActions"> & { id: string | number }>;
  className?: string;
  showQuickActions?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export function MovieGrid({
  items,
  className,
  showQuickActions = false,
  emptyMessage = "Chưa có dữ liệu.",
  emptyAction,
}: MovieGridProps) {
  if (items.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center gap-4 rounded-2xl p-12 text-center">
        <p className="text-sm text-text-secondary">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className,
      )}
    >
      {items.map((item, idx) => (
        <motion.div key={item.id} variants={itemVariants}>
          <MovieCard
            {...item}
            variant="grid"
            showQuickActions={showQuickActions}
            priority={idx < 6}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
