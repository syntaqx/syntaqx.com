+++
title = "Transportation EDI"
description = "X12 for freight: the 204 load tender, 990 response, 214 status and 210 invoice segment by segment, partner variance, code maps, versions, ocean and rail sets."
category = "Logistics & Supply Chain Industry"
order = 2834
part = "Data and Visibility"
tags = ["logistics", "edi", "x12", "load-tender", "shipment-status", "freight-invoice", "data-model"]
+++

Transportation EDI is how shippers, brokers and carriers exchange the four documents that run a truckload or LTL move without anyone retyping them: the load tender (X12 204, "Motor Carrier Load Tender"), the answer to it (990, "Response to a Load Tender"), the status messages while the freight moves (214, "Transportation Carrier Shipment Status Message") and the bill at the end (210, "Motor Carrier Freight Details and Invoice"). Around them sit a few dozen less common sets for bills of lading, pickup manifests, ocean bookings and statuses, rail waybills and claims. A broker with a few thousand carriers and a few hundred shipper customers maintains a 204, 990, 214 and 210 map for each partner that trades electronically, and every load's tender, coverage, milestones and invoice pass through them.

The messages are old and stable; what makes them hard is that every partner implements them differently, and the differences are in meaning rather than syntax. CN marks a changed tender with purpose code 04; Kroger's Harris Teeter 204 uses 05. The X12 code for declining a tender is D, "Reservation Cancelled," but C.H. Robinson's truckload guide treats R as a decline and U as an accept. Delivery arrives as CD from one partner and D1 from another, and the same two letters mean a status in one element and a late reason in the next (AF is "Departed Pickup Location" as a status and "Accident" as a reason). Times are local, without a zone. Invoices arrive before delivery with an estimated delivery date. A parser that reads the X12 code list instead of the partner's guide gets loads covered that weren't, deliveries that didn't happen and invoices that don't match.

