"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Trash2,
  Info,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  ShieldQuestion,
  Clock,
  AlertTriangle,
  FlaskConical,
  KeyRound,
} from "lucide-react";
import { PasteButton } from "@/components/paste-button";
import { CopyButton } from "@/components/copy-button";

// A static sample JWT (HS256, secret: "secret") with readable claims.
const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRGV2ZWxvcGVyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjQxMDI0NDQ4MDAsImlzcyI6InN5bnRhcXguY29tIiwiYXVkIjoiaHR0cHM6Ly9zeW50YXF4LmNvbSIsInJvbGVzIjpbImFkbWluIiwiZWRpdG9yIl19." +
  "Fm7UhSqEqHOacz_Nbv4g70yDVotdCUFDBgmvDN3wrPw";
const SAMPLE_SECRET = "secret";

const DEFAULT_HEADER = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2);
const DEFAULT_PAYLOAD = JSON.stringify(
  {
    sub: "1234567890",
    name: "Jane Developer",
    iat: Math.floor(Date.now() / 1000),
  },
  null,
  2,
);

// --- Helpers ----------------------------------------------------------------

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str));
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);

  const raw = atob(b64);
  return new TextDecoder("utf-8").decode(
    Uint8Array.from(raw, (c) => c.charCodeAt(0)),
  );
}

interface DecodedJwt {
  raw: string;
  parts: [string, string, string];
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeJwt(token: string): DecodedJwt {
  const cleaned = token.trim();
  const parts = cleaned.split(".");
  if (parts.length !== 3) throw new Error("JWT must have exactly 3 parts");

  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));

  return {
    raw: cleaned,
    parts: [parts[0], parts[1], parts[2]],
    header,
    payload,
    signature: parts[2],
  };
}

const TIMESTAMP_CLAIMS = new Set(["iat", "exp", "nbf", "auth_time"]);

function formatTimestamp(value: unknown): string | null {
  if (typeof value !== "number") return null;
  try {
    return new Date(value * 1000).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "long",
    });
  } catch {
    return null;
  }
}

function getExpiry(payload: Record<string, unknown>): {
  status: "valid" | "expired" | "none";
  label: string;
} {
  const exp = payload.exp;
  if (typeof exp !== "number") return { status: "none", label: "No expiry" };

  const now = Date.now() / 1000;
  if (exp < now) {
    const ago = now - exp;
    const unit =
      ago < 60
        ? `${Math.floor(ago)}s`
        : ago < 3600
          ? `${Math.floor(ago / 60)}m`
          : ago < 86400
            ? `${Math.floor(ago / 3600)}h`
            : `${Math.floor(ago / 86400)}d`;
    return { status: "expired", label: `Expired ${unit} ago` };
  }

  const remaining = exp - now;
  const unit =
    remaining < 60
      ? `${Math.floor(remaining)}s`
      : remaining < 3600
        ? `${Math.floor(remaining / 60)}m`
        : remaining < 86400
          ? `${Math.floor(remaining / 3600)}h`
          : `${Math.floor(remaining / 86400)}d`;
  return { status: "valid", label: `Expires in ${unit}` };
}

// --- Signature verification via Web Crypto ----------------------------------

type VerifyResult =
  | { status: "unverified" }
  | { status: "verifying" }
  | { status: "valid" }
  | { status: "invalid" }
  | { status: "error"; message: string }
  | { status: "unsupported"; message: string };

// --- Algorithm configuration ------------------------------------------------

type AlgFamily = "hmac" | "rsa" | "ecdsa" | "rsa-pss" | "eddsa" | "none";

interface AlgConfig {
  family: AlgFamily;
  hash?: string;
  namedCurve?: string;
  saltLength?: number;
}

const ALG_CONFIG: Record<string, AlgConfig> = {
  HS256: { family: "hmac", hash: "SHA-256" },
  HS384: { family: "hmac", hash: "SHA-384" },
  HS512: { family: "hmac", hash: "SHA-512" },
  RS256: { family: "rsa", hash: "SHA-256" },
  RS384: { family: "rsa", hash: "SHA-384" },
  RS512: { family: "rsa", hash: "SHA-512" },
  ES256: { family: "ecdsa", hash: "SHA-256", namedCurve: "P-256" },
  ES384: { family: "ecdsa", hash: "SHA-384", namedCurve: "P-384" },
  ES512: { family: "ecdsa", hash: "SHA-512", namedCurve: "P-521" },
  PS256: { family: "rsa-pss", hash: "SHA-256", saltLength: 32 },
  PS384: { family: "rsa-pss", hash: "SHA-384", saltLength: 48 },
  PS512: { family: "rsa-pss", hash: "SHA-512", saltLength: 64 },
  EdDSA: { family: "eddsa" },
  none: { family: "none" },
};

