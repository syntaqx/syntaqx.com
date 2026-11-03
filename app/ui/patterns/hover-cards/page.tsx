import { AvatarDemo, TimeDemo, UserDemo } from "./demos";
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
      <div className="border border-border bg-card">
        <div className="p-4">
          <div className="mb-2 text-[10px] font-medium text-muted-foreground">As mentions</div>
          <UserDemo bare />
        </div>
        <div className="border-t border-border p-4">
          <div className="mb-2 text-[10px] font-medium text-muted-foreground">As avatars</div>
          <AvatarDemo bare />
        </div>
        <div className="border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
          Data: GitHub public REST API. Unauthenticated requests are rate limited to 60/hour per IP.
        </div>
      </div>
    ),
  },
];

export default function HoverCardsPage() {
  return <PatternPage href="/ui/patterns/hover-cards" demos={demos} />;
}
