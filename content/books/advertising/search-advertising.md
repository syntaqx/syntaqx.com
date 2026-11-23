+++
title = "Search Advertising"
description = "Google Ads, Microsoft and Apple Ads: keywords and match types, Ad Rank and the price of a click, Quality Score as a diagnostic, Performance Max and AI Max."
category = "Advertising Industry"
order = 2943
part = "Walled Gardens"
tags = ["advertising", "search", "walled-gardens", "auctions", "data-model"]
+++

Search advertising sells a place next to the answer to a question someone just typed. The advertiser bids on keywords, the platform matches each search to the keywords and ads that fit it, runs an auction among them, shows the winners above or below the organic results, and charges per click. It is still the largest advertising format online: IAB and PwC count $114.2 billion of US search advertising in 2025, up 11%, and Alphabet reported $224.5 billion of Google Search & other revenue for the year, with paid clicks up 6% and cost per click up 7%.

Search is hard to build for three reasons. The unit of demand is a query no advertiser wrote: millions of distinct searches a day, most of them rare, matched to keywords by meaning rather than spelling, so the matching system decides which advertisers compete before the auction does. The price is set by a ranking that multiplies the bid by the platform's own predictions, so a click's price depends on models the advertiser sees only through a diagnostic score. And the platforms have automated most of the levers (match types broaden, bids are set by Smart Bidding, campaigns like Performance Max choose the query, the creative and the channel), which moves the advertiser's control from setting values to setting constraints and reading reports.

