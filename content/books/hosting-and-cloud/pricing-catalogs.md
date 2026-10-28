+++
title = "Pricing Catalogs"
description = "SKUs, attributes and price shapes, machine-readable price lists, the pricing page as the legal source of truth, and how providers change prices with notice."
category = "Hosting & Cloud Industry"
order = 2189
part = "Metering and Billing"
tags = ["pricing", "catalog", "skus", "price-changes", "billing"]
+++

A provider's catalog is the list of everything it sells and what each unit costs: every instance type in every region on every operating system, every storage class, every request type, every carrier fee and every hosting plan's intro and renewal price. For a web host it is a few dozen plans and add-ons; for a hyperscaler it is millions of prices, published as files and APIs because no page could hold them. Either way the catalog does three jobs at once. It is the input to rating, so a wrong row bills the wrong amount to every customer who used that unit; it is a public promise, so the price on the pricing page is what the customer agreed to pay; and it is a legal record, because contracts and consumer law measure price changes from the day they were announced.

The hard part is time. A price is never just a number: it is a number for a SKU, in a price book and currency, over a period, announced on a date, and sometimes only for new orders. Usage rated next quarter for this month must find this month's price; a domain renewed in 2027 must renew at the price disclosed when it was registered unless proper notice changed it; a carrier fee that rises on the carrier's schedule must reach customers' bills on that day without the provider's own price moving. [The core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) already effective-dates `price_versions` and records `announced_at`; this chapter covers how providers structure their catalogs, the shapes prices take, why the pricing page wins, how prices change and with what notice, and extends the model with tier shapes, caps, published price lists and price change notices. How prices become charges is [Metering & Rating](/books/hosting-and-cloud/metering-and-rating).

## How the Providers Do It

As of October 2026:

| Provider | Catalog structure | Machine-readable form | What it says about changes |
| --- | --- | --- | --- |
| **AWS** | Service, product indexed by SKU, attributes (name and values) | Price List Query API (SKU-level, attribute filters, no Savings Plans prices) and Bulk API (JSON and CSV files per service and Region), from endpoints in us-east-1, eu-central-1 and ap-south-1; SNS notifications on change since 2015 | Customer Agreement 3.1: "We may increase or add new fees and charges for any existing Services you are using" with at least 30 days' notice; where the file and the pricing page differ, AWS charges the pricing page |
| **Azure** | Service family, service, product, SKU, meter (`meterId`, `meterName`), with `type` Consumption, Reservation or DevTestConsumption | Retail Prices API at `prices.azure.com`, unauthenticated, 1,000 records a page, `tierMinimumUnits` for tiers, savings plan rates in the 2023-01-01-preview version | USD is the pricing currency; "Other non-USD prices returned by the API are for your reference" |
| **Google Cloud** | Service, SKU (`skuId` such as `0008-F633-76AA`) with product and geographic taxonomy | Pricing API: `v2beta` services and SKUs, `v1beta` list prices with tiers (`startAmount`, `listPrice` in nanos, `unitInfo`), and per-billing-account prices with `contractPrice` and `effectiveDiscountPercent` | Terms 2.6: Google "may change the Fees at any time unless otherwise expressly agreed in an addendum or Order Form"; a 30-day notice applies only to Workspace, Looker (original) and Cloud Identity |
| **DigitalOcean** | Products and size slugs (`s-1vcpu-512mb-10gb`) with a monthly and hourly price | Pricing pages and the sizes API | Announced on May 16, 2022 a price change effective July 1, 2022 for Droplets, Snapshots, Load Balancers, Reserved IPs and Custom Images, alongside a new $4 Droplet |
| **Hetzner** | Server types (CX23, CAX11, CPX22, CCX13) by location, monthly cap and hourly rate | Pricing pages; a published old and new price table | Raised prices from 1 April 2026 for new orders and existing products, with no exception for long-term contracts; standardized prices again from 15 June 2026 for new orders and rescales |
| **Vercel** | Plans with included allowances, metered resources priced by region | Pricing docs with regional tables | Prices per region on the docs pages |
| **Cloudflare** | Plans with included usage, per-unit overage | Pricing docs per product | Workers and Pages Functions moved from duration to CPU-time pricing with a migration window in 2023 and 2024 |
| **Twilio** | Per-country, per-number-type message prices plus carrier fees by carrier | Pricing pages and pricing APIs | Carrier fees are passed through and, per Twilio's 10-K, change in some markets daily or weekly |
| **Hostinger and other web hosts** | Plans with an intro price tied to a term and a renewal price | Pricing pages | Hostinger's Premium plan shows "$2.49/mo," "$119.52 for 48 months" and "Renews at $10.99/mo for the same term" |

