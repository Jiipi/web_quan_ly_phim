import React from "react";
import { Sparkles, ThumbsDown, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightCardProps {
  title: string;
  reason: string;
  matchScore: number; // 0 to 100
  onAddWatchlist?: () => void;
  onNotInterested?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export function AIInsightCard({
  title,
  reason,
  matchScore,
  onAddWatchlist,
  onNotInterested,
  onViewDetails,
  className,
}: AIInsightCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl p-5 overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-secondary/5 shadow-glow-primary hover-lift",
        className,
      )}
    >
      {/* Glow highlight background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 text-secondary">
          <Sparkles size={16} className="fill-current animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Gợi Ý</span>
        </div>
        <div className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 shadow-glow-gold">
          Hợp gu {matchScore}%
        </div>
      </div>

      <h4 className="text-base font-bold text-text mb-1.5 tracking-tight">{title}</h4>
      <p className="text-xs text-text-secondary line-clamp-3 mb-5 leading-relaxed">{reason}</p>

      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex gap-2">
          {onAddWatchlist && (
            <button
              onClick={onAddWatchlist}
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary hover:bg-primary-hover text-white px-2.5 py-1.5 rounded-md transition-colors shadow-sm"
            >
              <Plus size={12} />
              Muốn xem
            </button>
          )}
          {onNotInterested && (
            <button
              onClick={onNotInterested}
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-text-secondary px-2.5 py-1.5 rounded-md border border-white/5 transition-colors"
              title="Không hợp gu"
            >
              <ThumbsDown size={12} />
              Ẩn
            </button>
          )}
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-secondary hover:text-secondary-hover transition-colors"
          >
            Chi tiết
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
