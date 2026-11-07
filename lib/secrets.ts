/**
 * One-time secrets: the store behind /secrets and /tools/secrets.
 *
 * A secret is stored encrypted under a key derived from its id, and the id
 * is only ever in the link: Redis holds a hash of the id and the ciphertext,
 * so what's stored can't be read without the link. The first read deletes it,
 * and anything unread expires with its TTL.
 *
 * A secret can also carry a check: a hash of the browser's key, sent when
 * it's created. A read then has to present the same check, so a wrong key,
 * or someone holding the link without its key, gets a 403 and the secret
 * survives. The check can't decrypt anything.
 *
 * Like idempotency, this fails closed: a 503 beats a secret that might be
 * readable twice or never.
 */

import { Redis } from "@upstash/redis";
import { redisCredentials } from "@/lib/ratelimit";

// Room for a 64 KB secret or file encrypted in the browser, as /tools/secrets
// does: base64url of the IV, ciphertext and tag is about 87 KB.
export const MAX_SECRET_BYTES = 96 * 1024;
export const DEFAULT_TTL_SECONDS = 60 * 60;
export const MIN_TTL_SECONDS = 60;
export const MAX_TTL_SECONDS = 7 * 24 * 60 * 60;
/** Secrets one client can create per day, so nobody can fill the store. */
export const DAILY_CREATE_LIMIT = 100;
const PREFIX = "syntaqx:secret:";
const QUOTA_PREFIX = "syntaqx:secret-quota:";
const DAY_SECONDS = 24 * 60 * 60;

/** On HEAD /secrets/{id}: when an unread secret expires. */
export const EXPIRES_AT_HEADER = "Secret-Expires-At";
/** On GET /secrets/{id}: the check the secret was created with. */
export const CHECK_HEADER = "Secret-Check";

export type TakeResult =
  | { status: "ok"; value: string }
  | { status: "missing" }
  /** The secret has a check and the read didn't match it. Nothing was deleted. */
  | { status: "denied" };

export interface SecretStore {
  /** Store a value, unless `client` is over its daily quota (returns false). */
  put(
    lookup: string,
    value: string,
    ttlSeconds: number,
    check: string | undefined,
    client: string,
  ): Promise<boolean>;
  /** Read and delete in one step, so a value is returned at most once. */
  take(lookup: string, check: string | undefined): Promise<TakeResult>;
  /** Milliseconds until an unread value expires, or null if it's gone. */
  ttl(lookup: string): Promise<number | null>;
}

export function memorySecretStore(): SecretStore {
  const values = new Map<string, { value: string; check?: string; expires: number }>();
  const quota = new Map<string, { count: number; expires: number }>();
  return {
    async put(lookup, value, ttlSeconds, check, client) {
      const now = Date.now();
      const used = quota.get(client);
      const day =
        used && used.expires > now ? used : { count: 0, expires: now + DAY_SECONDS * 1000 };
      const count = day.count + 1;
      quota.set(client, { count, expires: day.expires });
      if (count > DAILY_CREATE_LIMIT) return false;
      values.set(lookup, { value, check, expires: now + ttlSeconds * 1000 });
      return true;
    },
    async take(lookup, check) {
      const entry = values.get(lookup);
      if (!entry || entry.expires <= Date.now()) {
        values.delete(lookup);
        return { status: "missing" };
      }
      if (entry.check && entry.check !== check) return { status: "denied" };
      values.delete(lookup);
      return { status: "ok", value: entry.value };
    },
    async ttl(lookup) {
      const left = (values.get(lookup)?.expires ?? 0) - Date.now();
      return left > 0 ? left : null;
    },
  };
}

/** Count the create against the client's day, then store the value and its check. */
const PUT = `
local count = redis.call("INCR", KEYS[3])
if count == 1 then
  redis.call("EXPIRE", KEYS[3], ARGV[4])
end
if count > tonumber(ARGV[5]) then
  return 0
end
redis.call("SET", KEYS[1], ARGV[1], "EX", ARGV[2])
if ARGV[3] ~= "" then
  redis.call("SET", KEYS[2], ARGV[3], "EX", ARGV[2])
end
return 1
`;

/** 1 and the value, 0 when the check doesn't match (nothing deleted), 2 when missing. */
const TAKE = `
local check = redis.call("GET", KEYS[2])
if check and check ~= ARGV[1] then
  return { 0 }
end
local value = redis.call("GET", KEYS[1])
if not value then
  return { 2 }
end
redis.call("DEL", KEYS[1], KEYS[2])
return { 1, value }
`;

export function redisSecretStore(redis: Redis): SecretStore {
  const put = redis.createScript<number>(PUT);
  const take = redis.createScript<[number, string?]>(TAKE);
  return {
    async put(lookup, value, ttlSeconds, check, client) {
      const stored = await put.exec(
        [PREFIX + lookup, `${PREFIX + lookup}:check`, QUOTA_PREFIX + client],
        [value, String(ttlSeconds), check ?? "", String(DAY_SECONDS), String(DAILY_CREATE_LIMIT)],
      );
      return stored === 1;
    },
    async take(lookup, check) {
      const [status, value] = await take.exec(
        [PREFIX + lookup, `${PREFIX + lookup}:check`],
        [check ?? ""],
      );
      if (status === 0) return { status: "denied" };
      if (status === 2 || value === undefined) return { status: "missing" };
      return { status: "ok", value: String(value) };
    },
    async ttl(lookup) {
      const left = await redis.pttl(PREFIX + lookup);
      return left > 0 ? left : null;
    },
  };
}

let store: SecretStore | undefined;

/** Redis when configured (shared by every instance), memory otherwise. */
export function secretStore(): SecretStore {
  if (!store) {
    const credentials = redisCredentials();
    store = credentials ? redisSecretStore(new Redis(credentials)) : memorySecretStore();
  }
  return store;
}

/** Test hook. */
export function setSecretStore(next: SecretStore | undefined): void {
  store = next;
}

// ---------------------------------------------------------------------------
// Ids and encryption
// ---------------------------------------------------------------------------

const encoder = new TextEncoder();

/** Binary to base64 in chunks: spreading a 96 KB array into one call overflows the stack. */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

const base64url = (bytes: Uint8Array) =>
  toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const sha256 = async (text: string) =>
  new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text)));

/** 192 random bits, URL-safe: 32 characters. */
export function newSecretId(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(24)));
}

export function validSecretId(id: string): boolean {
  return /^[A-Za-z0-9_-]{32}$/.test(id);
}

/** A check is a base64url SHA-256: 43 characters. */
export function validCheck(check: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(check);
}

/** Where the store keeps a secret: a hash of the id, never the id itself. */
export async function lookupKey(id: string): Promise<string> {
  return Array.from(await sha256(`lookup:${id}`), (b) => b.toString(16).padStart(2, "0")).join("");
}

const aesKey = async (id: string) =>
  crypto.subtle.importKey("raw", await sha256(`key:${id}`), "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);

/** AES-256-GCM under a key derived from the id; returns base64(iv || ciphertext). */
export async function encryptSecret(id: string, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(id), encoder.encode(secret)),
  );
  const out = new Uint8Array(iv.length + ciphertext.length);
  out.set(iv);
  out.set(ciphertext, iv.length);
  return toBase64(out);
}

export async function decryptSecret(id: string, stored: string): Promise<string> {
  const bytes = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bytes.slice(0, 12) },
    await aesKey(id),
    bytes.slice(12),
  );
  return new TextDecoder().decode(plaintext);
}
