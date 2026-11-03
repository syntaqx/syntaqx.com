import { DocsHeader } from "@/components/docs-header";
import { DocsToc } from "@/components/docs-toc";
import { patterns } from "@/lib/ui";
import { DemoSection, type Demo } from "./demo-section";

/**
 * A pattern's page in the docs' reading layout: the header, each demo with
 * its code and install steps, and an "On this page" rail of the demos.
 */
export function PatternPage({ href, demos }: { href: string; demos: Demo[] }) {
  const pattern = patterns.find((p) => p.href === href);
  if (!pattern) throw new Error(`No pattern at ${href}`);
  const rail = demos.length > 1;

  return (
    <article className={rail ? "xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-10" : undefined}>
      <div className="min-w-0">
        <DocsHeader eyebrow={pattern.category} title={pattern.title}>
          <p className="max-w-3xl text-muted-foreground">{pattern.lead}</p>
        </DocsHeader>
        {demos.map((d) => (
          <DemoSection key={d.id} {...d} />
        ))}
      </div>
      {rail && (
        <aside data-pagefind-ignore className="hidden xl:block">
          <DocsToc
            headings={demos.map((d) => ({ id: d.id, text: d.title }))}
            className="rail-scroll sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto"
          />
        </aside>
      )}
    </article>
  );
}
