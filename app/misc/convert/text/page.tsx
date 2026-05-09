"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import {
  Info,
  ExternalLink,
  Trash2,
  Settings2,
  ChevronDown,
} from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { PasteButton } from "@/components/paste-button";
import yaml from "js-yaml";
import * as toml from "smol-toml";
import { encode as toonEncode, decode as toonDecode } from "@toon-format/toon";

// --- Types ------------------------------------------------------------------

type Format =
  | "json"
  | "yaml"
  | "toon"
  | "toml"
  | "xml"
  | "csv"
  | "querystring"
  | "env";

type FormatCategory = "structured" | "config" | "flat";

interface FormatDef {
  id: Format;
  label: string;
  lang: string; // shiki language id
  placeholder: string;
  category: FormatCategory;
  default?: boolean; // shown by default
}

const CATEGORIES: { id: FormatCategory; label: string }[] = [
  { id: "structured", label: "Structured" },
  { id: "config", label: "Config" },
  { id: "flat", label: "Flat" },
];

const FORMATS: FormatDef[] = [
  {
    id: "json",
    label: "JSON",
    lang: "json",
    category: "structured",
    placeholder:
      '{\n  "name": "example",\n  "version": 1,\n  "enabled": true\n}',
    default: true,
  },
  {
    id: "yaml",
    label: "YAML",
    lang: "yaml",
    category: "structured",
    placeholder: "name: example\nversion: 1\nenabled: true",
    default: true,
  },
  {
    id: "toon",
    label: "TOON",
    lang: "yaml",
    category: "structured",
    placeholder: "name: example\nversion: 1\nenabled: true",
  },
  {
    id: "xml",
    label: "XML",
    lang: "xml",
    category: "structured",
    placeholder:
      "<root>\n  <name>example</name>\n  <version>1</version>\n  <enabled>true</enabled>\n</root>",
  },
  {
    id: "toml",
    label: "TOML",
    lang: "toml",
    category: "config",
    placeholder: 'name = "example"\nversion = 1\nenabled = true',
  },
  {
    id: "env",
    label: "ENV",
    lang: "ini",
    category: "config",
    placeholder: 'NAME="example"\nVERSION="1"\nENABLED="true"',
  },
  {
    id: "csv",
    label: "CSV",
    lang: "csv",
    category: "flat",
    placeholder: "name,version,enabled\nexample,1,true",
  },
  {
    id: "querystring",
    label: "Query String",
    lang: "ini",
    category: "flat",
    placeholder: "name=example&version=1&enabled=true",
  },
];

// --- Converters -------------------------------------------------------------

function xmlToObj(xml: string): Record<string, unknown> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error(err.textContent?.split("\n")[0] || "Invalid XML");

  function walk(node: Element): unknown {
    const children = Array.from(node.children);
    if (children.length === 0) return node.textContent ?? "";
    const obj: Record<string, unknown> = {};
    for (const child of children) {
      const key = child.tagName;
      const val = walk(child);
      if (key in obj) {
        const existing = obj[key];
        obj[key] = Array.isArray(existing)
          ? [...existing, val]
          : [existing, val];
      } else {
        obj[key] = val;
      }
    }
    return obj;
  }

  const root = doc.documentElement;
  return walk(root) as Record<string, unknown>;
}

function objToXml(data: unknown, rootTag = "root"): string {
  function escape(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function serialize(key: string, val: unknown, indent: string): string {
    if (Array.isArray(val)) {
      return val.map((v) => serialize(key, v, indent)).join("\n");
    }
    if (val !== null && typeof val === "object") {
      const inner = Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => serialize(k, v, indent + "  "))
        .join("\n");
      return `${indent}<${key}>\n${inner}\n${indent}</${key}>`;
    }
    return `${indent}<${key}>${escape(String(val ?? ""))}</${key}>`;
  }
  if (typeof data !== "object" || data === null) {
    return `<${rootTag}>${escape(String(data))}</${rootTag}>`;
  }
  const inner = Object.entries(data as Record<string, unknown>)
    .map(([k, v]) => serialize(k, v, "  "))
    .join("\n");
  return `<${rootTag}>\n${inner}\n</${rootTag}>`;
}

function envToObj(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) throw new Error(`Invalid line: ${trimmed}`);
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

