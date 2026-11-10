+++
title = "Year-End, W-2s & Wage Reporting"
nav_title = "Year-End & W-2s"
description = "The W-2 box by box with the 2026 changes, the W-3, EFW2 and BSO, reconciling to the 941s, state and local filings, W-2c, penalties and the January rush."
category = "Workforce Industry"
order = 2619
part = "Payroll Tax"
tags = ["payroll", "payroll-tax", "form-w2", "year-end", "efw2", "wage-reporting"]
+++

The W-2 is the one payroll document everyone sees: the employee files a return with it, the Social Security Administration posts their earnings record from it, the IRS compares it with four quarterly returns, and every state and city with an income tax wants its own copy. It is also the one document a payroll system produces for every worker at once, in the same few weeks, against a deadline that doesn't move: for tax year 2026, Copy A to SSA and the employee copies are both due **February 1, 2027** (January 31 is a Sunday). Every error made during the year surfaces in January, when a box that doesn't reconcile can no longer be fixed with a next-payroll adjustment.

This chapter covers the W-2 box by box with the 2026 changes, the W-3 transmittal, SSA's EFW2 file format and Business Services Online, reconciling the W-2s to the 941s, state W-2 filing and annual reconciliations, local annual returns, electronic delivery and its consent rules, corrections on W-2c and W-3c, the information return penalty tiers, and the year-end close as a checklist the system runs rather than a list a person remembers. The tips and overtime reporting fields new for 2026 are worked in Tips & the 2025 Tax Law; imputed income behind box 12 code C in Supplemental Wages & Imputed Income; contractor 1099s in [Contractors & 1099s](/books/workforce/contractors-and-1099s).

## How the Platforms Do It

What embedded payroll APIs and filing services publish about W-2s, as of November 2026:

| Platform | Role | What it publishes |
| --- | --- | --- |
| **ADP SmartCompliance Employment Tax** | Filing service | Year-end processing alongside quarter-end, with specialists supporting "quarter- and year-end filing and remittance activities" |
| **Check** | Embedded payroll API | Employee tax statements (W-2 and W-2c) with their amendment history, employee tax statement overrides, and company and employee tax documents |
| **Gusto Embedded** | Embedded payroll API | Employee forms (list, get, PDF) and a sandbox endpoint to generate a W-2 for testing |

The useful pattern is Check's: a W-2 is a statement object with a history, and a W-2c is an amendment of it, not a replacement. Overrides exist because some W-2 amounts come from outside the pay runs (third-party sick pay, a prior provider's wages, a manual adjustment), and an override is a recorded fact with a reason, not an edit to a box. My rule is that a W-2 is computed from statement lines and recorded inputs, frozen when filed, and changed only by a W-2c that points at it.

## The W-2, Box by Box

The 2026 W-2 boxes and what feeds each, from the General Instructions for Forms W-2 and W-3:

| Box | Content | Computed from |
| --- | --- | --- |
| a to f | Employee SSN, employer EIN, employer name and address, control number, employee name and address | `persons`, `employers`; name exactly as on the Social Security card |
| 1 | Wages, tips, other compensation | Federal income tax wages: excludes elective deferrals (401(k), 403(b)), includes taxable fringe benefits and group-term life over $50,000 |
| 2 | Federal income tax withheld | Income tax lines |
| 3 | Social Security wages | `taxable_wages` on Social Security lines, "capped at the 2026 social security wage base of $184,500"; includes elective deferrals; excludes Social Security tips |
| 4 | Social Security tax withheld | Employee Social Security lines |
| 5 | Medicare wages and tips | `taxable_wages` on Medicare lines, no limit |
| 6 | Medicare tax withheld | Employee Medicare plus Additional Medicare lines |
| 7 | Social Security tips | Reported tips subject to Social Security |
| 8 | Allocated tips | Large food or beverage establishment allocations |
| 9 | (reduced in size for 2026 to make room in box 14a) | |
| 10 | Dependent care benefits | Dependent care assistance |
| 11 | Nonqualified plans | Distributions from nonqualified deferred compensation |
| 12 | Codes and amounts | Up to four per form; more on additional forms |
| 13 | Statutory employee, retirement plan, third-party sick pay | Flags from the worker and plan records |
| 14a | Other | Free-form employer information |
| 14b | Treasury Tipped Occupation Code(s) | Up to two codes when cash tips are reported with code TP; "000" if any tips came from a nonqualifying occupation |
| 15 to 20 | State and local: employer state ID, state wages, state income tax, local wages, local income tax, locality name | State and local lines by jurisdiction, one set per state or locality |

