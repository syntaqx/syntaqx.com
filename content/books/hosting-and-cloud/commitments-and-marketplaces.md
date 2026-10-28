+++
title = "Commitments, Discounts & Marketplaces"
nav_title = "Commitments & Marketplaces"
description = "Reserved capacity, savings plans and committed use discounts, spend commitments and shortfalls, spot, GPU reservations, and marketplaces with private offers."
category = "Hosting & Cloud Industry"
order = 2192
part = "Metering and Billing"
tags = ["commitments", "savings-plans", "spot", "marketplaces", "billing"]
+++

List price is what a cloud charges the customer who promises nothing. Everyone else pays less in exchange for a promise: to run a specific machine for a year, to spend a dollar amount every hour for three years, to spend a total over a contract, or to accept that the machine can be taken back with two minutes' notice. Each promise is a different discount mechanism with a different failure mode. A reserved instance is wasted if the workload moves to another instance family; an hourly commitment is lost each hour it isn't used; a spend commitment that falls short is invoiced anyway; spot capacity disappears exactly when everyone else needs it. And since 2012, the same commitments can be spent on other companies' software through the provider's marketplace, so a cloud's discount contract also steers which vendors its customers buy from.

This chapter covers both halves: how commitments and discounts are applied to rated usage, and how marketplaces sell third-party software on the provider's bill and against the provider's commitments. It traces each mechanism from its launch, compares them across AWS, Azure, Google Cloud, DigitalOcean, Fly.io and the GPU clouds, works an hour of usage through a savings plan at real prices, covers the UK CMA's finding on committed spend, and adds `commitment_drawdowns`, `marketplace_listings`, `marketplace_orders` and `private_offers` to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Commitment benefits are step 4 of [the bill pipeline](/books/hosting-and-cloud/metering-and-rating#the-bill-pipeline), after allowances and before credits.

## How the Providers Do It

| Provider | Discount mechanisms, as of October 2026 | Terms that matter |
| --- | --- | --- |
| **AWS** | Reserved Instances (since 2009); Savings Plans (since 2019): a dollar-per-hour commitment for one or three years, Compute and EC2 Instance plans, up to 72% off; Spot Instances; EC2 Capacity Blocks for GPU reservations; negotiated private pricing for large accounts | Savings Plans apply after Reserved Instances, EC2 Instance plans before Compute plans, highest savings percentage first; "Each hour's commitment can only be used within that hour and cannot be carried over" |
| **Azure** | Reservations for one or three years, up to 72% off; savings plan for compute and for databases, an hourly commitment for one or three years; Spot VMs; on-demand capacity reservations; the Microsoft Azure Consumption Commitment (MACC) | Savings plan discounts apply each hour "starting with the usage that receives the highest discount"; unused hourly commitment "expires and does not roll over"; savings plans can't be cancelled or refunded; reservations can be refunded up to $50,000 in a rolling 12 months |
| **Google Cloud** | Sustained use discounts, automatic, up to 30%; spend-based committed use discounts (hourly committed spend, or Flexible Savings Plans over a monthly window) and resource-based commitments (Compute Engine vCPUs, memory, GPUs, local SSD); Spot VMs | Spend-based CUDs apply across projects of a billing account; resource-based ones are bought in a project and can be shared; SUDs don't apply to usage already covered by CUDs |
| **DigitalOcean** | Committed contracts with a minimum spend for larger customers; reserved GPU Droplets on a 12-month contract (H100 $3.26 a GPU-hour against $4.41 on demand); spot GPU Droplets that can be reclaimed at any time | Spot pricing is locked at creation |
| **Fly.io** | Reservation blocks: a year paid up front for a monthly CPU credit, 40% off (Shared Machines: $36 a year for $5 a month of credit) | Credits apply only to CPU and RAM, per CPU class and region, and don't roll over |
| **GPU reservations** | AWS Capacity Blocks (up to six months, booked up to eight weeks ahead, paid up front, dynamic prices); Google Dynamic Workload Scheduler Calendar mode (up to 90 days); Azure on-demand capacity reservations (pay-as-you-go rate, used or not) | Capacity is the product; the discount, if any, is secondary |

Three patterns run through the table:

- **The industry moved from the machine to the dollar.** Reserved instances commit to a specific resource; savings plans and spend-based CUDs commit to an hourly dollar amount that floats across families, regions and services. The customer gives up some discount for flexibility, and the provider gets a promise of spend it can plan capacity against without dictating the shape.
- **Everything is applied per hour, highest discount first.** AWS and Azure document the same evaluation: in each hour, the commitment is spent on the eligible usage with the highest savings percentage first, until the hourly amount is used, with the remainder at on-demand rates and unused commitment lost. Google's standard spend-based CUDs use an hourly entitlement window too; only its Flexible Savings Plans measure over a month.
- **Big contracts are a total and a shortfall.** At enterprise scale the commitment is a spend total over years, with milestones and a shortfall charge if it isn't met. Microsoft publishes how MACC works; AWS's equivalent private pricing terms are negotiated and not public, so this chapter states the practice without figures.

## How It Got Here

