"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Mail, Lock, Loader2, Terminal } from "lucide-react";
import { loginAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const router = useRouter();
  const { update } = useSession();

  useEffect(() => {
    if (!state?.success || !state.redirectTo) return;
    // Đồng bộ SessionProvider trước khi điều hướng — nếu không `useSession()`
    // ở header vẫn trả về session cũ (null) cho tới khi user reload.
    void update().then(() => {
      router.push(state.redirectTo!);
      router.refresh();
    });
  }, [state, router, update]);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error && (
        <div
          role="alert"
          className="rounded-md border border-dropped/40 bg-dropped/10 px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-dropped"
          style={{ boxShadow: "0 0 12px oklch(0.72 0.3 25 / 0.35)" }}
        >
          ⚠ ERR.LOGIN: {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary"
        >
          <span className="inline-block h-1 w-1 rounded-full bg-primary" />
          Email
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary"
            size={16}
            style={{
              filter: "drop-shadow(0 0 4px oklch(0.72 0.32 330 / 0.5))",
            }}
          />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="user@cineos.com"
            required
            aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
            className="rounded-md border-primary/30 bg-bg/60 pl-10 font-mono transition-all focus:border-primary focus:bg-bg/80 focus:shadow-[0_0_12px_oklch(0.72_0.32_330_/_0.3),inset_0_0_8px_oklch(0.72_0.32_330_/_0.1)]"
          />
        </div>
        {state.fieldErrors?.email?.map((err) => (
          <p key={err} className="font-mono text-[10px] uppercase tracking-wider text-dropped">
            ⚠ {err}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary"
        >
          <span className="inline-block h-1 w-1 rounded-full bg-secondary" />
          Mật khẩu
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary"
            size={16}
            style={{
              filter: "drop-shadow(0 0 4px oklch(0.85 0.18 200 / 0.5))",
            }}
          />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            aria-invalid={Boolean(state.fieldErrors?.password) || undefined}
            className="rounded-md border-primary/30 bg-bg/60 pl-10 font-mono transition-all focus:border-primary focus:bg-bg/80 focus:shadow-[0_0_12px_oklch(0.72_0.32_330_/_0.3),inset_0_0_8px_oklch(0.72_0.32_330_/_0.1)]"
          />
        </div>
        {state.fieldErrors?.password?.map((err) => (
          <p key={err} className="font-mono text-[10px] uppercase tracking-wider text-dropped">
            ⚠ {err}
          </p>
        ))}
      </div>

      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className="mt-2 w-full rounded-md uppercase tracking-widest shadow-[0_0_24px_oklch(0.72_0.32_330_/_0.5),inset_0_0_8px_oklch(0.72_0.32_330_/_0.3)] hover:shadow-[0_0_32px_oklch(0.72_0.32_330_/_0.7),inset_0_0_12px_oklch(0.72_0.32_330_/_0.4)]"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Authenticating…
          </>
        ) : (
          <>
            <Terminal size={14} />
            Execute Login
          </>
        )}
      </Button>

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-primary/20" />
        <span className="px-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
          HOẶC // OAUTH
        </span>
        <div className="flex-1 border-t border-primary/20" />
      </div>

      <Button
        type="button"
        variant="glass"
        size="lg"
        className="w-full rounded-md border border-secondary/30 bg-secondary/5 font-mono text-xs uppercase tracking-widest text-secondary transition-all hover:border-secondary/60 hover:bg-secondary/10 hover:[text-shadow:0_0_6px_oklch(0.85_0.18_200_/_0.7)]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            opacity=".9"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            opacity=".8"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            opacity=".7"
          />
        </svg>
        Login via Google
      </Button>

      <p className="text-center text-xs text-text-secondary md:hidden">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-bold uppercase tracking-wider text-primary transition-all hover:text-secondary hover:[text-shadow:0_0_6px_oklch(0.85_0.18_200_/_0.7)]"
        >
          Đăng ký ngay →
        </Link>
      </p>
    </form>
  );
}
