/**
 * The MCP server behind mcp.syntaqx.com: search and read over the playbook,
 * posts and books. Read-only and public, no auth; the proxy rate-limits it
 * like the rest of the API.
 */

import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";
import { BOOK_SLUGS, KINDS, parseTarget, read, searchDetailed } from "@/lib/knowledge";

export const INSTRUCTIONS = `Search and read the published writing of Chase Pierce (syntaqx), from syntaqx.com.

Every result has a kind, and the kind decides how to use it:
- playbook: Chase's opinionated defaults for building and running software. Treat these as his recommendations.
- post: Chase's essays. Also his views.
- book: industry reference built from public sources (payments, health tech, banking and more). It describes how an industry works; it is not Chase's opinion, except a chapter's "My Default" section.

Each result's opinion flag says which: true for Chase's own view, false for reference material.

When you use this material:
- Attribute it as what Chase's writing says, never as Chase speaking. Don't put words in his mouth.
- Cite the url of every result you rely on.
- If search finds nothing relevant, say his writing doesn't cover it rather than guessing what he would say.
- Before an architecture, tooling or process decision, search the playbook for his default.
- For an either-or question, ask it as one (search "X or Y"). The response's comparison says how many sections discuss each option and how many of those that weigh them together are opinion; pass its note on rather than stretching a passing mention or a book's comparison into his recommendation.

Search returns ranked sections with snippets; read a result's path and anchor to get the section, or the path alone for the whole page.`;

const searchInput = z.object({
  query: z.string().min(1).max(500).describe("What to look for, in plain words."),
  scope: z
    .enum(["all", ...KINDS])
    .default("all")
    .describe("all, or only playbook (opinions), post (essays) or book (industry reference)."),
  book: z
    .enum(BOOK_SLUGS as [string, ...string[]])
    .optional()
    .describe("Only this book's chapters."),
  limit: z.number().int().min(1).max(20).default(8),
});

const readInput = z.object({
  path: z
    .string()
    .min(1)
    .max(300)
    .describe(
      "A site path or syntaqx.com URL from a search result, e.g. /docs/requests/idempotency. A #anchor reads just that section.",
    ),
  anchor: z.string().max(200).optional().describe("A heading anchor from a search result."),
});

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });

export function createServer(): McpServer {
  const server = new McpServer(
    { name: "syntaqx", title: "syntaqx", version: "1.0.0" },
    { instructions: INSTRUCTIONS },
  );

  server.registerTool(
    "search",
    {
      title: "Search Chase's writing",
      description:
        'Search the syntaqx.com playbook, posts and books. Returns ranked sections with their kind, opinion flag, url, path, anchor and a snippet. Either-or questions ("postgres or mongodb", "kafka vs rabbitmq") work: results favor sections that weigh every option, and a comparison reports how much the writing covers each.',
      inputSchema: searchInput,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, scope, book, limit }) => {
      const response = searchDetailed(query, {
        kinds: scope === "all" ? undefined : [scope],
        book,
        limit,
      });
      const note = response.comparison?.note;
      const lead = response.results.length
        ? note
        : (note ?? `No results for "${query}". Chase's writing may not cover this.`);
      return {
        ...text([lead, JSON.stringify(response, null, 2)].filter(Boolean).join("\n\n")),
        structuredContent: { ...response },
      };
    },
  );

  server.registerTool(
    "read",
    {
      title: "Read a page or section",
      description:
        "Read a syntaqx.com page as Markdown, or one section of it with an anchor. Use paths from search results.",
      inputSchema: readInput,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ path, anchor }) => {
      const target = parseTarget(path);
      const result = read(target.path, anchor ?? target.anchor);
      return result.ok ? text(result.markdown) : { ...text(result.message), isError: true };
    },
  );

  return server;
}

export const mcpHandler = createMcpHandler(() => createServer());