The pattern is consistent: a three-level structure (service or product, SKU, attributes or meter), a machine-readable list that is explicitly informational, a pricing page or contract that is binding, and change terms that range from a stated notice period to "at any time." The catalog a provider builds has to represent all of it, and its rater must only ever read the binding version.

## How It Got Here

- **The price sheet (to the 2000s).** Hosting and colocation were priced in a sheet and a contract: a plan, a monthly fee, a bandwidth overage. The catalog lived in the billing system's product table and the marketing site, kept in step by hand. That worked while the catalog was dozens of rows.
- **The per-region, per-OS explosion (2006 onward).** Utility pricing multiplied the rows: every instance type times every region times every operating system times every purchase option. EC2's single 10-cent instance of 2006 became a catalog no human could read, and customers started scraping pricing pages to estimate bills.
- **Price lists as APIs (2015 to 2021).** AWS launched its Price List API on December 9, 2015, offering prices "in JSON and CSV form" and Amazon SNS notifications when they change. Microsoft built the Retail Prices API to replace the calculator and portal as "the only way that you could retrieve prices for Azure services," unauthenticated; Google exposes services, SKUs and tiered list prices through its Pricing API, including a billing account's own contract prices. Machine-readable catalogs made cost tools, calculators and the FinOps industry possible ([Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills#cost-exports-cur-and-focus)).
- **Prices that rise (2022 onward).** For fifteen years cloud price changes were mostly cuts. DigitalOcean's July 1, 2022 increase, announced as "a price change on some of our products" for Droplets, Snapshots, Load Balancers, Reserved IPs and Custom Images; Verisign's wholesale .com fee rose from $9.59 to $10.26 on September 1, 2024; Hetzner's 2026 adjustments cited "drastically increased operating expenses" and RAM and NVMe SSD procurement costs. Increases turned notice, grandfathering and the difference between new orders and existing products into catalog features.
- **Unit changes as price changes (2020s).** Changing the unit is a price change too: per-second billing in 2017, Lambda's millisecond rounding in 2020, Cloudflare's CPU-time pricing in 2023, DigitalOcean's per-second Droplets in 2026. Each needed a migration plan for existing customers, which is catalog data, not a deploy.

## SKUs and Attributes

A **SKU** is one billable unit with one meter: "Linux on-demand m7g.large in eu-central-1, per second" is a SKU; "m7g.large" is not. The core model's `skus` row has the product, the meter it rates, the unit, the region (or global), whether it is recurring, usage or one-time, whether it is pass-through and for whom, and the minimum and increment. Everything a customer can choose that changes the price is either a separate SKU or a dimension the SKU matches on ([Metering & Rating](/books/hosting-and-cloud/metering-and-rating#meters-units-and-granularity)).

**Attributes** describe the SKU for humans and tools: vCPUs, memory, storage class, network performance, operating system, tenancy. AWS models each as an `AttributeName` with values; Azure carries `armSkuName`, `productName` and `serviceFamily`; Google uses product and geographic taxonomies. Attributes are not prices and should not drive rating; they drive search, comparison and the calculator. A good test of a catalog design is whether a customer's question ("what does a 4-vCPU, 16 GB Linux VM cost in Frankfurt?") can be answered by filtering attributes and reading one SKU's current price version.

Three choices decide how a catalog ages:

