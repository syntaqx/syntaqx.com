import { JsonLd } from "@/components/json-ld";
import { article } from "@/lib/schema";
import { pageMetadata } from "@/lib/metadata";

const title = "MCP Server";
const description =
  "Connect Claude Code, Cursor, VS Code or any MCP client to the syntaqx playbook, posts and books: search and read them, with opinions labeled apart from reference.";

export const metadata = pageMetadata("/docs/mcp", title, description);

export default function McpDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={article({
          headline: title,
          description,
          path: "/docs/mcp",
          crumbs: [
            { name: "Docs", path: "/docs" },
            { name: "MCP Server", path: "/docs/mcp" },
          ],
        })}
      />
      {children}
    </>
  );
}
