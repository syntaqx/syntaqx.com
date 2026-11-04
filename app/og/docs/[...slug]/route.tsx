import { getDocBySlug, getDocsByCategory } from "@/lib/docs";
import { ogCard } from "@/lib/og-card";

// The social preview for each doc. A route handler rather than an
// opengraph-image file: under the [...slug] catch-all, the image route would
// put a segment after the catch-all, which Next doesn't allow.

// Rendered on first request and cached, not at build: prerendering every
// card cost the build most of its time. Unknown slugs 404 below.
export const dynamic = "force-static";

export function generateStaticParams() {
  return [];
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const slug = (await params).slug.join("/");
  const doc = getDocBySlug(slug);
  if (!doc) return new Response("Not found", { status: 404 });

  const section = getDocsByCategory().find((c) => c.name === doc.category)?.name ?? "Docs";

  return ogCard({
    kicker: `The playbook  ·  ${section}`,
    title: doc.title,
    description: doc.description,
    scene: "shelf",
    path: `/docs/${doc.slug}`,
    stat: doc.part,
  });
}