- **Codes are permanent.** A SKU code, once billed, is never reused or renamed, because invoices, cost exports, commitments and tax mappings point at it. Google's opaque `0008-F633-76AA` and Azure's `skuId` such as `DZH318Z0BQPS/00TG` are deliberately meaningless for this reason; a readable code (`vm.2vcpu-4gb.second`) is fine as long as it is never edited.
- **Retire, don't delete.** A discontinued instance type keeps its SKU and its last price version for as long as anything runs on it; it is closed for new orders, which is a catalog state, not the absence of a row.
- **Region is part of the SKU, not a multiplier.** Vercel's active CPU is $0.128 an hour in Washington, D.C. (iad1) and $0.221 in São Paulo (gru1); Azure and AWS price every region separately. A regional multiplier looks simpler until one region's price changes alone.

Plans sit on top of SKUs. A plan version (`plan_versions`) bundles a term, a recurring price and allowances keyed by SKU code: Cloudflare's Workers Paid is $5 a month including 10 million requests and 30 million CPU milliseconds, which in the model is one recurring SKU for the subscription and two usage SKUs whose allowances live on the plan. Pass-through SKUs (registry, ICANN, carrier, license, regulatory) are catalog rows like any other, with their own price versions that follow the supplier's schedule.

## Price Shapes

Most prices are flat: a unit price times the quantity. The rest take one of a few shapes, and naming them precisely avoids the commonest rating bugs. Stripe's documentation states the two tier modes cleanly with one set of tiers (1 to 5 units at $7, 6 to 10 at $6.50, 11 and up at $6):

| Shape | Rule | 6 units | 20 units | Who uses it |
| --- | --- | --- | --- | --- |
| **Flat** | `quantity × unit_price` | n/a | n/a | Instance-seconds, segments, most usage |
| **Graduated** | Each band priced at its own rate, summed | $41.50 | $127.50 | Egress tiers, Azure Service Bus operations and brokered connections |
| **Volume** | The whole quantity at the rate of the band it ends in | $39.00 | $120.00 | Seat and license bundles; rare in infrastructure because the total can fall as usage rises |
| **Package** | Price per block, partial blocks rounded up | n/a | n/a | Hetzner traffic overage in 100 MB blocks; credit packs |
| **Capped** | Flat until a period ceiling per resource | n/a | n/a | DigitalOcean's 672-hour Droplet cap, Linode and Hetzner monthly caps |

Under volume pricing, Stripe notes, "the total might decrease": 5 units cost $35 but 6 cost $39 at the lower rate, while 10 units cost $65 and 11 cost $66. Infrastructure providers almost always choose graduated tiers for that reason, because a customer should never save money by using more.

**A graduated example from a live catalog.** Azure's Retail Prices API lists Service Bus Standard messaging operations in East US as four rows of the same meter, distinguished by `tierMinimumUnits`: 0 at $0.00, 13 at $0.80, 100 at $0.50 and 2,500 at $0.20, all per million operations and all effective since August 15, 2017, plus the $10 monthly base unit. The tier boundaries are the lower bounds of each band, in millions. A month of 300 million operations prices at 13 million free, 87 million at $0.80 ($69.60) and 200 million at $0.50 ($100.00): $169.60 of operations. The same API lists brokered connections with their own graduated tiers starting after 1,000 free.

**Where tiers are counted matters as much as their prices.** Tiers apply to the period's cumulative quantity for a scope: the account, the billing account, sometimes an organization. AWS says its data transfer rate tiers "take into account your aggregate usage for Data Transfer Out to the Internet across all AWS services," so a tier boundary is reached by the account's total egress, not by one service's. The catalog must record the aggregation scope with the tiers, or two raters will compute two different bills from the same usage.

