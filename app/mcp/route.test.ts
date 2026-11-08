import { beforeAll, describe, it, expect } from "vitest";
import { GET, POST } from "./route";
import { getIndex } from "@/lib/knowledge-index";

// Build the search index once, up front: it takes seconds on a busy CI runner,
// which would otherwise land on whichever test searches first.
beforeAll(() => void getIndex(), 60_000);

const rpc = (method: string, params: Record<string, unknown> = {}, id = 1) =>
  POST(
    new Request("http://localhost/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    }),
  );

/** A JSON-RPC result from a JSON or single-event SSE response. */
async function result(res: Response) {
  const body = await res.text();
  const json = res.headers.get("content-type")?.includes("text/event-stream")
    ? body
        .split("\n")
        .find((l) => l.startsWith("data: "))!
        .slice(6)
    : body;
  return JSON.parse(json);
}

describe("/mcp", () => {
  it("answers a plain GET with connection instructions", async () => {
    const res = GET(new Request("http://localhost/mcp"));
    expect(res).toBeInstanceOf(Response);
    const text = await (res as Response).text();
    expect(text).toContain("claude mcp add --transport http syntaqx https://mcp.syntaqx.com");
  });

  it("sends a browser to the setup page", () => {
    const res = GET(new Request("http://localhost/mcp", { headers: { Accept: "text/html" } }));
    expect((res as Response).status).toBe(302);
    expect((res as Response).headers.get("location")).toBe("https://www.syntaqx.com/docs/mcp");
  });

  it("reports a comparison for an either-or question, leading with its note", async () => {
    const { result: call } = await result(
      await rpc("tools/call", { name: "search", arguments: { query: "svelte or vue" } }),
    );
    const { comparison } = call.structuredContent;
    expect(comparison.options.map((o: { option: string }) => o.option)).toEqual(["svelte", "vue"]);
    expect(call.content[0].text).toMatch(/^Chase's writing doesn't mention svelte/);
  });

  it("initializes with the attribution instructions", async () => {
    const res = await rpc("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "test", version: "1.0.0" },
    });
    expect(res.status).toBe(200);
    const { result: init } = await result(res);
    expect(init.serverInfo.name).toBe("syntaqx");
    expect(init.instructions).toContain("not Chase's opinion");
  });

  it("lists the search and read tools", async () => {
    const { result: list } = await result(await rpc("tools/list"));
    expect(list.tools.map((t: { name: string }) => t.name).sort()).toEqual(["read", "search"]);
  });

  it("searches the playbook", async () => {
    const { result: call } = await result(
      await rpc("tools/call", {
        name: "search",
        arguments: { query: "idempotency keys", scope: "playbook", limit: 3 },
      }),
    );
    const { results } = call.structuredContent;
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r: { kind: string }) => r.kind === "playbook")).toBe(true);
    expect(results[0].url).toMatch(/^https:\/\/www\.syntaqx\.com\/docs\//);
  });

  it("reads a page by URL", async () => {
    const { result: call } = await result(
      await rpc("tools/call", {
        name: "read",
        arguments: { path: "https://www.syntaqx.com/docs/requests/idempotency" },
      }),
    );
    expect(call.isError).toBeFalsy();
    expect(call.content[0].text).toMatch(/^# /);
  });

  it("reports a missing page as a tool error", async () => {
    const { result: call } = await result(
      await rpc("tools/call", { name: "read", arguments: { path: "/docs/nope" } }),
    );
    expect(call.isError).toBe(true);
  });
});