This chapter covers the platforms, keywords and match types, how Ad Rank orders ads and sets the price of a click, Quality Score and why it is a diagnostic, assets, search terms and negatives, the automated campaign types (Performance Max, AI Max and the end of Dynamic Search Ads), app store search on Apple Ads, and the US search case as it bears on ads, then the records a search ad platform keeps. It extends `line_items`, `auctions` and `creatives` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), with `auction_slots` and the effective-bid columns on `bids` from [Auction Mechanics](/books/advertising/auction-mechanics#how-to-build-it). The theory of the generalized second-price auction is [The Generalized Second-Price Auction](/books/advertising/auction-mechanics#the-generalized-second-price-auction); bid strategies are [Automated Bidding](/books/advertising/automated-bidding); the click as a billing event is [Pricing Models](/books/advertising/pricing-models#billing-events); search on a retailer's own site is [Retail Media Networks](/books/advertising/retail-media-networks); the advertiser's workflow (brand exclusions, feeding margin, Shopping feeds) is Commerce's [Google: Shopping and Performance Max](/books/commerce/acquisition-and-attribution#google-shopping-and-performance-max).

## How the Platforms Do It

As of November 2026:

| Platform | Inventory | Pricing | Auction | Scale disclosed |
| --- | --- | --- | --- | --- |
| **Amazon Ads** | Sponsored Products and Sponsored Brands in Amazon's search results | Cost per click; vCPM or reserved share of voice for Sponsored Brands | "A form of generalized 'second-price' auction" with hard and soft reserves, by Amazon's account | Advertising services $68.6 billion in 2025, across formats |
| **Apple Ads** | App Store search results, Search tab, Today tab, product pages; Maps and News added in 2026 | Cost per tap (Advanced), cost per install (Basic) | Not described on the pages opened | Apple doesn't report advertising revenue separately |
| **eBay Promoted Listings** | eBay search: Priority (cost per click), General (cost per sale) | CPC "depending on the second price auction results"; CPS at a 2-100% rate | Second price for Priority | Commerce's Retail Media chapter covers eBay's advertising revenue |
| **Google Ads** | Google Search, search partners, and through Performance Max all Google inventory | Cost per click on Search; other units elsewhere | Ad Rank (bid, auction-time quality, thresholds, competitiveness, context, asset impact); pay the minimum to clear thresholds and the ad below | Search & other $224.5 billion in 2025 |
| **Microsoft Advertising** | Bing, Copilot, Microsoft News, Microsoft Edge and third-party affiliates (the "Search advertising" line) | Cost per click | Not described on pages opened | Search advertising revenue excluding TAC up 12% in fiscal 2026; dollar amount not located in the 10-K text reached |

Three patterns:

- **Keyword auctions run inside every large walled garden.** General search, app stores, marketplaces and retailers all sell placement against a typed query with a cost-per-click auction that ranks by more than price.
- **Matching is now the platform's model, not the advertiser's string.** Google defines match types by meaning ("the same meaning or same intent"), Performance Max uses search themes rather than keywords, and AI Max extends matching beyond the keyword list; Apple's Search Match picks keywords for Maximize Conversions campaigns.
- **Search is a regulated market now.** The US court found in August 2024 that Google is a monopolist in search and search advertising, and the September 2025 remedies require search text ads syndication to certain competitors.

## Keywords and Match Types

A keyword is a phrase an advertiser bids on, with a match type that decides which searches it can match. Google's three, as defined today:

- **Broad match** (the default, entered plain): "Ads may show on searches that are related to your keyword", including searches that don't contain it.
- **Phrase match** (in quotes, "tennis shoes"): "Ads may show on searches that include the meaning of your keyword."
- **Exact match** (in brackets, [red shoe]): "Ads may show on searches that have the same meaning or same intent as the keyword."

Two things changed over the last decade and matter to anyone modeling this. Matching moved from strings to meaning: an exact match keyword now matches searches with the same intent, so "exact" no longer means identical characters, and the set of searches a keyword matched last month is not a fixed property of the keyword. And the broader types contain the narrower ones: Google says broader match types capture all the queries of narrower types plus more, and treats similar broad keywords ("red car" and "car red") as duplicates, using only "the one with the higher Ad Rank."

When several keywords in one account could match a search, the platform has to choose which one enters the auction, because an advertiser doesn't bid against itself. Google's order:

1. "Exact match keywords that are identical to the search term are prioritized."
2. "Phrase and broad match keywords (including AI Max) or search themes that are identical to the search term" share priority, including identical Performance Max search themes.
3. Among the rest, only the most relevant ad groups, as Google's systems judge them, are considered.
4. Ties go to "the ad or asset group that generates the ad with the highest Ad Rank."

For a platform builder, the lesson is that keyword selection is a pre-auction stage with its own rules and its own logs. The search-to-keyword match, the candidate keywords considered and the one chosen per advertiser are records, because "why did my exact keyword not serve" is the most common support question in search advertising, and the answer is usually that another keyword or campaign in the same account won the internal selection.

**Negative keywords** exclude: "You can use negative keywords to exclude your ads from showing on searches with that term." Google notes that "negative keyword match types behave differently from positive match types", so a negative list can't be read with the positive definitions. Negatives live at the ad group, campaign and account level, often in shared lists, and Performance Max now accepts them along with brand exclusions.

## Ad Rank and the Price of a Click

Google's Ad Rank "is a set of values that are used to determine whether your ads are eligible to show" and, if eligible, where. Google lists six factors: the bid, the quality of the ads and landing page, the Ad Rank thresholds, the competitiveness of the auction, the context of the person's search, and "the expected impact from your ad assets and other ad formats." Quality is measured at auction time ("auction-time measurements like expected CTR, ad relevance, and landing page experience"). Ad Rank "is calculated every time a user does a search", twice per auction (eligibility, then ranking), and again for different positions on the page.

**Thresholds** are minimum Ad Ranks to show at all and to show in a given location. Google's example uses a minimum of 0 to appear anywhere and 40 to appear in the top location, and says ad quality helps set the threshold an ad faces. They behave like per-position reserve prices that vary by query and advertiser quality.

**The price.** Actual cost per click is "the final amount you're charged for a click": you "only pay what's minimally required to clear the Ad Rank thresholds" and beat the Ad Rank of the advertiser directly below, or "only pay the reserve price" if no eligible advertiser is below, "rounded up to the nearest billable unit, which in the U.S. is $0.01." The maximum CPC caps it, "unless you're using automated bidding tools" such as Enhanced CPC, or a bid adjustment raises it. Google's worked example: Ad Ranks of 80, 50, 30, 10 and 5; a threshold of 40 above the results and 8 below. The 80 and 50 clear the top threshold and show above the results, the 80 paying just enough to beat 50 and the 50 just enough to beat 40; the 30 and 10 show below, the 30 paying just enough to beat 10 and the 10 just enough to beat 8; the 5 doesn't show.

That is a generalized second-price auction with quality weighting and per-position reserves. In GSP terms, the price per click for an ad is the next ad's effective bid (or the threshold) divided by the ad's own quality, so a higher-quality ad pays less for the same position (Google: "Higher quality ads can often lead to lower CPCs"). [The Generalized Second-Price Auction](/books/advertising/auction-mechanics#the-generalized-second-price-auction) works the arithmetic and code, and [VCG](/books/advertising/auction-mechanics#vcg) why GSP bidders shade. Two consequences for platform builders:

- **The auction has several blocks.** Ads above the organic results and ads below are separate positions with separate thresholds; a search results page is a multi-slot auction where the top block's threshold can be the binding price. Store each awarded position with its price and basis (`auction_slots`), not one clearing price per auction.
- **The bid is often not the advertiser's.** With Smart Bidding the platform sets the bid per auction from the advertiser's target and its own predictions, so the bid, the quality term and the price are all computed by the platform. The MRC's auction standards ask closed-loop auctioneers to disclose and report bid factors and relevance scores for that reason ([Quality-Weighted Ranking](/books/advertising/auction-mechanics#quality-weighted-ranking)).

## Quality Score as a Diagnostic

Quality Score is the number advertisers see, and the most misunderstood one in search. Google: scores are "measured on a scale from 1-10 and available at the keyword level", built from three components ("Expected clickthrough rate (CTR)", "Ad relevance" and "Landing page experience"), each rated "Above average", "Average" or "Below average" against advertisers whose ads showed for the same search over the last 90 days. It depends on exact-match search history: where "there aren't enough searches that exactly match your keywords", a dash appears instead.

And: "Quality Score is not an input in the ad auction." The old formula, Ad Rank equals bid times Quality Score, is not how the auction works; the auction uses auction-time predictions for this query, this user's context and this ad, and Quality Score is a historical aggregate of similar signals, reported per keyword so an advertiser can see which component to work on. For a platform the distinction is a modeling rule: **the score you show advertisers and the factor you rank with are different records.** The ranking factor is per auction and lives on the bid row; the diagnostic is a daily aggregate per keyword with its components. Conflating them leads to support answers that are wrong and to advertisers optimizing a number the auction never reads.

## Assets and Ad Formats

A search ad is assembled at serving time from parts the advertiser supplies (headlines, descriptions, sitelinks, images, call buttons, prices), and Ad Rank includes "the expected impact from your ad assets and other ad formats", and also decides "whether or not your ad is eligible to be displayed with ad assets and other ad formats, such as sitelinks." Two consequences: the creative that served is a combination chosen per auction, so the record of what ran must store the combination ([Creative Production, Review & DCO](/books/advertising/creative-production-and-dco) covers versions and combinations); and an ad's rank depends partly on which assets the platform expects to show, so two ads with the same bid and keyword can rank differently because one has more usable assets.

## Search Terms and Negatives

Because keywords match by meaning, the report that matters is the search terms report: the actual queries that triggered ads, with impressions, clicks, cost and conversions, and the keyword each matched. Advertisers mine it for new keywords and for negatives, and it is the main check on broad and automated matching. Commerce's Retail Media chapter makes the same point for marketplaces: "the keyword is the unit", and the daily per-search-term report is where most optimization happens ([Amazon Ads](/books/commerce/retail-media#amazon-ads)).

For the platform the report is a large daily aggregate (one row per query, keyword and day, mostly rare queries), and it raises a privacy question: a rare query can identify a person. A platform should publish search term rows only above a volume threshold it documents, and keep the raw query log under the same retention as other request logs ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)). I didn't find a public statement of the threshold any platform uses. <!-- source-gap: adv-search-terms-threshold | missing | the volume threshold or rule a search platform uses to withhold rare search terms from advertiser reports | closes with: a Google Ads, Microsoft Advertising or Apple Ads help page stating the rule | checked: 2026-11-22 -->

