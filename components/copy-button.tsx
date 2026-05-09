"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function CopyButton({
  text,
  label = false,
  size = "md",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const sizes = {
    sm: {
      button: "gap-1 rounded border border-border px-1.5 py-1 text-[10px]",
      icon: 10,
    },
    md: {
      button: "gap-1.5 rounded border border-border px-2 py-1.5 text-xs",
      icon: 12,
    },
  };

  const s = sizes[size];

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center ${s.button} text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer ${className}`}
    >
      {copied ? <Check size={s.icon} /> : <Copy size={s.icon} />}
      {label && (copied ? "Copied" : "Copy")}
    </button>
  );
}
