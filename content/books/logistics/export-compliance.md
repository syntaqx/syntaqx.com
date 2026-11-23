+++
title = "Export Compliance & Screening"
nav_title = "Export Compliance"
description = "Exporting from the US: EEI in AES, the EAR and ECCNs, ITAR, OFAC, restricted party screening with fuzzy matching, and the suspended BIS Affiliates Rule."
category = "Logistics & Supply Chain Industry"
order = 2854
part = "Customs and Trade"
tags = ["logistics", "export-compliance", "ear", "itar", "ofac", "restricted-party-screening", "aes", "sanctions"]
+++

An export looks simpler than an import: no duty, no entry, often no customs officer. It isn't. Before a pallet of pumps leaves Houston for Rotterdam, someone has to know what the pumps are under US export control law, whether that classification needs a license to the Netherlands, whether the buyer, the consignee, the forwarder abroad or any company owning half of them is on a government list, whether the destination is under comprehensive sanctions, and whether the shipment needs an Electronic Export Information filing, when, and by whom. The answers come from four regimes run by three departments: the Census Bureau's Foreign Trade Regulations, Commerce's Export Administration Regulations (EAR), State's International Traffic in Arms Regulations (ITAR) and Treasury's sanctions programs under OFAC.

It is hard because the questions are about the item, the destination, the end user and the end use all at once, because the lists change daily, and because liability falls on whoever exports, which in a routed transaction or a forwarder's consolidation may not be obvious. A name match against a sanctions list is a probabilistic answer that a person has to resolve, and a company can be restricted because of who owns it without appearing on any list.

This chapter covers the export filing (EEI in the Automated Export System, its timing, exemptions and parties), the EAR (scope, the Commerce Control List, ECCNs and EAR99, the Country Chart, license exceptions and the license determination steps), ITAR briefly, OFAC's programs and the 50 percent rule, restricted party screening, and the BIS Affiliates Rule and its suspension. It builds on `parties`, `items`, `shipments` and `documents` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). A direct-to-consumer merchant's export view (EAR99 consumer goods, mass-market encryption, blocking sanctioned addresses at checkout) is Commerce's [Export Controls](/books/commerce/cross-border-commerce#export-controls); this chapter goes deeper for the shippers, forwarders and manufacturers who export as a business.

## How the Platforms Do It

Screening and export compliance software, as of November 2026, from each provider's own pages and filings:

| Provider | Screening | Export filing and licensing | Notes |
| --- | --- | --- | --- |
| **Census Bureau (ACE AESDirect)** | None | "The primary, free filing tool for submitting your EEI to the AES"; or a certified direct connection | Government; the export component of ACE |
| **International Trade Administration (Consolidated Screening List)** | 13 lists from Commerce, State and Treasury; search engine and API with fuzzy name search and a match score; refreshed daily at 5:00 AM Eastern | None | Free; CSV, TSV and JSON downloads; an aid, not a substitute for the official lists |
| **Descartes (MK Denied Party Screening, Visual Compliance)** | MK for screening "customers, suppliers and trading partners"; Visual Compliance for "more robust" screening, with "daily re-screening against changes made to watch lists" and a central record of screening activity | Export compliance suite with "license validation and audit"; ACI eManifest and importer security filing | Fiscal year ends January 31 |
| **e2open (WiseTech Global)** | "Screening customers, suppliers, and other partners against worldwide denied party lists" | Export management with "country controls, restricted party screening" and "license determination and tracking"; customs self-filing | WiseTech Global completed its acquisition of e2open |
| **LexisNexis Risk Solutions (Bridger Insight XG)** | "180 global sanctions lists" and "1,700 enforcement lists"; batch or API; portfolio changes and watchlist changes "automatically screened" | None | Built for financial institutions as much as shippers |

SAP Global Trade Services, Oracle Global Trade Management, Thomson Reuters ONESOURCE Global Trade and Dow Jones Risk & Compliance also sell screening and trade compliance; their public pages couldn't be opened for this chapter, so the table leaves them out.

The patterns:

- **The government list is free; the work around it isn't.** The Consolidated Screening List and its API cost nothing. Vendors sell broader content (other countries' lists, enforcement lists, ownership data), matching tuned to cut false positives, continuous rescreening and the record of who cleared each hit.
- **Rescreening is the product.** Descartes advertises daily rescreening against list changes, LexisNexis automatic screening on list or portfolio changes. A party cleared in March can be listed in May, and an open order or a shipment in transit has to be caught.
- **Screening, classification and the filing travel together.** e2open and Descartes put screening, license determination and the export or customs filing in one product, because the filing is where a missing license or an unresolved hit becomes a violation.

## The Export Filing: EEI in AES

