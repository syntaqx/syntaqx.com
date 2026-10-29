+++
title = "Link Previews & Social Cards"
description = "How a page looks when shared, unfurled or installed: Open Graph, X Cards, each unfurler's rules, oEmbed, generated images, icons, the manifest and theme color."
category = "Frontend"
order = 608
tags = ["open-graph", "social", "unfurling", "icons", "frontend"]
+++

Most people meet a page as a preview before they ever load it: a card in a chat thread, a post on a social feed, an icon on a home screen. That preview is built by someone else's software from a few tags in your `<head>`, fetched once, cached for anywhere from half an hour to indefinitely, and usually without running a line of your JavaScript. When the tags are missing or wrong, the link shows as a bare URL, the wrong image, or last month's title, and there's no error anywhere to tell you.

This is a separate concern from [SEO](/docs/frontend/seo). Search engines rank pages; unfurlers only describe them. The tags overlap, but the consumers, their caches and their failure modes don't.

## How a Preview Is Built

Every unfurler documents roughly the same pipeline: a server-side fetch of the URL, a parse of the HTML `<head>`, a fetch of the image, then a cache. The details that matter, from each vendor's own docs as of October 2026:

- **No JavaScript.** Discord's fetcher runs none ([Discord: Link previews](https://docs.discord.com/developers/link-previews/overview)), and Apple's Messages fetcher doesn't follow meta redirects or run JavaScript ([Apple TN3156](https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages)). Tags injected on the client don't exist for these consumers, so they must be in the server-rendered HTML.
- **Tags early in the document.** Meta reads Open Graph tags within "the first 1 MB" ([Meta: Web crawlers](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers)); WhatsApp wants the `<head>` "within the first 300KB" ([WhatsApp: Link previews](https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/)). Inline scripts and styles ahead of the meta tags can push them out of range.
- **Real status codes and fast responses.** Discord follows at most 5 redirects and gives up after 10 seconds in total, including measuring images; Meta wants content "within a few seconds."
- **Absolute URLs.** Open Graph defines URL values as `http://` or `https://` URLs, and every example is absolute ([ogp.me](https://ogp.me/)); WhatsApp requires `og:image` to be absolute. A relative `og:image` is the most common reason a preview has no picture.

## Open Graph

[The Open Graph protocol](https://ogp.me/) is the format nearly every unfurler reads first. Four properties are required: `og:title`, `og:type`, `og:image` and `og:url`.

```html
<meta property="og:title" content="SEO">
<meta property="og:type" content="article">
<meta property="og:url" content="https://example.com/docs/seo">
<meta property="og:image" content="https://example.com/og/seo.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The words SEO on a dark background">
<meta property="og:description" content="Search engine optimization for engineers.">
<meta property="og:site_name" content="Example">
<meta property="og:locale" content="en_US">
```

- **`og:type`** is `website` by default, or `article`, `book`, `profile`, and the `music.*` and `video.*` families. `article` adds `article:published_time`, `article:author` and friends.
- **`og:image` has structured properties:** `:width`, `:height`, `:type`, `:secure_url` and `:alt`. The spec says a page with `og:image` "should specify `og:image:alt`," describing the image rather than captioning it. Declaring width and height lets Discord skip a measuring fetch and helps Meta render the image the first time it's shared.
- **`og:locale`** uses `language_TERRITORY` (`en_US`, the default), with `og:locale:alternate` for other languages of the same page. Note the underscore, unlike the hyphenated [BCP 47 tags](/docs/frontend/internationalization#choosing-the-locale) everywhere else.
- **Arrays** are repeated tags. When a property conflicts, the first one wins, and a structured property (`og:image:width`) belongs to the most recent `og:image` above it. Discord turns two or more `og:image` tags into a gallery of up to four.
- **`og:site_name`** is where branding goes. Apple's guidance is explicit: "Do not put the site name or other branding in the `og:title`" ([Apple TN3156](https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages)).

## X Cards

X reads its own `twitter:` tags and falls back to Open Graph for anything missing, so the only tag most pages need is the card type:

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@example">
```

As of October 2026, X documents four card types (`summary`, `summary_large_image`, `app` and `player`), one per page. Card images are JPG, PNG, WebP or GIF (first frame only), up to 5 MB, and SVG isn't supported; `summary_large_image` is 2:1, from 300 by 157 up to 4096 by 4096. Its crawler identifies as `Twitterbot`, respects robots.txt (a blocked page shows no card), and caches a card for 7 days after the link is first posted. <!-- source-gap: x-cards-docs | secondary | X Cards card types, image limits, Open Graph fallback, Twitterbot and the 7-day cache are from search-engine summaries of developer.x.com, which returned HTTP 402 when opened | closes with: open developer.x.com/en/docs/x-for-websites/cards (markup and getting-started pages) and confirm each figure | checked: 2026-10-28 --> I couldn't open X's developer pages to confirm these, so treat the figures as a starting point and check the current docs. Other consumers read `twitter:` tags too: Slack, Discord and Apple all document reading X Card metadata alongside Open Graph, and `twitter:card` with `summary_large_image` is what makes Discord show the large image.

## Images

The image is most of the preview, and every consumer sizes it differently. What each one documents, as of October 2026:

| Consumer | Recommended | Minimum | Aspect | Max file |
| --- | --- | --- | --- | --- |
| [Meta (Facebook)](https://developers.facebook.com/docs/sharing/webmasters/images) | at least 1200 x 630 | 600 x 315 for the large layout, 200 x 200 at all | about 1.91:1 | 8 MB |
| [LinkedIn](https://www.linkedin.com/help/linkedin/answer/a521928) | | 1200 x 627; under 401 px wide shows as a thumbnail | 1.91:1 | 5 MB |
| [WhatsApp](https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/) | | 300 px wide | 4:1 or less | under 600 KB |
| [Apple Messages](https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages) | | 900 px wide; under 150 px may show as an icon | | 1 MB main resource, 10 MB total |
| [Discord](https://docs.discord.com/developers/link-previews/overview) | | | | PNG, GIF, JPEG, WebP or AVIF |
| X (`summary_large_image`) | | 300 x 157 | 2:1 | 5 MB |

My default is one image per page at **1200 by 630 pixels, PNG or JPEG, under 600 KB**. That's Meta's recommended size and the default for Next.js's generated images, it clears LinkedIn's and Apple's minimums, sits within a few pixels of 1.91:1, and stays under WhatsApp's file limit, the tightest one. X crops it slightly toward 2:1, so I keep text and faces inside a centered safe area rather than near the edges. Apple says to "avoid text in preview images," since the title is already shown beside it; I keep any text large and short for the same reason.

## How Each Unfurler Behaves

What each consumer documents about its fetch, its cache and how to refresh it, as of October 2026:

| Consumer | User agent | Reads | Cache and refresh |
| --- | --- | --- | --- |
| [Meta](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers) (Facebook, Messenger) | `facebookexternalhit/1.1`, among other `meta-*` agents | Open Graph, `fb:app_id` | Images cached by URL and "won't be updated unless the URL changes"; [Sharing Debugger](https://developers.facebook.com/tools/debug/) forces a re-scrape |
| [WhatsApp](https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/) | `WhatsApp/2.x.x.x A\|I\|N` | `og:title`, `og:description`, `og:url`, `og:image` | Not documented; test by typing the link without sending |
| [LinkedIn](https://www.linkedin.com/help/linkedin/answer/a521928) | Not documented | `og:title`, `og:image`, `og:description`, `og:url`, and oEmbed | [Post Inspector](https://www.linkedin.com/post-inspector/); LinkedIn says to allow 48 hours from the last share ([help](https://www.linkedin.com/help/linkedin/answer/a525063)) |
| [Slack](https://api.slack.com/robots) | `Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)` | oEmbed, X Cards, Open Graph | Cached "globally for about 30 minutes"; doesn't honor robots.txt |
| [Discord](https://docs.discord.com/developers/link-previews/overview) | Not documented | Open Graph, X Cards, `theme-color`, oEmbed (JSON only) | About 30 minutes; change the URL (`?v=2`) to bust it; Embed Debugger |
| [Apple Messages](https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages) | Not documented; serve the same tags to every agent | `og:title`, `og:site_name`, `og:image`, `og:video`, icons | Not documented |
| [Telegram](https://bugs.telegram.org/c/57) | Not documented | Not documented | Send the link to [@WebpageBot](https://t.me/webpagebot) for an updated preview |
| X | `Twitterbot` | X Cards, then Open Graph | 7 days (unconfirmed, see above) |

<!-- source-gap: unfurler-user-agents | missing | LinkedIn, Discord, Apple Messages and Telegram don't document their link preview user agents; Telegram doesn't document which tags it reads | closes with: a vendor page naming each fetcher's user agent (and Telegram's supported tags) | checked: 2026-10-28 -->
LinkedIn, Discord, Apple and Telegram don't publish their preview fetchers' user agents or (for Telegram) the tags they read, so I don't build anything that depends on recognizing them. A few vendor details are worth knowing on their own:

- **Meta's crawlers** need gzip and deflate support, and both `meta-externalfetcher` and, for security checks, `facebookexternalhit` may bypass robots.txt. Allow up to 24 hours for a robots.txt change to be seen ([Meta: Web crawlers](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers)). A re-scrape refreshes the page's tags, but an image at an unchanged URL stays cached, so a new image needs a new URL.
- **Discord's limits** are a title of 70 bytes (3 lines), a description of 350 bytes (20 lines), a site name of 256 characters and URLs of 2,048. It reads at most 50 MB and needs a `2xx` with a `text/html` or `application/xhtml+xml` type ([Discord: Link previews](https://docs.discord.com/developers/link-previews/overview)).
- **Apple Messages** wants square icons of at least 108 px, follows server-side redirects but not meta refreshes, and plays `og:video` or `twitter:player:stream` inline only when it points at a direct media file. It notes the "limits may change in the future" ([Apple TN3156](https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages)).
- **Slack** fetches with `Range` headers and caches globally, so a fix takes up to half an hour to show everywhere ([Slack: Robots](https://api.slack.com/robots)).

Because so many caches key on the exact URL, my rule is that the image URL changes whenever the image does: a content hash or version in the path (`/og/seo.png?v=3` or `/og/seo-3f2a.png`). It's the only refresh that works across every consumer at once.

## oEmbed

[oEmbed](https://oembed.com/) is the other route to a rich preview, used for embeddable media: the page advertises a JSON (or XML) endpoint, and the consumer asks it for embed details.

```html
<link rel="alternate" type="application/json+oembed"
      href="https://example.com/oembed?url=https%3A%2F%2Fexample.com%2Fv%2F42&format=json"
      title="Product demo">
```

The response always has `type` (`photo`, `video`, `link` or `rich`) and `version` (`"1.0"`); `photo` adds `url`, `width` and `height`, while `video` and `rich` add `html`, `width` and `height`. Optional fields include `title`, `author_name`, `provider_name`, `cache_age` and a thumbnail (all three of `thumbnail_url`, `thumbnail_width` and `thumbnail_height` together). Providers must honor the consumer's `maxwidth` and `maxheight`, and the spec says rich HTML should be served in an iframe on another domain to "avoid XSS." Slack, Discord and LinkedIn all read oEmbed. The spec keeps a registry of providers at [providers.json](https://oembed.com/providers.json).

I add oEmbed only for things people embed (video, audio, interactive widgets); for an ordinary page, Open Graph is enough.

## Generating Images Dynamically

A site with thousands of pages can't hand-design thousands of images, so the usual approach is a template rendered to PNG on demand from the page's title and metadata. In Next.js, an `opengraph-image.tsx` file next to a route generates its image with `ImageResponse` from `next/og`, which defaults to 1200 by 630 ([Next.js: ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response)):

```tsx
// app/docs/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getDoc } from "@/lib/docs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Documentation page title card";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getDoc(slug);
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", padding: 80,
                  alignItems: "flex-end", fontSize: 72, background: "#0b1211", color: "#fff" }}>
      {doc.title}
    </div>,
    size,
  );
}
```

The constraints are worth knowing before designing the template, per the Next.js and [Vercel OG](https://vercel.com/docs/og-image-generation) docs as of October 2026:

- **A CSS subset with flexbox layout.** `ImageResponse` supports "only flexbox and a subset of CSS"; `display: grid` "will not work." Satori, the renderer underneath, now documents Grid and WOFF2 support in its own README ([Satori](https://github.com/vercel/satori)), but the version bundled in `next/og` may lag, so I design to the Next.js page. <!-- source-gap: satori-next-og-css | status | Next.js and Vercel OG docs say flexbox only and ttf/otf/woff fonts; the Satori README documents Grid and WOFF2 | closes with: Next.js ImageResponse docs updated to match Satori, or a next/og release note naming the Satori version | checked: 2026-10-28 -->
- **Fonts in TTF, OTF or WOFF,** loaded explicitly; there are no system fonts.
- **A 500 KB bundle limit,** including fonts and images.
- **Size limits on the output:** Next.js fails the build for an `opengraph-image` over 8 MB or a `twitter-image` over 5 MB ([Next.js: opengraph-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)).
- **Static unless it reads request data.** An image that uses only route params and content is generated at build time; one that reads cookies or headers renders per request.

Whatever the framework, my rules for generated images:

- **Cache aggressively, version by content.** The image only changes when the title does, so it's built at publish time or served with a long `Cache-Control` behind a URL that includes a content version ([Caching](/docs/requests/caching#cache-control)). Generating on every unfurl invites a crawler stampede on a popular link.
- **Fall back to a static site image.** If generation fails or times out, the route returns a default image rather than an error, because a slow or broken image response loses the whole preview (Discord's 10-second budget includes measuring the image).
- **Don't block the route.** The image URL must be fetchable by crawlers; Vercel's docs suggest allowing the image route in robots.txt.
- **Escape and truncate input.** Titles come from content, sometimes user content; the template clips long text instead of overflowing, and renders emoji and non-Latin scripts with fonts that include them.

## Favicons and App Icons

Icons show up in browser tabs, search results, bookmarks, home screens and next to link previews (Apple uses an `apple-touch-icon`, a favicon or another `<link rel>` icon). A minimal, complete set:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
```

