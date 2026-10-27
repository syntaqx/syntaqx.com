+++
title = "The Payments Landscape"
description = "Who's who in payments: networks, acquirers, processors, PSPs, embedded payments, bank rails, orchestration, vaults, fraud, wallets, recent moves, build vs buy."
category = "Payments Industry"
order = 1402
part = "How Money Moves"
aliases = []
tags = ["payments", "vendors", "market-map", "processors", "build-vs-buy"]
+++

[How Card Payments Work](/books/payments/card-payments) drew the parties to one card payment by role: issuer, acquirer, network, processor, gateway. This chapter puts company names on those roles, and on the layers that have grown around them since: platforms that embed payments for software companies, APIs over bank rails, orchestration that sits in front of several processors, vaults that hold card numbers for whoever needs them, fraud vendors, wallets and lenders at checkout. The names matter less than the shape. Almost every company here sits in more than one box, most of the large ones got there by acquisition, and the box a vendor started in still shows in its data model, its contract and what it lets you take with you when you leave.

The market also moves faster than any other in this volume. Networks change owners, processors split and recombine, and new layers (agentic commerce, stablecoin infrastructure) arrive with launch announcements before they arrive with volume. So this chapter maps the market by layer, records dated moves under a dated heading, and ends with what to buy, what to extend and what to build. It is a map, not a ranking: no vendor's own vocabulary is the model for the rest of the volume, and every product claim below comes from the vendor's own page, cited.

## The Map

| Layer | What it does | Examples |
| --- | --- | --- |
| **Networks** | Write the rules, route messages between acquirers and issuers, clear and settle | Visa, Mastercard, American Express, Discover (Capital One); debit networks such as PULSE |
| **Issuers** | Hold the cardholder's account and approve or decline | Banks and card programs, and the issuer processors behind them |
| **Acquirers and processors** | Sign merchants, carry their risk, run authorization and clearing for them | Fiserv, Global Payments (with Worldpay), Chase, Elavon |
| **Gateways and PSPs** | One API in front of acquiring, often acquiring themselves | Stripe, Adyen, Checkout.com, Braintree (PayPal), Square |
| **Embedded payments** | Let a software platform offer payments to its own customers | Stripe Connect, Adyen for Platforms, Finix, Rainforest, Stax Connect, Global Payments for Platforms (formerly Payrix) |
| **Bank rails and money movement** | APIs over ACH, wires and real-time payments, and the banks behind them | Modern Treasury, Increase, Column, Unit, Moov, Dwolla |
| **Orchestration** | Route across several processors from one integration | Spreedly, Primer, Gr4vy |
| **Vaults** | Hold card and bank numbers outside any one processor | VGS, Basis Theory, Skyflow, IXOPAY (TokenEx) |
| **Fraud and risk** | Score payments and merchants, sometimes guarantee the outcome | Sift, Signifyd, Forter, Riskified, Sardine; network models from Visa and Mastercard |
| **Wallets and BNPL** | A payment method at checkout, sometimes a ledger of its own | Apple Pay, Google Pay, PayPal; Affirm, Klarna, Afterpay |

