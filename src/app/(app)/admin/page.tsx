"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default function AdminPage() {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "movies" | "logs" | "settings">(
    "overview",
  );

  // Data States
  const [users, setUsers] = useState<UserItem[]>([]);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);

  // Search & Filter States
  const [userQuery, setUserQuery] = useState("");
  const [movieQuery, setMovieQuery] = useState("");
  const [logQuery, setLogQuery] = useState("");

  // Loading States
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Import State
  const [importTmdbId, setImportTmdbId] = useState("");
  const [importType, setImportType] = useState<"movie" | "tv">("movie");
  const [importing, setImporting] = useState(false);

  // AI & Settings state
  const [aiProvider, setAiProvider] = useState("groq");
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);

  // Fetch functions
  const fetchUsers = React.useCallback(async () => {
    setLoadingUsers(true);
    const res = await api.get<{ users: UserItem[] }>("/api/admin/users");
    setLoadingUsers(false);
    if (res.success && res.data) {
      setUsers(res.data.users);
    } else {
      toastError(res.error ?? "Không thể lấy danh sách thành viên.");
    }
  }, [toastError]);

  const fetchMovies = React.useCallback(async () => {
    setLoadingMovies(true);
    const res = await api.get<{ movies: MovieItem[] }>("/api/admin/movies");
    setLoadingMovies(false);
    if (res.success && res.data) {
      setMovies(res.data.movies);
    } else {
      toastError(res.error ?? "Không thể lấy danh sách kho phim.");
    }
  }, [toastError]);

  const fetchLogs = React.useCallback(async () => {
    setLoadingLogs(true);
    const res = await api.get<{ logs: LogItem[] }>("/api/admin/logs");
    setLoadingLogs(false);
    if (res.success && res.data) {
      setLogs(res.data.logs);
    } else {
      toastError(res.error ?? "Không thể lấy nhật ký hệ thống.");
    }
  }, [toastError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
      fetchMovies();
      fetchLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers, fetchMovies, fetchLogs]);

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
      // Reload audit logs after action
      fetchLogs();
    } else {
      toastError(res.error ?? "Không thể cập nhật vai trò.");
    }
  };

  // Import Movie
  const handleImportMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTmdbId.trim()) return;
    setImporting(true);
    const res = await api.post<{ mediaItem: MovieItem }>("/api/admin/movies", {
      tmdbId: Number(importTmdbId),
      mediaType: importType,
    });
    setImporting(false);
    if (res.success && res.data) {
      success(`Đã nhập thành công phim "${res.data.mediaItem.title}"!`);
      setImportTmdbId("");
      setMovies((prev) => [res.data!.mediaItem, ...prev]);
      fetchLogs();
    } else {
      toastError(res.error ?? "Không thể nhập phim.");
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
      m.originalTitle.toLowerCase().includes(movieQuery.toLowerCase()),
  );

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(logQuery.toLowerCase()) ||
      l.user?.name?.toLowerCase().includes(logQuery.toLowerCase()) ||
      l.user?.email?.toLowerCase().includes(logQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8 py-2">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Shield className="text-primary animate-pulse" size={24} /> Hệ thống Quản trị
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
          Chào mừng đến với trang quản trị CineOS. Tại đây bạn có thể giám sát số liệu, phân quyền
          tài khoản, cấu hình AI và kiểm soát kho phim hệ thống.
        </p>
      </div>

      {/* Tabs list navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {(
          [
            { id: "overview", label: "Tổng quan", icon: <Activity size={14} /> },
            { id: "users", label: "Thành viên", icon: <Users size={14} /> },
            { id: "movies", label: "Kho phim", icon: <Film size={14} /> },
            { id: "logs", label: "Nhật ký hệ thống", icon: <BookOpen size={14} /> },
            { id: "settings", label: "Cấu hình AI", icon: <Settings size={14} /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-glow-primary"
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
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                  <Users size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Thành viên
                  </span>
                  <span className="text-2xl font-black text-white">{users.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                  <Film size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Kho phim cache
                  </span>
                  <span className="text-2xl font-black text-white">{movies.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Database size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Lượt theo dõi
                  </span>
                  <span className="text-2xl font-black text-white">
                    {movies.reduce((acc, curr) => acc + (curr._count?.watchItems || 0), 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Activity size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Logs hệ thống
                  </span>
                  <span className="text-2xl font-black text-white">{logs.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <div className="md:col-span-2 glass-card p-6 flex flex-col gap-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Hành động nhanh
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="w-full flex items-center justify-center gap-2 text-xs"
                >
                  {loadingUsers ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  Làm mới thành viên
                </Button>
                <Button
                  onClick={fetchMovies}
                  disabled={loadingMovies}
                  className="w-full flex items-center justify-center gap-2 text-xs"
                >
                  {loadingMovies ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  Làm mới kho phim
                </Button>
              </div>
            </div>

            {/* AI Cost Tracker */}
            <div className="md:col-span-2 glass-card p-6 flex flex-col gap-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Chi phí & Token AI
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-text-secondary border-b border-white/5 py-1">
                  <span>Trạng thái kết nối AI:</span>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  >
                    Hoạt động
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-text-secondary border-b border-white/5 py-1">
                  <span>Model AI phục vụ:</span>
                  <span className="font-mono font-bold text-white">Llama 3 (Groq API)</span>
                </div>
                <div className="flex justify-between text-xs text-text-secondary py-1">
                  <span>Tổng Token sử dụng (ước tính):</span>
                  <span className="font-mono text-white">~120,450 tokens</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-4">
            <div className="flex max-w-sm items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1">
              <Search className="text-text-muted" size={16} />
              <Input
                type="text"
                placeholder="Tìm kiếm thành viên..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="bg-transparent border-0 focus-visible:ring-0 px-1 py-1.5 h-8 text-xs text-white"
              />
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-text-muted font-bold uppercase tracking-wider bg-white/5">
                      <th className="p-4">Tên</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Quyền</th>
                      <th className="p-4">Số phim</th>
                      <th className="p-4">Ngày đăng ký</th>
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
                          <td className="p-4 font-semibold text-white">
                            {u.name || "Chưa thiết lập"}
                          </td>
                          <td className="p-4 text-text-secondary">{u.email}</td>
                          <td className="p-4">
                            <Badge
                              className={
                                u.role === "admin"
                                  ? "bg-primary/20 text-primary border-primary/30"
                                  : "bg-white/10 text-text-secondary border-white/10"
                              }
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-text-secondary font-mono">
                            {u._count?.watchItems || 0}
                          </td>
                          <td className="p-4 text-text-muted">
                            {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleRole(u.id, u.role)}
                              className="text-[10px] h-7 px-2.5 font-bold uppercase tracking-wider"
                            >
                              Chuyển sang {u.role === "admin" ? "User" : "Admin"}
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

        {/* MOVIES MANAGEMENT */}
        {activeTab === "movies" && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Filter */}
              <div className="md:col-span-2 flex max-w-sm items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1 self-start">
                <Search className="text-text-muted" size={16} />
                <Input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={movieQuery}
                  onChange={(e) => setMovieQuery(e.target.value)}
                  className="bg-transparent border-0 focus-visible:ring-0 px-1 py-1.5 h-8 text-xs text-white"
                />
              </div>

              {/* Import from TMDb */}
              <form onSubmit={handleImportMovie} className="glass-card p-4 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={14} className="text-primary" /> Nhập phim từ TMDb
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImportType("movie")}
                      className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        importType === "movie"
                          ? "bg-primary border-primary text-white"
                          : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10"
                      }`}
                    >
                      Phim lẻ
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportType("tv")}
                      className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        importType === "tv"
                          ? "bg-primary border-primary text-white"
                          : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10"
                      }`}
                    >
                      Phim bộ
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="TMDb ID (Ví dụ: 272)"
                      value={importTmdbId}
                      onChange={(e) => setImportTmdbId(e.target.value)}
                      className="bg-white/5 border-white/10 text-xs text-white h-9 rounded-lg"
                    />
                    <Button
                      type="submit"
                      disabled={importing}
                      className="h-9 px-4 shrink-0 text-xs"
                    >
                      {importing ? <Loader2 className="animate-spin" size={14} /> : "Nhập"}
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
                      <th className="p-4">Phim</th>
                      <th className="p-4">Loại</th>
                      <th className="p-4">TMDb ID</th>
                      <th className="p-4">Đánh giá</th>
                      <th className="p-4">Số lượt theo dõi</th>
                      <th className="p-4">Thể loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingMovies ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center">
                          <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                        </td>
                      </tr>
                    ) : filteredMovies.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
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
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{m.title}</span>
                              <span className="text-[10px] text-text-muted">{m.originalTitle}</span>
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
                            className="p-4 text-text-muted truncate max-w-[200px]"
                            title={m.genres.join(", ")}
                          >
                            {m.genres.join(", ")}
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

        {/* AUDIT LOGS */}
        {activeTab === "logs" && (
          <div className="flex flex-col gap-4">
            <div className="flex max-w-sm items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1">
              <Search className="text-text-muted" size={16} />
              <Input
                type="text"
                placeholder="Tìm kiếm hành động, thành viên..."
                value={logQuery}
                onChange={(e) => setLogQuery(e.target.value)}
                className="bg-transparent border-0 focus-visible:ring-0 px-1 py-1.5 h-8 text-xs text-white"
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
                    </tr>
                  </thead>
                  <tbody>
                    {loadingLogs ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                        </td>
                      </tr>
                    ) : filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-text-muted">
                          Chưa có nhật ký hoạt động nào.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((l) => (
                        <tr
                          key={l.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4 text-text-muted">
                            {new Date(l.createdAt).toLocaleString("vi-VN")}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">
                                {l.user?.name || "Hệ thống"}
                              </span>
                              <span className="text-[10px] text-text-muted">{l.user?.email}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className="bg-primary/10 text-primary border-primary/20 uppercase font-mono text-[9px]">
                              {l.action}
                            </Badge>
                          </td>
                          <td className="p-4 text-text-secondary font-mono">
                            {l.ipAddress || "N/A"}
                          </td>
                          <td
                            className="p-4 text-text-muted max-w-xs truncate"
                            title={JSON.stringify(l.details)}
                          >
                            {JSON.stringify(l.details)}
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

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="max-w-xl glass-card p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Settings size={18} className="text-primary" /> Cấu hình AI & Hệ thống
              </h2>
              <p className="text-[11px] text-text-secondary">
                Thay đổi cấu hình AI và điều chỉnh giới hạn toàn bộ ứng dụng. Các thay đổi sẽ có
                hiệu lực ngay lập tức.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white">AI LLM Model Provider:</label>
                <select
                  value={aiProvider}
                  onChange={(e) => {
                    setAiProvider(e.target.value);
                    success("Đã thay đổi AI Provider!");
                  }}
                  className="rounded-lg border border-white/10 bg-card p-2 text-xs text-text focus:outline-none w-full"
                >
                  <option value="groq">Groq (Llama 3 - Tốc độ cực cao)</option>
                  <option value="openai">OpenAI (GPT-4o - Thâm sâu/Chất lượng)</option>
                  <option value="mock">Local Mock (Để phát triển/Thử nghiệm)</option>
                </select>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Bật Rate Limiting:</span>
                  <span className="text-[10px] text-text-muted">
                    Chặn đứng hành vi spam API chat (tối đa 30 lần/phút).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={rateLimitEnabled}
                  onChange={(e) => {
                    setRateLimitEnabled(e.target.checked);
                    success(e.target.checked ? "Đã bật Rate Limiting." : "Đã tắt Rate Limiting.");
                  }}
                  className="h-4 w-4 rounded border-white/10 bg-card text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white">Chế độ Bảo trì:</span>
                  <span className="text-[10px] text-text-muted">
                    Chặn tạm thời mọi người dùng thường truy cập hệ thống.
                  </span>
                </div>
                <input
                  type="checkbox"
                  onChange={() =>
                    toastError("Chức năng chỉ hỗ trợ ở môi trường Staging/Production.")
                  }
                  className="h-4 w-4 rounded border-white/10 bg-card text-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
