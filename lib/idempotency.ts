/**
 * Idempotency-Key handling, per /docs/payments/idempotency.
 *
 * The first request with a key claims it (`in_progress`), runs, and stores
 * its response (`completed`) for 24 hours. A retry with the same key and the
 * same request replays that response; one with a different request is a
 * client bug (400); one that arrives while the first is still running is a
 * 409. Keys are scoped per client, here the IP, since the API has no accounts.
 *
 * Unlike rate limiting, this fails closed. A rate limiter that can't reach
 * Redis gets looser for a while; an idempotency layer that can't reach it
 * could run a write twice, which is the one thing it exists to prevent.
 */

import { Redis } from "@upstash/redis";
import { redisCredentials } from "@/lib/ratelimit";

export const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
export const REPLAYED_HEADER = "Idempotent-Replayed";
const MAX_KEY_LENGTH = 255;
const RETENTION_SECONDS = 24 * 60 * 60;
const PREFIX = "syntaqx:idempotency:";

export interface StoredResponse {
  status: number;
  body: string;
  contentType: string;
}

interface KeyRecord {
  fingerprint: string;
  status: "in_progress" | "completed";
  response?: StoredResponse;
}

export type Claim =
  | { kind: "new" }
  | { kind: "in_progress" }
  | { kind: "mismatch" }
  | { kind: "completed"; response: StoredResponse };

export interface IdempotencyStore {
  /** Claim a key for a request, or report what already holds it. */
  claim(key: string, fingerprint: string): Promise<Claim>;
  /** Store the response for a claimed key. */
  complete(key: string, fingerprint: string, response: StoredResponse): Promise<void>;
}

function classify(record: KeyRecord, fingerprint: string): Claim {
  if (record.fingerprint !== fingerprint) return { kind: "mismatch" };
  if (record.status === "completed" && record.response) {
    return { kind: "completed", response: record.response };
  }
  return { kind: "in_progress" };
}

export function memoryIdempotencyStore(): IdempotencyStore {
  const records = new Map<string, { record: KeyRecord; expires: number }>();
  const live = (key: string) => {
    const entry = records.get(key);
    if (entry && entry.expires > Date.now()) return entry.record;
    records.delete(key);
    return undefined;
  };
  return {
    async claim(key, fingerprint) {
      const existing = live(key);
      if (existing) return classify(existing, fingerprint);
      records.set(key, {
        record: { fingerprint, status: "in_progress" },
        expires: Date.now() + RETENTION_SECONDS * 1000,
      });
      return { kind: "new" };
    },
    async complete(key, fingerprint, response) {
      records.set(key, {
        record: { fingerprint, status: "completed", response },
        expires: Date.now() + RETENTION_SECONDS * 1000,
      });
    },
  };
}

export function redisIdempotencyStore(redis: Redis): IdempotencyStore {
  return {
    async claim(key, fingerprint) {
      const record: KeyRecord = { fingerprint, status: "in_progress" };
      // SET NX: exactly one concurrent request wins the claim.
      const won = await redis.set(PREFIX + key, JSON.stringify(record), {
        nx: true,
        ex: RETENTION_SECONDS,
      });
      if (won) return { kind: "new" };
      const existing = await redis.get<KeyRecord | string>(PREFIX + key);
      if (!existing) return { kind: "in_progress" }; // expired between calls: retry
      return classify(typeof existing === "string" ? JSON.parse(existing) : existing, fingerprint);
    },
    async complete(key, fingerprint, response) {
      const record: KeyRecord = { fingerprint, status: "completed", response };
      await redis.set(PREFIX + key, JSON.stringify(record), { ex: RETENTION_SECONDS });
    },
  };
}

let store: IdempotencyStore | undefined;

/** Redis when configured (shared by every instance), memory otherwise. */
export function idempotencyStore(): IdempotencyStore {
  if (!store) {
    const credentials = redisCredentials();
    store = credentials ? redisIdempotencyStore(new Redis(credentials)) : memoryIdempotencyStore();
  }
  return store;
}

/** Test hook. */
export function setIdempotencyStore(next: IdempotencyStore | undefined): void {
  store = next;
}

/** A key must be present-or-absent, at most 255 printable characters. */
export function validKey(key: string): boolean {
  return key.length >= 1 && key.length <= MAX_KEY_LENGTH && /^[\x21-\x7e]+$/.test(key);
}

/** What makes two requests "the same request": method, path and body. */
export async function fingerprint(method: string, path: string, body: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${method} ${path}\n${body}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
