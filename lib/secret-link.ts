/**
 * Browser side of /tools/secrets: end-to-end encryption and the link format.
 *
 * The page encrypts with AES-256-GCM under a fresh random key and sends only
 * the ciphertext to POST /secrets. The key goes in the link's fragment
 * (`#id/key`), which browsers never send to a server, so the API stores and
 * returns ciphertext it can't read.
 *
 * Links from the API itself (`api.syntaqx.com/secrets/{id}`) carry no key:
 * the server encrypted those, and GET returns the plaintext.
 *
 * Every secret the page makes also carries a check derived from the key
 * (`checkFor`), so a read without the right key is refused instead of
 * burning the secret.
 */

export const PAGE_PATH = "/tools/secrets";

/** The most a browser-encrypted secret can hold; the API takes 96 KB of ciphertext. */
export const MAX_PLAINTEXT_BYTES = 64 * 1024;

export type SecretLink =
  { kind: "browser"; id: string; key?: string } | { kind: "api"; id: string };

const ID = /^[A-Za-z0-9_-]{32}$/;
const KEY = /^[A-Za-z0-9_-]{43}$/;

const base64url = (bytes: Uint8Array) =>
  btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64url = (text: string) =>
  Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

export const validKey = (key: string) => KEY.test(key);

/** A new 256-bit key, as the 43 characters that go in the link. */
export function newKey(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

const importKey = (key: string) =>
  crypto.subtle.importKey("raw", fromBase64url(key), "AES-GCM", false, ["encrypt", "decrypt"]);

/**
 * The `check` sent with a secret and on every read: SHA-256 of `check:` + the
 * key, base64url. It proves the reader has the key without revealing it.
 */
export async function checkFor(key: string): Promise<string> {
  return base64url(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`check:${key}`))),
  );
}

/** base64url(iv || ciphertext), the string sent to the API as `secret`. */
export async function encrypt(
  key: string,
  plaintext: string | Uint8Array<ArrayBuffer>,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = typeof plaintext === "string" ? new TextEncoder().encode(plaintext) : plaintext;
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await importKey(key), data),
  );
  const out = new Uint8Array(iv.length + ciphertext.length);
  out.set(iv);
  out.set(ciphertext, iv.length);
  return base64url(out);
}

/** Throws when the key doesn't match: GCM authenticates the ciphertext. */
export async function decryptBytes(key: string, payload: string): Promise<Uint8Array> {
  const bytes = fromBase64url(payload);
  return new Uint8Array(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytes.slice(0, 12) },
      await importKey(key),
      bytes.slice(12),
    ),
  );
}

export async function decrypt(key: string, payload: string): Promise<string> {
  return new TextDecoder().decode(await decryptBytes(key, payload));
}

// --- Files ----------------------------------------------------------------------

/**
 * A file is sent as one plaintext: this marker, a JSON line with its name and
 * type, then its bytes. Text secrets are sent as plain UTF-8, so a script that
 * only handles text never has to know about files.
 */
const FILE_MARKER = "\0syntaqx-file\n";

export type Revealed =
  { kind: "text"; text: string } | { kind: "file"; name: string; type: string; bytes: Uint8Array };

export function packFile(name: string, type: string, bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const header = new TextEncoder().encode(`${FILE_MARKER}${JSON.stringify({ name, type })}\n`);
  const out = new Uint8Array(header.length + bytes.length);
  out.set(header);
  out.set(bytes, header.length);
  return out;
}

export function unpack(plaintext: Uint8Array): Revealed {
  const marker = new TextEncoder().encode(FILE_MARKER);
  const isFile = marker.every((b, i) => plaintext[i] === b);
  if (!isFile) return { kind: "text", text: new TextDecoder().decode(plaintext) };
  const end = plaintext.indexOf(0x0a, marker.length);
  const { name, type } = JSON.parse(
    new TextDecoder().decode(plaintext.subarray(marker.length, end)),
  ) as { name: string; type: string };
  return { kind: "file", name, type, bytes: plaintext.subarray(end + 1) };
}

/** The page link: `#id/key`, or `#id` when the key is sent separately. */
export function pageLink(origin: string, id: string, key?: string): string {
  return `${origin}${PAGE_PATH}#${key ? `${id}/${key}` : id}`;
}

/**
 * Read a fragment (`id/key`, `id`, or `api/id` for an API link a browser was
 * redirected from), with or without the leading `#`.
 */
export function parseFragment(fragment: string): SecretLink | null {
  const [id, key, ...rest] = fragment.replace(/^#/, "").split("/");
  if (rest.length) return null;
  if (id === "api") return key && ID.test(key) ? { kind: "api", id: key } : null;
  if (!ID.test(id)) return null;
  if (key === undefined || key === "") return { kind: "browser", id };
  return KEY.test(key) ? { kind: "browser", id, key } : null;
}

/** Anything someone might paste: a page link, an API link, or a bare id. */
export function parseLink(input: string): SecretLink | null {
  const text = input.trim();
  if (ID.test(text)) return { kind: "browser", id: text };

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  const api = url.pathname.match(/^(?:\/api)?\/secrets\/([A-Za-z0-9_-]{32})\/?$/);
  if (api) return { kind: "api", id: api[1] };
  if (url.pathname.replace(/\/$/, "") === PAGE_PATH) return parseFragment(url.hash);
  return null;
}
