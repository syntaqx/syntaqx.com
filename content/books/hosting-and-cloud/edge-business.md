+++
title = "The Edge Business"
description = "CDNs as businesses: Akamai to Bunny, revenue mix and retention, free tiers and plan gating, content limits, and how CDN pricing works, with a worked comparison."
category = "Hosting & Cloud Industry"
order = 2173
part = "The Edge"
tags = ["cdn", "edge", "pricing", "billing", "business", "free-tier"]
+++

An edge network sells the path between an origin and its visitors. The product started as a cache in front of busy websites and became the place where TLS terminates, floods are absorbed, bots are scored and code runs, but the business underneath is still capacity in many cities, bought in bulk from data centers and networks and resold in small units to customers who would rather not build it. The margin lives in the gap between how the provider pays for that capacity (racks, power, transit and ports, mostly fixed and committed) and how it charges for it (per gigabyte, per request, per plan, per contract).

The industry twist is that the same capacity is sold three ways at once. Some providers meter it, so every gigabyte and request is a line on the bill; some flatten it into plans with no overage, so the customer buys certainty and the provider carries the variance; and the largest buyers sign contracts with commitments, so price is negotiated and repriced at renewal. A provider's choice decides who it can sign, what its free tier costs it, how its revenue behaves in a downturn and which abuse it attracts. This chapter covers the business history from Akamai to Bunny, how the public providers report revenue and customers, free tiers as acquisition, plan gating, the content limits that keep free bandwidth from meaning free video, and how CDN pricing works, with a worked comparison for one workload, then extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with `cdn_zones`, `cdn_origins` and the delivery meters the rest of the Edge part uses. The market map is in [The Provider Landscape](/books/hosting-and-cloud/provider-landscape#edge-networks); how requests reach a location is [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses).

## How the Providers Do It

As of October 2026:

| Provider | Public figures (2025) | How it sells | Free entry | Price shape |
| --- | --- | --- | --- | --- |
| **Cloudflare** | Revenue $2,167.9M; about 332,000 paying customers; 4,298 paying over $100,000 a year, 73% of Q4 revenue; dollar-based net retention 120% | Self-serve Pro and Business plans by card, enterprise contracts direct and through resellers | Free plan, an acquisition channel with no direct revenue | Plan fee; bandwidth and DDoS mitigation not metered; add-ons and usage products priced separately |
| **Akamai** | Revenue $4,208.2M: security $2,243.4M, delivery $1,256.7M (down from $1,318.1M), cloud computing $708.1M | Contracts, with SLA credits in most | None published | No public CDN rate card |
| **Fastly** | Revenue $624.0M; 628 enterprise customers producing 94% of revenue; top 10 customers 32%; net retention 110.1%; gross margin 57% | Usage-based, or packages with no overage charges; mostly one-year contracts | Monthly allowance: 100 GB per region and 1M requests | Per GB by region and volume, per request |
| **Amazon CloudFront** | Not reported separately from AWS | Pay as you go, flat-rate plans, or a one-year Security Savings Bundle | Always free: 1 TB and 10M requests a month; a $0 flat-rate plan | Per GB by region and volume, per request (HTTP and HTTPS priced apart), or a plan |
| **Google Cloud CDN** | Not reported separately from Google Cloud | Usage, behind the global external Application Load Balancer | Not stated on the pages opened | Cache egress per GiB, cache fill per GiB, cache lookups per request |
| **Azure Front Door** | Not reported separately from Azure | Standard or Premium tier, plus usage | Not stated on the page opened | Monthly base fee plus per GB and per request |
| **Bunny** | Private | Prepaid usage | 14-day trial; $1 monthly minimum | Per GB by region on the standard network, a flat volume network; no request fees |

Three patterns run through the table:

- **The three public pure plays tell three different stories.** Akamai is now mostly a security company whose delivery revenue is shrinking; Cloudflare grows a self-serve base into large contracts; Fastly is a usage business concentrated in a few hundred enterprise accounts.
- **The meters are the same everywhere,** bytes by region and requests by protocol, and providers differ in which they show the customer. Bunny and Cloudflare hide the request meter; CloudFront's flat-rate plans hide both up to an allowance.
- **Clouds sell the CDN as a feature of the cloud.** CloudFront, Cloud CDN and Front Door are priced next to the cloud's own egress and often waive the fill from the cloud's own origins, which makes the CDN a reason to keep the origin there.

## How the Edge Business Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 20 Aug 1998 | Akamai incorporated by Tom Leighton and Danny Lewin, under an exclusive license to MIT technology | Popular sites melting under demand they couldn't serve from one place | Servers placed inside other people's networks |
| Apr 1999 | Akamai launches commercial service with Yahoo! as a charter customer | Content delivery as a service rather than a build | A sales-led, contract business from the start |
| 28 Oct 1999 | Akamai's IPO prospectus: 9,000,000 shares at $26 on Nasdaq as AKAM; revenue "based on fees for the amount of Internet content delivered"; 1,475 servers in 24 countries on 55 networks | Capital to place servers in every large network | Usage revenue exposed to price per unit falling |
| 18 Nov 2008 | Amazon CloudFront public beta, with "no commitments" | CDN without a contract or a sales call, billed with the cloud | Per-gigabyte prices visible to every buyer |
| 27 Sep 2010 | Cloudflare public beta at TechCrunch Disrupt: core service free, add-ons from $20 a month | Small sites that no CDN wanted to sign | A free tier to fund and police |
| Mar 2011 | Fastly incorporated in Delaware as SkyCache, Inc. | A programmable CDN with instant purge | Competing with incumbents on large usage accounts |
| Oct 2015 | Bunny CDN beta | Low per-gigabyte delivery for small buyers | Thin margins; volume pricing as the product |
| 11 Nov 2015 to 27 Jun 2016 | Google Cloud CDN: alpha, beta 13 Apr 2016, general availability 27 Jun 2016 | A CDN attached to Google's load balancer | Tied to one cloud's front end |
| 16 May 2019 | Fastly prices its IPO: 11,250,000 shares at $16, NYSE as FSLY from 17 May | Capital and a public currency | Quarterly scrutiny of usage-driven revenue |
| 12 Sep 2019 | Cloudflare prices its IPO: 35,000,000 shares at $15, NYSE as NET from 13 Sep | The same | The same, with a free base to explain |
| 16 Jun 2022 | Limelight completes its acquisition of Yahoo's Edgecast and renames itself Edgio, targeting $30 to 35M a year of colocation and peering savings | Scale in a commoditizing market | Integration of two networks |
| 16 May 2023 | Cloudflare moves its content restriction into CDN-specific terms and drops "the antiquated HTML vs. non-HTML construct" | A rule Cloudflare called "far too broad" | Video and large files still restricted unless hosted on Cloudflare |
| 9 Sep 2024 | Edgio files for Chapter 11 in Delaware to pursue sales, with a $110M credit bid from its lender | (The failure) a delivery business that couldn't cover its costs | Customers migrating under deadline |
| 13 Dec 2024 | Akamai completes its purchase of select Edgio assets: customer contracts and patent licenses, not the network or staff | Consolidation by buying customers, not capacity | |
| 18 Nov 2025 | CloudFront flat-rate plans: $0 to $1,000 a month with no overage charges | Bill fear on usage pricing | Allowances to police without billing |
| 28 Sep 2026 | Cloudflare's current Service-Specific Terms: non-Enterprise customers must use paid services to serve video and large files through the CDN | Free bandwidth being used as a free video host | Customers whose use changes face a limit |

