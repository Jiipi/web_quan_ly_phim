import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ServiceKey = "db" | "tmdb" | "groq" | "auth";
type ServiceStatus = "up" | "down" | "unknown";

interface ServiceResult {
  status: ServiceStatus;
  latencyMs: number | null;
  detail?: string;
}

const TMDB_PING = "https://api.themoviedb.org/3/configuration?api_key=";
const GROQ_PING = "https://api.groq.com/openai/v1/models";

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms),
    ),
  ]);
}

async function pingDb(): Promise<ServiceResult> {
  const t0 = Date.now();
  try {
    await withTimeout(db.$queryRaw`SELECT 1`, 3000, "DB");
    return { status: "up", latencyMs: Date.now() - t0 };
  } catch (err) {
    return {
      status: "down",
      latencyMs: Date.now() - t0,
      detail: err instanceof Error ? err.message : "unknown",
    };
  }
}

async function pingTmdb(): Promise<ServiceResult> {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    return { status: "unknown", latencyMs: null, detail: "TMDB_API_KEY missing" };
  }
  const t0 = Date.now();
  try {
    const res = await withTimeout(fetch(`${TMDB_PING}${key}`, { cache: "no-store" }), 3500, "TMDb");
    if (!res.ok) {
      return { status: "down", latencyMs: Date.now() - t0, detail: `HTTP ${res.status}` };
    }
    return { status: "up", latencyMs: Date.now() - t0 };
  } catch (err) {
    return {
      status: "down",
      latencyMs: Date.now() - t0,
      detail: err instanceof Error ? err.message : "unknown",
    };
  }
}

async function pingGroq(): Promise<ServiceResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return { status: "unknown", latencyMs: null, detail: "GROQ_API_KEY missing" };
  }
  const t0 = Date.now();
  try {
    const res = await withTimeout(
      fetch(GROQ_PING, {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      }),
      3500,
      "Groq",
    );
    if (!res.ok) {
      return { status: "down", latencyMs: Date.now() - t0, detail: `HTTP ${res.status}` };
    }
    return { status: "up", latencyMs: Date.now() - t0 };
  } catch (err) {
    return {
      status: "down",
      latencyMs: Date.now() - t0,
      detail: err instanceof Error ? err.message : "unknown",
    };
  }
}

function authStatus(): ServiceResult {
  // Auth dùng AUTH_SECRET trong .env; kiểm tra sự tồn tại thay vì ping.
  if (!process.env.AUTH_SECRET) {
    return { status: "down", latencyMs: null, detail: "AUTH_SECRET missing" };
  }
  return { status: "up", latencyMs: null };
}

export async function GET() {
  const [dbRes, tmdbRes, groqRes] = await Promise.all([pingDb(), pingTmdb(), pingGroq()]);
  const authRes = authStatus();

  const services: Record<ServiceKey, ServiceResult> = {
    db: dbRes,
    tmdb: tmdbRes,
    groq: groqRes,
    auth: authRes,
  };

  // Tổng thể coi là "down" nếu DB down (không dùng được); các dịch vụ khác
  // chỉ là "degraded" nhưng vẫn 200 để client phân biệt từng cái.
  const overall = dbRes.status === "up" ? "operational" : "degraded";

  return NextResponse.json(
    {
      overall,
      services,
      checkedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
