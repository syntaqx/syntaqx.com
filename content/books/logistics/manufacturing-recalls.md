+++
title = "Recalls From the Manufacturer's Side"
nav_title = "Manufacturer Recalls"
description = "Running a recall as the maker: FDA Part 7 and device reports, FSIS notification, NHTSA Parts 573 and 577, scoping from lot genealogy, and mock recalls."
category = "Logistics & Supply Chain Industry"
order = 2864
part = "Manufacturing"
tags = ["logistics", "manufacturing", "recalls", "fda", "fsis", "nhtsa", "traceability", "data-model"]
+++

A recall starts with a fact a manufacturer would rather not have: a supplier's lot of spice tested positive for Salmonella, a sterilizer cycle failed its biological indicator after three pallets of catheters shipped, a weld on a steering column bracket cracks in fatigue testing at a third of its rated life. From that moment the manufacturer owes a regulator a notice on a clock (24 hours, 5 working days, 10 working days, "immediately"), owes every customer that received the product a letter that names lots, codes or serial numbers, and owes the regulator, for months afterward, an accounting of where every unit went and what was done with it.

It is hard because the questions arrive in the wrong order. The regulator wants the population before the root cause is understood; the lot genealogy that answers "which finished lots contain the bad input" lives in the MES and the ERP, and the shipments that answer "who has them" live in the TMS, a 3PL's WMS and a distributor's records the manufacturer can't see. Scope moves as investigation narrows or widens it, every consignee's answer has to be tracked to a quantity, and the counts reported in month four must reconcile with the scope declared on day one. A recall that can't show its arithmetic doesn't terminate.

