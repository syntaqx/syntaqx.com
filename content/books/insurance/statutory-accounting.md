+++
title = "Statutory Accounting & the Annual Statement"
nav_title = "Statutory Accounting"
description = "SAP versus GAAP, admitted and nonadmitted assets, unearned premium methods, the annual statement and schedules, filing deadlines, and what the ledger keeps."
category = "Insurance Industry"
order = 2710
part = "Regulation and Solvency"
tags = ["insurance", "statutory-accounting", "annual-statement", "naic", "solvency", "ledger"]
+++

Every US insurer keeps two sets of books in the sense that matters. GAAP, the basis investors and the SEC use, asks what the company is worth as a going concern and matches revenue to the expenses of earning it. Statutory accounting principles (SAP), the basis every state regulator uses, ask a narrower question: if the company stopped today, could it pay what it owes policyholders? The NAIC's description is that SAP emphasizes conservatism and "Financial reporting should take a cautious approach to valuing assets and estimates." The difference shows up in public filings: Progressive reported $28.4 billion of statutory surplus at the end of 2025 beside its GAAP equity, and Erie reports its Exchange's surplus "under statutory accounting." Statutory surplus, not GAAP equity, is the number premium-to-surplus leverage, risk-based capital, dividend limits and every regulatory action level are measured against.

The statutory financial statements are filed on the NAIC's annual statement blank: one standard workbook per legal entity, the same for every insurer of a type, with a balance sheet, income statement and dozens of schedules that break premiums, losses, reserves, reinsurance and investments down by line, state, year and counterparty. The NAIC's financial data repository, the IRIS and FAST ratio systems, risk-based capital, the market share tables and most of what regulators know about an insurer's finances are computed from it. This chapter covers SAP's principles and how they differ from GAAP, admitted and nonadmitted assets, unearned premium under statute, the annual and quarterly statements and the key schedules at pointer level, the filing calendar, statutory figures in a 10-K, and what the policy, billing, claims and reinsurance ledgers have to keep so the statement can be produced from them. Reserving mechanics and Schedule P are Loss Reserving & Development; Schedule F and credit for reinsurance are Reinsurance Operations; capital tests are [Solvency & Capital](/books/insurance/solvency-and-capital).

## How the Platforms Do It

The figures public carriers disclose show both bases side by side, as of the filings for fiscal 2025:

| Company | Statutory figure disclosed | What it shows |
| --- | --- | --- |
| **Progressive** | Statutory surplus of $28.4 billion against $83.2 billion of net premiums written, a 2.9 to 1 premium-to-surplus ratio; RBC ratios "in excess of minimum requirements"; statutory details in Note 8 of the annual report | Leverage and capital are measured on the statutory basis |
| **Erie** | The Exchange's policyholders' surplus of $10.1 billion "under statutory accounting" | A reciprocal's capital is its statutory surplus; it has no GAAP shareholders |
| **NAIC industry aggregate** | Policyholders' surplus of $1.27 trillion at December 31, 2025 "adjusted to eliminate stacking" | Group totals must remove affiliates' surplus counted twice |

Behind them, the production chain is similar everywhere: the policy, billing, claims and reinsurance systems feed a statutory ledger that carries the annual statement line, state and accident year on every entry; annual statement software assembles the blank, runs the NAIC's cross-checks and produces the electronic filing; and actuaries and auditors sign on top. Regulatory & Statistical Reporting covers that production pipeline.

## What SAP Is

SAP is codified in the NAIC's **Accounting Practices and Procedures Manual (AP&P Manual)**, which contains the Statements of Statutory Accounting Principles (SSAPs), "the highest level of authoritative guidance within the statutory accounting framework," and an appendix cross-referencing GAAP standards to SAP. The Statutory Accounting Principles (E) Working Group maintains it. State law adopts the manual (often by reference to the NAIC's annual statement instructions), with two kinds of departure:

- **Prescribed practices:** rules set by a state's laws or regulations that apply to all insurers domiciled in it.
- **Permitted practices:** exceptions a domiciliary regulator approves for one insurer, letting it use a method that differs from SAP. They're disclosed in the statement notes, and a reader comparing insurers has to back them out.

The manual does not override state law, so the statutory basis an insurer files on is "NAIC SAP as adopted by its domiciliary state," and the system has to know which state's version applies to which entity.

