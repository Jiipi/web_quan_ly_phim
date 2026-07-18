"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";

export type ToastVariant = "success" | "error" | "info";

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Bridge layer to sonner. Existing call sites use useToast() with the same API
 * (`success`, `error`, `info`, `toast`) — we delegate rendering to sonner.
 *
 * Note: the actual <Toaster /> is mounted in the root layout. This provider
 * only exposes the imperative API; mounting a second <Toaster /> is a no-op
 * (only the first instance in the tree is rendered by sonner).
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast phải được dùng bên trong <ToastProvider>");
  }
  return ctx;
}

function bridge(variant: ToastVariant, message: string) {
  if (variant === "success") sonnerToast.success(message);
  else if (variant === "error") sonnerToast.error(message);
  else if (variant === "info") sonnerToast.info(message);
  else sonnerToast(message);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ToastContextValue>(
    () => ({
      toast: (m, v = "info") => bridge(v, m),
      success: (m) => bridge("success", m),
      error: (m) => bridge("error", m),
      info: (m) => bridge("info", m),
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <SonnerToaster
        position="bottom-right"
        richColors
        closeButton
        theme="system"
        toastOptions={{
          classNames: {
            toast: "!bg-surface/95 !backdrop-blur-md !border !border-border !text-text !shadow-2xl",
            title: "!text-text !font-semibold !text-sm",
            description: "!text-text-secondary !text-xs",
          },
        }}
      />
    </ToastContext.Provider>
  );
}
