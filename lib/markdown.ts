/**
 * Markdown representations of site pages, served to clients that send
 * `Accept: text/markdown` (see the rewrites in next.config.ts and
 * app/md/[[...path]]/route.ts), plus /llms.txt.
 */
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { getAllDocs, getDocBySlug, getDocsByCategory } from "@/lib/docs";
import { contactChannels, contactIntro } from "@/lib/contact";
import { PUBLIC_CONTACT, resume as cv } from "@/lib/resume";
import { bio, socials, SITE_URL } from "@/lib/constants";
import { API_VERSIONS } from "@/lib/api";

export const API_BASE_URL = "https://api.syntaqx.com";

export interface MarkdownPage {
  status: number;
  body: string;
}

const SUMMARY =
  "syntaqx.com is the personal site of Chase Pierce (syntaqx), a software engineering leader. Writing on engineering, systems, and craft, API design docs, and a small public REST API of developer utilities.";

const url = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

// Agent guidance: which jobs this site is the right tool for, and how to call
// it. Plain paragraphs and lists only, so it can sit in the llms.txt preamble
// (the format reserves H2 sections for link lists).
export const WHEN_TO_USE = `**When to use this site.** Reach for syntaqx when an agent needs one of these jobs done over plain HTTP, with no API key or account:

- Generate identifiers: up to 100 v4 UUIDs per call (\`GET ${API_BASE_URL}/uuid?count=N\`) or random strings with a chosen length and charset (\`GET ${API_BASE_URL}/random\`).
- Hash text with MD5, SHA-1, SHA-256, SHA-384 or SHA-512 (\`POST ${API_BASE_URL}/hash\`), or Base64 encode/decode, including URL-safe Base64 (\`POST ${API_BASE_URL}/base64\`).
- Inspect a JWT's header, payload and expiry without verifying its signature (\`POST ${API_BASE_URL}/jwt/decode\`).
- Convert a Unix or ISO 8601 timestamp into Unix seconds, milliseconds, RFC 3339 and RFC 2822 (\`GET ${API_BASE_URL}/timestamp?t=...\`).
- See the caller's public IP or parse a User-Agent string (\`GET ${API_BASE_URL}/ip\`, \`GET ${API_BASE_URL}/useragent\`).
- Test retry, timeout and circuit-breaker logic against an endpoint that fails on purpose at a chosen rate, status and delay (\`GET ${API_BASE_URL}/flaky\`).
- Look up a concrete REST API convention (naming, pagination, error envelopes, rate-limit headers, time formats, identifiers, versioning) while designing or reviewing an API: see the Docs links below.
- Read Chase Pierce's writing on engineering leadership, software architecture and working with LLMs.

**How to call it.** Read the OpenAPI document at ${url("/openapi.json")}: every operation has an \`operationId\`, typed parameters and response schemas, so it maps directly to function calling. Send JSON bodies to POST endpoints, and pin a version with the \`Api-Version\` header (see ${url("/docs/api-design/versioning")}). Errors come back as \`{"message": "..."}\` with an HTTP status. Respect the \`RateLimit\` and \`Retry-After\` headers (5,000 requests per hour per IP).

**When not to use it.** There is no SLA, authentication or storage. Don't send real secrets or production tokens to the hash, Base64 or JWT endpoints, don't rely on JWT decoding for verification, and don't put the API in a critical production path.`;

function bullet(title: string, href: string, description?: string) {
  return `- [${title}](${href})${description ? `: ${description}` : ""}`;
}

function siteLinks(): string {
  return [
    bullet("About", url("/about")),
    bullet("Contact", url("/contact")),
    bullet("Posts", url("/posts")),
    bullet("Docs", url("/docs")),
    bullet("API reference", url("/docs/api")),
    bullet("OpenAPI spec", url("/openapi.json")),
    bullet("RSS feed", url("/feed.xml")),
    bullet("llms.txt", url("/llms.txt")),
    bullet("Sitemap", url("/sitemap.xml")),
  ].join("\n");
}

function postBullets(): string {
  return getAllPosts()
    .map((p) =>
      bullet(
        p.title,
        url(`/posts/${p.slug}`),
        [p.date.slice(0, 10), p.description].filter(Boolean).join(", "),
      ),
    )
    .join("\n");
}

