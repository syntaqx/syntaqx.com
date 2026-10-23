+++
title = "The Payments Rulebook"
description = "How payments rules fit together: network contracts like PCI DSS and Nacha, the laws behind them, who enforces each, and which apply from merchant to provider."
category = "Payments Industry"
order = 1408
part = "The Rules"
aliases = ["compliance/payments-rulebook"]
tags = ["compliance", "payments", "regulation", "pci", "nacha"]
+++

A payments company answers to two kinds of rulebook at once. One is **law**: statutes and regulations, enforced by agencies with subpoenas and penalties. The other is **private network rules**: the card brands' rules, PCI DSS and the Nacha Operating Rules, which no government wrote and which bind you anyway, because every bank that lets you touch the networks made you sign them. Engineers tend to hear "compliance" and picture one checklist. In practice it's a stack of contracts and laws with different enforcers, and knowing which one a requirement comes from tells you who will ask about it, how hard, and what happens if you're wrong.

[How Card Payments Work](/docs/industries/payments/card-payments) and [Interchange & Pricing](/docs/industries/payments/interchange-and-pricing) cover how the networks move and price money; this chapter maps who makes the rules. The frameworks themselves have their own chapters in Compliance, starting with [PCI DSS](/docs/compliance/pci-dss), and the rest of this volume shows each rule landing in the engineering. None of it is legal advice: the thresholds and obligations here are where to start a conversation with counsel, not where to end one.

## Two Kinds of Rules

**Network rules travel by contract, downhill.** Visa and Mastercard publish rules that bind their member banks. The acquiring bank that sponsors you signs those rules and then writes them into your merchant or payfac agreement; you write them into your sub-merchants' terms. PCI DSS reaches you the same way: the brands founded the PCI Security Standards Council to write one security standard, and made compliance a condition of acceptance ([PCI DSS](/docs/compliance/pci-dss)). ACH works identically: Nacha's Operating Rules bind every bank on the network, and your bank's origination agreement binds you to them ([ACH & Bank Transfers](/docs/industries/payments/ach)).

Enforcement follows the same path in reverse. A brand fines the acquirer; the acquirer passes the fine down and can terminate you. Nacha's enforcement process runs through the ODFI, which has 30 days to bring an Originator's excessive return rate down before fines. Termination has a long tail: merchants terminated for cause are added to terminated-merchant lists such as Mastercard's MATCH, which Mastercard's rules require every acquirer to check before signing a merchant.

