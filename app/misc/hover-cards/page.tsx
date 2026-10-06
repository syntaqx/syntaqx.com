import type { Metadata } from "next";
import { AvatarDemo, TimeDemo, UserDemo } from "./demos";
import { DemoSection } from "../_components/demo-section";

export const metadata: Metadata = {
  title: "Hover Cards",
  description:
    "Defer expensive context to intent: reveal extra detail on hover without bloating the initial render. A pattern demo with real, interactive examples.",
};

export default function HoverCardsPage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="mb-4 text-4xl leading-[0.9] sm:text-5xl">Hover Cards</h1>
        <p className="max-w-2xl text-lg text-dim leading-relaxed">
          Defer expensive context to intent. The page renders only what every
          reader needs; the rest waits behind a hover, a focus, or a long press.
        </p>
      </div>

      <DemoSection
        title="Time, in your timezone"
        sources={[{ name: "Stripe", href: "https://stripe.com" }]}
        blurb={
          <>
            The event happened in one timezone, was stored as UTC
            (RFC&nbsp;3339), and you&apos;re reading it in a third. Render in
            the viewer&apos;s locale with the tz abbreviation always visible;
            reveal the source and UTC on intent.
          </>
        }
      >
        <TimeDemo />
      </DemoSection>

      <DemoSection
        title="User previews, loaded on intent"
        sources={[
          { name: "GitHub", href: "https://github.com" },
          { name: "Linear", href: "https://linear.app" },
        ]}
        blurb={
          <>
            Mentions, avatar stacks, reviewer chips. Anywhere a person appears,
            the page might want to show who they are. Fetching every profile up
            front wastes bandwidth and rate limit. Defer the fetch until the
            reader points at a name or a face; cache the result per session so
            repeat hovers are instant.
          </>
        }
      >
        <div className="border border-border bg-surface">
          <div className="p-4">
            <div className="mb-2 text-[10px] font-medium text-dim">
              As mentions
            </div>
            <UserDemo bare />
          </div>
          <div className="border-t border-border p-4">
            <div className="mb-2 text-[10px] font-medium text-dim">
              As avatars
            </div>
            <AvatarDemo bare />
          </div>
          <div className="border-t border-border px-4 py-2.5 text-[10px] text-dim">
            Data: GitHub public REST API. Unauthenticated requests are rate
            limited to 60/hour per IP.
          </div>
        </div>
      </DemoSection>
    </div>
  );
}
