"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/posts";
import { cn } from "@/lib/cn";

/**
 * The "On this page" rail beside a doc: its h2s, with the one being read
 * highlighted. `className` sets where it shows.
 */
export function DocsToc({ headings, className = "" }: { headings: Heading[]; className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    const update = () => {
      // At the bottom of the page the last headings can't scroll up to the
      // header, so the last section is current once there's nowhere to go.
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
      let current: string | null = null;
      if (atBottom && els.length) current = els[els.length - 1].id;
      else for (const el of els) if (el.getBoundingClientRect().top < 140) current = el.id;
      setActive(current);
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
    <nav aria-label="On this page" className={className}>
      <p className="inst mb-2.5 text-[0.55rem] leading-[1.6] text-dim">On this page</p>
      <ul className="border-l border-border">
        {headings.map((h) => {
          const on = h.id === active;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={on ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1.5 pl-3.5 text-[0.8rem] leading-snug transition-colors",
                  on ? "border-accent text-accent" : "border-transparent text-dim hover:text-foreground",
                )}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
