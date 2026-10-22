+++
title = "Accessibility"
description = "WCAG 2.2 AA as the baseline: semantic HTML first, keyboard and focus, contrast, reduced motion, and testing that goes beyond what automated tools can catch."
category = "Frontend"
order = 13
tags = ["accessibility", "a11y", "wcag", "frontend"]
+++

Accessibility is part of "done", not a later pass. Fixing it afterward means redesigning components people already depend on; building it in mostly means using the platform the way it was designed.

## The Baseline: WCAG 2.2 AA

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) at level AA is the target for everything we ship. It's what regulators, procurement teams and courts reference, and AA is achievable without compromising design.

WCAG 2.2 added criteria worth knowing by name ([what's new](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)):

| Criterion | Level | In practice |
| --- | --- | --- |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Sticky headers and cookie banners can't completely cover the focused element |
| 2.5.7 Dragging Movements | AA | Anything done by dragging has a single-pointer alternative |
| 2.5.8 Target Size (Minimum) | AA | Pointer targets are at least 24 by 24 CSS pixels, or spaced as if they were |
| 3.2.6 Consistent Help | A | Help links appear in the same place across pages |
| 3.3.7 Redundant Entry | A | Don't make people retype what they already entered in the same flow |
| 3.3.8 Accessible Authentication (Minimum) | AA | No cognitive tests to log in; allow paste and password managers |

## Semantic HTML First

The browser already knows how to make a `<button>` focusable, keyboard-operable and announced correctly. A `<div>` with a click handler knows none of that.

- **Use the element that means what you're building:** `<button>` for actions, `<a href>` for navigation, `<nav>`, `<main>`, `<label>`, `<table>` for tabular data, headings in order.
- **ARIA only when HTML can't do it.** The [first rule of ARIA](https://www.w3.org/TR/using-aria/) is to use a native element instead whenever one exists. ARIA changes what's announced, not how anything behaves, so a wrong role is worse than none.
- **Custom widgets** (tabs, comboboxes, dialogs) follow the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) patterns, including their keyboard behavior.

## Keyboard and Focus

Everything usable with a mouse is usable with a keyboard alone.

- **Logical tab order,** following the visual order. No positive `tabindex`.
- **Visible focus, always.** Never remove outlines without a replacement. `:focus-visible` shows focus for keyboard users without flashing it on every mouse click.
- **Dialogs trap focus** while open and return it to the trigger when closed. `Escape` closes them.
- **A skip link** to the main content on pages with long navigation.

## Color and Contrast

- **Text:** at least 4.5:1 against its background, 3:1 for large text (18pt, or 14pt bold).
- **UI components and graphics:** at least 3:1 for borders of inputs, focus indicators, icons and chart marks that carry meaning.
- **Never color alone.** Errors get an icon and text, links get an underline or another cue, charts get labels or patterns.
- **Check every theme.** A palette that passes in dark mode can fail in light mode. See [Design Tokens & Theming](/docs/frontend/design-tokens).

## Motion

Respect [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion). Animations that move, zoom or parallax get a reduced or static alternative. Nothing flashes more than three times a second.

## Forms

- **Every input has a visible `<label>`.** Placeholders aren't labels; they vanish when you type.
- **Errors are specific and attached:** the message says what's wrong and how to fix it, and it's linked to its field (`aria-describedby`) so screen readers announce it.
- **Don't clear the form** on an error. Keep what the person typed.
- **Use the right `type` and `autocomplete`,** so mobile keyboards and password managers help instead of fight.

## Images and Media

- **Meaningful images** get `alt` text that says what the image communicates, not what it looks like.
- **Decorative images** get `alt=""`, so screen readers skip them.
- **Video** has captions; audio has transcripts.

## Testing

Automated tools are necessary and nowhere near sufficient. [axe-core](https://github.com/dequelabs/axe-core), the engine behind most of them, reports finding about 57% of WCAG issues on average. The rest takes a person:

1. **Automated checks in CI** with axe on key pages, failing the build on new violations.
2. **A keyboard pass** on every new flow: unplug the mouse and finish the task.
3. **A screen reader pass** on new components: VoiceOver on macOS and iOS, NVDA on Windows.
4. **Zoom to 200%** and check at 320px width: content reflows, nothing overlaps or gets cut off.

## It's the Law, Too

In the US, the Department of Justice's position is that the ADA applies to the websites of businesses open to the public ([ADA.gov guidance](https://www.ada.gov/resources/web-guidance/)). In the EU, the [European Accessibility Act](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en) has applied since 28 June 2025 and covers e-commerce and other consumer services. Building to WCAG 2.2 AA puts you on the right side of both.

## References

**Specifications**

- [W3C: Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), success criteria, contrast ratios and conformance levels
- [W3C: What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), the nine criteria added in 2.2
- [W3C: Using ARIA](https://www.w3.org/TR/using-aria/), the rules of ARIA use, starting with native HTML first

**Reference**

- [W3C: ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/), keyboard and ARIA patterns for custom widgets
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), detecting the reduced-motion preference
- [Deque: axe-core](https://github.com/dequelabs/axe-core), the automated testing engine and what share of issues it catches

**In practice**

- [ADA.gov: Guidance on Web Accessibility and the ADA](https://www.ada.gov/resources/web-guidance/), how the ADA applies to websites
- [European Commission: European Accessibility Act](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en), scope of the EU requirements
