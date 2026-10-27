+++
title = "Listings, Search & Ranking"
description = "Listing schemas and quality scores, lifecycle states, product compliance fields, availability-aware geo search, ranking signals, indexing and cold start."
category = "User-Generated Platforms Industry"
order = 1825
part = "Peer-to-Peer Marketplaces"
tags = ["marketplaces", "listings", "search", "ranking", "digital-services-act"]
+++

A listing is a promise written by an amateur. The host describes the RV, photographs it on a cloudy afternoon, guesses at a price and picks amenities from a list; the seller snaps a jacket on the bed and types "barely worn." The marketplace then has to turn millions of these into something a guest can search by place and dates, compare like with like, and trust enough to pay for, while ranking them in an order that serves the guest, rewards hosts who behave well, and still gives a new listing a chance. Search is where the marketplace's two sides meet, and its ranking is the strongest lever the platform has over supply quality: hosts learn quickly what the ranking rewards.

The engineering is hard in three places. **The schema has to be structured enough to filter and compare,** yet loose enough that a towable trailer, a beach house and a vintage lamp are all listings. **Search has to be availability-aware:** a stays or rentals search returns only listings free for the requested dates, which joins a full-text and geo index with a calendar that changes every time anyone books. **Ranking has feedback loops:** what ranks gets booked, what gets booked earns reviews, and what earns reviews ranks, so new supply needs deliberate help. This chapter covers the listing schema and its quality, lifecycle states, the product-safety fields EU law requires for goods, availability-aware geo search, ranking signals and models, indexing, cold start, demand rerouting and promoted placement. It extends `listings` and `content_items` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Keyword search infrastructure in general is [Search & Discovery](/books/user-generated-platforms/search-and-discovery#the-index-and-the-moderation-clock), and feed ranking is [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#the-recommendation-pipeline); this chapter covers what marketplaces add.

## How the Platforms Do It

| Platform | What it publishes about listings | What it publishes about search and ranking |
| --- | --- | --- |
| **Airbnb** | A listing's star rating appears after three reviews | Moved search ranking from gradient-boosted trees to neural networks; published the lessons (KDD 2019) |
| **Outdoorsy** | Listing content policy; standardized add-ons and amenities; snooze, unpublish and remove states | Four factors: quality, popularity, price and location; personalized by browsing; new listings appear within 24 hours with a cold-start visibility boost |
| **Etsy** | $0.20 listing fee per four-month listing, auto-renewing | Unified embedding retrieval (graph, transformer and term embeddings in a two-tower model with approximate nearest neighbor serving): +5.58% search purchase rate in an A/B test |
| **eBay** | 2.5 billion live listings (2025) | Promoted Listings sold as paid placement in its search |
| **Vinted** | About 1 billion active searchable items | Moved from Elasticsearch to Vespa: about 20,000 requests a second at peak under 150 ms p99, time from update to searchable cut from 300 seconds to 5 |
| **Turo** | Search by location, vehicle type, availability, ratings and use case | Machine learning for search ranking and recommendations (S-1) |

The patterns:

- **Ranking rewards host behavior, openly.** Outdoorsy lists response speed, low cancellation rate and instant book among its quality and popularity factors and says so in its help center. Publishing the factors is a supply-management tool: hosts change behavior to rank.
- **Embeddings for recall, learned models for order.** The published engineering describes the same shape: retrieve candidates from embeddings or an index, then rank a shortlist with a learned model.
- **Freshness is a product requirement.** A listing that sold or booked must leave results in seconds, not minutes; Vinted's migration was justified largely by update latency.
- **New supply gets a deliberate boost.** Without one, ranking's feedback loop starves new listings of the bookings that would earn them reviews.

## The Listing Schema

The core model splits a listing into the content item (text, photos, author, moderation state, visibility) and the `listings` side table (category, bookable status, place, currency, base price, stock). Everything filterable or comparable beyond that is an attribute:

- **Standardized attributes, not free text.** Sleeping capacity, vehicle class, transmission, pets allowed, bedrooms, item condition, size, brand. Outdoorsy moved its add-ons and amenities to a standardized list in 2025 and 2026; a filter on "pet friendly" only works if the value is a field, not a sentence somewhere in a description.
- **A taxonomy per category.** An RV has a class and a length; a stay has bedrooms and beds; a garment has a size system that varies by country. Attributes are typed per category, and the category decides which are required.
- **Add-ons are listing offers.** Bike racks, generators, linens, delivery, early check-in: each an optional extra the guest can add, defined here and priced in [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees).
- **Photos are media assets.** Ordered `content_media` rows pointing at `media_assets`, with their own pipeline, perceptual hashes and moderation ([The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model)). Photo hashes are also a fraud signal: the same photos on two listings under different hosts is the classic hijacked-listing pattern ([Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud)).

The listing content policy is policy like any other ([Policy Is the Specification](/docs/security/trust-and-safety#policy-is-the-specification)): no contact details or external links in text or photos (they're how leakage starts; [Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews)), no misleading photos, photos of the actual item, accurate category. Enforcement runs through the same reports, queues and decisions as posts, because a listing is a content item.

### Product Compliance Fields for Goods

The DSA makes the listing form part of product-safety law for goods sold to EU consumers. Article 31 requires a marketplace's interface to let traders provide the pre-contractual information and product-safety information EU law requires, including the identity of the economic operator responsible for the product and product identification and labelling, and requires the marketplace to make best efforts to check the information before the listing goes live and to run random checks against official databases of illegal products. Article 32 requires that when a marketplace learns an illegal product or service was sold through it, it informs the consumers who bought it in the past six months (or, if it lacks their contact details, publishes the information).

The system consequences: compliance fields are typed and required per category and per market, not a free-text box; the pre-publication check and the random sampling are recorded, with the database version consulted; and every purchase keeps the listing revision it was bought from, so the Article 32 notice can find the buyers of exactly that product. The trader side (Article 30) is in [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding). Small platforms are exempt from these articles unless designated very large.

## Lifecycle States

Two state machines describe a listing, and keeping them separate is the core model's choice:

- **Visibility is the content item's state:** draft, pending review, published, hidden, removed (by moderation), deleted (by the author).
- **Bookability is the listing's status:** active, snoozed (temporarily off, calendar kept), sold out (goods with no stock), retired.

Platforms expose combinations under their own names. Outdoorsy distinguishes snoozing (temporary), unpublishing and removing a listing; Etsy listings expire after four months and auto-renew for another listing fee unless the seller turns renewal off. A renewal is a billing event and a lifecycle event at once, so it belongs in both histories.

What the lifecycle must record:

- **Who changed the state and why.** The host snoozed it, a moderator removed it under a policy, the eligibility check failed (an inspection lapsed), INFORM suspension stopped the seller's sales, the platform culled it for quality. The reason decides whether the host can undo it and whether it counts against them.
- **What a guest saw at booking.** A booking keeps the listing revision it was made against, so a misrepresentation claim compares the item to what was promised ([Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims); [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes)).
- **Supply culling is a lifecycle reason.** Marketplaces remove listings that underperform: Outdoorsy was reported in 2026 to have cut its RV inventory by about 45% over 18 months to focus on quality. A culled listing is retired with a reason, not deleted, because its bookings, reviews and claims remain.

## Listing Quality

A quality score is the platform's estimate of how likely a listing is to deliver a good trip or sale, and it feeds ranking, pricing and host coaching. Outdoorsy publishes the ingredients of its composite score (review count and rating, number of images, sleeping capacity and vehicle year) as the way its pricing tool compares like with like; its ranking's quality factor adds amenities, service history, low cancellation rate, instant book and pet-friendliness.

The score has three kinds of input, and the build keeps them apart:

| Input | Examples | Owner |
| --- | --- | --- |
| **Content completeness** | Photo count and resolution, required attributes filled, description length, compliance fields | This chapter |
| **Outcome history** | Rating and review count, claims, refunds, not-as-described cases | [Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews); [Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims); [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes) |
| **Host behavior** | Response rate and time, acceptance, host cancellations, instant book | [Availability & Booking](/books/user-generated-platforms/availability-and-booking); [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes) |

My rules: **the score is versioned and explained.** Store each computed score with the model version and its component values, so a host who asks why their listing dropped can be told which component moved, and so a change to the formula can be measured before it ships. **Don't let the score leak into eligibility.** A low score demotes; it doesn't remove. Removal is a moderation or eligibility decision with its own record.

## Availability-Aware Geo Search

A rental search is a query over three indexes at once: text and attributes (what), geography (where) and the calendar (when). The calendar is the hard one, because it changes every time any guest books anywhere.

The common shapes:

- **Filter by availability at query time.** The search index holds each listing's blocked ranges (or a per-day bitmap for the next year or two), updated from booking and calendar events, and the query excludes listings with any blocked day in the requested range. Exact for the index's freshness.
- **Re-check before showing a price.** The candidate list from the index is re-checked against the system of record for the top results, because the index lags and a booked listing shown as available is a failed booking ([Availability & Booking](/books/user-generated-platforms/availability-and-booking)).
- **Price for the dates, not the base price.** Ranking on price competitiveness needs the trip total for those dates (nightly overrides, length-of-stay discounts, fees), which is why Outdoorsy describes ranking on total trip cost and price relative to similar RVs nearby. [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees) owns the quote.

Geography has marketplace twists. Delivery radius makes a listing available in places it isn't parked: an RV host who delivers within 50 miles is a candidate for searches around a campground the RV has never visited. Place matters for law too: a listing's country and subdivision decide which fee display, tax and registration rules apply, and a search result must show the price those rules allow ([Fee Transparency and All-In Pricing](/books/property-tech/listings-and-marketing#fee-transparency-and-all-in-pricing)).

Goods search drops the calendar and adds stock and shipping: a sold-out listing leaves results immediately, and location matters as shipping cost and delivery time, or as a radius for local pickup marketplaces.

## Ranking Signals

The published factors across platforms group into a handful of families:

| Family | Signals | Published by |
| --- | --- | --- |
| **Relevance** | Text and attribute match, embeddings of query and listing | Etsy, Airbnb |
| **Quality** | Rating, reviews, photos, amenities, service history | Outdoorsy, Airbnb |
| **Host reliability** | Response speed, low cancellation rate, instant book | Outdoorsy |
| **Popularity** | Wishlist saves, booking frequency | Outdoorsy |
| **Price** | Total trip cost, price relative to similar nearby listings | Outdoorsy |
| **Location** | Distance from the searched place, delivery | Outdoorsy, Turo |
| **Personalization** | Browsing behavior, past bookings | Outdoorsy, Etsy |

Airbnb's published account of its search ranking describes moving from gradient-boosted decision trees, whose gains had plateaued, to neural networks, and the practical lessons of doing so. Etsy's paper describes the retrieval side: a two-tower model combining graph, transformer and term embeddings, served with approximate nearest neighbor search, which raised search purchase rate by 5.58% and site-wide conversion by 2.63% in an A/B test.

Three marketplace-specific concerns:

- **Ranking is a sanction.** Demoting hosts who cancel or don't respond is a penalty in effect even when nobody calls it one. Outdoorsy says repeated declines can hurt visibility. When ranking carries a behavior penalty, record it as a reason the host can see (as standing shows penalties in [Account Standing](/books/user-generated-platforms/accounts-and-identity#account-standing)), rather than an invisible weight.
- **Ranking is regulated.** DSA Article 27 requires online platforms that use recommender systems to set out the main parameters in their terms in plain language, why those parameters carry the weight they do, and any options users have to change them, with an easily reached control where several orderings exist; [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#the-digital-services-act) covers the regime. A published factor list like Outdoorsy's, with sorts by price, distance and rating beside the recommended order, is the shape that rule asks for.
- **Price signals can steer prices.** Ranking on price relative to nearby listings pushes hosts toward the market rate, and pricing tools built on pooled market data have drawn antitrust scrutiny in housing ([Revenue Management & Pricing](/books/property-tech/revenue-management#the-antitrust-record-as-of-october-2026)).

### Promoted Listings

Paid placement inside marketplace search is a major revenue line: eBay reported $1,993 million of advertising revenue in 2025, primarily fees sellers pay to promote listings, and Etsy sells on-site ads and offsite ads. In the result page the build questions are labeling (a promoted result must be marked as an ad), relevance floors (a promoted listing still has to match the query), and attribution (which sale the ad caused, which decides the fee). The economics belong to [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#promoted-listings-and-seller-ads) and [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#ads-on-user-content).

## Indexing

The search index is a projection of listings, attributes, calendars, prices and scores, fed by events. Vinted's published migration from Elasticsearch to Vespa gives the scale: about a billion active searchable items, peak traffic around 20,000 requests a second under 150 ms at p99, about 10,300 real-time updates a second daily, a pipeline from Kafka through Flink with a p99 update latency of about 4.6 seconds, a ranking depth of 200,000 candidates, and visibility of a new or changed item cut from 300 seconds to 5. It consolidated six Elasticsearch clusters of 20 data nodes each into one Vespa cluster of 60 content nodes.

The design rules:

- **The index is derived, never written directly.** Listing, calendar, price, stock, moderation and eligibility changes emit events through the outbox ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)); the indexer consumes them idempotently and in order per listing ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Removal is the fastest path.** A moderation removal, an INFORM suspension or a failed eligibility check takes a listing out of results before anything else is updated; a stale "available" is an annoyance, a stale "visible" after a takedown is a compliance failure.
- **Rebuilds are routine.** The index can be rebuilt from the system of record at any time, and is, whenever the schema or the ranking features change.

## Cold Start and Demand Rerouting

A new listing has no reviews, no bookings and no popularity, so a ranking trained on outcomes buries it. Outdoorsy says new listings appear within 24 hours and get a cold-start visibility boost. The boost is a ranking feature with an expiry (by age or by first bookings), recorded like any other, and measured: a boost that sends guests to new listings that then cancel or disappoint costs the marketplace more than it earns.

The opposite problem is demand that finds no supply. Outdoorsy's Smart Match turns a guest's unfulfilled request into bid requests to similar available hosts, filtered by vehicle type group, pets, guest count, price ceiling and delivery range. It's ranking run in reverse: from one demand record to a shortlist of supply, with the original request's constraints as hard filters. The records it needs are the request, each host invited, each response, and which one the guest took.

## How to Build It

```sql
CREATE TABLE listing_attributes (        -- standardized, typed attributes per category
  listing_id  UUID NOT NULL REFERENCES listings (content_item_id),
  attribute   TEXT NOT NULL,             -- 'sleeps', 'vehicle_class', 'pets_allowed', 'condition'
  value       TEXT NOT NULL,             -- typed by the attribute definition
  PRIMARY KEY (listing_id, attribute, value)  -- multi-valued attributes are several rows
);

CREATE TABLE attribute_definitions (     -- the taxonomy, as data
  attribute    TEXT NOT NULL,
  category     TEXT NOT NULL,            -- matches listings.category
  value_type   TEXT NOT NULL CHECK (value_type IN ('integer', 'boolean', 'enum', 'text')),
  allowed      TEXT[],                   -- for enum
  required_in  CHAR(2)[] NOT NULL DEFAULT '{}',  -- markets where it's mandatory
  filterable   BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (attribute, category)
);

CREATE TABLE listing_product_info (      -- DSA Article 31 fields for goods sold in the EU
  listing_id          UUID PRIMARY KEY REFERENCES listings (content_item_id),
  economic_operator   JSONB,             -- name and contact of the responsible operator
  product_identifier  TEXT,              -- model, batch or serial; GTIN where there is one
  safety_information  TEXT,
  labelling_asset_id  UUID REFERENCES media_assets (id),
  checked_at          TIMESTAMPTZ,       -- best-efforts check before going live
  checked_against     TEXT               -- database and version consulted
);

CREATE TABLE listing_status_changes (    -- every lifecycle change, by whom and why
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id     UUID NOT NULL REFERENCES listings (content_item_id),
  field          TEXT NOT NULL CHECK (field IN ('item_state', 'listing_status')),
  from_value     TEXT,
  to_value       TEXT NOT NULL,
  reason         TEXT NOT NULL CHECK (reason IN ('host', 'moderation', 'eligibility',
                   'trader_suspension', 'quality_cull', 'expiry', 'renewal', 'sold_out',
                   'account_closed')),
  actor          TEXT NOT NULL,          -- typed actor: 'account:<id>', 'system:eligibility'
  source_ref     UUID,                   -- the decision, check or penalty behind it
  changed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE listings
  ADD COLUMN expires_at  TIMESTAMPTZ,    -- goods listings that lapse and renew
  ADD COLUMN auto_renew  BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE bookings
  ADD COLUMN listing_revision_id UUID REFERENCES content_revisions (id);  -- what was bought

CREATE TABLE listing_quality_scores (    -- versioned and explained
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id     UUID NOT NULL REFERENCES listings (content_item_id),
  model_version  TEXT NOT NULL,
  score          NUMERIC(6,4) NOT NULL,
  components     JSONB NOT NULL,         -- {"photos": 0.9, "rating": 0.82, "response": 0.7, ...}
  computed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE search_impressions (        -- what was ranked, for audit, appeals and training
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  search_id      UUID NOT NULL,          -- one query execution
  listing_id     UUID NOT NULL REFERENCES listings (content_item_id),
  position       SMALLINT NOT NULL,
  promoted       BOOLEAN NOT NULL DEFAULT FALSE,
  ranker_version TEXT NOT NULL,
  boosts         TEXT[] NOT NULL DEFAULT '{}',  -- 'cold_start', ...
  demotions      TEXT[] NOT NULL DEFAULT '{}',  -- 'host_cancellations', ...
  shown_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE demand_reroutes (           -- an unfulfilled request offered to similar supply
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  origin_booking_id UUID NOT NULL REFERENCES bookings (id),  -- the declined or expired request
  listing_id     UUID NOT NULL REFERENCES listings (content_item_id),
  invited_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response       TEXT CHECK (response IN ('offered', 'declined', 'expired')),
  responded_at   TIMESTAMPTZ,
  converted_booking_id UUID REFERENCES bookings (id),
  UNIQUE (origin_booking_id, listing_id)
);
```

Design decisions behind it:

- **Attributes are rows with a taxonomy.** `attribute_definitions` says which attributes each category has, their types and where they're required, so the listing form, filters, search mapping and compliance checks read one definition. A new market's mandatory field is a data change.
- **Compliance fields have their own table.** Only goods sold to EU consumers need them; keeping them apart keeps the check, its timestamp and the database consulted together for the regulator.
- **Two states, one history.** `listing_status_changes` records both the item's visibility and the listing's bookability with a reason and a typed actor ([Typed Actors](/docs/architecture/audit-trails#typed-actors)), so a host's dashboard, a moderation appeal and an eligibility lapse tell one consistent story.
- **Bookings point at the revision they bought.** The Article 32 notice, a not-as-described case and a misrepresentation claim all compare against it.
- **Scores and impressions are logged with versions.** Ranking decisions are automated decisions about people's income; log enough to explain one ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)) and to train the next model on what was actually shown. Sample impressions if volume demands, but keep every demotion reason.
- **The index is a projection.** No table here is the index; it's rebuilt from listings, attributes, calendars, prices, scores and states through events.
- **Events:** `listing.published`, `listing.status_changed`, `listing.revised`, `listing.quality_scored`, `listing.expired` and `listing.renewed` feed the indexer, notifications and billing (renewal fees).

## Auditing

- **Listing revisions and states over time,** with who changed them and why, so a dispute, a takedown appeal or a regulator sees the listing as it was on a date.
- **Compliance checks for goods:** each pre-publication check and random sample with the database consulted, and each Article 32 notice with the buyers it reached.
- **Ranking explanations:** the published main parameters, the ranker and quality-score versions in force on each date, and each host's demotion reasons, for the DSA's recommender transparency duty and for hosts who contest a drop.
- **Promoted placements:** which results were ads, how they were labeled and what was charged.
- **Culls:** listings retired for quality, with the criteria version, because hosts contest them.

## What This Means for the System You Build

- **Make attributes typed rows backed by a taxonomy per category,** required per market, so filters, comparisons and compliance checks share one definition.
- **Keep visibility and bookability as separate states** with one history that records the reason and the actor for every change.
- **Point every booking at the listing revision it was made against.**
- **Add DSA Article 31 fields for goods sold in the EU,** check them before going live, sample against illegal-product databases, and be able to notify the past six months' buyers.
- **Version and explain the quality score;** let it demote, never silently remove.
- **Filter search by availability and price for the requested dates,** and re-check the top results against the system of record.
- **Treat ranking demotions as penalties the host can see,** and publish the main ranking parameters.
- **Feed the index from events,** with removals first, and rebuild it routinely.
- **Give new listings an expiring, measured cold-start boost,** and log impressions with ranker versions.

## References

**Law and regulation**

- [DSA Article 27: Recommender system transparency](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_27.html), main parameters in the terms, their relative importance, user options and ordering controls
- [DSA Article 31: Compliance by design](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_31.html), product information interface, best-efforts check before listing, random checks against official databases
- [DSA Article 32: Right to information](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_32.html), notifying buyers of the past six months about illegal products

**Engineering**

- [Haldar et al.: Applying Deep Learning to Airbnb Search (arXiv 1810.09591)](https://arxiv.org/abs/1810.09591v2), the move from gradient-boosted trees to neural networks and practical lessons (KDD 2019)
- [Etsy: Unified Embedding Based Personalized Retrieval in Etsy Search (arXiv 2306.04833)](https://arxiv.org/abs/2306.04833v2), two-tower retrieval with graph, transformer and term embeddings, ANN serving, A/B results
- [Vinted Engineering: Goodbye Elasticsearch, hello Vespa](https://vinted.engineering/2024/09/05/goodbye-elasticsearch-hello-vespa/), searchable items, request rate and latency, update throughput and latency, cluster consolidation, ranking depth, time to searchable

**Filings**

- [eBay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm), 2.5 billion live listings, advertising revenue from Promoted Listings
- [Turo: Form S-1/A, Amendment No. 12](https://www.sec.gov/Archives/edgar/data/1514587/000162828024047889/turoinc-sx1a12.htm), search by location, type, availability, ratings and use case; machine learning in ranking and recommendations

**Platform documentation**

- [Outdoorsy: How search results work](https://support.outdoorsy.com/hc/en-us/articles/37418429835291-How-Search-Results-Work-on-Outdoorsy), quality, popularity, price and location factors, personalization, sorts, 24-hour appearance and cold-start boost
- [Outdoorsy: How do I take down my listing](https://support.outdoorsy.com/hc/en-us/articles/51649803471515-How-do-I-take-down-my-listing-Snooze-Unpublish-Remove), snooze, unpublish and remove
- [Outdoorsy: Listing Content Policy](https://support.outdoorsy.com/hc/en-us/articles/37982981923355-Listing-Content-Policy), listing content rules
- [Outdoorsy: Updates to standardized add-ons and amenities](https://support.outdoorsy.com/hc/en-us/articles/46244333362843-FAQ-Updates-to-Standardized-Add-Ons-Amenities), the move to standardized lists
- [Outdoorsy: Smart Pricing FAQs](https://support.outdoorsy.com/hc/en-us/articles/48261397287067-What-is-Outdoorsy-Smart-Pricing-FAQs-for-Outdoorsy-Hosts), the composite listing-quality score's inputs
- [Outdoorsy: Smart Match](https://support.outdoorsy.com/hc/en-us/articles/37977085459099-What-is-Outdoorsy-s-Smart-Match-What-benefits-do-I-receive), unfulfilled requests converted to bid requests and their filters
- [Outdoorsy: Am I allowed to decline potential guests](https://support.outdoorsy.com/hc/en-us/articles/37918012902939-Am-I-allowed-to-decline-potential-Guests), repeated declines and visibility
- [Airbnb: How reviews work](https://www.airbnb.com/help/article/13), listing ratings shown after three reviews
- [Etsy: Fees & Payments Policy](https://www.etsy.com/legal/fees/), the four-month listing fee and auto-renewal, on-site and offsite ads

**Press**

- [OpenVan.camp: Outdoorsy pivots to broader mobility](https://openvan.camp/en/news/industry/outdoorsy-pivots-intros-broader-mobility), the reported 45% cut in RV inventory over 18 months
