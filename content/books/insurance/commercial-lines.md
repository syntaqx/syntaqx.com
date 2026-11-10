+++
title = "The Commercial Lines Map"
nav_title = "Commercial Lines"
description = "BOP, package, CGL, property, commercial auto, umbrella and inland marine; occurrence vs claims-made; schedule and experience rating and loss runs."
category = "Insurance Industry"
order = 2747
part = "Commercial and Specialty Lines"
tags = ["insurance", "commercial-lines", "general-liability", "commercial-auto", "underwriting", "rating"]
+++

Commercial insurance covers what a business owns, what it may be sued for, what it drives, what its employees suffer at work and what its people decide. A personal lines carrier sells a few products to millions of nearly identical households, rated by algorithm and bound in minutes. A commercial account is a bundle of different coverages written on different forms, rated on different exposure bases (property value, sales, payroll, vehicles, square footage), often with more than one insurer, and, above the smallest accounts, priced by an underwriter who can move the filed rate up or down within a plan the state has approved. The same company may buy a business owners policy from one carrier, workers' compensation from a second, commercial auto from a third, an umbrella from a fourth and a cyber policy from a surplus lines insurer through a wholesaler.

For the system, three things change from personal lines. A policy holds many risk types at once (locations, buildings, vehicles, classes of operations, payroll by state), each with its own exposure base and its own coverage part. The price has a judgment layer on top of the filed algorithm, which must be recorded with its reasons because a regulator can ask why one bakery got a 20% credit and another didn't. And the account's history is a document other insurers read: the loss run. This chapter maps the lines, the occurrence versus claims-made trigger, the small commercial online market, and how commercial rating and underwriting differ. Claims-made mechanics in depth are in [Professional & Management Liability](/books/insurance/professional-and-management-liability), workers' compensation in [Workers' Compensation](/books/insurance/workers-compensation), and what happens when the admitted market won't write a risk in [Excess & Surplus Lines](/books/insurance/excess-and-surplus-lines). It extends `risks` and `coverages` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `loss_runs` and `rating_modifications`.

## How the Platforms Do It

As of November 2026, from 2025 statutory market share data and the companies' own filings and pages:

| Company | Where it sits | What the public record says |
| --- | --- | --- |
| **Chubb** | Largest other liability writer | 7.19% of 2025 US other liability direct premium, the top group in the NAIC's ranking of a $139.5 billion line |
| **The Hartford, Travelers** | Small and middle market, agency | The two largest workers' compensation groups in 2025 (6.65% and 6.58% of $56.1 billion), and both top-25 commercial auto writers |
| **Progressive** | Commercial auto | 13.20% of 2025 commercial auto direct premium, the largest group in a $77.1 billion line |
| **Kinsale** | Small, hard-to-place E&S accounts | Gross written premium of about $2.0 billion in 2025, 70.7% casualty and 29.3% property; it does "not extend underwriting authority to brokers, agents or other third parties" |
| **RLI** | Specialty admitted and E&S | 2025 net premiums earned in casualty (commercial excess and personal umbrella, transportation, general liability, professional services, small commercial), property (commercial property, marine) and surety |
| **ERGO NEXT** | Small commercial, online and through agents | Bought outright by Munich Re's ERGO on July 1, 2025 at a $2.6 billion valuation; more than 600,000 customers; general liability, BOP, workers' compensation, commercial auto, professional liability and tools and equipment |

The table shows the market's split. Middle market and larger accounts are placed by agents and brokers with underwriters who rate each account; the smallest accounts are increasingly sold like personal lines, online or through agents' portals, on a filed algorithm with little or no underwriter touch; and risks the admitted market declines go to specialty and surplus lines carriers like Kinsale, which use their freedom of rate and form "assertively," in its own words.

## The Lines

