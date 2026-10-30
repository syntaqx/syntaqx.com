+++
title = "Credit Cards as Credit"
description = "Revolving credit behind the card: balance segments, grace periods, interest methods, minimum payments, CARD Act rules, late fees after the 2025 vacatur, limits."
category = "Banking & Lending Industry"
order = 2433
part = "Lending Products"
tags = ["banking", "lending", "credit-cards", "regulation-z", "card-act", "interest"]
+++

A credit card is two products sharing a piece of plastic. One is a payment instrument: authorization, clearing, interchange and disputes, which the Payments volume covers from the issuer's side in [Card Issuing](/books/payments/card-issuing#credit) and [Issuer Processing](/books/payments/issuer-processing). The other is an open-end loan that the cardholder draws on with every purchase and repays on their own schedule, subject to a minimum. That second product is where the issuer's revenue and its risk live: in August 2026, commercial banks charged an average 22.36% on card accounts that were assessed interest, and in the second quarter of 2026 US banks charged off card balances at an annualized 3.82%. It's also where most of the law is, because the Credit CARD Act of 2009 rewrote how card issuers may price, bill and change terms, and the Consumer Financial Protection Bureau implemented it in Regulation Z.

This chapter covers the card as credit: the revolving account and its balance segments, grace periods and the ban on double-cycle billing, how interest is calculated (with worked numbers), minimum payments and the repayment disclosures, the CARD Act's rules on rates, fees and limits, the 2024 late fee rule and its 2025 vacatur, and credit limits from assignment to decrease. Charge cards and commercial cards appear where they differ; corporate card underwriting is [Corporate Cards & Underwriting](/books/banking-and-lending/corporate-cards), and secured cards for building credit are [Credit Builders & Secured Products](/books/banking-and-lending/credit-builders#secured-cards). The economics that frame all of it are in [The Lending Business](/books/banking-and-lending/lending-business).

## How the Platforms Do It

What issuer processors with credit ledgers document, and what issuers disclose, as of October 2026:

| Company | Role | Interest and grace | Minimum payment | Limits and other behavior |
| --- | --- | --- | --- | --- |
| **Capital One** | Bank issuer | Not in the sources here | Not in the sources here | Domestic card loans of $262.4 billion at December 2025; 5.01% annualized net charge-offs and 3.99% 30+ day delinquency that month |
| **Lithic** | Issuer processor with a revolving credit ledger | Average daily balance, accrued daily and calculated per rate category; compounding and rounding configurable; optional minimum interest charge; grace tracked per rate category, lost if the prior balance isn't paid in full | A percentage of the balance plus fees and interest, with configurable categories | Business and card-level limits, shared limits across cards, temporary increases; available credit net of pending authorizations; automatic limit reduction on delinquency; late and returned-payment fees assessed automatically |
| **Marqeta** | Issuer processor with a credit platform | Set when the account is created | Flat amount, a percentage of the statement balance, or the greater of both; the full statement balance if it's below the flat amount | Products as templates with a credit limit range, an approval workflow (draft to active), billing cycle day and payment due day; the program is responsible for statement compliance |
| **Ramp** | Commercial charge card program | No interest: a charge card paid in full | Full balance | Revenue from interchange and its Ramp Plus subscription |

Three things stand out. **The balance is segmented, not single:** both processors keep principal by rate category (purchases, cash advances, balance transfers, promotions, penalty rate) plus interest and fees in their own buckets, because grace, interest and payment allocation all work per segment. **The law is the program's job:** Marqeta says plainly that the program, not the processor, is responsible for statements that meet regulatory requirements, so every configurable knob is a compliance decision. **A charge card sidesteps most of this chapter:** with no revolving balance there's no interest calculation, no minimum payment disclosure and no rate change rules, which is part of why commercial spend cards are charge cards.

## The Revolving Account

The account is a line of credit with a limit, drawn by purchases, cash advances, balance transfers and fees, and repaid by payments and credits. It runs in **billing cycles**, each ending in a statement that shows the balance, the interest and fees charged, the minimum payment and the due date. Regulation Z fixes the calendar's shape:

- **The due date is the same day of the month for each billing cycle** (12 CFR 1026.7(b)(11)), so a cycle-close engine can't drift the due date with the length of the month.
- **Statements go out at least 21 days before the payment due date** and, for a plan with a grace period, at least 21 days before the grace period expires (1026.5(b)(2)(ii)). The engine's job is to produce and deliver the statement early enough, and to prove it did.
- **A payment is credited as of the day it's received,** and a cut-off time for that can't be earlier than 5 p.m. on the due date at the place payments are received (1026.10(a), (b)). If the issuer doesn't accept mailed payments on the due date (a weekend or holiday), a mailed payment received the next business day isn't late (1026.10(d)).
- **No fee for paying,** unless the payment is expedited by a live customer service representative (1026.10(e)). An automated phone or web payment can't carry a fee.

Available credit is the limit minus what's owed, including pending authorizations, so the authorization path ([Partial Approvals, Holds and Changing Amounts](/books/payments/issuer-processing#partial-approvals-holds-and-changing-amounts)) and the credit ledger share one number.

## Balance Segments and APRs

Each kind of balance can carry its own rate and its own rules:

| Segment | Typical rate | Grace period | Notes |
| --- | --- | --- | --- |
| **Purchases** | The purchase APR | Usually yes, if the prior balance was paid in full | The segment most programs mean by "the APR" |
| **Cash advances** | Usually higher | Usually none: interest from the transaction date | Regulation Z's commentary illustrates a cash advance at a higher rate accruing from the transaction date while the purchase balance keeps its grace (comment 54(a)(1)-6.ii) |
| **Balance transfers** | Often promotional | Per the terms | Often with a transfer fee |
| **Promotional** | A reduced rate for at least six months | Per the terms | A temporary rate can rise only after the disclosed period, which must be at least six months (1026.55(b)(1)) |
| **Deferred interest** | Interest accrues but is waived if paid in full by the end of the period | Not a grace period (comment 54(a)(1)-2.i) | Common in retail and health care financing (Health Tech's [Patient Financing](/books/health-tech/patient-payments#patient-financing)); if not paid in full, the accrued interest is charged |
| **Penalty** | The penalty APR | n/a | Can apply to existing balances only after a 60-day delinquency (below) |

**Payment allocation follows the rates.** The minimum payment may be applied as the issuer chooses, but anything above it goes first to the balance with the highest APR, then down the list (1026.53(a)). Two exceptions: in the last two billing cycles before a deferred interest period ends, the excess goes first to the deferred interest balance, and the issuer may follow a specific request from the consumer (a preprinted or pre-checked allocation doesn't count) (1026.53(b)). For allocation, a deferred interest balance counts as 0% until its period ends. Lithic's documented order (fees, then interest, then principal from highest APR to lowest) is one way to implement the rule for the minimum and the excess together.

## Grace Periods

A **grace period** is the time between the end of a cycle and the due date during which new purchases accrue no interest, if the consumer pays the statement balance in full. Regulation Z doesn't require one; it governs the one an issuer offers:

- **Loss of grace can't reach back.** An issuer can't charge interest, because a grace period was lost, on balances for days in billing cycles before the most recent one, or on any part of a grace-eligible balance repaid before the grace period expired (1026.54(a)). This ended **two-cycle (double-cycle) billing**, under which a consumer who stopped paying in full was charged interest on the previous cycle's balance too.
- **Partial payment still counts.** The regulation's own example: a consumer with $600 of March purchases who pays $500 by the due date can be charged interest in April only on the unpaid $100, not on the $500 repaid within the grace period (comment 54(a)(1)-6.i).
- **A waiver isn't a grace period.** A grace period exists when the account terms automatically waive interest for a balance paid in full by the due date; an individual waiver of accrued interest doesn't create one (comment 54(a)(1)-2.ii).
- **Disputes and returned payments** are excepted: adjustments from resolving a billing error or from a returned payment can change what's owed (1026.54(b)).

Grace eligibility is a per-cycle, per-segment state the engine computes at cycle close: was the previous statement balance paid in full by its due date? Lithic tracks it per rate category for the same reason. How many cycles paid in full restore it is the program's rule, stated in the agreement, and the interest that accrues between the statement date and the day a full payment arrives, often called residual or trailing interest, is the item cardholders most often call about.

## Interest Calculation Methods

The account opening disclosure names a **balance computation method**, and each statement shows the "Balance Subject to Interest Rate" for each rate and explains how it was determined (or names the method and gives a toll-free number) (1026.7(b)(5)). The methods in use:

- **Average daily balance (including new transactions).** Take the balance at the end of each day in the cycle, add them up, divide by the days in the cycle, and multiply by the daily periodic rate and the number of days. The most common method on cards; Lithic computes it per rate category.
- **Daily balance.** Apply the daily periodic rate to each day's balance and sum. Mathematically the same as the average daily balance times days, unless interest compounds.
- **With or without daily compounding.** If each day's interest is added to the next day's balance, the interest compounds daily. The disclosure says which, and the APR is the same either way; the dollars differ slightly.
- **Two-cycle average daily balance.** Banned when grace is lost, by 1026.54 above (comment 54(a)(1)-4).

The **daily periodic rate** is the APR divided by 365 (some programs use 360; the disclosure fixes it). A **minimum interest charge** may apply when the computed interest is small; Regulation Z's disclosure threshold for it stays at $1.00 for 2026. Money arithmetic belongs in integer minor units with explicit rounding at the posting step, never in floats ([Rounding](/docs/payments/money#rounding)).

## Worked Numbers: Average Daily Balance Interest

A 30-day billing cycle, a purchase APR of 24.99%, no grace (the previous statement wasn't paid in full), interest computed on the average daily balance including new transactions:

| Days | Event | Daily balance | Balance-days |
| --- | --- | --- | --- |
| 1 to 10 | Carried balance | $1,200.00 | $12,000.00 |
| 11 to 20 | $300 purchase on day 11 | $1,500.00 | $15,000.00 |
| 21 to 30 | $500 payment on day 21 | $1,000.00 | $10,000.00 |
| | | **Total** | **$37,000.00** |

- **Average daily balance:** $37,000.00 / 30 = $1,233.33.
- **Daily periodic rate:** 24.99% / 365 = 0.068466%.
- **Interest:** $1,233.33 × 0.00068466 × 30 = **$25.33**.
- **With daily compounding** (each day's interest added to the next day's balance), the same cycle produces **$25.59**.

Change one fact and the answer changes. If the previous statement had been paid in full and the account had a grace period, the $300 purchase would accrue nothing this cycle as long as this cycle's statement balance is paid in full by its due date. If the $500 payment had arrived on day 11 instead of day 21, the balance-days would fall by $5,000 and the interest by $3.42. The engine that produces these figures should be able to show the daily balances behind every interest charge, because the "Balance Subject to Interest Rate" on the statement is a number a cardholder, an examiner or a court can ask the issuer to reproduce.

## Minimum Payments

The minimum is the issuer's formula, disclosed in the agreement: commonly a percentage of the balance plus the cycle's interest and fees, with a dollar floor, and the full balance when it's below the floor. Marqeta's configuration (a flat amount, a percentage of the statement balance, or the greater of both) and Lithic's (a percentage of the balance plus fees and interest) show the usual shapes. Two legal limits frame the formula:

- **The repayment disclosure.** Each statement on a revolving card account carries a bold "Minimum Payment Warning" with the number of months to repay the balance making only minimum payments, the total cost that way, the monthly payment that would repay the balance in 36 months with its total cost and the savings, and a toll-free number for credit counseling (1026.7(b)(12)). If the minimum wouldn't reduce the balance (negative or no amortization), a different warning applies. The issuer has to compute these from its own formula every cycle.
- **Raising the minimum is a significant change in terms** that needs 45 days' notice (1026.9(c)(2)(ii)).

**Worked numbers.** A $5,000 balance at 24.99%, no new purchases, with a minimum of 1% of the balance plus that month's interest, floor $35 (my assumption for illustration): paying only the minimum takes **203 months** (about 17 years) and **$8,823.90** of interest. The 36-month payment is **$198.77**, for a total of **$7,155.82**, a saving of **$6,668.08** against the minimum path. Those are the numbers the warning box must show, computed by the same engine that computes the minimum.

## The CARD Act Rules

The Credit CARD Act's protections, as implemented in Regulation Z, that a card ledger must enforce rather than merely disclose:

- **Ability to pay before opening or raising a limit.** The issuer considers the consumer's ability to make the required minimum payments from income or assets and current obligations, under written policies that use at least one of debt-to-income, debt-to-assets or residual income (1026.51(a)). Under 21, the applicant needs an independent ability to pay or a cosigner, guarantor or joint applicant who is 21 or older, and later limit increases need the same (1026.51(b)).
- **First-year fees** (other than penalty fees and a few others) can't exceed 25% of the initial credit limit (1026.52(a)).
- **Rates can't rise on existing balances** except in listed cases (1026.55): a promotional rate expiring after a disclosed period of at least six months; a variable rate following its public index (not a margin change); an increase on new transactions after 45 days' notice, never in the account's first year and not on transactions made within 14 days after the notice; a minimum payment more than **60 days late**, which allows a penalty rate on the existing balance but must be reversed after six consecutive on-time minimum payments; and a workout or hardship arrangement ending or failing.
- **Rate increases are reviewed every six months.** After an increase, the issuer must reevaluate at least once every six months, using either the factors behind the increase or the factors it uses for new accounts, and cut the rate within 45 days when the review says so (1026.59).
- **45 days' notice of significant changes,** with up to four principal reasons for a rate increase, listed by importance, and the consumer's right to reject the change before it takes effect (1026.9(c)(2)).
- **Over-limit fees only with opt-in.** No over-limit fee unless the consumer affirmatively opted in after a segregated notice; one such fee per cycle, and not for more than three cycles for the same excess unless the consumer goes over again (1026.56).
- **Unauthorized use and billing errors.** Liability for unauthorized use is capped at $50, and billing errors run on their own clock; both are in [Credit: Regulation Z](/books/payments/issuer-processing#credit-regulation-z).

Each of these is a state machine or a check, not a sentence in the agreement. A rate increase is a record with its exception type, its notice, its effective date, the balances it applies to, and the next six-month review date; a penalty rate carries a counter of consecutive on-time payments toward its cure.

## Late Fees and the 2024 Rule

A penalty fee (late payment, returned payment, over-limit) is allowed only if it's justified by a cost analysis reevaluated at least every 12 months, or stays within the **safe harbor** amounts in 1026.52(b)(1)(ii), which are adjusted annually for inflation; a charge card may instead charge 3% of a balance delinquent for two or more consecutive cycles. Limits apply either way: a late fee can't exceed the dollar amount associated with the violation (for a late payment, the minimum payment due just before the fee), only one penalty fee per event, and no fee where no dollar amount is involved, such as a declined transaction, inactivity or closing the account (1026.52(b)(2)).

The CFPB's **Credit Card Penalty Fees final rule** (March 5, 2024; 89 FR 19128; effective May 14, 2024) would have cut the late fee safe harbor to **$8** for issuers with one million or more open accounts and removed its annual inflation adjustment. It never took effect: the rule was stayed in litigation brought by the U.S. Chamber of Commerce, the American Bankers Association, the Consumer Bankers Association and others in the Northern District of Texas, and on **April 15, 2025** Judge Mark Pittman vacated it on the parties' joint motion for a consent judgment, in which the Bureau agreed the rule violated the CARD Act. Issuers continue to charge under the framework that existed before it, whose safe harbors the 2024 rule had described as $30 for a first late payment and $41 for a later one within six cycles. <!-- source-gap: card-safe-harbor-2026 | missing | the late fee safe harbor amounts in force for 2026 after the vacatur | closes with: the CFPB's 2025 or 2026 Regulation Z annual adjustment notice stating the 1026.52(b)(1)(ii) amounts | checked: 2026-10-29 --> The 2026 annual adjustment notice I found sets other Regulation Z thresholds and doesn't restate the penalty fee amounts, so treat them as configuration with a source document, not a constant. As of July 2026, the CFPB had sent a request for information titled "Credit Card Late Fees and Late Payments" to OIRA for review, with no proposed rule announced.

For the system, the late fee is a rule with versions: the amount (cost-justified or safe harbor), the cap at the minimum due, the one-per-event check, and the effective date of each change, with the cost analysis kept as the evidence ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## Credit Limits

- **Assignment.** The initial limit comes from the underwriting decision, inside the product's range (Marqeta's products carry a minimum and maximum), under the ability-to-pay rule above. [Underwriting & Decision Engines](/books/banking-and-lending/decision-engines) covers the decision.
- **Increases.** A requested or proactive increase is a new ability-to-pay determination, with the same under-21 rules. Lithic exposes temporary increases; a temporary increase still needs a recorded basis.
- **Decreases.** Cutting a limit, closing an account or changing its terms unfavorably for credit risk is adverse action on an existing account, with a notice within 30 days and specific principal reasons (12 CFR 1002.9(a)(1)), covered in [Adverse Action & Explaining Decisions](/books/banking-and-lending/adverse-action). If the new limit is below the balance, the issuer can't impose an over-limit fee or penalty rate based on the reduced limit until 45 days after notice of the decrease (1026.9(c)(2)(vi)).
- **Shared and nested limits.** Commercial programs put a business-level limit over card-level limits; Lithic documents both, with several cards drawing on one line. [Corporate Cards & Underwriting](/books/banking-and-lending/corporate-cards#limits-from-cash) covers cash- and revenue-based limits.
- **Delinquency.** Processors can lower a limit automatically on delinquency and restore it after paydown (Lithic documents this); each automatic change is still an account action with its notices.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). A card's credit line is an `accounts` row with `account_kind = 'line'` and a `loans` row with `amortization = 'revolving'` (its `principal` is the original limit), attached to the program's product version; the Payments volume's `card_accounts` (which carries `credit_limit` and `receivable_owner`) maps to it one to one, and `cards` and authorizations stay where [Card Issuing](/books/payments/card-issuing#how-to-build-it) and [Issuer Processing](/books/payments/issuer-processing#how-to-build-it) put them. Interest posts through `interest_accruals`, fees through `fee_assessments`, statements through `statements`, all to `journal_entries`.

```sql
CREATE TABLE credit_lines (                  -- the revolving terms on a line account
  account_id          UUID PRIMARY KEY REFERENCES loans (account_id),
  card_account_id     UUID UNIQUE REFERENCES card_accounts (id),   -- from Payments, when card-accessed
  credit_limit        BIGINT NOT NULL CHECK (credit_limit >= 0),  -- current; history in credit_limit_changes
  cash_limit          BIGINT,
  cycle_close_day     SMALLINT NOT NULL CHECK (cycle_close_day BETWEEN 1 AND 28),
  due_day             SMALLINT NOT NULL CHECK (due_day BETWEEN 1 AND 31),   -- the same day every cycle
  payment_cutoff_local TIME NOT NULL CHECK (payment_cutoff_local >= '17:00'),
  balance_method      TEXT NOT NULL CHECK (balance_method IN ('adb_incl_new', 'daily_balance')),
  daily_compounding   BOOLEAN NOT NULL,
  day_count_basis     SMALLINT NOT NULL CHECK (day_count_basis IN (360, 365)),
  min_payment_rule    JSONB NOT NULL,         -- percent, floor, included categories; versioned with the product
  overlimit_opt_in_at TIMESTAMPTZ,            -- 1026.56 consent; NULL means no over-limit fees
  overlimit_revoked_at TIMESTAMPTZ,
  is_charge_card      BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE balance_segments (              -- one per rate category or promotion
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES credit_lines (account_id),
  kind               TEXT NOT NULL CHECK (kind IN ('purchase', 'cash', 'balance_transfer',
                       'promo', 'deferred_interest', 'penalty')),
  apr_bps            INT NOT NULL,
  rate_type          TEXT NOT NULL CHECK (rate_type IN ('fixed', 'variable')),
  index_name         TEXT,                    -- variable: the public index
  margin_bps         INT,
  grace_eligible     BOOLEAN NOT NULL,        -- does the product offer grace on this kind at all
  promo_ends_on      DATE,                    -- at least six months after it starts, for promo rates
  deferred_interest_accrued BIGINT NOT NULL DEFAULT 0,
  opened_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at          TIMESTAMPTZ
);

CREATE TABLE billing_cycles (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES credit_lines (account_id),
  starts_on           DATE NOT NULL,
  ends_on             DATE NOT NULL,
  statement_id        UUID REFERENCES statements (id),
  statement_balance   BIGINT,
  minimum_due         BIGINT,
  due_on              DATE,
  statement_delivered_at TIMESTAMPTZ,         -- must be 21+ days before due_on
  grace_in_effect     BOOLEAN NOT NULL,       -- computed at open: was the prior balance paid in full by its due date
  paid_in_full_by_due BOOLEAN,                -- computed after due_on
  repayment_disclosure JSONB,                 -- months, total cost, 36-month payment and savings as printed
  UNIQUE (account_id, starts_on)
);

CREATE TABLE segment_daily_balances (        -- the evidence behind every interest charge
  cycle_id           UUID NOT NULL REFERENCES billing_cycles (id),
  segment_id         UUID NOT NULL REFERENCES balance_segments (id),
  balance_date       DATE NOT NULL,
  end_of_day_balance BIGINT NOT NULL,
  interest_accrued_micros BIGINT NOT NULL,    -- sub-cent accrual, rounded only at posting
  PRIMARY KEY (cycle_id, segment_id, balance_date)
);

CREATE TABLE rate_changes (                  -- every APR increase, with its legal basis and its clocks
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES credit_lines (account_id),
  segment_id          UUID REFERENCES balance_segments (id),
  from_apr_bps        INT NOT NULL,
  to_apr_bps          INT NOT NULL,
  exception           TEXT NOT NULL CHECK (exception IN ('promo_expiry', 'index', 'advance_notice',
                        'delinquency_60', 'workout_end', 'scra_end', 'decrease')),
  notice_disclosure_id UUID REFERENCES disclosures (id),
  reasons             TEXT[],                 -- up to four, by importance
  applies_to_txns_after TIMESTAMPTZ,          -- 14 days after notice for advance_notice increases
  effective_on        DATE NOT NULL,
  on_time_payments_toward_cure SMALLINT,      -- delinquency_60: reversed after six
  next_review_due     DATE,                   -- 1026.59: every six months while above the old rate
  review_closed_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credit_limit_changes (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES credit_lines (account_id),
  from_limit         BIGINT NOT NULL,
  to_limit           BIGINT NOT NULL,
  temporary_until    DATE,
  reason             TEXT NOT NULL CHECK (reason IN ('origination', 'consumer_request', 'proactive',
                       'risk_decrease', 'delinquency', 'restore')),
  credit_decision_id UUID REFERENCES credit_decisions (id),   -- ability-to-pay basis for any increase
  notice_disclosure_id UUID REFERENCES disclosures (id),      -- adverse action notice for a decrease
  no_overlimit_penalty_until DATE,          -- 45 days after notice, if below the balance
  effective_at       TIMESTAMPTZ NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The cycle-close job is the heart of it: for each segment it sums `segment_daily_balances`, posts interest through `interest_accruals` (rounded once, at posting), assesses fees through `fee_assessments` after the late-fee rule's checks, computes the minimum and the repayment disclosure from the same functions, writes the statement, and sets `grace_in_effect` for the next cycle. It runs per account and must be idempotent, because a rerun after a failure can't charge interest twice ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)). Payment allocation reads `balance_segments` in APR order, with the deferred-interest override in the last two cycles before `promo_ends_on`, and writes `payment_allocations` so every dollar's destination is on record. `due_day` and the 5 p.m. floor are constraints, not configuration a product team can set wrong; the statement delivery time is recorded against `due_on` so the 21-day rule is provable per statement. Rate changes and limit changes are append-only with their notices linked, and a scheduled job drives `next_review_due` until each increase is reversed.

## Auditing

Card credit is examined account by account, and the general design is in [Audit Trails](/docs/architecture/audit-trails). For card accounts, make sure the record shows:

- **The interest on every statement, reproducible:** daily balances per segment, the rate and method in force, and the rounding, so the "Balance Subject to Interest Rate" can be rebuilt.
- **Grace decisions per cycle:** whether grace applied and why, with the payment that kept or lost it.
- **Every payment's crediting and allocation:** received time, cut-off, credited date, and the split across segments under 1026.53.
- **Statement delivery against the 21-day rule,** per statement.
- **Every rate increase with its legal exception, notice, reasons, effective date, cure counter and six-month reviews.**
- **Every penalty fee with its basis:** safe harbor amount or cost analysis version, the cap check against the minimum due, and the one-per-event check.
- **Limit changes with their ability-to-pay evidence or adverse action notice,** and over-limit consent with its revocations.
- **The repayment disclosure as printed,** and the inputs that produced it.

## What This Means for the System You Build

- **Separate the payment instrument from the credit line:** cards and authorizations in the issuing model, the revolving terms and balances in the lending model, linked one to one.
- **Segment the balance by rate category** and compute grace, interest and allocation per segment.
- **Keep the daily balances** behind every interest charge, and round only at posting.
- **Make the calendar a constraint:** same due day every cycle, statements 21 days ahead, a cut-off no earlier than 5 p.m.
- **Treat every rate increase as a record with a legal basis and clocks:** notice, 14-day protection, six-month reviews and penalty-rate cures.
- **Version penalty fees as rules with sources,** because their amounts depend on regulation and litigation, not on your code.
- **Compute the minimum and the repayment disclosure with the same functions,** and keep what was printed.
- **Handle limit decreases as adverse action** with notice and reasons, and with the 45-day bar on over-limit penalties.

## References

**Law and regulation**

- [CFPB: Regulation Z § 1026.5, general disclosure requirements](https://www.consumerfinance.gov/rules-policy/regulations/1026/5/), statements mailed or delivered at least 21 days before the payment due date and before the grace period expires
- [CFPB: Regulation Z § 1026.7, periodic statement](https://www.consumerfinance.gov/rules-policy/regulations/1026/7/), the balance subject to interest rate and its explanation, the same due date each cycle, and the minimum payment warning and repayment disclosures
- [CFPB: Regulation Z § 1026.9, subsequent disclosure requirements](https://www.consumerfinance.gov/rules-policy/regulations/1026/9/), 45 days' notice of significant changes, up to four reasons for a rate increase, the right to reject, and the 45-day bar after a limit reduction
- [CFPB: Regulation Z § 1026.10, payments](https://www.consumerfinance.gov/rules-policy/regulations/1026/10/), crediting as of receipt, the 5 p.m. cut-off floor, due dates when mail isn't accepted, and fees only for expedited live-agent payments
- [CFPB: Regulation Z § 1026.51, ability to pay](https://www.consumerfinance.gov/rules-policy/regulations/1026/51/), the minimum payment ability test, written policies on debt-to-income, debt-to-assets or residual income, and the under-21 rules for opening and limit increases
- [CFPB: Regulation Z § 1026.52, limitations on fees](https://www.consumerfinance.gov/rules-policy/regulations/1026/52/), the 25% first-year fee limit, the cost test and safe harbors for penalty fees, the 3% charge card alternative, the cap at the dollar amount of the violation, one fee per event, and no fee without a dollar amount
- [CFPB: Regulation Z § 1026.53, allocation of payments](https://www.consumerfinance.gov/rules-policy/regulations/1026/53/), excess payments to the highest APR first, the deferred interest and consumer request exceptions
- [CFPB: Regulation Z § 1026.54, limitations on the imposition of finance charges](https://www.consumerfinance.gov/rules-policy/regulations/1026/54/), no interest from lost grace on prior cycles or repaid amounts, the two-cycle method, deferred interest not a grace period, and the $600 and $500 example
- [CFPB: Regulation Z § 1026.55, limitations on increasing annual percentage rates, fees, and charges](https://www.consumerfinance.gov/rules-policy/regulations/1026/55/), the exceptions for promotional, variable, advance notice, 60-day delinquency and workout increases, and the six-payment cure
- [CFPB: Regulation Z § 1026.56, requirements for over-the-limit transactions](https://www.consumerfinance.gov/rules-policy/regulations/1026/56/), opt-in before over-limit fees, revocation, one fee per cycle and the three-cycle limit
- [CFPB: Regulation Z § 1026.59, reevaluation of rate increases](https://www.consumerfinance.gov/rules-policy/regulations/1026/59/), reviews at least every six months and reductions within 45 days
- [CFPB: Regulation B § 1002.9, notifications](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/), notice within 30 days of adverse action on an existing account, with specific principal reasons
- [Federal Register: Truth in Lending (Regulation Z) annual threshold adjustments (December 15, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-12-15/html/2025-22773.htm), the minimum interest charge threshold unchanged at $1.00 for 2026, effective January 1, 2026

- [CFPB: Credit Card Penalty Fees final rule](https://www.consumerfinance.gov/rules-policy/final-rules/credit-card-penalty-fees-final-rule/), issued March 5, 2024, 89 FR 19128, effective May 14, 2024, the $8 safe harbor for issuers with one million or more open accounts without CPI adjustment, and the page's "stayed" status

**Litigation and status**

- [Consumer Finance Monitor: Federal judge voids CFPB credit card late fee rule (April 16, 2025)](https://www.consumerfinancemonitor.com/2025/04/16/federal-judge-voids-cfpb-credit-card-late-fee-rule/), the Northern District of Texas, Judge Pittman, the consent judgment vacating the rule, the plaintiffs, and the $30 and $41 safe harbors the rule would have changed
- [Consumer Finance Monitor: CFPB signals it may revisit credit card late fee regulation (July 8, 2026)](https://www.consumerfinancemonitor.com/2026/07/08/cfpb-signals-it-may-revisit-credit-card-late-fee-regulation/), the "Credit Card Late Fees and Late Payments" request for information at OIRA and no proposal announced

**Regulators and data**

- [Federal Reserve: G.19 Consumer Credit (October 7, 2026)](https://www.federalreserve.gov/releases/g19/current/default.htm), August 2026 card plan rates on all accounts and on accounts assessed interest
- [Federal Reserve: Charge-off rates on loans and leases at commercial banks](https://www.federalreserve.gov/releases/chargeoff/chgallsa.htm), the second quarter 2026 credit card charge-off rate
- [CFPB: The Consumer Credit Card Market (December 30, 2025)](https://www.consumerfinance.gov/data-research/research-reports/the-consumer-credit-card-market-2025/), the seventh biennial CARD Act review, with data through the end of 2024

**Filings**

- [Capital One: Monthly credit metrics for December 2025 (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/927628/000092762826000004/ex991december2025creditmet.htm), domestic card loans, net charge-offs and delinquency

**Vendor documentation**

- [Lithic: Revolving credit](https://docs.lithic.com/docs/revolving-credit), billing cycles, average daily balance per rate category, grace per category, minimum payments, balance categories, payment order, late and returned-payment fees, and business and card-level limits
- [Marqeta: About credit products](https://www.marqeta.com/docs/developer-guides/about-credit-products), products as templates, limit ranges, billing cycle and due days, minimum payment options and the approval workflow
- [Marqeta: Credit account statements](https://www.marqeta.com/developer-guides/about-credit-account-statements/), the program's responsibility for statements meeting regulatory requirements
- [Ramp: How Ramp makes money](https://support.ramp.com/how-ramp-makes-money), interchange and subscriptions, and no interest on a charge card
