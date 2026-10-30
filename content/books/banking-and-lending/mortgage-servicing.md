+++
title = "Mortgage Servicing, Escrow & Loss Mitigation"
nav_title = "Mortgage Servicing"
description = "Servicing a mortgage under Regulation X: escrow analysis, error and request clocks, early intervention, loss mitigation, forbearance, foreclosure and MSRs."
category = "Banking & Lending Industry"
order = 2452
part = "Servicing and Collections"
tags = ["banking", "lending", "mortgage-servicing", "escrow", "loss-mitigation", "regulation-x", "foreclosure"]
+++

A mortgage servicer runs a thirty-year relationship it usually didn't originate and doesn't own. It collects the payment, pays the borrower's property taxes and insurance out of an escrow account, sends a statement every month, answers errors and requests on deadlines, reaches out when a payment is missed, evaluates the borrower for every option the loan's owner allows before foreclosure, and reports to that owner (most often Fannie Mae, Freddie Mac or a Ginnie Mae pool) on the owner's terms. After 2008 the CFPB wrote most of that into Regulation X and Regulation Z as clocks, and a mortgage servicing system is now largely a scheduler of legal deadlines around a loan ledger.

This chapter covers who services mortgages, the Regulation X obligations and the small servicer exemption, escrow with a worked analysis, force-placed insurance, periodic statements, notices of error and information requests, early intervention and continuity of contact, loss mitigation with a worked timeline, forbearance, foreclosure timelines and servicemember protections, and mortgage servicing rights. The payment ledger, allocation and transfers are in [Loan Servicing](/books/banking-and-lending/loan-servicing); the products are in [Mortgages & Home Equity](/books/banking-and-lending/mortgages); the agencies' delivery and pooling are in [The Secondary Mortgage Market](/books/banking-and-lending/secondary-mortgage-market).

## How the Platforms Do It

As of October 2026, from filings, regulations and vendor pages:

| Who | Role | What the public record says |
| --- | --- | --- |
| **Rocket** (with Mr. Cooper) | Originator, servicer and subservicer | $2.0 trillion of unpaid principal, 9.1 million loans at June 30, 2026; MSRs at fair value of $18.9 billion; second-quarter 2026 servicing fee income of $1,066 million; sold $53 billion of servicing for $795 million and kept subservicing on about 80% |
| **UWM** | Wholesale originator that keeps servicing rights | $240.8 billion servicing portfolio at December 31, 2025, MSRs of $4.07 billion at fair value, $724.7 million of 2025 servicing income; uses third-party subservicers while it brings servicing in-house |
| **ICE MSP** | Servicing system of record | First liens and home equity on one system, with a default suite for loss mitigation, bankruptcy and foreclosure |
| **Fannie Mae Servicing Guide** | The investor's rulebook | Allowable foreclosure time frames by state, measured from the due date of the last paid installment to the sale, with compensatory fees for unexplained delays |
| **Small servicers** | Community banks and credit unions servicing their own loans | Exempt from much of Regulation X's servicing subpart if they service 5,000 or fewer mortgages, all of which they or an affiliate own or originated |

Two observations. **Servicing is a scale business with a valuable asset attached.** UWM's servicing income was about 30 basis points of its year-end portfolio (my arithmetic), and the right to that fee is carried as an asset that rose and fell by $1.06 billion in UWM's 2025 fair value marks. **The work and the asset are separable.** Rocket selling servicing rights while keeping the subservicing, and UWM owning servicing rights while subservicers do the work, are the same split: the system has to know who owns the right, who does the servicing, and whose rules apply.

## The Servicer's Obligations

Regulation X's servicing subpart (12 CFR 1024.30 to 1024.41) and Regulation Z's mortgage servicing sections set the clocks. The map:

