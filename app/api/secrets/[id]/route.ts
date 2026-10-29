import { z } from "zod";
import { CACHE, errorResponse, json } from "@/lib/api";
import { registry } from "@/lib/openapi";
import { decryptSecret, lookupKey, secretStore, validSecretId } from "@/lib/secrets";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const Secret = z.object({ secret: z.string().openapi({ example: "hunter2" }) }).openapi("Secret");

const errorDoc = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

registry.registerPath({
  method: "get",
  path: "/secrets/{id}",
  operationId: "getSecret",
  summary: "Read a one-time secret",
  description:
    "Returns the secret and deletes it, so a second read is a 404. Expired secrets are a 404 too.",
  tags: ["Testing"],
  request: {
    params: z.object({ id: z.string().openapi({ example: "pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M" }) }),
  },
  responses: {
    200: { description: "The secret, now deleted", content: { "application/json": { schema: Secret } } },
    404: errorDoc("No secret with that id: already read, expired, or never created"),
    429: errorDoc("Rate limited"),
    503: errorDoc("Secret storage unavailable; the secret wasn't read"),
  },
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const notFound = () =>
  errorResponse(404, "No secret with that id. It was already read, expired, or never existed.", {
    headers: { "Cache-Control": CACHE.none },
  });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validSecretId(id)) return notFound();

  let stored: string | null;
  try {
    stored = await secretStore().take(await lookupKey(id));
  } catch (error) {
    console.error("secrets: storage unavailable", error);
    return errorResponse(503, "Secret storage is unavailable. The secret wasn't read; try again shortly.", {
      headers: { "Retry-After": "1", "Cache-Control": CACHE.none },
    });
  }
  if (stored === null) return notFound();

  return json({ secret: await decryptSecret(id, stored) }, { headers: { "Cache-Control": CACHE.none } });
}
