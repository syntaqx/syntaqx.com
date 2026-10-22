+++
title = "Design Tokens & Theming"
description = "Named, semantic design tokens as the only source of color, type and spacing, so light and dark themes are one redefinition away and can never drift apart."
category = "Frontend"
order = 13.2
tags = ["design-tokens", "theming", "css", "frontend"]
+++

A design token is a named design decision: `--border` instead of `#1c2423`. Components use the name, never the value. That one rule is what makes theming, rebranding and contrast fixes a change in one file instead of a hunt through a thousand.

The hunt is worse than it sounds. A hard-coded color looks fine on the day it's written, in the one theme it was checked in. Nothing fails, no test catches it, and it surfaces months later as a white line in dark mode that nobody can trace back to a decision, because there never was one.

## Tokens, Not Literals

- **Color, type, spacing, radius, shadows and motion** are all tokens. A hex code, a pixel font size or a raw duration in a component is a bug.
- **CSS custom properties** are the delivery mechanism: they cascade, they can be redefined per theme or per component, and they work in every framework. See [MDN: custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties).
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

- **Respect the OS first** with [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), in CSS, so the first paint is right before any JavaScript runs. A theme chosen in JavaScript flashes the wrong colors on every load, which in dark mode means a white screen in a dark room.
- **Let people override it,** with a class or data attribute on the root that beats the media query, remembered across visits.
- **Set `color-scheme`** so form controls, scrollbars and system colors match the theme.

## Check Contrast in Every Theme

Contrast is a property of a pair of tokens in a theme, not of a component. Check every foreground and background pairing in every theme against the [WCAG ratios](/docs/frontend/accessibility): 4.5:1 for text, 3:1 for UI components. A palette that passes in dark mode can fail in light mode.

## Interchange Format

Once tokens exist in a design tool and in code, they will drift unless one is generated from the other. Tokens that both share should live in one source and be generated into each platform. The W3C Design Tokens Community Group's [Design Tokens Format Module](https://www.designtokens.org/TR/2025.10/format/) is the common JSON format for that, stable as of its 2025.10 version, and supported by tools like Style Dictionary.

## This Site

[syntaqx.com](https://github.com/syntaqx/syntaqx.com) defines its tokens in `app/globals.css`: dark values on `:root`, light values under `prefers-color-scheme: light`, and `.dark` and `.light` classes from the theme toggle that override the OS preference. Tailwind's theme maps its color utilities to the same variables, so `border-border` and `var(--border)` are one decision.

It also shows why the semantic layer matters. Table header rules used `--foreground`, the text color, so they rendered near-white in dark mode and near-black in light mode, far heavier than the row rules. The fix was one line: use `--border-hover`, the token for a border one step stronger than `--border`. Because it's a semantic token, it's right in both themes without any theme-specific code.

## References

**Specifications**

- [Design Tokens Community Group: Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/), the interchange format for tokens
- [W3C: Design Tokens Community Group](https://www.w3.org/community/design-tokens/), the group behind the format

**Reference**

- [MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties), cascading variables as the delivery mechanism
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), respecting the OS theme preference