Electronic Export Information (EEI) is "the electronic export data as filed in the AES," the Automated Export System, which is "the export component of the Automated Commercial Environment." The Foreign Trade Regulations (15 CFR part 30) define the parties:

- **USPPI** (US principal party in interest): "the person in the United States that receives the primary benefit, monetary or otherwise, from the export transaction," usually the seller or manufacturer.
- **FPPI** (foreign principal party in interest): "the person located abroad who purchases the goods for export or to whom final delivery of the goods will be made."
- **Authorized agent:** a person in or under the jurisdiction of the US holding a power of attorney or written authorization from a USPPI or FPPI to file; typically a forwarder.
- **Filer:** "the USPPI or an authorized agent" who submits the EEI.
- **ITN** (Internal Transaction Number): "the AES generated number assigned to a shipment confirming that an EEI transaction was accepted and is on file in the AES."

### When EEI Is Required

EEI is required for exports from the US, Puerto Rico, a foreign trade zone or the US Virgin Islands to foreign countries, and for certain movements between US areas (15 CFR 30.2(a)(1)). It is required "regardless of value" for items needing a BIS license or subject to the ITAR, items needing a DEA, NRC or other agency license, rough diamonds and used self-propelled vehicles. Otherwise the main exemption is value: no filing when the value shipped "from one USPPI to one ultimate consignee on a single exporting conveyance" is $2,500 or less per Schedule B or HTSUSA number; only the codes over $2,500 on a mixed shipment are reported (15 CFR 30.37(a)). Shipments from the US to Canada are exempt, except the regardless-of-value items above, goods stored in Canada for third countries and goods moving through Canada to a third country (15 CFR 30.36). Section 30.37 lists more exemptions: tools of trade, temporary exports that need no license and return within 12 months, gift parcels under License Exception GFT, company records, carrier stores and others.

The commodity code is the Schedule B number, Census's export classification, or the HTSUSA import code (15 CFR 30.6(a)(12)); Census publishes a lookup tool and a yearly edition, the newest being 2026.

### Timing by Mode

The filer must file and "have received the AES ITN" before a deadline set by mode, and give the carrier the proof of filing citation (or an exemption legend) (15 CFR 30.4(b)):

| Mode | EEI filed and ITN received no later than |
| --- | --- |
| Vessel | "Twenty-four hours prior to loading cargo on the vessel at the U.S. port" |
| Air, including air express | Two hours before the scheduled departure |
| Truck, including express consignment | One hour before the truck reaches the US border |
| Rail | Two hours before the train reaches the US border |
| Mail | Two hours before exportation, to the Postal Service |
| Used self-propelled vehicles | 72 hours before export, to CBP |
| USML items | As ITAR 22 CFR 123.22 sets (below) |

Approved USPPIs may file postdeparture, within five calendar days after export, except for shipments that must be filed predeparture: USML items, items needing a BIS license, routed export transactions, used vehicles and others listed in 30.4(a).

### Routed Export Transactions

In a routed export transaction the FPPI "authorizes a U.S. agent to facilitate export of items from the United States," typically a foreign buyer buying ex works and appointing its own US forwarder (15 CFR 30.3). The FPPI's agent files, with a power of attorney or written authorization from the FPPI, and must file the USPPI's data "exactly as provided by the USPPI" and give the USPPI, on request, the FPPI's authorization, the filed data, the export date and the ITN. The USPPI still owes the agent "complete, accurate, and timely" data (Appendix C lists it: its identity, the Schedule B number, the ECCN or license, the value) and must keep records of what it gave. The FPPI can instead authorize the USPPI to file in writing. For a system, routed means the party that owns the shipment record isn't the filer, and the USPPI's obligation is to deliver data and keep proof it did.

### The Data

15 CFR 30.6(a) lists 28 mandatory elements per filing: the USPPI and its identification number, the date of export, the ultimate consignee and its type, the US state of origin, the country of ultimate destination, the method of transportation, carrier name and SCAC or IATA code, port of export, related party indicator, domestic or foreign indicator, commodity code and description, unit of measure and quantity, shipping weight, value, export information code, shipment reference number, line number, hazmat indicator, in-bond code, license or license exemption code, routed export transaction indicator, filing option and action indicators. The ECCN and the intermediate consignee are conditional. Records are kept five years from export by every party involved: USPPI, FPPI, agent and carrier (15 CFR 30.10).

## The Export Administration Regulations

### Scope and the Commerce Control List

