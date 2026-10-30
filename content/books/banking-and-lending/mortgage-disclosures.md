+++
title = "TRID & Mortgage Disclosures"
description = "The Loan Estimate and Closing Disclosure as a scheduling problem: the application trigger, business-day clocks, tolerances, changed circumstances and cures."
category = "Banking & Lending Industry"
order = 2449
part = "Origination and Underwriting"
tags = ["banking", "lending", "mortgages", "trid", "disclosures", "regulation-z", "scheduling"]
+++

A mortgage lender has to tell the borrower what the loan will cost twice, on two federal forms, within clocks that run in two kinds of business days, and then live with the first estimate: most of what the Loan Estimate says about the lender's own fees can't go up at closing, some third-party charges can rise only 10% in total, and anything more comes out of the lender's pocket as a refund. The TILA-RESPA Integrated Disclosure rule (TRID) is Regulation Z's 1026.19(e) and (f) and the forms in 1026.37 and 1026.38. For the people who build loan origination systems, it is the most consequential scheduling problem in consumer lending: an application is defined by six data fields, its arrival starts a three-day clock, the estimate's delivery starts a seven-day waiting period, every changed circumstance starts its own three-day clock, the Closing Disclosure must be received three days before consummation, three kinds of change restart that wait, and the tolerance bucket of every fee decides who pays when the estimate was wrong.

This chapter covers what makes an application, the two business-day definitions, the Loan Estimate and its timing, tolerances, changed circumstances and revised estimates, the Closing Disclosure and its re-disclosure triggers, cures, a worked calendar with real 2026 dates and holidays, and how to build it. The mortgage products are in Mortgages & Home Equity; the APR and finance charge math the forms carry is in [APR, Finance Charges & Rate Caps](/books/banking-and-lending/apr-and-rate-caps); signing, the note and post-closing are in [Closing, eNotes & MERS](/books/banking-and-lending/closing-and-enotes); the origination workflow that hosts these clocks is in [Loan Origination](/books/banking-and-lending/loan-origination).

## How the Platforms Do It

TRID lives inside the loan origination system and the document vendor, with the settlement agent at the end. As of October 2026, from vendor and trade body pages:

| Who | Role | Public detail |
| --- | --- | --- |
| **ICE Encompass** | LOS | Handles "every step of the pre-close, closing and post-closing process directly from your system of record," including MERS registration and recording |
| **DocMagic** | Disclosure and closing documents | "Ensure continuous compliance affecting tolerance levels, calculation reconciliation, potential RESPA violations"; an automated audit at each loan stage; document generation "from initial disclosures to closing" |
| **Settlement agents (ALTA forms)** | The closing table | ALTA settlement statements itemize fees for buyer and seller and are "not meant to replace" the Closing Disclosure |

The split of work: the LOS owns the dates (application, intent to proceed, rate lock, changed circumstances, closing) and the fee data; the document vendor renders the forms and runs the tolerance comparison; the settlement agent may prepare the Closing Disclosure with the lender, but "the creditor remains responsible." Whichever vendor computes a deadline, the lender has to be able to show how.

## The Application Trigger

For TRID, an application is the submission of six pieces of information: the consumer's name, income, Social Security number (to obtain a credit report), the property address, an estimate of the property's value, and the loan amount sought (12 CFR 1026.2(a)(3)(ii)). Once all six are in, the clock starts, whether or not the lender has everything else it wants; collecting a seventh item doesn't delay it. Two consequences:

- **The LOS must timestamp the sixth field,** not the submission of a form, because a borrower can supply them across a call, a web form and an email.
- **No fee before intent to proceed.** Until the consumer has received the Loan Estimate and indicated an intent to proceed, the lender may charge nothing except a bona fide and reasonable credit report fee, and must document the intent to proceed (1026.19(e)(2)(i)).

## Two Kinds of Business Day

Regulation Z has two definitions (1026.2(a)(6)):

- **General:** a day the creditor's offices are open to the public for carrying on substantially all of its business functions. It applies to the three days after application for the Loan Estimate and to the three days to issue a revised estimate after a changed circumstance.
- **Specific:** all calendar days except Sundays and the legal public holidays in 5 U.S.C. 6103(a). It applies to the seven-day waiting period, the mailbox rule, the four-day revised estimate rule, the Closing Disclosure's three days, and rescission.

