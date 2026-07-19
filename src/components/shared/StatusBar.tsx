"use client";

import React, { useEffect, useRef, useState } from "react";
import { Activity, Database, Film, KeyRound, Sparkles, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type ServiceStatus = "up" | "down" | "unknown";

interface ServiceResult {
  status: ServiceStatus;
  latencyMs: number | null;
  detail?: string;
}

interface HealthPayload {
  overall: "operational" | "degraded";
  services: {
    db: ServiceResult;
    tmdb: ServiceResult;
    groq: ServiceResult;
    auth: ServiceResult;
  };
  checkedAt: string;
}

interface IndicatorProps {
  label: string;
  icon: React.ReactNode;
  result: ServiceResult | undefined;
}

const POLL_MS = 30_000;

function Indicator({ label, icon, result }: IndicatorProps) {
  const status = result?.status ?? "unknown";
  const latency = result?.latencyMs;

  const colorRing =
    status === "up"
      ? "ring-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.55)]"
      : status === "down"
        ? "ring-rose-400/70 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
        : "ring-amber-300/60 shadow-[0_0_6px_rgba(252,211,77,0.45)]";

  const dot =
    status === "up" ? "bg-emerald-400" : status === "down" ? "bg-rose-400" : "bg-amber-300";

  const tooltip =
    status === "up"
      ? `${label}: online${latency != null ? ` · ${latency}ms` : ""}`
      : status === "down"
        ? `${label}: offline · ${result?.detail ?? "—"}`
        : `${label}: ${result?.detail ?? "chưa cấu hình"}`;

  return (
    <div
      className="group relative flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider"
      title={tooltip}
    >
      <span
        className={cn(
          "relative flex h-2 w-2 items-center justify-center rounded-full ring-2 transition-all",
          colorRing,
        )}
      >
        <span className={cn("h-1 w-1 rounded-full", dot)} />
        {status === "up" && (
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
        )}
      </span>
      <span className="text-text-muted group-hover:text-text transition-colors flex items-center gap-1">
        {icon}
        {label}
        {latency != null && (
          <span className="text-text-muted/60 normal-case tracking-normal">{latency}ms</span>
        )}
      </span>
    </div>
  );
}

export function StatusBar() {
  const [data, setData] = useState<HealthPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as HealthPayload;
      if (!mountedRef.current) return;
      setData(json);
      setError(null);
      setLastChecked(new Date());
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "fetch failed");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      void fetchHealth();
    }, 0);
    const id = setInterval(() => void fetchHealth(), POLL_MS);
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      clearInterval(id);
    };
  }, []);

  const overallLabel =
    !data && !error
      ? "PINGING…"
      : error
        ? "NETWORK_ERROR"
        : data?.overall === "operational"
          ? "ALL_SYSTEMS_OPERATIONAL"
          : "PARTIAL_DEGRADATION";

  const overallColor =
    !data && !error
      ? "text-amber-300"
      : error
        ? "text-rose-400"
        : data?.overall === "operational"
          ? "text-emerald-400"
          : "text-amber-300";

  const [uptimeStr, setUptimeStr] = useState("0m 0s");
  useEffect(() => {
    const startTime = Date.now();
    const updateUptime = () => {
      const sec = Math.floor((Date.now() - startTime) / 1000);
      setUptimeStr(`${Math.floor(sec / 60)}m ${sec % 60}s`);
    };
    updateUptime();
    const id = setInterval(updateUptime, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border-t border-primary/15 bg-bg/60 backdrop-blur-sm font-mono text-[10px]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex items-center gap-2 font-bold uppercase tracking-widest",
            overallColor,
          )}
        >
          <Activity size={11} className={cn(loading && "animate-spin")} />
          <span>{overallLabel}</span>
          <span className="text-text-muted/40">|</span>
          <span className="text-text-muted normal-case tracking-normal">up {uptimeStr}</span>
        </div>

        <span className="hidden h-3 w-px bg-primary/15 sm:block" />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Indicator
            label="DB"
            icon={<Database size={10} className="text-text-muted/80" />}
            result={data?.services.db}
          />
          <Indicator
            label="TMDb"
            icon={<Film size={10} className="text-text-muted/80" />}
            result={data?.services.tmdb}
          />
          <Indicator
            label="Groq"
            icon={<Sparkles size={10} className="text-text-muted/80" />}
            result={data?.services.groq}
          />
          <Indicator
            label="Auth"
            icon={<KeyRound size={10} className="text-text-muted/80" />}
            result={data?.services.auth}
          />
        </div>

        <div className="ml-auto flex items-center gap-3 text-text-muted/70">
          {lastChecked && (
            <span className="hidden sm:inline normal-case tracking-normal">
              last_check: {lastChecked.toLocaleTimeString("vi-VN")}
            </span>
          )}
          <button
            type="button"
            onClick={() => void fetchHealth()}
            disabled={loading}
            className="flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-primary disabled:opacity-50"
            title="Ping lại ngay"
          >
            <RefreshCcw size={10} className={cn(loading && "animate-spin")} />
            <span className="hidden sm:inline">refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
