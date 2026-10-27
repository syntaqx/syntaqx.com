+++
title = "Audit Trails & Records"
description = "Audit trails applied to field service: who asks for records, what vendors expose, field retention, snapshots, e-sign evidence, offline capture and production."
category = "Field Operations Industry"
order = 1520
part = "The Rules"
tags = ["field-operations", "compliance", "audit", "records", "retention"]
+++

A field operation runs on claims about the past. The technician says the treatment happened at 2:14 p.m. with this product at this rate. The customer says she cancelled on the second day. The office says the price went up with 30 days' notice. The rep says that sale was his. The technician says he worked through lunch and drove between six stops. Each claim eventually lands in front of someone who doesn't take the company's word for it: a card issuer deciding a dispute, a state pesticide inspector, an attorney general's investigator, a wage-and-hour plaintiff, a commission arbitrator, a judge. What wins is a record made at the time, by the system, that nobody could quietly change afterwards.

That's harder in this industry than in most. The work happens offline, on phones, by people paid by the stop or the sale, with prices, product labels and licenses that change underneath the records that refer to them. The general design of an audit trail (what a record holds, typed actors, capture in the same transaction, amendments instead of edits, tamper evidence, access logging and production) is in [Audit Trails](/docs/architecture/audit-trails), and retention mechanics are in [Data Retention & Deletion](/docs/architecture/data-retention). This chapter applies them to field service: who asks for records, what the field platforms expose, which field records have which retention rules, what to snapshot, and how offline work and inspections change the details.

## Who Asks, and What They Ask For

| Who asks | What they want to see | What it hangs on |
| -------- | --------------------- | ---------------- |
| **Card issuer, via a dispute** | Proof of authorization, service delivered, cancellation terms the customer agreed to | Signed agreement, proof-of-service photos and timestamps, cancellation history ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)) |
| **Pesticide regulator** | Each application: product, EPA registration number, amount, site, time, applicator and license | State record rules, such as Minnesota's five years for structural applications; federal restricted-use records, at least two years ([Regulated Materials](/books/field-operations/regulated-materials)) |
| **Refrigerant inspector or equipment owner** | Refrigerant added or recovered, leak inspections, technician certification | EPA's Section 608 and AIM Act leak-repair records ([Regulated Materials](/books/field-operations/regulated-materials)) |
| **Consumer-law investigator or plaintiff** | Consent and its source, notices delivered, opt-outs honored, cancellation receipt times | State home-solicitation and renewal laws, TCPA ([Consumer Protection](/books/field-operations/consumer-protection)) |
| **Wage-and-hour claimant or the DOL** | Clock events, travel between stops, edits to time | FLSA record rules; travel from job site to job site is work time |
| **A sales rep, about commissions** | Who sold it, what it was sold for, whether it cancelled, and every adjustment | [Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions) |
| **Anyone, about an AI decision** | What the AI was told, what it did, and who approved it | [AI in Field Operations](/books/field-operations/ai-in-field-operations) |
| **Security and the auditor** | Logins, permission changes, exports, access to sensitive data | [SOC 2](/docs/compliance/soc-2) |

Labor claims deserve emphasis because field work generates them. Under the FLSA, employers keep payroll records for three years and time cards and wage-rate tables for two, and travel from one job site to the next during the workday is work time. A system that lets a manager edit a clock-out without keeping the original value, the editor and a reason has destroyed the evidence the business most needs. Commission disputes are the same shape: a rep paid on sales that later cancel will ask for every state change on every account, and a commission statement that can't be reproduced from the record loses the argument.

And there's the everyday reason: **debugging**. "Why did this customer's April visit disappear?" is answered by a history that shows the recurrence was edited, by whom, from which screen, and what the generator did next.

## What the Platforms Expose

Every major platform keeps some history; what differs is coverage, retention, exportability and whether it can be altered.

