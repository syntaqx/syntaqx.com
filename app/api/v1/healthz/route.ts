import { z } from "zod";
import { json } from "@/lib/api";
import { registry } from "@/lib/openapi";

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

export function GET() {
  return json({ status: "ok" });
}
