"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SidePanelSide = "left" | "right";

export interface SidePanelProps {
  side: SidePanelSide;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function SidePanel({
  side,
  title,
  children,
  footer,
  className,
}: Readonly<SidePanelProps>) {
  return (
    <div
      className={cn(
        "absolute top-4 z-10 flex max-h-[calc(100vh-2rem)] w-[min(100%-2rem,300px)] flex-col",
        "rounded-xl border bg-background/90 shadow-lg backdrop-blur",
        side === "left" ? "left-4" : "right-4",
        className
      )}
    >
      {/* Header */}
      {title && (
        <div className="border-b px-4 py-2 text-sm font-semibold">
          {title}
        </div>
      )}

      {/* Content (scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
        {children}
      </div>

      {/* Footer (optional) */}
      {footer && (
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}