import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { preferencesSchema } from "@/lib/preferences-schema";
import { flattenFieldErrors } from "@/lib/auth-schemas";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
  }

  const preference = await db.userPreference.findUnique({ where: { userId } });
  return NextResponse.json(preference);
}

export async function PUT(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body không hợp lệ." }, { status: 400 });
  }

  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const prefData = {
    favGenres: data.favGenres,
    favCountries: data.favCountries,
    preferTvShows: data.preferTvShows,
    ...(data.theme ? { theme: data.theme } : {}),
    ...(data.language ? { language: data.language } : {}),
    ...(data.ratingScale ? { ratingScale: data.ratingScale } : {}),
  };

  const preference = await db.userPreference.upsert({
    where: { userId },
    update: prefData,
    create: { userId, ...prefData },
  });

  return NextResponse.json({ success: true, preference });
}

export const dynamic = "force-dynamic";