## Performance Max, AI Max and the End of Dynamic Search Ads

The newest search products replace the keyword list with the platform's matching.

**Performance Max** is "a goal-based campaign type" that serves from one campaign across "YouTube, Display, Search, Discover, Gmail, and Maps", using asset groups (creative assets around a theme or audience) that Google combines into ads per channel, and Smart Bidding toward conversion goals with optional CPA or ROAS targets. Search themes "carry the same priority as phrase and broad match keywords"; negative keywords and brand exclusions block queries; reporting includes channel performance and asset-level results. Where a Search campaign has an exact match keyword identical to the query, the Search campaign takes priority. Commerce's [Google: Shopping and Performance Max](/books/commerce/acquisition-and-attribution#google-shopping-and-performance-max) covers running it as a store; [AI in Advertising](/books/advertising/ai-in-advertising), in Running the Platform, covers it as automated campaign design.

**AI Max for Search** extends a Search campaign's matching and creative with search term matching beyond the keywords, text customization and final URL expansion. Google announced it on May 6, 2025, claiming advertisers typically see 14% more conversions or conversion value at a similar CPA or ROAS in its own data (27% for non-retail campaigns getting over 70% of conversions from exact and phrase match), and said on April 15, 2026 that it "is moving out of beta." Automatically created assets and campaign-level broad match were to be auto-upgraded to AI Max from September 2026; Dynamic Search Ads, originally on the same schedule, will sunset with auto-upgrade beginning in February 2027, per a June 11, 2026 update.

