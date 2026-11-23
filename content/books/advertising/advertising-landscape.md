+++
title = "The Advertising Landscape"
nav_title = "Advertising Landscape"
description = "US ad market size from IAB/PwC, ad revenue by company from filings, walled gardens and the open web, ad tech vendors, holding companies and who owns whom."
category = "Advertising Industry"
order = 2902
part = "The Business"
tags = ["advertising", "ad-tech", "market-size", "holding-companies", "filings", "data-model"]
+++

The advertising industry is a few very large companies that own audiences and run their own ad systems, a few hundred ad tech companies that connect everyone else, five holding companies that buy most of the agency-placed media, and a measurement layer that all of them argue with. The money is concentrated: Alphabet, Meta and Amazon reported $559.5 billion of advertising revenue between them in 2025, worldwide, against a US internet advertising market that IAB and PwC put at $294.6 billion. The plumbing is not: a single open-web impression can pass through a publisher ad server, a wrapper, two SSPs, a DSP, a data provider and two verification vendors, each a separate company with its own filing, owner and fee.

That shape is why the landscape matters to an engineer and not only to an analyst. Who owns a vendor decides whose data it can see and which conflicts it must disclose; which products a company still runs decides which integrations survive the year (Microsoft closed its DSP in February 2026, Amazon folded its DSP into a new product); and the way each company reports revenue (gross or net, with or without traffic acquisition costs) decides whether two numbers can be compared at all. This chapter sizes the market from the IAB/PwC report, sets out advertising revenue by company from filings as of November 2026, maps the walled gardens against the open web, lists the ad tech and measurement companies by layer, covers the holding companies and the consolidation of 2025 and 2026, and records who owns whom. It extends `organizations` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) with ownership history and the products each company operates. How a dollar splits between those companies is in [How the Money Splits](/books/advertising/advertising-business#how-the-money-splits) and in depth in Take Rates & Supply Quality; how agencies buy is Agencies & Media Buying; the publisher's economics are Publishers & Yield; and the Google litigation is The Google Ad Tech Cases, in the Programmatic part.

## How the Platforms Do It

As of November 2026, the companies the rest of this volume benchmarks, by layer, from their filings and pages. "Revenue" is each company's own reported line, which is not the same measure across rows (see [Reading Advertising Revenue](#reading-advertising-revenue)):

| Layer | Companies (alphabetical) | What they sell | Scale disclosed, 2025 |
| --- | --- | --- | --- |
| **Walled gardens** | Alphabet (Google Search, YouTube), Amazon, Meta, Microsoft, Pinterest, Reddit, Snap | Ads on their own surfaces, bought in their own tools and auctions, counted by their own measurement | Alphabet advertising $294.7 billion; Meta advertising $196.2 billion; Amazon advertising services $68.6 billion (sum of quarters); Snap revenue $5.9 billion; Pinterest revenue $4.2 billion; Reddit advertising $2.1 billion |
| **Retail and commerce media** | Amazon, Instacart, Walmart | Onsite sponsored products and display, offsite media with shopper data | Walmart global advertising "nearly $6.4 billion, including VIZIO" (fiscal 2026); Instacart advertising and other $1,065 million |
| **Streaming and audio** | Netflix, Roku, Spotify | CTV and audio inventory, sold direct and programmatically | Roku platform revenue $4.1 billion; Spotify ad-supported revenue €1,836 million; Netflix projects ads revenue of about $3 billion in 2026 |
| **Buy side (DSPs)** | Amazon (now DVA+), Google DV360, The Trade Desk, Yahoo DSP | Bidding across exchanges for advertisers and agencies | The Trade Desk revenue $2,896 million on $13.4 billion gross spend |
| **Sell side (SSPs, exchanges)** | Google AdX, Index Exchange, Magnite, OpenX, PubMatic | Auctions of publishers' impressions | Magnite revenue $714.0 million, contribution ex-TAC $669.6 million; PubMatic revenue $282.9 million |
| **Ad networks and app monetization** | AppLovin, Criteo, Google (AdSense, AdMob), Unity | Performance ads across many publishers and apps, often with their own buying tools | AppLovin revenue $5,481 million; Criteo revenue $1,944.9 million, contribution ex-TAC $1,174.6 million; Unity revenue $1,849.6 million |
| **Ad servers and creative** | FreeWheel (Comcast), Google Ad Manager and Campaign Manager 360, Mediaocean (Flashtalking, Innovid) | Publisher decisioning, advertiser ad serving and creative tracking | Not broken out |
| **Verification and measurement** | DoubleVerify, Integral Ad Science (private since December 2025), Nielsen (private since 2022) | Viewability, invalid traffic, brand safety, audience ratings | DoubleVerify revenue $748.3 million |
| **Holding companies** | Dentsu, Havas, Omnicom (with Interpublic), Publicis, WPP | Planning and buying for advertisers, creative, data | Omnicom revenue $17.3 billion; Publicis net revenue €14,547 million; WPP revenue less pass-through costs £10,176 million; Dentsu net revenue ¥1,197.5 billion; Havas net revenue €2,783 million |

Four patterns:

- **Concentration at the top, fragmentation in the middle.** Three companies earn more advertising revenue worldwide than the whole US market spends, while the largest independent DSP's revenue is under 1% of Alphabet's advertising line. IAB's release says only that the top ten companies hold "the majority" of US revenue, without a percentage.
- **Every large company holds several roles.** Amazon is a publisher, a retailer, a DSP and a measurement source; Google is a search garden, a video garden, an ad network, an exchange, a publisher ad server, a DSP and an advertiser ad server. The data model's `organizations.kinds` is a list for this reason.
- **The independents report net, the gardens report what they keep.** The Trade Desk books its fee, Magnite and Criteo report contribution ex-TAC beside revenue, and the holding companies report net revenue or revenue less pass-through costs; the gardens' advertising revenue is gross of what they pay partners. Comparing them takes a definition, not a ratio.
- **The middle consolidates and goes private.** In two years: Omnicom bought Interpublic, Integral Ad Science went private, Mediaocean combined Innovid with Flashtalking, and Microsoft closed its DSP. A vendor list in a config file is stale within a year.

## How Big the Market Is

The standard US number is the IAB Internet Advertising Revenue Report, prepared by PwC from data reported to it by companies selling internet advertising, and released each April for the prior calendar year. The 2025 report, released April 16, 2026:

| Cut | 2025 revenue | Growth | Share of total |
| --- | --- | --- | --- |
| **Total US internet advertising** | $294.6 billion | 13.9% | 100% |
| Search | $114.2 billion | 11.0% | 38.8% |
| Display | $81.6 billion | 9.8% | 27.7% |
| Digital video (includes CTV) | $78.0 billion | 25.4% | 26.5% |
| Podcast | $2.9 billion | 17.6% | About 1% |
| **Cross-cutting cuts** | | | |
| Social (across formats) | $117.7 billion | 32.6% | 40.0% |
| Commerce media | $63.4 billion | 18.0% | 21.5% |
| Programmatic | $162.4 billion | 20.5% | 55.1% (derived) |
| Creator advertising | $37 billion | | |

Three things about reading it. **The format rows add up; the cross-cutting rows overlap them.** Search, display, video and audio are formats that partition the total (with smaller lines not shown); social, commerce media and programmatic are cuts across those formats, so social at 40% and search at 38.8% do not mean social plus search is 78.8% of anything. **CTV is inside digital video,** and the release does not break it out, so a CTV market figure comes from elsewhere and should say which source. **The report is US-only and revenue-based,** while company filings are worldwide; Alphabet's, Meta's and Amazon's combined $559.5 billion is a global figure and can't be divided by IAB's $294.6 billion to get a US share. The $37 billion creator figure is reported as spend, a further cut across the formats rather than a format of its own, so it overlaps the rows above it too.

My rule for market figures in a product (a sizing slide, a forecast, a "share of wallet" metric): **store the figure with its publisher, release date, period, geography and definition, and never combine figures from two sources in one ratio without saying so.** A US revenue survey, a worldwide filing and an analyst's spend forecast measure three different things.

## Advertising Revenue by Company

From filings for calendar 2025 unless noted (Microsoft's fiscal year ends June 30, Walmart's January 31):

| Company | Line reported | 2025 | Notes from the filing |
| --- | --- | --- | --- |
| **Alphabet** | Google advertising | $294,691 million (2024: $264,590 million) | Search & other $224,532 million, YouTube ads $40,367 million, Google Network $29,792 million (the only line that shrank); traffic acquisition costs $59,926 million, 20.3% of advertising revenues; advertising about 73.2% of Alphabet's $402,836 million (derived) |
| **Meta** | Advertising | $196,175 million (2024: $160,633 million) | About 97.6% of revenue (derived); ad impressions up 12%, average price per ad up 9%; 3.58 billion daily active people in December 2025 |
| **Amazon** | Advertising services | $68,635 million (sum of the four 2025 quarters) | Revenue recognized "as ads are delivered based on the number of clicks or impressions"; fourth quarter $21,317 million, up 23% |
| **Microsoft** | Search advertising (formerly search and news advertising) | Dollar amount not stated in the sections I could open | Search advertising revenue excluding traffic acquisition costs up 12% in fiscal 2026; LinkedIn revenue up 11% |
| **Walmart** | Global advertising | "nearly $6.4 billion, including VIZIO" (fiscal 2026) | Up 46%; recorded "in either net sales or as a reduction to cost of sales" |
| **AppLovin** | Revenue | $5,481 million, up 70% | Adjusted EBITDA $4,512 million, an 82% margin; completed the sale of its apps business on June 30, 2025 |
| **Snap** | Revenue | $5,931.4 million, up 11% | Fourth-quarter other revenue (subscriptions) $232 million, 24 million subscribers |
| **Pinterest** | Revenue | $4,221.8 million, up 16% | 619 million monthly active users, global ARPU $7.21 |
| **Roku** | Platform revenue | $4,145 million, up 18% | "more than 90 million" logged-in streaming households |
| **The Trade Desk** | Revenue (net, as agent) | $2,896 million, up 18% | Gross spend $13.4 billion; implied 21.6% of gross spend (derived, not a published take rate) |
| **Reddit** | Advertising | $2.1 billion, up 74% | Of $2.2 billion total revenue |
| **Criteo** | Revenue / contribution ex-TAC | $1,944.9 million / $1,174.6 million | Retail media contribution ex-TAC $259.7 million; the gap of about $770 million is traffic acquisition cost (derived) |
| **Spotify** | Ad-supported revenue | €1,836 million, down 1% reported, up 4% at constant currency | 476 million ad-supported monthly active users |
| **Instacart** | Advertising and other | $1,065 million, up 11% | 2.9% of gross transaction value |
| **DoubleVerify** | Revenue | $748.3 million, up 14% | Activation $427.3 million, measurement $249.7 million, supply-side $71.3 million |
| **Magnite** | Revenue / contribution ex-TAC | $714.0 million / $669.6 million | CTV 45% of contribution ex-TAC ($304.2 million) |
| **PubMatic** | Revenue | $282.9 million, down from $291.3 million | "nearly 336.8 trillion impressions processed" |

Netflix does not report an advertising revenue line; its 2026 outlook includes "a projected rough doubling of our ads revenue to approximately $3 billion", which implies about $1.5 billion in 2025 without stating it. Apple does not report advertising separately. Unity's fourth-quarter Grow Solutions revenue was $338 million, with its Vector platform 56% of it; the release does not give a full-year Grow figure.

The year since has split the field. In the third quarter of 2026 Alphabet's advertising revenue was $82,012 million against $74,182 million a year earlier, Meta's $63,061 million against $50,082 million (up 26%), and Amazon's advertising services $19,637 million against $17,703 million (up 11%), while The Trade Desk reported $736 million against $739 million, a year-over-year decline, and Magnite's revenue rose 14% to $204.2 million with CTV contribution ex-TAC up 39%.

### Reading Advertising Revenue

The same dollar of advertiser spend shows up as different revenue at each company it passes through, and four accounting choices explain most of the gaps:

- **Gross or net (principal or agent).** A company that controls the ad before it is delivered reports the advertiser's spend as revenue and the publisher's share as a cost; one that arranges the sale reports only its fee. The Trade Desk reports "as an agent on a net basis", so $13.4 billion of client spend becomes $2,896 million of revenue. Omnicom reports most agency revenue net of third-party costs but acts "as principal when we control the buying process for the purchase of the media". Advertising Revenue Accounting, in Contracts and Money, covers the test.
- **Traffic acquisition costs.** Alphabet's advertising revenue includes ads on partners' sites and in partners' search boxes; the $59.9 billion it paid those partners is a cost of revenues. Criteo and Magnite publish contribution ex-TAC (revenue minus what they pay publishers) beside revenue because part of their revenue is passed through to publishers.
- **Pass-through costs at agencies.** Publicis reports revenue of €17,399 million and net revenue of €14,547 million, defining net revenue as "Revenue less pass-through costs. Those costs are mainly production & media costs and out-of-pocket expenses." WPP's headline metric is revenue less pass-through costs (£10,176 million of £13,550 million revenue), Havas reports €2,913 million revenue and €2,783 million net revenue, and Dentsu ¥1,435,245 million revenue and ¥1,197,530 million net revenue. Agency net revenue is closer to a fee base than to media spend, and the media billed through agencies is far larger than any agency's revenue.
- **Where advertising sits in a retailer's books.** Walmart books advertising in net sales or as a reduction of cost of sales depending on the arrangement; Target reports advertising inside net sales without a separate dollar figure ([How the Money Is Booked](/books/commerce/retail-media#how-the-money-is-booked)).

The data model consequence is the gross-versus-net split from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model): store what the buyer paid and what each party kept as separate amounts, because every company's "revenue" is one of those columns and no two companies chose the same one.

