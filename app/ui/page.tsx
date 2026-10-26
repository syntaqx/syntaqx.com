import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { itemList } from "@/lib/schema";
import { patterns } from "@/lib/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/ui",
  "UI Patterns",
  "How I build interfaces: the interaction patterns I reach for, when, and why, each with live demos. Hover cards, feedback, empty states, inline validation, and keyboard focus.",
);

export default function UiPage() {
  return (
    <div>
      <JsonLd
        data={itemList(
          "UI Patterns",
          "/ui",
          patterns.map((p) => ({ name: p.title, path: p.href })),
        )}
      />
      <PageHeader
        label="ui"
        title="Interface patterns"
        scene="layers"
        sceneLabel="An interface exploded into layers: the layout at the bottom, components above it, and a button on top that a cursor comes down to press"
      >
        <p>
          The patterns I reach for when I build an interface: when to use
          each one, and why. Every page has live demos to poke at.
        </p>
      </PageHeader>

      <section>
        <h2 className="eyebrow mb-4">Patterns</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {patterns.map((item) => (
            <Link key={item.href} href={item.href} className="group flex flex-col">
              <Card hover className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl leading-none text-foreground transition-colors group-hover:text-accent">
                    {item.title}
                  </h3>
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
      </section>
    </div>
  );
}
