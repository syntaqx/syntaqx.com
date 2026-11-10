+++
title = "ACORD & Data Standards"
description = "ACORD forms, AL3, P&C XML and TXLife, newer standards, IAIABC claims EDI with its codes and clocks worked, statistical plans, and data models in practice."
category = "Insurance Industry"
order = 2773
part = "Running the Platform"
tags = ["insurance", "acord", "data-standards", "edi", "iaiabc", "integration"]
+++

Insurance runs on data exchanged between companies that don't share systems: agencies and carriers, carriers and MGAs, carriers and reinsurers, life carriers and broker-dealers, insurers and state agencies, insurers and statistical agents. Most of that exchange follows a published standard, and most of the standards are old enough that several generations of them are in use at once. ACORD publishes the forms agents fill in, the batch format agency downloads were built on, the XML messages for property and casualty and for life, and newer API-oriented standards. The IAIABC publishes the claims EDI standard that workers' compensation insurers report to states with. Statistical agents publish the plans every P&C insurer reports premium and losses under. A core system speaks all of them at its edges.

This chapter covers what each standard is and how its messages map to the core data model: ACORD forms, AL3, P&C XML, TXLife and the newer standards; IAIABC claims EDI with its transaction codes and deadlines worked; statistical plans at pointer level; and how to run a canonical model inside with standards at the boundary. The exchanges themselves are owned by the chapters where they happen: agency downloads in [Downloads](/books/insurance/comparative-raters-and-agency-systems#downloads), certificates in [Certificates of Insurance](/books/insurance/certificates-of-insurance), life messages in [In-Force Administration](/books/insurance/in-force-administration), workers' comp reporting in [EDI: Reporting to the State](/books/insurance/workers-comp-claims#edi-reporting-to-the-state), and statistical reporting in [Regulatory & Statistical Reporting](/books/insurance/regulatory-and-statistical-reporting).

## How the Platforms Do It

As of November 2026:

| Standard or body | What it covers | Public detail |
| --- | --- | --- |
| **ACORD forms** | Certificates of insurance and applications | ACORD 25 (liability certificate) and 27 are addressed in New York's 2002 opinion and deemed approved on filing under Texas law ([Certificates of Insurance](/books/insurance/certificates-of-insurance)) |
| **ACORD AL3** | Batch policy, claim and commission data from carriers to agency systems | Carried much of the agency download traffic; ACORD's own pages couldn't be opened |
| **ACORD P&C/Surety XML** | Request and response messages for personal, commercial and specialty lines | Version 1.16.0 in a public schema mirror; namespace `http://www.ACORD.org/standards/PC_Surety/ACORD1/xml/` |
| **ACORD Life, Annuity & Health XML (TXLife)** | Life and annuity transactions | Version 2.20.01 in the same mirror; namespace `http://ACORD.org/Standards/Life/2` |
| **IAIABC Claims EDI** | Workers' comp First and Subsequent Reports of Injury to states | Texas implemented Release 3.1.4 on July 26, 2023; California's WCIS has required electronic first reports since March 1, 2000 |
| **Ivans** | The network most agency downloads travel on | Download of policy, claims, commission statements and documents into agency management systems |
| **Statistical agents** (Verisk ISO, NISS and others) | Premium and loss records under statistical plans | Verisk received about 3.6 billion detailed individual transaction records from P&C insurers in 2025 and holds over 38.9 billion |

What the table shows: **a standard per relationship**, not one for the industry. An insurer that writes commercial lines through agents, workers' comp in California and Texas, and reports statistics to Verisk speaks AL3 or ACORD XML to agencies, IAIABC EDI to two state agencies (one directly, one through its data collection agent), and a statistical plan's record layouts to its stat agent, from the same policy and claim records.

## ACORD Forms

ACORD's forms are the paper (now PDF) face of standard data sets. The certificate forms are the best known, and their legal status is settled in [Certificates of Insurance](/books/insurance/certificates-of-insurance): an ACORD 25 is "issued as a matter of information only and confers no rights upon the certificate holder." The application forms are how an agent submits a commercial risk: a general application plus line-specific supplements, which a commercial underwriter reads with the statement of values, the vehicle schedule, payroll by class and loss runs ([The Commercial Lines Map](/books/insurance/commercial-lines)). <!-- source-gap: acord-form-numbers | missing | the ACORD commercial application form numbers and titles (the general commercial application and its line supplements) and their current editions | closes with: an ACORD forms catalog page or a state DOI or carrier page listing them (acord.org returned 403) | checked: 2026-11-10 --> I couldn't open a source listing the application form numbers, so I describe them by role.

For a system, a form is an input format with a schema: each box is a field with a definition, and an ingested ACORD application is a `submissions` row whose fields came from a known form and edition ([Underwriting Rules, Referrals & Models](/books/insurance/underwriting)). What matters is recording the form and edition the data came from, because the same box means different things across editions, and keeping the original document alongside the extracted data.

## AL3

AL3 is the batch format that agency downloads were built on: carriers generate files of policy, claim and commission records, and agency management systems parse them. Ivans describes its download as automating "the exchange of claims and policy information between you and your carrier and MGA partners," including the Direct Bill Commission Statement, across commercial lines (agricultural package, auto, BOP, crime, GL, inland marine, property, umbrella, workers' comp) and personal lines (auto, dwelling fire, flood, homeowners, inland marine, mobile home, package, umbrella, watercraft), and now offers the same content by API. ACORD's AL3 specification pages couldn't be opened, so the record structure isn't described here (the gap is recorded in [Downloads](/books/insurance/comparative-raters-and-agency-systems#downloads), along with what a carrier's downloads must get right: every transaction, in order, once).

## ACORD P&C/Surety XML

The P&C XML standard is a request and response message set. Version 1.16.0's schema (as mirrored publicly) "supports personal lines, commercial lines specialty lines"; its root `ACORD_Type` is a choice between a group of requests (`ACORDREQ`) and a group of responses (`ACORDRSP`); and request types follow a pattern of line of business, object and action. For one line, the schema's request types include:

| Request type | Action | Core model equivalent |
| --- | --- | --- |
| `AircraftPolicyQuoteInqRq` | Quote inquiry | `submissions` and `quotes` |
| `AircraftPolicyAddRq` | Add a policy | `policy_transactions` kind `new_business` |
| `AircraftPolicyModRq` | Modify a policy | `endorsement` |
| `AircraftPolicyRenewRq` | Renew | `renewal` |
| `AircraftPolicyReissueRq` | Reissue | `rewrite`, or a reissued document, depending on the trading partners' agreement |
| `AircraftPolicyFullImageReinstateRq` | Reinstate, sending the full policy image | `reinstatement` |
| `AccountingSvcRq` | Accounting service request | Billing and commission data |
| `AccountInqRq` | Account inquiry | Billing account lookups |

The same pattern repeats for every line the schema covers. Two design points follow from the shape. **Actions map to transaction kinds,** so the inbound adapter's job is to turn each request into one `policy_transactions` row (or a rejection), with the message's own identifiers kept for idempotency and response correlation. **Full image versus change:** some requests carry the whole policy as of the action, others only the change, and the adapter must know which, because applying a full image as a change (or the reverse) silently drops or duplicates coverages.

## ACORD Life: TXLife

The life and annuity standard wraps every message in a `TXLife` element whose children are an optional `UserAuthRequest`, any number of `TXLifeRequest` elements, an optional `UserAuthResponse`, any number of `TXLifeResponse` elements, `TXLifeNotify` and `OLifEExtension` (version 2.20.01, schema `TXLife2.20.01.xsd`). Each request carries a `TransRefGUID` (the message's idempotency key) and a `TransType`, its effective and execution dates, and the `OLifE` container with the policy, party and relationship data; illustrations, new business, in-force changes and replacements are all `TransType`s of the same envelope ([In-Force Administration](/books/insurance/in-force-administration), [Illustrations](/books/insurance/illustrations)). Life carriers and distributors exchange TXLife messages directly and through industry utilities such as DTCC's insurance services.

## Newer Standards

ACORD has published newer standards aimed at APIs rather than batch files and large XML documents, and the industry's newer integrations (carrier quote and bind APIs, Ivans' API products, embedded insurance APIs) are mostly JSON over HTTP, with each vendor's own schema. <!-- source-gap: acord-ngds | missing | ACORD's Next-Generation Digital Standards: what they are, their format, and adoption | closes with: an ACORD page or a carrier or vendor implementation guide that describes them (acord.org returned 403) | checked: 2026-11-10 --> I couldn't open ACORD's description of its next-generation standards, so I describe only the direction. In practice a carrier ends up with ACORD XML or AL3 for agency systems, TXLife for life distribution, and vendor JSON APIs for partners ([The API Shape](/books/insurance/embedded-insurance#the-api-shape), [Quote and Bind APIs](/books/insurance/comparative-raters-and-agency-systems#quote-and-bind-apis)), all mapped to the same core.

## IAIABC Claims EDI

Workers' compensation insurers report claims to most states under the IAIABC's EDI Claims standard: First Reports of Injury (FROI) and Subsequent Reports of Injury (SROI), each identified by a **maintenance type code** (MTC) that names the event ([EDI: Reporting to the State](/books/insurance/workers-comp-claims#edi-reporting-to-the-state) covers when reports are triggered). California's implementation guide (version 3.1, IAIABC Release 1, March 27, 2018) and its valid values table publish the codes and their deadlines:

| Transaction | MTC | Meaning | California deadline |
| --- | --- | --- | --- |
| FROI | 00 | Original | Within 10 business days, reporting all data known |
| FROI | 01 | Cancel | |
| FROI | 02 | Change | |
| FROI | 04 | Denial | |
| FROI | AU | Acquired/Unallocated | |
| FROI | CO | Correction | Within 60 calendar days of the original's "accepted with errors" acknowledgment |
| SROI | IP | "Initial payment of an indemnity benefit" | "Within 15 business days of event" |
| SROI | FN | Claim closed | |
| SROI | CO | Correction | Within 60 days of the TE acknowledgment |

California's valid values list the full SROI set (02, 04, 4P, AP, CA, CB, CD, CO, FN, FS, IP, P1 to P9, PJ, PY, RB, RE, S1 to S9, SJ, UR, VE) and periodic report codes (AN, BM, BW, MN, QT, SA); the guide gives most SROI events the same 15-business-day deadline as the initial payment. Every transaction is acknowledged: **TA**, "Transaction Accepted (without errors)"; **TE**, "Transaction Accepted with Errors"; **TR**, "Transaction Rejected." Trading partners test first, with test acknowledgments expected "within 3 business days."

Texas runs the same standard through a contractor. Its claim data goes to the Division of Workers' Compensation's "data collection agent, Verisk, Insurance Services Office, Inc. (Verisk (ISO))"; the Labor Code lets the commissioner designate data collection agents, which may charge carriers "fees necessary for the agent to recover the necessary and reasonable costs," and reporting to the agent "is the same as reporting to DWC" (Labor Code 401.024; 28 TAC 124.102). Texas's requirements are published as an Element Requirement Table by MTC, an Event Table and an Edit Matrix; a claim the carrier knew of before July 26, 2023 is a "legacy claim"; and trading partners "must successfully complete a test plan provided by Verisk (ISO)." The IAIABC's own Release 3.1.4 guide is "Exclusively published by the IAIABC" and requires membership, which is why the codes above come from California's public guide.

### Worked Numbers: Two Reports, Two Clocks

My dates, California's deadlines. A claims administrator learns of a lost-time injury on Monday, August 2, 2027, and makes the first indemnity payment on Friday, August 13, 2027. No holidays fall in the window.

| Report | Event date | Rule | Due |
| --- | --- | --- | --- |
| FROI 00 | August 2 | 10 business days | August 3 to 6 is 4, August 9 to 13 is 9, August 16 is 10: **Monday, August 16** |
| SROI IP | August 13 | 15 business days of the event | August 16 to 20 is 5, August 23 to 27 is 10, August 30 to September 3 is 15: **Friday, September 3** |
| FROI CO, if the FROI is acknowledged TE on August 17 | August 17 | 60 calendar days | **Saturday, October 16** (calendar days; whether a weekend due date rolls forward is the state's rule, so I file by the Friday) |

A one-day shift matters: a first payment on Monday, August 16 instead would make the IP due Tuesday, September 7, after the Labor Day holiday on September 6. That is why the due date is computed from a holiday calendar per jurisdiction ([Claim Handling Law & Clocks](/books/insurance/claim-handling-law), which keeps `holiday_calendars`) and stored on the report.

```go tab="Go"
// AddBusinessDays returns the date n business days after start, skipping
// weekends and the jurisdiction's holidays (dates as "2006-01-02").
func AddBusinessDays(start time.Time, n int, holidays map[string]bool) time.Time {
	d := start
	for n > 0 {
		d = d.AddDate(0, 0, 1)
		if d.Weekday() == time.Saturday || d.Weekday() == time.Sunday {
			continue
		}
		if holidays[d.Format("2006-01-02")] {
			continue
		}
		n--
	}
	return d
}
```

```rust tab="Rust"
use chrono::{Datelike, Duration, NaiveDate, Weekday};
use std::collections::HashSet;

/// The date `n` business days after `start`, skipping weekends and holidays.
pub fn add_business_days(start: NaiveDate, mut n: u32, holidays: &HashSet<NaiveDate>) -> NaiveDate {
    let mut d = start;
    while n > 0 {
        d += Duration::days(1);
        if matches!(d.weekday(), Weekday::Sat | Weekday::Sun) || holidays.contains(&d) {
            continue;
        }
        n -= 1;
    }
    d
}
```

`AddBusinessDays(2027-08-02, 10, {})` returns August 16, 2027; `AddBusinessDays(2027-08-13, 15, {})` returns September 3; with `2027-09-06` in the holiday set, `AddBusinessDays(2027-08-16, 15, ...)` returns September 7.

## Statistical Plans

Every P&C insurer reports premium and loss data under a statistical plan to a statistical agent designated by the states, and those records feed loss costs, rate reviews and regulators' market data. Verisk describes itself as a statistical agent in all 50 states, Puerto Rico and DC, receiving "approximately 3.6 billion detailed individual records of insurance transactions" from P&C insurers in 2025; NISS (the National Independent Statistical Service) publishes five plans: Auto Volume I, Auto Volume II, Commercial Lines, Homeowners, and Other Than Auto. Workers' comp statistical plans are run by the rating bureaus ([Workers' Compensation](/books/insurance/workers-compensation)). The plans' record contents, codes, deadlines and edits are in [Regulatory & Statistical Reporting](/books/insurance/regulatory-and-statistical-reporting#statistical-plans-and-agents); for this chapter, the point is that each plan is another standard with its own code lists, which the product model must carry ([Products, Coverages & Forms](/books/insurance/products-and-coverages), whose `coverage_definitions` hold a `statistical_code`).

## Data Models in Practice

Every carrier that speaks more than one standard converges on the same architecture: one canonical model inside (the core data model), and an adapter per standard at the edge. The rules that make it work:

- **Never let a standard's schema become the internal model.** ACORD XML's aggregates, AL3's records and a statistical plan's fixed-width fields each fit one relationship. A core built on any one of them can't represent what the others need.
- **Code lists are versioned mappings.** Coverage codes, cause of loss, body part and nature of injury, class codes, statistical codes, transaction types: each standard has its own list, and each list changes by release. The mapping from the internal code to each standard's code is a dated row, so a report for an old period uses the codes valid then ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).
- **Keep the message.** Every inbound and outbound message is stored as sent or received, with its standard, version and identifiers, linked to the core rows it created or was built from. Disputes with trading partners and regulators are settled with the message, not with the current state of the record.
- **Idempotency from the standard's own keys.** TXLife's `TransRefGUID`, an XML request's identifiers, an EDI transaction's claim and MTC: a replayed message is recognized and answered with the original response.
- **Acknowledgments close the loop.** EDI acknowledgments, AL3 download confirmations and XML responses are matched to what was sent; a message without an acknowledgment past its window is an exception.
- **Validation before sending.** The receiver's edits (Texas's Edit Matrix, a stat agent's quality edits) are run locally first, so the system fixes errors before they become rejections with deadlines.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). Workers' comp EDI transactions are `edi_reports` ([Workers' Comp Claims](/books/insurance/workers-comp-claims)), agency downloads are `downloads` and `download_items` ([Comparative Raters & Agency Systems](/books/insurance/comparative-raters-and-agency-systems)), and statistical records are `stat_records` ([Regulatory & Statistical Reporting](/books/insurance/regulatory-and-statistical-reporting)). This chapter adds the general message log and the code mappings every adapter reads:

```sql
CREATE TABLE acord_messages (              -- every standards message in or out, as exchanged
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  direction          TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  standard           TEXT NOT NULL,         -- 'acord_pcs_xml', 'acord_txlife', 'acord_al3',
                                            -- 'vendor_json'
  version            TEXT NOT NULL,         -- '1.16.0', '2.20.01'
  message_type       TEXT NOT NULL,         -- 'HomePolicyModRq', 'TransType 103', ...
  trading_partner_id UUID NOT NULL REFERENCES parties (id),
  message_key        TEXT NOT NULL,         -- TransRefGUID, request UID: the idempotency key
  correlates_to_id   UUID REFERENCES acord_messages (id),  -- the request a response answers
  payload_ref        TEXT NOT NULL,         -- the stored message, immutable
  payload_hash       TEXT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('received', 'validated', 'applied',
                       'rejected', 'sent', 'acknowledged', 'failed')),
  errors             JSONB,
  transaction_id     UUID REFERENCES policy_transactions (id),  -- what it created or came from
  claim_id           UUID REFERENCES claims (id),
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (trading_partner_id, standard, message_key, direction)
);

CREATE TABLE code_mappings (               -- internal codes to each standard's codes, dated
  domain             TEXT NOT NULL,         -- 'coverage', 'cause_of_loss', 'mtc', 'body_part'
  internal_code      TEXT NOT NULL,
  standard           TEXT NOT NULL,         -- 'acord_pcs_xml', 'iaiabc_ca_3.1', 'niss_homeowners'
  external_code      TEXT NOT NULL,
  valid              DATERANGE NOT NULL,    -- by the standard's release or the plan's effective date
  PRIMARY KEY (domain, internal_code, standard, valid)
);
```

Design choices that matter:

- **One log for all standards,** with the standard and version as columns, so a trading partner's whole history is one query and replays are caught by the unique key.
- **Messages link to core rows both ways:** an inbound modification points to the endorsement it created; an outbound download points to the transaction it describes.
- **Mappings are dated by the standard's validity,** not by when the row was entered, so reports for past periods are reproducible.
- **Deadlines are computed and stored** on the report (`edi_reports.due_at`) from the jurisdiction's rule version and holiday calendar.

## Auditing

- **Every exchanged message is retrievable as sent,** with its hash, and linked to the record it affected.
- **No duplicates applied:** replayed messages matched to the original by key and answered, not reprocessed.
- **Acknowledgments matched:** every outbound EDI and download has an acknowledgment or an open exception; TE and TR acknowledgments have corrections within the state's window.
- **Codes valid for the period:** a sample of reports uses the code list version valid on the event or reporting date.
- **Trading partner tests passed** before production, with the test plan results kept (Texas requires the Verisk test plan).

## What This Means for the System You Build

- **Run one canonical model** and an adapter per standard; never adopt a standard's schema as your core.
- **Version code lists by the standard's release** and map from internal codes per standard.
- **Store every message as exchanged,** keyed by the standard's own identifier, and link it to core rows.
- **Compute EDI deadlines from dated rules and holiday calendars,** and track acknowledgments to closure.
- **Validate locally with the receiver's edits** before sending.

## References

**Law and regulation**

- [Texas DWC: Claim EDI](https://www.tdi.texas.gov/wc/edi/index.html), Texas Claim EDI Release 3.1.4, the rules at 28 TAC 124.100 to 124.108, and proof of coverage reporting
- [Texas DWC EDI](https://txdwcedi.info/), implementation of Release 3.1.4 on July 26, 2023
- [Texas DWC EDI: Guides](https://txdwcedi.info/guide), the IAIABC Release 3.1.4 guide published by the IAIABC for members
- [Texas Claim EDI Release 3.1.4 Implementation Guide (PDF)](https://txdwcedi.info/documents/txedi31guide0723.pdf), Verisk (ISO) as data collection agent, Labor Code 401.024 and 28 TAC 124.102, the requirement tables, legacy claims and the test plan
- [California DWC: WCIS](https://www.dir.ca.gov/dwc/wcis.htm), the system's phases and the March 1, 2000 electronic first report requirement
- [California EDI Implementation Guide for FROI/SROI, Version 3.1 (PDF)](https://www.dir.ca.gov/dwc/DWCPropRegs/WCIS-Regulations/Final-Regulations/Guides/FROISROICAImplementationGuide-Final.pdf), maintenance type codes, deadlines, acknowledgment codes and testing
- [California FROI/SROI Valid Values Table, Release 1 v3.1 (PDF)](https://www.dir.ca.gov/dwc/WCIS/FROISROI_ValidValuesTable_V_31.pdf), the full FROI, SROI and periodic MTC lists

**Standards**

- [ACORD schemas (Liquid Technologies mirror)](https://schemas.liquid-technologies.com/), the P&C/Surety, Reinsurance & Large Commercial and Life, Annuity & Health schema sets
- [ACORD P&C/Surety 1.16.0 program page (mirror)](https://schemas.liquid-technologies.com/Accord/PCS/1.16.0/DefaultPage.html), lines supported and schema files
- [ACORD P&C/Surety 1.16.0 schema (mirror)](https://schemas.liquid-technologies.com/Accord/PCS/1.16.0/acord-pcs-v1_16_0-ns-nodoc-codes_xsd.html), the namespace, the request and response groups and the request type names
- [ACORD TXLife 2.20.01: TXLife_Type (mirror)](https://schemas.liquid-technologies.com/Accord/Life%20Standards/2.20.01/txlife_type.html), the TXLife envelope and its children
- [NISS](https://www.niss-stat.org/), its five statistical plans

**Filings**

- [Verisk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1442145/000143774926004452/vrsk20251231_10k.htm), statistical agent status and the volume of statistical records

**Vendor documentation**

- [Ivans Download (for agents)](https://www.ivans.com/for-agents/products/ivans-download/), the lines and data carried, including the Direct Bill Commission Statement
- [Ivans Download (for carriers)](https://www.ivans.com/for-carriers/products/ivans-download/), policy data synced to agency management systems
