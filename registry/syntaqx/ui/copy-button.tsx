"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// The button is the trigger and the confirmation: the icon swaps to a check
// for 1.5s, then reverts so the user can copy again without thinking about
// it. Without a visible label, the aria-label follows the state instead.

export interface CopyButtonProps {
  text: string;
  label?: boolean;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}

export function CopyButton({
  text,
  label = false,
  size = "md",
  className,
  disabled = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    });
  };

  const sizes = {
    sm: {
      button: "gap-1 border px-1.5 py-1 text-[10px]",
      icon: 10,
    },
    md: {
      button: "gap-1.5 border px-2 py-1 text-xs",
      icon: 12,
    },
  };

  const s = sizes[size];

  return (
    <button
      type="button"
      data-slot="copy-button"
      onClick={copy}
      disabled={disabled}
      aria-label={label ? undefined : copied ? "Copied" : "Copy"}
      aria-live="polite"
      className={cn(
        "inline-flex cursor-pointer items-center transition-colors disabled:pointer-events-none disabled:opacity-40",
        s.button,
        copied
          ? "border-primary/40 text-primary"
          : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary",
        className,
      )}
    >
      {copied ? <Check size={s.icon} /> : <Copy size={s.icon} />}
      {label && (copied ? "Copied" : "Copy")}
    </button>
  );
}