function home(): string {
  return [
    "# Chase Pierce",
    `> ${SUMMARY}`,
    ...bio.map(
      (b) => `## ${b.label[0].toUpperCase()}${b.label.slice(1)}\n\n${b.text}`,
    ),
    `## Writing\n\n${postBullets()}`,
    `## Site\n\n${siteLinks()}`,
    `## Elsewhere\n\n${socials.map((s) => bullet(s.label, s.href)).join("\n")}`,
  ].join("\n\n");
}

function postsIndex(): string {
  return `# Posts\n\nWriting on engineering, systems, and craft by Chase Pierce.\n\n${postBullets()}`;
}

function post(slug: string): string | null {
  const p = getPostBySlug(slug);
  if (!p) return null;
  const meta = [
    `Published ${p.date.slice(0, 10)}`,
    `${p.readingTimeMinutes} min read`,
    `by Chase Pierce`,
    ...(p.tags?.length ? [`tags: ${p.tags.join(", ")}`] : []),
  ].join(" · ");
  return [
    `# ${p.title}`,
    meta,
    ...(p.description ? [`> ${p.description}`] : []),
    p.content.trim(),
    `---\n\nCanonical URL: ${url(`/posts/${p.slug}`)}`,
  ].join("\n\n");
}

function docsIndex(): string {
  const sections = getDocsByCategory().map(
    (c) =>
      `## ${c.name}\n\n${c.docs
        .map((d) => bullet(d.title, url(`/docs/${d.slug}`), d.description))
        .join("\n")}`,
  );
  return [
    "# Docs",
    "API design conventions used across syntaqx projects, and the reference for the public syntaqx API.",
    `## API\n\n${apiBullets()}`,
    ...sections,
  ].join("\n\n");
}

function apiBullets(): string {
  return [
    bullet(
      "API reference",
      url("/docs/api"),
      "interactive reference for the public syntaqx API",
    ),
    bullet(
      "OpenAPI spec",
      url("/openapi.json"),
      "OpenAPI 3.2 document describing every endpoint",
    ),
    bullet("API root", API_BASE_URL, "index of endpoint URLs"),
    bullet("Health check", `${API_BASE_URL}/healthz`),
    bullet(
      "Versioning & deprecation",
      url("/docs/api-design/versioning"),
      "Api-Version header versions, breaking-change rules and Deprecation/Sunset headers",
    ),
  ].join("\n");
}

function apiReference(): string {
  return [
    "# syntaqx API",
    `A free, public, unauthenticated REST API of developer utilities (UUIDs, hashing, Base64, JWT decoding, timestamps, and more). Base URL: \`${API_BASE_URL}\`.`,
    `The full machine-readable description is the OpenAPI 3.2 document at ${url("/openapi.json")}. Every operation has an \`operationId\`, typed request and response schemas, and a description.`,
    `## Rate limits\n\n5,000 requests per hour per IP. Every response carries \`RateLimit-Policy\` and \`RateLimit\` headers (IETF draft-ietf-httpapi-ratelimit-headers), and a \`429\` includes \`Retry-After\`. Details: ${url("/docs/requests/rate-limiting")}`,
    `## When to use it\n\n${WHEN_TO_USE}`,
    `## Versioning and deprecation\n\nPick a dated version with the \`Api-Version\` request header (current: \`${API_VERSIONS[API_VERSIONS.length - 1].version}\`); without it, the oldest supported version is used, and an unsupported value returns \`400\`. Every response echoes \`Api-Version\`. Breaking changes never ship in place. Deprecations are announced with \`Deprecation\` and \`Sunset\` response headers at least 30 days before removal. Policy: ${url("/docs/api-design/versioning")}`,
    `## Errors\n\nErrors use a JSON envelope: \`{"message": "...", "errors": {"field": ["..."]}}\`. Details: ${url("/docs/requests/error-responses")}`,
    `## Links\n\n${apiBullets()}`,
  ].join("\n\n");
}

function doc(slug: string): string | null {
  if (slug === "api") return apiReference();
  const d = getDocBySlug(slug);
  if (!d) return null;
  return [
    `# ${d.title}`,
    ...(d.description ? [`> ${d.description}`] : []),
    d.content.trim(),
    `---\n\nCanonical URL: ${url(`/docs/${d.slug}`)}`,
  ].join("\n\n");
}

