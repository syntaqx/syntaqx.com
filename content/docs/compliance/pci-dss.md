+++
title = "PCI DSS"
description = "What PCI DSS v4.0.1 demands of engineering: merchant and service provider levels, which SAQ or assessment you land on, and shrinking scope."
category = "Compliance"
order = 902
tags = ["compliance", "pci", "payments", "security"]
+++

A card number is a bearer credential: whoever holds it can try to spend it, and the bank that issued it eats the fraud. PCI DSS is how the card networks make thousands of companies they don't control protect it the same way. Visa, Mastercard, American Express, Discover and JCB founded the PCI Security Standards Council to write one standard instead of five, then made compliance a condition of accepting their cards. So it's a contract, not a law: the brands enforce it through the banks they license, acquirers push it onto merchants, and merchants push it onto their vendors. [The Payments Rulebook](/books/payments/payments-rulebook) shows where it sits among the other rules.

For engineering it asks two questions. Which systems can see card data, or affect the security of the ones that do? And can you prove to an outsider that those systems meet the standard? The first is a design decision you control. The second is the bill for getting the first one wrong. This describes how the regime works, not assessment advice: your acquirer, the brands and at higher levels your assessor decide what applies to you.

## The Current Standard

The current version is **PCI DSS v4.0.1**, published in June 2024 as a limited revision of v4.0 (March 2022) that fixed errors and clarified intent without adding or deleting requirements. v3.2.1 retired on March 31, 2024 and v4.0 on December 31, 2024, so as of October 2026 v4.0.1 is the only version you can be assessed against, and the Council hasn't announced a successor.

What changed engineering work was v4.0's **future-dated requirements**, mandatory since **March 31, 2025**: multi-factor authentication for all non-console access into the cardholder data environment, not just remote (8.4.2); an inventory, authorization and integrity check for every script on a payment page, plus detection of unauthorized changes to the page and its headers (6.4.3, 11.6.1); automated audit log review (10.4.1.1); and a written **targeted risk analysis** for every requirement that lets you choose a frequency, naming the asset, the threat and why your frequency is enough (12.3.1).

v4 also added the **customized approach**: instead of the defined requirement, you show how your control meets the requirement's stated objective, and the assessor derives tests for it. The standard aims it at risk-mature organizations, warns it takes more documentation and effort, and it can't be used on an SAQ, only in a Report on Compliance. Some requirements, like never storing sensitive authentication data, can't be customized at all.

## The Vocabulary

A few terms run through everything below:

- **CDE:** the cardholder data environment, every system that stores, processes or transmits card data, plus whatever can reach those systems. It's what's in scope.
- **QSA:** a Qualified Security Assessor, an outside assessor certified by the Council. For Level 1 merchants, Visa and Mastercard also accept a ROC done internally and signed by an officer, and Mastercard names the Council's certified Internal Security Assessors (ISAs) for it.
- **ROC:** the Report on Compliance, the assessor's full report, built by sampling systems, reading configurations and interviewing engineers.
- **SAQ:** a Self-Assessment Questionnaire, one of several cut-down versions of the standard.
- **ASV scan:** a quarterly external vulnerability scan by an Approved Scanning Vendor, with rescans until it passes (11.3.2). Even SAQ A includes it, for the page that hosts the redirect or iframe.
- **AOC:** the Attestation of Compliance, the signed summary that ends every assessment. It's what acquirers and customers ask for, and the standard expects service providers to share theirs.

## Merchant or Service Provider

The standard covers anyone who stores, processes or transmits cardholder data, or can affect its security, in one of two roles, and the role matters more than any level.

- **A merchant** accepts cards for its own goods or services. Its obligation runs to its acquirer.
- **A service provider** handles card data on behalf of another business, or manages systems that can affect its security: gateways, processors, payment facilitators, tokenization vaults, hosts with access to a cardholder data environment. Its obligation runs to every customer that relies on it.

One company can be both: Stripe is a merchant when it bills you for its own subscription, and a service provider for every business that sends it payments. Touch another company's card data and you're a service provider, with extra requirements, a lower bar for the top level, and customers who want your Attestation of Compliance before they sign. [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider) covers that path end to end.

## Levels

The Council doesn't define levels. Each brand sets its own by annual transaction volume on that brand, your acquirer tells you which you validate at, and every brand can move you up at its discretion, which Mastercard's rules say may follow a confirmed breach. Visa and Mastercard draw the same top two lines, and Mastercard puts any merchant at the level Visa assigns it:

