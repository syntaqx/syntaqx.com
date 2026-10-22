+++
title = "PCI DSS"
description = "What PCI DSS v4.0.1 demands of engineering: merchant and service provider levels, SAQs versus a QSA's report, and shrinking scope until most systems are out."
category = "Compliance"
order = 901
tags = ["compliance", "pci", "payments", "security"]
+++

A card number is a bearer credential: whoever holds it can try to spend it, and the bank that issued it eats the fraud. PCI DSS is how the card networks make thousands of companies they don't control protect it the same way. Visa, Mastercard, American Express, Discover and JCB founded the PCI Security Standards Council to write one standard instead of five, then made compliance a condition of accepting their cards. So it's a contract, not a law: the networks enforce it through acquiring banks, acquirers push it onto merchants, and merchants push it onto their vendors.

For engineering it asks two questions. Which systems can see card data, or affect the security of the ones that do? And can you prove to an outsider that those systems meet hundreds of detailed requirements? The first is a design decision you control. The second is the bill for getting the first one wrong.

This describes how the regime works and what it asks of a design. It isn't assessment advice: your acquirer, and at higher levels your assessor, decide what applies to you.

## The Current Standard

The current version is **PCI DSS v4.0.1**, published June 11, 2024 as a limited revision of v4.0 that clarified wording and added or removed no requirements. v4.0 was retired at the end of 2024. What changed engineering work was v4.0's **future-dated requirements**, mandatory since **March 31, 2025**: multi-factor authentication for all access into the cardholder data environment (not just remote), an inventory and integrity check of every script on a payment page, automated log review, and a targeted risk analysis to justify the frequency of any control the standard lets you set.

v4 also added the **customized approach**: state a requirement's objective, design your own control, and have the assessor test that it meets the objective. It suits mature organizations whose architecture doesn't fit the defined wording, and it costs more evidence, not less.

## Merchant or Service Provider

The standard covers anyone who stores, processes or transmits cardholder data, or can affect its security, in one of two roles. The role matters more than any level.

- **A merchant** accepts cards for its own goods or services. Its obligation runs to its acquirer.
- **A service provider** handles card data on behalf of another business, or manages systems that can affect its security: gateways, processors, payment facilitators, tokenization vaults, hosts with access to a cardholder data environment. Its obligation runs to every customer that relies on it.

One company can be both: Stripe is a merchant when it bills you for its own subscription, and a service provider for every business that sends it payments. Touch another company's card data and you're a service provider, with more requirements, a lower bar for the top level, and customers who want your Attestation of Compliance before they sign. [Becoming a Payment Provider](/docs/payments/becoming-a-payment-provider) covers that path end to end.

## Levels

The Council doesn't define levels. Each network sets thresholds by annual transaction volume, your acquirer tells you which level you validate at, and a breach can move you up regardless. Visa's program is the most cited:

| Level | Merchants (Visa transactions per year) | Service providers |
| --- | --- | --- |
| 1 | Over 6 million, or any merchant Visa names Level 1 | Over 300,000, plus all VisaNet processors |
| 2 | 1 million to 6 million | Under 300,000 |
| 3 | 20,000 to 1 million e-commerce | |
| 4 | Under 20,000 e-commerce, and all others up to 1 million | |

The service provider line is low. A payments startup crosses 300,000 transactions quickly, and Visa lets a Level 2 provider validate as Level 1 to appear on its public registry, which large customers check. A serious service provider plans for Level 1 from the start.

What the level changes is **who checks your work**:

- **Level 1** is assessed annually by a **Qualified Security Assessor (QSA)**, who samples systems, reads configurations, interviews engineers, and writes a **Report on Compliance (ROC)**.
- **Lower levels** usually self-assess with a **Self-Assessment Questionnaire (SAQ)**, though an acquirer can require more.
- **Internet-facing systems in scope** pass quarterly external scans by an **Approved Scanning Vendor (ASV)**.
- **Every assessment** ends in an **Attestation of Compliance (AOC)**, the short signed summary your acquirer and customers actually ask for.

## Which SAQ: Architecture Decides

Which SAQ you're eligible for depends on how your integration handles card data, which makes it the clearest proof that architecture is a compliance decision. Card-present setups have their own SAQs; these are the e-commerce ones engineering chooses between:

| SAQ | Who it's for | What you answer |
| --- | --- | --- |
| **A** | Every element of the payment page comes from a compliant provider: a redirect, or the provider's iframe | The smallest set: vendor management and a few access and policy controls |
| **A-EP** | Processing is outsourced, but your site controls how the payment page reaches the browser (direct post, or the provider's JavaScript on your page) | Much more: your web servers are in scope for hardening, patching, logging and testing |
| **D** | Everything else, including anyone who stores card numbers. **SAQ D for Service Providers** is the only SAQ a service provider can use | The whole standard |

The line between A and A-EP moves with a single integration choice. In January 2025 the Council revised SAQ A, removing the payment-page script requirements and adding an eligibility criterion instead: the merchant confirms its site isn't susceptible to script attacks that could affect its e-commerce system. The script requirements still apply in full to A-EP, D and assessed entities. "We use the provider's iframe" doesn't end the conversation: the page hosting the iframe can still be modified to show a fake form.

## Shrink the Scope

PCI DSS applies to the **cardholder data environment** (CDE), every system that stores, processes or transmits card data, and to every system connected to it or able to affect it. Scope is the cost driver, so the most valuable PCI work is making the CDE small.

- **Tokenize at the edge,** so your servers only ever see a token. [Sensitive Data](/docs/payments/sensitive-data) covers the pattern and the small vault behind it.
- **Segment the network.** Segmentation isn't required, but without it the whole network is in scope. If you rely on it, penetration-test it: every 12 months for merchants, every six months for service providers (requirements 11.4.5 and 11.4.6).
- **Never store sensitive authentication data** (full track data, the card verification code, PINs) after authorization, even encrypted.

## The Twelve Requirements

The twelve top-level requirements are stable across versions; v4 changed the detail beneath them. Read them as an engineering checklist for the CDE:

| # | Requirement | For engineering |
| --- | --- | --- |
| 1 | Network security controls | Documented, reviewed rules; deny by default |
| 2 | Secure configurations | No vendor defaults, hardened images |
| 3 | Protect stored account data | Don't store it; if you must, make it unreadable and manage the keys |
| 4 | Strong cryptography in transit | TLS wherever card data crosses an open network |
| 5 | Protect against malware | Anti-malware where it applies, a documented reason where it doesn't |
| 6 | Secure systems and software | Secure development, code review, patching windows, payment-page script integrity |
| 7 | Restrict access by need to know | Least privilege, reviewed on a schedule |
| 8 | Identify and authenticate users | Unique IDs, MFA into the CDE, no shared accounts |
| 9 | Restrict physical access | Mostly your cloud provider's AOC, plus your offices and devices |
| 10 | Log and monitor access | Audit logs on every CDE component, reviewed automatically, kept a year |
| 11 | Test security regularly | ASV scans, internal scans, penetration tests, payment-page change detection |
| 12 | Policies and programs | Risk analysis, incident response, vendor management, training |

Most of this is what a good platform team does anyway. What PCI adds is **evidence**: the rule written down, the review dated, the exception approved. A pipeline that enforces review, keeps an audit trail and deploys only from main is worth more to an assessor than any policy document.

**Compensating controls** cover a requirement you legitimately can't meet as written: the alternative must meet the original's intent, go beyond what other requirements already demand, and be re-validated yearly. An assessment full of them means the architecture is fighting the standard.

The Council publishes a family beyond DSS (PIN Security, P2PE, 3DS Core, the Secure Software standards that replaced PA-DSS); [Becoming a Payment Provider](/docs/payments/becoming-a-payment-provider) covers when each applies.

## Checklist

- Know your role for each flow: merchant, service provider, or both.
- Draw the CDE. If you can't, it's larger than you think.
- Choose the integration with the smallest SAQ the business can live with, and treat the page hosting the payment form as in scope for tampering.
- Keep a current AOC from every service provider in your card flow, with a written split of who owns which requirement.
- Make the pipeline produce evidence as a side effect: reviewed changes, audit logs, access reviews, scan results.
- Put scans, penetration tests and risk analyses on a calendar with owners. Missed dates are the most common finding.

## References

**Specifications**

- [PCI Security Standards Council: Document Library](https://www.pcisecuritystandards.org/document_library/), the standard, SAQs, AOC templates and supplemental guidance
- [PCI Security Standards Council: Standards overview](https://www.pcisecuritystandards.org/standards/), the family of PCI standards and their status

**Reference**

- [PCI SSC Blog: Just Published: PCI DSS v4.0.1](https://blog.pcisecuritystandards.org/just-published-pci-dss-v4-0-1), the June 2024 limited revision, v4.0 retirement and the March 31, 2025 date for future-dated requirements
- [PCI SSC Blog: Important Updates Announced for Merchants Validating to SAQ A](https://blog.pcisecuritystandards.org/important-updates-announced-for-merchants-validating-to-self-assessment-questionnaire-a), the January 2025 SAQ A revision and its new eligibility criterion
- [Visa: Data Security Program, Keeping Cardholder Data Safe (PDF)](https://in.review.visa.com/content/dam/VCOM/download/merchants/Visa-Data-Security-Program-Keeping-Cardholder-Data-Safe-VOL-02.06.13.pdf), Visa's merchant and service provider level thresholds (dated 2013; confirm current levels with your acquirer)
- [Visa: Account Information Security Program and PCI](https://corporate.visa.com/en/resources/security-compliance.html), levels set by annual volume and enforced through acquirers
- [Wikipedia: Payment Card Industry Data Security Standard](https://en.wikipedia.org/wiki/Payment_Card_Industry_Data_Security_Standard), the twelve v4.0.1 requirements, citing the standard
- [Cloudaware: PCI DSS v4.0.1 Requirement 11.4.6](https://ce.prod.cloudaware.com/frameworks/pci-dss-v4.0.1/11/04/06), segmentation penetration tests every six months for service providers

**In practice**

- [Stripe: Integration security guide](https://docs.stripe.com/security/guide), how integration choice determines which SAQ a merchant qualifies for
