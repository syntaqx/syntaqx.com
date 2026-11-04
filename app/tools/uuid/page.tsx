"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Info, ExternalLink, RefreshCw } from "lucide-react";
import { ClearButton, OptionCheckbox, Stat } from "@/components/tool-controls";
import { cn } from "@/lib/cn";
import { uuidv7 } from "@/lib/uuid";
import { Button } from "@/registry/syntaqx/ui/button";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";
import { NumberInput } from "@/registry/syntaqx/ui/number-input";
import { PasteButton } from "@/registry/syntaqx/ui/paste-button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/syntaqx/ui/toggle-group";

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
  const timeHiAndVersion = Number((now100ns >> BigInt(48)) & BigInt(0x0fff)) | 0x1000;
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
      (bits[i] << 4) | (bits[i + 1] << 3) | (bits[i + 2] << 2) | (bits[i + 3] << 1) | bits[i + 4];
    rand += CROCKFORD[val];
  }

  return ts + rand;
}

function generate(type: IdType): string {
  switch (type) {
    case "uuidv7":
      return uuidv7();
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

const MAX_COUNT = 500;

export default function UuidPage() {
  const [idType, setIdType] = useState<IdType>("uuidv7");
  // null while the field is empty mid-edit; Generate treats that as 1.
  const [count, setCount] = useState<number | null>(1);
  const [generated, setGenerated] = useState<string[]>([]);
  const [inspectInput, setInspectInput] = useState("");
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);

  const handleGenerate = useCallback(() => {
    const n = Math.min(MAX_COUNT, Math.max(1, count ?? 1));
    const ids = Array.from({ length: n }, () => generate(idType));
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
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">UUID / ULID Generator</h1>
        <p className="max-w-2xl text-muted-foreground">
          Generate, validate, and inspect UUIDs and ULIDs. Everything runs in your browser, nothing
          is sent to a server.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: generator + inspector */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Generator controls */}
          <div className="border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border">
              <span className="text-sm font-medium">Generate</span>
              <div className="flex items-center gap-2">
                <NumberInput
                  size="sm"
                  aria-label="How many"
                  min={1}
                  max={MAX_COUNT}
                  value={count}
                  onValueChange={setCount}
                  className="w-32 font-mono"
                />
                <Stat>max {MAX_COUNT}</Stat>
                <Button size="sm" onClick={handleGenerate}>
                  <RefreshCw />
                  Generate
                </Button>
              </div>
            </div>

            {/* Type selector */}
            <div className="px-4 py-3 flex flex-wrap items-center gap-3">
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                aria-label="ID type"
                value={idType}
                onValueChange={(type) => {
                  if (!type) return;
                  setIdType(type as IdType);
                  setGenerated([]);
                }}
                className="flex-wrap"
              >
                {(Object.keys(ID_LABELS) as IdType[]).map((type) => (
                  <ToggleGroupItem key={type} value={type}>
                    {ID_LABELS[type]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              {/* Format options */}
              <div className="flex items-center gap-3">
                <OptionCheckbox
                  checked={uppercase}
                  onCheckedChange={setUppercase}
                  label="Uppercase"
                />
                {idType !== "ulid" && (
                  <OptionCheckbox
                    checked={noDashes}
                    onCheckedChange={setNoDashes}
                    label="No dashes"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="border border-border bg-card">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-sm font-medium">
                {displayIds.length > 0
                  ? `${displayIds.length} ${displayIds.length === 1 ? "ID" : "IDs"} generated`
                  : "Output"}
              </span>
              <div className="flex items-center gap-1.5">
                <CopyButton
                  value={allText}
                  disabled={displayIds.length === 0}
                  variant="outline"
                  size="sm"
                />
                {displayIds.length > 0 && <ClearButton onClick={() => setGenerated([])} />}
              </div>
            </div>
            <div className="px-3 py-2 min-h-24 max-h-80 overflow-y-auto">
              {displayIds.length > 0 ? (
                <div className="space-y-0.5">
                  {displayIds.map((id, i) => (
                    <div key={i} className="group flex items-center justify-between gap-2">
                      <code className="text-sm font-mono text-foreground select-all">{id}</code>
                      <CopyButton
                        value={id}
                        className="opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                        size="icon-sm"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Click Generate to create {ID_LABELS[idType]} identifiers
                </p>
              )}
            </div>
          </div>

          {/* Inspector */}
          <div className="border border-border bg-card">
            <Field className="gap-0">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
                <FieldLabel>Inspect / Validate</FieldLabel>
                <div className="flex items-center gap-1.5">
                  <PasteButton
                    variant="outline"
                    size="sm"
                    onPaste={(text) => setInspectInput(text)}
                  />
                  {inspectInput && <ClearButton onClick={() => setInspectInput("")} />}
                </div>
              </div>
              <div className="px-4 py-3 space-y-3">
                <Input
                  value={inspectInput}
                  onChange={(e) => setInspectInput(e.target.value)}
                  placeholder="Paste a UUID or ULID to inspect..."
                  spellCheck={false}
                  className="font-mono"
                />

                {inspectResult && (
                  <div className="rounded-md border px-3 py-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          inspectResult.valid ? "text-primary" : "text-destructive",
                        )}
                      >
                        {inspectResult.valid ? "✓ Valid" : "✗ Invalid"}
                      </span>
                      {inspectResult.valid && (
                        <span className="text-sm text-muted-foreground font-mono">
                          {inspectResult.type === "uuid"
                            ? `UUID v${inspectResult.version}`
                            : "ULID"}
                        </span>
                      )}
                    </div>
                    {inspectResult.valid && (
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        {inspectResult.variant && (
                          <p>
                            <span className="text-foreground">Variant:</span>{" "}
                            {inspectResult.variant}
                          </p>
                        )}
                        {inspectResult.timestamp && (
                          <p>
                            <span className="text-foreground">Timestamp:</span>{" "}
                            {inspectResult.timestamp.toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "long",
                            })}
                            <span className="ml-1.5 text-muted-foreground">
                              ({inspectResult.timestamp.getTime()})
                            </span>
                          </p>
                        )}
                        {inspectResult.type === "uuid" && inspectResult.version === 4 && (
                          <p className="text-muted-foreground">
                            Random UUID - no embedded timestamp
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Field>
          </div>
        </div>

        {/* Right: info & references */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-primary" />
              About UUIDs & ULIDs
            </h3>
            <div className="px-4 py-3 text-[11px] text-muted-foreground leading-relaxed space-y-2.5">
              <p>
                All IDs are generated client-side using the Web Crypto API for cryptographically
                secure random values.
              </p>
              <p>
                For a deeper look at UUID versions, ULID, auto-increment tradeoffs, and why UUID v7
                is the recommended default, see the{" "}
                <Link
                  href="/docs/fundamentals/identifier-conventions"
                  className="text-primary hover:underline"
                >
                  Identifier Conventions
                </Link>{" "}
                doc.
              </p>
            </div>
          </div>

          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border flex items-center gap-1.5">
              <ExternalLink size={12} className="text-primary" />
              References
            </h3>
            <ul className="px-4 py-3 text-[11px] leading-relaxed space-y-1.5">
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc9562"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  RFC 9562 - UUIDs (replaces RFC 4122)
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ulid/spec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  ULID Specification
                </a>
              </li>
              <li>
                <a
                  href="https://en.wikipedia.org/wiki/Universally_unique_identifier"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
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