function objToEnv(data: unknown): string {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("ENV format only supports flat key-value objects.");
  }
  return Object.entries(data as Record<string, unknown>)
    .map(([k, v]) => {
      if (typeof v === "object" && v !== null) {
        throw new Error(
          `ENV format cannot represent nested value for key "${k}".`,
        );
      }
      const val = String(v ?? "");
      const needsQuote = val.includes(" ") || val.includes('"') || val === "";
      return `${k.toUpperCase()}=${needsQuote ? `"${val}"` : val}`;
    })
    .join("\n");
}

function csvToObj(text: string): unknown {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) throw new Error("Empty CSV input.");
  if (lines.length === 1) {
    // Single row: treat as flat key-value (header = keys, no values)
    throw new Error("CSV requires at least a header row and one data row.");
  }
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i] ?? "";
    });
    return obj;
  });
  // If single data row, return as object; multiple rows as array
  return rows.length === 1 ? rows[0] : rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

function objToCsv(data: unknown): string {
  if (Array.isArray(data)) {
    if (data.length === 0)
      throw new Error("Cannot convert empty array to CSV.");
    if (typeof data[0] !== "object" || data[0] === null) {
      throw new Error(
        "CSV requires an array of objects (rows with named columns).",
      );
    }
    const headers = Object.keys(data[0] as Record<string, unknown>);
    const rows = data.map((row) => {
      if (typeof row !== "object" || row === null) {
        throw new Error("CSV requires uniform objects in the array.");
      }
      return headers.map((h) =>
        csvEscape(String((row as Record<string, unknown>)[h] ?? "")),
      );
    });
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);
    for (const [k, v] of entries) {
      if (typeof v === "object" && v !== null) {
        throw new Error(
          `CSV cannot represent nested value for key "${k}". Flatten your data first.`,
        );
      }
    }
    const headers = entries.map(([k]) => k);
    const values = entries.map(([, v]) => csvEscape(String(v ?? "")));
    return [headers.join(","), values.join(",")].join("\n");
  }
  throw new Error("CSV requires an object or array of objects.");
}

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function qsToObj(text: string): Record<string, string> {
  const trimmed = text.trim().replace(/^\?/, "");
  if (!trimmed) throw new Error("Empty query string.");
  const result: Record<string, string> = {};
  for (const pair of trimmed.split("&")) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) {
      result[decodeURIComponent(pair)] = "";
    } else {
      const key = decodeURIComponent(pair.slice(0, eqIdx));
      const val = decodeURIComponent(pair.slice(eqIdx + 1));
      result[key] = val;
    }
  }
  return result;
}

function objToQs(data: unknown): string {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Query string only supports flat key-value objects.");
  }
  return Object.entries(data as Record<string, unknown>)
    .map(([k, v]) => {
      if (typeof v === "object" && v !== null) {
        throw new Error(
          `Query string cannot represent nested value for key "${k}".`,
        );
      }
      return `${encodeURIComponent(k)}=${encodeURIComponent(String(v ?? ""))}`;
    })
    .join("&");
}

function parse(format: Format, text: string): unknown {
  switch (format) {
    case "json":
      return JSON.parse(text);
    case "yaml":
      return yaml.load(text);
    case "toon":
      return toonDecode(text);
    case "toml":
      return toml.parse(text);
    case "xml":
      return xmlToObj(text);
    case "env":
      return envToObj(text);
    case "csv":
      return csvToObj(text);
    case "querystring":
      return qsToObj(text);
  }
}

function serialize(format: Format, data: unknown): string {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);
    case "yaml":
      return yaml.dump(data, { lineWidth: -1, noRefs: true }).trimEnd();
    case "toon":
      return toonEncode(data);
    case "toml":
      return toml.stringify(data as Record<string, unknown>);
    case "xml":
      return objToXml(data);
    case "env":
      return objToEnv(data);
    case "csv":
      return objToCsv(data);
    case "querystring":
      return objToQs(data);
  }
}

// --- Editor Pane ------------------------------------------------------------

