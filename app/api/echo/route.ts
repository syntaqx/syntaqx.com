import { z } from "zod";
import { errorResponse, invalidField, json } from "@/lib/api";
import { registry } from "@/lib/openapi";
import { clientKey } from "@/lib/ratelimit";
import { uuidv7 } from "@/lib/uuid";
import {
  IDEMPOTENCY_KEY_HEADER,
  REPLAYED_HEADER,
  fingerprint,
  idempotencyStore,
  validKey,
} from "@/lib/idempotency";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const MAX_BODY_BYTES = 16 * 1024;

const Echo = z
  .object({
    id: z.string().uuid().openapi({ description: "A new UUID v7, different on every non-replayed request" }),
    created_at: z.string().openapi({ example: "2026-10-22T14:23:45.123Z" }),
    payload: z.record(z.string(), z.unknown()).openapi({ description: "The JSON object you sent" }),
  })
  .openapi("Echo");

const errorDoc = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

registry.registerPath({
  method: "post",
  path: "/echo",
  operationId: "createEcho",
  summary: "Create an echo (idempotency demo)",
  description:
    "Creates an echo of a JSON object with a new id and timestamp, so every call is a new side effect. Send an `Idempotency-Key` to make retries safe: the same key and body replay the original response with `Idempotent-Replayed: true`; the same key with a different body is a 400; a retry while the first is still running is a 409. Keys are kept 24 hours, scoped to your IP. See https://www.syntaqx.com/docs/payments/idempotency.",
  tags: ["Playbook"],
  request: {
    headers: z.object({
      "Idempotency-Key": z.string().max(255).optional().openapi({
        description: "Your key for this logical operation; reuse it on every retry",
        example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      }),
    }),
    body: {
      required: true,
      content: { "application/json": { schema: z.record(z.string(), z.unknown()).openapi({ example: { hello: "world" } }) } },
    },
  },
  responses: {
    201: { description: "Echo created (or replayed, with Idempotent-Replayed: true)", content: { "application/json": { schema: Echo } } },
    400: errorDoc("Malformed JSON, an invalid Idempotency-Key, or a key already used for a different request"),
    409: errorDoc("A request with this Idempotency-Key is still in progress; retry shortly with the same key"),
    413: errorDoc("Body over 16 KB"),
    422: errorDoc("The body isn't a JSON object"),
    429: errorDoc("Rate limited"),
    503: errorDoc("Idempotency storage unavailable; nothing was created, retry with the same key"),
  },
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/** Validation happens before the key is claimed: a rejected request isn't stored. */
function validate(raw: string): { payload: Record<string, unknown> } | { error: Response } {
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { error: errorResponse(400, "Request body must be valid JSON.") };
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { error: invalidField("payload", "The body must be a JSON object.") };
  }
  return { payload: payload as Record<string, unknown> };
}

/** The side effect: a new echo with its own id and timestamp. */
function create(payload: Record<string, unknown>): Response {
  return json({ id: uuidv7(), created_at: new Date().toISOString(), payload }, { status: 201 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return errorResponse(413, "The body must not exceed 16 KB.");
  }

  const key = request.headers.get(IDEMPOTENCY_KEY_HEADER);
  if (key !== null && !validKey(key)) {
    return errorResponse(400, "Idempotency-Key must be 1 to 255 printable characters.");
  }
  const valid = validate(raw);
  if ("error" in valid) return valid.error;
  if (key === null) return create(valid.payload);

  const scopedKey = `${clientKey(request)}:${key}`;
  const print = await fingerprint("POST", "/echo", raw);
  const store = idempotencyStore();

  let claim;
  try {
    claim = await store.claim(scopedKey, print);
  } catch (error) {
    console.error("idempotency: storage unavailable, refusing to run unprotected", error);
    return errorResponse(503, "Idempotency storage is unavailable. Nothing was created; retry with the same key.", {
      headers: { "Retry-After": "1" },
    });
  }

  switch (claim.kind) {
    case "mismatch":
      return errorResponse(400, "This Idempotency-Key was already used for a different request.");
    case "in_progress":
      return errorResponse(409, "A request with this Idempotency-Key is still in progress. Retry shortly with the same key.", {
        headers: { "Retry-After": "1" },
      });
    case "completed":
      return new Response(claim.response.body, {
        status: claim.response.status,
        headers: { "Content-Type": claim.response.contentType, [REPLAYED_HEADER]: "true" },
      });
  }

  // Execution starts here, so whatever happens next is stored and replayed.
  const response = create(valid.payload);
  const body = await response.clone().text();
  try {
    await store.complete(scopedKey, print, {
      status: response.status,
      body,
      contentType: response.headers.get("Content-Type") ?? "application/json",
    });
  } catch (error) {
    // The key stays in_progress and expires; a retry gets a 409 until then.
    console.error("idempotency: couldn't store the response", error);
  }
  return response;
}
