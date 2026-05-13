import type { Metadata } from "next";
import { DemoSection } from "../_components/demo-section";
import { CopyDemo, GuardDemo, OptimisticDemo, SkeletonDemo } from "./demos";

export const metadata: Metadata = {
  title: "Feedback & Affordance",
  description:
    "Patterns for telling the user what just happened, what they can do, and what they should be careful about.",
};

export default function FeedbackPage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          Feedback &amp; Affordance
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Patterns for telling the user what just happened, what they can do
          next, and what deserves a moment of friction.
        </p>
      </div>

      <DemoSection
        title="Copy with confirmation"
        sources={[{ name: "GitHub", href: "https://github.com" }]}
        blurb={
          <>
            The button briefly becomes its own success state. No toast, no
            modal. The affordance and the feedback are the same element, which
            keeps the user&apos;s eyes where their hands already are.
          </>
        }
      >
        <CopyDemo />
      </DemoSection>

      <DemoSection
        title="Optimistic UI"
        sources={[
          { name: "Linear", href: "https://linear.app" },
          { name: "Superhuman", href: "https://superhuman.com" },
        ]}
        blurb={
          <>
            Trust the input. Apply the change immediately, reconcile on
            response, roll back visibly on failure. The user keeps their flow;
            the network catches up. Don&apos;t disable the button mid-flight.
          </>
        }
      >
        <OptimisticDemo />
      </DemoSection>

      <DemoSection
        title="Destructive-action guards"
        sources={[
          { name: "GitHub", href: "https://github.com" },
          { name: "Stripe", href: "https://stripe.com" },
        ]}
        blurb={
          <>
            Calibrate the friction to the blast radius. A dismiss should be one
            click; a drop-database should require typing the name. Don&apos;t
            make a delete feel like an unsubscribe, and don&apos;t make an
            unsubscribe feel like a delete.
          </>
        }
      >
        <GuardDemo />
      </DemoSection>

      <DemoSection
        title="Skeletons that match"
        sources={[{ name: "Facebook", href: "https://facebook.com" }]}
        blurb={
          <>
            Layout-stable placeholders sized to the final content. Spinners
            suggest unknown duration and collapse the layout; skeletons suggest
            known-but-loading and hold the shape so nothing reflows when data
            lands.
          </>
        }
      >
        <SkeletonDemo />
      </DemoSection>
    </div>
  );
}
