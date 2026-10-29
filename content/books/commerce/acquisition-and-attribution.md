+++
title = "Acquisition & Attribution"
description = "Paid search and Shopping, Performance Max, Meta Advantage+, affiliates and influencers, signals after ATT, conversion APIs, attribution, lift tests and MMM."
category = "Commerce Industry"
order = 2354
part = "Marketing and Customers"
tags = ["commerce", "marketing", "advertising", "attribution", "affiliates", "measurement"]
+++

A DTC brand pays for most of its new customers. The cost sits outside the order (no line on the receipt says "Meta, $38"), and it is often the largest cost after the goods themselves, which is why [Business Models & Unit Economics](/books/commerce/business-models#the-unit-economics) measures CAC by cohort and payback in months. Where that spend goes is a short list: search ads and Shopping ads on Google, paid social on Meta and TikTok, affiliates and influencers who are paid per sale, coupon and cashback sites that sit at checkout, and the marketplaces' own ad networks. Every one of them will report how many sales it produced, and the totals will add up to more than the store sold.

That is the problem this chapter is about. Since Apple's App Tracking Transparency in 2021 and Safari's cookie limits before it, the ad platforms see less of what happens after a click, and they compensate with modeling, server-side conversion feeds and automated campaigns that ask the advertiser to trust the platform's own judgment. The store's job is to send the platforms accurate outcomes, within its consents, so their bidding works, and to measure what the spend actually caused with its own order book, experiments and models rather than with the platforms' claims.

This chapter covers the channels and how each is bought, Google Shopping and Performance Max, Meta's Advantage+ campaigns, affiliates and influencers under the FTC's Endorsement Guides, coupon and cashback extensions, what ATT and browser privacy changed, server-side conversion APIs, attribution models, incrementality and geo tests, and marketing mix modeling. Marketplace ads (Sponsored Products, Walmart Connect) are [Retail Media & Marketplace Ads](/books/commerce/retail-media); the product feed that Shopping ads run on is [Google Merchant Center](/books/commerce/multichannel-listing#google-merchant-center); the owned channels are [Email, SMS & Lifecycle Marketing](/books/commerce/email-sms-and-lifecycle). Lead-based businesses attribute differently, to a booked job or a signed lease weeks after the click, and their books own that model: Field Operations' [Attribution: From Lead to Job to Agreement](/books/field-operations/marketing-and-lead-sources#attribution-from-lead-to-job-to-agreement) and Property Tech's [Lead Sources and Attribution](/books/property-tech/leads-crm-and-tours#lead-sources-and-attribution). Generic attribution and experiment design are the playbook's ([Attribution Basics](/docs/telemetry/product-analytics#attribution-basics), [Experimentation](/docs/telemetry/experimentation)). The chapter extends `acquisition_spend` and `orders` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `touchpoints`, `attributions`, `affiliates`, `affiliate_conversions`, `conversion_uploads` and `lift_tests`.

## How the Platforms Do It

As of October 2026, from each platform's help center, developer documentation and announcements:

| Platform or network | What a store buys | What it optimizes on | Measurement it offers | Notes |
| --- | --- | --- | --- | --- |
| **Google Shopping ads** | Product ads with "a product photo, title, price, store name, and more" | Merchant Center product data, "not keywords" | Conversions, data-driven attribution | The feed is the targeting ([Google Merchant Center](/books/commerce/multichannel-listing#google-merchant-center)) |
| **Google Performance Max** | One "goal-based campaign" across "all Google Ads inventory": Search, Shopping, YouTube, Display, Discover, Gmail, Maps | Feeds, assets and a bidding goal; optional new-customer value | Channel performance and search-term reporting added in 2025 | Competes with Search and Shopping campaigns on Ad Rank |
| **Meta Advantage+ sales campaigns** | Automated sales campaigns across Meta's placements | The Pixel and Conversions API events | Attribution windows; Conversion Lift | Replaced Advantage+ shopping campaigns; the existing-customer budget cap is gone for new campaigns |
| **Affiliate networks** (impact.com, Awin, Rakuten, CJ) | Publishers paid a commission per sale | Click IDs and server-to-server conversion reports | Network reports, last click between publishers | ShareASale closed into Awin in 2025 |
| **Shopify Collabs** | Creator affiliate program inside Shopify | Affiliate links and discount codes | Shopify's order attribution | Commissions paid through the Shopify bill with a 2.9% processing fee |
| **Retail media** | Ads inside a marketplace | The marketplace's own sales data | The network's attributed sales | [Retail Media & Marketplace Ads](/books/commerce/retail-media) |

Three patterns run through the table:

- **Automation took the controls.** Performance Max and Advantage+ decide placements, audiences and often creative combinations; the advertiser supplies a budget, a goal, assets and a feed. What remains in the advertiser's hands is the quality of the feed, the conversion data and the definition of success.
- **The conversion signal is the targeting.** With fewer user-level signals from browsers and apps, the platforms optimize on what the advertiser sends them, which is why conversion APIs and enhanced conversions matter more than any audience setting.
- **Every platform grades its own homework.** Each reports sales it attributes to itself under its own windows and models; none sees the others. The order book is the only place all the channels meet.

## The Channels

| Channel | How it's paid | What a store sends it | The twist |
| --- | --- | --- | --- |
| **Paid search** (Google, Microsoft) | Cost per click, bid by auction | Keywords, ads, conversions | Branded search often buys clicks the organic result would have won |
| **Shopping and Performance Max** | Cost per click or a target return | The product feed, conversions with values | Price, availability and image quality decide eligibility |
| **Paid social** (Meta, TikTok, Pinterest, Snap) | Cost per thousand impressions, bid toward a conversion | A catalog, creative, Pixel and server events | Prospecting needs creative volume; the catalog drives dynamic retargeting |
| **Affiliates and content publishers** | Commission per sale | A tracking link or code, conversion reports, returns | Who gets credit when several touched the sale |
| **Influencers and creators** | Flat fee, free product, commission, or all three | Codes, links, briefs | Disclosure law falls on the brand |
| **Coupon and cashback sites, browser extensions** | Commission per sale | The same affiliate link | They often arrive at checkout, after the decision |
| **Marketplace ads** | Cost per click on the marketplace | Listings | [Retail Media & Marketplace Ads](/books/commerce/retail-media) |
| **Organic search and social** | Content and time | Structured data, Open Graph tags | The playbook's [SEO](/docs/frontend/seo) and [Link Previews & Social Cards](/docs/frontend/link-previews); commerce SEO in [Storefronts](/books/commerce/storefronts#commerce-seo) |

A store's mix moves with its stage. Early DTC brands live on paid social; mature ones shift toward search, affiliates, retention and marketplaces as social costs rise; brands with stores add local and offline media, which only experiments and mix models can measure.

## Google: Shopping and Performance Max

Shopping ads "use your existing Merchant Center product data (not keywords) to decide how and where to show your ads." So the feed (titles, product types, GTINs, prices, availability, images, custom labels) is both the ad and the targeting, and a disapproved item is a product the store can't advertise ([Errors and Suppression](/books/commerce/multichannel-listing#errors-and-suppression)). Two commerce feed practices pay off: custom labels for margin bands, so bidding can favor profitable items, and prices and availability synced closely enough that the ad never shows a price the landing page doesn't ([Inventory and Price Sync](/books/commerce/multichannel-listing#inventory-and-price-sync)).

Performance Max is "a goal-based campaign type that allows you to access all Google Ads inventory" from one campaign, built from "images, data feeds, and bidding goals." When it and another campaign could serve the same query, "Google Ads prioritizes the campaign with the highest Ad Rank," except that a Search campaign with an exactly matching keyword "will be preferred over Performance Max." Its opacity was the main complaint, and Google added controls through 2025: campaign-level negative keywords and brand exclusions that apply to Search text ads, announced in January 2025 with a high-value new customer mode built on Customer Match; channel performance reporting and full search-terms reporting, announced in April 2025. The commerce consequences:

- **Exclude the brand, or measure it separately.** A Performance Max campaign left alone will buy the store's own brand searches and report them as conversions. Brand exclusions or a separate brand Search campaign keep prospecting numbers honest.
- **Bid on value, with the right value.** Value-based bidding optimizes toward the conversion value sent, so the value should be margin or contribution where possible, not revenue, and a returned order's value should be adjusted back ([Return-Rate Economics](/books/commerce/returns-and-exchanges#return-rate-economics)).
- **New-customer goals need a customer list.** The new customer modes decide who is new from the advertiser's Customer Match lists and tags, which are personal data uploaded to Google under the store's consents ([Privacy Constraints](#privacy-constraints)).

## Meta: Advantage+ Sales Campaigns

Meta's automated commerce campaigns were Advantage+ shopping campaigns; its Marketing API now describes Advantage+ sales campaigns as "the updated, streamlined versions of Advantage+ shopping campaigns," using the sales objective with Advantage+ budget, audience and placements. From Marketing API v24.0 (October 8, 2025), new campaigns could no longer be created with the legacy shopping-campaign APIs, and creation was removed in v25.0. The change that mattered most to stores: the `existing_customer_budget_percentage` cap, which limited how much of the budget could reach existing customers, "is not available for new Advantage+ campaigns." Meta's replacement is to "create two ad sets per ad campaign that separate existing customers from new customers" with a custom audience the advertiser defines.

So the definition of an existing customer moved to the store: a custom audience built from its own customer list, uploaded hashed, refreshed as people buy, and governed by the same consents and opt-outs as any other sharing ([Privacy Constraints](#privacy-constraints)). A stale list means prospecting budget spent on last month's buyers.

## Affiliates and Influencers

An affiliate is paid a commission on sales it refers; an influencer is paid to talk about the product, in cash, free goods or a commission. Both are endorsements in law, and both are tracked the same way.

### The Endorsement Guides

The FTC's Guides Concerning the Use of Endorsements and Testimonials in Advertising (16 CFR Part 255) were revised in June 2023. The revision broadened the definition of endorsement to cover "fake reviews, virtual influencers, and tags in social media," defined "clear and conspicuous," said a platform's disclosure tool may not be sufficient, clarified "the potential liability of advertisers, endorsers, and intermediaries," and flagged that "child-directed advertising is of special concern." In the Guides' text, a disclosure must be "difficult to miss (i.e., easily noticeable)," and on social media and the internet "unavoidable." The FTC's guidance for influencers turns that into rules a brand can put in a creator brief:

- "Disclose when you have any financial, employment, personal, or family relationship with a brand," and free or discounted products count.
- Put the disclosure with the endorsement, not behind a "MORE" link; avoid "sp," "collab" and "thanks."
- "Don't assume that a platform's disclosure tool is good enough."
- In video, "the disclosure should be in the video and not just in the description," repeated periodically in a live stream.

The brand is liable for its endorsers' disclosures, which means it needs to monitor them. In 2020 the FTC settled with Teami, a tea marketer whose paid influencers "did not adequately disclose that they were being paid," for $1 million with a $15.2 million judgment suspended. The FTC's rule on consumer reviews and testimonials (16 CFR Part 465, in effect since October 21, 2024) adds that influencers "in the business of posting testimonials" can be liable if they lie about having used the product, and bans buying or selling fake "followers or views generated by a bot or hijacked account"; the rule's review provisions are [Fake Reviews and the FTC Rule](/books/commerce/reviews-and-ratings#fake-reviews-and-the-ftc-rule), and [Incentives and Sampling](/books/commerce/reviews-and-ratings#incentives-and-sampling) covers free product given for reviews.

The creator's side of the same rules (what a creator must disclose, livestreams, platform tools) is User-Generated Platforms' [Sponsorships, Affiliates and Disclosure](/books/user-generated-platforms/creator-monetization#sponsorships-affiliates-and-disclosure). For the store's system, that means: a record per creator of the relationship (paid, gifted, commissioned), the disclosure the brief required, the posts found, and whether each carried the disclosure.

### Tracking and Commissions

Affiliate tracking is a click ID carried from the publisher's link to the order:

- **impact.com** stores an `im_ref` click ID first-party, says "the effective lifetime of the cookie must match how long your contracts' referral window is set to," and takes conversions by server-to-server POST.
- **Awin** stores its `awc` parameter in a cookie with "both 'Secure' and 'HTTPOnly' flags," defines the attribution window as "also known as the cookie length," and "any conversions reported outside this window will not be credited."
- **Shopify Collabs** credits creators "through affiliate links or discount codes," holds commissions 30 days by default (configurable from 1 to 90) before paying through the Shopify bill.

The commerce rules:

- **Server-to-server, from the order.** Report the conversion from the order system with the click ID captured at landing, not from a browser pixel that ad blockers and cookie limits eat ([Server-Side Tracking and CDPs](/docs/telemetry/collection#server-side-tracking-and-cdps)).
- **Commission on net, after the return window.** A holding period at least as long as the return window, and reversals for returns and cancellations, keep the store from paying commission on goods that came back.
- **Codes leak.** A creator's discount code ends up on coupon sites within days; a commission tied to a code pays whoever posted it. Single-creator codes with use limits, and links preferred to codes, contain it ([Codes, Limits and Budgets](/books/commerce/promotions-and-gift-cards#codes-limits-and-budgets)).
- **Deduplicate across channels.** Networks resolve last click among their own publishers; the store must decide what happens when a paid social click and an affiliate click both precede the order. Paying both is the default outcome of doing nothing.

Commission plans for people who sell (sales reps, partner channels) are a different mechanism with clawbacks and tiers; Field Operations' [Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions) and the Payments volume's [Partners & Residuals](/books/payments/partners-and-residuals) cover them.

## Coupon and Cashback Extensions

Coupon sites and browser extensions earn affiliate commissions on purchases they often didn't cause: the shopper was already at checkout when the extension offered a code. The practice of an extension replacing an existing affiliate cookie at checkout became litigation in late 2024. In *In re PayPal Honey Browser Extension Litigation* (N.D. Cal., No. 5:24-cv-09470), brought by content creators whose affiliate commissions were allegedly overwritten by Honey, the court dismissed the first amended complaint for lack of standing with leave to amend in November 2025 and denied PayPal's motion to dismiss the second amended complaint on June 22, 2026; the case was proceeding as of October 2026. A parallel case over Capital One Shopping survived a motion to dismiss in part in June 2025, with several state-law counts dismissed.

Google changed the platform rule meanwhile. Its Chrome Web Store policy update of March 2025 bars extensions from adding, modifying or replacing affiliate links without disclosure, a user action and a direct benefit to the user, with no affiliate link when no coupon is found, enforced from June 10, 2025.

For a store, coupon and cashback programs are a measurement question first: compare conversion and order value for orders with and without the extension's involvement, and test pausing the program in some markets before believing its reported sales ([Incrementality and Geo Tests](#incrementality-and-geo-tests)).

## Signals After ATT

Three changes reduced what ad platforms can see about a click's outcome:

- **Apple's App Tracking Transparency.** From iOS 14.5, apps need "the user's permission through the App Tracking Transparency (ATT) framework" to track, which Apple defines as "linking user or device data collected from your app with user or device data collected from other companies' apps, websites, or offline properties for targeted advertising or advertising measurement purposes," including "sharing a list of emails, advertising IDs, or other IDs with a third-party advertising network." Apps measure installs instead through AdAttributionKit, which "builds on the functionality of SKAdNetwork" with crowd-anonymity thresholds ([iOS ATT and AdAttributionKit](/books/gaming/mobile-games#ios-att-and-adattributionkit) covers the app side). The effect on commerce advertisers was immediate: Meta's CFO said on its fourth-quarter 2021 call that "the impact of iOS overall as a headwind on our business in 2022 is on the order of $10 billion" and that "E-commerce was an area where we saw a meaningful slowdown in growth."
- **Safari's Intelligent Tracking Prevention.** ITP "deletes all cookies created in JavaScript and all other script-writeable storage after 7 days," caps cookies set by JavaScript on a landing page reached through link decoration at 24 hours, and since 2023 Apple strips tracking parameters "from the links users share in Messages and Mail" and in Safari Private Browsing. A click ID in the URL may never reach the store.
- **Chrome kept third-party cookies.** Google proposed in July 2024 that "instead of deprecating third-party cookies, we would introduce a new experience in Chrome," decided in April 2025 that it "will not be rolling out a new standalone prompt," and in October 2025 retired most Privacy Sandbox technologies, including the Attribution Reporting API, Protected Audience and Topics, citing "low levels of adoption."

So cross-site tracking survives in Chrome, is gone in Safari and in apps without consent, and is shrinking through browser defaults, regulation and ad blockers everywhere. The answer the industry settled on is first-party data sent server to server.

## Server-Side Conversions

A conversion API sends the order from the store's server to the ad platform, with hashed customer details the platform matches to its users:

- **Meta's Conversions API** connects "an advertiser's marketing data" from a server or CRM to Meta. Events run alongside the browser Pixel and are deduplicated when "a Meta Pixel's `eventID` must match the Conversion API's `event_id`" and the event names match, within 48 hours. Each event has an `action_source` (`website`, `app`, `physical_store`, `phone_call`, `chat`, `email` and others) and an `event_time` that "can be up to 7 days before you send an event." Customer fields (email, phone, name, city, postal code) are SHA-256 hashed after normalizing; the client IP address and the `fbc` and `fbp` click and browser IDs are sent unhashed. Meta scores the match as Event Match Quality, "a score (out of 10)."
- **Google's enhanced conversions** for web supplements the conversion tag with "first-party customer data, such as email addresses," hashed with "a secure one-way hashing algorithm called SHA256" and "matched with signed-in Google accounts."
- **Consent travels with the data.** Google's Consent Mode carries `ad_user_data` ("consent for sending user data related to advertising to Google") and `ad_personalization`; since March 2024, Customer Match lists used in the EEA must have both consent fields granted.

The commerce rules:

- **Send from the order, with the browser's IDs captured at checkout.** The server event is the order (`order.placed`), with the click IDs and Pixel cookie values the checkout captured, the same event ID the browser event used, and the value the store wants optimized.
- **Send the corrections too.** Returns, cancellations and fraud declines change what the bidder should have learned. Platforms accept conversion adjustments or offline events; a store that never sends them teaches the bidder to find returners.
- **Gate on consent and opt-outs.** A conversion upload is sharing personal data with an ad platform. It happens only under the consent the jurisdiction requires and never for a customer who opted out of sale or sharing ([Privacy Constraints](#privacy-constraints)).
- **Hash consistently, and never send what you don't need.** Normalize before hashing (Meta: trim and lowercase emails, digits only with the country code for phones), and send no product details that imply a sensitive category.

Lead-based businesses use the same mechanisms with offline events (a booked job, a signed lease) and the same obligations, covered in [Offline conversion feedback](/books/property-tech/listings-and-marketing#offline-conversion-feedback).

## Attribution Models

Attribution assigns an order to the touches before it. The models are the playbook's ([Attribution Basics](/docs/telemetry/product-analytics#attribution-basics)); what changed for commerce is who runs them:

- **Google Ads attributes with data-driven attribution by default,** and "the first click, linear, time decay, and position-based attribution models are no longer supported by Google," removed from selection in June 2023 and switched to data-driven in September 2023, after Google found "less than 3% of Google Ads web conversions" used them.
- **Meta's windows narrowed.** From January 12, 2026, its Ads Insights API stopped returning 7-day and 28-day view windows, keeping 1-day, 7-day and 28-day click and 1-day view; from March 2026 click-through counts "exclusively include link clicks," and engaged-view became "engage-through attribution."
- **Affiliate networks use last click** among their publishers, within the cookie window.

Each platform's report is its claim under its own model, the same point [Measurement](/books/commerce/retail-media#measurement) makes for retail media. My rules:

- **Keep the raw touches,** with their source, and the platform's claims, separately from the store's own attribution, and never sum platform claims as if they were sales.
- **Run one store-side model and name it** on every report: last non-direct click from the store's own touch log is simple and defensible; position-based or data-driven models are fine if their version is recorded with each result.
- **Ask the customer.** A post-purchase "how did you hear about us?" catches podcasts, word of mouth and influencers that click tracking misses, and its answers are a check on every model.
- **Separate new from returning customers.** A campaign that mostly reaches existing customers is retention, and CAC counts only first orders ([The Unit Economics](/books/commerce/business-models#the-unit-economics)).

## Incrementality and Geo Tests

Attribution says which ads touched a sale; incrementality says which sales the ads caused. The test is a holdout ([Holdouts](/docs/telemetry/experimentation#holdouts)):

- **Platform lift studies.** Google's Conversion Lift is "an incrementality tool" comparing "People who see your ads" with "People who don't see your ads," by user or by geography, not available in every account. Meta runs Conversion Lift studies on its side.
- **Geo experiments.** Switch spend off, or on, in a set of regions and compare total sales from the order book against matched control regions. Meta's open-source GeoLift ("an end-to-end solution to measure Lift at a Geo-level") builds the control with synthetic control methods. A geo test needs nothing from the platform beyond the ability to target by region, which makes it the one method that works the same for every channel, including TV, podcasts and coupon programs.
- **Design for commerce.** Shipping regions, store footprints and seasonal timing make regions unequal; markets with stores leak online demand to stores and back; and a test during a promotion measures the promotion. Spillover between test and control regions is the interference problem in [Interference and Network Effects](/docs/telemetry/experimentation#interference-and-network-effects).

My default is a rolling calendar: one significant channel tested each quarter, results recorded with their design and confidence, and branded search, retargeting and coupon programs tested first, because they are the channels most likely to take credit for sales that would have happened anyway.

## Marketing Mix Modeling

A marketing mix model regresses sales on spend by channel over time (with lags, saturation and controls for price, promotions, seasonality and distribution) to estimate each channel's contribution without user-level data. It went from consultancy product to open source:

- **Google's Meridian** was released to all marketers on January 29, 2025 as an "open-source modeling framework" using "Bayesian causal inference," that "accounts for reach and frequency" and "easily integrates incrementality experiment results as priors." It handles "large scale geo-level data," and its calibration guide turns lift experiments into ROI priors while warning that "MMMs and experiments differ in important ways: specifically in their scope, timing and duration."
- **Meta's Robyn** uses "ridge regression, multi-objective evolutionary algorithm for hyperparameter optimization," exploring "adstock rates and saturation curves," in R with a Python beta.

The commerce inputs are the ones the core model already holds: spend by channel and week from `acquisition_spend`, sales and new customers by week and region from `orders`, prices and promotions from the catalog and discount history, and distribution changes (a new retailer, a marketplace launch) as events. Three rules:

- **Calibrate with experiments.** An MMM without lift tests is a correlation; Meridian's priors from experiments are the mechanism for tying the two together.
- **Model total sales, all channels.** A DTC brand whose ads drive Amazon and retail sales sees that only in a model with those sales in it ([Channels](/books/commerce/commerce-business#channels)).
- **Version the model and its inputs,** since budget decisions will be defended later with its output.

## Privacy Constraints

Ad pixels and conversion uploads are the main way a store shares personal data. The law in force as of October 2026:

- **State privacy laws give an opt-out of targeted advertising and of sale or sharing,** and California requires honoring the Global Privacy Control signal; retailers' CCPA settlements were mostly about pixels ([CCPA in Practice](/books/commerce/customers-and-accounts#ccpa-in-practice), [Gating SDKs](/docs/telemetry/consent-and-privacy#gating-sdks)).
- **The EU and UK require consent before non-essential tracking,** which is what Consent Mode's fields carry ([Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection)).
- **Sensitive inferences stay out of ad platforms.** A health, pregnancy or similar product category in a conversion event is a sensitive inference; Meta has restricted lower-funnel events for some health and wellness advertisers. <!-- source-gap: meta-health-event-restrictions | secondary | Meta's 2025 restrictions on lower-funnel events for health and wellness advertisers and their start date | closes with: Meta's own policy or help page text | checked: 2026-10-28 -->
- **Wiretap suits over pixels.** California Invasion of Privacy Act claims against websites for pixels and session replay were a wave of litigation in 2023 to 2026; California's SB 690 (Chapter 976, Statutes of 2026, approved September 30, 2026) amends Penal Code 637.2 so that only the Attorney General may sue over the pen register and trap and trace provision when the claim arises from conduct on a website, online application or mobile app, applies that limit retroactively to pending claims filed within two years before its operative date, and leaves the private right of action for other violations, including interception, in place. With no urgency clause, it takes effect January 1, 2027.

The contextual alternative (ads chosen by the page or the search, not the person) is what user-generated platforms lean on under the same laws ([Contextual Targeting and the Law](/books/user-generated-platforms/ads-and-data-licensing#contextual-targeting-and-the-law)).

## How to Build It

`acquisition_spend` from [Business Models & Unit Economics](/books/commerce/business-models#how-to-build-it) holds spend by channel, campaign and day; [Retail Media & Marketplace Ads](/books/commerce/retail-media#how-to-build-it) adds the marketplace detail and the platform's attributed claims. This chapter adds the store's own view: touches captured at landing, the attribution its model produced, affiliates and their conversions, every upload to an ad platform, and lift tests.

```sql
ALTER TABLE acquisition_spend
  ADD COLUMN geo        TEXT,               -- region for geo tests and MMM; null = all
  ADD COLUMN objective  TEXT;               -- 'prospecting', 'retargeting', 'brand', 'retention'

CREATE TABLE touchpoints (               -- a visit or message with its source, as captured
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id    UUID NOT NULL REFERENCES merchants (id),
  customer_id    UUID REFERENCES customers (id),  -- null until identified
  anonymous_id   TEXT,                    -- first-party visitor ID
  occurred_at    TIMESTAMPTZ NOT NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('ad_click', 'affiliate_click', 'email_click',
                   'sms_click', 'organic', 'referral', 'direct', 'survey_answer')),
  channel        TEXT NOT NULL,           -- matches acquisition_spend.channel
  source         TEXT,                    -- utm_source or the network
  campaign_ref   TEXT,                    -- utm_campaign or the platform's campaign ID
  click_ids      JSONB NOT NULL DEFAULT '{}',  -- {"gclid": ..., "fbclid": ..., "im_ref": ...}
  landing_url    TEXT,
  consent_state  TEXT NOT NULL            -- the tracking consent in force at capture
);

CREATE TABLE attributions (              -- the store's model's answer, per order and version
  order_id       UUID NOT NULL REFERENCES orders (id),
  model          TEXT NOT NULL,           -- 'last_non_direct_click', 'position_based', 'survey'
  model_version  INT NOT NULL,
  touchpoint_id  UUID REFERENCES touchpoints (id),  -- null: unattributed
  channel        TEXT NOT NULL,
  credit         NUMERIC(5,4) NOT NULL CHECK (credit > 0 AND credit <= 1),
  new_customer   BOOLEAN NOT NULL,        -- first order for this customer at this merchant
  computed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (order_id, model, model_version, channel)
);

CREATE TABLE affiliates (                -- a publisher, creator or extension paid per sale
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id       UUID NOT NULL REFERENCES merchants (id),
  kind              TEXT NOT NULL CHECK (kind IN ('content', 'coupon', 'cashback',
                      'extension', 'creator', 'loyalty', 'other')),
  network           TEXT,                 -- 'impact', 'awin', 'collabs', null: direct
  external_ref      TEXT,                 -- the network's publisher ID
  relationship      TEXT NOT NULL CHECK (relationship IN ('commission', 'paid', 'gifted',
                      'mixed')),          -- what the disclosure must reveal
  commission_terms  JSONB NOT NULL,       -- rate, window_days, holding_days, excluded items
  disclosure_brief  TEXT,                 -- the required disclosure, versioned
  status            TEXT NOT NULL CHECK (status IN ('applied', 'active', 'paused', 'removed')),
  UNIQUE (merchant_id, network, external_ref)
);

CREATE TABLE affiliate_conversions (     -- what the store reported and what it owes
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  affiliate_id   UUID NOT NULL REFERENCES affiliates (id),
  order_id       UUID NOT NULL REFERENCES orders (id),
  touchpoint_id  UUID REFERENCES touchpoints (id),
  base_amount    BIGINT NOT NULL,         -- commissionable goods, minor units, after discounts
  commission     BIGINT NOT NULL,
  currency       CHAR(3) NOT NULL,
  state          TEXT NOT NULL CHECK (state IN ('pending', 'locked', 'reversed', 'adjusted',
                   'paid')),
  locks_at       TIMESTAMPTZ NOT NULL,    -- after the return window
  reported_at    TIMESTAMPTZ,             -- server-to-server post to the network
  UNIQUE (affiliate_id, order_id)
);

CREATE TABLE conversion_uploads (        -- every outcome sent to an ad platform
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  destination     TEXT NOT NULL,          -- 'meta_capi', 'google_enhanced', 'tiktok_events'
  order_id        UUID REFERENCES orders (id),
  event_name      TEXT NOT NULL,          -- 'Purchase', 'Refund', a conversion adjustment
  event_id        TEXT NOT NULL,          -- shared with the browser event for deduplication
  value           BIGINT,                 -- minor units: margin or revenue, as configured
  currency        CHAR(3),
  fields_sent     TEXT[] NOT NULL,        -- 'em', 'ph', 'fbc', 'client_ip_address', ...
  consent_basis   TEXT NOT NULL,          -- 'consented', 'not_required', never 'opted_out'
  sent_at         TIMESTAMPTZ,
  response        TEXT,
  UNIQUE (destination, event_id, event_name)
);

CREATE TABLE lift_tests (                -- holdouts and geo experiments, with their answers
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id    UUID NOT NULL REFERENCES merchants (id),
  channel        TEXT NOT NULL,
  design         TEXT NOT NULL CHECK (design IN ('platform_user_holdout', 'geo_holdout',
                   'geo_switchback', 'time_off')),
  test_geos      TEXT[],
  control_geos   TEXT[],
  runs_during    TSTZRANGE NOT NULL,
  metric         TEXT NOT NULL,           -- 'orders', 'new_customers', 'contribution'
  lift           NUMERIC,                 -- incremental share of the metric
  ci_low         NUMERIC,
  ci_high        NUMERIC,
  incremental_cac BIGINT,                 -- spend over incremental new customers
  method_ref     TEXT,                    -- 'geolift', 'conversion_lift', notebook commit
  notes          TEXT
);
```

The number the business trusts compares spend with first orders from the order book, not with platform claims:

```sql
-- Blended CAC and attributed CAC by channel and month, from the store's own model.
WITH first_orders AS (
  SELECT DISTINCT ON (o.customer_id) o.id, o.customer_id, o.placed_at
  FROM orders o
  JOIN locations l ON l.id = o.location_id
  WHERE l.merchant_id = $1 AND o.customer_id IS NOT NULL
  ORDER BY o.customer_id, o.placed_at
), credited AS (
  SELECT a.channel, date_trunc('month', f.placed_at) AS month, SUM(a.credit) AS new_customers
  FROM first_orders f
  JOIN attributions a ON a.order_id = f.id
   AND a.model = 'last_non_direct_click' AND a.model_version = 3
  GROUP BY 1, 2
), spend AS (
  SELECT channel, date_trunc('month', spend_date) AS month, SUM(amount) AS spend
  FROM acquisition_spend WHERE merchant_id = $1
  GROUP BY 1, 2
)
SELECT s.channel, s.month, s.spend, c.new_customers,
       s.spend / NULLIF(c.new_customers, 0) AS attributed_cac,
       SUM(s.spend) OVER (PARTITION BY s.month)
         / NULLIF((SELECT COUNT(*) FROM first_orders f
                   WHERE date_trunc('month', f.placed_at) = s.month), 0) AS blended_cac
FROM spend s LEFT JOIN credited c USING (channel, month);
```

Design notes:

- **Capture touches at landing, server side.** The landing request carries the UTM parameters and click IDs; store them against a first-party ID and join them to the customer at checkout, because Safari's limits mean the browser may not have them later ([Ad Blockers and First-Party Collection](/docs/telemetry/collection#ad-blockers-and-first-party-collection)).
- **Respect consent at capture, not only at upload.** `consent_state` on the touch decides whether its click IDs may ever be sent anywhere; an opted-out visitor's touch counts in the store's own aggregates and leaves for no platform.
- **Attribution is recomputed, not edited.** A new model or version writes new rows; reports name the model and version they used, as [Operating Metrics](/books/user-generated-platforms/operating-metrics#definitions-as-code-restatements-as-rows) does for every metric.
- **Commissions lock after returns.** `locks_at` is set from the return window; a return before it reverses the conversion and reports the reversal to the network.
- **Every upload is a disclosure.** `conversion_uploads` records what fields went to which platform under which basis, which is the answer to a CCPA "who did you share my data with" request and to an auditor ([Customers, Accounts & Privacy](/books/commerce/customers-and-accounts#how-to-build-it)).
- **Platform claims stay in their own tables.** Imported platform-attributed conversions sit beside `attributed_sales` from retail media, labeled by platform and window, and never feed CAC.
- **Emit events:** `touchpoint.captured`, `attribution.computed`, `affiliate_conversion.locked` and `conversion_upload.sent`.

## Auditing

- **Every conversion upload,** with the fields sent, the consent basis, and the platform's response, available per customer for privacy requests.
- **Affiliate commissions and reversals,** reconciled to the network's invoice, with the order and return behind each.
- **Creator relationships and disclosures,** with the brief, the posts reviewed and any corrections requested.
- **Attribution model versions** and which reports used which, so a CAC quoted to investors can be reproduced.
- **Lift tests and MMM runs,** with their design, inputs and results, kept as long as budgets are defended with them.

## What This Means for the System You Build

- **Treat the product feed as ad targeting,** with margin labels and prices synced to the storefront.
- **Keep brand demand out of prospecting numbers,** with exclusions or separate campaigns.
- **Define existing customers yourself,** as a consented, refreshed audience, since the platforms stopped doing it.
- **Send conversions server to server from the order,** deduplicated with the browser, adjusted for returns, and only under consent.
- **Capture click IDs and UTM parameters at landing** and join them to the order on the server.
- **Pay affiliates on net sales after the return window,** and deduplicate credit across channels.
- **Require clear, in-content disclosure from every creator,** and keep evidence that you checked.
- **Run one named store-side attribution model,** keep platform claims separate, and ask customers how they heard.
- **Test incrementality by region,** starting with brand search, retargeting and coupon programs, and calibrate a mix model with the results.

## References

**Platform documentation**

- [Google Ads Help: About Shopping ads](https://support.google.com/google-ads/answer/2454022), Merchant Center data rather than keywords and the ad's contents
- [Google Ads Help: About Performance Max campaigns](https://support.google.com/google-ads/answer/10724817), inventory, channels and inputs
- [Google Ads Help: How Performance Max works with other campaigns](https://support.google.com/google-ads/answer/13810170), Ad Rank and exact-match Search priority
- [Google Ads Help: About enhanced conversions for web](https://support.google.com/google-ads/answer/9888145), first-party data, SHA-256 hashing and matching
- [Google Ads Help: Consent mode parameters](https://support.google.com/google-ads/answer/13802165), ad_user_data and ad_personalization
- [Google Ads Help: Customer Match consent in the EEA](https://support.google.com/google-ads/answer/14310715), both consent fields from March 2024
- [Google Ads Help: About attribution models](https://support.google.com/google-ads/answer/6259715), data-driven by default and the removed rule-based models
- [Google Ads Help: Upcoming changes to attribution models](https://support.google.com/google-ads/answer/13427716), the June and September 2023 dates and the 3% share
- [Google Ads Help: About Conversion Lift](https://support.google.com/google-ads/answer/12003020), user and geography groups and availability
- [Meta for Developers: Advantage+ campaigns](https://developers.facebook.com/documentation/ads-commerce/marketing-api/advantage-campaigns), sales campaigns replacing shopping campaigns and the existing-customer budget cap
- [Meta for Developers: Graph API v24.0 and Marketing API v24.0](https://developers.facebook.com/blog/post/2025/10/08/introducing-graph-api-v24-and-marketing-api-v24/), the end of new legacy shopping campaigns
- [Meta for Developers: Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api/), server events from an advertiser's systems
- [Meta for Developers: Deduplicate Pixel and server events](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events), event_id matching and the 48-hour window
- [Meta for Developers: Server event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event), action_source values and the 7-day event time
- [Meta for Developers: Customer information parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters), hashing and normalization
- [Meta for Developers: Dataset Quality API](https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api), Event Match Quality
- [Meta for Developers: Ads Insights API metric availability updates](https://developers.facebook.com/blog/post/2025/10/16/ads-insights-api-metric-availability-updates/), view windows removed January 12, 2026
- [Meta for Business: Click attribution update](https://www.facebook.com/business/news/click-attribution), link clicks only and engage-through attribution
- [impact.com: Online sale API integration](https://integrations.impact.com/integration-guides/for-brands/tracking-integrations/api-online-sale/introduction), the im_ref click ID, cookie lifetime and server conversions
- [Awin: Conversion API](https://help.awin.com/apis/apidocs/conversion-api), the awc cookie and the attribution window
- [Awin: ShareASale to Awin post-upgrade checks](https://resources.awin.com/shareasale-to-awin/advertiser-upgrade-prep-checklist/post-upgrade-checks), ShareASale's closure
- [Shopify Help Center: Collabs payments](https://help.shopify.com/en/manual/promoting-marketing/collabs/merchants/payments), links and codes, holding period and the processing fee
- [Chrome for Developers: Chrome Web Store affiliate ads policy update](https://developer.chrome.com/blog/cws-policy-update-affiliate-ads-2025), the March 2025 policy and June 10, 2025 enforcement

**Privacy and platforms**

- [Apple Developer: User privacy and data use](https://developer.apple.com/app-store/user-privacy-and-data-use/), the definition of tracking and the ATT requirement from iOS 14.5
- [Apple Developer: Ad attribution](https://developer.apple.com/app-store/ad-attribution/), AdAttributionKit, windows and crowd anonymity
- [WebKit: Tracking Prevention in WebKit](https://webkit.org/tracking-prevention/), the seven-day and 24-hour cookie caps
- [Apple Newsroom: New privacy and security features (June 5, 2023)](https://www.apple.com/newsroom/2023/06/apple-announces-powerful-new-privacy-and-security-features/), tracking parameters removed from links in Messages, Mail and Private Browsing
- [Meta: Fourth quarter 2021 earnings call transcript (PDF)](https://s21.q4cdn.com/399680738/files/doc_financials/2021/q4/Meta-Q4-2021-Earnings-Call-Transcript.pdf), the $10 billion iOS headwind and ecommerce slowdown
- [Google Privacy Sandbox: A new path for Privacy Sandbox (July 22, 2024)](https://privacysandbox.google.com/blog/privacy-sandbox-update), user choice instead of deprecation
- [Google Privacy Sandbox: Next steps (April 22, 2025)](https://privacysandbox.google.com/blog/privacy-sandbox-next-steps), no standalone prompt
- [Google Privacy Sandbox: Update on plans for Privacy Sandbox technologies (October 17, 2025)](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies), retired technologies and reasons

**Law and regulators**

- [FTC: Updated Endorsement Guides announcement (June 29, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements), the 2023 revisions
- [16 CFR 255.0](https://www.law.cornell.edu/cfr/text/16/255.0), the definition of clear and conspicuous
- [California SB 690 (2026), Chapter 976](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB690), limiting website and app pen register claims to the Attorney General
- [FTC: Disclosures 101 for social media influencers](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers), relationships, placement, wording, platform tools and video
- [FTC: Consumer Reviews and Testimonials Rule Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers), effective October 21, 2024 and influencer liability
- [FTC: Final rule banning fake reviews and testimonials (August 14, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), fake followers and views
- [FTC: Teami settlement (March 6, 2020)](https://www.ftc.gov/news-events/news/press-releases/2020/03/tea-marketer-misled-consumers-didnt-adequately-disclose-payments-well-known-influencers-ftc-alleges), undisclosed paid influencers and the judgment
- [N.D. Cal.: In re PayPal Honey, order granting motion to dismiss with leave to amend (PDF)](https://storage.courtlistener.com/recap/gov.uscourts.cand.441974/gov.uscourts.cand.441974.237.0.pdf), November 2025
- [N.D. Cal.: In re PayPal Honey, order denying motion to dismiss the second amended complaint (PDF)](https://storage.courtlistener.com/recap/gov.uscourts.cand.441974/gov.uscourts.cand.441974.277.0.pdf), June 22, 2026
- [E.D. Va.: In re Capital One affiliate marketing litigation, order on motion to dismiss (PDF)](https://www.cohenmilstein.com/wp-content/uploads/2025/03/MTD-Order-Capital-One-Financial-June-2-2025.pdf), counts dismissed and surviving, June 2, 2025

**Measurement**

- [Google: Meridian is now available to everyone (January 29, 2025)](https://blog.google/products/ads-commerce/meridian-marketing-mix-model-open-to-everyone/), open-source Bayesian MMM, reach and frequency, experiment priors
- [GitHub: google/meridian](https://github.com/google/meridian), geo-level data and calibration
- [Google Meridian: Set custom priors using past experiments](https://developers.google.com/meridian/docs/advanced-modeling/set-custom-priors-past-experiments), calibration and how MMMs and experiments differ
- [GitHub: facebookexperimental/Robyn](https://github.com/facebookexperimental/Robyn), ridge regression, adstock and saturation
- [GitHub: facebookincubator/GeoLift](https://github.com/facebookincubator/GeoLift), geo-level lift with synthetic control

**In practice**

- [Google: New Performance Max features (January 23, 2025)](https://blog.google/products/ads-commerce/new-performance-max-features-2025/), negative keywords, brand exclusions and new customer mode
- [Google: Channel performance reporting for Performance Max (April 30, 2025)](https://blog.google/products/ads-commerce/channel-performance-reporting-coming-to-performance-max/), channel and search-term reporting
