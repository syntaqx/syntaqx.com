+++
title = "Becoming a Payment Provider"
description = "What it takes to be a Stripe or a payfac rather than integrate one: sponsor banks, card networks, PCI as a service provider, licensing and the money."
category = "Payments"
order = 812
tags = ["payments", "compliance", "pci", "licensing"]
+++

Integrating a payment provider is an engineering project. Becoming one is a regulated business that happens to need a lot of engineering. The API is the visible part, and it is the smallest part: underneath it sit a bank that lets you into the card networks, an annual security assessment your customers will ask to see, licenses or exemptions for holding other people's money, and a balance sheet that absorbs whatever your merchants can't pay back. Every company that sells payments as a product, from Stripe and Adyen to a vertical software platform that started as a payfac, built or rented each of those layers.

This page walks through what each layer is, why it exists and who pays when it fails, and ends with the order most companies actually acquire them in. **It is not legal advice.** What you need depends on the countries you operate in, the model you pick and exactly how the money moves; licensing in particular turns on facts a lawyer has to look at. Where this page names a threshold or a rule, it has a source; where the answer is "it depends", it says so.

## Pick a Model, Pick a Risk

"Payment provider" covers several businesses that look alike from the outside and carry very different risk. The question that separates them is: when a merchant takes money it shouldn't have and disappears, who refunds the cardholder?

| Model | What you do | Who holds merchant risk |
| --- | --- | --- |
| **Gateway** | Pass transactions from merchants to a processor; often store tokens | The acquirer, and the merchant's own contract with it |
| **ISO / agent** | Sell and support another acquirer's merchant accounts, for a share of revenue | Usually the acquirer, unless your contract shifts liability onto you |
| **Payment facilitator** | Contract with sub-merchants under your own master merchant account | You, first; your sponsor acquirer behind you |
| **Processor** | Run the authorization and clearing systems that connect to the networks | Depends on the contract; the technology risk is yours |
| **Acquirer** | Be the network member that settles funds to merchants | You, as the party the network holds responsible |

The pattern down the table is that every step toward the money moves risk onto you. A gateway that goes down loses revenue; a payfac whose sub-merchant commits fraud loses the money itself, because the acquirer will recover chargebacks from the payfac before it tries anyone else. That is the trade: the further down the table you go, the more of the economics you keep and the more of the losses you own.

Most "Stripe competitors" are payfacs. Stripe's own Connect docs are a useful map of what that means in practice: they list MATCH list checks, prohibited business checks and money transmitter and e-money licenses among the things the provider handles for platforms, and they state that responsibility for a connected account's negative balance belongs to either the platform or Stripe depending on the integration. A payfac is the party that has to make that decision for its own sub-merchants, and back it with capital.

## The Sponsor Bank

Card networks don't contract with software companies. Visa and Mastercard are membership organizations of banks and licensed institutions, and only a member can acquire transactions. Everyone else gets in through one: a **sponsor bank** (or acquirer) that agrees to be responsible to the network for you.

That sponsorship is the single most important relationship in the business, for three reasons:

- **It is your network access.** The acquirer registers you with the networks, and it can stop sponsoring you. A payfac that loses its sponsor without a second one in place stops processing.
- **It sets your risk appetite.** The acquirer's credit and compliance teams decide which industries you may board, what reserves you hold and what monitoring you run. Your underwriting policy is, in large part, theirs.
- **It is a credit decision about you.** Because the acquirer is liable to the network for your merchants, it underwrites you the way you underwrite them: financials, capital, ownership, management, controls. Expect to post collateral or a reserve of your own.

Plan for at least two sponsor relationships eventually. One is enough to launch; it is not enough to survive a sponsor changing its risk policy.

## Network Registration

Being sponsored is not the same as being known to the networks. Both major networks run registration programs for the third parties in the payment chain (payfacs, ISOs and the service providers that store or process card data), and the acquirer is usually the one that submits the registration. Visa publishes a Global Registry of Service Providers, which it describes as the designated source for information on registered and compliant agents; customers and acquirers check it.

The exact program names, fees and requirements change and differ between Visa and Mastercard, so take them from your sponsor and the networks' current rules rather than from any article, including this one. What doesn't change is the shape: registration needs a sponsor, and staying registered needs annual proof that you're secure.

## PCI DSS as a Service Provider

