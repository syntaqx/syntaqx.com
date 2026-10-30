+++
title = "Time, Billing & E-Billing"
description = "Time entry, rates and fee arrangements, pre-bills, LEDES 1998B and XML, UTBMS codes, e-billing audits, rejections and appeals, and realization metrics."
category = "Workplace & Collaboration Industry"
order = 2058
part = "Law Firms and Professional Services"
tags = ["legal-tech", "ledes", "utbms", "e-billing", "time-tracking"]
+++

Most law firm revenue is still time: a lawyer records what they did, for which matter, for how long, and the firm bills it at that lawyer's rate. Everything else in the billing system follows from how unreliable and how disputed that record can be. Time is captured late and from memory; a partner edits the draft bill before it goes out; a corporate client's e-billing platform runs the invoice through dozens of rules and rejects lines for vague descriptions or work billed in quarter hours; the firm appeals; months later some fraction of what was recorded is collected. The firm's financial health is measured by how much survives each step.

The format of the bill is standardized in a way few industries manage. The LEDES 1998B file format and the UTBMS task, activity and expense codes both date from the late 1990s, and corporate clients receive outside counsel invoices in them, so the invoice is data that the client's software audits line by line before a person reads it. A billing system that can't produce correct LEDES can't bill large corporate clients at all.

