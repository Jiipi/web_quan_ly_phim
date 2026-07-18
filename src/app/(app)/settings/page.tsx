"use client";

import React, { useEffect, useRef, useState } from "react";
import { Video, Database, Key, Download, Upload, Loader2, User, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/FadeIn";

interface Preference {
  favGenres: string[];
  favCountries: string[];
  preferTvShows: boolean;
  theme: string;
  language: string;
  ratingScale: string;
}

export default function SettingsPage() {
  const { success, error: toastError } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Người dùng";
  const userEmail = session?.user?.email || "";
  const userInitial = (session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase();

  const [pref, setPref] = useState<Preference>({
    favGenres: [],
    favCountries: [],
    preferTvShows: false,
    theme: "dark",
    language: "vi",
    ratingScale: "10",
  });
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["account", "data", "ai", "api"].includes(tab)) {
      // Defer to avoid setState-in-effect cascade warning (settings tab sync)
      const id = window.setTimeout(() => setActiveTab(tab), 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  // Cookie read is sync — wrap in rAF to avoid setState-in-effect warning.
  useEffect(() => {
    const match = document.cookie.match(/(^| )tmdb_api_key=([^;]+)/);
    if (!match) return;
    const raf = requestAnimationFrame(() => setApiKeyInput(match[2]));
    return () => cancelAnimationFrame(raf);
  }, []);

  function saveApiKey() {
    const key = apiKeyInput.trim();
    if (key) {
      document.cookie = `tmdb_api_key=${key}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      success("Đã cấu hình API Key cá nhân thành công!");
    } else {
      document.cookie = "tmdb_api_key=; path=/; max-age=0";
      success("Đã xoá API Key cá nhân. Hệ thống quay về Mock Mode.");
    }
    router.refresh();
  }

  useEffect(() => {
    let active = true;
    api.get<Preference | null>("/api/preferences").then((res) => {
      if (!active) return;
      if (res.success && res.data) setPref((p) => ({ ...p, ...res.data }));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function savePreferences() {
    setSaving(true);
    const res = await api.put("/api/preferences", {
      favGenres: pref.favGenres,
      favCountries: pref.favCountries,
      preferTvShows: pref.preferTvShows,
      theme: pref.theme,
      language: pref.language,
      ratingScale: pref.ratingScale,
    });
    setSaving(false);
    if (res.success) success("Đã lưu cài đặt.");
    else toastError(res.error ?? "Không thể lưu cài đặt.");
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await api.post<{ counts: Record<string, number> }>("/api/import", json);
      if (res.success && res.data) {
        success(`Đã nhập ${res.data.counts.library} phim, ${res.data.counts.lists} danh sách.`);
      } else {
        toastError(res.error ?? "Không thể nhập dữ liệu.");
      }
    } catch {
      toastError("File JSON không hợp lệ.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <FadeIn className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Cài đặt hệ thống</h1>
        <p className="mt-1 text-xs text-text-secondary">
          Quản lý cấu hình trải nghiệm xem phim và dữ liệu cá nhân.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="account" className="flex-1">
            <User size={14} className="mr-1.5" /> Tài khoản
          </TabsTrigger>
          <TabsTrigger value="data" className="flex-1">
            <Database size={14} className="mr-1.5" /> Dữ liệu
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex-1">
            <Sparkles size={14} className="mr-1.5" /> AI
          </TabsTrigger>
          <TabsTrigger value="api" className="flex-1">
            <Key size={14} className="mr-1.5" /> API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                <User size={14} />
                Thông tin cá nhân
              </h3>
              <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-card/20 p-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {userInitial}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{userName}</h4>
                  <p className="text-xs text-text-muted">{userEmail}</p>
                </div>
              </div>

              <div className="h-px bg-white/5 my-2" />

              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                <Video size={14} />
                Giao diện &amp; Trải nghiệm
              </h3>

              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="grid gap-4 text-xs sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="theme" className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      Chế độ hiển thị
                    </label>
                    <select
                      id="theme"
                      value={pref.theme}
                      onChange={(e) => setPref({ ...pref, theme: e.target.value })}
                      className="h-10 rounded-xl border border-border bg-input/30 px-4 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="dark">Cinematic Dark (Mặc định)</option>
                      <option value="light">Light Mode</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="lang" className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      Ngôn ngữ hiển thị
                    </label>
                    <select
                      id="lang"
                      value={pref.language}
                      onChange={(e) => setPref({ ...pref, language: e.target.value })}
                      className="h-10 rounded-xl border border-border bg-input/30 px-4 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="scale" className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      Thang điểm đánh giá
                    </label>
                    <select
                      id="scale"
                      value={pref.ratingScale}
                      onChange={(e) => setPref({ ...pref, ratingScale: e.target.value })}
                      className="h-10 rounded-xl border border-border bg-input/30 px-4 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="10">Thang điểm 10</option>
                      <option value="5">Thang điểm 5 sao</option>
                      <option value="100">Thang điểm 100%</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button onClick={savePreferences} disabled={saving || loading}>
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    "Lưu cài đặt"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                <Database size={14} />
                Sao lưu &amp; Nhập/Xuất dữ liệu
              </h3>
              <p className="text-xs leading-relaxed text-text-secondary">
                Xuất toàn bộ thư viện, đánh giá, review và danh sách thành JSON. Nhập lại để khôi phục.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href="/api/export">
                    <Download size={13} />
                    Xuất JSON
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Upload size={13} />
                  )}
                  Nhập JSON
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={onImportFile}
                  className="hidden"
                  aria-label="Chọn file JSON để nhập"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                <Sparkles size={14} />
                Cấu hình AI
              </h3>
              <p className="text-xs leading-relaxed text-text-secondary">
                CineOS dùng <strong className="text-text">AI Mock</strong> theo mặc định —
                đã được tinh chỉnh để phản hồi thông minh dựa trên dữ liệu thư viện của bạn mà không
                tốn phí API.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3">
                  <div>
                    <div className="text-xs font-bold">Nhà cung cấp AI</div>
                    <div className="text-[10px] text-text-muted">
                      Có thể đổi sang OpenAI hoặc Google trong <code className="font-mono">.env</code>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-secondary/15 text-secondary border-secondary/30">
                    Mock (mặc định)
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3">
                  <div>
                    <div className="text-xs font-bold">Ngôn ngữ phản hồi</div>
                    <div className="text-[10px] text-text-muted">
                      Prompt AI sẽ viết bằng ngôn ngữ bạn chọn.
                    </div>
                  </div>
                  <Badge variant="outline">Tiếng Việt</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                <Key size={14} />
                Cấu hình TMDb API Key cá nhân
              </h3>
              <p className="text-[11px] leading-relaxed text-text-secondary">
                Mặc định ứng dụng sử dụng dữ liệu giả lập nếu máy chủ chưa cấu hình API Key. Dán
                khóa API (v3 auth) cá nhân của bạn để tìm kiếm hàng triệu phim thực tế. Lấy miễn phí
                tại{" "}
                <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:underline"
                >
                  TMDb
                </a>
                .
              </p>

              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label
                    htmlFor="tmdb-key-input"
                    className="text-[10px] font-semibold uppercase tracking-wider text-text-muted"
                  >
                    TMDb API Key (v3 auth)
                  </label>
                  <Input
                    id="tmdb-key-input"
                    type="password"
                    placeholder="Nhập API Key của bạn..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                </div>
                <Button onClick={saveApiKey}>Lưu API Key</Button>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-text-muted">Trạng thái:</span>
                {apiKeyInput ? (
                  <Badge variant="outline" className="bg-completed/15 text-completed border-completed/30">
                    ● Đã thiết lập — đang dùng dữ liệu thật
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-secondary/15 text-secondary border-secondary/30 animate-pulse">
                    ● Mock Mode
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </FadeIn>
  );
}