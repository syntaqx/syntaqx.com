+++
title = "Bills of Lading & eBL"
description = "The ocean transport document: bill of lading or sea waybill, negotiable and straight bills, house and master bills, its life cycle, and electronic bills."
category = "Logistics & Supply Chain Industry"
order = 2812
part = "Ocean and Air"
tags = ["logistics", "ocean", "bill-of-lading", "ebl", "dcsa", "documents-of-title", "data-model"]
+++

An ocean bill of lading is three things at once. It is the carrier's receipt for the goods, with the container numbers, seals, piece count and weights the shipper declared; it is the evidence of the contract of carriage, with the carrier's terms on the back or by reference; and, when it is made out "to order," it is a document of title, so that whoever holds an original, properly endorsed, can demand the goods at destination and can sell them, or pledge them to a bank, while they are at sea. ZIM's 20-F defines a bill of lading as "a document issued by or on behalf of a carrier as evidence of a contract carriage." DCSA counts about 45 million bills issued by ocean carriers a year, of which 1.2% were electronic in 2021.

The software is hard because the document's legal weight depends on details that look cosmetic. Whether a consignee is named or the bill is "to order" decides whether the carrier may deliver to the named party or only against a surrendered original. Whether the bill says "shipped on board" with a date or only "received for shipment" decides whether a bank will pay under a letter of credit. A house bill issued by an NVOCC to its customer and the master bill issued by the line to the NVOCC describe the same container under two contracts, with two shippers and two consignees. And an electronic bill only works as a document of title if the platform can prove one party, and only one, controls it at any moment. This chapter covers the bill of lading and the sea waybill, negotiable and straight bills, house and master bills, the document's life from shipping instructions to surrender, electronic bills of lading and the laws that recognize them, and the tables that hold them. It extends `documents` and `shipments` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model); the booking that precedes the bill is [Ocean Shipping](/books/logistics/ocean-shipping#booking), the NVOCCs that issue house bills are [Freight Forwarders & NVOCCs](/books/logistics/forwarders-and-nvoccs), the liability limits the bill carries are [Cargo Liability & Claims](/books/logistics/cargo-claims#ocean-and-air), and the air waybill is [Air Cargo](/books/logistics/air-cargo).

## How the Carriers and Lawmakers Do It

As of November 2026, the frameworks a transport document system has to satisfy:

| Source | What it governs | The rule, as published |
| --- | --- | --- |
| **DCSA Bill of Lading standard** (eBL API 3.0.0, public) | Shipping instructions and the transport document as data, paper or electronic | `transportDocumentTypeCode` is `BOL` (bill of lading) or `SWB` (sea waybill); `isToOrder` "Indicates whether the B/L is issued `to order` or not" and must be false for a sea waybill; for an electronic bill, each count of originals is one or zero |
| **DCSA member carriers' commitment** (February 15, 2023) | Adoption | MSC, Maersk, CMA CGM, Hapag-Lloyd, ONE, Evergreen, Yang Ming, HMM and ZIM committed to 50% of original bills electronic within five years and 100% by 2030, on DCSA standards |
| **Federal bills of lading law** (49 U.S.C. 80103) | Bills issued by common carriers in the US | A bill is negotiable when it says the goods go to the "order of a consignee" and has no agreement on its face that it is not negotiable; a nonnegotiable bill must say "nonnegotiable" or "not negotiable" |
| **UCC Article 7** (section 7-106) | Electronic documents of title under state law | A person has control when a system reliably establishes it as the person to which the document was issued or transferred; the safe harbor is "a single authoritative copy" that is "unique, identifiable" and unalterable except as permitted |
| **UK Electronic Trade Documents Act 2023** (passed July 20, 2023, in force two months later) | Trade documents under the law of England and Wales | Lists "a bill of lading" among trade documents and treats an electronic one as equivalent when "a reliable system is used" to identify it, protect it from unauthorized alteration, prevent more than one person controlling it, and transfer it |
| **UNCITRAL Model Law on Electronic Transferable Records** | A template for national laws | The model most national eBL laws follow; its adoption list couldn't be opened for this chapter |

<!-- source-gap: logistics-ocean-documents-mletr | missing | the MLETR's adoption date and the list of jurisdictions that have enacted it | closes with: UNCITRAL's MLETR status page opened (it returned 403 to automated fetches) | checked: 2026-11-22 -->
UNCITRAL's status page for the model law refused automated access, so this chapter doesn't list the jurisdictions that have enacted it.

Three patterns:

- **The data and the title are separate problems.** DCSA standardizes what a bill says and how its draft, approval and issuance flow between shipper and carrier; whether an electronic bill is a document of title is a question of law and of the platform's control mechanism. DCSA's own page says it is working "with eBL solution providers on technical and legal interoperability."
- **Law has converged on control.** The UCC's single authoritative copy and the UK Act's reliable system that prevents more than one person controlling the document are the same idea: possession of paper is replaced by exclusive control of a record, and the platform's job is to prove who has it.
- **Most bills don't need to be negotiable.** A sea waybill, or a straight bill to a named consignee, lets the carrier deliver without an original; negotiable bills matter where goods are sold or financed in transit. The system should make the choice explicit at shipping instructions rather than default to originals.

## Bills of Lading and Sea Waybills

A **sea waybill** is a receipt and evidence of the contract, never a document of title: the carrier delivers to the named consignee on identification, and no original has to be presented. A **bill of lading** may be negotiable (to order) or straight (to a named consignee); a straight bill, under the federal statute, must be marked "nonnegotiable" or "not negotiable," and endorsing it neither makes it negotiable nor gives the transferee more rights (49 U.S.C. 80103(b)). DCSA's data model encodes the distinction in two fields and a set of rules:

| Field | Rule in the standard |
| --- | --- |
| `transportDocumentTypeCode` | `BOL` or `SWB` |
| `isToOrder` | True makes the bill negotiable; "Must be `false` for `SWB`" |
| Consignee | "Mandatory for non-negotiable BL (`isToOrder=false`)" |
| Endorsee | "Can only be provided for negotiable BLs (`isToOrder=true`)"; consignee and endorsee "are mutually exclusive" |
| `isElectronic` | Whether "the transport document is electronically transferred"; required on shipping instructions |
| `numberOfOriginalsWithCharges`, `numberOfOriginalsWithoutCharges` | The originals the customer asks for, with and without the freight charges printed; for an electronic bill "accepted value is `1` (one) or `0` (zero)" |
| `isShippedOnBoardType` | Whether the document "is a received for shipment, or shipped on board" |
| `shippedOnBoardDate` | The "Date when the last container that is linked to the transport document is physically loaded onboard the vessel" |

The notify party is not a consignee: under the federal statute, naming a person to be notified of arrival does not limit negotiability (80103(a)(2)). The parties on a DCSA document include the shipper, the consignee or endorsee, notify parties, and other functions with their own codes, among them `SCO` (service contract owner), `DDR` and `DDS` (the consignor's and consignee's freight forwarders), `CS` (consolidator), `MF` (manufacturer) and `WH` (warehouse keeper). Each party carries its structured name and address, and may also carry a `displayedAddress`, "the address of the party to be displayed on the `Transport Document`," which "may be used to match the address provided in the `Letter of Credit`"; if provided it "must be included in the `Transport Document`," in at most 2 lines of 35 characters on a paper bill and 6 on an electronic one. The printed text and the structured party are both kept.

## Negotiable and Straight Bills

A negotiable bill makes the original the key to the cargo. The consignee, or a bank holding the bill under a letter of credit, presents an original properly endorsed; the carrier delivers against it and collects the original as surrendered; the other originals of the set become void. In DCSA's life cycle the surrender is its own state, `SURRENDER_FOR_DELIVERY`, and a booking is `COMPLETED` when "The Transport Document this Booking is connected to has been Surrendered for Delivery." Three consequences for a system:

- **Delivery is gated on surrender, not arrival.** An import under a negotiable bill can sit at the terminal accruing demurrage while the original travels by courier or waits for a bank to be paid. The release from the carrier is a separate event from customs release and from container availability, and [Detention & Demurrage](/books/logistics/detention-and-demurrage#free-time) shows why each needs its own timestamp.
- **Endorsement is a chain.** Each transfer of a negotiable bill (blank endorsement, or to a named endorsee) changes who may demand the goods. On paper the chain is ink on the back; on an eBL platform it is a ledger of transfers, and the system that consumes it should keep each transfer with its time, not only the current holder.
- **Amendment needs the originals back.** Changing an issued negotiable bill means surrendering it first: DCSA's states `PENDING_SURRENDER_FOR_AMENDMENT` and `SURRENDER_FOR_AMENDMENT` exist because the carrier can't change a document of title that someone else holds.

When the original isn't available at destination, carriers commonly deliver against a letter of indemnity from the receiver, or the shipper surrenders the originals at origin so the carrier releases at destination without them (a "telex" or express release). Both are commercial practices set by carriers' terms rather than by a public standard. <!-- source-gap: logistics-ocean-documents-loi-release | missing | carrier practice on letters of indemnity and telex or express release | closes with: two carriers' published bill of lading terms or customer guides describing express release and delivery against a letter of indemnity | checked: 2026-11-22 --> The system records either as an event on the document with the authorizing party and the instrument, because a carrier that delivers without an original is exposed to the true holder.

A bank financing a shipment under a letter of credit usually requires an on-board bill with a shipped-on-board date inside the credit's shipping period, which is why the received-for-shipment and shipped-on-board distinction is a field, not a note. <!-- source-gap: logistics-ocean-documents-lc-onboard | missing | letter of credit requirements for shipped-on-board bills (UCP 600 article 20) | closes with: ICC UCP 600 text or a bank's published documentary credit guide | checked: 2026-11-22 -->

## House and Master Bills

When an NVOCC carries a customer's goods, two bills describe the same container. The line issues a **master** bill to the NVOCC, which is the shipper on it (an NVOCC "is a shipper in its relationship with an ocean common carrier," 46 CFR 515.2); the NVOCC issues a **house** bill to its customer, as carrier. Expeditors' ocean subsidiary, for example, "issues a House Ocean Bill of Lading (HOBL) or a House Sea Waybill to customers as the contract of carriage" as an NVOCC, and when customers contract with the line directly it "acts as an agent of the customer and derives its revenues from handling fees."

| | Master bill | House bill |
| --- | --- | --- |
| Issuer | The ocean carrier | The NVOCC |
| Shipper | The NVOCC, or its origin agent | The actual exporter |
| Consignee | The NVOCC's destination office or agent | The importer, or "to order" |
| Contract | The NVOCC's service contract or tariff with the line | The NVOCC's tariff, NRA or NSA with its customer |
| Cargo | Containers as tendered to the line; for LCL, the consolidated container | The customer's goods: for FCL the whole container, for LCL its pieces in a shared box |
| Released by | The line, to the NVOCC's agent | The NVOCC's agent, to the importer |

For a full container, house and master are one to one and describe the same box; for a consolidation, one master covers many houses, each with its own shipper, consignee, pieces and weight inside a container whose seal and VGM belong to the consolidator. Liability follows each contract separately, so a claim against the NVOCC runs under the house bill and the NVOCC's claim against the line under the master ([Cargo Liability & Claims](/books/logistics/cargo-claims#ocean-and-air) owns the limits). US advance filings follow the same split: the line declares the master and an NVOCC with automated access declares its house bills, as [Import Entry & ACE](/books/logistics/import-entry) describes.

My rule: model house and master as two documents with a parent link, never as two number columns on one record, because each has its own parties, terms, status and surrender, and a consolidation's house bills share one master. The core `shipments.house_bill_number` and `master_bill_number` stay as the identifiers a message carries; the documents behind them are rows.

## The Life of a Transport Document

The document starts as the shipper's **shipping instructions**, sent before the documentation cut-off: parties, cargo descriptions, packages, weights, containers and seals, freight terms, the document type and how many originals. DCSA's shipping instructions are `RECEIVED`, `PENDING_UPDATE` (the carrier has asked for an update) or `COMPLETED` (no longer modifiable, because the transport document has been surrendered for delivery), with updates tracked as `UPDATE_RECEIVED`, `UPDATE_CONFIRMED`, `UPDATE_DECLINED` or `UPDATE_CANCELLED`. The carrier answers with a draft, and the document moves through the states DCSA's eBL 3.0 defines:

| State | Meaning, per the standard |
| --- | --- |
| `DRAFT` | "Transport Document is Drafted," awaiting the shipper's approval |
| `APPROVED` | Approved by the shipper, awaiting issuance |
| `ISSUED` | Issued by the carrier |
| `PENDING_SURRENDER_FOR_AMENDMENT` | Waiting for the holder to surrender it for a change |
| `SURRENDER_FOR_AMENDMENT` | Surrendered so the carrier can amend and reissue |
| `PENDING_SURRENDER_FOR_DELIVERY` | Waiting for surrender at destination |
| `SURRENDER_FOR_DELIVERY` | Surrendered for delivery of the goods |
| `VOID` | Voided |

The shipper's approval of the draft is the last point at which a wrong weight, a misspelled consignee or a missing seal number is cheap to fix. After issuance every correction is an amendment, and for a negotiable bill an amendment needs the originals back. A system should therefore diff each draft against the shipping instructions and the booking, field by field, before the shipper approves.

The transitions are a small state machine, and the guard on each one is what keeps a document of title honest:

```go tab="Go"
type DocState string

const (
	Draft                   DocState = "DRAFT"
	Approved                DocState = "APPROVED"
	Issued                  DocState = "ISSUED"
	PendingSurrenderAmend   DocState = "PENDING_SURRENDER_FOR_AMENDMENT"
	SurrenderedForAmend     DocState = "SURRENDER_FOR_AMENDMENT"
	PendingSurrenderDeliver DocState = "PENDING_SURRENDER_FOR_DELIVERY"
	SurrenderedForDelivery  DocState = "SURRENDER_FOR_DELIVERY"
	Void                    DocState = "VOID"
)

var allowed = map[DocState][]DocState{
	Draft:                   {Approved, Draft, Void},
	Approved:                {Issued, Draft, Void},
	Issued:                  {PendingSurrenderAmend, PendingSurrenderDeliver, Void},
	PendingSurrenderAmend:   {SurrenderedForAmend, Issued},
	SurrenderedForAmend:     {Issued, Void}, // reissued as amended
	PendingSurrenderDeliver: {SurrenderedForDelivery, Issued},
	SurrenderedForDelivery:  {},
}

type TransportDoc struct {
	Type       string // "BOL" or "SWB"
	ToOrder    bool
	Consignee  string
	Endorsee   string
	Originals  int
	Electronic bool
	State      DocState
}

// Validate applies the DCSA data rules before a draft can be approved.
func (d TransportDoc) Validate() error {
	switch {
	case d.Type == "SWB" && d.ToOrder:
		return errors.New("a sea waybill cannot be to order")
	case !d.ToOrder && d.Consignee == "":
		return errors.New("a non-negotiable document needs a consignee")
	case d.Consignee != "" && d.Endorsee != "":
		return errors.New("consignee and endorsee are mutually exclusive")
	case !d.ToOrder && d.Endorsee != "":
		return errors.New("only a negotiable bill has an endorsee")
	case d.Electronic && d.Originals > 1:
		return errors.New("an electronic bill has at most one original")
	}
	return nil
}

func (d *TransportDoc) Move(to DocState) error {
	for _, s := range allowed[d.State] {
		if s == to {
			if to == Approved {
				if err := d.Validate(); err != nil {
					return err
				}
			}
			d.State = to
			return nil
		}
	}
	return fmt.Errorf("transport document cannot move from %s to %s", d.State, to)
}
```

```rust tab="Rust"
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DocState {
    Draft, Approved, Issued, PendingSurrenderAmend, SurrenderedForAmend,
    PendingSurrenderDeliver, SurrenderedForDelivery, Void,
}

use DocState::*;

fn allowed(from: DocState) -> &'static [DocState] {
    match from {
        Draft => &[Approved, Draft, Void],
        Approved => &[Issued, Draft, Void],
        Issued => &[PendingSurrenderAmend, PendingSurrenderDeliver, Void],
        PendingSurrenderAmend => &[SurrenderedForAmend, Issued],
        SurrenderedForAmend => &[Issued, Void], // reissued as amended
        PendingSurrenderDeliver => &[SurrenderedForDelivery, Issued],
        SurrenderedForDelivery | Void => &[],
    }
}

pub struct TransportDoc {
    pub sea_waybill: bool,
    pub to_order: bool,
    pub consignee: Option<String>,
    pub endorsee: Option<String>,
    pub originals: u8,
    pub electronic: bool,
    pub state: DocState,
}

impl TransportDoc {
    /// The DCSA data rules, checked before a draft can be approved.
    pub fn validate(&self) -> Result<(), &'static str> {
        if self.sea_waybill && self.to_order {
            return Err("a sea waybill cannot be to order");
        }
        if !self.to_order && self.consignee.is_none() {
            return Err("a non-negotiable document needs a consignee");
        }
        if self.consignee.is_some() && self.endorsee.is_some() {
            return Err("consignee and endorsee are mutually exclusive");
        }
        if !self.to_order && self.endorsee.is_some() {
            return Err("only a negotiable bill has an endorsee");
        }
        if self.electronic && self.originals > 1 {
            return Err("an electronic bill has at most one original");
        }
        Ok(())
    }

    pub fn move_to(&mut self, to: DocState) -> Result<(), String> {
        if !allowed(self.state).contains(&to) {
            return Err(format!("cannot move from {:?} to {:?}", self.state, to));
        }
        if to == Approved {
            self.validate().map_err(String::from)?;
        }
        self.state = to;
        Ok(())
    }
}
```

The transition table is the carrier's or platform's to enforce; a shipper's or NVOCC's system mirrors it so it can reject an out-of-order notification instead of storing a document that skipped from draft to surrendered ([Make the States Explicit](/docs/building-blocks/workflows#make-the-states-explicit)).

## Electronic Bills of Lading

An eBL replaces the paper original with a record on a platform that tracks who controls it. The carrier issues the bill to the shipper's account on a platform; the shipper transfers control to the buyer or its bank, and onward; the final holder surrenders it to the carrier for delivery. DCSA's standard names the platforms a carrier may issue to, in the field `sendToPlatform`, "Only applicable when `isElectronic=true` and `transportDocumentTypeCode=BOL`": `WAVE` (Wave), `CARX` (CargoX), `ESSD` (EssDOCS), `IDT` (ICE Digital Trade), `BOLE` (Bolero), `EDOX` (EdoxOnline), `IQAX` (IQAX), `SECR` (Secro), `TRGO` (TradeGO), `ETEU` (eTEU), `TRAC` (Enigio trace:original) and `BRIT` (BRITC eBL). A sea waybill needs no platform, because there is no title to control.

The legal test is control, stated almost identically in the US and the UK:

- **UCC 7-106.** A system satisfies the safe harbor if "a single authoritative copy of the document exists which is unique, identifiable," and unalterable except as permitted, identifies the person asserting control as the original recipient or the most recent transferee, is maintained by that person or its custodian, can't have its assignee changed without that person's consent, and marks every copy and unauthorized amendment as such.
- **UK Electronic Trade Documents Act 2023.** An electronic trade document must be held on a reliable system that identifies it, protects it against unauthorized alteration, prevents more than one person from controlling it at once, and allows its transfer; the Act came into force "at the end of the period of two months beginning with the day on which it is passed," July 20, 2023.

Adoption has been slow against the 2030 commitment: DCSA's 2023 announcement put electronic bills at 1.2% of about 45 million a year in 2021 and estimated that full adoption could save $6.5 billion in direct costs. <!-- source-gap: logistics-ocean-documents-ebl-uptake | secondary | the current share of original bills of lading issued electronically (a 2025 figure of 5.7% circulates from a DCSA article) | closes with: a DCSA progress report or member carrier filing stating eBL adoption for 2025 or 2026 | checked: 2026-11-22 --> More recent adoption figures appear only in secondary reports. The reasons are structural: every party in the chain (shipper, buyer, both banks, sometimes an insurer) has to be on a platform the issuing carrier supports, or on one interoperable with it, and the governing law of the bill has to recognize the record.

For a builder the platform is an integration, not the system of record for the shipment. The shipper's or forwarder's system keeps the document's data, its state and its control history as reported by the platform, and treats the platform's record of who controls it as authoritative for title.

## How to Build It

The core `documents` table keeps each bill as exchanged (kinds `ocean_bill_of_lading` and `sea_waybill` exist), and `shipments` carries the bill numbers a message quotes. The transport document as data, with its parties, containers and life cycle, is its own set of tables, shared by house and master bills:

```sql
CREATE TABLE transport_documents (       -- an ocean bill of lading or sea waybill, as data
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  issuer_party_id       UUID NOT NULL REFERENCES parties (id),  -- the carrier or NVOCC
  level                 TEXT NOT NULL CHECK (level IN ('master', 'house')),
  parent_id             UUID REFERENCES transport_documents (id),  -- a house bill's master
  document_type         TEXT NOT NULL CHECK (document_type IN ('bill_of_lading',
                          'sea_waybill')),
  number                TEXT NOT NULL,   -- the transport document reference
  ocean_booking_number  TEXT,            -- the carrier booking it came from (master bills)
  is_to_order           BOOLEAN NOT NULL,
  is_electronic         BOOLEAN NOT NULL,
  ebl_platform          TEXT,            -- DCSA sendToPlatform code, e.g. 'BOLE'
  shipped_on_board      BOOLEAN NOT NULL,  -- false: received for shipment
  shipped_on_board_on   DATE,
  issued_at             TIMESTAMPTZ,
  place_of_issue        TEXT,
  originals_with_charges    SMALLINT NOT NULL DEFAULT 0,
  originals_without_charges SMALLINT NOT NULL DEFAULT 0,
  freight_payment       TEXT CHECK (freight_payment IN ('prepaid', 'collect')),
  terms_ref             TEXT,            -- the carrier's terms version printed or referenced
  status                TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'issued',
                          'pending_surrender_for_amendment', 'surrender_for_amendment',
                          'pending_surrender_for_delivery', 'surrender_for_delivery',
                          'void')),
  version               INT NOT NULL DEFAULT 1,  -- a reissue after amendment is a new version
  document_id           UUID REFERENCES documents (id),  -- the issued document as exchanged
  UNIQUE (issuer_party_id, number, version),
  CHECK (document_type <> 'sea_waybill' OR NOT is_to_order),
  CHECK (ebl_platform IS NULL OR (is_electronic AND document_type = 'bill_of_lading')),
  CHECK (NOT is_electronic OR (originals_with_charges <= 1 AND originals_without_charges <= 1)),
  CHECK (level = 'house' OR parent_id IS NULL),  -- a house may wait for its master
  CHECK (NOT shipped_on_board OR shipped_on_board_on IS NOT NULL)
);

CREATE TABLE transport_document_parties (  -- parties as structured and as printed
  transport_document_id UUID NOT NULL REFERENCES transport_documents (id),
  function              TEXT NOT NULL CHECK (function IN ('shipper', 'consignee', 'endorsee',
                          'notify', 'issuer', 'service_contract_owner', 'consignor_forwarder',
                          'consignee_forwarder', 'consolidator', 'manufacturer',
                          'warehouse_keeper', 'invoice_payer')),
  sequence              SMALLINT NOT NULL DEFAULT 1,  -- notify parties can repeat
  party_id              UUID REFERENCES parties (id),  -- null when only printed text is known
  displayed_name        TEXT NOT NULL,   -- the party name as printed (DCSA partyName, 70 characters)
  displayed_address     TEXT[],          -- DCSA displayedAddress: 2 lines of 35 on paper, 6 on an eBL
  PRIMARY KEY (transport_document_id, function, sequence)
);

CREATE TABLE transport_document_equipment (  -- containers, seals and cargo on the bill
  transport_document_id UUID NOT NULL REFERENCES transport_documents (id),
  equipment_id          UUID NOT NULL REFERENCES equipment_units (id),
  seal_numbers          TEXT[] NOT NULL DEFAULT '{}',
  packages              INT NOT NULL CHECK (packages > 0),  -- a liability field under COGSA
  package_kind          TEXT NOT NULL,   -- as described: 'cartons', 'pallets'
  cargo_gross_weight_g  BIGINT NOT NULL CHECK (cargo_gross_weight_g > 0),
  volume_cm3            BIGINT,
  description           TEXT NOT NULL,   -- as printed
  hs_codes              TEXT[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (transport_document_id, equipment_id)
);

CREATE TABLE transport_document_events (  -- every transition and transfer, append-only
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  transport_document_id UUID NOT NULL REFERENCES transport_documents (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('si_received', 'si_update_requested',
                          'draft_issued', 'approved', 'issued', 'endorsed', 'transferred',
                          'surrender_requested', 'surrendered', 'amended', 'released',
                          'released_without_original', 'voided')),
  from_party_id         UUID REFERENCES parties (id),  -- for transfers and endorsements
  to_party_id           UUID REFERENCES parties (id),
  authority_document_id UUID REFERENCES documents (id),  -- the LOI or release instruction
  source_code           TEXT,            -- DCSA shipmentEventTypeCode or platform event, as received
  occurred_at           TIMESTAMPTZ NOT NULL,
  received_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dedupe_key            TEXT NOT NULL UNIQUE
);

ALTER TABLE shipments
  ADD COLUMN transport_document_id UUID REFERENCES transport_documents (id);
  -- the bill this shipment moves under: the house bill for an NVOCC's customer

ALTER TABLE documents
  ADD COLUMN transport_document_id UUID REFERENCES transport_documents (id);

CREATE INDEX CONCURRENTLY transport_documents_parent_idx ON transport_documents (parent_id);
CREATE INDEX CONCURRENTLY transport_document_events_doc_idx
  ON transport_document_events (transport_document_id, occurred_at);
CREATE INDEX CONCURRENTLY shipments_transport_document_idx
  ON shipments (transport_document_id);
```

An import desk's question at a vessel's arrival, which house bills under masters on this voyage are still waiting for a surrendered original, reads:

```sql
SELECT h.number AS house_bill, m.number AS master_bill, h.status,
       (SELECT max(occurred_at) FROM transport_document_events e
         WHERE e.transport_document_id = h.id) AS last_event_at
FROM transport_documents h
JOIN transport_documents m ON m.id = h.parent_id
WHERE h.issuer_party_id = $1               -- the NVOCC
  AND m.ocean_booking_number = ANY($2)     -- bookings on the arriving voyage
  AND h.is_to_order
  AND h.status IN ('issued', 'pending_surrender_for_delivery')
ORDER BY m.number, h.number;
```

Design notes:

- **House and master are rows, linked.** `parent_id` joins a house bill to its master; one master can carry many houses in a consolidation, and each has its own parties, status and surrender. The number columns on `shipments` stay for matching messages.
- **Printed text is kept beside structured parties.** A bill prints the party as the shipper asked (a displayed address of up to 2 lines of 35 characters on paper and 6 on an eBL, in DCSA's model), and the printed text is what a bank compares against the letter of credit; the party row is what the system matches on. Neither replaces the other.
- **An amendment is a new version.** After issuance a change produces a reissued document with a higher `version`; the earlier version stays, because it may already be in a bank's hands or on a platform.
- **Title is the platform's, data is yours.** For an eBL, store each transfer and endorsement as reported by the platform in `transport_document_events`, and treat the platform's current controller as authoritative; the system's own record proves what it was told and when.
- **Package counts are liability fields.** `packages` on each container line is what a per-package limit is counted on, so it is validated against the booking and the shipping instructions before approval.
- **Release without an original is an event with an authority.** `released_without_original` points at the letter of indemnity or release instruction that justified it.
- **Emit the document events.** `transport_document.drafted`, `transport_document.approved`, `transport_document.issued`, `transport_document.transferred`, `transport_document.surrendered` and `cargo.released` are what billing, customs filing, the dray planner and customer notifications subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every version of every bill,** with the shipping instructions and drafts that led to it, so a disputed weight or consignee can be traced to whoever supplied it.
- **Every transfer, endorsement and surrender,** with the parties and times, and for an eBL the platform's own record of each.
- **Every release,** with the party released to, the original or instrument it was released against, and who authorized a release without an original.
- **The issued document as exchanged,** with its hash, in `documents` ([Audit Trails](/docs/building-blocks/audit-trails)).

## What This Means for the System You Build

- **Make negotiability an explicit choice** at shipping instructions, and validate the DCSA rules (no sea waybill to order, consignee or endorsee but not both) before approval.
- **Model house and master bills as linked documents,** each with its own parties, terms and life cycle.
- **Keep printed text and structured parties side by side.**
- **Diff every draft against the booking and the instructions** before the shipper approves it.
- **Gate delivery on surrender or a recorded release,** not on vessel arrival.
- **Treat an amendment as a new version** and keep the old one.
- **Integrate eBL platforms as the source of title,** recording every transfer they report.

## References

**Statutes and regulations**

- [49 U.S.C. 80103: Negotiable and nonnegotiable bills](https://www.law.cornell.edu/uscode/text/49/80103), order bills, the "nonnegotiable" marking and notify parties
- [UCC 7-106: Control of electronic document of title](https://www.law.cornell.edu/ucc/7/7-106), the control test and the single authoritative copy safe harbor
- [UK Electronic Trade Documents Act 2023](https://www.legislation.gov.uk/ukpga/2023/38/enacted), bills of lading as trade documents, the reliable system conditions and commencement two months after July 20, 2023
- [46 CFR 515.2: Definitions](https://www.law.cornell.edu/cfr/text/46/515.2), an NVOCC as a shipper in its dealings with an ocean common carrier

**Filings**

- [ZIM Integrated Shipping Services: Form 20-F for 2025](https://www.sec.gov/Archives/edgar/data/1654126/000117891326000784/zk2634463.htm), the bill of lading definition
- [Expeditors International: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/746515/000119312526071569/expd-20251231.htm), house ocean bills and sea waybills issued as an NVOCC, and acting as agent for direct carrier contracts

**Standards**

- [DCSA: eBL API 3.0.0](https://api.swaggerhub.com/apis/dcsaorg/DCSA_EBL/3.0.0), document types, to order, consignee and endorsee rules, originals, electronic flag, on-board type, displayed names and addresses, party functions, eBL platform codes, shipping instruction and transport document statuses
- [DCSA: Booking API 2.0.0](https://api.swaggerhub.com/apis/dcsaorg/DCSA_BKG/2.0.0), the booking completed on surrender for delivery
- [DCSA: Bill of Lading standard](https://dcsa.org/standards/bill-of-lading), interoperability work with eBL providers
- [DCSA: Member carriers commit to a fully standardised eBL by 2030 (February 15, 2023)](https://dcsa.org/newsroom/dcsas-member-carriers-commit-to-a-fully-standardised-electronic-bill-of-lading-by-2030), the nine carriers, the 50% and 100% targets, 45 million bills a year, 1.2% electronic in 2021 and the $6.5 billion estimate
