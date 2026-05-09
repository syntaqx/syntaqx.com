"use client";

import { useState, useId, type ReactNode } from "react";
import { Check, Info } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  tooltip?: ReactNode;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  tooltip,
  className = "",
}: CheckboxProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const id = useId();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 cursor-pointer group"
      >
        <button
          id={id}
          role="checkbox"
          type="button"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`flex items-center justify-center w-3.5 h-3.5 rounded border transition-colors cursor-pointer ${
            checked
              ? "bg-accent border-accent"
              : "border-dim/40 group-hover:border-accent/50"
          }`}
        >
          {checked && (
            <Check size={10} strokeWidth={3} className="text-background" />
          )}
        </button>
        <span className="text-xs text-dim group-hover:text-accent transition-colors select-none">
          {label}
        </span>
      </label>
      {tooltip && (
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info
            size={11}
            className="text-dim/50 hover:text-dim transition-colors cursor-help"
          />
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[10px] text-dim leading-snug shadow-lg z-50">
              {tooltip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
