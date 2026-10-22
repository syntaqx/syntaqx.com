/**
 * HTTP QUERY (RFC 10008) support, per /docs/requests/http-query.
 *
 * Next.js route handlers only dispatch the classic methods, so QUERY is
 * routed here, in the proxy layer, for both doors: a native `QUERY`, and
 * `POST` + `X-HTTP-Method-Override: QUERY` for clients that can't send it.
 * Both reach the endpoint's read-only handler.
 */

import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api";

export const ACCEPT_QUERY = "application/json";
export const MAX_QUERY_BYTES = 64 * 1024;
export const METHOD_OVERRIDE_HEADER = "X-HTTP-Method-Override";

interface QueryRoute {
  /** The endpoint's read-only handler, which receives the query as a POST body. */
  load: () => Promise<(request: NextRequest) => Promise<Response>>;
  /** Cache-Control for successful native QUERY responses. */
  cacheControl: string;
}

/** Endpoints that accept QUERY, keyed by path without the `/api` prefix. */
const queryRoutes: Record<string, QueryRoute> = {
  "/hash": {
    load: () => import("@/app/api/hash/route").then((m) => m.POST),
    // A digest never changes for the same input.
    cacheControl: "public, max-age=31536000, immutable",
  },
  "/docs": {
    load: () => import("@/lib/docs-api").then((m) => m.queryDocsHandler),
    // The playbook changes with each deploy, not each request.
    cacheControl: "public, max-age=300",
  },
};

function routeKey(pathname: string): string {
  return pathname.replace(/^\/api(?=\/)/, "").replace(/\/$/, "");
}

export function supportsQuery(pathname: string): boolean {
  return routeKey(pathname) in queryRoutes;
}

/** Headers that advertise QUERY on endpoints that support it. */
export function queryDiscoveryHeaders(pathname: string): Record<string, string> {
  return supportsQuery(pathname)
    ? { Allow: "POST, QUERY, OPTIONS", "Accept-Query": ACCEPT_QUERY }
    : {};
}

/**
 * Classify a request: a native QUERY, a POST overridden to QUERY, an invalid
 * override (400), or an ordinary request (null).
 */
export function queryKind(
  request: NextRequest,
): "native" | "override" | "invalid" | null {
  const override = request.headers.get(METHOD_OVERRIDE_HEADER);
  if (override !== null) {
    // The only override allowed is POST -> QUERY. Anything else could turn a
    // read into a write.
    return request.method === "POST" && override.trim().toUpperCase() === "QUERY"
      ? "override"
      : "invalid";
  }
  return request.method === "QUERY" ? "native" : null;
}

/** Serve a QUERY (native or overridden) through the endpoint's handler. */
export async function handleQuery(
  request: NextRequest,
  kind: "native" | "override",
): Promise<Response> {
  const route = queryRoutes[routeKey(request.nextUrl.pathname)];
  if (!route) {
    return errorResponse(405, "QUERY is not supported on this endpoint.");
  }

  const contentType = request.headers.get("content-type");
  if (!contentType) {
    return errorResponse(400, "QUERY requests must include a Content-Type.");
  }
  if (contentType.split(";")[0].trim().toLowerCase() !== ACCEPT_QUERY) {
    return errorResponse(415, `Unsupported query format. Use ${ACCEPT_QUERY}.`, {
      headers: { "Accept-Query": ACCEPT_QUERY },
    });
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).length > MAX_QUERY_BYTES) {
    return errorResponse(413, "QUERY content must not exceed 64 KB.");
  }

  const handler = await route.load();
  const response = await handler(
    new NextRequest(request.url, { method: "POST", headers: request.headers, body }),
  );

  const headers = new Headers(response.headers);
  // Intermediaries see an overridden request as a POST, so only the native
  // method's response is offered to caches.
  headers.set(
    "Cache-Control",
    kind === "native" && response.ok ? route.cacheControl : "private, no-store",
  );
  return new Response(response.body, { status: response.status, headers });
}
