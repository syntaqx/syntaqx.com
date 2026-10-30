+++
title = "Receipts, Expense Policy & Audit"
nav_title = "Receipts & Expense Policy"
description = "After the swipe: receipt capture and matching, OCR and AI policy review, approvals, the IRS substantiation rules, and the expense fraud schemes audits look for."
category = "Banking & Lending Industry"
order = 2465
part = "Spend Management"
tags = ["banking", "spend-management", "expenses", "receipts", "irs", "fraud"]
+++

Every card purchase a company makes has to become a documented business expense: a receipt, a business purpose, a category, an approval and, eventually, a line in the general ledger. Before corporate cards carried software, that was an expense report an employee assembled at month end from a wallet of paper. Spend platforms invert it: the card transaction arrives first, in real time, and the system goes looking for everything else, pulling the receipt from an inbox, reading it, checking it against the policy, routing it to an approver and coding it. The tax law sets the floor (what a receipt must show, and when one is required), the company's policy sets the rest, and the audit afterwards looks for the four ways employees inflate what they claim.

This chapter covers that pipeline: the expense record and the IRS substantiation rules behind it, capturing and matching receipts, reading them, policy engines with and without AI, approvals, and expense fraud and the audit that finds it. Out-of-pocket spend paid back to employees, mileage and per diem are [Reimbursements, Mileage & Per Diem](/books/banking-and-lending/reimbursements-and-per-diem); coding and syncing to the ledger is [Accounting Sync & the Close](/books/banking-and-lending/accounting-sync); the cards and their controls are [Virtual Cards & Spend Controls](/books/banking-and-lending/card-controls).

## How the Platforms Do It

What expense platforms document about capture, review and audit, as of October 2026:

| Platform | Capture | Matching and extraction | Policy review | Audit |
| --- | --- | --- | --- | --- |
| **Ramp** | Gmail or Outlook connection, forwarding, a Chrome extension at checkout, iPhone and iPad photo library matching, merchant connectors, text, email, Slack and the app | Matches "using details such as the merchant, amount, and date"; unmatched receipts go to Missing items; fills memo and accounting fields only "when the answer is high confidence or follows an existing rule" | Policy Agent (Plus) applies "a structured, agent-facing version of your policy" and returns approval recommended, requires review, or rejection recommended, with policy citations | Auto-approval only when a workflow enables it; Policy Agent doesn't check accounting codes |
| **SAP Concur** | Receipt auto-capture; Bank Card Feeds import transactions from linked corporate cards | "OCR-based data extraction (merchant, amount, date, category)" | Concur Expense and Concur Request | Concur Detect and Intelligent Audit |
| **Emburse** | Expense and Go (mobile), Captio, Cards | Not described on the pages read | Assurance, an "AI-powered compliance layer" reviewing receipts before and after submission | AI Audit and Travel Audit add-ons |
| **Expensify** | SmartScan: "Snap a photo of your receipt, forward receipts from email, or upload attachments directly in the application" | SmartScan extraction | Not described in the 10-K sections read | Not described in the 10-K sections read |
| **Brex** (API) | `POST /v1/expenses/card/receipt_match` returns a pre-signed upload URL that "expires 30 minutes after its creation"; `receipt_upload` attaches to a named expense | "We will try to match the receipt with existing expenses" | Spend limits carry an `expense_policy_id` | Not in the API reference |

Three things stand out. **Capture fans in from everywhere** because the receipt lives wherever the purchase happened: an email from an airline, a photo at a restaurant, a PDF in a SaaS billing page. **Matching runs on three keys** (merchant, amount, date), and every platform has a queue for what doesn't match. **AI review is advisory by default:** Ramp's agent recommends and cites, a human or an explicitly enabled workflow approves, and Emburse frames Assurance as guidance before submission as well as review after it. That's the right default for a decision that ends up in a tax return.

## The Expense Record

An expense is the business's claim about one outlay: what it was, why it was a business expense, and the evidence. A card expense starts from the card transaction (the cleared purchase, with merchant, amount, date and MCC), an out-of-pocket expense from the employee's entry. The fields the tax rules require are the spine of the record. For travel, the elements to prove are the amount of each expenditure, the dates of departure and return, the destination, and the business reason; for entertainment and gifts the business relationship of the people involved is added (26 CFR 1.274-5T(b)). The record also carries what the company's own policy and accounting need: category, project or department, attendees for a meal, and the approver.

