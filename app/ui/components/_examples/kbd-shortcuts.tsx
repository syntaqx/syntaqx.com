"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/syntaqx/ui/button";
import { Kbd, KbdGroup } from "@/registry/syntaqx/ui/kbd";

const ROWS = [
  "Rotate signing keys",
  "Backfill the ledger",
  "Drain the old queue",
  "Ship the audit export",
];

export default function KbdShortcuts() {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [help, setHelp] = useState(false);

  const toggle = (i: number) =>
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  // Scoped to the list: the keys work only while it has focus, so typing
  // a "j" anywhere else never moves it.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const keys: Record<string, () => void> = {
      j: () => setCursor((c) => Math.min(ROWS.length - 1, c + 1)),
      k: () => setCursor((c) => Math.max(0, c - 1)),
      x: () => toggle(cursor),
      "?": () => setHelp((h) => !h),
      Escape: () => setHelp(false),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  };

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label="Tasks. Press question mark for keyboard shortcuts."
      onKeyDown={onKeyDown}
      className="relative w-full max-w-md overflow-hidden rounded-lg border outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm text-muted-foreground">
        <span>{selected.length} selected</span>
        <Button variant="outline" size="sm" tabIndex={-1} onClick={() => toggle(cursor)}>
          Select <Kbd>X</Kbd>
        </Button>
      </div>
      <ul>
        {ROWS.map((row, i) => (
          <li
            key={row}
            onClick={() => setCursor(i)}
            className={cn(
              "flex cursor-pointer items-center gap-3 border-l-2 px-4 py-3 text-sm",
              i === cursor
                ? "border-primary bg-primary/5 text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-4 shrink-0 rounded-sm border",
                selected.includes(i) ? "border-primary bg-primary" : "border-input",
              )}
            />
            {row}
          </li>
        ))}
      </ul>
      <p className="border-t px-4 py-2 text-xs text-muted-foreground">
        Press <Kbd>?</Kbd> for shortcuts
      </p>
      {help && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4">
          <div className="w-full max-w-xs rounded-lg border bg-card p-6 shadow-lg">
            <p className="mb-4 text-sm font-medium">Keyboard shortcuts</p>
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <dt>
                <KbdGroup>
                  <Kbd>J</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </dt>
              <dd>Next, previous</dd>
              <dt>
                <Kbd>X</Kbd>
              </dt>
              <dd>Select</dd>
              <dt>
                <Kbd>?</Kbd>
              </dt>
              <dd>Show or hide this sheet</dd>
              <dt>
                <Kbd>Esc</Kbd>
              </dt>
              <dd>Close</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
