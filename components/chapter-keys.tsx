"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * ← and → turn the page: the previous and next chapter in reading order.
 * Ignored while typing, with a modifier held, when a scrollable element
 * (a wide code block or table) has focus and needs the arrows itself, or
 * inside a dialog (the diagram viewer pans with them).
 */
export function ChapterKeys({ prev, next }: { prev?: string; next?: string }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true'], pre, table, .table-scroll, [role='dialog']")) return;
      const href = e.key === "ArrowLeft" ? prev : e.key === "ArrowRight" ? next : undefined;
      if (!href) return;
      e.preventDefault();
      router.push(href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);

  return null;
}
