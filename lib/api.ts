/**
 * Shared API response utilities.
 *
 * All /api routes should use these helpers to ensure consistent JSON
 * responses and the normalized error envelope.
 */

import { uuidv7 } from "@/lib/uuid";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Response builders
// ---------------------------------------------------------------------------

/** `Request-Id`, plus its legacy `X-Request-ID` alias, sharing one UUID v7. */
export function requestIdHeaders(id: string = uuidv7()): Record<string, string> {
  return { "Request-Id": id, "X-Request-ID": id };
}

function withRequestId(headers: Headers): Headers {
  if (!headers.has("Request-Id")) {
    for (const [k, v] of Object.entries(requestIdHeaders())) headers.set(k, v);
  }
  return headers;
}

/** Return a JSON success response. */
export function json<T>(data: T, init?: ResponseInit): Response {
  const headers = withRequestId(new Headers(init?.headers));
  return Response.json(data, { ...init, headers });
}

/** Return a normalized JSON error response. */
export function errorResponse(
  status: number,
  message: string,
  options?: { errors?: Record<string, string[]>; headers?: Record<string, string> },
): Response {
  const body: ApiErrorBody = {
    message,
    ...(options?.errors && { errors: options.errors }),
  };
  const headers = withRequestId(new Headers(options?.headers));
  return Response.json(body, { status, headers });
}

// ---------------------------------------------------------------------------
// In-memory rate limiter (per-instance, resets on deploy)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  reset: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_SECONDS = 3600; // 1 hour
const RATE_LIMIT_POLICY = "hourly";

/**
 * Per-IP request ceiling per window.
 *
 * Production defaults to the documented 5,000/hr. In any non-production
 * environment (dev, test, preview) we bump this to a stupidly high number
 * so local hammering — manual testing, hot-reload re-fetches, scripted
 * sweeps — never trips the limiter. Override at runtime with
 * `API_RATE_LIMIT_MAX`.
 */
const MAX_REQUESTS = (() => {
  const override = Number(process.env.API_RATE_LIMIT_MAX);
  if (Number.isFinite(override) && override > 0) return override;
  return process.env.NODE_ENV === "production" ? 5000 : 1_000_000;
})();

/** Prune expired entries periodically to avoid unbounded growth. */
function prune(now: number) {
  for (const [key, entry] of store) {
    if (now >= entry.reset) store.delete(key);
  }
}

export interface RateLimitResult {
  limited: boolean;
  limit: number;
  remaining: number;
  reset: number;
  headers: Record<string, string>;
}

/** Check rate limit for a given key (typically IP). */
export function rateLimit(key: string): RateLimitResult {
  const now = Math.floor(Date.now() / 1000);

  // Prune roughly every 100 calls to keep the map tidy
  if (store.size > 1000) prune(now);

  let entry = store.get(key);
  if (!entry || now >= entry.reset) {
    entry = { count: 0, reset: now + WINDOW_SECONDS };
    store.set(key, entry);
  }
  entry.count++;

  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  const limited = entry.count > MAX_REQUESTS;

  const headers: Record<string, string> = {
    // IETF draft-ietf-httpapi-ratelimit-headers (Structured Fields).
    "RateLimit-Policy": `"${RATE_LIMIT_POLICY}";q=${MAX_REQUESTS};w=${WINDOW_SECONDS}`,
    RateLimit: `"${RATE_LIMIT_POLICY}";r=${remaining};t=${entry.reset - now}`,
    // Legacy X-RateLimit-* kept for existing clients.
    "X-RateLimit-Limit": String(MAX_REQUESTS),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(entry.reset),
  };

  if (limited) {
    headers["Retry-After"] = String(entry.reset - now);
  }

  return { limited, limit: MAX_REQUESTS, remaining, reset: entry.reset, headers };
}

// ---------------------------------------------------------------------------
// API versioning (see content/docs/versioning.md)
// ---------------------------------------------------------------------------

export interface ApiVersion {
  /** Release date, YYYY-MM-DD. Also the value clients send. */
  version: string;
  /** Set when deprecated: the Deprecation and Sunset dates (ISO 8601). */
  deprecatedAt?: string;
  sunsetAt?: string;
}

/** Every dated version, oldest first. */
export const API_VERSIONS: ApiVersion[] = [{ version: "2026-10-22" }];

const VERSION_POLICY_URL = "https://www.syntaqx.com/docs/versioning";

export type ApiVersionResult =
  | { ok: true; version: string; headers: Record<string, string> }
  | { ok: false; body: ApiErrorBody };

/**
 * Resolve the `Api-Version` request header. A missing header gets the oldest
 * supported version; an unknown or sunset version is rejected. Deprecated
 * versions still serve, with Deprecation (RFC 9745), Sunset (RFC 8594) and
 * Link rel="deprecation" headers.
 */
export function resolveApiVersion(
  requested: string | null,
  now: Date = new Date(),
  versions: ApiVersion[] = API_VERSIONS,
): ApiVersionResult {
  const supported = versions.filter(
    (v) => !v.sunsetAt || now < new Date(v.sunsetAt),
  );
  const match = requested
    ? supported.find((v) => v.version === requested.trim())
    : supported[0];

  if (!match) {
    const list = supported.map((v) => v.version);
    return {
      ok: false,
      body: {
        message: `Unsupported Api-Version "${requested}". Supported versions: ${list.join(", ")}.`,
        errors: { "Api-Version": [`must be one of: ${list.join(", ")}`] },
      },
    };
  }

  const headers: Record<string, string> = {
    "Api-Version": match.version,
    Vary: "Api-Version",
  };
  if (match.deprecatedAt) {
    headers.Deprecation = `@${Math.floor(Date.parse(match.deprecatedAt) / 1000)}`;
    headers.Link = `<${VERSION_POLICY_URL}>; rel="deprecation"`;
    if (match.sunsetAt) {
      headers.Sunset = new Date(match.sunsetAt).toUTCString();
    }
  }
  return { ok: true, version: match.version, headers };
}
