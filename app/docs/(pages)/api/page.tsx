"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Play,
  Server,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types for OpenAPI 3.1
// ---------------------------------------------------------------------------

interface OpenApiSpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers?: { url: string; description?: string }[];
  paths?: Record<string, Record<string, PathOperation>>;
  components?: { schemas?: Record<string, SchemaObject> };
}

interface RequestBodyObject {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: SchemaObject }>;
}

interface PathOperation {
  summary?: string;
  description?: string;
  tags?: string[];
  requestBody?: RequestBodyObject;
  responses?: Record<string, ResponseObject>;
}

interface ResponseObject {
  description?: string;
  content?: Record<string, { schema?: SchemaObject }>;
}

interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  enum?: string[];
  $ref?: string;
  description?: string;
  const?: string;
  example?: unknown;
  default?: unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const METHOD_COLORS: Record<string, string> = {
  get: "text-accent bg-accent/10 border-accent/25",
  post: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  put: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  patch: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  delete: "text-red-400 bg-red-400/10 border-red-400/20",
};

function resolveRef(spec: OpenApiSpec, schema: SchemaObject): SchemaObject {
  if (schema.$ref) {
    const name = schema.$ref.replace("#/components/schemas/", "");
    return spec.components?.schemas?.[name] || schema;
  }
  return schema;
}

