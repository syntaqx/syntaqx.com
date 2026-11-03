import { PatternPage } from "@/app/ui/_components/pattern-page";
import type { Demo } from "@/app/ui/_components/demo-section";
import { AllDoneDemo, FirstRunDemo, NoResultsDemo } from "./demos";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/ui/patterns/empty-states",
  "Empty States",
  "First run, no results, and all done are three different empty states. Each should say why it's empty and what to do next. A pattern demo with live examples.",
);

const demos: Demo[] = [
  {
    id: "first-run",
    title: "First run",
    sources: [{ name: "GitHub" }],
    blurb: (
      <>
        The first empty screen is onboarding. Say what belongs here and why, give one primary
        action, and offer a way to see it populated without creating anything real.
      </>
    ),
    demo: <FirstRunDemo />,
  },
  {
    id: "no-results",
    title: "No results",
    sources: [{ name: "GitHub" }],
    blurb: (
      <>
        Repeat the query back, and if a filter is hiding a match, say so and offer to lift it. The
        reader shouldn&apos;t have to work out which of their own choices emptied the list.
      </>
    ),
    demo: <NoResultsDemo />,
  },
  {
    id: "all-done",
    title: "All done",
    sources: [{ name: "Superhuman" }],
    blurb: (
      <>
        Finishing is the goal, so it earns its own state. Acknowledge it, don&apos;t reuse the
        first-run copy, and keep the last action undoable in case the finish was a misclick.
      </>
    ),
    demo: <AllDoneDemo />,
  },
];

export default function EmptyStatesPage() {
  return <PatternPage href="/ui/patterns/empty-states" demos={demos} />;
}
