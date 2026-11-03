import { PatternPage } from "@/app/ui/_components/pattern-page";
import type { Demo } from "@/app/ui/_components/demo-section";
import { RulesDemo, SummaryDemo, TimingDemo } from "./demos";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/ui/patterns/inline-validation",
  "Inline Validation",
  "Reward early, punish late: when to validate a form field, where the error goes, and what happens to focus on submit. A pattern demo with live examples.",
);

const demos: Demo[] = [
  {
    id: "reward-early-punish-late",
    title: "Reward early, punish late",
    install: ["field", "input"],
    sources: [{ name: "Mihael Konjević" }],
    blurb: (
      <>
        Show success as soon as a value is valid, but wait for the reader to leave the field before
        showing an error. Once a field is in error, re-check on every keystroke so the error clears
        the instant it&apos;s fixed.
      </>
    ),
    demo: <TimingDemo />,
  },
  {
    id: "error-summary-on-submit",
    title: "Error summary on submit",
    install: ["error-summary", "number-input", "button"],
    sources: [
      {
        name: "GOV.UK Design System",
        href: "https://design-system.service.gov.uk/components/error-summary/",
      },
    ],
    blurb: (
      <>
        A failed submit moves focus to a summary at the top that counts the problems and links each
        one to its field. Inline messages stay too: the summary is for finding errors, the inline
        message is for fixing them.
      </>
    ),
    demo: <SummaryDemo />,
  },
  {
    id: "rules-before-errors",
    title: "Rules before errors",
    install: ["requirement-list", "password-input"],
    sources: [{ name: "GitHub" }],
    blurb: (
      <>
        If a field has rules, they&apos;re part of the label, not the error. List them up front and
        tick each one off as it&apos;s met, so nobody has to fail to learn what passes.
      </>
    ),
    demo: <RulesDemo />,
  },
];

export default function InlineValidationPage() {
  return <PatternPage href="/ui/patterns/inline-validation" demos={demos} />;
}
