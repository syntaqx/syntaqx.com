+++
title = "SEO"
description = "Search engine optimization for engineers: crawling, indexing controls, canonicals, sitemaps, structured data, rendering, redirects, migrations and AI search."
category = "Frontend"
order = 607
tags = ["seo", "search", "crawling", "structured-data", "frontend"]
+++

Search engine optimization, for an engineer, is mostly not about keywords. It's about making sure a crawler can fetch every page you want found, understand which URL is the real one, render what a person would see, and get an honest answer from the server about what exists. The expensive failures are mechanical: a `Disallow` that shipped from staging, a canonical pointing at the wrong host, a client-rendered page that's empty until JavaScript runs, a migration without redirects. Those are bugs, and they're preventable with the same discipline as any other correctness problem.

This page is the industry-independent part. Industry volumes cover their own twists (product pages, faceted URLs and structured data for stores, for example, in [Commerce SEO](/books/commerce/storefronts#commerce-seo)) and link back here for the rules.

## How Search Works

Google describes three stages, and not every page makes it through all of them ([How Search works](https://developers.google.com/search/docs/fundamentals/how-search-works)):

1. **Crawling.** A crawler discovers URLs (from links, sitemaps and earlier crawls) and downloads them. Googlebot fetches the first 2 MB of a supported file type and the first 64 MB of a PDF, as of October 2026; anything past the cutoff isn't seen ([Googlebot](https://developers.google.com/search/docs/crawling-indexing/googlebot)). Most of its requests use the smartphone crawler, so the mobile page is the one that counts.
2. **Rendering.** Pages that return `200` go into a render queue, where a headless, evergreen Chromium runs the JavaScript ([JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)). Other crawlers may not run JavaScript at all.
3. **Indexing.** The content is analyzed and stored. Pages with similar content are grouped and one is chosen as the canonical, "the page that may be shown in search results."
4. **Serving.** For each query, ranking systems pick from the index. Google states it "doesn't accept payment to crawl a site more frequently, or rank it higher," and that following its guidelines doesn't guarantee a page is crawled, indexed or served.

Each stage has its own failure mode, which is why diagnosis starts by asking which stage a page failed at, not "why don't we rank."

## Crawl Budget

Crawl budget is "the set of URLs that Google can and wants to crawl": a capacity limit set by how healthy your server stays, and a demand set by how many URLs Google thinks you have and how often they change ([Large site crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)). Google aims that guide at sites with over a million unique pages changing weekly, over 10,000 changing daily, or many URLs stuck at "Discovered, currently not indexed". Below that, budget is rarely the problem, and I wouldn't spend time on it.

Where it does matter, the work is reducing the inventory of URLs that shouldn't exist:

- **Consolidate duplicates,** so crawling goes to unique content rather than unique URLs.
- **Block infinite spaces in robots.txt** (internal search results, sort orders, calendars). A `noindex` page still has to be fetched before it's dropped, so it saves no crawl time.
- **Return 404 or 410** for removed pages, and fix soft 404s, which keep being recrawled.
- **Avoid redirect chains,** keep sitemaps current, and answer conditional requests with `304 Not Modified` ([Caching & Conditional Requests](/docs/requests/caching#revalidation-304-not-modified)).

## robots.txt, Meta Robots and noindex

Three different controls, often confused:

| Control | Where | Controls | Doesn't do |
| --- | --- | --- | --- |
| `robots.txt` | `/robots.txt` at the host root | Whether a URL may be **crawled** | Keep a URL out of the index |
| `<meta name="robots">` | Page `<head>` | Whether the page may be **indexed**, snippeted, followed | Anything if the page is blocked from crawling |
| `X-Robots-Tag` | HTTP response header | Same rules as the meta tag, for any file type (PDFs, images) | Anything if the URL is blocked from crawling |

**robots.txt** is standardized as [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html) (September 2022). It lives at the top-level path of each host, protocol and port, so every subdomain needs its own. Crawlers must parse at least 500 KiB of it, shouldn't cache it longer than 24 hours, follow at least five redirects to it, and use the most specific (longest) matching rule, with `Allow` winning a tie. A 4xx for the file means the crawler may access anything; a 5xx or network failure means "complete disallow." Google implements this with its own details: it treats 4xx other than 429 as no restrictions, and on 5xx stops crawling for 12 hours, then uses the last good copy for up to 30 days ([Google's robots.txt spec](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)). Field names are case-insensitive, paths are case-sensitive, and Google ignores `crawl-delay`.

```text
User-agent: *
Disallow: /search
Disallow: /*?sort=
Allow: /

Sitemap: https://example.com/sitemap.xml
```

**noindex** is the only reliable way to keep a crawlable page out of results: Google drops it "regardless of whether other sites link to it" ([Block indexing](https://developers.google.com/search/docs/crawling-indexing/block-indexing)). Google doesn't support `noindex` inside robots.txt.

```html
<meta name="robots" content="noindex">
```

```http
X-Robots-Tag: noindex
```

The classic mistakes, all of which I treat as release blockers:

- **Disallow plus noindex.** A page blocked in robots.txt is never fetched, so its `noindex` is never read, and the URL can still appear in results, without content, when other pages link to it. To remove a page, allow crawling and serve `noindex`.
- **Staging rules shipping to production.** A `Disallow: /` or a site-wide `noindex` from a preview environment, deployed by accident. My rule: production's robots.txt and robots headers are asserted by a test against the built output, and preview environments are kept out of the index by authentication or `X-Robots-Tag: noindex` set by the environment, never by a file someone has to remember to change.
- **robots.txt as security.** RFC 9309 says the rules "are not a form of access authorization," and the file publicly lists what you'd rather hide. Private content needs authentication.
- **noindex added in HTML and removed by JavaScript.** If the initial HTML says `noindex`, Google may skip rendering entirely ([JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)).
- **401 or 403 to slow a crawler down.** Google warns against it; a temporary `503` or `429` is the signal for overload ([HTTP status codes](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)).

The meta tag and header take more than `noindex`. Google supports `nofollow`, `none`, `nosnippet`, `max-snippet:[n]`, `max-image-preview:[none|standard|large]`, `max-video-preview:[n]`, `notranslate`, `noimageindex`, `indexifembedded` and `unavailable_after:[date]`, and ignores `noarchive` and `nocache` as of October 2026 ([Robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)). When rules conflict, the more restrictive one wins. Rules can target one crawler (`<meta name="googlebot">`, `X-Robots-Tag: googlebot: nofollow`).

## Canonical URLs and Duplicates

The same content at several URLs splits signals and wastes crawls. Google picks a canonical either way; your job is to make your preference unambiguous. Its methods, strongest first ([Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)):

1. **Redirects,** a strong signal that the target should be canonical.
2. **`rel="canonical"`,** also a strong signal, in the HTML or as an HTTP `Link` header for non-HTML files like PDFs.
3. **Sitemap inclusion,** a weak signal.

```html
<link rel="canonical" href="https://example.com/guides/seo">
```

My defaults:

- **Every indexable page has a self-referencing canonical,** as an absolute URL, in the server-rendered HTML. JavaScript may not change it.
- **One method per page,** not the HTML element and the header, and never conflicting canonicals through different methods.
- **Internal links, sitemaps and canonicals all agree.** Linking to a duplicate while canonicalizing to the original sends mixed signals.
- **Never canonicalize with robots.txt or noindex.** A disallowed URL can still be indexed without content; `noindex` removes the page from Search rather than consolidating it.
- **HTTPS wins.** Google prefers HTTPS as canonical; redirect HTTP to HTTPS and send HSTS ([HSTS and Preload](/docs/security/security-headers#hsts-and-preload)).

The usual sources of duplicates are mechanical, so the fixes belong in routing, not content:

- **Trailing slashes.** `/fish` and `/fish/` are different URLs to Google; the bare host is the one exception ([To slash or not to slash](https://developers.google.com/search/blog/2010/04/to-slash-or-not-to-slash)). Pick one form, link to it everywhere, and `301` the other.
- **Case.** Google treats URLs as case-sensitive, so `/APPLE` and `/apple` are separate pages ([URL structure](https://developers.google.com/search/docs/crawling-indexing/url-structure)). Lowercase paths, and redirect anything else.
- **Parameters.** Tracking, session, sort and referral parameters multiply one page into thousands. Keep parameters that don't change content out of internal links, canonicalize to the clean URL, and block the infinite combinations in robots.txt. Google recommends `=` and `&` for parameters, hyphens rather than underscores between words, and percent-encoding non-ASCII characters.
- **Fragments.** Google ignores `#` fragments, so content that only exists behind one isn't a separate page. Use the History API for client-side routes.
- **Host variants.** `www` and bare, HTTP and HTTPS, old domains: one wins, the rest redirect.

## Sitemaps

A sitemap lists the canonical URLs you want indexed; it doesn't guarantee they're crawled ([Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)). The [sitemaps.org protocol](https://www.sitemaps.org/protocol.html) sets the limits: 50,000 URLs and 50 MB uncompressed per file, gzip allowed (the uncompressed size still counts), `<loc>` under 2,048 characters with the protocol, every value entity-escaped, and UTF-8. Past those limits, split the sitemap and list the parts in a sitemap index, which takes up to 50,000 sitemaps. A sitemap only covers URLs at or below its own directory unless submitted through Search Console.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/guides/seo</loc>
    <lastmod>2026-10-28T09:00:00+00:00</lastmod>
  </url>
</urlset>
```

**lastmod must be honest.** Google uses it only when it's "consistently and verifiably" accurate, as a signal for scheduling recrawls, and says to update it for significant changes, not a footer edit ([Sitemaps ping endpoint is going away](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)). Bing says the same: the content's real last change, never the time the sitemap was generated ([Bing: Sitemaps in AI-powered search](https://blogs.bing.com/webmaster/2025/7/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search/)). A generator that stamps every URL with "now" teaches crawlers to ignore the field. I take `lastmod` from the content's own modification date, and omit it where I can't date a page reliably.

Both Google and Bing ignore `<changefreq>` and `<priority>`, so I don't emit them. Google's sitemap ping endpoint was retired in 2023 and now returns 404; submit through the `Sitemap:` line in robots.txt and Search Console. For Bing and other participating engines, [IndexNow](https://www.indexnow.org/documentation) announces changed URLs as they happen (up to 10,000 per request, shared among participating engines), as a complement to sitemaps rather than a replacement.

## Titles, Descriptions and Headings

Search engines write the result, not you. Google builds title links from the `<title>`, the main visible title and `<h1>`, `og:title`, prominent text, anchor text of links to the page, and `WebSite` structured data, and rewrites titles that are half-empty, obsolete, inaccurate, boilerplate, or don't match the page's language ([Title links](https://developers.google.com/search/docs/appearance/title-link)). Snippets come "primarily" from page content, with the meta description used when it describes the page better ([Snippets](https://developers.google.com/search/docs/appearance/snippet)). Neither has a length limit; results are truncated to fit the device.

So the rules are about accuracy, not character counts:

- **A unique, descriptive `<title>` on every page,** with the brand once, at the start or end after a delimiter. No keyword lists, no identical boilerplate across a template.
- **One clear main heading** that matches the title's subject, with `<h2>` to `<h4>` as a real outline. That's also what [screen readers navigate by](/docs/frontend/accessibility).
- **A meta description per page** that says what's on it, with concrete details (author, date, price). Generating them from data on large sites is fine as long as they read like sentences.
- **A site name** set with `WebSite` structured data on the home page (`name`, optional `alternateName`, `url`). Google supports site names per domain or subdomain, not per subdirectory ([Site names](https://developers.google.com/search/docs/appearance/site-names)).

Open Graph and X card tags don't affect ranking, though Google does read `og:title` and `og:image` as hints. How a page looks when shared in chat and social apps is its own subject: [Link Previews & Social Cards](/docs/frontend/link-previews).

## Structured Data

Structured data describes a page's entities in the [schema.org](https://schema.org/) vocabulary so search engines can show rich results. Google supports JSON-LD, Microdata and RDFa, says all three are "equally fine," and recommends JSON-LD ([Intro to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)). I use JSON-LD: it sits in one `<script>` block, separate from markup, and can be generated from the same data that renders the page.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "SEO",
  "datePublished": "2026-10-28",
  "author": { "@type": "Person", "name": "A. Writer" }
}
</script>
```

Markup makes a page eligible, never guaranteed. Every required property for a feature must be present; Google prefers fewer, complete and accurate recommended properties over many partial ones; and markup must describe content visible on the page. Google can read JSON-LD injected by JavaScript, but server-rendered is safer for every other consumer.

As of October 2026, Google's [search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) lists 25 features: Article, Breadcrumb, Carousel, Course list, Dataset, Discussion forum, Education Q&A, Employer aggregate rating, Event, Image metadata, Job posting, Local business, Math solver, Movie carousel, Organization, Product, Profile page, Q&A, Recipe, Review snippet, Software app, Speakable, Subscription and paywalled content, Vacation rental and Video. The list shrinks over time, so I check it before building markup for a feature:

- **HowTo** rich results were removed in September 2023, and **FAQ** results limited to well-known government and health sites ([HowTo and FAQ changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes)); FAQ results stopped appearing entirely on May 7, 2026 ([Search documentation updates](https://developers.google.com/search/updates)).
- **Book Actions, Course Info, ClaimReview, Estimated Salary, Learning Video, Special Announcement and Vehicle Listing** were phased out from June 2025, with Google stating "This update won't affect how pages are ranked" ([Simplifying the search results page](https://developers.google.com/search/blog/2025/06/simplifying-search-results)).
- **Practice problem** was removed in January 2026, and **Dataset** markup now serves only Dataset Search, not Google Search ([Search documentation updates](https://developers.google.com/search/updates)).

Leftover markup for a retired feature does no harm, and schema.org data is still read by other consumers, so I don't rush to delete it; I just stop building new markup for it.

Validate in two places: the [Rich Results Test](https://search.google.com/test/rich-results) while developing, and Search Console's rich result reports after deploy, which catch templating regressions across thousands of pages. The [Schema Markup Validator](https://validator.schema.org/) checks generic schema.org validity, including types Google doesn't show as rich results, like site names.

## JavaScript Rendering

Google renders JavaScript, but it does so later, in a queue, and other crawlers and link unfurlers often don't run it at all. Google itself still recommends server-side or pre-rendering because "not all bots can run JavaScript" ([JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)).

My default is the same as for [performance](/docs/frontend/web-performance#ship-less-javascript): static generation for content that changes on publish, server rendering for content that changes per request, and client rendering only for what's behind a login or purely interactive. The test is simple: fetch the page with JavaScript off, and the title, main content, canonical, robots rules, structured data and links should all be in the HTML.

- **Dynamic rendering is retired.** Serving pre-rendered HTML to bots and a client app to people "was a workaround and not a long-term solution"; Google recommends server-side rendering, static rendering or hydration instead ([Dynamic rendering](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering)).
- **Links are `<a href>`.** Google reliably follows only `<a>` elements with an `href`; `routerLink` without `href`, `onclick` navigation and `javascript:` URLs are unreliable or ignored ([Crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)). Router link components must render a real `href`. Anchor text should describe the target; Google uses an image link's `alt` as its anchor text.
- **Routes use the History API,** not `#/path` fragments.
- **Errors still need status codes.** A single-page app that renders "Not found" with a `200` is a soft 404. Redirect to a URL that returns a real `404`, or inject `noindex` on error views.
- **Lazy content needs a crawlable path.** Crawlers don't click, scroll or type; content behind interactions is invisible unless it's also reachable by a link.

## Status Codes and Redirects

The status code is the server's answer to "does this exist?", and search engines take it literally ([HTTP status codes](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)):

| Status | What Google does |
| --- | --- |
| `200` | Passes the content on; doesn't guarantee indexing. An empty or error page served as `200` is a soft 404 |
| `301`, `308` | Strong signal that the target is canonical; 308 is treated like 301 |
| `302`, `307` | Weak signal; the source usually stays indexed |
| `304` | Content unchanged since the last crawl |
| `404`, `410` | Indexed URL is removed and crawled less often |
| `429`, `5xx` | Treated as overload: crawling slows; URLs are dropped if errors persist |

Googlebot follows up to 10 redirect hops in general crawling. Server-side redirects are preferred; an instant `meta refresh` is read as permanent, and JavaScript redirects are a last resort, since rendering may never happen ([Redirects and Google Search](https://developers.google.com/search/docs/crawling-indexing/301-redirects)).

My rules:

- **Permanent moves are 301 or 308,** and I use 308 when the method must be preserved (forms, APIs); temporary states (a maintenance page, a geolocated choice) are 302 or 307. The codes mean different things to other clients even where Google treats them alike, so use the one that's true ([Resources, Methods, Status Codes](/docs/api-design/principles#resources-methods-status-codes)).
- **Missing is 404, gone for good is 410.** Never a `200` "not found" page, and never a redirect of every missing URL to the home page.
- **One hop.** Every redirect points at the final destination; chains are flattened whenever a new rule is added.
- **Planned downtime is `503`,** so crawlers slow down and keep the indexed page instead of indexing an error page.

## Site Migrations

A migration (new domain, new URL scheme, new platform) is where most search traffic is lost, and the loss is almost always missing redirects. Google's checklist ([Site moves with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)) comes down to a redirect map treated as a deliverable:

1. **Inventory every old URL** from sitemaps, server logs, analytics and the CMS, including images, PDFs and other files.
2. **Map each one to its equivalent,** as a file in the repository (old URL, new URL, status). Not to the home page: Google advises against sending many old URLs to one unrelated page. Content that was merged redirects to the page it was merged into; content that was removed returns 410.
3. **Serve permanent server-side redirects** straight to the final URL, and test the map in CI: every old URL returns one `301` or `308` to a URL that returns `200`.
4. **Update everything on the new site** to new URLs: canonicals, hreflang, internal links and sitemaps. Lift any migration-only `noindex` or robots.txt blocks.
5. **Use Change of Address** in Search Console for a domain or subdomain change (not for HTTP to HTTPS or path-only changes).
6. **Keep the redirects** "for as long as possible," at least a year by Google's guidance. I keep them indefinitely; they cost almost nothing, and old links keep arriving.

Expect fluctuation: for a medium-sized site, "a few weeks or more" before new URLs replace old ones. Make sure the new servers can take the heavier crawl that follows a move. A store's move, with product, collection and variant URLs, is the Commerce volume's [URLs, Redirects and SEO](/books/commerce/replatforming#urls-redirects-and-seo).

## International Sites

Language versions of a page are tied together with `hreflang`, the search side of [locale in the URL](/docs/frontend/internationalization#choosing-the-locale). Google accepts it as HTML `<link>` elements, HTTP `Link` headers, or sitemap entries, all equivalent ([Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)):

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/pricing">
<link rel="alternate" hreflang="de-DE" href="https://example.com/de/pricing">
<link rel="alternate" hreflang="x-default" href="https://example.com/pricing">
```

- **Every version lists itself and all others.** If two pages don't point at each other, the annotations are ignored.
- **Codes are ISO 639-1 language, optionally with an ISO 3166-1 alpha-2 region:** `en-GB`, never `en-UK` (a reserved code Google ignores), and never a region alone.
- **`x-default`** is the fallback for anyone who matches no listed version, typically a language picker.
- **Absolute URLs,** and a canonical in the same language. Canonicalizing a German page to the English one asks Google to show the English one instead.

Google determines a page's language from its content, not from `hreflang` or the `lang` attribute. I still set `lang` correctly for accessibility and translation tools; `hreflang` only says which URL to show to whom. And I don't redirect by IP or `Accept-Language` on indexable URLs: a crawler arriving from one address with no language preference would only ever see one version.

## Page Experience

Google says "Core Web Vitals are used by our ranking systems," but that relevance comes first, there's no single page experience signal, and good scores don't guarantee top rankings ([Page experience](https://developers.google.com/search/docs/appearance/page-experience)). Its self-assessment also asks about HTTPS, mobile rendering, intrusive interstitials, ad clutter and a clear main content area.

I treat this as a tiebreaker, not a strategy: the reason to meet the [Core Web Vitals targets](/docs/frontend/web-performance#targets-core-web-vitals) is the users, and the ranking benefit is a side effect. The measurement and budgets live in [Web Performance](/docs/frontend/web-performance).

## Images and Video

**Images** ([Google Images best practices](https://developers.google.com/search/docs/appearance/google-images)):

- **Use `<img>` with a `src`.** "Google doesn't index CSS images," so anything meant to be found can't be a CSS background. With `srcset` or `<picture>`, keep a fallback `src`.
- **Write `alt` text** that describes the image in context, the [same `alt` that screen readers announce](/docs/frontend/accessibility#images-and-media), with descriptive filenames and the image near the text it illustrates.
- **Supported formats** are BMP, GIF, JPEG, PNG, WebP, SVG and AVIF, with extensions that match the real type.
- **Image sitemaps** help discovery, and may list images on a CDN domain.
- **Declare a preferred image** with `og:image` or schema.org `primaryImageOfPage`: relevant, high resolution, not a logo or text.

**Video** ([Video best practices](https://developers.google.com/search/docs/appearance/video)):

- **Embed with `<video>`, `<iframe>`, `<embed>` or `<object>`,** present in the rendered HTML without a click to load it.
- **One watch page per video** where the video is the main content, with its own title and description.
- **Stable URLs** for the thumbnail and the video file; thumbnails at least 60 by 30 pixels; files in a supported format such as MP4, WebM or MOV, never a data URL. Don't block either in robots.txt.
- **`VideoObject` structured data** with a unique `name`, `description` and `thumbnailUrl`, `embedUrl` for the player and `contentUrl` for the file. `Clip` or `SeekToAction` markup enables key moments.

## Pagination and Infinite Scroll

Google's crawlers follow `href` links but don't "click" buttons or trigger scroll handlers ([Pagination and incremental loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)). So:

- **Every page of a list has its own URL** (`?page=2`), with its own self-referencing canonical. Canonicalizing page 2 onward to page 1 hides everything that's only linked from those pages.
- **Pages link to the next with `<a href>`,** and may link back to the first.
- **No fragments for page numbers.** Google ignores them.
- **Infinite scroll and "load more" sit on top of paginated URLs:** as the list grows, the URL updates with the History API, and the same pages are reachable by plain links. That's also what makes the back button and shared links work.
- **`rel="next"` and `rel="prev"`** are no longer used by Google; other engines may still read them, and they're harmless.
- **Sorted and filtered variants** of the same list get `noindex` or a robots.txt block, so the index holds one copy of each list.

## AI Search Features

AI answers now sit in and beside search results, and each vendor documents its own controls. There's no single opt-out, so it pays to know which token controls what, as of October 2026. Agents that shop rather than answer, and how a store identifies and admits them, are the Commerce volume's [Agent Identity and Access](/books/commerce/agentic-commerce#agent-identity-and-access).

**Google's AI Overviews and AI Mode** draw from the Search index. There are "no additional requirements to appear": a page that's indexed and eligible for a snippet qualifies, and no special markup or AI-specific text file is needed ([AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)). The controls are the existing snippet rules ([Robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)):

- `nosnippet` applies to AI Overviews and AI Mode and keeps the content from being used as a direct input to them.
- `max-snippet:[n]` limits how much can be used as direct input.
- `data-nosnippet` on a `span`, `div` or `section` excludes part of a page.
- `noindex` removes the page from Search entirely.

**Google-Extended** is a robots.txt token, with no user agent of its own, that controls whether crawled content trains future Gemini models and grounds answers in Gemini Apps and Vertex AI. It "does not impact a site's inclusion in Google Search nor is it used as a ranking signal" ([Google's common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)), and it doesn't control AI Overviews, which follow the Googlebot rules above.

Other vendors separate search crawling, training crawling and user-initiated fetches into different user agents:

| Vendor | Search | Training | User-initiated fetches |
| --- | --- | --- | --- |
| [OpenAI](https://developers.openai.com/api/docs/bots) | `OAI-SearchBot` | `GPTBot` | `ChatGPT-User` ("robots.txt rules may not apply") |
| [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) | `Claude-SearchBot` | `ClaudeBot` | `Claude-User` |
| [Perplexity](https://docs.perplexity.ai/guides/bots) | `PerplexityBot` (not used for training) | none documented | `Perplexity-User` ("generally ignores robots.txt rules") |
| [Apple](https://support.apple.com/en-us/119829) | `Applebot` | `Applebot-Extended` (a control token; it "does not crawl webpages") | none documented |

OpenAI and Perplexity both say robots.txt changes take about 24 hours to apply. **Bing** uses page-level tags rather than a separate crawler: `noarchive` keeps content out of its chat answers and out of training Microsoft's generative models, and `nocache` limits answers to the URL, title and snippet; with both present, Bing applies `nocache` ([Bing: Controlling content in Bing Chat](https://blogs.bing.com/webmaster/september-2023/Announcing-new-options-for-webmasters-to-control-usage-of-their-content-in-Bing-Chat)). Neither removes a page from regular Bing results.

My default for a public site that wants to be found: allow every search crawler, decide about training crawlers deliberately and write the decision into robots.txt with a comment, and use `nosnippet` or `data-nosnippet` only on content that genuinely shouldn't be quoted. Blocking a search bot to stop training usually removes you from that vendor's answers too, which is rarely the trade intended. User-initiated fetchers act on behalf of a person, and several vendors say they may not honor robots.txt; content that truly mustn't be read needs authentication.

## Search Console and Bing Webmaster Tools

Both are free, both need domain verification, and both are the only first-party view of how a search engine sees the site. I verify every production domain in both on day one, using DNS verification so it survives redesigns, and before any migration.

- **Google Search Console:** the Performance report (clicks, impressions, CTR and average position of the site's topmost result, filterable by search type, with AI Overviews and AI Mode included under "Web"), Page Indexing (why URLs aren't indexed), URL Inspection (the rendered HTML and canonical Google chose, plus a recrawl request), Sitemaps, rich result reports, and Change of Address ([Performance report](https://support.google.com/webmasters/answer/7576553), [AI features](https://developers.google.com/search/docs/appearance/ai-features)). Tables show at most 1,000 rows, and some queries are withheld for privacy ([About the data](https://support.google.com/webmasters/answer/96568)), so export through the API for anything serious.
- **Bing Webmaster Tools:** Search Performance with the same four metrics, URL Inspection with live testing, Sitemaps, Site Explorer, backlinks, and IndexNow ([Bing: Webmaster Tools and Search Console compared](https://blogs.bing.com/webmaster/August-2024/Bing-Webmaster-Tools-or-Google-Search-Console-A-Comparison)).

## Measuring SEO

Rankings for a hand-picked list of keywords are a vanity metric; they vary by location, device and personalization. I measure:

- **Coverage:** indexed pages against the pages that should be indexed, by template. A drop in one template is a deploy bug.
- **Clicks and impressions by page template and query group,** from the Search Console API into the warehouse, compared against the same period last year rather than last week.
- **Crawl health from server logs:** crawler requests per day, status code mix, time to first byte for bots, and crawling of URLs that shouldn't exist. Verify that a request claiming to be Googlebot is real with a reverse DNS lookup or Google's published IP ranges ([Googlebot](https://developers.google.com/search/docs/crawling-indexing/googlebot)); the user agent is trivially spoofed.
- **Organic sessions and conversions** in analytics, attributed to landing page, so a traffic change can be traced to the pages that moved.
- **Regression checks in CI:** robots.txt, canonical, `noindex` absence, structured data validity, and status codes asserted for a sample URL per template, the same way [accessibility checks](/docs/quality/cross-platform-testing#automated-accessibility-checks) run. Most SEO incidents are a template change nobody looked at from a crawler's point of view.

Search changes slowly. A fix shows up in days to weeks, after a recrawl, so I annotate deploys on the traffic graphs; otherwise nobody can connect a dip to its cause.

## Checklist

- Every page that should be found returns `200`, server-rendered, with its title, content, canonical and links in the initial HTML.
- robots.txt blocks only infinite or worthless URL spaces, never pages carrying `noindex`, and production's robots rules are tested in CI.
- Preview and staging environments are kept out of the index by authentication or an environment-level `X-Robots-Tag`.
- Each indexable page has one absolute, self-referencing canonical; internal links, sitemaps and canonicals agree.
- One host, one protocol, one trailing-slash form, lowercase paths; everything else is a single `301` hop away.
- Sitemaps list only canonical `200` URLs, stay under 50,000 URLs and 50 MB per file, and carry an honest `lastmod`.
- Titles and descriptions are unique and accurate per page; there's one main heading.
- Structured data is JSON-LD for features Google still shows, describes visible content, and is validated in development and monitored after deploy.
- Navigation is `<a href>`; routes use the History API; pagination has real URLs and links.
- Missing pages return `404` or `410`; moved pages redirect permanently, straight to the final URL.
- Migrations ship with a redirect map in the repository, tested in CI, kept indefinitely.
- Localized pages carry reciprocal `hreflang` with valid codes and `x-default`.
- Images that matter are `<img>` with `alt`; each video has a watch page and `VideoObject` markup.
- AI crawler and snippet controls are written down as a deliberate decision, per vendor.
- Every production domain is verified in Search Console and Bing Webmaster Tools, and search data is tracked per template.

## References

**Specifications**

- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html), robots.txt location, parsing limit, caching, status handling and matching
- [sitemaps.org: Sitemaps XML format](https://www.sitemaps.org/protocol.html), tags, limits, escaping, sitemap indexes and location rules
- [schema.org](https://schema.org/), the structured data vocabulary
- [IndexNow: Documentation](https://www.indexnow.org/documentation), key verification, batch limits and shared submissions

**Google Search Central**

- [How Search works](https://developers.google.com/search/docs/fundamentals/how-search-works), crawling, indexing and serving, and canonical selection
- [Googlebot](https://developers.google.com/search/docs/crawling-indexing/googlebot), fetch size limits, the smartphone crawler, and verifying Googlebot
- [Managing crawl budget for large sites](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget), who needs it and how to reduce crawl waste
- [How Google interprets the robots.txt specification](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt), Google's status code handling, caching and supported fields
- [Block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing), noindex in meta tags and headers, and the robots.txt conflict
- [Robots meta tag, data-nosnippet and X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), supported directives, conflicts and AI feature effects
- [Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), canonicalization methods and their strength
- [URL structure best practices](https://developers.google.com/search/docs/crawling-indexing/url-structure), case sensitivity, parameters, hyphens and encoding
- [To slash or not to slash](https://developers.google.com/search/blog/2010/04/to-slash-or-not-to-slash), trailing slashes as distinct URLs
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), limits, lastmod, ignored tags and submission
- [Sitemaps ping endpoint is going away](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping), the ping retirement and how lastmod is used
- [Influencing title links](https://developers.google.com/search/docs/appearance/title-link), title sources and why Google rewrites them
- [Control your snippets](https://developers.google.com/search/docs/appearance/snippet), how snippets and meta descriptions are used
- [Site names](https://developers.google.com/search/docs/appearance/site-names), WebSite markup and domain-level scope
- [Introduction to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data), formats, required properties and guidelines
- [Structured data search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery), the 25 supported features as of October 2026
- [Changes to HowTo and FAQ rich results](https://developers.google.com/search/blog/2023/08/howto-faq-changes), the 2023 reductions
- [Simplifying the search results page](https://developers.google.com/search/blog/2025/06/simplifying-search-results), the June 2025 phase-outs
- [Latest Search documentation updates](https://developers.google.com/search/updates), FAQ, practice problem and Dataset changes in 2025 and 2026
- [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), the render queue, links, routing and soft 404s in apps
- [Dynamic rendering as a workaround](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering), why it's no longer recommended
- [Make your links crawlable](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), crawlable link markup and anchor text
- [HTTP status codes, network and DNS errors](https://developers.google.com/search/docs/crawling-indexing/http-network-errors), how each status class is handled and redirect hop limits
- [Redirects and Google Search](https://developers.google.com/search/docs/crawling-indexing/301-redirects), permanent and temporary redirect types
- [Site moves with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes), redirect mapping, Change of Address and expected fluctuation
- [Localized versions of your pages](https://developers.google.com/search/docs/specialty/international/localized-versions), hreflang methods, codes and x-default
- [Understanding page experience](https://developers.google.com/search/docs/appearance/page-experience), Core Web Vitals in ranking and the self-assessment
- [Google Images best practices](https://developers.google.com/search/docs/appearance/google-images), image markup, formats and sitemaps
- [Video best practices](https://developers.google.com/search/docs/appearance/video), watch pages, thumbnails, VideoObject and key moments
- [Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), paginated URLs, infinite scroll and rel next/prev
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), AI Overviews and AI Mode eligibility, controls and reporting
- [Google's common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers), Google-Extended and Googlebot tokens
- [Search Console: Performance report](https://support.google.com/webmasters/answer/7576553), metrics and search types
- [Search Console: About the data](https://support.google.com/webmasters/answer/96568), row limits and withheld queries

**Other search engines and AI crawlers**

- [Bing: Keeping content discoverable with sitemaps in AI-powered search](https://blogs.bing.com/webmaster/2025/7/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search/), lastmod accuracy, ignored tags and IndexNow
- [Bing: Controlling usage of content in Bing Chat](https://blogs.bing.com/webmaster/september-2023/Announcing-new-options-for-webmasters-to-control-usage-of-their-content-in-Bing-Chat), noarchive and nocache for AI answers
- [Bing: Webmaster Tools and Search Console compared](https://blogs.bing.com/webmaster/August-2024/Bing-Webmaster-Tools-or-Google-Search-Console-A-Comparison), Bing Webmaster Tools features
- [OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots), OAI-SearchBot, GPTBot and ChatGPT-User
- [Anthropic: Does Anthropic crawl data from the web](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), ClaudeBot, Claude-SearchBot and Claude-User
- [Perplexity: Perplexity crawlers](https://docs.perplexity.ai/guides/bots), PerplexityBot and Perplexity-User
- [Apple: About Applebot](https://support.apple.com/en-us/119829), Applebot and Applebot-Extended

**Tools**

- [Google: Rich Results Test](https://search.google.com/test/rich-results), validating markup for Google's rich results
- [Schema Markup Validator](https://validator.schema.org/), generic schema.org validation
