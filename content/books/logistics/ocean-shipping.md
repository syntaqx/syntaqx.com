+++
title = "Ocean Shipping"
description = "Container lines from the inside: carriers and alliances, services and schedules, booking, containers and VGM, terminals, and the DCSA standards."
category = "Logistics & Supply Chain Industry"
order = 2811
part = "Ocean and Air"
tags = ["logistics", "ocean", "containers", "booking", "dcsa", "vgm", "data-model"]
+++

Container shipping is a scheduled network sold one box at a time. A carrier runs a service, a fixed rotation of ports called weekly by a string of vessels, and sells space on each sailing to shippers under service contracts, to NVOCCs that resell it, and to whoever books at tariff rates. The shipper books a container of a given size and type for a sailing, the carrier confirms it with cut-off times, the shipper collects an empty, stuffs it, weighs it and gates it back into the terminal before the cut-off, and the box rides one or more vessels to the discharge port, where it waits in the terminal until the consignee's trucker or the railroad takes it. Hapag-Lloyd carried 13.5 million TEU (twenty-foot equivalent units) in 2025 on 301 vessels and 133 services; ZIM, a smaller independent, carried 3.66 million.

The software is hard because a booking is a promise about a moving schedule made by parties who never share a database. The vessel's arrival slips, a transshipment misses its connection, the carrier rolls the box to the next sailing, the shipper changes the equipment type, the weight on the shipping instructions disagrees with the verified gross mass, and each change arrives as a message from a carrier, a terminal or a portal in its own vocabulary. The industry's answer is the Digital Container Shipping Association (DCSA), whose standards define the booking, the bill of lading and the event stream as APIs; its newest releases are open only to members and partners, and many carriers still exchange EDIFACT and X12 messages. This chapter covers the carriers and alliances, services and schedules, the booking and its states, containers and the verified gross mass, the terminal events, and the DCSA standards, and it extends `shipments`, `loads` and `equipment_units` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). The bill of lading is [Bills of Lading & eBL](/books/logistics/ocean-documents), the charges for time at the terminal and for the container are [Detention & Demurrage](/books/logistics/detention-and-demurrage), the NVOCCs that book on behalf of most small shippers are [Freight Forwarders & NVOCCs](/books/logistics/forwarders-and-nvoccs), and the security filing and entry on arrival are the Customs and Trade part (Import Entry & ACE).

## How the Carriers Do It

As of November 2026, from carriers' 2025 annual reports and filings; vessel capacity for lines whose own reports aren't cited is the Drewry and MDS Transmodal ranking that Hapag-Lloyd's report reproduces (share of world capacity in parentheses):

| Carrier | Cooperation | Scale (2025) | Fleet | What its filing stresses |
| --- | --- | --- | --- | --- |
| **CMA CGM, COSCO (with OOIL), Evergreen** | The Ocean Alliance, per Hapag-Lloyd's description of the market | Own reports not opened for this chapter | 4,110 TTEU (13%), 3,483 TTEU (11%) and 1,929 TTEU (6%) of vessel capacity, per the ranking | Alliance membership from Hapag-Lloyd's report only |
| **Hapag-Lloyd** | The Gemini Cooperation with Maersk on the East-West trades from February 1, 2025, replacing THE Alliance with ONE, HMM and Yang Ming | 13,486 TTEU transported, up 8.2%; average freight rate USD 1,376 per TEU, down 7.8% | 301 vessels, 2,450 TTEU of capacity, 60% owned by capacity; 2.1 million containers with 3.7 million TEU of capacity, 69% owned by capacity | Gemini's "hub and spoke model" and schedule reliability of "around 90%" in its first year |
| **Maersk** | The Gemini Cooperation with Hapag-Lloyd | Own report not opened for this chapter | 4,492 TTEU (14%), per the ranking | Partner in Gemini, per Hapag-Lloyd |
| **MSC** | Outside the alliances since the 2M with Maersk ended on January 31, 2025; operational agreements with ZIM | Own report not opened | 7,063 TTEU (22%), the largest, per the ranking | Not a public filer |
| **ONE, HMM, Yang Ming** | The Premier Alliance, "founded out of THE Alliance" | Own reports not opened | 2,090 TTEU (6%), 1,037 TTEU (3%) and 720 TTEU (2%), per the ranking | Membership from Hapag-Lloyd's report |
| **ZIM** | "Not a party to any strategic alliances"; a strategic operational agreement with MSC on Asia to the US East and Gulf Coasts, and other agreements with MSC | 3.66 million TEU carried (3.75 million in 2024); about 30,500 customers, the top 10 about 12% of freight revenue | 128 vessels, 112 of them chartered; capacity "exceeds 708,000 TEUs" | A merger agreement with Hapag-Lloyd entered into on February 16, 2026, at $35.00 a share in cash |

