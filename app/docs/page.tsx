import Link from "next/link";
import { getDocsByCategory } from "@/lib/docs";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { itemList } from "@/lib/schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architectural Playbook & API Reference",
  description:
    "An architectural playbook of standards for APIs, HTTP, payments, architecture, operations and delivery, plus the reference for the syntaqx API.",
};

export default function DocsPage() {
  const categories = getDocsByCategory();

  return (
    <div>
      <JsonLd
        data={itemList("Architectural Playbook & API Reference", "/docs", [
          ...categories.flatMap((c) =>
            c.docs.map((d) => ({ name: d.title, path: `/docs/${d.slug}` })),
          ),
          { name: "API Reference", path: "/docs/api" },
        ])}
      />
      <PageHeader
        label="docs"
        title="Playbook"
        scene="spec"
        sceneLabel="A spec sheet lifted off its index, with one teal row highlighted"
      >
        <p>
          The architectural playbook I bring to every team: the standards and
          practices I&apos;ve landed on after years of trial, error, and strong
          opinions, written down so they don&apos;t get re-argued in every
          codebase. None of it is new or proprietary. It&apos;s published
          standards, applied consistently. Start with{" "}
          <Link
            href="/docs/playbook"
            className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent"
          >
            the principles
          </Link>
          .
        </p>
      </PageHeader>

      <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <DocGroup key={category.name} name={category.name}>
            {category.docs.map((doc) => (
              <DocLink
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                title={doc.title}
                description={doc.description}
              />
            ))}
          </DocGroup>
        ))}
        <DocGroup name="Reference">
          <DocLink
            href="/docs/api"
            title="API Reference"
            description="Interactive API documentation with live request testing."
          />
        </DocGroup>
      </div>
    </div>
  );
}

function DocGroup({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="eyebrow mb-4">{name}</h2>
      <ul className="border-t border-border">{children}</ul>
    </section>
  );
}

function DocLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description?: string;
}) {
  return (
    <li className="border-b border-border">
      <Link href={href} className="group block py-4">
        <span className="text-xl leading-none text-foreground transition-colors group-hover:text-accent">
          {title}
        </span>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-dim">{description}</p>
        )}
      </Link>
    </li>
  );
}