The federal legal public holidays are New Year's Day, Martin Luther King Jr.'s Birthday, Washington's Birthday, Memorial Day, Juneteenth National Independence Day (June 19), Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving Day and Christmas Day. Under the specific definition, Saturday counts and a holiday doesn't, even if the lender is open; under the general definition, it's the lender's own calendar. A system that computes TRID dates needs both calendars as data per institution, not a weekday function ([Business Dates, Business Days and Holidays](/docs/fundamentals/time#business-dates-business-days-and-holidays)).

## The Loan Estimate

The creditor must deliver or mail the Loan Estimate not later than the **third business day** (general) after receiving the application, and not later than the **seventh business day** (specific) before consummation (1026.19(e)(1)(iii)). If it isn't delivered in person, the consumer is considered to have received it three business days (specific) after it is delivered or mailed (1026.19(e)(1)(iv)), which governs the fee restriction and the revised estimate rules; email counts as not in person unless the lender has evidence of earlier receipt. The seven-day period runs from delivery: an estimate delivered in person on Monday, June 1 has a waiting period that ends Tuesday, June 9, the official commentary's example. The waiting periods may be waived only for a bona fide personal financial emergency, in a dated written statement the consumer writes and signs (no printed forms).

## Tolerances

Good faith is judged against the Loan Estimate, fee by fee, in three buckets (1026.19(e)(3)):

- **Zero tolerance:** a charge is in good faith only if it doesn't exceed the amount originally disclosed. This covers fees paid to the creditor, its affiliates or a mortgage broker, fees for third-party services the consumer wasn't permitted to shop for, and transfer taxes.
- **10% aggregate:** recording fees and charges for third-party services where the consumer may shop and picks from the creditor's written list (and the provider isn't the creditor or its affiliate) are in good faith if their **sum** doesn't exceed the sum disclosed by more than 10%. One fee can rise more than 10% if others fell.
- **No limit, best information:** prepaid interest, property insurance premiums, initial escrow deposits, property taxes, charges for services the consumer shopped for off the creditor's list, and services the creditor didn't require are in good faith if the estimate used the best information reasonably available.

The bucket is a property of the fee and the circumstances (which provider, who chose it, affiliate or not), so it must be recorded per fee line on each disclosure, not derived later from the fee name.

## Changed Circumstances and Revised Estimates

The tolerance baseline can move only for the reasons the rule lists (1026.19(e)(3)(iv)):

- **(A) Changed circumstances** that raise settlement charges: an extraordinary event beyond anyone's control, information specific to the consumer or transaction that the creditor relied on that was inaccurate or changed, or new information it didn't rely on.
- **(B) Eligibility:** a changed circumstance makes the consumer ineligible for an estimated charge or terms.
- **(C) Consumer-requested changes** to terms or settlement that raise charges.
- **(D) Rate lock:** points and lender credits change because the rate wasn't locked when the estimate was given; a revised estimate is due within three business days after the rate is locked.
- **(E) Expiration:** the consumer indicates an intent to proceed more than 10 business days (or a longer period the creditor sets) after the estimate is provided.
- **(F) Delayed settlement on new construction:** settlement is expected more than 60 days after the estimate and the estimate said revisions might come.

A revised Loan Estimate is due **within three business days** (general) of receiving information sufficient to establish the reason (1026.19(e)(4)(i)). The consumer must receive it **not later than four business days** (specific) before consummation, and no revised Loan Estimate may be provided on or after the date the Closing Disclosure is provided (1026.19(e)(4)(ii)). A reason documented late is no reason: if the revision misses its three days, the original figures remain the baseline, and the increase is a cure.

## The Closing Disclosure

The consumer must receive the Closing Disclosure **no later than three business days** (specific) before consummation (1026.19(f)(1)(ii)). Hand delivery on Monday allows a Thursday closing; mailing or emailing on Monday doesn't, because receipt is presumed three business days later. A settlement agent may provide it, but the creditor remains responsible.

Changes after it's provided:

- **Most changes need a corrected disclosure at or before consummation, without a new wait** (1026.19(f)(2)(i)), and the consumer may ask to inspect it during the business day before.
- **Three changes restart the three-day wait** (1026.19(f)(2)(ii)): the APR becomes inaccurate under 1026.22 (more than 1/8 point off for a regular transaction, 1/4 for an irregular one); the loan product changes; or a prepayment penalty is added.
- **After consummation:** an event in the 30 days after that changes an amount the consumer paid needs a corrected disclosure within 30 days of learning of it; non-numeric clerical errors may be corrected within 60 days (1026.19(f)(2)(iii), (iv)).

## Cures

When the consumer paid more than a tolerance allowed, the lender complies by refunding the excess **no later than 60 days after consummation** and providing a corrected Closing Disclosure reflecting the refund within the same 60 days (1026.19(f)(2)(v)). A cure is money: a refund to the borrower (often a lender credit at closing if found before, a check or principal reduction if after), booked as a lender expense, with the corrected form as its disclosure.

## Worked Numbers: A TRID Calendar

A purchase mortgage at a lender whose offices are open Monday through Friday and closed on federal holidays, in late 2026. Thanksgiving is Thursday, November 26; Christmas is Friday, December 25.

| Date | Event | Rule and count |
| --- | --- | --- |
| Fri Nov 20 | Sixth application field received (the property address) | Application under 1026.2(a)(3)(ii); the clock starts |
| Wed Nov 25 | Loan Estimate emailed: the deadline | Third general business day after application: Mon 23 (1), Tue 24 (2), Wed 25 (3) |
| Mon Nov 30 | Loan Estimate presumed received | Three specific business days after sending: Thu 26 is a holiday, so Fri 27 (1), Sat 28 (2), Mon 30 (3) |
| Tue Dec 1 | Borrower indicates intent to proceed; appraisal fee may now be collected | After receipt, documented |
| Wed Dec 2 | Rate locked; discount points rise from $3,000 to $3,600 | Reason (e)(3)(iv)(D) |
| Fri Dec 4 | Revised Loan Estimate emailed | Within three general business days of the lock: Thu 3, Fri 4, Mon 7 is the last day |
| Fri Dec 4 | Seven-business-day waiting period ends | From the original delivery on Nov 25: Fri 27, Sat 28, Mon 30, Tue 1, Wed 2, Thu 3, Fri 4; consummation could be on or after this day |
| Tue Dec 8 | Revised Loan Estimate presumed received | Sat 5 (1), Mon 7 (2), Tue 8 (3); must be by Sat Dec 12 for a Dec 17 closing (four specific days: Mon 14, Tue 15, Wed 16, Thu 17) |
| Thu Dec 10 | Closing Disclosure emailed | No revised Loan Estimate may be provided from today on |
| Mon Dec 14 | Closing Disclosure presumed received | Fri 11 (1), Sat 12 (2), Mon 14 (3); the latest receipt for a Thursday closing |
| Thu Dec 17 | Scheduled consummation | Three specific business days after receipt: Tue 15, Wed 16, Thu 17 |

Three things can go wrong in the last week:

- **A fee changes on Tuesday, December 15** without moving the APR beyond tolerance: a corrected Closing Disclosure at or before consummation, no new wait; the closing holds.
- **The APR becomes inaccurate on December 15** (say, a larger discount point buydown): a corrected Closing Disclosure and a new three-day wait. Handed to the borrower that day, the earliest consummation is Friday, December 18 (Wed 16, Thu 17, Fri 18); emailed, receipt is presumed Friday, December 18 and consummation moves to Monday, December 21.
- **The tolerances failed.** At closing the lender's origination fee is $1,250 against $1,200 on the Loan Estimate with no changed circumstance: zero tolerance, a **$50** cure. The 10% bucket was $2,200 on the estimate (title services from the lender's list $1,800, settlement fee $250, recording $150) and is $2,465 at closing ($2,050, $250, $165); the limit is $2,200 × 1.10 = $2,420, so the cure is **$45**. The $600 increase in discount points isn't a cure because the revised estimate went out within three business days of the lock; had it gone out on Tuesday, December 8, the baseline would have stayed at $3,000 and the cure would have been $600 more. The $95 refund is due by Monday, February 15, 2027 (60 days after December 17), with a corrected Closing Disclosure.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). Every Loan Estimate and Closing Disclosure is a `disclosures` row; the application is an `applications` row, which [Loan Origination](/books/banking-and-lending/loan-origination#how-to-build-it) gave `trid_application_at`, the moment the sixth item arrived. TRID adds when each form was received, the fee lines with their tolerance buckets, changed circumstances, the computed deadlines and the cures, and reads two calendars.

