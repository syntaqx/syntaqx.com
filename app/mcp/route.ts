import { mcpHandler } from "@/lib/mcp";
import { MCP_URL, SITE_URL } from "@/lib/constants";

// Served at mcp.syntaqx.com and /mcp too (see proxy.ts). Stateless: every
// request gets a fresh server, so there are no sessions to keep.

const serve = (request: Request) => mcpHandler.fetch(request);

const CONNECT = `syntaqx MCP server: search and read Chase Pierce's playbook, posts and books.

Connect an MCP client to this URL over Streamable HTTP, e.g. in Claude Code:

  claude mcp add --transport http syntaqx ${MCP_URL}

Tools: search, read. No account or key needed.
Setup for other clients: ${SITE_URL}/docs/mcp
`;

/**
 * MCP clients POST. A GET from a browser goes to the setup page; from curl
 * or a script, it gets the instructions as text.
 */
export function GET(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/event-stream")) return serve(request);
  if (accept.includes("text/html")) return Response.redirect(`${SITE_URL}/docs/mcp`, 302);
  return new Response(CONNECT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600",
      Vary: "Accept",
    },
  });
}

export const POST = serve;
export const DELETE = serve;
