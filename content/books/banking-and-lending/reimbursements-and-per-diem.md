+++
title = "Reimbursements, Mileage & Per Diem"
nav_title = "Reimbursements & Per Diem"
description = "Paying employees back: accountable plans, effective-dated IRS mileage and per diem rates, advances and excess, and reimbursement by ACH or payroll."
category = "Banking & Lending Industry"
order = 2466
part = "Spend Management"
tags = ["banking", "spend-management", "expenses", "reimbursements", "tax", "payroll"]
+++

A corporate card pays the merchant directly; a reimbursement pays the employee back for money that was already spent. It covers what the card can't: the personal card used at a vendor that doesn't take the corporate one, the employee without a card, the cash tip, and above all the employee's own car, which earns a mileage allowance rather than a receipt. Business travelers can also be paid a flat daily allowance for lodging, meals and incidentals instead of submitting every receipt. All of these are payments from the business to a person, and US tax law decides whether each dollar is a tax-free reimbursement or taxable wages. The test is whether the business runs an **accountable plan**, and its windows, rates and substantiation rules are what a reimbursement engine enforces.

This chapter covers the accountable plan and its safe harbors, the IRS standard mileage rate (which changed in the middle of 2026), per diem under the federal and high-low methods, advances and the return of excess, and how the money moves by ACH, wire or payroll. Capturing and matching receipts and the expense policy engine that reviews them are in [Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management); the corporate card side is in [Corporate Cards & Underwriting](/books/banking-and-lending/corporate-cards); the outbound transfer is an ACH credit owned by the Payments volume's [ACH & Bank Transfers](/books/payments/ach).

## How the Platforms Do It

As of October 2026, from each vendor's help center:

