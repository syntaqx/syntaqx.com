+++
title = "Social Commerce & Live Shopping"
nav_title = "Social Commerce"
description = "Shoppable video and live selling: affiliate plans and attribution, live offers and auctions, seller standards, settlement, de minimis and commerce fraud."
category = "User-Generated Platforms Industry"
order = 1824
part = "Social and Short-Form"
aliases = []
tags = ["user-generated-content", "social-commerce", "live-shopping", "affiliate", "marketplaces", "auctions"]
+++

A search-led marketplace waits for a buyer who already knows what they want: they type "trail running shoes," compare listings and pick one. A content-led marketplace finds the buyer first. Someone scrolling a feed for entertainment sees a creator unbox a skincare set, taps the product card under the video, and pays without leaving the app; someone watching a live stream sees a host hold up a trading card, and has 20 seconds to outbid three hundred other viewers. The purchase starts from a piece of content, the demand is created by a person the buyer follows or was shown, and the sale often credits that person with a commission even though they never owned the product.

That shift moves the hard problems. The catalog, the cart and the checkout are the ordinary goods marketplace of [Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking) and [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding). What content-led commerce adds is a third party to every sale (the affiliate creator, with a rate, an attribution rule and a payout), a selling surface that is live and bursty (thousands of buyers reaching for 200 units at the moment a host says "go"), and a supply base that the feed can make famous overnight, which makes seller standards, settlement holds and fraud controls the difference between a store and a scam funnel.

This chapter covers the model and its parties; affiliate plans, samples and attribution; live selling, flash offers, inventory under burst load and live auctions; seller verification, dispatch clocks, performance scores, platform fulfilment, returns and prohibited products; the money (referral fees, subsidies, settlement tiers, reserves, sales tax and the end of the US de minimis exemption); and commerce fraud. Sponsorships, affiliate commissions in general and the FTC's Endorsement Guides are [Creator Monetization](/books/user-generated-platforms/creator-monetization#sponsorships-affiliates-and-disclosure); the chat layer around a live sale is [Live Chat & the Interactive Layer](/books/user-generated-platforms/live-chat-and-interactivity); how a feed decides which shoppable video to show is the subject of [Interest-Graph Feeds](/books/user-generated-platforms/interest-graph-feeds), the first chapter of this part.

## How the Platforms Do It

As of October 2026, from each platform's public pages and the press cited:

| Platform | Where buying happens | Who sells on camera | Notes |
| --- | --- | --- | --- |
| **Douyin** | In app; third-party links blocked in livestreams from October 2020 | Hosts and creators | Over 65% of sales came through short video and live in the first ten months of 2023, as TechNode reported from LatePost |
| **Taobao Live** | Taobao's own checkout | Hosts, who pick products and negotiate prices | Launched by Alibaba in 2016 |
| **TikTok Shop** | In app: shoppable videos, LIVE, a Shop tab and a profile showcase | Sellers, and affiliate creators on seller-set commission | US launch September 12, 2023, with Fulfilled by TikTok and Shop Ads |
| **Instagram and Facebook** | The merchant's own website, from mid-2025 | No one since live shopping tags ended | Shop tab removed in February 2023, live shopping tags ended March 16, 2023, native checkout retired from June 2025 |
| **YouTube Shopping** | The retailer's site | Creators in the Partner Program, on seller-set commission | 18 countries; commissions paid 60 to 120 days after purchase |
| **Whatnot** | In app, mostly live auctions | Sellers hosting their own shows, with invited co-hosts | Commission from 8% down to 6.50% by four-week sales, on the item price only |
| **Amazon Live** | Amazon's checkout, from a carousel under the stream | Influencer Program members, at Associates rates | Launched 2019; opened to influencer livestreamers in July 2020 |

