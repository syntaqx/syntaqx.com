+++
title = "Publishers & Yield"
description = "Publisher economics: RPM, fill and sell-through, inventory types, direct and indirect sales, the publisher stack, network revenue shares, and subscriptions."
category = "Advertising Industry"
order = 2904
part = "The Business"
tags = ["advertising", "publishers", "yield", "ad-networks", "revenue-share", "data-model"]
+++

A publisher sells attention it already has. A news site, a recipe blog, a mobile game, a streaming app and a podcast each have an audience that arrives for the content, and each turns some of that audience's time into ad slots that buyers bid on, book or ignore. Yield is how much money each unit of audience produces: revenue per thousand page views, per session, per ad break, per daily user. The publisher's job, and the job of the software on its side, is to raise that number without spending the audience that produces it.

It is hard because the publisher's revenue comes in through many doors at once and none of them report the same way. A single page can carry a direct-sold sponsorship booked a month ago, a programmatic guaranteed deal, a private marketplace, three header bidding partners, the ad server's own exchange, a network filling the leftovers and a house ad for the newsletter, each with its own fee, its own reporting delay and its own idea of what an impression was. The money that reaches the publisher is a share of each buyer's price after a chain of fees, estimated daily and finalized weeks later, less deductions for invalid traffic that may land two months after the impressions. Meanwhile every extra ad slot costs page speed, reader patience and, on a paywalled site, the subscription the reader might have bought instead.

