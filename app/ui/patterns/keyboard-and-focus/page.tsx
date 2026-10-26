import { DemoSection } from "../_components/demo-section";
import { FocusReturnDemo, RovingDemo, ShortcutsDemo } from "./demos";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/ui/patterns/keyboard-and-focus",
  "Keyboard & Focus",
  "Roving focus in toolbars, focus that returns after a dialog closes, and keyboard shortcuts people can discover. A pattern demo with live examples.",
);

export default function KeyboardAndFocusPage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">
          Keyboard &amp; Focus
        </h1>
        <p className="max-w-2xl text-dim leading-relaxed">
          Focus is the keyboard user&apos;s cursor. My rule is that it always
          lands somewhere sensible: one stop per widget, home again after a
          detour, and shortcuts that say they exist.
        </p>
      </div>

      <DemoSection
        title="Roving focus"
        sources={[
          {
            name: "WAI-ARIA APG",
            href: "https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/",
          },
        ]}
        blurb={
          <>
            A group of controls is one Tab stop. Arrow keys move inside it,
            Tab moves past it, and coming back lands on the control you left.
            Five buttons shouldn&apos;t cost five presses of Tab.
          </>
        }
      >
        <RovingDemo />
      </DemoSection>

      <DemoSection
        title="Focus comes home"
        sources={[
          {
            name: "WAI-ARIA APG",
            href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
          },
        ]}
        blurb={
          <>
            Opening a dialog moves focus into it; closing it puts focus back on
            whatever opened it. Without that, a keyboard user who closes a
            dialog starts over from the top of the page.
          </>
        }
      >
        <FocusReturnDemo />
      </DemoSection>

      <DemoSection
        title="Shortcuts people can find"
        sources={[{ name: "GitHub" }, { name: "Linear" }]}
        blurb={
          <>
            Show the key next to the action it triggers, and keep a cheat sheet
            behind <code className="font-mono">?</code>. Scope single-key
            shortcuts to where they apply, so typing a &ldquo;j&rdquo; in a
            search box never moves a list.
          </>
        }
      >
        <ShortcutsDemo />
      </DemoSection>
    </div>
  );
}
