+++
title = "Import Entry & ACE"
description = "A US import from booking to liquidation: ISF and manifests, ABI and ACE, entry types, the 7501, statements, the end of de minimis, corrections and protests."
category = "Logistics & Supply Chain Industry"
order = 2849
part = "Customs and Trade"
tags = ["logistics", "customs", "import-entry", "ace", "abi", "isf", "liquidation", "de-minimis"]
+++

An import entry is a promise made in stages. Before a container is loaded in Ningbo, the importer has told CBP who sold the goods, who bought them, who made them and what tariff number they fall under; the carrier has declared the cargo; on arrival the broker asks CBP to release the goods against a bond; within ten working days the broker files the entry summary with the classification, value, origin and duty of every line and pays the estimated duty; and about ten months later CBP liquidates the entry, fixing the duty, after which the importer has 180 days to protest. Each stage has its own deadline, its own filer and its own message in CBP's Automated Commercial Environment (ACE), and each can be corrected, extended, suspended or penalized separately.

The software problem is that one physical movement becomes several legal records that move on different clocks. One container can be one entry or several; one entry can cover several bills of lading; a line on the entry is "a commodity from one country" with its own tariff number, value and duty, and does not match a line on the commercial invoice one to one. Status comes back from CBP and the partner agencies as messages, asynchronously, and the duty owed is not final until liquidation. This chapter covers the filings in the order they happen (advance cargo data, manifests, cargo release, the entry summary), the entry types, the entry number and its check digit, statements and periodic monthly statements, the end of de minimis for non-postal and postal shipments in 2025 and 2026, post-summary corrections, liquidation, protests and penalties. It extends `shipments`, `shipment_lines`, `freight_charges` and `documents` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model); the parties and bonds behind each entry are [Customs Brokers & Bonds](/books/logistics/customs-brokers-and-bonds), and a merchant's view of a parcel's customs data is [Customs Entry and Duties](/books/commerce/cross-border-commerce#customs-entry-and-duties).

## How the Platforms Do It

ACE is CBP's system of record; everyone else connects to it. As of November 2026:

| System | Who uses it | What it does, as published |
| --- | --- | --- |
| **CBP ACE** | CBP, partner agencies, importers, brokers, carriers | "The United States' centralized digital system for processing imports and exports" and the US Single Window, "a single, centralized access point connecting CBP, Partner Government Agencies and the business community" |
| **ABI and CATAIR** | Brokers and self-filing importers | The Automated Broker Interface is the filing channel; the CBP and Trade Automated Interface Requirements hold the "technical requirements for transmitting automated data" to ACE, by chapter (Cargo Release, Entry Summary, ISF, Daily Statement, Periodic Monthly Statement, Drawback, FTZ, In-Bond, eBond, PGA Message Set), with drafts published September to November 2026 |
| **Descartes** | Brokers, forwarders, carriers | NetCHB connects brokers to ABI; importer security filing; Canada's ACI eManifest |
| **WiseTech CargoWise** | Forwarders and brokers | A forwarding platform with customs filing; e2open's global trade products joined WiseTech on August 3, 2025 |

The volume moved by these systems, from CBP's trade statistics for fiscal 2026 (updated as of July 27, 2026, on a page last modified November 18, 2026): $3.79 trillion of imported goods, 112,262,124 entry summaries, and $333.7 billion of duties, taxes and fees collected.

Three patterns:

- **Filing is EDI into one government system.** Brokers' software is a translator and workflow around CATAIR's record formats; what distinguishes vendors is validation before transmission and how they handle CBP's responses, not access.
- **The interface changes on CBP's schedule.** CATAIR chapters were redrafted throughout late 2026 (Cargo Release on November 9, Appendix F duty calculations on November 12), and new trade programs arrive as CSMS messages with an effective time of 12:01 a.m. Eastern. Filers re-test against each draft.
- **Status is a stream of responses.** Cargo release, partner agency decisions, exams, statement acceptance and liquidation all arrive as separate messages, hours or months apart, and the entry's state is the fold over them.

## The Clocks on an Import

| Step | Who | Deadline | Source |
| --- | --- | --- | --- |
| Importer security filing (ocean) | Importer or agent | Most elements "no later than 24 hours before the cargo is laden aboard the vessel at the foreign port"; stuffing location and consolidator no later than 24 hours before US arrival | 19 CFR 149.2 |
| Vessel cargo declaration | Carrier (and NVOCC for house bills) | 24 hours before lading at the foreign port | 19 CFR 4.7 |
| Air cargo advance screening | Inbound air carrier, or an electing forwarder | "As early as practicable, but no later than prior to loading of the cargo onto the aircraft" | 19 CFR 122.48b |
| Entry (cargo release) | Importer or broker | Within "15 calendar days after landing from a vessel, aircraft or vehicle" | 19 CFR 142.2 |
| Entry summary with estimated duties | Importer or broker | "Within 10 working days after the time of entry" | 19 CFR 142.12 |
| Post-summary correction | Importer or broker | Within 300 days of entry and at least 15 days before scheduled liquidation | CBP |
| Liquidation | CBP | Deemed liquidated one year from entry unless extended (four years at most) or suspended | 19 U.S.C. 1504 |
| Protest | Importer or broker | "Within 180 days after but not before" liquidation | 19 U.S.C. 1514 |

The time of entry, which starts the ten working days, is usually "the time the appropriate CBP officer authorizes the release of the merchandise," or the time the entry summary is filed with estimated duties when the summary serves as the entry (19 CFR 141.68). Working days skip weekends and federal holidays, so the deadline is computed from a holiday calendar and stored, not recomputed on every read ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

## Advance Cargo Data

### The Importer Security Filing

Vessel cargo bound for the US needs an importer security filing (ISF, "10+2") from the ISF importer, the party causing the goods to arrive, or its agent; bulk cargo is exempt (19 CFR 149.2(a)). The importer's ten elements are the seller, buyer, importer of record number, consignee number, manufacturer or supplier, ship-to party, country of origin, the six-digit HTSUS number, the container stuffing location and the consolidator (19 CFR 149.3(a)). Timing splits the ten:

- The seller, buyer, importer of record number and consignee number are due 24 hours before lading abroad (149.2(b)(1)).
- The manufacturer, ship-to party, country of origin and tariff number are due on the same clock, but may be filed with the best data available and must be updated "in no event less than 24 hours prior to arrival at a U.S. port" (149.2(b)(2) and (f)).
- The stuffing location and consolidator are due "as early as possible," and no later than 24 hours before US arrival (149.2(b)(3)).
- Cargo remaining on board (FROB) and cargo moving in-bond for immediate export or transportation and exportation file a shorter set (149.2(b)(4) and (5)), usually called ISF-5.

The filing must be updated whenever information changes before the goods enter port (149.2(d)), and a violation carries liquidated damages of "$5,000 for each violation" under the bond (19 CFR 113.62(j)). CBP's ISF page notes the rule took effect January 26, 2009 and that noncompliance "could ultimately result in monetary penalties, increased inspections and delay of cargo."

### Manifests and Air Cargo

The carrier's vessel cargo declaration is due "24 hours before the cargo is laden aboard the vessel at the foreign port"; bulk and break bulk cargo are exempt, containerized cargo on a bulk carrier is not (19 CFR 4.7(b)(2)). An NVOCC with its own automated access files its house bills. By air, the inbound carrier files air cargo advance screening data at the lowest air waybill level by default (others may elect to), and "the inbound air carrier may not transport cargo with a Do-Not-Load (DNL) instruction" (19 CFR 122.48b). The same 2-hour, 4-hour and 8-hour clocks that FDA sets for food by mode are covered in [Forced Labor & Partner Agencies](/books/logistics/forced-labor-and-partner-agencies#fda-prior-notice-and-entry-review).

These filings are the advance cargo records of the model: one per filer per shipment, each with its own transaction reference and status, matched later to the entry by bill of lading number.

## Entry Types

The entry type's first digit is the category and its second the processing type, per the entry summary instructions (CBP Form 7501, rev. 11/26):

| Code | Type | Code | Type |
| --- | --- | --- | --- |
| 01 | Consumption, free and dutiable | 21 | Warehouse |
| 02 | Consumption, quota or visa | 22 | Re-warehouse |
| 03 | Consumption, antidumping or countervailing duty | 23 | Temporary importation under bond |
| 04 | Appraisement | 26 | Foreign trade zone admission |
| 06 | Foreign trade zone consumption | 31 | Warehouse withdrawal for consumption |
| 07 | Quota or visa and AD/CVD combinations | 34 | Warehouse withdrawal, AD/CVD |
| 08 | Duty deferral | 51, 52 | Government entries |
| 11 | Informal, free and dutiable | 61 | Immediate transportation (in-bond) |
| 12 | Informal, quota other than textiles | 62, 63 | Transportation and exportation; immediate exportation |

Formal entry under 19 U.S.C. 1484 is the default for shipments valued over $2,500, and informal entry is available for "shipments of merchandise not exceeding $2,500 in value" (19 CFR 143.21), with a carve-out that matters in 2026: the $2,500 threshold doesn't apply to articles "valued in excess of $250 classified in Chapter 99, Subchapters III and IV, HTSUS," which is where the additional duties of [Tariff Programs](/books/logistics/tariff-programs) are reported. A $900 shipment carrying a Section 301 or Section 232 duty is a formal entry. Reconciliation, drawback (entry type 47) and zone entries have their own chapters of CATAIR and of this part ([Drawback, FTZs & Trade Agreements](/books/logistics/drawback-ftz-and-trade-agreements)).

## The Entry and the Entry Summary

### Cargo Release

The entry (cargo release; on paper, CBP Form 3461) asks CBP to release the goods: importer, bond, bill of lading, port, arrival, a description and tariff numbers at enough precision to target, and the partner agency data the goods trigger. CBP answers per bill of lading: release, a hold for exam or document review, or a partner agency hold. The entry is due within 15 calendar days of landing (19 CFR 142.2), and a shipment still unentered after that is a problem for the carrier, the terminal and the importer at once.

### The Entry Number

Every entry has an 11-character number: "the three-digit filer code, followed by the seven-digit entry number, and completed with the one-digit check digit" (Form 7501 instructions, block 1). The filer code is CBP's assignment to the broker or self-filing importer; the seven digits are the filer's own sequence. The check digit is a Luhn-style sum over the ten preceding characters, with letters in the filer code mapped to digits first (A, J and S are 1, 1 and 2 in a table the instructions print), every second position doubled with its digits summed, and the result subtracted from the next multiple of ten. CBP's example, "B76-0324527-8," checks:

```go tab="Go"
// EntryCheckDigit computes the check digit of a CBP entry number from its three-
// character filer code and seven-digit transaction number, per the Form 7501
// instructions (Appendix 1). Filers authorized a check digit factor add it after.
func EntryCheckDigit(filerCode, number string) (int, error) {
	const letters = "12345678912345678923456789" // A..Z
	s := strings.ToUpper(filerCode) + number
	if len(filerCode) != 3 || len(number) != 7 {
		return 0, fmt.Errorf("want a 3-character filer code and 7 digits, got %q", s)
	}
	sum := 0
	for i, r := range s {
		var d int
		switch {
		case r >= '0' && r <= '9':
			d = int(r - '0')
		case r >= 'A' && r <= 'Z' && i < 3:
			d = int(letters[r-'A'] - '0')
		default:
			return 0, fmt.Errorf("invalid character %q at position %d", r, i+1)
		}
		if i%2 == 1 { // positions 2, 4, 6, 8, 10 are doubled
			d *= 2
			if d > 9 {
				d -= 9 // add the digits: 14 becomes 5
			}
		}
		sum += d
	}
	return (10 - sum%10) % 10, nil
}

// EntryCheckDigit("B76", "0324527") == 8; EntryCheckDigit("RO7", "1010035") == 3
```

```rust tab="Rust"
/// Computes the check digit of a CBP entry number from its three-character filer
/// code and seven-digit transaction number, per the Form 7501 instructions
/// (Appendix 1). Filers authorized a check digit factor add it after.
pub fn entry_check_digit(filer_code: &str, number: &str) -> Result<u32, String> {
    const LETTERS: &[u8; 26] = b"12345678912345678923456789"; // A..Z
    if filer_code.len() != 3 || number.len() != 7 {
        return Err(format!("want a 3-character filer code and 7 digits: {filer_code}{number}"));
    }
    let s = format!("{}{}", filer_code.to_ascii_uppercase(), number);
    let mut sum = 0;
    for (i, c) in s.chars().enumerate() {
        let mut d = match c {
            '0'..='9' => c.to_digit(10).unwrap(),
            'A'..='Z' if i < 3 => (LETTERS[(c as u8 - b'A') as usize] - b'0') as u32,
            _ => return Err(format!("invalid character {c:?} at position {}", i + 1)),
        };
        if i % 2 == 1 {
            // positions 2, 4, 6, 8, 10 are doubled
            d *= 2;
            if d > 9 {
                d -= 9; // add the digits: 14 becomes 5
            }
        }
        sum += d;
    }
    Ok((10 - sum % 10) % 10)
}

// entry_check_digit("B76", "0324527") == Ok(8); entry_check_digit("RO7", "1010035") == Ok(3)
```

The letter table is the instructions' (A=1 through I=9, J=1 through R=9, S=2 through Z=9). Some filers that have exhausted their check digits are authorized a check digit factor, which adds one or two to the computed digit and is "posted to the filer's national filer maintenance record," so validation reads the factor from the filer's permit rather than assuming zero.

### The Entry Summary

The entry summary (CBP Form 7501, or its ABI equivalent) is the legal declaration. Its header carries the entry number and type, the summary and entry dates, the surety and bond type, the port, the mode of transport (11 vessel container, 40 air, 50 mail, 30 and 31 truck, and so on), the bill of lading or air waybill, the importer and consignee numbers and the ultimate consignee's state. Its lines are what the duty is computed on, and a line is not an invoice line: "A 'line number' refers to a commodity from one country, covered by a line which includes a net quantity, entered value, HTS number, charges, rate of duty and tax," and "some line numbers may actually include more than one HTS number and value" (Form 7501 instructions, column 31). A line can carry:

- **Several tariff numbers.** A Chapter 98 provision with its Chapter 1 to 97 number, the Chapter 99 numbers for each additional duty in CBP's reporting order, or up to four numbers for a watch.
- **A special program indicator** before the number it applies to, such as a free trade agreement claim, with a secondary indicator after a period.
- **Origin codes and the manufacturer.** Country of origin and of export, the manufacturer identification code (one MID per line, "if there is more than one vendor for a particular HTS number, separate line items will be required"), and for steel and aluminum the melt and pour or smelt and cast country.
- **Case numbers and rulings.** An AD/CVD case number under the tariff number, and a binding ruling number prefixed "RLNG."
- **Value and quantity.** Entered value in whole dollars per line, net quantity in the unit the HTSUS specifies, and the charges excluded from value.

The mapping from a shipment's invoice lines to entry lines is the importer's or broker's job and is many to many: two invoice lines of the same product from the same manufacturer collapse into one entry line, and one invoice line of a set splits into the "X" and "V" lines GRI 3 sets require ([Classification, Valuation & Origin](/books/logistics/classification-valuation-origin)). Keep both and the link between them.

The summary carries the declaration the importer or broker signs: that the prices in the invoices are true and that the filer "will immediately furnish to the appropriate CBP officer any information showing a different statement of facts." Fees ride on the summary as well: the merchandise processing fee and harbor maintenance fee are covered in [An Ocean Import](/books/logistics/logistics-business#an-ocean-import).

## Statements and Payment

Duty is paid on a statement rather than entry by entry. Statement processing is "a voluntary automated program for participants in the Automated Broker Interface": the filer schedules a statement date within 10 working days of entry, presents the summaries, and pays by ACH debit or credit, "the preferred method of payment" and the only one for statements with quota merchandise (19 CFR 24.25). The Form 7501's ABI indicators show how each summary is paid: "ABI/A" by ACH on a daily statement, "ABI/P" on a periodic monthly basis, "ABI/N" not on a statement.

A periodic monthly statement (PMS) lets an importer pay a month's entries once, in the following month. CBP publishes the statement dates each year; its 2025 calendar lists two a month, on the "11th Workday" and the "15th Workday" (January 16 and January 23 for January, for example). The regulation text for PMS wasn't in the section opened for this chapter. <!-- source-gap: logistics-import-entry-pms-rule | missing | the regulation or CBP page stating the periodic monthly statement due date as the 15th working day of the following month | closes with: the CBP PMS page or the 19 CFR provision, opened and cited | checked: 2026-11-22 --> For an importer, PMS is float: duties on entries released in early March are paid on the April statement date, about three weeks into April. For the system, it means duties are accrued at entry summary, scheduled to a statement, and paid by ACH on the statement date, three separate states of one liability.

## De Minimis and Low-Value Shipments

Until 2025, shipments valued at $800 or less entered free of duty under 19 U.S.C. 1321's administrative exemption, many released from manifest data alone or under the Entry Type 86 test, "the voluntary electronic entry type CBP established in 2019 for qualifying low-value shipments." The exemption was suspended by executive order from August 29, 2025 and, as of November 2026, stands suspended by regulation and repealed by statute:

- **Non-postal shipments.** CBP's interim final rule (CBP Dec. 26-12), effective June 24, 2026, indefinitely suspends the exemption for imports arriving by "all modes other than through the international postal network," so that "all entries of merchandise valued at $800 or less arriving through all modes other than the international postal network must utilize formal or informal entry procedures." CBP's reasons include that Type 86 goods "were often undervalued, misclassified, or failed to comply with applicable PGA requirements," with an estimated 34.8 million violations in Type 86 entries in fiscal 2024.
- **Postal shipments.** A companion rule (CBP Dec. 26-13) suspends it for mail and creates a mail informal entry process that "takes effect July 24, 2026," with goods under Chapter 98 or 99 duties, free trade agreement claims and PGA requirements excluded from October 22, 2026 (they use formal entry or the voluntary Entry Type 13 test), and the process "requires a basic importation and entry bond" on file in ACE eBond (CBP e-commerce FAQs, modified November 6, 2026). [Customs Entry and Duties](/books/commerce/cross-border-commerce#united-states) covers the postal process from the merchant's side, including the compliance date.
- **The statute.** Public Law 119-21 terminated the de minimis exemption effective July 1, 2027, so the regulatory suspension becomes permanent law then.

For a forwarder or express carrier, every low-value parcel is now an informal entry (type 11) or a formal one, with ten-digit tariff numbers, origin and value per line, the duties of every applicable tariff program, and a bond. That is a volume problem: entries that used to be manifest lines are now entries, which is visible in the 112 million entry summaries of fiscal 2026. Consolidated entries for many consignees in one shipment use zeros in the consignee number block ("00-0000000"), per the 7501 instructions, while each line still needs its own data.

## After Release

### Post-Summary Corrections

Until liquidation, the importer can fix its own entry summary. A post-summary correction (PSC) is filed "within 300 days from the date of entry and up to 15 days of the scheduled liquidation date, whichever date is earlier"; a PSC that changes the importer of record puts the summary "back into the 314-day liquidation cycle" (CBP, modified August 6, 2026). The 314 days is CBP's operating cycle, not the statute. A PSC replaces the summary's data and is how most refunds and additional duties before liquidation happen, including the refunds of [Tariff Programs](/books/logistics/tariff-programs) where CBP routes them through PSCs.

### Liquidation

Liquidation is CBP's final computation of duty. An entry not liquidated within one year from entry is "deemed liquidated" at the rate, value and amount the importer asserted, unless CBP extends liquidation (up to four years from entry in total) or it is suspended by statute or court order, as AD/CVD entries are until Commerce issues instructions, after which CBP has six months (19 U.S.C. 1504). After liquidation, CBP refunds an excess deposit with interest within 30 days, and a bill for increased duties is due 30 days after it issues (19 U.S.C. 1505(b)). Liquidation is posted in ACE and on CBP's bulletin notice; the system records the liquidation date, type (no change, increase, decrease) and amount for each entry, because the protest clock starts there.

### Protests

A protest is the importer's administrative appeal, filed "within 180 days after but not before" liquidation, against decisions on value, classification and rate, charges, exclusion of merchandise, liquidation or reliquidation, and refusal of drawback, among others (19 U.S.C. 1514). A denied protest goes to the Court of International Trade. The protest deadline is the hard one: after 180 days, an unprotested liquidation is final, and the money is gone.

### Penalties and Prior Disclosure

False statements and omissions on an entry are penalized by culpability (19 U.S.C. 1592): for fraud, up to the domestic value of the goods; for gross negligence, the lesser of domestic value or four times the lost duties (40% of dutiable value if no duty was lost); for negligence, the lesser of domestic value or two times the lost duties (20% of value). A prior disclosure, made before CBP or the importer knows of an investigation, caps a fraud penalty at 100% of lost duties (10% of dutiable value if none) and limits negligence and gross negligence to interest, if the lost duties are tendered. That arithmetic is why a broker's discovery of a classification error starts a decision, recorded in [Customs Brokers & Bonds](/books/logistics/customs-brokers-and-bonds): correct it with a PSC before liquidation, file a prior disclosure after, or both.

## How to Build It

The entry model: the entry, its lines, the bills of lading it covers, CBP's and the agencies' responses, the advance cargo filings, statements, corrections and protests. Duties and fees stay `freight_charges` lines, now linked to the entry line that produced them:

```sql
-- One customs declaration: a US entry (or, abroad, a declaration with an MRN).
CREATE TABLE customs_entries (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  country            CHAR(2) NOT NULL DEFAULT 'US',
  declaration_number TEXT,               -- US: filer code + 7 digits + check digit
  entry_type         TEXT NOT NULL,      -- US: '01', '03', '06', '11', '21', '47', ...
  importer_party_id  UUID NOT NULL REFERENCES parties (id),  -- importer of record
  filer_party_id     UUID NOT NULL REFERENCES parties (id),  -- the broker or self-filer
  power_of_attorney_id UUID REFERENCES customs_powers_of_attorney (id),
  customs_bond_id    UUID REFERENCES customs_bonds (id),     -- null: bond type '0'
  port_code          TEXT NOT NULL,      -- the port of entry
  mode               TEXT NOT NULL,      -- the 7501 mode code: '11', '40', '50', ...
  arrived_at         TIMESTAMPTZ,        -- import date, from the carrier's arrival
  released_at        TIMESTAMPTZ,        -- CBP's release; usually the time of entry
  entry_time         TIMESTAMPTZ,        -- per 19 CFR 141.68, which starts the clocks
  summary_due_on     DATE,               -- 10 working days after entry_time, computed once
  summary_filed_at   TIMESTAMPTZ,
  statement_id       UUID,               -- set when scheduled on a statement
  liquidation_status TEXT NOT NULL DEFAULT 'unliquidated' CHECK (liquidation_status IN
                       ('unliquidated', 'extended', 'suspended', 'liquidated', 'deemed',
                        'reliquidated', 'final')),
  scheduled_liquidation_on DATE,
  liquidated_on      DATE,
  protest_due_on     DATE,               -- 180 days after liquidated_on
  currency           CHAR(3) NOT NULL DEFAULT 'USD',
  status             TEXT NOT NULL CHECK (status IN ('draft', 'filed', 'released', 'held',
                       'summary_filed', 'paid', 'liquidated', 'protested', 'closed',
                       'cancelled')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (country, declaration_number)
);

-- Which bills of lading and shipments an entry covers (many to many).
CREATE TABLE customs_entry_shipments (
  customs_entry_id UUID NOT NULL REFERENCES customs_entries (id),
  shipment_id      UUID NOT NULL REFERENCES shipments (id),
  bill_number      TEXT NOT NULL,        -- the master or house bill as declared
  quantity         INT,                  -- pieces released against this bill
  PRIMARY KEY (customs_entry_id, shipment_id)
);

-- One entry line: a commodity from one country, with its value and numbers.
CREATE TABLE customs_entry_lines (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  customs_entry_id   UUID NOT NULL REFERENCES customs_entries (id),
  line_number        SMALLINT NOT NULL CHECK (line_number > 0),
  shipment_line_id   UUID REFERENCES shipment_lines (id),  -- one source; see the link table
  item_id            UUID REFERENCES items (id),
  lot_id             UUID REFERENCES lots (id),
  description        TEXT NOT NULL,      -- enough to classify, per the 7501 instructions
  tariff_number      TEXT NOT NULL,      -- the Chapter 1-97 number, 10 digits
  extra_tariff_numbers TEXT[] NOT NULL DEFAULT '{}',  -- Chapter 98 and 99, in reporting order
  special_program    TEXT,               -- the SPI claimed, e.g. 'S' for USMCA
  origin_country     CHAR(2) NOT NULL,
  export_country     CHAR(2),
  manufacturer_id    TEXT,               -- the MID
  melt_pour_country  TEXT,               -- steel: ISO code or 'OTH'; aluminum and copper alike
  adcvd_case_number  TEXT,
  ruling_number      TEXT,
  entered_value      BIGINT NOT NULL CHECK (entered_value >= 0),  -- minor units
  currency           CHAR(3) NOT NULL DEFAULT 'USD',
  quantity           NUMERIC(14, 3),
  uom                TEXT,               -- the HTSUS unit for the number
  UNIQUE (customs_entry_id, line_number)
);

-- The invoice lines behind each entry line, both ways.
CREATE TABLE customs_entry_line_sources (
  customs_entry_line_id UUID NOT NULL REFERENCES customs_entry_lines (id),
  shipment_line_id      UUID NOT NULL REFERENCES shipment_lines (id),
  value_share           BIGINT NOT NULL,  -- the part of the entry line's value from this line
  PRIMARY KEY (customs_entry_line_id, shipment_line_id)
);

-- What CBP and the agencies said, as received.
CREATE TABLE customs_entry_events (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  customs_entry_id UUID NOT NULL REFERENCES customs_entries (id),
  shipment_id      UUID REFERENCES shipments (id),  -- release is per bill
  code             TEXT NOT NULL CHECK (code IN ('accepted', 'rejected', 'release', 'hold',
                     'exam', 'documents_requested', 'pga_may_proceed', 'pga_hold', 'refused',
                     'general_order', 'summary_accepted', 'statement_paid', 'extended',
                     'suspended', 'liquidated', 'reliquidated', 'protest_decided')),
  agency           TEXT NOT NULL DEFAULT 'CBP',
  source_code      TEXT,                 -- the disposition or response code as received
  detail           JSONB NOT NULL DEFAULT '{}',
  occurred_at      TIMESTAMPTZ NOT NULL,
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  document_id      UUID REFERENCES documents (id),  -- the ABI response message
  dedupe_key       TEXT NOT NULL UNIQUE
);
CREATE INDEX ON customs_entry_events (customs_entry_id, occurred_at);

-- Security and manifest filings before arrival, one per filer per shipment.
CREATE TABLE advance_cargo_filings (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  kind            TEXT NOT NULL CHECK (kind IN ('us_isf_10_2', 'us_isf_5', 'us_ams',
                    'us_acas')),
  shipment_id     UUID NOT NULL REFERENCES shipments (id),
  filer_party_id  UUID NOT NULL REFERENCES parties (id),
  customs_bond_id UUID REFERENCES customs_bonds (id),  -- the ISF bond, activity code 16
  transaction_ref TEXT,                  -- the ISF transaction number or manifest reference
  bill_number     TEXT NOT NULL,         -- the bill the filing is keyed to
  data            JSONB NOT NULL,        -- the elements as last transmitted
  lading_due_at   TIMESTAMPTZ,           -- 24 hours before lading, from the schedule
  arrival_due_at  TIMESTAMPTZ,           -- for elements due 24 hours before arrival
  filed_at        TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  status          TEXT NOT NULL CHECK (status IN ('draft', 'filed', 'accepted', 'rejected',
                    'do_not_load', 'cancelled')),
  UNIQUE (kind, filer_party_id, bill_number)
);

-- A daily or periodic monthly statement paying many entries at once.
CREATE TABLE customs_statements (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  filer_party_id    UUID NOT NULL REFERENCES parties (id),
  importer_party_id UUID REFERENCES parties (id),  -- set for an importer's PMS
  kind              TEXT NOT NULL CHECK (kind IN ('daily', 'periodic_monthly')),
  statement_number  TEXT,
  statement_date    DATE NOT NULL,
  payment_method    TEXT NOT NULL CHECK (payment_method IN ('ach_debit', 'ach_credit',
                      'check')),
  amount            BIGINT,              -- as CBP billed it
  currency          CHAR(3) NOT NULL DEFAULT 'USD',
  paid_at           TIMESTAMPTZ,
  status            TEXT NOT NULL CHECK (status IN ('scheduled', 'billed', 'paid',
                      'returned'))
);
ALTER TABLE customs_entries ADD FOREIGN KEY (statement_id) REFERENCES customs_statements (id);

-- Post-summary corrections and protests: changes after the summary, with their clocks.
CREATE TABLE customs_entry_corrections (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  customs_entry_id UUID NOT NULL REFERENCES customs_entries (id),
  kind             TEXT NOT NULL CHECK (kind IN ('post_summary_correction', 'protest',
                     'prior_disclosure', 'reliquidation_request')),
  reason           TEXT NOT NULL,        -- classification, value, origin, program claim
  before_data      JSONB NOT NULL,       -- the lines as they stood
  after_data       JSONB NOT NULL,       -- the lines as corrected or claimed
  duty_change      BIGINT NOT NULL,      -- signed minor units; negative is a refund
  due_by           DATE NOT NULL,        -- the PSC window or the 180-day protest deadline
  filed_at         TIMESTAMPTZ,
  reference        TEXT,                 -- protest number, disclosure reference
  outcome          TEXT CHECK (outcome IN ('accepted', 'rejected', 'granted', 'denied',
                     'partially_granted')),
  decided_at       TIMESTAMPTZ
);

-- Duty and fees are freight charges, tied to the line that produced them.
ALTER TABLE freight_charges
  ADD COLUMN customs_entry_line_id UUID,
  ADD CONSTRAINT freight_charges_customs_entry_line_fk FOREIGN KEY (customs_entry_line_id)
    REFERENCES customs_entry_lines (id) NOT VALID;
CREATE INDEX CONCURRENTLY freight_charges_customs_entry_line_idx
  ON freight_charges (customs_entry_line_id);
ALTER TABLE freight_charges VALIDATE CONSTRAINT freight_charges_customs_entry_line_fk;
```

A broker's morning list is the clocks: summaries due, PSC windows closing, protest deadlines and ISF updates owed before arrival.

```sql
SELECT e.declaration_number, 'entry_summary' AS task, e.summary_due_on AS due
FROM customs_entries e
WHERE e.filer_party_id = $1 AND e.summary_filed_at IS NULL
  AND e.summary_due_on <= CURRENT_DATE + 2
UNION ALL
SELECT e.declaration_number, 'psc_window_closing',
       LEAST((e.entry_time AT TIME ZONE 'America/New_York')::date + 300,
             e.scheduled_liquidation_on - 15)
FROM customs_entries e
WHERE e.filer_party_id = $1 AND e.liquidation_status = 'unliquidated'
  AND EXISTS (SELECT 1 FROM customs_entry_corrections c
              WHERE c.customs_entry_id = e.id AND c.filed_at IS NULL
                AND c.kind = 'post_summary_correction')
UNION ALL
SELECT e.declaration_number, 'protest_deadline', e.protest_due_on
FROM customs_entries e
WHERE e.filer_party_id = $1 AND e.liquidation_status IN ('liquidated', 'deemed')
  AND e.protest_due_on BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
UNION ALL
SELECT a.bill_number, 'isf_update_before_arrival', a.arrival_due_at::date
FROM advance_cargo_filings a
WHERE a.filer_party_id = $1 AND a.kind = 'us_isf_10_2'
  AND a.status IN ('filed', 'accepted') AND a.arrival_due_at > NOW()
  AND (a.data->>'manufacturer_final')::boolean IS NOT TRUE
ORDER BY due;
```

Design notes:

- **An entry is not a shipment.** `customs_entry_shipments` links one entry to the bills it covers and one bill to entries split across it; release events are per bill. Nothing in the core model's shipment changes when the entry does.
- **Entry lines are their own lines.** They are derived from shipment lines but grouped by tariff number, origin and manufacturer; `customs_entry_line_sources` keeps the derivation, so a value correction on an invoice finds every entry line it touched.
- **Clocks are stored at the event that starts them.** `summary_due_on` is computed once from `entry_time` and the federal holiday calendar; `protest_due_on` once from `liquidated_on`. A late-arriving release message recomputes them with a recorded reason.
- **Validate before transmission.** The check digit, the importer number format, the bond in force, the power of attorney, the MID per line, and the program's required Chapter 99 numbers are checked before ABI sees the entry; ABI rejects count against the broker's supervision record.
- **Responses are events.** CBP and agency messages land in `customs_entry_events` with occurred and received times, deduplicated, and the entry's status is derived from them ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)).
- **Duty is accrued, then billed, then paid.** Estimated duty is a `freight_charges` line of kind `duty` at summary; it is scheduled on a statement, paid by ACH, and adjusted by liquidation as a new line, never edited, so the history from estimate to final duty stays readable.

## Auditing

- **Every filing as transmitted,** with the CATAIR record set, the response and its time: ISF and updates, cargo release, entry summary, PSCs, protests.
- **Every line's derivation** from invoice lines, and every tariff number, origin, MID, program claim and value on it.
- **Every clock and its basis:** time of entry, summary due date, statement date, scheduled liquidation, liquidation, protest deadline.
- **Every payment:** the statement it was on, the ACH record, and refunds or bills at liquidation.
- **Every hold and release,** by agency, with the documents requested and supplied.
- **Every correction decision:** the error found, the PSC or prior disclosure chosen, and the duty difference.

## What This Means for the System You Build

- **Model the entry, its lines and its bills separately from the shipment,** linked many to many, with entry lines derived from invoice lines and the derivation kept.
- **Store every clock when its starting event arrives,** in working days where the rule says so, and alert before each one.
- **Treat advance cargo data as filings by each party,** with updates tracked against the 24-hour lading and arrival deadlines.
- **Validate entries before ABI does:** check digit, importer number, authority, bond, MID and program numbers.
- **Fold CBP's and the agencies' responses into status;** never set status by hand.
- **Keep duty as accrued, statement and paid states,** with liquidation adjustments as new lines.
- **Treat every low-value parcel as an entry** since the 2026 de minimis rules, with full line data and a bond.
- **Make the protest deadline the loudest alarm,** because after it a liquidation is final.

## References

**Statutes and regulations**

- [19 U.S.C. 1504: Limitation on liquidation](https://www.law.cornell.edu/uscode/text/19/1504), deemed liquidation, extensions, suspension and refund timing
- [19 U.S.C. 1505: Payment of duties and fees](https://www.law.cornell.edu/uscode/text/19/1505), 30 days to pay a bill or refund an excess deposit after liquidation
- [19 U.S.C. 1514: Protest against decisions of CBP](https://www.law.cornell.edu/uscode/text/19/1514), the 180-day deadline and protestable decisions
- [19 U.S.C. 1592: Penalties for fraud, gross negligence, and negligence](https://www.law.cornell.edu/uscode/text/19/1592), penalty levels and prior disclosure
- [19 CFR 4.7: Inward foreign manifest](https://www.law.cornell.edu/cfr/text/19/4.7), the 24-hour vessel cargo declaration and the bulk exemption
- [19 CFR 24.25: Statement processing](https://www.law.cornell.edu/cfr/text/19/24.25), daily statements, scheduling within 10 working days and ACH payment
- [19 CFR 122.48b: Air cargo advance screening](https://www.law.cornell.edu/cfr/text/19/122.48b), filing before loading and do-not-load instructions
- [19 CFR 141.68: Time of entry](https://www.law.cornell.edu/cfr/text/19/141.68), release and summary filing as the time of entry
- [19 CFR 142.2: Time for filing entry](https://www.law.cornell.edu/cfr/text/19/142.2), 15 calendar days after landing
- [19 CFR 142.12: Entry summary](https://www.law.cornell.edu/cfr/text/19/142.12), 10 working days after the time of entry
- [19 CFR 143.21: Merchandise eligible for informal entry](https://www.law.cornell.edu/cfr/text/19/143.21), the $2,500 threshold and the $250 Chapter 99 carve-out
- [19 CFR 149.2: Importer security filing requirements](https://www.law.cornell.edu/cfr/text/19/149.2), timing by element, FROB and in-bond cargo, and updates
- [19 CFR 149.3: Data elements](https://www.law.cornell.edu/cfr/text/19/149.3), the importer's ten elements
- [19 CFR 113.62: Basic importation and entry bond conditions](https://www.law.cornell.edu/cfr/text/19/113.62), $5,000 liquidated damages for ISF violations

**Government**

- [CBP: Automated Commercial Environment](https://www.cbp.gov/trade/automated), ACE and the Single Window
- [CBP: CATAIR](https://cbp.gov/trade/ace/catair?language_content_entity=en), the ABI chapters and the 2026 drafts
- [CBP: Trade statistics](https://www.cbp.gov/newsroom/stats/trade), fiscal 2026 import value, entry summaries and collections
- [CBP: Form 7501 and instructions (rev. 11/26)](https://www.cbp.gov/document/forms/form-7501-entry-summary-continuation-sheets), entry types, the entry number and check digit, the line definition, mode codes, importer numbers and ABI indicators
- [CBP: Importer Security Filing "10+2"](https://www.cbp.gov/border-security/ports-entry/cargo-security/importer-security-filing-102), the 2009 effective date and consequences of noncompliance
- [CBP: Periodic monthly statement dates for 2025](https://www.cbp.gov/sites/default/files/2024-12/periodic_monthly_statements_due_dates_for_2025_508c_0.pdf), the 11th and 15th workday statement dates
- [CBP: Post-summary corrections](https://www.cbp.gov/trade/programs-administration/entry-summary/post-summary-correction), the 300-day and 15-day windows and the 314-day cycle
- [Federal Register: Indefinite suspension of the de minimis exemption for all modes other than postal, CBP Dec. 26-12 (June 24, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-06-24/pdf/2026-12670.pdf), formal or informal entry for non-postal shipments, Type 86 history and violations
- [Federal Register: Suspension of the de minimis exemption for mail and postal informal entry, CBP Dec. 26-13 (June 24, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-06-24/pdf/2026-12669.pdf), the postal rule and Public Law 119-21's July 1, 2027 repeal
- [CBP: E-commerce FAQs](https://www.cbp.gov/trade/basic-import-export/e-commerce/faqs), the mail informal entry dates, the October 22, 2026 exclusions and the Entry Type 13 bond

**Vendors**

- [Descartes Systems Group: Annual Information Form for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1050140/000110465926026450/dsgx-20260131xex99d1.htm), NetCHB and security filings
- [WiseTech Global: FY26 results (August 26, 2026)](https://announcements.asx.com.au/asxpdf/20260826/pdf/07379lj9h8npgj.pdf), CargoWise
- [WiseTech Global: Completes strategic acquisition of e2open (August 3, 2025)](https://www.wisetechglobal.com/news/wisetech-global-completes-strategic-acquisition-of-e2open/), the completion date
