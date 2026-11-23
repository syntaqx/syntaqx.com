+++
title = "Supplier Schedules, JIT & Automotive EDI"
nav_title = "Supplier Schedules & JIT"
description = "How plants schedule suppliers: scheduling agreements, the 830, 862 and 866, firm and forecast horizons, cums, kanban, sequencing, ASNs and labels."
category = "Logistics & Supply Chain Industry"
order = 2860
part = "Manufacturing"
tags = ["logistics", "manufacturing", "edi", "automotive", "jit", "kanban", "suppliers", "data-model"]
+++

A plant that builds a thousand vehicles a day doesn't send its seat supplier a thousand purchase orders. It signs one agreement for the part, for the model year, and then sends schedules against it: a planning schedule, often weekly, with months of requirements, the nearest firm and the rest forecast, with an authorization for how much material the supplier may buy and how much it may fabricate at the buyer's risk; a daily shipping schedule with the exact quantities and times for the next days; and, for parts built to match each vehicle (a seat in the right color and trim), a sequence that says which seat goes on which truck in which slot, hours before the vehicle reaches the line. The supplier ships against them, sends a ship notice within the hour the truck leaves, labels every container to the industry's standard, and is measured on every delivery.

It is hard because the schedule is a moving target expressed as differences. Each release replaces or changes the one before; quantities can be discrete per period or cumulative from a start date that both sides must agree on; the buyer's count of what it received and the supplier's count of what it shipped drift apart with every in-transit truck, rejected container and missed ASN, and the next release's net requirement is computed from the buyer's cum. The forecast is not an order and the authorization is a financial commitment, so which line is which decides who pays when a program is cancelled. And the formats differ by region and customer: X12 in North America, EDIFACT and VDA in Europe, each OEM with its own implementation guide.

