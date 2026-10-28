+++
title = "The Provider Landscape"
description = "Hyperscalers, developer clouds, European providers, PaaS, web hosts, registrars, edge networks and CPaaS: who sells what, who resells whom, and what to build."
category = "Hosting & Cloud Industry"
order = 2102
part = "The Business"
tags = ["hosting", "cloud", "market", "vendors", "build-vs-buy"]
+++

The market for rented infrastructure looks like a few giants and a long tail, and both halves are true. Four hyperscalers report cloud revenue in the tens of billions of dollars a year; a few dozen public companies run developer clouds, edge networks, registries, web hosting and communications platforms in the hundreds of millions to a few billion; thousands of private hosts, registrars, resellers and agencies sit on top of all of them. What makes the landscape hard to read is that the segments are stacked, not side by side. A frontend cloud runs on a hyperscaler's regions; a web host runs on a cloud or in leased colocation; a registrar sells names a registry owns; a texting platform carries messages over carriers it pays per message. Every provider is somebody else's customer, and the layer underneath shows through in its prices, its outages and its terms.

This chapter maps the segments with audited figures where they exist, labels company-reported figures where they don't, shows who resells whom, and ends with what a provider should build, buy or rent. The core data model it feeds is in [The Hosting & Cloud Business](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model); the eras that produced these segments are in [From Bare Metal to Cloud: The Timeline](/books/hosting-and-cloud/bare-metal-to-cloud).

## How the Providers Do It

| Segment | Who | What they sell | How they report |
| --- | --- | --- | --- |
| **Hyperscalers** | AWS, Microsoft Azure, Google Cloud, Oracle Cloud Infrastructure | Every layer from bare metal to managed AI, in dozens of regions, metered by the second and the request | Segment revenue and (except Oracle) operating income in 10-Ks; remaining performance obligations for committed capacity |
| **Developer clouds** | DigitalOcean, Akamai (Linode), Vultr, Hetzner, OVHcloud | VMs, managed Kubernetes and databases, object storage, at simpler prices | ARR, net dollar retention and spend-band cohorts (DigitalOcean); a cloud computing line inside a security and delivery company (Akamai) |
| **European providers** | OVHcloud, Hetzner, IONOS, plus the hyperscalers' sovereign offerings | Dedicated servers, public and private cloud, hosting, with EU residency as a selling point | Results releases on EU exchanges; Hetzner is private |
| **PaaS and frontend clouds** | Vercel, Netlify, Heroku, Render, Fly.io, Railway, Cloudflare Workers | Deploys from git, functions, managed runtimes, metered on CPU, memory and requests | Mostly private; Heroku sits inside Salesforce |
| **Web hosts** | GoDaddy, Newfold (Bluehost, HostGator, Network Solutions), Hostinger, IONOS, SiteGround, DreamHost, WP Engine | Shared, VPS and managed WordPress hosting bundled with domains, email and site builders | GoDaddy and IONOS file; the rest are private |
| **Registries and registrars** | Verisign and the other TLD operators; GoDaddy, Cloudflare Registrar, Tucows and thousands of others | Domain names by the year, DNS, privacy and protection add-ons | Verisign and GoDaddy file; ICANN publishes accreditation and compliance data |
| **Certificate authorities** | Let's Encrypt (a nonprofit), Sectigo, DigiCert and others | Domain-validated certificates free or bundled; organization and extended validation sold | Let's Encrypt publishes issuance counts |
| **Edge networks** | Cloudflare, Akamai, Fastly, Amazon CloudFront, Bunny | Caching, TLS, DDoS mitigation, WAF and bots, edge compute | Cloudflare, Akamai and Fastly file |
| **Colocation and interconnection** | Equinix and the other data center operators | Space, power, cross-connects and interconnection to the providers above | Equinix files |
| **Communications platforms** | Twilio, Bandwidth, Sinch, Vonage, Telnyx, Plivo, Infobip; email senders Amazon SES, SendGrid, Mailgun, Postmark | Numbers, texts, calls and email by the unit, with carrier fees passed through | Twilio and Bandwidth file; Sinch reports in Stockholm |

