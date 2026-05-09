"use client";

import { useState, useCallback, useRef, type DragEvent } from "react";
import { Trash2, Upload, FileText, Info, ExternalLink } from "lucide-react";
import { PasteButton } from "@/components/paste-button";
import { Checkbox } from "@/components/checkbox";
import { CopyButton } from "@/components/copy-button";

// --- Helpers ----------------------------------------------------------------

function toBase64(input: string, charset: string): string {
  if (charset === "utf-8") {
    return btoa(
      new TextEncoder()
        .encode(input)
        .reduce((s, b) => s + String.fromCharCode(b), ""),
    );
  }
  return btoa(input); // ascii / latin1
}

function fromBase64(input: string, charset: string): string {
  const raw = atob(input);
  if (charset === "utf-8") {
    return new TextDecoder("utf-8").decode(
      Uint8Array.from(raw, (c) => c.charCodeAt(0)),
    );
  }
  return raw;
}

function processValue(
  value: string,
  dir: "encode" | "decode",
  charset: string,
  perLine: boolean,
): { output: string; error: string | null } {
  if (!value) return { output: "", error: null };

  if (perLine) {
    const lines = value.split("\n");
    const results: string[] = [];
    for (const line of lines) {
      if (!line) {
        results.push("");
        continue;
      }
      try {
        results.push(
          dir === "encode"
            ? toBase64(line, charset)
            : fromBase64(line, charset),
        );
      } catch {
        return {
          output: "",
          error:
            dir === "decode"
              ? "Invalid Base64 on one or more lines"
              : "Input contains characters that cannot be encoded",
        };
      }
    }
    return { output: results.join("\n"), error: null };
  }

  try {
    return {
      output:
        dir === "encode"
          ? toBase64(value, charset)
          : fromBase64(value, charset),
      error: null,
    };
  } catch {
    return {
      output: "",
      error:
        dir === "decode"
          ? "Invalid Base64 string"
          : "Input contains characters that cannot be encoded",
    };
  }
}

