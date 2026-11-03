+++
title = "Text & Unicode"
description = "UTF-8 everywhere, four ways to measure a string, NFC for storage, case folding, locale-aware collation, confusables, bidi controls and database encodings."
category = "Fundamentals"
order = 106
tags = ["unicode", "utf-8", "text", "standards", "databases", "security"]
+++

Every system stores text, and most treat a string as a sequence of characters with a length. It isn't one thing. The same visible word can be stored as different bytes, a "character" a person sees can be several code points, one language's alphabetical order is another's mistake, and two usernames can look identical while differing in every byte. These bugs surface as a username that can't sign in, a truncated message that ends in a garbage byte, a duplicate account that the unique index didn't catch, or a sorted list that looks wrong to every Swedish customer.

The defaults below are few: UTF-8 at every boundary, NFC before storage, limits counted in grapheme clusters, case folding rather than lowercasing for matching, collation from ICU at sort time, and identifiers held to a stricter profile than free text. [Internationalization](/docs/frontend/internationalization) covers the UI side (messages, plurals, formatting, right-to-left layouts); this chapter is the data underneath.

## UTF-8 Everywhere

Use UTF-8 for every byte of text you store, send or receive: files, HTTP bodies, database columns, queues, logs, CSV exports. The WHATWG Encoding Standard says it plainly: "New protocols and formats, as well as existing formats deployed in new contexts, must use the UTF-8 encoding exclusively" ([WHATWG: Encoding](https://encoding.spec.whatwg.org/)). UTF-8 encodes every code point up to U+10FFFF in one to four bytes, keeps ASCII as ASCII, and "prohibits encoding character numbers between U+D800 and U+DFFF," the surrogates that exist only for UTF-16 ([RFC 3629](https://datatracker.ietf.org/doc/html/rfc3629)).

Valid UTF-8 is a rule you enforce at the boundary, not an assumption:

- **Decode strictly where input enters.** RFC 3629 says implementations "MUST protect against decoding invalid sequences," and gives the reason: an overlong encoding of `/` once slipped past checks for `/../`. A decoder either fails (WHATWG's "fatal" mode) or substitutes U+FFFD, the replacement character. For identifiers, keys and anything you'll compare, fail and return a 400. For free text from a legacy file, replacing is acceptable if you record that it happened.
- **Know what your language promises.** A Go `string` "is not required to hold Unicode text, UTF-8 text, or any other predefined format" ([Go blog: Strings](https://go.dev/blog/strings)), so check with `utf8.ValidString` at the boundary. Rust's `str` is always UTF-8 by construction, and bytes from outside become a `str` only through a checked conversion ([Rust: str](https://doc.rust-lang.org/std/primitive.str.html)).
- **Reject code points that have no business in your data.** [RFC 9839](https://www.rfc-editor.org/rfc/rfc9839.html) names the problem code points (surrogates, legacy control codes other than tab, newline and carriage return, and noncharacters such as U+FFFE) and defines subsets that exclude them. Its strictest, "Unicode Assignables," is a good default for identifiers and structured fields. Postgres has its own reason: "the character with code zero (sometimes called NUL) cannot be stored" ([PostgreSQL: Character Types](https://www.postgresql.org/docs/current/datatype-character.html)), so a NUL in a JSON string fails the insert unless you rejected it first.
- **Don't write a byte order mark.** UTF-8 doesn't need one, and the WHATWG decoder treats a BOM as "more authoritative than anything else," so a stray one changes how a file is read. Strip it from imports and don't emit it by default; files made for a specific consumer are the [Imports & Exports](/docs/building-blocks/imports-and-exports) chapter's problem.

## Four Lengths

"How long is this string?" has four answers, and each is right for a different question.

![Dimensional drawing of one short string, the letter e with a combining acute accent followed by a thumbs-up emoji with a skin tone modifier, measured four ways: eleven UTF-8 bytes, six UTF-16 code units, four code points and two grapheme clusters, with each row aligned to the UTF-8 bytes it covers](/diagrams/fd-text-units.svg "One string, four lengths: 11 bytes for the column, 6 UTF-16 units for JavaScript, 4 code points for Go and Rust iteration, and 2 characters for the person reading it.")

- **Bytes** are what storage, network limits and a column's on-disk size count. Go's `len` and Rust's `str::len` return bytes; Rust's docs say its length "is in bytes, not `char`s or graphemes."
- **UTF-16 code units** are what JavaScript, Java and C# count: one unit below U+10000, a surrogate pair above it. MDN's example: `"😄".length` is 2 ([MDN: String length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length)). A limit enforced in the browser with `.length` and on the server in bytes or code points disagrees on every emoji.
- **Code points** are what Go's runes and Rust's `char`s are. A combining accent and a skin tone modifier are code points of their own.
- **Grapheme clusters** are what a reader sees as one character. [UAX #29](https://www.unicode.org/reports/tr29/) defines them: "the notion of user-perceived characters corresponds to the concept of grapheme clusters," as a "best-effort approximation," and the extended clusters it defines "should be used in implementations in preference to legacy grapheme clusters." Its rules keep a letter with its combining marks and never break "within emoji flag sequences."

### Limits and Truncation

A length limit has two audiences, so give it two numbers:

- **A grapheme limit** for people: the counter beside a text box and the message "280 characters at most" count grapheme clusters, the same way on every client. In the browser that's `Intl.Segmenter` ([Unicode Traps](/docs/frontend/internationalization#unicode-traps)); on the server, a UAX #29 library ([rivo/uniseg](https://pkg.go.dev/github.com/rivo/uniseg) in Go, [unicode-segmentation](https://docs.rs/unicode-segmentation) in Rust).
- **A byte ceiling** for storage, set well above the grapheme limit and enforced on the server, so one pathological string (a single base letter with hundreds of combining marks is one grapheme) can't blow up a row, an index entry or a push payload.

Postgres counts neither of those in `varchar(n)`: it limits "up to *n* characters (not bytes)," meaning code points, and the same docs recommend `text` without a length "rather than making up an arbitrary length limit" ([PostgreSQL: Character Types](https://www.postgresql.org/docs/current/datatype-character.html)). My default is `text` plus a `CHECK` on `octet_length` where a byte ceiling matters, with the grapheme limit enforced in application code where the library lives.

Truncating for a preview, a notification or a column that must fit has to cut on a grapheme boundary. Cutting on a byte boundary produces invalid UTF-8 (and in Rust, slicing inside a code point panics); cutting on a code point boundary strips the accent off a letter or turns a family emoji into a lone adult.

```go tab="Go"
import "github.com/rivo/uniseg"

// Truncate returns the longest prefix of s that fits in maxBytes of UTF-8
// and ends on a grapheme cluster boundary.
func Truncate(s string, maxBytes int) string {
	if len(s) <= maxBytes {
		return s
	}
	end, state, rest := 0, -1, s
	for len(rest) > 0 {
		var cluster string
		cluster, rest, _, state = uniseg.FirstGraphemeClusterInString(rest, state)
		if end+len(cluster) > maxBytes {
			break
		}
		end += len(cluster)
	}
	return s[:end]
}
```

```rust tab="Rust"
use unicode_segmentation::UnicodeSegmentation;

/// The longest prefix of `s` that fits in `max_bytes` of UTF-8
/// and ends on a grapheme cluster boundary.
pub fn truncate(s: &str, max_bytes: usize) -> &str {
    if s.len() <= max_bytes {
        return s;
    }
    let mut end = 0;
    for (i, g) in s.grapheme_indices(true) {
        if i + g.len() > max_bytes {
            break;
        }
        end = i + g.len();
    }
    &s[..end]
}
```

Given `"ab👨‍👩‍👧‍👦"` (27 bytes, three graphemes) and a 5-byte budget, both return `"ab"`, not `"ab"` followed by half a man. Add the ellipsis after truncating, and count its bytes in the budget.

## Normalization

Unicode often has more than one way to write the same text. "é" is U+00E9, or "e" followed by U+0301 COMBINING ACUTE ACCENT; they render the same and compare unequal byte for byte. Text typed on one platform, pasted from a PDF or imported from another system arrives in either form. [UAX #15](https://www.unicode.org/reports/tr15/) defines four normalization forms:

| Form | What it does | Use it for |
| ---- | ------------ | ---------- |
| NFC | Canonical decomposition, then canonical composition | Storage and comparison of ordinary text |
| NFD | Canonical decomposition | Internal processing that strips or inspects accents |
| NFKC | Compatibility decomposition, then canonical composition | Identifiers, usernames, search keys |
| NFKD | Compatibility decomposition | Rarely; search indexing pipelines |

**Normalize to NFC at the boundary, before storage.** Canonical equivalents "should always have the same visual appearance and behavior," so NFC loses nothing a reader can see, and once text is in one form, equality, unique indexes, hashing and deduplication work on bytes. The standard promises stability: "once normalized, a string is normalized according to all future versions of Unicode," so a stored NFC value never needs rewriting when the library updates. Postgres can normalize and check in SQL: `normalize(text, NFC)` and `IS NFC NORMALIZED` ([PostgreSQL: String Functions](https://www.postgresql.org/docs/current/functions-string.html)), which makes a `CHECK (name IS NFC NORMALIZED)` constraint possible on columns that matter.

Two cautions from the standard itself:

- **Concatenation un-normalizes.** "None of the Normalization Forms are closed under string concatenation." A string that ends in a base letter, joined to one that starts with a combining mark, needs normalizing again. Normalize the result, not just the parts.
- **NFKC is not for free text.** Compatibility equivalence is "a weaker type of equivalence": it turns the "fi" ligature into "f" and "i", ① into 1, a superscript ⁵ into 5, a fullwidth Ｓ into S. The standard warns that NFKC and NFKD "must not be blindly applied to arbitrary text." Store what people wrote in NFC, and derive NFKC keys from it where you need matching (identifiers, below; search, in [Search](/docs/building-blocks/search)).

## Case-Insensitive Matching

Lowercasing both sides is the usual way to compare case-insensitively, and it's wrong in ways that matter once text isn't English. Unicode distinguishes **case conversion** (producing a cased form for display) from **case folding** (producing a form for comparison), and its data shows why: German "ß" has a full case folding to "ss," and "ẞ" (capital sharp s) folds to "ss" as well ([Unicode: CaseFolding.txt](https://www.unicode.org/Public/UCD/latest/ucd/CaseFolding.txt)). Lowercasing "STRASSE" and "Straße" gives two different strings; folding gives one.

The Turkish dotted and dotless i are the classic trap. Turkish has four letters where English has two: i/İ and ı/I. `CaseFolding.txt` folds "I" to "i" by default, and carries a separate status `T`, "special case for uppercase I and dotted uppercase I," which "For Turkic languages (tr, az) … can be used instead of the normal mapping." In Go, `cases.Lower(language.Turkish)` turns "I" into "ı"; a default `strings.ToLower` turns it into "i". A sign-in that lowercases with the server's locale will fail to match a Turkish user's own username whenever the locale changes.

My defaults:

- **Fold, don't lowercase, for matching:** Unicode default case folding, locale-independent, on both sides. Go has `cases.Fold()` in `golang.org/x/text/cases`; Rust has the [caseless](https://docs.rs/caseless) crate.
- **Never use a locale-sensitive case function for keys.** The Turkic special case belongs in display and in search for a Turkish locale, not in a unique index shared by every user.
- **Normalize after folding.** Postgres's docs note folding "does not always preserve the normalized form of the input string," so a key is normalize, fold, normalize.
- **In Postgres 18 and later, use `casefold()`** in an expression index instead of `lower()`: it "can be used for Unicode Default Caseless Matching," while the `libc` provider "doesn't support case folding, so `casefold` is identical to `lower`" ([PostgreSQL: String Functions](https://www.postgresql.org/docs/current/functions-string.html)). That makes the database's collation provider part of the answer (see [Database Columns](#database-columns)).

The alternative to a folded key column is a case-insensitive **nondeterministic collation**, which Postgres supports through ICU: `CREATE COLLATION case_insensitive (provider = icu, locale = 'und-u-ks-level2', deterministic = false)` ([PostgreSQL: Collation Support](https://www.postgresql.org/docs/current/collation.html)). It compares "Ana" and "ana" as equal without a second column. It also costs: "their use leads to a performance penalty," B-tree indexes on them "cannot use deduplication," and "certain operations are not possible," including some pattern matching (Postgres 18 added `LIKE` support, per its [release notes](https://www.postgresql.org/docs/18/release-18.html)). I reach for it only when a column truly needs to behave case-insensitively everywhere, and otherwise keep a stored key that I compute, can see, and can recompute.

## Identifiers and Usernames

Machine identifiers are opaque and ASCII by design ([Identifier Conventions](/docs/fundamentals/identifier-conventions)). Human identifiers (usernames, handles, workspace slugs, display names someone else will trust) are text people choose, and they need rules free text doesn't:

1. **Use a published profile, not your own.** [RFC 8265](https://datatracker.ietf.org/doc/html/rfc8265) (PRECIS) defines `UsernameCaseMapped`: map fullwidth and halfwidth forms, map to lowercase, apply NFC, and apply the bidi rule to right-to-left strings. Its `OpaqueString` profile for passwords applies NFC and maps non-ASCII spaces to U+0020, and nothing else. Go implements both in [golang.org/x/text/secure/precis](https://pkg.go.dev/golang.org/x/text/secure/precis).
2. **Store what they chose, match on a key.** Display the handle as entered (in NFC), and enforce uniqueness on a key built by NFKC, case folding and NFKC again, so `Ｓtraße`, `STRASSE` and `strasse` collide:

```go tab="Go"
import (
	"golang.org/x/text/cases"
	"golang.org/x/text/unicode/norm"
)

var fold = cases.Fold()

// UsernameKey: compatibility-normalize, fold case, normalize again,
// because folding can leave a string that is no longer normalized.
func UsernameKey(s string) string {
	return norm.NFKC.String(fold.String(norm.NFKC.String(s)))
}
```

```rust tab="Rust"
use caseless::default_case_fold_str;
use unicode_normalization::UnicodeNormalization;

/// Compatibility-normalize, fold case, normalize again,
/// because folding can leave a string that is no longer normalized.
pub fn username_key(s: &str) -> String {
    let folded = default_case_fold_str(&s.nfkc().collect::<String>());
    folded.nfkc().collect()
}
```

3. **Restrict the repertoire** to letters, marks, digits and a few separators, and reject the code points RFC 9839 excludes plus the invisible and bidi controls below. An identifier has no use for a zero-width space.

### Confusables and Identifier Security

NFKC and folding catch characters that are *defined* as equivalent. They don't catch ones that merely look alike: Latin "a" and Cyrillic "а" (U+0430) are different letters that render nearly identically. [UTS #39](https://www.unicode.org/reports/tr39/) is the standard for this, and its example is "paypal" spelled with a Cyrillic "а." It provides two tools:

- **Confusable skeletons.** A mapping table (`confusables.txt`) reduces each string to a skeleton; two strings are confusable when their skeletons match. Skeletons are for testing only, never for display or as a normalized form.
- **Restriction levels**, from ASCII-Only through Single Script, Highly Restrictive (one script, or approved combinations such as Latin with Han, Hiragana and Katakana) and Moderately Restrictive (Latin plus one other recommended script, excluding Cyrillic and Greek) to Unrestricted.

My default for usernames and other trusted names is Highly Restrictive plus a skeleton check against existing names at creation. The catch is storage: ICU's spoof checker warns that "confusable skeletons are not guaranteed to be the same between ICU releases" and advises against "creating a permanent, or difficult to update, database of skeletons" ([ICU: uspoof.h](https://unicode-org.github.io/icu-docs/apidoc/released/icu4c/uspoof_8h.html)). For a lookup across millions of usernames you need an indexed column anyway, so I treat it the way Postgres treats a collation: a derived column stamped with the data version that built it, recomputed for every row when the library upgrades, with new collisions sent to review rather than failing anyone's sign-in. The same check protects other places a look-alike can deceive: workspace names in invitations, payee names, sender names in [Trust & Safety](/docs/building-blocks/trust-and-safety) reports, and the local parts of email addresses ([Phone Numbers & Email Addresses](/docs/fundamentals/phones-and-emails#internationalized-email)).

## Collation and Sorting

Sorting by code point is never right for people. UTS #10, the Unicode Collation Algorithm, puts it directly: "The position of characters in the Unicode code charts does not specify their sort order," and the right order depends on language: Swedish puts ä after z, German sorts it with a ([UTS #10](https://www.unicode.org/reports/tr10/)). `Intl.Collator` shows it in two lines: `["Z", "a", "z", "ä"]` sorts to `a, ä, z, Z` in German and `a, z, Z, ä` in Swedish ([MDN: Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator)). UCA's default table is tailored per language by CLDR, and ICU implements both.

Defaults that follow:

- **Collation is a read-time choice, per viewer.** Store text once; sort it in the reader's locale. Postgres ships ICU collations named as BCP 47 tags plus `-x-icu` (`de-x-icu`, `sv-x-icu`, and `und-x-icu` for "a reasonable language-agnostic sort order"), and any query can pick one: `ORDER BY name COLLATE "sv-x-icu"` ([PostgreSQL: Collation Support](https://www.postgresql.org/docs/current/collation.html)). An index with the same collation serves the sort.
- **Keys and joins use deterministic, code point comparison.** Postgres 18 requires primary and foreign keys to use deterministic collations or the same nondeterministic one ([release notes](https://www.postgresql.org/docs/18/release-18.html)); I keep keys deterministic everywhere so equality means equal bytes.
- **Collations change, and indexes depend on them.** UTS #10 says weights change with new versions and "collations must be carefully versioned." Postgres records each collation's version and warns on mismatch, because "A change in collation definitions can lead to corrupt indexes," for example after an operating system upgrade or a `pg_upgrade` to binaries with a newer ICU; the fix is to `REINDEX` everything that depends on it and then `ALTER COLLATION … REFRESH VERSION` ([PostgreSQL: ALTER COLLATION](https://www.postgresql.org/docs/current/sql-altercollation.html)). Put that check in the upgrade runbook ([Zero-Downtime Migrations](/docs/database/zero-downtime-migrations)).
- **Pagination needs a total order.** A cursor over a collated column ties on strings that compare equal, so add the ID as a tiebreaker ([Pagination](/docs/requests/pagination)).

## Bidi and Invisible Characters

Right-to-left scripts are displayed by the Unicode bidirectional algorithm, which reorders runs of text for display. Explicit control characters steer it, and they're invisible. The Trojan Source research (CVE-2021-42574) showed what that means for anything a person reviews: bidi controls inside comments and strings "reorder tokens in source code at the encoding level," so code displays differently from how it compiles ([Trojan Source](https://trojansource.codes/)). The same trick works on a filename (an extension that reads backwards), a username or a payee name.

- **For identifiers and structured fields, reject bidi controls** (U+202A to U+202E, U+2066 to U+2069) and other invisible format characters, along with zero-width spaces. RFC 8265's bidi rule covers legitimate right-to-left usernames.
- **For free text, keep them and isolate on display.** People writing in Arabic or Hebrew use them correctly. When showing user text of unknown direction inside your UI, isolate it with `dir="auto"` or `<bdi>` so it can't reorder what's around it; in plain-text contexts the isolate controls (U+2066 LRI, U+2067 RLI, U+2068 FIRST STRONG ISOLATE, closed by U+2069 PDI) do the same ([W3C: Inline markup and bidirectional text](https://www.w3.org/International/articles/inline-bidi-markup/)).
- **Don't strip the zero width joiner from free text.** U+200D is how emoji sequences are built (below), and it matters in several scripts. Strip it from identifiers, keep it in content.
- **Scan source code for bidi controls in CI.** It's one grep, and it closes the Trojan Source class of review bypass ([CI Pipelines](/docs/delivery/ci-pipelines)).

## Emoji

Emoji are where length, truncation and storage bugs surface first, because most of them are outside the Basic Multilingual Plane and many are sequences. [UTS #51](https://www.unicode.org/reports/tr51/) defines the kinds:

- **Modifier sequences:** a base emoji followed by one of five skin tone modifiers (U+1F3FB to U+1F3FF). Two code points, four UTF-16 units, one grapheme.
- **Flag sequences:** two regional indicator characters; a single one is not well-formed.
- **ZWJ sequences:** emoji joined by U+200D ZERO WIDTH JOINER. Where a platform has no glyph for the combination, "the ZWJ characters are ignored" and the parts display separately, so the same message shows one family on one phone and four people on another.

The practical rules are the ones above: count graphemes, truncate on grapheme boundaries, store as 4-byte-capable UTF-8, and test with ZWJ sequences, flags and modifiers in every field that takes text ([Test Data](/docs/quality/test-data)). Emoji versions are synchronized with Unicode versions, so a new emoji is a new Unicode version in every library that segments text: keep those libraries current with your other dependencies.

## Database Columns

**Postgres:** create databases with `UTF8` encoding; `normalize`, `casefold` and the Unicode collations all require it. For the database default collation, Postgres's `builtin` provider offers `C.UTF-8` ("The collation uses the code point values only," with "simple" case mapping) and `PG_UNICODE_FAST` (code point order with "full" case mapping) ([PostgreSQL: Locale Support](https://www.postgresql.org/docs/current/locale.html)). Code point order as the default has a property I want: it doesn't change when the operating system's C library does. The docs warn that `LC_COLLATE` and `LC_CTYPE` "affect the sort order of indexes, so they must be kept fixed, or indexes on text columns would become corrupt," and that libc locales may behave differently across platforms. My default is `PG_UNICODE_FAST` (Postgres 18 and later) as the database default, with ICU collations applied per query or per index where people see the order. Use `text`, with `CHECK` constraints for limits.

**MySQL:** use `utf8mb4`, which "Supports BMP and supplementary characters" with up to four bytes per character ([MySQL: utf8mb4](https://dev.mysql.com/doc/refman/8.4/en/charset-unicode-utf8mb4.html)). The older `utf8mb3` stores at most three bytes and so can't hold an emoji; it is deprecated, and "All new applications should use `utf8mb4`" ([MySQL: utf8mb3](https://dev.mysql.com/doc/refman/8.4/en/charset-unicode-utf8mb3.html)). Mind the collation, too: in `utf8mb4_0900_ai_ci`, `0900` means UCA 9.0.0 and `ai_ci` means accent- and case-insensitive ([MySQL: Collation naming](https://dev.mysql.com/doc/refman/8.4/en/charset-collation-names.html)), so a unique index on a column with that collation treats "resume" and "résumé" as duplicates. That's sometimes what you want and often a surprise; choose `utf8mb4_bin` or an `_as_cs` collation for keys.

**Everywhere:** the connection encoding must match. A UTF-8 column reached through a connection set to Latin-1 stores mojibake that looks fine to the application that wrote it and wrong to everything else. Set the client encoding explicitly in the driver configuration and test a round trip with a 4-byte character.

## Checklist

- **UTF-8 at every boundary,** decoded strictly; reject invalid input, surrogates, NUL and noncharacters in structured fields; no BOM.
- **Know which length you're counting:** bytes for storage, graphemes for people; never UTF-16 units for a limit.
- **Truncate on grapheme cluster boundaries,** within a byte budget.
- **Normalize to NFC before storage,** and again after concatenation; keep NFKC for derived keys.
- **Fold case for matching,** locale-independently, normalize after folding, and use `casefold()` on Postgres 18 and later.
- **Hold usernames to RFC 8265** and UTS #39 Highly Restrictive, with a versioned confusable-skeleton column.
- **Sort with ICU collations per viewer;** keep keys deterministic; `REINDEX` and refresh the version when collations change.
- **Reject bidi and invisible controls in identifiers;** isolate user text on display; scan source code in CI.
- **Postgres in `UTF8` with a code-point default collation; MySQL in `utf8mb4`,** with a collation chosen for each key.

## References

**Specifications**

- [RFC 3629: UTF-8](https://datatracker.ietf.org/doc/html/rfc3629), the encoding, its range and the rule against decoding invalid sequences
- [WHATWG: Encoding Standard](https://encoding.spec.whatwg.org/), UTF-8 for all new formats, error modes and BOM handling
- [RFC 9839: Unicode Character Repertoire Subsets](https://www.rfc-editor.org/rfc/rfc9839.html), problematic code points and the subsets that exclude them
- [UAX #29: Unicode Text Segmentation](https://www.unicode.org/reports/tr29/), grapheme clusters as user-perceived characters
- [UAX #15: Unicode Normalization Forms](https://www.unicode.org/reports/tr15/), NFC, NFD, NFKC and NFKD, stability and concatenation
- [Unicode: CaseFolding.txt](https://www.unicode.org/Public/UCD/latest/ucd/CaseFolding.txt), full, simple and Turkic case folding
- [UTS #10: Unicode Collation Algorithm](https://www.unicode.org/reports/tr10/), language-dependent order and collation versioning
- [UTS #39: Unicode Security Mechanisms](https://www.unicode.org/reports/tr39/), confusables, skeletons and restriction levels
- [UTS #51: Unicode Emoji](https://www.unicode.org/reports/tr51/), modifier, flag and ZWJ sequences
- [RFC 8265: PRECIS Usernames and Passwords](https://datatracker.ietf.org/doc/html/rfc8265), the `UsernameCaseMapped` and `OpaqueString` profiles

**Reference**

- [PostgreSQL: Character Types](https://www.postgresql.org/docs/current/datatype-character.html), `varchar(n)` in characters, `text`, and NUL
- [PostgreSQL: String Functions](https://www.postgresql.org/docs/current/functions-string.html), `normalize`, `casefold` and `unicode_assigned`
- [PostgreSQL: Collation Support](https://www.postgresql.org/docs/current/collation.html), ICU collations and nondeterministic collations
- [PostgreSQL: Locale Support](https://www.postgresql.org/docs/current/locale.html), the builtin provider and fixed index collations
- [PostgreSQL: ALTER COLLATION](https://www.postgresql.org/docs/current/sql-altercollation.html), version mismatch warnings, `REINDEX` and `REFRESH VERSION`
- [PostgreSQL 18 release notes](https://www.postgresql.org/docs/18/release-18.html), `casefold()`, `PG_UNICODE_FAST` and `LIKE` with nondeterministic collations
- [MySQL: utf8mb4](https://dev.mysql.com/doc/refman/8.4/en/charset-unicode-utf8mb4.html) and [utf8mb3](https://dev.mysql.com/doc/refman/8.4/en/charset-unicode-utf8mb3.html), four-byte support and the deprecated three-byte set
- [MySQL: Collation naming conventions](https://dev.mysql.com/doc/refman/8.4/en/charset-collation-names.html), `_ai`, `_ci`, `_bin` and UCA versions
- [MDN: String length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length), UTF-16 code units in JavaScript
- [MDN: Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator), locale-sensitive comparison in the browser
- [ICU: uspoof.h](https://unicode-org.github.io/icu-docs/apidoc/released/icu4c/uspoof_8h.html), the spoof checker and the instability of skeletons
- [W3C: Inline markup and bidirectional text in HTML](https://www.w3.org/International/articles/inline-bidi-markup/), `dir="auto"`, `<bdi>` and isolate controls
- [Go blog: Strings, bytes, runes and characters](https://go.dev/blog/strings), what a Go string holds
- [Rust: str](https://doc.rust-lang.org/std/primitive.str.html), byte lengths and char boundaries
- [golang.org/x/text/unicode/norm](https://pkg.go.dev/golang.org/x/text/unicode/norm) and [golang.org/x/text/secure/precis](https://pkg.go.dev/golang.org/x/text/secure/precis), normalization and PRECIS profiles in Go
- [rivo/uniseg](https://pkg.go.dev/github.com/rivo/uniseg), grapheme clusters in Go
- [unicode-segmentation](https://docs.rs/unicode-segmentation), [unicode-normalization](https://docs.rs/unicode-normalization) and [caseless](https://docs.rs/caseless), the Rust equivalents

**In practice**

- [Trojan Source](https://trojansource.codes/), bidi controls and homoglyphs used to hide code from reviewers
