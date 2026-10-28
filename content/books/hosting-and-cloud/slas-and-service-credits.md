+++
title = "SLAs & Service Credits"
description = "How hosting and cloud SLAs measure uptime, credit tiers across providers, claims and deadlines, sole-remedy and exclusion clauses, and computing a credit."
category = "Hosting & Cloud Industry"
order = 2195
part = "Metering and Billing"
tags = ["sla", "service-credits", "uptime", "contracts", "billing"]
+++

A service level agreement is a price adjustment, not a promise of uptime. When a cloud misses its published availability, the customer doesn't get damages; it gets a percentage of the affected service's fee back as a credit on a future bill, if it asks in time, with logs, in the format the provider requires, and if the outage wasn't caused by anything on a long list of exclusions. The credit is almost always the "sole and exclusive remedy." That makes the SLA less important as a reliability guarantee than as three other things: a public statement of the availability a provider is willing to be measured against, a definition of what "down" means, and a billing workflow that turns a measured month into a credit grant.

The definitions are where providers differ most. One SLA counts a minute as down only when every instance in two zones has no external connectivity; another averages the server error rate over five-minute intervals; another multiplies outage minutes by the share of visitors affected. The same incident can be worth 10% of the monthly bill under one definition and a fraction of a percent under another. This chapter surveys the SLAs of AWS, Azure, Google Cloud, DigitalOcean, Hetzner, Vercel, Netlify, Cloudflare, GoDaddy and Twilio, traces their history from the first S3 SLA in 2007, covers measurement, tiers, claims, exclusions, the relationship to internal SLOs and the role of status pages, computes the credit for one measured month under several definitions, and adds `sla_definitions` and `sla_claims` to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). An approved claim becomes a `credit_grants` row of kind `sla`, which is applied with every other credit at step 5 of [the bill pipeline](/books/hosting-and-cloud/metering-and-rating#the-bill-pipeline).

## How the Providers Do It

| Provider and service | Commitment, as of October 2026 | Credit | Claim |
| --- | --- | --- | --- |
| **AWS EC2** (last updated May 25, 2022) | Region-level 99.99% for instances in two or more Availability Zones; instance-level 99.5% per instance | Region and instance: 10% below the target, 30% below 99.0%, 100% below 95.0% of the monthly EC2 bill for the region or instance. Separately, an instance unavailable for more than six minutes of a clock hour isn't charged for that hour, automatically | Support case by the end of the second billing cycle after the incident, with dates, region and zone, resource IDs and logs; credits only above $1, against future EC2 payments |
| **AWS S3** (last updated November 28, 2023) | 99.9% for S3 Standard and most classes; 99.0% for Intelligent-Tiering, Standard-IA, One Zone-IA and Glacier Instant Retrieval | 10% / 25% / 100% at the tiers | By the end of the second billing cycle; "SLA Credit Request" subject with logs |
| **Azure Virtual Machines** (October 2026 SLA) | 99.99% across two or more Availability Zones; 99.95% in an availability set or dedicated host group; single instance 99.9% on Premium SSD, 99.5% on Standard SSD, 95% on Standard HDD | Zones and sets: 10% below target, 25% below 99%, 100% below 95%; single instance tiers scale by disk type | Within 60 days of the incident, with a description, times and duration, affected resources and errors; credits capped at the monthly fee for the service |
| **Google Compute Engine** (last modified October 14, 2026) | Premium tier: 99.99% for instances in multiple zones and load balancing, 99.95% for a memory-optimized single instance, 99.9% for other single instances | Multi-zone: 10% from 99.00% to below 99.99%, 25% from 95.00%, 100% below 95.00%; single instance: 10% from 95% to below 99.9%, 25% from 90%, 100% below 90% | Notify support within 60 days of becoming eligible, with logs; credits applied to future use within 60 days; capped at the month's bill for the service |
| **Google Cloud Spanner** | 99.999% for multi-region and dual-region instances, 99.99% regional | Per the Spanner SLA | Same Google process |
| **DigitalOcean Droplets** (last updated June 3, 2025) | 99.99% per Droplet | 100% of the affected Droplet's charges below 99.99% | Within two billing cycles of the month of the downtime |
| **Hetzner** | "Economically reasonable efforts to achieve an annual average network availability of 99.9%"; US terms promise commercially reasonable efforts at 24/7 availability | None; liability capped at 100% of the monthly fee | Not applicable |
| **Vercel** (Enterprise SLA) | 99.99%, commercially reasonable efforts, excluding excused downtime | 10% from 99.1% to 99.98%, 25% from 95% to 99%, 50% below 95%; capped at 50% of the month's amount due | In writing within 30 days of becoming eligible, with log files |
| **Netlify** | A 99.99% uptime SLA for its enterprise edge network | In the enterprise contract | In the enterprise contract |
| **Cloudflare** (Business SLA) | "Serve Customer Content 100% of the time without qualification"; Enterprise contracts carry their own SLA (10x credits on Standard, 25x on Premium, per Cloudflare's plan page) | Proportional: outage minutes times the affected customer ratio, divided by scheduled minutes, as a share of monthly fees; at most one month of fees in any 12 months | Notify support within five business days of the incident; claim with evidence by the end of the following billing month |
| **GoDaddy hosting** (revised September 30, 2026) | 99.9% "of available time per month" | "A credit of 5% of your monthly hosting fee for that month," usable "only for the purchase of further products and services" | Contact GoDaddy; the miss is "as solely determined by us" |
| **Twilio APIs** (last updated April 9, 2026) | 99.95% monthly availability; 99.99% on Enterprise Edition | 10% of the month's fees, excluding taxes, carrier fees or surcharges and third-party charges | Within 30 days after the end of the affected month, "SLA Claim" subject |

Four patterns run through the table:

- **Tiers cluster at 10, 25 or 30, and 100.** The hyperscalers credit about a tenth of the fee for a miss, a quarter or more for a bad month, and all of it below 95%. A month at 95% is about 36 hours of downtime; the credit only gets large when the service has been unusable for days.
- **The commitment depends on the customer's architecture.** EC2, Azure VMs and Compute Engine each promise four nines only for deployments across zones, and less for a single machine. The SLA prices redundancy: the customer who runs one instance has accepted a weaker promise.
- **The basis is narrow.** Credits are a percentage of the affected service's fee, in the affected region or for the affected resource, never of the customer's losses. Twilio excludes carrier fees and surcharges from the basis, Cloudflare credits only monthly recurring fees, and Microsoft's basis for metered services is the 30 days up to and including the incident's first day.
- **Developer clouds and hosts promise less, or more simply.** DigitalOcean credits the whole affected Droplet below four nines; GoDaddy pays 5% in store credit; Hetzner promises effort and no credit; Vercel and Netlify reserve their SLAs for enterprise contracts.

## How It Got Here

- **October 1, 2007: the first S3 SLA.** Announced October 8, it committed "to 99.9% uptime, measured on a monthly basis," with a credit of 10% of the month's S3 charges below 99.9% and 25% below 99%, counting failed calls that returned `ServiceUnavailable` or `InternalError`. The structure (a monthly percentage, server errors as the measure, tiered credits on a request) is still the industry's.
- **October 23, 2008: the EC2 SLA.** EC2 left beta with an SLA that "each Region will be available at least 99.95% of the time." The commitment was regional from the start: AWS promised a region, not a machine.
- **2015 onward: Google's versioned SLAs.** Google keeps every prior version of the Compute Engine SLA public, from October 16, 2015 to the version last modified October 14, 2026, which makes it possible to see what changed and when.
- **November 14, 2017: five nines for a database.** Cloud Spanner's multi-region release delivered "an industry-leading 99.999% availability SLA with no planned downtime," fewer than five minutes a year. The Spanner SLA defines downtime by error rate rather than connectivity: more than 5% of valid requests failing, over at least five consecutive minutes, with a minimum of 60 requests a minute and a required client backoff.
- **May 25, 2022: EC2's current SLA.** The version last updated that day commits to 99.99% at the region level, a fifth of the downtime 2008's 99.95% allowed, and to 99.5% per instance, plus the automatic rule that an instance unavailable for more than six minutes of an hour isn't charged for it.
- **2025 and 2026: per-resource and capacity SLAs.** DigitalOcean's June 3, 2025 Droplet SLA applies 99.99% "for each individual Droplet instance." Azure's on-demand capacity reservations add a capacity SLA: credits when reserved capacity can't be allocated, measured in minutes not available per reserved unit. Microsoft publishes one consolidated SLA for its online services in dated editions; the October 2026 edition is current.

The direction: from a single regional percentage to commitments by deployment shape, from connectivity to error rates for data services, from availability of the service to availability of capacity, and from a page of terms to a versioned document per month.

## How Uptime Is Measured

Every SLA defines three things: what counts as down, over what unit of time, and over what population.

| Method | Down means | Unit | Used by |
| --- | --- | --- | --- |
| **Connectivity minutes** | The resource has no external connectivity (or, for a multi-zone commitment, every running instance in two or more zones has none at once) | Minutes; Google ignores intermittent downtime under one minute | EC2, Azure VMs, Compute Engine, DigitalOcean |
| **Error-rate intervals** | Server errors divided by requests in each five-minute interval; intervals with no requests count as 0% | The average error rate across all intervals in the month | S3 |
| **Error-rate threshold** | More than 5% of valid requests fail, for at least five consecutive minutes, with a minimum request rate and the client backing off | Minutes in qualifying periods | Spanner |
| **Unavailable minutes with a floor** | The API is unavailable; outages shorter than five continuous minutes don't count | Minutes | Twilio |
| **Affected ratio** | An unscheduled interruption that makes the customer's content unavailable to its users, weighted by the share of unique visitor IPs affected | Outage minutes times the ratio | Cloudflare Business |
| **Capacity minutes** | A reserved unit can't be allocated after a supported deployment | Minutes not available per reserved unit | Azure capacity reservations |

The monthly uptime percentage is then a ratio. AWS's EC2 definition is 100% minus the percentage of minutes in the month the service was unavailable; Google's is total minutes minus downtime minutes over total minutes, calculated per project per region (or per instance); Microsoft's is maximum available minutes less downtime over maximum available minutes, where available minutes for a multi-zone commitment only accrue while at least two VMs in two zones are running. S3 is different: 100% minus the average error rate over five-minute intervals, which means a partial failure counts in proportion to its severity rather than as all or nothing.

Two consequences matter for a billing system. First, the measurement is per scope (account, region, resource) and the SLA names the scope, so the system needs usage and health data at that grain. Second, partial failures are where definitions diverge: a period of 20% errors is downtime under Spanner's threshold, a fifth of an interval under S3's average, and nothing at all under a connectivity definition if the instances stayed reachable.

## Credit Tiers

A credit is a percentage of the affected service's fee for the period, chosen by the lowest tier the measured uptime falls below. Three design choices vary:

- **The fee basis.** AWS credits a percentage of the monthly EC2 bill for the affected region or instance, excluding one-time payments such as upfront Reserved Instance fees; Google the bill for the covered service in the region; Microsoft "fees actually paid by you for a Service" applied to the period, for the affected resource or tier only; Twilio the fees incurred for the month, excluding pass-through carrier fees. A billing system computes the basis from `rated_usage` filtered by the SLA's product, region and resources, after commitment benefits (what the customer actually paid) and without pass-through SKUs.
- **The cap.** Google's maximum is the month's amount due for the covered service; Microsoft's credits "will not, under any circumstance, exceed your monthly service fees"; Vercel's are capped at 50% of the month's amount due; Cloudflare's at one month of fees in any 12-month period.
- **The form.** Almost always a credit on future bills for the same service, non-transferable and not refundable: AWS against future EC2 payments, DigitalOcean on future invoices, Twilio on future invoices, GoDaddy only for further purchases. AWS issues nothing at or below $1.

The one automatic remedy in the survey is EC2's hourly rule: an instance unavailable for more than six minutes of a clock hour isn't charged for that hour, with no request needed. It is a rating rule, not a credit, and belongs in rating ([Late, Duplicate and Corrected Usage](/books/hosting-and-cloud/metering-and-rating#late-duplicate-and-corrected-usage)) rather than in the claims workflow.

## Claims and Deadlines

Credits are almost never automatic. The customer must ask:

| Provider | Deadline | What to send |
| --- | --- | --- |
| AWS | Received by the end of the second billing cycle after the incident | A Support case with the subject naming the claim type, dates and times, region and zone, resource IDs, logs; sensitive data replaced with asterisks; one claim type per instance |
| Azure | Within 60 days of the incident (for non-Azure services, by the end of the period following the incident's month) | Description, time and duration, affected resource names, number and location of affected users, errors; processed "typically within forty-five (45) days" |
| Google Cloud | Within 60 days of becoming eligible | Log files showing the downtime periods; otherwise the credit is forfeit |
| DigitalOcean | Within two billing cycles of the month of the downtime | A support request |
| Vercel | Within 30 days of becoming eligible, in writing | Log files with dates and times |
| Cloudflare | Notice within five business days of the incident; claim by the end of the following billing month | Incident description, duration, traceroutes, affected URLs, resolution attempts |
| Twilio | Within 30 days after the end of the affected month | "SLA Claim" subject, outage dates and times, documentation |
| GoDaddy | No stated deadline | A request to GoDaddy |

The claim is the customer's evidence against the provider's measurement. Every SLA in the table asks for the customer's logs; Cloudflare says it reviews outage periods "using a commercially reasonable independent measurement system" the customer uses and estimates the affected ratio from "all reasonably available information." The provider decides, typically in good faith and on its own data. Microsoft adds that the customer must be in compliance with the agreement to be eligible, and that only one service level can be claimed per incident.

Some workloads have no claim at all: Microsoft's service levels don't apply "to purchases made using Microsoft subscription credits," which puts a credit-funded startup's workloads outside the SLA ([Credits on the Books](/books/hosting-and-cloud/free-tiers-and-credits#credits-on-the-books)), and Azure Spot VMs have "no SLA."

## Exclusions and Sole Remedy

The exclusion lists are long and similar:

- **Outside the provider's control:** force majeure and internet problems beyond the provider's network (AWS, Google, Microsoft, Twilio, Vercel), including "telecommunications provider-related problems or issues" for Twilio, whose service depends on carriers it doesn't control.
- **The customer's doing:** its software, hardware, configuration, use after being told to change it, unauthorized access through its credentials, and the customer's own restarts and scaling operations (Microsoft excludes customer-initiated operations from the uptime calculation).
- **Pre-release and trial:** preview, beta and trial services (Google, Microsoft, Cloudflare, Twilio).
- **Quotas and throttling:** errors from system quotas (Google) and from throttling "of suspected abusive behavior or hacked accounts" (Microsoft).
- **Suspension:** downtime from the provider suspending the customer under the agreement (AWS).
- **Maintenance:** scheduled maintenance with notice (Microsoft gives at least five days, Twilio 24 hours), and GoDaddy's "periodic scheduled maintenance or repairs," along with outages that "merely affect access to your website such as FTP and email."

And the remedy is exclusive. AWS: the SLA "sets forth your sole and exclusive remedies"; Google: "Customer's sole and exclusive remedy for any failure by Google to meet the SLO"; Microsoft: credits are the "sole and exclusive remedy" and "you may not unilaterally offset your Applicable Service Fees"; Cloudflare, Twilio and Vercel say the same. Credits "will not be awarded to compensate for any other forms of loss, including but not limited to lost revenue." Hetzner, which offers no credits, caps liability at 100% of the monthly fee. The practical result is that the SLA bounds the provider's exposure to an outage at roughly one month of the affected service's fees, and a customer whose business depends on availability buys redundancy, not an SLA.

## SLA Versus SLO

The playbook's [SLOs](/docs/operations/slos#terms) doc defines the terms: an SLO is the internal target, an SLA "a contract with consequences, looser than the SLO." For a provider the gap has three hosting-specific twists:

- **The SLA is per customer; the SLO is per service.** A regional SLO of 99.99% can be met while one customer's resources are down for hours, and that customer's claim is still valid. The provider has to measure availability at the SLA's grain (per account and region, per resource) to know its liability, not only its fleet-wide SLO.
- **The definition is part of the price.** Choosing connectivity minutes over error rates, a one-minute or five-minute floor, or multi-zone eligibility changes what the provider owes for the same incident. A provider should set its SLOs on the same definitions it publishes, or its error budget won't predict its credit exposure.
- **Credits are a cost line.** Approved SLA credits are a measurable price concession that finance books against revenue, and their sum per incident is a better severity measure for the business than minutes of downtime.

## Status Pages as Evidence

Status pages and post-incident reports are where a provider tells customers what happened, and they matter to claims in both directions: a published incident with times and affected regions is the customer's best evidence, and the provider's incident record is what its claim reviewers check. Google's Compute Engine SLA and AWS's both require the customer's own logs regardless; a status page entry doesn't file a claim. [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages#status-pages) covers the incident and status records; this chapter's model links a claim to the incidents it cites so a reviewer sees the provider's record next to the customer's evidence.

## Computing a Credit: a Measured Month

Take one account's service in one region in October 2026: 31 days, 44,640 minutes, 8,928 five-minute intervals, and a monthly fee of $12,000 for the affected service after commitment benefits and excluding pass-through charges. One incident:

- 50 minutes (10 intervals) with every request failing and no connectivity.
- Then 30 minutes (6 intervals) with 20% of requests returning server errors while instances stay reachable.

The same month under five published definitions:

| Definition | What counts | Uptime | Tier | Credit |
| --- | --- | --- | --- | --- |
| **Error-rate intervals** (S3 Standard: 99.9%) | Average error rate: (10 x 100% + 6 x 20%) / 8,928 = 0.12545% | 99.875% | Below 99.9%, at least 99.0%: 10% | $1,200.00 |
| **Connectivity minutes, multi-zone** (EC2 region, Compute Engine multi-zone: 99.99%) | Only the 50 minutes without connectivity | (44,640 - 50) / 44,640 = 99.888% | Below 99.99%, at least 99.0%: 10% | $1,200.00 |
| **Unavailable minutes, five-minute floor** (Twilio: 99.95%) | Both periods, if the 20% error period counts as unavailable; each is longer than five minutes | (44,640 - 80) / 44,640 = 99.821% | Below 99.95%: 10% | $1,200.00 |
| **Affected ratio** (Cloudflare Business: 100%) | (50 x 1.0 + 30 x 0.2) / 44,640 | Any outage qualifies | Proportional | 0.125% of monthly fees, $15.05 |
| **Monthly guarantee** (GoDaddy hosting: 99.9%) | Downtime as GoDaddy determines it | 99.888% if only the full outage counts | Below 99.9% | 5% of the monthly hosting fee, as store credit |

Three things stand out. The tiered SLAs pay the same 10% for an 80-minute incident as they would for a seven-hour one (below 99.0% the tier changes). The proportional SLA pays a hundredth as much for the same incident, while promising a higher number. And the Twilio row depends on a definition the SLA leaves to the provider: whether a 20% error rate makes an API "unavailable." The claim deadline differs too: by the end of December for AWS (the second billing cycle after October), within 60 days for Azure and Google, by November 30 for Twilio, and notice within five business days for Cloudflare.

## The Alternatives

| Model | Strengths | Failure modes | Cost to the provider | Who uses it |
| --- | --- | --- | --- | --- |
| **Tiered percentage credits on request** | Predictable exposure; industry standard; customers can compare | Small relative to customer losses; claims are work, so most go unclaimed | Bounded at a month of the service's fees | AWS, Azure, Google Cloud, Vercel, Twilio |
| **Full credit for the affected resource** | Simple and generous at small scale | Expensive for a provider with large per-resource bills | Up to the resource's monthly charge | DigitalOcean |
| **Proportional credit** | Matches the credit to the damage; can promise 100% | Credits are tiny; a headline promise that pays little | Small | Cloudflare Business |
| **Automatic non-billing** | No claim needed; fair for short outages | Only covers the unavailable hours themselves | Small | EC2's six-minutes-per-hour rule |
| **Store credit at a flat rate** | Cheap; keeps the customer | Not a refund; the provider decides whether it missed | 5% of a hosting fee | GoDaddy |
| **Effort only, no credit** | No claims workload | No contractual accountability beyond the liability cap | None | Hetzner |

## My Default

My default is the hyperscaler structure with two changes. Tiered percentage credits by deployment shape (10%, 25% and 100%, with four nines only for multi-zone deployments), measured on a published definition I also use for my internal SLOs, applied to the fees the customer actually paid for the affected service and region, excluding pass-through charges, capped at the month's fee and exclusive. The first change: compute the credit automatically when my own measurement shows a miss for an account, instead of waiting for a claim, because I already have the data and an unclaimed credit is a customer who has concluded the SLA is decoration. The second: publish every SLA version with its dates, as Google does, so a claim is always judged against the terms in force that month.

What would change it: a provider whose customers mostly run a single machine (a VPS host, a shared host) should follow DigitalOcean's per-resource model, because a multi-zone SLA promises nothing to them. A provider without the measurement to back an automatic credit shouldn't promise one; GoDaddy's "as solely determined by us" is the honest version of not having it.

## How to Build It

The chapter adds versioned SLA definitions and claims to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Availability is measured from usage the system already has: request meters in `usage_events` carry an outcome dimension, so an error-rate SLA is a query over them; connectivity SLAs read health records from [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages#how-to-build-it).

```sql
CREATE TABLE sla_definitions (           -- one published SLA version per service level
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id          UUID NOT NULL REFERENCES products (id),
  code                TEXT NOT NULL,     -- 'compute.multi_zone', 'object.standard', 'api'
  version             INT NOT NULL,
  scope               TEXT NOT NULL CHECK (scope IN ('account_region', 'resource',
                        'account', 'reserved_unit')),
  eligibility         JSONB NOT NULL DEFAULT '{}',  -- {"min_zones": 2}, {"disk": "premium_ssd"}
  measurement         TEXT NOT NULL CHECK (measurement IN ('connectivity_minutes',
                        'error_rate_intervals', 'error_rate_threshold', 'unavailable_minutes',
                        'affected_ratio', 'capacity_minutes')),
  meter               TEXT,              -- the request meter for error-rate SLAs
  error_outcomes      TEXT[],            -- outcome values that count: 'internal_error'
  interval_minutes    SMALLINT,          -- 5 for interval averages
  error_threshold     NUMERIC(6,5),      -- e.g. 0.05: down above 5% errors
  min_period_minutes  SMALLINT NOT NULL DEFAULT 1,  -- shorter outages don't count
  min_request_rate    INT,               -- requests a minute for a period to count
  target_pct          NUMERIC(7,4) NOT NULL,        -- 99.9900
  credit_tiers        JSONB NOT NULL,    -- [{"below": 99.99, "pct": 10}, {"below": 99.0,
                                         --   "pct": 25}, {"below": 95.0, "pct": 100}]
  proportional        BOOLEAN NOT NULL DEFAULT FALSE, -- credit = downtime share, not tiers
  fee_basis           TEXT NOT NULL CHECK (fee_basis IN ('calendar_month',
                        'trailing_30_days')),  -- Microsoft's metered basis is trailing
  max_credit          JSONB NOT NULL,    -- {"pct_of_month": 100} or {"months_per_12": 1}
  min_credit_amount   BIGINT NOT NULL DEFAULT 0,      -- e.g. 100: nothing at or below $1
  claim_window        JSONB NOT NULL,    -- {"basis": "incident", "days": 60} or
                                         -- {"basis": "billing_cycles_after", "cycles": 2}
  credit_form         TEXT NOT NULL CHECK (credit_form IN ('future_service_fees',
                        'future_purchases')),
  automatic           BOOLEAN NOT NULL DEFAULT FALSE, -- granted without a claim
  sole_remedy         BOOLEAN NOT NULL DEFAULT TRUE,
  exclusions          TEXT[] NOT NULL,   -- 'force_majeure', 'customer_caused', 'preview',
                                         -- 'quota', 'suspension', 'credit_funded', 'spot',
                                         -- 'scheduled_maintenance'
  document_url        TEXT NOT NULL,     -- the version the customer can read
  valid_during        TSTZRANGE NOT NULL,
  UNIQUE (product_id, code, version),
  EXCLUDE USING GIST (product_id WITH =, code WITH =, valid_during WITH &&)
);

CREATE TABLE sla_claims (                -- a request, or an automatic determination
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  sla_definition_id    UUID NOT NULL REFERENCES sla_definitions (id),
  period               TSTZRANGE NOT NULL,       -- the month measured
  region_id            TEXT REFERENCES regions (id),
  resource_ids         UUID[],           -- for resource-scoped SLAs
  origin               TEXT NOT NULL CHECK (origin IN ('customer', 'automatic')),
  submitted_at         TIMESTAMPTZ NOT NULL,
  claim_deadline       TIMESTAMPTZ NOT NULL,     -- computed from claim_window at creation
  incident_refs        TEXT[] NOT NULL DEFAULT '{}',  -- the provider's incident records
  evidence_refs        TEXT[] NOT NULL DEFAULT '{}',  -- the customer's logs and traces
  measured_uptime_pct  NUMERIC(8,5),     -- the provider's measurement
  claimed_uptime_pct   NUMERIC(8,5),     -- the customer's, if different
  fee_basis_amount     BIGINT,           -- minor units: affected fees, net of commitments,
                                         -- excluding pass-through and one-time payments
  credit_pct           NUMERIC(7,4),
  credit_amount        BIGINT,           -- after the cap and the minimum
  currency             CHAR(3) NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('submitted', 'needs_information',
                         'approved', 'partially_approved', 'denied', 'late')),
  decision_reason      TEXT,             -- the exclusion or tier that decided it
  decided_at           TIMESTAMPTZ,
  decided_by           TEXT,             -- typed actor
  credit_grant_id      UUID REFERENCES credit_grants (id),
  CHECK ((status IN ('approved', 'partially_approved')) = (credit_grant_id IS NOT NULL)),
  CHECK (status <> 'late' OR submitted_at > claim_deadline),
  UNIQUE NULLS NOT DISTINCT (account_id, sla_definition_id, period, region_id)
                                         -- one claim per service level per period
);
```

Monthly uptime for an error-rate SLA (S3's method: the average of five-minute error rates, empty intervals at 0%), from request meters, ignoring superseded events and excluded windows:

```sql
-- $1: sla_definitions.id, $2: account id, $3: region, $4: the month (TSTZRANGE),
-- $5: excluded windows (TSTZRANGE[]) from incidents marked as excluded
WITH d AS (
  SELECT * FROM sla_definitions WHERE id = $1
),
intervals AS (
  SELECT tstzrange(t, t + make_interval(mins => d.interval_minutes)) AS slot
  FROM d, generate_series(lower($4::tstzrange),
                          upper($4::tstzrange) - make_interval(mins => d.interval_minutes),
                          make_interval(mins => d.interval_minutes)) AS t
  WHERE NOT EXISTS (SELECT 1 FROM unnest($5::tstzrange[]) x
                    WHERE x && tstzrange(t, t + make_interval(mins => d.interval_minutes)))
),
requests AS (
  SELECT i.slot,
         SUM(ue.quantity) AS total,
         SUM(ue.quantity) FILTER (WHERE ue.dimensions->>'outcome' = ANY (d.error_outcomes))
           AS errors
  FROM d
  CROSS JOIN intervals i
  JOIN usage_events ue ON ue.account_id = $2 AND ue.meter = d.meter
                      AND ue.dimensions->>'region' = $3
                      AND lower(ue.occurred_during) <@ i.slot
  WHERE NOT EXISTS (SELECT 1 FROM usage_events c WHERE c.corrects_id = ue.id)
  GROUP BY i.slot
)
SELECT ROUND(100 * (1 - AVG(COALESCE(r.errors / NULLIF(r.total, 0), 0))), 5)
         AS monthly_uptime_pct,
       COUNT(*) AS intervals_measured
FROM intervals i
LEFT JOIN requests r USING (slot);
```

For a minutes-based definition with a threshold and a floor (Spanner's or Twilio's), the same request counts are taken per minute, minutes above `error_threshold` with at least `min_request_rate` requests are marked down, runs shorter than `min_period_minutes` are dropped (a gaps-and-islands grouping on consecutive down minutes), and uptime is `(minutes - down minutes) / minutes`. The tier is then the highest credit whose threshold the uptime falls below:

```sql
SELECT COALESCE(MAX((tier->>'pct')::numeric), 0) AS credit_pct
FROM sla_definitions d, jsonb_array_elements(d.credit_tiers) AS tier
WHERE d.id = $1 AND $2::numeric < (tier->>'below')::numeric;   -- $2: measured uptime
```

Notes on the sketch:

- **SLA versions are effective-dated.** A claim is judged by the definition in force during its period; providers revise SLAs often (Google lists eleven prior Compute Engine versions since 2015), and the exclusion constraint keeps one version per service level at a time.
- **The fee basis comes from rated usage.** It is the `rated_usage` amount for the SLA's product, region and resources in the basis period, less `commitment_drawdowns.benefit_amount`, excluding SKUs with `pass_through` set and one-time charges, so the credit is a share of what the customer actually paid the provider.
- **Approval writes a grant.** An approved claim inserts a `credit_grants` row of kind `sla` with `applies_to` set to the SLA's product codes (or to any purchase, for a store-credit SLA), `source_ref` set to the claim, and the amount after the cap and the minimum; the grant is then applied like every other credit ([Applying Credits: a Worked Month](/books/hosting-and-cloud/free-tiers-and-credits#applying-credits-a-worked-month)).
- **Automatic claims use the same table.** With `automatic` set, a monthly job measures every eligible account and region and inserts claims with `origin = 'automatic'`; customers can still file their own when their evidence differs.
- **Exclusions are checked, not assumed.** Credit-funded usage, spot resources, preview services and suspended accounts are filtered from the basis or deny the claim with the exclusion named in `decision_reason`, which the customer sees.
- **Rating rules aren't claims.** EC2-style automatic non-billing of unavailable hours is a correction applied during rating, recorded as a usage correction, not an SLA credit.
- **Events:** `sla.claim_submitted`, `sla.claim_needs_information`, `sla.claim_approved`, `sla.claim_denied`, `sla.credit_granted` and `sla.definition_published` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, billing, support and finance.

## Auditing

- **Every SLA version.** The document, its dates and its definitions, because a claim from March is judged by March's terms.
- **Every measurement behind a decision.** The intervals or minutes, the request counts and errors, the excluded windows and why they were excluded, so the uptime can be recomputed from usage events.
- **Every claim and its outcome.** Submission time against the deadline, the evidence, the incidents cited, the basis, the tier, the cap, the decision and who made it, and the credit grant it produced.
- **Credits as a cost.** Approved credits by service, region and incident, reconciled to the credit lines on invoices, for finance and for the reliability review that should follow a costly month ([Audit Trails](/docs/architecture/audit-trails)).

## What This Means for the System You Build

- **Publish the definition, not just the number:** what counts as down, the interval, the floor, the scope and the eligible deployment shapes.
- **Measure at the SLA's grain** (account and region, resource, reserved unit), from the same usage and health data that drives billing.
- **Version SLAs with dates** and judge every claim by the version in force.
- **Compute the fee basis from rated usage,** net of commitments and excluding pass-through and one-time charges.
- **Turn approved claims into credit grants of kind `sla`** and apply them with every other credit.
- **Prefer automatic credits** when the measurement exists; keep customer claims for when evidence differs.
- **Set internal SLOs on the published definitions,** stricter than the SLA, so the error budget predicts the credit bill.
- **Name the exclusion** in every denial, and keep claims, measurements and decisions for audit.

## References

**Provider SLAs and terms**

- [AWS: Amazon Compute Service Level Agreement](https://aws.amazon.com/compute/sla/), region and instance commitments, tiers, the six-minute hourly rule, claims, minimum credit, exclusions and sole remedy, last updated May 25, 2022
- [AWS: Amazon S3 Service Level Agreement](https://aws.amazon.com/s3/sla/), error rate per five-minute interval, monthly uptime, tiers by storage class, claims and sole remedy, last updated November 28, 2023
- [AWS News Blog: Amazon S3 at your service (October 8, 2007)](https://aws.amazon.com/blogs/aws/amazon-s3-at-yo/), the first S3 SLA, effective October 1, 2007
- [AWS News Blog: Big day for Amazon EC2 (October 23, 2008)](https://aws.amazon.com/blogs/aws/big-day-for-ec2/), EC2 out of beta with a 99.95% regional SLA
- [Microsoft: Service Level Agreements for Online Services (October 2026)](https://www.microsoft.com/licensing/docs/view/Service-Level-Agreements-SLA-for-Online-Services), general terms on claims, credits, caps, limitations and the Virtual Machines service levels
- [Microsoft Learn: On-demand capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview), the capacity SLA and its worked example
- [Microsoft Learn: Azure Spot Virtual Machines](https://learn.microsoft.com/en-us/azure/virtual-machines/spot-vms), no SLA for Spot VMs
- [Google Cloud: Compute Engine Service Level Agreement](https://cloud.google.com/compute/sla), commitments by configuration, downtime and downtime periods, financial credits, claims, maximum credit, exclusions and prior versions
- [Google Cloud: Cloud Spanner Service Level Agreement](https://cloud.google.com/spanner/sla), five nines for multi-region and dual-region instances and the error-rate downtime definition
- [Google Cloud Blog: Multi-region support in Cloud Spanner (November 14, 2017)](https://cloud.google.com/blog/products/gcp/with-multi-region-support-in-cloud-spanner-have-your-cake-and-eat-it-too), the 99.999% SLA
- [DigitalOcean: CPU Droplet SLA](https://www.digitalocean.com/sla/cpu-droplets), 99.99% per Droplet, credits, claim window and exclusions, last updated June 3, 2025
- [Hetzner: Terms and conditions](https://www.hetzner.com/legal/terms-and-conditions/), the 99.9% network availability effort, US availability terms and liability caps
- [Vercel: Enterprise Service Level Agreement](https://vercel.com/legal/sla), 99.99%, tiers, cap, claim window and sole remedy
- [Netlify: Netlify for enterprises](https://www.netlify.com/enterprise.md), the 99.99% enterprise edge SLA
- [Cloudflare: Business SLA](https://www.cloudflare.com/business-sla/), the 100% commitment, affected customer ratio, credit formula, notice and claim deadlines, cap, exclusions and sole remedy
- [Cloudflare: Plans](https://www.cloudflare.com/plans/network-cdn/), uptime SLA credits by plan
- [GoDaddy: Hosting and Security Services Agreement](https://www.godaddy.com/legal/agreements/hosting-agreement), the Service Uptime Guarantee, its credit and exclusions, revised September 30, 2026
- [Twilio: Service Level Agreement](https://www.twilio.com/en-us/legal/service-level-agreement), the SLAs Twilio publishes, last updated April 9, 2026
- [Twilio: Twilio APIs SLA](https://www.twilio.com/en-us/legal/service-level-agreement/twilio-apis), availability commitments, the five-minute floor, credit basis, claim window, exclusions and sole remedy