| Level | Merchants (transactions per year, per brand) | How they validate |
| --- | --- | --- |
| 1 | Over 6 million, or designated by a brand | An annual Report on Compliance (ROC) by a QSA, or by internal staff with an officer's signature, plus an Attestation of Compliance |
| 2 | 1 million to 6 million | An annual SAQ; Mastercard requires a QSA or ISA to be involved for SAQ A, A-EP or D |
| 3 and below | Under 1 million | An annual SAQ, which the acquirer decides how to collect |

Below Level 2 the brands diverge:

| Brand | Lower merchant levels |
| --- | --- |
| Visa | Three levels in all; Level 3 is everyone under 1 million e-commerce transactions |
| Mastercard | Four: Level 3 is 20,000 to 1 million e-commerce transactions, Level 4 everyone else, and neither validates to Mastercard directly |
| Discover | Three levels, on the same 6 million and 1 million lines |
| American Express | Counted differently: Level 1 from 2.5 million Amex transactions, Level 2 from 50,000, Level 3 from 10,000; Levels 3 and 4 submit documents only when Amex asks |

Quarterly ASV scans aren't a level perk either way; they come from the standard itself (11.3.2) for whatever you expose to the internet in scope.

Service providers have two levels, and the line is low:

| Brand | Service provider Level 1 |
| --- | --- |
| Visa | VisaNet processors, and any provider handling over 300,000 Visa transactions a year |
| Mastercard | Every processor, merchant payment gateway, token service provider and several other types **regardless of volume**, plus payment facilitators above 300,000 Mastercard transactions |
| American Express | Above 2.5 million Amex transactions |

Level 1 means an annual ROC by a Qualified Security Assessor and an Attestation of Compliance signed by both the provider and the assessor. Everyone under the line validates with SAQ D for Service Providers, but Visa only lists a provider on its Global Registry of Service Providers, which acquirers and large customers check, once a QSA has validated it. A gateway is Mastercard Level 1 from its first transaction, so a serious service provider plans for a QSA from the start.

## Which SAQ: Architecture Decides

A merchant's SAQ depends on how its integration touches card data, the clearest proof that architecture is a compliance decision. Service providers don't get a choice: SAQ D for Service Providers is the only SAQ they can use.

| SAQ | Who's eligible |
| --- | --- |
| **A** | Card-not-present only, all processing outsourced to compliant providers, no electronic card data on your systems. Online, every element of the payment page comes only and directly from the provider: a redirect, or the provider's iframe |
| **A-EP** | E-commerce only. Your site never receives card data but controls how customers or their data reach the provider: direct post, or the provider's JavaScript building the form on your page |
| **B, B-IP, C, C-VT, P2PE, SPoC** | Card-present and phone-order setups: dial-out or IP terminals, an isolated point-of-sale system, manual entry into a virtual terminal, a validated point-to-point encryption solution, or a phone with a secure card reader. None apply to e-commerce |
| **D for Merchants** | Everyone else, including any merchant that accepts card data on its own website or stores it: the whole standard |

For e-commerce the choice is A, A-EP or D, and it moves with a single integration decision. Hosted fields or a redirect keep you on A. Your own JavaScript building the form puts your web servers in scope for hardening, patching, logging and testing under A-EP. Card numbers reaching your servers puts you on D.

In January 2025 the Council revised SAQ A, effective March 31, 2025: it removed 6.4.3, 11.6.1 and 12.3.1 and added an eligibility criterion that the merchant confirms "their site is not susceptible to attacks from scripts that could affect the merchant's e-commerce system(s)." The requirements themselves aren't diminished; only how SAQ A merchants report them changed. "We use the provider's iframe" doesn't end the conversation: the page hosting it can still be modified to show a fake form, and you're attesting it can't be.

### Payment Page Scripts

The Council's FAQs settle what SAQ A eligibility means in practice:

- **Every part of every payment page comes from a validated provider.** FAQ 1292 requires that "the entirety of all payment pages delivered to the consumer's browser" originate "directly from a third-party PCI DSS validated service provider(s)," by redirect or iframe. If any part of the payment page comes from your own site, you're not on SAQ A; if any part comes from a non-compliant provider, you're on neither A nor A-EP. The FAQ's reasoning is the useful part: a redirect or iframe can only be attacked by sending the shopper somewhere else, which tends to be noticed, while script injected into a form your page builds can copy card numbers as they're typed for months.
- **The script criterion applies to embedded forms only.** FAQ 1588 (February 2025) says it "only applies to e-commerce merchants with a webpage that includes a TPSP's/payment processor's embedded payment page/form." A merchant that redirects the shopper to the provider's page, or fully outsources payments, doesn't have to meet it.
- **Two ways to meet it.** Deploy protections yourself "using techniques such as, but not limited to, those detailed in PCI DSS Requirements 6.4.3 and 11.6.1," or obtain "confirmation from the merchant's PCI DSS compliant TPSP/payment processor" that its embedded form, implemented as instructed, protects against script attacks. If you rely on the provider, get the confirmation in writing and follow its implementation instructions exactly.
- **SAQ A still has work in it.** FAQ 1604 confirms that SAQ A includes external vulnerability scans by an Approved Scanning Vendor for the merchant's e-commerce pages, "even where payment processing is fully outsourced to a third party," for redirect and iframe merchants alike.