A commercial line is a statement line (the NAIC's annual statement categories) and a set of coverage forms, usually from an advisory organization (ISO for most lines, AAIS for some) and amended by each insurer. The main ones:

| Line | What it covers | Exposure base | Typical form source |
| --- | --- | --- | --- |
| **Commercial general liability (CGL)** | Bodily injury and property damage to others (Coverage A), personal and advertising injury (B), medical payments (C), products and completed operations | Sales, payroll, area, units, by class code | ISO CG 00 01 (occurrence), CG 00 02 (claims-made) |
| **Commercial property** | Buildings, business personal property, business income and extra expense | Insured value, by construction, occupancy, protection and exposure | ISO CP forms (causes of loss basic, broad, special) |
| **Business owners policy (BOP)** | Property and liability for small eligible businesses in one form at one premium | Building and contents values, with liability included | ISO BP forms or insurer forms |
| **Commercial package (CPP)** | Several monoline coverage parts (property, GL, inland marine, crime) on one policy with common declarations and conditions | Each part's own base | ISO's coverage parts combined |
| **Commercial auto** | Liability and physical damage for owned, hired and non-owned vehicles | Vehicles by type, size, radius and use | ISO CA 00 01 business auto, truckers and motor carrier forms |
| **Umbrella and excess** | Limits above the primary GL, auto and employers liability; an umbrella can also drop down over gaps | The underlying premium and limits | Insurer forms (no single standard) |
| **Inland marine** | Property that moves or is in transit: contractors' equipment, goods in transit, installation floaters, electronic data equipment | Values scheduled or reported | Filed and non-filed classes |
| **Workers' compensation** | Statutory benefits and employers liability | Payroll by class | NCCI or state bureau forms ([Workers' Compensation](/books/insurance/workers-compensation)) |

Professional, management and cyber liability sit beside these and are covered in their own chapters; surety bonds are not insurance in the same sense and have [Surety Bonds](/books/insurance/surety).

The size of each line, 2025 US direct premiums written from the NAIC's market share report: other liability (occurrence and claims-made, including most CGL, umbrella and professional) $139.5 billion, commercial auto $77.1 billion, workers' compensation $56.1 billion, against $1,109.8 billion for all P&C lines. Trade press reports a decade of commercial auto underwriting losses from a rating agency's segment report, which I couldn't open, so I give no combined ratio for the line here. <!-- source-gap: commercial-auto-results | secondary | commercial auto underwriting losses every year since 2015 and the 2025 combined ratio (AM Best) | closes with: the AM Best commercial auto segment report opened | checked: 2026-11-09 -->

### BOP Versus Package

A BOP is a product decision, not a coverage. The insurer pre-packages property and liability for classes it considers homogeneous (offices, retail stores, restaurants, contractors below a size), with eligibility rules (square footage, sales, building height, class), a single rating algorithm and fewer options. A package policy assembles the same coverages from separate coverage parts, each rated on its own, with more options and an underwriter. The system difference: a BOP is one product version with one rating algorithm and one form set; a package is a policy with several products' coverage parts, each with its own rate tables and forms, under common policy conditions and declarations. A small account that grows past BOP eligibility is rewritten as a package, which is a rewrite transaction with new forms, not an endorsement.

### Umbrella and Excess

An umbrella or excess policy sits above primary policies and is written against a schedule of underlying insurance: the carriers, the policy numbers, the limits and the terms. Three rules make the schedule data, not paper:

- **Attachment depends on underlying limits being maintained.** If the insured lets the primary auto limit drop from $1 million to $500,000, the umbrella usually responds as if the $1 million were still there, and the insured carries the gap. The underwriter needs the underlying schedule current at every renewal of every underlying policy.
- **Underlying terms flow up.** A follow-form excess policy follows the underlying form's terms, except where it says otherwise; an umbrella has its own insuring agreement and may cover what the primary excludes, above a self-insured retention.
- **Erosion.** Underlying aggregate limits reduced by paid claims lower the attachment point; when an underlying aggregate is exhausted, the excess may drop down to become primary for later claims.

The layer arithmetic of a tower (attachment, limit, share, how a loss climbs through) is the same as a reinsurance tower, and the Reserving, Catastrophe and Reinsurance part works it through.

