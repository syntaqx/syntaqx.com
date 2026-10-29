+++
title = "Site Search & Merchandising"
nav_title = "Search & Merchandising"
description = "Search engines (Algolia, Elasticsearch, Constructor, Bloomreach, Shopify), facets, synonyms, ranking, merchandising rules, collections and recommendations."
category = "Commerce Industry"
order = 2309
part = "Catalog and Pricing"
tags = ["commerce", "search", "merchandising", "facets", "recommendations", "personalization"]
+++

Shoppers who search tell the store exactly what they want, in two or three words: "iphone 17 case," "clear," "mag safe," "a1234." Commerce search has to turn those words into a ranked page of items that are in stock, sellable in the shopper's market at a price they can see, filtered by the facets they click, and ordered partly by relevance and partly by what the merchant wants sold. It is a different problem from web search: the corpus is small and structured, the queries are short, model numbers and SKUs matter as much as words, an empty result page is a lost sale, and the ranking is a business decision that a merchandiser changes every week.

This chapter covers the search engines commerce runs on, indexing a catalog, relevance and ranking, synonyms and query understanding, facets and filters, collections and category pages, merchandising rules, recommendations, personalization and its limits, and measuring search. Search on marketplaces of people and services, with its availability and geo ranking, is User-Generated Platforms' [Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking); the storefront's faceted URLs, canonical tags and caching are the later Storefronts chapter's; paid placement in a retailer's search is [Retail Media & Marketplace Ads](/books/commerce/retail-media)'s. The chapter extends `products` and `items` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `collections`, `collection_items`, `search_synonyms` and `merchandising_rules`.

## How the Platforms Do It

As of October 2026, from vendor documentation and pricing pages:

| Engine | Kind | How it ranks | Merchandising controls | Published limits and prices |
| --- | --- | --- | --- | --- |
| **Shopify search and Search & Discovery** | Built into the platform, with a free app for control | Semantic search that "uses related words, concepts, categories, and other contexts"; Search & Discovery needs Shopify's network intelligence enabled | Product boosts for search terms, filters, synonyms, related and complementary product recommendations | 25 filters per store; 100 values shown per filter; no filters on collections above 5,000 products; 10 search terms per product boost; 10 manual related and 10 complementary products; predictive search returns at most 10 results |
| **Algolia** | Hosted search API | Tie-breaking criteria in order ("Typo, Geo, Words, Filters, Proximity, Attribute, and Exact"), then custom ranking on numeric or boolean attributes | Rules that pin, hide, boost or bury, filter, replace the query or return custom data, with validity periods | Free: 10,000 searches and 50,000 records a month; Grow: $0.50 per additional 1,000 searches and $0.40 per additional 1,000 records |
| **Elasticsearch and OpenSearch** | Open-source engines, self-run or managed | BM25 by default (k1 1.2, b 0.75), with function scores, vector search and reciprocal rank fusion for hybrid results; OpenSearch's Learning to Rank plugin rescoring with XGBoost or RankLib models | Whatever the merchant builds on queries, boosts and pinned queries | The cluster's capacity |
| **Constructor** | Hosted commerce search and discovery | "Driven by AI and real-time shopper behavior," with "reinforcement learning across a connected set of touchpoints" | Search, browse (category pages), recommendations and an AI shopping agent | Contract pricing |
| **Bloomreach Discovery** | Hosted commerce search and merchandising | Behavior-based, "constantly tracking user behavior and readjusting the search results sequence" in a customer's words, with Loomi AI | Search, category merchandising, recommendations and conversational shopping | Contract pricing |

Three patterns run through the table:

- **Relevance first, then business signals.** Algolia's model makes the order explicit: text-matching criteria decide first, and custom ranking (sales, margin, rating, stock) only breaks ties among records the text treats as equal. Elasticsearch and OpenSearch blend the two numerically. Either way, the merchant's priorities enter after the query has been matched, not instead of it.
- **Merchandising is rules on top of ranking.** Pin this item first for "case," hide that one, boost the new collection, bury out-of-stock: every engine has the same verbs, applied by query, category, context and date.
- **Behavioral engines sell the learning.** Constructor and Bloomreach rank from clicks, add-to-carts and purchases, and price themselves as revenue tools; the self-built alternative is Learning to Rank on the merchant's own events, which needs the same events and a team that can train and evaluate models.

## What Commerce Search Is

Commerce search differs from document search in ways that drive the design:

- **Short, structured queries.** "black case 17 pro" is a color, a product type and a fit; parsing them into attributes (and filtering) beats matching them as words in a description.
- **Identifiers.** Shoppers search by model number, part number, SKU and GTIN, which tokenizers split badly ("A3101" versus "a-3101"); identifier fields need their own analysis, exact and prefix matching.
- **Availability and price are part of the answer.** An item that's out of stock everywhere, not sold in the shopper's market or not visible to their price list shouldn't rank first, and often shouldn't appear.
- **Zero results is a failure mode with a cost.** An empty page loses the session. Synonyms, spelling tolerance, relaxed matching and a fallback to popular items in the inferred category all exist to avoid it.
- **The ranking has an owner.** Merchandisers change what sells first for business reasons (launches, overstock, margin, a supplier's co-op), and the engine has to make that a configuration, not a code change.

## Indexing the Catalog

The index is a read model of the catalog, rebuilt from the product, item, content, price and inventory tables:

- **One document per product, or per variant?** A product document with nested variants keeps one tile per product and filters on variant attributes ("in stock in size M in black"); a document per variant makes every color its own tile, which suits apparel where color is what shoppers browse. Salesforce's variation groups and "slicing," which "lets you define how variation products show in search results or on category pages," are the same decision as a platform setting ([Options and the Variant Explosion](/books/commerce/products-and-variants#options-and-the-variant-explosion)).
- **Index what's searched and filtered, not everything.** Titles, brand, category paths, option values, typed attributes from the PIM ([Attribute Models](/books/commerce/product-information#attribute-models)), identifiers, and the business signals used to rank. commercetools' product search indexes at most 50 product and 50 variant attributes, a reminder that indexing every attribute isn't free.
- **Prices and stock change faster than content.** Content changes daily; stock and prices change by the minute during a sale. Partial updates for price and availability, driven by events, keep the index fresh without reindexing the catalog ([Events & Async Messaging](/docs/architecture/events)).
- **Markets and price lists multiply the index.** A store selling in six markets with B2B price lists either indexes a document per market (and keeps confidential B2B prices out of any public index) or indexes availability and price per market as fields and filters at query time. B2B contract prices that are confidential ([Price Lists, Price Books and B2B Prices](/books/commerce/pricing#price-lists-price-books-and-b2b-prices)) are fetched at render from the pricing service, not stored in a search index any visitor can query.
- **Rebuilds are routine.** Mapping changes, analyzer changes and synonym changes made at index time all mean reindexing; build the new index beside the old one and switch an alias, so search never serves a half-built index.

## Relevance and Ranking

A search result's position comes from two kinds of signal:

- **Text relevance.** How well the query matches the document: BM25 in Elasticsearch and OpenSearch, where `k1` "controls non-linear term frequency normalization" (default 1.2) and `b` controls "to what degree document length normalizes tf values" (default 0.75); Algolia's ordered criteria (typos, geo, words matched, filters, proximity, which attribute matched, exactness). Matching in the title counts more than in the description; an exact model number match outranks everything.
- **Business signals.** Sales velocity, conversion rate, revenue per view, margin, rating, return rate, newness, stock depth. Algolia's custom ranking takes "any boolean or numeric attribute" and warns that "if a custom ranking attribute is too precise, it can prevent other attributes from influencing the ranking," which is why its guidance is to round ratings and similar values into buckets.

Three techniques extend the basics:

- **Hybrid lexical and vector search.** Embedding queries and products catches meaning that words miss ("waterproof" for "rain jacket"); lexical matching catches identifiers that embeddings blur. Elasticsearch combines them with reciprocal rank fusion, "a method for combining multiple result sets with different relevance indicators" with the formula `1.0 / (k + rank)` summed per document and `k` defaulting to 60.
- **Learning to rank.** OpenSearch's plugin "enables you to use machine learning (ML) and behavioral data to fine-tune the relevance of documents," with "models from the XGBoost and RankLib libraries" that "rescore the search results": the engine retrieves candidates, and a model trained on clicks and purchases reorders the top of the list.
- **Behavior from the vendor.** Constructor and Bloomreach do the same learning as a service, on the events the storefront sends them.

The general pattern of scoring candidates and folding several objectives into one order is the playbook's [Weighing Objectives](/docs/architecture/weighing-objectives); the marketplace version, with seller quality and promoted listings, is [Ranking Signals](/books/user-generated-platforms/listings-search-and-ranking#ranking-signals). My default for a store: lexical relevance with identifier fields, business signals as bucketed tie-breakers, out-of-stock items demoted (not hidden, unless the merchant decides), and learning to rank only once there are enough search sessions to train and evaluate on.

## Synonyms, Spelling and Query Understanding

Shoppers use different words from the catalog. The tools:

- **Synonyms.** Elasticsearch distinguishes equivalent mappings ("commas to group interchangeable terms": tee, t-shirt, tshirt) from explicit mappings ("=> to specify one-way replacements": "iphone case => phone case" but not the reverse). One-way synonyms matter in commerce: a search for the broad term shouldn't flood with the narrow one, and a search for a competitor's brand name shouldn't silently match the merchant's own products without the merchant deciding to. Elasticsearch recommends search-time synonyms "because you can update your synonym sets without reindexing."
- **Typo tolerance.** Algolia's first criterion is typos; most engines allow one or two edits by word length. Typo tolerance should be off for identifiers, where "A3101" and "A3110" are different phones.
- **Query understanding.** Detecting that "black" is a color, "17 pro" a fit and "case" a category, and turning them into filters or boosts. Algolia's Rules can "apply filters or optionalFilters matching the query"; Shopify's semantic search uses "related words, concepts, categories, and other contexts."
- **Redirects.** Some queries aren't searches: "returns," "track order," "gift cards." A rule that sends them to the right page beats any result list.
- **Zero-result handling.** Relax the query (drop the least important word), suggest a correction, and show the category the query most likely meant; log the query either way, because the zero-result report is the synonym backlog.

Synonyms and rules are merchant configuration with real effects, so they're versioned rows with an owner, not a file on a server ([How to Build It](#how-to-build-it)).

## Facets and Filters

Facets are the filters beside the results (brand, price, color, size, compatibility, rating), with a count for each value. They're only as good as the attributes behind them, which is why clean option values and typed attributes in the catalog matter ([Products, Variants & Bundles](/books/commerce/products-and-variants#options-and-the-variant-explosion), [Product Information & Content](/books/commerce/product-information#attribute-models)):

- **Sources.** Shopify's filters come from standard fields ("Availability, Category, Price, Product type, Tags, and Vendor"), product options, and product, category and variant metafields.
- **Limits.** Shopify allows "a maximum of 25 filters for your store," shows at most 100 values per filter, and doesn't display filters on collections with more than 5,000 products. Algolia returns 100 values per facet by default and at most 1,000.
- **Counts and disjunction.** Selecting "black" within color should keep showing the counts for other colors (an OR within the facet), while narrowing every other facet (an AND across facets). Algolia's documentation notes the engine handles disjunctive counts "differently to keep a consistent user experience," and that the logic lives in its client libraries; any engine needs the same two queries.
- **Facets by category.** Screen size is a facet for monitors and noise for cables. Facets should come from the category's attribute requirements, not one global list ([Taxonomies](/books/commerce/product-information#taxonomies)).
- **Variant-aware filtering.** "Size M, in stock" must mean that one variant is both size M and in stock, not that the product has some M variant and some in-stock variant. Nested variant documents, or one document per variant, give the right answer; flattened arrays don't.

Faceted navigation also generates URLs, and a crawler that follows every combination of filters can index millions of near-duplicate pages; canonical URLs and crawl rules for facets are the later Storefronts chapter's.

## Collections and Category Pages

A **collection** is a merchandised set of products shown on its own page: a category ("Screen Protectors"), a theme ("Gifts under $50"), a launch ("New for iPhone 17"), a sale. Collections are distinct from both taxonomies ([Taxonomies](/books/commerce/product-information#taxonomies)) and search results:

- **Manual collections** list products by hand, in a position the merchandiser sets.
- **Rule-based collections** are a saved query over attributes (brand is X, tag includes "sale," price under $50, created in the last 30 days), re-evaluated as the catalog changes; manual positions can still pin a few items at the top.
- **Category pages are search without a query.** Constructor sells "browse" separately because a category page is ranked like a search result: relevance is replaced by the collection's rule, and business signals and merchandising rules do the rest.
- **Sort orders** (featured, best selling, newest, price low to high, rating) are per collection; "featured" is the merchandiser's order, and it's the default most shoppers see.

Collections drive navigation, landing pages for campaigns, promotion targets ([Discount Engines](/books/commerce/promotions-and-gift-cards#discount-engines)) and feeds. A collection used as a discount target must evaluate the same way in the storefront and in the cart, which is a reason to compute rule-based membership into stored rows rather than evaluate the rule separately in each place.

## Merchandising Rules

Merchandising is the merchant overriding the ranking on purpose. The verbs are the same across engines:

- **Pin** an item to a position for a query or collection. Algolia: "Insert an item at a specific position."
- **Hide** an item from a query. Algolia: "Remove a specific result from the list of results."
- **Boost or bury** by attribute: new arrivals up, clearance down, a brand up during its campaign. Shopify's product boosts attach up to 10 search terms to a product.
- **Filter or redirect** by query: "mag safe" filters to MagSafe-compatible items; "returns" redirects.
- **Inject content:** a banner or a guide in the results. Algolia's Rules can "return custom data," which the storefront renders.

Rules have conditions (a query pattern, a category, a context such as device, market or customer segment, applied filters) and, in Algolia's words, a "validity period" for a temporary rule. Design rules that keep merchandising from rotting the search:

- **Every rule has an owner and an end date.** Pins and boosts outlive the campaign that created them; a rule without an expiry is a ranking bug a year later.
- **Rules apply after relevance, within limits.** A pinned item still has to match the query and be available; a boost moves an item up the results, it doesn't pull in items that don't match.
- **Paid placement is labeled.** When a supplier pays for position (co-op funds in retail, sponsored products on a retailer's site), the result is an ad, and the marketplace practice is labeling, relevance floors and attribution ([Promoted Listings](/books/user-generated-platforms/listings-search-and-ranking#promoted-listings)). Keep paid rules separate from editorial ones in the data.
- **Rules are tested like code.** A set of saved queries with expected top results, run when rules or synonyms change, catches a rule that buries the best seller.

## Recommendations

Recommendations are merchandising computed per item or per shopper:

- **Related (similar) items:** alternatives to the one being viewed. Shopify generates them "automatically ... for each product in your store" from purchase history, product descriptions (English storefronts only) and related collections, and lets merchants select up to 10 manually.
- **Complementary items:** things bought with it (a screen protector with a case). Shopify's complementary recommendations are "a list of complementary product recommendations that you manually select," up to 10.
- **Frequently bought together, recently viewed, trending, personalized ("for you"),** from co-purchase statistics, session history and behavioral models; Constructor and Bloomreach sell these with search.

The general machinery (candidate generation, ranking models, cold start, feedback loops) is User-Generated Platforms' [The Recommendation Pipeline](/books/user-generated-platforms/feeds-and-recommendations#the-recommendation-pipeline) and [Cold Start](/books/user-generated-platforms/feeds-and-recommendations#cold-start). The commerce constraints: recommend only items that are available and sellable to this shopper, respect exclusions the merchant sets (never recommend a competitor's compatible accessory, an age-restricted item to a logged-out shopper, or a recalled product), and prefer complementary items that fit what's in the cart (the screen protector for the phone the case fits, which needs compatibility as a typed attribute).

## Personalization and Its Limits

Personalized search reorders results by what is known about the shopper: past purchases, viewed categories, brand affinity, size. Algolia's personalization "uses a user's past behavior to find the most relevant results" and "promotes the results that best match each user's affinities," with a "Personalization impact" setting that at 100 puts personalization above the merchant's own business relevance.

Personalizing **order** is different from personalizing **price**. Reordering results by affinity is ordinary merchandising; setting a different price from the same data is the surveillance pricing that New York, Maryland, Connecticut and New Jersey now regulate ([Dynamic and Personalized Pricing](/books/commerce/pricing#dynamic-and-personalized-pricing)). Keep the two in separate systems so ranking features can't leak into price, and so a regulator's question about one doesn't require auditing the other.

Personalization still has rules of its own:

- **Recommender transparency.** The EU Digital Services Act requires online platforms that use recommender systems to explain their main parameters, and very large platforms to offer an option not based on profiling ([Feed Rules from Regulation](/books/user-generated-platforms/feeds-and-recommendations#feed-rules-from-regulation)). A marketplace's product recommendations are recommender systems in that sense; for any store, a non-profiled default is cheap to build in.
- **Consent and privacy.** Behavioral data for personalization is personal data under state privacy laws and GDPR; the consent model is the later Customers, Accounts & Privacy chapter's.
- **Query logs are personal data.** A search history says what someone was looking for, so raw queries tied to a shopper are kept briefly and aggregated ([Query Logs Are Personal Data](/books/user-generated-platforms/search-and-discovery#query-logs-are-personal-data)).

## Measuring Search

Search earns its budget through a handful of measures, each defined once and computed from search events ([One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric)):

- **Zero-result rate:** searches returning nothing, as a share of searches; the list of those queries is the synonym and catalog backlog.
- **Click-through rate and position of first click:** whether the top of the page is right.
- **Search conversion and revenue per search:** orders and revenue from sessions that searched, attributed by a stated window.
- **Refinement rate:** how often shoppers reformulate or add filters, a sign the first results missed.
- **Exit rate from search:** sessions that searched and left.

Changes to ranking, synonyms or rules are tested against these, ideally as A/B tests with the arm recorded on each search event, and replayed against saved queries before release ([Replay and Shadow Testing](/docs/architecture/weighing-objectives#replay-and-shadow-testing)). Vendor claims of conversion lifts (Constructor quotes a customer's "13% lift in ecommerce conversions") are each vendor's own measurement and are the case for running the test yourself.

## How to Build It

Collections with stored membership, synonyms and merchandising rules as versioned data, extending `products` and `items` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model):

```sql
ALTER TABLE products
  ADD COLUMN search_boost SMALLINT NOT NULL DEFAULT 0,  -- a merchandiser's manual nudge
  ADD COLUMN searchable   BOOLEAN NOT NULL DEFAULT TRUE;  -- false: unlisted, parts, B2B-only

ALTER TABLE items
  ADD COLUMN search_terms TEXT[] NOT NULL DEFAULT '{}';   -- extra terms, e.g. model numbers

CREATE TABLE collections (                   -- a merchandised set with its own page
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  handle       TEXT NOT NULL,
  title        TEXT NOT NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('manual', 'rule')),
  rule         JSONB,                        -- for 'rule': the saved query over attributes
  default_sort TEXT NOT NULL DEFAULT 'featured' CHECK (default_sort IN ('featured',
                 'best_selling', 'newest', 'price_asc', 'price_desc', 'rating')),
  markets      TEXT[],                       -- null: every market
  status       TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  UNIQUE (merchant_id, handle),
  CHECK ((kind = 'rule') = (rule IS NOT NULL))
);

CREATE TABLE collection_items (              -- membership, stored even for rule collections
  collection_id UUID NOT NULL REFERENCES collections (id),
  product_id    UUID NOT NULL REFERENCES products (id),
  source        TEXT NOT NULL CHECK (source IN ('manual', 'rule')),
  pinned_position SMALLINT,                  -- null: ranked by the sort order
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, product_id)
);

CREATE TABLE search_synonyms (               -- versioned, owned, applied at search time
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id UUID NOT NULL REFERENCES merchants (id),
  kind        TEXT NOT NULL CHECK (kind IN ('equivalent', 'one_way')),
  terms       TEXT[] NOT NULL,               -- equivalent: all terms; one_way: the inputs
  replacement TEXT[],                        -- one_way: what they expand to
  locale      TEXT NOT NULL DEFAULT 'en',
  owner       UUID NOT NULL,
  reason      TEXT,                          -- often a zero-result query
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'one_way') = (replacement IS NOT NULL))
);

CREATE TABLE merchandising_rules (           -- pin, hide, boost, bury, filter, redirect, banner
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id   UUID NOT NULL REFERENCES merchants (id),
  version       INT NOT NULL DEFAULT 1,
  scope         TEXT NOT NULL CHECK (scope IN ('query', 'collection', 'recommendation')),
  condition     JSONB NOT NULL,              -- query pattern and anchoring, collection ID,
                                             -- context (market, device, segment), filters
  action        TEXT NOT NULL CHECK (action IN ('pin', 'hide', 'boost', 'bury', 'filter',
                  'redirect', 'banner')),
  params        JSONB NOT NULL,              -- items and positions, attribute and weight, URL
  paid          BOOLEAN NOT NULL DEFAULT FALSE,  -- a supplier paid; render as sponsored
  funding_ref   TEXT,                        -- the co-op or ad agreement when paid
  priority      SMALLINT NOT NULL DEFAULT 100,
  valid_during  TSTZRANGE NOT NULL,          -- every rule ends
  owner         UUID NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('draft', 'active', 'ended')),
  CHECK (NOT upper_inf(valid_during)),
  CHECK (NOT paid OR funding_ref IS NOT NULL)
);

-- Rules still active past their campaign, or ending this week, for the owner to review.
SELECT id, action, condition, owner, upper(valid_during) AS ends
FROM merchandising_rules
WHERE status = 'active' AND upper(valid_during) < NOW() + INTERVAL '7 days';
```

Design notes:

- **The index is a projection.** Products, items, attribute values, collection membership, prices per market and availability per location are projected into search documents by a consumer of catalog, price and inventory events; the index is never written to directly ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).
- **Rule collections store their membership,** recomputed when the catalog changes, so the storefront, the cart's discount targeting and the feeds read the same set.
- **Synonyms and rules are pushed to the engine from these tables,** so the engine's configuration can be rebuilt, diffed and rolled back. A hosted engine's dashboard is a convenient editor and a poor system of record.
- **Every rule ends.** The check constraint refuses an open-ended rule; the query above is the weekly review.
- **Search events are logged with the arm,** the rules that fired and the results shown, for measurement and replay; raw queries tied to a shopper follow the privacy retention window.

## Auditing

- **Which rules, synonyms and boosts were active when,** with owners and versions, so "why did this product disappear from search" has an answer.
- **Paid placements** with their funding agreement and the label shown, because a supplier, an auditor or a regulator may ask which results were ads.
- **Search and recommendation decisions for a session,** kept for the measurement window and then aggregated, including the model or ranking version.
- **Exclusions** (recalled, restricted, out-of-market items) and when they took effect in the index ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Treat search as a projection of the catalog,** updated by events, with price and stock fresher than content and confidential prices never indexed.
- **Rank by relevance first,** with identifier fields and bucketed business signals as tie-breakers.
- **Keep synonyms one-way unless they're truly equivalent,** apply them at search time, and work the zero-result report weekly.
- **Build facets from typed attributes per category,** with disjunctive counts and variant-aware filters.
- **Store collection membership,** including for rule-based collections, so every surface agrees.
- **Make every merchandising rule owned, versioned and time-bound,** label paid placement, and test rules against saved queries.
- **Recommend only what's available and allowed** for the shopper, with compatibility as data.
- **Personalize order, not price,** in separate systems, with a non-profiled default available.
- **Measure zero-result rate, click-through, conversion and revenue per search** from one definition each, and A/B test ranking changes.

## References

**Platform and vendor documentation**

- [Shopify Help Center: Search & Discovery filters](https://help.shopify.com/en/manual/online-store/search-and-discovery/filters), filter sources and limits
- [Shopify Help Center: Search & Discovery search settings](https://help.shopify.com/en/manual/online-store/search-and-discovery/synonyms), semantic search and the product boost term limit
- [Shopify Help Center: Product recommendations](https://help.shopify.com/en/manual/online-store/search-and-discovery/product-recommendations), related and complementary products and their limits
- [Shopify Help Center: Storefront search](https://help.shopify.com/en/manual/online-store/storefront-search), core search and the network intelligence requirement for the app
- [Shopify: predictiveSearch](https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch), result types and the 10-result limit
- [Algolia: Custom ranking](https://www.algolia.com/doc/guides/managing-results/must-do/custom-ranking/), the default criteria, custom ranking as the last tie-breaker and rounding
- [Algolia: Rules overview](https://www.algolia.com/doc/guides/managing-results/rules/rules-overview/), pin, hide, boost, filters, query replacement, custom data, conditions and validity periods
- [Algolia: Faceting](https://www.algolia.com/doc/guides/managing-results/refine-results/faceting/), facet counts, values per facet and disjunctive faceting
- [Algolia: What is personalization](https://www.algolia.com/doc/guides/personalization/what-is-personalization/), affinities and personalization impact
- [Algolia: Pricing](https://www.algolia.com/pricing/), free and Grow plan allowances and overage prices
- [Elasticsearch: Similarity module](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-similarity.html), BM25 and its defaults
- [Elasticsearch: Search with synonyms](https://www.elastic.co/docs/solutions/search/full-text/search-with-synonyms), equivalent and explicit mappings, synonym sets and search-time synonyms
- [Elasticsearch: Reciprocal rank fusion](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion), the formula and rank constant
- [OpenSearch: Learning to Rank](https://docs.opensearch.org/latest/search-plugins/ltr/index/), behavioral features and XGBoost and RankLib models that rescore results
- [Constructor](https://constructor.com/), search, browse, recommendations, the AI shopping agent and the customer conversion claim
- [Bloomreach: Discovery](https://www.bloomreach.com/en/products/discovery), commerce search, Loomi AI and behavior-based ordering
- [Salesforce Trailhead: Variation groups and slicing](https://trailhead.salesforce.com/content/learn/modules/b2c-catalog-category-product/b2c-configure-variation-groups-slicing), how variants show in search and category pages
- [commercetools: Limits](https://docs.commercetools.com/api/limits), searchable product and variant attributes
