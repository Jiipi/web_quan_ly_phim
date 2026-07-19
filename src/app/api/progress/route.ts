import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { patchWatchDatesSchema } from "@/lib/library-schema";
import { flattenFieldErrors } from "@/lib/auth-schemas";

/**
 * Cập nhật tiến độ xem của một WatchItem.
 * - Không có `episode` -> +1 tập.
 * - Có `episode` -> đánh dấu đã xem tới tập đó (episode grid).
 * - Có `minute` -> lưu số phút đang xem dở của từng tập vào WatchProgress.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { watchItemId, note, episode, minute } = body as {
      watchItemId?: string;
      note?: string;
      episode?: number;
      minute?: number;
    };

    if (!watchItemId) {
      return NextResponse.json({ error: "Tham số 'watchItemId' là bắt buộc." }, { status: 400 });
    }

    const watchItem = await db.watchItem.findUnique({
      where: { id: watchItemId },
      include: { mediaItem: true },
    });

    if (!watchItem || watchItem.userId !== userId) {
      return NextResponse.json(
        { error: "Phim không tìm thấy trong thư viện của bạn." },
        { status: 404 },
      );
    }

    // Xác định tập đích.
    let target: number;
    if (episode !== undefined) {
      const e = Math.floor(Number(episode));
      if (!Number.isFinite(e) || e < 0) {
        return NextResponse.json({ error: "Số tập không hợp lệ." }, { status: 400 });
      }
      target = watchItem.totalEpisodes > 0 ? Math.min(e, watchItem.totalEpisodes) : e;
    } else {
      if (watchItem.currentEpisode >= watchItem.totalEpisodes && watchItem.totalEpisodes > 0) {
        return NextResponse.json({ error: "Phim đã hoàn thành xong số tập." }, { status: 400 });
      }
      target = watchItem.currentEpisode + 1;
    }

    const advancing = target > watchItem.currentEpisode;
    const isCompleted = watchItem.totalEpisodes > 0 && target >= watchItem.totalEpisodes;

    const updated = await db.$transaction(async (tx) => {
      // Ghi/cập nhật phút của tập bất kỳ (kể cả tập đã xem hoặc tập hiện tại).
      // `minute` là per-episode, độc lập với advancing.
      if (minute !== undefined && target > 0) {
        const m = Math.max(0, Math.floor(Number(minute)));
        if (Number.isFinite(m)) {
          await tx.watchProgress.upsert({
            where: {
              watchItemId_seasonNumber_episodeNumber: {
                watchItemId,
                seasonNumber: watchItem.currentSeason,
                episodeNumber: target,
              },
            },
            update: { minute: m },
            create: {
              watchItemId,
              seasonNumber: watchItem.currentSeason,
              episodeNumber: target,
              minute: m,
              note: note || `Đang xem dở tập ${target}`,
            },
          });
        }
      }

      // Chỉ ghi diary entry khi tiến về phía trước (tránh trùng khi tua lại).
      if (advancing && target > 0) {
        await tx.watchProgress.upsert({
          where: {
            watchItemId_seasonNumber_episodeNumber: {
              watchItemId,
              seasonNumber: watchItem.currentSeason,
              episodeNumber: target,
            },
          },
          update: {},
          create: {
            watchItemId,
            seasonNumber: watchItem.currentSeason,
            episodeNumber: target,
            note: note || `Xem tới tập ${target}`,
          },
        });

        await tx.watchSession.create({
          data: {
            userId,
            watchItemId,
            mediaType: watchItem.mediaItem.mediaType,
            seasonNumber: watchItem.currentSeason,
            episodeNumber: target,
            minutesWatched: watchItem.mediaItem.runtime || 45,
            note: note || `Xem tới tập ${target}`,
          },
        });
      }

      // Update currentMinute nếu được truyền lên.
      const minuteData =
        minute !== undefined
          ? { currentMinute: Math.max(0, Math.min(minute, watchItem.mediaItem.runtime || 90)) }
          : {};

      return tx.watchItem.update({
        where: { id: watchItemId },
        data: {
          currentEpisode: target,
          lastWatchedAt: new Date(),
          ...minuteData,
          ...(isCompleted
            ? { status: "completed", completedAt: new Date() }
            : target > 0
              ? { status: "watching" }
              : {}),
        },
      });
    });

    return NextResponse.json({
      success: true,
      currentEpisode: updated.currentEpisode,
      currentMinute: updated.currentMinute,
      status: updated.status,
      completed: isCompleted,
      startedAt: updated.startedAt?.toISOString() ?? null,
      completedAt: updated.completedAt?.toISOString() ?? null,
      lastWatchedAt: updated.lastWatchedAt?.toISOString() ?? null,
    });
  } catch (err: unknown) {
    console.error("Progress Route Error:", err);
    return NextResponse.json({ error: "Không thể cập nhật tiến độ." }, { status: 500 });
  }
}

/**
 * Cập nhật thủ công các mốc thời gian của WatchItem.
 * Body: { watchItemId, startedAt?, completedAt?, lastWatchedAt? } (mỗi trường có thể null).
 */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = patchWatchDatesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const { watchItemId, startedAt, completedAt, lastWatchedAt } = parsed.data;

    const existing = await db.watchItem.findUnique({ where: { id: watchItemId } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: "Không tìm thấy phim trong thư viện của bạn." },
        { status: 404 },
      );
    }

    const data: Record<string, unknown> = {};
    if (startedAt !== undefined) data.startedAt = startedAt;
    if (completedAt !== undefined) data.completedAt = completedAt;
    if (lastWatchedAt !== undefined) data.lastWatchedAt = lastWatchedAt;

    const updated = await db.watchItem.update({
      where: { id: watchItemId },
      data,
    });

    return NextResponse.json({
      success: true,
      startedAt: updated.startedAt?.toISOString() ?? null,
      completedAt: updated.completedAt?.toISOString() ?? null,
      lastWatchedAt: updated.lastWatchedAt?.toISOString() ?? null,
    });
  } catch (err: unknown) {
    console.error("Progress PATCH Route Error:", err);
    return NextResponse.json({ error: "Không thể cập nhật ngày." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
