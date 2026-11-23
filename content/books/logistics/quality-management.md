+++
title = "Quality Systems"
description = "The plant's quality records: ISO 9001, IATF 16949, AS9100 and the FDA's QMSR, inspection and lot release, nonconformance and MRB, CAPA and 8D, and PPAP."
category = "Logistics & Supply Chain Industry"
order = 2861
part = "Manufacturing"
tags = ["logistics", "manufacturing", "quality", "qmsr", "iatf-16949", "capa", "ppap", "data-model"]
+++

A quality system is the set of rules a manufacturer follows to make sure what it ships is what it promised, and the records that prove it did. A resin lot arrives at a molding plant and waits in quarantine until a sample passes its melt-flow test; a machined bracket is measured on three dimensions every hundred parts; a batch of catheters isn't released until its sterilization records are reviewed and signed; a customer's complaint about cracked housings opens a nonconformance, a containment of every housing in the building and on the water, and a corrective action that has to find why. The certificates on the wall (ISO 9001, IATF 16949 for automotive, AS9100 for aerospace, ISO 13485 for medical devices, now incorporated into FDA's device regulation) say the plant has such a system; the records say whether it works.

It is hard for software because quality decisions sit on top of every other record and override them. A lot that MRP counts as available is on hold; a receipt the WMS put away is rejected and goes back on a return shipment the supplier pays for; a work order reported finished produced 40 units that the material review board decides to use as is, under a deviation the customer signed. Each decision has a person, a time, a reason and often a signature, and an auditor, a customer or FDA will ask for them years later. And the vocabulary differs by industry and by vendor: Dynamics 365's quality order and Odoo's quality check are the same idea; a supplier corrective action request, an 8D and a CAPA are cousins with different owners and clocks.

This chapter covers the standards and what each adds, inspection and lot release, nonconformance and its disposition, corrective action (CAPA and 8D), supplier quality and PPAP, and the electronic records rules for regulated plants. It extends `lots`, `items` and `parties` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), and uses the work orders and confirmations of [MRP, Scheduling & Work Orders](/books/logistics/production-planning#work-orders) and the item revisions of [BOMs, PLM & Engineering Change](/books/logistics/boms-and-engineering-change#versions-and-effectivity). Which input lots went into which output lots, and how to trace them, is [Lot & Serial Traceability](/books/logistics/lot-traceability); what happens when a defect has already shipped is [Recalls From the Manufacturer's Side](/books/logistics/manufacturing-recalls).

## How the Platforms Do It

Quality lives in three kinds of system: the ERP's quality module (inspection at receipt and in production, holds on stock), a dedicated quality management system (QMS) for nonconformances, CAPA, audits, documents and training, and the MES or a statistical process control (SPC) tool on the line. As of November 2026, from each vendor's documentation:

| Platform | Inspection object | Nonconformance and correction | What else it claims |
| --- | --- | --- | --- |
| **Microsoft Dynamics 365 Supply Chain Management** | Quality orders, generated from "quality associations" on purchase, production, quarantine or sales events; tests with minimum, maximum and target values, item sampling by fixed quantity, percentage or license plate, and an acceptable quality level (AQL) | Nonconformance orders of six default types (customer, service request, vendor, production, internal, co-product production), approved or refused, with a tag guiding disposition ("Unusable" or "Restricted usage") and linked corrections | Full blocking of inspected inventory; a certificate of analysis printed from the results |
| **Odoo** | Quality control points that "automatically create quality checks" on receipts and manufacturing operations, per operation, per product or per quantity; pass-fail, measure and other check types | Quality alerts raised from a failed check | Checks bound to a single work order operation |
| **MasterControl** | (QMS, not inspection) | CAPA linked to nonconformance, with an electronic 8D "from root-cause investigation through implementation of preventive action" | Integration with audit, document and training control; Part 11 audit trail and e-signatures |
| **Octave Reliance** (formerly ETQ Reliance) | (QMS) | Nonconformance Management and Corrective Action products | Audit Management, Supply Chain Quality Management and "More than 40 ready-to-use applications" |
| **Veeva QMS** | (QMS, life sciences) | Deviations and complaints | Audits, quality risk management, supplier quality management, change control |

The patterns:

- **Inspection is triggered by an event, and blocks stock until decided.** Every ERP generates the inspection from a business event (a receipt, a production report, a time in storage) by a rule keyed to the item, supplier or group, and holds the quantity in a status that planning and picking can't use. The decision that releases it is a record with a person and a time.
- **Nonconformance and corrective action are separate records.** The nonconformance is about material (this quantity of this lot is wrong, and what happens to it); the corrective action is about the cause (why did it happen, what stops it recurring). One corrective action can answer many nonconformances, and most nonconformances never need one.
- **The QMS and the ERP split the work.** Life sciences and aerospace plants commonly run a dedicated QMS for the controlled processes and signatures, with the ERP holding stock status; the integration between them (a hold in one becoming a block in the other) is where lots slip through.
- **Signatures are part of the record.** Vendors serving FDA-regulated plants sell Part 11 compliance as a feature; the requirement comes from the regulation, not the vendor.

## The Standards

A quality management standard says what the system must do, not how the software works. The common ones:

- **ISO 9001.** The general quality management standard, published by ISO's technical committee 176, which calls it its "primary standard." Its requirements (documented information, control of nonconforming outputs, corrective action, internal audit, management review) are the base the sector standards build on. ISO's own pages refuse automated fetches, so this chapter doesn't quote its clauses or the status of its revision. <!-- source-gap: logistics-quality-management-iso9001 | missing | ISO 9001:2015 clause titles and the status of the revision under way in 2026 | closes with: the ISO catalogue page for ISO 9001 or a TC 176 publication opened by fetch | checked: 2026-11-22 -->
- **IATF 16949.** The automotive standard, used with ISO 9001 and the customer-specific requirements (CSRs) each automaker publishes. The current edition is IATF 16949:2016; the IATF announced on October 24, 2024 that it "has started the revision process," and issued a status communiqué on the revision (SC-2026-005) on July 30, 2026. The IATF also issues sanctioned interpretations (SIs) and FAQs that change how auditors read the standard (SI 27 to 30 on November 20, 2025, more on June 30, 2026), and automakers update their CSRs (Ford's IATF and PPAP CSRs, effective November 9, 2026). A supplier's system has to track which CSR version applies to which customer.
- **AS9100.** The aerospace, space and defense standard, published by SAE and maintained by the International Aerospace Quality Group, adding product safety, configuration management and counterfeit part prevention to ISO 9001. Neither the IAQG nor SAE pages could be read for this chapter. <!-- source-gap: logistics-quality-management-as9100 | missing | AS9100D's current revision, issue date and the scope of the planned successor | closes with: an IAQG or SAE page opened by fetch | checked: 2026-11-22 -->
- **ISO 13485 and FDA's QMSR.** FDA's Quality Management System Regulation (21 CFR 820) "became effective on February 2, 2026," incorporating ISO 13485:2016 by reference and clause 3 of ISO 9000:2015 for definitions. 820.10 requires a device manufacturer to "Document a quality management system that complies with the applicable requirements of ISO 13485," and ties ISO clauses to FDA's own rules: identification to the UDI rules of part 830, traceability to part 821, regulatory reporting to part 803, advisory notices to part 806. FDA stopped using its Quality System Inspection Technique and inspects under Compliance Program 7382.850. The regulation covers finished device manufacturers, and says "the provisions of this part do not apply to manufacturers of components or parts of finished devices," who are encouraged to follow it.

Two things follow for software. First, a plant usually holds several certifications at once (ISO 9001 plant-wide, IATF 16949 for the automotive lines, ISO 13485 for one product family), and a customer's audit asks which applied to the part it bought. Second, the regulated version adds records the general one doesn't require: 820.35 lists what a device complaint record must contain ("The name of the device," "The date the complaint was received," "Any unique device identifier (UDI) or universal product code (UPC)," the complainant's name, address and phone number, "The nature and details of the complaint," "Any correction or corrective action taken," and "Any reply to the complainant"), and what every servicing record must contain.

## Inspection and Lot Release

Inspection happens at four points, each with its own trigger:

- **Receiving inspection.** A supplier's lot is sampled on receipt against the purchase specification, often with the supplier's certificate of analysis (CoA, results the supplier measured) or certificate of conformance (CoC, a statement that it meets the specification) checked against the plant's own limits. Plants with a qualified supplier and a good history skip-lot or accept on certificate alone; that rule is data per supplier and item, and it changes when the supplier's record changes.
- **In-process inspection.** Characteristics measured at an operation, at a frequency in the control plan: first piece after setup, every n parts, every hour. Results feed SPC charts on the line.
- **Final inspection and release.** The finished lot's results, its batch record (for process industries) and its open nonconformances are reviewed, and a person releases it. In regulated plants this is a signed decision; elsewhere it may be automatic when every test passes.
- **Periodic and requalification.** A lot in storage past a retest date, a returned lot, or a lot from a supplier under escalation goes back through inspection.

The inspection record has the same shape everywhere: what was inspected (item, lot, quantity, the receipt or work order that triggered it), against which plan version (characteristics, limits, sampling), how much was sampled, each result, and the **usage decision** (accept, reject, accept with deviation, rework). Sampling plans are usually AQL-based tables by lot size and inspection level; Dynamics 365 lets a plant "specify an acceptable quality level (AQL) to control quality measure tolerances." My rule: store the sample size and acceptance number the plan produced on the inspection row, not only the AQL, because the table and the plan version will change and the inspection has to show what it applied.

Stock status is the point where quality meets logistics. A lot under inspection is quarantined (the core `lots.status` value), and every system that can allocate it (MRP, the WMS, order promising) must read that status, not a quantity field. The decision moves it to released, rejected or on hold, and a rejected receipt becomes a return to the supplier (a return order and a shipment, with freight usually charged back as in [A Manufactured Lot From a Supplier](/books/logistics/logistics-business#a-manufactured-lot-from-a-supplier)). A partial result (two of five pallets fail) splits the lot into two lots or two status quantities; it must never leave one lot both released and rejected.

## Nonconformance and Disposition

A nonconformance (an NCR, a nonconforming material report, a quality notification) records that some quantity of material doesn't meet its requirement, where it was found, and what will be done with it. Dynamics 365's six default types (customer, service request, vendor, production, internal, co-product production) are a good taxonomy of sources, because each carries different reference data: a vendor nonconformance needs the purchase order and supplier lot; a customer one the sales order and shipment; a production one the work order.

The **disposition** is the decision about the material, and it's the field every downstream system cares about:

| Disposition | What happens | Who usually decides |
| --- | --- | --- |
| **Use as is** | Material is used despite the nonconformance, because it doesn't affect form, fit or function | The material review board (MRB), often with the customer's written deviation |
| **Rework** | Brought into conformance by the normal process, then reinspected | Quality |
| **Repair** | Made acceptable by a nonstandard process, not fully conforming | MRB, often the customer |
| **Regrade** | Downgraded to a different item or grade that it does meet | Quality and planning |
| **Return to supplier** | Shipped back, usually at the supplier's cost | Quality and purchasing |
| **Scrap** | Destroyed, with the cost recorded | Quality |

The MRB is the cross-functional group (quality, engineering, production, sometimes the customer) that decides dispositions the line can't. "Use as is" and "repair" on a customer's part usually need the customer's approval, recorded as a deviation with its quantity and validity. My rules: the disposition is approved by a named person, and its quantity can be split (30 rework, 10 scrap) as separate lines; the material is held until every line is decided; the cost of the nonconformance (scrap value, rework labor, sorting, freight) is recorded as lines against it, so supplier chargebacks are sums over lines; and the disposition of each lot updates that lot's status in the same transaction.

## Corrective Action: CAPA and 8D

Corrective action is the investigation of a cause and the change that removes it. Three names cover overlapping practice:

- **CAPA** (corrective and preventive action), the life sciences term, now under ISO 13485 as incorporated by the QMSR.
- **8D** (eight disciplines), the automotive method Ford developed in the 1980s as Team Oriented Problem Solving (per the consultancy Quality-One; Ford's current requirements call it "Global 8D"): D0 prepare, D1 form a team, D2 describe the problem, D3 interim containment action, D4 root cause analysis and escape point, D5 permanent corrective action, D6 implement and validate it, D7 prevent recurrence, D8 closure. Containment protects the customer now and is removed once the permanent action is in place; D4 asks for the root cause and the escape point, where the problem should have been caught.
- **SCAR** (supplier corrective action request), a corrective action the buyer opens and the supplier owns, usually answered as an 8D.

They share a structure: an origin (one or more nonconformances, a complaint, an audit finding, a trend), an owner, containment with its own completion, a root cause, actions with owners and due dates, verification that the actions were done, and an **effectiveness check** after a period that shows the problem stopped. Each stage has a due date that the customer's requirements or the plant's procedure sets, and the automakers publish theirs: Ford's IATF 16949 customer-specific requirements (effective November 9, 2026) ask a supplier to respond to a quality concern in 24 hours and to deliver "the 8D or (six sigma) 6 panel with preliminary or verified root cause" within 15 calendar days; Volvo Group's (February 28, 2025) make 8D "the mandatory method for any quality issue," with containment begun in 24 hours and completed in 48, cause analysis "for both occurrence and non-detection" in 10 working days, and effectiveness checked in 20 working days. Because each customer sets a different clock, I store the due dates computed from the rule and the customer that set them ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)), and the state of each discipline as its own transition ([Transition History](/docs/building-blocks/workflows#transition-history)).

The link back to material matters: containment means finding every unit of the suspect population, in the plant, in transit, at the customer and at the 3PL, and that is a genealogy and shipment query from [Lot & Serial Traceability](/books/logistics/lot-traceability#one-up-one-down), recorded with the corrective action so the containment can be shown to be complete.

## Supplier Quality and PPAP

A buyer's quality system extends into its suppliers in three ways: qualifying them (certifications, audits, approved supplier status per commodity), approving their parts before production (first article inspection in aerospace, PPAP in automotive), and scoring them (incoming rejects, parts per million defective, delivery, corrective action responsiveness).

The **Production Part Approval Process** is the automotive industry's approval of a supplier's part and process, defined in AIAG's PPAP manual (PPAP-4, fourth edition, published November 2009, now in its second printing) as "the industry standard for defining the production part approval process," and used alongside the other AIAG core tools (APQP, the control plan, FMEA, MSA, SPC); AIAG notes that "Core Tools auditing is a required competency under the IATF scheme." In common practice the submission is a set of up to 18 elements (design records, engineering change documents, customer engineering approval, DFMEA, process flow, PFMEA, control plan, MSA studies, dimensional results, material and performance tests, initial process studies, lab documentation, appearance approval, sample parts, master sample, checking aids, CSR records and the Part Submission Warrant) at one of five levels, from the warrant alone (level 1) to everything retained at the supplier for review on site (level 5). A new PPAP is triggered by a new part, by a change to the part or process, and on the customer's request. The automakers' own requirements confirm the structure: Ford's PPAP customer-specific requirements (effective November 9, 2026, "For use with AIAG PPAP Fourth Edition") are organized as the manual's sections 2.2.1 (design record) through 2.2.18 (Part Submission Warrant), refer to "PPAP submission levels (1, 3 and 5)," and require an approved engineering deviation for an interim approval, which "is the authorization to ship parts"; Magna's supplier manual (January 2024) makes "all level 3 requirements as detailed in the AIAG PPAP Manual" the default unless the buying division says otherwise, and asks for an annual revalidation.

The record a system needs is small: which part, at which revision, from which supplier and site, for which customer, at which level, with which elements, the warrant as signed, and the customer's disposition (approved, interim approval with conditions and an expiry, rejected). The revision link is the important one: a PPAP approves an engineering revision made by a specific process at a specific site, so an engineering change (the revision record belongs to [BOMs, PLM & Engineering Change](/books/logistics/boms-and-engineering-change#engineering-change)) or a move to a new site invalidates it, and receiving should flag shipments of a part whose approved PPAP doesn't match the revision on the ASN.

Supplier scorecards are computed from these records (receipts, inspections, nonconformances by supplier, corrective action timeliness) and from the delivery data of [Supplier Schedules, JIT & Automotive EDI](/books/logistics/supplier-schedules#supplier-performance); compute them as views, never stored totals.

## Electronic Records and Signatures

In FDA-regulated plants, the inspection results, batch records, dispositions and CAPA records are kept under "records requirements set forth in agency regulations" (the predicate rules, such as the QMSR), so 21 CFR Part 11 applies when they are electronic: electronic records and signatures must be "trustworthy, reliable, and generally equivalent to paper records and handwritten signatures." 11.10 requires "Validation of systems to ensure accuracy, reliability, consistent intended performance" and "secure, computer-generated, time-stamped audit trails" of operator actions, where "Record changes shall not obscure previously recorded information." The Health Tech volume's [21 CFR Part 11](/books/health-tech/trial-systems-and-part-11#21-cfr-part-11) covers the mechanics (signature manifestations, linking, validation); for a plant the consequences are that a disposition, a release and a CAPA closure are signed records bound to the content they sign, and that corrections are new records, never edits ([Amend, Don't Overwrite](/docs/building-blocks/audit-trails#amend-don-t-overwrite)).

## How to Build It

Plans and their characteristics, inspections and results, nonconformances with disposition lines and costs, corrective actions linked to their sources, supplier certifications and PPAP submissions. The core `lots.status` already carries the stock decision; these tables record why it changed.

```sql
ALTER TABLE lots
  ADD COLUMN released_at        TIMESTAMPTZ,   -- the usage decision that released it
  ADD COLUMN status_reason_ref  UUID;          -- the inspection or nonconformance behind the status
ALTER TABLE items
  ADD COLUMN inspection_at_receipt BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN ppap_required         BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE documents                    -- quality records join the kinds already added
  DROP CONSTRAINT documents_kind_check,
  ADD CONSTRAINT documents_kind_check CHECK (kind IN ('bill_of_lading', 'rate_confirmation',
    'proof_of_delivery', 'delivery_receipt', 'lumper_receipt', 'freight_invoice',
    'ocean_bill_of_lading', 'sea_waybill', 'air_waybill', 'arrival_notice',
    'commercial_invoice', 'packing_list', 'customs_entry', 'notice_of_assignment',
    'certificate_of_insurance', 'load_tender', 'tender_response', 'status_message',
    'ship_notice', 'power_of_attorney', 'customs_bond', 'bond_insufficiency_notice',
    'client_error_notice', 'planning_schedule', 'shipping_schedule', 'production_sequence',
    'application_advice', 'certificate_of_analysis', 'certificate_of_conformance',
    'ppap_submission', 'corrective_action_report', 'other')) NOT VALID;
ALTER TABLE documents VALIDATE CONSTRAINT documents_kind_check;

CREATE TABLE quality_certifications (    -- a party's certificate to a standard, per site
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id          UUID NOT NULL REFERENCES parties (id),
  facility_id       UUID REFERENCES facilities (id),  -- certificates are issued per site
  standard          TEXT NOT NULL CHECK (standard IN ('iso_9001', 'iatf_16949', 'as9100',
                      'iso_13485', 'iso_14001', 'fssc_22000', 'other')),
  certificate_number TEXT NOT NULL,
  certification_body TEXT NOT NULL,
  scope             TEXT,                -- as printed: products and processes covered
  valid_during      DATERANGE NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('valid', 'suspended', 'withdrawn',
                      'expired')),
  document_id       UUID REFERENCES documents (id),
  UNIQUE (certification_body, certificate_number)
);

CREATE TABLE quality_inspection_plans (  -- what to check, when, how much; versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id          UUID NOT NULL REFERENCES items (id),
  facility_id      UUID NOT NULL REFERENCES facilities (id),
  supplier_party_id UUID REFERENCES parties (id),     -- null: any supplier
  trigger          TEXT NOT NULL CHECK (trigger IN ('receipt', 'in_process', 'final',
                     'retest', 'customer_return', 'first_article')),
  operation_seq    INT,                  -- for 'in_process'
  sampling         TEXT NOT NULL CHECK (sampling IN ('full', 'fixed', 'percent', 'aql',
                     'skip_lot', 'certificate_only')),
  sampling_params  JSONB NOT NULL DEFAULT '{}',  -- quantity, percent, AQL and level, skip rate
  version          INT NOT NULL,
  valid_during     TSTZRANGE NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'retired')),
  approved_by      TEXT,
  UNIQUE (item_id, facility_id, trigger, version)
);

CREATE TABLE quality_characteristics (   -- one thing measured or judged under a plan
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  plan_id         UUID NOT NULL REFERENCES quality_inspection_plans (id),
  sequence        INT NOT NULL,
  name            TEXT NOT NULL,         -- 'melt flow index', 'bore diameter', 'appearance'
  kind            TEXT NOT NULL CHECK (kind IN ('quantitative', 'qualitative')),
  target          NUMERIC(18, 6),
  lower_limit     NUMERIC(18, 6),
  upper_limit     NUMERIC(18, 6),
  uom             TEXT,
  classification  TEXT CHECK (classification IN ('critical', 'major', 'minor')),
  UNIQUE (plan_id, sequence),
  CHECK (kind = 'qualitative' OR lower_limit IS NOT NULL OR upper_limit IS NOT NULL)
);

CREATE TABLE quality_inspections (       -- one inspection of one quantity, and its decision
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  plan_id            UUID NOT NULL REFERENCES quality_inspection_plans (id),
  lot_id             UUID REFERENCES lots (id),
  item_id            UUID NOT NULL REFERENCES items (id),
  facility_id        UUID NOT NULL REFERENCES facilities (id),
  source_kind        TEXT NOT NULL CHECK (source_kind IN ('receipt', 'work_order',
                       'stock', 'return')),
  source_ref         UUID NOT NULL,      -- the receipt line, work order or return
  lot_quantity       NUMERIC(14, 3) NOT NULL CHECK (lot_quantity > 0),
  sample_size        NUMERIC(14, 3) NOT NULL CHECK (sample_size >= 0),
  acceptance_number  INT,                -- what the sampling table gave, kept with the row
  certificate_document_id UUID REFERENCES documents (id),  -- the supplier's CoA or CoC
  usage_decision     TEXT CHECK (usage_decision IN ('accept', 'reject',
                       'accept_with_deviation', 'rework', 'partial')),
  decided_by         TEXT,
  decided_at         TIMESTAMPTZ,
  signature_ref      TEXT,               -- the signed record, where Part 11 applies
  status             TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'decided',
                       'cancelled')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((status = 'decided') = (usage_decision IS NOT NULL AND decided_at IS NOT NULL))
);
CREATE INDEX ON quality_inspections (lot_id);

CREATE TABLE quality_inspection_results (  -- each measurement or judgement, as recorded
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  inspection_id     UUID NOT NULL REFERENCES quality_inspections (id),
  characteristic_id UUID NOT NULL REFERENCES quality_characteristics (id),
  sample_number     INT NOT NULL DEFAULT 1,
  measured_value    NUMERIC(18, 6),
  observed          TEXT,                -- for qualitative results
  result            TEXT NOT NULL CHECK (result IN ('pass', 'fail')),
  instrument_ref    TEXT,                -- the gauge, with its calibration status at use
  measured_at       TIMESTAMPTZ NOT NULL,
  recorded_by       TEXT NOT NULL,
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (inspection_id, characteristic_id, sample_number)
);

CREATE TABLE nonconformances (           -- material that doesn't meet its requirement
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  number            TEXT NOT NULL UNIQUE,
  source            TEXT NOT NULL CHECK (source IN ('supplier', 'receipt', 'production',
                      'customer', 'internal', 'audit', 'field')),
  facility_id       UUID NOT NULL REFERENCES facilities (id),
  item_id           UUID NOT NULL REFERENCES items (id),
  lot_id            UUID REFERENCES lots (id),
  supplier_party_id UUID REFERENCES parties (id),
  customer_party_id UUID REFERENCES parties (id),
  inspection_id     UUID REFERENCES quality_inspections (id),
  source_ref        UUID,                -- the work order, shipment or complaint
  quantity          NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  uom               TEXT NOT NULL,
  problem_type      TEXT NOT NULL,       -- the plant's defect code
  description       TEXT NOT NULL,
  severity          TEXT NOT NULL CHECK (severity IN ('critical', 'major', 'minor')),
  found_at          TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('open', 'contained', 'dispositioned',
                      'closed', 'void')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON nonconformances (lot_id);

CREATE TABLE nonconformance_dispositions (  -- the decision, line by line
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  nonconformance_id  UUID NOT NULL REFERENCES nonconformances (id),
  disposition        TEXT NOT NULL CHECK (disposition IN ('use_as_is', 'rework', 'repair',
                       'regrade', 'return_to_supplier', 'scrap')),
  quantity           NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  resulting_lot_id   UUID REFERENCES lots (id),  -- when the decision splits the lot
  customer_deviation_document_id UUID REFERENCES documents (id),  -- the signed deviation
  decided_by         TEXT NOT NULL,
  decided_at         TIMESTAMPTZ NOT NULL,
  signature_ref      TEXT,
  completed_at       TIMESTAMPTZ          -- rework done, scrap destroyed, return shipped
);

CREATE TABLE nonconformance_costs (      -- what it cost, so chargebacks are sums of lines
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  nonconformance_id  UUID NOT NULL REFERENCES nonconformances (id),
  kind               TEXT NOT NULL CHECK (kind IN ('scrap', 'rework_labor', 'sorting',
                       'inspection', 'freight', 'line_down', 'admin_fee', 'other')),
  amount             BIGINT NOT NULL,    -- minor units
  currency           CHAR(3) NOT NULL,
  recoverable_from_party_id UUID REFERENCES parties (id),  -- the supplier charged back
  freight_charge_id  UUID REFERENCES freight_charges (id),  -- the return or expedite line
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE corrective_actions (        -- a CAPA, 8D or SCAR: the cause and the fix
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  number            TEXT NOT NULL UNIQUE,
  method            TEXT NOT NULL CHECK (method IN ('capa', '8d', 'scar', 'a3', 'other')),
  owner_party_id    UUID NOT NULL REFERENCES parties (id),  -- the plant, or the supplier on a SCAR
  requested_by_party_id UUID REFERENCES parties (id),       -- the customer that opened it
  problem_statement TEXT NOT NULL,
  containment       TEXT,
  containment_due_at TIMESTAMPTZ,
  containment_done_at TIMESTAMPTZ,
  root_cause        TEXT,
  escape_point      TEXT,                -- where it should have been caught
  root_cause_due_on DATE,
  effectiveness_due_on DATE,
  effectiveness_result TEXT CHECK (effectiveness_result IN ('effective', 'not_effective')),
  stage             TEXT NOT NULL CHECK (stage IN ('d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6',
                      'd7', 'd8', 'open', 'investigation', 'implementation', 'verification')),
  status            TEXT NOT NULL CHECK (status IN ('open', 'closed', 'cancelled')),
  closed_by         TEXT,
  closed_at         TIMESTAMPTZ,
  report_document_id UUID REFERENCES documents (id),  -- the 8D or CAPA report as sent
  CHECK (status <> 'closed' OR (closed_at IS NOT NULL AND effectiveness_result IS NOT NULL))
);

CREATE TABLE corrective_action_sources ( -- what it answers: many nonconformances, or others
  corrective_action_id UUID NOT NULL REFERENCES corrective_actions (id),
  source_kind          TEXT NOT NULL CHECK (source_kind IN ('nonconformance', 'complaint',
                         'audit_finding', 'trend', 'recall')),
  source_ref           UUID NOT NULL,
  PRIMARY KEY (corrective_action_id, source_kind, source_ref)
);

CREATE TABLE corrective_action_tasks (   -- each action, owner and due date
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  corrective_action_id UUID NOT NULL REFERENCES corrective_actions (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('containment', 'correction',
                         'corrective', 'preventive', 'verification')),
  description          TEXT NOT NULL,
  assignee             TEXT NOT NULL,
  due_on               DATE NOT NULL,
  done_at              TIMESTAMPTZ,
  evidence_document_id UUID REFERENCES documents (id)
);

CREATE TABLE ppap_submissions (          -- a supplier's part approval for one customer
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id            UUID NOT NULL REFERENCES items (id),
  item_revision      TEXT NOT NULL,      -- the revision approved, from item_revisions
  supplier_party_id  UUID NOT NULL REFERENCES parties (id),
  supplier_facility_id UUID NOT NULL REFERENCES facilities (id),  -- approval is per site
  customer_party_id  UUID NOT NULL REFERENCES parties (id),
  reason             TEXT NOT NULL CHECK (reason IN ('new_part', 'engineering_change',
                       'process_change', 'site_change', 'tooling_change', 'supplier_change',
                       'customer_request', 'other')),
  level              SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 5),
  elements           TEXT[] NOT NULL,    -- the elements submitted or retained
  warrant_document_id UUID REFERENCES documents (id),  -- the signed PSW
  submitted_at       TIMESTAMPTZ,
  disposition        TEXT CHECK (disposition IN ('approved', 'interim_approved', 'rejected')),
  interim_expires_on DATE,
  decided_at         TIMESTAMPTZ,
  status             TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'decided',
                       'superseded')),
  FOREIGN KEY (item_id, item_revision) REFERENCES item_revisions (item_id, revision),
  CHECK (disposition IS DISTINCT FROM 'interim_approved' OR interim_expires_on IS NOT NULL)
);
CREATE UNIQUE INDEX ppap_one_current ON ppap_submissions (item_id, supplier_facility_id,
  customer_party_id) WHERE status = 'decided' AND disposition IN ('approved', 'interim_approved');
```

Notes on the choices:

- **The plan is versioned and the inspection keeps what it applied.** Limits and sampling change; `quality_inspections` holds the plan version, sample size and acceptance number used, so a result is judged against the rule in force ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Lot status changes with its reason.** The usage decision or disposition updates `lots.status` and `status_reason_ref` in the same transaction, so "why is this lot on hold" is one lookup, and planning, the WMS and order promising read one status.
- **Dispositions are lines.** A nonconformance's quantity can be split across dispositions, each with its decision maker and, for use as is or repair on a customer's part, the deviation document.
- **Costs are lines too.** Supplier chargebacks are sums over `nonconformance_costs`, linked to the freight charge for a return or an expedite, never a stored total ([One Rule for All of Them](/books/logistics/logistics-business#one-rule-for-all-of-them)).
- **One PPAP is current per part, site and customer.** The partial unique index enforces it; a new submission supersedes the last.

Receiving's question before a supplier's ASN is accepted, which incoming parts have no current PPAP for the revision they ship at:

```sql
SELECT sl.id AS shipment_line_id, i.sku, s.shipper_party_id
FROM shipment_lines sl
JOIN shipments s ON s.id = sl.shipment_id
JOIN items i ON i.id = sl.item_id AND i.ppap_required
WHERE sl.shipment_id = $1                        -- $2: the revision the ASN states
  AND NOT EXISTS (
    SELECT 1 FROM ppap_submissions p
    WHERE p.item_id = sl.item_id
      AND p.supplier_party_id = s.shipper_party_id
      AND p.customer_party_id = s.consignee_party_id
      AND p.item_revision = $2
      AND p.status = 'decided'
      AND (p.disposition = 'approved'
           OR (p.disposition = 'interim_approved' AND p.interim_expires_on >= CURRENT_DATE))
  );
```

## Auditing

- **Every inspection** with its plan version, sample, results, instrument and the usage decision with who made it and when, signed where Part 11 applies.
- **Every lot status change** with the inspection, nonconformance or disposition that caused it ([Transition History](/docs/building-blocks/workflows#transition-history)).
- **Every nonconformance** with its disposition lines, decision makers, customer deviations and costs, and the corrective action that answered it, if any.
- **Every corrective action** with its sources, containment, root cause, tasks with evidence, effectiveness check and closure.
- **Every PPAP** as submitted and decided, with the warrant, the revision and the site, and every certificate of every supplier with its validity.
- **Device complaints and service records** with the fields 820.35 lists, kept with the device's UDI.

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Trigger inspections from events by rule,** per item, site and supplier, and block the quantity until a person or a passing rule decides.
- **Keep one stock status per lot that every system reads,** changed only by a usage decision or disposition with its reason.
- **Separate the material from the cause:** nonconformances with disposition lines for the material, corrective actions for the cause, many to many.
- **Store due dates and stages for containment, root cause and effectiveness,** computed from the customer's or regulator's rule.
- **Record costs as lines** and charge suppliers back as sums.
- **Tie PPAP to part revision, supplier site and customer,** and check incoming shipments against it.
- **Make releases, dispositions and closures signed records** in regulated plants, and correct by amendment, never by edit.

## References

**Regulations**

- [FDA: Quality Management System Regulation (QMSR)](https://www.fda.gov/medical-devices/postmarket-requirements-devices/quality-management-system-regulation-qmsr), the February 2, 2026 effective date, ISO 13485:2016 and ISO 9000:2015 clause 3 by reference, the end of QSIT and Compliance Program 7382.850
- [21 CFR 820.1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/820.1), scope of the QMSR and the exclusion of component manufacturers
- [21 CFR 820.10 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/820.10), documenting a QMS that complies with ISO 13485 and the clauses tied to parts 803, 806, 821 and 830
- [21 CFR 820.35 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/820.35), the contents of complaint and servicing records
- [21 CFR 11.10 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/11.10), validation and time-stamped audit trails that don't obscure prior entries
- [21 CFR 11.1 (Cornell LII)](https://www.law.cornell.edu/cfr/text/21/11.1), records "trustworthy, reliable, and generally equivalent to paper records" and the scope of records kept "under any records requirements set forth in agency regulations"

**Standards bodies**

- [IATF Global Oversight](https://www.iatfglobaloversight.org/), IATF 16949:2016, the revision begun October 24, 2024, SC-2026-005 of July 30, 2026, sanctioned interpretations and the Ford CSR update effective November 9, 2026
- [AIAG: PPAP](https://www.aiag.org/quality/automotive-core-tools/ppap), the PPAP-4 manual and its definition, the other core tools and core tools auditing under the IATF scheme
- [ISO TC 176](https://committee.iso.org/home/tc176), ISO 9001 as the committee's primary standard

**Vendors**

- [Microsoft Learn: Quality and nonconformance management overview](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/quality-management-processes), quality associations and orders, sampling, AQL, blocking, the six nonconformance types, dispositions and corrections, certificates of analysis
- [Odoo: Quality control points](https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/quality/quality_management/quality_control_points.html), control points per operation, product or quantity, check types and quality alerts
- [MasterControl: CAPA software](https://www.mastercontrol.com/quality/capa-software/), CAPA with nonconformance, the electronic 8D and Part 11 features
- [Octave: Reliance](https://www.octave.com/products/asset-performance-management/reliance), the rebranded ETQ Reliance, its nonconformance, corrective action, audit and supplier quality products and "More than 40 ready-to-use applications"
- [Veeva: QMS](https://www.veeva.com/products/vault-qms/), complaints, deviations, audits, risk, supplier quality and change control

**Automakers and suppliers**

- [Ford: Customer-Specific Requirements for PPAP (effective November 9, 2026)](https://www.iatfglobaloversight.org/wp/wp-content/uploads/2026/11/Ford-Specifics-for-PPAP_Nov-2026-SCCAF.pdf), the AIAG fourth edition's sections 2.2.1 to 2.2.18, submission levels 1, 3 and 5, and interim approval under a deviation
- [Ford: Customer-Specific Requirements for IATF 16949 (effective November 9, 2026)](https://www.iatfglobaloversight.org/wp/wp-content/uploads/2026/11/Ford-IATF-CSR_Nov-2026-SCCAF.pdf), Global 8D, the 24-hour response and the 15-day 8D
- [Volvo Group: IATF 16949 Customer-Specific Requirements (February 28, 2025)](https://www.iatfglobaloversight.org/wp/wp-content/uploads/2025/02/CSR-Volvo-V2-20250228-1.pdf), 8D as the mandatory method and its 24-hour, 48-hour, 10- and 20-working-day clocks
- [Magna: Global Supplier Operational Requirements (revision 1.1, January 2024)](https://www.magna.com/docs/default-source/suppliers/2024-global-supply-chain-requirements/magna-global-supply-chain-requirements_1-1_jan24-01.pdf?sfvrsn=5ee1d80b_11), AIAG level 3 as the default PPAP submission and annual revalidation

**In practice**

- [Quality-One: PPAP](https://www.quality-one.com/ppap/), the five submission levels, the 18 elements, the warrant and the triggers for a submission
- [Quality-One: Eight Disciplines (8D)](https://www.quality-one.com/8d/), the disciplines D0 to D8, Ford's TOPS origin, containment, root cause and escape point
