import type { NextAuthConfig } from "next-auth";

/**
 * Cấu hình Auth.js dùng chung, AN TOÀN cho Edge runtime (KHÔNG import Prisma/bcrypt/db).
 * - Dùng bởi middleware (edge) để đọc session từ JWT.
 * - Được auth.ts (Node) mở rộng thêm adapter Prisma + providers có truy vấn DB.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  // Providers thật (Credentials + Google) được thêm trong auth.ts vì cần DB.
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = ((user as unknown as Record<string, unknown>).role as string) || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role =
          (token.role as string) || "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
