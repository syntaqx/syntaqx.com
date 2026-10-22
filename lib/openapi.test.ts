import { describe, it, expect } from "vitest";
import { GET as openapiJson } from "@/app/openapi.json/route";
import { GET as v1Openapi } from "@/app/api/v1/openapi/route";

type Operation = {
  operationId?: string;
  description?: string;
  responses?: Record<string, unknown>;
};

async function spec() {
  const res = openapiJson();
  expect(res.status).toBe(200);
  expect(res.headers.get("Content-Type")).toContain("application/json");
  return (await res.json()) as {
    openapi: string;
    paths: Record<string, Record<string, Operation>>;
  };
}

describe("/openapi.json", () => {
  it("serves the same document as /api/v1/openapi", async () => {
    expect(await spec()).toEqual(await v1Openapi().json());
  });

  it("publishes a contact and the versioning/deprecation policy", async () => {
    const doc = (await spec()) as unknown as {
      info: { description: string; contact: Record<string, string> };
    };
    expect(doc.info.contact).toEqual({
      name: "Chase Pierce",
      url: "https://www.syntaqx.com/contact",
      email: "syntaqx@gmail.com",
    });
    expect(doc.info.description).toContain("https://www.syntaqx.com/docs/versioning");
  });

  it("gives every operation a unique operationId, a description and responses", async () => {
    const doc = await spec();
    expect(doc.openapi).toBe("3.1.0");
    const ops = Object.values(doc.paths).flatMap((p) => Object.values(p));
    expect(ops.length).toBeGreaterThanOrEqual(10);
    const ids = ops.map((op) => op.operationId);
    for (const op of ops) {
      expect(op.operationId).toMatch(/^[a-z][A-Za-z0-9]+$/);
      expect(op.description).toBeTruthy();
      expect(Object.keys(op.responses ?? {})).toContain("200");
    }
    expect(new Set(ids).size).toBe(ids.length);
  });
});
