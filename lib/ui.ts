import registry from "@/registry.json";

/** Pages about the collection itself, listed under the overview. */
export const uiPages: { title: string; description: string; href: string }[] = [
  {
    title: "Installation",
    description:
      "Add any component here to your own app with the shadcn CLI. It takes on your theme through shadcn's tokens.",
    href: "/ui/installation",
  },
];

/** The registry's components, in the order and groups the /ui sidebar lists them. */
const COMPONENT_GROUPS = [
  ["actions", "Actions"],
  ["forms", "Forms"],
  ["navigation", "Navigation"],
  ["overlays", "Overlays"],
  ["feedback", "Feedback"],
  ["data", "Data display"],
] as const;

export const components = registry.items.map((i) => ({
  name: i.name,
  title: i.title,
  description: i.description,
  href: `/ui/components/${i.name}`,
  category: i.categories[0],
}));

export const componentGroups = COMPONENT_GROUPS.map(([key, label]) => ({
  category: label,
  items: components.filter((c) => c.category === key),
})).filter((g) => g.items.length > 0);
