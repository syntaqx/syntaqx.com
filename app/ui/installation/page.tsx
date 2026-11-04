import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock } from "@/app/ui/_components/code-block";
import { DocsHeader } from "@/components/docs-header";
import { SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";
import { getRegistryItem } from "@/lib/registry";
import { uiPages } from "@/lib/ui";
import registry from "@/registry.json";

const page = uiPages.find((p) => p.href === "/ui/installation")!;

export const metadata = pageMetadata(page.href, "Installation", page.description);

// The tokens the components style themselves with: everything a shadcn
// theme defines, so any shadcn app already has them.
const TOKENS = [
  "background",
  "foreground",
  "card",
  "popover",
  "primary",
  "secondary",
  "muted",
  "accent",
  "destructive",
  "border",
  "input",
  "ring",
];

export default function InstallationPage() {
  const items = registry.items.map((i) => getRegistryItem(i.name));

  return (
    <article className="max-w-3xl">
      <DocsHeader eyebrow="UI" title="Installation">
        <p className="text-muted-foreground">{page.description}</p>
      </DocsHeader>

      <Section title="Set up shadcn">
        <p>
          The components install into any app set up for{" "}
          <a href="https://ui.shadcn.com/docs/installation" className={linkClass}>
            shadcn/ui
          </a>{" "}
          with Tailwind CSS v4. If yours isn&apos;t yet, start there:
        </p>
        <CodeBlock code="npx shadcn@latest init" lang="bash" />
      </Section>

      <Section title="Add a component">
        <p>
          Point the shadcn CLI at a component&apos;s URL. It writes the source into your project,
          installs its npm dependencies, and pulls in any component it builds on.
        </p>
        <CodeBlock code={`npx shadcn@latest add ${SITE_URL}/r/timestamp.json`} lang="bash" />
        <p>
          The code is yours from then on: edit it like anything else in{" "}
          <code className="font-mono text-sm text-foreground">components/ui</code>.
        </p>
      </Section>

      <Section title="Theming">
        <p>
          Every component colors itself with shadcn&apos;s theme tokens and nothing else, so it
          looks like the rest of your app, not like this site. A test on this site fails the build
          if one reaches for any other color.
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {TOKENS.map((t) => (
            <li
              key={t}
              className="border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground"
            >
              --{t}
            </li>
          ))}
        </ul>
        <p>
          Corners follow <code className="font-mono text-sm text-foreground">--radius</code>, the
          same as shadcn&apos;s own components.
        </p>
      </Section>

      <Section title="Components">
        <ul className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <li key={item.name} className="py-4">
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4">
                <code className="font-mono text-sm text-foreground">{item.name}</code>
                <Link href={`/ui/components/${item.name}`} className={linkClass}>
                  Examples
                </Link>
              </div>
              <p className="mb-3 text-sm/relaxed text-muted-foreground">{item.description}</p>
              <CodeBlock code={item.command} lang="bash" />
            </li>
          ))}
        </ul>
      </Section>
    </article>
  );
}

const linkClass =
  "text-sm text-foreground underline decoration-primary underline-offset-4 transition-colors hover:text-primary";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-12 space-y-4 text-subtle">
      <h2 className="text-2xl text-foreground">{title}</h2>
      {children}
    </section>
  );
}
