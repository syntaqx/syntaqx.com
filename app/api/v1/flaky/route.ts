import { z } from "zod";
import { json, rateLimit, errorResponse } from "@/lib/api";
import { registry } from "@/lib/openapi";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const FlakyResponse = z
  .object({
    attempt_id: z
      .string()
      .uuid()
      .openapi({ description: "Unique ID for this attempt (useful for log correlation)" }),
    latency_ms: z
      .number()
      .openapi({ description: "Artificial delay applied (milliseconds)" }),
  })
  .openapi("FlakyResponse");

registry.registerPath({
  method: "get",
  path: "/flaky",
  summary: "Simulate an unreliable service",
  description:
    "Returns success or failure based on a configurable rate. Use this to test retry logic, circuit breakers, and timeout handling. The response is intentionally random — the same request may succeed or fail.",
  tags: ["Testing"],
  request: {
    query: z.object({
      rate: z
        .string()
        .optional()
        .openapi({
          description:
            "Success rate as a percentage (0–100, default 50). 0 = always fail, 100 = always succeed.",
        }),
      status: z
        .string()
        .optional()
        .openapi({
          description:
            "HTTP status code to return on failure (400–599, default 500)",
        }),
      delay: z
        .string()
        .optional()
        .openapi({
          description:
            "Maximum random delay in milliseconds before responding (0–10000, default 0)",
        }),
    }),
  },
  responses: {
    200: {
      description: "Success — the request \"survived\"",
      content: { "application/json": { schema: FlakyResponse } },
    },
    500: {
      description: "Simulated failure (or whatever status code was requested)",
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

const STATUS_MESSAGES: Record<number, string> = {
  400: "Bad Request (simulated)",
  401: "Unauthorized (simulated)",
  403: "Forbidden (simulated)",
  404: "Not Found (simulated)",
  408: "Request Timeout (simulated)",
  409: "Conflict (simulated)",
  422: "Unprocessable Entity (simulated)",
  429: "Too Many Requests (simulated)",
  500: "Internal Server Error (simulated)",
  502: "Bad Gateway (simulated)",
  503: "Service Unavailable (simulated)",
  504: "Gateway Timeout (simulated)",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip);
  if (rl.limited) {
    return errorResponse(429, "Too many requests. Please try again later.");
  }

  const { searchParams } = request.nextUrl;

  // Success rate
  const rawRate = searchParams.get("rate");
  const rate = rawRate !== null ? parseFloat(rawRate) : 50;
  if (isNaN(rate) || rate < 0 || rate > 100) {
    return errorResponse(400, "rate must be a number between 0 and 100.");
  }

  // Failure status code
  const rawStatus = searchParams.get("status");
  const failStatus = rawStatus !== null ? parseInt(rawStatus, 10) : 500;
  if (isNaN(failStatus) || failStatus < 400 || failStatus > 599) {
    return errorResponse(
      400,
      "status must be an integer between 400 and 599.",
    );
  }

  // Delay
  const rawDelay = searchParams.get("delay");
  const maxDelay = rawDelay !== null ? parseInt(rawDelay, 10) : 0;
  if (isNaN(maxDelay) || maxDelay < 0 || maxDelay > 10000) {
    return errorResponse(
      400,
      "delay must be an integer between 0 and 10000.",
    );
  }

  // Apply random delay
  const actualDelay = maxDelay > 0 ? Math.floor(Math.random() * maxDelay) : 0;
  if (actualDelay > 0) {
    await sleep(actualDelay);
  }

  const attemptId = crypto.randomUUID();
  const succeeded = Math.random() * 100 < rate;

  if (succeeded) {
    return json(
      { attempt_id: attemptId, latency_ms: actualDelay },
      { headers: rl.headers },
    );
  }

  const message =
    STATUS_MESSAGES[failStatus] || `Error ${failStatus} (simulated)`;

  return errorResponse(failStatus, message, { headers: rl.headers });
}