## SAP Versus GAAP

The differences come from the liquidation question. Where GAAP spreads, defers or capitalizes, SAP usually recognizes the cost now or excludes the asset:

| Item | GAAP | SAP |
| --- | --- | --- |
| **Policy acquisition costs** (commissions, premium taxes, underwriting) | Deferred and amortized over the coverage period as premium is earned | Expensed when incurred; deferred expenses are not admitted assets (Florida lists "Prepaid and deferred expenses" among assets not allowed), so writing new business reduces surplus immediately |
| **Assets that can't pay claims** (furniture, equipment, intangibles, prepaid expenses) | Assets, less impairment | Nonadmitted: excluded from the balance sheet and charged against surplus |
| **Reinsurance ceded** | A recoverable asset from any reinsurer, less expected credit losses | Credit (as an asset or a reduction of the reserve liability) only where the reinsurer or its collateral meets the state's credit for reinsurance law, based on NAIC Model #785 (Reinsurance Operations) |
| **Group view** | Consolidated | Each legal entity files its own statement; group totals must be "adjusted to eliminate stacking" of affiliates' surplus |

The largest of these in practice is acquisition cost: an insurer growing quickly can show a GAAP profit while its statutory surplus falls, because every new policy's commission and premium tax hit surplus at once while the premium is earned over the term. That is the mechanical reason growth needs capital ([The Insurance Business](/books/insurance/insurance-business#float-surplus-and-leverage)) and why premium-to-surplus and RBC are watched against the growth plan.

## Admitted and Nonadmitted Assets

An admitted asset is one the regulator counts as available to pay policyholders; everything else is nonadmitted and reduces surplus. The NAIC describes the principle as assets that cannot readily pay claims being "excluded from the balance sheet and instead reduce surplus," and state statutes list the categories. Florida's (Fla. Stat. 625.031) is typical: trade names, patents, agreements not to compete "and other like intangible assets"; advances to officers, directors, employees and agents on personal security; the insurer's own stock; "Furniture, fixtures, furnishings, safes, vehicles, libraries, stationery, literature, and supplies" (with exceptions for data processing and accounting systems); investments carried above their statutory value; mortgage-secured debt in default; and "Prepaid and deferred expenses." Uncollected premium and agents' balances are admitted only within aging limits set in the SSAPs, which is why billing aging feeds the statutory ledger.<!-- source-gap: ssap-premium-aging | missing | the SSAP aging rule under which uncollected premium and agents' balances become nonadmitted | closes with: the SSAP text (AP&P Manual) or a state regulation quoting it | checked: 2026-11-09 -->

### Worked Numbers: From GAAP Equity to Statutory Surplus

An illustration, my numbers, ignoring tax effects and the bond and reinsurance differences:

| Item | $ millions |
| --- | --- |
| GAAP shareholders' equity | 500.0 |
| Less deferred acquisition costs (deferred expenses, not admitted) | (60.0) |
| Less goodwill and other intangibles | (20.0) |
| Less furniture, equipment and leasehold improvements | (8.0) |
| Less premiums and agents' balances past the admissibility age | (4.5) |
| Statutory policyholders' surplus | **407.5** |

The 18.5% gap is the regulator's margin of conservatism, and every item in it comes from a record the operating systems hold: commissions and premium taxes by policy and term (DAC), the fixed asset register, and billing's aging of uncollected premium by policy and producer.

## Unearned Premium Under Statute

The core data model earns premium pro rata by time, day by day, from `premium_entries` ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model)). Statutes allow coarser methods, and the statutory unearned premium reserve must follow the one the insurer has adopted. Florida's (Fla. Stat. 625.051) shows the range: unless the office requires otherwise, a policy with a term of one year or less reserves one-half of its premium regardless of when in the year it was written (longer terms reserve declining fractions by policy year, and terms over five years are pro rata); the office may instead require "the unearned portion of the gross premiums ... computed on each respective risk"; and an insurer may elect to compute all reserves "on a monthly or more frequent pro rata basis," after which it may not change methods without the domiciliary regulator's approval.

### Worked Numbers: Daily Pro Rata Versus One-Half

An illustration, my numbers. A small book writes twelve annual policies of $1,200 each, one on the first of every month of 2026, and the year-end unearned premium reserve is computed two ways:

| Written | Days unearned at Dec 31 (of 365) | Daily pro rata unearned |
| --- | --- | --- |
| Jan 1 | 0 | $0.00 |
| Feb 1 | 31 | $101.92 |
| Mar 1 | 59 | $193.97 |
| Apr 1 | 90 | $295.89 |
| May 1 | 120 | $394.52 |
| Jun 1 | 151 | $496.44 |
| Jul 1 | 181 | $595.07 |
| Aug 1 | 212 | $696.99 |
| Sep 1 | 243 | $798.90 |
| Oct 1 | 273 | $897.53 |
| Nov 1 | 304 | $999.45 |
| Dec 1 | 334 | $1,098.08 |
| **Total** | 1,998 policy-days | **$6,568.77** |

Under the one-half method the reserve is 12 × $600 = $7,200.00, $631.23 more. The one-half method assumes writings are spread evenly through the year with a mid-year average; this book writes on the first of each month, so it earns a little faster than the assumption. For a seasonal book (heavy in the fourth quarter, say) the one-half method can understate the reserve instead, which is one reason regulators may require the per-risk method and most insurers elect monthly or daily pro rata. The system point is that the earning rule is a per-entity setting with an effective date, and both the daily figure and the elected statutory method are computable from the same entries.

## The Annual Statement

The NAIC publishes a blank (the forms) and instructions for each statement type: property and casualty, life and fraternal (which also carries accident and health written by life insurers), health, and title, maintained by the Blanks (E) Working Group, whose adopted changes take effect for a named reporting year. The P&C blank's main parts, at pointer level:

