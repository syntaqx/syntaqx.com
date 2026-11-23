+++
title = "The Advertising Business"
description = "How advertising works in software: the parties, open web and walled gardens, how each dollar splits, the life of an impression, and the core data model."
category = "Advertising Industry"
order = 2901
part = "The Business"
tags = ["advertising", "ad-tech", "business-models", "data-model", "programmatic"]
+++

Advertising is a buyer paying to be seen by someone else's audience. A shoe brand wants a runner to see its new model; a news site, a game, a streaming service, a podcast, a search results page and a retailer's product grid each have runners looking at them; and between the two sit agencies that plan the spend, buying platforms that bid it, exchanges that auction each opportunity, ad servers that decide what shows, measurement vendors that count what happened, and the consent signals and laws that decide whether any of it may use the runner's data. US internet advertising was $294.6 billion in 2025, $162.4 billion of it bought programmatically, according to IAB and PwC.

The software is hard because one ad view lives in a dozen systems at once and every one of them counts it differently. A single impression on a news site is a request in the publisher's ad server, a bid request at an exchange, a bid and a win in a demand-side platform, a rendered impression in the publisher's log, a viewable impression in a verification vendor's report, a line on an agency's invoice, a statement line to the publisher and, maybe, a conversion claimed by three attribution systems. Each party takes a share of the money on the way, each has its own count, and the contract says whose count wins. This chapter is the map the rest of the volume uses: how to read it, the parties, the open web and the walled gardens, how the money splits in each model, the life of an impression from request to payout, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/advertising/glossary).

## How to Read This Volume

The volume follows an ad from the business that buys it to the platform that serves, counts and bills it, in twelve parts plus a reference.