**Box 12 codes** confirmed for 2026: A and B (uncollected Social Security and Medicare on tips), C (taxable group-term life over $50,000), D (401(k) elective deferrals), E (403(b)), F (SEP), G (457(b)), H (501(c)(18)(D)), J (nontaxable sick pay), K (excise tax on excess golden parachutes), L (substantiated business expense reimbursements), M and N (uncollected Social Security and Medicare on group-term life for former employees), P (excludable Armed Forces moving expenses), Q (nontaxable combat pay), R (employer Archer MSA), S (SIMPLE), T (adoption benefits), V (nonstatutory stock option income), W (employer HSA contributions, including those elected through a cafeteria plan), Y and Z (409A deferrals and failures), AA, BB and EE (designated Roth contributions to 401(k), 403(b) and governmental 457(b)), DD (cost of employer-sponsored health coverage, not taxable), FF (QSEHRA), GG and HH (section 83(i)), II (Medicaid waiver payments), and the three new codes **TP** (total cash tips reported to the employer), **TT** (qualified overtime compensation) and **TA** (Trump account employer contributions). Box 12 amounts are reported in full even above a limit: the instructions' code D example shows a $26,500 deferral reported as "D 26500.00" against the 2026 limit of $24,500, with the excess's return reported on a 1099-R.

### What Changed for 2026

- **The wage reporting threshold** rose from $600 to $2,000 for wages paid after 2025 when no income tax, Social Security or Medicare tax was withheld, adjusted for inflation after 2026.
- **Box 14 split** into 14a (Other) and 14b (Treasury Tipped Occupation Codes), and box 9 shrank.
- **New box 12 codes** TP, TT and TA, for the qualified tips and qualified overtime deductions and for Trump account contributions (employer contributions starting July 4, 2026, up to $2,500 a year).
- **State paid family and medical leave:** employee contributions and employer voluntary payments under state PFML programs must be included as wages (Rev. Rul. 2025-4 and Notice 2026-6); [State Paid Family & Medical Leave](/books/workforce/state-paid-leave) covers the programs.
- **Penalties** increased for returns due after December 31, 2026, and a new Form 15397 requests an extension to furnish employee copies.

### Worked Numbers: One Employee's W-2

An invented employee earns a $100,000 salary in 2026, defers $10,000 to a 401(k), has $150,000 of group-term life coverage at age 45, gets a $1,000 employer HSA contribution, and has employer health coverage costing $9,000 for the year (all employer-paid, no salary reduction for it). Federal income tax withheld was $12,000.

Group-term life imputed income comes from the uniform premium table: coverage over $50,000 is $100,000, or 100 units of $1,000, at $0.15 per unit per month for ages 45 to 49, so $15.00 a month and **$180** for the year, taxable for income tax and FICA but not withheld for income tax.

| Box | Computation | Amount |
| --- | --- | --- |
| 1 | $100,000 − $10,000 deferral + $180 imputed | $90,180.00 |
| 2 | Withheld | $12,000.00 |
| 3 | $100,000 + $180 (deferral stays in) | $100,180.00 |
| 4 | $100,180 × 6.2% | $6,211.16 |
| 5 | $100,000 + $180 | $100,180.00 |
| 6 | $100,180 × 1.45% | $1,452.61 |
| 12 | C 180.00, D 10000.00, W 1000.00, DD 9000.00 | four codes, one form |
| 13 | Retirement plan | checked |

Box 1 is lower than box 3 by the deferral less nothing else; boxes 3 and 5 match because the employee is under the Social Security base. The W-2 is a set of sums over the year's statement lines grouped by tax and code, which is why the core model keeps imputed income, deferrals and memo items (the HSA contribution, the cost of coverage) as lines with pay item types rather than as fields.

## The W-3 and Filing With SSA

The **W-3** transmits a paper or electronic batch and totals it: box b's "Kind of Payer" (941, Military, 943, 944, CT-1, household employer, Medicare government employee) and "Kind of Employer" (none apply, 501(c) non-government, state or local non-501(c), state or local 501(c), federal government), a third-party sick pay checkbox, the number of W-2s, the employer's EIN and name (which must match the 941s), any "Other EIN used this year," and the money boxes totaled. VOID W-2s are excluded from the totals.

