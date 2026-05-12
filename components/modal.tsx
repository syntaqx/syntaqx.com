"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Generic modal dialog.
 *
 * Behaviors borrowed from `components/search.tsx` and the mobile menu so
 * the site has one consistent overlay model:
 *   - Backdrop click closes (use `dismissable={false}` to disable).
 *   - Escape closes.
 *   - Body scroll is locked while open.
 *   - Focus is moved into the dialog on mount; native browser focus
 *     trapping is good-enough for the small forms we put in here. If we
 *     ever need a real focus trap, swap to a library — don't reinvent.
 *   - Renders into `document.body` via a portal so stacking-context
 *     issues from parent transforms/filters can't bury it.
 *
 * `tone="danger"` styles the title pink and the panel border pink.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  tone = "default",
  dismissable = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  tone?: "default" | "danger";
  dismissable?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const isDanger = tone === "danger";

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-start justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => dismissable && onClose()}
    >
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm" />
      <div
        className={`relative w-full sm:max-w-lg sm:rounded-xl border-b sm:border ${
          isDanger ? "border-pink/50" : "border-border"
        } bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
          <div className="flex-1 min-w-0">
            <h2
              className={`text-base font-semibold ${
                isDanger ? "text-pink" : "text-foreground"
              }`}
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs text-dim mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {dismissable && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 -mr-1 -mt-1 rounded-md p-1 text-dim hover:text-foreground hover:bg-background/40 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </header>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
