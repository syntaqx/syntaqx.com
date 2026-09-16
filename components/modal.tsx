"use client";

import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/**
 * Generic modal dialog, built on Radix Dialog.
 *
 * Radix gives us the accessibility plumbing for free: focus is trapped
 * inside the panel, returned to the trigger on close, the title/description
 * are wired via `aria-labelledby`/`aria-describedby`, Escape closes, body
 * scroll is locked, and the rest of the page is `aria-hidden` while open.
 * It renders through a portal so parent transforms/filters can't bury it.
 *
 * `dismissable={false}` disables Escape and outside-click close and hides
 * the close button (for flows that must resolve via an action).
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
  const isDanger = tone === "danger";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-100 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <div className="fixed inset-0 z-100 flex items-start justify-center sm:items-center sm:p-4 pointer-events-none">
          <Dialog.Content
            {...(description ? {} : { "aria-describedby": undefined })}
            onEscapeKeyDown={(e) => {
              if (!dismissable) e.preventDefault();
            }}
            onPointerDownOutside={(e) => {
              if (!dismissable) e.preventDefault();
            }}
            onInteractOutside={(e) => {
              if (!dismissable) e.preventDefault();
            }}
            className={`pointer-events-auto relative w-full sm:max-w-lg sm:rounded-xl border-b sm:border ${
              isDanger ? "border-pink/50" : "border-border"
            } bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-full`}
          >
            <header className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
              <div className="flex-1 min-w-0">
                <Dialog.Title
                  className={`text-base font-semibold ${
                    isDanger ? "text-pink" : "text-foreground"
                  }`}
                >
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="text-xs text-dim mt-1 leading-relaxed">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              {dismissable && (
                <Dialog.Close
                  aria-label="Close"
                  className="shrink-0 -mr-1 -mt-1 rounded-md p-1 text-dim hover:text-foreground hover:bg-background/40 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </Dialog.Close>
              )}
            </header>
            <div className="px-5 py-4 overflow-y-auto">{children}</div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
