+++
title = "HIPAA"
description = "HIPAA for engineers: covered entities and business associates, the BAA chain, what the Security Rule asks of a system, breach deadlines, and de-identification."
category = "Compliance"
order = 904
tags = ["compliance", "hipaa", "privacy", "security", "healthcare"]
+++

HIPAA exists because health information is uniquely hard to take back. A leaked card number gets reissued in a week. A leaked diagnosis follows a person to every job interview and insurance application for the rest of their life. When US health care moved to electronic records and claims, Congress made the federal government set a floor for how that information is used, disclosed and protected, and made it enforceable with civil penalties and, for knowing misuse, criminal ones.

What makes HIPAA unusual for engineers is that it's written to be **technology neutral and risk based**. It rarely says "use this algorithm" or "rotate keys every 90 days". It says: work out what could go wrong with the health data you hold, put reasonable safeguards in place, and write down why they're reasonable. That's freedom, and it's also a trap. A team that wants a checklist will find the regulation frustratingly vague. A team that does the risk analysis honestly will find most of the answers obvious.

This page is about what HIPAA asks of a system's design. It isn't legal advice; whether HIPAA applies to you, and how, depends on your role and your contracts, and that's a question for counsel.

## Who It Applies To

HIPAA doesn't apply to health data in general. It applies to particular kinds of organizations:

- **Covered entities**: health plans, health care clearinghouses, and health care providers who conduct certain transactions (like claims) electronically.
- **Business associates**: anyone who creates, receives, maintains or transmits protected health information *on behalf of* a covered entity. A SaaS company building scheduling for clinics, a billing processor, a cloud host, a transcription service: all business associates. So are *their* subcontractors that touch the data.

