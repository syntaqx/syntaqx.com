/**
 * The OpenAPI document with every route registered. Routes register their
 * operations as a side effect of being imported, so this imports them all;
 * the /api/openapi route and the /docs/api page both build the spec here.
 */
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
import "@/app/api/docs/route";
import "@/app/api/docs/[...slug]/route";
import "@/app/api/echo/route";
import "@/app/api/secrets/route";
import "@/app/api/secrets/[id]/route";

export const openApiSpec = generateOpenApiSpec;
