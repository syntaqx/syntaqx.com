// Each registry item's examples, in the order its page shows them. An
// example is one file beside this one; its page shows the file's source.
// A description says why the example does what it does (backticks mark
// code); sources credit where the idea came from.
import type { ComponentType } from "react";
import ButtonVariants from "./button-variants";
import ButtonSizes from "./button-sizes";
import ButtonLoading from "./button-loading";
import ButtonOptimistic from "./button-optimistic";
import ButtonDestructiveGuards from "./button-destructive-guards";
import ButtonGroupDemo from "./button-group-demo";
import ButtonGroupToolbar from "./button-group-toolbar";
import CopyButtonDemo from "./copy-button-demo";
import CopyButtonConfirmation from "./copy-button-confirmation";
import LabelDemo from "./label-demo";
import FieldDemo from "./field-demo";
import FieldValid from "./field-valid";
import FieldValidationTiming from "./field-validation-timing";
import InputSizes from "./input-sizes";
import InputStates from "./input-states";
import TextareaDemo from "./textarea-demo";
import InputGroupDemo from "./input-group-demo";
import PasswordInputDemo from "./password-input-demo";
import NumberInputDemo from "./number-input-demo";
import ErrorSummaryDemo from "./error-summary-demo";
import ErrorSummaryForm from "./error-summary-form";
import RequirementListDemo from "./requirement-list-demo";
import RequirementListPassword from "./requirement-list-password";
import HoverCardDemo from "./hover-card-demo";
import HoverCardGithub from "./hover-card-github";
import HoverCardGithubAvatars from "./hover-card-github-avatars";
import DialogDemo from "./dialog-demo";
import DialogFocusReturn from "./dialog-focus-return";
import TimestampDemo from "./timestamp-demo";
import TimestampTimezone from "./timestamp-timezone";
import SeparatorDemo from "./separator-demo";
import KbdDemo from "./kbd-demo";
import KbdShortcuts from "./kbd-shortcuts";
import SkeletonDemo from "./skeleton-demo";
import SkeletonThatMatches from "./skeleton-that-matches";
import SpinnerDemo from "./spinner-demo";
import EmptyDemo from "./empty-demo";
import EmptyFirstRun from "./empty-first-run";
import EmptyNoResults from "./empty-no-results";
import EmptyAllDone from "./empty-all-done";
import PasteButtonDemo from "./paste-button-demo";
import ToggleDemo from "./toggle-demo";
import SelectDemo from "./select-demo";
import CheckboxDemo from "./checkbox-demo";
import ToggleGroupSegmented from "./toggle-group-segmented";
import ToggleGroupMultiple from "./toggle-group-multiple";
import FileDropDemo from "./file-drop-demo";
import FileDropPanel from "./file-drop-panel";
import TooltipDemo from "./tooltip-demo";
import AlertDemo from "./alert-demo";

export interface Example {
  slug: string;
  title: string;
  description?: string;
  sources?: { name: string; href?: string }[];
  Component: ComponentType;
}

const APG = (pattern: string) => ({
  name: "WAI-ARIA APG",
  href: `https://www.w3.org/WAI/ARIA/apg/patterns/${pattern}/`,
});