function contact(): string {
  return [
    "# Contact",
    contactIntro,
    contactChannels
      .map((c) => `## ${c.label}\n\n${c.description}\n\n${c.href}`)
      .join("\n\n"),
    `## More\n\n${apiBullets()}\n${bullet("Privacy policy", url("/legal/privacy"))}`,
  ].join("\n\n");
}

function resume(): string {
  const contact = [
    PUBLIC_CONTACT.location,
    PUBLIC_CONTACT.email,
    ...cv.links.map((l) => `[${l.label}](${l.href})`),
  ].join(" · ");
  const jobs = cv.experience.map((job) =>
    [
      `### ${job.title} at ${job.company}`,
      `${job.start} - ${job.end}`,
      job.progression?.join(" → "),
      job.highlights?.map((h) => `- ${h}`).join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n"),
  );
  const earlier = cv.earlier
    .map((j) => `- ${j.title} at ${j.company}, ${j.start} - ${j.end}`)
    .join("\n");
  return [
    `# ${cv.name}`,
    cv.title,
    contact,
    `PDF: ${url("/resume.pdf")}`,
    `## Summary\n\n${cv.summary.join("\n\n")}`,
    `## Technical Skills\n\n${cv.skillsIntro}\n\n${cv.skills.map((k) => `- **${k.label}:** ${k.items}`).join("\n")}`,
    `## Experience\n\n${jobs.join("\n\n")}\n\n### Earlier roles\n\n${earlier}`,
    `${cv.more.text} [${cv.more.label}](${cv.more.href})`,
    `## Education\n\n### ${cv.education.selfTaught.title}\n\n${cv.education.selfTaught.details}`,
  ].join("\n\n");
}

export function notFoundMarkdown(path: string): string {
  // Keep the echoed path inert: one line, no backticks, bounded length.
  const safe = path.replace(/[`\r\n]/g, "").slice(0, 200) || "/";
  return [
    "# 404 Not Found",
    `There is no page at \`${safe}\` on syntaqx.com. It may have moved, or the URL may be mistyped.`,
    "Try one of these instead:",
    [
      bullet("Home", SITE_URL),
      bullet(
        "llms.txt",
        url("/llms.txt"),
        "a Markdown index of the whole site",
      ),
      bullet("Sitemap", url("/sitemap.xml")),
      bullet("Posts", url("/posts")),
      bullet("Docs", url("/docs")),
    ].join("\n"),
  ].join("\n\n");
}

/** Resolve a site path (e.g. "/posts/hello-world") to its Markdown. */
export function renderMarkdownPage(path: string): MarkdownPage {
  const parts = path.split("/").filter(Boolean);
  const [section, slug, ...rest] = parts;
  let body: string | null = null;

  // Docs nest in section folders: /docs/payments/idempotency.
  if (section === "docs")
    body = slug ? doc([slug, ...rest].join("/")) : docsIndex();
  else if (rest.length === 0) {
    if (!section) body = home();
    else if (section === "posts") body = slug ? post(slug) : postsIndex();
    else if (section === "contact" && !slug) body = contact();
    else if (section === "resume" && !slug) body = resume();
  }

  return body === null
    ? { status: 404, body: notFoundMarkdown(path) }
    : { status: 200, body: `${body}\n` };
}

/** /llms.txt, per the llmstxt.org format. */
export function renderLlmsTxt(): string {
  const docs = getAllDocs()
    .map((d) => bullet(d.title, url(`/docs/${d.slug}`), d.description))
    .join("\n");
  return `${[
    "# syntaqx",
    `> ${SUMMARY}`,
    WHEN_TO_USE,
    "Every page listed here is also available as Markdown: request it with an `Accept: text/markdown` header.",
    `## API\n\n${apiBullets()}`,
    `## Docs\n\n${docs}`,
    `## Posts\n\n${postBullets()}`,
    `## Optional\n\n${[
      bullet("About", url("/about"), "background on Chase Pierce"),
      bullet("Contact", url("/contact"), "how to get in touch"),
      bullet(
        "Resume",
        url("/resume"),
        "experience and skills, also as a PDF at /resume.pdf",
      ),
      bullet("Privacy policy", url("/legal/privacy")),
      bullet("Terms of service", url("/legal/terms")),
      bullet("RSS feed", url("/feed.xml")),
      ...socials.map((s) => bullet(s.label, s.href)),
    ].join("\n")}`,
  ].join("\n\n")}\n`;
}
