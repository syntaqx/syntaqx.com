+++
title = "Eligibility & Benefits"
description = "Checking coverage before the visit: 270/271, real-time and batch, service type codes, dental frequencies and maximums, coordination of benefits, cards, portals."
category = "Health Tech Industry"
order = 1920
part = "Revenue Cycle"
tags = ["health-tech", "eligibility", "x12-270", "x12-271", "dental-benefits", "coordination-of-benefits", "data-model"]
+++

Every claim that comes back "coverage terminated" or "patient not found" was a question nobody asked before the visit: is this person covered by this plan today, and what will the plan pay for what we're about to do? The question has a federal standard answer. A practice sends an X12 270 eligibility inquiry naming the payer, the provider, the member and a service type; the payer answers with a 271 that says whether coverage is active and, in benefit segments, what the deductible, copay, coinsurance and limits are. A large practice runs it automatically for every appointment two days ahead; a small one runs it from a button on the schedule and reads the answer aloud to the patient at check-in.

The hard part is that the answer is less complete than it looks. A 271 is good at "active or not" and at the plan-level deductible and copay, and much weaker at the specifics a practice cares about: how many cleanings this patient has left this year, whether the crown on tooth 3 was replaced too recently, whether the plan downgrades a white filling to the price of a silver one. Dental benefits are the extreme case, which is why dental offices still spend hours on payer portals and phone calls and why "insurance verification" is a product category of its own. This chapter covers the 270/271 transaction, real-time and batch checks, service type codes, reading benefits, dental benefits in depth, coordination of benefits between two plans, capturing the insurance card, and the portal reality. It extends `coverages`, `payers` and `plans` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model); the overview of the cycle is [The Revenue Cycle](/books/health-tech/revenue-cycle).

## How the Platforms Do It

As of October 2026, from each vendor's or regulator's documentation:

| Platform | Modes | What it returns | Notable mechanics |
| --- | --- | --- | --- |
| **CMS HETS** (Medicare) | Real-time only; "does not accept batch transactions" | Medicare Part A and B eligibility | Submitters build or buy their own 270/271 software; "typically available 24 hours a day, 7 days a week" |
| **Stedi** | Real-time JSON, raw X12 and CAQH CORE SOAP endpoints; batch of up to 10,000 checks | A normalized `benefits` list per plan (coinsurance, copay, deductible, out of pocket, limitations, non-covered) and the raw benefit segments | Service type code defaults to `30`; one service type per request recommended; payers can take up to 60 seconds, "Most checks finish in 1–2 seconds"; batch retries for 8 to 24 hours |
| **Availity** (Coverages API) | Asynchronous: submit, then poll | 270/271 on 005010X279A1 | An "In Progress" status means poll again "after a brief pause (e.g., 2 seconds)"; every poll counts against transaction limits |
| **DentalXChange** (Real-Time) | Real-time, from the website, a desktop tool or the PMS | Active, Inactive or Not Available, and benefits "where the payer supplies them" | "Real-Time displays current information only as it is provided by the payer"; integrated with Denticon, Open Dental, Dentimax and others |
| **Vyne Dental** (Trellis) | Batch and real-time | Eligibility with benefit breakdowns | Bundled with claims and attachments |

Three patterns:

- **Real-time is a request that can take a minute.** Stedi holds a check open up to 120 seconds because payers can take 60; Availity makes the caller poll. A PMS that blocks the check-in screen on a synchronous call will freeze on a slow payer, so the check runs in the background and the screen shows "checking" until it lands.
- **The payer decides the depth.** Every vendor says, in its own words, that it returns what the payer sends. Two payers answering the same 270 can return a one-line "active" and a hundred benefit segments.
- **Ask one question at a time.** Payers answer the service type asked about, and many ignore a list. Stedi recommends one service type code per request; a dental office that wants preventive, basic and major benefits sends three checks.

## The 270 and 271

The inquiry names five things: the payer (by its payer ID at the clearinghouse), the information receiver (the practice, by NPI), the subscriber (member ID, name, date of birth), the dependent if the patient isn't the subscriber, and the service type and date being asked about. The response echoes the parties, corrects or adds demographic data, and carries benefit information as a list of `EB` segments, each answering one narrow question.

