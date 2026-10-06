import type { Metadata } from "next";
import { DemoSection } from "../_components/demo-section";
import { CopyDemo, GuardDemo, OptimisticDemo, SkeletonDemo } from "./demos";

export const metadata: Metadata = {
  title: "Feedback & Affordance",
  description:
    "Patterns for telling users what just happened, what they can do next, and what to be careful about: a practical tour of feedback and affordance in UI.",
};

export default function FeedbackPage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">
          Feedback &amp; Affordance
        </h1>
        <p className="max-w-2xl text-dim leading-relaxed">
          Patterns for telling the user what just happened, what they can do
          next, and what deserves a moment of friction.
        </p>
      </div>

      <DemoSection
        title="Copy with confirmation"
        sources={[{ name: "GitHub" }]}
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
        sources={[{ name: "Linear" }, { name: "Superhuman" }]}
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
        sources={[{ name: "GitHub" }, { name: "Stripe" }]}
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
        sources={[{ name: "Facebook" }]}
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
