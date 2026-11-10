+++
title = "Carrier Connections & the 834"
nav_title = "Carrier Connections"
description = "The 834 from the employer side: change and full files, maintenance codes, TA1 and 999, connection setup and testing, API carriers, and invoice reconciliation."
category = "Workforce Industry"
order = 2646
part = "Benefits Administration"
tags = ["benefits", "x12-834", "edi", "carriers", "enrollment", "reconciliation"]
+++

An employer's benefits record and a carrier's membership record are two copies of the same facts, kept in two companies' systems, synchronized by files. The employer (or its benefits administration platform, broker or PEO) decides who is enrolled in what, from when; the carrier pays claims only for people it has on file. Every add, change and termination has to cross the gap, and the standard way to cross it is the ASC X12 834, the HIPAA benefit enrollment and maintenance transaction, sent as a daily or weekly change file with a periodic full file to prove the copies still agree. Newer carriers and connection networks offer APIs instead, but most of the market still runs on files, testing cycles measured in weeks, and acknowledgments that say a file was readable without saying it was right.

The money closes the loop. The carrier bills the employer from its copy of the census; payroll deducted the employee share from the employer's copy; the two disagree whenever a change crossed late or not at all, and the employer either overpays for people who left or underpays for people the carrier doesn't know it covers. This chapter covers the 834 from the sender's side (its structure, change and full files, maintenance and reason codes, acknowledgments), what a carrier connection is and how it's tested, API carriers and connection networks, and reconciling carrier invoices to deductions. What the carrier does with the file is [Health Tech's payer view](/books/health-tech/payer-operations#enrollment-and-membership); the carrier-side census and list bill for group life and disability are [Insurance's](/books/insurance/group-life-and-disability#carrier-side-enrollment-and-billing); the elections that feed the file are Enrollment & Life Events.

## How the Platforms Do It

How enrollment reaches carriers, from public pages and documentation, as of November 2026:

| Platform | Connection method | What it states | Notes |
| --- | --- | --- | --- |
| **Noyo** | API to carriers that support it, EDI feeds to those that don't | "REST-based with OpenAPI 3.0," "One integration; many carriers"; "Feeds are how Noyo manages connections with carriers that require EDI file transmissions" | Connection tiers (Premier, Advanced, Standard); "Most changes for Sync carriers are completed in seconds"; carrier testing can take up to six weeks |
| **Employee Navigator** | Broker-distributed benefits administration with carrier and payroll integrations | "connects 195,000+ employers, 7,000+ brokers, and 600+ partners" | Owns Ease |
| **Benefitfocus (Voya)** | Benefits administration platform, "open-architecture and product-agnostic, enrolling and administering benefits from a variety of third-party carriers" | About 12.2 million employees on the platform at December 31, 2025 (Voya's 10-K) | Part of Voya's Employee Benefits segment |
| **Paycom** | Inside the HCM suite | "Benefits to Carrier tool automates secure communication with your plan providers" | Payroll and enrollment on one record |
| **ADP** | Inside the HCM suite | "Automatic payroll deductions and carrier integrations" | |

Two connection models run side by side. **File connections** are a mapping from the employer's records to one carrier's companion guide, a schedule, and a transmission channel, built and tested per carrier and often per group. **API connections** replace the file with calls the carrier answers immediately, which is why Noyo's pitch is "open enrollment without EDI files, blackout periods, and a million different workflows for each carrier." A platform needs both for years, so the internal model has to be the enrollment change, not the file.

## The 834 in One Page

The 834 is a HIPAA standard. The benefit enrollment and maintenance transaction is "the transmission of subscriber enrollment information from the sponsor of the insurance coverage" to a health plan to establish or terminate coverage (45 CFR 162.1501), and the adopted standard is ASC X12N/005010X220 for transactions "on and after January 1, 2012" (45 CFR 162.1502), used in practice with its errata as 005010X220A1. A health plan asked to conduct a standard transaction "must do so" and "may not delay or reject a transaction" because it is standard (45 CFR 162.925). The employer, as plan sponsor, isn't the party the rule binds, which is why small groups still send spreadsheets and carriers still accept them.

Every carrier publishes a **companion guide** saying which optional parts it uses and what values it expects; the CMS guide for the federal exchange, for example, is "based on the 005010X220 Implementation Guide and its associated 005010X220A1 addenda." The structure, as those guides describe it:

| Part | Segments | Carries |
| --- | --- | --- |
| **Envelope** | ISA/IEA, GS/GE, ST/SE | Sender and receiver, version (GS08 = 005010X220A1), control numbers |
| **Header** | BGN, REF, DTP, N1 (sponsor and payer) | Whether this is a change file or a full file (BGN08), the group or policy, the file's effective date |
| **Member level, loop 2000** | INS, REF, DTP | Subscriber or dependent (INS01), relationship (INS02), maintenance type (INS03) and reason (INS04), benefit and employment status, the subscriber identifier, eligibility dates |
| **Member name, loop 2100A** | NM1, PER, N3, N4, DMG | Name, contact, address, date of birth and gender |
| **Health coverage, loop 2300** | HD, DTP | Insurance line (HD03, such as `HLT` or `DEN`), coverage level (HD05, where a carrier uses it), benefit begin (348) and end (349) dates |
| **Member reporting categories, loop 2750** | N1, REF, DTP | Carrier-defined extras; the CMS guide puts an additional maintenance reason here |

The codes the sender lives by, as companion guides define them:

| Element | Code | Meaning |
| --- | --- | --- |
| BGN08 | `2` | "Change (Update)": only the members that changed |
| BGN08 | `4` | "Verify": a full file audit of "all current members, whether involved in a change or not" |
| INS01 / INS02 | `Y` / `18` | The subscriber: "When INS01 = Y, the value 18 must be used" |
| INS02 | `01`, `19` | Spouse, child (guides add adopted child, foster child, stepchild, ward, life partner) |
| INS03 | `021` | Addition |
| INS03 | `001` | Change to an existing subscriber or dependent |
| INS03 | `024` | "Cancellation or Termination" |
| INS03 | `025` | Reinstatement |
| INS03 | `030` | Audit or compare, used in full files |
| INS04 | `28`, `32`, `02`, `05` | Initial enrollment, marriage, birth, adoption (reasons for an add) |
| INS04 | `07`, `01`, `03`, `14`, `59`, `AI` | Termination of benefits, divorce, death, voluntary withdrawal, nonpayment, no reason given |
| DTP01 | `348`, `349` | Benefit begin and benefit end, in loop 2300 |
| DTP01 | `356`, `357` | Eligibility begin and end, at the member level |
| DTP01 | `303` | Maintenance effective date |

A change file adding a newborn to a medical plan, abbreviated and with invented identifiers (the carrier's companion guide decides which segments and values are required):

```text
ST*834*0001*005010X220A1~
BGN*00*EMP20270410*20270410*0930****2~
N1*P5*EXAMPLE EMPLOYER INC*FI*120000000~
N1*IN*EXAMPLE CARRIER*FI*990000000~
INS*N*19*021*02*A~
REF*0F*000000001~
DTP*356*D8*20270317~
NM1*IL*1*DOE*BABY~
DMG*D8*20270317*F~
HD*021**HLT**FAM~
DTP*348*D8*20270317~
SE*12*0001~
```

The dependent (`INS*N*19`) is an addition (`021`) for a birth (`02`), keyed to the subscriber's identifier in `REF*0F`, with eligibility and benefit begin on the birth date; a carrier that bills by tier also needs the subscriber's own coverage line changed to family, sent as a change (`001`) on the subscriber in the same file. That second record is what senders forget: the dependent add and the subscriber's tier change are one life event and two member records.

## Change Files and Full Files

The 834 implementation guide states the trade plainly: "The most efficient and preferred method for regular maintenance of enrollment files is to use 'Change (Update)' transactions. Periodic audit files can be used to verify synchronization," and "'Verify' should not be used for regular, daily, processing. It is recommended that this be used no more frequently than monthly." Public guides show the cadences in use: the Wisconsin state employee program sends a daily eligibility file and receives a monthly "Full File Compare" back from health plans; DC Health Link's small business exchange sends changes as they occur and an audit full file "Weekly/Monthly"; New York's Medicaid system sends "a file whenever there is activity on an enrollee" and lets plans request a full verification file "2 times per year"; the CMS exchange sends twice daily.

What the sender has to design for:

- **A change file is a diff, so it needs a base.** The sender keeps, per carrier connection, the last state it sent for every member and computes the change against that, not against yesterday's database. A member whose change failed at the carrier is still different, and the next file must carry it again or the full file will.
- **Some carriers want the whole member on every change.** New York's guide says "Change transactions will have all the information for the member in each change transaction"; others want only changed elements. That's a per-connection setting.
- **A new coverage doesn't end the old one.** "An add to a new coverage must never be assumed to result in the automatic termination of the prior coverage," so a plan change is a termination of the old line and an addition of the new, explicitly.
- **Termination dates follow rules.** DC's guide: "When coverage is terminated, the benefit end-dates must always be either the end of a month or back to the first day of coverage," with voluntary terminations prospective and involuntary ones "retrospective (non-payment, death, or fraud), or prospective." Many carriers limit how far back a termination can be dated; I couldn't find a published day limit in the guides I opened, so the limit belongs in the connection's configuration, read from the carrier's own guide. <!-- source-gap: wf-834-retro-term-limit | missing | carriers' limits on how far back an 834 termination can be dated (for example 30 or 60 days) | closes with: a carrier or exchange companion guide stating a retroactive termination limit, opened | checked: 2026-11-10 -->
- **Coverage levels vary.** "Some Payers identify a coverage level (HD05) for the subscriber which defines the coverage for eligible dependents as well. Other Payers need detailed information on each dependent"; Wisconsin's guide uses `IND` or `FAM`, the CMS guide doesn't send HD05 at all.
- **The full file is a reconciliation, not a replacement.** A carrier that loads a full file as the truth will terminate anyone missing from it; a sender that drops a group from the extract by mistake terminates a company. Full files get the same review as a payroll: counts by plan and tier compared with the last file, and a hold if the change is too large.

## Acknowledgments

Three layers answer a file, and only the last one says the enrollment worked:

| Layer | What it says | From the guides |
| --- | --- | --- |
| **TA1** (interchange acknowledgment) | The envelope was readable | "TA1 and 999 acknowledgements verify whether interchange and functional group information were successfully received" |
| **999** (implementation acknowledgment) | Each transaction set passed syntax and the implementation guide's rules; AK9 codes "A – Accepted," "E – Accepted, But Errors Were Noted," "P – Partially Accepted, At Least One Transaction Set Was Rejected," "R – Rejected" | "The transaction level is rejected with a 999 or a TA1 and will be sent to the submitter" |
| **Business acknowledgment** | Each member change was applied, or why not (not eligible, duplicate, date outside rules) | Carrier-specific: the CMS exchange returns XML business acknowledgments for failures ("Accepted BAAs will not be sent"); Oscar's guide adds a weekly reconciliation file |

The design consequence: a member change has its own state that outlives the file. It is `sent` when the file goes, `syntax_accepted` on a 999 accept, `applied` only when the carrier's business response or the next full file comparison shows it, and `rejected` with the carrier's reason otherwise. A 999 accept on a file with a wrong date of birth is still a member the carrier can't match to claims.

## Setting Up and Testing a Connection

A file connection is a small project per carrier, and often per group at that carrier. The stages, as connection platforms and companion guides describe them:

1. **Requirements.** The carrier's companion guide, its group and plan identifiers, which coverage lines it takes, its cadence and full file rules, transmission (SFTP, a clearinghouse, the carrier's portal) and encryption.
2. **Mapping.** Employer plans to carrier plan codes, tiers to coverage levels, employee classes to the carrier's billing divisions, and identifiers (the carrier's member ID once it exists, the SSN or an employer ID before).
3. **Authorization.** The carrier confirms the group may be connected; Noyo describes querying "the carrier's system directly for authorization" for its most integrated carriers.
4. **Test files.** Files from real enrollment data go to the carrier's test environment; the carrier reports errors; the mapping is corrected; repeat. Noyo says testing can take up to six weeks, and "The connection is only marked completed after the carrier has officially approved the file."
5. **Initial load and comparison.** The first production file is usually a full file compared against what the carrier already has, with differences worked by hand before change files start.
6. **Production and monitoring.** Scheduled change files, periodic full files, acknowledgment tracking, and an alert when a scheduled file didn't go or an acknowledgment didn't come back.

During testing, changes still happen. The platform has to queue them and either send them in the first production change file or tell the employer to report them to the carrier manually; open enrollment changes made during a blackout before a connection is live are where coverage gaps come from.

## API Carriers and Connection Networks

An API connection turns the 834's daily cycle into a request and a response. Noyo's model shows the shape: a group with its carrier connections and plan mapping, members with point-in-time **snapshots** of the family's coverage, and member requests for events such as a new hire enrollment or a termination; a member change moves through `processing` to `completed`, can be `canceled`, or is `replaced` when "We received a newer snapshot for this family." For carriers without an API, the same platform generates EDI **feeds** and records each **feed run** as "a single, specific instance that the feed has generated and transmitted a file to the carrier."

What changes for the employer side, and what doesn't:

- **Errors come back while the person is still there.** A rejected change can be shown to the employee or administrator in the enrollment flow instead of in a weekly error report.
- **Snapshots replace diffs.** Sending the whole family's current coverage, rather than a list of changes, removes the "what did I send last time" problem; the carrier or network computes the difference.
- **The source of truth still has to be one place.** Whether files or APIs, the employer's enrollment record is what payroll deducts from; the carrier connection is a copy that must be reconciled.

## Reconciling Carrier Invoices

Carriers bill employers on a list bill or a self-bill: one invoice per period, computed from the carrier's census as of the bill date, with a line per covered employee or a total by tier ([Insurance's carrier-side billing](/books/insurance/group-life-and-disability#carrier-side-enrollment-and-billing) covers its mechanics). The employer has three numbers that should agree for each employee, plan and month: the premium the enrollment record says is owed, the employee share payroll deducted plus the employer share it recorded as a memo line, and the carrier's billed amount.

A worked example of my own, for one medical plan's March invoice:

| Employee | Enrollment record | Payroll (employee + employer) | Carrier bill | Difference | Cause |
| --- | --- | --- | --- | --- | --- |
| A | Family, $1,900.00 | $1,900.00 | $1,900.00 | $0.00 | |
| B | Terminated February 28 | $0.00 | $700.00 | Carrier +$700.00 | The termination wasn't applied; the change was 999-accepted and business-rejected for a date rule |
| C | Family from March 17 (birth) | $1,900.00 after the catch-up | $1,140.00 (employee plus spouse) | Carrier -$760.00 | The subscriber tier change wasn't sent with the dependent add |
| D | Employee only, $700.00 | $560.00 | $700.00 | Payroll -$140.00 | A short check put the employee share in arrears |

Each difference has a different fix: B is a retroactive termination request and a credit on a later bill (subject to the carrier's retro limits); C is a corrected change file and a higher next bill; D is an arrears balance in payroll, not a carrier problem. A reconciliation that only compares totals sees $1,900.00 + $700.00 + $1,140.00 + $700.00 = $4,440.00 billed against $4,500.00 expected and $4,360.00 collected: a bill $60.00 under the enrollment record, which looks like a rounding question and hides an overcharge of $700.00, an undercharge of $760.00 and a $140.00 payroll shortfall. So the match is per employee, plan and coverage month, and its output is a work queue, not a number.

The common practices this supports: employers paying the bill as issued and taking credits later, paying their own computed amount (self-billing, where the carrier allows), or holding disputed lines. Whichever the policy, the employer's liability to the carrier is the enrollment record's amount, recorded per pay run as liabilities and remitted against the invoice ([One liability table for everyone a run owes](/books/workforce/workforce-business#extended-by)).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `benefit_plans` and `benefit_enrollments` exist; this chapter adds the connection, the files and their members, acknowledgments and invoice reconciliation.

```sql
CREATE TABLE carrier_connections (         -- one employer's link to one carrier, by method
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  carrier             TEXT NOT NULL,
  carrier_group_ref   TEXT NOT NULL,         -- the carrier's group or policy number
  method              TEXT NOT NULL CHECK (method IN ('edi_834', 'api', 'portal', 'spreadsheet')),
  companion_guide_version TEXT,             -- the guide the mapping was built against
  change_cadence      TEXT NOT NULL,         -- 'daily', 'weekly', 'on_change'
  full_file_cadence   TEXT,                  -- 'weekly', 'monthly', null for none
  full_member_on_change BOOLEAN NOT NULL DEFAULT FALSE,
  retro_term_limit_days SMALLINT,            -- from the carrier's guide; null if none stated
  transmission_ref    TEXT,                  -- the SFTP endpoint or API account, as a secret reference
  plan_mapping        JSONB NOT NULL,        -- benefit_plan_id and tier -> carrier plan and level
  status              TEXT NOT NULL CHECK (status IN ('requirements', 'mapping', 'authorizing',
                        'testing', 'initial_load', 'live', 'paused', 'terminated')),
  live_on             DATE,
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE edi_834_files (               -- one transmission, change or full
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_connection_id UUID NOT NULL REFERENCES carrier_connections (id),
  kind                TEXT NOT NULL CHECK (kind IN ('change', 'full', 'test')),
  bgn08               CHAR(2) NOT NULL,      -- '2' change, '4' verify
  interchange_control TEXT NOT NULL,         -- ISA13, unique per sender and receiver
  as_of               TIMESTAMPTZ NOT NULL,  -- the enrollment state the file was built from
  member_count        INT NOT NULL,
  storage_ref         TEXT NOT NULL,
  sha256              CHAR(64) NOT NULL,
  held_reason         TEXT,                  -- a full file whose counts moved too far
  sent_at             TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('built', 'held', 'sent', 'acknowledged',
                        'rejected')),
  UNIQUE (carrier_connection_id, interchange_control)
);

CREATE TABLE edi_834_members (             -- one member record in a file, and its life after
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  edi_834_file_id     UUID NOT NULL REFERENCES edi_834_files (id),
  benefit_enrollment_id UUID REFERENCES benefit_enrollments (id),
  person_id           UUID NOT NULL REFERENCES persons (id),
  ins03               CHAR(3) NOT NULL,      -- '021', '001', '024', '025', '030'
  ins04               VARCHAR(3) NOT NULL,   -- reason code
  coverage_begin      DATE,                  -- DTP 348
  coverage_end        DATE,                  -- DTP 349
  sent_state          JSONB NOT NULL,        -- what this record said, the base for the next diff
  status              TEXT NOT NULL CHECK (status IN ('sent', 'syntax_accepted', 'applied',
                        'rejected', 'superseded')),
  carrier_reason      TEXT,                  -- from the business acknowledgment
  resolved_at         TIMESTAMPTZ
);

CREATE TABLE edi_acknowledgments (         -- TA1, 999 and business responses
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  edi_834_file_id     UUID NOT NULL REFERENCES edi_834_files (id),
  kind                TEXT NOT NULL CHECK (kind IN ('ta1', '999', 'business', 'reconciliation')),
  result              TEXT NOT NULL,         -- 999 AK9: 'A', 'E', 'P', 'R'; or the carrier's
  received_at         TIMESTAMPTZ NOT NULL,
  detail              JSONB NOT NULL,        -- rejected sets and segments, member errors
  storage_ref         TEXT NOT NULL
);

CREATE TABLE carrier_invoice_reconciliations (  -- per employee, plan and coverage month
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_connection_id UUID NOT NULL REFERENCES carrier_connections (id),
  invoice_ref         TEXT NOT NULL,
  coverage_month      DATE NOT NULL,         -- the first of the month billed
  worker_id           UUID REFERENCES workers (id),   -- null for a carrier line we can't match
  benefit_plan_id     UUID NOT NULL REFERENCES benefit_plans (id),
  expected_amount     BIGINT NOT NULL,       -- cents, from benefit_enrollments and benefit_rates
  collected_amount    BIGINT NOT NULL,       -- employee deductions plus employer memo lines
  billed_amount       BIGINT NOT NULL,
  cause               TEXT CHECK (cause IN ('carrier_not_applied', 'not_sent', 'tier_mismatch',
                        'payroll_arrears', 'retro_change', 'rate_mismatch', 'unknown_member')),
  resolution          TEXT CHECK (resolution IN ('credit_requested', 'resend', 'payroll_correction',
                        'accepted', 'written_off')),
  status              TEXT NOT NULL CHECK (status IN ('matched', 'open', 'resolved')),
  UNIQUE (invoice_ref, coverage_month, worker_id, benefit_plan_id)
);
```

The diff a change file is built from compares the enrollment as of now with the last state sent and applied for each member on the connection:

```sql
SELECT be.id AS benefit_enrollment_id, be.worker_id, be.coverage_tier, be.valid_during,
       last.sent_state
FROM benefit_enrollments be
JOIN carrier_connections cc
  ON cc.id = $connection_id
 AND cc.plan_mapping ? be.benefit_plan_id::TEXT
LEFT JOIN LATERAL (
  SELECT m.sent_state
  FROM edi_834_members m
  WHERE m.benefit_enrollment_id = be.id
    AND m.status IN ('sent', 'syntax_accepted', 'applied')
  ORDER BY m.id DESC
  LIMIT 1
) last ON TRUE
WHERE last.sent_state IS DISTINCT FROM
      jsonb_build_object('tier', be.coverage_tier, 'during', be.valid_during::TEXT,
                         'dependents', be.dependent_ids);
```

Design notes:

- **The unit is the member change, not the file.** Files are envelopes; each `edi_834_members` row has its own state from sent to applied or rejected, and a rejected change reappears in the next file or a work queue until resolved ([Payment States](/docs/money/payment-states#reconciliation) is the same pattern for money).
- **Build files from an as-of snapshot,** stored on the file, so a disputed termination can be shown as "this is what we sent, on this date, from this state" ([As-Of Queries](/docs/database/temporal-data#as-of-queries)).
- **Hold suspicious full files.** A full file whose member count drops more than a threshold against the last one is held for review before transmission, because a carrier that terminates missing members turns an extract bug into lost coverage.
- **Treat a connection like a deployment,** with stages, a test log and a go-live date, and queue changes made before go-live for the first production file.
- **Reconcile per employee, plan and month,** with a cause and a resolution on every difference; never net the totals.
- **Map, don't duplicate, the neighbors' records.** A carrier's `member_enrollments` row with `source = 'x12_834'` in Health Tech's payer model is the receiving end of an `edi_834_members` row ([How to Build It](/books/health-tech/payer-operations#how-to-build-it)); Insurance's `group_census` is the carrier-side copy of the same enrollment for life and disability.

## Auditing

Carrier connections are audited when coverage is disputed (a claim denied for someone the employer says it enrolled), by plan auditors and by the employer's own finance team over premium spend:

- **Every file as sent,** with its hash, its as-of time, its control numbers and every acknowledgment received, kept for the plan's records retention.
- **Every member change's history,** from the enrollment event to the carrier's business response, so the gap between "enrolled" and "covered" can be dated.
- **Connection history:** mappings, guide versions, test results and go-live approvals.
- **Every invoice line's reconciliation,** with its cause and resolution, and credits requested and received.
- **Held files and manual sends,** with who released them. Mechanics in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Make the member change the unit,** with its own state from sent to applied, and treat a 999 accept as syntax only.
- **Keep the last state sent per member and connection** as the base for change files.
- **Send a tier change with every dependent add,** and an explicit termination with every plan change.
- **Use full files to verify, not to replace,** and hold one whose counts moved too far.
- **Run each connection through stages** with a test log, and queue changes made before go-live.
- **Support files and APIs on one internal model,** because the market will have both for years.
- **Reconcile invoices per employee, plan and coverage month** against the enrollment record and payroll, and work each difference by cause.

## References

**Law and regulation**

- [45 CFR 162.1501](https://www.law.cornell.edu/cfr/text/45/162.1501), the enrollment and disenrollment in a health plan transaction
- [45 CFR 162.1502](https://www.law.cornell.edu/cfr/text/45/162.1502), the adopted 834 standard, ASC X12N/005010X220, on and after January 1, 2012
- [45 CFR 162.925](https://www.law.cornell.edu/cfr/text/45/162.925), a health plan must conduct a standard transaction and may not delay or reject it for being standard

**Standards and specifications**

- [ASC X12N 834 Implementation Guide, draft addenda 004010X095A1 (WPC, October 2001; hosted by the University of Texas System, PDF)](https://utsystem.edu/sites/default/files/offices/employee-benefits/docs/X095A1.pdf), change (update) and verify files, full replacement files not recommended, audits no more often than monthly, coverage levels and transfers
- [CMS X12 834 Companion Guide, version 7.2 (August 30, 2024; hosted by Oscar, PDF)](https://hioscar-enrollment-platform-assets.s3.us-east-1.amazonaws.com/CMS_X12_834_Companion_Guide_v7.2.pdf), 005010X220A1, TA1 and 999 per interchange and functional group, business acknowledgments, loops 2000, 2100A, 2300 and 2750, HD03, DTP 303, 348, 349, 356 and 357, INS01 and INS02, maintenance type and reason codes, twice-daily cadence
- [Oscar CHOICE Connect: EDI implementation guide](https://choice-connect.readme.io/docs/edi-implementation-guide), bidirectional daily 834s, acknowledgments and a weekly reconciliation file
- [Wisconsin ETF: Health Insurance ANSI 834 version 5010 Companion Guide, version 1.4 (PDF)](https://etf.wi.gov/sites/default/files/2024-04/Appendix%201%20-%20834%20Companion%20Guide.pdf), BGN08 values, INS03 values, HD05 IND or FAM, benefit status and employment status values, daily eligibility file and monthly Full File Compare
- [DC Health Link: Benefit Enrollment (834) Companion Guide, version 1.0.1 (PDF)](https://hbx.dc.gov/sites/default/files/dc/sites/Health%20Benefit%20Exchange%20Authority/publication/attachments/DCExchangeBenefitEnrollmentCompanionGuide_v101_0.pdf), TA1 and 999 versions, rejection by 999 or TA1, weekly or monthly audit files for small groups, end-of-month termination dates and retrospective terminations
- [GetInsured: 834 Companion Guide, release 25.09.00 (PDF)](https://carriers.bewellnm.com/wp-content/uploads/2026/02/GetInsured-834-Companion-Guide-v25.09.00.pdf), 999 AK9 codes, BGN08, INS03 meanings, INS02 relationship codes and INS04 reason codes
- [New York eMedNY: 834 FAQs](https://www.emedny.org/HIPAA/5010/834FAQs/), maintenance type 030, full verification files twice a year, files on activity, retroactive terms and full member data on changes

**Filings**

- [Voya Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1535929/000153592926000043/voya-20251231.htm), Benefitfocus's open-architecture platform and about 12.2 million employees at December 31, 2025

**Vendor documentation**

- [Noyo](https://noyo.com/), the API pitch and EDI's limits
- [Noyo: Feeds and feed runs](https://docs.noyo.com/docs/members/snapshot-workflow/feeds-feed-runs.md), EDI feeds for carriers that require files
- [Noyo: The member change workflow](https://docs.noyo.com/docs/members/snapshot-workflow/the-member-change-workflow.md), change statuses and seconds for sync carriers
- [Noyo: Request a group connection](https://docs.noyo.com/docs/groups/connections/request-a-group-connection.md), connection tiers, carrier authorization, carrier approval of the file and testing time
- [Employee Navigator](https://www.employeenavigator.com/), employers, brokers and partners connected
- [Paycom: Benefits administration](https://www.paycom.com/software/benefits-administration/), Benefits to Carrier
- [ADP: Benefits](https://www.adp.com/what-we-offer/benefits.aspx), carrier integrations
