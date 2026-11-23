+++
title = "FSMA 204, DSCSA & UDI"
description = "The regulated traceability regimes: FSMA 204 food CTEs and KDEs, DSCSA package-level drug tracing and verification, and device UDI and GUDID."
category = "Logistics & Supply Chain Industry"
order = 2863
part = "Manufacturing"
tags = ["logistics", "manufacturing", "traceability", "fsma-204", "dscsa", "udi", "fda", "data-model"]
+++

Three US regimes turn traceability from good practice into a legal duty with named data elements, named events and a clock. Food on FDA's Food Traceability List carries a traceability lot code and key data elements at each critical tracking event under the FSMA 204 rule. Prescription drugs carry a serialized product identifier on every package, and every sale between trading partners carries transaction information, under the Drug Supply Chain Security Act (DSCSA). Medical devices carry a unique device identifier on the label and package, with the static part registered in FDA's GUDID, under the UDI rule. A company inside any of them has to produce its records on FDA's request, in hours, in the regulator's shape.

They are hard for different reasons. FSMA 204 reaches companies that never serialized anything (growers, packers, distributors, restaurants' suppliers) and asks for lot-level records at every hand-off, including the lot code's original source; its compliance date has moved, so systems are being built to a rule whose enforcement starts in 2028. DSCSA is serial-level for every package, exchanged electronically between every manufacturer, wholesaler and pharmacy, with verification on request inside 24 hours, and its own effective dates have been phased by exemption. UDI is the simplest on the label and the most demanding on master data: every device version and package level needs its own device identifier, published before the device ships.

This chapter covers each regime, what records it requires, how the dates stand as of November 2026, and the schema that adds each regime to the genealogy of [Lot & Serial Traceability](/books/logistics/lot-traceability#how-to-build-it). It extends `items`, `lots` and `shipment_events` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). Food import data FDA asks for at the border (prior notice, entry review) is [FDA: Prior Notice and Entry Review](/books/logistics/forced-labor-and-partner-agencies#fda-prior-notice-and-entry-review); FDA-regulated goods from a merchant's side are Commerce's [FDA-Regulated Goods](/books/commerce/product-safety-and-recalls#fda-regulated-goods); using these records in a recall is [Recalls From the Manufacturer's Side](/books/logistics/manufacturing-recalls).

## How the Regulators Do It

As of November 2026, from the statutes, the regulations and FDA's pages:

| Regime | Who it covers | Unit traced | Records and events | On request | Status |
| --- | --- | --- | --- | --- | --- |
| **FSMA 204** (21 CFR 1.1300 and following) | Firms that handle foods on the Food Traceability List, with exemptions in 1.1305 | The traceability lot | KDEs at seven CTEs; a traceability plan | Records within 24 hours; an electronic sortable spreadsheet during an outbreak, recall or other threat | Original compliance date January 20, 2026; FDA proposed July 20, 2028, and the Continuing Appropriations Act, 2026 directed FDA not to enforce before then |
| **Bioterrorism Act records** (21 CFR 1.337, 1.345, 1.361) | Most food facilities | One up, one down | Source and recipient, lot "to the extent this information exists" | "As soon as possible, not to exceed 24 hours" from a qualifying request | In force |
| **DSCSA** (21 USC 360eee, 360eee-1) | Manufacturers, repackagers, wholesale distributors, dispensers of prescription drugs | The package: NDC plus serial, lot and expiry | Transaction information and statement per transaction, interoperable and electronic | Verification within 24 hours; tracing back to the manufacturer | Enhanced requirements effective 10 years after enactment; small dispensers exempt until November 27, 2027 |
| **UDI** (21 CFR 801.20, part 830) | Device labelers | The device version (DI) and its production (PI) | A UDI on every label and package; DI data in GUDID | (Feeds tracking and recalls) | In force; tied into the QMSR since February 2, 2026 |

The patterns:

- **Each regime names its own data elements.** FSMA 204's KDEs, DSCSA's transaction information and UDI's GUDID attributes overlap (product, lot, date, parties) but aren't the same lists; store each regime's elements as that regime defines them, mapped from one genealogy.
- **The clock starts at the request.** FSMA 204 and the Bioterrorism Act both give 24 hours from FDA's request; DSCSA gives 24 hours to answer a verification request. A company that has to assemble the answer by email and spreadsheet misses it.
- **Dates move by exemption and enforcement discretion, not only by rule.** FSMA 204's compliance date, DSCSA's phase-in and the small dispenser exemption were all set by proposals, directives and exemption letters; the system's rules need effective dates and the document that set them ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).

## FSMA 204: Food Traceability

Section 204 of the FDA Food Safety Modernization Act led to FDA's final rule on "Requirements for Additional Traceability Records for Certain Foods," codified at 21 CFR 1.1300 and following, which applies to foods on the **Food Traceability List** and to foods that contain a listed food as an ingredient if the ingredient keeps the form in which it appears on the list (1.1310).

**The vocabulary.** A critical tracking event (CTE) is "an event in the supply chain of a food involving the harvesting," cooling, initial packing, first land-based receiving of food from a fishing vessel, shipping, receiving or transformation of the food. A key data element (KDE) is information tied to a CTE that must be kept or provided. A **traceability lot code** (TLC) is "a descriptor, often alphanumeric, used to uniquely identify a traceability lot" within the records of the firm that assigned it. The **traceability lot code source** is the place where the food was given its TLC, and a **TLC source reference** is "an alternative method for providing FDA with access to the location description" of that place, such as an FDA Food Facility Registration Number. A **reference document** is "a business transaction document, record, or message, in electronic or paper form" that may contain some or all KDEs: a bill of lading, an invoice, an ASN, a production log.

**Who assigns the code.** A TLC is assigned when a firm initially packs a raw agricultural commodity (other than food from a fishing vessel), performs first land-based receiving of food from a fishing vessel, or transforms a food (1.1320(a)). A firm "must not establish a new traceability lot code" for other activities such as shipping (1.1320(b)). The TLC is therefore the packer's or processor's code, and it travels unchanged through every distributor until someone transforms the food: commingles, repacks, relabels, processes. In the core model the TLC is the `lots.lot_code` of the lot the assigning firm created, with the TLC source recorded on the lot.

**The KDEs for the hand-offs.** For each traceability lot shipped, the shipper keeps (1.1340(a)): the TLC; the quantity and unit of measure ("e.g., 6 cases, 25 reusable plastic containers, 100 tanks, 200 pounds"); the product description; the location description for the immediate subsequent recipient (other than a transporter); the location description for where it shipped from; the ship date; the location description for the TLC source or the TLC source reference; and the reference document type and number. It must send the first seven to the recipient "in electronic, paper, or other written form" (1.1340(b)). The receiver keeps the mirror set (1.1345(a)): the TLC, quantity and unit, product description, the immediate previous source (other than a transporter), where it was received, the receive date, the TLC source or reference, and the reference document type and number. For **transformation** (1.1350(a)) the firm keeps, for each input lot from the list, its TLC, product description and "the quantity and unit of measure of the food used from that lot," and for the output the new TLC, where and when transformation was completed, the product description, quantity and unit, and the reference document. Harvesting, cooling, initial packing and first land-based receiving have their own lists in 1.1325 to 1.1335.

**The plan and the request.** Each covered firm keeps a traceability plan (1.1315): how it keeps records and where, how it identifies listed foods, how it assigns TLCs, a point of contact, and a farm map for growers. Records are kept for 2 years and made available "within 24 hours (or within some reasonable time to which FDA has agreed) after the request," with offsite storage allowed if they can be produced in that time (1.1455). During a foodborne illness outbreak, a recall or another threat to public health, FDA may ask for the KDEs of 1.1325 to 1.1350 and the firm "must provide such information in an electronic sortable spreadsheet," with whatever is needed to understand it; small farms, small retail food establishments and restaurants, and other businesses below the rule's sales thresholds may provide it another way.

**The dates.** FDA's rule set a compliance date of January 20, 2026. On August 7, 2025 FDA proposed extending it 30 months, to July 20, 2028; FDA's page (current as of November 4, 2026) says the Continuing Appropriations Act, 2026 "directed FDA not to enforce the Food Traceability Rule prior to that same date" and that "FDA intends to comply with this Congressional directive." The Federal Register shows no final rule adopting the new date as of November 22, 2026, so the July 20, 2028 date stands as a proposal plus a congressional bar on enforcement, not as an amended compliance date in the rule. <!-- source-gap: logistics-regulated-traceability-fsma-final-date | status | whether FDA finalized the July 20, 2028 FSMA 204 compliance date by rule | closes with: a Federal Register final rule on the compliance date extension (proposed rule 2025-14967) | checked: 2026-11-22 --> FDA has kept working the rule: it exempted certain cottage cheese products effective February 20, 2026, and issued draft question-and-answer guidance the same day; on May 28, 2026 it released a discussion paper on possible flexibilities for lot-level tracking and announced a public meeting on it (held June 15, 2026), followed by a second meeting on November 6, 2026; and on October 9, 2026 it published draft guidance saying it does not intend to enforce certain requirements for some retail food establishments and restaurants. Large retailers haven't waited: ReposiTrak's 2026 10-K says "Several major retailers have announced traceability requirements that exceed the scope of FSMA 204," covering more data elements and food categories on timelines ahead of FDA enforcement.

What this means for the system: the CTE and KDE records are events with a fixed schema, keyed to the TLC; the shipping record's KDEs are an outbound document the recipient needs (the TLC and its source most of all, which is why the ASN and the BOL are the usual carriers); and the sortable spreadsheet is a query over those events for a lot, product or date range, produced on demand. ReposiTrak describes its network at "30,000+ suppliers" and "8.2 million+ traceability records" and says nearly 40% of supplier traceability records it sees "contain errors," which is the practical argument for validating inbound KDEs at receipt rather than at the request.

## DSCSA

The Drug Supply Chain Security Act, enacted November 27, 2013, is sections 581 and 582 of the FD&C Act (21 USC 360eee and 360eee-1). It applies to prescription drugs in finished dosage form moving between **trading partners**: manufacturers, repackagers, wholesale distributors and dispensers (pharmacies).

**The product identifier.** Each package and homogeneous case carries a product identifier, "a standardized graphic that includes, in both human-readable form and on a machine-readable data carrier," the **standardized numerical identifier** (the NDC with a unique serial number of up to 20 characters), the lot number and the expiration date. The machine-readable carrier is commonly a GS1 DataMatrix "encoded with a Global Trade Item Number" that carries the NDC, serial, lot and expiry, as GS1 US describes it. Separately, FDA's March 5, 2026 final rule (91 FR 10749) moves every FDA-assigned NDC to 12 digits in three segments (a 6-digit labeler code, 4-digit product code and 2-digit package code) and lets drug labels use other data carriers that meet its standards, effective March 7, 2033; an NDC column sized for today's 10 digits will not hold it.

**What moves with each sale.** Every change of ownership carries:

- **Transaction information (TI):** the product name, strength and dosage form, NDC, container size, number of containers, lot number, transaction date, the shipment date if more than 24 hours after the transaction, and the seller's and buyer's names and addresses.
- **Transaction statement (TS):** the transferring entity's attestation that it is authorized, received the product from an authorized source, did not knowingly ship a suspect or illegitimate product, and did not knowingly alter the transaction history.
- **Transaction history (TH):** the TI of each prior transaction back to the manufacturer; the statute still defines it, and under the enhanced requirements the package-level TI exchange is what carries the chain.

Records of TI, TH and TS are kept "for not less than 6 years after the date of the transaction."

**Enhanced drug distribution security.** Ten years after enactment, section 582(g)(1) requires that TI and TS be exchanged "in a secure, interoperable, electronic manner"; that TI include the product identifier at the package level; that trading partners have systems to verify product at the package level, using aggregation and inference where necessary; systems to promptly provide TI and TS to FDA for a recall or an investigation of suspect or illegitimate product; the ability to gather the TI of each transaction back to the manufacturer on request; and that a saleable return be accepted only if it can be linked to its TI and TS. GS1 US describes EPCIS as the GS1 standard trading partners use to share this data across systems. FDA granted time-limited exemptions from 582(g)(1) to eligible trading partners on October 9, 2024; the exemption pages I could open do not state the end dates by sector for manufacturers, wholesale distributors and large dispensers, and FDA's current exemptions page (as of August 26, 2026) lists only the small dispenser exemption. <!-- source-gap: logistics-regulated-traceability-dscsa-exemptions | missing | the expiry dates of FDA's October 9, 2024 DSCSA exemptions for manufacturers and repackagers, wholesale distributors and dispensers | closes with: the FDA exemption letters or guidance stating each date, opened by fetch | checked: 2026-11-22 --> For **small dispensers** (a dispenser whose owning company has 25 or fewer full-time employees licensed as pharmacists or qualified as pharmacy technicians, measured as of November 27, 2026), FDA's August 6, 2026 exemption runs "until November 27, 2027," and covers their trading partners where applicable.

**Verification, suspect and illegitimate product.** A manufacturer responds to a verification request from an authorized repackager, wholesale distributor or dispenser within 24 hours (or another reasonable time FDA sets); verification means "determining whether the product identifier affixed to, or imprinted upon, a package" matches the standardized numerical identifier, or the lot and expiry, the manufacturer assigned. A **suspect product** is one with "reason to believe" it is counterfeit, diverted, stolen, intentionally adulterated, part of a fraudulent transaction or otherwise unfit for distribution; an **illegitimate product** is one where "credible evidence shows" it. Suspect product is quarantined and investigated; on a determination that product is illegitimate, the manufacturer notifies FDA and its immediate trading partners within 24 hours. Saleable returns are verified at the serial level before they are resold.

The data shape is serial-level and event-based: commissioning of serials at packaging, aggregation of packages into cases and cases into pallets, shipping with TI and TS to a named buyer, receiving, verification requests and their answers, and decommissioning on dispense or destruction. That is the EPCIS model of [Lot & Serial Traceability](/books/logistics/lot-traceability#epcis-2-0) with DSCSA's attributes on top: `serialized_units` for packages, `handling_units` and aggregation events for cases and pallets, and the transaction records below.

## UDI

The unique device identification rule requires that "The label of every medical device shall bear a unique device identifier (UDI)" and that "Every device package shall bear a UDI," with exceptions in 801.30, 801.45 and 801.128(f)(2) and a route to request others in 801.55 (21 CFR 801.20). A UDI is "an identifier that adequately identifies a device through its distribution and use" (21 CFR 830.3), and has two parts:

- **Device identifier (DI):** "a mandatory, fixed portion of a UDI" that identifies the labeler and the specific version or model. Each package level (the unit, a box of ten, a case) has its own DI.
- **Production identifier (PI):** a conditional, variable portion that appears when the label carries it: the lot or batch, the serial number, the expiration date, the manufacturing date, and, for certain HCT/Ps regulated as devices, a distinct identification code.

A UDI must be issued under a system operated by FDA or by an FDA-accredited **issuing agency**, conform to ISO/IEC 15459-2, -4 and -6, and use only the invariant characters of ISO/IEC 646 (830.20). In practice a labeler using GS1 encodes the DI as a GTIN and the PI as the AIs for lot (10), serial (21), expiry (17) and production date (11), the same keys as any other trade item. The label carries the UDI in plain text and in an automatic identification and data capture (AIDC) form.

**GUDID.** The Global Unique Device Identification Database "contains ONLY the device identifier (DI) portion of the UDI": the DI record with the device's attributes, and flags that say which PIs appear on the label, never the lot or serial values themselves. Labelers submit one device at a time through the GUDID web interface or in bulk as HL7 SPL through FDA's Electronic Submissions Gateway; AccessGUDID publishes the data to anyone. Since February 2, 2026, the QMSR's 820.10 ties ISO 13485's identification clause to "a unique device identification system under part 830," so the UDI is part of the quality system, and complaint records under 820.35 must carry "Any unique device identifier (UDI) or universal product code (UPC)" ([The Standards](/books/logistics/quality-management#the-standards)).

For the system, the DI belongs to the item (one per item and package level, with its GUDID record and publication status), and the PI belongs to the lot and the serialized unit, which already exist. The job is master data discipline: a new DI for a new version or package configuration, published before the first shipment, and a label that prints the PIs the GUDID record says it carries.

## How to Build It

Items gain each regime's product identifiers; lots gain the TLC source; CTEs are their own events with KDEs and inputs, linked to the shipment events they describe; DSCSA transactions and verifications are records with clocks; and every regulator's request is a case with a due time and the export that answered it.

```sql
ALTER TABLE items
  ADD COLUMN ftl_category       TEXT,     -- the Food Traceability List entry, when listed
  ADD COLUMN ndc                TEXT,     -- as assigned; 12 digits after the 2033 format change
  ADD COLUMN dscsa_product      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN udi_di             TEXT,     -- the device identifier for this package level
  ADD COLUMN udi_issuing_agency TEXT,
  ADD COLUMN gudid_published_at TIMESTAMPTZ;
ALTER TABLE items ADD CONSTRAINT items_udi_issuing_agency_check
  CHECK (udi_issuing_agency IN ('gs1', 'hibcc', 'iccbba', 'fda')) NOT VALID;
CREATE UNIQUE INDEX CONCURRENTLY items_udi_di_key ON items (udi_di) WHERE udi_di IS NOT NULL;

ALTER TABLE lots
  ADD COLUMN tlc_source_facility_id UUID REFERENCES facilities (id),  -- where the TLC was assigned
  ADD COLUMN tlc_source_reference   TEXT;  -- e.g. an FDA food facility registration number

ALTER TABLE shipment_events
  ADD COLUMN critical_tracking_event_id UUID;  -- the CTE this movement is evidence of
ALTER TABLE items VALIDATE CONSTRAINT items_udi_issuing_agency_check;

CREATE TABLE critical_tracking_events (  -- FSMA 204: one CTE with its KDEs
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                    TEXT NOT NULL CHECK (kind IN ('harvesting', 'cooling',
                            'initial_packing', 'first_land_based_receiving', 'shipping',
                            'receiving', 'transformation')),
  lot_id                  UUID NOT NULL REFERENCES lots (id),  -- the traceability lot (TLC)
  product_description     TEXT NOT NULL,  -- snapshot, as the rule requires it
  quantity                NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  uom                     TEXT NOT NULL,  -- 'cases', 'RPCs', 'lb', as recorded
  location_facility_id    UUID NOT NULL REFERENCES facilities (id),  -- where it happened
  counterparty_party_id   UUID REFERENCES parties (id),   -- previous source or next recipient
  counterparty_facility_id UUID REFERENCES facilities (id),
  tlc_source_facility_id  UUID REFERENCES facilities (id),  -- snapshot from the lot
  tlc_source_reference    TEXT,
  event_date              DATE NOT NULL,  -- the date the rule asks for, in the location's zone
  occurred_at             TIMESTAMPTZ,
  reference_document_type TEXT NOT NULL,  -- 'bol', 'invoice', 'asn', 'production_log'
  reference_document_number TEXT NOT NULL,
  document_id             UUID REFERENCES documents (id),
  shipment_id             UUID REFERENCES shipments (id),
  extra_kdes              JSONB NOT NULL DEFAULT '{}',  -- harvest, cooling and vessel elements
  provided_to_recipient_at TIMESTAMPTZ,   -- shipping: when the KDEs went to the receiver
  source                  TEXT NOT NULL CHECK (source IN ('captured', 'partner', 'epcis',
                            'edi', 'manual')),
  epcis_event_id          UUID REFERENCES epcis_events (id),
  received_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind NOT IN ('shipping', 'receiving') OR counterparty_facility_id IS NOT NULL),
  CHECK (tlc_source_facility_id IS NOT NULL OR tlc_source_reference IS NOT NULL)
);
CREATE INDEX ON critical_tracking_events (lot_id, event_date);
ALTER TABLE shipment_events ADD CONSTRAINT shipment_events_cte_fkey
  FOREIGN KEY (critical_tracking_event_id) REFERENCES critical_tracking_events (id) NOT VALID;
ALTER TABLE shipment_events VALIDATE CONSTRAINT shipment_events_cte_fkey;

CREATE TABLE critical_tracking_event_inputs (  -- transformation: each input lot used
  critical_tracking_event_id UUID NOT NULL REFERENCES critical_tracking_events (id),
  input_lot_id        UUID NOT NULL REFERENCES lots (id),
  product_description TEXT NOT NULL,
  quantity            NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  uom                 TEXT NOT NULL,
  lot_consumption_id  UUID REFERENCES lot_consumptions (id),  -- the genealogy edge it reports
  PRIMARY KEY (critical_tracking_event_id, input_lot_id)
);

CREATE TABLE dscsa_transactions (        -- one change of ownership, with its TI and TS
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  direction           TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  seller_party_id     UUID NOT NULL REFERENCES parties (id),
  buyer_party_id      UUID NOT NULL REFERENCES parties (id),
  transaction_date    DATE NOT NULL,
  shipment_date       DATE,              -- required when more than 24 hours after the transaction
  shipment_id         UUID REFERENCES shipments (id),
  order_id            UUID REFERENCES orders (id),
  statement_attested  BOOLEAN NOT NULL,  -- the transaction statement was given or received
  epcis_event_id      UUID REFERENCES epcis_events (id),  -- the shipping or receiving event
  document_id         UUID REFERENCES documents (id),     -- the EPCIS document as exchanged
  retain_until        DATE NOT NULL,     -- 6 years after the transaction date
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (seller_party_id <> buyer_party_id)
);

CREATE TABLE dscsa_transaction_lines (   -- the TI per product, with package-level identifiers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  dscsa_transaction_id UUID NOT NULL REFERENCES dscsa_transactions (id),
  item_id             UUID NOT NULL REFERENCES items (id),
  ndc                 TEXT NOT NULL,     -- snapshot
  product_name        TEXT NOT NULL,
  strength_and_form   TEXT NOT NULL,
  container_size      TEXT NOT NULL,
  containers          INT NOT NULL CHECK (containers > 0),
  lot_id              UUID NOT NULL REFERENCES lots (id),
  serial_count        INT NOT NULL DEFAULT 0  -- the serials are in dscsa_transaction_units
);

CREATE TABLE dscsa_transaction_units (   -- each package or homogeneous case in the transaction
  dscsa_transaction_line_id UUID NOT NULL REFERENCES dscsa_transaction_lines (id),
  serialized_unit_id  UUID NOT NULL REFERENCES serialized_units (id),
  inferred            BOOLEAN NOT NULL DEFAULT FALSE,  -- from an aggregate, not scanned
  PRIMARY KEY (dscsa_transaction_line_id, serialized_unit_id)
);

CREATE TABLE dscsa_verifications (       -- a verification request and its answer
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  direction            TEXT NOT NULL CHECK (direction IN ('received', 'sent')),
  requester_party_id   UUID NOT NULL REFERENCES parties (id),
  responder_party_id   UUID NOT NULL REFERENCES parties (id),
  reason               TEXT NOT NULL CHECK (reason IN ('saleable_return', 'suspect_product',
                         'routine', 'other')),
  gtin                 TEXT NOT NULL,
  serial_number        TEXT NOT NULL,
  lot_code             TEXT NOT NULL,
  expires_on           DATE NOT NULL,
  requested_at         TIMESTAMPTZ NOT NULL,
  due_at               TIMESTAMPTZ NOT NULL,  -- 24 hours, or the time FDA set
  responded_at         TIMESTAMPTZ,
  result               TEXT CHECK (result IN ('verified', 'not_verified', 'unknown_identifier')),
  serialized_unit_id   UUID REFERENCES serialized_units (id),
  CHECK (responded_at IS NULL OR result IS NOT NULL)
);

CREATE TABLE suspect_product_investigations (  -- quarantine, investigation, determination
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  opened_at            TIMESTAMPTZ NOT NULL,
  trigger              TEXT NOT NULL CHECK (trigger IN ('verification_failed', 'fda_request',
                         'trading_partner_notice', 'internal')),
  item_id              UUID NOT NULL REFERENCES items (id),
  lot_id               UUID REFERENCES lots (id),
  quarantined_at       TIMESTAMPTZ,
  determination        TEXT CHECK (determination IN ('cleared', 'illegitimate')),
  determined_at        TIMESTAMPTZ,
  fda_notified_at      TIMESTAMPTZ,      -- within 24 hours of an illegitimate determination
  partners_notified_at TIMESTAMPTZ,
  closed_at            TIMESTAMPTZ,
  CHECK (determination IS DISTINCT FROM 'illegitimate' OR determined_at IS NOT NULL)
);

CREATE TABLE traceability_requests (     -- a regulator's or partner's request, with its clock
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  regime             TEXT NOT NULL CHECK (regime IN ('fsma_204', 'bioterrorism_records',
                       'dscsa', 'device_tracking', 'customer')),
  requester_party_id UUID NOT NULL REFERENCES parties (id),
  received_at        TIMESTAMPTZ NOT NULL,
  due_at             TIMESTAMPTZ NOT NULL,  -- 24 hours or the time agreed, computed and stored
  due_basis          TEXT NOT NULL,         -- the rule or agreement that set due_at
  scope              JSONB NOT NULL,        -- items, lots, TLCs, date range, as asked
  sortable_spreadsheet BOOLEAN NOT NULL DEFAULT FALSE,  -- FSMA 204 outbreak or recall request
  response_content_ref TEXT,                -- the export as sent
  response_sha256    BYTEA,
  sent_at            TIMESTAMPTZ,
  status             TEXT NOT NULL CHECK (status IN ('open', 'sent', 'clarified', 'closed')),
  CHECK (status <> 'sent' OR sent_at IS NOT NULL)
);
```

Notes on the choices:

- **CTEs are their own records, not shipment events.** A shipment event says a truck arrived; a receiving CTE says which TLC, how much, from which previous source, with which reference document. `shipment_events.critical_tracking_event_id` links the two when one proves the other.
- **The rule's fields are snapshots.** Product description, quantity as recorded and the TLC source are copied onto the CTE, because the spreadsheet must show what the firm recorded at the time, not today's master data.
- **Transformation inputs point at genealogy.** Each CTE input names the `lot_consumptions` edge it reports, so the FSMA record and the plant's genealogy can't disagree silently.
- **Clocks are stored with their basis.** `due_at` on requests and verifications is computed from the regime's rule (or FDA's agreed time) and kept with the rule that set it ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Retention is per record.** FSMA 204 records are kept 2 years and DSCSA transaction data 6 years; `retain_until` makes the longer obligation explicit where both apply to a company.

The FSMA 204 sortable spreadsheet for one TLC or product and date range is a flat query over the CTEs, one row per event, with the columns the rule names; it goes out as a CSV with the export rules of [Exports](/docs/building-blocks/imports-and-exports#exports), including the [CSV Injection](/docs/building-blocks/imports-and-exports#csv-injection) guard, because lot codes and descriptions come from partners:

```sql
SELECT l.lot_code                         AS traceability_lot_code,
       e.kind                             AS critical_tracking_event,
       e.product_description,
       e.quantity, e.uom,
       e.event_date,
       loc.name                           AS location,
       cp.name                            AS previous_source_or_recipient,
       COALESCE(src.name, e.tlc_source_reference) AS tlc_source,
       e.reference_document_type, e.reference_document_number,
       (SELECT string_agg(il.lot_code || ' ' || i.quantity || ' ' || i.uom, '; ')
        FROM critical_tracking_event_inputs i JOIN lots il ON il.id = i.input_lot_id
        WHERE i.critical_tracking_event_id = e.id) AS transformation_inputs
FROM critical_tracking_events e
JOIN lots l ON l.id = e.lot_id
JOIN facilities loc ON loc.id = e.location_facility_id
LEFT JOIN facilities cp ON cp.id = e.counterparty_facility_id
LEFT JOIN facilities src ON src.id = e.tlc_source_facility_id
WHERE (l.lot_code = $1 OR $1 IS NULL)
  AND e.event_date BETWEEN $2 AND $3
ORDER BY l.lot_code, e.event_date, e.kind;
```

## Auditing

- **Every CTE** with its KDEs as recorded, its reference document, its source (captured, partner, EPCIS) and the time it was received, and for shipping CTEs when the KDEs were sent to the recipient.
- **The traceability plan's versions,** with their effective dates, because FDA asks for the plan in force when the records were made.
- **Every DSCSA transaction** with TI, TS, the serials and whether each was scanned or inferred from an aggregate, retained 6 years.
- **Every verification request and investigation** with request, due and answer times, results, quarantine, determination and notifications.
- **Every GUDID publication** per DI, and the label configuration that prints the PIs it declares.
- **Every regulator request** with its scope, due time and basis, the export as sent (with its hash) and the time it went.

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Build one genealogy and project each regime onto it:** FSMA CTEs, DSCSA transactions and UDI identifiers as views of the same lots, serials and shipments.
- **Carry the TLC and its source unchanged** from the packer or transformer through every distributor, on the ASN and the BOL, and assign a new one only on transformation.
- **Validate inbound KDEs and TI at receipt,** not when FDA calls.
- **Store package-level serials and their aggregation** for DSCSA, and answer verification requests inside 24 hours.
- **Treat each DI as item master data,** one per version and package level, published to GUDID before first shipment.
- **Keep regime dates as dated rules** with the document that set them, because compliance dates and exemptions move.
- **Make the 24-hour export a tested query,** rehearsed like a mock recall.

## References

**Regulations and statutes**

- [21 CFR 1.1310 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.1310), definitions of CTE, KDE, traceability lot code, TLC source and reference, reference document, transformation and the Food Traceability List
- [21 CFR 1.1320 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.1320), when a traceability lot code is assigned and the bar on new codes for other activities
- [21 CFR 1.1340 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.1340), shipping KDEs and what goes to the recipient
- [21 CFR 1.1345 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.1345), receiving KDEs
- [21 CFR 1.1350 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.1350), transformation KDEs for inputs and outputs
- [21 CFR 1.1455 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.1455), 24-hour availability, offsite storage, 2-year retention and the electronic sortable spreadsheet
- [21 CFR 1.337 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.337), Bioterrorism Act records of the immediate previous source, with lot "to the extent this information exists"
- [21 CFR 1.361 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/1.361), records available "as soon as possible, not to exceed 24 hours" after an official request
- [21 U.S.C. 360eee (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/360eee), DSCSA definitions: product identifier, standardized numerical identifier, transaction information, statement and history, suspect and illegitimate product, verification
- [21 U.S.C. 360eee-1 (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/360eee-1), trading partner requirements, 24-hour verification, illegitimate product notification, six-year retention and the enhanced requirements of 582(g)(1)
- [21 CFR 801.20 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/801.20), a UDI on every device label and package, and the exceptions
- [21 CFR 830.3 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/830.3), UDI, device identifier, production identifier, issuing agency, labeler, GUDID and AIDC
- [21 CFR 830.20 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/830.20), issuance by FDA or an accredited agency, ISO/IEC 15459 and ISO/IEC 646

**FDA and the Federal Register**

- [FDA: FSMA Final Rule on Requirements for Additional Traceability Records for Certain Foods](https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods), the CTEs, the TLC, the traceability plan, 24-hour access and the July 20, 2028 date with the Continuing Appropriations Act, 2026 directive (current as of November 4, 2026)
- [Federal Register: traceability rule documents](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22Requirements+for+Additional+Traceability+Records%22&order=newest&per_page=10), the August 7, 2025 proposed extension, the February 20, 2026 cottage cheese exemption and Q&A draft guidance, the May 28, 2026 discussion paper and public meeting notice, the November 6, 2026 public meeting, the October 9, 2026 enforcement policy draft guidance, and no final rule on the compliance date
- [Federal Register API: Revising the National Drug Code Format (91 FR 10749)](https://www.federalregister.gov/api/v1/documents/2026-04368.json), the 12-digit, three-segment NDC and other data carriers, effective March 7, 2033
- [FDA: Exemptions under the DSCSA](https://www.fda.gov/drugs/drug-supply-chain-security-act-dscsa/exemptions-under-drug-supply-chain-security-act), the small dispenser exemption until November 27, 2027 and its 25-employee test
- [FDA: DSCSA waivers, exceptions and exemptions](https://www.fda.gov/drugs/drug-supply-chain-security-act-dscsa/drug-supply-chain-security-act-dscsa-waivers-exceptions-and-exemptions), the October 9, 2024 exemptions from 582(g)(1) for certain trading partners
- [FDA: GUDID](https://www.fda.gov/medical-devices/unique-device-identification-system-udi-system/global-unique-device-identification-database-gudid), DI-only content, PI flags, web and HL7 SPL submission, AccessGUDID

**Standards and industry**

- [GS1 US: Healthcare](https://www.gs1us.org/industries-and-insights/by-industry/healthcare), EPCIS for DSCSA data exchange and GS1 DataMatrix with GTIN, serial, lot and expiry for drugs and devices
- [ReposiTrak: 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/50471/000143774926031392/trak20260630_10k.htm), retailer requirements that exceed the rule's scope, and KDE capture at CTEs
- [ReposiTrak](https://repositrak.com/), network size, traceability record counts and the share of supplier records with errors
