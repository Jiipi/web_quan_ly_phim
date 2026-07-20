"use client";

import React, { useState } from "react";
import { X, Copy, Check, FileText } from "lucide-react";

interface LogDetailModalProps {
  log: {
    id: string;
    action: string;
    details: unknown;
    ipAddress: string | null;
    createdAt: string;
    user: {
      name: string | null;
      email: string | null;
    };
  } | null;
  onClose: () => void;
}

export function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const jsonString = JSON.stringify(log.details ?? {}, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
              <FileText size={18} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Chi tiết Nhật ký: {log.action}
              </h3>
              <span className="text-[10px] text-text-muted font-mono">
                {new Date(log.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase">Người thực hiện</span>
            <span className="font-semibold text-white">{log.user?.name || "Hệ thống"}</span>
            <span className="text-[10px] text-text-secondary">{log.user?.email || "N/A"}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-text-muted font-bold uppercase">IP Address</span>
            <span className="font-mono text-xs text-secondary">{log.ipAddress || "Internal"}</span>
          </div>
        </div>

        {/* Payload JSON Box */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-text-muted">
              Payload Details (JSON):
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary-hover transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Đã sao chép" : "Sao chép JSON"}
            </button>
          </div>
          <pre className="max-h-60 overflow-y-auto rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs text-emerald-400 whitespace-pre-wrap break-all shadow-inner">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-white/10 pt-4">
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
