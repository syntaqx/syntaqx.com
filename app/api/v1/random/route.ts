import { z } from "zod";
import { json, rateLimit, errorResponse } from "@/lib/api";
import { registry } from "@/lib/openapi";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const CHARSETS: Record<string, string> = {
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  numeric: "0123456789",
  hex: "0123456789abcdef",
};

const CHARSET_NAMES = Object.keys(CHARSETS) as [string, ...string[]];

registry.registerPath({
  method: "get",
  path: "/random",
  summary: "Generate random strings",
  description:
    "Generate one or more random strings. Defaults to a single 32-character alphanumeric string. Use `?count=N` (max 100) to receive an array.",
  tags: ["Utilities"],
  request: {
    query: z.object({
      length: z
        .string()
        .optional()
        .openapi({ description: "String length (1–1024, default 32)" }),
      charset: z
        .string()
        .optional()
        .openapi({
          description:
            "Character set: alphanumeric (default), alpha, numeric, hex",
        }),
      count: z
        .string()
        .optional()
        .openapi({ description: "Number of strings (1–100)" }),
    }),
  },
  responses: {
    200: {
      description: "An array of random strings",
      content: {
        "application/json": {
          schema: z.array(z.string()),
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

function randomString(length: number, chars: string): string {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => chars[b % chars.length]).join("");
}

export function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip);
  if (rl.limited) {
    return errorResponse(429, "Too many requests. Please try again later.");
  }

  const { searchParams } = request.nextUrl;

  // Length
  const rawLength = searchParams.get("length");
  const length = rawLength ? parseInt(rawLength, 10) : 32;
  if (isNaN(length) || length < 1 || length > 1024) {
    return errorResponse(400, "length must be an integer between 1 and 1024.");
  }

  // Charset
  const charsetName = searchParams.get("charset") || "alphanumeric";
  const chars = CHARSETS[charsetName];
  if (!chars) {
    return errorResponse(
      400,
      `charset must be one of: ${CHARSET_NAMES.join(", ")}.`,
    );
  }

  // Count
  const rawCount = searchParams.get("count");
  const count = rawCount ? parseInt(rawCount, 10) : 1;

  if (isNaN(count) || count < 1 || count > 100) {
    return errorResponse(400, "count must be an integer between 1 and 100.");
  }

  const strings = Array.from({ length: count }, () =>
    randomString(length, chars),
  );
  return json(strings, { headers: rl.headers });
}
