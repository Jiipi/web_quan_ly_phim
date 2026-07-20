import { redirect } from "next/navigation";
import { CheckCircle2, PlayCircle, Library } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { COUNTRY_LABELS } from "@/lib/stats";
import { ProfileBody } from "@/components/profile/ProfileBody";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [pref, total, completed, watching] = await Promise.all([
    db.userPreference.findUnique({ where: { userId } }),
    db.watchItem.count({ where: { userId } }),
    db.watchItem.count({ where: { userId, status: "completed" } }),
    db.watchItem.count({ where: { userId, status: "watching" } }),
  ]);

  const name = session.user.name || "Người dùng CineOS";
  const email = session.user.email || "";
  const initial = (name || email || "U").charAt(0).toUpperCase();
  const genres = pref?.favGenres ?? [];
  const countries = (pref?.favCountries ?? []).map((c) => ({
    code: c,
    label: COUNTRY_LABELS[c] ?? c,
  }));

  const stats = [
    { label: "Tổng phim", value: total, icon: Library, color: "text-primary" },
    { label: "Đã hoàn thành", value: completed, icon: CheckCircle2, color: "text-completed" },
    { label: "Đang xem", value: watching, icon: PlayCircle, color: "text-watching" },
  ];

  return (
    <div className="mx-auto flex max-w-2xl animate-fade-in-up flex-col">
      <ProfileBody
        name={name}
        email={email}
        initial={initial}
        stats={stats.map(({ label, value, color }) => ({ label, value, color }))}
        genres={genres}
        countries={countries}
      />
    </div>
  );
}
