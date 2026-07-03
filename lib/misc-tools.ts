export interface MiscTool {
  title: string;
  description: string;
  href: string;
  tags: string[];
}

export const tools: MiscTool[] = [
  {
    title: "whoami",
    description:
      "See how you appear on the internet. IP, location, browser, device, and more.",
    href: "/misc/whoami",
    tags: ["network", "privacy"],
  },
  {
    title: "JWT Debugger",
    description:
      "Decode, encode, and verify JSON Web Tokens entirely in your browser.",
    href: "/misc/jwt",
    tags: ["jwt", "auth", "security"],
  },
  {
    title: "UUID / ULID Generator",
    description:
      "Generate, validate, and inspect UUIDs (v1, v4, v7) and ULIDs.",
    href: "/misc/uuid",
    tags: ["uuid", "ulid", "identifier"],
  },
  {
    title: "JS Beautify / Minify / Obfuscate",
    description:
      "Format, compress, or obfuscate JavaScript and JSON with Prettier, Terser, and javascript-obfuscator.",
    href: "/misc/js",
    tags: ["javascript", "prettier", "terser"],
  },
  {
    title: "Markdown Tools",
    description:
      "HTML to Markdown (with rich-text paste), Markdown to HTML, and live preview.",
    href: "/misc/markdown",
    tags: ["markdown", "html", "preview"],
  },
];

export const patterns: MiscTool[] = [
  {
    title: "Hover Cards",
    description:
      "Defer expensive context to intent. Reveal extra detail without bloating the initial render.",
    href: "/misc/hover-cards",
    tags: ["ux", "intent"],
  },
  {
    title: "Feedback & Affordance",
    description:
      "Copy confirmations, toasts, destructive-action guards, and other ways the UI tells the user what just happened.",
    href: "/misc/feedback",
    tags: ["ux", "feedback"],
  },
];

export const converters: MiscTool[] = [
  {
    title: "Base64 Decode / Encode",
    description: "Decode or encode Base64 strings directly in your browser.",
    href: "/misc/convert/base64",
    tags: ["encoding", "base64"],
  },
  {
    title: "Text Format Converter",
    description:
      "Convert between JSON, YAML, TOML, XML, TOON, CSV, ENV, and query strings.",
    href: "/misc/convert/text",
    tags: ["json", "yaml", "toml", "xml"],
  },
  {
    title: "Favicon Generator",
    description:
      "Convert SVG, PNG, JPG, GIF, WebP, and other images to ICO files.",
    href: "/misc/convert/favicon",
    tags: ["svg", "png", "ico"],
  },
  {
    title: "Image / Base64 Converter",
    description:
      "Convert images to Base64 data URIs, or decode Base64 back into an image.",
    href: "/misc/convert/image-base64",
    tags: ["image", "base64", "data-uri"],
  },
];

/** Every leaf tool page, used to cross-link tools to their siblings. */
export const allMiscTools: MiscTool[] = [...tools, ...converters, ...patterns];
