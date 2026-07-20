"use client";

import { Bug, Film, Heart, ListChecks, MessageSquareWarning } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BugReportForm } from "@/components/profile/BugReportForm";

interface ProfileBodyProps {
  name: string;
  email: string;
  initial: string;
  stats: { label: string; value: number; color: string }[];
  genres: string[];
  countries: { code: string; label: string }[];
}

/**
 * Phần UI chính của trang Profile — tách ra để dùng Tabs (client component).
 * Server component (page.tsx) chỉ fetch data và truyền xuống đây.
 */
export function ProfileBody({ name, email, initial, stats, genres, countries }: ProfileBodyProps) {
  return (
    <Tabs defaultValue="overview" className="flex flex-col gap-4">
      <TabsList className="self-start">
        <TabsTrigger value="overview">
          <ListChecks size={12} className="mr-1.5" />
          Tổng quan
        </TabsTrigger>
        <TabsTrigger value="bug-report">
          <MessageSquareWarning size={12} className="mr-1.5" />
          Báo lỗi
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="flex flex-col gap-6">
        {/* Bio banner */}
        <div className="glass-panel relative flex flex-col items-center gap-5 overflow-hidden p-6 sm:flex-row">
          <div className="absolute right-0 top-0 -z-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/10 bg-primary/20 text-2xl font-extrabold text-primary">
            {initial}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="mb-1 text-xl font-extrabold tracking-tight text-text">{name}</h2>
            <p className="font-mono text-xs text-text-muted">{email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-panel flex flex-col items-center gap-1 p-4">
              <span className={`text-lg font-extrabold ${s.color}`}>●</span>
              <span className="text-xl font-extrabold text-text">{s.value}</span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-panel flex flex-col gap-3 p-5">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
              <Heart size={14} className="fill-current text-primary" />
              Thể loại yêu thích
            </h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {genres.length > 0 ? (
                genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-text-secondary"
                  >
                    {g}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-text-muted">Chưa thiết lập</span>
              )}
            </div>
          </div>

          <div className="glass-panel flex flex-col gap-3 p-5">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
              <Film size={14} />
              Quốc gia ưa thích
            </h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {countries.length > 0 ? (
                countries.map((c) => (
                  <span
                    key={c.code}
                    className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-text-secondary"
                  >
                    {c.label}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-text-muted">Chưa thiết lập</span>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="bug-report" className="flex flex-col gap-4">
        <div className="glass-panel flex flex-col gap-2 p-5">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
            <Bug size={14} className="text-primary" />
            Báo lỗi / Góp ý
          </h3>
          <p className="text-xs leading-relaxed text-text-secondary">
            Bạn gặp lỗi khi sử dụng CineOS? Hãy mô tả chi tiết để admin có thể khắc phục. Báo cáo sẽ
            được lưu lại và gửi về email quản trị viên.
          </p>
        </div>
        <div className="glass-panel p-5">
          <BugReportForm />
        </div>
      </TabsContent>
    </Tabs>
  );
}
