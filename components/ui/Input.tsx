"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg bg-white border border-bg-border px-3 text-sm text-ink placeholder:text-ink-dim",
        "focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/30 transition",
        invalid && "border-brand-orange focus:border-brand-orange",
        className
      )}
      {...rest}
    />
  );
});
