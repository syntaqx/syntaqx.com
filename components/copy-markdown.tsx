"use client";

import { useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUpRight, Check, ChevronDown, Copy, FileText, X } from "lucide-react";
import { Tip } from "@/components/tip";

const labels = {
  idle: "Copy as Markdown",
  copying: "Copying…",
  copied: "Copied",
  failed: "Copy failed",
};

/**
 * An icon split button: copy the page's Markdown (its .md URL), or open the menu
 * to copy it or view it in a new tab.
 */
export function MarkdownMenu({ href }: { href: string }) {
  const [state, setState] = useState<keyof typeof labels>("idle");
  // Radix hands focus back to the trigger on close, and Chrome draws the
  // keyboard ring for it even after a click. Return it only for the keyboard.
  const byPointer = useRef(false);

  // The fetch goes inside the ClipboardItem so Safari still counts the click
  // as the gesture. Feedback starts on the press, before the fetch returns.
  const copy = () => {
    setState("copying");
    navigator.vibrate?.(10);
    const text = fetch(href)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => new Blob([t], { type: "text/plain" }));
    navigator.clipboard
      .write([new ClipboardItem({ "text/plain": text })])
      .then(() => setState("copied"), () => setState("failed"))
      .finally(() => setTimeout(() => setState("idle"), 2000));
  };

  const item =
    "flex cursor-pointer gap-2.5 px-3 py-2 outline-none transition-colors data-highlighted:bg-background";

  return (
    <div className="inst flex h-6.5 shrink-0 items-stretch border border-border bg-surface text-dim">
      <Tip label={labels[state]}>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy as Markdown"
          className={`flex cursor-pointer items-center px-2 transition-colors hover:text-foreground active:bg-background ${
            state === "copied" ? "text-accent" : ""
          }`}
        >
          {state === "copied" ? <Check size={12} aria-hidden /> : state === "failed" ? <X size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
          <span aria-live="polite" className="sr-only">
            {state === "idle" ? "" : labels[state]}
          </span>
        </button>
      </Tip>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          onPointerDown={() => (byPointer.current = true)}
          onKeyDown={() => (byPointer.current = false)}
          aria-label="More Markdown options"
          className="flex cursor-pointer items-center border-l border-border px-1.5 transition-colors hover:text-foreground active:bg-background data-[state=open]:bg-background data-[state=open]:text-foreground"
        >
          <ChevronDown size={13} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            onCloseAutoFocus={(e) => byPointer.current && e.preventDefault()}
            align="end"
            sideOffset={4}
            className="z-100 w-60 border border-border bg-surface py-1 text-sm shadow-lg"
          >
            <DropdownMenu.Item onSelect={copy} className={item}>
              <Copy size={14} className="mt-0.5 shrink-0 text-dim" />
              <span>
                <span className="block text-foreground">Copy as Markdown</span>
                <span className="block text-xs text-dim">Use with any LLM</span>
              </span>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild className={item}>
              <a href={href} type="text/markdown" target="_blank" rel="noopener">
                <FileText size={14} className="mt-0.5 shrink-0 text-dim" />
                <span className="flex-1">
                  <span className="block text-foreground">View as Markdown</span>
                  <span className="block text-xs text-dim">Open the page in a new tab</span>
                </span>
                <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-dim" />
              </a>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
