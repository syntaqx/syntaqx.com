+++
title = "SOC 2"
description = "SOC 2 as an engineer meets it: the Trust Services Criteria, Type 1 versus Type 2, and how reviews, pipelines and on-call become the evidence auditors test."
category = "Compliance"
order = 902
tags = ["compliance", "soc2", "security", "audit"]
+++

SOC 2 exists because every B2B customer wants to know whether you'll lose their data, and none of them can audit you themselves. Before it, each enterprise deal came with a security questionnaire of a few hundred rows, answered by hand, trusted on faith. A SOC 2 report replaces that with one document: an independent CPA firm examined your controls and says, in a formal opinion, whether they were designed well and, for a Type 2, whether they actually operated over a period of time. Procurement teams accept it because someone with a license and liability signed it.

That's also its limit, and the most important thing to understand about it. **SOC 2 attests that you do what you said you'd do.** You write the controls. The auditor tests that they exist and that you followed them. A company with weak but consistently followed controls can get a clean report, and a company with excellent engineering can get exceptions because nobody kept the evidence. It's a measure of discipline and honesty about your own process, which is valuable, but it isn't a certification that you're secure.

This page explains what SOC 2 asks of an engineering organization. It isn't audit or legal advice, and what your report covers depends on the scope and criteria you and your auditor agree.

## The Trust Services Criteria

The AICPA publishes the **Trust Services Criteria**, the yardstick a SOC 2 examination measures against. The criteria date from 2017; the AICPA revised the supporting *points of focus* in 2022 to address newer technology and privacy risks, without changing the criteria themselves. There are five categories:

| Category | The question it answers |
| --- | --- |
| **Security** | Is the system protected against unauthorized access and use? Always in scope; its criteria are the *common criteria* every report includes |
| **Availability** | Is the system available for operation as committed? |
| **Processing Integrity** | Is processing complete, valid, accurate, timely and authorized? |
| **Confidentiality** | Is information designated confidential protected as committed? |
| **Privacy** | Is personal information collected, used, retained and disposed of as committed? |

You choose which categories beyond Security to include, and the choice should follow what customers rely on you for. A payments API customers depend on for uptime is a natural fit for Availability and Processing Integrity. Adding Privacy is a large commitment; don't add categories to look thorough.

## Type 1 and Type 2

- **A Type 1 report** opines on the *design* of your controls at a single point in time. It answers "did you build sensible controls?" It's fast, and it's useful mainly as a first step.
- **A Type 2 report** opines on design *and operating effectiveness* over a period. The auditor samples evidence across that window: tickets, pull requests, access reviews, alerts and incident records. It answers "did the controls actually work, every time, for months?" It's the one customers ask for.

The AICPA doesn't fix the length of the period. In practice, auditors rarely accept less than about three months for a first report, and once you're on an annual cycle, twelve-month periods that run back to back are the norm. Between the end of one period and the next report, customers will ask for a **bridge letter**: a statement from your management (not the auditor) that nothing material has changed since the period ended. It's only as good as your word, which is why it expires when the next report arrives.

A related **SOC 3** report covers the same examination in a short, general-use form you can post publicly. It's for marketing pages; procurement wants the SOC 2.

## What Auditors Actually Test

The auditor reads your **system description**, the narrative of what the system is, where its boundaries are and which controls you claim, and then tests each control by inquiry, observation, inspection and re-performance. For a Type 2 they pick samples across the period: "show me 25 production changes from these dates and the approval for each." A control that worked 24 times and was bypassed once is an exception, and exceptions are listed in the report your customers read.

Two terms that shape scope:

- **Subservice organizations.** Your cloud provider, payment processor and identity provider run controls you rely on. Most reports *carve them out*: you note that you depend on them and that you review their own SOC reports, which becomes one of your controls.
- **Complementary user entity controls.** Controls your customers must run for the system to be secure, like managing their own users and protecting their API keys. Listing them is honest and limits your responsibility to what you control.

## How Engineering Becomes Evidence