Every merchant has a PCI DSS obligation. A payment provider has a different one: it is a **service provider**, an entity that stores, processes or transmits card data on behalf of others, and its customers' compliance depends on it. [PCI DSS](/docs/compliance/pci-dss) covers the standard itself; what changes when you're the provider is the scale of the assessment and who asks for the results.

- **The networks set validation levels by annual transaction volume.** At the top level, a service provider validates with a **Report on Compliance (ROC)** written by a **Qualified Security Assessor (QSA)**, an independent assessor qualified by the PCI Security Standards Council, plus quarterly external vulnerability scans by an Approved Scanning Vendor. Lower levels may self-assess. The thresholds are set by each brand, not by PCI SSC, and the brands' current figures are the ones that count. Any provider aiming to compete with the large processors should plan for the top level from the start; Stripe, for example, states that it is certified as a PCI Service Provider Level 1.
- **It is annual.** Visa requires issuers and acquirers to ensure all their service providers demonstrate PCI DSS compliance at least every 12 months. The assessment is a recurring cost and a recurring project, not a launch milestone.
- **Your customers will ask for the AOC.** The ROC is detailed and confidential; the **Attestation of Compliance (AOC)** is the summary you hand to merchants, acquirers and enterprise buyers as evidence. Enterprise sales cycles stall without a current one.
- **Your design decides your scope.** Every system that touches card data, or can affect the security of one that does, is in scope. The engineering choice that pays off most is isolating card data in a small vault and handing everything else tokens, which is the reason [sensitive data](/docs/payments/sensitive-data) gets its own page. A provider whose whole platform is in scope is assessing its whole platform, every year.

## The Other PCI Standards

PCI DSS is the one everyone knows. Depending on what you build, others apply too:

- **PIN Security** governs how PINs are protected during online and offline transaction processing. PCI SSC aims it at acquiring institutions and agents responsible for PIN transaction processing, and notes that whether it applies is decided by the organizations that manage compliance programs: the payment brands and acquirers. If you route debit with PIN, or run terminals that accept it, expect your acquirer to require it.
- **Point-to-Point Encryption (P2PE)** covers solutions that encrypt card data from the point of acceptance. It matters for in-person payments, and it is a product decision as much as a security one: PCI SSC notes that merchants using a listed P2PE solution have fewer applicable PCI DSS requirements, which is a selling point for your terminals.
- **3DS Core** applies to environments where 3-D Secure functions are performed: the access control server, the directory server or the 3DS server. Most providers integrate a certified 3DS server rather than build one; if you build one, it has its own assessment by a PCI SSC qualified 3DS Assessor. See [strong customer authentication](/docs/payments/strong-customer-authentication) for why 3DS matters in the first place.

## Holding Other People's Money

The moment funds pass through your control on their way from a payer to a merchant, you may be doing something regulated: money transmission in the US, payment services or e-money issuance in the EU and UK. This is the area where the specifics matter most and generalizations are most dangerous.

**United States.** Money transmission is licensed state by state, and a provider that needs licenses needs them in most states, each with its own application, examination and ongoing reporting. The Conference of State Bank Supervisors' Money Transmission Modernization Act is an attempt to make that bearable: a single set of nationwide standards covering net worth, surety bonds and permissible investments. CSBS reports that 31 states have enacted it in full or in part, which also means many have not. Whether a given payfac needs licenses at all is contested ground. Structures exist that may avoid it, such as funds flowing through accounts the sponsor bank controls, or the provider acting as the merchant's agent to receive payment, but whether one applies depends on the state and on contract details. That is a question for counsel with the actual flow of funds in front of them, not something to infer from a competitor's structure.

**UK.** The FCA authorizes payment institutions under the Payment Services Regulations 2017 and e-money institutions under the Electronic Money Regulations 2011. Size decides the category: above a monthly average of €3 million in payment transactions you need full authorization as a payment institution, below it you may register as a small one; above €5 million of average outstanding e-money you need full authorization as an e-money institution. Full authorization brings capital, safeguarding and governance requirements that small registration doesn't.

**European Union.** Payment institutions and e-money institutions are authorized by national regulators under PSD2 and the E-Money Directive, with the EBA issuing the guidelines regulators apply, including on authorisation itself. An authorization in one member state can be passported to others. The framework is being replaced by PSD3 and a Payment Services Regulation, so check what applies on your launch date.

