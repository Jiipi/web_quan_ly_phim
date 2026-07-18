import { LandingContent } from "@/components/home/LandingContent";

/**
 * Root page "/" — single unified landing page entry point for all users:
 * - Shows landing page for guests with register/login CTAs
 * - Shows landing page with integrated user dashboard, quick actions & stats for authenticated users
 */
export default function HomePage() {
  return <LandingContent />;
}
