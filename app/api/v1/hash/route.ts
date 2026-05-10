import { z } from "zod";
import { json, rateLimit, errorResponse } from "@/lib/api";
import { registry } from "@/lib/openapi";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const ALGORITHMS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
// Web Crypto only supports SHA-*; MD5 is handled manually.
const WEBCRYPTO_ALGOS: Record<string, string> = {
  "SHA-1": "SHA-1",
  "SHA-256": "SHA-256",
  "SHA-384": "SHA-384",
  "SHA-512": "SHA-512",
};

const HashRequest = z
  .object({
    input: z.string().openapi({ description: "The text to hash", example: "hello world" }),
    algorithm: z
      .enum(ALGORITHMS)
      .default("SHA-256")
      .openapi({ description: "Hash algorithm" }),
  })
  .openapi("HashRequest");

const HashResponse = z
  .object({
    algorithm: z.string(),
    digest: z.string().openapi({ description: "Hex-encoded hash digest" }),
  })
  .openapi("HashResponse");

registry.registerPath({
  method: "post",
  path: "/hash",
  summary: "Hash a string",
  description:
    "Compute a cryptographic hash of the provided input. Supported algorithms: MD5, SHA-1, SHA-256, SHA-384, SHA-512.",
  tags: ["Utilities"],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: HashRequest } },
    },
  },
  responses: {
    200: {
      description: "Hash result",
      content: { "application/json": { schema: HashResponse } },
    },
    400: {
      description: "Invalid input",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
    429: {
      description: "Rate limited",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
  },
});

// ---------------------------------------------------------------------------
// Minimal MD5 (RFC 1321) — no external deps
// ---------------------------------------------------------------------------

function md5(input: string): string {
  const bytes = new TextEncoder().encode(input);

  function lrot(v: number, s: number) {
    return (v << s) | (v >>> (32 - s));
  }

  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23,
    4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
    6, 10, 15, 21,
  ];
  const K = Array.from({ length: 64 }, (_, i) =>
    Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000),
  );

  // Pre-processing: pad to 512-bit blocks
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array(
    Math.ceil((bytes.length + 9) / 64) * 64,
  );
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLen >>> 0, true);
  view.setUint32(padded.length - 4, Math.floor(bitLen / 0x100000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = Array.from({ length: 16 }, (_, j) =>
      view.getUint32(offset + j * 4, true),
    );
    let A = a0, B = b0, C = c0, D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + lrot(F, s[i])) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  return [a0, b0, c0, d0]
    .map((v) =>
      Array.from({ length: 4 }, (_, i) =>
        ((v >>> (i * 8)) & 0xff).toString(16).padStart(2, "0"),
      ).join(""),
    )
    .join("");
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const MAX_INPUT_LENGTH = 1_000_000; // 1 MB

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip);
  if (rl.limited) {
    return errorResponse(429, "Too many requests. Please try again later.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Request body must be valid JSON.");
  }

  const parsed = HashRequest.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "Invalid request body.", {
      errors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), [i.message]]),
      ),
    });
  }

  const { input, algorithm } = parsed.data;

  if (input.length > MAX_INPUT_LENGTH) {
    return errorResponse(400, "input must not exceed 1 MB.");
  }

  let digest: string;

  if (algorithm === "MD5") {
    digest = md5(input);
  } else {
    const algoName = WEBCRYPTO_ALGOS[algorithm];
    const encoded = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest(algoName, encoded);
    digest = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  return json({ algorithm, digest }, { headers: rl.headers });
}