The useful line runs between the layers that **hold money or risk** (networks, issuers, acquirers, payment facilitators, banks) and the layers that **hold software and data** (gateways, orchestration, vaults, fraud scoring). A company in the first group needs a license, a sponsor or network membership, and capital; a company in the second needs engineering and a PCI assessment. Many vendors span both, and the question to ask any of them is which entity is the merchant of record, which bank holds the funds, and who pays when a merchant disappears ([Becoming a Payment Provider](/books/payments/becoming-a-payment-provider#pick-a-model-pick-a-risk)).

## Networks

Visa and Mastercard are the two global **four-party** networks: they don't issue cards or sign merchants, and they set the rules both sides follow ([The Payments Rulebook](/books/payments/payments-rulebook)). American Express and Discover grew up as **three-party** networks that issue and acquire largely themselves.

Discover changed hands. Capital One completed its acquisition of Discover Financial Services on May 18, 2025, and its announcement said the Discover, PULSE and Diners Club International networks would join it. The point of the deal for Capital One is the network: as of July 2026 it had moved about 25 million of its debit cards onto the Discover network and was testing credit cards there, with Discover's existing portfolio moving in waves, while some cards, Venture X among them, stay on Visa. For a platform, that means the Discover share of debit volume is no longer a rounding error, and Discover's acceptance, interchange and dispute rules deserve their own tests rather than "same as Visa" assumptions ([Interchange & Pricing](/books/payments/interchange-and-pricing)).

The US network rules themselves are in motion too. Visa and Mastercard signed an amended settlement of the long-running merchant class action (MDL 1720) dated November 10, 2025. Its headline terms: average effective credit interchange at least 10 basis points lower for five years, standard consumer credit posted rates capped at 125 basis points, posted rates frozen at March 31, 2025 levels, merchants allowed to accept or decline whole card categories (debit, commercial, standard consumer, premium consumer) and individual digital wallets rather than honoring all cards, and surcharges allowed at brand or product level up to the lesser of 3% or the merchant's cost of acceptance. The court granted preliminary approval on June 9, 2026; I found no final approval as of October 2026, so treat the terms as pending. [Surcharging & Fees](/books/payments/surcharging-and-fees) is where they would change what you build.

## Acquirers and Processors

The acquiring side of US card payments is concentrated in a handful of companies, most of them assembled from earlier mergers:

- **Fiserv** runs merchant acquiring and processing at scale alongside its bank technology.
- **Global Payments** completed its acquisition of Worldpay from FIS and GTCR on January 12, 2026, and in the same transaction sold its issuer processing business to FIS. The combined company reported about $3.7 trillion in volume and more than 6 million merchant locations at closing.
- **FIS** went the other way: it sold a majority of Worldpay to GTCR (completed February 1, 2024, per the closing release), then bought Global Payments' Issuer Solutions, which it calls "formerly TSYS". TSYS, once the processor behind many US issuers and merchants, is now split by side.
- **Chase** and **Elavon** (a wholly owned subsidiary of U.S. Bank) are bank-owned acquirers that process for their own merchants.

Two consequences for anyone building on them. First, the **processor behind your processor** matters: a payment facilitator or PSP is often a front end on one of these back ends, and an outage, a certification calendar or a settlement cutoff at the back end becomes yours ([Inside a Processor](/books/payments/inside-a-processor)). Second, mergers change integrations slowly and contracts quickly. When an acquirer changes owner, its pricing, risk appetite and product roadmap can change long before its APIs do, which is why [Switching Processors](/books/payments/switching-processors) starts with the contract.

## Gateways and Payment Service Providers

A **payment service provider** (PSP) puts one API in front of everything a merchant needs to take payments: a gateway, processing, usually acquiring or payment facilitation, a vault, fraud scoring and payouts. The large ones differ mostly in where they started:

- **Stripe** started as a developer API for online businesses and grew outward into billing, platforms (Connect), in-person (Terminal) and, through acquisitions, stablecoin infrastructure: it completed its acquisition of Bridge on February 4, 2025.
- **Adyen** sells one platform to enterprise merchants across channels and countries, and added platforms later.
- **Checkout.com** sells to large online merchants across many markets.
- **Braintree**, owned by PayPal, is a gateway and processor that also carries PayPal and Venmo as payment methods.
- **Square**, part of Block, sells point of sale and payments to small merchants, in person and online.

From outside they look interchangeable; from inside, the differences that matter are the ones that are expensive to change later. Who is the acquirer in each country (the PSP itself, or a partner bank). Which network tokens it provisions and whether it will let you take them ([Processor Routing](/books/payments/processor-routing#tokens-decide-how-free-you-are)). What it exports when you leave: Stripe, Braintree, Adyen and Checkout.com all publish card import procedures, and their export terms differ ([Switching Processors](/books/payments/switching-processors)). And its pricing model: blended or interchange-plus ([Interchange & Pricing](/books/payments/interchange-and-pricing#pricing-models)).

## Embedded Payments: How the Platforms Do It

Software platforms (a gym system, a dental practice suite, a marketplace) want to offer payments to their own customers and earn on them. The ladder from referral to registered payment facilitator is in [Payments for Software Platforms](/books/payments/software-platforms#four-ways-in) and [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider#the-realistic-path). The vendors who sell the middle rungs, often called **payfac-as-a-service** or managed payfac, describe themselves in their own words:

| Vendor | What its docs say it is | What the platform still owns |
| --- | --- | --- |
| **Adyen for Platforms** | "Onboard users of your platform, process payments for them, and pay out their funds" | The platform experience and the split of funds |
| **Finix** | A registered processor (sponsor Pathward) and a registered payment facilitator (sponsor Fifth Third), directly connected to Visa, Mastercard, Amex and Discover since May 2023 | Whatever the chosen model leaves it; Finix carries both the processor and the facilitator role |
| **Global Payments for Platforms** | Embedded payments for SaaS, in tiers from integrated payments to "PayFac-as-a-Service Pro" and a self-managed "PayFac Developer" tier; payrix.com now redirects here | The platform layer on a large acquirer, with a documented path to self-managed facilitation |
| **Rainforest** | "Embedded payments purpose-built for vertical SaaS" | The vertical product and its merchants |
| **Stax Connect** | Embedded payments "without having to build your own payments organization"; Stax handles bank sponsorship, disputes and funds movement | Distribution and merchant experience |
| **Stripe Connect** | "Embed payments and financial products in your SaaS platform, marketplace, or fintech" | Onboarding UX and pricing to the extent the account configuration allows; fraud and dispute liability depending on it ([Payments for Software Platforms](/books/payments/software-platforms#four-ways-in)) |

Read the table for what it implies. The managed providers compete on how much of the payments organization they take off the platform (underwriting, sponsorship, disputes, compliance), and the more they take, the less of the margin and the merchant relationship the platform keeps. Global Payments' tiers, from payfac-as-a-service to a self-managed facilitator tier on the same platform, describe the route some platforms want: start managed, then take on facilitation without changing processors. The questions to ask any of them are the same as for a PSP, plus three: who underwrites a new merchant and how fast, whose name the merchant agreement is in, and whether the platform can move its merchants, with their stored cards, if it outgrows the provider.

## Bank Rails and Money Movement

A second infrastructure market sits on the bank rails rather than the card networks: APIs for ACH, wires, real-time payments and accounts, and the banks that hold the money behind them ([ACH & Bank Transfers](/books/payments/ach), [Treasury & Bank Operations](/books/payments/treasury)).

| Vendor | What it says it is | Shape |
| --- | --- | --- |
| **Column** | "The only nationally chartered bank designed to help you build and fund new financial products" | A bank that sells to developers |
| **Dwolla** | "The payments operations layer for bank transfers", over ACH and real-time payments | ACH and instant payments API |
| **Increase** | "Direct connections to the networks for money movement", with wire details "directly from Fedwire" | Direct rail access through a bank partner |
| **Modern Treasury** | A "Multi-Rail Payment Service Provider" with "one API to... move money across fiat and stablecoins" | Payment operations over your banks, or its own |
| **Moov** | "Orchestrates the entire money movement story" | Money movement API across rails |
| **Unit** | "Build financial products on real infrastructure"; "Unit is a financial technology company and not a bank" | Accounts, cards and payments through partner banks |

The structural question here is **who keeps the ledger of whose money is where**, and the industry learned it the hard way. Synapse, a middleware company that sat between fintech apps and partner banks, filed for bankruptcy on April 22, 2024; its partner banks found a shortfall the CFPB later put at $60 million to $90 million, and consumers lost access to their funds for weeks or months. Two months later, on June 14, 2024, the Federal Reserve and the Arkansas State Bank Department announced a cease-and-desist order against Evolve Bank & Trust, one of the banks in that arrangement, over anti-money-laundering, risk-management and consumer-compliance weaknesses in its fintech partnerships. The lesson for a buyer is to ask which bank holds the funds, in what kind of account, and whether the bank's own records can identify each end customer's balance without the middleware ([FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)).

## Orchestration, Vaults and Fraud

Three layers exist because no single processor is the best at everything, and each sells independence from the processor.

**Orchestration** puts one integration in front of several processors and routes between them. Spreedly's homepage calls it "Payment Orchestration for the Agentic Era" and Gr4vy calls itself "the world's first cloud-based payment orchestration platform"; Primer frames itself as unified intelligence for routing, fallbacks and reconciliation. Spreedly closed its acquisition of Dodgeball, a fraud orchestration company, in September 2025, which shows the direction: orchestrators are adding the decisions around the route, not only the route. What routing involves, and when a second processor pays for itself, is in [Processor Routing](/books/payments/processor-routing).

**Vaults** hold card and bank numbers outside any processor and give your systems tokens that any route can use. VGS describes an "independent vault to reduce your PCI compliance"; Basis Theory says it "routes, tokenizes, and optimizes your payments"; Skyflow sells a data privacy vault for sensitive data beyond cards. IXOPAY and TokenEx announced their merger on April 17, 2024, combining a vault with orchestration. A third-party vault is the buy side of the decision in [Running a Card Vault](/books/payments/card-vault): it moves PCI scope off your systems and keeps the card numbers portable, at the price of a per-token or per-call fee and one more vendor in the authorization path.

**Fraud** is sold at three levels. Networks score every authorization for the issuer (Visa completed its acquisition of Featurespace, a fraud-detection company, on December 19, 2024). PSPs score for their merchants with models trained across their whole network. Independent vendors sell to merchants and platforms: Sift describes a "fraud prevention platform that uses machine learning", Signifyd offers a "100% financial guarantee" on orders it approves, Forter sells identity-based fraud decisions, and Sardine calls itself an "agentic risk platform for fighting financial crime" covering fraud, AML and transaction monitoring. A guarantee changes who carries the loss, which is a contract question as much as a model question. What the scores feed is in [Fraud & Risk](/books/payments/fraud-and-risk) and [AI in Payments](/books/payments/ai-in-payments).

## Wallets and Buy Now, Pay Later

Wallets come in two kinds ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods)). Apple Pay and Google Pay are cards in disguise: a device token on the card rails, with the PSP doing the integration. PayPal and Venmo are rails of their own, with their own ledger, disputes and terms. Both matter to the landscape mostly through **who controls the checkout**: a wallet button moves the customer's credentials, and sometimes the customer relationship, to the wallet's owner.

BNPL providers (Affirm, Klarna, and Afterpay, which Block lists among its brands) are lenders at checkout: they pay the merchant upfront and carry the customer's credit risk, for a merchant fee above card pricing. They reach merchants through PSPs as payment methods and directly through their own merchant agreements, and increasingly through software platforms in verticals where tickets are large.

## Recent Moves, as of October 2026

Dated facts age fast; this is the market as of October 2026, from each company's announcement or the filing or coverage cited.

| Date | Move | Why it matters |
| --- | --- | --- |
| February 1, 2024 | FIS completes the sale of a majority stake in Worldpay to GTCR | The bank-technology and merchant-acquiring businesses separate again |
| April 17, 2024 | IXOPAY and TokenEx announce their merger | Vaults and orchestration combine |
| April 22, 2024 | Synapse files for bankruptcy; end users lose access to funds | Middleware between apps and banks becomes a regulatory and diligence issue |
| June 14, 2024 | Federal Reserve cease-and-desist order against Evolve Bank & Trust | Sponsor banks' fintech programs come under enforcement |
| November 15, 2024 | Nuvei completes its going-private transaction with Advent | A public PSP returns to private ownership |
| December 19, 2024 | Visa completes its acquisition of Featurespace | Networks buy fraud machine learning |
| February 4, 2025 | Stripe completes its acquisition of Bridge | A PSP adds stablecoin infrastructure |
| May 18, 2025 | Capital One completes its acquisition of Discover | An issuer owns a network, and moves its debit cards onto it |
| September 2025 | Spreedly closes its acquisition of Dodgeball | Orchestration adds fraud orchestration |
| November 10, 2025 | Visa and Mastercard sign an amended merchant class settlement; preliminary approval June 9, 2026 | Interchange caps, category-level acceptance and surcharging rules, pending final approval |
| December 18, 2025 | Visa reports hundreds of live agent-initiated transactions on Intelligent Commerce | Agentic commerce moves from announcement to production pilots ([AI in Payments](/books/payments/ai-in-payments)) |
| January 12, 2026 | Global Payments completes its acquisition of Worldpay; FIS acquires Global Payments' Issuer Solutions | The largest acquirer consolidation in years, and TSYS splits by side |
| April 7, 2026 | Capital One completes its acquisition of Brex | An issuer-network buys a corporate card and spend platform |

Three patterns run through the list. **Consolidation by side:** acquiring and issuing processing separated (Worldpay with Global Payments, issuer processing with FIS) after a decade of being combined. **Networks moving up the stack:** Visa buys fraud models, Capital One buys a network to route its own cards, and the networks build agent-payment programs of their own. **Independence layers grow:** orchestration, vaults and fraud vendors sell freedom from any single processor, and buy each other to sell more of it.

## Build, Buy or Extend

Almost every company that takes payments should buy most of this stack. The decision is which parts.

**Buy** the layers that need a license, a network connection or a balance sheet: acquiring, the sponsor bank, network tokens, account updater, and the bank rails. Building any of them is the work of [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider) and [Inside a Processor](/books/payments/inside-a-processor), measured in years and capital. The test when buying isn't the demo; it's the five things that are expensive to change: who is merchant of record, who holds the tokens, what the export clause says, how fees appear in settlement files, and what the provider does with a merchant it decides to terminate.

**Extend** when one provider fits most of what you need. Two shapes:

- **Extend the provider.** Embedded payments products are built to be extended: your onboarding in front of their underwriting, your pricing on their rails, your dashboard over their API. You inherit their risk policy and their roadmap.
- **Extend around the provider.** Keep the provider for processing and add independence layers: a third-party vault so the cards are yours, an orchestrator or your own router for a second processor, a fraud vendor whose model sees your whole business. Each layer adds a vendor in the authorization path, and each one is worth it only when it buys a specific freedom.

**Build** the parts that are your product and your records. My default for a platform or provider:

```text
build (your model, your records)          buy or license (licensed, networked, capital-heavy)
--------------------------------          -----------------------------------------------
payment model and state machines          acquiring, sponsor bank, network membership
ledger and reconciliation                 processing and network connectivity
merchant model, pricing, statements       network tokens, account updater
routing rules (if more than one route)    card vault (or build to PCI scope, deliberately)
risk policy on top of vendor scores       fraud models trained across networks
onboarding UX and evidence of consent     identity and business verification data
crosswalks to every vendor's IDs          bank rails and account APIs
```

The left column is what makes switching possible later: your own payment IDs, your own ledger, and a crosswalk from every vendor's IDs to yours ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)). Put an [anti-corruption layer](/docs/architecture/service-boundaries) between your model and every provider, normalize their responses at that edge ([One Response Model](/books/payments/processor-routing#one-response-model)), and drive your state from your own [events](/docs/architecture/events), not a provider's webhooks.

## Auditing

A stack assembled from vendors needs auditing across the joins:

- **Know which vendor touched each payment.** Every payment, refund, payout and dispute records the processor, acquirer, vault and fraud vendor involved, with each vendor's reference, so a question from any of them can be answered from your records ([Payouts & Settlement](/books/payments/payouts-and-settlement#one-payment-traced)).
- **Keep the vendor's decision with your own.** A fraud score, a vendor's approval or guarantee decision, and the processor's raw response code are stored as received, beside your normalized result, with the vendor's model or API version where it's given.
- **Keep each vendor's assurance on file.** PCI Attestations of Compliance, SOC reports, sponsor bank agreements and network registrations, with their expiry dates monitored like certificates ([PCI DSS](/docs/compliance/pci-dss#what-a-service-provider-adds)).
- **Record ownership changes.** When a vendor is acquired, note the date and the new owner against the contract, because notice periods, change-of-control clauses and data processing terms often hang on it.

The audit record itself is in [Audit Trails](/docs/architecture/audit-trails).

## What This Means for the System You Build

- **Map each vendor to the layers it holds,** and know for each one who is merchant of record, which bank holds the funds and who pays when a merchant disappears.
- **Buy the licensed and networked layers;** build the payment model, ledger, merchant model, routing rules and crosswalks.
- **Own the identifiers and the tokens:** your own payment IDs, a vault you control or a contract that lets you take the cards, and network tokens you can move.
- **Read the export clause and the termination clause before signing,** because consolidation can change your provider's owner, pricing and risk appetite without changing its API.
- **Test each network's rules separately,** including Discover's, which carries more debit volume as Capital One moves cards onto it.
- **Ask money-movement vendors where the ledger of record lives,** and whether the bank can identify each customer's funds without them.
- **Date every market fact you rely on,** and recheck it when you renew.

## References

**Reference**

- [Capital One: Completes acquisition of Discover (SEC exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/927628/000119312525122059/d934475dex991.htm), completion on May 18, 2025 and the Discover, PULSE and Diners Club International networks
- [Visa: Amended class settlement agreement, MDL 1720 (SEC exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1403161/000140316125000093/vex991settlementagreementf.htm), the November 10, 2025 settlement: interchange reductions and caps, category acceptance and surcharging terms
- [Global Payments: Completes acquisition of Worldpay (SEC exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1123360/000110465926002705/tm262856d1_ex99-1.htm), completion on January 12, 2026, the sale of Issuer Solutions to FIS, and combined volume and merchant locations
- [CFPB: Synapse Financial Technologies enforcement action](https://www.consumerfinance.gov/enforcement/actions/synapse-financial-technologies-inc/), the April 22, 2024 bankruptcy, the $60 million to $90 million shortfall and consumers' loss of access to funds
- [Federal Reserve: Enforcement action against Evolve Bancorp and Evolve Bank & Trust](https://www.federalreserve.gov/newsevents/pressreleases/enforcement20240614a.htm), the June 14, 2024 cease-and-desist order over fintech partnership weaknesses
- [Visa: Completes acquisition of Featurespace](https://investor.visa.com/news/news-details/2024/Visa-Completes-Acquisition-of-Featurespace/default.aspx), December 19, 2024
- [Visa: Intelligent Commerce momentum (December 18, 2025)](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21961.html), hundreds of agent-initiated transactions in live production

**In practice**

- [Stripe: Completes Bridge acquisition](https://stripe.com/newsroom/news/stripe-completes-bridge-acquisition), February 4, 2025
- [Nuvei: Completion of going-private transaction](https://www.nuvei.com/posts/nuvei-announces-completion-of-going-private-transaction), November 15, 2024, with Advent
- [Capital One: Completes acquisition of Brex](https://www.capitalone.com/about/newsroom/capital-one-completes-acquisition-of-brex/), April 7, 2026
- [PaymentsJournal: Capital One turns to credit card migration (July 22, 2026)](https://www.paymentsjournal.com/after-moving-debit-cards-to-discover-capital-one-turns-to-credit-card-migration/), about 25 million debit cards moved to the Discover network, credit testing and portfolio waves
- [Payments Dive: Court approves Visa, Mastercard settlement](https://www.paymentsdive.com/news/court-approves-visa-mastercard-settlement/822440/), preliminary approval on June 9, 2026
- [IXOPAY: IXOPAY and TokenEx merger](https://www.ixopay.com/news/ixopay-and-tokenex-merger-a-new-era-in-payment-optimization), announced April 17, 2024
- [Spreedly: Record growth announcement](https://www.spreedly.com/blog/spreedly-announces-record-growth), the Dodgeball acquisition closed in September 2025
- [Finix: Banking relationships](https://finix.com/terms-and-policies/banking-relationships), registered processor and payment facilitator and their sponsor banks
- [Finix: Finix is now a payments processor](https://finix.com/press/finix-is-now-a-payments-processor), direct connections to Amex, Discover, Mastercard and Visa from May 2023
- [Stripe: Connect](https://docs.stripe.com/connect), embedded payments for SaaS platforms, marketplaces and fintechs
- [Adyen: Adyen for Platforms](https://docs.adyen.com/platforms/), onboarding, processing and payouts for platform users
- [Rainforest](https://www.rainforestpay.com/), embedded payments for vertical SaaS
- [Stax: Stax Connect](https://staxpayments.com/stax-connect/), embedded payments with bank sponsorship, disputes and funds movement handled by Stax
- [Elavon: About Elavon](https://www.elavon.com/about-elavon.html), a wholly owned subsidiary of U.S. Bank
- [Modern Treasury](https://www.moderntreasury.com/), multi-rail payment service provider
- [Increase: Wires](https://increase.com/products/wires), direct connections to Fedwire and other networks
- [Column](https://column.com/), a nationally chartered bank for developers
- [Unit](https://www.unit.co/), financial infrastructure through partner banks; not a bank
- [Moov](https://moov.io/), money movement orchestration
- [Dwolla](https://www.dwolla.com/), payment operations for bank transfers
- [Spreedly](https://www.spreedly.com/), payment orchestration
- [Gr4vy](https://gr4vy.com/), cloud payment orchestration
- [Primer: What is payment orchestration](https://primer.io/blog/what-is-payment-orchestration-and-how-can-it-maximize-payment-efficiency), routing, fallbacks and reconciliation in one layer
- [VGS](https://www.verygoodsecurity.com/), an independent vault to reduce PCI scope
- [Basis Theory](https://www.basistheory.com/), tokenization, routing and vaulting
- [Skyflow: Data privacy vault](https://www.skyflow.com/product/pii-data-privacy-vault), isolating and governing sensitive data
- [Sift](https://sift.com/), machine-learning fraud prevention
- [Signifyd](https://www.signifyd.com/), a financial guarantee on approved orders
- [Forter](https://www.forter.com/), identity-based fraud decisions
- [Sardine](https://www.sardine.ai/), fraud, AML and transaction monitoring
- [Block](https://block.xyz/), Square, Cash App and Afterpay among its brands
- [Global Payments for Platforms](https://platforms.globalpayments.com/), embedded payments tiers from integrated payments to PayFac-as-a-Service and self-managed PayFac
