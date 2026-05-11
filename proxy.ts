import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api";

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

/**
 * Apply per-request API headers required by the API design docs:
 *   - X-Request-ID (RFC-style trace identifier)
 *   - X-RateLimit-Limit / -Remaining / -Reset
 *   - Retry-After (when limited)
 *
 * Returns either a short-circuit 429 response, or a header bag to merge
 * into the downstream response.
 */
function applyApiHeaders(
  request: NextRequest,
): { limited: true; response: Response } | { limited: false; headers: Record<string, string> } {
  const rl = rateLimit(clientIp(request));
  const requestId = crypto.randomUUID();

  if (rl.limited) {
    return {
      limited: true,
      response: Response.json(
        { message: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": requestId,
            ...rl.headers,
            ...corsHeaders(),
          },
        },
      ),
    };
  }

  return {
    limited: false,
    headers: {
      "X-Request-ID": requestId,
      ...rl.headers,
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

  // All API traffic from here on is rate-limited and gets an X-Request-ID.
  if (!isApiPath) {
    return NextResponse.next();
  }

  const result = applyApiHeaders(request);
  if (result.limited) return result.response;
  const apiHeaders = result.headers;

  // Production: api.syntaqx.com root → API index
  if (isApiSubdomain && (pathname === "/" || pathname === "")) {
    const baseUrl = "https://api.syntaqx.com/v1";
    return Response.json(
      {
        healthz_url: `${baseUrl}/healthz`,
        openapi_url: `${baseUrl}/openapi`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...apiHeaders,
          ...corsHeaders(),
        },
      },
    );
  }

  // Production: api.syntaqx.com/v1/* → /api/v1/*
  if (isApiSubdomain && pathname.startsWith("/v1")) {
    const url = request.nextUrl.clone();
    url.pathname = `/api${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("Content-Type", "application/json");
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
    response.headers.set("Content-Type", "application/json");
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
