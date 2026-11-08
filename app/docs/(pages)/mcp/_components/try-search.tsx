"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/registry/syntaqx/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/registry/syntaqx/ui/input-group";
import type { SearchResponse } from "@/lib/knowledge";

const EXAMPLES = [
  "postgres or mongodb",
  "kubernetes or managed containers",
  "terraform or pulumi",
  "idempotency keys",
  "svelte or vue",
];

/** One tools/call to /mcp, the same request an MCP client sends. */
async function callSearch(query: string): Promise<SearchResponse> {
  const res = await fetch("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "search", arguments: { query, limit: 6 } },
    }),
  });
  if (res.status === 429) throw new Error("Rate limited. Try again in a little while.");
  const body = await res.text();
  // A single JSON body, or an SSE stream whose data line holds it.
  const json = body.trimStart().startsWith("{")
    ? body
    : body
        .split("\n")
        .find((l) => l.startsWith("data: "))
        ?.slice(6);
  const message = JSON.parse(json ?? "{}");
  if (message.error) throw new Error(message.error.message);
  return message.result?.structuredContent ?? { results: [] };
}

export function TrySearch() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(q: string) {
    if (!q.trim()) return;
    setQuery(q);
    setPending(true);
    setError(null);
    try {
      setResponse(await callSearch(q));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
      setResponse(null);
    } finally {
      setPending(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    run(query);
  }

  return (
    <div>
      <form onSubmit={submit} className="flex gap-2" role="search">
        <InputGroup size="lg">
          <InputGroupAddon>
            <Search size={14} aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask it something, e.g. queues in postgres or a broker"
            aria-label="Search query"
            maxLength={500}
          />
        </InputGroup>
        <Button type="submit" size="lg" disabled={pending || !query.trim()}>
          {pending ? "Searching" : "Search"}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <Button key={ex} variant="outline" size="sm" onClick={() => run(ex)} disabled={pending}>
            {ex}
          </Button>
        ))}
      </div>

      <div aria-live="polite" className="mt-6">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {response && <Results response={response} />}
      </div>
    </div>
  );
}

function Results({ response }: { response: SearchResponse }) {
  const { results, comparison } = response;
  return (
    <div>
      {comparison && (
        <div className="mb-4 border border-border bg-card px-4 py-3 text-sm">
          <p className="inst mb-1 text-muted-foreground">
            {comparison.options.map((o) => `${o.option}: ${o.sections}`).join("  ·  ")}
            {"  ·  "}together: {comparison.together} ({comparison.opinionsTogether} opinion)
          </p>
          {comparison.note && <p>{comparison.note}</p>}
        </div>
      )}
      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing found. The writing may not cover this.
        </p>
      ) : (
        <ol className="border-t border-border">
          {results.map((r) => (
            <li key={r.url} className="border-b border-border py-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inst border px-1.5 py-0.5 text-[11px]",
                    r.opinion
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {r.opinion ? "opinion" : "reference"}
                </span>
                <span className="inst text-[11px] text-muted-foreground">{r.kind}</span>
                {r.covers && r.covers.length > 0 && (
                  <span className="inst text-[11px] text-muted-foreground">
                    covers {r.covers.join(", ")}
                  </span>
                )}
              </div>
              <a href={r.url} className="font-medium text-foreground hover:text-primary">
                {r.title}
                {r.heading && <span className="text-muted-foreground"> › {r.heading}</span>}
              </a>
              <p className="mt-1 text-sm text-muted-foreground">{r.snippet}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