Items "subject to the EAR" (15 CFR 734.3(a)) include "all items in the United States," including those in a foreign trade zone or in transit, "all U.S. origin items wherever located," foreign-made items with more than a de minimis share of controlled US content, and some foreign direct products of US technology or software. Items exclusively controlled by another agency (ITAR defense articles, OFAC-regulated transactions, some nuclear items) and published information are not. Of the items subject to the EAR, those on the Commerce Control List (CCL) carry an Export Control Classification Number (ECCN); "items subject to the EAR which are not listed on the CCL are designated as 'EAR99.'"

An ECCN reads like `3A001` (15 CFR 738.2):

- **First digit: category.** 0 nuclear materials and miscellaneous, 1 materials, chemicals, microorganisms and toxins, 2 materials processing, 3 electronics, 4 computers, 5 telecommunications and information security, 6 lasers and sensors, 7 navigation and avionics, 8 marine, 9 aerospace and propulsion.
- **Letter: product group.** A equipment, assemblies and components; B test, inspection and production equipment; C materials; D software; E technology.
- **The three digits after the letter: type of control.** Their range maps to the reason for control (000 to 099 national security, 100 to 199 missile technology, 200 to 299 nuclear nonproliferation, 990 to 999 anti-terrorism and other unilateral reasons).

Each ECCN lists its reasons for control (NS national security, MT missile technology, NP nuclear nonproliferation, CB chemical and biological weapons, AT anti-terrorism, RS regional stability, CC crime control, EI encryption items, SS short supply, SL surreptitious listening, FC firearms convention, UN United Nations embargo, SI significant items, CW Chemical Weapons Convention), each with a Country Chart column.

### Determining Whether a License Is Needed

Part 732 walks the decision in steps. The exporter classifies the item ("you may do so on your own without BIS assistance," and "you have a right to request the applicable classification of your item from BIS"), and "the exporter, reexporter, or transferor is responsible for correctly classifying the items in a transaction" (15 CFR 732.3, Step 7). Then:

1. **Destination and the Country Chart** (Step 9). For each reason for control on the ECCN, find the column on the Country Chart (Supplement 1 to part 738) and the destination's row. An X in the cell means a license is required for that reason unless a license exception overcomes it, and every X must be overcome. BIS's own worked example: an item under a national security column with an X for Chad needs a license unless an exception applies; its $10,000 value exceeds the $5,000 limit of LVS, so GBS is the exception to check (15 CFR 738.4).
2. **De minimis and foreign direct product rules** (Steps 10 and 11) for foreign-made items.
3. **Persons and end uses** (Steps 12 and 13). Denied parties, for whom no license exception applies, and the end-use and end-user prohibitions of part 744, which include the Entity List and apply on top of the Country Chart.
4. **Embargoes** (Step 14), parts 742 and 746.
5. **Know your customer** (Step 18). General Prohibition Ten forbids proceeding when a violation is known or about to occur, so a red flag has to be resolved, not filed away.

An EAR99 item needs no license to most destinations, but it isn't free to go anywhere: the person, end-use and embargo steps still apply. A classification is therefore not a yes or no on the item; it is an input to a decision per transaction.

### License Exceptions

Part 740 lists the license exceptions (29 sections, 740.1 to 740.29, as of November 2026), each with a symbol used in the EEI license code; among them LVS (limited value shipments, 740.3), GBS (shipments to Country Group B, 740.4), TMP (temporary exports, 740.9), RPL (servicing and replacement parts, 740.10), GOV (740.11), GFT (gift parcels, 740.12), TSU (unrestricted technology and software, 740.13), BAG (baggage, 740.14), AVS (aircraft, vessels and spacecraft, 740.15), APR (740.16), ENC (encryption, 740.17), AGR (740.18), CCD (consumer communications devices, 740.19), STA (strategic trade authorization, 740.20) and newer exceptions for advanced computing and semiconductors such as NAC/ACA (740.8), HBM (740.25), AIA (740.27), ACM (740.28) and LPP (740.29). Each has its own conditions, and 740.2 sets restrictions that apply to all of them. The exception relied on is a record: its symbol, the paragraph, and the facts that met its conditions.

Records under the EAR are kept five years from the latest of export, any known reexport or transfer, or the end of the transaction (15 CFR 762.6).

## ITAR, Briefly

Defense articles and services on the United States Munitions List (22 CFR 121.1, categories from I, firearms and related articles, through others such as VIII, aircraft, and X, personal protective equipment) are controlled by State's Directorate of Defense Trade Controls (DDTC) under the ITAR, not the EAR. "Any person who engages in the United States in the business of manufacturing or exporting" defense articles or services must register with DDTC, and "a manufacturer who does not engage in exporting must nevertheless register" (22 CFR 122.1). ITAR exports file EEI earlier than the EAR's deadlines: "at least 8 hours prior to departure" by air or truck and "at least 24 hours prior to departure" by sea or rail, with an emergency provision for air (two hours) and truck under narrow conditions (22 CFR 123.22(b)). CBP decrements electronic licenses as shipments leave. A logistics system that touches ITAR goods mostly needs to know that it does: the item's jurisdiction is ITAR, the license number and its remaining value, and the earlier cutoff. DDTC also has a PGA Message Set guide for imports on CBP's CATAIR page ([Forced Labor & Partner Agencies](/books/logistics/forced-labor-and-partner-agencies)).

