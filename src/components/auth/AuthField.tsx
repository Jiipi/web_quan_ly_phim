"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  errors?: string[];
}

export function AuthField({ label, name, errors, className, ...rest }: AuthFieldProps) {
  const hasError = Boolean(errors?.length);
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary"
      >
        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            "w-full rounded-md border bg-bg/60 px-3.5 py-2.5 font-mono text-sm text-text outline-none transition-all placeholder:text-text-muted/40",
            "focus:border-primary focus:bg-bg/80 focus:shadow-[0_0_12px_oklch(0.72_0.32_330_/_0.3),inset_0_0_8px_oklch(0.72_0.32_330_/_0.1)]",
            hasError
              ? "border-dropped shadow-[0_0_8px_oklch(0.72_0.3_25_/_0.4)]"
              : "border-primary/30",
            className,
          )}
          {...rest}
        />
        {/* Corner brackets inside input */}
        <span className="pointer-events-none absolute -left-px -top-px h-2 w-2 border-l border-t border-primary opacity-0 transition-opacity peer-focus:opacity-100" />
      </div>
      {hasError && (
        <p
          id={errorId}
          role="alert"
          className="font-mono text-[10px] uppercase tracking-wider text-dropped"
        >
          ⚠ {errors![0]}
        </p>
      )}
    </div>
  );
}
