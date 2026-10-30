+++
title = "Operations, Support & Downtime"
description = "Support access to PHI, downtime and incident notices to practices, uptime and dependencies, on-call, breach clocks, and correcting data in clinical records."
category = "Health Tech Industry"
order = 1962
part = "Running the Platform"
tags = ["health-tech", "operations", "support", "downtime", "incident-response", "hipaa"]
+++

Running a health platform is ordinary SaaS operations with three differences that change the daily work. The customers can't wait: a dental office with a full schedule and a broken phone system loses the morning's calls, and a clinic whose reminders stopped finds out from the empty chairs. The support team works inside PHI: nearly every ticket ("this patient didn't get her reminder," "the balance is wrong," "the form didn't save to the chart") is about a named patient, so every support action is an access to protected health information that HIPAA expects to be justified and logged. And the platform is a business associate, so an incident that touches PHI starts regulatory clocks that run to the practice, and through it to patients, HHS and sometimes the press.

This chapter covers how the platforms present their operations, support access to PHI, downtime from the practice's side, uptime and the dependency chain, incidents and breach notification as a business associate, on-call for a product practices can't do without, and correcting data in records that are legal documents. The general practices are the playbook's ([Support Access](/docs/security/support-access), [Incident Response](/docs/operations/incident-response), [On-Call](/docs/operations/on-call), [SLOs](/docs/operations/slos), [Disaster Recovery](/docs/operations/disaster-recovery), [Customer Support](/docs/operations/customer-support)); the providers' side of outages and status pages is the Hosting & Cloud volume's [Outages & Status Pages](/books/hosting-and-cloud/outages-and-status-pages). It extends the playbook's `support_sessions` and adds `practice_notices` and `data_corrections` to the core data model in [The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from public status pages and documentation:

| Platform | What its status page shows | What it says about dependencies or downtime |
| --- | --- | --- |
| **Weave** | Eleven components: phone service, SMS, automated schedule reminders, reviews, call recording, email marketing, fax, mobile app, desktop application, payments and the portal | Components are the features a front desk uses, not the services behind them |
| **NexHealth** | Patient experience site, developer portal, authentication, analytics, practice overview, scheduling, practice financials, sandbox, patient communications, and a Synchronizer group of 16 components | The sync to each practice management system family is a component of its own |
| **DrChrono** | The web EHR, iPad EHR, check-in kiosk, telehealth, the patient app and portal, and a third-party group naming its vendors: fax, two-factor authentication, payments, SMS, file storage, clearinghouses (Change Healthcare, TriZetto, Waystar), labs (Quest, Labcorp), Health Gorilla, ID.me | Upstream vendors are listed by name, so a practice can see a clearinghouse outage as one |
| **Epic (as a hospital runs it)** | Each health system runs its own downtime process | Business Continuity Access: a read-only copy containing "all documentation, orders, results, etc., up to the moment the system went down," downtime reports printed from designated BCA PCs, paper during the outage and re-entry after |

Three patterns run through the table:

- **Status is reported in the practice's vocabulary.** "Phones," "reminders," "sync with my PMS," not "message queue" or "us-east-1." The question a practice asks is whether its front desk works.
- **The dependency chain is part of the product.** A clearinghouse, a lab interface, a carrier or the practice's own server can each break a feature, and the platforms that name their dependencies spare their support line the calls.
- **Downtime is planned for, not only prevented.** Hospitals run read-only copies and printed reports because they expect outages; a small practice has nothing like it unless its vendors give it something.

## Support Access to PHI

The playbook's model is the starting point: delegation instead of impersonation, read-only and masked by default, a reason for every session, visible to both sides, time-boxed, approved by someone else for anything stronger, and logged ([Delegation, Not Impersonation](/docs/security/support-access#delegation-not-impersonation)). The health specifics:

- **The reason is a treatment, payment or operations purpose, and a ticket.** HIPAA lets a business associate use PHI only as its agreement permits, which is to perform services for the practice; a support session opened against a practice's ticket is that, and browsing isn't. Texas's SB 1188 states the expectation directly for EHR data of Texas residents: accessible "only to individuals who require the information to perform duties" within the scope of their employment related to treatment, payment or operations. The ticket ID and reason code are mandatory fields, not notes.
- **Scope to the patient in the ticket.** A session opens on the practice and, where the ticket names one, on the patient; the support console shows that patient's appointments, messages and ledger, not a search box over the practice's whole population. A reveal of a field beyond the masked view (a full date of birth, a clinical note, a message body) is its own logged action.
- **Clinical content is a separate tier.** Most tickets need operational data (was the reminder sent, what did the PMS return, which balance did the statement use). Notes, images, and labeled sensitive records (Part 2, reproductive, mental health) need a higher access level, an approver, and a shorter window, and many tickets can be solved without them.
- **The practice can see who looked.** An access log in the practice's admin settings, listing which of your staff accessed which patient, when and under which ticket, lets the practice's privacy officer answer a patient's question and is the control that deters misuse ([Visible to Both Sides](/docs/security/support-access#visible-to-both-sides)).
- **Screenshots and pasted PHI are data too.** Practices paste patient details into tickets and email; the ticketing system needs a BAA, retention that matches the record, and redaction of attachments when the ticket closes ([Complaints With Legal Clocks](/docs/operations/customer-support#complaints-with-legal-clocks) covers the support side of records with deadlines).
- **Offshore support is a contract question first.** Some practices' BAAs restrict where PHI may be accessed, and Texas now requires records to be stored in the US; route tickets for tenants with such terms to staff who satisfy them, and enforce it in the session check rather than a policy document.

## Downtime From the Practice's Side

An outage looks different at the front desk than in the dashboard. What a practice needs, and what to build for it:

- **A downtime kit, from the vendor.** Hospitals print downtime reports from dedicated PCs: Houston Methodist's guide for affiliated practices lists the clinical summary and the daily appointment report, and tells staff to document on paper and enter it into Epic afterward. A small practice running a cloud platform gets the equivalent only if the platform provides it: a daily schedule export the office can print or open offline, the day's patient phone numbers, and a printable intake form. Generate it every morning whether or not anything breaks.
- **The PMS is the practice's own downtime system.** For engagement and communications platforms, the practice management system on the office server usually keeps working when the cloud product doesn't; the outage is reminders not sent, texts not delivered, calls not ringing. The runbook says which features fail, which have a fallback (phone service forwarding to a cell number, for example) and what the practice should do manually.
- **Catch-up is a deliberate act.** When reminders resume, the queue holds messages for appointments that already happened and confirmations that are no longer true. Sending the backlog blindly texts patients about yesterday; the recovery step re-evaluates each queued message against the current schedule and drops the stale ones ([When Processing Fails](/docs/architecture/events#when-processing-fails)).
- **Re-entry is reconciliation.** Payments taken on paper, forms filled on clipboards and appointments booked by phone during the outage are entered after, and the sync's drift check is the tool that catches what was missed ([Health Tech Architecture](/books/health-tech/health-tech-architecture)'s [Sync and Integration Layer](/books/health-tech/health-tech-architecture#the-sync-and-integration-layer)).
- **Scheduled maintenance avoids clinic hours,** across every time zone the tenants are in, and is announced to the people who run the front desk, not only to the account owner.

## Uptime and the Dependency Chain

A practice's experience depends on a chain: its own internet and server, the sync agent, the platform, its carriers and messaging providers, the PMS vendor's APIs, the clearinghouse, the payment processor. Two consequences:

- **Measure the practice's journey, not the service.** The SLIs that matter are per feature and per tenant: the share of reminders sent on time, the share of inbound calls answered by the platform, sync freshness per practice, claim submission success ([Choosing SLIs](/docs/operations/slos#choosing-slis)). A platform at 99.95% that hasn't synced with one practice's server for three days has failed that practice completely.
- **Separate your outages from theirs.** A practice's offline server, a PMS vendor's API incident, a carrier filtering texts and a clearinghouse outage each look like your product failing. Per-tenant health (the agent's heartbeat, the PMS API's error rate, delivery receipts by carrier) lets support say which link broke, and a status page that names upstream dependencies the way DrChrono does lets practices see it without calling.

The clearinghouse is the dependency that taught the industry this. The ransomware attack on Change Healthcare in February 2024 "set off weeks of disruptions for the healthcare sector," and on July 31, 2025 Change Healthcare told HHS's Office for Civil Rights that approximately 192.7 million individuals were affected. Platforms that had a second clearinghouse connection, or could switch submission paths per payer, kept their customers' claims moving; [Clearinghouses](/books/health-tech/clearinghouses#switching-clearinghouses) covers switching, and the lesson for operations is that a single upstream for a revenue-critical flow is a risk to write down and test.

Contract uptime commitments in this industry vary widely and are rarely published; my default is to offer a monthly commitment per feature class (communications, scheduling sync, billing), measured by the SLIs above, with credits, and to publish the history on the status page.

## Incidents and Breach Clocks

An incident at a health platform is two incidents at once: the operational one (restore the service) and, if PHI may have been exposed, the regulatory one. The playbook's process runs the first ([Declare Early](/docs/operations/incident-response#declare-early)); the second has its own clock:

- **Security incident procedures are required.** The Security Rule requires a business associate to "identify and respond to suspected or known security incidents," mitigate harmful effects where practicable, and document incidents and outcomes (45 CFR 164.308(a)(6)). Every incident that might involve PHI gets a privacy assessment, documented even when the answer is "no PHI involved."
- **The business associate notifies the practice.** A breach of unsecured PHI is reported to each affected covered entity "without unreasonable delay and in no case later than 60 calendar days after discovery," with "the identification of each individual" affected, to the extent possible (45 CFR 164.410). A BAA can set a shorter deadline, and the shortest contractual deadline across the affected tenants is the real clock.
- **Discovery is earlier than you think.** The clock starts when the breach is known or would have been known with reasonable diligence ([The Three Rules](/docs/compliance/hipaa#the-three-rules)); an alert nobody read starts it.
- **Notices are per tenant.** One incident across 2,000 practices is 2,000 covered entities, each needing its own list of affected patients, its own facts and its own deadline. Build the per-tenant impact query before you need it; it's the hardest part of the response to do by hand.
- **The practice is responsible for notifying patients and HHS,** and may delegate the task. OCR's Change Healthcare guidance says a covered entity "may delegate to its business associate" the notifications, with only one entity sending them, and that the covered entity's 60-day period wouldn't start until it had received the information it needed from the business associate. Who sends which notice is a contract term to settle before an incident, not during one.

Encryption decides much of this: PHI encrypted in line with HHS guidance isn't "unsecured," and its loss isn't a reportable breach ([The Three Rules](/docs/compliance/hipaa#the-three-rules)).

## Contingency Planning

The Security Rule's contingency plan standard is the regulatory version of disaster recovery, and three of its specifications are required: a data backup plan ("retrievable exact copies"), a disaster recovery plan to "restore any loss of data," and an emergency mode operation plan that keeps critical processes running while protecting ePHI; testing and an applications and data criticality analysis are addressable (45 CFR 164.308(a)(7)). For a platform:

- **Rank features by clinical and financial criticality.** Appointment reminders, phones and claim submission come back before reviews and marketing email; the criticality analysis is the order of the recovery runbook ([Set Targets From Impact](/docs/operations/disaster-recovery#set-targets-from-impact)).
- **Restore tests are the evidence.** A backup never restored isn't a plan ([Restores Are What Matter](/docs/operations/disaster-recovery#restores-are-what-matter)); run restores per tenant, since a single-practice restore after a data-damaging bug is the common case.
- **Emergency mode includes the practice.** The downtime kit and the fallback routing above are the practice-facing half of the emergency mode plan, and the BAA usually asks for evidence of both.

## On-Call for Practices

On-call follows the playbook ([Rotations](/docs/operations/on-call#rotations)) with three adjustments. Clinic hours run early mornings, evenings and Saturdays across every US time zone, and some specialties (veterinary emergency, urgent care) run all night, so business-hours coverage ends at the latest tenant's closing time, not the office's. Runbooks name the PHI rules (which tools the on-call engineer may open, how to start a break-glass session, what never goes in the incident channel). And the first page for a sync or communications failure goes to someone who can tell a practice what to do in the next ten minutes, not only someone who can fix the queue.

## Correcting Data in Clinical Records

Support and engineering fix data constantly: a duplicate patient from a bad sync, an appointment written to the wrong operatory, a payment posted twice, a form saved to the wrong chart. In a health record those fixes have rules:

- **The patient's amendment right is the practice's, not yours.** HIPAA gives patients a right to request amendment, which the covered entity must act on "no later than 60 days after receipt," with one 30-day extension, and which ends either in an amendment linked to the records or a written denial with the patient's right to file a statement of disagreement (45 CFR 164.526). A vendor never decides those; it gives the practice the tools to append, link and disclose them.
- **Vendor fixes are corrections with provenance.** When the error is the platform's (a sync bug, a mapping mistake), the fix is a recorded correction: the before and after, the cause, who requested it at the practice, who approved it, and whether the corrected data was already sent anywhere (a claim, a reminder, an exchange partner). Never an `UPDATE` in a console ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Misfiled PHI is a possible disclosure.** A form saved to the wrong patient's chart, or a message sent to the wrong patient, may be an impermissible disclosure; the correction workflow flags it for the practice's privacy assessment instead of quietly moving the record.
- **Merges are reversible.** Duplicate patients created by a sync are merged with the record linkage playbook's recorded, reversible merges, because the wrong merge (two different people with the same name and birth date) is worse than the duplicate ([Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible)); [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity) covers matching itself.
- **Corrections propagate.** A fix in the platform that doesn't reach the PMS is undone by the next sync; a fix in the PMS that the platform's cache misses keeps sending the wrong data. The correction records which systems it was applied to.

## How to Build It

The playbook's `support_sessions` gains the patient scope and the PHI tier; notices to practices and data corrections become rows:

```sql
ALTER TABLE support_sessions
  ADD COLUMN patient_id     UUID REFERENCES patients (id),   -- the patient in the ticket, if any
  ADD COLUMN phi_tier       TEXT NOT NULL DEFAULT 'operational'
    CHECK (phi_tier IN ('operational', 'clinical', 'sensitive')),
  ADD COLUMN reveals        INT NOT NULL DEFAULT 0,           -- unmasking actions in the session
  ADD COLUMN staff_location TEXT;                             -- country of access, for contract terms

CREATE TABLE practice_notices (          -- what a tenant was told, about what, and when
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL REFERENCES organizations (id),
  incident_ref     TEXT NOT NULL,          -- the incident in the incident tracker
  kind             TEXT NOT NULL CHECK (kind IN ('maintenance', 'degradation', 'outage',
                     'security_incident', 'breach_notice', 'resolved')),
  features         TEXT[] NOT NULL,        -- 'reminders', 'phones', 'pms_sync', 'claims'
  phi_involved     TEXT NOT NULL CHECK (phi_involved IN ('no', 'under_assessment', 'yes')),
  affected_patients INT,                   -- for breach notices, from the impact query
  patient_list_ref TEXT,                   -- encrypted object key of the identification list
  contract_deadline TIMESTAMPTZ,           -- the BAA's notice deadline for this tenant
  discovered_at    TIMESTAMPTZ,            -- for breach notices, the clock's start
  sent_at          TIMESTAMPTZ,
  sent_to          TEXT[] NOT NULL,        -- privacy officer, account owner, office managers
  body_ref         TEXT NOT NULL           -- the notice as sent
);

CREATE TABLE data_corrections (          -- a vendor-side fix to a tenant's records
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL REFERENCES organizations (id),
  ticket_ref       TEXT NOT NULL,
  requested_by     TEXT NOT NULL,          -- the practice user who asked
  approved_by      UUID NOT NULL,          -- staff, never the person executing it
  executed_by      UUID NOT NULL,
  cause            TEXT NOT NULL CHECK (cause IN ('sync_defect', 'mapping_error', 'user_error',
                     'duplicate', 'misfiled', 'migration')),
  records          JSONB NOT NULL,         -- [{table, id, before_ref, after_ref}]
  possible_disclosure BOOLEAN NOT NULL DEFAULT FALSE,  -- misfiled or misdirected PHI
  propagated_to    TEXT[] NOT NULL DEFAULT '{}',       -- 'pms', 'clearinghouse', 'hie'
  executed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (approved_by <> executed_by)
);
```

The per-tenant impact list for an incident window, from the audit store the [architecture chapter](/books/health-tech/health-tech-architecture#audit-everywhere) extends:

```sql
-- Patients whose records were read by an actor or path implicated in the incident.
SELECT a.tenant_id, COUNT(DISTINCT a.patient_id) AS patients
FROM audit_events a
WHERE a.occurred_at BETWEEN $1 AND $2
  AND a.actor_ref = ANY ($3)              -- the compromised credential, service or session
  AND a.patient_id IS NOT NULL
GROUP BY a.tenant_id
ORDER BY patients DESC;
```

Design notes:

- **The session check enforces the tier.** A `clinical` or `sensitive` session requires an approver distinct from the staff member, as the playbook's constraint already does for elevated access, and a shorter `expires_at`; `sensitive` also checks the record's labels.
- **Notices are rows, not emails.** `practice_notices` holds what was sent to whom and when, so the question "did we notify this practice within its BAA's deadline" is a query, and a regulator's or customer's request for the timeline is an export.
- **The impact query depends on read auditing.** Without access events keyed by patient, the identification a business associate owes the practice is a guess; this is where the audit design pays.
- **A correction is two people.** The check constraint keeps the person who executes a fix from being the one who approved it, the same separation as the support session.
- **Emit `practice_notice.sent`, `data_correction.executed` and `data_correction.possible_disclosure`;** the last opens a privacy review task for the practice's privacy officer.

## Auditing

- **Every support session,** with ticket, reason, tier, patient, approver, reveals and duration, visible to the practice.
- **Every notice to every practice,** with its content, recipients, time and the deadline it answered.
- **Every incident's privacy assessment,** including the ones that found no PHI.
- **Every data correction,** before and after, cause, requester, approver and where it propagated.
- **Every restore test and contingency exercise,** with results, for the BAA's evidence requests.

## What This Means for the System You Build

- **Report status in the practice's words** and name your upstream dependencies.
- **Give practices a daily downtime kit,** and re-evaluate queued messages before sending a backlog.
- **Measure per tenant and per feature:** reminders on time, calls answered, sync freshness.
- **Scope support sessions to a ticket and a patient,** tier clinical access, and show the practice who looked.
- **Know every tenant's BAA notice deadline** and build the per-tenant impact query before an incident.
- **Plan contingency by criticality** and prove restores per tenant.
- **Cover clinic hours across every time zone** in on-call.
- **Correct data with provenance and two people,** flag misfiled PHI as a possible disclosure, and leave amendments to the practice.

## References

**Regulation**

- [45 CFR 164.308: Administrative safeguards (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.308), security incident procedures and the contingency plan's required and addressable specifications
- [45 CFR 164.410: Notification by a business associate (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.410), the 60-day limit and identification of individuals
- [45 CFR 164.526: Amendment of protected health information (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.526), timing, acceptance, denial and statements of disagreement
- [Texas Legislature: SB 1188, enrolled text (89th Legislature)](https://capitol.texas.gov/tlodocs/89R/billtext/html/SB01188F.htm), access limited to treatment, payment and operations duties, and US storage

**Status pages and downtime**

- [Weave: Status](https://status.getweave.com/), the component list
- [NexHealth: Status](https://status.nexhealth.com/), components and the Synchronizer group
- [DrChrono: Status](https://status.drchrono.com/), product components and named third-party dependencies
- [Houston Methodist: Community Connect Epic BCA downtime quick reference guide (June 2021)](https://it.houstonmethodist.org/wp-content/uploads/2021/07/CC-Epic-BCA-Downtime-Guide_Final_Wave-1_060821.pdf), downtime kits, read-only access, downtime reports and re-entry

**In practice**

- [HHS OCR: Change Healthcare cybersecurity incident FAQ](https://www.hhs.gov/hipaa/for-professionals/special-topics/change-healthcare-cybersecurity-incident-frequently-asked-questions/index.html), delegation of notifications, when the 60-day period starts, and the counts reported to OCR through July 31, 2025
- [Healthcare Dive: Change Healthcare cyberattack affected about 190 million people (January 27, 2025)](https://www.healthcaredive.com/news/change-healthcare-cyberattack-affects-190-million-unitedhealth/738351/), the February 2024 attack, its disruption and the count
