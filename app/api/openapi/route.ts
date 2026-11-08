import { CACHE, cacheableJson } from "@/lib/api";
import { openApiSpec } from "@/lib/openapi-spec";

export function GET(request: Request) {
  return cacheableJson(request, openApiSpec(new URL(request.url).origin), CACHE.public);
}
