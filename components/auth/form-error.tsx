"use client";

import { X } from "lucide-react";

export function FormError({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className="relative flex items-center justify-center rounded-lg border border-mauve/40 bg-mauve/10 px-8 py-2.5 text-center text-xs text-mauve"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-mauve/70 hover:text-mauve transition-colors cursor-pointer"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
