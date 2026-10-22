+++
title = "HIPAA"
description = "HIPAA for engineers: covered entities and business associates, the BAA chain, what the Security Rule asks of a system, breach deadlines, and de-identification."
category = "Compliance"
order = 904
tags = ["compliance", "hipaa", "privacy", "security", "healthcare"]
+++

Health information is uniquely hard to take back. A leaked card number is reissued in a week; a leaked diagnosis follows a person to every job interview and insurance application for life. When US health care moved to electronic records and claims, Congress had the federal government set a floor for how that information is used, disclosed and protected, enforced with civil penalties and, for knowing misuse, criminal ones.

What makes HIPAA unusual for engineers is that it's **technology neutral and risk based**. It rarely says "use this algorithm" or "rotate keys every 90 days". It says: work out what could go wrong with the health data you hold, put reasonable safeguards in place, and write down why they're reasonable. A team that wants a checklist finds that frustratingly vague. A team that does the risk analysis honestly finds most answers obvious.

This is about what HIPAA asks of a system's design. It isn't legal advice: whether and how it applies to you depends on your role and contracts, which is a question for counsel.

## Who It Applies To

HIPAA doesn't cover health data in general. It covers particular organizations:

- **Covered entities:** health plans, clearinghouses, and providers who conduct certain transactions (like claims) electronically.
- **Business associates:** anyone who creates, receives, maintains or transmits protected health information *on behalf of* a covered entity: a SaaS scheduler for clinics, a billing processor, a cloud host, a transcription service, and *their* subcontractors that touch the data.

A fitness app collecting heart rate directly from users is generally not covered, since no covered entity is involved (other laws may still apply). The same data flowing from a hospital to that company under contract is. **The data's path, not its content, decides.**

**Protected health information (PHI)** is individually identifiable health information held by a covered entity or business associate: not just diagnoses, but a name next to an appointment time, or an email address in a billing record.

## The Business Associate Agreement

A covered entity may share PHI with a business associate only under a **business associate agreement (BAA)**, in which the associate promises to use the data only as permitted, safeguard it under the Security Rule, report breaches, and impose the same terms on its subcontractors. The chain runs all the way down. If your product handles PHI, you need a BAA with your customer and with **every vendor that could see that PHI**:

- Your cloud provider, which signs only for listed services: check every service you use is on the list.
- Logging, tracing and error tracking, because PHI leaks into logs, stack traces and request bodies far more often than anyone plans.
- Email and SMS providers, if notifications identify anyone.
- Your **LLM provider**. Sending a patient note to a model API is a disclosure. Providers typically offer a BAA only for specific products and configurations, often with retention off; a free tier or personal key isn't covered.
- Support tooling, because customers will paste PHI into tickets.

The rule that follows: **keep an inventory of every system PHI can reach, and treat "no BAA" as "PHI must never get here."** That usually means scrubbing at the boundary, so the error tracker or analytics tool only receives identifiers that mean nothing outside your system.

## The Three Rules

**The Privacy Rule** governs *use and disclosure*: when PHI may be used for treatment, payment and operations, when a patient's authorization is needed, and patients' rights to access and amend their records. Its most engineering-relevant idea is **minimum necessary**: a billing role doesn't see clinical notes, and APIs and exports return only the fields a consumer needs.

**The Security Rule** requires **administrative, physical and technical safeguards** for electronic PHI, starting with a **risk analysis** of the PHI you hold. Everything else follows from it.

Its specifications are **required** or **addressable**, and addressable doesn't mean optional: assess whether the safeguard is reasonable for you, implement it if so, and if not, document why and implement an equivalent alternative where reasonable. Encryption at rest and in transit are addressable today, but for a cloud system it's very hard to document why encrypting PHI isn't reasonable. Treat them as required.

**The Breach Notification Rule** covers compromised *unsecured* PHI. An impermissible use or disclosure is *presumed* a breach unless a documented risk assessment shows a low probability the data was compromised. Then:

| Who must be told | When |
| --- | --- |
| **Affected individuals** | Without unreasonable delay, no later than 60 calendar days after discovery |
| **Prominent media** in the state | Within 60 days, if more than 500 residents of a state or jurisdiction are affected |
| **HHS** | With the individuals if 500 or more are affected; otherwise logged and reported within 60 days of year end |
| **The covered entity** (by a business associate) | Without unreasonable delay, no later than 60 calendar days after discovery |

"Discovery" is the first day the breach is known **or would have been known with reasonable diligence**. An unmonitored audit log doesn't stop the clock; it starts it on the day you would have noticed.

The important word is *unsecured*. PHI encrypted in line with HHS guidance isn't, and losing it isn't a reportable breach. Encryption is the difference between a lost laptop being an incident and being a press release.

## What It Means for a System

| Safeguard | What to build |
| --- | --- |
| **Encryption** | TLS in transit; encryption at rest for every store, backup and replica holding PHI; managed keys with restricted access |
| **Access control** | Unique user IDs, SSO, MFA, roles scoped to minimum necessary, session timeout, an emergency access procedure |
| **Audit controls** | Who viewed or changed which patient's records, tamper-evident and reviewed; reads matter as much as writes |
| **Integrity** | Evidence PHI wasn't improperly altered: append-only history, database constraints |
| **Transmission** | No PHI in URLs, query strings or email subjects; signed, encrypted integrations |
| **Contingency** | Backups, a tested restore, a plan for operating during an outage; [Disaster Recovery](/docs/operations/disaster-recovery) |
| **Development** | No production PHI in development or test; synthetic or de-identified data instead |

## De-identification

Properly **de-identified** data isn't PHI, and HIPAA stops applying to it. That makes de-identification health care's most powerful scope reduction, the equivalent of [tokenization](/docs/payments/sensitive-data) for card data. There are two methods:

- **Safe Harbor:** remove 18 specified identifiers of the individual and their relatives, employers and household (names, geography smaller than a state with limited ZIP exceptions, all date elements except the year, phone numbers, emails, record and device numbers, full-face photos and more), *and* have no actual knowledge that what remains identifies someone.
- **Expert Determination:** a qualified expert applies statistical methods and documents a very small risk of re-identification.

Safe Harbor is mechanical and conservative, and destroying dates ruins many analyses. Expert Determination keeps more utility at the cost of an expert's time. Either way, de-identify **before** data leaves the PHI boundary: warehouses, analytics and training sets built on de-identified data need no BAAs and are far cheaper to protect.

## There Is No HIPAA Certification

No government body certifies HIPAA compliance. A vendor "HIPAA certified" passed some third party's assessment, which may be valuable but doesn't transfer to you or replace the BAA. In practice, health care customers get assurance from HITRUST or a [SOC 2](/docs/compliance/soc-2) report mapped to the Security Rule.

## The Pending Security Rule Update

On January 6, 2025, HHS proposed a substantial revision of the Security Rule. It would remove the required and addressable distinction, and require encryption of PHI at rest and in transit, multi-factor authentication, a written asset inventory and network map, and procedures to restore critical systems within 72 hours. **As of October 2026 it remains a proposed rule**; check the Federal Register for a final one before treating its specifics as obligations. Most of what it proposes is what an honest risk analysis concludes anyway.

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
