+++
title = "Egress & Switching"
description = "What providers charge to move data out, the 2024 exit waivers, multicloud transfer at cost, and the EU Data Act's switching rules and charge phase-out."
category = "Hosting & Cloud Industry"
order = 2203
part = "Market Rules and Compliance"
tags = ["egress", "data-transfer", "switching", "eu-data-act", "pricing"]
+++

Data leaving a hyperscaler for the internet is metered by the gigabyte beyond a small allowance, with discounts by volume. Competition regulators in the UK and the EU have treated the charge as a barrier to leaving, or to using two clouds at once. Between January 2024 and September 2025 the three largest clouds introduced free transfer for customers leaving, then free or at-cost transfer for customers using another cloud in parallel, and the EU Data Act turned the direction into law: switching charges in the EU must fall to cost and then, from January 12, 2027, to zero.

This chapter covers egress pricing across providers, the exit waivers and their conditions, the multicloud transfer programs, and the Data Act's switching chapter. It adds `egress_waivers` and `switching_requests` to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), where egress is already the `egress.bytes` meter on `usage_events`. The competition cases that pushed the changes are [Competition Cases](/books/hosting-and-cloud/competition-cases); licensing, the other switching cost regulators named, is [Licensing Disputes](/books/hosting-and-cloud/licensing-disputes); leaving because the provider ended the product is [Migrations, Shutdowns & End of Life](/books/hosting-and-cloud/migrations-and-end-of-life#data-export-and-getting-out). Prices and terms are as of October 2026.

## How the Providers Do It

| Provider | Internet egress, first paid tier | Included | Source |
| --- | --- | --- | --- |
| **AWS** | Tiered by volume and region | 100 GB per month free, aggregated across services and regions (except China and GovCloud); CloudFront adds 1 TB per month free | EC2 pricing; CloudFront pricing |
| **Azure** | $0.087 per GB from North America and Europe, 100 GB to 10 TB per month, Microsoft premium network routing | First 100 GB per month | Bandwidth pricing |
| **Oracle Cloud** | Not shown here | 10 TB per month of outbound data as part of Always Free | Free Tier docs |
| **CloudFront** | $0.085 per GB for the next 9 TB (US, Europe) | 1 TB per month always free | CloudFront pricing |
| **Hetzner Cloud** | €1.00 per additional TB in EU-Central and US locations, €7.40 in Singapore, excluding VAT | At least 20 TB per server in the EU, 1 TB in the US, 0.5 TB in Singapore | Cloud plan page |
| **DigitalOcean** | $0.01 per GiB over the allowance | Per-plan allowance, pooled across all Droplets on the team | Bandwidth docs |
| **Fly.io** | $0.02 per GB in North America and Europe, $0.04 Asia-Pacific and South America, $0.12 Africa and India | | Pricing docs |
| **Railway** | $0.05 per GB | | Pricing docs |
| **Cloudflare R2** | None: "There are no charges for egress bandwidth for any storage class" | Storage is $0.015 per GB-month on Standard | R2 pricing |

