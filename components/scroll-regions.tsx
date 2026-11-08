"use client";

import { useEffect } from "react";

/**
 * Wide tables and code blocks scroll sideways in their own box. When one
 * actually overflows, it becomes a labeled tab stop, so a keyboard can scroll
 * it (WCAG 2.1.1); when it fits, it stays out of the tab order. Chrome makes
 * scrollers focusable by itself; Safari doesn't. Rechecked on resize.
 */
export function ScrollRegionsScript() {
  useEffect(() => {
    const sync = () => {
      document.querySelectorAll<HTMLElement>(".prose .table-scroll, .prose pre").forEach((el) => {
        if (el.scrollWidth > el.clientWidth + 1) {
          el.tabIndex = 0;
          el.setAttribute("role", "region");
          el.setAttribute(
            "aria-label",
            el.tagName === "PRE" ? "Code, scrolls sideways" : "Table, scrolls sideways",
          );
        } else if (el.hasAttribute("role")) {
          el.removeAttribute("tabindex");
          el.removeAttribute("role");
          el.removeAttribute("aria-label");
        }
      });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);
  return null;
}