**The card transaction is evidence, not the expense.** The issuer's record proves an amount was paid to a merchant on a date. It doesn't show what was bought, for whom or why, which is what the receipt and the memo add, and a merchant descriptor ("SQ *CAFE 4471") is not the place a receipt calls itself.

## The IRS Receipt Rules

Federal substantiation rules give every policy engine its hard floor (26 CFR 1.274-5 and 1.274-5T):

- **Documentary evidence is required for lodging away from home, always, and for any other expenditure of $75 or more,** except transportation charges when documentary evidence isn't readily available (1.274-5(c)(2)(iii)).
- **A receipt is adequate** if it shows "the amount, date, place, and the essential character" of the expense. A hotel receipt identifies the hotel, its location, the dates and separately the charges for lodging, meals and telephone; a restaurant receipt shows the name and location, the date and amount, the number of people served, and any non-food charges. A cancelled check payable to a named payee doesn't by itself support a business expense.
- **Records are made at or near the time** of the expenditure, in "an account book, diary, log, statement of expense, trip sheets, or similar record" together with the documentary evidence (1.274-5T(c)(2)). A written statement of business purpose is generally required, unless the purpose is evident from the surrounding facts.
- **Without adequate records,** each element has to be established by the taxpayer's own statement plus "other corrobative evidence" (1.274-5T(c)(3)); records lost through circumstances beyond the taxpayer's control may be substantiated by reasonable reconstruction (1.274-5T(c)(5)).
- **An employee who makes an adequate accounting to the employer** doesn't report those expenses on their own return (1.274-5T(f)(2)), which is why the employer's expense system is the record the IRS ultimately relies on.

For a system these become rules with numbers and dates: a receipt required at or above $75 (lodging regardless of amount), receipt content checks per category (people served for a restaurant, itemization for a hotel), a business purpose field that is required unless the category exempts it, and a timestamp on when the memo and receipt were recorded relative to the purchase. A company may set a lower receipt threshold than the IRS, and many do; the policy records both and says which one it enforces. A missing-receipt declaration is the employee's own statement, which the regulation treats as sufficient only with corroboration, so it belongs in the policy as a counted exception, not a free substitute. The reimbursement side (the accountable plan's 60- and 120-day windows, and what happens to payments that fail them) is [Reimbursements, Mileage & Per Diem](/books/banking-and-lending/reimbursements-and-per-diem).

## Capturing Receipts

The capture paths, and what each needs:

