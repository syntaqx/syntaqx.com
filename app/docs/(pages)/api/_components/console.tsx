"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { ChevronDown, ChevronRight, Play, Server } from "lucide-react";
import { buildRequest, jsonError, paramKey, SHOWN_RESPONSE_HEADERS } from "@/lib/api-console";
import { Select } from "@/components/select";
import { cn } from "@/lib/cn";
import { Button } from "@/registry/syntaqx/ui/button";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/syntaqx/ui/toggle-group";

// ---------------------------------------------------------------------------
// Types for OpenAPI 3.1
// ---------------------------------------------------------------------------

export interface OpenApiSpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers?: { url: string; description?: string }[];
  paths?: Record<string, Record<string, PathOperation>>;
  components?: {
    schemas?: Record<string, SchemaObject>;
    parameters?: Record<string, ParameterObject>;
  };
}

interface ParameterObject {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  required?: boolean;
  description?: string;
  schema?: SchemaObject;
}

interface RequestBodyObject {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: SchemaObject }>;
}

interface PathOperation {
  operationId?: string;
  parameters?: (ParameterObject | { $ref: string })[];
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
  get: "text-primary bg-primary/10 border-primary/25",
  // Darker shades on the light theme, so each label keeps 4.5:1 on its tint.
  post: "text-blue-800 bg-blue-500/10 border-blue-500/25 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20",
  put: "text-amber-800 bg-amber-500/10 border-amber-500/25 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20",
  patch:
    "text-orange-800 bg-orange-500/10 border-orange-500/25 dark:text-orange-400 dark:bg-orange-400/10 dark:border-orange-400/20",
  delete: "text-destructive bg-destructive/10 border-destructive/20",
  query:
    "text-violet-800 bg-violet-500/10 border-violet-500/25 dark:text-violet-400 dark:bg-violet-400/10 dark:border-violet-400/20",
};

function resolveRef(spec: OpenApiSpec, schema: SchemaObject): SchemaObject {
  if (schema.$ref) {
    const name = schema.$ref.replace("#/components/schemas/", "");
    return spec.components?.schemas?.[name] || schema;
  }
  return schema;
}

function resolveParam(
  spec: OpenApiSpec,
  param: ParameterObject | { $ref: string },
): ParameterObject {
  if ("$ref" in param) {
    const name = param.$ref.replace("#/components/parameters/", "");
    const found = spec.components?.parameters?.[name];
    if (found) return found;
  }
  return param as ParameterObject;
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

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function SchemaTable({ spec, schema }: { spec: OpenApiSpec; schema: SchemaObject }) {
  const resolved = resolveRef(spec, schema);
  if (!resolved.properties) return null;
  const required = resolved.required || [];

  return (
    <div className="border border-border overflow-hidden">
      <div className="inst grid grid-cols-[1fr_1fr_2fr] text-muted-foreground px-4 py-2.5 border-b border-border bg-card">
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
              {required.includes(name) && <span className="text-destructive ml-0.5">*</span>}
            </span>
            <span className="text-muted-foreground">
              {p.const ? `"${p.const}"` : p.type || "object"}
            </span>
            <span className="text-subtle">{p.description || ""}</span>
          </div>
        );
      })}
    </div>
  );
}

function ParamTable({ params }: { params: ParameterObject[] }) {
  return (
    <div className="border border-border overflow-hidden">
      <div className="inst grid grid-cols-[1fr_1fr_2fr] text-muted-foreground px-4 py-2.5 border-b border-border bg-card">
        <span>Name</span>
        <span>In</span>
        <span>Description</span>
      </div>
      {params.map((p) => (
        <div
          key={paramKey(p)}
          className="grid grid-cols-[1fr_1fr_2fr] px-4 py-2 border-b border-border last:border-b-0 text-xs"
        >
          <span className="font-mono text-foreground break-all">
            {p.name}
            {p.required && <span className="text-destructive ml-0.5">*</span>}
          </span>
          <span className="text-muted-foreground">
            {p.in}
            {p.schema?.type ? ` · ${p.schema.type}` : ""}
          </span>
          <span className="text-subtle">{p.description || ""}</span>
        </div>
      ))}
    </div>
  );
}

