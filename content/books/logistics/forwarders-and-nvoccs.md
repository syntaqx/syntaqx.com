+++
title = "Freight Forwarders & NVOCCs"
nav_title = "Forwarders & NVOCCs"
description = "International freight intermediaries: FMC licensing and bonds, NVOCC tariffs, NRAs and NSAs, consolidation, house bills, forwarder systems and the large firms."
category = "Logistics & Supply Chain Industry"
order = 2814
part = "Ocean and Air"
tags = ["logistics", "ocean", "air", "freight-forwarding", "nvocc", "fmc", "consolidation", "data-model"]
+++

A freight forwarder sells international freight without owning ships or aircraft. It buys space from ocean lines and airlines on contracts and allocations, sells it to shippers at its own rates, consolidates small shipments into full containers and pallets, issues its own house bills as the carrier of record or books on the line's bill as the shipper's agent, and usually files the customs entry at destination too. Expeditors, one of the largest, says it does "not own aircraft or ships" and earned $11.07 billion in 2025 (the sum of its three service lines) across airfreight ($3.98 billion), ocean ($2.81 billion) and customs brokerage and other services ($4.27 billion); C.H. Robinson's Global Forwarding segment provides "ocean freight services, air freight services, and customs brokerage." In US ocean law the forwarder is two regulated businesses, the ocean freight forwarder and the non-vessel-operating common carrier (NVOCC), both licensed by the FMC; in air it is an indirect air carrier under TSA; and on US roads it is a third thing again.