## Walled Gardens and the Open Web

[The Open Web and the Walled Gardens](/books/advertising/advertising-business#the-open-web-and-the-walled-gardens) defines the two architectures. In the landscape they differ in four ways that matter to anyone building on either side:

| | Walled gardens | Open web |
| --- | --- | --- |
| **Who runs the auction** | The garden, on its own rules, mostly "closed-loop" in the MRC's term | An SSP or exchange, a publisher ad server, or both in sequence |
| **Who counts** | The garden, with third-party verification where it allows it | The publisher ad server, the exchange, the DSP, the advertiser ad server and verification vendors, each separately |
| **Identity** | Logged-in users, first-party | Cookies where they work, identifiers, contextual signals and consent strings carried in the bid request |
| **How you integrate** | The garden's APIs (campaign management, reporting, conversions) | Standards: OpenRTB, VAST, ads.txt and sellers.json, the TCF and GPP |

The share between them is not published in one number. What the filings show is direction: Alphabet's Network line (its open-web business: AdSense, AdMob and Ad Manager) fell to $29,792 million while Search and YouTube grew, and Google Network impressions fell 7% in 2025 while cost per impression rose 7%; Meta's impressions rose 12%. On the open-web side, CTV is where the growth is: 45% of Magnite's contribution ex-TAC, 45.6% of programmatic spend in the ANA's third-quarter 2025 benchmark, and over 50% growth in PubMatic's CTV revenue excluding political.

The court in United States v. Google drew the boundary for antitrust purposes: it found Google had monopolized an "open-web display publisher ad server market" and an "open-web display ad exchange market" and unlawfully tied the two, and rejected a third market for advertiser ad networks. The remedies memorandum opinion, filed September 2, 2026, found structural remedies "neither realistic nor needed" and rejected divesting AdX, open-sourcing DFP's final auction logic and the contingent divestiture of the rest of DFP, adopting behavioral remedies instead and ordering the parties to file one jointly proposed final judgment. The European Commission fined Google €2.95 billion on September 5, 2025 for self-preferencing AdX. The Google Ad Tech Cases, in Programmatic, covers both and what changes for engineers.

## Ad Tech Companies by Layer

The layers below follow an impression from the buyer to the publisher. Each is a role in `organizations.kinds`, and most companies hold more than one.

**Buy side.** DSPs bid for advertisers and agencies across exchanges: Google's Display & Video 360 (formerly DoubleClick Bid Manager), The Trade Desk, Yahoo DSP and Amazon's DSP. Amazon's DSP page now says Amazon DSP "is now part of Amazon Ads Agent" and that "Everything you relied on in Amazon DSP now lives in DVA+", with self-service and managed-service buying and pricing carried forward (as of November 2026). Microsoft Invest, the DSP that began as AppNexus and became Xandr, was scheduled to close on February 28, 2026 with Amazon's DSP as the preferred transition partner, as trade press reported; Microsoft's own notice was not reachable. <!-- source-gap: adv-microsoft-invest-sunset | secondary | Microsoft Invest closing February 28, 2026 with Amazon DSP as preferred transition partner | closes with: a Microsoft Advertising page or filing stating the closure | checked: 2026-11-22 --> The Trade Desk describes Kokai as "our most recent and major upgrade to our platform" and OpenPath as "a simplified, direct connection to publishers", a DSP reaching into the supply side. Demand-Side Platforms, in Programmatic, compares them.

**Sell side.** SSPs and exchanges run auctions for publishers: Google AdX, Index Exchange, Magnite, OpenX and PubMatic, plus Amazon's Transparent Ad Marketplace as server-to-server header bidding with "a transparent 2.5% service fee charged to bidders". The sell side is where the court record's market shares sit: AdX had 63 to 71% of worldwide open-web display transactions among reporting exchanges from 2018 to 2022, about nine times the next rival. Prebid, the open-source header bidding project run by Prebid.org, is the shared layer most of them plug into.

**Ad servers.** Publisher ad servers decide which ad serves: Google Ad Manager (DoubleClick for Publishers, bought in 2008, when it held 60% of publisher ad serving), FreeWheel for video and CTV (a Comcast subsidiary, listed in Comcast's 2025 10-K), Kevel and in-house servers. Advertiser ad servers host creatives and count for the buyer: Campaign Manager 360 and Mediaocean's Flashtalking and Innovid, combined after Mediaocean completed its acquisition of Innovid on February 13, 2025.

**Networks and app monetization.** Networks aggregate inventory and sell it with their own buying tools: AdSense and AdMob, Criteo across retailers and publishers, AppLovin and Unity in mobile apps (each also runs a mediation platform: MAX and LevelPlay). AppLovin's 82% adjusted EBITDA margin is the outlier of the industry.

**Data and identity.** Identity graphs, onboarding, clean rooms and data marketplaces (LiveRamp, the UID2 operators, cloud clean rooms) sit beside the buy and sell sides; Identity and Audiences covers them.

**Verification and measurement.** DoubleVerify (public; $748.3 million revenue in 2025, measuring 9.5 trillion media transactions) and Integral Ad Science (acquired by Novacap for $10.30 a share in cash, about $1.9 billion, completed December 23, 2025) measure viewability, invalid traffic and brand safety; Nielsen (taken private for about $16 billion including debt by a consortium of Elliott's Evergreen Coast Capital and Brookfield Business Partners, completed October 11, 2022) and Comscore measure audiences; mobile measurement partners attribute installs. Measurement covers them.

## Holding Companies

Five holding companies own most of the large media agencies. From their 2025 results:

| Holding company | Reported | 2025 | Organic growth | Notes |
| --- | --- | --- | --- | --- |
| **Dentsu** | Net revenue | ¥1,197,530 million (revenue ¥1,435,245 million) | | Goodwill impairments of ¥310.1 billion in the fourth quarter in the Americas and EMEA (¥396.1 billion for the year); net loss ¥327.6 billion |
| **Havas** | Net revenue | €2,783 million (revenue €2,913 million) | 3.1% | Media 38% of net revenue |
| **Omnicom** | Revenue | $17,271.9 million | | Includes one month of Interpublic; Media & Advertising $10,015.9 million; about 120,000 people; largest client 2.4% of revenue |
| **Publicis** | Net revenue | €14,547 million (revenue €17,399 million) | 5.6% | Connected Media 60% of net revenue; pass-through revenue up 38.1% to €2,852 million |
| **WPP** | Revenue less pass-through costs | £10,176 million (revenue £13,550 million) | -5.4% like-for-like | WPP Media's like-for-like revenue less pass-through costs down 5.9% |

**Omnicom and Interpublic.** Omnicom completed its acquisition of Interpublic on November 26, 2025, at 0.344 Omnicom shares per Interpublic share, leaving legacy Omnicom holders with about 60.6% and Interpublic holders about 39.4%, and doubled its cost synergy target to $1.5 billion. The FTC's final consent order on the merger (September 2025) bars Omnicom from steering ad spend away from publishers on the basis of political or ideological viewpoint unless the advertiser directs it, and in April 2026 the FTC and eight states took action against WPP, Publicis and Dentsu alleging they coordinated on a common brand safety standard through GARM and the 4A's Advertiser Protection Bureau. Brand Safety & Suitability covers both orders; Agencies & Media Buying covers how the holding companies buy.

**Concentration on the buy side.** The holding companies are the largest customers of the independent ad tech companies. The Trade Desk's 10-K says "two holding companies would have each represented more than 10% of our gross billings in 2025." Omnicom's top 100 clients were about 54% of its revenue, each served on average by about 55 of its agencies.

## Who Owns Whom

The ownership moves of the last few years that change integrations, data access or conflicts, from the companies' filings and pages:

| Date | Move | What it changes |
| --- | --- | --- |
| October 11, 2022 | Nielsen taken private by the Evergreen Coast Capital (Elliott) and Brookfield Business Partners consortium, $28 a share | No more public filings for the largest TV measurement company |
| February 13, 2025 | Mediaocean completes its acquisition of Innovid, combining it with Flashtalking | Two advertiser ad servers and CTV creative platforms under one owner |
| June 30, 2025 | AppLovin completes the sale of its apps business ($407 million net proceeds, buyer not named in its release) | AppLovin no longer owns the games it used to monetize through its own platform |
| November 26, 2025 | Omnicom completes its acquisition of Interpublic | Two of the six large agency groups become one; a consent order on viewpoint steering |
| December 23, 2025 | Integral Ad Science taken private by Novacap | One of the two public verification companies stops filing |
| February 28, 2026 | Microsoft Invest closes (trade press) | Buyers migrate seats; Microsoft keeps its SSP, Monetize |
| By November 2026 | Amazon DSP becomes part of Amazon Ads Agent, buying through DVA+ | API and product names change for DSP integrations |
| Ongoing | Comcast owns FreeWheel; Google owns DV360, Campaign Manager 360, Ad Manager, AdX, AdSense and AdMob | The largest publisher and advertiser ad servers belong to companies that also sell media |

Three reasons an engineer should care about rows like these. **Conflicts are a property of ownership.** A DSP owned by a retailer, an SSP owned by a company that also buys, or an agency holding company that owns a trading desk and buys as principal all create a disclosure duty; the MRC's auction transparency standards and the ANA's principal media guidance both ask who is on each side ([Holding Companies](#holding-companies); Agencies & Media Buying). **Data rights follow the owner.** A measurement vendor acquired by a buyer, or a clean room acquired by an agency group, changes who may see what under the contract and under privacy law; the onward transfer is a sale or sharing question in US state law. **Products die with integrations attached.** Seats on a closed DSP, a renamed product with a new API, or a verification vendor that stops filing are all events the system must record with a date, not overwrite.

## How to Build It

The core `organizations` table has a `parent_id` and a list of roles, which is enough for a snapshot. The landscape needs history: owners change on a date, products launch, rename and close, and a seat or account belongs to a product, not just a company. Two tables and two columns:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- UUID equality in the exclusion constraint

CREATE TABLE organization_ownerships (     -- who owned whom, and when
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_org_id         UUID NOT NULL REFERENCES organizations (id),
  owned_org_id         UUID NOT NULL REFERENCES organizations (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('subsidiary', 'acquired', 'merged_into',
                         'minority_stake', 'joint_venture', 'divested')),
  share_bp             INT CHECK (share_bp BETWEEN 0 AND 10000),  -- basis points of equity, when known
  valid_during         DATERANGE NOT NULL,
  source_url           TEXT NOT NULL,      -- the filing, 8-K exhibit or release
  recorded_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (owner_org_id <> owned_org_id),
  EXCLUDE USING gist (owner_org_id WITH =, owned_org_id WITH =, valid_during WITH &&)
);

CREATE TABLE ad_tech_products (            -- a product a company operates, with its life
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id      UUID NOT NULL REFERENCES organizations (id),
  name                 TEXT NOT NULL,      -- 'DV360', 'Monetize', 'Invest', 'DVA+'
  role                 TEXT NOT NULL CHECK (role IN ('dsp', 'ssp', 'exchange', 'ad_server',
                         'advertiser_ad_server', 'network', 'mediation', 'header_bidding',
                         'data_provider', 'clean_room', 'measurement', 'verification',
                         'retail_media', 'self_serve')),
  launched_on          DATE,
  sunset_on            DATE,               -- the announced or actual end of service
  successor_id         UUID REFERENCES ad_tech_products (id),  -- where seats migrate
  source_url           TEXT,
  UNIQUE (organization_id, name),
  CHECK (sunset_on IS NULL OR launched_on IS NULL OR sunset_on > launched_on)
);

-- seats and seller accounts belong to a product, not only to a company
ALTER TABLE buyer_seats ADD COLUMN product_id UUID;
ALTER TABLE buyer_seats ADD CONSTRAINT buyer_seats_product_fk
  FOREIGN KEY (product_id) REFERENCES ad_tech_products (id) NOT VALID;
ALTER TABLE seller_accounts ADD COLUMN product_id UUID;
ALTER TABLE seller_accounts ADD CONSTRAINT seller_accounts_product_fk
  FOREIGN KEY (product_id) REFERENCES ad_tech_products (id) NOT VALID;

CREATE INDEX CONCURRENTLY organization_ownerships_owned_idx
  ON organization_ownerships (owned_org_id, valid_during);

-- after backfilling product_id on existing rows
ALTER TABLE buyer_seats VALIDATE CONSTRAINT buyer_seats_product_fk;
ALTER TABLE seller_accounts VALIDATE CONSTRAINT seller_accounts_product_fk;
```

The question the ownership table exists to answer, the ultimate owner of a counterparty on a date, is a recursive walk:

```sql
-- who ultimately owned this vendor on this day
WITH RECURSIVE chain AS (
  SELECT owned_org_id, owner_org_id, 1 AS depth
  FROM organization_ownerships
  WHERE owned_org_id = $1
    AND kind IN ('subsidiary', 'acquired', 'merged_into')
    AND valid_during @> $2::date
  UNION ALL
  SELECT o.owned_org_id, o.owner_org_id, c.depth + 1
  FROM organization_ownerships o
  JOIN chain c ON o.owned_org_id = c.owner_org_id
  WHERE o.kind IN ('subsidiary', 'acquired', 'merged_into')
    AND o.valid_during @> $2::date
    AND c.depth < 10
)
SELECT owner_org_id, depth FROM chain ORDER BY depth DESC LIMIT 1;
```

If two parties to an auction, a deal or an insertion order resolve to the same ultimate owner on the day it ran, the transaction is between affiliates, and that is the flag the conflict disclosures need.

Design notes:

- **Ownership is effective-dated, never overwritten.** `organizations.parent_id` stays as the current-parent convenience, kept in sync from the open-ended `organization_ownerships` row; history lives in the ranges, and the exclusion constraint keeps one owner-owned pair from overlapping itself ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)). An acquisition closes the old range and opens a new one on the closing date in the filing, not the announcement date.
- **A merger keeps both rows.** When Interpublic merged into Omnicom, Interpublic's agencies kept their history; the acquired organization stays with a `merged_into` ownership, and its seats, accounts and contracts keep pointing at it. Reports by holding company walk the ownership as of each transaction's date, so 2025 spend by Interpublic agencies isn't silently restated as Omnicom's.
- **Products carry the sunset.** A closing DSP is an `ad_tech_products.sunset_on` with a `successor_id`; jobs that sync seats, pull reports or push audiences read it and stop, warn or migrate before the date rather than fail after it. A rename (Amazon DSP to DVA+) is a new product with the old as predecessor when the API changes, and a name change on the same row when it doesn't.
- **Every fact keeps its source.** `source_url` is required on ownership rows because the landscape is cited, not remembered; when a deal is reported only by trade press, the row says so in its source and is upgraded when a filing appears.
- **Market figures are their own records.** A market size used in planning or forecasting belongs in a table with publisher, release date, period, geography and definition (the same shape as any reference dataset), not in a constant; when IAB's next report changes the prior year, the old row stays.

## Auditing

- **Who owned each counterparty when the transaction ran.** For every insertion order, deal and principal buy, the ultimate owner of each side on that date, so an affiliate transaction can be shown and disclosed.
- **When each product closed or changed.** Sunset and successor dates for every DSP, SSP, ad server and measurement product the system integrates with, and which seats and accounts were migrated where.
- **Where each landscape fact came from.** The filing or release behind every ownership row and every market figure used in a decision, with its as-of date.

## What This Means for the System You Build

- **Model companies as roles, not types,** and expect the largest counterparties to be buyer, seller, publisher and measurer at once.
- **Effective-date ownership** and resolve the ultimate owner of each side of a transaction as of its date; affiliate transactions are what conflict disclosures ask about.
- **Attach seats and accounts to products,** and record each product's sunset and successor before the integration breaks.
- **Store gross and net separately** and label every revenue figure with its definition (gross, net of TAC, net of pass-through costs).
- **Keep market sizes with their source, period, geography and definition,** and don't divide a worldwide filing by a US survey.
- **Expect the vendor list to change every year:** design for migration (seats, reports, audiences) as a normal event, not an outage.

## References

**Filings**

- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), Google advertising by line, traffic acquisition costs and rate, Network impressions and cost per impression
- [Alphabet: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000080/googexhibit991q32026.htm), third-quarter 2026 advertising revenue
- [Meta Platforms: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm), advertising and total revenue, impressions and price per ad, daily active people
- [Meta Platforms: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1326801/000162828026066700/meta-09302026xexhibit991.htm), third-quarter 2026 advertising revenue
- [Amazon.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), advertising revenue recognized as ads are delivered
- [Amazon.com: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000002/amzn-20251231xex991.htm), quarterly advertising services net sales for 2025
- [Amazon.com: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000038/amzn-20260930xex991.htm), third-quarter 2026 advertising services
- [Microsoft: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/789019/000119312526323660/msft-20260630.htm), the search advertising line and its growth excluding TAC, LinkedIn growth
- [Walmart: Fourth quarter fiscal 2026 results](https://www.sec.gov/Archives/edgar/data/104169/000010416926000032/earningsreleasefy26q4.htm), the global advertising business and how it is recorded
- [Maplebear (Instacart): Fourth quarter 2025 shareholder letter](https://www.sec.gov/Archives/edgar/data/1579091/000157909126000006/cartfourthquarter2025sha.htm), advertising and other revenue and its share of GTV
- [AppLovin: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1751008/000175100826000005/exhibit991-4q25earningspre.htm), revenue, adjusted EBITDA margin and the divestiture proceeds
- [AppLovin: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1751008/000175100826000010/app-20251231.htm), the June 30, 2025 sale of the apps business
- [Snap: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1564408/000156440826000011/snap-20260204xexx991pressr.htm), revenue and subscription revenue
- [Pinterest: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/1506293/000150629326000019/q4-25xpressrelease.htm), revenue, MAU and ARPU
- [Roku: Fourth quarter 2025 shareholder letter](https://www.sec.gov/Archives/edgar/data/1428439/000162828026007670/a04exhibit991-q425form8xker.htm), platform revenue and streaming households
- [Reddit: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000020/earningspressreleaseq425.htm), advertising and total revenue
- [Spotify: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1639920/000114036126004482/ef20065075_ex99-1.htm), ad-supported revenue and MAU
- [Netflix: Second quarter 2026 letter (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1065280/000106528026000211/ex991_q226.htm), the projected doubling of ads revenue to about $3 billion
- [Unity: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1810806/000181080626000010/a2025q4ex-991.htm), Grow Solutions and Vector, total revenue
- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), net reporting as agent, Kokai and OpenPath, two holding companies over 10% of gross billings
- [The Trade Desk: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000009/ttd-20260225x8kexx991.htm), 2025 revenue and gross spend
- [The Trade Desk: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000115/ttd-20261109x8kexx991.htm), the year-over-year revenue decline
- [Criteo: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1576427/000157642726000004/exhibit991q42025.htm), revenue, contribution ex-TAC and retail media
- [Magnite: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000010/a991-earningsq42025.htm), revenue, contribution ex-TAC and CTV share
- [Magnite: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000039/a991-earningsq32026.htm), third-quarter 2026 revenue and CTV growth
- [PubMatic: Fourth quarter and full year 2025 results](https://www.sec.gov/Archives/edgar/data/1422930/000142293026000008/fy25pressrelease.htm), revenue, impressions processed and CTV growth
- [DoubleVerify: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1819928/000110465926020508/dv-20260226xex99d1.htm), revenue by line and media transactions measured
- [Integral Ad Science: Completion of the Novacap acquisition (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1842718/000114036125046475/ef20061707_ex99-1.htm), the take-private price and closing date
- [Nielsen Holdings: Completion of the acquisition by the Elliott and Brookfield consortium (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1492633/000119312522260583/d407513dex991.htm), the price, value and closing date
- [Innovid: Mediaocean completes acquisition (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1835378/000114036125004373/ef20043552_ex99-1.htm), the closing date and the combination with Flashtalking
- [Comcast: Form 10-K for 2025, Exhibit 21](https://www.sec.gov/Archives/edgar/data/1166691/000162828026004994/ex21-12312025.htm), FreeWheel subsidiaries
- [Omnicom: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/29989/000002998926000002/a2025q4earningsrelease.htm), 2025 revenue, the Interpublic closing and the synergy target
- [Omnicom: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/29989/000002998926000006/omc-20251231.htm), revenue by discipline, principal and agent revenue recognition, employees, client concentration, the exchange ratio and ownership split

**Court records**

- [United States v. Google LLC, E.D. Va. No. 1:23-cv-00108, Memorandum Opinion (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), the open-web display markets, the rejected advertiser ad network market, AdX market shares and the DoubleClick acquisition
- [United States v. Google LLC, Remedies Memorandum Opinion (September 2, 2026)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1858.0.pdf), the filing date, the rejected structural remedies and the jointly proposed final judgment

**Regulation**

- [European Commission: Google fined €2.95 billion over abusive practices in online advertising technology (IP/25/1992)](https://ec.europa.eu/commission/presscorner/api/documents?reference=IP/25/1992&language=en), the EU decision and fine
- [FTC: Final consent order in the Omnicom and Interpublic merger (September 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-alters-final-consent-order-response-public-comments-preventing-coordination-global-advertising), the bar on viewpoint-based steering of ad spend
- [FTC: Action against WPP, Publicis and Dentsu (April 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/04/ftc-takes-action-restore-competition-digital-advertising-ecosystem), the alleged coordination on a brand safety standard

**Reference**

- [IAB: Digital ad revenue climbs to nearly $300B](https://www.iab.com/news/digital-ad-revenue-climbs-to-nearly-300b-as-iab-celebrates-30-year-anniversary/), 2025 US internet advertising revenue by format and cut, the release date and top-ten concentration
- [ANA: Programmatic transparency benchmark, third quarter 2025](https://www.ana.net/content/show/id/pr-2025-11-transparency), CTV's share of programmatic spend
- [Publicis Groupe: Full year 2025 results](https://www.publicisgroupe.com/sites/default/files/press-releases/2026-02/CP_FY%202025_ENG.pdf), revenue, net revenue and pass-through revenue, organic growth, the net revenue definition and the business mix
- [WPP: Strategy update and 2025 preliminary results](https://www.wpp.com/en/news/2026/02/strategy-update-and-2025-preliminary-results), revenue and revenue less pass-through costs, WPP Media
- [Havas: Full year 2025 results](https://www.havas.com/press_release/havas-achieves-its-2025-guidance-in-full-and-delivers-a-solid-performance-with-organic-growth-of-3-1-and-an-adjusted-ebit-margin-of-12-9-vs-12-4-last-year/), revenue, net revenue, organic growth and the media share
- [Dentsu Group: FY2025 results against forecast (February 13, 2026)](https://www.group.dentsu.com/en/news/release/pdf-cms/2026004-0213en.pdf), revenue, net revenue, goodwill impairments and net loss

**In practice**

- [Amazon Ads: Amazon DSP](https://advertising.amazon.com/solutions/products/amazon-dsp), Amazon DSP as part of Amazon Ads Agent and DVA+
- [Amazon Publisher Services: Transparent Ad Marketplace](https://aps.amazon.com/aps/transparent-ad-marketplace/), the 2.5% service fee charged to bidders
- [Prebid: Introduction](https://docs.prebid.org/overview/intro.html), Prebid.js, Prebid Server and Prebid Mobile
- [PPC Land: Amazon DSP integrates Microsoft Monetize as preferred partner (October 7, 2025)](https://ppc.land/amazon-dsp-integrates-microsoft-monetize-ssp-as-preferred-partner/), the Microsoft Invest closing date and transition partner, as reported
