import { z } from "zod";
import { json, errorResponse } from "@/lib/api";
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
  summary: "Generate UUIDs",
  description:
    "Generate one or more UUIDs. Returns an array of v4 UUIDs. Use `?count=N` (max 100) to control how many.",
  tags: ["Utilities"],
  request: {
    query: z.object({
      count: z
        .string()
        .optional()
        .openapi({ description: "Number of UUIDs to generate (1–100, default 1)" }),
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
    400: {
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
    return errorResponse(400, "count must be an integer between 1 and 100.");
  }

  const uuids = Array.from({ length: count }, () => crypto.randomUUID());
  return json(uuids);
}