function getAlgFamily(alg: string | unknown): AlgFamily | "unknown" {
  if (typeof alg !== "string") return "unknown";
  return ALG_CONFIG[alg]?.family ?? "unknown";
}

// --- PEM helpers ------------------------------------------------------------

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/g, "")
    .replace(/-----END [A-Z ]+-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function arrayBufferToPem(buffer: ArrayBuffer, type: string): string {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const lines = b64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${type}-----\n${lines.join("\n")}\n-----END ${type}-----`;
}

function getWebCryptoAlgorithm(
  config: AlgConfig,
): RsaHashedImportParams | EcKeyImportParams | AlgorithmIdentifier {
  switch (config.family) {
    case "rsa":
      return { name: "RSASSA-PKCS1-v1_5", hash: config.hash! };
    case "rsa-pss":
      return { name: "RSA-PSS", hash: config.hash! };
    case "ecdsa":
      return { name: "ECDSA", namedCurve: config.namedCurve! };
    case "eddsa":
      return { name: "Ed25519" };
    default:
      throw new Error(`No Web Crypto mapping for ${config.family}`);
  }
}

function getSignAlgorithm(
  config: AlgConfig,
): AlgorithmIdentifier | RsaPssParams | EcdsaParams {
  switch (config.family) {
    case "hmac":
      return "HMAC";
    case "rsa":
      return "RSASSA-PKCS1-v1_5";
    case "rsa-pss":
      return { name: "RSA-PSS", saltLength: config.saltLength! };
    case "ecdsa":
      return { name: "ECDSA", hash: config.hash! };
    case "eddsa":
      return { name: "Ed25519" };
    default:
      throw new Error(`No sign algorithm for ${config.family}`);
  }
}

async function importPublicKey(pem: string, alg: string): Promise<CryptoKey> {
  const config = ALG_CONFIG[alg];
  if (!config) throw new Error(`Unknown algorithm: ${alg}`);
  return crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(pem),
    getWebCryptoAlgorithm(config),
    false,
    ["verify"],
  );
}

async function importPrivateKey(pem: string, alg: string): Promise<CryptoKey> {
  const config = ALG_CONFIG[alg];
  if (!config) throw new Error(`Unknown algorithm: ${alg}`);
  return crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(pem),
    getWebCryptoAlgorithm(config),
    false,
    ["sign"],
  );
}

async function generateKeyPair(
  alg: string,
): Promise<{ publicKey: string; privateKey: string }> {
  const config = ALG_CONFIG[alg];
  if (!config) throw new Error(`Unknown algorithm: ${alg}`);

  let genAlg: RsaHashedKeyGenParams | EcKeyGenParams | AlgorithmIdentifier;
  switch (config.family) {
    case "rsa":
      genAlg = {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: config.hash!,
      };
      break;
    case "rsa-pss":
      genAlg = {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: config.hash!,
      };
      break;
    case "ecdsa":
      genAlg = { name: "ECDSA", namedCurve: config.namedCurve! };
      break;
    case "eddsa":
      genAlg = { name: "Ed25519" };
      break;
    default:
      throw new Error(`Cannot generate keys for ${alg}`);
  }

  const keyPair = await crypto.subtle.generateKey(genAlg, true, [
    "sign",
    "verify",
  ]);
  const pubDer = await crypto.subtle.exportKey(
    "spki",
    (keyPair as CryptoKeyPair).publicKey,
  );
  const privDer = await crypto.subtle.exportKey(
    "pkcs8",
    (keyPair as CryptoKeyPair).privateKey,
  );

  return {
    publicKey: arrayBufferToPem(pubDer, "PUBLIC KEY"),
    privateKey: arrayBufferToPem(privDer, "PRIVATE KEY"),
  };
}

// --- Signature verification via Web Crypto ----------------------------------

function decodeSignatureBytes(sig: string): Uint8Array<ArrayBuffer> {
  let sig64 = sig.replace(/-/g, "+").replace(/_/g, "/");
  const pad = sig64.length % 4;
  if (pad) sig64 += "=".repeat(4 - pad);
  const raw = atob(sig64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function verifySignature(
  jwt: DecodedJwt,
  secretOrKey: string,
): Promise<VerifyResult> {
  const alg = jwt.header.alg;
  if (typeof alg !== "string")
    return { status: "error", message: "No alg in header" };

  const config = ALG_CONFIG[alg];
  if (!config)
    return { status: "unsupported", message: `Unknown algorithm: ${alg}` };

  if (config.family === "none") {
    return jwt.parts[2] === "" ? { status: "valid" } : { status: "invalid" };
  }

  const signingInput = `${jwt.parts[0]}.${jwt.parts[1]}`;
  const encoder = new TextEncoder();
  const sigBytes = decodeSignatureBytes(jwt.parts[2]);

  try {
    let key: CryptoKey;
    if (config.family === "hmac") {
      key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secretOrKey),
        { name: "HMAC", hash: config.hash! },
        false,
        ["verify"],
      );
    } else {
      key = await importPublicKey(secretOrKey, alg);
    }

    const valid = await crypto.subtle.verify(
      getSignAlgorithm(config),
      key,
      sigBytes,
      encoder.encode(signingInput),
    );
    return valid ? { status: "valid" } : { status: "invalid" };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Verification failed",
    };
  }
}

// --- Signing for encode mode ------------------------------------------------

async function signJwt(
  headerJson: string,
  payloadJson: string,
  secretOrKey: string,
): Promise<string> {
  const header = JSON.parse(headerJson);
  const alg = header.alg;

  const config = ALG_CONFIG[alg];
  if (!config) throw new Error(`Unknown algorithm: ${alg}`);

  const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
  const encodedPayload = base64UrlEncodeString(
    JSON.stringify(JSON.parse(payloadJson)),
  );
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  if (config.family === "none") {
    return `${signingInput}.`;
  }

  const encoder = new TextEncoder();
  let key: CryptoKey;

  if (config.family === "hmac") {
    key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretOrKey),
      { name: "HMAC", hash: config.hash! },
      false,
      ["sign"],
    );
  } else {
    key = await importPrivateKey(secretOrKey, alg);
  }

  const sig = await crypto.subtle.sign(
    getSignAlgorithm(config),
    key,
    encoder.encode(signingInput),
  );
  return `${signingInput}.${base64UrlEncode(new Uint8Array(sig))}`;
}

// --- Claim descriptions -----------------------------------------------------

const CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expiration Time",
  nbf: "Not Before",
  iat: "Issued At",
  jti: "JWT ID",
  azp: "Authorized Party",
  scope: "Scope",
  nonce: "Nonce",
  auth_time: "Authentication Time",
  at_hash: "Access Token Hash",
  c_hash: "Code Hash",
  email: "Email",
  email_verified: "Email Verified",
  name: "Name",
  given_name: "Given Name",
  family_name: "Family Name",
  picture: "Picture",
  locale: "Locale",
  sid: "Session ID",
};

// --- Page -------------------------------------------------------------------

export default function JwtPage() {
  const [mode, setMode] = useState<"decode" | "encode">("decode");

  // Decode state
  const [input, setInput] = useState("");
  const [secret, setSecret] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [verifyResult, setVerifyResult] = useState<VerifyResult>({
    status: "unverified",
  });

  // Encode state
  const [encodeHeader, setEncodeHeader] = useState(DEFAULT_HEADER);
  const [encodePayload, setEncodePayload] = useState(DEFAULT_PAYLOAD);
  const [encodeSecret, setEncodeSecret] = useState("");
  const [encodePrivateKey, setEncodePrivateKey] = useState("");
  const [encodePublicKey, setEncodePublicKey] = useState("");
  const [encodedOutput, setEncodedOutput] = useState("");
  const [encodeError, setEncodeError] = useState<string | null>(null);

  // Decode helpers
  const decoded = useMemo<{
    jwt: DecodedJwt | null;
    error: string | null;
  }>(() => {
    if (!input.trim()) return { jwt: null, error: null };
    try {
      return { jwt: decodeJwt(input), error: null };
    } catch (e) {
      return {
        jwt: null,
        error: e instanceof Error ? e.message : "Invalid token",
      };
    }
  }, [input]);

  const expiry = useMemo(
    () => (decoded.jwt ? getExpiry(decoded.jwt.payload) : null),
    [decoded.jwt],
  );

  const headerJson = decoded.jwt
    ? JSON.stringify(decoded.jwt.header, null, 2)
    : "";
  const payloadJson = decoded.jwt
    ? JSON.stringify(decoded.jwt.payload, null, 2)
    : "";

  // Derive algorithm family for UI switching
  const decodeAlgFamily = useMemo(
    () =>
      decoded.jwt ? getAlgFamily(decoded.jwt.header.alg) : ("unknown" as const),
    [decoded.jwt],
  );

  const encodeAlgFamily = useMemo(() => {
    try {
      return getAlgFamily(JSON.parse(encodeHeader).alg);
    } catch {
      return "unknown" as const;
    }
  }, [encodeHeader]);

  // Auto-verify signature when token and key material are present
  const verifyVersionRef = useRef(0);
  useEffect(() => {
    const keyMaterial =
      decodeAlgFamily === "hmac" || decodeAlgFamily === "unknown"
        ? secret
        : publicKey;

    if (!decoded.jwt || !keyMaterial) {
      // Schedule to avoid synchronous setState in effect body
      const id = requestAnimationFrame(() =>
        setVerifyResult({ status: "unverified" }),
      );
      return () => cancelAnimationFrame(id);
    }

    const version = ++verifyVersionRef.current;
    setVerifyResult({ status: "verifying" });

    verifySignature(decoded.jwt, keyMaterial).then((result) => {
      if (version === verifyVersionRef.current) {
        setVerifyResult(result);
      }
    });
  }, [decoded.jwt, secret, publicKey, decodeAlgFamily]);

  const clearDecode = () => {
    setInput("");
    setSecret("");
    setPublicKey("");
    setVerifyResult({ status: "unverified" });
  };

  // Auto-encode when header, payload, or key material change
  const encodeVersionRef = useRef(0);
  useEffect(() => {
    const keyMaterial =
      encodeAlgFamily === "hmac" || encodeAlgFamily === "unknown"
        ? encodeSecret
        : encodePrivateKey;
    const isNone = encodeAlgFamily === "none";

    if (!keyMaterial && !isNone) {
      const id = requestAnimationFrame(() => {
        setEncodedOutput("");
        setEncodeError(null);
      });
      return () => cancelAnimationFrame(id);
    }

    let headerValid = true;
    try {
      JSON.parse(encodeHeader);
    } catch {
      headerValid = false;
    }

    let payloadValid = true;
    try {
      JSON.parse(encodePayload);
    } catch {
      payloadValid = false;
    }

    if (!headerValid) {
      const id = requestAnimationFrame(() => {
        setEncodeError("Invalid header JSON");
        setEncodedOutput("");
      });
      return () => cancelAnimationFrame(id);
    }

    if (!payloadValid) {
      const id = requestAnimationFrame(() => {
        setEncodeError("Invalid payload JSON");
        setEncodedOutput("");
      });
      return () => cancelAnimationFrame(id);
    }

    const version = ++encodeVersionRef.current;
    setEncodeError(null);

    signJwt(encodeHeader, encodePayload, keyMaterial)
      .then((token) => {
        if (version === encodeVersionRef.current) {
          setEncodedOutput(token);
          setEncodeError(null);
        }
      })
      .catch((e) => {
        if (version === encodeVersionRef.current) {
          setEncodedOutput("");
          setEncodeError(e instanceof Error ? e.message : "Signing failed");
        }
      });
  }, [
    encodeHeader,
    encodePayload,
    encodeSecret,
    encodePrivateKey,
    encodeAlgFamily,
  ]);

  const clearEncode = () => {
    setEncodeHeader(DEFAULT_HEADER);
    setEncodePayload(DEFAULT_PAYLOAD);
    setEncodeSecret("");
    setEncodePrivateKey("");
    setEncodePublicKey("");
    setEncodedOutput("");
    setEncodeError(null);
  };

  const switchMode = useCallback(
    (next: "decode" | "encode") => {
      if (next === mode) return;
      setMode(next);
    },
    [mode],
  );

  const verifyStatusLabel = useMemo(() => {
    switch (verifyResult.status) {
      case "valid":
        return { text: "Signature valid", className: "text-green" };
      case "invalid":
        return { text: "Signature invalid", className: "text-pink" };
      case "verifying":
        return { text: "Verifying...", className: "text-dim" };
      case "error":
        return {
          text: (verifyResult as { message: string }).message,
          className: "text-pink",
        };
      case "unsupported":
        return {
          text: (verifyResult as { message: string }).message,
          className: "text-yellow",
        };
      default:
        return null;
    }
  }, [verifyResult]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          JWT Debugger
        </h1>
        <p className="text-sm text-muted">
          Decode, encode, and verify JSON Web Tokens. Everything runs in your
          browser, nothing is sent to a server.
        </p>
      </div>

      {/* Mode toggle + Algorithm selector */}
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border border-border p-0.5 bg-surface/50">
          <button
            onClick={() => switchMode("decode")}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              mode === "decode"
                ? "bg-accent text-background"
                : "text-dim hover:text-foreground"
            }`}
          >
            Decoder
          </button>
          <button
            onClick={() => switchMode("encode")}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              mode === "encode"
                ? "bg-accent text-background"
                : "text-dim hover:text-foreground"
            }`}
          >
            Encoder
          </button>
        </div>

        {mode === "encode" && (
          <select
            value={(() => {
              try {
                return (JSON.parse(encodeHeader).alg as string) || "HS256";
              } catch {
                return "HS256";
              }
            })()}
            onChange={(e) => {
              const alg = e.target.value;
              try {
                const h = JSON.parse(encodeHeader);
                h.alg = alg;
                setEncodeHeader(JSON.stringify(h, null, 2));
              } catch {
                setEncodeHeader(JSON.stringify({ alg, typ: "JWT" }, null, 2));
              }
              // Clear key material when switching families
              const newFamily = getAlgFamily(alg);
              const oldFamily = encodeAlgFamily;
              if (newFamily !== oldFamily) {
                setEncodeSecret("");
                setEncodePrivateKey("");
                setEncodePublicKey("");
              }
            }}
            className="rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent/50 cursor-pointer"
          >
            <optgroup label="HMAC">
              <option value="HS256">HS256</option>
              <option value="HS384">HS384</option>
              <option value="HS512">HS512</option>
            </optgroup>
            <optgroup label="RSA">
              <option value="RS256">RS256</option>
              <option value="RS384">RS384</option>
              <option value="RS512">RS512</option>
            </optgroup>
            <optgroup label="ECDSA">
              <option value="ES256">ES256</option>
              <option value="ES384">ES384</option>
              <option value="ES512">ES512</option>
            </optgroup>
            <optgroup label="RSA-PSS">
              <option value="PS256">PS256</option>
              <option value="PS384">PS384</option>
              <option value="PS512">PS512</option>
            </optgroup>
            <optgroup label="EdDSA">
              <option value="EdDSA">EdDSA</option>
            </optgroup>
            <optgroup label="Unsecured">
              <option value="none">none</option>
            </optgroup>
          </select>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: tool */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {mode === "decode" ? (
            <>
              {/* Token input with color-coded overlay */}
              <div className="rounded-lg border border-border bg-surface/50">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <label className="text-xs text-dim">Encoded Token</label>
                  <div className="flex items-center gap-1.5">
                    {!input && (
                      <button
                        onClick={() => {
                          setInput(SAMPLE_TOKEN);
                          setSecret(SAMPLE_SECRET);
                        }}
                        className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer"
                      >
                        <FlaskConical size={12} />
                        Sample
                      </button>
                    )}
                    <PasteButton onPaste={(text) => setInput(text)} label />
                    {input && (
                      <button
                        onClick={clearDecode}
                        className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-pink hover:border-pink/30 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative min-h-[9rem]">
                  {/* Color-coded backdrop */}
                  <div
                    aria-hidden
                    className="absolute inset-0 px-3 py-2 text-sm font-mono break-all whitespace-pre-wrap pointer-events-none overflow-hidden"
                  >
                    {decoded.jwt ? (
                      <>
                        <span className="text-pink">
                          {decoded.jwt.parts[0]}
                        </span>
                        <span className="text-dim">.</span>
                        <span className="text-jwt-purple">
                          {decoded.jwt.parts[1]}
                        </span>
                        <span className="text-dim">.</span>
                        <span className="text-jwt-cyan">
                          {decoded.jwt.parts[2]}
                        </span>
                      </>
                    ) : (
                      <span className="text-transparent">{input}</span>
                    )}
                  </div>
                  {/* Transparent textarea on top */}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste a JWT token (eyJhbG...)..."
                    rows={6}
                    spellCheck={false}
                    className={`relative w-full bg-transparent px-3 py-2 text-sm font-mono break-all focus:outline-none resize-y ${
                      decoded.jwt
                        ? "text-transparent caret-foreground"
                        : "text-foreground"
                    } placeholder:text-dim/50`}
                  />
                </div>
              </div>

              {/* Error */}
              {decoded.error && (
                <div className="flex items-center gap-2 text-xs text-pink">
                  <AlertTriangle size={12} />
                  {decoded.error}
                </div>
              )}

              {/* Decoded sections */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface/50">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-xs font-medium text-pink">
                      Header
                    </span>
                    <CopyButton
                      text={headerJson}
                      label
                      disabled={!headerJson}
                    />
                  </div>
                  <pre className="px-3 py-2 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-60 min-h-[4.5rem]">
                    {headerJson || (
                      <span className="text-dim/30">{"{\n  ...\n}"}</span>
                    )}
                  </pre>
                </div>

                <div className="rounded-lg border border-border bg-surface/50">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-xs font-medium text-jwt-purple">
                      Payload
                    </span>
                    <CopyButton
                      text={payloadJson}
                      label
                      disabled={!payloadJson}
                    />
                  </div>
                  <pre className="px-3 py-2 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-60 min-h-[4.5rem]">
                    {payloadJson || (
                      <span className="text-dim/30">{"{\n  ...\n}"}</span>
                    )}
                  </pre>
                </div>
              </div>

              {/* Claims table */}
              <div className="rounded-lg border border-border bg-surface/50">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-medium text-dim">Claims</span>
                  {expiry && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        expiry.status === "expired"
                          ? "text-pink"
                          : expiry.status === "valid"
                            ? "text-green"
                            : "text-dim"
                      }`}
                    >
                      <Clock size={10} />
                      {expiry.label}
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-dim">
                        <th className="text-left px-3 py-1.5 font-medium">
                          Claim
                        </th>
                        <th className="text-left px-3 py-1.5 font-medium">
                          Value
                        </th>
                        <th className="text-left px-3 py-1.5 font-medium hidden sm:table-cell">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {decoded.jwt ? (
                        Object.entries(decoded.jwt.payload).map(
                          ([key, value]) => {
                            const ts = TIMESTAMP_CLAIMS.has(key)
                              ? formatTimestamp(value)
                              : null;
                            return (
                              <tr
                                key={key}
                                className="border-b border-border last:border-0"
                              >
                                <td className="px-3 py-1.5 font-mono text-accent whitespace-nowrap">
                                  {key}
                                </td>
                                <td className="px-3 py-1.5 font-mono text-foreground break-all">
                                  {ts ? (
                                    <span>
                                      <span className="text-muted">{ts}</span>
                                      <span className="text-dim ml-1.5">
                                        ({String(value)})
                                      </span>
                                    </span>
                                  ) : typeof value === "object" ? (
                                    JSON.stringify(value)
                                  ) : (
                                    String(value)
                                  )}
                                </td>
                                <td className="px-3 py-1.5 text-dim hidden sm:table-cell">
                                  {CLAIM_DESCRIPTIONS[key] || ""}
                                </td>
                              </tr>
                            );
                          },
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-3 py-3 text-dim/30 text-center"
                          >
                            No claims to display
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signature verification */}
              <div className="rounded-lg border border-border bg-surface/50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-xs font-medium text-jwt-cyan flex items-center gap-1.5">
                    {verifyResult.status === "valid" ? (
                      <ShieldCheck size={12} className="text-green" />
                    ) : verifyResult.status === "invalid" ? (
                      <ShieldX size={12} className="text-pink" />
                    ) : (
                      <ShieldQuestion size={12} />
                    )}
                    Signature Verification
                  </span>
                  <div className="flex items-center gap-2">
                    {decoded.jwt &&
                      typeof decoded.jwt.header.alg === "string" && (
                        <span className="text-[10px] text-dim font-mono">
                          {decoded.jwt.header.alg}
                        </span>
                      )}
                    {verifyStatusLabel && (
                      <span
                        className={`text-xs ${verifyStatusLabel.className}`}
                      >
                        {verifyStatusLabel.text}
                      </span>
                    )}
                  </div>
                </div>
                <div className="px-4 py-3">
                  {decodeAlgFamily === "hmac" ||
                  decodeAlgFamily === "unknown" ? (
                    <input
                      type="text"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder={`Secret key for ${decoded.jwt && typeof decoded.jwt.header.alg === "string" ? decoded.jwt.header.alg : "HMAC"} verification...`}
                      spellCheck={false}
                      disabled={!decoded.jwt}
                      className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs font-mono text-foreground placeholder:text-dim/50 focus:outline-none focus:border-accent/50 disabled:opacity-40"
                    />
                  ) : decodeAlgFamily === "none" ? (
                    <p className="text-xs text-dim">
                      Algorithm is{" "}
                      <span className="font-mono text-yellow">none</span> - no
                      verification needed.
                    </p>
                  ) : (
                    <textarea
                      value={publicKey}
                      onChange={(e) => setPublicKey(e.target.value)}
                      placeholder={`Paste ${decoded.jwt?.header.alg} public key in PEM format...\n-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`}
                      rows={6}
                      spellCheck={false}
                      disabled={!decoded.jwt}
                      className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs font-mono text-foreground placeholder:text-dim/50 focus:outline-none focus:border-accent/50 disabled:opacity-40 resize-y"
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Encode mode */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface/50">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-xs font-medium text-pink">
                      Header
                    </span>
                  </div>
                  <textarea
                    value={encodeHeader}
                    onChange={(e) => setEncodeHeader(e.target.value)}
                    rows={5}
                    spellCheck={false}
                    className="w-full bg-transparent px-3 py-2 text-xs font-mono text-foreground placeholder:text-dim/50 focus:outline-none resize-y"
                  />
                </div>

                <div className="rounded-lg border border-border bg-surface/50">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-xs font-medium text-jwt-purple">
                      Payload
                    </span>
                  </div>
                  <textarea
                    value={encodePayload}
                    onChange={(e) => setEncodePayload(e.target.value)}
                    rows={5}
                    spellCheck={false}
                    className="w-full bg-transparent px-3 py-2 text-xs font-mono text-foreground placeholder:text-dim/50 focus:outline-none resize-y"
                  />
                </div>
              </div>

              {/* Secret/Key for signing */}
              <div className="rounded-lg border border-border bg-surface/50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-xs font-medium text-jwt-cyan flex items-center gap-1.5">
                    <ShieldCheck size={12} />
                    {encodeAlgFamily === "hmac" || encodeAlgFamily === "unknown"
                      ? "Signing Secret"
                      : "Signing Key"}
                  </span>
                  <div className="flex items-center gap-2">
                    {encodeAlgFamily !== "hmac" &&
                      encodeAlgFamily !== "none" &&
                      encodeAlgFamily !== "unknown" && (
                        <button
                          onClick={async () => {
                            try {
                              const header = JSON.parse(encodeHeader);
                              const pair = await generateKeyPair(header.alg);
                              setEncodePrivateKey(pair.privateKey);
                              setEncodePublicKey(pair.publicKey);
                            } catch (e) {
                              setEncodeError(
                                e instanceof Error
                                  ? e.message
                                  : "Key generation failed",
                              );
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer"
                        >
                          <KeyRound size={12} />
                          Generate Key Pair
                        </button>
                      )}
                  </div>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {encodeAlgFamily === "none" ? (
                    <p className="text-xs text-dim">
                      Algorithm is{" "}
                      <span className="font-mono text-yellow">none</span> - no
                      signing key needed.
                    </p>
                  ) : encodeAlgFamily === "hmac" ||
                    encodeAlgFamily === "unknown" ? (
                    <input
                      type="text"
                      value={encodeSecret}
                      onChange={(e) => setEncodeSecret(e.target.value)}
                      placeholder="Enter a secret key to sign the JWT..."
                      spellCheck={false}
                      className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs font-mono text-foreground placeholder:text-dim/50 focus:outline-none focus:border-accent/50"
                    />
                  ) : (
                    <>
                      <div>
                        <label className="text-[10px] text-dim uppercase tracking-widest mb-1 block">
                          Private Key
                        </label>
                        <textarea
                          value={encodePrivateKey}
                          onChange={(e) => setEncodePrivateKey(e.target.value)}
                          placeholder={`Paste private key (PEM) or click Generate Key Pair...\n-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----`}
                          rows={6}
                          spellCheck={false}
                          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs font-mono text-foreground placeholder:text-dim/50 focus:outline-none focus:border-accent/50 resize-y"
                        />
                      </div>
                      {encodePublicKey && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] text-dim uppercase tracking-widest">
                              Public Key (for verification)
                            </label>
                            <CopyButton text={encodePublicKey} />
                          </div>
                          <pre className="rounded border border-border bg-background px-2 py-1.5 text-xs font-mono text-dim break-all whitespace-pre-wrap max-h-40 overflow-auto">
                            {encodePublicKey}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Encode error */}
              {encodeError && (
                <div className="flex items-center gap-2 text-xs text-pink">
                  <AlertTriangle size={12} />
                  {encodeError}
                </div>
              )}

              {/* Encoded output */}
              <div className="rounded-lg border border-border bg-surface/50">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <label className="text-xs text-dim">Encoded Token</label>
                  <div className="flex items-center gap-1.5">
                    <CopyButton
                      text={encodedOutput}
                      label
                      disabled={!encodedOutput}
                    />
                    {encodedOutput && (
                      <button
                        onClick={clearEncode}
                        className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-pink hover:border-pink/30 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <pre className="px-3 py-2 text-xs font-mono break-all whitespace-pre-wrap overflow-auto min-h-[4.5rem] max-h-60">
                  {encodedOutput ? (
                    (() => {
                      const parts = encodedOutput.split(".");
                      return (
                        <>
                          <span className="text-pink">{parts[0]}</span>
                          <span className="text-dim">.</span>
                          <span className="text-jwt-purple">{parts[1]}</span>
                          <span className="text-dim">.</span>
                          <span className="text-jwt-cyan">{parts[2]}</span>
                        </>
                      );
                    })()
                  ) : (
                    <span className="text-dim/30">
                      Enter a secret to generate a signed JWT...
                    </span>
                  )}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Right: info & references */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-accent" />
              About JWTs
            </h3>
            <div className="px-4 py-3 text-[11px] text-dim leading-relaxed space-y-2.5">
              <p>
                A JSON Web Token (JWT) is a compact, URL-safe way to represent
                claims between two parties. It consists of three
                Base64URL-encoded parts separated by dots:{" "}
                <span className="text-pink">header</span>
                <span className="text-dim">.</span>
                <span className="text-jwt-purple">payload</span>
                <span className="text-dim">.</span>
                <span className="text-jwt-cyan">signature</span>.
              </p>
              <p>
                The <span className="text-pink">header</span> specifies the
                signing algorithm (e.g. HS256, RS256) and token type.
              </p>
              <p>
                The <span className="text-jwt-purple">payload</span> contains claims
                - statements about the user and metadata. Standard claims
                include <span className="text-muted">iss</span> (issuer),{" "}
                <span className="text-muted">sub</span> (subject),{" "}
                <span className="text-muted">exp</span> (expiration), and{" "}
                <span className="text-muted">iat</span> (issued at).
              </p>
              <p>
                The <span className="text-jwt-cyan">signature</span> is created by
                signing the header and payload with a secret or private key,
                allowing recipients to verify authenticity.
              </p>
              <p>
                JWTs are{" "}
                <span className="text-muted">not encrypted by default</span>.
                Anyone can decode the payload. Never store sensitive data in a
                JWT unless using JWE (JSON Web Encryption).
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <ExternalLink size={12} className="text-accent" />
              References
            </h3>
            <ul className="px-4 py-3 text-[11px] leading-relaxed space-y-1.5">
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc7519"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 7519 - JSON Web Token (JWT)
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc7515"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 7515 - JSON Web Signature (JWS)
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc7518"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 7518 - JSON Web Algorithms (JWA)
                </a>
              </li>
              <li>
                <a
                  href="https://jwt.io/introduction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  jwt.io - Introduction to JWTs
                </a>
              </li>
              <li>
                <a
                  href="https://auth0.com/docs/secure/tokens/json-web-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  Auth0 - JSON Web Tokens
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