The good news for an engineering organization is that a well-run team already produces most of the evidence. The work is making it automatic and keeping it.

| Control area | What the auditor wants to see | Where it comes from |
| --- | --- | --- |
| **Change management** | Every production change was reviewed, tested and approved by someone other than the author | Branch protection, required reviews and required checks; [Commits & Code Review](/docs/engineering/commits-and-reviews) and [CI Pipelines](/docs/delivery/ci-pipelines). The pull request *is* the change ticket |
| **Logical access** | Access is granted by role, removed promptly on departure, and reviewed on a schedule | SSO for everything, groups instead of individual grants, a quarterly access review with its result recorded |
| **Incident response** | Incidents are detected, tracked, communicated and learned from | Alerting, an incident channel and a written review for each; [Incident Response](/docs/operations/incident-response) |
| **Vulnerability management** | Vulnerabilities are found and fixed within defined windows | Dependency and image scanning with SLAs by severity; [Vulnerability Management](/docs/security/vulnerability-management) |
| **Vendor management** | Vendors handling your data are assessed before use and reviewed each year | An inventory of vendors, their SOC reports or equivalent, and who reviewed them |
| **Backups and recovery** | Backups run, and restoring them has been tested | Scheduled restore tests with the result recorded; [Disaster Recovery](/docs/operations/disaster-recovery) |
| **Monitoring** | Security-relevant events are logged and someone looks at them | Centralized logs, alerts with owners; [Observability](/docs/operations/observability) |
| **Risk and policy** | Risks are assessed and policies are current and acknowledged | A yearly risk assessment and policies people actually signed |

Two things make this cheap or expensive. First, **controls should describe what you already do**, not an aspirational process: if you write "all changes require two approvals" and your branch protection requires one, you've manufactured an exception. Second, **evidence should be a side effect**. A control that depends on someone remembering to screenshot a dashboard every quarter will fail in the one quarter that person is on leave.

## Automation Platforms and Spreadsheets

Compliance automation platforms connect to your cloud accounts, identity provider, code host and HR system, continuously check configurations against a control set, collect evidence on a schedule and hand the auditor a portal instead of a folder. For a first report they save weeks, and they keep you honest between audits by flagging drift the day it happens.

They don't do the work. A platform can tell you that a departed employee still has access; someone still has to remove it and record why it took four days. And the controls they ship are generic, so the job of making them describe *your* system remains yours. A small team with very few systems can run SOC 2 from a spreadsheet and a shared folder. Past a handful of systems, the platform pays for itself in auditor hours and missed evidence.

## SOC 2 and ISO 27001

They answer similar questions differently:

- **SOC 2** is an attestation report, written by a CPA firm against criteria from a US body, describing your controls and the auditor's test results in detail. It's the norm in North America.
- **ISO/IEC 27001** is a certification of your *information security management system*: the process by which you assess risk, choose controls and keep improving. A certification body issues a certificate, with surveillance audits between recertifications. Its Annex A lists 93 reference controls in the 2022 edition, and your Statement of Applicability says which you use and why. It's the norm in Europe and much of the rest of the world.

The controls overlap heavily, and many companies hold both once they sell internationally. The difference worth remembering: ISO 27001 certifies that your management system works; SOC 2 shows a customer exactly which controls were tested and how they did.

## References

**Specifications**

- [AICPA: 2017 Trust Services Criteria (With Revised Points of Focus, 2022)](https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022), the five categories and the criteria a SOC 2 examination measures against
- [ISO: ISO/IEC 27001:2022](https://www.iso.org/standard/27001), the information security management system standard and its Annex A controls

**Reference**

- [AICPA: System and Organization Controls (SOC) suite of services](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services), SOC 1, SOC 2 and SOC 3 and their intended users

**In practice**

- [SOC 2 Auditors: SOC 2 observation period explained](https://soc2auditors.org/insights/soc-2-observation-period-explained/), how Type 2 periods are chosen in practice and why the AICPA sets no fixed length