Requirements 6.4.3 and 11.6.1 are the technical bar for anyone who has to meet them (SAQ A-EP, SAQ D and providers), and the reference for SAQ A merchants who protect their own pages:

- **6.4.3: every script on the payment page is managed.** A method confirms each script is authorized, a method assures each script's integrity, and an inventory lists every script "with written business or technical justification as to why each is necessary." It covers your own scripts and those from third and fourth parties, including scripts on a page that embeds a provider's iframe, but not the scripts inside the provider's iframe. In practice: a Content Security Policy that allows only the inventoried script origins, Subresource Integrity hashes on third-party scripts where they're versioned, and the inventory in the repository beside the page ([Security Headers](/docs/security/security-headers)).
- **11.6.1: tampering is detected as the browser sees it.** A change- and tamper-detection mechanism alerts on unauthorized modification "to the security-impacting HTTP headers and the script contents of payment pages as received by the consumer browser," evaluated at least weekly or at a frequency set by a targeted risk analysis. Monitoring the server's files isn't enough, because e-skimming often arrives through a compromised third-party script or a CDN; the check has to load the page from outside and compare what arrives.

## Shrink the Scope

PCI DSS applies to the **cardholder data environment** (CDE), every system that stores, processes or transmits card data, and every system connected to it or able to affect it. Scope is the cost driver, so the most valuable PCI work is making the CDE small.

- **Tokenize at the edge,** so your servers only ever see a token. [Sensitive Data](/docs/payments/sensitive-data) covers the pattern, and [Running a Card Vault](/books/payments/card-vault) the small vault behind it.
- **Segment the network.** It isn't required, but without it the whole network is in scope. If you rely on it, penetration-test it at least every 12 months as a merchant and every six months as a service provider, and after any change to it (11.4.5, 11.4.6).
- **Never store sensitive authentication data** (full track data, the card verification code, PINs and PIN blocks) after authorization, even encrypted (3.3.1).

## The Twelve Requirements

The twelve requirements sit under six goals: build and maintain a secure network and systems (1, 2), protect account data (3, 4), maintain a vulnerability management program (5, 6), implement strong access control (7 to 9), regularly monitor and test networks (10, 11), and maintain an information security policy (12). Read them as an engineering checklist for the CDE:

| # | Requirement (v4.0.1, shortened) | For engineering |
| --- | --- | --- |
| 1 | Install and maintain network security controls | Documented, reviewed rules; deny by default |
| 2 | Apply secure configurations | No vendor defaults, hardened images |
| 3 | Protect stored account data | Don't store it; if you must, make it unreadable and manage the keys |
| 4 | Protect cardholder data with strong cryptography in transit over open networks | TLS wherever card data crosses an open network |
| 5 | Protect systems and networks from malicious software | Anti-malware, or a documented analysis of why a system doesn't need it |
| 6 | Develop and maintain secure systems and software | Secure development, code review, patching, payment-page script integrity |
| 7 | Restrict access by business need to know | Least privilege, reviewed on a schedule |
| 8 | Identify users and authenticate access | Unique IDs, MFA into the CDE, no shared accounts |
| 9 | Restrict physical access to cardholder data | Mostly your cloud provider's AOC, plus your offices and devices |
| 10 | Log and monitor all access | Audit logs on every CDE component, reviewed automatically, kept 12 months with three immediately available |
| 11 | Test security of systems and networks regularly | Scans, penetration tests, payment-page change detection |
| 12 | Support information security with policies and programs | Risk analyses, incident response, vendor management, training |

Most of this is what a good platform team does anyway. What PCI adds is **evidence**: the rule written down, the review dated, the exception approved. A pipeline that enforces review, keeps an audit trail and deploys only from main is worth more to an assessor than any policy document. **Compensating controls** cover a requirement you can't meet as written for a documented constraint, re-validated by the assessor every year; an assessment full of them means the architecture is fighting the standard.

## Operating the Cardholder Data Environment