The cost isn't only the application. Licensed entities carry capital and safeguarding requirements, regular examinations and reporting, and a compliance function that has to exist before the license is granted.

## Know Your Merchant, and Who Owns Them

A payment provider is a gatekeeper for the financial system, and regulators and sponsors expect it to act like one. [Merchant onboarding](/docs/payments/merchant-onboarding) covers how to build KYC and KYB; at the provider level the additional points are about who you're accountable to.

- **Sanctions screening is not optional.** OFAC is direct about this: all US persons must comply with OFAC sanctions, and an entity owned 50% or more by blocked persons is itself blocked even if it isn't named on a list. Screen the business, its owners and its payout destinations at onboarding and again whenever the lists change, not once.
- **AML is a program, not a check.** Expect your sponsor, and any regulator that licenses you, to require a written anti-money-laundering program with a named officer, risk assessment, transaction monitoring and suspicious activity reporting. The software vendor that "does KYC" is one input to that program, not the program.
- **Terminated merchant lists.** Networks maintain lists of merchants terminated for cause, such as Mastercard's MATCH. Check them at onboarding, and expect to add merchants you terminate.

## Underwriting, Reserves and Who Eats the Loss

Fraud and failure are a cost of doing business; the question is whose. When a merchant can't cover its refunds and [chargebacks](/docs/payments/disputes-and-chargebacks), the loss moves up the chain: from the merchant to the payfac, from the payfac to the acquirer. Each party protects itself the same way, by holding back some of the money it owes the party below it.

- **Underwriting** decides what a merchant may do before it does it: industries you accept, volume limits, delivery timeframes. A business that sells tickets for events months away carries months of refund exposure; a coffee shop carries days.
- **Reserves** are the merchant's own money held against future losses, as a rolling percentage, a fixed amount or a delayed payout schedule. [Payouts and settlement](/docs/payments/payouts-and-settlement) covers how holds sit in the ledger.
- **Your own capital** covers what reserves don't. A provider that grows faster than its loss reserves is borrowing against its merchants' good behavior, and the acquirer will notice before you do.

Losses are lumpy. A provider can run clean for a year and then lose a quarter's margin to one merchant that collapses with a large prepaid order book. Price for that, and underwrite for it.

## How the Money Moves

Cardholder funds settle from the network to the acquirer, and from the acquirer onward. Where they land next is a design decision with legal weight. A common arrangement for platforms is a **for-benefit-of (FBO) account**: an account at the sponsor bank, in the provider's name, held for the benefit of the merchants whose money it is. The provider's ledger says who owns what inside it; the bank holds the pooled balance.

The structure matters because it is often what the licensing analysis turns on, and because it decides what happens to merchants' money if the provider fails. Two rules hold regardless:

- **Merchant funds are not operating funds.** Never pay your own expenses from the pool, even briefly, and keep your revenue in a separate account. Commingling is the fastest way to turn a contract dispute into a regulatory one.
- **The ledger must always reconcile to the bank.** Every day, the sum of every merchant's balance in your ledger plus your own fees must equal what the bank says the account holds. A difference is either a bug or a loss, and you need to know which before the next payout run.

## The Platform It Implies

Everything above becomes engineering requirements that a merchant integration never sees.

- **A double-entry ledger** is the source of truth for every balance, fee, reserve and payout. [Payment states](/docs/payments/payment-states) and [money](/docs/payments/money) cover the modelling; at provider scale the ledger is also what auditors, the sponsor bank and regulators examine.
- **Idempotency end to end.** Merchants will retry, and so will you when talking to networks and banks. A charge or payout that runs twice is real money. See [idempotency](/docs/payments/idempotency).
- **Reconciliation as a product.** Daily matching of network settlement files, bank statements and the ledger, with exceptions routed to people. Merchants will want the same view of their own money.
- **Webhooks as a contract.** Your merchants build their businesses on your events, so delivery, ordering and retries become an obligation. See [webhooks](/docs/payments/webhooks).
- **Key management with hardware security modules.** Card data encryption keys, and PIN keys if you touch PINs, live in HSMs under dual control, with documented key ceremonies. This is where the PCI assessment spends much of its time.
- **Availability as revenue.** When a provider is down, every merchant on it stops taking money. Design for it: redundant connections to acquirers and banks, no single region whose loss stops authorization, and status communication that merchants can rely on.

## SOC 2 Type II

