import React from "react";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-panel flex flex-col items-center justify-center text-center p-8 md:p-12 w-full max-w-lg mx-auto",
        className,
      )}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 text-primary mb-5 shadow-glow-primary">
        {icon || <Film size={28} />}
      </div>
      <h3 className="text-lg font-bold text-text mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-text-secondary mb-6 max-w-sm">{description}</p>
      {action && <div className="animate-fade-in-up">{action}</div>}
    </div>
  );
}
