import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { isAdmin } from "@/types/role";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const userAdmin = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!isAdmin(userAdmin?.role ?? "")) {
      return NextResponse.json({ error: "Quyền truy cập bị từ chối." }, { status: 403 });
    }

    // Touch current admin user updatedAt so they are marked active
    await db.user
      .update({
        where: { id: userId },
        data: { updatedAt: new Date() },
      })
      .catch(() => null);

    // Measure DB Ping Latency
    const startPing = performance.now();
    await db.$queryRaw`SELECT 1`;
    const dbLatencyMs = Math.round(performance.now() - startPing);

    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Online Users (active session or activity within 15 minutes)
    const onlineUsers = await db.user.findMany({
      where: {
        OR: [
          { updatedAt: { gte: fifteenMinsAgo } },
          { sessions: { some: { expires: { gte: new Date() } } } },
          { auditLogs: { some: { createdAt: { gte: fifteenMinsAgo } } } },
          { watchItems: { some: { updatedAt: { gte: fifteenMinsAgo } } } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Active Users in last 24h
    const activeUsers24h = await db.user.count({
      where: {
        OR: [
          { updatedAt: { gte: twentyFourHoursAgo } },
          { watchItems: { some: { updatedAt: { gte: twentyFourHoursAgo } } } },
        ],
      },
    });

    // Counts
    const [totalUsers, totalMovies, totalWatchItems, totalLogs] = await Promise.all([
      db.user.count(),
      db.mediaItem.count(),
      db.watchItem.count(),
      db.auditLog.count(),
    ]);

    // Top 5 most tracked movies
    const topMovies = await db.mediaItem.findMany({
      take: 5,
      orderBy: {
        watchItems: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        title: true,
        posterPath: true,
        mediaType: true,
        tmdbRating: true,
        _count: {
          select: { watchItems: true },
        },
      },
    });

    // Recent 10 system audit logs
    const recentLogs = await db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Newly registered users (take 5)
    const recentUsers = await db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        dbLatencyMs,
        activeUsers24h,
        onlineUsersCount: onlineUsers.length,
        onlineUsers,
        totalUsers,
        totalMovies,
        totalWatchItems,
        totalLogs,
        topMovies,
        recentLogs,
        recentUsers,
        tmdbConnected: true,
        serverUptimeSec: Math.round(process.uptime()),
      },
    });
  } catch (err: unknown) {
    console.error("Admin Stats GET Error:", err);
    return NextResponse.json({ error: "Không thể lấy thống kê hệ thống." }, { status: 500 });
  }
}
