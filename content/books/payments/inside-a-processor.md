+++
title = "Inside a Processor"
description = "What an acquiring processor runs: the authorization switch, network connections, stand-in, clearing files, settlement, exceptions, merchant setup and billing."
category = "Payments Industry"
order = 1431
part = "Running a Provider"
tags = ["payments", "processing", "iso-8583", "clearing", "settlement", "networks"]
+++

Most providers never connect to Visa or Mastercard themselves: an acquiring processor does it for them, and the provider's integration ends at the processor's API. This chapter is what's on the other side of that API, the machinery you'd run if you became the processor. Even if you never do, it explains every timeout, decline code, late file and surprise fee you'll meet. One caution: the networks' detailed specifications (message field layouts, clearing record formats, settlement report contents) are licensed to members and their processors, not published. What follows is drawn from the networks' public rules and from processors' published documentation, and it says where the detail stops being public.

## One Authorization, End to End

[How Card Payments Work](/books/payments/card-payments#iso-8583-what-s-on-the-wire) introduced ISO 8583's vocabulary. Here is one card-not-present authorization traveling through every system that touches it:

![An authorization's path: checkout calls the provider's API, which checks risk and swaps the token for the card number in the vault; the acquiring processor turns the request into an ISO 8583 0100 message and sends it over a dedicated connection to the network's switch, which routes it to the issuer's processor; the 0110 response returns the same way. If the issuer doesn't answer in time, the network's stand-in service answers for it.](/diagrams/auth-path.svg "Five systems in a few seconds. Each hop has its own timeout, and the network will answer for an issuer that doesn't.")

1. **Checkout to provider.** A JSON request with a token, an amount and an idempotency key. The provider checks risk, decides routing, and detokenizes through the vault's forwarder ([Running a Card Vault](/books/payments/card-vault#who-gets-the-number-back)).
2. **Provider to acquiring processor.** The processor's front end maps the request onto an ISO 8583 `0100` authorization request and holds a persistent connection to each network.
3. **Processor to network.** Over a dedicated circuit, framed with a length header, to Visa's VisaNet Integrated Payment (V.I.P.) system or Mastercard's switch.
4. **Network to issuer.** If the request carries a network token and cryptogram, the network's token service checks the cryptogram and swaps in the real card number first. The network routes by BIN to the issuer's processor, which checks the account, its fraud models and any authentication, and answers with a `0110`.
5. **Back the same way,** with an authorization code and a response code.

The clocks are set by the rules. Outside Europe, Visa gives an issuer 10 seconds to answer a point-of-sale authorization before Visa answers for it with stand-in (below), and in the US requires issuers to average no more than 5 seconds over each month. It also forbids an acquirer or merchant from timing out a point-of-sale transaction in less than 15 seconds, and an approval that arrives after a merchant timed out must be reversed. Your own timeouts sit inside those numbers, and every one of them produces the unknown outcome [Retries & Timeouts](/docs/architecture/retries-and-timeouts) warns about.

![A timeline of one US point-of-sale authorization: the issuer has 10 seconds to answer before Visa's stand-in answers for it, must average no more than 5 seconds over a month, and the merchant may not time out before 15 seconds, which leaves 5 seconds for stand-in and the trip back. An approval that lands after a timeout must be reversed.](/diagrams/pm-processor-auth-clocks.svg "Three clocks, nested. The issuer's limit ends 5 seconds before the earliest a merchant may give up, so stand-in can answer first; an approval that arrives after a timeout gets reversed, never ignored.")

**What the provider's request becomes.** Every field a merchant sends lands in a data element:

| From the API | ISO 8583 data element |
| --- | --- |
| Card number (after detokenizing) | 2 (PAN) |
| Purchase, refund, verification | 3 (processing code) |
| Amount, currency | 4, 49 |
| Card-present or online, chip or keyed | 22 (POS entry mode) |
| Terminal and merchant | 41 (terminal ID), 42 (merchant ID) |
| Statement descriptor and location | 43 (card acceptor name and location) |
| Chip data from the terminal | 55 (EMV data) |
| The processor's trace for this message | 11 (STAN), 37 (RRN) |
| The original, on a reversal | 90 (original data elements) |

Network-specific fields carry the rest: the authentication result from [3-D Secure](/books/payments/strong-customer-authentication), stored-credential flags and the network transaction ID ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)), and the identifiers that link every later message to this one (Mastercard has required a transaction link identifier in the messages that follow an authorization, such as increments, reversals and presentments, since October 2025). Their exact positions are in the networks' licensed specifications.

