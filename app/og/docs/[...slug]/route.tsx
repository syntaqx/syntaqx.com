import { getAllDocs, getDocBySlug, getDocsByCategory } from "@/lib/docs";
import { isIndustry } from "@/lib/industries";
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

  const category = getDocsByCategory().find((c) => c.name === doc.category);
  const section = category?.name ?? "Docs";
  // Industry chapters read in order, so they carry their number.
  const chapter =
    category && isIndustry(category.section)
      ? `  ·  Chapter ${String(category.docs.findIndex((d) => d.slug === doc.slug) + 1).padStart(2, "0")}`
      : "";

  return ogCard({
    kicker: chapter ? `${section}${chapter}` : `The playbook  ·  ${section}`,
    title: doc.title,
    description: doc.description,
    scene: "spec",
    path: `/docs/${doc.slug}`,
    stat: doc.part,
  });
}
