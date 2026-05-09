"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X, FileText, Loader2 } from "lucide-react";

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

export function SearchButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs text-dim hover:text-muted hover:border-border-hover transition-colors cursor-pointer"
        aria-label="Search"
      >
        <Search size={13} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-dim">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </button>
      {open &&
        createPortal(
          <SearchModal onClose={() => setOpen(false)} />,
          document.body,
        )}
    </>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagefind, setPagefind] = useState<any>(null);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef(0);
  const [selected, setSelected] = useState(0);

  // Load pagefind
  useEffect(() => {
    async function load() {
      try {
        const pf = await import(
          // @ts-expect-error pagefind is generated at build time
          /* webpackIgnore: true */ "/pagefind/pagefind.js"
        );
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
      setLoading(true);
      try {
        const response = await pagefind.debouncedSearch(term);
        if (!response) {
          setLoading(false);
          return;
        }
        const data = await Promise.all(
          response.results.slice(0, 8).map((r: any) => r.data()),
        );
        setResults(
          data.map((d: any) => ({
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
    search(query);
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

  selectedRef.current = selected;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={15} className="text-dim shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              error
                ? "Search unavailable (build index first)"
                : "Search posts, pages..."
            }
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-dim outline-none"
            disabled={error}
          />
          {loading && (
            <Loader2 size={14} className="text-dim animate-spin shrink-0" />
          )}
          <button
            onClick={onClose}
            className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-dim hover:text-foreground transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        {query.trim() && results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto p-2">
            {results.map((result, i) => (
              <li key={result.url}>
                <a
                  href={result.url}
                  onClick={onClose}
                  className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    i === selected
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-surface"
                  }`}
                >
                  <FileText size={14} className="mt-0.5 shrink-0 opacity-60" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {result.title}
                    </p>
                    <p
                      className="text-xs text-dim line-clamp-2 mt-0.5"
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
          <div className="px-4 py-8 text-center text-xs text-dim">
            No results for &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-4 py-8 text-center text-xs text-dim">
            Search index not found. Run{" "}
            <code className="text-accent">npm run build</code> to generate it.
          </div>
        )}

        {/* Hint */}
        {!query.trim() && !error && (
          <div className="px-4 py-8 text-center text-xs text-dim">
            Start typing to search across the site
          </div>
        )}
      </div>
    </div>
  );
}