| Obligation | Rule | Clock |
| --- | --- | --- |
| Escrow accounts | 1024.17 | Annual analysis; statement within 30 days of the computation year's end; surplus of $50 or more refunded within 30 days |
| Servicing transfers | 1024.33 | 15 days' notice; 60 days in which a payment to the old servicer isn't late |
| Errors | 1024.35 | Acknowledge in 5 business days; resolve in 30 (extendable by 15), 7 for payoff errors, before the sale for foreclosure errors |
| Information requests | 1024.36 | Acknowledge in 5 business days; 10 for the owner's identity; 30 otherwise (extendable by 15) |
| Force-placed insurance | 1024.37 | Notices 45 and 15 days before charging; cancel and refund within 15 days of proof of coverage |
| General servicing policies | 1024.38 | Policies and procedures to meet the objectives |
| Early intervention | 1024.39 | Live contact by day 36 of delinquency; written notice by day 45 |
| Continuity of contact | 1024.40 | Personnel assigned by day 45 |
| Loss mitigation | 1024.41 | No first foreclosure filing until more than 120 days delinquent; 5 business days to acknowledge, 30 days to evaluate |
| Payment crediting, payoffs | 1026.36(c) | Credit as of receipt; payoff statement within 7 business days |
| Periodic statements | 1026.41 | Each billing cycle, with delinquency information after 45 days |

**Small servicers.** A servicer that, with affiliates, services 5,000 or fewer mortgage loans, all owned or originated by it or an affiliate, is a small servicer (1026.41(e)(4)). Sections 1024.38 to 1024.41 don't apply to it, except that 1024.41(j) still bars it from a first foreclosure filing until the loan is more than 120 days delinquent, and from foreclosing while the borrower performs under a loss mitigation agreement (1024.30(b), 1024.41(j)). The escrow, transfer, error, request and force-placed insurance rules still apply. The exemption is a property of the servicer and its whole portfolio, so a system serving several institutions computes it per institution.

## Escrow

Most mortgages escrow property taxes and hazard insurance: the borrower pays a monthly share with each payment, and the servicer pays the bills when due. Regulation X sets the arithmetic (12 CFR 1024.17):

- **The cushion** may be no more than one-sixth of the estimated total annual disbursements, about two months' worth.
- **Aggregate accounting.** The servicer projects the account month by month across the coming year and sets the monthly payment so the lowest projected balance equals the cushion, rather than computing each item separately.
- **The annual analysis** at the end of each computation year compares what happened with what was projected and produces one of three outcomes. A **surplus** of $50 or more must be refunded within 30 days of the analysis if the borrower is current; less may be refunded or credited to next year. A **shortage** (the projected low point falls below the cushion) of less than one month's escrow payment may be left, collected within 30 days, or spread over at least 12 months; one month or more may be left or spread over at least 12 months. A **deficiency** (an actual negative balance) may be collected over two or more months.
- **Statements.** An initial escrow statement at settlement or within 45 days, and an annual statement within 30 days of the computation year's end.
- **Paying on time.** The servicer must pay each disbursement by its penalty deadline as long as the borrower's payment is not more than 30 days overdue, advancing its own funds if the escrow account is short (1024.17(k)(1)).

## Worked Numbers: An Escrow Analysis

My numbers. A loan escrows a property tax bill of $4,800 a year and a homeowner's premium of $1,800, so annual disbursements are $6,600, the monthly escrow payment is $550, and the cushion may be at most $6,600 / 6 = **$1,100**.

At the year's analysis, the county has raised the tax to $5,400 and the insurer the premium to $2,040, so next year's disbursements are $7,440, the monthly base payment rises to **$620**, and the maximum cushion to $1,240. The tax increase also hit the current year's second installment, so the projection now shows the account's low point $480 short of the new cushion.

- **Shortage under one month's payment.** $480 is less than $620, so the servicer may leave it, ask for it within 30 days, or spread it over at least 12 months. Spread over 12, it adds $40, and the new escrow payment is **$660**.
- **The borrower's view.** Principal and interest are unchanged; the monthly payment rises by $110, of which $70 is the new bills and $40 the catch-up. That's why escrow changes drive more calls than rate changes on fixed-rate loans.
- **The system's view.** The analysis is a stored computation (projected month by month, with the inputs and the low point), it changes the next `schedule_installments` rows' `escrow_due` through a new schedule version, and it changes the autopay debit amount, which triggers Regulation E's notice of a varying amount ([Autopay and Payment Attempts](/books/banking-and-lending/loan-servicing#autopay-and-payment-attempts)).

