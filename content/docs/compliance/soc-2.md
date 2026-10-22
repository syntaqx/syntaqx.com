+++
title = "SOC 2"
description = "SOC 2 as an engineer meets it: the Trust Services Criteria, Type 1 versus Type 2, and how reviews, pipelines and on-call become the evidence auditors test."
category = "Compliance"
order = 903
tags = ["compliance", "soc2", "security", "audit"]
+++

Every B2B customer wants to know whether you'll lose their data, and none of them can audit you. Before SOC 2, each enterprise deal came with a security questionnaire of a few hundred rows, answered by hand and trusted on faith. A SOC 2 report replaces it with one document: an independent CPA firm examined your controls and says, in a formal opinion, whether they were designed well and, for a Type 2, whether they operated over a period. Procurement accepts it because someone with a license and liability signed it. No law or card network requires one; customers do, which is where it sits in [The Payments Rulebook](/docs/compliance/payments-rulebook).

That's also its limit. **SOC 2 attests that you do what you said you'd do.** You write the controls; the auditor tests that they exist and that you followed them. Weak but consistently followed controls can earn a clean report, and excellent engineering can earn exceptions because nobody kept the evidence. It measures discipline and honesty about your own process, which is valuable, but it doesn't certify that you're secure.

This explains what SOC 2 asks of an engineering organization. It isn't audit advice; what your report covers depends on the scope you agree with your auditor.

## The Trust Services Criteria

The AICPA's **Trust Services Criteria** are the yardstick. They date from 2017; the 2022 revision updated the supporting *points of focus*, not the criteria. There are five categories:

| Category | The question it answers |
| --- | --- |
| **Security** | Is the system protected against unauthorized access? Always in scope: its *common criteria* are in every report |
| **Availability** | Is the system available as committed? |
| **Processing Integrity** | Is processing complete, valid, accurate, timely and authorized? |
| **Confidentiality** | Is confidential information protected as committed? |
| **Privacy** | Is personal information collected, used, retained and disposed of as committed? |

Choose categories beyond Security by what customers rely on you for. A payments API is a natural fit for Availability and Processing Integrity. Privacy is a large commitment; don't add categories to look thorough.

## Type 1 and Type 2

- **Type 1** opines on the *design* of your controls at a point in time: "did you build sensible controls?" It's fast, and useful mainly as a first step.
- **Type 2** opines on design *and operating effectiveness* over a period, sampling tickets, pull requests, access reviews, alerts and incidents across it: "did the controls work, every time, for months?" It's the one customers ask for.

The AICPA doesn't fix the period's length. Auditors rarely accept less than about three months for a first report, and twelve-month periods run back to back once you're on an annual cycle. Between reports, customers ask for a **bridge letter**: your management's (not the auditor's) statement that nothing material has changed. It's only as good as your word, which is why it expires when the next report arrives. A **SOC 3** is the same examination in a short public form for marketing pages; procurement wants the SOC 2.

## What Auditors Test

The auditor reads your **system description** (what the system is, its boundaries, the controls you claim) and tests each control by inquiry, observation, inspection and re-performance. For a Type 2 they sample across the period: "show me 25 production changes from these dates and the approval for each." A control that worked 24 times and was bypassed once is an exception, listed in the report your customers read.

Two terms shape scope:

- **Subservice organizations,** like your cloud provider, processor and identity provider, run controls you rely on. Most reports *carve them out*: you state the dependency and review their SOC reports, which becomes one of your controls.
- **Complementary user entity controls** are what customers must do for the system to be secure, like managing their users and protecting their API keys. Listing them limits your responsibility to what you control.

## Engineering Is the Evidence

A well-run team already produces most of the evidence. The work is making it automatic and keeping it.

| Control area | What the auditor wants | Where it comes from |
| --- | --- | --- |
| **Change management** | Every production change reviewed, tested and approved by someone other than the author | Branch protection with required reviews and checks; [Commits & Code Review](/docs/engineering/commits-and-reviews), [CI Pipelines](/docs/delivery/ci-pipelines). The pull request *is* the change ticket |
| **Logical access** | Access by role, removed promptly on departure, reviewed on a schedule | SSO everywhere, group grants, a recorded quarterly access review |
| **Incident response** | Incidents detected, tracked, communicated and learned from | Alerting, an incident channel and a written review; [Incident Response](/docs/operations/incident-response) |
| **Vulnerability management** | Vulnerabilities fixed within defined windows | Scanning with SLAs by severity; [Vulnerability Management](/docs/security/vulnerability-management) |
| **Vendor management** | Vendors assessed before use and yearly | A vendor inventory with their SOC reports and a named reviewer |
| **Backups and recovery** | Backups run and restores are tested | Recorded restore tests; [Disaster Recovery](/docs/operations/disaster-recovery) |
| **Monitoring** | Security events logged and looked at | Centralized logs, alerts with owners; [Observability](/docs/operations/observability) |
| **Risk and policy** | Risks assessed, policies current and acknowledged | A yearly risk assessment and signed policies |

Two things decide the cost. **Controls should describe what you already do:** write "all changes require two approvals" while branch protection requires one, and you've manufactured an exception. And **evidence should be a side effect:** a control that depends on someone screenshotting a dashboard each quarter fails the quarter they're on leave.

Compliance automation platforms connect to your cloud, identity provider, code host and HR system, check configuration continuously, collect evidence and give the auditor a portal. For a first report they save weeks, and between audits they flag drift the day it happens. They don't do the work: a platform can tell you a departed employee still has access, but someone removes it and records why it took four days. A team with very few systems can run SOC 2 from a spreadsheet; past a handful, the platform pays for itself.

## SOC 2 and ISO 27001

- **SOC 2** is an attestation by a CPA firm against US criteria, detailing your controls and how each test went. It's the norm in North America.
- **ISO/IEC 27001** certifies your *information security management system*: how you assess risk, choose controls and improve. A certification body issues a certificate, with surveillance audits between recertifications. Annex A lists 93 reference controls in the 2022 edition, and your Statement of Applicability says which you use. It's the norm in Europe and much of the world.

The controls overlap heavily, and companies selling internationally often hold both. ISO 27001 says your management system works; SOC 2 shows a customer exactly which controls were tested and how they did.

## References

**Specifications**

- [AICPA: 2017 Trust Services Criteria (With Revised Points of Focus, 2022)](https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022), the five categories and the criteria a SOC 2 examination measures against
- [ISO: ISO/IEC 27001:2022](https://www.iso.org/standard/27001), the information security management system standard and its Annex A controls

**Reference**

- [AICPA: System and Organization Controls (SOC) suite of services](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services), SOC 1, SOC 2 and SOC 3 and their intended users

**In practice**

- [SOC 2 Auditors: SOC 2 observation period explained](https://soc2auditors.org/insights/soc-2-observation-period-explained/), how Type 2 periods are chosen in practice and why the AICPA sets no fixed length