The arc is a price curve. Akamai's prospectus already billed by content delivered, which is the meter that every later entrant undercut: CloudFront published the per-gigabyte price, Cloudflare gave the bandwidth away on plans, and Bunny made a fraction of a cent the headline. Edgio's two steps show where that ends for a provider that sells only delivery: the merger's stated savings were colocation and peering, the costs that don't fall with price, and the assets Akamai bought out of the bankruptcy were customer contracts and patent licenses, with the network excluded.

## Revenue Mix and Customer Metrics

The three filers report differently, and the differences are the business models.

**Cloudflare.** Revenue was $2,167.9M in 2025, $1,669.6M in 2024 and $1,296.7M in 2023, with net losses in each year. Its 10-K counts "approximately 332,000 paying customers across more than 190 countries" and defines a large customer as one paying more than $100,000 a year: 4,298 at the end of 2025, up from 3,497 and 2,756, contributing 73% of fourth-quarter revenue, up from 69%. Dollar-based net retention was 120% in Q4 2025, 111% in Q4 2024 and 115% in Q4 2023, measured on the same paying customers four quarters apart, net of contraction and attrition and excluding free users who upgrade. No customer was more than 10% of revenue, and international revenue was 51%. Its sales channels are enterprise contracts (direct and through resellers), pay-as-you-go Pro and Business plans billed by card monthly or annually, and free plans with no direct revenue, and its risk factors count a pay-as-you-go customer moving back to free as churn.

**Akamai.** Revenue was $4,208.2M in 2025. Akamai reports it by solution category (security $2,243.4M, delivery $1,256.7M, cloud computing $708.1M) and "operates as one operating and reportable segment," so these are categories, not segments. Security "currently generate[s] the largest portion" of revenue and cloud infrastructure services "represent the majority of Akamai's strategic investment." Delivery is the shrinking line: its decreases "were due to downward pricing of contract renewals," with "macroeconomic headwinds" pushing customers toward cost optimization. No customer reached 10% of revenue, and most contracts carry SLA commitments that can require credits.

**Fastly.** Revenue was $624.0M in 2025 (network services $477.8M, security $125.1M, other including Compute $21.2M) from 3,092 customers, of which 628 enterprise customers (over $100,000 of annualized current-quarter revenue) produced 94% of annualized revenue. Its top 10 customers were 32% of trailing-twelve-month revenue, and business units of one company were 10% in 2025. Net retention was 110.1%, annual revenue retention 98.7% and gross margin 57%. Two sentences in the 10-K describe the risk of a usage model: "most of our current customer contracts are only one year in duration," and "many of our largest customers' minimum usage commitments for our platform are relatively low" compared with expected usage, so revenue follows traffic, and traffic follows the customer's own business and its willingness to split it across CDNs.

The metrics are worth defining once, because every edge provider's investor material uses them and none uses them identically:

| Metric | What it counts | Cloudflare (Q4 2025) | Fastly (2025) | Trap |
| --- | --- | --- | --- | --- |
| **Paying customers** | Accounts with any paid product | About 332,000 | 3,092 total customers | Free accounts excluded at Cloudflare; Fastly's figure counts every customer |
| **Large or enterprise customers** | Above a revenue threshold | 4,298 over $100,000 a year | 628 over $100,000 annualized from one quarter | Annual versus annualized-quarterly thresholds differ |
| **Net retention** | Revenue from last year's customers now, over then | 120% dollar-based | 110.1% trailing twelve months | Window and exclusions differ; usage spikes inflate it |
| **Concentration** | Share from the largest customers | No customer over 10% | Top 10 at 32% | A usage business can lose a top customer to a second CDN without losing the account |

Counting is itself a control. Cloudflare's 10-K discloses that a system error in Q1 2022 overstated its paying customers by 5,925, which is the reason a metric like this is a query over billing records with a written definition, not a counter in a dashboard (the Operating Metrics chapter covers the definitions).

**Edge compute** is the revenue line every provider is growing into, priced on requests and CPU time rather than bytes: Fastly's "other" line, which includes Compute, grew 64% to $21.2M, and Cloudflare's Workers Paid plan starts at a $5 monthly minimum. The runtimes and their meters are the Functions, Isolates & Edge Compute chapter's topic.

## Free Tiers as Acquisition

A free CDN plan costs the provider real capacity, so it has to pay back some other way. Cloudflare's filing is explicit that free plans are an acquisition channel with no direct revenue, and the logic is visible in its numbers: a free site that grows becomes a Pro or Business plan, a Business plan that grows becomes a contract, and the large customers that came up that ladder carry most of the revenue. The free base also makes the network better at its paid jobs: more traffic means more signal for bot scoring and attack detection, and more sites mean more peering leverage with access networks.

The other providers' free entries are narrower:

- **CloudFront** has an always-free tier of 1 TB of transfer, 10 million HTTP or HTTPS requests and 2 million CloudFront Function invocations a month, plus a $0 flat-rate plan with 1 million requests and 100 GB.
- **Fastly** gives monthly allowances under usage pricing: 100 GB of bandwidth per region and 1 million requests for delivery, and 10 million requests for Compute.
- **Bunny** has a 14-day trial and a $1 monthly minimum, so its entry point is cheap rather than free.