The software is hard because one forwarder's job is a stack of contracts in both directions. The customer's quote or negotiated rate arrangement prices the house shipment; the line's service contract prices the master; the origin agent, the destination agent, the trucker, the consolidation warehouse and the customs broker each send their own bills; and the house shipments in one container or one air consolidation share a master bill, a seal, a VGM and its detention, but each has its own customer, terms and documents. A forwarder's system has to keep those apart line by line and still know which house shipments a delay on one master touches. This chapter covers the regulated roles, FMC licensing and financial responsibility, NVOCC pricing (tariffs, negotiated rate arrangements and service arrangements), consolidation and house bills, forwarder systems, and the tables that hold licenses, rate arrangements and consolidations. It extends `parties`, `shipments` and `documents` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model); the documents themselves are [Bills of Lading & eBL](/books/logistics/ocean-documents#house-and-master-bills), air consolidation and the indirect air carrier's screening duties are [Air Cargo](/books/logistics/air-cargo), the customs broker license is Customs Brokers & Bonds, and the FMC bond as a surety product is the Insurance volume's [Surety](/books/insurance/surety#bond-types).

## How the Forwarders Do It

As of November 2026, from 2025 annual reports:

| Forwarder | Regulated roles, as the filing states them | Scale (2025) | Systems and model |
| --- | --- | --- | --- |
| **C.H. Robinson** (Global Forwarding) | Regulated by the FMC "as an ocean transportation intermediary" as freight forwarder and NVOCC; a certified indirect air carrier; customs brokers licensed by CBP | Company-wide adjusted gross profit of $432.9 million in ocean (down from $520.0 million), $136.7 million in air and $132.8 million in customs | "We consolidate shipments, determine routing, select ocean carriers, contract for ocean shipments" |
| **DSV, Kuehne+Nagel** | Not opened | Not opened | Not opened |
| **Expeditors** | An "indirect air carrier" under TSA, with IATA-licensed overseas offices; NVOCC and OTI through Expeditors International Ocean; licensed customs broker | Revenue $11.07 billion: airfreight $3.98 billion (up 9%, tonnage up 6%), ocean $2.81 billion (down 11%, containers up 1%), customs and other $4.27 billion; 172 district offices and about 19,800 employees | "Not dependent on third parties for developing or enhancing our core transportation technology platforms"; $192 million of short-term commitments "reserving space on a guaranteed basis" |
| **Landstar** | IAC for air, FMC-licensed OTI as NVOCC and ocean freight forwarder, a licensed customs broker | Air and ocean "5% of consolidated revenue" | An agent-led network that is mostly trucking |

<!-- source-gap: logistics-forwarders-dsv-kn | missing | DSV and Kuehne+Nagel 2025 volumes (sea TEU, air tonnes), revenue and the DB Schenker acquisition completion date | closes with: DSV and Kuehne+Nagel 2025 annual reports opened (investor sites refused automated fetches) | checked: 2026-11-22 -->
DSV and Kuehne+Nagel, the two largest European forwarders, publish their figures in annual reports their investor sites wouldn't serve for this chapter, so they appear without numbers.

Three patterns:

- **One company holds every license.** Expeditors, C.H. Robinson and Landstar each hold an FMC OTI license, act as an indirect air carrier and file customs entries. A forwarder's party record carries several regulated identities, each with its own number, bond, renewal and regulator, and a customer may contract with one legal entity for ocean and another for customs.
- **Principal on the house, agent elsewhere.** As an NVOCC, Expeditors issues "House Ocean Bills of Lading or House Sea Waybills" and is the carrier to its customer; when customers contract with the line directly it "acts as their agent" and earns handling fees. Expeditors recognizes the sell rate as revenue and the buy rate as an operating expense when it acts "as an indirect carrier," and treats duties it advances for customers as a "pass through," not revenue ([Accounting](/docs/money/accounting#asc-606-and-ifrs-15-in-five-steps)). The same shipment can be principal for freight and agent for customs.
- **The forwarder buys capacity ahead of the customer.** Expeditors' guaranteed space reservations and C.H. Robinson's ocean contracts are commitments made before the house shipments exist, which is why a forwarder's margin moves with carrier rates (C.H. Robinson's ocean adjusted gross profit fell about 17% in 2025, my division) and why it needs to see its committed allocations against its booked house volume.

## Who Is Who

The word "forwarder" covers four regulated roles that a system has to tell apart:

| Role | Regulator and source | What it does | Its own document |
| --- | --- | --- | --- |
| **Ocean freight forwarder (OFF)** | FMC, 46 CFR 515 | In the US, "dispatches shipments" via a common carrier and "books or otherwise arranges space for those shipments on behalf of shippers," and processes the documentation (515.2) | None as carrier; it works on the line's or an NVOCC's bill |
| **NVOCC** | FMC, 46 CFR 515 (licensed in the US, or registered if foreign) | Provides ocean transportation without operating vessels: "purchasing transportation services from a common carrier and offering such services for resale," issuing bills of lading, leasing containers (515.2) | The house bill of lading or sea waybill |
| **Indirect air carrier (IAC)** | TSA | Consolidates and tenders air cargo under a TSA-approved security program renewed annually; Air Cargo covers screening | The house air waybill |
| **Freight forwarder (US domestic)** | FMCSA, 49 U.S.C. 13102(8) | Holds itself out to the public, "assembles and consolidates" shipments and "assumes responsibility for the transportation from the place of receipt to the place of destination," using a regulated carrier | Its own bill as carrier |

Freight forwarding services, in the FMC's definition, are "the dispatching of shipments on behalf of others, in order to facilitate shipment by a common carrier": booking space, preparing export documents, arranging warehousing and cargo insurance, advising on letters of credit (515.2). An ocean freight forwarder's income comes from a **freight forwarding fee** charged to the shipper, consignee, seller or buyer, and from **compensation**, "payment by a common carrier to a freight forwarder for the performance of services" (515.2). An NVOCC's income is the spread between its sell rate and its buy rate plus its own charges. An NVOCC is "a shipper in its dealings with an ocean common carrier" (515.2), so on the master bill the NVOCC is the shipper and on the house bill it is the carrier, which is the split [House and Master Bills](/books/logistics/ocean-documents#house-and-master-bills) models.

The US domestic freight forwarder is a different creature: registered with FMCSA, it keeps financial security on the terms FMCSA's 2023 rule set for brokers and forwarders alike (Broker and Freight Forwarder Financial Responsibility, effective January 16, 2024). Operating Authority & Registration covers its FF number.

## FMC Licensing and Financial Responsibility

"No person in the United States may advertise, hold oneself out, or act as an ocean transportation intermediary" without an FMC license (46 CFR 515.3(a)), where a person is in the United States if resident in, or incorporated or established under, US law (515.3(b)). An NVOCC whose primary place of business is outside the United States may register instead of becoming licensed, posting financial responsibility and publishing a tariff (515.2). Licensing turns on a **qualifying individual**, who must have "a minimum of three (3) years' experience in ocean transportation intermediary activities in the United States" (for a foreign-based NVOCC, experience abroad in US trades counts), and on the applicant's character, for which the FMC may review shipping-law violations, unlicensed activity, criminal records, unresolved bankruptcies, tax liens and judgments, and customs broker license actions (515.11).

Each OTI must show financial responsibility, by bond, insurance or other surety, covering its "transportation-related activities" (46 CFR 515.21):

| Kind | Amount |
| --- | --- |
| Ocean freight forwarder | $50,000 |
| NVOCC (licensed) | $75,000 |
| Registered NVOCC (foreign, not licensed) | $150,000 |
| A group of OTIs under one filing | The lesser of each member's amount or $3,000,000 in aggregate |

A system that onboards an NVOCC as a vendor (a forwarder co-loading with another, a shipper using several) checks the license or registration, its kind, and that its financial responsibility is in effect, and rechecks on a schedule, the same way Carrier Onboarding & Vetting treats a motor carrier's authority. My rule: store the license as a record with its regulator, number, kind, status and the date it was last verified, never as a free-text field on the party, because one party can hold an FMC license, a TSA IAC approval and a customs broker license at once, each lapsing on its own schedule.

## How an NVOCC Prices Freight

An NVOCC prices a customer's shipment in one of three ways:

- **Its published tariff.** The default under the Shipping Act, with rules and rates published electronically.
- **A negotiated rate arrangement (NRA).** Under 46 CFR 532, an NVOCC that holds a license or registration, has its financial responsibility in place and follows the part's conditions is exempt from publishing the rate. The NRA must be "in writing," name the parties, and be agreed by both before the NVOCC receives the cargo; acceptance can be a signed agreement, an email, or booking after receiving the terms if the NVOCC's terms carry the required notice in bold capitals. It must state the rate, the terms and the shipments it covers, and if the rate isn't all-in, whether surcharges, accessorials or ocean carrier general rate increases apply; where no amount is stated for a pass-through charge, the NVOCC may bill only its actual cost, without markup. An NRA can be amended after the first shipment, but the change applies only to shipments not yet received (532.5). An NVOCC whose license, bond or registration lapses "shall not be eligible to invoke this exemption" (532.2).
- **An NVOCC service arrangement (NSA).** "A written contract, other than a bill of lading or receipt," between NSA shippers and an NVOCC, in which the shipper commits to a minimum quantity or portion of its cargo or freight revenue over a fixed period and the NVOCC to a rate and a service level (46 CFR 531.3); the shipper can be a cargo owner, a shippers' association or another OTI that "accepts responsibility for payment of all applicable charges." It is the NVOCC's equivalent of the line's service contract ([Carriers, Alliances and Services](/books/logistics/ocean-shipping#carriers-alliances-and-services)).

The NRA's timing rule is the one a system enforces, because a rate agreed after the cargo was received isn't an NRA:

```go tab="Go"
type NRA struct {
	ID          string
	AcceptedAt  time.Time // signature, email, or booking after the terms were sent
	Acceptance  string    // "signature", "email", "booking_after_terms"
	BookingNoticeShown bool // the bold, all-caps notice, required for booking acceptance
	Origin, Destination string
	Commodity   string
	ValidFrom, ValidTo time.Time
	AllIn       bool
	PassThroughs map[string]int64 // stated amounts, minor units; absent means at cost
	Amendments  []NRAAmendment
}

type NRAAmendment struct {
	AcceptedAt time.Time
	Rate       int64
}

type HouseShipment struct {
	CargoReceivedAt     time.Time
	Origin, Destination string
	Commodity           string
}

// RateFor returns the NRA rate that governs the shipment, or an error if the
// NRA cannot price it under 46 CFR 532.5.
func (n NRA) RateFor(s HouseShipment, baseRate int64) (int64, error) {
	if n.Acceptance == "booking_after_terms" && !n.BookingNoticeShown {
		return 0, errors.New("booking acceptance needs the required notice in the terms")
	}
	if !n.AcceptedAt.Before(s.CargoReceivedAt) {
		return 0, errors.New("NRA accepted after the cargo was received")
	}
	if s.Origin != n.Origin || s.Destination != n.Destination || s.Commodity != n.Commodity {
		return 0, errors.New("shipment outside the NRA's scope")
	}
	if s.CargoReceivedAt.Before(n.ValidFrom) || s.CargoReceivedAt.After(n.ValidTo) {
		return 0, errors.New("cargo received outside the NRA's validity")
	}
	rate := baseRate
	for _, a := range n.Amendments { // an amendment governs only cargo received after it
		if a.AcceptedAt.Before(s.CargoReceivedAt) {
			rate = a.Rate
		}
	}
	return rate, nil
}
```

```rust tab="Rust"
use chrono::{DateTime, Utc};

pub enum Acceptance { Signature, Email, BookingAfterTerms { notice_shown: bool } }

pub struct NraAmendment { pub accepted_at: DateTime<Utc>, pub rate: i64 }

pub struct Nra {
    pub accepted_at: DateTime<Utc>,
    pub acceptance: Acceptance,
    pub origin: String,
    pub destination: String,
    pub commodity: String,
    pub valid_from: DateTime<Utc>,
    pub valid_to: DateTime<Utc>,
    pub base_rate: i64,                // minor units
    pub amendments: Vec<NraAmendment>, // in acceptance order
}

pub struct HouseShipment {
    pub cargo_received_at: DateTime<Utc>,
    pub origin: String,
    pub destination: String,
    pub commodity: String,
}

/// The rate the NRA sets for this shipment under 46 CFR 532.5, or why it can't.
pub fn rate_for(n: &Nra, s: &HouseShipment) -> Result<i64, &'static str> {
    if let Acceptance::BookingAfterTerms { notice_shown: false } = n.acceptance {
        return Err("booking acceptance needs the required notice in the terms");
    }
    if n.accepted_at >= s.cargo_received_at {
        return Err("NRA accepted after the cargo was received");
    }
    if s.origin != n.origin || s.destination != n.destination || s.commodity != n.commodity {
        return Err("shipment outside the NRA's scope");
    }
    if s.cargo_received_at < n.valid_from || s.cargo_received_at > n.valid_to {
        return Err("cargo received outside the NRA's validity");
    }
    // An amendment governs only cargo received after it was agreed.
    Ok(n.amendments
        .iter()
        .filter(|a| a.accepted_at < s.cargo_received_at)
        .last()
        .map_or(n.base_rate, |a| a.rate))
}
```

The cargo-received time is the event that decides, so it comes from the warehouse receipt or the gate-in, not from the booking date, and the NRA version used is stored on the house shipment's charges ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).

## Consolidation

Consolidation is the forwarder's craft: combining many customers' shipments into one container or one air pallet so each pays for its share of a unit the line or airline sells whole.

- **LCL consolidation.** The NVOCC receives several shippers' cargo at a container freight station (DCSA's receipt type `CFS`), stuffs a container for one destination, books it with the line as FCL on a master bill with itself as shipper, and issues a house bill to each shipper; at destination its agent strips the container at a CFS and releases each house shipment. The container's seal and VGM are the consolidator's; each house shipment has its own pieces, weight and volume inside it.
- **Co-loading.** An NVOCC without enough cargo for a box on a lane tenders its LCL to another NVOCC's consolidation. The first NVOCC is then a shipper to the second (an NVOCC that "accepts responsibility for all applicable charges" is a shipper under 515.2), and three bills describe the same cargo: the customer's house bill, the co-loader's bill to the first NVOCC, and the line's master.
- **Buyer's consolidation.** For an importer buying from many suppliers in one origin, the forwarder receives each supplier's goods against the buyer's purchase orders and ships them together as FCL, so the house shipments share one consignee and the value is in fewer, fuller containers and one customs entry.
- **Air consolidation.** An IAC tenders many house air waybills under one master air waybill, often built onto its own ULDs; [Air Cargo](/books/logistics/air-cargo) covers the messages.

A consolidation has a life of its own: it is planned against a cut-off, receives shipments until it closes, is stuffed and sealed, sails or flies under one master, and is deconsolidated at destination. Every cost on the master (ocean or air freight, terminal handling, detention on the box, a customs exam of the whole container) has to be allocated to the house shipments on a stated basis, usually volume or chargeable weight, and every delay on the master is a delay on every house. That is the forwarder's version of the core split between shipment and load: the house shipment is a `shipments` row, the consolidation is what rides the `loads` row.

## Forwarder Systems

Forwarders run on an operational platform that holds the job (the house shipment and its master), the rates, the documents, the accounting by job, and the customs filings, with integrations to carriers, agents and customs. As of November 2026, alphabetically:

| System | Publisher | What it says it does |
| --- | --- | --- |
| **CargoWise** | WiseTech Global | A forwarding and customs platform; CargoWise revenue grew 11% to $756.9 million in WiseTech's fiscal year ended June 30, 2026, inside group revenue of $1,395.9 million that includes e2open (acquired August 2025), with more than 95% of CargoWise customers on its new Value Packs commercial model |
| **Descartes** (Broker & Forwarder Enterprise Systems) | Descartes Systems Group | OneView Forwarder Enterprise and Customs House Brokerage, to "coordinate air, truck and ocean import/export shipments" with customs and security filings, Rate Builder to manage "a global rate network," ocean tariff compliance with FMC rules, and manifest filing for forwarders and NVOCCs, on a network "more than 160 countries" wide |
| **In-house platforms** | Expeditors and other large forwarders | Expeditors builds its own core platforms rather than depending on third parties |
| **Magaya** | Magaya | A freight management platform for forwarders and customs brokers, with built-in warehouse management, rate management, a branded customer portal and "an ACE-certified ABI solution," at "2,300+ Magaya customers in 100+ countries" |

The domain they share is consistent: a job or file number per house shipment, a consolidation or master record above it, a rate sheet per lane and customer, a document set per shipment, and job costing that matches every payable (line, airline, agent, trucker, warehouse) to the job's receivables. Agent networks matter as much as software: a forwarder without its own office at origin or destination works through an agent who issues or releases its bills and bills it back, so agent relationships and agent invoices are first-class records. <!-- source-gap: logistics-forwarders-agent-networks | missing | how forwarder agent networks settle with each other (profit share, agent invoices) | closes with: a published forwarder network's settlement rules or a forwarder's filing describing agent arrangements | checked: 2026-11-22 --> How agent networks settle with each other isn't published in a form this chapter could cite.

## How to Build It

A forwarder's house shipment is a `shipments` row it owns (`owner_party_id`), with its customer as shipper or consignee and itself on the house bill; the master is the line's or airline's bill on a separate shipment it books as shipper; and the consolidation joins them. The tables add regulated identities, rate arrangements and consolidations. All `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE TABLE forwarder_licenses (        -- a regulated identity a party holds
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id         UUID NOT NULL REFERENCES parties (id),
  regulator        TEXT NOT NULL CHECK (regulator IN ('fmc', 'tsa', 'fmcsa', 'iata', 'other')),
  kind             TEXT NOT NULL CHECK (kind IN ('ocean_freight_forwarder', 'nvocc_licensed',
                     'nvocc_registered', 'indirect_air_carrier', 'domestic_freight_forwarder',
                     'iata_cargo_agent', 'other')),
  number           TEXT NOT NULL,         -- the regulator's license, registration or approval number
  financial_responsibility BIGINT,        -- minor units, as filed (46 CFR 515.21 for OTIs)
  currency         CHAR(3),
  surety_party_id  UUID REFERENCES parties (id),
  group_filing_ref TEXT,                  -- a group bond covering several OTIs
  qualifying_individual TEXT,             -- FMC: the named QI
  status           TEXT NOT NULL CHECK (status IN ('active', 'pending', 'suspended',
                     'revoked', 'expired')),
  valid_during     TSTZRANGE NOT NULL,
  verified_at      TIMESTAMPTZ,           -- last check against the regulator's list
  evidence_document_id UUID REFERENCES documents (id),
  UNIQUE (regulator, kind, number),
  CHECK (financial_responsibility IS NULL OR currency IS NOT NULL)
);

