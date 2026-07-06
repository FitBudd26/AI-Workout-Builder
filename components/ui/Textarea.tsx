"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg bg-white border border-bg-border px-3 py-2.5 text-sm text-ink placeholder:text-ink-dim",
          "focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/30 transition",
          "min-h-[60px] resize-y",
          invalid && "border-brand-orange focus:border-brand-orange",
          className
        )}
        {...rest}
      />
    );
  }
);