| Platform | What it records | Limits stated in its docs |
| -------- | --------------- | ------------------------- |
| **ServiceTitan** | A customer and location audit trail: user, field, timestamp, old and new values, for name, type, address, payment terms, tags, notes, attachments, tax zone, preferred technician and deactivation | Needs View customer and View location permissions |
| **FieldRoutes** | A Change Log Report across entities (appointments, customers, employees, tickets, payments) with date, office, employee and change; Employee ID 0 marks a system change such as a trigger rule. SMS consent changes on the customer card | At least one filter required; exports to CSV |
| **Housecall Pro** | Activity feeds globally, per customer and per job: scheduling, dispatch, status, commission changes, payments including failed and automatic charges, service plan lifecycle, failed messages | Employee and device shown on some entries, not all |
| **Jobber** | An activity feed of quotes, jobs, visits, invoices, payments and notes | The most recent 100 notifications; kept up to a year from the account's latest activity |
| **ServiceM8** | An account activity log with action, user, IP address, location and time: deleted jobs and notes, removed payments, logins, role changes, client list downloads | Kept 90 days, can't be exported, and support isn't required to provide more |
| **eLogii** | Task history of state and data updates, each state change with its location | "Data from the Task history cannot be deleted or altered in any way," short of deleting the task |
| **Salesforce Field Service** | Field history tracking on objects | 20 fields per object; 18 months in the UI and 24 through the API; the Field Audit Trail add-on extends fields and retention |
| **Dynamics 365 (Dataverse)** | Auditing of create, update and delete, sharing, role changes, and optionally sign-ins and reads; an update is logged only when the value changes | Retention defaults to forever, configurable; export through the API only; a record's history can be deleted for a data-deletion request |
| **Geotab, Samsara** | Change feeds: Geotab's GetFeed supports an Audit type and re-sends modified records with a newer version; Samsara has audit-log feeds for routes and safety events | Plan-tiered; consumers must handle duplicates |

The pattern: SMB tools give an **activity feed** built for awareness, with short retention and no promise of completeness. Vertical and enterprise tools give **field-level history** with before and after values, configurable per object. Delivery and telematics vendors give **append-only event histories** with location, because proof of delivery is their product. The target combines the best of each: field-level before and after on every regulated entity, location on every field event, append-only by construction, retention by record type, exportable in bulk.

When you buy rather than build, ask each vendor four questions: which entities and fields are covered, how long history is kept, whether it can be exported in bulk, and whether anyone, including the vendor's support staff, can alter it. Then mirror what matters into storage you control through the vendor's change feed or API, because 90 days of activity in one tool and a year in another will be gone before the dispute arrives.

## What a Field Audit Record Adds

The record shape is the playbook's ([What a Record Holds](/docs/architecture/audit-trails#what-a-record-holds)): typed actor, before and after values, two timestamps, source, reason and the rules in force. Field work stresses three parts of it.

- **Where means GPS.** A field event carries the device's position and its accuracy, not just an IP address. "Were you even here?" is the first question in a service dispute, and a position with a 2,000-meter accuracy radius answers it differently from one at 8 meters.
- **When means two clocks.** The device records when it happened; the server records when it arrived. Offline work makes them differ by hours, and both matter. Minnesota, for one, requires a structural pest control application record to be completed no later than five days after the application, so the clock starts at the application time the device recorded, and the server's arrival time shows whether the record made it.
- **Who includes rules that ran.** FieldRoutes marks system changes with employee ID 0. Better is a typed actor that distinguishes a trigger rule, a scheduled job, an import, an AI agent and support staff acting for a user ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).

A manager correcting a technician's clock-out, the edit that wage claims turn on:

```json
{
  "id": "019a2f51-3c7d-7e20-9a41-5b6c7d8e9f01",
  "tenant_id": "0192f1d0-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
  "action": "time_entry.update",
  "entity": { "type": "time_entry", "id": "019a2b10-7e44-7a3c-8d21-0f1e2d3c4b5a" },
  "actor": { "type": "user", "id": "0198c3e2-7d4f-7a10-b2c3-d4e5f6a7b8c9", "on_behalf_of": null },
  "changes": {
    "clock_out_at": { "before": "2026-06-13T21:45:00Z", "after": "2026-06-13T20:30:00Z" }
  },
  "reason": "employee_forgot_to_clock_out",
  "source": { "app": "office-web", "version": "4.12.0", "ip": "203.0.113.7" },
  "location": null,
  "occurred_at": "2026-06-14T22:02:11Z",
  "received_at": "2026-06-14T22:02:15Z",
  "request_id": "019a2f51-3c70-7b11-8e2f-3a4b5c6d7e8f"
}
```

The original clock-out was recorded by the technician's device with its own location; the correction is a separate record by a different actor, with a reason. Both survive. Paying on the corrected value is fine; losing the original is not.

## Capturing It, Offline Included

Capture follows the playbook: an application audit entry in the same transaction as the change, row-level capture underneath for anything the application forgot, and a separate integration outbox that isn't the audit trail ([Capturing It](/docs/architecture/audit-trails#capturing-it), [Not Logs, Not Events](/docs/architecture/audit-trails#not-logs-not-events)).

