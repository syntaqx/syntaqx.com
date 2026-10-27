+++
title = "Network Certification"
description = "Going live and staying live on card networks: processor and host certification, EMV levels, 3DS approval, and the twice-yearly network release calendar."
category = "Payments Industry"
order = 1438
part = "Running a Provider"
tags = ["payments", "certification", "emv", "iso-8583", "testing", "release-management"]
+++

[Inside a Processor](/books/payments/inside-a-processor) ended with the certification every message type needs before it carries traffic.

Most software ships when its tests pass. Payment software that talks to a card network ships when someone else's tests pass. Before a new gateway, processor or terminal integration carries a single real transaction, a processor, a card network or both run scripted cases against it and sign off. After it's live, the networks change their message formats and rules on a fixed calendar, and every change is a deadline you didn't set.

I treat certification as an engineering discipline, not a paperwork phase. A team that plans for it builds a system that can replay a certification script on any build, ships network changes like dependency upgrades, and knows its next mandate date the way it knows its next release. A team that doesn't discovers in month eleven that its "finished" integration has a six-week certification queue in front of it.

## Who Certifies What

The layers mirror the parties in [How Card Payments Work](/books/payments/card-payments). Each one certifies the connection beneath it.

| You connect to | Who certifies | What they test |
| -------------- | ------------- | -------------- |
| A processor's API or host | The processor | Their message format and fields, every transaction type you'll send, error and reversal handling |
| A card network, as an acquirer processor | The network | The host interface itself: [ISO 8583](/books/payments/inside-a-processor#one-authorization-end-to-end) authorization and clearing messages, chip data, each host platform |
| A payment terminal | EMVCo, then the network and acquirer | The device's chip and contactless interfaces (Level 1), its kernel (Level 2), and its integration end to end (Level 3) |
| 3-D Secure (3DS) | EMVCo, then the networks | The 3DS Server, ACS or SDK against a specific version of the specification |
| Network tokens | Each network's token service | Your onboarding as a token requestor, before you can provision tokens |

Most platforms face only the first row, plus the last if they provision network tokens themselves ([Processor Routing](/books/payments/processor-routing#tokens-decide-how-free-you-are)): a processor certifies you, and the processor has already done the rest. The further down the stack you build, toward being the processor yourself ([Becoming a Payment Provider](/books/payments/becoming-a-payment-provider)), the more rows are yours.

![Certification path: unit and contract tests feed processor certification, then network and EMV certification (host interface and chip data tests such as Mastercard NIV; terminal Level 3 tests such as Visa ADVT and Mastercard M-TIP), then a pilot, then production; a dashed loop returns from production to certification whenever a network release, a new terminal or kernel, or a new message field arrives.](/diagrams/certification-path.svg "Certification never ends at go-live. Every network release, new terminal or new message field sends the change back through the same tests, so the cheapest certification is the one your test suite already runs.")

## Processor Certification

Every processor that exposes a host interface, rather than a modern REST API, certifies its integrators before handing out production credentials. The pattern is the same everywhere:

- **A scripted test plan.** A list of transactions the processor expects you to run against its test host: approvals, declines, partial approvals, reversals, refunds, each card brand, each entry mode you'll support, and the edge cases its support team is tired of seeing in production.
- **Field-level validation.** The processor checks what you sent, field by field: the right values in the right positions, the right indicators for the right transaction types (an e-commerce indicator, a stored credential flag, a merchant category). A wrong indicator is the classic certification failure, because it's the classic production failure: it changes interchange, approval rates or liability without throwing an error.
- **Sign-off, then production.** Only a passed test plan earns production credentials, and the plan is tied to what you certified. Adding a new transaction type later means certifying that type.

## Card Network Certification

An acquirer processor, one that connects directly to the networks, certifies its host with each of them. The U.S. Payments Forum's testing white paper (version 5.0, September 2023) describes the shape, and says host testing is done once per platform, and again for any new acquirer processor endpoint:

- **Mastercard's Network Interface Validation (NIV)** validates the interface between the customer's host and Mastercard's network "with particular emphasis" on ISO 8583 interfaces and on contact and contactless chip transactions, covering authorization and clearing. Mastercard's project team picks the test cases for the session, reviews the simulator logs, and confirms a pass with a Testing Acknowledgement Notification letter that later projects can cite as proof.
- **Visa's acquirer host certification** validates full chip data (field 55 and the related fields) in V.I.P. authorization and full financial messages, for contact and contactless, on each unique host platform, using Visa's host test scripts and a production-ready chip device. Level 3 terminal testing has to be done before host testing can begin.

Each network's simulator (Mastercard's Authorization Simulator, for one) becomes part of your test environment, licensed and kept current, because the networks require the latest version.

## Card-Present: EMV Levels 1, 2 and 3

A terminal certifies in three layers, which EMVCo defines and which are worth knowing by name because every terminal conversation uses them:

- **Level 1** covers the hardware: the electrical, mechanical and radio interfaces between the card and the device.
- **Level 2** covers the software kernel that runs the EMV contact and contactless logic. EMVCo approves Levels 1 and 2 together as "Terminal Type Approval", and this is the terminal vendor's job.
- **Level 3** validates the device integrated with its acceptance infrastructure, end to end through your host to the network. It's the acquirer's job, and it's where your software lives.

Level 3 is network by network, but the tooling has converged. EMVCo defined an L3 testing framework: it qualifies third-party test tools, and each network ships its test cases and card images to those tools in one standard format, so one tool can run every network's tests. Visa's own toolkits, the Acquirer Device Validation Toolkit (ADVT) for contact and CDET for contactless, were the long-standing way to do it; in January 2021 Visa made its EMV-format L3 test files the production route outside the US, keeping the old toolkits as a secondary option during the transition, while US testing still referenced the US versions of ADVT and CDET. Under the framework, Visa testing runs on an EMVCo-qualified, Visa-confirmed tool against a host connected to Visa's certification service or a Visa-confirmed simulator, and Visa issues no letter of approval: the confirmation email from its Chip Compliance Reporting Tool is the evidence. Mastercard's Terminal Integration Process (M-TIP) tests each combination of Level 2 kernel and payment application intended for the field, on EMVCo-qualified L3 tools, and only after the host has passed NIV. Either way, the trigger to test again is change: new hardware, a new kernel, new payment software, a configuration change that affects the payment application, or a change to how chip data travels between terminal, acquirer and network. [Card-Present Payments](/books/payments/card-present) covers what those terminals do.

## 3-D Secure and Tokens

The 3DS components in [SCA & 3-D Secure](/books/payments/strong-customer-authentication) carry their own approvals. EMVCo approves a 3DS Server, an Access Control Server or an SDK against specific versions of the EMV 3-D Secure specification, through accredited labs, and the networks layer their own programs on top. A new specification version means testing again, so picking a 3DS vendor means picking their certification roadmap too. Network tokens ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)) work the same way: before you can provision a token, each network's token service onboards you as a token requestor.

