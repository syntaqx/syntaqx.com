import { DemoSection } from "../_components/demo-section";
import { RulesDemo, SummaryDemo, TimingDemo } from "./demos";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/ui/patterns/inline-validation",
  "Inline Validation",
  "Reward early, punish late: when to validate a form field, where the error goes, and what happens to focus on submit. A pattern demo with live examples.",
);

export default function InlineValidationPage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">
          Inline Validation
        </h1>
        <p className="max-w-2xl text-dim leading-relaxed">
          Validation is mostly a question of timing. Tell people what passes
          before they start, confirm success the moment it happens, and hold
          errors until they&apos;ve had a fair chance to finish.
        </p>
      </div>

      <DemoSection
        title="Reward early, punish late"
        sources={[{ name: "Mihael Konjević" }]}
        blurb={
          <>
            Show success as soon as a value is valid, but wait for the reader
            to leave the field before showing an error. Once a field is in
            error, re-check on every keystroke so the error clears the instant
            it&apos;s fixed.
          </>
        }
      >
        <TimingDemo />
      </DemoSection>

      <DemoSection
        title="Error summary on submit"
        sources={[
          {
            name: "GOV.UK Design System",
            href: "https://design-system.service.gov.uk/components/error-summary/",
          },
        ]}
        blurb={
          <>
            A failed submit moves focus to a summary at the top that counts
            the problems and links each one to its field. Inline messages stay
            too: the summary is for finding errors, the inline message is for
            fixing them.
          </>
        }
      >
        <SummaryDemo />
      </DemoSection>

      <DemoSection
        title="Rules before errors"
        sources={[{ name: "GitHub" }]}
        blurb={
          <>
            If a field has rules, they&apos;re part of the label, not the
            error. List them up front and tick each one off as it&apos;s met,
            so nobody has to fail to learn what passes.
          </>
        }
      >
        <RulesDemo />
      </DemoSection>
    </div>
  );
}
