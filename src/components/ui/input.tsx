import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-primary/30 bg-bg/60 px-4 py-2 text-sm text-text placeholder:text-text-muted/50",
          "transition-all focus:border-primary focus:bg-bg/80 focus:outline-none focus:shadow-[0_0_12px_oklch(0.72_0.32_330_/_0.3),inset_0_0_8px_oklch(0.72_0.32_330_/_0.1)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