PCI DSS proves card data is protected. Enterprise customers and partner banks will also ask about everything else: access control, change management, incident response, availability. The standard answer is a [SOC 2](/docs/compliance/soc-2) report, an examination by a CPA firm against the AICPA's Trust Services Criteria, which cover security, availability, processing integrity, confidentiality and privacy. A **Type II** report covers how controls operated over a period, not just how they were designed on one day, so it can't be rushed; plan for the observation window before the report you need. Stripe, for example, states that it produces SOC 1 and SOC 2 Type II reports annually. The PCI and SOC 2 programs share most of their evidence, so build one control set and assess it twice.

## The Realistic Path

Nobody starts as an acquirer. The providers that got there acquired the layers in roughly this order, each step funded by the revenue of the one before.

| Stage | What it unlocks | What it costs |
| --- | --- | --- |
| **1. Integrate a provider** | Payments in your product, with no regulatory footprint of your own | Margin; the provider owns pricing, risk and onboarding UX |
| **2. Platform on a provider's payfac program** | Your own onboarding and pricing, revenue share | Liability for some losses, depending on the provider's terms |
| **3. Payfac on a processor** | Your own sub-merchants, underwriting and payouts; most of the margin | A sponsor bank, network registration, PCI service provider validation, a risk team, reserves, possibly licensing |
| **4. Add a second sponsor, more processors** | Resilience and negotiating leverage | Duplicate integrations and reconciliation |
| **5. Direct acquiring / processing** | Network connectivity, the full margin, control over authorization | Network membership or a licensed acquiring entity, capital, HSM infrastructure, the full assessment scope |

Stage 3 is where most companies that call themselves payment providers live, and it is a good business on its own. The jump from 3 to 5 is less about engineering than about capital and licenses, and it's worth making only when the processor's share of each transaction is a large enough cost to justify carrying everything the processor was carrying for you.

## References

**Specifications**

- [PCI Security Standards Council: PCI DSS](https://www.pcisecuritystandards.org/standards/pci-dss/), the data security standard that service providers are assessed against
- [PCI SSC: PIN Security](https://www.pcisecuritystandards.org/standards/pin-security/), audience of acquirers and their agents, and applicability decided by payment brands and acquirers
- [PCI SSC: Point-to-Point Encryption](https://www.pcisecuritystandards.org/standards/point-to-point-encryption-p2pe/), encryption from the point of acceptance and reduced DSS requirements for merchants using listed solutions
- [PCI SSC: 3DS Core Security Standard](https://www.pcisecuritystandards.org/standards/pci-3ds/), scope of ACS, DS and 3DS server environments and assessment by qualified 3DS Assessors
- [PCI SSC: Document Library](https://www.pcisecuritystandards.org/document_library/), current versions of the standards, ROC and AOC templates
- [AICPA: SOC 2, Trust Services Criteria](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2), SOC 2 as an examination of controls relevant to security, availability, processing integrity, confidentiality or privacy

**Reference**

- [Visa: Security and compliance](https://corporate.visa.com/en/resources/security-compliance.html), the requirement that acquirers ensure service providers demonstrate PCI DSS compliance at least every 12 months
- [Visa: Global Registry of Service Providers](https://www.visa.com/splisting/), Visa's listing of registered and compliant agents
- [CSBS: Money Transmission Modernization Act](https://www.csbs.org/csbs-money-transmission-modernization-act-mtma), nationwide standards for net worth, surety bonds and permissible investments, and the number of enacting states
- [FCA: Apply to become an e-money or payment institution](https://www.fca.org.uk/firms/apply-emoney-payment-institution), the PSRs 2017 and EMRs 2011 and the €3m and €5m thresholds for full authorization
- [EBA: Payment services and electronic money](https://www.eba.europa.eu/regulation-and-policy/payment-services-and-electronic-money), PSD2 guidelines including authorisation and registration, and the transition to PSD3 and the PSR
- [OFAC: Sanctions compliance FAQs](https://ofac.treasury.gov/faqs/topic/1501), the obligation on all US persons and the 50 percent ownership rule

**In practice**

- [Stripe: Security at Stripe](https://docs.stripe.com/security), a provider's public statement of PCI Service Provider Level 1 certification and annual SOC 1 and SOC 2 Type II reports
- [Stripe: Connect risk management](https://docs.stripe.com/connect/risk-management), what a provider handles for platforms (MATCH checks, MTL and EMI licenses) and how negative balance liability is split
