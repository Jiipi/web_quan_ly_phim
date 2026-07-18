import React from "react";
import { cn } from "@/lib/utils";

export interface RatingAspects {
  plot: number;
  cast: number;
  visuals: number;
  music: number;
  emotion: number;
}

interface DetailedRatingProps {
  values: RatingAspects;
  onChange: (newValues: RatingAspects) => void;
  className?: string;
}

const aspectsConfig: Array<{
  key: keyof RatingAspects;
  label: string;
  emoji: string;
  description: string;
  colorClass: string;
}> = [
  {
    key: "plot",
    label: "Kịch bản / Nội dung",
    emoji: "📖",
    description: "Cốt truyện, tính logic và chiều sâu nhân vật.",
    colorClass: "accent-primary",
  },
  {
    key: "cast",
    label: "Diễn xuất / Cast",
    emoji: "🎭",
    description: "Diễn đạt cảm xúc, phản ứng tương tác nhân vật.",
    colorClass: "accent-secondary",
  },
  {
    key: "visuals",
    label: "Hình ảnh / Góc máy",
    emoji: "🎨",
    description: "Màu phim, kỹ xảo, nghệ thuật quay dựng cảnh.",
    colorClass: "accent-accent",
  },
  {
    key: "music",
    label: "Âm thanh / OST",
    emoji: "🎵",
    description: "Nhạc nền, hiệu ứng âm thanh kích thích cảm xúc.",
    colorClass: "accent-watching",
  },
  {
    key: "emotion",
    label: "Cảm xúc / Đọng lại",
    emoji: "💧",
    description: "Mức độ gây nghiện, ám ảnh hay thỏa mãn cảm xúc.",
    colorClass: "accent-favorite",
  },
];

export function DetailedRating({ values, onChange, className }: DetailedRatingProps) {
  const handleSliderChange = (key: keyof RatingAspects, val: number) => {
    onChange({
      ...values,
      [key]: val,
    });
  };

  // Calculate dynamic average
  const average =
    Math.round(
      ((values.plot + values.cast + values.visuals + values.music + values.emotion) / 5) * 10,
    ) / 10;

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Đánh giá khía cạnh điện ảnh
        </h4>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-text-secondary">Điểm tính trung bình:</span>
          <span className="font-mono text-xs font-extrabold text-secondary bg-secondary/5 px-2 py-0.5 rounded border border-secondary/20 shadow-glow-gold">
            {average.toFixed(1)} / 10
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-1">
        {aspectsConfig.map((item) => {
          const val = values[item.key];
          return (
            <div key={item.key} className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-text flex items-center gap-1">
                  <span>{item.emoji}</span>
                  {item.label}
                </span>
                <span className="font-mono font-bold text-text">{val} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={val}
                onChange={(e) => handleSliderChange(item.key, Number(e.target.value))}
                className={cn(
                  "w-full transition-all cursor-pointer h-1 bg-white/5 rounded-lg appearance-none",
                  item.colorClass,
                )}
              />
              <span className="text-[9px] text-text-muted italic">{item.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
