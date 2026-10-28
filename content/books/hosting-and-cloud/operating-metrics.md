+++
title = "Operating Metrics"
description = "The numbers providers run on: ARR, net dollar retention, churn and renewal rates, ARPU, gross margin with pass-through, utilization, capex and cost per unit."
category = "Hosting & Cloud Industry"
order = 2210
part = "Running the Provider"
tags = ["metrics", "arr", "net-retention", "gross-margin", "unit-economics"]
+++

Every company in this volume reports the same handful of numbers to its investors and runs on them internally: how much recurring revenue it has, how much its existing customers grew or shrank, how many customers left, how much each earns, what share of revenue is left after the cost of serving it, how full its machines are, and how much it is spending to build more. The names are shared across the industry. The definitions are not. DigitalOcean's ARR is a quarter times four; Nebius's is a month times twelve. Cloudflare's net retention excludes free users who upgrade; Twilio's net expansion compares a cohort's quarter with the same quarter a year earlier; Bandwidth reports a net retention rate and a separate customer retention rate. Two providers with "120% net retention" can be doing very different things.

This chapter covers the metrics as providers publish and define them: recurring revenue (ARR and run rate), net dollar retention and its variants, customer counts and their redefinitions, churn and renewal rates for hosting and domains, revenue per customer, gross margin and the distortion pass-through fees cause, utilization, capital intensity and contracted backlog, and cost per unit. It ends with tables that make every metric a versioned definition computed from [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), so the number in the board deck can be rebuilt from the usage and invoices behind it.

The method belongs to the playbook: [One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric) for what a definition contains and why it is versioned, [Measure Cost per Unit](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total) for unit cost, and [Subscriptions & Recurring Billing](/docs/payments/subscriptions) for MRR from subscriptions. The GPU providers' backlog and capacity figures are [The Neocloud Business](/books/hosting-and-cloud/gpu-and-ai-clouds#the-neocloud-business)'s.

## How the Providers Do It

