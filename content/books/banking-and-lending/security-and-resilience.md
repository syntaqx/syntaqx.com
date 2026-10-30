+++
title = "Security, Resilience & Incident Notice"
nav_title = "Security & Resilience"
description = "GLBA safeguards for banks and nonbanks, the 36-hour incident notice, NCUA's 72 hours, NYDFS Part 500, DORA, vendor concentration and continuity."
category = "Banking & Lending Industry"
order = 2473
part = "Running the Platform"
tags = ["banking", "security", "incident-response", "resilience", "glba", "dora", "nydfs"]
+++

A bank's security program is written law in a way most companies' isn't. The Gramm-Leach-Bliley Act told the banking agencies and the FTC to set standards for safeguarding customer information, and they did: a written program approved by the board, a risk assessment, access controls, encryption, monitoring, oversight of service providers, a response program and an annual report to the board. Since 2022 a bank also owes its regulator notice within 36 hours of deciding an incident is serious; a credit union owes NCUA notice within 72; a New York-licensed institution owes the state its own 72-hour notice and an annual certification signed by its highest-ranking executive and its CISO; a European bank owes its supervisor a first report within hours under DORA. And because most banks run on a few core vendors, an incident at one vendor is an incident at hundreds of banks at once.

This chapter covers the safeguards rules for banks and nonbanks, the FFIEC's examination framework after the Cybersecurity Assessment Tool, the 36-hour notification rule and its service provider counterpart, NCUA's rule, NYDFS Part 500 after its 2023 amendment, DORA, one incident's several clocks worked through, vendor concentration in cores, and business continuity. The generic engineering is the playbook's: [Threat Modeling](/docs/security/threat-modeling), [Vulnerability Management](/docs/security/vulnerability-management), [Encryption at Rest](/docs/security/encryption-at-rest), [Authorization](/docs/security/authorization), [Support Access](/docs/security/support-access) and [Dashboards & Alerts](/docs/observability/dashboards-and-alerts); customer authentication is [Digital & Mobile Banking](/books/banking-and-lending/digital-banking#authentication-and-the-ffiec-guidance); outsourcing a core is [Outsourcing Risk](/books/banking-and-lending/core-modernization#outsourcing-risk). The chapter extends `institutions` and `programs`, reuses `technology_providers` and `institution_providers`, and adds `notification_regimes`, `security_incidents`, `incident_notifications`, `critical_operations` and `operation_dependencies`.

## The Rules at a Glance

As of October 2026:

| Rule | Applies to | Program requirements | Incident notice |
| --- | --- | --- | --- |
| **Interagency Guidelines Establishing Information Security Standards** (GLBA 501(b); 12 CFR 364 App. B for the FDIC, with OCC and Fed counterparts) | Banks and savings associations | Board-approved written program; risk assessment; access controls, encryption, dual control, monitoring; service provider contracts; annual report to the board | Customer notice "as soon as possible" when misuse of sensitive customer information has occurred or is reasonably possible (Supplement A) |
| **Computer-security incident notification rule** (12 CFR 53, 225 subpart N, 304 subpart C) | Banking organizations supervised by the OCC, Fed or FDIC, and their bank service providers | None; a notice rule | Regulator notice no later than 36 hours after determining a notification incident; providers notify bank customers "as soon as possible" for disruptions of four hours or more |
| **NCUA Part 748** | Federally insured credit unions | Security program under 748.0 and Appendix A | NCUA notice "as soon as possible but no later than 72 hours" after a reasonable belief of a reportable cyber incident |
| **FTC Safeguards Rule** (16 CFR 314) | Nonbank financial institutions under FTC jurisdiction: lenders, servicers, brokers and many fintechs | A Qualified Individual; written risk assessment; encryption; MFA "for any individual accessing any information system"; testing; written incident response plan; annual report to the board | FTC notice within 30 days of discovering a breach of unencrypted data on 500 or more consumers |
| **NYDFS Part 500** (23 NYCRR 500) | Entities licensed or chartered under New York's banking, insurance or financial services laws | A full cybersecurity program with named controls and an annual certification by April 15 | DFS notice within 72 hours of determining a cybersecurity incident; extortion payments within 24 hours |
| **DORA** (Regulation (EU) 2022/2554) | EU financial entities and their critical ICT providers | ICT risk management, resilience testing, third-party risk and a register of information | Major ICT incidents: initial notification within 4 hours of classification and no later than 24 hours after awareness |

Three distinctions the table hides:

- **Bank or nonbank decides the safeguards rule.** A bank follows the Interagency Guidelines and is examined on them; a nonbank lender, a mortgage servicer or a fintech program manager that isn't itself a bank is a "financial institution" under the FTC's rule. A program on a sponsor bank usually answers to both: the FTC rule for itself and the bank's program through its contract ([Who Owns Which Obligation](/books/banking-and-lending/banking-as-a-service#who-owns-which-obligation)).
- **Regulator notice and customer notice are different duties.** The 36-hour rule and NCUA's rule tell the regulator about disruption; the Interagency Guidelines' Supplement A, state breach laws and the FTC rule tell customers or the FTC about data. One incident can trigger either, both or neither.
- **State law sits on top.** States have their own breach notification statutes with its own definitions and deadlines, and New York adds Part 500 for its licensees; the system treats each as a regime with its own trigger and clock rather than one "notify customers" task.

## Safeguarding Customer Information

The two GLBA rules converge on the same program, with the FTC's version more prescriptive because it was amended in 2021 and 2023 for companies that aren't examined:

- **Governance.** Under the Interagency Guidelines, the board approves the written program and receives a report "at least annually" covering the risk assessment, service provider arrangements, test results and breaches. The FTC rule requires a "Qualified Individual" to oversee the program and report in writing to the board at least annually.
- **Risk assessment.** The Guidelines ask the bank to identify foreseeable threats and evaluate "the likelihood and potential damage of these threats"; the FTC rule requires the assessment to be written, with criteria for rating risks and how each is mitigated or accepted, and repeated periodically.
- **Controls.** Access limited to what a role needs, encryption of customer information in transit and at rest (the FTC rule: "all customer information," with compensating controls only where encryption is infeasible and approved), dual control and segregation of duties, monitoring to detect "actual and attempted attacks," secure development, change management, secure disposal ([Least Privilege](/docs/security/authorization#least-privilege), [Envelope Encryption](/docs/security/encryption-at-rest#envelope-encryption)).
- **MFA.** The FTC rule requires multi-factor authentication "for any individual accessing any information system" unless the Qualified Individual approves an equivalent control in writing. The Interagency Guidelines leave the factor to risk assessment, and the FFIEC authentication guidance supplies the expectation ([Digital & Mobile Banking](/books/banking-and-lending/digital-banking#authentication-and-the-ffiec-guidance)).
- **Testing.** The FTC rule requires continuous monitoring or, failing that, annual penetration testing and vulnerability assessments at least every six months and after material changes ([Finding Them](/docs/security/vulnerability-management#finding-them)).
- **Service providers.** Both rules require selecting providers able to safeguard the information, requiring safeguards by contract and monitoring them ([Vendor Concentration](#vendor-concentration), below).
- **Response.** The Guidelines' Supplement A response program: assess the incident, notify the primary regulator, file a SAR where required, contain it, and notify affected customers "as soon as possible" when misuse of sensitive customer information (a name with an SSN, account or card number, or credentials) has occurred or is reasonably possible, unless law enforcement asks in writing for a delay. The FTC rule requires a written incident response plan with goals, roles, communications, remediation and documentation, and since May 13, 2024, a report to the FTC of a breach of unencrypted information on 500 or more consumers within 30 days of discovery.

### The FFIEC framework after the Assessment Tool

Examiners work from the FFIEC IT Examination Handbook's booklets (information security, business continuity management, architecture and operations, outsourcing). For a decade the FFIEC's Cybersecurity Assessment Tool was the common self-assessment; the FFIEC retired it on August 31, 2025 and pointed institutions to the NIST Cybersecurity Framework 2.0 and CISA's Cybersecurity Performance Goals. Nothing in the rules changed with it, but a bank's control inventory now maps to a general framework rather than a banking-specific one, and the mapping is the bank's to maintain.

## The 36-Hour Rule

The OCC, the Federal Reserve and the FDIC adopted the computer-security incident notification rule together (86 FR 66424, November 23, 2021), effective April 1, 2022 with compliance from May 1, 2022. It has two duties and two definitions that do all the work:

- **A computer-security incident** is "an occurrence that results in actual harm to the confidentiality, integrity, or availability of an information system or the information that the system processes, stores, or transmits."
- **A notification incident** is a computer-security incident that "has materially disrupted or degraded, or is reasonably likely to materially disrupt or degrade," the bank's ability to deliver products and services "to a material portion of its customer base," a business line whose failure would cause "a material loss of revenue, profit, or franchise value," or operations whose failure "would pose a threat to the financial stability of the United States."
- **The bank's duty:** notify its primary regulator "as soon as possible and no later than 36 hours after the banking organization determines that a notification incident has occurred," by email, phone or similar means to its supervisory office (12 CFR 53.3).
- **The provider's duty:** a bank service provider notifies "at least one bank-designated point of contact at each affected banking organization customer" "as soon as possible" when an incident has materially disrupted or degraded, or is reasonably likely to, covered services "for four or more hours"; with no designated contact, the bank's CEO and CIO. Scheduled maintenance, testing or updates previously communicated are excluded (12 CFR 53.4).

Three things engineers get wrong:

- **The clock starts at determination, not detection.** Thirty-six hours run from when the bank determines the incident is a notification incident, which is a judgment against the definition. The system records detection, escalation and determination as separate timestamps, and the determination is a named person's decision with the reasoning, because the examiner's question is whether it was made promptly.
- **"Reasonably likely" counts.** An incident that hasn't disrupted service yet but is reasonably likely to (ransomware found on a server that runs online banking) can be a notification incident before customers notice anything.
- **The provider's notice feeds the bank's.** A core vendor's four-hour notice is often the bank's first knowledge of an incident, and it may be the start of the bank's own determination. The designated contact is a role the bank keeps current with every provider, and the inbound notice is an intake event with a timestamp, not an email in someone's inbox.

**Credit unions** are under NCUA's own rule (12 CFR 748.1(c)): notice "as soon as possible but no later than 72 hours" after the credit union reasonably believes a reportable cyber incident occurred, or within 72 hours of a third party's notice, whichever is sooner. A reportable incident is "any substantial cyber incident" causing a substantial loss of confidentiality, integrity or availability, a disruption of business or member systems from an attack, or a disruption or unauthorized access through a compromised service provider, cloud provider or supply chain. NCUA's trigger is broader on data and wider on vendors than the banking agencies', and its clock longer.

## NYDFS Part 500

New York's cybersecurity regulation, first adopted in 2017, was amended effective November 1, 2023, with requirements phased in over two years (23 NYCRR 500.22):

| Compliance date | What took effect |
| --- | --- |
| December 1, 2023 | Notification duties (500.17) |
| April 29, 2024 | Most new requirements (180 days) |
| November 1, 2024 | 500.4 (governance), 500.15 (encryption), 500.16 (incident response and business continuity), 500.19(a) |
| May 1, 2025 | 500.5(a)(2), 500.7 (access privileges), 500.14(a)(2) and 500.14(b) |
| November 1, 2025 | 500.12 (multi-factor authentication) and 500.13(a) (asset inventory) |

The two last-phase controls are the ones with the most engineering behind them. Multi-factor authentication "shall be utilized for any individual accessing any information systems of a covered entity," with narrower requirements only for entities with a limited exemption. The asset inventory must be "complete, accurate and documented," tracking each asset's owner, location, classification or sensitivity, support expiration date and recovery time objectives, on a stated update and validation cycle.

Notices under 500.17 run on their own clocks: the superintendent electronically "as promptly as possible but in no event later than 72 hours" after determining a cybersecurity incident occurred at the entity, an affiliate or a third-party service provider; notice of an extortion payment within 24 hours and a written explanation within 30 days of why it was necessary, the alternatives considered and the diligence done, including on OFAC rules. And every April 15 each covered entity files either a certification that it "materially complied" during the prior year or an acknowledgment of noncompliance naming the sections and the remediation timeline, signed by the highest-ranking executive and the CISO. A certification someone signs personally is a strong reason to keep the evidence as records, not slides.

DFS has also published guidance that shapes controls: its October 16, 2024 industry letter on AI-enabled attacks warns about deepfake social engineering and advises against authentication by SMS, voice or video in favor of digital certificates and physical security keys, with liveness detection for biometrics ([AI in Banking & Lending](/books/banking-and-lending/ai-in-banking) covers AI risk more broadly).

## DORA

The EU's Digital Operational Resilience Act "entered into application on 17 Jan 2025" for banks, payment and e-money institutions, investment firms and insurers. It covers ICT risk management, ICT third-party risk, resilience testing (basic and, for some firms, threat-led penetration testing), ICT incident reporting, information sharing and EU oversight of critical ICT third-party providers. Two parts matter most for engineers:

- **Incident reporting on a short clock.** For a major ICT-related incident, the delegated regulation on reporting (2025/301) requires an initial notification "within four hours from the classification" of the incident as major and "no later than 24 hours from the moment the financial entity has become aware" of it; an intermediate report "within 72 hours from the submission of the initial notification"; and a final report "no later than one month after" the latest intermediate report. Classification is against criteria in a separate regulatory technical standard, so the classification itself is a recorded decision with its own timestamp.
- **The register of information and the critical providers.** Each financial entity keeps a register of its ICT contracts, and the European supervisory authorities used those registers to designate critical ICT third-party providers. The first list, published November 18, 2025, named 19, from the hyperscale clouds (AWS, Google Cloud, Microsoft) to consultancies and data providers, and included one core banking vendor, FIS. Designated providers come under direct EU oversight of their risk management.

For a US platform the reach is indirect but real: a US core, card or digital banking vendor serving EU banks sits in those banks' registers, faces their contract terms and testing, and may be designated itself.

## One Incident, Many Clocks

A worked example of my own. A New York-chartered bank, insured and supervised by the FDIC, runs on a hosted core. On Tuesday at 02:00 Eastern the core vendor detects ransomware on systems that run online banking and card authorization for its clients. The timeline:

| Time | Event | Clock it starts or ends |
| --- | --- | --- |
| Tue 02:00 | Vendor detects the incident | Vendor's internal response |
| Tue 06:10 | Services degraded for four hours; vendor notifies each client bank's designated contact | 12 CFR 53.4 notice "as soon as possible" (met) |
| Tue 06:20 | Bank's intake records the vendor's notice; incident opened | Bank's assessment begins |
| Tue 09:30 | Bank determines a notification incident: online banking and debit authorizations down for a material portion of customers | 36 hours to notify the FDIC: by Wed 21:30 |
| Tue 09:30 | Bank determines a cybersecurity incident at a third-party service provider under Part 500 | 72 hours to notify DFS: by Fri 09:30 |
| Tue 11:00 | Bank notifies the FDIC and DFS | Both met early, with updates to follow |
| Thu 16:00 | Vendor confirms customer data (names, SSNs, account numbers) was exfiltrated | Supplement A customer notice "as soon as possible"; state breach laws by state of residence |
| Following weeks | Customer notices, credit monitoring, SAR on the intrusion where required | Each state's deadline; SAR 30 days from the bank's determination |

Two lessons. **Each clock starts at a different determination,** so the incident record needs a determination row per regime with who decided and why, not one "notified" checkbox. **The vendor's facts arrive in pieces,** and each new fact (data was taken; a second system is affected) can start a regime that hadn't applied, which is why the regimes are evaluated again at every update. Evolve Bank & Trust's 2024 ransomware incident followed the pattern: Evolve first saw systems "not working properly" in late May and took it for a hardware failure, then found LockBit had downloaded customer information from its databases and a file share, including data on customers of its fintech partners, and began individual notifications on July 8, 2024. Patelco Credit Union's customer-facing banking systems were down for about two weeks after a June 29, 2024 ransomware attack, with an intruder in its network since May 23.

## Vendor Concentration

Three vendors run most US cores ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-the-platforms-do-it)), and the same is true one layer up for digital banking, card processing and bill pay. Concentration changes what resilience means for a bank:

- **The bank can't fix the vendor's outage.** It can only have planned for it: what customers can still do, what the bank can still post, how it will communicate. A bank's continuity plan for its core is mostly a plan for operating without it.
- **The vendor's incident is the bank's incident.** Services a vendor performs are examined "to the same extent" as if the bank performed them, and the bank notifies its regulator of each service relationship within 30 days of the contract or the start of service (12 USC 1867(c)). The vendor's four-hour notice duty exists because regulators learned that banks heard about vendor outages last.
- **Many banks fail together.** A ransomware event at a hosted core or a shared data center takes down every client at once, and the regulators see it as one event across many institutions. DORA's designation of critical providers is the EU's response; US agencies examine the largest technology service providers directly under the same statute.
- **Program banks add a layer.** A fintech program depends on its sponsor bank's core, its middleware, its card processor and its own cloud. The Evolve incident exposed partners' customers' data through the bank; a middleware failure strands every program on it ([Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers#synapse-a-post-mortem)).

The third-party guidance (2023, with a 2026 replacement proposed) sets the life cycle and contract terms ([Outsourcing Risk](/books/banking-and-lending/core-modernization#outsourcing-risk); [The Guidance](/books/banking-and-lending/sponsor-bank-oversight#the-guidance)). What the system adds is the map: which critical operation depends on which provider, through which service, with what notice contact and what recovery objective.

## Business Continuity and Operational Resilience

The agencies' October 30, 2020 paper on sound practices (OCC Bulletin 2020-94) defines operational resilience as the "ability to deliver operations, including critical operations and core business lines, through a disruption from any hazard," and is addressed to the largest banks ($250 billion and up, or $100 billion with significant other risk), though smaller banks use its structure. It rests on governance, operational risk management, business continuity, third-party risk, scenario analysis, secure and resilient information systems, and surveillance and reporting, with a cyber appendix. The shape a platform can implement:

- **Name the critical operations.** Taking deposits and posting payroll, debit authorization, payments out (ACH, wire, Zelle), online banking, loan payments, statement and notice production. Each has an owner, a maximum tolerable disruption, a recovery time and recovery point objective, and the dependencies it runs on.
- **Plan degraded modes, not only recovery.** When the core is down: card authorizations by stand-in against a balance file or with lowered limits ([The Authorization From the Issuer's Side](/books/payments/issuer-processing#the-authorization-from-the-issuer-s-side)); online banking read-only from the last snapshot with the as-of time shown; inbound ACH stored in `inbound_messages` and posted on recovery; outbound wires stopped or released manually under dual control. Each mode is a switch someone has tested, with the risk it accepts written down.
- **Test with the vendor.** Failover and recovery tests, tabletop exercises with the core vendor's incident team, and restores from backups the bank actually controls. A test that has only ever been run by the vendor, on the vendor's schedule, hasn't tested the bank's half.
- **Keep an exit.** Data in a usable format, on demand, and a plan for moving to another provider, written into the contract ([Plan the Exit Before You Enter](/docs/architecture/replacing-systems#plan-the-exit-before-you-enter)). Patelco's two weeks are what recovery looks like without a degraded mode that works.
- **Infrastructure resilience is the Hosting & Cloud volume's:** zones, cells and blast radius in [Regions, Zones & Cells](/books/hosting-and-cloud/regions-zones-and-cells#blast-radius-in-real-outages), vendor outages in [Outages & Status Pages](/books/hosting-and-cloud/outages-and-status-pages#vendor-risk).

## How to Build It

The volume's `technology_providers` and `institution_providers` ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-to-build-it)) already say which systems each institution runs. This chapter adds the notification regimes as data, the incident and its per-regime determinations and notices, and the map from critical operations to providers:

```sql
CREATE TABLE notification_regimes (        -- each notice duty, as data
  code                TEXT PRIMARY KEY,      -- 'us_36h_regulator', 'us_bsp_4h', 'ncua_72h',
                                             -- 'nydfs_72h', 'nydfs_extortion_24h', 'glba_customer',
                                             -- 'ftc_500', 'dora_initial', 'state:CA', ...
  recipient           TEXT NOT NULL,         -- 'primary_regulator', 'bank_customers', 'nydfs', 'ftc', ...
  trigger_definition  TEXT NOT NULL,         -- the rule's definition, quoted with its citation
  deadline_hours      INT,                   -- 36, 72, 24, 4; null for "as soon as possible"
  deadline_from       TEXT NOT NULL CHECK (deadline_from IN ('determination', 'awareness',
                        'classification', 'discovery', 'third_party_notice', 'payment')),
  citation            TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE security_incidents (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID REFERENCES institutions (id),    -- null when the platform's own
  program_id          UUID REFERENCES programs (id),
  provider_id         UUID REFERENCES technology_providers (id),  -- when it began at a vendor
  summary             TEXT NOT NULL,
  detected_at         TIMESTAMPTZ NOT NULL,
  provider_notice_at  TIMESTAMPTZ,           -- when a vendor's notice was received
  disruption_started  TIMESTAMPTZ,
  disruption_ended    TIMESTAMPTZ,
  data_affected       TEXT[] NOT NULL DEFAULT '{}',  -- 'ssn', 'account_number', 'card_number', ...
  persons_affected    INT,
  status              TEXT NOT NULL CHECK (status IN ('open', 'contained', 'recovered', 'closed')),
  case_id             UUID REFERENCES cases (id)  -- the investigation, where one is opened
);

CREATE TABLE incident_notifications (      -- one row per regime evaluated, met or not
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  incident_id         UUID NOT NULL REFERENCES security_incidents (id),
  regime_code         TEXT NOT NULL REFERENCES notification_regimes (code),
  applies             BOOLEAN NOT NULL,      -- the determination: does this regime apply
  determined_at       TIMESTAMPTZ NOT NULL,  -- the clock's start, for 'determination' regimes
  determined_by       TEXT NOT NULL,
  reasoning           TEXT NOT NULL,         -- against the regime's definition
  due_at              TIMESTAMPTZ,           -- computed and stored when applies
  sent_at             TIMESTAMPTZ,
  sent_via            TEXT,                  -- 'email', 'phone', 'portal'
  recipient_ref       TEXT,                  -- the supervisory office or point of contact
  content_ref         TEXT,                  -- the notice as sent
  UNIQUE (incident_id, regime_code, determined_at)  -- a regime re-evaluated is a new row
);

CREATE TABLE critical_operations (         -- what must keep working, and how far it may degrade
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  name                TEXT NOT NULL,         -- 'debit_authorization', 'payroll_posting', 'online_banking'
  owner               TEXT NOT NULL,
  max_tolerable_hours NUMERIC(6, 2) NOT NULL,
  rto_hours           NUMERIC(6, 2) NOT NULL,
  rpo_minutes         INT NOT NULL,
  degraded_mode       TEXT,                  -- the tested fallback: 'stand_in_with_limits', 'read_only'
  last_tested_at      DATE,
  UNIQUE (institution_id, name)
);

CREATE TABLE operation_dependencies (      -- the map from operations to providers
  operation_id        UUID NOT NULL REFERENCES critical_operations (id),
  provider_id         UUID NOT NULL REFERENCES technology_providers (id),
  service             TEXT NOT NULL,         -- 'core_posting', 'card_processing', 'hosting', ...
  notice_contact_ref  TEXT NOT NULL,         -- the designated point of contact given to the provider
  contract_ref        TEXT,
  substitutable       BOOLEAN NOT NULL,      -- another provider or a manual process can stand in
  PRIMARY KEY (operation_id, provider_id, service)
);
```

Every open regime and its remaining time, the incident commander's first query:

```sql
SELECT r.code, r.recipient, n.determined_at, n.due_at,
       n.due_at - NOW()                     AS time_left
FROM incident_notifications n
JOIN notification_regimes r ON r.code = n.regime_code
WHERE n.incident_id = :incident_id
  AND n.applies
  AND n.sent_at IS NULL
ORDER BY n.due_at NULLS FIRST;                -- "as soon as possible" first
```

Which institutions a provider's incident touches, and through which operations, for a platform serving many banks:

```sql
SELECT o.institution_id, o.name, o.max_tolerable_hours, d.notice_contact_ref
FROM operation_dependencies d
JOIN critical_operations o ON o.id = d.operation_id
WHERE d.provider_id = :provider_id
  AND NOT d.substitutable
ORDER BY o.max_tolerable_hours;
```

Design notes:

- **Regimes are rows, so new ones are inserts.** A state amends its breach law, NCUA changes its rule, a program enters the EU: a new `notification_regimes` row with its definition, deadline and start, and the incident workflow picks it up.
- **Determinations are re-evaluated.** Each new fact re-runs every regime that doesn't yet apply; a regime that starts applying gets a new row with its own determination time, and the earlier "doesn't apply" stays as it was decided.
- **The incident record is evidence.** Who knew what and when, written as it happens, is what an examiner, a DFS certification and a court will read; reconstructing it afterward from chat logs is how timelines turn out wrong ([What a Record Holds](/docs/architecture/audit-trails#what-a-record-holds)).
- **The asset inventory feeds the map.** Part 500's inventory fields (owner, classification, support end, recovery objective) are the same facts `critical_operations` needs; one inventory serves both, kept in the platform's configuration system with these tables as its banking view.
- **Emit events:** `incident.opened`, `incident.provider_notice_received`, `notification.determined`, `notification.due_soon`, `notification.sent`, `operation.degraded`.

## Auditing

- **The program on paper.** The written program, the board's approval and the annual reports, the risk assessment and its revisions, and the FTC rule's Qualified Individual designation where it applies.
- **Controls as evidence.** MFA coverage, encryption status, access reviews, penetration tests and vulnerability assessments with dates and findings, and change approvals, which are what an April 15 certification rests on ([Engineering Is the Evidence](/docs/compliance/soc-2#engineering-is-the-evidence)).
- **Every incident's timeline.** Detection, provider notice, each regime's determination with its reasoning, each notice with its time and content, and each update.
- **Every provider relationship.** The contract, the 30-day regulator notice of the service relationship, the designated notice contact, due diligence and monitoring results, and the operations that depend on it.
- **Continuity tests.** Each test of a degraded mode, failover and restore, with the result and what changed after.

## What This Means for the System You Build

- **Know which safeguards rule you're under:** the Interagency Guidelines for a bank, the FTC rule for a nonbank, both for a program through its bank, and Part 500 or DORA where licensed.
- **Treat every notice duty as a regime with its own trigger and clock,** stored as data and evaluated again with every new fact.
- **Record detection, provider notice and each determination separately,** with the decision-maker and the reasoning.
- **Keep the provider notice path real:** a current designated contact at every provider and an intake that timestamps every notice received.
- **Meet the NYDFS last phase:** MFA for every individual on every information system and a complete asset inventory with owners and recovery objectives.
- **Map critical operations to providers,** with tolerances, recovery objectives and a tested degraded mode for each.
- **Plan to operate without the core** for as long as the vendor's worst case, and test it with the vendor.
- **Keep the evidence as records,** because officers sign certifications against it.

## References

**Law and regulation**

- [12 CFR 53.2](https://www.law.cornell.edu/cfr/text/12/53.2), computer-security incident and notification incident defined
- [12 CFR 53.3](https://www.law.cornell.edu/cfr/text/12/53.3), the banking organization's notice no later than 36 hours after determination
- [12 CFR 53.4](https://www.law.cornell.edu/cfr/text/12/53.4), the bank service provider's notice for disruptions of four hours or more, and the maintenance exception
- [Federal Register: Computer-Security Incident Notification Requirements (November 23, 2021)](https://www.federalregister.gov/api/v1/documents/2021-25510.json), 86 FR 66424, the agencies, the effective date and the compliance date
- [12 CFR 748.1](https://www.law.cornell.edu/cfr/text/12/748.1), NCUA's 72-hour notice of reportable cyber incidents
- [12 CFR 364, Appendix B](https://www.law.cornell.edu/cfr/text/12/appendix-B_to_part_364), the Interagency Guidelines Establishing Information Security Standards and the Supplement A response program
- [16 CFR 314.4](https://www.law.cornell.edu/cfr/text/16/314.4), the FTC Safeguards Rule's elements and FTC notification
- [Federal Register: Standards for Safeguarding Customer Information (November 13, 2023)](https://www.federalregister.gov/api/v1/documents/2023-24412.json), 88 FR 77499, the 500-consumer breach notice effective May 13, 2024
- [12 U.S.C. 1867](https://www.law.cornell.edu/uscode/text/12/1867), services by contract examined as if performed by the bank, and notice of service relationships within 30 days
- [23 NYCRR 500.12](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-500.12), multi-factor authentication for any individual accessing any information system
- [23 NYCRR 500.13](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-500.13), the asset inventory and what it tracks
- [23 NYCRR 500.17](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-500.17), the 72-hour and 24-hour notices and the April 15 certification
- [23 NYCRR 500.22](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-500.22), the second amendment's effective date and phased compliance dates
- [DORA RTS on incident reporting, Article 5 (Delegated Regulation (EU) 2025/301)](https://www.springlex.eu/en/packages/dora/rts-ir-regulation/article-5/), the 4-hour, 24-hour, 72-hour and one-month time limits

**Regulators and guidance**

- [EIOPA: Digital Operational Resilience Act](https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en), application from January 17, 2025 and the areas DORA covers
- [ESMA: The ESAs designate critical ICT third-party providers (November 18, 2025)](https://www.esma.europa.eu/press-news/esma-news/european-supervisory-authorities-designate-critical-ict-third-party-providers), the first designations and what oversight means
- [ESAs: List of designated critical ICT third-party providers](https://www.esma.europa.eu/sites/default/files/2025-11/List_of_designated_CTPPs.pdf), the 19 providers
- [OCC Bulletin 2020-94: Sound Practices to Strengthen Operational Resilience](https://www.occ.gov/news-issuances/bulletins/2020/bulletin-2020-94.html), the definition, scope and practices
- [Louisiana OFI: FFIEC Cybersecurity Assessment Tool sunset](https://ofi.la.gov/messages/federal-financial-institutions-examination-council-ffiec-cybersecurity-assessment-tool-cat-sunset/), removal on August 31, 2025 and the NIST CSF 2.0 and CISA CPG pointers
- [NYDFS: Cybersecurity Risks Arising from Artificial Intelligence (October 16, 2024)](https://www.dfs.ny.gov/industry-guidance/industry-letters/il20241016-cyber-risks-ai-and-strategies-combat-related-risks), deepfake social engineering and authentication advice

**In practice**

- [Evolve Bank & Trust: Cybersecurity incident](https://www.getevolved.com/about/news/cybersecurity-incident/), the LockBit attack, what was accessed, partners' customers and notification dates
- [BleepingComputer: Patelco notifies 726,000 customers of ransomware data breach](https://www.bleepingcomputer.com/news/security/patelco-notifies-726-000-customers-of-ransomware-data-breach/), the June 29, 2024 attack, the May 23 intrusion and the two-week outage
