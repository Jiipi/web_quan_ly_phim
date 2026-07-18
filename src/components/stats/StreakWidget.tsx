"use client";

import * as React from "react";
import { Flame, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface StreakWidgetProps {
  current: number;
  longest: number;
  className?: string;
}

export function StreakWidget({ current, longest, className }: StreakWidgetProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-4 p-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
            current > 0
              ? "bg-primary/15 text-primary shadow-[0_0_24px_oklch(0.68_0.22_18_/_0.35)]"
              : "bg-card text-text-muted"
          }`}
        >
          <Flame className={current > 0 ? "animate-pulse" : ""} size={28} />
        </motion.div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Chuỗi xem liên tục
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <motion.span
              key={current}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-mono text-3xl font-extrabold text-gradient-cinema"
            >
              {current}
            </motion.span>
            <span className="text-xs text-text-secondary">ngày</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-text-muted">
            <Trophy size={10} className="text-secondary" />
            <span>Kỷ lục: </span>
            <span className="font-mono font-bold text-secondary">{longest}</span>
            <span> ngày</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