CREATE TABLE nvocc_rate_arrangements (   -- an NRA or NSA with a customer, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  nvocc_party_id     UUID NOT NULL REFERENCES parties (id),
  customer_party_id  UUID NOT NULL REFERENCES parties (id),
  kind               TEXT NOT NULL CHECK (kind IN ('nra', 'nsa')),
  number             TEXT NOT NULL,
  version            INT NOT NULL DEFAULT 1 CHECK (version > 0),  -- amendments are versions
  acceptance         TEXT NOT NULL CHECK (acceptance IN ('signature', 'email',
                       'booking_after_terms')),
  booking_notice_shown BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_at        TIMESTAMPTZ NOT NULL,  -- must precede cargo receipt for every shipment
  all_in             BOOLEAN NOT NULL,
  surcharges_apply   BOOLEAN NOT NULL,     -- stated when not all-in
  carrier_gri_applies BOOLEAN NOT NULL,
  minimum_commitment JSONB,                -- NSA: quantity or revenue and period
  rate_agreement_id  UUID NOT NULL REFERENCES rate_agreements (id),  -- lanes and rates
  valid_during       TSTZRANGE NOT NULL,
  document_id        UUID REFERENCES documents (id),  -- the signed NRA or the email
  UNIQUE (nvocc_party_id, number, version),
  CHECK (acceptance <> 'booking_after_terms' OR booking_notice_shown),
  CHECK (kind <> 'nsa' OR minimum_commitment IS NOT NULL)
);

