"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUpRight, Check, ChevronDown, Copy, FileText } from "lucide-react";

const labels = {
  idle: "Copy as Markdown",
  copying: "Copying…",
  copied: "Copied",
  failed: "Copy failed",
};

/**
 * A split button: copy the page's Markdown (its .md URL), or open the menu
 * to copy it or view it in a new tab.
 */
export function MarkdownMenu({ href }: { href: string }) {
  const [state, setState] = useState<keyof typeof labels>("idle");

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
    <div className="inst flex shrink-0 items-stretch border border-border bg-surface text-dim">
      <button
        type="button"
        onClick={copy}
        className={`flex cursor-pointer items-center gap-2 px-2.5 py-1.5 uppercase transition-colors hover:text-foreground active:bg-background ${
          state === "copied" ? "text-accent" : ""
        }`}
      >
        {state === "copied" ? <Check size={12} /> : <Copy size={12} />}
        {/* Every label in one cell, so the button keeps its width as it changes. */}
        <span aria-live="polite" className="grid">
          {Object.entries(labels).map(([key, label]) => (
            <span key={key} className={`col-start-1 row-start-1 ${key === state ? "" : "invisible"}`}>
              {label}
            </span>
          ))}
        </span>
      </button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          aria-label="More Markdown options"
          className="flex cursor-pointer items-center border-l border-border px-1.5 transition-colors hover:text-foreground active:bg-background data-[state=open]:bg-background data-[state=open]:text-foreground"
        >
          <ChevronDown size={13} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
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