/** The URL hash, for useSyncExternalStore. */
const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

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
  const anchor = op.operationId;
  // Open while the URL hash points at this operation, until it's toggled. The
  // server has no hash, so a deep link opens on the client.
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );
  const [toggled, setOpen] = useState<boolean | null>(null);
  const open = toggled ?? (!!anchor && hash === `#${anchor}`);
  const [trying, setTrying] = useState(false);
  const [result, setResult] = useState<{
    status: number;
    statusText: string;
    ms: number;
    headers: [string, string][];
    body: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = (op.parameters ?? []).map((p) => resolveParam(spec, p));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      params.map((p) => [
        paramKey(p),
        p.schema?.default !== undefined ? String(p.schema.default) : "",
      ]),
    ),
  );

  const hasBody = ["post", "put", "patch", "query"].includes(method);
  const reqBodySchema = op.requestBody?.content?.["application/json"]?.schema;
  const resolvedReqBody = reqBodySchema ? resolveRef(spec, reqBodySchema) : null;
  const defaultBody = resolvedReqBody
    ? JSON.stringify(schemaToExample(spec, resolvedReqBody), null, 2)
    : "{}";
  const [reqBody, setReqBody] = useState(defaultBody);

  const responses = op.responses || {};
  const request = buildRequest({
    baseUrl,
    path,
    method,
    params,
    values,
    body: hasBody ? reqBody : undefined,
  });

  async function tryIt() {
    const invalid = hasBody ? jsonError(reqBody) : null;
    if (invalid) {
      setError(`Body isn't valid JSON: ${invalid}`);
      return;
    }
    setError(null);
    setTrying(true);
    const started = performance.now();
    try {
      const res = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      const text = await res.text();
      let body: string;
      try {
        body = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        body = text;
      }
      setResult({
        status: res.status,
        statusText: res.statusText,
        ms: Math.round(performance.now() - started),
        headers: SHOWN_RESPONSE_HEADERS.flatMap((h) => {
          const v = res.headers.get(h);
          return v ? [[h, v] as [string, string]] : [];
        }),
        body,
      });
    } catch (e) {
      setResult({
        status: 0,
        statusText: "Network error",
        ms: Math.round(performance.now() - started),
        headers: [],
        body: String(e),
      });
    } finally {
      setTrying(false);
    }
  }

  // Ctrl/Cmd+Enter sends from any console input.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!trying) tryIt();
    }
  };

  const inputClass =
    "w-full font-mono text-[11px] bg-background border border-border px-3 py-2 text-foreground focus:outline-none focus:border-primary/50";
  const idBase = anchor ?? path;

  return (
    <div id={anchor} className="scroll-mt-24 border-b border-border">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 px-3 py-3.5 text-left hover:bg-card transition-colors cursor-pointer"
      >
        {open ? (
          <ChevronDown size={14} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-muted-foreground shrink-0" />
        )}
        <span
          className={cn(
            "inst w-19 shrink-0 border py-1 text-center",
            METHOD_COLORS[method] || "text-muted-foreground",
          )}
        >
          {method}
        </span>
        <span className="font-mono text-sm text-foreground">{path}</span>
        <span className="ml-auto hidden text-sm text-muted-foreground sm:inline">{op.summary}</span>
      </button>

      {open && (
        <div className="grid border-t border-border xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Reference: description, parameters, body schema, responses */}
          <div className="min-w-0 xl:border-r xl:border-border">
            {(op.description || anchor) && (
              <div className="px-4 py-3 border-b border-border">
                {op.description && <p className="text-xs text-subtle">{op.description}</p>}
                {anchor && (
                  <a
                    href={`#${anchor}`}
                    className="inst mt-2 inline-block text-muted-foreground hover:text-primary transition-colors"
                  >
                    #{anchor}
                  </a>
                )}
              </div>
            )}

            {params.length > 0 && (
              <div className="px-4 py-3 border-b border-border space-y-3">
                <h4 className="inst text-muted-foreground">Parameters</h4>
                <ParamTable params={params} />
              </div>
            )}

            {hasBody && (
              <div className="px-4 py-3 border-b border-border space-y-3">
                <h4 className="inst text-muted-foreground">
                  Request Body
                  {op.requestBody?.required && (
                    <span className="text-destructive ml-1">required</span>
                  )}
                </h4>
                {resolvedReqBody?.properties && (
                  <SchemaTable spec={spec} schema={resolvedReqBody} />
                )}
              </div>
            )}

            <div className="px-4 py-3 space-y-4 border-b border-border xl:border-b-0">
              <h4 className="inst text-muted-foreground">Responses</h4>
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
                        className={cn(
                          "text-xs font-mono font-bold",
                          code.startsWith("2")
                            ? "text-emerald-400"
                            : code.startsWith("4")
                              ? "text-amber-400"
                              : "text-destructive",
                        )}
                      >
                        {code}
                      </span>
                      <span className="text-xs text-muted-foreground">{resObj.description}</span>
                    </div>
                    {resolvedSchema?.properties && (
                      <SchemaTable spec={spec} schema={resolvedSchema} />
                    )}
                    {example && (
                      <div className="relative">
                        <div className="absolute top-2 right-2">
                          <CopyButton
                            value={example}
                            size="icon-xs"
                            className="text-muted-foreground"
                          />
                        </div>
                        <pre className="text-[11px] font-mono bg-background border border-border p-3 overflow-x-auto text-subtle">
                          {example}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Try it console */}
          <div className="min-w-0 bg-card/40">
            <div className="space-y-4 p-4  xl:sticky xl:top-20">
              <h4 className="inst flex items-center gap-2 text-foreground">
                <Play size={11} className="text-primary" />
                Try it
              </h4>

              {params.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {params.map((p) => {
                    const key = paramKey(p);
                    const id = `${idBase}-${key}`;
                    const options = p.schema?.enum;
                    return (
                      <label key={key} htmlFor={id} className="grid gap-1.5">
                        <span className="inst text-muted-foreground">
                          {p.name}
                          <span className="ml-1.5 normal-case tracking-normal text-muted-foreground">
                            {p.in}
                          </span>
                        </span>
                        {options ? (
                          <Select
                            id={id}
                            size="md"
                            className="w-full font-mono"
                            value={values[key]}
                            onChange={(v) => setValues({ ...values, [key]: v })}
                            options={[
                              ...(p.required ? [] : [{ value: "", label: "(default)" }]),
                              ...options.map((o) => ({ value: o, label: o })),
                            ]}
                          />
                        ) : (
                          <input
                            id={id}
                            value={values[key]}
                            onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                            onKeyDown={onKeyDown}
                            placeholder={p.required ? "required" : "optional"}
                            spellCheck={false}
                            className={inputClass}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {hasBody && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor={`${idBase}-body`} className="inst text-muted-foreground">
                      Body
                    </label>
                    {reqBody !== defaultBody && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setReqBody(defaultBody)}
                        className="text-muted-foreground"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <textarea
                    id={`${idBase}-body`}
                    value={reqBody}
                    onChange={(e) => setReqBody(e.target.value)}
                    onKeyDown={onKeyDown}
                    spellCheck={false}
                    rows={Math.min(12, defaultBody.split("\n").length + 1)}
                    className={cn(inputClass, "resize-y")}
                  />
                </div>
              )}

              <div className="relative">
                <div className="inst mb-1.5 text-muted-foreground">Request</div>
                <div className="absolute top-0 right-0">
                  <CopyButton
                    value={request.curl}
                    size="icon-xs"
                    className="text-muted-foreground"
                  />
                </div>
                <pre className="text-[11px] font-mono bg-background border border-border p-3 overflow-x-auto text-subtle">
                  {request.curl}
                </pre>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" onClick={tryIt} loading={trying}>
                  <Play data-icon="inline-start" />
                  Send request
                </Button>
                <span className="inst text-muted-foreground">ctrl/⌘ + enter</span>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              {(result || trying) && (
                <div aria-live="polite" className={cn("relative", trying && "opacity-50")}>
                  {result && (
                    <>
                      <div className="mb-1.5 flex items-center gap-3">
                        <span
                          className={cn(
                            "text-xs font-mono font-bold",
                            result.status >= 200 && result.status < 300
                              ? "text-emerald-400"
                              : "text-destructive",
                          )}
                        >
                          {result.status || "Error"} {result.statusText}
                        </span>
                        <span className="inst text-muted-foreground">{result.ms} ms</span>
                      </div>
                      {result.headers.length > 0 && (
                        <dl className="mb-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 border border-border bg-background px-3 py-2 font-mono text-[11px]">
                          {result.headers.map(([k, v]) => (
                            <div key={k} className="contents">
                              <dt className="text-muted-foreground">{k}</dt>
                              <dd className="break-all text-subtle">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      <div className="relative">
                        <div className="absolute top-2 right-2">
                          <CopyButton
                            value={result.body}
                            size="icon-xs"
                            className="text-muted-foreground"
                          />
                        </div>
                        <pre className="max-h-96 overflow-auto text-[11px] font-mono bg-background border border-border p-3 text-subtle">
                          {result.body}
                        </pre>
                      </div>
                    </>
                  )}
                  {trying && !result && <div className="h-16 bg-border/20 animate-pulse" />}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function ApiHeader({
  title = "syntaqx API",
  description = "Public API for syntaqx.com",
  meta,
}: {
  title?: string;
  description?: string;
  meta?: string;
}) {
  return (
    <header className="mb-8 border-b border-border pb-8">
      <p className="eyebrow mb-5">api reference</p>
      <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-muted-foreground">{description}</p>
      {meta ? (
        <p className="inst mt-5 text-muted-foreground">{meta}</p>
      ) : (
        <div className="mt-5 h-3 w-56 bg-border/40 animate-pulse" />
      )}
    </header>
  );
}

/**
 * The console, server-rendered from the spec so the page opens at its full
 * height instead of growing when a client fetch lands (a layout shift). It
 * still refetches, so the dev server's spec stays live.
 */
export function ApiConsole({ initialSpec }: { initialSpec: OpenApiSpec }) {
  const [spec, setSpec] = useState<OpenApiSpec | null>(initialSpec);
  const [serverIdx, setServerIdx] = useState<number | null>(null);

  useEffect(() => {
    const load = () =>
      // Revalidate with the ETag on every load (a cheap 304 when unchanged),
      // so the console never runs against a stale spec.
      fetch("/api/openapi", { cache: "no-cache" })
        .then((r) => r.json())
        .then((data: OpenApiSpec) => {
          setSpec(data);
          if (serverIdx === null && data.servers?.length) {
            // Default to localhost in dev, production otherwise
            const isLocal =
              typeof window !== "undefined" && window.location.hostname === "localhost";
            const idx = isLocal
              ? (data.servers.findIndex((s) => s.url.includes("localhost")) ?? 0)
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

  // Endpoints render after the spec loads, too late for the browser's own
  // jump to a #operationId link, so scroll to it once they exist.
  useEffect(() => {
    if (!spec) return;
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [spec]);

  if (!spec) {
    // Server-rendered before the spec loads, so the page always has its H1.
    return (
      <div>
        <ApiHeader />
        <div className="h-32 bg-border/20 animate-pulse" />
      </div>
    );
  }

  // Group endpoints by tag
  const grouped: Record<string, { method: string; path: string; op: PathOperation }[]> = {};
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
      <ApiHeader
        title={spec.info.title}
        description={spec.info.description}
        meta={`v${spec.info.version} · openapi ${spec.openapi} · ${Object.values(grouped).flat().length} endpoints`}
      />

      {/* Base URL */}
      {servers.length > 0 && (
        <div className="mb-12 flex flex-wrap items-stretch border border-border">
          <span className="inst flex items-center gap-2 border-r border-border bg-card px-4 py-3 text-muted-foreground">
            <Server size={12} className="text-primary" />
            base url
          </span>
          {servers.length === 1 ? (
            <code className="flex items-center px-4 py-3 font-mono text-sm break-all text-foreground">
              {servers[0].url}
            </code>
          ) : (
            <ToggleGroup
              spacing={0}
              type="single"
              value={String(serverIdx ?? 0)}
              onValueChange={(v) => v && setServerIdx(Number(v))}
              aria-label="Base URL"
              className="flex-wrap items-stretch rounded-none"
            >
              {servers.map((s, i) => (
                <ToggleGroupItem
                  key={s.url}
                  value={String(i)}
                  title={s.description}
                  className="h-auto rounded-none border-r border-border px-4 py-3 font-mono text-sm break-all text-muted-foreground first:rounded-none last:rounded-none"
                >
                  {s.url}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
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
