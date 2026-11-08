import Link from "next/link";
import { Plug } from "lucide-react";
import { MCP_URL } from "@/lib/constants";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Install, ProjectRule } from "./_components/install";
import { TrySearch } from "./_components/try-search";

const SEARCH_PARAMS: [name: string, type: string, about: string][] = [
  [
    "query",
    "string",
    'What to look for, in plain words. Either-or questions work: "postgres or mongodb".',
  ],
  ["scope", "all | playbook | post | book", "Narrow to one kind of writing. Defaults to all."],
  ["book", "slug", "Only one book's chapters, e.g. payments or hosting-and-cloud."],
  ["limit", "1 to 20", "How many sections to return. Defaults to 8."],
];

const READ_PARAMS: [name: string, type: string, about: string][] = [
  ["path", "path or URL", "A page from a search result, e.g. /docs/requests/idempotency."],
  ["anchor", "string", "A heading anchor, to read just that section instead of the whole page."],
];

function Params({ rows }: { rows: [string, string, string][] }) {
  return (
    <dl className="border-t border-border text-sm">
      {rows.map(([name, type, about]) => (
        <div key={name} className="grid gap-1 border-b border-border py-3 sm:grid-cols-[10rem_1fr]">
          <dt>
            <code className="text-foreground">{name}</code>
            <span className="inst mt-1 block text-[11px] text-muted-foreground">{type}</span>
          </dt>
          <dd className="text-muted-foreground">{about}</dd>
        </div>
      ))}
    </dl>
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
        <span className="inst flex items-center gap-2 border-r border-border bg-card px-4 py-3 text-muted-foreground">
          <Plug size={12} className="text-primary" />
          server url
        </span>
        <code className="flex flex-1 items-center px-4 py-3 font-mono text-sm break-all text-foreground">
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
            <Link href="/docs" className="text-primary hover:underline">
              playbook
            </Link>{" "}
            and{" "}
            <Link href="/posts" className="text-primary hover:underline">
              posts
            </Link>{" "}
            are my defaults and views. The{" "}
            <Link href="/books" className="text-primary hover:underline">
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
          <Link href="/legal/privacy" className="text-primary hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