## The Calendar You Don't Control

Visa and Mastercard both change their specifications on a fixed rhythm, twice a year, in April and October. Visa calls its releases VisaNet Business Enhancements; Mastercard names its releases by quarter, like 26.Q2 and 26.Q4. Each release carries mandates: new fields, new values, new rules, each with an effective date by which acquirers and processors must support it. Processors and issuer platforms certify against each release and publish which mandates they support.

That rhythm should shape your own release planning:

- **Track mandates like dependencies with deadlines.** Every network bulletin is triaged when it's published: affects the platform or not, by which date, owned by whom. The deadline is the network's, and missing it means transactions that no longer meet the specification your processor and the network expect.
- **Ship ahead, enable on time.** Build support for a new field behind a [feature flag](/docs/delivery/feature-flags) per processor or network, deploy it early, and switch it on at the effective date, the same way any risky change rolls out.
- **Version the message specification.** Your ISO 8583 or processor message definitions are code, versioned with the release they implement, so you can say which build supports which mandate.
- **Freeze around the dates.** The weeks around April and October are when processors cut over. It's a poor time for unrelated changes to your payment path.

## How to Build It

Certification goes well when it's the last run of tests you already have, rather than the first time anyone tried the scenarios.

- **Turn every certification script into an automated test.** Each scripted case becomes a [contract test](/docs/quality/testing) against a recorded or simulated host, with the expected message asserted field by field. Then recertifying after a change is a test run, not a project.
- **Deterministic test fixtures.** Certification hosts react to specific test card numbers and amounts (one amount approves, another declines with a given code). Keep them in fixtures, never in someone's notes.
- **A certification environment that can replay.** A build that passed certification must be reproducible. Record the exact message traffic of every certification run and keep it, because the next question from the processor or the network will be "what did you send on the 14th?"
- **Changes that touch messages get flagged in review.** A change to a field mapping, an indicator or a transaction type is a certification event. Code ownership on the message layer ([Code Ownership](/docs/engineering/code-ownership)) puts the people who know that in front of it.

