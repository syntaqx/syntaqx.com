export interface UiPage {
  title: string;
  description: string;
  href: string;
  tags: string[];
}

/** Interaction patterns: when and why, with live demos. */
export const patterns: UiPage[] = [
  {
    title: "Hover Cards",
    description:
      "Defer expensive context to intent. Reveal extra detail without bloating the initial render.",
    href: "/ui/patterns/hover-cards",
    tags: ["ux", "intent"],
  },
  {
    title: "Feedback & Affordance",
    description:
      "Copy confirmations, optimistic updates, destructive-action guards, and skeletons: how the UI tells the user what just happened.",
    href: "/ui/patterns/feedback",
    tags: ["ux", "feedback"],
  },
  {
    title: "Empty States",
    description:
      "First run, no results, and all done are three different moments. Each one should say why it's empty and what to do next.",
    href: "/ui/patterns/empty-states",
    tags: ["ux", "onboarding"],
  },
  {
    title: "Inline Validation",
    description:
      "Reward early, punish late. When to validate a field, where the error goes, and what happens to focus on submit.",
    href: "/ui/patterns/inline-validation",
    tags: ["forms", "a11y"],
  },
  {
    title: "Keyboard & Focus",
    description:
      "Roving focus, focus that comes home after a dialog, and shortcuts people can actually discover.",
    href: "/ui/patterns/keyboard-and-focus",
    tags: ["a11y", "keyboard"],
  },
];
