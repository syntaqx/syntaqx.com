+++
title = "Patient Statements, Estimates & Collections"
nav_title = "Patient Financial Experience"
description = "The patient's bill: responsibility after insurance, good faith estimates, price transparency, statements, payment plans, medical debt, collections."
category = "Health Tech Industry"
order = 1926
part = "Revenue Cycle"
tags = ["health-tech", "patient-billing", "no-surprises-act", "price-transparency", "medical-debt", "collections", "data-model"]
+++

The patient is the payer of last resort and the one least equipped to understand the bill. By the time a statement arrives, the visit was weeks ago, the insurer has adjudicated the claim into allowed amounts, adjustments and a patient share, and the number on the statement is the residue of a calculation the patient never saw. For dental, optometry and veterinary practices, the patient (or the pet's owner) pays most of the revenue directly, so the statement, the estimate before treatment and the card at checkout are the revenue cycle. For a medical practice, patient balances are a growing share of revenue as deductibles rise, and the hardest share to collect.

The rules around the patient's bill have multiplied in a decade. The No Surprises Act requires good faith estimates for uninsured and self-pay patients and gives them a dispute process when the bill runs $400 over the estimate. Hospitals must publish their prices; health plans must publish their negotiated rates. Medical debt has its own law: the CFPB finalized a rule to keep it off credit reports in January 2025 and a court vacated it in July 2025, the three national credit bureaus stopped reporting most of it on their own, and more than a dozen states ban reporting it. Nonprofit hospitals have IRS rules on collection actions, and any third-party collector is under the FDCPA. This chapter covers patient responsibility, estimates, the No Surprises Act, price transparency, statements, payment plans, medical debt and credit reporting, and collections. It extends `patient_statements`, `payments`, `ledger_entries` and `guarantors` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). Taking the payment itself (cards on file, text-to-pay, HSA cards, financing) is Part 5's [Payments in the Practice](/books/health-tech/patient-payments) chapter and the Payments volume's [Healthcare](/books/payments/payments-by-vertical#healthcare) section.

## How the Platforms Do It

As of October 2026, from regulators' pages and published rules:

| Rule or program | Who it binds | What it requires | Status |
| --- | --- | --- | --- |
| **Good faith estimates (45 CFR 149.610)** | Providers and facilities scheduling or asked about care for uninsured or self-pay patients | An itemized estimate within 1 or 3 business days, kept 6 years | In effect |
| **Patient-provider dispute resolution (45 CFR 149.620)** | Same | A dispute when the bill is "at least $400 more" than the estimate, started within 120 days of the bill | In effect |
| **Advanced explanation of benefits** | Plans and providers, for insured patients | An estimate from the plan before scheduled care | Not implemented; no final rule as of October 2026 |
| **Hospital price transparency (45 CFR Part 180)** | Hospitals | A machine-readable file of standard charges and a shoppable services list or estimator; new allowed-amount statistics from 2026 | In effect; civil penalties up to $5,500 a day |
| **Transparency in Coverage (CMS-9882-F)** | Group health plans and issuers | Machine-readable files of negotiated rates and allowed amounts; a self-service cost tool | Updated rule finalized October 5, 2026 |
| **CFPB medical debt rule** | Credit bureaus and lenders | Would have removed medical bills from credit reports | Vacated July 11, 2025 |
| **State medical debt reporting laws** | Providers, collectors, bureaus in the state | Bans or limits on reporting medical debt | 15 states and DC per NCLC's tracker, updated September 21, 2026 |
| **IRS section 501(r)(6)** | Nonprofit hospitals | No extraordinary collection actions for 120 days after the first post-discharge bill; financial assistance applications accepted for 240 days | In effect |

Three patterns:

- **Estimates became law for the uninsured, not yet for the insured.** The good faith estimate is enforceable and disputable; the insured patient's equivalent (the advanced EOB) has waited years for a rule.
- **Price data is public, at scale.** Hospitals and plans publish files of prices and rates that are enormous, and the 2026 rules push them toward data patients and researchers can use.
- **Medical debt is being taken out of credit.** Voluntarily by the bureaus, by statute in many states, and briefly by federal rule, which changes what a practice or its collector may do with an unpaid balance.

## Patient Responsibility

What the patient owes comes from three places, and a statement should show which:

- **The payer's adjudication.** Deductible, coinsurance and copay are what the 835 assigns to the patient as patient responsibility (group code `PR`, reasons `1`, `2` and `3`), and for an in-network payer the practice may not bill more than that; the contractual adjustment (`CO`) is never the patient's ([CARC, RARC and Group Codes](/books/health-tech/remittance-and-payment-posting#carc-rarc-and-group-codes)).
- **Non-covered services the patient agreed to.** A service the plan excludes, a frequency the plan won't pay, a Medicare service with a signed advance beneficiary notice ([Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation#medical-necessity-ncds-and-lcds)). The agreement is a document the system keeps.
- **Self-pay.** No insurance, or a patient who chose not to use it, at the practice's self-pay price.

Timing matters as much as amount. Collecting the copay at check-in is routine; collecting an estimated coinsurance at the visit, before adjudication, is common in dental and growing in medical, and creates credit balances when the estimate is high. A credit balance belongs to the patient (or, for an overpayment by a payer, to the payer) and has to be refunded, which the system tracks rather than leaving it to sit ([Overpayments](/books/health-tech/denials-and-appeals#overpayments-the-60-day-rule)).

## Estimates

A practice estimates for two audiences:

- **Insured patients,** from the plan's benefits: the contracted rate (or the practice's fee where there's no contract), the remaining deductible from the 271, coinsurance by category, frequency limits and downgrades for dental, and out-of-pocket maximum. Dental offices estimate almost every treatment plan this way, and the estimate is the case acceptance conversation ([Dental Benefits](/books/health-tech/eligibility-and-benefits#dental-benefits)); the insurance estimate records belong to Part 5's [Dental Practice](/books/health-tech/dental-practice#insurance-estimation) chapter, and this chapter builds the good faith estimate.
- **Uninsured and self-pay patients,** where the estimate is a legal document under the No Surprises Act.

An estimate stores its inputs (the eligibility check, plan rules, contract rates and versions used) so that, when the final bill differs, the practice can show why: a deductible met by another provider in between, a procedure that changed during treatment, a downgrade the payer applied.

## The No Surprises Act

The No Surprises Act (part of the Consolidated Appropriations Act, 2021) is best known for ending surprise out-of-network bills for emergency care and certain facility care, settled between plans and providers through independent dispute resolution. For most practices, its daily obligation is the good faith estimate.

**Good faith estimates for uninsured and self-pay patients (45 CFR 149.610).** When such a patient schedules care, or asks for an estimate, the provider must give one:

- **Timing.** For care scheduled at least 3 business days ahead, "Not later than 1 business day after the date of scheduling"; for care scheduled at least 10 business days ahead, within 3 business days; and within 3 business days of a request. A convening provider must ask co-providers for their parts within 1 business day, and an updated estimate is due no later than 1 business day before the service if things change.
- **Contents.** The patient's name and date of birth; a plain-language description of the primary service and its date; an itemized list of expected items and services, grouped by provider, with diagnosis codes, service codes and expected charges; each provider's name, NPI, TIN and location; items that need separate scheduling; and disclaimers that more services may be recommended, that the estimate isn't a guarantee or a contract, and that the patient may dispute a bill substantially higher.
- **Retention.** The estimate is part of the medical record, and the patient can ask for a copy of any estimate "furnished within the last 6 years."

**Patient-provider dispute resolution (45 CFR 149.620).** If the bill's total exceeds the estimate by "at least $400 more than the total amount of expected charges," the patient may start a dispute, postmarked "within 120 calendar days of receiving the initial bill," paying an administrative fee set by guidance; a provider that loses refunds the fee through a reduction. The software consequence: every self-pay bill is compared with its estimate, by provider, and a bill that crosses the threshold is a risk the practice sees before the patient does.

**Insured patients.** The statute also requires plans to send an advanced explanation of benefits and providers to send estimates to plans for insured patients. As of October 2026 that hasn't been implemented: the departments and OPM deferred enforcement of the insured good faith estimate and AEOB requirements pending rulemaking, CMS's April 2024 progress report describes the proposed rules as still in development (with data exchange standards such as HL7 Da Vinci Patient Cost Transparency still maturing), and the Federal Register shows no proposed or final AEOB rule since the September 16, 2022 request for information. A system built now should keep the estimate's data in a shape a plan could receive (codes, NPIs, expected charges) so the change is a transport, not a redesign.

## Price Transparency

Two federal regimes publish prices, and practices meet them mostly as data:

**Hospital price transparency (45 CFR Part 180).** Hospitals publish a machine-readable file of standard charges (gross charges, discounted cash prices, payer-specific negotiated rates, minimums and maximums) and a list of shoppable services or a price estimator. The 2026 outpatient payment rule, finalized November 21, 2025, added from January 1, 2026 (with enforcement of the new items from April 1, 2026) the median and the 10th and 90th percentile allowed amounts with a count, calculated from the hospital's 835 remittance data over a 12 to 15 month lookback, an attestation by a named senior official, and Type 2 NPIs. Civil penalties scale with size: $300 a day for hospitals with 30 or fewer beds, $10 per bed per day for 31 to 550 beds, and $5,500 a day above 550, adjusted annually (45 CFR 180.90). The detail of hospital obligations is Part 6's [Hospitals & Health Systems](/books/health-tech/hospitals-and-health-systems#hospital-price-transparency) chapter; the point for builders is that the 835 data of [Remittance & Posting](/books/health-tech/remittance-and-payment-posting) now feeds a public file.

**Transparency in Coverage.** Health plans publish machine-readable files of in-network negotiated rates, out-of-network allowed amounts and prescription drug prices, and offer members a cost estimator. The update finalized October 5, 2026 (CMS-9882-F) moves rate and allowed-amount files to quarterly "rather than monthly," requires one in-network file per provider network with a network identifier, adds utilization and taxonomy files, and lowers the out-of-network claims threshold from 20 to 11; file changes apply five months after publication and self-service tool changes for plan years beginning on or after January 1, 2027. The payer side is Part 7's [Inside a Payer](/books/health-tech/payer-operations#transparency-in-coverage-files) chapter.

For a practice, these files are a source: a self-pay price can be checked against local hospitals' cash prices, and a negotiated rate a payer publishes can be compared with what it pays ([Underpayments and Contracts](/books/health-tech/denials-and-appeals#underpayments-and-contracts)).

## Statements

A patient statement is a bill and an explanation. What a good one carries:

- **Per visit, per line:** date, provider, a plain-language service description, charge, what insurance paid, adjustments, and what the patient owes, with the payer's reason for patient responsibility in words ("applied to your deductible").
- **The balance and what's due now,** with payments and credits since the last statement.
- **How to pay** (a link, phone, mail) and **how to ask** (a billing contact, a payment plan, financial assistance where the practice has a policy).
- **Nothing that discloses more than needed.** The guarantor may not be the patient (a parent, a spouse, a pet's owner), and a statement mailed or texted to a guarantor shows the minimum: no diagnosis codes, careful service descriptions, especially for sensitive services covered by the state rules of Part 3's [State Health Privacy & Sensitive Data](/books/health-tech/state-health-privacy) chapter.

**Cadence.** Practices send a first statement after adjudication and then on a cycle (often every 30 days), escalating in tone, with a final notice before any collection action. Electronic statements (email and text with a link to a payment page) are cheaper and paid faster than paper; the texting rules are Part 5's [Two-Way Texting & Messaging](/books/health-tech/patient-texting) chapter and the playbook's [Consumer Contact](/docs/compliance/consumer-contact#tcpa-consent). Each statement is a record: what was sent, to whom, by which channel, and the balance on it, because a collection action later depends on the notices sent.

**Hold until adjudicated.** A statement for a balance still pending with insurance confuses patients and generates calls. The rule: bill the patient for a line only after the payer has adjudicated it (or after a stated period with no response, with the patient told why).

## Payment Plans

A payment plan is the practice's agreement to take a balance in installments, usually without interest: a schedule, an amount, a card or bank account on file, and the consent to charge it. The mechanics (merchant-initiated charges against a balance, capped amounts, stopping when the balance clears) are the Payments volume's [Balances After Insurance, Plans and Financing](/books/payments/payments-by-vertical#balances-after-insurance-plans-and-financing); the health care specifics:

- **The plan is against a balance that can change.** A late insurance payment or an adjustment reduces the balance, and the plan recomputes its remaining installments; it never overcharges.
- **New charges don't join automatically.** A new visit's balance is added to the plan only with the patient's agreement.
- **A plan is the practice's receivable;** third-party financing (a medical credit card or loan) is the lender's, with its own law, and the two are kept apart in the ledger and the patient's view. The credit products themselves are covered in Banking & Lending's [Credit Cards](/books/banking-and-lending/credit-cards) and [Installment Loans](/books/banking-and-lending/installment-loans).
- **Missed payments follow the statement cadence,** not instant collection.

## Medical Debt and Credit Reporting

Unpaid medical bills have been treated differently from other debt by the credit system since 2022:

- **The bureaus' voluntary changes.** Equifax, Experian and TransUnion announced on March 18, 2022 that from July 1, 2022 paid medical collections would no longer appear on credit reports and unpaid ones would wait one year (up from six months) before appearing, and on April 11, 2023 they announced that medical collections with an initial reported balance under $500 had been removed. The CFPB measured the effect: the share of consumers with a medical collection on their credit record fell from about 14% in March 2022 to about 5% in June 2023.
- **The CFPB rule.** The CFPB finalized a rule on January 7, 2025 to remove medical bills from credit reports and bar lenders from using medical information in most credit decisions. On July 11, 2025 the U.S. District Court for the Eastern District of Texas vacated it, in *Cornerstone Credit Union League and Consumer Data Industry Association v. CFPB* (No. 4:25-cv-00016), at the joint request of the CFPB and the industry plaintiffs. As of October 2026 there is no federal rule.
- **State laws.** The National Consumer Law Center's tracker, updated September 21, 2026, lists 15 states and DC with laws keeping medical debt off credit reports. Examples: Colorado's HB23-1126 (signed June 5, 2023, effective August 7, 2023); New York's S4907A (signed December 13, 2023, effective immediately); California's SB 1061 (effective January 1, 2025); Minnesota's SF 4097 (effective October 1, 2024); Illinois (effective January 1, 2025); Washington's SB 5480 (effective July 27, 2025); Oregon's SB 605 (effective January 1, 2026); and the District of Columbia (effective August 20, 2026). Many of these laws also limit interest, lawsuits, liens or collection practices on medical debt, so each state is a rule set, not a single flag.

What this means for the system: a practice that places accounts with a collector, or a collector working medical accounts, needs the patient's state on the account and a per-state rule set (reporting allowed or not, waiting periods, interest limits, notices), dated, evaluated before any reporting or placement ([Rules as Data](/docs/architecture/rules-as-data)). The safe default for a small practice is that its software never furnishes medical debt to a credit bureau at all.

## Collections

A balance that statements and reminders don't collect goes one of three ways: write-off as bad debt, an internal final notice and payment plan offer, or placement with a collection agency. The federal law of third-party collection (the Fair Debt Collection Practices Act and Regulation F: validation notices, call frequency limits, inconvenient times, opt-outs, no credit reporting before contacting the consumer) is covered in Field Operations' [Collection Agencies and the Law](/books/field-operations/collections-and-retention#collection-agencies-and-the-law); medical debt is consumer debt and the same rules apply, with the state medical debt laws above on top. Three health care additions:

- **Nonprofit hospitals and section 501(r).** A tax-exempt hospital may not take "extraordinary collection actions" (selling the debt, reporting it to a bureau, deferring care because of past bills, liens, lawsuits, garnishment) for 120 days after the first post-discharge bill, must accept financial assistance applications for 240 days, and must give written notice at least 30 days before starting them. Hospital billing systems encode these as hard stops.
- **HIPAA still applies.** Disclosing PHI to a collection agency for payment is permitted, and the agency is a business associate; the placement file carries the minimum necessary (balance, dates, contact, not diagnoses) ([The Business Associate Agreement](/docs/compliance/hipaa#the-business-associate-agreement)).
- **Insurance first.** A balance that should have been billed to a payer (a missing secondary, a denial that could be appealed) isn't the patient's debt yet; placement checks that every coverage has been worked.

## How to Build It

The core `patient_statements`, `payments`, `ledger_entries` and `guarantors` hold the patient's money. This chapter adds good faith estimates, statement detail, payment plans, collection placements and the state rules that gate them:

```sql
CREATE TABLE good_faith_estimates (      -- No Surprises Act estimates for uninsured and self-pay patients
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),   -- the convening provider
  patient_id         UUID NOT NULL REFERENCES patients (id),
  kind               TEXT NOT NULL CHECK (kind IN ('uninsured', 'self_pay')),
  appointment_id     UUID REFERENCES appointments (id),
  scheduled_on       DATE,                  -- when the care was scheduled or the estimate requested
  service_date       DATE,
  due_by             DATE NOT NULL,         -- 1 or 3 business days for a GFE, computed and stored
  delivered_at       TIMESTAMPTZ,
  delivered_via      TEXT,
  total_expected     BIGINT NOT NULL,
  inputs             JSONB NOT NULL,        -- fee schedule and service versions used
  document_id        UUID REFERENCES documents (id),  -- the estimate as given, kept 6 years
  supersedes_id      UUID REFERENCES good_faith_estimates (id)
);

CREATE TABLE estimate_lines (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  estimate_id        UUID NOT NULL REFERENCES good_faith_estimates (id),
  provider_org_id    UUID NOT NULL REFERENCES organizations (id),  -- co-providers too
  provider_npi       TEXT NOT NULL,
  provider_tin       TEXT,
  procedure_code     TEXT NOT NULL,
  diagnosis_codes    TEXT[] NOT NULL DEFAULT '{}',
  quantity           NUMERIC NOT NULL DEFAULT 1,
  expected_charge    BIGINT NOT NULL
);

ALTER TABLE patient_statements           -- guarantor, balance_due, delivery, document and status are core
  ADD COLUMN sequence          SMALLINT NOT NULL,          -- first, second, final notice
  ADD COLUMN pending_insurance BIGINT NOT NULL DEFAULT 0,  -- shown, not billed
  ADD COLUMN entry_ids         UUID[] NOT NULL,            -- the ledger entries that make the balance
  ADD COLUMN sent_at           TIMESTAMPTZ;

CREATE TABLE payment_plans (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  guarantor_id       UUID NOT NULL REFERENCES guarantors (id),
  covered_entries    UUID[] NOT NULL,       -- the ledger balances the plan covers, agreed
  original_balance   BIGINT NOT NULL,
  installment        BIGINT NOT NULL,
  cadence            TEXT NOT NULL CHECK (cadence IN ('weekly', 'biweekly', 'monthly')),
  next_charge_on     DATE,
  credential_ref     TEXT,                  -- the stored payment method in the payments model
  consent_doc_id     UUID NOT NULL REFERENCES documents (id),
  status             TEXT NOT NULL CHECK (status IN ('active', 'paid', 'missed', 'cancelled',
                       'defaulted'))
);

CREATE TABLE medical_debt_rules (        -- per-state limits on reporting and collection, dated
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction       TEXT NOT NULL,         -- 'US-CO', 'US-NY'
  credit_reporting   TEXT NOT NULL CHECK (credit_reporting IN ('prohibited', 'limited', 'allowed')),
  min_days_before_placement SMALLINT,
  interest_cap       NUMERIC(5,4),
  notices_required   TEXT[],
  citation           TEXT NOT NULL,
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE collection_placements (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  guarantor_id       UUID NOT NULL REFERENCES guarantors (id),
  agency_org_id      UUID NOT NULL REFERENCES organizations (id),   -- a business associate
  balance            BIGINT NOT NULL,
  itemization        JSONB NOT NULL,        -- for the agency's validation notice
  rule_id            UUID NOT NULL REFERENCES medical_debt_rules (id),  -- the rule that allowed it
  insurance_exhausted BOOLEAN NOT NULL,     -- every coverage worked
  placed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recalled_at        TIMESTAMPTZ,
  stop_reason        TEXT                   -- dispute, bankruptcy, payment, financial assistance
);
```

A self-pay bill is checked against its estimate before it goes out:

```sql
SELECT e.id, el.provider_org_id, SUM(el.expected_charge) AS expected, b.billed,
       b.billed - SUM(el.expected_charge) AS over
FROM good_faith_estimates e
JOIN estimate_lines el ON el.estimate_id = e.id
JOIN LATERAL (
  SELECT SUM(le.amount) AS billed
  FROM ledger_entries le
  JOIN charges ch ON ch.id = le.charge_id
  WHERE le.patient_id = e.patient_id
    AND le.kind = 'charge'
    AND ch.service_on = e.service_date
    AND le.organization_id = el.provider_org_id
) b ON TRUE
WHERE e.id = $1
GROUP BY e.id, el.provider_org_id, b.billed
HAVING b.billed - SUM(el.expected_charge) >= 40000;   -- $400: dispute-eligible
```

Design notes:

- **Estimates are documents with inputs.** The rendered estimate is kept as given (six years for a GFE), and the inputs explain any later difference.
- **Statements are generated from the ledger,** not written; a statement shows exactly the entries that produced its balance, including what's still pending with insurance.
- **Every collection step checks the rules first:** the state rule in effect, 501(r) timing for nonprofit hospitals, insurance exhausted, no open dispute, no bankruptcy stop, as one gate every path calls (the single stop flag of [Collection Agencies and the Law](/books/field-operations/collections-and-retention#collection-agencies-and-the-law)).
- **The guarantor sees the minimum.** Statement rendering takes the recipient into account, and sensitive services are described generically.

## Auditing

- **Every estimate,** its delivery time against its due time, its inputs and its document, for six years.
- **Every statement sent:** channel, recipient, balance and content, since collection rights depend on notices.
- **Every placement and recall,** with the rule version that allowed it and the evidence that insurance was exhausted.
- **Disputes** (patient-provider dispute resolution, billing complaints) and their outcomes.
- **Credit reporting:** ideally none; if any, each furnishing with the state rule that permitted it.

## What This Means for the System You Build

- **Show patients where their number came from:** payer adjudication, agreed non-covered services, or self-pay, line by line in plain language.
- **Generate good faith estimates on the clock:** 1 or 3 business days, itemized by provider with NPIs and codes, kept six years, and compare every self-pay bill with its estimate against the $400 threshold.
- **Keep estimate data plan-ready** for the insured-patient estimate rules still to come.
- **Bill patients only for adjudicated lines,** on a cadence, with each statement recorded.
- **Run payment plans against a changing balance,** never overcharging, separate from third-party financing.
- **Encode medical debt law by state,** dated, and default to never reporting medical debt to credit bureaus.
- **Gate every collection action** on state rules, 501(r) timing, insurance exhausted, disputes and bankruptcy, through one check.

## References

**Regulations**

- [45 CFR 149.610: Good faith estimates for uninsured or self-pay individuals](https://www.law.cornell.edu/cfr/text/45/149.610), timing, contents, retention
- [CMS: Progress toward AEOB rulemaking and implementation (April 23, 2024)](https://www.cms.gov/files/document/progress-aeob-rulemaking-implementation.pdf), enforcement deferred pending rulemaking, proposed rules in development, Da Vinci Patient Cost Transparency
- [Federal Register: Request for information on AEOB and good faith estimates for covered individuals (September 16, 2022)](https://www.federalregister.gov/documents/2022/09/16/2022-19798/request-for-information-advanced-explanation-of-benefits-and-good-faith-estimate-for-covered), still the only AEOB-specific rulemaking document in the Federal Register as of October 2026
- [45 CFR 149.620: Patient-provider dispute resolution](https://www.law.cornell.edu/cfr/text/45/149.620), the $400 threshold, 120 days, the administrative fee
- [CMS: CY 2026 OPPS final rule, hospital price transparency changes](https://www.cms.gov/newsroom/fact-sheets/cy-2026-opps-ambulatory-surgical-center-final-rule-hospital-price-transparency-policy-changes), allowed amount statistics from 835 data, attestation, dates
- [45 CFR 180.90: Civil monetary penalties](https://www.law.cornell.edu/cfr/text/45/180.90), penalty amounts by bed count
- [CMS: Transparency in Coverage final rules (CMS-9882-F)](https://www.cms.gov/newsroom/fact-sheets/transparency-coverage-final-rules-cms-9882-f), quarterly files, network files, new files, dates
- [IRS: Billing and collections, section 501(r)(6)](https://www.irs.gov/charities-non-profits/billing-and-collections-section-501r6), extraordinary collection actions, the 120 and 240 day periods, notices

**Medical debt**

- [CFPB: Rule to remove medical bills from credit reports (January 7, 2025)](https://www.consumerfinance.gov/archive/newsroom/cfpb-finalizes-rule-to-remove-medical-bills-from-credit-reports/), the finalized rule
- [NCLC: Cornerstone Credit Union League v. CFPB](https://www.nclc.org/resources/cornerstone-credit-union-league-et-al-v-cfpb-et-al/), the July 11, 2025 vacatur and case number
- [NCLC: Keeping medical debt off credit reports](https://library.nclc.org/article/latest-keeping-medical-debt-out-credit-reports), state laws and dates, updated September 21, 2026
- [Colorado General Assembly: HB23-1126](https://leg.colorado.gov/bills/hb23-1126), Colorado's medical debt credit reporting law
- [New York State Senate: S4907A (2023)](https://www.nysenate.gov/legislation/bills/2023/S4907), New York's medical debt credit reporting law
- [Experian: Equifax, Experian and TransUnion support U.S. consumers with changes to medical collection debt reporting](https://www.experianplc.com/newsroom/press-releases/2022/equifax-experian-and-transunion-support-us-consumers-with-changes-to-medical-collection-debt-reporting), March 18, 2022, paid collections and the one-year delay from July 1, 2022
- [Equifax: Equifax, Experian and TransUnion remove medical collections debt under $500](https://investor.equifax.com/news-events/press-releases/detail/1286/equifax-experian-and-transunion-remove-medical-collections), April 11, 2023
- [CFPB: Recent changes in medical collections on consumer credit records (March 2024)](https://files.consumerfinance.gov/f/documents/cfpb_recent-changes-medical-collections-on-consumer-credit-reports_2024-03.pdf), the share with a medical collection falling from about 14% to about 5%
