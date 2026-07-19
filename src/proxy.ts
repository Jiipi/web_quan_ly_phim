import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Next 16 đổi tên "middleware" -> "proxy". Instance Auth.js đọc session từ JWT (không đụng DB).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // 1. Chưa đăng nhập -> chuyển về /login kèm callbackUrl để quay lại sau.
  if (!req.auth) {
    // Cho phép khách truy cập trang chi tiết danh sách công khai
    const isListDetail = pathname.startsWith("/lists/") && pathname.split("/").length === 3;
    if (isListDetail) {
      return NextResponse.next();
    }

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Đã đăng nhập nhưng cố gắng truy cập route Admin mà không có role admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const role = (req.auth.user as unknown as Record<string, unknown>)?.role;
    if (role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return new NextResponse(JSON.stringify({ error: "Quyền truy cập bị từ chối." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      const dashboardUrl = req.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/library/:path*",
    "/discover/:path*",
    "/continue-watching/:path*",
    "/watchlist/:path*",
    "/calendar/:path*",
    "/ai/:path*",
    "/stats/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/movie/:path*",
    "/show/:path*",
    "/lists/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
