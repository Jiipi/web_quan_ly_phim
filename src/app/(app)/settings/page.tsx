"use client";

import React, { useEffect, useRef, useState } from "react";
import { User, Key, Loader2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/FadeIn";
import { usePreferences, DEFAULT_PREFERENCES, type Preferences } from "@/lib/use-preferences";
import { RATING_SCALES, RATING_SCALE_LABELS } from "@/lib/rating-scale";
import { useT } from "@/lib/i18n";

interface TmdbStatus {
  serverKeyConfigured: boolean;
  userKeySet: boolean;
  activeSource: "user" | "server" | "mock";
  lastCheckedAt: string;
}

const POPULAR_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Documentary",
  "Family",
  "Music",
] as const;
const POPULAR_COUNTRIES = [
  { code: "VN", label: "Việt Nam" },
  { code: "US", label: "Mỹ" },
  { code: "KR", label: "Hàn Quốc" },
  { code: "JP", label: "Nhật Bản" },
  { code: "CN", label: "Trung Quốc" },
  { code: "TW", label: "Đài Loan" },
  { code: "TH", label: "Thái Lan" },
  { code: "GB", label: "Anh" },
  { code: "FR", label: "Pháp" },
] as const;

export default function SettingsPage() {
  const { data: session } = useSession();
  const { pref, update, loaded } = usePreferences();
  const { t } = useT();

  const userName = session?.user?.name || "Người dùng";
  const userEmail = session?.user?.email || "";
  const userInitial = (session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase();

  return (
    <FadeIn className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{t("settings.title")}</h1>
        <p className="mt-1 text-xs text-text-secondary">{t("settings.subtitle")}</p>
      </div>

      {!loaded ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Section: Cá nhân */}
          <Card>
            <CardContent className="flex flex-col gap-5 p-5">
              <SectionTitle icon={<User size={14} />}>{t("settings.section.account")}</SectionTitle>
              <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-card/20 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                  {userInitial}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">{userName}</h4>
                  <p className="text-xs text-text-muted">{userEmail}</p>
                </div>
              </div>

              <Divider />

              <SectionTitle>{t("settings.section.display")}</SectionTitle>
              <div className="grid gap-4 text-xs sm:grid-cols-2">
                <Field label={t("settings.theme.label")}>
                  <select
                    value={pref.theme}
                    onChange={(e) => update({ theme: e.target.value as Preferences["theme"] })}
                    className="h-10 w-full rounded-md border border-primary/30 bg-bg/60 px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="dark">{t("settings.theme.dark")}</option>
                    <option value="light">{t("settings.theme.light")}</option>
                  </select>
                </Field>

                <Field label={t("settings.language.label")}>
                  <select
                    value={pref.language}
                    onChange={(e) =>
                      update({ language: e.target.value as Preferences["language"] })
                    }
                    className="h-10 w-full rounded-md border border-primary/30 bg-bg/60 px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </Field>

                <Field label={t("settings.rating.label")} className="sm:col-span-2">
                  <select
                    value={pref.ratingScale}
                    onChange={(e) =>
                      update({
                        ratingScale: e.target.value as Preferences["ratingScale"],
                      })
                    }
                    className="h-10 w-full rounded-md border border-primary/30 bg-bg/60 px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {RATING_SCALES.map((s) => (
                      <option key={s} value={s}>
                        {RATING_SCALE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-text-muted">{t("settings.rating.hint")}</p>
                </Field>
              </div>

              <Divider />

              <SectionTitle>{t("settings.section.preferences")}</SectionTitle>
              <ChipMultiSelect
                label={t("settings.fav.genres")}
                options={POPULAR_GENRES.map((g) => ({ value: g, label: g }))}
                values={pref.favGenres}
                onChange={(v) => update({ favGenres: v })}
              />
              <ChipMultiSelect
                label={t("settings.fav.countries")}
                options={POPULAR_COUNTRIES.map((c) => ({ value: c.code, label: c.label }))}
                values={pref.favCountries}
                onChange={(v) => update({ favCountries: v })}
              />
              <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={pref.preferTvShows}
                  onChange={(e) => update({ preferTvShows: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-bg/40 accent-primary"
                />
                {t("settings.fav.tv-prefer")}
              </label>
            </CardContent>
          </Card>

          {/* Section: TMDb API */}
          <ApiCard />
        </>
      )}
    </FadeIn>
  );
}

/* ------------------------------------------------------------------ */
/* TMDb API card                                                       */
/* ------------------------------------------------------------------ */

function ApiCard() {
  const { success } = useToast();
  const { t } = useT();
  const [status, setStatus] = useState<TmdbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<TmdbStatus>("/api/settings/tmdb-status"),
      new Promise<string | null>((resolve) => {
        if (typeof document === "undefined") return resolve(null);
        const m = document.cookie.match(/(^| )tmdb_api_key=([^;]+)/);
        resolve(m ? m[2] : null);
      }),
    ]).then(([statusRes, cookieKey]) => {
      if (!active) return;
      if (statusRes.success && statusRes.data) setStatus(statusRes.data);
      if (cookieKey) setApiKeyInput(cookieKey);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  function saveApiKey() {
    const key = apiKeyInput.trim();
    setSaving(true);
    if (key) {
      document.cookie = `tmdb_api_key=${key}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      success("Đã cấu hình khoá API cá nhân.");
    } else {
      document.cookie = "tmdb_api_key=; path=/; max-age=0";
      success("Đã xoá khoá API cá nhân.");
    }
    setTimeout(() => {
      api.get<TmdbStatus>("/api/settings/tmdb-status").then((r) => {
        if (r.success && r.data) setStatus(r.data);
      });
      setSaving(false);
    }, 200);
  }

  function renderBadge() {
    if (!status) return null;
    if (status.activeSource === "user") {
      return (
        <Badge variant="outline" className="border-completed/30 bg-completed/15 text-completed">
          <CheckCircle2 size={12} className="mr-1" />
          Khoá cá nhân — dùng dữ liệu thật
        </Badge>
      );
    }
    if (status.activeSource === "server") {
      return (
        <Badge variant="outline" className="border-primary/30 bg-primary/15 text-primary">
          <CheckCircle2 size={12} className="mr-1" />
          Khoá hệ thống — dữ liệu thật
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-secondary/30 bg-secondary/15 text-secondary">
        <AlertCircle size={12} className="mr-1" />
        Mock Mode — dữ liệu giả lập
      </Badge>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <SectionTitle icon={<Key size={14} />}>TMDb API Key (tùy chọn)</SectionTitle>
        <p className="text-[11px] leading-relaxed text-text-secondary">
          Hệ thống đã có khoá TMDb mặc định để tra cứu phim. Bạn có thể dán khoá cá nhân (v3 auth)
          để dùng hạn mức và quota riêng. Khoá lưu ở cookie trình duyệt.
        </p>

        <div className="flex items-center justify-between rounded-md border border-white/5 bg-card/30 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Trạng thái hiện tại
          </span>
          {loading ? <Skeleton className="h-5 w-32" /> : renderBadge()}
        </div>

        {!loading && status && (
          <ul className="grid grid-cols-1 gap-1 text-[10px] text-text-muted sm:grid-cols-3">
            <li className="flex items-center gap-1.5">
              {status.serverKeyConfigured ? (
                <CheckCircle2 size={11} className="text-completed" />
              ) : (
                <AlertCircle size={11} className="text-text-muted" />
              )}
              Khoá server: {status.serverKeyConfigured ? "đã cấu hình" : "trống"}
            </li>
            <li className="flex items-center gap-1.5">
              {status.userKeySet ? (
                <CheckCircle2 size={11} className="text-completed" />
              ) : (
                <AlertCircle size={11} className="text-text-muted" />
              )}
              Khoá cá nhân: {status.userKeySet ? "đã lưu" : "trống"}
            </li>
            <li>
              Nguồn: <span className="font-mono text-text">{status.activeSource}</span>
            </li>
          </ul>
        )}

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label
              htmlFor="tmdb-key-input"
              className="text-[10px] font-semibold uppercase tracking-wider text-text-muted"
            >
              Khoá cá nhân (TMDb v3 auth)
            </label>
            <div className="relative">
              <Input
                id="tmdb-key-input"
                type={revealed ? "text" : "password"}
                placeholder="Nhập khoá của bạn hoặc để trống..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="pr-16"
              />
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-text-muted hover:text-text"
              >
                {revealed ? t("common.close") : "Hiện"}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveApiKey} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {apiKeyInput.trim() ? t("tmdb.save") : t("tmdb.clear")}
            </Button>
            {apiKeyInput && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setApiKeyInput("")}
                aria-label={t("common.delete")}
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>

        <p className="text-[10px] text-text-muted">
          {t("tmdb.get-key")}{" "}
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary hover:underline"
          >
            TMDb Settings
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
      {icon}
      {children}
    </h3>
  );
}

function Divider() {
  return <div className="h-px bg-border" />;
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function ChipMultiSelect({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(value: string) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  }
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = values.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={
                active
                  ? "rounded-full border border-primary/50 bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                  : "rounded-full border border-white/10 bg-bg/40 px-2.5 py-0.5 text-[11px] text-text-secondary hover:border-white/25 hover:text-text"
              }
              aria-pressed={active}
            >
              {active && "✓ "}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