```sql
ALTER TABLE applications                     -- trid_application_at comes from Loan Origination
  ADD COLUMN intent_to_proceed_at TIMESTAMPTZ,
  ADD COLUMN intent_evidence_ref  TEXT,
  ADD COLUMN rate_locked_at       TIMESTAMPTZ,
  ADD COLUMN consummation_at      TIMESTAMPTZ;   -- scheduled, then actual

ALTER TABLE disclosures
  ADD COLUMN form_kind            TEXT CHECK (form_kind IN ('loan_estimate', 'closing_disclosure')),
  ADD COLUMN revision             SMALLINT,      -- 0 for the initial form
  ADD COLUMN revision_reason_id   UUID,          -- changed_circumstances, below
  ADD COLUMN presumed_received_at DATE,          -- the mailbox rule, specific business days
  ADD COLUMN received_evidence_at TIMESTAMPTZ;   -- earlier receipt, if evidenced

CREATE TABLE legal_public_holidays (         -- 5 U.S.C. 6103(a), for the specific definition
  holiday_date          DATE PRIMARY KEY,
  name                  TEXT NOT NULL,
  source                TEXT NOT NULL DEFAULT '5 U.S.C. 6103(a)'
);

CREATE TABLE closing_cost_items (            -- every fee line on every form
  disclosure_id         UUID NOT NULL REFERENCES disclosures (id),
  line_code             TEXT NOT NULL,         -- stable across revisions: 'A.01', 'C.03', ...
  description           TEXT NOT NULL,
  payee                 TEXT,
  payee_affiliated      BOOLEAN NOT NULL DEFAULT FALSE,
  shoppable             BOOLEAN NOT NULL,
  chosen_from_list      BOOLEAN,               -- the creditor's written list of providers
  tolerance_bucket      TEXT NOT NULL CHECK (tolerance_bucket IN ('zero', 'ten_percent',
                          'unlimited')),
  amount                BIGINT NOT NULL,       -- minor units
  paid_by               TEXT NOT NULL CHECK (paid_by IN ('borrower', 'seller', 'lender', 'other')),
  PRIMARY KEY (disclosure_id, line_code)
);

CREATE TABLE changed_circumstances (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id        UUID NOT NULL REFERENCES applications (id),
  reason                TEXT NOT NULL CHECK (reason IN ('changed_circumstance', 'eligibility',
                          'consumer_request', 'rate_lock', 'expiration', 'new_construction')),
  description           TEXT NOT NULL,
  evidence_ref          TEXT NOT NULL,
  learned_at            TIMESTAMPTZ NOT NULL,  -- the information sufficient to establish it
  revision_due_on       DATE NOT NULL,         -- three general business days later
  revised_disclosure_id UUID REFERENCES disclosures (id),
  valid                 BOOLEAN                -- false if the revision missed its date
);

CREATE TABLE disclosure_deadlines (          -- every TRID date, computed and stored
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id        UUID NOT NULL REFERENCES applications (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('le_due', 'le_waiting_period_end',
                          'revised_le_due', 'revised_le_receipt_by', 'cd_receipt_by',
                          'cd_rewait_end', 'cure_due', 'post_consummation_correction_due')),
  due_on                DATE NOT NULL,
  day_definition        TEXT NOT NULL CHECK (day_definition IN ('general', 'specific', 'calendar')),
  computed_from         JSONB NOT NULL,        -- the triggering event, the count, the calendars used
  rule_ref              TEXT NOT NULL,         -- '1026.19(e)(1)(iii)(A)', ...
  superseded_by         UUID REFERENCES disclosure_deadlines (id),
  met_at                TIMESTAMPTZ
);

CREATE TABLE tolerance_cures (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id        UUID NOT NULL REFERENCES applications (id),
  account_id            UUID REFERENCES accounts (id),
  bucket                TEXT NOT NULL CHECK (bucket IN ('zero', 'ten_percent')),
  baseline_amount       BIGINT NOT NULL,       -- from the last valid Loan Estimate
  charged_amount        BIGINT NOT NULL,
  cure_amount           BIGINT NOT NULL CHECK (cure_amount > 0),
  method                TEXT NOT NULL CHECK (method IN ('lender_credit_at_closing', 'check',
                          'principal_reduction')),
  due_on                DATE NOT NULL,         -- consummation + 60 days
  journal_entry_id      UUID REFERENCES journal_entries (id),
  corrected_disclosure_id UUID REFERENCES disclosures (id),
  paid_at               TIMESTAMPTZ
);
```

