"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovieCard, type MovieCardProps } from "./MovieCard";

interface MovieRowProps {
  title?: string;
  subtitle?: string;
  items: Array<
    Omit<MovieCardProps, "variant" | "showQuickActions" | "priority"> & { id: string | number }
  >;
  className?: string;
  showQuickActions?: boolean;
  emptyMessage?: string;
}

export function MovieRow({
  title,
  subtitle,
  items,
  className,
  showQuickActions = false,
  emptyMessage = "Chưa có dữ liệu.",
}: MovieRowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
    skipSnaps: true,
  });

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Store latest onSelect in a ref so the embla listener effect can depend only on emblaApi.
  const onSelectRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    onSelectRef.current = () => {
      if (!emblaApi) return;
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
  });

  React.useEffect(() => {
    if (!emblaApi) return;
    // Initial sync via rAF — defer to next frame so we don't fire setState in effect body.
    let rafId = 0;
    rafId = requestAnimationFrame(() => {
      onSelectRef.current();
    });
    emblaApi.on("select", onSelectRef.current);
    emblaApi.on("reInit", onSelectRef.current);
    return () => {
      cancelAnimationFrame(rafId);
      emblaApi.off("select", onSelectRef.current);
      emblaApi.off("reInit", onSelectRef.current);
    };
  }, [emblaApi]);

  if (items.length === 0) {
    return (
      <section className={cn("flex flex-col gap-3", className)}>
        {title && (
          <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-text">
            {title}
          </h3>
        )}
        <div className="glass-panel rounded-2xl p-8 text-center text-xs text-text-secondary">
          {emptyMessage}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {(title || subtitle) && (
        <header className="flex items-end justify-between gap-2">
          <div>
            {title && (
              <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-text">
                {title}
              </h3>
            )}
            {subtitle && <p className="mt-1 text-[11px] text-text-secondary">{subtitle}</p>}
          </div>
          <div className="hidden gap-1 sm:flex">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Cuộn sang trái"
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/60 text-text-secondary backdrop-blur-md transition-all",
                "hover:border-border-hover hover:bg-surface hover:text-text disabled:cursor-not-allowed disabled:opacity-30",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Cuộn sang phải"
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/60 text-text-secondary backdrop-blur-md transition-all",
                "hover:border-border-hover hover:bg-surface hover:text-text disabled:cursor-not-allowed disabled:opacity-30",
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </header>
      )}

      <div className="relative">
        {/* Left fade */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-bg to-transparent transition-opacity duration-300",
            canScrollPrev ? "opacity-100" : "opacity-0",
          )}
        />
        {/* Right fade */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg to-transparent transition-opacity duration-300",
            canScrollNext ? "opacity-100" : "opacity-0",
          )}
        />

        <div ref={emblaRef} className="overflow-hidden">
          <div className="-mx-2 flex">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="min-w-0 shrink-0 grow-0 basis-[140px] px-2 sm:basis-[160px] md:basis-[180px] lg:basis-[200px]"
              >
                <MovieCard
                  {...item}
                  variant="grid"
                  showQuickActions={showQuickActions}
                  priority={idx < 4}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
