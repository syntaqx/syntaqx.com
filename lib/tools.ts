export interface Tool {
  title: string;
  description: string;
  href: string;
  tags: string[];
}

export const tools: Tool[] = [
  {
    title: "whoami",
    description:
      "See how you appear on the internet. IP, location, browser, device, and more.",
    href: "/tools/whoami",
    tags: ["network", "privacy"],
  },
  {
    title: "JWT Debugger",
    description:
      "Decode, encode, and verify JSON Web Tokens entirely in your browser.",
    href: "/tools/jwt",
    tags: ["jwt", "auth", "security"],
  },
  {
    title: "UUID / ULID Generator",
    description:
      "Generate, validate, and inspect UUIDs (v1, v4, v7) and ULIDs.",
    href: "/tools/uuid",
    tags: ["uuid", "ulid", "identifier"],
  },
  {
    title: "JS Beautify / Minify / Obfuscate",
    description:
      "Format, compress, or obfuscate JavaScript and JSON with Prettier, Terser, and javascript-obfuscator.",
    href: "/tools/js",
    tags: ["javascript", "prettier", "terser"],
  },
  {
    title: "Markdown Tools",
    description:
      "HTML to Markdown (with rich-text paste), Markdown to HTML, and live preview.",
    href: "/tools/markdown",
    tags: ["markdown", "html", "preview"],
  },
];

export const converters: Tool[] = [
  {
    title: "Base64 Decode / Encode",
    description: "Decode or encode Base64 strings directly in your browser.",
    href: "/tools/convert/base64",
    tags: ["encoding", "base64"],
  },
  {
    title: "Text Format Converter",
    description:
      "Convert between JSON, YAML, TOML, XML, TOON, CSV, ENV, and query strings.",
    href: "/tools/convert/text",
    tags: ["json", "yaml", "toml", "xml"],
  },
  {
    title: "Favicon Generator",
    description:
      "Convert SVG, PNG, JPG, GIF, WebP, and other images to ICO files.",
    href: "/tools/convert/favicon",
    tags: ["svg", "png", "ico"],
  },
  {
    title: "Image / Base64 Converter",
    description:
      "Convert images to Base64 data URIs, or decode Base64 back into an image.",
    href: "/tools/convert/image-base64",
    tags: ["image", "base64", "data-uri"],
  },
];

/** Every leaf tool page, used to cross-link tools to their siblings. */
export const allTools: Tool[] = [...tools, ...converters];

/**
 * The "More tools" links shown on a tool page (components/tools-nav.tsx)
 * and listed in its structured data: every other tool, plus the converters
 * hub on converter pages.
 */
export function moreToolsFor(pathname: string): { title: string; href: string }[] {
  const others: { title: string; href: string }[] = allTools.filter(
    (tool) => tool.href !== pathname,
  );
  if (pathname.startsWith("/tools/convert/")) {
    others.unshift({ title: "All converters", href: "/tools/convert" });
  }
  return others;
}

/** The tools the homepage leads with: the ones people come back for. */
export const featuredTools: Tool[] = [
  "/tools/whoami",
  "/tools/jwt",
  "/tools/convert/text",
  "/tools/uuid",
].map((href) => allTools.find((tool) => tool.href === href)!);