function EditorPane({
  value,
  lang,
  placeholder,
  isSource,
  onChange,
  onKeyDown,
}: {
  value: string;
  lang: string;
  placeholder: string;
  isSource: boolean;
  onChange: (text: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="max-h-[600px] overflow-auto min-h-[288px]">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={12}
        spellCheck={false}
        className="w-full min-h-[288px] bg-transparent px-3 py-2 text-sm text-foreground caret-foreground focus:outline-none resize-none font-mono whitespace-pre-wrap break-words placeholder:text-dim/50"
      />
    </div>
  );
}

// --- Page -------------------------------------------------------------------

export default function ConvertPage() {
  const defaultEnabled = FORMATS.filter((f) => f.default).map((f) => f.id);
  const [enabled, setEnabled] = useState<Format[]>(defaultEnabled);
  const [primary, setPrimary] = useState<Format | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [source, setSource] = useState<Format | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const toggleFormat = (id: Format) => {
    setEnabled((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const activeFormats = (() => {
    const base = FORMATS.filter((f) => enabled.includes(f.id));
    if (!primary || !enabled.includes(primary)) return base;
    return [
      ...base.filter((f) => f.id === primary),
      ...base.filter((f) => f.id !== primary),
    ];
  })();

  const handleChange = useCallback(
    (format: Format, text: string) => {
      setSource(format);

      const next: Record<string, string> = { ...values, [format]: text };
      const nextErrors: Record<string, string | null> = {};

      if (!text.trim()) {
        const cleared: Record<string, string> = {};
        for (const f of FORMATS) cleared[f.id] = "";
        setValues(cleared);
        setErrors({});
        return;
      }

      let data: unknown;
      try {
        data = parse(format, text);
      } catch (e) {
        nextErrors[format] = e instanceof Error ? e.message : String(e);
        setValues(next);
        setErrors(nextErrors);
        return;
      }

      if (data === null || data === undefined || typeof data !== "object") {
        nextErrors[format] = "Input must be an object or array.";
        setValues(next);
        setErrors(nextErrors);
        return;
      }

      for (const f of FORMATS) {
        if (f.id !== format && enabled.includes(f.id)) {
          try {
            next[f.id] = serialize(f.id, data);
          } catch (e) {
            next[f.id] = "";
            nextErrors[f.id] =
              `Cannot represent as ${f.label}: ${e instanceof Error ? e.message : String(e)}`;
          }
        }
      }

      setValues(next);
      setErrors(nextErrors);
    },
    [values, enabled],
  );

  const clear = () => {
    const cleared: Record<string, string> = {};
    for (const f of FORMATS) cleared[f.id] = "";
    setValues(cleared);
    setSource(null);
    setErrors({});
  };

  const onKeyDown = useCallback(
    (format: Format, e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const { selectionStart, selectionEnd } = ta;
        const indent = "  ";
        const val = ta.value;
        const updated =
          val.substring(0, selectionStart) +
          indent +
          val.substring(selectionEnd);
        handleChange(format, updated);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = selectionStart + indent.length;
        });
      }
    },
    [handleChange],
  );

  const hasContent = Object.values(values).some((v) => v.trim());

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          Text Format Converter
        </h1>
        <p className="text-sm text-muted">
          Edit any format and the others update instantly. Everything runs in
          your browser.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: editors */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-dim">Primary</label>
            <div className="relative">
              <select
                value={primary ?? ""}
                onChange={(e) => setPrimary((e.target.value as Format) || null)}
                className="appearance-none rounded border border-border bg-surface/50 pl-3 pr-7 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent/40 cursor-pointer"
              >
                <option value="">Auto</option>
                {FORMATS.filter((f) => enabled.includes(f.id)).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-dim pointer-events-none"
              />
            </div>
            <button
              onClick={clear}
              disabled={!hasContent}
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-dim hover:text-pink hover:border-pink/30 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <Trash2 size={12} />
              Clear all
            </button>
          </div>
          {activeFormats.map((f) => (
            <div key={f.id}>
              <div
                className={`rounded-lg border bg-surface/50 transition-colors ${
                  errors[f.id]
                    ? "border-pink/40"
                    : source === f.id
                      ? "border-accent/40"
                      : "border-border"
                }`}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-xs font-medium text-foreground">
                    {f.label}
                    {errors[f.id] && (
                      <span className="ml-2 text-pink font-normal">
                        Invalid
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] text-dim tabular-nums transition-opacity ${values[f.id] ? "opacity-100" : "opacity-0"}`}
                    >
                      {(values[f.id]?.length ?? 0).toLocaleString()} chars
                    </span>
                    <CopyButton
                      text={values[f.id] || ""}
                      label
                      disabled={!values[f.id]}
                    />
                    <PasteButton
                      onPaste={(text) => handleChange(f.id, text)}
                      label
                    />
                  </div>
                </div>
                <EditorPane
                  value={values[f.id] || ""}
                  lang={f.lang}
                  placeholder={f.placeholder}
                  isSource={source === f.id}
                  onChange={(text) => handleChange(f.id, text)}
                  onKeyDown={(e) => onKeyDown(f.id, e)}
                />
                {errors[f.id] && (
                  <div className="px-3 py-2 border-t border-pink/20 bg-pink/5 text-xs text-pink font-mono break-all">
                    {errors[f.id]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right: info sidebar */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          {/* Format toggles */}
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Settings2 size={12} className="text-accent" />
                Formats
              </span>
              <button
                onClick={() =>
                  setEnabled((prev) =>
                    prev.length === FORMATS.length
                      ? FORMATS.filter((f) => f.default).map((f) => f.id)
                      : FORMATS.map((f) => f.id),
                  )
                }
                className="text-[10px] text-dim hover:text-accent transition-colors cursor-pointer font-normal normal-case tracking-normal"
              >
                {enabled.length === FORMATS.length ? "Reset" : "All"}
              </button>
            </h3>
            <div className="px-4 py-3 space-y-3">
              {CATEGORIES.map((cat) => {
                const formats = FORMATS.filter((f) => f.category === cat.id);
                return (
                  <div key={cat.id}>
                    <span className="text-[10px] text-dim uppercase tracking-wider">
                      {cat.label}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {formats.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => toggleFormat(f.id)}
                          className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                            enabled.includes(f.id)
                              ? "border-accent/40 bg-accent/10 text-accent"
                              : "border-border text-dim hover:text-foreground hover:border-border"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-accent" />
              About
            </h3>
            <div className="px-4 py-3 text-[11px] text-dim leading-relaxed space-y-2.5">
              <p>
                <span className="text-muted">JSON</span> (JavaScript Object
                Notation) is the most common data interchange format on the web.
                Strict syntax: double-quoted keys, no comments, no trailing
                commas. JSONC (JSON with Comments) relaxes some of these rules
                but isn&apos;t widely supported outside of editors and tooling
                configs.
              </p>
              <p>
                <span className="text-muted">YAML</span> (YAML Ain&apos;t Markup
                Language) is a human-readable format popular in configuration
                files. Indentation-based, supports comments and multi-line
                strings.
              </p>
              <p>
                <span className="text-muted">TOON</span> (Token-Oriented Object
                Notation) is a compact format designed for LLM prompts. Combines
                YAML-like indentation with CSV-style tabular arrays for 20-40%
                fewer tokens than JSON.
              </p>
              <p>
                <span className="text-muted">TOML</span> (Tom&apos;s Obvious
                Minimal Language) is designed for config files. Explicit typing,
                clean table syntax, and native datetime support.
              </p>
              <p>
                <span className="text-muted">XML</span> (Extensible Markup
                Language) is a verbose but universal format used in configs,
                APIs, and document interchange. Supports attributes, namespaces,
                and schemas.
              </p>
              <p>
                <span className="text-muted">ENV</span> (dotenv) is a flat
                key=value format used for environment variables. Natively flat
                with string values, though some tools support variable expansion
                and prefixed key conventions for grouping.
              </p>
              <p>
                <span className="text-muted">CSV</span> (Comma-Separated Values)
                is a tabular format. Works best with flat objects or arrays of
                uniform objects. Nesting can be emulated with dot-notation
                column names, but isn&apos;t part of the spec.
              </p>
              <p>
                <span className="text-muted">Query String</span> is the
                key=value format from URLs ({`?a=1&b=2`}). Supports array
                notation ({`key[]=1&key[]=2`}) and dot/bracket nesting (
                {`user[name]=x`}) in many frameworks.
              </p>
              <p>
                Each format has tradeoffs. Some conversions may be lossy, e.g.
                TOML can&apos;t represent heterogeneous arrays and flat formats
                can&apos;t represent nesting.
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
                  href="https://www.json.org/json-en.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  json.org - JSON specification
                </a>
              </li>
              <li>
                <a
                  href="https://yaml.org/spec/1.2.2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  YAML 1.2 specification
                </a>
              </li>
              <li>
                <a
                  href="https://toonformat.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  toonformat.dev - TOON specification
                </a>
              </li>
              <li>
                <a
                  href="https://toml.io/en/v1.0.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  TOML v1.0.0 specification
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc8259"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 8259 - JSON (IETF)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