| Part | What it holds | Who in this volume owns it |
| --- | --- | --- |
| **Balance sheet** (assets, liabilities, surplus) | Admitted assets, loss and LAE reserves, unearned premium, ceded reinsurance balances, surplus | This chapter |
| **Statement of income and capital and surplus account** | Underwriting income, investment income, and the reconciliation of surplus | [How Insurers Make Money](/books/insurance/insurance-business#how-the-money-works) introduces the ratios |
| **Underwriting and Investment Exhibit** | Premiums written, earned and unearned, losses paid and incurred, and expenses, by annual statement line | This chapter |
| **Schedule D and the other investment schedules** | Every investment, security by security, with its NAIC designation | Solvency & Capital (investment limits) |
| **Schedule F** | Reinsurance assumed and ceded by counterparty, and recoverables | Reinsurance Operations |
| **Schedule P** | In the CAS reserving text's description, "a ten-year summary, by line of insurance, of earned premiums, claim and claim expense payments, and unpaid claims and expenses," plus development schedules for incurred, paid and IBNR; DCC and A&O have been reported separately on it since January 1, 1998 | Loss Reserving & Development |
| **Statement of Actuarial Opinion** | An appointed actuary's opinion on loss and LAE reserves | Loss Reserving & Development |
| **State Page (Exhibit of Premiums and Losses)** | Direct premiums written and earned, losses and other items, per state and line | Regulatory & Statistical Reporting (premium tax and market share are computed from it) |
| **Notes and interrogatories** | Accounting policies, permitted practices, related parties, contingencies, reinsurance details | This chapter |

The **annual statement line** is the classification every one of these uses: homeowners multiple peril is line 4, workers' compensation line 16, other liability lines 17.1 to 18.2, and so on, as the NAIC's market share report shows by line. It is not the same as a product's line of business or an ISO statistical line, and the mapping from an insurer's coverages to statement lines is configuration the system owns. Two rules about it: every premium entry, reserve change and claim payment carries the statement line it maps to as of the transaction, so a remapping changes future entries, not history; and the State Page needs the risk's state on the same entries, which the core `premium_entries.state` already holds.

### The Filing Calendar

State law sets the deadlines; Florida's statute (Fla. Stat. 624.424) states the common calendar, and the NAIC models match it:

| Filing | Due |
| --- | --- |
| Annual statement for the prior calendar year | On or before March 1 |
| Risk-based capital report | On or before March 1 (Model #312) |
| Quarterly statements for the quarters ending March 31, June 30 and September 30 | Within 45 days after each quarter end (May 15, August 14, November 14) |
| Statement of Actuarial Opinion on loss and LAE reserves (P&C) | With the annual statement |
| Audited financial report by an independent CPA | On or before June 1 (Model #205), extendable in 30-day increments |
| Corporate governance annual disclosure | June 1 (an accreditation standard since January 1, 2020) |

Florida's sanction for missing the annual or quarterly statement is not a fine but the office's power to refuse, suspend or revoke the certificate of authority. The audit regulation (#205) also requires the lead audit partner to rotate after five consecutive years, a management report on internal control over financial reporting for insurers with $500 million or more of direct and assumed premium, and audit committee independence that scales with premium (no minimum below $300 million, a majority independent between $300 and $500 million, a supermajority of 75% above). These are entity-level obligations, and the compliance calendar for each legal entity is generated from them.

## Statutory Figures in a 10-K

Public insurance groups report GAAP consolidated results, but their 10-Ks carry the statutory figures that constrain them: statutory surplus and net income by subsidiary or in aggregate, the dividends the insurance subsidiaries may pay the holding company in the coming year without prior approval, RBC statements (careful ones, because Model #312 restricts public RBC comparisons, covered in [Solvency & Capital](/books/insurance/solvency-and-capital#risk-based-capital)), and premium-to-surplus ratios. Progressive's 2025 10-K is a clean example: $28.4 billion of statutory surplus, the 2.9 to 1 premium-to-surplus ratio against a regulatory benchmark of 3 to 1 (and a maximum of 3.5 to 1 in two states for its personal vehicle subsidiaries), and RBC ratios above minimums. Reading a 10-K, the useful checks are whether statutory surplus is growing slower than GAAP equity (fast growth, or permitted practices), how much of holding company liquidity depends on subsidiary dividends, and whether any subsidiary's premium-to-surplus is near its state's limit.

### Worked Numbers: Ratios on the Statutory Basis

The NAIC's 2025 P&C industry figures show how the published combined ratio is built, in $ millions:

| Item | 2025 |
| --- | --- |
| Net losses incurred | 551,755 |
| Loss adjustment expenses incurred | 86,003 |
| Net premiums earned | 958,726 |
| **Net loss and LAE ratio** (to earned) | (551,755 + 86,003) / 958,726 = **66.5%** |
| Underwriting expenses | 252,164 |
| Net premiums written | 976,779 |
| **Expense ratio** (to written) | 252,164 / 976,779 = **25.8%** |
| Policyholder dividends | about 5,700 |
| **Dividend ratio** (to earned) | 5,700 / 958,726 = **0.6%** |
| **Combined ratio** as NAIC reports it | **92.9%** |

The mixed denominators are deliberate (the "trade basis"): losses are matched to the premium earned in the period, expenses to the premium written, because acquisition costs are expensed when written under SAP. A GAAP combined ratio, with DAC amortized against earned premium, divides both by earned. When a carrier's reported ratio and a computed one differ, the denominator is usually why.

## What the Ledger Must Keep

The annual statement is produced from the operating systems, and every number in it has to tie back to them. What that requires of the records the core model already defines:

- **Premium entries** with statement line, state, accounting date and earning window, direct and ceded separately, so written, earned and unearned by line and state can be computed for any period, on the daily basis and on the elected statutory method.
- **Claims data by accident year:** loss date, reported date, and every payment and reserve change with cost type (indemnity, DCC, A&O) and statement line, so Schedule P's ten years of triangles rebuild from rows rather than from last year's filed numbers.
- **Reinsurance cessions per contract and counterparty,** with paid and unpaid recoverables aged, for Schedule F and the provision for reinsurance.
- **Billing aging** of uncollected premium by policy and producer, for the nonadmitted portion.
- **Commissions and premium taxes** by policy transaction, which are expensed under SAP and deferred under GAAP: the same entries feed both ledgers with different recognition.
- **Investment holdings** at security level from the custodian and investment accounting system, with NAIC designations.

The playbook's rule that the product keeps facts and finance picks policy ([The Product Keeps Facts, Finance Picks Policy](/docs/money/accounting#the-product-keeps-facts-finance-picks-policy)) is the design here: the operating systems record transactions once, with every classification attribute; the GAAP and statutory ledgers are two recognition policies over the same facts.

## How to Build It

The core model's `premium_entries`, `reserves`, `claim_payments` and `cessions` are the facts. This chapter adds the statement line catalog and the mapping from coverages to it, and the statement runs that freeze what was filed:

```sql
CREATE TABLE statement_lines (             -- the NAIC annual statement line catalog
  statement_type      TEXT NOT NULL CHECK (statement_type IN ('pc', 'life', 'health',
                        'title', 'fraternal')),
  line_code           TEXT NOT NULL,        -- '04', '16', '17.1', '19.2'
  name                TEXT NOT NULL,        -- 'Homeowners multiple peril'
  reporting_years     INT4RANGE NOT NULL,   -- blanks change; lines are added and split
  PRIMARY KEY (statement_type, line_code, reporting_years)
);

CREATE TABLE statement_line_mappings (     -- an insurer's coverages to statement lines
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id          UUID NOT NULL REFERENCES insurers (id),
  product_line        TEXT NOT NULL,        -- products.line
  coverage_code       TEXT,                 -- null: all coverages of the product line
  statement_type      TEXT NOT NULL,
  line_code           TEXT NOT NULL,
  schedule_p_line     TEXT,                 -- Schedule P groups lines differently
  effective           DATERANGE NOT NULL,
  EXCLUDE USING gist (insurer_id WITH =, product_line WITH =,
    (COALESCE(coverage_code, '')) WITH =, effective WITH &&)
);

ALTER TABLE premium_entries ADD COLUMN statement_line TEXT;  -- stamped at posting
ALTER TABLE reserves        ADD COLUMN statement_line TEXT;
ALTER TABLE claim_payments  ADD COLUMN statement_line TEXT;

CREATE TABLE statutory_settings (          -- per-entity statutory elections, dated
  insurer_id          UUID NOT NULL REFERENCES insurers (id),
  setting             TEXT NOT NULL,        -- 'upr_method', 'permitted_practice'
  value               JSONB NOT NULL,       -- {"method": "daily_pro_rata"}
  approved_by_jurisdiction TEXT REFERENCES jurisdictions (code),
  effective           DATERANGE NOT NULL,
  PRIMARY KEY (insurer_id, setting, effective)
);

CREATE TABLE annual_statement_runs (       -- one filing of one blank for one entity
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id          UUID NOT NULL REFERENCES insurers (id),
  statement_type      TEXT NOT NULL,
  period_kind         TEXT NOT NULL CHECK (period_kind IN ('annual', 'q1', 'q2', 'q3')),
  period_end          DATE NOT NULL,
  data_as_of          TIMESTAMPTZ NOT NULL, -- recorded-time cut of the operating data
  status              TEXT NOT NULL CHECK (status IN ('draft', 'validated', 'filed',
                        'amended')),
  filed_at            TIMESTAMPTZ,
  amends_id           UUID REFERENCES annual_statement_runs (id),
  UNIQUE (insurer_id, statement_type, period_kind, period_end, filed_at)
);

CREATE TABLE statement_values (            -- the filed numbers, cell by cell
  run_id              UUID NOT NULL REFERENCES annual_statement_runs (id),
  page                TEXT NOT NULL,        -- 'UIE-PART1', 'SCH-P-PART2', 'STATE-PAGE'
  row_key             TEXT NOT NULL,        -- line, accident year, state, counterparty
  column_key          TEXT NOT NULL,
  amount              BIGINT NOT NULL,      -- minor units, or whole dollars as filed
  source_query        TEXT NOT NULL,        -- which versioned query produced it
  PRIMARY KEY (run_id, page, row_key, column_key)
);
```

Three rules make it work. **Stamp the statement line at posting** from the mapping in effect on the transaction's accounting date; a mapping change applies to new entries, and restating history is a deliberate reclass entry, not a recomputation. **Freeze runs at a recorded-time cut:** `data_as_of` plus the versioned queries mean the filed statement can be reproduced exactly a year later, even after late corrections in the operating data (those land in the next period as prior-year development, which is how statutory accounting wants them). **Tie out before filing:** written premium on the Underwriting and Investment Exhibit must equal the sum of premium entries for the year by line, and the State Page must sum to the countrywide total; a run doesn't leave `draft` until the checks pass.

## Auditing

- **Every filed statement reproducible** from its run: the data cut, the query versions and the cell values as filed, with amendments linked to the original.
- **Tie-outs from statement to entries:** written, earned and unearned premium; paid and incurred losses by accident year; ceded balances by reinsurer.
- **The statement line mapping's history,** so a reviewer can see why a coverage reported under one line one year and another the next.
- **Statutory elections and permitted practices** with the approving jurisdiction and dates.
- **The entity filing calendar:** annual, quarterly, RBC, actuarial opinion, audited report and governance disclosure, with filed dates.

## What This Means for the System You Build

- **Record transactions once with every classification** (statement line, state, accident year, cost type, counterparty) and derive both GAAP and statutory views from them.
- **Stamp the annual statement line at posting** from a dated mapping; never remap history silently.
- **Keep the statutory UPR method as an entity setting,** computable beside daily pro rata from the same entries.
- **Feed billing aging, commissions and taxes to the statutory ledger,** because they drive nonadmitted assets and expensed acquisition costs.
- **Freeze each statement run at a recorded-time cut,** with versioned queries, so the filed numbers can be reproduced.
- **Treat each legal entity as its own filer,** with its own calendar, elections and domiciliary rules.

## References

**Law and regulation**

- [Fla. Stat. 625.031](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0625/Sections/0625.031.html), assets not allowed: intangibles, certain advances, own stock, furniture and equipment, excess carrying values, defaulted mortgage debt, and prepaid and deferred expenses
- [Fla. Stat. 625.051](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0625/Sections/0625.051.html), the unearned premium reserve: one-half for terms of a year or less, per-risk computation, the monthly or more frequent pro rata election, and approval to change methods
- [Fla. Stat. 624.424](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0624/Sections/0624.424.html), annual statements by March 1, quarterly within 45 days, the actuarial opinion, audited reports by June 1, and certificate sanctions

**NAIC**

- [NAIC: Statutory Accounting Principles](https://content.naic.org/insurance-topics/statutory-accounting-principles), conservatism, the AP&P Manual and SSAPs, the Statutory Accounting Principles Working Group, prescribed and permitted practices, and assets that can't pay claims reducing surplus
- [NAIC: Blanks (E) Working Group](https://content.naic.org/cmte_e_app_blanks.htm), the annual and quarterly statement blanks and instructions and their revision by reporting year
- [NAIC: Annual Financial Reporting Model Regulation (#205, PDF)](https://content.naic.org/sites/default/files/model-law-205.pdf), audited reports by June 1, partner rotation, the $500 million internal control report and audit committee tiers
- [NAIC: Risk-Based Capital for Insurers Model Act (#312, PDF)](https://content.naic.org/sites/default/files/model-law-312.pdf), the RBC report due March 1
- [NAIC: Financial Regulation Standards and Accreditation Committee](https://content.naic.org/cmte_f.htm), the corporate governance annual disclosure due June 1 as an accreditation standard
- [NAIC: 2025 Annual Property and Casualty and Title Insurance Industries Analysis Report (PDF)](https://content.naic.org/sites/default/files/2025-annual-property-and-casualty-and-title-insurance-industries-analysis-report.pdf), 2025 losses, LAE, premiums, expenses, the 66.5% loss ratio, 25.8% expense ratio and 92.9% combined ratio, $5.7 billion of policyholder dividends and surplus adjusted to eliminate stacking
- [NAIC: Credit for Reinsurance Model Law (#785, PDF)](https://content.naic.org/sites/default/files/model-law-785.pdf), credit for reinsurance as an asset or a reduction from liability, by the reinsurer's status and collateral
- [NAIC: 2025 Property and Casualty Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-property-casualty-market-share.pdf), market share by annual statement line, keyed by NAIC group and company code

**Standards**

- [Casualty Actuarial Society: Estimating Unpaid Claims Using Basic Techniques, Friedland, version 3, 2010 (PDF)](https://www.casact.org/sites/default/files/database/studynotes_friedland_estimating.pdf), Schedule P's ten-year summary and development schedules, and the DCC and A&O categories effective January 1, 1998

**Filings**

- [Progressive: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/80661/000008066126000086/pgr-20251231.htm), statutory surplus of $28.4 billion, the 2.9 to 1 premium-to-surplus ratio, the 3 to 1 benchmark and 3.5 to 1 maximum in two states, and RBC above minimums
- [Erie Indemnity: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/922621/000162828026010666/erie-20251231.htm), the Exchange's $10.1 billion of policyholders' surplus under statutory accounting
