/**
 * One-time secrets, for /posts/github-actions-secret-inputs.
 *
 * A secret is stored encrypted under a key derived from its id, and the id
 * is only ever in the link: Redis holds a hash of the id and the ciphertext,
 * so what's stored can't be read without the link. The first read deletes it
 * (GETDEL), and anything unread expires with its TTL.
 *
 * Like idempotency, this fails closed: a 503 beats a secret that might be
 * readable twice or never.
 */

import { Redis } from "@upstash/redis";
import { redisCredentials } from "@/lib/ratelimit";

export const MAX_SECRET_BYTES = 4 * 1024;
export const DEFAULT_TTL_SECONDS = 60 * 60;
export const MIN_TTL_SECONDS = 60;
export const MAX_TTL_SECONDS = 24 * 60 * 60;
const PREFIX = "syntaqx:secret:";

export interface SecretStore {
  put(lookup: string, value: string, ttlSeconds: number): Promise<void>;
  /** Read and delete in one step, so a value is returned at most once. */
  take(lookup: string): Promise<string | null>;
}

export function memorySecretStore(): SecretStore {
  const values = new Map<string, { value: string; expires: number }>();
  return {
    async put(lookup, value, ttlSeconds) {
      values.set(lookup, { value, expires: Date.now() + ttlSeconds * 1000 });
    },
    async take(lookup) {
      const entry = values.get(lookup);
      values.delete(lookup);
      return entry && entry.expires > Date.now() ? entry.value : null;
    },
  };
}

export function redisSecretStore(redis: Redis): SecretStore {
  return {
    async put(lookup, value, ttlSeconds) {
      await redis.set(PREFIX + lookup, value, { ex: ttlSeconds });
    },
    async take(lookup) {
      return redis.getdel<string>(PREFIX + lookup);
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

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const sha256 = async (text: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text)));

/** 192 random bits, URL-safe: 32 characters. */
export function newSecretId(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(24)));
}

export function validSecretId(id: string): boolean {
  return /^[A-Za-z0-9_-]{32}$/.test(id);
}

/** Where the store keeps a secret: a hash of the id, never the id itself. */
export async function lookupKey(id: string): Promise<string> {
  return Array.from(await sha256(`lookup:${id}`), (b) => b.toString(16).padStart(2, "0")).join("");
}

const aesKey = async (id: string) =>
  crypto.subtle.importKey("raw", await sha256(`key:${id}`), "AES-GCM", false, ["encrypt", "decrypt"]);

/** AES-256-GCM under a key derived from the id; returns base64(iv || ciphertext). */
export async function encryptSecret(id: string, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(id), encoder.encode(secret)),
  );
  const out = new Uint8Array(iv.length + ciphertext.length);
  out.set(iv);
  out.set(ciphertext, iv.length);
  return btoa(String.fromCharCode(...out));
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
