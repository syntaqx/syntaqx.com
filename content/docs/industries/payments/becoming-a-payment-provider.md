+++
title = "Becoming a Payment Provider"
description = "What it takes to be a Stripe or a payfac rather than integrate one: sponsor banks, card networks, PCI as a service provider, licensing and the money."
category = "Payments Industry"
order = 1415
aliases = ["payments/becoming-a-payment-provider"]
tags = ["payments", "compliance", "pci", "licensing"]
+++

Every chapter before this one is about building on a payment provider. Becoming one is a regulated business that happens to need a lot of engineering, and the API is the smallest part of it. Underneath sit a bank that lets you into the card networks, an annual security assessment your customers will ask to see, licenses or exemptions for holding other people's money, and a balance sheet that absorbs whatever your merchants can't pay back. Every company that sells payments as a product, from Stripe and Adyen to a vertical software platform that started as a payfac, built or rented each of those layers.

This page covers what each layer is, why it exists and who pays when it fails, then the order companies usually acquire them in. **It is not legal advice:** licensing in particular turns on facts a lawyer has to look at. Where it names a threshold or a rule, it has a source; where the answer is "it depends", it says so.

## Pick a Model, Pick a Risk

"Payment provider" covers several businesses that look alike from the outside and carry very different risk. The question that separates them: when a merchant takes money it shouldn't have and disappears, who refunds the cardholder?

| Model | What you do | Who holds merchant risk |
| --- | --- | --- |
| **Gateway** | Pass transactions from merchants to a processor; often store tokens | The acquirer, and the merchant's own contract with it |
| **ISO / agent** | Sell and support another acquirer's merchant accounts, for a share of revenue | Usually the acquirer, unless your contract shifts liability onto you |
| **Payment facilitator** | Contract with sub-merchants under your own master merchant account | You, first; your sponsor acquirer behind you |
| **Processor** | Run the authorization and clearing systems that connect to the networks | Depends on the contract; the technology risk is yours |
| **Acquirer** | Be the network member that settles funds to merchants | You, as the party the network holds responsible |

Every step down the table moves risk onto you. A gateway that goes down loses revenue; a payfac whose sub-merchant commits fraud loses the money itself, because the acquirer recovers chargebacks from the payfac before anyone else. The further down you go, the more of the economics you keep and the more of the losses you own.

Most "Stripe competitors" are payfacs. Stripe's Connect docs are a useful map of what that means: they list MATCH checks, prohibited business checks and money transmitter and e-money licenses among what the provider handles for platforms, and say a connected account's negative balance belongs to either the platform or Stripe depending on the integration. A payfac makes that decision for its own sub-merchants, and backs it with capital.

## The Sponsor Bank

Card networks don't contract with software companies. Visa and Mastercard are membership organizations of banks and licensed institutions, and only a member can acquire transactions. Everyone else gets in through a **sponsor bank** (or acquirer) that agrees to be responsible to the network for you. It's the most important relationship in the business:

- **It is your network access.** The acquirer registers you with the networks and can stop sponsoring you. A payfac that loses its only sponsor stops processing.
- **It sets your risk appetite.** The acquirer's credit and compliance teams decide which industries you may board, what reserves you hold and what monitoring you run. Your underwriting policy is, in large part, theirs.
- **It is a credit decision about you.** Liable to the network for your merchants, the acquirer underwrites you the way you underwrite them: financials, capital, ownership, controls. Expect to post collateral or a reserve of your own.

One sponsor is enough to launch. It isn't enough to survive that sponsor changing its risk policy, so plan for a second.

Being sponsored also isn't being known to the networks. Both major networks register the third parties in the chain (payfacs, ISOs, and service providers that store or process card data), usually with the acquirer submitting the registration, and Visa's Global Registry of Service Providers is where customers and acquirers check. Program names, fees and requirements differ between networks and change, so take them from your sponsor and the networks' current rules. The shape doesn't change: registration needs a sponsor, and staying registered needs annual proof that you're secure.