**What comes back,** and what the provider should pass through: the authorization code (38), the response code (39) in the network's raw form beside your own classification, address and security code match results, the approved amount when it's a partial approval, and the network transaction ID.

## Dual Message and Single Message

The networks run two kinds of system, and a processor speaks both:

- **Dual message:** authorization online (`0100`) now, clearing by file later. Credit cards and signature debit work this way, and it's what makes capture a separate step.
- **Single message:** one `0200` financial message that authorizes and clears together, typical of PIN debit and ATMs. Visa's Single Message System and Mastercard's equivalent settle these without a separate clearing record, so there's nothing to capture later, and a reversal undoes the money, not just a hold. A reversal advice (`0420`) that goes unanswered is resent until it's acknowledged; advices are acknowledged, never approved or declined.

The difference reaches all the way to reconciliation: dual-message transactions are matched by the clearing record's acquirer reference number (ARN, below), single-message ones by the authorization's retrieval reference number (RRN).

## Connecting to the Networks

A processor's connection to a network is infrastructure, not an API key:

- **Dedicated circuits, twice over.** Mastercard requires a circuit "equipped with back-up service" and testing and certification before any processing. Visa requires members that have Visa Extended Access, its on-premises access equipment, to send their traffic through it. Increase, an issuer processor, has described connecting each of its data centers to each of Visa's two active-active US data centers through at least two circuits each, leased from redundant telecom providers, over Visa's private network rather than the internet.
- **Network management messages.** `0800` messages sign a connection on and off and test it with echoes, and carry dynamic key exchange: new PIN-encryption working keys sent under a zone master key established in a [key ceremony](/books/payments/key-management#key-ceremonies-split-knowledge-and-dual-control).
- **Reference data with deadlines.** Routing tables and account-range files arrive from the networks and must be loaded on their schedule; Mastercard's rules give acquirers six calendar days to load each updated account-range file, confirmed by an acknowledgment file.
- **Change control with the network.** Visa expects 45 days' notice of changes to a member's access setup, and Mastercard 24 hours' notice of scheduled downtime. The certification calendar in [Network Certification](/books/payments/network-certification) sits on top.

## When the Issuer Doesn't Answer

**Stand-in processing** is the network answering on the issuer's behalf. Visa's Stand-In Processing (STIP) steps in when an issuer or its processor is unavailable, too slow, or has asked Visa to answer for it, using the issuer's own parameters; Mastercard's stand-in service is mandatory for every card program, with parameters at or above Mastercard's defaults. Either way the issuer is liable for what stand-in approves, and learns about it afterward. That's why you see response code `91` (issuer unavailable) less often than issuers actually go down: the network usually answers instead.

Acquirers have their own version. Mastercard recognizes approvals made at the acquirer's interface when the issuer path is down, up to limits it sets, with the issuer liable within those limits. Terminals that approve offline do something similar at the edge, and there the merchant usually carries the risk: Stripe's offline mode, for one, puts every later decline on the merchant ([Card-Present Payments](/books/payments/card-present#offline-approved-isn-t-paid)).

## Clearing

In the dual-message world, captured transactions travel to the network as **clearing records** in files:

- **Visa's BASE II** is the file-based service that collects, clears and settles between Visa and its members. Processors' documentation describes its transaction codes, such as `TC05` for a sales draft, `TC06` for a credit voucher (a refund) and `TC25` for a sale's reversal; the full record layouts are in Visa's licensed manuals.
- **Mastercard's Global Clearing Management System** exchanges IPM files, in which a first presentment is a `1240` message, a chargeback a `1442`, administrative messages `1644` and fee collections `1740`. Processors report six clearing cycles a day.

Clearing has deadlines measured from the authorization, set per brand, channel and authorization type; [Five Events, Not One Payment](/books/payments/card-payments#five-events-not-one-payment) has the table. For a processor they're batch deadlines: a capture that misses the clearing cycle its deadline falls in is a late presentment, which can be disputed, and it's one more reason capture deadlines are states, not hopes ([Payment States & Ledgers](/docs/payments/payment-states#authorizations-expire)).

**Interchange is decided at clearing.** The network prices each record from the data it carries, and a record missing what its category needs downgrades to a costlier one ([Downgrades](/books/payments/interchange-and-pricing#downgrades)). The exact data elements each category needs are in the networks' manuals; the processor's job is to send them every time.

**A refund is a clearing record too.** It flows from acquirer to issuer as a credit, the money moves the other way at settlement, and the merchant's funding is reduced by it. A refund can also be authorized first, so the issuer can reject a credit to a closed card before it's sent.

**The acquirer reference number** (ARN) identifies each clearing record, and it's the key for everything after: disputes cite it, and cardholders' banks use it to trace a refund.

## Settlement

Clearing says what happened; settlement moves the money. Visa's VisaNet Settlement Service computes each member's net position per settlement service and currency and delivers settlement reports (processors describe the daily summary as VSS-110, delivered in machine-readable and printable report records); Mastercard settles through its Settlement Account Management system, with clearing and settlement report files. Each member settles through a settlement bank in the settlement currency's country, and a member that submits clearing "must be ready to settle".

The network-level twist on reconciliation is the grouping: the clearing you sent, summed by cycle, matches the network's settlement report, and the money arrives as a separate bank transfer per settlement service and currency, so the matching keys are cycle, service and currency rather than individual payments. The matching discipline itself is the one in [Bank Reconciliation Is Its Own Discipline](/books/payments/treasury#bank-reconciliation-is-its-own-discipline). Only then does the acquirer fund merchants, which Visa's rules require "promptly", net of refunds, disputes, fees and reserves ([Payouts & Settlement](/books/payments/payouts-and-settlement)).

## Exceptions

Disputes have their own systems. Visa requires members to process disputes, responses, pre-arbitration and arbitration through Visa Resolve Online, and treats a missed response deadline as closing the case against the party that missed it. Mastercard runs its cycle (first chargeback, second presentment, pre-arbitration, arbitration) through Mastercom. Issuers report confirmed fraud through Visa's fraud reporting system on detection, no later than 60 days after the transaction (or 30 days after a late cardholder report), and to Mastercard's Fraud and Loss Database; those reports are what the networks' monitoring programs count ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks#monitoring-programs-the-threshold-that-ends-accounts)). A processor turns all of it into the dispute objects and events a provider exposes to merchants.

## Setting Up a Merchant

Before the first authorization, the processor and acquirer register the merchant with the networks' identifiers:

- **The acquirer's own identifiers:** a Visa acquiring identifier and a Mastercard ICA, each licensed to a network member; a sponsor that lets another member use one is liable for it.
- **The merchant's MCC and name.** The acquirer must assign the MCC that most accurately describes the business, and the name the merchant primarily uses with its customers, corrected if it confuses cardholders ([How Card Payments Work](/books/payments/card-payments#merchant-identity)).
- **Payment facilitators and agents.** A payment facilitator gets an identifier from the network through its acquirer and assigns sub-merchant identifiers of its own, and both travel in every transaction. Visa requires members to register third-party agents before they provide any services, and from October 24, 2026 to disclose those agents' identifiers in the US and Canada; Mastercard's payment facilitators are registered by their acquirers.
- **Terminated-merchant screening.** Mastercard's MATCH system is mandatory for acquirers: inquire before signing a merchant, and add one within 5 days of terminating it for cause; Visa's terminated merchant file must be updated by close of business on the day after the merchant is notified ([Merchant Onboarding](/books/payments/merchant-onboarding#underwriting-and-risk-tiers)).

## Billing Merchants

Merchants don't pay interchange; they pay their acquirer a merchant discount, and how that's built is the pricing model ([Interchange & Pricing](/books/payments/interchange-and-pricing#pricing-models)). Three operational facts shape the billing system:

- **Fees arrive late.** Networks can bill fees for a transaction up to two months after it was processed, as Stripe warns its interchange-plus users, so an interchange-plus statement is an estimate trued up later.
- **Fees are collected one of two ways.** Netted from each payout, so the deposit is already net of fees, which is how Square handles processing fees (it still issues a monthly fee invoice as the record); or totaled on a monthly invoice and settled afterward, which is how Adyen's monthly invoice works, with its fees and adjustments then flowing through settlement to the balance. The billing system supports whichever the merchant's contract says.
- **The statement is a different document from the payout report.** A payout report explains one deposit; the monthly statement or fee invoice summarizes the month's fees and adjustments, and Adyen calls its monthly invoice required for full reconciliation. Merchants need both, and both come from the same ledger ([Operating the Platform](/books/payments/operating-the-platform#statements-and-reports)).

The acquiring entity, or a payment facilitator in its place, also files each merchant's 1099-K, reporting gross amounts without deducting refunds or fees ([Payments for Software Platforms](/books/payments/software-platforms#1099-k-and-taxpayer-data)).

## Becoming the Processor

Visa calls a company directly connected to VisaNet that provides authorization, clearing or settlement services a VisaNet processor; a non-member signs an agreement with Visa to become one. The rules then ask for what this chapter describes: authorization service 24 hours a day, contingency plans for processor failure, certified connections with backup, a settlement bank, PCI DSS validation at the service provider's highest level, PIN security for any PIN traffic, and network certification of every message type you send ([Network Certification](/books/payments/network-certification)). Capital and membership requirements come through the sponsor or the network and aren't published; [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider) covers the path.

Instant payments have the same structure with different names: a FedNow participant can authorize a service provider to send and receive messages and operate its connection, under an agreement the Federal Reserve approves.

## What This Means for the System You Build

- **Timeouts inside the networks' clocks,** with every late approval reversed and every unknown outcome resolved by query.
- **A mapping from your API to ISO 8583,** versioned, with network-specific fields owned by someone who has the specifications.
- **Redundant, certified network connections,** network management traffic, and reference data loaded on the networks' deadlines.
- **Stand-in and offline approvals as distinct outcomes,** with the liability each carries recorded.
- **Clearing within the presentment deadlines,** with the data that qualifies each transaction for its interchange.
- **Three-way settlement reconciliation** by cycle, service and currency, before merchants are funded.
- **Merchant setup with the right MCC, name and identifiers,** MATCH checked, and agents registered before they work.
- **Billing that expects fees to arrive late,** and statements merchants can reconcile.

## References

**Specifications**

- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), V.I.P. and BASE II, response times and timeouts (7.3), stand-in, settlement (7.7), dispute processing in VROL (11.3), merchant MCC and name rules (1.5.1), third-party agent registration (1.9.8) and the terminated merchant file
- [Mastercard Transaction Processing Rules (copy hosted by Moneris)](https://www.moneris.com/-/media/files/terms-and-conditions/card-brands/mastercard/mastercard-transaction-processing-rules.pdf), the Interchange System, connectivity and certification, stand-in and lifecycle identifiers
- [Visa USA Interchange Reimbursement Fees](https://usa.visa.com/content/dam/VCOM/download/merchants/visa-usa-interchange-reimbursement-fees.pdf), the categories clearing qualifies for, and merchant discount versus interchange
- [Federal Reserve: Operating Circular 8](https://www.frbservices.org/wp-content/uploads/040126-operating-circular-8.pdf), FedNow participants and their service providers

**Reference**

- [Wikipedia: ISO 8583](https://en.wikipedia.org/wiki/ISO_8583), message type indicators, data elements and bitmaps
- [Mastercard Developers: MATCH](https://developer.mastercard.com/match/documentation/), mandatory inquiry and listing of terminated merchants
- [Mastercard Developers: Dispute resolution cycle](https://developer.mastercard.com/mastercom/documentation/dispute-resolution-cycle/), first chargeback through arbitration in Mastercom
- [IRS: Instructions for Form 1099-K](https://www.irs.gov/instructions/i1099k), the payment settlement entity and gross reporting

**In practice**

- [Increase: Visa redundancy](https://www.increase.com/articles/visa-redundancy), dedicated circuits to Visa's data centers and the connection protocol
- [Paymentology: Visa clearing and settlement samples](https://developer.paymentology.com/docs/data-clearing-settlement-samples-visa), BASE II transaction codes and VSS reports
- [Paymentology: Clearing, settlement and reconciliation](https://developer.paymentology.com/bankinglive/docs/txn-clearing-settlement-reconciliation), IPM message types and Mastercard clearing cycles
- [Silverflow: Network funds transfers report](https://docs.silverflow.com/guides/network-funds-transfers-report), one transfer per settlement service and currency
- [PayNet: MyDebit ISO 8583 specifications](https://docs.developer.paynet.my/mydebit/mydebit-cnp/mydebit-iso8583-specifications), sign-on, echo, key exchange and late-response reversals in a published network spec
- [Adyen: Raw acquirer responses](https://docs.adyen.com/development-resources/raw-acquirer-responses), network response codes as a provider maps them
- [Stripe: Interchange-plus fees and network costs](https://support.stripe.com/questions/reviewing-ic-fees-stripe-fees-and-network-costs?locale=en-GB), network fees billed up to two months later
- [Square: Fees and payments FAQs](https://squareup.com/help/gb/en/article/6109-fees-and-payments-faqs), processing fees deducted before each transfer, with monthly fee invoices as the record
- [Adyen: Reports and fees for platforms](https://docs.adyen.com/platforms/reports-and-fees), the monthly invoice of fees and adjustments, required for full reconciliation, and how its adjustments flow through settlement
