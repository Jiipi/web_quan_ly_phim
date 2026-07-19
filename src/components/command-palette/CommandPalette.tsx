"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  PlayCircle,
  Film,
  Search,
  List,
  Calendar,
  Sparkles,
  BarChart3,
  Settings,
  User,
  Layers,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { useLibrary } from "@/lib/use-library";
import { api } from "@/lib/api";
import { useQuickAdd } from "@/components/shared/QuickAddDialog";

const NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Trang chủ", href: "/", icon: Home },
  { label: "Tiếp tục xem", href: "/continue-watching", icon: PlayCircle },
  { label: "Thư viện", href: "/library", icon: Film },
  { label: "Khám phá", href: "/discover", icon: Search },
  { label: "Watchlist", href: "/watchlist", icon: List },
  { label: "Danh sách", href: "/lists", icon: Layers },
  { label: "Lịch xem", href: "/calendar", icon: Calendar },
  { label: "Trợ lý AI", href: "/ai", icon: Sparkles },
  { label: "Thống kê", href: "/stats", icon: BarChart3 },
  { label: "Hồ sơ", href: "/profile", icon: User },
  { label: "Cài đặt", href: "/settings", icon: Settings },
];

interface TmdbResult {
  id: number;
  title: string;
  mediaType: "movie" | "tv";
}

function detailHref(mediaType: "movie" | "tv", tmdbId: number) {
  return `/${mediaType === "tv" ? "show" : "movie"}/${tmdbId}`;
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as Record<string, unknown>)?.role === "admin";
  const { items } = useLibrary();
  const { openQuickAdd } = useQuickAdd();
  const [query, setQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState<TmdbResult[]>([]);

  const navItems = isAdmin
    ? [...NAV, { label: "Hệ thống Quản trị (Admin)", href: "/admin", icon: Shield }]
    : NAV;

  // Tìm TMDb (debounce) khi gõ >= 2 ký tự. setState chỉ trong setTimeout/then.
  useEffect(() => {
    const q = query.trim();
    let active = true;
    const t = setTimeout(() => {
      if (!active) return;
      if (q.length < 2) {
        setTmdbResults([]);
        return;
      }
      api.get<TmdbResult[]>("/api/tmdb/search", { q }).then((res) => {
        if (!active) return;
        setTmdbResults(res.success && Array.isArray(res.data) ? res.data.slice(0, 6) : []);
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  function go(href: string) {
    onClose();
    router.push(href);
  }

  const q = query.trim().toLowerCase();
  const navFiltered = q ? navItems.filter((n) => n.label.toLowerCase().includes(q)) : navItems;
  const libFiltered = q
    ? items.filter((i) => i.mediaItem.title.toLowerCase().includes(q)).slice(0, 6)
    : [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[14vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Bảng lệnh nhanh"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <Command
        shouldFilter={false}
        loop
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className="glass-panel relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-white/8 px-4">
          <Search size={16} className="text-text-muted" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Tìm trang, phim trong thư viện, hoặc trên TMDb..."
            className="w-full bg-transparent py-3.5 text-sm text-text placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-text-muted sm:block">
            Esc
          </kbd>
        </div>

        <Command.List className="max-h-[52vh] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-xs text-text-muted">
            Không tìm thấy kết quả.
          </Command.Empty>

          {navFiltered.length > 0 && (
            <Command.Group
              heading="Điều hướng"
              className="mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-muted"
            >
              {navFiltered.map((n) => {
                const Icon = n.icon;
                return (
                  <Command.Item
                    key={n.href}
                    value={`nav-${n.href}`}
                    onSelect={() => go(n.href)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text-secondary data-[selected=true]:bg-white/8 data-[selected=true]:text-text"
                  >
                    <Icon size={16} className="text-text-muted" />
                    {n.label}
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {libFiltered.length > 0 && (
            <Command.Group
              heading="Thư viện của bạn"
              className="mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-muted"
            >
              {libFiltered.map((i) => (
                <Command.Item
                  key={i.id}
                  value={`lib-${i.id}`}
                  onSelect={() =>
                    go(detailHref(i.mediaItem.mediaType as "movie" | "tv", i.mediaItem.tmdbId))
                  }
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text-secondary data-[selected=true]:bg-white/8 data-[selected=true]:text-text"
                >
                  <Film size={16} className="text-text-muted" />
                  {i.mediaItem.title}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {tmdbResults.length > 0 && (
            <Command.Group
              heading="Tìm trên TMDb"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-muted"
            >
              {tmdbResults.map((r) => (
                <Command.Item
                  key={`tmdb-${r.id}`}
                  value={`tmdb-${r.id}`}
                  onSelect={() => {
                    onClose();
                    openQuickAdd({ id: r.id, type: r.mediaType });
                  }}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text-secondary data-[selected=true]:bg-white/8 data-[selected=true]:text-text"
                >
                  <Search size={16} className="text-text-muted" />
                  {r.title}
                  <span className="ml-auto text-[10px] uppercase text-text-muted">
                    {r.mediaType === "tv" ? "Phim bộ" : "Phim lẻ"}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