## PCI as a Service Provider

A merchant has a PCI DSS obligation for its own systems. A provider is a **service provider**, storing, processing or transmitting card data on behalf of others, and its customers' compliance depends on it. The standard, levels and assessments are in [PCI DSS](/docs/compliance/pci-dss); what changes for a provider:

- **Plan for Level 1 from day one.** Visa puts a service provider at Level 1 above 300,000 transactions a year, and Mastercard puts every processor and merchant payment gateway there regardless of volume. Level 1 means an annual Report on Compliance from a Qualified Security Assessor plus quarterly external scans, and it's where a credible competitor to the large processors sits (Stripe states it is certified as a PCI Service Provider Level 1). Service providers also carry extra requirements merchants don't, like scope and segmentation checks every six months; [PCI DSS](/docs/compliance/pci-dss#what-a-service-provider-adds) lists them.
- **It's annual.** Visa requires acquirers to ensure their service providers demonstrate compliance at least every 12 months, so the assessment is a standing program, not a launch milestone.
- **Your customers will ask for the AOC.** The Attestation of Compliance is what merchants, acquirers and enterprise buyers see, and enterprise deals stall without a current one.
- **Your design decides your scope.** Isolate card data in a small vault and hand everything else tokens, as in [Sensitive Data](/docs/payments/sensitive-data). A provider whose whole platform is in scope assesses its whole platform, every year.

Other PCI standards follow from what you build. **PIN Security** applies when you process PIN transactions, at the discretion of the brands and acquirers. **P2PE** covers encrypting card data from the point of acceptance; PCI SSC notes that merchants using a listed solution have fewer DSS requirements, which makes it a selling point for terminals. **3DS Core** applies if you run an access control server, directory server or 3DS server, assessed by a qualified 3DS Assessor (Mastercard requires it of service providers performing 3DS functions, revalidated every two years); most providers integrate a certified 3DS server instead of building one. Software you sell for others to run in their payment flow falls under the **Secure Software** and **Secure Software Lifecycle** standards, which replaced PA-DSS when it retired in October 2022. And in September 2026 the Council published **Key Management and Operations (KMO) v1.0**, which covers how cryptographic keys protecting account data are managed across their life, starting with the key management behind PIN and P2PE.

Enterprise customers and partner banks will also ask about everything PCI doesn't cover: access control, change management, availability. That's a [SOC 2](/docs/compliance/soc-2) Type II report (Stripe states it produces SOC 1 and SOC 2 Type II reports annually). The two programs share most of their evidence, so build one control set and assess it twice.

## Holding Other People's Money

The moment funds pass through your control on their way from payer to merchant, you may be doing something regulated: money transmission in the US, payment services or e-money issuance in the EU and UK. This is where specifics matter most.

**United States.** Money transmission is licensed state by state, each with its own application, examination and reporting. The Conference of State Bank Supervisors' Money Transmission Modernization Act sets nationwide standards for net worth, surety bonds and permissible investments; CSBS reports 31 states have enacted it in full or in part, which means many haven't. Whether a given payfac needs licenses at all is contested. Structures exist that may avoid it, such as funds flowing through accounts the sponsor bank controls, or acting as the merchant's agent to receive payment, but whether one applies depends on the state and the contracts. That's a question for counsel with the actual flow of funds in front of them, not something to infer from a competitor.

**UK.** The FCA authorizes payment institutions under the Payment Services Regulations 2017 and e-money institutions under the Electronic Money Regulations 2011. Above a monthly average of €3 million in payment transactions you need full authorization as a payment institution (below it you may register as a small one), and above €5 million of average outstanding e-money, full authorization as an e-money institution, with the capital, safeguarding and governance that brings.

**European Union.** National regulators authorize payment and e-money institutions under PSD2 and the E-Money Directive, following EBA guidelines, and an authorization can be passported across member states. PSD3 and a Payment Services Regulation are replacing the framework, so check what applies on your launch date.

Either way, the cost isn't the application: it's capital and safeguarding requirements, examinations, reporting, and a compliance function that has to exist before the license is granted.

## Gatekeeping: Sanctions, AML and Losses

A provider is a gatekeeper for the financial system. [Merchant Onboarding](/docs/industries/payments/merchant-onboarding) covers how to build KYC, KYB, underwriting and monitoring; at the provider level, the difference is who you answer to.

- **Sanctions screening is not optional.** OFAC is direct: all US persons must comply, and an entity owned 50% or more by blocked persons is itself blocked even if it isn't named on a list. Screen the business, its owners and its payout destinations, at onboarding and whenever the lists change.
- **AML is a program, not a check.** Your sponsor, and any regulator that licenses you, will expect a written anti-money-laundering program with a named officer, risk assessment, transaction monitoring and suspicious activity reporting. A vendor that "does KYC" is one input to it.
- **Terminated merchant lists** such as Mastercard's MATCH are checked at onboarding, and merchants you terminate for cause get added.
- **Losses move up the chain.** When a merchant can't cover its refunds and [chargebacks](/docs/industries/payments/disputes-and-chargebacks), the loss goes to the payfac, then the acquirer, and each protects itself by holding back money it owes the party below: underwriting limits, [reserves](/docs/industries/payments/payouts-and-settlement), and finally your own capital. Losses are lumpy: a provider can run clean for a year and then lose a quarter's margin to one merchant that collapses with a large prepaid order book. Price for that.

## How the Money Moves

Funds settle from the network to the acquirer and onward, and where they land next has legal weight. A common arrangement is a **for-benefit-of (FBO) account**: an account at the sponsor bank, in the provider's name, held for the benefit of the merchants whose money it is. The bank holds the pooled balance; the provider's ledger says who owns what inside it. The structure is often what the licensing analysis turns on, and it decides what happens to merchants' money if the provider fails. Two rules hold regardless:

- **Merchant funds are not operating funds.** Never pay your own expenses from the pool, even briefly, and keep your revenue in a separate account. Commingling turns a contract dispute into a regulatory one.
- **The ledger reconciles to the bank, daily.** Every merchant balance in the ledger plus your own fees equals what the bank says the account holds. A difference is a bug or a loss, and you need to know which before the next payout run.

## The Platform It Implies

The rest of this section becomes requirements a merchant integration never sees:

- **A double-entry ledger** ([Payment States & Ledgers](/docs/payments/payment-states)) is the source of truth for every balance, fee, reserve and payout, and at provider scale it's what auditors, the sponsor bank and regulators examine.
- **Idempotency end to end** ([Idempotency](/docs/payments/idempotency)): merchants retry, and so do you toward networks and banks, and a charge or payout that runs twice is real money.
- **Reconciliation as a product:** daily matching of network settlement files, bank statements and the ledger, with exceptions routed to people, and the same view offered to merchants for their own money.
- **Webhooks as a contract** ([Webhooks](/docs/payments/webhooks)): merchants build their businesses on your events.
- **Hardware security modules** for card encryption keys, and PIN keys if you touch PINs, under dual control with documented key ceremonies. The PCI assessment spends much of its time here.
- **Availability as revenue.** When a provider is down, every merchant on it stops taking money: redundant connections to acquirers and banks, no single region whose loss stops authorization, and status communication merchants can rely on.

## The Realistic Path

Nobody starts as an acquirer. The providers that got there acquired the layers in roughly this order, each funded by the revenue of the one before:

| Stage | What it unlocks | What it costs |
| --- | --- | --- |
| **1. Integrate a provider** | Payments in your product, with no regulatory footprint of your own | Margin; the provider owns pricing, risk and onboarding UX |
| **2. Platform on a provider's payfac program** | Your own onboarding and pricing, revenue share | Liability for some losses, depending on the provider's terms |
| **3. Payfac on a processor** | Your own sub-merchants, underwriting and payouts; most of the margin | A sponsor bank, network registration, PCI service provider validation, a risk team, reserves, possibly licensing |
| **4. Add a second sponsor, more processors** | Resilience and negotiating leverage | Duplicate integrations and reconciliation |
| **5. Direct acquiring / processing** | Network connectivity, the full margin, control over authorization | Network membership or a licensed acquiring entity, capital, HSM infrastructure, the full assessment scope |

Stage 3 is where most companies that call themselves payment providers live, and it's a good business on its own. The jump from 3 to 5 is less about engineering than about capital and licenses, and it's worth making only when the processor's share of each transaction costs more than carrying everything the processor was carrying for you.

## References

**Specifications**

- [PCI Security Standards Council: PCI DSS](https://www.pcisecuritystandards.org/standards/pci-dss/), the data security standard that service providers are assessed against
- [PCI SSC: PIN Security](https://www.pcisecuritystandards.org/standards/pin-security/), audience of acquirers and their agents, and applicability decided by payment brands and acquirers
- [PCI SSC: Point-to-Point Encryption](https://www.pcisecuritystandards.org/standards/point-to-point-encryption-p2pe/), encryption from the point of acceptance and reduced DSS requirements for merchants using listed solutions
- [PCI SSC: 3DS Core Security Standard](https://www.pcisecuritystandards.org/standards/pci-3ds/), scope of ACS, DS and 3DS server environments and assessment by qualified 3DS Assessors
- [PCI SSC: PA-DSS](https://www.pcisecuritystandards.org/standards/pa-dss/), retired October 28, 2022 and superseded by the Secure Software and Secure Software Lifecycle standards
- [PCI SSC Blog: Just Published: PCI Key Management and Operations (KMO) Standard v1.0](https://blog.pcisecuritystandards.org/just-published-pci-key-management-operations-kmo-standard-v1.0), September 2026, key lifecycle requirements starting with PIN and P2PE keys
- [AICPA: SOC 2, Trust Services Criteria](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2), SOC 2 as an examination of controls relevant to security, availability, processing integrity, confidentiality or privacy

**Reference**

- [Visa: Account Information Security Program and PCI](https://corporate.visa.com/en/resources/security-compliance.html), Visa's service provider levels and the 300,000-transaction line, and acquirers ensuring service providers demonstrate compliance at least every 12 months
- [Mastercard: Security Rules and Procedures, Merchant Edition, August 2026 (archived PDF)](http://web.archive.org/web/20260919122811/https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf), service provider levels by type and volume, 3DS Core revalidation every two years, and registration completing only once compliance is validated
- [Visa: Global Registry of Service Providers](https://www.visa.com/splisting/), Visa's listing of registered and compliant agents
- [CSBS: Money Transmission Modernization Act](https://www.csbs.org/csbs-money-transmission-modernization-act-mtma), nationwide standards for net worth, surety bonds and permissible investments, and the number of enacting states
- [FCA: Apply to become an e-money or payment institution](https://www.fca.org.uk/firms/apply-emoney-payment-institution), the PSRs 2017 and EMRs 2011 and the €3m and €5m thresholds for full authorization
- [EBA: Payment services and electronic money](https://www.eba.europa.eu/regulation-and-policy/payment-services-and-electronic-money), PSD2 guidelines including authorisation and registration, and the transition to PSD3 and the PSR
- [OFAC: Sanctions compliance FAQs](https://ofac.treasury.gov/faqs/topic/1501), the obligation on all US persons and the 50 percent ownership rule

**In practice**

- [Stripe: Security at Stripe](https://docs.stripe.com/security), a provider's public statement of PCI Service Provider Level 1 certification and annual SOC 1 and SOC 2 Type II reports
- [Stripe: Connect risk management](https://docs.stripe.com/connect/risk-management), what a provider handles for platforms (MATCH checks, MTL and EMI licenses) and how negative balance liability is split
