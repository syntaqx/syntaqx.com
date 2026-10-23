+++
title = "Network Certification"
description = "Going live and staying live on card networks: processor and host certification, EMV levels, 3DS approval, and the twice-yearly network release calendar."
category = "Payments Industry"
order = 1424
part = "Running a Provider"
tags = ["payments", "certification", "emv", "iso-8583", "testing", "release-management"]
+++

Most software ships when its tests pass. Payment software that talks to a card network ships when someone else's tests pass. Before a new gateway, processor or terminal integration carries a single real transaction, a processor, a card network or both run scripted cases against it and sign off. After it's live, the networks change their message formats and rules on a fixed calendar, and every change is a deadline you didn't set.

I treat certification as an engineering discipline, not a paperwork phase. A team that plans for it builds a system that can replay a certification script on any build, ships network changes like dependency upgrades, and knows its next mandate date the way it knows its next release. A team that doesn't discovers in month eleven that its "finished" integration has a six-week certification queue in front of it.

## Who Certifies What

The layers mirror the parties in [How Card Payments Work](/docs/industries/payments/card-payments). Each one certifies the connection beneath it.

| You connect to | Who certifies | What they test |
| -------------- | ------------- | -------------- |
| A processor's API or host | The processor | Their message format and fields, every transaction type you'll send, error and reversal handling |
| A card network, as an acquirer processor | The network | The host interface itself: [ISO 8583](/docs/industries/payments/card-payments) authorization and clearing messages, chip data, each host platform |
| A payment terminal | EMVCo, then the network and acquirer | The device's chip and contactless interfaces (Level 1), its kernel (Level 2), and its integration end to end (Level 3) |
| 3-D Secure | EMVCo, then the networks | The 3DS Server, ACS or SDK against a specific version of the specification |
| Network tokens | Each network's token service | Your onboarding as a token requestor, before you can provision tokens |

