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
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-black text-white hover:bg-accent-hover shadow-glow active:translate-y-px",
  secondary:
    "bg-white text-ink border border-bg-border hover:border-black/50",
  ghost: "text-ink-muted hover:text-ink hover:bg-bg-card",
  outline:
    "border border-bg-border text-ink hover:border-black",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
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
