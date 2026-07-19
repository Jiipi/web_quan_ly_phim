"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  List,
  Table,
  SlidersHorizontal,
  Search,
  Filter,
  RotateCw,
  Trash2,
  Tv,
  Film,
  Plus,
  Tags,
  Settings,
  Clock,
} from "lucide-react";
import { MovieGrid } from "@/components/shared/MovieGrid";
import { StatusBadge, type WatchStatus } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FadeIn } from "@/components/motion/FadeIn";
import { useLibrary, type LibraryItem } from "@/lib/use-library";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { api } from "@/lib/api";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { countryLabel, STATUS_FILTER_OPTIONS } from "@/lib/labels";
import { useQuickAdd } from "@/components/shared/QuickAddDialog";
import { TagAssignment } from "@/components/tags/TagAssignment";
import { TagFilter, TagChip } from "@/components/tags/TagFilter";
import { TagManager } from "@/components/tags/TagManager";
import { TopicFilter, TopicChips } from "@/components/topics/TopicFilter";

type ViewMode = "grid" | "list" | "table";
type SortKey = "recent" | "title" | "rating" | "progress";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "recent", label: "Mới cập nhật" },
  { value: "title", label: "Tên A-Z" },
  { value: "rating", label: "Điểm TMDb" },
  { value: "progress", label: "Tiến độ" },
];

