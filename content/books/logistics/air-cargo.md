+++
title = "Air Cargo"
description = "Freight by air: air waybills and the e-AWB, chargeable weight, ULDs, forwarders and agents, TSA screening, ACAS, FSU codes, ONE Record and dangerous goods."
category = "Logistics & Supply Chain Industry"
order = 2815
part = "Ocean and Air"
tags = ["logistics", "air-cargo", "awb", "one-record", "acas", "tsa", "data-model"]
+++

Air cargo sells speed by the kilogram. An airline carries freight in the lower deck of passenger flights and on freighters, and sells the space mostly to forwarders, which consolidate their customers' shipments under one master air waybill per flight, build them onto pallets and containers (unit load devices, or ULDs), and tender them screened and documented to the airline's cargo terminal hours before departure. Expeditors, a forwarder that owns no aircraft, earned $3.98 billion from airfreight in 2025 on tonnage up 6%; IATA says the electronic air waybill is now used for "more than 2 out of 3 shipments."

The software is hard because a flight is a hard deadline with many gates in front of it. The forwarder's data has to reach the airline as a message that passes the airline's validation, the cargo has to be screened under a TSA program and its chain of custody kept, inbound to the United States its advance data has to clear CBP's risk assessment before the aircraft is loaded, and the pieces have to match the documents at acceptance or the shipment goes on hand. Then the shipment is split across flights, offloaded, rebooked, and reported piece by piece in status messages whose codes date from Cargo-IMP teletype. This chapter covers the parties, the air waybill and the e-AWB, chargeable weight, ULDs, security screening, air cargo advance screening (ACAS), status messages and IATA's ONE Record, and dangerous goods in brief, and it extends `shipments`, `equipment_units` and `shipment_events` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). Forwarders' licensing and consolidation are [Freight Forwarders & NVOCCs](/books/logistics/forwarders-and-nvoccs#consolidation), the airline's liability under the Montreal Convention is Cargo Liability & Claims, the ACAS filing as a customs record is Import Entry & ACE, and the dangerous goods rules from the carrier's side are Hazardous Materials in Transport.

## How the Industry Does It

As of November 2026:

| Party | Role | What its filing or rule says |
| --- | --- | --- |
| **C.H. Robinson** | Forwarder | A "certified Indirect Air Carrier and freight forwarder" that organizes "air shipments and provide[s] door-to-door service"; air adjusted gross profit of $136.7 million in 2025 |
| **CBP** | Inbound security data | ACAS filings "prior to loading of the cargo onto the aircraft," ten mandatory data elements at the lowest air waybill level since November 21, 2025, referrals resolved before departure, and Do-Not-Load |
| **Descartes** | Software | webDocs web forms for air bookings that "send electronic waybills to air carriers," Air Shipment Management and Cargo iQ tools |
| **Expeditors** | Forwarder | An "indirect air carrier" under TSA with IATA-licensed overseas offices; buys capacity on a volume basis, consolidates and issues a house air waybill as the contract of carriage; airfreight revenue $3.98 billion, up 9%, with tonnage up 6% |
| **IATA** | Standards | Resolution 672, the Multilateral e-AWB Agreement, signed "once with IATA"; ONE Record "the preferred data-sharing standard for air cargo from 1 January 2026"; the ULD Regulations; the Dangerous Goods Regulations, a new edition every year |
| **Landstar** | Forwarder | An "IATA certified Indirect Air Carrier" for international air freight, with air and ocean at 5% of revenue |
| **TSA** | Air cargo security | "100% of cargo transported on passenger aircraft" screened; indirect air carriers on a "TSA-approved security program" renewed annually; known shipper status through its Known Shipper Management System |

Three patterns:

- **The forwarder is the shipper the airline sees.** Expeditors, C.H. Robinson and Landstar all act as indirect air carriers: they issue house air waybills to customers, tender consolidations under master air waybills, and carry the screening and data obligations for what they tender. The airline's data on the end shipper is whatever the forwarder sent.
- **Security data moved upstream of the aircraft.** TSA screening and CBP's ACAS both have to be complete before loading, and ACAS added consignee contact details, the packing or pickup location and the ship-to party as mandatory elements in November 2025. Data that used to be optional on a booking is now a condition of flying.
- **Messaging is migrating, slowly.** The e-AWB replaced paper for most shipments through EDI messages, and IATA calls ONE Record, an API standard, the preferred standard from January 1, 2026, while its own September 2026 update describes coexistence with legacy messaging and migration "at their own pace," "evolutionary rather than revolutionary." A system built now speaks both.

## Airlines, Forwarders and Agents

Air capacity is sold by four kinds of party:

- **Airlines,** with belly capacity on passenger flights and freighters, sell space by flight, on allotments and on block space agreements, and run or contract the cargo terminals where freight is accepted, built up and loaded.
- **Integrators,** which own the aircraft, the hubs and the pickup and delivery, sell door-to-door service under their own air waybills; parcel-scale integrator networks are Parcel Networks From the Carrier Side, and a merchant's view of them is [Shipping & Carriers](/books/commerce/shipping-and-carriers#how-the-platforms-do-it).
- **Forwarders,** as indirect air carriers in the US and IATA cargo agents elsewhere, buy space and resell it, consolidating many house shipments under one master. Expeditors buys capacity "on a volume basis" and has $192 million of short-term commitments "reserving space on a guaranteed basis" with carriers.
- **General sales agents (GSAs)** sell an airline's cargo capacity in markets where it has no sales office of its own, under the airline's air waybill stock and rules. <!-- source-gap: logistics-air-cargo-gsa | missing | the role of cargo general sales agents and their share of airline sales | closes with: an IATA or airline publication describing cargo GSA arrangements, or a GSA's annual report | checked: 2026-11-22 --> Their role is widely described in trade sources, but this chapter couldn't open a primary one.

A ground handler, often not the airline, accepts the freight, weighs and measures it, checks it against the documents, builds or receives the ULDs and loads the aircraft; its warehouse events are most of the status messages the forwarder sees.

## Air Waybills and the e-AWB

The air waybill is the contract of carriage between the shipper and the airline and its receipt for the goods. A forwarder's consolidation flies on a **master air waybill** (MAWB) issued in the airline's number range, with the forwarder as shipper, and each customer's goods on a **house air waybill** (HAWB) the forwarder issues; Expeditors issues "a House Airway Bill" to customers as the contract of carriage. Unlike an ocean bill of lading made out to order, an air waybill isn't used to transfer title to goods in transit, so there is no surrender at destination: the airline delivers to the consignee named on the master, usually the forwarder's agent, which releases each house shipment. An air waybill number is the airline's three-digit prefix and an eight-digit serial whose last digit is a check digit. <!-- source-gap: logistics-air-cargo-awb-number | missing | the AWB number structure (three-digit airline prefix, seven-digit serial plus a modulus-7 check digit) and that air waybills are non-negotiable | closes with: IATA Resolution 600a or an airline's published AWB stock rules | checked: 2026-11-22 --> The number format and the waybill's non-negotiable character are industry practice this chapter couldn't confirm against IATA's resolution text or the convention.

The **e-AWB** removes the paper: IATA's Resolution 672, the Multilateral e-AWB Agreement (MeA), "removes the requirement for a paper AWB" and "provides a single standard agreement that airlines and freight forwarders can sign once with IATA." Signing isn't enough to start; under its article 3.1 a forwarder "shall only commence tendering cargo shipments to a participating airline" after the airline's activation notice, and the agreement takes effect per airline, forwarder and location. An e-AWB system therefore tracks MeA activation by airline and station, not just a flag on the forwarder.

The message flow, from IATA's recommended e-AWB guidelines:

1. The forwarder sends the electronic air waybill (FWB, or XFWB in Cargo-XML) and, for a consolidation, the house manifest (FHL or XFHL) before tendering the freight.
2. The airline replies with an acknowledgment (FMA) or a rejection (FNA), "almost instantly after system checks" against its validation rules; on an FNA the forwarder corrects and resends.
3. At acceptance the airline compares the FWB with the freight. If they match, it sends a status (FSU) of `RCS`, ready for carriage; if not, it records the shipment as freight on hand (`FOH`) and asks for a corrected FWB, and sends `RCS` once the data matches.
4. There is "no physical Master Air Waybill (MAWB) or House Manifest (FHL)" for e-AWB shipments, though documents that must travel with the cargo (health certificates, a dangerous goods declaration) still go in a pouch, flagged in the FWB with the codes `EAW` and `EAP`, and the airline marks a shipment that also has a paper AWB in the pouch with `ECC` or `ECP`.

The FWB is the forwarder's chance to be right once: pieces, weight, volume, the shipper's security status (known or unknown consignor), special handling codes and the routing it carries are what acceptance, screening, ACAS and the bill all run on. The guidelines call FWB message quality "a pre-requisite for e-AWB implementation."

## Chargeable Weight

Air freight is priced by chargeable weight: the greater of the actual gross weight and a volumetric weight computed from the dimensions, so that light, bulky freight pays for the space it takes. The common conversion is 6,000 cubic centimeters to the kilogram. <!-- source-gap: logistics-air-cargo-volumetric-ratio | missing | the 6,000 cubic centimeters per kilogram volumetric ratio for air cargo | closes with: IATA TACT Rules text or two airlines' published cargo conditions stating the ratio | checked: 2026-11-22 --> The ratio comes from IATA's TACT rules and airlines' conditions, neither of which this chapter could open; a rating engine stores it per airline and agreement rather than as a constant. With that ratio, an illustrative shipment:

| Fact | Value |
| --- | --- |
| Pieces | 10 cartons, each 60 by 50 by 40 cm and 15 kg |
| Actual gross weight | 150 kg |
| Volume | 10 times 120,000 cm³ = 1,200,000 cm³ |
| Volumetric weight | 1,200,000 / 6,000 = 200 kg |
| Chargeable weight | 200 kg, the greater |

In a consolidation the forwarder buys from the airline at the master's chargeable weight and sells to each customer at its house chargeable weight, and a well-built consolidation mixes dense and light freight so the master's chargeable weight is close to its actual weight while each house still pays on its own volume; the gap is part of the forwarder's margin. The same idea in parcel is [Dimensional Weight](/books/commerce/shipping-and-carriers#dimensional-weight), with a different divisor per carrier.

## Unit Load Devices

IATA defines a ULD as "either an aircraft pallet and pallet net combination, or an aircraft container," and treats ULDs as aircraft parts that affect flight safety. It estimates about 1 million in service, "representing a replacement value of over USD 1 billion," and puts repair and loss at "USD 330 million" a year, before aircraft damage and delays. IATA's ULD Regulations set technical and operational standards: design, testing and manufacturing minimums, serviceability checks, build-up, and training.

For a system, a ULD is an `equipment_units` row of kind `uld`, owned by an airline or a ULD pool, identified by its type, serial and owner code as marked on it. A shipment's pieces are built onto one or more ULDs for a flight, and a ULD carries pieces of several house and master shipments; that many-to-many, per flight segment, is what lets a forwarder say which shipments were on a ULD that was offloaded or damaged. <!-- source-gap: logistics-air-cargo-uld-id | missing | the ULD identification code structure (type code, serial number, owner code) | closes with: IATA ULD Regulations excerpt or an airline ULD page describing the marking | checked: 2026-11-22 -->

## Security Screening

Two regimes gate a shipment before loading. TSA requires "100% of cargo transported on passenger aircraft" to be screened, under section 1602 of the 9/11 Act, "at a level of security commensurate with the level of security for the screening of passenger checked baggage." The programs:

- **Indirect air carriers.** TSA requires "each IAC to adopt and carry out a TSA-approved security program," renewed annually; approval takes "approximately 90 to 120 days" after a complete application.
- **Certified Cargo Screening Program (CCSP).** Shippers, forwarders and third parties certified to screen at their own facilities, under "strict chain of custody requirements": cargo "must be secured from the time it is screened until it is placed on passenger aircraft."
- **Known shippers.** Through the Known Shipper Management System, "TSA identifies and approves the known shipper status for qualified shippers"; aircraft operators, foreign air carriers and IACs run known shipper programs under their security programs.
- **Screening technology.** Regulated parties screen "using approved screening methods," with technology from TSA's qualified and approved lists used "in accordance with measures identified in a TSA Standard Security Program."

A screening is therefore a record with a screener (an airline, an IAC, a CCSP facility), a method, the pieces screened, a time and a place, and a chain of custody from then until loading. A shipment screened at a CCSP facility and then opened breaks the chain and must be screened again.

## Air Cargo Advance Screening

For flights to the United States, CBP's ACAS rule (19 CFR 122.48b) requires advance data for risk assessment "prior to loading of the cargo onto the aircraft," and as early as practicable, with updates whenever the data changes. The inbound air carrier must file unless another eligible party, such as a forwarder or a foreign indirect air carrier, elects to; the carrier may file too. Filers need CBP's communications protocol, a bond, their originator codes and round-the-clock contacts.

The ten mandatory elements, "at the lowest air waybill level" (the house where there is one), as amended by CBP Decision 25-08, effective November 21, 2025:

| | Element |
| --- | --- |
| 1 | Shipper name and address |
| 2 | Consignee name and address |
| 3 | Consignee email address |
| 4 | Consignee phone number |
| 5 | Cargo description |
| 6 | Total quantity, based on the smallest external packing unit |
| 7 | Total weight of cargo |
| 8 | Air waybill number, matching the 122.48a manifest filing |
| 9 | Shipment packing location and/or scheduled pickup location |
| 10 | Ship-to party |

Before the amendment there were six (shipper and consignee names and addresses, description, quantity, weight and AWB number). The 2025 rule also added conditional elements, among them the shipper's email and phone when the shipper is not a Verified Known Consignor, customer account data, and the unmasked IP or MAC address of the device used to create the account for accounts established after November 21, 2025, under a phased enforcement approach. The master air waybill number for each flight leg is conditional on who files and how.

