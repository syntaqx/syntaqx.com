"use client";

import { useEffect } from "react";

const KEY = "code-tab";

/**
 * Switches the tabbed code blocks that rehypeCodeTabs renders. Choosing a
 * language switches every block on the page that has it, and the choice is
 * remembered (best effort: storage can be blocked) for the next page. Click
 * and arrow-key handling is delegated from `document`, like CopyCodeScript.
 */
export function CodeTabsScript() {
  useEffect(() => {
    const select = (label: string) => {
      document.querySelectorAll<HTMLElement>("[data-code-tabs]").forEach((group) => {
        const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
        if (!tabs.some((t) => t.dataset.tab === label)) return;
        for (const t of tabs) {
          const on = t.dataset.tab === label;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
        }
        group.querySelectorAll<HTMLElement>('[role="tabpanel"]').forEach((p) => {
          p.hidden = p.dataset.tab !== label;
        });
      });
    };

    // Other blocks above may change height; keep the chosen tab where it was.
    const choose = (tab: HTMLButtonElement) => {
      const label = tab.dataset.tab;
      if (!label) return;
      const before = tab.getBoundingClientRect().top;
      select(label);
      window.scrollBy(0, tab.getBoundingClientRect().top - before);
      try {
        localStorage.setItem(KEY, label);
      } catch {}
    };

    try {
      const saved = localStorage.getItem(KEY);
      if (saved) select(saved);
    } catch {}

    const tabOf = (e: Event) =>
      (e.target as HTMLElement).closest<HTMLButtonElement>('[data-code-tabs] [role="tab"]');

    function handleClick(e: MouseEvent) {
      const tab = tabOf(e);
      if (tab) choose(tab);
    }

    function handleKey(e: KeyboardEvent) {
      const tab = tabOf(e);
      if (!tab) return;
      const tabs = Array.from(tab.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
      const i = tabs.indexOf(tab);
      const next =
        e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length]
        : e.key === "ArrowLeft" ? tabs[(i - 1 + tabs.length) % tabs.length]
        : e.key === "Home" ? tabs[0]
        : e.key === "End" ? tabs[tabs.length - 1]
        : undefined;
      if (!next) return;
      e.preventDefault();
      next.focus();
      choose(next);
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return null;
}