export const examples: Record<string, Example[]> = {
  button: [
    { slug: "button-variants", title: "Variants", Component: ButtonVariants },
    { slug: "button-sizes", title: "Sizes", Component: ButtonSizes },
    { slug: "button-loading", title: "Loading", Component: ButtonLoading },
    {
      slug: "button-optimistic",
      title: "Optimistic UI",
      description:
        "Trust the input: apply the change immediately, reconcile on response, and roll back visibly on failure. The button is never disabled mid-flight, and a request id makes only the latest click's response count, so rapid clicks don't fight.",
      sources: [{ name: "Linear" }, { name: "Superhuman" }],
      Component: ButtonOptimistic,
    },
    {
      slug: "button-destructive-guards",
      title: "Destructive-action guards",
      description:
        "Calibrate the friction to the blast radius. A dismiss should be one click; a drop-database should require typing the name. Don't make a delete feel like an unsubscribe, or an unsubscribe feel like a delete.",
      sources: [{ name: "GitHub" }, { name: "Stripe" }],
      Component: ButtonDestructiveGuards,
    },
  ],
  "button-group": [
    { slug: "button-group-demo", title: "Split button", Component: ButtonGroupDemo },
    {
      slug: "button-group-toolbar",
      title: "Roving focus",
      description:
        "A toolbar is one Tab stop, not five. Arrow keys, Home and End move inside it, Tab moves past it, and coming back lands on the button you left. Only that button has `tabIndex={0}`; the rest are `-1`.",
      sources: [APG("toolbar")],
      Component: ButtonGroupToolbar,
    },
  ],
  "copy-button": [
    { slug: "copy-button-demo", title: "Icon and label", Component: CopyButtonDemo },
    {
      slug: "copy-button-confirmation",
      title: "Copy with confirmation",
      description:
        "The button briefly becomes its own success state. No toast, no modal: the affordance and the feedback are the same element, which keeps the reader's eyes where their hands already are.",
      sources: [{ name: "GitHub" }],
      Component: CopyButtonConfirmation,
    },
  ],
  label: [{ slug: "label-demo", title: "With an input", Component: LabelDemo }],
  field: [
    { slug: "field-demo", title: "Label, description and error", Component: FieldDemo },
    { slug: "field-valid", title: "Success", Component: FieldValid },
    {
      slug: "field-validation-timing",
      title: "Reward early, punish late",
      description:
        "Show success as soon as a value is valid, but wait for the reader to leave the field before showing an error. Once a field is in error, re-check on every keystroke so the error clears the instant it's fixed. Type an address slowly into each to feel the difference.",
      sources: [{ name: "Mihael Konjević" }],
      Component: FieldValidationTiming,
    },
  ],
  input: [
    { slug: "input-sizes", title: "Sizes", Component: InputSizes },
    { slug: "input-states", title: "States", Component: InputStates },
  ],
  textarea: [{ slug: "textarea-demo", title: "Grows with its content", Component: TextareaDemo }],
  "input-group": [
    { slug: "input-group-demo", title: "Icons, text and buttons", Component: InputGroupDemo },
  ],
  "password-input": [
    {
      slug: "password-input-demo",
      title: "Show, hide and Caps Lock",
      Component: PasswordInputDemo,
    },
  ],
  "number-input": [{ slug: "number-input-demo", title: "Bounded", Component: NumberInputDemo }],
  "error-summary": [
    { slug: "error-summary-demo", title: "Two problems", Component: ErrorSummaryDemo },
    {
      slug: "error-summary-form",
      title: "Error summary on submit",
      description:
        "A failed submit moves focus to a summary at the top that counts the problems and links each one to its field. Inline messages stay too: the summary is for finding errors, the inline message is for fixing them.",
      sources: [
        {
          name: "GOV.UK Design System",
          href: "https://design-system.service.gov.uk/components/error-summary/",
        },
      ],
      Component: ErrorSummaryForm,
    },
  ],
  "requirement-list": [
    {
      slug: "requirement-list-demo",
      title: "Ticked off as they're met",
      Component: RequirementListDemo,
    },
    {
      slug: "requirement-list-password",
      title: "Rules before errors",
      description:
        "If a field has rules, they're part of the label, not the error. List them up front and tick each one off as it's met, so nobody has to fail to learn what passes.",
      sources: [{ name: "GitHub" }],
      Component: RequirementListPassword,
    },
  ],
  "hover-card": [
    { slug: "hover-card-demo", title: "Preview on intent", Component: HoverCardDemo },
    {
      slug: "hover-card-github",
      title: "Loading on intent: GitHub profiles",
      description:
        "Anywhere a person appears, the page might want to show who they are, but fetching every profile up front wastes bandwidth and rate limit. Defer the fetch until the reader points at a name, and cache it per session so repeat hovers are instant.",
      sources: [
        { name: "GitHub", href: "https://github.com" },
        { name: "Linear", href: "https://linear.app" },
      ],
      Component: HoverCardGithub,
    },
    {
      slug: "hover-card-github-avatars",
      title: "Avatars as triggers",
      description:
        "The same `GitHubUser` card behind a face instead of a name, as in an avatar stack or a reviewer list. The data comes from GitHub's public API, unauthenticated, so it's limited to 60 requests an hour per IP.",
      Component: HoverCardGithubAvatars,
    },
  ],
  dialog: [
    { slug: "dialog-demo", title: "Confirm an action", Component: DialogDemo },
    {
      slug: "dialog-focus-return",
      title: "Focus comes home",
      description:
        "Opening a dialog moves focus into it; closing it puts focus back on whatever opened it. Without that, a keyboard user who closes a dialog starts over from the top of the page. Open each with the keyboard and close it with Esc.",
      sources: [APG("dialog-modal")],
      Component: DialogFocusReturn,
    },
  ],
  timestamp: [
    { slug: "timestamp-demo", title: "In running text", Component: TimestampDemo },
    {
      slug: "timestamp-timezone",
      title: "Time, in your timezone",
      description:
        "The event happened in one timezone, was stored as UTC (RFC 3339), and you're reading it in a third. Render in the viewer's locale with the zone always visible; reveal the source and UTC on intent.",
      sources: [{ name: "Stripe", href: "https://stripe.com" }],
      Component: TimestampTimezone,
    },
  ],
  separator: [
    { slug: "separator-demo", title: "Horizontal and vertical", Component: SeparatorDemo },
  ],
  kbd: [
    { slug: "kbd-demo", title: "Keys and combinations", Component: KbdDemo },
    {
      slug: "kbd-shortcuts",
      title: "Shortcuts people can find",
      description:
        "Show the key next to the action it triggers, and keep a cheat sheet behind `?`. Scope single-key shortcuts to where they apply, so typing a `j` in a search box never moves a list.",
      sources: [{ name: "GitHub" }, { name: "Linear" }],
      Component: KbdShortcuts,
    },
  ],
  skeleton: [
    { slug: "skeleton-demo", title: "A profile row", Component: SkeletonDemo },
    {
      slug: "skeleton-that-matches",
      title: "Skeletons that match",
      description:
        "Size the placeholder to the final content. A spinner suggests an unknown wait and collapses the layout; a skeleton holds the shape, so nothing reflows when the data lands.",
      sources: [{ name: "Facebook" }],
      Component: SkeletonThatMatches,
    },
  ],
  spinner: [{ slug: "spinner-demo", title: "Beside a status", Component: SpinnerDemo }],
  empty: [
    { slug: "empty-demo", title: "Nothing yet", Component: EmptyDemo },
    {
      slug: "empty-first-run",
      title: "First run",
      description:
        "The first empty screen is onboarding. Say what belongs here and why, give one primary action, and offer a way to see it populated without creating anything real.",
      sources: [{ name: "GitHub" }],
      Component: EmptyFirstRun,
    },
    {
      slug: "empty-no-results",
      title: "No results",
      description:
        "Repeat the query back, and if a filter is hiding a match, say so and offer to lift it. The reader shouldn't have to work out which of their own choices emptied the list.",
      sources: [{ name: "GitHub" }],
      Component: EmptyNoResults,
    },
    {
      slug: "empty-all-done",
      title: "All done",
      description:
        "Finishing is the goal, so it earns its own state. Acknowledge it, don't reuse the first-run copy, and keep the last action undoable in case the finish was a misclick.",
      sources: [{ name: "Superhuman" }],
      Component: EmptyAllDone,
    },
  ],
  "paste-button": [
    {
      slug: "paste-button-demo",
      title: "Into a field",
      description:
        "Paste is a keyboard shortcut people forget exists on a phone. A button beside the field reads the clipboard in one tap; where the browser refuses, Ctrl/Cmd+V still works, so the button stays quiet instead of erroring.",
      Component: PasteButtonDemo,
    },
  ],
  toggle: [{ slug: "toggle-demo", title: "Variants and sizes", Component: ToggleDemo }],
  select: [{ slug: "select-demo", title: "Grouped options in a Field", Component: SelectDemo }],
  checkbox: [
    { slug: "checkbox-demo", title: "With a label and description", Component: CheckboxDemo },
  ],
  "toggle-group": [
    {
      slug: "toggle-group-segmented",
      title: "Segmented control",
      description:
        "One choice from a few, all visible. It's one Tab stop with arrow keys inside, and since Radix lets a second click clear a single group, the handler ignores the empty value so a mode always has one.",
      sources: [APG("radio")],
      Component: ToggleGroupSegmented,
    },
    {
      slug: "toggle-group-multiple",
      title: "Several at once",
      description:
        'With `type="multiple"` each item toggles on its own and the value is the list that\'s on. A little `spacing` separates them, so they read as a set of switches rather than one control.',
      Component: ToggleGroupMultiple,
    },
  ],
  "file-drop": [
    { slug: "file-drop-demo", title: "Drop or click", Component: FileDropDemo },
    {
      slug: "file-drop-panel",
      title: "A field that takes files",
      description:
        "The whole box takes a dropped file and the button opens the picker, so the field works for typing, pasting and files alike. Only drags carrying files light it up, so dragging text into the textarea behaves as usual.",
      Component: FileDropPanel,
    },
  ],
  tooltip: [
    {
      slug: "tooltip-demo",
      title: "More about an option",
      description:
        "A tooltip is for a short aside the label can't hold. Its trigger is a real button, so it opens on focus as well as hover; anything the reader needs to succeed belongs in a description instead.",
      Component: TooltipDemo,
    },
  ],
  alert: [{ slug: "alert-demo", title: "Neutral and destructive", Component: AlertDemo }],
};
