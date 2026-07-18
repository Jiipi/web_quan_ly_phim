import Link from "next/link";
import { Film, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex items-center gap-2">
        <Film className="text-primary" size={28} />
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold tracking-tight text-transparent">
          CineOS
        </span>
      </div>
      <div className="glass-panel flex max-w-md flex-col items-center gap-4 p-8">
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-6xl font-extrabold text-transparent">
          404
        </span>
        <h1 className="text-lg font-bold text-text">Không tìm thấy trang</h1>
        <p className="text-sm leading-relaxed text-text-secondary">
          Trang hoặc bộ phim bạn tìm không tồn tại hoặc đã bị xoá.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover"
        >
          <Home size={14} /> Về Trang chủ
        </Link>
      </div>
    </div>
  );
}
