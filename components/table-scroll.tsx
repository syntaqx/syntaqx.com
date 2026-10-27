"use client";

import { useEffect } from "react";

/**
 * Marks each table's scroll box (rehypeTables) with how it sits: data-overflow
 * when it's wider than the screen, data-scrolled once moved off the start,
 * data-end at the end. globals.css draws the pinned column's rule and the
 * faded edge from them. A box that scrolls also becomes a focusable, labelled
 * region, so a keyboard can scroll it too.
 */
export function TableScroll() {
  useEffect(() => {
    const boxes = document.querySelectorAll<HTMLElement>(".prose .table-scroll");
    const update = (box: HTMLElement) => {
      const overflow = box.scrollWidth > box.clientWidth + 1;
      box.toggleAttribute("data-overflow", overflow);
      box.toggleAttribute("data-scrolled", box.scrollLeft > 1);
      box.toggleAttribute("data-end", box.scrollLeft + box.clientWidth >= box.scrollWidth - 1);
      if (overflow) {
        box.tabIndex = 0;
        box.setAttribute("role", "region");
        box.setAttribute("aria-label", "Table, scrolls sideways");
      } else {
        box.removeAttribute("tabindex");
        box.removeAttribute("role");
        box.removeAttribute("aria-label");
      }
    };
    const onScroll = (e: Event) => update(e.currentTarget as HTMLElement);
    const observer = new ResizeObserver((entries) => entries.forEach((e) => update(e.target as HTMLElement)));
    boxes.forEach((box) => {
      observer.observe(box);
      box.addEventListener("scroll", onScroll, { passive: true });
    });
    return () => {
      observer.disconnect();
      boxes.forEach((box) => box.removeEventListener("scroll", onScroll));
    };
  }, []);

  return null;
}
