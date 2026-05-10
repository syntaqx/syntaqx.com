"use client";

import { useEffect } from "react";

export function TodayHighlight() {
  useEffect(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const el = document.querySelector(`[data-date="${todayStr}"]`);
    if (el) {
      el.classList.add("ring-1", "ring-accent");
    }
  }, []);

  return null;
}
