import { describe, it, expect } from "vitest";
import { json, errorResponse } from "./api";

describe("json()", () => {
  it("attaches an X-Request-ID header when none is provided", () => {
    const res = json({ ok: true });
    expect(res.headers.get("X-Request-ID")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("preserves a caller-provided X-Request-ID", () => {
    const res = json({ ok: true }, { headers: { "X-Request-ID": "abc-123" } });
    expect(res.headers.get("X-Request-ID")).toBe("abc-123");
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

  it("attaches an X-Request-ID header when none is provided", () => {
    const res = errorResponse(500, "boom");
    expect(res.headers.get("X-Request-ID")).toBeTruthy();
  });

  it("preserves a caller-provided X-Request-ID", () => {
    const res = errorResponse(500, "boom", {
      headers: { "X-Request-ID": "trace-xyz" },
    });
    expect(res.headers.get("X-Request-ID")).toBe("trace-xyz");
  });
});
