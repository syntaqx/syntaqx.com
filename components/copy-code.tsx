"use client";

import { useEffect } from "react";

export function CopyCodeScript() {
  useEffect(() => {
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

    function inject() {
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
    }

    inject();
    document.addEventListener("click", handleClick);

    // Watch for dynamic content
    const observer = new MutationObserver(inject);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("click", handleClick);
      observer.disconnect();
    };
  }, []);

  // Style for copied state
  return (
    <style>{`[data-copy-code][data-copied]::after { content: none; } [data-copy-code][data-copied] { color: var(--accent) !important; }`}</style>
  );
}