| Platform | How the employee is paid | Timing (vendor's statement) | Mileage | Other routes |
| --- | --- | --- | --- | --- |
| **Expensify** | Direct ACH from the workspace's connected business bank account to the member's personal account; global reimbursement from US, Canadian, UK, EU and Australian business accounts | Standard ACH "four to five business days"; Rapid Reimbursement in about one business day, for payments under $100 when withdrawals are under $10,000 in 24 hours; global two to three business days | Not covered on the payment-method page | "Pay elsewhere" marks a report paid without moving money, for payroll, company checks, wires and internal systems |
| **Ramp** | Debited from the company bank account chosen in reimbursement settings, ACH to US employees, wire to more than 50 countries | "Within 3 business days" of approval | Distance computed from start and end locations (the route with the fewest miles), manual override; rate defaults to the IRS business rate for the calendar year, overridable by department, residence or employee; international mileage at a country rate | "Allow payments outside of Ramp" for any other method; batching one debit per employee; employee repayments of personal charges by ACH in about five business days, or off-platform such as payroll deduction |

Three patterns hold across both. **The business's own bank account funds the payout**, debited by the platform and credited to the employee, either one pair per reimbursement or batched per employee. **Payroll is the outside route**: neither platform pays through payroll itself, so a reimbursement that must be taxed (or a company that prefers one payment per pay period) is marked paid in the expense system and paid by the payroll provider. **The rate is configuration, and the default is the IRS rate.** Ramp's default is the IRS business rate "for that calendar year", which in 2026 was two rates, so a calendar-year setting has to be split at July 1 (below).

## The Accountable Plan

An employer's reimbursement or allowance arrangement is an accountable plan when it meets three requirements in 26 CFR 1.62-2: **business connection** (it covers only deductible business expenses an employee incurs in performing services, identified separately when paid with wages), **substantiation** (each expense is substantiated to the employer within a reasonable period, meeting section 274(d) for travel), and **return of excess** (the employee must return within a reasonable period anything beyond substantiated expenses). Amounts paid under an accountable plan are excluded from the employee's income and aren't wages. When an arrangement fails any of the three, "all amounts paid under the arrangement are treated as paid under a nonaccountable plan": they are wages, reported on the W-2 and subject to withholding and employment taxes. An arrangement that pays the amount whether or not the employee incurs an expense fails business connection outright, which is why a flat monthly "car allowance" with no mileage log is just pay.

"Reasonable period" is facts and circumstances, with two safe harbors in 1.62-2(g) that most policies adopt:

- **Fixed date method.** An advance is made within 30 days of when the expense is paid or incurred, the expense is substantiated within 60 days after it is paid or incurred, and any excess is returned within 120 days after it is paid or incurred.
- **Periodic statement method.** The employer sends each employee a statement at least quarterly listing amounts paid beyond substantiated expenses and asking for substantiation or return within 120 days of the statement.

An employer with a pattern of overreimbursing to avoid reporting can't use either safe harbor, and a pattern of abuse turns the whole arrangement nonaccountable (1.62-2(g)(3) and (k)). If an employee misses a window under an otherwise good plan, only the unsubstantiated or unreturned amount becomes wages, withheld no later than the first payroll period after the reasonable period ends (1.62-2(h)(2)(i)(A)). So the engine has three clocks per item, each starting at the expense date, and a job that moves an item from reimbursable to taxable when its clock runs out, rather than a person noticing in December.

Substantiation for travel follows the documentary evidence rule in 26 CFR 1.274-5(c)(2)(iii): a receipt for any lodging away from home and for any other expenditure of $75 or more (transportation excepted when a receipt isn't readily available), showing the amount, date, place and essential character. [Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management) applies that rule to cards and receipts; this chapter is about the two allowances that replace receipts with rates.

## Mileage

The IRS publishes an optional **business standard mileage rate** that covers the cost of operating a car, and an employer may reimburse at a cents-per-mile rate instead of actual costs. For 2026 it was set twice:

| Expenses paid or incurred | Business | Medical and military moving | Charitable | Source |
| --- | --- | --- | --- | --- |
| 2025 | 70 cents | 21 cents | 14 cents | IR-2024-312 |
| January 1 to June 30, 2026 | 72.5 cents | 20.5 cents | 14 cents | Notice 2026-10 (IR-2025-128) |
| July 1 to December 31, 2026 | 76 cents | 23.5 cents | 14 cents | Announcement 2026-11 (IR-2026-29) |

Announcement 2026-11 applies the revised rates to expenses paid or incurred on or after July 1, 2026, and to mileage allowances paid on or after that date, and leaves Notice 2026-10 in force for earlier ones; the charitable rate is fixed by section 170(i) and didn't change. The rate is looked up by **trip date**, not by submission or payment date, and the engine must hold both rows for 2026 ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).

Rev. Proc. 2019-46 sets how an allowance is treated. For a cents-per-mile allowance, the amount deemed substantiated is "the lesser of the amount paid under the mileage allowance or the business standard mileage rate multiplied by the number of substantiated business miles", provided the employee also substantiates the time, place (or use) and business purpose of each trip. An employer may pay more than the standard rate, but the excess for substantiated miles is treated as paid under a nonaccountable plan; it isn't returned, it's taxed. Allowances paid for miles the employee never substantiates must be returned within a reasonable period. A **fixed and variable rate (FAVR)** allowance, a periodic fixed payment plus a per-mile variable payment computed from data for the employee's base locality and a standard automobile, is the alternative for employers that want to reflect local insurance and fuel costs; it has its own conditions in section 6 of the revenue procedure, and most spend platforms support only the cents-per-mile method.

What a mileage record needs, from 1.274-5(j)(2) and Rev. Proc. 2019-46: the date, the business miles, the start and destination (place), and the business purpose. Distance comes from the employee's entry, a route computed between two addresses (Ramp chooses "the route with the fewest number of miles"), or GPS tracking in the app; keep which one produced the number, because a GPS track and a computed route can differ, and the computed route is the defensible minimum.

### Worked Numbers: Mileage Across the Rate Change

An employee files one report on August 20, 2026 covering two trips in her own car:

| Trip | Date | Business miles | Rate on that date | Amount |
| --- | --- | --- | --- | --- |
| Client site visits | June 24, 2026 | 180 | 72.5 cents | $130.50 |
| Trade show and back | July 14, 2026 | 232 | 76 cents | $176.32 |
| **Total** | | 412 | | **$306.82** |

Reimbursed at the standard rates, the whole $306.82 is deemed substantiated and is paid tax-free through the expense system. A system that applied the rate in force on the report date would have paid 412 x 76 cents = $313.12, overpaying $6.30, and that $6.30 is a nonaccountable excess on the June trip.

Now suppose the employer's policy pays a flat 80 cents a mile. The allowance is $329.60. The deemed substantiated amount is still $306.82, so the excess is 180 x 7.5 cents = $13.50 for June plus 232 x 4 cents = $9.28 for July, $22.78 in all. The employee keeps it, and it's wages: the expense system pays $306.82 as a reimbursement and sends $22.78 to payroll as taxable, or pays all $329.60 and reports the $22.78 to payroll as imputed income for withholding. Either way the split is computed per trip, because the two trips have different rates.

The windows run from each trip date. Under the fixed date method, the June 24 trip had to be substantiated by August 23 (60 days) and the July 14 trip by September 12, so the August 20 report is inside both. Had the June trip been submitted on September 1, it would be outside the safe harbor; the employer may still judge 69 days reasonable on the facts, but that's a policy decision to record, not a default.

## Per Diem

Instead of reimbursing actual travel costs against receipts, an employer may pay a **per diem allowance**: a fixed daily amount for lodging, meals and incidental expenses (M&IE), or for M&IE only. Rev. Proc. 2019-48 treats the allowance as substantiated up to the federal rate for the place and day, provided the employee substantiates the time, place and business purpose of the travel; a lodging receipt isn't required for the amount deemed substantiated (section 6.02). The rates come from two publications, each on a federal fiscal year starting October 1:

- **GSA's federal per diem rates**, by locality. For FY 2027 (travel from October 1, 2026 through September 30, 2027, FTR Bulletin 27-01), GSA raised the standard CONUS lodging rate by $3 to $113 and kept standard M&IE at $68, with 295 non-standard areas receiving a higher lodging allowance. GSA publishes the rates as a lookup, flat files and an API; a system should load them, not key them.
- **The IRS high-low method**, one high rate for a published list of high-cost localities and one low rate for the rest of CONUS. Notice 2026-60 sets, for allowances paid on or after October 1, 2026, $329 for high-cost localities and $230 elsewhere, with $86 and $74 respectively treated as paid for meals under section 274(n); the M&IE-only rates are the same $86 and $74. It added Tucson, San Mateo, Albuquerque and Cody to the high-cost list and removed Panama City. Transportation-industry M&IE is $80 in CONUS and $86 outside it, and the incidental-expenses-only rate is $5 a day.

The rules that become engine logic:

- **Lesser of.** The amount deemed substantiated each day is the lesser of the allowance actually paid and the federal (or high-low) rate. An employer paying 120% of the federal rate has paid 20% wages, withheld in the payroll period the reimbursement is paid (Rev. Proc. 2019-48 section 8.05 works exactly that example).
- **One method per employee per year.** An employer using high-low for an employee must use it for all of that employee's CONUS travel for the calendar year (section 5.03). For travel in October through December, it keeps the method used in the first nine months, and may apply either the old or the new rates and high-cost list, as long as it does so consistently for all employees on high-low (section 5.04). The method is therefore an attribute of the employee and calendar year, and the rate table choice for the last quarter is an attribute of the employer and year.
- **Partial days.** M&IE for a day of departure or return is prorated either at three-fourths of the rate, as the Federal Travel Regulation does (41 CFR 301-11.101), or by any method consistently applied and consistent with reasonable business practice (section 6.04).
- **Related parties.** The per diem and high-low methods for lodging don't apply when the employer and employee are related under section 267(b) with a 10% ownership threshold (section 6.07); a founder who owns the company is reimbursed on actual lodging receipts.
- **Unsubstantiated days are returned; excess on substantiated days is taxed.** An advance for five days when the employee substantiates three must have the two unsubstantiated days' share returned within a reasonable period; the part of the allowance for the three days that exceeds the federal rate doesn't have to be returned but is wages (section 7.02's example: a $250 advance, $100 returned, $12 taxed).

### Worked Numbers: A High-Low Trip

An employee leaves Monday morning for a high-cost locality under Notice 2026-60, stays two nights and returns Wednesday evening. The employer uses high-low and the three-fourths rule for travel days, paying lodging per night away and M&IE per day:

| Day | Lodging ($329 less $86 M&IE) | M&IE | Allowance |
| --- | --- | --- | --- |
| Monday (departure, a night away) | $243.00 | 75% of $86 = $64.50 | $307.50 |
| Tuesday (full day) | $243.00 | $86.00 | $329.00 |
| Wednesday (return, no night) | | 75% of $86 = $64.50 | $64.50 |
| **Total** | | | **$701.00** |

Paid at those amounts, all $701.00 is deemed substantiated once the employee records the dates, the place and the purpose, with no hotel receipt. If the employer instead advanced a flat $329 a day for three days ($987), the $286 above the deemed substantiated amount is wages for the substantiated days, and if the trip was cut to one night, the unsubstantiated day's share must be returned within the reasonable period. Of the $701.00, $86 per full day (prorated on travel days, $215.00 here) is the meal portion the employer treats under the section 274(n) meal limitation in its own deduction.

## Advances and Repayments

Money can move before the expense: a **travel advance** paid within 30 days before the trip under the fixed date method, then substantiated and the excess returned within its windows. And it can move the other way: an employee who put a personal charge on the corporate card owes it back. Ramp's repayment options are typical: an ACH debit from the employee's bank account (about five business days, plus one to three to verify a new account), a debit card for some employees, or settlement off-platform "via payroll deduction, wire transfer, check, or another method", marked repaid only after it settles. Netting an advance or a personal charge against the next reimbursement is the cheapest route but needs a ledger that records both items and the netting, not a smaller reimbursement with no explanation. A payroll deduction for a repayment is a wage deduction, which state wage payment laws restrict; that check belongs to the payroll provider and counsel, and the expense system should record the employee's written authorization when it hands a deduction over.

## Paying Out: ACH, Wire or Payroll

Three routes, with different owners of the tax line:

- **ACH or wire from the business's account.** The platform debits the business's operating account (often its own business account on the same platform, [Business Accounts & Startup Banking](/books/banking-and-lending/business-accounts) covers those) and credits the employee's account by ACH, or by wire abroad. It's an outbound credit on the rails the Payments volume owns: an ACH credit to a consumer account with its returns ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)) and its Nacha account validation choices ([Validating the Account](/books/payments/ach#validating-the-account)). Only accountable amounts should go this way, because nothing on this route withholds tax.
- **Payroll.** The expense system exports approved reimbursements to the payroll provider, which pays them with the next paycheck as a non-taxable reimbursement line, and pays any nonaccountable excess as a taxable line with withholding. This is the only route that handles both halves of a mixed item in one payment, which is why the export is per item with its accountable and taxable split, not a lump sum.
- **Outside the system.** A check or an internal payment system, recorded as paid so the report closes.

Reimbursement ACH files are consumer credits from a business account, so a changed employee bank account carries the same fraud risk as a changed vendor account: an attacker who controls an employee's login redirects the next reimbursement. The controls in [Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account) (out-of-band confirmation, a hold on the first payment to new details, a notice to the old contact) apply with an employee in the vendor's seat. Batching one debit per employee per run, as Ramp offers, cuts the number of debits on the business's statement; it doesn't change the ledger, which still has one item per expense.

Cross-border reimbursement adds currency: the expense is in the currency spent, the reimbursement in the employee's home currency, and the rate used is policy (the card's posted rate, a daily reference rate, or the employee's own statement). Store all three amounts and the rate source ([Multi-Currency](/docs/payments/multi-currency)). International mileage uses the country's own rate where there is one, as Ramp does, and each country's tax treatment, which the IRS rules here don't decide.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model): the business is a `parties` row (`kind = 'business'`), each employee a `parties` row (`kind = 'person'`), and every payout is a `transactions` row on the business's funding account with its journal entry. What a reimbursement repays is an `expenses` row from [Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management#how-to-build-it), whose `source` is already `out_of_pocket`, `mileage` or `per_diem`; this chapter adds the rates and the plan, the mileage and per diem detail behind those expenses, advances, repayments and the payout.

```sql
CREATE TABLE reimbursement_rates (         -- IRS, GSA and employer rates, effective-dated
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  kind            TEXT NOT NULL CHECK (kind IN ('mileage_business', 'mileage_medical',
                    'per_diem_federal', 'mie_federal', 'high_low', 'high_low_mie',
                    'transportation_mie', 'incidentals_only', 'country_mileage')),
  publisher       TEXT NOT NULL CHECK (publisher IN ('irs', 'gsa', 'state_dept', 'dod',
                    'foreign_authority', 'employer')),
  business_id     UUID REFERENCES parties (id),  -- set only for an employer's own rate
  locality        TEXT,                          -- GSA locality or 'high_cost' / 'other_conus'
  country         CHAR(2),
  season          DATERANGE,                     -- seasonal lodging rates within the year
  lodging_amount  BIGINT,                        -- minor units per night
  mie_amount      BIGINT,                        -- per full day
  meal_portion    BIGINT,                        -- the section 274(n) meal share
  per_mile        NUMERIC(8, 4),                 -- dollars per mile, e.g. 0.7250
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  source_ref      TEXT NOT NULL,                 -- 'Announcement 2026-11', 'Notice 2026-60', 'FTR 27-01'
  valid_during    DATERANGE NOT NULL,            -- by date of travel or expense
  EXCLUDE USING gist (kind WITH =, publisher WITH =, COALESCE(business_id::text, '') WITH =,
    COALESCE(locality, '') WITH =, COALESCE(country, '') WITH =, valid_during WITH &&)
);

CREATE TABLE accountable_plans (           -- an employer's plan terms, per calendar year
  business_id         UUID NOT NULL REFERENCES parties (id),
  plan_year           INT NOT NULL,
  reasonable_period   TEXT NOT NULL CHECK (reasonable_period IN ('fixed_date',
                        'periodic_statement', 'facts_and_circumstances')),
  substantiate_days   INT NOT NULL DEFAULT 60,
  return_days         INT NOT NULL DEFAULT 120,
  advance_days        INT NOT NULL DEFAULT 30,
  per_diem_method     TEXT CHECK (per_diem_method IN ('none', 'federal', 'high_low',
                        'mie_only')),
  q4_rates            TEXT CHECK (q4_rates IN ('prior', 'updated')),  -- Rev. Proc. 2019-48 5.04
  partial_day_rule    TEXT NOT NULL DEFAULT 'three_fourths' CHECK (partial_day_rule IN
                        ('three_fourths', 'employer_method')),
  mileage_rate_id     UUID REFERENCES reimbursement_rates (id),  -- null: the IRS rate on the trip date
  document_ref        TEXT NOT NULL,       -- the written policy in force
  PRIMARY KEY (business_id, plan_year)
);

CREATE TABLE mileage_trips (              -- the detail behind an expense with source 'mileage'
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  expense_id        UUID NOT NULL REFERENCES expenses (id),  -- one expense may cover several trips
  business_id       UUID NOT NULL REFERENCES parties (id),
  employee_id       UUID NOT NULL REFERENCES parties (id),
  trip_date         DATE NOT NULL,
  origin            TEXT NOT NULL,
  destination       TEXT NOT NULL,
  purpose           TEXT NOT NULL,
  miles             NUMERIC(9, 2) NOT NULL CHECK (miles > 0),
  miles_source      TEXT NOT NULL CHECK (miles_source IN ('entered', 'computed_route',
                      'gps', 'odometer')),
  computed_miles    NUMERIC(9, 2),       -- the route figure, kept when the employee overrides
  rate_id           UUID NOT NULL REFERENCES reimbursement_rates (id),  -- resolved by trip_date
  paid_per_mile     NUMERIC(8, 4) NOT NULL,  -- what the policy pays
  standard_per_mile NUMERIC(8, 4) NOT NULL,  -- the IRS rate that day
  amount            BIGINT NOT NULL,         -- miles x paid_per_mile, rounded once
  taxable_excess    BIGINT NOT NULL DEFAULT 0,  -- miles x (paid - standard) when positive
  submitted_at      TIMESTAMPTZ
);

CREATE TABLE per_diem_claims (             -- one row per traveler per day, behind a 'per_diem' expense
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  expense_id        UUID NOT NULL REFERENCES expenses (id),
  business_id       UUID NOT NULL REFERENCES parties (id),
  employee_id       UUID NOT NULL REFERENCES parties (id),
  trip_id           UUID REFERENCES trips (id),  -- Business Travel & Duty of Care, if booked
  travel_date       DATE NOT NULL,
  locality          TEXT NOT NULL,
  day_kind          TEXT NOT NULL CHECK (day_kind IN ('full', 'departure', 'return',
                      'same_day')),
  lodging_night     BOOLEAN NOT NULL,
  method            TEXT NOT NULL CHECK (method IN ('federal', 'high_low', 'mie_only')),
  rate_id           UUID NOT NULL REFERENCES reimbursement_rates (id),
  allowance_paid    BIGINT NOT NULL,
  deemed_substantiated BIGINT NOT NULL,  -- lesser of allowance and the rate, prorated
  taxable_excess    BIGINT GENERATED ALWAYS AS
                      (GREATEST(allowance_paid - deemed_substantiated, 0)) STORED,
  meal_portion      BIGINT NOT NULL,     -- for the employer's 274(n) limitation
  substantiated_at  TIMESTAMPTZ,         -- time, place and purpose recorded
  UNIQUE (employee_id, travel_date)      -- one per diem per traveler per day
);

CREATE TABLE expense_advances (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id      UUID NOT NULL REFERENCES parties (id),
  employee_id      UUID NOT NULL REFERENCES parties (id),
  purpose          TEXT NOT NULL,
  amount           BIGINT NOT NULL CHECK (amount > 0),
  paid_on          DATE NOT NULL,
  expected_from    DATE NOT NULL,        -- first expense date it covers
  substantiate_by  DATE NOT NULL,        -- computed from the plan, stored
  return_by        DATE NOT NULL,
  substantiated    BIGINT NOT NULL DEFAULT 0,
  returned         BIGINT NOT NULL DEFAULT 0,
  status           TEXT NOT NULL CHECK (status IN ('open', 'settled', 'taxed')),
  transaction_id   UUID REFERENCES transactions (id)
);

CREATE TABLE reimbursements (              -- one payout to one employee
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id      UUID NOT NULL REFERENCES parties (id),
  employee_id      UUID NOT NULL REFERENCES parties (id),
  route            TEXT NOT NULL CHECK (route IN ('ach', 'wire', 'payroll', 'outside')),
  destination_token TEXT,                -- vaulted employee account; null for payroll and outside
  amount           BIGINT NOT NULL CHECK (amount > 0),   -- accountable amount paid
  taxable_amount   BIGINT NOT NULL DEFAULT 0,            -- sent to payroll as wages
  currency         CHAR(3) NOT NULL,
  funding_transaction_id UUID REFERENCES transactions (id),  -- the debit on the business account
  payroll_export_ref TEXT,               -- the payroll provider's batch or line ID
  status           TEXT NOT NULL CHECK (status IN ('approved', 'scheduled', 'sent',
                     'paid', 'returned', 'canceled', 'marked_paid')),
  idempotency_key  TEXT NOT NULL UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reimbursement_items (         -- what each payout repays, and how it is taxed
  reimbursement_id UUID NOT NULL REFERENCES reimbursements (id),
  source_kind      TEXT NOT NULL CHECK (source_kind IN ('expense', 'advance_offset',
                     'repayment_offset')),
  source_id        UUID NOT NULL,        -- expenses.id, expense_advances.id or employee_repayments.id
  accountable      BIGINT NOT NULL,
  taxable          BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (reimbursement_id, source_kind, source_id)
);

CREATE UNIQUE INDEX expense_paid_once ON reimbursement_items (source_id)
  WHERE source_kind = 'expense';

CREATE TABLE employee_repayments (         -- money the employee owes back
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id      UUID NOT NULL REFERENCES parties (id),
  employee_id      UUID NOT NULL REFERENCES parties (id),
  reason           TEXT NOT NULL CHECK (reason IN ('personal_card_charge', 'unspent_advance',
                     'overpaid_reimbursement')),
  source_id        UUID NOT NULL,        -- the card transaction, advance or reimbursement
  amount           BIGINT NOT NULL CHECK (amount > 0),
  method           TEXT CHECK (method IN ('ach_debit', 'debit_card', 'payroll_deduction',
                     'netted', 'outside')),
  deduction_authorization_ref TEXT,      -- the employee's written consent, for payroll
  status           TEXT NOT NULL CHECK (status IN ('requested', 'pending', 'settled',
                     'failed', 'written_off', 'taxed')),
  transaction_id   UUID REFERENCES transactions (id)
);
```

Design notes:

- **Resolve rates by the date of travel, store the result.** A mileage trip records the rate row it used and both the paid and standard per-mile figures, so a 2026 audit can see 72.5 cents on June 24 and 76 cents on July 14 without replaying the rate table. A rate table correction is a new row, never an update to an old one.
- **Clocks are columns.** Substantiate-by and return-by dates are computed from the plan when an item is created and stored ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)); a nightly job moves items past their dates to taxable and emits `reimbursement.taxable_due` to the payroll export.
- **Accountable and taxable are separate amounts on every item.** The payroll route gets both, the ACH route only the accountable part, and year-end W-2 inputs are a sum over `reimbursement_items.taxable` by employee and year, which already includes each trip's and day's taxable excess.
- **Paid once.** The partial unique index stops an expense (and so the trips and per diem days behind it) from appearing on two payouts, and moves the expense to `reimbursed`, and the payout's idempotency key (employee, run, attempt) stops a retried ACH from sending twice ([Idempotency](/docs/payments/idempotency)). A returned ACH reopens the expenses for the next run instead of creating new ones.
- **The per diem method lives on the plan year.** `accountable_plans.per_diem_method` and `q4_rates` enforce section 5.03 and 5.04: an employee's claims in a year all use the plan's method, and the October to December rows use the prior or updated table as the plan says.
- **Emit events.** `mileage_trip.submitted`, `per_diem.substantiated`, `reimbursement.sent`, `reimbursement.returned`, `advance.overdue` and `repayment.settled` feed approvals, the payroll export and the accounting sync.

