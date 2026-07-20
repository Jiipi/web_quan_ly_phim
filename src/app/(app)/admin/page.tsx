"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Users,
  Film,
  Database,
  Activity,
  Settings,
  Plus,
  Search,
  Loader2,
  RefreshCw,
  Shield,
  BookOpen,
  Wifi,
  Trash2,
  Eye,
  Server,
  Zap,
  CheckCircle2,
  Cpu,
  Sparkles,
  UserPlus,
  LogIn,
  Clock,
  Radio,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserDetailModal } from "@/components/admin/UserDetailModal";
import { LogDetailModal } from "@/components/admin/LogDetailModal";

interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  _count: {
    watchItems: number;
  };
}

interface MovieItem {
  id: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  originalTitle: string;
  posterPath: string | null;
  releaseDate: string | null;
  genres: string[];
  tmdbRating: number;
  _count: {
    watchItems: number;
  };
}

interface LogItem {
  id: string;
  userId: string;
  action: string;
  details: unknown;
  ipAddress: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface RecentUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
}

interface OnlineUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  updatedAt: string;
}

interface SystemStats {
  dbLatencyMs: number;
  activeUsers24h: number;
  onlineUsersCount: number;
  onlineUsers: OnlineUser[];
  totalUsers: number;
  totalMovies: number;
  totalWatchItems: number;
  totalLogs: number;
  topMovies: Array<{
    id: string;
    title: string;
    posterPath: string | null;
    mediaType: "movie" | "tv";
    tmdbRating: number;
    _count: { watchItems: number };
  }>;
  recentLogs: LogItem[];
  recentUsers: RecentUser[];
  tmdbConnected: boolean;
  serverUptimeSec: number;
}

function formatTimeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (isNaN(diff) || diff < 0) return "Vừa xong";
  if (diff < 60) return `${diff}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function AdminPage() {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "movies" | "logs" | "metrics" | "settings"
  >("overview");

  // Data States
  const [users, setUsers] = useState<UserItem[]>([]);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  // Search & Filter States
  const [userQuery, setUserQuery] = useState("");
  const [movieQuery, setMovieQuery] = useState("");
  const [logQuery, setLogQuery] = useState("");

  // Loading States
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [deletingMovieId, setDeletingMovieId] = useState<string | null>(null);

  // Modal inspection states
  const [inspectUser, setInspectUser] = useState<UserItem | null>(null);
  const [inspectLog, setInspectLog] = useState<LogItem | null>(null);

  // Import State
  const [importTmdbId, setImportTmdbId] = useState("");
  const [importType, setImportType] = useState<"movie" | "tv">("movie");
  const [importing, setImporting] = useState(false);

  // AI & Settings state
  const [aiProvider, setAiProvider] = useState("groq");
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);

  // Fetch functions
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    const res = await api.get<{ stats: SystemStats }>("/api/admin/stats");
    setLoadingStats(false);
    if (res.success && res.data) {
      setStats(res.data.stats);
    } else {
      toastError(res.error ?? "Không thể lấy thống kê Production.");
    }
  }, [toastError]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    const res = await api.get<{ users: UserItem[] }>("/api/admin/users");
    setLoadingUsers(false);
    if (res.success && res.data) {
      setUsers(res.data.users);
    } else {
      toastError(res.error ?? "Không thể lấy danh sách thành viên.");
    }
  }, [toastError]);

  const fetchMovies = useCallback(async () => {
    setLoadingMovies(true);
    const res = await api.get<{ movies: MovieItem[] }>("/api/admin/movies");
    setLoadingMovies(false);
    if (res.success && res.data) {
      setMovies(res.data.movies);
    } else {
      toastError(res.error ?? "Không thể lấy danh sách kho phim.");
    }
  }, [toastError]);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    const res = await api.get<{ logs: LogItem[] }>("/api/admin/logs");
    setLoadingLogs(false);
    if (res.success && res.data) {
      setLogs(res.data.logs);
    } else {
      toastError(res.error ?? "Không thể lấy nhật ký hệ thống.");
    }
  }, [toastError]);

  // Initial load & Polling for live online presence (every 12 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats();
      fetchUsers();
      fetchMovies();
      fetchLogs();
    }, 0);

    const interval = setInterval(() => {
      fetchStats();
    }, 12000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchStats, fetchUsers, fetchMovies, fetchLogs]);

  // Update Role
  const handleToggleRole = async (targetUserId: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    const res = await api.patch<{ user: UserItem }>("/api/admin/users", {
      targetUserId,
      role: nextRole,
    });
    if (res.success && res.data) {
      success(`Đã cập nhật vai trò của thành viên thành ${nextRole}.`);
      setUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, role: nextRole } : u)));
      fetchStats();
    } else {
      toastError(res.error ?? "Không thể cập nhật vai trò.");
    }
  };

  // Delete Movie Cache
  const handleDeleteMovie = async (movieId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phim "${title}" khỏi kho lưu trữ cache?`)) {
      return;
    }

    setDeletingMovieId(movieId);
    const res = await api.delete<{ deletedId: string }>(`/api/admin/movies?id=${movieId}`);
    setDeletingMovieId(null);

    if (res.success) {
      success(`Đã xóa phim "${title}" khỏi kho lưu trữ.`);
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
      fetchStats();
    } else {
      toastError(res.error ?? "Không thể xóa phim.");
    }
  };

  // Import Movie
  const handleImportMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTmdbId.trim()) {
      toastError("Vui lòng nhập TMDb ID.");
      return;
    }

    setImporting(true);
    const res = await api.post<{ mediaItem: MovieItem }>("/api/admin/movies", {
      tmdbId: importTmdbId.trim(),
      mediaType: importType,
    });
    setImporting(false);

    if (res.success && res.data) {
      success(`Đã nhập thành công phim: ${res.data.mediaItem.title}`);
      setImportTmdbId("");
      fetchMovies();
      fetchStats();
    } else {
      toastError(res.error ?? "Không thể nhập phim từ TMDb.");
    }
  };

  // Filters
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(userQuery.toLowerCase()),
  );

  const filteredMovies = movies.filter(
    (m) =>
      m.title.toLowerCase().includes(movieQuery.toLowerCase()) ||
      m.originalTitle.toLowerCase().includes(movieQuery.toLowerCase()) ||
      m.tmdbId.toString().includes(movieQuery),
  );

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(logQuery.toLowerCase()) ||
      l.user?.name?.toLowerCase().includes(logQuery.toLowerCase()) ||
      l.user?.email?.toLowerCase().includes(logQuery.toLowerCase()) ||
      l.ipAddress?.includes(logQuery),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Header Banner HUD */}
      <div className="cyber-panel p-6 rounded-2xl border border-primary/30 bg-bg/95 relative overflow-hidden backdrop-blur-xl dark:shadow-[0_0_24px_var(--neon-pink-soft)]">
        <div aria-hidden="true" className="aside-scan-beam" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="badge-pulse inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary pulse-glow" />
                CINEOS_PRODUCTION_ADMIN
              </span>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1 text-[10px] font-mono"
              >
                <CheckCircle2 size={10} /> SYSTEMS OPERATIONAL
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight mt-1">
              <Shield
                className="text-primary animate-pulse"
                size={28}
                style={{ filter: "drop-shadow(0 0 8px var(--neon-pink))" }}
              />
              Hệ Thống Quản Trị Trung Tâm
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
              Giám sát số liệu sản lượng thời gian thực, thành viên đang online, thông báo và tinh
              chỉnh mô hình AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto font-mono text-xs">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-emerald-400">
              <Radio size={14} className="animate-pulse text-emerald-400" />
              <span>Online Now:</span>
              <span className="font-bold text-white">
                {stats ? (
                  `${stats.onlineUsersCount}`
                ) : (
                  <Loader2 size={12} className="animate-spin inline" />
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-text-secondary">
              <Zap size={14} className="text-emerald-400" />
              <span>Ping DB:</span>
              <span className="font-bold text-white">
                {stats ? (
                  `${stats.dbLatencyMs}ms`
                ) : (
                  <Loader2 size={12} className="animate-spin inline" />
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {(
          [
            { id: "overview", label: "Tổng quan", icon: <Activity size={14} /> },
            { id: "users", label: "Thành viên", icon: <Users size={14} /> },
            { id: "movies", label: "Kho phim", icon: <Film size={14} /> },
            { id: "logs", label: "Nhật ký hệ thống", icon: <BookOpen size={14} /> },
            { id: "metrics", label: "Giám sát Health", icon: <Server size={14} /> },
            { id: "settings", label: "Cấu hình AI", icon: <Settings size={14} /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary text-white border border-primary/60 dark:shadow-[0_0_16px_var(--neon-pink-soft)]"
                : "border border-white/10 bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="animate-fade-in-up">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card transition-all hover:scale-[1.02] hover:border-emerald-500/40">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative">
                    <Radio size={22} className="animate-pulse" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Đang Online Trực Tiếp
                    </span>
                    <span className="text-2xl font-black text-white">
                      {stats?.onlineUsersCount || 0}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      🟢 Live Radar Presence
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card transition-all hover:scale-[1.02] hover:border-primary/40">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    <Users size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Thành viên hệ thống
                    </span>
                    <span className="text-2xl font-black text-white">{users.length}</span>
                    <span className="text-[10px] text-text-muted font-mono mt-0.5">
                      🟢 {stats?.activeUsers24h || 0} truy cập 24h
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card transition-all hover:scale-[1.02] hover:border-secondary/40">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary border border-secondary/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                    <Film size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Kho phim cache
                    </span>
                    <span className="text-2xl font-black text-white">{movies.length}</span>
                    <span className="text-[10px] text-text-muted font-mono mt-0.5">
                      Media items cached
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card transition-all hover:scale-[1.02] hover:border-amber-500/40">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <Activity size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Sự kiện Audit Logs
                    </span>
                    <span className="text-2xl font-black text-white">{logs.length}</span>
                    <span className="text-[10px] text-text-muted font-mono mt-0.5">
                      Ghi nhận 100 log gần nhất
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* LIVE ONLINE MEMBERS PRESENCE PANEL */}
            <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden border-emerald-500/30 shadow-[0_0_24px_rgba(16,185,129,0.12)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-3 w-3 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    Thành Viên Đang Online Trực Tiếp (Real-time Online Presence)
                  </h2>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-mono text-xs">
                  {stats?.onlineUsersCount || 0} ĐANG HOẠT ĐỘNG
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {!stats?.onlineUsers || stats.onlineUsers.length === 0 ? (
                  <p className="text-xs text-text-muted py-4 text-center col-span-full">
                    Chưa có ai online.
                  </p>
                ) : (
                  stats.onlineUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-xl bg-white/5 border border-emerald-500/20 p-3 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/40 group-hover:scale-105 transition-transform">
                          {(u.name || u.email || "U").charAt(0).toUpperCase()}
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-black" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {u.name || "Thành viên"}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono truncate max-w-[130px]">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      <Badge
                        className={`text-[8px] uppercase font-mono px-1.5 py-0 ${
                          u.role === "admin"
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {u.role}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* LIVE NOTIFICATIONS & ACTIVITY FEED SECTION */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Thành viên mới đăng ký Notification Feed */}
              <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <UserPlus size={18} className="text-emerald-400 animate-pulse" />
                    Thành Viên Mới Đăng Ký
                  </h2>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono"
                  >
                    LIVE REGISTRATIONS
                  </Badge>
                </div>

                <div className="flex flex-col gap-2.5">
                  {!stats?.recentUsers || stats.recentUsers.length === 0 ? (
                    <p className="text-xs text-text-muted py-4 text-center">
                      Chưa có người dùng mới.
                    </p>
                  ) : (
                    stats.recentUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 p-3 hover:bg-white/10 transition-all hover:border-emerald-500/30 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/40 group-hover:scale-105 transition-transform">
                            {(u.name || u.email || "U").charAt(0).toUpperCase()}
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-black" />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                                {u.name || "Tài khoản mới"}
                              </span>
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] uppercase font-mono px-1.5 py-0">
                                NEW USER
                              </Badge>
                            </div>
                            <span className="text-[11px] text-text-muted font-mono">{u.email}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-emerald-400/90 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                          <Clock size={10} />
                          {formatTimeAgo(u.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Nhật ký truy cập & Đăng nhập vừa xảy ra */}
              <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden border-primary/20 shadow-[0_0_20px_rgba(239,68,68,0.08)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <LogIn size={18} className="text-primary animate-pulse" />
                    Thông Báo Truy Cập & Đăng Nhập
                  </h2>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/30 text-[10px] font-mono"
                  >
                    REALTIME LOGINS
                  </Badge>
                </div>

                <div className="flex flex-col gap-2.5">
                  {!stats?.recentLogs || stats.recentLogs.length === 0 ? (
                    <p className="text-xs text-text-muted py-4 text-center">
                      Chưa có nhật ký truy cập.
                    </p>
                  ) : (
                    stats.recentLogs.slice(0, 5).map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 p-3 hover:bg-white/10 transition-all hover:border-primary/30 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
                            {l.action.startsWith("auth") ? (
                              <LogIn size={16} />
                            ) : (
                              <Activity size={16} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                              {l.user?.name || "Hệ thống"}
                            </span>
                            <span className="text-[10px] text-text-muted font-mono">
                              {l.user?.email || "IP: " + (l.ipAddress || "Internal")}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] uppercase font-mono">
                            {l.action}
                          </Badge>
                          <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                            <Clock size={10} />
                            {formatTimeAgo(l.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Middle Grid: Top Tracked Movies & Quick Actions */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Top Tracked Movies */}
              <div className="md:col-span-2 glass-card p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-secondary" /> Phim Được Đánh Dấu Nhiều Nhất
                  </h2>
                  <span className="text-[10px] font-mono text-text-muted">Top 5 Catalog</span>
                </div>

                <div className="flex flex-col gap-3">
                  {stats?.topMovies.length === 0 ? (
                    <p className="text-xs text-text-muted py-4 text-center">
                      Chưa có dữ liệu theo dõi.
                    </p>
                  ) : (
                    stats?.topMovies.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 p-3 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-primary w-5">
                            0{idx + 1}
                          </span>
                          <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded-md bg-card">
                            {item.posterPath ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w92${item.posterPath}`}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[8px] text-text-muted">
                                NO IMG
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white truncate max-w-[240px]">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-text-muted">
                              <span className="uppercase font-mono">{item.mediaType}</span>
                              <span>•</span>
                              <span>⭐ {item.tmdbRating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-xs">
                          {item._count.watchItems} lượt lưu
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions & Controls */}
              <div className="glass-card p-6 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
                    Bảng Thao Tác Nhanh
                  </h2>

                  <Button
                    onClick={() => {
                      fetchStats();
                      fetchUsers();
                      fetchMovies();
                      fetchLogs();
                    }}
                    disabled={loadingUsers || loadingMovies || loadingLogs}
                    className="w-full flex items-center justify-center gap-2 text-xs h-10 rounded-xl"
                  >
                    {loadingUsers || loadingMovies || loadingLogs ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    Đồng Bộ Số Liệu Hệ Thống
                  </Button>
                </div>

                <div className="flex flex-col gap-2 border-t border-white/10 pt-4 text-xs font-mono">
                  <div className="flex justify-between text-text-secondary">
                    <span>Trạng thái DB:</span>
                    <span className="text-emerald-400 font-bold">ONLINE</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>API TMDb Key:</span>
                    <span className="text-emerald-400 font-bold">READY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS MANAGEMENT TAB */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex max-w-sm items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 w-full">
                <Search className="text-text-muted" size={16} />
                <Input
                  type="text"
                  placeholder="Tìm kiếm thành viên theo tên hoặc email..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="bg-transparent border-0 focus-visible:ring-0 px-1 py-1 h-7 text-xs text-white placeholder:text-text-muted"
                />
              </div>

              <div className="text-xs font-mono text-text-muted">
                Hiển thị <span className="text-white font-bold">{filteredUsers.length}</span> /{" "}
                {users.length} thành viên
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-text-muted font-bold uppercase tracking-wider bg-white/5">
                      <th className="p-4">Thành viên</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Vai trò</th>
                      <th className="p-4">Số phim lưu</th>
                      <th className="p-4">Ngày tham gia</th>
                      <th className="p-4 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center">
                          <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
                          Không tìm thấy người dùng phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-mono font-bold border border-primary/30">
                                {(u.name || u.email || "U").charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-white">
                                {u.name || "Chưa thiết lập"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-text-secondary font-mono">{u.email}</td>
                          <td className="p-4">
                            <Badge
                              className={
                                u.role === "admin"
                                  ? "bg-primary/20 text-primary border-primary/30 uppercase font-mono text-[9px]"
                                  : "bg-white/10 text-text-secondary border-white/10 uppercase font-mono text-[9px]"
                              }
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-text-secondary font-mono font-bold">
                            {u._count?.watchItems || 0}
                          </td>
                          <td className="p-4 text-text-muted font-mono">
                            {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setInspectUser(u)}
                                className="text-[10px] h-7 px-2.5 font-bold uppercase tracking-wider gap-1 border-white/10 hover:border-secondary/40 hover:text-secondary"
                              >
                                <Eye size={12} /> Soi
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleRole(u.id, u.role)}
                                className="text-[10px] h-7 px-2.5 font-bold uppercase tracking-wider border-white/10 hover:border-primary/40 hover:text-primary"
                              >
                                Chuyển {u.role === "admin" ? "User" : "Admin"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MOVIES CATALOG TAB */}
        {activeTab === "movies" && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Search Filter */}
              <div className="md:col-span-2 flex max-w-sm items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 self-start w-full">
                <Search className="text-text-muted" size={16} />
                <Input
                  type="text"
                  placeholder="Tìm kiếm phim theo tên, TMDb ID..."
                  value={movieQuery}
                  onChange={(e) => setMovieQuery(e.target.value)}
                  className="bg-transparent border-0 focus-visible:ring-0 px-1 py-1 h-7 text-xs text-white placeholder:text-text-muted"
                />
              </div>

              {/* Import form */}
              <form onSubmit={handleImportMovie} className="glass-card p-4 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={14} className="text-primary" /> Nhập Phim Từ TMDb ID
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImportType("movie")}
                      className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        importType === "movie"
                          ? "bg-primary border-primary text-white shadow-glow-primary"
                          : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10"
                      }`}
                    >
                      Phim Lẻ (Movie)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportType("tv")}
                      className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        importType === "tv"
                          ? "bg-primary border-primary text-white shadow-glow-primary"
                          : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10"
                      }`}
                    >
                      Phim Bộ (TV Show)
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Nhập TMDb ID (ví dụ: 272)"
                      value={importTmdbId}
                      onChange={(e) => setImportTmdbId(e.target.value)}
                      className="bg-white/5 border-white/10 text-xs text-white h-9 rounded-lg"
                    />
                    <Button
                      type="submit"
                      disabled={importing}
                      className="h-9 px-4 shrink-0 text-xs font-bold uppercase tracking-wider"
                    >
                      {importing ? <Loader2 className="animate-spin" size={14} /> : "Nhập Phim"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-text-muted font-bold uppercase tracking-wider bg-white/5">
                      <th className="p-4">Poster & Phim</th>
                      <th className="p-4">Loại</th>
                      <th className="p-4">TMDb ID</th>
                      <th className="p-4">Đánh giá</th>
                      <th className="p-4">Lượt theo dõi</th>
                      <th className="p-4">Thể loại</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingMovies ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                        </td>
                      </tr>
                    ) : filteredMovies.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-muted">
                          Không có phim nào được lưu cache.
                        </td>
                      </tr>
                    ) : (
                      filteredMovies.map((m) => (
                        <tr
                          key={m.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded-md bg-card border border-white/10">
                                {m.posterPath ? (
                                  <Image
                                    src={`https://image.tmdb.org/t/p/w92${m.posterPath}`}
                                    alt={m.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[7px] text-text-muted">
                                    N/A
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-white truncate max-w-xs">
                                  {m.title}
                                </span>
                                <span className="text-[10px] text-text-muted truncate max-w-xs">
                                  {m.originalTitle}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className="bg-white/5 text-text-secondary border-white/10 uppercase font-mono text-[9px]">
                              {m.mediaType}
                            </Badge>
                          </td>
                          <td className="p-4 text-text-secondary font-mono">{m.tmdbId}</td>
                          <td className="p-4 text-text-secondary font-mono">
                            ⭐ {m.tmdbRating.toFixed(1)}
                          </td>
                          <td className="p-4 text-text-secondary font-mono font-bold">
                            {m._count?.watchItems || 0}
                          </td>
                          <td
                            className="p-4 text-text-muted truncate max-w-[180px]"
                            title={m.genres.join(", ")}
                          >
                            {m.genres.join(", ")}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deletingMovieId === m.id}
                              onClick={() => handleDeleteMovie(m.id, m.title)}
                              className="text-[10px] h-7 px-2.5 font-bold uppercase tracking-wider text-rose-400 border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300"
                            >
                              {deletingMovieId === m.id ? (
                                <Loader2 className="animate-spin" size={12} />
                              ) : (
                                <Trash2 size={12} />
                              )}
                              Xóa Cache
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === "logs" && (
          <div className="flex flex-col gap-4">
            <div className="flex max-w-sm items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <Search className="text-text-muted" size={16} />
              <Input
                type="text"
                placeholder="Tìm kiếm hành động, email, IP Address..."
                value={logQuery}
                onChange={(e) => setLogQuery(e.target.value)}
                className="bg-transparent border-0 focus-visible:ring-0 px-1 py-1 h-7 text-xs text-white placeholder:text-text-muted"
              />
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-text-muted font-bold uppercase tracking-wider bg-white/5">
                      <th className="p-4">Thời gian</th>
                      <th className="p-4">Người thực hiện</th>
                      <th className="p-4">Hành động</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4">Chi tiết</th>
                      <th className="p-4 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingLogs ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center">
                          <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                        </td>
                      </tr>
                    ) : filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
                          Chưa có nhật ký hoạt động nào.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((l) => (
                        <tr
                          key={l.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4 text-text-muted font-mono whitespace-nowrap">
                            {new Date(l.createdAt).toLocaleString("vi-VN")}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">
                                {l.user?.name || "Hệ thống"}
                              </span>
                              <span className="text-[10px] text-text-muted font-mono">
                                {l.user?.email}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={`uppercase font-mono text-[9px] ${
                                l.action.startsWith("auth")
                                  ? "bg-primary/20 text-primary border-primary/30"
                                  : l.action.startsWith("user")
                                    ? "bg-secondary/20 text-secondary border-secondary/30"
                                    : "bg-white/10 text-text-secondary border-white/10"
                              }`}
                            >
                              {l.action}
                            </Badge>
                          </td>
                          <td className="p-4 text-text-secondary font-mono">
                            {l.ipAddress || "N/A"}
                          </td>
                          <td
                            className="p-4 text-text-muted max-w-xs truncate font-mono text-[11px]"
                            title={JSON.stringify(l.details)}
                          >
                            {JSON.stringify(l.details)}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInspectLog(l)}
                              className="text-[10px] h-7 px-2.5 font-bold uppercase tracking-wider gap-1"
                            >
                              <Eye size={12} /> Soi Payload
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* METRICS & HEALTH TAB */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass-card p-6 flex flex-col gap-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                  <Server size={16} className="text-primary" /> Sức Khỏe Cơ Sở Dữ Liệu PostgreSQL
                </h2>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                    <span className="text-text-secondary">Độ trễ truy vấn (DB Ping):</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {stats ? `${stats.dbLatencyMs} ms` : "Measuring..."}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                    <span className="text-text-secondary">Trạng thái kết nối Pool:</span>
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    >
                      Healthy / Active
                    </Badge>
                  </div>
                  <Button
                    onClick={fetchStats}
                    disabled={loadingStats}
                    className="w-full text-xs h-9 mt-2"
                  >
                    {loadingStats ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      "Kiểm tra độ trễ ngay"
                    )}
                  </Button>
                </div>
              </div>

              <div className="glass-card p-6 flex flex-col gap-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                  <Cpu size={16} className="text-secondary" /> Tiến Trình Server & API TMDb
                </h2>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                    <span className="text-text-secondary">Thời gian Server Uptime:</span>
                    <span className="font-mono font-bold text-white">
                      {stats
                        ? `${Math.floor(stats.serverUptimeSec / 60)} phút ${stats.serverUptimeSec % 60}s`
                        : "..."}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                    <span className="text-text-secondary">TMDb API Provider Status:</span>
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    >
                      Connected (200 OK)
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="max-w-2xl glass-card p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings size={20} className="text-primary" /> Cấu Hình AI & Hệ Thống
              </h2>
              <p className="text-xs text-text-secondary">
                Tinh chỉnh mô hình trí tuệ nhân tạo phục vụ tư vấn phim và điều chỉnh chính sách
                giới hạn tài nguyên.
              </p>
            </div>

            <div className="flex flex-col gap-5 text-xs">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-white text-xs uppercase tracking-wider">
                  Mô Hình AI Mặc Định (Provider):
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: "groq", name: "Groq (Llama 3)", desc: "Miễn phí, phản hồi siêu tốc" },
                    {
                      id: "openai",
                      name: "OpenAI (GPT-4o)",
                      desc: "Phân tích sâu, độ chính xác cao",
                    },
                    { id: "mock", name: "Local Mock", desc: "Giả lập cho môi trường Dev" },
                  ].map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => {
                        setAiProvider(provider.id);
                        success(`Đã chọn mô hình AI: ${provider.name}`);
                      }}
                      className={`flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-all ${
                        aiProvider === provider.id
                          ? "bg-primary/15 border-primary text-white shadow-glow-primary"
                          : "bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="font-bold text-xs">{provider.name}</span>
                      <span className="text-[10px] text-text-muted">{provider.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Chống Spam (Rate Limiting):</span>
                  <span className="text-[10px] text-text-muted">
                    Giới hạn tối đa 30 request chat/phút nhằm bảo vệ hạ tầng.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={rateLimitEnabled}
                  onChange={(e) => {
                    setRateLimitEnabled(e.target.checked);
                    success(e.target.checked ? "Đã bật Rate Limiting." : "Đã tắt Rate Limiting.");
                  }}
                  className="h-5 w-5 rounded border-white/20 bg-card text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserDetailModal user={inspectUser} onClose={() => setInspectUser(null)} />
      <LogDetailModal log={inspectLog} onClose={() => setInspectLog(null)} />
    </div>
  );
}
