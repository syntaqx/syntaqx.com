+++
title = "The User-Generated Platform Business"
nav_title = "The Platform Business"
description = "How platforms where users supply the content or the inventory work: the parties, every way they earn, how big they are, and the core data model."
category = "User-Generated Platforms Industry"
order = 1801
part = "The Business"
tags = ["user-generated-content", "marketplaces", "business-models", "data-model", "trust-and-safety"]
+++

A user-generated platform sells something it didn't make. A forum sells attention to conversations its members wrote; an image host serves pictures its users uploaded; a streaming service broadcasts people it doesn't employ; a rental marketplace books RVs, cars and spare rooms it doesn't own; a goods marketplace ships items from millions of closets and workshops. The platform's job is to make strangers' contributions findable, safe enough to use, and worth paying for, while taking a cut, selling ads around them, or both. Every one of these businesses has the same three problems: getting enough supply (posts, videos, streams, listings) to be worth visiting, getting enough demand (readers, viewers, guests, buyers) to be worth supplying, and keeping the worst of what users can do off the platform without strangling the rest.

The software is hard because publishing, money and law hang off the same few records. A single upload is a storage cost, a ranking candidate, a possible copyright claim, a hash to check against child-safety lists, and evidence a regulator may ask about two years later. A single booking is a calendar hold, a payment held for someone else, an insurance exposure, a tax obligation in the guest's and the host's jurisdictions, and a review both sides will write. This chapter is the map the rest of the volume uses: how to read it, the system it describes, who the parties are, every way these platforms make money, how big they are, the life of a post, a live stream and a booking, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/user-generated-platforms/glossary).

## How to Read This Volume

The chapters follow content and inventory from the person who supplies it to the platform that runs it, in eight parts plus a reference:

- **The Business.** This chapter, then [The Platform Landscape](/books/user-generated-platforms/platform-landscape) (communities, media hosts, streaming, chat, federated networks and peer-to-peer marketplaces; the infrastructure and trust and safety vendors behind them; consolidation and capital; build, buy or rent) and [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity) (handles and decentralized identifiers, verification badges, one login with host and guest roles, account standing, takeover defense, deletion versus retention).
- **Communities and Conversation.** [Communities, Roles & Permissions](/books/user-generated-platforms/communities-and-permissions) (forum, server and instance models, role hierarchies and the permission algorithm, ownership transfer); [Posts, Comments & Voting](/books/user-generated-platforms/posts-comments-and-voting) (threading, karma, hot and confidence ranking, vote manipulation, viral galleries); [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations) (candidate generation, graph and sequence models, logged-out economics, re-engagement); [Search & Discovery](/books/user-generated-platforms/search-and-discovery) (keyword search at scale, visual search, AI answers over community content); [Real-Time Chat](/books/user-generated-platforms/real-time-chat) (gateways and sharding, presence, message storage at scale); [Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms) (SFU design, regional assignment, recording and consent); [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation) (community rules, automod engines, moderator caps, the 2023 blackout); [Federation & Open Protocols](/books/user-generated-platforms/federation) (ActivityPub and AT Protocol, portability, labelers, defederation); and [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis) (bots, privileged data, rate limits, API pricing changes, scraping suits).
- **Media.** [The Upload Path](/books/user-generated-platforms/upload-path) (direct-to-storage and resumable uploads, validation, scanning before publish); [Images at Scale](/books/user-generated-platforms/images-at-scale) (variants, format negotiation, GIF to video, EXIF and location stripping, provenance); [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery) (exact and perceptual dedup, storage tiers, egress, hotlinking, orphan purges, why platforms cap storage); [Video on Demand](/books/user-generated-platforms/video-on-demand) (transcode farms, ladders, codecs, packaging, DRM, cost per viewer-hour); [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding) (RTMP, SRT, WHIP, ingest routing, transcode versus transmux); [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods) (latency tiers and what each loses, live to VOD, clips); and [Live Chat & the Interactive Layer](/books/user-generated-platforms/live-chat-and-interactivity) (chat fanout, raids, channel points, extensions, drops).
- **Creators and Money.** [Monetization Strategies](/books/user-generated-platforms/monetization-strategies) (the full menu of ways to earn and how each shapes the product, with unit economics from filings); [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing) (ads on user content, suitability, contextual targeting, licensing to AI and search companies); [Creator Monetization](/books/user-generated-platforms/creator-monetization) (subscriptions, tips, virtual currencies, paid chat, revenue splits compared); and [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers) (eligibility, KYC, payout triggers, risk holds, tax interviews, 1099-K, DAC7).
- **Peer-to-Peer Marketplaces.** [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding) (host and seller identity, asset eligibility, INFORM Act and DSA trader traceability); [Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking) (listing schema and quality, availability-aware geo search, cold start); [Availability & Booking](/books/user-generated-platforms/availability-and-booking) (calendars, iCal sync, request versus instant book, modifications); [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees) (dynamic pricing, fee models, usage charges, the FTC fees rule, marketplace facilitator tax); [Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection) (holds, waivers, embedded insurance versus contractual protection, peer-to-peer car-sharing law); [Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims) (check-in and check-out evidence, claim windows, appraisal, subrogation); [Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews) (messaging as the transaction record, off-platform leakage, simultaneous-reveal reviews, the FTC fake reviews rule); [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes) (policy catalogs, guarantee programs, chargebacks, arbitration); and [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud) (reservation risk scoring, linked accounts, fake listings, payment diversion).
- **Trust and Safety.** [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability) (Section 230, DMCA safe harbors, DSA hosting liability, the litigation); [Moderation at Scale](/books/user-generated-platforms/moderation-at-scale) (classifiers as prioritizers, vendors, outsourced review, wellbeing, prevalence); [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots) (account farms, vote rings, CAPTCHAs, coordinated inauthentic behavior, crowd context); [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety) (2258A and the REPORT Act, CyberTipline reports, hash matching, the EU and UK regimes); [Terrorism, Violent Extremism & Graphic Content](/books/user-generated-platforms/violent-extremism-and-graphic-content) (GIFCT, incident response, one-hour removal orders, interstitials); [Intimate Image Abuse](/books/user-generated-platforms/intimate-image-abuse) (the TAKE IT DOWN Act, StopNCII, deepfakes); [Copyright at Scale](/books/user-generated-platforms/copyright) (notices, counter-notices, repeat infringers, fingerprinting, Article 17); and [Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks) (the web host's view: phishing, malware, DNS abuse, suspension versus takedown).
- **The Rules.** [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement) (the DSA, the UK Online Safety Act and Australia's eSafety regime, with an enforcement ledger); [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance) (age assurance methods and vendor risk, teen defaults, state laws and their court status, KOSA, COPPA); [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests) (subpoenas, warrants, emergency disclosure, preservation, international requests); and [Transparency Reporting](/books/user-generated-platforms/transparency-reporting) (what the platforms count, DSA templates, OSA reports).
- **Running the Platform.** [Platform Architecture](/books/user-generated-platforms/platform-architecture) (tenancy by community, media and moderation services, the event spine, scale numbers from public write-ups); [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms) (AI moderation and its error budgets, generative content and labels, provenance, training-data licensing); [Operating Metrics](/books/user-generated-platforms/operating-metrics) (DAU and MAU, engagement, creator and supply health, GMV and take rate, prevalence, cost per viewer-hour); and [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns) (policy-driven purges, storage caps, link rot, exports, ending a service).
- **Reference.** A [Glossary](/books/user-generated-platforms/glossary) of every term the volume defines, grouped by part.

The volume covers what user-supplied content and inventory add. The general engineering lives in the playbook, and chapters here link to it rather than repeat it: [Trust & Safety](/docs/security/trust-and-safety) owns the moderation machinery every platform shares (policy as a specification, [reports and queues](/docs/security/trust-and-safety#reports-and-queues), [penalty ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders), [notices and statements of reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons), [appeals](/docs/security/trust-and-safety#appeals), audit, transparency and moderator wellbeing), and this volume adds only the industry detail. The others: [Children's Privacy](/docs/compliance/childrens-privacy), [GDPR](/docs/compliance/gdpr), [Calls, Texts & Email](/docs/compliance/consumer-contact), [Notifications & Consent](/docs/architecture/notifications), [Realtime Connections](/docs/architecture/realtime-connections), [Reservations & Holds](/docs/architecture/reservations-and-holds), [Automated Risk Decisions](/docs/architecture/risk-scoring), [Rules as Data](/docs/architecture/rules-as-data), [Audit Trails](/docs/architecture/audit-trails), [Data Retention & Deletion](/docs/architecture/data-retention), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Events & Async Messaging](/docs/architecture/events), [Background Jobs](/docs/architecture/background-jobs), [AI Agents in the Product](/docs/architecture/ai-agents), [Money & Amounts](/docs/payments/money) and [Payment States & Ledgers](/docs/payments/payment-states). Three other volumes own topics this one leans on: [Payments](/books/payments/card-payments) for the money ([Payments for Software Platforms](/books/payments/software-platforms), [Payouts & Settlement](/books/payments/payouts-and-settlement), [Vendor Payouts](/books/payments/vendor-payouts), [Merchant Onboarding](/books/payments/merchant-onboarding), [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks), [Fraud & Risk](/books/payments/fraud-and-risk)); [Property Tech](/books/property-tech/short-term-rentals) for the host's and property manager's side of short-term rentals; and [Gaming](/books/gaming/player-behavior) for in-game behavior, [creator economies](/books/gaming/creator-economies), [social systems](/books/gaming/social-systems) and game accounts.

The volume is US-centric, with the EU, UK and Australian regimes covered wherever they bind a platform that serves people there, because for user content they often bind first. No single platform is the model: the vocabulary and tables are the industry's, benchmarked across Reddit, Discord, Pinterest, Imgur, Twitch, YouTube, Kick, Tumblr, Bluesky, Mastodon, Airbnb, Outdoorsy, RVshare, Turo, Etsy, eBay and Vinted, and a platform's own product name appears only where the chapter is describing that platform.

## The System You're Building

Read end to end, the volume describes the components of a platform where users supply what others consume. Few platforms run all of them; most run a community core, a media pipeline, a trust and safety stack, and either a creator economy or a marketplace. Each has a part:

| Component | What it does | Where |
| --- | --- | --- |
| Accounts and core model | Accounts, profiles, communities, content items, media, listings, bookings, cases | This chapter, [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity) |
| Community core | Membership, roles and permissions, posts, threads, votes, community rules and volunteer moderators | Communities and Conversation |
| Distribution | Feeds, ranking, recommendations, search, notifications | [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations); [Search & Discovery](/books/user-generated-platforms/search-and-discovery) |
| Real time | Chat gateways, presence, voice rooms, live chat | [Real-Time Chat](/books/user-generated-platforms/real-time-chat); [Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms); [Live Chat & the Interactive Layer](/books/user-generated-platforms/live-chat-and-interactivity) |
| Media pipeline | Upload, validation, scanning, variants, transcoding, storage tiers, delivery | Media |
| Live video | Ingest, transcode, latency tiers, recording and clips | [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding); [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods) |
| Open edges | APIs, bots, app runtimes, federation, data licensing | [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis); [Federation & Open Protocols](/books/user-generated-platforms/federation) |
| Money in | Ads, subscriptions, virtual goods, take rates, licensing | Creators and Money |
| Money out | Creator and host earnings, payouts, holds, tax forms | [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers), and the [Payments](/books/payments/payouts-and-settlement) volume |
| Marketplace engine | Supply onboarding, listings, calendars, pricing, deposits, protection, claims, reviews, disputes | Peer-to-Peer Marketplaces |
| Trust and safety stack | Detection, cases, decisions, penalties, legal notices, mandatory reports | Trust and Safety, on top of the playbook's [Trust & Safety](/docs/security/trust-and-safety) |
| Rules engine | Regulator duties, minors' rules, law enforcement requests, transparency reports | The Rules |
| Platform | Architecture, AI, metrics, purges and shutdowns | Running the Platform |
| Vendors | Which layers to build, buy or rent | [The Platform Landscape](/books/user-generated-platforms/platform-landscape#build-buy-or-rent) |

## Who's Who

The same post or listing looks different to each party, and the platform has to serve all of them from one set of records:

| Party | Who they are | What they need from the platform |
| --- | --- | --- |
| **Users** | People who read, watch, buy, book and occasionally post; often logged out | Something worth their time, safety, control over their data |
| **Creators** | People whose content draws the audience: posters, streamers, video makers, artists | Reach, tools, analytics, a way to get paid, a fair hearing when moderated |
| **Hosts and sellers** | People and businesses that list inventory: a room, an RV, a car, a handmade item, a used jacket | Bookings or sales, payouts on time, protection when something goes wrong |
| **Guests and buyers** | The demand side of a marketplace | An accurate listing, an all-in price, a refund when it isn't as described |
| **Volunteer moderators** | Users who run communities: forum moderators, server owners, channel mods | Tools, automation, and a platform that backs their decisions |
| **Advertisers** | Brands and performance marketers buying attention next to user content | Reach, targeting, measurement, and suitability (no ads beside the wrong post) |
| **Data licensees** | Search engines and AI companies paying for access to the corpus | Reliable API access under contract |
| **Vendors** | Video, CDN, identity, insurance, payments and trust and safety providers | Integration, and the platform's data under their terms |
| **Regulators and law enforcement** | The FTC, state attorneys general, the European Commission and national coordinators, Ofcom, eSafety, the ICO, NCMEC as the US reporting channel, police and courts | Reports in their format, notices answered on their clock, records on demand |

The split that shapes the data model is **account versus role.** One account reads, posts, moderates a community, streams, books a trip and hosts an RV, and the platform must know which hat it wore for each act: a moderator's removal is a community decision, a host's cancellation is a supply penalty, a creator's earnings are taxable income. Designs that create separate accounts per role duplicate identity checks and lose the link between a person's conduct in one role and their standing in another; designs that ignore roles can't tell a seller's tax profile from a buyer's. [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#one-login-many-roles) owns the pattern.

The second split is **volunteer versus platform moderation.** On community platforms most removals are made by users, not staff. Reddit's transparency report for the second half of 2025 counts 154,198,211 posts and comments removed, 52.7% by moderators and 44.7% by admins, and its 10-K lists moderator recruitment and coordinated moderator action among its risk factors. A platform whose moderation model assumes a staff decision on every case can't be built for that shape, and one that ignores the volunteers' decisions can't report on them ([Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#the-platform-s-controls-over-moderators)).

## How the Money Is Made

Every strategy below is a way of charging one party for what another supplied. The map is here so the rest of the volume can refer to it; [Monetization Strategies](/books/user-generated-platforms/monetization-strategies) covers each in depth, including how they conflict when mixed (ads against user experience, take rate against off-platform leakage), app-store cuts, and unit economics per model.

| Strategy | Who pays | How it shows up | Audited or published figure |
| --- | --- | --- | --- |
| **Advertising** | Advertisers | Ads in feeds, conversations, search and video, sold by auction | Reddit: $2.1 billion of advertising revenue out of $2.2 billion total in 2025. Pinterest: $4,221.8 million revenue in 2025. YouTube ads: $40,367 million in 2025, up from $36,147 million |
| **Premium subscriptions** | Users | Ad-free tiers, perks, badges | Reddit says products sold directly to users, including Reddit Premium and Reddit Gold, were not material; Alphabet reports YouTube Premium and Music inside a wider subscriptions, platforms and devices line |
| **Virtual goods and currencies** | Users | Awards, boosts, cheers, gifts bought with a currency | Reddit's 10-K describes exploring ways for users to buy and gift virtual goods; no platform in this survey breaks out the revenue |
| **Creator revenue share** | Advertisers, passed through | A share of ad revenue on the creator's content | YouTube: 55% of net watch-page ad revenue to the creator, 45% of a pooled Shorts allocation |
| **Paid communities** | Members | Monthly tiers for access to a server, channel or subforum | Discord Server Subscriptions launched with owners keeping 90%, tiers from $2.99 to $199.99 a month |
| **Tipping and paid messages** | Fans | Super Chat, Super Thanks, Bits, tips | YouTube: 70% of fan funding to the creator |
| **Commerce and affiliate** | Merchants | Shoppable pins, product ads, catalog feeds, affiliate fees on attributed sales | Pinterest sells Shopping and Collection ad formats; Etsy charges sellers 15% (12% above $10,000 trailing sales) on orders its offsite ads attribute, capped at $100 |
| **Marketplace take rate** | Hosts, sellers, guests and buyers | Service fees as a percentage of the booking or sale | Airbnb: $12,241 million revenue on $91,273 million gross booking value in 2025 (about 13.4%). Etsy: 24.2% revenue take rate. eBay: 13.94% |
| **Promoted listings and seller ads** | Sellers | Paid placement inside the marketplace's own search | eBay: $1,993 million advertising revenue in 2025, "primarily" fees charged to sellers to promote listings. Etsy: $876.3 million services revenue, which includes on-site ads and shipping labels |
| **Seller subscriptions** | Sellers | Monthly plans with tools and credits | Etsy Plus at $10 a month |
| **Protection margins** | Guests and hosts | Protection plans priced per trip, host plans that trade take rate for deductible, deposit waivers | Turo's 2026 US host plans pay the host 70%, 80% or 90% of the trip price against damage responsibility of $250, $1,500 or $2,750 |
| **Payment float** | Nobody directly | Interest on guest and buyer money held before payout | Airbnb held $6,959 million on behalf of customers at the end of 2025 and earned $705 million of interest income that year (not all of it on customer funds) |
| **API and data licensing** | Search and AI companies, developers | Paid API tiers and multi-year content licenses | Reddit's other revenue (content licensing plus direct-to-user products) was roughly $0.1 billion in 2025; "substantially all" licensing contract value came from two partners, with API performance requirements |

Three patterns run through the table:

- **Content platforms are advertising businesses.** Reddit earned about $2.1 billion of its $2.2 billion 2025 revenue from advertising, and Pinterest's 10-K reports average revenue per user of $30.84 in the US and Canada against $0.83 in the rest of the world. The same post earns very different amounts depending on who reads it, which is why logged-out traffic from search engines, international growth and ad suitability ([Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#why-the-same-post-earns-different-amounts)) matter as much as the content itself.
- **Marketplaces are fee businesses with a float.** The take rate is the product: Airbnb's single host-only fee of about 15.5% for most hosts (moving from a split of roughly 3% host and 14.1% to 16.5% guest), Outdoorsy's 20% to 25% host fee with a 10% guest fee, Vinted's mandatory buyer protection fee charged to the buyer. Each choice changes the all-in price the guest sees, which the FTC's fees rule now polices for short-term lodging ([Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#all-in-prices)), and who is merchant of record, which the [Payments for Software Platforms](/books/payments/software-platforms#where-the-money-goes) chapter covers.
- **Creator money is pass-through money.** A share of ad revenue, a subscription split or a tip leaves the platform as a payout to someone who must be verified, taxed and sometimes held. The platform's revenue is its share; the rest is a liability until paid, posted to the ledger like any other money held for others ([Payouts & Settlement](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)).

My rule: every one of these flows is modeled as who pays, who earns, who keeps what and under which program terms, as versioned data the platform can disclose, change and audit, never as a constant in code. Revenue shares change (YouTube's Shorts threshold, the platforms' subscription tiers), fee models migrate (Airbnb's move to host-only fees), and the old terms still govern the money already earned under them.

## How Big It Is

Audited filings and transparency reports give the scale; marketing figures are left out:

| Measure | Figure | Source |
| --- | --- | --- |
| Reddit daily and weekly uniques | 121.4 million DAUq and 471.6 million WAUq (fourth quarter 2025); over 100,000 active communities | Reddit 10-K |
| Pinterest monthly users | 619 million MAU (December 31, 2025) | Pinterest 10-K |
| YouTube advertising | $40.4 billion (2025) | Alphabet 10-K |
| Twitch audience | Over 2.5 million average concurrent viewers, over 1.3 trillion minutes watched a year, 7 million monthly streamers (2023) | Twitch engineering |
| Bluesky | 25.94 million to 41.41 million users during 2025; 1.41 billion posts | Bluesky transparency report |
| Airbnb | $91.3 billion gross booking value and 533 million nights and seats booked (2025) | Airbnb 10-K |
| eBay | $79.6 billion GMV, 135 million active buyers, 2.5 billion live listings (2025) | eBay 10-K |
| Etsy marketplace | $10.46 billion GMS, 86.5 million active buyers, 5.6 million active sellers (2025) | Etsy 10-K |
| Turo | $2.41 billion gross booking value and $879.7 million revenue (2023); about 150,000 active hosts and 350,000 active listings (September 2024) | Turo S-1/A |
| Moderation volume | 154 million posts and comments removed on Reddit in six months (second half of 2025) | Reddit transparency report |
| Child safety reports | 21.3 million CyberTipline reports in 2025, 21.18 million of them from electronic service providers | NCMEC |

Two shapes matter for the platform. **Usage is long-tailed and global:** most of Reddit's users visit from outside the US, most posts are in English, and revenue per user differs by more than thirty times between regions, so the data model has to carry country and language on accounts and content from day one. **Abuse scales with usage:** the moderation and reporting rows grow as fast as the content rows, and a platform that budgets storage for posts but not for evidence, cases and reports runs out of room (and legal standing) first.

## The Life of a Post

**Upload.** A user picks an image and writes a title. The client asks for a signed upload URL and sends the bytes straight to object storage, never through the application server; the platform creates a media asset in an `uploading` state ([The Upload Path](/books/user-generated-platforms/upload-path#direct-to-storage-uploads)).

**Scan before publish.** The asset is hashed: an exact hash for deduplication and a perceptual hash compared against known child sexual abuse material and known terrorist content lists, the detection bands the [Trust & Safety](/docs/security/trust-and-safety#automated-detection-human-review) doc describes. A match never publishes: it opens a case, preserves the evidence and, for child sexual abuse material, starts a CyberTipline report the provider must make on actual knowledge ([Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#the-reporting-duty)). Everything else is classified for nudity and graphic content and gets a content rating.

**Process.** Variants are generated, metadata such as GPS coordinates is stripped while provenance fields survive, and an animated GIF becomes a video ([Images at Scale](/books/user-generated-platforms/images-at-scale)). The asset moves to `ready`.

**Publish.** The post is a content item in a community, with a first revision holding its title and body. It becomes a ranking candidate: its community's hot list, followers' feeds, search, and, if it does well, the recommendation system's candidate pool for people who never joined the community ([Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#the-recommendation-pipeline)).

**Vote, comment and spread.** Votes adjust its score; comments build a thread below it; embeds and shares carry it off the platform, where every view costs egress ([Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#cdn-egress-and-the-delivery-bill)).

**Report and decide.** Someone reports it. The report snapshots the revision as reported and joins a case. The community's moderators may remove it under their rules; the platform's staff may remove it under sitewide rules or a legal notice (a DMCA notice, a TAKE IT DOWN Act request with its 48-hour clock, a DSA notice). The decision records who decided, under which policy version, and with what automation; the author gets a notice and an appeal path ([Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons)).

**Age out or purge.** The post lives for years, or until a policy change removes it: Imgur's terms changed on April 19, 2023 to delete old content not tied to an account and sexually explicit content, effective May 15, 2023 ([Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#policy-driven-purges)). Deleting a post doesn't delete the case about it, the report counts in the transparency report, or the evidence a preservation request holds.

## The Life of a Live Stream

**Go live.** A creator's encoder connects to an ingest endpoint with a stream key. The ingest edge terminates the protocol (RTMP, SRT or WebRTC through WHIP) and routes the stream to an origin with transcoding capacity ([Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding#ingest-routing)).

**Transcode and deliver.** The origin builds a ladder of renditions, often copying the top one unchanged to save compute; Twitch's published transcoder uses a two-second keyframe interval equal to the HLS segment length so viewers can switch renditions cleanly. Viewers pull segments through a CDN at a latency tier the platform chose, trading features for seconds ([Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods#latency-tiers)). Every viewer-hour has a price: Amazon IVS lists $0.144 per Full HD viewer-hour for its first North American tier as of October 2026, which is why platforms cap source quality where bandwidth is dear.

**Interact.** Chat fans messages out to every viewer, rate-limited and filtered before delivery; viewers subscribe, gift, tip and cheer, each a payment that becomes creator earnings; moderators time out and ban in real time ([Live Chat & the Interactive Layer](/books/user-generated-platforms/live-chat-and-interactivity#chat-fanout)).

**Moderate live.** A stream can't be reviewed before it airs. Detection runs on sampled frames and audio, reports go to a queue with a short response target, and a livestreamed attack triggers an industry incident protocol with hashes shared across platforms ([Terrorism, Violent Extremism & Graphic Content](/books/user-generated-platforms/violent-extremism-and-graphic-content#livestreams)).

**End and keep.** The stream ends, a recording becomes a VOD with its own retention period, and clips cut from it become content items of their own. Copyrighted music detected in the recording can mute or remove parts of it ([Copyright at Scale](/books/user-generated-platforms/copyright#music-in-streams)).

## The Life of a Booking

**Supply.** A host signs up with the same account they travel with, verifies identity, links a bank account and gives tax information, and lists an RV with photos, a calendar and prices. The vehicle has to meet the platform's eligibility rules (value, age, inspection) before the listing publishes ([Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding#asset-eligibility)).

**Search and book.** A guest searches by place and dates; only listings free for those dates rank. The guest sends a request the host must answer within a window, or books instantly where the host allows it. The guest verifies identity, the platform scores the reservation for fraud and damage risk, and the guest pays an all-in price ([Availability & Booking](/books/user-generated-platforms/availability-and-booking#request-to-book-and-instant-book); [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud#reservation-risk-scoring); [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#all-in-prices)).

**Hold the money.** The platform holds the guest's payment for the host, as Airbnb holds it "until check-in," and may place a security deposit hold on the guest's card shortly before the trip ([Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection#security-deposit-holds); [Reservations & Holds](/docs/architecture/reservations-and-holds)).

**Hand off.** At pickup both sides record the vehicle's condition with timestamped, geotagged photos and a signed agreement; the payout to the host is released on a trigger: Airbnb pays generally the business day after check-in, Outdoorsy 48 hours after trip start ([Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims#the-handoff); [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#payout-triggers)).

**Return and claim.** At return the photos are repeated; damage becomes a claim inside a short window, settled against the deposit, the guest's protection plan, the host's plan or an insurer ([Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims#claims)).

**Review.** Both sides review within a window, and neither sees the other's review until both submit or the window closes ([Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews#reviews)).

**Dispute, cancel and report.** Either side may cancel under a policy that set the refund schedule at booking time, or dispute under a guarantee program; a chargeback can arrive months later ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks#on-a-platform-who-pays)). At year end the host may get a Form 1099-K ([Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#information-returns-1099-k-1099-misc-and-1042-s)).

## The Core Data Model

Every platform in this market converges on the same concepts under different names: Reddit's subreddits, Discord's servers (guilds in its API) and Twitch's channels are all communities; a pin, a post, a gallery and a listing are all things a user published that others can see and report. This volume uses one set of names, and every later chapter's "How to Build It" extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **account** | `accounts` | One login: a person or a business, whatever roles it plays |
| **profile** | `profiles` | A public face of an account: a member, a creator, a host, a seller, a brand |
| **community** | `communities` | A space with members, rules and moderators: a forum, a server, a channel, a group |
| **membership** | `memberships` | An account's membership in a community, over time |
| **role** | `roles`, `membership_roles` | A named set of community permissions with a rank, and who holds it |
| **content item** | `content_items` | Anything published that others can see, reply to or report: a post, a comment, a media post, a stream, a listing |
| **content revision** | `content_revisions` | Each version of an item's text as published; what reports and evidence point to |
| **media asset** | `media_assets`, `content_media` | An uploaded file and its processing state, attached to content items |
| **stream** | `streams` | A live broadcast's state and recording, beside its content item |
| **listing** | `listings` | Inventory: the bookable or purchasable side of a listing content item |
| **booking** | `bookings` | A guest's reservation of a listing for a period, or a buyer's purchase |
| **moderation case** | `moderation_cases`, `reports`, `moderation_decisions`, `penalties` | The [Trust & Safety](/docs/security/trust-and-safety) doc's tables, scoped to communities |
| **payee and money** | `merchants`, `payments`, ledger tables | The [Payments](/books/payments/card-payments#the-core-data-model) volume's tables, linked to accounts and bookings |

The split that matters most is **content item versus media asset versus listing.** The content item is the published thing with an author, a place, a visibility and a moderation state; it's what gets reported, ranked, replied to and removed. The media asset is the file, with its own pipeline, hashes, storage cost and retention; one image can sit in several posts, and a removed post's file may need to stay (as evidence) or go (as a purge) on a different schedule from the post. The listing is the inventory a content item describes: whether it's visible is the content item's state, whether it can be booked is the listing's. Designs that put the file on the post can't deduplicate, can't keep evidence after deletion, and can't sweep every copy of a removed image; designs that make listings a separate world from posts end up with two report flows, two moderation queues and two search indexes for the same problem.

Four more distinctions recur in every chapter. **There's no tenant above the platform.** These are consumer platforms run by one operator, so the core has no `tenant_id`; the community is the unit of scope for membership, rules, moderation and much of the load, and [Platform Architecture](/books/user-generated-platforms/platform-architecture#the-community-is-the-partition-key) treats communities as the partitioning key. A platform sold to other businesses (white-label community software, a marketplace product per brand) adds a tenant above communities exactly as [Multi-Tenancy](/docs/architecture/multi-tenancy#tenant-hierarchies) describes. **A ban is a penalty, not a status.** The account's status says whether it can sign in at all (active, locked during a takeover, closed); suspensions, feature restrictions and community bans are rows in `penalties` with a validity range, so issuing, expiring or overturning one never rewrites the account ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)). **Revisions are facts.** An edit adds a revision; the item points at its current one; reports and decisions point at the revision they judged. **Money is the Payments model.** Bookings, subscriptions, tips and earnings post balanced ledger transactions in minor units, and payees are merchants in the [Payments for Software Platforms](/books/payments/software-platforms#the-hierarchy) sense, sub-merchants under the platform.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer minor units ([Money & Amounts](/docs/payments/money)); columns each chapter owns (handles' history, permission bits, hashes' list matches, calendars, fee lines) are added there:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE accounts (                  -- one login, whatever roles it plays
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  handle       TEXT NOT NULL,            -- as displayed
  handle_key   TEXT NOT NULL UNIQUE,     -- normalized: case-folded, confusables mapped
  status       TEXT NOT NULL CHECK (status IN ('active', 'locked', 'deactivated', 'closed')),
  home_country CHAR(2),                  -- ISO 3166-1 alpha-2, from sign-up; refined later
  locale       TEXT,                     -- BCP 47, e.g. 'pt-BR'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at    TIMESTAMPTZ,
  CHECK ((status = 'closed') = (closed_at IS NOT NULL))
);

CREATE TABLE media_assets (              -- a file and its pipeline state
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_account_id UUID REFERENCES accounts (id),  -- null: an anonymous upload
  kind             TEXT NOT NULL CHECK (kind IN ('image', 'animation', 'video', 'audio',
                     'file')),
  state            TEXT NOT NULL CHECK (state IN ('uploading', 'scanning', 'processing',
                     'ready', 'quarantined', 'removed', 'purged')),
  storage_key      TEXT,                 -- the original in object storage; null once purged
  byte_size        BIGINT,
  sha256           BYTEA,                -- exact match and dedup
  perceptual_hash  BYTEA,                -- near match (PDQ for images); video keeps its own
  width            INT,
  height           INT,
  duration_ms      INT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (                  -- a public face of an account
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  kind            TEXT NOT NULL CHECK (kind IN ('member', 'creator', 'host', 'seller',
                    'brand')),
  display_name    TEXT NOT NULL,
  bio             TEXT,
  avatar_asset_id UUID REFERENCES media_assets (id),
  visibility      TEXT NOT NULL CHECK (visibility IN ('public', 'members', 'private')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, kind)
);

CREATE TABLE communities (               -- the unit of membership, rules and moderation
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  kind             TEXT NOT NULL CHECK (kind IN ('forum', 'server', 'channel', 'group')),
  slug             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  owner_account_id UUID NOT NULL REFERENCES accounts (id),
  visibility       TEXT NOT NULL CHECK (visibility IN ('public', 'restricted', 'private')),
  content_rating   TEXT NOT NULL DEFAULT 'general' CHECK (content_rating IN ('general',
                     'mature', 'adult')),
  status           TEXT NOT NULL CHECK (status IN ('active', 'restricted', 'banned',
                     'archived')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE memberships (               -- join, leave, rejoin: each a range
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  community_id UUID NOT NULL REFERENCES communities (id),
  account_id   UUID NOT NULL REFERENCES accounts (id),
  state        TEXT NOT NULL CHECK (state IN ('pending', 'active', 'ended')),
  valid_during TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (community_id WITH =, account_id WITH =, valid_during WITH &&)
);

CREATE TABLE roles (                     -- community roles; platform staff use grants
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  community_id UUID NOT NULL REFERENCES communities (id),
  name         TEXT NOT NULL,
  position     INT NOT NULL,             -- rank: who may act on whom, not what they may do
  permissions  BIGINT NOT NULL DEFAULT 0, -- bit flags; Communities, Roles & Permissions
  is_default   BOOLEAN NOT NULL DEFAULT FALSE,  -- the role every member has
  UNIQUE (community_id, name)
);

CREATE TABLE membership_roles (
  membership_id UUID NOT NULL REFERENCES memberships (id),
  role_id       UUID NOT NULL REFERENCES roles (id),
  granted_by    UUID REFERENCES accounts (id),
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (membership_id, role_id)
);

CREATE TABLE content_items (             -- published things others can see, reply to, report
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('post', 'comment', 'media_post',
                        'stream', 'listing')),
  author_account_id   UUID NOT NULL REFERENCES accounts (id),
  profile_id          UUID REFERENCES profiles (id),    -- the face it was published under
  community_id        UUID REFERENCES communities (id), -- null: on a profile, or a listing
  parent_id           UUID REFERENCES content_items (id),  -- what it replies to
  root_id             UUID REFERENCES content_items (id),  -- the top of its thread
  state               TEXT NOT NULL CHECK (state IN ('draft', 'pending_review', 'published',
                        'hidden', 'removed', 'deleted')),
  visibility          TEXT NOT NULL CHECK (visibility IN ('public', 'unlisted', 'members',
                        'followers', 'private')),
  content_rating      TEXT NOT NULL DEFAULT 'general' CHECK (content_rating IN ('general',
                        'mature', 'adult')),
  language            TEXT,              -- BCP 47, detected or declared
  current_revision_id UUID,              -- content_revisions; set after the first insert
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at        TIMESTAMPTZ,
  CHECK (kind <> 'comment' OR parent_id IS NOT NULL)
);

CREATE TABLE content_revisions (         -- every version as published; never edited
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  content_item_id UUID NOT NULL REFERENCES content_items (id),
  revision        INT NOT NULL,
  title           TEXT,
  body            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (content_item_id, revision)
);

CREATE TABLE content_media (             -- one file, many posts; one post, many files
  content_item_id UUID NOT NULL REFERENCES content_items (id),
  position        SMALLINT NOT NULL,
  media_asset_id  UUID NOT NULL REFERENCES media_assets (id),
  PRIMARY KEY (content_item_id, position)
);

CREATE TABLE streams (                   -- live state beside the stream's content item
  content_item_id    UUID PRIMARY KEY REFERENCES content_items (id),
  channel_id         UUID NOT NULL REFERENCES communities (id),  -- kind = 'channel'
  state              TEXT NOT NULL CHECK (state IN ('scheduled', 'live', 'ended',
                       'interrupted')),
  started_at         TIMESTAMPTZ,
  ended_at           TIMESTAMPTZ,
  recording_asset_id UUID REFERENCES media_assets (id)  -- the VOD, while it's kept
);

CREATE TABLE listings (                  -- the inventory side of a listing content item
  content_item_id UUID PRIMARY KEY REFERENCES content_items (id),
  category        TEXT NOT NULL CHECK (category IN ('stay', 'vehicle', 'rv', 'goods',
                    'service', 'experience')),
  status          TEXT NOT NULL CHECK (status IN ('active', 'snoozed', 'sold_out',
                    'retired')),         -- bookable or not; visibility is the item's state
  country         CHAR(2) NOT NULL,
  subdivision     TEXT,                  -- ISO 3166-2; taxes and rules resolve from here
  time_zone       TEXT,                  -- IANA; null for shipped goods
  currency        CHAR(3) NOT NULL,
  base_price      BIGINT NOT NULL CHECK (base_price >= 0),  -- per night, day or unit
  quantity        INT CHECK (quantity >= 0)                 -- goods; null for one asset
);

CREATE TABLE bookings (                  -- a reservation for a period, or a purchase
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id       UUID NOT NULL REFERENCES listings (content_item_id),
  guest_account_id UUID NOT NULL REFERENCES accounts (id),
  host_account_id  UUID NOT NULL REFERENCES accounts (id),  -- as of booking
  kind             TEXT NOT NULL CHECK (kind IN ('reservation', 'purchase')),
  status           TEXT NOT NULL CHECK (status IN ('requested', 'pending_payment',
                     'confirmed', 'in_progress', 'completed', 'cancelled', 'declined',
                     'expired')),
  service_period   TSTZRANGE,            -- null for a purchase
  quantity         INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  currency         CHAR(3) NOT NULL,
  total_amount     BIGINT NOT NULL,      -- the all-in price; lines in Pricing, Fees
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'reservation') = (service_period IS NOT NULL)),
  CHECK (guest_account_id <> host_account_id),
  EXCLUDE USING GIST (listing_id WITH =, service_period WITH &&)
    WHERE (status IN ('confirmed', 'in_progress'))  -- one confirmed stay at a time
);

-- Moderation: the Trust & Safety doc's moderation_cases, reports, moderation_decisions and
-- penalties, with account references pointing at accounts and no tenant_id. This volume
-- widens the subjects, scopes cases and penalties to communities, and pins evidence to
-- the revision that was judged.
ALTER TABLE moderation_cases
  DROP CONSTRAINT moderation_cases_subject_type_check,
  ADD CONSTRAINT moderation_cases_subject_type_check CHECK (subject_type IN ('account',
    'profile', 'community', 'content_item', 'media_asset', 'message')),
  ADD COLUMN community_id        UUID REFERENCES communities (id),
  ADD COLUMN scope               TEXT NOT NULL DEFAULT 'platform'
                                   CHECK (scope IN ('platform', 'community')),
  ADD COLUMN content_revision_id UUID REFERENCES content_revisions (id),
  ADD CONSTRAINT moderation_cases_community_scope
    CHECK (scope = 'platform' OR community_id IS NOT NULL);

ALTER TABLE penalties
  ADD COLUMN community_id UUID REFERENCES communities (id);  -- null: sitewide

-- Money: the Payments volume's tables. A payee is a sub-merchant under the platform,
-- tied back to the account that earns; a booking's money is a payment against it.
ALTER TABLE merchants
  ADD COLUMN account_id UUID REFERENCES accounts (id);

ALTER TABLE payments
  ADD COLUMN booking_id UUID REFERENCES bookings (id);
```

Content states and booking states are this volume's vocabulary, not one platform's; [Posts, Comments & Voting](/books/user-generated-platforms/posts-comments-and-voting#states-removal-and-deletion) and [Availability & Booking](/books/user-generated-platforms/availability-and-booking#the-booking-state-machine) define the transitions and map them to the platforms' names. A post's score, a listing's calendar and a community's member count are never columns here: each is derived from the votes, calendar entries and memberships that the owning chapter adds, so it can't drift from the facts that define it.

Design decisions behind it:

- **The community is the scope.** Rules, roles, moderators, content ratings and much of the traffic attach to a community, so `community_id` goes on every row whose rules or moderators can differ, and a case or penalty says whether a community or the platform decided it. Sitewide rules sit above every community's; a community can be stricter than the platform, never looser ([Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#two-tiers-of-rules)).
- **One account, several profiles.** A person who streams, hosts and buys has one account (one login, one standing, one set of identity checks) and a profile per public role. Payout and tax data hang off the payee record, not the profile, because the law taxes the earner, not the persona ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#one-login-many-roles)).
- **Files are assets, not columns.** `media_assets` carries the hashes that dedup, child-safety matching and identical-copy sweeps need, and its own states, so an asset can be quarantined while its post is under review, kept as evidence after the post is deleted, or purged on a storage policy. An asset with no owner is an anonymous upload, the first candidate for a retention purge ([Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#orphans-purges-and-link-rot)).
- **Streams and listings are content items with a side table.** A stream has a title, a channel, viewers who report it and a moderation state like any post, plus live state; a listing has photos, text and reports like any post, plus price, place and bookability. One reports pipeline, one moderation queue, one search index; the side tables carry what's different.
- **Bookings can't overlap.** The exclusion constraint makes double booking of one listing impossible at the database, the same guarantee [Reservations & Holds](/docs/architecture/reservations-and-holds) describes; calendar blocks from other channels and holds during checkout are [Availability & Booking](/books/user-generated-platforms/availability-and-booking#external-calendars)'s additions. Goods purchases have no period, so the constraint skips them; stock is the listing's `quantity`.
- **Moderation is the playbook's model.** The case, report, decision and penalty tables come from [Trust & Safety](/docs/security/trust-and-safety), and every chapter in Trust and Safety and The Rules extends them (legal notice types, preservation holds, CyberTipline submissions, statements of reasons) rather than building a parallel system per harm.
- **Money is the Payments model.** A booking's payment, a subscription renewal and a tip are rows in `payments`; a creator's or host's balance is a set of ledger accounts; payouts are the Payments volume's payouts with their holds and reserves ([Payouts & Settlement](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)). The platform's revenue is a ledger account, not a column.
- **Keep the jurisdiction on the row.** `accounts.home_country` and `listings.country` and `subdivision` are where tax, minors' rules, all-in pricing rules and regulator duties resolve from ([Rules as Data](/docs/architecture/rules-as-data)). A post's jurisdiction is the viewer's as much as the author's, which is why geoblocking works on the request and not on the row ([Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#geoblocking-withholding-and-withdrawal)).
- **Emit life-cycle events.** `media.ready`, `content.published`, `content.removed`, `stream.started`, `stream.ended`, `booking.confirmed`, `booking.completed`, `penalty.applied` and `account.closed` are what feeds, search, notifications, payouts, transparency counts and integrations subscribe to ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)).

Each later chapter extends a defined part of this spine:

| Table | Extended by |
| --- | --- |
| `accounts`, `profiles` | [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#how-to-build-it) (`account_handles`, `handle_verifications`, `verifications`, `badges`, `deletion_requests`, `legal_holds`); [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding#how-to-build-it) (verification kinds, `trader_profiles`, `trader_certifications`, `onboarding_disclosures`); [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#how-to-build-it) (`accounts.age_band`, `age_checks`, `feature_age_rules`, `guardian_links`, `age_restrictions`); [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#how-to-build-it) (`follows`, `friendships`, `blocks`); [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#how-to-build-it) (automation columns, `account_links`, `challenges`, `inauthentic_clusters`, `cluster_members`); [Federation & Open Protocols](/books/user-generated-platforms/federation#how-to-build-it) (`instances`, `remote_actors`); [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#how-to-build-it) (`legal_requests`, `legal_request_subjects`, `legal_request_productions`); [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#how-to-build-it) (`data_exports`) |
| `communities`, `memberships`, `roles`, `membership_roles` | [Communities, Roles & Permissions](/books/user-generated-platforms/communities-and-permissions#how-to-build-it) (join policy and gates, `channels`, `permission_overwrites`, `community_invites`, `community_ownership_transfers`); [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#how-to-build-it) (`community_rules`, `removal_reasons`, `automod_rules`, `automod_matches`, `moderator_actions`, `moderation_limits`); [Real-Time Chat](/books/user-generated-platforms/real-time-chat#how-to-build-it) (threads and DMs as `channels`, `channel_recipients`, `messages`, `message_revisions`, `message_media`, `read_states`, `message_requests`); [Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms#how-to-build-it) (`media_servers`, `room_sessions`, `room_participants`, `room_recordings`, `recording_consents`); [Live Chat & the Interactive Layer](/books/user-generated-platforms/live-chat-and-interactivity#how-to-build-it) (`chat_settings`, `chat_holds`, `raids`, channel point, poll, prediction and drop tables, `extension_installs`); [Federation & Open Protocols](/books/user-generated-platforms/federation#how-to-build-it) (community kind and instance, `domain_blocks`, `federation_deliveries`); [Platform Architecture](/books/user-generated-platforms/platform-architecture#how-to-build-it) (`community_placements`) |
| `content_items`, `content_revisions` | [Posts, Comments & Voting](/books/user-generated-platforms/posts-comments-and-voting#how-to-build-it) (format, threading, locks and pins, `votes`, `content_scores`, `content_labels`, `poll_options`, `poll_votes`); [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#how-to-build-it) (`feed_definitions`, `feed_impressions`); [Search & Discovery](/books/user-generated-platforms/search-and-discovery#how-to-build-it) (`content_translations`, `search_queries`, `media_embeddings`, `ai_answers`, `ai_answer_citations`); [Federation & Open Protocols](/books/user-generated-platforms/federation#how-to-build-it) (`labelers`, `label_subscriptions`); [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#how-to-build-it) (`context_notes`, `note_ratings`); [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#how-to-build-it) (`content_ad_eligibility`, `community_ad_settings`, `data_licenses`, `data_license_opt_outs`); [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#how-to-build-it) (`apps`, `app_credentials`, `app_installations`, `app_privileged_access`, `api_plans`, `api_usage`, `license_deliveries`); [Terrorism, Violent Extremism & Graphic Content](/books/user-generated-platforms/violent-extremism-and-graphic-content#how-to-build-it) (warning screens and age restriction, `crisis_incidents`, `newsworthy_allowances`); [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#how-to-build-it) (AI labels); [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#how-to-build-it) (`purge_policies`, `purge_runs`, `content_tombstones`) |
| `media_assets`, `content_media` | [The Upload Path](/books/user-generated-platforms/upload-path#how-to-build-it) (pipeline columns, `upload_sessions`, `media_scans`); [Images at Scale](/books/user-generated-platforms/images-at-scale#how-to-build-it) (alt text, `media_variants`, `media_provenance`); [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#how-to-build-it) (`media_blobs`, `media_near_matches`, `media_retention_rules`, `media_purges`, `cdn_purges`, `delivery_restrictions`); [Video on Demand](/books/user-generated-platforms/video-on-demand#how-to-build-it) (`encoding_ladders`, `transcode_jobs`, `media_tracks`, `playback_policies`, `playback_usage`); [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#how-to-build-it) (`hash_lists`, `hash_list_entries`, `hash_matches`, which Terrorism, Violent Extremism & Graphic Content and Intimate Image Abuse also use); [Intimate Image Abuse](/books/user-generated-platforms/intimate-image-abuse#how-to-build-it) (`copy_sweeps`); [Copyright at Scale](/books/user-generated-platforms/copyright#how-to-build-it) (`rights_references`, `content_claims`); [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#how-to-build-it) (soft bindings on provenance) |
| `streams` | [Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding#how-to-build-it) (ingest and latency settings, `stream_keys`, `ingest_sessions`, `ingest_tracks`, `simulcast_targets`); [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods#how-to-build-it) (`vod_retention_rules`, `stream_recordings`, `clips`, `stream_cues`) |
| `listings` | [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding#how-to-build-it) (`assets`, `asset_inspections`, `asset_recall_checks`, `listing_eligibility_checks`); [Listings, Search & Ranking](/books/user-generated-platforms/listings-search-and-ranking#how-to-build-it) (expiry, `listing_attributes`, `attribute_definitions`, `listing_product_info`, `listing_status_changes`, `listing_quality_scores`, `search_impressions`, `demand_reroutes`); [Availability & Booking](/books/user-generated-platforms/availability-and-booking#how-to-build-it) (`availability_settings`, `external_calendars`, `occupancy`); [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#how-to-build-it) (`rate_overrides`, `pricing_rules`, `price_recommendations`, `listing_add_ons`); [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#how-to-build-it) (`listing_promotions`, `promotion_charges`); [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud#how-to-build-it) (`listing_investigations`) |
| `bookings` | [Availability & Booking](/books/user-generated-platforms/availability-and-booking#how-to-build-it) (request and hold expiries, `booking_participants`, `booking_changes`); [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#how-to-build-it) (`fee_programs`, `promotions`, `booking_lines`, `payment_schedules`, `price_displays`); [Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection#how-to-build-it) (`protection_plans`, `host_plan_enrollments`, `booking_protections`, `deposit_holds`, `deposit_authorizations`, `post_trip_charges`, `producer_licenses`); [Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims#how-to-build-it) (claim window, `handoffs`, `handoff_photos`, `damage_claims`, `claim_items`, `claim_settlements`, `claim_recoveries`); [Messaging, Reviews & Reputation](/books/user-generated-platforms/messaging-and-reviews#how-to-build-it) (`marketplace_threads`, `marketplace_messages`, `message_attachments`, `message_detections`, `reviews`, `review_responses`, `review_removals`, `status_programs`, `host_status_periods`); [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes#how-to-build-it) (`cancellation_policies`, `disruption_events`, `cancellations`, `protection_cases`, `arbitration_demands`); [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud#how-to-build-it) (booking risk decisions, `booking_restrictions`, `booking_risk_outcomes`, `off_platform_payment_reports`, `sanctions_screenings`) |
| `moderation_cases`, `reports`, `moderation_decisions`, `penalties` | [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#account-standing) (penalties by role); [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#how-to-build-it) (decisions under community rules); [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#how-to-build-it) (`legal_notices`, `legal_notice_items`); [Moderation at Scale](/books/user-generated-platforms/moderation-at-scale#how-to-build-it) (`classifier_bands`, `classifier_results`, `reviewers`, `review_assignments`, `review_reveals`, `prevalence_samples`); [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#how-to-build-it) (`cybertipline_reports`, `cybertipline_report_items`, `evidence_access_log`, preservation holds); [Copyright at Scale](/books/user-generated-platforms/copyright#how-to-build-it) (`dmca_agent_designations`, `copyright_notice_details`); [Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks#how-to-build-it) (reports from non-users, `hosted_resources`, `abuse_mitigations`); [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#how-to-build-it) (DSA fields on reports and decisions, `regime_duties`, `service_designations`, `regulator_requests`, `trusted_flaggers`, `out_of_court_disputes`, `geo_restrictions`); [Transparency Reporting](/books/user-generated-platforms/transparency-reporting#how-to-build-it) (`transparency_reports`, `transparency_report_values`) |
| `merchants`, `payments`, ledger | [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#how-to-build-it) (`revenue_programs`, `revenue_program_terms`, `products`, `product_prices`, app-store transactions); [Creator Monetization](/books/user-generated-platforms/creator-monetization#how-to-build-it) (`subscriptions`, `subscription_periods`, `subscription_gifts`, `currency_accounts`, `currency_ledger_entries`, `fan_payments`, `earnings`); [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#how-to-build-it) (payout columns on merchants, hold kinds, `program_enrollments`, `tax_profiles`, `tax_withholdings`, `tax_reports`, `payout_release_rules`); [Pricing, Fees & All-In Prices](/books/user-generated-platforms/pricing-and-fees#how-to-build-it) (fee and tax lines); [Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection#how-to-build-it) (deposit holds and charges); [Cancellations, Guarantees & Disputes](/books/user-generated-platforms/cancellations-and-disputes#how-to-build-it) (refunds) |
| Platform-wide | [Platform Architecture](/books/user-generated-platforms/platform-architecture#how-to-build-it) (partitioning by community); [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#how-to-build-it) (classifier band evidence); [Operating Metrics](/books/user-generated-platforms/operating-metrics#how-to-build-it) (`metric_definitions`, `activity_days`, `metric_values`); [Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#how-to-build-it) (`service_sunsets`) |

What goes wrong most often is building for one kind of platform and bolting on the rest: a forum whose posts can't carry a price, an image host whose files live on the post row, a marketplace whose listings can't be reported through the same pipeline as comments. My rule: decide the shape of content, media, inventory and cases together, even if you launch with one.

## Auditing

The records in this chapter are the ones users, creators, regulators and courts ask about later:

- **What was published, as it was.** Every revision of every item, with the asset hashes, so a report, a takedown notice or a court can see the version that was judged, after edits and deletions.
- **Every moderation decision.** Who decided (a volunteer, staff, a model and its threshold), under which policy version and which legal basis, with the notice sent and the appeal outcome ([Auditing Moderation Decisions](/docs/security/trust-and-safety#auditing-moderation-decisions)). Regulators count these; transparency reports are queries over them.
- **Roles and permissions over time.** Who moderated which community when, and who granted the role, because a removal or a ban is only as legitimate as the role behind it.
- **Every money movement.** Bookings, payments, earnings, fees, holds and payouts are append-only ledger entries tied to the event that caused them, so a host's statement, a creator's earnings and a 1099-K can be rebuilt.
- **Holds on deletion.** Which records were kept past a deletion request, under which legal hold or retention rule, and when they were finally purged ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records)).

The mechanics (typed actors, append-only history, snapshots) are in [Audit Trails](/docs/architecture/audit-trails); which records each regulator asks for, and on what clock, is in [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#regulator-requests-and-their-clocks) and [Transparency Reporting](/books/user-generated-platforms/transparency-reporting#making-the-report-a-query).

## What This Means for the System You Build

- **Model one account with several roles,** and keep each role's public face, payout record and penalties distinct.
- **Make the community the scope** for rules, roles, moderation and partitioning; add a tenant above it only if you sell the platform to other businesses.
- **Separate content items, revisions, media assets and listings,** so files can be deduplicated, kept as evidence and purged on their own schedules.
- **Run streams and listings through the same content and moderation pipeline** as posts, with side tables for what's different.
- **Make overlapping bookings impossible in the database,** not just in the booking service.
- **Use the playbook's moderation tables** and extend them per harm and per law, never a parallel system per team.
- **Use the Payments ledger** for every money flow, including creator earnings and float, with payees as sub-merchants under the platform.
- **Model every revenue strategy as data:** who pays, who earns, who keeps what, under which program terms and version.
- **Carry country, subdivision and language** on accounts, content and listings from day one.
- **Emit life-cycle events** for media, content, streams, bookings and penalties, and let feeds, payouts and reporting consume them.

## References

**Filings**

- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), DAUq and WAUq, active communities, total and advertising revenue, other revenue from content licensing and direct-to-user products, licensing concentration and API requirements, virtual goods, moderator risk factors, the March 2024 IPO
- [Pinterest: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1506293/000150629326000021/pins-20251231.htm), 619 million MAU, 2025 revenue, ARPU by region, ad formats including Shopping and Collection ads
- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), YouTube ads revenue for 2024 and 2025, YouTube subscriptions within subscriptions, platforms and devices
- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), revenue, gross booking value, nights and seats booked, funds held on behalf of customers, interest income, guest funds held until check-in
- [Etsy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1370637/000137063726000019/etsy-20251231.htm), GMS, active buyers and sellers, marketplace and services revenue, take rate, services revenue including on-site ads and shipping labels
- [eBay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm), GMV, active buyers, live listings, marketplace and advertising revenue, take rate, Promoted Listings
- [Turo: Form S-1/A, Amendment No. 12](https://www.sec.gov/Archives/edgar/data/1514587/000162828024047889/turoinc-sx1a12.htm), gross booking value, revenue, active hosts, listings and guests

**Platform terms**

- [YouTube: YouTube Partner Program revenue shares](https://support.google.com/youtube/answer/72902?hl=en), 55% watch-page ads, 45% Shorts, 70% fan funding
- [Tubefilter: Discord's first creator monetization feature is live for all U.S. servers](https://www.tubefilter.com/2022/12/01/discord-creator-monetization-server-memberships-open-to-us-servers/), the 90/10 split and $2.99 to $199.99 tiers (December 2022)
- [Etsy: Fees & Payments Policy](https://www.etsy.com/legal/fees/), offsite ads fees and cap, Etsy Plus
- [Airbnb: Airbnb service fees](https://www.airbnb.com/help/article/1857), the single host-only fee and the legacy split fee
- [Outdoorsy: Fee structure and how hosts get paid](https://support.outdoorsy.com/hc/en-us/articles/37916164272283-What-is-your-fee-structure-And-how-do-I-get-paid), host fee range, payout 48 hours after trip start
- [Outdoorsy: What fees should I be aware of](https://support.outdoorsy.com/hc/en-us/articles/37981867822747-What-fees-should-I-be-aware-of), the 10% guest service fee
- [Vinted: Buyer Protection fee](https://www.vinted.co.uk/help/342-buyer-protection-fee-on-vinted), the buyer-paid fee model
- [Turo: Earnings plans in detail for US hosts](https://help.turo.com/en_us/earnings-plans-in-detail-us-hosts-ByMOIVxEc.md), the 70%, 80% and 90% plans and their damage responsibility
- [Amazon IVS: Pricing](https://aws.amazon.com/ivs/pricing/), per viewer-hour output prices by resolution

**Reference**

- [Twitch: State of Engineering 2023](https://blog.twitch.com/en/2023/09/28/twitch-state-of-engineering-2023/), concurrent viewers, minutes watched and monthly streamers
- [Twitch: Live video transmuxing and transcoding (2017)](https://blog.twitch.tv/en/2017/10/10/live-video-transmuxing-transcoding-f-fmpeg-vs-twitch-transcoder-part-i-489c1c125f28/), the two-second keyframe interval and transmuxed top rendition
- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), user growth and posts in 2025
- [Reddit: Transparency Report, July to December 2025 (PDF)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), removals by moderators and admins
- [NCMEC: CyberTipline data](https://www.missingkids.org/cybertiplinedata), 2025 report counts by source
- [Wikipedia: Imgur](https://en.wikipedia.org/wiki/Imgur), the April 2023 terms change effective May 15, 2023
