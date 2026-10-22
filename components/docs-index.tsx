"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Card } from "@/components/card";

export interface DocsIndexEntry {
  href: string;
  title: string;
  description: string;
  tags: string[];
}

export interface DocsIndexCategory {
  name: string;
  /** The section folder (/docs/<section>/...), used as the anchor. */
  section: string;
  docs: DocsIndexEntry[];
}

export function DocsIndex({ categories }: { categories: DocsIndexCategory[] }) {
  const [filter, setFilter] = useState("");
  const total = categories.reduce((n, c) => n + c.docs.length, 0);
  // Unfiltered sizes, so a section that's narrowed to one match doesn't stretch.
  const sizes = new Map(categories.map((c) => [c.name, c.docs.length]));

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((c) => ({
        ...c,
        docs: c.docs.filter((d) =>
          [d.title, d.description, c.name, ...d.tags].some((s) => s.toLowerCase().includes(q)),
        ),
      }))
      .filter((c) => c.docs.length > 0);
  }, [categories, filter]);

  const shown = visible.reduce((n, c) => n + c.docs.length, 0);

  return (
    <div>
      <div className="mb-12 space-y-4 border-y border-border py-5">
        <label className="flex items-center gap-3 border border-border bg-background px-3 py-2 focus-within:border-accent/50">
          <Search size={14} className="shrink-0 text-dim" aria-hidden />
          <span className="sr-only">Filter documentation</span>
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`Filter ${total} docs by title, topic or tag`}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-dim/60 focus:outline-none"
          />
          {filter && (
            <span className="inst shrink-0 text-dim">
              {shown} / {total}
            </span>
          )}
        </label>
        <nav aria-label="Documentation sections" className="flex flex-wrap gap-2">
          {visible.map((c) => (
            <a
              key={c.name}
              href={`#${c.section}`}
              className="inst inline-flex items-center gap-2 border border-border px-2.5 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <span>{c.name}</span>
              <span className="text-dim">{c.docs.length}</span>
            </a>
          ))}
        </nav>
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-dim">
          Nothing matches &ldquo;{filter}&rdquo;.{" "}
          <button
            type="button"
            onClick={() => setFilter("")}
            className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent"
          >
            Clear the filter
          </button>
        </p>
      )}

      <div className="space-y-14">
        {visible.map((category) => (
          <section key={category.name} id={category.section} className="scroll-mt-24">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="eyebrow">{category.name}</h2>
              <span className="inst text-dim">
                {category.docs.length} {category.docs.length === 1 ? "doc" : "docs"}
              </span>
            </div>
            <ul className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.docs.map((doc) => (
                <li
                  key={doc.href}
                  className={sizes.get(category.name) === 1 ? "sm:col-span-2 lg:col-span-3" : undefined}
                >
                  <Link href={doc.href} className="group block h-full">
                    <Card hover className="flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg leading-tight text-foreground transition-colors group-hover:text-accent">
                          {doc.title}
                        </h3>
                        <ArrowRight
                          size={12}
                          className="mt-1.5 shrink-0 text-dim transition-colors group-hover:text-accent"
                          aria-hidden
                        />
                      </div>
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-dim">
                        {doc.description}
                      </p>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