An illustrative 271 fragment for a physical therapy check (written for this chapter, not taken from an implementation guide):

```
EB*1*IND*30**GOLD PPO 2026~
EB*C*IND*30***23*1500~
EB*C*IND*30***29*875~
EB*B*IND*PT***27*40~
EB*A*IND*PT****.2~
EB*F*IND*PT***23**30~
MSG*AUTH REQUIRED AFTER VISIT 12~
```

Read top to bottom: active coverage (`1`) for an individual (`IND`) under plan "GOLD PPO 2026"; a calendar-year (`23`) deductible (`C`) of $1,500 with $875 remaining (`29`); a $40 copay (`B`) per visit (`27`) for physical therapy (`PT`); 20% coinsurance (`A`); a limitation (`F`) of 30 visits a calendar year; and a free-text message that the plan requires authorization after the twelfth visit. Stedi's documentation decodes the same codes: benefit codes `1` to `5` mean active and `6` to `8` inactive, `A` coinsurance, `B` copay, `C` deductible, `F` limitations, `G` out of pocket, with time qualifiers such as `23` for calendar year and `27` for visit.

Three things in that fragment cause most of the parsing work:

- **Amounts are scoped.** Every `EB` has a coverage level (individual or family), a service type, a network indicator (in or out of network, in later elements) and a time period. "The deductible" is really several numbers: individual and family, in and out of network, total and remaining. A screen that shows one deductible is showing a guess.
- **Free text carries rules.** The authorization rule above arrived as a `MSG`, not a coded segment. Payers put frequency limits, waiting periods and carve-outs in messages because the codes can't say them, so a system that only parses codes misses them, and one that shows messages verbatim at least lets the front desk see them.
- **Errors are data.** A 271 can reject the inquiry with a reason (subscriber not found, invalid date of birth, provider not on file) in an `AAA` segment. A rejection isn't "inactive"; it means the question was malformed, and the fix is correcting the inquiry, usually the member ID or the birth date.

## Service Type Codes

The service type code is the question's subject, from an X12 external code list. The ones a practice uses most, with X12's names:

| Code | Name | Typical asker |
| --- | --- | --- |
| `30` | Health Benefit Plan Coverage | Any practice; the default "is this person covered?" |
| `35` | Dental Care | Dental, general coverage |
| `23` | Diagnostic Dental | Dental: exams and X-rays |
| `41` | Preventive Dental | Dental: cleanings, fluoride, sealants |
| `25` | Restorative | Dental: fillings |
| `24` / `26` | Periodontics / Endodontics | Dental: gum treatment, root canals |
| `36` / `39` | Dental Crowns / Prosthodontics | Dental: crowns, bridges, dentures |
| `38` | Orthodontics | Orthodontic offices |
| `40` | Oral Surgery | Extractions, implants |
| `AL` | Optometry | Optometry: routine vision, glasses, contacts |
| `PT` | Physical Therapy | PT clinics |
| `MH` | Mental Health | Behavioral health |
| `UC` | Urgent Care | Urgent care centers |

A practice's eligibility configuration is a map from its appointment types to the service types to ask about: a new-patient dental exam asks `35`, `23` and `41`; a PT evaluation asks `30` and `PT`. The map belongs in data, per practice, because a specialty clinic's questions differ from a general practice's ([What Belongs in Data](/docs/architecture/rules-as-data#what-belongs-in-data)).

## Real-Time and Batch

- **Real-time** answers while the patient is present: at booking, at check-in, when the front desk edits insurance. The CAQH CORE eligibility rules adopted under HIPAA (45 CFR 162.920) require plans to support real-time inquiries, and Medicare's HETS offers only real-time.
- **Batch** checks tomorrow's schedule overnight. Stedi accepts up to 10,000 checks in a batch and retries failed ones for a configurable 8 to 24 hours; results come back by polling the batch ID. Batch is how a practice verifies everyone before the day starts and finds the terminated coverage while there is still time to call the patient.

My default is both: a batch run two business days before each appointment, so the front desk has a day to resolve problems, and a real-time re-check at check-in only if coverage was inactive, the insurance was edited, or the month changed (coverage often terminates at month end). Re-checking everyone at check-in doubles transaction cost for little new information.

