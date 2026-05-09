import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Production: api.syntaqx.com root → API index
  if (host.startsWith("api.") && (pathname === "/" || pathname === "")) {
    const baseUrl = "https://api.syntaqx.com/v1";
    return Response.json(
      {
        healthz_url: `${baseUrl}/healthz`,
        openapi_url: `${baseUrl}/openapi`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": crypto.randomUUID(),
        },
      },
    );
  }

  // Production: api.syntaqx.com/v1/* → /api/v1/*
  if (host.startsWith("api.") && pathname.startsWith("/v1")) {
    const url = request.nextUrl.clone();
    url.pathname = `/api${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("X-Request-ID", crypto.randomUUID());
    response.headers.set("Content-Type", "application/json");
    return response;
  }

  // Block non-API traffic on the api subdomain
  if (host.startsWith("api.")) {
    return Response.json(
      { message: "Not found." },
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  // Development / main domain: /api/v1/* passes through with API headers
  if (pathname.startsWith("/api/v1")) {
    const response = NextResponse.next();
    response.headers.set("X-Request-ID", crypto.randomUUID());
    response.headers.set("Content-Type", "application/json");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/v1/:path*", "/v1/:path*"],
};