The common thread is that matching, bidding and creative are one optimization on the platform's side. For a builder that changes what must be recorded: the query, the matched keyword or theme (or "AI Max expansion" as the match source), the assets combined, the bid the strategy set and the landing page chosen are all platform decisions per auction, and each needs a field in the auction log, because the advertiser can't reconstruct them from its own settings.

## App Store Search: Apple Ads

Apple renamed Apple Search Ads to Apple Ads on April 14, 2025, because "our ad offerings have grown beyond search." Its placements are the App Store's Today tab, Search tab, search results and product pages; it announced additional ads further down App Store search results from early 2026 (December 17, 2025), ads on Apple Maps (announced March 24, 2026, launched August 21, 2026) and Apple News feed sponsorships (April 14, 2026). Pricing is cost per tap ("Pay only when a user taps your ad, up to a maximum price you choose") on Advanced and cost per install on Basic; Maximize Conversions campaigns use Search Match "to prioritize keywords likely to lead to installs", and search results campaigns can set a target cost per acquisition. Apple Ads registers with AdAttributionKit (announced April 4, 2025), so its installs can be measured alongside other networks' ([Mobile Ad IDs, ATT & SKAdNetwork](/books/advertising/mobile-ad-ids-and-att), in Identity and Audiences, covers the framework).