## OFAC Sanctions

OFAC's sanctions are on transactions and property, not items, so they apply to an EAR99 shipment as fully as to a controlled one. As of its FAQ update of October 26, 2026, the jurisdictions under broad, "at times referred to as comprehensive," sanctions are Cuba, Iran, North Korea, the Crimea region of Ukraine and the so-called Donetsk People's Republic and Luhansk People's Republic regions; OFAC notes Russia is not subject to the same degree of jurisdiction-based prohibitions. Everything else is list-based: the Specially Designated Nationals (SDN) list and OFAC's non-SDN lists.

The 50 Percent Rule extends the lists. Entities "directly or indirectly owned 50 percent or more in the aggregate by one or more blocked persons are considered blocked" (FAQ 401), whether or not they are named. Stakes of different blocked owners add up, even across programs (two 25 percent owners block the entity, FAQ 399); indirect ownership counts only through intermediate entities that are themselves 50 percent owned by blocked persons; and the rule "speaks only to ownership and not to control" (FAQ 398), though OFAC may designate a controlled entity separately. A screening system that matches names finds none of these companies; only ownership data does. OFAC records must be available "for at least 10 years after the date of such transaction" (31 CFR 501.601, as amended in September 2024), twice the EAR's five.

## Restricted Party Screening

### The Lists

The Consolidated Screening List (CSL) combines 13 US export screening lists from three departments: from Commerce's BIS, the Denied Persons List, the Unverified List, the Entity List and the Military End User List; from State, the Nonproliferation Sanctions list and the AECA Debarred List; from Treasury's OFAC, the SDN list, Foreign Sanctions Evaders, Sectoral Sanctions Identifications, the Correspondent Account or Payable-Through Account Sanctions list, the Non-SDN Menu-Based Sanctions list, the Non-SDN Chinese Military-Industrial Complex Companies list and the Palestinian Legislative Council list. ITA refreshes it "automatically every day at 5:00 AM EST/EDT," depending on each agency's file; it is downloadable as CSV, TSV or JSON with a source column, and searchable through an API on ITA's developer portal (with a subscription key) with fuzzy name search; ITA's search engine returns a score in its fuzzy name mode. ITA's caveat is the rule: the CSL is an aid, and before acting on a hit the exporter checks the Federal Register and the agency's official list. A potential match calls for "additional due diligence," and depending on the list the outcome is a prohibition, a license requirement or an end-use review.

The UFLPA Entity List (imports) and other countries' lists are not on the CSL; a forwarder or manufacturer exporting from several countries screens against each exporting country's lists too.

### Matching and False Positives

Names are hard to match. The same company appears as "Shenzhen Example Technology Co., Ltd.", "SHENZHEN EXAMPLE TECH CO LTD" and a transliteration with spaces in different places; a listed name has aliases and addresses; and a common name produces hits on unrelated people. The usual engine normalizes names (case, punctuation, legal forms such as LTD and GMBH), compares tokens and aliases with a fuzzy measure, boosts on country and address, and bands the score: below a floor is clear, above a ceiling is a likely match, and between is a person's decision ([Review Bands](/docs/building-blocks/record-linkage#review-bands)). Lowering the floor finds more true matches and buries reviewers in false ones; the tuning is a policy decision with a record, not a constant in code. The marketplace version of the same problem, at consumer volume, is [Sanctions Screening and Background Checks](/books/user-generated-platforms/marketplace-fraud#sanctions-screening-and-background-checks).

A minimal token normalizer and overlap score, the floor under any fuzzy engine, in Go and Rust:

```go tab="Go"
package screening

import (
	"strings"
	"unicode"
)

var legalForms = map[string]bool{"LTD": true, "LIMITED": true, "CO": true, "COMPANY": true,
	"LLC": true, "INC": true, "CORP": true, "CORPORATION": true, "GMBH": true, "SA": true}

// Tokens normalizes a party name: upper case, letters and digits only, legal forms dropped.
// Aliases and transliterations come from the list itself, one listed name at a time.
func Tokens(name string) map[string]bool {
	out := map[string]bool{}
	for _, t := range strings.FieldsFunc(strings.ToUpper(name), func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r)
	}) {
		if !legalForms[t] {
			out[t] = true
		}
	}
	return out
}

// Score is the share of the listed name's tokens present in the screened name, 0 to 1.
func Score(screened, listed string) float64 {
	s, l := Tokens(screened), Tokens(listed)
	if len(l) == 0 {
		return 0
	}
	hits := 0
	for t := range l {
		if s[t] {
			hits++
		}
	}
	return float64(hits) / float64(len(l))
}
```