A check is also not free to the payer, and some payers throttle. Every check is logged with its purpose, so a practice can show it isn't scraping its whole patient list every night and a vendor can see which practices' volumes are out of line.

## Dental Benefits

Dental plans are small indemnity contracts with many rules, and those rules decide the patient's bill more than the deductible does. What a dental office needs to know about a patient's plan, and how well the 271 carries it:

| Benefit term | What it means | In the 271? |
| --- | --- | --- |
| **Annual maximum** | The most the plan pays per benefit year, per person | Usually, as a limitation with an amount and a remaining amount |
| **Deductible** | Paid by the patient before coinsurance, often waived for preventive | Usually, though "waived for preventive" may be a message |
| **Coinsurance by category** | The share the plan pays for preventive, basic and major services (the "100/80/50" shape) | Usually, if the office asks by category service type |
| **Frequency limits** | How often a procedure is covered: exams and cleanings per year, bitewings per year, a full-mouth series every few years, a crown per tooth every several years | Inconsistently; often in messages |
| **History** | When this patient last had each limited procedure, needed to apply the frequency | Rarely |
| **Waiting periods** | Months after enrollment before basic or major services are covered | Sometimes, with benefit-specific dates |
| **Missing tooth clause** | No benefit to replace a tooth lost before coverage began | Rarely |
| **Downgrades and alternate benefits** | The plan pays a composite (white) filling on a back tooth at the amalgam (silver) rate, or a crown at the rate of a filling | Rarely |
| **Orthodontic lifetime maximum and age limit** | A separate lifetime cap and an age cutoff | Sometimes |

Stedi's documentation says that for dental, benefit-specific dates are common and waiting periods vary by service. The structural reason frequencies come back badly is in the 5010 transaction itself. Asked how a payer should report one frequency limit shared across several CDT codes (one exam limit covering periodic, comprehensive and limited exams, say), X12's interpretation (RFI 2773) explains that in version 5010 the procedure element holds only one code or range, that later versions let it repeat but aren't the HIPAA-mandated version, and that "we do not have a way to provide a response that would be better parsable." Shared frequencies arrive as several segments or as text.

So a dental eligibility product has three layers:

1. **The 271**, parsed into structured benefits, with messages kept and shown.
2. **A plan benefit record** (sometimes called a "benefit breakdown") that the office completes once per employer group plan, by portal or phone, and reuses for every patient on that plan: frequencies, downgrades, waiting periods, missing tooth clause. Dental PMSs keep these as insurance plan records shared by every patient on the plan, which is why one wrong entry misquotes a whole employer's staff.
3. **The patient's history**, from the practice's own procedure records and, where the payer returns it, the 271's procedure history, to apply frequencies: a patient who had a cleaning in March and another in September has used two of two.

The estimate that results (what the plan pays for each line of a treatment plan, and what the patient owes) is computed from all three, and it is still an estimate: the dental payer's own pre-treatment estimate (a predetermination, sent as an 837D) is the only firm answer short of the claim ([Dental Claims](/books/health-tech/claims#dental-claims)). Treatment plans and case acceptance are Part 5's Dental Practice chapter.

## Coordination of Benefits

When a patient has two plans, one pays first (primary) and the other pays some or all of what's left (secondary). Getting the order wrong means a denial from both. The order follows rules most plans adopt from the NAIC's Coordination of Benefits Model Regulation:

- **The plan covering the person as an employee or member** is primary over one covering them as a dependent.
- **For a dependent child of parents who are married or living together,** the "birthday rule": "The plan of the parent whose birthday falls earlier in the calendar year is the primary plan," with "Birthday" referring "only to month and day," and if both parents share a birthday, the plan that has covered a parent longer is primary. Separated or divorced parents follow a court decree first, then a sequence of custodial rules.
- **Active employment over retirement or COBRA,** and longer coverage over shorter when nothing else decides.

Medicare has its own secondary payer rules. For example, Medicare is secondary for a person aged 65 or older covered by a group health plan through current employment with an employer that has at least 20 employees (42 CFR 411.172); liability and workers' compensation coverage can be primary for the injury they cover.

