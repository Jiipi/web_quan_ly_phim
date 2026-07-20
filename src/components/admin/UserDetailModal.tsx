"use client";

import React from "react";
import { X, Shield, Film, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isAdmin } from "@/types/role";

interface UserDetailModalProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: string;
    _count: {
      watchItems: number;
    };
  } | null;
  onClose: () => void;
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary font-mono text-lg font-bold border border-primary/30 shadow-[0_0_12px_var(--neon-pink-soft)]">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-white leading-tight">
                {user.name || "Chưa thiết lập tên"}
              </h3>
              <span className="text-xs text-text-secondary">{user.email}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/5 rounded-xl p-3">
            <Shield size={16} className="text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-text-muted font-bold">Vai trò</span>
              <Badge
                className={`w-fit mt-0.5 ${
                  isAdmin(user.role)
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-white/10 text-text-secondary border-white/10"
                }`}
              >
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/5 border border-white/5 rounded-xl p-3">
            <Film size={16} className="text-secondary" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-text-muted font-bold">Kho phim lưu</span>
              <span className="font-mono text-sm font-bold text-white">
                {user._count?.watchItems || 0} bộ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/5 border border-white/5 rounded-xl p-3 col-span-2">
            <Calendar size={16} className="text-accent" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-text-muted font-bold">Ngày đăng ký</span>
              <span className="font-mono text-xs text-white">
                {new Date(user.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {/* User System ID */}
        <div className="flex flex-col gap-1 rounded-xl bg-black/40 border border-white/5 p-3 font-mono text-[11px]">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
            USER GUID:
          </span>
          <span className="text-text-secondary break-all">{user.id}</span>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-white/10 hover:text-white transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
