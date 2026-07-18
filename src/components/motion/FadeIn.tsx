"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps {
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  children: React.ReactNode;
}

export function FadeIn({ delay = 0, duration = 0.4, y = 16, className, children }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

interface FadeInViewProps {
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  children: React.ReactNode;
}

export function FadeInView({
  delay = 0,
  duration = 0.4,
  y = 16,
  className,
  children,
}: FadeInViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
