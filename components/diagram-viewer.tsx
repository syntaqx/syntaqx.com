"use client";

import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, RotateCcw, X } from "lucide-react";

const ENLARGE_ICON =
  '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>';

interface Open {
  svg: string;
  label: string;
}

/**
 * Opens a diagram full screen, to zoom and pan: from the "Enlarge" button it
 * adds to each figure (in the figure's top margin, so nothing moves) or a
 * click or tap on the drawing. Radix Dialog traps focus and closes on Escape;
 * focus goes back to the figure's button.
 */
export function DiagramViewer() {
  const [open, setOpen] = useState<Open | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".prose figure.diagram").forEach((figure) => {
      if (figure.querySelector("[data-enlarge]")) return;
      const label = figure.querySelector(":scope > svg")?.getAttribute("aria-label") ?? "";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.enlarge = "";
      btn.className = "diagram-enlarge inst";
      btn.setAttribute("aria-label", label ? `Enlarge diagram: ${label}` : "Enlarge diagram");
      btn.innerHTML = `${ENLARGE_ICON}<span aria-hidden="true">Enlarge</span>`;
      figure.prepend(btn);
    });

    const onClick = (e: MouseEvent) => {
      const hit = (e.target as Element).closest(".prose figure.diagram [data-enlarge], .prose figure.diagram > svg");
      const figure = hit?.closest("figure");
      const svg = figure?.querySelector(":scope > svg");
      if (!svg) return;
      trigger.current = figure?.querySelector<HTMLElement>("[data-enlarge]") ?? null;
      setOpen({ svg: svg.outerHTML, label: svg.getAttribute("aria-label") ?? "Diagram" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <Dialog.Root open={!!open} onOpenChange={(next) => !next && setOpen(null)}>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            trigger.current?.focus();
          }}
          className="diagram fixed inset-0 z-100 flex flex-col bg-background motion-safe:animate-in motion-safe:fade-in"
        >
          {open && <Viewer {...open} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const MAX = 8;
const button = "grid size-9 shrink-0 cursor-pointer place-items-center border border-border text-dim transition-colors hover:border-accent hover:text-accent";

function Viewer({ svg, label }: Open) {
  const stage = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const view = useRef({ s: 1, x: 0, y: 0 });

  // Scale and offset go straight to the style, not through React state, so a
  // pinch or drag doesn't re-render. The drawing never leaves the screen.
  const apply = () => {
    const el = stage.current;
    const v = view.current;
    if (!el || !layer.current) return;
    v.x = Math.min(0, Math.max(el.clientWidth * (1 - v.s), v.x));
    v.y = Math.min(0, Math.max(el.clientHeight * (1 - v.s), v.y));
    layer.current.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.s})`;
  };
  // Zoom about a point on the stage (the cursor, the pinch, or the middle).
  const zoom = (factor: number, cx?: number, cy?: number) => {
    const el = stage.current;
    if (!el) return;
    const v = view.current;
    const x = cx ?? el.clientWidth / 2;
    const y = cy ?? el.clientHeight / 2;
    const s = Math.min(MAX, Math.max(1, v.s * factor));
    v.x = x - ((x - v.x) * s) / v.s;
    v.y = y - ((y - v.y) * s) / v.s;
    v.s = s;
    apply();
  };
  const pan = (dx: number, dy: number) => {
    view.current.x += dx;
    view.current.y += dy;
    apply();
  };
  const reset = () => {
    view.current = { s: 1, x: 0, y: 0 };
    apply();
  };

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const pointers = new Map<number, { x: number; y: number }>();
    const local = (e: PointerEvent | WheelEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, local(e));
    };
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const next = local(e);
      if (pointers.size === 1) {
        pan(next.x - prev.x, next.y - prev.y);
      } else if (pointers.size === 2) {
        const [other] = [...pointers].filter(([id]) => id !== e.pointerId).map(([, p]) => p);
        const before = Math.hypot(prev.x - other.x, prev.y - other.y);
        const after = Math.hypot(next.x - other.x, next.y - other.y);
        pan((next.x - prev.x) / 2, (next.y - prev.y) / 2);
        if (before > 0) zoom(after / before, (next.x + other.x) / 2, (next.y + other.y) / 2);
      }
      pointers.set(e.pointerId, next);
    };
    const up = (e: PointerEvent) => pointers.delete(e.pointerId);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = local(e);
      zoom(Math.exp(-e.deltaY / 300), p.x, p.y);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
    // The handlers only touch refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const step = 60;
    const keys: Record<string, () => void> = {
      "+": () => zoom(1.25),
      "=": () => zoom(1.25),
      "-": () => zoom(0.8),
      "0": reset,
      ArrowLeft: () => pan(step, 0),
      ArrowRight: () => pan(-step, 0),
      ArrowUp: () => pan(0, step),
      ArrowDown: () => pan(0, -step),
    };
    const act = keys[e.key];
    if (!act) return;
    e.preventDefault();
    act();
  };

  return (
    <>
      <header className="flex items-center gap-2 border-b border-border px-4 py-2">
        <Dialog.Title className="inst min-w-0 flex-1 truncate text-dim">{label}</Dialog.Title>
        <button type="button" aria-label="Zoom out" className={button} onClick={() => zoom(0.8)}>
          <Minus size={16} aria-hidden />
        </button>
        <button type="button" aria-label="Zoom in" className={button} onClick={() => zoom(1.25)}>
          <Plus size={16} aria-hidden />
        </button>
        <button type="button" aria-label="Reset zoom" className={button} onClick={reset}>
          <RotateCcw size={16} aria-hidden />
        </button>
        <Dialog.Close aria-label="Close" className={button}>
          <X size={16} aria-hidden />
        </Dialog.Close>
      </header>
      <div
        ref={stage}
        tabIndex={0}
        role="group"
        aria-roledescription="zoomable drawing"
        aria-label="Drawing. Pinch, scroll or use plus and minus to zoom; drag or use the arrow keys to pan; 0 resets."
        onKeyDown={onKey}
        className="relative min-h-0 flex-1 cursor-grab touch-none overflow-hidden select-none focus-visible:-outline-offset-2 active:cursor-grabbing"
      >
        <div ref={layer} className="size-full origin-top-left [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
      <p className="inst border-t border-border px-4 py-2 text-dim">
        <span className="pointer-coarse:hidden">Scroll to zoom, drag to pan, Esc to close</span>
        <span className="hidden pointer-coarse:inline">Pinch to zoom, drag to pan</span>
      </p>
    </>
  );
}