Three models sit in the table. **Metered from the first gigabyte past a small allowance** (the hyperscalers and the PaaS platforms built on them). **A large allowance bundled into the server price,** with cheap overage (Hetzner, DigitalOcean, Oracle's free tier). **No egress charge,** with the cost recovered in storage or request prices (R2). AWS says in its exit waiver post that "over 90% of customers" pay nothing for data transfer out because of the free allowance, which is another way of saying the charge falls on the minority with real volume, the ones for whom leaving is a project.

## How It Got Here

- **January 11, 2024:** the EU Data Act's reduced-switching-charge period began, and Google Cloud announced free egress for customers leaving.
- **March 2024:** AWS (March 5) and Azure (March 13) followed with exit waivers on request.
- **July 31, 2025:** the UK CMA's final decision included an appendix on egress fees.
- **August and September 2025:** Azure documented at-cost multicloud transfer and Google launched Data Transfer Essentials (September 10) for EU and UK customers.
- **September 12, 2025:** the Data Act began to apply.
- **March 31 and May 1, 2026:** the CMA reported voluntary egress steps, and Azure extended its exit waiver for UK customers.
- **January 12, 2027:** switching charges in the EU fall to zero.

## Exit Waivers, 2024

| Provider | Announced | Conditions as published |
| --- | --- | --- |
| **Google Cloud** | January 11, 2024 | Free network data transfer for customers leaving Google Cloud for another provider or on premises, worldwide; the post argues licensing is the bigger barrier |
| **AWS** | March 5, 2024 (updated September 30, 2025 and October 8, 2026) | Request through Support; approved requests receive credits; the account needn't close, but all data must move off AWS from all eligible accounts (or all data of a particular service); 180 days to complete outside the EU; repeat requests get scrutiny; EU and UK customers are governed by an EU Data Act Addendum and a UK Customer Switching and Portability Addendum |
| **Azure** | March 13, 2024 | The announcement: contact Azure Support, and the credit is applied once the transfer is complete and all Azure subscriptions on the account are cancelled; it states no time window. The current Microsoft Learn page adds the details: a support request with the subscription or enrollment ID, planned start date and estimated volume; 60 days from the stated start date (more can be asked for in the request); the credit covers at most 60 calendar days of egress charges; ExpressRoute, VPN, Front Door and CDN are excluded. From May 1, 2026, UK billing addresses moving data from UK datacenters get 180 days, may cover single services, and include Microsoft Global Network routing |

The three waivers differ in the one condition that matters: whether the customer has to leave entirely. Azure's requires cancelling every subscription (except the UK variant, which allows single services); AWS's requires moving all data, or all of one service's data, without closing the account; Google's covers any departure. None of them covers using two clouds at once, which is what regulators were most concerned about, and all of them are credits after the fact, so the customer still has to ask and wait.

The best-documented use is 37signals' move off S3. DHH wrote on March 26, 2025 that "a free 60-day egress window" made moving almost 6 PB out of S3 cost nothing; The Register (May 9, 2025) put the waived egress at about $250,000 and quoted him that "we'll be able to delete our entire AWS account this summer." [Leaving: Egress, Commitments and Licenses](/books/hosting-and-cloud/repatriation#leaving-egress-commitments-and-licenses) owns the rest of that case.

## Multicloud Transfer, 2025

The EU Data Act's switching chapter applies to data transferred to another provider in parallel, not only on exit, and the providers' 2025 programs for EU and UK customers follow it:

- **Google Cloud Data Transfer Essentials** (September 10, 2025): EU and UK customers opt in and designate traffic between Google Cloud and another provider, for the same organization; that traffic is metered separately at zero charge. Google notes the Act would have allowed at-cost charging.
- **Azure at-cost multicloud transfer** (documentation dated August 25, 2025, updated May 2026): for EEA, EFTA and UK billing addresses, excluding customers storing customer data outside those areas; for in-parallel interoperable use where the same organization processes the data at the destination, with CDN out of scope; internet egress over the transit ISP routing preference rather than Microsoft's premium network, except that UK billing addresses transferring from UK datacenters also get at-cost transfer over the Microsoft Global Network. The customer files a support request with the subscription ID, the destination endpoint's ASN and an estimated share of traffic (1% to 100%) per endpoint; Azure validates it and refunds on the next bill and automatically afterward. Partners can request on behalf of CSP customers.
- **AWS:** reduced rates for eligible EU use cases were reported in the press; no AWS page describing them was found.

## The EU Data Act

Regulation (EU) 2023/2854 applies from September 12, 2025 (Article 50). Chapter VI (Articles 23 to 31) governs switching between data processing services:

- **Contract terms (Article 25).** The contract must set a maximum notice period for starting the switch, which "shall not exceed two months"; a transitional period, after notice, of at most 30 calendar days to complete the switch, which the customer may extend once; and "a minimum period for data retrieval of at least 30 calendar days, starting after the termination." If 30 days is technically unfeasible, the provider must say so within 14 working days and propose an alternative of no more than seven months.
- **Charges (Article 29).** From January 11, 2024 to January 12, 2027 a provider "may impose reduced switching charges" that "shall not exceed the costs incurred by the provider ... directly linked to the switching process." From January 12, 2027 providers "shall not impose any switching charges." Standard fees and penalties must be disclosed before the contract.
- **Interoperability (Articles 34 and 35).** Article 34 covers interoperability for in-parallel use of services, the basis for the multicloud programs above; Article 35 covers interoperability of data processing services generally.
- **Exemptions (Article 31).** Services "of which the majority of main features has been custom-built" for one customer and not offered at broad commercial scale are exempt from the charge and some other provisions; and the chapter doesn't apply to services "provided as a non-production version for testing and evaluation purposes and for a limited period of time."

The effect on billing is concrete. From January 12, 2027, a provider serving EU customers can't charge egress for data moved as part of a switch, so it must be able to tell switching egress apart from ordinary egress, on the customer's request, with the notice, transitional and retrieval clocks the contract states.

## The Alternatives

| Pricing model | Strengths | Failure modes | Who uses it |
| --- | --- | --- | --- |
| **Metered egress, small allowance** | Charges the heavy users; recovers transit cost | Lock-in; regulator attention; bill shock on viral traffic | AWS, Azure, Google Cloud, PaaS platforms |
| **Large allowance bundled per server** | Predictable; cheap overage | Abuse of unmetered bandwidth; allowance unused by most | Hetzner, DigitalOcean, Oracle's free tier |
| **Zero egress, priced elsewhere** | Removes the switching cost and the bill shock | Storage and request prices carry the cost; abuse controls needed | Cloudflare R2 |
| **Exit waiver by request** | Answers the lock-in complaint without changing prices | Requires leaving; credits after the fact; scrutiny of repeats | AWS, Azure, Google Cloud (2024) |
| **Multicloud at zero or cost** | Meets the Data Act for in-parallel use | Needs classification of traffic by destination and purpose | Google, Azure (2025) |

## My Default

My default for a new provider is a generous allowance per resource or account, with a low published overage, and no switching charges anywhere, not only in the EU: a customer who asks to leave gets the notice, transitional and retrieval periods the Data Act sets and free egress for the data it takes, without having to close its account first. It costs little (most customers never exceed the allowance, as AWS's own figure suggests), it removes a regulatory risk that only grows, and it makes the provider's lock-in argument the quality of the service rather than the price of the door. Classifying egress by destination is still worth building, because the Data Act's in-parallel rules, at-cost programs and abuse controls all need it.

What would change this: a provider whose margins depend on bandwidth-heavy customers (video, downloads) may need metered egress to stay solvent, and should then make the exit waiver automatic and the overage price easy to find.

## How to Build It

Egress is already rated from `usage_events` with meter `egress.bytes` and dimensions for region and destination. This chapter adds the switching request (the Data Act's clocks) and the waiver that zeroes or credits egress for it, and a destination class on egress events so switching and in-parallel traffic can be told apart.

```sql
CREATE TABLE switching_requests (        -- a customer's notice to switch or leave
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  kind                TEXT NOT NULL CHECK (kind IN ('exit', 'switch_to_provider',
                        'in_parallel', 'on_premises')),
  scope_products      TEXT[],            -- null: everything; else product codes
  destination         TEXT,              -- the receiving provider or 'on_premises'
  regime              TEXT NOT NULL CHECK (regime IN ('eu_data_act', 'uk_addendum',
                        'provider_policy')),
  notice_received_at  TIMESTAMPTZ NOT NULL,
  notice_period_ends  TIMESTAMPTZ NOT NULL,  -- at most two months under the Data Act
  transitional_period TSTZRANGE,         -- 30 days, extendable once; or the agreed alternative
  retrieval_ends_at   TIMESTAMPTZ,       -- at least 30 days after termination
  alternative_period_reason TEXT,        -- why 30 days was infeasible, sent within 14 working days
  status              TEXT NOT NULL CHECK (status IN ('received', 'in_transition',
                        'completed', 'withdrawn')),
  CHECK (regime <> 'eu_data_act'
         OR notice_period_ends <= notice_received_at + INTERVAL '2 months')
);

CREATE TABLE egress_waivers (            -- egress zeroed or credited for a switch
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  switching_request_id UUID REFERENCES switching_requests (id),
  mechanism           TEXT NOT NULL CHECK (mechanism IN ('rated_at_zero', 'rated_at_cost',
                        'credit_after_completion')),
  applies_during      TSTZRANGE NOT NULL,  -- the window egress is covered
  destinations        TEXT[],            -- ASNs or endpoints, for in-parallel programs
  estimated_bytes     NUMERIC,
  credit_grant_id     UUID REFERENCES credit_grants (id),  -- kind = 'migration'
  approved_by         TEXT NOT NULL,     -- typed actor
  approved_at         TIMESTAMPTZ NOT NULL
);

-- Egress events carry what the waiver needs to match them.
-- usage_events.dimensions for meter 'egress.bytes': {"region": "...", "destination_asn": 64500,
--   "destination_class": "internet" | "other_cloud" | "same_org_other_cloud" | "cdn"}
```

Rating applies the waiver before the price: egress inside a waiver's window, to its destinations, rates at zero (or at cost under a cost price book), and a credit-after-completion waiver issues a `credit_grants` row of kind `migration` once the request completes.

```sql
-- Egress in the last closed month that a waiver should have covered but was rated at list.
SELECT u.account_id, sum(u.quantity) AS bytes
FROM usage_events u
JOIN egress_waivers w ON w.account_id = u.account_id
 AND w.applies_during && u.occurred_during
 AND w.mechanism = 'rated_at_zero'
JOIN rated_usage ru ON ru.account_id = u.account_id
 AND ru.rated_during && u.occurred_during
 AND ru.amount > 0
WHERE u.meter = 'egress.bytes'
  AND (w.destinations IS NULL OR u.dimensions->>'destination_asn' = ANY (w.destinations))
  AND u.occurred_during && tstzrange(date_trunc('month', now()) - INTERVAL '1 month',
                                     date_trunc('month', now()))
GROUP BY u.account_id;
```

Notes on the sketch:

- **The clocks are the contract.** Notice, transitional and retrieval periods are computed at receipt from the regime and stored ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)); the two-month notice cap is a constraint.
- **Termination waits for retrieval.** The account's deletion clock ([Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing)) can't start before `retrieval_ends_at`.
- **Destination is a dimension.** Without the destination's ASN and class on egress events, neither a Data Act switch nor an at-cost program can be rated correctly.
- **From January 12, 2027, EU switching egress rates at zero.** The rule is a waiver created automatically for every `eu_data_act` request, not a support ticket.
- **Events:** `switching_request.received`, `switching_request.alternative_period_sent`, `egress_waiver.approved` and `switching_request.completed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing, support and the account lifecycle.

## Auditing

- **Every switching request with its clocks,** and when each was met, because the Data Act states them as maximums and minimums.
- **Egress rated during each waiver window,** and the credits issued, so a customer or regulator can see the switch cost what the law allows.
- **Pre-contract disclosures** of switching fees and penalties, by contract version.
- **Repeat waiver requests** and the decisions on them, where the provider's policy scrutinizes repeats.

## What This Means for the System You Build

- **Publish egress prices and allowances** where customers compare them, and keep inbound free.
- **Tag egress with destination class and ASN** so switching and in-parallel traffic can be rated differently.
- **Implement the Data Act's switching clocks** (two-month notice, 30-day transition, 30-day retrieval) as computed deadlines.
- **Zero switching charges for the EU from January 12, 2027,** and charge only direct costs before that.
- **Don't make leaving require closing the account,** or the waiver won't serve in-parallel use.
- **Hold deletion until the retrieval window ends.**

## References

**Pricing**

- [AWS: EC2 On-Demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/), the 100 GB monthly free allowance and its aggregation
- [AWS: CloudFront pay-as-you-go pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/), 1 TB free and the next-9-TB rate
- [Azure: Bandwidth pricing](https://azure.microsoft.com/en-us/pricing/details/bandwidth/), the first 100 GB and the $0.087 tier
- [Oracle: Always Free resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm), 10 TB of outbound data per month
- [Hetzner: Cloud servers](https://www.hetzner.com/cloud/regular-performance/), included traffic by location and the overage price
- [DigitalOcean: Bandwidth billing](https://docs.digitalocean.com/platform/billing/bandwidth/), pooled allowance and $0.01 per GiB
- [Fly.io: Pricing](https://docs.fly.io/about/pricing), egress by region
- [Railway: Pricing plans](https://docs.railway.com/reference/pricing/plans), egress per GB
- [Cloudflare: R2 pricing](https://developers.cloudflare.com/r2/pricing/), no egress charges and Standard storage price

**Waivers and multicloud programs**

- [Google Cloud: Eliminating data transfer fees when migrating off Google Cloud](https://cloud.google.com/blog/products/networking/eliminating-data-transfer-fees-when-migrating-off-google-cloud), January 11, 2024
- [AWS News Blog: Free data transfer out to internet when moving out of AWS](https://aws.amazon.com/blogs/aws/free-data-transfer-out-to-internet-when-moving-out-of-aws/), March 5, 2024 and its updates, conditions, the EU and UK addenda and the "over 90%" figure
- [Microsoft Learn: Cancel your Azure subscription](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/cancel-azure-subscription), free egress when leaving, the 60-day transfer window and credit cap, exclusions and the UK variant (page dated June 7, 2026)
- [Azure Updates: Free data transfer out to internet when leaving Azure](http://web.archive.org/web/20240402023357/https://azure.microsoft.com/en-us/updates/now-available-free-data-transfer-out-to-internet-when-leaving-azure/), Wayback snapshot of the March 13, 2024 announcement: credit after the transfer completes and all subscriptions are cancelled, no window stated
- [Google Cloud: Data Transfer Essentials](https://cloud.google.com/blog/products/networking/new-for-the-uk-and-eu-no-cost-multicloud-data-transfer-essentials), September 10, 2025
- [Microsoft Learn: Data transfer fees for in-parallel use](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/data-transfer-fees), eligibility, routing, the UK carve-out and the request process
- [Datacenter Dynamics: Google axes some data transfer costs](https://www.datacenterdynamics.com/en/news/google-axes-some-data-transfer-costs-in-preparation-for-eu-data-act/), the press report of AWS reduced EU rates

**The EU Data Act (Regulation (EU) 2023/2854, EUR-Lex Official Journal text)**

- [Article 25](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R2854#art_25), notice, transitional and retrieval periods and the alternative period
- [Article 29](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R2854#art_29), reduced switching charges to January 12, 2027 and none after
- [Article 31](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R2854#art_31), custom-built and testing exemptions
- [Article 34](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R2854#art_34), interoperability for in-parallel use
- [Article 35](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R2854#art_35), interoperability of data processing services
- [Article 50](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R2854#art_50), application from September 12, 2025

**In practice**

- [DHH: It's five grand a day to miss our S3 exit](https://world.hey.com/dhh/it-s-five-grand-a-day-to-miss-our-s3-exit-b8293563), March 26, 2025, the free 60-day egress window
- [The Register: 37signals cloud repatriation](https://www.theregister.com/2025/05/09/37signals_cloud_repatriation_storage_savings), May 9, 2025, the waived egress estimate
