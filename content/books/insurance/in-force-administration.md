+++
title = "In-Force Administration"
description = "Premium modes, grace, lapse and notices, reinstatement, policy loans, conversions, beneficiary changes, DTCC positions and commissions, and ACORD TXLife."
category = "Insurance Industry"
order = 2762
part = "Life and Annuities"
tags = ["insurance", "life-insurance", "policy-administration", "policy-loans", "dtcc", "acord"]
+++

A life policy spends almost all of its life in force, and in-force administration is most of what a life company's operations do: billing premiums for decades, noticing when they stop, sending the notices the law requires before coverage ends, reinstating policies that lapsed, lending against cash values, converting term to permanent coverage, recording changes of owner and beneficiary, and reporting all of it to the agents and firms that sold the policies. None of it is glamorous, and all of it is where life insurers get sued: a lapse notice sent to the wrong address, a beneficiary change recorded after the death it was meant to precede, a loan that quietly ate the cash value until the policy collapsed. Some of those failures are now written into statute: California, for one, requires a 60-day grace period on life policies and lets owners name a designee to receive lapse notices.

The data shape is the core model's: every change is a `policy_transactions` row with an effective date, producing a new `policy_versions` row, and every financial event writes a [`policy_values`](/books/insurance/life-products#how-to-build-it) row. What life adds is time. Grace periods, reinstatement windows, loan interest anniversaries, conversion deadlines and notice lead times are all clocks set by statute or contract and computed per policy. This chapter covers premium modes and billing, grace and lapse with the notice law, reinstatement, loans, withdrawals, conversions, beneficiary and owner changes, the DTCC feeds to distributors and ACORD TXLife, with the `policy_loans` and `beneficiary_changes` tables. Tax consequences of loans, withdrawals and changes are [Life Insurance & the Tax Code](/books/insurance/life-insurance-and-tax); what happens at death is [Death Claims & Unclaimed Benefits](/books/insurance/death-claims-and-unclaimed-benefits).

## How the Platforms Do It

In-force administration runs on the carrier's policy administration system and the shared plumbing that keeps distributors in sync. What they publish, as of November 2026:

| System or service | Role | What its public material shows |
| --- | --- | --- |
| **DTCC Insurance & Retirement Services** | Data and money exchange between carriers and distributors | In-Force Transactions ("lets distributors submit updates to post-issue policies"), Positions & Valuations (contract details "as a current snapshot"), Financial Activity Reporting (daily transactions), Commissions Schedule Transmittal and Commissions Settlement (same-day), Distributor of Record and Representative Record Changes, Licensing & Appointments, the Insurance Information Exchange (IIEX); 50%+ of the annuity industry, 13,000+ products (Q2 2026) |
| **ACORD TXLife** | The life and annuity XML message standard | A `TXLifeRequest` with a required `TransRefGUID` and `TransType`, effective and execution dates, and the `OLifE` container for the policy and party data (2.20.01) |
| **DXC** | Heritage and modern administration (Cyberlife, Ingenium, Integral, wmA, Assure) | Assure Life & Wealth "modernizes heritage policy administration with API-enabled capabilities" |
| **Equisoft** | equisoft/manage administration and migration | 35+ policy administration clients |
| **Majesco** | Intelligent Core for LA&H | Policy, billing and claims for life, annuity, group and voluntary |
| **Hexure** | FireLight post-issue forms | Carrier forms sorted into new business and customer service |

The patterns: **the carrier's system is the record, and distributors keep copies**, refreshed daily through DTCC positions and activity feeds, so every in-force change has to flow out as data, not just as a letter. **Service requests arrive as forms or messages** (an ACORD transaction, a DTCC in-force request, a FireLight form, a scanned letter), and each needs the same in-good-order check before it changes the policy.

## Premium Modes and Billing

