+++
title = "Contractors & 1099s"
description = "Contractor reporting: W-9s, TIN Matching, 24% backup withholding and B-notices, 1099-NEC and 1099-MISC at $2,000, IRIS after FIRE, and state filing."
category = "Workforce Industry"
order = 2652
part = "Contractors and Global"
tags = ["contractors", "form-1099", "backup-withholding", "tin-matching", "information-returns", "iris"]
+++

An independent contractor isn't on payroll in the legal sense: there's no withholding, no FICA match, no unemployment tax and no W-2. What the payer owes instead is information. It collects a Form W-9 with the contractor's name and taxpayer identification number, checks the pair against the IRS's records, withholds 24% of each payment if the number is missing or the IRS says it's wrong, reports the year's payments on Form 1099-NEC or 1099-MISC to the contractor and the IRS by January 31, and forwards the same records to the states that want them. Payroll providers sell contractor payments beside payroll for that reason: the money movement is easy, the reporting is the product.

Three things changed for tax year 2026. The reporting threshold for nonemployee compensation and most 1099-MISC boxes rose from $600 to $2,000 for payments in tax years beginning after 2025, with inflation adjustments from 2027, and the backup withholding threshold moved with it. The 1099-NEC was restructured, adding boxes for cash tips, the Treasury Tipped Occupation Code and overtime. And the IRS's FIRE system, through which information returns were filed for decades, takes its last filing on November 19, 2026; returns for tax year 2026 go through IRIS. This chapter covers the W-9, TIN Matching, backup withholding and the B-notice program with its clocks, the two forms box by box, due dates and penalties, IRIS, state filing, contractors abroad, and contractor payments as a product. Whether a worker may be treated as a contractor at all is in [Worker Classification](/books/workforce/worker-classification); the vendor side of the same rules (bills, virtual cards, 1099-K) is in the Payments volume's [Tax: W-9s, TIN Matching and 1099s](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s).

## How the Platforms Do It

Embedded payroll APIs model contractors as their own object with their own payment, beside employees. As of November 2026:

| Platform | Contractor | Payment | 1099 |
| --- | --- | --- | --- |
| **Check** | `type` individual or business; `ein`, `ssn_last_four`, an `ssn_validation_status` of pending, validated or invalid; an `onboard` status with blocking and remaining steps; `1099_nec_electronic_consent_provided` | One contractor payment per contractor per payroll; `amount`, a `reimbursement_amount` that "will not be included on the contractor's 1099," `net_pay`; statuses draft, pending, processing, failed, partially_paid and paid | A 1099-NEC object with statuses draft, published and pending_correction, `delivery_method` manual or mail, and `amends`; "Check does not publish contractor tax statements in production yet" |
| **Gusto Embedded** | Onboarding with `self_onboarding` (status `self_onboarding_started` through `onboarding_completed`); "Gusto does not send emails directly to contractors" | Contractor payment groups created with a `creation_token` after a preview that returns `expected_debit_date` and `submission_blockers`; wage type hourly or fixed; direct deposit, check or historical payment; direct deposit cancelable until 4:00 pm PST on the deadline day | Form type `US_1099`; "Contractor 1099 Forms are generated at the end of the calendar year" |
| **Zeal** | Contractors beside employees; "there are no taxes for the employer to pay" | A contractor payment with `pay_date`, `amount`, `disbursement`, `speed` and statuses pending, pre-processed and processed; six disbursement methods including prepaid, paycard and instant pay | 1099s among documents |