Most platforms face only the first row, plus the last if they provision network tokens themselves ([Processor Routing](/docs/industries/payments/processor-routing#tokens-decide-how-free-you-are)): a processor certifies you, and the processor has already done the rest. The further down the stack you build, toward being the processor yourself ([Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider)), the more rows are yours.

![Certification path: unit and contract tests feed processor certification, then network and EMV certification, then a pilot, then production; a dashed loop returns from production to certification whenever a network release, a new terminal or kernel, or a new message field arrives.](/diagrams/certification-path.svg "Certification never ends at go-live. Every network release, new terminal or new message field sends the change back through the same tests, so the cheapest certification is the one your test suite already runs.")

## Processor Certification

Every processor that exposes a host interface, rather than a modern REST API, certifies its integrators before handing out production credentials. The pattern is the same everywhere:

- **A scripted test plan.** A list of transactions the processor expects you to run against its test host: approvals, declines, partial approvals, reversals, refunds, each card brand, each entry mode you'll support, and the edge cases its support team is tired of seeing in production.
- **Field-level validation.** The processor checks what you sent, field by field: the right values in the right positions, the right indicators for the right transaction types (an ecommerce indicator, a stored credential flag, a merchant category). A wrong indicator is the classic certification failure, because it's the classic production failure: it changes interchange, approval rates or liability without throwing an error.
- **Sign-off, then production.** Only a passed test plan earns production credentials, and the plan is tied to what you certified. Adding a new transaction type later means certifying that type.

## Card Network Certification

An acquirer processor, one that connects directly to the networks, certifies its host with each of them. The U.S. Payments Forum's guide to network testing describes the shape:

- **Mastercard's Network Interface Validation (NIV)** validates the interface between the customer's host and Mastercard's network, "with particular emphasis" on ISO 8583 interfaces and chip transactions, covering authorization and clearing.
- **Visa's acquirer host testing** validates full chip data (field 55 and its neighbors) in VisaNet authorization and full financial messages, for each unique host platform, with attended tests using physical test cards and a production-ready terminal. Terminal testing has to be done before host testing can begin.

Each network's simulator (Mastercard's Authorization Simulator, for one) becomes part of your test environment, licensed and kept current, because the networks expect you to use the latest version.

## Card-Present: EMV Levels 1, 2 and 3

A terminal certifies in three layers, which EMVCo defines and which are worth knowing by name because every terminal conversation uses them:

- **Level 1** covers the hardware: the electrical, mechanical and radio interfaces between the card and the device.
- **Level 2** covers the software kernel that runs the EMV contact and contactless logic. EMVCo approves Levels 1 and 2 together as "Terminal Type Approval", and this is the terminal vendor's job.
- **Level 3** validates the device integrated with its acceptance infrastructure, end to end through your host to the network. It's the acquirer's job, and it's where your software lives.

Level 3 is network by network. Visa's Acquirer Device Validation Toolkit (ADVT) is a set of test cards and scripts for terminals that already have Level 1 and 2 approval, configured for deployment, and Visa requires it before acquirers first deploy contact chip terminals, with a contactless counterpart (CDET). Mastercard's Terminal Integration Process (M-TIP) tests each combination of Level 2 kernel and payment application intended for the field, and only after the host has passed NIV. Either way, the trigger to test again is change: new hardware, new payment software, new configuration, or a change to how chip data is authorized. [Card-Present Payments](/docs/industries/payments/card-present) covers what those terminals do.

## 3-D Secure and Tokens

The 3DS components in [SCA & 3-D Secure](/docs/industries/payments/strong-customer-authentication) carry their own approvals. EMVCo approves a 3DS Server, an Access Control Server or an SDK against specific versions of the EMV 3-D Secure specification, through accredited labs, and the networks layer their own programs on top. A new specification version means testing again, so picking a 3DS vendor means picking their certification roadmap too. Network tokens ([Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials)) work the same way: before you can provision a token, each network's token service onboards you as a token requestor.

## The Calendar You Don't Control

Visa and Mastercard both change their specifications on a fixed rhythm, twice a year, in April and October. Visa calls its releases VisaNet Business Enhancements; Mastercard names its releases by quarter, like 26.Q2 and 26.Q4. Each release carries mandates: new fields, new values, new rules, each with an effective date by which acquirers and processors must support it. Processors and issuer platforms certify against each release and publish which mandates they support.

That rhythm should shape your own release planning:

- **Track mandates like dependencies with deadlines.** Every network bulletin is triaged when it's published: affects us or not, by which date, owned by whom. The deadline is the network's, and missing it means transactions that no longer meet the specification your processor and the network expect.
- **Ship ahead, enable on time.** Build support for a new field behind a [feature flag](/docs/delivery/feature-flags) per processor or network, deploy it early, and switch it on at the effective date, the same way any risky change rolls out.
- **Version the message specification.** Your ISO 8583 or processor message definitions are code, versioned with the release they implement, so you can say which build supports which mandate.
- **Freeze around the dates.** The weeks around April and October are when processors cut over. It's a poor time for unrelated changes to your payment path.

## Build for Certification

Certification goes well when it's the last run of tests you already have, rather than the first time anyone tried the scenarios.

- **Turn every certification script into an automated test.** Each scripted case becomes a [contract test](/docs/engineering/testing) against a recorded or simulated host, with the expected message asserted field by field. Then recertifying after a change is a test run, not a project.
- **Deterministic test fixtures.** Certification hosts react to specific test card numbers and amounts (one amount approves, another declines with a given code). Keep them in fixtures, never in someone's notes.
- **A certification environment that can replay.** A build that passed certification must be reproducible. Record the exact message traffic of every certification run and keep it, because the next question from the processor or the network will be "what did you send on the 14th?"
- **Changes that touch messages get flagged in review.** A change to a field mapping, an indicator or a transaction type is a certification event. Code ownership on the message layer ([Code Ownership](/docs/engineering/code-ownership)) puts the people who know that in front of it.


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

- [U.S. Payments Forum: Payment Network Testing and Certification (PDF)](https://www.emv-connection.com/wp-content/uploads/2016/04/US_Payments_Forum_Payment-Network_Testing_Certification_Final_December_2017.pdf), Mastercard NIV, Visa acquirer host testing, M-TIP and ADVT, and the order they run in
- [Visa: U.S. EMV chip terminal testing requirements (PDF)](https://www.visa.com.hk/content/dam/VCOM/global/run-your-business/documents/visa-us-emv-chip-terminal-testing-requirement.pdf), ADVT and CDET and the changes that require testing again

**In practice**

- [Marqeta: Card network certifications 2021](https://www.marqeta.com/docs/developer-guides/card-network-certifications-2021), certification on the April and October VisaNet Business Enhancements and Mastercard releases 21.Q2 and 21.Q4
- [Marqeta: Card network certifications 2022](https://www.marqeta.com/docs/developer-guides/card-network-certifications-2022), the same cadence a year later, and which mandates needed platform changes
- [Marqeta: Card network certifications](https://www.marqeta.com/docs/developer-guides/card-network-certifications), the 2026 Visa and Mastercard releases and their dates
