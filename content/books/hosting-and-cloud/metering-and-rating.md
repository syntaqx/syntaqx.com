+++
title = "Metering & Rating"
description = "How providers measure usage and turn it into money: meters, units and granularity, minimums, allowances and caps, pass-through fees, corrections and re-rating."
category = "Hosting & Cloud Industry"
order = 2189
part = "Metering and Billing"
tags = ["metering", "rating", "usage-billing", "pass-through", "billing"]
+++

Metering is measuring what a customer's resources did; rating is turning those measurements into money. A web host on fixed plans barely meters at all, beyond disk and bandwidth checks against the package; a cloud meters everything, from instance-seconds and gigabytes of egress to requests, CPU milliseconds, rows read and tokens; a communications platform meters every segment of every text and every minute of every call, and adds a fee it collects for the carrier on top. The meters are where the provider's revenue is born, and where most billing disputes start: a customer who doesn't believe the bill is asking, in effect, to see the meter.

The two halves fail differently. A metering bug loses or invents usage, and the provider only finds out when a customer's bill looks wrong or its own costs don't reconcile. A rating bug prices correct usage wrongly: the wrong price version, a minimum applied twice, an allowance consumed by the wrong account, a carrier fee folded into the provider's own revenue. The design in [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) separates them on purpose: `usage_events` holds what was measured, as received, and `rated_usage` holds what it cost, tagged with the run that priced it, so either half can be fixed and replayed without touching the other. This chapter covers how providers meter, how rating works from event to money, allowances and caps, pass-through fees, late and corrected usage, and the order of operations from usage to invoice that the rest of the Metering and Billing part follows. Price shapes and the catalog itself are [Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs).

## How the Providers Do It

Every provider publishes its metering rules, because the rules are part of the price. As of October 2026:

| Provider | What is metered | Granularity and minimum | Cap or allowance |
| --- | --- | --- | --- |
| **AWS EC2** | Instance time, by instance type and operating system | Per second with a 60-second minimum for Linux, Windows and several other operating systems; SUSE Linux Enterprise Server per full hour | None on compute; the first 100 GB a month of internet egress is free across services |
| **AWS Lambda** | Requests, and duration times configured memory | Duration rounded up to the nearest millisecond, no minimum, since December 2020 | Free tier allowance |
| **Google Compute Engine** | VM time | Per second with a one-minute minimum since September 2017, including Windows Server and RHEL images | None on compute |
| **DigitalOcean** | Droplet time | Per second with a minimum of 60 seconds or $0.01, whichever is higher, since January 1, 2026 | Bundled plans capped at 672 hours (28 days) a month; v5 Droplets uncapped |
| **Akamai Cloud (Linode)** | Service time | Hourly; partial hours round up to a full hour | Most services capped at the monthly rate, excluding network transfer overages; GPU, G8 dedicated and additional IPv4 uncapped from July 1, 2026 |
| **Hetzner Cloud** | Server time from creation to deletion, on or off; outgoing traffic | Hourly, rounded up; traffic overage in 100 MB blocks | "Your server's bill will never exceed its monthly price cap" |
| **Vercel** | Active CPU, provisioned memory, invocations | Active CPU only while code runs, paused during I/O; memory in GB-hours for the instance's life until the last in-flight request finishes | Hobby includes 4 CPU-hours, 360 GB-hours and 1 million invocations; Pro offsets on-demand usage with a monthly credit |
| **Cloudflare Workers** | Requests and CPU time | CPU time, not wall-clock duration ("No charge or limit for duration") | Paid: $5 a month including 10 million requests and 30 million CPU milliseconds |
| **Cloudflare D1** | Rows read, rows written, storage | Every scanned row counts, whatever its size; an indexed write adds a row written | Paid: 25 billion rows read and 50 million rows written a month included |
| **GitHub Actions** | Job minutes by runner type | Each job rounded up to the nearest whole minute | Included minutes per plan |
| **Twilio** | SMS segments; carrier fees per message; failed messages | Per segment for the base rate; carrier fees "per message" | None; a $0.001 fee on messages that end failed |

Three patterns run through the table. **Granularity has fallen from hours to seconds to milliseconds**, but almost every provider kept a minimum, because the cost of starting something is real. **The unit has moved from what is reserved to what is used**: Workers bills CPU time rather than wall-clock time, Vercel splits active CPU from memory held, D1 bills rows rather than instance-hours. And **the developer clouds cap where the hyperscalers don't**: DigitalOcean, Linode and Hetzner promise that a server never costs more than its monthly price, which makes their bills predictable and their meters simpler, while AWS, Azure and Google Cloud bill whatever was used.

## How It Got Here

Metering followed the unit of sale, and each step solved one problem and created another.