- **Inbox connections** read receipts the merchant emails (Ramp's Gmail and Outlook connectors) and need OAuth scopes limited to what's necessary, with the access logged.
- **Forwarding addresses** accept receipts sent in, one address per company or per user, and must attribute each to the right person by sender.
- **Mobile capture and photo libraries** (Ramp's on-device photo matching, Expensify's SmartScan) upload images from phones on poor connections.
- **Browser and merchant connectors** fetch receipts at checkout or from merchant accounts (Ramp's Chrome extension and merchant connectors).
- **Direct upload by API,** as Brex's pre-signed, 30-minute upload URL does: the client puts the file in storage directly, and the platform processes it after it lands.

The upload mechanics (pre-signed credentials, resumable uploads from phones, checking what arrived before using it) are the playbook's [File Uploads](/docs/architecture/file-uploads#uploads-from-a-phone). The spend twist is volume and duplication: the same receipt arrives by email and by photo, and the second copy must be recognized as the same document, by content hash for identical files and by extracted fields for re-photographed ones.

## Matching

A receipt is matched to a card transaction by merchant, amount and date, and each key is fuzzy:

- **Amount.** The receipt total and the cleared amount differ by tips added after authorization, by foreign exchange (the receipt is in euros, the transaction in dollars), and by hotel incidentals. Matching allows a tolerance by category: an exact match for software, a tip band for restaurants, an FX band computed from the transaction's own rate.
- **Date.** The receipt's date is the purchase; the transaction's is the authorization or the clearing, a day or more later, and a hotel folio spans the stay.
- **Merchant.** The receipt's business name and the card descriptor rarely agree; matching normalizes both and uses the merchant ID and location when the network supplies them.

Scores sort into bands: an auto-match above a threshold, a suggestion for the employee to confirm in the middle, and the Missing items queue below ([Review Bands](/docs/architecture/record-linkage#review-bands)). Two invariants matter for audit: one receipt matches at most one transaction unless it's explicitly split, and every auto-match records its score and the rule version that made it, because "the system matched it" has to be explainable later.

## Reading the Receipt

OCR extracts the merchant, amount, date and category (Concur's own description of its extraction), and more ambitious extraction reads tax, tip, currency, line items and the number of guests. Each field comes with a confidence, and the platform's rule decides what to do with it: Ramp fills memo and accounting fields only at high confidence or when an existing rule applies. My rule is to store the extracted value, its confidence and the model version beside the value the employee confirmed, never overwriting one with the other, so a later dispute can see what the machine read and what the person said ([Observations, Not Overwrites](/docs/architecture/record-linkage#observations-not-overwrites)).

An image is evidence, and images can be edited or generated. A receipt check that looks only at extracted fields will pass a fabricated receipt with plausible numbers; the stronger signals are outside the image: whether a matching card transaction exists, whether the merchant emailed it, whether the same image or the same receipt number appears elsewhere.

## Policy Engines

A company's expense policy turns into rules: receipt thresholds, category limits (meals per person, hotel per night by city), required attendees for meals, banned categories, weekend and personal-looking spend, travel class, and the time allowed to submit. Two layers do the work:

- **Deterministic rules** for everything expressible as a condition: amount over a threshold in a category, a receipt missing past a deadline, a merchant category not allowed under the card's program. They're rows with a scope, condition, action and version ([The Shape of a Rule](/docs/architecture/rules-as-data#the-shape-of-a-rule)), evaluated in order and recorded on every expense they touched ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Model review** for what isn't: whether a memo actually states a business purpose, whether a receipt's line items include something the policy excludes, whether a dinner's attendees fit the stated reason. Ramp's Policy Agent reads "a structured, agent-facing version of your policy" (it recommends about 10 pages, or 10,000 words), the receipt's OCR and itemization, the memo and the attendees, and returns one of three outcomes with citations to the policy text; it re-evaluates recent expenses for "up to 24 hours" after the policy changes; it can auto-approve clearly compliant expenses only "when a workflow enables that behavior"; and it doesn't check whether accounting codes are correct. Ramp reports early customers cut manual reviews "by about 85% while maintaining 99%+ accuracy," a vendor claim.

The design lessons generalize. **The model recommends and code decides:** an approval is a state change with an actor, and an AI recommendation is an input to it ([Decide in Code](/docs/architecture/ai-agents#decide-in-code)). **Ambiguity goes to a human,** which is what a "requires review" outcome is. **The policy the model read is versioned,** so each recommendation names the policy version and model version that produced it ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)). **Evaluation lags configuration,** so the system must show which expenses were evaluated under the old policy and which under the new.

## Approvals

Approval routes an expense, a request or a bill to the people who must agree to it:

- **Routing** by amount, category, department, project, the submitter's manager chain and the budget owner, with sequential or parallel steps. My default is one routing engine for expenses, card requests and bills, so a company's approval rules live in one place.
- **Timing differs by money flow.** A card expense is approved after the money moved, so approval is a control on the employee and the coding, and a rejection becomes a repayment or payroll deduction question. An out-of-pocket expense is approved before reimbursement. A bill is approved before payment, with a separate release approval at some platforms (Ramp's Plus lists "Payment release approvals").
- **Delegation and absence.** Approvers go on leave; delegations are time-bound records, and an approval by a delegate names both people.
- **No self-approval.** My rule: someone at the top of the chain (a founder, the CFO) still has a second approver for their own expenses, named in the policy.
- **Deadlines and escalation.** Unapproved items age; reminders and escalation paths are part of the routing rule.

Each step is a record with the approver, the decision, the time, any comment and the version of the routing rule that put it there. Role scoping is [Authorization](/docs/security/authorization#least-privilege); the bill side of approvals is [AP, Bill Pay & Procurement](/books/banking-and-lending/accounts-payable).

## Expense Fraud

The Association of Certified Fraud Examiners' *Occupational Fraud 2026: A Report to the Nations* (14th edition, 2,402 cases from 143 countries and territories) classifies employee frauds in its Fraud Tree. Among asset misappropriation schemes, which appear in 90% of cases with a median loss of $100,000, **expense reimbursement schemes** appear in **13%** of cases with a median loss of **$36,000**, and **billing schemes** (invoices for fictitious goods or services, inflated invoices, or invoices for personal purchases) in **21%**, with a median loss of **$90,000**. The tree's four expense reimbursement subtypes map directly to checks a system can run:

| Scheme | What it looks like | What catches it |
| --- | --- | --- |
| **Mischaracterized expenses** | Personal spend claimed as business: a family dinner as a client meal, personal travel on a business trip | Attendee and business purpose requirements, weekend and holiday flags, merchant categories that rarely have a business purpose, a model reading the memo against the receipt |
| **Overstated expenses** | Altered receipts, a higher amount than paid, a more expensive item than bought | Card-backed expenses (the cleared amount is the ceiling), receipt totals against transactions, image tamper signals |
| **Fictitious expenses** | Receipts for purchases that never happened | Requiring a card transaction or merchant-sourced receipt, receipt number and image reuse across employees, merchant existence checks |
| **Multiple reimbursements** | The same expense claimed twice: on the card and out of pocket, or by two employees | Content hashes and extracted-field matching across the whole company, one receipt per transaction, card and reimbursement cross-checks |

Two patterns cut across the subtypes. **Split transactions** (two purchases just under an approval or receipt threshold, minutes apart at the same merchant) are a control evasion, caught by aggregating per merchant and cardholder over a short window. **Card spend reduces some fraud and creates other kinds:** it ends fictitious out-of-pocket claims for card-paid categories, but a card in hand can be used for personal purchases outright, which is mischaracterization at the point of sale. Audit samples complement rules: Concur's Intelligent Audit and Emburse's AI Audit are post-submission review products, and a sample should be stratified toward the scheme indicators above rather than uniform. Issuer-side card fraud by outsiders is a different problem ([Issuer-Side Fraud](/books/payments/issuer-processing#issuer-side-fraud)), and so is billing fraud through vendors, which [AP, Bill Pay & Procurement](/books/banking-and-lending/accounts-payable) covers.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). A card expense points at the Payments volume's `clearing_records` row for the purchase (and through it the card and authorization); an out-of-pocket expense has none until it's reimbursed through a `transactions` row. Cards and their programs are [Virtual Cards & Spend Controls](/books/banking-and-lending/card-controls#how-to-build-it), whose `spend_programs.receipt_policy_ref` names the policy below.

```sql
CREATE TABLE expense_policies (              -- versioned: thresholds, category rules, model-facing text
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id         UUID NOT NULL REFERENCES parties (id),  -- the business whose policy this is
  version             INT NOT NULL,
  receipt_threshold   BIGINT NOT NULL,       -- the company's; never above the IRS $75 (7500)
  lodging_always      BOOLEAN NOT NULL DEFAULT true,
  submit_within_days  SMALLINT NOT NULL,
  rules               JSONB NOT NULL,        -- category limits, attendee rules, banned categories
  structured_text_ref TEXT,                  -- the agent-facing policy document, if a model reviews
  valid_during        TSTZRANGE NOT NULL,
  UNIQUE (business_id, version),
  CHECK (receipt_threshold <= 7500)
);

CREATE TABLE expenses (                      -- the business's claim about one outlay
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id         UUID NOT NULL REFERENCES parties (id),
  employee_id         UUID NOT NULL REFERENCES parties (id),
  source              TEXT NOT NULL CHECK (source IN ('card', 'out_of_pocket', 'mileage', 'per_diem')),
  clearing_record_id  UUID UNIQUE REFERENCES clearing_records (id),  -- card expenses; one expense per purchase
  amount              BIGINT NOT NULL,
  currency            CHAR(3) NOT NULL,
  spent_on            DATE NOT NULL,
  merchant_name       TEXT,
  category            TEXT,
  business_purpose    TEXT,
  attendees           JSONB,                 -- names and business relationship, for meals
  trip_ref            TEXT,                  -- departure, return and destination live on the trip
  coding              JSONB,                 -- GL account and dimensions, from Accounting Sync
  memo_recorded_at    TIMESTAMPTZ,           -- "at or near the time" is measurable
  status              TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'in_review', 'approved',
                        'rejected', 'repaid', 'reimbursed', 'exported')),
  policy_id           UUID REFERENCES expense_policies (id),   -- the version it was judged under
  CHECK ((source = 'card') = (clearing_record_id IS NOT NULL))
);

CREATE TABLE expense_receipts (              -- each document as received, never edited
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id         UUID NOT NULL REFERENCES parties (id),
  channel             TEXT NOT NULL CHECK (channel IN ('inbox', 'forward', 'mobile', 'photo_library',
                        'browser', 'merchant_connector', 'sms', 'chat', 'api', 'web')),
  submitted_by_ref    TEXT NOT NULL,
  object_key          TEXT NOT NULL,         -- the stored file
  content_sha256      TEXT NOT NULL,         -- identical files, across the whole company
  extracted           JSONB,                 -- merchant, total, date, tax, tip, currency, lines, guests
  extraction_confidence JSONB,               -- per field
  extraction_model    TEXT,
  receipt_number      TEXT,                  -- as printed, for reuse checks
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE receipt_matches (
  receipt_id          UUID NOT NULL REFERENCES expense_receipts (id),
  expense_id          UUID NOT NULL REFERENCES expenses (id),
  method              TEXT NOT NULL CHECK (method IN ('auto', 'suggested_confirmed', 'manual')),
  score               NUMERIC(5, 4),
  rule_version        TEXT NOT NULL,
  split_share         NUMERIC(7, 4),         -- set only when one receipt is split across expenses
  matched_by          TEXT NOT NULL,
  matched_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unmatched_at        TIMESTAMPTZ,
  PRIMARY KEY (receipt_id, expense_id)
);

CREATE TABLE expense_policy_evaluations (    -- rules and model, every run kept
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  expense_id          UUID NOT NULL REFERENCES expenses (id),
  policy_id           UUID NOT NULL REFERENCES expense_policies (id),
  evaluator           TEXT NOT NULL CHECK (evaluator IN ('rules', 'model')),
  model_version       TEXT,
  outcome             TEXT NOT NULL CHECK (outcome IN ('pass', 'violation', 'approve_recommended',
                        'review_required', 'reject_recommended')),
  findings            JSONB NOT NULL,        -- rule IDs or policy citations, with the inputs read
  evaluated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (evaluator = 'rules' OR model_version IS NOT NULL)
);

CREATE TABLE expense_approvals (             -- one row per step; delegation named
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_kind        TEXT NOT NULL CHECK (subject_kind IN ('expense', 'spend_request', 'bill')),
  subject_id          UUID NOT NULL,
  step                SMALLINT NOT NULL,
  routing_rule_version TEXT NOT NULL,
  approver_ref        TEXT NOT NULL,
  on_behalf_of_ref    TEXT,                  -- the delegator, when a delegate decides
  submitter_ref       TEXT NOT NULL,
  decision            TEXT CHECK (decision IN ('approved', 'rejected', 'returned')),
  automated           BOOLEAN NOT NULL DEFAULT false,  -- auto-approval, only where a workflow allows it
  evaluation_id       UUID REFERENCES expense_policy_evaluations (id),
  due_at              TIMESTAMPTZ,
  decided_at          TIMESTAMPTZ,
  comment             TEXT,
  UNIQUE (subject_kind, subject_id, step),
  CHECK (approver_ref <> submitter_ref),
  CHECK (NOT automated OR evaluation_id IS NOT NULL)
);
```

Design notes:

- **One expense per purchase.** `clearing_record_id` is unique, so a card transaction can't be expensed twice; a refund is its own clearing record and its own negative expense, and a split purchase is one expense with allocated coding, not two expenses.
- **Receipts are immutable documents.** `expense_receipts` keeps the file, its hash and what was extracted; matching is a separate, reversible record with its method and score. A duplicate check is a query on `content_sha256`, `receipt_number` and extracted merchant, total and date across the company, not just the employee.
- **Every evaluation is kept,** rules and model, with the policy version, so an expense judged before a policy change can be shown to have passed the rules then in force, and a model's recommendation can be compared with the human decision ([Measuring It](/docs/architecture/risk-scoring#measuring-it)).
- **Approvals are steps with constraints:** no self-approval, delegation named, and automated approval only with the evaluation that justified it. The same table serves expenses, card requests and bills, so a company's approval history is one query.
- **Retention follows the tax record.** Receipts and evaluations are kept as long as the return they support can be examined, on a retention rule rather than a default ([Data Retention](/docs/architecture/data-retention)).

## Auditing

Internal audit, external auditors and tax examiners read the expense record. The general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **For each expense,** the card transaction or employee entry, the receipt as received, how and when it was matched, the business purpose and attendees, and when they were recorded.
- **The policy version and every evaluation** (rules and model) with findings and citations.
- **Every approval step** with the approver, delegation, decision, time and routing rule.
- **Every exception:** missing-receipt declarations, overrides of a violation, and who allowed them.
- **Duplicate and anomaly checks** that ran, what they flagged and how each flag was closed.
- **Access to receipts,** which can carry personal data (a pharmacy receipt, a hotel folio with a home address), logged as reads ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Start from the card transaction** and gather the receipt, purpose and coding around it, with one expense per purchase.
- **Encode the IRS floor as rules:** receipts for lodging and at $75 or more, receipt content by category, a business purpose, and timestamps that show records were made at or near the time.
- **Fan in capture, deduplicate globally,** and match on merchant, amount and date with category tolerances and review bands.
- **Store what the machine read beside what the person confirmed,** with confidence and model version.
- **Let models recommend and code decide,** with versioned policies, citations, and auto-approval only where a workflow allows it.
- **Route approvals as recorded steps,** with no self-approval and named delegation, on one engine for expenses, requests and bills.
- **Audit for the four schemes** (mischaracterized, overstated, fictitious, multiple) and for split transactions, with samples weighted toward the indicators.

## References

**Law and regulation**

- [Cornell LII: 26 CFR 1.274-5](https://www.law.cornell.edu/cfr/text/26/1.274-5), documentary evidence for lodging and expenditures of $75 or more, the transportation exception, adequate receipts (amount, date, place and essential character), hotel and restaurant receipt contents, and cancelled checks
- [Cornell LII: 26 CFR 1.274-5T](https://www.law.cornell.edu/cfr/text/26/1.274-5T), the elements to prove for travel, entertainment and gifts, adequate records made at or near the time, the business purpose statement, other corroborative evidence, reasonable reconstruction of lost records, and adequate accounting to an employer

**Vendor documentation**

- [Ramp: Automate receipts and expense requirements](https://support.ramp.com/automate-receipts-and-expense-requirements), capture channels, matching on merchant, amount and date, Missing items, and high-confidence auto-fill
- [Ramp: Policy Agent overview](https://support.ramp.com/policy-agent-overview), the structured policy, inputs, three outcomes with citations, workflow-enabled auto-approval, the 24-hour re-evaluation, no accounting code checks, and the reported 85% and 99%+ figures
- [Ramp: Pricing](https://ramp.com/pricing), payment release approvals and AI-driven expense reviews on Plus
- [Brex: Expenses API](https://developer.brex.com/openapi/expenses_api.md), receipt match and upload endpoints and the 30-minute pre-signed URL
- [SAP Concur](https://www.concur.com/), Expense, Request, Detect and Intelligent Audit, receipt auto-capture and OCR extraction of merchant, amount, date and category
- [Emburse](https://www.emburse.com/), Assurance as an AI compliance layer before and after submission, and the AI Audit and Travel Audit add-ons

**Filings**

- [Expensify: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1476840/000147684026000009/exfy-20251231.htm), SmartScan capture and billing per active policy member

**Research**

- [ACFE: Occupational Fraud 2026: A Report to the Nations](https://www.acfe.com/fraud-resources/report-to-the-nations), the 14th edition with 2,402 cases from 143 countries and territories
- [ACFE: The Fraud Tree (2026)](https://www.acfe.com/fraud-resources/fraud-risk-tools---coso/-/media/f7c3fc57fa5c46009eda18414bed130f.ashx), asset misappropriation in 90% of cases (median $100,000), expense reimbursement schemes in 13% ($36,000), billing schemes in 21% ($90,000), the scheme definitions and the four expense reimbursement subtypes
