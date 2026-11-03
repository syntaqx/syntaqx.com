"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Bold, Code, Italic, Link2, Underline, X } from "lucide-react";
import { Modal } from "@/components/modal";
import { ButtonGroup } from "@/registry/syntaqx/ui/button-group";
import { Kbd, KbdGroup } from "@/registry/syntaqx/ui/kbd";
import { cn } from "@/lib/cn";
import { DemoFrame } from "@/app/ui/_components/demo-frame";
import { Button } from "@/registry/syntaqx/ui/button";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";
import { Textarea } from "@/registry/syntaqx/ui/textarea";

// ---------------------------------------------------------------------------
// Roving focus
// ---------------------------------------------------------------------------
// A toolbar is one Tab stop, not five. Only the current button is in the tab
// order (tabIndex 0); the rest are -1, and the arrow keys move between them.
// Tab leaves the group entirely, and coming back lands where you left off.

const TOOLS = [
  { label: "Bold", icon: Bold },
  { label: "Italic", icon: Italic },
  { label: "Underline", icon: Underline },
  { label: "Link", icon: Link2 },
  { label: "Code", icon: Code },
];

function RovingDemo() {
  const [active, setActive] = useState(0);
  const [pressed, setPressed] = useState<string[]>([]);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (to: number) => {
    const i = (to + TOOLS.length) % TOOLS.length;
    setActive(i);
    refs.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(active + 1),
      ArrowLeft: () => move(active - 1),
      Home: () => move(0),
      End: () => move(TOOLS.length - 1),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  };

  return (
    <DemoFrame
      note={
        <>
          Tab into the toolbar from the first field, use <Kbd>←</Kbd> <Kbd>→</Kbd> <Kbd>Home</Kbd>{" "}
          <Kbd>End</Kbd> inside it, and one more Tab takes you out. Shift+Tab back in returns to the
          last button you were on.
        </>
      }
    >
      <div className="max-w-md space-y-4 p-6">
        <Field>
          <FieldLabel>Title</FieldLabel>
          <Input />
        </Field>
        <ButtonGroup role="toolbar" aria-label="Formatting" onKeyDown={onKeyDown}>
          {TOOLS.map(({ label, icon: Icon }, i) => {
            const on = pressed.includes(label);
            return (
              <Button
                key={label}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                variant="outline"
                size="icon"
                tabIndex={i === active ? 0 : -1}
                aria-label={label}
                aria-pressed={on}
                onFocus={() => setActive(i)}
                onClick={() =>
                  setPressed((p) => (on ? p.filter((x) => x !== label) : [...p, label]))
                }
                className={cn(
                  on
                    ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                    : "text-muted-foreground",
                )}
              >
                <Icon />
              </Button>
            );
          })}
        </ButtonGroup>
        <Field>
          <FieldLabel>Body</FieldLabel>
          <Textarea rows={2} />
        </Field>
      </div>
    </DemoFrame>
  );
}

// ---------------------------------------------------------------------------
// Focus comes home
// ---------------------------------------------------------------------------
// Two dialogs. One is the site's own Modal (Radix Dialog), which moves focus
// in, traps it, and returns it to the button that opened it. The other is a
// hand-rolled overlay that does none of that: close it and focus falls back
// to the page, so a keyboard user starts over from the top.

function describe(el: Element | null): string {
  if (!el || el === document.body) return "nothing (the page itself)";
  const label = el.getAttribute("aria-label") ?? el.textContent?.trim();
  return label ? `“${label.slice(0, 32)}”` : el.tagName.toLowerCase();
}

function FocusWatcher() {
  const [where, setWhere] = useState("nothing yet");

  useEffect(() => {
    // focusout fires before the next element gains focus, so read the
    // settled activeElement a tick later.
    const update = () => setTimeout(() => setWhere(describe(document.activeElement)), 0);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);

  return (
    <p className="text-sm text-muted-foreground" aria-hidden>
      Focus is on: <span className="text-foreground">{where}</span>
    </p>
  );
}

function NaiveDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-background/70 p-4"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-base font-medium text-foreground">Hand-rolled dialog</p>
          <Button variant="ghost" size="icon-sm" autoFocus aria-label="Close" onClick={onClose}>
            <X />
          </Button>
        </div>
        <p className="text-sm/relaxed text-muted-foreground">
          Focus came in because the close button autofocuses. Tab can still walk out behind this
          overlay, and closing it drops focus on the page.
        </p>
      </div>
    </div>
  );
}

function FocusReturnDemo() {
  const [managed, setManaged] = useState(false);
  const [naive, setNaive] = useState(false);

  return (
    <DemoFrame
      note={
        <>
          Open each with the keyboard and close with <Kbd>Esc</Kbd>. The managed one hands focus
          back to its button; the hand-rolled one leaves it on nothing.
        </>
      }
    >
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setManaged(true)}>
            Open managed dialog
          </Button>
          <Button variant="outline" onClick={() => setNaive(true)}>
            Open hand-rolled dialog
          </Button>
        </div>
        <FocusWatcher />
      </div>
      <Modal open={managed} onClose={() => setManaged(false)} title="Managed dialog">
        <p className="mb-4 text-sm/relaxed text-muted-foreground">
          Focus is trapped in here. Close it any way you like and it goes back to the button that
          opened it.
        </p>
        <Button onClick={() => setManaged(false)}>Done</Button>
      </Modal>
      {naive && <NaiveDialog onClose={() => setNaive(false)} />}
    </DemoFrame>
  );
}

// ---------------------------------------------------------------------------
// Shortcuts people can find
// ---------------------------------------------------------------------------
// Shortcuts only help people who know they exist. Put the key next to the
// action it triggers, and keep a "?" sheet one key away. The handlers are
// scoped to this demo, so they never fire while you're typing elsewhere.

const ROWS = [
  "Rotate signing keys",
  "Backfill the ledger",
  "Drain the old queue",
  "Ship the audit export",
];

function ShortcutsDemo() {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [help, setHelp] = useState(false);

  const toggle = (i: number) =>
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

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
    <DemoFrame
      note={
        <>
          Click the list (or Tab to it), then press <Kbd>?</Kbd>. The keys work only while the list
          has focus.
        </>
      }
    >
      <div
        tabIndex={0}
        role="group"
        aria-label="Tasks. Press question mark for keyboard shortcuts."
        onKeyDown={onKeyDown}
        className="relative outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-3 text-sm text-muted-foreground">
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
                "flex cursor-pointer items-center gap-3 border-l-2 px-6 py-3 text-sm",
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
        {help && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4">
            <div className="w-full max-w-xs rounded-lg border border-border bg-card p-6 shadow-lg">
              <p className="mb-4 text-sm font-medium text-foreground">Keyboard shortcuts</p>
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
    </DemoFrame>
  );
}

export { RovingDemo, FocusReturnDemo, ShortcutsDemo };
