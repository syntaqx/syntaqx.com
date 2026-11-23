+++
title = "Advertising Revenue Accounting"
nav_title = "Revenue Accounting"
description = "Gross or net: principal and agent under ASC 606 and IFRS 15, gross spend and contribution ex-TAC, revenue as ads deliver, deferred guarantees, and rebates."
category = "Advertising Industry"
order = 2968
part = "Contracts and Money"
tags = ["advertising", "accounting", "revenue-recognition", "asc-606", "ifrs-15", "data-model"]
+++

Advertising revenue accounting answers two questions about every dollar an ad platform bills: how much of it is the platform's revenue, and when. The first is the gross-or-net question. A DSP that bills an agency $13,800 for media, data and its fee may report $13,800 of revenue with $12,000 of costs, or $1,800 of revenue; an exchange that clears a $5.00 CPM may report the whole price or only its share; a search network that pays partners a share of each click reports the click and puts the share in its costs. The answer turns on whether the platform is a **principal** (it controls the ad space before the advertiser gets it) or an **agent** (it arranges for someone else to provide it), and the public companies in this volume land on both sides. The second is timing: ads are recognized as they deliver, a prepaid guarantee is a liability until its impressions run, and credits, make-goods and rebates move revenue after the fact.

The engineering matters because the conclusion is finance's but the facts are the product's. A principal-or-agent judgment is made per product and arrangement under the standards, approved, documented and revisited; revenue is then computed from delivery, invoices and contracts the system holds. If the system stores only its own fee, it can never produce a gross-booked line; if it stores only the gross, it can't show the net; if it blends a principal media buy with an agency pass-through into one "media" total, neither the accountant nor the advertiser can separate them. The playbook's rule applies in full: the product keeps facts, finance picks policy ([The Product Keeps Facts, Finance Picks Policy](/docs/money/accounting#the-product-keeps-facts-finance-picks-policy)).

This chapter covers the principal-versus-agent analysis under ASC 606 and IFRS 15 and how the ad businesses in the filings apply it, gross spend and contribution ex-TAC as the measures that undo the difference, recognition as ads deliver and deferred revenue for prepaid guarantees, credits and make-goods as variable consideration, and rebates as consideration payable to a customer. It extends `invoices` and `invoice_lines` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and reads `vendor_incentives` from [Agencies & Media Buying](/books/advertising/agencies-and-media-buying#how-to-build-it). The general model (the five steps, recognition schedules, the month-end close, syncing to the ledger) is the playbook's [Accounting](/docs/money/accounting); [Agent and Principal](/books/advertising/agencies-and-media-buying#agent-and-principal) has the agency's legal side; [Billing & Invoicing](/books/advertising/billing-and-invoicing) has the invoices; and this volume's [Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies) and [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts) have the credits and deductions that feed it.

## How the Platforms Do It

As of November 2026, how the public companies in this volume report advertising revenue, from their 2025 filings (amounts in millions of US dollars):

| Company | Role | Basis | What the filing says | 2025 figures |
| --- | --- | --- | --- | --- |
| **Alphabet** | Search, YouTube, Google Network | Gross, with partner payments in costs | Traffic acquisition costs are "amounts paid to Google Network partners primarily for ads displayed on their properties" and to distribution partners; "Cost of revenues is comprised of TAC and other costs of revenues" | Advertising revenues $294,691; TAC $59,926, a TAC rate of 20.3% |
| **Criteo** | Commerce media, retargeting | Gross, with contribution ex-TAC as the steering measure | Contribution ex-TAC "is calculated by deducting traffic acquisition costs from revenue" | Revenue $1,944.9; TAC $770.3; contribution ex-TAC $1,174.6 |
| **Magnite** | SSP | Net for most transactions; gross for managed campaigns on insertion orders | "For the majority of transactions executed through our platform, we act as an agent on behalf of the publisher"; gross for "managed advertising campaigns that are transacted through insertion orders" | Revenue $714.0; contribution ex-TAC $669.6 |
| **Meta** | Social | Recognized on delivery; net where not principal | Impression-based ads recognized as "an ad is displayed to a user", action-based when "a user takes the action the marketer contracted for"; "where we are not the principal, we recognize revenue on a net basis" | Advertising and total revenue in the 10-K |
| **Omnicom** | Holding company | Principal on some services | "Third-party service costs include vendor costs when we act as principal in providing services to our clients"; agencies otherwise buy "as an agent for a disclosed principal" | Revenue in the 10-K |
| **PubMatic** | SSP | Net | Revenue "represents gross billings to buyers, net of amounts we pay publishers and rebates associated with SPO agreements with buyers", because "we do not control the advertising inventory and do not set the price" | Revenue $282.9; receivables $358.2 and payables $343.6 at year end |
| **The Trade Desk** | DSP | Net | "we report revenue as an agent on a net basis, which represents gross billings net of amounts we pay suppliers"; it "does not control the Supplier Components" | Revenue $2,896 on gross spend of $13.4 billion (21.6%, derived) |

Three patterns:

- **Owners of inventory report gross.** A company selling its own ad space (search results, feeds) is the principal for it by definition, and a network that resells partners' space can be one too when it controls that space; Alphabet's presentation puts what it pays Network partners in cost of revenues.
- **Marketplaces report net, and their balance sheets stay gross.** The Trade Desk and PubMatic report only their fee as revenue, but bill and owe the full amount: PubMatic notes that "both accounts receivable and accounts payable appear large in relation to revenue, which is reported on a net basis", and The Trade Desk records receivables "at the amount of gross billings."
- **One company can be both.** Magnite is an agent on its exchange and a principal on managed insertion-order campaigns; the conclusion is per product, not per company, which is why everyone reports a measure (contribution ex-TAC, gross spend) that puts both on one footing.

## Principal or Agent

The standards are converged on this guidance (ASC 606 carries it in 606-10-55-36 through 55-40; the quotes here are from IFRS 15 as clarified in 2016, and from the ASC text where PwC's guide excerpts it). IFRS 15 says an entity "determines whether it is a principal or an agent for each specified good or service promised to the customer," that it is a principal if "it controls the specified good or service before" it is transferred, and that a principal recognizes the gross amount while an agent recognizes "any fee or commission to which it expects to be entitled." The test has two steps (identify the specified good or service, then assess control of it before transfer), and three indicators support the control assessment:

1. **Primary responsibility.** "The entity is primarily responsible for fulfilling the promise to provide the specified good or service," including its acceptability.
2. **Inventory risk.** "The entity has inventory risk before the specified good or service has been transferred to a customer."
3. **Pricing discretion.** "The entity has discretion in establishing the price for the specified good or service."

The indicators are evidence, not a checklist: PwC's guide to ASC 606-10-55-39 notes that "No single indicator is individually determinative," and IFRS 15 B37A says their relevance depends on the nature of the good and the contract. Momentarily holding title to something doesn't by itself make an entity its principal. For advertising the specified good is usually the ad space (or the impression in it), and the analysis runs per arrangement:

| Arrangement | Specified good | Who controls it before the advertiser | Usual conclusion in the filings |
| --- | --- | --- | --- |
| Garden's own inventory (search, feed, retail onsite) | The placement on its own property | The platform | Principal, gross |
| Network reselling partners' inventory | The partner's ad space | Depends on who directs the space and sets the price | Alphabet presents gross with TAC in costs |
| DSP buying through exchanges | The publisher's ad space; the DSP's service is the platform | The publisher and exchange; the DSP "does not control the Supplier Components" | Agent, net (The Trade Desk) |
| SSP or exchange running an auction | The publisher's ad space | The publisher, which sets floors; the price comes from the auction | Agent, net (PubMatic, most of Magnite) |
| SSP or network selling a managed IO | A campaign it is responsible for delivering | The seller, which commits to the advertiser | Principal, gross (Magnite's managed campaigns) |
| Agency principal media buy | Inventory the agency bought and resells | The agency, when it controls the buying process and contracts with the media vendor | Principal (Omnicom when it acts as principal) |

Two questions in the analysis are less obvious than the indicators. **Who is the customer?** A DSP's contract is with an agency or advertiser for the use of its platform; an SSP's customers may be publishers (for whom it sells) or buyers. The answer decides what "the specified good" is. **What does a guarantee change?** A seller that guarantees delivery, takes the risk of a shortfall and sets the price is showing the indicators of a principal; the same company acting only as an auction venue is not. The system's job is to record, per arrangement, which of these facts holds; the conclusion, its approver and its memo are finance's records, kept with effective dates because a product change (adding guaranteed buys to an exchange, a fixed-price curated deal, a principal media offering) can change the answer from a date.

## Gross Spend, Revenue and Contribution ex-TAC

Because the same activity can be reported two ways, the ad businesses report a measure that removes the difference, and engineers end up computing it:

- **Gross spend or gross billings** is the total a buyer paid through the platform. The Trade Desk's gross spend "measures the amount of a client's spend on our platform for advertising inventory," plus data and its platform fee; its 2025 revenue of $2,896 million on $13.4 billion of gross spend implies about 21.6%, a figure it doesn't publish as a take rate.
- **Traffic acquisition cost (TAC)** is what a gross reporter pays the owners of the inventory. Alphabet's TAC of $59,926 million was 20.3% of its advertising revenues; Magnite defines its TAC as what it "must pay sellers for the sale of advertising inventory through our platform for revenue reported on a gross basis."
- **Contribution ex-TAC** is revenue minus TAC: Criteo's $1,944.9 million of revenue less $770.3 million of TAC is $1,174.6 million; Magnite's revenue of $714.0 million less its TAC on gross-booked business gives $669.6 million. For a pure net reporter, contribution ex-TAC equals revenue.

A worked example shows why the measure exists. A DSP bills an agency for $10,000 of media, $2,000 of data and a $1,800 platform fee (the example in [Demand-Side Platforms](/books/advertising/demand-side-platforms), in Programmatic):

| | As agent (net) | As principal (gross) |
| --- | --- | --- |
| Revenue | $1,800 | $13,800 |
| Cost of revenue (media and data owed to suppliers) | $0 | $12,000 |
| Gross profit, and contribution ex-TAC | $1,800 | $1,800 |
| Receivable from the agency | $13,800 | $13,800 |
| Payable to the exchanges and the data vendor | $12,000 | $12,000 |

Revenue differs by a factor of 7.7; everything that measures the business (gross profit, cash, receivables, payables) is identical. The rule for the system is the one the volume's other chapters state from their side: **store the buyer's price, each supplier's share and each fee as separate amounts**, per delivery row and invoice line, so either presentation is a query. An SSP that stores only its fee can't produce a gross-booked line for its managed campaigns; one that stores only gross can't show a publisher its share ([SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges), in Programmatic, makes the same point).

## Recognizing Revenue as Ads Deliver

Advertising is an obligation satisfied as it is delivered, measured by an output: impressions served, clicks, views. Meta recognizes impression-based ads in the period the impressions are delivered, an impression being delivered "when an ad is displayed to a user", and action-based ads when "a user takes the action the marketer contracted for"; IFRS 15 lists "units produced or units delivered" among output methods of measuring progress. So the recognition fact is the billable count the contract names, per day, which the core model already has in `delivery_daily`, and the recognized amount is that count at the contract's price.

**A prepaid guarantee is deferred until it delivers.** When an advertiser pays before delivery, IFRS 15 has the entity present "a contract liability when the payment is made or the payment is due," an obligation "to transfer goods or services to a customer for which the entity has received consideration." A worked example: an advertiser prepays $24,000 for 2,000,000 guaranteed impressions at a $12.00 CPM (an example rate), flighted over January and February.

| Month | Delivered (controlling count) | Revenue recognized | Contract liability at month end |
| --- | --- | --- | --- |
| Prepayment | 0 | $0 | $24,000 |
| January | 900,000 | 900,000 × $12 / 1,000 = $10,800 | $13,200 |
| February | 950,000 | $11,400 | $1,800 (150,000 impressions undelivered) |
| March, make-good flight delivers 150,000 | 150,000 | $1,800 | $0 |

The make-good doesn't create new revenue; it delivers what was already paid for, so the $1,800 stays a liability until it runs. If instead the parties agree a refund (the standard terms allow one when the agency prepaid and is current), the $1,800 becomes a refund owed and is never revenue. An unpaid invoice for delivered impressions is the mirror case: revenue recognized, a receivable outstanding.

Not every buy is per unit. A flat-fee sponsorship of a section for a month is a stand-ready obligation recognized over the month, not per impression; a share-of-voice buy is recognized over its flight. The pricing model on the line item ([Pricing Models](/books/advertising/pricing-models), in Auctions and Pricing) tells finance which shape each line has, and the system keeps both the flight and the deliveries so either method can be computed ([Recognition Schedules](/docs/money/accounting#recognition-schedules)).

**Credits, make-goods and refunds are variable consideration.** IFRS 15 lists "discounts, rebates, refunds, credits, price concessions, incentives, performance bonuses, penalties" among the things that make consideration variable, and includes variable amounts in revenue only to the extent "it is highly probable that a significant reversal in the amount of cumulative revenue recognised will not occur." For an ad platform that means:

- **Invalid traffic credits reduce revenue.** Traffic filtered before billing was never revenue; a credit issued after billing ([Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies)) reverses revenue already recognized, and a platform with a steady credit rate estimates it so recognized revenue isn't systematically too high.
- **Discrepancy remedies reduce revenue.** A month invoiced on the controlling count plus 10% is the price; the difference from the publisher's own count is not revenue the publisher had and lost.
- **Make-goods owed are a liability, not a cost.** Impressions owed for a shortfall defer the revenue they carry until they deliver, as in the table.

Closing the month on these numbers, and never reopening it, is the playbook's [Month-End Close](/docs/money/accounting#month-end-close): a credit issued in April for March traffic is an April entry.

## Rebates: Consideration Payable to a Customer

Sellers pay agencies and advertisers in ways that aren't media: volume rebates, agency bonuses, free inventory, co-marketing payments. In the seller's books, payments like these to a customer are **consideration payable to a customer**. IFRS 15 paragraph 70 (ASC 606-10-32-25 is its US counterpart, and PwC's guide states the same treatment) says it is accounted for "as a reduction of the transaction price" unless it is a payment for a distinct good or service the customer provides; and it reaches beyond the direct customer to "other parties that purchase the entity's goods or services from the customer." The reduction is recognized at "the later of" when the related revenue is recognized and when "the entity pays or promises to pay the consideration (even if the payment is conditional on a future event)" (ASC 606-10-32-27, IFRS 15 paragraph 72). PwC's guide treats a rebate paid to the end customer of a retailer as if paid to the retailer directly.

Three consequences for an ad seller:

- **A volume rebate is less revenue, accrued as the spend that earns it is recognized.** A seller that promises an agency 3% back on a year's spend reduces each month's revenue by the expected rebate on that month's spend, not in one lump when the rebate is paid.
- **Tiered rebates are estimated and trued up.** Where the rate depends on the year's total, the accrual uses the expected tier and catches up when the expectation changes, constrained so a reversal is unlikely.
- **A payment for a real service isn't a rebate.** A seller paying an agency at fair value for research or a sponsorship it actually receives books an expense; anything above fair value is still a reduction of revenue. The record has to say which, with the evidence.

A worked tiered rebate: a seller's agreement with an agency pays 2% of the year's spend once spend reaches $1,000,000 and 3% from $2,000,000, applied to all spend from the first dollar (example terms):

| Quarter | Spend | Expected annual spend and rate | Cumulative rebate required | Accrued this quarter |
| --- | --- | --- | --- | --- |
| Q1 | $600,000 | $2,400,000, 3% | $18,000 | $18,000 |
| Q2 | $500,000 | $1,500,000, 2% | $1,100,000 × 2% = $22,000 | $4,000 (a catch-up, not $10,000) |

Each quarter's accrual reduces that quarter's revenue; the Q2 catch-up reflects the lower expected tier. The agency's side of the same agreement is a `vendor_incentives` row in [Agencies & Media Buying](/books/advertising/agencies-and-media-buying#rebates-and-transparency), allocated to the advertisers whose spend earned it and passed through or retained under the agency agreement ([Rebates and Transparency](/books/advertising/agencies-and-media-buying#rebates-and-transparency)); the seller's side is the accrual here. The two records describe one contract and should carry the same reference.

## How to Build It

The core model has the billing facts: delivery per source and day, invoices with lines by kind, and fees with their terms. What revenue accounting adds is the judgment that turns them into revenue, the recognized and deferred amounts per period, and the rebates that reduce them. Three tables:

```sql
CREATE TABLE principal_agent_assessments (  -- the gross-or-net conclusion per product and arrangement
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  entity_org_id         UUID NOT NULL REFERENCES organizations (id),  -- the reporting entity
  arrangement           TEXT NOT NULL,      -- e.g. 'open_auction', 'managed_io', 'dsp_platform', 'principal_media'
  specified_good        TEXT NOT NULL,      -- what is promised to the customer, e.g. 'publisher ad space'
  customer_role         TEXT NOT NULL CHECK (customer_role IN ('advertiser', 'agency',
                          'publisher', 'buyer_platform')),
  standard              TEXT NOT NULL CHECK (standard IN ('asc_606', 'ifrs_15')),
  conclusion            TEXT NOT NULL CHECK (conclusion IN ('principal', 'agent')),
  controls_before_transfer BOOLEAN NOT NULL,
  primarily_responsible BOOLEAN NOT NULL,   -- the three indicators, as evidence
  inventory_risk        BOOLEAN NOT NULL,
  pricing_discretion    BOOLEAN NOT NULL,
  rationale             TEXT NOT NULL,
  policy_memo_ref       TEXT NOT NULL,      -- the accounting memo the conclusion is documented in
  approved_by           TEXT NOT NULL,
  approved_at           TIMESTAMPTZ NOT NULL,
  effective             DATERANGE NOT NULL,
  EXCLUDE USING gist (entity_org_id WITH =, arrangement WITH =, standard WITH =,
    effective WITH &&)
);

CREATE TABLE revenue_recognition_entries (  -- recognized and deferred revenue per period, from delivery
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  entity_org_id         UUID NOT NULL REFERENCES organizations (id),
  assessment_id         UUID NOT NULL REFERENCES principal_agent_assessments (id),
  insertion_order_id    UUID REFERENCES insertion_orders (id),
  line_item_id          UUID REFERENCES line_items (id),
  deal_id               UUID REFERENCES deals (id),
  invoice_line_id       UUID REFERENCES invoice_lines (id),  -- the billing the entry relates to
  period_month          DATE NOT NULL,      -- first day of the accounting month
  kind                  TEXT NOT NULL CHECK (kind IN ('recognize', 'defer', 'release',
                          'variable_estimate', 'reversal')),
  basis                 TEXT NOT NULL CHECK (basis IN ('gross', 'net')),
  quantity              BIGINT,             -- the delivered units the entry is measured on
  revenue_minor         BIGINT NOT NULL DEFAULT 0,          -- signed
  cost_of_revenue_minor BIGINT NOT NULL DEFAULT 0,          -- gross basis: TAC and supplier costs
  contract_liability_minor BIGINT NOT NULL DEFAULT 0,       -- signed change: defer +, release -
  currency              CHAR(3) NOT NULL,
  delivery_version      INT,                -- the delivery_daily version measured
  journal_batch_ref     TEXT,               -- the accounting sync batch it was posted in
  posted_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (period_month = date_trunc('month', period_month)::date),
  CHECK (basis = 'gross' OR cost_of_revenue_minor = 0),
  CHECK (num_nonnulls(insertion_order_id, line_item_id, deal_id, invoice_line_id) >= 1)
);

CREATE TABLE rebate_accruals (              -- consideration payable to a customer, reducing revenue
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  entity_org_id         UUID NOT NULL REFERENCES organizations (id),  -- the seller paying it
  customer_org_id       UUID NOT NULL REFERENCES organizations (id),  -- the agency or advertiser
  vendor_incentive_id   UUID REFERENCES vendor_incentives (id),       -- the agreement, as the agency records it
  agreement_ref         TEXT NOT NULL,
  period                DATERANGE NOT NULL, -- the accrual period, e.g. a quarter
  qualifying_spend_minor BIGINT NOT NULL CHECK (qualifying_spend_minor >= 0),
  cumulative_spend_minor BIGINT NOT NULL CHECK (cumulative_spend_minor >= qualifying_spend_minor),
  expected_annual_spend_minor BIGINT NOT NULL,
  expected_rate_bp      INT NOT NULL CHECK (expected_rate_bp BETWEEN 0 AND 10000),
  cumulative_required_minor BIGINT NOT NULL,
  accrued_minor         BIGINT NOT NULL,    -- this period's reduction of revenue, a catch-up included
  currency              CHAR(3) NOT NULL,
  treatment             TEXT NOT NULL CHECK (treatment IN ('reduces_revenue',
                          'distinct_service_expense', 'split')),
  fair_value_minor      BIGINT,             -- distinct service: its fair value; any excess reduces revenue
  status                TEXT NOT NULL CHECK (status IN ('accrued', 'trued_up', 'credited', 'paid')),
  invoice_line_id       UUID REFERENCES invoice_lines (id),  -- the 'rebate' credit line, once issued
  estimated_by          TEXT NOT NULL,
  posted_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (treatment = 'reduces_revenue' OR fair_value_minor IS NOT NULL)
);

CREATE INDEX revenue_recognition_entries_period_idx
  ON revenue_recognition_entries (entity_org_id, period_month);
CREATE INDEX revenue_recognition_entries_io_idx
  ON revenue_recognition_entries (insertion_order_id) WHERE insertion_order_id IS NOT NULL;
CREATE INDEX rebate_accruals_customer_idx ON rebate_accruals (customer_org_id, period);
```

A product gets its accounting basis from the assessment in force, and the alter records it on the line items it governs, so delivery can be classified at the time it happens ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE line_items ADD COLUMN principal_agent_assessment_id UUID;
ALTER TABLE line_items ADD CONSTRAINT line_items_principal_agent_assessment_fk
  FOREIGN KEY (principal_agent_assessment_id) REFERENCES principal_agent_assessments (id) NOT VALID;
CREATE INDEX CONCURRENTLY line_items_principal_agent_assessment_idx
  ON line_items (principal_agent_assessment_id) WHERE principal_agent_assessment_id IS NOT NULL;

-- after backfilling each line item's arrangement
ALTER TABLE line_items VALIDATE CONSTRAINT line_items_principal_agent_assessment_fk;
```

Revenue, costs and the deferred balance for an insertion order, by month, are sums over the entries, the same shape as a recognition schedule:

```sql
-- recognized revenue and the running contract liability for one IO
SELECT r.period_month,
       r.basis,
       SUM(r.revenue_minor) AS revenue_minor,
       SUM(r.cost_of_revenue_minor) AS cost_of_revenue_minor,
       SUM(r.revenue_minor - r.cost_of_revenue_minor) AS contribution_ex_tac_minor,
       SUM(SUM(r.contract_liability_minor)) OVER (PARTITION BY r.basis ORDER BY r.period_month)
         AS contract_liability_minor
FROM revenue_recognition_entries r
WHERE r.insertion_order_id = $1
GROUP BY r.period_month, r.basis
ORDER BY r.period_month;
```

The rebate accrual is the application logic worth writing carefully: it is a cumulative catch-up, so each period accrues the difference between what the expected tier requires to date and what was already accrued, never a period rate times period spend:

```go tab="Go"
// Tier is a rebate rate that applies to all spend once annual spend reaches Min.
type Tier struct {
	MinMinor int64
	RateBP   int64
}

// RateFor returns the rate for an expected annual spend; tiers are sorted by MinMinor.
func RateFor(tiers []Tier, expectedAnnualMinor int64) int64 {
	var rate int64
	for _, t := range tiers {
		if expectedAnnualMinor >= t.MinMinor {
			rate = t.RateBP
		}
	}
	return rate
}

// AccrueRebate returns this period's accrual: the cumulative rebate the
// expected tier requires on spend to date, less what is already accrued.
// It is negative when the expected tier falls far enough.
func AccrueRebate(tiers []Tier, cumulativeSpendMinor, expectedAnnualMinor,
	accruedToDateMinor int64) (accrualMinor, requiredMinor int64) {
	rate := RateFor(tiers, expectedAnnualMinor)
	requiredMinor = (cumulativeSpendMinor*rate + 5_000) / 10_000 // round half up, once
	return requiredMinor - accruedToDateMinor, requiredMinor
}

// tiers := []Tier{{100_000_000, 200}, {200_000_000, 300}}  // $1M at 2%, $2M at 3%
// AccrueRebate(tiers, 60_000_000, 240_000_000, 0)          == (1_800_000, 1_800_000)  // Q1: $18,000
// AccrueRebate(tiers, 110_000_000, 150_000_000, 1_800_000) == (400_000, 2_200_000)    // Q2: $4,000
```

```rust tab="Rust"
/// A rebate rate that applies to all spend once annual spend reaches `min_minor`.
pub struct Tier {
    pub min_minor: i64,
    pub rate_bp: i64,
}

/// The rate for an expected annual spend; tiers are sorted by `min_minor`.
pub fn rate_for(tiers: &[Tier], expected_annual_minor: i64) -> i64 {
    tiers
        .iter()
        .filter(|t| expected_annual_minor >= t.min_minor)
        .last()
        .map_or(0, |t| t.rate_bp)
}

/// This period's accrual and the cumulative requirement: what the expected
/// tier requires on spend to date, less what is already accrued.
pub fn accrue_rebate(
    tiers: &[Tier],
    cumulative_spend_minor: i64,
    expected_annual_minor: i64,
    accrued_to_date_minor: i64,
) -> (i64, i64) {
    let rate = rate_for(tiers, expected_annual_minor) as i128;
    let required = ((cumulative_spend_minor as i128 * rate + 5_000) / 10_000) as i64;
    (required - accrued_to_date_minor, required)
}

// let tiers = [Tier { min_minor: 100_000_000, rate_bp: 200 }, Tier { min_minor: 200_000_000, rate_bp: 300 }];
// accrue_rebate(&tiers, 60_000_000, 240_000_000, 0)          == (1_800_000, 1_800_000)
// accrue_rebate(&tiers, 110_000_000, 150_000_000, 1_800_000) == (400_000, 2_200_000)
```

Design notes:

- **The assessment is a dated, approved record.** `principal_agent_assessments` holds the conclusion per entity, arrangement and standard, with the indicator facts, the rationale, the memo and the approver, effective-dated with no overlaps. A product change that could change the answer creates a new assessment from a date; past revenue keeps the assessment it was recognized under.
- **Facts in, presentation out.** Delivery rows keep the buyer's cost, the publisher's net and each fee; invoice lines keep media, fees and credits by kind. Recognition entries apply the assessment to those facts. Nothing upstream stores "revenue", so a changed conclusion is a recomputation, not a migration.
- **Recognition follows the controlling count.** Entries are measured on the `delivery_daily` source the contract bills on and record the version read, so a restatement before close produces a new entry and one after close goes to the next month.
- **Deferral is a balance of entries.** Prepayments create `defer` entries, delivery creates `release` and `recognize` entries, and the contract liability at any date is their running sum. A refund of an undelivered guarantee releases the liability without recognizing revenue.
- **Variable consideration has its own kind.** Estimated invalid traffic credits and rebate accruals are `variable_estimate` entries that the actual credit or rebate trues up, so the estimate and its accuracy are both visible.
- **Rebates link both sides of the agreement.** `rebate_accruals.vendor_incentive_id` and `agreement_ref` tie the seller's reduction of revenue to the agency's record of the same incentive, and the `rebate` credit line that settles it.
- **Posting is batched and idempotent.** Entries reach the general ledger in summary journals per batch, with the batch reference on each entry ([Syncing to the Accounting System](/docs/money/accounting#syncing-to-the-accounting-system)); a closed month is never reposted ([Closed Periods Stay Closed](/docs/money/accounting#closed-periods-stay-closed)).

## Auditing

- **Every gross-or-net conclusion.** Each assessment with its specified good, customer, indicators, rationale, memo, approver and effective dates, and which line items and revenue it governed.
- **Revenue recomputable from delivery.** For any month and product, recognized revenue and costs rebuilt from the controlling delivery rows, the invoice lines and the assessment in force, matching the posted journals.
- **The deferred balance, entry by entry.** Every prepaid guarantee's contract liability from payment to the last delivered impression or refund.
- **Every credit and rebate against revenue.** Invalid traffic credits, discrepancy adjustments and make-goods owed, and each rebate accrual with its tier assumption, true-ups and settlement, tied to the agreement on both sides.
- **The non-GAAP measures from the same rows.** Gross spend, TAC and contribution ex-TAC computed from the stored amounts, so the reported measure and the ledger reconcile.

The mechanics are the playbook's [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Store the buyer's price, each supplier's share and each fee as separate amounts** on every delivery row and invoice line, so gross and net are both queries.
- **Keep the principal-or-agent conclusion as a dated, approved record** per arrangement and standard, and point each line item at the one that governs it.
- **Recognize revenue from the controlling delivery count** at the contract's price, and keep flights for the obligations that are recognized over time.
- **Defer prepaid guarantees as a contract liability** released by delivery, make-goods included, and never recognize a refunded shortfall.
- **Treat credits, discrepancy remedies and rebates as variable consideration,** estimated and trued up as entries.
- **Accrue rebates as cumulative catch-ups** on the expected tier, and tie the seller's accrual to the agency's incentive record.
- **Report gross spend, TAC and contribution ex-TAC from the same rows as revenue,** and post to the ledger in closed, idempotent batches.

## References

**Regulation**

- [EUR-Lex: Commission Regulation (EU) 2016/1905 adopting IFRS 15](https://eur-lex.europa.eu/eli/reg/2016/1905/oj/eng), consideration payable to a customer (paragraphs 70 to 72), variable consideration and its constraint (51 and 56), contract liabilities (106 and Appendix A), and output methods (B15)
- [EUR-Lex: Commission Regulation (EU) 2017/1987 adopting the Clarifications to IFRS 15](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32017R1987), principal versus agent considerations B34 to B38, control before transfer, gross and net, and the three indicators

**Filings**

- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), traffic acquisition costs defined, TAC in cost of revenues, 2025 TAC and TAC rate, and Google Network
- [Criteo: Fourth quarter and fiscal year 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1576427/000157642726000004/exhibit991q42025.htm), revenue, traffic acquisition cost and contribution ex-TAC and its definition
- [Magnite: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000007/mgni-20251231.htm), agent for most transactions, gross for managed insertion-order campaigns, and the contribution ex-TAC and TAC definitions
- [Magnite: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000010/a991-earningsq42025.htm), 2025 revenue and contribution ex-TAC
- [Meta Platforms: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm), recognition of impression-based and action-based ads and net recognition where not the principal
- [Omnicom: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/29989/000002998926000006/omc-20251231.htm), vendor costs when acting as principal, principal when it controls the media buying process, and buying as agent for a disclosed principal
- [PubMatic: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1422930/000142293026000010/pubm-20251231.htm), net revenue reporting and its reasons, and receivables and payables against net revenue
- [PubMatic: Fourth quarter and fiscal year 2025 results](https://www.sec.gov/Archives/edgar/data/1422930/000142293026000008/fy25pressrelease.htm), 2025 revenue
- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), net reporting as agent, not controlling the supplier components, gross spend and receivables at gross billings
- [The Trade Desk: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000009/ttd-20260225x8kexx991.htm), 2025 revenue and gross spend

**Reference**

- [PwC Viewpoint: Principal versus agent framework](https://viewpoint.pwc.com/dt/us/en/pwc/accounting_guides/revenue_from_contrac/revenue_from_contrac_US/chapter_10_principa_US/10_2_principal_versus.html), the ASC 606-10-55-39 indicators, PwC's note that no single indicator is determinative, and flash title
- [PwC Viewpoint: Consideration payable to a customer](https://viewpoint.pwc.com/dt/us/en/pwc/accounting_guides/revenue_from_contrac/revenue_from_contrac_US/chapter_4_determinin_US/46consideration_paya_US.html), ASC 606-10-32-27 timing, reduction of the transaction price unless for a distinct good or service, and the rebate to a customer's customer
