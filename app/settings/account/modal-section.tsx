"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/modal";
import { ModalCloseContext } from "@/components/modal-context";

/**
 * GitHub-style settings row: title, description, and a trigger button
 * that opens a modal containing the actual form. Keeps the page
 * scannable and destructive/heavy actions one click away from the
 * inputs that perform them.
 */
export function ModalSection({
  title,
  description,
  buttonLabel,
  modalTitle,
  modalDescription,
  tone = "default",
  children,
}: {
  title: string;
  description?: ReactNode;
  buttonLabel: string;
  modalTitle?: string;
  modalDescription?: ReactNode;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const isDanger = tone === "danger";
  const titleColor = isDanger ? "text-pink" : "text-foreground";
  const buttonClass = isDanger
    ? "border-pink/60 bg-pink/10 text-pink hover:bg-pink/20"
    : "border-border bg-surface/30 text-foreground hover:border-border-hover";

  return (
    <>
      <section
        className={`rounded-lg border p-5 ${
          isDanger ? "border-pink/40 bg-pink/5" : "border-border bg-surface/30"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="flex-1 min-w-0">
            <h2 className={`text-base font-semibold ${titleColor}`}>{title}</h2>
            {description && (
              <p className="text-xs text-dim mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${buttonClass}`}
          >
            {buttonLabel}
          </button>
        </div>
      </section>

      <Modal
        open={open}
        onClose={close}
        title={modalTitle ?? title}
        description={modalDescription}
        tone={tone}
      >
        <ModalCloseContext value={close}>{children}</ModalCloseContext>
      </Modal>
    </>
  );
}
