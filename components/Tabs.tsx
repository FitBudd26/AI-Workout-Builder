"use client";

import { cn } from "@/lib/cn";

interface TabsProps {
  value: "guided" | "chat";
  onChange: (v: "guided" | "chat") => void;
}

export function Tabs({ value, onChange }: TabsProps) {
  return (
    <div className="grid grid-cols-2 bg-bg-card border border-bg-border rounded-xl p-1">
      <TabButton
        active={value === "guided"}
        onClick={() => onChange("guided")}
        label="Guided Mode"
      />
      <TabButton
        active={value === "chat"}
        onClick={() => onChange("chat")}
        label="Chat Mode"
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2",
        active
          ? "bg-brand-teal text-white shadow-card"
          : "text-ink-muted hover:text-ink"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-white" : "bg-ink-dim"
        )}
      />
      {label}
    </button>
  );
}
