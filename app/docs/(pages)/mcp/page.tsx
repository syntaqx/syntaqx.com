import Link from "next/link";
import { Plug } from "lucide-react";
import { MCP_URL } from "@/lib/constants";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Install, ProjectRule } from "./_components/install";
import { TrySearch } from "./_components/try-search";

/** A parameter: its name, its type (or the values it takes), and what it does. */
type Param = { name: string; type: string | string[]; required?: boolean; about: string };

const SEARCH_PARAMS: Param[] = [
  {
    name: "query",
    type: "string",
    required: true,
    about: 'What to look for, in plain words. Either-or questions work: "postgres or mongodb".',
  },
  {
    name: "scope",
    type: ["all", "playbook", "post", "book"],
    about: "Narrow to one kind of writing. Defaults to all.",
  },
  { name: "book", type: "string", about: "One book's slug, e.g. payments or hosting-and-cloud." },
  { name: "limit", type: "integer", about: "How many sections to return, 1 to 20. Defaults to 8." },
];

const READ_PARAMS: Param[] = [
  {
    name: "path",
    type: "string",
    required: true,
    about: "A page path or URL from a search result, e.g. /docs/requests/idempotency.",
  },
  {
    name: "anchor",
    type: "string",
    about: "A heading anchor, to read just that section instead of the whole page.",
  },
];

/** The same table the API reference uses for parameters. */
function Params({ rows }: { rows: Param[] }) {
  return (
    <div className="border border-border">
      <div className="inst hidden grid-cols-[1fr_1fr_2fr] border-b border-border bg-card px-4 py-2.5 text-muted-foreground sm:grid">
        <span>Name</span>
        <span>Type</span>
        <span>Description</span>
      </div>
      {rows.map((p) => (
        <div
          key={p.name}
          className="grid gap-1.5 border-b border-border px-4 py-3 text-xs last:border-b-0 sm:grid-cols-[1fr_1fr_2fr] sm:gap-0"
        >
          <span className="font-mono text-foreground">
            {p.name}
            {p.required && <span className="ml-0.5 text-destructive">*</span>}
          </span>
          <span className="flex flex-wrap items-start gap-1 text-muted-foreground">
            {typeof p.type === "string"
              ? p.type
              : p.type.map((v) => (
                  <code key={v} className="border border-border bg-card px-1.5 font-mono">
                    {v}
                  </code>
                ))}
          </span>
          <span className="text-muted-foreground">{p.about}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="eyebrow mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function McpDocsPage() {
  return (
    <div>
      <header className="mb-8 border-b border-border pb-8">
        <p className="eyebrow mb-5">mcp server</p>
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">MCP Server</h1>
        <p className="max-w-2xl text-muted-foreground">
          Connect your agent to everything I&apos;ve written here: the playbook, the posts and the
          books. It can search by section, read a page, and tell my opinions apart from industry
          reference, so what it quotes back is attributed right.
        </p>
        <p className="inst mt-5 text-muted-foreground">
          streamable http · no key · read-only · 2 tools
        </p>
      </header>

      <div className="mb-14 flex flex-wrap items-stretch border border-border">
        {/* The label sits above the URL on a phone, so the URL stays one line. */}
        <span className="inst flex w-full items-center gap-2 border-b border-border bg-card px-4 py-3 text-muted-foreground sm:w-auto sm:border-r sm:border-b-0">
          <Plug size={12} className="text-primary" />
          server url
        </span>
        <code className="flex min-w-0 flex-1 items-center px-4 py-3 font-mono text-sm text-foreground">
          {MCP_URL}
        </code>
        <CopyButton value={MCP_URL} className="m-1.5" aria-label="Copy server URL" />
      </div>

      <Section title="Connect">
        <Install />
      </Section>

      <Section title="Try it">
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          The same search your agent gets, run from here. Ask an either-or question and it finds the
          sections that weigh both, then says how much of the writing covers each option.
        </p>
        <TrySearch />
      </Section>

      <Section title="Tools">
        <h3 className="mb-1 font-mono text-sm text-foreground">search</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Ranked sections, each with its url, kind, an <code>opinion</code> flag and a snippet.
        </p>
        <Params rows={SEARCH_PARAMS} />
        <h3 className="mt-8 mb-1 font-mono text-sm text-foreground">read</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          A page as Markdown, or one section of it.
        </p>
        <Params rows={READ_PARAMS} />
      </Section>

      <Section title="Opinion or reference">
        <div className="max-w-2xl space-y-3 text-sm text-muted-foreground">
          <p>
            The{" "}
            <Link href="/docs" className="text-link">
              playbook
            </Link>{" "}
            and{" "}
            <Link href="/posts" className="text-link">
              posts
            </Link>{" "}
            are my defaults and views. The{" "}
            <Link href="/books" className="text-link">
              books
            </Link>{" "}
            are reference, built from public sources: how an industry works, not what I think,
            except each chapter&apos;s My Default section. Every result carries <code>opinion</code>{" "}
            so an agent knows which it&apos;s holding.
          </p>
          <p>
            For an either-or question, search also reports how many sections discuss each option,
            how many discuss them together, and whether any of those are opinion. When I
            haven&apos;t written about something, or only the books compare two options, it says so,
            instead of letting a passing mention pass for a recommendation.
          </p>
        </div>
      </Section>

      <Section title="Make your agent ask first">
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Agents call tools when they think to. Put this in a project&apos;s CLAUDE.md or AGENTS.md
          and it checks before it picks a datastore, a CI setup or an API style.
        </p>
        <ProjectRule />
      </Section>

      <Section title="Limits and privacy">
        <p className="max-w-2xl text-sm text-muted-foreground">
          It shares the API&apos;s rate limit of 5,000 requests per hour per IP. Nothing you search
          for is stored. See the{" "}
          <Link href="/legal/privacy" className="text-link">
            privacy policy
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
