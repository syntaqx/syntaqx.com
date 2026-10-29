"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Maximize, Minus, Plus, X } from "lucide-react";

/** lucide's maximize-2, for the button added to each figure. */
const EXPAND_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/></svg>';

/** Narrower than this, a diagram's labels are too small to read. */
const READABLE = 720;
const STEP = 1.25;

interface Open {
  svg: string;
  caption: string;
  label: string;
  /** The drawing's own width and height, from its viewBox. */
  w: number;
  h: number;
}

/**
 * Opens an article's diagrams (figure.diagram, inlined by rehypeDiagrams)
 * full screen: fit to the screen, zoom with the buttons, the keyboard, a
 * pinch or Ctrl and the wheel, and pan by scrolling or dragging. On a phone
 * it opens at a readable width rather than shrunk to fit.
 */
export function DiagramViewer() {
  const [open, setOpen] = useState<Open | null>(null);
  const [width, setWidth] = useState(0);
  const [fit, setFit] = useState(0);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  // The dialog mounts its content after opening, so sizing waits for this.
  const [body, setBody] = useState<HTMLDivElement | null>(null);
  const attachBody = useCallback((node: HTMLDivElement | null) => {
    bodyRef.current = node;
    setBody(node);
  }, []);
  // The point to hold still while zooming, as fractions of the drawing and
  // of the visible area.
  const anchor = useRef<{ fx: number; fy: number; vx: number; vy: number } | null>(null);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".prose figure.diagram").forEach((figure) => {
      if (figure.querySelector("[data-diagram-expand]")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-diagram-expand", "");
      button.setAttribute("aria-label", "Expand diagram");
      button.innerHTML = EXPAND_ICON;
      figure.prepend(button);
    });

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const figure = target.closest<HTMLElement>(".prose figure.diagram");
      if (!figure || target.closest("figcaption")) return;
      const svg = figure.querySelector<SVGSVGElement>(":scope > svg");
      if (!svg) return;
      const [, , w, h] = (svg.getAttribute("viewBox") ?? "0 0 800 600").split(/\s+/).map(Number);
      setOpen({
        svg: svg.outerHTML,
        caption: figure.querySelector("figcaption")?.innerHTML ?? "",
        label: svg.getAttribute("aria-label") ?? "Diagram",
        w,
        h,
      });
      setWidth(0);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Size the drawing once the dialog has laid out: the fit, and the opening
  // width (the fit, or a readable width on a narrow screen).
  useLayoutEffect(() => {
    if (!open || !body || width) return;
    const f = Math.min(body.clientWidth - 32, ((body.clientHeight - 32) * open.w) / open.h);
    setFit(f);
    setWidth(Math.max(f, Math.min(open.w, READABLE, f * 2.5)));
  }, [open, body, width]);

  // After a zoom, scroll so the anchored point stays where it was.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    const a = anchor.current;
    if (!body || !a) return;
    body.scrollLeft = a.fx * body.scrollWidth - a.vx * body.clientWidth;
    body.scrollTop = a.fy * body.scrollHeight - a.vy * body.clientHeight;
    anchor.current = null;
  }, [width]);

  const zoomTo = (next: number, at?: { x: number; y: number }) => {
    const body = bodyRef.current;
    if (!body || !open) return;
    const rect = body.getBoundingClientRect();
    const vx = at ? (at.x - rect.left) / rect.width : 0.5;
    const vy = at ? (at.y - rect.top) / rect.height : 0.5;
    anchor.current = {
      fx: (body.scrollLeft + vx * body.clientWidth) / body.scrollWidth,
      fy: (body.scrollTop + vy * body.clientHeight) / body.scrollHeight,
      vx,
      vy,
    };
    setWidth(Math.min(Math.max(next, fit / 2), open.w * 4));
  };

  // Ctrl and the wheel (a trackpad pinch arrives this way) zooms at the pointer.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      zoomTo(width * Math.exp(-e.deltaY / 200), { x: e.clientX, y: e.clientY });
    };
    body.addEventListener("wheel", onWheel, { passive: false });
    return () => body.removeEventListener("wheel", onWheel);
  });

  // Two fingers pinch; a mouse drags to pan. One finger scrolls natively.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; width: number } | null>(null);
  const spread = () => {
    const [a, b] = [...pointers.current.values()];
    return { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) pinch.current = { distance: spread().distance, width };
    if (e.pointerType === "mouse") e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const last = pointers.current.get(e.pointerId);
    if (!last) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const s = spread();
      zoomTo((pinch.current.width * s.distance) / pinch.current.distance, s);
    } else if (e.pointerType === "mouse") {
      e.currentTarget.scrollBy(last.x - e.clientX, last.y - e.clientY);
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "+" || e.key === "=") zoomTo(width * STEP);
    else if (e.key === "-") zoomTo(width / STEP);
    else if (e.key === "0") zoomTo(fit);
  };

  const control =
    "flex h-8 min-w-8 cursor-pointer items-center justify-center border border-border bg-surface px-2 text-dim transition-colors hover:text-foreground active:bg-background";

  return (
    <Dialog.Root open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
      <Dialog.Portal>
        <Dialog.Content
          onKeyDown={onKeyDown}
          // Focus the dialog, not its first button, so + - 0 work at once.
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).focus();
          }}
          className="fixed inset-0 z-100 flex flex-col bg-background outline-none"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
            <Dialog.Title className="inst min-w-0 flex-1 truncate text-dim">Diagram</Dialog.Title>
            <Dialog.Description className="sr-only">{open?.label}</Dialog.Description>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => zoomTo(width / STEP)} aria-label="Zoom out" className={control}>
                <Minus size={14} />
              </button>
              <span className="inst w-12 text-center text-dim tabular-nums" aria-live="polite">
                {fit ? Math.round((width / fit) * 100) : 100}%
              </span>
              <button type="button" onClick={() => zoomTo(width * STEP)} aria-label="Zoom in" className={control}>
                <Plus size={14} />
              </button>
              <button type="button" onClick={() => zoomTo(fit)} aria-label="Fit to screen" className={control}>
                <Maximize size={14} />
              </button>
              <Dialog.Close aria-label="Close" className={`${control} ml-2`}>
                <X size={14} />
              </Dialog.Close>
            </div>
          </div>
          <div
            ref={attachBody}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            // Auto margins center the drawing and fall back to 0 once it
            // overflows, so every edge stays in reach. One finger pans; the
            // pinch is handled above.
            className="flex min-h-0 flex-1 cursor-grab touch-pan-x touch-pan-y overflow-auto overscroll-contain select-none active:cursor-grabbing"
          >
            {open && width > 0 && (
              <div
                className="diagram diagram-viewer m-auto shrink-0 p-4"
                style={{ width: width + 32 }}
                dangerouslySetInnerHTML={{ __html: open.svg }}
              />
            )}
          </div>
          {open?.caption && (
            <p
              className="max-h-[30vh] overflow-y-auto border-t border-border px-4 py-3 text-sm leading-relaxed text-muted [&_strong]:font-semibold [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: open.caption }}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