How it runs:

1. **The sixth field starts everything.** The intake service sets `trid_application_at` when the last of the six fields is present and writes the `le_due` deadline from the institution's general calendar (the `business_days` table [Posting, Holds & Balances](/books/banking-and-lending/posting-holds-and-balances#how-to-build-it) defines). Every deadline is computed once, stored with its inputs, and superseded rather than edited when an event moves it ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
2. **Sending writes the mailbox date.** Each Loan Estimate or Closing Disclosure sets `presumed_received_at` from the specific calendar (Sundays and `legal_public_holidays` excluded), and the waiting-period and receipt deadlines follow from it.
3. **Every changed circumstance is a row before it's a revision.** The row records when the information arrived and the revision's due date; the revised estimate references it; a revision after its due date marks the row invalid, and the original figures stay the tolerance baseline.
4. **The closing date is a constraint, not a field.** Scheduling a closing checks it against `le_waiting_period_end`, `revised_le_receipt_by` and `cd_receipt_by`, and blocks the revised estimate once a Closing Disclosure exists. A change on the Closing Disclosure runs the three re-wait tests (APR against the 1026.22 tolerance from the [APR computation](/books/banking-and-lending/apr-and-rate-caps#how-to-build-it), product, prepayment penalty) and either writes `cd_rewait_end` or doesn't.
5. **Tolerance runs on every Closing Disclosure.** The comparison reads `closing_cost_items` from the last valid Loan Estimate per `line_code` and bucket, totals the 10% bucket, and writes `tolerance_cures` with a 60-day due date; the refund posts as a journal entry and its corrected disclosure is linked.
6. **Holidays are reference data with a source.** `legal_public_holidays` is loaded from the statute's list, with each year's dates generated from its rules (the third Monday in January, the fourth Thursday in November), and reviewed when the statute changes.

## Auditing

TRID findings come from reconstructing the timeline, so the file must hold it:

- **The application moment:** when each of the six fields arrived and from which channel.
- **Every form as delivered:** its revision number, channel, sent time, presumed and evidenced receipt, and the fee lines with tolerance buckets.
- **Every changed circumstance:** reason, evidence, when learned, revision due date and the revision that answered it.
- **Every deadline:** computed date, day definition, inputs, superseding events, and when it was met.
- **The closing:** scheduled and actual consummation, any re-wait trigger and its test.
- **Every cure:** baseline, charged amount, refund, method, date paid against the 60-day limit, and the corrected disclosure.
- **The intent to proceed** and any fee collected before it (there should be none except the credit report).

## What This Means for the System You Build

- **Timestamp the sixth application field,** not the form submission, and start the clock there.
- **Keep both business-day calendars as data,** the institution's own and the federal holiday list, and say which one each deadline used.
- **Store every deadline with its inputs** and supersede it when events move it.
- **Record a tolerance bucket on every fee line** of every form, with the facts that decided it.
- **Make each changed circumstance a dated record** and reject a revision that misses its three days.
- **Gate the closing date on the waiting periods** and run the three re-wait tests on every Closing Disclosure change.
- **Compute cures automatically** with a 60-day due date and a corrected disclosure.

## References

**Law and regulation**

- [12 CFR 1026.19](https://www.law.cornell.edu/cfr/text/12/1026.19), Loan Estimate and Closing Disclosure timing, fee restriction, tolerances, revision reasons, re-disclosure triggers and cures
- [12 CFR 1026.19 (CFPB, with official interpretations)](https://www.consumerfinance.gov/rules-policy/regulations/1026/19/), the June 1 to June 9 waiting period example, Monday-for-Thursday Closing Disclosure receipt, and creditor responsibility for agent-provided forms
- [12 CFR 1026.2](https://www.law.cornell.edu/cfr/text/12/1026.2), the six-item application and the general and specific business day definitions
- [5 U.S.C. 6103](https://www.law.cornell.edu/uscode/text/5/6103), the legal public holidays, including Juneteenth
- [12 CFR 1026.22](https://www.law.cornell.edu/cfr/text/12/1026.22), the APR tolerances that decide a re-wait

**Vendors and trade bodies**

- [ICE Mortgage Technology: Encompass](https://mortgagetech.ice.com/products/encompass), pre-close, closing and post-closing from the system of record
- [DocMagic](https://www.docmagic.com/), tolerance and calculation compliance, automated audits and document generation
- [ALTA: Settlement Statements](https://www.alta.org/policies-and-standards/policy-forms/settlement-statements), the four statement versions and their relation to the Closing Disclosure
