import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  // Đã đăng nhập thì không cần vào trang auth nữa.
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return <>{children}</>;
}