function byteSize(str: string): string {
  const bytes = new TextEncoder().encode(str).length;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// --- Components -------------------------------------------------------------

// --- Page -------------------------------------------------------------------

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("decode");
  const [charset, setCharset] = useState("utf-8");
  const [perLine, setPerLine] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = useCallback(
    (value: string, dir: "encode" | "decode", cs: string, pl: boolean) => {
      setInput(value);
      const { output: out, error: err } = processValue(value, dir, cs, pl);
      setOutput(out);
      setError(err);
    },
    [],
  );

  const switchMode = (next: "encode" | "decode") => {
    if (next === mode) return;
    setMode(next);
    setInput("");
    setOutput("");
    setError(null);
    setFileName(null);
  };

  const changeCharset = (cs: string) => {
    setCharset(cs);
    if (input) run(input, mode, cs, perLine);
  };

  const togglePerLine = () => {
    const next = !perLine;
    setPerLine(next);
    if (input) run(input, mode, charset, next);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError(null);
    setFileName(null);
  };

  const loadFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      run(text, mode, charset, perLine);
    };
    reader.readAsText(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const inputLabel = mode === "encode" ? "Plain text" : "Base64 string";
  const outputLabel = mode === "encode" ? "Base64 output" : "Decoded text";
  const placeholder =
    mode === "encode"
      ? "Paste, drop a file, or type text to encode..."
      : "Paste, drop a file, or type Base64 to decode...";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          Base64 Decode / Encode
        </h1>
        <p className="text-sm text-muted">
          Decode or encode Base64 strings. Everything runs in your browser,
          nothing is sent to a server.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: tool */}
        <div className="flex-1 min-w-0">
          {/* Segmented control — decode first */}
          <div className="mb-5 inline-flex rounded-lg border border-border p-0.5 bg-surface/50">
            <button
              onClick={() => switchMode("decode")}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                mode === "decode"
                  ? "bg-accent text-background"
                  : "text-dim hover:text-foreground"
              }`}
            >
              Decode
            </button>
            <button
              onClick={() => switchMode("encode")}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                mode === "encode"
                  ? "bg-accent text-background"
                  : "text-dim hover:text-foreground"
              }`}
            >
              Encode
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Input card */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={() => setDragging(false)}
              className={`rounded-lg border bg-surface/50 transition-colors ${
                dragging ? "border-accent border-dashed" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <label className="text-xs text-dim flex items-center gap-1.5">
                  {inputLabel}
                  {fileName && (
                    <span className="inline-flex items-center gap-1 text-accent">
                      <FileText size={10} />
                      {fileName}
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-1.5">
                  {input && (
                    <span className="text-[10px] text-dim tabular-nums">
                      {input.length.toLocaleString()} chars &middot;{" "}
                      {byteSize(input)}
                    </span>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer"
                  >
                    <Upload size={12} />
                    File
                  </button>
                  <PasteButton
                    onPaste={(text) => {
                      setFileName(null);
                      run(text, mode, charset, perLine);
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
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) loadFile(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => {
                  setFileName(null);
                  run(e.target.value, mode, charset, perLine);
                }}
                placeholder={placeholder}
                rows={8}
                spellCheck={false}
                className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-dim/50 focus:outline-none resize-y font-mono"
              />
              {/* Card footer: options */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-dim">Charset</label>
                  <select
                    value={charset}
                    onChange={(e) => changeCharset(e.target.value)}
                    className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent/50 cursor-pointer"
                  >
                    <option value="utf-8">UTF-8</option>
                    <option value="ascii">ASCII / Latin1</option>
                  </select>
                </div>
                <Checkbox
                  checked={perLine}
                  onChange={togglePerLine}
                  label="Each line separately"
                  tooltip="Treat each line as an independent value. Useful when you have multiple Base64 strings separated by newlines."
                />
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-xs text-pink">{error}</p>}

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-dim">{outputLabel}</label>
                <div className="flex items-center gap-1.5">
                  {output && (
                    <span className="text-[10px] text-dim tabular-nums">
                      {output.length.toLocaleString()} chars &middot;{" "}
                      {byteSize(output)}
                    </span>
                  )}
                  {output && <CopyButton text={output} label />}
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                rows={8}
                className="w-full rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-foreground focus:outline-none resize-y font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right: info & references */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          {/* Info */}
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-accent" />
              About Base64
            </h3>
            <div className="px-4 py-3 text-[11px] text-dim leading-relaxed space-y-2.5">
              <p>
                Base64 is an encoding scheme that converts binary data into
                ASCII text using a 64-character alphabet:{" "}
                <span className="text-muted">A-Z</span>,{" "}
                <span className="text-muted">a-z</span>,{" "}
                <span className="text-muted">0-9</span>,{" "}
                <span className="text-muted">+</span>, and{" "}
                <span className="text-muted">/</span>, with{" "}
                <span className="text-muted">=</span> for padding.
              </p>
              <p>
                Every 3 bytes of input produce 4 characters of output,
                increasing size by roughly 33%.
              </p>
              <p>
                <span className="text-muted">Common uses:</span> email
                attachments (MIME), data URIs, JSON Web Tokens (JWTs), embedding
                images in CSS/HTML, and transmitting binary data through
                text-only protocols.
              </p>
              <p>
                A URL-safe variant replaces{" "}
                <span className="text-muted">+</span> and{" "}
                <span className="text-muted">/</span> with{" "}
                <span className="text-muted">-</span> and{" "}
                <span className="text-muted">_</span> to avoid conflicts in URLs
                and filenames (RFC 4648 &sect;5).
              </p>
              <p>
                Base64 is <span className="text-muted">not encryption</span>. It
                provides no security. Anyone can decode it.
              </p>
            </div>
          </div>

          {/* References */}
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <ExternalLink size={12} className="text-accent" />
              References
            </h3>
            <ul className="px-4 py-3 text-[11px] leading-relaxed space-y-1.5">
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc4648"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 4648 &mdash; Base Encodings
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc2045#section-6.8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 2045 &sect;6.8 &mdash; MIME Base64
                </a>
              </li>
              <li>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Glossary/Base64"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  MDN &mdash; Base64 glossary
                </a>
              </li>
              <li>
                <a
                  href="https://en.wikipedia.org/wiki/Base64"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  Wikipedia &mdash; Base64
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
