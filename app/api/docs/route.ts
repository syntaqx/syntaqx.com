import { z } from "zod";
import { registry } from "@/lib/openapi";
import { respondToDocsQuery } from "@/lib/docs-api";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const DocSummary = z
  .object({
    slug: z.string().openapi({ example: "payments/idempotency" }),
    url: z.string().url().openapi({ example: "https://www.syntaqx.com/docs/payments/idempotency" }),
    title: z.string().openapi({ example: "Idempotency" }),
    description: z.string(),
    section: z.string().openapi({ example: "payments" }),
    category: z.string().openapi({ example: "Payments" }),
    tags: z.array(z.string()),
    position: z.number().int().openapi({ description: "Position in the playbook's reading order, from 1" }),
  })
  .openapi("DocSummary");

const DocsQueryBody = z
  .object({
    section: z.array(z.string()).optional().openapi({ description: "Any of these sections", example: ["payments"] }),
    tag: z.array(z.string()).optional().openapi({ description: "Docs with any of these tags" }),
    q: z.string().optional().openapi({ description: "Free text over title and description" }),
    sort: z.enum(["position", "-position", "title", "-title"]).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    cursor: z.string().optional().openapi({ description: "Opaque cursor from a previous response's Link header" }),
  })
  .openapi("DocsQuery");

const errorDoc = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

const listResult = {
  description:
    "Matching docs, as a bare array. When there are more, the `Link` header has a `rel=\"next\"` URL; follow it as-is.",
  content: { "application/json": { schema: z.array(DocSummary) } },
};

registry.registerPath({
  method: "get",
  path: "/docs",
  operationId: "listDocs",
  summary: "List the playbook's docs",
  description:
    "The playbook as data, and a working example of its own request docs: filters (`section`, `tag`, comma-separated means any of), free text `q`, `sort` (`position` default or `title`, `-` for descending), cursor pagination through the `Link` header (`limit` 1 to 100, default 25), and ETags. Unknown parameters, an over-the-limit `limit`, or a cursor reused with different filters return 422. See https://www.syntaqx.com/docs/requests/pagination and https://www.syntaqx.com/docs/requests/filtering-and-sorting.",
  tags: ["Playbook"],
  request: {
    query: z.object({
      section: z.string().optional().openapi({ example: "payments,security" }),
      tag: z.string().optional().openapi({ example: "idempotency" }),
      q: z.string().optional().openapi({ example: "retry" }),
      sort: z.string().optional().openapi({ example: "-title" }),
      limit: z.string().optional().openapi({ example: "10" }),
      cursor: z.string().optional(),
    }),
  },
  responses: {
    200: listResult,
    304: { description: "Not modified (If-None-Match matched); doesn't count against the rate limit" },
    422: errorDoc("Unknown parameter, invalid sort or limit, or a cursor from different filters"),
    429: errorDoc("Rate limited"),
  },
});

registry.registerPath({
  method: "query",
  path: "/docs",
  operationId: "queryDocs",
  summary: "Query the playbook's docs with QUERY",
  description:
    "The same filters as GET /docs, sent as a JSON body with the HTTP QUERY method (RFC 10008), so long or structured filters stay out of the URL. The `Link` header's next page is the equivalent GET URL. See https://www.syntaqx.com/docs/requests/http-query.",
  tags: ["Playbook"],
  request: { body: { required: true, content: { "application/json": { schema: DocsQueryBody } } } },
  responses: {
    200: listResult,
    400: errorDoc("Missing Content-Type, or malformed JSON"),
    415: errorDoc("Unsupported query format; see the Accept-Query header"),
    422: errorDoc("Unknown parameter, invalid sort or limit, or a cursor from different filters"),
    429: errorDoc("Rate limited"),
  },
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export function GET(request: NextRequest) {
  return respondToDocsQuery(request, Object.fromEntries(request.nextUrl.searchParams));
}