This chapter covers time entry, rates and fee arrangements, pre-bills, LEDES and UTBMS, e-billing platforms and outside counsel guidelines, rejections and appeals, and the realization and collection metrics. Rates and timekeepers are defined in [How to Build It](/books/workplace-and-collaboration/law-firms-and-professional-services#how-to-build-it); money held in trust before it's earned is in [Trust Accounting & IOLTA](/books/workplace-and-collaboration/trust-accounting-iolta). The invoice lifecycle in general (numbering, tax, applying payments) is the Payments volume's [Checkout & Invoicing](/books/payments/checkout-and-invoicing).

## How the Platforms Do It

As of October 2026, from vendor sites and help centers. Firm-side systems produce time and invoices:

| Vendor | Time capture | Billing |
| --- | --- | --- |
| **Clio** | Clio Timekeeping, announced at ClioCon 2026 (as reported) | Payments through Clio Payments |
| **Smokeball** | AutoTime, automatic capture of time from work done in the product | Billing and trust in one platform |
| **PracticePanther** | Multiple timers; calendar events convert to time entries | Billing with trust and general ledger |
| **Aderant** | Expert time entry | Expert, which Aderant calls "the industry's #1 time & billing solution" (vendor claim), and Expert Sierra in the cloud |
| **Intapp** | Intapp Time | Billstream and Terms, listed among its products |
| **Harvest**, **Toggl** | Timers and timesheets for any professional team | Harvest invoices from tracked time |

Client-side systems receive and audit invoices:

| Platform | What the public documentation shows |
| --- | --- |
| **Thomson Reuters Legal Tracker** | Audit sets on LEDES invoices that flag, auto-reduce to an approved rate, zero a rate, or reject the invoice; block billing audits; firms repost rejected or disputed invoices under the same invoice number |
| **Brightflag** | AI flags using language analysis: block billing, time increments over 6 minutes, insufficient narrative, repetitious work, rate increases, new timekeepers, non-lawyer time, read-in time, calculation errors, prohibited expenses, budget overruns |
| **Mitratech Collaborati** | Browser-based submission for firms; accepts LEDES 98B, 98BI v2, LEDES 2000, and LEDES XML 2.0 and 2.1; multi-matter invoices only where the client allows |
| **LexisNexis CounselLink** | Protégé in CounselLink+ (announced September 16, 2025) adds AI matter and invoice summaries |
| **Onit / SimpleLegal** | InvoiceAI (announced May 26, 2021) for first-pass review against billing guidelines |

Three patterns:

- **The firm writes the invoice; the client's software edits it.** On the client side, rules and models act on each line before a person does, and the firm's billing system has to anticipate them, because every rejected line is a delay and often a write-off.
- **Automatic time capture is the firm-side frontier.** Smokeball's AutoTime and PracticePanther's calendar-to-time conversion both try to replace memory with activity data, which raises accuracy and a supervision question (who confirms an entry the software proposed).
- **AI arrived on the client side first.** Onit's InvoiceAI dates from 2021 and Brightflag's flags are described as AI-powered; firms now face model-driven review of narratives they wrote for human readers.

## Time Entry

A time entry records the matter, the timekeeper, the date the work was done, the hours, a narrative of what was done, and (for clients who require it) UTBMS task and activity codes. The conventions that shape it:

- **Tenths of an hour.** Time is customarily recorded in six-minute units (0.1 hour), and clients enforce it: Brightflag's standard flag list includes "Time Increments > 6 Minutes," which "identifies work not billed in six-minute increments." Quarter-hour minimums show up in client audits as overbilling. Store the duration in minutes and the billed units in tenths, so rounding is explicit and auditable.
- **One task per entry.** "Block billing" is combining several tasks with one total; Legal Tracker has a dedicated block billing audit and Brightflag a block billing flag. A narrative like "review documents; call with client; draft motion, 4.5" is rejected or reduced by many clients' guidelines. The entry form can warn on multiple verbs and semicolons before the client's software does.
- **Contemporaneous, actual time.** Billing hourly means billing time actually spent: ABA Formal Opinion 93-379 (December 6, 1993), on billing for professional fees, disbursements and other expenses, says a lawyer can't bill "for more hours than were actually expended on the matter," and Formal Opinion 512 (July 29, 2024) applies it to generative AI: "lawyers who bill clients an hourly rate for time spent on a matter must bill for their actual time." The ABA's summary gives the example: a lawyer who spends 15 minutes putting information into a GAI tool to draft a pleading may charge for that time and for reviewing the draft, but in most circumstances can't charge for learning how to use the tool.
- **Overhead isn't billable.** Opinion 93-379 says overhead is subsumed in the fee absent advance disclosure, and in-house services may be charged at actual cost plus a reasonable allocation of directly associated overhead. Opinion 512 treats a GAI tool that works like "equipping and maintaining a legal practice" (its example is a grammar checker in a word processor) as overhead.

The record of a time entry is an append-only history. The timekeeper's original entry, every edit by a billing partner, every write-down, and the final billed version are separate states, because the difference between recorded and billed is the firm's first realization loss and the subject of its internal reporting.

## Rates and Fee Arrangements

ABA Model Rule 1.5(a) forbids an "unreasonable fee" and lists eight factors for judging it, from "the time and labor required" through "whether the fee is fixed or contingent." The billing arrangements a system has to support:

| Arrangement | How it bills | System implications |
| --- | --- | --- |
| **Hourly** | Hours times the timekeeper's rate for that client and matter on the date of work | Rate resolution by date and specificity; discounts as an adjustment, not a changed rate (LEDES carries both) |
| **Blended or capped hourly** | One rate for all timekeepers, or hourly up to a cap | The cap is a matter-level limit; time beyond it is recorded and written off |
| **Flat or fixed fee** | A set amount per matter, phase or task | Time still recorded for profitability; the invoice line is the fee (LOC's pseudo-code FLTFEE exists where an e-billing vendor accepts it) |
| **Contingent** | A percentage of the recovery | Requires a writing signed by the client stating the percentages and expense treatment, and a written closing statement (Rule 1.5(c)); prohibited in some domestic relations and criminal defense matters (Rule 1.5(d)) |
| **Retainer and advance** | Prepaid into trust and billed against | The trust transfer pays the invoice ([Earned and Unearned Fees](/books/workplace-and-collaboration/trust-accounting-iolta#earned-and-unearned-fees)) |
| **Budget-based or alternative fee** | Fixed by phase, success fees, holdbacks | LEDES XML supports alternate fee arrangements; budgets exchanged in the LEDES budget format |

Rule 1.5(b) requires that the basis or rate be communicated, "preferably in writing," and that "any changes in the basis or rate of the fee or expenses shall also be communicated to the client." Formal Opinion 11-458 (August 4, 2011) addresses changing fee arrangements during a representation. Annual rate increases are routine at large firms and are exactly what client-side tools watch for: Brightflag's "Timekeeper Rate Increase" flag detects when "a timekeeper charges more than their agreed rate." The rate a client agreed to is data the firm must hold per client, so the billing system can bill the agreed rate rather than the firm's standard one.

Opinion 512 also notes that a flat fee may become unreasonable when a GAI tool makes the work trivial, with an example of "a flat fee of $1,000 for which the lawyer did little or no work." Rule 1.5(a)'s reasonableness test applies to the result, not just the arrangement.

## Pre-Bills

Before an invoice goes to a client, the responsible lawyer reviews a **pre-bill** (or proforma): every unbilled time entry and expense on the matter for the period, with the draft totals. The reviewer edits narratives, moves entries to the right matter, writes time down or off, applies agreed discounts, and approves. At a large firm this is a monthly cycle across every open matter, with a billing department chasing approvals.

The pre-bill is where the firm's own guidelines and the client's meet. My rule is to run the client's known billing guidelines against the pre-bill, as the client's software will run them against the invoice: flag block billing, non-tenth increments, timekeepers the client hasn't approved, rates over the agreed rate, and prohibited expenses, while the lawyer can still fix them. Every rejection prevented at pre-bill is a delay and a dispute avoided.

What the pre-bill workflow records:

- **Each change to each entry** (narrative, hours, matter, code, write-down) with who made it, since the original stays in the history.
- **Write-downs and write-offs by reason** (client guideline, inefficiency, courtesy, agreed cap), because they're the inputs to realization reporting.
- **Approval** by the responsible lawyer before release, and a freeze: once released, the invoice is a new record and the entries are marked billed.

## LEDES

**LEDES** (Legal Electronic Data Exchange Standard) is maintained by the LEDES Oversight Committee (LOC), "an international, voluntary, not-for-profit organization comprised of legal industry representatives." Its catalog, as of October 2026: e-billing formats LEDES 98B, 98BI, LEDES 2000 and LEDES XML Ebilling 2.0, 2.1 and 2.2; LEDES XML Budgeting; LEDES XML Timekeeper Attributes; an invention disclosure schema; and a ratified LEDES API (v1, 2020). LOC also maintains revised activity and expense codes (2013) and timekeeper classification codes (2014).

### LEDES 1998B

The format most US e-billing still runs on is "an ASCII, pipe delimited format containing 24 fields." A file starts with the line `LEDES1998B[]`, then a header line naming the fields, then one line per invoice line item, each ending with `[]`. From LOC's own sample file:

```text
LEDES1998B[]
INVOICE_DATE|INVOICE_NUMBER|CLIENT_ID|LAW_FIRM_MATTER_ID|INVOICE_TOTAL|BILLING_START_DATE|BILLING_END_DATE|INVOICE_DESCRIPTION|LINE_ITEM_NUMBER|EXP/FEE/INV_ADJ_TYPE|LINE_ITEM_NUMBER_OF_UNITS|LINE_ITEM_ADJUSTMENT_AMOUNT|LINE_ITEM_TOTAL|LINE_ITEM_DATE|LINE_ITEM_TASK_CODE|LINE_ITEM_EXPENSE_CODE|LINE_ITEM_ACTIVITY_CODE|TIMEKEEPER_ID|LINE_ITEM_DESCRIPTION|LAW_FIRM_ID|LINE_ITEM_UNIT_COST|TIMEKEEPER_NAME|TIMEKEEPER_CLASSIFICATION|CLIENT_MATTER_ID[]
19990225|96542|00711|0528|1684.45|19990101|19990131|For services rendered|1|F|2.00|-70|630|19990115|L510||A102|22547|Research Attorney's fees, Set off claim|24-6437381|350|Arnsley, Robert|PARTNR|423-987[]
```

That fee line is 2.00 hours at a standard rate of 350 with a discount of 70, for a total of 630, coded to task L510 (appellate motions and submissions) and activity A102 (research). The specification's rules that a generator has to get exactly right:

- **Dates are `YYYYMMDD`;** invoice totals are currency with four decimals of precision allowed.
- **The type field** says whether the line is an expense (`E`), a fee (`F`), an invoice-level adjustment on fees (`IF`) or on expenses (`IE`).
- **Units are hours for fees** and item counts for expenses.
- **The unit cost is "the standard (i.e., undiscounted) unit cost,"** and the adjustment carries the discount (negative) or premium (positive). The line total "must be (LINE_ITEM_UNIT_COST * LINE_ITEM_NUMBER_OF_UNITS) + LINE_ITEM_ADJUSTMENT_AMOUNT"; receivers are encouraged to check it within a small variance (the spec's example is 0.1%), and the invoice total against the sum of lines (its example is 1%).
- **The law firm ID** is the firm's federal taxpayer ID if it has one; firm and client IDs exist "to enable automatic bill routing."
- **Timekeeper name** is last name first, and "MUST NOT BE USED BY THE RECEIVING APPLICATION AS A PRIMARY KEY FOR TIMEKEEPER"; the timekeeper ID is the key.
- **The client's matter ID** is required unless the client doesn't assign matter IDs, which is why the matter record holds the client's own reference.

### Timekeeper Classifications

LOC's revised timekeeper classification codes (ratified August 2014, reference document updated June 2023) replaced the old two-letter 98B codes with six-character codes that fit all LEDES formats: `PARTNR` (Partner, formerly PT), `ASSOC` (Associate, AS), `OFCOUN` (Of Counsel, OC), `LGLAST` (Legal Assistant, LA), `PARALG` (Paralegal), `CLKSEC` (Clerk or Secretary), `NBOTHR` (Other), and others including `TRANEE`, `TEMPAT` (contract attorney), `DSCATT` (discovery attorney), `DOCRAT` and `DOCRNA` (document reviewers, attorney and non-attorney), `LGPRMG` (legal project manager), `STFATT` (staff attorney) and `EXPERT`. The pseudo-codes `FLTFEE` and `ADJSMT` are only to be used if a third-party e-billing vendor specifies them. The classification lives on the timekeeper record and is what clients use to enforce staffing rules (Brightflag's "Non-Lawyer Time" flag, for example).

### 98BI and LEDES XML

- **LEDES 98BI** is the international variant: version 5 (ratified January 2020) is pipe-delimited with 52 fields, adding purchase order number, client tax ID, matter name, tax totals, invoice currency, split timekeeper names, firm and client addresses, and per-line tax rate, total and type. LOC says it isn't intended to be modified further.
- **LEDES XML Ebilling 2.0** was ratified in 2006 as an update to LEDES 2000, adding itemized taxes, alternate fee arrangements, matter credits and debits, and multiple vendor tax IDs. **2.1** followed in 2008 with a math statement "to try to align how math worked in the different vendor systems," more tax support and a regulatory statement segment. **2.2** (ratified 2020) adds tiered taxes such as Japanese withholding, with 205 data elements in 18 segments.
- **The budgeting format** (approved 2006) carries timekeeper and task budgets over periods and matter staffing plans; the **timekeeper attributes format** (ratified 2007, 44 data elements in 5 segments) carries information corporate clients need internally and for SEC requirements.

My default is to generate LEDES from the invoice record, never from a print layout, with one generator per format version and a validator that applies the receiver's checks (line math, totals, required fields, code validity) before submission. A file that fails the client's math check is rejected whole.

## UTBMS Codes

The **Uniform Task-Based Management System** (UTBMS) came from a joint group of the American Bar Association, the Association of Corporate Counsel and PricewaterhouseCoopers, which "morphed into what is now known as the LEDES Oversight Committee"; LOC now hosts utbms.com and reproduces the ABA code sets with the ABA's permission. A fee line carries a task code (what phase and task the work served) and an activity code (what the timekeeper did); an expense line carries an expense code.

- **Litigation code set (ABA, 1997):** five phases and 29 task codes. L100 Case Assessment, Development and Administration (L110 to L190); L200 Pre-Trial Pleadings and Motions (L210 to L260); L300 Discovery (L310 to L390); L400 Trial Preparation and Trial (L410 to L470); L500 Appeal (L510 to L530). The code notes carry billing policy: work of outside vendors building litigation support databases "should be an Expense," and once trial begins, lawyers in court "presumptively should bill their court time to L450."
- **Activity codes:** eleven, A101 Plan and prepare for; A102 Research; A103 Draft/revise; A104 Review/analyze; A105 to A108 Communicate (in firm, with client, with other outside counsel, other external); A109 Appear for/attend; A110 Manage data/files; A111 Other. LOC's 2013 revision added codes for legal vendors other than law firms.
- **Expense codes:** twenty-four, E101 Copying through E124 Other, including E106 Online research, E110 Out-of-town travel, E111 Meals, E112 Court fees, E115 Deposition transcripts, E119 Experts and E122 Local counsel.
- **Other code sets** listed on utbms.com include bankruptcy, counseling, project, IP (patent and trademark, with LOC patent prosecution codes from 2023), criminal law, eDiscovery, governance risk and compliance, M&A, real estate and workers' compensation, plus litigation variants for England and Wales and Canada.

For a system, codes are reference data keyed by code set and version, matters are assigned the code set their client requires, and the time entry form shows only the valid codes for that matter. A client may also restrict which codes it accepts (Legal Tracker's audit sets are per code, with examples like copying at $0.10 a unit and word processing at $0.00), so the code is also the key that guideline rules attach to.

## E-Billing and Outside Counsel Guidelines

Corporate clients send their law firms **outside counsel guidelines** (OCGs): rules on staffing, billing, expenses, budgets, reporting and often data security. E-billing platforms turn the billing rules into automated audits on each submitted invoice. From Legal Tracker's documentation, an audit rule can:

- **Flag** the invoice with a warning for a reviewer;
- **Automatically reduce** a line to the approved rate (its example reduces any per-unit copying charge over ten cents);
- **Zero the rate** (its example changes word processing charges to zero); or
- **Reject the invoice** outright.

Brightflag's flag categories show what clients look for: billing format (block billing, increments over six minutes, insufficient narrative, repetitious work across invoices), timekeepers (rate increases, new timekeepers, wrong rate period), staffing (non-lawyer time, "read-in time" from staff turnover), errors (rate times hours miscalculated), expenses (prohibited overhead expenses) and budget overruns. Brightflag notes that flags don't reject invoices automatically unless the client has configured auto-reject rules.

For the firm, OCGs are data to hold per client and enforce at pre-bill: approved timekeepers and rates, increment rules, expense caps and prohibitions, required codes, budget requirements, and submission deadlines.

## Rejections and Appeals

When a client's platform adjusts or rejects lines, the firm's choices are to accept the reduction, appeal it, or correct and resubmit. Legal Tracker's documentation shows the mechanics on one major platform: "Law firms can repost rejected or disputed invoices using the same invoice number"; a rejected invoice can be posted to a different matter but a disputed one can't; "you cannot repost an invoice that was rejected more than 180 days ago"; and "disputed invoices are automatically rejected after 45 days of inactivity." The deadlines differ by platform and client, which makes them data, not constants.

The firm-side system needs:

- **Submission records** per invoice per platform: the file sent, the format version, the time, the platform's acknowledgment and status.
- **Adjustments as lines,** each with the client's reason code or flag, the amount, and the firm's response (accepted, appealed, corrected), so a reduced invoice is still traceable to the original entries.
- **Deadline clocks** per adjustment (appeal windows, inactivity limits), with owners, because an appeal not filed in time is a write-off.
- **Write-offs back to the entries,** so realization reporting attributes the loss to the right timekeeper, client and reason.

## Realization and Collection

Three ratios describe how much of a lawyer's working time turns into cash, and every firm reports some version of them:

| Metric | Definition | What it misses |
| --- | --- | --- |
| **Utilization** | Billable hours recorded divided by available working hours | Non-billable work that keeps the firm running; unrecorded time |
| **Realization** | Billed value divided by the standard value of recorded time | Whether the client pays; rates already discounted in the agreed rate |
| **Collection** | Cash collected divided by billed value | Time to collect; write-offs booked later |

Realization can be measured against the agreed rate instead of the standard rate, and a combined ratio (cash collected divided by standard value) compounds both losses. Clio's annual Legal Trends Report is the most cited public benchmark for small and mid-size firms; its 2026 edition, as reported, put lawyer utilization at 42% of an eight-hour day in 2026, up from 39% in 2025.

The metrics are only as good as the record underneath: recorded time with its standard value at the rate in force on the work date, every write-down and write-off with a reason and a stage (pre-bill, client adjustment, collection), and payments applied to invoice lines. With that, realization by timekeeper, client, practice area and reason is a query, not a spreadsheet.

## How to Build It

Deltas against the book's core data model and the matter, timekeeper and rate tables in [How to Build It](/books/workplace-and-collaboration/law-firms-and-professional-services#how-to-build-it). Time and expense entries are not `items`: they're financial records about work, linked to the item worked on where there is one. Invoices are prefixed `legal_` so they aren't confused with the vendor's own invoices to its customers, which the Part 11 chapter Billing, Seats & Resellers covers.

```sql
CREATE TABLE utbms_codes (
  code_set        TEXT NOT NULL,             -- 'aba_litigation_1997', 'aba_activity_1997', 'aba_expense_1997'
  code            TEXT NOT NULL,             -- 'L510', 'A102', 'E101'
  kind            TEXT NOT NULL CHECK (kind IN ('phase', 'task', 'activity', 'expense')),
  parent_code     TEXT,                      -- 'L500' for 'L510'
  name            TEXT NOT NULL,
  PRIMARY KEY (code_set, code)
);

CREATE TABLE billing_arrangements (          -- one current row per matter, dated
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  matter_id       UUID NOT NULL REFERENCES matters (container_id),
  kind            TEXT NOT NULL CHECK (kind IN ('hourly', 'blended', 'capped', 'flat', 'contingent',
                    'phased_fixed', 'pro_bono')),
  terms           JSONB NOT NULL,            -- {"cap": 5000000}, {"percent_settlement": 33.33}
  task_code_set   TEXT,                      -- required by the client, or null
  activity_code_set TEXT,
  ebilling_format TEXT CHECK (ebilling_format IN ('ledes_98b', 'ledes_98bi', 'ledes_xml_2_1',
                    'ledes_xml_2_2', 'none')),
  ebilling_platform TEXT,                    -- 'legal_tracker', 'brightflag', 'collaborati', ...
  engagement_letter_id UUID REFERENCES engagement_letters (id),
  valid_during    DATERANGE NOT NULL
);

CREATE TABLE billing_guideline_rules (       -- the client's OCG rules, as data
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  client_id       UUID NOT NULL REFERENCES clients (id),
  rule            TEXT NOT NULL CHECK (rule IN ('increment_minutes', 'no_block_billing', 'approved_timekeepers',
                    'rate_cap', 'expense_cap', 'expense_prohibited', 'max_hours_per_day',
                    'submission_age_days', 'required_codes')),
  params          JSONB NOT NULL,            -- {"minutes": 6}, {"code": "E101", "unit_max": 10}
  action          TEXT NOT NULL CHECK (action IN ('warn', 'block_release')),
  source_item_id  UUID REFERENCES items (id), -- the guideline document
  valid_during    DATERANGE NOT NULL
);

CREATE TABLE time_entries (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  matter_id       UUID NOT NULL REFERENCES matters (container_id),
  timekeeper_id   UUID NOT NULL REFERENCES timekeepers (id),
  worked_on       DATE NOT NULL,
  minutes         INT NOT NULL CHECK (minutes > 0),
  billed_tenths   INT NOT NULL,              -- 0.1-hour units after rounding
  narrative       TEXT NOT NULL,
  task_code       TEXT,
  activity_code   TEXT,
  source          TEXT NOT NULL CHECK (source IN ('manual', 'timer', 'calendar', 'suggested')),
  confirmed_by_timekeeper_at TIMESTAMPTZ,    -- required for suggested entries
  related_item_id UUID REFERENCES items (id), -- the document or message worked on
  standard_rate   BIGINT NOT NULL,           -- resolved from timekeeper_rates for worked_on
  agreed_rate     BIGINT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'on_prebill', 'billed',
                    'written_off', 'no_charge')),
  legal_invoice_line_id UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE time_entry_revisions (          -- every edit, in order; the original is revision 1
  time_entry_id   UUID NOT NULL REFERENCES time_entries (id),
  revision        INT NOT NULL,
  changed_by      UUID NOT NULL REFERENCES members (id),
  stage           TEXT NOT NULL CHECK (stage IN ('entry', 'prebill', 'client_adjustment', 'appeal')),
  minutes         INT NOT NULL,
  billed_tenths   INT NOT NULL,
  narrative       TEXT NOT NULL,
  matter_id       UUID NOT NULL,
  write_down_reason TEXT,
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (time_entry_id, revision)
);

CREATE TABLE expense_entries (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  matter_id       UUID NOT NULL REFERENCES matters (container_id),
  incurred_on     DATE NOT NULL,
  expense_code    TEXT,
  units           NUMERIC(12, 3) NOT NULL,
  unit_cost       BIGINT NOT NULL,
  description     TEXT NOT NULL,
  paid_from       TEXT NOT NULL CHECK (paid_from IN ('operating', 'trust', 'vendor_direct')),
  receipt_item_id UUID REFERENCES items (id),
  status          TEXT NOT NULL CHECK (status IN ('unbilled', 'on_prebill', 'billed', 'written_off'))
);

CREATE TABLE legal_invoices (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  matter_id       UUID NOT NULL REFERENCES matters (container_id),
  invoice_number  TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('prebill', 'approved', 'issued', 'submitted',
                    'partially_paid', 'paid', 'disputed', 'rejected', 'void')),
  billing_start   DATE NOT NULL,
  billing_end     DATE NOT NULL,
  currency        CHAR(3) NOT NULL,
  total           BIGINT NOT NULL,           -- recomputed from lines; checked
  approved_by     UUID REFERENCES members (id),
  issued_at       TIMESTAMPTZ,
  UNIQUE (workspace_id, invoice_number)
);

CREATE TABLE legal_invoice_lines (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_invoice_id UUID NOT NULL REFERENCES legal_invoices (id),
  line_number     INT NOT NULL,
  line_type       TEXT NOT NULL CHECK (line_type IN ('F', 'E', 'IF', 'IE')),   -- LEDES types
  units           NUMERIC(12, 3) NOT NULL,
  unit_cost       BIGINT NOT NULL,           -- standard, undiscounted
  adjustment      BIGINT NOT NULL DEFAULT 0, -- negative discount, positive premium
  total           BIGINT NOT NULL,
  line_date       DATE,
  timekeeper_id   UUID REFERENCES timekeepers (id),
  task_code       TEXT,
  activity_code   TEXT,
  expense_code    TEXT,
  description     TEXT NOT NULL,
  CHECK (total = ROUND(unit_cost * units) + adjustment),
  UNIQUE (legal_invoice_id, line_number)
);

CREATE TABLE ebilling_submissions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_invoice_id UUID NOT NULL REFERENCES legal_invoices (id),
  platform        TEXT NOT NULL,
  format          TEXT NOT NULL,
  file_item_id    UUID NOT NULL REFERENCES items (id),   -- the exact file sent
  submitted_at    TIMESTAMPTZ NOT NULL,
  platform_status TEXT,                      -- as the platform reports it
  resubmission_of UUID REFERENCES ebilling_submissions (id)
);

CREATE TABLE ebilling_adjustments (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  submission_id   UUID NOT NULL REFERENCES ebilling_submissions (id),
  legal_invoice_line_id UUID REFERENCES legal_invoice_lines (id),   -- null for invoice-level
  reason          TEXT NOT NULL,             -- the client's flag or reason code
  amount          BIGINT NOT NULL,           -- negative reduction
  response        TEXT CHECK (response IN ('accepted', 'appealed', 'corrected', 'expired')),
  respond_by      TIMESTAMPTZ,               -- the platform's window
  appeal_note     TEXT,
  resolved_amount BIGINT
);
```

A LEDES 98B line is a projection of an invoice line, never a separate copy:

```sql
SELECT concat_ws('|',
  to_char(i.issued_at, 'YYYYMMDD'), i.invoice_number, c.client_number, m.matter_number,
  to_char(i.total / 100.0, 'FM999999990.00'),
  to_char(i.billing_start, 'YYYYMMDD'), to_char(i.billing_end, 'YYYYMMDD'), 'For services rendered',
  l.line_number, l.line_type, to_char(l.units, 'FM9990.00'),
  to_char(l.adjustment / 100.0, 'FM-999999990.00'), to_char(l.total / 100.0, 'FM-999999990.00'),
  to_char(l.line_date, 'YYYYMMDD'), coalesce(l.task_code, ''), coalesce(l.expense_code, ''),
  coalesce(l.activity_code, ''), coalesce(tk.timekeeper_number, ''), l.description,
  :law_firm_tax_id, to_char(l.unit_cost / 100.0, 'FM999999990.00'),
  coalesce(tk.ledes_name, ''), coalesce(tk.classification, ''),
  coalesce(m.client_matter_ref, '')
) || '[]'
FROM legal_invoice_lines l
JOIN legal_invoices i  ON i.id = l.legal_invoice_id
JOIN matters m         ON m.container_id = i.matter_id
JOIN clients c         ON c.id = m.client_id
LEFT JOIN timekeepers tk ON tk.id = l.timekeeper_id
WHERE i.id = :invoice_id
ORDER BY l.line_number;
```

How it runs:

1. **Rates resolve at entry,** from the timekeeper's rate rows for the work date and the client's agreed rate, and both are stored on the entry, so a later rate change never reprices old work.
2. **Guideline rules run three times:** as warnings at entry, as blocking checks at pre-bill release, and again on the generated file before submission. The client's platform should find nothing the firm didn't.
3. **Suggested time** (from calendars or activity capture) stays in `draft` until the timekeeper confirms it, which keeps automatic capture under the lawyer's supervision.
4. **Edits are revisions,** never overwrites; billed values come from the latest revision and realization compares it with revision 1 and with cash applied.
5. **The LEDES file is generated, validated against the receiver's math and field rules, stored as an item, and submitted;** the exact bytes sent are kept with the submission.
6. **Client adjustments land as rows** with deadlines and owners; an expired appeal window converts the adjustment to a write-off with the reason preserved.

## Auditing

- **Every time entry's history,** from the timekeeper's first version through pre-bill edits, client adjustments and appeals, with actors and reasons.
- **Rates applied,** standard and agreed, as of the work date, and the communication of rate changes to each client (Rule 1.5(b)).
- **Pre-bill approvals:** who approved each invoice, with what write-downs.
- **Every e-billing submission and response:** the file sent, the platform's status, each adjustment, the firm's response and the outcome.
- **AI-assisted work:** time entries for work done with GAI tools record the tool, so a later question about billing actual time (Opinion 512) has an answer ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).

## What This Means for the System You Build

- **Record time in minutes, bill in tenths,** one task per entry, with codes the matter's client requires.
- **Keep the original entry and every revision;** write-downs and write-offs carry a reason and a stage.
- **Resolve rates by date and agreement,** and store both standard and agreed rates on the entry.
- **Hold clients' billing guidelines as dated rules** and enforce them at entry, pre-bill and before submission.
- **Generate LEDES from the invoice record** with a validator that applies the receiver's checks, and keep the exact file sent.
- **Treat UTBMS codes as versioned reference data** per client, and attach guideline rules to them.
- **Track client adjustments with deadlines,** and feed every loss back to the entry for realization reporting.
- **Keep suggested and AI-assisted time under the timekeeper's confirmation,** and bill actual time.

## References

**ABA Model Rules and opinions**

- [ABA Model Rule 1.5: Fees](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_5_fees/), reasonableness factors, communicating the basis and changes, contingent fees and prohibitions
- [ABA Formal Ethics Opinions: Index by Issue Dates](https://www.americanbar.org/groups/professional_responsibility/publications/ethics_opinions/index_by_issue_dates/), titles and dates of Opinions 93-379 and 11-458
- [ABA Formal Opinion 512 (July 29, 2024), copy of the ABA PDF](https://www.lawnext.com/wp-content/uploads/2024/07/aba-formal-opinion-512.pdf), billing actual time, learning time, overhead, flat fees and its quotations of Opinion 93-379
- [ABA: ABA issues first ethics guidance on a lawyer's use of AI tools (July 29, 2024)](https://www.americanbar.org/news/abanews/aba-news-archives/2024/07/aba-issues-first-ethics-guidance-ai-tools/), the 15-minute drafting example and learning time

**Standards**

- [LEDES Oversight Committee](https://ledes.org/), LOC's description and its catalog of formats and code sets
- [LEDES 98B Format](https://ledes.org/ledes-98b-format/), 24 pipe-delimited fields
- [LEDES 98B sample file (Rev. 7/2014)](https://ledes.org/wp-content/uploads/2017/11/Ledes98B-Sample-File-Rev-7-2014.txt), the header lines and sample fee line
- [LEDES 1998B field specification (Rev. 7/2014)](https://ledes.org/wp-content/uploads/2014/08/Ledes-1998B-Format-Rev-7-2014.xls), field types, line types, line math, IDs and timekeeper rules
- [LOC Revised Timekeeper Classification Codes (August 2014)](https://ledes.org/loc-revised-timekeeper-classification-codes-august-2014/), the six-character codes
- [LOC timekeeper classifications reference (updated June 2023)](https://ledes.org/wp-content/uploads/2023/06/LEDES-Revised-Timekeeper-Classifications-Reference-Document-6-2023-Upd.xlsx), each code, its old 98B equivalent and the pseudo-codes
- [LEDES 98BI Format](https://ledes.org/ledes-98bi-format/), version 5's 52 fields
- [LEDES 98BI V5 sample file](https://ledes.org/wp-content/uploads/2020/10/LEDES98BI-V5-Sample-File-1-2020.txt), the added international fields
- [LEDES XML Ebilling 2.0](https://ledes.org/ledes-xml-ebilling-ver-2-0-format/), the 2006 ratification and what it added
- [LEDES XML Ebilling 2.1](https://ledes.org/ledes-xml-ebilling-ver-2-1-format/), the 2008 ratification and the math statement
- [LEDES XML Ebilling 2.2](https://ledes.org/ledes-xml-ebilling-ver-2-2/), tiered taxes, data elements and segments
- [LEDES XML Budgeting Format](https://ledes.org/ledes-xml-budgeting-format/), the 2006 budgeting standard
- [LEDES XML Timekeeper Attributes Format](https://ledes.org/ledes-xml-timekeeper-attributes-format/), the 2007 format's purpose and size
- [UTBMS.com](https://utbms.com/), the origin of UTBMS, LOC's role and the list of code sets
- [UTBMS: ABA Litigation Codes](https://utbms.com/aba-litigation-codes/), five phases and 29 task codes
- [ABA UTBMS Litigation Codes (1997) spreadsheet](https://utbms.com/wp-content/uploads/2023/11/ABA-UTBMS-Litigation-Codes-1997.xlsx), task codes and their notes
- [UTBMS: ABA Activity Codes](https://utbms.com/aba-activity-codes/), the eleven activity codes
- [UTBMS: ABA Expense Codes](https://utbms.com/aba-expense-codes/), the 24 expense codes
- [UTBMS: LOC Revised Activity Codes](https://utbms.com/loc-revised-activity-codes/), the 2013 revision

**Vendor documentation**

- [Thomson Reuters Legal Tracker: Create UTBMS audit sets](https://www.thomsonreuters.com/en-us/help/legal-tracker/company/financial-setup/create-utbms-audit-sets), audit actions and the copying and word processing examples
- [Thomson Reuters Legal Tracker: Configuring block billing audits](https://www.thomsonreuters.com/en-us/help/legal-tracker/company/financial-setup/configuring-block-billing-audits.html), block billing audits
- [Thomson Reuters Legal Tracker: Repost invoices](https://www.thomsonreuters.com/en-us/help/legal-tracker/law-firm/invoices/repost-invoices), reposting, the 180-day limit and the 45-day auto-rejection
- [Brightflag: Invoice Flags Explained](https://help.brightflag.com/hc/en-us/articles/360002592798-Invoice-Flags-Explained), the AI flag categories
- [Mitratech Collaborati: FAQ](https://success.mitratech.com/Collaborati/Frequently_Asked_Questions), accepted formats, multi-matter invoices and currency
- [LexisNexis: Protégé in CounselLink (September 16, 2025)](https://www.lexisnexis.com/community/amp-pressroom/lexisnexis-announces-protege-in-counsellink-for-actionable-matter-and-invoice-insights), AI matter and invoice summaries
- [Onit: InvoiceAI (May 26, 2021)](https://www.onit.com/news/onit-debuts-invoiceai-ai-for-legal-invoice-review), AI first-pass invoice review in SimpleLegal
- [Intapp Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1565687/000156568726000073/inta-20260630.htm), Intapp Time, Billstream and Terms as products
- [Smokeball](https://www.smokeball.com/), AutoTime
- [PracticePanther](https://www.practicepanther.com/), timers and calendar events to time entries
- [Aderant](https://www.aderant.com/), Expert and Expert Sierra
- [Harvest](https://www.getharvest.com/), time tracking and invoicing
- [Toggl](https://toggl.com/), time tracking

**Industry reporting**

- [LawNext: ClioCon 2026 wrap-up (October 26, 2026)](https://www.lawnext.com/2026/10/cliocon-2026-a-quick-wrap-up-of-everything-clio-announced-today-and-its-a-lot.html), Clio Timekeeping and the 2026 Legal Trends Report's utilization figures, as reported
