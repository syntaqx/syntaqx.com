+++
title = "The Platform Landscape"
description = "Communities, media hosts, streaming, chat, federated networks and peer-to-peer marketplaces, the vendors behind them, the deals, and what to build."
category = "User-Generated Platforms Industry"
order = 1802
part = "The Business"
tags = ["user-generated-content", "marketplaces", "vendors", "trust-and-safety", "video"]
+++

User-generated platforms look like six industries: forums, image hosts, video and live streaming, chat, federated social networks, and peer-to-peer marketplaces for stays, vehicles and goods. Underneath they share a smaller set of layers, and most of those layers are bought or rented rather than built: video encoding and delivery, image transformation and CDNs, hash matching against child-safety and terrorist content lists, classifiers for nudity and hate, identity verification, payments to millions of small payees, and insurance for a stranger's car. What the platforms build themselves is the part that is the product: the community model, the ranking, the moderation policy and the marketplace rules.

This chapter maps the platform types and how each makes money, the infrastructure and trust and safety vendors behind them, the consolidation and capital events that reshaped the field, and a build, buy or rent framework for each layer. Vendor facts are dated "as of October 2026" because pricing pages, ownership and product names in this market change every year. The core model the later chapters extend is in [The User-Generated Platform Business](/books/user-generated-platforms/platform-business#the-core-data-model).

## The Map

Six shapes of platform, by what users supply and what others consume:

| Shape | Users supply | Others consume | How it mostly earns | Examples |
| --- | --- | --- | --- | --- |
| **Communities** | Posts, comments, votes | Threads, feeds, search results | Advertising, some subscriptions and licensing | Reddit, Tumblr, Pinterest's boards |
| **Media hosts** | Images and video | Galleries, embeds, feeds | Advertising, storage subscriptions | Imgur, Pinterest, YouTube, Vimeo |
| **Live streaming** | Broadcasts | Live video, chat, clips | Advertising, subscriptions, tips, virtual currency | Twitch, YouTube Live, Kick |
| **Chat** | Messages in servers and DMs | Conversations, voice rooms | Consumer subscriptions, community subscriptions | Discord |
| **Federated networks** | Posts on servers that interoperate | Timelines across servers | Donations, hosting services, venture capital | Mastodon and the fediverse, Bluesky on the AT Protocol |
| **Peer-to-peer marketplaces** | Listings of stays, vehicles and goods | Bookings and purchases | Take rate, seller ads, protection plans, float | Airbnb, Outdoorsy, RVshare, Turo, Etsy, eBay, Vinted |

The shapes blur. Pinterest is a media host with a recommendation engine and a shopping business; YouTube is a media host with live streaming and a creator payroll; Discord runs chat, voice, live rooms and paid communities; a marketplace carries messaging, reviews and photos, and moderates them like any community. The core model treats them as one system with different emphasis for exactly that reason.

## Communities

**Reddit** is the reference community platform: over 100,000 active communities run by volunteer moderators who write rules on top of sitewide ones, 121.4 million daily uniques in the fourth quarter of 2025, and revenue that is mostly advertising with a smaller content licensing line. Its 10-K names two features of the business that later chapters treat as design constraints: moderators are volunteers whose cooperation is a disclosed risk, and logged-out visitors arriving from search engines are a large part of the audience and are monetized with ads on conversation pages ([Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#the-platform-s-controls-over-moderators); [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations#logged-out-economics)).

**Tumblr** is the reblog-graph community. Verizon agreed to sell it to Automattic in August 2019. **Pinterest** sits between community and media host: users save images to boards, and its 10-K describes Home Feed, Search, Related Pins and visual search as the surfaces, with 619 million monthly users at the end of 2025.

## Media Hosts

**Imgur** launched in 2009 as a bootstrapped image host and was acquired by MediaLab in a deal announced September 27, 2021. Its April 2023 terms change (no sexually explicit content, and deletion of old content not tied to an account, effective May 15, 2023) and its withdrawal from the UK in September 2025, after the ICO served notice of intent to fine its owner over children's data (the fine followed in February 2026), are the two most cited examples of a host reshaping its archive and its geography for policy and cost reasons ([Migrations, Purges & Shutdowns](/books/user-generated-platforms/migrations-and-shutdowns#policy-driven-purges); [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#the-imgur-case)).

**YouTube** is the scale reference: $40.4 billion of advertising revenue in 2025 per Alphabet's 10-K, a partner program that shares ad revenue with creators, and Content ID for rights holders ([Copyright at Scale](/books/user-generated-platforms/copyright#fingerprinting-and-content-id)). **Vimeo** went private: Bending Spoons completed its $1.38 billion all-cash acquisition on November 24, 2025, and Vimeo's stock was delisted from Nasdaq that day.

## Live Streaming

**Twitch** was bought by Amazon in a deal announced August 25, 2014, for about $970 million in cash, when Amazon described it as "the leading live video platform for gamers." Its public engineering posts describe the reference architecture for live video at scale: ingest points of presence that route streams to origins with transcoding capacity, a transcoder that copies the top rendition and re-encodes the rest, and a replication tree for distribution ([Live Streaming: Ingest & Transcoding](/books/user-generated-platforms/live-ingest-and-transcoding#transcode-or-transmux)). Amazon sells the same lineage as a service: Amazon IVS describes itself as using "the same live streaming technology and global infrastructure that powers Twitch."

**Kick** and **YouTube Live** are the main alternatives, competing largely on creator revenue share ([Creator Monetization](/books/user-generated-platforms/creator-monetization#revenue-splits-compared)). Kick has published no audited figures or engineering detail; claims about its infrastructure and splits come from secondary sources, which is why this volume cites its own help pages only where they could be opened.

## Chat

**Discord** runs servers (guilds in its API) with text, voice, stage and forum channels, role-based permissions and per-channel overwrites, and earns mainly from its Nitro subscription. It is private: Bloomberg reported in January 2026 that Discord had filed confidentially for a US IPO with Goldman Sachs and JPMorgan, and as of October 2026 no public S-1 has appeared, so its revenue and user counts are not audited figures. Its engineering blog is the most detailed public source on chat at scale (message storage, search, member lists, voice), and [Real-Time Chat](/books/user-generated-platforms/real-time-chat#message-storage-at-scale) and [Voice & Live Rooms](/books/user-generated-platforms/voice-and-live-rooms#running-voice-at-community-scale) draw on it.

## Federated Networks

**Mastodon** implements ActivityPub, the W3C Recommendation in which each actor has an inbox and an outbox and servers deliver activities to each other's inboxes. Moderation is always local: each server's admins act on their own users and decide which other servers to limit or suspend, and they can share blocklists as CSV files.

**Bluesky** runs on the AT Protocol, which separates the user's repository host (a PDS), relays that aggregate updates into a firehose, AppViews that index the network, and feed generators and labelers that users choose. Users' identifiers are DIDs and their handles are domain names, so an account can move to a new host without the old one's help. Bluesky grew from 25.94 million to 41.41 million users during 2025 and published Ozone, its labeling and report-queue tool, as open source. [Federation & Open Protocols](/books/user-generated-platforms/federation) covers both, and Threads' opt-in federation.

## Peer-to-Peer Marketplaces

| Platform | Inventory | Public status | Scale (latest audited) |
| --- | --- | --- | --- |
| **Airbnb** | Stays, experiences, services | Public | $91.3 billion gross booking value, 533 million nights and seats (2025) |
| **eBay** | New and used goods, vehicles via Caramel | Public | $79.6 billion GMV, 135 million active buyers (2025) |
| **Etsy** | Handmade, vintage and supplies | Public | $10.46 billion GMS on the Etsy marketplace (2025) |
| **Outdoorsy** | RVs, plus a car rental brand | Private | No public financials |
| **RVshare** | RVs | Private | No public financials |
| **Turo** | Cars | Private; IPO withdrawn | $2.41 billion gross booking value (2023, from its S-1/A) |
| **Vinted** | Second-hand fashion (EU, UK) | Private | GMV of EUR 10.8 billion for 2025 (company-published results, not audited filings) |

Rentals and goods differ in the shape of risk. A rental returns: the platform holds a deposit, insures the asset for the trip, collects evidence at handoff and settles damage claims, so protection products and insurers are central ([Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection#the-protection-stack); [Handoffs, Damage & Claims](/books/user-generated-platforms/damage-and-claims#the-handoff)). Goods leave: the risk is non-delivery, not-as-described and counterfeit, so buyer protection programs, shipping and authenticity checks are central, and the INFORM Consumers Act and the DSA's trader rules apply to high-volume sellers ([Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding#private-individuals-and-traders)). The Property Tech volume's [Short-Term Rentals](/books/property-tech/short-term-rentals#how-the-platforms-do-it) covers the same stays from the host's and property manager's side.

## Where User-Generated Platforms End

Enterprise chat and collaboration (Slack, Microsoft Teams, Jira, Notion) share most of this architecture: users write messages, comments, pages and tickets, attach files, and talk in channels and threads. They are not user-generated platforms in this volume's sense, because the duties run the other way. The customer organization is the controller of the content and moderates its own people; retention, legal holds and eDiscovery are settings the employer controls; a law enforcement request for a workspace's content is redirected to the customer; and revenue is seats sold to the organization, not ads or a take rate on strangers' contributions. [Real-Time Chat](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties) shows the inversion on Slack and Teams. Those products belong to a future Workplace & Collaboration volume; this one covers platforms where the operator, not a customer, answers for what users publish.

## The Infrastructure Vendors

### Video

| Vendor | What it sells | Published pricing shape (as of October 2026) |
| --- | --- | --- |
| **Amazon IVS** | Managed live video with Twitch lineage: RTMP, RTMPS and SRT ingest; standard, advanced and basic channel types; real-time stages; chat; auto-record to S3 | Input from $0.20 (basic) to $2.00 (standard) per hour; output from $0.0072 (audio) to $0.144 (Full HD) per viewer-hour in its first North American tier; real-time $0.072 per participant-hour |
| **Cloudflare Stream** | Upload, encode, store and deliver video, live included | $5 per 1,000 minutes stored, $1 per 1,000 minutes delivered, encoding and ingress free |
| **Mux** | Video API: upload, just-in-time encoding with Basic, Plus and Premium quality levels, signed playback, DRM, live streaming | On-demand input free at 1080p basic; storage $0.003 per minute per month; delivery $0.001 per minute after 100,000 free minutes a month; live input $0.03125 per minute; DRM $100 a month plus $0.003 per license |

The pricing shapes differ in what they meter (minutes stored and delivered, viewer-hours by resolution, encoding minutes), and that choice decides which of a platform's behaviors cost money: long archives, a large catalog that few watch, or a few streams watched by many. [Video on Demand](/books/user-generated-platforms/video-on-demand#cost-per-viewer-hour) and [Live Latency, Playback & VODs](/books/user-generated-platforms/live-latency-and-vods#distribution-at-scale) turn those meters into a cost per viewer-hour.

### Images, Storage and CDN

**Cloudflare Images** prices per unique transformation (5,000 a month free, then $0.50 per 1,000), per 100,000 images stored ($5 a month) and per 100,000 delivered ($1), and negotiates AVIF or WebP from the browser's Accept header; by default it discards all metadata except the EXIF copyright field. **Cloudinary** picks a format and quality per request and strips metadata by default while keeping the IPTC field that records whether an image was AI-generated. **Cloudflare R2** stores objects at $0.015 per GB-month with no egress fee, which changes the hotlinking and embed math in [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery#hotlinking-embeds-and-signed-urls).

### Trust and Safety

Trust and safety tooling comes from three kinds of supplier: industry and nonprofit programs that hold the hash lists, commercial vendors that sell classifiers and workflow, and infrastructure providers that scan at the edge.

| Supplier | What it provides | Access |
| --- | --- | --- |
| **Alice (formerly ActiveFence)** | Trust and safety intelligence and moderation; bought Spectrum Labs' contextual text moderation in September 2023; now sells red teaming and guardrails for AI systems | Commercial |
| **Cloudflare CSAM Scanning Tool** | Fuzzy-hash matching of content served through Cloudflare's cache against lists from child-safety organizations, blocking matches and notifying the customer | Free on all plans |
| **GIFCT hash-sharing database** | Hashes of terrorist and violent extremist content, labeled by entity, behavior and incident, shared among members | Members with an information-sharing agreement |
| **Google CSAI Match and Content Safety API** | Video fingerprint matching against known abusive content; a classifier that returns a review priority for unseen images and video | Free to qualifying partners, by application |
| **Hive** | Visual, text and audio moderation models, and a CSAM detection API built on Safer that combines hash matching with classifier scores and integrates NCMEC reporting | Commercial; its site now carries a banner that Hive is "now Deploy" |
| **Meta PDQ and TMK+PDQF** | Open-source perceptual hashes for photos and video, used across industry lists | Open source |
| **Microsoft PhotoDNA** | Image hashing and matching against previously identified child sexual abuse imagery | Free to qualified organizations |
| **Microsoft Community Sift (from Two Hat)** | Text filtering and classification for chat; Microsoft bought Two Hat in October 2021, whose technology already screened content on Xbox, Minecraft and MSN | Commercial |
| **Thorn Safer** | Perceptual hashing for images and video, classifiers for novel abuse imagery, a text classifier for exploitation, grooming and sextortion; self-hosted or API | Commercial |

Two facts shape how these fit together. **Lists and classifiers do different jobs:** a hash match finds a copy of something already judged and can act without a person looking at it; a classifier finds something new and returns a score that should order a human queue, which is how Google describes its Content Safety API ("Partners must conduct their own review"). **The vendor sees your users' content,** so the vendor's own security, retention and legal position (the REPORT Act now shields NCMEC's contracted vendors that meet its security requirements; a platform's moderation vendor has no such shield) belong in the contract, and vendor breaches are a real risk: Discord disclosed in October 2025 that a breach at a third-party vendor it used for age-related appeals may have exposed government ID photos of about 70,000 users ([Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#age-assurance-on-a-general-audience-platform)). [Moderation at Scale](/books/user-generated-platforms/moderation-at-scale#vendors) covers vendor selection and outsourced review; [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#the-hash-lists) covers the lists.

### Marketplace Infrastructure

**Payments.** Marketplaces almost all run on a payments platform's connected-accounts product. Stripe Connect is the commonly documented example, and its charge types are the decision a marketplace makes first: **destination charges**, where the platform takes the payment and transfers the host's share, which Stripe recommends for marketplaces such as home rentals; **separate charges and transfers**, where the platform charges first and decides later whom to pay, for multi-party or not-yet-assigned orders; and **direct charges**, where the seller is the merchant and the platform takes an application fee, which suits software platforms more than marketplaces. The choice decides whose balance a refund or chargeback hits and whose name is on the card statement. Outdoorsy's terms say it uses Stripe connected accounts and acts as a limited payment collection agent; Turo pays hosts through Stripe. The [Payments for Software Platforms](/books/payments/software-platforms#four-ways-in) chapter covers the models; [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#who-the-payee-is) covers the payout side.

**Identity verification.** Hosts, sellers and guests verify with a document and a live selfie, sold by vendors such as Persona (named in Outdoorsy's host and driver verification pages) and DigiSure (which RVshare says vets its renters and owners). The category is consolidating: Entrust completed its acquisition of Onfido, an identity verification provider, on April 9, 2024. Airbnb runs its own flow against third-party data, with ID and selfie as fallbacks. [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding#the-onboarding-gates) and [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#verification-and-badges) cover the flows.

**Insurance and protection.** Rental marketplaces embed third-party coverage and sell contractual protection beside it. Turo's trips carry liability coverage from insurers including Travelers Excess and Surplus Lines, and its host plans are contractual reimbursement, "not insurance"; Outdoorsy names Mobilitas as its liability carrier; RVshare's third-party liability policy is from Crum & Forster, written as excess; Airbnb's AirCover damage protection is a guaranty rather than insurance, with host liability insurance distributed under a licensed firm. Which of these is insurance, and who must be licensed to sell it, is [Deposits, Protection Plans & Insurance](/books/user-generated-platforms/deposits-and-protection#insurance-law-who-may-sell-it).

## Consolidation and Capital, as of October 2026

The table runs in date order.

| Date | Event | Why it matters |
| --- | --- | --- |
| August 2014 | Amazon agrees to buy Twitch for about $970 million | Live streaming inside a cloud provider; the technology later sold as Amazon IVS |
| August 2019 | Automattic agrees to buy Tumblr from Verizon | A community moved to an owner with its own publishing stack |
| June 2021 | Etsy agrees to buy Depop for $1.625 billion | A goods marketplace buys a social resale app |
| September 2021 | MediaLab acquires Imgur | A media host moves into a holding company of internet brands |
| October 2021 | Microsoft acquires Two Hat | Moderation tooling brought in-house by a platform owner |
| September 2023 | ActiveFence buys Spectrum Labs | Trust and safety vendors consolidate (ActiveFence now operates as Alice) |
| March 2024 | Reddit completes its IPO on the NYSE (RDDT) | The first audited figures for a large community platform |
| April 2024 | Entrust completes its acquisition of Onfido | Identity verification folded into a security company |
| February 2025 | Turo withdraws its S-1, never effective, after amendments from January 2022 to November 2024 | The largest car-sharing marketplace stays private; its S-1 remains the best public source on the business |
| June 2025 | Etsy sells Reverb | A marketplace narrows to its core |
| November 2025 | Bending Spoons completes its $1.38 billion acquisition of Vimeo; Vimeo delisted | A video host taken private by an operator of acquired apps |
| January 2026 | Discord reported to have filed confidentially for an IPO | No public S-1 as of October 2026 |
| July 2026 | eBay completes its purchase of Depop from Etsy, announced at $1.2 billion in cash | Second-hand fashion consolidates into a larger marketplace |

Three patterns: **platforms go private as often as public** (Vimeo, Imgur, Tumblr), and a new owner's first moves are usually cost (storage, moderation staff) and policy, which is why purges and shutdowns have their own chapter; **marketplaces trade categories** (Reverb out, Depop across, Caramel into eBay for online vehicle transactions); and **trust and safety vendors are being absorbed** by platform owners and security companies, so a platform that depends on one should plan for its product changing name, scope or owner.

## Build, Buy or Rent

Almost every platform rents the commodity and regulated layers and builds the product. The decision per layer:

| Layer | My default | Why |
| --- | --- | --- |
| Accounts, communities, roles, content model | Build | It's the product, and every other layer keys on it |
| Ranking, feeds and search | Build the ranking; rent the engine | Ranking is the product; the index engine (Elasticsearch, OpenSearch, Vespa) is not |
| Image transformation and CDN | Rent | Per-request pricing beats running a fleet until egress dominates the bill |
| Video encoding, live ingest and delivery | Rent until scale, then build selectively | Twitch, YouTube and Meta built their own transcoders and hardware at a scale few reach; Mux, IVS and Cloudflare Stream exist for everyone else |
| Hash matching against child-safety and terrorist lists | Join the programs; rent the matching | The lists are only available through PhotoDNA, NCMEC, IWF, GIFCT and vendors like Safer; never build your own list from scratch |
| Classifiers for nudity, violence, hate, spam | Rent, then tune with your own labels | The vendor's models are a starting point; your policy and appeals decide thresholds |
| Moderation workflow (cases, decisions, notices, appeals) | Build on the playbook's model | Your policy, your legal clocks and your transparency reports run on it ([Trust & Safety](/docs/security/trust-and-safety)) |
| Identity verification | Rent | Document and liveness checks, and their fraud models, are a vendor's full-time job |
| Payments, payouts and tax forms | Rent a connected-accounts platform | Money transmission, KYC and 1099-K filing are regulated ([Payments for Software Platforms](/books/payments/software-platforms#what-a-provider-builds-for-platforms)) |
| Insurance | Partner with a carrier and a licensed producer | Selling insurance takes licenses; protection plans that aren't insurance still need careful drafting |
| Chat and real-time | Build when chat is the product; rent otherwise | Discord built its stack; a marketplace's messaging can run on a managed service |
| Federation | Adopt the protocol, build the policy | ActivityPub and the AT Protocol are open; which servers and labelers you trust is yours |

My rule for the rented layers: keep the record of what the vendor said in your own tables. A classifier score, a hash match, an identity check result or an insurer's claim decision is evidence in a case, an appeal or a lawsuit, and it has to survive the vendor changing its model, its API or its owner ([Automated Risk Decisions](/docs/architecture/risk-scoring#the-decision-record)).

## Auditing

Vendor choices create records that matter later:

- **Which vendor decided, with which version.** Every automated moderation decision, identity check and risk score records the vendor, model version, threshold and raw result ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Which lists matched.** A hash match records the list (NCMEC, IWF, GIFCT, a vendor's database, the platform's own), the list version and the distance, because reports to NCMEC and appeals depend on it.
- **What left the platform.** Which vendor received which users' content or identity documents, under which contract, and when it was deleted there, the question a breach or a regulator asks first.
- **Coverage in force.** Which insurer and policy covered which trip, so a claim filed months later goes to the right carrier.

## What This Means for the System You Build

- **Build the community, content and marketplace model;** rent video, image delivery, identity verification, payments and insurance.
- **Join the hash-sharing programs early,** and rent matching against them before you need it.
- **Use classifiers to order human queues,** and act automatically only on high-confidence matches.
- **Pick the marketplace charge type deliberately:** it decides whose balance a refund or chargeback hits.
- **Price video by the vendor's meter** and model your own usage against it before you choose.
- **Store every vendor result in your own tables,** with vendor, version and timestamp, so it outlives the vendor.
- **Plan for vendors changing owner or name;** keep an exit path and an export of your own labels.
- **Watch the capital events:** new owners reshape archives, policies and geography fast.

## References

**Filings and transactions**

- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), active communities, DAUq, the March 2024 IPO and NYSE listing, moderator and logged-out traffic risk factors
- [Pinterest: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1506293/000150629326000021/pins-20251231.htm), surfaces and 619 million MAU
- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), YouTube ads revenue
- [Airbnb: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm), gross booking value, nights and seats, AirCover as a guaranty, licensed distribution of host liability insurance
- [eBay: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1065088/000106508826000027/ebay-20251231.htm), GMV, active buyers, the Caramel acquisition
- [Etsy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1370637/000137063726000019/etsy-20251231.htm), GMS, the Reverb sale and the agreed Depop sale
- [Turo: EDGAR filing index for Form S-1](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001514587&type=S-1), the S-1 and its amendments through November 2024
- [Turo: Form RW (February 2025)](https://www.sec.gov/Archives/edgar/data/1514587/000162828025005472/turo-formrw.htm), withdrawal of the registration statement
- [Turo: Form S-1/A, Amendment No. 12](https://www.sec.gov/Archives/edgar/data/1514587/000162828024047889/turoinc-sx1a12.htm), gross booking value, Travelers Excess and Surplus Lines, protection plans
- [Vimeo: Form 8-K (November 24, 2025)](https://www.sec.gov/Archives/edgar/data/1837686/000110465925115501/tm2532050d1_8k.htm), completion of the Bending Spoons merger, $1.38 billion, Nasdaq delisting
- [Amazon: Amazon.com to Acquire Twitch](https://press.aboutamazon.com/2014/8/amazon-com-to-acquire-twitch), about $970 million in cash (August 25, 2014)
- [Matt Mullenweg (Automattic CEO): Tumblr](https://ma.tt/2019/08/tumblr/), August 13, 2019, Automattic buying Tumblr from Verizon
- [Microsoft: Microsoft acquires Two Hat](https://blogs.microsoft.com/blog/2021/10/29/microsoft-acquires-two-hat-to-collaborate-on-online-safety-and-digital-wellness-solutions-for-online-communities/), October 29, 2021, use on Xbox, Minecraft and MSN
- [Alice: Alice acquires Spectrum Labs](https://alice.io/company-news/alice-acquires-spectrumlabs), September 2023, "Alice, formerly ActiveFence," current products
- [Entrust: Entrust completes acquisition of Onfido](https://www.entrust.com/company/newsroom/entrust-completes-acquisition-of-onfido-creating-a-new-era-of-identity-centric-security), April 9, 2024, Onfido's identity verification business
- [Storyboard18: Discord files confidentially for IPO](https://www.storyboard18.com/social-media/discord-files-confidentially-for-ipo-reports-87132.htm), the January 2026 Bloomberg report, Goldman Sachs and JPMorgan, Nitro as the main revenue (reported)
- [Imgur: Celebrating Imgur's Next Chapter (Wayback Machine)](https://web.archive.org/web/20220101001803/https://blog.imgur.com/2021/09/27/celebrating-imgurs-next-chapter/), September 27, 2021, the 2009 founding and the MediaLab acquisition
- [Imgur Help: Imgur Terms of Service Update, April 19, 2023 (Wayback Machine)](https://web.archive.org/web/20230420231041/https://help.imgur.com/hc/en-us/articles/14415587638029-Imgur-Terms-of-Service-Update-April-19-2023-), the 2023 terms change effective May 15, 2023
- [ICO: Statement on the Imgur investigation](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/09/statement-update-on-imgur-investigation/), the notice of intent and the UK withdrawal (September 2025)
- [Etsy: Form 8-K exhibit 99.1 (June 2, 2021)](https://www.sec.gov/Archives/edgar/data/1370637/000137063721000028/exhibit99106022021.htm), the agreement to acquire Depop for $1.625 billion
- [Depop: eBay completes acquisition of Depop](https://news.depop.com/ebay-completes-acquisition-of-depop/), July 30, 2026, the completed purchase
- [Vinted: Financial results 2025](https://company.vinted.com/newsroom/financial-results-2025), April 9, 2026, 2025 GMV of EUR 10.8 billion and revenue

**Vendors**

- [Mux: Pricing](https://www.mux.com/pricing), on-demand and live meters and the free tier
- [Mux: Protect videos with DRM](https://www.mux.com/docs/guides/protect-videos-with-drm), DRM pricing
- [Amazon IVS: What is Amazon IVS](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/what-is.html), ingest protocols and latency tiers
- [Amazon IVS: Product page](https://aws.amazon.com/ivs/), Twitch lineage
- [Amazon IVS: Pricing](https://aws.amazon.com/ivs/pricing/), input and output prices
- [Cloudflare Stream: Pricing](https://developers.cloudflare.com/stream/pricing/), minutes stored and delivered
- [Cloudflare Images: Pricing](https://developers.cloudflare.com/images/pricing/), transformations, storage and delivery
- [Cloudflare Images: Features](https://developers.cloudflare.com/images/optimization/features/), format negotiation and metadata defaults
- [Cloudflare R2: Pricing](https://developers.cloudflare.com/r2/pricing/), storage price and free egress
- [Cloudinary: Image optimization](https://cloudinary.com/documentation/image_optimization), automatic format and quality, metadata stripping and the retained IPTC field
- [Microsoft: PhotoDNA](https://www.microsoft.com/en-us/photodna), image hashing and access
- [Meta: Open-sourcing photo- and video-matching technology](https://about.fb.com/news/2019/08/open-source-photo-video-matching/), PDQ and TMK+PDQF
- [Google: Child safety toolkit for partners](https://protectingchildren.google/tools-for-partners/), CSAI Match and the Content Safety API
- [Thorn: Safer](https://safer.io/), hashing and classifiers
- [Hive: CSAM Detection API](https://thehive.ai/apis/csam-detection), Safer-based matching, classifiers and NCMEC reporting integration
- [Hive: Content moderation](https://thehive.ai/), visual, text and audio moderation
- [Cloudflare: CSAM Scanning Tool](https://developers.cloudflare.com/cache/reference/csam-scanning/), edge matching and customer notification
- [GIFCT: Hash-Sharing Database](https://gifct.org/hsdb/), hash types, labels and member access
- [Stripe: Understand how charges work in a Connect integration](https://docs.stripe.com/connect/charges), direct, destination and separate charges and transfers, and who bears refunds and disputes
- [Outdoorsy: Terms of Service](https://support.outdoorsy.com/hc/en-us/articles/37422344026779-Outdoorsy-Terms-of-Service), not a party to bookings, payment collection agent, Stripe connected accounts
- [Outdoorsy: Why identity verification before listing](https://support.outdoorsy.com/hc/en-us/articles/40350047391515-Why-does-Outdoorsy-need-to-verify-my-identity-before-listing-a-vehicle), Persona ID and selfie checks
- [Outdoorsy: Summary of Host Protection Policy](https://support.outdoorsy.com/hc/en-us/articles/37881323218331-Summary-of-Host-Protection-Policy), the liability carrier
- [RVshare: RV rental insurance guide](https://rvshare.com/rv/rv-rental-insurance-binder), Crum & Forster excess liability, DigiSure vetting
- [Turo: Earnings plans in detail for US hosts](https://help.turo.com/en_us/earnings-plans-in-detail-us-hosts-ByMOIVxEc.md), plans as contractual reimbursement, Stripe payouts

**Protocols and platforms**

- [W3C: ActivityPub](https://www.w3.org/TR/activitypub/), inboxes, outboxes and server-to-server delivery
- [Mastodon: Moderation actions](https://docs.joinmastodon.org/admin/moderation/), local moderation and domain blocks
- [AT Protocol: Overview](https://atproto.com/guides/overview), PDS, relays, AppViews, DIDs and handles
- [Bluesky: Stackable moderation](https://bsky.social/about/blog/03-12-2024-stackable-moderation), labelers and Ozone
- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), user growth in 2025
- [Twitch: Ingesting live video streams at global scale](https://blog.twitch.tv/en/2022/04/26/ingesting-live-video-streams-at-global-scale/), ingest PoPs and origin routing
- [Twitch: Live video transmuxing and transcoding (2017)](https://blog.twitch.tv/en/2017/10/10/live-video-transmuxing-transcoding-f-fmpeg-vs-twitch-transcoder-part-i-489c1c125f28/), the transmuxed top rendition
- [Twitch: State of Engineering 2023](https://blog.twitch.com/en/2023/09/28/twitch-state-of-engineering-2023/), origins and the replication tree
- [Discord: Update on a security incident involving third-party customer service](https://discord.com/press-releases/update-on-security-incident-involving-third-party-customer-service), the October 2025 disclosure and about 70,000 users' government ID photos used for age-related appeals possibly exposed