## Auditing

Certification records are evidence twice: when a network or processor asks what you sent, and when a mandate date passes and someone asks whether you were ready. The general design is in [Audit Trails](/docs/architecture/audit-trails); for certification, make sure the record shows:

- **Every certification run, kept whole.** The build, the message specification version, the test plan and its cases, the recorded traffic, and the result, so "what did you send on the 14th?" is a lookup.
- **Every approval with what it covered.** The letter or confirmation (Mastercard's Testing Acknowledgement Notification, Visa's reporting tool confirmation, a processor's sign-off), stored with the transaction types, entry modes, terminals and kernels it approved, because adding anything outside that scope means testing again.
- **Every mandate's triage.** Each network bulletin with its decision (affects the platform or not), owner, effective date, and the build and flag change that met it, with the date the flag was switched on.
- **Every change to the message layer,** with its reviewer and whether it was treated as a certification event, so an unreviewed indicator change is found before a network finds it.

## What This Means for the System You Build

- **Know which rows of the certification table are yours,** and put the certification queue in the schedule.
- **Every certification script is an automated contract test,** with the host's test cards and amounts in fixtures.
- **Message definitions are versioned code,** and any change to them is flagged in review as a certification event.
- **Track network mandates like dependencies with deadlines:** ship early behind a flag, enable on the effective date.
- **Record and keep every certification run's traffic,** so any build can be reproduced.
- **Freeze unrelated payment changes around April and October.**

## References

**Specifications**

- [EMVCo: What is Level 3 terminal integration testing?](https://www.emvco.com/knowledge-hub/what-is-level-3-terminal-integration-testing/), Levels 1 and 2 as Terminal Type Approval and Level 3 as end-to-end integration testing by acquirers and processors

**Reference**

- [U.S. Payments Forum: EMV Testing and Certification White Paper, version 5.0 (September 2023, PDF)](https://www.uspaymentsforum.org/wp-content/uploads/2024/04/Payment-Network-Host-and-Level-3-Requirements-Final-09292023.pdf), host testing once per platform, Mastercard NIV and its acknowledgement letter, Visa acquirer host certification after L3 testing, the EMVCo L3 framework, Visa L3 reporting without a letter of approval, M-TIP after NIV, and the changes that require retesting
- [Visa: Production version of EMV-compliant L3 test files available (January 2021, PDF)](https://usa.review.visa.com/content/dam/VCOM/global/support-legal/documents/production-version-of-emv-compliant-l3-test-files-available.pdf), EMV-format L3 testing outside the US, with ADVT, CDET and VpTT kept as a secondary option during the transition
- [Visa: U.S. EMV chip terminal testing requirements (2018, PDF)](https://www.visa.com.hk/content/dam/VCOM/global/run-your-business/documents/visa-us-emv-chip-terminal-testing-requirement.pdf), ADVT and CDET for US terminals

**In practice**

- [Marqeta: Card network certifications 2021](https://www.marqeta.com/docs/developer-guides/card-network-certifications-2021), certification on the April and October VisaNet Business Enhancements and Mastercard releases 21.Q2 and 21.Q4
- [Marqeta: Card network certifications 2022](https://www.marqeta.com/docs/developer-guides/card-network-certifications-2022), the same cadence a year later, and which mandates needed platform changes
- [Marqeta: Card network certifications](https://www.marqeta.com/docs/developer-guides/card-network-certifications), the 2026 Visa and Mastercard releases and their dates
