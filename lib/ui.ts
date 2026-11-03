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
  /** The page's opening paragraph, under its title. */
  lead: string;
  /** Items from registry.json this page demonstrates, installable with the shadcn CLI. */
  components?: string[];
}

/** Pages about the collection itself, listed under the overview. */
export const uiPages: { title: string; description: string; href: string }[] = [
  {
    title: "Installation",
    description:
      "Add any component here to your own app with the shadcn CLI. It takes on your theme through shadcn's tokens.",
    href: "/ui/installation",
  },
];

/** Interaction patterns: when and why, with live demos. */
export const patterns: UiPage[] = [
  {
    title: "Hover Cards",
    description:
      "Defer expensive context to intent. Reveal extra detail without bloating the initial render.",
    href: "/ui/patterns/hover-cards",
    lead: "Defer expensive context to intent. The page renders only what every reader needs; the rest waits behind a hover, a focus, or a long press.",
    category: "Overlays",
    tags: ["ux", "intent"],
    components: ["timestamp", "hover-card"],
  },
  {
    title: "Feedback & Affordance",
    description:
      "Copy confirmations, optimistic updates, destructive-action guards, and skeletons: how the UI tells the user what just happened.",
    href: "/ui/patterns/feedback",
    lead: "Patterns for telling the user what just happened, what they can do next, and what deserves a moment of friction.",
    category: "Feedback",
    tags: ["ux", "feedback"],
    components: ["copy-button"],
  },
  {
    title: "Empty States",
    description:
      "First run, no results, and all done are three different moments. Each one should say why it's empty and what to do next.",
    href: "/ui/patterns/empty-states",
    lead: "An empty list is three different moments: nothing here yet, nothing matches, and nothing left to do. My rule is that each one says why it's empty and offers the next step.",
    category: "Feedback",
    tags: ["ux", "onboarding"],
  },
  {
    title: "Inline Validation",
    description:
      "Reward early, punish late. When to validate a field, where the error goes, and what happens to focus on submit.",
    href: "/ui/patterns/inline-validation",
    lead: "Validation is mostly a question of timing. Tell people what passes before they start, confirm success the moment it happens, and hold errors until they've had a fair chance to finish.",
    category: "Forms",
    tags: ["forms", "a11y"],
    components: [
      "field",
      "input",
      "error-summary",
      "requirement-list",
      "password-input",
      "number-input",
      "button",
    ],
  },
  {
    title: "Keyboard & Focus",
    description:
      "Roving focus, focus that comes home after a dialog, and shortcuts people can actually discover.",
    href: "/ui/patterns/keyboard-and-focus",
    lead: "Focus is the keyboard user's cursor. My rule is that it always lands somewhere sensible: one stop per widget, home again after a detour, and shortcuts that say they exist.",
    category: "Navigation",
    tags: ["a11y", "keyboard"],
  },
];

/** Patterns grouped by category, skipping categories with none yet. */
export const patternGroups = categories
  .map((category) => ({ category, items: patterns.filter((p) => p.category === category) }))
  .filter((g) => g.items.length > 0);