<!-- source-gap: logistics-ocean-shipping-alliance-figures | secondary | 2025 volumes for Maersk, MSC, CMA CGM, COSCO and ONE, and their capacity from their own reports rather than the Drewry and MDS Transmodal ranking in Hapag-Lloyd's report | closes with: Maersk, CMA CGM and COSCO 2025 annual reports opened in full (their investor sites refused automated fetches on 2026-11-22) | checked: 2026-11-22 -->
The other large lines' own 2025 volumes aren't in this table because their annual reports couldn't be opened for this chapter, and their capacity is a third-party ranking, not their own figure. The ZIM merger hadn't closed as of ZIM's third-quarter results on November 18, 2026: shareholders approved it on April 30, 2026, Israel's original application under the special state share was terminated with Hapag-Lloyd intending to file a new one, other regulatory approvals were outstanding, and closing was targeted for the first quarter of 2027.

Three patterns:

- **Ten lines run the trade, through three groupings and some independents.** Hapag-Lloyd puts the ten largest carriers at "approximately 85%" of world capacity, MSC alone at 22%. Since the 2M Alliance between Maersk and MSC ended on January 31, 2025, the East-West trades run on Gemini (Maersk and Hapag-Lloyd), the Ocean Alliance (CMA CGM, COSCO with OOIL, and Evergreen) and the Premier Alliance (ONE, HMM, Yang Ming), with MSC and smaller lines such as ZIM operating outside them through bilateral agreements. A booking with one carrier often rides a vessel another carrier operates.
- **Most of the fleet is chartered.** ZIM charters 112 of its 128 ships and Hapag-Lloyd owns 60% of its capacity; vessels change operators and services during their lives, so a vessel is identified by its IMO number, never by its name or the service it is on.
- **Reliability is now the product.** Gemini's design separates long-haul mainline services calling "a limited number of high-performance hubs" from regional shuttles, and Hapag-Lloyd sells the resulting schedule reliability of about 90% as the reason to book. A system that plans inland moves on a carrier's published arrival needs to know which carrier and network it is relying on, and how often that carrier's estimates have held.

## Carriers, Alliances and Services

An ocean common carrier operates vessels and holds itself out to carry cargo for the public; an NVOCC carries cargo under its own bills without operating vessels and is a shipper to the line ([Freight Forwarders & NVOCCs](/books/logistics/forwarders-and-nvoccs) owns the licensing). Carriers cooperate in vessel sharing agreements and alliances, which Hapag-Lloyd describes as enabling "a more comprehensive range of liner services" and lower unit costs "through better capacity utilisation." The commercial relationship stays with the carrier that issued the booking and the bill of lading, whoever operates the vessel.

The units of the network:

- **A service** is a named, repeating rotation of port calls (an Asia to North Europe loop, a transpacific string to Los Angeles) with a carrier's service code, run weekly by several vessels. Hapag-Lloyd's network counted 133 services at the end of 2025, up from 113, "primarily attributable to the new network structure" of Gemini.
- **A voyage** is one vessel's trip on a service, with a voyage number the operating carrier assigns; each partner may use its own voyage number for the same sailing.
- **A port call** is the vessel's visit to a terminal on a voyage, with a planned, estimated and actual arrival and departure.
- **A transport plan** is the sequence of legs a booking's cargo follows: pre-carriage by truck, rail or barge, one or more vessel legs with transshipments between them, and on-carriage to the place of delivery. DCSA's booking standard requires the confirmed booking to carry "a list of `Transport` objects (legs) describing the entire transport plan including transshipments."

The price comes from one of three places. A **service contract** is "a written contract, other than a bill of lading or receipt," between shippers and a carrier, in which the shipper commits to "a certain minimum quantity or portion of its cargo or freight revenue over a fixed time period" and the carrier to a rate and a service level; it is filed with the FMC electronically and becomes effective "at 12:01 a.m. Eastern Standard Time" on its date (46 CFR 530.3). A **tariff** is the carrier's published rate for shippers without a contract. An NVOCC's customer is priced by the NVOCC's tariff, a negotiated rate arrangement or an NVOCC service arrangement, covered in [Freight Forwarders & NVOCCs](/books/logistics/forwarders-and-nvoccs). The booking carries the service contract reference, because the rate, the free time and the detention and demurrage terms are all looked up from it.

Since OSRA 2022, a carrier may not "unreasonably refuse cargo space accommodations when available" or "unreasonably refuse to deal or negotiate," including over "vessel space accommodations" (46 U.S.C. 41104(a)(3) and (a)(10)); the FMC's rule on refusals is 46 CFR 542, published July 23, 2024. A shipper's system that records each rejected booking with its reason and time is keeping the evidence a complaint needs.

## Schedules

DCSA separates the **commercial schedule** (the point-to-point routings a carrier sells, with transit times) from the **operational vessel schedule** (the port calls a vessel will make, with planned and estimated times) and the **port call** (the terminal's view of the visit), and publishes a standard for each. They diverge constantly: the commercial schedule is a sales promise published weeks ahead, the operational schedule moves with weather, congestion and blank sailings, and the terminal's berth window is its own.

A confirmed booking also carries the carrier's cut-offs, the latest times the shipper may act before the sailing. DCSA's booking standard codes them:

| Code | Cut-off | What misses it |
| --- | --- | --- |
| `DCO` | "Documentation cut-off": shipping instructions due | The bill of lading can't be issued for the sailing |
| `VCO` | "VGM cut-off": the verified gross mass due | The container may not be loaded |
| `FCO` | "FCL delivery cut-off": the full container gated in | The box rolls to the next sailing |
| `LCO` | "LCL delivery cut-off," only when receipt is at a container freight station | The LCL cargo misses consolidation |
| `EFC` | "Earliest full-container delivery date" | Gating in earlier is refused or charged |

Every cut-off is an instant at a facility, displayed in the terminal's time zone, and each one can move when the vessel's schedule does; the booking keeps the history, because "the cut-off changed after we planned the dray" is a dispute about who pays for a missed sailing.

## Booking

A booking reserves equipment and space; the bill of lading comes later, from the shipping instructions. DCSA's Booking API 2.0.0 is the public reference for the life cycle (`POST /v2/bookings` to request, `PUT` to update or amend, `PATCH` to cancel, and a `POST /v2/booking-notifications` endpoint the shipper implements for the carrier's callbacks):

