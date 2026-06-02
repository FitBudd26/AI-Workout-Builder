"use client";

import { cn } from "@/lib/cn";

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 h-7 rounded-full text-xs font-medium border transition",
        active
          ? "bg-black text-white border-black"
          : "bg-white text-ink-muted border-bg-border hover:border-black/60 hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}
