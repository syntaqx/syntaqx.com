import { mcpHandler } from "@/lib/mcp";

// Served at mcp.syntaqx.com and /mcp too (see proxy.ts). Stateless: every
// request gets a fresh server, so there are no sessions to keep.

const serve = (request: Request) => mcpHandler.fetch(request);

const CONNECT = `syntaqx MCP server: search and read Chase Pierce's playbook, posts and books.

Connect an MCP client to this URL over Streamable HTTP, e.g. in Claude Code:

  claude mcp add --transport http syntaqx https://mcp.syntaqx.com

Tools: search, read. No account or key needed.
`;

/** A browser or curl GET gets connection instructions; MCP clients only POST. */
export function GET(request: Request) {
  if (request.headers.get("accept")?.includes("text/event-stream")) return serve(request);
  return new Response(CONNECT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}

export const POST = serve;
export const DELETE = serve;