| Status | Meaning, per the standard |
| --- | --- |
| `RECEIVED` | The request has been received |
| `PENDING_UPDATE` | The carrier needs an update from the shipper |
| `UPDATE_RECEIVED` | An update awaits processing |
| `CONFIRMED` | Confirmed, with a transport plan and cut-offs |
| `PENDING_AMENDMENT` | The carrier needs an amendment to a confirmed booking |
| `REJECTED` | Discontinued by the carrier before confirmation |
| `DECLINED` | Discontinued by the carrier after confirmation |
| `CANCELLED` | Discontinued by the shipper |
| `COMPLETED` | The transport document has been surrendered for delivery |

Amendments to a confirmed booking have their own status (`AMENDMENT_RECEIVED`, `AMENDMENT_CONFIRMED`, `AMENDMENT_DECLINED`, `AMENDMENT_CANCELLED`), so a booking can be confirmed on its original terms while a change waits; the system has to show both. The request is identified by the carrier's booking request reference until confirmation, when the carrier booking reference, the number on every later message, is assigned.

The fields that drive everything downstream:

- **Service at each end.** `receiptTypeAtOrigin` and `deliveryTypeAtDestination` are `CY` ("Container yard (incl. rail ramp)"), `SD` ("Store Door") or `CFS` ("Container Freight Station"). CY to CY means the merchant arranges the inland moves (merchant haulage); SD means the carrier does (carrier haulage), which changes who holds the container and who is billed for its time.
- **Cargo movement.** `FCL` (full container load) or `LCL` (less than container load) at each end.
- **Equipment.** Each requested equipment line has an `ISOEquipmentCode`, "an ISO size type (e.g., 22G1) or an ISO type group (e.g., 22GP)" per ISO 6346, a number of units, and `isShipperOwned` for a shipper-owned container (SOC).
- **Routing.** Vessel name and IMO number, the carrier's service code and export voyage number, or, without them, an expected departure date or an expected arrival window at the place of delivery.
- **Commercial reference.** The service contract reference, which selects the rate, the free time and the D&D terms.

Rolling (moving a confirmed booking to a later sailing) arrives as an updated confirmation with a new transport plan. My rule: treat every confirmation as a new version of the booking, keep all of them, and compute "rolled" by comparing the first-leg vessel and voyage across versions, because carriers don't send a distinct "rolled" status.

## Containers and VGM

A container's number is its owner code, equipment category, serial number and check digit under ISO 6346, and its size and type code (`22G1` for a 20-foot general purpose box, `45G1` for a 40-foot high cube) says what it is; [Intermodal & Drayage](/books/logistics/intermodal-and-drayage#containers-and-chassis) carries the same code on `equipment_units` as `size_type_code` for the inland legs. The equipment the shipper books is a type; the container it receives is a unit, assigned when the empty is released, so the booking's equipment lines and the units on the bill of lading are separate records joined late.

Since July 1, 2016, SOLAS regulation VI/2, as amended by resolution MSC.380(94), makes a verified gross mass (VGM) "a condition for loading a packed container onto a ship." The shipper obtains it by one of two methods: weighing the packed container (Method 1), or weighing every package and cargo item, pallets, dunnage and securing material included, and adding the container's tare (Method 2), the second by "a certified method approved by the competent authority" of the state where the container was packed. The shipper states the VGM in a shipping document and submits it to the master and the terminal in time for stowage planning; a VGM entitles nothing, since the master keeps the final say, and a container that arrives without one may be weighed on the shipper's behalf at a cost the parties agree. IMO's guidance is MSC.1/Circ.1475, and DCSA publishes a VGM standard for the exchange.

Three numbers about the same box must stay separate: the cargo gross weight on the shipping instructions (what the bill of lading will show), the VGM (cargo plus tare, signed by a named person under a stated method), and the terminal's scale weight if it weighed the box. Overweight containers and misdeclared weights are a stowage safety issue, which is why the VGM is a record with a signatory and a method, not a column overwritten by the last message.

## Terminals and Port Calls

A marine terminal operator runs the berth, the yard and the gate. For one import container, the carrier's and terminal's events, in the codes DCSA's Track & Trace 2.2 publishes, run:

| Family | Codes |
| --- | --- |
| Transport (the vessel) | `ARRI` "Arrived," `DEPA` "Departed" |
| Equipment (the container) | `GTOT` "Gated out," `STUF` "Stuffed," `GTIN` "Gated in," `LOAD` "Loaded," `DISC` "Discharged," `STRP` "Stripped," `PICK` "Pick-up," `DROP` "Drop-off," `INSP` "Inspected," `RSEA` "Resealed," `RMVD` "Removed" |
| Shipment (the documents) | `RECE`, `DRFT`, `PENA`, `PENU`, `REJE`, `APPR`, `ISSU`, `SURR`, `SUBM`, `VOID`, `CONF`, `REQS`, `CMPL`, `HOLD`, `RELS` |

Each event carries a classifier: `PLN` (planned), `EST` (estimated) or `ACT` (actual), the same split as `shipment_events.classifier`. An estimated arrival is restated many times before the vessel berths, so estimates are kept as a series, not overwritten; Visibility & Tracking and ETAs & Exception Management take that series apart.

The event that starts the import clocks isn't on the list: the date the container is available for pickup, which depends on discharge, customs and carrier holds being released and the terminal making the box deliverable. FMC rules require it on every import demurrage invoice (46 CFR 541.6), and [Detention & Demurrage](/books/logistics/detention-and-demurrage#free-time) builds on it. The dray, the terminal appointment and the out-gate interchange receipt belong to [Intermodal & Drayage](/books/logistics/intermodal-and-drayage#drayage); the hold and release by CBP or a partner agency belong to Customs and Trade.

## The DCSA Standards

DCSA develops its standards with its member carriers, which it calls "founding members," and lists them by journey:

| Journey | Standards |
| --- | --- |
| Shipment | Arrival Notice, Dangerous Goods Declaration, Bill of Lading, Booking |
| Vessel | Operational Vessel Schedules, Commercial Schedules, Port Call, Load List and Bay Plan |
| Across | Document Exchange, Track & Trace |
| Equipment | VGM |

Access matters for a builder. The OpenAPI specifications on DCSA's public SwaggerHub account stop at Track & Trace 2.2.0, Booking 2.0.0 and Bill of Lading (eBL) 3.0.0; DCSA's reference site lists Track & Trace v3.0.0 and Bill of Lading v3.0.4 as "available via DCSA Standards Member and Partner Access," and Booking's current release as 2.0.5. A platform that isn't a member builds against the public versions and maps each carrier's deviations, which is most of the work: DCSA publishes its founding members' implementation progress per standard, and whether a given carrier has implemented one is something to check there and test, not assume.

Track & Trace 2.2 delivers events two ways: `GET /v2/events` with filters (event type, codes, booking or bill or equipment reference), and subscriptions (`/v2/event-subscriptions`), where the publisher POSTs batches of events to the subscriber's `callbackUrl`, the subscriber answers 204, and a shared secret signs each callback in a `Notification-Signature` header ([Signatures](/docs/api-design/webhooks#signatures)). Each event has an `eventID`, which is the deduplication key a consumer needs, because a callback can arrive more than once and carriers re-emit corrected events; the public 2.2 specification defines the 204 answer but not a retry policy.

Mapping DCSA events into the core model is a table, and the unmapped codes are kept rather than dropped:

```go tab="Go"
// DCSA Track & Trace 2.2 codes to the core shipment_events codes.
var dcsaEquipmentCodes = map[string]string{
	"GTOT": "gate_out", "GTIN": "gate_in", "LOAD": "loaded", "DISC": "discharged",
	"STUF": "stuffed", "STRP": "stripped", "PICK": "picked_up", "DROP": "dropped_off",
	"INSP": "inspected", "RSEA": "resealed", "RMVD": "removed",
}

var dcsaClassifiers = map[string]string{"PLN": "planned", "EST": "estimated", "ACT": "actual"}

type DCSAEvent struct {
	EventID            string    `json:"eventID"`
	EventType          string    `json:"eventType"` // SHIPMENT, TRANSPORT, EQUIPMENT
	EventClassifier    string    `json:"eventClassifierCode"`
	EventDateTime      time.Time `json:"eventDateTime"`
	TransportEventCode string    `json:"transportEventTypeCode"`
	EquipmentEventCode string    `json:"equipmentEventTypeCode"`
	EquipmentReference string    `json:"equipmentReference"` // the container number
}

type CoreEvent struct {
	Code, Classifier, SourceCode, DedupeKey string
	OccurredAt                              time.Time
}

func MapDCSA(publisher string, e DCSAEvent) (CoreEvent, error) {
	cls, ok := dcsaClassifiers[e.EventClassifier]
	if !ok {
		return CoreEvent{}, fmt.Errorf("unknown classifier %q", e.EventClassifier)
	}
	var code, src string
	switch e.EventType {
	case "TRANSPORT":
		src = e.TransportEventCode
		code = map[string]string{"ARRI": "arrived", "DEPA": "departed"}[src]
	case "EQUIPMENT":
		src = e.EquipmentEventCode
		code = dcsaEquipmentCodes[src]
	default:
		return CoreEvent{}, fmt.Errorf("document events go to the transport document, not here")
	}
	if code == "" {
		code = "exception" // kept with its source code for review, never dropped
	}
	return CoreEvent{
		Code: code, Classifier: cls, SourceCode: src, OccurredAt: e.EventDateTime,
		DedupeKey: "dcsa:" + publisher + ":" + e.EventID,
	}, nil
}
```

