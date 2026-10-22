+++
title = "Internationalization"
description = "Building software that can be translated and localized: externalized messages with ICU plurals, Intl formatting, locale choice, RTL layouts, and Unicode traps."
category = "Frontend"
order = 13.4
tags = ["i18n", "localization", "unicode", "frontend"]
+++

Internationalization (i18n) is engineering work: building the product so it *can* work in any language and region. Localization (l10n) is the content work that follows: translating, and adapting formats and conventions for a specific locale. The distinction matters because i18n has to happen in the code, and the cost of skipping it lands later, all at once, when the first translation shows every hard-coded string, every concatenated sentence and every layout that assumed English word lengths.

Even an English-only product benefits from most of this. Dates, numbers and currencies already vary between US and UK readers, names already come in shapes your validation didn't expect, and a later translation becomes a content project instead of a rewrite.

## Externalize Every String

User-facing text lives in message catalogs keyed by ID, never inline in components. The test is simple: grep the UI code for English sentences. Every hit is a string a translator will never see.

Keys should describe meaning, not wording: `checkout.submit_button`, not `place_order`. When the English copy changes from "Place order" to "Pay now", a meaning-based key stays valid, and the translation system can flag the string as changed instead of losing it.

## Plurals and Grammar: ICU MessageFormat

English has two plural forms: "1 file", "2 files". So the code naturally grows `count === 1 ? "file" : "files"`, and that code is wrong for most of the world. [CLDR's plural rules](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html) give Arabic six categories (zero, one, two, few, many, other), Polish and Russian four (one, few, many, other), and Japanese one. No ternary survives that.

[ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/) moves the grammar into the message, where each translator writes the forms their language needs:

```text
{count, plural,
  =0 {No files}
  one {# file}
  other {# files}
}
```

The same syntax handles grammatical gender and other variants with `select`. The code passes values (`count`, `gender`); the message decides the words. In JavaScript, [`Intl.PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules) exposes the same CLDR categories when you need them directly.

## Never Concatenate Sentences

`"Welcome back, " + name + "!"` assumes the name goes at the end, that the punctuation is the same, and that "welcome back" doesn't change form with the person. Each assumption breaks somewhere. Word order differs across languages, so a sentence assembled from translated fragments is often ungrammatical, and translators can't fix what they can't see as a whole.

Use one message with placeholders, `"Welcome back, {name}!"`, so the translator controls the entire sentence, including where the name goes. The same applies to sentences with embedded links or emphasis: keep the markup inside the message as named tags rather than splitting the sentence around it.

## Formatting: Use Intl, Not Strings

Dates, numbers, currencies, lists and relative times all have locale rules that string templates get wrong. `1,234.5` is `1.234,5` in Germany and `1 234,5` in France; a US date `3/4/2026` is March 4th in New York and April 3rd in London.

The browser and Node ship the [`Intl`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) APIs, built on CLDR data:

```ts
new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(1234.5);
// "1.234,50 €"
new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(date);
```

Formatting happens at the edge, for display only. Data stays in canonical forms: amounts as integer minor units with a currency code ([Money & Amounts](/docs/payments/money)), instants as UTC timestamps ([Time & Date Formats](/docs/fundamentals/time)). Convert to the user's locale and time zone when rendering, never before storing, or you'll be parsing "1.234,50" back into a number someday.

## Choosing the Locale

The browser sends its preferences in [`Accept-Language`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language), a list of [BCP 47](https://datatracker.ietf.org/doc/html/rfc5646) language tags with weights. It's a good default for a first visit, and better than guessing from IP location, which says where someone is, not what they read. A German speaker traveling in Japan doesn't want Japanese.

But an explicit choice always wins. Show a language switcher, persist the choice (in the account, or a cookie for anonymous visitors), and never override it with the header again. Browser defaults are often whatever the device shipped with; a person who picked a language from your menu has told you what they actually want. Put the locale in the URL (`/de/pricing`) when pages are public, so each language version is shareable and indexable.

## Right-to-Left Layouts

Arabic, Hebrew and Persian read right to left, and a mirrored layout isn't a translation detail: navigation, icons with direction, progress bars and padding all flip.

[CSS logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values) make this nearly free if you use them from the start. `margin-inline-start` instead of `margin-left`, `padding-inline-end` instead of `padding-right`, `text-align: start` instead of `left`. With `dir="rtl"` on the document, the layout flips itself. Retrofitting a codebase full of `left` and `right` is a long search-and-replace with visual review at every step. Don't mirror everything blindly, though: logos, media controls and numbers keep their direction.

## Text Expansion

Translated text is usually longer than English, and short strings grow the most. The W3C's [summary of IBM's guidelines](https://www.w3.org/International/articles/article-text-size) puts strings of up to 10 English characters at 200 to 300% of their original length, and strings over 70 characters at about 130%. A button labeled "Save" has to fit "Speichern"; a tab bar sized to English labels overflows in German.

Design for it: let containers grow, avoid fixed widths on anything holding text, allow wrapping, and truncate only with the full text available on hover or focus.

## Unicode Traps

- **Length isn't characters.** JavaScript's `string.length` counts UTF-16 code units, so "👍" has length 2 and a family emoji can be 11. Character limits, truncation and cursor movement should count graphemes (what a person sees as one character) with [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter), which follows [Unicode's segmentation rules](https://unicode.org/reports/tr29/).
- **Equal-looking strings may differ.** "é" can be one code point or "e" plus a combining accent. Normalize with [`String.prototype.normalize`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) (NFC is the usual choice, per [Unicode normalization forms](https://unicode.org/reports/tr15/)) before comparing, deduplicating or using text as a key.
- **Names don't follow your rules.** One field, not first and last; no minimum length; no rejecting apostrophes, hyphens, spaces or non-Latin scripts. The W3C's [personal names guidance](https://www.w3.org/International/questions/qa-personal-names) shows how many assumptions a "first name" field bakes in.

## Pseudo-Localization in CI

You can find most i18n bugs before anyone translates anything. [Pseudo-localization](https://learn.microsoft.com/en-us/globalization/methodology/pseudolocalization) generates a fake locale from English: accented characters ("Ŝåṽé"), padding of about 40% to simulate expansion, and brackets around each string. Any text that shows up unaccented was never externalized. Any string missing its closing bracket got truncated. Any bracket pair in the middle of a sentence reveals concatenation. ICU defines `en-XA` (accents) and `en-XB` (bidirectional) for exactly this.

Run the UI in the pseudo-locale in CI with screenshot or end-to-end tests, and these bugs fail the build instead of a release.

## What Not to Translate

Translate what people read. Don't translate identifiers: API field names, enum values, log messages, error codes and URLs stay stable so code, support and search keep working across languages. An error response carries a stable machine-readable shape plus a human message; the message is localizable, the shape isn't. Brand and product names usually stay as they are, by decision, written down.

## This Site

The site is English-only and sets `lang="en"` on the document, which tells screen readers and translation tools what they're reading. Its converter tools also show a small example of the length trap: their character counts use `string.length`, so an emoji in the input counts as two. That's fine for a byte-oriented encoder, where code units are what matter, and it would be a bug in a field with a "maximum 280 characters" limit shown to users.

## References

**Specifications**

- [Unicode CLDR: Language Plural Rules](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html), plural categories per language
- [ICU: Formatting Messages](https://unicode-org.github.io/icu/userguide/format_parse/messages/), MessageFormat syntax for plurals and selects
- [RFC 5646: Tags for Identifying Languages](https://datatracker.ietf.org/doc/html/rfc5646), BCP 47 language tags
- [Unicode UAX #29: Text Segmentation](https://unicode.org/reports/tr29/), grapheme clusters
- [Unicode UAX #15: Normalization Forms](https://unicode.org/reports/tr15/), NFC and NFD

**Reference**

- [MDN: Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl), locale-aware formatting in JavaScript
- [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat), numbers and currencies by locale
- [MDN: Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules), CLDR plural categories in code
- [MDN: Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter), counting and splitting graphemes
- [MDN: String.prototype.normalize](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize), Unicode normalization
- [MDN: CSS logical properties and values](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values), direction-independent layout
- [MDN: Accept-Language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language), the browser's language preferences

**In practice**

- [W3C: Text size in translation](https://www.w3.org/International/articles/article-text-size), expansion rates by string length
- [W3C: Setting language preferences in a browser](https://www.w3.org/International/questions/qa-lang-priorities), how users set the preferences behind Accept-Language
- [W3C: Personal names around the world](https://www.w3.org/International/questions/qa-personal-names), assumptions name fields shouldn't make
- [Microsoft: Pseudolocalization](https://learn.microsoft.com/en-us/globalization/methodology/pseudolocalization), pseudo-translation techniques and the en-XA and en-XB locales
