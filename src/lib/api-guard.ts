import { NextResponse } from "next/server";
import { checkRateLimit } from "./rate-limit";

/** Áp rate limit theo key; trả về NextResponse 429 nếu vượt, ngược lại null. */
export function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const result = checkRateLimit(key, limit, windowMs);
  if (result.ok) return null;
  return NextResponse.json(
    { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSec) } },
  );
}
