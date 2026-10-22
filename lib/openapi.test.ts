import { describe, it, expect } from "vitest";
import { GET as openapiJson } from "@/app/openapi.json/route";
import { GET as apiOpenapi } from "@/app/api/openapi/route";
import { API_VERSIONS } from "@/lib/api";
import { generateOpenApiSpec } from "@/lib/openapi";

type Operation = {
  operationId?: string;
  description?: string;
  responses?: Record<string, unknown>;
};

async function spec() {
  const res = await openapiJson(new Request("http://localhost/openapi.json"));
  expect(res.status).toBe(200);
  expect(res.headers.get("Content-Type")).toContain("application/json");
  return (await res.json()) as {
    openapi: string;
    paths: Record<string, Record<string, Operation>>;
  };
}

describe("/openapi.json", () => {
  it("serves the same document as /api/openapi", async () => {
    expect(await spec()).toEqual(
      await (await apiOpenapi(new Request("http://localhost/api/openapi"))).json(),
    );
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

  it("documents the Api-Version header on every operation", async () => {
    const doc = (await spec()) as unknown as {
      info: { version: string };
      components: { parameters: Record<string, Record<string, unknown>> };
      paths: Record<string, Record<string, { parameters?: unknown[] }>>;
    };
    const versions = API_VERSIONS.map((v) => v.version);
    expect(doc.info.version).toBe(versions[versions.length - 1]);
    expect(doc.components.parameters.ApiVersion).toMatchObject({
      name: "Api-Version",
      in: "header",
      required: false,
      schema: { type: "string", enum: versions, default: versions[0] },
    });
    for (const [path, ops] of Object.entries(doc.paths)) {
      for (const op of Object.values(ops)) {
        expect(op.parameters, path).toContainEqual({
          $ref: "#/components/parameters/ApiVersion",
        });
      }
    }
  });

  it("gives every operation a unique operationId, a description and responses", async () => {
    const doc = await spec();
    expect(doc.openapi).toBe("3.2.0");
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

describe("generateOpenApiSpec()", () => {
  it("points the development server at the requesting origin", () => {
    const env = process.env as Record<string, string | undefined>;
    const prev = env.NODE_ENV;
    env.NODE_ENV = "development";
    try {
      expect(generateOpenApiSpec("http://localhost:3127").servers).toEqual([
        { url: "http://localhost:3127/api", description: "Local development" },
      ]);
    } finally {
      env.NODE_ENV = prev;
    }
  });

  it("always uses the production API outside development", () => {
    expect(generateOpenApiSpec("http://localhost:3127").servers).toEqual([
      { url: "https://api.syntaqx.com", description: "Production" },
    ]);
  });
});
