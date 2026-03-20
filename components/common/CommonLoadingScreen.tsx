"use client";

import { cn } from "@/lib/utils";

export interface CommonLoadingScreenProps {
  label?: string;
  className?: string;
}

export function CommonLoadingScreen({
  label = "Loading data...",
  className,
}: Readonly<CommonLoadingScreenProps>) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-40 flex items-center justify-center bg-zinc-950/55 backdrop-blur-[1px]",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/95 px-4 py-2 text-sm text-zinc-100 shadow-lg">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-100" />
        <span>{label}</span>
      </div>
    </div>
  );
}
