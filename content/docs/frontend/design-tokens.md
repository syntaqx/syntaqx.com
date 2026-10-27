+++
title = "Design Tokens & Theming"
description = "Named, semantic design tokens as the only source of color, type and spacing, so light and dark themes are one redefinition away and can never drift apart."
category = "Frontend"
order = 603
tags = ["design-tokens", "theming", "css", "frontend"]
+++

A design token is a named design decision: `--border` instead of `#1c2423`. Components use the name, never the value. That one rule makes theming, rebranding and contrast fixes a change in one file instead of a hunt through a thousand. And the hunt is worse than it sounds: a hard-coded color looks fine the day it's written, in the one theme it was checked in, then surfaces months later as a white line in dark mode that nobody can trace to a decision, because there never was one.

## Tokens, Not Literals

- **Color, type, spacing, radius, shadows and motion** are all tokens. A hex code, a pixel font size or a raw duration in a component is a bug.
- **CSS [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)** are the delivery mechanism: they cascade, can be redefined per theme or component, and work in every framework.
- **Utility frameworks map to tokens,** not to their default palette. If the framework offers `gray-800`, components should be using `border` instead.

## Semantic Over Raw

Name tokens for what they're for, not what they look like.

| Raw (palette) | Semantic (role) |
| --- | --- |
| `--teal-400` | `--accent` |
| `--gray-950` | `--background` |
| `--gray-100` | `--foreground` |
| `--gray-800` | `--border` |

- **Components only use semantic tokens.** `border: 1px solid var(--border)` keeps working in every theme; `var(--gray-800)` is correct in exactly one.
- **A palette layer is optional.** Semantic tokens can point at palette tokens, which helps when a brand has many shades, but components never skip the semantic layer.
- **Name the relationship, not the instance.** `--border` and `--border-strong` scale; `--table-header-line` multiplies until nobody knows which to use.

## Themes Are Token Redefinitions

A theme is a set of values for the same names. Light and dark mode never fork component styles:

```css
:root {
  --background: #0a0c0c;
  --foreground: #e6ece9;
  --border: #1c2423;
  color-scheme: dark;
}

@media (prefers-color-scheme: light) {
  :root:not(.dark) {
    --background: #eef2f1;
    --foreground: #0c1211;
    --border: #d2dad8;
    color-scheme: light;
  }
}

/* An explicit choice from the theme toggle beats the OS preference. */
.light { /* the light values again */ }
.dark  { /* the dark values again */ }
```

- **Respect the OS first** with [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), in CSS, so the first paint is right before any JavaScript runs. A theme chosen in JavaScript flashes the wrong colors on every load: a white screen in a dark room.
- **Let people override it,** with a class or data attribute on the root that beats the media query, remembered across visits.
- **Set `color-scheme`** so form controls, scrollbars and system colors match the theme.

## Check Contrast in Every Theme

Contrast is a property of a pair of tokens in a theme, not of a component. Check every foreground and background pairing in every theme against the [WCAG ratios](/docs/frontend/accessibility); a palette that passes in dark mode can fail in light mode.

## Interchange Format

Once tokens exist in a design tool and in code, they drift unless one is generated from the other, so shared tokens live in one source and are generated into each platform. The W3C Design Tokens Community Group's [Design Tokens Format Module](https://www.designtokens.org/TR/2025.10/format/) is the common JSON format for that, stable as of its 2025.10 version, and supported by tools like Style Dictionary.

## References

**Specifications**

- [Design Tokens Community Group: Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/), the interchange format for tokens
- [W3C: Design Tokens Community Group](https://www.w3.org/community/design-tokens/), the group behind the format

**Reference**

- [MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties), cascading variables as the delivery mechanism
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), respecting the OS theme preference
