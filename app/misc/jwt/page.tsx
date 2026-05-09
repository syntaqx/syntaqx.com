"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Trash2,
  Info,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  ShieldQuestion,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { FlaskConical } from "lucide-react";
import { PasteButton } from "@/components/paste-button";
import { CopyButton } from "@/components/copy-button";

// A static sample JWT (HS256, secret: "secret") with readable claims.
// Payload: { sub: "1234567890", name: "Jane Developer", iat: 1516239022, exp: 4102444800, iss: "syntaqx.com", aud: "https://syntaqx.com", roles: ["admin","editor"] }
const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRGV2ZWxvcGVyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjQxMDI0NDQ4MDAsImlzcyI6InN5bnRhcXguY29tIiwiYXVkIjoiaHR0cHM6Ly9zeW50YXF4LmNvbSIsInJvbGVzIjpbImFkbWluIiwiZWRpdG9yIl19." +
  "Fm7UhSqEqHOacz_Nbv4g70yDVotdCUFDBgmvDN3wrPw";
const SAMPLE_SECRET = "secret";

// --- Helpers ----------------------------------------------------------------

function base64UrlDecode(str: string): string {
  // Restore standard base64 characters and padding
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

// Timestamp claims we auto-format
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
  | { status: "valid" }
  | { status: "invalid" }
  | { status: "error"; message: string }
  | { status: "unsupported"; message: string };

async function verifySignature(
  jwt: DecodedJwt,
  secret: string,
): Promise<VerifyResult> {
  const alg = jwt.header.alg;
  if (typeof alg !== "string")
    return { status: "error", message: "No alg in header" };

  const signingInput = `${jwt.parts[0]}.${jwt.parts[1]}`;
  const encoder = new TextEncoder();

  if (alg === "HS256" || alg === "HS384" || alg === "HS512") {
    const hashMap: Record<string, string> = {
      HS256: "SHA-256",
      HS384: "SHA-384",
      HS512: "SHA-512",
    };
    try {
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: hashMap[alg] },
        false,
        ["verify"],
      );

      // Decode the signature from base64url
      let sig64 = jwt.parts[2].replace(/-/g, "+").replace(/_/g, "/");
      const pad = sig64.length % 4;
      if (pad) sig64 += "=".repeat(4 - pad);
      const sigBytes = Uint8Array.from(atob(sig64), (c) => c.charCodeAt(0));

      const valid = await crypto.subtle.verify(
        "HMAC",
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

  if (alg === "none") {
    return jwt.parts[2] === "" ? { status: "valid" } : { status: "invalid" };
  }

  return {
    status: "unsupported",
    message: `${alg} verification requires a public key, which is not yet supported`,
  };
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
  const [input, setInput] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyResult, setVerifyResult] = useState<VerifyResult>({
    status: "unverified",
  });
  const [verifying, setVerifying] = useState(false);

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

  const handleVerify = useCallback(async () => {
    if (!decoded.jwt || !secret) return;
    setVerifying(true);
    try {
      const result = await verifySignature(decoded.jwt, secret);
      setVerifyResult(result);
    } finally {
      setVerifying(false);
    }
  }, [decoded.jwt, secret]);

  const clear = () => {
    setInput("");
    setSecret("");
    setVerifyResult({ status: "unverified" });
  };

  const headerJson = decoded.jwt
    ? JSON.stringify(decoded.jwt.header, null, 2)
    : "";
  const payloadJson = decoded.jwt
    ? JSON.stringify(decoded.jwt.payload, null, 2)
    : "";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          JWT Decoder
        </h1>
        <p className="text-sm text-muted">
          Decode, inspect, and verify JSON Web Tokens. Everything runs in your
          browser, nothing is sent to a server.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: tool */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Token input */}
          <div className="rounded-lg border border-border bg-surface/50">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <label className="text-xs text-dim">Encoded Token</label>
              <div className="flex items-center gap-1.5">
                {!input && (
                  <button
                    onClick={() => {
                      setInput(SAMPLE_TOKEN);
                      setSecret(SAMPLE_SECRET);
                      setVerifyResult({ status: "unverified" });
                    }}
                    className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer"
                  >
                    <FlaskConical size={12} />
                    Sample
                  </button>
                )}
                <PasteButton
                  onPaste={(text) => {
                    setInput(text);
                    setVerifyResult({ status: "unverified" });
                  }}
                  label
                />
                {input && (
                  <button
                    onClick={clear}
                    className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-pink hover:border-pink/30 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setVerifyResult({ status: "unverified" });
              }}
              placeholder="Paste a JWT token (eyJhbG...)..."
              rows={6}
              spellCheck={false}
              className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-dim/50 focus:outline-none resize-y font-mono break-all"
            />
          </div>

          {/* Error */}
          {decoded.error && (
            <div className="flex items-center gap-2 text-xs text-pink">
              <AlertTriangle size={12} />
              {decoded.error}
            </div>
          )}

          {/* Color-coded token */}
          <div className="rounded-lg border border-border bg-surface/50 px-3 py-2">
            <p className="text-[10px] text-dim uppercase tracking-widest mb-1.5">
              Token Structure
            </p>
            {decoded.jwt ? (
              <p className="text-xs font-mono break-all leading-relaxed">
                <span className="text-pink">{decoded.jwt.parts[0]}</span>
                <span className="text-dim">.</span>
                <span className="text-purple">{decoded.jwt.parts[1]}</span>
                <span className="text-dim">.</span>
                <span className="text-cyan">{decoded.jwt.parts[2]}</span>
              </p>
            ) : (
              <p className="text-xs font-mono text-dim/30">
                <span className="text-pink/30">header</span>
                <span>.</span>
                <span className="text-purple/30">payload</span>
                <span>.</span>
                <span className="text-cyan/30">signature</span>
              </p>
            )}
          </div>

          {/* Decoded sections */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Header */}
            <div className="rounded-lg border border-border bg-surface/50">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-pink">Header</span>
                <CopyButton text={headerJson} label disabled={!headerJson} />
              </div>
              <pre className="px-3 py-2 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-60 min-h-[4.5rem]">
                {headerJson || (
                  <span className="text-dim/30">{"{\n  ...\n}"}</span>
                )}
              </pre>
            </div>

            {/* Payload */}
            <div className="rounded-lg border border-border bg-surface/50">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-purple">Payload</span>
                <CopyButton text={payloadJson} label disabled={!payloadJson} />
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
                    <th className="text-left px-3 py-1.5 font-medium">Claim</th>
                    <th className="text-left px-3 py-1.5 font-medium">Value</th>
                    <th className="text-left px-3 py-1.5 font-medium hidden sm:table-cell">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {decoded.jwt ? (
                    Object.entries(decoded.jwt.payload).map(([key, value]) => {
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
                    })
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
              <span className="text-xs font-medium text-cyan flex items-center gap-1.5">
                {verifyResult.status === "valid" ? (
                  <ShieldCheck size={12} className="text-green" />
                ) : verifyResult.status === "invalid" ? (
                  <ShieldX size={12} className="text-pink" />
                ) : (
                  <ShieldQuestion size={12} />
                )}
                Signature Verification
              </span>
              {verifyResult.status !== "unverified" && (
                <span
                  className={`text-xs ${
                    verifyResult.status === "valid"
                      ? "text-green"
                      : verifyResult.status === "invalid"
                        ? "text-pink"
                        : verifyResult.status === "unsupported"
                          ? "text-yellow"
                          : "text-pink"
                  }`}
                >
                  {verifyResult.status === "valid"
                    ? "Signature valid"
                    : verifyResult.status === "invalid"
                      ? "Signature invalid"
                      : verifyResult.status === "unsupported"
                        ? (verifyResult as { message: string }).message
                        : (verifyResult as { message: string }).message}
                </span>
              )}
            </div>
            <div className="px-4 py-3 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={secret}
                onChange={(e) => {
                  setSecret(e.target.value);
                  setVerifyResult({ status: "unverified" });
                }}
                placeholder={`Secret key for ${decoded.jwt && typeof decoded.jwt.header.alg === "string" ? decoded.jwt.header.alg : "HMAC"} verification...`}
                spellCheck={false}
                disabled={!decoded.jwt}
                className="flex-1 rounded border border-border bg-background px-2 py-1.5 text-xs font-mono text-foreground placeholder:text-dim/50 focus:outline-none focus:border-accent/50 disabled:opacity-40"
              />
              <button
                onClick={handleVerify}
                disabled={!decoded.jwt || !secret || verifying}
                className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-background hover:bg-accent/80 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                {verifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
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
                <span className="text-purple">payload</span>
                <span className="text-dim">.</span>
                <span className="text-cyan">signature</span>.
              </p>
              <p>
                The <span className="text-pink">header</span> specifies the
                signing algorithm (e.g. HS256, RS256) and token type.
              </p>
              <p>
                The <span className="text-purple">payload</span> contains claims
                - statements about the user and metadata. Standard claims
                include <span className="text-muted">iss</span> (issuer),{" "}
                <span className="text-muted">sub</span> (subject),{" "}
                <span className="text-muted">exp</span> (expiration), and{" "}
                <span className="text-muted">iat</span> (issued at).
              </p>
              <p>
                The <span className="text-cyan">signature</span> is created by
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
