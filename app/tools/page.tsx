import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { itemList } from "@/lib/schema";
import { tools, converters, type Tool } from "@/lib/tools";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/tools",
  "Developer Tools",
  "Free browser-based developer tools: a JWT debugger, UUID and ULID generator, format converters, JavaScript and Markdown tools, and end-to-end encrypted one-time secrets.",
);

function ToolGrid({ items }: { items: Tool[] }) {
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

export default function ToolsPage() {
  return (
    <div>
      <JsonLd
        data={itemList("Developer Tools", "/tools", [
          ...[...tools, ...converters].map((t) => ({
            name: t.title,
            path: t.href,
          })),
          { name: "Converters", path: "/tools/convert" },
        ])}
      />
      <PageHeader
        label="tools"
        title="Developer tools"
        scene="toolbox"
        sceneLabel="An opened box of small tools with its lid floating above"
      >
        <p>
          Small tools I use often enough to keep. They run in your browser,
          so nothing you paste is sent anywhere. One-time secrets is the
          exception, by design: it encrypts in your browser and sends only
          the ciphertext.
        </p>
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="eyebrow mb-4">Tools</h2>
          <ToolGrid items={tools} />
        </section>

        <section>
          <Link href="/tools/convert" className="group">
            <h2 className="eyebrow mb-4 group-hover:text-accent transition-colors">
              Converters
            </h2>
          </Link>
          <ToolGrid items={converters} />
        </section>
      </div>
    </div>
  );
}
