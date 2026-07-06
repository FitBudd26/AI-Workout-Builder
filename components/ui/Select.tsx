"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, options, placeholder, value, ...rest },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        value={value}
        className={cn(
          "h-10 w-full appearance-none rounded-lg bg-white border border-bg-border px-3 pr-9 text-sm text-ink",
          "focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/30 transition",
          (value === "" || value === undefined) && "text-ink-dim",
          invalid && "border-brand-orange focus:border-brand-orange",
          className
        )}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});