```rust tab="Rust"
use chrono::{DateTime, Utc};
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DcsaEvent {
    #[serde(rename = "eventID")]
    pub event_id: String,
    pub event_type: String, // SHIPMENT, TRANSPORT, EQUIPMENT
    pub event_classifier_code: String,
    pub event_date_time: DateTime<Utc>,
    pub transport_event_type_code: Option<String>,
    pub equipment_event_type_code: Option<String>,
}

pub struct CoreEvent {
    pub code: &'static str,
    pub classifier: &'static str,
    pub source_code: String,
    pub occurred_at: DateTime<Utc>,
    pub dedupe_key: String,
}

fn equipment_code(c: &str) -> Option<&'static str> {
    Some(match c {
        "GTOT" => "gate_out", "GTIN" => "gate_in", "LOAD" => "loaded", "DISC" => "discharged",
        "STUF" => "stuffed", "STRP" => "stripped", "PICK" => "picked_up", "DROP" => "dropped_off",
        "INSP" => "inspected", "RSEA" => "resealed", "RMVD" => "removed",
        _ => return None,
    })
}

pub fn map_dcsa(publisher: &str, e: &DcsaEvent) -> Result<CoreEvent, String> {
    let classifier = match e.event_classifier_code.as_str() {
        "PLN" => "planned", "EST" => "estimated", "ACT" => "actual",
        other => return Err(format!("unknown classifier {other}")),
    };
    let (src, code) = match e.event_type.as_str() {
        "TRANSPORT" => {
            let s = e.transport_event_type_code.clone().unwrap_or_default();
            let c = match s.as_str() { "ARRI" => Some("arrived"), "DEPA" => Some("departed"), _ => None };
            (s, c)
        }
        "EQUIPMENT" => {
            let s = e.equipment_event_type_code.clone().unwrap_or_default();
            let c = equipment_code(&s);
            (s, c)
        }
        _ => return Err("document events go to the transport document, not here".into()),
    };
    Ok(CoreEvent {
        code: code.unwrap_or("exception"), // kept with its source code for review
        classifier,
        source_code: src,
        occurred_at: e.event_date_time,
        dedupe_key: format!("dcsa:{publisher}:{}", e.event_id),
    })
}
```

Shipment events (`ISSU`, `SURR`, `RELS` and the rest) describe documents, not movements, and go to the transport document's history in [Bills of Lading & eBL](/books/logistics/ocean-documents#how-to-build-it). The map is data in a real system, versioned per publisher, because carriers' use of the codes drifts ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).

## How to Build It

