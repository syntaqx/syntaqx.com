import { z } from "zod";
import { json, rateLimit, errorResponse } from "@/lib/api";
import { registry } from "@/lib/openapi";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Schema registration
// ---------------------------------------------------------------------------

const UseragentResponse = z
  .object({
    raw: z.string().openapi({ description: "Original User-Agent string" }),
    browser: z.string().nullable(),
    browser_version: z.string().nullable(),
    os: z.string().nullable(),
    device: z.enum(["desktop", "mobile", "tablet", "bot", "unknown"]),
  })
  .openapi("UseragentResponse");

registry.registerPath({
  method: "get",
  path: "/useragent",
  summary: "Parse a User-Agent string",
  description:
    "Parse a User-Agent string into browser, OS, and device type. Defaults to the caller's User-Agent. Pass `?ua=` to parse an arbitrary string.",
  tags: ["Utilities"],
  request: {
    query: z.object({
      ua: z
        .string()
        .optional()
        .openapi({ description: "User-Agent string to parse (defaults to caller's)" }),
    }),
  },
  responses: {
    200: {
      description: "Parsed User-Agent",
      content: { "application/json": { schema: UseragentResponse } },
    },
    400: {
      description: "Missing User-Agent",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
    429: {
      description: "Rate limited",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
  },
});

// ---------------------------------------------------------------------------
// Simple UA parser — no deps, covers the common cases
// ---------------------------------------------------------------------------

interface ParsedUA {
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  device: "desktop" | "mobile" | "tablet" | "bot" | "unknown";
}

function parseUA(ua: string): ParsedUA {
  let browser: string | null = null;
  let browser_version: string | null = null;
  let os: string | null = null;
  let device: ParsedUA["device"] = "unknown";

  // --- Browser detection (order matters: more specific first) ---
  const browsers: [string, RegExp][] = [
    ["Edge", /Edg(?:e|A|iOS)?\/(\S+)/],
    ["Opera", /(?:OPR|Opera)\/(\S+)/],
    ["Brave", /Brave\/(\S+)/],
    ["Vivaldi", /Vivaldi\/(\S+)/],
    ["Samsung Internet", /SamsungBrowser\/(\S+)/],
    ["Firefox", /Firefox\/(\S+)/],
    ["Chrome", /Chrome\/(\S+)/],
    ["Safari", /Version\/(\S+).*Safari/],
  ];

  for (const [name, re] of browsers) {
    const m = ua.match(re);
    if (m) {
      browser = name;
      browser_version = m[1];
      break;
    }
  }

  // --- OS detection ---
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/CrOS/.test(ua)) os = "Chrome OS";
  else if (/Linux/.test(ua)) os = "Linux";

  // --- Device detection ---
  const botPattern =
    /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|linkedinbot|twitterbot|whatsapp|telegrambot|discordbot/i;
  if (botPattern.test(ua)) {
    device = "bot";
  } else if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) {
    device = "tablet";
  } else if (/Mobi|Android.*Mobile|iPhone|iPod|Phone/i.test(ua)) {
    device = "mobile";
  } else if (os) {
    device = "desktop";
  }

  return { browser, browser_version, os, device };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip);
  if (rl.limited) {
    return errorResponse(429, "Too many requests. Please try again later.");
  }

  const raw =
    request.nextUrl.searchParams.get("ua") ||
    request.headers.get("user-agent") ||
    "";

  if (!raw) {
    return errorResponse(400, "No User-Agent provided.");
  }

  const parsed = parseUA(raw);

  return json({ raw, ...parsed }, { headers: rl.headers });
}
