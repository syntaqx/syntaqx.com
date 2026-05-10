import { generateOpenApiSpec } from "@/lib/openapi";

// Force route registration side effects
import "@/app/api/v1/healthz/route";
import "@/app/api/v1/uuid/route";
import "@/app/api/v1/ip/route";
import "@/app/api/v1/hash/route";
import "@/app/api/v1/base64/route";
import "@/app/api/v1/jwt/decode/route";
import "@/app/api/v1/timestamp/route";
import "@/app/api/v1/flaky/route";
import "@/app/api/v1/random/route";
import "@/app/api/v1/useragent/route";

export function GET() {
  const spec = generateOpenApiSpec();
  return Response.json(spec, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
