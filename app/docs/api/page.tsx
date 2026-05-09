"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Play,
  Server,
  Globe,
  Info,
  ExternalLink,
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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const METHOD_COLORS: Record<string, string> = {
  get: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
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
  if (resolved.const) return resolved.const;
  if (resolved.enum) return resolved.enum[0];
  if (resolved.type === "object" && resolved.properties) {
    const obj: Record<string, unknown> = {};
    for (const [key, prop] of Object.entries(resolved.properties)) {
      obj[key] = schemaToExample(spec, prop);
    }
    return obj;
  }
  if (resolved.type === "array" && resolved.items) {
    return [schemaToExample(spec, resolved.items)];
  }
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
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_2fr] text-[10px] uppercase tracking-widest text-dim px-4 py-2 border-b border-border bg-surface/50">
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
    <div className="rounded-lg border border-border bg-surface/50">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface transition-colors"
      >
        {open ? (
          <ChevronDown size={14} className="text-dim shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-dim shrink-0" />
        )}
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${METHOD_COLORS[method] || "text-dim"}`}
        >
          {method}
        </span>
        <span className="font-mono text-sm text-foreground">{path}</span>
        <span className="text-xs text-dim ml-auto hidden sm:inline">
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
              <h4 className="text-[10px] uppercase tracking-widest text-dim">
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
            <h4 className="text-[10px] uppercase tracking-widest text-dim">
              Responses
            </h4>
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
                      <pre className="text-[11px] font-mono bg-background border border-border rounded-lg p-3 overflow-x-auto text-muted">
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
                <label className="text-[10px] uppercase tracking-widest text-dim block mb-1.5">
                  Body
                </label>
                <textarea
                  value={reqBody}
                  onChange={(e) => setReqBody(e.target.value)}
                  spellCheck={false}
                  rows={Math.min(12, defaultBody.split("\n").length + 1)}
                  className="w-full font-mono text-[11px] bg-background border border-border rounded-lg p-3 text-foreground resize-y focus:outline-none focus:border-accent/50"
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
                    <pre className="text-[11px] font-mono bg-background border border-border rounded-lg p-3 overflow-x-auto text-muted">
                      {result.body}
                    </pre>
                  </>
                )}
                {trying && !result && (
                  <div className="h-16 rounded-lg bg-border/20 animate-pulse" />
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

  useEffect(() => {
    fetch("/api/v1/openapi")
      .then((r) => r.json())
      .then(setSpec)
      .catch(console.error);
  }, []);

  if (!spec) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 rounded bg-border/40 animate-pulse" />
        <div className="h-4 w-96 rounded bg-border/40 animate-pulse" />
        <div className="h-32 rounded-lg bg-border/20 animate-pulse" />
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

  const baseUrl =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? `${window.location.protocol}//${window.location.host}/api/v1`
      : "https://api.syntaqx.com/v1";

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[1fr_320px] items-start">
        {/* Main content */}
        <div>
          <p className="text-xs text-accent font-medium tracking-wider uppercase mb-4">
            API Reference
          </p>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            {spec.info.title}
          </h1>
          <p className="text-sm text-muted mb-1">{spec.info.description}</p>
          <p className="text-[10px] text-dim mb-8">
            v{spec.info.version} &middot; OpenAPI {spec.openapi}
          </p>

          {/* Endpoints by tag */}
          <div className="space-y-8">
            {Object.entries(grouped).map(([tag, endpoints]) => (
              <section key={tag}>
                <h2 className="text-xs font-medium uppercase tracking-widest text-dim mb-3">
                  {tag}
                </h2>
                <div className="space-y-3">
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

        {/* Sidebar */}
        <div className="hidden lg:flex flex-col gap-4">
          {/* Servers */}
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Server size={12} className="text-accent" />
              Servers
            </h3>
            <div className="px-4 py-3 space-y-2">
              {spec.servers?.map((s) => (
                <div key={s.url}>
                  <p className="text-xs font-mono text-foreground break-all">
                    {s.url}
                  </p>
                  {s.description && (
                    <p className="text-[10px] text-dim">{s.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Base URL */}
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Globe size={12} className="text-accent" />
              Base URL
            </h3>
            <div className="px-4 py-3">
              <p className="text-xs font-mono text-foreground break-all">
                {baseUrl}
              </p>
              <p className="text-[10px] text-dim mt-1">Currently active</p>
            </div>
          </div>

          {/* About */}
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-accent" />
              About
            </h3>
            <div className="px-4 py-3 text-[11px] text-dim leading-relaxed space-y-2">
              <p>
                All responses are JSON. Error responses follow a consistent
                envelope with <span className="text-muted">message</span> and
                optional <span className="text-muted">errors</span> fields.
              </p>
              <p>
                Rate limiting headers (
                <span className="text-muted">X-RateLimit-Limit</span>,{" "}
                <span className="text-muted">X-RateLimit-Remaining</span>,{" "}
                <span className="text-muted">X-RateLimit-Reset</span>) are
                included on every response.
              </p>
            </div>
          </div>

          {/* Resources */}
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <ExternalLink size={12} className="text-accent" />
              Resources
            </h3>
            <ul className="px-4 py-3 text-[11px] leading-relaxed space-y-1.5">
              <li>
                <a
                  href="/api/v1/openapi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  OpenAPI Spec (JSON)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
