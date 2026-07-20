import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/types/role";

interface RequireAdminProps {
  children: React.ReactNode;
  /** Redirect destination when unauthorized. Defaults to "/". */
  redirectTo?: string;
}

/**
 * Server Component guard.
 * Renders children only if the current session belongs to an admin.
 * Redirects otherwise.
 *
 * Usage:
 *   export default async function AdminPage() {
 *     return <RequireAdmin><AdminContent /></RequireAdmin>;
 *   }
 */
export async function RequireAdmin({ children, redirectTo = "/" }: RequireAdminProps) {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role as string)) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}