- **March 12, 2009: EC2 Reserved Instances.** A one-time fee to reserve an instance type in an Availability Zone for one or three years, then a lower hourly rate: against $0.10 an hour on demand for a Small instance, $325 a year up front plus $0.03 an hour. AWS described the fee as "somewhat akin to acquiring hardware" and promised the launch "is guaranteed to succeed." The reservation was capacity and discount in one.
- **December 13, 2009: EC2 Spot Instances.** Customers bid a maximum hourly price; EC2 set a Spot Price per instance type from open bids and spare capacity, billed everyone at that price "regardless of the actual bid," and terminated instances whose bids fell below it. Spare capacity became a market.
- **April 19, 2012: AWS Marketplace.** An online store for preconfigured software, paid hourly or monthly, whose "charges appear on the same bill as a customer's other AWS services." Third-party software joined the cloud bill.
- **April 4, 2014: Google's sustained use discounts.** An automatic discount for resources used more than a quarter of the month, rising with each incremental hour; today's documentation caps it at a 30% net discount for a full month on eligible machine types (20% on others), with no upfront fee or commitment. It was a discount for behavior rather than for a promise.
- **May 18, 2015: Google preemptible VMs.** Up to 70% off at a fixed price, a 24-hour maximum runtime and a 30-second shutdown notice. Google chose a fixed discount over a market; its Spot VMs, "the latest version of preemptible VMs," now carry prices up to 91% off that change at most once a day and no maximum runtime.
- **November 16, 2017: Azure Reserved VM Instances.** One- or three-year reservations with up to 72% savings, generally available worldwide.
- **November 6, 2019: AWS Savings Plans.** A dollar-per-hour commitment for one or three years: Compute Savings Plans across instance families, Regions, operating systems, Fargate and Lambda (up to 66% at launch), and EC2 Instance Savings Plans for one family in one Region (up to 72%). Commitment detached from a specific machine.
- **October 2022: Azure savings plan for compute.** Announced in Microsoft's October 26, 2022 cost management update: a fixed hourly spend for one or three years, up to 65% off, across VMs, App Service, Functions premium, Container Instances and Dedicated Hosts.
- **January 5, 2024: AWS Marketplace listing fees.** The current fee schedule: 3% for public SaaS offers, 20% for server products, private offers tiered by contract value from 3% down to 1.5%.
- **April 21, 2025: Google's Vendor Net Revenue Schedule.** Google Cloud Marketplace vendors keep 97% to 98.5% by deal type and contract value.
- **July 31, 2025: the CMA's final decision.** Committed spend agreements are widespread and influence workload allocation but, "in their current form and application," don't harm competition.

## Resource and Spend Commitments

Every commitment is one of three shapes, which map to `commitments.kind` in the core model:

| Shape | What is promised | Examples | How it is applied | What is lost if unused |
| --- | --- | --- | --- | --- |
| **Resource** (`resource`) | A quantity of a specific resource in a place for a term | AWS Reserved Instances, Azure reservations, Google resource-based CUDs, DigitalOcean reserved GPU Droplets, GPU capacity reservations | Matching usage in each hour is priced at the commitment rate | The reserved quantity's hours, billed whether used or not |
| **Hourly spend** (`hourly_spend`) | A dollar amount per hour for a term | AWS Savings Plans, Azure savings plans, Google spend-based CUDs | Each hour, eligible usage priced at commitment rates, highest discount first, until the hourly amount is consumed | The unused part of each hour's commitment |
| **Total spend** (`spend`) | A dollar total over a term, sometimes with milestones | MACC, negotiated private pricing, DigitalOcean committed contracts | Eligible invoiced spend decrements the total; the discount is usually a negotiated rate on everything | The shortfall at the end date or milestone, invoiced |

Two of Google's details show why the shape matters. Spend-based CUDs "apply to eligible usage in any projects that the Cloud Billing account pays for," while resource-based commitments are bought "in the context of an individual project" and shared across the billing account only if CUD sharing is enabled. And sustained use discounts arrive "in the form of monthly credits" that can't be used beyond the month, and don't apply to usage already covered by a commitment. A rating engine therefore needs the commitment's scope (account, organization or project), its evaluation window (hour or month), and an order across stacked benefits.

AWS documents the order: Reserved Instances first, then EC2 Instance Savings Plans "because Compute Savings Plans have broader applicability," and within a consolidated billing family, the owner account's usage first when sharing is enabled. The general rule is narrowest benefit first, so a flexible commitment isn't spent on usage a specific one would have covered.

## Enterprise Commitments and Shortfalls

At enterprise scale, the commitment is a contract total. Microsoft documents MACC in detail:

- A MACC is "a contractual agreement in which your organization commits to a specified level of Azure spending over a defined period," tracked by start and end dates, remaining balance and eligible spend, with statuses Active, Complete, Expired and Canceled. Each decrement is a `SettledCharges` event tied to an invoice.
- **Milestones** are optional intermediate targets with a due date and amount. A missed milestone or a missed total triggers "a shortfall charge" for the remainder, which "takes the form of an Azure prepayment credit." Billing account admins get alerts 90, 60 and 30 days before the end date or a milestone.
- **What counts.** Eligible Azure services and eligible Marketplace offers decrement it; consumption covered by Microsoft-issued credits doesn't, nor does consumption covered by Azure prepayment, although the prepayment purchase itself does. And "consumption charges covered by shortfall credits don't accrue toward your MACC."

The shortfall-as-prepayment design is worth copying: the customer pays the shortfall, but gets it back as credit to spend, so the provider collects the committed revenue and the customer isn't charged for nothing. In this model, a shortfall is an invoice line of kind `commitment_shortfall` and a `credit_grants` row of kind `commitment_shortfall`, and the grant's usage is excluded from the commitment it settled.

