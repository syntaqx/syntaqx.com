+++
title = "Monetization Strategies"
description = "Every way a user-generated platform earns, who pays, how each model shapes the product, app-store cuts, regional prices, conflicts and unit economics."
category = "User-Generated Platforms Industry"
order = 1820
part = "Creators and Money"
aliases = []
tags = ["monetization", "business-models", "advertising", "subscriptions", "take-rate", "app-stores"]
+++

A user-generated platform can charge almost anyone in the room. Advertisers pay for the attention users' posts attract; users pay to remove the ads, to get perks, or to support a creator; creators and sellers pay for reach, tools and placement; guests and buyers pay a fee on every booking; search and AI companies pay for the corpus; and the money sitting between a guest's payment and a host's payout earns interest for nobody in particular until the platform claims it. Most platforms run three or four of these at once, and the choice of which, in what order and at what price decides more about the product than any feature: what's free, what's ranked first, who sees ads, whether a creator can live off the platform, and whether a host has a reason to take the next booking off it.

This chapter is the full menu. [How the Money Is Made](/books/user-generated-platforms/platform-business#how-the-money-is-made) mapped each strategy to who pays and one published figure; here each gets its mechanics, the platforms that run it, how it shapes the product and its incentives, and its economics from filings. Then the cross-cutting parts: freemium against paywalls, pricing and regional pricing, app-store fees and the Epic rulings, how models conflict when mixed, unit economics side by side, and a framework for choosing and sequencing models. The deep chapters follow: [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing) for selling attention and the corpus, [Creator Monetization](/books/user-generated-platforms/creator-monetization) for creators' subscriptions, tips, currencies and splits, and [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers) for getting the money out. Marketplace fee mechanics and all-in price law are in [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#fee-models).

## How the Platforms Do It

As of October 2026, from filings, help centers and the platforms' own announcements:

| Platform | Advertising | Users pay | Creators or sellers pay | Pass-through to creators or sellers | Other |
| --- | --- | --- | --- | --- | --- |
| **Reddit** | About $2.1 billion of $2.2 billion revenue (2025) | Premium and Gold, "not material" | Business tools (Reddit Pro) | Contributor Program pays users for Gold received | Content licensing, substantially all from two partners |
| **Pinterest** | Substantially all of $4,221.8 million revenue (2025) | No consumer subscription | Shopping and catalog ads | None material | |
| **YouTube** | $40,367 million (2025) | Premium and Music, inside Alphabet's subscriptions line | Shopping placements | 55% of watch-page ad revenue, 45% of Shorts pool allocations, 70% of fan funding | |
| **Twitch** | Pre-rolls and mid-rolls, creator-scheduled | Turbo; channel subscriptions; Bits | | Subscription splits of 50% to 70%, 1 cent per Bit, 55% ad share on opt-in | |
| **Discord** | No feed ads in this survey | Nitro ($9.99 a month in the US) and Nitro Basic ($2.99) | | Server Subscriptions, owner keeps 90% | Private; no filings |
| **X** | Feed and reply ads | Basic, Premium and Premium+ tiers; Premium halves ads, Premium+ removes them | | Ad revenue sharing and creator subscriptions for Premium subscribers | API access, self-serve pay-per-use and Enterprise |
| **Tumblr** | Display and sponsored posts | Ad-Free at $4.99 a month (2022) | Blaze: users pay to promote posts, including other people's | | |
| **Patreon** | None | Members pay creators directly | Platform fee on creator earnings | Members' payments, less fees | |
| **Airbnb** | | Guests pay the price (host-only fee for most listings) | Host-only service fee of about 15.5% for most hosts | Host payouts the day after check-in | Interest on $6,959 million held for customers |
| **Etsy** | Etsy Ads (on-site) and Offsite Ads | | Listing, transaction and payment fees; Etsy Ads; Etsy Plus at $10 a month | Seller deposits | Shipping labels |
| **eBay** | Promoted Listings: $1,993 million (2025) | | Final value fees; Promoted Listings | Seller payouts | |
| **Turo** | | Guests pay trip fees and protection plans | Hosts trade earnings share for damage responsibility (70%, 80% or 90%) | Host earnings | Protection plan fees recognized over the trip |
| **Vinted** | | Buyers pay a mandatory Buyer Protection fee | Sellers pay no selling fee | Seller payouts after delivery | |

Two shapes come out of the table. **Content platforms monetize attention and sell it twice:** once to advertisers by the impression, and again to the most engaged users as the right not to see the ads. **Marketplaces monetize the transaction and sell the shelf twice:** once as a fee on every sale or booking, and again to sellers as paid placement on the same search results. Everything else (currencies, creator shares, protection, float, licensing) is built on one of those two foundations.

## Advertising

**How it works.** Advertisers buy impressions, clicks or conversions in an auction, targeted by context (the community, the search query, the video) and by what the platform knows about the viewer. The ad appears in a feed, a conversation, a search result or a video break, and for content platforms that's nearly all the revenue: Reddit's 10-K says it generates "a majority of our revenue from the sale of advertising services," about $2.1 billion of $2,202.5 million in 2025. Twitch lets the creator schedule ad breaks and pays a share; YouTube runs ads across every video in its Partner Program and pays the creator 55% of watch-page ad revenue.

**Who pays.** Advertisers, but users pay in attention and data. The price an advertiser pays varies with how much the platform knows and how mature the local ad market is, which is why Pinterest's 2025 average revenue per user was $30.84 in the US and Canada, $5.12 in Europe and $0.83 in the rest of the world, a gap the 10-K attributes to "the relative size and maturity of the digital advertising markets in these geographies." Reddit's fourth-quarter 2025 ARPU was $10.79 in the US against $2.31 internationally.

**How it shapes the product.** Ads make the platform want time spent and sessions above all, which pulls ranking toward engagement and the product toward feeds over directed tasks. They make logged-out traffic worth serving (Reddit monetizes visitors arriving from search with conversation-page ads), they make every new country a growth bet with low near-term revenue, and they introduce a third party with a veto over content: advertisers who won't appear next to certain posts. Ad suitability turns into a content-rating system, and creators whose work is unsuitable earn less or nothing ([Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing)). Ad load is the main dial and has diminishing returns: Pinterest served 49% more ads in 2025 while the average price per ad fell 22%.

**What it needs.** Scale before it pays, an ads system (auction, targeting, measurement, billing) that most platforms rent at first and build later, an ad review pipeline, and privacy compliance that varies by country and age (profiling-based ads to known minors are banned in the EU under the Digital Services Act).

## Premium Subscriptions

**How it works.** Users pay a monthly or annual price for a better version of the free product: fewer or no ads, cosmetic perks, larger uploads, profile badges, early features. Discord sells Nitro at $9.99 a month or $99.99 a year and Nitro Basic at $2.99 or $29.99 in the US, with localized prices elsewhere. X sells three tiers: Basic, Premium (which shows half the ads non-subscribers see) and Premium+ (no ads), with Premium also the gate for creator revenue sharing and creator subscriptions. Tumblr launched Ad-Free in February 2022 at $4.99 a month or $39.99 a year. YouTube Premium removes ads across YouTube and shares its revenue with creators. Imgur's paid Pro accounts, created in 2010, removed upload limits: storage as the premium. Imgur Emerald, its ad-free tier, launched on the web in May 2020 at $5 a month billed through a Coil membership (a web micropayments service) and came to Android that August, with ad-free browsing plus member avatars and trophies; by June 2023 Coil billing was gone and sign-up had moved to Imgur's mobile apps, with the subscription removing display ads and promoted posts on iOS, Android and the desktop site. It was still offered as of October 2026.

**Who pays.** The most engaged users, a small fraction of the base. Reddit's 10-K says products sold directly to users, including Reddit Premium and Reddit Gold, were not material in 2025, which is the typical result for a community platform: a premium tier is a feature for the platform's best users before it's a business.

**How it shapes the product.** An ad-free tier makes ads a nuisance the platform charges to remove, so ad load and premium conversion pull against each other (the [conflict](#when-models-collide) below). Perks that change status (badges, verification, reply prioritization on X) turn payment into reach, which helps revenue and hurts trust when users can't tell paid prominence from earned prominence; [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#verification-and-badges) keeps identity badges separate from paid ones for that reason. Perks that cost money to serve (bigger uploads, higher-quality streams) make premium a cost-of-service product, priced against storage and egress ([Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#cdn-egress-and-the-delivery-bill)).

**What it needs.** Billing on the web and in two app stores at different net prices ([App Stores](#app-stores-fees-steering-and-the-epic-rulings)), entitlements every service checks (no ads, upload limit, badge), regional prices, and a clear rule for what happens to perks at lapse: uploads above the free limit stay or go, and the rule is published before anyone pays.

## Virtual Goods and Currencies

**How it works.** The platform sells a currency (Twitch's Bits, Reddit's Gold) or items directly (awards, boosts, stickers, profile decorations), and users spend them on other users' content or on themselves. Currency spent on a creator becomes creator earnings at a fixed rate: Twitch pays the creator one cent per Bit while viewers buy Bits in packs at a higher price, and the spread between the two is the platform's revenue. Reddit's Contributor Program, launched in 2023, converts Gold that users receive into cash for eligible contributors. A good can also be bought for a community rather than a person: Discord's Server Boosts are bought by members and applied to a server, which unlocks perks by level as of October 2026 (2 boosts for Level 1, 7 for Level 2, 14 for Level 3: more emoji slots, higher voice bitrate and stream quality, larger uploads, banners, a custom invite link), and Nitro includes two boosts plus a 30% discount on more. A boost can be moved to another server after a seven-day cooldown, and a server that loses boosts keeps its perks for a 72-hour grace period, so the good is a subscription the community holds collectively.

**Who pays.** Fans and community members, usually as an impulse inside a live moment (a cheer during a stream, an award on a great comment). Reddit's 10-K describes exploring ways for users to buy and gift virtual goods; no platform in this survey breaks out the revenue.

**How it shapes the product.** A currency decouples the price a user pays from the price of each act (100 Bits, one award), which makes small payments cheap to process and makes the economy tunable without repricing every item. It also creates a liability (unspent currency), a breakage line (currency never spent), app-store exposure (currencies bought in an app must use the store's billing) and a fraud target: stolen cards buy currency, currency becomes creator earnings, earnings become a payout. Status goods (awards visible to everyone) drive social payment and also social pressure, a design concern regulators already apply to games ([Consumer Law & Loot Boxes](/books/gaming/consumer-law-and-loot-boxes)).

**What it needs.** Paid and earned currency kept as different money in the ledger, with purchased units carrying their price so refunds and chargebacks reverse the right amount ([Paid and Earned Currency Are Different Money](/books/gaming/economies-and-entitlements#paid-and-earned-currency-are-different-money)), and the creator side of it in [Creator Monetization](/books/user-generated-platforms/creator-monetization#tips-paid-messages-and-virtual-currencies).

## Paying Creators: Revenue Share, Paid Communities and Tips

Three models share one shape: the platform collects money because of a creator and passes most of it on.

**Ad revenue share.** The platform sells ads against a creator's content and pays a share. YouTube pays 55% of net watch-page ad revenue; for Shorts it pools Shorts Feed ad revenue by country, deducts music licensing, allocates by engaged views and pays the creator 45% of the allocation. Twitch's Ads Incentive Program paid 55% of net ad revenue to participants running at least three minutes of ads an hour (30% otherwise) from April 2023. X shares ad revenue with Premium subscribers based on engagement. Revenue share is what turns posters into professionals, and it ties creator income to ad suitability, so a demonetization decision is a pay decision.

**Paid communities and creator subscriptions.** Members pay monthly for access to a creator or a community. Discord's Server Subscriptions launched in December 2022 with up to three tiers from $2.99 to $199.99 a month and owners keeping 90%; Twitch channel subscriptions are $5.99, $9.99 and $24.99 in the US with the creator's share set by the Plus Program; YouTube channel memberships pay the creator 70%; Patreon's whole business is this model. Subscriptions give creators predictable income and give the platform a recurring fee, and they gate content (sub-only chat, member-only channels and posts), which is the freemium decision applied to a creator's work.

**Tips and paid messages.** Fans pay a creator directly, often with a message attached: Super Chat, Super Stickers and Super Thanks on YouTube (70% to the creator), Bits on Twitch. Paid messages are priced attention inside a live chat, and they create a moderation duty the moment they're sold: a paid message that breaks the rules was still paid for. Twitch's Hype Chat, launched in June 2023, was deprecated within months.

**How these shape the product.** Creator money makes creators a supply side the platform competes for, with splits as the price of supply. A higher split wins creators and loses margin; a lower split funds the platform but sends creators to a competitor or off-platform (Patreon, a newsletter, a merch store). Every creator program needs eligibility gates, KYC, tax forms and payouts, which are the same machinery as a marketplace's seller payouts ([Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers)), and the platform's revenue is its share while the rest is a liability until paid ([How the Money Is Made](/books/user-generated-platforms/platform-business#how-the-money-is-made)). [Creator Monetization](/books/user-generated-platforms/creator-monetization#revenue-splits-compared) compares the splits.

## Commerce and Affiliate

**How it works.** The platform earns from a merchant's sale that its content caused. Three versions run in this survey:

- **Shoppable ads.** Pinterest sells Shopping and Collection ad formats built from merchants' product catalogs; Reddit sells Dynamic Product Ads. The merchant pays as an advertiser; the platform's job is the catalog feed, the product match and conversion measurement.
- **Creator affiliate programs.** YouTube's Shopping affiliate program lets eligible creators tag products and earn a seller-set commission on attributed sales. The platform earns from the merchant relationship; the creator earns a commission ([Sponsorships, Affiliates and Disclosure](/books/user-generated-platforms/creator-monetization#sponsorships-affiliates-and-disclosure)).
- **The platform as affiliate.** Etsy's Offsite Ads run sellers' listings on other sites and charge the seller 15% (12% once a shop passes $10,000 in trailing-year sales, when participation becomes mandatory) on orders the ads attribute within 30 days, capped at $100 per order. The seller pays only on a sale, like an affiliate commission, but the platform chooses the ads.

**How it shapes the product.** Commerce turns content into a storefront and makes intent (a search for "kitchen ideas") worth more than attention. It needs a product graph, merchant onboarding, attribution windows that survive a seller's dispute, and disclosure: a creator's commission is a material connection the FTC expects disclosed. The risk is that content starts to look like ads, and users notice.

## Take Rates and Fee Splits

**How it works.** A marketplace charges a percentage of each transaction, to the supply side, the demand side, or both. The take rate (revenue over gross volume) is the headline: Airbnb's 2025 revenue of $12,241 million on $91,273 million of gross booking value is about 13.4%; Etsy reports a consolidated take rate of 24.2% (up from 22.3%), eBay 13.94% on $79,609 million of GMV; Turo's 2023 revenue of $879.7 million on $2,409.7 million of gross booking value is about 36.5%, because protection plans are in it.

**Who pays, and why it matters.** The split decides whose price looks high. Airbnb is moving most hosts to a single host-only fee of about 15.5% (from a split of about 3% host and 14.1% to 16.5% guest), so the guest sees one price that already includes the platform's cut. Outdoorsy charges hosts 20% to 25% with a minimum per night and guests 10%. Vinted charges sellers nothing and buyers a mandatory Buyer Protection fee, which makes listing free and supply plentiful. Etsy charges sellers a listing fee, a 6.5% transaction fee, a payment processing fee and, where they apply, Offsite Ads fees. Fees on the guest are visible at checkout and now regulated (the FTC's fees rule requires all-in prices for short-term lodging); fees on the host are invisible to the guest and visible in the host's statement. [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#all-in-prices) owns the fee lines and the law.

**How it shapes the product.** A take rate is charged at the one moment the platform has leverage, the transaction, so the platform must own that moment: payments, messaging, cancellation and protection all exist partly to keep the transaction on the platform. A take rate also defines what counts as a transaction, which is why marketplaces ban off-platform payment and messaging that invites it ([take rate against leakage](#when-models-collide)). The platform's revenue is recognized when it's earned, not when it's collected: Airbnb recognizes its service fee at check-in, Turo recognizes marketplace fees at check-in and protection fees over the trip, so a booking is a liability for weeks before it's revenue.

**What it needs.** Fee rules as data per category, country, host tier and date, a fee line per party on every booking, the merchant-of-record decision ([Where the Money Goes](/books/payments/software-platforms#where-the-money-goes)), and revenue posted net of incentives and refunds.

## Promoted Listings and Seller Ads

**How it works.** Sellers pay to appear higher in the marketplace's own search and recommendations. eBay's general strategy charges an ad rate, a percentage of the total sale amount, only when a buyer clicks a promoted listing and buys within 30 days; its priority strategy charges per click against a daily budget for priority placement. Etsy Ads place sellers' listings on Etsy's search and browse pages from a seller's budget, and Etsy's 10-K credits machine-learning ranking, budget pacing and onsite ads "integrated into organic search results" with its 2025 growth. Tumblr's Blaze sells promotion of a post, including someone else's, to a number of impressions.

**Who pays.** Sellers, out of their margin. At eBay it's large: advertising revenue was $1,993 million in 2025, up 22%, about 18% of net revenues and about 2.5% of GMV, described as fees charged to sellers to promote their listings. At Etsy, services revenue (on-site ads and shipping labels) was $876.3 million, 30.4% of revenue, with a $62.2 million increase in advertising revenue.

**How it shapes the product.** Seller ads are a second take rate that sellers opt into, and they compete for the same slots as organic results. Priced per sale, they make the platform's incentive close to the buyer's (show what sells); priced per click, they pay for traffic whether or not it converts. Either way they push sellers who don't buy ads down, so promoted listings become a cost of doing business on mature marketplaces, and the effective take rate rises without a fee change. They need labels ("Sponsored" or "Ad"), relevance floors so paid results still match the query, and ranking that keeps an organic result from being displaced by a worse paid one ([Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking#promoted-listings)).

**What it needs.** A campaign per seller with a model (cost per sale or per click), a rate or bid, a budget and a validity; attribution from impression and click to the sale or booking; and a charge posted as a fee line against the seller's balance, reversed when the sale is refunded.

## Seller Subscriptions

**How it works.** Sellers pay a monthly plan for tools, credits and limits. Etsy Plus costs $10 a month. Plans give the marketplace revenue that doesn't depend on transaction volume while giving professional sellers a reason to commit.

**How it shapes the product.** A seller plan splits the supply side into hobbyists and professionals, which the law already does (the INFORM Consumers Act and the EU's trader rules apply to high-volume and business sellers; [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding#private-individuals-and-traders)). It invites feature gating (analytics, bulk tools, storefront customization) that should never extend to anything buyers rely on for safety. My rule: never sell a plan that changes a seller's standing in disputes, reviews or trust signals.

## Protection Margins and Payment Float

**Protection margins.** Rental marketplaces sell protection to both sides and price it above expected claims. Turo's US host plans, since January 2026, let the host keep 70%, 80% or 90% of the trip price against damage responsibility of $250, $1,500 or $2,750: the host buys down their exposure with take rate. Guest protection plans are priced per trip; Outdoorsy and RVshare sell deposit waivers as a flat fee that buys a deductible down. Turo records protection plan fees as value-added service fees recognized over the trip, and its revenue-to-GBV ratio of about 36.5% shows how much protection adds to a car-sharing take rate. The margin is real only after claims, appraisal, fraud and subrogation, and the product is regulated: contractual reimbursement is "not insurance" only as long as it's structured that way, and selling insurance needs licensed producers ([Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection#insurance-law-who-may-sell-it)).

**Payment float.** Money held between the buyer's payment and the seller's payout earns interest. Airbnb held $6,959 million of funds receivable and amounts held on behalf of customers at the end of 2025 and earned $705 million of interest income that year: about 5.8% of revenue and about 28% of net income of $2,511 million, though not all of it on customer funds. Float isn't a strategy anyone announces; it's a consequence of payout triggers (check-in, trip start plus 48 hours, buyer confirmation) and holds, and it moves with interest rates. It creates obligations: holding customer funds is money transmission or e-money in most places, which is why Airbnb runs licensed payment entities in the US, EEA, UK and Canada. The design tension is with payout speed ([Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers)): sellers want money faster, float wants it later, and platforms resolve it by selling instant payouts for a fee.

## API Access and Data Licensing

**How it works.** The platform sells structured access to its corpus: paid API tiers for developers and multi-year licenses for search and AI companies. Reddit's 10-K describes licensing agreements that are "medium-term," with substantially all contract value from two partners and API performance requirements, and recognizes the revenue as partners consume the content, generally ratably over the term; its other revenue (licensing plus direct-to-user products) was roughly $0.1 billion in 2025. X replaced its flat entry-level API plan with self-serve pay-per-use pricing in 2026 while keeping commercial use on an Enterprise plan. Shutterstock licenses its library for model training and pays contributors a share through a contributor fund.

**How it shapes the product.** Licensing turns the corpus into an asset with a buyer, which changes how the platform treats its API (closed to free bulk access, priced for commercial users), its users' expectations (that their posts may train someone's model) and its moderators' tools (third-party apps that depended on free access; [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#the-2023-blackout)). It concentrates revenue in a few contracts with service levels attached, and it adds duties: deletions and opt-outs have to reach the licensee. [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#data-licensing-as-revenue) covers license terms and opt-outs; [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#api-pricing-what-changed-and-why) covers API pricing, rate limits, licensed exports and scraping suits.

## Freemium, Paywalls and What Stays Free

Every model above decides what's free. The general pattern on user-generated platforms is **free to read, free to post, paid to stand out or to go deeper**, because the content is the supply and the supply needs an audience:

- **Discovery stays free.** Logged-out readers from search are a large share of community traffic and are monetized by ads, so a paywall on the public corpus cuts off both supply's audience and ad revenue. Paywalls go around a creator's extra work (member-only posts, sub-only chat, a paid server channel), never around the public thread.
- **Creation stays free, up to a cost.** Posting is free because posts are the inventory; limits appear where serving costs money (storage, upload size, stream quality), and premium lifts them. Imgur's 2010 Pro accounts and Discord's Nitro upload limits are the same idea a decade apart.
- **Safety is never a perk.** Blocking, reporting, privacy controls, two-factor authentication and buyer protection are free on every platform in this survey, and charging for any of them invites regulators and headlines.
- **The paywall belongs to the creator.** A creator decides what's members-only; the platform provides the gate, the billing and the payout. A platform that paywalls creators' work for its own subscription (pooled premium, like YouTube Premium) shares revenue by usage instead.

A hard paywall makes sense when the content is scarce and owned (a creator's back catalog, a professional's course); freemium makes sense when the content is abundant and contributed. Most user-generated platforms are the second, which is why their subscriptions are perks on top of a free product rather than access to it.

## Pricing and Regional Pricing

A price on a user-generated platform is set in four places: the platform's own products (premium plans, currency packs, seller plans), creators' products (tier prices the creator chooses within a range, such as Discord's $2.99 to $199.99), marketplace listings (hosts and sellers price; the platform recommends), and fees (the platform's percentage, which sets everyone else's net). The first two are the subject here; listing prices and fee lines are in [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#host-pricing).

**Regional pricing follows ability to pay.** Ad revenue per user differs more than thirty-fold between regions (Pinterest's $30.84 against $0.83), and so does willingness to pay for subscriptions. Twitch introduced local subscription prices in 2021: a viewer's price depends on where they live and the country on their payment method, so viewers in one channel may see different prices; the change covered existing, new and gift subscriptions; and Twitch paid creators 100% of their baseline subscription revenue for three months, then 25% less every three months for a year. It reported that viewers in Mexico and Turkey gifted five times more subscriptions than in the three months before, and that a Brazil test more than doubled creator revenue and subscriber count. Tier 1 in Thailand went from 160 THB to 69 THB; in Taiwan from 149 TWD to 77 TWD. Discord publishes localized Nitro prices by country and doesn't apply them to gifts.

Three rules come with regional prices:

- **Price by the payment method's country as well as the account's.** Twitch uses both; a mismatch is the arbitrage (and a fraud signal), which is why gifts, transferable codes and currency are often priced at the higher list price.
- **Decide who funds the cut.** A lower local price lowers the creator's share too. Twitch subsidized creators through the transition; a platform that doesn't is cutting creator pay in that country by fiat.
- **Price changes are events with notice.** Twitch raised US Tier 1 from $4.99 to $5.99 from July 2024 with existing subscriptions renewing at the new price. My rule: notify every affected subscriber before the first renewal at a higher price, and let the old price govern periods already paid.

Taxes sit on top: EU and UK consumer prices are shown including VAT, so an identical price yields different net revenue by country, and digital services sold to consumers carry VAT where the buyer is ([VAT and GST on Digital Goods](/docs/payments/sales-tax#vat-and-gst-on-digital-goods)). The mechanics of price tables, conversion methods and cooldowns are in Gaming's [Regional Pricing](/books/gaming/stores-and-payments#regional-pricing).

## App Stores: Fees, Steering and the Epic Rulings

Most usage on user-generated platforms is in mobile apps, and digital goods sold in an app (premium plans, currency, creator subscriptions) fall under the stores' billing rules. As of October 2026:

- **Apple** charges 30% on In-App Purchase, 15% for developers in the Small Business Program, and for auto-renewing subscriptions 30% in a subscriber's first year and 15% after a year of paid service. In the US, since May 2025, apps may link to their own web checkout, and whether Apple may charge a commission on those linked purchases is before the Supreme Court in *Apple v. Epic Games* (No. 25-1311): certiorari was granted on 30 June 2026 limited to one question, Apple's stay application was denied on 13 August, Apple filed its merits brief on 14 September, and Epic's is due on 13 November 2026, with no argument date set. The Ninth Circuit had held in December 2025 that Apple's 27% link-out commission had a prohibitive effect but that Apple may charge some cost-based commission. In the EU, Apple's Digital Markets Act terms from 1 October 2026 set different commissions for In-App Purchase, alternative payment processing and link-outs.
- **Google Play** moved to a new structure in the US, EEA and UK from 30 June 2026 (Australia and Japan from 30 September): auto-renewing subscriptions pay 10% plus a 5% billing fee when Google Play Billing is used; other transactions for new installs 20% plus the billing fee; existing installs pay more, with lower rates for external web links. Elsewhere the older 15% on the first $1 million and 30% above, and 15% on subscriptions, still apply. In the US, after *Epic v. Google*, Play Billing is no longer required and developers may link out.

Gaming's [Stores & Payments](/books/gaming/stores-and-payments#apple-app-store) has the full timelines and per-store tables. What's particular to user-generated platforms is that **the store's cut lands on a split that was designed without it.** A creator subscription with a 70% creator share leaves room for a 30% store fee only if the platform takes nothing. The platforms have three answers:

- **Raise the in-app price.** Patreon, required by Apple to use In-App Purchase for new iOS memberships from November 2024, defaulted creators to a tool that raises their iOS prices to offset the 30% fee, left web and Android prices unchanged, and let creators choose to absorb the fee instead. It also had to move creators onto subscription billing, because In-App Purchase supports only that; first-of-the-month and per-creation billing ended in November 2025.
- **Absorb it.** The platform takes the store fee from its own share, which is affordable on a 10% to 15% platform share only with web checkout carrying most of the volume.
- **Pass it through the split.** The creator's percentage applies to revenue net of the store's fee, so the creator earns less on mobile purchases, which creators notice.

On a $10.00 monthly subscription where the creator's share is 70%, before tax:

| Channel | Store or card fee | Net | Creator at 70% of net | Platform at 30% of net | If the creator gets 70% of the price instead, the platform keeps |
| --- | --- | --- | --- | --- | --- |
| Web, US card at 2.9% + $0.30 | $0.59 | $9.41 | $6.59 | $2.82 | $2.41 |
| Apple, first year (30%) | $3.00 | $7.00 | $4.90 | $2.10 | $0.00 |
| Apple, after a year (15%) | $1.50 | $8.50 | $5.95 | $2.55 | $1.50 |
| Google Play subscription, US (10% + 5% billing) | $1.50 | $8.50 | $5.95 | $2.55 | $1.50 |

Each row closes (fee plus net is $10.00; creator plus platform is the net, or creator $7.00 plus the platform's remainder plus the fee). To keep the web net of $9.41 under a 30% fee, the in-app price would be about $13.44. The card row is the floor of the web's cost, not all of it: the web checkout also carries fraud, chargebacks at $15 each, tax and support. My default: sell on the web wherever the store rules allow a link, keep in-app purchase where they don't, price per channel as rows in the same price table, and decide who absorbs each channel's fee as a term of the revenue program, disclosed to creators before it applies.

## When Models Collide

Mixing models is normal and every pair conflicts somewhere. The ones that shape products:

| Collision | What goes wrong | How platforms manage it |
| --- | --- | --- |
| **Ads against user experience** | More ads per session earn less each (Pinterest: ads served up 49%, price per ad down 22%) and drive users away | Ad load caps per surface, frequency caps, quality floors on ads, measuring retention alongside revenue |
| **Ads against premium** | The users most likely to buy ad-free are the most valuable ad viewers | Price premium above the ad revenue those users would have produced; Reddit's US fourth-quarter ARPU of $10.79 is about $3.60 a month, the floor for a US ad-free price before engagement skew |
| **Ads against creators** | Ad suitability demonetizes creators; ad shares tied to ad minutes pay creators for heavier ad loads | Published suitability rules with appeal; ad shares with a minimum load, as Twitch's three-minute rule |
| **Promoted listings against relevance** | Paid results that don't match the query cost buyer trust; sellers who don't pay sink | Relevance floors, labels, caps on sponsored slots, pricing per sale rather than per click |
| **Take rate against leakage** | The higher the fee, the more hosts and buyers move the next transaction off the platform | Off-platform payment bans (Airbnb, Etsy), contact-detail blocking in messages, protection and guarantees only on platform payments, fee cuts for supply that brings its own demand (Outdoorsy's host fee drops to 6.5% and the guest fee to 0% for host-referred new guests) |
| **Guest fees against all-in pricing** | Fees added at checkout read as drip pricing | All-in display (required by the FTC fees rule for short-term lodging); moving to host-only fees |
| **Creator splits against margin** | Higher splits win creators and starve the platform; lower ones push creators off-platform | Tiered splits by creator size (Twitch's Plus Program), splits as versioned terms, platform-funded transitions |
| **App stores against every split** | 15% to 30% of in-app revenue goes to the store | Channel pricing, web checkout where allowed, store fee as a disclosed term |
| **Data licensing against community trust** | Users and moderators object to their posts being sold and to API changes that break their tools | Opt-outs, carve-outs for moderator tools, licensing terms that propagate deletions |
| **Paid status against trust** | Paid badges and reach blur earned credibility | Separate identity badges from paid perks; label paid prominence |
| **Float against payout speed** | Holding money longer earns interest and annoys sellers | Instant payouts for a fee, published schedules, holds only for risk |
| **Virtual currency against consumer law** | Currencies obscure prices, attract minors' spending and invite chargebacks | Prices shown in money too, spending limits for minors, refund rules per law ([Consumer Law & Loot Boxes](/books/gaming/consumer-law-and-loot-boxes)) |

The general lesson: **every model creates an incentive somewhere in the product, and two models together create a trade the platform has to make explicitly.** A platform that adds promoted listings without a relevance floor, or an ad-free tier without pricing the ads it loses, discovers the trade later in its metrics.

## Unit Economics by Model

From audited filings for 2025 unless noted; ratios are computed from the reported figures:

| Model | Platform | Reported | Derived |
| --- | --- | --- | --- |
| Advertising | Reddit | Revenue $2,202.5 million, about $2.1 billion from advertising; net income $529.7 million; Q4 ARPU $5.98 global, $10.79 US, $2.31 international | Net margin about 24%; US users worth about 4.7 times international in Q4 |
| Advertising | Pinterest | Revenue $4,221.8 million; ARPU $30.84 US and Canada, $5.12 Europe, $0.83 rest of world | About 75% of revenue from the US and Canada ($3,173.1 million) |
| Advertising, shared with creators | YouTube | Ads $40,367 million, up from $36,147 million | Creator share of 55% on watch-page ads means the platform keeps 45% of that line before serving costs |
| Take rate, stays | Airbnb | Revenue $12,241 million on GBV $91,273 million; net income $2,511 million | Take rate about 13.4%; net margin about 20.5% |
| Take rate plus protection | Turo (2023, S-1/A) | Revenue $879.7 million on GBV $2,409.7 million | About 36.5% of GBV |
| Take rate, goods | Etsy | Revenue $2,883.5 million; take rate 24.2%; marketplace $2,007.2 million, services $876.3 million | Services (ads and labels) 30.4% of revenue |
| Take rate, goods | eBay | Net revenues $11,100 million on GMV $79,609 million; take rate 13.94% | |
| Seller ads | eBay | Advertising $1,993 million, up 22% | About 18% of revenue and 2.5% of GMV |
| Payment float | Airbnb | Interest income $705 million; $6,959 million held for customers | About 5.8% of revenue and 28% of net income |
| Data licensing and direct-to-user | Reddit | Other revenue implied at about $0.1 billion | About 5% of revenue |
| Premium subscriptions | Reddit | Direct-to-user products "not material" | |

Three things to read off it. **Advertising earns per user, and the user's country matters more than the user's activity:** the same platform earns several times more from a US user than an international one, so international growth dilutes ARPU before it adds much revenue. **Take rates earn per transaction, and the take rate's composition matters more than its level:** Turo's 36.5% isn't a richer marketplace than Airbnb's 13.4%; it's a marketplace selling insurance-like products with claims costs against them. **Secondary models are small until they aren't:** eBay's seller ads are a fifth of its revenue and Airbnb's interest is over a quarter of its profit, while Reddit's subscriptions and licensing together are about a twentieth of its revenue. Twitch, Discord, Kick and the private marketplaces publish no audited figures, so their economics are left out; [Operating Metrics](/books/user-generated-platforms/operating-metrics) covers the metrics themselves.

## Choosing and Sequencing Models

The questions that decide a platform's models, in order:

1. **What do users supply: attention or inventory?** Posts, videos and streams supply attention; listings and bookings supply inventory. Attention platforms start with advertising and add subscriptions and creator money; inventory platforms start with a take rate and add seller ads, plans and protection. Mixing the primary model the wrong way round (charging per post, running display ads on a booking flow) fights the product.
2. **Where is the moment of leverage?** A marketplace has it at the transaction and must charge there, from day one, because adding a fee later teaches supply to leave. A community has it in attention, which only pays at scale, so it can defer.
3. **Who has willingness to pay, and in which countries?** Ad ARPU and subscription willingness both follow the local market. A platform whose users are mostly outside the high-ARPU regions needs more non-ad revenue sooner, and regional pricing from the first paid product.
4. **Who must be paid to keep supply?** If creators or hosts can leave, part of every model is their share, and the split is a competitive price.
5. **What will the stores take?** If most purchases happen in a mobile app, the store's fee is part of every price and split, and the web checkout is part of the product.
6. **What does the model need that the platform doesn't have?** Ads need scale, an ads system and suitability labels; creator money needs KYC, tax and payouts; protection needs claims and licensing; float needs licensed payment entities.

A typical sequence for an attention platform: free and unmonetized until engagement is proven; advertising (rented first) once there's scale in high-ARPU regions; a premium tier for the most engaged users, priced above the ads they won't see; creator revenue share and fan payments once creators are the reason people come; commerce and licensing last, when the corpus and the audience are worth buying. For an inventory platform: a take rate from the first transaction, with one side paying and an all-in price; protection and deposits as soon as the inventory is valuable (vehicles, homes); seller ads once search has more supply than demand for top slots; seller plans for professionals; float as a consequence of payout timing, never a reason for it. The order is reversible only at a cost: removing a free feature, raising a fee or lowering a split is a change users and creators remember.

![Two lanes of revenue models in the order a platform typically adds them. Attention platforms, built on posts, videos and streams: unmonetized until engagement is proven; advertising, the foundation, rented first at scale in high-ARPU regions; a premium tier for the most engaged users; creator money as revenue share and fan payments; and commerce and licensing last, when the corpus is worth buying. Inventory platforms, built on listings and bookings: a take rate, the foundation, from the first transaction with one side paying and an all-in price; protection and deposits once inventory is valuable; seller ads when search has more supply than top slots; seller plans for professional sellers; and float, drawn dashed, a consequence of payout timing and never a reason.](/diagrams/ugp-monetization-strategies-sequence.svg "Attention platforms start with ads and defer; inventory platforms charge at the transaction from day one. Float follows from payout timing rather than being chosen.")

My rule: add a model when its prerequisites exist and its conflict with the existing models has a written answer, and model every one as versioned program terms from the start, so the next change is a new row and not a migration.

## How to Build It

These are deltas against [the core data model](/books/user-generated-platforms/platform-business#the-core-data-model) and the [Payments](/books/payments/card-payments#the-core-data-model) ledger. This chapter owns the terms of every revenue program, the catalog of things the platform sells, their prices by channel and country, store transactions, and seller promotions. [Creator Monetization](/books/user-generated-platforms/creator-monetization#how-to-build-it) adds subscriptions, fan payments, virtual currency and earnings on top; [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#how-to-build-it) adds suitability labels and data licenses; [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#how-to-build-it) adds enrollments, tax profiles and payout rules; [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#how-to-build-it) adds marketplace fee lines.

```sql
-- One program per way money is split: a creator subscription share, an ad share,
-- a stay service fee, offsite ads, a data license.
CREATE TABLE revenue_programs (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  code        TEXT NOT NULL UNIQUE,      -- 'channel_subscriptions', 'watch_page_ads', ...
  model       TEXT NOT NULL CHECK (model IN ('advertising', 'premium_subscription',
                'virtual_currency', 'ad_revenue_share', 'creator_subscription',
                'paid_community', 'tipping', 'affiliate', 'take_rate',
                'promoted_listing', 'seller_subscription', 'protection',
                'api_access', 'data_license')),
  payer_role  TEXT NOT NULL CHECK (payer_role IN ('advertiser', 'user', 'fan', 'guest',
                'buyer', 'host', 'seller', 'creator', 'developer', 'licensee')),
  payee_role  TEXT CHECK (payee_role IN ('creator', 'community', 'host', 'seller',
                'developer')),           -- null: the platform keeps it all
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Versioned terms: what each party keeps, on what base, for whom, from when.
-- Tiers (50/60/70 by points, 15%/12% by trailing sales) are rows with a tier name.
CREATE TABLE revenue_program_terms (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id         UUID NOT NULL REFERENCES revenue_programs (id),
  version            INT NOT NULL,
  tier               TEXT NOT NULL DEFAULT 'standard',
  country            CHAR(2),              -- null: everywhere not otherwise listed
  channel            TEXT CHECK (channel IN ('web', 'apple', 'google', 'other')),
  share_base         TEXT NOT NULL CHECK (share_base IN ('gross', 'net_of_tax',
                       'net_of_store_fee', 'net_of_tax_and_store_fee')),
  store_fee_bearer   TEXT NOT NULL DEFAULT 'shared' CHECK (store_fee_bearer IN
                       ('platform', 'payee', 'shared', 'payer')),  -- 'payer': priced in
  payee_share_bps    INT CHECK (payee_share_bps BETWEEN 0 AND 10000),
  platform_rate_bps  INT CHECK (platform_rate_bps BETWEEN 0 AND 10000),  -- fee programs
  min_fee            BIGINT,               -- per transaction or per night, minor units
  max_fee            BIGINT,               -- e.g. a per-order cap
  currency           CHAR(3),
  conditions         JSONB NOT NULL DEFAULT '{}',  -- eligibility and tier rules, as data
  valid_during       TSTZRANGE NOT NULL,
  announced_at       TIMESTAMPTZ,          -- when payees were told
  source_url         TEXT,                 -- the published terms
  UNIQUE (program_id, version, tier, country, channel),
  CHECK ((min_fee IS NULL AND max_fee IS NULL) OR currency IS NOT NULL),
  EXCLUDE USING GIST (program_id WITH =, tier WITH =, (COALESCE(country, '**')) WITH =,
    (COALESCE(channel, '*')) WITH =, valid_during WITH &&)
);

-- What the platform sells directly or on a payee's behalf.
CREATE TABLE products (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  kind               TEXT NOT NULL CHECK (kind IN ('premium_plan', 'creator_tier',
                       'community_tier', 'currency_pack', 'virtual_good', 'seller_plan',
                       'promotion_credit', 'protection_plan', 'api_plan')),
  sku                TEXT NOT NULL UNIQUE, -- also the store product id where one exists
  name               TEXT NOT NULL,
  billing            TEXT NOT NULL CHECK (billing IN ('one_time', 'recurring', 'usage')),
  billing_interval   TEXT CHECK (billing_interval IN ('month', 'year')),
  payee_profile_id   UUID REFERENCES profiles (id),      -- a creator's tier
  community_id       UUID REFERENCES communities (id),   -- a community's tier
  revenue_program_id UUID NOT NULL REFERENCES revenue_programs (id),
  status             TEXT NOT NULL CHECK (status IN ('draft', 'active', 'retired')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((billing = 'recurring') = (billing_interval IS NOT NULL)),
  CHECK (payee_profile_id IS NULL OR community_id IS NULL)
);

-- Prices by channel and country; a regional price, a store price, a promotion and
-- an increase are all rows. Null country is the default for that channel and currency.
CREATE TABLE product_prices (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id      UUID NOT NULL REFERENCES products (id),
  channel         TEXT NOT NULL CHECK (channel IN ('web', 'apple', 'google', 'other')),
  country         CHAR(2),
  currency        CHAR(3) NOT NULL,
  amount          BIGINT NOT NULL CHECK (amount >= 0),
  tax_inclusive   BOOLEAN NOT NULL,
  reason          TEXT NOT NULL CHECK (reason IN ('list', 'regional', 'store_fee_offset',
                    'increase', 'promotion', 'creator_set')),
  applies_to_existing BOOLEAN NOT NULL DEFAULT FALSE,  -- renewals move to this price
  notice_sent_at  TIMESTAMPTZ,            -- required before renewals at a higher price
  valid_during    TSTZRANGE NOT NULL,
  set_by          UUID REFERENCES accounts (id),  -- staff, or the creator for their tier
  EXCLUDE USING GIST (product_id WITH =, channel WITH =, (COALESCE(country, '**')) WITH =,
    currency WITH =, reason WITH =, valid_during WITH &&)
);

-- Seller promotions inside the marketplace's own search.
CREATE TABLE listing_promotions (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  seller_account_id  UUID NOT NULL REFERENCES accounts (id),
  listing_id         UUID REFERENCES listings (content_item_id),  -- null: a whole-shop campaign
  pricing            TEXT NOT NULL CHECK (pricing IN ('cost_per_sale', 'cost_per_click',
                       'cost_per_impression')),
  ad_rate_bps        INT CHECK (ad_rate_bps BETWEEN 0 AND 10000),  -- cost per sale
  max_bid            BIGINT,                                       -- per click or per mille
  daily_budget       BIGINT,
  currency           CHAR(3) NOT NULL,
  attribution_days   SMALLINT NOT NULL DEFAULT 30,
  terms_id           UUID NOT NULL REFERENCES revenue_program_terms (id),
  status             TEXT NOT NULL CHECK (status IN ('active', 'paused', 'ended')),
  valid_during       TSTZRANGE NOT NULL,
  CHECK ((pricing = 'cost_per_sale') = (ad_rate_bps IS NOT NULL))
);

-- What a promotion cost: one charge per attributed click, impression batch or sale.
CREATE TABLE promotion_charges (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  promotion_id          UUID NOT NULL REFERENCES listing_promotions (id),
  basis                 TEXT NOT NULL CHECK (basis IN ('click', 'impressions', 'sale')),
  booking_id            UUID REFERENCES bookings (id),  -- the attributed sale or booking
  clicked_at            TIMESTAMPTZ,
  amount                BIGINT NOT NULL,
  currency              CHAR(3) NOT NULL,
  reverses_id           UUID REFERENCES promotion_charges (id),  -- refund or invalid click
  ledger_transaction_id UUID NOT NULL REFERENCES ledger_transactions (id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((basis = 'sale') = (booking_id IS NOT NULL))
);
```

App-store purchases use Gaming's [`store_transactions` and `store_fee_rates`](/books/gaming/stores-and-payments#receipt-validation-and-entitlement-grants) (the state machine from `pending` through `granted` to `reversed`, the store's transaction ID as the key, the fee as an estimate until the store reports), without `tenant_id` and `game_id`, with `product_id` in place of `offer_id`:

```sql
ALTER TABLE store_transactions
  DROP CONSTRAINT store_transactions_store_xid_key,
  DROP COLUMN tenant_id,
  DROP COLUMN game_id,
  DROP COLUMN offer_id,
  ADD COLUMN product_id UUID NOT NULL REFERENCES products (id),
  ADD COLUMN product_price_id UUID REFERENCES product_prices (id),  -- the price shown
  ADD CONSTRAINT store_transactions_store_xid_key UNIQUE (store, store_transaction_xid);
```

Resolving the terms for a payment is a lookup by program, tier, country and channel at the moment the money was earned, falling back from the most specific row:

```sql
SELECT t.*
FROM revenue_program_terms t
WHERE t.program_id = $1
  AND t.tier = $2
  AND (t.country = $3 OR t.country IS NULL)
  AND (t.channel = $4 OR t.channel IS NULL)
  AND t.valid_during @> $5::timestamptz      -- when it was earned, not when it's paid
ORDER BY (t.country IS NOT NULL) DESC, (t.channel IS NOT NULL) DESC
LIMIT 1;
```

Design decisions behind it:

- **Terms are rows, resolved at the earning event.** A subscription period, an ad impression month, a booking's check-in or a sale picks its terms when the money is earned and stores the term's ID on the earning or fee line; changing the split is inserting a new version with a later `valid_during`, never an update. Old money stays under old terms ([Effective Dating & History](/docs/database/temporal-data)).
- **Tier conditions are data, evaluated by a rules engine.** "300 Plus Points for three months" or "trailing 365-day sales above $10,000" go in `conditions` and are evaluated against facts the platform already records; the result (which tier applied) is stored, not recomputed ([Rules as Data](/docs/architecture/rules-as-data)).
- **The store fee has an owner in the terms.** `share_base` and `store_fee_bearer` say whether a creator's 70% is of the price, the price net of tax, or the price net of the store's cut, so a payout statement can explain every cent.
- **Prices are per channel.** An in-app price that offsets the store fee is a `store_fee_offset` row; a local price is a `regional` row; a creator's own tier price is `creator_set` with the creator as `set_by`. Increases carry `notice_sent_at`, and the renewal job refuses to charge a higher price without it.
- **Promotions are fees, not ads in the ad system.** A seller's promotion charge posts to the seller's balance as a fee line tied to the sale or click that caused it, and reverses with a refund; it never touches the advertiser billing that [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing) covers.
- **Revenue by model is a ledger query.** Each program posts the platform's share to its own revenue ledger account (`revenue:advertising`, `revenue:take_rate:stays`, `revenue:promoted_listings`, `revenue:float_interest`), so the unit economics above are a report and not a reconstruction ([Payment States & Ledgers](/docs/payments/payment-states)).

Events: `revenue_terms.published`, `product_price.changed`, `store_transaction.granted`, `store_transaction.reversed`, `listing_promotion.charged` and `listing_promotion.reversed`, which payouts, statements, finance and notifications subscribe to.

## Auditing

Revenue programs are promises to the people who supply the platform, and the records have to show they were kept:

- **The terms in force for every payment.** Each earning, fee line and promotion charge points at the `revenue_program_terms` row that priced it, with the tier the rules engine chose and the facts it used, so a creator's or seller's statement can be recomputed years later.
- **Every change of terms and prices, with notice.** Who published a new version, when payees and subscribers were told, and the source URL of the published terms; price increases without notice are a consumer-law exposure.
- **Channel and store fees.** For each in-app purchase, the store, the store's transaction ID, the estimated fee and the fee the store reported, reconciled monthly ([Two Audiences for the Same Numbers](/books/payments/ledger-and-reconciliation#two-audiences-for-the-same-numbers)).
- **Promotion charges and their attribution.** The click or sale each charge rests on, the attribution window and any reversal, since sellers dispute ad charges and regulators look at paid ranking.
- **Revenue by model.** Ledger postings per program, so filings, investor metrics and transparency reports come from the same entries ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Pick the primary model from what users supply:** attention platforms start with ads, inventory platforms with a take rate charged at the transaction.
- **Model every revenue program as versioned terms:** who pays, who earns, what share, on what base, for which tier, country and channel, from when.
- **Resolve terms when money is earned** and store which terms applied on every earning and fee line.
- **Price per channel and country** in one price table, with store-fee offsets, regional prices, promotions and increases as dated rows and notice recorded.
- **Decide who absorbs each store's fee** as a disclosed term, and send purchases to the web where store rules allow.
- **Write down the answer to each model collision** (ad load against premium, promoted listings against relevance, take rate against leakage) before launching the second model.
- **Keep safety, discovery and the public corpus free;** charge for standing out, going deeper and serving costs.
- **Treat seller promotions as fee lines** attributed to clicks or sales and reversed with refunds.
- **Post each model's revenue to its own ledger account** so unit economics are a query.
- **Leave float as a consequence of payout timing,** and hold customer money only under the licenses that requires.

## References

**Filings**

- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), total revenue of $2,202.5 million and about $2.1 billion from advertising, net income of $529.7 million, fourth-quarter ARPU by geography, Premium and Gold not material, logged-out visitors monetized with conversation-page and feed ads, Dynamic Product Ads, other revenue from content licensing, licensing recognized as content is consumed
- [Pinterest: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1506293/000150629326000021/pins-20251231.htm), revenue and ARPU by geography and the reason given for the gap, ads served up 49% and average price per ad down 22%, Shopping and Collection ads
- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), YouTube ads revenue for 2024 and 2025
- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), revenue, gross booking value, net income, interest income, funds held on behalf of customers, revenue recognized at check-in, licensed payment entities
- [Etsy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1370637/000137063726000019/etsy-20251231.htm), revenue, marketplace and services revenue, the 24.2% take rate, Etsy Ads growth from ranking, budget pacing and onsite ads in organic search
- [eBay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm), net revenues, marketplace and advertising revenues, the 13.94% take rate, GMV
- [Turo: Form S-1/A, Amendment No. 12](https://www.sec.gov/Archives/edgar/data/1514587/000162828024047889/turoinc-sx1a12.htm), 2023 gross booking value and revenue, marketplace fees at check-in and value-added service fees over the trip

**Regulation**

- [FTC: Rule on Unfair or Deceptive Fees, frequently asked questions](https://www.ftc.gov/business-guidance/resources/rule-unfair-or-deceptive-fees-frequently-asked-questions), all-in prices for short-term lodging from 12 May 2025
- [FTC: Informing businesses about the INFORM Consumers Act](https://www.ftc.gov/business-guidance/resources/informing-businesses-about-inform-consumers-act), duties for high-volume third-party sellers
- [Digital Services Act, Article 28](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_28.html), no profiling-based ads to minors

**Platform terms**

- [Discord: A beginner's guide to Nitro](https://discord.com/blog/beginners-guide-to-nitro), Nitro and Nitro Basic US prices and localized prices elsewhere
- [Discord: Creator Revenue FAQ](https://creator-support.discord.com/hc/en-us/articles/10424143128343-Creator-Revenue-FAQ), the 90% owner share on Server Subscriptions
- [Discord: Server Boosting FAQ](https://support.discord.com/hc/en-us/articles/360028038352-Server-Boosting-FAQ), buying and applying boosts, levels at 2, 7 and 14 boosts and their perks, Nitro's two boosts and 30% discount, the seven-day transfer cooldown and 72-hour grace period
- [Imgur Emerald page, July 2020 (Wayback Machine)](https://web.archive.org/web/20200708203606/https://imgur.com/emerald), $5 a month through a Coil membership, ad-free browsing and member avatars and trophies
- [Imgur Emerald page, June 2023 (Wayback Machine)](https://web.archive.org/web/20230601062249/https://imgur.com/emerald), sign-up on the mobile apps, no ads or promoted posts on iOS, Android and desktop
- [Imgur Emerald page, October 2026 (Wayback Machine)](https://web.archive.org/web/20261023154917/https://imgur.com/emerald), the subscription still offered
- [YouTube: YouTube Partner Program revenue shares](https://support.google.com/youtube/answer/72902?hl=en), 55% watch-page ads, 45% Shorts, 70% fan funding
- [YouTube: Shorts monetization policies](https://support.google.com/youtube/answer/12504220?hl=en), the Shorts pool by country and the music deduction
- [Twitch: Partners](https://www.twitch.tv/p/en/partners/), subscription prices and one cent per Bit
- [Twitch: A more flexible Ads Incentive Program coming in April](https://blog.twitch.tv/en/2023/03/09/a-more-flexible-ads-incentive-program-coming-in-april), 55% and 30% ad shares and the three-minute minimum
- [Twitch: Local sub pricing expands worldwide](https://blog.twitch.com/en/2021/08/05/local-sub-pricing-expands-worldwide/), prices by location and payment method, existing and gift subs included, the creator revenue adjustment, gifting and Brazil results, example prices
- [Patreon: Understanding Apple requirements for Patreon](https://news.patreon.com/articles/understanding-apple-requirements-for-patreon), the 30% fee on new iOS memberships from November 2024, the iOS price tool, subscription billing and the November 2025 end of other billing models
- [Etsy: Fees & Payments Policy](https://www.etsy.com/legal/fees/), listing and transaction fees, Offsite Ads rates and cap, Etsy Plus, the off-platform transaction ban
- [eBay: Promoted Listings](https://export.ebay.com/en/services-tools/advertising/promoted-listings/), general strategy ad rates on total sale amount within 30 days of a click, priority strategy cost per click with a daily budget
- [Airbnb: Airbnb service fees](https://www.airbnb.com/help/article/1857), the host-only fee and the legacy split fee
- [Airbnb: Off-Platform and Fee Transparency Policy](https://www.airbnb.com/help/article/2799), communication and payment on the platform
- [Outdoorsy: Fee structure and how hosts get paid](https://support.outdoorsy.com/hc/en-us/articles/37916164272283-What-is-your-fee-structure-And-how-do-I-get-paid), host fees of 20% to 25%, the minimum per night and the 6.5% fee for host-referred guests
- [Outdoorsy: What fees should I be aware of](https://support.outdoorsy.com/hc/en-us/articles/37981867822747-What-fees-should-I-be-aware-of), the 10% guest service fee
- [Turo: Earnings plans in detail for US hosts](https://help.turo.com/en_us/earnings-plans-in-detail-us-hosts-ByMOIVxEc.md), the 70%, 80% and 90% plans and their damage responsibility
- [Vinted: Buyer Protection fee](https://www.vinted.co.uk/help/342-buyer-protection-fee-on-vinted), the buyer-paid fee model
- [Apple: Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/), 70% in the first year, 85% after a year of paid service, 85% for Small Business Program members
- [Google Play: Service fees](https://support.google.com/googleplay/android-developer/answer/112622), the 2026 fee structure, rollout dates, billing fee and rest-of-world rates
- [Twitch Creator Camp: Running ads](https://www.twitch.tv/creatorcamp/en/level1/monetization/running-ads), creator-scheduled ad breaks and Turbo ad-free viewing
- [Outdoorsy: What is a Security Deposit Waiver](https://support.outdoorsy.com/hc/en-us/articles/46384743917595-What-is-a-Security-Deposit-Waiver-and-what-does-it-mean-for-my-listings), the flat waiver fee that buys the deductible down
- [Apple: Updates to the App Review Guidelines](https://developer.apple.com/news/?id=9txfddzf), 1 May 2025, links and buttons to outside purchases allowed on the US storefront
- [Google Play: Policies for developers serving users in the US](https://support.google.com/googleplay/android-developer/answer/15582165?hl=en), Google Play Billing no longer required in the US and links out allowed
- [Stripe: Pricing](https://stripe.com/pricing), 2.9% plus 30 cents for US domestic cards and the $15 dispute fee

**In practice**

- [Supreme Court docket 25-1311, Apple v. Epic Games](https://www.supremecourt.gov/docket/docketfiles/html/public/25-1311.html), certiorari limited to Question 1, the stay denial and the merits briefing schedule
- [Ninth Circuit: Epic Games v. Apple, No. 25-2935](https://cdn.ca9.uscourts.gov/datastore/opinions/2025/12/11/25-2935.pdf), 11 December 2025, the 27% link-out commission and the remand
- [Wikipedia: X Premium](https://en.wikipedia.org/wiki/X_Premium), the three tiers, half the ads on Premium and none on Premium+, creator revenue sharing and subscriptions for Premium subscribers (secondary)
- [XDA Developers: Tumblr introduces an ad-free subscription](https://www.xda-developers.com/tumblr-ad-free/), February 2022, $4.99 a month or $39.99 a year (secondary)
- [TechCrunch: Tumblr Blaze](https://techcrunch.com/2022/04/20/tumblr-blaze-420/), April 2022, paid promotion of posts by impressions
- [Wikipedia: Imgur](https://en.wikipedia.org/wiki/Imgur), Pro accounts created in 2010 to remove upload limits
- [APH Networks: Imgur launches an ad-free subscription service, powered by micropayments](https://aphnetworks.com/index.php/news/22705-imgur-launches-ad-free-subscription-service-powered-micropayments), Emerald's quiet web launch in May 2020 and the August 2020 announcement with the Android app
- [Open Terms Archive: X replaces its $200 entry-level API plan with a pay-per-use model](https://opentermsarchive.org/en/memos/x-replaces-its-dollar200-entry-level-api-plan-with-a-pay-per-use-model/), 28 April 2026, self-serve pay-per-use and Enterprise for commercial use
- [Shutterstock: Data licensing and the Contributor Fund](https://submit.shutterstock.com/help/en/articles/10594694-shutterstock-data-licensing-and-the-contributor-fund), contributor share of data licensing revenue
- [Insider Gaming: Twitch makes changes to streamer payouts](https://insider-gaming.com/twitch-makes-changes-to-streamer-payouts/), the Plus Program tiers (secondary)
- [Shacknews: Twitch subscription price increase](https://shacknews.com/article/140084/twitch-subscription-price-increase-july-2024), $5.99 Tier 1 from July 2024 and existing subscriptions renewing at the new price (secondary)
- [Tubefilter: Twitch Hype Chat](https://tubefilter.com/2023/06/23/twitch-hype-chat-revenue/), the June 2023 launch
- [Tubefilter: Twitch will deprecate Hype Chat](https://www.tubefilter.com/?p=176946), the November 2023 decision
- [Social Media Today: Reddit launches new Reddit Gold program](https://www.socialmediatoday.com/news/reddit-launches-new-reddit-gold-program-will-see-top-contributors-paid/694665/), the Contributor Program paying contributors for Gold received (September 2023)
- [Streamlabs: What are Twitch Bits worth](https://streamlabs.com/content-hub/post/what-are-twitch-bits-worth), Bits pack prices above the one cent the creator earns (secondary)