**Discounted books are separate price versions, not percentages.** Google's billing-account price endpoint returns the account's `contractPrice` and `effectiveDiscountPercent` per tier; Azure returns savings plan unit prices beside the on-demand price; AWS keeps Savings Plans out of the Query API entirely. In the model each is a `price_versions` row in a price book (`list`, a contract id, a commitment's book), so rating and cost reports can show list, contracted and effective cost from the same rows.

## The Pricing Page as Truth

AWS says it plainly: the Price List APIs "provide pricing details for informational purposes only. If there's a difference between the price list file and a service pricing page, AWS charges the prices on the *service pricing page*." Microsoft says the same of currency: USD prices are its retail prices, and other currencies the API returns are "for your reference to help you estimate budget expenses." The binding price is the one the customer saw and accepted, and for self-serve customers that is the pricing page or the checkout; for enterprise customers it is the order form.

That rule has consequences for how a provider builds its catalog:

- **One source, many renderings.** The pricing page, the API, the calculator, the checkout and the rater must all render the same `price_versions` rows. A pricing page maintained by marketing in a CMS and a rater fed by an engineering table will drift, and the page wins every dispute.
- **Publish snapshots.** Every published price list is a versioned, timestamped snapshot with a hash, so the provider can show what a page or file said on a given day. AWS's SNS notifications and its per-service, per-region files are this idea at scale.
- **The checkout records what was shown.** For a subscription, the plan version, intro price, renewal price and term shown at checkout are stored with the consent ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data)); Hostinger's page states the intro price, the total for the term ("$119.52 for 48 months") and the renewal price in one place, which is what the disclosure record must reproduce. [Subscriptions, Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law) covers what must be shown.
- **Exclusions are part of the truth.** AWS's catalog excludes Spot prices and time-limited free tier offers; Azure's savings plan rates appear only in one API version. A provider's own published catalog should say what it leaves out, so a customer's tool doesn't treat a missing price as zero.

## Price Changes and Notice

A price change is a new price version with an announcement date, a boundary, an audience and a notice obligation. The obligation comes from three places, in increasing strictness:

- **The provider's own terms.** AWS commits to at least 30 days' notice of increases for "existing Services you are using" (Customer Agreement 3.1) and may modify the agreement itself by posting a revised version, effective on posting or as stated in an email. Google Cloud may change fees "at any time" for Cloud services unless an addendum or order form says otherwise, and a customer who objects to a fee change may terminate for convenience. DigitalOcean announced its 2022 change on May 16 for July 1, 46 days. An order form or private pricing agreement overrides list changes for its term ([Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#enterprise-commitments-and-shortfalls)).
- **Suppliers' contracts.** Registry fees change under registry agreements with notice to registrars, and carrier fees under carrier schedules; a provider passing them through inherits the timing and must carry its own notice to customers on top ([ICANN, Registries & Registrars](/books/hosting-and-cloud/icann-registries-and-registrars#the-fee-stack); [Sending a Text](/books/hosting-and-cloud/sending-a-text)).
- **Consumer and subscription law.** For consumers on automatic renewal, a price change during the term is regulated in its own right: California requires notice 7 to 30 days before it takes effect and New York 5 business days to 30 days before, both with cancellation instructions, and the renewal price disclosed at sign-up is a material term ([Subscriptions, Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law)).

The audience is the decision providers get wrong most often. Hetzner's two 2026 changes show the two choices side by side: the 1 April 2026 increase applied to new orders and existing products with no exception for long-term contracts, while the 15 June 2026 standardization applied to new orders and cloud rescales only, with "certain changes to servers with legacy pricing" able to "trigger a switch to the current pricing," and with orders placed before 15 June but delivered after kept at the previous prices. In the model those are three different scopes: all subscribers from a date, new orders from a date, and existing resources until an event moves them. Each is a property of the price change, not a code path.

**Worked example: a shared cloud server across Hetzner's June 2026 change.** A CX23 in Germany listed at €3.99 a month before 15 June 2026 and €5.49 after, a 38% increase. An existing server keeps its legacy price version until it is rescaled; a server ordered on 16 June rates at €5.49 from its first hour; a server ordered on 14 June and delivered on the 16th rates at €3.99. The rater needs no special case: the order's timestamp selects the price book (legacy or current), and the price version's `valid_during` selects the price.

**Notice is a record, not an email.** For each change the provider needs: when it was announced, through which channels, to which accounts (those with usage of the affected SKUs in a lookback window, plus every subscriber whose plan version includes them), what each was told, and the earliest effective date the strictest applicable rule allows. A price version whose `valid_during` starts before `announced_at` plus the required notice for any affected account is a compliance bug the database can reject.

## Intro and Renewal Prices

Web hosting and domains run on a two-price model: an introductory price for a first term, usually only with a long prepay, and a higher renewal price. Hostinger's Premium plan, as of October 2026, is $2.49 a month on a 48-month prepay, $119.52 upfront, renewing at $10.99 a month for the same term. GoDaddy recognizes prepaid subscription revenue ratably over terms of up to ten years, so a single catalog row may govern a customer for a decade.

The catalog represents this with plan versions, not discounts: `plan_versions.intro_amount` and `renewal_amount` are both disclosed at sign-up, and `subscription_periods.pricing_phase` records whether each period was the intro term or a renewal. Changing the renewal price for future sign-ups is a new plan version; changing it for existing subscribers is a price change with notice under the rules above. A promotion is the same: a plan version with a sale window, never a coupon field that the renewal job might forget to drop. [How Web Hosting Makes Money](/books/hosting-and-cloud/web-hosting-business#the-intro-term-and-the-renewal) covers the economics; [Subscriptions, Renewals & Cancellation Law](/books/hosting-and-cloud/renewals-and-cancellation-law) covers what must be disclosed.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Catalog as effective-dated tables** (chosen) | SKUs, price versions per book and currency with tier shapes, plan versions, published snapshots | One source for page, API, checkout and rater; history and notice provable; reruns price correctly | Needs tooling for marketing to edit safely; large tables at hyperscale | Engineering | The pattern visible in AWS's, Azure's and Google's catalog APIs |
| **Prices in the billing vendor** | Products and prices in a billing platform (Stripe prices with `tiers_mode`, a usage-billing platform) | Fast; tiers and invoices built in | The vendor's object model becomes the catalog; region and pass-through dimensions bolted on; price objects often immutable once used, so changes are new objects without the provider's notice records | Vendor fees | SaaS and smaller developer platforms |
| **Prices in code or config** | Constants or a YAML file deployed with the service | Simple at the start | No history, no notice, no snapshot; a deploy changes everyone's price at once, including for usage already incurred | Cheap until the first dispute | Early-stage products |
| **Panel and billing-software products** | Plans and add-ons in hosting billing software | Fits fixed plans and domains | Can't price elastic usage; renewal and intro prices often per-product fields rather than versions | License fees | Web hosts and resellers |
| **Quote-only enterprise pricing** | Prices in order forms, rated from a contract book | Matches how large deals are sold | Unless each order form is entered as a price book, rating and cost tools can't see it | Sales operations | Every hyperscaler's enterprise segment |

## My Default

My default is the catalog as effective-dated tables, with the pricing page, the price list API, the calculator and the checkout all rendered from the same rows, and a published snapshot for every change. The reasons are the ones the providers' own documents give: the page is binding, so it must be generated from what the rater reads; prices rise now as well as fall, so notice and audience must be data; and contracts, commitments and tax mappings point at SKU codes for years. I'd choose graduated tiers over volume tiers every time, keep region inside the SKU, and treat a unit change (hourly to per-second, duration to CPU time) as a price change with its own migration plan.

I'd keep prices in a billing vendor instead if the product has a few plans, one currency and no regions, and the vendor's price objects can carry an announcement date or I keep that record beside them. What would change my mind about building is the opposite extreme: a pure reseller of one supplier's catalog (a registrar reselling one registry's TLDs, a partner billing a cloud's usage) can often mirror the supplier's price list and apply a markup book, because its own catalog decisions are only the margin.

## How to Build It

The chapter fixes the shape of `price_versions.tiers`, adds tier modes, packages and caps, and adds published price lists and price change notices to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Rating reads these through [Metering & Rating](/books/hosting-and-cloud/metering-and-rating#how-to-build-it).

```sql
ALTER TABLE price_versions
  ADD COLUMN tier_mode     TEXT NOT NULL DEFAULT 'flat' CHECK (tier_mode IN ('flat',
                             'graduated', 'volume', 'package')),
  ADD COLUMN tier_scope    TEXT CHECK (tier_scope IN ('account', 'billing_account',
                             'organization', 'resource')),   -- whose cumulative quantity
  ADD COLUMN package_size  NUMERIC CHECK (package_size > 0), -- 'package': e.g. 100 MB blocks
  ADD COLUMN cap_amount    NUMERIC(24,6),                    -- per resource per cap_period
  ADD COLUMN cap_period    TEXT CHECK (cap_period IN ('month')),
  ADD COLUMN price_change_notice_id UUID,                    -- the notice that introduced it
  ADD CONSTRAINT price_versions_tiers_shape CHECK (
    (tier_mode IN ('flat', 'package')) = (tiers IS NULL)
    AND (tier_mode <> 'package' OR package_size IS NOT NULL)
    AND (tier_mode IN ('graduated', 'volume')) = (tier_scope IS NOT NULL)
    AND ((cap_amount IS NULL) = (cap_period IS NULL)));
-- tiers, when set, is an array ordered by bound, the last band open-ended:
--   [{"up_to": 13000000, "unit_price": "0"}, {"up_to": 100000000, "unit_price": "0.00008"},
--    {"up_to": 2500000000, "unit_price": "0.00005"}, {"up_to": null, "unit_price": "0.00002"}]
-- unit_price is minor units per unit as a decimal string; unit_price on the row is the
-- first band's, for display. The audience, applies_to ('all', 'new_orders', 'legacy'),
-- is a core column, part of the core exclusion: one price per SKU, book, currency and
-- audience at a time.

CREATE FUNCTION tier_amount(p_version UUID, p_before NUMERIC, p_quantity NUMERIC)
RETURNS NUMERIC LANGUAGE sql STABLE AS $$
  -- the charge for p_quantity units when p_before units were already used this period
  WITH pv AS (SELECT * FROM price_versions WHERE id = p_version),
  bands AS (
    SELECT (b ->> 'unit_price')::numeric AS price,
           COALESCE(LAG((b ->> 'up_to')::numeric) OVER (ORDER BY ord), 0) AS lo,
           COALESCE((b ->> 'up_to')::numeric, 'Infinity') AS hi
    FROM pv, jsonb_array_elements(pv.tiers) WITH ORDINALITY AS t(b, ord)
  )
  SELECT CASE pv.tier_mode
    WHEN 'flat' THEN p_quantity * pv.unit_price
    WHEN 'package' THEN CEIL(p_quantity / pv.package_size) * pv.unit_price
    WHEN 'graduated' THEN (SELECT COALESCE(SUM(price * GREATEST(0,
                             LEAST(hi, p_before + p_quantity) - GREATEST(lo, p_before))), 0)
                           FROM bands)
    WHEN 'volume' THEN (SELECT price * (p_before + p_quantity) FROM bands
                        WHERE p_before + p_quantity > lo AND p_before + p_quantity <= hi)
                       - (SELECT COALESCE(MAX(price * p_before), 0) FROM bands
                          WHERE p_before > lo AND p_before <= hi)
  END
  FROM pv
$$;

CREATE TABLE price_list_publications (   -- what the page, API and files said, and when
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  published_at   TIMESTAMPTZ NOT NULL,
  scope          TEXT NOT NULL,          -- 'all', a product code, a region
  format         TEXT NOT NULL CHECK (format IN ('page', 'json', 'csv', 'api')),
  content_hash   BYTEA NOT NULL,         -- of the rendered artifact
  storage_ref    TEXT NOT NULL,          -- immutable copy, kept as long as prices can be disputed
  version_ids    UUID[] NOT NULL,        -- the price_versions it rendered
  UNIQUE (scope, format, published_at)
);

CREATE TABLE price_change_notices (      -- one announced change and its obligations
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  kind               TEXT NOT NULL CHECK (kind IN ('increase', 'decrease', 'unit_change',
                       'new_sku', 'retirement', 'pass_through_change')),
  audience           TEXT NOT NULL CHECK (audience IN ('all_subscribers', 'new_orders',
                       'renewals_after', 'existing_until_event')),
  sku_ids            UUID[] NOT NULL,
  plan_version_ids   UUID[],             -- plans whose renewal price changes
  supplier_ref       TEXT,               -- the registry or carrier notice behind a pass-through
  announced_at       TIMESTAMPTZ NOT NULL,
  effective_at       TIMESTAMPTZ NOT NULL,
  required_notice    INTERVAL NOT NULL,  -- the strictest rule for any affected account
  basis              TEXT NOT NULL,      -- 'customer_agreement_3_1', 'order_form', a law rule id
  summary            TEXT NOT NULL,      -- what customers were told
  created_by         TEXT NOT NULL,      -- typed actor
  CHECK (effective_at >= announced_at + required_notice OR kind = 'decrease')
);

ALTER TABLE price_versions
  ADD CONSTRAINT price_versions_notice_fkey FOREIGN KEY (price_change_notice_id)
    REFERENCES price_change_notices (id);

CREATE TABLE price_change_recipients (   -- who was told, how, and when
  notice_id     UUID NOT NULL REFERENCES price_change_notices (id),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  reason        TEXT NOT NULL CHECK (reason IN ('recent_usage', 'subscriber', 'commitment',
                  'reseller')),
  channel       TEXT NOT NULL CHECK (channel IN ('email', 'console', 'invoice_message',
                  'api_feed', 'reseller_feed')),
  sent_at       TIMESTAMPTZ,
  delivery_ref  TEXT,                    -- the notification's id, for proof
  PRIMARY KEY (notice_id, account_id, channel)
);
```

Who must be told about a change: every account with rated usage of an affected SKU in the last 90 days, plus every subscriber whose plan version includes one, plus resellers whose books are derived from list:

```sql
INSERT INTO price_change_recipients (notice_id, account_id, reason, channel)
SELECT n.id, x.account_id, x.reason, 'email'
FROM price_change_notices n
CROSS JOIN LATERAL (
  SELECT DISTINCT ru.account_id, 'recent_usage' AS reason
  FROM rated_usage ru
  WHERE ru.sku_id = ANY (n.sku_ids)
    AND lower(ru.rated_during) >= n.announced_at - INTERVAL '90 days'
  UNION
  SELECT s.account_id, 'subscriber'
  FROM subscriptions s
  WHERE s.plan_version_id = ANY (n.plan_version_ids) AND s.status IN ('active', 'trialing',
          'past_due')
  UNION
  SELECT ra.reseller_account_id, 'reseller'
  FROM reseller_agreements ra
  WHERE ra.valid_during @> n.effective_at
) x
WHERE n.id = $1 AND n.audience <> 'new_orders'
ON CONFLICT DO NOTHING;
```

Notes on the sketch:

- **Tiers are data with one evaluator.** `tier_amount` is the only code that interprets `tiers`, so the pricing page's calculator, the rater and a cost estimate all agree; it takes the quantity already used this period, which is what makes graduated tiers correct when usage is rated hour by hour.
- **Audience is part of the price.** `applies_to` distinguishes a version for new orders from a legacy version kept for existing resources, and the exclusion constraint allows one of each at a time; the order or resource records which book and audience it was sold under.
- **Notice is enforced, not remembered.** A change whose effective date comes before announcement plus required notice can't be inserted, and the recipients table is the proof each affected account was told.
- **Snapshots prove the page.** Every rendering of prices is a publication with a hash and an immutable copy, so "what did the pricing page say on March 3" has an answer.
- **The price book defaults to list.** [Metering & Rating](/books/hosting-and-cloud/metering-and-rating#how-to-build-it) adds `accounts.price_book`; contract books are price versions under a contract id, and commitment rates are books [Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#how-to-build-it) applies at its own stage.
- **Events:** `price_change.announced`, `price_change.effective`, `price_list.published` and `sku.retired` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the pricing site, the price list API, the rater's cache, cost exports and the notification service ([Notifications & Consent](/docs/architecture/notifications)).

## Auditing

- **The price in force for any usage.** For any rated row, the price version, its book and audience, the notice that introduced it, and the publication that showed it to customers.
- **Every change with its notice.** Announcement date, effective date, the rule that set the required notice, the summary customers were given, and the recipients with delivery references.
- **Page, API and rater agree.** A scheduled comparison of the latest publication's prices with the price versions the rater reads; any difference is resolved in favor of what customers were shown, and the rated usage is rerun.
- **Pass-through changes against suppliers.** Each pass-through price version tied to the supplier's notice, so a registry or carrier change and the provider's own change can be told apart.
- **Retirements.** Retired SKUs with resources still running on them, and the legacy price versions still in use, so nothing is silently moved to a new price.

Publications, versions and notices are kept for as long as any invoice priced from them can be disputed or audited, and consent records for subscription prices for as long as the strictest renewal rule requires ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records)).

## What This Means for the System You Build

- **Make the SKU the unit of price,** with region and every price-changing choice inside it, and never reuse or rename a billed code.
- **Effective-date every price version** in a book, currency and audience, and rate usage at the version in force when it happened.
- **Store tier shapes as data with one evaluator,** prefer graduated tiers, and record whose cumulative quantity counts.
- **Render the pricing page, API, calculator and checkout from the same rows,** and keep a hashed snapshot of every publication, because the page is binding.
- **Model price changes as notices** with an audience, a basis, a required notice period the database enforces, and a recipient list.
- **Keep intro and renewal prices on plan versions,** disclosed at sign-up, and treat a renewal price change for existing subscribers as a price change with notice.
- **Give pass-through SKUs their own versions** that follow the supplier's schedule, tied to the supplier's notice.

## References

**Provider documentation**

- [AWS: Calling AWS services and prices using the AWS Price List](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html), service, product, SKU and attribute; Query and Bulk APIs; endpoints; exclusions; the pricing page prevails
- [AWS: Customer Agreement](https://aws.amazon.com/agreement/), section 3.1 price increases with at least 30 days' notice and monthly billing; section 10 modification by posting
- [AWS: S3 pricing](https://aws.amazon.com/s3/pricing/), data transfer tiers aggregated across all AWS services
- [Microsoft Learn: Azure Retail Prices REST API overview](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices), unauthenticated retail prices, fields, meter types, savings plan rates, paging, USD as the pricing currency
- [Microsoft: Azure Retail Prices API, Service Bus Standard in East US](https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Service%20Bus%27%20and%20armRegionName%20eq%20%27eastus%27%20and%20skuName%20eq%20%27Standard%27), the graduated operations tiers, brokered connection tiers and base unit
- [Google Cloud: Get Google Cloud pricing information](https://docs.cloud.google.com/billing/docs/how-to/get-pricing-information-api), services, SKUs, tiered list prices and billing-account contract prices
- [Google Cloud: Terms of Service](https://cloud.google.com/terms), section 2.6 fee revisions and the right to terminate for convenience
- [DigitalOcean Blog: New $4 Droplet and updated pricing](https://www.digitalocean.com/blog/new-4-dollar-droplet-updated-pricing), May 16, 2022 announcement of changes effective July 1, 2022
- [DigitalOcean: Pricing changes release note](https://docs.digitalocean.com/notes/2022/pricing-changes), the products whose prices increased and the $4 Droplet slug
- [Hetzner: Price adjustment](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/), the 15 June 2026 change for new orders and rescales, legacy pricing, old and new prices
- [Vercel: Fluid compute pricing](https://vercel.com/docs/fluid-compute/pricing), regional prices for active CPU and provisioned memory
- [Cloudflare: Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), the Paid plan's price and included usage
- [Hostinger: Pricing](https://www.hostinger.com/pricing), the Premium plan's intro price, 48-month total and renewal price
- [Stripe Docs: Set up tiered pricing](https://docs.stripe.com/subscriptions/pricing-models/tiered-pricing), volume and graduated tiers with worked totals

**Announcements and press**

- [AWS News Blog: New AWS Price List API](https://aws.amazon.com/blogs/aws/new-aws-price-list-api/), December 9, 2015, JSON and CSV price files and SNS change notifications
- [Cloudflare Blog: Workers pricing, scale to zero](https://blog.cloudflare.com/workers-pricing-scale-to-zero/), the move to CPU-time pricing and its migration dates
- [heise online: Hetzner raises prices from April 1, 2026](https://heise.de/-11185981), new orders and existing products, no exception for long-term contracts, the stated cost reasons

**Filings**

- [VeriSign: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1014473/000101447326000006/vrsn-20251231.htm), the .com wholesale fee
- [GoDaddy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), ratable recognition over terms up to ten years
- [Twilio: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1447669/000144766926000021/twlo-20251231.htm), carrier fee pass-through and fees that change in some markets daily or weekly
