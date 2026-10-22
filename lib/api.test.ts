import { describe, it, expect } from "vitest";
import {
  json,
  errorResponse,
  invalidField,
  cacheableJson,
  CACHE,
  resolveApiVersion,
  API_VERSIONS,
} from "./api";

describe("json()", () => {
  it("attaches an Request-Id header when none is provided", () => {
    const res = json({ ok: true });
    expect(res.headers.get("Request-Id")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("preserves a caller-provided Request-Id", () => {
    const res = json({ ok: true }, { headers: { "Request-Id": "abc-123" } });
    expect(res.headers.get("Request-Id")).toBe("abc-123");
  });

  it("uses a UUID v7 and mirrors it to the legacy X-Request-ID", () => {
    const res = json({ ok: true });
    const id = res.headers.get("Request-Id");
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(res.headers.get("X-Request-ID")).toBe(id);
  });

  it("serializes the body as JSON", async () => {
    const res = json({ value: 42 });
    expect(await res.json()).toEqual({ value: 42 });
  });
});

describe("errorResponse()", () => {
  it("returns the documented {message} envelope", async () => {
    const res = errorResponse(400, "bad input");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "bad input" });
  });

  it("includes field-level errors when provided", async () => {
    const res = errorResponse(422, "validation", {
      errors: { name: ["required"] },
    });
    expect(await res.json()).toEqual({
      message: "validation",
      errors: { name: ["required"] },
    });
  });

  it("attaches an Request-Id header when none is provided", () => {
    const res = errorResponse(500, "boom");
    expect(res.headers.get("Request-Id")).toBeTruthy();
  });

  it("preserves a caller-provided Request-Id", () => {
    const res = errorResponse(500, "boom", {
      headers: { "Request-Id": "trace-xyz" },
    });
    expect(res.headers.get("Request-Id")).toBe("trace-xyz");
  });
});

describe("cacheableJson()", () => {
  const url = "http://localhost/api/healthz";

  it("sends a strong ETag and the given Cache-Control", async () => {
    const res = await cacheableJson(new Request(url), { status: "ok" }, CACHE.revalidate);
    expect(res.status).toBe(200);
    expect(res.headers.get("ETag")).toMatch(/^"[0-9a-f]{32}"$/);
    expect(res.headers.get("Cache-Control")).toBe("private, no-cache");
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("answers a matching If-None-Match (strong, weak, listed or *) with an empty 304", async () => {
    const first = await cacheableJson(new Request(url), { status: "ok" }, CACHE.revalidate);
    const etag = first.headers.get("ETag")!;
    for (const inm of [etag, `W/${etag}`, `"nope", ${etag}`, "*"]) {
      const res = await cacheableJson(
        new Request(url, { headers: { "If-None-Match": inm } }),
        { status: "ok" },
        CACHE.revalidate,
      );
      expect(res.status, inm).toBe(304);
      expect(res.headers.get("ETag")).toBe(etag);
      expect(res.headers.get("Request-Id")).toBeTruthy();
      expect(await res.text()).toBe("");
    }
  });

  it("returns 200 when the ETag doesn't match", async () => {
    const res = await cacheableJson(
      new Request(url, { headers: { "If-None-Match": '"stale"' } }),
      { status: "ok" },
      CACHE.revalidate,
    );
    expect(res.status).toBe(200);
  });
});

describe("invalidField()", () => {
  it("returns a 422 with field-level errors", async () => {
    const res = invalidField("count", "count must be an integer between 1 and 100.");
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      message: "count must be an integer between 1 and 100.",
      errors: { count: ["count must be an integer between 1 and 100."] },
    });
  });
});

describe("resolveApiVersion()", () => {
  const versions = [
    { version: "2026-01-01", deprecatedAt: "2026-11-01T00:00:00Z", sunsetAt: "2026-12-15T00:00:00Z" },
    { version: "2026-06-01" },
  ];
  const now = new Date("2026-11-10T00:00:00Z");

  it("defaults to the oldest supported version when no header is sent", () => {
    const r = resolveApiVersion(null, now, versions);
    expect(r.ok && r.version).toBe("2026-01-01");
  });

  it("echoes the requested version with Vary: Api-Version", () => {
    const r = resolveApiVersion("2026-06-01", now, versions);
    expect(r).toEqual({
      ok: true,
      version: "2026-06-01",
      headers: { "Api-Version": "2026-06-01", Vary: "Api-Version" },
    });
  });

  it("adds RFC 9745 Deprecation, RFC 8594 Sunset and Link for deprecated versions", () => {
    const r = resolveApiVersion("2026-01-01", now, versions);
    expect(r.ok && r.headers).toEqual({
      "Api-Version": "2026-01-01",
      Vary: "Api-Version",
      Deprecation: `@${Date.parse("2026-11-01T00:00:00Z") / 1000}`,
      Sunset: "Tue, 15 Dec 2026 00:00:00 GMT",
      Link: '<https://www.syntaqx.com/docs/versioning>; rel="deprecation"',
    });
  });

  it("rejects unknown versions, listing the supported ones", () => {
    const r = resolveApiVersion("2020-01-01", now, versions);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.body.message).toContain("2026-01-01, 2026-06-01");
      expect(r.body.errors?.["Api-Version"]).toEqual([
        "must be one of: 2026-01-01, 2026-06-01",
      ]);
    }
  });

  it("stops serving a version after its sunset, and moves the default on", () => {
    const later = new Date("2026-12-15T00:00:00Z");
    expect(resolveApiVersion("2026-01-01", later, versions).ok).toBe(false);
    const r = resolveApiVersion(null, later, versions);
    expect(r.ok && r.version).toBe("2026-06-01");
  });

  it("ships at least one supported version", () => {
    expect(API_VERSIONS.length).toBeGreaterThan(0);
    for (const v of API_VERSIONS) expect(v.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
