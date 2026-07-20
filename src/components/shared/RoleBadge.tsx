import { isAdmin } from "@/types/role";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const admin = isAdmin(role);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
        admin
          ? "bg-primary/20 text-primary border-primary/30"
          : "bg-white/10 text-text-secondary border-white/10"
      } ${className}`}
    >
      {admin ? "Admin" : "User"}
    </span>
  );
}
