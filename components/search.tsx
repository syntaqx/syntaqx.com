"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, X, FileText, Loader2 } from "lucide-react";

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

interface PagefindResultData {
  url: string;
  meta?: { title?: string };
  excerpt: string;
}

interface PagefindResult {
  data: () => Promise<PagefindResultData>;
}

interface PagefindApi {
  init: () => Promise<void>;
  debouncedSearch: (
    term: string,
  ) => Promise<{ results: PagefindResult[] } | null>;
}

export function SearchButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    // Escape is handled by Radix Dialog while open.
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Search"
        className="flex h-8 items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 text-xs text-dim hover:text-muted hover:border-border-hover transition-colors cursor-pointer"
      >
        <Search size={13} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-dim">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-100 bg-background/70 backdrop-blur-sm" />
        <div className="fixed inset-0 z-100 flex items-start justify-center sm:px-4 sm:pt-[15vh] pointer-events-none">
          <Dialog.Content
            aria-describedby={undefined}
            className="pointer-events-auto relative w-full h-full sm:h-auto sm:max-w-xl sm:rounded-xl border-b sm:border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col outline-none"
          >
            <Dialog.Title className="sr-only">Search</Dialog.Title>
            <SearchModal onClose={() => setOpen(false)} />
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagefind, setPagefind] = useState<PagefindApi | null>(null);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef(0);
  const [selected, setSelected] = useState(0);

  // Load pagefind
  useEffect(() => {
    async function load() {
      try {
        const pf = (await import(
          // @ts-expect-error pagefind is generated at build time
          /* webpackIgnore: true */ "/pagefind/pagefind.js"
        )) as PagefindApi;
        await pf.init();
        setPagefind(pf);
      } catch {
        setError(true);
      }
    }
    load();
  }, []);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search
  const search = useCallback(
    async (term: string) => {
      if (!pagefind || !term.trim()) {
        setResults([]);
        return;
      }
      // Yield to the event loop so the loading flag isn't flipped
      // synchronously inside the parent effect body.
      await Promise.resolve();
      setLoading(true);
      try {
        const response = await pagefind.debouncedSearch(term);
        if (!response) {
          setLoading(false);
          return;
        }
        const data = await Promise.all(
          response.results.slice(0, 8).map((r) => r.data()),
        );
        setResults(
          data.map((d) => ({
            url: d.url.replace(/\.html$/, ""),
            title: d.meta?.title || d.url,
            excerpt: d.excerpt,
          })),
        );
        setSelected(0);
      } catch {
        setResults([]);
      }
      setLoading(false);
    },
    [pagefind],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      search(query);
    });
    return () => cancelAnimationFrame(id);
  }, [query, search]);

  // Keyboard navigation
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      onClose();
      window.location.href = results[selected].url;
    }
  }

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const hasResults = query.trim().length > 0 && results.length > 0;

  return (
    <>
      {/* Input */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
        <Search size={16} className="text-dim shrink-0" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={hasResults}
          aria-controls="search-listbox"
          aria-activedescendant={
            hasResults ? `search-option-${selected}` : undefined
          }
          aria-autocomplete="list"
          aria-label="Search docs, posts, and pages"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            error
              ? "Search unavailable (build index first)"
              : "Search docs, posts, pages..."
          }
          className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-dim outline-none"
          disabled={error}
        />
        {loading && (
          <Loader2 size={14} className="text-dim animate-spin shrink-0" />
        )}
        <kbd className="hidden sm:inline-flex rounded-md border border-border bg-background/50 px-2 py-0.5 text-[10px] text-dim font-mono">
          ESC
        </kbd>
        <Dialog.Close
          className="sm:hidden p-1 text-dim hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close search"
        >
          <X size={16} />
        </Dialog.Close>
      </div>

      {/* Results */}
      {hasResults && (
        <ul
          id="search-listbox"
          role="listbox"
          aria-label="Search results"
          className="flex-1 overflow-y-auto sm:max-h-96 p-2"
        >
          {results.map((result, i) => (
            <li
              key={result.url}
              id={`search-option-${i}`}
              role="option"
              aria-selected={i === selected}
            >
              <a
                href={result.url}
                onClick={onClose}
                tabIndex={-1}
                className={`flex items-start gap-3 rounded-lg px-3 py-3 transition-colors ${
                  i === selected
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-accent/5"
                }`}
              >
                <FileText size={14} className="mt-0.5 shrink-0 opacity-50" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  <p
                    className="text-xs text-dim line-clamp-2 mt-1 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: result.excerpt }}
                  />
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {query.trim() && !loading && results.length === 0 && !error && (
        <div className="px-4 py-10 text-center text-sm text-dim">
          No results for &ldquo;{query}&rdquo;
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="px-4 py-10 text-center text-sm text-dim">
          Search index not found. Run{" "}
          <code className="text-accent font-mono text-xs">npm run build</code>{" "}
          to generate it.
        </div>
      )}

      {/* Hint */}
      {!query.trim() && !error && (
        <div className="px-4 py-10 text-center text-sm text-dim">
          Start typing to search across the site
        </div>
      )}

      {/* Footer hints */}
      {results.length > 0 && (
        <div className="hidden sm:flex items-center gap-4 border-t border-border px-4 py-2.5 text-[10px] text-dim">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-background/50 px-1 py-px font-mono">
              ↑
            </kbd>
            <kbd className="rounded border border-border bg-background/50 px-1 py-px font-mono">
              ↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-background/50 px-1.5 py-px font-mono">
              ↵
            </kbd>
            open
          </span>
        </div>
      )}
    </>
  );
}
