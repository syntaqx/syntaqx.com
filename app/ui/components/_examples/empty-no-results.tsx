"use client";

import { useState } from "react";
import { Search, SearchX, X } from "lucide-react";
import { Button } from "@/registry/syntaqx/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/syntaqx/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/registry/syntaqx/ui/input-group";

const ISSUES = [
  { title: "Retry webhook deliveries with backoff", archived: false },
  { title: "Rate limit the export endpoint", archived: false },
  { title: "Paginate the audit log", archived: true },
  { title: "Rotate webhook signing secrets", archived: true },
  { title: "Idempotency keys on payouts", archived: false },
];

export default function EmptyNoResults() {
  const [query, setQuery] = useState("secret");
  const [showArchived, setShowArchived] = useState(false);

  const q = query.trim().toLowerCase();
  const matching = ISSUES.filter((i) => i.title.toLowerCase().includes(q));
  const visible = matching.filter((i) => showArchived || !i.archived);
  // The empty state knows why it's empty: a match the filter is hiding.
  const hiddenByFilter = matching.length - visible.length;

  return (
    <div className="w-full max-w-lg rounded-lg border">
      <div className="flex flex-wrap items-center gap-2 border-b p-4">
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
        <ul className="divide-y">
          {visible.map((i) => (
            <li key={i.title} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              {i.title}
              {i.archived && (
                <span className="rounded-md border px-1.5 text-xs text-muted-foreground">
                  archived
                </span>
              )}
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
    </div>
  );
}