CREATE TABLE consolidations (            -- many house shipments under one master
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  consolidator_party_id UUID NOT NULL REFERENCES parties (id),
  mode                 TEXT NOT NULL CHECK (mode IN ('ocean', 'air')),
  kind                 TEXT NOT NULL CHECK (kind IN ('lcl', 'buyers_consolidation',
                         'co_load', 'air_consolidation')),
  number               TEXT NOT NULL,    -- the consolidator's own reference
  master_shipment_id   UUID REFERENCES shipments (id),  -- booked with the line or airline
  load_id              UUID REFERENCES loads (id),      -- the ocean or air leg it rides
  equipment_id         UUID REFERENCES equipment_units (id),  -- the container or ULD
  origin_facility_id   UUID NOT NULL REFERENCES facilities (id),  -- the CFS or warehouse
  destination_facility_id UUID REFERENCES facilities (id),
  closes_at            TIMESTAMPTZ,      -- receiving cut-off for house shipments
  allocation_basis     TEXT NOT NULL CHECK (allocation_basis IN ('volume', 'weight',
                         'chargeable_weight', 'revenue_ton', 'pieces')),
  status               TEXT NOT NULL CHECK (status IN ('planning', 'receiving', 'closed',
                         'stuffed', 'in_transit', 'arrived', 'deconsolidated', 'cancelled')),
  UNIQUE (consolidator_party_id, number)
);

