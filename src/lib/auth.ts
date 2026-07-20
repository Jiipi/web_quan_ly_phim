import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { env, features } from "@/lib/env";
import { authorizeCredentials } from "@/lib/auth-credentials";
import { authConfig } from "@/auth.config";
import { logAudit } from "@/lib/audit";
import { ROLES } from "@/types/role";

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
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.image = user.image || null;
        token.name = user.name || null;
      }
      if (trigger === "update" && updateSession) {
        if (updateSession.image !== undefined) token.image = updateSession.image;
        if (updateSession.name !== undefined) token.name = updateSession.name;
      }
      const userId = (token.id as string) || user?.id;
      if (userId) {
        const dbUser = await db.user.findUnique({
          where: { id: userId },
          select: { role: true, image: true, name: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.image = dbUser.image;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? ROLES[0];
        session.user.image = (token.image as string) ?? null;
        if (token.name) session.user.name = token.name as string;
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
