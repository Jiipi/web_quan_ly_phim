"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export interface Preferences {
  favGenres: string[];
  favCountries: string[];
  preferTvShows: boolean;
  theme: "dark" | "light";
  language: "vi" | "en";
  ratingScale: "5" | "10" | "100";
}

export const DEFAULT_PREFERENCES: Preferences = {
  favGenres: [],
  favCountries: [],
  preferTvShows: false,
  theme: "dark",
  language: "vi",
  ratingScale: "10",
};

/**
 * Hook chia sẻ preferences giữa Settings page và toàn app.
 *
 * - Lần đầu mount: fetch từ /api/preferences, fallback DEFAULT.
 * - update(patch): setState local + PUT /api/preferences.
 * - Khi server trả về sau save, đồng bộ lại để chắc chắn.
 *
 * Ngoài ra, hook này đồng bộ 3 pref "ảnh hưởng toàn app" xuống:
 * - theme: next-themes (localStorage) — app đọc ở mọi nơi qua useTheme().
 * - language: <html lang="..."> — sẵn sàng cho i18n.
 * - ratingScale: localStorage (key "cineos:rating-scale") — RatingReviewPanel đọc.
 */
export function usePreferences() {
  const { data: session } = useSession();
  const { success, error: toastError } = useToast();
  const [pref, setPref] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mount: load.
  useEffect(() => {
    if (!session?.user) {
      const timer = setTimeout(() => setLoaded(true), 0);
      return () => clearTimeout(timer);
    }
    let active = true;
    api.get<Preferences | null>("/api/preferences").then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        const next: Preferences = { ...DEFAULT_PREFERENCES, ...res.data };
        setPref(next);
        applySideEffects(next);
      }
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [session?.user]);

  async function update(patch: Partial<Preferences>) {
    const next = { ...pref, ...patch };
    setPref(next);
    applySideEffects(next);

    if (!session?.user) return; // chưa đăng nhập thì không lưu DB
    setSaving(true);
    const res = await api.put("/api/preferences", next);
    setSaving(false);
    if (!res.success) {
      toastError(res.error ?? "Không thể lưu cài đặt.");
      // rollback về state cũ để UI phản ánh đúng lỗi
      setPref(pref);
      applySideEffects(pref);
    } else {
      success("Đã lưu cài đặt.");
    }
  }

  return { pref, setPref, update, loaded, saving };
}

/**
 * Áp dụng các pref "ảnh hưởng toàn cục" ra ngoài DB.
 *
 * Lưu ý về theme:
 * - next-themes đọc từ localStorage key "theme" và gắn class .dark/.light lên <html>.
 * - Từ DB vừa load xong, ta cần áp class ngay để khớp trước khi next-themes hydrate,
 *   tránh flash sai theme. localStorage key phải trùng với storageKey của ThemeProvider.
 */
function applySideEffects(p: Preferences) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = p.language;
  const root = document.documentElement;
  if (p.theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try {
    window.localStorage.setItem("cineos:language", p.language);
    window.localStorage.setItem("cineos:rating-scale", p.ratingScale);
    window.localStorage.setItem("theme", p.theme); // next-themes key mặc định
  } catch {
    /* ignore */
  }
}

/** Đọc ratingScale từ localStorage (đồng bộ). */
export function readRatingScale(): Preferences["ratingScale"] {
  if (typeof window === "undefined") return "10";
  try {
    const v = window.localStorage.getItem("cineos:rating-scale");
    if (v === "5" || v === "10" || v === "100") return v;
  } catch {
    /* ignore */
  }
  return "10";
}