In the core model an ocean shipment is a `shipments` row of mode `ocean_fcl` or `ocean_lcl`, the vessel leg is a `loads` row of mode `ocean`, and each container is an `equipment_units` row of kind `container`. Ocean adds the network (voyages and port calls), the booking with its versions, equipment requests and cut-offs, and the VGM. All `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE TABLE vessel_voyages (            -- one vessel's trip on a service, as a carrier names it
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  operator_party_id   UUID NOT NULL REFERENCES parties (id),  -- the carrier operating the vessel
  vessel_imo          TEXT NOT NULL CHECK (vessel_imo ~ '^[0-9]{7,8}$'),  -- DCSA allows 7 or 8 digits
  vessel_name         TEXT NOT NULL,     -- as published for this voyage
  service_code        TEXT,              -- the operator's service code
  voyage_number       TEXT NOT NULL,     -- the operator's; partners may publish their own
  partner_voyage_refs JSONB NOT NULL DEFAULT '{}',  -- {"<carrier party id>": "<voyage no>"}
  UNIQUE (operator_party_id, vessel_imo, voyage_number)
);

CREATE TABLE port_calls (                -- the vessel's visit to one terminal on a voyage
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  vessel_voyage_id   UUID NOT NULL REFERENCES vessel_voyages (id),
  sequence           SMALLINT NOT NULL CHECK (sequence > 0),
  facility_id        UUID NOT NULL REFERENCES facilities (id),  -- a port_terminal facility
  unlocode           CHAR(5) NOT NULL,   -- UN/LOCODE of the port
  planned_arrival    TIMESTAMPTZ,
  estimated_arrival  TIMESTAMPTZ,        -- latest estimate; the series is in shipment_events
  actual_arrival     TIMESTAMPTZ,
  planned_departure  TIMESTAMPTZ,
  estimated_departure TIMESTAMPTZ,
  actual_departure   TIMESTAMPTZ,
  status             TEXT NOT NULL CHECK (status IN ('scheduled', 'omitted', 'arrived',
                       'departed', 'cancelled')),
  UNIQUE (vessel_voyage_id, sequence)
);

CREATE TABLE ocean_bookings (            -- a reservation of space and equipment, all versions
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id         UUID NOT NULL REFERENCES parties (id),  -- the carrier issuing it
  booked_by_party_id       UUID NOT NULL REFERENCES parties (id),  -- shipper or NVOCC
  request_ref              TEXT,         -- carrierBookingRequestReference, before confirmation
  booking_number           TEXT,         -- carrierBookingReference, from confirmation
  version                  INT NOT NULL CHECK (version > 0),
  service_contract_ref     TEXT,         -- selects the rate, free time and D&D terms
  rate_agreement_id        UUID REFERENCES rate_agreements (id),
  receipt_type             TEXT NOT NULL CHECK (receipt_type IN ('CY', 'SD', 'CFS')),
  delivery_type            TEXT NOT NULL CHECK (delivery_type IN ('CY', 'SD', 'CFS')),
  movement_type_origin     TEXT NOT NULL CHECK (movement_type_origin IN ('FCL', 'LCL')),
  movement_type_destination TEXT NOT NULL CHECK (movement_type_destination IN ('FCL', 'LCL')),
  place_of_receipt         TEXT,         -- UN/LOCODE or facility, as booked
  port_of_loading          CHAR(5),
  port_of_discharge        CHAR(5),
  place_of_delivery        TEXT,
  first_vessel_voyage_id   UUID REFERENCES vessel_voyages (id),
  transport_plan           JSONB NOT NULL DEFAULT '[]',  -- legs as confirmed, in order
  status                   TEXT NOT NULL CHECK (status IN ('received', 'pending_update',
                             'update_received', 'confirmed', 'pending_amendment', 'rejected',
                             'declined', 'cancelled', 'completed')),
  amendment_status         TEXT CHECK (amendment_status IN ('amendment_received',
                             'amendment_confirmed', 'amendment_declined', 'amendment_cancelled')),
  status_reason            TEXT,         -- the carrier's stated reason on a rejection or decline
  document_id              UUID REFERENCES documents (id),  -- the message this version came in
  received_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (request_ref IS NOT NULL OR booking_number IS NOT NULL),
  UNIQUE (carrier_party_id, booking_number, version)
);

CREATE TABLE ocean_booking_equipment (   -- what was requested, per version
  ocean_booking_id UUID NOT NULL REFERENCES ocean_bookings (id),
  line_number      SMALLINT NOT NULL,
  iso_equipment_code CHAR(4) NOT NULL,   -- ISO 6346 size type ('45G1') or group ('45GP')
  units            SMALLINT NOT NULL CHECK (units > 0),
  shipper_owned    BOOLEAN NOT NULL DEFAULT FALSE,  -- SOC
  reefer_setpoint_dc SMALLINT,           -- tenths of a degree Celsius, reefers only
  PRIMARY KEY (ocean_booking_id, line_number)
);

CREATE TABLE ocean_booking_cutoffs (     -- the carrier's cut-offs, per version
  ocean_booking_id UUID NOT NULL REFERENCES ocean_bookings (id),
  code             TEXT NOT NULL CHECK (code IN ('DCO', 'VCO', 'FCO', 'LCO', 'EFC')),
  facility_id      UUID REFERENCES facilities (id),  -- displayed in its time zone
  cutoff_at        TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (ocean_booking_id, code)
);

CREATE TABLE container_vgms (            -- a verified gross mass, as declared
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  equipment_id        UUID NOT NULL REFERENCES equipment_units (id),
  ocean_booking_id    UUID NOT NULL REFERENCES ocean_bookings (id),
  method              TEXT NOT NULL CHECK (method IN ('method_1', 'method_2')),
  vgm_g               BIGINT NOT NULL CHECK (vgm_g > 0),  -- cargo plus tare
  responsible_party_id UUID NOT NULL REFERENCES parties (id),  -- the shipper
  signatory_name      TEXT NOT NULL,     -- the person who signed it
  weighed_at_facility_id UUID REFERENCES facilities (id),
  weighed_at          TIMESTAMPTZ,
  submitted_at        TIMESTAMPTZ NOT NULL,
  superseded_by       UUID REFERENCES container_vgms (id),  -- a correction is a new row
  document_id         UUID REFERENCES documents (id)
);

ALTER TABLE shipments
  ADD COLUMN ocean_booking_number TEXT,  -- the carrier booking reference this shipment rides
  ADD COLUMN ocean_carrier_party_id UUID REFERENCES parties (id);
ALTER TABLE shipments ADD CONSTRAINT shipments_ocean_booking_check
  CHECK (ocean_booking_number IS NULL OR ocean_carrier_party_id IS NOT NULL) NOT VALID;

ALTER TABLE loads
  ADD COLUMN vessel_voyage_id      UUID REFERENCES vessel_voyages (id),  -- ocean legs
  ADD COLUMN load_port_call_id     UUID REFERENCES port_calls (id),
  ADD COLUMN discharge_port_call_id UUID REFERENCES port_calls (id);
ALTER TABLE loads ADD CONSTRAINT loads_ocean_voyage_check
  CHECK (mode <> 'ocean' OR vessel_voyage_id IS NOT NULL) NOT VALID;

ALTER TABLE equipment_units
  ADD COLUMN shipper_owned      BOOLEAN NOT NULL DEFAULT FALSE,  -- SOC containers
  ADD COLUMN max_gross_weight_g BIGINT;  -- from the safety approval plate

-- Event codes become rows: a later chapter adds its codes with an INSERT
-- instead of restating every earlier chapter's list in a new CHECK.
CREATE TABLE shipment_event_codes (      -- the codes shipment_events may carry
  code     TEXT PRIMARY KEY,
  added_by TEXT NOT NULL                 -- the chapter or migration that introduced it
);
INSERT INTO shipment_event_codes (code, added_by) VALUES
  ('booked', 'core'), ('pickup_arrived', 'core'), ('picked_up', 'core'), ('departed', 'core'),
  ('position', 'core'), ('arrived', 'core'), ('out_for_delivery', 'core'),
  ('delivery_arrived', 'core'), ('delivered', 'core'), ('gate_in', 'core'),
  ('gate_out', 'core'), ('loaded', 'core'), ('discharged', 'core'), ('available', 'core'),
  ('customs_released', 'core'), ('hold', 'core'), ('exception', 'core'),
  ('eta_updated', 'core'),
  ('stuffed', 'ocean'), ('stripped', 'ocean'), ('inspected', 'ocean'), ('resealed', 'ocean'),
  ('removed', 'ocean'), ('dropped_off', 'ocean');
ALTER TABLE shipment_events ADD CONSTRAINT shipment_events_code_fkey
  FOREIGN KEY (code) REFERENCES shipment_event_codes (code) NOT VALID;
ALTER TABLE shipment_events DROP CONSTRAINT shipment_events_code_check;

CREATE INDEX CONCURRENTLY port_calls_facility_arrival_idx
  ON port_calls (facility_id, estimated_arrival);
CREATE INDEX CONCURRENTLY ocean_bookings_number_idx
  ON ocean_bookings (carrier_party_id, booking_number);
ALTER TABLE shipments VALIDATE CONSTRAINT shipments_ocean_booking_check;
ALTER TABLE loads VALIDATE CONSTRAINT loads_ocean_voyage_check;
ALTER TABLE shipment_events VALIDATE CONSTRAINT shipment_events_code_fkey;
```

