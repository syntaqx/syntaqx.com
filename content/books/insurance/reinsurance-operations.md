+++
title = "Reinsurance Operations"
description = "Calculating cessions, reinsurance accounts and bordereaux, recoverables and collections, credit for reinsurance and collateral, Schedule F, and renewals."
category = "Insurance Industry"
order = 2741
part = "Reserving, Catastrophe and Reinsurance"
tags = ["insurance", "reinsurance", "cessions", "credit-for-reinsurance", "collateral", "schedule-f"]
+++

A reinsurance contract is signed once a year; it is operated every day. Every policy transaction cedes a share of premium to the quota share. Every claim payment and reserve change cedes a share of loss, and a large one may reach the per risk treaty. Every catastrophe accumulates against a tower. Each quarter the cedent sends each reinsurer an account showing what it owes and is owed, and a bordereau of the business behind it, and then has to collect the money from dozens of companies in several countries, some of which dispute, pay late or fail. Meanwhile the regulator decides how much of all that the cedent may count on its balance sheet: credit for reinsurance depends on who the reinsurer is and what collateral it posts.

This chapter covers the operation: calculating cessions from the policy and claims ledgers, reinsurance accounts and bordereaux, recoverables and how they're collected, credit for reinsurance and collateral under the NAIC models and the covered agreements, Schedule F, and the renewal cycle and brokers. The contract shapes are [Reinsurance Structures](/books/insurance/reinsurance-structures); how the cedent's own MGA bordereaux arrive is [MGAs, Programs & Fronting](/books/insurance/mgas-programs-and-fronting).

## How the Platforms Do It

As of November 2026:

| Party or system | Role in operations | Public detail |
| --- | --- | --- |
| **Reinsurance brokers** (Aon, Marsh McLennan's Guy Carpenter, Gallagher Re and others) | Place treaties, circulate accounts and often collect and remit funds between cedent and reinsurers | Three brokers placed 81.3% of RenaissanceRe's 2025 gross premiums written |
| **Lloyd's Delegated Data Manager (DDM)** | Central platform for coverholders, brokers and managing agents to submit risk, premium and claims bordereaux | Contracts found by Unique Market Reference; a once-only mapping questionnaire transforms each bordereau to the Coverholder Reporting Standards v5.2 fields, marked Mandatory or Conditional Mandatory |
| **Cedent reinsurance systems** | Core suites' reinsurance modules and dedicated reinsurance administration software | Cession calculation, accounts, recoverables, collateral tracking |
| **Regulators** | Credit for reinsurance rules; lists of certified reinsurers and their ratings; collateral reductions | The NAIC models and each state's adoption; all 56 jurisdictions adopted the 2019 revisions by September 22, 2022 |
| **State programs** | The Florida Hurricane Catastrophe Fund reimbursement contract | Contract year June 1 to May 31; exposure reported by ZIP code by September 1 |

## Calculating Cessions

A cession is the reinsurance side of a ledger row. The core data model's `premium_entries`, `reserves` and `claim_payments` are the sources; each contract's terms decide what share of each row it takes.

**Proportional contracts** cede row by row. For a 30% quota share on risks attaching: every premium entry on a policy written or renewed in the treaty period cedes 30% of its amount, with the ceding commission on that ceded premium; every payment and reserve change on a claim against those policies cedes 30%. Ceded unearned premium earns on the same schedule as the direct premium it came from. A surplus treaty does the same with a per-risk share computed from the risk's value and the line size at binding (and recomputed when an endorsement changes the value).

**Excess of loss contracts** cede by subject, not by row:

- **Per risk:** group the net-of-inuring losses by risk (as the contract defines a risk) and occurrence; when a risk's net loss exceeds the attachment, each later payment or reserve change cedes the part above it, up to the limit.
- **Catastrophe:** group claims into loss occurrences by the contract's clause, sum the net losses, and cede the part in each layer. Recoveries are usually billed on paid losses once the retention is exceeded, with reserves ceded for the balance sheet.
- **Aggregate:** accumulate the period's subject losses and cede above the aggregate retention.

Three properties make the calculation auditable:

- **Every cession row cites its source row** (the premium entry, payment or reserve change) and the contract and layer.
- **Excess of loss cessions are recomputed, not incremented.** When a reserve on one claim in an occurrence changes, the occurrence's total is recomputed and the layer's ceded amount is the new figure minus what was already ceded, so a late reclassification produces a correcting row instead of a drift.
- **The inuring order is applied in sequence** ([Reinsurance Structures](/books/insurance/reinsurance-structures)), so a cat cession reads the quota share's and per risk's cessions for the same claims first.

## Accounts and Bordereaux

Proportional treaties settle through periodic **accounts**, typically quarterly, prepared by the cedent (or the broker): ceded premium, less ceding commission, less ceded paid losses and LAE, plus or minus adjustments, equals the balance due one way or the other. A worked quarterly quota share account, mine:

| Item | Amount |
| --- | --- |
| Ceded written premium (30% of $100 million) | $30,000,000 |
| Less ceding commission at 32% | ($9,600,000) |
| Less ceded paid losses and LAE | ($14,000,000) |
| **Balance due to the reinsurers** | **$6,400,000** |

Split across the reinsurers on the treaty by their signed shares (a 25% reinsurer is owed $1,600,000). In the quarter of a hurricane the ceded paid losses exceed the premium net of commission and the balance reverses; most treaties have a **cash call** clause letting the cedent bill a large loss immediately rather than wait for the quarter's account.

Excess of loss contracts settle differently: a deposit premium at inception (often in installments), adjusted at the end of the period on the final subject premium, and **loss billings** with proof of loss once the retention is exceeded, plus reinstatement premium deducted from or billed with the recovery.

Behind the account sits a **bordereau**: the policy and claim detail. A premium bordereau lists the policies ceded with their premium, dates and terms; a claims bordereau lists the claims with paid and outstanding by cost type. For a cedent ceding a fronted program, the reinsurer's bordereau is built from the MGA's bordereau the cedent received, and the rows have to keep their identity across both ([MGAs, Programs & Fronting](/books/insurance/mgas-programs-and-fronting)). Lloyd's DDM is the most standardized public example: its claims bordereau procedure has a contract administrator, a submitter, a one-time transformation questionnaire mapping the sender's columns to the standard's fields, assignment to contract sections and approval.

## Recoverables and Collections

**Reinsurance recoverables** are the amounts reinsurers owe the cedent: on paid losses (billed, due now) and on unpaid losses (the ceded share of case reserves and IBNR, due as the losses are paid). Paid recoverables are receivables to collect; unpaid recoverables are reductions of the cedent's net reserves, and only as good as the reinsurer.

Operations owns the collection:

- **Aging.** Each billed amount ages from its due date; overdue and disputed balances are tracked separately because they affect statutory credit.
- **Disputes.** A reinsurer may dispute coverage (the loss falls outside the occurrence clause or the subject business), the amount, or the cedent's handling; most treaties send disputes to arbitration. Disputed amounts stay on the books, flagged, with the dispute's reference.
- **Offsets.** Most treaties let balances owed in each direction be netted; the account shows the gross items and the net settlement.
- **Commutation.** Cedent and reinsurer can settle all future obligations under a contract for a lump sum, after which the contract's status becomes `commuted` and no further cessions are calculated.
- **Insolvent reinsurers.** A recoverable from a reinsurer in liquidation becomes a claim against its estate ([When Insurers Fail](/books/insurance/when-insurers-fail)), written down as the estate's likely distribution is known.

## Credit for Reinsurance

A cedent reports its liabilities net of reinsurance only to the extent the law allows credit, and the law's concern is whether the reinsurer will pay. The NAIC **Credit for Reinsurance Model Law (#785)** and **Model Regulation (#786)** set the categories; Model 785's history runs from 1984 through amendments in 2011 (certified reinsurers) and 2019 (reciprocal jurisdictions). Credit is allowed for cessions to an assuming insurer that is:

| Category (Model 785 Section 2) | Condition | Collateral |
| --- | --- | --- |
| **A. Licensed** in the cedent's state | Licensed to transact insurance or reinsurance there | None |
| **B. Accredited** | Licensed in another state, submits to the state's jurisdiction and examination, files statements; policyholder surplus not less than $20,000,000 | None |
| **C. Domiciled in a state with substantially similar law** | Domiciled and licensed in such a state, with surplus not less than $20,000,000 | None |
| **D. Trusteed** | Maintains a trust in a qualified US financial institution for US cedents: liabilities plus a trusteed surplus of not less than $20,000,000 for a single assuming insurer; a Lloyd's-type group of underwriters holds a joint trusteed surplus of which $100,000,000 is held jointly | The trust |
| **E. Certified** | Domiciled and licensed in a qualified jurisdiction, capital and surplus of at least $250,000,000, financial strength ratings from two or more acceptable agencies; the commissioner assigns a rating and publishes the list | By rating (below) |
| **F. Reciprocal jurisdiction** | Head office or domicile in a reciprocal jurisdiction (an EU member state or the UK under the covered agreements, an NAIC-accredited US state, or a qualified jurisdiction meeting added conditions); minimum capital and surplus and solvency ratio set by regulation; consent to US jurisdiction and judgments, and 100% security if it resists a final judgment or enters a solvent scheme of arrangement | None otherwise |

For a reinsurer in none of those categories, Section 3 allows credit (or a reduction from liability) only up to the funds held by or for the cedent as security, in the forms the model lists: cash, securities listed by the NAIC Securities Valuation Office, clean, irrevocable, unconditional letters of credit issued or confirmed by a qualified US financial institution, and any other form acceptable to the commissioner.

**Certified reinsurer collateral** scales with the rating the commissioner assigns, per Model 786:

| Rating | Security required |
| --- | --- |
| Secure-1 | 0% |
| Secure-2 | 10% |
| Secure-3 | 20% |
| Secure-4 | 50% |
| Secure-5 | 75% |
| Vulnerable-6 | 100% |

A worked check, mine: a cedent has $40,000,000 of recoverables (paid and unpaid) from a certified reinsurer rated Secure-3. Full credit requires security of 20%, $8,000,000, in an acceptable form (Model 785 allows a multibeneficiary trust, kept as a separate account from any trust that fully secures the reinsurer's other obligations). If the reinsurer is downgraded to Secure-4, the requirement becomes 50%, $20,000,000, and the cedent's credit depends on the reinsurer posting $12,000,000 more. The system recomputes required collateral for every reinsurer whenever recoverables or ratings change, and compares it to the collateral on hand.

**Reciprocal jurisdictions** remove collateral for qualifying reinsurers. The US-EU covered agreement was signed September 22, 2017 and the US-UK agreement December 18, 2018; under them and the NAIC's 2019 revisions, EU and UK reinsurers with at least $250 million of own funds and a 100% solvency capital requirement under Solvency II post no collateral and need no local presence. Model 786 sets the parallel test for others as $250,000,000 of capital and surplus and either a 100% solvency capital requirement or a 300% risk-based capital ratio. States had to adopt the revisions before September 1, 2022 or face federal preemption; the NAIC reports all 56 jurisdictions had done so as of September 22, 2022.

## Schedule F

The statutory annual statement's **Schedule F** reports a P&C insurer's reinsurance by counterparty: premium ceded and assumed, recoverables on paid and unpaid losses and LAE, unearned premium, ceding commissions, collateral held, amounts overdue and in dispute, by reinsurer and by category (authorized, unauthorized, certified, reciprocal). From those it computes a **provision for reinsurance**, a statutory liability that reduces surplus for recoverables that are unsecured from unauthorized reinsurers, overdue or slow-paying, or under-collateralized for certified reinsurers. The exact factors are in the NAIC's Annual Statement Instructions, which I could not open in full; the data requirement is clear regardless: every recoverable by reinsurer, aged from its due date, with dispute status and collateral, as of each statement date.<!-- source-gap: schedule-f-provision-factors | missing | the Schedule F provision for reinsurance factors (overdue thresholds and percentages, slow-payer test, certified reinsurer collateral deficiency treatment) | closes with: the current NAIC P&C Annual Statement Instructions for Schedule F | checked: 2026-11-10 -->

What this asks of the ledger is the same as Schedule P: figures by counterparty as of the statement date, frozen once filed, reconciling to the balance sheet ([Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting)).

## Renewals and Brokers

Treaties renew on a few industry dates, and the operations calendar runs around them: the market's rate indexes are read at the January 1, April 1 and June and July renewals, and June 1 is Florida's, matching the Florida Hurricane Catastrophe Fund's contract year of June 1 to May 31 (Universal's and HCI's 2026-2027 programs both incepted June 1, 2026). The cycle for each: exposure snapshot and model runs ([Catastrophe Models & Their Regulators](/books/insurance/catastrophe-models)), a submission through the broker, quotes, the firm order terms, signed lines from each reinsurer, the contract wording, and loading the terms into the system before inception.

Price moves across the cycle. Guy Carpenter's US property catastrophe rate-on-line index, as Artemis reports it, fell 6.2% at January 1, 2025 and 6.7% by mid-year 2025, then 12% at January 1, 2026, 14% after April 1 and 16% after the June and July 2026 renewals, the largest annual decline for the index since 2014, leaving it about 22% below the 2024 peak and still about 62% above the 2017 low.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) and [Reinsurance Structures](/books/insurance/reinsurance-structures)' `reinsurance_contracts`, `reinsurance_layers` and `reinsurance_participations`. This chapter defines `cessions` (named in the core model), `reinsurance_statements` (an account or billing), `reinsurance_receivables` (each amount due, aged), `reinsurer_credit_status` (a reinsurer's category and rating per state over time) and `reinsurance_collateral`.

```sql
CREATE TABLE cessions (                    -- the reinsurance side of a ledger row
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  layer_id           UUID NOT NULL REFERENCES reinsurance_layers (id),
  source_kind        TEXT NOT NULL CHECK (source_kind IN ('premium_entry',
                       'claim_payment', 'reserve', 'ibnr_estimate')),
  source_id          UUID NOT NULL,         -- the row ceded
  claim_id           UUID REFERENCES claims (id),
  occurrence_key     TEXT,                  -- XoL grouping per the contract's clause
  kind               TEXT NOT NULL CHECK (kind IN ('premium', 'commission',
                       'paid_loss', 'case_reserve', 'ibnr', 'reinstatement_premium')),
  cost_type          TEXT CHECK (cost_type IN ('indemnity', 'dcc', 'ao')),
  amount             BIGINT NOT NULL,       -- signed, minor units, 100% of the layer
  earn_from          TIMESTAMPTZ,           -- ceded premium earns like its source
  earn_to            TIMESTAMPTZ,
  accounting_date    DATE NOT NULL,
  computed_by        TEXT NOT NULL,         -- engine version
  UNIQUE (layer_id, source_kind, source_id, kind)
);

CREATE TABLE reinsurance_statements (      -- quarterly account or loss billing
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  contract_id        UUID NOT NULL REFERENCES reinsurance_contracts (id),
  kind               TEXT NOT NULL CHECK (kind IN ('account', 'loss_billing',
                       'cash_call', 'deposit_premium', 'adjustment', 'commutation')),
  period             DATERANGE,
  totals             JSONB NOT NULL,        -- premium, commission, losses, net
  bordereau_ref      TEXT,                  -- the detail file sent with it
  sent_at            TIMESTAMPTZ,
  status             TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'agreed',
                       'disputed', 'settled'))
);

CREATE TABLE reinsurance_receivables (     -- per reinsurer, from a statement
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  statement_id       UUID NOT NULL REFERENCES reinsurance_statements (id),
  reinsurer_id       UUID NOT NULL REFERENCES insurers (id),
  amount             BIGINT NOT NULL,       -- signed share of the net balance
  due_on             DATE NOT NULL,
  dispute_ref        TEXT,
  settled_amount     BIGINT NOT NULL DEFAULT 0,
  settled_on         DATE
);

CREATE TABLE reinsurer_credit_status (     -- who they are, per state, over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  reinsurer_id       UUID NOT NULL REFERENCES insurers (id),
  state              TEXT NOT NULL,
  category           TEXT NOT NULL CHECK (category IN ('licensed', 'accredited',
                       'similar_state', 'trusteed', 'certified', 'reciprocal',
                       'unauthorized')),
  certified_rating   TEXT,                  -- 'Secure-3'
  collateral_pct_bp  INT,                   -- 2000 = 20%
  effective          DATERANGE NOT NULL,
  source             TEXT NOT NULL          -- the state's published list, dated
);

CREATE TABLE reinsurance_collateral (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  reinsurer_id       UUID NOT NULL REFERENCES insurers (id),
  form               TEXT NOT NULL CHECK (form IN ('trust', 'letter_of_credit',
                       'funds_withheld', 'cash')),
  issuer_party_id    UUID REFERENCES parties (id),  -- the bank or trustee
  amount             BIGINT NOT NULL,
  valid              DATERANGE NOT NULL,    -- LOC expiry, trust valuation date
  evidence_ref       TEXT NOT NULL
);
```

A reinsurer's share of a layer's cession is `amount × signed_share_bp / 10000` at statement time; storing cessions at 100% of the layer keeps a change of participants (a mid-term replacement) from rewriting history. Required collateral as of a date reads recoverables (paid receivables outstanding plus ceded case and IBNR) by reinsurer and multiplies by the percentage in force on that date:

```sql
SELECT p.reinsurer_id,
       SUM(c.amount * p.signed_share_bp / 10000)               AS recoverable,
       MAX(s.collateral_pct_bp)                               AS pct_bp,
       SUM(c.amount * p.signed_share_bp / 10000) * MAX(s.collateral_pct_bp) / 10000
                                                               AS required_collateral
FROM cessions c
JOIN reinsurance_participations p ON p.layer_id = c.layer_id
JOIN reinsurer_credit_status s
  ON s.reinsurer_id = p.reinsurer_id AND s.state = :domicile
 AND s.effective @> :as_of::date
WHERE c.kind IN ('paid_loss', 'case_reserve', 'ibnr')
  AND c.accounting_date <= :as_of
GROUP BY p.reinsurer_id;
```

(Paid losses already collected net off through `reinsurance_receivables.settled_amount`; the sketch leaves that join out.)

## Auditing

- **Cessions tie to sources.** Ceded premium, losses and reserves by contract reconcile to the direct ledger times the contract terms; every cession row resolves to a source row.
- **Accounts tie to cessions.** Each statement's totals equal the cessions in its period; each receivable's split equals the signed lines.
- **Recoverables reconcile to reinsurers' records.** Periodic confirmations with each reinsurer or the broker; unreconciled differences are listed with age.
- **Credit status is dated and sourced.** Every reinsurer's category and rating on each statement date cites the state's published list; collateral evidence (trust statements, letters of credit with expiry) is on file and current.
- **Schedule F reproduces** from receivables, cessions and collateral as of the statement date.

## What This Means for the System You Build

- **Cede from ledger rows,** with every cession citing its source, contract and layer; recompute excess of loss cessions from occurrence totals.
- **Store cessions at 100% of the layer** and apply participations at statement time.
- **Run accounts, loss billings and cash calls as statements** with their bordereau, status and receivables per reinsurer.
- **Age every receivable** and keep disputes, offsets and commutations explicit.
- **Track each reinsurer's credit category, rating and collateral as dated records** per state, and compute required collateral continuously.
- **Prepare renewals from frozen exposure snapshots** and load the bound terms before inception.

## References

**NAIC**

- [NAIC: Credit for Reinsurance Model Law (#785), Summer 2019 (PDF)](https://content.naic.org/sites/default/files/model-law-785.pdf), credit categories A through F, the $20,000,000 surplus and trusteed surplus thresholds, the $100,000,000 joint trusteed surplus for associations, reciprocal jurisdiction conditions, Section 3 security forms, and the model's amendment history
- [NAIC: Credit for Reinsurance Model Regulation (#786), Summer 2019 (PDF)](https://content.naic.org/sites/default/files/model-law-786.pdf), certified reinsurer requirements ($250,000,000 capital and surplus, two ratings), the Secure-1 to Vulnerable-6 security percentages, and the reciprocal jurisdiction capital and solvency tests
- [NAIC: Covered Agreement](https://content.naic.org/insurance-topics/covered-agreement), the US-EU and US-UK agreements' dates, the $250 million and 100% SCR conditions, the June 25, 2019 model revisions, and adoption by all 56 jurisdictions as of September 22, 2022

**Law and regulation**

- [Fla. Stat. 215.555](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0215/Sections/0215.555.html), the Florida Hurricane Catastrophe Fund's June 1 to May 31 contract year and September 1 exposure report

**Standards**

- [Lloyd's: Delegated Data Manager Claims Bordereaux Standard Operating Procedure, v1.0, updated December 14, 2020 (PDF)](https://assets.lloyds.com/media/56a9ff58-90c5-4e5d-bd2e-c1b25cec647b/Claims%20Bordereaux%20Standard%20Operating%20Procedure%20SOP.pdf), DDM roles, the Unique Market Reference, the transformation questionnaire and Coverholder Reporting Standards v5.2 mandatory fields

**Filings**

- [RenaissanceRe: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/913144/000091314426000012/rnr-20251231.htm), broker concentration of 81.3% across three brokers
- [Universal Insurance Holdings: Form 8-K, May 28, 2026](https://www.sec.gov/Archives/edgar/data/891166/000089116626000053/uve-20260528.htm) and [HCI Group: Form 8-K, June 1, 2026](https://www.sec.gov/Archives/edgar/data/1400810/000119312526249754/hci-20260601.htm), June 1 program inception

**In practice**

- [Artemis: Guy Carpenter US Property Catastrophe Rate-on-Line Index](https://www.artemis.bm/us-property-cat-rate-on-line-index/), index movements at the 2025 and 2026 renewals, the 2024 peak and the 2017 low
