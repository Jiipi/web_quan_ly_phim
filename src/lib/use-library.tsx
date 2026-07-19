"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

export interface LibraryMediaItem {
  id: string;
  tmdbId: number;
  mediaType: string;
  title: string;
  originalTitle: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string | null;
  genres: string[];
  countries: string[];
  tmdbRating: number;
  runtime: number | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface MediaTag {
  tagId: string;
  tag: Tag;
}

export interface LibraryItem {
  id: string;
  status: string;
  personalScore: number | null;
  notes: string | null;
  favorite: boolean;
  priority: number;
  currentSeason: number;
  currentEpisode: number;
  totalEpisodes: number;
  startedAt: string | null;
  completedAt: string | null;
  lastWatchedAt: string | null;
  mediaItem: LibraryMediaItem;
  tags: MediaTag[];
}

interface LibraryState {
  items: LibraryItem[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const LibraryContext = createContext<LibraryState | null>(null);

/**
 * Provider share cache thư viện giữa nhiều component trong cùng session.
 * - Single fetch khi mount; các component khác cùng session đọc cùng `items`.
 * - `reload()` được gọi sau mỗi mutate (POST/PATCH/DELETE) để đồng bộ.
 * - Cache sống trong React tree, tự huỷ khi unmount (không cần TTL phức tạp).
 */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Chống race: nếu mount/unmount nhanh, huỷ in-flight request cũ.
  const aliveRef = useRef(true);

  const fetchAll = useCallback(
    async (withLoading: boolean) => {
      if (status !== "authenticated") {
        setLoading(false);
        return;
      }
      if (withLoading) setLoading(true);
      const res = await api.get<LibraryItem[]>("/api/library");
      if (!aliveRef.current) return;
      if (res.success && res.data) {
        setItems(res.data);
        setError(null);
      } else {
        setError(res.error ?? "Không tải được thư viện.");
      }
      if (withLoading) setLoading(false);
    },
    [status],
  );

  const reload = useCallback(() => fetchAll(false), [fetchAll]);

  useEffect(() => {
    if (status !== "authenticated") {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }
    aliveRef.current = true;
    const rafId = requestAnimationFrame(async () => {
      if (aliveRef.current) await fetchAll(true);
    });
    return () => {
      aliveRef.current = false;
      cancelAnimationFrame(rafId);
    };
  }, [fetchAll, status]);

  return (
    <LibraryContext.Provider value={{ items, loading, error, reload }}>
      {children}
    </LibraryContext.Provider>
  );
}

/**
 * Hook truy cập cache thư viện (đọc qua Context). Phải nằm trong <LibraryProvider>.
 * Giữ signature cũ (`{ items, loading, error, reload }`) để không phải sửa 10 consumer.
 */
export function useLibrary(): LibraryState {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary phải được dùng bên trong <LibraryProvider>");
  }
  return ctx;
}

const EMPTY_LIBRARY: LibraryState = {
  items: [],
  loading: false,
  error: null,
  reload: async () => {},
};

/**
 * Hook like useLibrary but returns empty defaults when outside LibraryProvider.
 * Safe for components that may render both inside and outside the provider.
 */
export function useOptionalLibrary(): LibraryState {
  const ctx = useContext(LibraryContext);
  return ctx ?? EMPTY_LIBRARY;
}
