import { getAllDocs, getDocBySlug, getDocsByCategory } from "@/lib/docs";
import { ogCard } from "@/lib/og-card";

// The social preview for each doc. A route handler rather than an
// opengraph-image file: under the [...slug] catch-all, the image route would
// put a segment after the catch-all, which Next doesn't allow.

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug.split("/") }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
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
