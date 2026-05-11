import { z } from "zod";
import { json, errorResponse } from "@/lib/api";
import { registry } from "@/lib/openapi";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const TimestampResponse = z
  .object({
    unix: z.number().openapi({ description: "Unix timestamp (seconds)" }),
    unix_ms: z.number().openapi({ description: "Unix timestamp (milliseconds)" }),
    rfc3339: z.string().openapi({ description: "RFC 3339 / ISO 8601 formatted" }),
    rfc2822: z.string().openapi({ description: "RFC 2822 formatted" }),
    day_of_year: z.number(),
    week_of_year: z.number(),
    leap_year: z.boolean(),
  })
  .openapi("TimestampResponse");

registry.registerPath({
  method: "get",
  path: "/timestamp",
  summary: "Current timestamp",
  description:
    "Returns the current time in multiple formats. Optionally pass `?t=` with a Unix timestamp (seconds or milliseconds) or ISO 8601 string to convert.",
  tags: ["Utilities"],
  request: {
    query: z.object({
      t: z
        .string()
        .optional()
        .openapi({
          description:
            "Unix timestamp (seconds or ms) or ISO 8601 string to convert",
        }),
    }),
  },
  responses: {
    200: {
      description: "Timestamp in multiple formats",
      content: { "application/json": { schema: TimestampResponse } },
    },
    400: {
      description: "Invalid timestamp",
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
// Helpers
// ---------------------------------------------------------------------------

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

function weekOfYear(d: Date): number {
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dayNum = ((d.getUTCDay() + 6) % 7);
  start.setUTCDate(start.getUTCDate() + 4 - ((start.getUTCDay() + 6) % 7));
  const yearStart = new Date(Date.UTC(start.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function formatTimestamp(d: Date) {
  return {
    unix: Math.floor(d.getTime() / 1000),
    unix_ms: d.getTime(),
    rfc3339: d.toISOString(),
    rfc2822: d.toUTCString(),
    day_of_year: dayOfYear(d),
    week_of_year: weekOfYear(d),
    leap_year: isLeapYear(d.getFullYear()),
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export function GET(request: NextRequest) {
  const t = request.nextUrl.searchParams.get("t");

  if (t === null) {
    return json(formatTimestamp(new Date()));
  }

  // Try parsing as a number (unix seconds or ms)
  const num = Number(t);
  if (!isNaN(num) && t.trim() !== "") {
    // If < 1e12 treat as seconds, otherwise milliseconds
    const ms = num < 1e12 ? num * 1000 : num;
    const d = new Date(ms);
    if (isNaN(d.getTime())) {
      return errorResponse(400, "Invalid timestamp value.");
    }
    return json(formatTimestamp(d));
  }

  // Try ISO 8601 / RFC 3339
  const d = new Date(t);
  if (isNaN(d.getTime())) {
    return errorResponse(
      400,
      "Invalid timestamp. Provide a Unix timestamp or RFC 3339 string.",
    );
  }
  return json(formatTimestamp(d));
}
