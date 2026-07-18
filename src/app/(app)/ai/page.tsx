"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, BookOpen, Loader2, Check, Brain, Compass } from "lucide-react";
import { AIInsightCard } from "@/components/shared/AIInsightCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FadeIn } from "@/components/motion/FadeIn";
import { useLibrary } from "@/lib/use-library";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";

interface SummaryResult {
  summary: string;
  characters: { name: string; note: string }[];
  conflicts: string[];
}

interface Recommendation {
  title: string;
  reason: string;
  matchScore: number;
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  posterPath?: string | null;
}

interface TasteResult {
  profileText: string;
  topGenres: { genre: string; count: number }[];
  topCountries: { country: string; count: number }[];
}

const MOODS = [
  { value: "nhẹ nhàng, chữa lành", label: "Muốn nhẹ đầu / Chữa lành", emoji: "🌿" },
  { value: "muốn xem phim ngược, buồn", label: "Muốn xem phim ngược / Buồn", emoji: "💧" },
  { value: "cày đêm, trinh thám gay cấn", label: "Cày đêm / Trinh thám gay cấn", emoji: "🌙" },
];

function AIPageInner() {
  const searchParams = useSearchParams();
  const { items, loading } = useLibrary();
  const { success, error: toastError, info } = useToast();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"summary" | "mood" | "taste">(
    tabParam === "mood" ? "mood" : tabParam === "taste" ? "taste" : "summary",
  );

  // ===== Summary tab =====
  const [selectedId, setSelectedId] = useState("");
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [generating, setGenerating] = useState(false);

  const showParam = searchParams.get("show");
  const currentId = useMemo(() => {
    if (selectedId) return selectedId;
    if (showParam) {
      const m = items.find((i) => String(i.mediaItem.tmdbId) === showParam);
      if (m) return m.id;
    }
    return items[0]?.id ?? "";
  }, [selectedId, showParam, items]);

  const currentItem = items.find((i) => i.id === currentId) ?? null;

  useEffect(() => {
    if (!currentId) return;
    let active = true;
    api.get<SummaryResult | null>("/api/ai/summary", { watchItemId: currentId }).then((res) => {
      if (!active) return;
      setSummary(res.success && res.data ? res.data : null);
    });
    return () => {
      active = false;
    };
  }, [currentId]);

  async function generate() {
    if (!currentId) return;
    setGenerating(true);
    const res = await api.post<{ summary: SummaryResult }>("/api/ai/summary", {
      watchItemId: currentId,
    });
    setGenerating(false);
    if (res.success && res.data) {
      setSummary(res.data.summary);
      success("Đã tạo tóm tắt (đã lưu lại để xem sau).");
    } else {
      toastError(res.error ?? "Không thể tạo tóm tắt.");
    }
  }

  async function saveToNotes() {
    if (!currentId || !summary) return;
    const res = await api.patch("/api/library", { watchItemId: currentId, notes: summary.summary });
    if (res.success) success("Đã lưu tóm tắt vào ghi chú phim.");
    else toastError(res.error ?? "Không thể lưu ghi chú.");
  }

  // ===== Mood tab =====
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState("");
  const [moodRecs, setMoodRecs] = useState<Recommendation[] | null>(null);
  const [loadingMood, setLoadingMood] = useState(false);

  async function selectMood(mood: string) {
    setSelectedMood(mood);
    setLoadingMood(true);
    const res = await api.post<{ recommendations: Recommendation[] }>("/api/ai/recommend", {
      mood,
    });
    setLoadingMood(false);
    if (res.success && res.data) {
      setMoodRecs(res.data.recommendations);
    } else {
      setMoodRecs([]);
      toastError(res.error ?? "Không thể tạo gợi ý.");
    }
  }

  async function addRec(rec: Recommendation) {
    if (rec.tmdbId && rec.mediaType) {
      const res = await api.post("/api/library", {
        tmdbId: rec.tmdbId,
        mediaType: rec.mediaType,
        status: "want_to_watch",
      });
      if (res.success) success(`Đã thêm "${rec.title}" vào watchlist.`);
      else toastError(res.error ?? "Không thể thêm vào watchlist.");
    } else {
      info("Mở trang Khám phá để tìm và thêm phim này.");
      router.push(`/discover?q=${encodeURIComponent(rec.title)}`);
    }
  }

  function viewRec(rec: Recommendation) {
    if (rec.tmdbId && rec.mediaType) {
      router.push(`/${rec.mediaType === "tv" ? "show" : "movie"}/${rec.tmdbId}`);
    } else {
      router.push(`/discover?q=${encodeURIComponent(rec.title)}`);
    }
  }

  // ===== Taste profile tab =====
  const [taste, setTaste] = useState<TasteResult | null>(null);
  const [loadingTaste, setLoadingTaste] = useState(false);

  useEffect(() => {
    let active = true;
    api.get<TasteResult | null>("/api/ai/taste-profile").then((res) => {
      if (!active) return;
      setTaste(res.success && res.data ? res.data : null);
    });
    return () => {
      active = false;
    };
  }, []);

  async function analyzeTaste() {
    setLoadingTaste(true);
    const res = await api.post<TasteResult>("/api/ai/taste-profile");
    setLoadingTaste(false);
    if (res.success && res.data) {
      setTaste(res.data);
      success("Đã phân tích gu xem phim của bạn.");
    } else {
      toastError(res.error ?? "Không thể phân tích gu.");
    }
  }

  return (
    <FadeIn className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <Badge
            variant="outline"
            className="mb-2 bg-secondary/15 text-secondary border-secondary/30"
          >
            <Sparkles size={10} /> AI · Beta
          </Badge>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            <Sparkles className="text-secondary animate-pulse" size={24} />
            Trợ lý AI PhimFlow
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Tóm tắt không spoil tới tập bạn đang xem và gợi ý phim theo tâm trạng.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="summary">
            <BookOpen size={14} className="mr-1.5" /> Tóm tắt không spoil
          </TabsTrigger>
          <TabsTrigger value="mood">
            <Compass size={14} className="mr-1.5" /> Gợi ý theo tâm trạng
          </TabsTrigger>
          <TabsTrigger value="taste">
            <Brain size={14} className="mr-1.5" /> Gu xem phim
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid items-start gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-4 p-5">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                  <BookOpen size={14} />
                  Thiết lập tóm tắt
                </h3>

                {loading ? (
                  <div className="skeleton-shimmer h-10 w-full rounded-xl" />
                ) : items.length === 0 ? (
                  <p className="text-xs text-text-secondary">
                    Thư viện trống. Thêm phim để dùng tính năng tóm tắt.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="ai-show"
                        className="text-[10px] font-semibold uppercase tracking-wider text-text-muted"
                      >
                        Chọn phim
                      </label>
                      <Select value={currentId} onValueChange={setSelectedId}>
                        <SelectTrigger id="ai-show">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((i) => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.mediaItem.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-xl border border-warning/30 bg-paused/10 p-3 text-[11px] leading-relaxed text-text-secondary">
                      🚨 AI chỉ tóm tắt tới{" "}
                      {currentItem?.mediaItem.mediaType === "tv"
                        ? `hết tập ${currentItem?.currentEpisode ?? 0}`
                        : "nội dung an toàn"}
                      , không tiết lộ diễn biến sau đó.
                    </div>

                    <Button
                      onClick={generate}
                      disabled={generating || !currentId}
                      className="w-full"
                    >
                      {generating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> AI đang xử lý...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="fill-current" />
                          Tạo tóm tắt không spoil
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex min-h-[280px] flex-col p-5">
                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                  <Sparkles size={14} />
                  Kết quả tóm tắt AI
                </h3>

                {generating ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <Loader2 size={32} className="mb-3 animate-spin text-primary" />
                    <p className="text-xs text-text-secondary">AI đang soạn tóm tắt an toàn...</p>
                  </div>
                ) : !summary ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center text-text-muted">
                    <BookOpen size={36} className="mb-3 opacity-40" />
                    <p className="max-w-xs text-xs leading-relaxed">
                      Chọn phim và bấm nút để nhận tóm tắt không spoil từ AI.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="whitespace-pre-line rounded-xl border border-border bg-card/50 p-4 text-xs leading-relaxed text-text">
                        {summary.summary}
                      </div>
                      {summary.characters.length > 0 && (
                        <div>
                          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                            Nhân vật
                          </div>
                          <ul className="flex flex-col gap-1.5">
                            {summary.characters.map((c, i) => (
                              <li key={i} className="text-xs text-text-secondary">
                                <span className="font-bold text-text">{c.name}:</span> {c.note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end border-t border-border pt-3">
                      <Button variant="outline" size="sm" onClick={saveToNotes}>
                        <Check size={12} />
                        Lưu vào ghi chú phim
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mood">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Chọn tâm trạng hiện tại
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => selectMood(m.value)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      selectedMood === m.value
                        ? "border-secondary bg-secondary/10 shadow-[0_0_24px_oklch(0.82_0.16_75_/_0.3)]"
                        : "border-border bg-card hover:border-border-hover"
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <div className="text-xs font-bold">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {loadingMood ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                  <Loader2 size={28} className="animate-spin text-primary" />
                  <p className="text-xs text-text-secondary">AI đang chọn phim hợp gu bạn...</p>
                </CardContent>
              </Card>
            ) : moodRecs && moodRecs.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {moodRecs.map((r, idx) => (
                  <AIInsightCard
                    key={idx}
                    title={r.title}
                    reason={r.reason}
                    matchScore={r.matchScore}
                    onAddWatchlist={() => addRec(r)}
                    onViewDetails={() => viewRec(r)}
                  />
                ))}
              </div>
            ) : moodRecs ? (
              <Card>
                <CardContent className="py-12 text-center text-xs text-text-secondary">
                  Chưa có gợi ý phù hợp. Thử tâm trạng khác nhé.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-xs text-text-muted">
                  Chọn một tâm trạng ở trên để nhận gợi ý từ AI.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="taste">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p className="max-w-lg text-xs leading-relaxed text-text-secondary">
                AI phân tích thể loại, quốc gia và điểm bạn đã chấm để mô tả gu xem phim của bạn.
              </p>
              <Button onClick={analyzeTaste} disabled={loadingTaste}>
                {loadingTaste ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="fill-current" />
                    Phân tích gu của tôi
                  </>
                )}
              </Button>
            </div>

            {taste ? (
              <div className="flex flex-col gap-5">
                <Card className="overflow-hidden border-secondary/30">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 0%, oklch(0.82 0.16 75 / 0.5) 0%, transparent 60%)",
                    }}
                  />
                  <CardContent className="relative flex flex-col gap-3 p-5">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                      <Brain size={14} />
                      Nhận định gu
                    </h3>
                    <p className="text-sm leading-relaxed text-text">{taste.profileText}</p>
                  </CardContent>
                </Card>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TasteBars
                    title="Thể loại yêu thích"
                    data={taste.topGenres.map((g) => ({ label: g.genre, count: g.count }))}
                  />
                  <TasteBars
                    title="Quốc gia yêu thích"
                    data={taste.topCountries.map((c) => ({ label: c.country, count: c.count }))}
                  />
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-xs text-text-muted">
                  Chưa có phân tích. Bấm &ldquo;Phân tích gu của tôi&rdquo; để bắt đầu.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </FadeIn>
  );
}

function TasteBars({ title, data }: { title: string; data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">{title}</h3>
        {data.length === 0 ? (
          <p className="text-xs text-text-muted">Chưa đủ dữ liệu.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.map((d) => (
              <div key={d.label} className="flex items-center gap-3 text-xs">
                <span className="w-24 shrink-0 truncate text-text-secondary">{d.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${(d.count / max) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right font-mono text-text-muted">{d.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AIPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-xs text-text-secondary">Đang tải…</div>}
    >
      <AIPageInner />
    </Suspense>
  );
}