A free tier is also an abuse surface: free accounts host phishing pages behind the proxy, and free bandwidth attracts uses the plan wasn't priced for. The playbook's [Free Tiers and Their Cliffs](/docs/operations/cost-and-finops#free-tiers-and-their-cliffs) covers the customer's side; the provider's side (fraud, credits, cliffs) is the Free Tiers, Credits & Startup Programs chapter's and the Abuse on Infrastructure chapter's.

## Plan Gating

Edge providers sell one engine in tiers, and the tier names have converged: Cloudflare's Free, Pro, Business and a top tier its plans page calls Contract; CloudFront's flat-rate Free, Pro, Business, Premium and Custom. The pattern, as of October 2026:

| Tier | Cloudflare (Network and CDN) | CloudFront flat rate | What the gate is on |
| --- | --- | --- | --- |
| Free | $0 | $0: 1M requests, 100 GB, 5 WAF rules, no logging or SLA | Basic protection; nothing that costs per-customer support |
| Pro | $25 a month, or $20 a month billed annually | $15: 10M requests, 50 TB, 25 WAF rules, logging | Managed rules, logs, more rules |
| Business | $250 a month, or $200 billed annually | $200: 125M requests, 50 TB, 50 WAF rules, uptime SLA, origin features | SLA, origin controls, more of everything |
| Premium | | $1,000: 500M requests, 50 TB, 75 WAF rules | Higher limits |
| Contract or Custom | Custom, billed annually | Contact sales; no limits on rules, requests or transfer | Contract terms, account team, every feature |

Both ladders put unmetered DDoS protection and the CDN itself on every tier and gate on rules, logs, SLAs and support. The security gates in detail (rule counts, rate-limit periods, bot scores) are [WAF, Bots & Rate Limits](/books/hosting-and-cloud/waf-bots-and-rate-limits#plan-gating-and-pricing); the TLS gates are [What's Free and What's Paid](/books/hosting-and-cloud/tls-and-protocols#what-s-free-and-what-s-paid). As a product design the rule is consistent: the network effect (more sites, more HTTPS, protection against floods) is free, and anything with a marginal cost per customer (support, logs stored, rules evaluated, an SLA's credits) is gated or metered.

## Why Free Bandwidth Isn't Unlimited

A plan that doesn't meter bandwidth needs a rule about what the bandwidth is for, or it becomes the cheapest video host on the internet. Cloudflare's rule has been rewritten in public. Its self-serve terms once drew the line between HTML and non-HTML content; on 16 May 2023 it moved the restriction into CDN-specific terms, dropped "the antiquated HTML vs. non-HTML construct, which was far too broad," and said customers could serve video and large files through the CDN "so long as that content is hosted" on a Cloudflare service such as Stream, Images or R2. The Service-Specific Terms, updated 28 Sep 2026, keep the rule: "Unless you are an Enterprise customer, Cloudflare offers specific Paid Services" that "you must use in order to serve video and other large files via the CDN."

The business reason is the one behind every flat-rate plan. Web pages and their assets are small, cache well and grow slowly; video is large, grows with every viewer and would dominate the network's cost if it rode for free. Unmetered plans therefore meter something else (what the content is), and the paid path for heavy bytes is a product that bills by the unit: Cloudflare Stream bills minutes delivered and Images bills images delivered, as UGP's [CDN, Egress and the Delivery Bill](/books/user-generated-platforms/storage-and-delivery#cdn-egress-and-the-delivery-bill) lists. Fastly's packages carry the same kind of clause in a different form: they are for "web pages and web APIs," not streaming, and no more than 10% of traffic may come from its African, Indian or South Korean billing regions. CloudFront's flat-rate plans do it with allowances: past them the customer isn't billed, but "you may experience reduced performance," such as being served from fewer or more distant edge locations.

For a provider the lesson is to write the content rule and the allowance at the same time as the price, and to enforce them as recorded restrictions on a zone (below), not as a surprise suspension. The customer's matching problem, other sites embedding its files, is UGP's [Hotlinking, Embeds and Signed URLs](/books/user-generated-platforms/storage-and-delivery#hotlinking-embeds-and-signed-urls).

## How CDN Pricing Works

Every CDN bill is built from a few meters, whichever ones the provider chooses to show. As of October 2026, with prices in US dollars:

### Bandwidth by Region and Volume

Delivery is priced per gigabyte served to visitors, with a price per **pricing region** and, at most providers, falling prices per **volume tier** within a month. The region is where the cost is: transit and peering cost more in some markets, and every provider's table shows it.

| Provider | North America and Europe, first tier | Other regions, first paid tier | Volume tiers |
| --- | --- | --- | --- |
| **CloudFront** | First 1 TB free, then $0.085 per GB for the next 9 TB | India $0.109, South America $0.110, Japan and Australia $0.114 | US and Europe: $0.080 next 40 TB, $0.060 next 100 TB, $0.040 next 350 TB, $0.030 next 524 TB, $0.025 next 4 PB, $0.020 over 5 PB |
| **Fastly** | First 100 GB per region free, then $0.12 to 10 TB | Mexico $0.16; Asia, Australia, South America and Saudi Arabia $0.19; Africa, India and South Korea $0.28 | North America and Europe $0.08 for the next 10 TB |
| **Google Cloud CDN** | North America cache egress $0.08 per GiB for the first 10 TiB | Not opened | Not opened beyond the first tier |
| **Azure Front Door** | $0.083 per GB for the first 10 TB, North America and Europe | Not opened | Not opened beyond the first tier |
| **Bunny** (standard network, 119 PoPs) | $0.01 per GB | Asia and Oceania $0.03, South America $0.045, Middle East and Africa $0.06 | None on the standard network |
| **Bunny** (volume network, 10 PoPs) | $0.005 per GB for the first 500 TB, one global rate | | $0.004 to 1 PB, $0.002 to 2 PB, then contact |
| **Cloudflare** plans | Not metered | Not metered | |
| **Akamai** | No public rate card | | |

Volume tiers are marginal, like tax brackets: each gigabyte is priced at the tier it falls in. At CloudFront, 200 TB in a month in North America costs nothing for the first 1 TB, $765 for the next 9 TB, $3,200 for the next 40 TB, $6,000 for the next 100 TB and $2,000 for the last 50 TB, $11,965 in all, or about $0.060 per GB blended (treating 1 TB as 1,000 GB). The same 200 TB on Bunny's volume network is $1,000. The gap is the difference between a network sold on reach and one sold on price: Bunny's volume network is 10 locations, its standard network 119, CloudFront's 750-plus POPs.

### Requests

Most providers also charge per request, and some charge more for HTTPS because a TLS request costs more to serve:

- **CloudFront:** first 10 million a month free; then per 10,000 requests $0.0075 HTTP and $0.0100 HTTPS in the US, $0.0090 and $0.0120 in Europe.
- **Fastly:** first 1 million free, $0.01 per 10,000 to 100 million, then $0.0095 for the next 100 million.
- **Google Cloud CDN:** HTTP and HTTPS cache lookups at $0.0075 per 10,000, one price for both.
- **Azure Front Door:** $0.009 per 10,000 on Standard and $0.015 on Premium for the first 250 million, North America and Europe.
- **Bunny:** "No Request Fees." **Cloudflare plans:** not metered.

The request meter is what makes small objects expensive: a site that serves 50 KB thumbnails pays more per gigabyte in request fees than one that serves 5 MB downloads. The playbook's [Measure Cost per Unit, Not Just in Total](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total) is the customer's way to see it.

### Shields, Fill and Tiers

The traffic behind the edge is billed differently at each provider, and it is where comparisons go wrong:

- **Origin fill.** Google bills cache fill at $0.01 per GiB in North America. CloudFront doesn't charge for origin fetches from AWS origins such as S3, EC2 and load balancers, and Azure says transfer from an origin in an Azure data center to Front Door is free, while Front Door's edge-to-origin transfer is listed at $0.02 per GB in North America. For an origin outside the cloud, the origin's own egress is a second bill, which is the Egress & Switching chapter's topic.
- **Shields.** CloudFront charges Origin Shield per 10,000 requests ($0.0075 in the US, $0.0090 in Europe) when it is an incremental layer; Fastly counts shield-to-edge traffic toward requests and bandwidth. Both are in [Tiered Caches and Shields](/books/hosting-and-cloud/caching-and-invalidation#tiered-caches-and-shields).
- **Purges, logs and functions** have their own meters ([Purge Limits and Purge Billing](/books/hosting-and-cloud/caching-and-invalidation#purge-limits-and-purge-billing)), and so does attack traffic, which providers exclude or credit ([Attack Traffic and the Bill](/books/hosting-and-cloud/ddos-mitigation#attack-traffic-and-the-bill)).

### Flat-Rate Plans

A flat-rate plan replaces the meters with a monthly price and allowances, and moves the variance from the customer to the provider.

- **CloudFront's flat-rate plans** (launched 18 Nov 2025) bundle the CDN, WAF, DDoS protection, DNS and edge compute per distribution: Free $0 (1M requests, 100 GB), Pro $15 (10M, 50 TB), Business $200 (125M, 50 TB), Premium $1,000 (500M, 50 TB), and Custom. AWS says there are "no overage charges," that "Blocked requests and DDoS attacks never count against your allowance," and that customers are alerted at 50%, 80% and 100% of an allowance; past it, performance may be reduced rather than billed. Premium allowances can be configured up to 6B requests and 600 TB.
- **Cloudflare's plans** never metered bandwidth: the price is the plan, and the limit is the content rule above.
- **Fastly's packages** turn usage into a monthly price with included requests (Basic, $1,500 a month with 100M requests; Starter, $6,000 with 500M), and its 10-K says that under these packages "We generally do not charge for overages."

The design question a flat-rate plan answers is what happens at the allowance. Billing it is a usage plan with extra steps; cutting the customer off is an outage they paid for; degrading service (fewer locations, lower priority) is what CloudFront chose; and limiting what may be served is what Cloudflare chose. Each is an `overage_mode` and an enforcement path in the model below.

### Commitments and Bundles

Large buyers trade a commitment for a price:

- **CloudFront Security Savings Bundle:** up to 30% off the CloudFront bill for a monthly spend commitment over one year, applying to all CloudFront usage types including Functions and Lambda@Edge, with AWS WAF usage included up to 10% of the commitment.
- **Fastly:** minimum usage commitments that are "relatively low" compared with expected usage, on contracts that are mostly one year.
- **Akamai:** contracts with SLA commitments, repriced at renewal; its delivery revenue fell on "downward pricing of contract renewals."

A commitment is the provider's hedge against traffic leaving for a second CDN, and a low one is a sign the customer has that option. How commitments draw down, and what happens at a shortfall, is the Commitments, Discounts & Marketplaces chapter's subject.

### A Worked Comparison

One workload, priced at list on each provider's public page as of October 2026. Assumptions: a website and API serving **8,000 GB a month to visitors in North America**, **40 million HTTPS requests**, a 90% byte hit ratio (so **800 GB of cache fill**), an origin on the same provider's cloud where it has one, web content only (no video), and no WAF, logs, functions or support. A GB is each provider's billing unit (Google's is the GiB), and 1 TB is treated as 1,000 GB.

| Option | Delivery | Requests | Fill and fees | Monthly total |
| --- | --- | --- | --- | --- |
| **CloudFront, pay as you go** | 8,000 − 1,000 free = 7,000 GB × $0.085 = $595.00 | 40M − 10M free = 30M at $0.0100 per 10,000 = $30.00 | AWS origin fetch free | **$625.00** |
| **CloudFront, flat rate** | Within 50 TB | 40M exceeds Pro's 10M, so Business (125M) | Included | **$200.00** |
| **Cloudflare, Pro** | Not metered | Not metered | None | **$25.00** monthly, or **$20.00** billed annually |
| **Fastly, usage** | 8,000 − 100 free = 7,900 GB × $0.12 = $948.00 | 40M − 1M free = 39M at $0.01 per 10,000 = $39.00 | Not priced on the page opened | **$987.00** |
| **Google Cloud CDN** | 8,000 GiB × $0.08 = $640.00 | 40M at $0.0075 per 10,000 = $30.00 | 800 GiB fill × $0.01 = $8.00 | **$678.00**, plus load balancer charges |
| **Azure Front Door Standard** | 8,000 GB × $0.083 = $664.00 | 40M at $0.009 per 10,000 = $36.00 | $35.00 base fee; Azure origin transfer free | **$735.00** |
| **Bunny, standard network** | 8,000 GB × $0.01 = $80.00 | None | None stated | **$80.00** |
| **Bunny, volume network** | 8,000 GB × $0.005 = $40.00 | None | None stated | **$40.00** |
| **Akamai** | Contract | Contract | Contract | Not public |

The spread is more than twentyfold, and none of the numbers is the decision on its own. The metered clouds price reach (hundreds of locations, every region) and integration with an origin already there; Cloudflare's plan prices the content rule; Bunny prices the gigabyte and offers fewer locations for the cheapest tier; Fastly's list price is a starting point that its packages and contracts replace for anyone at scale. The two comparisons I'd run before choosing are the same workload with its real regional mix (Asian or Latin American traffic moves every row), and the same workload at ten times the traffic, where volume tiers, packages and commitments take over from list prices.

## The Alternatives

| Model | How it works | Strengths | Failure modes | Licensing and ownership | Cost shape | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Metered usage** (CloudFront, Fastly, Cloud CDN, Front Door) | Per GB by region and volume, per request | Pay for what's used; cheap at low volume; prices published | Bill shock on spikes and attacks; request fees on small objects | The provider's network and terms | Linear with traffic, tiered down | Developers, cloud-native teams, enterprises under contract |
| **Flat-rate plan** (Cloudflare, CloudFront flat rate, Fastly packages) | Monthly price, allowances, no overage | Predictable bill; the provider carries variance | Content rules and degraded service at the allowance; a customer outgrows the plan suddenly | The provider's terms decide what "unlimited" excludes | Step function by plan | Small and mid-sized sites, teams that budget monthly |
| **Contract with commitment** (Akamai, enterprise tiers everywhere) | Negotiated rate, minimum commitment, SLA | Lowest unit price at scale; support and custom terms | Repricing at renewal; shortfall payments; lock-in to the commit | Contract | Commit plus overage at a negotiated rate | Media, commerce, large SaaS |
| **Low-cost per-GB network** (Bunny standard and volume) | Very low per-GB price, no request fees, fewer locations in the cheapest tier | Cost; simplicity | Fewer locations and less security depth than the largest networks | The provider's network | Linear, low | Media-heavy small businesses, game and software downloads |
| **Cloud-attached CDN** (CloudFront, Cloud CDN, Front Door) | The CDN in front of the same cloud's origin | Free or cheap origin fill; one bill; IAM and logging integrated | Ties the CDN choice to the origin's cloud | The cloud's terms | Usage, with origin egress waived | Workloads already on that cloud |
| **Multi-CDN** | Traffic split across two or more providers by a steering layer | Price leverage, resilience against one provider's outage | Purges, logs and hit ratios per provider; origin load multiplied without a shared shield | Contracts with each | The sum, with lower commitments | Large media and commerce sites |
| **Own delivery network** | Caches in rented colocation and inside access networks | Lowest cost at the very top of traffic; control | Capital, operations and peering work; only pays at huge volume | Owned | Fixed | The largest content companies (Networks, Peering & IP Addresses) |

## My Default

My default for a site or API that serves web content is a flat-rate plan on a large anycast network, chosen for the features on the plan (the WAF, DDoS terms and TLS options) rather than the per-gigabyte price, because at small and medium volume the plan is cheaper than any meter and the bill doesn't depend on traffic I don't control. I'd read the content rule before signing, keep video and large downloads on a product that is priced per unit for them (an object store with a low-cost per-GB CDN in front, or the provider's own media product), and keep DNS and certificates portable so the CDN can change.

The tradeoff that changes this is volume and mix. Once delivery is tens of terabytes a month and dominated by large files, I'd price a low-cost per-GB network and a negotiated contract side by side, with a shared shield in front of the origin so a second CDN doesn't double origin load. For a provider building an edge business, my default is to meter everything internally even on flat-rate plans, so the allowance, the content rule and the margin per plan are all queries, not guesses.

## How to Build It

The chapter adds the `cdn_zones` side table (resources of kind `'cdn_zone'`, already in the core list), `cdn_origins`, `cdn_zone_restrictions` and a dimension match on `skus`, plus the two delivery meters every other Edge chapter rates or annotates. Caching adds policies and purges ([How to Build It](/books/hosting-and-cloud/caching-and-invalidation#how-to-build-it)), TLS adds hostnames, settings and two origin columns ([How to Build It](/books/hosting-and-cloud/tls-and-protocols#how-to-build-it)), DDoS adds attack events and the billing exclusion ([How to Build It](/books/hosting-and-cloud/ddos-mitigation#how-to-build-it)), WAF adds rules and rate limits ([How to Build It](/books/hosting-and-cloud/waf-bots-and-rate-limits#how-to-build-it)), and locations and addresses are [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses#how-to-build-it). A zone is a resource with `region_id` null, because it serves from everywhere; `resources.zone_id` is the failure zone of the core model, which is why every edge foreign key is named `cdn_zone_id`.

```sql
CREATE TABLE cdn_zones (                 -- side table: kind = 'cdn_zone'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  apex             TEXT NOT NULL,         -- A-label, lowercase: 'example.com'
  onboarding       TEXT NOT NULL CHECK (onboarding IN ('full_dns', 'partial_cname',
                     'custom_hostname')),
  dns_zone_id      UUID REFERENCES resources (id),   -- kind = 'dns_zone', for 'full_dns'
  network_tier     TEXT NOT NULL CHECK (network_tier IN ('standard', 'volume',
                     'regional')),         -- which set of locations serves it
  content_class    TEXT NOT NULL DEFAULT 'web' CHECK (content_class IN ('web',
                     'large_files', 'video')),  -- what the plan or contract allows
  activation       TEXT NOT NULL CHECK (activation IN ('pending', 'active', 'moved',
                     'deleted')),          -- the apex points here, or stopped pointing
  activated_at     TIMESTAMPTZ,
  CHECK ((onboarding = 'full_dns') = (dns_zone_id IS NOT NULL)),
  CHECK (activation <> 'active' OR activated_at IS NOT NULL)
);

CREATE TABLE cdn_origins (               -- where misses go, over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  cdn_zone_id        UUID NOT NULL REFERENCES cdn_zones (resource_id),
  name               TEXT NOT NULL,       -- the customer's label: 'app', 'assets'
  address            TEXT NOT NULL,       -- hostname (A-label) or IP literal
  port               INT NOT NULL CHECK (port BETWEEN 1 AND 65535),
  protocol           TEXT NOT NULL CHECK (protocol IN ('http', 'https', 'match_visitor')),
  host_header        TEXT,                -- null: forward the visitor's Host
  origin_resource_id UUID REFERENCES resources (id),  -- a bucket or load balancer here
  fill_billed        BOOLEAN NOT NULL DEFAULT TRUE,   -- false: same-provider fill is free
  role               TEXT NOT NULL DEFAULT 'primary' CHECK (role IN ('primary',
                       'failover')),
  weight             INT CHECK (weight > 0),          -- for load-balanced origin pools
  valid_during       TSTZRANGE NOT NULL,
  created_by         TEXT NOT NULL,       -- typed actor
  CHECK (fill_billed OR origin_resource_id IS NOT NULL),
  EXCLUDE USING GIST (cdn_zone_id WITH =, name WITH =, valid_during WITH &&)
);

CREATE TABLE cdn_zone_restrictions (     -- a limit the provider applied to a zone
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  cdn_zone_id      UUID NOT NULL REFERENCES cdn_zones (resource_id),
  kind             TEXT NOT NULL CHECK (kind IN ('content_class', 'allowance_reached',
                     'region_share', 'abuse')),
  effect           TEXT NOT NULL CHECK (effect IN ('notice_only', 'deprioritized',
                     'fewer_locations', 'content_blocked', 'caching_disabled')),
  terms_ref        TEXT NOT NULL,         -- the clause relied on, e.g. 'ssst-cdn-2026-09-28'
  detail           JSONB NOT NULL DEFAULT '{}',  -- measured share, allowance, file types
  notified_at      TIMESTAMPTZ,           -- the notice the terms promise
  moderation_case_id UUID REFERENCES moderation_cases (id),  -- for kind = 'abuse'
  valid_during     TSTZRANGE NOT NULL,
  created_by       TEXT NOT NULL,
  CHECK (kind <> 'abuse' OR moderation_case_id IS NOT NULL),
  CHECK (kind = 'abuse' OR effect = 'notice_only' OR notified_at IS NOT NULL)
);

ALTER TABLE skus                         -- which usage a SKU rates, by dimension
  ADD COLUMN dimension_match JSONB NOT NULL DEFAULT '{}';  -- {"region_class": "europe"}
```

The delivery meters, `usage_events.meter` values with `resource_id` the `cdn_zone` resource. Each visitor-facing request produces one row per window and dimension combination, and the dimensions are shared with the chapters that annotate them:

| Meter | Unit | Counted when |
| --- | --- | --- |
| `cdn.egress_bytes` | byte | Bytes sent to visitors, headers included, per zone |
| `cdn.requests` | request | Each visitor request answered, whatever the status |

| Dimension | Values | Set from | Used by |
| --- | --- | --- | --- |
| `region_class` | `north_america`, `europe`, `south_america`, `asia`, `japan`, `india`, `oceania`, `middle_east_africa`, `volume_global` | The serving location's pricing region (`edge_locations.price_region`) | This chapter: which SKU rates it |
| `protocol` | `http`, `https` | The visitor connection | This chapter: request prices |
| `http_version` | `1.1`, `2`, `3` | The visitor connection | [TLS & Protocols](/books/hosting-and-cloud/tls-and-protocols#how-to-build-it): adoption |
| `tls_version` | `1.2`, `1.3`, or absent for HTTP | The handshake | TLS & Protocols |
| `cache_status` | `hit`, `miss`, `expired`, `stale`, `revalidated`, `bypass`, `dynamic` | The visitor-facing location's lookup | [Caching & Invalidation](/books/hosting-and-cloud/caching-and-invalidation#how-to-build-it): hit ratios |
| `answered_by` | `edge`, `upper`, `shield`, `origin` | The layer that produced the response | Caching & Invalidation: offload and shield billing |

The meters are prefixed `cdn.` rather than `edge.` because `edge.requests` is already the request meter of edge stores in [Serverless & Edge Databases](/books/hosting-and-cloud/serverless-and-edge-databases#how-to-build-it), and one meter name must mean one thing to rating. Mitigated attack traffic never reaches these meters, and served traffic inside an attack window is capped at a baseline before rating, the rule in [Attack Traffic and the Bill](/books/hosting-and-cloud/ddos-mitigation#attack-traffic-and-the-bill).

SKUs are one per meter and pricing region, with the region in `dimension_match` (the core `skus.region_id` is a cloud region, not a CDN pricing region), and the volume tiers ride on the price version. The tier shape is the Pricing Catalogs chapter's to own; this sketch uses an ordered array of upper bounds in GB with a unit price in minor units per GB:

| SKU code | Meter | `dimension_match` | Unit | Example list price version (CloudFront-like) |
| --- | --- | --- | --- | --- |
| `cdn.egress.north_america` | `cdn.egress_bytes` | `{"region_class": "north_america"}` | GB | 0 to 1,000 free; 8.5 cents to 10,000; 8.0 to 50,000; 6.0 to 150,000; 4.0 to 500,000; 3.0 to 1,024,000; 2.5 to 5,024,000; 2.0 beyond |
| `cdn.egress.india` | `cdn.egress_bytes` | `{"region_class": "india"}` | GB | 0 to 1,000 free; 10.9 cents to 10,000; further tiers |
| `cdn.requests.https.north_america` | `cdn.requests` | `{"region_class": "north_america", "protocol": "https"}` | request | 0.0001 cents (0.0100 dollars per 10,000) |
| `cdn.requests.http.north_america` | `cdn.requests` | `{"region_class": "north_america", "protocol": "http"}` | request | 0.000075 cents |
| `cdn.egress.volume_global` | `cdn.egress_bytes` | `{"region_class": "volume_global"}` | GB | 0.5 cents to 500,000; 0.4 to 1,000,000; 0.2 to 2,000,000 (Bunny-like) |

A price version carrying those tiers:

```sql
INSERT INTO price_versions (sku_id, price_book, currency, unit_price, tiers, valid_during,
                            announced_at)
VALUES ((SELECT id FROM skus WHERE code = 'cdn.egress.north_america'), 'list', 'USD',
        8.5,                             -- the first paid tier, for display
        '[{"up_to": 1000, "unit_price": 0},
          {"up_to": 10000, "unit_price": 8.5},
          {"up_to": 50000, "unit_price": 8.0},
          {"up_to": 150000, "unit_price": 6.0},
          {"up_to": 500000, "unit_price": 4.0},
          {"up_to": 1024000, "unit_price": 3.0},
          {"up_to": 5024000, "unit_price": 2.5},
          {"up_to": null, "unit_price": 2.0}]',
        tstzrange('2026-01-01', NULL), '2025-12-01');
```

Rating a month's egress for one account across the volume tiers, one region class at a time:

```sql
-- Tiered egress for an account ($1) and month ($2) on the list price book.
-- Input is billable usage: the DDoS chapter's attack-window rule has already applied.
WITH monthly AS (
  SELECT u.dimensions ->> 'region_class' AS region_class,
         SUM(u.quantity) / 1e9 AS gb
  FROM usage_events u
  JOIN resources r ON r.id = u.resource_id AND r.kind = 'cdn_zone'
  WHERE u.account_id = $1
    AND u.meter = 'cdn.egress_bytes'
    AND lower(u.occurred_during) <@ $2::tstzrange
  GROUP BY 1
),
price AS (
  SELECT s.id AS sku_id, s.dimension_match ->> 'region_class' AS region_class,
         p.id AS price_version_id, p.tiers
  FROM skus s
  JOIN price_versions p ON p.sku_id = s.id
  WHERE s.meter = 'cdn.egress_bytes'
    AND p.price_book = 'list' AND p.currency = 'USD'
    AND p.valid_during @> lower($2::tstzrange)  -- a mid-month change splits the month
),
tiers AS (
  SELECT pr.sku_id, pr.region_class, pr.price_version_id, e.n,
         COALESCE(LAG((e.t ->> 'up_to')::numeric) OVER w, 0) AS from_gb,
         (e.t ->> 'up_to')::numeric AS to_gb,  -- null: no ceiling
         (e.t ->> 'unit_price')::numeric AS unit_price
  FROM price pr
  CROSS JOIN LATERAL jsonb_array_elements(pr.tiers) WITH ORDINALITY AS e(t, n)
  WINDOW w AS (PARTITION BY pr.sku_id ORDER BY e.n)
)
SELECT t.sku_id, t.price_version_id, m.region_class, t.from_gb, t.to_gb, t.unit_price,
       GREATEST(LEAST(m.gb, COALESCE(t.to_gb, m.gb)) - t.from_gb, 0) AS tier_gb,
       GREATEST(LEAST(m.gb, COALESCE(t.to_gb, m.gb)) - t.from_gb, 0)
         * t.unit_price AS amount_minor           -- unrounded, as rated_usage stores it
FROM monthly m
JOIN tiers t USING (region_class)
ORDER BY m.region_class, t.n;
```

Each output row becomes a `rated_usage` row (or the tiers sum into one per SKU), and the invoice rounds once. Two choices are written into the query and belong on the pricing page: volume is counted per pricing region (a provider that counts it across regions sums before tiering), and it is counted per account, so a customer with many zones reaches the cheaper tiers together.

A flat-rate plan uses the same events and a different plan version. CloudFront's Pro plan, as data:

```sql
INSERT INTO plan_versions (plan_id, version, term_months, currency, renewal_amount,
                           included, overage_mode, valid_during)
VALUES ((SELECT id FROM plans WHERE code = 'cdn.flat.pro'), 1, 1, 'USD', 1500,
        '{"cdn.egress.gb": 50000, "cdn.requests": 10000000}',
        'none',                          -- never billed past the allowance
        tstzrange('2025-11-18', NULL));
```

With `overage_mode` `'none'`, rating still runs: every gigabyte becomes `rated_usage` with `included_quantity` equal to `quantity` and an amount of zero, so margin per plan and allowance use are queries over the same table as metered customers. What happens at the allowance is enforcement, not billing: the usage query below drives the 50%, 80% and 100% notices, and crossing 100% writes a `cdn_zone_restrictions` row of kind `'allowance_reached'` with the effect the terms promise (`'deprioritized'` or `'fewer_locations'`), never an invoice line.

```sql
-- Allowance use this month for every zone on a flat-rate plan with no overage.
SELECT r.id AS cdn_zone_id, s.id AS subscription_id,
       SUM(u.quantity) FILTER (WHERE u.meter = 'cdn.egress_bytes') / 1e9
         / NULLIF((pv.included ->> 'cdn.egress.gb')::numeric, 0) AS egress_share,
       SUM(u.quantity) FILTER (WHERE u.meter = 'cdn.requests')
         / NULLIF((pv.included ->> 'cdn.requests')::numeric, 0) AS request_share
FROM resources r
JOIN subscriptions s ON s.id = r.subscription_id AND s.status = 'active'
JOIN plan_versions pv ON pv.id = s.plan_version_id AND pv.overage_mode = 'none'
JOIN usage_events u ON u.resource_id = r.id
                   AND lower(u.occurred_during) >= date_trunc('month', NOW())
WHERE r.kind = 'cdn_zone'
GROUP BY r.id, s.id, pv.included;
```

Notes on the sketch:

- **The zone is a resource; the hostnames are identifiers.** The apex and every hostname the zone serves are `resource_identifiers` rows (kind `'hostname'`), so abuse reports, takedowns and law enforcement lookups find a zone the same way they find a server. TLS & Protocols' `edge_hostnames` hangs off them.
- **Onboarding is a contract, not a setting.** `'full_dns'` means the provider is authoritative for the zone (a `dns_zone` resource); `'partial_cname'` means the customer points names at the provider; `'custom_hostname'` is a SaaS platform's customer domain. Abuse handling, activation checks and what "moved" means differ for each.
- **Origins are effective-dated.** An origin change is the second most common cause of an outage after a TLS change, and "which origin did the zone use at 14:02" must have an answer. TLS & Protocols adds the certificate and SNI names to the same rows by `ALTER`.
- **Free fill is a property of the origin.** `fill_billed` is false only when the origin is a resource on the provider's own platform, which is how CloudFront's and Azure's free origin fill is rated: `cache.fill_bytes` from such an origin produces no billable quantity.
- **Restrictions are rows with a clause and a notice.** A content-class limit, a reached allowance, a regional-share breach (Fastly's 10% clause) or an abuse action is a dated `cdn_zone_restrictions` row naming the terms relied on and the notice given, so "why did my site slow down" and "why was my video blocked" have answers a support agent can read.
- **Pricing regions come from locations.** The meter records the serving location's `price_region`, not the visitor's country, so a rate card change is a change to `edge_locations` and price versions, never to the meter.
- **Events:** `cdn_zone.activated`, `cdn_zone.moved`, `cdn_origin.changed`, `cdn_zone.restricted`, `cdn_zone.restriction_lifted` and `cdn_zone.allowance_notice` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to provisioning, billing, notifications and the abuse desk.

## Auditing

- **Every zone's onboarding and activation.** When the apex started and stopped pointing at the provider, by which method, and which DNS zone or hostname proved it.
- **Origins over time.** Address, protocol, host header and fill billing for each origin as it was at any moment, with who changed it.
- **Restrictions against the terms.** Each content, allowance or regional limit with the clause relied on, the measurement that triggered it and the notice sent, reproducible for a customer dispute or a regulator.
- **Rated delivery from events.** Tiered egress and requests per pricing region recomputable from `usage_events`, price versions and the DDoS exclusion, so a disputed bill is rerun, not argued.
- **Customer metrics from billing records.** Paying, large-customer and retention counts computed by written definition from invoices and `rated_usage`, the control Cloudflare's 2022 restatement shows is needed.

## What This Means for the System You Build

- **Meter everything internally,** even on flat-rate plans, so margin per plan and allowance use are queries.
- **Price by serving region and volume tier,** count volume per account, and say on the pricing page how tiers aggregate.
- **Write the content rule with the price.** An unmetered plan needs a stated limit on what may be served and a recorded, noticed enforcement path.
- **Decide what happens at the allowance** (bill, degrade, restrict or cut off) and make it an `overage_mode`, not a support call.
- **Treat free fill as an origin property** and rate it from the same events as paid fill.
- **Exclude attack traffic before rating,** and keep the exclusion reproducible.
- **Define customer metrics as queries** over billing records, with thresholds and exclusions written down.

## References

**Filings**

- [Cloudflare: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm), revenue, net losses, paying and large customers, net retention, international share, concentration, sales channels, free plans and the 2022 customer-count error
- [Cloudflare: Q4 2025 earnings call transcript](https://cloudflare.net/files/doc_financials/2025/q4/CORRECTED-TRANSCRIPT-Cloudflare-Inc-NET-US-Q4-2025-Earnings-Call-10-February-2026-5-00-PM-ET.pdf), the $100,000 threshold and large customers' 73% share of Q4 revenue
- [Akamai: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1086222/000108622226000022/akam-20251231.htm), revenue by solution category, one reportable segment, delivery repricing at renewal, concentration and SLAs
- [Fastly: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1517413/000151741326000053/fsly-20251231.htm), revenue lines, customers, enterprise share, top 10 concentration, retention, gross margin, one-year contracts, low commitments and no overage on packages
- [Akamai: Prospectus (Form 424B1), October 1999](https://www.sec.gov/Archives/edgar/data/0001086222/000095013599004929/0000950135-99-004929.txt), IPO shares and price, revenue on content delivered, servers, countries and networks
- [Fastly: Prospectus (Form 424B4), May 2019](https://www.sec.gov/Archives/edgar/data/1517413/000119312519150526/d702138d424b4.htm), incorporation in March 2011 as SkyCache, Inc.
- [Edgio: Chapter 11 press release (Form 8-K exhibit), 9 Sep 2024](https://www.sec.gov/Archives/edgar/data/1391127/000119312524215572/d795614dex991.htm), the filing, the court, the credit bid and DIP financing
- [Edgio: Edgecast completion press release (Form 8-K exhibit), 16 Jun 2022](https://www.sec.gov/Archives/edgar/data/1391127/000119312522175232/d339796dex991.htm), the rebrand and colocation and peering synergies

**History**

- [Akamai: Company history](https://www.akamai.com/company/company-history), incorporation on 20 Aug 1998 and commercial launch in April 1999
- [AWS: Announcing Amazon CloudFront](https://aws.amazon.com/about-aws/whats-new/2008/11/18/whats-new-cloudfront/), public beta on 18 Nov 2008 with no commitments
- [Cloudflare: Launches at TechCrunch Disrupt](https://www.cloudflare.com/press/press-releases/2010/cloudflare-launches-at-techcrunch-disrupt/), public beta on 27 Sep 2010, free core service and $20 add-ons
- [Google Cloud CDN: Release notes](https://docs.cloud.google.com/cdn/docs/release-notes), alpha, beta and general availability dates
- [Bunny: About](https://bunny.net/about/), the October 2015 beta
- [Fastly: Prices initial public offering](https://www.fastly.com/press/press-releases/fastly-prices-initial-public-offering), 16 May 2019 pricing and NYSE listing
- [Cloudflare: Announces pricing of initial public offering](https://www.cloudflare.com/press/press-releases/2019/cloudflare-announces-pricing-of-initial-public-offering/), 12 Sep 2019 pricing and NYSE listing
- [Akamai: Completes acquisition of select assets of Edgio](https://akamai.com/newsroom/press-release/akamai-completes-acquisition-of-select-assets-of-edgio), 13 Dec 2024, contracts and patent licenses, network excluded, court approval

**Terms**

- [Cloudflare: Updated terms of service](https://blog.cloudflare.com/updated-tos/), 16 May 2023, the CDN-specific restriction and the end of the HTML construct
- [Cloudflare: Service-Specific Terms for Application Services](https://www.cloudflare.com/service-specific-terms-application-services/), updated 28 Sep 2026, video and large files on the CDN

**Pricing**

- [Cloudflare: Network and CDN plans](https://www.cloudflare.com/plans/network-cdn.md), plan prices and unmetered DDoS
- [AWS: CloudFront pricing](https://aws.amazon.com/cloudfront/pricing/), flat-rate plans, allowances and features
- [AWS: CloudFront pay-as-you-go pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/), regional and volume tiers, request prices, the free tier, Origin Shield, free AWS origin fetch and the Security Savings Bundle
- [AWS: Introducing flat-rate pricing plans with no overages](https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-flat-rate-pricing-plans-with-no-overages), 18 Nov 2025, alerts, reduced performance and attacks not counted
- [Fastly: Pricing](https://www.fastly.com/pricing), packages, free allowances, regional bandwidth and request prices, and package traffic limits
- [Google Cloud CDN pricing](https://cloud.google.com/cdn/pricing), North America cache egress, cache fill and lookups (viewed 27 Oct 2026)
- [Azure: Front Door pricing](https://azure.microsoft.com/en-us/pricing/details/frontdoor/), base fees, transfer, requests and origin transfer
- [Bunny: CDN pricing](https://bunny.net/pricing/cdn/), standard and volume network prices, PoP counts, no request fees, minimum and trial
- [Cloudflare: Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), the $5 monthly minimum

**Network**

- [AWS: CloudFront features](https://aws.amazon.com/cloudfront/features/), the 750-plus POPs used in the volume comparison
