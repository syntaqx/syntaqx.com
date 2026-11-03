import { AvatarDemo, TimeDemo, UserDemo } from "./demos";
import { DemoFrame } from "@/app/ui/_components/demo-frame";
import { PatternPage } from "@/app/ui/_components/pattern-page";
import type { Demo } from "@/app/ui/_components/demo-section";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/ui/patterns/hover-cards",
  "Hover Cards",
  "Defer expensive context to intent: reveal extra detail on hover without bloating the initial render. A pattern demo with real, interactive examples.",
);

const demos: Demo[] = [
  {
    id: "time-in-your-timezone",
    title: "Time, in your timezone",
    install: ["timestamp"],
    sources: [{ name: "Stripe", href: "https://stripe.com" }],
    blurb: (
      <>
        The event happened in one timezone, was stored as UTC (RFC&nbsp;3339), and you&apos;re
        reading it in a third. Render in the viewer&apos;s locale with the tz abbreviation always
        visible; reveal the source and UTC on intent.
      </>
    ),
    demo: <TimeDemo />,
  },
  {
    id: "user-previews-loaded-on-intent",
    title: "User previews, loaded on intent",
    install: ["hover-card"],
    sources: [
      { name: "GitHub", href: "https://github.com" },
      { name: "Linear", href: "https://linear.app" },
    ],
    blurb: (
      <>
        Mentions, avatar stacks, reviewer chips. Anywhere a person appears, the page might want to
        show who they are. Fetching every profile up front wastes bandwidth and rate limit. Defer
        the fetch until the reader points at a name or a face; cache the result per session so
        repeat hovers are instant.
      </>
    ),
    demo: (
      <DemoFrame
        className="divide-y divide-border"
        note="Data: GitHub's public REST API, unauthenticated, so it's rate limited to 60 requests an hour per IP."
      >
        <div className="p-6">
          <div className="mb-3 text-sm font-medium text-muted-foreground">As mentions</div>
          <UserDemo bare />
        </div>
        <div className="p-6">
          <div className="mb-3 text-sm font-medium text-muted-foreground">As avatars</div>
          <AvatarDemo bare />
        </div>
      </DemoFrame>
    ),
  },
];

export default function HoverCardsPage() {
  return <PatternPage href="/ui/patterns/hover-cards" demos={demos} />;
}
