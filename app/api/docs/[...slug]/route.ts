import { z } from "zod";
import { CACHE, cacheableJson, errorResponse } from "@/lib/api";
import { registry } from "@/lib/openapi";
import { getDocResource } from "@/lib/docs-api";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const DocResource = z
  .object({
    slug: z.string().openapi({ example: "payments/idempotency" }),
    url: z.string().url(),
    title: z.string(),
    description: z.string(),
    section: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    position: z.number().int(),
    content: z.string().openapi({ description: "The doc's Markdown body" }),
  })
  .openapi("Doc");

registry.registerPath({
  method: "get",
  path: "/docs/{slug}",
  operationId: "getDoc",
  summary: "Get one doc",
  description:
    "One doc with its Markdown body. The slug is the doc's path under /docs and usually has two parts, like `payments/idempotency`.",
  tags: ["Playbook"],
  request: {
    params: z.object({
      slug: z.string().openapi({ example: "payments/idempotency" }),
    }),
  },
  responses: {
    200: { description: "The doc", content: { "application/json": { schema: DocResource } } },
    304: { description: "Not modified (If-None-Match matched)" },
    404: {
      description: "No doc at that slug",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
  },
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const slug = (await params).slug.join("/");
  const doc = getDocResource(slug);
  if (!doc) return errorResponse(404, "No doc at that slug.");
  return cacheableJson(request, doc, CACHE.public);
}
