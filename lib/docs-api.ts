/**
 * The playbook as an API resource: GET /docs (filter, sort, cursor
 * pagination), GET /docs/{slug}, and QUERY /docs with the same parameters as
 * a JSON body. It exists to show the request and response docs working for
 * real: /docs/requests/{pagination,filtering-and-sorting,http-query,caching}.
 */

import { getAllDocs, type DocData } from "@/lib/docs";
import { CACHE, cacheableJson, errorResponse } from "@/lib/api";

const SITE = "https://www.syntaqx.com";
const SORTABLE = ["position", "title"] as const;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export interface DocSummary {
  slug: string;
  url: string;
  title: string;
  description: string;
  section: string;
  category: string;
  tags: string[];
  position: number;
}

export interface DocResource extends DocSummary {
  /** The doc's Markdown body. */
  content: string;
}

export interface DocsQuery {
  section: string[];
  tag: string[];
  q: string;
  sort: string;
  limit: number;
  cursor: string | null;
}

type Errors = Record<string, string[]>;

function summary(doc: DocData, position: number): DocSummary {
  return {
    slug: doc.slug,
    url: `${SITE}/docs/${doc.slug}`,
    title: doc.title,
    description: doc.description,
    section: doc.section || "start-here",
    category: doc.category,
    tags: doc.tags,
    position,
  };
}

/** Every doc in playbook order, numbered from 1. */
function allSummaries(): DocSummary[] {
  return getAllDocs().map((doc, i) => summary(doc, i + 1));
}

export function getDocResource(slug: string): DocResource | null {
  const docs = getAllDocs();
  const index = docs.findIndex((d) => d.slug === slug);
  if (index === -1) return null;
  return { ...summary(docs[index], index + 1), content: docs[index].content.trim() };
}

const list = (value: unknown): string[] =>
  (Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [])
    .map((v) => String(v).trim())
    .filter(Boolean);

/**
 * Validate raw parameters (from a query string or a QUERY body) into a query.
 * Unknown parameters are rejected, not ignored: a typo like `secton=payments`
 * silently returning everything is worse than an error.
 */
export function parseDocsQuery(raw: Record<string, unknown>): { query: DocsQuery } | { errors: Errors } {
  const errors: Errors = {};
  const known = new Set(["section", "tag", "q", "sort", "limit", "cursor"]);
  for (const key of Object.keys(raw)) {
    if (!known.has(key)) errors[key] = [`${key} is not a filterable or sortable parameter.`];
  }

  const sort = raw.sort === undefined ? "position" : String(raw.sort);
  const sortField = sort.replace(/^-/, "");
  if (!(SORTABLE as readonly string[]).includes(sortField)) {
    errors.sort = [`sort must be one of: ${SORTABLE.join(", ")} (prefix with - for descending).`];
  }

  const limit = raw.limit === undefined ? DEFAULT_LIMIT : Number(raw.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    errors.limit = [`limit must be an integer between 1 and ${MAX_LIMIT}.`];
  }

  if (Object.keys(errors).length) return { errors };
  return {
    query: {
      section: list(raw.section),
      tag: list(raw.tag),
      q: typeof raw.q === "string" ? raw.q.trim() : "",
      sort,
      limit,
      cursor: typeof raw.cursor === "string" && raw.cursor ? raw.cursor : null,
    },
  };
}

/** What a cursor is only valid with: the filters and sort that produced it. */
function fingerprint(query: DocsQuery): string {
  return JSON.stringify([query.section, query.tag, query.q, query.sort]);
}

const encodeCursor = (after: string, query: DocsQuery) =>
  Buffer.from(JSON.stringify({ after, f: fingerprint(query) })).toString("base64url");

function decodeCursor(cursor: string, query: DocsQuery): string | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      after?: unknown;
      f?: unknown;
    };
    return typeof parsed.after === "string" && parsed.f === fingerprint(query) ? parsed.after : null;
  } catch {
    return null;
  }
}

/** Run a query: filter, sort (slug as the tiebreaker), then page after the cursor. */
export function runDocsQuery(query: DocsQuery): { items: DocSummary[]; next: string | null } | { errors: Errors } {
  const q = query.q.toLowerCase();
  const field = query.sort.replace(/^-/, "") as (typeof SORTABLE)[number];
  const direction = query.sort.startsWith("-") ? -1 : 1;

  const matching = allSummaries()
    .filter((d) => !query.section.length || query.section.includes(d.section))
    .filter((d) => !query.tag.length || d.tags.some((t) => query.tag.includes(t)))
    .filter((d) => !q || `${d.title} ${d.description}`.toLowerCase().includes(q))
    .sort((a, b) => {
      const order = field === "title" ? a.title.localeCompare(b.title) : a.position - b.position;
      return order * direction || a.slug.localeCompare(b.slug);
    });

  let start = 0;
  if (query.cursor) {
    const after = decodeCursor(query.cursor, query);
    const index = after === null ? -1 : matching.findIndex((d) => d.slug === after);
    if (index === -1) {
      return { errors: { cursor: ["cursor is invalid, or was issued for different filters or sort."] } };
    }
    start = index + 1;
  }

  const items = matching.slice(start, start + query.limit);
  const more = start + query.limit < matching.length;
  return { items, next: more ? encodeCursor(items[items.length - 1].slug, query) : null };
}

/** The URL a client would GET for this query, for Link headers. */
function queryUrl(base: string, query: DocsQuery, cursor: string): string {
  const params = new URLSearchParams();
  if (query.section.length) params.set("section", query.section.join(","));
  if (query.tag.length) params.set("tag", query.tag.join(","));
  if (query.q) params.set("q", query.q);
  if (query.sort !== "position") params.set("sort", query.sort);
  if (query.limit !== DEFAULT_LIMIT) params.set("limit", String(query.limit));
  params.set("cursor", cursor);
  return `${base}?${params}`;
}

/** Where clients reach the list: the API subdomain's root, or /api on the site. */
export function docsBaseUrl(request: Request): string {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("api.")) return `https://${host}/docs`;
  return `${new URL(request.url).origin}/api/docs`;
}

/** Shared by GET (query string) and QUERY (JSON body). */
export async function respondToDocsQuery(request: Request, raw: Record<string, unknown>): Promise<Response> {
  const parsed = parseDocsQuery(raw);
  if ("errors" in parsed) {
    return errorResponse(422, "The given data was invalid.", { errors: parsed.errors });
  }
  const result = runDocsQuery(parsed.query);
  if ("errors" in result) {
    return errorResponse(422, "The given data was invalid.", { errors: result.errors });
  }

  const headers: Record<string, string> = {};
  if (result.next) {
    headers.Link = `<${queryUrl(docsBaseUrl(request), parsed.query, result.next)}>; rel="next"`;
  }
  return cacheableJson(request, result.items, CACHE.public, headers);
}

/** QUERY /docs: the same parameters, as a JSON body. */
export async function queryDocsHandler(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Request body must be valid JSON.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse(400, "Request body must be a JSON object.");
  }
  return respondToDocsQuery(request, body as Record<string, unknown>);
}
