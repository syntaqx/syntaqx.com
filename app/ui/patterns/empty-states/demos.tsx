"use client";

import { useState, type ReactNode } from "react";
import { Check, FolderPlus, Inbox, RotateCcw, Search, X } from "lucide-react";

const btn =
  "inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim transition-colors hover:text-foreground hover:border-border-hover cursor-pointer";
const primary =
  "inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-xs text-accent transition-colors hover:bg-accent/20 cursor-pointer";

function Frame({ children, note }: { children: ReactNode; note: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      {children}
      <div className="border-t border-border px-4 py-2.5 text-[10px] text-dim">
        {note}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// First run
// ---------------------------------------------------------------------------
// The first time a list is empty, it's a lesson: say what goes here, why
// you'd want it, and give one way to start. A sample fills it so the reader
// can see the populated shape before committing to anything.

const SAMPLE_PROJECTS = ["checkout-api", "marketing-site", "billing-worker"];

function FirstRunDemo() {
  const [projects, setProjects] = useState<string[]>([]);

  return (
    <Frame
      note={
        <>
          One sentence on what lives here, one primary action, one low-stakes
          way to see it full. No illustration carries the message on its own.
        </>
      }
    >
      {projects.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <FolderPlus size={20} className="mb-3 text-dim" />
          <p className="mb-1 text-sm text-foreground">No projects yet</p>
          <p className="mb-5 max-w-sm text-xs leading-relaxed text-dim">
            A project groups the services you deploy together, so their logs
            and alerts live in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className={primary}
              onClick={() => setProjects(["new-project"])}
            >
              Create a project
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => setProjects(SAMPLE_PROJECTS)}
            >
              Load sample projects
            </button>
          </div>
        </div>
      ) : (
        <div>
          <ul className="divide-y divide-border">
            {projects.map((p) => (
              <li key={p} className="px-4 py-2.5 font-mono text-xs text-foreground">
                {p}
              </li>
            ))}
          </ul>
          <div className="border-t border-border p-3">
            <button type="button" className={btn} onClick={() => setProjects([])}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
      )}
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// No results
// ---------------------------------------------------------------------------
// Empty because of the reader's own query or filters. Repeat the query back,
// name the filter that's doing the hiding, and offer to remove it. "No
// results" alone makes people retype what they already typed.

const ISSUES = [
  { title: "Retry webhook deliveries with backoff", archived: false },
  { title: "Rate limit the export endpoint", archived: false },
  { title: "Paginate the audit log", archived: true },
  { title: "Rotate webhook signing secrets", archived: true },
  { title: "Idempotency keys on payouts", archived: false },
];

function NoResultsDemo() {
  const [query, setQuery] = useState("secret");
  const [showArchived, setShowArchived] = useState(false);

  const q = query.trim().toLowerCase();
  const matching = ISSUES.filter((i) => i.title.toLowerCase().includes(q));
  const visible = matching.filter((i) => showArchived || !i.archived);
  const hiddenByFilter = matching.length - visible.length;

  return (
    <Frame
      note={
        <>
          The empty state knows why it&apos;s empty. Here a match exists, but
          the archived filter hides it, so the fix is one click away. Clear the
          search to see the plain list.
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded border border-border px-2 py-1">
          <Search size={12} className="shrink-0 text-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search issues"
            className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none"
          />
        </label>
        <button
          type="button"
          aria-pressed={showArchived}
          onClick={() => setShowArchived((v) => !v)}
          className={btn}
        >
          {showArchived ? "Showing archived" : "Hiding archived"}
        </button>
      </div>
      {visible.length > 0 ? (
        <ul className="divide-y divide-border">
          {visible.map((i) => (
            <li
              key={i.title}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs text-foreground"
            >
              {i.title}
              {i.archived && <span className="text-[10px] text-dim">archived</span>}
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-6 py-8 text-center" aria-live="polite">
          <p className="mb-1 text-sm text-foreground">
            No {showArchived ? "" : "open "}issues match &ldquo;{query}&rdquo;
          </p>
          {hiddenByFilter > 0 ? (
            <>
              <p className="mb-4 text-xs text-dim">
                {hiddenByFilter} archived{" "}
                {hiddenByFilter === 1 ? "issue matches" : "issues match"}.
              </p>
              <button type="button" className={primary} onClick={() => setShowArchived(true)}>
                Include archived
              </button>
            </>
          ) : (
            <>
              <p className="mb-4 text-xs text-dim">
                Check the spelling, or try fewer words.
              </p>
              <button type="button" className={btn} onClick={() => setQuery("")}>
                <X size={12} /> Clear search
              </button>
            </>
          )}
        </div>
      )}
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// All done
// ---------------------------------------------------------------------------
// Empty because the reader finished. That's the goal, not a gap, so it gets
// its own state: acknowledge it, and keep the last action undoable.

const TASKS = ["Review the payout PR", "Reply to the vendor", "Approve the rollout"];

function AllDoneDemo() {
  const [done, setDone] = useState<string[]>([]);
  const remaining = TASKS.filter((t) => !done.includes(t));

  return (
    <Frame
      note={
        <>
          Same empty list as the first run, different meaning. Reusing the
          first-run copy here would tell someone who just finished that they
          never started.
        </>
      }
    >
      {remaining.length > 0 ? (
        <ul className="divide-y divide-border">
          {remaining.map((t) => (
            <li key={t} className="flex items-center gap-3 px-4 py-2.5">
              <button
                type="button"
                aria-label={`Mark "${t}" done`}
                onClick={() => setDone((d) => [...d, t])}
                className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-border text-transparent transition-colors hover:border-accent hover:text-accent cursor-pointer"
              >
                <Check size={10} />
              </button>
              <span className="text-xs text-foreground">{t}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <Inbox size={20} className="mb-3 text-accent" />
          <p className="mb-1 text-sm text-foreground">All caught up</p>
          <p className="mb-5 text-xs text-dim">Nothing needs you right now.</p>
          <button
            type="button"
            className={btn}
            onClick={() => setDone((d) => d.slice(0, -1))}
          >
            <RotateCcw size={12} /> Undo last
          </button>
        </div>
      )}
    </Frame>
  );
}

export { FirstRunDemo, NoResultsDemo, AllDoneDemo };
