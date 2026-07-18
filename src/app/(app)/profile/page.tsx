import { redirect } from "next/navigation";
import { Heart, Film, CheckCircle2, PlayCircle, Library } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { COUNTRY_LABELS } from "@/lib/stats";

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
  const countries = pref?.favCountries ?? [];

  const stats = [
    { label: "Tổng phim", value: total, icon: Library, color: "text-primary" },
    { label: "Đã hoàn thành", value: completed, icon: CheckCircle2, color: "text-completed" },
    { label: "Đang xem", value: watching, icon: PlayCircle, color: "text-watching" },
  ];

  return (
    <div className="mx-auto flex max-w-2xl animate-fade-in-up flex-col gap-6">
      {/* Bio banner */}
      <div className="glass-panel relative flex flex-col items-center gap-5 overflow-hidden p-6 sm:flex-row">
        <div className="absolute right-0 top-0 -z-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/10 bg-primary/20 text-2xl font-extrabold text-primary">
          {initial}
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="mb-1 text-xl font-extrabold tracking-tight text-text">{name}</h2>
          <p className="font-mono text-xs text-text-muted">{email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-panel flex flex-col items-center gap-1 p-4">
              <Icon size={18} className={s.color} />
              <span className="text-xl font-extrabold text-text">{s.value}</span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Preferences */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-panel flex flex-col gap-3 p-5">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
            <Heart size={14} className="fill-current text-primary" />
            Thể loại yêu thích
          </h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {genres.length > 0 ? (
              genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-text-secondary"
                >
                  {g}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-text-muted">Chưa thiết lập</span>
            )}
          </div>
        </div>

        <div className="glass-panel flex flex-col gap-3 p-5">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
            <Film size={14} />
            Quốc gia ưa thích
          </h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {countries.length > 0 ? (
              countries.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-text-secondary"
                >
                  {COUNTRY_LABELS[c] ?? c}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-text-muted">Chưa thiết lập</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