This chapter covers the publisher's side of the business: the yield metrics (RPM, eCPM, fill rate, sell-through) and how they chain together, the inventory types from sponsorship to house ads and the priority stack that orders them, direct and indirect revenue, the publisher's stack of ad server, header bidding, SSPs, consent and identity, managed networks against running it yourself, network revenue shares and how they get paid, and the choice between subscriptions and ads. It extends `properties`, `ad_units` and `delivery_daily` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and adds per-ad-unit yield by demand channel, page traffic and the revenue share terms each network or exchange applies. The money split on one impression is already in [How the Money Splits](/books/advertising/advertising-business#how-the-money-splits), and this chapter builds on it rather than repeating it. Other chapters own the parts in depth: the ad server's decisioning in [Ad Servers](/books/advertising/ad-servers), header bidding in [Header Bidding & Prebid](/books/advertising/header-bidding-and-prebid), deals in [Deals, PMPs & Curation](/books/advertising/deals-and-curation), floors in [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization), ad density and formats in [Ad Formats & Standards](/books/advertising/ad-formats), and the statement and payout in [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts). The User-Generated Platforms volume owns the choice of advertising as a platform model ([Monetization Strategies](/books/user-generated-platforms/monetization-strategies#advertising)) and creator shares of ad revenue ([Ad Revenue Share](/books/user-generated-platforms/creator-monetization#ad-revenue-share)).

## How the Platforms Do It

As of November 2026, from each company's own pages, filings and the court record. The rows are publisher-side tools and networks; a publisher typically runs several at once.

| Tool or network | Role on the publisher's side | Who it's for, by its own pages | Money terms published |
| --- | --- | --- | --- |
| **AdMob** (Google) | Ad network and mediation for apps: runs bidding networks and a waterfall that calls ad sources "one-by-one based on the average eCPM you set" | App publishers | Publisher share not stated on a public Google page (the gap noted in [An ad network split](/books/advertising/advertising-business#an-ad-network-split-adsense-style)) |
| **AdSense** (Google) | Ad network for sites: Google sells the space to its buyers and pays per impression | Sites and publishers that want "more automation and easy-to-implement ad solutions" | Publishers receive 80% for AdSense for content, after the buying platform's fee; about 68% net when Google Ads buys; $100 payment threshold; paid between the 21st and 26th of the month |
| **Amazon Publisher Services** | Transparent Ad Marketplace (TAM), server-to-server header bidding in "one ad call"; Unified Ad Marketplace (UAM), the turnkey version | TAM for publishers on the APS header bidding tag with their own demand contracts; UAM, "turn-key", for publishers of all sizes | "A transparent 2.5% service fee charged to bidders" |
| **FreeWheel** | Ad server and SSP for streaming and CTV, sold together as a "Streaming Hub"; the SSP "can be used with or without our ad server" | Streaming TV media companies | Not published |
| **Google Ad Manager** | Publisher ad server (formerly DFP) with Google's exchange (AdX) built in | Publishers that "manage significant direct sales" and several ad sources; sign-up requires an AdSense account | AdX took "around 20%" overall and the ad server's fees came to roughly 1.3 to 1.7%, per the US court record |
| **Kevel** | Ad serving infrastructure as APIs: Decision, Campaign Management, Inventory Management, Forecast and Reporting | Companies building their own ad platform "for retail media, sponsored listings, internal promotions, native ads, and more" | Not published |
| **Magnite** | Sell-side platform (SSP), reporting CTV and DV+ (display and video) as its two businesses | Publishers and streamers | $669.6 million contribution ex-TAC in 2025, 45% of it from CTV |
| **Mediavine** | Managed ad network: runs the site's ad stack and sells its inventory; Journey by Mediavine for growing sites | $5,000 a year in ad revenue for the full program; Journey needs 5,000 monthly sessions from the US, UK, Canada, Australia, Germany, France or the Netherlands and a domain at least 4 months old | Revenue share not stated on its requirements page |
| **Prebid** (Prebid.org) | Open-source header bidding: Prebid.js in the browser, Prebid Server, Prebid Mobile | Any publisher; Prebid.org is a membership organization funded by dues | Free software; "more than 300 demand partners" |
| **PubMatic** | Sell-side platform (SSP) | Publishers | $282.9 million revenue in 2025 on "nearly 336.8 trillion impressions processed" |
| **Raptive** | Managed ad network for independent sites and creators | At least 25,000 monthly page views, down from 100,000 (announced in a post last updated October 16, 2025) | Revenue share not stated on the pages I opened |

Three patterns hold across the table:

- **Every publisher runs a stack, not a vendor.** Even the smallest site on a network is using an ad server, an exchange and a consent tool someone else operates. A large publisher assembles the same pieces itself: an ad server, a header bidding wrapper, several SSPs, a network for the leftovers.
- **The share is published where the publisher has no other leverage.** AdSense publishes its 80% and Amazon its 2.5% because the counterparties are numerous and small; exchange and SSP fees for large publishers are negotiated, and the only public figures for AdX's are from the court record. Managed networks publish their eligibility bars and not their splits: neither Raptive's nor Mediavine's public requirements pages state the share the publisher keeps. <!-- source-gap: adv-managed-network-revenue-share | missing | the revenue share managed ad networks (Raptive, Mediavine) pay publishers | closes with: a public Raptive or Mediavine page or agreement stating the publisher's share | checked: 2026-11-22 -->
- **Eligibility is a traffic and quality bar.** Managed networks gate on page views, sessions, revenue, traffic geography and domain age, and every one of them names clean, human traffic, which is the same risk the network's buyers would otherwise charge back.

## Publisher Economics

### The Yield Metrics

A publisher's dashboard is built on a handful of ratios. The names vary by tool; the definitions below are the ones Google's AdSense and Ad Manager help pages use, and they generalize.

| Metric | Definition | What it answers |
| --- | --- | --- |
| **Ad requests** | "The number of times an ad request is sent (such as by GPT on a webpage) to an ad server" | How many slots the pages asked to fill |
| **Fill rate** | Filled ad requests divided by total ad requests | How much of the asked-for inventory found a buyer |
| **Unfilled impressions** | Ad requests "that didn't return an ad" | What went to waste (or to a blank slot) |
| **eCPM** | Revenue per thousand impressions served, whatever the pricing model the buyer used | What an impression is worth on average |
| **RPM** | "(Estimated earnings / Number of page views) * 1000", with impressions or queries as the denominator for impression and query RPM | What a page view (or impression, or query) is worth |
| **Viewable rate** | "(viewable impressions ∕ measurable impressions) × 100" | How much of what served could be seen |
| **Sell-through rate** | "(reserved impressions ∕ forecasted impressions × 100)", reserved meaning booked to standard or sponsorship line items | How much future inventory direct sales have already sold |

Two RPMs answer different questions. AdSense's examples: $0.15 earned on 25 page views is a page RPM of $6.00, and $180 on 45,000 ad impressions is an ad (impression) RPM of $4.00. **Page RPM** is the publisher's business number: it rises when there are more ads per page, more of them filled or better prices, and it is what a subscription or a sponsorship has to beat. **Impression RPM** is the market's number, close to eCPM: it says what buyers pay per impression and falls when the publisher adds low-value slots. A site can grow page RPM while impression RPM falls, which is what adding ad slots tends to do; UGP's [When Models Collide](/books/user-generated-platforms/monetization-strategies#when-models-collide) has a platform's filed figures for exactly this trade. Google is explicit that RPM "doesn't represent how much you've actually earned": it's computed on estimated earnings, which are finalized the following month.

Session RPM, revenue per thousand sessions, is the same idea for sites where readers view several pages per visit, and apps use revenue per daily active user, since an app has no page view. Every one of them is a ratio over the same two inputs, revenue and a traffic count, which is why the model below keeps traffic as its own record rather than as a column on the revenue rows.

### The Formula Chain

Page RPM decomposes into three factors a publisher can move separately:

```text
page RPM = (ad requests / page views) x fill rate x eCPM
```

An example, with illustrative numbers rather than market rates: a page requests 3.0 ads per page view (two display slots and a refresh), 85% of requests fill, and filled impressions average a $2.40 eCPM. That is 2.55 impressions per page view, worth 2.55 x $2.40 / 1,000 = $0.00612, a page RPM of $6.12. Each lever has a limit:

- **Requests per page view** rise with more slots, longer pages, infinite scroll and refresh, and every one of them costs layout stability, load time and reader patience. [Ad Tags, Rendering & Page Performance](/books/advertising/ad-tags-and-rendering) covers the page-speed side.
- **Fill rate** rises by adding demand (another SSP, a network as a backfill) or by lowering floors, and it reaches 100% only when the publisher accepts any price; a house ad fills everything at no revenue. A falling fill rate with a stable eCPM usually means a demand partner stopped bidding, not that the market moved.
- **eCPM** rises with competition, viewability, audience data the buyer can use (which depends on consent and identity), and with direct deals priced above the auction.

The chain also explains why a single number misleads. A publisher who removes a low-value slot loses requests but raises eCPM and viewability; a floor raised too high lifts eCPM and loses more in fill than it gains in price. My rule: report page RPM as the outcome, decompose it every day into the three factors per ad unit and demand channel, and judge any yield change on page RPM over a test window, never on eCPM alone. Running such a change as a held-out experiment is the playbook's [Experimentation](/docs/telemetry/experimentation#holdouts).

### Ad Density and Its Limits

Ads per page has a ceiling set by readers, browsers and buyers. The Coalition for Better Ads' standards list, among the experiences to avoid, ad density higher than 30% on mobile web and higher than 50% on desktop, alongside pop-ups, prestitials with countdowns and large sticky ads. [Ad Formats & Standards](/books/advertising/ad-formats) covers the standards and [Ad Tags, Rendering & Page Performance](/books/advertising/ad-tags-and-rendering) the browser enforcement; the yield consequence is that density is a constraint on the formula chain's first factor, measured per page template, and a slot that would push a template over it is not inventory.

## Inventory Types

### From Sponsorship to House

A publisher sells the same ad unit several ways, in a priority order the ad server enforces. From most committed to least:

| Type | How it's sold | Price | What the publisher gives up |
| --- | --- | --- | --- |
| **Sponsorship and takeovers** | Direct IO for a share of voice or every impression in a section or time window | Flat fee or fixed CPM, usually the highest | All other demand on that inventory for the period |
| **Guaranteed (standard) direct** | Direct IO for a number of impressions at a CPM, with make-goods for under-delivery | Fixed CPM, negotiated | Delivery risk: the publisher owes the impressions |
| **Programmatic guaranteed** | The same guarantee, transacted through a DSP with a deal ID | Fixed CPM | The same delivery risk, with programmatic billing |
| **Preferred deal** | Non-guaranteed, fixed price, the buyer sees the impression before the auction | Fixed CPM | First refusal to one buyer |
| **Private auction (PMP)** | An invitation-only auction for listed buyers, with a floor | Auction with a floor | Wider demand, for a better price from fewer bidders |
| **Open auction** | Every buyer on the exchanges and header bidders | Auction | Control over which advertisers win, within blocks |
| **Network and remnant** | A network buys whatever is left (AdSense, AdMob, a managed network's backfill) | The network's price, net of its share | Visibility into who bought |
| **House** | The publisher's own promotions: subscribe, newsletter, app download | No revenue | The ad revenue, in exchange for its own conversion |

The ad server's priority classes encode this list. [The Life of an Impression](/books/advertising/advertising-business#the-life-of-an-impression) gives Google Ad Manager's values, sponsorship ahead of standard ahead of price priority, network, bulk, AdSense and Ad Exchange, with house last; Ad Manager serves house line items only when remnant, Ad Exchange or Open Bidding demand is unavailable. The order is not a strict waterfall any more. Under dynamic allocation a guaranteed line item competes with a temporary CPM, "the opportunity cost of not serving the guaranteed line item", so the exchange or a header bid wins an impression whenever it pays more than the guarantee needs that impression to be worth, and the guarantee still delivers. [Ad Servers](/books/advertising/ad-servers) covers the decision; the yield point is that the priority stack sets a minimum value for each impression, and the auction can only beat it.

### Direct and Indirect Revenue

The industry splits publisher revenue into two kinds. **Direct** is sold by the publisher's own team (or a sales house) under an insertion order or a programmatic guaranteed deal: the publisher sets the price, knows the advertiser and keeps the whole media amount, as [A direct-sold insertion order](/books/advertising/advertising-business#a-direct-sold-insertion-order) shows. **Indirect** is everything sold through an intermediary's auction or network: open auction, PMPs, header bidding, networks. The buyer's price passes through a DSP, an exchange or an SSP and sometimes a reseller, and the publisher sees what is left, about $8.00 of a $10.00 CPM bid on an exchange taking 20% ([An open-auction programmatic impression](/books/advertising/advertising-business#an-open-auction-programmatic-impression)).

Direct pays more per impression and costs more to earn: a sales team, an IO workflow, a guarantee the publisher can miss, make-goods, invoicing and collections from agencies under sequential liability. Indirect needs only tags and contracts, scales to any amount of inventory, and pays weekly or monthly from an intermediary that has already collected. Most publishers sell their best inventory (homepages, section fronts, high-viewability units, logged-in audiences, CTV breaks around live events) directly and the rest indirectly, and programmatic guaranteed and PMPs sit between the two: direct prices and relationships on programmatic pipes. No public source I found measures the direct and indirect mix across publishers. <!-- source-gap: adv-publisher-direct-indirect-mix | missing | the share of publisher ad revenue sold directly versus programmatically, across publishers | closes with: an IAB, PwC or industry study publishing the direct and indirect split of publisher revenue | checked: 2026-11-22 -->

### Sell-Through

Sell-through measures how much of the future the direct team has sold. Ad Manager's future sell-through report shows forecasted, available and reserved impressions for up to 90 days by day or a year by month, and defines the rate as reserved impressions over forecasted impressions, reserved meaning booked to standard or sponsorship line items. A low rate means inventory will go to the auction at auction prices; a rate near 100% means a new buyer can't be accommodated without risking under-delivery on existing guarantees, which is when publishers raise direct prices or decline deals. The report and a line item forecast answer different questions, and Google says "You should avoid comparing Future sell-through reports with line item forecasts": a line item forecast looks at one line item and its targeting, while the report forecasts availability across the whole network. [Forecasting & Avails](/books/advertising/forecasting-and-avails) covers the forecast and contention.

For yield, sell-through and fill are two halves of one picture. Sell-through is the share committed in advance at direct prices, fill is the share sold at all; the space between is the auction. A publisher's monthly yield review reads both, per section and ad unit, against page RPM.

## The Publisher Stack

A publisher of any size runs the same layers. Who operates each layer, the publisher or a managed network, is the main choice.

| Layer | What it does | Examples (from the survey) |
| --- | --- | --- |
| **Ad server** | Holds line items and priorities, decides each impression, counts what served, forecasts | Google Ad Manager, FreeWheel for streaming, Kevel's APIs for a custom platform |
| **Header bidding wrapper** | Asks several SSPs at once before the ad server decides, and passes their bids in as key-values | Prebid.js, Prebid Server, Amazon TAM and UAM |
| **SSPs and exchanges** | Run auctions for the publisher's impressions among DSPs; enforce floors and blocks | Magnite, PubMatic, the ad server's own exchange |
| **Networks** | Buy remaining inventory with their own demand and pay a share | AdSense, AdMob |
| **Consent management platform** | Collects consent and sets the TCF and GPP strings every request carries | A CMP; [Consent Management & the TCF](/books/advertising/consent-and-the-tcf) covers the signals |
| **Identity** | A first-party ID for logged-in or known readers, and third-party IDs passed to bidders under consent | Publisher-provided IDs and the identifiers in [Identifiers After Cookies](/books/advertising/identifiers-after-cookies) |
| **Supply-chain files** | ads.txt on the site (app-ads.txt for apps) listing the seller accounts allowed to sell it | [ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain) |
| **Analytics and yield reporting** | Joins traffic, ad server delivery and every partner's revenue report into page RPM by unit and channel | The publisher's warehouse, or the managed network's dashboard |

The consent layer gates everything after it: no consent, no personal data to any bidder, and the impression is sold on context alone at whatever contextual buyers pay ([Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection)). That is a yield factor as much as a legal one, because the same ad unit clears at different prices with and without an identifier, and the reporting below splits by consent state for that reason.

### Self-Managed or Managed

A **self-managed** publisher holds its own ad server account, signs with each SSP, runs its own Prebid configuration, writes its own ads.txt, and reconciles every partner's statement. It keeps every partner's share it can negotiate away and controls every trade-off (which demand, which floors, how many slots), and it pays for that in ad operations staff and engineering. Ad Manager's own sign-up page draws the line the same way: it's the tool "if you manage significant direct sales", and AdSense "might be a better fit" for publishers who want automation.

A **managed** publisher hands the stack to a network. AdSense is the lightest version: paste a tag and Google sells the space. Managed networks such as Mediavine and Raptive go further: they run the ad server, header bidding, SSP relationships and layout on the publisher's site, sell the inventory across their whole network, and pay the publisher a share. The publisher trades a share of revenue and control over the page for scale it couldn't reach alone (buyers deal with the network, not with each blog) and for not employing an ad operations team. The ads.txt file shows the difference: a managed site's lists the network's seller accounts at each SSP rather than the publisher's own, and ads.txt 1.1 lets the site name the network in `MANAGERDOMAIN`, the business domain of "a primary or exclusive monetization partner".

The decision usually tracks scale and direct sales. Below the managed networks' bars, a network like AdSense is the only option; between them and a sales team, a managed network usually earns more than self-managing; with enough direct sales to need an ad server's guarantees and forecasting, self-managing pays for its staff. My default for a publisher building its own stack is to start managed, instrument everything below as if self-managed (traffic, per-unit revenue by channel, every statement) and decide on the numbers, because the managed network's dashboard is the only view of yield otherwise, and it's the counterparty's.

## Networks and Revenue Share

A network or exchange pays the publisher a share of what buyers paid, and the share is only meaningful with its basis: share of what, after which fee. [An ad network split](/books/advertising/advertising-business#an-ad-network-split-adsense-style) has the AdSense arithmetic: of $100 of Google Ads spend, the buy side keeps about $15, and the publisher receives 80% of the remaining $85, $68. The same 80% applied to a different buyer's net gives a different publisher figure, which is why AdSense's own page states the 80% and the "about 68%" separately: one is the term, the other the outcome for one buyer. Google says it doesn't disclose the share for all AdSense products, and AdMob's share isn't on a public page I found.

The published or court-found terms, as of November 2026:

| Party | Share or fee | Basis |
| --- | --- | --- |
| AdSense for content | Publisher receives 80% | Net of the buying platform's fee (about 15% on average for Google Ads) |
| Google AdX | "Around 20%" overall, varied per impression | The clearing price, under dynamic revenue share (US court record) |
| Google Ad Manager's ad server | Fees of roughly 1.3 to 1.7% | Equivalent take rate on spend served (defense expert testimony, US court record) |
| Google Open Bidding | "A 5% fee" | Taken from rival exchanges' bids competing in Ad Manager (US court record) |
| Amazon TAM | "2.5% service fee" | "Charged to bidders", not deducted from the publisher's share |

Three things follow for the system. **A share has a basis, a party and a date.** "80%" without "after the buy-side fee" can't be checked against a statement, and terms change: AdSense moved from a single revenue share to the split model with its 2024 change to per-impression payment. **Several shares stack.** An impression bought by a DSP through an SSP through a reseller reaches the publisher net of each, and a managed network's share comes after the SSPs it sells through; the publisher's revenue is the product of the chain, and only a log-level record can say which links applied. [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality) covers the chain across the industry. **Floors apply to the net.** Ad Manager's pricing rules compare a floor to the bid's value to the publisher after the revenue share, "a $1.00 bid on an 80/20 revenue share" being worth $0.80, so a publisher who sets floors from gross prices sets them wrong.

### Payment, Thresholds and Deductions

Networks pay on a monthly cycle with a threshold, and AdSense's published timeline is the clearest example. Estimated earnings for a month are finalized and posted around the 3rd of the next month; the balance on the 20th must reach the payment threshold, $100 for a US dollar account, and the account must have no payment hold; payment is issued between the 21st and the 26th. A balance below the threshold, or a hold, rolls the money to the next month. Identity verification has no threshold, and address verification starts at $10.

Finalized is lower than estimated more often than not, because invalid traffic comes out. AdSense says invalid clicks can cause "a difference between your estimated and finalized earnings", and deductions arrive later still: Google "posts an adjustment to your account in the form of a deduction", which "in most cases" corresponds "to traffic within the past 60 to 90 days", reimburses the advertisers who paid for the invalid activity, and treats "all deductions from earnings" as "final and ... not subject to appeal." A deduction can also follow an advertiser who didn't pay: Google takes back the earnings from publishers whose sites showed that advertiser's ads. High invalid traffic can limit ad serving or close the account.

For the publisher's books that means three numbers per month, not one: estimated (daily reporting), finalized (the month close) and paid (after later deductions), and the differences are records, not rounding. The money movement, holds and clawbacks are the Payments volume's ([Payout Schedules, Holds and Reserves](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves), [Clawbacks](/books/payments/payouts-and-settlement#clawbacks)); tax interviews and information returns for payees are covered for platforms in [Tax Interviews and Withholding](/books/user-generated-platforms/paying-creators-and-sellers#tax-interviews-and-withholding). The statement a network or exchange issues, net terms across intermediaries and the publisher-side reconciliation are [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts), in Contracts and Money.

## Subscriptions Versus Ads

Every publisher with an audience willing to pay chooses how much to charge readers and how much to charge advertisers, and the filings show how far apart the two can be.

**The New York Times** is mostly a subscription business. Its 2025 10-K reports total revenues of $2.82 billion: subscriptions $1.95 billion (digital-only $1.43 billion), advertising $566.0 million, and affiliate, licensing and other $308.1 million. Digital advertising was about 73% of advertising revenue and grew 20.0%, while print advertising fell 5.4%; the company had about 12.21 million paid digital-only subscribers at the end of 2025, at a digital-only ARPU of $9.68. Subscriptions are about 69% of revenue and advertising about 20% (derived from those totals).

**Spotify** runs both models on one catalog. Its 2025 results report Premium revenue of €15,350 million and Ad-Supported revenue of €1,836 million, with 290 million Premium subscribers and 476 million ad-supported monthly active users at year end. Divided by the year-end counts, that is roughly €53 of revenue per subscriber against roughly €3.86 per ad-supported user (derived, and approximate because user counts move through the year): the free tier earns about a fourteenth as much per person and serves more people.

**Netflix** went the other way, adding ads to a subscription service. Its July 2026 shareholder letter's outlook includes "a projected rough doubling of our ads revenue to approximately $3 billion", sold through its own Netflix Ads Suite and programmatically.

What the three share is the structure of the choice:

- **Ads monetize everyone, thinly; subscriptions monetize a few, deeply.** The free reader is worth page RPM; the subscriber is worth a monthly price. An ad-free tier has to be priced above the ad revenue its subscribers would have produced, which is the ad-free floor UGP describes in [When Models Collide](/books/user-generated-platforms/monetization-strategies#when-models-collide).
- **A paywall changes the inventory.** A hard paywall removes most page views from the ad stack. A metered paywall keeps the first articles as ad inventory and turns readers who hit the meter into either subscribers or lost page views. Subscribers may see fewer ads or none, so subscription growth can lower ad impressions while raising total revenue. The model has to know, per page view, whether the reader was anonymous, registered or subscribed, and which ad policy applied.
- **Registration is ad yield too.** A logged-in reader gives the publisher a first-party identifier it can pass to buyers under consent, and the same impression clears higher with one than without. Registration walls sit between the two models for that reason.
- **The house ad competes with the paid one.** A "subscribe" promotion in an ad slot earns nothing from advertisers and may earn a subscription; it belongs in the priority stack as house inventory with its own conversion value, not as unfilled space.

Choosing the model for a platform, and what stays free, is UGP's [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#freemium-paywalls-and-what-stays-free); subscription billing is the playbook's [Subscriptions](/docs/money/subscriptions). This chapter's model records the access state on traffic so the trade can be measured.

## Yield Work: The Publisher's View of Floors

Floors are the publisher's main price lever in the auction: a minimum price per ad unit, size, geography, device or buyer, below which a bid doesn't win. Ad Manager's pricing rules "centralize the management of auction floor prices for your non-guaranteed demand" across open auction, private auctions, Open Bidding, remnant line items and header bidding trafficking, and don't apply to programmatic direct. From the publisher's side three rules hold: a floor is compared to the net value after the exchange's share, so it's set from net prices; a floor trades fill for price, so it's judged on page RPM, not eCPM; and the guaranteed line items under dynamic allocation already act as a floor the auction has to beat. Floor types, dynamic floors and floor experiments are [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization), in Auctions and Pricing.

## How to Build It

The core model already has the publisher's records: `properties` and `ad_units` for inventory, `line_items` and `deals` for what's sold, `delivery_daily` for billable counts, and `invoices` with `direction = 'payable'` for statements owed to a publisher. What it lacks is the publisher's own view of yield: traffic to divide by, revenue per ad unit across every demand channel (including networks and exchanges that report revenue with no line item in this system), and the revenue share terms that turn a buyer's price into the publisher's. Three tables add them, and three alters extend the core.

**Traffic per property and day.** RPM needs a denominator, and page views and sessions come from the publisher's analytics, not the ad server. Rows are split by access state so subscriptions and ads can be compared:

```sql
CREATE TABLE property_traffic_daily (     -- the denominator for page and session RPM
  property_id   UUID NOT NULL REFERENCES properties (id),
  day           DATE NOT NULL,            -- in the property's reporting time zone
  access_state  TEXT NOT NULL CHECK (access_state IN ('anonymous', 'registered',
                  'subscriber', 'unknown')),
  consent_state TEXT NOT NULL CHECK (consent_state IN ('personalized', 'non_personalized',
                  'not_applicable')),     -- from the CMP signal on the request
  source        TEXT NOT NULL,            -- the analytics system that counted
  page_views    BIGINT NOT NULL CHECK (page_views >= 0),
  sessions      BIGINT NOT NULL CHECK (sessions >= 0),
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version       INT NOT NULL DEFAULT 1,
  PRIMARY KEY (property_id, day, access_state, consent_state, source)
);
```

**Yield per ad unit, day and demand channel.** One row per ad unit, day, channel, demand partner and reporting source, holding the counts of the formula chain and the publisher's revenue. It's distinct from `delivery_daily`, which is the billable roll-up per line item or deal that an invoice reads: a network's or SSP's revenue arrives per ad unit from its report, with no line item in this system, and direct revenue is derived from `delivery_daily` at the IO's rate and attributed to the ad units that served it. Revenue is kept as both the buyer's gross, where the partner reports it, and the publisher's net:

```sql
CREATE TABLE ad_unit_yield_daily (        -- the publisher's yield, per channel
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_unit_id            UUID NOT NULL REFERENCES ad_units (id),
  day                   DATE NOT NULL,
  channel               TEXT NOT NULL CHECK (channel IN ('direct', 'programmatic_guaranteed',
                          'preferred_deal', 'pmp', 'open_auction', 'header_bidding',
                          'network', 'house')),
  demand_org_id         UUID REFERENCES organizations (id),  -- the SSP, exchange or network; null for direct and house
  seller_account_id     UUID REFERENCES seller_accounts (id), -- whose account sold it, as in ads.txt
  source                TEXT NOT NULL CHECK (source IN ('ad_server', 'partner_report',
                          'statement')),
  status                TEXT NOT NULL CHECK (status IN ('estimated', 'finalized')),
  ad_requests           BIGINT NOT NULL DEFAULT 0,  -- requests offered to this channel
  matched_requests      BIGINT NOT NULL DEFAULT 0,  -- requests that returned an ad
  impressions           BIGINT NOT NULL DEFAULT 0,
  measurable_impressions BIGINT NOT NULL DEFAULT 0,
  viewable_impressions  BIGINT NOT NULL DEFAULT 0,
  clicks                BIGINT NOT NULL DEFAULT 0,
  gross_revenue_micros  BIGINT,                     -- what buyers paid, when the partner reports it
  revenue_micros        BIGINT NOT NULL DEFAULT 0,  -- the publisher's net, after the partner's share
  currency              CHAR(3) NOT NULL,
  revenue_share_id      UUID,                       -- network_revenue_shares, below
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version               INT NOT NULL DEFAULT 1,     -- restated on finalization and late reports
  CHECK (matched_requests <= ad_requests),
  CHECK (viewable_impressions <= measurable_impressions),
  CHECK (channel IN ('direct', 'house') OR demand_org_id IS NOT NULL),
  CHECK (channel <> 'house' OR revenue_micros = 0),
  UNIQUE NULLS NOT DISTINCT (ad_unit_id, day, channel, demand_org_id, seller_account_id,
    source, version)
);
```

**Revenue share terms.** One row per publisher, partner and product, optionally narrowed to a property, with the share, its basis and the dates it applies. UGP's `revenue_program_terms` ([Creator Monetization](/books/user-generated-platforms/creator-monetization#how-to-build-it)) is the same idea one step down: a platform's versioned share to creators. Here the publisher is the payee and the network or exchange the payer:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE network_revenue_shares (     -- what a partner pays a publisher, and of what
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_org_id  UUID NOT NULL REFERENCES organizations (id),
  partner_org_id    UUID NOT NULL REFERENCES organizations (id),  -- the network, SSP or managed network
  property_id       UUID REFERENCES properties (id),              -- null: all the publisher's properties
  scope_property_id UUID GENERATED ALWAYS AS (COALESCE(property_id,
                      '00000000-0000-0000-0000-000000000000'::UUID)) STORED,
  product           TEXT NOT NULL,        -- e.g. 'adsense_content', 'open_auction', 'managed_display'
  publisher_share_bp INT NOT NULL CHECK (publisher_share_bp BETWEEN 0 AND 10000),
  basis             TEXT NOT NULL CHECK (basis IN ('gross', 'net_of_buy_side_fee',
                      'net_of_upstream_partner')),
  buy_side_fee_bp   INT CHECK (buy_side_fee_bp BETWEEN 0 AND 10000),  -- where published, e.g. an average
  effective         DATERANGE NOT NULL,
  terms_version     TEXT NOT NULL,        -- the agreement or help-page version the share comes from
  terms_url         TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  EXCLUDE USING gist (publisher_org_id WITH =, partner_org_id WITH =,
    scope_property_id WITH =, product WITH =, effective WITH &&)
);

ALTER TABLE ad_unit_yield_daily ADD FOREIGN KEY (revenue_share_id)
  REFERENCES network_revenue_shares (id);
```

The alters to the core are written for a live database ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)). Properties record their access model and the ad policy for subscribers; ad units record which inventory class they belong to; and a network operator's `delivery_daily` rows record the publisher's net next to the buyer's cost, with the share that produced it:

```sql
ALTER TABLE properties
  ADD COLUMN access_model TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN subscriber_ads TEXT NOT NULL DEFAULT 'full';
ALTER TABLE properties ADD CONSTRAINT properties_access_model_check
  CHECK (access_model IN ('free', 'registration', 'metered', 'freemium', 'hard_paywall',
    'subscription_with_ads')) NOT VALID;
ALTER TABLE properties ADD CONSTRAINT properties_subscriber_ads_check
  CHECK (subscriber_ads IN ('full', 'reduced', 'none')) NOT VALID;

ALTER TABLE ad_units ADD COLUMN inventory_class TEXT;  -- null until classified
ALTER TABLE ad_units ADD CONSTRAINT ad_units_inventory_class_check
  CHECK (inventory_class IN ('premium', 'standard', 'remnant')) NOT VALID;

ALTER TABLE delivery_daily
  ADD COLUMN publisher_net_micros BIGINT,          -- what the publisher is owed for this row
  ADD COLUMN revenue_share_id UUID;
ALTER TABLE delivery_daily ADD CONSTRAINT delivery_daily_revenue_share_fk
  FOREIGN KEY (revenue_share_id) REFERENCES network_revenue_shares (id) NOT VALID;
ALTER TABLE delivery_daily ADD CONSTRAINT delivery_daily_publisher_net_check
  CHECK (publisher_net_micros IS NULL OR publisher_net_micros <= cost_micros) NOT VALID;
CREATE INDEX CONCURRENTLY delivery_daily_revenue_share_idx
  ON delivery_daily (revenue_share_id) WHERE revenue_share_id IS NOT NULL;

-- after backfilling
ALTER TABLE properties VALIDATE CONSTRAINT properties_access_model_check;
ALTER TABLE properties VALIDATE CONSTRAINT properties_subscriber_ads_check;
ALTER TABLE ad_units VALIDATE CONSTRAINT ad_units_inventory_class_check;
ALTER TABLE delivery_daily VALIDATE CONSTRAINT delivery_daily_revenue_share_fk;
ALTER TABLE delivery_daily VALIDATE CONSTRAINT delivery_daily_publisher_net_check;
```

A column added with a non-volatile default is stored as metadata on Postgres 11 and later, not written to every row ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)), which is why `access_model` and `subscriber_ads` can be `NOT NULL` with a default in one step.

Page RPM, impressions per page view, eCPM and the direct share, per property and day, from finalized rows where they exist and estimates otherwise. RPM is computed in micros per thousand page views and converted for display only:

```sql
WITH yield AS (                           -- the latest version of each row, finalized preferred
  SELECT DISTINCT ON (y.ad_unit_id, y.day, y.channel, y.demand_org_id, y.seller_account_id)
         u.property_id, y.day, y.channel, y.impressions, y.revenue_micros
  FROM ad_unit_yield_daily y
  JOIN ad_units u ON u.id = y.ad_unit_id
  WHERE y.day BETWEEN $1 AND $2 AND y.currency = $3
  ORDER BY y.ad_unit_id, y.day, y.channel, y.demand_org_id, y.seller_account_id,
           (y.status = 'finalized') DESC, (y.source = 'statement') DESC, y.version DESC
), traffic AS (
  SELECT property_id, day, SUM(page_views) AS page_views
  FROM property_traffic_daily
  WHERE day BETWEEN $1 AND $2 AND source = $4  -- one analytics system, or page views double
  GROUP BY property_id, day
)
SELECT t.property_id, t.day, t.page_views,
       SUM(y.impressions)::NUMERIC / NULLIF(t.page_views, 0)          AS impressions_per_page_view,
       SUM(y.revenue_micros) * 1000 / NULLIF(SUM(y.impressions), 0)   AS ecpm_micros,
       SUM(y.revenue_micros) * 1000 / NULLIF(t.page_views, 0)          AS page_rpm_micros,
       SUM(y.revenue_micros) FILTER (WHERE y.channel IN ('direct', 'programmatic_guaranteed'))
         ::NUMERIC / NULLIF(SUM(y.revenue_micros), 0)                  AS direct_share
FROM traffic t
JOIN yield y ON y.property_id = t.property_id AND y.day = t.day
GROUP BY t.property_id, t.day, t.page_views
ORDER BY t.property_id, t.day;
```

Impressions per page view times eCPM, divided by 1,000, reproduces page RPM, a check that the counts and the revenue came from the same rows. Impressions can be summed across channels because each served impression has one winner; requests can't, because one request is offered to several channels at once. Fill rate is therefore computed per channel from that channel's `ad_requests` and `matched_requests`, and the publisher-level requests per page view and fill rate come from the ad server's own request count, where each request is counted once.

Turning a buyer's gross into the publisher's net under a share with a buy-side fee is a two-factor multiplication that should round once, not after each step. With AdSense's published terms, $100 of spend at an average 15% buy-side fee and an 80% sell-side share gives $68:

```go tab="Go"
// PublisherNetMicros applies a buy-side fee and a publisher share to gross
// spend, both in basis points, and rounds half up once at the end.
func PublisherNetMicros(grossMicros int64, buySideFeeBP, shareBP int64) int64 {
	n := new(big.Int).Mul(big.NewInt(grossMicros), big.NewInt(10_000-buySideFeeBP))
	n.Mul(n, big.NewInt(shareBP))
	d := big.NewInt(100_000_000) // 10,000 x 10,000
	n.Add(n, new(big.Int).Rsh(d, 1))
	return n.Quo(n, d).Int64()
}

// PublisherNetMicros(100_000_000, 1_500, 8_000) == 68_000_000
```

```rust tab="Rust"
/// Applies a buy-side fee and a publisher share to gross spend, both in
/// basis points, and rounds half up once at the end.
fn publisher_net_micros(gross_micros: i64, buy_side_fee_bp: i64, share_bp: i64) -> i64 {
    let n = gross_micros as i128 * (10_000 - buy_side_fee_bp) as i128 * share_bp as i128;
    let d: i128 = 100_000_000; // 10,000 x 10,000
    ((n + d / 2) / d) as i64
}

// publisher_net_micros(100_000_000, 1_500, 8_000) == 68_000_000
```

Design notes:

- **Traffic is its own record.** Page views and sessions come from analytics, are restated like revenue, and are split by access and consent state; storing them on the yield rows would duplicate them across every channel and make RPM depend on which row was summed.
- **Estimated, finalized, then deducted.** A network's daily revenue is an estimate; the month close finalizes it; invalid-activity deductions land up to two or three months later. Each stage is a new `version` or `status` on `ad_unit_yield_daily`, and a deduction that arrives as a lump on a statement is an `invoice_lines` row of kind `ivt_credit` on the publisher statement, not an edit to old days, since a network like AdSense posts it as one line and says it "can't share any specific details on where or how much invalid activity may have been detected." The payout chapter reconciles the three.
- **One request, one ad server count.** Channels overlap: one request goes to header bidders, the exchange and a network in the same auction. Per-channel `ad_requests` are what each partner saw; the ad server's rows count requests once and are the denominator for fill. Never sum partner requests into a publisher total.
- **Revenue share is versioned terms with a basis.** A share without its basis (`gross`, `net_of_buy_side_fee`) can't be checked against a statement, and a share without an effective range can't price last quarter. The exclusion constraint keeps two shares from covering the same publisher, partner, property and product on the same day, the effective-dated pattern in [Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows).
- **Net is what the publisher is owed, gross is what the buyer paid.** `delivery_daily.cost_micros` stays the buyer's cost; `publisher_net_micros` is the publisher's side of the same row on a platform that pays publishers, so a statement line is a sum over rows with the share that produced each. On an ad server that only reports, gross is often unknown and stays null.
- **House inventory is a channel with zero revenue.** Counting house impressions as unfilled hides the subscription promotions they carry; counting them as revenue lies. A channel with `revenue_micros = 0` keeps them visible in the formula chain.
- **Days are in one time zone per report.** Partners report in their own zones; the import records the partner's day as reported and the reconciliation compares like with like, as [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) sets for `delivery_daily`.
- **Integer micros, ratios at read time.** Revenue is summed in micros and RPM, eCPM and fill are computed in queries, never stored, so a restated row changes every ratio consistently ([Rounding](/docs/money/amounts#rounding)).

## Auditing

The publisher's yield records are what an ad operations team, finance, an auditor and a counterparty ask about:

- **What each partner reported, and when.** Every partner report as imported, with its version, so a finalized month can be compared to the estimates the business planned on, and a partner's restatement is visible as a change rather than a silent overwrite.
- **Which share applied.** Each revenue row points at the revenue share terms, with their basis, version and source, that turned a buyer's price into the publisher's revenue, so a statement can be recomputed from the terms in force on the day.
- **Every deduction as its own line.** Invalid-activity deductions and advertiser non-payment clawbacks on statements, with their date and the partner's explanation where one is given, since networks treat them as final and don't break them down by day.
- **Who was allowed to sell.** The ads.txt file as published on each date and the seller accounts on each revenue row, so revenue reported by a partner not authorized at the time stands out.
- **What the reader saw.** The access and consent state behind each page view and the ad policy for subscribers, so a change to the paywall or the consent rate can be tied to the yield change it caused, and a regulator's question about personalized ads can be answered per day.

The mechanics are the playbook's [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Report page RPM as the outcome and decompose it** into requests per page view, fill rate and eCPM, per ad unit and demand channel, every day.
- **Keep traffic as its own record,** split by access and consent state, so every RPM has a denominator that doesn't change with the revenue rows.
- **Record revenue per ad unit, day and channel from every partner,** with gross and net, estimated and finalized, as versioned rows rather than overwrites.
- **Store every revenue share as versioned terms with a basis and an effective range,** and point each revenue row at the terms that produced it.
- **Set floors from net prices and judge them on page RPM,** never on eCPM alone.
- **Treat sell-through and fill as one picture:** what direct sold ahead, what the auction sold, and what went to house.
- **Count requests once at the ad server** and never sum partner-reported requests into a publisher total.
- **Expect three numbers per month from every network,** estimated, finalized and paid after deductions, and reconcile all three.
- **Model the paywall in the inventory,** so subscriptions, registration and ads can be compared in one query.
- **Point at the Payments volume for the payout** and at [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts) for the statement, rather than rebuilding them here.

## References

**Specifications**

- [Coalition for Better Ads: The Better Ads Standards](https://www.betterads.org/standards/), the desktop and mobile web experiences to avoid, including ad density over 50% on desktop and over 30% on mobile
- [IAB Tech Lab: ads.txt 1.1](https://iabtechlab.com/wp-content/uploads/2022/04/Ads.txt-1.1.pdf), MANAGERDOMAIN for a primary or exclusive monetization partner

**Court records**

- [United States v. Google LLC, E.D. Va. No. 1:23-cv-00108, Memorandum Opinion (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), AdX's overall take rate of around 20%, the ad server's fees of roughly 1.3 to 1.7%, and Open Bidding's 5% fee

**Filings**

- [The New York Times Company: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/71691/000007169126000011/nyt-20251231.htm), subscription, advertising and other revenues, digital advertising's share and growth, digital-only subscribers and ARPU
- [Spotify: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1639920/000114036126004482/ef20065075_ex99-1.htm), 2025 Premium and Ad-Supported revenue, Premium subscribers and ad-supported MAUs
- [Netflix: Second quarter 2026 letter (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1065280/000106528026000211/ex991_q226.htm), the projected rough doubling of ads revenue to about $3 billion in 2026
- [Magnite: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000010/a991-earningsq42025.htm), 2025 contribution ex-TAC and CTV's share
- [PubMatic: Fourth quarter and full year 2025 results](https://www.sec.gov/Archives/edgar/data/1422930/000142293026000008/fy25pressrelease.htm), 2025 revenue and impressions processed

**In practice**

- [Google AdSense: Revenue share](https://support.google.com/adsense/answer/180195?hl=en), the 80% share for AdSense for content after the buying platform's fee, about 68% through Google Ads, undisclosed shares for other products
- [Google: Evolving how publishers monetize with AdSense](https://blog.google/products/adsense/evolving-how-publishers-monetize-with-adsense/), the split fee, per-impression payment and the 15% average buy-side fee
- [Google AdSense: Revenue per thousand impressions (RPM)](https://support.google.com/adsense/answer/190515?hl=en), the RPM formula, the page and ad RPM examples, RPM as estimated earnings
- [Google AdSense: Payment thresholds](https://support.google.com/adsense/answer/1709871?hl=en), the $100 payment threshold, identity and address verification thresholds, holds
- [Google AdSense: Payment timelines](https://support.google.com/adsense/answer/7164703?hl=en), finalization in the following month, the 20th balance cutoff, payment between the 21st and 26th
- [Google AdSense: Invalid traffic](https://support.google.com/adsense/answer/16737?hl=en), estimated against finalized earnings, limited or disabled ad serving
- [Google AdSense: Can I see a record of invalid activity deductions?](https://support.google.com/adsense/answer/6053295?hl=en), deductions as a line on the Transactions page, no detail on where or how much
- [Google AdSense: Deductions from earnings FAQs](https://support.google.com/adsense/answer/2808531?hl=en), deductions for invalid traffic and advertiser non-payment, the 60 to 90 day window, reimbursing advertisers, no appeal
- [Google Ad Manager: Sign up for Google Ad Manager](https://support.google.com/admanager/answer/7084151?hl=en), Ad Manager for significant direct sales, AdSense for automation, the AdSense account requirement
- [Google Ad Manager: Line item types and priorities](https://support.google.com/admanager/answer/177279?hl=en), priority classes from sponsorship to house
- [Google Ad Manager: Dynamic allocation](https://support.google.com/admanager/answer/3721872?hl=en), the temporary CPM of guaranteed line items and when house line items serve
- [Google Ad Manager: Pricing rules](https://support.google.com/admanager/answer/9298008?hl=en), floors for non-guaranteed demand, the channels they cover, programmatic direct excluded
- [Google Ad Manager: Pricing rules and the revenue share](https://support.google.com/admanager/answer/9298211?hl=en), floors compared to the bid's net value after the revenue share
- [Google Ad Manager: Future sell-through report](https://support.google.com/admanager/answer/16709101?hl=en), forecasted, available and reserved impressions, the sell-through formula, horizons, not comparable to line item forecasts
- [Google Ad Manager: Interactive report metrics](https://support.google.com/admanager/table/16431202?hl=en), ad requests, fill rate, unfilled impressions, average eCPM and the viewable rate
- [Google AdMob: Mediation](https://support.google.com/admob/answer/3063564), bidding and the waterfall by average eCPM
- [Amazon Publisher Services: Transparent Ad Marketplace](https://aps.amazon.com/aps/transparent-ad-marketplace/), server-to-server header bidding, UAM for publishers of all sizes, the 2.5% fee charged to bidders
- [Prebid: Introduction](https://docs.prebid.org/overview/intro.html), Prebid.js, Prebid Server and Prebid Mobile, more than 300 demand partners, membership funding
- [FreeWheel: Publishers](https://www.freewheel.com/publishers), the ad server and SSP for streaming and CTV, the SSP with or without the ad server
- [Kevel: Developer documentation index](https://dev.kevel.com/llms.txt), infrastructure APIs for custom ad platforms and their names
- [Mediavine: Requirements](https://www.mediavine.com/mediavine-requirements/), the $5,000 annual ad revenue bar and Journey's sessions, countries and domain age
- [Raptive: Opening the door to more creators](https://raptive.com/blog/opening-the-door-to-more-creators-who-meet-raptive-quality-standards/), the 25,000 monthly page view minimum replacing 100,000
