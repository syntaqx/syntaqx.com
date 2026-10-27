+++
title = "Proof of Service"
description = "Proving the visit happened: photos, signatures, scans, readings and GPS, required evidence per task, not-completed reasons, reports, disputes and amendments."
category = "Field Operations Industry"
order = 1514
part = "In the Field"
tags = ["field-operations", "proof-of-service", "proof-of-delivery", "evidence", "disputes", "mobile"]
+++

A field service business gets paid for something the customer usually doesn't watch. The technician treats the perimeter while the homeowner is at work, services the pool on a Tuesday morning, replaces a capacitor on a rooftop unit, tests a backflow assembly in a commercial basement, cleans an office overnight, inspects fire extinguishers in a building the property manager never visits. Months later someone asks: was anyone actually there, and what did they do? The customer disputing a charge, the card network deciding that dispute, a state inspector reviewing pesticide records, a water utility checking a test report, a property manager auditing a contract, a manufacturer reviewing a warranty claim, a technician claiming a commission. **Proof of service** is the evidence, captured at the moment of the work, that answers them. It can't be reconstructed later, and evidence that could have been edited afterwards is worth much less than evidence that couldn't.

Delivery platforms have worked on this problem longer than field service platforms have, under the name proof of delivery, and their public APIs are the clearest documentation of how to model it. This chapter takes the useful parts of both.

## What Counts as Proof

No single artifact proves a visit. Proof is a bundle, and each piece answers a different doubt:

| Evidence | Answers | Weakness on its own |
| -------- | ------- | ------------------- |
| Status timestamps (arrived, started, completed) | When | A button anyone could press from anywhere |
| Location at each status, with accuracy | Where | Accuracy degrades indoors and between buildings |
| Photos | What was done and what was found | Can be old, or of a different property, unless captured in the app |
| Signature and signer name | Who accepted it | Often unavailable; a scribble identifies no one |
| Notes and form answers | What the technician observed | Only as good as the technician |
| Scans (bait stations, equipment, parts) | That the technician physically reached a specific object | Only covers tagged objects |
| Readings and products applied | What was measured and used, in regulated detail | Typed in, so plausibility checks matter |
| Customer PIN or ID check | That the right person received it | Needs the recipient present |

The design goal is a record where several independent signals agree. A pest visit completed at 10:42 from a location 20 meters from the property, with three in-app photos between 10:21 and 10:39, two bait stations scanned and a product log that matches the label rate. An HVAC repair with a photo of the failed part and the data plate, pressures and temperatures before and after, and the replacement part's serial. A cleaning shift with clock-in inside the geofence and photos of the critical items on the inspection list. Any one of those can be faked; all of them together are hard to fake and easy to check.

## How the Platforms Do It

Delivery platforms expose proof as structured data on the task, and most let it be required per task. Three show the range:

| Platform | What it captures | Required per | Notes |
| -------- | ---------------- | ------------ | ----- |
| Bringg | Signature, picture, note, scan, customer PIN, forms, branching questions, inventory rejection | Step in an order flow, timed as optional or mandatory "before checkout" | Waypoints record check-in and check-out time, coordinates and whether they were automatic |
| eLogii | Signatures, photos, numeric codes, barcode scans, comments, confirmations, cash on delivery, custom types | Separately for pickup, delivery and failed tasks | Each item records where it was captured; a geofence can limit when proof can be collected |
| Onfleet | Signature, photo, notes; ID scan with minimum age (Scale plan and up); recipient PIN (Enterprise) | Task, via `completionDetails` requirements | Completion in the app captures location; signature and photo upload IDs arrive on the `taskUpdated` webhook |

Others add details worth copying: Locate2u stores signatures as vector data with timestamped, geotagged photos, and FarEye records who received the delivery and their relationship to the recipient.

Field service suites capture the same things through forms and the visit record rather than a delivery-specific object:

- **Salesforce Field Service** has `DigitalSignature` and `ServiceReport` objects in its data model, so the signature and the generated report are first-class records rather than attachments.
- **ServiceTitan** collects signatures on device for invoices, estimates and change authorizations, and its technician forms can be triggered by the office and required before completion. HVAC diagnostic tools plug in alongside: measureQuick's integration attaches its test report and photos to the ServiceTitan job.
- **ServiceTrade**, for fire and life safety inspection, lets technicians complete one digital inspection and sends the data to each jurisdiction in its required format, with reports going to customers and the authorities having jurisdiction.
- **Swept**, for janitorial inspections, describes its photos as tamper-proof with embedded timestamps, and lets inspection templates require photos or notes on critical items.
- **Pool Brain** and **Skimmer** email a service report with labeled photos when a pool stop is completed.

The convergence is clear: proof is a configurable list of evidence types, some required, attached to the task with a time and a place.

When nobody is home to sign, the handoff type (safe place, neighbor, locker) and an in-app photo carry the proof, and a PIN or ID check forces someone to be there; [Last-Mile Delivery & Distribution](/books/field-operations/last-mile-delivery) covers unattended drops.

## Required Evidence, Configured per Task

"Always require a photo" is wrong for most businesses. A quarterly exterior pest treatment needs a photo of the treated area; a monthly bait-station check needs scans; a termite inspection needs a diagram and a signed report; a water heater replacement needs photos of the old and new data plates and the venting; a backflow test needs the readings and the gauge's calibration date; a skipped stop needs a photo of the locked gate. The platforms let requirements vary: Onfleet per task, eLogii per pickup, delivery and failure, Bringg per step in a flow with a timing rule.

Build requirements as rules resolved from general to specific, with the most specific winning:

1. Company default.
2. Service type (initial treatment, recurring service, inspection, repair, install).
3. Customer or property (a commercial account whose contract demands photos of every device, or a jurisdiction's inspection form).
4. The individual visit (a dispatcher's one-off "photo of the damaged fence").

```json
{
  "applies_to": { "service_type": "termite_inspection" },
  "on_complete": [
    { "kind": "photo", "min": 2, "label": "Conducive conditions" },
    { "kind": "form", "form": "wdi_findings", "version": "2026-03" },
    { "kind": "signature", "is_unavailable_allowed": true, "unavailable_requires": "note" }
  ],
  "on_not_completed": [
    { "kind": "reason" },
    { "kind": "photo", "min": 1 }
  ],
  "capture": { "is_camera_only": true, "max_distance_m": 150 }
}
```

A few rules make requirements enforceable without making technicians hate the app:

- **Evaluate on the device and again on the server.** The device must enforce the gate offline. The server re-checks, because an old app version or a modified client can skip it.
- **Allow an explained exception.** A signature isn't always possible (nobody home is the normal case for recurring exterior service). "Unavailable" with a required reason is honest evidence; a forced scribble from the technician is not.
- **Gate by place where it's cheap.** eLogii can stop drivers from changing state or collecting proof outside a geofence. My default for field service is a distance check at completion that flags rather than blocks, because property centroids are imprecise, big lots are big, and a commercial campus can be half a mile across.
- **Snapshot the rule onto the visit.** Record which requirements applied when the visit was completed, so changing the rule next month doesn't make old visits look incomplete.

## When the Work Can't Be Done

A visit that didn't happen needs as much evidence as one that did, often more: it decides whether the customer is billed, whether the work is rescheduled, and whether the customer is told. Which end state applies (`completed` with the work order on hold, `not_completed` or `cancelled`), the one `status_reason` catalog, and why `part_needed` and `weather` can land on either side of the line are defined once in [The Core Data Model](/books/field-operations/field-operations-business#the-core-data-model). This section adds what each reason has to prove and what it sets off.

Delivery platforms model failure as a first-class outcome with a reason catalog. Onfleet drivers select "Failure" and a reason (driver or vehicle incident, destination unreachable, recipient unavailable, refused, unable to locate, or other); higher plans add admin-defined reasons that can require notes, and edits to them "don't apply to completed tasks." eLogii lets operators fail tasks from the dashboard with a required reason, stores reasons in task history, and reports failed reasons by period, team, driver and customer.

Field service needs the same, and each reason should drive behavior, not just a report. The `not_completed` reasons:

| Reason | Evidence | Billing | Next step |
| ------ | -------- | ------- | --------- |
| `no_access` (locked gate, no key, mechanical room locked) | Photo of the obstacle | A policy choice: not billed, or a trip charge if the agreement allows it | Reschedule, notify the customer with what to change |
| `not_home` (work that needs someone present) | Arrival time and location, a note | The same policy as `no_access` | Reschedule and notify |
| `customer_declined` at the door | Note, signature if offered | Per agreement | Retention workflow ([Collections & Retention](/books/field-operations/collections-and-retention)) |
| `part_needed` (the planned work needs a part that isn't on the truck, nothing done) | Photo of the equipment, the part required | Not billed | Order the part, schedule the return visit |
| `weather` (rain or wind above the label limit after arrival) | Conditions recorded | Not billed | The occurrence returns to the backlog with its window intact |
| `unsafe_condition` (aggressive dog, hazard) | Photo, note | Not billed | Flag the property for future visits |

Partial service (the interior wasn't accessible, one of three rooftop units was locked out) is not a failure reason: the visit is `completed` for what was done, the evidence includes photos of what couldn't be reached, and billing is pro-rated or full per the agreement.

Let each company label and subdivide reasons its own way, but map every one onto the fixed system catalog, so analytics can compare across tenants and the billing and rescheduling rules stay the same. Record who chose the reason (technician or office) and from where.

## Signatures

Electronic signatures carry legal effect under ESIGN, and the evidence that makes one hold up (the document as presented, signer identity, server timestamps, the event trail) is laid out in [Electronic Signatures](/docs/compliance/electronic-signatures#what-the-evidence-holds). A completion signature is lighter than a contract signature, but it should use the same evidence model. The field-specific parts:

- **What was shown.** A hash of the exact screen the customer saw: the work summary, the invoice total, the authorization text. A signature next to "service completed" means little if the content behind it can change.
- **Who signed, and their relationship.** A tenant isn't the account holder; a property manager's maintenance lead isn't the owner; a store's shift manager isn't the facilities contract holder. FarEye's "relationship to recipient" is the field to copy.
- **When and where.** Device time (`device_recorded_at`), server receipt time (`received_at`) and location.
- **The strokes** as vector data, as Locate2u stores them, which keeps more fidelity than a flattened image.

Contract signatures, with disclosures and cancellation rights, are a heavier ceremony covered in [Signing the Agreement](/books/field-operations/signing-the-agreement).

## Photos and Location

Photos are the most persuasive evidence and the easiest to undermine. A photo picked from the camera roll could be from last year or from a different house. The platforms that describe their photos (Locate2u's "timestamped, geotagged, and attached to the job record," Swept's timestamp-embedded photos) are describing the same remedy: take photos inside the app and bind them to the visit at capture.

- **Capture in the app** where evidence matters, and record whether a photo came from the camera or the library.
- **Hash on the device** at capture, store the hash in the visit record, and upload the file separately. The hash proves the file the server holds is the one taken on site, even if the upload finishes hours later.
- **Record location with its accuracy, and both clocks,** on every status, photo and signature. Why a position is a measurement with an error bar, and why device time and received time are kept apart, is in [A Position Is a Measurement](/docs/architecture/location-tracking#a-position-is-a-measurement); geofence arrival as evidence is in [Evidence, Not Truth](/docs/architecture/location-tracking#evidence-not-truth). The field twist is what the point is compared with: the property's service point (a technician's pin, per [Customers, Accounts & Properties](/books/field-operations/customers-and-properties#addresses-for-service-work)), not a rooftop geocode, so a large lot or a commercial campus doesn't flag every visit.
- **Mind what's in the frame.** Photos inside homes and offices capture people, documents and belongings. Set a retention period, restrict who can view them, and don't expose them in customer-facing reports without a reason ([Data Retention](/docs/architecture/data-retention)).

## Service Reports

The **service report** (a delivery note or field report) is what the customer receives: what was done, what was found, what was measured or applied, what's recommended, and who did it. Where products are applied it can carry regulated content (Solea prints EPA registration numbers and active ingredients on its report), and what a given state requires the customer to receive is covered in [Regulated Materials](/books/field-operations/regulated-materials). Some reports have a second audience: a backflow test report goes to the water system, a fire inspection report to the authority having jurisdiction, a refrigerant service record into the company's own compliance file.

The platforms render them in a few ways. eLogii's tracking page can let customers view and download proof as a PDF with the task history. FieldRoutes' customer portal shows serviced appointment history with the technician, notes, invoice and products used. ServiceTrade's portal lets the company choose which job media each customer sees.

Build reports as renderings of a specific, sealed version of the visit record, never of the live record. Store the rendered output (or enough to reproduce it byte for byte) with the version it came from. When a visit is amended, the customer gets a new report marked as a revision, and both remain retrievable. A template change next year must not change what a customer was sent this year.

## Evidence for Disputes and Chargebacks

When a customer disputes a card payment for a service visit, the merchant answers with evidence, on the network's deadline ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)). Processors' dispute APIs show what evidence is expected. Stripe's dispute evidence object includes `service_date`, `service_documentation`, `customer_signature`, `customer_communication`, `cancellation_policy`, `refund_policy` and `receipt`, alongside the shipping fields a product seller would use.

For a field service business, that maps directly onto the proof bundle:

- **Service date and documentation:** the sealed visit record and service report, with photos, readings and timestamps.
- **Signature:** the completion or agreement signature, with what was signed.
- **Communication:** the reminder, on-my-way message and post-visit report actually delivered ([Customer Communications](/books/field-operations/customer-communications)).
- **Policy:** the cancellation and refund terms the customer agreed to, and the signed agreement.

Build a dispute package generator that assembles these from the record by payment, so responding takes minutes. For a recurring plan, a dispute often covers a charge for a period, which means the package must find every visit in that billing period, including the `not_completed` ones with their evidence. For a repair, the package needs the approved estimate and the before and after evidence, since "not as described" is the usual claim. Evidence that answers the specific claim ("services not provided" calls for visit evidence; "cancelled" calls for the cancellation record) beats a pile of everything.

## Edits After Completion

Records get corrected. A technician forgets a product, picks the wrong reason, or completes the wrong visit. The question is not whether completed visits can change but how the change is kept, and the general answer (seal what's final, amend by new version with a required reason, tighten who may amend as the record ages) is in [Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite).

The platforms show the range of what "completed" means:

- **eLogii** task history "cannot be deleted or altered in any way," except by deleting the whole task.
- **Onfleet** lets a dispatcher force complete a task from the dashboard or API, and **Tookan's** webhook carries `completed_by_admin`, so consumers can tell an office completion from a field one.
- **Dynamics 365** moves a work order from Completed to Posted, at which point invoices and actuals are generated, and its auditing logs updates where the new value differs from the old.

Three field-specific rules on top of the general ones:

- **Mark office actions as office actions.** A visit completed by a dispatcher, with no field evidence, must never be presented as a field completion, in a report, a dispute package or a commission calculation.
- **Tie amendment rights to what the record feeds.** A technician can add a missed note the same day. Changing products applied touches a regulated record; changing parts used touches inventory and a warranty claim; anything on a billed or disputed visit needs a manager and should be rare enough to review.
- **Copy evidence you depend on.** If you integrate a vendor whose photo links expire (Track-POD's API photo links last 24 hours), download and store the files at completion time.

![Proof of service: photos, signature, notes, scans and products captured on site flow into a completion gate that checks the evidence required for that task; a done visit becomes a sealed record with a hash, times and place, which produces the service report; a visit that can't be done ends not completed with a reason and photo, and is sealed the same way; an edit after close creates an amendment as a new version with the reason.](/diagrams/fo-proof-of-service-record.svg "Completed and not-completed visits are both sealed records. Reports render from a sealed version, and later edits are amendments that keep the original.")

## How to Build It

This extends the core model in [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model). Arrival and completion times are already on `visits` (`arrived_at`, `completed_at`); forms, readings and field payments are in [The Technician App](/books/field-operations/technician-app#how-to-build-it). This chapter adds the requirement rules, the captured evidence and the reports sent:

```sql
CREATE TABLE evidence_rule_sets (        -- one JSON document like the example above, per scope
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  scope        TEXT NOT NULL CHECK (scope IN ('company', 'service_type', 'account',
                 'property', 'visit')),
  scope_id     UUID,                     -- null for the company default
  rules        JSONB NOT NULL,           -- on_complete, on_not_completed, capture
  version      INTEGER NOT NULL,
  valid_during TSTZRANGE NOT NULL,
  CHECK ((scope = 'company') = (scope_id IS NULL))
);

CREATE TABLE visit_evidence (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  visit_id              UUID NOT NULL REFERENCES visits (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('photo', 'signature', 'scan', 'note',
                          'form', 'pin', 'id_check', 'reason')),
  requirement_key       TEXT,            -- which rule it satisfies; null for extra evidence
  is_unavailable        BOOLEAN NOT NULL DEFAULT FALSE,  -- the explained exception
  unavailable_note      TEXT,
  file_key              TEXT,            -- object storage: the photo, the signature strokes
  sha256                BYTEA,           -- computed on the device at capture
  capture_source        TEXT CHECK (capture_source IN ('camera', 'library', 'scanner', 'typed')),
  form_answer_set_id    UUID REFERENCES form_answer_sets (id),
  signer_name           TEXT,
  signer_relationship   TEXT,            -- account holder, tenant, property manager, neighbor
  signed_content_sha256 BYTEA,           -- the screen the signer saw
  location              GEOGRAPHY(POINT),
  accuracy_m            REAL,
  staff_member_id       UUID REFERENCES staff_members (id),
  device_recorded_at    TIMESTAMPTZ NOT NULL,
  received_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (NOT is_unavailable OR unavailable_note IS NOT NULL)
);

ALTER TABLE visits
  ADD COLUMN evidence_rules_applied JSONB,  -- the resolved rules, snapshotted at completion
  ADD COLUMN completion_source      TEXT CHECK (completion_source IN ('field', 'office')),
  ADD COLUMN sealed_at              TIMESTAMPTZ;

CREATE TABLE service_reports (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  visit_id          UUID NOT NULL REFERENCES visits (id),
  visit_version     INTEGER NOT NULL,     -- the sealed version it rendered
  revises_report_id UUID REFERENCES service_reports (id),
  audience          TEXT NOT NULL,        -- customer, water_system, fire_authority, manufacturer
  file_key          TEXT NOT NULL,
  sha256            BYTEA NOT NULL,
  sent_at           TIMESTAMPTZ
);
```

Completion checks `visit_evidence` against the resolved rules on the device and again on the server, then writes the snapshot and seals the visit. After `sealed_at`, changes are amendments with a reason ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)), and a corrected report is a new `service_reports` row pointing at the one it revises. A dispute package is a query over these tables by payment and billing period.

## Auditing

Proof of service is itself an audit record, so the field-specific points are about the proof's own history:

- **Requirement snapshot:** which evidence rules applied to the visit, and which were satisfied by an explained exception.
- **Completion source:** who completed the visit or marked it `not_completed`, field or office, with the reason and the evidence present at the time.
- **Exports:** every dispute package, inspection export and report sent to a third party (water system, fire authority, manufacturer), with what it contained.

The general record shape, access logging and tamper evidence are in [Audit Trails](/docs/architecture/audit-trails); retention periods for field records and producing them for an inspection or a lawsuit are in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Model proof as structured, typed evidence on the visit,** not loose attachments: timestamps, location with accuracy, photos with hashes, signatures with signer and content, scans, readings, parts and products.
- **Resolve evidence requirements from company to visit,** enforce them on the device and the server, allow explained exceptions, and snapshot the rules applied.
- **Treat `not_completed` and `cancelled` as end states with their own evidence,** with one reason catalog that drives billing, rescheduling and notifications, and keep unfinished work on the work order's `hold_reason`.
- **Bind signatures to what was signed,** with signer name, relationship, time and place.
- **Render reports from sealed versions,** keep every report the customer or a third party was sent.
- **Generate dispute packages from the record** by payment and billing period, mapped to the processor's evidence fields.
- **Amend by new version and label office completions,** and copy any vendor evidence whose links expire.

## References

**Specifications**

- [15 U.S.C. 7001: General rule of validity](https://www.law.cornell.edu/uscode/text/15/7001), electronic signatures given legal effect, and retained electronic records that are accurate and reproducible

**Reference**

- [Stripe: Update a dispute](https://docs.stripe.com/api/disputes/update), dispute evidence fields including service date, service documentation, customer signature and cancellation policy
- [Salesforce: Field Service Developer Guide (PDF)](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), `DigitalSignature` and `ServiceReport` objects
- [Microsoft Learn: Work order and booking statuses](https://learn.microsoft.com/en-us/dynamics365/field-service/work-order-status-booking-status), Completed and Posted
- [Microsoft Learn: Manage Dataverse auditing](https://learn.microsoft.com/en-us/power-platform/admin/manage-dataverse-auditing), update logs when values change

**In practice**

- [Onfleet: Completion requirements](https://docs.onfleet.com/reference/completion-requirements), per-task signature, photo, notes, minimum age and PIN
- [Onfleet: Proof of delivery retrieval](https://docs.onfleet.com/reference/proof-of-delivery-retrieval), signature and photo upload IDs from the task webhook
- [Onfleet: Complete a task](https://intercom.help/onfleet-4f83d83093ac/en/articles/15254816), completion location, failure reasons and force complete
- [Onfleet: Custom task completion reasons](https://intercom.help/onfleet-4f83d83093ac/en/articles/15254791-custom-task-completion-reasons), admin-defined reasons with required notes, not applied to completed tasks
- [Bringg: Driver actions in order flows](https://help.bringg.com/docs/set-up-driver-actions-in-order-flows), signature, picture, scan and PIN steps, optional or mandatory before checkout
- [Bringg: Waypoint object](https://developers.bringg.com/reference/way-points-object), check-in and check-out times, coordinates and automatic flags
- [eLogii: Proof of delivery](https://intercom.help/elogii/en/articles/5352598-proof-of-delivery), evidence types, required per pickup, delivery and failure, and capture location
- [eLogii: Task history](https://help.elogii.com/en/articles/5623895-task-history), state and data updates that cannot be altered
- [eLogii: Task fail](https://help.elogii.com/en/articles/5645482-task-fail), failure reasons from drivers and operators and failed-reason analytics
- [Track-POD: API specification](https://api.track-pod.com/swagger/v1/swagger.json), photo links valid for 24 hours
- [Locate2u: Proof of delivery](https://locate2u.com/products/proof-of-delivery/), vector signatures and timestamped, geotagged photos
- [FarEye: Self guide](https://developer.fareyeconnect.com/self-guide.html), proof entries with received by and relationship
- [Tookan: API blueprint](https://jsapi.apiary.io/apis/tookanapi.apib), the completed-by-admin flag
- [ServiceTitan: Field Mobile App offline capabilities](https://help.servicetitan.com/docs/servicetitan-field-mobile-app-offline-capabilities), on-device signatures for invoices, estimates and change authorizations
- [measureQuick: ServiceTitan (v2) integration](https://support.measurequick.com/portal/en/kb/articles/servicetitan-v2-integration-with-measurequick), test reports and photos attached to the job
- [ServiceTrade: AAA Fire Protection case study](https://servicetrade.com/resources/case-studies/aaa-fire-protection/), one digital inspection sent to each jurisdiction in its format
- [ServiceTrade: Service portal](https://www.servicetrade.com/features/service-portal/), choosing which job media each customer sees
- [Solea: Chemical tracking](https://www.solea.ai/product/chemical-tracking), EPA registration numbers and active ingredients printed on the field report
- [Swept: Janitorial inspection software](https://sweptworks.com/janitorial-inspection-software), required photos on critical items and timestamped photos
- [Pool Brain: Features](https://www.poolbrain.com/features/), service reports emailed at completion (marketing)
- [Skimmer](https://www.getskimmer.com/), pool service reports (marketing)
- [FieldRoutes: Navigating the customer portal](https://knowledgebase.fieldroutes.com/docs/navigating-the-customer-portal.md), serviced appointment history with products used