The question a shipper's export desk asks every morning, which containers face a VGM cut-off in the next 48 hours with no current VGM, reads straight off these tables:

```sql
WITH current_booking AS (
  SELECT DISTINCT ON (carrier_party_id, booking_number) *
  FROM ocean_bookings
  WHERE booked_by_party_id = $1 AND booking_number IS NOT NULL
  ORDER BY carrier_party_id, booking_number, version DESC
)
SELECT b.booking_number, e.identifier AS container, c.cutoff_at, f.time_zone
FROM current_booking b
JOIN ocean_booking_cutoffs c ON c.ocean_booking_id = b.id AND c.code = 'VCO'
LEFT JOIN facilities f ON f.id = c.facility_id
JOIN shipments s ON s.ocean_booking_number = b.booking_number
                AND s.ocean_carrier_party_id = b.carrier_party_id
JOIN load_shipments ls ON ls.shipment_id = s.id
JOIN loads l ON l.id = ls.load_id AND l.mode = 'ocean'
JOIN equipment_units e ON e.id = l.trailer_id      -- the container on the ocean leg
WHERE b.status = 'confirmed'
  AND c.cutoff_at BETWEEN NOW() AND NOW() + INTERVAL '48 hours'
  AND NOT EXISTS (
    SELECT 1 FROM container_vgms v
    WHERE v.equipment_id = e.id AND v.superseded_by IS NULL
      AND v.ocean_booking_id IN (SELECT id FROM ocean_bookings
                                 WHERE carrier_party_id = b.carrier_party_id
                                   AND booking_number = b.booking_number))
ORDER BY c.cutoff_at;
```

Design notes:

- **Event codes are rows.** The core model's `CHECK` on `shipment_events.code` gives way to a foreign key to `shipment_event_codes`, which holds the core codes and the six ocean equipment codes; a later chapter that needs a code ([Air Cargo](/books/logistics/air-cargo#how-to-build-it) adds four) inserts it, and no chapter restates another's list. The key is added before the check is dropped, so new rows stay checked throughout.
- **A booking is a version chain.** Every confirmation, update and amendment is a new `ocean_bookings` row with the same booking number and a higher version; the current one is the highest, and a roll, an equipment swap or a changed cut-off is a difference between two rows ([Versioned Entities](/docs/database/temporal-data#versioned-entities)).
- **The vessel is its IMO number.** Names change, chartered ships change operators, and partners in an alliance publish different voyage numbers for the same sailing; `partner_voyage_refs` lets a message from any partner find the voyage.
- **Cut-offs are instants at a facility.** Stored as `TIMESTAMPTZ` with the terminal's facility, displayed in its zone, and versioned with the booking, so a missed cut-off can be judged against the one in force when the truck was dispatched.
- **The VGM is a declaration, not a weight column.** It has a method, a signatory and a time, and a correction supersedes it rather than overwriting it; the cargo gross weight on the shipping instructions and a terminal's scale weight live elsewhere and are compared, not merged.
- **Type is booked, unit is assigned.** `ocean_booking_equipment` holds the requested ISO type and count; the container numbers arrive with the empty release and the shipping instructions and are linked through the ocean load's equipment.
- **Estimates are a series.** `port_calls.estimated_arrival` is the latest, for display; every estimate is a `shipment_events` row with classifier `estimated`, so a reliability measure can compare what each carrier said with what happened.
- **Emit the ocean events.** `ocean_booking.confirmed`, `ocean_booking.rolled`, `cutoff.changed`, `vgm.missing`, `container.gated_in`, `container.loaded`, `vessel.departed`, `vessel.eta_changed` and `container.discharged` are what customer notifications, the dray planner and D&D monitoring subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every booking version as received,** with the message it arrived in, its status, reason and cut-offs, so a rolled container or a declined booking can be shown with the carrier's own words and times, including as evidence for a refusal-of-space complaint.
- **The service contract reference on every booking,** because the rate, free time and detention and demurrage terms in a later dispute are judged against the contract named at booking.
- **Every VGM with its method, signatory and time,** and every superseded one, since SOLAS makes the shipper responsible for the declared figure.
- **Every vessel and container event with its classifier, occurred and received times and publisher,** so the date a container was discharged or made available can be proven when the invoices come ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)).

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Key vessels by IMO number and voyages by operator,** and let partners' voyage numbers resolve to the same voyage.
- **Store every booking version,** and derive rolls and changes by comparing versions.
- **Keep cut-offs as instants at a terminal facility,** versioned with the booking.
- **Record the VGM as a signed declaration** with its method, separate from the cargo weight and any scale weight.
- **Separate the booked equipment type from the assigned container unit.**
- **Keep estimated arrivals as a series** and measure each carrier's estimates against actuals.
- **Build to DCSA's public versions and map each carrier's deviations,** deduplicating events on their `eventID`.
- **Carry the service contract reference from booking onward,** because pricing, free time and D&D all hang off it.

