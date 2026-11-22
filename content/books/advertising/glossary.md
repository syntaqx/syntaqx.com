+++
title = "Advertising Glossary"
nav_title = "Glossary"
description = "Every advertising term by part, from the parties, money splits and core records of the ad business to serving, programmatic, measurement and the law."
category = "Advertising Industry"
order = 2999
part = "Reference"
tags = ["advertising", "glossary", "reference"]
+++

Advertising borrows its words from media buying, auctions, statistics and privacy law, and the same word shifts with context: an impression is an event to an ad server and a billable unit to a contract, a seat is a buyer's account at an exchange, and "net" means after the platform's fee to a publisher and after the agency's commission to a media buyer. Entries are grouped by the part of the volume that explains them, alphabetized within each group, and each is one line and a link to the chapter that owns the idea; a word with two meanings appears once per meaning, qualified. The volume's own names for the core records (organization, advertiser, ad account, property, ad unit, seller account, buyer seat, insertion order, campaign, line item, creative, deal, ad request, auction, bid, ad event, conversion, delivery day, invoice) are the ones in [The Core Data Model](/books/advertising/advertising-business#the-core-data-model).

## The Business

- **Ad account:** an advertiser's account on one buying platform, in one currency and time zone, operated by the advertiser or an agency ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Ad event:** an append-only delivery record (impression, viewable impression, click, video quartile, completion, reward), timestamped at the event and flagged for invalid traffic ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Ad network:** a company that aggregates many publishers' inventory and sells it as one, such as AdSense or AdMob ([The Advertising Business](/books/advertising/advertising-business#who-s-who)).
- **Ad request:** one request for ads from a property and ad unit, carrying device, coarse location and the privacy signals ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).
- **Ad unit:** a placement on a property, with its sizes, formats and position; hierarchical ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Advertiser:** a brand being advertised, the party whose money it is, owned by an organization ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Agency:** a company that plans and buys media for advertisers and operates their ad accounts, usually inside a holding company ([The Advertising Business](/books/advertising/advertising-business#who-s-who)).
- **Auction:** one competition for one impression opportunity, whoever runs it (an exchange, a publisher ad server, a walled garden), with a type, a floor, a winner and a clearing price ([The Advertising Business](/books/advertising/advertising-business#the-open-web-and-the-walled-gardens)).
- **Bid:** a buyer's offer in an auction, with its seat, deal, price, creative, outcome and loss reason ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Billable count:** one party's daily roll-up of delivery after invalid-traffic filtering, which an invoice line is priced on ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Buyer seat:** a buyer's account at an exchange or SSP, for a DSP, an agency or an advertiser ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Campaign:** a buy with a goal and a budget, under an ad account and optionally an insertion order ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Commerce media:** advertising sold by retailers and other commerce platforms using their shopper data; $63.4 billion of US internet advertising in 2025 by IAB's count ([The Advertising Business](/books/advertising/advertising-business#the-open-web-and-the-walled-gardens)).
- **Conversion:** an outcome (a purchase, install or lead) reported to or observed by a platform, with its source and the attribution claim on it ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Creative:** an ad, with its format, size or duration, assets, landing URL and review status ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Delivery day:** the `delivery_daily` row: one source's billable counts and cost for a line item or deal on one day ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Insertion order (IO):** the contract between an advertiser or agency and a seller, with dates, budget, terms version and controlling measurement ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Invoice line:** one amount on an invoice or publisher statement (media, a fee, a revenue share, a credit), with the delivery source and agreement it was priced on ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Line item:** the unit of delivery (an ad group, ad set or line item), with its dates, budget, priority, price, targeting, pacing and frequency caps ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Micros:** integer millionths of a currency unit, the ad tech convention for prices and bids ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Open web:** advertising split across interoperating companies (publisher ad servers, exchanges, DSPs, verification) that talk through standards, as opposed to a walled garden ([The Advertising Business](/books/advertising/advertising-business#the-open-web-and-the-walled-gardens)).
- **Organization:** any company in the chain, holding one or more roles (advertiser, agency, publisher, network, exchange, DSP, measurement vendor) ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Property:** a publisher's site, app, CTV app, podcast, channel, screen network or retail surface ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Publisher:** the owner of an audience and its ad space ([The Advertising Business](/books/advertising/advertising-business#who-s-who)).
- **Seller account:** a seller ID at an SSP or exchange, the sellers.json row, for a publisher or an intermediary ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Traffic acquisition cost (TAC):** what a platform pays partners whose sites or distribution carried its ads; 20.3% of Alphabet's advertising revenues in 2025 ([The Advertising Business](/books/advertising/advertising-business#a-self-serve-search-or-social-click)).
- **Unknown delta:** advertiser spend a supply-chain study can't trace to a fee or to the publisher; 15% in ISBA's 2020 study and 3% in its second ([The Advertising Business](/books/advertising/advertising-business#an-open-auction-programmatic-impression)).
- **Walled garden:** a platform that owns the audience, the inventory, the auction, the ad server and the measurement in one company ([The Advertising Business](/books/advertising/advertising-business#the-open-web-and-the-walled-gardens)).

## Ad Serving and Creative

- **Ad server:** the system that decides which ad serves and records it; a publisher ad server ranks line items and demand, an advertiser ad server hosts and tracks creatives ([The Advertising Business](/books/advertising/advertising-business#who-s-who)).
- **Dynamic allocation:** an ad server letting guaranteed line items compete with a temporary CPM, so other demand wins only when it pays more than the guarantee needs ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).
- **Impression:** an ad counted as served; under MRC and IAB guidelines, counted when it begins to render ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).
- **Priority (line item):** the rank an ad server gives a line item's class, lower serving first: sponsorship, standard, remnant and house ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).

## Programmatic

- **ads.txt:** a file on a publisher's domain listing the seller accounts authorized to sell its inventory, each as direct or reseller ([The Advertising Business](/books/advertising/advertising-business#who-s-who)).
- **Billing notice (burl):** the URL an exchange calls when a winning bid becomes billable under its own policy ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).
- **Deal:** a private marketplace, preferred or programmatic guaranteed arrangement between a seller and a buyer, carried in bid requests by its deal ID ([The Advertising Business](/books/advertising/advertising-business#an-open-auction-programmatic-impression)).
- **DSP (demand-side platform):** a platform that bids on impressions across many exchanges for advertisers and agencies ([The Advertising Business](/books/advertising/advertising-business#who-s-who)).
- **Header bidding:** asking several exchanges for bids before the publisher ad server decides, through Prebid or a server-to-server service, and passing the best bids in as key-values ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).
- **Loss notice (lurl):** the URL an exchange calls when a bid is known to have lost, often with a reason ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).
- **OpenRTB:** IAB Tech Lab's protocol for bid requests and responses between exchanges and bidders; 2.6 is the maintained version ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).
- **Programmatic:** buying and selling impressions through automated auctions and deals; $162.4 billion of US internet advertising in 2025 by IAB's count ([The Advertising Business](/books/advertising/advertising-business#an-open-auction-programmatic-impression)).
- **Programmatic guaranteed:** a deal with a fixed price and reserved volume that runs through programmatic pipes and books like an IO ([The Advertising Business](/books/advertising/advertising-business#an-open-auction-programmatic-impression)).
- **sellers.json:** a file on an ad system's domain listing its seller IDs, each as publisher, intermediary or both ([The Advertising Business](/books/advertising/advertising-business#who-s-who)).
- **SSP (supply-side platform):** a platform that runs auctions for publishers' impressions across many buyers; with an exchange, the supply side ([The Advertising Business](/books/advertising/advertising-business#who-s-who)).
- **SupplyChain object (schain):** the list of every seller that handled a bid request, back to the inventory owner, carried in OpenRTB's source object ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).
- **Win notice (nurl):** the URL an exchange may call when a bid wins, which OpenRTB says doesn't by itself mean a delivered or billable ad ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).

## Auctions and Pricing

- **Clearing price:** what the winner of an auction pays, before downstream fees ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **CPM:** cost per thousand impressions, the unit most display, video and programmatic prices are quoted in ([The Advertising Business](/books/advertising/advertising-business#how-the-money-splits)).

## Measurement

- **Viewable impression:** an impression with at least 50% of its pixels in view for one continuous second (two seconds of play for video), under the MRC's guidelines ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).

## Fraud and Brand Safety

- **Invalid traffic (IVT):** impressions and clicks that don't come from genuine human interest; general (GIVT, caught by lists and routine checks) or sophisticated (SIVT, needing advanced analysis) ([The Advertising Business](/books/advertising/advertising-business#the-life-of-an-impression)).

## Walled Gardens

- **Ad Rank:** the score that orders ads in a search auction, from the bid, auction-time quality, thresholds, competitiveness, context and the expected impact of assets ([The Advertising Business](/books/advertising/advertising-business#a-self-serve-search-or-social-click)).
- **Quality Score:** Google Ads' 1 to 10 keyword diagnostic; not an input in the auction ([The Advertising Business](/books/advertising/advertising-business#a-self-serve-search-or-social-click)).
- **Retail media network:** a retailer selling ads on its sites, apps, stores and partners' inventory using shopper data, with sales as the measured outcome ([The Advertising Business](/books/advertising/advertising-business#a-retail-media-sponsored-product)).

## Channels

- **Ad pod:** a break in streaming video filled with several ads in sequence, requested in OpenRTB 2.6 with a total duration and slot count ([The Advertising Business](/books/advertising/advertising-business#a-ctv-ad-pod)).
- **Mediation:** an app SDK running an auction or waterfall across ad networks for each ad opportunity ([The Advertising Business](/books/advertising/advertising-business#an-in-app-rewarded-ad-through-mediation)).
- **Rewarded ad:** a video or playable an app user chooses to watch for an in-app reward, granted on a signed server-side callback ([The Advertising Business](/books/advertising/advertising-business#an-in-app-rewarded-ad-through-mediation)).
- **SSAI (server-side ad insertion):** stitching ads into a video stream on a server, which then fires tracking on the device's behalf ([The Advertising Business](/books/advertising/advertising-business#a-ctv-ad-pod)).
- **Waterfall:** calling ad sources one at a time in order of expected price until one fills, the older alternative to a unified auction ([The Advertising Business](/books/advertising/advertising-business#an-in-app-rewarded-ad-through-mediation)).

## Contracts and Money

- **Controlling measurement:** the count an insertion order names as the one invoices are based on, usually the third-party ad server's if it complies and reports daily ([The Advertising Business](/books/advertising/advertising-business#a-direct-sold-insertion-order)).
- **Discrepancy rule:** under the IAB/4A's terms, reconciliation when the controlling count is lower than the other by more than 10% over the invoice period ([The Advertising Business](/books/advertising/advertising-business#a-direct-sold-insertion-order)).
- **Gross spend:** what a buyer's clients spend through a platform, including the platform's fee; for an agent reporting net, larger than revenue ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Principal versus agent:** whether a platform books the gross amount the buyer pays (principal) or only its fee (agent, net) ([The Advertising Business](/books/advertising/advertising-business#the-core-data-model)).
- **Sequential liability:** the IAB/4A's term making an agency liable to a publisher only to the extent the advertiser has paid the agency ([The Advertising Business](/books/advertising/advertising-business#who-s-who)).

## References

**Reference**

- [IAB: Digital ad revenue climbs to nearly $300B](https://www.iab.com/news/digital-ad-revenue-climbs-to-nearly-300b-as-iab-celebrates-30-year-anniversary/), 2025 programmatic and commerce media revenue
- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), traffic acquisition costs as a share of advertising revenues
- [ISBA: Programmatic Supply Chain Transparency Study, executive summary (2020)](https://www.isba.org.uk/system/files/media/documents/2020-12/executive-summary-programmatic-supply-chain-transparency-study.pdf), the 15% unknown delta
- [ISBA: Second programmatic supply chain study (2023)](https://www.isba.org.uk/article/isbas-programmatic-supply-chain-study-finds-match-rate-increases-and-reduction), the 3% unknown delta
- [IAB/4A's: Standard Terms and Conditions for Internet Advertising, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), controlling measurement, the discrepancy rule and sequential liability
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), win, billing and loss notices, ad pods and the SupplyChain object
- [MRC: Viewable Ad Impression Measurement Guidelines v2.0](https://mediaratingcouncil.org/sites/default/files/Standards/081815%20Viewable%20Ad%20Impression%20Guideline_v2.0_Final.pdf), the viewable impression thresholds
- [Google Ads: Quality Score](https://support.google.com/google-ads/answer/6167118?hl=en), Quality Score as a diagnostic