- **The Business.** This chapter; [The Advertising Landscape](/books/advertising/advertising-landscape) (market size, revenue by company from filings, walled gardens and the open internet, ad tech companies, holding companies and who owns whom); [Agencies & Media Buying](/books/advertising/agencies-and-media-buying) (holding companies, trading desks, principal-based buying, media plans, RFPs and IOs, commissions and fees, rebates and transparency, in-housing); [Publishers & Yield](/books/advertising/publishers-and-yield) (inventory types, direct and indirect sales, sell-through, CPMs and RPM, the publisher stack, network revenue shares, subscriptions against ads); and [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality) (the ISBA/PwC and ANA studies, the court record's fees, made-for-advertising sites, supply path optimization).
- **Ad Serving and Creative.** [Ad Servers](/books/advertising/ad-servers) (publisher and advertiser ad servers, the request flow, decisioning, priority classes, dynamic allocation, building one); [Campaigns & Line Items](/books/advertising/campaigns-and-line-items) (the account hierarchy across platforms, goals, budgets, flighting, targeting as data); [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency); [Forecasting & Avails](/books/advertising/forecasting-and-avails); [Ad Formats & Standards](/books/advertising/ad-formats) (the IAB New Ad Portfolio, native, rich media, video and CTV formats, LEAN, the Better Ads Standards); [Ad Tags, Rendering & Page Performance](/books/advertising/ad-tags-and-rendering) (GPT-style tags, SafeFrame, lazy loading, heavy ad intervention, Core Web Vitals, ad blocking); [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco); and [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) (MRC counting, beacons, client and server counting, deduplication, click validation).
- **Programmatic.** [How Programmatic Works](/books/advertising/how-programmatic-works) (DSPs, SSPs, exchanges, the bid request lifecycle and its latency budget, cookie sync, who sees what); [OpenRTB](/books/advertising/openrtb) (the 2.6 objects and releases, AdCOM and 3.0, win, billing and loss notices, auction types, native and video); [Demand-Side Platforms](/books/advertising/demand-side-platforms); [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges); [Header Bidding & Prebid](/books/advertising/header-bidding-and-prebid); [Deals, PMPs & Curation](/books/advertising/deals-and-curation); [ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain); and [The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases) (liability, remedies, the EU decision and what changes for engineers).
- **Auctions and Pricing.** [Auction Mechanics](/books/advertising/auction-mechanics) (second-price, first-price, GSP, VCG, reserves, the MRC auction transparency standards, waterfalls and unified auctions); [Automated Bidding](/books/advertising/automated-bidding); [Pricing Models](/books/advertising/pricing-models) (CPM, vCPM, CPC, CPA, CPV, CPCV, cost-per-sale, flat fee, sponsorship, cost per point, and how each is billed); and [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization).
- **Identity and Audiences.** [Third-Party Cookies & Browser Privacy](/books/advertising/cookies-and-browser-privacy) (ITP, Firefox, Chrome's path and the Privacy Sandbox retirement, CHIPS, partitioning, bounce tracking); [Identifiers After Cookies](/books/advertising/identifiers-after-cookies) (UID2, EUID, RampID, ID5, ConnectID, PPID, extended IDs in OpenRTB, match rates); [First-Party Data & Audiences](/books/advertising/first-party-data-and-audiences); [Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies); [Data Clean Rooms](/books/advertising/data-clean-rooms); [Data Brokers & Third-Party Data](/books/advertising/data-brokers); and [Mobile Ad IDs, ATT & SKAdNetwork](/books/advertising/mobile-ad-ids-and-att).
- **Measurement.** [Measurement Standards & the MRC](/books/advertising/measurement-standards-and-the-mrc); [Viewability & Attention](/books/advertising/viewability-and-attention); [Attribution](/books/advertising/attribution) (windows, models, platform-reported against advertiser-side, conversion APIs from the platform's side); [Incrementality & Lift](/books/advertising/incrementality-and-lift); [Marketing Mix Modeling](/books/advertising/marketing-mix-modeling); [Audience & Cross-Media Measurement](/books/advertising/audience-measurement) (panels, big data, ratings, GRPs); and [Mobile Measurement Partners](/books/advertising/mobile-measurement-partners).
- **Fraud and Brand Safety.** [Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud) (GIVT and SIVT, the schemes, TAG, refunds and clawbacks); [Brand Safety & Suitability](/books/advertising/brand-safety-and-suitability) (GARM's rise and end, the FTC orders, pre- and post-bid controls, blocklists); and [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising).
- **Walled Gardens.** [Search Advertising](/books/advertising/search-advertising) (keywords and match types, Ad Rank, Quality Score as a diagnostic, Performance Max and AI Max, Apple Ads); [Social Advertising](/books/advertising/social-advertising) (delivery systems, Advantage+, lookalikes, ad libraries); [Retail Media Networks](/books/advertising/retail-media-networks) (the operator's side: onsite, offsite and in-store, retail measurement, building a network, commerce media beyond retailers); and [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms) (building an Ads Manager, onboarding and verification, APIs, budgets, reporting).
- **Channels.** [Connected TV & Streaming](/books/advertising/connected-tv); [VAST & Video Ads](/books/advertising/vast-and-video-ads); [Server-Side Ad Insertion & Ad Pods](/books/advertising/server-side-ad-insertion); [Linear TV, Upfronts & Addressable TV](/books/advertising/linear-tv-and-upfronts); [Audio & Podcasts](/books/advertising/audio-and-podcasts); [In-App Advertising & Mediation](/books/advertising/in-app-advertising); [Ads in Games](/books/advertising/ads-in-games); and [Digital Out-of-Home](/books/advertising/digital-out-of-home).
- **Privacy and Law.** [Consent Management & the TCF](/books/advertising/consent-and-the-tcf); [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs); [US State Privacy Law for Advertising](/books/advertising/us-state-privacy-law); [Children, Teens & Advertising](/books/advertising/children-and-teens); [GDPR & ePrivacy for Ads](/books/advertising/gdpr-and-eprivacy-for-ads); [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads); [Sensitive Data & Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting); and [Advertising Content Law](/books/advertising/advertising-content-law).
- **Contracts and Money.** [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms); [Billing & Invoicing](/books/advertising/billing-and-invoicing); [Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies); [Advertiser Payments & Credit](/books/advertising/advertiser-payments-and-credit); [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts); and [Advertising Revenue Accounting](/books/advertising/advertising-revenue-accounting) (gross and net, principal and agent, deferred revenue for guarantees, rebates).
- **Running the Platform.** [Ad Platform Architecture](/books/advertising/ad-platform-architecture) (request path and data path, multi-region, configuration and consent plumbing); [Real-Time Bidding at Scale](/books/advertising/bidding-at-scale); [Reporting & Data Pipelines](/books/advertising/reporting-and-data-pipelines); [Machine Learning for Ads](/books/advertising/machine-learning-for-ads); [AI in Advertising](/books/advertising/ai-in-advertising); and [Advertising Metrics](/books/advertising/advertising-metrics) (definitions for CPM, eCPM, RPM, fill, win rate, CTR, CVR, ROAS, ACoS, CPI, viewability, IVT rate, reach and frequency).
- **Reference.** A [Glossary](/books/advertising/glossary) of every term the volume defines, grouped by part.

The volume covers what advertising adds. The general engineering lives in the playbook, and chapters link to it rather than repeat it: [Money & Amounts](/docs/money/amounts), [Idempotency](/docs/requests/idempotency), [Events & Async Messaging](/docs/architecture/events), [Streaming](/docs/data/streaming), [Consent & Privacy](/docs/telemetry/consent-and-privacy), [Children's Privacy](/docs/compliance/childrens-privacy), [GDPR](/docs/compliance/gdpr), [Experimentation](/docs/telemetry/experimentation), [Accounting](/docs/money/accounting), [Multi-Tenancy](/docs/architecture/multi-tenancy) and [Audit Trails](/docs/building-blocks/audit-trails). Other volumes own topics this one leans on. Commerce owns the advertiser's seat: [Acquisition & Attribution](/books/commerce/acquisition-and-attribution) for channels, Shopping and Advantage+ campaigns, affiliates, conversion uploads and a brand's own lift tests and MMM, and [Retail Media & Marketplace Ads](/books/commerce/retail-media) for a seller buying Sponsored Products and reconciling the fees. User-Generated Platforms owns ads on user content, creator revenue shares and content labels ([Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing), [Creator Monetization](/books/user-generated-platforms/creator-monetization#ad-revenue-share)) and the choice of advertising as a model ([Monetization Strategies](/books/user-generated-platforms/monetization-strategies#advertising)). Gaming owns user acquisition and rewarded ads from the studio's seat ([Mobile Games](/books/gaming/mobile-games#user-acquisition-and-attribution), [Ads in Mobile Games](/books/gaming/monetization#ads-in-mobile-games)). Payments owns the card charge and the payout ([Card Payments](/books/payments/card-payments), [Payouts & Settlement](/books/payments/payouts-and-settlement)).

The volume is US-centric, with the EU and UK where their rules bind (the TCF, GDPR, the DSA and DMA, the UK's Data (Use and Access) Act). No single company is the model: the vocabulary and tables are the industry's, benchmarked across walled gardens (Amazon Ads, Google, Meta, Microsoft Advertising, Pinterest, Reddit, Snap, TikTok), the open-web stack (Criteo, Index Exchange, Magnite, Prebid, PubMatic, The Trade Desk, Yahoo DSP), apps (AppLovin, Unity), measurement (Adjust, AppsFlyer, DoubleVerify, Integral Ad Science, Nielsen), retail and streaming (Instacart, Netflix, Roku, Roundel, Spotify, Walmart Connect) and the standards bodies (IAB, IAB Tech Lab, IAB Europe, MRC, TAG, ANA, 4A's, ISBA, WFA). A company's product name appears only where the chapter is describing that company.

## Who's Who

| Party | Who they are | What they need from the system |
| --- | --- | --- |
| **Advertisers** | Brands and businesses paying to reach an audience: a consumer goods company, a mobile game, a car dealer, a marketplace seller, a political campaign | Spend that reaches real people in safe places, at a price they can see, with outcomes they can measure and an invoice that matches delivery |
| **Agencies** | Media agencies, usually inside a holding company (Dentsu, Havas, Omnicom, Publicis, WPP), that plan and buy for advertisers, sometimes through their own trading desks; Omnicom closed its acquisition of Interpublic on November 26, 2025 | Accounts on every buying platform, one view of spend across them, and billing that passes costs to the advertiser under the terms of their agreement |
| **Publishers** | Owners of the audience and the ad space: news and content sites, apps, streaming services, podcasts, screen networks | The highest yield per page, session or ad break without hurting the experience, payment for what they delivered, and control over which ads appear |
| **Ad networks** | Companies that aggregate many publishers' inventory and sell it as one, often with their own buying interface: AdMob, AdSense, Audience Network, app networks | Inventory and demand at scale, and a revenue share both sides accept |
| **DSPs** | Demand-side platforms that bid on impressions for advertisers and agencies across many exchanges: Amazon's DSP (now DVA+ in Amazon Ads Agent), DV360, The Trade Desk, Yahoo DSP | Bid requests with enough signal to price them, budgets that pace, seats on every exchange, and a fee on the spend they handle |
| **SSPs and exchanges** | Supply-side platforms and exchanges that run auctions for publishers' impressions: Google AdX, Index Exchange, Magnite, OpenX, PubMatic | Many bidders, floors that protect price, clean supply-chain files, and a share of each cleared price |
| **Ad servers** | The systems that decide and record which ad serves: publisher ad servers (FreeWheel, Google Ad Manager, Kevel, open-source and in-house) and advertiser ad servers that host and track creatives (Campaign Manager 360, Flashtalking, Innovid) | Fast decisions, priorities that protect guaranteed deals, and counts the contract will accept |
| **Data providers** | Identity graphs, data brokers, onboarders and clean rooms: LiveRamp, UID2 operators, data marketplaces | Data that is lawfully collected, matched and used only for the purposes allowed |
| **Measurement and verification** | Viewability, fraud and brand safety vendors (DoubleVerify, HUMAN, Integral Ad Science), audience measurement (Comscore, Nielsen), mobile measurement partners (Adjust, AppsFlyer), attribution and MMM tools | Tags, SDKs or log access on every impression they measure, and accreditation from the MRC for the metrics they sell |
| **Walled gardens** | Platforms that own the audience, the ad tools and the measurement in one place: Amazon, Google search and YouTube, Meta, Microsoft, Pinterest, Reddit, Snap, TikTok | Advertisers on their self-serve tools, auctions they run themselves, and data that stays inside |
| **Retail media networks** | Retailers and commerce platforms selling ads on their sites, apps, stores and partners' inventory, using shopper data: Amazon Ads, Instacart Ads, Roundel, Walmart Connect, delivery and travel apps | Suppliers' trade budgets moved into ads, closed-loop sales measurement, and a clean room for the data |
| **Consumers** | The people the ads reach, as readers, viewers, players, listeners and shoppers | Ads that don't break the page, choices about tracking that are honored, children kept out of targeting, and no scams |
| **Regulators and standards bodies** | The FTC, state attorneys general and privacy agencies, the DOJ (antitrust), EU data protection authorities and the European Commission (DSA, DMA), the UK ICO and CMA; IAB, IAB Tech Lab, IAB Europe, MRC, TAG, ANA, 4A's, ISBA, WFA | Consent and opt-outs honored, children's data protected, claims substantiated, competition kept open; for standards bodies, specifications followed and counts accredited |

Two splits shape the data model. **Whose money versus who spends it.** The advertiser is the party whose money it is; an agency operates the advertiser's account on a buying platform and may sign the insertion order; the buying platform bids it. Under the IAB/4A's standard terms an agency is liable to a publisher "solely to the extent proceeds have cleared from Advertiser to Agency" (sequential liability), so who owes the money depends on who signed and who has been paid, and the model keeps advertiser, ad account and operator apart. **Who owns the inventory versus who sells it.** A publisher owns a property; its ad units are placements on it; it sells them through seller accounts at SSPs and exchanges, directly or through resellers, and each seller account is a row in that exchange's sellers.json and a line in the publisher's ads.txt. One property is sold through many seller accounts, and the same seller account can sell many properties.

## The Open Web and the Walled Gardens

Advertising runs on two architectures, and most of the industry's arguments are about the boundary between them.

**The walled garden** owns everything in one company: the audience (logged-in users), the inventory (its own feed, search results, videos, store pages), the auction, the ad server, the measurement and usually the creative tools. An advertiser buys through the garden's self-serve tool, the garden runs an auction it designs, counts the impressions and clicks itself and reports conversions it attributes. Meta's advertising revenue was $196.2 billion in 2025, about 97.6% of its revenue; Google Search & other brought in $224.5 billion and YouTube ads $40.4 billion. Gardens also extend outward, selling ads on other publishers' inventory through networks (AdMob, AdSense, Audience Network), but the buyer still sees one platform.

**The open web** splits the same functions across companies that interoperate through standards. A publisher runs an ad server; an SSP or exchange auctions its impressions; DSPs bid on behalf of advertisers and agencies; verification vendors measure; data providers add audiences. They talk through OpenRTB bid requests, VAST for video, ads.txt and sellers.json for supply-chain identity, and the TCF and GPP strings for consent. The court in the US ad tech case defined the markets around this: an "open-web display publisher ad server market" and an "open-web display ad exchange market", which it found Google had monopolized, while rejecting a third claimed market for advertiser ad networks. Google's own Network line (Ad Manager, AdMob, AdSense) was its only advertising line that shrank in 2025, to $29.8 billion.

The boundary is blurring in both directions. Gardens sell into the open web (Amazon's DSP, now DVA+ in Amazon Ads Agent, buys across exchanges, Netflix sells programmatically through AJA, Amazon, DV360, The Trade Desk and Yahoo DSP), retailers build networks that are gardens for onsite ads and open-web buyers for offsite ones, and IAB counts commerce media at $63.4 billion in 2025. The MRC's Digital Advertising Auction Transparency Standards, final in January 2026, cover both "closed-loop" platform auctions (search, social, retail) and OpenRTB auctions, and note that most auction spend now runs in the closed-loop kind. For the data model the rule is that **the auction is a record whoever runs it**: an exchange's open auction, a publisher ad server's unified auction and a garden's internal auction are all `auctions` rows with bids, a winner and a clearing price, so the same reporting, reconciliation and transparency disclosures work on both sides.

## How the Money Splits

Every impression is paid for by someone and shared by everyone between the advertiser and the publisher. The lines differ by model; the rates below are the published or court-found ones as of November 2026, and large buyers and sellers negotiate their own. Illustrative prices (a bid, a CPM) are marked as examples; they are not market rates.

### A direct-sold insertion order

An agency signs an insertion order with a news publisher for 2,000,000 impressions of a homepage display unit at a $12 CPM (an example rate), $24,000 in total, under the IAB/4A's Standard Terms and Conditions version 3.0:

| Line | Who pays | Who receives |
| --- | --- | --- |
| Media at the IO's CPM, on the controlling measurement | Agency, as agent for the advertiser | Publisher, invoiced after the first month's delivery or within 30 days of the IO's end, payable within 30 days of the invoice |
| Agency commission or fee | Advertiser | Agency, under the agency's own contract with the advertiser, outside the IO |
| Third-party ad serving and verification | Advertiser or agency | The advertiser ad server and verification vendors, per impression they serve or measure |
| Under-delivery | Publisher | Agency, as a make-good or a credit on the invoice |

The publisher's ad server books the line item at a guaranteed priority, and the contract decides whose count bills: the third-party ad server is the controlling measurement when it is IAB/AAAA-compliant and gives the publisher automated daily reporting, otherwise the publisher's ad server. If the controlling count is lower than the other by more than 10% over the invoice period, the parties reconcile, and the agency may treat a gap that can't be resolved as under-delivery. A guaranteed CPM buy can be cancelled on 14 days' written notice without penalty; a flat-fee or fixed placement such as a roadblock, a share-of-voice buy or a cancelable sponsorship needs 30 days. The publisher keeps the whole media amount: no exchange sits between them, which is why direct deals pay best and cost the most to sell.

### An open-auction programmatic impression

An advertiser's agency spends $100 through a DSP on open-auction display. ISBA and PwC's 2020 study traced UK programmatic spend from advertisers to publishers and found this split of advertiser spend:

| Line | Share of $100 | Who receives |
| --- | --- | --- |
| Agency fee | $7 | Agency (trading desk) |
| DSP fee | $8 | DSP |
| Demand-side technology (data, verification, ad serving) | $10 | Data and verification vendors |
| SSP fee | $8 | SSP or exchange |
| Supply-side technology | $1 | Publisher-side vendors |
| Unknown delta | $15 | Unattributable in the study's matched data |
| Publisher revenue | $51 | Publisher |

The "unknown delta" is spend the study could not match from end to end; ISBA's second study, on 2022 data, raised the match rate from 12% to 58% and shrank the unknown delta to 3%. The US court record gives the platform-level view: Google's AdX took an overall rate of "around 20%", varied per impression under its dynamic revenue share, while its publisher ad server's fees came to roughly 1.3 to 1.7%, and "typically, between $20 to $40 of every $100 spent on digital advertising goes to the ad tech companies." For the impression itself: a DSP wins at a $10.00 CPM bid on an exchange taking 20%, so the publisher's ad server sees an $8.00 CPM, and Google Ad Manager's floors apply to that net value: in Google's example, a $1.00 bid on an 80/20 revenue share is worth $0.80 to the publisher and is filtered by any pricing rule with a floor above $0.80. The ANA and TAG TrustNet benchmark for the third quarter of 2025 measured 47.1% of programmatic spend reaching publishers among participating advertisers, up 11 points since 2023; ANA's December 2023 study found that "only 36 cents of every dollar that enters a demand-side platform effectively reaches the consumer", which counts only quality impressions and is not the publisher's share. [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality), in The Business part, covers the studies in depth.

A private marketplace (PMP) deal runs through the same pipes with a deal ID, a floor or fixed price agreed in advance and fewer bidders; a programmatic guaranteed deal adds the guarantee and books like an IO. The fees stack the same way, and a curated deal adds a curator's fee to the supply side.

### A self-serve search or social click

A small business bids on a keyword in a search platform's self-serve tool with a $2.00 maximum cost per click (an example bid). The platform ranks ads by Ad Rank, which on Google combines the bid, auction-time measures of expected click-through rate, ad relevance and landing page experience, thresholds, the competitiveness of the auction, the search context and the expected impact of assets. The advertiser pays only when clicked, and pays "what's minimally required" to clear the Ad Rank of the ad below and the thresholds (or the reserve price when no competitor is below), rounded up to the cent and never above the maximum bid unless automated bidding is on: say $1.37. Quality Score, the 1 to 10 number shown per keyword, is a diagnostic; Google states it "is not an input in the ad auction." Meta's auction picks the ad with the highest total value, "bid, the estimated action rate and the ad quality score" combined, so a lower bid can win.

| Line | Who pays | Who receives |
| --- | --- | --- |
| Click (or impression, view, conversion, by the bid type) | Advertiser, charged as spend accrues or invoiced on credit | The platform |
| Invalid clicks filtered before billing | Nobody | Never charged |
| Invalid activity found after billing | Platform | Advertiser, as a credit |
| Share for a partner site, when the ad ran off the platform's own pages | Platform | The partner (traffic acquisition cost) |

On the garden's own pages the platform keeps the whole click; there is no publisher to pay. When the ad runs on partner inventory, the platform pays a share out: Alphabet's traffic acquisition costs were $59.9 billion in 2025, 20.3% of its advertising revenues, a blend of search distribution partners and Network publishers. Google Ads describes the invalid-traffic rule both ways: traffic filtered before billing is never charged, and invalid activity detected afterward comes back as a credit that does not rewrite campaign metrics. Card billing and credit lines for self-serve advertisers are covered in [Advertiser Payments & Credit](/books/advertising/advertiser-payments-and-credit), and the card charge itself in [Card Payments](/books/payments/card-payments).

### An ad network split (AdSense style)

An advertiser buys display through Google Ads, and the ad runs on a small publisher's site through AdSense. Since 2024 AdSense pays per impression and splits the fee in two: the buying side (Google Ads) keeps "on average 15% of advertiser spend", and on the selling side "publishers receive 80% of the revenue, after the advertiser platform takes its fee":

| Step | Amount on $100 of advertiser spend |
| --- | --- |
| Advertiser spend through Google Ads | $100 |
| Buy-side fee, about 15% on average | $15 |
| Reaches AdSense | $85 |
| Sell-side share, 20% | $17 |
| Publisher's 80% | $68 |

Google's help page gives the same net: when Google Ads is the buyer, publishers "keep about 68%". Google said in 2020 that publishers kept "over 69 percent" when Google Ads or DV360 bought through Ad Manager in 2019. Other networks don't all publish their share: Google says it doesn't disclose the share for all AdSense products, and no public Google page I found states AdMob's. <!-- source-gap: adv-admob-revenue-share | missing | the publisher revenue share for AdMob | closes with: a Google AdMob help page or filing stating the share | checked: 2026-11-22 --> [Publishers & Yield](/books/advertising/publishers-and-yield) covers network shares and their payouts in depth; UGP's [Ad Revenue Share](/books/user-generated-platforms/creator-monetization#ad-revenue-share) covers the next step down, a platform sharing ad revenue with creators.

### A retail media sponsored product

A brand selling on a retailer's site pays per click for its product to appear in search results there. The retailer runs the auction, serves the ad among its organic results, counts the click and attributes sales from its own transactions. Amazon recognizes its advertising revenue "as ads are delivered based on the number of clicks or impressions", sold to "sellers, vendors, publishers, authors, and others"; its advertising services were $68.6 billion across the four quarters of 2025. Walmart's global advertising business grew 46% to "nearly $6.4 billion, including VIZIO" in its fiscal 2026, and Walmart books advertising "in either net sales or as a reduction to cost of sales". Instacart's advertising and other revenue was $1,065 million in 2025, 2.9% of its gross transaction value.

| Line | Who pays | Who receives |
| --- | --- | --- |
| Click on the sponsored listing | Brand (a seller or a supplier) | Retailer, all of it for onsite placements |
| Offsite extension on the open web or CTV | Brand, through the retailer | Retailer, which pays a DSP, exchanges and publishers out of it |
| Retailer platform services (Carrot Ads-style network as a service) | Retailer | The platform provider |
| Attributed sales | Nobody | Reported by the retailer, under the windows it discloses |

Onsite, the retailer is the whole stack and keeps the whole price; offsite, it becomes an open-web buyer with shopper data. The IAB/MRC Retail Media Measurement Guidelines (January 2024) note typical attribution windows of "3, 7, 14, 28, or 30 days", require windows to be disclosed and empirically supported, and require viewable impressions for attributing outcomes. The seller's side (buying the ads, the fees on the settlement, ACoS) is in Commerce's [Retail Media & Marketplace Ads](/books/commerce/retail-media); this volume's [Retail Media Networks](/books/advertising/retail-media-networks) covers the operator's.

### A CTV ad pod

A streaming service's player reaches a 120-second mid-roll break. Its server-side ad insertion (SSAI) service asks the publisher's ad server to fill the pod, and the ad server sends an OpenRTB 2.6 request with the pod's shape: `poddur` 120 seconds, `maxseq` 4 ads, `rqddurs` of 15 and 30 seconds, and `mincpmpersec` as the floor for the dynamic portion. Bidders answer with creatives of a stated duration (`dur`) and a `slotinpod`; the ad server fills the pod by value per second under competitive separation (no two car ads in one break), and the SSAI service stitches the winning video into the stream. Because the server, not the TV, fetches the ad and fires the tracking, IAB Tech Lab's CTV guide requires the stitcher to forward `X-Device-IP` and `X-Device-User-Agent`, and the VAST impression event is the billable signal, with OpenRTB's billing notice fired at the same time.

| Line | Who pays | Who receives |
| --- | --- | --- |
| Each spot in the pod, at its clearing CPM | Advertiser, through a DSP or a direct deal | Streaming publisher, net of SSP fees on programmatic spots |
| SSP or exchange fee | From the clearing price | SSP |
| DSP fee | Advertiser | DSP |
| SSAI and ad serving | Publisher | Ad server and stitching vendor |
| Verification on CTV | Advertiser | Verification vendor, where the app supports measurement |

CTV is now the center of programmatic spend: it was 45.6% of programmatic spend in ANA's third-quarter 2025 benchmark and 45% of Magnite's 2025 contribution ex-TAC. Much of it is still sold directly in upfronts and as programmatic guaranteed deals; Netflix opened programmatic buying through AJA, Amazon, DV360, The Trade Desk and Yahoo DSP (as of November 2025). The Channels part covers CTV, VAST and SSAI in depth.

### An in-app rewarded ad through mediation

A mobile game offers a player extra lives for watching a video. The game's mediation SDK (AdMob, AppLovin MAX, Unity LevelPlay) runs an in-app auction among bidding networks and, where a network can't bid, a waterfall that calls ad sources "one-by-one based on the average eCPM you set"; AppLovin MAX has bidding and waterfall networks "compete by the highest CPM". The winning network serves the video, and when the player finishes it the network calls the game's server with a signed server-side verification callback (on AdMob: the ad network, ad unit, reward amount and item, user ID, a transaction ID, a timestamp and an ECDSA signature), and the game grants the reward.

| Line | Who pays | Who receives |
| --- | --- | --- |
| Rewarded impression or completed view | Advertiser (usually another app buying installs), through a network's DSP or bidding | The winning ad network |
| Network's share | From the price | Ad network; the publisher's share is set by each network's terms |
| Mediation | App developer, as a fee or a share where the platform charges one | Mediation platform |
| Reward | Nothing changes hands in money | The player, in the game's own currency |
| Install attribution | Advertiser | Mobile measurement partner, per attributed install or by plan |

The reward is game economy, not ad money: it is granted once per transaction ID and lives in the game's ledger ([Ad Mediation and Rewarded Ads](/books/gaming/mobile-games#ad-mediation-and-rewarded-ads)). This volume's [In-App Advertising & Mediation](/books/advertising/in-app-advertising) and [Ads in Games](/books/advertising/ads-in-games) cover the platform side.

### One rule for all of them

Every split above is a set of shares of one price, and almost every dispute in this volume is about which count that price applied to: a publisher's rendered impressions against the agency's ad server, a DSP's spend against an exchange's clearing log, a retailer's attributed sales against the brand's own, a click billed and later found invalid. My rule: record every auction's bid and clearing price, every fee as its own amount with the party, rate and agreement version that produced it, and every delivery count with its source; compute every total (the advertiser's cost, the publisher's revenue, each intermediary's take) as a sum over those rows, and invoice from a named billable count, never from a number someone typed. A total stored without its rows can't be reconciled, credited for invalid traffic, audited for a fee disclosure or shown to the other side of a 10% discrepancy.

## The Life of an Impression

The same records move through every model; what differs is who runs each step. The fullest path is an open-web display impression bought programmatically and also eligible for a direct deal, and the others are shorter versions of it.

**Request.** A reader opens an article. The page's ad tag (or an app's SDK, or a CTV player's SSAI service) asks the publisher's ad server for an ad for one ad unit, with the page URL, the ad sizes, the device and user agent, an IP-derived location, any first-party identifier and the consent state. The request gets an ID that every later record carries.

**Consent signals.** Before anything personal leaves the page, the consent management platform has set the signals: in the EEA and UK, a TCF consent string (since TCF v2.3, strings created after February 28, 2026 must carry the `disclosedVendors` segment); in US states, a GPP string with the sections that apply (`usnat`, or a state's section); the browser's Global Privacy Control (`Sec-GPC: 1`), which California requires businesses to treat as an opt-out of sale and sharing; and a COPPA flag for child-directed properties, where the amended COPPA Rule requires separate parental consent before disclosing a child's data to third parties for targeted advertising. OpenRTB carries them as `regs.gdpr`, `user.consent`, `regs.gpp`, `regs.gpp_sid` and `regs.coppa`. The rule for every hop is the same as for any collection: no consent, no personal data ([Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection), [The 2025 Amendments](/docs/compliance/childrens-privacy#the-2025-amendments)), and a downstream party that receives a signal must honor it, not just pass it on.

**Ad server decision.** The publisher's ad server finds the line items eligible for this ad unit, targeting and frequency caps, and ranks them by priority. Google Ad Manager's classes are sponsorship (4), standard (6, 8 or 10), price priority, network, bulk, AdSense and Ad Exchange (12) and house (16), lower winning. Guaranteed line items are not simply first: under dynamic allocation they compete with a temporary CPM, the "opportunity cost of not serving the guaranteed line item", so non-guaranteed demand wins an impression only if it pays more than the guarantee needs it to be worth.

**Header bidding and the exchange auction.** Before or during that decision, demand from other exchanges arrives. In header bidding, Prebid.js on the page (or Prebid Server, or Amazon's server-to-server TAM) asks several SSPs at once and passes their best bids to the ad server as key-values, where they compete with the ad server's own exchange. Each SSP runs its own auction by sending OpenRTB bid requests to DSPs with a timeout (`tmax`, in milliseconds), a floor (`bidfloor`, a CPM, USD by default), the auction type (`at`: 1 for first price, 2 for "Second Price Plus"), any deals in a `pmp` object, and a `source.schain` listing every seller that handled the request back to the publisher.

**Bid.** Each DSP decides in milliseconds whether to bid: it checks that the seller is authorized in the publisher's ads.txt, the consent state, its campaigns' targeting, budgets, pacing and frequency, predicts the value of the impression to each campaign, and returns a price, a creative and a deal ID if it bid on a deal, or HTTP 204 for no bid.

**Win notice.** The exchange picks its winner and, through the ad server, the impression goes to the highest qualifying bid or line item. The exchange may call the winner's `nurl`, which OpenRTB says is "not necessarily indicative of a delivered, viewed, or billable ad", and each loser's `lurl` with a loss reason.

**Render.** The winning creative's markup is returned to the page, which loads it in an iframe (often SafeFrame), and the creative's own assets and third-party trackers load from the advertiser's ad server and verification vendors.

**Impression and viewability counting.** The impression counts when the ad begins to render: the MRC and IAB moved the minimum counting standard to "count-on-begin-to-render" in 2017. Google Ad Manager, which still counts display impressions on download, moves display inventory on web, mobile web and CTV banners to begin-to-render on February 17, 2027; its app and video inventory already count that way ([Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) covers both standards). It is viewable, under the MRC's guidelines, when 50% of its pixels are on screen in an in-focus tab for one continuous second (two continuous seconds of play for video; 30% of pixels for ads of 242,500 pixels or more). The exchange fires `burl` when the win "becomes billable based on exchange-specific business policy", and verification vendors classify the impression as general or sophisticated invalid traffic (GIVT, SIVT), in or out of brand-safe content.

**Click.** If the reader clicks, a click tracker records it and redirects to the landing page, often through the advertiser's ad server and a measurement vendor first. Clicks are validated (duplicates, bots, accidental clicks) before they bill.

**Conversion.** Days later the reader buys the shoes. The advertiser's site or app reports the conversion through a pixel, an SDK, a server-side conversion API or a mobile measurement partner, and each platform that showed an ad claims it under its own window and model. The same purchase can be claimed by a search platform, a social platform and the DSP. Commerce's [Server-Side Conversions](/books/commerce/acquisition-and-attribution#server-side-conversions) covers sending it from the advertiser's seat; [Attribution](/books/advertising/attribution), in Measurement, covers receiving and attributing it.

**Billing roll-up.** Every platform rolls its event logs into a daily billable count per line item or deal: impressions, viewable impressions, clicks and cost, net of invalid traffic filtered before billing. The publisher's ad server, the exchange, the DSP, the agency's ad server and the verification vendor each produce their own.

**Invoice.** At month end the seller invoices the buyer from the controlling count: a publisher invoices the agency for a direct IO; a DSP bills its agency client for media plus fees; an exchange bills the DSP for cleared impressions; a self-serve platform charges the advertiser's card or invoices on credit.

**Reconciliation.** The buyer compares the invoice to its own count. Within the contract's tolerance (10% on IAB/4A's terms), the invoice stands; beyond it, the parties reconcile at log level, and invalid traffic found later comes back as credits. Money often moves before collection: The Trade Desk says it "typically pay[s] suppliers in advance of collections from our clients."

**Payout.** The exchange or network pays the publisher its share on net terms, less invalid-activity deductions, and the publisher reconciles the payout to its own ad server's numbers. The money movement is the [Payouts & Settlement](/books/payments/payouts-and-settlement) volume's; holds and clawbacks for invalid traffic mirror its [Clawbacks](/books/payments/payouts-and-settlement#clawbacks).

The shorter paths: a **direct IO** skips the exchange and the bids, and the ad server's decision is the auction. A **search or social ad** happens entirely inside the garden, from request to auction to click to billing, with only the conversion arriving from outside. A **retail sponsored product** adds the retailer's own sales as the conversion source. A **CTV pod** fills several slots in one auction and counts on the stitched video's beacons. An **in-app rewarded ad** runs the auction in the mediation SDK and adds the reward callback.

Across all of them, the request, the auction, the impression and the billable count are four records. A request can produce no auction (no eligible demand), an auction can produce no impression (the ad never rendered), an impression can be invalid and never bill, and a billable count is a roll-up from one party's log that another party's roll-up will disagree with. That is the request-versus-auction-versus-impression-versus-billable split the data model is built on.

## The Core Data Model

Every company in this volume converges on the same concepts under different names: a Google Ads campaign and ad group, a Meta campaign and ad set, an Ad Manager order and line item and a DSP's campaign and ad group are all campaigns and line items; an AdSense site, an AdMob app, a CTV channel and a retailer's search page are all properties; a seat in an exchange and a buyer ID in a DSP are both buyer seats. The volume uses one set of names, and every later chapter's "How to Build It" extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **organization** | `organizations` | Any company in the chain: an advertiser's parent, an agency, a publisher, a network, an ad tech vendor, a measurement vendor. One company can hold several roles through the tables below |
| **advertiser** | `advertisers` | A brand being advertised, owned by an organization: the party whose money it is |
| **ad account** | `ad_accounts` | An account on one buying platform, owned by an advertiser and operated by an agency or the advertiser itself, with its currency, time zone and billing setup |
| **property** | `properties` | A publisher's site, app, CTV app, podcast, channel, screen network or retail surface, by domain, bundle or store ID |
| **ad unit** | `ad_units` | A placement on a property: sizes, formats, position; hierarchical |
| **seller account** | `seller_accounts` | A seller ID in an SSP or exchange, the sellers.json row: a publisher or an intermediary, direct or reseller |
| **buyer seat** | `buyer_seats` | A seat in an exchange or SSP for a DSP, an agency or an advertiser |
| **insertion order** | `insertion_orders` | The contract between an advertiser or agency and a seller: dates, budget, terms version, controlling measurement |
| **campaign** | `campaigns` | A buy with a goal and budget, under an ad account and optionally an insertion order |
| **line item** | `line_items` | The unit of delivery (an ad group, ad set or line item): dates, budget, goal, priority, pricing model and rate, targeting, pacing and frequency caps |
| **creative** | `creatives` | An ad: format, size or duration, assets, landing URL, review status |
| **line item creative** | `line_item_creatives` | Which creatives a line item may serve, with weight and dates |
| **deal** | `deals` | A private marketplace, preferred or programmatic guaranteed deal: deal ID, seller, buyer seat, floor or fixed price, terms |
| **ad request** | `ad_requests` | One request for ads from a property and ad unit, with its privacy signals, device and geo; sampled or logged, partitioned by hour |
| **auction** | `auctions` | One auction for one impression opportunity, whoever runs it: type, floor, winner, clearing price |
| **bid** | `bids` | Each bid in an auction: bidder and seat, deal, price, creative, outcome and loss reason |
| **ad event** | `ad_events` | Append-only delivery events: impression, viewable impression, click, video start, quartiles and complete, with invalid-traffic flags; partitioned by hour |
| **conversion** | `conversions` | An outcome (purchase, install, lead) reported to or observed by the platform, with its source and attribution claim |
| **delivery day** | `delivery_daily` | The billable roll-up per line item or deal, day and source, with counts and cost: the number invoices and reconciliation read |
| **invoice** | `invoices`, `invoice_lines` | Money owed: an invoice to an advertiser or agency, or a statement owed to a publisher, with lines tied to line items, deals and delivery rows |

Six splits matter in every chapter:

- **Advertiser versus ad account versus agency.** The advertiser is whose money it is; an ad account is that advertiser on one platform, in one currency and time zone; the agency is the operator of the account (`operator_org_id`), and may change without the advertiser's history changing. Agency holding-company reporting groups by operator; brand safety and political-ad rules apply to the advertiser.
- **Property versus ad unit versus seller account.** The property is what an audience visits; the ad unit is a slot on it; the seller account is who sells it on one exchange. ads.txt ties them together: a property's ads.txt lists the seller accounts allowed to sell it, and a seller account's sellers.json row says whether it is the publisher or an intermediary.
- **Campaign versus line item versus creative.** The campaign carries the goal and the budget the advertiser approved; the line item is what an ad server or bidder actually delivers against, with its own targeting, price and pacing; the creative is what renders. Budgets roll up, delivery rolls up, and a creative can serve under many line items.
- **Request versus auction versus bid versus impression.** Most requests at scale are sampled, not stored; an auction is stored for each opportunity that ran one; every bid is a row; an impression is an event, and only an impression bills.
- **Delivered event versus billable count.** `ad_events` are what happened, as logged by this system; `delivery_daily` is what one source says should be paid, after invalid-traffic filtering, per day. The same line item has several `delivery_daily` rows, one per source, and the insertion order names which one controls.
- **Gross spend versus net revenue.** A DSP's client spends gross; the DSP's revenue is its fee. The Trade Desk reports "as an agent on a net basis": $2,896 million of revenue in 2025 on $13.4 billion of gross spend, an implied 21.6% that it doesn't publish as a take rate. An exchange that sets its own price as principal books gross. The money columns keep both: what the buyer paid and what each party kept.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions). Prices and bids are integer micros of the currency, the ad tech convention: a $2.50 CPM is `2500000` in a `*_cpm_micros` column, and money accumulated per impression is the CPM divided by 1,000, so sums are kept in micros and rounded once ([Money & Amounts](/docs/money/amounts)). Invoice amounts are integer minor units, named `*_minor`. Every column name carries its unit. Columns each chapter owns (targeting, pacing, frequency, consent records, measurement sources) are added there:

```sql
CREATE TABLE organizations (             -- any company in the chain
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  parent_id     UUID REFERENCES organizations (id),  -- a holding company, a group
  legal_name    TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  domain        TEXT,                    -- business domain, as in sellers.json and OWNERDOMAIN
  kinds         TEXT[] NOT NULL CHECK (kinds <@ ARRAY['advertiser', 'agency', 'publisher',
                  'network', 'dsp', 'ssp', 'exchange', 'ad_server', 'data_provider',
                  'measurement', 'retailer', 'other']::TEXT[] AND cardinality(kinds) > 0),
  country       CHAR(2) NOT NULL,        -- ISO 3166-1 alpha-2
  status        TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'suspended',
                  'closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE advertisers (               -- a brand being advertised; whose money it is
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  name            TEXT NOT NULL,
  domain          TEXT,                  -- the adomain bidders declare
  category        TEXT,                  -- a content taxonomy ID; drives policy and separation
  verified_at     TIMESTAMPTZ,           -- advertiser verification, where a platform requires it
  status          TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, name)
);

CREATE TABLE ad_accounts (               -- the advertiser on one buying platform
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id    UUID NOT NULL REFERENCES advertisers (id),
  operator_org_id  UUID NOT NULL REFERENCES organizations (id),  -- the agency, or the advertiser's org
  platform         TEXT NOT NULL,        -- 'self', or the external platform's key
  external_ref     TEXT,                 -- the platform's account ID
  currency         CHAR(3) NOT NULL,     -- fixed for the account's life
  time_zone        TEXT NOT NULL,        -- IANA; days in reporting and billing are in this zone
  billing_mode     TEXT NOT NULL CHECK (billing_mode IN ('card_threshold', 'prepay', 'invoice')),
  billing_ref      TEXT,                 -- the payer in the Payments volume's model
  status           TEXT NOT NULL CHECK (status IN ('pending', 'active', 'paused',
                     'suspended', 'closed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (platform, external_ref)
);

CREATE TABLE properties (                -- where an audience is
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_id    UUID NOT NULL REFERENCES organizations (id),
  kind            TEXT NOT NULL CHECK (kind IN ('site', 'app', 'ctv_app', 'podcast',
                    'channel', 'screen_network', 'retail_surface')),
  name            TEXT NOT NULL,
  domain          TEXT,                  -- sites; where ads.txt is crawled
  bundle_id       TEXT,                  -- apps and CTV apps
  store_url       TEXT,                  -- app store listing; app-ads.txt comes from its developer URL
  child_directed  BOOLEAN NOT NULL DEFAULT FALSE,  -- sets the COPPA flag on every request
  status          TEXT NOT NULL CHECK (status IN ('pending', 'active', 'blocked', 'closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (domain IS NOT NULL OR bundle_id IS NOT NULL OR kind IN ('podcast', 'screen_network'))
);

CREATE TABLE ad_units (                  -- a placement on a property
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id  UUID NOT NULL REFERENCES properties (id),
  parent_id    UUID REFERENCES ad_units (id),  -- a section above its slots
  code         TEXT NOT NULL,            -- the path or key the tag sends
  formats      TEXT[] NOT NULL,          -- e.g. {'display','native'} or {'video'}
  sizes        TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {'300x250','320x50'}; empty for video and audio
  position     TEXT CHECK (position IN ('above_fold', 'below_fold', 'header', 'footer',
                 'sidebar', 'in_feed', 'interstitial', 'pre_roll', 'mid_roll', 'post_roll',
                 'search', 'other')),
  status       TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'archived')),
  UNIQUE (property_id, code)
);

CREATE TABLE seller_accounts (           -- a seller ID at an SSP or exchange
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_system_org_id UUID NOT NULL REFERENCES organizations (id),  -- the SSP or exchange
  seller_org_id    UUID NOT NULL REFERENCES organizations (id),  -- the publisher or intermediary
  seller_id        TEXT NOT NULL,        -- the sellers.json seller_id and ads.txt account ID
  seller_type      TEXT NOT NULL CHECK (seller_type IN ('publisher', 'intermediary', 'both')),
  is_confidential  BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'closed')),
  UNIQUE (ad_system_org_id, seller_id)
);

CREATE TABLE buyer_seats (               -- a buyer's seat in an exchange or SSP
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  exchange_org_id   UUID NOT NULL REFERENCES organizations (id),
  buyer_org_id      UUID NOT NULL REFERENCES organizations (id),  -- DSP, agency or advertiser
  seat_id           TEXT NOT NULL,       -- the OpenRTB seat
  status            TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'closed')),
  UNIQUE (exchange_org_id, seat_id)
);

CREATE TABLE insertion_orders (          -- the contract
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id          UUID NOT NULL REFERENCES advertisers (id),
  buyer_org_id           UUID NOT NULL REFERENCES organizations (id),  -- the agency, or the advertiser's org
  seller_org_id          UUID NOT NULL REFERENCES organizations (id),
  number                 TEXT NOT NULL,
  currency               CHAR(3) NOT NULL,
  budget_minor           BIGINT NOT NULL CHECK (budget_minor >= 0),
  flight                 DATERANGE NOT NULL,
  terms_version          TEXT NOT NULL,  -- e.g. 'iab-4as-3.0', or the seller's own terms
  controlling_measurement TEXT NOT NULL CHECK (controlling_measurement IN ('first_party',
                           'third_party_ad_server', 'measurement_vendor')),  -- a delivery_daily.source
  discrepancy_tolerance_bp INT NOT NULL DEFAULT 1000,  -- basis points; 1000 = the 10% rule
  liability              TEXT NOT NULL CHECK (liability IN ('sequential', 'joint', 'agency',
                           'advertiser')),
  status                 TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'signed', 'active',
                           'completed', 'cancelled')),
  signed_at              TIMESTAMPTZ,
  UNIQUE (seller_org_id, number)
);

CREATE TABLE campaigns (                 -- a buy with a goal and a budget
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id       UUID NOT NULL REFERENCES ad_accounts (id),
  insertion_order_id  UUID REFERENCES insertion_orders (id),
  name                TEXT NOT NULL,
  objective           TEXT NOT NULL CHECK (objective IN ('awareness', 'reach', 'traffic',
                        'engagement', 'video_views', 'app_installs', 'leads', 'sales')),
  budget_micros       BIGINT CHECK (budget_micros >= 0),  -- null: budgets on line items
  budget_period       TEXT NOT NULL DEFAULT 'lifetime' CHECK (budget_period IN ('daily',
                        'lifetime')),
  flight              TSTZRANGE NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused',
                        'completed', 'archived')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE line_items (                -- the unit of delivery
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  campaign_id       UUID NOT NULL REFERENCES campaigns (id),
  deal_id           UUID,                -- deals, below: a line item buying one deal
  name              TEXT NOT NULL,
  delivery_type     TEXT NOT NULL CHECK (delivery_type IN ('guaranteed', 'non_guaranteed',
                      'house')),
  priority          SMALLINT NOT NULL,   -- lower serves first, as ad servers rank
  pricing_model     TEXT NOT NULL CHECK (pricing_model IN ('cpm', 'vcpm', 'cpc', 'cpa', 'cpv',
                      'cpcv', 'cps', 'flat_fee')),
  rate_micros       BIGINT CHECK (rate_micros >= 0),  -- the fixed rate or max bid, per the model
  goal_quantity     BIGINT CHECK (goal_quantity > 0), -- impressions, clicks or views booked
  budget_micros     BIGINT CHECK (budget_micros >= 0),
  flight            TSTZRANGE NOT NULL,
  pacing            TEXT NOT NULL DEFAULT 'even' CHECK (pacing IN ('even', 'front_loaded',
                      'asap')),
  targeting         JSONB NOT NULL DEFAULT '{}',  -- an expression tree, owned by Campaigns & Line Items
  frequency_caps    JSONB NOT NULL DEFAULT '[]',  -- e.g. [{"events": 3, "per": {"unit": "day", "count": 1}}]
  status            TEXT NOT NULL CHECK (status IN ('draft', 'ready', 'delivering', 'paused',
                      'completed', 'archived')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (delivery_type <> 'guaranteed' OR goal_quantity IS NOT NULL)
);

CREATE TABLE creatives (                 -- an ad
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id   UUID NOT NULL REFERENCES advertisers (id),
  format          TEXT NOT NULL CHECK (format IN ('display', 'native', 'video', 'audio',
                    'rich_media', 'text', 'product', 'dooh')),
  width           INT,                   -- pixels, display
  height          INT,
  duration_ms     INT,                   -- video and audio
  assets          JSONB NOT NULL,        -- asset URLs or the VAST tag, with checksums
  landing_url     TEXT,
  adomain         TEXT,                  -- the advertiser domain declared in bids
  review_status   TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending',
                    'approved', 'limited', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (format NOT IN ('video', 'audio') OR duration_ms IS NOT NULL)
);

CREATE TABLE line_item_creatives (       -- which creatives a line item may serve
  line_item_id  UUID NOT NULL REFERENCES line_items (id),
  creative_id   UUID NOT NULL REFERENCES creatives (id),
  weight        INT NOT NULL DEFAULT 1 CHECK (weight > 0),
  active        TSTZRANGE,               -- null: the line item's flight
  PRIMARY KEY (line_item_id, creative_id)
);

CREATE TABLE deals (                     -- PMP, preferred or programmatic guaranteed
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  seller_account_id  UUID NOT NULL REFERENCES seller_accounts (id),
  buyer_seat_id      UUID REFERENCES buyer_seats (id),  -- null: open to listed seats in terms
  deal_code          TEXT NOT NULL,      -- the deal ID carried in pmp.deals[].id
  kind               TEXT NOT NULL CHECK (kind IN ('private_auction', 'preferred',
                       'programmatic_guaranteed')),
  floor_cpm_micros   BIGINT CHECK (floor_cpm_micros >= 0),
  fixed_cpm_micros   BIGINT CHECK (fixed_cpm_micros >= 0),
  currency           CHAR(3) NOT NULL,
  flight             TSTZRANGE NOT NULL,
  terms              JSONB NOT NULL DEFAULT '{}',  -- auction type override, curator fee, inventory
  status             TEXT NOT NULL CHECK (status IN ('proposed', 'active', 'paused', 'ended')),
  UNIQUE (seller_account_id, deal_code),
  CHECK (kind = 'private_auction' OR fixed_cpm_micros IS NOT NULL)
);

ALTER TABLE line_items ADD FOREIGN KEY (deal_id) REFERENCES deals (id);

CREATE TABLE ad_requests (               -- one request for ads; sampled or logged
  id             UUID NOT NULL DEFAULT uuidv7(),
  received_at    TIMESTAMPTZ NOT NULL,
  ad_unit_id     UUID NOT NULL REFERENCES ad_units (id),
  external_id    TEXT,                   -- the OpenRTB request ID, or the tag's
  device_type    TEXT CHECK (device_type IN ('desktop', 'phone', 'tablet', 'ctv',
                   'audio_device', 'screen', 'other')),
  country        CHAR(2),
  region         TEXT,                   -- coarse only; no precise location without consent
  gdpr_applies   BOOLEAN,                -- null: unknown, as OpenRTB treats omission
  tcf_string     TEXT,
  gpp_string     TEXT,
  gpp_sids       SMALLINT[],
  gpc            BOOLEAN NOT NULL DEFAULT FALSE,
  coppa          BOOLEAN NOT NULL DEFAULT FALSE,
  sampled        BOOLEAN NOT NULL DEFAULT FALSE,  -- true when kept as a sample of many
  PRIMARY KEY (received_at, id)
) PARTITION BY RANGE (received_at);     -- one partition per hour; drop by retention

CREATE TABLE auctions (                  -- one auction for one opportunity, whoever runs it
  id                     UUID NOT NULL DEFAULT uuidv7(),
  started_at             TIMESTAMPTZ NOT NULL,
  ad_request_id          UUID,           -- no FK across partitioned logs; joined by (time, id)
  runner_org_id          UUID NOT NULL REFERENCES organizations (id),  -- exchange, ad server or garden
  kind                   TEXT NOT NULL CHECK (kind IN ('first_price', 'second_price',
                           'second_price_plus', 'gsp', 'vcg', 'fixed', 'other')),
  floor_cpm_micros       BIGINT,
  currency               CHAR(3) NOT NULL,
  winning_bid_id         UUID,
  clearing_cpm_micros    BIGINT,         -- what the winner pays, before downstream fees
  status                 TEXT NOT NULL CHECK (status IN ('won', 'no_bids', 'below_floor',
                           'timeout', 'blocked')),
  PRIMARY KEY (started_at, id)
) PARTITION BY RANGE (started_at);

CREATE TABLE bids (                      -- every bid in an auction
  id                 UUID NOT NULL DEFAULT uuidv7(),
  auction_started_at TIMESTAMPTZ NOT NULL,
  auction_id         UUID NOT NULL,
  buyer_seat_id      UUID REFERENCES buyer_seats (id),  -- null: an internal line item
  line_item_id       UUID REFERENCES line_items (id),   -- when this system is the bidder or server
  deal_id            UUID REFERENCES deals (id),
  creative_id        UUID REFERENCES creatives (id),
  price_cpm_micros   BIGINT NOT NULL CHECK (price_cpm_micros >= 0),
  outcome            TEXT NOT NULL CHECK (outcome IN ('won', 'lost', 'filtered')),
  loss_reason        SMALLINT,           -- OpenRTB loss reason code
  PRIMARY KEY (auction_started_at, id),
  FOREIGN KEY (auction_started_at, auction_id) REFERENCES auctions (started_at, id)
) PARTITION BY RANGE (auction_started_at);

CREATE TABLE ad_events (                 -- append-only delivery events
  id              UUID NOT NULL DEFAULT uuidv7(),
  occurred_at     TIMESTAMPTZ NOT NULL,  -- event time, from the beacon
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  auction_id      UUID,                  -- null for a direct serve with no auction record
  line_item_id    UUID NOT NULL,
  creative_id     UUID NOT NULL,
  ad_unit_id      UUID NOT NULL,
  kind            TEXT NOT NULL CHECK (kind IN ('impression', 'viewable_impression', 'click',
                    'video_start', 'first_quartile', 'midpoint', 'third_quartile',
                    'complete', 'reward')),
  cost_cpm_micros BIGINT,                -- impressions: the price this event bills at
  ivt             TEXT NOT NULL DEFAULT 'none' CHECK (ivt IN ('none', 'givt', 'sivt')),
  dedupe_key      TEXT NOT NULL,         -- one event per (impression, kind)
  PRIMARY KEY (occurred_at, id),
  UNIQUE (occurred_at, dedupe_key)
) PARTITION BY RANGE (occurred_at);     -- hourly; late beacons land in their event hour

CREATE TABLE conversions (               -- an outcome and who claims it
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id     UUID NOT NULL REFERENCES ad_accounts (id),
  kind              TEXT NOT NULL CHECK (kind IN ('purchase', 'install', 'lead', 'signup',
                      'add_to_cart', 'other')),
  occurred_at       TIMESTAMPTZ NOT NULL,
  source            TEXT NOT NULL CHECK (source IN ('pixel', 'sdk', 'server_api', 'mmp',
                      'retailer_sales', 'offline_upload')),
  value_micros      BIGINT,              -- the advertiser's reported value
  currency          CHAR(3),
  external_id       TEXT,                -- the advertiser's event or order ID, for dedup
  attributed_event_id UUID,              -- the click or impression credited, if any
  attribution_model TEXT,                -- 'last_click', 'data_driven', 'view_through', ...
  attribution_window TEXT,               -- e.g. '7d_click_1d_view'
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ad_account_id, source, external_id)
);

CREATE TABLE delivery_daily (            -- the billable roll-up, one row per source
  line_item_id       UUID REFERENCES line_items (id),
  deal_id            UUID REFERENCES deals (id),
  day                DATE NOT NULL,      -- in the ad account's or the contract's time zone
  source             TEXT NOT NULL CHECK (source IN ('first_party', 'third_party_ad_server',
                       'measurement_vendor', 'exchange', 'buyer')),
  source_org_id      UUID REFERENCES organizations (id),
  impressions        BIGINT NOT NULL DEFAULT 0,
  viewable_impressions BIGINT NOT NULL DEFAULT 0,
  clicks             BIGINT NOT NULL DEFAULT 0,
  completed_views    BIGINT NOT NULL DEFAULT 0,
  invalid_impressions BIGINT NOT NULL DEFAULT 0,  -- removed before the counts above
  cost_micros        BIGINT NOT NULL DEFAULT 0,   -- media cost, sum of CPM micros / 1000, rounded once
  currency           CHAR(3) NOT NULL,
  computed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version            INT NOT NULL DEFAULT 1,      -- restated when late data or IVT arrives
  CHECK ((line_item_id IS NULL) <> (deal_id IS NULL)),
  UNIQUE NULLS NOT DISTINCT (line_item_id, deal_id, day, source, source_org_id)
);

CREATE TABLE invoices (                  -- money owed, either direction
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  direction           TEXT NOT NULL CHECK (direction IN ('receivable', 'payable')),
                                         -- receivable: this system bills a buyer; payable: a publisher statement
  counterparty_org_id UUID NOT NULL REFERENCES organizations (id),
  ad_account_id       UUID REFERENCES ad_accounts (id),
  insertion_order_id  UUID REFERENCES insertion_orders (id),
  number              TEXT NOT NULL,
  period              DATERANGE NOT NULL,
  currency            CHAR(3) NOT NULL,
  total_minor         BIGINT NOT NULL,   -- sum of lines, kept for the document as issued
  status              TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'disputed', 'paid',
                        'credited', 'void')),
  issued_at           TIMESTAMPTZ,
  due_on              DATE,
  UNIQUE (direction, number)
);

CREATE TABLE invoice_lines (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  invoice_id        UUID NOT NULL REFERENCES invoices (id),
  kind              TEXT NOT NULL CHECK (kind IN ('media', 'platform_fee', 'data_fee',
                      'verification_fee', 'ad_serving_fee', 'revenue_share', 'ivt_credit',
                      'make_good_credit', 'discrepancy_adjustment', 'rebate', 'tax')),
  line_item_id      UUID REFERENCES line_items (id),
  deal_id           UUID REFERENCES deals (id),
  billable_source   TEXT CHECK (billable_source IN ('first_party', 'third_party_ad_server',
                      'measurement_vendor', 'exchange', 'buyer')),  -- the delivery_daily source priced on
  quantity          BIGINT,              -- impressions, clicks or views billed
  rate_micros       BIGINT,              -- per the pricing model, or a fee rate in micros of 1
  amount_minor      BIGINT NOT NULL,     -- negative for credits
  rule_ref          TEXT                 -- the IO, fee schedule or agreement version
);
```

Design notes:

- **Micros for prices, minor units for invoices.** OpenRTB prices are CPMs in decimal currency; storing them as `*_cpm_micros` keeps a $0.0001 shading step exact, and cost per impression (CPM / 1,000) stays an integer in micros as long as CPMs move in $0.001 steps. Invoices are documents in a currency's minor units, so the conversion from summed micros to cents happens once, on the invoice line, with the rounding rule recorded. Never add micros to cents in one column.
- **Days are in a time zone the contract names.** A daily budget and a daily billable count are days in the ad account's time zone for a self-serve buyer, and the IO's for a direct deal; `delivery_daily.day` is computed in that zone from `ad_events.occurred_at`, and in this model a changed time zone is a new account, so past days never move.
- **Logs are partitioned by hour and dropped by retention.** `ad_requests`, `auctions`, `bids` and `ad_events` are range-partitioned on their timestamps, one partition per hour, with primary keys that include the timestamp because Postgres requires it. At real scale these tables live in a log store or warehouse, not the transactional database, and the shapes above are their schemas; [Reporting & Data Pipelines](/books/advertising/reporting-and-data-pipelines) covers that. Requests are usually sampled; auctions, winning bids and events are kept whole for the billing period and the dispute window.
- **Event time, not arrival time.** A beacon can arrive minutes or hours late (a phone back online, a delayed SSAI tracking call); `occurred_at` places it in its hour and day, and `delivery_daily` restates with a new `version` until the period closes ([Watermarks and Late Data](/docs/data/streaming#watermarks-and-late-data)).
- **Deduplicate at the event.** Ad servers, SSAI services and SDKs retry beacons, and pages fire them twice. `dedupe_key` (the impression ID and event kind) with a unique constraint makes a retried impression a no-op, the same idea as [Idempotency](/docs/requests/idempotency).
- **Invalid traffic is a flag, then a subtraction.** Every event keeps its `ivt` class rather than being deleted, so a later classification moves counts out of billing without losing what happened; `delivery_daily.invalid_impressions` records what was removed, and invalid activity found after an invoice becomes an `ivt_credit` line.
- **Several counts, one controlling.** `delivery_daily` keeps one row per source per day, and the insertion order's `controlling_measurement` says which one an invoice line is priced on; the line's `billable_source` records it. Reconciliation compares the rows; nothing overwrites another party's count.
- **Consent rides on the request.** The privacy signals are columns on `ad_requests`, so every auction, bid and event can be traced back to the consent state it was made under; GDPR treats a TC string as personal data where it can be linked to an identifier such as an IP address, which is one more reason requests are sampled and retained briefly ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).
- **Organizations carry roles, not types.** Amazon is an advertiser, a publisher, a DSP and a retail media network; Google is an exchange, an ad server, a network and a garden. `organizations.kinds` lists roles, and the role-specific tables (seller accounts, buyer seats, ad accounts) say which hat each record is wearing. A platform selling ad software to many publishers or buyers adds a tenant above organizations, as [Multi-Tenancy](/docs/architecture/multi-tenancy) describes.
- **Money is the Payments model.** `ad_accounts.billing_ref` names the payer in the [Payments](/books/payments/card-payments) volume's model; card charges, invoices paid and publisher payouts are that volume's records, and invoices here point at them.
- **Emit life-cycle events.** `campaign.activated`, `line_item.paused`, `creative.reviewed`, `deal.activated`, `delivery_daily.restated`, `invoice.issued` and `conversion.received` are what pacing, reporting, billing and partners subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)). The ad events themselves go to a stream, not the outbox.

Where other volumes model the same thing, the records map rather than duplicate. Commerce's `ad_spend_daily` ([Retail Media & Marketplace Ads](/books/commerce/retail-media#how-to-build-it)) is an advertiser's import of a platform's `delivery_daily`; Commerce's `conversion_uploads` ([Acquisition & Attribution](/books/commerce/acquisition-and-attribution#how-to-build-it)) arrive here as `conversions` with `source = 'offline_upload'` or `'server_api'`; and Gaming's install attributions ([Mobile Games](/books/gaming/mobile-games#how-to-build-it)) are the app's copy of what a mobile measurement partner reports here as an install conversion.

Each later chapter extends a defined part of this spine. The table lists every chapter's How to Build It section, the existing tables it alters (or only references) and the tables it adds:

| Chapter | Extends | Adds |
| --- | --- | --- |
| [The Advertising Landscape](/books/advertising/advertising-landscape#how-to-build-it) | `buyer_seats`, `seller_accounts` | `organization_ownerships`, `ad_tech_products` |
| [Agencies & Media Buying](/books/advertising/agencies-and-media-buying#how-to-build-it) | `ad_accounts`, `insertion_orders` | `agency_agreements`, `media_plans`, `media_plan_lines`, `vendor_incentives`, `vendor_incentive_allocations` |
| [Publishers & Yield](/books/advertising/publishers-and-yield#how-to-build-it) | `properties`, `ad_units`, `delivery_daily` | `property_traffic_daily`, `ad_unit_yield_daily`, `network_revenue_shares` |
| [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it) | `invoice_lines`, `seller_accounts` | `fee_terms`, `supply_paths`, `supply_path_daily`, `log_match_runs`, `property_quality_assessments` |
| [Ad Servers](/books/advertising/ad-servers#how-to-build-it) | `line_items`, `line_item_creatives`, `auctions` | `exclusion_labels`, `line_item_labels`, `yield_groups`, `yield_group_partners`, `ad_decisions` |
| [Campaigns & Line Items](/books/advertising/campaigns-and-line-items#how-to-build-it) | `campaigns`, `line_items` | `shared_budgets`, `flight_segments`, `targeting_keys`, `targeting_values`, `line_item_versions`, `platform_entity_refs` |
| [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency#how-to-build-it) | `line_items` | `pacing_snapshots`, `delivery_projections`, `make_goods` |
| [Forecasting & Avails](/books/advertising/forecasting-and-avails#how-to-build-it) | `ad_units`, `line_items` | `availability_checks`, `inventory_forecasts`, `forecast_contenders`, `inventory_reservations`, `allocation_plans` |
| [Ad Formats & Standards](/books/advertising/ad-formats#how-to-build-it) | `creatives` | `ad_formats`, `native_asset_specs`, `ad_unit_formats` |
| [Ad Tags, Rendering & Page Performance](/books/advertising/ad-tags-and-rendering#how-to-build-it) | `ad_units` | `ad_unit_render_configs`, `ad_render_reports` |
| [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco#how-to-build-it) | `creatives`, `line_item_creatives`, `ad_events` | `creative_assets`, `creative_versions`, `creative_reviews`, `dynamic_creative_feeds`, `dynamic_creative_feed_rows`, `dynamic_creative_rules` |
| [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks#how-to-build-it) | `ad_events`, `delivery_daily` | `counting_policies`, `beacon_receipts`, `click_validations` |
| [How Programmatic Works](/books/advertising/how-programmatic-works#how-to-build-it) | `ad_requests`, `auctions` | `bid_requests`, `user_id_syncs` |
| [OpenRTB](/books/advertising/openrtb#how-to-build-it) | `ad_requests`, `bids` | `bid_notices`, `rtb_extension_fields` |
| [Demand-Side Platforms](/books/advertising/demand-side-platforms#how-to-build-it) | `buyer_seats`, `fee_terms`, `bids` | `supply_sources` |
| [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges#how-to-build-it) | `bid_requests`, `auctions` | `bidder_connections`, `connection_filters` |
| [Header Bidding & Prebid](/books/advertising/header-bidding-and-prebid#how-to-build-it) | `auctions`, `bids` | `wrapper_configs`, `price_granularities`, `price_granularity_buckets`, `header_bidder_configs`, `price_bucket_line_items` |
| [Deals, PMPs & Curation](/books/advertising/deals-and-curation#how-to-build-it) | `deals`, `invoice_lines` | `deal_buyer_seats`, `deal_targeting`, `curation_packages`, `deal_syncs`, `deal_health_daily` |
| [ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain#how-to-build-it) | `properties`, `seller_accounts` | `ads_txt_crawls`, `ads_txt_records`, `ads_txt_variables`, `sellers_json_crawls`, `sellers_json_entries`, `supply_chain_checks` |
| [The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases#how-to-build-it) | `auctions`, `bids` | `auction_rule_versions`, `exchange_floors`, `data_exports` |
| [Auction Mechanics](/books/advertising/auction-mechanics#how-to-build-it) | `auction_rule_versions`, `auctions`, `bids` | `auction_slots` |
| [Automated Bidding](/books/advertising/automated-bidding#how-to-build-it) | `line_items`, `bids` | `bid_strategies`, `bid_strategy_states`, `bid_strategy_adjustments` |
| [Pricing Models](/books/advertising/pricing-models#how-to-build-it) | `line_items`, `delivery_daily`, `invoice_lines` | `rate_cards`, `rate_card_entries` |
| [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization#how-to-build-it) | `exchange_floors`, `auctions` | `floor_policies`, `floor_experiments`, `floor_experiment_arms` |
| [Third-Party Cookies & Browser Privacy](/books/advertising/cookies-and-browser-privacy#how-to-build-it) | `ad_requests`, `user_id_syncs` | `browser_storage_policies`, `storage_disclosures` |
| [Identifiers After Cookies](/books/advertising/identifiers-after-cookies#how-to-build-it) | `bid_requests` | `id_sources`, `ad_request_eids`, `id_opt_outs`, `identity_coverage_daily` |
| [First-Party Data & Audiences](/books/advertising/first-party-data-and-audiences#how-to-build-it) | `platform_entity_refs` | `audiences`, `audience_members`, `audience_uploads`, `audience_usages` |
| [Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies#how-to-build-it) | `targeting_values`, `properties`, `ad_requests` | `taxonomies`, `taxonomy_nodes`, `taxonomy_node_maps`, `content_classifications`, `geo_regions` |
| [Data Clean Rooms](/books/advertising/data-clean-rooms#how-to-build-it) | references `organizations`, `campaigns` | `clean_room_collaborations`, `clean_room_members`, `clean_room_datasets`, `privacy_budgets`, `clean_room_query_runs` |
| [Data Brokers & Third-Party Data](/books/advertising/data-brokers#how-to-build-it) | `fee_terms`, `invoice_lines` | `data_segments`, `data_segment_usage_daily`, `data_broker_registrations`, `broker_deletion_runs` |
| [Mobile Ad IDs, ATT & SKAdNetwork](/books/advertising/mobile-ad-ids-and-att#how-to-build-it) | `ad_requests`, `conversions` | `source_id_allocations`, `conversion_value_schemas`, `attribution_postbacks` |
| [Measurement Standards & the MRC](/books/advertising/measurement-standards-and-the-mrc#how-to-build-it) | `delivery_daily` | `accreditations`, `measurement_integrations` |
| [Viewability & Attention](/books/advertising/viewability-and-attention#how-to-build-it) | `delivery_daily` | `viewability_standards`, `viewability_measurements`, `attention_daily` |
| [Attribution](/books/advertising/attribution#how-to-build-it) | `conversions` | `conversion_actions`, `attribution_settings`, `conversion_receipts`, `attribution_credits` |
| [Incrementality & Lift](/books/advertising/incrementality-and-lift#how-to-build-it) | `campaigns`, `conversions` | `lift_studies`, `lift_study_cells`, `lift_study_assignments`, `ghost_impressions`, `lift_study_exposures`, `lift_study_results` |
| [Marketing Mix Modeling](/books/advertising/marketing-mix-modeling#how-to-build-it) | references `advertisers`, `line_items`, `lift_study_results` | `delivery_geo_daily`, `mmm_datasets`, `mmm_runs`, `mmm_priors`, `mmm_channel_results` |
| [Audience & Cross-Media Measurement](/books/advertising/audience-measurement#how-to-build-it) | `insertion_orders` | `universe_estimates`, `measurement_currencies`, `methodology_versions`, `audience_delivery_daily` |
| [Mobile Measurement Partners](/books/advertising/mobile-measurement-partners#how-to-build-it) | `attribution_postbacks` | `mmp_apps`, `attribution_links`, `mmp_engagements`, `mmp_attributions`, `san_claims`, `fraud_rejections`, `network_postbacks` |
| [Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud#how-to-build-it) | `ad_events`, `delivery_daily` | `ivt_filter_lists`, `ivt_filter_list_entries`, `ivt_findings`, `ivt_adjustments` |
| [Brand Safety & Suitability](/books/advertising/brand-safety-and-suitability#how-to-build-it) | `line_items`, `content_classifications` | `suitability_profiles`, `site_lists`, `site_list_entries`, `line_item_site_lists`, `brand_safety_daily` |
| [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising#how-to-build-it) | `creative_reviews`, `advertisers` | `ad_policies`, `creative_review_violations`, `ad_scans`, `policy_enforcements` |
| [Search Advertising](/books/advertising/search-advertising#how-to-build-it) | `bids` | `keywords`, `negative_keyword_lists`, `negative_keywords`, `negative_keyword_list_campaigns`, `search_terms_daily`, `keyword_quality_daily` |
| [Social Advertising](/books/advertising/social-advertising#how-to-build-it) | `campaigns`, `line_items` | `ad_surfaces`, `ad_load_rules`, `line_item_surfaces`, `feed_ad_decisions` |
| [Retail Media Networks](/books/advertising/retail-media-networks#how-to-build-it) | `conversions` | `retail_catalog_items`, `product_ads`, `retail_attribution_rules`, `audience_activations` |
| [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms#how-to-build-it) | `ad_accounts` | `advertiser_verifications`, `manager_links`, `account_grants`, `api_clients`, `report_jobs`, `change_events` |
| [Connected TV & Streaming](/books/advertising/connected-tv#how-to-build-it) | `properties`, `ad_requests` | `ctv_distributions`, `acr_exposures` |
| [VAST & Video Ads](/books/advertising/vast-and-video-ads#how-to-build-it) | `creatives`, `ad_events` | `creative_renditions`, `vast_responses`, `vast_errors` |
| [Server-Side Ad Insertion & Ad Pods](/books/advertising/server-side-ad-insertion#how-to-build-it) | `auctions`, `bids` | `ssai_sessions`, `ad_breaks` |
| [Linear TV, Upfronts & Addressable TV](/books/advertising/linear-tv-and-upfronts#how-to-build-it) | `insertion_orders`, `make_goods` | `upfront_commitments`, `audience_guarantees`, `spot_airings` |
| [Audio & Podcasts](/books/advertising/audio-and-podcasts#how-to-build-it) | `ad_events` | `podcast_episodes`, `podcast_downloads`, `dai_insertions`, `host_read_spots` |
| [In-App Advertising & Mediation](/books/advertising/in-app-advertising#how-to-build-it) | `yield_groups` | `app_sdk_integrations`, `mediation_instances`, `impression_revenue_events`, `network_revenue_reports` |
| [Ads in Games](/books/advertising/ads-in-games#how-to-build-it) | references `properties`, `ad_units` | `reward_callbacks`, `signing_keys`, `ingame_surfaces` |
| [Digital Out-of-Home](/books/advertising/digital-out-of-home#how-to-build-it) | `ad_requests`, `ad_events`, `delivery_daily` | `dooh_screens`, `impression_multipliers`, `play_logs` |
| [Consent Management & the TCF](/books/advertising/consent-and-the-tcf#how-to-build-it) | `organizations`, `ad_requests`, `bid_requests` | `gvl_versions`, `gvl_vendors`, `cmp_deployments`, `privacy_rule_versions` |
| [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs#how-to-build-it) | `ad_requests` | `opt_out_records`, `opt_out_deliveries` |
| [US State Privacy Law for Advertising](/books/advertising/us-state-privacy-law#how-to-build-it) | `ad_requests` | `privacy_jurisdictions`, `privacy_agreements`, `privacy_risk_assessments` |
| [Children, Teens & Advertising](/books/advertising/children-and-teens#how-to-build-it) | `properties`, `ad_requests`, `creatives` | `audience_determinations` |
| [GDPR & ePrivacy for Ads](/books/advertising/gdpr-and-eprivacy-for-ads#how-to-build-it) | `storage_disclosures`, `ad_requests` | `consent_or_pay_offers`, `legitimate_interest_assessments` |
| [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads#how-to-build-it) | `ad_decisions` | `ad_repository_entries`, `political_ad_declarations`, `cross_service_consents` |
| [Sensitive Data & Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting#how-to-build-it) | `campaigns`, `taxonomy_nodes` | `sensitive_places`, `geofence_restrictions`, `delivery_fairness_measurements` |
| [Advertising Content Law](/books/advertising/advertising-content-law#how-to-build-it) | `advertiser_verifications`, `creative_reviews` (reason codes) | `regulated_category_rules`, `substantiation_files`, `ad_claims`, `ad_claim_evidence`, `audience_composition_checks` |
| [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms#how-to-build-it) | `insertion_orders` | `contract_terms`, `insertion_order_lines`, `insertion_order_revisions` |
| [Billing & Invoicing](/books/advertising/billing-and-invoicing#how-to-build-it) | `invoices`, `invoice_lines` | `billing_profiles`, `billing_periods`, `billing_runs`, `invoice_line_sources` |
| [Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies#how-to-build-it) | `invoice_lines` | `reconciliation_runs`, `reconciliation_lines`, `discrepancy_cases` |
| [Advertiser Payments & Credit](/books/advertising/advertiser-payments-and-credit#how-to-build-it) | `ad_accounts` | `billing_thresholds`, `threshold_charges`, `credit_lines`, `account_balance_entries` |
| [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts#how-to-build-it) | references `seller_accounts`, `network_revenue_shares`, `ivt_adjustments`, `invoices` | `publisher_payment_settings`, `publisher_earnings_entries`, `payout_holds` |
| [Advertising Revenue Accounting](/books/advertising/advertising-revenue-accounting#how-to-build-it) | `line_items` | `principal_agent_assessments`, `revenue_recognition_entries`, `rebate_accruals` |
| [Ad Platform Architecture](/books/advertising/ad-platform-architecture#how-to-build-it) | `ad_requests`, `ad_decisions`, `auctions`, `ad_events` | `serving_snapshots`, `snapshot_rollouts`, `kill_switches` |
| [Real-Time Bidding at Scale](/books/advertising/bidding-at-scale#how-to-build-it) | `bid_requests` | `callout_quotas`, `bid_funnel_hourly`, `request_path_costs_daily` |
| [Reporting & Data Pipelines](/books/advertising/reporting-and-data-pipelines#how-to-build-it) | `delivery_daily`, `data_exports`, `report_jobs` | `aggregation_runs`, `delivery_daily_versions`, `log_data_feeds` |
| [Machine Learning for Ads](/books/advertising/machine-learning-for-ads#how-to-build-it) | `bids` | `ad_models`, `ad_model_versions`, `ad_model_deployments`, `ad_model_evaluations` |
| [AI in Advertising](/books/advertising/ai-in-advertising#how-to-build-it) | `creative_versions`, `change_events` | `creative_ai_settings`, `asset_generations`, `agent_mandates`, `agent_actions` |
| [Advertising Metrics](/books/advertising/advertising-metrics#how-to-build-it) | reads the tables above; alters none | `metric_definitions`, `metric_values` |

One concept, one table, reused rather than redefined:

- **Fees.** `fee_terms` ([Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it)) is the one table for every fee one party charges another (DSP, exchange, curator, data, verification, agency); [Demand-Side Platforms](/books/advertising/demand-side-platforms#how-to-build-it) and [Data Brokers & Third-Party Data](/books/advertising/data-brokers#how-to-build-it) widen its fee bases and caps rather than adding a fee table, and invoice lines point at it through `invoice_lines.fee_term_id`.
- **Postbacks.** `attribution_postbacks` ([Mobile Ad IDs, ATT & SKAdNetwork](/books/advertising/mobile-ad-ids-and-att#how-to-build-it)) is the one table for SKAdNetwork and AdAttributionKit postbacks, with `conversion_value_schemas` and `source_id_allocations`; [Mobile Measurement Partners](/books/advertising/mobile-measurement-partners#how-to-build-it) extends it.
- **Floors.** `exchange_floors` ([The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases#how-to-build-it)) is the one floor rule table, widened by [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization#how-to-build-it) for dynamic floors and experiments.
- **Creative review.** `creative_reviews` ([Creative Production, Review & DCO](/books/advertising/creative-production-and-dco#how-to-build-it)) is the one review decision record; [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising#how-to-build-it) links each review to its malware scan and records violations against it, and [Advertising Content Law](/books/advertising/advertising-content-law#how-to-build-it) adds content-law reason codes.
- **Consent.** The privacy signals stay on `ad_requests`; [Consent Management & the TCF](/books/advertising/consent-and-the-tcf#the-consent-signal-model) defines the `ads_mode` every decision reads, and [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs#how-to-build-it) holds persistent opt-outs in `opt_out_records`.

Chapters change tables that already hold rows, so their `ALTER`s are written to run on a live database: checks, required columns and foreign keys on existing columns are added `NOT VALID`, which checks new rows without scanning the old ones, and indexes and unique keys are built `CONCURRENTLY`. Once any backfill is done, each `NOT VALID` constraint is validated under a lock that doesn't block reads or writes ([Zero-Downtime Migrations](/docs/database/zero-downtime-migrations#lock-aware-ddl)). On the partitioned logs, an index is built `CONCURRENTLY` on each partition and then attached to an index created `ON ONLY` the parent, since Postgres can't build a partitioned index concurrently in one statement. For a check that every priced line item carries its rate:

```sql
ALTER TABLE line_items ADD CONSTRAINT line_items_rate_required_check
  CHECK (pricing_model = 'flat_fee' OR rate_micros IS NOT NULL) NOT VALID;

-- after backfilling rates on old rows
ALTER TABLE line_items VALIDATE CONSTRAINT line_items_rate_required_check;
```

## Auditing

The records in this chapter are the ones advertisers, agencies, publishers, auditors, regulators and courts ask about later:

- **What was bought, on which terms.** Every insertion order with its terms version, controlling measurement and tolerance, every deal with its price and seats, and every line item with its targeting, price, pacing and frequency caps as they stood when each impression served, so a make-good, a discrepancy claim or a discrimination complaint is judged against what was actually configured.
- **Every auction, every bid.** The auction type, the floor, each bid with its seat, deal and price, the winner and the clearing price, kept for the dispute window. The MRC's auction transparency standards require disclosing the auction type, how a bid converts to a clearing price, and reserve prices, which "should not be set on a per-buyer basis"; the court record in the US ad tech case was built on exactly these records.
- **What the consent state was.** The TCF string, GPP string, GPC and COPPA flags on each request, so every downstream use of data can be traced to the signal it was made under when a data protection authority or a state attorney general asks.
- **Every count, by source.** Each party's daily billable counts, the invalid traffic removed from each, and which count each invoice line was priced on.
- **Every fee as its own line.** Media, platform fees, data, verification, ad serving, revenue shares, credits and rebates on invoices and statements, with the agreement that produced each, so a principal-based buy, a rebate or an "unknown delta" can be traced.
- **What ran.** Every creative as served, its review decision and its advertiser's verification, for ad libraries and political ad repositories and for a malvertising investigation.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Separate the advertiser from its ad accounts and from the agency operating them,** and fix each account's currency and time zone.
- **Separate the property from its ad units and from the seller accounts selling it,** and keep the seller account matched to ads.txt and sellers.json.
- **Separate the campaign from the line item from the creative,** and deliver against line items.
- **Store auctions and bids as records whoever runs the auction,** with the type, floor, every bid and the clearing price.
- **Keep prices in integer micros and invoices in minor units,** with the unit in every column name, and round once.
- **Carry the consent signals on the request** and let every downstream record point back to it.
- **Make delivery events append-only, deduplicated and timestamped at the event,** with invalid traffic as a flag, not a deletion.
- **Keep one billable count per source per day,** name the controlling one in the contract, and price invoice lines on it.
- **Store every fee and credit as its own line** with its rate and agreement, and compute every party's take as a sum.
- **Point at the Payments model** for card charges, invoice payments and publisher payouts instead of rebuilding them.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), auction types, tmax, bidfloor, nurl, burl and lurl, the regs and consent fields, schain in the source object, and the video pod fields
- [IAB Tech Lab: OpenRTB 2.x releases](https://github.com/InteractiveAdvertisingBureau/openrtb2.x/releases), 2.6 as the maintained protocol through the 202611 release
- [IAB Tech Lab: SupplyChain object](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb/main/supplychainobject.md), nodes back to the inventory owner
- [IAB Tech Lab: sellers.json 1.0](https://iabtechlab.com/wp-content/uploads/2019/07/Sellers.json_Final.pdf), seller types, seller IDs matching ads.txt and schain, confidentiality
- [IAB Tech Lab: ads.txt](https://iabtechlab.com/ads-txt/), authorized sellers, app-ads.txt and the 1.1 version
- [IAB Tech Lab: CTV Programmatic Guide](https://iabtechlab.com/standards-old/ctv-programmatic-guide/), the X-Device-IP and X-Device-User-Agent headers from stitchers and the ad pod
- [W3C: Global Privacy Control](https://w3c.github.io/gpc/), the Sec-GPC header
- [IAB Europe: Transition to TCF v2.3](https://iabeurope.eu/all-you-need-to-know-about-the-transition-to-tcf-v2-3/), the mandatory disclosedVendors segment and the February 28, 2026 deadline
- [IAB Tech Lab: Global Privacy Platform sections](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Sections/Section%20Information.md), section IDs including usnat and the state sections
- [MRC: Viewable Ad Impression Measurement Guidelines v2.0](https://mediaratingcouncil.org/sites/default/files/Standards/081815%20Viewable%20Ad%20Impression%20Guideline_v2.0_Final.pdf), the display, large-ad and video viewability thresholds
- [IAB: Revised ad measurement guidelines (2017)](https://www.iab.com/news/mrc-joined-iab-tech-lab-mma-announces-releases-revised-ad-measurement-guidelines-mobile-app-mobile-web-desktop-display/), count-on-begin-to-render
- [Google Ad Manager Help: Begin-to-render impression counting for display ads](https://support.google.com/admanager/answer/16896667), display on web, mobile web and CTV banner moving to begin-to-render on February 17, 2027; app and video already compliant
- [MRC: IVT Detection and Filtration Guidelines Addendum](https://mediaratingcouncil.org/sites/default/files/Standards/IVT%20Addendum%20Update%20062520.pdf), GIVT and SIVT definitions
- [MRC: Digital Advertising Auction Transparency Standards](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), closed-loop and OpenRTB auctions, auction type and reserve price disclosure
- [IAB/MRC: Retail Media Measurement Guidelines](https://www.iab.com/wp-content/uploads/2024/01/IAB_Retail_Media_Measurement_Guidelines_January2024.pdf), attribution windows and viewable impressions for outcomes
- [IAB/4A's: Standard Terms and Conditions for Internet Advertising, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), controlling measurement, the 10% discrepancy rule, cancellation notice, invoicing and payment, sequential liability

**Regulation**

- [Federal Register: Children's Online Privacy Protection Rule (April 22, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm), the amended rule and its compliance date
- [FTC: Changes to the children's privacy rule (January 16, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data), separate parental consent for disclosure for targeted advertising
- [California Attorney General: CCPA](https://oag.ca.gov/privacy/ccpa), GPC as a valid opt-out request
- [Court of Justice of the EU: Press release 44/24, Case C-604/22](https://curia.europa.eu/jcms/upload/docs/application/pdf/2024-03/cp240044en.pdf), the TC string as personal data

**Court records**

- [United States v. Google LLC, E.D. Va. No. 1:23-cv-00108, Memorandum Opinion (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), the open-web display markets, AdX's take rate of around 20%, DFP fees of about 1.3 to 1.7%, and $20 to $40 of every $100 going to ad tech

**Filings**

- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), Search & other, YouTube ads and Network revenue, and traffic acquisition costs
- [Meta Platforms: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm), advertising and total revenue
- [Amazon.com: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), advertising revenue recognized as ads are delivered, and who buys
- [Amazon.com: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000002/amzn-20251231xex991.htm), quarterly advertising services net sales for 2025
- [Walmart: Fourth quarter fiscal 2026 results](https://www.sec.gov/Archives/edgar/data/104169/000010416926000032/earningsreleasefy26q4.htm), the global advertising business and how advertising is recorded
- [Maplebear (Instacart): Fourth quarter 2025 shareholder letter](https://www.sec.gov/Archives/edgar/data/1579091/000157909126000006/cartfourthquarter2025sha.htm), advertising and other revenue and its share of GTV
- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), the platform fee, net reporting as agent, gross spend, and paying suppliers before collecting from clients
- [The Trade Desk: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000009/ttd-20260225x8kexx991.htm), 2025 revenue and gross spend
- [Magnite: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000010/a991-earningsq42025.htm), CTV's share of contribution ex-TAC
- [Omnicom: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/29989/000002998926000002/a2025q4earningsrelease.htm), the closing of the Interpublic acquisition

**Reference**

- [IAB: Digital ad revenue climbs to nearly $300B](https://www.iab.com/news/digital-ad-revenue-climbs-to-nearly-300b-as-iab-celebrates-30-year-anniversary/), 2025 internet advertising revenue, programmatic and commerce media
- [IAB: Internet Advertising Revenue Report, full year 2025](https://www.iab.com/insights/internet-advertising-revenue-report-full-year-2025/), the report as the benchmark for US advertising revenue
- [ISBA: Programmatic Supply Chain Transparency Study, executive summary (2020)](https://www.isba.org.uk/system/files/media/documents/2020-12/executive-summary-programmatic-supply-chain-transparency-study.pdf), the split of advertiser spend to publishers
- [ISBA: Second programmatic supply chain study (2023)](https://www.isba.org.uk/article/isbas-programmatic-supply-chain-study-finds-match-rate-increases-and-reduction), the 58% match rate and 3% unknown delta
- [ANA: Programmatic transparency benchmark, third quarter 2025](https://www.ana.net/content/show/id/pr-2025-11-transparency), the share of spend reaching publishers and CTV's share of programmatic spend
- [ANA: Programmatic Media Supply Chain Transparency Study](https://www.ana.net/content/show/id/media-programmatic-transparency), 36 cents of every dollar reaching the consumer

**In practice**

- [Amazon Ads: Amazon DSP](https://advertising.amazon.com/solutions/products/amazon-dsp), Amazon DSP as part of Amazon Ads Agent, with programmatic buying through DVA+
- [Google AdSense: Revenue share](https://support.google.com/adsense/answer/180195?hl=en), the 80% sell-side share, the 68% net through Google Ads, and undisclosed shares for other products
- [Google: Evolving how publishers monetize with AdSense](https://blog.google/products/adsense/evolving-how-publishers-monetize-with-adsense/), the split fee and the 15% average buy-side fee
- [Google: Display buying and publisher revenue share (2020)](https://blog.google/products/admanager/display-buying-share-revenue-publishers/), over 69% kept by publishers in 2019
- [Google Ad Manager: Line item types and priorities](https://support.google.com/admanager/answer/177279?hl=en), priority values by line item type
- [Google Ad Manager: Dynamic allocation](https://support.google.com/admanager/answer/3721872?hl=en), temporary CPM for guaranteed line items
- [Google Ad Manager: Pricing rules and the revenue share](https://support.google.com/admanager/answer/9298211?hl=en), floors applying to the net bid
- [Google Ads: Ad Rank](https://support.google.com/google-ads/answer/1722122?hl=en), the factors in Ad Rank
- [Google Ads: Actual cost-per-click](https://support.google.com/google-ads/answer/6297), paying what's minimally required to clear the next Ad Rank and thresholds, rounding and the max CPC cap
- [Google Ads: Quality Score](https://support.google.com/google-ads/answer/6167118?hl=en), Quality Score as a diagnostic, not an auction input
- [Google Ads: Invalid traffic](https://support.google.com/google-ads/answer/2549113), filtering before billing and credits after
- [Meta: How Facebook uses machine learning to deliver ads](https://business.meta.com/news/good-questions-real-answers-how-does-facebook-use-machine-learning-to-deliver-ads/), total value from bid, estimated action rate and ad quality
- [Prebid: Introduction](https://docs.prebid.org/overview/intro.html), Prebid.js, Prebid Server and Prebid Mobile
- [Amazon Publisher Services: Transparent Ad Marketplace](https://aps.amazon.com/aps/transparent-ad-marketplace/), server-to-server header bidding
- [Google AdMob: Mediation](https://support.google.com/admob/answer/3063564), bidding and the waterfall by average eCPM
- [AppLovin MAX: Getting started](https://support.applovin.com/en/max/getting-started), bidding and traditional networks competing by CPM
- [Google AdMob: Server-side verification callbacks](https://developers.google.com/admob/android/ssv), the callback parameters and signature
- [Netflix: Third season of ads](https://about.netflix.com/en/news/netflix-third-season-of-ads-and-a-look-ahead-at-whats-next), programmatic buying through AJA, Amazon, DV360, The Trade Desk and Yahoo DSP
