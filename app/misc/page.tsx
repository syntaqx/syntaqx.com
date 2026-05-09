import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Misc",
  description: "Tools, toys, and things built for fun.",
};

const items = [
  {
    title: "whoami",
    description:
      "See how you appear on the internet. IP, location, browser, device, and more.",
    href: "/misc/whoami",
    tags: ["tool", "network", "privacy"],
  },
  {
    title: "Base64 Decode / Encode",
    description: "Decode or encode Base64 strings directly in your browser.",
    href: "/misc/base64",
    tags: ["tool", "encoding"],
  },
];

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
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col"
          >
            <Card hover className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-accent">
                  {item.title}
                </h2>
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
    </div>
  );
}
