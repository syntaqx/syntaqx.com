"use client";

import { useState } from "react";
import { Check, FolderPlus, Inbox, RotateCcw, Search, SearchX, X } from "lucide-react";
import { DemoFrame } from "@/app/ui/_components/demo-frame";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/registry/syntaqx/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/registry/syntaqx/ui/input-group";

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
    <DemoFrame
      note={
        <>
          One sentence on what lives here, one primary action, one low-stakes way to see it full. No
          illustration carries the message on its own.
        </>
      }
    >
      {projects.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderPlus />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              A project groups the services you deploy together, so their logs and alerts live in
              one place.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row flex-wrap justify-center gap-2">
            <Button onClick={() => setProjects(["new-project"])}>Create a project</Button>
            <Button variant="outline" onClick={() => setProjects(SAMPLE_PROJECTS)}>
              Load sample projects
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div>
          <ul className="divide-y divide-border">
            {projects.map((p) => (
              <li key={p} className="px-6 py-3 font-mono text-sm text-foreground">
                {p}
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-6 py-4">
            <Button variant="outline" size="sm" onClick={() => setProjects([])}>
              <RotateCcw /> Reset
            </Button>
          </div>
        </div>
      )}
    </DemoFrame>
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
    <DemoFrame
      note={
        <>
          The empty state knows why it&apos;s empty. Here a match exists, but the archived filter
          hides it, so the fix is one click away. Clear the search to see the plain list.
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-6">
        <InputGroup className="flex-1 basis-48">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search issues"
          />
        </InputGroup>
        <Button
          variant="outline"
          aria-pressed={showArchived}
          onClick={() => setShowArchived((v) => !v)}
        >
          {showArchived ? "Showing archived" : "Hiding archived"}
        </Button>
      </div>
      {visible.length > 0 ? (
        <ul className="divide-y divide-border">
          {visible.map((i) => (
            <li
              key={i.title}
              className="flex items-center justify-between gap-3 px-6 py-3 text-sm text-foreground"
            >
              {i.title}
              {i.archived && <Badge variant="outline">archived</Badge>}
            </li>
          ))}
        </ul>
      ) : (
        <Empty aria-live="polite">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>
              No {showArchived ? "" : "open "}issues match &ldquo;{query}&rdquo;
            </EmptyTitle>
            <EmptyDescription>
              {hiddenByFilter > 0
                ? `${hiddenByFilter} archived ${hiddenByFilter === 1 ? "issue matches" : "issues match"}.`
                : "Check the spelling, or try fewer words."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {hiddenByFilter > 0 ? (
              <Button onClick={() => setShowArchived(true)}>Include archived</Button>
            ) : (
              <Button variant="outline" onClick={() => setQuery("")}>
                <X /> Clear search
              </Button>
            )}
          </EmptyContent>
        </Empty>
      )}
    </DemoFrame>
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
    <DemoFrame
      note={
        <>
          Same empty list as the first run, different meaning. Reusing the first-run copy here would
          tell someone who just finished that they never started.
        </>
      }
    >
      {remaining.length > 0 ? (
        <ul className="divide-y divide-border">
          {remaining.map((t) => (
            <li key={t} className="flex items-center gap-3 px-6 py-3">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Mark "${t}" done`}
                onClick={() => setDone((d) => [...d, t])}
                className="text-transparent hover:border-primary hover:bg-transparent hover:text-primary focus-visible:text-primary"
              >
                <Check />
              </Button>
              <span className="text-sm text-foreground">{t}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className="text-primary">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>All caught up</EmptyTitle>
            <EmptyDescription>Nothing needs you right now.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => setDone((d) => d.slice(0, -1))}>
              <RotateCcw /> Undo last
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </DemoFrame>
  );
}

export { FirstRunDemo, NoResultsDemo, AllDoneDemo };
