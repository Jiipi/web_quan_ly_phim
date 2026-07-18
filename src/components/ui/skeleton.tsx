import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md skeleton-shimmer bg-card/40", className)} {...props} />;
}

export { Skeleton };
