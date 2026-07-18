"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { LibraryProvider } from "@/lib/use-library";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { QuickAddProvider } from "@/components/shared/QuickAddDialog";

/** Gom các context provider phía client (session, toast, confirm dialog...) để mount ở root layout. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LibraryProvider>
        <ToastProvider>
          <ConfirmProvider>
            <QuickAddProvider>{children}</QuickAddProvider>
          </ConfirmProvider>
        </ToastProvider>
      </LibraryProvider>
    </SessionProvider>
  );
}
