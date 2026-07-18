import React from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatsCard({ label, value, icon, description, className }: StatsCardProps) {
  return (
    <div className={cn("stats-card flex flex-col justify-between hover-lift", className)}>
      <div className="flex justify-between items-start w-full mb-3">
        <span className="text-xs font-semibold tracking-wider uppercase text-text-muted">
          {label}
        </span>
        {icon && <div className="text-primary opacity-80">{icon}</div>}
      </div>
      <div>
        <div className="stat-value select-all font-mono font-extrabold text-3xl mb-1 tracking-tight">
          {value}
        </div>
        {description && <p className="text-xs text-text-secondary line-clamp-1">{description}</p>}
      </div>
    </div>
  );
}
