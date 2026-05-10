import Link from "next/link";
import { getDocsByCategory } from "@/lib/docs";
import { Card } from "@/components/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description: "Standards, conventions, and reference documentation.",
};

export default function DocsPage() {
  const categories = getDocsByCategory();

  return (
    <div>
      {/* Hero */}
      <div className="mb-12 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-3">
          Documentation
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Patterns and conventions I&apos;ve landed on after years of trial,
          error, and strong opinions. None of this is new or proprietary. These
          are well-established practices for building software, and this is how
          I choose to implement them.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.name}>
            <h2 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-3">
              {category.name}
            </h2>
            <Card className="space-y-1">
              {category.docs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="group block py-1.5"
                >
                  <span className="text-sm text-foreground group-hover:text-accent transition-colors">
                    {doc.title}
                  </span>
                  {doc.description && (
                    <p className="text-xs text-dim leading-relaxed mt-0.5">
                      {doc.description}
                    </p>
                  )}
                </Link>
              ))}
            </Card>
          </div>
        ))}

        {/* Reference section */}
        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-3">
            Reference
          </h2>
          <Card className="space-y-1">
            <Link href="/docs/api" className="group block py-1.5">
              <span className="text-sm text-foreground group-hover:text-accent transition-colors">
                API Reference
              </span>
              <p className="text-xs text-dim leading-relaxed mt-0.5">
                Interactive API documentation with live request testing.
              </p>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