AWS's negotiated private pricing agreements and Google's enterprise commitments are private contracts; their discount rates, minimums and shortfall terms aren't published. The practice is the same: a total spend commitment over one or more years in exchange for a discount on eligible usage, with eligible marketplace purchases counting toward it. DigitalOcean's 10-K describes the developer-cloud version: larger customers "opting to enter into committed contracts, committing to a minimum spend on our platform."

## Spot and Interruptible Capacity

Spot capacity is the provider selling its idle buffer with a recall clause. The mechanisms have converged:

| Provider | Discount | Notice | Price behavior | Guarantees |
| --- | --- | --- | --- | --- |
| **AWS Spot** | Steep, variable | Two minutes, as an EventBridge event and in instance metadata; none for hibernation, which begins immediately | Set by EC2 from supply and demand; an optional maximum price makes interruptions more frequent | Interrupted for capacity, price above the maximum, or group constraints; terminate, stop or hibernate |
| **Google Spot VMs** | Up to 91% off | Configurable 0 (default) or 120 seconds, then a best-effort 30-second shutdown | Changes at most once a day | No minimum or maximum runtime |
| **Azure Spot VMs** | Variable | Up to 30 seconds through Scheduled Events, best effort | Variable; a maximum price of `-1` means never evicted for price and never charged above standard | "There's no SLA for these VMs"; eviction deallocates (default) or deletes |
| **DigitalOcean spot GPU Droplets** | Listed per GPU | Reclaimable at any time | Locked at creation | None |

For the billing system, spot is a purchase option on the resource (`virtual_machines.purchase_option = 'spot'` in the core model) rated against a spot price version, plus an interruption event that ends the resource's billing (in clusters, node autoscalers buy and replace it: [Spot Capacity in Clusters](/books/hosting-and-cloud/autoscaling-and-cost#spot-capacity-in-clusters)). The interruption record matters later: a customer disputing an interrupted batch job, or a capacity planner measuring how much buffer was sold, needs the reason and the notice given. Spot is also the one product with no SLA anywhere, which [SLAs & Service Credits](/books/hosting-and-cloud/slas-and-service-credits#exclusions-and-sole-remedy) treats as an exclusion.

## GPU Capacity Reservations

For GPUs the scarce thing is capacity, so the reservation products sell certainty first and discount second:

- **AWS EC2 Capacity Blocks for ML** reserve 1 to 64 instances (up to 512 GPUs or 1,024 Trainium chips) for up to six months, booked up to eight weeks ahead, in instance families from P4d to P6e-GB200 and Trn1 and Trn2. Prices "are dynamic and change based on available supply and demand," the fee is "charged up front at the time you schedule the reservation," and the reservation keeps the price in effect at purchase. As of October 2026 in US East (N. Virginia), a p5.48xlarge (8 H100s) is $47.757 an instance-hour ($5.970 per GPU-hour) and a p6-b200.48xlarge (8 B200s) $113.666 ($14.208), with the next scheduled update in January 2027.
- **Azure on-demand capacity reservations** reserve a VM size in a region or zone for any duration, billed at the VM's pay-as-you-go rate whether used or not, with Reserved Instances and savings plans applying on top and a capacity SLA with service credits. The large training sizes (ND-series and NCads H100 v5) aren't supported.
- **Google's Dynamic Workload Scheduler Calendar mode** reserves capacity for up to 90 days, viewable up to 60 days ahead for GPUs, with at least 87 hours of lead time; charges begin when the request is fulfilled at its start time.
- **DigitalOcean** sells reserved GPU capacity on 12-month contracts and bills GPU Droplets per second with a five-minute minimum.

