import { z } from "zod";
import { json, rateLimit, errorResponse } from "@/lib/api";
import { registry } from "@/lib/openapi";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const ACTIONS = ["encode", "decode"] as const;

const Base64Request = z
  .object({
    input: z.string().openapi({ description: "The string to encode or decode", example: "hello world" }),
    action: z
      .enum(ACTIONS)
      .default("encode")
      .openapi({ description: "Whether to encode or decode" }),
    url_safe: z
      .boolean()
      .default(false)
      .openapi({ description: "Use URL-safe base64 (RFC 4648 §5)" }),
  })
  .openapi("Base64Request");

const Base64Response = z
  .object({
    output: z.string(),
  })
  .openapi("Base64Response");

registry.registerPath({
  method: "post",
  path: "/base64",
  summary: "Base64 encode/decode",
  description:
    "Encode a string to base64 or decode a base64 string. Supports standard and URL-safe variants.",
  tags: ["Utilities"],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: Base64Request } },
    },
  },
  responses: {
    200: {
      description: "Result",
      content: { "application/json": { schema: Base64Response } },
    },
    400: {
      description: "Invalid input",
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

const MAX_INPUT_LENGTH = 1_000_000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip);
  if (rl.limited) {
    return errorResponse(429, "Too many requests. Please try again later.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Request body must be valid JSON.");
  }

  const parsed = Base64Request.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "Invalid request body.", {
      errors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), [i.message]]),
      ),
    });
  }

  const { input, action, url_safe } = parsed.data;

  if (input.length > MAX_INPUT_LENGTH) {
    return errorResponse(400, "input must not exceed 1 MB.");
  }

  let output: string;

  if (action === "encode") {
    output = btoa(
      Array.from(new TextEncoder().encode(input), (b) =>
        String.fromCharCode(b),
      ).join(""),
    );
    if (url_safe) {
      output = output.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
  } else {
    try {
      let normalized = input;
      if (url_safe) {
        normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
        const pad = (4 - (normalized.length % 4)) % 4;
        normalized += "=".repeat(pad);
      }
      output = new TextDecoder().decode(
        Uint8Array.from(atob(normalized), (c) => c.charCodeAt(0)),
      );
    } catch {
      return errorResponse(400, "Invalid base64 input.");
    }
  }

  return json({ output }, { headers: rl.headers });
}
