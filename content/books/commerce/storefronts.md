+++
title = "Storefronts"
description = "Themes versus headless storefronts, caching catalog pages, speed and conversion, commerce SEO and structured data, and accessibility law for stores."
category = "Commerce Industry"
order = 2310
part = "Storefront and Checkout"
tags = ["commerce", "storefronts", "headless", "seo", "accessibility"]
+++

The storefront is the part of a store a shopper sees before the cart: the home page, the collection and search pages, the product page with its variants, images, price and stock. It is a read-heavy web application over the catalog, and almost everything it shows is the same for every shopper until a cart, an account, a market or a price list makes it personal. Three groups read it, and each wants something different: shoppers want it fast and usable with any device or assistive technology, search engines and shopping surfaces want every product at one stable URL with its price and availability in machine-readable form, and the merchant wants to change it without a deploy.

This chapter covers the two ways stores are built (a theme rendered by the platform, or a headless storefront the merchant writes against the platform's APIs), caching catalog pages without leaking a cart, performance and what it is worth, commerce SEO (structured data, variant and faceted URLs, pagination, redirects), and accessibility law for stores. General web performance and accessibility are the playbook's [Web Performance](/docs/frontend/web-performance) and [Accessibility](/docs/frontend/accessibility); CDN mechanics are the Hosting & Cloud volume's [Caching & Invalidation](/books/hosting-and-cloud/caching-and-invalidation). The chapter adds `storefronts` and `url_redirects` to [The Core Data Model](/books/commerce/commerce-business#the-core-data-model), on top of the online `locations` row each storefront sells through.

## How the Platforms Do It

As of October 2026, from vendor documentation:

| Platform | Theme storefront | Headless storefront | Data API for headless | Where checkout runs |
| --- | --- | --- | --- | --- |
| **Shopify** | Liquid themes: a layout, templates, sections and blocks the merchant arranges in the theme editor; apps add app blocks through theme app extensions | Hydrogen, Shopify's headless toolkit, with React Router 7 templates deployed to Oxygen or Next.js templates deployed to Vercel | Storefront API and Customer Account API; buyer traffic "isn't rate-limited at all" | Shopify's checkout in both cases; Hydrogen ships no checkout UI |
| **Commerce.com (BigCommerce)** | Stencil, a Handlebars-based theme engine with widgets and a page builder | Catalyst, "a standard Next.js application" with React server components | GraphQL Storefront API | The platform's checkout, customizable through the Checkout SDK ([Cart & Checkout](/books/commerce/cart-and-checkout)) |
| **Salesforce Commerce Cloud** | Storefront Reference Architecture (SFRA), server-side cartridges | PWA Kit, "a storefront technology for headless commerce using Salesforce Commerce APIs and React," deployed to Managed Runtime | Salesforce Commerce APIs | Either; hybrid sites route cart and checkout to SFRA |
| **commercetools** | None; API-first | commercetools Frontend, a framework with UI components, a Studio for business users and a delivery layer serving a progressive web app | commercetools APIs, plus other headless services through its API hub | commercetools Checkout or the merchant's own ([Cart & Checkout](/books/commerce/cart-and-checkout#how-the-platforms-do-it)) |
| **Vercel (Next.js Commerce)** | None | Next.js Commerce, an App Router template with Shopify as the default provider and forks for BigCommerce, Medusa, Saleor, Shopware, Wix and others; archived in favor of Vercel Shop, a Shopify storefront on Next.js 16 | Shopify through the Hydrogen SDK | Shopify |
| **Medusa, Saleor** | None; backends with APIs and an admin | Any framework; starter storefronts are separate applications the merchant deploys | Medusa's store API; Saleor's GraphQL API | The storefront's own pages calling the backend's cart and checkout APIs |

Three patterns run through the table:

- **Every platform now offers both,** and the theme route is still where most stores start. A theme is hosted, cached and upgraded by the platform; a headless storefront is an application the merchant runs ([Choosing & Hosting a Store](/books/commerce/choosing-a-platform#four-ways-to-run-a-store)).
- **Headless rarely includes checkout.** Shopify's toolkit leaves checkout on Shopify, Vercel's templates hand the cart to Shopify's checkout URL, and Salesforce's hybrid pattern keeps checkout on SFRA. The storefront is decoupled; the payment page usually isn't, which keeps it inside the platform's PCI scope ([PCI DSS Scope](/books/commerce/choosing-a-platform#pci-dss-scope)).
- **The storefront is now also read by machines.** Vercel Shop ships Markdown representations of pages, an `/llms.txt`, Schema.org data and a sitemap for "answer engines," alongside the HTML; [Agentic & AI Shopping](/books/commerce/agentic-commerce#product-data-for-agents) covers what agents do with it.

## Themes and Headless

A **theme** is a template package the platform renders. On Shopify, a theme's `layout/theme.liquid` wraps every page; templates define each page type, and a JSON template "act[s] only as a wrapper for sections," which the merchant adds, removes and reorders in the editor; sections contain blocks, and a section in a JSON template should accept blocks of type `@app` so an app can add content (a reviews widget, a subscription picker) without editing theme code. Commerce.com's Stencil does the same with Handlebars. The platform resolves the data (product, variants, price for the shopper's market, inventory), renders HTML on its servers and serves it through its CDN; Shopify's documentation describes "a global CDN backed by Cloudflare" for its storefronts.

A **headless** storefront is the merchant's own web application. It queries the platform's storefront API for catalog, cart and customer data, renders pages itself (server-side, statically, or both), and hands the shopper to the platform's checkout or calls a checkout API. What it buys: any framework, content from a CMS composed with catalog data, one codebase for several brands or markets, and control over performance. What it costs: the merchant now owns the servers, the cache rules, the uptime and every feature the theme gave for free (an app block that worked in the theme needs its own integration headless).

The choice is about who edits the storefront and how often:

| Question | Theme | Headless |
| --- | --- | --- |
| Who changes the page layout | Merchandisers in the theme editor | Engineers, unless a CMS or visual editor is added |
| How apps add features | App blocks and embeds, installed by the merchant | An SDK or API integration per app, written by engineers |
| Who runs servers and cache | The platform | The merchant, on a frontend cloud or its own infrastructure |
| What breaks on a platform change | Rarely anything; the platform upgrades themes in place | Whatever the API version change touches, on the merchant's schedule |
| Where it wins | Speed to launch, merchant control, the app ecosystem | Content-led brands, many markets or brands on one codebase, unusual page models, performance budgets the theme can't meet |

My default is a theme until a specific requirement fails on it, and headless on the same platform when one does, so the catalog, the checkout and the apps stay where they are.

## Caching Catalog Pages

A catalog page is the same for every shopper in a market, so it caches; a cart, an account page or a page priced by a company's contract list does not. The commerce mistakes are always the same two: a shared cache that keys on too little (and serves one shopper's cart badge, prices or currency to the next), and a cache that holds a price or stock state after it changed. The cache-key and never-share rules are the Hosting & Cloud volume's ([The Cache Key](/books/hosting-and-cloud/caching-and-invalidation#the-cache-key), [What Must Never Be Shared](/books/hosting-and-cloud/caching-and-invalidation#what-must-never-be-shared)); the commerce specifics:

- **Split the page.** The product's title, images, description and base price cache for minutes or hours; inventory, a personalized price, the cart count and the "signed in as" header are fetched per request or filled in on the client. Vercel Shop's template uses partial prerendering, a static shell with dynamic holes, for exactly this split.
- **Key on what changes the price.** Market, currency, locale and, on B2B storefronts, the company's price list all change what a shopper sees; each belongs in the cache key or the page is not shared at all ([Pricing & Price Lists](/books/commerce/pricing#price-lists-price-books-and-b2b-prices) owns the price model).
- **Invalidate on events, not on timers alone.** A price change, a sale starting, a product archived or a variant selling out should purge or revalidate the pages that show it. Vercel Shop invalidates "tagged caches" from Shopify webhooks; the same pattern works with any platform's webhooks and a CDN that purges by tag ([Purge and Invalidation](/books/hosting-and-cloud/caching-and-invalidation#purge-and-invalidation)).
- **Stale is a choice per field.** Hydrogen's defaults show the trade: Storefront API data is cached `public, max-age=1, stale-while-revalidate=86399` unless told otherwise, `CacheShort()` is a 10-second window and `CacheLong()` an hour fresh plus 23 hours stale, and customer queries must pass `CacheNone()` at both the subrequest and the full-page level; Customer Account API data "is never cached." A description can be a day stale; a price shown as a promise can't.
- **Check the price at the cart, always.** Whatever the page showed, the cart reprices from the source when a line is added and again at checkout (`cart_lines.unit_price` is "as shown; repriced at checkout" in the core model), so a stale page can mislead but never undercharge.

A platform's storefront API protects itself from bots, not shoppers: Shopify's Storefront API doesn't rate-limit buyer traffic, and applies bot and crawler limits and a checkout throttle instead. A headless storefront that renders on the server still needs its own cache in front of the API, because a crawler walking every filter combination is not a buyer.

## Speed and Conversion

Core Web Vitals are the playbook's targets ([Targets: Core Web Vitals](/docs/frontend/web-performance#targets-core-web-vitals)): Largest Contentful Paint within 2.5 seconds, Interaction to Next Paint of 200 milliseconds or less and Cumulative Layout Shift of 0.1 or less, measured at the 75th percentile of page loads, mobile and desktop separately. What speed is worth in commerce has public evidence: Deloitte's 2020 study for Google found that a 0.1-second improvement in mobile site speed came with retail conversions up 8.4% and average order value up 9.2%.

The commerce causes of slow pages are specific:

- **The product image.** The largest element on a product page is usually its first image; Shopify's theme guidance is to never lazy-load the above-the-fold image and to mark it `fetchpriority="high"`.
- **App scripts.** Every installed app that adds a widget adds JavaScript, often on every page; the playbook's [Third-Party Scripts](/docs/frontend/web-performance#third-party-scripts) budget applies, and on the payment page the same scripts are a security question for [Store Security & PCI](/books/commerce/store-security-and-pci).
- **Catalog-sized loops.** Shopify names nested Liquid loops that grow with the catalog as a common cause of slow server response; a collection page that iterates every variant of every product slows as the catalog grows.
- **Client-rendered essentials.** Price, title and the add-to-cart button rendered by JavaScript after load delay the first useful paint and hide content from crawlers; Shopify's guidance is to render essential content in Liquid and HTML.

Shopify's Theme Store requires an average Lighthouse performance score of at least 60 across home, product and collection pages; that is an admission bar for themes, not a target for a store. I measure real-user data per page type (home, collection, product, cart) and set the budget on the product page, where the purchase decision is made.

## Commerce SEO

Search engines and shopping surfaces read a store differently from shoppers: they need each product at one stable URL, its price and availability in markup that matches the page, and a crawlable path to every product that doesn't run through millions of filter combinations. The general rules (crawling and indexing, robots directives, canonicals, sitemaps, titles, rendering, redirects in a migration, hreflang) are the playbook's [SEO](/docs/frontend/seo) doc; this section covers what a catalog adds to them.

### Structured Data

Google's merchant listing markup is a schema.org `Product` with an `Offer`. As of October 2026 the required properties are the product's `name`, `image` and `offers`, and on the offer a `price` (which "require[s] a price greater than zero" for merchant listings, unlike product snippets) and `priceCurrency`. Recommended are the product's `brand`, `gtin`, `mpn`, `sku`, `color`, `size`, `material`, `aggregateRating`, `review`, `inProductGroupWithID` and `isVariantOf` (for variant groups), and the offer's `availability`, `itemCondition`, `priceValidUntil`, `shippingDetails` and `hasMerchantReturnPolicy`. The seller must be the merchant: the markup is for "the seller of the product." The same `Product` markup without a purchasable offer (a review site, a manufacturer's page that sells nothing) qualifies only for product snippets, which carry ratings and reviews (`aggregateRating`, `review`) but not the merchant listing's price, shipping and returns; a store's product page wants the merchant listing.

Two rules make it work in a real store:

- **Generate it from the same data as the page.** The price and availability in the markup come from the same query that renders the visible price; markup that drifts from the page is worse than none. Google's Merchant Center reads the same markup: its automatic item updates use "the structured data markup and other product data sources" on landing pages to correct price, availability and condition in Shopping ads and free listings, and are "not a replacement for regular updates" of the product feed ([Multichannel Listing & Feeds](/books/commerce/multichannel-listing#google-merchant-center) covers feeds).
- **Put policies at the organization level.** Google recommends a store-wide `MerchantReturnPolicy` and shipping policy nested under `Organization`, with offer-level policies only to override it; offer-level policies support only a subset of the properties. That maps to the data model: return and shipping policies are merchant records ([Consumer Protection Online](/books/commerce/online-consumer-protection) and [Returns & Exchanges](/books/commerce/returns-and-exchanges#return-policies-and-the-law) own their content), referenced from products only for exceptions.

### Variant, Faceted and Paginated URLs

Google's ecommerce URL guidance, as of October 2026:

- **Variants.** "Make sure that each variant can be identified by a separate URL," as a path (`/t-shirt/green`) or a query parameter (`/t-shirt?color=green`); where variants are optional parameters, the canonical is the URL without them. Fragments (`#black`) are ignored for indexing, so a variant behind a fragment doesn't exist to search.
- **Session and tracking parameters.** One line, the general rule: don't link internally to "temporary parameters, such as session-IDs, tracking codes" ([Canonical URLs and Duplicates](/docs/frontend/seo#canonical-urls-and-duplicates) covers parameters in general).
- **Faceted navigation.** Filters create near-endless URL combinations. If the filtered pages don't need to rank, Google recommends you "use robots.txt to disallow crawling of faceted navigation URLs" and keep one unfiltered listing page crawlable; filters in a URL fragment have "no impact on crawling (positive or negative)." `rel="canonical"` from filtered pages "may, over time, decrease the crawl volume," and `nofollow` works only if every link to the URL carries it. If filtered pages should be indexed, use the standard `&` separator, keep filters in one consistent order with no duplicates, and "return an HTTP 404 status code when a filter combination doesn't return results."
- **Pagination.** "Give each page a unique URL" (`?page=2`), don't canonicalize later pages to the first, and link pages with plain `<a href>` links: Google no longer uses `rel="next"` and `rel="prev"`, and its crawlers "generally don't trigger JavaScript functions that require user actions," so infinite scroll needs crawlable page links behind it. Sort orders such as `?order=price` are kept out of the index with `noindex` or robots.txt.

The commerce decision is which filter pages are worth indexing. "Black running shoes" is a page people search for; "black running shoes size 11 under $90 sorted by newest" is not. My rule: index a small, deliberate set of category and single-facet pages (often promoted to real collections with their own copy, which [Collections and Category Pages](/books/commerce/site-search-and-merchandising#collections-and-category-pages) covers), and keep every multi-filter, sort and pagination-of-filters URL out of the crawl with robots.txt.

### Out of Stock, Discontinued and Seasonal Pages

A product's URL is its handle (`products.handle` in the core model), and handles change: a product is renamed, a collection is restructured, a store moves platforms. Every change needs a permanent redirect from the old path to the new one, kept for as long as old links might arrive, which in practice is forever (the redirect mechanics are [Status Codes and Redirects](/docs/frontend/seo#status-codes-and-redirects) and [Site Migrations](/docs/frontend/seo#site-migrations)). A headless storefront has to do this itself, so the redirect table belongs to the merchant's model, not the theme.

What a product page does when the product can't be bought is a merchandising decision expressed in HTTP:

- **Out of stock, coming back.** The page stays at its URL with a 200, the markup's `availability` says `OutOfStock` or `BackOrder`, and the page offers a restock notice; removing it loses the page's history for a gap of weeks.
- **Replaced by a successor.** The old URL redirects permanently to the successor (`reason = 'successor'` below), so links and reviews follow the product line.
- **Gone for good.** With no successor, redirect to the closest category or return a 404; never send every dead product to the home page, which tells search engines and shoppers nothing.
- **Seasonal.** A holiday collection or an annual sale lives at one evergreen URL (`/collections/black-friday`) reused every year, updated rather than recreated with a year in the path, so it keeps whatever it earned last season.

Moving a whole store carries every product, collection and content URL across with a redirect map; [Replatforming & Migration](/books/commerce/replatforming#urls-redirects-and-seo) covers it, and `url_redirects` below is the table it fills.

## Accessibility and ADA Litigation

A store that a screen reader can't check out of is a store that excludes customers, and in the US it is also the most litigated kind of website. The build standard is the playbook's [The Baseline: WCAG 2.2 AA](/docs/frontend/accessibility#the-baseline-wcag-2-2-aa); the commerce-specific failures are predictable: product images without text alternatives, variant pickers built from unlabeled divs, price and stock changes not announced, carousels and quick-view modals that trap or lose focus, CAPTCHAs at checkout, and error messages on the checkout form that a screen reader never hears ([Accessible Errors](/docs/frontend/forms#accessible-errors)).

**The US law is litigation, not a regulation.** Title III of the ADA "prohibits discrimination against people with disabilities by businesses open to the public," and the Department of Justice has "consistently taken the position that the ADA's requirements apply to all the goods, services, privileges, or activities offered by public accommodations, including those offered on the web." It "does not have a regulation setting out detailed standards" for business websites; it points to WCAG and the Section 508 standards as "helpful guidance." The binding rule DOJ did publish, on April 24, 2024, is under Title II and covers state and local governments: WCAG 2.1 Level AA for their web content and mobile apps, with compliance dates that an interim final rule of April 20, 2026 pushed to April 26, 2027 for governments serving 50,000 or more people and April 26, 2028 for smaller ones. It reaches a private store only when the store provides services for a government. For a retailer, the standard of care is therefore whatever courts accept, and WCAG 2.x AA is what settlements and courts reach for.

The volume of suits is the reason it matters. Seyfarth Shaw's count of federal website accessibility lawsuits, from court filing data, was 3,117 in 2025, up 27% from 2,452 in 2024, and 36% of the 8,667 ADA Title III suits filed that year; New York (1,021) and Florida (961) led, while California had 4, because California courts have held that online-only businesses aren't covered by the ADA and plaintiffs there file under state law in state court instead. State-court suits and demand letters aren't in those numbers. Whether a business with no physical store is covered at all is unsettled: the Second Circuit hasn't decided it, while most New York district courts have found such businesses covered. An online-only brand can't rely on the question being decided its way.

**In the EU the law is a regulation.** The European Accessibility Act (Directive (EU) 2019/882) has applied since June 28, 2025 and lists e-commerce among the services it covers; it exempts microenterprises providing services and allows services already provided under existing contracts to continue until June 28, 2030. A US store selling to EU consumers is in scope for the storefront and checkout it serves them.

Overlay widgets that promise to make a site compliant by script don't change what a screen reader meets in the underlying markup; the fix is in the theme or the storefront's components, tested with a keyboard and a screen reader on the product page, the cart and every checkout step ([Testing](/docs/frontend/accessibility#testing)).

## How to Build It

A storefront is the presentation of an online location: the domain, theme or deployment, market and locale it serves, and the paths it has ever served. The online store itself is already a `locations` row with `kind = 'online'`; a merchant with several brands, markets or a B2B portal has several storefronts on one or more online locations:

```sql
CREATE TABLE storefronts (               -- one site or app selling through an online location
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id      UUID NOT NULL REFERENCES locations (id),  -- kind = 'online'
  brand_id         UUID REFERENCES brands (id),
  name             TEXT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('theme', 'headless', 'b2b_portal', 'app')),
  primary_domain   TEXT NOT NULL,         -- e.g. 'shop.example.com'
  default_locale   TEXT NOT NULL,         -- BCP 47, e.g. 'en-US'
  price_list_id    UUID REFERENCES price_lists (id),  -- the market or channel price list
  release_ref      TEXT,                  -- theme ID and version, or the deployment ID live now
  status           TEXT NOT NULL CHECK (status IN ('draft', 'live', 'password_protected',
                     'closed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (primary_domain)
);

CREATE TABLE url_redirects (             -- every old path, forever
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  storefront_id  UUID NOT NULL REFERENCES storefronts (id),
  from_path      TEXT NOT NULL,           -- normalized: lowercase, no trailing slash, no query
  to_path        TEXT NOT NULL,
  status_code    SMALLINT NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
  reason         TEXT NOT NULL CHECK (reason IN ('handle_changed', 'discontinued',
                   'successor', 'merged', 'replatform', 'manual')),
  product_id     UUID REFERENCES products (id),  -- what the old path showed, if a product
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_hit_at    TIMESTAMPTZ,              -- updated in batches from CDN logs, not per request
  UNIQUE (storefront_id, from_path),
  CHECK (from_path <> to_path)
);

-- A handle change writes its redirect in the same transaction.
-- (:old_handle and :new_handle are the product's handles before and after.)
INSERT INTO url_redirects (storefront_id, from_path, to_path, reason, product_id)
SELECT s.id, '/products/' || :old_handle, '/products/' || :new_handle, 'handle_changed', :product_id
FROM storefronts s
WHERE s.location_id = :location_id
ON CONFLICT (storefront_id, from_path) DO UPDATE SET to_path = EXCLUDED.to_path;

-- Chains and loops: a redirect whose target is itself redirected.
SELECT a.storefront_id, a.from_path, a.to_path, b.to_path AS then_to
FROM url_redirects a
JOIN url_redirects b ON b.storefront_id = a.storefront_id AND b.from_path = a.to_path;
```

Design notes:

- **Collapse chains on write.** When a product's handle changes twice, the first redirect should point at the newest path, not at the second redirect; the query above finds what slipped through, and a job rewrites `to_path` to the end of the chain. A loop (`a` to `b` to `a`) is a bug to block at insert.
- **Redirects outlive products.** `product_id` records what the old path showed, so a later merchandiser can see why a path exists; deleting the product never deletes its redirects.
- **The storefront knows its release.** `release_ref` records which theme version or deployment is live, so an accessibility complaint, a broken structured-data report or a conversion drop can be matched to the release that caused it ([Platform Deploys](/books/hosting-and-cloud/platform-deploys)).
- **Markets resolve to price lists.** A storefront for Canada points at the Canadian price list; [Cross-Border Commerce](/books/commerce/cross-border-commerce#markets) adds markets as their own table, and storefronts then point at a market.
- **Emit events.** `product.updated`, `inventory_level.changed` and `price_list_item.changed` drive cache purges by tag, so the storefront's cache is invalidated by the same events every other system already consumes ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every redirect, with why and when.** A replatforming, an SEO drop or a broken campaign link is traced through the redirect table and its history.
- **What was live on a date.** The theme version or deployment serving each storefront over time, for accessibility complaints, security investigations and price-display disputes.
- **Accessibility evidence.** Audits run, their dates, the standard tested against (WCAG 2.2 AA), the issues found and their fixes; a demand letter is answered with a record of work, not an assertion.
- **Markup against the page.** A periodic crawl comparing the structured-data price and availability with the rendered page and the catalog, so drift is caught before a shopping surface disapproves the item.

## What This Means for the System You Build

- **Start on a theme and go headless on the same platform** only when a specific requirement fails, keeping checkout on the platform.
- **Cache the catalog, never the shopper:** split pages into a shared shell and per-request parts, key on market, currency and price list, and purge on catalog events.
- **Reprice at the cart,** so a stale page can never undercharge.
- **Budget performance on the product page** with real-user data, and treat app scripts as part of the budget.
- **Give every product and variant one stable URL,** generate structured data from the page's own data, and put shipping and return policies at the organization level.
- **Keep filter, sort and filtered-pagination URLs out of the crawl** except for a deliberate set of indexable category pages.
- **Write a permanent redirect for every changed path,** in the same transaction as the change, and keep it forever.
- **Build to WCAG 2.2 AA and test checkout with a screen reader,** because US stores face litigation without a regulation and EU stores face a regulation.

## References

**Platform documentation**

- [Shopify: Theme architecture](https://shopify.dev/docs/storefronts/themes/architecture), layouts, templates, JSON templates as wrappers for sections, sections and blocks
- [Shopify: App blocks](https://shopify.dev/docs/storefronts/themes/architecture/blocks/app-blocks), blocks of type `@app` built with theme app extensions
- [Shopify: Hydrogen](https://shopify.dev/docs/storefronts/headless/hydrogen), the headless toolkit, React Router and Next.js templates, the Storefront and Customer Account APIs, checkout staying on Shopify
- [Shopify: Caching Shopify API data with Hydrogen](https://shopify.dev/docs/storefronts/headless/hydrogen/caching), default cache headers, `CacheShort`, `CacheLong`, `CacheNone` and uncached customer data
- [Shopify: API limits](https://shopify.dev/docs/api/usage/limits), no rate limit on Storefront API buyer traffic, bot and checkout throttles
- [Shopify: Theme performance best practices](https://shopify.dev/docs/storefronts/themes/best-practices/performance), the CDN, LCP image guidance, Liquid loops and the Theme Store's Lighthouse bar of 60
- [BigCommerce: Stencil](https://docs.bigcommerce.com/docs/storefront/stencil), the Handlebars-based theme engine
- [BigCommerce: Catalyst](https://docs.bigcommerce.com/docs/storefront/catalyst), a Next.js application on the GraphQL Storefront API, and its hosting options
- [Salesforce: PWA Kit repository](https://github.com/SalesforceCommerceCloud/pwa-kit), PWA Kit as headless storefront technology on Salesforce Commerce APIs and React, and Managed Runtime
- [Salesforce: Hybrid storefront baskets](https://developer.salesforce.com/docs/commerce/commerce-api/guide/hybrid-storefront-baskets.html), hybrid storefronts routing cart and checkout to SFRA
- [commercetools: Frontend overview](https://docs.commercetools.com/frontend-getting-started/overview), UI components, Studio and the delivery layer
- [Vercel: Next.js Commerce repository](https://github.com/vercel/commerce), the App Router template, providers and its deprecation in favor of Vercel Shop
- [Vercel: Vercel Shop repository](https://github.com/vercel/shop), Shopify for commerce, Next.js 16 partial prerendering with caches invalidated by Shopify webhooks, and machine-readable surfaces

**Search**

- [Google Search Central: Merchant listing structured data](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing), required and recommended Product and Offer properties and organization-level shipping and return policies
- [Google Search Central: Managing crawling of faceted navigation URLs](https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation), robots.txt, fragments, canonical, nofollow, parameter order and 404s for empty filters
- [Google Search Central: Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), unique page URLs, canonicals, `rel="next"` and infinite scroll
- [Google Search Central: URL structure for ecommerce sites](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites), variant URLs, canonicals, session parameters and fragments
- [Google Merchant Center Help: Automatic item updates](https://support.google.com/merchants/answer/3246284), landing-page structured data correcting price and availability

**Performance**

- [web.dev: Web Vitals](https://web.dev/articles/vitals), LCP, INP and CLS thresholds at the 75th percentile
- [Deloitte: Milliseconds Make Millions (2020)](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html), retail conversion and order value gains from a 0.1-second mobile speed improvement

**Accessibility law**

- [ADA.gov: Guidance on web accessibility and the ADA](https://www.ada.gov/resources/web-guidance/), Title III and businesses' websites, and no detailed regulation for them
- [ADA.gov: Fact sheet on the Title II web and mobile app rule](https://www.ada.gov/resources/2024-03-08-web-rule/), WCAG 2.1 AA for state and local governments and the 2026 extension of compliance dates
- [Seyfarth Shaw: Federal court website accessibility lawsuit filings bounce back in 2025](https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/), 2024 and 2025 filing counts, states and online-only coverage
- [European Commission: European Accessibility Act](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en), e-commerce among covered services
- [EUR-Lex: Directive (EU) 2019/882](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0882), application from June 28, 2025, the microenterprise exemption for services and the transition to June 28, 2030
