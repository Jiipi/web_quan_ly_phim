import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
  {
    variants: {
      variant: {
        default:
          "bg-primary/15 text-primary border border-primary/40",
        secondary:
          "bg-secondary/15 text-secondary border border-secondary/40",
        outline: "border border-primary/40 text-text-secondary bg-bg/60",
        success:
          "bg-completed/15 text-completed border border-completed/40",
        warning:
          "bg-paused/15 text-paused border border-paused/40",
        destructive:
          "bg-dropped/15 text-dropped border border-dropped/40",
        info:
          "bg-watching/15 text-watching border border-watching/40",
        accent:
          "bg-accent/15 text-accent border border-accent/40",
        ghost: "bg-surface/80 text-text-secondary border border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