CREATE TABLE consolidation_shipments (   -- the house shipments inside, with their share
  consolidation_id UUID NOT NULL REFERENCES consolidations (id),
  shipment_id      UUID NOT NULL REFERENCES shipments (id),  -- a house shipment
  received_at      TIMESTAMPTZ,          -- cargo receipt at the CFS: decides the NRA
  volume_cm3       BIGINT CHECK (volume_cm3 > 0),
  weight_g         BIGINT CHECK (weight_g > 0),
  pieces           INT CHECK (pieces > 0),
  share_bp         INT CHECK (share_bp BETWEEN 0 AND 10000),  -- allocation share, basis points
  PRIMARY KEY (consolidation_id, shipment_id)
);

ALTER TABLE shipments
  ADD COLUMN nvocc_rate_arrangement_id UUID,  -- the NRA or NSA that priced a house shipment
  ADD COLUMN forwarding_role TEXT;            -- how the owner acts on this shipment
ALTER TABLE shipments ADD CONSTRAINT shipments_nvocc_rate_arrangement_fkey
  FOREIGN KEY (nvocc_rate_arrangement_id) REFERENCES nvocc_rate_arrangements (id) NOT VALID;
ALTER TABLE shipments ADD CONSTRAINT shipments_forwarding_role_check
  CHECK (forwarding_role IS NULL OR forwarding_role IN ('principal_nvocc', 'principal_iac',
    'agent_forwarder', 'master_shipper')) NOT VALID;

