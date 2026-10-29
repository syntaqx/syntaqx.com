import { z } from "zod";
import { CACHE, errorResponse, invalidField, json } from "@/lib/api";
import { registry } from "@/lib/openapi";
import {
  DEFAULT_TTL_SECONDS,
  MAX_SECRET_BYTES,
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
  encryptSecret,
  lookupKey,
  newSecretId,
  secretStore,
} from "@/lib/secrets";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const CreatedSecret = z
  .object({
    id: z.string().openapi({ example: "pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M" }),
    url: z.string().url().openapi({
      description: "The one-time link. Reading it returns the secret and deletes it.",
      example: "https://api.syntaqx.com/secrets/pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M",
    }),
    expires_at: z.string().openapi({ example: "2026-10-29T15:23:45.000Z" }),
  })
  .openapi("CreatedSecret");

const errorDoc = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

registry.registerPath({
  method: "post",
  path: "/secrets",
  operationId: "createSecret",
  summary: "Create a one-time secret",
  description:
    "Stores a secret behind a one-time link: the first GET of the link returns it and deletes it, and an unread secret expires after `ttl` seconds. It's stored encrypted under a key derived from the link, so only the link can read it. A demo for https://www.syntaqx.com/posts/github-actions-secret-inputs, with no SLA: don't send production credentials.",
  tags: ["Testing"],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: z
            .object({
              secret: z.string().min(1).openapi({ description: "Up to 4 KB of UTF-8" }),
              ttl: z
                .number()
                .int()
                .min(MIN_TTL_SECONDS)
                .max(MAX_TTL_SECONDS)
                .optional()
                .openapi({ description: "Seconds until an unread secret expires (60 to 86400, default 3600)" }),
            })
            .openapi({ example: { secret: "hunter2", ttl: 600 } }),
        },
      },
    },
  },
  responses: {
    201: { description: "Secret stored", content: { "application/json": { schema: CreatedSecret } } },
    400: errorDoc("Malformed JSON"),
    413: errorDoc("Secret over 4 KB"),
    422: errorDoc("Missing secret, or ttl out of range"),
    429: errorDoc("Rate limited"),
    503: errorDoc("Secret storage unavailable; nothing was stored"),
  },
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/** The base the link is built on: api.syntaqx.com, or /api on other hosts. */
function linkBase(request: Request): string {
  const host = request.headers.get("host");
  if (host?.startsWith("api.")) return `https://${host}`;
  return `${new URL(request.url).origin}/api`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Request body must be valid JSON.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return invalidField("secret", "The body must be a JSON object with a secret.");
  }

  const { secret, ttl = DEFAULT_TTL_SECONDS } = body as { secret?: unknown; ttl?: unknown };
  if (typeof secret !== "string" || secret.length === 0) {
    return invalidField("secret", "secret must be a non-empty string.");
  }
  if (new TextEncoder().encode(secret).length > MAX_SECRET_BYTES) {
    return errorResponse(413, "secret must not exceed 4 KB.");
  }
  if (typeof ttl !== "number" || !Number.isInteger(ttl) || ttl < MIN_TTL_SECONDS || ttl > MAX_TTL_SECONDS) {
    return invalidField("ttl", `ttl must be an integer from ${MIN_TTL_SECONDS} to ${MAX_TTL_SECONDS} seconds.`);
  }

  const id = newSecretId();
  try {
    await secretStore().put(await lookupKey(id), await encryptSecret(id, secret), ttl);
  } catch (error) {
    console.error("secrets: storage unavailable", error);
    return errorResponse(503, "Secret storage is unavailable. Nothing was stored; try again shortly.", {
      headers: { "Retry-After": "1", "Cache-Control": CACHE.none },
    });
  }

  return json(
    { id, url: `${linkBase(request)}/secrets/${id}`, expires_at: new Date(Date.now() + ttl * 1000).toISOString() },
    { status: 201, headers: { "Cache-Control": CACHE.none } },
  );
}
