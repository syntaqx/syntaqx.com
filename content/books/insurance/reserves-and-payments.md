+++
title = "Exposures, Reserves & Payments"
nav_title = "Reserves & Payments"
description = "Exposures as the unit of money on a claim, case reserves by cost type with a worked walk, authority, multi-payee and mortgagee checks, OFAC, 1099s, reopening."
category = "Insurance Industry"
order = 2731
part = "Claims"
tags = ["insurance", "claims", "reserves", "claim-payments", "lae", "exposures"]
+++

A claim is a container; the money moves on exposures. One rear-end collision can carry the insured's collision coverage for their own car, rental reimbursement, the other driver's property damage claim against the insured's liability coverage, two bodily injury claims against the same coverage with a per-person and per-accident limit, and a medical payments claim for a passenger. Each has its own claimant, its own limit and deductible, its own adjuster, its own reserve, its own payments and its own statistical and reinsurance coding. A system that stores "the reserve on the claim" or pays "the claim" can't apply a limit, report Schedule P, compute a reinsurance recovery or show an examiner which coverage each dollar was paid under, which the model act requires.

This chapter covers exposures, case reserves by cost type and the practices behind them, a reserve walk with payments worked to the dollar, reserving guidelines and authority, paying claimants and vendors (multi-payee and mortgagee checks, methods), OFAC screening and 1099 reporting on claim payments, and closing and reopening. What actuaries do with the reserve history (triangles, IBNR, development) is [Loss Reserving & Development](/books/insurance/loss-reserving); the rails a payment rides on are in [Payments](/books/payments/vendor-payouts#the-methods); recoveries are in [Subrogation, Salvage & Recovery](/books/insurance/subrogation-and-salvage).

## Exposures

An **exposure** is one claimant against one coverage on one claim ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model)). The word is Guidewire's; other systems say feature, line, coverage line or claimant coverage. Whatever the name, it is the level at which:

- **Limits and deductibles apply.** Two bodily injury exposures share a per-accident limit and each has a per-person limit; a collision exposure carries the deductible.
- **Reserves and payments are recorded.** Model 900 lists "making claims payments to an insured or beneficiary without indicating the coverage under which each payment is being made" as an unfair claims practice, so a payment is always against an exposure and therefore a coverage.
- **Statistics and accounting are coded.** Statement line, statistical plan codes and accident year come from the exposure's coverage and the claim's loss date.
- **Reinsurance attaches.** A per-risk treaty applies to the property exposures, a casualty excess treaty to the liability ones.

Exposures open as the facts arrive: the insured's collision exposure at FNOL, the third-party property damage exposure when the other driver calls, an injury exposure when a demand letter arrives. Each one opens with an initial reserve and its own clock tasks ([Claim Handling Law & Clocks](/books/insurance/claim-handling-law)).

## Case Reserves by Cost Type

A **case reserve** (case outstanding) is the estimate, by the adjuster, a third-party administrator or an independent adjuster, of what is still to be paid on a known claim. It is one of five components of an insurer's unpaid claims, per the CAS's text on reserving: case outstanding, future development on known claims, reopened claims, claims incurred but not reported, and claims in transit; actuaries call the last four together "broad" IBNR. Across the US industry, case outstanding net of reinsurance is less than half of total unpaid claims and claim expenses, so the adjuster's number is the base the actuary's much larger estimate is built on, and its history is the data.