A consumer fitness app that collects heart rate data directly from its users is generally not covered, because no covered entity is involved. (Other laws, like the FTC's health breach rule and state privacy laws, may still apply.) The same data flowing from a hospital to that app's company under a contract is covered. **The data's path, not its content, decides.**

**Protected health information (PHI)** is individually identifiable health information held or transmitted by a covered entity or business associate: not just diagnoses, but a patient's name next to an appointment time, or an email address in a billing record.

## The Business Associate Agreement

A covered entity may share PHI with a business associate only under a **business associate agreement (BAA)**: a contract in which the business associate promises to use the data only as permitted, safeguard it under the Security Rule, report breaches, and impose the same terms on its own subcontractors. The chain runs all the way down. If your product handles PHI, you need a BAA with your customer, and you need one with **every vendor that could see that PHI**:

- Your cloud provider (the major ones sign BAAs, but only for listed services; check that every service you use is on the list).
- Your database, queue and storage providers, if separate.
- Your logging, tracing and error tracking tools, because PHI leaks into logs, stack traces and request bodies far more often than anyone plans.
- Your email and SMS providers, if notifications contain anything identifying.
- Your **LLM provider**. Sending a patient note to a model API is a disclosure to that vendor. Most model providers offer a BAA only for specific products and configurations, often with data retention turned off; a free tier or a personal API key isn't covered.
- Your support tooling, if customers paste PHI into tickets (they will).

The engineering rule that follows: **maintain an inventory of every system PHI can reach, and treat "no BAA" as "PHI must never get here."** That usually means scrubbing at the boundary, so that the error tracker or analytics tool receives only identifiers that mean nothing outside your system.

## The Three Rules

**The Privacy Rule** governs *use and disclosure*: when PHI may be used for treatment, payment and operations, when a patient's authorization is needed, and the rights patients have, like accessing and amending their records. Its most engineering-relevant idea is **minimum necessary**: uses and disclosures should be limited to the minimum PHI needed for the purpose. In a system, that's role-based access where a billing role doesn't see clinical notes, and APIs and exports that return only the fields a consumer needs.

**The Security Rule** applies to electronic PHI and requires **administrative, physical and technical safeguards**. It starts with a **risk analysis**, an accurate and thorough assessment of the risks to the PHI you hold, and everything else follows from it.

**The Breach Notification Rule** says what happens when unsecured PHI is compromised. An impermissible use or disclosure is *presumed* to be a breach unless a documented risk assessment shows a low probability that the data was compromised. Then:

| Who must be told | When |
| --- | --- |
| **Affected individuals** | Without unreasonable delay, and no later than 60 calendar days after discovery |
| **Prominent media** in the state | Also within 60 days, if the breach involves more than 500 residents of a state or jurisdiction |
| **HHS** | At the same time as individuals if 500 or more are affected; otherwise logged and reported within 60 days of the end of the calendar year |
| **The covered entity** (by a business associate) | Without unreasonable delay, and no later than 60 calendar days after discovery |

"Discovery" is the first day the breach is known, **or would have been known with reasonable diligence**. An unmonitored audit log doesn't stop the clock; it starts it on the day you would have noticed.

The most important word in that rule is *unsecured*. PHI encrypted in line with HHS guidance isn't "unsecured", and losing it isn't a reportable breach. Encryption is the difference between a lost laptop being an incident and being a press release.

## Required and Addressable

Security Rule implementation specifications are either **required** or **addressable**. Addressable doesn't mean optional. It means you must assess whether the safeguard is reasonable and appropriate for you; implement it if so; and if not, document why and implement an equivalent alternative where that's reasonable. Encryption at rest and in transit are addressable today. In practice, for a cloud system in 2026, it's very hard to document why encrypting PHI isn't reasonable, so treat them as required.

## What It Means for a System

| Safeguard | What to build |
| --- | --- |
| **Encryption** | TLS for everything in transit; encryption at rest for every store, backup and replica that holds PHI; managed keys with restricted access |
| **Access control** | Unique user IDs, SSO, MFA, roles scoped to minimum necessary, automatic session timeout, emergency access procedure |
| **Audit controls** | Record who viewed or changed which patient's records, kept tamper-evident and reviewed; reads matter as much as writes. [Observability](/docs/operations/observability) covers the plumbing |
| **Integrity** | Mechanisms to show PHI wasn't improperly altered: checksums, append-only history, database constraints |
| **Transmission security** | No PHI in URLs, query strings, or email subjects; signed and encrypted integrations |
| **Contingency** | Backups, a tested restore, and a plan for operating during an outage; [Disaster Recovery](/docs/operations/disaster-recovery) |
| **Vendors** | A BAA before any vendor can see PHI, and an inventory proving it |
| **Development** | No production PHI in development or test environments; use synthetic or de-identified data |

## De-identification

Data that's properly **de-identified** isn't PHI, and HIPAA stops applying to it. That makes de-identification the most powerful scope reduction tool in health care, the equivalent of tokenization for card data. The Privacy Rule allows two methods:

- **Safe Harbor**: remove 18 specified identifiers (names, geographic units smaller than a state with limited exceptions for ZIP codes, all elements of dates except the year, phone numbers, email addresses, record numbers, device identifiers, full-face photos and others) of the individual and their relatives, employers and household members, *and* have no actual knowledge that what remains could identify someone.
- **Expert Determination**: a qualified expert applies statistical methods and documents that the risk of re-identification is very small.

Safe Harbor is mechanical and conservative; it destroys dates, which ruins many analyses. Expert Determination preserves more utility and costs an expert's time. Either way, de-identify **before** data leaves the PHI boundary: analytics, data warehouses and model training sets built on de-identified data don't need BAAs, and are far cheaper to protect.

## There Is No HIPAA Certification

No government body certifies HIPAA compliance. A vendor that calls itself "HIPAA certified" means it passed some third party's assessment, which may be valuable, but it doesn't transfer to you and doesn't replace the BAA. Frameworks like HITRUST, or a SOC 2 report mapped to the Security Rule, are how health care customers get assurance in practice. [SOC 2](/docs/compliance/soc-2) covers the mechanics.

## The Pending Security Rule Update

On January 6, 2025, HHS published a proposed rule to substantially revise the Security Rule. Among other changes, it would remove the distinction between required and addressable specifications, making nearly every safeguard mandatory, and would require encryption of PHI at rest and in transit, multi-factor authentication, a written technology asset inventory and network map, and written procedures to restore critical systems and data within 72 hours of a loss. **As of October 2026 it remains a proposed rule.** Check the Federal Register for a final rule before treating its specifics as obligations; in the meantime, most of what it proposes is already what a sensible risk analysis concludes.

## References

**Specifications**

- [eCFR: 45 CFR Part 164, Subpart C (Security Rule)](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C), administrative, physical and technical safeguards
- [eCFR: 45 CFR Part 164, Subpart D (Breach Notification)](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D), notification to individuals, media and HHS
- [Federal Register: HIPAA Security Rule To Strengthen the Cybersecurity of Electronic Protected Health Information](https://www.federalregister.gov/documents/2025/01/06/2024-30983/hipaa-security-rule-to-strengthen-the-cybersecurity-of-electronic-protected-health-information), the January 2025 proposed rule

**Reference**

- [LII: 45 CFR 160.103, Definitions](https://www.law.cornell.edu/cfr/text/45/160.103), covered entity, business associate and protected health information
- [LII: 45 CFR 164.306, Security standards: General rules](https://www.law.cornell.edu/cfr/text/45/164.306), what addressable requires
- [LII: 45 CFR 164.312, Technical safeguards](https://www.law.cornell.edu/cfr/text/45/164.312), access control, audit controls, integrity and transmission security
- [LII: 45 CFR 164.402, Definitions (Breach)](https://www.law.cornell.edu/cfr/text/45/164.402), the presumption of breach and the risk assessment
- [LII: 45 CFR 164.404, Notification to individuals](https://www.law.cornell.edu/cfr/text/45/164.404), the 60-day limit and when a breach counts as discovered
- [LII: 45 CFR 164.408, Notification to the Secretary](https://www.law.cornell.edu/cfr/text/45/164.408), the 500-individual threshold and annual logging
- [LII: 45 CFR 164.514, De-identification and minimum necessary](https://www.law.cornell.edu/cfr/text/45/164.514), Safe Harbor's 18 identifiers and Expert Determination

**In practice**

- [AWS: HIPAA compliance](https://aws.amazon.com/compliance/hipaa-compliance/), a cloud BAA covering only listed eligible services under shared responsibility
