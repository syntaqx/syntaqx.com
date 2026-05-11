import { z } from "zod";
import { json } from "@/lib/api";
import { registry } from "@/lib/openapi";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const IpResponse = z
  .object({
    ip: z.string(),
    forwarded_for: z.string().nullable(),
    user_agent: z.string().nullable(),
  })
  .openapi("IpResponse");

registry.registerPath({
  method: "get",
  path: "/ip",
  summary: "Client IP address",
  description:
    "Returns the caller's IP address, the full X-Forwarded-For chain, and User-Agent.",
  tags: ["Utilities"],
  responses: {
    200: {
      description: "Caller information",
      content: { "application/json": { schema: IpResponse } },
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
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  return json({
    ip,
    forwarded_for: forwarded,
    user_agent: request.headers.get("user-agent"),
  });
}
