"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="glass-panel flex max-w-md flex-col items-center gap-4 p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dropped/10 text-dropped">
          <AlertTriangle size={26} />
        </div>
        <h1 className="text-lg font-bold text-text">Đã có lỗi xảy ra</h1>
        <p className="text-sm leading-relaxed text-text-secondary">
          Rất tiếc, đã có sự cố khi tải nội dung. Bạn có thể thử lại hoặc quay về trang chủ.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover"
          >
            <RotateCw size={14} /> Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10"
          >
            <Home size={14} /> Về Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