![Every write produces an audit record in the same transaction: the application writes the business change and an audit entry with actor and reason, while row-level capture records before and after values. Both feed an append-only audit store that chains each record to the previous one by hash, then a write-once archive with retention by record type and legal holds. Reads of sensitive data are logged into the same store, and exports for an inspection or lawsuit come from it with a manifest of hashes.](/diagrams/fo-audit-trails-and-records-capture.svg "Two capture layers, one append-only store. Application entries carry intent and actor; row-level capture guarantees nothing is missed; the archive makes the history tamper-evident and holdable.")

The field-specific rule is that the technician app uploads its own events with `device_recorded_at`, a sequence number and location, and the server adds `received_at`; how sync and conflict resolution work is in [Offline-First Sync](/docs/architecture/offline-sync) and [The Technician App](/books/field-operations/technician-app).

## Snapshot What Changes Underneath You

A record that points at mutable data changes when the data does, so field records copy the values they used at the moment of the fact ([Audit Trails: Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you), [Temporal Data: Snapshots](/docs/database/temporal-data#snapshots)). The field cases:

- **Product labels.** A pesticide application records the product name, EPA registration number, active ingredient percentage and rate as applied, not only a foreign key to a product someone will edit when the label changes. Inspectors ask for the record as it was ([Regulated Materials](/books/field-operations/regulated-materials)).
- **Licenses.** The applicator's and supervisor's license numbers and expiry on the day of service, so a renewal or lapse later doesn't rewrite history ([Licenses & Permits](/books/field-operations/licensing-and-permits)).
- **Prices and tax.** An invoice line copies the price, discount and tax it used and names the pricebook version ([Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules)).
- **Documents and terms.** The exact agreement version, cancellation notice and disclosures the customer saw, as rendered files with a content hash.
- **Assignments.** Which rep, team and commission plan a sale belonged to when it closed, and which technician and vehicle performed the visit.
- **Weather.** The reading used for a spray decision, with its source and station distance, since tomorrow's weather API will report a different past.

## E-Signature Evidence

The evidence list for a signature (the document as presented and its hash, the consent record, signer identity evidence, timestamps, device, event trail, provider certificate and delivery) is in [Electronic Signatures & Records](/docs/compliance/electronic-signatures#what-the-evidence-holds). Two things are specific to the field.

**Consent before the cooling-off notice.** A door-to-door sale requires the cancellation notice in writing. Delivering it electronically needs the consumer's prior consent under ESIGN, given in a way that shows they can open the electronic form that will be used, so the consent comes first in the signing flow and its record keeps the disclosure version, the channel it was demonstrated on and the time ([Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first), [Signing the Agreement](/books/field-operations/signing-the-agreement)).

**Location and the rep's device.** A sale signed on the rep's tablet on the customer's porch is evidence of where the sale happened, which decides whether the Cooling-Off Rule applies. Record the device's GPS position and accuracy at signing, the rep who held the device, and the device ID, alongside the server timestamp.

## Retention by Record Type

Retention is a schedule keyed by record type, with the longest applicable rule winning and clocks that start at different events; the mechanics (trigger dates, schedules as data, legal holds) are in [Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type). The field records and their federal and sample state minimums:

| Record | Minimum | Rule |
| ------ | ------- | ---- |
| Driver vehicle inspection reports | 3 months | 49 CFR 396.11 |
| Hours-of-service records, where they apply | 6 months | 49 CFR 395.8 |
| Time cards, wage-rate tables, customer billing records | 2 years | 29 CFR 516.6 |
| Restricted-use pesticide application records | at least 2 years, by state plan | 40 CFR 171.303 |
| Regulation Z compliance evidence (financed jobs) | 2 years | 12 CFR 1026.25 |
| Payroll records | 3 years | 29 CFR 516.5 |
| Refrigerant leak-repair records (appliances with 15 lb or more, other than residential and light commercial AC) | 3 years | 40 CFR 84.106 |
| Collection records and call recordings (collectors) | 3 years | 12 CFR 1006.100 |
| California automatic renewal consent records | 3 years, or 1 after the contract ends if longer | Cal. Bus. & Prof. Code 17602 |
| TCPA consent records | 4 years after the last call or text that relied on them, the limitation period for a claim | 28 U.S.C. 1658 |
| Employment tax records | 4 years | IRS guidance |
| OSHA injury and illness logs | 5 years after the year | 29 CFR 1904.33 |
| Structural pest control applications (Minnesota) | 5 years after the date of treatment | Minn. Stat. 18B.37 |
| Do-not-call requests | honored for 5 years (an honoring period, not retention) | 47 CFR 64.1200(d)(6) |

The last row isn't a retention rule. A do-not-call request must be honored for five years from when it's made; that's how long the suppression stays in force, and the request record has to outlive it to prove the business did.

![Minimum retention periods for common field-service records drawn as bars: vehicle inspection reports at three months and hours-of-service logs at six; time cards, restricted-use pesticide records and Regulation Z evidence at two years; payroll, refrigerant leak-repair records, collection records and California renewal consent at three; TCPA consent records (four years after the last call) and employment tax at four; OSHA logs and Minnesota pest control records at five; and, drawn dashed because it is an honoring period rather than retention, do-not-call requests at five.](/diagrams/fo-audit-trails-and-records-retention.svg "Retention is a schedule by record type, not one number. These are federal and sample state minimums; the clock often starts at a later event, and litigation holds override all of them.")

Three cautions specific to the field. **State rules vary and are often longer:** pesticide, contractor, refrigerant and consumer records need counsel's per-state schedule, not this table, and one application record can fall under several states' rules when a business crosses a border. **Clocks start at different events:** the date of application, the end of the calendar year, the last collection activity, the contract's end, the date a technician leaves, so store the trigger date on the record. **A visit is several record types at once:** the application record, the time entries, the photos, the invoice and the signature each carry their own schedule, and purging "the visit" as one unit either keeps too much or destroys something a rule still requires.

## Access, Privacy and Tamper Evidence

**Log who looked, not just who changed.** Field data includes things worth stealing: gate codes, alarm instructions, lockbox combinations, when a house is empty, a customer list a departing rep would like to take. Dataverse can log reads and sign-ins separately from changes; ServiceM8 logs client list downloads with IP and location. At minimum, log every export, bulk download, view of access instructions or bank details, and support impersonation ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

**Privacy deletion keeps the fact.** A customer exercising a deletion right and a state requiring five years of pesticide records collide in the audit store. The CCPA lets a business keep information needed to comply with a legal obligation, among other exceptions. The design separates identity from facts: the application record keeps product, rate, address and date, while the name, phone and email in the personal-data store are removed or pseudonymized, and the deletion is itself recorded with what was kept under which exception ([Privacy Erasure and the Audit Store](/docs/architecture/audit-trails#privacy-erasure-and-the-audit-store)). Dataverse's per-record audit deletion shows the opposite tradeoff: it answers the request by removing history, which also removes evidence.

**Make it tamper-evident.** Append-only permissions, hash chains, write-once archives and alerts when logging stops are covered in [Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident). The commercial point for field vendors: eLogii's "cannot be deleted or altered" is a selling point to customers who've been through a dispute.

## Producing Records for an Inspection or a Lawsuit

Legal holds, scoped exports and hash manifests are covered in [Producing Records](/docs/architecture/audit-trails#producing-records). What the field adds is the shape of the request.

- **Inspector cuts.** Pesticide inspectors ask by applicator, product, date range, county or address; refrigerant questions come by appliance; labor investigators by employee and pay period; consumer investigators by rep, city and season. Build those exports before they're asked for, in readable formats (PDF for documents, CSV for records).
- **Local time, stated.** Render every time in the property's time zone and say which zone. A regulator reading UTC timestamps will conclude an application happened at midnight.

## What Goes Wrong

The general failures (partial field coverage, "system" as the actor, retention left in a vendor setting, purges that ignore holds) are listed in [Audit Trails](/docs/architecture/audit-trails#what-goes-wrong); in field work the missing field is usually the product rate or the clock-out time. What field records add:

- **Server time only,** so offline work shows the sync time and a technician appears to treat six houses in the same minute.
- **Foreign keys instead of snapshots,** so last year's application records change when this year's label or license does.
- **A visit purged as one unit,** taking a regulated application record with it.

## Auditing

The audit system's own record (schedule changes, holds, exports, chain checks, purges) is in [Auditing the Audit Trail](/docs/architecture/audit-trails#auditing-the-audit-trail). The field addition is the vendor side: when you mirror a vendor's change feed, record each sync's coverage and gaps, so you know which periods your copy can vouch for.

## What This Means for the System You Build

- **Field-level before and after history on every regulated entity:** agreements, prices, consent, applications, refrigerant movements, time entries, commissions and payments.
- **Device time, server time and GPS on every field event,** uploaded as recorded rather than invented at sync, with conflict resolutions recorded too.
- **Typed actors** that tell trigger rules, jobs, imports, AI agents and support impersonation apart.
- **Snapshots of labels, licenses, prices, documents, assignments and weather** at the moment of the fact.
- **E-signature evidence with location,** and electronic consent captured before any notice that law requires in writing.
- **A field retention schedule by record type,** with trigger dates, per-state overrides from counsel, and purges that treat a visit as several record types.
- **Access logging for gate codes, exports and impersonation,** and privacy deletion that keeps regulated facts and removes identity.
- **Ready-made exports for inspector and litigation cuts,** in local time with the zone stated, from snapshots, with hash manifests.
- **Vendor history mirrored into storage you control** when you buy rather than build.

## References

**Specifications**

- [15 U.S.C. 7001](https://www.law.cornell.edu/uscode/text/15/7001), ESIGN validity, consumer consent before electronic delivery of required writings, and electronic record retention
- [29 CFR 516.5](https://www.law.cornell.edu/cfr/text/29/516.5), three-year retention of FLSA payroll records
- [29 CFR 516.6](https://www.law.cornell.edu/cfr/text/29/516.6), two-year retention of time cards, wage-rate tables and billing records
- [29 CFR 785.38](https://www.law.cornell.edu/cfr/text/29/785.38), travel from job site to job site as work time
- [40 CFR 171.303](https://www.law.cornell.edu/cfr/text/40/171.303), state plan requirements for commercial applicators' restricted-use pesticide records
- [40 CFR 84.106: Leak repair](https://www.law.cornell.edu/cfr/text/40/84.106), leak inspection, refrigerant added and technician records kept at least three years for appliances with 15 pounds or more
- [Minn. Stat. 18B.37](https://www.revisor.mn.gov/statutes/cite/18B.37), structural pest control application records, completed within five days of the application and kept five years after the date of treatment
- [49 CFR 396.11](https://www.law.cornell.edu/cfr/text/49/396.11), three-month retention of driver vehicle inspection reports
- [49 CFR 395.8](https://www.law.cornell.edu/cfr/text/49/395.8), six-month retention of hours-of-service records
- [29 CFR 1904.33](https://www.law.cornell.edu/cfr/text/29/1904.33), five-year retention of OSHA injury and illness records
- [12 CFR 1026.25](https://www.law.cornell.edu/cfr/text/12/1026.25), Regulation Z record retention
- [12 CFR 1006.100](https://www.law.cornell.edu/cfr/text/12/1006.100), Regulation F record and call recording retention
- [47 CFR 64.1200](https://www.law.cornell.edu/cfr/text/47/64.1200), do-not-call requests honored for five years from when they're made
- [28 U.S.C. 1658](https://www.law.cornell.edu/uscode/text/28/1658), the four-year limitation period for claims under federal statutes enacted after 1990, such as the TCPA
- [Cal. Bus. & Prof. Code 17602](https://california.public.law/codes/business_and_professions_code_section_17602), California's automatic renewal consent records

**Reference**

- [IRS: How long should I keep records?](https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records), general and employment tax retention periods
- [Kilpatrick: California automatic renewal law amendments](https://ktslaw.com/en/insights/alert/2024/10/california-latest-automatic-renewal-law-amendments-take-effect-in-july-2025), AB 2863's consent record-keeping period
- [California Attorney General: CCPA](https://oag.ca.gov/privacy/ccpa), deletion rights and their exceptions

**In practice**

- [ServiceTitan: Audit Trail on customer and location records](https://help.servicetitan.com/docs/use-the-audit-trail-on-customer-and-location-records), field-level before and after values with user and time
- [FieldRoutes: Change Log Report](https://knowledgebase.fieldroutes.com/docs/change-log-report.md), cross-entity change history and system changes as employee ID 0
- [Housecall Pro: Activity Feed](https://help.housecallpro.com/en/articles/4154392-activity-feed), global, customer and job feeds with employee and device
- [Jobber: Activity feed](https://help.getjobber.com/es/articles/activity-feed/), recent notifications and their one-year retention
- [ServiceM8: Account activity](https://support.servicem8.com/help-center/desktop/more-on-the-online-dashboard/how-to-view-your-account-activity.md), 90-day access and action log with IP and location
- [eLogii: Task History](https://help.elogii.com/en/articles/5623895-task-history), unalterable task state and data history with locations
- [Salesforce Trailhead: Get started with Field Audit Trail](https://trailhead.salesforce.com/content/learn/modules/field-audit-trail-basics/get-started-with-field-audit-trail), field history limits and extended retention
- [Microsoft Learn: Manage Dataverse auditing](https://learn.microsoft.com/en-us/power-platform/admin/manage-dataverse-auditing), audited operations, retention settings, access logging and per-record history deletion
- [Geotab: GetFeed](https://developers.geotab.com/myGeotab/apiReference/methods/GetFeed/), versioned change feeds including the Audit type
- [Samsara: API and webhook access by plan](https://developers.samsara.com/docs/tiered-plans-for-api-and-webhook-access), audit-log feeds for routes and safety events