Three models sit in that table. **Closed loop:** the platform runs the catalog, the checkout, the payment and often the warehouse, so it sees every order and can pay the creator who drove it (Douyin, Taobao Live, TikTok Shop, Whatnot, Amazon Live). **Link out:** the content carries a product tag, the buyer finishes on the retailer's site, and the platform learns about the sale only from the retailer's report or an affiliate network (YouTube Shopping, Meta since 2025). **Ads on a catalog:** the merchant pays to place products in the feed, which [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#commerce-and-affiliate) covers with Pinterest's shopping formats. The rest of this chapter is mostly about the closed loop, because that is where the platform owns the order, the money and the liability.

## Content-Led Commerce

Live commerce started in China as a television shopping channel run by influencers. Alibaba launched Taobao Live in 2016 and recruited sellers to host; its best-known host described reviewing 200 to 300 products a night with her team to pick the 30 to 40 she would sell in a four-hour stream, and brands competing for a slot cut prices by as much as three quarters, as The China Project reported in 2020. Douyin, ByteDance's Chinese counterpart to TikTok, began in March 2018 with a cart icon that sent viewers to Taobao stores, opened in-app Douyin shops in May 2018, moved commerce into its own department in June 2020, and from October 9, 2020 blocked third-party referral links in livestreams so that live sales had to close on Douyin, as TechNode reported. The order of those steps is the pattern: start by sending traffic elsewhere, learn that the platform can't measure or protect a sale it doesn't process, then close the loop.

TikTok Shop brought the closed loop to the US on September 12, 2023, with five surfaces from TikTok's announcement: shoppable videos and LIVE streams in the For You feed, a Product Showcase on a brand's profile, a Shop Tab marketplace with search and promotions, an affiliate program connecting creators with sellers, and Fulfilled by TikTok, a logistics service that stores, picks, packs and ships merchants' products. Meta ran the experiment in the other direction. TechCrunch reported in January 2023 that Instagram would remove the Shop tab from its navigation in February, and PYMNTS that Instagram would end product tagging in Live on March 16, 2023. Meta then required checkout for new Shops from June 5, 2023 and stopped hosting Shops without checkout from August 10, 2023 in most markets outside the US (TechCrunch, April 2023), only to reverse in June 2025, moving Shops to checkout on the merchant's website by the end of August 2025 and dropping payment processing, order management and chargeback handling for new orders, as PPC Land reported. Running checkout means running disputes, refunds, seller verification and payouts; a platform that doesn't want those duties links out.

### The Parties

Every closed-loop sale has more parties than a marketplace sale, and the system needs a role for each:

- **The seller** owns the product and is the merchant the buyer contracts with: a brand, a reseller or an individual trader, onboarded as a sub-merchant under the platform ([The Hierarchy](/books/payments/software-platforms#the-hierarchy)).
- **The affiliate creator** promotes a product they don't own and earns a commission on attributed orders. They're a payee with a tax profile, not a seller, and in most designs they never touch the goods except as samples.
- **The host** runs a live sale. On Whatnot and Taobao Live the host is usually the seller or works for one; on TikTok Shop a seller can invite an affiliate creator to host a LIVE with a flash deal. Hosts have moderators and, on some platforms, co-hosts.
- **The brand** may be neither seller nor creator: it pays for placement or funds a commission campaign on products that resellers fulfil.
- **The platform** is the marketplace operator, often the payment facilitator, sometimes the warehouse and carrier broker, and under US state law usually the marketplace facilitator that collects sales tax.
- **Logistics partners** (carriers, the platform's warehouses, cross-border consolidators) are where dispatch and delivery facts come from.

The core data model already has most of this: a seller is a `profiles` row of kind `seller`, a creator a `creator` profile, both payees as `merchants`, and an order is a `bookings` row of kind `purchase` against a goods `listings` row ([The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model)). What's new is the content that sold it, the creator it credits, and the live offer it came from.

## Affiliate Plans

An affiliate plan is a seller's standing offer to pay creators a share of the sales they drive. The general mechanics (seller-set rates, the rate on the day of purchase, reversal on return, FTC disclosure) are in [Creator Monetization](/books/user-generated-platforms/creator-monetization#sponsorships-affiliates-and-disclosure); this section is what a closed-loop commerce platform adds.

### Open and Targeted Plans

TikTok Shop's Seller Center help pages describe two kinds, and the split is general:

- **Open plans** make products available to any eligible creator, for selected products or the whole shop. The seller sets a commission between 1% and 80% of GMV per order, per product or group, or lets the platform set an "optimized" rate from the top 30% of products in the shop and the marketplace; it can require approval before creators reach out.
- **Targeted plans** invite named creators to promote named products for a period the seller chooses. They can be commission-only, or a flat fee paid through the platform after the seller or the platform approves the videos, which is limited to video and to one product.
- **One rate wins.** A product can sit in several plans at once, but a creator is paid one rate per product, and the targeted rate always supersedes the open rate.

YouTube's affiliate program has the same two layers in different words: seller-set rates for everyone, and custom rates "for certain creators," with elevated rates during campaign windows. The data model consequence is that a plan is a versioned rule with a scope (shop, product), an audience (anyone eligible, or listed creators) and a validity range, and that resolving the rate for an order is a precedence query run at purchase time, not a field copied onto the tag when the creator added it. YouTube states the rule plainly: the payout reflects "the rate on the day of each purchase, not the date you tagged the product."

### Samples

Creators can't demonstrate what they haven't held, so plans carry a sample policy. TikTok's pages let a seller offer free samples per product, or refund the creator's own purchase when they make a first sale. Samples are a cost the seller pays before any sale, and they are the oldest abuse in the program: creators who request samples and never post, or resell them. The defenses are a sample request with a due date for qualifying content, a record of whether each creator posts after receiving samples that sellers see on the next request, and exclusion of sample orders from the seller's performance metrics (TikTok's Fulfillment Policy excludes creator sample orders from the seller-fault cancellation rate). A sample is an order like any other, shipped against the seller's stock, so it belongs in `bookings` with a zero price and a link to the request.

### Attribution

Attribution decides which creator, if any, earns on an order. The published rules differ in their details and agree on the shape:

- **Click beats view.** TikTok's affiliate link page credits "the last one that the customer clicked before checking out," and only for the product behind the clicked link, not the rest of the cart. YouTube credits a creator for the tagged product and for other eligible items the viewer buys from that seller after tapping the tag. A view without a click earns on neither page.
- **Links expire.** TikTok's shareable affiliate links earn for at most 100 days, after which the creator generates a new one.
- **Commission is earned on fulfilment.** TikTok says commission is earned once the seller fulfils the order, and its referral fee applies only to completed, paid and delivered orders. YouTube pays through AdSense 60 to 120 days after the purchase, and returns reverse commissions.
- **Localized sales keep the credit.** When a YouTube viewer abroad is matched to a local seller of the same product, the commission comes from the fulfilling seller's rate.

My rule: store every touch that could earn (a view of a shoppable video or a stream with the product pinned, a tap on a tag, a link click) with its time, viewer, creator, content and product, and compute attribution once, at checkout, with a versioned rule (method, window, precedence) recorded on the order. A last-click rule that runs in the client, or that is recomputed nightly with today's rule, can't answer a creator who asks why a sale went to someone else. A live stream needs one more input: whether the product was pinned while the buyer watched, which is why pins are stored as time ranges.

## Live Selling

A live sale is a stream with a shop attached. The video path is [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding) and [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods); chat fanout, rate limits and pre-delivery moderation are [Live Chat & the Interactive Layer](/books/user-generated-platforms/live-chat-and-interactivity#chat-fanout). What a live sale adds is a set of offers that open and close on the host's command, stock that has to hold under a crowd, and, on auction platforms, a bidding engine whose clock is the show.

### Pinned Products and Timed Offers

The host shows one product at a time and the interface follows. YouTube's live shopping page lets a creator tag products before, during or after a stream (asking for the arrangement to be finished at least 30 minutes before going live, because some existing viewers may not see changes made during it), pin one product at a time, or on desktop rotate tagged products automatically every 60 seconds. Tags are hidden on made-for-kids streams, streams with claimed content, paid content and streams not eligible for ads, and a product shows only to viewers in countries it ships to. TikTok lets a seller invite a single LIVE-capable creator for a flash sale, which can't be requested in bulk.

Two rules follow. **The pin is the offer's clock, set by the server.** Viewers are seconds behind the live edge, so a countdown drawn from the video would end at different moments for different viewers; the offer opens and closes on server time, the player shows the remaining time from that, and a late tap after close fails cleanly ([Latency Tiers](/books/user-generated-platforms/live-latency-and-vods#latency-tiers)). **A live price is an offer, not a listing edit.** A flash price, a quantity set aside for the show and a per-buyer limit belong to the offer, with its window; changing the listing's price during a stream would change it in search, in other creators' videos and in carts already open.

### Inventory Under Bursts

The worst moment for a stock system is a host saying "the first 200 get it at half price" to an audience of 20,000. Every buyer taps at once, most will fail, and none should be sold a unit that doesn't exist. The general machinery is [Reservations & Holds](/docs/architecture/reservations-and-holds): a pooled counter decremented with a conditional update ([Counters for Pooled Inventory](/docs/architecture/reservations-and-holds#counters-for-pooled-inventory)), a short hold while the buyer pays, and release on abandonment ([Releasing on Abandonment](/docs/architecture/reservations-and-holds#releasing-on-abandonment)). The live twist:

- **Allocate the show's stock up front.** The offer takes a quantity from the listing's stock when it's scheduled, so buyers in search and in the stream compete for different pools, and a sellout in the stream doesn't oversell the listing.
- **Hold for less time than a normal checkout.** A live offer's hold should be short, measured in a minute or two, because the units unclaimed by failed payments need to go back while the host is still talking about the product. Saved payment methods and one-tap purchase are what make a short hold fair.
- **Cap per buyer and per payment instrument.** A flash price is what resellers and bots come for; the cap is enforced on the hold, not on the order, and linked accounts count together ([Caps and Abuse](/docs/architecture/reservations-and-holds#caps-and-abuse)).
- **Make the counter the only source of truth.** The "12 left" in the stream overlay is read from the offer's counter and pushed over the same channel as chat events, never computed by clients.

TikTok's Fulfillment Policy names the cost of getting this wrong: lack of inventory and inaccurate pricing are seller-fault cancellations, and the seller-fault cancellation rate has to stay at 2.5% or lower.

### Live Auctions

Whatnot runs many of its sales as short auctions inside a show, and its help center documents the mechanics a live auction needs. When the seller starts an auction they set a **starting bid**, an **auction time** (the minimum length; new bids can extend it), and a **counter bid time**: when fewer than 10 seconds remain, each new bid resets the timer to that amount. **Sudden death** is the option without extensions: it ends the auction "at 00:01 to the final bidder." Whatnot notes that many auctions last 30 seconds or less, that an auction can't be cancelled or stopped once started, that the item doesn't sell if no one bids, and that items listed before the show can take pre-bids, applied automatically when the auction opens.

The buyer's side completes the contract:

- **Bids are binding.** "You bid, you buy." When the timer ends the highest bidder wins and their default payment method is charged automatically; cancelling or charging back may lead to a ban, and a winner can only ask the seller to cancel within 24 hours.
- **Proxy bidding.** A custom bid can be a Max Bid, placed in increments up to a private limit; pre-bids work the same way. Increments rise with the price, and the next valid amount is shown before bidding. When two bidders reach the same amount, whoever placed it first leads.
- **Shill bidding is prohibited,** and Whatnot may cancel an auction after a clear error, such as an accidental bid far above the intended amount, so the seller can relist.
- **Currency is the seller's.** Prices are shown in the seller's currency and converted at checkout.

The counter-bid extension is the platform's answer to sniping: without it, the winner is whoever has the lowest latency, which on a live stream is rarely the most interested buyer. Sudden death makes sniping the game, and is a seller's choice per lot, so the setting belongs on the lot and in the record of how it closed. The build consequences: bids are appended with a server sequence and server time, never with client time; the extension is applied in the same transaction that accepts the bid; the close runs once, from the lot's end time, and creates the order and the payment attempt atomically; and a failed payment is a state of the order (second-chance offer, relist or seller cancel), not a reason to rerun the auction.

### Hosts, Co-hosts and Moderators

A live sale has staff. Whatnot sellers can invite a co-host to a show and raid another seller's show at the end of theirs, the commerce version of the audience transfer in [Raids and Audience Transfer](/books/user-generated-platforms/live-chat-and-interactivity#raids-and-audience-transfer). The roles matter for commerce because they act on money: who may start an auction, pin a product, change an offer's price or quantity, or cancel a winner's order. My default is that only the seller's account and accounts the seller has granted a selling role may change offers, chat moderators moderate chat only, and every offer change records which account made it, because a dispute about a mispriced flash deal is a question about who changed what during the show.

## Seller Standards and Fulfilment

A feed can send a new seller ten thousand orders in a day. The platform's controls on who may sell, how fast they must ship and what happens when they don't are therefore stricter and more automatic than on a search-led marketplace, where demand grows with reviews.

### Verification

The legal floor is the same as any goods marketplace: the INFORM Consumers Act's high-volume seller duties in the US ([The INFORM Consumers Act](/books/user-generated-platforms/supply-onboarding#the-inform-consumers-act)) and Article 30's trader traceability in the EU ([DSA Trader Traceability](/books/user-generated-platforms/supply-onboarding#dsa-trader-traceability)). Two commerce-specific points:

- **Affiliates aren't sellers.** A creator who earns commissions doesn't sell the product, so INFORM's sales count and the DSA's trader data apply to the seller behind the product, not to the creator in the video. The creator is a payee with identity and tax checks ([Who the Payee Is](/books/user-generated-platforms/paying-creators-and-sellers#who-the-payee-is)).
- **Velocity reaches the thresholds fast.** INFORM's 200 sales and $5,000 in a 12-month window can be crossed in one live show, so the high-volume computation runs on order events, not a nightly batch, and the 10-day clocks start the day the threshold is crossed.

### Dispatch and Delivery Clocks

Closed-loop platforms publish fulfilment deadlines and measure every seller against them. TikTok Shop's US Fulfillment Policy, as of October 2026:

| Measure | Rule |
| --- | --- |
| Handling time | Seller-set; the default for regular orders is 1 to 2 business days, longer for backorder, custom, made-to-order and pre-order products |
| Late dispatch | An order not updated to In Transit within 2 business days; the late dispatch rate target is 4% or less, with enforcement possible above 10% |
| Auto-cancellation | A regular order not ready for collection within 5 business days |
| Valid tracking rate | 95% or higher for seller-shipped orders |
| Delivery deadline | Marked delivered within 6 business days of awaiting shipment |
| On-time delivery rate | 80% or higher, measured weekly on orders the platform doesn't fulfil |
| Seller-fault cancellation rate | 2.5% or lower; creator sample orders excluded |

Business days exclude weekends and US federal holidays, and penalties run from account health point deductions through reduced visibility and order volume limits to suspension. The pattern is general enough to model: each order gets computed deadlines (`dispatch_by`, `deliver_by`) from the product's handling type, the seller's handling time and a business-day calendar, stored on the order when it's placed ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)); carrier events set the facts; and the rates are queries over a window, kept with the deadline rule's version so a seller who disputes a late-dispatch count can see which calendar and which rule produced it.

### Seller Performance Scores

The rates roll up into a score. TikTok's Dynamic Settlement and Reserve Policy uses the Shop Performance Score, alongside delivered orders in the previous 15 to 45 days and any active restrictions, to set each shop's settlement tier and reserve level on the first of every month, and advises aiming above 4.0. A performance score is a status program in the sense of [Status Programs](/books/user-generated-platforms/messaging-and-reviews#status-programs): versioned criteria, an evaluation per period with the metrics behind it, and consequences that take effect from a date. The difference from a badge is that the consequences are money and reach (how fast the seller is paid, how much is held, whether the shop can join campaigns), so the evaluation must be reproducible to the cent.

### Platform Fulfilment

Fulfilment by the platform turns the seller's dispatch problem into the platform's warehouse problem. TikTok described Fulfilled by TikTok at launch as storing, picking, packing and shipping merchants' products, and its Fulfillment Policy exempts those orders from the valid-tracking requirement and from the on-time delivery measure, because the seller no longer controls them. For the data model, the fulfilment mode belongs on each order (a seller can use the platform's warehouse for some products and ship others), the dispatch and delivery facts come from the platform's own logistics events, and performance metrics exclude what the seller didn't control.

### Returns

Content-led commerce sells on impulse, so returns are heavy and the policy is the platform's. TikTok Shop's US policy, as Social Media Today reported in June 2025, accepts most returns within 30 days of delivery, with windows varying by shop or item and shown on the product page; excludes categories such as groceries, supplements, pet food, auto parts, trading cards and collectibles, and pre-owned luxury; lets damaged or defective items be refunded within 90 days without a return; and issues refunds generally within 3 to 10 business days after the return arrives. TikTok's referral fee page adds that a refund returns the referral fee less a refund administration fee of 20% of it, capped at $5 per SKU from May 15, 2025, with no fee on sample refunds or eligible buyer cancellations before shipping. Each return reverses the affiliate commission it earned, which is why commissions wait for the return window before they become payable. The case flow (request, evidence, decision, refund) is [The Case Lifecycle](/books/user-generated-platforms/cancellations-and-disputes#the-case-lifecycle); card disputes that bypass it are [On a Platform: Who Pays](/books/payments/disputes-and-chargebacks#on-a-platform-who-pays).

### Prohibited Products and Prohibited Content

Commerce on a content platform has two policies, one for what may be sold and one for how it may be shown. The product side is the goods marketplace's: prohibited categories, restricted categories that need approval or documents, and the EU's product safety fields ([Product Compliance Fields for Goods](/books/user-generated-platforms/listings-search-and-ranking#product-compliance-fields-for-goods)). The content side is new. TikTok Shop's "Prohibited Content for Platform Safety" policy for US sellers and creators, published August 4, 2026 as PPC Land reported, bars minors from narrating, explaining or recommending products in shoppable videos and LIVEs (with a narrow allowance for minors wearing or testing products designed for children, without selling), bars drugs, tobacco and nicotine from appearing in frame even without a sale, and lists "artificial inflation of traffic or orders" among prohibited fraudulent content. Its enforcement ladder includes commission restrictions, which is what makes content policy a money decision: a penalty on a creator can cut off their affiliate earnings without touching their account. Minors' rules generally are [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance).

## The Money

A closed-loop order splits several ways: the buyer pays the item price, shipping and tax; the platform takes a referral fee and processing; the creator earns a commission paid from the seller's side; a platform-funded discount may make the buyer's price lower than the seller's; and part of the seller's proceeds sit in a reserve until returns can no longer arrive.

### Referral Fees and Commissions

As of October 2026, from the platforms' pages:

| Platform | Platform's fee | Base | Other charges |
| --- | --- | --- | --- |
| TikTok Shop (US) | 6% per order from April 1, 2024 (5% to 6% by category) | Customer payment plus platform discount, less tax; completed, paid and delivered orders only | Refund administration fee; affiliate commission the seller sets |
| Whatnot (US) | 8%, falling to 7.75% at $15,000 of four-week sales and by steps to 6.50% at $500,000; custom rates as low as 3% | Item price only, excluding shipping and tax | Processing of 2.9% of the total order plus $0.30 per order |
| Amazon Live (creator side) | Associates fee schedule, 1% to 10% by category (July 2020) | Qualifying purchases from the stream | None to the creator |
| YouTube Shopping (creator side) | Seller-set commission | The rate on the day of purchase | Paid through AdSense |

The bases matter as much as the rates. TikTok's base adds back the platform's own discount, so a subsidized sale pays the fee on the pre-subsidy price; Whatnot's charges commission on the item only and processing on everything the buyer pays, and resets the seller's tier every four weeks from the previous period's completed sales, with cancelled and refunded orders subtracted and private shows and local pickup excluded. Each of these is a fee program with tiers, a base made of line kinds and a validity range, which [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#how-to-build-it) models as `fee_programs`; the creator's commission is a separate line, paid by the seller and earned by the creator. TikTok's Finances FAQ shows one more detail worth copying: for tiered commissions the platform withholds at the higher rate first and refunds the difference at settlement, so the seller is never short when the final rate is known.

### Subsidies and Promotions

Platforms buy growth in social commerce with money they fund themselves: coupons and promotions in the shop surfaces, free shipping, and promotional fee plans for new sellers (TikTok's referral fee page notes that sellers enrolled in promotional plans keep them until the period ends). Who funds a discount decides every downstream number. A platform-funded coupon lowers what the buyer pays but not what the seller is owed, so it's a platform expense on the order; a seller-funded one lowers the seller's proceeds; a co-funded campaign splits it by rule. The referral fee base, the creator's commission base and the tax base each have their own answer about which price they use, and the answers differ by platform. My rule: write the discount as lines with a funder, and compute each base from named line kinds, so a subsidy never silently changes what a creator earns ([Promotions](/books/user-generated-platforms/pricing-and-fees#promotions)).

### Settlement Tiers and Reserves

Paying a seller before the buyer has the goods is lending to them. Closed-loop platforms pay on delivery and hold a share after it. TikTok Shop's Dynamic Settlement and Reserve Policy defines five settlement tiers (Introductory for new or probationary sellers, Standard, Accelerated, Express, and Deferred while security checks run) and three reserve levels; a reserve is held for 30 days from the delivery date and released if unused; tiers and reserves are set on the first of each month, and the platform may change them at any time on account or security grounds. Its Finances FAQ puts payouts 1 to 31 days after delivery depending on the tier, holds orders with open after-sales requests until they resolve, carries negative balances into the next payout, and pays once the balance reaches $1.

This is the payout machinery of [Risk Holds, Negative Balances and Clawbacks](/books/user-generated-platforms/paying-creators-and-sellers#risk-holds-negative-balances-and-clawbacks) with the trigger set to delivery and the offset set by a performance tier, and the reserve is a rolling reserve in the Payments volume's sense ([Exposure and Reserves](/books/payments/merchant-onboarding#exposure-and-reserves), [Payout Schedules, Holds and Reserves](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)). Creator commissions follow the same trigger with a longer offset, after the return window. A seller who disappears with a month of unshipped orders is the merchant fraud the Payments volume describes ([Merchant Fraud](/books/payments/fraud-and-risk#merchant-fraud)); the delivery trigger and the reserve are what make that a bounded loss.

### Sales Tax

In the US a closed-loop platform is the marketplace facilitator for its sellers' sales and collects and remits sales tax in states with facilitator laws ([Marketplace Facilitator Tax](/books/user-generated-platforms/pricing-and-fees#marketplace-facilitator-tax), [US Economic Nexus](/docs/payments/sales-tax#us-economic-nexus)). The content-led twist is the link-out model: when Meta moved Shops checkout to merchants' websites in 2025, the sale stopped happening on its marketplace, and with it the facilitator role for those orders. Whether a platform is the facilitator follows from whether its checkout processes the sale, so the order's checkout path is a tax fact, recorded on the order.

### The End of De Minimis

Much of the inventory on social commerce platforms shipped from overseas sellers directly to US buyers in small parcels, under the de minimis rule that let shipments valued at $800 or less enter duty-free. That ended in stages. Executive Order 14256 (April 2, 2025) suspended it first for products of China and Hong Kong. Executive Order 14324, signed July 30, 2025, suspended it for every country for goods entered from 12:01 a.m. EDT on August 29, 2025, regardless of value, origin, mode of transport or entry method; for postal shipments it let carriers collect either the origin country's tariff rate on the package value or, for six months, a flat duty of $80, $160 or $200 per package by that rate. As of October 2026, from KPMG's and Thompson Hine's summaries: Executive Order 14388 continued the suspension in February 2026; CBP issued interim final rules on June 24, 2026 suspending the exemption indefinitely for postal and non-postal shipments, with a postal informal entry process for mail valued at $2,500 or less from July 24, 2026; on October 14, 2026 CBP moved the compliance date for those postal procedures from October 22, 2026 to January 20, 2027; and the One Big Beautiful Bill Act ends the statutory exemption from July 1, 2027.

For a platform with cross-border sellers, the consequences are in the order and the listing:

- **Duty is a line on the order,** with who pays it (the buyer at checkout, the seller from proceeds, or the carrier's account) and who remits it, alongside sales tax and with the same effective-dated rules.
- **Country of origin is a listing field.** The duty depends on where the goods were made, not where they ship from, and both postal methods in the executive order required the origin to be declared.
- **Ship-from changes the business.** Sellers moved stock into US warehouses (including platform fulfilment) to sell domestically, so the same product can be a domestic order one month and an import the next; the fulfilment mode and ship-from country belong on the order, not the listing.
- **The all-in price includes duty** where the buyer pays it at checkout, which brings duties into the price display rules of [All-In Prices](/books/user-generated-platforms/pricing-and-fees#all-in-prices).

Currency, cross-border card costs and FX on refunds are [Cross-Border & FX](/books/payments/cross-border-and-fx).

## Commerce Fraud

Social commerce inherits goods marketplace fraud (counterfeits, item-not-received claims, prohibited goods; [Goods Fraud](/books/user-generated-platforms/marketplace-fraud#goods-fraud)) and adds fraud aimed at the measures that decide reach and pay:

- **Counterfeits sold on camera.** A live host can show a genuine item and ship a fake, and a short video can sell thousands of copies before the first complaint. The defenses are category gates for brands at risk, authentication for high-value categories (TikTok's Fulfillment Policy counts a missing certificate of authenticity for pre-owned luxury goods as a seller-fault cancellation), reserves that outlast the return window, and rights-owner reporting tied to the listing and the content that sold it.
- **Fake reviews and brushing.** A seller buys reviews, or "brushes" by placing orders from fake accounts to real addresses, shipping something cheap so the order looks delivered, and reviewing it as a verified buyer. The FTC's rule on consumer reviews and testimonials covers the reviews ([The FTC Consumer Reviews and Testimonials Rule](/books/user-generated-platforms/messaging-and-reviews#the-ftc-consumer-reviews-and-testimonials-rule)); the platform's signals are orders whose buyer accounts link to the seller, deliveries with weights that don't match the product, and review bursts after low-value orders.
- **GMV wash trading and self-purchase.** A seller or creator buys their own products through linked accounts to inflate sales counts, climb a performance tier, cross a campaign threshold or earn commission on their own purchases. Linked-account evidence ([Linked Accounts](/books/user-generated-platforms/marketplace-fraud#linked-accounts)) is checked before commissions, tiers and campaign rewards are granted, not only after.
- **Fake live viewers and engagement.** View counts, likes and "people buying now" banners are social proof, and bought viewers inflate them. Under 16 CFR 465.8 it is unfair or deceptive to buy or sell fake indicators of social media influence (metrics the public uses to judge influence, including followers, likes and views, generated by bots or accounts not tied to real people) that the buyer or seller knew or should have known were fake, for a commercial purpose. China's livestreaming marketing rules, issued by the Cyberspace Administration of China with six other agencies and effective May 25, 2021, prohibit fabricated comments, likes, views and sales figures, as CGTN reported. Viewer counts shown in a stream should come from the same cleaned measurement as payouts ([Account Farms](/books/user-generated-platforms/spam-and-bots#account-farms)).
- **Affiliate fraud.** Creators claim credit they didn't earn: link stuffing in comments under other creators' videos, clicks generated by bots just before organic purchases, self-referral through linked accounts, or orders placed with stolen cards to collect commission before the chargeback. Commission payable only after delivery and the return window, click-quality filters on touches, and reversal on chargeback (with the commission recovered from the creator's next earnings) are the controls.
- **Sample abuse.** Requests from accounts that never post, or that resell samples, show up as a low post rate after delivery; restrict sample access, not the account.
- **Shill bidding.** A seller's second account bids up their own auction. Whatnot prohibits it; detection is the linked-account check run on the bidder list when the lot closes, before the winner is charged.

The regulators' side is the DSA's marketplace duties for platforms that let consumers buy from traders, and the European Commission's 2025 and 2026 actions against AliExpress and Temu over illegal and unsafe products, listed in [The Enforcement Ledger](/books/user-generated-platforms/regulators-and-enforcement#the-enforcement-ledger). Those cases turned on whether the platforms' detection and risk measurements matched their claims, which for a commerce platform means the counterfeit, recall and prohibited-product numbers in this chapter's records.

## How to Build It

These are deltas against the [core data model](/books/user-generated-platforms/platform-business#the-core-data-model), [Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking#how-to-build-it) (`listing_attributes`, `listing_product_info`), [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#how-to-build-it) (`fee_programs`, `promotions`, `booking_lines`), [Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews#how-to-build-it) (`status_programs`, `host_status_periods`), [Creator Monetization](/books/user-generated-platforms/creator-monetization#how-to-build-it) (`earnings`, whose `source_type` already includes `affiliate`), [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#how-to-build-it) (`payout_release_rules`, `balance_holds`) and [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#how-to-build-it) (`account_links`). An order stays a `bookings` row of kind `purchase` for one listing; a cart with several sellers or products becomes several bookings under one payment, because each has its own seller, deadlines, return and attribution.

```sql
-- Affiliate plans: a seller's standing offer to pay creators, versioned like any program terms.
CREATE TABLE affiliate_plans (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  seller_account_id   UUID NOT NULL REFERENCES accounts (id),
  kind                TEXT NOT NULL CHECK (kind IN ('open', 'targeted')),
  listing_id          UUID REFERENCES listings (content_item_id),  -- null: the whole shop
  version             INT NOT NULL,
  commission_bps      INT CHECK (commission_bps BETWEEN 0 AND 10000),
  ads_commission_bps  INT CHECK (ads_commission_bps BETWEEN 0 AND 10000),  -- orders from ads
  flat_fee            BIGINT,              -- targeted, per approved video
  currency            CHAR(3),
  rate_source         TEXT NOT NULL DEFAULT 'seller' CHECK (rate_source IN ('seller',
                        'platform_optimized')),
  sample_policy       TEXT NOT NULL DEFAULT 'none' CHECK (sample_policy IN ('none', 'free',
                        'refund_on_first_sale')),
  requires_approval   BOOLEAN NOT NULL DEFAULT FALSE,
  formats             TEXT[] NOT NULL DEFAULT '{video,stream,link}',
  valid_during        TSTZRANGE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind = 'targeted' OR flat_fee IS NULL),
  CHECK ((commission_bps IS NULL) <> (flat_fee IS NULL)),
  CHECK (flat_fee IS NULL OR currency IS NOT NULL),
  UNIQUE NULLS NOT DISTINCT (seller_account_id, kind, listing_id, version)
);

-- Who may earn under a plan: anyone who joined an open plan, or the creators invited to a targeted one.
CREATE TABLE affiliate_enrollments (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  plan_id             UUID NOT NULL REFERENCES affiliate_plans (id),
  creator_profile_id  UUID NOT NULL REFERENCES profiles (id),
  merchant_id         UUID REFERENCES merchants (id),   -- the creator as payee
  status              TEXT NOT NULL CHECK (status IN ('invited', 'requested', 'active',
                        'declined', 'ended', 'revoked')),
  decided_by          UUID REFERENCES accounts (id),
  reason              TEXT,                -- e.g. a commission restriction from a penalty
  penalty_id          UUID REFERENCES penalties (id),
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (plan_id WITH =, creator_profile_id WITH =, valid_during WITH &&)
);

-- Samples: an order at zero price with a promise attached.
CREATE TABLE sample_requests (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  enrollment_id       UUID NOT NULL REFERENCES affiliate_enrollments (id),
  listing_id          UUID NOT NULL REFERENCES listings (content_item_id),
  status              TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'declined',
                        'shipped', 'delivered', 'fulfilled', 'lapsed', 'expired')),
  booking_id          UUID REFERENCES bookings (id),          -- the sample shipment
  content_due_at      TIMESTAMPTZ,         -- computed from delivery and the plan's rule
  content_item_id     UUID REFERENCES content_items (id),     -- the video or stream that met it
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products shown in content. Video tags may carry offsets; stream pins are ranges in time.
CREATE TABLE product_tags (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  content_item_id     UUID NOT NULL REFERENCES content_items (id),  -- video, post or stream
  listing_id          UUID NOT NULL REFERENCES listings (content_item_id),
  tagged_by           UUID NOT NULL REFERENCES accounts (id),
  relation            TEXT NOT NULL CHECK (relation IN ('own', 'affiliate', 'paid_partner')),
  enrollment_id       UUID REFERENCES affiliate_enrollments (id),
  position            SMALLINT NOT NULL DEFAULT 0,
  shown_from_ms       INT CHECK (shown_from_ms >= 0),   -- offset into the video; null: all of it
  shown_to_ms         INT,
  state               TEXT NOT NULL CHECK (state IN ('active', 'hidden', 'removed')),
  hidden_reason       TEXT CHECK (hidden_reason IN ('made_for_kids', 'claimed_content',
                        'not_monetizable', 'listing_inactive', 'not_shippable', 'policy')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at          TIMESTAMPTZ,
  UNIQUE (content_item_id, listing_id),
  CHECK ((relation = 'affiliate') = (enrollment_id IS NOT NULL)),
  CHECK (shown_to_ms IS NULL OR shown_to_ms > shown_from_ms)
);

-- Offers inside a live sale: a price, a quantity and a window, separate from the listing.
CREATE TABLE live_offers (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  stream_id           UUID NOT NULL REFERENCES streams (content_item_id),
  listing_id          UUID NOT NULL REFERENCES listings (content_item_id),
  seller_account_id   UUID NOT NULL REFERENCES accounts (id),
  kind                TEXT NOT NULL CHECK (kind IN ('fixed', 'flash', 'auction')),
  price               BIGINT CHECK (price >= 0),           -- null for an auction
  currency            CHAR(3) NOT NULL,                    -- the seller's
  quantity_allocated  INT NOT NULL CHECK (quantity_allocated > 0),  -- taken from listing stock
  quantity_held       INT NOT NULL DEFAULT 0 CHECK (quantity_held >= 0),
  quantity_sold       INT NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
  per_buyer_limit     INT CHECK (per_buyer_limit > 0),
  hold_ttl            INTERVAL NOT NULL DEFAULT '2 minutes',
  open_during         TSTZRANGE,           -- set when the host opens and closes it
  state               TEXT NOT NULL CHECK (state IN ('scheduled', 'open', 'sold_out',
                        'closed', 'cancelled')),
  created_by          UUID NOT NULL REFERENCES accounts (id),
  CHECK (quantity_held + quantity_sold <= quantity_allocated),
  CHECK ((kind = 'auction') = (price IS NULL)),
  CHECK (kind <> 'auction' OR quantity_allocated = 1)
);

CREATE TABLE live_offer_changes (        -- who changed an offer during the show
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  offer_id            UUID NOT NULL REFERENCES live_offers (id),
  changed_by          UUID NOT NULL REFERENCES accounts (id),
  field               TEXT NOT NULL CHECK (field IN ('price', 'quantity_allocated',
                        'per_buyer_limit', 'state')),
  from_value          TEXT,
  to_value            TEXT NOT NULL,
  changed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pins: what the stream was selling, when. One primary pin at a time.
CREATE TABLE stream_product_pins (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  stream_id           UUID NOT NULL REFERENCES streams (content_item_id),
  listing_id          UUID NOT NULL REFERENCES listings (content_item_id),
  offer_id            UUID REFERENCES live_offers (id),
  pinned_by           UUID REFERENCES accounts (id),     -- null: automatic rotation
  pinned_during       TSTZRANGE NOT NULL,                 -- server time
  EXCLUDE USING GIST (stream_id WITH =, pinned_during WITH &&)
);

-- Short holds while a buyer pays for a live offer.
CREATE TABLE inventory_reservations (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  offer_id            UUID NOT NULL REFERENCES live_offers (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  quantity            INT NOT NULL CHECK (quantity > 0),
  expires_at          TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('held', 'converted', 'released',
                        'expired')),
  booking_id          UUID REFERENCES bookings (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((status = 'converted') = (booking_id IS NOT NULL))
);

-- Auctions: one lot per auction offer, bids appended with server order.
CREATE TABLE auction_lots (
  offer_id            UUID PRIMARY KEY REFERENCES live_offers (id),
  starting_bid        BIGINT NOT NULL CHECK (starting_bid >= 0),
  increment_rule      TEXT NOT NULL,       -- versioned table of increments by price
  duration            INTERVAL NOT NULL,   -- minimum length
  counter_bid_time    INTERVAL NOT NULL,   -- the reset applied near the end
  extend_under        INTERVAL NOT NULL DEFAULT '10 seconds',
  sudden_death        BOOLEAN NOT NULL DEFAULT FALSE,
  starts_at           TIMESTAMPTZ,
  ends_at             TIMESTAMPTZ,         -- moves with extensions; the close reads it
  state               TEXT NOT NULL CHECK (state IN ('pending', 'running', 'won', 'unsold',
                        'voided')),
  winning_bid_id      UUID,                -- auction_bids
  booking_id          UUID REFERENCES bookings (id),
  closed_at           TIMESTAMPTZ,
  void_reason         TEXT CHECK (void_reason IN ('clear_error', 'shill_bidding',
                        'technical', 'policy'))
);

CREATE TABLE auction_bids (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  lot_id              UUID NOT NULL REFERENCES auction_lots (offer_id),
  seq                 BIGINT NOT NULL,     -- server order within the lot; ties go to the lower
  bidder_account_id   UUID NOT NULL REFERENCES accounts (id),
  kind                TEXT NOT NULL CHECK (kind IN ('increment', 'custom', 'proxy', 'pre_bid')),
  amount              BIGINT NOT NULL,     -- the visible bid
  max_amount          BIGINT,              -- a proxy limit; private to the bidder
  placed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extended_to         TIMESTAMPTZ,         -- the end time this bid set, if it extended
  status              TEXT NOT NULL CHECK (status IN ('accepted', 'rejected', 'voided')),
  reject_reason       TEXT,                -- 'below_increment', 'after_close', 'restricted'
  UNIQUE (lot_id, seq),
  CHECK (max_amount IS NULL OR max_amount >= amount)
);

ALTER TABLE auction_lots
  ADD FOREIGN KEY (winning_bid_id) REFERENCES auction_bids (id);

-- Touches that could earn a commission. High volume: partition by day, keep for the
-- longest attribution window plus the dispute period, then aggregate.
CREATE TABLE commerce_touches (
  id                  UUID NOT NULL DEFAULT uuidv7(),
  occurred_at         TIMESTAMPTZ NOT NULL,
  viewer_account_id   UUID NOT NULL REFERENCES accounts (id),
  kind                TEXT NOT NULL CHECK (kind IN ('view', 'pinned_view', 'tag_tap',
                        'link_click')),
  content_item_id     UUID REFERENCES content_items (id),   -- null for an off-platform link
  creator_profile_id  UUID NOT NULL REFERENCES profiles (id),
  listing_id          UUID NOT NULL REFERENCES listings (content_item_id),
  link_expires_at     TIMESTAMPTZ,         -- shareable links stop earning
  from_ad             BOOLEAN NOT NULL DEFAULT FALSE,
  quality             TEXT NOT NULL DEFAULT 'ok' CHECK (quality IN ('ok', 'invalid')),
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

-- The attribution decision: one per order, with the rule and the rate it used.
CREATE TABLE order_attributions (
  booking_id          UUID PRIMARY KEY REFERENCES bookings (id),
  touch_id            UUID,                -- null: no creator earned
  creator_profile_id  UUID REFERENCES profiles (id),
  enrollment_id       UUID REFERENCES affiliate_enrollments (id),
  plan_id             UUID REFERENCES affiliate_plans (id),  -- the version in force at purchase
  method              TEXT NOT NULL CHECK (method IN ('click', 'view', 'pinned_view', 'link',
                        'none')),
  attribution_window  INTERVAL,
  rule_version        TEXT NOT NULL,       -- precedence and windows, as data
  commission_bps      INT,
  base_amount         BIGINT,              -- from named booking_lines kinds
  commission_amount   BIGINT,
  currency            CHAR(3),
  status              TEXT NOT NULL CHECK (status IN ('pending', 'payable', 'reversed',
                        'void')),
  earning_id          UUID REFERENCES earnings (id),
  decided_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((method = 'none') = (creator_profile_id IS NULL))
);

-- Orders: where they came from, how they ship, and their clocks.
ALTER TABLE bookings
  ADD COLUMN origin                 TEXT CHECK (origin IN ('video', 'stream', 'storefront',
                                      'search', 'link', 'sample')),
  ADD COLUMN origin_content_item_id UUID REFERENCES content_items (id),
  ADD COLUMN live_offer_id          UUID REFERENCES live_offers (id),
  ADD COLUMN checkout_path          TEXT CHECK (checkout_path IN ('platform', 'merchant_site')),
  ADD COLUMN fulfilment_mode        TEXT CHECK (fulfilment_mode IN ('seller', 'platform')),
  ADD COLUMN ship_from_country      CHAR(2),
  ADD COLUMN deadline_rule          TEXT,        -- handling type, calendar and policy version
  ADD COLUMN dispatch_by            TIMESTAMPTZ,
  ADD COLUMN deliver_by             TIMESTAMPTZ,
  ADD COLUMN dispatched_at          TIMESTAMPTZ, -- first carrier scan or In Transit
  ADD COLUMN delivered_at           TIMESTAMPTZ,
  ADD COLUMN cancel_fault           TEXT CHECK (cancel_fault IN ('seller', 'buyer', 'platform',
                                      'carrier'));

ALTER TABLE listings
  ADD COLUMN origin_country CHAR(2);       -- where the goods were made: duty, not shipping

-- New order lines: the creator's commission and import duty.
ALTER TABLE booking_lines
  DROP CONSTRAINT booking_lines_kind_check,
  ADD CONSTRAINT booking_lines_kind_check CHECK (kind IN ('rental', 'add_on',
    'cleaning_or_prep', 'delivery', 'guest_service_fee', 'host_service_fee', 'protection',
    'deposit_waiver', 'screening_fee', 'discount', 'promotion', 'usage', 'late_return', 'tax',
    'affiliate_commission', 'import_duty')),
  DROP CONSTRAINT booking_lines_earner_check,
  ADD CONSTRAINT booking_lines_earner_check CHECK (earner IN ('host', 'platform', 'insurer',
    'tax_authority', 'creator', 'customs'));

ALTER TABLE promotions
  DROP CONSTRAINT promotions_funded_by_check,
  ADD CONSTRAINT promotions_funded_by_check CHECK (funded_by IN ('platform', 'host', 'shared')),
  ADD COLUMN platform_share_bps INT CHECK (platform_share_bps BETWEEN 0 AND 10000),
  ADD COLUMN live_offer_id      UUID REFERENCES live_offers (id);

-- Seller performance as a status program whose results are money.
ALTER TABLE host_status_periods
  ADD COLUMN score           NUMERIC(3,2),
  ADD COLUMN settlement_tier TEXT CHECK (settlement_tier IN ('introductory', 'standard',
                               'accelerated', 'express', 'deferred')),
  ADD COLUMN reserve_level   SMALLINT;
```

Attribution runs once, when the order is paid: the latest valid click inside the click window beats any view, a view counts only inside the shorter view window, a click on a link counts only while the link was valid, and the plan rate is the one in force at purchase, with a targeted plan beating an open one:

```sql
WITH o AS (
  SELECT b.id, b.listing_id, b.guest_account_id, b.host_account_id AS seller_account_id,
         b.created_at
  FROM bookings b
  WHERE b.id = $1
),
candidates AS (
  SELECT t.*, CASE WHEN t.kind IN ('tag_tap', 'link_click') THEN 1 ELSE 2 END AS rank_class
  FROM commerce_touches t
  JOIN o ON t.viewer_account_id = o.guest_account_id AND t.listing_id = o.listing_id
  JOIN profiles p ON p.id = t.creator_profile_id
  WHERE t.quality = 'ok'
    AND t.occurred_at <= o.created_at
    AND t.occurred_at >= o.created_at - CASE WHEN t.kind IN ('tag_tap', 'link_click')
                                             THEN $2::interval      -- click window, from the rule
                                             ELSE $3::interval END  -- view window
    AND (t.link_expires_at IS NULL OR t.occurred_at <= t.link_expires_at)
    AND p.account_id <> o.guest_account_id               -- no credit for buying from yourself
    AND NOT EXISTS (                                     -- or from a linked account
      SELECT 1 FROM account_links al
      WHERE al.status = 'confirmed'
        AND al.account_a_id = LEAST(p.account_id, o.guest_account_id)
        AND al.account_b_id = GREATEST(p.account_id, o.guest_account_id))
),
winner AS (
  SELECT * FROM candidates ORDER BY rank_class, occurred_at DESC LIMIT 1
)
SELECT w.id AS touch_id, w.creator_profile_id, e.id AS enrollment_id, ap.id AS plan_id,
       CASE WHEN w.from_ad AND ap.ads_commission_bps IS NOT NULL
            THEN ap.ads_commission_bps ELSE ap.commission_bps END AS commission_bps
FROM winner w
JOIN o ON TRUE
JOIN affiliate_enrollments e ON e.creator_profile_id = w.creator_profile_id
     AND e.status = 'active' AND e.valid_during @> o.created_at
JOIN affiliate_plans ap ON ap.id = e.plan_id
     AND ap.seller_account_id = o.seller_account_id
     AND (ap.listing_id = o.listing_id OR ap.listing_id IS NULL)
     AND ap.valid_during @> o.created_at
ORDER BY (ap.kind = 'targeted') DESC,          -- the targeted rate supersedes the open one
         (ap.listing_id IS NOT NULL) DESC      -- a product plan beats a shop-wide plan
LIMIT 1;
```

A bid is accepted and the clock extended in one statement against the locked lot; the close runs from a job scheduled at `ends_at` and re-checks it, because an extension may have moved it:

```sql
-- Place a bid (amount already validated against the increment rule)
WITH lot AS (
  SELECT * FROM auction_lots WHERE offer_id = $1 AND state = 'running'
    AND now() < ends_at FOR UPDATE
), bid AS (
  INSERT INTO auction_bids (lot_id, seq, bidder_account_id, kind, amount, max_amount,
                            extended_to, status)
  SELECT lot.offer_id,
         COALESCE((SELECT max(seq) FROM auction_bids WHERE lot_id = lot.offer_id), 0) + 1,
         $2, $3, $4, $5,
         CASE WHEN NOT lot.sudden_death AND lot.ends_at - now() < lot.extend_under
              THEN now() + lot.counter_bid_time END,
         'accepted'
  FROM lot
  RETURNING lot_id, extended_to
)
UPDATE auction_lots a SET ends_at = bid.extended_to
FROM bid WHERE a.offer_id = bid.lot_id AND bid.extended_to IS NOT NULL;

-- Close: the highest accepted bid wins; equal amounts go to the earlier bid
UPDATE auction_lots a
SET state = CASE WHEN w.id IS NULL THEN 'unsold' ELSE 'won' END,
    winning_bid_id = w.id,
    closed_at = now()
FROM (SELECT offer_id FROM auction_lots
      WHERE offer_id = $1 AND state = 'running' AND now() >= ends_at FOR UPDATE) l
LEFT JOIN LATERAL (
  SELECT id FROM auction_bids
  WHERE lot_id = l.offer_id AND status = 'accepted'
  ORDER BY amount DESC, seq ASC LIMIT 1) w ON TRUE
WHERE a.offer_id = l.offer_id
RETURNING a.offer_id, a.winning_bid_id;
-- Same transaction: insert the booking for the winner, charge the saved method through the
-- outbox, and set auction_lots.booking_id. A failed charge is an order state, not a re-run.
```

Late dispatch is a query over deadlines stored at order time, not over today's rule:

```sql
SELECT b.host_account_id AS seller_account_id,
       count(*) FILTER (WHERE b.dispatched_at > b.dispatch_by)::numeric
         / NULLIF(count(*), 0) AS late_dispatch_rate
FROM bookings b
WHERE b.kind = 'purchase'
  AND b.origin IS DISTINCT FROM 'sample'
  AND b.fulfilment_mode = 'seller'
  AND b.dispatched_at IS NOT NULL
  AND b.dispatch_by >= now() - interval '30 days'
GROUP BY b.host_account_id;
```

Design decisions behind it:

- **Plans are versioned terms, resolved at purchase.** A rate change is a new `affiliate_plans` version with a validity range, so an order placed yesterday keeps yesterday's rate and the precedence (targeted over open, product over shop) is a query, not a field on the tag. The attribution row stores the plan version, rule version, base and amount it used.
- **Touches are facts; attribution is a decision.** `commerce_touches` records what the viewer did; `order_attributions` records which touch won under which rule. Invalid-traffic findings mark touches `invalid` and trigger re-attribution of affected unpaid orders; paid commissions are reversed through `earnings`, never edited.
- **A commission is an order line and an earning.** The `affiliate_commission` line, paid by the seller and earned by the creator, makes the seller's statement add up; the `earnings` row with `source_type = 'affiliate'` makes the creator's add up. Its release rule triggers on delivery plus the return window ([Payout Triggers](/books/user-generated-platforms/paying-creators-and-sellers#payout-triggers)).
- **Live offers own the show's stock and price.** The counters on `live_offers` are decremented with conditional updates; `inventory_reservations` expire on read and by a sweeper; the check constraint makes overselling the allocation impossible. The listing's own stock is reduced when the offer is allocated and restored when it closes unsold.
- **Pins and tags are time ranges in server time.** A stream pin's range maps to the recording through the stream's program time ([Timed Metadata and Ad Breaks](/books/user-generated-platforms/live-latency-and-vods#timed-metadata-and-ad-breaks)), so a VOD can keep showing the product at the right moment and attribution can ask whether a product was pinned while the buyer watched.
- **Auction bids are an append-only log with server order.** The sequence breaks ties, the extension is recorded on the bid that caused it, and voided lots keep their bids with the reason, so a buyer who lost by a second can see why.
- **Deadlines and faults are stored on the order.** `dispatch_by`, `deliver_by` and `cancel_fault` are computed when the order is placed or cancelled, with the rule version, so performance scores can be recomputed and disputed.
- **Performance is a status evaluation with money attached.** `host_status_periods` rows for a `seller_performance` program hold the score, the metrics, the settlement tier and the reserve level that took effect, and the payout release rule and `balance_holds` read from it.
- **Origin and ship-from are different facts.** `listings.origin_country` sets duty; `bookings.ship_from_country` and `fulfilment_mode` say whether this order was an import at all.
- **Events:** `affiliate_plan.versioned`, `product.tagged`, `stream.product_pinned`, `live_offer.opened`, `live_offer.sold_out`, `auction.bid_accepted`, `auction.closed`, `order.attributed`, `order.dispatched`, `order.delivered` and `seller_performance.evaluated` feed the stream overlay, chat alerts, creator dashboards, payouts and fraud scoring ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

Commerce records are what sellers, creators, buyers, tax authorities and consumer regulators ask about:

- **Every commission back to its order, touch, plan version and rule,** with the base lines it was computed on, so a creator's statement and a seller's deductions agree line by line ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Attribution changes,** with the invalid-traffic or linked-account finding that caused them and the commissions reversed.
- **Every plan and rate change,** with its effective time and who made it, and the precedence rule in force, because a creator who promoted a product at 20% will ask why an order paid 10% ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Every live offer change and every auction bid,** with server times and the account that acted, including extensions, voided lots and their reasons.
- **Performance evaluations and their consequences:** the metrics, the deadline rules behind them, the score, and the settlement tier and reserve level they set, kept with the program version.
- **Reserves and releases** per order and per seller, reconciled to payouts ([Reconciliation](/books/payments/payouts-and-settlement#reconciliation)).
- **Duty and tax lines,** with the origin declared, the method used, who paid and who remitted, kept as long as customs and tax rules require.
- **Fraud findings** (wash trading, shill bidding, fake viewers, brushing) with the evidence and the decisions on accounts, plans and earnings.

## What This Means for the System You Build

- **Decide closed loop or link out deliberately:** running checkout brings the data and the duties (disputes, tax, verification, payouts) together.
- **Model affiliate plans as versioned terms** with scope, audience and validity, and resolve the rate at purchase with a stored precedence rule.
- **Record touches as facts and attribution as a decision,** once per order, with the method, window and rule version.
- **Pay commissions after delivery and the return window,** as an order line for the seller and an earning for the creator, reversible by a linked row.
- **Give live sales their own offers** with allocated stock, short holds, per-buyer caps and server-time windows; never edit the listing on air.
- **Run auctions on an append-only bid log** with server sequence, extensions applied in the bid's transaction, and an atomic close that creates the order.
- **Store dispatch and delivery deadlines on every order** with the rule that set them, and compute seller metrics from those facts.
- **Tie settlement speed and reserves to a versioned performance evaluation,** paid from delivery, not from the sale.
- **Carry origin, ship-from, fulfilment mode and checkout path on the order,** because duty, tax and liability follow them.
- **Check linked accounts before paying commissions, granting tiers or charging an auction winner,** not only after.

## References

**Platform terms**

- [TikTok Newsroom: Introducing TikTok Shop](https://newsroom.tiktok.com/en-us/introducing-tiktok-shop), the September 12, 2023 US launch: shoppable videos and LIVE, Product Showcase, Shop Tab, the affiliate program, Shop Ads and Fulfilled by TikTok
- [TikTok Shop Seller University: Referral fee updates](https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018&lang=en), 6% from April 1, 2024, the fee base, completed and delivered orders only, the refund administration fee capped at $5 per SKU from May 15, 2025
- [TikTok Shop Seller University: Fulfillment Policy](https://seller-us.tiktok.com/university/essay?knowledge_id=3995852763301633&lang=en), handling times, late dispatch, auto-cancellation, valid tracking, delivery deadlines, on-time delivery, seller-fault cancellation and penalties
- [TikTok Shop Seller University: Dynamic Settlement and Reserve Policy](https://seller-us.tiktok.com/university/essay?knowledge_id=3995852763531009&lang=en), five settlement tiers, three reserve levels, 30-day reserves from delivery, monthly evaluation and the Shop Performance Score
- [TikTok Shop Seller University: Finances page FAQ](https://seller-us.tiktok.com/university/essay?knowledge_id=2470273945257771&lang=en), payouts 1 to 31 days after delivery, open after-sales requests, negative balances, the $1 minimum and tiered commission withholding
- [TikTok Shop Seller University: Shareable affiliate links for creators](https://seller-us.tiktok.com/university/essay?knowledge_id=4308436637255466), last-click attribution, product-only credit, 100-day link validity and commission on fulfilment
- [TikTok Seller Center: About open collaborations](https://ads.tiktok.com/help/article/about-open-collaborations-in-seller-center), shop or product scope, 1% to 80% commission, optimized rates, samples, approval and targeted-rate precedence
- [TikTok Seller Center: About target collaborations](https://ads.tiktok.com/help/article/about-target-collaborations-in-seller-center?lang=en), invited creators, flat-fee and commission-only plans, duration, samples and LIVE flash sale invitations
- [YouTube: YouTube Shopping affiliate program overview and eligibility](https://support.google.com/youtube/answer/13376398?hl=en), eligibility, the 18 countries, retailers, tagging, campaign rates and payment through AdSense 60 to 120 days after purchase
- [YouTube: Commission rates and earnings in the YouTube Shopping affiliate program](https://support.google.com/youtube/answer/17263096?hl=en), seller-set and custom rates, the rate on the day of purchase, localized sellers and other items bought after a tap
- [YouTube: Tag products in your live streams](https://support.google.com/youtube/answer/12299016), tagging before, during and after a stream, the 30-minute advice, single pins and 60-second rotation, and when tags are hidden
- [Whatnot Help Center: Start an auction during your show](https://help.whatnot.com/hc/en-us/articles/9779931101837-Start-an-auction-during-your-show), starting bid, auction time, counter bid time under 10 seconds, sudden death, pre-bids and no cancellation once started
- [Whatnot Help Center: Bid on an item during a show](https://help.whatnot.com/hc/en-us/articles/14932924544141-Bid-on-an-item-during-a-show), binding bids, automatic charge on win, Max Bids, ties, shill bidding, error cancellations and the 24-hour cancellation request
- [Whatnot: How fees work](https://www.whatnot.com/seller/fees), commission tiers from 8% to 6.50% by four-week sales, custom rates to 3%, item-price base and 2.9% plus $0.30 processing, as of September 2026

**Law and regulation**

- [16 CFR 465.8: Misuse of fake indicators of social media influence](https://www.law.cornell.edu/cfr/text/16/465.8), buying or selling fake indicators known or that should have been known to be fake, for a commercial purpose
- [16 CFR 465.1: Definitions](https://www.law.cornell.edu/cfr/text/16/465.1), indicators of social media influence and fake indicators
- [The White House: Suspending duty-free de minimis treatment for all countries](https://www.whitehouse.gov/presidential-actions/2025/07/suspending-duty-free-de-minimis-treatment-for-all-countries/), Executive Order 14324 of July 30, 2025: the August 29, 2025 effective time, scope, postal duty methods and the earlier China and Hong Kong suspension
- [KPMG: CBP indefinitely suspends de minimis exemption for all modes](https://kpmg.com/us/en/taxnewsflash/news/2026/06/cbp-suspends-de-minimis-exemption.html), the June 24, 2026 interim final rules, the postal informal entry process, Executive Order 14388 and the July 1, 2027 statutory repeal
- [Thompson Hine SmarTrade: CBP delays implementation date for mail shipments](https://www.thompsonhinesmartrade.com/2026/10/cbp-delays-implementation-date-of-de-minimis-exemption-for-mail-shipments/), the October 14, 2026 extension of the postal compliance date to January 20, 2027
- [CGTN: China issues rules to regulate livestreaming sales](https://news.cgtn.com/news/2021-04-25/China-issues-rules-to-regulate-livestreaming-sales--ZK5VtKWL0k/share_amp.html), the issuing bodies, the May 25 effective date, the ban on fabricated comments, likes, views and sales, and the minimum age of 16 (April 2021, reported)

**In practice**

- [TechNode: ByteDance builds walls for its budding e-commerce ecosystem](https://technode.com/2020/09/17/bytedance-builds-walls-for-its-budding-e-commerce-ecosystem/), Douyin's 2018 Taobao links and shops, the June 2020 e-commerce department and the October 9, 2020 block on third-party links in livestreams (reported)
- [TechNode: Douyin racks up $274 billion in e-commerce sales in the first ten months of 2023](https://technode.com/2023/11/10/douyin-racks-up-274-billion-in-e-commerce-sales-in-the-first-ten-months-of-2023/), nearly RMB 2 trillion, 60% growth and over 65% from short video and live, from LatePost (reported)
- [The China Project: Viya, China's most popular livestreamer](https://thechinaproject.com/2020/07/06/viya-chinas-most-popular-and-hardest-working-livestreamer/), Taobao Live's 2016 launch, product selection for a stream and brand discounts (July 2020, reported)
- [TechCrunch: Instagram is removing the Shop tab](https://techcrunch.com/2023/01/09/instagram-is-removing-the-shop-tab-moving-reels-from-the-center-spot-in-design-overhaul-next-month/), the February 2023 navigation change (reported)
- [PYMNTS: Instagram ending live shopping](https://www.pymnts.com/shopping/2023/instagram-ending-live-shopping-as-it-shifts-to-other-experiences/), product tagging in Live ending March 16, 2023 (reported)
- [TechCrunch: Instagram and Facebook will require checkout for Shops](https://techcrunch.com/2023/04/27/instagram-facebook-force-checkout-experience-shops-soon/), the June 5 and August 10, 2023 dates and the exempt markets (reported)
- [PPC Land: Meta phases out Facebook and Instagram Shops checkout by August 2025](https://ppc.land/meta-phases-out-facebook-and-instagram-shops-checkout-by-august-2025/), the move to website checkout and the end of payment processing, order management and dispute handling (June 2025, reported)
- [Social Media Today: TikTok publishes returns policy for TikTok Shop](https://www.socialmediatoday.com/news/tiktok-product-returns-policy-us-sell-off-deadline/750125/), the 30-day window, exclusions, the 90-day defective-item window and refund timing (June 2025, reported)
- [PPC Land: TikTok Shop bans minors from selling in creator videos and livestreams](https://ppc.land/tiktok-shop-bans-minors-from-selling-in-creator-videos-and-livestreams/), the August 4, 2026 Prohibited Content for Platform Safety policy and its enforcement (reported)
- [TechCrunch: Amazon Influencer Program opens to livestreamers](https://techcrunch.com/2020/07/15/amazon-influencer-program-opens-to-livestreamers-for-broadcasting-to-amazon-live/), Amazon Live's 2019 launch, Associates rates of 1% to 10% and the product carousel (July 2020, reported)
