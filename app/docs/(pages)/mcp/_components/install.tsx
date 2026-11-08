"use client";

import { CodeHighlight } from "@/components/code-highlight";
import { MCP_URL } from "@/lib/constants";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/syntaqx/ui/tabs";

interface Client {
  id: string;
  label: string;
  where: string;
  lang: string;
  code: string;
}

const CLIENTS: Client[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    where: "In a terminal. Add --scope user to use it in every project.",
    lang: "bash",
    code: `claude mcp add --transport http syntaqx ${MCP_URL}`,
  },
  {
    id: "claude",
    label: "Claude",
    where: "claude.ai or Claude Desktop: Settings, Connectors, Add custom connector.",
    lang: "text",
    code: `Name: syntaqx\nURL:  ${MCP_URL}`,
  },
  {
    id: "cursor",
    label: "Cursor",
    where: "~/.cursor/mcp.json, or .cursor/mcp.json in a project.",
    lang: "json",
    code: JSON.stringify({ mcpServers: { syntaqx: { url: MCP_URL } } }, null, 2),
  },
  {
    id: "vscode",
    label: "VS Code",
    where: ".vscode/mcp.json in a workspace.",
    lang: "json",
    code: JSON.stringify({ servers: { syntaqx: { type: "http", url: MCP_URL } } }, null, 2),
  },
  {
    id: "other",
    label: "Other",
    where: "Any client that speaks Streamable HTTP. No key, no OAuth.",
    lang: "text",
    code: MCP_URL,
  },
];

export function Install() {
  return (
    <Tabs defaultValue={CLIENTS[0].id} className="gap-0 border border-border">
      <TabsList variant="line" aria-label="MCP client" className="bg-card">
        {CLIENTS.map((c) => (
          <TabsTrigger key={c.id} value={c.id}>
            {c.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {CLIENTS.map((c) => (
        <TabsContent key={c.id} value={c.id}>
          <p className="px-4 pt-4 text-muted-foreground">{c.where}</p>
          <div className="relative">
            <CodeHighlight code={c.code} lang={c.lang} className="p-4 pr-12" />
            <CopyButton value={c.code} className="absolute top-3 right-3" aria-label="Copy" />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

const RULE = `Before an architecture, tooling or process decision, search the syntaqx MCP server for Chase's default and cite the result. Treat book results as reference unless opinion is true.`;

/** A line for CLAUDE.md or AGENTS.md, so the agent asks before it decides. */
export function ProjectRule() {
  return (
    <div className="relative border border-border">
      <CodeHighlight code={RULE} lang="markdown" className="p-4 pr-12 text-sm" />
      <CopyButton value={RULE} className="absolute top-3 right-3" aria-label="Copy" />
    </div>
  );
}
