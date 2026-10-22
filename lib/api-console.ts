/**
 * Request building for the API reference's "Try it" console
 * (app/docs/(pages)/api/page.tsx). Pure, so the URL, headers and curl
 * command the page shows are exactly what it sends.
 */

export interface ConsoleParam {
  name: string;
  in: "query" | "header" | "path" | "cookie";
}

export interface ConsoleRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  curl: string;
}

/** Key for a parameter's input value, unique across locations. */
export const paramKey = (p: ConsoleParam) => `${p.in}:${p.name}`;

/** Single-quote a value for a POSIX shell. */
const sq = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

export function buildRequest({
  baseUrl,
  path,
  method,
  params,
  values,
  body,
}: {
  baseUrl: string;
  path: string;
  method: string;
  params: ConsoleParam[];
  values: Record<string, string>;
  /** Raw JSON text for methods with a body. */
  body?: string;
}): ConsoleRequest {
  const query = new URLSearchParams();
  const headers: Record<string, string> = {};
  let resolvedPath = path;

  for (const p of params) {
    const value = values[paramKey(p)]?.trim();
    if (!value) continue;
    if (p.in === "query") query.append(p.name, value);
    else if (p.in === "header") headers[p.name] = value;
    else if (p.in === "path")
      resolvedPath = resolvedPath.replace(`{${p.name}}`, encodeURIComponent(value));
  }

  // Send compact JSON when it parses; otherwise send what was typed.
  let payload: string | undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    try {
      payload = JSON.stringify(JSON.parse(body));
    } catch {
      payload = body;
    }
  }

  const qs = query.toString();
  const url = `${baseUrl}${resolvedPath}${qs ? `?${qs}` : ""}`;
  const upper = method.toUpperCase();

  const curl = [
    `curl${upper === "GET" ? "" : ` -X ${upper}`} ${sq(url)}`,
    ...Object.entries(headers).map(([k, v]) => `  -H ${sq(`${k}: ${v}`)}`),
    ...(payload !== undefined ? [`  -d ${sq(payload)}`] : []),
  ].join(" \\\n");

  return { url, method: upper, headers, body: payload, curl };
}

/** Returns an error message when `text` isn't valid JSON, else null. */
export function jsonError(text: string): string | null {
  try {
    JSON.parse(text);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

/** Response headers worth showing in the console, in display order. */
export const SHOWN_RESPONSE_HEADERS = [
  "content-type",
  "api-version",
  "deprecation",
  "sunset",
  "ratelimit",
  "ratelimit-policy",
  "retry-after",
  "x-request-id",
];
