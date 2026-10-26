"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { UPCOMING_INDUSTRIES, isIndustry } from "@/lib/industries";
import { ArrowRight, ChevronRight, Search, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { IndustryCards, type IndustryCard } from "@/components/industry-cards";

export interface DocsIndexEntry {
  href: string;
  title: string;
  /** Short label for the section rail. */
  navTitle: string;
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
  /** Every doc, by section; industry chapters are searchable but not listed. */
  categories: DocsIndexCategory[];
  /** The industry volumes, listed as one section of cards. */
  industries: IndustryCard[];
  /** The intro paragraph under the title. */
  intro: ReactNode;
}

/** The Industries section's anchor on /docs. */
const INDUSTRIES_ANCHOR = "industries";

const matches = (q: string, doc: DocsIndexEntry, category: string) =>
  [doc.title, doc.description, category, ...doc.tags].some((s) => s.toLowerCase().includes(q));

export function DocsIndex({ categories, industries, intro }: DocsIndexProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const total = categories.reduce((n, c) => n + c.docs.length, 0);
  const q = query.trim().toLowerCase();

  // The first section is the featured "start here" strip; the rest are lists,
  // with the industry volumes as one Industries section before Reference.
  const listed = categories.filter((c) => !isIndustry(c.section));
  const [featured, ...sections] = listed;
  const anchors = [...listed.slice(0, -1).map((c) => c.section), INDUSTRIES_ANCHOR, listed[listed.length - 1].section];

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
    const last = anchors[anchors.length - 1];
    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    const observer = new IntersectionObserver(
      (entries) => {
        // The last sections can't scroll high enough to cross the line, so
        // the bottom of the page always means the last section.
        if (atBottom()) return setActive(last);
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    for (const id of anchors) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    const onScroll = () => {
      if (atBottom()) setActive(last);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    // anchors is derived from categories, which only change with the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, q]);

  return (
    <div>
      <PageHeader
        label="docs"
        title="Documentation"
        scene="shelf"
        sceneLabel="A spec sheet lifted off its index, with one teal row highlighted"
        hideSceneOnMobile
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
        <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-10">
          <SectionRail categories={listed} industries={industries} active={active ?? featured?.section} />

          <div className="min-w-0 space-y-16">
            {featured && <Featured category={featured} />}
            {sections.map((category) => (
              <Fragment key={category.section}>
              {category === listed[listed.length - 1] && (
                <section id={INDUSTRIES_ANCHOR} className="scroll-mt-24">
                  <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-3">
                    <h2 className="eyebrow">Industries</h2>
                    <span className="inst text-dim">{industries.length}</span>
                  </div>
                  <IndustryCards industries={industries} />
                </section>
              )}
              <section id={category.section} className="scroll-mt-24">
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
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionRail({
  categories,
  industries,
  active,
}: {
  /** The listed sections, Reference last. */
  categories: DocsIndexCategory[];
  industries: IndustryCard[];
  active?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const reference = categories[categories.length - 1];
  const sections = categories.slice(0, -1);

  // Once the reader scrolls the rail themselves, it stays where they put it
  // until they pick something from it.
  const heldRef = useRef(false);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const hold = () => (heldRef.current = true);
    const release = (e: MouseEvent) => {
      if ((e.target as Element).closest("a")) heldRef.current = false;
    };
    // pointerdown covers dragging the scrollbar.
    const events = ["wheel", "touchmove", "keydown", "pointerdown"] as const;
    events.forEach((e) => rail.addEventListener(e, hold, { passive: true }));
    rail.addEventListener("click", release);
    return () => {
      events.forEach((e) => rail.removeEventListener(e, hold));
      rail.removeEventListener("click", release);
    };
  }, []);

  // Otherwise keep the highlighted section in view as the page scrolls, by
  // scrolling the rail itself (never the page).
  useEffect(() => {
    const rail = railRef.current;
    const item = rail?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!rail || !item || heldRef.current) return;
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

  const chip = (href: string, name: string, count: number) => (
    <li key={href} className="shrink-0">
      <a
        href={href}
        className="inst inline-flex items-center gap-2 border border-border px-2.5 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <span className="whitespace-nowrap">{name}</span>
        <span className="text-dim">{count}</span>
      </a>
    </li>
  );

  const heading = (anchor: string, name: string, count: number) => (
    <a
      href={`#${anchor}`}
      aria-current={anchor === active ? "true" : undefined}
      className={`inst mb-2.5 flex items-baseline justify-between gap-3 text-[0.55rem] leading-[1.6] transition-colors ${
        anchor === active ? "text-accent" : "text-dim hover:text-foreground"
      }`}
    >
      <span>{name}</span>
      <span className="shrink-0">{count}</span>
    </a>
  );

  const group = (c: DocsIndexCategory) => (
    <div key={c.section} data-section={c.section}>
      {heading(c.section, c.name, c.docs.length)}
      <ul className={`border-l ${c.section === active ? "border-accent/50" : "border-border"}`}>
        {c.docs.map((doc) => (
          <li key={doc.href}>
            <Link
              href={doc.href}
              className="-ml-px block border-l border-transparent py-1.5 pl-3.5 text-[0.8rem] leading-snug text-dim transition-colors hover:border-border-hover hover:text-foreground"
            >
              {doc.navTitle}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <nav aria-label="Documentation sections" className="mb-10 lg:mb-0">
      {/* Mobile: the sections as one scrollable row. */}
      <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 scrollbar-none lg:hidden">
        {sections.map((c) => chip(`#${c.section}`, c.name, c.docs.length))}
        {chip(`#${INDUSTRIES_ANCHOR}`, "Industries", industries.length)}
        {chip(`#${reference.section}`, reference.name, reference.docs.length)}
      </ul>

      {/* Desktop: the same shape as the doc pages' sidebar, every section with
          its docs, and the industry volumes as one group of covers. Scrolls
          within the rail when it's taller than the screen. */}
      <div
        ref={railRef}
        className="rail-scroll sticky top-24 hidden max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-3 lg:block"
      >
        <div className="space-y-7">
          {sections.map(group)}
          <div data-section={INDUSTRIES_ANCHOR}>
            {heading(INDUSTRIES_ANCHOR, "Industries", industries.length)}
            <ul className={`border-l ${active === INDUSTRIES_ANCHOR ? "border-accent/50" : "border-border"}`}>
              {industries.map((industry) => (
                <li key={industry.href}>
                  <Link
                    href={industry.href}
                    className="group -ml-px flex items-center gap-2 border-l border-transparent py-1.5 pl-3.5 text-[0.8rem] leading-snug text-dim transition-colors hover:border-border-hover hover:text-foreground"
                  >
                    {industry.name}
                    <ChevronRight size={13} aria-hidden className="ml-auto text-dim transition-colors group-hover:text-accent" />
                  </Link>
                </li>
              ))}
              {UPCOMING_INDUSTRIES.map((name) => (
                <li
                  key={name}
                  className="-ml-px flex items-center gap-2 border-l border-transparent py-1.5 pl-3.5 text-[0.8rem] leading-snug text-dim/70"
                >
                  {name}
                  <span className="inst ml-auto border border-border px-1.5 py-px text-[0.45rem] text-dim">Soon</span>
                </li>
              ))}
            </ul>
          </div>
          {group(reference)}
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