| Provider | Recurring revenue | Retention metric | Customer count | Margin reported |
| --- | --- | --- | --- | --- |
| **DigitalOcean** | ARR $970 million: most recent quarter's revenue times four | Net dollar retention 100% (98% in 2024), computed monthly and averaged | About 21,000 customers spending over $500 a month, 60% of revenue; 628 over $100,000 a year | Gross margin about 60% (2025) |
| **Cloudflare** | Not reported as ARR | Dollar-based net retention 120% in Q4 2025 (111% a year earlier) | About 332,000 paying customers; 4,298 paying over $100,000 a year | Not covered here |
| **Fastly** | Not reported as ARR | Trailing-twelve-month net retention 110.1%; annual revenue retention 98.7% | 3,092 customers; 628 enterprise customers, 94% of annualized revenue | Gross margin 57% (2025) |
| **Twilio** | Not reported as ARR | Dollar-based net expansion rate 108% | About 402,000 active customer accounts (at least $5 of revenue in the period's last month) | Gross margin 49% GAAP (2025) |
| **Bandwidth** | Not reported as ARR | Net retention rate 98% (122% in 2024); 12-month customer retention above 98.8% | Not covered here | Gross margin 39% GAAP, 58% non-GAAP (2025) |
| **Datadog** | ARR used for customer bands | Trailing-twelve-month dollar-based net retention "about 120%" | About 32,700 customers; 4,310 over $100,000 of ARR, 90% of ARR | Not covered here |
| **GitLab** (fiscal year to January 31, 2026) | ARR used for customer bands | Dollar-based net retention 118% (123% a year earlier) | 1,456 customers over $100,000 of ARR | Not covered here |
| **GoDaddy** | Bookings $5.40 billion against revenue $4.95 billion | Customer retention about 85% each year for five years; about 90% for customers over three years | 20.4 million customers | Not covered here |
| **Verisign** | Not applicable | .com and .net renewal rate 75.4% (third quarter 2025, against 72.2% a year earlier) | 173.5 million names | Not covered here |
| **OVHcloud** (fiscal year to August 31, 2025) | Not reported as ARR | Net revenue retention 105% | About 1,200 customers above €100,000 of ARR | Adjusted EBITDA margin 40.4% |
| **Nebius** (Q2 2026) | ARR $3.0 billion: last month's AI cloud revenue times twelve | Not covered here | Not covered here | Adjusted EBITDA margin for AI cloud 50% |

Three patterns run through the table:

- **Usage businesses report retention in dollars, subscription businesses in customers.** The clouds, CDNs and CPaaS report what existing customers spent this year against last; hosting and domains report how many customers or names renewed. The first measures expansion; the second measures whether customers stayed, and a usage business can lose many small customers while retention in dollars rises.
- **The definition is in the footnote, and it moves.** DigitalOcean removed customers spending $50 to $500 a month from its customer count in the fourth quarter of 2025; Twilio's active accounts need $5 of revenue in the period's last month; Cloudflare's net retention excludes free customers who upgrade. Comparisons across providers need the footnotes side by side.
- **Margin depends on what passes through.** Bandwidth's GAAP gross margin is 39% and its non-GAAP margin 58%, largely because surcharges collected for carriers carry no margin; a provider that bills registry, carrier or license fees has the same gap.

## Recurring Revenue: ARR and Run Rate

ARR in this industry is almost never a sum of contracts. It is a recent period's revenue annualized:

- **DigitalOcean:** "We calculate ARR by multiplying total revenue for the most recent quarter by four." ARR was $723 million in 2023, $820 million in 2024 and $970 million in 2025, against 2025 revenue of $901.4 million.
- **Nebius:** last month's AI cloud revenue times twelve, which moves faster than a quarter-based figure and moves more with a single month's usage ([The Neocloud Business](/books/hosting-and-cloud/gpu-and-ai-clouds#the-neocloud-business)).
- **Datadog and GitLab** use ARR per customer to set the bands they report (customers over $100,000, over $1 million), with the definition in their filings.

For a usage business the annualized figure is a run rate, not a promise: most of DigitalOcean's customers are month to month, and its 10-K notes that most contracts don't require a specific term, so customers can leave without notice. Contracted revenue is a different number, and the AI-era providers now lead with it: Oracle's remaining performance obligations were $638 billion at May 31, 2026, Microsoft's commercial remaining performance obligations $678 billion at June 30, 2026, and CoreWeave's $60.7 billion at the end of 2025 ([The Neocloud Business](/books/hosting-and-cloud/gpu-and-ai-clouds#the-neocloud-business)). My rule is to report run rate and contracted backlog side by side and never add them.

For a subscription business the annualized figure is MRR from active subscriptions times twelve, and the playbook's subscription model gives it; the hosting twist is that most revenue is prepaid for one to four years and recognized monthly, so bookings and revenue diverge. GoDaddy's 2025 bookings were $5.40 billion against revenue of $4.95 billion.

## Net Dollar Retention and Its Variants

Net dollar retention asks what last year's customers spend now. Every provider computes it differently enough that the definition is part of the number:

| Provider | Name | Cohort | Comparison | Excluded |
| --- | --- | --- | --- | --- |
| DigitalOcean | Net dollar retention rate | Customers with IaaS and PaaS or SaaS revenue in the same month a year earlier | Their current month's revenue over the prior month's, computed monthly; quarterly and annual figures are averages of monthly rates | New customers; re-engaged customers are counted in the current period |
| Cloudflare | Dollar-based net retention | Paying customers four quarters earlier | Annualized revenue now over then | New customers, professional services, free users who upgrade |
| Twilio | Dollar-based net expansion rate | Active customer accounts in the prior-year quarter | Their revenue this quarter over that quarter | New accounts |
| Fastly | Net retention rate (trailing twelve months) | Customers in the prior period | Trailing revenue comparison; reported with a separate annual revenue retention rate | Not covered here |

The DigitalOcean definition shows the mechanics a provider must decide. Computing monthly then averaging smooths a single bad month; including re-engaged customers lets a customer who left and came back count as retained; restricting to IaaS and PaaS revenue keeps one-off items out. Each choice moves the result by a point or two, and none of them is wrong. Net retention also responds to the provider's own pricing: a price increase on existing products raises it without any customer using more, which is why Hetzner's April 2026 increase on existing products, driven by memory and SSD costs, would show in a retention metric as expansion.

Fastly's second number, **annual revenue retention**, is the one that isolates churn: what share of last year's revenue was not lost to customers who left or shrank, before counting expansion. Net retention can be 110% while revenue retention falls, if growth from the largest customers hides losses among the rest.

## Customers, Churn and Renewal

Customer counts carry the most definitional risk, because "a customer" can mean an account, a paying account, an account above a threshold or an organization:

- **Thresholds.** Twilio counts an active customer account only if it produced at least $5 of revenue in the period's last month. DigitalOcean now counts as "Digital Native Enterprise" customers those spending more than $500 a month. Datadog counts accounts with an active subscription and counts an organization with several divisions once.
- **Redefinitions.** DigitalOcean's fourth-quarter 2025 change removed the customers it had called Builders (over $50 and at most $500 a month) from the total, and it stopped leading with ARPU, which it had reported quarterly ($108.56 in the first quarter of 2025, $111.70 in the second). A redefinition breaks every chart that spans it; the old series has to be kept, labelled, alongside the new.
- **Errors.** Cloudflare's 10-K discloses that a system error in the first quarter of 2022 overstated paying customers by 5,925. Counts are computed, and computations have bugs; a restatement must be possible.

Churn is the complement, and in a usage business it is rarely reported directly. Cloudflare's risk factors note that churn includes pay-as-you-go customers converting to free plans, so a customer can churn without leaving. DigitalOcean's risk factors warn of "high rates of customer churn" because customers can leave without notice. The usable definitions:

- **Logo churn:** customers active at the start of the period and not at the end, over customers at the start, with the threshold that defines "active" written down.
- **Revenue churn:** revenue lost from customers who left or shrank, over starting revenue; the complement of revenue retention.
- **Downgrade to free:** counted separately, because the account still exists and may come back.

Hosting and domains are subscription businesses and report **renewal**:

- **Customer retention.** GoDaddy reports retaining about 85% of customers in each of the last five years (84% in 2024, which it attributes to divestitures, migrations and product end of life), about 90% for customers who have been with it more than three years, and more than 89% of 2025 revenue from customers it had the year before.
- **Name renewal.** Verisign reports the .com and .net renewal rate: 75.4% in the third quarter of 2025, against 72.2% a year earlier. A blended rate mixes names in their first renewal with names that have renewed for years, so a registrar needs the rate by renewal number, the same cohort view as hosting below.

The hosting renewal rate has a twist the cloud metrics don't: the intro term. A plan bought at an introductory price renews at list, so first renewal is where most customers leave, and the renewal rate by term number (first, second, later) is the metric that matters. The core model's `subscription_periods.pricing_phase` makes it computable. The law of the renewal notice that sits at the same point is Subscriptions, Renewals & Cancellation Law.

## Revenue per Customer

ARPU is revenue in a period over average customers in it, and in this industry it is mostly a mix metric. DigitalOcean's rose 12% to 14% a year through 2025 while it shifted toward larger customers, then the company stopped headlining it when it redefined customers. GoDaddy's figure moves with domain mix and product attach. Two practices make ARPU useful:

- **Report by band, not on average.** The long tail described in [How Big It Is](/books/hosting-and-cloud/hosting-and-cloud-business#how-big-it-is) means an average over Cloudflare's 332,000 paying customers says little; Cloudflare reports the 4,298 over $100,000, DigitalOcean reports the share of revenue from customers over $500 a month, and Fastly the share from enterprise customers (94%).
- **Separate pass-through.** ARPU that includes registry or carrier fees rises when the registry raises its price, which is not the provider earning more.

## Gross Margin and Pass-Through

Gross margin is revenue less the cost of serving it, over revenue, and for a provider the cost is mostly depreciation of equipment, data center space and power, bandwidth, third-party licenses and fees passed through to the layer below. The reported figures span a wide range:

| Provider | Gross margin, 2025 | What drives it |
| --- | --- | --- |
| DigitalOcean | About 60% ($539.6 million on $901.4 million) | Owned servers in leased data centers |
| Fastly | 57% (54% in 2024) | Network capacity and bandwidth |
| Twilio | 49% GAAP, 51% non-GAAP | Carrier fees, passed through, and international messages at lower margin |
| Bandwidth | 39% GAAP, 58% non-GAAP | $192.4 million of messaging surcharges collected for carriers |

The CPaaS rows show the distortion the foundation chapter describes ([How the Money Is Made](/books/hosting-and-cloud/hosting-and-cloud-business#how-the-money-is-made)): passing a carrier fee through raises revenue and cost of revenue together, leaving gross profit dollars flat and the percentage lower. A provider that wants a readable margin computes it twice, with and without pass-through SKUs, from the `skus.pass_through` flag.

Segment operating margin is the hyperscalers' equivalent: AWS earned $45.6 billion of operating income on $128.7 billion of net sales in 2025 (about 35%), and Google Cloud $13.9 billion on $58.7 billion (about 24%). Oracle reports infrastructure revenue but not its profit.

## Utilization

Utilization is the share of capacity that is earning, and it is the number that decides a provider's margin. It is also the number almost nobody publishes. The Borg paper is the clearest public account of why it matters: Google described achieving high utilization through admission control, task packing, over-commitment and sharing machines between workloads with process-level isolation. The forms a provider tracks:

- **Sold versus installed.** vCPUs, memory, storage and GPUs allocated to customers over what is installed, by zone and instance type. It drives capacity orders and spot pricing.
- **Used versus sold.** What allocated capacity actually does. Over-commitment (burstable instances, shared hosting packed by entry processes and memory limits) sells capacity customers don't use at once; the gap is the provider's margin and the noisy neighbor's risk.
- **Earning hours for GPUs.** A GPU's utilization is the hours under contract or on-demand use over hours installed, and for a neocloud it is set by contracts rather than demand ([Where AI Runs](/books/hosting-and-cloud/where-ai-runs#renting-gpus-versus-paying-per-token) shows what utilization does to cost per token).
- **Shared hosting density.** Accounts per server and the share of servers above their limit thresholds; cPanel's move to account-based pricing in 2019 made density a license cost as well as a capacity one (Control Panel Licensing & the Alternatives).

## Capital Intensity and Backlog

The AI build-out moved capital spending to the top of providers' reports. Amazon's purchases of property and equipment were $54.2 billion in the second quarter of 2026 against $32.2 billion a year earlier, and its trailing free cash flow was an outflow of $7.6 billion; Oracle's fiscal 2026 free cash flow was negative $23.7 billion. OVHcloud spent €361.4 million on capex in its fiscal 2025, 33.3% of revenue, split into €128.9 million recurring and €232.5 million growth, and guided to 30% to 32% for the next year. The split matters: recurring capex replaces what exists and belongs in unit cost; growth capex buys future revenue and belongs against backlog.

Backlog (remaining performance obligations) is how investors judge whether that spending will be paid for. Oracle says most of its fiscal 2026 increase came from large AI contracts where the customer prepaid for GPUs or supplied them, totalling $75 billion. A provider reporting backlog has to say how much of it is take-or-pay, how much is prepaid, and how concentrated it is, which is what CoreWeave's 10-K does for its largest customer.

## Cost per Unit

Unit cost is cost of revenue divided by what was delivered: per VM-hour, per GB-month stored, per GB delivered, per million requests, per message, per hosted account, per GPU-hour, per million tokens. It is the number pricing should be set from and the one that shows when a supplier's change hits. Hetzner's 2026 increases are the public case of unit cost flowing into list price: the company cited "drastically increased operating expenses" and memory and SSD costs for its April 1, 2026 increase on new orders and existing products, and its June 15, 2026 standardization raised shared cloud types by about 30% to 40% and dedicated-vCPU types often by more than 100% for new orders and rescales.

The method (allocate shared costs, divide by delivered units, review the trend) is the playbook's [Cost & FinOps](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total). The provider-specific rules: compute unit cost from the same `rated_usage` quantities customers are billed for, so cost and price share a denominator; keep pass-through out of the provider's own unit cost; and split depreciation by the useful life the finance team uses, because a change in that assumption (CoreWeave's move from five to six years for technology equipment) changes reported unit cost without changing anything that runs.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Who uses it |
| --- | --- | --- | --- | --- |
| **Metrics from the billing system** | Computed from invoices, usage and subscriptions in one database | Reconciles to revenue; one definition per metric | Needs the core model to be complete; slow to add new dimensions | Providers with a single billing model |
| **Metrics in the warehouse** | Billing and usage replicated to a warehouse, metrics as models | Joins with product and support data; fast iteration | Two sources of truth unless reconciled daily; definitions drift between models | Most providers above a few hundred employees |
| **Subscription analytics products** | MRR, churn and cohorts computed by a billing vendor's analytics | Free with the billing tool | Subscription-shaped; can't see usage revenue or pass-through, and the vendor's definition becomes yours | Smaller SaaS-like hosts |
| **Investor metrics computed separately by finance** | Spreadsheets from finance's ledger | Matches the audited numbers | Can't be rebuilt by engineering; diverges from operating dashboards | Common, and the source of most definitional disputes |

## My Default

My default is one versioned definition per metric, computed from the core model's usage, invoice and subscription tables in the warehouse, reconciled daily to the billing system's totals, with published values frozen and restatements as new rows. I'd report net dollar retention and revenue retention together, logo churn with its threshold written beside it, renewal by term number for any prepaid product, gross margin with and without pass-through, and run rate next to backlog without adding them. For a hosting or domain business I'd lead with renewal by cohort and term; for a usage business, with net and gross revenue retention by spend band.

What would change this: a provider about to file publicly should let the definitions in its filings drive the internal ones, rather than the reverse, because a footnote once filed is expensive to change; and a provider whose revenue is mostly a few contracts should lead with contracted backlog and concentration, because its retention rate is a statement about three customers.

## How to Build It

The chapter adds the two tables the foundation names, `metric_definitions` and `metric_values`, and shows two definitions computed from the core model. Spend bands and cohorts are views over `invoice_lines`, not tables of their own.

```sql
CREATE TABLE metric_definitions (        -- one definition per metric, versioned
  key            TEXT NOT NULL,          -- 'ndr_monthly', 'arr_quarter_x4', 'logo_churn',
                                         -- 'renewal_rate_by_term', 'gross_margin_ex_pass'
  version        INT NOT NULL,
  unit           TEXT NOT NULL CHECK (unit IN ('ratio', 'amount', 'accounts', 'names',
                   'hours', 'per_unit')),
  population     TEXT NOT NULL,          -- 'paying_accounts', 'spend_over_500_month',
                                         -- 'domains_up_for_renewal'
  revenue_scope  TEXT NOT NULL CHECK (revenue_scope IN ('all', 'exclude_pass_through',
                   'pass_through_only', 'not_revenue')),
  exclusions     TEXT NOT NULL,          -- new customers, free, internal, test, services
  clock          TEXT NOT NULL,          -- 'service_period', 'invoice_finalized_at',
                                         -- 'utc_month', 'expiry_date'
  comparison     TEXT,                   -- 'same_month_prior_year', 'four_quarters_prior'
  aggregation    TEXT,                   -- 'average_of_monthly', 'point_in_time'
  formula_ref    TEXT NOT NULL,          -- the SQL or model in version control
  history_policy TEXT NOT NULL CHECK (history_policy IN ('frozen', 'recomputed')),
  published_as   TEXT[],                 -- '10-K', 'earnings_release', 'board', 'internal'
  owner          TEXT NOT NULL,
  valid_during   DATERANGE NOT NULL,
  PRIMARY KEY (key, version)
);

CREATE TABLE metric_values (             -- computed, frozen when published
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  metric_key     TEXT NOT NULL,
  metric_version INT NOT NULL,
  period         DATERANGE NOT NULL,
  scope          JSONB NOT NULL DEFAULT '{}',  -- {"product": "compute"}, {"band": "over_100k"},
                                         -- {"region": "fra1"}, {"term_number": 1}
  value          NUMERIC NOT NULL,
  numerator      NUMERIC,
  denominator    NUMERIC,
  currency       CHAR(3),                -- for amounts
  computed_at    TIMESTAMPTZ NOT NULL,
  frozen_at      TIMESTAMPTZ,            -- published, filed or used for compensation
  supersedes_id  UUID REFERENCES metric_values (id),  -- a restatement is a new row
  reconciled_to  TEXT,                   -- the billing or ledger total it was checked against
  FOREIGN KEY (metric_key, metric_version) REFERENCES metric_definitions (key, version)
);
```

```sql
-- Net dollar retention for one month, the DigitalOcean shape: customers with revenue
-- in the same month a year earlier, their revenue now over then, pass-through excluded.
WITH monthly AS (
  SELECT i.account_id,
         date_trunc('month', lower(il.service_period)) AS month,
         SUM(il.amount)                                AS revenue
  FROM invoice_lines il
  JOIN invoices i ON i.id = il.invoice_id
  LEFT JOIN skus s ON s.id = il.sku_id
  WHERE i.status <> 'void'
    AND il.line_kind IN ('charge', 'usage', 'credit', 'adjustment')
    AND s.pass_through IS NULL
    AND i.currency = 'USD'            -- or convert at the definition's stated rate
  GROUP BY 1, 2
),
prior AS (
  SELECT account_id, revenue FROM monthly
  WHERE month = date_trunc('month', $1::date) - INTERVAL '12 months' AND revenue > 0
)
SELECT SUM(COALESCE(m.revenue, 0)) / SUM(p.revenue) AS ndr
FROM prior p
LEFT JOIN monthly m ON m.account_id = p.account_id
                   AND m.month = date_trunc('month', $1::date);

-- Renewal rate by term number for prepaid hosting: of periods that ended in the month,
-- how many were followed by another period of the same subscription.
SELECT sp_rank.term_number,
       COUNT(*)                                           AS up_for_renewal,
       COUNT(*) FILTER (WHERE next_sp.id IS NOT NULL)      AS renewed,
       COUNT(*) FILTER (WHERE next_sp.id IS NOT NULL)::numeric / COUNT(*) AS renewal_rate
FROM (
  SELECT sp.*, ROW_NUMBER() OVER (PARTITION BY sp.subscription_id
                                  ORDER BY lower(sp.valid_during)) AS term_number
  FROM subscription_periods sp
) sp_rank
LEFT JOIN subscription_periods next_sp
  ON next_sp.subscription_id = sp_rank.subscription_id
 AND lower(next_sp.valid_during) = upper(sp_rank.valid_during)
WHERE upper(sp_rank.valid_during) >= $1::date
  AND upper(sp_rank.valid_during) <  $1::date + INTERVAL '1 month'
GROUP BY sp_rank.term_number
ORDER BY sp_rank.term_number;
```

Notes on the sketch:

- **The definition carries the footnote.** Population, exclusions, clock, comparison and aggregation are the five places provider definitions differ in the table above; storing them as columns makes "which NDR is this?" answerable from the row.
- **`revenue_scope` keeps pass-through honest.** Every revenue metric states whether registry, carrier and license fees are in it, using the core `skus.pass_through` flag, so margin and ARPU can be reported both ways from one definition each.
- **Values freeze and restate.** A number published in an earnings release, filed, or used for a sales commission sets `frozen_at`; a correction (Cloudflare's overstated customer count is the public example) is a new row that supersedes it, and the original stays readable.
- **Reconcile before freezing.** `reconciled_to` names the billing or ledger total the value was checked against ([Reconcile to the Source](/docs/architecture/data-pipelines#reconcile-to-the-source)); a value that can't be reconciled isn't frozen.
- **Redefinitions are new keys or versions, never edits.** DigitalOcean's customer redefinition is the case: the old definition's series ends on a date, the new one starts, and both stay computable.
- **Events:** `metric.frozen` and `metric.restated` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to reporting and investor tools.

## Auditing

- **Every published number and its definition version,** so a figure in a filing, a deck or a commission plan can be recomputed exactly as it was.
- **Restatements with their reason,** linked to the values they replace.
- **Definition changes** with author, reviewer, effective date and the before-and-after values for the last frozen period, because a redefinition that improves a metric will be asked about.
- **Reconciliation results,** daily, between metric inputs and the billing system's totals.

## What This Means for the System You Build

- **Define every metric once, versioned,** with its population, exclusions, clock and comparison written into the definition.
- **Report net and gross revenue retention together,** and logo churn with its threshold.
- **Measure renewal by term number** for any prepaid product, because the intro term is where customers leave.
- **Compute margin and ARPU with and without pass-through,** from the SKU flag.
- **Keep run rate and contracted backlog separate,** and state how backlog is concentrated.
- **Track utilization as sold, used and earning,** by zone, type and fabric.
- **Compute unit cost from the units customers are billed for,** and keep recurring and growth capex apart.
- **Freeze what is published and restate with new rows,** reconciled to billing before freezing.

## References

**Filings**

- [DigitalOcean: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1582961/000158296126000019/docn-20251231.htm), the ARR and NDR definitions and values, gross profit, customer bands, the Builders redefinition, concentration, churn risk
- [DigitalOcean: Q1 2025 results (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1582961/000158296125000084/a2025-q1dopressrelease.htm), ARPU $108.56
- [DigitalOcean: Q2 2025 results (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1582961/000158296125000134/a2025-q2dopressrelease.htm), ARPU $111.70
- [Cloudflare: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm), dollar-based net retention and its exclusions, paying and large customers, the 2022 customer count error, churn to free plans
- [Fastly: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1517413/000151741326000053/fsly-20251231.htm), net retention, annual revenue retention, enterprise customers, gross margin
- [Twilio: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1447669/000144766926000021/twlo-20251231.htm), active customer accounts, gross margin, pass-through
- [Twilio: Q4 2025 results (8-K Ex. 99.1)](https://www.sec.gov/Archives/edgar/data/1447669/000144766926000010/twloq425ex991.htm), dollar-based net expansion rate
- [Bandwidth: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1514416/000151441626000017/band-20251231.htm), net retention, customer retention, GAAP and non-GAAP gross margin, surcharges
- [GitLab: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1653482/000162828026018731/gtlb-20260131.htm), dollar-based net retention and customers over $100,000 of ARR
- [Datadog: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1561550/000162828026008819/ddog-20251231.htm), customers, ARR bands, net retention, the customer definition
- [GoDaddy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), customers, retention, revenue from prior-year customers, bookings and revenue
- [VeriSign: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1014473/000101447326000006/vrsn-20251231.htm), the .com and .net base and renewal rate
- [Amazon: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), AWS net sales and operating income
- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), Google Cloud revenue and operating income

**Releases**

- [Amazon: Second quarter 2026 results](https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Second-Quarter-Results), capital spending and trailing free cash flow
- [Microsoft: FY26 Q4 earnings release](https://microsoft.com/en-us/investor/earnings/fy-2026-q4/press-release-webcast), commercial remaining performance obligations
- [Oracle: Q4 fiscal 2026 results](https://s23.q4cdn.com/440135859/files/doc_earnings/2026/q4/earnings-result/4q26-pressrelease-final.pdf), remaining performance obligations, free cash flow, prepaid and customer-supplied hardware
- [OVHcloud: FY2025 results](https://corporate.ovhcloud.com/en/newsroom/news/financial-results-fy25), net revenue retention, capex split and guidance, adjusted EBITDA margin, large customers

**Pricing and cost**

- [heise: Hetzner raises prices from April 1, 2026](https://heise.de/-11185981), the increase on existing products and its stated causes
- [Hetzner Docs: Price adjustment](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/), the June 15, 2026 standardization and old and new prices

**Reference**

- [Verma et al.: Large-scale cluster management at Google with Borg](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/), EuroSys 2015, utilization through admission control, packing and over-commitment
