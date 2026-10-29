import Link from "next/link";
import { DocsIndex } from "@/components/docs-index";
import { getDocsByCategory } from "@/lib/docs";
import { JsonLd } from "@/components/json-ld";
import { collectionPage } from "@/lib/schema";
import { markdownAlternates, pageMetadata } from "@/lib/metadata";

const description =
  "An architectural playbook of standards for APIs, HTTP, payments, architecture, operations and delivery, plus the reference for the syntaqx API.";

export const metadata = { ...pageMetadata("/docs", "Documentation", description), alternates: markdownAlternates("/docs") };

export default function DocsPage() {
  const categories = getDocsByCategory();

  return (
    <div>
      <JsonLd
        data={collectionPage({
          name: "Documentation",
          description,
          path: "/docs",
          crumbs: [{ name: "Docs", path: "/docs" }],
          items: [
            ...categories.flatMap((c) =>
              c.docs.map((d) => ({ name: d.title, path: `/docs/${d.slug}` })),
            ),
            { name: "API Reference", path: "/docs/api" },
          ],
        })}
      />

      <DocsIndex
        intro={
          <p>
            The architectural playbook I bring to every team: the standards I&apos;ve
            landed on, written down so they don&apos;t get re-argued in every codebase.
            New here? Start with{" "}
            <Link
              href="/docs/playbook"
              className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent"
            >
              the principles
            </Link>
            .
          </p>
        }
        categories={[
          ...categories.map((c) => ({
            name: c.name,
            section: c.section,
            docs: c.docs.map((d) => ({
              href: `/docs/${d.slug}`,
              title: d.title,
              description: d.description,
            })),
          })),
          {
            name: "Reference",
            section: "reference",
            docs: [
              {
                href: "/docs/api",
                title: "API Reference",
                description:
                  "Interactive reference for the syntaqx API, generated from its OpenAPI description, with a live console to send requests and inspect responses.",
              },
            ],
          },
        ]}
      />
    </div>
  );
}
