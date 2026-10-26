import { DemoSection } from "../_components/demo-section";
import { AllDoneDemo, FirstRunDemo, NoResultsDemo } from "./demos";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/ui/patterns/empty-states",
  "Empty States",
  "First run, no results, and all done are three different empty states. Each should say why it's empty and what to do next. A pattern demo with live examples.",
);

export default function EmptyStatesPage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">
          Empty States
        </h1>
        <p className="max-w-2xl text-dim leading-relaxed">
          An empty list is three different moments: nothing here yet, nothing
          matches, and nothing left to do. My rule is that each one says why
          it&apos;s empty and offers the next step.
        </p>
      </div>

      <DemoSection
        title="First run"
        sources={[{ name: "GitHub" }]}
        blurb={
          <>
            The first empty screen is onboarding. Say what belongs here and
            why, give one primary action, and offer a way to see it populated
            without creating anything real.
          </>
        }
      >
        <FirstRunDemo />
      </DemoSection>

      <DemoSection
        title="No results"
        sources={[{ name: "GitHub" }]}
        blurb={
          <>
            Repeat the query back, and if a filter is hiding a match, say so
            and offer to lift it. The reader shouldn&apos;t have to work out
            which of their own choices emptied the list.
          </>
        }
      >
        <NoResultsDemo />
      </DemoSection>

      <DemoSection
        title="All done"
        sources={[{ name: "Superhuman" }]}
        blurb={
          <>
            Finishing is the goal, so it earns its own state. Acknowledge it,
            don&apos;t reuse the first-run copy, and keep the last action
            undoable in case the finish was a misclick.
          </>
        }
      >
        <AllDoneDemo />
      </DemoSection>
    </div>
  );
}
