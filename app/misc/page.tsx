import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { tools, patterns, converters, type MiscTool } from "@/lib/misc-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools & Experiments",
  description:
    "Browser-based developer tools, toys, and experiments built for fun: converters, generators, debuggers, and other things I found useful enough to keep.",
};

function ToolGrid({ items }: { items: MiscTool[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="group flex flex-col">
          <Card hover className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl leading-none text-foreground transition-colors group-hover:text-accent">
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
                  className="inline-block border border-border px-1.5 py-0.5 text-[10px] text-dim"
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
      <PageHeader
        label="misc"
        title="Tools & toys"
        scene="toolbox"
        sceneLabel="An opened box of small tools with its lid floating above"
      >
        <p>Tools, toys, and things built for fun.</p>
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-10">
          <section>
            <h2 className="eyebrow mb-4">Tools</h2>
            <ToolGrid items={tools} />
          </section>

          <section>
            <Link href="/misc/convert" className="group">
              <h2 className="eyebrow mb-4 group-hover:text-accent transition-colors">
                Converters
              </h2>
            </Link>
            <ToolGrid items={converters} />
          </section>
        </div>

        <section>
          <h2 className="eyebrow mb-4">UI / UX Patterns</h2>
          <ToolGrid items={patterns} />
        </section>
      </div>
    </div>
  );
}