This chapter covers scheduling agreements, the planning schedule (830) and its segments, firm and forecast horizons, authorizations and cumulative quantities, the shipping schedule (862), sequencing (866 and JIS), kanban, ship notices and container labels, transport (OFTP2), and supplier performance (MMOG/LE). It extends `orders`, `order_lines`, `documents` and `handling_units` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). Retail EDI (the 850, 855, 856 and 810 between a brand and a retailer, envelopes and acknowledgments) and GS1 carton labels are Commerce's [EDI](/books/commerce/edi#the-transactions); the transportation sets (204, 990, 214, 210) are [Transportation EDI](/books/logistics/transportation-edi)'s; the requirements these schedules carry come from [MRP, Scheduling & Work Orders](/books/logistics/production-planning#the-mrp-explosion).

## How the Standards Do It

As of November 2026, from the standards bodies, Stedi's X12 reference (the element names and notes here are as Stedi publishes them for release 8010), one vehicle maker's public EDI guides and one Tier 1 supplier's manual:

| Source | What it defines | As published |
| --- | --- | --- |
| **X12** | 830 "Planning Schedule with Release Capability," 862 "Shipping Schedule," 866 "Production Sequence," 856 "Ship Notice/Manifest," 824 "Application Advice" | The 830 serves as "(1) a simple forecast; (2) a forecast with the buyer's authorization for the seller to commit to resources, such as labor or material; (3) a forecast that is also used as an order release mechanism"; the 862 "does not replace the 830" and "shall not be used to authorize labor, materials or other resources" |
| **UN/EDIFACT** | DELFOR (delivery schedule), DELJIT (delivery just in time) | DELFOR covers "short term delivery and/or medium to long scheduling" and "can be used to authorize manufacturing and or the provision of materials"; DELJIT conveys "precise delivery sequence and Just In Time schedule requirements" and supplements DELFOR |
| **AIAG** | B-10 Trading Partner Labels (version 3, June 2004), B-16 Global Transport Label (version 3, November 2010), the global EDI implementation guideline, MMOG/LE | AIAG adopted ASC X12, worked with its European counterparts and JAMA/JAPIA "to harmonize this standard globally," and "published the industry's first global EDI Implementation Guideline"; its Global DESADV guideline "corresponds to the ASC X12 856" |
| **Odette** | OFTP2 (RFC 5024), the Global Transport Label (Odette profile, version 2.4, August 2026), MMOG/LE | OFTP2 adds "session encryption (SSL/TLS)," "file encryption & signing," compression and "signed end-to-end responses"; MMOG/LE, "developed by Odette and AIAG," has "more than 25,000 users" at "more than 10,000 sites" |
| **Magna** (Global Supplier Operational Requirements, revision 1.1, January 2024, a Tier 1 supplier's manual) | What it requires of its own suppliers | EDI in "VDA, ANSI and EDIFACT"; an ASN "within 30 minutes of each shipment leaving the supplier's location"; responsible "for only those production releases identified as firm or locked"; labels to AIAG B-10, B-16 or VDA 4994; MMOG ratings A, B or C |
| **Volvo Group** (truck, bus and construction equipment maker; public EDI guides: Global DELFOR D04A issue 2.2.2, February 2025; Global DESADV D07A issue 1.4, March 2026) | What it sends its suppliers and requires back | DELFOR carries "Firm delivery dates," "Forecast delivery dates," a "Commitment for material," "Backorder and in-transit quantities," and the cumulative quantity received with its accumulation start date; a schedule "should be replaced by a new one" for the same part, order, ship-from and ship-to; the despatch advice goes "no later than one hour after the goods have been despatched" |
| **Microsoft Dynamics 365** (lean manufacturing) | Kanban rules | "A pull system produces goods only when goods are needed"; fixed-quantity, scheduled and event kanban rules |

The X12 rules below come from Stedi's reference and the standards bodies; the practice (firm against forecast, cums, ASN timing) is anchored in Volvo Group's public EDIFACT guides and Magna's manual. No North American vehicle maker's X12 830 or 862 guide could be opened for this chapter: the supplier portals tried were behind logins or refused automated fetches, so the firm and forecast horizons quoted below are an illustration, not any OEM's published rule. <!-- source-gap: logistics-supplier-oem-guides | missing | a North American OEM's own X12 830/862 implementation guide (horizons, cum rules, ASN timing) | closes with: a publicly readable GM, Ford, Stellantis, Toyota or Honda supplier EDI guide | checked: 2026-11-22 -->

Four patterns:

- **Three messages, three horizons.** The planning schedule carries the long view and the commitments, the shipping schedule the next days, the sequence the next hours. Each later message supersedes the earlier one's near-term detail without replacing its authority.
- **Authorization is separate from forecast.** The 830 alone carries the resource authorization; the 862 and 866 "shall not be used to authorize labor, materials or other resources." A supplier's financial exposure is the authorized cum, not the forecast.
- **Regional formats, one practice.** X12 in North America, EDIFACT and VDA in Europe, JAMA/JAPIA in Japan, harmonized through AIAG and Odette; the labels converged on a global transport label that "combined the best features" of ISO 15394, ANSI MH10.8.1, the Odette label and the AIAG B-10.
- **The supplier is measured on its logistics.** ASN timing, label compliance, on-time delivery (Magna's "expectation that suppliers will deliver 100% on time") and a materials-management self-assessment are part of being a supplier, not extras.

## Scheduling Agreements

The contract behind the schedules is a long-running agreement for a part: price, terms, ship-to and ship-from, the cumulative start date, the transport arrangement, and the rules for authorization. It is a purchase order without fixed quantities; the 830's release capability "eliminates the need for discrete generation of purchase orders." Different systems name it a blanket order, a scheduling agreement or a contract; in this volume it is an `orders` row of kind `purchase` with an `order_form` of `scheduling_agreement`, one line per part and ship-to, and every schedule is a release against that line.

## The Planning Schedule

The 830 carries, per part, the requirements over a horizon and the commitments that go with them. Its structure, from the X12 reference (release 8010):

- **BFR, the header.** BFR-01 is the purpose: 00 "Original," 01 "Cancellation," 04 "Change" (net change, which makes BFR-09, "The date the forecast was updated with 'net change' data," required), 05 "Replace." BFR-04 is the schedule type: among them DL "Delivery Based," SH "Shipment Based," PD "Planned Delivery Based," KB "Kanban Signal" and JS "Buyer Production Sequence Schedule." BFR-05 is the quantity basis: A "Actual Discrete Quantities," C "Cumulative Quantities," D "Net Change Quantities," R "Replacement Quantities." BFR-06 and 07 bound the horizon; BFR-08 "is the date forecast generated."
- **LIN, the part,** with unit, price status and references.
- **FST, the forecast lines.** FST-01 is the quantity, FST-02 the forecast qualifier, FST-03 the timing, and FST-04 and 05 the dates. FST-02's codes include C "Firm," D "Planning," A "Immediate," H "First Time Reported Firm," L "Engineering Change Pending," P "Prototype," Q "Order Release Authorization" and S "Strike Protection." FST-03's include D "Discrete," C "Daily," W "Weekly Bucket (Monday through Sunday)," X "Weekly Bucket (7 day interval)," M "Monthly Bucket (Calendar Months)," and F "Flexible Interval (from Date X through Date Y)," which requires both dates.
- **SDP, the delivery pattern:** the routine days and times shipments or deliveries happen, with FST lines beneath it.
- **ATH, the authorizations** (the next section).
- **SHP, what the buyer has received or the supplier shipped:** SHP-01 01 "Discrete Quantity," 02 "Cumulative Quantity," 87 "Quantity Received," with the cumulative start and end dates when it is a cum.

An illustrative release (the horizons vary by buyer), read as the supplier's planner reads it: requirements for the next four weeks as discrete daily quantities qualified C (firm), weeks five to twenty-six as weekly buckets qualified D (planning), months seven to twelve as monthly buckets qualified D, an ATH for finished goods through week four and raw material through week eight, and an SHP with the last receipt and the cum received since the model-year start.

## Firm and Forecast

The qualifier on each line is the commercial rule. Volvo Group's DELFOR codes each quantity as "Firm order" or "Forecast demand" and gives the material commitment separately; the Tier 1 manual cited above states what that means for money: Magna is "responsible for only those production releases identified as firm or locked releases," "Forecast volumes are for forecasting purposes only" and do not constitute "a binding release authorization," and "Suppliers assume the risk associated with lead times … where quantities extend beyond those required to support Material Releases." What a supplier does with each kind:

- **Firm** quantities are orders: plan production and freight, and ship.
- **Planning** quantities drive the supplier's own MRP and its 830s to its suppliers, at its own risk except where an authorization covers them.
- **Authorized** quantities (by ATH) are the buyer's financial commitment for material or fabrication through a date, and the basis of a claim if the program is cut.

My rule is to store the qualifier per line and never collapse a release into a single quantity per period, because a later dispute about a cancelled program asks exactly which quantities were firm, which authorized, and on which release.

## Authorizations and Cumulative Quantities

Cumulative quantities count from a start date both sides agree on, which ATH-05 describes as "the start date of a contract period, a calendar or fiscal year, or other." The ATH segment carries the buyer's commitment as a cum: ATH-01 is the resource (FI "Finished (Labor, Material, and Overhead/Burden)," MT "Material," LB "Labor," LM "Labor and Material," PQ "Cumulative Quantity Required Prior to First Schedule Period," PR "Previously Released Requirements"); ATH-02 is "The date through which the buyer authorizes the seller to commit the resource"; ATH-03 "The cumulative quantity that has been authorized to date from the cumulative start date"; and ATH-04 is the high-water mark, the maximum cumulative quantity authorized so far, which doesn't fall when a later forecast does. ATH-01's own note is the reason it exists: "It is imperative that negotiations defining financial commitment have previously occurred."

Cum logic makes a schedule self-correcting. If the buyer sends cumulative required quantities (BFR-05 C) and reports its cum received (SHP), the supplier's next shipment is the cum required through the date minus the cum already shipped, and a missed or extra shipment corrects itself in the next release. It breaks when the two cums disagree:

| Cause | Buyer's cum received | Supplier's cum shipped | What fixes it |
| --- | --- | --- | --- |
| Truck in transit at the release cut-off | Lower | Higher | Count ASNs not yet received as in transit |
| ASN never sent or rejected (824) | Lower, or unmatched | Higher | Resend the ASN; reconcile by shipment ID |
| Containers rejected at receiving | Lower, if rejected quantity is excluded | Unchanged | The buyer's rejection advice and a replacement |
| Different cum start dates | Different base | Different base | Agree the start date; carry it on the agreement |
| Part number change mid-year | Split across parts | Split differently | The ECO's effectivity, applied on both sides |

The supplier's daily reconciliation is: supplier cum shipped, less shipments not yet reported received (in transit), compared with the buyer's latest cum received; a difference beyond the in-transit quantity is an exception to resolve before the next shipment is planned. An engineering change that supersedes a part ends one cum and may start another, which is why the ECO's dispositions and the authorizations have to agree ([Engineering Change](/books/logistics/boms-and-engineering-change#engineering-change)).

## The Shipping Schedule

The 862 is "intended to supplement the planning schedule transaction set (830)": it "will supersede certain shipping and delivery information transmitted in a previous planning schedule transaction, but it does not replace the 830," and it exists to "facilitate the practice of Just-In-Time (JIT) manufacturing … e.g., daily shipping schedules versus weekly planning schedules." Its header is BSS (with the horizon start and end and the quantity basis), its detail repeats FST with an optional nested JIT segment (a quantity and a time, "HHMM, or HHMMSS"), and an SHP carries the receipts. A plant can send it "independent of other customer locations when planning schedule transactions are issued by a consolidated scheduling organization," so a supplier may receive one 830 from a central scheduling group and separate 862s from each plant it ships to.

The rule for a receiving system: within the 862's horizon, its quantities replace the 830's for shipping; outside it, the 830 stands; and the 830's authorizations always stand, because the 862 can't change them.

## Sequencing and JIS

Some parts are built or picked to the buyer's exact production order: seats, cockpits, bumpers, wheels and tires, in the color and option mix of each vehicle. The 866 lets "the receiver of goods … request the order in which shipments of goods arrive" or "specify the order in which the goods are to be unloaded," "the sequence in which the goods are to enter the materials handling process or are to be consumed in the production process"; like the 862, it "shall not be used to authorize labor, materials, or other resources." Its EDIFACT counterpart is DELJIT. Each line carries a sequence number and the part (with options), usually tied to the buyer's build identifier for the vehicle.

Just-in-sequence (JIS) delivery turns the sequence into freight: the supplier's plant, usually close to the buyer's, builds in sequence, loads racks in sequence, and ships on a fixed cadence, so the truck is a moving buffer of production; Volvo Group publishes a separate DELJIT subset for sequence deliveries. The Tier 1 manual notes the supplier "may be asked to support local warehousing" to support JIT schedules. A sequence error stops the buyer's line, so my default is to check the sequence at three points (build, rack load, truck load) and treat a missing or out-of-order unit as an exception with its own fast path, a hot shot or a swap at the line.

## Kanban

Toyota defines just-in-time as "Making only what is needed, when it is needed, and in the amount needed," with a pull loop in which "the preceding process has a store of finished products from which the next process can pick up the parts that it needs," so that it can "immediately replenish whatever was picked up." A kanban is the signal in that loop: a card, a bin or an electronic message that one container has been used and one is to be made or delivered. Dynamics 365 models the rules: "Manufacturing rules create process kanban jobs, and withdrawal kanban rules create transfer kanban jobs"; fixed-quantity rules keep "the numbers of active kanbans … constant"; "Scheduled kanban rules replenish requirements that are calculated by master planning"; and "Event kanban rules replenish requirements that originate from sales order lines, production bill of materials (BOM) lines." With a supplier, the signal is an 830 with schedule type KB ("Kanban Signal"), a supplier portal, or a scan that triggers a release.

The loop size is a calculation the plant owns and reviews: demand during the replenishment lead time plus a safety allowance, divided by the container quantity, rounded up; the safety stock reasoning is the one in Commerce's [Reorder Points and Safety Stock](/books/commerce/purchasing-and-replenishment#reorder-points-and-safety-stock), with containers instead of units. The freight consequence is a milk run: a truck on a fixed route that collects the containers kanban signals called for from several suppliers on a fixed cadence, planned as a recurring load ([Load Planning & Optimization](/books/logistics/load-planning)).

## Ship Notices and Labels

The ASN (856, or DESADV in EDIFACT) is what lets the buyer receive by scan instead of by count, and what updates the cum. Buyers set the window: Volvo Group's guide wants it "no later than one hour after the goods have been despatched" and only once loading is complete; the Tier 1 manual requires it "within 30 minutes of each shipment leaving the supplier's location," a contingency to send it "in the event of a system failure," and, for cross-border full truckload and dedicated loads, the high-security seal number. The buyer answers a rejected or partly accepted ASN with an 824, which X12 defines as reporting "the acceptance, rejection, acceptance with change, or partial acceptance or rejection of any transaction set." An ASN that fails is a receiving problem the next morning and a cum discrepancy the next week, so suppliers monitor 824s as closely as the schedules themselves.

Containers carry the industry's transport label. AIAG's B-10 "Describes the template for bar code labels on shipping containers - both unit loads and transport packages," its B-16 "describes the format for a common transport label design," and the Global Transport Label combines ISO 15394, ANSI MH10.8.1, the Odette Transport Label and the B-10, with the ISO "Licence plate" and "Linear Bar Code 128 and 2D Data Matrix, QR Code and PDF417." The licence plate plays the role the SSCC plays in retail ([GS1-128 Labels and SSCC](/books/commerce/edi#gs1-128-labels-and-sscc)): one identifier per container that the ASN lists and the receiver scans. Many programs also use returnable containers (racks, totes, dunnage) that are themselves tracked assets owned by the buyer or a pool, which is why `handling_units` below carries the container reference.

## Transport and Partners

Schedules and ASNs travel over the same channels as other EDI: VANs, AS2 and SFTP ([Transport: VANs, AS2, SFTP and APIs](/books/commerce/edi#transport-vans-as2-sftp-and-apis)), plus, in European automotive, OFTP2 (RFC 5024), with session and file encryption, signing, compression and "signed end-to-end responses," using certificates from authorities on Odette's trust list. The Tier 1 manual accepts "Standard or Web EDI": large suppliers integrate, small ones key ASNs into the buyer's web portal, and a platform serving suppliers has to support both. Envelopes, 997 and 999 acknowledgments and partner testing are as Commerce's [Envelopes and Acknowledgments](/books/commerce/edi#envelopes-and-acknowledgments) describes.

## Supplier Performance

Automotive buyers measure suppliers' logistics with MMOG/LE, "a supplier self-assessment and continuous improvement tool" developed by AIAG and Odette (AIAG names version 6). The Tier 1 manual grades suppliers "A," "B," or "C," where a "deficiency in one or more critical areas automatically earns a 'C' rating," and requires at least the Basic assessment. Day to day, the measures come straight out of this chapter's records: deliveries on time to the schedule, quantities against firm requirements, ASNs on time and accepted, labels scanned without exception, premium freight paid and why. The plant-side metrics (OTIF, schedule adherence) are in [Logistics Metrics](/books/logistics/logistics-metrics).

## How to Build It

The agreement is an order with lines; each schedule is a document and a release; each release has lines (quantities by bucket and qualifier), authorizations and the receipt cum it reported. Kanban loops and sequence lines are separate, because their grain is a container and a vehicle slot.

```sql fragment
ALTER TABLE orders
  ADD COLUMN order_form TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE orders ADD CONSTRAINT orders_order_form_check
  CHECK (order_form IN ('standard', 'blanket', 'scheduling_agreement')) NOT VALID;

ALTER TABLE order_lines
  ADD COLUMN cum_start_on      DATE,      -- the agreed cumulative start, e.g. the model year
  ADD COLUMN customer_part_ref TEXT,      -- the buyer's part number, as on the schedule
  ADD COLUMN ship_pattern      TEXT;      -- the SDP pattern, as agreed

ALTER TABLE handling_units
  ADD COLUMN label_standard TEXT,         -- what the container's label follows
  ADD COLUMN license_plate  TEXT,         -- the ISO licence plate or AIAG serial on the label
  ADD COLUMN returnable_container_ref TEXT;  -- the rack or tote ID, when returnable
ALTER TABLE handling_units ADD CONSTRAINT handling_units_label_standard_check
  CHECK (label_standard IN ('gs1_128', 'aiag_b10', 'global_transport_label', 'vda_4994',
    'odette')) NOT VALID;

ALTER TABLE documents                    -- the schedule kinds join the list so far
  DROP CONSTRAINT documents_kind_check,
  ADD CONSTRAINT documents_kind_check CHECK (kind IN ('bill_of_lading', 'rate_confirmation',
    'proof_of_delivery', 'delivery_receipt', 'lumper_receipt', 'freight_invoice',
    'ocean_bill_of_lading', 'sea_waybill', 'air_waybill', 'arrival_notice',
    'commercial_invoice', 'packing_list', 'customs_entry', 'notice_of_assignment',
    'certificate_of_insurance', 'load_tender', 'tender_response', 'status_message',
    'ship_notice',                          -- the core list
    'power_of_attorney', 'customs_bond', 'bond_insufficiency_notice',
    'client_error_notice',                  -- Customs Brokers & Bonds
    'planning_schedule', 'shipping_schedule', 'production_sequence',
    'application_advice',                   -- this chapter
    'other')) NOT VALID;
ALTER TABLE orders VALIDATE CONSTRAINT orders_order_form_check;
ALTER TABLE handling_units VALIDATE CONSTRAINT handling_units_label_standard_check;
ALTER TABLE documents VALIDATE CONSTRAINT documents_kind_check;

CREATE TABLE supplier_schedule_releases (  -- one 830, 862, DELFOR or DELJIT for one part
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  order_line_id    UUID NOT NULL REFERENCES order_lines (id),  -- the agreement line
  document_id      UUID NOT NULL REFERENCES documents (id),    -- the message as exchanged
  kind             TEXT NOT NULL CHECK (kind IN ('planning', 'shipping')),
  release_number   TEXT NOT NULL,
  purpose          TEXT NOT NULL CHECK (purpose IN ('original', 'replace', 'change',
                     'cancellation')),
  quantity_basis   TEXT NOT NULL CHECK (quantity_basis IN ('discrete', 'cumulative',
                     'net_change', 'replacement')),
  schedule_type    TEXT,                 -- BFR-04 or BSS-04 as sent: 'DL', 'SH', 'KB', ...
  horizon          DATERANGE NOT NULL,
  generated_at     TIMESTAMPTZ NOT NULL, -- BFR-08: when the buyer made it
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  supersedes_id    UUID REFERENCES supplier_schedule_releases (id),
  reported_cum_received NUMERIC(14, 3),  -- SHP: the buyer's cum, as reported
  reported_cum_through  DATE,
  last_receipt_ref TEXT,                 -- the buyer's last receipt or ASN it counted
  status           TEXT NOT NULL CHECK (status IN ('current', 'superseded', 'rejected')),
  UNIQUE (order_line_id, kind, release_number)
);

CREATE TABLE supplier_schedule_lines (   -- each FST as sent
  release_id    UUID NOT NULL REFERENCES supplier_schedule_releases (id),
  line_number   INT NOT NULL,
  qualifier     TEXT NOT NULL CHECK (qualifier IN ('firm', 'planning', 'immediate',
                  'first_time_firm', 'engineering_change_pending', 'prototype',
                  'release_authorization', 'other')),
  qualifier_code TEXT NOT NULL,          -- FST-02 as sent, mapped per partner
  timing        TEXT NOT NULL CHECK (timing IN ('discrete', 'daily', 'weekly', 'monthly',
                  'quarterly', 'flexible')),
  period        TSTZRANGE NOT NULL,      -- in the ship-to facility's time zone, as sent
  ship_or_deliver_at TIMESTAMPTZ,        -- a JIT time, when given
  quantity      NUMERIC(14, 3) NOT NULL CHECK (quantity >= 0),
  is_cumulative BOOLEAN NOT NULL,        -- from the release's quantity basis
  PRIMARY KEY (release_id, line_number)
);

CREATE TABLE supplier_schedule_authorizations (  -- each ATH: the buyer's commitment
  release_id      UUID NOT NULL REFERENCES supplier_schedule_releases (id),
  resource        TEXT NOT NULL CHECK (resource IN ('finished', 'material', 'labor',
                    'labor_and_material', 'prior_cum', 'previously_released')),
  authorized_through DATE NOT NULL,      -- ATH-02
  cum_authorized  NUMERIC(14, 3) NOT NULL,  -- ATH-03
  cum_maximum     NUMERIC(14, 3),        -- ATH-04, the high-water mark
  cum_start_on    DATE NOT NULL,         -- ATH-05
  PRIMARY KEY (release_id, resource)
);

CREATE TABLE production_sequence_lines ( -- an 866 or DELJIT slot
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  document_id      UUID NOT NULL REFERENCES documents (id),
  order_line_id    UUID NOT NULL REFERENCES order_lines (id),
  sequence_number  BIGINT NOT NULL,      -- the buyer's sequence
  build_ref        TEXT,                 -- the buyer's vehicle or build identifier
  options          JSONB NOT NULL DEFAULT '{}',  -- color, trim, variant, as sent
  required_at      TIMESTAMPTZ NOT NULL,
  rack_ref         TEXT,                 -- the rack and slot it was loaded in
  shipment_id      UUID REFERENCES shipments (id),
  status           TEXT NOT NULL CHECK (status IN ('received', 'built', 'racked', 'shipped',
                     'delivered', 'cancelled', 'exception')),
  UNIQUE (order_line_id, sequence_number)
);

CREATE TABLE kanban_loops (              -- one pull loop: a part, a source, a destination
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id           UUID NOT NULL REFERENCES items (id),
  kind              TEXT NOT NULL CHECK (kind IN ('production', 'withdrawal', 'supplier')),
  source_facility_id UUID REFERENCES facilities (id),
  source_party_id   UUID REFERENCES parties (id),   -- for supplier loops
  destination_work_center_id UUID REFERENCES work_centers (id),
  container_quantity NUMERIC(14, 3) NOT NULL CHECK (container_quantity > 0),
  card_count        SMALLINT NOT NULL CHECK (card_count > 0),
  replenishment_lead_hours NUMERIC(8, 2) NOT NULL,
  valid_during      TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL)
);

CREATE TABLE kanban_signals (            -- one container emptied and its replenishment
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  loop_id        UUID NOT NULL REFERENCES kanban_loops (id),
  card_number    SMALLINT NOT NULL,
  signaled_at    TIMESTAMPTZ NOT NULL,   -- when the container was emptied or scanned
  received_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  replenished_at TIMESTAMPTZ,
  handling_unit_id UUID REFERENCES handling_units (id),  -- what came back full
  status         TEXT NOT NULL CHECK (status IN ('open', 'in_transit', 'replenished',
                   'cancelled'))
);
```

Notes on the choices:

- **Releases are kept as sent and superseded, never merged.** The current requirement is the latest release's lines; the history is every release, which is what an authorization claim, a premium freight dispute or a cum reconciliation reads.
- **Codes are kept as sent and mapped.** `qualifier_code` and `schedule_type` hold the partner's codes; `qualifier` is the meaning after a per-partner map, as tendering's partner codes are ([Tendering & Acceptance](/books/logistics/tendering#how-the-platforms-do-it)).
- **The buyer's cum is on the release.** `reported_cum_received` is what the buyer counted, as of a date; the supplier's own cum shipped is a sum over its shipments; the reconciliation compares the two.
- **Widening `documents.kind` repeats the list so far.** The constraint is replaced whole, `NOT VALID` then validated, so it carries the core kinds, the kinds [Customs Brokers & Bonds](/books/logistics/customs-brokers-and-bonds#how-to-build-it) added, and this chapter's; whichever chapter widens it next must carry all of them.

The supplier's next shipping requirement and its cum check, for one agreement line, from the current release:

```sql
WITH rel AS (
  SELECT * FROM supplier_schedule_releases
  WHERE order_line_id = $1 AND status = 'current' AND kind = 'planning'
), required AS (                         -- cum required through a date ($2)
  SELECT CASE WHEN bool_and(l.is_cumulative)
              THEN MAX(l.quantity) FILTER (WHERE lower(l.period) <= $2)
              ELSE SUM(l.quantity) FILTER (WHERE lower(l.period) <= $2)
                   + COALESCE(MAX(rel.reported_cum_received), 0)
         END AS cum_required
  FROM rel JOIN supplier_schedule_lines l ON l.release_id = rel.id
  WHERE l.qualifier IN ('firm', 'immediate', 'first_time_firm')
), shipped AS (                          -- the supplier's cum shipped since the cum start
  SELECT COALESCE(SUM(sl.quantity), 0) AS cum_shipped,
         COALESCE(SUM(sl.quantity) FILTER (WHERE s.status <> 'delivered'), 0) AS in_transit
  FROM shipment_lines sl
  JOIN shipments s ON s.id = sl.shipment_id
  JOIN order_lines ol ON ol.id = sl.order_line_id
  WHERE sl.order_line_id = $1
    AND s.status IN ('picked_up', 'in_transit', 'delivered', 'exception')  -- left the dock
    AND s.created_at >= ol.cum_start_on
)
SELECT r.cum_required, s.cum_shipped,
       GREATEST(r.cum_required - s.cum_shipped, 0) AS to_ship,
       s.cum_shipped - s.in_transit - rel.reported_cum_received AS cum_discrepancy
FROM required r, shipped s, rel;
```

With a discrete schedule, the buyer's reported cum plus the discrete firm quantities through the date is the cum required; with a cumulative one, the line itself is the cum. A nonzero `cum_discrepancy` beyond rounding stops automatic shipment planning for the line until someone reconciles it, because shipping to a wrong cum either short-ships the buyer's line or ships parts nobody authorized.

## Auditing

- **Every release as received,** with its purpose, quantity basis, horizon, generated and received times, and the release it superseded.
- **Every authorization by resource,** with its through date, cum and high-water mark, which decide what a buyer owes when a program ends early.
- **Every ASN sent, its send time against the shipment's departure, and every 824 received,** because ASN compliance is measured and charged.
- **Every cum reconciliation and its resolution,** and every premium shipment with the cause (a cum error, a late release, a supplier miss).
- **Sequence slots from receipt to delivery,** with the rack and truck, so a line stop can be traced to the slot that caused it.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails#what-a-record-holds).

## What This Means for the System You Build

- **Model the scheduling agreement as an order line** and every schedule as a release against it, kept as sent and superseded, never merged.
- **Store the qualifier on every line,** and treat firm, planning and authorized quantities as different commercial facts.
- **Keep the 830's authorizations separate from its forecast,** with through dates and the high-water mark.
- **Let the 862 replace near-term shipping detail and nothing else;** it can't change an authorization.
- **Reconcile cums every day,** counting in-transit ASNs, and stop automatic shipping on a discrepancy.
- **Send the ASN within the buyer's window** and monitor 824s like orders.
- **Label every container to the buyer's standard,** with one licence plate the ASN lists.
- **Treat sequence and kanban as their own grains,** a vehicle slot and a container, with fast paths for exceptions.

## References

**Standards**

- [X12: Transaction sets](https://x12.org/products/transaction-sets), the titles of the 824, 830, 856, 862, 866, 997 and 999
- [Stedi: X12 830 Planning Schedule with Release Capability (release 8010)](https://www.stedi.com/edi/x12/transaction-set/830), the three uses, release capability and the segment structure
- [Stedi: X12 862 Shipping Schedule](https://www.stedi.com/edi/x12/transaction-set/862), its relation to the 830, JIT use, no authorization and consolidated scheduling
- [Stedi: X12 866 Production Sequence](https://www.stedi.com/edi/x12/transaction-set/866), arrival, unloading and consumption order, and no authorization
- [Stedi: X12 824 Application Advice](https://www.stedi.com/edi/x12/transaction-set/824), acceptance and rejection reporting
- [Stedi: BFR segment](https://www.stedi.com/edi/x12/segment/BFR), purpose, schedule type and quantity qualifiers, horizon and generated dates
- [Stedi: Element 353, transaction set purpose code](https://www.stedi.com/edi/x12/element/353), codes 00, 01, 04 and 05
- [Stedi: Element 675, schedule type qualifier](https://www.stedi.com/edi/x12/element/675), DL, SH, PD, KB, JS and others
- [Stedi: Element 676, schedule quantity qualifier](https://www.stedi.com/edi/x12/element/676), actual discrete, cumulative, net change and replacement
- [Stedi: FST segment](https://www.stedi.com/edi/x12/segment/FST), the forecast line and the flexible interval rule
- [Stedi: Element 680, forecast qualifier](https://www.stedi.com/edi/x12/element/680), firm, planning and the other qualifiers
- [Stedi: Element 681, forecast timing qualifier](https://www.stedi.com/edi/x12/element/681), discrete, daily, weekly, monthly and flexible buckets
- [Stedi: ATH segment](https://www.stedi.com/edi/x12/segment/ATH), the authorization elements, the high-water mark and the cum start date
- [Stedi: Element 672, resource authorization code](https://www.stedi.com/edi/x12/element/672), FI, MT, LB, LM, PQ and PR
- [Stedi: SHP segment](https://www.stedi.com/edi/x12/segment/SHP), shipped and received quantities and cumulative dates
- [Stedi: Element 673, quantity qualifier](https://www.stedi.com/edi/x12/element/673), discrete, cumulative and received
- [Stedi: JIT segment](https://www.stedi.com/edi/x12/segment/JIT), the JIT quantity and time
- [Stedi: BSS segment](https://www.stedi.com/edi/x12/segment/BSS), the 862 and 866 header and horizon
- [Stedi: EDIFACT DELFOR (D21A)](https://www.stedi.com/edi/edifact/messages/DELFOR), the delivery schedule message and its authorization use
- [Stedi: EDIFACT DELJIT (D21A)](https://www.stedi.com/edi/edifact/messages/DELJIT), the just-in-time sequence message
- [AIAG: Packaging and labeling](https://www.aiag.org/expertise-areas/supply-chain-management/packaging---labeling), B-10 and B-16 and their versions
- [AIAG: Electronic data interchange](https://www.aiag.org/expertise-areas/supply-chain-management/materials-management/electronic-data-interchange-(edi)), the adoption of X12, harmonization with Odette and JAMA/JAPIA, the global guideline and Global DESADV
- [AIAG: MMOG/LE](https://www.aiag.org/expertise-areas/supply-chain-management/materials-management/(mmog-le)-global-materials-management-operations-guideline), the self-assessment and version 6
- [Odette: OFTP2](https://www.odette.org/oftp2), RFC 5024 and its security features
- [Odette: Global Transport Label, Odette profile (version 2.4)](https://www.odette.org/resources/global-transport-label-1-2), the label's origins, licence plate and symbologies
- [Odette: MMOG/LE](https://www.odette.org/mmog), its authors, users and sites

**In practice**

- [Volvo Group: Global DELFOR D04A guidelines (issue 2.2.2, February 2025)](https://www.edi.volvogroup.com/content/dam/volvo-group/markets/edi/specifications-and-guidelines/delivery-schedule-and-mrl/volvo-delfor-d04a-2-2-implementation-guideline.pdf), firm and forecast quantities, material commitment, in-transit and cumulative received quantities with the accumulation start date, and replacement of schedules
- [Volvo Group: Global DESADV D07A guidelines (issue 1.4, March 2026)](https://www.edi.volvogroup.com/content/dam/volvo-group/markets/edi/specifications-and-guidelines/despatch-advice-and-asn/volvo-desadv-d07a-implementation-guideline-v1-4.pdf), despatch advice timing and packaging labels
- [Volvo Group: JIT/JIS specifications](https://www.edi.volvogroup.com/en-en/specifications-and-guidelines/jit-jis.html), the DELJIT subsets for sequence and kanban deliveries
- [Magna: Global Supplier Operational Requirements (revision 1.1, January 2024)](https://www.magna.com/docs/default-source/suppliers/2024-global-supply-chain-requirements/magna-global-supply-chain-requirements_1-1_jan24-01.pdf?sfvrsn=5ee1d80b_11), accepted EDI standards, ASN timing and contingency, firm versus forecast releases, label standards, seal numbers, JIT warehousing, on-time expectation and MMOG ratings
- [Toyota: Toyota Production System](https://global.toyota/en/company/vision-and-philosophy/production-system/), the definition of just-in-time and the pull loop
- [Microsoft Learn: Lean manufacturing overview (Dynamics 365)](https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/lean-manufacturing-overview), pull systems and kanban rule types