- **The monthly server (to the mid-2000s).** Dedicated servers and shared hosting were sold by the month, with bandwidth and disk as the only things measured, against a package limit or a 95th-percentile transfer bill. Metering was a cron job reading counters; rating was a flat price plus overage. It was cheap to build and impossible to scale down: a customer paid for a month whether the server ran for an hour or not. Web hosting still works this way, which is why [How Web Hosting Makes Money](/books/hosting-and-cloud/web-hosting-business) is about terms and renewals rather than meters.
- **The instance-hour (2006).** Amazon EC2's beta launched in August 2006 at "10 cents per clock hour" for each instance, billed only while it ran. The hour made compute rentable for an afternoon, and made metering a provider's core system: every instance's start and stop became a billable event. The cost was rounding: a two-minute test billed an hour, and short-lived workloads paid for capacity they never used.
- **The second (2017).** AWS announced on September 18, 2017 that Linux instances would be billed per second from October 2, with "a 1 minute minimum charge per-instance," while list prices stayed per hour: "bills are calculated down to the second." Google Cloud followed on September 26, 2017 with per-second billing and a one-minute minimum for Compute Engine, its container and Dataproc VMs and the App Engine flexible environment, effective that day and including Windows and RHEL images. Per-second billing made autoscaling and batch jobs cheap, and moved the cost into the meters: a provider now has to measure and store second-level lifetimes for every machine.
- **The millisecond (2020).** Lambda launched billing duration in 100 ms increments; on December 1, 2020 AWS moved to rounding "up duration to the nearest millisecond with no minimum execution time." Its own example: a 27.55 ms invocation billed as 100 ms before and 28 ms after, and a month of 60 million such invocations at 1 GB falling from $112 to $40. Sub-second rating means the rated quantity is a sum of millions of tiny events, and rounding has to happen once, at the end.
- **CPU time, not wall time (2023 onward).** Cloudflare moved Workers and Pages Functions from duration-based pricing to CPU time in an announcement of September 28, 2023, opt-in from October 31, 2023 and automatic for Paid plans from March 1, 2024, on the argument that "all large serverless compute platforms have billed based on how long your function runs," including time spent waiting on I/O. Vercel's fluid compute bills active CPU "only during actual code execution and not during I/O operations," with memory billed separately for the instance's life. The unit now tracks the provider's real cost more closely, at the price of a meter only the runtime can produce.
- **Per-second for everyone else (2026).** DigitalOcean moved Droplets to per-second billing effective January 1, 2026, with a 60-second or $0.01 minimum and its 672-hour monthly cap kept. By 2026 the hourly meter survives mainly where a monthly cap makes it nearly irrelevant (Hetzner, Linode).

The usage itself also changed shape. Rows read (D1), operations (Azure Service Bus), segments (Twilio), tokens (model APIs) and build minutes (GitHub Actions) are counts of events the customer's own code triggers, so the meter is no longer the provider's infrastructure clock but the customer's traffic, and the bill can grow without the customer provisioning anything. That is the root of most surprise bills ([Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills#surprise-bills-and-forgiveness)).

## Meters, Units and Granularity

