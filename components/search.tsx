"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, BookOpen, CornerDownLeft, FileText, Hash, History, Loader2, Search, X } from "lucide-react";
import { BOOKS, getBook } from "@/lib/books";

type Scope = "all" | "docs" | "books" | "posts";
const SCOPES: { value: Scope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "docs", label: "Docs" },
  { value: "books", label: "Books" },
  { value: "posts", label: "Posts" },
];

/** How many pages to load per search, and headings to show under each. */
const PAGES = 20;
const HEADINGS = 3;
const RECENT_KEY = "search:recent";

interface PagefindSubResult {
  title: string;
  url: string;
  excerpt: string;
  locations?: number[];
}

interface PagefindResultData {
  url: string;
  meta?: { title?: string; section?: string };
  excerpt: string;
  sub_results?: PagefindSubResult[];
}

interface PagefindApi {
  init: () => Promise<void>;
  debouncedSearch: (term: string) => Promise<{ results: { data: () => Promise<PagefindResultData> }[] } | null>;
}

interface Hit {
  url: string;
  title: string;
  /** "Docs · API Design", "Books · Payments", "Posts". */
  section: string;
  scope: Scope;
  excerpt: string;
  headings: { url: string; title: string; excerpt: string }[];
}

/** A row the arrow keys move through: a page, one of its headings, or a shortcut. */
interface Row {
  url: string;
  key: string;
}

const clean = (url: string) => url.replace(/\.html(?=$|#)/, "");

function scopeOf(url: string): Scope {
  const section = new URL(url, "https://x").pathname.split("/")[1];
  return section === "docs" || section === "books" || section === "posts" ? section : "all";
}

/** Where a result lives when the page doesn't say: from its URL. */
function sectionFromUrl(url: string): string {
  const [section, book] = new URL(url, "https://x").pathname.split("/").filter(Boolean);
  if (!section) return "Home";
  if (section === "books" && book) return `Books · ${getBook(book)?.name ?? book}`;
  return section[0].toUpperCase() + section.slice(1);
}

function toHit(d: PagefindResultData): Hit {
  const url = clean(d.url);
  const headings = (d.sub_results ?? [])
    .filter((s) => s.url.includes("#"))
    .sort((a, b) => (b.locations?.length ?? 0) - (a.locations?.length ?? 0))
    .slice(0, HEADINGS)
    .map((s) => ({ url: clean(s.url), title: s.title, excerpt: s.excerpt }));
  return {
    url,
    title: d.meta?.title?.replace(/ - syntaqx$/, "") || url,
    section: d.meta?.section || sectionFromUrl(url),
    scope: scopeOf(url),
    excerpt: d.excerpt,
    headings,
  };
}

const JUMP_TO = [
  { url: "/docs", title: "Docs", hint: "The playbook, by section" },
  { url: "/docs/playbook", title: "The Playbook", hint: "Start here" },
  { url: "/docs/api", title: "API Reference", hint: "The public syntaqx API" },
  ...BOOKS.map((b) => ({ url: `/books/${b.slug}`, title: b.name, hint: "Book" })),
  { url: "/posts", title: "Posts", hint: "Writing" },
];

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(term: string) {
  const t = term.trim();
  if (!t) return;
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([t, ...readRecent().filter((r) => r !== t)].slice(0, 5)));
  } catch {
    // Private mode or blocked storage: recent searches just don't persist.
  }
}

const noop = () => () => {};

/**
 * The search shortcut as this device would press it: ⌘K on Apple devices,
 * Ctrl K elsewhere, nothing on touch-only devices (no keyboard to press).
 * null on the server, so the button's title only names it after hydration.
 */
function shortcutHint(): string | null {
  if (!matchMedia("(any-pointer: fine)").matches) return null;
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform) ? "⌘K" : "Ctrl K";
}

