+++
title = "Books, Records & the Audit Trail"
nav_title = "Books, Records & CAT"
description = "Rules 17a-3 and 17a-4, WORM or audit-trail storage, the Consolidated Audit Trail and its funding fight, Reg S-P incident notice, and crypto records."
category = "Investing & Digital Assets Industry"
order = 2527
part = "Clearing and Settlement"
tags = ["investing", "recordkeeping", "17a-4", "cat", "audit-trail", "reg-s-p", "crypto", "compliance"]
+++

A broker-dealer's records are a regulated product. The SEC says which records it must make (Rule 17a-3), how long and in what form it must keep them (Rule 17a-4), and every order event in a US-listed stock or option also goes to a single regulatory database, the Consolidated Audit Trail, by eight the next morning. These aren't archives in the usual sense. Examiners pull them, enforcement cases are built from them, and the penalties for records not kept have reached nine figures per firm in the off-channel sweep.

For an engineer, three things follow. The system of record must be able to produce every required record as of any past date, in a human-readable form, promptly. The storage must either never allow a record to be rewritten or keep a complete, time-stamped trail of every change. And the order and execution data the firm already has must be reformatted, clock-synchronized and submitted to CAT on a deadline, with errors corrected on a second one. Privacy runs the other way: Regulation S-P now requires an incident response program and customer notice within 30 days of learning of a breach of sensitive customer information, and CAT itself stopped taking customers' names, addresses and years of birth in 2026.