ALTER TABLE documents
  ADD COLUMN consolidation_id UUID REFERENCES consolidations (id);  -- manifests, load plans

CREATE INDEX CONCURRENTLY consolidation_shipments_shipment_idx
  ON consolidation_shipments (shipment_id);
CREATE INDEX CONCURRENTLY forwarder_licenses_party_idx ON forwarder_licenses (party_id);
ALTER TABLE shipments VALIDATE CONSTRAINT shipments_nvocc_rate_arrangement_fkey;
ALTER TABLE shipments VALIDATE CONSTRAINT shipments_forwarding_role_check;
```

Allocating a master's costs to its house shipments is a sum over lines, written once: each payable on the master becomes a cost line per house in proportion to its share, with the rounding remainder on the largest share so the parts add to the whole ([Rounding](/docs/money/amounts#rounding)). The job profit question then reads straight off `freight_charges`:

```sql
SELECT s.id AS house_shipment, s.house_bill_number,
       sum(fc.amount) FILTER (WHERE fc.side = 'receivable') AS revenue,
       sum(fc.amount) FILTER (WHERE fc.side = 'payable')
         + COALESCE(alloc.allocated_cost, 0) AS cost
FROM consolidation_shipments cs
JOIN shipments s ON s.id = cs.shipment_id
LEFT JOIN freight_charges fc ON fc.shipment_id = s.id AND fc.status <> 'void'
LEFT JOIN LATERAL (
  SELECT sum(m.amount * cs.share_bp / 10000) AS allocated_cost  -- integer minor units
  FROM consolidations c
  JOIN freight_charges m ON m.shipment_id = c.master_shipment_id
   AND m.side = 'payable' AND m.status <> 'void'
  WHERE c.id = cs.consolidation_id
) alloc ON TRUE
WHERE cs.consolidation_id = $1
GROUP BY s.id, s.house_bill_number, alloc.allocated_cost;
```

The integer division here truncates; the stored allocation lines carry the remainder so the house costs sum exactly to the master's.

Design notes:

- **Licenses are records, not flags.** `forwarder_licenses` holds each regulated identity with its regulator, number, amount, surety and validity, and `verified_at` from the last check; a vendor NVOCC whose license is suspended or whose bond lapsed is blocked from new co-loads, and its NRAs stop being exempt.
- **The NRA is versioned and time-checked.** Each amendment is a new version, and every house shipment records the version that priced it; the cargo receipt time on `consolidation_shipments` is what the 532.5 test compares against.
- **House and master are both shipments.** The forwarder owns both: the house with its customer, the master with the line or airline, joined by the consolidation, so each keeps its own parties, charges, documents and events.
- **Costs are allocated, not copied.** A master's ocean freight, handling and detention become allocated cost lines on each house, on the consolidation's stated basis, so job profit is a sum over lines and a disputed master charge can be traced to every house it touched.
- **Role is per shipment.** `forwarding_role` says whether the forwarder is principal (NVOCC or IAC) or agent on this shipment, which drives revenue recognition and which liability regime applies.
- **Emit the forwarding events.** `consolidation.closed`, `consolidation.stuffed`, `master.departed`, `house.released`, `nra.accepted` and `license.lapsed` are what customer notifications, agents, accounting and compliance subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every license and its checks,** so the FMC, a customer or an auditor can see the license, its financial responsibility and when it was last confirmed for every NVOCC or forwarder the business used.
- **Every NRA and NSA as accepted,** with how and when it was accepted, the notice shown for booking acceptance, each amendment, and which version priced each shipment, because an NRA that fails 532.5 leaves the rate unpublished and unprotected.
- **Every consolidation's manifest,** with the house shipments, their receipt times, volumes, weights and allocation shares, and every allocated cost line.
- **Every pass-through charge** billed to a customer without a stated amount, with the underlying invoice that proves it was billed at cost ([Audit Trails](/docs/building-blocks/audit-trails)).

## What This Means for the System You Build

- **Model each regulated role as a license record** with its regulator, number, financial responsibility and verification date.
- **Enforce the NRA timing rule** against the cargo receipt event, and record the version that priced each shipment.
- **Keep house and master as separate shipments** joined by a consolidation, each with its own parties and charges.
- **Allocate master costs to house shipments on a stated basis,** in integer minor units with the remainder placed deliberately.
- **Record the forwarder's role per shipment,** principal or agent, because revenue, liability and documents follow it.
- **Treat agents as parties with their own invoices,** matched to jobs like any other payable.

## References

**Statutes and regulations**

- [46 CFR 515.2: Definitions](https://www.law.cornell.edu/cfr/text/46/515.2), OTI, ocean freight forwarder, NVOCC, freight forwarding services, NVOCC services, shipper, registered NVOCC, compensation, freight forwarding fee and qualifying individual
- [46 CFR 515.3: License; when required](https://www.law.cornell.edu/cfr/text/46/515.3), the license requirement and who is in the United States
- [46 CFR 515.11: Basic requirements for licensing](https://www.law.cornell.edu/cfr/text/46/515.11), the qualifying individual's three years and the character review
- [46 CFR 515.21: Financial responsibility requirements](https://www.law.cornell.edu/cfr/text/46/515.21), $50,000, $75,000 and $150,000, and the $3,000,000 group cap
- [46 CFR 531.3: NVOCC service arrangement definitions](https://www.law.cornell.edu/cfr/text/46/531.3), NSAs and NSA shippers
- [46 CFR 532.2: Exemption](https://www.law.cornell.edu/cfr/text/46/532.2), who may invoke the NRA exemption and loss of eligibility
- [46 CFR 532.5: Requirements for NRAs](https://www.law.cornell.edu/cfr/text/46/532.5), writing, parties, acceptance before receipt, contents, pass-through charges and amendments
- [49 U.S.C. 13102: Definitions](https://www.law.cornell.edu/uscode/text/49/13102), the domestic freight forwarder
- [Federal Register: Broker and Freight Forwarder Financial Responsibility (November 16, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-11-16/html/2023-25312.htm), the rule's January 16, 2024 effective date and its application to freight forwarders

**Filings**

- [Expeditors International: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/746515/000119312526071569/expd-20251231.htm), revenue by service, tonnage and container changes, non-asset model, IAC, NVOCC and customs broker roles, offices and employees, in-house systems, house bills, agent role, revenue presentation, customs pass-through and space commitments
- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), Global Forwarding services, OTI, IAC and customs broker roles, consolidation, and ocean, air and customs adjusted gross profit
- [Landstar System: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/853816/000119312526064756/d66072d10k.htm), air and ocean share of revenue and its IAC, OTI and customs broker roles
- [WiseTech Global: FY26 results announcement (August 26, 2026)](https://announcements.asx.com.au/asxpdf/20260826/pdf/07379lj9h8npgj.pdf), group and CargoWise revenue, the e2open acquisition and CargoWise Value Packs
- [Descartes Systems Group: Annual Information Form for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1050140/000110465926026450/dsgx-20260131xex99d1.htm), Broker & Forwarder Enterprise Systems, Rate Builder, ocean tariff compliance, security filings and the Global Logistics Network

**Vendors**

- [Magaya](https://www.magaya.com/), freight management, warehouse, rate management, customer portal, ACE-certified ABI and customer count

**Standards**

- [DCSA: Booking API 2.0.0](https://api.swaggerhub.com/apis/dcsaorg/DCSA_BKG/2.0.0), the CFS receipt type for LCL
