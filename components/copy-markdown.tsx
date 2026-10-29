"use client";

import { useState } from "react";

/**
 * Copies the page's Markdown (its .md URL) to the clipboard. The fetch goes
 * inside the ClipboardItem so Safari still counts the click as the gesture.
 */
export function CopyMarkdown({ href, className }: { href: string; className?: string }) {
  const [label, setLabel] = useState("Copy as Markdown");

  const copy = () => {
    const text = fetch(href)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => new Blob([t], { type: "text/plain" }));
    navigator.clipboard
      .write([new ClipboardItem({ "text/plain": text })])
      .then(() => setLabel("Copied"), () => setLabel("Copy failed"))
      .finally(() => setTimeout(() => setLabel("Copy as Markdown"), 2000));
  };

  return (
    <button type="button" onClick={copy} className={className}>
      {label}
    </button>
  );
}
