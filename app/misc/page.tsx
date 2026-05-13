import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Misc",
  description: "Tools, toys, and things built for fun.",
};

const tools = [
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

const patterns = [
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

const converters = [
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

function ToolGrid({ items }: { items: typeof tools }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="group flex flex-col">
          <Card hover className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-accent">{item.title}</h2>
              <ArrowRight
                size={12}
                className="text-dim group-hover:text-accent transition-colors"
              />
            </div>
            <p className="text-xs text-dim leading-relaxed">
              {item.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded border border-border px-1.5 py-0.5 text-[10px] text-dim"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          Misc
        </h1>
        <p className="text-sm text-muted">
          Tools, toys, and things built for fun.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-10">
          <section>
            <h2 className="text-xs font-medium uppercase tracking-widest text-dim mb-4">
              Tools
            </h2>
            <ToolGrid items={tools} />
          </section>

          <section>
            <Link href="/misc/convert" className="group">
              <h2 className="text-xs font-medium uppercase tracking-widest text-dim mb-4 group-hover:text-accent transition-colors">
                Converters
              </h2>
            </Link>
            <ToolGrid items={converters} />
          </section>
        </div>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-widest text-dim mb-4">
            UI / UX Patterns
          </h2>
          <ToolGrid items={patterns} />
        </section>
      </div>
    </div>
  );
}