## Auditing

Reimbursement records answer an IRS employment tax examination (were these amounts wages?), an employee's wage claim, a fraud investigation and the business's own auditors. The general rules are in [Audit Trails](/docs/architecture/audit-trails); make sure the record shows:

- **The plan in force,** its written policy document and its terms for each year, because accountable status depends on how the arrangement was designed, not only how one item was paid.
- **For each mileage trip,** date, origin, destination, purpose and miles, how the miles were produced, any override of a computed route and who made it, and the rate applied.
- **For each per diem day,** the locality, the rate row and method, the partial-day rule, and when the time, place and purpose were substantiated.
- **Every clock and its outcome:** when each item was substantiated or returned, against its dates, and every amount moved to taxable and the payroll export that carried it.
- **Every payout,** with its route, destination as of that moment, approvals, the funding debit, the outbound credit and any return, and every change to an employee's payment destination with its verification ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Every repayment and deduction,** with the employee's authorization where payroll was used.

## What This Means for the System You Build

- **Model the accountable plan explicitly,** per employer and year, with its reasonable-period method, per diem method and fourth-quarter rate choice.
- **Effective-date every rate by the date of travel,** load GSA and IRS tables from their publications, and keep 2026's two mileage rates as two rows.
- **Compute deemed substantiated as the lesser of the allowance and the rate,** per trip and per day, and store the taxable excess beside it.
- **Run the substantiation and return clocks** from each expense date and move overdue amounts to taxable automatically.
- **Pay accountable amounts by ACH or wire, taxable amounts through payroll,** with the split carried per item.
- **Treat an employee's bank account change like a vendor's,** with out-of-band confirmation and a first-payment hold.
- **Record advances, repayments and netting as ledger items,** never as a silently smaller payout.
- **Keep how mileage was measured,** and the computed route when an employee overrides it.

