"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/posts";

/**
 * Sticky contents rail that follows along: highlights the section you're
 * reading and shows how far through the post you are.
 */
export function PostToc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    const body = document.querySelector<HTMLElement>("[data-post-body]");

    const update = () => {
      // At the bottom of the page the last headings can never scroll up to
      // the header, so short closing sections would never activate. Once
      // there's nowhere left to scroll, the last section is current.
      const doc = document.documentElement;
      const atBottom =
        window.innerHeight + window.scrollY >= doc.scrollHeight - 4;

      // Otherwise it's the last heading that has passed the header.
      let current: string | null = null;
      if (atBottom && els.length) current = els[els.length - 1].id;
      else
        for (const el of els)
          if (el.getBoundingClientRect().top < 140) current = el.id;
      setActive(current);

      if (atBottom) setProgress(1);
      else if (body) {
        const r = body.getBoundingClientRect();
        const total = Math.max(1, r.height - window.innerHeight * 0.6);
        setProgress(Math.min(1, Math.max(0, -r.top / total)));
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [headings]);

  return (
    <nav
      aria-label="Contents"
      className="hidden self-start lg:sticky lg:top-24 lg:grid"
    >
      <p className="inst mb-3 flex justify-between text-foreground">
        contents
        <span className="text-dim tabular-nums">
          {Math.round(progress * 100)}%
        </span>
      </p>
      <div className="relative mb-2 h-px bg-border">
        <div
          className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      {headings.map((h, i) => {
        const on = h.id === active;
        return (
          <a
            key={h.id}
            href={`#${h.id}`}
            aria-current={on ? "location" : undefined}
            className={`relative grid grid-cols-[2rem_1fr] py-2 pl-2 text-[0.8rem] leading-snug transition-colors before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:bg-accent before:transition-transform before:duration-200 ${
              on
                ? "text-foreground before:scale-y-100"
                : "text-dim before:scale-y-0 hover:text-foreground"
            }`}
          >
            <span
              className={`font-voice text-base leading-none font-semibold ${on ? "text-accent" : "text-border-hover"}`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {h.text}
          </a>
        );
      })}
    </nav>
  );
}
