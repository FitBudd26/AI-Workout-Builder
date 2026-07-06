"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  required,
  error,
  hint,
  htmlFor,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold text-ink flex items-center gap-1"
      >
        {label}
        {required && <span className="text-brand-orange">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-brand-orange">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-ink-dim">{hint}</p>
      ) : null}
    </div>
  );
}