```rust tab="Rust"
use std::collections::HashSet;

const LEGAL_FORMS: &[&str] = &[
    "LTD", "LIMITED", "CO", "COMPANY", "LLC", "INC", "CORP", "CORPORATION", "GMBH", "SA",
];

/// Normalizes a party name: upper case, letters and digits only, legal forms dropped.
/// Aliases and transliterations come from the list itself, one listed name at a time.
pub fn tokens(name: &str) -> HashSet<String> {
    name.to_uppercase()
        .split(|c: char| !c.is_alphanumeric())
        .filter(|t| !t.is_empty() && !LEGAL_FORMS.contains(t))
        .map(str::to_owned)
        .collect()
}

/// The share of the listed name's tokens present in the screened name, 0 to 1.
pub fn score(screened: &str, listed: &str) -> f64 {
    let (s, l) = (tokens(screened), tokens(listed));
    if l.is_empty() {
        return 0.0;
    }
    l.iter().filter(|t| s.contains(*t)).count() as f64 / l.len() as f64
}
```

Run it against every listed name and alias for the party's country first, then everywhere; keep the best scores and the list entries they came from, and send the band between floor and ceiling to review.

### When to Screen

- **At onboarding** of a customer, supplier, forwarder or consignee, before any order.
- **At order and at shipment,** on every party on the documents: buyer, ultimate consignee, intermediate consignee, notify party, end user and the forwarder abroad. A clean customer can ship to a listed consignee.
- **When the lists change,** for every open order, shipment in transit and active party. ITA's daily refresh is the cadence; a hit on a shipment already gone is still a finding to escalate.
- **When ownership changes,** because the 50 percent rule and the Affiliates Rule make a parent's listing the subsidiary's problem.

## The BIS Affiliates Rule

On September 30, 2025 BIS published an interim final rule, "Expansion of End-User Controls to Cover Affiliates of Certain Listed Entities" (90 FR 47201), effective September 29, 2025. It applied the restrictions of the Entity List, the Military End-User List and certain SDNs (those designated under the programs listed in 15 CFR 744.8) to any entity "owned 50 percent or more, directly or indirectly, individually or in aggregate" by listed parties, which BIS modeled on OFAC's 50 percent rule. It gave exporters "an affirmative duty to determine the percentage of ownership" through a new Red Flag 29: an exporter that can't determine ownership "must resolve the Red Flag or obtain a license from BIS prior to proceeding." A temporary general license (General Order No. 7) covered some transactions with non-listed affiliates, such as those to Country Group A:5 and A:6 destinations, for about two months.

Six weeks later BIS stayed it. A final rule published November 12, 2025 (90 FR 50857), effective November 10, 2025, stayed the amendments "until November 9, 2026." On November 9, 2026, a further final rule (91 FR 70789, FR Doc. 2026-22793), effective that day, extended the stay: the amendments "are further stayed until January 10, 2027." The rule wasn't repealed or rewritten; BIS says comments received on it "will be considered for future, subsequent rulemakings," and as of November 22, 2026 nothing published says what happens on January 10, 2027. <!-- source-gap: logistics-export-compliance-affiliates-after-jan-2027 | status | whether the BIS Affiliates Rule takes effect, is stayed again or is amended on January 10, 2027 | closes with: a BIS Federal Register notice published on or before January 10, 2027 | checked: 2026-11-22 -->

The practical consequence for a system is to build for the rule's return now: hold ownership data for counterparties (direct stakes, their sources and dates), compute aggregated ownership by listed parties the way OFAC already requires for the SDN list, and record when ownership couldn't be determined. The same data answers OFAC's 50 percent rule today.

## How to Build It

Five tables: the item's export classification, licenses, the filing, the screening record, and ownership.

