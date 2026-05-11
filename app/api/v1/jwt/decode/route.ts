import { z } from "zod";
import { json, errorResponse } from "@/lib/api";
import { registry } from "@/lib/openapi";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const JwtDecodeRequest = z
  .object({
    token: z.string().openapi({
      description: "The JWT to decode (no verification)",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    }),
  })
  .openapi("JwtDecodeRequest");

const JwtDecodeResponse = z
  .object({
    header: z.record(z.string(), z.unknown()),
    payload: z.record(z.string(), z.unknown()),
    expired: z.boolean().nullable().openapi({
      description: "null if no exp claim is present",
    }),
  })
  .openapi("JwtDecodeResponse");

registry.registerPath({
  method: "post",
  path: "/jwt/decode",
  summary: "Decode a JWT",
  description:
    "Decode a JSON Web Token without signature verification. Returns the header, payload, and whether the token is expired.",
  tags: ["Utilities"],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: JwtDecodeRequest } },
    },
  },
  responses: {
    200: {
      description: "Decoded JWT",
      content: { "application/json": { schema: JwtDecodeResponse } },
    },
    400: {
      description: "Invalid token",
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

function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (base64.length % 4)) % 4;
  base64 += "=".repeat(pad);
  return new TextDecoder().decode(
    Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Request body must be valid JSON.");
  }

  const parsed = JwtDecodeRequest.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "Invalid request body.", {
      errors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), [i.message]]),
      ),
    });
  }

  const { token } = parsed.data;
  const parts = token.split(".");

  if (parts.length !== 3) {
    return errorResponse(400, "Token must have three dot-separated parts.");
  }

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = JSON.parse(decodeBase64Url(parts[0]));
  } catch {
    return errorResponse(400, "Invalid JWT header.");
  }

  try {
    payload = JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return errorResponse(400, "Invalid JWT payload.");
  }

  let expired: boolean | null = null;
  if (typeof payload.exp === "number") {
    expired = Math.floor(Date.now() / 1000) > payload.exp;
  }

  return json({ header, payload, expired });
}
