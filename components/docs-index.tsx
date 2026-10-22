"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";

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

interface DocsIndexProps {
  categories: DocsIndexCategory[];
  /** The intro paragraph under the title. */
  intro: ReactNode;
}

const matches = (q: string, doc: DocsIndexEntry, category: string) =>
  [doc.title, doc.description, category, ...doc.tags].some((s) => s.toLowerCase().includes(q));

export function DocsIndex({ categories, intro }: DocsIndexProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const total = categories.reduce((n, c) => n + c.docs.length, 0);
  const q = query.trim().toLowerCase();

  // The first section is the featured "start here" strip; the rest are lists.
  const [featured, ...sections] = categories;

  const results = useMemo(
    () =>
      q
        ? categories.flatMap((c) =>
            c.docs.filter((d) => matches(q, d, c.name)).map((d) => ({ ...d, category: c.name })),
          )
        : [],
    [categories, q],
  );

  // "/" focuses search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Highlight the section being read in the rail.
  useEffect(() => {
    if (q) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    for (const c of categories) {
      const el = document.getElementById(c.section);
      if (el) observer.observe(el);
    }
    // The last sections can't scroll high enough to cross the line above, so
    // reaching the bottom of the page makes the last one current.
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActive(categories[categories.length - 1]?.section);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [categories, q]);

  return (
    <div>
      <PageHeader
        label="docs"
        title="Documentation"
        scene="spec"
        sceneLabel="A spec sheet lifted off its index, with one teal row highlighted"
      >
        {intro}
        <label className="mt-7 flex items-center gap-3 border border-border bg-background/80 px-3.5 py-3 backdrop-blur-sm transition-colors focus-within:border-accent/60">
          <Search size={15} className="shrink-0 text-dim" aria-hidden />
          <span className="sr-only">Search the documentation</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder={`Search ${total} docs by title, topic or tag`}
            className="w-full bg-transparent text-[0.95rem] text-foreground placeholder:text-dim/70 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-dim transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          ) : (
            <kbd className="inst shrink-0 border border-border px-1.5 py-0.5 text-dim">/</kbd>
          )}
        </label>
      </PageHeader>

      {q ? (
        <SearchResults query={query} results={results} onClear={() => setQuery("")} />
      ) : (
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <SectionRail categories={categories} active={active ?? featured?.section} />

          <div className="min-w-0 space-y-16">
            {featured && <Featured category={featured} />}
            {sections.map((category) => (
              <section key={category.section} id={category.section} className="scroll-mt-24">
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                  <h2 className="eyebrow">{category.name}</h2>
                  <span className="inst text-dim">{category.docs.length}</span>
                </div>
                <ul className="grid sm:grid-cols-2 sm:gap-x-10">
                  {category.docs.map((doc) => (
                    <DocRow key={doc.href} doc={doc} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionRail({
  categories,
  active,
}: {
  categories: DocsIndexCategory[];
  active?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  // Keep the highlighted section in view as the page scrolls, by scrolling
  // the rail itself (never the page).
  useEffect(() => {
    const rail = railRef.current;
    const item = rail?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!rail || !item) return;
    // Measure against what's on screen: near the end of the page the sticky
    // rail is pushed up, and part of it is off-screen.
    const box = rail.getBoundingClientRect();
    const visibleTop = Math.max(box.top, 0);
    const visibleBottom = Math.min(box.bottom, window.innerHeight);
    const heading = item.getBoundingClientRect().top;
    const comfortable = visibleTop + (visibleBottom - visibleTop) * 0.6;
    if (heading < visibleTop || heading > comfortable) {
      rail.scrollBy({ top: heading - visibleTop - 16, behavior: "smooth" });
    }
  }, [active]);

  return (
    <nav aria-label="Documentation sections" className="mb-10 lg:mb-0">
      {/* Mobile: the sections as one scrollable row. */}
      <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 scrollbar-none lg:hidden">
        {categories.map((c) => (
          <li key={c.section} className="shrink-0">
            <a
              href={`#${c.section}`}
              className="inst inline-flex items-center gap-2 border border-border px-2.5 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <span className="whitespace-nowrap">{c.name}</span>
              <span className="text-dim">{c.docs.length}</span>
            </a>
          </li>
        ))}
      </ul>

      {/* Desktop: the same shape as the doc pages' sidebar, every section with
          its docs, scrolling within the rail when it's taller than the screen. */}
      <div
        ref={railRef}
        className="sticky top-24 hidden max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-2 scrollbar-none lg:block"
      >
        <div className="space-y-7">
          {categories.map((c) => {
            const isActive = c.section === active;
            return (
              <div key={c.section} data-section={c.section}>
                <a
                  href={`#${c.section}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`inst mb-2.5 flex items-baseline justify-between gap-3 text-[0.55rem] transition-colors ${
                    isActive ? "text-accent" : "text-dim hover:text-foreground"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="shrink-0">{c.docs.length}</span>
                </a>
                <ul className={`border-l ${isActive ? "border-accent/50" : "border-border"}`}>
                  {c.docs.map((doc) => (
                    <li key={doc.href}>
                      <Link
                        href={doc.href}
                        className="-ml-px block border-l border-transparent py-1.5 pl-3.5 text-[0.8rem] leading-snug text-dim transition-colors hover:border-border-hover hover:text-foreground"
                      >
                        {doc.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function Featured({ category }: { category: DocsIndexCategory }) {
  return (
    <section id={category.section} aria-label={category.name} className="scroll-mt-24">
      <p className="eyebrow mb-4">{category.name}</p>
      <ul className="grid gap-3">
        {category.docs.map((doc) => (
          <li key={doc.href}>
            <Link
              href={doc.href}
              className="group flex items-center justify-between gap-6 border border-border bg-surface p-5 transition-colors hover:border-accent/60"
            >
              <div>
                <h3 className="text-2xl leading-tight text-foreground transition-colors group-hover:text-accent">
                  {doc.title}
                </h3>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-dim">
                  {doc.description}
                </p>
              </div>
              <ArrowRight
                size={18}
                className="shrink-0 text-dim transition-all group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DocRow({ doc, category }: { doc: DocsIndexEntry; category?: string }) {
  return (
    <li className="border-b border-border">
      <Link href={doc.href} className="group block py-4">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-lg leading-tight text-foreground transition-colors group-hover:text-accent">
            {doc.title}
          </span>
          {category && <span className="inst shrink-0 text-dim">{category}</span>}
        </span>
        <span className="mt-1 line-clamp-2 block text-[0.8rem] leading-relaxed text-dim">
          {doc.description}
        </span>
      </Link>
    </li>
  );
}

function SearchResults({
  query,
  results,
  onClear,
}: {
  query: string;
  results: (DocsIndexEntry & { category: string })[];
  onClear: () => void;
}) {
  if (results.length === 0) {
    return (
      <p className="text-sm text-dim" aria-live="polite">
        Nothing matches &ldquo;{query}&rdquo;.{" "}
        <button
          type="button"
          onClick={onClear}
          className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent"
        >
          Show everything
        </button>
      </p>
    );
  }
  return (
    <section aria-live="polite">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 className="eyebrow">Results</h2>
        <span className="inst text-dim">{results.length}</span>
      </div>
      <ul className="grid sm:grid-cols-2 sm:gap-x-10">
        {results.map((doc) => (
          <DocRow key={doc.href} doc={doc} category={doc.category} />
        ))}
      </ul>
    </section>
  );
}