## Hyperscalers

Four companies run the largest public clouds, and their filings give the only audited view of the market's scale:

| Provider | Revenue | Operating income | Period |
| --- | --- | --- | --- |
| AWS | $128.7 billion | $45.6 billion | 2025 (2024: $107.6 billion, $39.8 billion) |
| Microsoft Intelligent Cloud | $137.8 billion | $57.0 billion | Fiscal year to June 30, 2026 (prior year: $106.3 billion, $44.6 billion) |
| Google Cloud | $58.7 billion | $13.9 billion | 2025 (2024: $43.2 billion, $6.1 billion) |
| Oracle cloud infrastructure | $18.1 billion | Not reported separately | Fiscal year to May 31, 2026 (prior year: $10.2 billion) |

The rows aren't the same thing. AWS and Google Cloud are segments that are mostly the cloud; Microsoft's Intelligent Cloud segment includes server products and support alongside Azure, and the 10-K gives Azure's growth ("Azure and other cloud services revenue grew 41%") but not its revenue. Oracle reports cloud infrastructure revenue but no separate profit, and its fiscal 2026 10-K puts remaining performance obligations at $638 billion, against $138 billion a year earlier. The headline metric for the largest capacity deals is now contracted backlog rather than usage.

What they share: they own or lease the buildings, design much of their own hardware, run dozens of regions each split into zones, sell hundreds of services through one account and one bill, and discount through commitments rather than list prices. Everything later in this volume about cells, quotas, commitments, marketplaces and egress is drawn mostly from their documentation, because they publish the most of it.

## Developer Clouds

A tier of providers sells the same building blocks (VMs, block and object storage, managed Kubernetes and databases) with fewer services, simpler pricing and a self-serve customer base. DigitalOcean's 2025 10-K is the most detailed public view: $901.4 million revenue, ARR of $970 million (defined as the most recent quarter's revenue times four), net dollar retention averaged from monthly rates at 100% for 2025, pricing it calls "primarily consumption-based", and promotional, referral and grant credits that typically expire in two months or less. Akamai, whose 10-K describes its acquisition of Linode, reports a cloud computing line of $708.1 million in 2025, next to $2.24 billion of security and $1.26 billion of delivery revenue: a developer cloud inside an edge company. Vultr and Hetzner are private.

The developer clouds' unit metrics are the ones a smaller provider can benchmark against, and their risk factors read like this volume's later parts: fraud, abuse, price pressure from hyperscalers, and dependence on leased data center space, and [Operating Metrics](/books/hosting-and-cloud/operating-metrics) collects their definitions.

## European Providers

Europe's independent providers compete on price, dedicated hardware and jurisdiction. OVHcloud's results release for the fiscal year to August 31, 2025 reports €1,084.6 million revenue: €671.6 million Private Cloud (dedicated servers and hosted private cloud, 62%), €219.2 million Public Cloud and €193.8 million Web Cloud (hosting and domains). IONOS reports €1,316.9 million revenue for 2025 and 6.63 million customers, across web presence, productivity and cloud. Hetzner is privately held and publishes no results. The hyperscalers answer the residency question with sovereign offerings run by separate European entities, which the Market Rules and Compliance part covers.

## PaaS and Frontend Clouds

Platforms that take code from git and run it sell convenience on top of someone else's capacity, and their documentation shows it. Vercel lists 19 compute regions whose codes map to AWS region names (`iad1` is `us-east-1`, `fra1` is `eu-central-1`), and its functions default to `iad1`. Heroku's region API maps its Frankfurt region to AWS's `eu-central-1`. Railway is the counterexample: its "Railway Metal" platform runs on hardware it owns, and its FAQ says it is migrating completely off Google Cloud.