/** True when a keypress is going into a text field, where "/" is text. */
function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const shortcut = useSyncExternalStore(noop, shortcutHint, () => null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isTyping(e.target)
      ) {
        e.preventDefault();
        setOpen(true);
      }
    }
    // Escape is handled by Radix Dialog while open.
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* The "/" hint is CSS-gated (md+, with a fine pointer) so the
          button's width never changes on hydration. */}
      <Dialog.Trigger
        aria-label="Search"
        aria-keyshortcuts="/ Control+K Meta+K"
        title={shortcut ? `Search (/ or ${shortcut})` : "Search"}
        className="flex w-12 cursor-pointer items-center justify-center gap-2.5 border-l border-border text-dim transition-colors hover:text-foreground focus-visible:-outline-offset-2 md:any-pointer-fine:w-auto md:any-pointer-fine:px-4"
      >
        <Search size={14} className="shrink-0" />
        <kbd className="hidden min-w-4.5 justify-center border border-border px-1 font-mono text-[0.65rem] leading-4 md:any-pointer-fine:inline-flex">
          /
        </kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-100 bg-background/75 backdrop-blur-sm animate-in fade-in duration-150" />
        <div className="pointer-events-none fixed inset-0 z-100 flex items-start justify-center sm:px-4 sm:pt-[12vh]">
          <Dialog.Content
            aria-describedby={undefined}
            className="pointer-events-auto relative flex h-full w-full flex-col overflow-hidden bg-background shadow-2xl shadow-black/40 outline-none animate-in fade-in slide-in-from-top-2 duration-150 sm:h-auto sm:max-h-[76vh] sm:max-w-2xl sm:border sm:border-border"
          >
            <Dialog.Title className="sr-only">Search</Dialog.Title>
            <SearchPalette onClose={() => setOpen(false)} />
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [hits, setHits] = useState<Hit[]>([]);
  const [searched, setSearched] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagefind, setPagefind] = useState<PagefindApi | null>(null);
  const [error, setError] = useState(false);
  const [recent, setRecent] = useState<string[]>(readRecent);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const mod = useSyncExternalStore(noop, shortcutHint, () => null)?.startsWith("⌘") ? "⌘" : "Ctrl";

  useEffect(() => {
    import(
      // @ts-expect-error pagefind is generated at build time
      /* webpackIgnore: true */ "/pagefind/pagefind.js"
    )
      .then(async (pf: PagefindApi) => {
        await pf.init();
        setPagefind(pf);
      })
      .catch(() => setError(true));
    inputRef.current?.focus();
  }, []);

  const term = query.trim();

  // Search as the query changes; a newer query supersedes an older one.
  useEffect(() => {
    if (!pagefind || !term) return;
    let current = true;
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await pagefind.debouncedSearch(term);
        if (!response || !current) return;
        const data = await Promise.all(response.results.slice(0, PAGES).map((r) => r.data()));
        if (!current) return;
        setHits(data.map(toHit));
        setSearched(term);
        setSelected(0);
      } catch {
        if (current) setHits([]);
      } finally {
        if (current) setLoading(false);
      }
    });
    return () => {
      current = false;
      clearTimeout(id);
    };
  }, [pagefind, term]);

  const counts = useMemo(() => {
    const c: Record<Scope, number> = { all: hits.length, docs: 0, books: 0, posts: 0 };
    for (const h of hits) if (h.scope !== "all") c[h.scope]++;
    return c;
  }, [hits]);
  const shown = useMemo(
    () => (term && searched ? hits.filter((h) => scope === "all" || h.scope === scope) : []),
    [term, searched, hits, scope],
  );

  // Results grouped by section, in rank order of each section's best page.
  const groups = useMemo(() => {
    const map = new Map<string, Hit[]>();
    for (const h of shown) map.set(h.section, [...(map.get(h.section) ?? []), h]);
    return [...map.entries()];
  }, [shown]);

  // What the arrow keys walk: recent searches and shortcuts with no query,
  // otherwise each page then its headings.
  const rows: Row[] = term
    ? groups.flatMap(([, list]) =>
        list.flatMap((h) => [{ url: h.url, key: h.url }, ...h.headings.map((s) => ({ url: s.url, key: s.url }))]),
      )
    : [
        ...recent.map((r) => ({ url: `?q=${r}`, key: `recent:${r}` })),
        ...JUMP_TO.map((j) => ({ url: j.url, key: `jump:${j.url}` })),
      ];
  const index = (key: string) => rows.findIndex((r) => r.key === key);
  const active = rows[Math.min(selected, rows.length - 1)]?.key;

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(url: string, newTab = false) {
    if (term) {
      saveRecent(term);
      setRecent(readRecent());
    }
    if (newTab) {
      window.open(url, "_blank", "noopener");
      return;
    }
    onClose();
    router.push(url);
  }

  function choose(row: Row | undefined, newTab = false) {
    if (!row) return;
    if (row.key.startsWith("recent:")) {
      setQuery(row.key.slice("recent:".length));
      setSelected(0);
      return;
    }
    go(row.url, newTab);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(rows[Math.min(selected, rows.length - 1)], e.metaKey || e.ctrlKey);
    } else if (e.key === "Tab" && term && hits.length) {
      // Tab cycles the scopes while there are results.
      e.preventDefault();
      const i = SCOPES.findIndex((s) => s.value === scope);
      setScope(SCOPES[(i + (e.shiftKey ? SCOPES.length - 1 : 1)) % SCOPES.length].value);
      setSelected(0);
    }
  }

  const rowProps = (key: string, url: string) => ({
    "data-active": active === key,
    id: `search-option-${index(key)}`,
    role: "option" as const,
    "aria-selected": active === key,
    onMouseMove: () => active !== key && setSelected(index(key)),
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      choose({ key, url }, e.metaKey || e.ctrlKey);
    },
  });

  const rowClass = (key: string) =>
    `relative flex cursor-pointer gap-3 px-4 py-2.5 transition-colors ${
      active === key ? "bg-surface text-foreground before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-accent" : "text-muted"
    }`;

  const excerptClass =
    "line-clamp-2 text-xs leading-relaxed text-dim [&_mark]:bg-transparent [&_mark]:font-medium [&_mark]:text-accent";

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border px-4 sm:px-5">
        {loading ? (
          <Loader2 size={17} className="shrink-0 animate-spin text-accent" />
        ) : (
          <Search size={17} className={`shrink-0 ${term ? "text-accent" : "text-dim"}`} />
        )}
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={rows.length > 0}
          aria-controls="search-listbox"
          aria-activedescendant={active ? `search-option-${index(active)}` : undefined}
          aria-autocomplete="list"
          aria-label="Search docs, books and posts"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={error ? "Search is unavailable right now" : "Search docs, books and posts"}
          disabled={error}
          className="search-input h-14 min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-dim sm:h-16 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="cursor-pointer p-1 text-dim transition-colors hover:text-foreground"
          >
            <X size={15} />
          </button>
        )}
        <Dialog.Close
          aria-label="Close search"
          className="inst cursor-pointer border border-border px-1.5 py-1 text-dim transition-colors hover:text-foreground"
        >
          <span className="hidden sm:inline">Esc</span>
          <X size={14} className="sm:hidden" />
        </Dialog.Close>
      </div>

      {term && searched && hits.length > 0 && (
        <div role="tablist" aria-label="Filter results" className="flex gap-1 overflow-x-auto border-b border-border px-3 sm:px-4">
          {SCOPES.filter((s) => s.value === "all" || counts[s.value] > 0).map((s) => (
            <button
              key={s.value}
              type="button"
              role="tab"
              aria-selected={scope === s.value}
              onClick={() => {
                setScope(s.value);
                setSelected(0);
                inputRef.current?.focus();
              }}
              className={`inst -mb-px flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-2 py-2.5 transition-colors ${
                scope === s.value ? "border-accent text-foreground" : "border-transparent text-dim hover:text-foreground"
              }`}
            >
              {s.label}
              <span className="tabular-nums text-dim">{counts[s.value]}</span>
            </button>
          ))}
        </div>
      )}

      <div ref={listRef} id="search-listbox" role="listbox" aria-label="Search results" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {!term && !error && (
          <>
            {recent.length > 0 && (
              <section className="py-2">
                <h3 className="inst px-4 pb-1.5 pt-2 text-dim">Recent</h3>
                {recent.map((r) => (
                  <div key={r} {...rowProps(`recent:${r}`, `?q=${r}`)} className={rowClass(`recent:${r}`)}>
                    <History size={14} className="mt-0.5 shrink-0 text-dim" />
                    <span className="flex-1 truncate text-sm">{r}</span>
                  </div>
                ))}
              </section>
            )}
            <section className="py-2">
              <h3 className="inst px-4 pb-1.5 pt-2 text-dim">Jump to</h3>
              {JUMP_TO.map((j) => (
                <a key={j.url} href={j.url} {...rowProps(`jump:${j.url}`, j.url)} className={rowClass(`jump:${j.url}`)}>
                  {j.url.startsWith("/books/") ? (
                    <BookOpen size={14} className="mt-0.5 shrink-0 text-dim" />
                  ) : (
                    <ArrowRight size={14} className="mt-0.5 shrink-0 text-dim" />
                  )}
                  <span className="flex-1 truncate text-sm">{j.title}</span>
                  <span className="text-xs text-dim">{j.hint}</span>
                </a>
              ))}
            </section>
          </>
        )}

        {groups.map(([section, list]) => (
          <section key={section} className="border-b border-border py-2 last:border-b-0">
            <h3 className="inst px-4 pb-1.5 pt-2 text-dim">{section}</h3>
            {list.map((h) => (
              <div key={h.url}>
                <a href={h.url} {...rowProps(h.url, h.url)} className={rowClass(h.url)}>
                  <FileText size={14} className="mt-0.5 shrink-0 text-dim" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{h.title}</span>
                    <span className={excerptClass} dangerouslySetInnerHTML={{ __html: h.excerpt }} />
                  </span>
                  {active === h.url && <CornerDownLeft size={13} className="mt-1 shrink-0 text-dim" />}
                </a>
                {h.headings.map((s) => (
                  <a key={s.url} href={s.url} {...rowProps(s.url, s.url)} className={`${rowClass(s.url)} pl-10`}>
                    <Hash size={12} className="mt-1 shrink-0 text-dim" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8rem]">{s.title}</span>
                      <span className={`${excerptClass} line-clamp-1!`} dangerouslySetInnerHTML={{ __html: s.excerpt }} />
                    </span>
                    {active === s.url && <CornerDownLeft size={13} className="mt-1 shrink-0 text-dim" />}
                  </a>
                ))}
              </div>
            ))}
          </section>
        ))}

        {term && searched === term && !loading && shown.length === 0 && !error && (
          <div className="px-6 py-14 text-center">
            <p className="text-sm text-foreground">
              No results for &ldquo;{term}&rdquo;{scope !== "all" && ` in ${SCOPES.find((s) => s.value === scope)?.label}`}
            </p>
            <p className="mt-2 text-xs text-dim">
              {scope !== "all" ? (
                <button type="button" onClick={() => setScope("all")} className="cursor-pointer text-accent hover:underline">
                  Search everything
                </button>
              ) : (
                "Try fewer or different words."
              )}
            </p>
          </div>
        )}

        {error && (
          <div className="px-6 py-14 text-center text-sm text-dim">
            The search index didn&apos;t load. Try again in a moment.
          </div>
        )}
      </div>

      <div className="hidden items-center gap-4 border-t border-border px-4 py-2.5 text-[10px] text-dim sm:flex">
        <Key keys={["↑", "↓"]} label="navigate" />
        <Key keys={["↵"]} label="open" />
        <Key keys={[mod, "↵"]} label="new tab" />
        {term && hits.length > 0 && <Key keys={["Tab"]} label="filter" />}
        {term && searched && (
          <span className="ml-auto tabular-nums">
            {shown.length} {shown.length === 1 ? "page" : "pages"}
          </span>
        )}
      </div>
    </>
  );
}

function Key({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1">
      {keys.map((k) => (
        <kbd key={k} className="border border-border bg-surface px-1 py-px font-mono">
          {k}
        </kbd>
      ))}
      {label}
    </span>
  );
}