A capacity reservation is a `commitments` row of kind `resource` with the reserved quantity, place and term, and a prepaid or hourly fee; [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#buying-capacity) covers the products, and this chapter the billing: a reservation produces usage for every reserved unit-hour, matched first by running instances and billed as unused for the rest, exactly as Azure describes its own.

## Marketplaces

A cloud marketplace lets a software vendor sell to the provider's customers on the provider's bill. The provider collects, takes a listing fee, and pays the vendor; the customer gets one invoice, one procurement relationship, and, often, credit toward its commitment.

| Marketplace | Fees to the vendor, as of October 2026 | Counts toward the provider's commitments |
| --- | --- | --- |
| **AWS Marketplace** | Public offers: SaaS 3%, server products (machine images, containers, machine learning) 20%, AWS Data Exchange 3%. Private offers by total contract value: under $1 million 3%, $1 million to under $10 million 2%, $10 million or more 1.5%, all renewals 1.5%. Channel partner private offers add 0.5%. Professional services 0.5%, 0% in qualifying multi-product offers. A 1% regional fee for buyers in South Korea from April 1, 2025. Fees apply to pre-tax total contract value | Qualifying purchases under negotiated private pricing, by contract |
| **Google Cloud Marketplace** | The vendor keeps 97% of standard offers and of new private offers under $1 million, 98% from $1 million to under $10 million, and 98.5% at $10 million or more and for channel shifts, migrations and native renewals (schedule effective April 21, 2025) | Google says buyers "can draw down from existing committed spend" |
| **Microsoft Marketplace** | Not covered here | Offers badged "Azure benefit eligible" count toward MACC at "100% of the pretax purchase amount," if bought through the Azure portal on a subscription tied to the agreement; credit-card purchases on the marketplace site and purchases paid with Azure prepayment don't count, nor do licenses used outside Azure |

Three mechanics matter for the billing system:

- **The vendor's charge is a pass-through line.** A marketplace line is the vendor's revenue collected by the provider, which is why the core model has `skus.pass_through = 'marketplace_vendor'`. The provider's revenue is the listing fee, not the line, and the two must be separable on every margin report, the same rule as for carrier and registry fees.
- **Marketplace charges escape the provider's own credits and caps.** AWS's and DigitalOcean's promotional credits exclude marketplace purchases; Azure's spending limit can't stop some external services published in the Azure Marketplace, which "can incur separate charges even when your spending limit is set." A billing system that treats marketplace lines like first-party usage will apply credits it shouldn't and promise caps it can't keep ([Free Tiers, Credits & Startup Programs](/books/hosting-and-cloud/free-tiers-and-credits#spending-limits-the-hard-cap)).
- **Commitment drawdown is the selling point.** A customer with an unmet commitment can buy a vendor's software and retire commitment at the same time. For the vendor that is a reason to list despite the fee; for the provider, every third-party purchase on its marketplace is spend that stays on its bill.

### Private offers and channel partners

A private offer is a negotiated price and contract terms for one buyer. On AWS, the seller creates it for up to 25 designated accounts; accepting it creates an agreement; renewals and upgrades are new private offers that replace the old terms "without any break in software service"; at expiry the buyer either moves to public pricing or loses the subscription; and the charges appear "like any other AWS Marketplace product" on the monthly bill. Payment schedules, custom terms and third-party financing ride on the offer.

A channel partner private offer adds a reseller between vendor and buyer: the vendor offers a discounted price to the partner, the partner marks it up to the customer, and AWS charges the vendor a 0.5% uplift on the listing fee, calculated on the price offered to the partner. In this model the partner is a reseller account ([Resellers and White Label](/books/hosting-and-cloud/accounts-and-resellers#resellers-and-white-label)), the offer records it, and the order carries both prices so the vendor's payout, the partner's margin and the provider's fee each reconcile.

## The CMA and Committed Spend

The UK Competition and Markets Authority's cloud services market investigation (referred October 5, 2023; provisional decision January 28, 2025; final decision July 31, 2025) studied committed spend agreements alongside egress fees and licensing. Its summary concludes: "Use of committed spend agreements by providers is widespread, and these can influence customers' choices in relation to workload allocation. But providers can profitably compete against these and, accordingly, in their current form and application, they do not harm competition in cloud services markets."

The appendices show what made the question close. Customer research found some customers using services "for the sole purpose of meeting committed spend targets" and migrating more workloads than they otherwise would. AWS's committed spend contracts ranged in length from 0 to 2 years up to 6 to 8 years and Microsoft's up to 8 to 10, and the CMA noted that even short contracts can act like long ones if renewed back to back. The FTC's 2023 request for information recorded the same argument from commenters, that minimum spend contracts "incentivize customers to consolidate their use of cloud services to just one cloud provider." [Competition Cases](/books/hosting-and-cloud/competition-cases#the-uk-market-investigation-to-sms) follows the regulators; the investor-tied credit version of the argument is in [Investor credits and lock-in](/books/hosting-and-cloud/free-tiers-and-credits#investor-credits-and-lock-in).

For the billing system, the finding sets a bar for transparency rather than a rule: a customer should always be able to see eligible spend, remaining commitment, milestone dates and projected shortfall, because a commitment the customer can't track is one it fills with spend it doesn't need.

## Applying a Savings Plan: a Worked Hour

AWS's rule is that in each hour, the commitment applies to eligible usage "starting with the highest discount percentage," equal percentages broken by the lowest Savings Plans rate, until the commitment is exhausted, with "any remaining usage ... charged at the On-Demand rates." Take a one-year, no-upfront Compute Savings Plan with a $1.00 an hour commitment and one hour of Linux usage in US East (N. Virginia), at AWS list prices as of October 2026:

| Usage in the hour | On-demand rate | Savings Plan rate | Discount | On-demand cost | Cost at plan rate |
| --- | --- | --- | --- | --- | --- |
| 4 c7i.xlarge | $0.1785 | $0.12899 | 27.7% | $0.71400 | $0.51596 |
| 3 r7i.large | $0.1323 | $0.09585 | 27.6% | $0.39690 | $0.28755 |
| 4 m7i.large | $0.1008 | $0.07406 | 26.5% | $0.40320 | $0.29624 |
| **Total** | | | | **$1.51410** | **$1.09975** |

The plan is applied in discount order:

1. c7i.xlarge (27.7%): all 4 instance-hours covered, $0.51596 of commitment used, $0.48404 left.
2. r7i.large (27.6%): all 3 covered, $0.28755 used, $0.19649 left.
3. m7i.large (26.5%): $0.19649 covers 0.19649 / 0.07406 = 2.6531 instance-hours; the commitment is exhausted.
4. The remaining 1.3469 m7i.large instance-hours bill at on-demand: 1.3469 x $0.1008 = $0.13577.

The hour costs $1.00 of commitment plus $0.13577 on demand, $1.13577 against $1.51410 at list: a saving of $0.37833, 25.0%. Had the usage been only the four m7i.large instances, the hour would still cost $1.00, $0.70376 of it unused commitment, against $0.40320 on demand: a commitment sized above the baseline costs more than no commitment at all. Over a year the plan is a promise of $8,760, whatever runs.

The order matters even when the total doesn't change much: applying the commitment to the lowest-discount usage first would leave higher-discount usage at on-demand rates and cost the customer more for the same commitment. A provider that documents an order has to implement exactly that order, because customers check.

## The Alternatives

| Model | Strengths | Failure modes | Cost | Who uses it |
| --- | --- | --- | --- | --- |
| **Resource reservations** | Deepest discounts; can carry a capacity guarantee | Stranded when the workload changes family, size or region; exchange and refund limits | Prepaid or monthly for the term | AWS RIs, Azure reservations, Google resource CUDs, DigitalOcean reserved GPUs |
| **Hourly spend commitments** | Flexible across families, regions and services | Unused commitment lost every hour; oversizing costs more than on demand | Hourly, for one or three years | AWS Savings Plans, Azure savings plans, Google spend-based CUDs |
| **Total spend commitments** | One number to negotiate; marketplace counts; discount on everything | Shortfall charges; customers buy to fill the commitment; the CMA's concern | Contract total with milestones | MACC, private pricing agreements, DigitalOcean committed contracts |
| **Automatic usage discounts** | No promise, no forecasting | Smaller discount; no capacity planning value to the provider | None | Google sustained use discounts |
| **Interruptible capacity** | Largest discounts, no term | Interrupted when capacity is scarce; no SLA | None | AWS Spot, Google Spot VMs, Azure Spot, DigitalOcean spot GPUs |
| **Prepaid monthly credit blocks** | Simple to explain, small customers can use it | Doesn't roll over; per class and region | Annual prepayment | Fly.io reservation blocks |

## My Default

My default for a provider building this is an hourly spend commitment, scoped to the account with optional organization sharing, evaluated per hour highest discount first, with the rates stored as a price book so the discount for every SKU is a price version like any other. It is the shape customers understand best, it survives instance-family changes, and it is the one AWS and Azure both document closely enough to benchmark against. I'd add resource reservations only where capacity itself is the product (GPUs, dedicated hosts), and total spend commitments only for contracts large enough to negotiate, with the shortfall paid as prepayment credit rather than as a penalty, milestones visible in the console, and marketplace eligibility explicit per listing.

What would change it: a provider with no idle buffer to sell shouldn't offer spot at all, and one whose customers are mostly small should offer an automatic discount (sustained use or a prepaid credit block like Fly.io's) rather than ask them to forecast. A marketplace makes sense only once there are enough customers with commitments to make drawdown worth a vendor's fee.

## How to Build It

The chapter fixes the shape of `commitments.discount_terms` and adds drawdowns, marketplace listings, private offers and orders to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Commitment rates are a price book: a savings plan's rate for each SKU is a `price_versions` row in the plan's book, so commitment rating uses the same effective-dated catalog as list rating ([Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs#price-shapes)).

```sql
-- commitments.discount_terms, by kind:
--   resource:     {"sku_code": "vm.p5-48xlarge.hour", "quantity": 8, "region": "us-east-1",
--                  "price_book": "capacity_block_2026_10", "capacity_guaranteed": true}
--   hourly_spend: {"price_book": "compute_sp_1y_no_upfront", "scope": "account",
--                  "window": "hour", "order": "highest_discount_first",
--                  "eligible_products": ["compute", "containers", "functions"]}
--   spend:        {"discount_pct": 0.0, "eligible": ["first_party", "marketplace_eligible"],
--                  "milestones": [{"due": "2027-06-30", "amount": 40000000}],
--                  "excludes_credit_funded": true}
-- The stacking order across an account's commitments is resource, then hourly_spend by
-- narrowest eligible_products, then spend.

CREATE TABLE commitment_drawdowns (      -- what each commitment covered, hour by hour
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  commitment_id    UUID NOT NULL REFERENCES commitments (id),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  kind             TEXT NOT NULL CHECK (kind IN ('covered', 'unused', 'spend_decrement',
                     'shortfall')),
  benefit_window   TSTZRANGE NOT NULL,   -- the hour, or the month for monthly windows
  rated_usage_id   UUID REFERENCES rated_usage (id),       -- 'covered', 'spend_decrement'
  marketplace_order_id UUID,             -- 'spend_decrement' from a marketplace purchase
  invoice_line_id  UUID REFERENCES invoice_lines (id),     -- 'unused', 'shortfall'
  covered_quantity NUMERIC,              -- units priced at the commitment rate
  on_demand_amount NUMERIC(24,6),        -- what the covered units cost at list
  committed_amount NUMERIC(24,6) NOT NULL,  -- counted against the commitment
  benefit_amount   NUMERIC(24,6) NOT NULL DEFAULT 0,  -- on-demand less committed: the
                                         -- reduction applied to the rated line
  currency         CHAR(3) NOT NULL,
  rating_run_id    UUID NOT NULL,        -- reruns replace a run's rows, diffably
  CHECK ((kind = 'covered') = (rated_usage_id IS NOT NULL AND covered_quantity IS NOT NULL))
);

CREATE TABLE marketplace_listings (      -- a vendor's product sold on the provider's bill
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor_account_id    UUID NOT NULL REFERENCES accounts (id),  -- the ISV, as an account
  product_id           UUID NOT NULL REFERENCES products (id),  -- its SKUs are
                                         -- pass_through = 'marketplace_vendor'
  delivery             TEXT NOT NULL CHECK (delivery IN ('saas', 'machine_image',
                         'container', 'ml_model', 'data', 'professional_services')),
  commitment_eligible  BOOLEAN NOT NULL DEFAULT FALSE,  -- counts toward spend commitments
  fee_schedule         TEXT NOT NULL,    -- the rules-as-data key for listing fees
  status               TEXT NOT NULL CHECK (status IN ('draft', 'limited', 'public',
                         'restricted', 'retired')),
  valid_during         TSTZRANGE NOT NULL
);

CREATE TABLE private_offers (            -- negotiated terms for named buyers
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id           UUID NOT NULL REFERENCES marketplace_listings (id),
  buyer_account_ids    UUID[] NOT NULL CHECK (cardinality(buyer_account_ids) BETWEEN 1 AND 25),
  partner_account_id   UUID REFERENCES accounts (id),  -- channel partner, for a CPPO
  price_book           TEXT NOT NULL,    -- the offer's prices as price_versions
  partner_price_book   TEXT,             -- the vendor's price to the partner, for a CPPO
  currency             CHAR(3) NOT NULL,
  total_contract_value BIGINT NOT NULL,  -- pre-tax, minor units; drives the fee tier
  payment_schedule     JSONB NOT NULL DEFAULT '[]',  -- [{"due": "...", "amount": ...}]
  term                 TSTZRANGE NOT NULL,
  renews_offer_id      UUID REFERENCES private_offers (id),  -- renewals pay a lower fee
  replaces_external    BOOLEAN NOT NULL DEFAULT FALSE, -- channel shift or migration
  expires_at           TIMESTAMPTZ NOT NULL,           -- unaccepted offers lapse
  accepted_at          TIMESTAMPTZ,
  eula_ref             TEXT NOT NULL,
  CHECK ((partner_account_id IS NULL) = (partner_price_book IS NULL))
);

CREATE TABLE marketplace_orders (        -- an accepted subscription to a listing
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  listing_id           UUID NOT NULL REFERENCES marketplace_listings (id),
  private_offer_id     UUID REFERENCES private_offers (id),  -- null: public offer
  buyer_account_id     UUID NOT NULL REFERENCES accounts (id),
  subscription_id      UUID REFERENCES subscriptions (id),   -- for contract products
  currency             CHAR(3) NOT NULL,
  total_contract_value BIGINT,           -- null for pure usage offers
  listing_fee_rate     NUMERIC(6,4) NOT NULL,  -- frozen at acceptance, e.g. 0.0350
  commitment_id        UUID REFERENCES commitments (id),     -- the commitment it decrements
  term                 TSTZRANGE NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled',
                         'replaced')),
  replaced_by_id       UUID REFERENCES marketplace_orders (id)
);

ALTER TABLE commitment_drawdowns
  ADD CONSTRAINT commitment_drawdowns_order_fk
    FOREIGN KEY (marketplace_order_id) REFERENCES marketplace_orders (id);
```

Applying an hourly commitment to one hour of rated usage, highest discount first, ties broken by the lower commitment rate, as AWS documents:

```sql
-- $1: commitment id, $2: the hour (a one-hour TSTZRANGE), $3: rating run id
WITH c AS (
  SELECT id, account_id, currency, amount AS hourly_commitment,   -- minor units per hour
         discount_terms->>'price_book' AS book,
         ARRAY(SELECT jsonb_array_elements_text(discount_terms->'eligible_products')) AS products
  FROM commitments
  WHERE id = $1 AND kind = 'hourly_spend' AND term @> lower($2::tstzrange)
),
eligible AS (
  SELECT ru.id AS rated_usage_id, ru.quantity,
         ru.amount - COALESCE(prior.benefit, 0) AS on_demand,      -- after narrower benefits
         ru.quantity * cp.unit_price * (ru.amount - COALESCE(prior.benefit, 0))
           / NULLIF(ru.amount, 0) AS at_commit_rate,
         cp.unit_price
  FROM c
  JOIN rated_usage ru ON ru.account_id = c.account_id AND ru.rated_during = $2
                     AND ru.currency = c.currency
  JOIN skus s ON s.id = ru.sku_id
  JOIN products p ON p.id = s.product_id AND p.code = ANY (c.products)
  JOIN price_versions cp ON cp.sku_id = ru.sku_id AND cp.price_book = c.book
                        AND cp.currency = c.currency
                        AND cp.valid_during @> lower($2::tstzrange)
  LEFT JOIN LATERAL (                    -- reservations or narrower plans already applied
    SELECT SUM(cd.benefit_amount) AS benefit FROM commitment_drawdowns cd
    WHERE cd.rated_usage_id = ru.id AND cd.rating_run_id = $3
  ) prior ON TRUE
  WHERE ru.amount - COALESCE(prior.benefit, 0) > 0
),
ordered AS (
  SELECT e.*, 1 - e.at_commit_rate / e.on_demand AS discount,
         SUM(e.at_commit_rate) OVER (ORDER BY 1 - e.at_commit_rate / e.on_demand DESC,
           e.unit_price, e.rated_usage_id) AS running
  FROM eligible e
),
applied AS (
  SELECT o.*, LEAST(o.at_commit_rate,
           GREATEST((SELECT hourly_commitment FROM c) - (o.running - o.at_commit_rate), 0))
           AS committed
  FROM ordered o
)
INSERT INTO commitment_drawdowns (commitment_id, account_id, kind, benefit_window, rated_usage_id,
  covered_quantity, on_demand_amount, committed_amount, benefit_amount, currency, rating_run_id)
SELECT $1, (SELECT account_id FROM c), 'covered', $2, a.rated_usage_id,
       a.quantity * a.committed / a.at_commit_rate,                -- share of units covered
       a.on_demand * a.committed / a.at_commit_rate,
       a.committed,
       (a.on_demand - a.at_commit_rate) * a.committed / a.at_commit_rate,
       (SELECT currency FROM c), $3
FROM applied a
WHERE a.committed > 0
UNION ALL                                -- the hour's unused commitment is still owed
SELECT $1, c.account_id, 'unused', $2, NULL, NULL, NULL,
       c.hourly_commitment - COALESCE((SELECT SUM(committed) FROM applied), 0), 0,
       c.currency, $3
FROM c
WHERE c.hourly_commitment > COALESCE((SELECT SUM(committed) FROM applied), 0);
```

Notes on the sketch:

- **The commitment fee and the benefit are both explicit.** The hourly commitment is billed every hour as a recurring charge; covered usage is reduced by `benefit_amount`; unused commitment is a row of its own, so "how much of my plan did I waste" is a sum, not an inference. Credits then apply to what remains ([Applying Credits: a Worked Month](/books/hosting-and-cloud/free-tiers-and-credits#applying-credits-a-worked-month)).
- **Stack narrowest first.** The rating run applies resource commitments, then hourly commitments by narrowest scope, then spend commitments, and each pass reads the benefits of earlier passes in the same run, so the same usage is never discounted twice.
- **Spend commitments decrement on invoiced spend.** After the invoice run, each eligible line (first-party, or a marketplace order with `commitment_eligible`) becomes a `spend_decrement` row; lines paid by Microsoft-style credits or by shortfall credits are skipped when `excludes_credit_funded` is set. A missed milestone produces a `shortfall` row, an invoice line of kind `commitment_shortfall`, and a `credit_grants` row of kind `commitment_shortfall`.
- **Listing fees are frozen at acceptance.** The fee tier depends on offer type, total contract value, renewal, channel partner and buyer region, all known when the order is accepted; `listing_fee_rate` stores the result, computed from the published schedule held as rules ([Rules as Data](/docs/architecture/rules-as-data)), so a later schedule change doesn't reprice an existing contract.
- **Marketplace lines stay pass-through.** The vendor's charge rates against the vendor's SKU marked `marketplace_vendor`; the provider's fee is a separate ledger entry against the vendor's payout, never a markup hidden in the customer's line.
- **Spot interruptions are resource events.** An interruption ends the resource's `exists_during` and its usage, with the reason (`capacity`, `price`, `constraint`) and notice given.
- **Events:** `commitment.purchased`, `commitment.hour_rated`, `commitment.milestone_due` (at 90, 60 and 30 days, Microsoft's cadence), `commitment.shortfall`, `commitment.expired`, `marketplace.offer_created`, `marketplace.offer_accepted`, `marketplace.order_renewed` and `spot.interrupted` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing, notifications, cost exports and the vendor payout ledger.

## Auditing

- **Every hour's commitment math.** For each commitment and hour, the usage covered, the rates used, the order applied and the unused remainder, so a customer can reproduce the bill from the published rule.
- **Every commitment's terms and progress.** The contract, its price book, scope, milestones and eligibility, with eligible spend and remaining balance over time, because shortfall disputes are about what counted.
- **Every marketplace order's money.** The offer, the price to the buyer and, for a channel partner offer, the price to the partner, the listing fee rate and why it applied, and the payout to the vendor, reconciled monthly.
- **Every interruption.** Which spot resource was reclaimed, when, why and with what notice.

## What This Means for the System You Build

- **Model commitments by shape:** resource, hourly spend or total spend, with scope, window and stacking order as terms.
- **Store commitment rates as a price book,** so discounted rating uses the same effective-dated catalog as list rating.
- **Apply hourly commitments per hour, highest discount first,** and record unused commitment explicitly.
- **Stack benefits narrowest first** and never discount the same usage twice.
- **Treat a shortfall as prepayment credit,** with milestones and projections the customer can see.
- **Keep marketplace lines pass-through** and outside first-party credits and caps, with the listing fee frozen at acceptance.
- **Record the channel partner and both prices** on a private offer, so vendor, partner and provider each reconcile.
- **Make commitment progress visible,** the transparency the CMA's finding presumes.

## References

**Provider documentation**

- [AWS News Blog: Announcing EC2 Reserved Instances (March 12, 2009)](https://aws.amazon.com/blogs/aws/announcing-ec2-reserved-instances/), the original reservation model and example prices
- [AWS News Blog: Amazon EC2 Spot Instances (December 13, 2009)](https://aws.amazon.com/blogs/aws/ec2-spot-instances-and-now-how-much-would-you-pay/), bids, the Spot Price and termination
- [AWS News Blog: New Savings Plans for AWS compute services (November 6, 2019)](https://aws.amazon.com/blogs/aws/new-savings-plans-for-aws-compute-services/), Compute and EC2 Instance Savings Plans and their discounts
- [AWS: What are Savings Plans](https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html), dollar-per-hour commitments and savings up to 72%
- [AWS: How Savings Plans apply to your usage](https://docs.aws.amazon.com/savingsplans/latest/userguide/sp-applying.html), the order after Reserved Instances, highest savings percentage first, ties and the hourly window
- [AWS Price List: Compute Savings Plans, US East (N. Virginia), published October 27, 2026](https://pricing.us-east-1.amazonaws.com/savingsPlan/v1.0/aws/AWSComputeSavingsPlan/20261027220835/us-east-1/index.json), one-year no-upfront rates for c7i.xlarge, r7i.large and m7i.large
- [AWS: EC2 On-Demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/), on-demand Linux rates for c7i.xlarge, r7i.large and m7i.large in US East (N. Virginia)
- [AWS: Spot Instance interruptions](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-interruptions.html), interruption reasons and behaviors
- [AWS: Spot Instance interruption notices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-instance-termination-notices.html), the two-minute notice
- [AWS: EC2 Capacity Blocks for ML](https://aws.amazon.com/ec2/capacityblocks/), durations, advance booking, sizes and dynamic pricing
- [AWS: EC2 Capacity Blocks pricing](https://aws.amazon.com/ec2/capacityblocks/pricing/), US East rates, upfront charge and the next update
- [AWS Marketplace: Listing fees](https://docs.aws.amazon.com/marketplace/latest/userguide/listing-fees.html), public, private, channel partner, professional services and regional fees from January 5, 2024
- [AWS Marketplace: Private offers for buyers](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-private-offers.html), up to 25 accounts, agreements, renewals and billing
- [Amazon: AWS introduces AWS Marketplace (April 19, 2012)](https://press.aboutamazon.com/2012/4/amazon-web-services-introduces-aws-marketplace-where-customers-can-find-and-buy-pre-configured-software-for-the-aws-cloud), marketplace charges on the AWS bill
- [Microsoft Learn: What are Azure Reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations), terms, savings up to 72%, hourly application and the $50,000 refund limit
- [InfoQ: Azure Reserved VM Instances generally available (November 30, 2017)](https://www.infoq.com/news/2017/11/azure-reserved-vm-instances-ga), general availability on November 16, 2017
- [Microsoft Learn: What are savings plans](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-compute-overview), hourly commitments, highest discount first, no rollover and no refunds
- [Azure Blog: Microsoft Cost Management updates, October 2022](https://azure.microsoft.com/en-us/blog/microsoft-cost-management-updates-october-2022/), the savings plan for compute and its launch scope
- [Microsoft Learn: Track your Microsoft Azure Consumption Commitment](https://learn.microsoft.com/en-us/azure/cost-management-billing/benefits/macc/track-consumption-commitment), statuses, milestones, shortfall as prepayment credit, alerts and what counts
- [Microsoft Learn: Azure Consumption Commitment benefit](https://learn.microsoft.com/en-us/marketplace/azure-consumption-commitment-benefit), eligible Marketplace purchases at 100% of pretax amount and the exclusions
- [Microsoft Learn: Azure Spot Virtual Machines](https://learn.microsoft.com/en-us/azure/virtual-machines/spot-vms), eviction, notice, maximum price and no SLA
- [Microsoft Learn: On-demand capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview), pay-as-you-go billing whether used or not, discounts on top, the capacity SLA and unsupported GPU series
- [Microsoft Learn: Azure spending limit](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/spending-limit), Marketplace charges the limit doesn't stop
- [Google Cloud: Committed use discounts](https://docs.cloud.google.com/docs/cuds), spend-based and resource-based commitments, hourly and monthly windows, scope
- [Google Cloud: Sustained use discounts](https://docs.cloud.google.com/compute/docs/sustained-use-discounts), thresholds, the 20% and 30% maximums, monthly credits and no overlap with CUDs
- [Google Cloud Platform Blog: Introducing sustained use discounts (April 4, 2014)](https://cloudplatform.googleblog.com/2014/04/introducing-sustained-use-discounts.html), the announcement
- [Google Cloud Blog: Introducing preemptible VMs (May 18, 2015)](https://cloud.google.com/blog/products/gcp/introducing-preemptible-vms-a-new-class-of-compute-available-at-70-off-standard-pricing), 70% off, fixed price, 24-hour maximum and 30-second notice
- [Google Cloud: Spot VMs](https://docs.cloud.google.com/compute/docs/instances/spot), up to 91% off, runtime, notice and daily price changes
- [Google Cloud: Calendar mode future reservations](https://docs.cloud.google.com/compute/docs/instances/future-reservations-calendar-mode-overview), up to 90 days, look-ahead and lead time
- [Google Cloud: Vendor Net Revenue Schedule](https://cloud.google.com/terms/marketplace-revenue-share-schedule), vendor percentages by deal type and contract value, effective April 21, 2025
- [Google for Startups Cloud Program](https://cloud.google.com/startup), Marketplace purchases drawing down committed spend
- [DigitalOcean: GPU Droplet pricing](https://www.digitalocean.com/pricing/gpu-droplets), on-demand, reserved and spot GPU prices and billing granularity
- [Fly.io: Pricing](https://docs.fly.io/about/pricing), reservation blocks and their terms

**Filings**

- [DigitalOcean: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1582961/000158296126000019/docn-20251231.htm), committed contracts with a minimum spend

**Regulation**

- [CMA: Cloud services market investigation](https://www.gov.uk/cma-cases/cloud-services-market-investigation), reference, provisional and final decision dates
- [CMA: Summary of final decision (July 31, 2025)](https://assets.publishing.service.gov.uk/media/688b20e6ff8c05468cb7b120/summary_of_final_decision.pdf), paragraph 28 on committed spend agreements
- [CMA: Appendix V, the impact of CSAs on competition, a qualitative analysis](https://assets.publishing.service.gov.uk/media/688b8223d8da16bcb8469529/Appendix_V_-The_impact_of_CSAs_on_competition__a_qualitative_analysis.pdf), customers spending to meet targets and contract lengths
- [FTC: Cloud computing RFI, what we heard and learned (November 16, 2023)](https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2023/11/cloud-computing-rfi-what-we-heard-learned), commenters on minimum spend contracts
