import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRegistryItem } from "@/lib/registry";
import { CodeBlock } from "./code-block";
import { ComponentInstall } from "./component-install";

export interface DemoSource {
  name: string;
  // Optional. When provided, the name renders as an external link; when
  // omitted, it renders as plain text in the same slot. Useful for citing a
  // company without endorsing the click-through.
  href?: string;
}

export interface Demo {
  /** The anchor, and the entry in the page's "On this page" rail. */
  id: string;
  title: string;
  blurb: ReactNode;
  sources: DemoSource[];
  /** Registry items the demo is built from: a Code tab and install steps for each. */
  install?: string[];
  demo: ReactNode;
}

export function DemoSection({ id, title, blurb, sources, install, demo }: Demo) {
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <div className="mb-5">
        <h2 className="mb-2 text-2xl text-foreground">
          <a href={`#${id}`} className="hover:text-primary">
            {title}
          </a>
        </h2>
        <p className="max-w-3xl text-sm/relaxed text-muted-foreground">{blurb}</p>
        <Credit sources={sources} />
      </div>
      {install?.length ? (
        <Tabs defaultValue="preview">
          <TabsList variant="line">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">{demo}</TabsContent>
          <TabsContent value="code" className="space-y-3">
            {install
              .flatMap((name) => getRegistryItem(name).files)
              .map((f) => (
                <CodeBlock key={f.path} code={f.source} title={f.target} />
              ))}
          </TabsContent>
        </Tabs>
      ) : (
        demo
      )}
      {install?.map((name) => (
        <ComponentInstall key={name} name={name} />
      ))}
    </section>
  );
}

function Credit({ sources }: { sources: DemoSource[] }) {
  return (
    <p className="mt-3 text-xs text-muted-foreground">
      <span className="text-muted-foreground/70">Inspired by </span>
      {sources.map((s, i) => (
        <span key={s.href ?? s.name}>
          {s.href ? (
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              {s.name}
            </a>
          ) : (
            <span className="text-foreground">{s.name}</span>
          )}
          {i < sources.length - 2 ? ", " : i === sources.length - 2 ? " and " : ""}
        </span>
      ))}
    </p>
  );
}
