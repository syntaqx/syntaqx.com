import { z } from "zod";
import { CACHE, errorResponse, json } from "@/lib/api";
import { registry } from "@/lib/openapi";
import {
  CHECK_HEADER,
  EXPIRES_AT_HEADER,
  decryptSecret,
  lookupKey,
  secretStore,
  validSecretId,
  type TakeResult,
} from "@/lib/secrets";

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
    "Returns the secret and deletes it, so a second read is a 404. Expired secrets are a 404 too. A request that accepts `text/html` (a browser, or a chat app previewing the link) is redirected to https://www.syntaqx.com/tools/secrets instead, which reveals it only on a click.",
  tags: ["Utilities"],
  request: {
    params: z.object({ id: z.string().openapi({ example: "pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M" }) }),
    headers: z.object({
      "Secret-Check": z.string().optional().openapi({
        description: "The `check` the secret was created with, if it had one",
      }),
    }),
  },
  responses: {
    200: {
      description: "The secret, now deleted",
      content: { "application/json": { schema: Secret } },
    },
    303: { description: "Sent to the reveal page: the request accepts text/html" },
    403: errorDoc("Missing or wrong Secret-Check; the secret wasn't read or deleted"),
    404: errorDoc("No secret with that id: already read, expired, or never created"),
    429: errorDoc("Rate limited"),
    503: errorDoc("Secret storage unavailable; the secret wasn't read"),
  },
});

registry.registerPath({
  method: "head",
  path: "/secrets/{id}",
  operationId: "checkSecret",
  summary: "Check a one-time secret without reading it",
  description:
    "200 with `Secret-Expires-At` while the secret is unread, 404 once it's read or expired. Doesn't consume it, so a page can show whether a link still works before anyone reveals it.",
  tags: ["Utilities"],
  request: {
    params: z.object({ id: z.string().openapi({ example: "pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M" }) }),
  },
  responses: {
    200: {
      description: "Unread",
      headers: z.object({
        "Secret-Expires-At": z.string().openapi({
          description: "RFC 3339 time the secret expires",
          example: "2026-10-29T15:23:45.000Z",
        }),
      }),
    },
    404: { description: "Already read, expired, or never created" },
    503: { description: "Secret storage unavailable" },
  },
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const notFound = () =>
  errorResponse(404, "No secret with that id. It was already read, expired, or never existed.", {
    headers: { "Cache-Control": CACHE.none },
  });

/** Without this, Next.js answers HEAD by running GET, which would consume the secret. */
export async function HEAD(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = { "Cache-Control": CACHE.none };
  if (!validSecretId(id)) return new Response(null, { status: 404, headers });

  let left: number | null;
  try {
    left = await secretStore().ttl(await lookupKey(id));
  } catch (error) {
    console.error("secrets: storage unavailable", error);
    return new Response(null, { status: 503, headers: { ...headers, "Retry-After": "1" } });
  }
  if (left === null) return new Response(null, { status: 404, headers });
  return new Response(null, {
    status: 200,
    headers: { ...headers, [EXPIRES_AT_HEADER]: new Date(Date.now() + left).toISOString() },
  });
}

/** Where a person who opens an API link lands: the page, on www for the api subdomain. */
function revealPage(request: Request, id: string): string {
  const host = request.headers.get("host");
  const origin = host?.startsWith("api.")
    ? `https://www.${host.slice(4)}`
    : new URL(request.url).origin;
  return `${origin}/tools/secrets#api/${id}`;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validSecretId(id)) return notFound();

  // A browser, or a chat app unfurling the link, asks for HTML. Send it to the
  // page, which only reveals on a click, instead of burning the secret.
  if (request.headers.get("accept")?.includes("text/html")) {
    return new Response(null, {
      status: 303,
      headers: { Location: revealPage(request, id), "Cache-Control": CACHE.none },
    });
  }

  let taken: TakeResult;
  try {
    taken = await secretStore().take(
      await lookupKey(id),
      request.headers.get(CHECK_HEADER) ?? undefined,
    );
  } catch (error) {
    console.error("secrets: storage unavailable", error);
    return errorResponse(
      503,
      "Secret storage is unavailable. The secret wasn't read; try again shortly.",
      {
        headers: { "Retry-After": "1", "Cache-Control": CACHE.none },
      },
    );
  }
  if (taken.status === "missing") return notFound();
  if (taken.status === "denied") {
    return errorResponse(
      403,
      `This secret needs the ${CHECK_HEADER} it was created with. It wasn't read or deleted.`,
      { headers: { "Cache-Control": CACHE.none } },
    );
  }

  return json(
    { secret: await decryptSecret(id, taken.value) },
    { headers: { "Cache-Control": CACHE.none } },
  );
}