## Force-Placed Insurance

If the borrower's hazard insurance lapses, the servicer may buy coverage and charge for it, but only after notice: a first written notice at least 45 days before charging, a reminder at least 30 days after the first and at least 15 days before charging, and cancellation with a refund of overlapping premiums within 15 days of receiving evidence of coverage (12 CFR 1024.37). For an escrowed loan, the servicer's renewal of the borrower's own policy under 1024.17(k) isn't force-placed insurance at all, which is why the escrow disbursement schedule and the insurance tracking must read the same records.

## Periodic Statements

Each billing cycle the servicer sends a statement with the amount due shown most prominently, the breakdown of principal, interest and escrow, fees since the last statement, the past payment breakdown with year-to-date totals and amounts in suspense, transaction activity, and account information (principal balance, rate, any prepayment penalty, housing counselor information) (12 CFR 1026.41(d)). After the loan is more than 45 days delinquent, the statement adds the length of the delinquency, the risks, a six-month account history, loss mitigation and foreclosure notices and the amount needed to bring the account current (1026.41(d)(8)). The official commentary treats sending within four days of the close of the courtesy period as generally reasonable. Fixed-rate loans may use a coupon book instead, and small servicers are exempt (1026.41(e)). Interest paid is reported to the borrower and the IRS on Form 1098 ([Tax Reporting: 1099-INT and 1098](/books/banking-and-lending/interest-and-statements#tax-reporting-1099-int-and-1098)).

## Errors and Information Requests

A borrower can send a written notice of error or a request for information to the servicer's designated address, and each starts a clock:

- **Errors** (1024.35) cover failing to accept or correctly apply a payment, failing to credit as of receipt, failing to pay escrow items or refund escrow, fees without a reasonable basis, an inaccurate payoff, inaccurate loss mitigation or foreclosure information, failing to transfer servicing information, a premature first foreclosure filing, a sale in violation of the anti-dual-tracking rule, and "any other error relating to servicing." The servicer acknowledges within five business days and resolves within 30 business days (extendable once by 15 with written notice), within seven business days for payoff balance errors, and before the sale or within 30 days, whichever is earlier, for foreclosure errors. It may not charge a fee or require a payment to respond, and for 60 days after the notice it may not report adverse information to a bureau about the disputed payment.
- **Information requests** (1024.36) are acknowledged within five business days and answered within ten business days for the identity of the loan's owner, within 30 otherwise (extendable by 15).

These are `cases` rows with deadlines in the generic `case_deadlines` table from [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-to-build-it), and the 60-day reporting freeze is a suppression the furnishing run must honor ([Furnishing Credit Data](/books/banking-and-lending/credit-reporting#how-to-build-it)).

## Early Intervention and Continuity of Contact

Delinquency starts the next set of clocks, counted in days after the missed due date (the commentary's example: for a payment due January 1, live contact is due on or before February 6):

- **Live contact by day 36.** The servicer must establish, or make good faith efforts to establish, live contact by the 36th day of delinquency and again within 36 days after each later missed due date (1024.39(a)).
- **Written notice by day 45.** A notice encouraging contact, with assigned personnel's phone number, a description of available loss mitigation options and how to apply, and housing counselor information, by the 45th day and again after each missed due date, but generally not more than once in 180 days (1024.39(b)). Bankruptcy and an FDCPA cease-communication request change the rules: live contact stops, and the written notice may continue only in modified form without a request for payment (1024.39(c), (d)).
- **A point of contact by day 45.** Personnel assigned to the borrower, reachable by phone, able to explain options, application status and foreclosure timing, and able to pull the payment history and documents, until two consecutive on-time payments under a permanent loss mitigation agreement (1024.40).

## Loss Mitigation

Loss mitigation is the servicer's duty to evaluate a delinquent borrower for the alternatives to foreclosure the loan's owner makes available: repayment plans, forbearance, payment deferral, modification, short sale and deed in lieu. Regulation X doesn't require any particular option; it requires a fair process with deadlines (12 CFR 1024.41):

- **Acknowledge.** For an application received 45 or more days before a scheduled sale, the servicer tells the borrower within five business days whether it is complete and, if not, what is missing and by when.
- **Evaluate.** For a complete application received more than 37 days before a sale, the servicer evaluates the borrower for all options available and sends its determination within 30 days, with the reasons for any denial of a modification and the right to appeal.
- **Respond and appeal.** The borrower gets at least 14 days to accept an offer when the application was complete 90 or more days before a sale, or 7 days between 90 and 37; a denied modification may be appealed within 14 days when the application was complete 90 or more days before a sale (or before the first foreclosure filing), and the appeal is decided within 30 (1024.41(h)).
- **The 120-day bar.** No first notice or filing for foreclosure until the loan is more than 120 days delinquent (1024.41(f)(1)).
- **No dual tracking.** A complete application received before the first filing blocks the filing until the borrower is found ineligible (and any appeal is over), rejects every offer, or fails to perform under an agreement (1024.41(f)(2)). A complete application after the first filing but more than 37 days before a sale bars the servicer from moving for judgment or sale, or conducting the sale, on the same conditions (1024.41(g)).
- **Facially complete counts.** Once the borrower supplies what the acknowledgment asked for, the application is treated as complete for the foreclosure protections until the borrower has a chance to fix anything else missing.
- **Short-term options on incomplete applications.** The servicer may offer a short-term forbearance or repayment plan on an incomplete application, and while the borrower performs, it may not make the first filing.
- **Once per delinquency.** The servicer need not repeat the process for a borrower who has been continuously delinquent since a prior complete application it handled correctly (1024.41(i)).

The engineering consequence is that foreclosure referral is a gate, not a step: a referral may be sent to the foreclosure attorney only when the loan is more than 120 days delinquent and no complete or facially complete application, short-term plan or performing agreement blocks it, checked in the same transaction that sends it, and every later step (motion for judgment, sale) re-checks the same conditions. The CFPB's error rule makes a premature filing or sale a covered error the borrower can assert.

## Worked Numbers: A Loss Mitigation Timeline

My example. A borrower misses the payment due **March 1, 2026** and every one after it until a modification. Days are calendar days after the due date unless marked business days; business days skip weekends and federal holidays (Memorial Day, May 25; Juneteenth, June 19).

| Date | Day of delinquency | Event | Rule |
| --- | --- | --- | --- |
| Mon Apr 6 | 36 | Live contact due (and again after each missed due date) | 1024.39(a) |
| Wed Apr 15 | 45 | Written early intervention notice due; point of contact assigned | 1024.39(b), 1024.40 |
| Mon Apr 20 | 50 | Borrower submits an application missing two documents | 1024.41(b) |
| Mon Apr 27 | 57 | Acknowledgment due (5 business days), listing the missing items and a date to provide them | 1024.41(b)(2)(i)(B) |
| Mon May 18 | 78 | Borrower provides the documents: complete application, before any first filing | 1024.41(f)(2) |
| Wed Jun 17 | 108 | Evaluation for all options due (30 days) | 1024.41(c)(1) |
| Mon Jun 29 | 120 | Loan is 120 days delinquent; first filing would otherwise be possible from June 30 | 1024.41(f)(1) |

The servicer decides before the June 17 deadline, and there are two paths:

- **An offer.** The servicer offers a trial period plan on June 12. The borrower has until at least June 26 (14 days, since no sale is scheduled) to accept; she accepts and makes the trial payments; the first filing stays blocked as long as she performs, and the modification becomes permanent with a new `payment_schedules` version.
- **A denial.** The servicer denies a modification on June 12, with reasons. The borrower may appeal through June 26; if she does, the appeal is decided within 30 days of it (by July 26 for an appeal on June 26), and only after a denied appeal (or no appeal and no other option) may the servicer make the first filing, now on a loan more than 120 days delinquent.

Had she sent nothing, the servicer's first filing could have been made on June 30, and a complete application arriving later but more than 37 days before a sale would still have stopped the motion for judgment and the sale while it was evaluated. Each row is a `case_deadlines` row computed when its trigger arrived, and the foreclosure gate reads them.

## Forbearance

Forbearance reduces or suspends payments for a period, with the missed amounts resolved at the end by repayment, deferral to maturity or a modification, under the owner's rules. The CARES Act set the template at scale in 2020: a borrower with a federally backed mortgage and a COVID-19 hardship could get forbearance of up to 180 days, extendable by up to another 180, on request and attestation alone, with "no fees, penalties, or interest beyond the amounts scheduled," and a foreclosure moratorium of at least 60 days from March 18, 2020 (15 U.S.C. 9056). Those pandemic provisions have run their course, but they changed the systems: forbearance became a status on the loan with a start, an end, a reason and an exit plan, the periodic statement and the bureau file had to read it, and the end of forbearance became a scheduled loss mitigation evaluation rather than a surprise delinquency.

## Foreclosure Timelines

When loss mitigation fails, foreclosure follows state law. In judicial states the servicer sues and the court orders the sale; in nonjudicial states a trustee sells under the power of sale in the deed of trust after statutory notices. Judicial foreclosures take longer, and some states add mediation, cure or redemption periods. Investors measure servicers against expected durations: Fannie Mae's Servicing Guide sets a maximum allowable time "between the due date of the LPI [last paid installment] and the completion of the foreclosure sale" for each state, publishes the figures in its Foreclosure Time Frames and Compensatory Fee Allowable Delays Exhibit, and charges compensatory fees when a servicer exceeds them without an allowable reason (bankruptcy, probate, military indulgence, a contested case, loss mitigation review, forbearance). Its own fee examples use 720 days for Florida and 540 for Colorado; I couldn't open the exhibit itself, so treat those as the guide's illustrations rather than the current state figures. <!-- source-gap: fnma-foreclosure-timeframes | missing | the current state-by-state allowable foreclosure time frames after Lender Letter LL-2025-01 | closes with: Fannie Mae's Foreclosure Time Frames and Compensatory Fee Allowable Delays Exhibit (PDF) opened (singlefamily.fanniemae.com returns 403 to fetches and renders only as a PDF viewer) | checked: 2026-10-30 -->

**Servicemembers.** For a mortgage taken out before military service, a sale, foreclosure or seizure for breach during service or within one year after it is invalid without a court order or a written agreement, and knowingly violating that is a crime; a court may also stay the proceedings (50 U.S.C. 3953). Interest on debts incurred before service is capped at 6%, for a mortgage during service and one year after, with the excess forgiven rather than deferred (50 U.S.C. 3937). Every referral and every sale needs a servicemember status check on record, and a bankruptcy filing stops the process under the automatic stay ([Stays: Bankruptcy and the SCRA](/books/banking-and-lending/collections#stays-bankruptcy-and-the-scra)).

## Mortgage Servicing Rights

The right to service a mortgage and collect its fee is an asset, a mortgage servicing right (MSR), recognized when a lender sells a loan and keeps the servicing or buys the right from another servicer. Rocket and UWM both carry MSRs at fair value: the value is the present value of the expected servicing fees and float less the cost to service, and it moves with prepayment expectations, so MSRs gain when rates rise (fewer refinances) and lose when they fall. UWM's $1.06 billion fair value loss in 2025 on a $4.07 billion asset shows the size of the swing. MSRs trade in bulk sales and flow agreements, often with the seller retained as subservicer, which is the servicing transfer of [Loan Servicing](/books/banking-and-lending/loan-servicing#servicing-transfers) at portfolio scale. Agency servicers also advance principal and interest to investors and taxes and insurance to escrow when borrowers don't pay, a liquidity cost [The Secondary Mortgage Market](/books/banking-and-lending/secondary-mortgage-market) covers.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model) and [Loan Servicing](/books/banking-and-lending/loan-servicing#how-to-build-it). A mortgage is a `loans` row with `collateral` of kind `real_property`; its escrow due lives on `schedule_installments.escrow_due` and escrow payments are `payment_allocations` in the `escrow` bucket. Errors, requests and loss mitigation applications are `cases` with `case_deadlines`, so the case kinds grow.

```sql
-- Adds the Regulation X kinds, keeping every kind earlier chapters defined.
ALTER TABLE cases DROP CONSTRAINT cases_kind_check,
  ADD CONSTRAINT cases_kind_check CHECK (kind IN ('reg_e_error', 'reg_cc_claim',
    'billing_error', 'fraud_claim', 'credit_report_dispute', 'legal_process', 'complaint',
    'aml_investigation', 'hardship', 'sanctions_review', 'mca_reconciliation',
    'servicing_error', 'information_request',
    'loss_mitigation'));

CREATE TABLE escrow_accounts (
  account_id           UUID PRIMARY KEY REFERENCES loans (account_id),
  computation_year_starts DATE NOT NULL,      -- the analysis anniversary
  cushion_months       NUMERIC(4, 2) NOT NULL CHECK (cushion_months <= 2),  -- 1/6 of annual
  status               TEXT NOT NULL CHECK (status IN ('active', 'waived', 'closed'))
);

CREATE TABLE escrow_items (                  -- each bill the servicer pays
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES escrow_accounts (account_id),
  kind                 TEXT NOT NULL CHECK (kind IN ('property_tax', 'hazard_insurance',
                         'flood_insurance', 'mortgage_insurance', 'hoa', 'other')),
  payee                TEXT NOT NULL,           -- taxing authority or insurer
  payee_ref            TEXT,                    -- parcel or policy number
  amount               BIGINT NOT NULL,         -- current annual amount
  due_dates            DATE[] NOT NULL,         -- penalty deadlines this year
  force_placed         BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE escrow_analyses (               -- the annual computation, as run
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES escrow_accounts (account_id),
  analyzed_on          DATE NOT NULL,
  projection           JSONB NOT NULL,          -- month-by-month balance, with the low point
  annual_disbursements BIGINT NOT NULL,
  cushion              BIGINT NOT NULL,
  outcome              TEXT NOT NULL CHECK (outcome IN ('balanced', 'surplus', 'shortage', 'deficiency')),
  outcome_amount       BIGINT NOT NULL DEFAULT 0,
  treatment            TEXT CHECK (treatment IN ('refund', 'credit_next_year', 'left',
                         'collect_30_days', 'spread')),
  spread_months        SMALLINT CHECK (spread_months IS NULL OR spread_months >= 12
                         OR outcome = 'deficiency'),
  new_escrow_payment   BIGINT NOT NULL,
  statement_id         UUID REFERENCES disclosures (id),   -- due within 30 days of year end
  schedule_id          UUID REFERENCES payment_schedules (id)  -- the version it produced
);

CREATE TABLE escrow_disbursements (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id              UUID NOT NULL REFERENCES escrow_items (id),
  amount               BIGINT NOT NULL CHECK (amount > 0),
  penalty_deadline     DATE NOT NULL,
  paid_on              DATE,
  advanced             BIGINT NOT NULL DEFAULT 0,   -- servicer funds when escrow was short
  journal_entry_id     UUID REFERENCES journal_entries (id)
);

CREATE TABLE loss_mitigation_applications (  -- detail for a cases row of kind 'loss_mitigation'
  case_id              UUID PRIMARY KEY REFERENCES cases (id),
  account_id           UUID NOT NULL REFERENCES loans (account_id),
  received_at          TIMESTAMPTZ NOT NULL,
  scheduled_sale_at    TIMESTAMPTZ,              -- decides which protections apply
  missing_items        TEXT[] NOT NULL DEFAULT '{}',
  facially_complete_at TIMESTAMPTZ,
  complete_at          TIMESTAMPTZ,
  before_first_filing  BOOLEAN,                  -- set when complete
  status               TEXT NOT NULL CHECK (status IN ('incomplete', 'facially_complete',
                         'complete', 'evaluated', 'appealed', 'closed'))
);

CREATE TABLE loss_mitigation_decisions (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id              UUID NOT NULL REFERENCES loss_mitigation_applications (case_id),
  option               TEXT NOT NULL CHECK (option IN ('repayment_plan', 'forbearance',
                         'deferral', 'trial_modification', 'modification', 'short_sale',
                         'deed_in_lieu')),
  outcome              TEXT NOT NULL CHECK (outcome IN ('offered', 'denied')),
  investor_rule_ref    TEXT NOT NULL,            -- the owner's guideline version applied
  reasons              TEXT[],                   -- for a denied modification
  notice_id            UUID NOT NULL REFERENCES disclosures (id),
  respond_by           DATE,                     -- 14 or 7 days after the offer
  appeal_by            DATE,                     -- 14 days after a modification denial
  borrower_response    TEXT CHECK (borrower_response IN ('accepted', 'rejected', 'no_response',
                         'appealed')),
  decided_at           TIMESTAMPTZ NOT NULL
);

CREATE TABLE foreclosure_referrals (         -- the gate and what passed it
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES loans (account_id),
  step                 TEXT NOT NULL CHECK (step IN ('first_filing', 'motion_for_judgment',
                         'sale_scheduled', 'sale')),
  days_delinquent      INT NOT NULL,
  gate_checks          JSONB NOT NULL,           -- 120 days, open applications, plans, stays, SCRA
  scra_checked_at      TIMESTAMPTZ NOT NULL,
  passed               BOOLEAN NOT NULL,
  attorney_ref         TEXT,
  requested_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (NOT passed OR step <> 'first_filing' OR days_delinquent > 120)
);

CREATE TABLE forbearance_periods (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES loans (account_id),
  reason               TEXT NOT NULL,            -- 'hardship', 'disaster', 'covid_cares', ...
  reduced_payment      BIGINT NOT NULL DEFAULT 0,
  valid_during         DATERANGE NOT NULL,
  exit_evaluation_due  DATE NOT NULL,            -- loss mitigation review before it ends
  exit_option          TEXT CHECK (exit_option IN ('reinstatement', 'repayment_plan',
                         'deferral', 'modification'))
);
```

How it runs:

1. **Delinquency is computed daily** from the oldest unpaid installment's due date, and each threshold (36, 45, 120 days) writes its `case_deadlines` or contact tasks the day the loan crosses it.
2. **Escrow analyses run on the anniversary** and on events that change the bills (a tax notice, a policy renewal), store the projection, and produce a schedule version and an autopay notice.
3. **Every notice is a `disclosures` row,** linked to its case, so "what did the servicer tell her and when" is one query.
4. **The foreclosure gate is a function,** evaluated in the transaction that sends a referral or schedules a sale, recorded in `foreclosure_referrals` with every check it made, whether it passed or not.
5. **Investor rules are data.** The options a loan is evaluated for, and the time frames it is measured against, come from its owner's guide by version, through `loan_roles_history` from [Loan Servicing](/books/banking-and-lending/loan-servicing#how-to-build-it).

## Auditing

Mortgage servicing is examined by the CFPB, state regulators and every investor, and the general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **Every escrow analysis** with its projection, cushion, outcome, treatment and the statement sent, and every disbursement against its penalty deadline.
- **Force-placed insurance notices** and the dates, and any refund after proof of coverage.
- **Every notice of error and information request,** its acknowledgment, response and the deadlines met, and the bureau suppression it caused.
- **Early intervention:** each live contact attempt and each written notice, against the delinquency day.
- **Every loss mitigation application** with its timeline (received, acknowledged, facially complete, complete, evaluated, offer or denial, appeal) and the investor rule applied.
- **Every foreclosure step** with the gate checks that allowed it, including servicemember status.
- **Forbearance periods** and their exit evaluations.

## What This Means for the System You Build

- **Schedule every Regulation X deadline as a stored, computed row** from the event that started it, on the institution's business-day calendar.
- **Compute delinquency daily** from the oldest unpaid installment and drive contacts and notices from it.
- **Treat escrow analysis as a stored computation** that produces a schedule version, a statement and an autopay notice.
- **Make foreclosure referral a gate** that checks the 120-day bar, open applications, plans, stays and servicemember status every time.
- **Keep investor rules as versioned data** attached to the loan's owner.
- **Determine small servicer status per institution** from its whole portfolio, and keep the 120-day bar even when exempt.
- **Value and track servicing rights separately from loans,** with owner, servicer and subservicer as distinct roles.

## References

**Law and regulation**

- [CFPB: Regulation X § 1024.17, escrow accounts](https://www.consumerfinance.gov/rules-policy/regulations/1024/17/), the one-sixth cushion, the annual analysis, surplus, shortage and deficiency treatment, statements and timely disbursements
- [CFPB: Regulation X § 1024.30, scope](https://www.consumerfinance.gov/rules-policy/regulations/1024/30/), the small servicer exemption from 1024.38 to 1024.41 except 1024.41(j)
- [CFPB: Regulation X § 1024.33, mortgage servicing transfers](https://www.consumerfinance.gov/rules-policy/regulations/1024/33/), transfer notices and the 60-day period
- [CFPB: Regulation X § 1024.35, error resolution procedures](https://www.consumerfinance.gov/rules-policy/regulations/1024/35/), covered errors, acknowledgment and response deadlines, no fees and the 60-day reporting restriction
- [CFPB: Regulation X § 1024.36, requests for information](https://www.consumerfinance.gov/rules-policy/regulations/1024/36/), the 5-, 10- and 30-day deadlines and the extension
- [CFPB: Regulation X § 1024.37, force-placed insurance](https://www.consumerfinance.gov/rules-policy/regulations/1024/37/), the 45- and 15-day notices and cancellation within 15 days
- [CFPB: Regulation X § 1024.39, early intervention](https://www.consumerfinance.gov/rules-policy/regulations/1024/39/), live contact by day 36, written notice by day 45, the counting example and the bankruptcy and cease-communication exemptions
- [CFPB: Regulation X § 1024.40, continuity of contact](https://www.consumerfinance.gov/rules-policy/regulations/1024/40/), personnel assigned by day 45 and their functions
- [CFPB: Regulation X § 1024.41, loss mitigation procedures](https://www.consumerfinance.gov/rules-policy/regulations/1024/41/), acknowledgment, evaluation, response and appeal deadlines, the 120-day bar, dual tracking, facially complete applications and small servicers
- [CFPB: Regulation Z § 1026.36, prohibited acts or practices](https://www.consumerfinance.gov/rules-policy/regulations/1026/36/), crediting as of receipt and payoff statements
- [CFPB: Regulation Z § 1026.41, periodic statements for residential mortgage loans](https://www.consumerfinance.gov/rules-policy/regulations/1026/41/), contents, delinquency information, coupon books and the small servicer definition
- [CFPB: Regulation E § 1005.10, preauthorized transfers](https://www.consumerfinance.gov/rules-policy/regulations/1005/10/), notice of varying amounts
- [Cornell LII: 15 U.S.C. 9056, forbearance of residential mortgage loan payments](https://www.law.cornell.edu/uscode/text/15/9056), the CARES Act 180-day periods, no added fees or interest, and the moratorium
- [Cornell LII: 50 U.S.C. 3953, mortgages and trust deeds](https://www.law.cornell.edu/uscode/text/50/3953), the bar on sale or foreclosure during service and one year after without a court order
- [Cornell LII: 50 U.S.C. 3937, maximum rate of interest](https://www.law.cornell.edu/uscode/text/50/3937), the 6% cap and its mortgage period

**Investor guides**

- [Fannie Mae Servicing Guide E-3.2-15: Allowable time frames for completing foreclosure](https://servicing-guide.fanniemae.com/svc/e-3.2-15/allowable-time-frames-completing-foreclosure), measurement from the last paid installment's due date to the sale, the exhibit and allowable delays
- [Fannie Mae Servicing Guide F-2-03: Compensatory fee calculation examples](https://servicing-guide.fanniemae.com/svc/f-2-03/compensatory-fee-calculation-examples), the Florida and Colorado time frames used in the examples

**Filings**

- [Rocket Companies: Second quarter 2026 results (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/0001805284/000180528426000082/rkt-063020268xkex991earnin.htm), servicing portfolio, MSR fair value, servicing fee income, MSR sales and retained subservicing
- [UWM Holdings: Fourth quarter and full year 2025 results](https://investors.uwm.com/news/financial-news/news-details/2026/UWM-Holdings-Corporation-Announces-Fourth-Quarter--Full-Year-2025-Results/default.aspx), servicing portfolio, MSR fair value and its 2025 change, servicing income and subservicers

**Vendor documentation**

- [ICE: MSP mortgage servicing system](https://mortgagetech.ice.com/products/msp-mortgage-servicing-system), first liens and home equity on one system and the default suite
