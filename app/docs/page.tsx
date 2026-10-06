import Link from "next/link";
import { getDocsByCategory } from "@/lib/docs";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs & API Reference",
  description:
    "Standards, conventions, and reference documentation for building consistent APIs: naming, pagination, errors, time, identifiers, and more.",
};

export default function DocsPage() {
  const categories = getDocsByCategory();

  return (
    <div>
      <PageHeader
        label="docs"
        title="Conventions"
        scene="spec"
        sceneLabel="A spec sheet lifted off its index, with one teal row highlighted"
      >
        <p>
          Patterns and conventions I&apos;ve landed on after years of trial,
          error, and strong opinions. None of this is new or proprietary. These
          are well-established practices for building software, and this is how
          I choose to implement them.
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
