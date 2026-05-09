"use client";

import { useState } from "react";
import { ClipboardPaste, Check } from "lucide-react";

interface PasteButtonProps {
  onPaste: (text: string) => void;
  label?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function PasteButton({
  onPaste,
  label = false,
  size = "md",
  className = "",
}: PasteButtonProps) {
  const [pasted, setPasted] = useState(false);

  const paste = () => {
    navigator.clipboard.readText().then((text) => {
      if (text) {
        onPaste(text);
        setPasted(true);
        setTimeout(() => setPasted(false), 1500);
      }
    });
  };

  const sizes = {
    sm: {
      button: "gap-1 rounded border border-border px-1.5 py-1 text-[10px]",
      icon: 10,
    },
    md: {
      button: "gap-1.5 rounded border border-border px-2 py-1 text-xs",
      icon: 12,
    },
  };

  const s = sizes[size];

  return (
    <button
      onClick={paste}
      className={`inline-flex items-center ${s.button} text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer ${className}`}
    >
      {pasted ? <Check size={s.icon} /> : <ClipboardPaste size={s.icon} />}
      {label && (pasted ? "Pasted" : "Paste")}
    </button>
  );
}