A **meter** is a named measurement with a unit, a way of aggregating it and the dimensions that can split it. A SKU rates a meter; several SKUs can rate the same meter (Linux and Windows instance-seconds, three carriers' fees on one message). Meters come in four kinds, and each needs a different collector:

| Kind | What it measures | Example | Aggregation over a window |
| --- | --- | --- | --- |
| **Duration** | How long something existed or ran | Instance-seconds, GPU-hours, address-hours | Sum of the overlap of each lifetime with the window |
| **Gauge** | A level held over time | Stored GB, provisioned memory | Time-weighted average, then converted to GB-months or GB-hours |
| **Counter** | How many times something happened | Requests, rows read, segments, tokens, operations | Sum |
| **Volume** | How much moved | Egress bytes, ingested log GB | Sum |

Units are the provider's choice and should be the customer's mental model only where the two agree. AWS lists prices per hour but bills per second; Azure's Retail Prices API carries a `unitOfMeasure` such as "1 Hour" or "1M" on every meter; Google's Pricing API gives a unit such as `GiBy.mo`. Storage is the subtle one: S3 measures storage in binary gigabytes (GiB) for "how long objects are stored during the month," so a gauge sampled every hour has to be averaged across the month's hours, and a month of 744 hours and one of 672 produce different hourly rates for the same monthly price.

**Granularity and minimums are rating rules, not meter rules.** The meter should record the true lifetime or count; the SKU's `min_billable` and `billing_increment` turn it into the billable quantity. Keeping them apart is what let AWS and Google change billing granularity in 2017 without changing what their collectors produced, and what lets DigitalOcean apply "60 seconds or $0.01, whichever is higher," a minimum that mixes a quantity and an amount. A minimum applies per billable session (an instance launch, a job, a function invocation), never per hour of a long-running resource, so the meter has to carry the session it belongs to: GitHub rounds "the minutes and partial minutes each job uses up to the nearest whole minute," per job, not per day.

**What counts is a product decision the meter has to encode.** Vercel counts invocations "regardless of request success or failure"; Twilio charges $0.001 for a message that ends failed; D1 counts every row a query scans, so a `SELECT *` over 5,000 rows is 5,000 rows read even if the customer wanted one; S3 stopped charging bucket owners for HTTP 403 responses to requests from outside their account or organization, announced May 13, 2024 and complete across all S3 APIs and Regions by August 19, 2024. Each of those is a dimension on the event (`outcome`, `caller_scope`) and a rule in rating, so the rule can change without re-instrumenting the service.

**Dimensions are what make one meter many prices.** Region, operating system, carrier, direction, storage class, model, and the outcome of a request all decide the SKU. A dimension the meter doesn't record can never be priced or reported later, and one it records but nobody rates becomes cost-allocation data ([Autoscaling & Cost](/books/hosting-and-cloud/autoscaling-and-cost#cost-allocation) uses dimensions for exactly that). My rule: every meter declares its allowed dimensions, and an event with an undeclared dimension or an unknown value is quarantined, not rated at a default.

## Rating: From Events to Money

Rating is a deterministic function: the effective events for a window, the SKUs that match them, and the price versions in effect when the usage happened. Run it twice on the same inputs and it produces the same `rated_usage`; run it after a price bug is fixed and the difference is the adjustment. The steps:

1. **Select effective events.** Events whose usage falls in the window, that were received before the run's cutoff, and that no later correction supersedes.
2. **Aggregate per meter's rule** and per resource, session and priced dimension.
3. **Apply minimums and increments** per session, from the SKU.
4. **Match the SKU** by meter, region and dimensions, most specific match first.
5. **Find the price version** in the account's price book (a contract book, else list) whose `valid_during` contains the usage time, not the processing time.
6. **Apply allowances** from the subscription's plan version, in usage-time order.
7. **Price** the remaining quantity with the version's shape (flat, tiered, package, from [Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs#price-shapes)) and any monthly cap, unrounded.
8. **Write `rated_usage`** with the run id. `quantity` is the billable quantity after minimums and increments; `included_quantity` is the part the allowance covered; `amount` is the unrounded charge for `quantity - included_quantity`. Commitments and credits are later steps and never change these columns.

**Worked example: a DigitalOcean Droplet, October 2026.** The cheapest Basic Droplet lists at $4.00 a month or $0.00595 an hour. Destroyed after 90 seconds, it rates 90 seconds, or $0.000149, below the $0.01 minimum, so the rated amount is $0.01. Left running all of October's 744 hours, it rates 744 hours but the bundled-plan cap stops the charge at 672 hours: 672 × $0.00595 = $3.9984, which rounds to $4.00 on the invoice, the monthly price. Both outcomes come from the same meter (seconds from creation to destruction) and different rating rules.

**Worked example: a Vercel function, from Vercel's own page.** A 4 GB function in São Paulo (gru1, $0.221 per CPU-hour and $0.0183 per GB-hour) handles one request using 4 seconds of active CPU in an instance alive for 10 seconds. CPU: 4 ÷ 3,600 × $0.221 = $0.0002456. Memory: 4 GB × 10 ÷ 3,600 × $0.0183 = $0.0002033. Total $0.0004489, plus the invocation at $0.60 per million on Pro. Two meters, two SKUs and two price versions per invocation; the amounts are fractions of a cent and must stay unrounded until the invoice.

**Worked example: Cloudflare Workers, from Cloudflare's page.** 15 million requests a month at 7 ms of CPU each on the Paid plan: the $5.00 subscription, 5 million requests over the 10 million included at $0.30 per million ($1.50), and 105 million CPU milliseconds less 30 million included at $0.02 per million ($1.50), for $8.00. The allowance is part of the subscription; the overage is rated usage.

**Worked example: a CI job.** A 61-second job on a GitHub-hosted Linux 2-core x64 runner rounds up to 2 minutes at $0.006 a minute: $0.012. The same job on macOS (3 or 4 cores) costs $0.062 a minute, ten times the Linux rate per minute, which is why runner type is a priced dimension, not a label ([The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#why-macos-costs-ten-times-linux)).

The price version is chosen by **usage time**. A Hetzner server running through 15 June 2026, when Hetzner's standardized prices took effect for new orders and rescales (a CX23 from €3.99 to €5.49 a month), rates its hours before the change at the old price and after at the new one only if the change applies to it at all; Hetzner's own page says orders placed before 15 June but delivered after still get the previous prices. That rule is data on the price version and the order, not a branch in the rater.

## Allowances, Tiers and Monthly Caps

Three mechanisms bend the line from quantity to amount, and they apply in a fixed order.

**Allowances** are quantities a subscription includes: Workers Paid's 10 million requests, Vercel Hobby's 4 CPU-hours, D1 Paid's 25 billion rows read. They live on the plan version (`plan_versions.included`, keyed by SKU code), are consumed in usage-time order within the subscription period, and reset each period with no rollover unless the plan says so. Consumption order matters: if the allowance is applied to whichever rated row the job reaches first, two reruns can put the included quantity on different days and produce different daily cost reports for the same month. My rule: allowances are consumed by a running sum over `rated_during`, so the first units of the month are free and the result is the same on every run.

**Tiers** change the unit price with volume. In a **graduated** shape each band is priced at its own rate; in a **volume** shape the whole quantity takes the rate of the band it ends in. Azure's Service Bus Standard tier is graduated, straight from the Retail Prices API for East US: the first 13 million operations a month at $0.00, then $0.80 per million to 100 million, $0.50 per million to 2,500 million, and $0.20 per million beyond, on top of a $10 monthly base. Three hundred million operations rate as 87 million × $0.80 ($69.60) plus 200 million × $0.50 ($100.00), $169.60 of operations. Tiers are computed on the month's cumulative quantity per account, not per hour, so a tiered SKU's hourly rated rows carry a provisional amount that the end-of-period run trues up. [Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs#price-shapes) owns the tier shapes.

**Monthly caps** stop the charge at a ceiling: DigitalOcean's 672 hours, Linode's "never billed more than the monthly rate for each service, excluding network transfer overages," Hetzner's "monthly price cap." A cap is per resource and per period, applied after minimums and tiers and before commitments and credits. It's what lets a developer cloud quote a monthly price for a per-second product. It also means a resource's hourly rated amounts stop at the cap, so a dashboard that multiplies hours by the hourly rate overstates a long-running server's cost. A cap is also not a spending limit: it bounds one resource, not the account's bill ([Free Tiers, Credits & Startup Programs](/books/hosting-and-cloud/free-tiers-and-credits#spending-limits-the-hard-cap) owns the account-level hard cap).

## Pass-Through Fees

Some rated usage isn't the provider's revenue. A carrier fee on a text, a registry fee on a domain year, a license fee on a control panel seat: the provider collects it and pays it on. The core model marks this on the SKU (`skus.pass_through`), and the rater produces a separate rated row for it, from the same event, so the two never blend.

**Worked example: one text, October 2026.** A single-segment SMS from a US long code to a Verizon subscriber, on Twilio's published prices: $0.0083 for the segment plus a $0.005 carrier fee, $0.0133 in all, of which 38% is money for the carrier. Twilio words its carrier fees as "additional carrier fees per message that are automatically applied," while the base rate is "charged per segment," so the two lines need different meters (segments and messages) from the same send event. A message that ends failed adds a $0.001 fee of Twilio's own.

Why it matters beyond the invoice:

- **Margins.** Twilio's 10-K says passing a carrier fee increase to customers typically raises revenue and cost of revenue together, so gross profit dollars are unaffected and gross margin percentage falls; Bandwidth reports its messaging surcharges as a separate revenue line, $192.4 million of $753.8 million in 2025. A rater that folds the fee into the provider's own SKU makes every margin report wrong ([Operating Metrics](/books/hosting-and-cloud/operating-metrics#gross-margin-and-pass-through)).
- **Fee drift.** Carrier and registry fees change on the supplier's schedule, not the provider's. Each change is a new price version on the pass-through SKU, effective when the supplier says, and the notice obligation to customers runs from the provider's own terms ([Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs#price-changes-and-notice)).
- **Reconciliation.** Carriers, registries and licensors bill the provider from their own counts. Pass-through rated rows are what the provider reconciles against those invoices, so they keep the resource, the carrier or registry, and the supplier's own identifier as dimensions.
- **Tax.** Pass-through charges can carry different tax treatment from the provider's service, and some regulatory fees are billed as surcharges rather than taxes ([Tax on Hosting & Cloud](/books/hosting-and-cloud/tax#telecom-taxes-and-regulatory-fees) covers USF recovery and per-line 911 charges).

## Late, Duplicate and Corrected Usage

Meters don't deliver cleanly. Collectors retry, regions buffer during an outage, a service ships a metering bug and fixes it a week later. Four rules keep the bill correct anyway.

**Duplicates are a no-op.** Every event carries the producer's idempotency key, unique per source (`UNIQUE (source, idempotency_key)` in the core model), so a replayed batch inserts nothing ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)). Stripe's meters take the same approach with an event `identifier`, and offer a "pre-aggregated" mode in which a newer event for the same hourly or daily window "overwrites the previous one." Overwrite semantics are convenient for producers that report running totals, and dangerous for counters: a retried partial total silently replaces a complete one. My rule: counters are always raw events; only gauges may report a level that replaces the last one.

**Late events have a window.** Each meter states how late an event may arrive and still rate into its own period (`meters.lateness_window`). The rating run for a period waits for that window after the period closes, then rates with a received-at cutoff; events received after the cutoff for a closed period are rated by the next run with their original `rated_during` and billed on the next invoice as an adjustment, never by editing an issued invoice ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)). Google says its monthly budgets keep tracking costs "for the first two days of the next month" because of exactly this lag.

**Corrections are new events.** A wrong event is never updated. A correction is a new event with `corrects_id` pointing at the one it restates, carrying the corrected quantity for the same window (zero to void it), and grouped under a `usage_corrections` row that says why, who approved it and which rerate applied it. The effective set is every event no later event corrects. Stripe's equivalent is narrower: a meter event adjustment can cancel events "sent to Stripe within the last 24 hours," and canceled usage on a finalized invoice isn't re-invoiced. A provider with long-running resources and month-end invoices needs corrections for the whole open period and adjustments after it.

**Rerating is a new run.** Fixing a price, a rule or a batch of events means a new `rating_runs` row that supersedes the old one for its scope; its output is diffed against the old run's, and the difference becomes adjustment lines (or nothing, if the period isn't invoiced yet). Because rating is a function of events and price versions, the rerun is reproducible, and the diff is the evidence a disputed bill needs.

## The Bill Pipeline

Every chapter in this part works on one stage of the same pipeline. The order is fixed, because each stage reads the previous one's output:

| Stage | What happens | Owner |
| --- | --- | --- |
| 1. Ingest | `usage_events` arrive idempotently, append-only, with dimensions and corrections | This chapter |
| 2. Rate | Effective events become `rated_usage` at the price version in effect when the usage happened, with minimums, increments, tiers and caps | This chapter; shapes in [Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs) |
| 3. Allowances | Plan allowances set `included_quantity`, in usage-time order | This chapter |
| 4. Commitments and discounts | Savings plans, reservations and committed-use rates reduce rated amounts through `commitment_drawdowns` | [Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces) |
| 5. Credits | Promotional, startup, SLA and goodwill credits draw down `credit_grants`, soonest-expiring first | [Free Tiers, Credits & Startup Programs](/books/hosting-and-cloud/free-tiers-and-credits); SLA credits from [SLAs & Service Credits](/books/hosting-and-cloud/slas-and-service-credits) |
| 6. Invoice and tax | An invoice run builds invoices and lines, rounding once per line, and tax is calculated per line by the seller entity's rules | [Invoices, Dunning & Suspension](/books/hosting-and-cloud/invoices-dunning-and-suspension); [Tax on Hosting & Cloud](/books/hosting-and-cloud/tax) |
| 7. Collect | Payment, dunning and holds on the [standing ladder](/books/hosting-and-cloud/accounts-and-resellers#account-standing) | [Invoices, Dunning & Suspension](/books/hosting-and-cloud/invoices-dunning-and-suspension) |

Cost exports, budgets and anomaly detection read stages 2 to 5 as they happen, not the invoice ([Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills)). That is why the stages must be queryable mid-period: AWS's Cost Explorer data can lag up to 24 hours and its anomaly detection runs about three times a day after billing data is processed, and a customer's spend alert is only as fresh as the provider's last rating run.

Two consequences shape the schema. **Discounts never edit rated usage**: a commitment's benefit and a credit's drawdown are rows that point at `rated_usage`, so list cost, discounted cost and billed cost are all recoverable, which is what the FOCUS format's List Cost, Effective Cost and Billed Cost columns need. And **nothing is rounded before stage 6**: rated amounts are `NUMERIC(24,6)`, and the invoice line rounds the sum once by the [written rule](/docs/payments/money#rounding).

## The Alternatives

A provider can build its metering and rating, buy a usage-billing platform, or, for fixed-plan products, do without most of it.

| Approach | Model | Strengths | Failure modes | Cost and ownership | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **In-house pipeline** | Collectors per service, an event store, a rater over price versions | Any meter, any dimension, any volume; rating as code the provider can test and rerun; no per-event fees | The provider owns correctness, late data, reruns and audit; large teams at hyperscale | Engineering time | AWS, Azure, Google Cloud, DigitalOcean, Cloudflare, Twilio (their meters are product-specific and public only through their pricing rules) |
| **Stripe Billing meters** | Meter events with `sum`, `count` or `last` aggregation, mapped to a customer and priced by Stripe | Tied to invoices and payments; quick to start | Adjustments only for events sent in the last 24 hours, and none for finalized invoices; Stripe now recommends Metronome for new usage integrations | Stripe fees; Stripe-owned | Smaller SaaS and developer platforms |
| **Metronome** | Real-time ingest API that applies pricing and tracks balances continuously | Built for high-volume usage and AI token billing | Another system of record beside the provider's own resources | Commercial; acquired by Stripe, completed January 14, 2026 | Stripe names OpenAI, Anthropic and NVIDIA as users |
| **Lago** | Open-source metering and billing: usage, subscriptions, prepaid credits, invoicing | Self-hostable, inspectable | AGPLv3 obligations if modified and offered as a service; the provider runs it | AGPLv3 or Lago Cloud | Teams that want to own the code |
| **OpenMeter** | Open-source usage metering with limits and billing sync | Apache 2.0, embeddable | Metering, not the whole bill; billing still goes elsewhere | Apache 2.0, offered by Kong | API platforms |
| **Plans with package limits** | Fixed plans, limits enforced on the server, overage rare | Almost no rating; predictable bills | Can't price elastic use; bandwidth and disk disputes become support tickets | Cheapest | Shared hosting, managed WordPress |

## My Default

My default is to build the event store and the rater, and buy only what sits around them. Meters are the product: which dimensions exist, which outcomes count and what a session is are decisions every service team makes, and a third-party meter schema ends up dictating them. Rating is small once the inputs are right: a deterministic function over effective events and effective-dated price versions, with tiers and caps as data, that can be rerun for any closed period and diffed. That is a few thousand lines a provider can test exhaustively, against a vendor whose correction window (Stripe's 24 hours) is shorter than the provider's month.

I'd buy instead if the business is a SaaS or AI API with a handful of meters, no long-running resources, no pass-through suppliers and monthly invoices through one payment processor: Metronome or Stripe's meters will be in production before an in-house pipeline is designed. I'd pick Lago or OpenMeter where owning the code matters more than owning the operations. And I'd keep fixed plans with enforced limits for products whose customers value a predictable bill over elasticity, which is still most of web hosting. What would change my default is volume without variety: a provider with one or two meters and billions of events gains little from owning a rater, and a managed pipeline is cheaper than the team.

Whatever the choice, three things stay in-house: the idempotency key on every event, the correction-as-new-event rule, and the separation of pass-through SKUs, because those decide whether a disputed bill can be proved.

## How to Build It

The chapter adds a meter registry, rating runs and corrections to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), plus dimension matching on SKUs and the price book an account rates at. Tier shapes and caps on price versions are [Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs#how-to-build-it)'s; `rated_usage` is unchanged except for its foreign key to the run.

```sql
CREATE TABLE meters (                    -- what usage_events.meter may name
  code              TEXT PRIMARY KEY,    -- 'vm.seconds', 'egress.bytes', 'sms.segments',
                                         -- 'sms.messages', 'd1.rows_read', 'ci.job_seconds'
  kind              TEXT NOT NULL CHECK (kind IN ('duration', 'gauge', 'counter', 'volume')),
  unit              TEXT NOT NULL,       -- the unit events carry: 'second', 'byte', 'segment'
  aggregation       TEXT NOT NULL CHECK (aggregation IN ('sum', 'time_weighted_avg', 'max',
                      'last')),
  session_dimension TEXT,                -- the dimension a minimum applies per: 'launch_id', 'job_id'
  dimensions        TEXT[] NOT NULL,     -- allowed keys: 'region', 'os', 'carrier', 'outcome'
  lateness_window   INTERVAL NOT NULL,   -- how late an event may rate into its own period
  owner_team        TEXT NOT NULL,       -- who answers for the meter's correctness
  valid_during      TSTZRANGE NOT NULL
);

ALTER TABLE usage_events
  ADD CONSTRAINT usage_events_meter_fkey FOREIGN KEY (meter) REFERENCES meters (code),
  ADD COLUMN correction_id UUID;         -- the usage_corrections row, for a correcting event

ALTER TABLE accounts
  ADD COLUMN price_book TEXT NOT NULL DEFAULT 'list';  -- the book this account rates at

ALTER TABLE skus
  ADD CONSTRAINT skus_meter_fkey FOREIGN KEY (meter) REFERENCES meters (code),
  ADD COLUMN dimension_match JSONB NOT NULL DEFAULT '{}',  -- {"os": "windows"}, {"carrier": "verizon"}
  ADD COLUMN match_priority  SMALLINT NOT NULL DEFAULT 0;  -- most specific match wins

CREATE TABLE rating_runs (               -- one execution of the rater over a scope
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  kind               TEXT NOT NULL CHECK (kind IN ('scheduled', 'period_close', 'rerate',
                       'preview')),
  period             TSTZRANGE NOT NULL, -- usage time covered
  account_id         UUID REFERENCES accounts (id),   -- null: every account
  received_cutoff    TIMESTAMPTZ NOT NULL,            -- events received later wait for a later run
  supersedes_run_id  UUID REFERENCES rating_runs (id),
  code_version       TEXT NOT NULL,      -- the rater build, so a rerun is reproducible
  status             TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed',
                       'superseded')),
  reason             TEXT,               -- why a rerate ran: the bug, the correction batch
  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at       TIMESTAMPTZ
);

ALTER TABLE rated_usage
  ADD CONSTRAINT rated_usage_rating_run_fkey FOREIGN KEY (rating_run_id)
    REFERENCES rating_runs (id);

CREATE TABLE usage_corrections (         -- why a set of events was restated
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID REFERENCES accounts (id),     -- null: a fleet-wide meter bug
  meter            TEXT NOT NULL REFERENCES meters (code),
  affected_during  TSTZRANGE NOT NULL,
  reason           TEXT NOT NULL CHECK (reason IN ('meter_bug', 'duplicate_source',
                     'late_data', 'customer_dispute', 'provider_fault', 'fraud',
                     'policy_change')),   -- policy_change: e.g. denied requests no longer billed
  direction        TEXT NOT NULL CHECK (direction IN ('increase', 'decrease', 'void', 'mixed')),
  rerate_run_id    UUID REFERENCES rating_runs (id),  -- the run that applied it
  created_by       TEXT NOT NULL,        -- typed actor
  approved_by      TEXT,                 -- required before an increase reaches an invoice
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (direction <> 'increase' OR approved_by IS NOT NULL OR rerate_run_id IS NULL)
);

ALTER TABLE usage_events
  ADD CONSTRAINT usage_events_correction_fkey FOREIGN KEY (correction_id)
    REFERENCES usage_corrections (id),
  ADD CONSTRAINT usage_events_correction_pair CHECK ((corrects_id IS NULL) =
    (correction_id IS NULL));

CREATE INDEX usage_events_rating ON usage_events (account_id, meter, lower(occurred_during));
CREATE INDEX usage_events_corrects ON usage_events (corrects_id) WHERE corrects_id IS NOT NULL;
```

Rating one hour of a duration meter, with per-session minimums and increments, the most specific SKU and the price version in effect at the usage time. `$1` is the run, `$2` the hour:

```sql
WITH run AS (
  SELECT * FROM rating_runs WHERE id = $1
),
effective AS (                           -- received before the cutoff, not superseded
  SELECT e.*
  FROM usage_events e, run
  WHERE e.occurred_during && $2::tstzrange
    AND e.received_at <= run.received_cutoff
    AND (run.account_id IS NULL OR e.account_id = run.account_id)
    AND NOT EXISTS (SELECT 1 FROM usage_events c
                    WHERE c.corrects_id = e.id AND c.received_at <= run.received_cutoff)
),
per_session AS (                         -- a minimum applies per launch or job, not per hour
  SELECT e.account_id, e.resource_id, e.meter,
         e.dimensions - m.session_dimension - 'session_start' AS priced_dims,
         e.dimensions ->> m.session_dimension AS session,
         bool_or(e.dimensions ? 'session_start') AS starts_here,  -- the session began this hour
         SUM(EXTRACT(EPOCH FROM upper(e.occurred_during * $2::tstzrange)
                              - lower(e.occurred_during * $2::tstzrange))) AS seconds
  FROM effective e JOIN meters m ON m.code = e.meter
  WHERE m.kind = 'duration'
  GROUP BY 1, 2, 3, 4, 5
),
matched AS (                             -- most specific SKU for the meter, region and dimensions
  SELECT DISTINCT ON (p.account_id, p.resource_id, p.session, p.meter)
         p.*, s.id AS sku_id, s.min_billable, s.billing_increment
  FROM per_session p
  JOIN skus s ON s.meter = p.meter
             AND p.priced_dims @> s.dimension_match
             AND (s.region_id IS NULL OR s.region_id = p.priced_dims ->> 'region')
  ORDER BY p.account_id, p.resource_id, p.session, p.meter,
           s.match_priority DESC, (s.region_id IS NOT NULL) DESC
),
billable AS (                            -- minimum once per session, then round up to increment
  SELECT m.*,
         CEIL(GREATEST(m.seconds,
                       CASE WHEN m.starts_here THEN COALESCE(m.min_billable, 0) ELSE 0 END)
              / COALESCE(m.billing_increment, 1)) * COALESCE(m.billing_increment, 1) AS quantity
  FROM matched m
)
INSERT INTO rated_usage (account_id, resource_id, sku_id, price_version_id, rated_during,
                         quantity, currency, amount, rating_run_id)
SELECT b.account_id, b.resource_id, b.sku_id, pv.id, $2, SUM(b.quantity), pv.currency,
       SUM(b.quantity) * pv.unit_price, $1  -- flat shape; tiers and caps are trued up at close
FROM billable b
JOIN accounts a ON a.id = b.account_id
JOIN LATERAL (                           -- the account's contract book first, then list
  SELECT pv.* FROM price_versions pv
  WHERE pv.sku_id = b.sku_id
    AND pv.valid_during @> lower($2::tstzrange)   -- usage time, never NOW()
    AND pv.price_book IN (a.price_book, 'list')
  ORDER BY (pv.price_book = 'list')      -- a contract price beats list
  LIMIT 1
) pv ON TRUE
GROUP BY b.account_id, b.resource_id, b.sku_id, pv.id, pv.currency, pv.unit_price;
```

`accounts.price_book` names the book an account rates at: `list` for self-serve, a contract id for private pricing, the reseller agreement's book for a reseller's own invoice; a SKU missing from a contract book falls through to list. Commitment rates are a separate book that [Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#how-to-build-it) applies at stage 4, not here. The `session_start` marker is a dimension the collector sets on the first event of a launch or job, so the minimum is charged once per session however many hours it spans. Monthly caps and tiers are trued up by the period-close run below.

Allowances at period close, consumed in usage-time order with a running sum, so the first units of the period are the included ones on every rerun. `$1` is the period-close run, `$2` the subscription period:

```sql
WITH ordered AS (
  SELECT ru.id, ru.quantity, ru.rated_during, pv.unit_price,
         (plv.included ->> s.code)::numeric AS allowance,
         SUM(ru.quantity) OVER (PARTITION BY ru.account_id, ru.sku_id
                                ORDER BY lower(ru.rated_during), ru.id) AS running
  FROM rated_usage ru
  JOIN skus s ON s.id = ru.sku_id
  JOIN price_versions pv ON pv.id = ru.price_version_id
  JOIN subscriptions sub ON sub.account_id = ru.account_id AND sub.current_term && $2::tstzrange
  JOIN plan_versions plv ON plv.id = sub.plan_version_id AND plv.included ? s.code
  WHERE ru.rating_run_id = $1 AND ru.rated_during <@ $2::tstzrange
)
UPDATE rated_usage ru
SET included_quantity = LEAST(r.quantity, GREATEST(0, r.allowance - (r.running - r.quantity))),
    amount = (r.quantity - LEAST(r.quantity, GREATEST(0, r.allowance - (r.running - r.quantity))))
             * r.unit_price
FROM ordered r
WHERE ru.id = r.id;
```

The period-close run is a fresh run, not an edit of the hourly ones: it rerates the period's effective events with tiers, caps and allowances applied over the whole period and supersedes the provisional hourly runs, so the update above touches only its own rows.

Notes on the sketch:

- **The meter registry is the contract between service teams and billing.** A new meter is a row with an owner, a kind, allowed dimensions and a lateness window before any event may name it; the foreign key makes an unregistered meter a failed insert instead of unbilled usage.
- **Usage time picks the price.** `valid_during @> lower(rated_during)` never uses `NOW()`, so a rerun next quarter prices the same hour the same way, and a price change takes effect exactly at its boundary.
- **Minimums are per session.** The session dimension and the start marker make "a 1 minute minimum charge per-instance" mean per launch, not per hour of a long-running instance.
- **Corrections restate, never subtract.** The effective set excludes superseded events, so a correction carries the full corrected quantity; a void is a correction of zero. Chains resolve to the latest.
- **Runs supersede, never update.** Hourly runs are provisional and visible to cost reports; the period-close run is authoritative for the invoice; a rerate after close produces adjustments by diff.
- **Pass-through is just another SKU.** A send event matches the segment SKU on the `sms.segments` meter and the carrier-fee SKU (marked `pass_through = 'carrier'`, with `dimension_match` on the carrier) on `sms.messages`, so the two amounts can never blend.
- **Events:** `usage.quarantined` (undeclared dimension or unknown meter), `rating_run.completed`, `rating_run.superseded`, `usage.corrected` and `usage.rated` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to cost exports, budgets, anomaly detection and the invoice run.

## Auditing

- **From invoice line to meter.** Every invoice line resolves to `rated_usage` rows, each to the run that produced it and its price version, and each run to the effective events it read, so a disputed charge can be rebuilt from facts and shown to the customer as usage, not as a total.
- **Every correction with its reason.** Which events were restated, by whom, why, who approved an increase, and which rerate applied it; a correction that raised a customer's bill without approval is a finding.
- **Rerun equality.** Periodically rerate a closed period from events and price versions and diff against what was invoiced; any difference not explained by a correction is a rating bug or a mutated input.
- **Meter completeness.** Compare each meter's event counts and quantities with the service's own operational telemetry (instances launched, requests served, messages sent); a gap is lost revenue or phantom usage.
- **Pass-through against suppliers.** Rated carrier, registry and license fees against the suppliers' invoices for the same period, by supplier identifier.
- **Quarantine.** Events quarantined for unknown meters or dimensions, how long they waited, and how they were resolved, because quarantined usage is either unbilled or billed late.

Retention follows the billing and tax records the events support: raw events and runs for as long as an invoice built from them can be disputed or audited, which is longer than any operational telemetry is kept ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records)).

## What This Means for the System You Build

- **Register meters before they emit,** with a kind, unit, aggregation, allowed dimensions, lateness window and owner.
- **Record true lifetimes and counts in the meter,** and apply minimums, increments, tiers and caps in rating.
- **Apply minimums per session,** the way providers word them: per instance launch, per job.
- **Price by usage time,** from effective-dated price versions, and never by processing time.
- **Consume allowances in usage-time order** so reruns agree.
- **Rate pass-through fees as separate SKUs** from the same event, so revenue, margin, tax and supplier reconciliation stay right.
- **Treat duplicates as no-ops, late events as adjustments, and corrections as new events** grouped under a reason.
- **Make every rating run reproducible and supersedable,** and diff reruns to produce adjustments.
- **Keep the pipeline order fixed:** rate, allowances, commitments, credits, invoice and tax, collect; nothing rounds before the invoice line.

## References

**Provider documentation**

- [AWS: EC2 On-Demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/), per-second billing with a 60-second minimum, SLES per hour, 100 GB of free monthly egress
- [AWS: S3 pricing](https://aws.amazon.com/s3/pricing/), storage measured in GiB over time stored, free first 100 GB of egress aggregated across services
- [AWS: What's New, Amazon S3 no longer charges for several HTTP error codes](https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-no-charges-several-http-error-codes), unauthorized requests from outside the account free, May 13 and August 19, 2024
- [AWS: Detecting unusual spend with Cost Anomaly Detection](https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad.html), runs about three times a day, Cost Explorer data up to 24 hours delayed
- [DigitalOcean: Droplet pricing](https://www.digitalocean.com/pricing/droplets), per-second billing effective January 1, 2026, the minimum, the $4.00 and $0.00595 Basic Droplet
- [DigitalOcean: Droplet pricing details](https://docs.digitalocean.com/products/droplets/details/pricing/), the 60-second or $0.01 minimum, the 672-hour cap, powered-off billing, uncapped v5 Droplets
- [DigitalOcean: Billing](https://docs.digitalocean.com/platform/billing/), monthly accrual and invoicing on the first of the month
- [Akamai: Understanding how billing works](https://techdocs.akamai.com/cloud-computing/docs/understanding-how-billing-works), hourly accrual, partial hours rounded up, the monthly cap and uncapped services from July 1, 2026
- [Hetzner: Cloud billing FAQ](https://docs.hetzner.com/cloud/billing/faq/), hourly rounding, the monthly price cap, billing while off, traffic in 100 MB blocks
- [Hetzner: Price adjustment](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/), the 15 June 2026 change for new orders and rescales, old and new CX23 prices, orders placed before the date
- [Vercel: Fluid compute pricing](https://vercel.com/docs/fluid-compute/pricing), active CPU, provisioned memory and invocation meters, regional prices, Hobby allowances and the São Paulo worked example
- [Cloudflare: Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), the Paid plan's minimum, allowances and overage, no charge for duration, the 15-million-request example
- [Cloudflare: D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), rows read and written, how scans and indexes count
- [GitHub Docs: Actions runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing), per-minute rates by runner and rounding up per job
- [Twilio: SMS pricing for the United States](https://www.twilio.com/en-us/sms/pricing/us), per-segment price, carrier fees per message and the failed message fee, current as of October 2026
- [Microsoft: Azure Retail Prices API](https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Service%20Bus%27%20and%20armRegionName%20eq%20%27eastus%27%20and%20skuName%20eq%20%27Standard%27), Service Bus Standard base unit and graduated operations tiers in East US
- [Google Cloud: Create, edit, or delete budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets), cost reporting delay and budgets tracking the first two days of the next month
- [Stripe Docs: Create and configure a meter](https://docs.stripe.com/billing/subscriptions/usage-based/meters/configure), aggregation formulas, raw and pre-aggregated ingestion, 24-hour cancellation window
- [Stripe Docs: Record usage for billing](https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage), asynchronous processing and the Metronome recommendation for new integrations

**Announcements**

- [AWS News Blog: Amazon EC2 beta](https://aws.amazon.com/blogs/aws/amazon_ec2_beta/), August 2006 launch at 10 cents per clock hour
- [AWS News Blog: Per-second billing for EC2 instances and EBS volumes](https://aws.amazon.com/blogs/aws/new-per-second-billing-for-ec2-instances-and-ebs-volumes/), September 18, 2017 announcement, effective October 2, the one-minute minimum
- [Google Cloud Blog: Extending per-second billing in Google Cloud](https://cloud.google.com/blog/products/gcp/extending-per-second-billing-in-google), September 26, 2017, the one-minute minimum and covered services
- [AWS News Blog: Lambda 1 ms billing granularity](https://aws.amazon.com/blogs/aws/new-for-aws-lambda-1ms-billing-granularity-adds-cost-savings/), December 1, 2020, the 27.55 ms example and the monthly comparison
- [Cloudflare Blog: Workers pricing, scale to zero](https://blog.cloudflare.com/workers-pricing-scale-to-zero/), September 28, 2023 move to CPU-time billing and its migration dates
- [Stripe: Stripe completes Metronome acquisition](https://stripe.com/newsroom/news/stripe-completes-metronome-acquisition), January 14, 2026, and the named users

**Filings**

- [Twilio: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1447669/000144766926000021/twlo-20251231.htm), fee pass-through raising revenue and cost of revenue with gross profit unaffected
- [Bandwidth: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1514416/000151441626000017/band-20251231.htm), messaging surcharges as a separate revenue line

**Reference**

- [Lago](https://www.getlago.com/), open-source metering and billing under AGPLv3, self-hosting options
- [OpenMeter](https://openmeter.io/), usage metering under Apache 2.0, offered by Kong
