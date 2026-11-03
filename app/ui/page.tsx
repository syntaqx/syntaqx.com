import { DocsIndex } from "@/components/docs-index";
import { JsonLd } from "@/components/json-ld";
import { collectionPage } from "@/lib/schema";
import { patternGroups, patterns, uiPages } from "@/lib/ui";
import { pageMetadata } from "@/lib/metadata";

const description =
  "Interaction patterns I reach for, when and why, each with live demos and shadcn components you can add to your own app.";

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
          items: [...uiPages, ...patterns].map((p) => ({ name: p.title, path: p.href })),
        })}
      />
      <DocsIndex
        eyebrow="UI"
        title="Interface patterns"
        intro={
          <p>
            The patterns I reach for when I build an interface: when to use each one, and why. Every
            page has live demos to poke at. Where a pattern comes down to a component, it&apos;s a
            shadcn component you can add to your own app; it takes on your theme, the way it takes
            on mine here.
          </p>
        }
        categories={[
          { name: "Start here", section: "start", docs: uiPages },
          ...patternGroups.map((g) => ({
            name: g.category,
            section: g.category.toLowerCase(),
            docs: g.items,
          })),
        ]}
      />
    </div>
  );
}