## References

**Filings and reports**

- [Hapag-Lloyd: Annual Report 2025](https://www.hapag-lloyd.com/content/dam/website/downloads/ir/HLAG_FY_2025_EN.pdf), transport volume, freight rate, fleet and container figures, services, the Gemini Cooperation and its reliability, the end of THE Alliance and the 2M, the Ocean and Premier Alliances, the top ten carriers' share, and their vessel capacity from Drewry (Q4 2025) and MDS Transmodal (January 2026)
- [ZIM Integrated Shipping Services: Form 20-F for 2025](https://www.sec.gov/Archives/edgar/data/1654126/000117891326000784/zk2634463.htm), TEU carried, fleet and chartered share, capacity, customers, no alliance membership, the MSC operational agreements, the end of the 2M and the Hapag-Lloyd merger agreement of February 16, 2026 at $35.00 a share
- [ZIM Integrated Shipping Services: Third quarter 2026 results, Form 6-K exhibit 99.1 (November 18, 2026)](https://www.sec.gov/Archives/edgar/data/1654126/000117891326005268/exhibit_99-1.htm), the merger's shareholder approval on April 30, 2026, the terminated Israeli application, outstanding regulatory approvals and the targeted first-quarter 2027 closing

**Statutes and regulations**

- [46 U.S.C. 41104: Common carriers](https://www.law.cornell.edu/uscode/text/46/41104), unreasonable refusal of cargo space and refusal to deal
- [46 CFR 530.3: Service contract definitions](https://www.law.cornell.edu/cfr/text/46/530.3), service contracts, minimum quantity commitments, filing and effective time
- [46 CFR Part 542: Common carrier prohibitions](https://www.law.cornell.edu/cfr/text/46/part-542), the rule on unreasonable refusal to deal over vessel space and its July 23, 2024 source
- [46 CFR 541.6: Contents of invoice](https://www.law.cornell.edu/cfr/text/46/541.6), the container availability date on import invoices

**Standards**

- [DCSA: Standards](https://dcsa.org/standards), the standards by journey, founding members and their implementation progress
- [DCSA: Booking API 2.0.0](https://api.swaggerhub.com/apis/dcsaorg/DCSA_BKG/2.0.0), endpoints, the 7 or 8 digit IMO number, booking, amendment and cancellation statuses, references, receipt and delivery types, cargo movement types, ISO equipment codes, shipper-owned containers, the transport plan and cut-off codes
- [DCSA: Track & Trace API 2.2.0](https://api.swaggerhub.com/apis/dcsaorg/DCSA_TNT/2.2.0), event queries, subscriptions, callbacks, the 204 answer and the Notification-Signature header
- [DCSA: Event domain 1.0.4](https://api.swaggerhub.com/domains/dcsaorg/EVENT_DOMAIN/1.0.4), transport, equipment and shipment event codes and classifiers
- [DCSA: Track & Trace v3 release](https://reference.dcsa.org/content/standards/releases/track-and-trace/v3), v3.0.0 available via member and partner access
- [DCSA: Bill of Lading v3 release](https://reference.dcsa.org/content/standards/releases/bill-of-lading/v3), v3.0.4 available via member and partner access
- [DCSA: Booking releases](https://reference.dcsa.org/content/standards/releases/booking), Booking v2 current at 2.0.5
- [IMO: Verification of the gross mass of a packed container](https://www.imo.org/en/OurWork/Safety/Pages/Verification-of-the-gross-mass.aspx), SOLAS VI/2, MSC.380(94), July 1, 2016, the two methods, the shipper's duty, the master's discretion and MSC.1/Circ.1475
