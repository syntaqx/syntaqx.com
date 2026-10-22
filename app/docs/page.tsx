import Link from "next/link";
import { DocsIndex } from "@/components/docs-index";
import { getDocsByCategory } from "@/lib/docs";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { itemList } from "@/lib/schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "An architectural playbook of standards for APIs, HTTP, payments, architecture, operations and delivery, plus the reference for the syntaqx API.",
};

export default function DocsPage() {
  const categories = getDocsByCategory();

  return (
    <div>
      <JsonLd
        data={itemList("Documentation", "/docs", [
          ...categories.flatMap((c) =>
            c.docs.map((d) => ({ name: d.title, path: `/docs/${d.slug}` })),
          ),
          { name: "API Reference", path: "/docs/api" },
        ])}
      />
      <PageHeader
        label="docs"
        title="Documentation"
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

      <DocsIndex
        categories={[
          ...categories.map((c) => ({
            name: c.name,
            docs: c.docs.map((d) => ({
              href: `/docs/${d.slug}`,
              title: d.title,
              description: d.description,
              tags: d.tags,
            })),
          })),
          {
            name: "Reference",
            docs: [
              {
                href: "/docs/api",
                title: "API Reference",
                description:
                  "Interactive reference for the syntaqx API, generated from its OpenAPI description, with a live console to send requests and inspect responses.",
                tags: ["api", "openapi", "reference"],
              },
            ],
          },
        ]}
      />
    </div>
  );
}
