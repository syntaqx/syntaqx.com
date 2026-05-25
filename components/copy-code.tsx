"use client";

import { useEffect } from "react";

/**
 * Adds a "copy" button to every `<pre><code>` block on the page.
 *
 * The post markup is rendered server-side once and never mutates, so
 * injection runs exactly once on mount. Click handling is delegated
 * from `document` so we don't pay per-button listeners.
 *
 * Previous versions used a MutationObserver on `document.body` with
 * `subtree: true` to "watch for dynamic content". Nothing actually
 * mutates the post DOM, and the observer fired on every unrelated
 * DOM change (theme toggle, mobile menu, search modal, any React
 * re-render). Each fire re-ran `querySelectorAll("pre:has(> code)")`
 * across the whole document — the dominant contributor to INP on
 * /posts/[slug]. Removed.
 */
export function CopyCodeScript() {
  useEffect(() => {
    document.querySelectorAll("pre:has(> code)").forEach((pre) => {
      if (pre.querySelector("[data-copy-code]")) return;
      pre.classList.add("relative", "group");
      const btn = document.createElement("button");
      btn.setAttribute("data-copy-code", "");
      btn.setAttribute("aria-label", "Copy code");
      btn.className =
        "absolute top-2 right-2 rounded-md border border-border bg-surface/80 px-2 py-1 text-[10px] text-dim opacity-0 group-hover:opacity-100 hover:text-accent hover:border-accent/40 transition-all backdrop-blur-sm cursor-pointer";
      btn.innerHTML = "copy";
      pre.appendChild(btn);
    });

    function handleClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest(
        "[data-copy-code]",
      ) as HTMLButtonElement | null;
      if (!btn) return;
      const pre = btn.closest("pre");
      if (!pre) return;
      const code = pre.querySelector("code");
      if (!code) return;

      navigator.clipboard.writeText(code.textContent ?? "").then(() => {
        btn.textContent = "copied!";
        btn.setAttribute("data-copied", "true");
        setTimeout(() => {
          btn.textContent = "copy";
          btn.removeAttribute("data-copied");
        }, 2000);
      });
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <style>{`[data-copy-code][data-copied]::after { content: none; } [data-copy-code][data-copied] { color: var(--accent) !important; }`}</style>
  );
}
