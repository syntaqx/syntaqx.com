import { DocsIndex } from "@/components/docs-index";
import { JsonLd } from "@/components/json-ld";
import { collectionPage } from "@/lib/schema";
import { componentGroups, components, uiPages } from "@/lib/ui";
import { pageMetadata } from "@/lib/metadata";

const description =
  "shadcn components you can add to your own app, each with live examples of how to use it well, and why.";

export const metadata = pageMetadata("/ui", "UI Components", description);

export default function UiPage() {
  return (
    <div>
      <JsonLd
        data={collectionPage({
          name: "UI Components",
          description,
          path: "/ui",
          crumbs: [{ name: "UI", path: "/ui" }],
          items: [...uiPages, ...components].map((p) => ({
            name: p.title,
            path: p.href,
          })),
        })}
      />
      <DocsIndex
        eyebrow="UI"
        title="Components"
        intro={
          <p>
            The components I reach for when I build an interface, each a shadcn component you can
            add to your own app; it takes on your theme, the way it takes on mine here. Every page
            has live examples to poke at, with the reasoning behind each one: when to validate a
            field, where focus goes after a dialog, what an empty list should say.
          </p>
        }
        categories={[
          { name: "Start here", section: "start", docs: uiPages },
          ...componentGroups.map((g) => ({
            name: g.category,
            section: g.category.toLowerCase().replace(/\s+/g, "-"),
            docs: g.items,
          })),
        ]}
      />
    </div>
  );
}
