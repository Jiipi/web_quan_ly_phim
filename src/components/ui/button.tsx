import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold uppercase tracking-widest transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_18px_oklch(0.72_0.32_330_/_0.45),inset_0_0_8px_oklch(0.72_0.32_330_/_0.25)] hover:bg-primary-hover hover:scale-[1.03] hover:shadow-[0_0_28px_oklch(0.72_0.32_330_/_0.65),inset_0_0_12px_oklch(0.72_0.32_330_/_0.35)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_0_14px_oklch(0.85_0.18_200_/_0.4),inset_0_0_6px_oklch(0.85_0.18_200_/_0.2)] hover:bg-secondary-hover hover:scale-[1.03]",
        outline:
          "border border-primary/40 bg-transparent text-text-secondary hover:bg-primary/10 hover:border-primary hover:text-primary hover:shadow-[0_0_12px_oklch(0.72_0.32_330_/_0.3)] hover:scale-[1.02]",
        ghost: "bg-transparent text-text-secondary hover:bg-primary/10 hover:text-primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_0_14px_oklch(0.72_0.3_25_/_0.4)] hover:bg-destructive/90 hover:scale-[1.03]",
        link: "text-primary underline-offset-4 hover:underline hover:[text-shadow:0_0_6px_oklch(0.72_0.32_330_/_0.7)]",
        glass:
          "border border-secondary/40 bg-bg/60 backdrop-blur-md text-text-secondary hover:border-secondary hover:bg-bg/80 hover:text-secondary hover:shadow-[0_0_16px_oklch(0.85_0.18_200_/_0.35)]",
        neon: "btn-neon",
        "neon-cyan": "btn-neon-cyan",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