Reserves are kept by **cost type**, because statutory reporting splits loss adjustment expense two ways since January 1, 1998: **defense and cost containment (DCC)**, which "include all defense litigation and medical cost containment expenses regardless of whether internal or external to the insurer," and **adjusting and other (A&O)**, everything else in adjusting a claim, internal or external (an independent adjuster's fee, for example). With indemnity (the loss itself), that gives three reserve lines per exposure: `indemnity`, `dcc`, `ao`. Some insurers reserve DCC only, some reserve neither expense type at the case level; the model supports all three and the insurer's guideline says which are used.

How the initial number is set varies by line and insurer, and the CAS text describes the range:

- **Formula or tabular.** A fixed amount by claim type ("an insurer may initially set all automobile physical damage glass claims at $500"), or a table by injury type in workers' compensation.
- **Best estimate of the ultimate settlement,** including expected inflation, the most common approach.
- **Maximum value,** the policy limit.
- **Expected value versus mode** when outcomes are binary: if counsel gives a $1 million-limit claim an 80% chance of no payment and 20% of full limits, one insurer reserves $0 (the mode) and another $200,000 (the expected value).

Two arithmetic facts every claims ledger has to make true. **Reported claims (case incurred) = cumulative paid + case outstanding** at the same moment, and the change in reported claims over a period = payments in the period + the change in case outstanding. And a payment does not automatically reduce the reserve by its amount: an adjuster may take the reserve down by more, less, or not at all, and may increase it, so payment and reserve change are separate rows that the system records together when they happen together.

### Worked Numbers: A Reserve Walk

Mine. An auto accident on March 3, 2027. Exposure A is the insured's collision coverage ($500 deductible); exposure B is a third party's bodily injury claim against the insured's $100,000 per-person liability limit.

| Date | Event | Exposure, cost type | Reserve change | Payment | Case outstanding | Paid to date | Reported (incurred) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mar 4, 2027 | Initial reserve by formula | A, indemnity | +6,500 | | 6,500 | 0 | 6,500 |
| Mar 5 | Initial injury reserve | B, indemnity | +15,000 | | 21,500 | 0 | 21,500 |
| Mar 9 | Estimate $8,240 less $500 deductible | A, indemnity | +1,240 | | 22,740 | 0 | 22,740 |
| Mar 18 | Pay repair shop and insured | A, indemnity | -7,740 | 7,740 | 15,000 | 7,740 | 22,740 |
| Apr 2 | Supplement found on teardown; exposure reopened | A, indemnity | +860 | | 15,860 | 7,740 | 23,600 |
| Apr 6 | Pay supplement; close A | A, indemnity | -860 | 860 | 15,000 | 8,600 | 23,600 |
| May 20 | Medical specials $18,400, demand $95,000 | B, indemnity | +27,000 | | 42,000 | 8,600 | 50,600 |
| Jul 1 | Suit filed; defense counsel assigned | B, DCC | +12,000 | | 54,000 | 8,600 | 62,600 |
| Sep 30 | Defense invoice | B, DCC | -3,100 | 3,100 | 50,900 | 11,700 | 62,600 |
| Dec 31 | Defense invoice | B, DCC | -4,650 | 4,650 | 46,250 | 16,350 | 62,600 |
| Jan 15, 2028 | Settle for $38,500; release $3,500 | B, indemnity | -42,000 | 38,500 | 4,250 | 54,850 | 59,100 |
| Feb 10 | Final defense invoice $1,900; release $2,350; close B | B, DCC | -4,250 | 1,900 | 0 | 56,750 | 56,750 |

Reading it. At December 31, 2027, the claim's reported loss and DCC for accident year 2027 was $62,600 (paid $16,350, case $46,250); at closing it was $56,750, so the claim developed **$5,850 favorably** in 2028, the number the actuary's triangle sees as development on accident year 2027 at 24 months. The reopened collision exposure is the CAS's "reopened claims" component in miniature. The A&O cost of the adjuster's time doesn't appear, because most insurers carry A&O as a bulk reserve, not per claim. And every number in the last three columns is derived from the first two; nobody types a case outstanding balance.

## Reserving Guidelines

A reserving guideline is the insurer's written standard for case reserves: which cost types are reserved at the case level, which claim types use formula reserves and their amounts, when the adjuster must replace a formula reserve with an individual estimate, which events require a reserve review (an estimate, a demand, a suit, a medical report, a coverage position, a payment), and who may set reserves of what size. The standard practice is to review reserves on those events and on a diary interval, so a stale reserve is visible as a task, not as a surprise in the next development study. Formula reserves belong in versioned data with effective dates, because changing the glass formula from $500 to $650 changes every new glass claim's incurred loss, and the actuary needs to know when.

Two more guideline rules matter to the ledger:

- **Ceded case reserves follow the gross ones.** For quota share, the ceded case reserve is the reinsurer's share; for excess of loss, it's the case outstanding above the retention, when the adjuster reserves on a total-limits basis. A reserve change above a treaty's reporting threshold triggers a notice to the reinsurer ([Reinsurance Operations](/books/insurance/reinsurance-operations)).
- **Recoveries are tracked separately.** Some insurers net expected salvage and subrogation into the case reserve; many track only actual recoveries. Either way, the recovery is its own record ([Subrogation, Salvage & Recovery](/books/insurance/subrogation-and-salvage)).

## Authority and Approvals

Every adjuster has authority limits: the largest reserve they may set, the largest single payment and the largest total on an exposure, by line and cost type. Above the limit, the change or payment is a request that a supervisor approves, and large-loss thresholds route to a manager or a claims committee and a reinsurer notice. Agentic claims platforms now act inside these limits too: Five Sigma describes agents that move claims "within set SOPs and thresholds," which makes the thresholds a control on software as well as people.

The controls are the ones any payment system uses ([Payout State Machine](/books/payments/vendor-payouts#a-payout-is-a-state-machine)): the requester can't approve their own request, a payment to a new payee or a changed bank account needs a second check ([Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account)), and an approval records the authority rule that allowed it. A payment that exceeds the exposure's remaining limit is refused by the system, not by the adjuster's memory.

## Paying Claimants and Vendors

A claim payment names an exposure, a cost type, an amount, one or more payees and a method, and it has to satisfy claim law as well as payment hygiene:

- **Code the coverage.** Each payment is against an exposure and states the coverage (Model 900).
- **Don't call a partial payment final.** No insurer may indicate on a check, draft or accompanying letter that a payment is "final" or "a release" of a first-party claim unless the policy limit has been paid or the parties agreed a compromise, nor issue partial checks with release language (Model 902). Florida requires preliminary estimates and partial payments to carry a prescribed notice that the claim is still under evaluation, in at least 12-point bold uppercase (Fla. Stat. 627.70131(6)).
- **Pay undisputed amounts.** Model 902 expects undisputed amounts under separate coverages to be paid within 30 days when the payee is known, so a dispute on the dwelling doesn't hold up additional living expense.

**Payees.** First-party payments go to the insured, often jointly with others with an interest: a mortgagee on a dwelling, a lienholder on a vehicle, a contractor, a public adjuster. The mortgagee's place comes from the policy's mortgage clause; the California standard fire policy, for example, lets a mortgagee named as payee render proof of loss if the insured doesn't, within 60 days after notice, and subjects it to the policy's appraisal, payment and suit provisions (Cal. Ins. Code 2071). States limit how far the mortgagee reaches: Florida requires contents, additional living expense and other items not subject to a recorded security interest to be paid "to the primary policyholder only, without requiring a dual endorsement from any mortgageholder or lienholder" (Fla. Stat. 627.70121, for policies issued or renewed since October 1, 2006). Texas requires anyone paying policy proceeds on a claim with a public adjuster to name the insured as a payee and get the insured's endorsement, and forbids the public adjuster to endorse for the insured (Tex. Ins. Code 4102.104). Third-party payments go to the claimant and, when represented, usually to their attorney jointly or to the attorney's trust account, plus medical providers and lien holders (Medicare and Medicaid among them) whose liens attach to settlements.

**Multi-payee checks.** Joint payees on a paper check mean every payee must endorse, which is what protects a mortgagee and what slows a homeowner's repair. The system's job is to know who must be on each payment (from the policy version's party roles as of the loss date, the claim's representation and liens, and the state's rules on contents and ALE), to render the payee line correctly, and to track endorsement and clearing. Electronic payments can't carry joint endorsement, so multi-payee electronic disbursement usually means separate payments by share, a payee who consents for the others, or a mortgagee's loss draft process.

**Methods.** Checks, ACH, push to card, virtual cards to vendors and digital wallets, with their speed, cost and fraud profile in [Vendor Payouts](/books/payments/vendor-payouts#push-to-card) and [Accepting Checks](/books/payments/checks#check-fraud). Insurers are moving off paper but slowly: Hi Marley reports one carrier customer cutting paper checks from 24% to 14% of payments.

## Sanctions and Tax Reporting

**OFAC.** Insurers are US persons under the sanctions programs, so claimants, payees and vendors are screened before payment and on list changes, and a payment to a blocked person is blocked rather than paid; any US person holding blocked property files a report "within 10 business days from the date that property becomes blocked" and an annual report of blocked property held as of June 30 by September 30 (31 CFR 501.603). The matching, clearing and blocking mechanics are the bank's problem too and are in [Sanctions Screening](/books/banking-and-lending/sanctions-screening#blocking-rejecting-and-reporting).

**1099s.** The IRS instructions (revised December 2026) name insurers in three places that matter to claims: an insurer that pays a claimant's attorney to settle a claim reports the payment as gross proceeds paid to an attorney in box 10 of Form 1099-MISC (the instructions' example is "an insurance company pays a claimant's attorney $100,000 to settle a claim"), and generally needn't report the claimant's own share; medical and health care payments by insurers under accident and sickness programs go in box 6, and the corporate exemption doesn't apply to them; and payments for services, including parts incidental to the service (the example is an insurer's payments to an auto repair shop under a repair contract), go on Form 1099-NEC, with payments to corporations generally exempt except for attorneys and medical providers. The thresholds rose to $2,000 for certain returns for tax years beginning after 2025, while the attorney gross proceeds box still reads $600, so the threshold is per form and box and per tax year. W-9 collection and TIN matching are in [Tax: W-9s, TIN Matching and 1099s](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s).

## Closing and Reopening

An exposure closes when its reserves are zero, its payments are issued, and its open tasks are done or no longer apply (a final status letter, a limitation notice); the claim closes when every exposure has. Closing is an event with a reason (paid, denied, withdrawn, duplicate, subrogation only), because Model 902 expects the insurer to produce, for every claim in the current and two preceding years, the date of payment or the date of denial or date closed without payment.

Reopening is common and lawful: a supplement on a repair, more damage found, a demand after a closed property damage exposure, a recovery to post. Florida sets the outer limits for property: a claim or **reopened claim** (one the insurer previously closed, reopened for more costs for loss already disclosed) is barred unless noticed within 1 year after the date of loss, and a **supplemental claim** (additional loss from the same peril, already adjusted or incurred during repairs) within 18 months; condominium loss assessment claims get up to 3 years (Fla. Stat. 627.70132, as amended through ch. 2024-139). Each reopened or supplemental claim restarts Florida's 60-day pay-or-deny clock. In the model, reopening is a status change on the exposure with a new reserve row and new tasks; the original closing stays in the history.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `exposures`, `reserves`, `claim_payments`, and `statement_line` on reserves and payments ([Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting)). This chapter adds `reserve_guidelines`, `authority_limits` and `payment_approvals`, plus payee and screening columns.

```sql
ALTER TABLE exposures
  ADD COLUMN coverage_id       UUID REFERENCES coverages (id),  -- the coverage as of loss date
  ADD COLUMN limit_remaining   BIGINT,       -- maintained by the payment service, checked on pay
  ADD COLUMN closed_reason     TEXT,         -- 'paid', 'denied', 'withdrawn', 'duplicate', ...
  ADD COLUMN closed_at         TIMESTAMPTZ;

ALTER TABLE reserves
  ADD COLUMN guideline_id      UUID,         -- the formula or rule that set it, if any
  ADD COLUMN payment_id        UUID REFERENCES claim_payments (id),  -- when taken down by a payment
  ADD COLUMN approval_id       UUID;         -- payment_approvals, when over authority

CREATE TABLE reserve_guidelines (          -- formula reserves and review triggers, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  line               TEXT NOT NULL,
  coverage_code      TEXT,
  claim_type         TEXT,                  -- 'glass', 'tow', 'injury_soft_tissue', ...
  cost_type          TEXT NOT NULL CHECK (cost_type IN ('indemnity', 'dcc', 'ao')),
  initial_amount     BIGINT,                -- formula reserve, minor units
  replace_within_days INT,                  -- individual estimate due
  review_events      TEXT[] NOT NULL,       -- 'estimate', 'demand', 'suit', 'medical_report'
  review_every_days  INT,
  effective_from     DATE NOT NULL,
  effective_to       DATE
);

CREATE TABLE authority_limits (            -- who may reserve and pay how much
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  holder_type        TEXT NOT NULL CHECK (holder_type IN ('user', 'role', 'agent')),
  holder_id          TEXT NOT NULL,         -- user id, role name, or AI agent id
  line               TEXT NOT NULL,
  cost_type          TEXT NOT NULL,
  max_reserve        BIGINT NOT NULL,       -- per exposure
  max_payment        BIGINT NOT NULL,       -- per payment
  max_exposure_paid  BIGINT NOT NULL,       -- cumulative on one exposure
  effective_from     DATE NOT NULL,
  effective_to       DATE
);

CREATE TABLE payment_approvals (           -- a reserve change or payment over authority
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_type       TEXT NOT NULL CHECK (subject_type IN ('reserve', 'payment')),
  subject_id         UUID NOT NULL,
  requested_by       UUID NOT NULL,
  approver_id        UUID,
  authority_limit_id UUID REFERENCES authority_limits (id),  -- the approver's limit used
  decision           TEXT CHECK (decision IN ('approved', 'rejected')),
  decided_at         TIMESTAMPTZ,
  CHECK (approver_id IS NULL OR approver_id <> requested_by)
);

ALTER TABLE claim_payments
  ADD COLUMN coverage_code     TEXT,               -- Model 900 4J, printed on the payment
  ADD COLUMN payee_line        TEXT,               -- as rendered: 'Jane Doe and First Bank, ISAOA'
  ADD COLUMN payee_rule_refs   TEXT[] NOT NULL DEFAULT '{}',  -- 'Fla. Stat. 627.70121', ...
  ADD COLUMN is_final          BOOLEAN NOT NULL DEFAULT FALSE, -- only at limits or agreed compromise
  ADD COLUMN sanctions_screen_id UUID,             -- the screening result it passed
  ADD COLUMN tax_form          TEXT,               -- '1099-MISC-10', '1099-MISC-6', '1099-NEC-1a'
  ADD COLUMN tax_payee_party_id UUID REFERENCES parties (id),
  ADD COLUMN approval_id       UUID REFERENCES payment_approvals (id),
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT claim_payments_coverage_code_not_null NOT NULL coverage_code NOT VALID,
  ADD CONSTRAINT claim_payments_payee_line_not_null NOT NULL payee_line NOT VALID;
```

Case outstanding and reported (incurred) loss by exposure and cost type, as of any date, are queries over the history:

```sql
SELECT e.id AS exposure_id,
       r.cost_type,
       SUM(r.change)                                   AS case_outstanding,
       COALESCE(p.paid, 0)                             AS paid,
       SUM(r.change) + COALESCE(p.paid, 0)             AS reported
FROM exposures e
JOIN reserves r ON r.exposure_id = e.id AND r.recorded_at <= :as_of
LEFT JOIN LATERAL (
  SELECT SUM(cp.amount) AS paid
  FROM claim_payments cp
  WHERE cp.exposure_id = e.id AND cp.cost_type = r.cost_type
    AND cp.status IN ('issued', 'cleared') AND cp.issued_at <= :as_of
) p ON TRUE
WHERE e.claim_id = :claim_id
GROUP BY e.id, r.cost_type, p.paid;
```

Design choices:

- **Payment and reserve takedown post together, in one transaction,** with the reserve row pointing at the payment, so case outstanding can't go negative and the walk above reconciles.
- **A voided or stopped payment is a reversal,** with the reserve restored by a new row, never a deleted payment ([Payment States & Ledgers](/docs/money/payment-states)).
- **Payees are derived, then confirmed.** The system proposes payees from party roles, liens, representation and state rules, the adjuster confirms, and the rule references are stored.
- **Screening runs before issue and on list updates** for payees of unissued payments, with the result referenced on the payment.
- **Tax classification is set at payment time** from the payee type and payment purpose, so year-end reporting is a query.

## Auditing

- **Every reserve change** with cost type, reason, guideline or estimate behind it, who made it and the approval if over authority.
- **Every payment** with exposure, coverage, payees, payee rules, method, approval, screening result, tax classification, issue and clearing, and any void or stop.
- **Reported loss rebuildable as of any date** by exposure, cost type, accident year and statement line, matching what was reported then.
- **Every close and reopen** with reasons and dates, producing Model 902's date paid, date denied or date closed without payment.
- **Authority limits as they were** on the day of each approval, including limits set for software agents.

## What This Means for the System You Build

- **Attach every reserve and payment to an exposure,** one claimant and one coverage, and print the coverage on the payment.
- **Keep three cost types** (indemnity, DCC, A&O), as change rows, and derive case outstanding and reported loss.
- **Version formula reserves and review triggers** as guidelines, with effective dates.
- **Enforce authority in the system,** with separate requester and approver, for people and agents alike.
- **Derive payees from roles and rules** (mortgagees, lienholders, public adjusters, attorneys, liens), and never mark a partial payment final.
- **Screen payees against sanctions lists and classify payments for 1099s** at payment time.
- **Close and reopen exposures by event,** keeping the history Florida's one-year and 18-month limits and the examiner's date fields need.

## References

**Law and regulation**

- [31 CFR 501.603](https://www.law.cornell.edu/cfr/text/31/501.603), reports of blocked property within 10 business days and the annual report as of June 30, due September 30
- [Fla. Stat. 627.70121](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70121.html), contents and additional living expense paid to the primary policyholder without a mortgagee's endorsement
- [Fla. Stat. 627.70131](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70131.html), the required statement on preliminary estimates and partial payments, and the 60-day pay-or-deny rule for reopened and supplemental claims
- [Fla. Stat. 627.70132](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70132.html), notice of claims and reopened claims within 1 year and supplemental claims within 18 months, condominium loss assessments, and the section's history
- [Cal. Ins. Code 2071 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-2071/), the standard fire policy's mortgagee provisions
- [Tex. Ins. Code 4102.104](https://texas.public.law/statutes/tex._ins._code_section_4102.104), the insured as payee and endorser when a public adjuster is involved

**NAIC**

- [NAIC: Unfair Claims Settlement Practices Act (#900) (PDF)](https://content.naic.org/sites/default/files/model-law-900.pdf), payments that don't indicate the coverage as an unfair practice
- [NAIC: Unfair Property/Casualty Claims Settlement Practices Model Regulation (#902) (PDF)](https://content.naic.org/sites/default/files/model-law-902.pdf), no "final" or release language on partial payments, undisputed amounts within 30 days, and claim data kept for the current and two preceding years

**Regulators and guidance**

- [IRS: Instructions for Forms 1099-MISC and 1099-NEC (Rev. December 2026)](https://www.irs.gov/instructions/i1099mec), attorney gross proceeds from insurer settlements, medical payments by insurers, repair shop payments, the corporate exemption and the $2,000 threshold change

**Standards**

- [Casualty Actuarial Society: Friedland, Estimating Unpaid Claims Using Basic Techniques (PDF)](https://www.casact.org/sites/default/files/database/studynotes_friedland_estimating.pdf), the five components of unpaid claims, case outstanding, DCC and A&O from 1998, formula and tabular reserves, approaches to case reserves, reported claims as paid plus case, payments and reserve changes, salvage and subrogation and ceded case practices

**Vendor documentation**

- [Five Sigma](http://fivesigma.ai/), agents acting within configured procedures and thresholds
- [Hi Marley](https://www.himarley.com/), a carrier's paper check share falling from 24% to 14%
