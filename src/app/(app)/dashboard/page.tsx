import { redirect } from "next/navigation";

/**
 * Legacy /dashboard route — redirects to "/" where the dashboard now lives.
 */
export default function DashboardPage() {
  redirect("/");
}
