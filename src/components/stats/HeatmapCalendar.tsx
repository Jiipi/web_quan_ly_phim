"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface HeatmapDay {
  date: string; // ISO YYYY-MM-DD
  count: number;
}

interface HeatmapCalendarProps {
  data: HeatmapDay[];
  weeks?: number;
  className?: string;
}

/**
 * GitHub-style heatmap calendar.
 * Renders `weeks` columns (7 cells each = 7 days per week), labelled by weekday.
 * Auto-computes intensity buckets from the data range.
 */
export function HeatmapCalendar({ data, weeks = 26, className }: HeatmapCalendarProps) {
  const map = React.useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => m.set(d.date, d.count));
    return m;
  }, [data]);

  // Find max for bucketing.
  const maxCount = React.useMemo(() => {
    let max = 0;
    data.forEach((d) => {
      if (d.count > max) max = d.count;
    });
    return max;
  }, [data]);

  // Generate cells for the last `weeks` weeks (most recent at right).
  const cells = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Find most recent Sunday so weeks align
    const dayOfWeek = today.getDay();
    const result: Array<{ date: string; count: number; dateObj: Date }> = [];
    // Start from `weeks` weeks ago, same day-of-week
    const start = new Date(today);
    start.setDate(start.getDate() - (weeks - 1) * 7 - dayOfWeek);
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      result.push({ date: iso, count: map.get(iso) ?? 0, dateObj: d });
    }
    return result;
  }, [data, map, weeks]);

  // Bucket intensity into 5 levels.
  const intensity = (count: number): 0 | 1 | 2 | 3 | 4 => {
    if (count === 0 || maxCount === 0) return 0;
    const ratio = count / maxCount;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  const intensityClass = (lvl: 0 | 1 | 2 | 3 | 4) => {
    switch (lvl) {
      case 0:
        return "bg-card/60 border-border/40";
      case 1:
        return "bg-primary/20 border-primary/30";
      case 2:
        return "bg-primary/40 border-primary/50";
      case 3:
        return "bg-primary/65 border-primary/70";
      case 4:
        return "bg-primary border-primary";
      default:
        return "bg-card/60";
    }
  };

  const monthLabels = React.useMemo(() => {
    // Get month for each week's first cell
    const labels: Array<{ week: number; month: string }> = [];
    let lastMonth = -1;
    for (let w = 0; w < weeks; w++) {
      const idx = w * 7;
      const d = cells[idx]?.dateObj;
      if (!d) continue;
      const m = d.getMonth();
      if (m !== lastMonth) {
        labels.push({ week: w, month: `T${m + 1}` });
        lastMonth = m;
      }
    }
    return labels;
  }, [cells, weeks]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn("flex flex-col gap-2", className)}>
        {/* Month labels */}
        <div className="relative ml-7 h-4 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {monthLabels.map((m) => (
            <span key={m.week} className="absolute" style={{ left: `${(m.week / weeks) * 100}%` }}>
              {m.month}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          {/* Weekday labels */}
          <div className="flex flex-col gap-[3px] pt-0.5 text-[9px] font-bold uppercase tracking-wider text-text-muted">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d, i) => (
              <span
                key={d}
                className="h-[12px] leading-[12px]"
                style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
              >
                {d}
              </span>
            ))}
          </div>
          {/* Grid */}
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
            {cells.map((cell) => {
              const lvl = intensity(cell.count);
              const isFuture = cell.dateObj > new Date();
              return (
                <Tooltip key={cell.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-[12px] w-[12px] rounded-[3px] border transition-all duration-200",
                        intensityClass(lvl),
                        isFuture && "opacity-30",
                        cell.count > 0 && "cursor-help hover:scale-125 hover:z-10",
                      )}
                      aria-label={`${cell.date}: ${cell.count} tập`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-0.5">
                      <div className="font-mono text-[10px] font-bold">{cell.date}</div>
                      <div className="text-xs">
                        {cell.count > 0 ? `${cell.count} tập` : "Không có hoạt động"}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
        {/* Legend */}
        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          <span>Ít</span>
          <div className="flex gap-[3px]">
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div
                key={lvl}
                className={cn(
                  "h-[12px] w-[12px] rounded-[3px] border",
                  intensityClass(lvl as 0 | 1 | 2 | 3 | 4),
                )}
              />
            ))}
          </div>
          <span>Nhiều</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