**E-filing is required** for anyone filing at least 10 information returns in total for the year, counting W-2s with 1099s, 1098s, 1095s and 5498s, but not corrected returns. A single 30-day extension to file with SSA is available on Form 8809, but it is "not automatic" and "The IRS will only grant the extension in extraordinary circumstances or catastrophe"; it doesn't extend the employee deadline, for which Form 15397 is the new request (generally up to 15 days, or 30 if the need is clearly shown). An employee who leaves during the year may be given a W-2 any time after separation and by the deadline, or within 30 days of a request.

**Final returns** bring the deadline forward: an employer filing a final 941 must furnish W-2s and file them with SSA "by the due date of your final return."

## EFW2 and BSO

The Social Security Administration publishes the electronic format for W-2 Copy A as **EFW2** (Publication 42-007 for tax year 2026) and for W-2c as **EFW2C** (Publication 42-014), and "Developers of payroll and tax reporting software must follow these file formats when submitting wage data files electronically to SSA." Files are submitted through **Business Services Online (BSO)**, where a registered user can create W-2s online, upload a formatted wage file, check a file for formatting accuracy, view submission status and errors, see the status of reports a third party filed for the employer, and request an extension to resubmit. For tax year 2025, BSO began accepting submissions on December 8, 2025.

An EFW2 file is a sequence of fixed-length records: a submitter record, then per employer an RE (employer) record followed by an RW (employee wage) record and optional RO (employee optional) record per employee, employer total records RT and RU, and a final record. The tax year 2026 specification changed:

- **RE** gains an optional Employer Signature PIN field.
- **RW** gains two Treasury Tipped Occupation Code fields (box 14b).
- **RO and RU** split the combined "Uncollected Employee Tax on Tips (Codes A and B)" field into two.
- **Codes J, K, L and P**, which had no EFW2 field, now each have one; TA, TP and TT are added to the list of money fields SSA doesn't maintain on the earnings record.

