import { z } from "zod";
import { CACHE, json, invalidField } from "@/lib/api";
import { uuidv7 } from "@/lib/uuid";
import { registry } from "@/lib/openapi";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const UuidResponse = z.string().uuid().openapi("Uuid");
const UuidArrayResponse = z.array(UuidResponse).openapi("UuidArray");

registry.registerPath({
  method: "get",
  path: "/uuid",
  operationId: "generateUuids",
  summary: "Generate UUIDs",
  description:
    "Generate one or more UUIDs. Returns an array of UUID v7s by default (sortable, per https://www.syntaqx.com/docs/identifier-conventions), or v4 with `?version=4`. Use `?count=N` (max 100) to control how many.",
  tags: ["Utilities"],
  request: {
    query: z.object({
      count: z
        .string()
        .optional()
        .openapi({ description: "Number of UUIDs to generate (1–100, default 1)" }),
      version: z
        .enum(["4", "7"])
        .optional()
        .openapi({ description: "UUID version: 7 (default, time-ordered) or 4 (random)" }),
    }),
  },
  responses: {
    200: {
      description: "An array of UUID strings",
      content: {
        "application/json": {
          schema: UuidArrayResponse,
        },
      },
    },
    422: {
      description: "Invalid parameters",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
    429: {
      description: "Rate limited",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
  },
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawCount = searchParams.get("count");
  const count = rawCount ? parseInt(rawCount, 10) : 1;

  if (isNaN(count) || count < 1 || count > 100) {
    return invalidField("count", "count must be an integer between 1 and 100.");
  }

  const version = searchParams.get("version") ?? "7";
  if (version !== "4" && version !== "7") {
    return invalidField("version", "version must be 4 or 7.");
  }

  const generate = version === "4" ? () => crypto.randomUUID() : uuidv7;
  const uuids = Array.from({ length: count }, generate);
  return json(uuids, { headers: { "Cache-Control": CACHE.none } });
}
