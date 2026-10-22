+++
title = "PCI DSS"
description = "What PCI DSS v4.0.1 demands of engineering: merchant and service provider levels, SAQs versus a QSA's report, and shrinking scope until most systems are out."
category = "Compliance"
order = 9.6
tags = ["compliance", "pci", "payments", "security"]
+++

PCI DSS exists because the card networks needed a way to make thousands of companies they don't control protect the same piece of data. A card number is a bearer credential: whoever holds it can try to spend it, and the bank that issued it eats the fraud. Visa, Mastercard, American Express, Discover and JCB founded the PCI Security Standards Council to write one standard instead of five, and then made compliance a condition of accepting their cards. That origin explains almost everything about how it works. It's a contractual obligation, not a law. The networks enforce it through the acquiring banks, the acquirers push it onto merchants, and the merchants push it onto their vendors.

For engineering, the standard asks two questions. Which of your systems can see card data, or affect the security of the systems that do? And can you prove, to someone outside the company, that those systems meet hundreds of detailed requirements? The first question is a design decision you control. The second is the bill for getting the first one wrong.

This page describes how the regime works and what it asks of a system's design. It isn't legal or assessment advice. Your acquirer and, at the higher levels, your assessor decide what applies to you.

## The Current Standard

The current version is **PCI DSS v4.0.1**, published on June 11, 2024 as a limited revision of v4.0: it clarified wording and fixed errors, and added or removed no requirements. v4.0 itself was retired at the end of 2024. The part that changed engineering work was v4.0's **future-dated requirements**, which were best practice until **March 31, 2025** and mandatory after it. Among them: multi-factor authentication for all access into the cardholder data environment (not just remote access), an inventory and integrity check of every script on a payment page, automated review of audit logs, and a targeted risk analysis to justify the frequency of any control the standard lets you set yourself.

v4 also added the **customized approach**: instead of meeting a requirement as written, you state the control's objective, design your own control, and have the assessor test that it achieves the objective. It's a real option for mature organizations whose architecture doesn't fit the defined wording, and it costs more evidence, not less.

## Who It Applies To

Anyone who stores, processes or transmits cardholder data, and anyone whose systems could affect the security of that data. The standard sorts them into two roles, and the distinction matters more than any level:

- **A merchant** accepts cards as payment for its own goods or services. A merchant's obligation runs to its acquirer.
- **A service provider** stores, processes or transmits card data on behalf of another business, or manages systems that could affect its security. Payment gateways, processors, payment facilitators, tokenization vaults, and hosting providers with access to a cardholder data environment are all service providers. A service provider's obligation runs to every customer that relies on it, and through them to the networks.

One company can be both. Stripe is a merchant when it charges you for its own subscription and a service provider for every business that sends it payments. The moment you build something that touches another company's card data, you're a service provider, with more requirements, a lower threshold for the top level, and customers who will ask for your Attestation of Compliance before they sign. [Becoming a Payment Provider](/docs/payments/becoming-a-payment-provider) covers that path end to end.

## Levels and What Each One Does

Levels aren't defined by the PCI Council. Each card network sets its own thresholds by annual transaction volume, and your acquirer tells you which level you're validating at; the two often move together, but they can diverge, and a breach can move you up regardless of volume. Visa's published program is the most cited reference.

| Level | Merchants (Visa transactions per year) | Service providers |
| --- | --- | --- |
| 1 | Over 6 million, all channels, or any merchant a Visa region names Level 1 | Over 300,000 Visa transactions, plus all VisaNet processors |
| 2 | 1 million to 6 million, all channels | Under 300,000 |
| 3 | 20,000 to 1 million e-commerce | |
| 4 | Under 20,000 e-commerce, and all others up to 1 million | |

Note how low the service provider line is. 300,000 transactions a year is a few hundred customers' worth of volume. A payments startup crosses it quickly, and Visa's own program lets a Level 2 service provider validate as Level 1 to appear on its public registry of service providers, which large customers check. In practice, a serious service provider plans for Level 1 from the start.

What the level changes is **who checks your work**:

- **Level 1** is assessed annually by a **Qualified Security Assessor (QSA)**, an independent firm certified by the Council, which tests the controls and writes a **Report on Compliance (ROC)**. The ROC is long and evidence-heavy: the assessor samples systems, reads configurations, interviews engineers and watches processes run.
- **Lower levels** usually self-assess with a **Self-Assessment Questionnaire (SAQ)**, though an acquirer can require more, and a Level 4 merchant's requirements are set by its acquirer.
- **Everyone with internet-facing systems in scope** runs quarterly external vulnerability scans by an **Approved Scanning Vendor (ASV)** and must pass them.
- **Every assessment** ends in an **Attestation of Compliance (AOC)**, the short signed summary that you hand to your acquirer and your customers. The AOC is what people actually ask for.

## Which SAQ: The Shape of Your Integration

The SAQ you're eligible for is decided by how your integration handles card data, and it's the clearest demonstration that architecture is a compliance decision. There are SAQs for card-present setups (B, B-IP, C, C-VT, P2PE); the e-commerce ones are the ones engineering chooses between:

| SAQ | Who it's for | Roughly what you answer |
| --- | --- | --- |
| **A** | Card-not-present merchants that fully outsource payment: every element of the payment page comes directly from a PCI DSS compliant provider (a redirect, or the provider's iframe) | The smallest set: vendor management, a handful of access and policy controls |
| **A-EP** | E-commerce merchants that outsource processing, but whose own website controls how the payment page reaches the browser (direct post, or a provider's JavaScript on your page) | Much more: your web servers are in scope, so hardening, patching, logging and testing apply to them |
| **D** | Everything else, including any merchant that stores card numbers. **SAQ D for Service Providers** is the only SAQ a service provider can use | The whole standard |

The line between A and A-EP is the one engineers move with a single integration choice. In January 2025 the Council revised SAQ A, removing the payment-page script requirements and replacing them with an eligibility criterion: the merchant must confirm its site isn't susceptible to attacks from scripts that could affect its e-commerce system. The script requirements still apply in full to SAQ A-EP, SAQ D and assessed entities. The lesson is that "we use the provider's iframe" doesn't end the conversation: the page that hosts the iframe is still a page an attacker can modify to show a fake form.

## Scope Reduction Is the Strategy

PCI DSS applies to the **cardholder data environment** (CDE), meaning every system that stores, processes or transmits card data, and to every system connected to it or able to affect its security. Scope is the cost driver, so the most valuable engineering work in PCI is making the CDE small:

- **Tokenize at the edge.** Card numbers go from the browser or device straight to a vault or provider through hosted fields or an SDK; your servers only ever see a token. [Sensitive Data](/docs/payments/sensitive-data) covers the pattern and what you may keep.
- **Segment the network.** If you must run a CDE, isolate it so that systems outside it can't reach it. Segmentation isn't required, but without it the whole network is in scope. If you rely on it, it must be tested by penetration test, and service providers test it twice as often as merchants.
- **Make the vault boring.** One small service, its own keys, its own deploy pipeline, an interface of tokenize and detokenize-toward-the-processor, and no convenience endpoints. Every feature added to the vault is a feature the assessor tests.
- **Never store what you can't.** Sensitive authentication data (full track data, the card verification code, PINs) may not be kept after authorization, even encrypted.

## The Twelve Requirements at a Glance

The twelve top-level requirements are stable across versions; the detail beneath them is where v4 changed. Read them as an engineering checklist for the CDE:

| # | Requirement | What it means for engineering |
| --- | --- | --- |
| 1 | Network security controls | Firewalls and security groups with documented, reviewed rules; deny by default |
| 2 | Secure configurations | No vendor defaults, hardened images, one primary function per server or container |
| 3 | Protect stored account data | Don't store it; if you must, render it unreadable and manage the keys properly |
| 4 | Strong cryptography in transit | TLS everywhere card data crosses an open network, with an inventory of certificates |
| 5 | Protect against malware | Anti-malware where it applies, and a documented reason where it doesn't |
| 6 | Secure systems and software | Secure development, code review, patching within defined windows, script integrity on payment pages |
| 7 | Restrict access by need to know | Least privilege, role-based, reviewed on a schedule |
| 8 | Identify and authenticate users | Unique IDs, MFA into the CDE, no shared accounts, managed service accounts |
| 9 | Restrict physical access | Mostly your cloud provider's AOC, plus your own offices and devices |
| 10 | Log and monitor access | Audit logs on every CDE component, reviewed (now automatically), retained for a year |
| 11 | Test security regularly | ASV scans, internal scans, penetration tests, change detection on payment pages |
| 12 | Policies and programs | Risk analysis, incident response, vendor management, training, written responsibilities |

Most of these are things a good platform team does anyway. What PCI adds is **evidence**: the rule written down, the review dated, the exception approved. A pipeline that enforces code review, keeps an audit trail and deploys only from main is worth more to an assessor than any policy document.

**Compensating controls** exist for when a requirement can't be met as written for a legitimate technical or business constraint. The alternative must meet the intent and rigor of the original, go beyond what other requirements already demand, and be documented and re-validated every year. They're an escape hatch, not a plan; an assessment full of them is a sign the architecture is fighting the standard.

## Related Standards

PCI DSS is the one everyone means, but the Council publishes a family. The ones a payments company meets:

- **PCI PIN Security** for anyone handling PIN data or managing the keys that protect it.
- **PCI P2PE** (point-to-point encryption) for card-present solutions that encrypt at the terminal; a merchant using a validated P2PE solution qualifies for a much smaller SAQ.
- **PCI 3DS Core** for operators of 3-D Secure servers, directory servers and access control servers, the infrastructure behind cardholder authentication.
- **PCI Secure Software Standard** and **Secure SLC** for vendors of payment software; they replaced PA-DSS, which was retired in 2022.
- **Token Service Provider** and **Card Production** standards for the issuing side.

## Engineering Checklist

- Know which role you're in for each flow: merchant, service provider, or both.
- Draw the CDE. If you can't, it's larger than you think.
- Choose the integration that gives the smallest SAQ the business can live with, and treat the page hosting the payment form as in scope for tampering.
- Keep a current AOC from every service provider in your card flow, and a written split of who owns which requirement.
- Make the delivery pipeline produce evidence as a side effect: reviewed changes, audit logs, access reviews, scan results.
- Put the ASV scan, penetration test and risk analyses on a calendar with owners. Missed dates are the most common finding.

## References

**Specifications**

- [PCI Security Standards Council: Document Library](https://www.pcisecuritystandards.org/document_library/), the standard, SAQs, AOC templates and supplemental guidance
- [PCI Security Standards Council: Standards overview](https://www.pcisecuritystandards.org/standards/), the family of PCI standards and their status

**Reference**

- [PCI SSC Blog: Just Published: PCI DSS v4.0.1](https://blog.pcisecuritystandards.org/just-published-pci-dss-v4-0-1), the June 2024 limited revision, v4.0 retirement and the March 31, 2025 date for future-dated requirements
- [PCI SSC Blog: Important Updates Announced for Merchants Validating to SAQ A](https://blog.pcisecuritystandards.org/important-updates-announced-for-merchants-validating-to-self-assessment-questionnaire-a), the January 2025 SAQ A revision and its new eligibility criterion
- [Visa: Data Security Program, Keeping Cardholder Data Safe (PDF)](https://in.review.visa.com/content/dam/VCOM/download/merchants/Visa-Data-Security-Program-Keeping-Cardholder-Data-Safe-VOL-02.06.13.pdf), Visa's merchant and service provider level thresholds and validation actions (dated 2013; confirm current levels with your acquirer)
- [Visa: Account Information Security Program and PCI](https://corporate.visa.com/en/resources/security-compliance.html), levels set by annual volume and enforced through acquirers

**In practice**

- [Stripe: Integration security guide](https://docs.stripe.com/security/guide), how integration choice determines which SAQ a merchant qualifies for
