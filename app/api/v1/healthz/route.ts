import { z } from "zod";
import { json, rateLimit, errorResponse } from "@/lib/api";
import { registry } from "@/lib/openapi";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const HealthzResponse = z
  .object({ status: z.literal("ok") })
  .openapi("HealthzResponse");

registry.registerPath({
  method: "get",
  path: "/healthz",
  summary: "Health check",
  description: "Returns the current health status of the API.",
  tags: ["System"],
  responses: {
    200: {
      description: "API is healthy",
      content: { "application/json": { schema: HealthzResponse } },
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
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip);

  if (rl.limited) {
    return errorResponse(429, "Too many requests. Please try again later.");
  }

  return json({ status: "ok" }, { headers: rl.headers });
}