Two lifecycle facts belong on the map. Heroku announced on February 6, 2026 that it is "transitioning to a sustaining engineering model focused on stability, security, reliability, and support," and no longer offers Enterprise Account contracts to new customers, though existing ones are honored and can renew. And these platforms meter differently from the clouds beneath them: CPU time rather than wall-clock time on Cloudflare Workers, credit allowances that pause projects when they run out on Netlify. [PaaS & Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds) covers what they resell and how they meter.

## Web Hosts

Web hosting is the oldest consumer segment and the most consolidated. GoDaddy is the only large pure-play that files: $4.95 billion revenue in 2025, 20.4 million customers, about 81 million domains under management (about 21% of roughly 387 million worldwide, by its count), subscription revenue recognized ratably over terms of up to ten years, and customer retention of about 85% a year. Newfold Digital, backed by Clearlake Capital and Siris Capital, names Bluehost, Crazy Domains, HostGator, Network Solutions, Yoast and YITH among its brands and says it serves nearly 7 million customers; it closed the sale of its Markmonitor brand-protection business to Com Laude on December 31, 2025. Hostinger reports, in an unaudited company release, €275.4 million revenue for 2025, up 51%, and 4.6 million customers. SiteGround says it runs on Google Cloud. WP Engine's Global Edge Security add-on delivers "several features powered by Cloudflare": WAF, DDoS mitigation, CDN and certificates.

The segment's shape (introductory prices on long prepaid terms, bundled domains and email, software licensed per account from control panel vendors) is the subject of the Web Hosting part.

## Registries and Registrars

A registry operates a top-level domain; a registrar sells names in it under an ICANN accreditation; a reseller sells under the registrar's. Verisign runs .com and .net: $1.66 billion revenue in 2025 and 173.5 million names at year end, with the .com wholesale fee raised from $9.59 to $10.26 on September 1, 2024, and $0.2575 per .com registration-year paid to ICANN. Registrars pay the registry fee plus ICANN's $0.20 per gTLD name-year and add their margin; GoDaddy's 10-K states both fees. Cloudflare Registrar sells at "at or below what registries and ICANN charge us," with no markup, as a feature of its other products. Across all TLDs, Verisign's industry brief counts 401.6 million registrations at the end of the second quarter of 2026. The Domains and DNS part covers the contracts and the fee stack.

## Edge Networks

Edge networks sell the path between the origin and the visitor. Their 2025 filings: Akamai $4.21 billion revenue, now mostly security; Cloudflare $2.17 billion and about 332,000 paying customers, with free plans as an acquisition channel and 4,298 customers paying over $100,000 a year producing 73% of fourth-quarter revenue; Fastly $624.0 million and 628 enterprise customers. Amazon CloudFront and Bunny sell delivery by the gigabyte. The Edge part covers caching, TLS, DDoS, WAF and bots, and the business itself.

## Colocation and Interconnection

Under everyone who doesn't own buildings sits a data center operator. Equinix reports $9.22 billion revenue for 2025 from 280 data centers in 77 markets in 36 countries. Colocation operators sell space, power and cross-connects; their interconnection business (cables between customers in the same building, and on-ramps to the clouds) is what lets a host, a CDN and a cloud exchange traffic without the public internet. [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation) covers how colo is sold.

## Communications Platforms

Communications platforms rent numbers and carry messages and calls over carriers. Twilio is the largest that files: $5.07 billion revenue in 2025, 74% usage-based, over 402,000 active customer accounts, and a 10-K that explains how passing carrier fees through raises revenue and cost of revenue without changing gross profit. Bandwidth is the owned-network model: it is authorized as a competitive local exchange carrier in 49 states and the District of Columbia, and reported $753.8 million revenue in 2025, $192.4 million of it messaging surcharges. Sinch, listed in Stockholm, reports SEK 27,080 million net sales for 2025 and more than 190,000 customers. Vonage is part of Ericsson, which wrote off SEK 32 billion, half the goodwill and intangibles attributed to it, in October 2023; Telnyx, Plivo and Infobip are private. Email sending (Amazon SES, Twilio SendGrid, Mailgun, Postmark, Resend) is the same business on a different network. The Communications Platforms part covers owned network versus aggregator.

