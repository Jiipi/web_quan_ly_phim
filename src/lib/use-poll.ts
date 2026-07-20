"use client";

import { useEffect, useRef } from "react";

interface UsePollOptions {
  /** Hàm gọi mỗi tick. Nếu throw thì sẽ được log nhưng interval vẫn chạy. */
  fn: () => void | Promise<void>;
  /** Khoảng cách giữa các lần gọi (ms). Mặc định 5000. */
  intervalMs?: number;
  /** Có chạy ngay khi mount không. Mặc định false. */
  runOnMount?: boolean;
  /** Pause khi tab ẩn (document.visibilityState === "hidden"). Mặc định true. */
  pauseWhenHidden?: boolean;
  /** Tạm dừng (suspend hook). Mặc định false. */
  enabled?: boolean;
}

/**
 * Hook polling thông minh:
 * - Tự pause khi tab ẩn (mặc định).
 * - Tự refresh ngay khi tab focus lại sau khi ẩn.
 * - Cleanup interval khi unmount.
 *
 * Dùng cho news feed (5s), notifications (15s), comment list (khi đang mở post detail).
 */
export function usePoll({
  fn,
  intervalMs = 5000,
  runOnMount = false,
  pauseWhenHidden = true,
  enabled = true,
}: UsePollOptions): void {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      Promise.resolve(fnRef.current()).catch((err) => {
        console.error("[usePoll] tick error:", err);
      });
    };

    const start = () => {
      if (timer) return;
      timer = setInterval(tick, intervalMs);
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibility = () => {
      if (!pauseWhenHidden) return;
      if (document.visibilityState === "hidden") {
        stop();
      } else {
        // Refresh ngay khi quay lại tab
        tick();
        start();
      }
    };

    if (runOnMount) tick();
    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs, runOnMount, pauseWhenHidden, enabled]);
}
