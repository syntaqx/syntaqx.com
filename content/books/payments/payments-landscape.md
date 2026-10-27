+++
title = "The Payments Landscape"
description = "Who's who in payments: networks, acquirers, processors, PSPs, embedded payments, bank rails, orchestration, vaults, fraud, wallets, recent moves, build vs buy."
category = "Payments Industry"
order = 1402
part = "How Money Moves"
tags = ["payments", "vendors", "market-map", "processors", "build-vs-buy"]
+++

[How Card Payments Work](/books/payments/card-payments) drew the parties to one card payment by role: issuer, acquirer, network, processor, gateway. This chapter puts company names on those roles, and on the layers that have grown around them since: platforms that embed payments for software companies, APIs over bank rails, orchestration that sits in front of several processors, vaults that hold card numbers for whoever needs them, fraud vendors, wallets and lenders at checkout. The names matter less than the shape. Almost every company here sits in more than one box, most of the large ones got there by acquisition, and the box a vendor started in still shows in its data model, its contract and what it lets you take with you when you leave.

The market also moves faster than any other in this volume. Networks change owners, processors split and recombine, and new layers (agentic commerce, stablecoin infrastructure) arrive with launch announcements before they arrive with volume. So this chapter maps the market by layer, records dated moves under a dated heading, and ends with what to buy, what to extend and what to build. It is a map, not a ranking: no vendor's own vocabulary is the model for the rest of the volume, and every product claim below comes from the vendor's own page, cited.

## The Map