This chapter covers the records rules, the two storage options, the CAT (what it collects, the deadlines, the clocks, the funding fight and the removal of personal data), Regulation S-P's incident rules and crypto recordkeeping. Capture and supervision of chat, email and meetings, and the off-channel fines, are owned by the Workplace & Collaboration volume's [Regulated Communications](/books/workplace-and-collaboration/regulated-communications#the-off-channel-sweep); this chapter states the broker-dealer rule and links there.

## How the Platforms Do It

How the record and reporting obligations show up across firms and vendors, as of November 2026:

| Party | What it does with records | Public detail |
| --- | --- | --- |
| **Alpaca** (Broker API) | Keeps the brokerage records for fully disclosed partners' customers; in its omnibus setup "end customer information (e.g. name, address) is not disclosed to Alpaca" | The omnibus partner carries the end-customer books, so it carries the records duty for them |
| **CAT LLC** | Runs the Consolidated Audit Trail for the exchanges and FINRA (the Participants) | Reports due by 8:00 a.m. ET the next trading day; corrections by 8:00 a.m. on T+3; files accepted 24/7 |
| **DriveWealth** | In its omnibus model, "DriveWealth has no knowledge of your individual customers"; the client keeps its own books and records | Individual, bulk and cashless models keep customer-level records at DriveWealth |
| **Slack, Microsoft and archivers** | Communications capture for 17a-4 | Covered in [Capture: What an Archive Needs From the Tool](/books/workplace-and-collaboration/regulated-communications#capture-what-an-archive-needs-from-the-tool) |

The table's lesson is that **the records duty follows the books.** Whoever holds the customer-level ledger is the one that must make and keep the customer-level records and report each customer's orders to CAT, and [Brokerage as a Service](/books/investing-and-digital-assets/brokerage-as-a-service) covers how the carrying agreement allocates that.

## What Must Be Made: Rule 17a-3

Rule 17a-3 lists the records. The ones a trading system produces directly:

- **Blotters,** "an itemized daily record of all purchases and sales of securities" ((a)(1)).
- **Ledgers:** the general ledger and a ledger for each customer account, and the securities record or stock record ((a)(2), (a)(3), (a)(5)); [The Stock Record](/books/investing-and-digital-assets/ledgers-and-positions#the-stock-record) covers it.
- **Order memoranda.** For each brokerage order, "whether executed or unexecuted," the terms and conditions, the account, "the time the order was received, the time of entry, the price at which executed," and the associated person responsible ((a)(6)); a parallel memorandum for each purchase or sale for the firm's own account ((a)(7)).
- **Confirmations** ((a)(8)); [Rule 10b-10 Confirmations](/books/investing-and-digital-assets/statements-and-tax-forms#rule-10b-10-confirmations) covers their content.
- **Account records** for natural persons, with name, tax ID, address, occupation, financial profile and objectives, sent to the customer within 30 days of opening and then "at intervals no greater than thirty-six months" where the firm makes suitability determinations ((a)(17)); [The Investment Profile](/books/investing-and-digital-assets/opening-accounts#the-investment-profile) covers what's collected.

The useful reading is that **every order is a record, including the ones that never fill,** and the times on it (received, entered, routed, executed, canceled) are part of the record, not metadata. An order system that overwrites its order row on each state change and keeps only the latest status can't produce the memorandum the rule requires; one that writes an append-only `order_events` row per change, as the core model does, produces it as a query.

## How Long and How: Rule 17a-4

**Retention.** Rule 17a-4(a) requires the core books (blotters, ledgers, the stock record) for "not less than 6 years, the first two years in an easily accessible place"; (b) covers order memoranda, confirmations, communications relating to the business and many other records for "not less than three years," the first two easily accessible. Account records under 17a-3(a)(17) are kept "until at least six years after the earlier of the date the account was closed" or the date the information was replaced or updated ((e)(5)).

**Form.** Paragraph (f)(2) gives two choices for electronic records:

- **The audit-trail alternative:** "Preserve a record for the duration of its applicable retention period in a manner that maintains a complete time-stamped audit trail" that includes every modification and deletion, the date and time of each, where applicable the identity of who made it, and that "will permit re-creation of the original record."
- **Non-rewriteable, non-erasable (WORM):** "Preserve the records exclusively in a non-rewriteable, non-erasable format."

Either way the system must verify the completeness and accuracy of what it stores, keep a backup, and produce records promptly in a human-readable and reasonably usable electronic format. Under (f)(3)(v) the firm files an undertaking with its examining authority, signed either by a **designated executive officer** (a senior manager with access to and the ability to provide the records) or by a **designated third party** not affiliated with the firm, to furnish the records if the firm can't.

The audit-trail option arrived with amendments published at 87 FR 66412 on November 3, 2022 (Release 34-96034), effective January 3, 2023, with compliance for Rule 17a-4 due May 3, 2023. Before them, the only electronic option was WORM, which in practice meant a separate archive product. After them, a firm's own database can be the compliant store if it keeps every version with who and when, which is the playbook's [Amend, Don't Overwrite](/docs/building-blocks/audit-trails#amend-don-t-overwrite) and [Make It Tamper-Evident](/docs/building-blocks/audit-trails#make-it-tamper-evident) turned into a regulatory requirement. Workplace & Collaboration's [How the Records Must Be Kept](/books/workplace-and-collaboration/regulated-communications#how-the-records-must-be-kept) works through the two options for communications archives.

**Communications.** Rule 17a-4(b)(4) requires originals of all communications received and copies of all communications sent relating to the business as such, for three years. The content decides, not the channel: a business text on a personal phone is a record the firm failed to keep. The SEC's enforcement sweep against firms whose staff used personal messaging apps, and how archives capture chat and meetings, are in [The Off-Channel Sweep](/books/workplace-and-collaboration/regulated-communications#the-off-channel-sweep).

## The Consolidated Audit Trail

After the May 6, 2010 Flash Crash took regulators months to reconstruct, the SEC adopted Rule 613 in 2012, requiring the exchanges and FINRA to build a consolidated audit trail ([Crises & the Rules They Wrote](/books/investing-and-digital-assets/crises-and-the-rules#2010-the-flash-crash)). The CAT NMS Plan's Participants run it through CAT LLC, and broker-dealers (Industry Members) report to it.

**What is reported.** Rule 613(c)(7) lists the events: an order's origination or receipt, its routing, modification or cancellation, and execution, for every order in an NMS stock or listed option, plus customer and account reference data. Each event carries the firm's identifiers, the order's terms and a timestamp, and the events of one order link across firms through routing identifiers, so a regulator can follow a customer's order from the app through the broker, a wholesaler and an exchange.

**Deadlines.** Reports are due "by 8:00 a.m., ET the following Trading Day"; a report after that is late. CAT returns feedback on errors, and "all error corrections must be made by 8 am on T+3"; corrections after that are late too. With 23-hour exchange trading planned to start December 6, 2026, CAT Alert 2026-02 (September 23, 2026) revised the Industry Member definition of Trade Date and said there would be "no changes to existing CAT reporting deadlines for submissions and corrections."

**Clocks and timestamps.** Industry Member clocks must be synchronized "at a minimum to within 50 milliseconds" of NIST time; clocks used only for manual order events or allocation times may be within one second. Timestamps must be at least to the millisecond, and a firm whose systems capture finer increments must report them, up to nanoseconds, truncated rather than rounded.

**Worked numbers: one order's CAT obligations.** A customer's limit order to buy 100 XYZ arrives in the app at 10:15:02.123456 ET on Tuesday, November 3, 2026; the broker routes it to a wholesaler at 10:15:02.125 and it fills at 10:15:02.131.

| Event | Reported by | Timestamp precision | Due |
| --- | --- | --- | --- |
| New order (customer, account, terms, receipt time) | Broker | Microseconds, because its system captured them | 8:00 a.m. ET Wednesday, November 4 |
| Route to the wholesaler (destination, routed order ID) | Broker | Microseconds | Same |
| Order accepted | Wholesaler | Its own precision | Same |
| Fill | Wholesaler (and the trade report) | Its own precision | Same |
| Correction of a rejected route record | Broker | | 8:00 a.m. ET Friday, November 6 (T+3) |

If the broker's clock was 60 milliseconds fast that morning, its route time would appear after the wholesaler's acceptance, the linkage would look broken, and the firm would be outside the 50-millisecond tolerance. Clock drift monitoring, with the offset logged and alarmed against the tolerance, is part of CAT compliance, not a nice-to-have.

**Funding, vacated and replaced.** The SEC's 2023 order approving the Participants' funding model (88 FR 62628), which let the exchanges and FINRA pass CAT costs to broker-dealers, was vacated by the Eleventh Circuit on July 25, 2025 in *American Securities Association v. SEC*, No. 23-13396. The court held the order arbitrary and capricious: it allowed the Participants to pass through all CAT costs without explaining the change from earlier cost-sharing, ignoring the incentive problem that created, and it relied on a 2016 economic analysis that projected $36.5 million to $55 million a year to run the CAT when by the end of 2022 $518 million had been spent to build it and by 2023 operating costs had reached nearly $200 million a year. The court didn't decide whether CAT itself is lawful, and stayed its judgment for 60 days after the mandate; CAT fees continued to be billed during the stay. On March 16, 2026 the SEC approved a revised model (Release 34-105003, 91 FR 13410), still splitting each executed share's cost a third each among the Participant and the buying and selling broker-dealers, but barring Participants from filing fees that pass their own CAT fee through directly, and ending CAT fees to Industry Members after March 31, 2028; the order called it an interim two-year model. That approval is itself under challenge in the Eleventh Circuit (No. 26-10936), as of a September 2026 exchange fee filing that cites the case.

**Worked numbers: a CAT fee.** CAT Fee 2026-1, for May 1 to December 31, 2026, set budgeted CAT costs of $15,149,648 and a Fee Rate of $0.000003799483243631228 per executed equivalent share, of which the buying broker and the selling broker each pay a third; the exchanges' fee filings divide that rate by three and round it, so each side is billed $0.000001 per executed equivalent share. A broker whose customers execute 2 billion shares in a month as buyers pays 2,000,000,000 × $0.000001 = **$2,000** for that side (unrounded, a third of the Fee Rate would have been about $2,533). Executed equivalent shares count OTC equities at 0.01 per share and options per multiplier-adjusted contract, so the same formula needs the instrument type on every execution.

**Personal data removed.** CAT originally collected customers' names, addresses and years of birth through the Customer and Account Information System (CAIS). A February 10, 2025 SEC exemptive order (Release 34-102386) let Industry Members stop reporting names, addresses and years of birth for natural persons; on January 13, 2026 the SEC approved a Plan amendment (Release 34-104586, 91 FR 2164) under which the CAT system no longer has fields for those data points for any customer, removed EIN reporting, codified the process by which Social Security numbers never reach CAT (a transformed identifier is kept in an isolated database), and renamed CAIS the Reference Database. In the order's words, "regulators, using the CAT alone, will not be able to determine the identity of the individual behind a CCID or FDID." CAT Alert 2026-01 covers the reporting transition. For a firm, the change removed the most sensitive outbound feed it had; the customer identifiers it still sends must still map to the right account every day.

## Regulation S-P: Incidents and Notice

Regulation S-P's privacy notices are covered in [Privacy Notices Under Regulation S-P](/books/investing-and-digital-assets/opening-accounts#privacy-notices-under-regulation-s-p). Its 2024 amendments (Release 34-100155, adopted May 16, 2024, published at 89 FR 47688 on June 3, 2024 and effective August 2, 2024) added incident duties for broker-dealers, advisers, funds and transfer agents, codified in 17 CFR 248.30:

- **An incident response program,** written, reasonably designed to detect, respond to and recover from unauthorized access to or use of customer information.
- **Service provider oversight:** written policies requiring service providers to notify the firm "as soon as possible, but no later than 72 hours" after becoming aware of a breach affecting customer information they hold for it.
- **Customer notice** to affected individuals whose sensitive customer information was, or is reasonably likely to have been, accessed or used without authorization, "as soon as practicable, but not later than 30 days" after the firm becomes aware of the incident, unless the Attorney General requests a delay for national security or public safety (30 days, extendable).
- **Records** of the program, assessments and notices.

Larger entities (for broker-dealers, those that aren't small entities under the SEC's definition: total capital under $500,000 and no affiliation with a larger entity) had 18 months from publication to comply, which put their date at December 3, 2025; smaller entities had 24 months, to June 3, 2026. Both dates have passed. The incident program sits on the playbook's [Incident Response](/docs/operations/incident-response), with the customer-notice clock added as a case.

## Crypto Records

Crypto platforms keep records under different rules, all of which ask for the same core:

- **New York.** A BitLicensee keeps its books and records "for a period of at least seven years from the date of their creation," including for each transaction the "amount, date, and precise time of the transaction," payment instructions, fees, and the names, account numbers and addresses of the parties, plus its general ledger, bank and customer statements, board minutes, AML records and complaints (23 NYCRR 200.12).
- **The Travel Rule.** FinCEN's recordkeeping and travel rules (31 CFR 1010.410(e) and (f)) require a nonbank financial institution sending a transmittal of $3,000 or more to record the transmitter's name and address, the amount, the execution date, payment instructions and the recipient's details, and to pass the transmitter's information along to the next institution; [AML & the Travel Rule for Crypto](/books/investing-and-digital-assets/crypto-aml-and-travel-rule) covers how that applies to crypto transfers between platforms.
- **Chain data as a record.** The on-chain transaction is public, but the record of which customer it was for, what the firm knew when it credited or sent it, and at what finality is the firm's; the core model's `onchain_transactions` and `transfers` rows are that record ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)).

A platform that also runs a broker-dealer keeps both sets, and the stricter retention wins where they overlap: seven years under the BitLicense against six under 17a-4(a).

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `orders`, `order_events`, `executions`, `disclosures` and `cases`. This chapter adds the catalog of record classes and their rules, CAT submissions and feedback, and privacy incidents.

```sql
CREATE TABLE record_classes (                -- what the firm must keep, by rule, and how
  code                 TEXT PRIMARY KEY,         -- 'blotter', 'order_memo', 'confirm', 'account_record',
                                                 -- 'communication', 'bitlicense_txn', 'travel_rule', ...
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  rule_ref             TEXT NOT NULL,            -- '17a-3(a)(6)', '17a-4(b)', '23 NYCRR 200.12'
  source_tables        TEXT[] NOT NULL,          -- where the record is produced from
  retention            INTERVAL NOT NULL,        -- 6 years, 3 years, 7 years
  retention_trigger    TEXT NOT NULL CHECK (retention_trigger IN ('created', 'account_closed',
                         'superseded')),
  accessible_for       INTERVAL NOT NULL,        -- the "easily accessible" first two years
  storage_mode         TEXT NOT NULL CHECK (storage_mode IN ('audit_trail', 'worm')),
  export_format        TEXT NOT NULL,            -- the human-readable production format
  legal_hold_ref       TEXT                      -- a hold suspends deletion
);

CREATE TABLE cat_submissions (               -- one file or batch sent to CAT
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  trade_date           DATE NOT NULL,            -- CAT's trade date, which 23/5 trading redefined
  kind                 TEXT NOT NULL CHECK (kind IN ('order_events', 'reference_data',
                         'correction', 'deletion')),
  file_name            TEXT NOT NULL UNIQUE,
  record_count         INT NOT NULL,
  submitted_at         TIMESTAMPTZ NOT NULL,
  due_at               TIMESTAMPTZ NOT NULL,     -- 8:00 a.m. ET next trading day, or T+3 for corrections
  status               TEXT NOT NULL CHECK (status IN ('sent', 'accepted', 'rejected',
                         'accepted_with_errors')),
  late                 BOOLEAN GENERATED ALWAYS AS (submitted_at > due_at) STORED
);

CREATE TABLE cat_feedback (                  -- each error CAT returns, worked to a correction
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  cat_submission_id    UUID NOT NULL REFERENCES cat_submissions (id),
  order_id             UUID REFERENCES orders (id),
  order_event_seq      INT,                      -- with order_id, the event that was wrong
  error_code           TEXT NOT NULL,            -- CAT's code: linkage, format, reference data
  received_at          TIMESTAMPTZ NOT NULL,
  correct_by           TIMESTAMPTZ NOT NULL,     -- 8:00 a.m. ET on T+3
  correction_submission_id UUID REFERENCES cat_submissions (id),
  resolved_at          TIMESTAMPTZ
);

CREATE TABLE clock_sync_samples (            -- the evidence for the 50 ms tolerance
  host                 TEXT NOT NULL,
  sampled_at           TIMESTAMPTZ NOT NULL,
  offset_us            BIGINT NOT NULL,          -- against the NIST-traceable source
  tolerance_us         BIGINT NOT NULL,          -- 50,000 for order events, 1,000,000 manual
  PRIMARY KEY (host, sampled_at)
);

CREATE TABLE privacy_incidents (             -- Reg S-P 248.30 incidents and their clocks
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  case_id              UUID NOT NULL REFERENCES cases (id),
  detected_at          TIMESTAMPTZ NOT NULL,
  aware_at             TIMESTAMPTZ NOT NULL,     -- the 30-day customer clock starts here
  service_provider     TEXT,                     -- if a provider's breach
  provider_notified_at TIMESTAMPTZ,              -- within 72 hours of the provider's awareness
  sensitive_info_types TEXT[] NOT NULL,          -- 'ssn', 'account_number_with_access', ...
  affected_count       INT,
  notice_due_at        TIMESTAMPTZ NOT NULL,     -- aware_at + 30 days, unless a delay is granted
  ag_delay_until       TIMESTAMPTZ,
  notices_sent_at      TIMESTAMPTZ,
  determination        TEXT CHECK (determination IN ('notice_required',
                         'no_reasonable_likelihood_of_harm'))
);
```

`clock_sync_samples` is a small addition the CAT tolerance needs; the core's `cases` holds the incident's case file, and the playbook's [Producing Records](/docs/building-blocks/audit-trails#producing-records) covers the export side.

Design notes:

- **The order record is the event log.** Every 17a-3 order memorandum and every CAT event is derived from `order_events` and `executions`, with the received, entered, routed and executed times stored at the precision the system captured; the CAT file is a projection, never a second source.
- **Pick the 17a-4 mode per store and record it.** A database that keeps every version with actor and time (no hard deletes; corrections are new rows) is the audit-trail mode; an object store with retention locks is the WORM mode. Both need verification jobs, a backup and an export.
- **Retention is computed, deletion is a job.** A record's deletion date is its class's period from its trigger; a legal hold or a regulatory inquiry suspends it. Nothing deletes a record that its class says to keep.
- **Corrections to CAT come from corrections to the source.** A rejected record is fixed by fixing the order event or the reference data it came from and regenerating, so the next day's file doesn't repeat the error.
- **Privacy incidents are cases with a regulatory clock,** linked to the security incident record; the 30-day notice deadline is computed from the moment of awareness and tracked like any other case clock.

## Auditing

Records about the records:

- **The record class catalog** with each class's rule, retention, storage mode and owner, versioned, so the firm can show what it keeps and why.
- **Verification results** for every 17a-4 store (completeness and accuracy checks, backup runs) and every production of records to a regulator, with what was asked, what was sent and when.
- **Every CAT submission, feedback item and correction,** with lateness, and the clock synchronization samples for every host that timestamps order events.
- **Every privacy incident** with its detection, awareness, provider notice, determination, customer notices and any Attorney General delay.
- **For crypto, the seven-year New York set and Travel Rule records,** with the on-chain data each one referenced.

## What This Means for the System You Build

- **Make the order event log append-only** with every received, entered, routed, modified and executed time; the 17a-3 memorandum and the CAT report both come from it.
- **Choose WORM or the audit-trail alternative per store,** prove completeness with verification jobs, and be able to export any record in a readable form promptly.
- **Treat CAT as a production pipeline** with an 8:00 a.m. deadline, a T+3 correction loop and clock drift alarms at a tolerance well inside 50 milliseconds.
- **Keep the instrument type and side on every execution;** the CAT fee depends on them.
- **Keep the records duty with the books:** if a partner keeps the customer ledger, the partner keeps the customer records and reports.
- **Run privacy incidents as cases with a 30-day clock** and make service providers contractually notify within 72 hours.
- **Capture communications in approved channels** and link the archive to the books, through Workplace & Collaboration's [Regulated Communications](/books/workplace-and-collaboration/regulated-communications#capture-what-an-archive-needs-from-the-tool).

## References

**Law and regulation**

- [17 CFR 240.17a-3: Records to be made](https://www.law.cornell.edu/cfr/text/17/240.17a-3), blotters (a)(1), order memoranda with receipt, entry and execution times (a)(6) and (a)(7), account records and the 36-month update (a)(17)
- [17 CFR 240.17a-4: Records to be preserved](https://www.law.cornell.edu/cfr/text/17/240.17a-4), six and three years, the first two easily accessible, (f)(2) the audit-trail and non-rewriteable options, (f)(3)(v) the undertaking by a designated executive officer or third party
- [Federal Register: Electronic Recordkeeping Requirements for Broker-Dealers, 87 FR 66412 (November 3, 2022)](https://www.govinfo.gov/content/pkg/FR-2022-11-03/html/2022-22670.htm), Release 34-96034, effective January 3, 2023, compliance for 17a-4 on May 3, 2023
- [17 CFR 242.613: Consolidated audit trail](https://www.law.cornell.edu/cfr/text/17/242.613), the reportable events, synchronization to NIST time, millisecond granularity and the next-day 8:00 a.m. deadline
- [17 CFR 248.30: Procedures to safeguard customer information](https://www.law.cornell.edu/cfr/text/17/248.30), the incident response program, 72-hour service provider notice, 30-day customer notice and the Attorney General delay
- [Federal Register: Regulation S-P amendments, 89 FR 47688 (June 3, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-06-03/html/2024-11116.htm), Release 34-100155, effective August 2, 2024, larger and smaller entity definitions
- [23 NYCRR 200.12: Books and records](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-200.12), seven years, transaction details including precise time, ledgers, statements, AML records and complaints
- [31 CFR 1010.410: Records to be made and retained by financial institutions](https://www.law.cornell.edu/cfr/text/31/1010.410), the $3,000 transmittal records in (e) and the travel rule in (f)

**Regulators and guidance**

- [SEC: Press release 2024-58 (May 16, 2024)](https://www.sec.gov/newsroom/press-releases/2024-58), the Regulation S-P amendments and the 18 and 24 month compliance periods
- [CAT NMS Plan: Frequently asked questions](https://www.catnmsplan.com/faq), the 8:00 a.m. deadline, T+3 corrections, millisecond to nanosecond timestamps truncated, the 50 millisecond and one second clock tolerances
- [CAT NMS Plan: CAT Alerts](https://www.catnmsplan.com/cat-alerts), Alerts 2026-02 (23x5 trading), 2026-01 (Reference Database transition), 2025-03 (billing during the stay) and 2025-01 and 2025-02 (the CAIS exemption)
- [CAT Alert 2026-02 (September 23, 2026)](https://www.catnmsplan.com/cat-alerts/cat-alert-2026-02-23x5-trading-cat-reporting-requirements), the revised Trade Date definition and unchanged deadlines
- [CAT Alert 2025-03 (August 14, 2025)](https://www.catnmsplan.com/sites/default/files/2025-08/08.14.25-CAT-Alert_2025-03.pdf), fees continued during the stay of the Eleventh Circuit's judgment
- [Federal Register: CAT funding model order, 91 FR 13410 (March 19, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/03/19/2026-05350.txt), Release 34-105003 (March 16, 2026), the Executed Share Model as modified, one third each to the Participant and the two executing brokers, no direct pass-through, no Industry Member fees after March 31, 2028, the two-year interim period, executed equivalent shares (OTC equities at 0.01, options by contract multiplier)
- [Federal Register: NYSE CAT fee filing, 91 FR 25726 (May 11, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/05/11/2026-09260.txt), Release 34-105385, CAT Fee 2026-1 for May 1 to December 31, 2026, budgeted CAT costs of $15,149,648, the Fee Rate and the $0.000001 per-side rate after dividing by three and rounding
- [Federal Register: CAIS amendment, 91 FR 2164 (January 16, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/01/16/2026-00762.txt), Release 34-104586, removal of name, address and year of birth fields, EIN removal, the transformed identifier, the Reference Database, the February 2025 exemption (Release 34-102386)

**Courts and enforcement**

- [American Securities Association v. SEC, No. 23-13396 (11th Cir. July 25, 2025)](https://media.ca11.uscourts.gov/opinions/pub/files/202313396.pdf), vacatur of the 2023 funding order, the cost-sharing and economic analysis grounds, the $518 million and nearly $200 million a year figures, the 60-day stay
- [Federal Register: Texas Stock Exchange fee filing, 91 FR 61497 (September 29, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/09/29/2026-19872.txt), citing the pending challenge to the 2026 approval, No. 26-10936 (11th Cir.)

**Vendor documentation**

- [Alpaca: Broker API use cases](https://docs.alpaca.markets/us/docs/use-cases.md), end-customer information not disclosed to Alpaca in the omnibus setup
- [DriveWealth: Choosing your integration model](https://developer.drivewealth.com/apis/docs/choosing-your-integration-model.md), the omnibus model in which the client keeps its own books and records
