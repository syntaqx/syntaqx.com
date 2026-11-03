import { PatternPage } from "@/app/ui/_components/pattern-page";
import type { Demo } from "@/app/ui/_components/demo-section";
import { FocusReturnDemo, RovingDemo, ShortcutsDemo } from "./demos";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/ui/patterns/keyboard-and-focus",
  "Keyboard & Focus",
  "Roving focus in toolbars, focus that returns after a dialog closes, and keyboard shortcuts people can discover. A pattern demo with live examples.",
);

const demos: Demo[] = [
  {
    id: "roving-focus",
    title: "Roving focus",
    sources: [
      {
        name: "WAI-ARIA APG",
        href: "https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/",
      },
    ],
    blurb: (
      <>
        A group of controls is one Tab stop. Arrow keys move inside it, Tab moves past it, and
        coming back lands on the control you left. Five buttons shouldn&apos;t cost five presses of
        Tab.
      </>
    ),
    demo: <RovingDemo />,
  },
  {
    id: "focus-comes-home",
    title: "Focus comes home",
    sources: [
      {
        name: "WAI-ARIA APG",
        href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
      },
    ],
    blurb: (
      <>
        Opening a dialog moves focus into it; closing it puts focus back on whatever opened it.
        Without that, a keyboard user who closes a dialog starts over from the top of the page.
      </>
    ),
    demo: <FocusReturnDemo />,
  },
  {
    id: "shortcuts-people-can-find",
    title: "Shortcuts people can find",
    sources: [{ name: "GitHub" }, { name: "Linear" }],
    blurb: (
      <>
        Show the key next to the action it triggers, and keep a cheat sheet behind{" "}
        <code className="font-mono">?</code>. Scope single-key shortcuts to where they apply, so
        typing a &ldquo;j&rdquo; in a search box never moves a list.
      </>
    ),
    demo: <ShortcutsDemo />,
  },
];

export default function KeyboardAndFocusPage() {
  return <PatternPage href="/ui/patterns/keyboard-and-focus" demos={demos} />;
}