![Network rules flow down by contract. For cards: Visa and Mastercard (brand rules and PCI DSS) bind the acquiring bank, which binds the payment facilitator or platform, which binds the merchant, who can be added to MATCH if terminated. For ACH: Nacha's Operating Rules bind the ODFI, which binds a registered Third-Party Sender, which binds the Originator. Rules, fines and termination flow down; evidence such as a PCI Attestation of Compliance or proof of authorization flows up. Law applies at every level, signed or not: the CFPB, FinCEN, OFAC, state regulators and the FTC.](/diagrams/rule-chain.svg "Network rules travel down by contract. Each party binds the next and fines follow the same chain, evidence flows back up, and law applies at every level whether you signed anything or not.")

**Law applies whether or not you signed anything.** It is enforced by regulators (in the US: the CFPB, FinCEN, OFAC, state financial regulators, the FTC), and its penalties include fines, consent orders and, for licensing failures, being told to stop. Law also reaches you through your bank, because banks are examined on how they supervise the companies they serve, so a bank partner will often impose legal obligations on you contractually before any regulator would.

**Assurance frameworks are neither.** SOC 1, SOC 2 and ISO 27001 aren't required by any statute or network. They exist because customers and partners require them in contracts, as evidence that your controls work. See [SOC 2](/docs/compliance/soc-2).

## The Map

| Rule | Who sets it | How it reaches you | What it means in engineering |
| ---- | ----------- | ------------------ | ---------------------------- |
| Card brand rules | Visa, Mastercard, others | Acquirer agreement | Dispute handling, descriptors, refunds, data use; [Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks) |
| PCI DSS | PCI SSC, enforced by the brands | Acquirer agreement | Card data scope, segmentation, assessments; [PCI DSS](/docs/compliance/pci-dss) |
| Nacha Operating Rules | Nacha | ODFI agreement | Authorization records, return rates, account validation, fraud monitoring; [ACH](/docs/industries/payments/ach) |
| Regulation E (EFTA) | CFPB | Law, consumer accounts | Unauthorized transfer and error-resolution rights on bank transfers |
| Regulation Z (TILA) | CFPB | Law, consumer credit | Credit card billing-error disputes behind chargebacks |
| BSA/AML | FinCEN | Law; your bank's program | KYC, beneficial owners, suspicious activity, recordkeeping; [Merchant Onboarding](/docs/industries/payments/merchant-onboarding) |
| Sanctions | OFAC | Law, every US person | Screening parties and payments before they move |
| Money transmission | States, harmonized by the MTMA | Law, if you hold others' money | Licenses, net worth, bonds, permissible investments; [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider) |
| GLBA Safeguards Rule | FTC for non-banks | Law, non-bank financial institutions | A written security program and risk assessment, MFA, an incident response plan, and FTC notice within 30 days of a breach affecting 500 or more |
| UDAAP | CFPB | Law, consumer financial products | Disclosures and flows that don't mislead |
| PSD2, PSD3 and the PSR | EU | Law, EU payment services | Strong customer authentication, licensing; [SCA](/docs/industries/payments/strong-customer-authentication) |
| GDPR | EU, UK | Law, personal data | Lawful basis, rights, breach notice; [GDPR](/docs/compliance/gdpr) |
| HIPAA | HHS | Law, health data | Only if you process health information; [HIPAA](/docs/compliance/hipaa) |
| SOC 1, SOC 2, ISO 27001 | AICPA, ISO | Customer and partner contracts | Evidence that controls operate; [SOC 2](/docs/compliance/soc-2) |

## The Consumer Protection Layer

Two regulations decide who absorbs a consumer's disputed payment, and they differ by rail. **Regulation E** covers electronic fund transfers from consumer bank accounts: the consumer has 60 days after the statement to report an error, the bank investigates within 10 business days (or 45 with provisional credit), and the consumer's liability for unauthorized transfers is capped. **Regulation Z** covers credit cards: a billing-error notice within 60 days of the statement, acknowledgment within 30 days, resolution within two billing cycles. The card networks' chargeback systems sit on top of these legal rights and extend them; that's why a cardholder can dispute for reasons the law never mentions, and why the merchant, not the bank, usually ends up paying.

The engineering consequence is the same on every rail: a consumer payment isn't final when it settles, and the ledger has to model the window in which it can still come back ([Payment States & Ledgers](/docs/payments/payment-states)).

**UDAAP**, the Consumer Financial Protection Act's ban on unfair, deceptive or abusive acts or practices, is the catch-all. It has no technical checklist, which is the point: a cancellation flow that's harder than signup, a fee disclosed after the fact, or a "free" trial that quietly converts are product decisions with legal exposure.

## The Financial Crime Layer

**The Bank Secrecy Act** is the root of KYC. Banks must know their customers, and the customer due diligence rule extends that to beneficial owners of business customers: anyone holding 25% or more of the equity. If you are a money services business, you register with FinCEN within 180 days of starting and renew every two years, and you run your own AML program with suspicious activity reporting. Many payment companies aren't MSBs because FinCEN's payment processor exemption covers a business that facilitates purchases or bill payments, under an agreement with the seller, settling only through systems limited to BSA-regulated institutions. Whether you fit is fact-specific, and FinCEN's rulings on it are worth reading before the business model is set, not after.

**OFAC sanctions** apply to every US person, with no threshold and no exemption. Screening happens at onboarding and again on payments, against the SDN list and against entities 50% or more owned by blocked persons. A match isn't a fraud signal to be weighed; it's a stop.

**State money transmission** is the license question. Holding or moving other people's money can require a license in nearly every state, each with net worth, surety bond and permissible-investment requirements; the Money Transmission Modernization Act is the states' effort to make those uniform. Agent-of-payee structures and bank partnerships are how many platforms avoid licensing, and both are questions for counsel, state by state.

## Who Carries What

The same business moves through these rulebooks as it takes on more of the stack ([Payments for Software Platforms](/docs/industries/payments/software-platforms) and [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider) cover the business side):

| Stage | Network rules | Law | Assurance |
| ----- | ------------- | --- | --------- |
| **Merchant on a provider** (hosted fields, Checkout) | PCI DSS through the simplest SAQ; brand rules through the provider's terms | UDAAP if you offer consumer financial products, GLBA if you are a financial institution under it, GDPR for EU users | Rarely needed |
| **Platform on Connect-style accounts** | Same, plus brand rules on how sub-merchants are presented | KYC data collection on the provider's behalf; licensing usually carried by the provider | SOC 2 once customers ask |
| **Payment facilitator** | Registered with the brands through a sponsor; PCI as a service provider; liable for sub-merchants | BSA/AML program, OFAC screening, state licensing or an exemption | SOC 1 for customers' auditors, SOC 2 |
| **Processor or provider** | Direct brand and Nacha obligations, PCI DSS Level 1 with a QSA, PIN and 3DS standards if in scope | Everything above, often MSB registration and licenses in most states | SOC 1 and SOC 2 Type II, often ISO 27001 |

The useful question at each stage is not "are we compliant?" but "which contract or law put this requirement here, and who will test it?" A PCI requirement gets tested by an assessor once a year. A Nacha return rate gets measured by your bank every day. An OFAC miss gets found by a regulator, in hindsight, with the transaction already gone. Build the controls in proportion to how they fail.

## Outside the US

In the EU, **PSD2** is law, not contract, and it covers both licensing (payment and e-money institutions) and conduct, most visibly [Strong Customer Authentication](/docs/industries/payments/strong-customer-authentication). Its successor is agreed but not yet law: the Council and Parliament reached a provisional agreement on PSD3 and a directly applicable Payment Services Regulation on November 27, 2025, and the Council's member-state representatives confirmed it on April 22, 2026. As of the Council's October 2026 status report, formal adoption was still pending. Check where adoption and the application dates stand before planning against them; the obligations bite well after adoption, not on it. The UK runs its own regime under the Payment Services Regulations 2017 and Electronic Money Regulations 2011, overseen by the FCA. GDPR applies to the personal data in all of it ([GDPR](/docs/compliance/gdpr)).

Canada is closest to home and still different at every layer: Payments Canada's rules instead of Nacha's, a federal code of conduct for card fees, Bank of Canada supervision of payment providers under the Retail Payment Activities Act since 2025, and FINTRAC registration for anyone paying bills on others' behalf. [Payments in Canada](/docs/industries/payments/canada) covers it.

## References

**Specifications**

- [CFPB: Regulation E, 12 CFR 1005.11](https://www.consumerfinance.gov/rules-policy/regulations/1005/11/), error resolution timeframes for electronic fund transfers
- [CFPB: Regulation Z, 12 CFR 1026.13](https://www.consumerfinance.gov/rules-policy/regulations/1026/13/), credit card billing-error notice, acknowledgment and resolution deadlines
- [31 CFR 1022.380](https://www.law.cornell.edu/cfr/text/31/1022.380), MSB registration within 180 days and renewal every two years
- [31 CFR 1010.100](https://www.law.cornell.edu/cfr/text/31/1010.100), the money transmitter definition and its payment processor exclusion
- [31 CFR 1010.230](https://www.law.cornell.edu/cfr/text/31/1010.230), beneficial ownership identification for legal entity customers and the 25 percent threshold
- [16 CFR 314.4](https://www.law.cornell.edu/cfr/text/16/314.4), the GLBA Safeguards Rule's elements: written risk assessment, MFA, a written incident response plan, and FTC notice within 30 days for events affecting 500 or more consumers
- [Council of the EU: Current financial services legislative proposals, 2 October 2026](https://data.consilium.europa.eu/doc/document/ST-13589-2026-INIT/en/pdf), PSD3 and PSR: provisional agreement on November 27, 2025 and COREPER confirmation on April 22, 2026
- [12 U.S.C. 5531](https://www.law.cornell.edu/uscode/text/12/5531), the prohibition on unfair, deceptive or abusive acts or practices

**Reference**

- [Nacha: How ACH Works](https://achdevguide.nacha.org/how-ach-works), the Nacha Rules binding every participant, and the parties they bind
- [Nacha: Risk and Quality Rules fact sheet](https://www.nacha.org/system/files/2019-05/Risk-and-Quality-Rules-Fact-Sheet.pdf), enforcement through the ODFI and the 30-day reduction period
- [Mastercard: Security Rules and Procedures, Merchant Edition, August 2026 (archived PDF)](https://web.archive.org/web/20260919122811/https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf), section 11.6: acquirers must check MATCH before signing a merchant
- [Visa: Security and compliance](https://corporate.visa.com/en/resources/security-compliance.html), the brands requiring acquirers to ensure PCI DSS compliance of their merchants and agents
- [FinCEN: FIN-2014-R009](https://www.fincen.gov/sites/default/files/administrative_ruling/FIN-2014-R009.pdf), the four conditions of the payment processor exemption
- [FinCEN: MSB Registration](https://www.fincen.gov/money-services-business-msb-registration), who registers and how
- [OFAC: Sanctions compliance FAQs](https://ofac.treasury.gov/faqs/topic/1501), obligations of all US persons and the 50 percent rule
- [CSBS: Money Transmission Modernization Act](https://www.csbs.org/csbs-money-transmission-modernization-act-mtma), nationwide standards for money transmitter licensing
- [AICPA: SOC 1](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-1), controls relevant to customers' internal control over financial reporting

**In practice**

- [Stripe: Connect risk management](https://docs.stripe.com/connect/risk-management), how a provider splits MATCH checks, licensing and negative balance liability with platforms
- [Hogan Lovells Cadwalader: Final texts for PSD3 and PSR awaited](https://www.hlc.com/en/publications/final-texts-for-psd3-and-psr-awaited-as-european-parliament-and-council-of-eu-announce-provisional), what the provisional agreement covers and its expected implementation period