Dental adds a wrinkle: secondary dental plans differ in how they compute what's left (some pay up to their own allowance, some only the balance the primary left, some never more than they'd have paid as primary), so the secondary payment is a function of the secondary plan's coordination method, which belongs on the plan record.

What the software stores: each coverage's order (1, 2, 3) per patient, the subscriber and the patient's relationship to them, and the date the order was last confirmed. A 271 may report other coverage it knows about; that hint is a reason to ask the patient, not a reason to reorder automatically. Secondary claims are built from the primary's remittance ([Secondary Claims](/books/health-tech/remittance-and-payment-posting#secondary-claims)).

## Capturing the Card

An eligibility check is only as good as the member ID and birth date it sends. Most inquiry rejections are typos in one of them, or a patient's own data sent where the subscriber's should be. Practices capture insurance at three moments, each with its own failure:

- **Online booking or intake,** where the patient types or photographs the card. Patients mistake the group number for the member ID and leave off prefixes, and a card photo is the evidence that settles it. Digital intake is the Part 5 chapter Digital Intake, Forms & Consent.
- **At the desk,** a scan of the card front and back.
- **From the payer,** when a 271 corrects the name or birth date on file, or a search by name and birth date without a member ID finds the member (payers support some search options under the operating rules, but not uniformly).

Card OCR reads the payer name, member ID, group number and printed copays from the image. My rules for it: keep the image as the source document; treat OCR output as a proposal the patient or staff confirms; map the printed payer name to a payer ID through a maintained table (card logos name brands and networks, not clearinghouse payer IDs, and one card can show a network logo for a different administrator); and run an eligibility check on the result before the visit, so a wrong read surfaces as a rejected inquiry rather than a denied claim. The images are PHI and go into the same storage and access controls as clinical documents ([File Uploads](/docs/architecture/file-uploads)).

## Portals and the Phone

Where the 271 stops, practices go to the payer's provider portal or call. Dental offices verify frequencies and history this way routinely, and medical offices do it for benefits the 271 doesn't detail. This has produced three kinds of product:

- **Verification services** that do the portal and phone work for the practice, with staff.
- **Portal automation,** software that logs in to payer portals with the practice's credentials and reads the benefit pages. It works, and it is fragile: portals change layouts, add multi-factor authentication, and their terms of use often prohibit automated access. A product built on it needs per-payer monitoring, a fallback to people, and a clear position on whose credentials it uses and whether the payer's terms allow it.
- **Better use of what the 271 does return,** plus shared plan records so each employer plan is verified once.

My default for a new product: parse the 271 thoroughly, keep shared plan benefit records with a "last verified" date and source, and treat portal automation as an optional, per-payer, monitored path rather than the foundation, because the foundation should be the transaction payers are required to support.

## How to Build It

The core `coverages` row is a patient's policy with a payer and plan; `plans` holds plan-level terms. This chapter adds coordination fields, every eligibility check with its raw response, parsed benefits, dental plan rules and procedure usage:

```sql
ALTER TABLE coverages
  ADD COLUMN cob_order          SMALLINT NOT NULL DEFAULT 1 CHECK (cob_order BETWEEN 1 AND 3),
  ADD COLUMN cob_confirmed_at   TIMESTAMPTZ,       -- when the order was last confirmed with the patient
  ADD COLUMN subscriber_relation TEXT NOT NULL CHECK (subscriber_relation IN ('self', 'spouse',
                                  'child', 'other')),
  ADD COLUMN card_front_doc_id  UUID REFERENCES documents (id),
  ADD COLUMN card_back_doc_id   UUID REFERENCES documents (id),
  ADD COLUMN last_check_id      UUID,              -- eligibility_checks, below
  ADD COLUMN last_status        TEXT CHECK (last_status IN ('active', 'inactive', 'unknown',
                                  'rejected'));

ALTER TABLE plans
  ADD COLUMN benefit_year_start  DATE,              -- calendar year or a plan year
  ADD COLUMN cob_method          TEXT CHECK (cob_method IN ('standard', 'non_duplication',
                                  'carve_out')),    -- how a secondary computes what's left
  ADD COLUMN verified_at         TIMESTAMPTZ,       -- the shared benefit record's last check
  ADD COLUMN verified_source     TEXT CHECK (verified_source IN ('271', 'portal', 'phone',
                                  'payer_document'));

CREATE TABLE eligibility_checks (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  coverage_id      UUID NOT NULL REFERENCES coverages (id),
  appointment_id   UUID REFERENCES appointments (id),
  purpose          TEXT NOT NULL CHECK (purpose IN ('batch_pre_visit', 'check_in', 'insurance_edit',
                     'estimate', 'manual')),
  service_type     TEXT NOT NULL,          -- '30', '35', '41', 'PT'
  service_date     DATE NOT NULL,
  request_txn_id   UUID REFERENCES edi_transactions (id),
  response_txn_id  UUID REFERENCES edi_transactions (id),  -- raw 271 kept there
  outcome          TEXT NOT NULL CHECK (outcome IN ('pending', 'active', 'inactive', 'rejected',
                     'payer_timeout', 'error')),
  reject_reason    TEXT,                   -- AAA reason code, if rejected
  corrections      JSONB,                  -- demographic corrections the payer returned
  other_coverage   JSONB,                  -- other payers the 271 mentioned: a prompt, not a fact
  requested_by     UUID,
  requested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);
CREATE INDEX eligibility_checks_coverage_idx ON eligibility_checks (coverage_id, requested_at DESC);

CREATE TABLE coverage_benefits (         -- one parsed EB answer, scoped as the payer scoped it
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  check_id         UUID NOT NULL REFERENCES eligibility_checks (id),
  benefit_code     TEXT NOT NULL,          -- '1', 'A', 'B', 'C', 'F', 'G', ...
  service_type     TEXT,
  coverage_level   TEXT,                   -- 'IND', 'FAM'
  in_network       BOOLEAN,                -- null when the payer didn't say
  time_period      TEXT,                   -- '23' calendar year, '29' remaining, '27' visit
  amount           BIGINT,                 -- cents
  percent          NUMERIC(5,4),
  quantity         NUMERIC,
  quantity_unit    TEXT,                   -- visits, years, months
  procedure_codes  TEXT[],                 -- CDT or CPT the answer applies to
  auth_required    BOOLEAN,
  messages         TEXT[],                 -- free text, kept verbatim and shown
  raw_segment      TEXT NOT NULL
);

CREATE TABLE plan_procedure_rules (      -- dental benefit breakdown, shared by every patient on the plan
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  plan_id          UUID NOT NULL REFERENCES plans (id),
  procedure_codes  TEXT[] NOT NULL,        -- a shared frequency covers several codes
  category         TEXT CHECK (category IN ('preventive', 'basic', 'major', 'ortho')),
  coinsurance      NUMERIC(5,4),
  frequency_count  SMALLINT,
  frequency_period TEXT CHECK (frequency_period IN ('benefit_year', 'calendar_year',
                     'rolling_months', 'lifetime')),
  frequency_months SMALLINT,               -- for rolling periods: 6, 36, 60
  per_tooth        BOOLEAN NOT NULL DEFAULT FALSE,
  waiting_months   SMALLINT,
  downgrade_to     TEXT,                   -- alternate benefit code, e.g. the amalgam equivalent
  age_min          SMALLINT,
  age_max          SMALLINT,
  source           TEXT NOT NULL CHECK (source IN ('271', 'portal', 'phone', 'payer_document')),
  verified_at      TIMESTAMPTZ NOT NULL,
  verified_by      UUID
);
```

Usage against a frequency is computed, not stored, from the practice's own `procedures` (and history the payer reported), so a correction to a procedure date changes the answer everywhere:

```sql
-- How many of a shared frequency has this patient used in the current benefit year?
SELECT r.id, r.frequency_count, COUNT(p.id) AS used
FROM plan_procedure_rules r
JOIN coverages c ON c.plan_id = r.plan_id AND c.id = $1
LEFT JOIN procedures p
  ON p.patient_id = c.patient_id
 AND p.code = ANY (r.procedure_codes)
 AND p.status = 'completed'
 AND p.performed_on >= $2              -- start of the benefit year, from plans.benefit_year_start
 AND (NOT r.per_tooth OR p.tooth = $3)
WHERE r.frequency_period = 'benefit_year'
GROUP BY r.id, r.frequency_count;
```

Design notes:

