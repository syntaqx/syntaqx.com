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
    title: "JWT Decoder",
    description:
      "Decode, inspect, and verify JSON Web Tokens entirely in your browser.",
    href: "/misc/jwt",
    tags: ["jwt", "auth", "security"],
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
];

function ToolGrid({ items }: { items: typeof tools }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
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

      <section className="mb-10">
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
  );
}
