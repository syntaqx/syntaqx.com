import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/syntaqx/ui/hover-card";

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a
          href="https://github.com/syntaqx"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          @syntaqx
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <p className="text-sm font-semibold">Chase Pierce</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Hover or Tab to me: the card opens on intent, not on every pass of the cursor.
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}
