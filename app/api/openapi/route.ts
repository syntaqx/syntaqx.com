import { CACHE, cacheableJson } from "@/lib/api";
import { generateOpenApiSpec } from "@/lib/openapi";

// Force route registration side effects
import "@/app/api/healthz/route";
import "@/app/api/uuid/route";
import "@/app/api/ip/route";
import "@/app/api/hash/route";
import "@/app/api/base64/route";
import "@/app/api/jwt/decode/route";
import "@/app/api/timestamp/route";
import "@/app/api/flaky/route";
import "@/app/api/random/route";
import "@/app/api/useragent/route";

export function GET(request: Request) {
  return cacheableJson(request, generateOpenApiSpec(), CACHE.public);
}