App store search differs from web search in two ways that matter to a platform: the advertised product is an app the user installs in the same store, so the conversion is observed by the platform itself, and the store operator sets the rules of both the organic ranking and the ad auction. The second is the competition question regulators keep asking about app stores (UGP's [App Stores: Fees, Steering and the Epic Rulings](/books/user-generated-platforms/monetization-strategies#app-stores-fees-steering-and-the-epic-rulings) covers the store side).

## The US Search Case

The Department of Justice's case against Google over search ended its liability phase in August 2024, when the US District Court for the District of Columbia concluded in a 277-page opinion that "Google is a monopolist, and it has acted as one to maintain its monopoly", in violation of Section 2 of the Sherman Act; the DOJ describes the monopolization as in search and search advertising. The remedies, announced September 2, 2025, bar Google from exclusive contracts for distributing Search, Chrome, Google Assistant and the Gemini app, require it to make certain search index and user-interaction data available to certain competitors, and require it to "offer certain competitors search and search text ads syndication services." For search ad platforms the syndication remedy is the engineering one: a rival search engine may serve Google's text ads under a syndication agreement, which is the search partners model run as a remedy. The ad tech case, a separate matter, is [The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases), in Programmatic. Nothing here is legal advice.

## How to Build It

A search ad platform adds keywords to line items (an ad group is a line item), negatives at three levels, the record of which keyword each search matched, the daily search terms report, and the Quality Score diagnostic kept apart from the auction's ranking factor. The auction itself is the core's `auctions` and `bids`, with `auction_slots` for the positions and the effective-bid columns from [Auction Mechanics](/books/advertising/auction-mechanics#how-to-build-it), and the keyword's bid lives on the keyword because each keyword can carry its own.

```sql
CREATE TABLE keywords (                  -- a phrase a line item (ad group) bids on
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  line_item_id        UUID NOT NULL REFERENCES line_items (id),
  text                TEXT NOT NULL,
  normalized_text     TEXT NOT NULL,     -- lowercased, whitespace-collapsed; the duplicate check
  match_type          TEXT NOT NULL CHECK (match_type IN ('exact', 'phrase', 'broad')),
  max_cpc_micros      BIGINT CHECK (max_cpc_micros > 0),  -- null: the line item's rate or strategy
  final_url           TEXT,              -- null: the ad's
  status              TEXT NOT NULL CHECK (status IN ('enabled', 'paused', 'removed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (line_item_id, normalized_text, match_type)
);

CREATE TABLE negative_keyword_lists (    -- a shared list, attached to campaigns or the account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id       UUID NOT NULL REFERENCES ad_accounts (id),
  name                TEXT NOT NULL,
  kind                TEXT NOT NULL DEFAULT 'negatives' CHECK (kind IN ('negatives',
                        'brand_exclusions')),
  UNIQUE (ad_account_id, name)
);

CREATE TABLE negative_keywords (         -- an exclusion at one level
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  list_id             UUID REFERENCES negative_keyword_lists (id),
  campaign_id         UUID REFERENCES campaigns (id),
  line_item_id        UUID REFERENCES line_items (id),
  text                TEXT NOT NULL,
  match_type          TEXT NOT NULL CHECK (match_type IN ('exact', 'phrase', 'broad')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(list_id, campaign_id, line_item_id) = 1)
);

CREATE TABLE negative_keyword_list_campaigns (  -- where a shared list applies
  list_id             UUID NOT NULL REFERENCES negative_keyword_lists (id),
  campaign_id         UUID NOT NULL REFERENCES campaigns (id),
  PRIMARY KEY (list_id, campaign_id)
);

-- Which keyword a search matched, on the bid that entered the auction.
ALTER TABLE bids
  ADD COLUMN keyword_id UUID,            -- no FK across partitioned logs
  ADD COLUMN match_source TEXT,          -- how the query reached this keyword
  ADD COLUMN query_hash BYTEA;           -- the normalized query, hashed; raw text in the request log
ALTER TABLE bids ADD CONSTRAINT bids_match_source_check
  CHECK (match_source IN ('exact', 'phrase', 'broad', 'search_theme', 'expansion',
    'auto_targeting')) NOT VALID;

CREATE TABLE search_terms_daily (        -- the search terms report, as published to advertisers
  line_item_id        UUID NOT NULL REFERENCES line_items (id),
  keyword_id          UUID REFERENCES keywords (id),  -- null: matched by a theme or expansion
  day                 DATE NOT NULL,      -- in the ad account's time zone
  search_term         TEXT NOT NULL,
  match_source        TEXT NOT NULL,
  impressions         BIGINT NOT NULL DEFAULT 0,
  clicks              BIGINT NOT NULL DEFAULT 0,
  cost_micros         BIGINT NOT NULL DEFAULT 0,
  conversions_milli   BIGINT NOT NULL DEFAULT 0,  -- attributed conversions x 1000 (fractional credit)
  conversion_value_micros BIGINT NOT NULL DEFAULT 0,
  UNIQUE NULLS NOT DISTINCT (line_item_id, keyword_id, day, search_term, match_source)
);

CREATE TABLE keyword_quality_daily (     -- the diagnostic shown to advertisers; never an auction input
  keyword_id          UUID NOT NULL REFERENCES keywords (id),
  day                 DATE NOT NULL,
  quality_score       SMALLINT CHECK (quality_score BETWEEN 1 AND 10),  -- null: not enough exact searches
  expected_ctr        TEXT CHECK (expected_ctr IN ('above_average', 'average', 'below_average')),
  ad_relevance        TEXT CHECK (ad_relevance IN ('above_average', 'average', 'below_average')),
  landing_page        TEXT CHECK (landing_page IN ('above_average', 'average', 'below_average')),
  lookback_days       SMALLINT NOT NULL DEFAULT 90,
  computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (keyword_id, day)
);
```

The support question about a keyword that didn't serve is answered from the bids: for one account and query, which of its keywords entered which auctions, and what they lost to.

```sql
-- One account's keywords for one normalized query on one day: auctions entered, won, and why lost.
SELECT k.text, k.match_type, b.match_source,
       count(*)                                         AS auctions_entered,
       count(*) FILTER (WHERE b.outcome = 'won')        AS won,
       count(*) FILTER (WHERE b.outcome = 'filtered')   AS filtered,
       mode() WITHIN GROUP (ORDER BY b.loss_reason)     AS usual_loss_reason
FROM bids b
JOIN keywords k    ON k.id = b.keyword_id
JOIN line_items li ON li.id = k.line_item_id
JOIN campaigns c   ON c.id = li.campaign_id
WHERE c.ad_account_id = $1
  AND b.query_hash = $2
  AND b.auction_started_at >= $3 AND b.auction_started_at < $3 + interval '1 day'
GROUP BY k.text, k.match_type, b.match_source;
```

A keyword absent from the result never entered an auction for that query: it lost the internal keyword selection, which is why that stage needs its own sampled log of candidates and the rule that chose among them.

Design notes:

- **An ad group is a line item; a keyword is targeting with its own bid.** Keywords are rows under the line item rather than entries in `line_items.targeting`, because each has a bid, a URL, a status and its own reports. [Campaigns & Line Items](/books/advertising/campaigns-and-line-items) maps the hierarchy across platforms.
- **Duplicate detection is on normalized text and match type.** The unique key catches the obvious duplicates; meaning-level duplicates ("red car" and "car red") are resolved at serving time by keeping the higher-ranked one, as Google does.
- **Negatives live at one level each.** The check on `negative_keywords` enforces exactly one owner (a shared list, a campaign or a line item); a list's campaigns are a join table. Brand exclusions are a list kind.
- **The match is on the bid.** `keyword_id`, `match_source` and a hash of the normalized query on each bid tie every auction to the keyword and the matching path that put it there; the raw query stays in the sampled request log, with its retention ([Retention](/docs/telemetry/consent-and-privacy#retention)).
- **Quality Score is a separate, daily table.** `keyword_quality_daily` holds the 1-10 score and its three components for the advertiser to see; the per-auction quality factor is `bids.quality_factor_ppm`. Nothing in the auction reads `keyword_quality_daily`.
- **Search terms are a published aggregate.** `search_terms_daily` is what advertisers receive, after the platform's thresholds; conversions are kept in thousandths because data-driven attribution gives fractional credit.

## Auditing

- **What each keyword was.** Text, match type, bid, URL and status as of each day, since a match type's meaning has changed over the years and disputes are about what was configured.
- **Which keyword served, and how it matched.** The keyword, match source and query hash on every bid, kept for the dispute window.
- **What the advertiser was shown.** The Quality Score and search terms reports as published, with the thresholds in force.
- **Every position's price.** The awarded positions, thresholds and prices per auction, so a click's price can be recomputed from the ad below.
- **Every automation that changed matching.** Upgrades to AI Max or broad match with their dates, per campaign, because performance changes after an auto-upgrade are the first thing an advertiser will ask about.

## What This Means for the System You Build

- **Treat keyword selection as a stage before the auction,** with rules for choosing among an account's matching keywords and a log of the choice.
- **Store the match source on every bid,** since matching by meaning makes the keyword list a poor record of what served.
- **Price per position with thresholds,** and store each awarded position's price and basis.
- **Keep the advertiser's diagnostic score apart from the ranking factor.**
- **Publish search terms above a documented threshold** and keep raw queries under request-log retention.
- **Record every automated upgrade and expansion** as a dated change on the campaign.

## References

**Filings**

- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), Search & other revenue and the change in paid clicks and cost per click
- [Microsoft: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/789019/000119312526323660/msft-20260630.htm), the Search advertising line and its 12% growth excluding traffic acquisition costs
- [Amazon.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), advertising services sold to sellers, vendors and others

**Reference**

- [US Department of Justice: Department of Justice Wins Significant Remedies Against Google (September 2, 2025)](https://www.justice.gov/opa/pr/department-justice-wins-significant-remedies-against-google), the August 2024 liability opinion, monopolization in search and search advertising, and the remedies including search text ads syndication
- [IAB: Digital ad revenue climbs to nearly $300B (April 16, 2026)](https://www.iab.com/news/digital-ad-revenue-climbs-to-nearly-300b-as-iab-celebrates-30-year-anniversary/), US search advertising in 2025 and its growth

**In practice**

- [Google Ads Help: About Smart Bidding](https://support.google.com/google-ads/answer/7065882?hl=en), search partners among the auction-time signals
- [Google Ads Help: About keyword matching options](https://support.google.com/google-ads/answer/7478529?hl=en), broad, phrase and exact match, duplicates, negative keywords and keyword prioritization
- [Google Ads Help: About Ad Rank](https://support.google.com/google-ads/answer/1722122?hl=en), Ad Rank's factors, auction-time quality, thresholds, calculation per search and asset eligibility
- [Google Ads Help: Actual cost-per-click](https://support.google.com/google-ads/answer/6297?hl=en), the price rule, the reserve price, rounding, the max CPC exceptions and the worked example
- [Google Ads Help: About Quality Score](https://support.google.com/google-ads/answer/6167118?hl=en), the 1-10 scale, components and ratings, the exact-match history requirement and that it isn't an auction input
- [Google Ads Help: About Performance Max campaigns](https://support.google.com/google-ads/answer/10724817?hl=en), inventory, asset groups, search themes, negative keywords and brand exclusions, reporting, priority of exact match Search campaigns and Smart Bidding
- [Google: AI Max for Search campaigns (May 6, 2025)](https://blog.google/products/ads-commerce/google-ai-max-for-search-campaigns/), the features and Google's reported conversion gains
- [Google: Upgrading to AI Max in 2026](https://blog.google/products/ads-commerce/dsa-upgrade-to-ai-max-2026/), AI Max out of beta, the September 2026 auto-upgrades and the Dynamic Search Ads sunset from February 2027
- [Apple Ads: News and updates](https://ads.apple.com/news), the rename to Apple Ads, more search results ads, Maps and News ads and AdAttributionKit
- [Apple Ads: Ad placement options](https://ads.apple.com/app-store/help/ad-placements/0081-ad-placement-options), placements, Search Match and target cost per acquisition
- [Apple Ads: How pricing works](https://ads.apple.com/app-store/help/advanced/0003-how-pricing-works), cost per tap and cost per install
- [Amazon: Amazon's response to the FTC's lawsuit regarding Sponsored Ads](https://www.aboutamazon.com/md/company-news/amazon-ftc-sponsored-ads-lawsuit-response), the generalized second-price auction and reserves
- [Amazon Ads: Sponsored Brands](https://advertising.amazon.com/solutions/products/sponsored-brands), CPC, vCPM and reserved share of voice
- [eBay Developers: Promoted Listings overview](https://developer.ebay.com/api-docs/sell/static/marketing/pl-overview.html), Priority cost per click by second-price auction and General cost per sale