| Layer | What it does | Examples |
| --- | --- | --- |
| **Networks** | Write the rules, route messages between acquirers and issuers, clear and settle | American Express, Discover (Capital One), Mastercard, Visa; debit networks such as PULSE |
| **Issuers** | Hold the cardholder's account and approve or decline | Banks and card programs, and the issuer processors behind them |
| **Issuing platforms** | Processing, program management and sponsor-bank access for companies that issue cards ([Card Issuing](/books/payments/card-issuing#how-the-platforms-do-it)) | Adyen, Galileo (SoFi), i2c, Lithic, Marqeta, Stripe Issuing |
| **Acquirers and processors** | Sign merchants, carry their risk, run authorization and clearing for them | Chase, Elavon, Fiserv, Global Payments (with Worldpay) |
| **Gateways and PSPs** | One API in front of acquiring, often acquiring themselves | Adyen, Braintree (PayPal), Checkout.com, Square, Stripe |
| **Embedded payments** | Let a software platform offer payments to its own customers | Adyen for Platforms, Finix, Global Payments for Platforms (formerly Payrix), Moov, NMI, Payabli, Rainforest, Stax Connect, Stripe Connect, Tilled |
| **Bank rails and money movement** | APIs over ACH, wires and real-time payments, and the banks behind them | Column, Dwolla (NMI), Increase, Modern Treasury, Moov, Unit |
| **Orchestration** | Route across several processors from one integration | Gr4vy, Primer, Spreedly |
| **Vaults** | Hold card and bank numbers outside any one processor | Basis Theory, IXOPAY (TokenEx), Skyflow, VGS |
| **Fraud and risk** | Score payments and merchants, sometimes guarantee the outcome | Forter, Riskified, Sardine, Sift, Signifyd; network models from Mastercard and Visa |
| **Wallets and BNPL** | A payment method at checkout, sometimes a ledger of its own | Apple Pay, Google Pay, PayPal; Affirm, Afterpay, Klarna |

The useful line runs between the layers that **hold money or risk** (networks, issuers, acquirers, payment facilitators or payfacs, banks) and the layers that **hold software and data** (gateways, orchestration, vaults, fraud scoring). A company in the first group needs a license, a sponsor or network membership, and capital; a company in the second needs engineering and a PCI assessment. Many vendors span both, and the question to ask any of them is which entity is the merchant of record, which bank holds the funds, and who pays when a merchant disappears ([Becoming a Payment Provider](/books/payments/becoming-a-payment-provider#pick-a-model-pick-a-risk)).

## Networks

Visa and Mastercard are the two global **four-party** networks: they don't issue cards or sign merchants, and they set the rules both sides follow ([The Payments Rulebook](/books/payments/payments-rulebook)). American Express and Discover grew up as **three-party** networks that issue and acquire largely themselves.

Discover changed hands. Capital One completed its acquisition of Discover Financial Services on May 18, 2025, and its announcement said the Discover, PULSE and Diners Club International networks would join it. The point of the deal for Capital One is the network: as of July 2026 it had moved about 25 million of its debit cards onto the Discover network and was testing credit cards there, with Discover's existing portfolio moving in waves, while some cards, Venture X among them, stay on Visa. For a platform, that means the Discover share of debit volume is no longer a rounding error, and Discover's acceptance, interchange and dispute rules deserve their own tests rather than "same as Visa" assumptions ([Interchange & Pricing](/books/payments/interchange-and-pricing)).

The US network rules themselves are in motion too. Visa and Mastercard signed an amended settlement of the long-running merchant class action (MDL 1720) dated November 10, 2025. Its headline terms: average effective credit interchange at least 10 basis points lower for five years, standard consumer credit posted rates capped at 125 basis points, posted rates frozen at March 31, 2025 levels, merchants allowed to accept or decline whole card categories (debit, commercial, standard consumer, premium consumer) and individual digital wallets rather than honoring all cards, and surcharges allowed at brand or product level up to the lesser of 3% or the merchant's cost of acceptance. The court granted preliminary approval on June 9, 2026; I found no final approval as of October 2026, so treat the terms as pending. [Surcharging & Fees](/books/payments/surcharging-and-fees) is where they would change what you build.

## Acquirers and Processors

The acquiring side of US card payments is concentrated in a handful of companies, most of them assembled from earlier mergers:

- **Chase** and **Elavon** (a wholly owned subsidiary of U.S. Bank) are bank-owned acquirers that process for their own merchants. J.P. Morgan, which runs Chase's merchant services, describes itself as "the acquirer as well as the card issuer".
- **FIS** went the other way from Global Payments: it sold a majority of Worldpay to GTCR (completed February 1, 2024, per the closing release), then bought Global Payments' Issuer Solutions, which it calls "formerly TSYS". TSYS, once the processor behind many US issuers and merchants, is now split by side.
- **Fiserv** runs merchant acquiring and processing alongside its bank technology, and its merchant page calls it the "#1" global merchant acquirer, with more than 6 million merchant locations.
- **Global Payments** completed its acquisition of Worldpay from FIS and GTCR on January 12, 2026, and in the same transaction sold its issuer processing business to FIS. The combined company reported about $3.7 trillion in volume and more than 6 million merchant locations at closing.

Two consequences for anyone building on them. First, the **processor behind your processor** matters: a payment facilitator or PSP is often a front end on one of these back ends, and an outage, a certification calendar or a settlement cutoff at the back end becomes yours ([Inside a Processor](/books/payments/inside-a-processor)). Second, mergers change integrations slowly and contracts quickly. When an acquirer changes owner, its pricing, risk appetite and product roadmap can change long before its APIs do, which is why [Switching Processors](/books/payments/switching-processors) starts with the contract.

## Gateways and Payment Service Providers

A **payment service provider** (PSP) puts one API in front of everything a merchant needs to take payments: a gateway, processing, usually acquiring or payment facilitation, a vault, fraud scoring and payouts. The large ones differ mostly in where they started:

- **Adyen** sells one platform to large merchants across channels and countries, providing "leading businesses around the world with end-to-end payment capabilities", and sells the same platform to software platforms and marketplaces as Adyen for Platforms.
- **Braintree**, owned by PayPal and branded PayPal Enterprise Payments as of October 2026, is a gateway and processor that also carries PayPal and, in the US, Venmo as payment methods.
- **Checkout.com** sells to enterprise merchants online, with local acquiring in more than 50 countries.
- **Square**, part of Block, sells point of sale and payments in person and online, to businesses it describes as ranging from "solo entrepreneurs" to "the largest international chains".
- **Stripe** started as a developer API for online businesses and grew outward into billing, platforms (Connect), in-person (Terminal) and, through acquisitions, stablecoin infrastructure: it completed its acquisition of Bridge on February 4, 2025.

From outside they look interchangeable; from inside, the differences that matter are the ones that are expensive to change later. Who is the acquirer in each country (the PSP itself, or a partner bank). Which network tokens it provisions and whether it will let you take them ([Processor Routing](/books/payments/processor-routing#tokens-decide-how-free-you-are)). What it exports when you leave: Adyen, Braintree, Checkout.com and Stripe all publish card import procedures, and their export terms differ ([Switching Processors](/books/payments/switching-processors)). And its pricing model: blended or interchange-plus ([Interchange & Pricing](/books/payments/interchange-and-pricing#pricing-models)).

## Embedded Payments: How the Platforms Do It

Software platforms (a gym system, a dental practice suite, a marketplace) want to offer payments to their own customers and earn on them. The ladder from referral to registered payment facilitator is in [Payments for Software Platforms](/books/payments/software-platforms#four-ways-in) and [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider#the-realistic-path). The vendors who sell the middle rungs, often called **payfac-as-a-service** or managed payfac, describe themselves in their own words, and each one's bank and network standing is in its own disclosures:

| Vendor | What its docs say it is | Payfac or sponsor model | What the platform still owns |
| --- | --- | --- | --- |
| **Adyen for Platforms** | "Onboard users of your platform, process payments for them, and pay out their funds" | Adyen acquires itself, and has held a US federal branch license since June 14, 2021 | The platform experience and the split of funds |
| **Finix** | A registered processor and payment facilitator, directly connected to Visa, Mastercard, Amex and Discover since May 2023 | Registered payfac since May 2022 (sponsor Fifth Third) and registered processor (sponsor Pathward) | Whatever the chosen model leaves it; Finix carries both the processor and the facilitator role |
| **Global Payments for Platforms** | Embedded payments for SaaS, in tiers from integrated payments to "PayFac-as-a-Service Pro" and a self-managed "PayFac Developer" tier; as of October 2026, payrix.com redirects here | The facilitator at the top of its entity tree bears "all risk and underwriting liability"; the tier decides whether that's Global Payments or the platform | The platform layer on a large acquirer, with a documented path to self-managed facilitation |
| **Moov** | Card and bank acceptance ("Accept card & bank payments online") with payouts over ACH, push to card, RTP and FedNow | Registered payfac and acquiring processor since July 2022; its platform agreement names SouthState Bank as the acquirer for Visa and Mastercard | The product and the merchant relationship; fee plans are configured by Moov and accepted by each account holder |
| **NMI** | "a leading global embedded payments enablement platform", with a partner and affiliate tree over its merchants | Sponsor bank not documented in the pages I read | Its affiliate tree, fee schedules and residuals; payouts over ACH, RTP and FedNow since acquiring Dwolla |
| **Payabli** | "the only platform that unifies payment acceptance, accounts payables, and payment operations in one place": Pay In, Pay Out and Pay Ops | Its footer: "a registered Payment Facilitator of PNC Bank" and of Huntington Bank, and "a registered ISO/MSP of Merrick Bank" | The vertical product, pricing down an organization tree of any depth, and the merchant relationship under its own brand |
| **Rainforest** | "Embedded payments purpose-built for vertical SaaS" | Payfac-as-a-service, acting "as an agent of a Sponsor Bank"; it names First Citizens and JPMorgan Chase | The vertical product and its merchants |
| **Stax Connect** | Embedded payments "without having to build your own payments organization"; Stax handles bank sponsorship, disputes and funds movement | A "PayFac-like experience" over its ISO/MSP relationships with Fifth Third and Synovus, and with Elavon | Distribution and merchant experience |
| **Stripe Connect** | "Embed payments and financial products in your SaaS platform, marketplace, or fintech" | "Stripe, LLC is a Payment Facilitator"; its acquirer disclosure lists Cross River, Deutsche Bank Trust Company Americas, Fifth Third, Pathward and PNC | Onboarding UX and pricing to the extent the account configuration allows; fraud and dispute liability depending on it ([Payments for Software Platforms](/books/payments/software-platforms#four-ways-in)) |
| **Tilled** | "PayFac-as-a-Service", combining "easy-to-integrate payment technology, full-service offerings, and transparent pricing" | ISO/MSP of Synovus and Citizens | Its merchants under a reseller and partner tree, priced from Tilled's pricing templates |

Read the table for what it implies. The managed providers compete on how much of the payments organization they take off the platform (underwriting, sponsorship, disputes, compliance), and the more they take, the less of the margin and the merchant relationship the platform keeps. The sponsor column matters as much as the product: a provider that's a registered payfac answers to its sponsor bank for every sub-merchant, an ISO/MSP sells the bank's merchant accounts, and Adyen is its own acquirer, so the same "embedded payments" can sit on three different contracts. Global Payments' tiers, from payfac-as-a-service to a self-managed facilitator tier on the same platform, describe the route some platforms want: start managed, then take on facilitation without changing processors. Infinicept sells that later step on its own, as payfac enablement rather than payfac-as-a-service: it describes itself as "a payments platform that helps software companies, payment facilitators, and financial institutions" run embedded payments, and its Launchpay program lets a platform start processing while "Launchpay holds PayFac registration". The questions to ask any of them are the same as for a PSP, plus three: who underwrites a new merchant and how fast, whose name the merchant agreement is in, and whether the platform can move its merchants, with their stored cards, if it outgrows the provider.

Payabli's own comparison page names one competitor, Stripe Connect, and argues the difference for vertical software: a white-labeled product, platform-set pricing, vendor payouts and check acceptance. Those are its claims, and the way to test them is the same questions.

Pay-out is where these providers differ most. Finix pays out by ACH and pushes to cards through Visa Direct and Mastercard Send. Moov pays out by ACH, push to card and instant bank credit over RTP and FedNow. NMI added ACH, RTP and FedNow payouts by acquiring Dwolla in May 2026. Payabli's Pay Out sends ACH, checks, single-use virtual cards, wires and RTP to vendors. Rainforest and Tilled fund their merchants and stop there. On the other side sit the payables-only companies: BILL pays vendors by ACH, virtual card, check and international wire, with a partner API for platforms, and AvidXchange, "a leading provider of accounts payable ("AP") automation software and payment solutions for middle market businesses", went private in October 2025. A platform that needs both directions either buys them from one provider or joins two vendors' records in its own ledger ([Vendor Payouts](/books/payments/vendor-payouts)).

## Bank Rails and Money Movement

A second infrastructure market sits on the bank rails rather than the card networks: APIs for ACH, wires, real-time payments and accounts, and the banks that hold the money behind them ([ACH & Bank Transfers](/books/payments/ach), [Treasury & Bank Operations](/books/payments/treasury)).

| Vendor | What it says it is | Shape |
| --- | --- | --- |
| **Column** | "The only nationally chartered bank designed to help you build and fund new financial products" | A bank that sells to developers |
| **Dwolla** | "The payments operations layer for bank transfers", over ACH and real-time payments | ACH and instant payments API, part of NMI since May 2026 |
| **Increase** | "Direct connections to the networks for money movement", with wire details "directly from Fedwire" | Direct rail access through a bank partner |
| **Modern Treasury** | A "Multi-Rail Payment Service Provider" with "one API to... move money across fiat and stablecoins" | Payment operations over your banks, or its own |
| **Moov** | "Orchestrates the entire money movement story" | Money movement API across rails |
| **Unit** | "Build financial products on real infrastructure"; "Unit is a financial technology company and not a bank" | Accounts, cards and payments through partner banks |

The structural question here is **who keeps the ledger of whose money is where**, and the industry learned it the hard way. Synapse, a middleware company that sat between fintech apps and partner banks, filed for bankruptcy on April 22, 2024; its partner banks found a shortfall the CFPB later put at $60 million to $90 million, and consumers lost access to their funds for weeks or months. Two months later, on June 14, 2024, the Federal Reserve and the Arkansas State Bank Department announced a cease-and-desist order against Evolve Bank & Trust, one of the banks in that arrangement, over anti-money-laundering, risk-management and consumer-compliance weaknesses in its fintech partnerships. The lesson for a buyer is to ask which bank holds the funds, in what kind of account, and whether the bank's own records can identify each end customer's balance without the middleware ([FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)).

## Orchestration, Vaults and Fraud

Three layers exist because no single processor is the best at everything, and each sells independence from the processor.

**Orchestration** puts one integration in front of several processors and routes between them. Gr4vy calls itself "the world's first cloud-based payment orchestration platform"; Primer frames itself as unified intelligence for routing, fallbacks and reconciliation; Spreedly's homepage calls it "Payment Orchestration for the Agentic Era". Spreedly closed its acquisition of Dodgeball, a fraud orchestration company, in September 2025, which shows the direction: orchestrators are adding the decisions around the route, not only the route. What routing involves, and when a second processor pays for itself, is in [Processor Routing](/books/payments/processor-routing).

**Vaults** hold card and bank numbers outside any processor and give your systems tokens that any route can use. Basis Theory says it "routes, tokenizes, and optimizes your payments"; Skyflow sells a data privacy vault for sensitive data beyond cards; VGS describes an "independent vault to reduce your PCI compliance". IXOPAY and TokenEx announced their merger on April 17, 2024, combining a vault with orchestration. A third-party vault is the buy side of the decision in [Running a Card Vault](/books/payments/card-vault): it moves PCI scope off your systems and keeps the card numbers portable, at the price of a per-token or per-call fee and one more vendor in the authorization path.

**Fraud** is sold at three levels. Networks score every authorization for the issuer (Visa completed its acquisition of Featurespace, a fraud-detection company, on December 19, 2024). PSPs score for their merchants with models trained across their whole network. Independent vendors sell to merchants and platforms: Forter sells identity-based fraud decisions; Riskified says it "guarantees ecommerce revenues and safeguards merchants against financial loss"; Sardine calls itself an "agentic risk platform for fighting financial crime" covering fraud, AML and transaction monitoring; Sift describes a "fraud prevention platform that uses machine learning"; and Signifyd offers a "100% financial guarantee" on orders it approves. A guarantee changes who carries the loss, which is a contract question as much as a model question. What the scores feed is in [Fraud & Risk](/books/payments/fraud-and-risk) and [AI in Payments](/books/payments/ai-in-payments).

## Wallets and Buy Now, Pay Later

Wallets come in two kinds ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods)). Apple Pay and Google Pay are cards in disguise: a device token on the card rails, with the PSP doing the integration. Apple sends the merchant a Device Account Number, never the card number; Google Pay returns a device token with a cryptogram for cards stored as Android device tokens, and the card number itself for cards stored on file in a Google account. PayPal and Venmo are rails of their own, with their own ledger, disputes and terms. Both matter to the landscape mostly through **who controls the checkout**: a wallet button moves the customer's credentials, and sometimes the customer relationship, to the wallet's owner.

BNPL providers (Affirm, Afterpay and Klarna; Block lists Afterpay among its brands) are lenders at checkout: they pay the merchant upfront and carry the customer's credit risk, for a merchant fee. "Affirm handles the credit risk and pays you upfront", in Adyen's description of it, and Klarna, in Stripe's, "covers any losses from fraud or unpaid credit". They reach merchants through PSPs as payment methods and directly through their own merchant agreements, and increasingly through software platforms in verticals where tickets are large.

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
| February 4, 2025 | Stripe completes its acquisition of Bridge | A PSP adds stablecoin infrastructure ([what providers ship with stablecoins](/books/payments/stablecoins#how-the-platforms-do-it)) |
| May 18, 2025 | Capital One completes its acquisition of Discover | An issuer owns a network, and moves its debit cards onto it |
| June 11, 2025 | Paynt acquires E-xact Transactions, a Canadian payment processor | A European payments company buys its way into North America |
| September 2025 | Spreedly closes its acquisition of Dodgeball | Orchestration adds fraud orchestration |
| October 15, 2025 | TPG and Corpay complete their acquisition of AvidXchange | A payables-only company leaves the public market |
| November 10, 2025 | Visa and Mastercard sign an amended merchant class settlement; preliminary approval June 9, 2026 | Interchange caps, category-level acceptance and surcharging rules, pending final approval |
| December 18, 2025 | Visa reports hundreds of live agent-initiated transactions on Intelligent Commerce | Agentic commerce moves from announcement to production pilots ([AI in Payments](/books/payments/ai-in-payments)) |
| January 12, 2026 | Global Payments completes its acquisition of Worldpay; FIS acquires Global Payments' Issuer Solutions | The largest acquirer consolidation in years, and TSYS splits by side |
| April 7, 2026 | Capital One completes its acquisition of Brex | An issuer-network buys a corporate card and spend platform ([What Gets Built on Issuing](/books/payments/card-issuing#what-gets-built-on-issuing)) |
| May 19, 2026 | NMI announces its acquisition of Dwolla | An embedded payments provider adds bank-rail payouts: ACH, RTP and FedNow |
| October 19, 2026 | Tilled announces more than $10 million in new funding | A payfac-as-a-service provider keeps raising as an independent |

Four patterns run through the list. **Consolidation by side:** acquiring and issuing processing separated (Worldpay with Global Payments, issuer processing with FIS) after a decade of being combined. **Networks moving up the stack:** Visa buys fraud models, Capital One buys a network to route its own cards, and the networks build agent-payment programs of their own. **Independence layers grow:** orchestration, vaults and fraud vendors sell freedom from any single processor, and buy each other to sell more of it. **Pay-in meets pay-out:** embedded payments providers add payouts over bank rails (NMI with Dwolla), while payables companies that only pay out go private (AvidXchange).

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
- [Global Payments for Platforms](https://platforms.globalpayments.com/), embedded payments tiers from integrated payments to payfac-as-a-service and self-managed payfac; payrix.com redirects here as of October 2026
- [Global Payments for Platforms: Overview of entities](https://resource.payrix.com/docs/overview-of-entities), the facilitator, partner and merchant levels, and the facilitator bearing "all risk and underwriting liability"
- [FIS: Completes sale of majority stake of Worldpay to GTCR](https://www.businesswire.com/news/home/20240201785803/en/FIS-Completes-Sale-of-Majority-Stake-of-Worldpay-to-GTCR), the closing release, February 1, 2024
- [J.P. Morgan: Getting the most value from a merchant services provider](https://jpmorgan.com/insights/payments/acquiring-and-e-commerce/most-value-from-merchant-services-provider), J.P. Morgan as "the acquirer as well as the card issuer"
- [Fiserv: Merchants](https://www.fiserv.com/en/who-we-serve/merchants.html), "#1" global merchant acquirer and more than 6 million merchant locations
- [Adyen: About](https://www.adyen.com/about), end-to-end payment capabilities for large businesses
- [PayPal: Braintree](https://www.paypal.com/us/braintree), Braintree branded PayPal Enterprise Payments, with PayPal and Venmo (US) as payment methods
- [Checkout.com](https://www.checkout.com/), enterprise e-commerce merchants and local acquiring in more than 50 countries
- [Square: About](https://squareup.com/us/en/about), sellers from solo entrepreneurs to international chains, and Square as part of Block
- [Adyen: Adyen granted US branch license](https://www.adyen.com/press-and-media/adyen-granted-us-branch-license), the federal branch license of June 14, 2021
- [Finix: Reintroducing Finix Payfac](https://finix.com/resources/blogs/reintroducing-finix-payfac-for-platform-payments), registered payment facilitator from May 2022
- [Finix: Payouts](https://finix.com/payouts), push to card through Visa Direct and Mastercard Send
- [Finix: Payouts guide](https://docs.finix.com/guides/after-the-payment/payouts), next-day and same-day ACH payouts
- [Moov: Card acceptance](https://moov.io/blog/product/card-acceptance/), registered payment facilitator and acquiring processor from July 2022
- [Moov: Financial institution card funding and disbursement terms](https://moov.io/legal/platform-agreement/financial-institution-card-funding-and-disbursement-terms/), SouthState Bank, N.A. as acquirer and Veridian Credit Union for the concentration account; last updated December 17, 2025
- [Moov: Payout fees](https://docs.moov.io/guides/money-movement/send-payments/payout-fees/index.md), standard and same-day ACH payouts
- [Moov: Push to card](https://docs.moov.io/guides/money-movement/send-payments/push-to-card/index.md), payouts to debit cards
- [Moov: Instant payments](https://docs.moov.io/guides/money-movement/send-payments/instant-payments/index.md), instant bank credit over RTP and FedNow
- [Moov: Fee plans](https://docs.moov.io/guides/fee-plans/plan-options/), fee plans configured by Moov and accepted by the account holder
- [NMI](https://www.nmi.com/), "a leading global embedded payments enablement platform"
- [NMI: Get sub-affiliate list](https://docs.nmi.com/reference/get-sub-affiliate-list), the partner, affiliate and sub-affiliate tree
- [NMI: NMI acquires Dwolla](https://www.nmi.com/about-us/news/nmi-acquires-dwolla/), May 19, 2026, adding account-to-account, real-time, FedNow and payout capabilities
- [Payabli](https://www.payabli.com/), the site footer naming PNC Bank and Huntington Bank as sponsors of its payment facilitator registration and Merrick Bank for its ISO/MSP registration
- [Payabli: Payabli vs Stripe Connect](https://get.payabli.com/), its comparison page, naming Stripe Connect, and its description of a platform that "unifies payment acceptance, accounts payables, and payment operations"
- [Payabli: Payables overview](https://docs.payabli.com/guides/pay-out-payables-overview), Pay Out by ACH, check, virtual card, wire and RTP
- [Rainforest: Processing terms](https://legal.rainforestpay.com/processingterms), payment facilitation "as an agent of a Sponsor Bank"
- [Rainforest: Sponsor banks](https://www.rainforestpay.com/sponsor-banks), First Citizens and JPMorgan Chase
- [Rainforest: Understanding deposits](https://docs.rainforestpay.com/docs/understanding-deposits), merchant funding and monthly residuals to the platform
- [Stax: Stax Connect overview](https://docs.staxpayments.com/docs/stax-connect-overview), a "PayFac-like experience" for partners
- [Stax: SaaS pricing](https://staxpayments.com/pricing/saas/), its ISO/MSP relationships with Fifth Third and Synovus, and with Elavon
- [Stripe: Acquirer disclosure](https://stripe.com/legal/acquirer-disclosure), "Stripe, LLC is a Payment Facilitator" and its sponsor banks
- [Tilled](https://www.tilled.com/), payfac-as-a-service
- [Tilled: Pricing](https://www.tilled.com/pricing), its ISO/MSP relationships with Synovus and Citizens
- [Tilled: Glossary](https://docs.tilled.com/docs/resources/glossary), reseller, partner and merchant as connected accounts
- [Tilled: Merchant pricing](https://docs.tilled.com/docs/merchants/merchant-pricing), pricing templates per payment method
- [Tilled: Portfolio Autopilot and funding](https://www.tilled.com/blog/portfolio-autopilot), more than $10 million in new funding announced October 19, 2026, and merchant payouts only
- [Infinicept](https://www.infinicept.com/), a payments platform for software companies, payment facilitators and financial institutions
- [Infinicept: Launchpay](https://www.infinicept.com/launchpay/), "Launchpay holds PayFac registration"
- [BILL: AP payment disbursement methods](https://developer.bill.com/docs/ap-payment-disbursement-methods.md), ACH, virtual card, check and international wire
- [BILL: Partner operations](https://developer.bill.com/docs/bill-partner-operations.md), the partner API over organizations
- [AvidXchange: TPG and Corpay complete acquisition](https://www.avidxchange.com/press-releases/tpg-corpay-complete-acquisition-of-avidxchange), completion on October 15, 2025, and AvidXchange's description of itself
- [PYMNTS: Paynt acquires E-xact Transactions](https://www.pymnts.com/partnerships/2025/paynt-acquires-e-xact-transactions-to-accelerate-expansion-across-north-america/), June 11, 2025
- [Merchant Risk Council: Riskified partners with commercetools](https://merchantriskcouncil.org/learning/resource-center/member-news/news/2023/riskified-partners-with-commercetools-to-deliver-chargeback-guarantee-at-scale), Riskified's chargeback guarantee and its description of itself
- [Apple: Apple Pay security and privacy overview](https://support.apple.com/en-us/101554), the Device Account Number sent in place of the card number
- [Google Pay API: Request objects](https://developers.google.com/pay/api/web/reference/request-objects), `CRYPTOGRAM_3DS` for Android device tokens and `PAN_ONLY` for cards on file
- [Adyen: Affirm](https://docs.adyen.com/payment-methods/affirm), Affirm handling the credit risk and paying the merchant upfront
- [Stripe: Klarna](https://stripe.com/payments/klarna), Klarna paying upfront and covering fraud and credit losses
- [Adyen: Issuing](https://docs.adyen.com/issuing), card issuing in the EEA, UK and US on Visa and Mastercard
- [Galileo: Setting up a card program](https://docs.tech.sofi.com/pro/docs/setting-up-a-card-program), Galileo's issuer processing, part of SoFi Technology Solutions
- [i2c: Platform](https://www.i2cinc.com/platform/), issuer processing for credit, debit and prepaid
- [Lithic: Why businesses choose Lithic](https://www.lithic.com/comparison/unit), issuer processing with sponsor bank integrations and program management
- [Marqeta: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1522540/000152254026000017/mq-20251231.htm), card issuing platform working through issuing banks as BIN sponsors
- [Stripe: Issuing](https://stripe.com/issuing), card issuing with program management or processing only
