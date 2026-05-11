"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Info,
  ExternalLink,
  RefreshCw,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { PasteButton } from "@/components/paste-button";
import { Checkbox } from "@/components/checkbox";

// --- UUID / ULID generators ------------------------------------------------

type IdType = "uuidv7" | "uuidv4" | "uuidv1" | "ulid";

const ID_LABELS: Record<IdType, string> = {
  uuidv7: "UUID v7",
  uuidv4: "UUID v4",
  uuidv1: "UUID v1",
  ulid: "ULID",
};

// UUID v4: random
function generateUUIDv4(): string {
  return crypto.randomUUID();
}

// UUID v7: unix timestamp ms (48 bits) + random
function generateUUIDv7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Timestamp: 48 bits big-endian in bytes[0..5]
  bytes[0] = (now / 2 ** 40) & 0xff;
  bytes[1] = (now / 2 ** 32) & 0xff;
  bytes[2] = (now / 2 ** 24) & 0xff;
  bytes[3] = (now / 2 ** 16) & 0xff;
  bytes[4] = (now / 2 ** 8) & 0xff;
  bytes[5] = now & 0xff;

  // Version 7
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Variant 10xx
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return formatUuidBytes(bytes);
}

// UUID v1: timestamp-based (RFC 4122)
let v1ClockSeq =
  (crypto.getRandomValues(new Uint8Array(2))[0] << 8) |
  crypto.getRandomValues(new Uint8Array(2))[1];
const v1Node = crypto.getRandomValues(new Uint8Array(6));
// Set multicast bit to indicate random node
v1Node[0] |= 0x01;

function generateUUIDv1(): string {
  // UUID epoch: Oct 15, 1582 — offset from Unix epoch in 100ns intervals
  const UUID_EPOCH_OFFSET = BigInt("122192928000000000");
  const now100ns = BigInt(Date.now()) * BigInt(10000) + UUID_EPOCH_OFFSET;

  v1ClockSeq = (v1ClockSeq + 1) & 0x3fff;

  const timeLow = Number(now100ns & BigInt(0xffffffff));
  const timeMid = Number((now100ns >> BigInt(32)) & BigInt(0xffff));
  const timeHiAndVersion =
    Number((now100ns >> BigInt(48)) & BigInt(0x0fff)) | 0x1000;
  const clockSeqHi = ((v1ClockSeq >> 8) & 0x3f) | 0x80;
  const clockSeqLow = v1ClockSeq & 0xff;

  const hex = (n: number, len: number) => n.toString(16).padStart(len, "0");

  return [
    hex(timeLow, 8),
    hex(timeMid, 4),
    hex(timeHiAndVersion, 4),
    hex(clockSeqHi, 2) + hex(clockSeqLow, 2),
    Array.from(v1Node)
      .map((b) => hex(b, 2))
      .join(""),
  ].join("-");
}

// ULID: Crockford Base32 encoding
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function generateULID(): string {
  const now = Date.now();
  const random = crypto.getRandomValues(new Uint8Array(10));

  // Encode timestamp (48 bits) as 10 Crockford chars
  let ts = "";
  let t = now;
  for (let i = 9; i >= 0; i--) {
    ts = CROCKFORD[t & 0x1f] + ts;
    t = Math.floor(t / 32);
  }

  // Encode 80 bits of randomness as 16 Crockford chars
  let rand = "";
  // Process random bytes — convert to base32
  // 10 bytes = 80 bits, need 16 base32 chars
  const bits: number[] = [];
  for (const b of random) {
    for (let i = 7; i >= 0; i--) {
      bits.push((b >> i) & 1);
    }
  }
  for (let i = 0; i < 80; i += 5) {
    const val =
      (bits[i] << 4) |
      (bits[i + 1] << 3) |
      (bits[i + 2] << 2) |
      (bits[i + 3] << 1) |
      bits[i + 4];
    rand += CROCKFORD[val];
  }

  return ts + rand;
}

function formatUuidBytes(bytes: Uint8Array): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generate(type: IdType): string {
  switch (type) {
    case "uuidv7":
      return generateUUIDv7();
    case "uuidv4":
      return generateUUIDv4();
    case "uuidv1":
      return generateUUIDv1();
    case "ulid":
      return generateULID();
  }
}

// --- Parsing / inspection ---------------------------------------------------