```sql
-- What an item is under export law, by jurisdiction and over time.
CREATE TABLE export_classifications (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id         UUID NOT NULL REFERENCES items (id),
  jurisdiction    TEXT NOT NULL CHECK (jurisdiction IN ('EAR', 'ITAR')),
  eccn            TEXT,                  -- '3A001', '5A992', or 'EAR99'
  usml_category   TEXT,                  -- the USML category and paragraph, for ITAR items
  reasons         TEXT[] NOT NULL DEFAULT '{}',  -- NS, MT, AT ... from the ECCN
  schedule_b      CHAR(10),              -- or the HTSUSA number used on EEI
  basis           TEXT NOT NULL CHECK (basis IN ('self', 'bis_classification', 'supplier')),
  basis_document_id UUID REFERENCES documents (id),  -- BIS's answer or the supplier's statement
  classified_by   TEXT NOT NULL,
  valid_during    TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL),
  CHECK ((jurisdiction = 'EAR' AND eccn IS NOT NULL AND usml_category IS NULL)
      OR (jurisdiction = 'ITAR' AND usml_category IS NOT NULL)),
  EXCLUDE USING gist (item_id WITH =, valid_during WITH &&)  -- needs btree_gist
);

-- A license from BIS, DDTC or OFAC, and how much of it is left.
CREATE TABLE export_licenses (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  holder_party_id UUID NOT NULL REFERENCES parties (id),
  agency          TEXT NOT NULL CHECK (agency IN ('BIS', 'DDTC', 'OFAC')),
  number          TEXT NOT NULL,
  destinations    CHAR(2)[] NOT NULL,
  parties         UUID[] NOT NULL DEFAULT '{}',  -- consignees and end users it names
  item_ids        UUID[] NOT NULL DEFAULT '{}',
  authorized_value BIGINT CHECK (authorized_value >= 0),  -- minor units
  currency        CHAR(3),
  valid_during    DATERANGE NOT NULL,
  conditions      TEXT,                  -- provisos, as issued
  document_id     UUID NOT NULL REFERENCES documents (id),
  UNIQUE (agency, number)
);

-- One EEI filing (or the exemption relied on) for one export shipment.
CREATE TABLE export_filings (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id         UUID NOT NULL REFERENCES shipments (id),
  usppi_party_id      UUID NOT NULL REFERENCES parties (id),
  fppi_party_id       UUID REFERENCES parties (id),
  filer_party_id      UUID NOT NULL REFERENCES parties (id),  -- USPPI or authorized agent
  ultimate_consignee_party_id UUID NOT NULL REFERENCES parties (id),
  routed              BOOLEAN NOT NULL DEFAULT FALSE,
  authorization_document_id UUID REFERENCES documents (id),  -- POA or written authorization
  destination_country CHAR(2) NOT NULL,
  mode                TEXT NOT NULL CHECK (mode IN ('vessel', 'air', 'truck', 'rail', 'mail',
                        'pipeline', 'other')),
  filing_option       TEXT NOT NULL CHECK (filing_option IN ('predeparture', 'postdeparture',
                        'exempt')),
  exemption_citation  TEXT,              -- e.g. '30.37(a)' or '30.36', when exempt
  due_at              TIMESTAMPTZ,       -- computed from mode and departure; see below
  shipment_reference  TEXT NOT NULL,     -- the filer's shipment reference number
  itn                 TEXT,              -- AES's acceptance number
  filed_at            TIMESTAMPTZ,
  accepted_at         TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('draft', 'filed', 'accepted', 'rejected',
                        'corrected', 'cancelled', 'exempt')),
  CHECK (filing_option <> 'exempt' OR exemption_citation IS NOT NULL),
  CHECK (status <> 'accepted' OR itn IS NOT NULL),
  UNIQUE (filer_party_id, shipment_reference)
);

CREATE TABLE export_filing_lines (
  export_filing_id    UUID NOT NULL REFERENCES export_filings (id),
  line_number         SMALLINT NOT NULL,
  shipment_line_id    UUID REFERENCES shipment_lines (id),
  commodity_code      CHAR(10) NOT NULL,  -- Schedule B or HTSUSA
  origin              TEXT NOT NULL CHECK (origin IN ('domestic', 'foreign')),
  quantity            NUMERIC(14, 3) NOT NULL,
  uom                 TEXT NOT NULL,
  shipping_weight_kg  NUMERIC(12, 1) NOT NULL,
  value               BIGINT NOT NULL CHECK (value >= 0),  -- US dollars in cents
  export_info_code    TEXT NOT NULL,
  license_code        TEXT NOT NULL,      -- a license type or an exception symbol such as 'GBS'
  export_license_id   UUID REFERENCES export_licenses (id),
  eccn                TEXT,
  PRIMARY KEY (export_filing_id, line_number)
);

-- Every screening of a party, the list versions used, and how a potential match was decided.
CREATE TABLE restricted_party_screenings (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id        UUID NOT NULL REFERENCES parties (id),
  subject_kind    TEXT NOT NULL CHECK (subject_kind IN ('onboarding', 'order', 'shipment',
                    'list_change', 'ownership_change', 'periodic')),
  subject_id      UUID,                  -- the order or shipment screened for
  screened_name   TEXT NOT NULL,         -- as screened, with the address and country
  screened_address TEXT,
  screened_country CHAR(2),
  lists           JSONB NOT NULL,        -- source -> version or retrieved_at, per list used
  top_score       NUMERIC(4, 3),
  matches         JSONB NOT NULL DEFAULT '[]',  -- list entry ids, names, scores
  result          TEXT NOT NULL CHECK (result IN ('clear', 'potential_match', 'confirmed_match',
                    'false_positive')),
  decided_by      TEXT,                  -- person or rule; required past the floor
  reason          TEXT,
  screened_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at      TIMESTAMPTZ,
  CHECK (result IN ('clear', 'potential_match') OR (decided_by IS NOT NULL AND decided_at IS NOT NULL))
);
CREATE INDEX ON restricted_party_screenings (party_id, screened_at DESC);

-- Who owns whom, as reported and when, for the 50 percent rule and the Affiliates Rule.
CREATE TABLE party_ownership_stakes (
  owner_party_id  UUID NOT NULL REFERENCES parties (id),
  owned_party_id  UUID NOT NULL REFERENCES parties (id),
  percent         NUMERIC(5, 2) NOT NULL CHECK (percent > 0 AND percent <= 100),
  source          TEXT NOT NULL,         -- registry extract, vendor data, the customer's statement
  document_id     UUID REFERENCES documents (id),
  valid_during    DATERANGE NOT NULL,
  PRIMARY KEY (owner_party_id, owned_party_id, valid_during),
  CHECK (owner_party_id <> owned_party_id)
);

ALTER TABLE parties
  ADD COLUMN ownership_determined_at TIMESTAMPTZ,  -- null: the red flag is unresolved
  ADD COLUMN export_hold_reason      TEXT;          -- set while a screening is unresolved
```