function schemaToExample(spec: OpenApiSpec, schema: SchemaObject): unknown {
  const resolved = resolveRef(spec, schema);
  if (resolved.example !== undefined) return resolved.example;
  if (resolved.const) return resolved.const;
  if (resolved.enum) return resolved.enum[0];
  if (resolved.type === "object" && resolved.properties) {
    const obj: Record<string, unknown> = {};
    for (const [key, prop] of Object.entries(resolved.properties)) {
      const p = resolveRef(spec, prop);
      if (p.example !== undefined) {
        obj[key] = p.example;
      } else if (p.default !== undefined) {
        obj[key] = p.default;
      } else {
        obj[key] = schemaToExample(spec, p);
      }
    }
    return obj;
  }
  if (resolved.type === "array" && resolved.items) {
    return [schemaToExample(spec, resolved.items)];
  }
  if (resolved.default !== undefined) return resolved.default;
  switch (resolved.type) {
    case "string":
      return "string";
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return true;
    default:
      return {};
  }
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-dim hover:text-accent transition-colors"
      aria-label="Copy"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function SchemaTable({
  spec,
  schema,
}: {
  spec: OpenApiSpec;
  schema: SchemaObject;
}) {
  const resolved = resolveRef(spec, schema);
  if (!resolved.properties) return null;
  const required = resolved.required || [];

  return (
    <div className="border border-border overflow-hidden">
      <div className="inst grid grid-cols-[1fr_1fr_2fr] text-dim px-4 py-2.5 border-b border-border bg-surface">
        <span>Field</span>
        <span>Type</span>
        <span>Description</span>
      </div>
      {Object.entries(resolved.properties).map(([name, prop]) => {
        const p = resolveRef(spec, prop);
        return (
          <div
            key={name}
            className="grid grid-cols-[1fr_1fr_2fr] px-4 py-2 border-b border-border last:border-b-0 text-xs"
          >
            <span className="font-mono text-foreground">
              {name}
              {required.includes(name) && (
                <span className="text-red-400 ml-0.5">*</span>
              )}
            </span>
            <span className="text-dim">
              {p.const ? `"${p.const}"` : p.type || "object"}
            </span>
            <span className="text-muted">{p.description || ""}</span>
          </div>
        );
      })}
    </div>
  );
}

function Endpoint({
  method,
  path,
  op,
  spec,
  baseUrl,
}: {
  method: string;
  path: string;
  op: PathOperation;
  spec: OpenApiSpec;
  baseUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [trying, setTrying] = useState(false);
  const [result, setResult] = useState<{ status: number; body: string } | null>(
    null,
  );

  const hasBody = ["post", "put", "patch"].includes(method);
  const reqBodySchema = op.requestBody?.content?.["application/json"]?.schema;
  const resolvedReqBody = reqBodySchema
    ? resolveRef(spec, reqBodySchema)
    : null;
  const defaultBody = resolvedReqBody
    ? JSON.stringify(schemaToExample(spec, resolvedReqBody), null, 2)
    : "{}";
  const [reqBody, setReqBody] = useState(defaultBody);

  const responses = op.responses || {};

  async function tryIt() {
    setTrying(true);
    try {
      const fetchOptions: RequestInit = { method: method.toUpperCase() };
      if (hasBody) {
        fetchOptions.headers = { "Content-Type": "application/json" };
        fetchOptions.body = reqBody;
      }
      const res = await fetch(`${baseUrl}${path}`, fetchOptions);
      const text = await res.text();
      let body: string;
      try {
        body = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        body = text;
      }
      setResult({ status: res.status, body });
    } catch (e) {
      setResult({ status: 0, body: String(e) });
    } finally {
      setTrying(false);
    }
  }

  return (
    <div className="border-b border-border">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-3 py-3.5 text-left hover:bg-surface transition-colors cursor-pointer"
      >
        {open ? (
          <ChevronDown size={14} className="text-dim shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-dim shrink-0" />
        )}
        <span
          className={`inst w-14 shrink-0 border py-1 text-center ${METHOD_COLORS[method] || "text-dim"}`}
        >
          {method}
        </span>
        <span className="font-mono text-sm text-foreground">{path}</span>
        <span className="ml-auto hidden text-sm text-dim sm:inline">
          {op.summary}
        </span>
      </button>

      {open && (
        <div className="border-t border-border">
          {/* Description */}
          {op.description && (
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs text-muted">{op.description}</p>
            </div>
          )}

          {/* Request Body */}
          {hasBody && (
            <div className="px-4 py-3 border-b border-border space-y-3">
              <h4 className="inst text-dim">
                Request Body
                {op.requestBody?.required && (
                  <span className="text-red-400 ml-1">required</span>
                )}
              </h4>
              {resolvedReqBody?.properties && (
                <SchemaTable spec={spec} schema={resolvedReqBody} />
              )}
            </div>
          )}

          {/* Responses */}
          <div className="px-4 py-3 space-y-4">
            <h4 className="inst text-dim">Responses</h4>
            {Object.entries(responses).map(([code, res]) => {
              const resObj = res as ResponseObject;
              const jsonContent = resObj.content?.["application/json"];
              const schema = jsonContent?.schema;
              const resolvedSchema = schema ? resolveRef(spec, schema) : null;
              const example = resolvedSchema
                ? JSON.stringify(schemaToExample(spec, resolvedSchema), null, 2)
                : null;

              return (
                <div key={code} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold ${code.startsWith("2") ? "text-emerald-400" : code.startsWith("4") ? "text-amber-400" : "text-red-400"}`}
                    >
                      {code}
                    </span>
                    <span className="text-xs text-dim">
                      {resObj.description}
                    </span>
                  </div>
                  {resolvedSchema?.properties && (
                    <SchemaTable spec={spec} schema={resolvedSchema} />
                  )}
                  {example && (
                    <div className="relative">
                      <div className="absolute top-2 right-2">
                        <CopyBtn text={example} />
                      </div>
                      <pre className="text-[11px] font-mono bg-background border border-border p-3 overflow-x-auto text-muted">
                        {example}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Try it */}
          <div className="px-4 py-3 border-t border-border space-y-3">
            {hasBody && (
              <div>
                <label className="inst mb-2 block text-dim">Body</label>
                <textarea
                  value={reqBody}
                  onChange={(e) => setReqBody(e.target.value)}
                  spellCheck={false}
                  rows={Math.min(12, defaultBody.split("\n").length + 1)}
                  className="w-full font-mono text-[11px] bg-background border border-border p-3 text-foreground resize-y focus:outline-none focus:border-accent/50"
                />
              </div>
            )}
            <button
              onClick={tryIt}
              disabled={trying}
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
            >
              <Play size={12} />
              {trying ? "Sending..." : "Try it"}
            </button>
            {(result || trying) && (
              <div className={`mt-3 relative ${trying ? "opacity-50" : ""}`}>
                {result && (
                  <>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-xs font-mono font-bold ${result.status >= 200 && result.status < 300 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {result.status || "Error"}
                      </span>
                    </div>
                    <div className="absolute top-0 right-0">
                      <CopyBtn text={result.body} />
                    </div>
                    <pre className="text-[11px] font-mono bg-background border border-border p-3 overflow-x-auto text-muted">
                      {result.body}
                    </pre>
                  </>
                )}
                {trying && !result && (
                  <div className="h-16 bg-border/20 animate-pulse" />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<OpenApiSpec | null>(null);
  const [serverIdx, setServerIdx] = useState<number | null>(null);

  useEffect(() => {
    const load = () =>
      fetch("/api/v1/openapi")
        .then((r) => r.json())
        .then((data: OpenApiSpec) => {
          setSpec(data);
          if (serverIdx === null && data.servers?.length) {
            // Default to localhost in dev, production otherwise
            const isLocal =
              typeof window !== "undefined" &&
              window.location.hostname === "localhost";
            const idx = isLocal
              ? (data.servers.findIndex((s) => s.url.includes("localhost")) ??
                0)
              : 0;
            setServerIdx(idx >= 0 ? idx : 0);
          }
        })
        .catch(console.error);

    load();

    // In development, poll for spec changes so edits auto-refresh
    if (process.env.NODE_ENV === "development") {
      const id = setInterval(load, 2000);
      return () => clearInterval(id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!spec) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-border/40 animate-pulse" />
        <div className="h-4 w-96 bg-border/40 animate-pulse" />
        <div className="h-32 bg-border/20 animate-pulse" />
      </div>
    );
  }

  // Group endpoints by tag
  const grouped: Record<
    string,
    { method: string; path: string; op: PathOperation }[]
  > = {};
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(methods)) {
      const tag = op.tags?.[0] || "Other";
      if (!grouped[tag]) grouped[tag] = [];
      grouped[tag].push({ method, path, op });
    }
  }

  const servers = spec.servers || [];
  const activeServer = servers[serverIdx ?? 0];
  const baseUrl = activeServer?.url || "";

  return (
    <div>
      {/* Header */}
      <header className="mb-8 border-b border-border pb-8">
        <p className="eyebrow mb-5">api reference</p>
        <h1 className="mb-4 text-4xl leading-[0.9] sm:text-5xl">
          {spec.info.title}
        </h1>
        <p className="max-w-2xl text-lg text-dim">{spec.info.description}</p>
        <p className="inst mt-5 text-dim">
          v{spec.info.version} · openapi {spec.openapi} ·{" "}
          {Object.values(grouped).flat().length} endpoints
        </p>
      </header>

      {/* Base URL */}
      {servers.length > 0 && (
        <div className="mb-12 flex flex-wrap items-stretch border border-border">
          <span className="inst flex items-center gap-2 border-r border-border bg-surface px-4 py-3 text-dim">
            <Server size={12} className="text-accent" />
            base url
          </span>
          {servers.map((s, i) => {
            const active = i === (serverIdx ?? 0);
            return servers.length === 1 ? (
              <code
                key={s.url}
                className="flex items-center px-4 py-3 font-mono text-sm break-all text-foreground"
              >
                {s.url}
              </code>
            ) : (
              <button
                key={s.url}
                onClick={() => setServerIdx(i)}
                title={s.description}
                aria-pressed={active}
                className={`relative border-r border-border px-4 py-3 font-mono text-sm break-all transition-colors cursor-pointer after:absolute after:inset-x-4 after:-bottom-px after:h-0.5 ${
                  active
                    ? "text-foreground after:bg-accent"
                    : "text-dim hover:text-foreground"
                }`}
              >
                {s.url}
              </button>
            );
          })}
        </div>
      )}

      {/* Endpoints by tag */}
      <div className="space-y-12">
        {Object.entries(grouped).map(([tag, endpoints]) => (
          <section key={tag}>
            <h2 className="eyebrow mb-3">{tag}</h2>
            <div className="border-t border-border">
              {endpoints.map((ep) => (
                <Endpoint
                  key={`${ep.method}-${ep.path}`}
                  method={ep.method}
                  path={ep.path}
                  op={ep.op}
                  spec={spec}
                  baseUrl={baseUrl}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
