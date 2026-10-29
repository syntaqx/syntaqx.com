"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUpRight, Check, ChevronDown, Copy, FileText } from "lucide-react";

/**
 * A split button: copy the page's Markdown (its .md URL), or open the menu
 * to copy it or view it in a new tab.
 */
export function MarkdownMenu({ href }: { href: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  // The fetch goes inside the ClipboardItem so Safari still counts the click
  // as the gesture.
  const copy = () => {
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
        className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 uppercase transition-colors hover:text-foreground"
      >
        {state === "copied" ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
        <span aria-live="polite">
          {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy as Markdown"}
        </span>
      </button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          aria-label="More Markdown options"
          className="flex cursor-pointer items-center border-l border-border px-1.5 transition-colors hover:text-foreground data-[state=open]:text-foreground"
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
