/** The groups patterns are filed under, in the order the index lists them. */
export const categories = [
  "Forms",
  "Data",
  "Navigation",
  "Overlays",
  "Feedback",
  "Motion",
] as const;
export type Category = (typeof categories)[number];

export interface UiPage {
  title: string;
  description: string;
  href: string;
  category: Category;
  tags: string[];
  /** Items from registry.json this page demonstrates, installable with the shadcn CLI. */
  components?: string[];
}

/** Interaction patterns: when and why, with live demos. */
export const patterns: UiPage[] = [
  {
    title: "Hover Cards",
    description:
      "Defer expensive context to intent. Reveal extra detail without bloating the initial render.",
    href: "/ui/patterns/hover-cards",
    category: "Overlays",
    tags: ["ux", "intent"],
    components: ["timestamp", "hover-card"],
  },
  {
    title: "Feedback & Affordance",
    description:
      "Copy confirmations, optimistic updates, destructive-action guards, and skeletons: how the UI tells the user what just happened.",
    href: "/ui/patterns/feedback",
    category: "Feedback",
    tags: ["ux", "feedback"],
    components: ["copy-button"],
  },
  {
    title: "Empty States",
    description:
      "First run, no results, and all done are three different moments. Each one should say why it's empty and what to do next.",
    href: "/ui/patterns/empty-states",
    category: "Feedback",
    tags: ["ux", "onboarding"],
  },
  {
    title: "Inline Validation",
    description:
      "Reward early, punish late. When to validate a field, where the error goes, and what happens to focus on submit.",
    href: "/ui/patterns/inline-validation",
    category: "Forms",
    tags: ["forms", "a11y"],
  },
  {
    title: "Keyboard & Focus",
    description:
      "Roving focus, focus that comes home after a dialog, and shortcuts people can actually discover.",
    href: "/ui/patterns/keyboard-and-focus",
    category: "Navigation",
    tags: ["a11y", "keyboard"],
  },
];

/** Patterns grouped by category, skipping categories with none yet. */
export const patternGroups = categories
  .map((category) => ({ category, items: patterns.filter((p) => p.category === category) }))
  .filter((g) => g.items.length > 0);
