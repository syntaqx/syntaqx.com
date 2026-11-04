"use client";

import { useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Copy, FileText, X } from "lucide-react";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/menu";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";
import { Button } from "@/registry/syntaqx/ui/button";
import { ButtonGroup } from "@/registry/syntaqx/ui/button-group";

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
      .then(
        () => setState("copied"),
        () => setState("failed"),
      )
      .finally(() => setTimeout(() => setState("idle"), 2000));
  };

  return (
    <ButtonGroup className="shrink-0">
      <Tip label={labels[state]}>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={copy}
          aria-label="Copy as Markdown"
          className={cn("text-muted-foreground", state === "copied" && "text-primary")}
        >
          {state === "copied" ? <Check /> : state === "failed" ? <X /> : <Copy />}
          <span aria-live="polite" className="sr-only">
            {state === "idle" ? "" : labels[state]}
          </span>
        </Button>
      </Tip>
      <Menu>
        <MenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="More Markdown options"
            className="text-muted-foreground"
          >
            <ChevronDown />
          </Button>
        </MenuTrigger>
        <MenuContent className="w-60 text-sm">
          <MenuItem onSelect={copy} className="gap-2.5 py-2">
            <Copy size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
            <span>
              <span className="block text-foreground">Copy as Markdown</span>
              <span className="block text-xs text-muted-foreground">Use with any LLM</span>
            </span>
          </MenuItem>
          <MenuItem asChild className="gap-2.5 py-2">
            <a href={href} type="text/markdown" target="_blank" rel="noopener">
              <FileText size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
              <span className="flex-1">
                <span className="block text-foreground">View as Markdown</span>
                <span className="block text-xs text-muted-foreground">
                  Open the page in a new tab
                </span>
              </span>
              <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
            </a>
          </MenuItem>
        </MenuContent>
      </Menu>
    </ButtonGroup>
  );
}