The deadline is computed from the mode, the departure (or border arrival) and the item's jurisdiction, and stored on the filing with the rule that set it. A filing for an ITAR item by air takes eight hours, the EAR's two hours otherwise.

The ownership question, one step of it: which parties are at least half owned, in aggregate, by parties with a confirmed match today. Because a newly blocked entity can block the entities it owns, the step repeats, adding its results to the blocked set, until it finds nothing new.

```sql
WITH blocked AS (
  SELECT DISTINCT party_id FROM restricted_party_screenings
  WHERE result = 'confirmed_match'
)
SELECT s.owned_party_id, sum(s.percent) AS blocked_percent
FROM party_ownership_stakes s
JOIN blocked b ON b.party_id = s.owner_party_id
WHERE s.valid_during @> CURRENT_DATE
  AND s.owned_party_id NOT IN (SELECT party_id FROM blocked)
GROUP BY s.owned_party_id
HAVING sum(s.percent) >= 50;
```

Design notes:

- **Classification is per item and dated,** with who decided it and on what basis; a shipment line snapshots the ECCN and license code it shipped under, because the classification can change after.
- **A license exception is a decision with evidence.** Store the symbol, the paragraph and the facts (value, destination group, end user) that met it on the filing line.
- **Screen with list versions.** `lists` records which list files the screening used, so a later list change doesn't rewrite a decision, and a rescreen is a new row that points at the same party.
- **Hold, don't block silently.** An unresolved potential match sets a hold on the party and every open shipment for it, visible to operations, and only a decision with a person's name releases it.
- **Rescreen on list changes** for active parties and open shipments, using ITA's daily refresh or a vendor's change feed, and alert on hits against shipments already gone.
- **Compute deadlines from rules,** not from habit: vessel 24 hours before loading, air 2 hours before departure, truck 1 hour before the border, ITAR 8 or 24 hours ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

## Auditing

- **Every EEI filing** with its ITN, filer, authorization, routed status, lines, license codes and the deadline it met, or the exemption citation relied on, kept five years (15 CFR 30.10).
- **Every export classification** with its basis and history, and every license with its decrements.
- **Every screening** with the name and address as screened, the list versions, the scores and matches, and who cleared or confirmed each potential match and why.
- **Every ownership stake** with its source and date, and every case where ownership couldn't be determined.
- **The longer clock wins.** EAR records five years from the latest event, OFAC ten years (31 CFR 501.601); a system keeping one retention period keeps the longer.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Classify every exported item** under the EAR or ITAR, with an ECCN or EAR99, a Schedule B number, a basis and a date, before it can be put on an export order.
- **Decide the license per transaction** from the ECCN, the destination, the parties and the end use, and record the exception or license that covers each line.
- **Compute the EEI deadline from mode and jurisdiction,** require the ITN (or a cited exemption) before the carrier's cutoff, and know who the filer is in a routed transaction.
- **Screen every party on every document** at onboarding, order and shipment, against list versions you record, and rescreen when the lists change.
- **Band fuzzy matches,** send the middle band to a person, and record every decision with a name and a reason.
- **Hold ownership data** for counterparties and compute aggregated ownership by blocked and listed parties; OFAC needs it now and the Affiliates Rule may need it from January 2027.
- **Keep records for the longest regime that applies,** ten years where OFAC does.

