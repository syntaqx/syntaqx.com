import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ComponentInstall } from "@/app/ui/_components/component-install";
import { ExamplePreview } from "@/app/ui/_components/example-preview";
import { examples } from "@/app/ui/components/_examples";
import { DocsHeader } from "@/components/docs-header";
import { DocsToc } from "@/components/docs-toc";
import { pageMetadata } from "@/lib/metadata";
import { componentGroups, components } from "@/lib/ui";
import registry from "@/registry.json";

type Props = { params: Promise<{ name: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return components.map((c) => ({ name: c.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const c = components.find((x) => x.name === name)!;
  return pageMetadata(c.href, c.title, c.description);
}

export default async function ComponentPage({ params }: Props) {
  const { name } = await params;
  const component = components.find((c) => c.name === name)!;
  const group = componentGroups.find((g) => g.items.includes(component))!;
  const item = registry.items.find((i) => i.name === name)!;
  const changes = (item as { meta?: { changes?: string[] } }).meta?.changes;
  const [first, ...rest] = examples[name] ?? [];

  const sections = [
    { id: "installation", text: "Installation" },
    ...(changes ? [{ id: "changes", text: "Changes from shadcn" }] : []),
    ...(rest.length ? [{ id: "examples", text: "Examples" }] : []),
  ];

  return (
    <article className="xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-10">
      <div className="min-w-0">
        <DocsHeader eyebrow={`Components · ${group.category}`} title={component.title}>
          <p className="max-w-3xl text-muted-foreground">{component.description}</p>
        </DocsHeader>

        {first && <ExamplePreview slug={first.slug} Component={first.Component} />}

        <Section id="installation" title="Installation">
          <ComponentInstall name={name} heading={false} />
        </Section>

        {changes && (
          <Section id="changes" title="Changes from shadcn">
            <p className="text-sm/relaxed text-muted-foreground">
              It installs over{" "}
              <a
                href={`https://ui.shadcn.com/docs/components/${name}`}
                className="text-foreground underline decoration-primary underline-offset-4 hover:text-primary"
              >
                shadcn&apos;s {component.title}
              </a>{" "}
              and keeps its API, variants and data-slots, so code written for it keeps working. On
              top of that:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm/relaxed text-foreground marker:text-muted-foreground">
              {changes.map((c) => (
                <li key={c}>
                  <Inline text={c} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {rest.length > 0 && (
          <Section id="examples" title="Examples">
            <div className="space-y-10">
              {rest.map((ex) => (
                <div key={ex.slug}>
                  <h3 className="mb-2 font-sans text-base/snug font-semibold normal-case">
                    {ex.title}
                  </h3>
                  {ex.description && (
                    <p className="mb-2 max-w-3xl text-sm/relaxed text-muted-foreground">
                      <Inline text={ex.description} />
                    </p>
                  )}
                  {ex.sources?.length ? <Credit sources={ex.sources} /> : null}
                  <div className="mb-3" />
                  <ExamplePreview slug={ex.slug} Component={ex.Component} />
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>
      <aside data-pagefind-ignore className="hidden xl:block">
        <DocsToc
          headings={sections}
          className="rail-scroll sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto"
        />
      </aside>
    </article>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-14 scroll-mt-20">
      <h2 className="mb-4 text-2xl text-foreground">{title}</h2>
      {children}
    </section>
  );
}

/** The notes in registry.json mark code with backticks. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") ? (
          <code key={i} className="font-mono text-[0.85em] text-primary">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Credit({ sources }: { sources: { name: string; href?: string }[] }) {
  return (
    <p className="text-xs text-muted-foreground">
      Inspired by{" "}
      {sources.map((src, i) => (
        <span key={src.name}>
          {src.href ? (
            <a
              href={src.href}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline decoration-border underline-offset-4 hover:text-primary"
            >
              {src.name}
            </a>
          ) : (
            <span className="text-foreground">{src.name}</span>
          )}
          {i < sources.length - 2 ? ", " : i === sources.length - 2 ? " and " : ""}
        </span>
      ))}
    </p>
  );
}
