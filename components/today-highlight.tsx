"use client";

import { useEffect } from "react";

/**
 * Rings the cell matching the viewer's local date.
 *
 * Server-rendered padding/layout is anchored on the site owner's timezone
 * (see github-activity.tsx) so the grid is deterministic. The today ring,
 * by contrast, is intentionally viewer-relative: if it's already tomorrow
 * in Tokyo, we ring tomorrow's cell — even if it's still a future
 * sentinel in the server-rendered HTML.
 */
export function TodayHighlight() {
  useEffect(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const el = document.querySelector(`[data-date="${todayStr}"]`);
    if (el) {
      el.classList.add("ring-1", "ring-accent", "ring-inset");
    }
  }, []);

  return null;
}
