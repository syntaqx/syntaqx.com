import { OG_SIZE } from "@/lib/og";
import { ogCard } from "@/lib/og-card";
import { getDocsByCategory } from "@/lib/docs";
import { INDUSTRIES, industryParts, industrySection } from "@/lib/industries";

export const alt = "An industry volume of the syntaqx playbook";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export default async function Image({ params }: { params: Promise<{ industry: string }> }) {
  const slug = (await params).industry;
  const industry = INDUSTRIES.find((i) => i.slug === slug)!;
  const docs = getDocsByCategory().find((c) => c.section === industrySection(slug))?.docs ?? [];
  const parts = industryParts(docs).filter((p) => p.title).length;
  return ogCard({
    kicker: "The playbook  ·  Industry volume",
    title: industry.name,
    description: industry.summary,
    scene: "stack",
    path: `/docs/industries/${slug}`,
    stat: `${docs.length} chapters${parts ? `  ·  ${parts} parts` : ""}`,
  });
}