interface UuidInfo {
  valid: boolean;
  version?: number;
  variant?: string;
  timestamp?: Date;
  type: "uuid" | "ulid" | "unknown";
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

function parseId(input: string): UuidInfo {
  const trimmed = input.trim();

  if (UUID_REGEX.test(trimmed)) {
    const hex = trimmed.replace(/-/g, "");
    const versionNibble = parseInt(hex[12], 16);
    const variantBits = parseInt(hex[16], 16);

    let variant: string;
    if ((variantBits & 0x8) === 0) variant = "NCS (reserved)";
    else if ((variantBits & 0xc) === 0x8) variant = "RFC 4122 / 9562";
    else if ((variantBits & 0xe) === 0xc) variant = "Microsoft (reserved)";
    else variant = "Future (reserved)";

    let timestamp: Date | undefined;

    if (versionNibble === 1) {
      // UUID v1: timestamp in 100ns intervals since UUID epoch
      const timeLow = hex.slice(0, 8);
      const timeMid = hex.slice(8, 12);
      const timeHi = hex.slice(13, 16); // skip version nibble
      const ts100ns = BigInt(`0x${timeHi}${timeMid}${timeLow}`);
      const UUID_EPOCH_OFFSET = BigInt("122192928000000000");
      const unixMs = Number((ts100ns - UUID_EPOCH_OFFSET) / BigInt(10000));
      if (unixMs > 0 && unixMs < 1e16) timestamp = new Date(unixMs);
    } else if (versionNibble === 7) {
      // UUID v7: first 48 bits are unix timestamp ms
      const tsHex = hex.slice(0, 12);
      const ms = parseInt(tsHex, 16);
      if (ms > 0 && ms < 1e16) timestamp = new Date(ms);
    }

    return {
      valid: true,
      version: versionNibble,
      variant,
      timestamp,
      type: "uuid",
    };
  }

  if (ULID_REGEX.test(trimmed)) {
    // Decode timestamp from first 10 Crockford chars
    const DECODE: Record<string, number> = {};
    for (let i = 0; i < CROCKFORD.length; i++) {
      DECODE[CROCKFORD[i]] = i;
      DECODE[CROCKFORD[i].toLowerCase()] = i;
    }
    let ts = 0;
    for (let i = 0; i < 10; i++) {
      ts = ts * 32 + (DECODE[trimmed[i]] ?? 0);
    }
    const timestamp = ts > 0 && ts < 1e16 ? new Date(ts) : undefined;

    return { valid: true, timestamp, type: "ulid" };
  }

  return { valid: false, type: "unknown" };
}

// --- Component --------------------------------------------------------------

export default function UuidPage() {
  const [idType, setIdType] = useState<IdType>("uuidv7");
  const [count, setCount] = useState(1);
  const [generated, setGenerated] = useState<string[]>([]);
  const [inspectInput, setInspectInput] = useState("");
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);

  const handleGenerate = useCallback(() => {
    const ids = Array.from({ length: count }, () => generate(idType));
    setGenerated(ids);
  }, [idType, count]);

  const displayIds = useMemo(() => {
    return generated.map((id) => {
      let out = id;
      if (noDashes && id.includes("-")) out = out.replace(/-/g, "");
      if (uppercase) out = out.toUpperCase();
      else if (idType !== "ulid") out = out.toLowerCase();
      return out;
    });
  }, [generated, uppercase, noDashes, idType]);

  const allText = displayIds.join("\n");

