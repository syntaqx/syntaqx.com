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
        className="flex h-8 items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 text-xs text-dim hover:text-muted hover:border-border-hover transition-colors cursor-pointer"
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
      className="fixed inset-0 z-100 flex items-start justify-center sm:px-4 sm:pt-[15vh]"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm" />
      <div
        className="relative w-full h-full sm:h-auto sm:max-w-xl sm:rounded-xl border-b sm:border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
          <Search size={16} className="text-dim shrink-0" />
          <input
            ref={inputRef}
            type="text"
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
          <button
            onClick={onClose}
            className="sm:hidden p-1 text-dim hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        {query.trim() && results.length > 0 && (
          <ul className="flex-1 overflow-y-auto sm:max-h-96 p-2">
            {results.map((result, i) => (
              <li key={result.url}>
                <a
                  href={result.url}
                  onClick={onClose}
                  className={`flex items-start gap-3 rounded-lg px-3 py-3 transition-colors ${
                    i === selected
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-accent/5"
                  }`}
                >
                  <FileText size={14} className="mt-0.5 shrink-0 opacity-50" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {result.title}
                    </p>
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
      </div>
    </div>
  );
}
