+++
title = "Security for Health Data"
description = "Security for health records: ransomware and Change Healthcare, HHS 405(d) practices and CPGs, break-the-glass, access audits, device security, downtime."
category = "Health Tech Industry"
order = 1918
part = "Rules of the Record"
tags = ["health-tech", "security", "ransomware", "audit", "break-the-glass", "downtime"]
+++

Health care is the industry where a security failure stops work that can't wait. When a clearinghouse goes dark, practices can't check eligibility or get paid; when a hospital's EHR is encrypted by ransomware, clinicians go back to paper and ambulances go elsewhere; when a PMS server in a dental office's closet is hit, the schedule, the ledger and the X-rays are gone until a restore that may never have been tested. The data is also unusually valuable to steal and impossible to reissue, and the sector runs a long tail of small practices with no security staff on systems vendors installed a decade ago.

The playbook's [HIPAA](/docs/compliance/hipaa#what-it-means-for-a-system) lists the Security Rule's safeguards and what to build for each, and the general practices (threat modeling, encryption, authentication, vulnerability management, disaster recovery) live in the security and operations docs. This chapter is the health care layer: what the sector's attacks look like, the voluntary practices HHS publishes for it, access control that has to let a clinician in during an emergency, audit review that catches the employee reading a neighbor's chart, medical device rules, and running a practice when the systems are down.

## How the Platforms Do It

The security tooling specific to health care, as of October 2026, from each vendor's public pages:

| Vendor | What its public pages describe |
| --- | --- |
| **Imprivata** | Healthcare capabilities for patient privacy monitoring, drug diversion monitoring, medical device access management, biometric patient authentication and electronic prescribing for controlled substances, alongside single sign-on and privileged access security |
| **Bluesight** | Patient privacy monitoring to "surface privacy violations and strengthen compliance," drug diversion surveillance, and an AI assistant inside its privacy product for investigations and reporting |
| **Censinet** | Third-party risk management for healthcare: standardized vendor and product assessments, continuous monitoring, and peer benchmarking of cybersecurity maturity |