## Who Resells Whom

Almost every provider resells a layer, and the dependency is visible from outside:

| Provider | Underlay | What shows through |
| --- | --- | --- |
| Vercel | AWS regions (region codes map to AWS names) | AWS's us-east-1 outage on October 19 and 20, 2025 caused two incidents at Vercel: static file serving failures peaking around 22% of traffic, and a feature-flag provider outage that took down its dashboard, APIs and builds |
| Heroku | AWS regions | Region choice is AWS's; platform roadmap is Salesforce's |
| SiteGround | Google Cloud | Capacity and network are Google's |
| WP Engine (Global Edge Security) | Cloudflare | WAF, DDoS and CDN behavior are Cloudflare's |
| Railway | Its own hardware, after leaving Google Cloud | The reverse move: owning the layer to control cost |
| Every registrar | The registry and ICANN | Wholesale price increases and policy changes |
| Every CPaaS | Mobile and wireline carriers | Carrier fees, throughput limits, filtering and fines |
| Azure VM Image Builder | HashiCorp Packer | Microsoft says the service "is built on HashiCorp Packer" |
| Web hosts | Control panel and operating system licensors | Per-account license fees ([Control Panel Licensing & the Alternatives](/books/hosting-and-cloud/control-panel-licensing)) |

The October 2025 AWS event is the clearest public example of the underlay showing through. AWS's summary says DynamoDB DNS failures began at 11:48 PM PDT on October 19 when a latent race condition in DynamoDB's DNS management left the regional endpoint with an empty record, and the event ended at 2:20 PM PDT on October 20; a provider with no AWS account of its own could still have been down, because its PaaS was. [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages) covers the pattern.

Three rules follow for a provider that sits on someone else's layer. Pass the underlay's fees through as their own lines when the contract allows, so a price change upstream doesn't silently eat margin (the core model's `skus.pass_through`). Record the underlay on every region and product (`regions.underlay`), because a status page, an incident report and a data residency answer all need it. And read the underlay's terms as your own: its acceptable use policy, its suspension clauses and its egress prices bind your customers whether your terms repeat them or not.

## Build, Buy or Rent

Every provider decides, layer by layer, whether to build it, license it or rent it from another provider. The answers I'd give a new provider, from the facts in this volume:

| Layer | Build | Buy or license | Rent | My default |
| --- | --- | --- | --- | --- |
| Buildings and power | Hyperscalers | | Colocation (Equinix and peers) | Rent colocation until utilization and scale justify owning; most providers never cross that line |
| Servers and hypervisor | Hyperscalers design their own | Commodity servers, KVM (part of Linux), VMware (licensed from Broadcom) | Bare metal from a cloud or host | KVM on owned or leased servers; avoid a hypervisor license that can change price under you ([Licensing Disputes](/books/hosting-and-cloud/licensing-disputes)) |
| Compute platform | Clouds and developer clouds | Kubernetes distributions, OpenStack | A hyperscaler, for a PaaS | Rent the hyperscaler while the product is unproven, with a cost model that shows when to leave (Repatriation) |
| Control panel | Large hosts | cPanel, Plesk, DirectAdmin | | License a panel to launch, and build when per-account fees exceed a team's cost |
| Billing and rating | Every provider eventually | Usage billing products | | Build the core model in this volume; buy tax calculation and payments |
| Payments | | Processors and gateways | | Buy ([Payments](/books/payments/payments-landscape)) |
| Domains | Registries | Registrar accreditation from ICANN | Reseller of an accredited registrar | Resell until volume justifies accreditation and its compliance load |
| Certificates | CAs | Commercial CAs for OV and EV | | Let's Encrypt or another free ACME CA for DV, automated, with a second CA ready |
| Edge | Large CDNs | | Cloudflare, Fastly, Akamai, CloudFront, Bunny | Rent, and keep DNS and certificates portable so the CDN can change |
| Messaging and voice | Carriers and owned-network CPaaS | CLEC authorization | A CPaaS | Rent a CPaaS, register as an ISV, and pass carrier fees through |
| Abuse handling | Every provider | Reputation feeds, scanners | | Build the desk on the [UGP abuse desks](/books/user-generated-platforms/abuse-desks#how-to-build-it) model; buy feeds |

What would change these answers: a workload steady enough that renting costs more than owning plus a team (the public repatriation cases are storage-heavy and steady), a regulatory requirement for residency or sovereignty the underlay can't meet, or a supplier that changes its terms in a way the provider can't pass on. The last one is the one providers underrate: a license, a registry price or a carrier fee is a dependency with its own roadmap.

## How to Build It

The landscape adds no tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model); it fills two columns the core defines and gives them a query:

- **`regions.underlay`** names the cloud, colocation operator or customer site a region runs on, so status, incident and residency answers can be generated. A PaaS region `iad1` records `aws:us-east-1`.
- **`skus.pass_through`** marks registry, ICANN, carrier, license, regulatory and marketplace-vendor fees, so the provider's own revenue and margin are separable.

```sql
-- Revenue that is the provider's own versus collected for the layer below, by month.
SELECT date_trunc('month', lower(il.service_period)) AS month,
       COALESCE(s.pass_through, 'own')               AS owner,
       i.currency,
       SUM(il.amount)                                AS amount
FROM invoice_lines il
JOIN invoices i ON i.id = il.invoice_id
LEFT JOIN skus s ON s.id = il.sku_id
WHERE i.status <> 'void'
GROUP BY 1, 2, 3
ORDER BY 1, 2;

-- Which customers depend on an underlay region, for an incident notice.
SELECT DISTINCT r.account_id
FROM resources r
JOIN regions g ON g.id = r.region_id
WHERE g.underlay = 'aws:us-east-1'
  AND r.state IN ('active', 'stopped')
  AND upper_inf(r.exists_during);
```

## What This Means for the System You Build

- **Know your layer and the one beneath it,** and record the underlay on every region and product.
- **Benchmark against filers,** and label private companies' self-reported figures as such.
- **Pass underlay fees through as their own SKUs** where your terms allow, so upstream price changes reach the invoice.
- **Plan for the underlay's outages** in your status page, your SLA and your incident notices, because your customers see your name.
- **Read your suppliers' terms as yours:** their AUPs, suspension rights, licenses and egress prices bind your customers.
- **Decide build, buy or rent per layer,** with the condition that would change the answer written down.

## References

**Filings and results**

