+++
title = "Replacing a Core System"
description = "Renewal rollover versus big bang, migrating in-force policies and open claims, parallel runs, the long tail of legacy life systems, and what filings say."
category = "Insurance Industry"
order = 2775
part = "Running the Platform"
tags = ["insurance", "core-systems", "migration", "legacy-systems", "conversion", "architecture"]
+++

Replacing an insurer's core system is not a software project with a launch date. It is a conversion of contracts that are still running: policies in force with months left on their terms, installment plans half paid, claims open for years with reserves, diaries and statutory deadlines, and, in life insurance, policies sold decades ago that still have to compute cash values and pay death claims. The old system can't simply be turned off, because it is the record of coverage for every loss that happened while it was in charge, and claims for those losses will keep arriving. The new system can't simply be loaded, because a policy loaded wrongly charges the wrong premium, sends the wrong notice or pays the wrong claim, under the same laws as one written there.

This chapter covers the conversion strategies (renewal rollover, big bang and waves) with the arithmetic of a rollover worked; what moves and how for in-force policies and open claims, including a midterm conversion's premium; parallel runs; the long tail of legacy systems in life and annuities; and what public filings say about duration, cost and failure. The generic migration playbook (strangling, crosswalks, loading with side effects off, shadow reads, reconciliation, cutover and the archive) is in [Replacing Systems](/docs/architecture/replacing-systems); Commerce's [Replatforming](/books/commerce/replatforming) covers a different industry's version. The vendors are in [Core Platforms](/books/insurance/core-platforms) and the target shape is [Insurance System Architecture](/books/insurance/insurance-system-architecture).

## How the Platforms Do It

As of November 2026, what public filings and vendor pages say about replacements:

| Source | What it says |
| --- | --- |
| **Donegal Group** (10-K for 2025) | Donegal Mutual began "a multi-year systems modernization project to replace its remaining legacy systems" in 2018, rolling systems out in stages from 2020 through 2025; commercial auto, commercial multi-peril and workers' comp moved in 2023; personal dwelling fire and homeowners renewal conversions covered 2 states in 2023 and 8 more in 2024, with a 2025 release covering "the remaining lines of business"; legacy renewals convert "on a state-by-state basis," with completion projected for 2027; next it migrates "its on-premises Guidewire claims, billing and policy administration systems" to the cloud, claims and billing in early 2027 and policy by 2028 |
| **Guidewire** (10-K for fiscal 2026) | Implementation and testing "typically lasts six to 24 months or longer and unexpected implementation delays and difficulties can occur"; missed expectations have led to "monetary credits"; a stated risk is its ability to "migrate existing term license customers to cloud-based offerings on a subscription basis" |
| **Sapiens** (20-F for 2024) | "Our solutions are delivered over periods of time ranging from several months to a few years" |
| **Duck Creek** (10-K for fiscal 2022) | Missed implementation estimates risk "costly disputes with, and ultimately loss of, customers" |
| **Equisoft** | Leads with "350+" data migrations for its life and annuity clients |
| **DXC Technology** | Sells both heritage life platforms (Cyberlife, Ingenium, Integral) and their cloud versions, plus business process services for life and wealth |
| **Atlantic American** (10-K for 2025) | Material weaknesses including failure to "resolve differences among third-party enrollment data, the policy administration system and the general ledger" |

The Donegal disclosure is the shape of a real replacement in public view: started in 2018, converted line by line and state by state at renewal, projected to finish legacy renewals in 2027, and followed immediately by a second migration of the new platform from on-premises to cloud through 2028. Ten years from start to a finished target is not a failure; it is what a renewal-rollover conversion of a multi-line, multi-state book looks like. <!-- source-gap: core-replacement-costs | missing | public dollar figures for the cost of a core system replacement at an insurer, and documented failures (write-offs, regulator findings) tied to one | closes with: a 10-K, 10-Q or 8-K disclosing a capitalized software impairment or replacement budget for a policy, billing or claims system, or a DOI examination report citing a conversion | checked: 2026-11-10 --> None of the filings I opened discloses a dollar cost for the replacement, and I found no public write-off tied to a failed core conversion, so the evidence here is about duration and risk, not price.

## Conversion Strategies

Four strategies, often combined:

| Strategy | How it works | Good for | Costs |
| --- | --- | --- | --- |
| **Renewal rollover** | Each policy moves when it renews: the renewal term is written on the new system and the old term runs off on the old one | Short-term P&C lines (six- and twelve-month terms) | Two systems for at least one full term; claims on old terms stay old for years |
| **Big bang** | All in-force policies convert at one cutoff, midterm | Small books, a single line, or an old system that can't be kept | Every in-force policy converts midterm: premium, billing and claims history must all move correctly at once |
| **Waves** | Rollover or big bang by line, state or channel, in sequence (Donegal's state-by-state renewal conversion) | Multistate, multi-line carriers | Longer elapsed time; per-state filings and product builds for each wave |
| **New business first** | New policies go to the new system; renewals convert later | Proving the new system on low volume | Three populations for a while: new business new, renewals old, conversions in flight |

The general tradeoffs between big bang, phased and parallel approaches are in [Big Bang, Phased or Parallel](/docs/architecture/replacing-systems#big-bang-phased-or-parallel). The insurance twist is that the product itself has to exist on the new system before any policy moves: each state's rates, rules and forms built, tested and matched to the filings ([From Filing to Product Configuration](/books/insurance/rate-and-form-filing#from-filing-to-product-configuration)), and in some cases refiled, if the new system's rating can't reproduce the old algorithm to the cent. A renewal rollover also changes what the renewal looks like to the insured, so notice rules for premium changes and conditional renewal apply to conversion renewals as to any other ([Conditional Renewal](/books/insurance/endorsements-and-renewals#conditional-renewal)).

### Worked Numbers: A Renewal Rollover

My numbers. A homeowners book of 120,000 annual policies renewing evenly (10,000 a month), average premium $2,400, so $288 million written a year. Every renewal from January 1, 2027 is written on the new system. Earned premium by quarter, approximating each month's in-force at mid-month:

| Quarter, 2027 | Old system's share of in-force (average) | Earned on the old system | Earned on the new system |
| --- | --- | --- | --- |
| Q1 | (11.5 + 10.5 + 9.5) ÷ 3 ÷ 12 = 87.5% | $63.0M | $9.0M |
| Q2 | (8.5 + 7.5 + 6.5) ÷ 3 ÷ 12 = 62.5% | $45.0M | $27.0M |
| Q3 | 37.5% | $27.0M | $45.0M |
| Q4 | 12.5% | $9.0M | $63.0M |
| **2027** | | **$144.0M** | **$144.0M** |

Each quarter earns $72 million in total ($288 million ÷ 4). Written premium moves at once (all $288 million of 2027 renewals are written on the new system), earned premium crosses over through the year, and the last old term expires December 31, 2027. But the old system is not done then. Homeowners claims are reported months after the loss and stay open for years; every claim on a 2026 term is a claim on an old-system policy, with the old system's coverage record. The decision the rollover forces is what to do with them:

- **Keep old-term claims on the old claims system** until they close, which keeps that system running (and licensed, staffed and secure) for years.
- **Convert the old terms' coverage history to the new system** so new claims on old terms open there, which means converting policy versions, not just current policies.
- **Convert claims at a cutoff** and keep the old system read-only as an archive ([Keep the Old System as a Read-Only Archive](/docs/architecture/replacing-systems#keep-the-old-system-as-a-read-only-archive)).

My default is to convert policy history for the look-back a claim might need and move claims separately, because claims carry their own clocks.

## Migrating In-Force Policies

What moves for each in-force policy, and the rule for each:

| Record | Rule |
| --- | --- |
| **Parties and roles** | Matched and deduplicated across systems, with a crosswalk from old IDs ([Crosswalks and ID Mapping](/docs/architecture/replacing-systems#crosswalks-and-id-mapping)); mortgagees, lienholders and additional insureds kept on the right versions |
| **Policy number** | Kept. Insureds, agents, mortgagees, state verification systems and courts all know the policy by it ([Policy Numbers](/books/insurance/quote-bind-and-issue#policy-numbers)) |
| **Current term and its versions** | The version in force, and prior versions in the term, so a backdated endorsement after conversion can be handled |
| **Prior terms** | Enough history for rating (claim-free years, tenure, prior carrier) and for claims on old terms |
| **Producer of record** | With the license and appointment that were valid when written ([Checking Before You Bind and Pay](/books/insurance/producer-licensing#checking-before-you-bind-and-pay)) |
| **Premium and earning** | Either left on the old ledger to run off, or the unearned part transferred (below); never rewritten as new premium |
| **Billing** | The account, the plan, invoices outstanding, installments remaining, payments and credits, and any nonpay notice in flight with its deadline |
| **Pending work** | Open endorsements, pending cancellations and nonrenewals with notices already mailed, renewal offers outstanding, all with their legal deadlines |
| **Documents** | References to what was issued, so the as-issued declarations stay retrievable |

The load runs with side effects off: no welcome letters, no new ID cards, no commissions re-accrued, no premium re-written, no notices generated, no reinsurance cessions recomputed ([Load With Side Effects Off](/docs/architecture/replacing-systems#load-with-side-effects-off)). Each converted policy gets a conversion transaction so its history in the new system starts at a known point with a known source.

### Worked Numbers: A Midterm Conversion's Premium

My numbers. A twelve-month policy written on the old system for $1,200.00, effective September 1, 2026, converts in a big bang on March 1, 2027, 181 days into its 365-day term.

| | Old system | New system | Total |
| --- | --- | --- | --- |
| Written at issue (Sept 1, 2026) | $1,200.00 | | $1,200.00 |
| Earned through Feb 28, 2027: $1,200 × 181 / 365 | $595.07 | | $595.07 |
| **Option A: run off.** Old ledger keeps the policy's premium and earns it to Sept 1; the new system's conversion transaction carries $0 written premium | Earns the remaining $604.93 | $0 | $1,200.00 |
| **Option B: transfer unearned.** Old ledger books a conversion-out entry of −$604.93; the new ledger books a conversion-in entry of +$604.93 earning from March 1 to September 1 | $595.07 | $604.93 | $1,200.00 |

Option B puts all future earning, endorsements and cancellations on one system, which is why big bang conversions usually take it. It also creates the trap: the conversion entries are not written premium. They must be excluded from the State Page's direct written premium, from premium tax, from statistical plan premium and from commissions, or the policy is reported, taxed and paid twice. So the transfer is its own entry kind, carried through every report as a conversion, and reconciled to zero across the two ledgers.

```go tab="Go"
// TransferUnearned splits a term's premium at a conversion time: what the old
// system has earned stays there, the rest moves as a conversion entry.
func TransferUnearned(premiumCents int64, termStart, termEnd, convertAt time.Time) (keep, move int64) {
	total := termEnd.Sub(termStart).Hours()
	used := convertAt.Sub(termStart).Hours()
	earned := int64(math.Round(float64(premiumCents) * used / total))
	return earned, premiumCents - earned // move is booked -move old, +move new
}
```

```rust tab="Rust"
use chrono::{DateTime, Utc};

/// Splits a term's premium at conversion: (earned, kept on the old ledger; unearned, moved).
pub fn transfer_unearned(premium: i64, start: DateTime<Utc>, end: DateTime<Utc>, convert_at: DateTime<Utc>) -> (i64, i64) {
    let total = (end - start).num_seconds() as f64;
    let used = (convert_at - start).num_seconds() as f64;
    let earned = (premium as f64 * used / total).round() as i64;
    (earned, premium - earned) // book -moved on the old ledger, +moved on the new
}
```

For $120,000 cents from September 1, 2026 to September 1, 2027, converting March 1, 2027: earned 59,507, moved 60,493, matching the table. Computing the earned part by the hour rather than the day matters only when the conversion time isn't midnight at the risk's 12:01 a.m. boundary, which is a reason to convert at a term-day boundary.

## Migrating Open Claims

Open claims are harder than policies because each one carries money, clocks and people:

- **Exposures and reserves by cost type,** with the reserve history, not just the current balance, because Schedule P and loss development need incurred as of each past date ([Loss Reserving & Development](/books/insurance/loss-reserving)). If the history can't move, the old system's history is archived and the new system starts with an opening reserve transaction per exposure and cost type, dated at conversion.
- **Payments and recoveries** to date, by payee and cost type, so limits, deductibles, 1099 totals and subrogation balances are correct ([Exposures, Reserves & Payments](/books/insurance/reserves-and-payments)).
- **Open diary tasks with their legal deadlines,** each with the rule that set it, so a statutory acknowledgment or payment deadline doesn't fall through the gap between systems ([The Diary as a Rules Engine](/books/insurance/claim-handling-law#the-diary-as-a-rules-engine)).
- **Checks in flight:** issued and uncleared payments stay reconcilable to the bank under the system that issued them.
- **Litigation, coverage positions and reservation of rights letters,** with their documents.
- **Reinsurance:** ceded reserves and recoverables per claim and contract, so the reinsurance statements don't double or drop a claim ([Reinsurance Operations](/books/insurance/reinsurance-operations)).

Claims usually convert separately from policies, at a cutoff by report date or by claim status (new claims on the new system, open claims moved in batches, closed claims archived), because their clocks run regardless of the policy system's schedule.

## Parallel Runs

A parallel run processes the same work on both systems and compares the outputs before the new one is trusted:

| What runs in parallel | Compared | Tolerance |
| --- | --- | --- |
| **Rating** | Every new business, renewal and endorsement rated on both: premium per coverage, fees, taxes | Zero: the filed rate is the filed rate, and a one-cent difference is a defect in one of them |
| **Renewals** | Renewal offers, premium changes, nonrenewal and conditional renewal decisions | Zero on premium; every difference in decision explained |
| **Billing** | Invoices, installment amounts and due dates, nonpay triggers | Zero on amounts and dates |
| **Notices** | Which notices each system would send, with which deadlines | Zero on deadlines |
| **Claims** | Reserve and payment postings, task due dates | Zero on money and deadlines |
| **Reports** | Earned and unearned premium, commissions, statistical records, premium tax base | Reconciled to the cent |

The rating parallel is the one that finds most problems, because old systems encode rating quirks (rounding order, a factor applied to the wrong base, a territory boundary) that are in the old system's behavior and sometimes in the filing. When the old system and the filing disagree, the filing wins, which may mean a corrected rate for some insureds at conversion and a disclosure decision; that is a regulatory question, not a migration detail. The general technique is in [Dark Launch and Shadow Reads](/docs/architecture/replacing-systems#dark-launch-and-shadow-reads) and [Reconciliation](/docs/architecture/replacing-systems#reconciliation).

## The Long Tail in Life and Annuities

Life and annuity systems are replaced least often and kept longest, for reasons the products make plain. A policy sold forty years ago is still in force, with its original product's calculation rules, its premium history for tax testing, its loans and its riders ([Life Products as Data](/books/insurance/life-products), [Life Insurance & the Tax Code](/books/insurance/life-insurance-and-tax)). Converting it means reproducing every value to the cent going forward and carrying the history the tax tests need backward. Many blocks are closed (no new sales), shrinking every year, and the cost of converting them can exceed the cost of keeping the old system alive.

The options, each visible in public vendor offerings:

- **Keep the legacy system and modernize around it.** Wrap it with APIs, move it to new infrastructure, and convert nothing. DXC's product list, with heritage platforms alongside "cloud evolution" versions of the same names, describes this path.
- **Outsource the block's administration** to a firm that runs the legacy platform as a service (DXC's business process services for life and wealth is one).
- **Convert block by block** onto a modern platform, the work Equisoft's "350+" migrations represent.
- **Transfer the block** by reinsurance or sale to a company that specializes in closed blocks, which moves the administration problem with the risk ([Life Reserves, Capital & Private Equity](/books/insurance/life-reserves-and-capital)).

For P&C the long tail is claims, not policies: a workers' comp or liability claim open for twenty years outlives several claims systems, and each conversion has to carry its full payment and reserve history.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) and the system-of-record columns in [Core Platforms](/books/insurance/core-platforms#how-to-build-it). A converted policy gets a `policy_transactions` row of a new kind, `conversion`, and conversion premium transfers get a new `premium_entries` kind so every report can exclude them:

```sql
ALTER TABLE policy_transactions DROP CONSTRAINT policy_transactions_kind_check;
ALTER TABLE policy_transactions ADD CONSTRAINT policy_transactions_kind_check
  CHECK (kind IN ('new_business', 'endorsement', 'cancellation', 'reinstatement', 'renewal',
    'nonrenewal', 'audit', 'rewrite', 'reversal', 'conversion'));

ALTER TABLE premium_entries DROP CONSTRAINT premium_entries_kind_check;
ALTER TABLE premium_entries ADD CONSTRAINT premium_entries_kind_check
  CHECK (kind IN ('premium', 'premium_tax', 'sl_tax', 'stamping_fee', 'policy_fee',
    'installment_fee', 'surcharge', 'assessment', 'conversion_transfer'));

CREATE TABLE conversion_batches (          -- one load of one population into the new system
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  source_system      TEXT NOT NULL,         -- 'legacy_policy', 'legacy_claims'
  population         TEXT NOT NULL,         -- 'homeowners US-PA renewals 2027-03', 'open claims wave 2'
  strategy           TEXT NOT NULL CHECK (strategy IN ('renewal_rollover', 'big_bang', 'wave',
                       'claims_cutoff')),
  cutoff_at          TIMESTAMPTZ NOT NULL,  -- effective time of the conversion
  side_effects       TEXT NOT NULL CHECK (side_effects = 'off'),
  status             TEXT NOT NULL CHECK (status IN ('extracted', 'mapped', 'loaded',
                       'reconciled', 'accepted', 'rolled_back')),
  counts             JSONB NOT NULL,        -- source, loaded, rejected, by entity
  totals             JSONB NOT NULL,        -- unearned, receivables, reserves: source and target
  accepted_by        UUID,
  accepted_at        TIMESTAMPTZ
);

CREATE TABLE conversion_mappings (         -- the crosswalk: every source record to its target
  batch_id           UUID NOT NULL REFERENCES conversion_batches (id),
  entity             TEXT NOT NULL,         -- 'party', 'policy', 'policy_version', 'claim',
                                            -- 'exposure', 'billing_account', 'claim_task'
  source_key         TEXT NOT NULL,         -- the old system's identifier
  target_id          UUID,                  -- null when rejected
  rule_version       TEXT NOT NULL,         -- the field mapping specification applied
  outcome            TEXT NOT NULL CHECK (outcome IN ('converted', 'merged', 'rejected',
                       'deferred')),
  issues             JSONB,                 -- what failed validation and why
  PRIMARY KEY (entity, source_key, batch_id)
);
```

Design choices that matter:

- **Every converted row has a crosswalk entry** to its source, so a claim adjuster, an examiner or a court can see where a record came from and what it looked like there.
- **Conversion entries are their own kinds,** excluded from written premium, premium tax, statistical plans and commissions, and reconciled to zero across both ledgers.
- **Side effects are off by constraint,** and a batch is accepted only when its counts and totals reconcile.
- **System of record per policy and claim,** dated, so that during a rollover each record knows which system governs it ([Core Platforms](/books/insurance/core-platforms#how-to-build-it)).
- **Pending legal clocks are converted as tasks** with their original rule and due date, never recomputed from the conversion date.

## Auditing

- **Every converted policy and claim traces to its source** through the crosswalk, and the old record is retrievable from the archive.
- **Totals reconcile per batch:** policies in force, unearned premium, receivables, open reserves by cost type and recoverables match source to target.
- **No double counting:** conversion transfers are absent from direct written premium, premium tax, statistical submissions and commission statements.
- **No missed deadlines across the cutover:** every notice and claim task due in the conversion window was met by one system or the other.
- **Rating parallel closed:** every premium difference found in parallel was resolved, with any filing or customer decisions documented.
- **The old system's records are kept** for the retention periods of the policies and claims it governed.

## What This Means for the System You Build

- **Pick the strategy per line:** renewal rollover for short terms, waves for multistate books, big bang only where the book is small or the old system can't stay.
- **Decide early where old-term claims live,** because the rollover leaves them behind for years.
- **Convert premium as run-off or as a transfer,** and if a transfer, give it its own entry kind that every report excludes.
- **Move claims with their history, money and clocks,** not just their balances.
- **Run rating, billing, notices and claims in parallel to zero tolerance** before cutover.
- **For life blocks, price keeping, outsourcing, converting and transferring** against each other; conversion is not the default.

## References

**Filings**

- [Donegal Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/800457/000114036126008268/ef20060826_10k.htm), the modernization begun in 2018, staged rollouts, state-by-state renewal conversions through 2027, and the migration of on-premises Guidewire systems to the cloud through 2028
- [Guidewire Software: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1528396/000152839626000046/gwre-20260731.htm), implementation duration, credits and migrating term license customers to cloud subscriptions
- [Sapiens International: Form 20-F for 2024](https://www.sec.gov/Archives/edgar/data/885740/000101376225003193/ea0235334-20f_sapiens.htm), delivery periods from several months to a few years
- [Duck Creek Technologies: Form 10-K for fiscal 2022](https://www.sec.gov/Archives/edgar/data/1160951/000095017022020470/dct-20220831.htm), implementation delays and the risk of disputes and lost customers
- [Atlantic American: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/8177/000114036126039933/ef20060652_10k.htm), material weaknesses reconciling enrollment, billing, cash, the policy administration system and the general ledger

**Vendor documentation**

- [Equisoft](https://www.equisoft.com/), migration counts for life and annuity clients
- [DXC: Life and annuity](https://dxc.com/us/en/industries/insurance/life-annuity), heritage platforms, their cloud versions and business process services