This chapter covers the transportation sets and where each lands in the core model, the 204, 990, 214 and 210 segment by segment against published implementation guides, the ocean and rail sets, versions, partner code maps, and onboarding. It extends `documents`, `tenders`, `shipment_events` and `freight_invoices` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). The generic X12 machinery is the Commerce volume's: the interchange, group and transaction set envelopes and their control numbers ([Envelopes and Acknowledgments](/books/commerce/edi#envelopes-and-acknowledgments)), the 997 and 999, VANs, AS2 and SFTP ([Transport: VANs, AS2, SFTP and APIs](/books/commerce/edi#transport-vans-as2-sftp-and-apis)), partner testing ([Partner Testing](/books/commerce/edi#partner-testing)), and the retail sets (850, 856, 810). The tender's life cycle that the 204 and 990 drive is Tendering & Acceptance; rail EDI is in [Rail Freight](/books/logistics/rail-freight#waybills-interchange-and-car-events); what the status messages feed is [Visibility & Tracking](/books/logistics/visibility-and-tracking) and [ETAs & Exception Management](/books/logistics/etas-and-exceptions).

## How the Partners Do It

Transportation EDI has no single standard implementation; it has published guides. As of November 2026, from guides that carriers, brokers and shippers post publicly for their trading partners:

| Partner | Sets and versions, as published | Rules that differ from the bare standard |
| --- | --- | --- |
| **CN** (rail carrier taking truckload tenders) | 204 version 004010, which "closely complies with the official published Motor Carrier Industry Guide to Electronic Data Interchange Implementation and Conventions" | A 990 "is generated for every EDI 204 Load Tender received by CN within a half hour of receipt"; "All orders are automatically accepted"; B2A-01 codes 00 original, 01 cancellation, 04 update; G62 qualifier 64 "Must Respond By"; connects through its MFT server, an FTP push, or "all major VAN's" |
| **C.H. Robinson** (broker) | Truckload 990 version 4010; LTL 214 version 4010 (guide dated October 12, 2021); dray 214 version 4010 | 990 B1-04 limited to A, D, R and U: "If you use R we will consider this as a Decline," "If you use U will consider this as an Accept"; B1-02 is "CHR Load Number (Sent in the B2_04 on the 204 Load Tender)"; LTL 214 must carry X3 and AF for every pickup and X1 and CD for every delivery, in-transit X6 "every 15 minutes," one location per 214; dray 214 completes delivery with D1 and adds OA and I1 gate moves |
| **Kroger** (shipper, Harris Teeter freight) | 204 version 4030 (modified December 15, 2025); 214 version 4010 | B2A-01 codes 00 Original, 01 Cancellation, 05 Replace; stop G62 carries dates only (10 Requested Ship Date/Pick-up Date, 68 Requested Delivery Date); the 214 uses AT7-01 CD "Carrier Departed Delivery Location" with reason NS |
| **XPO** (LTL carrier) | 990 version 4010; 210 version 4010 (guide dated September 25, 2015) | 990 B1-04 lists all seven codes (A, B, C, D, N, R, U); 210 method of payment CC Collect or PP Prepaid (by Seller), delivery date qualified 017 Estimated Delivery or 035 Delivered, special charge codes DSC, FUE, HAZ and PYS |

Four patterns:

- **The guide is the contract, not the standard.** Every partner publishes which segments, elements and codes it sends and accepts, and narrows or reinterprets the X12 code list. A map is built from the partner's guide and tested against its samples; the X12 dictionary is only the vocabulary.
- **Partners disagree on meaning, not on syntax.** The parsers are the easy part; the 04 and 05 change codes, R as a decline, CD and D1 as delivery are meaning, and meaning lives in a per-partner code map with dates ([Partner Code Maps](#partner-code-maps)).
- **Version 4010 still dominates.** Every guide surveyed except Kroger's 204 is 4010, a release from 1997, and partners pin it in their guides; a newer version is a partner project, not an upgrade.
- **Timeliness is part of the spec.** CN answers within half an hour, C.H. Robinson wants statuses within 15 minutes and in-transit pings every 15; the received time of every message is as much a contract measure as its content.

## The Transportation Sets

X12's transportation sets, with their official titles, who sends them, and where each lands in the core model:

| Set | Title | Usual direction | Where it lands |
| --- | --- | --- | --- |
| **204** | Motor Carrier Load Tender | Shipper or broker to carrier | `tenders`, `loads`, `stops`, `shipments` |
| **990** | Response to a Load Tender | Carrier to tenderer | `tenders` |
| **214** | Transportation Carrier Shipment Status Message | Carrier to shipper or broker, broker to shipper | `shipment_events`, `stops` |
| **210** | Motor Carrier Freight Details and Invoice | Carrier to bill-to party | `freight_invoices`, `freight_invoice_lines` |
| **211** | Motor Carrier Bill of Lading | Shipper to carrier | `shipments`, `documents` |
| **212** | Motor Carrier Delivery Trailer Manifest | Carrier to consignee | `documents` |
| **213** | Motor Carrier Shipment Status Inquiry | Shipper to carrier | A request answered by a 214 |
| **215** | Motor Carrier Pickup Manifest | Shipper to carrier | `shipments`, `stop_shipments` |
| **216** | Motor Carrier Shipment Pickup Notification | Shipper to carrier | A pickup request |
| **217** | Motor Carrier Loading and Route Guide | Shipper to carrier | Routing instructions, kept as `documents` |
| **300**, **301**, **303** | Reservation (Booking Request) (Ocean); Confirmation (Ocean); Booking Cancellation (Ocean) | Shipper or forwarder and ocean carrier | Ocean bookings (Ocean Shipping) |
| **304** | Shipping Instructions | Shipper or forwarder to ocean carrier | The data for the bill of lading |
| **310** | Freight Receipt and Invoice (Ocean) | Ocean carrier to bill-to party | `freight_invoices`, `documents` |
| **315** | Status Details (Ocean) | Ocean carrier to shipper | `shipment_events` with source `edi_315` |
| **317** | Delivery/Pickup Order | Forwarder or broker to a drayage carrier | A dray load |
| **322** | Terminal Operations and Intermodal Ramp Activity | Terminal or railroad to customer | `shipment_events` ([Ramps and Rail Legs](/books/logistics/intermodal-and-drayage#ramps-and-rail-legs)) |
| **323** | Vessel Schedule and Itinerary (Ocean) | Ocean carrier to customer | Vessel schedules |
| **404**, **410**, **417**, **418**, **426** | Rail shipment information, invoice, waybill interchange, advance consist, revenue waybill | Shipper and railroads | [Rail Freight](/books/logistics/rail-freight#waybills-interchange-and-car-events) |
| **858**, **859** | Shipment Information; Freight Invoice | Shipper and carrier, any mode | `shipments`; `freight_invoices` |
| **920**, **924** | Loss or Damage Claim - General Commodities; Loss or Damage Claim - Motor Vehicle | Claimant to carrier | [Cargo Liability & Claims](/books/logistics/cargo-claims) |
| **820** | Payment Order/Remittance Advice | Payer to carrier | Payments against `freight_invoices` |
| **824** | Application Advice | Any receiver | A business rejection of a document |
| **997**, **999** | Functional Acknowledgment; Implementation Acknowledgment | Every receiver | `edi_functional_acks` |

Each set travels in a functional group whose GS-01 identifier names its kind: SM for the 204 (CN's and Kroger's samples), GF for the 990 (XPO), QM for the 214 (C.H. Robinson) and IM for the 210 (XPO). A partner who sends tenders, statuses and invoices sends three groups, each acknowledged by its own 997; C.H. Robinson's 214 guide says it "will send 997 functional acknowledgements, indicating the EDI syntax acceptance status of the received 214." The four motor carrier sets carry nearly all the volume, and the rest of this chapter is about them.

## The 204 Load Tender

A 204 is one load: a header naming the carrier, the shipment ID and the payment terms; references, dates, equipment and parties for the whole load; and a stop loop with each stop's reason, dates, weight and parties. CN's published sample, trimmed and with its placeholders kept:

```text
ISA*00*    *00*KNSX *01*GENERIC *02*CNBH        *250116*0911*U*00401*000014741*1*P*>
GS*SM*GENERIC*CNBH*20250116*0911*2695*X*004010
ST*204*0001
B2**CNBH**ShipmentID*L*PP
B2A*00*LT
L11*ReferenceID*CR
G62*64*20250106*1*1016*LT
N1*SH*Customer Name
N1*BT*Customer Name
N7**0*********TA****5300
S5*1*CL
G62*10*20250107
AT8*G*L*27912.83*1365
N1*SF*Customer Name
S5*2*CU
L11*666666*PO
G62*68*20250112
AT8*G*L*27912.83*1365
N1*ST*Customer Name
L3*27912.83*G*******200*L*1365*L
SE*32*0001
```

How the segments land:

| Segment | Elements, as CN and Kroger document them | Core model |
| --- | --- | --- |
| **B2** | B2-02 SCAC (`CNBH`), B2-04 shipment identification number, B2-05 weight unit (`L` pounds), B2-06 method of payment (`PP` prepaid) | `tenders.carrier_party_id` via `carriers.scac`; `tenders.external_ref`; `shipments.payment_terms` |
| **B2A** | B2A-01 purpose: 00 original, 01 cancellation, 04 update (CN) or 05 replace (Kroger); B2A-02 `LT`, "Load Tender - Truckload (TL) Carrier Only" | A new tender, a cancellation, or a new revision of the tender |
| **L11** | Reference numbers with qualifiers (`CR` customer reference, `PO` purchase order) | `shipments` and `orders` references, `external_refs` |
| **G62** (header) | Qualifier 64 "Must Respond By," date CCYYMMDD, time HHMM, time code `LT` | `tenders.expires_at`, converted from local time |
| **N1, N3, N4** (header) | Parties: SH shipper, BT bill-to, OB ordered by | `shipments.shipper_party_id`, `bill_to_party_id`, matched to `parties` |
| **N7** | Equipment: length and type | `loads.equipment_type` |
| **S5** | Stop sequence and reason: CL "complete" (load), CU "complete unload" | `stops.sequence`, `stops.kind` |
| **G62** (stop) | 10 requested pickup, 38 ship no later than, 68 requested delivery, 54 deliver no later than | `stops.appointment`, `shipments.pickup_window`, `delivery_window` |
| **AT8, OID** | Weight, lading quantity, and order-level detail (PO, pallets, weight) per stop | `stop_shipments`, `shipment_lines`, `handling_units` counts |
| **N1** (stop) | SF ship from, ST ship to | `stops.facility_id` via `facilities` |
| **L3** | Total weight and quantity | Checked against the sum of the stops |

Rules that come from the guides rather than the standard:

- **The shipment ID is the join key for everything after.** C.H. Robinson's 990 guide says B1-02 carries its load number "Sent in the B2_04 on the 204 Load Tender"; the 214's B10 and the 210's B3-03 carry the same number back. Store it on the tender (`tenders.external_ref`) and the load, and match every later message on it plus the sender, never on this system's key ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).
- **A change is a revision, whatever its code.** 04 at CN and 05 at Kroger both mean "this replaces the tender you have"; the partner map turns either into a new revision of the tender that needs a new answer, and 01 into a withdrawal or cancellation. Tendering & Acceptance owns the states; this chapter owns reading the code.
- **Times are local, zones are inferred.** CN's G62 carries time code `LT`, local time, with no offset; Kroger's stop G62s carry no time at all. The respond-by time is converted with the zone the trading partner agreement names, and stop dates with the facility's zone ([Time Zone From the Place](/docs/fundamentals/addresses#time-zone-from-the-place)); a date with no time is a day-long window in that zone, not midnight UTC.
- **Stop parties are facilities to match, not to create.** N1 SF and ST name a place by name, address and often a partner's own location code. Matching to an existing `facilities` row (by the partner's code, then by address) comes first; an unmatched stop is a review task, because a new facility row silently created from every spelling of a dock splits its history.
- **Totals are checks.** L3's weight and quantity should equal the sum of the stops' AT8s; a mismatch is a data error to flag before the tender is accepted, not after the carrier reweighs.

## The 990 Response

The 990 is short: a B1 segment with the carrier's SCAC (B1-01), the shipment ID it is answering (B1-02), an optional date (B1-03, "the booking date accepted by the carrier" in XPO's guide) and the reservation action code (B1-04), optionally with N9 references and K1 remarks. XPO's guide lists all seven X12 codes for B1-04; C.H. Robinson accepts four and reinterprets two:

| B1-04 | X12 name | XPO | C.H. Robinson | Tender state it maps to |
| --- | --- | --- | --- | --- |
| A | Reservation Accepted | Used | Used | `accepted` |
| B | Conditional Acceptance | Used | Not used | `conditionally_accepted`, conditions from K1 |
| C | Counter Proposal Made | Used | Not used | `countered` |
| D | Reservation Cancelled | Used | Used | `rejected` |
| N | New | Used | Not used | Partner-specific; review |
| R | Delete | Used | "we will consider this as a Decline" | `rejected` at C.H. Robinson |
| U | Change | Used | "we will consider this as an Accept" | `accepted` at C.H. Robinson |

The rules:

- **D is the decline.** The X12 name "Reservation Cancelled" reads like a cancellation of an accepted load, and a parser that treats it that way leaves rejected tenders open until they expire. Partners then add their own readings (R and U above), so B1-04 goes through the partner's code map, with the raw code kept in `tenders.response_code`.
- **Some answers are automatic.** CN accepts every 204 and returns the 990 within half an hour; an acceptance rate measured on that partner measures nothing. The partner map records that the partner auto-accepts.
- **An answer applies once.** The same 990 resent, or arriving after the tender expired or was withdrawn, is stored and applied by the tender's transition rules, never by overwriting its status; Tendering & Acceptance owns those rules.
- **The 997 is not the answer.** A 997 for the 204 says the carrier's translator parsed it; only the 990 says what the carrier decided. A tender with a 997 and no 990 by its expiry has expired.

## The 214 Shipment Status

A 214 reports one or more statuses for one shipment: a B10 header (the carrier's reference, the shipment ID and the SCAC), references (L11), parties (N1 loops), and an LX loop per status, each with an AT7 (the status), an MS1 (where), an MS2 (the equipment) and an AT8 (weight and quantity). C.H. Robinson's LTL guide sample:

```text
ST*214*0001~
B10*3131060*403511627*SCAC~
L11*403511627*AG~
N1*SH*ERCO LLC*ZZ*20109906~
N1*CN*Richer V*ZZ*PLT1125~
LX*1~
AT7*D1*NS***20220717*1748*LT~
MS1*Edinburg*TX*US~
AT8*Z*L*43539*43500~
SE*15*0001~
```

The AT7 carries the meaning, in seven elements with syntax rules that the parser has to enforce: "Only one of AT701 or AT703 may be present"; AT701 and AT702 come as a pair, and so do AT703 and AT704; AT705 is the date (CCYYMMDD), AT706 the time (HHMM), and AT707 the time code.

- **AT701, shipment status code** (42 codes in 4010, per C.H. Robinson's guide): X3 Arrived at Pickup Location, AF Departed Pickup Location, X1 Arrived at Delivery Location, CD Departed Delivery Location (delivery complete), D1 Completed Delivery (or "Completed Unloading at Delivery Location"), X6 En Route to Location, I1 In-Gate, OA Out-Gate.
- **AT702, status reason code** (86 codes in 4010): NS "Normal Status," or a late reason such as AF Accident, AG Consignee Related, AH Driver Related or AI Mechanical Breakdown from C.H. Robinson's dray code list.
- **AT703, appointment status code**: AA "Pick-up Appointment Date and/or Time," AB "Delivery Appointment Date and/or Time," with AT704 its reason.
- **AT707, time code**: C.H. Robinson includes only `LT` Local Time and says "The date/time in AT7_05 & 06 are local time. Noadjustments should be made for time zones."
- **MS1**: city, state and country, or longitude and latitude, of the event.

The partners' rules on top:

- **Required milestones.** C.H. Robinson's LTL guide: "At a minimum C.H. Robinson must receive the X3 & AF for every Pick Up location and X1 & CD for every Delivery location on all shipments."
- **Cadence and latency.** In-transit X6 updates "every 15 minutes," statuses "Ideally within 15 minutes of the event," and "CH Robinson needs to receive 214 status updates within one hour of the event occurrence."
- **Shape.** "A 214 load status report to C.H. Robinson should report a status(s) for one and only one location," so a three-stop load needs three 214s; at most one LX loop with two AT7 loops.
- **Delivery has two codes.** C.H. Robinson's LTL guide ends delivery with CD, its dray guide with D1, and Kroger's 214 uses CD. A receiver that knows only one of them never sees some deliveries.

Mapped into the core model, a 214's AT7 is one `shipment_events` row: the code through the partner map (X3 to `pickup_arrived`, AF to `picked_up`, X1 to `delivery_arrived`, CD and D1 to `delivered`, X6 to `position`, I1 to `gate_in`, OA to `gate_out`), `source` `edi_214`, `source_code` AT701, `reason_code` AT702, `occurred_at` from AT705 and AT706 in the zone of the stop's facility, `reported_tz` as stated, `received_at` from the interchange, and the stop matched from the N1 loop or the MS1 location. An AT703 appointment status is not an event: it sets or moves `stops.appointment` and is kept as the document that did it. The parse, written to fail loudly on syntax and to keep anything it can't map:

```go tab="Go"
// AT7 is one status loop from a 214, after the segment has been split.
type AT7 struct {
	Status, Reason          string // AT701, AT702
	Appointment, ApptReason string // AT703, AT704
	Date, Time, TimeCode    string // AT705 CCYYMMDD, AT706 HHMM, AT707
}

type ShipmentEvent struct {
	LoadID, StopID       string
	Code                 string // core code, from the partner map
	SourceCode, Reason   string // as received
	OccurredAt           time.Time
	ReportedTZ           string
	PartnerCodeMapID     string // which map row decided the code
	DedupeKey            string
}

// CodeMap resolves a partner's code for one field, at the time of the event.
type CodeMap interface {
	Lookup(field, code string, at time.Time) (meaning, mapID string, ok bool)
}

var ErrSyntax = errors.New("214 AT7 syntax")

// EventFromAT7 builds one shipment_events row. loc is the stop facility's zone,
// used because the partner sends local time with no offset.
func EventFromAT7(a AT7, sender, shipmentID, loadID, stopID string,
	loc *time.Location, m CodeMap) (*ShipmentEvent, error) {
	if (a.Status == "") == (a.Appointment == "") {
		return nil, fmt.Errorf("%w: exactly one of AT701 or AT703", ErrSyntax)
	}
	if a.Status != "" && a.Reason == "" {
		return nil, fmt.Errorf("%w: AT701 needs AT702", ErrSyntax)
	}
	if a.Appointment != "" {
		return nil, nil // an appointment status updates stops.appointment, not events
	}
	if a.TimeCode != "" && a.TimeCode != "LT" {
		// a partner that sends UTC or an offset code gets its own map entry for it
		return nil, fmt.Errorf("%w: time code %q not in partner map", ErrSyntax, a.TimeCode)
	}
	if len(a.Time) < 4 {
		return nil, fmt.Errorf("%w: AT706 %q", ErrSyntax, a.Time)
	}
	t, err := time.ParseInLocation("200601021504", a.Date+a.Time[:4], loc)
	if err != nil {
		return nil, fmt.Errorf("%w: AT705/AT706: %v", ErrSyntax, err)
	}
	ev := &ShipmentEvent{
		LoadID: loadID, StopID: stopID,
		SourceCode: a.Status, Reason: a.Reason,
		OccurredAt: t.UTC(), ReportedTZ: loc.String(),
	}
	if code, mapID, ok := m.Lookup("AT701", a.Status, t); ok {
		ev.Code, ev.PartnerCodeMapID = code, mapID
	} else {
		ev.Code = "exception" // kept, flagged, and the map gets a review task
	}
	ev.DedupeKey = strings.Join([]string{"edi_214", sender, shipmentID, a.Status,
		ev.OccurredAt.Format(time.RFC3339)}, "|")
	return ev, nil
}
```

```rust tab="Rust"
use chrono::{DateTime, NaiveDateTime, TimeZone, Utc};
use chrono_tz::Tz;

/// One status loop from a 214, after the segment has been split.
pub struct At7<'a> {
    pub status: &'a str, pub reason: &'a str,           // AT701, AT702
    pub appointment: &'a str, pub appt_reason: &'a str, // AT703, AT704
    pub date: &'a str, pub time: &'a str, pub time_code: &'a str, // AT705-AT707
}

pub struct ShipmentEvent {
    pub code: String,               // core code, from the partner map
    pub source_code: String,        // as received
    pub reason_code: String,
    pub occurred_at: DateTime<Utc>,
    pub reported_tz: String,
    pub partner_code_map_id: Option<String>,
    pub dedupe_key: String,
}

pub trait CodeMap {
    /// A partner's code for one field, at the time of the event: (meaning, map row id).
    fn lookup(&self, field: &str, code: &str, at: DateTime<Utc>) -> Option<(String, String)>;
}

#[derive(Debug)]
pub struct SyntaxError(pub String);

/// Builds one shipment_events row; `tz` is the stop facility's zone, because the
/// partner sends local time with no offset. Ok(None) is an appointment status.
pub fn event_from_at7(a: &At7, sender: &str, shipment_id: &str, tz: Tz, m: &impl CodeMap)
    -> Result<Option<ShipmentEvent>, SyntaxError> {
    if a.status.is_empty() == a.appointment.is_empty() {
        return Err(SyntaxError("exactly one of AT701 or AT703".into()));
    }
    if !a.status.is_empty() && a.reason.is_empty() {
        return Err(SyntaxError("AT701 needs AT702".into()));
    }
    if !a.appointment.is_empty() {
        return Ok(None); // updates stops.appointment, not events
    }
    if !a.time_code.is_empty() && a.time_code != "LT" {
        return Err(SyntaxError(format!("time code {:?} not in partner map", a.time_code)));
    }
    let hhmm = a.time.get(..4).ok_or_else(|| SyntaxError("AT706".into()))?;
    let naive = NaiveDateTime::parse_from_str(&format!("{}{}", a.date, hhmm), "%Y%m%d%H%M")
        .map_err(|e| SyntaxError(format!("AT705/AT706: {e}")))?;
    let local = tz.from_local_datetime(&naive).earliest() // the first instant of a DST overlap
        .ok_or_else(|| SyntaxError("local time does not exist in zone".into()))?;
    let at = local.with_timezone(&Utc);
    let (code, map_id) = match m.lookup("AT701", a.status, at) {
        Some((code, id)) => (code, Some(id)),
        None => ("exception".to_string(), None), // kept, flagged, map review task
    };
    Ok(Some(ShipmentEvent {
        dedupe_key: format!("edi_214|{sender}|{shipment_id}|{}|{}", a.status, at.to_rfc3339()),
        code, source_code: a.status.into(), reason_code: a.reason.into(),
        occurred_at: at, reported_tz: tz.name().into(), partner_code_map_id: map_id,
    }))
}
```

The dedupe key is what makes a resent day of 214s harmless: the same status at the same time from the same sender for the same shipment is one row. Two different statuses for the same stop (an X1 by 214 and an arrival by geofence) are two rows, and which one sets `stops.arrived_at` is the visibility chapter's decision ([One Timeline Across Sources](/books/logistics/visibility-and-tracking#one-timeline-across-sources)). A local time that falls in a daylight-saving gap or overlap is an edge every receiver hits twice a year; the rule picks one instant and keeps the original text in the document.

## The 210 Freight Invoice

A 210 is a carrier's freight bill for one shipment: a B3 header, references (N9), parties (N1 loops), a line loop (LX with L5 description, L0 quantity and weight, L1 rate and charges, L7 tariff reference) and L3 totals. XPO's 4010 guide defines the header and charge elements:

| Element | Meaning, per XPO's guide | Core model |
| --- | --- | --- |
| B3-02 | Invoice Number (mandatory) | `freight_invoices.number` |
| B3-03 | Shipment Identification Number | Matched to the shipment or load |
| B3-04 | Shipment Method of Payment: CC Collect, PP Prepaid (by Seller) | Checked against `shipments.payment_terms` |
| B3-06 | "the billing date" | `freight_invoices.invoice_date` |
| B3-07 | Net Amount Due, type N2 | `freight_invoices.stated_total` |
| B3-09, B3-10 | Delivery date, qualified 017 Estimated Delivery or 035 Delivered | Whether the invoice preceded delivery |
| B3-11 | SCAC | `freight_invoices.issuer_party_id` via `carriers.scac` |
| L1-02, L1-03 | Freight rate, and its qualifier: FR Flat Rate, MN Minimum, PH Per Hundred | `freight_invoice_lines.rate`, `kind` |
| L1-04 | Charge, type N2 | `freight_invoice_lines.amount` |
| L1-08 | Special charge or allowance code: DSC Discount, FUE Fuel Charge, HAZ Hazardous Cargo Charge, PYS Priority Service Charge | `freight_invoice_lines.code`, mapped to a `freight_charges` kind |
| L3-05 | Total charges | Compared with the sum of the L1s |

Three details decide whether the invoice matches:

- **N2 is cents.** An X12 N2 element is a number with two implied decimal places, so `B3*...*125075*...` is $1,250.75 and lands as 125075 minor units with no float in between ([Integer Minor Units](/docs/money/amounts#integer-minor-units)). A parser that reads it as a decimal number bills a hundred times too much.
- **The invoice can come before the freight.** XPO's guide says that "On collect freight bills the data in B309 will be the actual delivery date. For the shipments invoiced prior to delivery, the B309 will be the estimated date of delivery." The delivery date qualifier (017 or 035) is stored, and an invoice for an undelivered shipment waits for proof of delivery before approval.
- **Codes become charge kinds through the map.** FUE is `fuel_surcharge`, DSC is `discount` (a negative line), HAZ and PYS are accessorials; another carrier uses other codes for the same charges. Every line keeps the code as billed in `freight_invoice_lines.code` and the kind it mapped to, so audit compares like with like.

How the 210 is audited against the rate, matched to payable charges, short paid and rebilled is Freight Invoicing & Settlement and Freight Audit & Payment.

## Ocean, Rail and Other Modes

The same structure, different sets, and in ocean a standard that is replacing them:

- **Ocean.** A shipper or forwarder books with a 300, the carrier confirms with a 301 (or cancels with a 303), shipping instructions for the bill of lading go as a 304, statuses come back as 315s ("Status Details (Ocean)"), and the freight bill as a 310. The Digital Container Shipping Association publishes API standards for the same exchanges (Booking, Bill of Lading, Track & Trace, Arrival Notice), and carriers offer both; Ocean Shipping covers the DCSA standards and their event codes, and [Logistics APIs & Standards](/books/logistics/logistics-apis#standards-bodies) covers integrating with them. A 315 lands in `shipment_events` with source `edi_315`, mapped through the same partner code maps as a 214.
- **Intermodal and drayage.** Ramps and terminals report as 322 ("Terminal Operations and Intermodal Ramp Activity"); a broker dispatches a dray with a 204 or a 317 ("Delivery/Pickup Order"), and the dray carrier answers in 214s with gate codes (I1, OA), as C.H. Robinson's dray guide shows. The ramp events and the "available" milestone are [Ramps and Rail Legs](/books/logistics/intermodal-and-drayage#ramps-and-rail-legs).
- **Rail.** The 404 bill of lading instructions, the 417 waybill interchange, the 418 advance consist, the 426 revenue waybill and the 410 freight bill are mapped in [Rail Freight](/books/logistics/rail-freight#waybills-interchange-and-car-events).
- **Air.** Air cargo runs on IATA's own messages (FWB, FHL, FSU) and its ONE Record standard rather than X12; Air Cargo covers them.
- **Outside North America.** UN/EDIFACT has transport messages of its own; the concepts map one to one, and the partner map records the syntax with the version.

## Versions and Envelopes

Every transportation guide surveyed for this chapter pins a version: CN's 204, C.H. Robinson's 990 and 214s, XPO's 990 and 210, and Kroger's 214 are 4010 (GS-08 `004010`, ISA-12 `00401`, described in the guides as "Draft Standards for Trial Use Approved for Publication by ASC X12 Procedures Review Board through October 1997"); Kroger's 204 is 4030. X12 publishes a release every year, and transportation, like retail, runs decades behind it ([Versions](/books/commerce/edi#versions)). Where 5010 appears in transportation, the public evidence is EDI providers' sample guides rather than a carrier's or shipper's own published requirement. <!-- source-gap: logistics-transportation-edi-5010 | secondary | How widely 5010 is used for 204/214/210 in North American trucking | closes with: a carrier or shipper implementation guide on its own site that requires 5010 for a motor carrier set | checked: 2026-11-22 -->

The version is a property of the partner map, per set and direction, because one partner can send 4030 tenders and 4010 statuses. The envelope rules are the Commerce volume's and apply unchanged: store every interchange's bytes before parsing, reject a repeated ISA-13 from the same sender at the envelope and acknowledge again, track every outbound group's 997 against a due time, and keep the transport receipt with it ([Envelopes and Acknowledgments](/books/commerce/edi#envelopes-and-acknowledgments)). Two transportation specifics: a tender's 997 has a due time shorter than its respond-by time, or it's useless; and an invoice group with no 997 is the first thing to check when a carrier says it billed and the payer says it didn't receive it.

## Partner Code Maps

Every coded element a partner sends, and every one this system sends back, goes through a per-partner map with validity dates. The variance the guides above document, in one place:

| Field | Partner | Partner's code | Meaning in this system |
| --- | --- | --- | --- |
| 204 B2A-01 | CN | 04 | New revision of the tender |
| 204 B2A-01 | Kroger (Harris Teeter) | 05 | New revision of the tender |
| 990 B1-04 | X12 standard, XPO | D | Rejected |
| 990 B1-04 | C.H. Robinson | R | Rejected |
| 990 B1-04 | C.H. Robinson | U | Accepted |
| 214 AT701 | C.H. Robinson LTL, Kroger | CD | Delivered |
| 214 AT701 | C.H. Robinson dray | D1 | Delivered |
| 214 AT702 | C.H. Robinson dray | AF | Late reason: accident |
| 214 AT701 | C.H. Robinson | AF | Picked up (departed the pickup location) |
| 210 L1-08 | XPO | FUE | Fuel surcharge |

The rules:

- **The map is keyed by partner, set, direction, element and code, with a validity range.** AF in AT701 and AF in AT702 are different keys; a partner who changes its guide gets a new map row from a date, and old messages still resolve with the row in force when they were sent ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Unmapped is kept, never dropped.** A code with no map row becomes a record with the raw code (an `exception` event for a status, an unknown line kind on an invoice, a tender answer held for review) and a task to extend the map. A 214 silently discarded is a delivery nobody sees.
- **Record which row decided.** Every parsed status, answer and invoice line stores the map row that translated it, so a wrong mapping found in March can be traced to every record it touched since January ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Outbound uses the same map in reverse.** A broker sending 214s to its shipper customers translates its own `delivered` into the code each customer's guide wants; Kroger wants CD with NS.
- **Partner facts live beside the codes.** Whether a partner auto-accepts tenders, which zone its local times mean, which milestones it requires and how fast: these are map attributes too, not tribal knowledge.

## Partner Onboarding

Onboarding a transportation partner is the Commerce volume's process ([Partner Testing](/books/commerce/edi#partner-testing)) with a different set list: exchange IDs and the connection (CN offers its MFT server, an FTP push or a VAN interconnect), build maps from the partner's guide, test each set under test usage with the partner's sample cases (a tender, a change, a cancellation; an acceptance and a rejection; every required 214 milestone; an invoice with a discount and fuel), certify, and watch the first weeks in production. Transportation adds two tests retail doesn't need: a load with three or more stops, because stop loops are where maps break, and a clock test, sending statuses near midnight and across a daylight-saving change in the partner's zone, because local times are where events land on the wrong day.

Most brokers and carriers don't run their own translators for every partner. TMS vendors include EDI modules, EDI networks and API providers translate X12 to JSON, and visibility networks take 214s on a shipper's behalf ([Visibility Networks](/books/logistics/logistics-apis#visibility-networks)). The maps and codes are the same work wherever they run, and the records this chapter describes are needed whichever does it, because the evidence in a dispute is the message as exchanged.

## How to Build It

The Commerce volume's EDI tables carry over with a party in place of its trading partner: partner maps, interchanges and functional acknowledgments. This chapter adds the partner code maps, links documents to their envelopes, links tenders to the messages that carried them, records which map row decided an event, and keeps the 210's payment and delivery qualifiers on the invoice. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE TABLE edi_partner_maps (          -- how one partner exchanges one set, versioned
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id        UUID NOT NULL REFERENCES parties (id),
  transaction_set TEXT NOT NULL,         -- '204', '990', '214', '210', '315'
  direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  x12_version     TEXT NOT NULL,         -- '004010', '004030'
  sender_id       TEXT NOT NULL,         -- ISA-05/06 qualifier and ID
  receiver_id     TEXT NOT NULL,
  transport       TEXT NOT NULL CHECK (transport IN ('as2', 'van', 'sftp', 'mft', 'api')),
  ack_required    TEXT NOT NULL CHECK (ack_required IN ('997', '999', 'none')),
  ack_due         INTERVAL NOT NULL,     -- shorter than the respond-by on tenders
  local_time_zone TEXT,                  -- IANA zone the partner's LT times mean, if fixed
  auto_accepts    BOOLEAN NOT NULL DEFAULT FALSE,  -- a 990 that always says A
  rules           JSONB NOT NULL DEFAULT '{}',  -- required milestones, cadence, shape
  spec_ref        TEXT NOT NULL,         -- the partner's guide and its date
  status          TEXT NOT NULL CHECK (status IN ('draft', 'testing', 'certified',
                    'production', 'retired')),
  valid_during    TSTZRANGE NOT NULL,
  EXCLUDE USING gist (party_id WITH =, transaction_set WITH =, direction WITH =,
                      valid_during WITH &&)  -- btree_gist; one live map per set
);

CREATE TABLE edi_interchanges (          -- one ISA envelope, as sent or received
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  direction           TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_id           TEXT NOT NULL,
  receiver_id         TEXT NOT NULL,
  isa_control         CHAR(9) NOT NULL,  -- ISA-13
  usage               CHAR(1) NOT NULL CHECK (usage IN ('P', 'T', 'I')),  -- ISA-15
  transport           TEXT NOT NULL,
  transport_receipt   TEXT,              -- AS2 MDN or VAN delivery reference
  content_ref         TEXT NOT NULL,     -- the bytes, in object storage
  sha256              BYTEA NOT NULL,
  received_or_sent_at TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('received', 'parsed', 'failed',
                        'sent', 'delivered', 'acknowledged', 'rejected', 'duplicate')),
  UNIQUE (direction, sender_id, receiver_id, isa_control)
);

CREATE TABLE edi_functional_acks (       -- the 997 or 999 for each functional group
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  interchange_id     UUID NOT NULL REFERENCES edi_interchanges (id),
  gs_control         TEXT NOT NULL,      -- GS-06 of the group acknowledged
  functional_id      CHAR(2) NOT NULL,   -- GS-01: 'SM', 'GF', 'QM', 'IM'
  kind               CHAR(3) NOT NULL CHECK (kind IN ('997', '999')),
  ack_interchange_id UUID REFERENCES edi_interchanges (id),
  result             TEXT CHECK (result IN ('accepted', 'accepted_with_errors',
                       'partially_accepted', 'rejected')),
  errors             JSONB,
  due_at             TIMESTAMPTZ NOT NULL,
  received_at        TIMESTAMPTZ,
  UNIQUE (interchange_id, gs_control),
  CHECK ((received_at IS NULL) = (result IS NULL))
);

CREATE TABLE partner_code_maps (         -- a partner's code, and what it means here
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id     UUID NOT NULL REFERENCES parties (id),
  source       TEXT NOT NULL,            -- 'edi_204', 'edi_990', 'edi_214', 'edi_210',
                                         -- 'edi_315', or an API provider's name
  direction    TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  field        TEXT NOT NULL,            -- 'B2A01', 'B104', 'AT701', 'AT702', 'L108'
  partner_code TEXT NOT NULL,
  meaning      TEXT NOT NULL,            -- a core code: 'delivered', 'rejected', 'fuel_surcharge'
  qualifier    TEXT,                     -- e.g. 'late_reason' for an AT702 code
  note         TEXT,                     -- the guide's wording, quoted
  valid_during TSTZRANGE NOT NULL,
  EXCLUDE USING gist (party_id WITH =, source WITH =, direction WITH =, field WITH =,
                      partner_code WITH =, valid_during WITH &&)
);

ALTER TABLE documents
  ADD COLUMN transaction_set TEXT,       -- '204', '214', when format = 'x12'
  ADD COLUMN interchange_id  UUID,
  ADD COLUMN gs_control      TEXT,
  ADD COLUMN st_control      TEXT,       -- ST-02
  ADD COLUMN parsed          JSONB;      -- the canonical parsed form
ALTER TABLE documents ADD CONSTRAINT documents_interchange_fkey
  FOREIGN KEY (interchange_id) REFERENCES edi_interchanges (id) NOT VALID;
ALTER TABLE documents ADD CONSTRAINT documents_x12_set_check
  CHECK (format <> 'x12' OR transaction_set IS NOT NULL) NOT VALID;

ALTER TABLE tenders
  ADD COLUMN tender_document_id   UUID,  -- the 204 (or API payload) that offered it
  ADD COLUMN response_document_id UUID,  -- the 990 that answered it
  ADD COLUMN edi_purpose_code     TEXT;  -- B2A-01 as sent or received
ALTER TABLE tenders ADD CONSTRAINT tenders_tender_document_fkey
  FOREIGN KEY (tender_document_id) REFERENCES documents (id) NOT VALID;
ALTER TABLE tenders ADD CONSTRAINT tenders_response_document_fkey
  FOREIGN KEY (response_document_id) REFERENCES documents (id) NOT VALID;

ALTER TABLE shipment_events
  ADD COLUMN partner_code_map_id UUID;   -- the map row that translated source_code
ALTER TABLE shipment_events ADD CONSTRAINT shipment_events_code_map_fkey
  FOREIGN KEY (partner_code_map_id) REFERENCES partner_code_maps (id) NOT VALID;

ALTER TABLE freight_invoices
  ADD COLUMN payment_method          TEXT,  -- B3-04 as billed: 'CC', 'PP'
  ADD COLUMN billed_delivery_date    DATE,  -- B3-09
  ADD COLUMN delivery_date_qualifier TEXT,  -- B3-10: '017' estimated, '035' delivered
  ADD COLUMN shipment_ref            TEXT;  -- B3-03, as billed, before matching
ALTER TABLE freight_invoices ADD CONSTRAINT freight_invoices_delivery_qualifier_check
  CHECK (delivery_date_qualifier IS NULL
         OR delivery_date_qualifier IN ('017', '035')) NOT VALID;

CREATE INDEX CONCURRENTLY documents_interchange_idx ON documents (interchange_id);
CREATE INDEX CONCURRENTLY tenders_external_ref_idx ON tenders (carrier_party_id, external_ref);
ALTER TABLE documents VALIDATE CONSTRAINT documents_interchange_fkey;
ALTER TABLE documents VALIDATE CONSTRAINT documents_x12_set_check;
ALTER TABLE tenders VALIDATE CONSTRAINT tenders_tender_document_fkey;
ALTER TABLE tenders VALIDATE CONSTRAINT tenders_response_document_fkey;
ALTER TABLE shipment_events VALIDATE CONSTRAINT shipment_events_code_map_fkey;
ALTER TABLE freight_invoices VALIDATE CONSTRAINT freight_invoices_delivery_qualifier_check;
```

A partner scorecard reads 214 latency straight off the two clocks, against the partner's own promise:

```sql
-- 214 latency by carrier over the last 30 days, against a 60-minute requirement
SELECT c.scac,
       count(*)                                                        AS statuses,
       percentile_cont(0.5)  WITHIN GROUP (ORDER BY e.received_at - e.occurred_at) AS p50,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY e.received_at - e.occurred_at) AS p95,
       count(*) FILTER (WHERE e.received_at - e.occurred_at > interval '60 minutes')
                                                                       AS late_statuses,
       count(*) FILTER (WHERE e.partner_code_map_id IS NULL)           AS unmapped
FROM shipment_events e
JOIN loads l    ON l.id = e.load_id
JOIN carriers c ON c.party_id = l.carrier_party_id
WHERE e.source = 'edi_214'
  AND e.code <> 'position'
  AND e.received_at >= NOW() - interval '30 days'
GROUP BY c.scac
ORDER BY p95 DESC;
```

And the work queue that keeps maps complete:

```sql
-- Codes partners sent this week that no map row covers
SELECT d.counterparty_party_id, d.transaction_set, e.source_code, count(*) AS times
FROM shipment_events e
JOIN documents d ON d.id = e.document_id
WHERE e.partner_code_map_id IS NULL
  AND e.source LIKE 'edi_%'
  AND e.received_at >= NOW() - interval '7 days'
GROUP BY 1, 2, 3
ORDER BY times DESC;
```

Design notes:

- **Bytes, then envelope, then parse.** The interchange is stored and hashed as received, the envelope's control number catches the duplicate, and only then are transaction sets parsed into `documents.parsed` and the owning tables, so a parse failure loses nothing ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **One translator, many sources.** A 214, a provider's webhook and a carrier API all resolve their codes through `partner_code_maps`; `source` distinguishes them, and the shipment event is the same row whichever way it came ([Visibility Networks](/books/logistics/logistics-apis#visibility-networks)).
- **The tender keeps its messages.** `tender_document_id` and `response_document_id` point at the 204 and 990 as exchanged, so "we never got your tender" and "we rejected it at 14:02" are answered from the record.
- **Local time is converted once, at the edge.** The parse converts with the facility's zone (or the map's `local_time_zone`), stores the instant in `occurred_at` and the zone in `reported_tz`, and nothing downstream sees local text.
- **Amounts are N2 integers.** The 210 parser reads implied-decimal elements straight into minor units; the stated total stays on `freight_invoices.stated_total` and audit compares it with the sum of the lines.
- **Events.** `edi.interchange_received`, `edi.parse_failed`, `edi.code_unmapped`, `edi.ack_overdue`, `tender.answer_received` and `freight_invoice.received` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to tendering, visibility, billing and the integration support queue.

## Auditing

- **Every interchange as exchanged,** with its hash, control numbers, transport receipt and timestamps, for as long as any tender, claim, detention bill or invoice dispute it could support is open, and at least the three years a broker keeps transaction records under 49 CFR 371.3 ([Auditing](/books/logistics/logistics-business#auditing)).
- **Every acknowledgment,** with when it was due and when it came, because a carrier's "the tender was late" and a shipper's "your invoice never arrived" are answered with a 997's time.
- **Every partner map and code map version,** with the guide it came from and its validity, and the map row that translated each tender answer, status and invoice line.
- **Every tender's 204 and 990,** linked from the tender, so who offered what and who answered what is never reconstructed from memory.
- **Both clocks on every status,** occurred and received, so a partner's latency and an on-time measure can each be recomputed from the record.

## What This Means for the System You Build

- **Build maps from each partner's guide,** not the X12 code list, and test them with the partner's own samples and a multi-stop load.
- **Run every coded element through a per-partner code map with validity dates,** inbound and outbound, and record which row decided each record.
- **Keep what you can't map** as a flagged record with its raw code, and work the unmapped queue daily.
- **Treat the 204's shipment ID as the join key** for its 990, 214s and 210, scoped to the partner.
- **Read D as a decline and B2A changes as revisions,** whatever code the partner uses, and let the tender's state machine apply them.
- **Convert local times with the facility's or partner's zone once,** and keep occurred and received times separate on every status.
- **Read N2 amounts as integer minor units,** and hold invoices billed before delivery until proof of delivery arrives.
- **Measure partners on their own promises:** required milestones present, statuses within the window, acknowledgments on time.
- **Reuse the envelope machinery** (bytes first, duplicates caught at the ISA, acknowledgments with due times) from the Commerce volume rather than rebuilding it.

## References

**Standards**

- [X12: Transaction sets](https://x12.org/products/transaction-sets), the official titles of the 204, 210 to 217, 990, 300, 301, 303, 304, 309, 310, 315, 317, 322, 323, 404, 410, 417, 418, 426, 820, 824, 858, 859, 920, 924, 997 and 999

**Published implementation guides**

- [CN: EDI 204 Implementation Guide, version 4010](https://www.cn.ca/-/media/files/customer-centre/customer-centre-documents/204-implementation-guide-4010.pdf), compliance with the motor carrier industry guide, the 990 within half an hour, automatic acceptance, B2, B2A codes 00, 01 and 04, G62 qualifiers 64, 10, 38, 68 and 54 with time code LT, S5 CL and CU, the sample 204, SM functional group, and MFT, FTP and VAN connections
- [Kroger: Harris Teeter 204 Motor Carrier Load Tender, X12 4030](https://edi.kroger.com/EDIPortal/documents/Maps/ht/HT_204_X12_4030_Guidelines.pdf), version 4030, modified December 15, 2025, B2A codes 00, 01 and 05, stop G62 dates 10 and 68 without times, S5 CL and CU
- [Kroger: Harris Teeter 214, X12 4010](https://edi.kroger.com/EDIPortal/documents/Maps/ht/HT_214_X12_4010_Guidelines.pdf), version 4010, AT7-01 CD Carrier Departed Delivery Location with NS
- [C.H. Robinson: Truckload Carrier X12 990](https://www.chrobinson.com/en-US/-/media/ChRobinson/documents/carrier-specs-docs/truckload-carrier-specs/CHR990IB.pdf), version 4010, B1-02 as the load number from the 204's B2-04, B1-04 codes A, D, R and U, R treated as a decline and U as an accept
- [C.H. Robinson: LTL Carrier X12 214](https://www.chrobinson.com/en//en-US/-/media/ChRobinson/documents/carrier-specs-docs/CHR%20LTL%20Carrier%20X12-214.pdf), version 4010 dated October 12, 2021, required X3, AF, X1 and CD, X6 every 15 minutes, 15-minute and one-hour latency, one location per 214, the 997 it returns, AT7 syntax rules and code counts, AA and AB appointment codes, local time, the MS1 location, QM functional group, ISA-12 00401 and GS-08 004010, and the sample 214
- [C.H. Robinson: Dray Carrier X12 214](https://www.chrobinson.com/en//en-US/-/media/ChRobinson/documents/carrier-specs-docs/CHR%20Dray%20Carrier%20X12-214.pdf), version 4010, X3, AF, D1, OA and I1 status codes and AF, AG, AH and AI late reason codes
- [XPO: 990 specification, X12 4010](https://www.xpo.com/cdn/files/s8/990_spec_x12_4010.pdf), the seven B1-04 codes, B1-01 SCAC and B1-03 booking date, N9 and K1, GF functional group
- [XPO: 210 specification, X12 4010](https://www.xpo.com/cdn/files/s8/210_spec.pdf), guide dated September 25, 2015, B3 elements, CC and PP, the billing date, N2 net amount due, delivery date qualifiers 017 and 035 and invoicing before delivery, L1 qualifiers FR, MN and PH, special charge codes DSC, FUE, HAZ and PYS, L3 totals, IM functional group
