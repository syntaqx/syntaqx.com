import { OG_SIZE } from "@/lib/og";
import { ogCard } from "@/lib/og-card";
import { componentGroups, components } from "@/lib/ui";

// The page sets its own openGraph, which replaces /ui's, so its card is its own.
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return components.map((c) => ({ name: c.name }));
}

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const c = components.find((x) => x.name === name)!;
  const group = componentGroups.find((g) => g.items.includes(c))!;
  return ogCard({
    kicker: `UI  ·  ${group.category}`,
    title: c.title,
    description: c.description,
    scene: "layers",
    path: c.href,
  });
}