Two patterns repeat. The TIN check is a status on the contractor (Check's `ssn_validation_status`), because a payment to a contractor without a valid TIN triggers backup withholding. And the 1099 is generated from the year's payments, not entered, with a correction status, because January corrections are routine. None of the three says in its public docs that it files the 1099s with the IRS and states on the partner's behalf; whoever files needs the records this chapter builds.

## The W-9

Form W-9 (revision March 2024) is how a payer gets a US payee's name and TIN. Under penalties of perjury the payee certifies four things: "The payee's TIN is correct"; "The payee is not subject to backup withholding due to failure to report interest and dividend income"; "The payee is a U.S. person"; and that any FATCA exemption code entered is correct. The 2024 revision added line 3b, which partnerships, trusts and estates check "to indicate if they have foreign partners, owners, or beneficiaries"; a flow-through entity receiving one may rely on it "unless you know that it is incorrect." An exemption code for FATCA doesn't affect backup withholding.

What the payer stores from a W-9 is more than the TIN: the name line exactly as written (the name the IRS matches against), the business name, the federal tax classification (individual or sole proprietor, C corporation, S corporation, partnership, trust or estate, LLC with its tax classification), any exempt payee code, the address, the signature date and the form revision. The classification decides reportability: "Generally, payments to a corporation" aren't reported on 1099-MISC or 1099-NEC, with exceptions for attorneys' fees, medical and health care payments, fish purchases and substitute payments. The TIN is classified and vaulted like an SSN, because for a sole proprietor it often is one ([Classify Every Field](/docs/security/sensitive-data#classify-every-field)).

A substitute W-9 (an onboarding web form instead of the IRS PDF) is allowed if it carries the same certifications; the electronic signature and the certification text shown are part of the record.

## TIN Matching

The IRS's TIN Matching program lets a payer check a name and TIN combination before filing. It "is only for payers and their authorized agents that submit information returns"; the payer must be in the IRS's Payer Account File and applies through e-Services as an authorized payer of income subject to backup withholding. Payers of Forms 1099-B, DIV, INT, K, MISC, NEC, OID, G and PATR may be eligible. "Interactive or bulk options are available." <!-- source-gap: wf-tin-matching-limits | missing | TIN Matching interactive and bulk request limits and the result codes returned | closes with: IRS Publication 2108A, opened (the PDF returned 404 on Nov 10, 2026) | checked: 2026-11-10 --> The per-request limits and the result codes are in Publication 2108A, which wasn't reachable when I checked, so I don't state them here.

The design point is when to match: at onboarding, before the first payment, so a mismatch is fixed by asking the contractor instead of by a CP2100 a year later. A mismatch result is a reason to solicit a corrected W-9, not by itself a reason to backup withhold; the IRS's notice is.

## Backup Withholding

A payer must "withhold at the current rate of 24 percent" from reportable payments when the payee hasn't given a TIN, the IRS has notified the payer that the TIN is incorrect, the IRS has notified the payer of underreporting, or the payee fails to certify that they aren't subject to it. The IRS runs two programs: BWH-B, when a payee "failed to provide a correct taxpayer identification number," and BWH-C, for underreported interest or dividends. The payments covered include independent contractor payments, rents, royalties and attorney fees. For tax years beginning after 2025, the minimum threshold for reporting and backup withholding on these payments is $2,000 (IRS Publication 1099 for 2026).

Backup withholding is not payroll withholding. It's reported on Form 945, the annual return of withheld federal income tax for nonpayroll payments, "by February 1, 2027" for 2026, or February 10, 2027 if every deposit was made on time. Deposits follow their own schedule: generally none if the year's total is under $2,500; monthly for 2027 if the 2025 Form 945 total was $50,000 or less and semiweekly if more; the $100,000 next-day rule applies; and Form 945 deposits can't be combined with Form 941 deposits. So the engine keeps backup withholding liabilities in their own deposit stream, with their own lookback, beside the employer's 941 stream ([The Deposit Schedule](/books/workforce/deposits-and-returns#the-deposit-schedule)).

### Worked Numbers: A Contractor With No TIN

An invented contractor starts work in 2026 without returning a W-9 and is paid $3,000.00 in March:

| Line | Amount |
| --- | --- |
| Invoice | $3,000.00 |
| Backup withholding, 24% | −$720.00 |
| Paid to the contractor | $2,280.00 |
| Form 945 liability | $720.00 |
| 1099-NEC box 1a, nonemployee compensation | $3,000.00 |
| 1099-NEC box 4, federal income tax withheld | $720.00 |

The 1099-NEC reports the gross, not the net, and the withholding is credited to the contractor on their return. If the contractor supplies a W-9 in April, withholding stops for later payments; amounts already withheld aren't refunded by the payer. A payer that can't yet know whether a new payee will reach $2,000 for the year has a choice the pages I opened don't resolve; my default is to withhold from the first payment when no TIN is on file, because a withheld amount is always reportable and an unwithheld one can't be recovered from a payee who never sends a W-9.

## B-Notices and Their Clocks

The IRS tells payers about name and TIN mismatches on filed returns with a CP2100 (to payers with 50 or more erroneous returns) or CP2100A (fewer than 50). Publication 1281 sets the payer's clock:

| Step | Deadline |
| --- | --- |
| **Send the first "B" Notice** (with a W-9 for the payee to return) | "15 business days from the date of the CP2100A or CP2100 Notice, or the date you received it (whichever is later)" |
| **Begin backup withholding** if no corrected certification comes back | "no later than 30 business days after you have received the CP2100 or CP2100A Notice" |
| **Stop backup withholding** | "within 30 calendar days after you have received the required certification (Form W-9)," or, after a second notice, the TIN validation from SSA or IRS |
| **Second "B" Notice** | Required "after you receive a second CP2100 or CP2100A Notice within a 3 calendar year period" for the same account; no W-9 enclosed: "The payor must receive validation of the payee's Name/TIN combination from SSA or IRS," such as a copy of the Social Security card, or IRS Letter 147C for an EIN, 685C for an ITIN or 096C for an ATIN |
| **Limit** | "Generally, you do not have to send a 'B' Notice more than two times within three calendar years to the same account" |

For missing or obviously incorrect TINs, the payer "must begin backup withholding on all reportable payments immediately" and makes up to three solicitations: an initial one, a first annual solicitation by December 31 of the year the account is opened (January 31 if opened in December), and a second annual one by December 31 of the following year.

### Worked Numbers: The Clock on One Notice

An invented payer receives a CP2100A on Friday, September 18, 2026, listing a contractor. Counting business days as weekdays other than federal holidays (Columbus Day is Monday, October 12):

| Event | Date |
| --- | --- |
| CP2100A received | Fri, Sep 18 |
| First B Notice and W-9 mailed, at the latest | Fri, Oct 9 (15 business days: Sep 21 to Oct 9) |
| Backup withholding must begin if no W-9 has come back | Mon, Nov 2 (30 business days after receipt) |
| Contractor returns a signed W-9 on Tuesday, November 10 | Withholding must stop by Thursday, December 10 (30 calendar days) |

If the same contractor appears on another CP2100A in 2028, it's a second notice within three calendar years: the payer sends the second B Notice, and only an SSA or IRS validation, not a new W-9, stops withholding.

## Forms 1099-NEC and 1099-MISC

For tax year 2026, the IRS instructions say to "Use the December 2026 revision of Form 1099-MISC and Form 1099-NEC." The boxes a payroll or contractor platform fills:

| Form and box | What | 2026 threshold |
| --- | --- | --- |
| **NEC 1a** | Nonemployee compensation | $2,000 |
| **NEC 1b, 1c, 1d** | Cash tips, the Treasury Tipped Occupation Code and overtime compensation (new for 2026) | With box 1a |
| **NEC 2** | Direct sales of consumer products for resale (checkbox) | $5,000 |
| **NEC 3** | Excess golden parachute payments (moved from 1099-MISC) | Any |
| **NEC 4** | Federal income tax withheld (backup withholding) | Any |
| **NEC 5 to 7** | State tax withheld, state and payer's state number, state income | |
| **MISC 1** | Rents | $2,000 |
| **MISC 2** | Royalties | $10 |
| **MISC 3** | Other income | $2,000 |
| **MISC 6** | Medical and health care payments | $2,000 |
| **MISC 10** | Gross proceeds paid to an attorney | $600 (unchanged) |
| **MISC 11** | Fish purchased for resale | $600 |
| **MISC 13a, 13b, 14** | Tips, the tipped occupation code and overtime | |
| **MISC 15** | Nonqualified deferred compensation | |

Two exceptions decide most edge cases. Payments to corporations generally aren't reported, except attorneys' fees, medical payments and a few others. And payments made by card or through a third-party payment network "must be reported on Form 1099-K by the payment settlement entity," not by the payer on a 1099-NEC, so the payer's 1099 totals depend on the payment method. The new tips and overtime boxes connect to the 2025 tax law's deductions ([What Employers Report](/books/workforce/tips-and-the-2025-deductions#what-employers-report)).

### Worked Numbers: Four Payees in 2026

Invented payees and payments, all for services, for tax year 2026:

| Payee | Paid by | Total | Form |
| --- | --- | --- | --- |
| A sole proprietor designer | ACH $1,800 | $1,800 | None: below $2,000 (it would have been reportable for 2025) |
| A freelance developer | ACH $1,500, card $900 | $2,400 | None from the payer: ACH is $1,500, below $2,000; the card payments are the payment settlement entity's to report on 1099-K |
| A single-member LLC taxed as a sole proprietor | ACH $6,000 | $6,000 | 1099-NEC box 1a $6,000 |
| A law firm organized as a corporation | Check $1,200 | $1,200 | Attorneys are excepted from the corporate exemption: as fees for legal services to the payer, below the $2,000 NEC threshold, so none; as gross proceeds paid to the attorney (a settlement, say), 1099-MISC box 10, whose threshold is still $600 |

The rule that follows: track totals per payee, per form, per box and per payment method, per year, from the day the payee is created, and decide reportability from the W-9's classification and the method, not from a January spreadsheet.

## Due Dates and Penalties

"Section 6071(c) requires you to file Form 1099-NEC on or before January 31," and it's furnished to the recipient by the same date; January 31, 2027 is a Sunday, and the IRS's own 2026 dates move the same way (Form 945 is due "February 1, 2027"), so 2026 forms are due Monday, February 1, 2027. Form 1099-MISC goes to recipients by January 31 and to the IRS by February 28 on paper or March 31 electronically.

Penalties for returns and statements due in 2027 (Rev. Proc. 2025-32, sections 4.57 and 4.58), applied separately to the return filed with the IRS (section 6721) and the statement furnished to the payee (6722):

| When corrected or filed | Per return | Annual maximum (gross receipts over $5 million) | Annual maximum ($5 million or less) |
| --- | --- | --- | --- |
| Within 30 days | $60 | $698,500 | $244,500 |
| After 30 days, by August 1 | $130 | $2,095,500 | $698,500 |
| After August 1, or never | $340 | $4,191,500 | $1,397,000 |
| Intentional disregard | The greater of $690 or 10% of the amount required to be reported, with no maximum | | |

A missing or wrong TIN is a penalty-bearing error, which is the economic case for TIN Matching at onboarding: one $340 penalty on a return and another on its statement cost more than years of matching.

## IRIS and the End of FIRE

IRIS, the Information Returns Intake System, is the IRS's replacement for FIRE, with two channels: the Taxpayer Portal, which is free and lets a filer "E-file up to 100 returns at a time" by entry or CSV upload, and Application to Application (A2A) for software, "up to 100 MB at a time." IRIS uses its own five-digit Transmitter Control Code, which "can only be used for IRIS." From October 7, 2026, A2A transmissions to the IRIS Assurance Testing System for tax years 2022 through 2026 use schema version 5.0.7, so a platform's test transmissions already run on the schema it will file with.

FIRE's retirement is dated: "Nov. 19, 2026, at 3 p.m. Eastern time: Last day to file information returns through the FIRE system" (IRS FIRE page), and "After the November maintenance window, filers will no longer be able to submit information returns through FIRE" (IR-2026-99, August 24, 2026). Tax year 2026 returns, filed in the 2027 season, go through IRIS: "Beginning in 2027, all forms previously supported by FIRE will be available through IRIS." A platform that built its 1099 pipeline on FIRE's fixed-width Publication 1220 format must have an IRIS XML pipeline, a new TCC and tested schemas before January 2027; Publication 1099 for 2026 says IRIS "will be the only intake system," and the FIRE page says the same of every information return after January 1, 2027, so late and corrected returns for earlier years have nowhere else to go once FIRE closes; IRIS's schemas cover tax years 2022 onward. The submission and reject mechanics follow the same pattern as other bulk filings ([Rejects and Resubmission](/books/workforce/tax-engines-and-filing#rejects-and-resubmission)).

## State Filing

States that tax income want 1099 data too. The Combined Federal/State Filing Program forwards it: "the IRS electronically sends information returns (original and corrected) to participating states," and "Form 1099-NEC is part of the CF/SF Program." Publication 1220 (revision May 2026, FIRE's format for tax year 2025) lists 32 participating jurisdictions: Alabama, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, the District of Columbia, Georgia, Hawaii, Idaho, Indiana, Kansas, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Montana, Nebraska, New Jersey, New Mexico, North Carolina, North Dakota, Ohio, Oklahoma, Pennsylvania, Rhode Island, South Carolina and Wisconsin. It's not the end of the obligation: "The IRS acts as a forwarding agent only. It is the issuer's responsibility to contact the appropriate state(s)," and "Some participating states require separate notification." A payee with income in several states needs a separate state record per state with the amounts prorated. <!-- source-gap: wf-1099-state-direct | missing | which states require 1099-NEC to be filed directly with the state regardless of CF/SF, and their due dates and formats | closes with: state revenue department 1099 filing pages (for example California FTB, 403 on Nov 10, 2026), opened | checked: 2026-11-10 --> Which states also require direct filing, and how, I couldn't confirm from the state pages I tried, so the model treats each state's requirement as its own rule row.

State withholding on contractor payments, where a state requires it, appears in boxes 5 to 7 and is remitted under the state's own rules; it's rarer than for wages and specific to the state.

## Contractors Abroad

A contractor who isn't a US person doesn't give a W-9; they document foreign status on a Form W-8, usually the W-8BEN for an individual ("Certificate of Foreign Status of Beneficial Owner for United States Tax Withholding"). Where the money is sourced decides the rest: compensation for personal services is sourced "where services performed," so a nonresident contractor working entirely abroad has no US-source income from the payment, and no 1099 and no backup withholding apply. Work performed in the United States is US-source income, which for a foreign person is generally subject to 30% withholding, reduced or eliminated by a treaty claimed on the W-8, and reported on Form 1042-S with the annual Form 1042, a separate stream from the 1099s and the 945. A contractor platform that pays people abroad therefore keeps a W-8 in place of the W-9, records where each engagement's work is performed, and routes any US-source payment to the 1042 process instead of this chapter's. The money's path abroad is in [International Payroll](/books/workforce/global-payroll#currencies-and-payment-rails).

## Contractor Payments as a Product

Paying contractors is a payout problem, and the rail mechanics (ACH credits, instant payouts, checks, cards, changed bank accounts) belong to the Payments volume ([Vendor Payouts](/books/payments/vendor-payouts)). What a payroll platform adds:

- **One worker, two possible types.** A person can be a contractor and later an employee of the same employer; the core model's `workers` row carries `worker_type`, and a conversion is a new worker row on the same person, so the 1099 and the W-2 for the same year are both right.
- **Payments inside payroll runs.** Check's one contractor payment per contractor per payroll and Gusto's contractor payment groups both put contractor payments on the employer's funding debit, so they share the funding, failure and recovery paths of payroll ([Funding a Payroll](/books/workforce/funding-a-payroll)).
- **Reimbursements apart from compensation.** Check's `reimbursement_amount` "will not be included on the contractor's 1099," which is a platform choice the employer has to understand; the payment record keeps compensation and reimbursement separate so the 1099 total is a query.
- **Onboarding as a gate.** Self-onboarding collects the W-9, the bank account and the e-delivery consent; a contractor isn't payable until the TIN is on file or backup withholding is configured.
- **E-delivery consent.** Furnishing a 1099 electronically requires the recipient's consent (Check's `1099_nec_electronic_consent_provided`); without it, the form is mailed.

Contractor portals (W-9 updates, payment history, 1099 downloads) are the self-service face of the same records.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Contractors are `workers` rows with `worker_type = 'contractor'` on a `persons` row (an individual) or on a person standing in for a business payee; their payments are `money_movements`; their 1099s are `filings` with per-payee records.

```sql
ALTER TABLE money_movements
  DROP CONSTRAINT money_movements_purpose_check,
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT money_movements_purpose_check CHECK (purpose IN ('client_debit', 'net_pay',
    'tax_payment', 'garnishment', 'benefit', 'refund', 'recovery', 'contractor_payment')) NOT VALID;

CREATE TABLE w9_certifications (           -- every W-9 received, never overwritten
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  name_line           TEXT NOT NULL,         -- line 1, exactly as written: the name IRS matches
  business_name       TEXT,
  tax_classification  TEXT NOT NULL CHECK (tax_classification IN ('individual', 'c_corporation',
                        's_corporation', 'partnership', 'trust_estate', 'llc_c', 'llc_s',
                        'llc_p', 'other')),
  has_foreign_owners  BOOLEAN,               -- line 3b, flow-through entities
  exempt_payee_code   TEXT,
  fatca_code          TEXT,
  tin_kind            TEXT NOT NULL CHECK (tin_kind IN ('ssn', 'ein', 'itin', 'none')),
  tin_token           TEXT,                  -- vaulted
  address             JSONB NOT NULL,
  form_revision       TEXT NOT NULL,         -- 'March 2024' or a substitute form's version
  signed_at           TIMESTAMPTZ,           -- null: not certified, backup withholding applies
  document_id         UUID REFERENCES documents (id),
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tin_match_results (           -- each check against the IRS
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  w9_certification_id UUID NOT NULL REFERENCES w9_certifications (id),
  channel             TEXT NOT NULL CHECK (channel IN ('interactive', 'bulk')),
  result_code         TEXT NOT NULL,         -- as Pub 2108A defines them
  matched             BOOLEAN NOT NULL,
  checked_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE backup_withholding_cases (    -- why withholding started, and when it stops
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  reason              TEXT NOT NULL CHECK (reason IN ('missing_tin', 'not_certified',
                        'cp2100_first', 'cp2100_second', 'underreporting')),
  notice_id           UUID REFERENCES notices (id),     -- the CP2100 or CP2100A
  notice_received_on  DATE,
  b_notice_due_on     DATE,                  -- 15 business days after the later of date or receipt
  b_notice_sent_on    DATE,
  withhold_from       DATE NOT NULL,         -- immediately, or 30 business days after receipt
  cure_received_on    DATE,                  -- a W-9, or SSA/IRS validation after a second notice
  withhold_until      DATE,                  -- 30 calendar days after the cure
  business_calendar   TEXT NOT NULL,
  solicitations       JSONB NOT NULL DEFAULT '[]',   -- initial, first and second annual, dated
  status              TEXT NOT NULL CHECK (status IN ('open', 'withholding', 'cured', 'closed'))
);

CREATE TABLE contractor_payments (         -- one per contractor per run
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  pay_run_id          UUID REFERENCES pay_runs (id),
  service_date_range  DATERANGE,
  compensation_cents  BIGINT NOT NULL CHECK (compensation_cents >= 0),
  reimbursement_cents BIGINT NOT NULL DEFAULT 0,
  backup_withheld_cents BIGINT NOT NULL DEFAULT 0,
  state_withheld_cents BIGINT NOT NULL DEFAULT 0,
  form_box            TEXT NOT NULL DEFAULT 'nec_1a',   -- 'misc_1', 'misc_10', ...
  payment_method      TEXT NOT NULL CHECK (payment_method IN ('ach', 'check', 'wire', 'card',
                        'third_party_network', 'cash', 'other')),
  reportable_by_payer BOOLEAN GENERATED ALWAYS AS
                        (payment_method NOT IN ('card', 'third_party_network')) STORED,
  money_movement_id   UUID REFERENCES money_movements (id),
  liability_id        UUID REFERENCES liabilities (id),  -- the Form 945 liability, if any
  paid_on             DATE NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'processing', 'paid',
                        'failed', 'canceled'))
);

CREATE TABLE form_1099_records (           -- one per payer, payee, form and year
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  tax_year            SMALLINT NOT NULL,
  form                TEXT NOT NULL CHECK (form IN ('1099_nec', '1099_misc')),
  w9_certification_id UUID REFERENCES w9_certifications (id),  -- the name and TIN reported
  boxes               JSONB NOT NULL,        -- {"1a": 600000, "4": 0, "state": [...]}
  filing_id           UUID REFERENCES filings (id),          -- the IRIS submission
  state_filing_ids    UUID[] NOT NULL DEFAULT '{}',
  cfsf_states         TEXT[] NOT NULL DEFAULT '{}',          -- forwarded by the IRS
  furnished_via       TEXT CHECK (furnished_via IN ('mail', 'electronic')),
  furnished_at        TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('draft', 'published', 'filed', 'accepted',
                        'rejected', 'corrected')),
  corrects_record_id  UUID REFERENCES form_1099_records (id),
  UNIQUE NULLS NOT DISTINCT (employer_id, worker_id, tax_year, form, corrects_record_id)
                                             -- one original per year: NULLs must collide
);
```

A contractor payment computes backup withholding from the open `backup_withholding_cases` row for its date, creates a Form 945 `liabilities` row in the 945 deposit stream, and records the method so reportability is derived. At year end, `form_1099_records` are generated per payee and form from `contractor_payments WHERE reportable_by_payer` summed by box, compared with the thresholds for the year from a dated threshold table, and filed through IRIS; a received CP2100 opens cases and schedules the B-notice deadlines on the business calendar. A foreign contractor has a W-8 as a `documents` row instead of a `w9_certifications` row, and its payments stay out of `form_1099_records` entirely.

Design notes:

- **Keep every W-9 as received** and report the name and TIN from the one in force at filing.
- **Match TINs at onboarding,** before the first payment.
- **Backup withholding is a dated case,** with every Publication 1281 clock computed and stored.
- **Separate the 945 deposit stream** from the 941 stream.
- **Total by payee, form, box and method,** and keep card and network payments out of the payer's 1099.
- **File through IRIS** from tax year 2026, with corrections as linked records.

## Auditing

An IRS penalty notice, a B-notice review or a contractor's dispute asks:

- **Every W-9 with its certification,** classification and the date it arrived, and the TIN match results.
- **Every backup withholding case** with the notice, the B-notice sent date, the withholding start and stop, and the cure document.
- **Every contractor payment** with method, box, compensation, reimbursement and withholding.
- **Every 1099 as filed and furnished,** with its submission, acknowledgment, state forwarding and corrections.
- **Form 945 deposits and the return,** reconciled to the year's backup withholding.

## What This Means for the System You Build

- **Collect a W-9 before the first payment** and store its every field, versioned.
- **Run TIN Matching at onboarding** and solicit a corrected W-9 on a mismatch.
- **Withhold 24% from the first payment** when no certified TIN is on file, and track it in its own 945 stream.
- **Compute Publication 1281's clocks** for every CP2100 and second notice.
- **Apply the $2,000 threshold for 2026** from a dated table, with the $600 exceptions for attorneys and fish.
- **Let the payment method decide reportability,** leaving card and network payments to the 1099-K issuer.
- **Move the filing pipeline to IRIS** before January 2027, and track CF/SF forwarding and direct state filing per state.

## References

**Law and regulation**

- [Rev. Proc. 2025-32 (PDF)](https://www.irs.gov/pub/irs-drop/rp-25-32.pdf), sections 4.57 and 4.58, the section 6721 and 6722 penalty amounts for returns and statements due in 2027

**Agency guidance and forms**

- [IRS: Instructions for the Requester of Form W-9 (03/2024)](https://www.irs.gov/instructions/iw9), the certifications, line 3b, FATCA codes and backup withholding conditions
- [IRS: Backup withholding](https://www.irs.gov/businesses/small-businesses-self-employed/backup-withholding), the 24% rate, the BWH-B and BWH-C programs and covered payments
- [IRS: Backup withholding "B" program](https://www.irs.gov/businesses/small-businesses-self-employed/backup-withholding-b-program), CP2100 and CP2100A, first and second B notices, immediate withholding for missing TINs and solicitations
- [IRS Publication 1281: Backup Withholding for Missing and Incorrect Name/TIN(s) (PDF)](https://www.irs.gov/pub/irs-pdf/p1281.pdf), the 15 and 30 business-day clocks, stopping withholding, second notices, SSA and IRS validation letters and the two-in-three-years limit
- [IRS: Instructions for Form 945 (2026)](https://www.irs.gov/instructions/i945), the return for backup withholding, due dates and deposit rules
- [IRS: Taxpayer Identification Number (TIN) Matching](https://www.irs.gov/tax-professionals/taxpayer-identification-number-tin-matching), eligibility, the Payer Account File and interactive and bulk options
- [IRS: Instructions for Forms 1099-MISC and 1099-NEC (December 2026 revision)](https://www.irs.gov/instructions/i1099mec), boxes, thresholds, the corporate exception, Form 1099-K for card payments and due dates
- [IRS Publication 1099 (2026): General Instructions for Certain Information Returns](https://www.irs.gov/publications/p1099), the $2,000 threshold for reporting and backup withholding and IRIS as the only intake system
- [IRS: E-file information returns with IRIS](https://www.irs.gov/filing/e-file-information-returns-with-iris), the Portal and A2A, limits, the IRIS TCC and schema 5.0.7
- [IRS: Filing Information Returns Electronically (FIRE)](https://www.irs.gov/e-file-providers/filing-information-returns-electronically-fire), the last FIRE filing on November 19, 2026
- [IRS: IR-2026-99, information return e-file system transitioning to a new platform](https://www.irs.gov/newsroom/irs-reminder-information-return-e-file-system-transitioning-to-a-new-platform), the end of FIRE and IRIS for tax year 2026
- [IRS: NRA withholding](https://www.irs.gov/individuals/international-taxpayers/nra-withholding), 30% withholding on US-source income of foreign persons, Form W-8BEN and Forms 1042 and 1042-S
- [IRS: Nonresident aliens, source of income](https://www.irs.gov/individuals/international-taxpayers/nonresident-aliens-source-of-income), compensation for services sourced where the services are performed
- [IRS Publication 1220 (Rev. 5-2026) (PDF)](https://www.irs.gov/pub/irs-pdf/p1220.pdf), the Combined Federal/State Filing Program, eligible forms and participating states

**Vendor documentation**

- [Check: The contractor object](https://docs.checkhq.com/reference/the-contractor-object.md), contractor types, SSN validation status, onboarding and e-delivery consent
- [Check: The contractor payment object](https://docs.checkhq.com/reference/the-contractor-payment-object.md), amounts, reimbursements and statuses
- [Check: Contractor tax statements guide](https://docs.checkhq.com/docs/contractor-tax-statements-guide.md), the 1099-NEC object, statuses and delivery
- [Gusto Embedded: Process contractor payments](https://docs.gusto.com/embedded-payroll/docs/process-contractor-payments.md), payment groups, previews, methods and cancellation
- [Gusto Embedded: Onboard a contractor](https://docs.gusto.com/embedded-payroll/docs/onboard-a-contractor.md), self-onboarding statuses
- [Gusto Embedded: Contractor forms guide](https://docs.gusto.com/embedded-payroll/docs/contractor-forms-guide.md), 1099 generation at year end
- [Zeal: Contractor payments guide](https://docs.zeal.com/docs/contractor-payments-guide.md), contractor payments without employer taxes
- [Zeal: The contractor payment object](https://docs.zeal.com/reference/contractor-payments/contractor-payment-object.md), fields, statuses and disbursement methods
