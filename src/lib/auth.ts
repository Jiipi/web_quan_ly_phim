import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { env, features } from "@/lib/env";
import { authorizeCredentials } from "@/lib/auth-credentials";
import { authConfig } from "@/auth.config";
import { logAudit } from "@/lib/audit";

const providers: NextAuthConfig["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "user@phimflow.com" },
      password: { label: "Mật khẩu", type: "password" },
    },
    // Xác thực thật bằng bcrypt qua authorizeCredentials (đã bỏ backdoor "password123").
    authorize: (credentials) =>
      authorizeCredentials(credentials, (email) => db.user.findUnique({ where: { email } })),
  }),
];

// Chỉ bật đăng nhập Google khi có đủ credentials (feature flag từ env).
if (features.googleOAuth) {
  providers.push(
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = ((user as unknown as Record<string, unknown>).role as string) || "user";
      }
      if (user?.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.id) await logAudit(user.id, "auth.login");
    },
  },
});
