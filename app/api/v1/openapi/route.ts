import { generateOpenApiSpec } from "@/lib/openapi";

// Force route registration side effects
import "@/app/api/v1/healthz/route";

export function GET() {
  const spec = generateOpenApiSpec();
  return Response.json(spec);
}