  const inspectResult = useMemo(() => {
    if (!inspectInput.trim()) return null;
    return parseId(inspectInput);
  }, [inspectInput]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          UUID / ULID Generator
        </h1>
        <p className="text-sm text-muted">
          Generate, validate, and inspect UUIDs and ULIDs. Everything runs in
          your browser, nothing is sent to a server.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: generator + inspector */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Generator controls */}
          <div className="rounded-lg border border-border bg-surface/50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-dim">Generate</span>
              <div className="flex items-center gap-2">
                {/* Count controls */}
                <div className="inline-flex items-center rounded border border-border bg-background">
                  <button
                    onClick={() => setCount((c) => Math.max(1, c - 1))}
                    disabled={count <= 1}
                    className="px-1.5 py-1 text-dim hover:text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={count}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v >= 1 && v <= 500) setCount(v);
                    }}
                    className="w-12 text-center bg-transparent text-xs font-mono text-foreground border-x border-border py-1 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[10px] text-dim/50 px-1">/ 500</span>
                  <button
                    onClick={() => setCount((c) => Math.min(500, c + 1))}
                    disabled={count >= 500}
                    className="px-1.5 py-1 text-dim hover:text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <RefreshCw size={12} />
                  Generate
                </button>
              </div>
            </div>

            {/* Type selector */}
            <div className="px-4 py-3 flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border border-border p-0.5 bg-background/50">
                {(Object.keys(ID_LABELS) as IdType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setIdType(type);
                      setGenerated([]);
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      idType === type
                        ? "bg-accent text-background"
                        : "text-dim hover:text-foreground"
                    }`}
                  >
                    {ID_LABELS[type]}
                  </button>
                ))}
              </div>

              {/* Format options */}
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={uppercase}
                  onChange={setUppercase}
                  label="Uppercase"
                />
                {idType !== "ulid" && (
                  <Checkbox
                    checked={noDashes}
                    onChange={setNoDashes}
                    label="No dashes"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="rounded-lg border border-border bg-surface/50">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-xs text-dim">
                {displayIds.length > 0
                  ? `${displayIds.length} ${displayIds.length === 1 ? "ID" : "IDs"} generated`
                  : "Output"}
              </span>
              <div className="flex items-center gap-1.5">
                <CopyButton
                  text={allText}
                  label
                  disabled={displayIds.length === 0}
                />
                {displayIds.length > 0 && (
                  <button
                    onClick={() => setGenerated([])}
                    className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-pink hover:border-pink/30 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="px-3 py-2 min-h-24 max-h-80 overflow-y-auto">
              {displayIds.length > 0 ? (
                <div className="space-y-0.5">
                  {displayIds.map((id, i) => (
                    <div
                      key={i}
                      className="group flex items-center justify-between gap-2"
                    >
                      <code className="text-sm font-mono text-foreground select-all">
                        {id}
                      </code>
                      <CopyButton
                        text={id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dim/30 py-4 text-center">
                  Click Generate to create {ID_LABELS[idType]} identifiers
                </p>
              )}
            </div>
          </div>

          {/* Inspector */}
          <div className="rounded-lg border border-border bg-surface/50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-dim">
                Inspect / Validate
              </span>
              <div className="flex items-center gap-1.5">
                <PasteButton onPaste={(text) => setInspectInput(text)} label />
                {inspectInput && (
                  <button
                    onClick={() => setInspectInput("")}
                    className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-pink hover:border-pink/30 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="px-4 py-3 space-y-3">
              <input
                type="text"
                value={inspectInput}
                onChange={(e) => setInspectInput(e.target.value)}
                placeholder="Paste a UUID or ULID to inspect..."
                spellCheck={false}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm font-mono text-foreground placeholder:text-dim/50 focus:outline-none focus:border-accent/50"
              />

              {inspectResult && (
                <div className="rounded border border-border bg-background px-3 py-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${inspectResult.valid ? "text-green" : "text-pink"}`}
                    >
                      {inspectResult.valid ? "✓ Valid" : "✗ Invalid"}
                    </span>
                    {inspectResult.valid && (
                      <span className="text-xs text-dim font-mono">
                        {inspectResult.type === "uuid"
                          ? `UUID v${inspectResult.version}`
                          : "ULID"}
                      </span>
                    )}
                  </div>
                  {inspectResult.valid && (
                    <div className="text-xs text-dim space-y-0.5">
                      {inspectResult.variant && (
                        <p>
                          <span className="text-muted">Variant:</span>{" "}
                          {inspectResult.variant}
                        </p>
                      )}
                      {inspectResult.timestamp && (
                        <p>
                          <span className="text-muted">Timestamp:</span>{" "}
                          {inspectResult.timestamp.toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "long",
                          })}
                          <span className="ml-1.5 text-dim">
                            ({inspectResult.timestamp.getTime()})
                          </span>
                        </p>
                      )}
                      {inspectResult.type === "uuid" &&
                        inspectResult.version === 4 && (
                          <p className="text-dim">
                            Random UUID - no embedded timestamp
                          </p>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: info & references */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-accent" />
              About UUIDs & ULIDs
            </h3>
            <div className="px-4 py-3 text-[11px] text-dim leading-relaxed space-y-2.5">
              <p>
                All IDs are generated client-side using the Web Crypto API for
                cryptographically secure random values.
              </p>
              <p>
                For a deeper look at UUID versions, ULID, auto-increment
                tradeoffs, and why UUID v7 is the recommended default, see the{" "}
                <a
                  href="/docs/identifier-conventions"
                  className="text-accent hover:underline"
                >
                  Identifier Conventions
                </a>{" "}
                doc.
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
                  href="https://datatracker.ietf.org/doc/html/rfc9562"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 9562 - UUIDs (replaces RFC 4122)
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ulid/spec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  ULID Specification
                </a>
              </li>
              <li>
                <a
                  href="https://en.wikipedia.org/wiki/Universally_unique_identifier"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  Wikipedia - UUID
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