This chapter covers the manufacturer's side of US recalls under the three regulators that run most of them: FDA (foods other than meat and poultry, drugs, devices, cosmetics, under 21 CFR Part 7 and, for devices, Part 806), FSIS (meat and poultry, under 9 CFR 418) and NHTSA (vehicles and equipment, under 49 CFR Parts 573 and 577), then how a recall is scoped from lot and serial genealogy and how a mock recall tests that before it matters. It extends `lots`, `shipments` and `parties` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model) and builds on the genealogy tables in [Lot & Serial Traceability](/books/logistics/lot-traceability#how-to-build-it) and the nonconformance and CAPA tables in [Quality Systems](/books/logistics/quality-management#how-to-build-it). Consumer product recalls under the CPSC, and the seller's steps of stop sale, finding buyers and remedy, belong to Commerce's [Product Safety, Compliance & Recalls](/books/commerce/product-safety-and-recalls#recalls); a dealer's duty not to sell a new vehicle with an open recall is in [Automotive Retail](/books/commerce/automotive-retail#disclosures-on-the-vehicle).

## How the Regulators Do It

As of November 2026, from the regulations and each agency's own pages:

| Regulator | Products | First notice owed | Classification | Ongoing reporting | Public record |
| --- | --- | --- | --- | --- | --- |
| **FDA, 21 CFR Part 7** | Foods (other than meat and poultry), drugs, biologics, cosmetics, devices | A firm removing a product it believes violative is "requested to notify immediately" its FDA district office (7.46) | Class I, II or III, assigned by FDA by degree of health hazard (7.3(m)) | Status reports at an interval FDA sets, "generally" every 2 to 4 weeks (7.53) | The weekly Enforcement Report (7.50); openFDA's enforcement endpoints, updated weekly, from 2004 |
| **FDA, 21 CFR Part 806** | Medical devices | A written report of a correction or removal "within 10-working days" of initiating it (806.10) | Part 7 classes | Part 7 status reports | As above |
| **FSIS, 9 CFR 418** | Meat and poultry products from official establishments | The local FSIS District Office "within 24 hours" of learning adulterated or misbranded product entered commerce (418.2) | Under FSIS Directive 8080.1 (not opened; see below) | Per the directive | FSIS's recall pages (not opened) |
| **NHTSA, 49 CFR 573 and 577** | Motor vehicles and equipment, tires, child seats | A Part 573 report "not more than 5 working days" after a defect is determined safety related (573.6) | None: a defect or noncompliance determination | Quarterly reports for six consecutive quarters (573.7) | Recalls by campaign number in NHTSA's public recalls API |
| **CPSC** | Consumer products | Section 15(b) reports | Corrective action plans | Progress reports | Owned by Commerce: [Reporting: Section 15(b)](/books/commerce/product-safety-and-recalls#reporting-section-15-b) |

The patterns:

- **The regulator classifies; the manufacturer runs it.** FDA assigns the class and reviews the strategy, NHTSA reviews the remedy and the letters, but the recalling firm sends the notices, collects the responses, does the effectiveness checks ("the recalling firm will ordinarily be responsible," 7.42) and reports the counts. The software is the manufacturer's.
- **Every regime asks the same three things.** What exactly is affected (lots, codes, serials, VINs, production dates), where it went (consignees with quantities and dates), and how much has been accounted for. A recall system is those three lists and the arithmetic between them.
- **Clocks start from a determination, not a discovery.** NHTSA's five working days run from when a defect "has been determined to be safety related"; FSIS's 24 hours from "learning or determining"; FDA's device clock from initiating the correction. When the manufacturer decided is a fact the regulator may later contest, so it is a recorded event with its evidence, not a field someone fills in afterward.
- **Readiness is a record too.** FDA asks for a "current written contingency plan" (7.59), the food rule requires a written recall plan for food with a hazard requiring a preventive control (117.139), FSIS requires written recall procedures (418.3), and FDA's guidance suggests mock recalls "to verify the firm's recall readiness." The plan, its tests and their results are auditable records.

## Recall, Correction, Withdrawal

FDA's definitions (21 CFR 7.3) decide which actions are recalls at all, and the system needs them as distinct kinds because they're reported differently:

- **Recall:** "a firm's removal or correction of a marketed product" that FDA considers in violation and against which it would initiate legal action, such as seizure.
- **Correction:** "repair, modification, adjustment, relabeling, destruction, or inspection (including patient monitoring)" of a product without moving it.
- **Market withdrawal:** "a firm's removal or correction of a distributed product" involving a minor violation that would not be subject to FDA legal action, or no violation at all (stock rotation, for example). Withdrawals don't appear in the Enforcement Report (7.50).
- **Stock recovery:** removal or correction of "a product that has not been marketed or that has not left the direct control of the firm": no part of the lot was released and it's still on the firm's premises. In the data model this is a lot moved to `on_hold` or `quarantined` with a nonconformance, not a recall.
- **Classes (7.3(m)):** Class I where "there is a reasonable probability" that use of or exposure to the product will cause serious adverse health consequences or death; Class II where it "may cause temporary or medically reversible adverse health consequences" or the probability of serious harm is remote; Class III where it "is not likely to cause adverse health consequences."
- **Consignee:** "anyone who received, purchased, or used the product being recalled." Direct accounts are the consignees the manufacturer shipped to; the rest are reached through them.

A recall can be initiated three ways: on the firm's own initiative, at FDA's request, or by FDA order under statutory authority (FDA's Recalls Background page). Most are the first; the second and third change who sets the strategy and how much latitude the firm has.

## FDA Recalls Under Part 7

### Telling FDA

A firm that removes or corrects a product because it believes it violative is asked to notify its FDA district office immediately, and if FDA treats the action as a recall, to provide (7.46(a)):

1. The identity of the product.
2. The reason for the removal or correction, and the date and circumstances of discovery.
3. An evaluation of the risk.
4. The total amount produced and the timespan of production.
5. The total amount estimated to be in distribution channels.
6. Distribution information, including the number of direct accounts and, where necessary, their identities.
7. A copy of the recall communication, or the proposed one.
8. The proposed recall strategy.
9. The name and telephone number of the firm official to contact.

Items 4 to 6 are queries: production quantity per lot from the confirmations that made it, the quantity shipped and to whom from the shipments that carried it, and the quantity still on hand from inventory. A system that can produce them in an hour is the difference between a recall that starts on the firm's terms and one that starts on FDA's. FDA reviews the information and advises the firm of the classification; the firm doesn't have to wait for it to start removing product.

### The Recall Strategy

The strategy is "a planned specific course of action" (7.3(l)) with three elements FDA reviews (7.42):

- **Depth:** how far down the chain the recall goes: the consumer or user level (including any intermediate wholesale and retail levels), the retail level, or the wholesale level.
- **Public warning:** whether one is needed, and whether general (news media) or specialized (trade press, or targeted to physicians or hospitals). It is "reserved for urgent situations where other means for preventing use of the recalled product appear inadequate," and FDA ordinarily issues it in consultation with the firm.
- **Effectiveness checks:** verification that every consignee at the recall's depth received the notice and acted. The levels: **A**, 100 percent of consignees contacted; **B**, more than 10 and less than 100 percent, set case by case; **C**, 10 percent; **D**, 2 percent; **E**, no effectiveness checks.

The level is a sampling instruction for the consignee list. Level C on a recall with 4,000 retail consignees is 400 checks, selected, assigned, performed and recorded with who did them and what they found, and a failed check (a store that still has product on the shelf, or never got the letter) is a follow-up notice and possibly a reason to raise the level. FDA reviews the strategy and recommends changes, but the firm "need not delay" the recall while it does.

### Recall Communications

The letter is a regulated document (7.49). It goes by "telegrams, mailgrams, or first class letters" conspicuously marked, with "urgent" on envelope and letter for Class I and II; phone calls and personal contacts are confirmed in writing or documented. It must "identify clearly the product, size, lot number(s), code(s) or serial number(s)," explain the reason and the hazard, give specific instructions, and "provide a ready means for the recipient" to report back, including whether it has any of the product. Follow-up communications go to those who don't respond, and each consignee is expected to carry out the instructions and, where needed, extend the recall to its own customers.

FDA's March 2022 guidance on initiating voluntary recalls asks firms to keep distribution records that "identify the direct accounts that received the recalled product by name, physical address where the product was delivered, and a contact telephone number," retained longer than the product's shelf life and expected use, and expects direct accounts that redistribute to keep records of their own accounts. Those are the columns a recall needs on `parties`, `facilities` and `shipments` long before there is a recall.

### Status Reports and Termination

FDA sets each recall's reporting interval by its urgency, "generally" every 2 to 4 weeks (7.53). A status report contains, unless inappropriate:

- Consignees notified, and the date and method of notification.
- Consignees responding, and the quantity on hand when they received the notice.
- Consignees that didn't respond (FDA may ask who).
- Products returned or corrected by each consignee contacted, and the quantity accounted for.
- The number and results of effectiveness checks.
- Estimated time frames for completion.

Every line is a count over the consignee table, which is why each consignee's response, quantities and check result are columns rather than notes. A recall is terminated when FDA determines that all reasonable efforts have been made and the product can reasonably be assumed removed and disposed of or corrected; the firm asks in writing, stating that the recall meets those criteria and attaching the latest status report and a description of the product's disposition, and the district office answers with a written termination notice (7.55).

### Ordered Recalls

For food other than infant formula, FDA can go further (21 U.S.C. 350l): where there is a reasonable probability that a food is adulterated or misbranded and that use of or exposure to it "will cause serious adverse health consequences or death," FDA first gives the responsible party the opportunity to cease distribution and recall voluntarily; if the party doesn't, FDA may order it to stop distribution and notify the parties concerned, with an informal hearing within 2 days of the order, after which FDA may require a recall with a timetable and progress reports. The system impact is a deadline and a timetable imposed from outside, kept as data on the recall rather than in an email.

### Devices: Corrections and Removals

Device manufacturers and importers have a separate reporting duty. A correction or removal initiated "to reduce a risk to health posed by the device," or to remedy a violation that may present a risk to health, is reported to FDA in writing "within 10-working days of initiating" it (806.10). The report carries a number built from the registrant's seven-digit registration number, the date, a sequence number and a "C" or "R" for correction or removal; the device's names and marketing status; the unique device identifier or other identification and the lot or serial numbers; the events and the actions taken or planned; illnesses or injuries with any medical device report numbers; quantities distributed and the affected lots; manufacture or distribution dates and expiration or expected life; and the "names, addresses, and phone numbers" of domestic and foreign consignees with dates and quantities shipped to each, plus copies of the communications. Information not yet available is explained with a date it will come. The UDI's production identifier is what makes device scope precise ([FSMA 204, DSCSA & UDI](/books/logistics/regulated-traceability#udi)).

### The Public Record

FDA publishes new recalls "according to its classification" in its weekly Enforcement Report, with whether each was FDA-requested or firm-initiated and the action being taken (7.50). The same data, from FDA's Recall Enterprise System, is in openFDA's enforcement endpoints, updated weekly with records from 2004 onward; as of its November 11, 2026 update the food endpoint held 29,609 records. A record carries `recall_number` (for example "F-0276-2017"), `event_id`, `classification`, `status`, `voluntary_mandated` ("Voluntary: Firm initiated"), `initial_firm_notification` ("Letter"), `distribution_pattern`, `product_quantity`, `code_info` (the UPCs, lot numbers and expiry dates in scope, as free text), `reason_for_recall`, `recall_initiation_date`, `center_classification_date`, `report_date` and `termination_date`. One event can hold several recall numbers, one per product. Mirroring those identifiers on the recall record lets a manufacturer reconcile its own records with what FDA published, and a distributor match published recalls against its inventory.

## FSIS: Meat and Poultry

An official establishment must notify the local FSIS District Office "within 24 hours" of learning or determining that adulterated or misbranded meat or poultry product it received or produced has entered commerce, if it believes or has reason to believe that happened, stating "the type, amount, origin, and destination" of the product (9 CFR 418.2). Every establishment must also keep written recall procedures that "specify how the official establishment will decide whether to conduct a product recall" and how it will carry one out (418.3). FSIS has no general recall order authority in these sections; its leverage is detention, since an authorized representative who has reason to believe product is adulterated or misbranded may detain it "for a period not to exceed twenty days," during which it can't be moved (21 U.S.C. 672), and inspection itself.

FSIS classifies recalls and runs its own effectiveness checks under FSIS Directive 8080.1; FSIS's website refused this tool's requests, so the class definitions and the directive's current revision aren't quoted here. <!-- source-gap: logistics-manufacturing-recalls-fsis-classes | missing | FSIS recall class definitions, public health alerts and effectiveness check procedures under FSIS Directive 8080.1, current revision | closes with: the text of FSIS Directive 8080.1 from fsis.usda.gov or a mirror | checked: 2026-11-22 --> For the data model the shape is FDA's: a classified recall, a list of consignees with quantities, and verification that they acted. The 24-hour clock is the tightest of the three regimes, and it is a clock on "type, amount, origin, and destination," which is a genealogy and shipment query that must run in hours on a weekend.

## NHTSA: Defect Reports and Owner Notices

A vehicle or equipment manufacturer that "learns the vehicle or equipment contains a defect and decides in good faith that the defect is related to motor vehicle safety," or that it doesn't comply with a safety standard, must notify NHTSA and owners, purchasers and dealers (49 U.S.C. 30118(c)); NHTSA can also decide a defect exists after giving the manufacturer a chance to respond, and order notice and remedy (30118(b)).

### The Part 573 Report

The report is due "not more than 5 working days after" the determination (573.6(b)), submitted on NHTSA's website using its templates (573.9). Its contents (573.6(c)) are a data model in themselves:

- **Manufacturer:** the fabricating manufacturer, any brand or trademark owner, and the designated agent for an imported product.
- **Population:** the affected vehicles by make, line, model year and production dates (or the equipment's equivalent), how the manufacturer determined the population, the total, and the number in each group.
- **Estimated percentage** that actually contain the defect.
- **Description:** a summary, the detail, and the safety risk.
- **Chronology** of the events that led to the determination, or the test results behind a noncompliance.
- **Remedy program,** including any plan to reimburse owners who paid for a repair before the recall.
- **Schedule** for notifying owners, dealers and distributors, and copies of every communication sent to more than one party.
- **The manufacturer's campaign number,** when it differs from NHTSA's.

Not everything is known on day five; the rest is due within 5 working days after the manufacturer confirms it, and changes to the identification, population or notification details are amended within 5 working days of new information. A Part 573 report is therefore a versioned document: each amendment is a new filing linked to the recall, with the population as it stood then. NHTSA assigns the campaign number, the identifier in its public API (format like "19V182000"), alongside the component, summary, consequence, remedy and flags such as `parkIt`, `parkOutSide` and `overTheAirUpdate`.

Component suppliers have their own route: 573.6 has provisions for an equipment manufacturer whose component went into other manufacturers' vehicles, which is the case where the supplier knows its part and lots, and its customers know which VINs got them. That handoff is a genealogy query across companies: the supplier's lots in scope, mapped by its customer to VINs through the installed-component records of [Lot & Serial Traceability](/books/logistics/lot-traceability#how-to-build-it).

Beyond recalls, Part 579 (early warning reporting) requires periodic information "that may help identify defects," including foreign recalls and campaigns and copies of defect communications (579.1); the same claims, warranty and field data that feed a defect investigation feed those reports.

### Owner and Dealer Notices

Owners are notified "no later than 60 days from the date the manufacturer files" the Part 573 report, by first-class mail to each owner registered under state law where reasonably ascertainable, or to the most recent purchaser known to the manufacturer; if the remedy isn't available yet, a second notice follows when it is (577.7(a)). Dealers and distributors get notice within three business days of filing where the defect presents an immediate and substantial threat (five if not sent electronically), otherwise on the schedule in the 573 report (577.7(c)). The owner letter's form is prescribed (577.5): "SAFETY RECALL NOTICE" on the envelope, "IMPORTANT SAFETY RECALL" at the top of the letter with the VIN beneath it, a statement that it is sent under the National Traffic and Motor Vehicle Safety Act, the decision, a description of the defect and the precautions to take, the risk, and the remedy (when, what work, how long), with English and Spanish versions for owners in Puerto Rico; draft letters go to NHTSA for review first.

Owner names and addresses come from state registration data, which makes the owner list personal data on a large scale. A manufacturer must keep a list of owners or most recent purchasers, with each VIN and its remedy status, "for 5 years" from the first report (573.8(a)); tire manufacturers keep first purchasers for 3 years.

### Remedy and Quarterly Reports

The manufacturer chooses the remedy: repair, replacement with an identical or reasonably equivalent vehicle, or refund of the price less reasonable depreciation (30120(a)). The free remedy doesn't apply to vehicles or equipment bought by the first purchaser "more than 15 calendar years" before notice, or tires "more than 5 calendar years" before (30120(g)). A dealer may sell or lease a new vehicle in scope only once it's remedied (30120(i)), which is the dealer's problem Commerce covers, and the manufacturer's reason to publish the VIN list promptly.

Quarterly reports run "for each of six consecutive quarters" from the quarter the campaign began, due April 30, July 30, October 30 and January 30, moved to the next business day when the date falls on a weekend or holiday (573.7). Each reports the campaign number, the notification start and completion dates, the total in the campaign, cumulative counts inspected and repaired and inspected and found not to need repair, and units unreachable by reason (exported, stolen, scrapped, no notice received). Those counts are a status per VIN, never a number typed into a form.

## Scoping a Recall

Scope is the set of lots or units in the recall, and it is computed, not chosen:

- **Forward from a bad input.** A supplier's lot of an ingredient or component is the start; the where-used trace in [Lot & Serial Traceability](/books/logistics/lot-traceability#one-up-one-down) walks `lot_consumptions` from that input lot to every lot made from it, through intermediates and rework, to finished lots. The answer is as good as the consumption records: a backflushed work order that assumed the BOM's lot rather than recording the one issued makes the scope wider, because the honest answer becomes every lot that could have been used in that window.
- **Across a production window.** A process failure (a miscalibrated sealer, a mislabeled run) is scoped by line, time and the lots or serials made then, which is why production confirmations carry occurred-at times and output lots.
- **By serial and VIN.** NHTSA populations are VINs or production date ranges, and a device recall can be a serial range. The installed-component records (child serial into parent serial) turn a supplier's bad lot into the vehicles that carry it.
- **Then out the door.** Each lot in scope joins to `shipment_lines.lot_id` and its shipments to give consignees, quantities and ship dates; shipments still in transit are stopped, and stock on hand at the firm's own facilities and its 3PLs is put on hold (`lots.status` 'on_hold', then 'recalled').

Two rules keep scope defensible. **Snapshot it:** the trace that set the scope is stored with when it ran and what it found, because the genealogy changes as late consumption records arrive, and a regulator asking in month three why lot 2611-B wasn't included needs the answer as of day one. **Widen deliberately, narrow with evidence:** adding a lot is cheap; removing one needs a documented reason (test results, a corrected consumption record) linked to the change. For food, FDA's 24-hour sortable spreadsheet request is the same query run outward, covered in [FSMA 204, DSCSA & UDI](/books/logistics/regulated-traceability#fsma-204-food-traceability).

## Mock Recalls

A mock recall is a drill: pick a lot (an incoming ingredient or a finished lot), trace it forward and backward, identify every consignee and the quantity each received, account for the whole quantity produced, and time it. FDA's guidance suggests that a firm anticipating complex recalls consider "mock recalls, to verify the firm's recall readiness," and that it establish metrics for its recall plan and improve procedures or training "if it is not satisfied with the results of a mock or actual recall." Food safety certification schemes benchmarked by GFSI commonly require such a test at a set frequency; I haven't opened those scheme documents, so the frequency and pass criteria aren't stated here. <!-- source-gap: logistics-manufacturing-recalls-gfsi-mock | missing | GFSI-benchmarked schemes (SQF, BRCGS, FSSC 22000) require mock recall or traceability tests at a set frequency with stated time and reconciliation criteria | closes with: the scheme clause text from the SQF Code, BRCGS Food Safety Standard or FSSC 22000 requirements | checked: 2026-11-22 -->

The measures worth recording on every drill:

- **Time to trace:** from the start of the exercise to a complete list of lots and consignees.
- **Percent accounted:** quantity located (shipped to named consignees, on hand, scrapped, consumed in further production) over quantity produced. A trace that ends at 97 percent has lost 3 percent of a lot somewhere, usually in an unrecorded rework, a sample, or a pallet shipped under a wrong lot code.
- **Contact verification:** whether each consignee's recall contact was current when tested.
- **Findings and their corrective actions,** as CAPAs in the quality system, so a failed drill produces a change rather than a report.

## How to Build It

Six tables: the recall, its scope, its consignees and the shipments that reached them, the per-unit statuses NHTSA campaigns need, the reports filed, and the drills. They reference `lots`, `shipments`, `shipment_lines`, `parties`, `facilities` and `documents` from the core, `serialized_units` from [Lot & Serial Traceability](/books/logistics/lot-traceability#how-to-build-it), and `nonconformances` and `corrective_actions` from [Quality Systems](/books/logistics/quality-management#how-to-build-it).

```sql
-- One recall, correction or removal, as the recalling firm runs it.
CREATE TABLE recalls (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  recalling_party_id     UUID NOT NULL REFERENCES parties (id),
  regulator              TEXT NOT NULL CHECK (regulator IN ('fda', 'fsis', 'nhtsa', 'cpsc',
                           'other')),
  product_type           TEXT NOT NULL CHECK (product_type IN ('food', 'animal_food', 'drug',
                           'biologic', 'device', 'cosmetic', 'meat_poultry', 'vehicle',
                           'equipment', 'tire', 'child_seat', 'consumer_product')),
  kind                   TEXT NOT NULL CHECK (kind IN ('recall', 'correction', 'removal',
                           'market_withdrawal', 'safety_recall')),
  initiation             TEXT NOT NULL CHECK (initiation IN ('firm_initiated',
                           'agency_requested', 'agency_ordered')),
  regulator_event_ref    TEXT,          -- FDA event ID, NHTSA campaign number, FSIS recall number
  regulator_recall_refs  TEXT[] NOT NULL DEFAULT '{}',  -- FDA recall numbers, one per product
  firm_campaign_ref      TEXT,          -- the manufacturer's own campaign number
  device_report_number   TEXT,          -- 806.10: registration number, date, sequence, C or R
  classification         TEXT CHECK (classification IN ('class_i', 'class_ii', 'class_iii')),
  classified_at          TIMESTAMPTZ,
  nonconformance_id      UUID REFERENCES nonconformances (id),  -- the finding that started it
  reason                 TEXT NOT NULL,
  hazard                 TEXT,
  determined_at          TIMESTAMPTZ,   -- the decision the clocks run from, with its evidence
  determination_doc_id   UUID REFERENCES documents (id),
  regulator_notice_due_at TIMESTAMPTZ,  -- computed: 24 hours, 5 or 10 working days
  regulator_notified_at  TIMESTAMPTZ,
  owner_notice_due_on    DATE,          -- NHTSA: 60 days after the 573 report is filed
  depth                  TEXT CHECK (depth IN ('consumer', 'retail', 'wholesale')),
  public_warning         TEXT CHECK (public_warning IN ('none', 'general', 'specialized')),
  effectiveness_level    CHAR(1) CHECK (effectiveness_level IN ('A', 'B', 'C', 'D', 'E')),
  effectiveness_pct      NUMERIC(5, 2) CHECK (effectiveness_pct BETWEEN 0 AND 100),  -- level B
  remedy                 TEXT CHECK (remedy IN ('return', 'destroy', 'relabel', 'repair',
                           'replace', 'refund', 'correct_in_place')),
  status                 TEXT NOT NULL CHECK (status IN ('evaluating', 'ongoing', 'completed',
                           'terminated', 'cancelled')),
  started_at             TIMESTAMPTZ,
  terminated_at          TIMESTAMPTZ,
  termination_doc_id     UUID REFERENCES documents (id),  -- the regulator's written notice
  CHECK (effectiveness_level IS DISTINCT FROM 'B' OR effectiveness_pct > 10),
  CHECK (status <> 'terminated' OR terminated_at IS NOT NULL)
);
CREATE INDEX ON recalls (regulator, regulator_event_ref);

-- What is in scope, how it got there, and when it left. Rows are the trace's snapshot.
CREATE TABLE recall_scope_lots (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  recall_id          UUID NOT NULL REFERENCES recalls (id),
  lot_id             UUID REFERENCES lots (id),
  serialized_unit_id UUID REFERENCES serialized_units (id),  -- a serial or VIN in scope
  basis              TEXT NOT NULL CHECK (basis IN ('direct', 'forward_trace',
                       'production_window', 'supplier_notice', 'precaution')),
  source_lot_id      UUID REFERENCES lots (id),  -- the input lot the trace started from
  trace_depth        SMALLINT CHECK (trace_depth >= 0),  -- 0: the source lot itself
  quantity_produced  NUMERIC(14, 3),
  uom                TEXT,
  traced_at          TIMESTAMPTZ NOT NULL,       -- when the query that added it ran
  trace_version      TEXT NOT NULL,              -- the genealogy query and data cutoff used
  removed_at         TIMESTAMPTZ,                -- scope narrows only with evidence
  removal_doc_id     UUID REFERENCES documents (id),
  CHECK (num_nonnulls(lot_id, serialized_unit_id) = 1),
  CHECK (removed_at IS NULL OR removal_doc_id IS NOT NULL)
);
CREATE UNIQUE INDEX ON recall_scope_lots (recall_id, lot_id) WHERE lot_id IS NOT NULL;
CREATE UNIQUE INDEX ON recall_scope_lots (recall_id, serialized_unit_id)
  WHERE serialized_unit_id IS NOT NULL;

-- Each consignee notified, what it said it had, and what the check found.
CREATE TABLE recall_consignees (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  recall_id             UUID NOT NULL REFERENCES recalls (id),
  consignee_party_id    UUID NOT NULL REFERENCES parties (id),
  facility_id           UUID REFERENCES facilities (id),  -- where it was delivered, per 7.59
  notified_by_id        UUID REFERENCES recall_consignees (id),  -- null: a direct account
  shipped_quantity      NUMERIC(14, 3) NOT NULL DEFAULT 0,
  uom                   TEXT NOT NULL,
  notice_method         TEXT CHECK (notice_method IN ('first_class_mail', 'letter', 'email',
                          'phone', 'fax', 'edi', 'portal', 'in_person')),
  notice_document_id    UUID REFERENCES documents (id),
  notified_at           TIMESTAMPTZ,
  follow_ups            SMALLINT NOT NULL DEFAULT 0,
  last_follow_up_at     TIMESTAMPTZ,
  responded_at          TIMESTAMPTZ,
  quantity_on_hand      NUMERIC(14, 3),   -- when the notice arrived, as reported
  quantity_returned     NUMERIC(14, 3) NOT NULL DEFAULT 0,
  quantity_destroyed    NUMERIC(14, 3) NOT NULL DEFAULT 0,
  quantity_corrected    NUMERIC(14, 3) NOT NULL DEFAULT 0,
  extended_to_customers BOOLEAN,          -- 7.49(d): it notified its own consignees
  check_selected        BOOLEAN NOT NULL DEFAULT FALSE,  -- drawn for the effectiveness level
  check_result          TEXT CHECK (check_result IN ('verified', 'not_received',
                          'not_actioned', 'unreachable')),
  checked_at            TIMESTAMPTZ,
  checked_by            TEXT,
  UNIQUE NULLS NOT DISTINCT (recall_id, consignee_party_id, facility_id),
  CHECK (check_result IS NULL OR checked_at IS NOT NULL)
);

-- The shipments that put product in scope at each consignee.
CREATE TABLE recall_consignee_shipments (
  recall_consignee_id UUID NOT NULL REFERENCES recall_consignees (id),
  shipment_line_id    UUID NOT NULL REFERENCES shipment_lines (id),
  shipment_id         UUID NOT NULL REFERENCES shipments (id),
  lot_id              UUID REFERENCES lots (id),
  quantity            NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (recall_consignee_id, shipment_line_id)
);

-- NHTSA campaigns: one row per VIN or serial, for 573.7 counts and the 573.8 owner list.
CREATE TABLE recall_unit_statuses (
  recall_id          UUID NOT NULL REFERENCES recalls (id),
  serialized_unit_id UUID NOT NULL REFERENCES serialized_units (id),
  owner_ref          TEXT,                -- vault reference to the owner's name and address
  owner_source       TEXT CHECK (owner_source IN ('state_registration', 'purchaser_record',
                       'lessor')),
  first_notice_at    TIMESTAMPTZ,
  remedy_notice_at   TIMESTAMPTZ,         -- the second notice when the remedy became available
  status             TEXT NOT NULL CHECK (status IN ('open', 'repaired', 'not_needing_repair',
                       'unreachable_exported', 'unreachable_stolen', 'unreachable_scrapped',
                       'unreachable_no_notice', 'unreachable_other')),
  status_at          TIMESTAMPTZ NOT NULL,
  retain_until       DATE NOT NULL,       -- 573.8: 5 years from the first report
  PRIMARY KEY (recall_id, serialized_unit_id)
);

-- Every report filed with a regulator, with the counts as filed.
CREATE TABLE recall_status_reports (
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  recall_id                UUID NOT NULL REFERENCES recalls (id),
  kind                     TEXT NOT NULL CHECK (kind IN ('fda_initial', 'fda_status',
                             'device_806', 'fsis_notification', 'part_573_initial',
                             'part_573_amendment', 'nhtsa_quarterly', 'termination_request')),
  period                   DATERANGE,       -- the quarter or reporting interval covered
  due_on                   DATE,
  submitted_at             TIMESTAMPTZ,
  consignees_notified      INT,
  consignees_responded     INT,
  consignees_not_responded INT,
  quantity_accounted       NUMERIC(14, 3),
  effectiveness_checks     INT,
  units_total              INT,             -- NHTSA quarterly counts
  units_repaired           INT,
  units_not_needing_repair INT,
  units_unreachable        JSONB,           -- by reason, as 573.7(b) itemizes
  document_id              UUID REFERENCES documents (id),  -- the report as submitted
  regulator_ack_ref        TEXT
);
CREATE INDEX ON recall_status_reports (recall_id, kind, due_on);

-- A recall drill and its measures.
CREATE TABLE mock_recalls (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  facility_id           UUID NOT NULL REFERENCES facilities (id),
  start_lot_id          UUID NOT NULL REFERENCES lots (id),
  direction             TEXT NOT NULL CHECK (direction IN ('forward', 'backward', 'both')),
  started_at            TIMESTAMPTZ NOT NULL,
  traced_at             TIMESTAMPTZ,      -- complete list of lots and consignees in hand
  lots_identified       INT,
  consignees_identified INT,
  quantity_produced     NUMERIC(14, 3),
  quantity_accounted    NUMERIC(14, 3),
  uom                   TEXT,
  contacts_verified     INT,
  contacts_stale        INT,
  target_minutes        INT,              -- the firm's own target, from its recall plan
  result                TEXT CHECK (result IN ('pass', 'fail')),
  corrective_action_id  UUID REFERENCES corrective_actions (id),
  report_document_id    UUID REFERENCES documents (id),
  CHECK (traced_at IS NULL OR traced_at >= started_at)
);

-- Recall paper joins the document kinds: drop and re-add the check, unvalidated, then validate.
ALTER TABLE documents
  DROP CONSTRAINT documents_kind_check,
  ADD CONSTRAINT documents_kind_check CHECK (kind IN ('bill_of_lading', 'rate_confirmation',
    'proof_of_delivery', 'delivery_receipt', 'lumper_receipt', 'freight_invoice',
    'ocean_bill_of_lading', 'sea_waybill', 'air_waybill', 'arrival_notice',
    'commercial_invoice', 'packing_list', 'customs_entry', 'notice_of_assignment',
    'certificate_of_insurance', 'load_tender', 'tender_response', 'status_message',
    'ship_notice', 'power_of_attorney', 'customs_bond', 'bond_insufficiency_notice',
    'client_error_notice', 'planning_schedule', 'shipping_schedule', 'production_sequence',
    'application_advice', 'certificate_of_analysis', 'certificate_of_conformance',
    'ppap_submission', 'corrective_action_report', 'epcis_document', 'recall_notice',
    'recall_report', 'mock_recall_report', 'other')) NOT VALID;
ALTER TABLE documents VALIDATE CONSTRAINT documents_kind_check;

-- Distribution records must answer by lot in minutes.
CREATE INDEX CONCURRENTLY IF NOT EXISTS shipment_lines_lot_id_idx ON shipment_lines (lot_id);
```

Scope is written from the where-used trace. The sketch assumes the `lot_consumptions` columns of [Lot & Serial Traceability](/books/logistics/lot-traceability#how-to-build-it) (an input lot consumed into an output lot), and stores what it found with the time and the trace version:

```sql
WITH RECURSIVE where_used AS (
  SELECT $2::uuid AS lot_id, 0 AS depth
  UNION
  SELECT c.output_lot_id, w.depth + 1
  FROM lot_consumptions c
  JOIN where_used w ON c.input_lot_id = w.lot_id
  WHERE w.depth < 20                           -- a guard; real genealogies are shallow
)
INSERT INTO recall_scope_lots (recall_id, lot_id, basis, source_lot_id, trace_depth,
                               traced_at, trace_version)
SELECT $1, lot_id, CASE WHEN min(depth) = 0 THEN 'direct' ELSE 'forward_trace' END,
       $2, min(depth), now(), $3
FROM where_used
GROUP BY lot_id
ON CONFLICT DO NOTHING;
```

Consignees then come from the shipments of every lot in scope, with what each received:

```sql
INSERT INTO recall_consignees (recall_id, consignee_party_id, facility_id, shipped_quantity, uom)
SELECT r.recall_id, s.consignee_party_id, s.destination_facility_id, sum(sl.quantity), sl.uom
FROM recall_scope_lots r
JOIN shipment_lines sl ON sl.lot_id = r.lot_id
JOIN shipments s ON s.id = sl.shipment_id
WHERE r.recall_id = $1 AND r.removed_at IS NULL
  AND s.status NOT IN ('draft', 'planned', 'cancelled')
GROUP BY r.recall_id, s.consignee_party_id, s.destination_facility_id, sl.uom
ON CONFLICT (recall_id, consignee_party_id, facility_id) DO UPDATE
  SET shipped_quantity = EXCLUDED.shipped_quantity;
```

An FDA status report's counts are then one query over `recall_consignees` at submission, stored on the report row as filed. NHTSA's clocks are computed when the determination is recorded and stored on the recall ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)); holidays come from a table, because "working days" and the quarterly roll-forward both skip federal holidays:

```go tab="Go"
package recalls

import "time"

// Holidays holds federal holidays as "2006-01-02" dates, loaded from a table.
type Holidays map[string]bool

func civil(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
}

func (h Holidays) businessDay(d time.Time) bool {
	wd := d.Weekday()
	return wd != time.Saturday && wd != time.Sunday && !h[d.Format("2006-01-02")]
}

// AddWorkingDays counts n working days after start, skipping weekends and holidays.
func (h Holidays) AddWorkingDays(start time.Time, n int) time.Time {
	d := civil(start)
	for n > 0 {
		d = d.AddDate(0, 0, 1)
		if h.businessDay(d) {
			n--
		}
	}
	return d
}

// NextBusinessDay returns d, or the first business day after it.
func (h Holidays) NextBusinessDay(d time.Time) time.Time {
	d = civil(d)
	for !h.businessDay(d) {
		d = d.AddDate(0, 0, 1)
	}
	return d
}

type Clocks struct {
	Part573Due     time.Time   // 573.6(b): 5 working days after the determination
	OwnerNoticeDue time.Time   // 577.7(a)(1): 60 days after the 573 report is filed
	QuarterlyDue   []time.Time // 573.7: six consecutive quarters
}

// NHTSAClocks computes a campaign's deadlines. filed is zero until the 573 report is in.
func (h Holidays) NHTSAClocks(determined, filed, campaignStart time.Time) Clocks {
	c := Clocks{Part573Due: h.AddWorkingDays(determined, 5)}
	if !filed.IsZero() {
		c.OwnerNoticeDue = civil(filed).AddDate(0, 0, 60)
	}
	y, m := campaignStart.Year(), (int(campaignStart.Month())-1)/3*3+1 // the quarter's first month
	for i := 0; i < 6; i++ {
		// The 30th of the month after the quarter ends; time.Date normalizes month 13 to January.
		due := time.Date(y, time.Month(m+3), 30, 0, 0, 0, 0, time.UTC)
		c.QuarterlyDue = append(c.QuarterlyDue, h.NextBusinessDay(due))
		m += 3
	}
	return c
}
```

```rust tab="Rust"
use chrono::{Datelike, Duration, NaiveDate, Weekday};
use std::collections::HashSet;

/// Federal holidays, loaded from a table.
pub struct Holidays(pub HashSet<NaiveDate>);

pub struct Clocks {
    pub part_573_due: NaiveDate,              // 573.6(b): 5 working days after the determination
    pub owner_notice_due: Option<NaiveDate>,  // 577.7(a)(1): 60 days after the 573 report is filed
    pub quarterly_due: Vec<NaiveDate>,        // 573.7: six consecutive quarters
}

impl Holidays {
    fn business_day(&self, d: NaiveDate) -> bool {
        !matches!(d.weekday(), Weekday::Sat | Weekday::Sun) && !self.0.contains(&d)
    }

    /// Counts n working days after start, skipping weekends and holidays.
    pub fn add_working_days(&self, start: NaiveDate, mut n: u32) -> NaiveDate {
        let mut d = start;
        while n > 0 {
            d += Duration::days(1);
            if self.business_day(d) {
                n -= 1;
            }
        }
        d
    }

    /// Returns d, or the first business day after it.
    pub fn next_business_day(&self, mut d: NaiveDate) -> NaiveDate {
        while !self.business_day(d) {
            d += Duration::days(1);
        }
        d
    }

    /// Computes a campaign's deadlines. `filed` is None until the 573 report is in.
    pub fn nhtsa_clocks(&self, determined: NaiveDate, filed: Option<NaiveDate>,
                        campaign_start: NaiveDate) -> Clocks {
        let next_quarter = |y: i32, m: u32| if m + 3 > 12 { (y + 1, m + 3 - 12) } else { (y, m + 3) };
        let (mut y, mut m) = (campaign_start.year(), campaign_start.month0() / 3 * 3 + 1);
        let mut quarterly_due = Vec::with_capacity(6);
        for _ in 0..6 {
            // The 30th of the month after the quarter ends: April, July, October or January.
            let (dy, dm) = next_quarter(y, m);
            let due = NaiveDate::from_ymd_opt(dy, dm, 30).expect("every due month has a 30th");
            quarterly_due.push(self.next_business_day(due));
            (y, m) = (dy, dm);
        }
        Clocks {
            part_573_due: self.add_working_days(determined, 5),
            owner_notice_due: filed.map(|f| f + Duration::days(60)),
            quarterly_due,
        }
    }
}
```

Design notes:

- **The determination is an event with evidence.** `determined_at` and its document are what every clock runs from; a later argument about whether the firm knew earlier is answered by the record of the investigation (the nonconformance, the test results, the engineering review) linked to it, not by memory.
- **Scope rows are a snapshot, never a live view.** `traced_at` and `trace_version` say which genealogy answered; rerunning the trace adds rows, and removing one needs a document. The count reported to a regulator on day one stays reproducible ([Snapshots](/docs/database/temporal-data#snapshots)).
- **Consignees are a tree.** A distributor's own customers, reported back to the manufacturer, are consignees with `notified_by_id` pointing at the distributor, so depth (wholesale, retail, consumer) is visible in the data and effectiveness checks can sample at the right level.
- **Counts are computed and then frozen.** Status reports and quarterly reports store the numbers as filed beside the document, and a later correction is a new report, because the regulator holds the old one.
- **Owners are personal data.** VIN owner lists come from state registration data under contract; the unit status table holds a vault reference, and the list is kept 5 years and then purged on schedule ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)).
- **The recall is a workflow with timers.** Evaluating, notified, ongoing, completed, terminated, each transition recorded, with follow-up notices to non-responders and report due dates as scheduled steps ([Timers, Deadlines and Escalations](/docs/building-blocks/workflows#timers-deadlines-and-escalations)).
- **Emit recall events.** `recall.opened`, `recall.scope_changed`, `recall.consignee_notified`, `recall.report_due` and `recall.terminated` feed the WMS (holds), the TMS (stop in-transit shipments), customer service and quality ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

The records map onto Commerce's [recall tables](/books/commerce/product-safety-and-recalls#recalls) where a manufacturer also sells direct: a Commerce `recalls` row is this chapter's `recalls` seen from the merchant, its `recall_items` are the items and lots of `recall_scope_lots`, and its `recall_notifications` to buyers are the consumer-level consignees here.

## Auditing

- **The determination and its timeline:** when the firm learned, when it decided, what it relied on, when it notified each regulator, and every computed deadline beside the actual filing time.
- **Every scope change:** the trace that added each lot or unit, with its version and time, and the evidence behind every removal.
- **Every consignee:** notice sent (method, document, time), follow-ups, response, quantities on hand, returned, destroyed or corrected, sub-recall extension, and each effectiveness check with who performed it.
- **Every report as filed:** initial notices, 806 reports, Part 573 reports and amendments, status and quarterly reports, termination requests and the regulator's acknowledgments, each with its counts and document hash.
- **Disposition of recalled product:** returned stock received against the consignee row, its destruction or rework witnessed and documented, never returned to saleable stock.
- **The recall plan and the drills:** the current written plan with its version, every mock recall with its measures and the CAPA it produced.
- **Owner lists:** VINs with remedy status and the source of owner data, kept 5 years under 573.8.

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Record the determination as an event** and compute every regulator's clock from it: 24 hours for FSIS, 5 working days for a Part 573 report, 10 working days for a device correction or removal, 60 days to owners.
- **Compute scope from genealogy, snapshot it, and narrow it only with evidence,** so the population declared on day one is reproducible in month six.
- **Keep distribution records good enough to recall from:** consignee name, physical delivery address and phone on every shipment, by lot, retained past shelf life.
- **Model consignees as a tree with quantities,** so depth, sub-recalls, effectiveness check sampling and status report counts all come from the same rows.
- **Track NHTSA campaigns per VIN or serial,** with remedy status and unreachable reasons, because the quarterly report is a count over them.
- **Store every report as filed,** with its counts and the document, and correct by filing again.
- **Put recalled stock on hold everywhere at once** (plants, 3PLs, in-transit loads) from the scope list, and never release it back to saleable inventory.
- **Run mock recalls and keep their measures:** time to trace, percent accounted, stale contacts, and the corrective action each failure produced.

## References

**Statutes and regulations**

- [21 CFR 7.3 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/7.3), recall, correction, market withdrawal, stock recovery, recall strategy, consignee and the three classes
- [21 CFR 7.42 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/7.42), recall depth, public warnings, effectiveness check levels A to E and FDA review of the strategy
- [21 CFR 7.46 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/7.46), immediate notice to the district office and the nine items a firm-initiated recall provides
- [21 CFR 7.49 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/7.49), recall communication methods, contents, follow-ups and consignees' duties
- [21 CFR 7.50 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/7.50), the weekly Enforcement Report and what it excludes
- [21 CFR 7.53 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/7.53), status report intervals and contents
- [21 CFR 7.55 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/7.55), termination criteria and the written request
- [21 CFR 7.59 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/7.59), contingency plans, product coding and distribution records
- [21 CFR 806.10 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/806.10), device corrections and removals, the 10-working-day report, its number and contents
- [21 CFR 117.139 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/117.139), the written recall plan for food with a hazard requiring a preventive control
- [21 U.S.C. 350l (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/350l), FDA's mandatory food recall authority and the 2-day informal hearing
- [9 CFR 418.2 (Cornell LII)](https://www.law.cornell.edu/cfr/text/9/418.2), 24-hour notice to the FSIS District Office and its contents
- [9 CFR 418.3 (Cornell LII)](https://www.law.cornell.edu/cfr/text/9/418.3), written recall procedures for official establishments
- [21 U.S.C. 672 (Cornell LII)](https://www.law.cornell.edu/uscode/text/21/672), detention of meat for up to twenty days
- [49 U.S.C. 30118 (Cornell LII)](https://www.law.cornell.edu/uscode/text/49/30118), the manufacturer's duty to notify and NHTSA-ordered recalls
- [49 U.S.C. 30120 (Cornell LII)](https://www.law.cornell.edu/uscode/text/49/30120), remedy options, the 15-year and 5-year limits and the dealer sale rule
- [49 CFR 573.6 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/573.6), the 5-working-day report, its contents, supplier provisions and amendments
- [49 CFR 573.7 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/573.7), quarterly report dates, six quarters and the counts
- [49 CFR 573.8 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/573.8), owner and purchaser lists and their 5-year and 3-year retention
- [49 CFR 573.9 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/573.9), submission on NHTSA's web page using its templates
- [49 CFR 577.5 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/577.5), the owner letter's envelope, heading, statements and remedy content
- [49 CFR 577.7 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/577.7), owner notice within 60 days, the second notice and dealer notice timing
- [49 CFR 579.1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/49/579.1), the scope of early warning and foreign campaign reporting

**FDA and NHTSA**

- [FDA: Recalls Background and Definitions](https://www.fda.gov/safety/industry-guidance-recalls/recalls-background-and-definitions), the three ways a recall is initiated, the classes and market withdrawals
- [FDA: Initiation of Voluntary Recalls Under 21 CFR Part 7, Subpart C (March 2022)](https://www.fda.gov/media/123664/download), mock recalls, recall plan metrics and distribution records by name, delivery address and phone
- [openFDA: Food enforcement reports](https://open.fda.gov/apis/food/enforcement/), the Recall Enterprise System source, weekly updates, coverage from 2004 and recall status
- [openFDA: Food enforcement endpoint](https://api.fda.gov/food/enforcement.json?limit=1), the record fields, the November 11, 2026 update and the record count
- [NHTSA: Recalls API by vehicle](https://api.nhtsa.gov/recalls/recallsByVehicle?make=acura&model=rdx&modelYear=2012), campaign number format and record fields
