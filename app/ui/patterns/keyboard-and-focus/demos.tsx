"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Bold, Code, Italic, Link2, Underline, X } from "lucide-react";
import { Modal } from "@/components/modal";

const btn =
  "inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim transition-colors hover:text-foreground hover:border-border-hover cursor-pointer";
const field =
  "w-full rounded border border-border bg-transparent px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-accent/60";

function Frame({ children, note }: { children: ReactNode; note: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      {children}
      <div className="border-t border-border px-4 py-2.5 text-[10px] text-dim">
        {note}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-4 items-center justify-center rounded-sm border border-border px-1 font-mono text-[10px] leading-4 text-dim">
      {children}
    </kbd>
  );
}

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
    <Frame
      note={
        <>
          Tab into the toolbar from the first field, use <Kbd>←</Kbd>{" "}
          <Kbd>→</Kbd> <Kbd>Home</Kbd> <Kbd>End</Kbd> inside it, and one more
          Tab takes you out. Shift+Tab back in returns to the last button you
          were on.
        </>
      }
    >
      <div className="space-y-3 p-4">
        <input aria-label="Title" placeholder="Title" className={field} />
        <div
          role="toolbar"
          aria-label="Formatting"
          onKeyDown={onKeyDown}
          className="inline-flex rounded border border-border"
        >
          {TOOLS.map(({ label, icon: Icon }, i) => {
            const on = pressed.includes(label);
            return (
              <button
                key={label}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                tabIndex={i === active ? 0 : -1}
                aria-label={label}
                aria-pressed={on}
                onFocus={() => setActive(i)}
                onClick={() =>
                  setPressed((p) => (on ? p.filter((x) => x !== label) : [...p, label]))
                }
                className={`flex size-8 items-center justify-center border-r border-border last:border-r-0 outline-none transition-colors focus-visible:bg-accent/10 focus-visible:text-accent cursor-pointer ${
                  on ? "text-accent" : "text-dim hover:text-foreground"
                }`}
              >
                <Icon size={13} />
              </button>
            );
          })}
        </div>
        <textarea aria-label="Body" placeholder="Body" rows={2} className={field} />
      </div>
    </Frame>
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
    <p className="text-[11px] text-dim" aria-hidden>
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
      <div className="w-full max-w-sm border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-foreground">Hand-rolled dialog</p>
          <button type="button" autoFocus aria-label="Close" onClick={onClose} className={btn}>
            <X size={12} />
          </button>
        </div>
        <p className="text-xs leading-relaxed text-dim">
          Focus came in because the close button autofocuses. Tab can still
          walk out behind this overlay, and closing it drops focus on the page.
        </p>
      </div>
    </div>
  );
}

function FocusReturnDemo() {
  const [managed, setManaged] = useState(false);
  const [naive, setNaive] = useState(false);

  return (
    <Frame
      note={
        <>
          Open each with the keyboard and close with <Kbd>Esc</Kbd>. The
          managed one hands focus back to its button; the hand-rolled one
          leaves it on nothing.
        </>
      }
    >
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={() => setManaged(true)}>
            Open managed dialog
          </button>
          <button type="button" className={btn} onClick={() => setNaive(true)}>
            Open hand-rolled dialog
          </button>
        </div>
        <FocusWatcher />
      </div>
      <Modal open={managed} onClose={() => setManaged(false)} title="Managed dialog">
        <p className="mb-4 text-xs leading-relaxed text-dim">
          Focus is trapped in here. Close it any way you like and it goes back
          to the button that opened it.
        </p>
        <button type="button" className={btn} onClick={() => setManaged(false)}>
          Done
        </button>
      </Modal>
      {naive && <NaiveDialog onClose={() => setNaive(false)} />}
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Shortcuts people can find
// ---------------------------------------------------------------------------
// Shortcuts only help people who know they exist. Put the key next to the
// action it triggers, and keep a "?" sheet one key away. The handlers are
// scoped to this demo, so they never fire while you're typing elsewhere.

const ROWS = ["Rotate signing keys", "Backfill the ledger", "Drain the old queue", "Ship the audit export"];

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
    <Frame
      note={
        <>
          Click the list (or Tab to it), then press <Kbd>?</Kbd>. The keys
          work only while the list has focus.
        </>
      }
    >
      <div
        tabIndex={0}
        role="group"
        aria-label="Tasks. Press question mark for keyboard shortcuts."
        onKeyDown={onKeyDown}
        className="relative outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 text-[11px] text-dim">
          <span>{selected.length} selected</span>
          <button type="button" tabIndex={-1} className={btn} onClick={() => toggle(cursor)}>
            Select <Kbd>X</Kbd>
          </button>
        </div>
        <ul>
          {ROWS.map((row, i) => (
            <li
              key={row}
              onClick={() => setCursor(i)}
              className={`flex items-center gap-3 border-l-2 px-4 py-2 text-xs cursor-pointer ${
                i === cursor ? "border-accent bg-accent/5 text-foreground" : "border-transparent text-dim"
              }`}
            >
              <span
                className={`size-3 shrink-0 rounded-sm border ${
                  selected.includes(i) ? "border-accent bg-accent" : "border-border"
                }`}
              />
              {row}
            </li>
          ))}
        </ul>
        {help && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4">
            <div className="w-full max-w-xs border border-border bg-surface p-4">
              <p className="mb-3 text-xs text-foreground">Keyboard shortcuts</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[11px] text-dim">
                <dt><Kbd>J</Kbd> <Kbd>K</Kbd></dt>
                <dd>Next, previous</dd>
                <dt><Kbd>X</Kbd></dt>
                <dd>Select</dd>
                <dt><Kbd>?</Kbd></dt>
                <dd>Show or hide this sheet</dd>
                <dt><Kbd>Esc</Kbd></dt>
                <dd>Close</dd>
              </dl>
            </div>
          </div>
        )}
      </div>
    </Frame>
  );
}

export { RovingDemo, FocusReturnDemo, ShortcutsDemo };
