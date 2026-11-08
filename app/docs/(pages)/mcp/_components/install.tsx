"use client";

import { useState } from "react";
import { CodeHighlight } from "@/components/code-highlight";
import { MCP_URL } from "@/lib/constants";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/syntaqx/ui/toggle-group";

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
  const [id, setId] = useState(CLIENTS[0].id);
  const client = CLIENTS.find((c) => c.id === id)!;
  return (
    <div className="border border-border">
      <ToggleGroup
        spacing={0}
        type="single"
        value={id}
        onValueChange={(v) => v && setId(v)}
        aria-label="MCP client"
        className="flex-wrap items-stretch rounded-none border-b border-border"
      >
        {CLIENTS.map((c) => (
          <ToggleGroupItem
            key={c.id}
            value={c.id}
            className="inst h-auto rounded-none border-r border-border px-4 py-3 text-muted-foreground first:rounded-none last:rounded-none"
          >
            {c.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="px-4 pt-4 text-sm text-muted-foreground">{client.where}</p>
      <div className="relative">
        <CodeHighlight code={client.code} lang={client.lang} className="p-4 pr-12 text-sm" />
        <CopyButton value={client.code} className="absolute top-3 right-3" aria-label="Copy" />
      </div>
    </div>
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
