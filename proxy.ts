import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, requestIdHeaders, resolveApiVersion } from "@/lib/api";
import { uuidv7 } from "@/lib/uuid";

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Api-Version",
    "Access-Control-Expose-Headers":
      "Api-Version, Deprecation, Sunset, Link, RateLimit, RateLimit-Policy, Retry-After, Request-Id, X-Request-ID",
  };
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

/**
 * Apply per-request API headers required by the API design docs:
 *   - Request-Id (UUID v7), plus the legacy X-Request-ID alias
 *   - X-RateLimit-Limit / -Remaining / -Reset
 *   - RateLimit-Policy / RateLimit (IETF draft-ietf-httpapi-ratelimit-headers)
 *   - Retry-After (when limited)
 *   - Api-Version / Vary, plus Deprecation / Sunset / Link for deprecated
 *     versions; an unknown Api-Version short-circuits with a 400
 *
 * Returns either a short-circuit response (429 rate limited, 400 bad
 * Api-Version), or a header bag to merge
 * into the downstream response.
 */
function applyApiHeaders(
  request: NextRequest,
): { blocked: true; response: Response } | { blocked: false; headers: Record<string, string> } {
  const rl = rateLimit(clientIp(request));
  const requestId = uuidv7();

  if (rl.limited) {
    return {
      blocked: true,
      response: Response.json(
        { message: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...requestIdHeaders(requestId),
            ...rl.headers,
            ...corsHeaders(),
          },
        },
      ),
    };
  }

  const version = resolveApiVersion(request.headers.get("api-version"));
  if (!version.ok) {
    return {
      blocked: true,
      response: Response.json(version.body, {
        status: 400,
        headers: {
          ...requestIdHeaders(requestId),
          ...rl.headers,
          ...corsHeaders(),
        },
      }),
    };
  }

  return {
    blocked: false,
    headers: {
      ...requestIdHeaders(requestId),
      ...rl.headers,
      ...version.headers,
    },
  };
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;
  const isApiSubdomain = host.startsWith("api.");
  const isApiPath = pathname.startsWith("/api") || isApiSubdomain;

  // Handle CORS preflight for API routes
  if (request.method === "OPTIONS" && isApiPath) {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // All API traffic from here on is rate-limited and gets a Request-Id.
  if (!isApiPath) {
    return NextResponse.next();
  }

  const result = applyApiHeaders(request);
  if (result.blocked) return result.response;
  const apiHeaders = result.headers;

  // Production: api.syntaqx.com root → /api (single source of truth for the index)
  // Production: api.syntaqx.com/v1/* → /api/v1/*
  if (isApiSubdomain && (pathname === "/" || pathname === "" || pathname.startsWith("/v1"))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/v1") ? `/api${pathname}` : "/api";
    const response = NextResponse.rewrite(url);
    for (const [k, v] of Object.entries({ ...apiHeaders, ...corsHeaders() })) {
      response.headers.set(k, v);
    }
    return response;
  }

  // Block non-API traffic on the api subdomain
  if (isApiSubdomain) {
    return Response.json(
      { message: "Not found." },
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...apiHeaders,
          ...corsHeaders(),
        },
      },
    );
  }

  // Main domain: any /api/* request — attach API headers and pass through.
  const response = NextResponse.next();
  for (const [k, v] of Object.entries(apiHeaders)) {
    response.headers.set(k, v);
  }
  if (pathname.startsWith("/api/v1")) {
    for (const [k, v] of Object.entries(corsHeaders())) {
      response.headers.set(k, v);
    }
  }
  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/v1/:path*",
    // Match root only on api subdomain — uses has condition to avoid
    // intercepting the main site homepage or Vercel preview bots.
    { source: "/", has: [{ type: "host", value: "api.syntaqx.com" }] },
  ],
};
