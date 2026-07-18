"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { GENRE_OPTIONS, COUNTRY_OPTIONS } from "@/lib/preferences-schema";
import { cn } from "@/lib/utils";

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function OnboardingForm() {
  const router = useRouter();
  const [genres, setGenres] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [preferTvShows, setPreferTvShows] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(skip: boolean) {
    setSaving(true);
    setError(null);
    const payload = skip
      ? { favGenres: [], favCountries: [], preferTvShows: false }
      : { favGenres: genres, favCountries: countries, preferTvShows };
    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
      router.push("/");
      router.refresh();
    } catch {
      setError("Không thể lưu lựa chọn. Vui lòng thử lại.");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-dropped/30 bg-dropped/10 px-3 py-2 text-xs text-dropped"
        >
          {error}
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold text-white">Bạn thích thể loại nào?</h2>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((g) => {
            const active = genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() => setGenres((prev) => toggle(prev, g))}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/20",
                )}
              >
                {active && <Check size={12} />}
                {g}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-white">Bạn hay xem phim nước nào?</h2>
        <div className="flex flex-wrap gap-2">
          {COUNTRY_OPTIONS.map((c) => {
            const active = countries.includes(c.code);
            return (
              <button
                key={c.code}
                type="button"
                aria-pressed={active}
                onClick={() => setCountries((prev) => toggle(prev, c.code))}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "border-secondary bg-secondary/15 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/20",
                )}
              >
                {active && <Check size={12} />}
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-sm font-semibold text-white">Tôi thích phim bộ (nhiều tập) hơn</span>
        <input
          type="checkbox"
          checked={preferTvShows}
          onChange={(e) => setPreferTvShows(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
      </label>

      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving}
          className="text-xs font-semibold text-white/50 hover:text-white/80 disabled:opacity-60"
        >
          Bỏ qua
        </button>
        <button
          type="button"
          onClick={() => save(false)}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles size={16} />
          {saving ? "Đang lưu…" : "Hoàn tất & Bắt đầu"}
        </button>
      </div>
    </div>
  );
}
