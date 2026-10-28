+++
title = "Cost Data, FinOps & Surprise Bills"
nav_title = "FinOps & Surprise Bills"
description = "What providers give customers to see and control spend: cost exports, CUR and FOCUS, budgets, anomaly detection, spend caps and pauses, and bill forgiveness."
category = "Hosting & Cloud Industry"
order = 2196
part = "Metering and Billing"
tags = ["finops", "cost-data", "budgets", "anomaly-detection", "billing"]
+++

A customer on usage pricing can't see its bill until the month ends, and by then the money is spent. Everything in this chapter exists to shrink that gap: cost and usage exports that show every rated line within hours, budgets that alert when spend crosses a threshold, anomaly detection that notices a spike before anyone looks, and spend caps that stop the spending instead of reporting it. The customer's practice of using these is FinOps, and the playbook's [Cost & FinOps](/docs/operations/cost-and-finops) covers it from the customer's side: unit costs, owners for every dollar, budgets per team, the levers that matter. This chapter is the provider's side: what a provider has to build so its customers can do any of that, and what it does when they can't and a bill arrives that nobody expected.

The provider's position is awkward. Every control it offers runs on its own rating pipeline, so a budget or a cap is only as fresh as the last rating run, and every vendor documents the lag. A cap that stops services stops the customer's business, so most providers offer alerts instead, and the customer who ignored the alert gets the bill. And a surprise bill that the customer can't pay is bad debt, a support case, a social media thread and sometimes a churned account, so providers forgive many of them, which makes forgiveness a policy that has to be written down and recorded like any other credit. This chapter covers cost exports and the FOCUS format, budgets and alerts, anomaly detection, spend caps and pauses, surprise bills and forgiveness, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with budgets, alerts, exports and anomalies.

## How the Providers Do It

As of October 2026:

| Provider | Cost data | Budgets and alerts | Anomaly detection | Stops spending? |
| --- | --- | --- | --- | --- |
| **AWS** | Data Exports to S3: CUR 2.0 (recommended), FOCUS 1.2 and 1.0 with AWS columns, cost optimization recommendations, carbon emissions; SQL column selection and row filters | AWS Budgets, with budget actions since October 15, 2020 (apply an IAM policy or SCP, or act on EC2 or RDS instances, automatically or after approval) | Cost Anomaly Detection: machine learning on net unblended cost, about three times a day, up to 24 hours behind; 10 days of history for a new service; root cause by service, account, Region and usage type | Only through a budget action the customer configures; the new free plan can't be charged at all |
| **Azure** | Cost Analysis in Cost Management, free for Azure subscriptions | Cost alerts, including anomaly alert rules | Daily per subscription against a forecast from the last 60 days, run 36 hours after the end of the day (UTC), using WaveNet; anomaly alert emails | The spending limit on free and credit subscriptions disables services; pay-as-you-go has none |
| **Google Cloud** | FOCUS v1.2 export listed by the FOCUS project | Budgets on actual or forecasted cost; alert budgets "don't automatically cap" usage; Pub/Sub notifications several times a day | Not covered here | Spend cap budgets for Gemini API, its agent platform, Cloud Run and Cloud Run functions pause new usage when gross estimated cost passes 100%; otherwise customers can disable billing on a project from a Pub/Sub notification |
| **Vercel** | FOCUS v1.3 export listed by the FOCUS project | Spend Management on Pro and Enterprise Flexible Commitment: an On-Demand Budget per cycle, notices at 50%, 75% and 100%, SMS at 100%, signed webhook | n/a | Optional: pause production deployments of every project, which then serve `503 DEPLOYMENT_PAUSED`; storage keeps billing; each project resumed by hand |
| **Netlify** | Usage and credits | Credit-based plans | n/a | Yes, by design: when a team exhausts its monthly credits "all projects owned by that team enter a paused state"; paid plans can buy credit packs or turn on auto recharge |
| **Cloudflare** | FOCUS v1.0 export listed by the FOCUS project | Not covered here | n/a | Free plans stop at their limits; Workers Free at 100,000 requests a day |
| **DigitalOcean** | Monthly invoice on the first for the prior month, with mid-month charges at the account's auto-charge amount | Not covered here | n/a | Developer clouds cap resources by price, not accounts by spend: Droplets never exceed their monthly price ([Metering & Rating](/books/hosting-and-cloud/metering-and-rating#allowances-tiers-and-monthly-caps)) |
| **Hetzner** | Invoices, which may come up to 28 days after the month | Traffic notifications at 75% and 100% "don't cap usage" | n/a | No; servers are capped at their monthly price |