- **Keep the 271.** The raw response is stored by reference on `edi_transactions`; benefits are parsed into rows but the original is the evidence of what the payer said on that date, which is what an "eligibility was verified" defense in a dispute rests on.
- **A check is about a date.** Coverage on the 31st isn't coverage on the 1st. The check stores its service date, and the system re-checks when an appointment moves into a new month.
- **Unknown is a state.** A payer timeout is neither active nor inactive; the appointment shows "not verified" and the batch retries.
- **Shared plan records need owners.** A plan rule edited for one patient changes estimates for every patient on the plan, so edits are versioned and attributed, and an estimate records which rule versions it used.
- **Map appointment types to service types in data,** per practice, and send one service type per inquiry.

## Auditing

- **Every check:** who or what asked, why, for which date and service type, and the raw response, retained with the billing records it supports ([Retention Windows](/docs/architecture/data-retention#retention-windows)).
- **Every change to coverage order or member data,** with the source (patient, card, 271 correction, staff), since a wrong primary is a double denial.
- **Every edit to shared plan rules,** versioned, with the source and verifier.
- **Check volumes per practice and payer,** to show checks are tied to appointments and to catch runaway loops.

## What This Means for the System You Build

- **Run eligibility in the background:** batch two business days ahead, real-time only when something changed, and never block a screen on a payer that can take a minute.
- **Ask one service type per inquiry,** mapped from appointment types in per-practice data.
- **Parse benefits with their full scope** (level, network, period, remaining), keep payer messages verbatim, and treat rejections and timeouts as their own states.
- **For dental, layer the 271, shared plan benefit records and the patient's own history,** because frequencies, downgrades and waiting periods don't fit the 5010 transaction well.
- **Store coordination order explicitly** with the birthday rule and Medicare secondary rules in mind, and confirm it with the patient rather than reordering on a payer hint.
- **Keep the card image as the source of truth,** with OCR as a confirmed proposal and a maintained map from card names to payer IDs.
- **Build on the 271 first;** treat portal automation as monitored, per-payer and optional.

## References

**Regulations, standards and interpretations**

- [CMS: HIPAA Eligibility Transaction System (HETS)](https://www.cms.gov/data-research/cms-information-technology/hipaa-eligibility-transaction-system), real-time only, no batch, availability and submitter requirements
- [45 CFR 162.920: Operating rules incorporated by reference](https://www.law.cornell.edu/cfr/text/45/162.920), the CAQH CORE eligibility rules
- [X12: Service type codes](https://x12.org/codes/service-type-codes), the code list and names
- [X12: RFI 2773, eligibility frequency limits shared by multiple procedures](https://x12.org/resources/requests-for-interpretation/rfi-2773-eligibility-frequency-limits-shared-multiple), the 5010 single-code limit and X12's answer
- [NAIC: Coordination of Benefits Model Regulation](https://content.naic.org/sites/default/files/model-law-120.pdf), order of benefit determination and the birthday rule
- [42 CFR 411.172: Medicare secondary payer for the working aged](https://www.law.cornell.edu/cfr/text/42/411.172), the 20-employee threshold

**Vendor documentation**

- [Stedi: Send eligibility checks](https://www.stedi.com/docs/healthcare/send-eligibility-checks), endpoints, the default service type, one service type per request, payer and request timeouts, the benefits structure
- [Stedi: Active coverage and benefits](https://www.stedi.com/docs/healthcare/eligibility-active-coverage-benefits), benefit codes, time qualifiers, dental benefit dates and waiting periods
- [Stedi: Batch eligibility API](https://stedi.com/docs/api-reference/healthcare/post-healthcare-batch-eligibility), 10,000 checks per batch, retry hours
- [Availity: API guide](https://developer.availity.com/blog/2025/10/31/availity-api-guide), the asynchronous Coverages API, polling and transaction limits
- [DentalXChange: Real-Time](https://help.dentalxchange.com/DentalXChangeHelp/RealTime.htm), dental eligibility, benefits and claim status, PMS integrations, payer-dependent results
- [Vyne Dental: Vyne Trellis](https://vynedental.com/blog/unlock-the-potential-of-vyne-trellis/), batch and real-time dental eligibility with benefit breakdowns
