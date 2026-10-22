import { describe, it, expect } from "vitest";
import { buildRequest, jsonError, paramKey } from "./api-console";

const base = "https://api.syntaqx.com";

describe("buildRequest()", () => {
  it("adds only filled-in query params and header params", () => {
    const params = [
      { name: "count", in: "query" as const },
      { name: "charset", in: "query" as const },
      { name: "Api-Version", in: "header" as const },
    ];
    const r = buildRequest({
      baseUrl: base,
      path: "/random",
      method: "get",
      params,
      values: {
        [paramKey(params[0])]: " 5 ",
        [paramKey(params[1])]: "",
        [paramKey(params[2])]: "2026-10-22",
      },
    });
    expect(r.url).toBe(`${base}/random?count=5`);
    expect(r.method).toBe("GET");
    expect(r.headers).toEqual({ "Api-Version": "2026-10-22" });
    expect(r.body).toBeUndefined();
    expect(r.curl).toBe(
      `curl '${base}/random?count=5' \\\n  -H 'Api-Version: 2026-10-22'`,
    );
  });

  it("encodes query values and substitutes path params", () => {
    const params = [
      { name: "id", in: "path" as const },
      { name: "t", in: "query" as const },
    ];
    const r = buildRequest({
      baseUrl: base,
      path: "/things/{id}",
      method: "get",
      params,
      values: { "path:id": "a b", "query:t": "2026-10-22T00:00:00+02:00" },
    });
    expect(r.url).toBe(`${base}/things/a%20b?t=2026-10-22T00%3A00%3A00%2B02%3A00`);
  });

  it("sends compact JSON bodies and shell-quotes them in curl", () => {
    const r = buildRequest({
      baseUrl: base,
      path: "/hash",
      method: "post",
      params: [],
      values: {},
      body: '{\n  "input": "it\'s here"\n}',
    });
    expect(r.headers["Content-Type"]).toBe("application/json");
    expect(r.body).toBe('{"input":"it\'s here"}');
    expect(r.curl).toBe(
      `curl -X POST '${base}/hash' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"input":"it'\\''s here"}'`,
    );
  });
});

describe("jsonError()", () => {
  it("returns null for valid JSON and a message otherwise", () => {
    expect(jsonError('{"a":1}')).toBeNull();
    expect(jsonError("{a:1}")).toEqual(expect.any(String));
  });
});