export default function LibraryPage() {
  const { items, loading, error, reload } = useLibrary();
  const { success, error: toastError } = useToast();
  const { confirm } = useConfirm();
  const { openQuickAdd } = useQuickAdd();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);

  const countries = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.mediaItem.countries?.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();

    // Mappings for topic filter matching
    const TOPIC_COUNTRY_MAPPING: Record<string, string> = {
      "Trung Quốc": "CN",
      "Hàn Quốc": "KR",
      "Việt Nam": "VN",
      "Nhật Bản": "JP",
      Mỹ: "US",
      "Thái Lan": "TH",
      "Ấn Độ": "IN",
    };

    const TOPIC_GENRE_MAPPING: Record<string, string[]> = {
      Drama: ["Drama", "Chính kịch", "Tâm lý", "Phim truyền hình"],
      "Hành động": ["Action", "Hành động", "Phim hành động"],
      "Kinh dị": ["Horror", "Kinh dị", "Thriller", "Gây cấn", "Bí ẩn", "Giật gân"],
      Hài: ["Comedy", "Hài", "Hài kịch", "Phim hài"],
      "Lãng mạn": ["Romance", "Lãng mạn", "Tình cảm", "Phim lãng mạn"],
      "Khoa học viễn tưởng": [
        "Sci-Fi",
        "Science Fiction",
        "Khoa học viễn tưởng",
        "Viễn tưởng",
        "Phim viễn tưởng",
      ],
      "Giả tưởng": ["Fantasy", "Giả tưởng", "Thần thoại", "Kỳ ảo"],
      "Chiến tranh": ["War", "Chiến tranh", "Phim chiến tranh"],
      "Phiêu lưu": ["Adventure", "Phiêu lưu", "Phim phiêu lưu"],
      "Trinh thám": ["Mystery", "Trinh thám", "Bí ẩn"],
      Documentary: ["Documentary", "Tài liệu", "Phim tài liệu"],
      Kids: ["Kids", "Trẻ em", "Gia đình", "Family", "Phim trẻ em"],
      "Hoạt hình": ["Animation", "Hoạt hình", "Phim hoạt hình"],
      Anime: ["Animation", "Hoạt hình", "Anime"],
    };

    let result = items.filter((item) => {
      const matchesSearch =
        item.mediaItem.title.toLowerCase().includes(q) ||
        item.mediaItem.originalTitle.toLowerCase().includes(q);
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
      const matchesCountry =
        selectedCountry === "all" || item.mediaItem.countries?.includes(selectedCountry);

      const itemTagIds = item.tags.map((t) => t.tagId);
      const matchesTags =
        selectedTags.length === 0 || selectedTags.some((tagId) => itemTagIds.includes(tagId));

      const itemTagNames = item.tags.map((t) => t.tag.name);
      const matchesTopics =
        selectedTopics.length === 0 ||
        selectedTopics.some((topic) => {
          // 1. Khớp theo tên Tag tùy chỉnh hoặc Tag chủ đề được gán trực tiếp
          if (itemTagNames.includes(topic)) return true;

          // 2. Khớp theo quốc gia của phim
          const countryCode = TOPIC_COUNTRY_MAPPING[topic];
          if (countryCode && item.mediaItem.countries?.includes(countryCode)) return true;

          // 3. Khớp theo thể loại của phim
          const genresToMatch = TOPIC_GENRE_MAPPING[topic];
          if (genresToMatch && item.mediaItem.genres?.some((g) => genresToMatch.includes(g)))
            return true;

          // 4. Các trường hợp đặc biệt khác (như Anime)
          if (
            topic === "Anime" &&
            item.mediaItem.genres?.includes("Animation") &&
            item.mediaItem.countries?.includes("JP")
          ) {
            return true;
          }

          return false;
        });

      return matchesSearch && matchesStatus && matchesCountry && matchesTags && matchesTopics;
    });

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.mediaItem.title.localeCompare(b.mediaItem.title, "vi");
        case "rating":
          return b.mediaItem.tmdbRating - a.mediaItem.tmdbRating;
        case "progress": {
          const aPct = a.totalEpisodes > 0 ? a.currentEpisode / a.totalEpisodes : 0;
          const bPct = b.totalEpisodes > 0 ? b.currentEpisode / b.totalEpisodes : 0;
          return bPct - aPct;
        }
        case "recent":
        default: {
          const at = new Date(a.lastWatchedAt ?? a.completedAt ?? 0).getTime();
          const bt = new Date(b.lastWatchedAt ?? b.completedAt ?? 0).getTime();
          return bt - at;
        }
      }
    });

    return result;
  }, [items, searchQuery, selectedStatus, selectedCountry, selectedTags, selectedTopics, sortBy]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((i) => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    return counts;
  }, [items]);

  async function handleDelete(item: LibraryItem) {
    const ok = await confirm({
      title: "Xoá khỏi thư viện?",
      message: `"${item.mediaItem.title}" sẽ bị xoá khỏi thư viện của bạn. Hành động không thể hoàn tác.`,
      confirmLabel: "Xoá",
      danger: true,
    });
    if (!ok) return;
    const res = await api.delete(`/api/library?id=${encodeURIComponent(item.id)}`);
    if (res.success) {
      success(`Đã xoá "${item.mediaItem.title}".`);
      await reload();
    } else {
      toastError(res.error ?? "Không thể xoá phim.");
    }
  }

  const cardProps = (item: LibraryItem) => ({
    id: item.id,
    tmdbId: item.mediaItem.tmdbId,
    mediaType: item.mediaItem.mediaType as "movie" | "tv",
    title: item.mediaItem.title,
    originalTitle: item.mediaItem.originalTitle,
    posterPath: item.mediaItem.posterPath,
    backdropPath: item.mediaItem.backdropPath,
    rating: item.mediaItem.tmdbRating,
    releaseDate: null as string | null,
    genres: item.mediaItem.genres,
    status: item.status as WatchStatus,
    currentEpisode: item.currentEpisode,
    totalEpisodes: item.totalEpisodes,
    tags: item.tags,
    showTags: true,
  });

  return (
    <FadeIn className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Thư viện của tôi</h1>
          <p className="mt-1 text-xs text-text-secondary">
            Quản lý và lọc toàn bộ phim lẻ & phim bộ của bạn ·{" "}
            <span className="font-bold text-text">{items.length}</span> phim
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => openQuickAdd()}>
            <Plus size={14} />
            Thêm phim
          </Button>

          <div className="flex overflow-hidden rounded-full border border-border bg-card">
            {(
              [
                ["grid", LayoutGrid, "Xem dạng lưới"],
                ["list", List, "Xem dạng danh sách"],
                ["table", Table, "Xem dạng bảng"],
              ] as const
            ).map(([mode, Icon, title]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={title}
                aria-label={title}
                aria-pressed={viewMode === mode}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-surface hover:text-text",
                )}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStatus("all")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
            selectedStatus === "all"
              ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_oklch(0.68_0.22_18_/_0.4)]"
              : "border-border bg-card text-text-secondary hover:border-border-hover hover:text-text",
          )}
        >
          Tất cả
          <span
            className={cn(
              "rounded-full px-1.5 text-[9px] font-mono",
              selectedStatus === "all" ? "bg-white/20" : "bg-white/5 text-text-muted",
            )}
          >
            {statusCounts.all ?? 0}
          </span>
        </button>
        {STATUS_FILTER_OPTIONS.filter((s) => s.value !== "all").map((st) => (
          <button
            key={st.value}
            onClick={() => setSelectedStatus(st.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
              selectedStatus === st.value
                ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_oklch(0.68_0.22_18_/_0.4)]"
                : "border-border bg-card text-text-secondary hover:border-border-hover hover:text-text",
            )}
          >
            {st.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[9px] font-mono",
                selectedStatus === st.value ? "bg-white/20" : "bg-white/5 text-text-muted",
              )}
            >
              {statusCounts[st.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap items-center gap-2">
        <TopicFilter selectedTopics={selectedTopics} onTopicsChange={setSelectedTopics} />
        <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((tagId) => (
              <TagChip
                key={tagId}
                tagId={tagId}
                tagName={
                  items.flatMap((i) => i.tags).find((t) => t.tagId === tagId)?.tag.name ?? ""
                }
                tagColor={
                  items.flatMap((i) => i.tags).find((t) => t.tagId === tagId)?.tag.color ?? "#888"
                }
                onRemove={() => setSelectedTags(selectedTags.filter((id) => id !== tagId))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected topics chips */}
      {selectedTopics.length > 0 && (
        <TopicChips
          selectedTopics={selectedTopics}
          onRemove={(name) => setSelectedTopics(selectedTopics.filter((n) => n !== name))}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-3 text-text-muted" size={16} />
          <Input
            type="text"
            placeholder="Tìm phim trong thư viện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Tìm phim trong thư viện"
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            aria-pressed={showFilters}
            aria-label="Bộ lọc"
            title="Bộ lọc nâng cao"
          >
            <SlidersHorizontal size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowTagManager(true)}
            aria-label="Quản lý tags"
            title="Quản lý Tags"
          >
            <Settings size={14} />
          </Button>
        </div>
      </div>

      {showFilters && (
        <FadeIn>
          <Card>
            <CardContent className="grid gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="filter-country"
                  className="text-[10px] font-semibold uppercase tracking-wider text-text-muted"
                >
                  Quốc gia
                </label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger id="filter-country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả quốc gia</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {countryLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCountry("all");
                    setSelectedStatus("all");
                    setSearchQuery("");
                  }}
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Content */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-dropped">{error}</p>
            <Button variant="outline" onClick={() => reload()}>
              <RotateCw size={14} /> Thử lại
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Film className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold">Thư viện trống</h3>
              <p className="mt-1 max-w-sm text-xs text-text-secondary">
                Khám phá và thêm phim để bắt đầu theo dõi hành trình xem phim của bạn.
              </p>
            </div>
            <Button onClick={() => openQuickAdd()}>
              <Plus size={14} />
              Khám phá phim
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && items.length > 0 && filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Filter className="text-text-muted opacity-55" size={36} />
            <h4 className="text-sm font-bold">Không tìm thấy kết quả</h4>
            <p className="max-w-xs text-xs text-text-secondary">
              Không có phim nào khớp từ khoá hoặc bộ lọc hiện tại.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filtered.length > 0 && viewMode === "grid" && (
        // showQuickActions tắt: phim trong thư viện đã có trạng thái rõ ràng,
        // không cần nút Thêm; click card = mở trang chi tiết.
        <MovieGrid items={filtered.map(cardProps)} />
      )}

      {!loading && !error && filtered.length > 0 && viewMode === "list" && (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/${item.mediaItem.mediaType === "tv" ? "show" : "movie"}/${item.mediaItem.tmdbId}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-3 transition-all hover:border-border-hover hover:bg-card"
            >
              <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-card">
                {item.mediaItem.posterPath ? (
                  <img
                    src={
                      item.mediaItem.posterPath.startsWith("http")
                        ? item.mediaItem.posterPath
                        : `https://image.tmdb.org/t/p/w200${item.mediaItem.posterPath}`
                    }
                    alt={item.mediaItem.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface">
                    {item.mediaItem.mediaType === "tv" ? (
                      <Tv className="h-5 w-5 text-text-muted" />
                    ) : (
                      <Film className="h-5 w-5 text-text-muted" />
                    )}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold">{item.mediaItem.title}</h3>
                <p className="truncate text-xs text-text-muted">{item.mediaItem.originalTitle}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-text-secondary">
                  <span>{countryLabel(item.mediaItem.countries?.[0])}</span>
                  <span>·</span>
                  <span>{item.mediaItem.genres.slice(0, 2).join(", ")}</span>
                  {item.lastWatchedAt && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-text-muted">
                        <Clock className="h-2.5 w-2.5" />
                        Xem cách đây {formatRelativeTime(item.lastWatchedAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={item.status as WatchStatus} />
                {item.mediaItem.mediaType === "tv" &&
                  item.currentEpisode > 0 &&
                  (item.totalEpisodes > 0 ? (
                    <span className="font-mono text-[10px] text-text-secondary">
                      Tập {item.currentEpisode}/{item.totalEpisodes}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-text-secondary">
                      Tập {item.currentEpisode}
                    </span>
                  ))}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {item.tags.slice(0, 2).map((mt) => (
                      <span
                        key={mt.tagId}
                        className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-medium"
                        style={{
                          backgroundColor: `${mt.tag.color}20`,
                          color: mt.tag.color,
                        }}
                      >
                        {mt.tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(item);
                }}
                aria-label={`Xoá ${item.mediaItem.title}`}
                className="text-text-muted hover:text-dropped"
              >
                <Trash2 size={14} />
              </Button>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && viewMode === "table" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-card text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  <th className="p-3">Tên phim</th>
                  <th className="p-3">Tags</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Quốc gia</th>
                  <th className="p-3">Điểm</th>
                  <th className="p-3">Tiến độ</th>
                  <th className="p-3">Cập nhật</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-surface/60">
                    <td className="p-3">
                      <div className="font-bold">{item.mediaItem.title}</div>
                      <div className="text-[10px] text-text-muted">
                        {item.mediaItem.originalTitle}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((mt) => (
                          <span
                            key={mt.tagId}
                            className="inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                            style={{
                              backgroundColor: `${mt.tag.color}20`,
                              color: mt.tag.color,
                            }}
                          >
                            {mt.tag.name}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="text-[9px] text-text-muted">
                            +{item.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={item.status as WatchStatus} />
                    </td>
                    <td className="p-3 text-text-secondary">
                      {countryLabel(item.mediaItem.countries?.[0])}
                    </td>
                    <td className="p-3 font-mono font-bold text-secondary">
                      {item.mediaItem.tmdbRating.toFixed(1)}
                    </td>
                    <td className="p-3 font-mono">
                      {item.mediaItem.mediaType === "tv"
                        ? item.totalEpisodes > 0
                          ? `${item.currentEpisode}/${item.totalEpisodes}`
                          : item.currentEpisode > 0
                            ? `${item.currentEpisode}`
                            : "—"
                        : "Phim lẻ"}
                    </td>
                    <td className="p-3 text-text-secondary">{formatDate(item.lastWatchedAt)}</td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
                        aria-label={`Xoá ${item.mediaItem.title}`}
                        className="text-text-muted hover:text-dropped"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tag Manager Dialog */}
      <TagManager open={showTagManager} onOpenChange={setShowTagManager} onTagChange={reload} />
    </FadeIn>
  );
}
