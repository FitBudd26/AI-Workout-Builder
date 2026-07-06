"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/30 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-orange text-white hover:bg-brand-orangeDark shadow-glow active:translate-y-px",
  secondary:
    "bg-white text-brand-teal border border-brand-teal/40 hover:border-brand-teal",
  ghost: "text-ink-muted hover:text-ink hover:bg-bg-card",
  outline:
    "border border-bg-border text-ink hover:border-brand-teal",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-[46px] px-5 text-sm", // primary button height (spec)
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulseDot" />
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulseDot [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulseDot [animation-delay:400ms]" />
        </span>
      ) : (
        children
      )}
    </button>
  );
});