- **Browsers choose among `rel="icon"` links** by `media`, `type` and `sizes`, using the last one on a tie; `sizes="any"` marks a vector format like SVG ([MDN: rel](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel), [MDN: link](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link)). I always ship a raster ICO or PNG too, since not every consumer reads SVG.
- **iOS ignores `rel="icon"` for home screen icons** and uses `apple-touch-icon`. Apple's guide lists 180 by 180 for Retina iPhones, and falls back to "the smallest icon larger than the recommended size" ([Apple: Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)). One 180-pixel PNG with an opaque background covers it.
- **Google Search** shows one favicon per hostname (subdomains can have their own, subdirectories can't), square, at least 8 by 8 and ideally larger than 48 by 48, at a stable URL Googlebot can reach. Changes take "several days to several weeks" to show ([Google: Favicon in Search](https://developers.google.com/search/docs/appearance/favicon-in-search)).

## Web App Manifest

The [web app manifest](https://www.w3.org/TR/appmanifest/) describes the site as an installable app: `name`, `short_name`, `start_url`, `display` (`fullscreen`, `standalone`, `minimal-ui` or the default `browser`), `background_color` for the launch screen, `theme_color`, and `icons`. It's still a W3C Working Draft as of October 2026. Chromium wants at least a 192 by 192 and a 512 by 512 icon to offer installation ([web.dev: Add a manifest](https://web.dev/articles/add-manifest)).

```json
{
  "name": "Example Docs",
  "short_name": "Docs",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b1211",
  "theme_color": "#0b1211",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Icon `purpose` is `any` (the default), `maskable` or `monochrome`. A **maskable** icon is cropped by the platform into its own shape, so everything important has to sit inside a centered circle with a radius of 40% of the icon's width ([web.dev: Maskable icons](https://web.dev/articles/maskable-icon)). Give it a separate file rather than `"any maskable"` on one image: web.dev's maskable guide advises against combining purposes, because an icon padded for masking looks too small where it isn't masked, even though its manifest article still shows the combined form.

## Theme Color and Color Scheme

- **`<meta name="theme-color">`** tints browser chrome on supporting browsers, and accepts a `media` attribute for light and dark values. Support is limited, so treat it as an enhancement ([MDN: theme-color](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color)). It doubles as Discord's embed accent color, which must be `#RRGGBB` or `#RRGGBBAA`, and the manifest's `theme_color` should match it.
- **`<meta name="color-scheme" content="light dark">`** tells the browser which schemes the page supports before CSS loads, so built-in UI such as form controls and scrollbars can match from the first paint ([MDN: color-scheme](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/color-scheme)). Values are `normal`, `light`, `dark`, `light dark`, `dark light` or `only light`.

```html
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b1211" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
```

Both values come from the same [design tokens](/docs/frontend/design-tokens) as the CSS, so the browser chrome and the page can't disagree.

## Site Defaults, Page Overrides

Every page needs a complete set of tags, and most pages will never get hand-written ones, so the structure is a site-wide default with per-page overrides:

- **The layout sets defaults** for `og:site_name`, `og:locale`, `twitter:card`, `twitter:site`, a default `og:image`, the icons and `theme-color`.
- **Each page sets** its `og:title`, `og:description`, `og:url` (matching the [canonical URL](/docs/frontend/seo#canonical-urls-and-duplicates)), `og:type`, and its own image when it has one.
- **The defaults are complete on their own,** so a page that sets nothing still previews properly.
- **Check how the framework merges.** In Next.js, metadata merges shallowly: a page that sets `openGraph` replaces the layout's whole `openGraph` object, so a page that sets only a title loses the default image unless it spreads the shared fields back in. Relative image URLs need `metadataBase`, and using one without it fails the build ([Next.js: generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)). Next.js also keeps metadata in the initial `<head>` for crawlers it knows can't wait for streamed HTML, such as `facebookexternalhit`, configurable with `htmlLimitedBots`.

I generate the title and description for previews from the same fields as the `<title>` and meta description, so search, tabs and chat all describe the page the same way.

## Private Content

Unfurlers fetch URLs from private conversations without any of the viewer's cookies, and some ignore robots.txt (Slack says it "does not honor robots.txt"; Meta says two of its agents may bypass it). Treat every URL that gets pasted anywhere as one an anonymous stranger will fetch:

- **Authenticated pages carry generic tags.** A logged-out request to a private URL gets the login page with site-level Open Graph tags, never the record's title, a customer's name or a document's first line. Rendering per-record metadata before checking authorization is a data leak, even if the body is protected.
- **Shareable links are a decision.** If a signed or unlisted link is meant to be shared, decide what its preview may show (often a title and a generic image) and render exactly that; everything in the tags is visible to anyone in the channel.
- **Fetches must be safe.** An unfurler's `GET` looks like a click. Magic sign-in links, invitations and one-time downloads must not be consumed by a `GET` alone; confirm with a `POST` from the page, so a preview fetch can't spend them.
- **No secrets in URLs.** Previews, caches and debugger tools all store the URL itself.

## Testing and Validation

- **In CI**, render each page template and assert the tags: all four required Open Graph properties present, absolute URLs, an `og:image` that returns `200` with an image content type and size within the limits above, `og:image:alt` set, and authenticated routes returning only defaults.
- **The vendor tools** show what each consumer actually parsed, and the Meta and LinkedIn tools also refresh their caches: Meta's [Sharing Debugger](https://developers.facebook.com/tools/debug/), LinkedIn's [Post Inspector](https://www.linkedin.com/post-inspector/), Discord's Embed Debugger, Telegram's [@WebpageBot](https://t.me/webpagebot), and for WhatsApp, typing the link into a chat without sending and waiting up to 10 seconds.
- **Icons and manifest:** the browser's DevTools application panel shows the parsed manifest, icons and installability errors.
- **After changing an image**, change its URL; after changing tags, re-scrape in the tools above, and expect Slack and Discord to catch up within about half an hour on their own.

## Checklist

- Every page's `<head>` has `og:title`, `og:type`, `og:url`, `og:image` (absolute), `og:image:alt`, width and height, `og:description` and `og:site_name`, in the server-rendered HTML, near the top.
- `twitter:card` is `summary_large_image` for pages with a meaningful image; other `twitter:` tags fall back to Open Graph.
- Images are 1200 by 630, PNG or JPEG, under 600 KB, with important content in a centered safe area.
- Image URLs change when the image does; generated images are cached and fall back to a static default.
- Site defaults are complete; per-page tags override them without dropping fields.
- Logged-out requests to private URLs return only generic tags; one-time links can't be consumed by a `GET`.
- oEmbed is offered for embeddable media only.
- Icons: an ICO or PNG favicon, an optional SVG, a 180-pixel `apple-touch-icon`, and manifest icons at 192 and 512 plus a separate maskable icon.
- The manifest, `theme-color` and `color-scheme` come from the same tokens as the CSS.
- Tags are asserted in CI per template, and checked in each vendor's tool before a launch.

## References

**Specifications**

- [The Open Graph protocol](https://ogp.me/), required and optional properties, structured image properties, types and arrays
- [oEmbed](https://oembed.com/), discovery, response types and fields, and the security note on rich HTML
- [oEmbed: providers.json](https://oembed.com/providers.json), the provider registry
- [W3C: Web Application Manifest](https://www.w3.org/TR/appmanifest/), manifest members, display modes and icon purposes

**Unfurlers**

- [Meta: A guide to sharing for webmasters](https://developers.facebook.com/docs/sharing/webmasters), basic tags, image caching and the Sharing Debugger
- [Meta: Images in shared links](https://developers.facebook.com/docs/sharing/webmasters/images), recommended and minimum image sizes, aspect ratio and file size
- [Meta: Web crawlers](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers), user agents, the 1 MB limit, compression and robots.txt behavior
- [WhatsApp: Link previews](https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/), required tags, image limits, the 300 KB head limit and the user agent
- [LinkedIn Help: Link preview tags and images](https://www.linkedin.com/help/linkedin/answer/a521928), tags read and image sizes
- [LinkedIn Help: Refreshing shared URL previews](https://www.linkedin.com/help/linkedin/answer/a525063), oEmbed and Open Graph, and the 48-hour refresh
- [Slack: Robots](https://api.slack.com/robots), the Slackbot user agent, tags read, caching and robots.txt
- [Slack: Unfurling links in messages](https://docs.slack.dev/messaging/unfurling-links-in-messages), classic unfurls from Open Graph and X Card metadata
- [Discord: Link previews](https://docs.discord.com/developers/link-previews/overview), fetch limits, tags read, theme color, image formats, field limits and caching
- [Apple: TN3156 Create rich previews for Messages](https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages), tags read, icon and image sizes, resource limits and fetch behavior
- [Telegram: Link preview tips](https://bugs.telegram.org/c/57), refreshing previews with @WebpageBot

**Generating images**

- [Next.js: opengraph-image and twitter-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image), file conventions and size limits
- [Next.js: ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response), default size, CSS subset, fonts and the bundle limit
- [Next.js: generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), metadataBase, shallow merging and HTML-limited bots
- [Vercel: OG image generation](https://vercel.com/docs/og-image-generation), recommended size, limits and caching
- [Vercel: Satori](https://github.com/vercel/satori), the HTML and CSS to SVG renderer and its supported CSS

**Icons and theme**

- [MDN: rel attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel), icon selection and apple-touch-icon on iOS
- [MDN: link element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link), the sizes attribute
- [Apple: Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html), apple-touch-icon sizes and fallback
- [Google: Favicon in Search results](https://developers.google.com/search/docs/appearance/favicon-in-search), size, scope and update timing
- [web.dev: Add a web app manifest](https://web.dev/articles/add-manifest), required members and install icon sizes
- [web.dev: Adaptive icon support with maskable icons](https://web.dev/articles/maskable-icon), the safe zone and separate purposes
- [MDN: theme-color](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color), values, the media attribute and support
- [MDN: color-scheme](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/color-scheme), supported values and behavior

**Tools**

- [Meta: Sharing Debugger](https://developers.facebook.com/tools/debug/), inspecting and re-scraping a URL
- [LinkedIn: Post Inspector](https://www.linkedin.com/post-inspector/), inspecting a URL's LinkedIn preview
- [Telegram: @WebpageBot](https://t.me/webpagebot), refreshing a Telegram preview