The categories say what the sector's own threats are. **Insiders reading records they shouldn't** need monitoring tuned to clinical workflows, because a nurse opening forty charts a shift is normal and a nurse opening a coworker's chart isn't. **Shared workstations** need fast sign-on (badge taps, biometrics), or clinicians share logins. **Controlled substances** need identity proofing and diversion surveillance. And **every vendor is a risk to assess,** because the hospital's attack surface is mostly other companies' software, which is why the questionnaire in [Security Reviews and Questionnaires](/books/health-tech/vendor-compliance-posture#security-reviews-and-questionnaires) arrives before any contract.

## Ransomware and the Sector

**Change Healthcare** is the event the sector measures itself against. UnitedHealth Group's 8-K, filed February 22, 2024, says that on February 21 it identified that "a suspected nation-state associated cyber security threat actor had gained access" to some Change Healthcare systems, and that it "proactively isolated the impacted systems." Change was one of the largest clearinghouses, so isolating it stopped eligibility checks, claims, remittances and pharmacy claims for providers across the country, many of whom had no second clearinghouse connection; the market effects (provider loans, CMS advance payments) are in [The Change Healthcare Attack](/books/health-tech/health-tech-landscape#the-change-healthcare-attack). The breach that followed is the largest on OCR's portal: Change reported about 190 million affected individuals in January 2025 and about 192.7 million on July 31, 2025. <!-- source-gap: change-healthcare-entry-and-ransom | missing | how the attackers entered (a remote access portal without multi-factor authentication, per the CEO's May 1, 2024 congressional testimony) and the ransom paid | closes with: the written testimony from the Senate Finance or House Energy and Commerce hearing, which returned 403 or bot challenges to retrieval | checked: 2026-10-29 -->

What the case taught, in terms a vendor can act on:

- **Concentration is the risk.** One clearinghouse, one EHR host, one patient engagement platform can sit under thousands of practices; its outage is theirs. A vendor's resilience is its customers' business continuity plan, whether or not either side wrote it down.
- **Isolation is the first response and the most expensive.** Disconnecting stops the spread and stops the business; the decision belongs in the incident runbook with its owner named ([Mitigate First, Diagnose Later](/docs/operations/incident-response#mitigate-first-diagnose-later)).
- **The breach notice is the long tail.** Counts were revised for over a year after the attack, across the practices whose data Change held ([Breach Notification and the Wall of Shame](/books/health-tech/hipaa-in-practice#breach-notification-and-the-wall-of-shame)).

OCR's enforcement shows the same pattern at small scale. Its resolution agreements since 2024 include a run of ransomware settlements (it counted its eighth and ninth ransomware settlements on January 7, 2025, and kept going: Syracuse ASC, BST & Co. CPAs, OSF HealthCare, Lehigh Valley Health Network in October 2026), and the corrective action plans repeat one demand: an accurate and thorough **risk analysis** with a complete inventory of systems touching ePHI, submitted to HHS for approval, followed by a risk management plan ([OCR Enforcement](/books/health-tech/hipaa-in-practice#ocr-enforcement)). Under the Breach Notification Rule an impermissible access is presumed a breach unless a documented assessment shows a low probability of compromise ([The Three Rules](/docs/compliance/hipaa#the-three-rules)), so data encrypted or exfiltrated by ransomware is a notification question by default.

## HHS 405(d): HICP and the Performance Goals

HHS publishes two voluntary frameworks written for the sector, and customers increasingly ask vendors to map to them.

**Health Industry Cybersecurity Practices (HICP),** 2023 edition, names five threats and ten practices. The threats: social engineering (renamed from email phishing), ransomware, loss or theft of equipment or data, insider accidental or malicious data loss, and attacks against network-connected medical devices. The practices: email protection systems, endpoint protection systems, access management, data protection and loss prevention, asset management, network management, vulnerability management, incident response, network-connected medical device security, and cybersecurity oversight and governance. Technical Volume 1 scales them for small organizations and Volume 2 for medium and large ones, which makes Volume 1 the practical baseline for a dental or veterinary practice and for the vendor supporting one.

**The Healthcare and Public Health Cybersecurity Performance Goals** are aligned with HICP and CISA's cross-sector goals, in two tiers:

| Essential (10) | Enhanced (10) |
| --- | --- |
| Mitigate known vulnerabilities | Asset inventory |
| Email security | Third-party vulnerability disclosure |
| Multifactor authentication | Third-party incident reporting |
| Basic cybersecurity training | Cybersecurity testing |
| Strong encryption | Cybersecurity mitigation |
| Revoke credentials for departing workforce members | Detect and respond to relevant threats and tactics |
| Basic incident planning and preparedness | Network segmentation |
| Unique credentials | Centralized log collection |
| Separate user and privileged accounts | Centralized incident planning and preparedness |
| Vendor/supplier cybersecurity requirements | Configuration management |

For a vendor, two of the enhanced goals are about you: customers want a published **vulnerability disclosure** process and contractual **incident reporting** to them ([Receiving Reports](/docs/security/vulnerability-management#receiving-reports)). The essential goals line up closely with the proposed Security Rule update (MFA, encryption, asset inventory), which as of October 2026 remains proposed ([The Pending Security Rule Update](/docs/compliance/hipaa#the-pending-security-rule-update)).

## Access Control and Break-the-Glass

The Security Rule's access control standard has four implementation specifications: **unique user identification** (required), an **emergency access procedure** (required), **automatic logoff** (addressable) and **encryption and decryption** (addressable) (45 CFR 164.312(a)). The emergency access procedure is the health care twist: a system must let an authorized clinician reach information they need in an emergency even when their normal permissions don't cover it. The industry's pattern for it is **break-the-glass**:

- **Normal access follows relationship.** A clinician sees patients they're treating, at their locations, through their roles; the playbook's least privilege applies ([Least Privilege](/docs/security/authorization#least-privilege)).
- **Break-the-glass is an explicit act.** The user asserts an emergency, picks a reason, sometimes re-authenticates, and gets time-limited access to that one patient. It's never a hidden admin role.
- **Every break is reviewed.** The access is logged with the reason, flagged for the privacy team, and reviewed after the fact; unjustified breaks are sanctions under the workforce sanction policy the Security Rule requires.
- **Some records stay sealed.** Sensitivity labels decide what break-the-glass can reveal: Part 2 records, for instance, have their own medical emergency rule ([Part 2: Substance Use Disorder Records](/books/health-tech/state-health-privacy#part-2-substance-use-disorder-records)).

Shared clinical workstations push the other specifications: automatic logoff that doesn't log a surgeon out mid-procedure, and sign-on fast enough that nobody shares a session, which is the market for badge-tap and biometric sign-on. Vendor staff are users too: support access to a practice's PHI is delegated, read-only by default, time-boxed and visible to the practice ([Support Access](/docs/security/support-access)).

## Access Reports and Audit Review

The Security Rule requires **audit controls** that record and examine activity in systems containing ePHI (164.312(b)) and procedures to **regularly review** records of system activity, such as audit logs, access reports and security incident tracking (164.308(a)(1)(ii)(D)). Writing the log is the easy half; the enforcement record is about review:

- **Snooping is the common insider case.** OCR's resolution agreements include hospital security guards reading medical records ($240,000, June 15, 2023) and terminated employees whose access wasn't removed (a city health department in 2020, a Colorado hospital in 2018). Reads matter as much as writes ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Review is pattern detection.** Same-surname access, coworker and VIP records, access outside a user's location or schedule, records opened with no appointment or encounter, bulk exports and prints. Privacy monitoring products automate this against EHR logs; a smaller platform can run the same rules on its own `audit_events`.
- **Patients ask who looked.** HHS proposed in May 2011 to give individuals an **access report** showing who accessed their electronic PHI in a designated record set; it hasn't been finalized. Some providers offer one anyway, and a system that logs reads by patient (the core `audit_events.patient_id`) can produce it as a query.
- **Departures are an access event.** Revoking credentials for departing workforce members is an essential CPG; a PMS user list synced from the practice's own HR process is how small practices actually get it done.

## Medical Device Security

Software that is a medical device, or runs inside one, has its own federal cybersecurity rules. The Consolidated Appropriations Act, 2023, signed December 29, 2022, added **section 524B** to the Food, Drug, and Cosmetic Act, effective March 29, 2023. A sponsor submitting a **cyber device** (one that includes software, can connect to the internet, and has characteristics that could be vulnerable to cybersecurity threats) must:

- submit a plan to monitor, identify and address postmarket vulnerabilities and exploits in a reasonable time, including coordinated vulnerability disclosure;
- design, develop and maintain processes that give reasonable assurance the device and related systems are cybersecure, with postmarket updates and patches on a regular cycle and out-of-cycle for critical vulnerabilities;
- provide a software bill of materials, including commercial, open-source and off-the-shelf components;
- meet any other requirements FDA sets by regulation.

FDA's premarket guidance, *Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submissions*, was finalized September 27, 2023 and replaced by an updated final version on June 27, 2025 that adds a section on 524B. For a practice software vendor this matters at the edges: imaging sensors, intraoral cameras and diagnostic AI that are devices bring SBOMs and patch obligations into the practice's network, and HICP's ninth practice is about segmenting and inventorying them. [Digital Health Apps & Devices](/books/health-tech/digital-health-and-devices#wellness-or-medical-device) covers when software becomes a device.

## Backups, Downtime and Recovery

The Security Rule's **contingency plan** has three required specifications (a data backup plan creating retrievable exact copies, a disaster recovery plan to restore lost data, and an emergency mode operation plan for continuing critical business processes) and two addressable ones (testing and revision, and applications and data criticality analysis) (164.308(a)(7)). The playbook covers targets, backups and restores ([Disaster Recovery](/docs/operations/disaster-recovery)); the health care additions are operational:

- **Downtime procedures are clinical procedures.** Practices and hospitals keep paper forms, printed schedules and read-only "downtime viewers" for when the EHR or PMS is unavailable, then **back-enter** what happened on paper when systems return. A vendor helps by producing a daily downtime extract (tomorrow's schedule, active patients' allergies and medications, balances) to a place the practice can read offline ([Offline-First Sync](/docs/architecture/offline-sync)).
- **The closet server is the weakest copy.** Many dental, optometry and veterinary practices still run a PMS database on a Windows server in the office; an encrypted server with backups on an attached drive loses both. Cloud-connected backup with an immutable copy, and a restore the practice has actually seen work, are what HICP Volume 1 asks of small organizations.
- **Restore order is the criticality analysis.** Scheduling and the clinical record come before reporting; eligibility and claims before marketing; the analysis decides which a vendor restores first.
- **Tell practices on a clock.** During a vendor outage, practices need to know whether to switch to downtime procedures; status pages and direct notice to each practice's admin are part of the contingency plan, not marketing ([Communicate on a Clock](/docs/operations/incident-response#communicate-on-a-clock)). [Operations, Support & Downtime](/books/health-tech/health-tech-operations#downtime-from-the-practice-s-side) covers the vendor's on-call and communications side.

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model) (`organizations`, `patients`, `audit_events`, `integrations`). The core `audit_events` table already carries `break_glass` as an action, a purpose, the patient as subject and a hash chain; this chapter adds the grants behind break-the-glass, the review cases audit monitoring opens, and the downtime and restore records:

```sql
CREATE TABLE emergency_access_grants (    -- break-the-glass: one user, one patient, a short window
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  user_id          UUID NOT NULL,
  patient_id       UUID NOT NULL REFERENCES patients (id),
  reason           TEXT NOT NULL CHECK (reason IN ('emergency_treatment', 'covering_provider',
                     'patient_request_in_person', 'other')),
  reason_text      TEXT,
  reauthenticated  BOOLEAN NOT NULL,
  excluded_categories TEXT[] NOT NULL DEFAULT '{}',  -- sensitivity labels still sealed
  valid_during     TSTZRANGE NOT NULL,               -- typically hours, never open-ended
  audit_event_id   UUID NOT NULL REFERENCES audit_events (id),  -- the break_glass event
  reviewed_by      UUID,
  reviewed_at      TIMESTAMPTZ,
  review_outcome   TEXT CHECK (review_outcome IN ('justified', 'unjustified', 'needs_follow_up'))
);

CREATE TABLE access_review_cases (        -- a flagged access pattern and its investigation
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  rule_key         TEXT NOT NULL,          -- 'same_surname', 'coworker_record', 'no_relationship',
                                           -- 'bulk_export', 'terminated_user', 'break_glass'
  subject_user_id  UUID NOT NULL,
  patient_id       UUID REFERENCES patients (id),
  audit_event_ids  UUID[] NOT NULL,        -- the evidence
  opened_at        TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('open', 'cleared', 'confirmed_violation',
                     'escalated_to_breach')),
  breach_case_id   UUID,                   -- breach_cases (HIPAA in Practice) when escalated
  sanction         TEXT,                   -- the workforce sanction applied, if any
  closed_at        TIMESTAMPTZ
);

CREATE TABLE downtime_events (            -- when a practice or the platform ran without the system
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID REFERENCES organizations (id),  -- null: platform-wide
  integration_id   UUID REFERENCES integrations (id),   -- the PMS, EHR or clearinghouse that was down
  scope            TEXT NOT NULL,          -- 'pms_sync', 'scheduling', 'claims', 'messaging', 'all'
  cause            TEXT NOT NULL CHECK (cause IN ('ransomware', 'outage', 'maintenance',
                     'upstream_vendor', 'network', 'other')),
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  customers_notified_at TIMESTAMPTZ,
  back_entry_completed_at TIMESTAMPTZ      -- paper records re-entered after recovery
);

CREATE TABLE restore_tests (              -- evidence the backups restore
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID REFERENCES organizations (id),
  system           TEXT NOT NULL,          -- 'primary_db', 'documents_store', 'office_pms_server'
  backup_taken_at  TIMESTAMPTZ NOT NULL,
  restored_at      TIMESTAMPTZ NOT NULL,
  duration         INTERVAL NOT NULL,      -- against the recovery time objective
  verified_checks  JSONB NOT NULL,         -- row counts, document hashes, a sample of patients opened
  passed           BOOLEAN NOT NULL
);
```

Design decisions:

- **Break-the-glass is a grant with a window and a review.** The grant is the authorization the access layer checks; the audit event is the evidence; the review is a required follow-up with an outcome, so an unreviewed break is a visible backlog, not a forgotten log line.
- **Sensitive records can stay sealed.** `excluded_categories` uses the same labels as the [privacy chapter](/books/health-tech/state-health-privacy), so an emergency grant doesn't silently open Part 2 or psychotherapy notes unless a rule allows it.
- **Review cases point at evidence, not copies.** A case holds the IDs of the `audit_events` that triggered it, so investigation reads the tamper-evident log itself ([Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident)); a confirmed case can become a breach case without re-collecting anything.
- **Downtime is data.** Each outage, whose systems it hit, when customers were told and when paper was back-entered are the facts a contingency plan, a customer's review and an OCR investigation all ask for.
- **Restores are tested and recorded.** A backup without a recorded restore is an assumption; the restore record, with its duration, is the evidence for the contingency plan's testing specification and for the recovery time a customer was promised.

## Auditing

- **Every read, write, export and print** of patient records, by user and patient, with purpose, in a tamper-evident store, and its review.
- **Every break-the-glass grant** with reason, window, and review outcome.
- **Access review cases** from open to close, with sanctions applied.
- **The risk analysis and risk management plan,** versioned, with the system inventory they cover; OCR's corrective action plans ask for both.
- **Downtime events and restore tests,** with dates and durations.
- **Vendor and device inventory:** each third party with access, its assessment, its BAA, and each connected device with its SBOM where the manufacturer provides one ([How to Build It](/books/health-tech/vendor-compliance-posture#how-to-build-it) in the vendor posture chapter holds the BAA and system inventory).

## What This Means for the System You Build

- **Plan for your own Change Healthcare day:** you are a concentration point for your customers, so isolation decisions, customer notice and restore order are written down before the incident.
- **Map your controls to HICP and the HPH CPGs,** starting with the essential ten, and publish a vulnerability disclosure process and incident reporting commitments.
- **Build break-the-glass as an explicit, reviewed, time-boxed grant** that respects sensitivity labels.
- **Review access, not just log it:** run snooping rules over reads, and make a patient access report a query you could answer today.
- **Treat devices and their SBOMs as part of the network** you're responsible for when you integrate with them.
- **Give practices a way to keep working when you're down,** with downtime extracts, clear notice and a back-entry path, and test restores on a schedule with recorded results.

## References

**Regulations and statutes**

- [LII: 45 CFR 164.312, Technical safeguards](https://www.law.cornell.edu/cfr/text/45/164.312), unique user identification and emergency access (required), automatic logoff and encryption (addressable), audit controls
- [LII: 45 CFR 164.308, Administrative safeguards](https://www.law.cornell.edu/cfr/text/45/164.308), risk analysis, information system activity review, access authorization, log-in monitoring, incident response, contingency plan specifications
- [LII: 21 U.S.C. 360n-2, Ensuring cybersecurity of devices](https://www.law.cornell.edu/uscode/text/21/360n-2), section 524B requirements and the cyber device definition
- [Federal Register: HIPAA Privacy Rule accounting of disclosures NPRM (May 31, 2011)](https://www.federalregister.gov/documents/2011/05/31/2011-13297/hipaa-privacy-rule-accounting-of-disclosures-under-the-health-information-technology-for-economic), the proposed access report
- [Federal Register: HIPAA Security Rule NPRM (January 6, 2025)](https://www.federalregister.gov/documents/2025/01/06/2024-30983/hipaa-security-rule-to-strengthen-the-cybersecurity-of-electronic-protected-health-information), still proposed as of October 2026

**Agencies**

- [HHS 405(d): Health Industry Cybersecurity Practices, What's new in the 2023 edition (PDF)](https://hhscyber.hhs.gov/Documents/HICP/HHS-hicp-highlight_R.pdf), the five threats, ten practices and the small and medium-to-large technical volumes
- [HHS: HPH Cybersecurity Performance Goals](https://hhscyber.hhs.gov/cybersecurity-performance-goals.html), the ten essential and ten enhanced goals
- [HHS: Resolution agreements and civil money penalties](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/index.html), the eighth and ninth ransomware settlements (January 7, 2025), later ransomware settlements, the 2023 security guard snooping and the terminated-access cases
- [HHS: OSF HealthCare resolution agreement and corrective action plan](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/ra-cap-with-osf-healthcare-system/index.html), risk analysis with a complete system inventory and a risk management plan
- [HHS: Change Healthcare cybersecurity incident FAQs](https://www.hhs.gov/hipaa/for-professionals/special-topics/change-healthcare-cybersecurity-incident-frequently-asked-questions/index.html), the affected-individual updates through July 31, 2025
- [FDA: Cybersecurity](https://www.fda.gov/medical-devices/digital-health-center-excellence/cybersecurity), section 524B's enactment and effective date, the September 27, 2023 and June 27, 2025 premarket guidance

**Filings**

- [UnitedHealth Group: Form 8-K (February 22, 2024)](https://www.sec.gov/Archives/edgar/data/731766/000073176624000045/unh-20240221.htm), identification on February 21, 2024, the suspected nation-state actor statement, isolation of impacted systems

**In practice**

- [Imprivata](https://www.imprivata.com/), healthcare privacy and diversion monitoring, medical device access, biometric patient authentication, EPCS, single sign-on
- [Bluesight](https://bluesight.com/), patient privacy monitoring and diversion surveillance
- [Censinet](https://censinet.com/), healthcare third-party risk management and peer benchmarking
