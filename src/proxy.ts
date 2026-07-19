import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Next 16 đổi tên "middleware" -> "proxy". Instance Auth.js đọc session từ JWT (không đụng DB).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Proxy chỉ chạy trên các route được bảo vệ (xem matcher bên dưới).
  // Chưa đăng nhập -> chuyển về /login kèm callbackUrl để quay lại sau.
  if (!req.auth) {
    // Cho phép khách truy cập trang chi tiết danh sách công khai
    const pathname = req.nextUrl.pathname;
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
  ],
};
