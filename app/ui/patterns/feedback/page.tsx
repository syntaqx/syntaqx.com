import { PatternPage } from "@/app/ui/_components/pattern-page";
import type { Demo } from "@/app/ui/_components/demo-section";
import { CopyDemo, GuardDemo, OptimisticDemo, SkeletonDemo } from "./demos";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/ui/patterns/feedback",
  "Feedback & Affordance",
  "Patterns for telling users what just happened, what they can do next, and what to be careful about: a practical tour of feedback and affordance in UI.",
);

const demos: Demo[] = [
  {
    id: "copy-with-confirmation",
    title: "Copy with confirmation",
    install: ["copy-button"],
    sources: [{ name: "GitHub" }],
    blurb: (
      <>
        The button briefly becomes its own success state. No toast, no modal. The affordance and the
        feedback are the same element, which keeps the user&apos;s eyes where their hands already
        are.
      </>
    ),
    demo: <CopyDemo />,
  },
  {
    id: "optimistic-ui",
    title: "Optimistic UI",
    sources: [{ name: "Linear" }, { name: "Superhuman" }],
    blurb: (
      <>
        Trust the input. Apply the change immediately, reconcile on response, roll back visibly on
        failure. The user keeps their flow; the network catches up. Don&apos;t disable the button
        mid-flight.
      </>
    ),
    demo: <OptimisticDemo />,
  },
  {
    id: "destructive-action-guards",
    title: "Destructive-action guards",
    sources: [{ name: "GitHub" }, { name: "Stripe" }],
    blurb: (
      <>
        Calibrate the friction to the blast radius. A dismiss should be one click; a drop-database
        should require typing the name. Don&apos;t make a delete feel like an unsubscribe, and
        don&apos;t make an unsubscribe feel like a delete.
      </>
    ),
    demo: <GuardDemo />,
  },
  {
    id: "skeletons-that-match",
    title: "Skeletons that match",
    sources: [{ name: "Facebook" }],
    blurb: (
      <>
        Layout-stable placeholders sized to the final content. Spinners suggest unknown duration and
        collapse the layout; skeletons suggest known-but-loading and hold the shape so nothing
        reflows when data lands.
      </>
    ),
    demo: <SkeletonDemo />,
  },
];

export default function FeedbackPage() {
  return <PatternPage href="/ui/patterns/feedback" demos={demos} />;
}