Whatever is left in scope has to be run to the standard every day, not just during assessment week. Most of what PCI DSS checks is the environment, and most of it is ordinary good platform engineering, written down:

- **Segmentation as code.** The CDE gets its own cloud account or network, defined in [infrastructure as code](/docs/delivery/infrastructure-as-code). Inbound traffic is restricted to what's necessary and everything else denied (1.3.1): the load balancer and named callers. Outbound is the same (1.3.2), which in practice means deny by default with the processor and KMS endpoints allowlisted through an egress proxy. Systems that store card data aren't directly reachable from untrusted networks (1.4.4). A rule allowing all outbound traffic to anywhere is the finding that undoes the rest.
- **Images built, never hand-tuned.** Configuration standards cover every component and address known vulnerabilities (2.2.1), so harden images to a recognized baseline such as the CIS Benchmarks in a pipeline, and replace hosts instead of patching them in place ([Containers](/docs/delivery/containers)). Critical patches go in within a month of release (6.3.3), which a weekly rebuild meets without anyone logging in. File integrity monitoring compares critical files at least weekly (11.5.2), and each system runs anti-malware or has a documented, periodically re-evaluated reason it doesn't need it (5.2.3).
- **No standing access.** MFA for every non-console access into the CDE (8.4.2), on top of MFA for reaching the network remotely. Shell access goes through a session broker that records the session, not SSH keys handed to people. A break-glass role with hardware MFA, an alert on every use and a test on a schedule. No credential is hard-coded in a script, config file or source (8.6.2); processor keys and database passwords live in a secret manager ([Environments & Configuration](/docs/operations/environments#secrets)). User IDs lock after no more than 10 failed attempts, for at least 30 minutes or until an administrator unlocks them (8.3.4).
- **Logs that something reads.** Every access to card data and every administrative action is logged (10.2), backed up promptly to a central store that's difficult to modify (10.3.3), reviewed by automated mechanisms rather than a person skimming email (10.4.1.1), and kept 12 months with the most recent three immediately available (10.5.1). The cloud provider's control-plane log goes to the same store, because changes to accounts, networks, keys and roles are where most cloud incidents start.
- **A web application firewall, or equivalent.** Since March 31, 2025, public-facing web applications need "an automated technical solution" that "continually detects and prevents web-based attacks," installed in front of them (6.4.2). A tokenize endpoint and a hosted payment form are exactly those applications.
- **Change through one door.** Reviewed changes, deployed by the pipeline only, with pre-production that never uses live card numbers (6.5.5) or, for a service provider, production keys (3.6.1.1). Infrastructure changes are planned in review and applied with approval, not auto-applied on merge ([CI Pipelines](/docs/delivery/ci-pipelines)).
- **TLS everywhere, verified everywhere.** Card data crosses open networks only over strong cryptography that accepts "only trusted keys and certificates" (4.2.1), and nothing turns certificate verification off, not a staging flag and not a test client pointed at production.
- **Scanned and tested on a schedule.** Internal vulnerability scans at least every three months (11.3.1), external scans by an Approved Scanning Vendor at least every three months with rescans until they pass (11.3.2), internal and external penetration tests at least every 12 months and after significant change (11.4.2, 11.4.3), and segmentation tested on the cycle above. [Vulnerability Management](/docs/security/vulnerability-management) is the program around it.

[Running a Card Vault](/books/payments/card-vault#running-the-environment) applies all of this to the most sensitive system a provider runs, and [Encryption at Rest](/docs/security/encryption-at-rest) covers the envelope encryption and key rotation that requirement 3 asks for.

## What a Service Provider Adds

Requirements marked "additional requirement for service providers only" come on top of everything a merchant does. The ones that shape engineering and operations:

- **Scope confirmed every six months** and after significant change (12.5.2.1), and segmentation tested on the same cycle (11.4.6).
- **Quarterly reviews,** by someone other than the person doing the work, that log reviews, network control reviews, configuration standards, alert response and change management actually happened (12.4.2).
- **A written split of responsibilities** acknowledged to each customer, and the information they need to manage you as a vendor (12.9.1, 12.9.2): the responsibility matrix every enterprise customer asks for.
- **Customer passwords:** if a password is the only factor, give customers guidance and force a change every 90 days unless you analyze account risk dynamically (8.3.10, 8.3.10.1). Offering MFA avoids both.
- **Multi-tenant hosting** adds Appendix A1, including supporting your customers' own penetration tests (11.4.7).

Mastercard also recommends its Level 1 and 2 service providers validate against the **Designated Entities Supplemental Validation** (Appendix A3), extra controls the brands can require of entities they consider high risk.

## Enforcement

The Council writes the standard and certifies assessors; it doesn't fine anyone. The brands do, and they fine the banks they license. Visa may levy non-compliance assessments on the issuer or acquirer. Mastercard's rules list assessments from up to USD 25,000 for a first violation to up to USD 200,000 for a fourth in a calendar year for Level 1 and 2 merchants and service providers, plus merchant termination or deregistration of a provider. How much reaches you depends on your contract with the acquirer. A breach costs more than a missed attestation: Mastercard's rules for account data compromises call for an independent forensic investigation and let issuers partially recover their costs through the acquirer.

## References

**Specifications**

- [PCI SSC: PCI DSS v4.0.1 Requirements and Testing Procedures](https://www.pcisecuritystandards.org/document_library/), the requirements and goals, version dates, defined and customized approaches, and every requirement number cited here
- [PCI SSC: SAQ A v4.0.1 Revision 1 (PDF, state treasurer's copy)](https://treasurer.nebraska.gov/tm/pci-dss/documents/PCI_DSS_v4_0_1_SAQ_A_r1.pdf), SAQ A eligibility, the script-attack criterion, and ASV scans in SAQ A; the same site hosts every v4.0.1 SAQ whose eligibility the table summarizes
- [PCI SSC: SAQ D for Service Providers v4.0.1 (PDF, state treasurer's copy)](https://treasurer.nebraska.gov/tm/pci-dss/documents/PCI_DSS_v4_0_1_SAQ_D_Service_Provider_r2.pdf), the only SAQ option for service providers, and the full text of the requirements quoted under operating the CDE and payment page scripts (1.3, 1.4.4, 2.2.1, 3.6.1.1, 4.2.1, 6.4.2, 6.4.3, 6.5.5, 8.3.4, 8.4.2, 10.3.3, 10.5.1, 11.3, 11.4, 11.5.2, 11.6.1)
- [PCI Security Standards Council: Document Library](https://www.pcisecuritystandards.org/document_library/), the official home of the standard and SAQs

**Reference**

- [PCI SSC Blog: Just Published: PCI DSS v4.0.1](https://blog.pcisecuritystandards.org/just-published-pci-dss-v4-0-1), a limited revision with no added or deleted requirements, and the March 31, 2025 date
- [PCI SSC Blog: Important Updates for Merchants Validating to SAQ A](https://blog.pcisecuritystandards.org/important-updates-announced-for-merchants-validating-to-self-assessment-questionnaire-a), the January 2025 SAQ A revision
- [PCI SSC: FAQ 1292](https://www.pcisecuritystandards.org/faqs/1292/), SAQ A eligibility: the entirety of all payment pages from a validated provider, and why redirects and iframes differ from direct post and JavaScript forms
- [PCI SSC: FAQ 1588](https://www.pcisecuritystandards.org/faqs/1588/), the SAQ A script criterion, which merchants it applies to, and the two ways to meet it (February 2025)
- [PCI SSC: FAQ 1604](https://www.pcisecuritystandards.org/faqs/1604/), ASV scans in SAQ A for redirect and iframe merchants
- [PCI SSC Blog: Payment Page Security and Preventing E-Skimming](https://blog.pcisecuritystandards.org/new-information-supplement-payment-page-security-and-preventing-e-skimming), the information supplement on requirements 6.4.3 and 11.6.1 (March 2025)
- [Mastercard: Security Rules and Procedures, Merchant Edition, August 2026 (archived PDF)](https://web.archive.org/web/20260919122811/https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf), merchant and service provider levels, validation, DESV, noncompliance assessments and account data compromise rules
- [Visa: Account Information Security Program and PCI](https://corporate.visa.com/en/resources/security-compliance.html), Visa's three merchant levels and two service provider levels, QSA validation for the Global Registry, and non-compliance assessments on issuers and acquirers
- [American Express: Data Security Operating Policy, United States, October 2026](https://www.americanexpress.com/content/dam/amex/us/merchant/new-data-security/DSOP_United_States_EN.pdf), Amex merchant and service provider levels and validation documents
- [Discover Global Network: Identify Your Merchant Level](https://www.discoverglobalnetwork.com/solutions/pci-compliance/identify-merchant-level/), Discover's three merchant levels

**In practice**

- [Stripe: Integration security guide](https://docs.stripe.com/security/guide), how integration choice determines a merchant's SAQ
- [Stripe: Security at Stripe](https://docs.stripe.com/security), a provider certified as PCI Service Provider Level 1, with its card vault in a separate environment
