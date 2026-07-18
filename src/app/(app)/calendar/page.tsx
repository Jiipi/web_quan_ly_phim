"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Award, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toDateKey, toMonthParam } from "@/lib/calendar";

interface DiaryEntry {
  id: string;
  date: string;
  watchedAt: string;
  title: string;
  episodeNumber: number | null;
  mediaType: string;
}

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export default function CalendarPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const year = current.getFullYear();
  const month = current.getMonth();
  const todayKey = toDateKey(new Date());

  useEffect(() => {
    let active = true;
    const monthParam = toMonthParam(current);
    api.get<{ entries: DiaryEntry[] }>("/api/calendar", { month: monthParam }).then((res) => {
      if (!active) return;
      setEntries(res.success && res.data ? res.data.entries : []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [current]);

  // Nhóm entries theo ngày.
  const byDate = useMemo(() => {
    const m = new Map<string, DiaryEntry[]>();
    for (const e of entries) {
      const arr = m.get(e.date) ?? [];
      arr.push(e);
      m.set(e.date, arr);
    }
    return m;
  }, [entries]);

  // Ô lịch.
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { day: number; key: string | null }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: 0, key: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      key: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  return (
    <div className="flex animate-fade-in-up flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nhật ký &amp; Lịch xem</h1>
          <p className="mt-1 text-xs text-text-secondary">
            Lịch sử xem phim hàng ngày, tổng hợp từ hoạt động cập nhật tiến độ của bạn.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-3">
        {/* Lịch tháng */}
        <div className="glass-panel flex flex-col gap-4 p-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <CalendarIcon size={16} className="text-primary" />
              {MONTH_NAMES[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrent(new Date(year, month - 1, 1))}
                aria-label="Tháng trước"
                className="rounded-lg border border-white/8 p-1.5 text-text-secondary transition-colors hover:bg-white/5 hover:text-text"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrent(new Date(year, month + 1, 1))}
                aria-label="Tháng sau"
                className="rounded-lg border border-white/8 p-1.5 text-text-secondary transition-colors hover:bg-white/5 hover:text-text"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-text-muted">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell, index) => {
              if (cell.key === null) return <div key={`pad-${index}`} className="aspect-square" />;
              const logs = byDate.get(cell.key) ?? [];
              const isToday = cell.key === todayKey;
              return (
                <div
                  key={cell.key}
                  className={cn(
                    "relative flex aspect-square select-none flex-col justify-between rounded-lg border p-1.5 transition-all",
                    "border-white/5 bg-card text-text",
                    logs.length > 0 && "border-primary/20 bg-primary/5",
                    isToday && "border-primary ring-1 ring-primary",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] font-semibold",
                      isToday && "font-bold text-primary",
                    )}
                  >
                    {cell.day}
                  </span>
                  {logs.length > 0 && (
                    <div className="mt-1 flex max-h-[80%] flex-col gap-0.5 overflow-hidden">
                      {logs.slice(0, 3).map((log) => (
                        <div
                          key={log.id}
                          title={`${log.title}${log.episodeNumber ? ` - Tập ${log.episodeNumber}` : ""}`}
                          className="truncate rounded border border-watching/10 bg-watching/10 px-1 py-0.5 text-[8px] font-bold leading-tight text-watching"
                        >
                          {log.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline nhật ký */}
        <div className="flex flex-col gap-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-text-muted">
            <Award size={14} className="text-secondary" />
            Nhật ký trong tháng
          </h3>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={22} className="animate-spin text-primary" />
            </div>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-xs text-text-muted">
              Chưa có hoạt động xem nào trong tháng này.
            </p>
          ) : (
            <div className="relative flex flex-col gap-4 border-l border-white/8 py-2 pl-4">
              {entries.map((item) => (
                <div key={item.id} className="relative flex flex-col gap-1 text-xs">
                  <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-surface bg-primary" />
                  <span className="font-mono text-[10px] text-text-muted">{item.date}</span>
                  <div className="flex flex-wrap items-center gap-1">
                    <h4 className="font-bold text-text">{item.title}</h4>
                    {item.episodeNumber ? (
                      <span className="rounded border border-watching/15 bg-watching/10 px-1.5 text-[9px] font-bold text-watching">
                        Tập {item.episodeNumber}
                      </span>
                    ) : (
                      <span className="rounded border border-completed/15 bg-completed/10 px-1.5 text-[9px] font-bold text-completed">
                        Phim lẻ
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