The EFW2C records (RCE, RCW, RCO, RCU) changed to match.
<!-- source-gap: wf-efw2-layout | secondary | EFW2 tax year 2026 record identifiers, record length and field positions (SSA's Publication 42-007 PDF refused automated reading; changes are from a vendor summary) | closes with: SSA Publication 42-007 (TY2026) read directly | checked: 2026-11-09 -->

A file a provider submits for thousands of employers carries one RE per employer, and SSA's processing errors come back per employer through BSO; the system needs the submission ID per RE so a resubmission covers only the employers that failed. AccuWage Online is SSA's tool for checking a file before submission.

## Reconciling W-2s to the 941s

The amounts on the W-3 should agree with the year's Forms 941, and "If there are differences, you may be contacted by the IRS and SSA." The IRS and SSA run the comparison as Combined Annual Wage Reporting and send Letter 99C when a difference survives ([The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar)). Pub 15's reconciliation compares three items: federal income tax withheld, Social Security and Medicare wages, and Social Security and Medicare taxes, the last "approximately twice the amounts shown on Form W-3" because the 941 includes the employer's share. The system computes the comparison before the W-2s are filed:

| W-3 box | Should equal | Expected difference |
| --- | --- | --- |
| 2, income tax withheld | Sum of 941 line 3 for the four quarters, after 941-X adjustments | None, unless a prior-year administrative error was corrected |
| 3 + 7, Social Security wages and tips | Sum of 941 lines 5a and 5b column 1 | None |
| 5, Medicare wages and tips | Sum of 941 line 5c column 1 | None |
| 4, Social Security tax withheld | Half of the sum of 941 lines 5a and 5b column 2 | Fractions of cents (941 line 7); uncollected tips and group-term life (line 9) |
| 6, Medicare tax withheld | Half of 941 line 5c column 2, plus all of 5d | Additional Medicare has no employer half; fractions of cents |

Differences have valid causes (Additional Medicare, fractions of cents, third-party sick pay, an acquisition explained on Schedule D (Form 941)), and Pub 15 says to "Make sure there are valid reasons for any mismatch" and keep the reconciliation. The reconciliation is a query over the same statement lines that built the 941s and the W-2s; if both were built from those lines, the only differences are the expected ones, and an unexpected difference means something was entered outside the pay runs, usually a manual 941 adjustment or a W-2 override. Backup withholding and nonpayroll withholding belong on Form 945, never on the 941 or the W-2.

## State W-2s and Annual Reconciliations

Most income-tax states require W-2 data (boxes 15 to 17, often all boxes) filed electronically, usually in a format derived from EFW2 with state records, and an annual reconciliation of withholding: the year's W-2 state withholding against the withholding returns and deposits filed during the year. Pennsylvania's local EIT system has an annual W2-R reconciliation beside the quarterly returns, and the City of St. Louis publishes W-2 reporting specifications for employers that must file W-2s with its Collector of Revenue. Ohio requires the annual wage statement to show the school district income tax withheld "for each applicable school district." Local annual returns (municipal reconciliations, county returns) follow each locality's calendar, many with the same January and February dates.

The structure is the same everywhere: the year's withholding by jurisdiction from statement lines, compared with the jurisdiction's returns and deposits, filed with per-worker detail. A difference here is as visible to the state as a 941 difference is to the IRS.
<!-- source-gap: wf-state-w2-deadlines | missing | state W-2 and annual reconciliation due dates and formats for 2026 (for example the largest payroll states) | closes with: each state's W-2 electronic filing specification and employer guide | checked: 2026-11-09 -->

## Electronic Delivery

An employer may furnish W-2s electronically instead of on paper if it meets 26 CFR 31.6051-1(j):

- **Affirmative consent** that "demonstrates" the employee can access the statement in the format used; consent on paper counts only if confirmed electronically. A withdrawal counts only if it takes effect before the statement is furnished.
- **Disclosures before or with the consent**: that a paper W-2 will be provided without consent, the scope and duration of the consent, how to get a paper copy, how to withdraw, when electronic delivery ends (for example, on separation), how to update contact information, and the hardware and software needed.
- **Notice of hardware or software changes** that create a material risk the employee can't access the form, before the change, with new consent after it.
- **Posting and notice:** if the W-2 is posted on a website, the employer notifies the employee by mail, email or in person with access instructions, and the notice must include "IMPORTANT TAX RETURN DOCUMENT AVAILABLE"; an undeliverable email requires notice by mail or in person within 30 days.
- **Corrections** go electronically too, with notice within 30 days of posting.
- **Retention:** posted forms stay available through October 15 of the following year.

Each element is a record: the consent with its timestamp and method of demonstration, the disclosure version shown, the notification sent and any bounce, and the posting period. Electronic delivery that can't prove consent is paper delivery that never happened.

## Corrections: W-2c and W-3c

An error found before Copy A goes to SSA is fixed by voiding the form ("Check the VOID box") and issuing a new one, with VOID forms left out of the W-3 totals. After filing, the correction is a **W-2c** to SSA and the employee, transmitted with a **W-3c**, filed separately for each form type and payer, with "Previously reported" and "Correct information" columns and "-0-" rather than blanks. SSA encourages BSO for W-2c, where up to 25 W-2c per W-3c may be filed per online session. A W-2c follows the channel of the original: e-filed originals get e-filed corrections, and electronically furnished originals get electronic corrections.

Corrections that come from wage repayments in a later year are narrow: for prior-year wages repaid, the employer files a W-2c correcting only Social Security and Medicare wages and taxes, and does "not correct box 1 or box 2." The matching 941-X recovers the Social Security and Medicare taxes ([Form 941-X and the Interest-Free Adjustment](/books/workforce/tax-notices-and-agency-accounts#form-941-x-and-the-interest-free-adjustment)).

## Penalties

For W-2s and other information returns due in 2027 (tax year 2026), per form:

| Filed | Per W-2 | Annual maximum | Small business maximum |
| --- | --- | --- | --- |
| Within 30 days of the due date | $60 | $698,500 | $244,500 |
| 31 days late through August 1 | $130 | $2,095,500 | $698,500 |
| After August 1, or not filed | $340 | $4,191,500 | $1,397,000 |
| Intentional disregard | $690 | No maximum | No maximum |

Filing with SSA and furnishing to employees are separate failures with separate penalties, so a W-2 neither filed nor furnished on time is penalized twice. An invented employer that files 500 W-2s 45 days late owes 500 × $130 = $65,000 for filing alone. Using a payroll provider "doesn't relieve the employer" of the duty; the service agreement decides who pays.

## The Year-End Close and the January Rush

Year-end is a sequence the system runs, with checks that stop the line:

1. **Before the last payroll:** run imputed income true-ups (group-term life, personal use of vehicles, other fringes), confirm deferral limits weren't exceeded, load third-party sick pay and any prior provider's wages, review employee addresses and names against SSA records, and set the next year's rates, wage bases and tables effective January 1.
2. **The last check date of the year:** wages paid on December 31 are this year's; wages for the last December period paid on January 2 are next year's, because liability and W-2 reporting follow the pay date.
3. **Lock the year:** after the final run and the Q4 deposits, freeze the year's statement lines; later changes are corrections with their own runs.
4. **Reconcile:** W-2 totals against the four 941s and each state's returns, by the table above; every difference explained or fixed before filing.
5. **Produce and review:** W-2s generated from locked lines, a sample reviewed, employee copies released (electronically to those who consented) and printed or mailed for the rest.
6. **File:** EFW2 to SSA, state and local W-2 files and reconciliations, Form 940, Q4 941s and state Q4 reports, all by their dates, most of them in the same two weeks.
7. **Open the correction window:** employee questions arrive in February; corrections become W-2c with W-3c and, where taxes change, 941-X.

The January rush is a capacity problem as much as a correctness one: every client's W-2s, Q4 returns and 940 are due in the same weeks, the first payroll of the new year runs on new rules, and corrections from December arrive at the same time. The platform architecture is in [Payroll Platform Architecture](/books/workforce/payroll-architecture); the tax design consequence is that everything in steps 1 and 4 runs continuously from October, not in January.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). A W-2 is a `filing_lines` row of a `filings` row (`form = 'w2_w3'`) for its record as filed; this chapter adds the computed W-2 per worker with its boxes, the box 12 amounts, the corrections chain and delivery consents.

```sql
-- One W-2 per worker per employer per year (and per state set beyond the form's capacity).
CREATE TABLE w2_records (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  tax_year            SMALLINT NOT NULL,
  form_sequence       SMALLINT NOT NULL DEFAULT 1,   -- extra forms for more box 12 codes or states
  filing_id           UUID REFERENCES filings (id),  -- the W-2/W-3 filing it went in
  employee_name       TEXT NOT NULL,         -- as on the Social Security card, at generation
  employee_address    JSONB NOT NULL,
  box1_wages          BIGINT NOT NULL,       -- cents
  box2_fit            BIGINT NOT NULL,
  box3_ss_wages       BIGINT NOT NULL CHECK (box3_ss_wages >= 0),
  box4_ss_tax         BIGINT NOT NULL,
  box5_medicare_wages BIGINT NOT NULL,
  box6_medicare_tax   BIGINT NOT NULL,
  box7_ss_tips        BIGINT NOT NULL DEFAULT 0,
  box8_allocated_tips BIGINT NOT NULL DEFAULT 0,
  box10_dependent_care BIGINT NOT NULL DEFAULT 0,
  box11_nonqualified  BIGINT NOT NULL DEFAULT 0,
  box13_statutory     BOOLEAN NOT NULL DEFAULT FALSE,
  box13_retirement    BOOLEAN NOT NULL DEFAULT FALSE,
  box13_third_party_sick BOOLEAN NOT NULL DEFAULT FALSE,
  box14a              JSONB NOT NULL DEFAULT '[]',   -- label and amount pairs
  box14b_tipped_codes TEXT[] NOT NULL DEFAULT '{}' CHECK (cardinality(box14b_tipped_codes) <= 2),
  state_local         JSONB NOT NULL DEFAULT '[]',   -- boxes 15 to 20 per jurisdiction
  overrides           JSONB NOT NULL DEFAULT '[]',   -- inputs not from statement lines, with reasons
  status              TEXT NOT NULL CHECK (status IN ('draft', 'reviewed', 'furnished',
                        'filed', 'void', 'corrected')),
  generated_from_lines_through DATE NOT NULL,        -- the lock date of the year's lines
  furnished_at        TIMESTAMPTZ,
  furnish_channel     TEXT CHECK (furnish_channel IN ('electronic', 'mail', 'hand')),
  UNIQUE (employer_id, worker_id, tax_year, form_sequence)
);

CREATE TABLE w2_box12_amounts (
  w2_record_id        UUID NOT NULL REFERENCES w2_records (id),
  code                TEXT NOT NULL CHECK (code ~ '^[A-Z]{1,2}$'),   -- 'C', 'D', 'DD', 'TP', 'TT', 'TA'
  amount              BIGINT NOT NULL CHECK (amount >= 0),
  PRIMARY KEY (w2_record_id, code)
);

-- A W-2c: previously reported and correct values for each changed box.
CREATE TABLE w2_corrections (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  w2_record_id        UUID NOT NULL REFERENCES w2_records (id),   -- the W-2 being corrected
  supersedes_correction_id UUID REFERENCES w2_corrections (id),   -- a W-2c of a W-2c
  filing_id           UUID REFERENCES filings (id),               -- the W-2c/W-3c filing
  notice_case_id      UUID REFERENCES notice_cases (id),          -- the discovery behind it
  changes             JSONB NOT NULL,        -- [{box, previously_reported, correct}], cents
  reason              TEXT NOT NULL,
  prior_year_repayment BOOLEAN NOT NULL DEFAULT FALSE,  -- then boxes 1 and 2 must not change
  furnished_at        TIMESTAMPTZ,
  CHECK (NOT prior_year_repayment OR NOT (changes::TEXT ~ '"box": *"(1|2)"'))
);

-- Electronic delivery consent and its required evidence, per 26 CFR 31.6051-1(j).
CREATE TABLE delivery_consents (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  document_kind       TEXT NOT NULL CHECK (document_kind IN ('w2', 'w2c', '1095c', 'pay_statement')),
  consented_at        TIMESTAMPTZ NOT NULL,
  demonstration       TEXT NOT NULL,         -- how the worker showed they can open the format
  disclosure_version  TEXT NOT NULL,         -- the disclosure text shown, versioned
  email               TEXT NOT NULL,
  withdrawn_at        TIMESTAMPTZ,
  reconsent_required_at TIMESTAMPTZ,         -- after a material hardware or software change
  ends_on_separation  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE delivery_notifications (        -- "IMPORTANT TAX RETURN DOCUMENT AVAILABLE"
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  delivery_consent_id UUID NOT NULL REFERENCES delivery_consents (id),
  document_id         UUID NOT NULL REFERENCES documents (id),
  sent_at             TIMESTAMPTZ NOT NULL,
  bounced_at          TIMESTAMPTZ,
  paper_fallback_due_on DATE,                -- 30 days after a bounce with no new address
  available_until     DATE NOT NULL          -- October 15 of the following year, or next business day
);

-- Box 1, 3 and 5 for a year, straight from paid statement lines.
SELECT s.worker_id,
       SUM(l.taxable_wages) FILTER (WHERE l.tax_type = 'fit')             AS box1,
       SUM(-l.amount)       FILTER (WHERE l.line_type = 'employee_tax'
                                      AND l.tax_type = 'fit')              AS box2,
       SUM(l.taxable_wages) FILTER (WHERE l.tax_type = 'social_security'
                                      AND l.line_type = 'employee_tax')    AS box3,
       SUM(l.taxable_wages) FILTER (WHERE l.tax_type = 'medicare'
                                      AND l.line_type = 'employee_tax')    AS box5
FROM pay_statement_lines l
JOIN pay_statements s ON s.id = l.pay_statement_id
JOIN pay_runs r ON r.id = s.pay_run_id
WHERE r.employer_id = $1 AND r.status = 'paid'
  AND s.check_date >= make_date($2, 1, 1) AND s.check_date < make_date($2 + 1, 1, 1)
GROUP BY s.worker_id;
-- Tax line amounts are negative deductions on the statement in this sketch; flip the sign
-- to the convention your lines use.
```

Design notes:

- **Generate from locked lines, record the lock.** `generated_from_lines_through` ties the W-2 to the state of the ledger it summed; a W-2 regenerated after a correction run is a W-2c, not a new W-2.
- **Overrides are inputs with reasons.** Third-party sick pay, prior provider wages and manual adjustments enter as recorded overrides with a source document, and the reconciliation reports them as the expected differences they are ([Amend, Don't Overwrite](/docs/building-blocks/audit-trails#amend-don-t-overwrite)).
- **Box 12 is a child table, and its display is a layout problem.** More than four codes means a second form; the data doesn't care, the renderer does.
- **Reconcile before release.** The W-3 to 941 table above runs as a blocking check per employer; employee copies don't release until it passes or the differences are explained.
- **Consent is per document kind and evidence-backed.** Store the demonstration, the disclosure version and every notification; without them, electronic delivery didn't happen ([Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first)).
- **Keep prior-year repayment W-2c narrow by constraint,** so boxes 1 and 2 can't change on one.

## Auditing

W-2s are audited by SSA's matching, the IRS's CAWR, state reconciliations and employees. Keep:

- **Each W-2 as filed and furnished**, its generation lock date, overrides and the statement lines behind each box.
- **The W-3 to 941 reconciliation** per employer and year, with the explanation for every difference.
- **EFW2 submissions**: the file, its hash, the BSO submission ID per employer and the processing results.
- **Every W-2c** with its W-3c, the reason, the case that produced it and the furnish date.
- **Delivery consents, disclosures, notifications and bounces**, and the paper fallbacks sent.
- **State and local W-2 files and reconciliations**, with their acknowledgments.

## What This Means for the System You Build

- **Compute every W-2 box from paid statement lines** and recorded overrides, frozen at a lock date.
- **Encode the 2026 changes as data:** the $2,000 threshold, box 14a and 14b, codes TP, TT and TA, and PFML contributions as wages.
- **Reconcile the W-3 to the four 941s and each state before release,** and explain every expected difference.
- **Submit EFW2 through BSO with per-employer tracking,** and resubmit only the employers that failed.
- **Make electronic delivery provable:** consent with demonstration, disclosures, notices and October 15 availability.
- **Correct with W-2c and W-3c that point at the original,** on the original's channel, with boxes 1 and 2 unchanged for prior-year repayments.
- **Run year-end as a continuous process from October,** because February 1 is fixed and the penalties are per form.

## References

**Law and regulation**

- [26 CFR 31.6051-1](https://www.law.cornell.edu/cfr/text/26/31.6051-1), paragraph (j): consent, disclosures, hardware and software changes, posting, notice, corrections and October 15 availability for electronic W-2s
- [26 CFR 1.79-3](https://www.law.cornell.edu/cfr/text/26/1.79-3), the uniform premium table for group-term life over $50,000
- [Ohio Revised Code 5747.06](https://codes.ohio.gov/ohio-revised-code/section-5747.06), school district tax on the annual wage statement

**Agency guidance and forms**

- [IRS: General Instructions for Forms W-2 and W-3 (2026)](https://www.irs.gov/instructions/iw2w3), the February 1, 2027 deadline, what's new for 2026, boxes 1 to 20, box 12 codes, box 14b, the W-3, e-filing at 10 returns, Forms 8809 and 15397, VOID forms, W-2c rules, prior-year repayments and penalties
- [IRS: Information return penalties](https://www.irs.gov/payments/information-return-penalties), the per-return amounts and annual maximums for returns due in 2027
- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), final returns and W-2 deadlines, reconciling W-2 and W-3 with Forms 941, Additional Medicare and Form 945, and W-2c limits per BSO session
- [Social Security Administration: Specifications for filing Forms W-2 and W-2c electronically](https://www.ssa.gov/employer/EFW2&EFW2C.htm), Publications 42-007 and 42-014 for tax year 2026
- [Social Security Administration: Electronic W-2/W-2c filing handbook](https://www.ssa.gov/employer/bsohbnew.htm), Business Services Online services and the December 8, 2025 opening for tax year 2025
- [Pennsylvania DCED: Local income tax information](https://dced.pa.gov/local-government/local-income-tax-information/), local EIT returns and forms
- [City of St. Louis: Earnings tax](https://www.stlouis-mo.gov/government/departments/collector/earnings-tax/index.cfm), W-2 reporting specifications for employers

**Vendor documentation**

- [ADP: SmartCompliance Employment Tax](https://apps.adp.com/en/apps/623571/adp-smartcompliance-employment-tax), quarter- and year-end filing
- [Check: Documentation index](https://docs.checkhq.com/llms.txt), employee tax statements with W-2 and W-2c history and overrides
- [Gusto Embedded: Documentation index](https://docs.gusto.com/embedded-payroll/llms.txt), employee forms and the sandbox W-2

**In practice**

- [Sovos: SSA releases 2026 specifications for filing Forms W-2 and W-2c electronically](https://sovos.com/regulatory-updates/trr/ssa-releases-2026-specifications-for-filing-forms-w-2-and-w-2c-electronically-efw2-efw2c/), RE, RW, RO and RU changes for tax year 2026 and the new code fields
