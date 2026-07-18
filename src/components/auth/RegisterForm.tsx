"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { registerAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

interface FieldProps {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  errors?: string[];
}

function IconField({
  id,
  name,
  label,
  type,
  placeholder,
  autoComplete,
  icon: Icon,
  errors,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold uppercase tracking-wider text-text-muted"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          size={16}
        />
        <Input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          aria-invalid={Boolean(errors?.length) || undefined}
          className="pl-10"
        />
      </div>
      {errors?.map((err) => (
        <p key={err} className="text-[11px] text-dropped">
          {err}
        </p>
      ))}
    </div>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-dropped/30 bg-dropped/10 px-4 py-3 text-xs font-medium text-dropped"
        >
          {state.error}
        </div>
      )}

      <IconField
        id="name"
        name="name"
        label="Tên hiển thị"
        type="text"
        autoComplete="name"
        placeholder="Tên của bạn"
        icon={User}
        errors={state.fieldErrors?.name}
      />
      <IconField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="user@phimflow.com"
        icon={Mail}
        errors={state.fieldErrors?.email}
      />
      <IconField
        id="password"
        name="password"
        label="Mật khẩu"
        type="password"
        autoComplete="new-password"
        placeholder="Tối thiểu 8 ký tự"
        icon={Lock}
        errors={state.fieldErrors?.password}
      />
      <IconField
        id="confirmPassword"
        name="confirmPassword"
        label="Nhập lại mật khẩu"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        icon={Lock}
        errors={state.fieldErrors?.confirmPassword}
      />

      <Button type="submit" disabled={pending} size="lg" className="mt-2 w-full">
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Đang tạo tài khoản…
          </>
        ) : (
          "Tạo tài khoản"
        )}
      </Button>

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Hoặc
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      <Button type="button" variant="glass" size="lg" className="w-full">
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
        Đăng ký với Google
      </Button>

      <p className="text-center text-xs text-text-secondary md:hidden">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-secondary transition-colors hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