Traditional products bill a **modal premium**: annual, semiannual, quarterly or monthly, with modal factors that make paying more often cost more (the carrier's filed factors cover the lost interest and extra expense). A worked example, mine: a $1,110.00 annual premium with a monthly factor of 0.0875 bills $97.13 a month, $1,165.56 a year, 5.0% more. Monthly premiums are usually collected by **preauthorized draft** from a bank account (rails in [Payments](/books/payments/ach)), sometimes by card; group and worksite policies bill the employer on a **list bill**, one invoice for many policies, paid by payroll deduction.

Universal life has no required premium, only a **planned premium** and whatever keeps the account above the monthly deduction; billing is a reminder, and what drives lapse is the values engine, not the bill. A system that bills both kinds has to keep the difference: a missed traditional premium starts a grace period on the due date; a missed UL planned premium starts nothing, while a UL account that can't cover the next deduction starts a grace period whether or not anything was billed.

## Grace, Lapse and the Notices

Every state requires a grace period, during which the policy stays in force although the premium is unpaid, and the length varies:

| Rule | Grace period | Other terms |
| --- | --- | --- |
| **New York** (Ins. Law 3203(a)(1), (2)) | 31 days after a premium due date (or one month); 61 days for variable-premium policies | Coverage continues; if the insured dies in grace, the insurer may deduct the unpaid premium through the end of the policy month of death |
| **Texas** (Ins. Code 1101.005) | At least one month for each premium after the first | The policy may charge interest on a premium paid in grace and may deduct the overdue premium from the settlement if the insured dies in grace |
| **California** (Ins. Code 10113.71) | At least 60 days from the premium due date, not overlapping paid coverage | A notice of pending lapse is effective only if mailed at least 30 days before termination, by first-class mail within 30 days after the premium is due and unpaid, to the owner, a designee named under 10113.72 and any known assignee; applies to individual and group life |
| **Universal life contracts** (Lincoln Benefit's VUL) | 61 days when net surrender value can't cover the monthly charges | Written notice to the owner |

**Worked numbers: one missed premium, two states.** A monthly premium due Thursday, January 15, 2026 goes unpaid. Under New York's 31 days, the grace period runs through Sunday, February 15, and the policy lapses (or moves to its nonforfeiture option) after it. In California, the grace period runs 60 days, through Monday, March 16, and the insurer's lapse notice is effective only if mailed by Saturday, February 14 (30 days before termination), which is also the 30th day after the due date, so in practice the notice must go out within the first 30 days after the due date and at least 30 days before termination. Both clocks are computed from the due date and stored as tasks with the statute that set them ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

California's designee rule is why the owner record carries more than an address. Under 10113.72 (referenced from 10113.71(b)), an individual policy owner may designate at least one other person to receive lapse notices, so a policy with an elderly owner who stops opening mail doesn't lapse unseen; the designee, the assignee and any person with an interest are recipients of the notice, and the notice to each is a separate `notices` row with its own mailing proof ([Cancellation, Nonrenewal & Notice Law](/books/insurance/cancellation-and-nonrenewal#how-to-build-it) defines `notices` and `notice_rules`).

At the end of grace, the policy's status depends on its kind: a term policy **lapses** with no value; a whole life policy with cash value goes to its **automatic nonforfeiture option** (extended term or reduced paid-up, [Nonforfeiture: Value on Lapse](/books/insurance/life-products#nonforfeiture-value-on-lapse)) or, if the owner elected it, the **automatic premium loan** pays the premium from the cash value; a UL policy lapses when the account can't pay. A loan rate change can't be the sole cause of termination within the policy year it happens (Model #590, 3F).

The policy's status machine, as transitions stored on `policy_transactions` and `policy_values`:

| From | Event | To | Clock or rule |
| --- | --- | --- | --- |
| In force | Premium due and unpaid, or UL account can't cover the deduction | Grace | State grace period; lapse notice task |
| Grace | Premium paid | In force | |
| Grace | Insured dies | Death claim | Unpaid premium deducted from proceeds |
| Grace | Grace expires, term or no value | Lapsed | Notice mailed in time, or termination isn't effective |
| Grace | Grace expires, cash value | Extended term, reduced paid-up, or in force by automatic premium loan | Option elected or default, Model #808 |
| Lapsed or nonforfeiture status | Reinstatement approved | In force | Within the reinstatement period, with evidence and arrears |
| Any in force status | Surrender | Surrendered | Up to six months' deferral |

## Reinstatement

A lapsed policy can usually be reinstated within a period after default. New York's standard provision allows reinstatement within three years from default, unless the cash value was paid or extended term coverage expired, on application, "evidence of insurability" satisfactory to the insurer, payment of overdue premiums with interest at a rate not above 6% a year compounded annually, and repayment or reinstatement of other indebtedness (Ins. Law 3203(a)(10)).

**Worked numbers: reinstating after 18 months.** A whole life policy with a $1,200 annual premium defaults on February 1, 2025 and again misses February 1, 2026; the owner applies to reinstate on August 1, 2026, and the insurer charges the 6% maximum. The 2025 premium is 18 months overdue: 1,200 × 1.06^1.5 = $1,309.60. The 2026 premium is six months overdue: 1,200 × 1.06^0.5 = $1,235.48. Arrears total $2,545.08, plus any loan and its interest. If the policy had moved to extended term in the meantime, reinstatement reverses that status as a transaction effective on the reinstatement date, and the extended term coverage's history stays in the record.

Reinstatement is underwriting again: the insurer may require a health statement or full evidence ([Life Underwriting](/books/insurance/life-underwriting#the-decision-and-its-paper-trail)), and whether statements in the reinstatement application open a new contestable period is a question of the contract and state law that a later death claim has to answer, so the claim needs the reinstatement date and its application, not just the issue date ([The Contestable Period](/books/insurance/death-claims-and-unclaimed-benefits#the-contestable-period)).

## Policy Loans

A permanent policy's cash value is collateral for a **policy loan** the owner can take without credit approval: New York requires the loan right after three full years' premiums (three years for flexible premium policies), up to the loan value, with the policy as sole security (3203(a)(8)). The interest rate is regulated:

- **Fixed rate.** The NAIC's Model Policy Loan Interest Rate Bill (#590) permits a fixed maximum rate of not more than 8% a year (3A(1)); New York's standard provision caps a fixed rate at 7.4% a year paid in advance unless an adjustable rate applies.
- **Adjustable rate.** Up to the higher of Moody's Corporate Bond Yield Average (monthly average corporates) for the calendar month ending two months before the rate is determined, and the rate used to compute cash surrender values plus 1% (3B). The rate is determined at intervals of no more than 12 months and no less than three; it may be raised when the computed rate is at least 0.5% higher, and must be lowered when it is at least 0.5% lower (3D). The insurer notifies the owner of the initial rate when the loan is made and gives reasonable advance notice of any increase (3E).

Unpaid loan interest is added to the loan (3203(a)(8)). **Worked numbers: a loan that compounds.** A $20,000 loan at a fixed 8% accrues $1,600 of interest in the first year; unpaid and capitalized each anniversary, the loan is $25,194.24 after three years. If the cash value is $30,000 and earns less than 8% on the loaned portion, the gap closes every year; when the loan plus interest exceeds the cash surrender value, the policy terminates under its loan provision after the notice the contract and state law require, and on a policy that isn't a modified endowment contract, the extinguished loan in excess of basis becomes taxable income in that year ([Life Insurance & the Tax Code](/books/insurance/life-insurance-and-tax#loans-withdrawals-and-surrenders)).

Universal life handles loans by moving value: Lincoln Benefit's VUL lets the owner borrow up to 90% of surrender value, moves the loaned amount from the subaccounts to a loan account credited 4%, and charges a net loan cost of up to 2% on standard loans and 0% on preferred loans after the surrender charge period. The values engine has to carry the loan account as a holding, accrue interest on both sides, and include the loan balance in the lapse test.

## Withdrawals and Partial Surrenders

Universal life and annuities allow **withdrawals** of account value. On a UL Option A policy, a withdrawal usually reduces the face amount as well, so the net amount at risk doesn't jump; on Option B it reduces the account and therefore the death benefit. Surrender charges may apply to the amount withdrawn, and a reduction in face within the first seven years triggers the 7-pay recomputation and can make the policy a MEC retroactively ([Life Insurance & the Tax Code](/books/insurance/life-insurance-and-tax#the-7-pay-test-and-modified-endowment-contracts)). Withdrawals are where tax, values and contract rules meet, so the request should be quoted first (the values engine computes the net amount, charges, the new face, the tax consequences and any MEC result) and executed only on the owner's confirmation of the quote.

## Conversions

Term policies usually carry a **conversion privilege**: the owner may exchange the term coverage for a permanent policy from the insurer without evidence of insurability, at attained age and the original rate class, before a deadline (an age, or a number of years from issue). A conversion is a transaction pair: the term policy terminates and a new permanent policy issues, linked to it, with the term's issue date carried for contestability and suicide where the contract or the state's replacement rules credit elapsed time (Model #613 requires affiliated replacements to credit elapsed incontestability and suicide periods). Conversion also touches reinsurance: the treaty's conversion terms decide who reinsures the converted policy, so the cession has to follow the link. Group life conversion to an individual policy, with its 31-day window and notice rules, is [Group Life & Disability](/books/insurance/group-life-and-disability#conversion-and-portability).

The system's job is to know, for every term policy, the conversion deadline and the products eligible, to notify the owner before the deadline as a service task, and to issue the converted policy with the links intact.

## Beneficiary and Owner Changes

The **owner** controls the policy; the **beneficiaries** receive the death benefit. Both are `party_roles` on the policy version, with rank (primary, contingent) and shares in basis points ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model)). Changes are transactions, and their effective date is a legal question as much as a data one:

- **Form and good order.** A change is requested in writing (a form, an e-signature, a DTCC in-force transaction), with the owner's signature, the beneficiaries identified (name, relationship, share, per stirpes or per capita), and consents where required: an **irrevocable** beneficiary must consent to any change, a collateral assignee may need to, and community property states may require a spouse's consent. A request that isn't in good order is held, not applied.
- **Effective date.** Whether a change takes effect when the owner signs it or when the insurer records it is a term of the contract form. Where the form makes a recorded change relate back to the signature date (subject to payments made before recording), a change signed on Monday and received Friday, after the insured died on Wednesday, may still govern, so the death claim must be able to see pending changes and their signature dates ([Death Claims & Unclaimed Benefits](/books/insurance/death-claims-and-unclaimed-benefits#who-gets-paid)).
- **Owner changes and assignments.** An **absolute assignment** transfers ownership (which is how a 1035 exchange moves a contract to the new insurer, [Best Interest, Replacements & 1035 Exchanges](/books/insurance/annuity-best-interest#1035-exchanges-and-dtcc-transfers)); a **collateral assignment** gives a lender a claim on proceeds up to its debt while ownership stays put. A transfer of ownership for value can cost the beneficiaries the tax exclusion on the death benefit ([Life Insurance & the Tax Code](/books/insurance/life-insurance-and-tax#death-benefits-and-transfers-for-value)).
- **Designees.** California's lapse notice designee is another role on the policy, maintained by the same change process.

## DTCC Positions and Commissions

Distributors (broker-dealers, banks, IMOs and agencies) need to know what their clients own, and carriers need to pay the producers, so in-force administration has two outbound feeds:

- **Positions and activity.** DTCC's Positions & Valuations delivers each contract's details as a snapshot; Financial Activity Reporting delivers the day's transactions; distributors load them into their own books and advisor tools. The carrier's feed is generated from the same `policy_values` and transaction records the policy owner sees, at a fixed daily cutoff, and a correction to a back-dated value must flow out as a corrected position, not a silent change.
- **Commissions.** Renewal and trail commissions on in-force policies and annuities, computed per policy transaction or per period on asset value, settled through DTCC's Commissions Settlement, with chargebacks on lapse in the first years ([Commissions & Agency Accounting](/books/insurance/commissions-and-agency-accounting#how-to-build-it) defines `commissions` and schedules). DTCC's Commissions Schedule Transmittal shares the schedules themselves.
- **Servicing agent changes.** Distributor of Record and Representative Record Changes move a policy's servicing rights and future trails when an advisor changes firms or retires, which is a producer-of-record transaction on the policy with an effective date.

ACORD's TXLife is the message format under much of this. A `TXLifeRequest` carries a required `TransRefGUID` (the idempotency key) and `TransType`, the transaction's execution and effective dates, optional correlation fields, and the `OLifE` container with the holding, policy and party objects. Inbound service requests (a beneficiary change from a distributor's platform, an address change, a loan request) arrive the same way and are applied through the same in-good-order checks as a paper form, with the `TransRefGUID` stored so a resend doesn't apply twice ([ACORD & Data Standards](/books/insurance/acord-and-data-standards) covers the standards in depth).

## How to Build It

In-force administration extends the core model's `policy_transactions` and [Life Products as Data](/books/insurance/life-products#how-to-build-it)'s `policy_values`. Life events need more kinds than the core's P&C-shaped list, so the transaction gains a life event type alongside its `kind`; the loan and the beneficiary change get their own tables:

```sql
ALTER TABLE policy_transactions
  ADD COLUMN life_event TEXT,
  ADD COLUMN source_message_ref TEXT,      -- ACORD TransRefGUID, DTCC id, form scan id
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT policy_transactions_life_event_check
    CHECK (life_event IN ('premium', 'grace_start', 'lapse',
        'nonforfeiture', 'reinstatement', 'loan', 'loan_repayment', 'withdrawal',
        'face_change', 'option_change', 'rider_change', 'conversion', 'beneficiary_change',
        'owner_change', 'assignment', 'surrender', 'death', 'producer_of_record_change')) NOT VALID;

CREATE TABLE policy_loans (                -- each loan and its interest terms
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  kind               TEXT NOT NULL CHECK (kind IN ('cash', 'automatic_premium',
                       'preferred', 'standard')),
  rate_type          TEXT NOT NULL CHECK (rate_type IN ('fixed', 'adjustable')),
  rate_bp            INT NOT NULL,          -- current rate
  rate_basis         TEXT NOT NULL,         -- 'NAIC590 3A(1) 8%', 'Moody's 2 months prior'
  interest_timing    TEXT NOT NULL CHECK (interest_timing IN ('advance', 'arrears')),
  next_rate_review   DATE,                  -- adjustable: within 12 months, not under 3
  credited_rate_bp   INT,                   -- on the loaned value (UL loan account)
  opened_on          DATE NOT NULL,
  notice_document_id UUID,                  -- initial rate notice
  closed_on          DATE
);

CREATE TABLE policy_loan_entries (         -- principal and interest, never a balance
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  loan_id            UUID NOT NULL REFERENCES policy_loans (id),
  transaction_id     UUID REFERENCES policy_transactions (id),
  kind               TEXT NOT NULL CHECK (kind IN ('advance', 'interest_accrued',
                       'interest_capitalized', 'repayment', 'offset_at_surrender',
                       'offset_at_death', 'offset_at_lapse')),
  amount             BIGINT NOT NULL,       -- signed, minor units
  effective_on       DATE NOT NULL
);

CREATE TABLE beneficiary_changes (         -- requests, with the facts the claim needs
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  requested_by_party_id UUID NOT NULL REFERENCES parties (id),  -- the owner
  signed_at          TIMESTAMPTZ NOT NULL,  -- may govern effectiveness
  received_at        TIMESTAMPTZ NOT NULL,
  channel            TEXT NOT NULL CHECK (channel IN ('paper', 'esign', 'dtcc',
                       'acord', 'portal')),
  designations       JSONB NOT NULL,        -- [{party, rank, share_bp, per_stirpes}]
  consents_required  TEXT[] NOT NULL DEFAULT '{}',  -- 'irrevocable_beneficiary',
                                            -- 'collateral_assignee', 'spouse'
  consents_received  JSONB NOT NULL DEFAULT '{}',
  status             TEXT NOT NULL CHECK (status IN ('received', 'not_in_good_order',
                       'recorded', 'rejected', 'superseded')),
  recorded_at        TIMESTAMPTZ,
  transaction_id     UUID REFERENCES policy_transactions (id)  -- the recorded change
);
```

The loan balance is the sum of its entries as of a date, never a stored number, the same rule as premium. Grace and notice clocks come from a rules table by state and product, and the computation is small:

```go tab="Go"
import "time"

// GraceRule is a row from the state rules table.
type GraceRule struct {
	Days             int  // 31 (NY), 60 (CA); 0 means use Months
	Months           int  // 1 (TX "one month")
	NoticeLeadDays   int  // CA: notice mailed at least 30 days before termination
	NoticeWithinDays int  // CA: mailed within 30 days after the due date
}

// Grace returns the last day of grace and the latest date an effective lapse
// notice may be mailed (zero time if the state sets no notice rule).
func Grace(due time.Time, r GraceRule) (lastDay, noticeBy time.Time) {
	if r.Days > 0 {
		lastDay = due.AddDate(0, 0, r.Days)
	} else {
		lastDay = due.AddDate(0, r.Months, 0)
	}
	if r.NoticeLeadDays > 0 {
		noticeBy = lastDay.AddDate(0, 0, -r.NoticeLeadDays)
		if w := due.AddDate(0, 0, r.NoticeWithinDays); r.NoticeWithinDays > 0 && w.Before(noticeBy) {
			noticeBy = w
		}
	}
	return lastDay, noticeBy
}
```

```rust tab="Rust"
use chrono::{Duration, Months, NaiveDate};

/// A row from the state rules table.
pub struct GraceRule { pub days: i64, pub months: u32, pub notice_lead_days: i64, pub notice_within_days: i64 }

/// Last day of grace, and the latest mailing date for an effective lapse notice.
pub fn grace(due: NaiveDate, r: &GraceRule) -> (NaiveDate, Option<NaiveDate>) {
    let last = if r.days > 0 { due + Duration::days(r.days) }
               else { due.checked_add_months(Months::new(r.months)).expect("valid date") };
    if r.notice_lead_days == 0 {
        return (last, None);
    }
    let mut by = last - Duration::days(r.notice_lead_days);
    if r.notice_within_days > 0 {
        by = by.min(due + Duration::days(r.notice_within_days));
    }
    (last, Some(by))
}
```

For the worked example, New York's rule (31 days) returns February 15, 2026; California's (60 days, 30 lead, 30 within) returns March 16 with a notice deadline of February 14. Whether the "last day" means coverage ends at the end of that day or the start of the next is a policy and state rule, stored with it, because a death at 11 p.m. on the 60th day is exactly the case that gets litigated.

## Auditing

- **Every lapse defensible.** For each lapse, the due date, the grace rule, the notices with recipients (owner, designee, assignee), mailing dates and proof, and the status change, because a lapse without a timely notice is a lapse that didn't happen.
- **Reinstatements.** The application, evidence, arrears computation with the interest rate used, and the new contestable date if one applies.
- **Loans.** Every advance, accrual, capitalization and repayment as entries; rate determinations for adjustable loans with the index value and date; notices of initial rates and increases.
- **Beneficiary changes.** Signature and receipt dates, consents, good-order decisions and recording dates, so a contested claim can be decided on the record.
- **Distributor feeds.** Daily position and activity files as sent, with corrections, and commissions with their schedules and chargebacks.
- **Inbound messages.** Every ACORD or DTCC request with its reference, the response, and the transaction it produced or why it didn't.

## What This Means for the System You Build

- **Compute grace, notice, reinstatement and conversion clocks from rules by state and product,** store them as tasks with their sources, and treat an unproven notice as no notice.
- **Model loans as entries, not balances,** with rate rules, review dates and the lapse test reading the sum.
- **Quote before you execute** withdrawals, face changes and loans, showing values, charges and tax effects.
- **Record beneficiary changes with signature and receipt dates and consents,** and let the death claim see pending changes.
- **Treat inbound service messages and forms the same way:** in-good-order checks, an idempotency key from the message, then a transaction.
- **Generate distributor positions, activity and commissions from the same records the owner sees,** with corrections flowing out as corrections.

## References

**Law and regulation**

- [N.Y. Ins. Law 3203](https://www.nysenate.gov/legislation/laws/ISC/3203), the grace periods, death in grace, loans after three years and the 7.4% fixed rate cap, unpaid interest added to the loan, and reinstatement within three years with interest up to 6%
- [Tex. Ins. Code 1101.005 (Texas Public Law)](https://texas.public.law/statutes/tex._ins._code_section_1101.005), the one-month grace period, interest on premiums paid in grace and deduction from the settlement
- [Cal. Ins. Code 10113.71 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-10113-71/), the 60-day grace period, the 30-day lapse notice and its mailing rules, the designee and assignee recipients, and application to individual and group life

**NAIC**

- [NAIC: Model Policy Loan Interest Rate Bill (#590), April 2000 (PDF)](https://content.naic.org/sites/default/files/model-law-590.pdf), the 8% fixed maximum, the adjustable rate ceiling, the review frequency and 0.5% thresholds, notices, and the rule against termination solely from a rate change
- [NAIC: Standard Nonforfeiture Law for Life Insurance (#808), January 2014 (PDF)](https://content.naic.org/sites/default/files/model-law-808.pdf), nonforfeiture options at the end of grace
- [NAIC: Life Insurance and Annuities Replacement Model Regulation (#613), 2nd Quarter 2015 (PDF)](https://content.naic.org/sites/default/files/model-law-613.pdf), credit for elapsed incontestability and suicide periods on affiliated replacements

**Filings**

- [Lincoln Benefit Life: Consultant VUL prospectus, May 1, 2026 (Form 485BPOS)](https://www.sec.gov/Archives/edgar/data/910475/000162828026025862/consvul485bpos.htm), the 61-day grace period, maximum loan of 90% of surrender value, the 4% loan account credit and net loan costs

**Standards**

- [ACORD TXLife 2.20.01: TXLifeRequest_Type (Liquid Technologies schema mirror)](https://schemas.liquid-technologies.com/Accord/Life%20Standards/2.20.01/txliferequest_type.html), TransRefGUID, TransType, effective and execution dates and the OLifE container

**Vendor documentation**

- [DTCC: Insurance & Retirement Services](https://www.dtcc.com/wealth-management-services/insurance-and-retirement-services), In-Force Transactions, Positions & Valuations, Financial Activity Reporting, Commissions, Distributor of Record and Representative Record Changes, and its Q2 2026 figures
- [DXC: Life and annuity solutions](https://dxc.com/us/en/industries/insurance/life-annuity), Assure Life & Wealth and the heritage administration systems
- [Equisoft](https://www.equisoft.com/), equisoft/manage and its client count
- [Majesco](https://www.majesco.com/), Intelligent Core for LA&H
- [Hexure](https://www.hexure.com/), FireLight and the Carrier Forms Engine