The table splits providers into two families. **Alert-first** providers (AWS, Azure pay-as-you-go, Google Cloud, Hetzner) give data and warnings and leave stopping to the customer's own automation. **Stop-first** providers (Netlify, Vercel with pausing on, free plans everywhere, Azure's credit subscriptions, Google's new spend caps) will take the customer offline rather than bill past a limit. Neither is safe by default: the alert-first customer can wake up to a five-figure bill, and the stop-first customer can wake up to a site that served errors all night because a traffic spike was real.

## How We Got Here

- **The invoice as the only report (to the early 2010s).** Hosting bills were flat, so the invoice was the report. Utility billing broke that: a month of per-hour instances and per-gigabyte transfer produced a bill the customer couldn't reconcile with what it ran. Customers built their own tracking from provider APIs and scraped prices.
- **Line-item exports (2010s).** Providers began publishing detailed usage files: one row per resource, usage type and period, delivered to the customer's own storage. AWS's original Cost and Usage Reports survive as "Legacy CUR" beside their successor CUR 2.0, which AWS Data Exports now delivers with SQL column selection and row filters. Exports moved cost analysis out of the provider's console and into the customer's data warehouse, and created a market for cost tools.
- **Budgets that act (2020).** AWS added budget actions on October 15, 2020: when a budget threshold is crossed, apply an IAM policy or service control policy, or act on EC2 and RDS instances, automatically or after approval. It was the first hyperscaler control that could stop spending rather than report it, and it is still opt-in and customer-configured.
- **A common format (2024).** The FinOps Foundation announced general availability of FOCUS 1.0 (the FinOps Open Cost and Usage Specification) on June 20, 2024, with 43 columns and support from AWS, Microsoft, Google and Oracle; the project began in a Foundation working group about 14 months earlier and became a Joint Development Foundation specification project hosted by the Linux Foundation. By October 2026 the latest version is 1.4, and generators include AWS, Microsoft and Google Cloud at v1.2, Vercel, Snowflake, Databricks and MongoDB at v1.3, and Oracle, OVHcloud, Cloudflare and CoreWeave at v1.0.
- **Bills fixed at the source (2024).** Some surprise bills were the provider's design, not the customer's mistake. S3 billed bucket owners for requests their bucket denied, so anyone could run up a stranger's bill by hammering a private bucket; AWS announced on May 13, 2024 that unauthorized requests from outside the owner's account or organization would be free and completed the change across all S3 APIs and Regions by August 19, 2024. The same year Netlify's CEO wrote, after a bandwidth bill reported at about $104,000 on a small site, that the company's policy was not to shut down free sites during traffic spikes and to forgive bills from legitimate mistakes after the fact.
- **Caps return (2025 onward).** Developer platforms made the pause a product: Netlify's credit-based plans pause every project when credits run out, and Vercel's Spend Management can pause every production deployment at the budget. Google Cloud added spend cap budgets that pause specific services. The hyperscalers' general-purpose compute still has no account-wide cap outside free and credit-funded accounts (Free Tiers, Credits & Startup Programs covers those).

## Cost Exports: CUR and FOCUS

A cost export is the provider's rated usage, discounts, credits, taxes and fees, one row per charge, delivered on a schedule to the customer's storage, restated as the period's rating changes. It is the most important FinOps feature a provider builds, because everything a customer does with cost, from dashboards to chargeback to anomaly detection in their own tools, starts there.

What an export has to carry, whatever its format:

- **Every charge category.** Usage, purchases (an upfront reservation, a credit pack), taxes, credits, adjustments and refunds, each as its own rows, so the export sums to the invoice.
- **Three costs per row.** What the usage would have cost at list price; what the customer is billed for it; and what it effectively cost once prepaid commitments are spread over the usage they covered. FOCUS names them List Cost, Billed Cost and Effective Cost, and adds Contracted Cost for negotiated rates. Its specification says Effective Cost differs from Billed Cost when "covering charges (e.g., prepaid or postpaid commitment purchases)" are recorded separately from the charges they cover, and must equal Billed Cost for uncovered usage and for tax and credit rows. That is the provider's pipeline exposed: list cost from the list price version, billed cost after stages 4 and 5, effective cost with the commitment's purchase amortized ([The Bill Pipeline](/books/hosting-and-cloud/metering-and-rating#the-bill-pipeline)).
- **Identity and time.** Billing account, sub-account, resource ID, SKU ID, service, region, the charge period and the billing period, so a row can be joined to the customer's own inventory and to the invoice.
- **Quantities in two units.** FOCUS separates Consumed Quantity (what the meter measured) from Pricing Quantity (the units the price applies to), which is where minimums, increments and package sizes show up.
- **Tags and allocation dimensions.** Customer-defined tags on resources and the provider's cost-allocation dimensions (Autoscaling & Cost uses these for clusters), carried on every row the resource produced.
- **Restatement.** Exports are rewritten as the provider reruns rating and late usage arrives; the export for a month isn't final until the invoice is, and a customer's warehouse has to replace a period's rows, not append to them. Google's monthly budgets keep tracking costs "for the first two days of the next month" for the same reason.

**Native versus FOCUS.** A provider's native export (CUR 2.0 for AWS) carries every provider-specific column; FOCUS carries a common set that tools can read across providers, with provider columns alongside (AWS publishes "FOCUS 1.2 with AWS columns"). Supporting FOCUS is cheap for a provider whose rating pipeline already keeps list, billed and effective cost apart, and expensive for one that only knows invoice totals, which is a good reason to keep them apart from the start.

## Budgets and Alerts

A budget is an amount, a scope (account, project, tag, service), a period, the cost basis it measures, thresholds that alert, and optionally an action. Budgets are the control every provider offers and the one customers most misunderstand, because providers word them as alerts and customers read them as limits. Google is the clearest: an alerts-only budget "doesn't automatically cap Google Cloud or Google Maps Platform usage or spending"; Vercel says "setting a spend amount does not stop usage on its own."

What makes a budget useful:

- **Actual and forecast.** Google lets thresholds fire on actual cost or on cost "calculated out to the end of the current calendar budget period"; a forecast threshold at 100% warns days before an actual one.
- **The right basis.** Gross (before credits and discounts) catches a runaway resource on an account whose credits would hide it; net catches what the customer will pay. Google's spend caps use gross estimated cost; AWS anomaly detection uses net unblended cost. A budget should say which, and the provider should default to gross for credit-funded accounts, or the alert arrives the day the credits run out.
- **Machine-readable notifications.** Email is for people; automation needs events. Google sends budget notifications to Pub/Sub "multiple times per day" so a customer can disable billing on a project; Vercel posts a webhook signed with `x-vercel-signature` and a payload of `budgetAmount`, `currentSpend`, `teamId` and `thresholdPercent` at 50%, 75% and 100%; AWS budget actions run inside the provider.
- **Honest latency.** Vercel checks spend "every few minutes" and says notifications, webhooks and pauses "can trigger several minutes after you cross your spend amount"; AWS's anomaly detection can take up to 24 hours. A budget's evaluation interval and its data's age belong in the alert itself.

## Anomaly Detection

A budget catches spend that crosses a line the customer drew; anomaly detection catches spend that departs from the customer's own pattern, which is usually how a leaked key, a retry loop or a misconfigured log level shows up first. The two hyperscalers that document theirs describe the same shape with different clocks:

| | AWS Cost Anomaly Detection | Azure Cost Management |
| --- | --- | --- |
| Model | Machine learning that accounts for weekly or monthly seasonality and natural growth | Univariate time-series model trained on 60 days, WaveNet forecasting, anomaly when outside a confidence interval |
| Data | Net unblended cost, after discounts | Daily subscription usage |
| Cadence | About three times a day after billing data is processed; up to 24 hours to detect | Daily, 36 hours after the end of the day (UTC) |
| Cold start | 24 hours for a new monitor; 10 days of history for a new service | Status within 24 hours of onboarding |
| Root cause | Ranked by dollar impact across service, account, Region and usage type | Top resource group changes against the previous 60 days |
| Gaps | Excludes most Marketplace charges (use Budgets) | Not available for Azure Government; five alert rules per subscription |

Two lessons for a provider building its own. **Latency is the product.** A detector running 36 hours after the day ends will find a stolen-key GPU fleet a day and a half late; a provider whose rating runs hourly can detect on provisional rated usage within the hour, and the faster path is worth more than a better model. **Explain by dimension.** An anomaly is only actionable if it names what changed (this project, this SKU, this region, this new resource), which requires rated usage to keep resource and dimension columns the detector can group by. Free-Tier Fraud & Stolen Keys covers what to do when the anomaly is an attacker.

## Spend Caps and Pauses

A spend cap turns a budget into a stop. Providers implement it in three ways, and each stops something different:

| Cap | What stops | What doesn't | Who |
| --- | --- | --- | --- |
| **Credit exhaustion** | Every billable service, because there is no payment method or the account can't be charged | Nothing else is billed, by construction | Netlify Free, Vercel Hobby, AWS's free plan, Azure credit subscriptions ([Spending Limits: the Hard Cap](/books/hosting-and-cloud/free-tiers-and-credits#spending-limits-the-hard-cap)) |
| **Project or deployment pause** | Serving traffic | Storage, and anything not counted toward the budget | Vercel pause production deployments (storage and AI Gateway usage continue); Netlify paid plans when credits run out without auto recharge |
| **Service-level cap** | New usage of one service in one project | In-flight requests and "on-going, fixed usage associated with persistent resources" | Google Cloud spend cap budgets |
| **Customer automation** | Whatever the customer's code turns off | Everything else | AWS budget actions, Google's disable-billing pattern |

Every implementation overshoots, and providers say so. Google: "You remain responsible for any overage costs accrued due to reporting latency." Vercel: projects "can keep serving traffic and accruing usage for several minutes after you cross the spend amount," so set the amount "below the absolute maximum you are willing to spend." A provider building a cap has to decide, in its terms, who pays for the overshoot; my rule is that a cap sold as hard is hard, and the provider absorbs the overshoot as a credit, while a cap sold as best-effort says so in the same sentence that offers it.

Pauses also need an exit. Vercel's paused projects "won't automatically unpause if you increase the spend amount" and must be resumed one by one; Google's lifted cap "won't trigger again in the same period unless you raise the target" and services can take up to an hour to recover; Netlify resumes at the next cycle, on upgrade or on a credit purchase. Three tables divide the work, and none duplicates another: a credit-backed account cap is [Free Tiers, Credits & Startup Programs](/books/hosting-and-cloud/free-tiers-and-credits#spending-limits-the-hard-cap)' `spending_limits`; a spend amount that pauses a project's deployments is [PaaS & Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds#spend-caps-and-pauses)' `project_spend_caps`, with every crossing and enforcement in `spend_cap_events`; and this chapter's budgets only measure and alert, on any scope, actual or forecast, gross or net. Whichever stops the spending, the stop is a hold with a reason and an effect that the customer's action lifts, with the same audit trail as a non-payment hold ([Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing)).

## Surprise Bills and Forgiveness

A surprise bill is usage the customer didn't intend and couldn't see in time. The causes recur: a leaked credential running compute in an unused region; a loop calling a paid API; logs or metrics at a verbose level; a traffic spike, sometimes an attack, on a metered bandwidth plan; a forgotten environment; and the provider's own design billing for something the customer couldn't prevent, like S3's denied requests before 2024.

Providers resolve them in four ways, and the system has to record which:

- **Fix the meter.** When the provider's billing rule was the problem, the fix is a rule change and a rerate: S3 stopped charging for unauthorized requests from outside the account. In the model that is a `usage_corrections` row with reason `policy_change` or `provider_fault` and a rerun, not a credit ([Late, Duplicate and Corrected Usage](/books/hosting-and-cloud/metering-and-rating#late-duplicate-and-corrected-usage)).
- **Forgive as a credit.** When the usage was real but the provider chooses not to collect, the forgiveness is a `credit_grants` row of kind `goodwill` against the invoice, with the case, the reason and the approver. Netlify's support first offered a reduction on the reported $104,000 bill, and then said the user would not be charged, the policy its CEO described as forgiving "legitimate mistakes after the fact." Microsoft's guidance on unexpected charges ends, after the self-service steps, at a support request.
- **Collect.** Some bills are owed, and dunning runs as usual ([Invoices, Dunning & Suspension](/books/hosting-and-cloud/invoices-dunning-and-suspension)).
- **Treat it as fraud.** A stolen card or account takeover is a fraud case, and the charge follows the provider's fraud rules and the card network's dispute rules ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).

Forgiveness needs a written policy because it is a pricing decision made after the fact. My default policy: forgive in full the first incident on a small account where the provider's own controls (an anomaly alert, a cap the customer asked for) failed or didn't exist; forgive part where the customer ignored an alert; never forgive silently, always with a credit row, a reason code and the controls the customer has agreed to turn on; and treat every forgiven incident as a product defect to fix, because a surprise bill the provider forgives twice is a missing cap.

**Worked example: a weekend spike.** A team on a usage plan has a $500 monthly budget with thresholds at 50%, 75% and 100% and no pause. A retry loop starts Friday night and adds about $40 an hour of function and egress usage. With hourly rating and alerts evaluated every 15 minutes, the 75% alert fires within the hour it's crossed and the anomaly detector flags the change by Saturday morning; with daily detection 36 hours after the day ends, as Azure documents, the anomaly would surface on Monday, after about 60 hours and $2,400. The difference is the provider's pipeline, not the customer's diligence, which is why my forgiveness policy turns on the provider's own control latency.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Exports plus alerts only** | Line-item exports, budgets that notify, anomaly alerts | Never takes a customer offline; simple to build | Surprise bills, forgiveness by support, customer trust | Data pipeline and support time | AWS, Azure pay-as-you-go, Google Cloud by default, Hetzner |
| **Hard caps by credit** | Prepaid or included credits; stop when spent | Bill can't exceed what was paid | Sites go dark on real traffic; caps overshoot on latency | Provider absorbs overshoot | Netlify, Vercel Hobby, free plans, Azure credit subscriptions |
| **Optional budget pause** | Customer sets a spend amount and chooses to pause | Customer decides the trade-off | Lag of minutes; storage still bills; manual resume | Moderate | Vercel Spend Management, Google spend cap budgets |
| **Customer-built automation** | Provider emits events; customer's code stops resources | Flexible | Most customers never build it; automation can delete what it should have stopped | Customer's time | AWS budget actions, Google Pub/Sub disable-billing pattern |
| **Third-party FinOps tools** | Ingest exports (FOCUS or native) across providers | Cross-cloud views, allocation, recommendations | Only as fresh as the provider's export; no ability to stop spend | Tool fees | Customers with several providers |
| **Price caps per resource** | Every resource has a monthly maximum | Predictable without any controls | Doesn't bound the number of resources or metered extras | Built into pricing | DigitalOcean, Linode, Hetzner |

## My Default

My default as a provider: hourly provisional rating feeding everything; a FOCUS export from day one beside the native one, with list, billed and effective cost on every row; budgets with actual and forecast thresholds on a gross basis for credit-funded accounts and net otherwise, delivered as signed webhooks as well as email; anomaly detection on provisional rated usage within the hour, explained by project, SKU and region; and an optional pause the customer turns on, enforced as a hold, with the overshoot credited when the customer was told the cap was hard. For new self-serve accounts I'd turn on a default budget alert at a modest amount and offer the pause at sign-up, because the customers who most need a cap are the ones who don't know to ask for one.

What would change it: for enterprise accounts on commitments and invoiced terms I'd leave pauses off and rely on alerts and anomaly detection routed to named owners, because stopping a production estate for a budget line is worse than the bill; and for a provider whose resources are already price-capped (a developer cloud with monthly maximums), I'd invest less in caps and more in a limit on how many resources a new account can create, which is the quota half of the same problem (Regions, Zones, Cells & Quotas).

## How to Build It

The chapter adds budgets, alerts, export definitions and deliveries, and anomalies to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Budgets measure and alert; they never stop anything. Stopping belongs to two existing tables: the credit-backed account cap is [Free Tiers, Credits & Startup Programs](/books/hosting-and-cloud/free-tiers-and-credits#how-to-build-it)' `spending_limits`, and the project pause is [PaaS & Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds#how-to-build-it)' `project_spend_caps`. Forgiveness is a `credit_grants` row of kind `goodwill`.

```sql
CREATE TABLE budgets (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id     UUID NOT NULL REFERENCES accounts (id),
  project_id     UUID REFERENCES projects (id),       -- null: the whole account
  name           TEXT NOT NULL,
  filter         JSONB NOT NULL DEFAULT '{}',          -- {"product": "functions", "tag:team": "web"}
  currency       CHAR(3) NOT NULL,
  amount         BIGINT NOT NULL CHECK (amount > 0),   -- minor units per period
  period         TEXT NOT NULL CHECK (period IN ('month', 'quarter', 'year')),
  basis          TEXT NOT NULL CHECK (basis IN ('gross', 'net')),  -- before or after credits
                                                       -- and commitment benefits
  thresholds     JSONB NOT NULL,                       -- [{"pct": 50, "on": "actual"},
                                                       --  {"pct": 100, "on": "forecast"}]
  webhook_url    TEXT,                                 -- signed, like a spend cap's
  valid_during   TSTZRANGE NOT NULL,
  created_by     TEXT NOT NULL                         -- typed actor; 'system:default_budget'
);

CREATE TABLE budget_alerts (             -- each threshold fired once per period
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  budget_id       UUID NOT NULL REFERENCES budgets (id),
  period          TSTZRANGE NOT NULL,
  threshold_pct   SMALLINT NOT NULL,
  measured_on     TEXT NOT NULL CHECK (measured_on IN ('actual', 'forecast')),
  spend_amount    NUMERIC(24,6) NOT NULL, -- what was measured, unrounded
  data_as_of      TIMESTAMPTZ NOT NULL,   -- the rating run's cutoff: how old the number is
  rating_run_id   UUID NOT NULL REFERENCES rating_runs (id),
  delivered_at    TIMESTAMPTZ,
  UNIQUE (budget_id, period, threshold_pct, measured_on)
);

CREATE TABLE cost_exports (              -- what the customer asked to receive
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id     UUID NOT NULL REFERENCES accounts (id),
  format         TEXT NOT NULL CHECK (format IN ('native', 'focus_1_0', 'focus_1_2',
                   'focus_1_4')),
  granularity    TEXT NOT NULL CHECK (granularity IN ('hour', 'day', 'month')),
  columns        TEXT[],                 -- null: all; SQL-style selection like AWS's
  row_filter     JSONB,
  destination    TEXT NOT NULL,          -- the customer's bucket, by reference
  valid_during   TSTZRANGE NOT NULL
);

CREATE TABLE cost_export_deliveries (    -- every write, including restatements
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  export_id       UUID NOT NULL REFERENCES cost_exports (id),
  billing_period  TSTZRANGE NOT NULL,
  data_as_of      TIMESTAMPTZ NOT NULL,
  is_final        BOOLEAN NOT NULL,      -- true once the period's invoice is finalized
  supersedes_id   UUID REFERENCES cost_export_deliveries (id),
  row_count       BIGINT NOT NULL,
  billed_total    NUMERIC(24,6) NOT NULL, -- must equal the invoice once final
  content_hash    BYTEA NOT NULL,
  delivered_at    TIMESTAMPTZ NOT NULL
);

CREATE TABLE anomalies (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  scope           JSONB NOT NULL,        -- {"project_id": ..., "sku": ..., "region": ...}
  evaluated_during TSTZRANGE NOT NULL,   -- the hour or day evaluated ('window' is reserved)
  expected_amount NUMERIC(24,6) NOT NULL,
  actual_amount   NUMERIC(24,6) NOT NULL,
  model           TEXT NOT NULL,         -- 'baseline_zscore_v2': which detector and version
  root_causes     JSONB NOT NULL,        -- ranked dimensions by dollar impact
  status          TEXT NOT NULL CHECK (status IN ('open', 'acknowledged', 'expected',
                    'fraud_suspected', 'resolved')),
  case_ref        TEXT,                  -- the support or fraud case it opened
  detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, scope, evaluated_during)
);
```

Rated usage in a FOCUS-shaped view: list cost from the list book at the same usage time, billed cost after commitment benefit, effective cost with prepaid commitments amortized (the drawdown's committed amount stands in for the amortized purchase). Only completed, unsuperseded runs count:

```sql
CREATE VIEW cost_rows_focus AS
SELECT ru.account_id                                AS "BillingAccountId",
       r.project_id                                 AS "SubAccountId",
       ru.resource_id                               AS "ResourceId",
       s.code                                       AS "SkuId",
       p.name                                       AS "ServiceName",
       s.region_id                                  AS "RegionId",
       'Usage'                                      AS "ChargeCategory",
       lower(ru.rated_during)                       AS "ChargePeriodStart",
       upper(ru.rated_during)                       AS "ChargePeriodEnd",
       ru.quantity                                  AS "PricingQuantity",
       ru.currency                                  AS "BillingCurrency",
       ru.quantity * lp.unit_price                  AS "ListCost",
       ru.amount                                    AS "ContractedCost",
       ru.amount - COALESCE(cd.benefit, 0)          AS "BilledCost",
       CASE WHEN cd.prepaid THEN cd.committed
            ELSE ru.amount - COALESCE(cd.benefit, 0) END AS "EffectiveCost",
       cd.commitment_id                             AS "CommitmentDiscountId",
       s.pass_through                               AS "x_PassThrough"
FROM rated_usage ru
JOIN rating_runs rr ON rr.id = ru.rating_run_id AND rr.status = 'completed'
JOIN skus s ON s.id = ru.sku_id
JOIN products p ON p.id = s.product_id
LEFT JOIN resources r ON r.id = ru.resource_id
LEFT JOIN LATERAL (                      -- the list price at the same usage time
  SELECT unit_price FROM price_versions
  WHERE sku_id = ru.sku_id AND price_book = 'list' AND currency = ru.currency
    AND valid_during @> lower(ru.rated_during)
  LIMIT 1
) lp ON TRUE
LEFT JOIN LATERAL (
  SELECT d.commitment_id, SUM(d.benefit_amount) AS benefit, SUM(d.committed_amount) AS committed,
         bool_or(c.discount_terms ->> 'upfront' IN ('all', 'partial')) AS prepaid
  FROM commitment_drawdowns d JOIN commitments c ON c.id = d.commitment_id
  WHERE d.rated_usage_id = ru.id AND d.kind = 'covered'
  GROUP BY d.commitment_id
) cd ON TRUE;
-- Credits, taxes, purchases and adjustments come from invoice_lines by line_kind as their own
-- rows (ChargeCategory 'Credit', 'Tax', 'Purchase', 'Adjustment'), so the export sums to the
-- invoice once the period is final.
```

Budget evaluation after each rating run, firing each threshold once per period. `$1` is the run:

```sql
WITH spend AS (
  SELECT b.id AS budget_id, b.amount, b.thresholds,
         tstzrange(date_trunc(b.period, rr.received_cutoff),
                   date_trunc(b.period, rr.received_cutoff) + ('1 ' || b.period)::interval)
           AS period,
         SUM(CASE b.basis WHEN 'gross' THEN f."ListCost" ELSE f."BilledCost" END) AS actual
  FROM budgets b
  JOIN rating_runs rr ON rr.id = $1
  JOIN cost_rows_focus f ON f."BillingAccountId" = b.account_id
   AND (b.project_id IS NULL OR f."SubAccountId" = b.project_id)
   AND (b.filter ->> 'product' IS NULL OR f."ServiceName" = b.filter ->> 'product')
   AND f."ChargePeriodStart" >= date_trunc(b.period, rr.received_cutoff)
  WHERE b.valid_during @> rr.received_cutoff
  GROUP BY b.id, b.amount, b.thresholds, rr.received_cutoff, b.period
),
crossed AS (
  SELECT s.*, (t ->> 'pct')::smallint AS pct
  FROM spend s, jsonb_array_elements(s.thresholds) t
  WHERE t ->> 'on' = 'actual'
    AND s.actual * 100 >= s.amount * (t ->> 'pct')::numeric
)
INSERT INTO budget_alerts (budget_id, period, threshold_pct, measured_on, spend_amount,
                           data_as_of, rating_run_id)
SELECT c.budget_id, c.period, c.pct, 'actual', c.actual,
       (SELECT received_cutoff FROM rating_runs WHERE id = $1), $1
FROM crossed c
ON CONFLICT (budget_id, period, threshold_pct, measured_on) DO NOTHING;
-- Each new row emits budget.threshold_crossed for email and webhook delivery. Pausing on the
-- same numbers is project_spend_caps' job (PaaS & Frontend Clouds), evaluated by the same run.
```

A simple first anomaly detector: compare each project's hour of rated cost with the same hour's trailing 28-day baseline, and flag departures of more than four standard deviations and more than a floor amount, so small accounts don't page on cents:

```sql
INSERT INTO anomalies (account_id, scope, evaluated_during, expected_amount, actual_amount, model,
                       root_causes, status)
SELECT h.account_id, jsonb_build_object('project_id', h.project_id), h.hour,
       b.mean, h.cost, 'baseline_zscore_v1',
       (SELECT jsonb_agg(x ORDER BY x.delta DESC) FROM (
          SELECT f."SkuId" AS sku, f."RegionId" AS region,
                 SUM(f."BilledCost") AS delta
          FROM cost_rows_focus f
          WHERE f."BillingAccountId" = h.account_id AND f."SubAccountId" = h.project_id
            AND f."ChargePeriodStart" <@ h.hour
          GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 5) x),
       'open'
FROM (
  SELECT "BillingAccountId" AS account_id, "SubAccountId" AS project_id,
         tstzrange(date_trunc('hour', "ChargePeriodStart"),
                   date_trunc('hour', "ChargePeriodStart") + INTERVAL '1 hour') AS hour,
         SUM("BilledCost") AS cost
  FROM cost_rows_focus
  WHERE "ChargePeriodStart" >= $1 AND "ChargePeriodStart" < $1 + INTERVAL '1 hour'
  GROUP BY 1, 2, 3
) h
JOIN LATERAL (
  SELECT AVG(c) AS mean, STDDEV_SAMP(c) AS sd FROM (
    SELECT SUM("BilledCost") AS c
    FROM cost_rows_focus
    WHERE "BillingAccountId" = h.account_id AND "SubAccountId" IS NOT DISTINCT FROM h.project_id
      AND "ChargePeriodStart" >= lower(h.hour) - INTERVAL '28 days'
      AND "ChargePeriodStart" < lower(h.hour)
    GROUP BY date_trunc('hour', "ChargePeriodStart")) past
) b ON TRUE
WHERE h.cost > COALESCE(b.mean, 0) + 4 * COALESCE(b.sd, 0)
  AND h.cost - COALESCE(b.mean, 0) > 2500        -- floor: 25.00 in minor units
ON CONFLICT DO NOTHING;
```

Notes on the sketch:

- **Every number carries its age.** Alerts store the rating run and its cutoff, and deliveries store `data_as_of`, so a customer can see that "you have spent $480" means "as of 14:00."
- **Exports restate.** A delivery supersedes the previous one for its period, and the final delivery's billed total must equal the invoice; a mismatch blocks the final flag.
- **Budgets don't enforce.** A budget alerts on any scope and basis; a pause is a `project_spend_caps` row whose enforcement is a `spend_cap_events` row and a hold, and a credit-backed cap is a `spending_limits` row. Keeping them apart means a customer can have a forecast alert at 80% of a tag's spend without anything ever going offline.
- **Hard caps are a promise with a cost.** Where a cap was sold as hard, usage rated between the crossing and the enforcement recorded in `spend_cap_events` (or the `spending_limits` hold) is credited automatically by a `credit_grants` row of kind `goodwill` whose source is the cap.
- **The detector is versioned.** `anomalies.model` names the detector and version, so false-positive rates can be compared across versions and a customer's "why didn't you warn me" has an answer.
- **The FOCUS view is the contract.** Dashboards, budgets, anomaly detection and exports all read the same view, so the console, the alert and the file can't disagree.
- **Events:** `budget.threshold_crossed`, `anomaly.detected`, `anomaly.resolved`, `cost_export.delivered` and `cost_export.restated` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, webhooks and the support desk ([Notifications & Consent](/docs/architecture/notifications)).

## Auditing

- **What the customer could see, when.** For any disputed bill: each export delivery and its data age, each alert with the spend it reported and when it was delivered, each anomaly and its status, so the provider can show what warning existed and how late it was.
- **Every pause and who lifted it.** Spend-cap and spending-limit holds with their trigger, the usage that accrued between crossing and enforcement, and the resume.
- **Every forgiveness.** Goodwill credits with their reason code, case, approver, amount and the controls the customer turned on afterward; totals by reason are the list of product defects.
- **Exports reconcile.** Final deliveries against invoices, row by row in total and per SKU; any difference is a pipeline bug.
- **Detector performance.** Anomalies raised, acknowledged as expected, confirmed as fraud, and missed (surprise bills with no anomaly before them), by model version.

Exports, alerts and anomaly records are billing evidence and are kept with the invoices they explain ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records)).

## What This Means for the System You Build

- **Ship a line-item cost export early,** in FOCUS and native form, with list, billed and effective cost on every row and restatement until the invoice is final.
- **Keep list, contracted, billed and effective cost recoverable** from rated usage, commitment drawdowns and credits, because exports, budgets and FOCUS all need them.
- **Offer budgets with actual and forecast thresholds,** a stated cost basis, and signed machine-readable notifications.
- **Detect anomalies on provisional rated usage within the hour,** explained by project, SKU and region, and version the detector.
- **Keep alerting, pausing and capping in separate records,** each pause a hold lifted by the customer, and state plainly whether a cap is hard or best-effort.
- **Absorb the overshoot of a cap sold as hard,** automatically, as a credit.
- **Write down the forgiveness policy** and record every forgiveness as a goodwill credit with a reason, and fix provider-caused bills at the meter with a correction and rerate.
- **Put the age of the data on every number** the customer sees.

## References

**Provider documentation**

- [AWS: What is AWS Data Exports](https://docs.aws.amazon.com/cur/latest/userguide/what-is-data-exports.html), CUR 2.0, FOCUS 1.2 and 1.0 with AWS columns, recommendations and carbon exports, SQL column selection, legacy CUR
- [AWS: Detecting unusual spend with Cost Anomaly Detection](https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad.html), the model, net unblended cost, cadence, delays, history needed, root cause dimensions, Marketplace exclusion
- [AWS: What's New, AWS Budgets actions](https://aws.amazon.com/about-aws/whats-new/2020/10/announcing-aws-budgets-actions/), October 15, 2020, IAM policy, SCP and instance actions, automatic or approved
- [AWS: What's New, Amazon S3 no longer charges for several HTTP error codes](https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-no-charges-several-http-error-codes), May 13 and August 19, 2024, unauthorized requests from outside the account free
- [Microsoft Learn: Identify anomalies and unexpected changes in cost](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/analyze-unexpected-charges), daily evaluation 36 hours after the day, 60-day training, WaveNet, alert limits and availability
- [Google Cloud: Create, edit, or delete budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets), alert budgets don't cap, actual and forecast thresholds, reporting delay, Pub/Sub notifications
- [Google Cloud: Manage spend cap budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets-spend-caps), eligible services, gross estimated cost trigger, what is and isn't paused, overage from latency, lifting and reset
- [Vercel: Spend Management](https://vercel.com/docs/spend-management), the On-Demand Budget, check interval and lag, thresholds, webhook payload and signature, pausing and the 503 error, storage still billed, manual resume
- [Netlify: Resume paused projects](https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/), projects paused when credits run out, credit packs, auto recharge, the Free plan restriction
- [Cloudflare: Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), the Free plan's daily request limit
- [Hetzner: Cloud billing FAQ](https://docs.hetzner.com/cloud/billing/faq/), invoice timing and traffic notifications that don't cap usage
- [DigitalOcean: Billing](https://docs.digitalocean.com/platform/billing/), invoicing on the first of the month and mid-month charges at the auto-charge amount
- [DigitalOcean: Droplet pricing details](https://docs.digitalocean.com/products/droplets/details/pricing/), the monthly cap on bundled plans

**Specifications**

- [FOCUS](https://focus.finops.org/), version 1.4 as latest, the providers that generate FOCUS data and their versions
- [FOCUS specification](https://focus.finops.org/focus-specification/), the Billed, Effective, List and Contracted Cost, Charge Category, quantity and identity columns
- [FOCUS v1.4: Effective Cost](https://focus.finops.org/docs/specification/v1-4/columns/effective-cost/), how Effective Cost differs from Billed Cost and when they must be equal
- [FinOps Foundation: FOCUS 1.0 is available](https://www.finops.org/insights/focus-1-0-available/), June 20, 2024 general availability, 43 columns, provider support and the project's origin

**In practice**

- [Netlify Support Forums: Netlify billing horror story](https://answers.netlify.com/t/netlify-billing-horror-story/113392), the reported $104,000 bill, the waiver and the stated forgiveness policy
