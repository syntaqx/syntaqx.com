import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { collectionPage } from "@/lib/schema";
import { patternGroups, patterns } from "@/lib/ui";
import { pageMetadata } from "@/lib/metadata";

const description =
  "Interaction patterns I reach for, when and why, each with live demos: hover cards, feedback, empty states, inline validation, and keyboard and focus.";

export const metadata = pageMetadata("/ui", "UI Patterns", description);

export default function UiPage() {
  return (
    <div>
      <JsonLd
        data={collectionPage({
          name: "UI Patterns",
          description,
          path: "/ui",
          crumbs: [{ name: "UI", path: "/ui" }],
          items: patterns.map((p) => ({ name: p.title, path: p.href })),
        })}
      />
      <PageHeader
        label="ui"
        title="Interface patterns"
        scene="layers"
        sceneLabel="An interface exploded into layers: the layout at the bottom, components above it, and a button on top that a cursor comes down to press"
      >
        <p>
          The patterns I reach for when I build an interface: when to use each one, and why. Every
          page has live demos to poke at. Where a pattern comes down to a component, it&apos;s a
          shadcn component you can add to your own app; it takes on your theme, the way it takes on
          mine here.
        </p>
      </PageHeader>

      {patternGroups.map((g) => (
        <section key={g.category} className="mb-10">
          <h2 className="eyebrow mb-4">{g.category}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {g.items.map((item) => (
              <Link key={item.href} href={item.href} className="group flex flex-col">
                <Card hover className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl leading-none text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    <ArrowRight
                      size={12}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  </div>
                  <p className="text-xs/relaxed text-muted-foreground ">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.components && (
                      <span className="inline-block border border-primary/40 px-1.5 py-0.5 text-[10px] text-primary">
                        {item.components.length} shadcn{" "}
                        {item.components.length === 1 ? "component" : "components"}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
