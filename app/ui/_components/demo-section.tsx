import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRegistryItem } from "@/lib/registry";
import { CodeBlock } from "./code-block";
import Link from "next/link";
import { SITE_URL } from "@/lib/constants";
import { components } from "@/lib/ui";

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
      {install?.length ? <BuiltWith names={install} /> : null}
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

/** The components a demo is made of, each linked to its page, and one command for all of them. */
function BuiltWith({ names }: { names: string[] }) {
  const command = `npx shadcn@latest add ${names.map((n) => `${SITE_URL}/r/${n}.json`).join(" ")}`;
  return (
    <div className="mt-4 space-y-3">
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        Built with
        {names.map((n) => {
          const c = components.find((x) => x.name === n);
          return (
            <Link
              key={n}
              href={c?.href ?? "/ui/installation"}
              className="rounded-md border bg-card px-2 py-0.5 text-sm text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {c?.title ?? n}
            </Link>
          );
        })}
      </p>
      <CodeBlock code={command} lang="bash" />
    </div>
  );
}