CBP answers with referrals that must be resolved before departure: a **referral for information**, when the data is too inaccurate, insufficient or vague to assess, resolved by the last party to file; and a **referral for screening**, when the risk warrants enhanced screening by TSA-approved methods, resolved by the inbound carrier unless a TSA-recognized filer handles it. A **Do-Not-Load** instruction, for a potential bomb or other immediate, lethal threat, means "the inbound air carrier may not transport cargo with a Do-Not-Load (DNL) instruction," and the party in possession follows the DNL protocols and law enforcement directions. Import Entry & ACE stores the filing and its status as an advance cargo filing of kind `us_acas`, with `do_not_load` as a status; the air side needs the referral, its resolution and the screening that resolved it on the house air waybill, because the forwarder can't tender it until both are clear.

## Status Messages and ONE Record

Air status arrives as FSU messages (XFSU in Cargo-XML), one code per milestone, and often per part of a shipment, because a 20-piece consignment can fly as 12 and 8 on two flights. IATA's ONE Record documentation lists the codes it maps:

| Code | Meaning (per IATA's mapping) | Core `shipment_events` code |
| --- | --- | --- |
| `BKD` | Booked for transport (a confirmation, mapped to a booking object) | `booked` |
| `RCS` | Received from shipper, ready for carriage | `received` |
| `FOH` | On hand, pending the ready-for-carriage check | `hold` |
| `FIW`, `FOW` | Into and out of warehouse control | `gate_in`, `gate_out` |
| `MAN`, `PRE` | Manifested for a flight; prepared for loading | `manifested` |
| `DEP`, `ARR` | Departed, arrived on a scheduled flight | `departed`, `arrived` |
| `RCF` | Received from a flight or surface transport | `discharged` |
| `RCT`, `TFD`, `TRM` | Received from, transferred to, or manifested for transfer to another carrier | `received`, `transferred` |
| `TGC`, `CCD` | Transferred to customs or government control; cleared by customs | `transferred`, `customs_released` |
| `NFD` | Consignee or agent notified of arrival | `notified` |
| `DLV`, `DDL`, `DPU` | Delivered to consignee or agent; delivered to the door; picked up at the shipper's door | `delivered`, `delivered`, `picked_up` |
| `DIS` | A handling or documentation discrepancy, with a discrepancy code | `exception` |
| `AWR`, `AWD`, `DOC`, `CRC`, `OSI`, `OCI` | Documents received or delivered, reported to customs, other service or customs information | Kept on the air waybill, not as movement events |

IATA calls ONE Record "a standard for data sharing" that "creates a single record view of the shipment," over a "standardized and secured web API" with a JSON-LD data model. Instead of each party sending messages, each party's ONE Record server holds logistics objects (shipment, pieces, waybill, booking, transport movements) that others read and subscribe to. In it, most FSU codes become a `StatusUpdateEvent`, a subtype of `LogisticsEvent`, attached to the `Shipment` with the FSU code in `eventCode`; a split shipment sets `partialEventIndicator` with `recordedPieceCount`, `recordedWeight` and `recordedVolume`, and links the flight as a `TransportMovement`; `BKD` becomes a `Booking`, and `OCI` updates customs or security information directly. As of November 2026 IATA's documentation is at data model 3.3.0 and API 2.3.0, both endorsed by its Cargo Operations Technology Board on July 25, 2026. IATA's December 2025 survey found awareness "above 70%" and readiness for adoption near half.

The mapping has to keep partial events as partial. A `DEP` for 12 of 20 pieces is not the shipment departing:

```go tab="Go"
var fsuToCore = map[string]string{
	"BKD": "booked", "RCS": "received", "FOH": "hold", "FIW": "gate_in", "FOW": "gate_out",
	"MAN": "manifested", "PRE": "manifested", "DEP": "departed", "ARR": "arrived",
	"RCF": "discharged", "RCT": "received", "TFD": "transferred", "TRM": "transferred",
	"TGC": "transferred", "CCD": "customs_released", "NFD": "notified",
	"DLV": "delivered", "DDL": "delivered", "DPU": "picked_up", "DIS": "exception",
}

type FSU struct {
	AWB          string    // prefix-serial
	Code         string    // e.g. "DEP"
	Station      string    // IATA airport code
	Flight       string    // e.g. "LH8160", when the code has one
	Pieces       int       // pieces this status covers
	TotalPieces  int       // pieces on the waybill
	WeightG      int64
	OccurredAt   time.Time // local time at Station, converted with the airport's zone
}

type StatusEvent struct {
	Code        string
	SourceCode  string
	Partial     bool
	Pieces      int
	OccurredAt  time.Time
	DedupeKey   string
}

// MapFSU returns a movement event, or ok=false for document and information codes,
// which are recorded on the air waybill instead.
func MapFSU(f FSU) (ev StatusEvent, ok bool) {
	code, ok := fsuToCore[f.Code]
	if !ok {
		return StatusEvent{}, false
	}
	return StatusEvent{
		Code:       code,
		SourceCode: f.Code,
		Partial:    f.Pieces < f.TotalPieces,
		Pieces:     f.Pieces,
		OccurredAt: f.OccurredAt,
		// Pieces and flight are in the key: two partial DEPs are two events.
		DedupeKey: fmt.Sprintf("iata:%s:%s:%s:%s:%d:%d",
			f.AWB, f.Code, f.Station, f.Flight, f.Pieces, f.OccurredAt.Unix()),
	}, true
}

// ShipmentDeparted is true only when departures cover every piece.
func ShipmentDeparted(events []StatusEvent, totalPieces int) bool {
	flown := 0
	for _, e := range events {
		if e.Code == "departed" {
			flown += e.Pieces
		}
	}
	return flown >= totalPieces
}
```

```rust tab="Rust"
use chrono::{DateTime, Utc};

fn fsu_to_core(code: &str) -> Option<&'static str> {
    Some(match code {
        "BKD" => "booked", "RCS" | "RCT" => "received", "FOH" => "hold",
        "FIW" => "gate_in", "FOW" => "gate_out", "MAN" | "PRE" => "manifested",
        "DEP" => "departed", "ARR" => "arrived", "RCF" => "discharged",
        "TFD" | "TRM" | "TGC" => "transferred", "CCD" => "customs_released",
        "NFD" => "notified", "DLV" | "DDL" => "delivered", "DPU" => "picked_up",
        "DIS" => "exception",
        _ => return None, // document and information codes stay on the air waybill
    })
}

pub struct Fsu {
    pub awb: String,
    pub code: String,
    pub station: String,
    pub flight: Option<String>,
    pub pieces: u32,
    pub total_pieces: u32,
    pub occurred_at: DateTime<Utc>, // converted from the station's local time
}

pub struct StatusEvent {
    pub code: &'static str,
    pub source_code: String,
    pub partial: bool,
    pub pieces: u32,
    pub occurred_at: DateTime<Utc>,
    pub dedupe_key: String,
}

pub fn map_fsu(f: &Fsu) -> Option<StatusEvent> {
    let code = fsu_to_core(&f.code)?;
    Some(StatusEvent {
        code,
        source_code: f.code.clone(),
        partial: f.pieces < f.total_pieces,
        pieces: f.pieces,
        occurred_at: f.occurred_at,
        // Pieces and flight are in the key: two partial DEPs are two events.
        dedupe_key: format!(
            "iata:{}:{}:{}:{}:{}:{}",
            f.awb, f.code, f.station, f.flight.as_deref().unwrap_or(""), f.pieces,
            f.occurred_at.timestamp()
        ),
    })
}

/// True only when departures cover every piece on the waybill.
pub fn shipment_departed(events: &[StatusEvent], total_pieces: u32) -> bool {
    events.iter().filter(|e| e.code == "departed").map(|e| e.pieces).sum::<u32>() >= total_pieces
}
```

FSU times are local to the station, so the conversion uses the airport facility's time zone, as the core model does for every local time ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)). The same function sits behind a ONE Record subscription: a `StatusUpdateEvent` carries the code and the recorded pieces, so both channels feed one mapping, versioned per airline because their use of the codes differs ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).

## Dangerous Goods

Air is the strictest mode for dangerous goods. IATA's Dangerous Goods Regulations, published as a new edition every year (it was promoting the 68th as of November 2026), set classification, packing, marking, documentation and the shipper's and operator's responsibilities, and some goods may fly only on cargo aircraft. On an e-AWB, a dangerous goods shipment still needs the original shipper's declaration in the document pouch, and IATA's guidelines have the forwarder state it in the FWB ("Dangerous Goods as per attached DGD," or "DGD-CAO" for cargo-aircraft-only), with a stated count when a consolidation mixes dangerous and other goods; lithium batteries shipped under a section II packing instruction carry their own statement. The carrier-side US rules are Hazardous Materials in Transport, and a merchant's lithium shipments are the Commerce volume's [Hazmat Shipping](/books/commerce/pesticides-chemicals-and-hazmat#hazmat-shipping).

## How to Build It

An air shipment is a `shipments` row of mode `air`, the forwarder's house and the airline's master are both shipments joined by a `consolidations` row of mode `air` from Freight Forwarders & NVOCCs, each flight leg is a `loads` row of mode `air`, and a ULD is an `equipment_units` row of kind `uld`. Air adds the waybill as data, the booked and flown segments, which pieces rode which ULD, and the screening record. All `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE TABLE air_waybills (              -- a master or house air waybill, as data
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  shipment_id        UUID NOT NULL REFERENCES shipments (id),
  level              TEXT NOT NULL CHECK (level IN ('master', 'house', 'direct')),
  parent_id          UUID REFERENCES air_waybills (id),  -- a house's master
  issuer_party_id    UUID NOT NULL REFERENCES parties (id),  -- airline (master) or forwarder (house)
  airline_prefix     CHAR(3),            -- masters and direct: the airline's prefix
  number             TEXT NOT NULL,      -- serial, or the forwarder's house number
  origin_airport     CHAR(3) NOT NULL,   -- IATA location code
  destination_airport CHAR(3) NOT NULL,
  pieces             INT NOT NULL CHECK (pieces > 0),
  gross_weight_g     BIGINT NOT NULL CHECK (gross_weight_g > 0),
  volume_cm3         BIGINT CHECK (volume_cm3 > 0),
  chargeable_weight_g BIGINT CHECK (chargeable_weight_g > 0),
  volumetric_ratio_cm3_per_kg INT,       -- the ratio applied, per airline or agreement
  is_electronic      BOOLEAN NOT NULL,   -- e-AWB under the MeA
  mea_activated      BOOLEAN,            -- for this airline and station, at tender
  security_status    TEXT CHECK (security_status IN ('known', 'unknown')),  -- the consignor, as declared in the FWB
  special_handling   TEXT[] NOT NULL DEFAULT '{}',  -- codes as sent, e.g. dangerous goods, perishables
  dangerous_goods    BOOLEAN NOT NULL DEFAULT FALSE,
  status             TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'acknowledged',
                       'rejected', 'on_hand', 'ready_for_carriage', 'in_transit',
                       'arrived', 'delivered', 'cancelled')),
  last_status_code   TEXT,               -- the latest FSU code, including document codes
  document_id        UUID REFERENCES documents (id),  -- the FWB or FHL as sent
  UNIQUE (issuer_party_id, airline_prefix, number),
  CHECK (level <> 'master' OR airline_prefix IS NOT NULL),
  CHECK (level = 'house' OR parent_id IS NULL)
);

CREATE TABLE air_flight_segments (       -- booked and flown legs of a waybill
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  air_waybill_id   UUID NOT NULL REFERENCES air_waybills (id),
  sequence         SMALLINT NOT NULL CHECK (sequence > 0),
  load_id          UUID REFERENCES loads (id),  -- the flight as an air load
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  flight_number    TEXT NOT NULL,
  flight_date      DATE NOT NULL,      -- local date at the origin station
  origin_airport   CHAR(3) NOT NULL,
  destination_airport CHAR(3) NOT NULL,
  pieces           INT NOT NULL CHECK (pieces > 0),  -- a split shipment has several segments
  weight_g         BIGINT NOT NULL CHECK (weight_g > 0),
  status           TEXT NOT NULL CHECK (status IN ('booked', 'confirmed', 'waitlisted',
                     'manifested', 'flown', 'offloaded', 'cancelled')),
  booked_at        TIMESTAMPTZ NOT NULL,
  UNIQUE (air_waybill_id, sequence)
);

CREATE TABLE uld_loads (                 -- which pieces rode which ULD on which segment
  uld_id               UUID NOT NULL REFERENCES equipment_units (id),
  air_flight_segment_id UUID NOT NULL REFERENCES air_flight_segments (id),
  pieces               INT NOT NULL CHECK (pieces > 0),
  weight_g             BIGINT NOT NULL CHECK (weight_g > 0),
  built_by_party_id    UUID REFERENCES parties (id),  -- forwarder-built or handler-built
  PRIMARY KEY (uld_id, air_flight_segment_id)
);

CREATE TABLE air_cargo_screenings (      -- a security screening and its chain of custody
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  air_waybill_id     UUID NOT NULL REFERENCES air_waybills (id),
  screened_by_party_id UUID NOT NULL REFERENCES parties (id),
  program            TEXT NOT NULL CHECK (program IN ('aircraft_operator', 'iac', 'ccsp',
                       'foreign_regime', 'acas_referral')),
  method             TEXT NOT NULL,      -- the approved method or technology used
  pieces             INT NOT NULL CHECK (pieces > 0),
  facility_id        UUID REFERENCES facilities (id),
  screened_at        TIMESTAMPTZ NOT NULL,
  custody_ref        TEXT,               -- seal or chain-of-custody reference until tender
  custody_broken_at  TIMESTAMPTZ,        -- set if the cargo was opened; requires rescreening
  advance_cargo_filing_ref TEXT,         -- the ACAS referral this screening resolved, if any
  result             TEXT NOT NULL CHECK (result IN ('cleared', 'alarm_resolved', 'refused'))
);

ALTER TABLE shipments
  ADD COLUMN chargeable_weight_g BIGINT,  -- the billed weight, per its rate agreement
  ADD COLUMN volume_cm3          BIGINT;
ALTER TABLE shipments ADD CONSTRAINT shipments_chargeable_weight_check
  CHECK (chargeable_weight_g IS NULL OR chargeable_weight_g > 0) NOT VALID;

ALTER TABLE equipment_units
  ADD COLUMN uld_type_code CHAR(3),      -- the ULD type as marked; ULDs only
  ADD COLUMN uld_owner_code TEXT;
ALTER TABLE equipment_units ADD CONSTRAINT equipment_units_uld_check
  CHECK (kind <> 'uld' OR uld_type_code IS NOT NULL) NOT VALID;

ALTER TABLE shipment_events DROP CONSTRAINT shipment_events_code_check,
  ADD CONSTRAINT shipment_events_code_check CHECK (code IN ('booked', 'pickup_arrived',
    'picked_up', 'departed', 'position', 'arrived', 'out_for_delivery', 'delivery_arrived',
    'delivered', 'gate_in', 'gate_out', 'loaded', 'discharged', 'available',
    'customs_released', 'hold', 'exception', 'eta_updated', 'stuffed', 'stripped',
    'inspected', 'resealed', 'removed', 'dropped_off', 'received', 'manifested',
    'transferred', 'notified')) NOT VALID;
ALTER TABLE shipment_events
  ADD COLUMN pieces INT,                 -- pieces a partial status covers
  ADD COLUMN partial BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX CONCURRENTLY air_waybills_parent_idx ON air_waybills (parent_id);
CREATE INDEX CONCURRENTLY air_flight_segments_load_idx ON air_flight_segments (load_id);
ALTER TABLE shipments VALIDATE CONSTRAINT shipments_chargeable_weight_check;
ALTER TABLE equipment_units VALIDATE CONSTRAINT equipment_units_uld_check;
ALTER TABLE shipment_events VALIDATE CONSTRAINT shipment_events_code_check;
```

The shipment events code list here is the full one, including the codes [Ocean Shipping](/books/logistics/ocean-shipping#how-to-build-it) added, so the two chapters' migrations run in order.

A forwarder's export desk question an hour before a flight's cut-off, which house air waybills on it aren't ready to tender, reads:

```sql
SELECT h.number AS house_awb, m.airline_prefix || '-' || m.number AS master_awb,
       h.status,
       NOT EXISTS (SELECT 1 FROM air_cargo_screenings sc
                   WHERE sc.air_waybill_id = h.id AND sc.result <> 'refused'
                     AND sc.custody_broken_at IS NULL) AS not_screened
FROM air_waybills h
JOIN air_waybills m ON m.id = h.parent_id
JOIN air_flight_segments f ON f.air_waybill_id = m.id AND f.sequence = 1
WHERE h.level = 'house'
  AND f.load_id = $1                                 -- the departing flight
  AND (h.status <> 'ready_for_carriage'
       OR NOT EXISTS (SELECT 1 FROM air_cargo_screenings sc
                      WHERE sc.air_waybill_id = h.id AND sc.result <> 'refused'
                        AND sc.custody_broken_at IS NULL))
ORDER BY m.number, h.number;
```

Design notes:

- **House and master are rows with a parent link,** as in ocean, and each is tied to its own shipment; the FHL that lists houses under a master is the `documents` row, and the houses are data.
- **Segments carry pieces.** A split shipment is several segments with their own piece counts and status, and a partial status message carries its pieces; the shipment departed when its segments' flown pieces cover the waybill.
- **ULD contents are per segment.** `uld_loads` says which waybills' pieces rode a ULD on a given flight, which is what a damaged or offloaded ULD, or a security alarm, is investigated by.
- **Screening is evidence with custody.** Each screening records the program, method, pieces, place and time, and a broken chain of custody invalidates it; a house with no valid screening isn't tenderable to a passenger flight.
- **Chargeable weight states its ratio.** The volumetric ratio applied is stored on the waybill, because it is a term of the airline's or the forwarder's agreement, not a constant.
- **MeA activation is per airline and station.** `mea_activated` records whether the e-AWB agreement was active for that airline at that station when the shipment was tendered, which decides whether paper was required.
- **Emit the air events.** `air_waybill.rejected`, `air_waybill.on_hand`, `air_waybill.ready_for_carriage`, `segment.offloaded`, `screening.recorded`, `acas.referral`, `acas.do_not_load` and `shipment.departed` drive the export desk, customer notifications and rebooking ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every FWB and FHL as sent, and every FMA, FNA and FSU as received,** with event and received times, so a disputed acceptance weight or a rejected waybill can be traced to the message.
- **Every screening,** with screener, program, method, pieces, time, place and custody, kept as TSA programs require; and every ACAS referral with how and when it was resolved, or the Do-Not-Load and what was done.
- **Every booked and flown segment,** with offloads and rebookings, because delay claims under the Montreal Convention and service failures under a forwarder's contract are judged on them.
- **The chargeable weight and its inputs** (dimensions, ratio, actual weight) for every master and house, since they are the basis of both the buy and the sell ([Audit Trails](/docs/building-blocks/audit-trails)).

## What This Means for the System You Build

- **Model master and house air waybills as linked rows,** each on its own shipment.
- **Validate the FWB before sending it,** and treat an FNA or an `FOH` as a work item, not a log line.
- **Track e-AWB activation by airline and station,** not as a forwarder-wide flag.
- **Store chargeable weight with its ratio and inputs.**
- **Record screenings with their chain of custody,** and block tender without a valid one.
- **Collect the ten ACAS elements at booking,** since a house can't fly without them, and record referrals and their resolutions.
- **Keep partial statuses partial,** with pieces on every event, and roll up only when the pieces add up.
- **Speak FSU messages and ONE Record through one mapping,** versioned per airline.

## References

**Regulations**

- [19 CFR 122.48b: Air cargo advance screening](https://www.law.cornell.edu/cfr/text/19/122.48b), timing, filers, the ten mandatory elements, conditional elements, referrals, Do-Not-Load and the 2018 and 2025 sources
- [Federal Register: Enhanced Air Cargo Advance Screening (November 21, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-11-21/html/2025-20606.htm), the effective date, the added mandatory and conditional elements, the six elements before, and phased enforcement

**Government**

- [TSA: Cargo programs](https://www.tsa.gov/for-industry/cargo-programs), 100% screening on passenger aircraft, CCSP and chain of custody, IAC security programs and approval time, the Known Shipper Management System and screening technology

**Filings**

- [Expeditors International: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/746515/000119312526071569/expd-20251231.htm), airfreight revenue and tonnage, IAC and IATA roles, volume purchasing, house air waybills and space commitments
- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), indirect air carrier role and air adjusted gross profit
- [Landstar System: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/853816/000119312526064756/d66072d10k.htm), indirect air carrier role and air and ocean share of revenue
- [Descartes Systems Group: Annual Information Form for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1050140/000110465926026450/dsgx-20260131xex99d1.htm), webDocs electronic waybills, Air Shipment Management and Cargo iQ

**Standards**

- [IATA: Electronic air waybill](https://www.iata.org/en/programs/cargo/e/eawb/), Resolution 672, the Multilateral e-AWB Agreement and activation under article 3.1
- [IATA: Recommended guidelines for e-AWB (ex-Delhi)](https://www.iata.org/contentassets/b559d10aeb734d5196332b4953dcf312/e-awb-sop-del.pdf), the FWB, FHL, FMA, FNA, FOH and RCS flow, no physical MAWB, pouch codes, dangerous goods and lithium statements, and FWB quality
- [IATA: ONE Record](https://www.iata.org/en/programs/cargo/e/one-record/), single record view, the web API, linked data, and the e-AWB on more than two of three shipments
- [IATA: Survey shows growing awareness of ONE Record (December 10, 2025)](https://www.iata.org/en/pressroom/2025-releases/2025-12-10-02/), the preferred standard from January 1, 2026, and survey results
- [IATA: Cargo Tracker, ONE Record updates (September 2026)](https://www.iata.org/en/publications/newsletters/tracker/cargo-tracker-september-2026/one-record-updates/), coexistence with legacy messaging and gradual migration
- [IATA ONE Record: XFSU mapping](https://iata-cargo.github.io/ONE-Record/development/Orchestration/xfsu/), FSU codes, StatusUpdateEvent, partial events, Booking and OCI
- [IATA ONE Record: Data model](https://iata-cargo.github.io/ONE-Record/stable/Data-Model/), version 3.3.0 endorsed July 25, 2026
- [IATA ONE Record: API specification](https://iata-cargo.github.io/ONE-Record/stable/API-Security/), version 2.3.0 endorsed July 25, 2026
- [IATA: Unit load devices](https://www.iata.org/en/programs/cargo/unit-load-devices/), the ULD definition, about 1 million in service, replacement value, repair and loss cost, and the ULD Regulations
- [IATA: Dangerous Goods Regulations](https://www.iata.org/en/publications/dgr/), annual editions and the 68th edition
