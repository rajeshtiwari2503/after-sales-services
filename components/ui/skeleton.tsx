// import { cn } from "@/lib/utils"

// function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
//   return (
//     <div
//       data-slot="skeleton"
//       className={cn("animate-pulse rounded-md bg-muted", className)}
//       {...props}
//     />
//   )
// }

// export { Skeleton }

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const ROUNDED = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-slate-200", ROUNDED[rounded], className)} />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="w-8 h-8" rounded="lg" />
      </div>
      <Skeleton className="h-7 w-16" />
      {Array(lines - 2).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-2.5 w-20" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="h-11 bg-slate-50 border-b border-slate-100" />
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 last:border-0 animate-pulse">
          {Array(cols).fill(0).map((_, j) => (
            <Skeleton key={j} className={`h-3 ${j === 1 ? "flex-1" : j === 0 ? "w-10" : "w-20"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}