- [Amazon: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), AWS segment net sales and operating income
- [Microsoft: Form 10-K for fiscal year 2026](https://www.sec.gov/Archives/edgar/data/789019/000119312526323660/msft-20260630.htm), Intelligent Cloud revenue and operating income, Azure growth
- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), Google Cloud revenues and operating income
- [Oracle: Form 10-K for fiscal year 2026](https://www.sec.gov/Archives/edgar/data/1341439/000119312526277521/orcl-20260531.htm), cloud infrastructure revenue and remaining performance obligations
- [DigitalOcean: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1582961/000158296126000019/docn-20251231.htm), revenue, ARR, NDR, consumption-based pricing, credit expiry
- [Akamai: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1086222/000108622226000022/akam-20251231.htm), revenue by security, delivery and cloud computing
- [Cloudflare: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm), revenue and paying customers
- [Cloudflare: Q4 2025 earnings call transcript](https://cloudflare.net/files/doc_financials/2025/q4/CORRECTED-TRANSCRIPT-Cloudflare-Inc-NET-US-Q4-2025-Earnings-Call-10-February-2026-5-00-PM-ET.pdf), large customers and their share of revenue
- [Fastly: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1517413/000151741326000053/fsly-20251231.htm), revenue and enterprise customers
- [Equinix: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1101239/000110123926000032/eqix-20251231.htm), revenue, data centers and markets
- [GoDaddy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), revenue, customers, domains under management, retention, registry and ICANN fees
- [VeriSign: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1014473/000101447326000006/vrsn-20251231.htm), revenue, the .com and .net base, the .com fee and ICANN's per-registration fee
- [Twilio: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1447669/000144766926000021/twlo-20251231.htm), revenue, usage-based share, active accounts, fee pass-through
- [Bandwidth: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1514416/000151441626000017/band-20251231.htm), revenue, messaging surcharges, CLEC authorization
- [OVHcloud: FY2025 financial results](https://corporate.ovhcloud.com/en/newsroom/news/financial-results-fy25), revenue by Private Cloud, Public Cloud and Web Cloud
- [IONOS: FY2025 results](https://www.ionos-group.com/investor-relations/publications/announcements/ionos-reports-successful-2025-fiscal-year-profitability-at-record-levels.html), revenue and customers
- [Sinch: Fourth quarter and full year 2025 results](https://www.group.sinch.com/media/press-releases-and-news/2026/sinch-reports-fourth-quarter-and-full-year-2025-results--strengthened-financial-performance-and-continued-market-leadership/), net sales and customers
- [Ericsson: Impairment charge of SEK 32 billion](https://www.ericsson.com/en/press-releases/2023/10/ericsson-announces-impairment-charge-of-sek-32-billion-and-provides-update-on-q3-earnings), the Vonage impairment
- [Hostinger: 2025 results](https://www.hostinger.com/blog/?p=8625), company-reported revenue and customers (unaudited)
- [Clearlake: Newfold Digital completes sale of Markmonitor to Com Laude](https://clearlake.com/news/newfold-digital-completes-sale-of-markmonitor-to-com-laude/), owners, brands, customer count and the December 31, 2025 sale

**Provider documentation**

- [Vercel: Global network and regions](https://vercel.com/docs/regions), 19 compute regions mapped to AWS region names, iad1 as the default
- [Vercel: Update regarding Vercel service disruption on October 20, 2025](https://vercel.com/blog/update-regarding-vercel-service-disruption-on-october-20-2025), the two incidents caused by AWS us-east-1
- [Heroku Dev Center: Regions](https://devcenter.heroku.com/articles/regions), Heroku regions mapped to AWS regions
- [Heroku: An update on Heroku](https://www.heroku.com/blog/an-update-on-heroku/), the sustaining engineering model and Enterprise contracts (February 6, 2026)
- [Railway: Railway Metal](https://docs.railway.com/platform/railway-metal), owned hardware and the move off Google Cloud
- [SiteGround: Google Cloud hosting](https://www.siteground.com/google-cloud-hosting.htm), SiteGround on Google Cloud
- [WP Engine: Global Edge Security](https://wpengine.com/support/ges/), features powered by Cloudflare
- [Microsoft Learn: Azure VM Image Builder overview](https://learn.microsoft.com/en-us/azure/virtual-machines/image-builder-overview), built on HashiCorp Packer
- [Cloudflare: Registrar](https://www.cloudflare.com/products/registrar/), prices at or below registry and ICANN fees
- [Cloudflare: Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), billing on CPU time
- [Netlify: Resume paused projects](https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/), projects paused when credits run out
- [AWS: Summary of the Amazon DynamoDB service disruption in us-east-1](https://aws.amazon.com/message/101925/), the October 19 and 20, 2025 event and its cause

**Reference**

- [Verisign: Domain Name Industry Brief, Q2 2026](https://blog.verisign.com/domain-names/q2-2026-domain-name-industry-brief-quarterly-report/), registrations across all TLDs
