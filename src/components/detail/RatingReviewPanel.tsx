"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { RatingDisplay } from "@/components/shared/RatingDisplay";
import { RATING_ASPECTS, type RatingAspectKey } from "@/lib/rating-schema";
import { SCALE_CONFIG, from10, to10, formatScore, type RatingScale } from "@/lib/rating-scale";
import { readRatingScale } from "@/lib/use-preferences";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";

type Aspects = Record<RatingAspectKey, number>;

const DEFAULT_ASPECTS: Aspects = {
  plotScore: 8,
  actingScore: 8,
  emotionScore: 8,
  pacingScore: 8,
  musicScore: 8,
  endingScore: 8,
};

interface RatingRow extends Partial<Aspects> {
  overallScore: number;
  rewatchValue: boolean;
}

export function RatingReviewPanel({ watchItemId }: { watchItemId: string }) {
  const { success, error: toastError } = useToast();

  const [scale, setScale] = useState<RatingScale>("10");
  const [overall, setOverall] = useState(8); // lưu dạng 1-10
  const [showDetail, setShowDetail] = useState(false);
  const [aspects, setAspects] = useState<Aspects>(DEFAULT_ASPECTS);
  const [rewatch, setRewatch] = useState(false);
  const [content, setContent] = useState("");
  const [spoilers, setSpoilers] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  // Lắng nghe thay đổi ratingScale (Settings có thể đổi realtime).
  useEffect(() => {
    const nextScale = readRatingScale();
    const timer = setTimeout(() => {
      setScale(nextScale);
    }, 0);
    const onStorage = () => setScale(readRatingScale());
    window.addEventListener("storage", onStorage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Nạp đánh giá + review đã lưu.
  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<RatingRow | null>("/api/ratings", { watchItemId }),
      api.get<{ content: string; spoilers: boolean } | null>("/api/reviews", { watchItemId }),
    ]).then(([r, rv]) => {
      if (!active) return;
      if (r.success && r.data) {
        setOverall(r.data.overallScore);
        setRewatch(r.data.rewatchValue);
        const filled: Partial<Aspects> = {};
        let any = false;
        for (const { key } of RATING_ASPECTS) {
          const v = r.data[key];
          if (v != null) {
            filled[key] = v;
            any = true;
          }
        }
        if (any) {
          setAspects({ ...DEFAULT_ASPECTS, ...filled });
          setShowDetail(true);
        }
      }
      if (rv.success && rv.data) {
        setContent(rv.data.content);
        setSpoilers(rv.data.spoilers);
      }
    });
    return () => {
      active = false;
    };
  }, [watchItemId]);

  async function saveRating() {
    setSavingRating(true);
    const aspectPayload = showDetail
      ? aspects
      : {
          plotScore: null,
          actingScore: null,
          emotionScore: null,
          pacingScore: null,
          musicScore: null,
          endingScore: null,
        };
    const res = await api.put("/api/ratings", {
      watchItemId,
      overallScore: overall,
      rewatchValue: rewatch,
      ...aspectPayload,
    });
    setSavingRating(false);
    if (res.success) success("Đã lưu đánh giá.");
    else toastError(res.error ?? "Không thể lưu đánh giá.");
  }

  async function saveReview() {
    if (!content.trim()) {
      toastError("Nội dung review không được để trống.");
      return;
    }
    setSavingReview(true);
    const res = await api.put("/api/reviews", { watchItemId, content, spoilers });
    setSavingReview(false);
    if (res.success) success("Đã lưu review.");
    else toastError(res.error ?? "Không thể lưu review.");
  }

  const cfg = SCALE_CONFIG[scale];
  const displayOverall = from10(overall, scale);

  return (
    <section className="glass-card flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h2 className="text-base font-bold text-white">Đánh giá của bạn</h2>
        <RatingDisplay score={overall} size="md" />
      </div>

      {/* Overall */}
      <div className="flex flex-col gap-1.5 text-xs">
        <label htmlFor="overall" className="flex justify-between font-semibold text-text">
          <span>Điểm tổng</span>
          <span className="font-mono text-secondary">{formatScore(overall, scale)}</span>
        </label>
        <input
          id="overall"
          type="range"
          min={cfg.step}
          max={cfg.max}
          step={cfg.step}
          value={displayOverall}
          onChange={(e) => setOverall(to10(Number(e.target.value), scale))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-secondary"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-text-secondary">
        <input
          type="checkbox"
          checked={showDetail}
          onChange={(e) => setShowDetail(e.target.checked)}
          className="accent-primary"
        />
        Chấm điểm chi tiết theo khía cạnh
      </label>

      {showDetail && (
        <div className="grid gap-4 sm:grid-cols-2">
          {RATING_ASPECTS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1 text-xs">
              <label htmlFor={key} className="flex justify-between font-medium text-text-secondary">
                <span>{label}</span>
                <span className="font-mono">{formatScore(aspects[key], scale)}</span>
              </label>
              <input
                id={key}
                type="range"
                min={cfg.step}
                max={cfg.max}
                step={cfg.step}
                value={from10(aspects[key], scale)}
                onChange={(e) =>
                  setAspects((a) => ({
                    ...a,
                    [key]: to10(Number(e.target.value), scale),
                  }))
                }
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-primary"
              />
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-xs text-text-secondary">
        <input
          type="checkbox"
          checked={rewatch}
          onChange={(e) => setRewatch(e.target.checked)}
          className="accent-favorite"
        />
        <Star size={12} className="text-secondary" /> Đáng xem lại
      </label>

      <button
        onClick={saveRating}
        disabled={savingRating}
        className="self-start rounded-full bg-primary px-5 py-2 text-xs font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover disabled:opacity-60"
      >
        {savingRating ? "Đang lưu..." : "Lưu đánh giá"}
      </button>

      {/* Review */}
      <div className="flex flex-col gap-2 border-t border-white/5 pt-5">
        <label htmlFor="review" className="text-xs font-semibold text-text">
          Review / Cảm nhận
        </label>
        <textarea
          id="review"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Viết cảm nhận của bạn về phim này..."
          className="w-full resize-y rounded-lg border border-white/8 bg-white/5 p-3 text-xs text-text focus:border-primary focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={spoilers}
              onChange={(e) => setSpoilers(e.target.checked)}
              className="accent-dropped"
            />
            Có tiết lộ nội dung (spoiler)
          </label>
          <button
            onClick={saveReview}
            disabled={savingReview}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:opacity-60"
          >
            {savingReview ? "Đang lưu..." : "Lưu review"}
          </button>
        </div>
      </div>
    </section>
  );
}