## Occurrence Versus Claims-Made

The trigger decides which policy year pays. An **occurrence** policy pays for injury or damage that happens during the policy period, whenever the claim is made: a 2026 policy pays a suit filed in 2031 over a 2026 injury. A **claims-made** policy pays for claims first made (and, in most forms, reported) during the policy period, for injury or damage after the policy's retroactive date. ISO publishes the CGL in both versions, CG 00 01 occurrence and CG 00 02 claims-made (form indexes list CG 00 01 editions 12 04, 04 13 and 12 25, so a policy record must carry the edition, not only the form number, and contracts that demand coverage "at least as broad as" a named edition are checked against it); occurrence dominates general liability, and claims-made dominates professional, management, cyber and medical malpractice, where the gap between act and claim is long and the insurer wants to price the claims it will see this year.

Consequences for the record:

- **Occurrence policies stay alive for decades.** A long-tail occurrence claim (construction defect, products, abuse) attaches to the policy in force when the injury happened, sometimes across several policy years and insurers, which is why old policy versions, their limits and their forms must be producible long after expiry. Exposure and loss dates live on the claim.
- **Claims-made policies need a retroactive date, a reporting window and extended reporting periods.** [Professional & Management Liability](/books/insurance/professional-and-management-liability) works through the retro date, the tail and the state rules on offering it.
- **Aggregate limits are per policy period.** A CGL has a general aggregate and a separate products-completed operations aggregate; each paid claim erodes the aggregate of the policy that responds, so the claims system must know which term each payment hits.

## Small Commercial Online

The smallest accounts (sole proprietors, contractors, professional services, retail) now buy like personal lines. ERGO NEXT says its policies can be bought in about ten minutes, with online purchase and servicing, and it also sells through agents and partners; Kinsale's 10-K describes answering many submissions within 24 hours on its own technology platform. For small commercial, the system pattern is:

- **Classification by questionnaire.** A business description maps to a class code (ISO GL class, NAICS, or the insurer's own taxonomy), which drives eligibility, forms and base rates. A wrong class is the most common error, and it shows up at audit or at the first claim.
- **Straight-through rating** on the filed algorithm with no schedule rating, or a schedule that applies only predefined credits from answers (years in business, prior claims, safety programs).
- **Proof on demand.** Small businesses often buy because a landlord, a general contractor or a client asked for proof of coverage, so certificates of insurance generated from policy data belong in the self-service product ([Certificates of Insurance](/books/insurance/certificates-of-insurance)).
- **Auditable exposure.** Premium on a sales- or payroll-rated policy is a deposit; the audit at expiry sets the final premium, just as for workers' compensation ([Rating Workers' Comp & Premium Audit](/books/insurance/rating-workers-comp#premium-audit)).

## How Commercial Rating Differs

Personal lines premium is the filed algorithm's output. Commercial premium above the smallest accounts is the filed algorithm's output modified by plans the insurer has also filed:

1. **Manual premium.** Exposure times the filed rate (loss cost times the insurer's loss cost multiplier, as [How a Rate Is Built](/books/insurance/how-a-rate-is-built) in the Rating part describes) for each class, coverage and location, with increased limits factors and deductible credits.
2. **Experience rating.** For accounts large enough to have credible history, a filed plan compares the insured's own losses to the losses expected for its classes and size, and produces a debit or credit. Workers' compensation's bureau plan is mandatory and computed by the bureau ([The Experience Mod](/books/insurance/rating-workers-comp#the-experience-mod)); for GL and auto, the insurer applies the experience rating plan in its filing.
3. **Schedule rating.** A filed table of characteristics (management, premises condition, employee selection and training, safety programs, equipment, classification peculiarities) with a maximum credit or debit for each and an overall cap. The underwriter picks values. My rule is that the system records each value with its written justification, because a credit with no recorded basis can't be shown to come from the filed plan rather than from a negotiation.
4. **Other modifications.** Package modification factors when coverages are combined, expense modifications for larger accounts, IRPM (individual risk premium modification) in some lines and states, and, for the largest accounts, loss-rated or composite rating.
5. **Minimum premiums and policy fees**, per the filing.

The order matters and comes from the filing, and the result is not freely negotiable: a credit outside the filed plan's range, or one with no recorded basis, is a rate the insurer didn't file.

### A Worked Package Premium

The numbers below are mine and illustrative, not a filed manual. A restaurant buys a package: GL rated on $2,400,000 of annual sales at a filed rate of $3.10 per $1,000 of sales, and property on $900,000 of building and contents at $0.42 per $100. The insurer's filed experience rating plan produces a 0.92 factor for GL from three years of loss history, and its filed schedule rating plan allows up to 25% credit or debit in total.

| Step | GL | Property |
| --- | --- | --- |
| Exposure | 2,400 (thousands of sales) | 9,000 (hundreds of value) |
| Filed rate | $3.10 | $0.42 |
| Manual premium | $7,440.00 | $3,780.00 |
| Experience modification | × 0.92 = $6,844.80 | not applied |
| Schedule rating: premises +3%, management −5%, training −4%, equipment −2% | net −8%: × 0.92 = $6,297.22 | net −6% (premises +3%, protection −9%): × 0.94 = $3,553.20 |
| Package modification factor | × 0.95 = $5,982.36 | × 0.95 = $3,375.54 |
| Rounded premium | $5,982 | $3,376 |

Total $9,358, against $11,220 of manual premium. Every row is a rating step stored on the quote (`rating_steps`), and each schedule rating line is a `rating_modifications` row with its plan, its category, its value, the plan's maximum for that category, and the underwriter's written reason.

## Commercial Underwriting

Commercial underwriting is account underwriting. The underwriter reads the submission (ACORD applications, a statement of values, a vehicle schedule, payroll by class, financials for larger accounts), the loss runs, inspection and loss control reports, and the expiring program, and decides on eligibility, forms, limits, deductibles, the rating modifications and the terms. Authority is tiered: a junior underwriter may bind within a premium, limit and class band and must refer above it; an MGA's authority is set by its binding authority agreement. The rules engine, referral and authority mechanics are those of the Rating and Underwriting part; what's specific to commercial is the volume of documents per account and the fact that the decision is a negotiation with a broker, often against quotes from competitors.

### Loss Runs

A loss run is an insurer's report of an insured's claims under its policies: policy number and term, each claim with loss date, status, paid, reserved and incurred amounts by coverage, and a valuation date. It is the commercial account's credit report. A prospective insurer asks for three to five years of loss runs from every prior carrier, and the experience rating plan, the schedule rating decision and often eligibility depend on them. Brokers collect them at each renewal.

Three properties matter for the system that produces and the one that consumes them:

- **A loss run is a snapshot as of a valuation date.** Incurred amounts move with every reserve change, so a run is produced from the reserve and payment history as of a date (the same as-of query that rebuilds incurred losses in [The Core Data Model](/books/insurance/insurance-business#the-core-data-model)), and stamped with that date. Two runs for the same account a month apart can differ, correctly.
- **Many states require insurers to provide loss information** to the insured on request within a set number of days, especially at cancellation or nonrenewal. Treat it as a clocked request like a claim task, with the rule and its due date stored. <!-- source-gap: commercial-loss-run-statutes | missing | state statutes requiring insurers to furnish loss information to commercial insureds within a set number of days | closes with: an opened statute (e.g. 215 ILCS 5/143.10a or a peer state) | checked: 2026-11-09 --> I couldn't open a current statute to cite the day counts.
- **Incoming loss runs are data to be extracted and normalized.** They arrive as PDFs in each carrier's layout; the receiving underwriter's system extracts claims into a common shape, keeps the source document, and records which carrier, as of when, so the experience calculation can be reproduced.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). Commercial policies use the same `policies`, `policy_versions`, `risks` and `coverages`; the differences are more risk kinds on one version (locations, buildings, vehicles, class exposures by state), coverage parts grouped under the product of each line, and two new tables: the judgment modifications on a rating, and loss runs in and out.

```sql
-- Risk kinds used by commercial lines, already in risks.kind:
-- 'location', 'building', 'vehicle', 'class_exposure', 'other'.
-- A class exposure carries its basis and the auditable estimate:
--   attributes = {"class_code": "16910", "basis": "sales", "estimated": 2400000,
--                 "state": "US-TX", "location_key": "..."}

CREATE TABLE rating_modifications (        -- schedule, experience, IRPM, package mods
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  quote_id           UUID,                  -- quotes (Quote, Bind & Issue)
  transaction_id     UUID REFERENCES policy_transactions (id),
  coverage_code      TEXT NOT NULL,         -- 'gl', 'property', 'auto_liability', ...
  plan               TEXT NOT NULL CHECK (plan IN ('schedule', 'experience', 'irpm',
                       'package', 'expense', 'loss_rated')),
  plan_rate_table_id UUID REFERENCES rate_tables (id),  -- the filed plan and its limits
  category           TEXT,                  -- 'management', 'premises', 'training', ...
  value              NUMERIC(8, 4) NOT NULL, -- -0.0500 is a 5% credit
  plan_min           NUMERIC(8, 4),         -- the filed range for this category
  plan_max           NUMERIC(8, 4),
  justification      TEXT,                  -- required for schedule and IRPM
  source_doc_id      UUID,                  -- inspection or loss control report
  decided_by         UUID NOT NULL,
  decided_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (quote_id IS NOT NULL OR transaction_id IS NOT NULL),
  CHECK (plan_min IS NULL OR value >= plan_min),
  CHECK (plan_max IS NULL OR value <= plan_max),
  CHECK (plan NOT IN ('schedule', 'irpm') OR justification IS NOT NULL)
);

CREATE TABLE loss_runs (                   -- produced for an insured, or received about one
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  direction          TEXT NOT NULL CHECK (direction IN ('issued', 'received')),
  insured_party_id   UUID NOT NULL REFERENCES parties (id),
  policy_id          UUID REFERENCES policies (id),  -- this insurer's, when it issued it
  prior_carrier      TEXT,                  -- when received
  submission_id      UUID,                  -- submissions (Underwriting), when received
  terms_from         DATE NOT NULL,
  terms_to           DATE NOT NULL,
  valued_as_of       TIMESTAMPTZ NOT NULL,  -- the as-of date of every amount on it
  requested_at       TIMESTAMPTZ,
  due_at             TIMESTAMPTZ,           -- from the state rule, when one applies
  rule_ref           TEXT,
  delivered_at       TIMESTAMPTZ,
  document_id        UUID                   -- documents: the rendered or received file
);

CREATE TABLE loss_run_claims (             -- extracted or generated lines, normalized
  loss_run_id        UUID NOT NULL REFERENCES loss_runs (id),
  line_no            INT NOT NULL,
  claim_ref          TEXT NOT NULL,         -- this insurer's claim number or the prior carrier's
  claim_id           UUID REFERENCES claims (id),  -- this insurer's, when it issued it
  policy_term_from   DATE NOT NULL,
  loss_date          DATE NOT NULL,
  coverage_code      TEXT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('open', 'closed', 'reopened')),
  paid               BIGINT NOT NULL,       -- minor units, all cost types or per below
  reserved           BIGINT NOT NULL,
  incurred           BIGINT NOT NULL,
  cost_type          TEXT,                  -- null when the source doesn't split
  PRIMARY KEY (loss_run_id, line_no)
);
```

An issued loss run is a query over `reserves` and `claim_payments` as of `valued_as_of`, never a stored balance:

```sql
SELECT c.claim_number, pt.effective_at::date AS term_from, c.loss_at::date, e.coverage_code,
       c.status,
       COALESCE(SUM(cp.amount) FILTER (WHERE cp.issued_at <= :as_of AND cp.status
                IN ('issued', 'cleared')), 0) AS paid,
       COALESCE((SELECT SUM(r.change) FROM reserves r
                 WHERE r.exposure_id = e.id AND r.recorded_at <= :as_of), 0) AS reserved
FROM claims c
JOIN policy_terms pt ON pt.id = c.policy_term_id
JOIN exposures e ON e.claim_id = c.id
LEFT JOIN claim_payments cp ON cp.exposure_id = e.id
WHERE pt.policy_id = ANY (:policy_ids)
  AND c.reported_at <= :as_of
GROUP BY c.id, pt.effective_at, e.id;
```

Design notes:

- **Judgment is a row, not an override.** A schedule credit is a `rating_modifications` row with its category, its filed range, its reason and who decided; the rating engine applies the rows in the filed order and the worksheet shows them. An underwriter who wants a price outside the plan has no field to type it into.
- **Coverage parts are products.** In a package, each coverage part is rated by its own product version and rate tables; the policy's `product_id` is the package, and each coverage carries the part it belongs to through its coverage definition.
- **Underlying schedules are references.** An umbrella's schedule of underlying insurance points to the underlying policies when the same insurer writes them and stores the carrier, number, limits and term when it doesn't; a renewal of the underlying triggers a check of the umbrella's attachment.
- **Exposure estimates are auditable.** Sales-, payroll- and receipts-rated coverages store the estimate with its basis, so the audit at expiry is a transaction that replaces it with the actual and produces the premium difference.

## Auditing

- **Every modification with its reason.** Each schedule, IRPM and experience factor with the filed plan, the range, the chosen value, the justification and the supporting inspection or loss control report, for every quote and transaction, so a rerate from the filed plan reproduces the premium.
- **Classification evidence.** The answers or documents that set each class code, and every reclassification with its effective date and premium effect.
- **Loss runs issued and received.** Every run with its valuation date and delivery date against any state deadline; every received run kept as the original document beside the extracted lines used in rating.
- **Underlying schedules.** For excess and umbrella policies, the underlying insurance as scheduled at bind and at each change.

## What This Means for the System You Build

- **Model a commercial policy as many risks and coverage parts on one version,** each with its own exposure base, rate tables and forms.
- **Record every schedule and experience modification as a row** with its filed range and written justification, and enforce the range in the schema.
- **Produce loss runs as as-of queries** over reserve and payment history, stamped with a valuation date and delivered on the state's clock.
- **Store auditable exposure estimates** with their basis, and settle them by an audit transaction at expiry.
- **Keep occurrence policies producible for decades,** with their limits, aggregates and forms as they stood, because a claim can attach to them long after expiry.
- **Track underlying schedules for excess and umbrella policies** and re-check them when any underlying policy changes.

## References

**NAIC**

- [NAIC: 2025 Property and Casualty Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-property-casualty-market-share.pdf), 2025 direct premiums written for other liability ($139.5 billion, Chubb first at 7.19%), commercial auto ($77.1 billion, Progressive first at 13.20%), workers' compensation ($56.1 billion, The Hartford and Travelers first and second) and all lines ($1,109.8 billion)

**Filings**

- [Kinsale Capital Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1669162/000166916226000015/knsl-20251231.htm), gross written premium, the casualty and property mix, no delegated underwriting authority, freedom of rate and form, and response times on submissions
- [RLI Corp.: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/84246/000110465926018013/rli-20251231x10k.htm), net premiums earned by casualty, property and surety product line

**In practice**

- [InsuranceXDate: CG 00 01 Commercial General Liability Coverage Form (Occurrence)](https://insurancexdate.com/insurance-forms/CG/CG-00-01/), the form's coverages A, B and C, its editions (12 04, 04 13, 12 25) and CG 00 02 as the claims-made counterpart
- [ERGO NEXT: ERGO finalizes the full acquisition of NEXT Insurance](https://www.nextinsurance.com/blog/ergo-successfully-finalizes-the-full-acquisition-of-next-insurance/), completion on July 1, 2025, the $2.6 billion valuation, more than 600,000 customers, products and online, agent and partner channels