## References

**Regulations**

- [15 CFR 30.1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/30.1), USPPI, FPPI, authorized agent, filer, ITN and EEI
- [15 CFR 30.2 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/30.2), when EEI is required, regardless of value for licensed and ITAR items
- [15 CFR 30.3 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/30.3), party responsibilities and routed export transactions
- [15 CFR 30.4 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/30.4), predeparture and postdeparture filing and the deadlines by mode
- [15 CFR 30.6 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/30.6), the mandatory and conditional EEI data elements
- [15 CFR 30.10 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/30.10), five-year retention by every party
- [15 CFR 30.36 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/30.36), the Canada exemption and its exceptions
- [15 CFR 30.37 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/30.37), the $2,500 exemption and the other exemptions
- [15 CFR 732.3 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/732.3), the license determination steps and the exporter's responsibility for classification
- [15 CFR 734.3 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/734.3), items subject to the EAR and EAR99
- [15 CFR 738.2 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/738.2), CCL categories, product groups, ECCN structure and reasons for control
- [15 CFR 738.4 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/738.4), using the Country Chart and the worked example
- [15 CFR part 740 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/part-740), the license exceptions, their sections and symbols
- [15 CFR 762.6 (Cornell LII)](https://www.law.cornell.edu/cfr/text/15/762.6), EAR record retention
- [22 CFR 121.1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/22/121.1), the US Munitions List categories
- [22 CFR 122.1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/22/122.1), DDTC registration
- [22 CFR 123.22 (Cornell LII)](https://www.law.cornell.edu/cfr/text/22/123.22), ITAR export filing deadlines and emergency shipments
- [31 CFR 501.601 (Cornell LII)](https://www.law.cornell.edu/cfr/text/31/501.601), OFAC's ten-year record retention

**Federal Register**

- [BIS: Expansion of End-User Controls to Cover Affiliates of Certain Listed Entities, 90 FR 47201 (September 30, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-09-30/html/2025-19001.htm), the lists covered, the 50 percent test, Red Flag 29, the temporary general license and the effective date
- [BIS: One Year Suspension of Expansion of End-User Controls for Affiliates, 90 FR 50857 (November 12, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-11-12/html/2025-19846.htm), the stay effective November 10, 2025 until November 9, 2026
- [BIS: Extension of the Suspension of Expansion of End-User Controls for Affiliates of Certain Listed Entities, 91 FR 70789 (November 9, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-11-09/pdf/2026-22793.pdf), the further stay until January 10, 2027 and comments held for later rulemakings

**Agencies**

- [Census Bureau: Automated Export System](https://www.census.gov/foreign-trade/aes/index.html), AES in ACE and AESDirect
- [Census Bureau: Schedule B](https://www.census.gov/foreign-trade/schedules/b/index.html), the export commodity code lookup and the 2026 edition
- [International Trade Administration: Consolidated Screening List](https://www.trade.gov/consolidated-screening-list), the 13 lists, the API, fuzzy name search, the 5:00 AM refresh, the downloads and the due diligence caveat
- [International Trade Administration: Developer Portal](https://developer.trade.gov/), subscription keys for the API
- [OFAC: FAQ updates of October 26, 2026](https://ofac.treasury.gov/faqs/updated/2026-10-26), FAQ 10 and the jurisdictions under comprehensive sanctions
- [OFAC: 50 Percent Rule FAQs](https://ofac.treasury.gov/faqs/topic/1521), FAQs 398 to 402 on aggregation, indirect ownership and control

**Vendors**

- [Descartes Systems Group: annual information form, fiscal 2026 (SEC exhibit)](https://www.sec.gov/Archives/edgar/data/1050140/000110465926026450/dsgx-20260131xex99d1.htm), MK Denied Party Screening, Visual Compliance, the export compliance suite, ACI eManifest and importer security filing, and the fiscal year
- [Descartes Visual Compliance](https://www.visualcompliance.com/), daily rescreening, the screening record and export classification
- [e2open: Global Trade](https://www.e2open.com/global-trade/), restricted party screening, license determination and tracking, and customs filing
- [e2open](https://www.e2open.com/), WiseTech Global's completed acquisition
- [LexisNexis Risk Solutions: Bridger Insight XG](https://lexisnexisrisk.com/en-us/business-services/products/bridger-insight-xg), list counts, batch and API screening and automatic rescreening
