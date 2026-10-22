import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

const get = (qs: string) => GET(new NextRequest(`http://localhost/api/uuid${qs}`));

describe("GET /uuid", () => {
  it("returns uncacheable UUID v7s by default", async () => {
    const res = get("?count=3");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const ids = (await res.json()) as string[];
    expect(ids).toHaveLength(3);
    for (const id of ids) expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("returns v4 with ?version=4", async () => {
    const [id] = (await get("?version=4").json()) as string[];
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("rejects an unknown version with a 422", async () => {
    const res = get("?version=1");
    expect(res.status).toBe(422);
    expect((await res.json()).errors).toEqual({ version: ["version must be 4 or 7."] });
  });
});