## References

**Law and regulation**

- [26 CFR 1.62-2, reimbursements and other expense allowance arrangements](https://www.law.cornell.edu/cfr/text/26/1.62-2), the business connection, substantiation and return requirements, the fixed date (30, 60 and 120 days) and periodic statement (quarterly, 120 days) safe harbors, withholding timing and the abuse rule
- [26 CFR 1.274-5, substantiation requirements](https://www.law.cornell.edu/cfr/text/26/1.274-5), documentary evidence for lodging and expenditures of $75 or more, what a receipt shows, and substantiation of mileage under (j)(2)

**Regulators and guidance**

- [IRS: Standard mileage rates](https://www.irs.gov/tax-professionals/standard-mileage-rates), the 2025 and 2026 business, medical and moving and charitable rates with their news releases
- [IRS: Internal Revenue Bulletin 2026-29, Announcement 2026-11](https://www.irs.gov/irb/2026-29_irb), the 76 and 23.5 cent rates for expenses and allowances on or after July 1, 2026, Notice 2026-10 governing earlier ones
- [IRS: Internal Revenue Bulletin 2026-43, Notice 2026-60](https://www.irs.gov/irb/2026-43_irb), the 2026-2027 high-low rates of $329 and $230, the $86 and $74 meal and M&IE amounts, transportation-industry and incidental rates, high-cost locality changes, effective October 1, 2026
- [IRS: Rev. Proc. 2019-48](https://www.irs.gov/pub/irs-drop/rp-19-48.pdf), per diem substantiation, the high-low method and its calendar-year limitation and transition rules, partial-day proration, the related-party rule, return of excess and withholding examples
- [IRS: Rev. Proc. 2019-46](https://www.irs.gov/pub/irs-drop/rp-19-46.pdf), mileage allowances deemed substantiated at the lesser of the allowance and the standard rate, FAVR allowances, and return of excess for unsubstantiated miles
- [Federal Register: GSA, Maximum Per Diem Reimbursement Rates for the Continental United States (September 10, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/09/10/2026-18439.html), FTR Bulletin 27-01, the $113 standard lodging and $68 M&IE rates and 295 non-standard areas for FY 2027
- [GSA: Per diem rates](https://www.gsa.gov/travel/plan-a-trip/per-diem-rates), the lookup, flat files and API, and the FY 2027 rates becoming the default on October 1, 2026

**Vendor documentation**

- [Expensify: Reimbursement payment methods](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Reimbursement-Payment-Methods), ACH and global reimbursement, timing, Rapid Reimbursement limits and Pay elsewhere
- [Ramp: Reimbursements overview for admins](https://support.ramp.com/reimbursements-overview-for-admins), funding from the company account, three-business-day payment, batching, mileage calculation and rate settings, international wires, payments outside Ramp
- [Ramp: Employee repayments](https://support.ramp.com/hc/en-us/articles/4617080010259-Employee-repayments), ACH repayments in about five business days, debit card, and off-platform settlement including payroll deduction
