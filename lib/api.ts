/**
 * Shared API response utilities.
 *
 * All /api routes should use these helpers to ensure consistent JSON
 * responses and the normalized error envelope.
 */

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

/** Return a JSON success response. */
export function json<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, init);
}

/** Return a normalized JSON error response. */
export function errorResponse(
  status: number,
  message: string,
  options?: { errors?: Record<string, string[]> },
): Response {
  const body: ApiErrorBody = {
    message,
    ...(options?.errors && { errors: options.errors }),
  };
  return Response.json(body, { status });
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
const MAX_REQUESTS = 5000;

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
    "X-RateLimit-Limit": String(MAX_REQUESTS),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(entry.reset),
  };

  if (limited) {
    headers["Retry-After"] = String(entry.reset - now);
  }

  return { limited, limit: MAX_REQUESTS, remaining, reset: entry.reset, headers };
}
