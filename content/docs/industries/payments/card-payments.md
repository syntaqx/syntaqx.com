+++
title = "How Card Payments Work"
description = "The parties behind a card payment, why authorization, capture, clearing, settlement and funding are separate events, and the ISO 8583 underneath it all."
category = "Payments Industry"
order = 1401
part = "How Money Moves"
tags = ["payments", "cards", "iso-8583", "authorization", "settlement"]
+++

A card payment looks like one event: the customer taps, the screen says approved, the merchant has been paid. None of that is true. Approval moves no money, the merchant isn't paid for a day or more, and at least five companies touched the transaction, each with its own system, its own clock and its own rules. Almost every hard problem in a payments platform (holds that expire, funding that doesn't match sales, reversals after a timeout, disputes months later) is one of those companies doing exactly what it's supposed to. You can't build reliably on the system until you can draw it.

This chapter is the map the rest of the volume uses. The engineering of money itself (amounts, idempotency, state machines, ledgers) lives in [Payments](/docs/payments/money); this volume is about the industry those systems plug into. It's about accepting payments and moving money for merchants; issuing cards and stablecoin payments are their own subjects and aren't covered. Terms are defined where they first appear, and all of them are collected in the [Glossary](/docs/industries/payments/glossary).

## How to Read This Volume

The chapters follow the money, in six parts:

- **How Money Moves.** This chapter, then [Card-Present Payments](/docs/industries/payments/card-present), [Interchange & Pricing](/docs/industries/payments/interchange-and-pricing) (what card acceptance costs), [ACH & Bank Transfers](/docs/industries/payments/ach), [Accepting Checks](/docs/industries/payments/checks), [Cash Payments](/docs/industries/payments/cash-payments), [Wallets & Local Payment Methods](/docs/industries/payments/wallets-and-local-methods), and [Comparing the Rails](/docs/industries/payments/comparing-the-rails) to put them side by side.
- **The Rules.** [The Payments Rulebook](/docs/industries/payments/payments-rulebook) (who sets them), [Surcharging & Fees](/docs/industries/payments/surcharging-and-fees) (what you may pass on to the payer) and [Payments in Canada](/docs/industries/payments/canada) (how they change across a border).
- **Taking Payments.** [Merchant Onboarding](/docs/industries/payments/merchant-onboarding), [Designing the Payments API](/docs/industries/payments/payments-api), [SCA & 3-D Secure](/docs/industries/payments/strong-customer-authentication), [Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials), [Phone Payments](/docs/industries/payments/phone-payments), [Fraud & Risk](/docs/industries/payments/fraud-and-risk) and [Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks).
- **Paying Out.** [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement), [Treasury & Bank Operations](/docs/industries/payments/treasury) and [Vendor Payouts](/docs/industries/payments/vendor-payouts).
- **Running a Provider.** [Payments for Software Platforms](/docs/industries/payments/software-platforms), [Processor Routing](/docs/industries/payments/processor-routing), [Running a Card Vault](/docs/industries/payments/card-vault), [HSMs & Key Management](/docs/industries/payments/key-management), [Inside a Processor](/docs/industries/payments/inside-a-processor), [Network Certification](/docs/industries/payments/network-certification), [Operating the Platform](/docs/industries/payments/operating-the-platform) and [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider).
- **Reference.** The [Glossary](/docs/industries/payments/glossary).

## The System You're Building

Read end to end, the volume describes the components of a payment provider. Each has a chapter:

| Component | What it does | Where |
| --- | --- | --- |
| Merchant onboarding | Knows who each merchant is and what it may do | [Merchant Onboarding](/docs/industries/payments/merchant-onboarding) |
| Public API, SDKs, test mode | The surface merchants integrate with | [Designing the Payments API](/docs/industries/payments/payments-api) |
| Payment orchestration | One state machine per payment, per rail | [Payment States & Ledgers](/docs/payments/payment-states) |
| Card vault and keys | Holds card and bank numbers, hands out tokens | [Running a Card Vault](/docs/industries/payments/card-vault), [HSMs & Key Management](/docs/industries/payments/key-management) |
| Authentication | 3-D Secure, and when it's required | [SCA & 3-D Secure](/docs/industries/payments/strong-customer-authentication) |
| Risk engine | Decides which payments to allow | [Fraud & Risk](/docs/industries/payments/fraud-and-risk) |
| Processor adapters and router | Talk to acquirers and networks, and choose between them | [Processor Routing](/docs/industries/payments/processor-routing), [Inside a Processor](/docs/industries/payments/inside-a-processor) |
| Ledger | Every balance, explainable | [Payment States & Ledgers](/docs/payments/payment-states#double-entry-ledger) |
| Pricing engine | What each payment costs and earns | [Interchange & Pricing](/docs/industries/payments/interchange-and-pricing) |
| Disputes | Chargebacks, evidence, prevention | [Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks) |
| Payouts | Paying merchants and their vendors | [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement), [Vendor Payouts](/docs/industries/payments/vendor-payouts) |
| Treasury and bank files | The bank accounts, files and calendar behind it | [Treasury & Bank Operations](/docs/industries/payments/treasury) |
| Events | Telling merchants what happened | [Webhooks](/docs/payments/webhooks) |
| Platform features | Serving software companies and their merchants | [Payments for Software Platforms](/docs/industries/payments/software-platforms) |
| Operations | Support console, monitoring, statements, incidents | [Operating the Platform](/docs/industries/payments/operating-the-platform) |
| Licenses, bank and compliance | What lets you do any of it | [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider), [The Payments Rulebook](/docs/industries/payments/payments-rulebook) |

## The Parties

| Party | What it does |
| ----- | ------------ |
| **Cardholder** | Holds the card and owes the issuer |
| **Issuer** | The cardholder's bank. Approves or declines, carries the credit or debits the account, and pays for purchases |
| **Merchant** | Sells the goods or services and starts the payment |
| **Acquirer** | The merchant's bank. Signs the merchant, takes the risk that the merchant can't cover refunds and disputes, and pays the merchant. Only network members can acquire, so a non-bank provider works under a **sponsor bank** that answers to the network for it |
| **Network** | Visa, Mastercard and others. Routes messages between acquirers and issuers, clears and settles between them, and writes the rules everyone signs |
| **Processor** | Runs the systems for an acquirer (front-end: authorizations; back-end: clearing, settlement, reporting) or for an issuer |
| **Gateway** | Takes the payment from a website or app and hands it to the processor; often the same company |
| **ISO or payfac** | Sells acquiring on an acquirer's behalf. (ISO here is an independent sales organization, not the standards body behind ISO 8583.) An ISO signs merchants to the acquirer; a payment facilitator signs them as its own sub-merchants under one master account ([Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider)) |
| **Payment provider** | What this volume calls a company like Stripe, Adyen or Payabli that bundles gateway, processing and often acquiring or payfac services behind one API |

Visa and Mastercard are **four-party** networks: the network sits between issuers and acquirers it doesn't own. American Express and Discover grew up as **three-party** networks that largely issue and acquire themselves, which is why their pricing and rules differ from Visa's and Mastercard's, as later chapters on pricing, surcharging and disputes show.

Where you sit among these parties is a choice with a price. A software company can refer merchants to a provider, resell one, embed one as a managed payment facilitator, become a registered payfac, or go further and become a processor or acquirer itself. Each step takes on more of the risk and more of the work; [Payments for Software Platforms](/docs/industries/payments/software-platforms#four-ways-in) covers the first rungs and [Becoming a Payment Provider](/docs/industries/payments/becoming-a-payment-provider) the rest.

![The four parties and the network: cardholder, merchant, acquirer, network and issuer in a row. Authorization runs from the merchant to the issuer and back in seconds; capture and clearing run toward the issuer in batches; settlement and funding run back toward the merchant later, less interchange and fees.](/diagrams/card-flow.svg "Messages go first and money goes last. Authorization asks and answers in seconds without moving anything; clearing tells the network what really happened; only settlement moves money, the other way, net of fees.")

## Five Events, Not One Payment

What a checkout calls "a payment" is five separate events, each owned by a different party, each with its own timing and failure modes.

1. **Authorization.** The merchant asks the issuer, through the acquirer and the network, whether this card is good for this amount. The issuer checks the account, its fraud models and any authentication, then approves with an authorization code or declines with a reason. An approval is a **hold**: it reduces the cardholder's available credit and moves no money. Holds expire, on windows the networks set (below).
2. **Capture.** The merchant confirms the final amount it will collect: the full amount, less (a partial capture, when an item is out of stock), or occasionally more (a tip, where the rules allow). An authorization that's never captured simply lapses.
3. **Clearing.** The acquirer sends captured transactions to the network in batches. The network matches each one to its authorization, works out which **interchange** category (the fee the acquirer pays the issuer on every transaction, the largest part of what acceptance costs) it qualifies for from the data it carries ([Interchange & Pricing](/docs/industries/payments/interchange-and-pricing)), and passes it to the issuer, which posts it to the cardholder's statement.
4. **Settlement.** The network nets every issuer's and acquirer's position for the day and moves money between them: issuers pay, acquirers receive, less interchange.
5. **Funding.** The acquirer pays the merchant, less its own fees and anything it's holding back (a **reserve**). This is the deposit the merchant actually sees, usually a day or more after the sale, and it's where [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement) picks up.

Hold windows depend on the brand, the channel and who started the payment: a **customer-initiated** transaction (CIT) has the cardholder present, a **merchant-initiated** one (MIT) charges a saved card later ([Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials)).

| Brand | Authorization | Must be captured within |
| --- | --- | --- |
| Visa | Card-absent, customer-initiated | 10 days |
| Visa | Card-absent, customer-initiated, flagged as an extended authorization | 30 days |
| Visa | Card-present, or merchant-initiated | 5 days |
| Visa | Estimated, at hotels, car rentals and cruise lines | 30 days |
| Mastercard | Final authorization | 7 days |
| Mastercard | Pre-authorization | 30 days |
| Visa | Automated fuel pump | 2 hours |

Not every authorization is a purchase for a final amount. A **zero-amount verification** checks a card is valid without holding money, when a card is saved; a **partial approval** approves less than requested (common on prepaid cards) and leaves the merchant to collect the rest another way; **estimated** and **incremental** authorizations hold an amount that may change ([Payment States & Ledgers](/docs/payments/payment-states#holds-that-change-size)); and a refund can itself be authorized before it's sent.

The engineering consequence is that each event is a state, not a log line. `authorized` and `captured` are different states with different rules ([Payment States & Ledgers](/docs/payments/payment-states)), "approved" never means "paid", and capture has a deadline the system must track rather than hope for. A platform that books revenue at authorization will one day explain to finance why a week of sales evaporated when the holds expired.

## ISO 8583: What's on the Wire

Between the acquirer's processor and the issuer, most card traffic still travels as **ISO 8583** messages. Modern APIs wrap it in JSON, but its vocabulary leaks through every one of them: decline codes, trace numbers, reversals. An engineer who can read it debugs in minutes what others escalate for days. [Inside a Processor](/docs/industries/payments/inside-a-processor) follows one authorization through every system end to end; this section is the vocabulary.

Every message starts with a four-digit **message type indicator** (MTI): the version of the standard, the message class, its function, and who sent it. The ones that matter most:

| MTI | Meaning |
| --- | ------- |
| `0100` / `0110` | Authorization request and response |
| `0200` / `0210` | Financial request and response: authorization and capture in one, typical of PIN debit and ATMs |
| `0400` / `0410` | Reversal request and response: undo an earlier authorization |
| `0420` | Reversal advice: a notice that a transaction was undone, which the receiver acknowledges rather than approves |
| `0800` / `0810` | Network management: sign-on, echo tests, key exchange |

After the MTI, a **bitmap** says which numbered **data elements** follow. A handful do most of the work: `2` the card number, `3` the processing code (purchase, refund, balance inquiry), `4` the amount, `11` the **STAN** (system trace audit number), `37` the **RRN** (retrieval reference number), `38` the authorization code, `39` the response code, `41` and `42` the terminal and merchant IDs.

Response codes are the part you'll live with. In the 1987 table that most networks still echo, `00` is approved, `05` is "do not honor", `51` insufficient funds, `54` expired card, and `91` means the issuer couldn't be reached. Networks extend these and the 1993 revision moved to three digits, so treat the processor's documented mapping as the truth and keep the raw code next to your own classification. The distinction your system needs is between a **soft decline** (try again later, or with authentication) and a **hard decline** (don't retry this card), because retrying a hard decline is how merchants end up flagged for excessive retries ([Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials) covers retries properly).

### Timeouts Are Unknowns, and Reversals Fix Them

The most important behavior in the protocol is what happens when a response doesn't arrive. The issuer may have approved and placed a hold; the acquirer can't know. So the acquirer sends a reversal for the original (matched by its STAN, RRN and amount), which tells the issuer to release any hold it placed. Without that, the customer sees a pending charge for a purchase that "failed", tries again, and is held twice.

Your system has the same problem one layer up. A timeout from your processor is an unknown outcome, not a failure. The safe responses are to query the processor for the result or void what you sent, using the processor idempotency key derived from yours ([Idempotency](/docs/payments/idempotency)) so a retry can never become a second authorization. Treating a timeout as a decline and charging again is the most common double-charge bug in payments.

## Card-Present and Card-Not-Present

The same card behaves differently depending on whether it was physically there.

- **Card-present** payments read the chip, which generates a one-time cryptogram the issuer verifies, so a copied card number alone is useless. Fraud is low and interchange is lower.
- **Card-not-present** payments (online, in-app, by phone) carry only what the customer typed. The issuer leans on the card verification code (CVV2 on Visa, CVC2 on Mastercard, CID on Amex), address verification (AVS, a match result returned in the authorization) and [3-D Secure](/docs/industries/payments/strong-customer-authentication) instead. Fraud is higher, interchange is higher, and the merchant carries the fraud loss unless authentication shifted it. There are two **liability shifts**, and they're different: the chip shift moves counterfeit fraud in person onto whoever didn't support chip ([Card-Present Payments](/docs/industries/payments/card-present#the-liability-shift)), and the 3-D Secure shift moves fraud online onto the issuer when the cardholder was authenticated.
- **Key-entered** card-present payments, where the clerk types the number, get the worst of both: present in name, priced and risked like an online payment.

A platform has to record which one each payment was, because interchange, dispute rights and fraud screening all depend on it.

## Credit, Debit, Prepaid and Commercial

The card's type decides who funds the purchase and what it costs to accept.

- **Credit** draws on a line of credit. The issuer earns interchange and interest, and funds rewards from both.
- **Debit** draws on the cardholder's bank account. In the US, debit from large issuers is **regulated**: its interchange is capped by law, and every debit card must be routable over two unaffiliated networks, online included since July 1, 2023 ([Interchange & Pricing](/docs/industries/payments/interchange-and-pricing), [Processor Routing](/docs/industries/payments/processor-routing)).
- **Prepaid** is funded in advance, and the network rules mostly treat it like debit.
- **Commercial** cards (corporate, purchasing, fleet) carry the highest interchange, which detailed transaction data can bring down.

The type also decides what you may charge on top: in the US a surcharge is allowed on credit and never on debit or prepaid, so [Surcharging & Fees](/docs/industries/payments/surcharging-and-fees) starts with knowing which one you're holding.

## BINs

The first digits of the card number, the **BIN** (bank identification number, formally the IIN), identify the brand, the issuer, the product, the card type and the country. ISO/IEC 7812-1 moved issuer BINs from six digits to eight, and Visa required acquirers and processors to support eight-digit BINs from April 2022, after which it assigns only eight-digit ones. Existing six-digit BINs still circulate, so both lengths are live.

BIN data drives real decisions: debit or credit for surcharging, regulated or exempt for pricing, domestic or cross-border for fees and fraud, commercial or consumer for data requirements. So it belongs in versioned reference data from your processor or a BIN provider, refreshed on a schedule, with the version recorded on every decision it fed. Store eight digits where the masking rules of [PCI DSS](/docs/compliance/pci-dss) allow, and never assume six identify the issuer. [Running a Card Vault](/docs/industries/payments/card-vault#bin-data) covers keeping that table current.

## Merchant Identity

The network knows a merchant by a handful of identifiers the acquirer assigns, and every authorization carries them:

- **Merchant ID (MID)** and **terminal ID (TID):** which merchant account and which point of sale. One business can have many MIDs ([Payments for Software Platforms](/docs/industries/payments/software-platforms#one-merchant-several-merchant-accounts)).
- **Merchant category code (MCC):** four digits from the networks' list describing what the merchant sells (5411 grocery, 6513 rent, 4900 utilities). It decides the interchange category, eligibility for fee programs, and how risky the networks consider the merchant.
- **Statement descriptor:** the name, city or phone number the cardholder sees on their statement, and the most common reason a legitimate charge gets disputed when it's unrecognizable ([Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks#prevention-beats-winning)).

## Card Numbers and Tokens

The card number is the **PAN**, the primary account number, and almost everything in payments security is about keeping it out of places it doesn't need to be. Two very different things are both called tokens:

- **A vault token** stands in for a PAN inside one provider's or platform's systems. It's random, means nothing outside that vault, and is what keeps everything else out of [PCI scope](/docs/compliance/pci-dss) ([Running a Card Vault](/docs/industries/payments/card-vault)).
- **A network token** is issued by the card network's token service for a specific card and merchant or device, and travels in the authorization in place of the PAN, with a one-time cryptogram. It works at the issuer and survives a card being reissued ([Stored Cards & Recurring Billing](/docs/industries/payments/stored-credentials#keeping-the-card-alive)). A **DPAN** is a network token bound to one phone, which is what Apple Pay and Google Pay send ([Wallets & Local Payment Methods](/docs/industries/payments/wallets-and-local-methods)).

## What This Means for the System You Build

- **Model the five events as states,** with timestamps and the party that reported each, and never treat authorization as revenue.
- **Track hold expiry per payment,** from the card brand and channel, and capture or release before it lapses.
- **Treat timeouts as unknowns:** query or reverse, with the processor key derived from yours, and never re-authorize blind.
- **Keep the raw response code** beside your soft or hard classification, so the mapping can be fixed later without losing history.
- **Record channel, card type and BIN data version** on every payment; pricing, disputes and fraud all depend on them.
- **Reconcile funding to captures,** since the deposit is captures minus refunds, disputes, fees and reserves, and only the ledger can explain the difference.

## References

**Specifications**

- [ISO 8583 (Wikipedia)](https://en.wikipedia.org/wiki/ISO_8583), the message type indicator, bitmaps, data elements and the 1987 response code table
- [Visa: Numerics Initiative, Eight-Digit Issuing BIN Adoption (PDF)](https://usa.visa.com/content/dam/VCOM/global/support-legal/documents/numerics-initiative-simplified-requirements-for-eight-digit-issuing-bin-adoption.pdf), ISO/IEC 7812-1's move to eight-digit BINs and the April 2022 requirement for acquirers and processors

**Reference**

- [Cornell LII: 15 U.S.C. § 1693o-2](https://www.law.cornell.edu/uscode/text/15/1693o-2), the Durbin Amendment behind regulated debit
- [Federal Register: Debit Card Interchange Fees and Routing (2022)](https://www.federalregister.gov/documents/2022/10/11/2022-21838/debit-card-interchange-fees-and-routing), card-not-present debit routable over two unaffiliated networks from July 1, 2023
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), authorization types, approval validity windows (5.7.3.5) and the reversal requirement (5.7.3.6)
- [Visa: Merchant Data Standards Manual](https://usa.visa.com/dam/VCOM/download/merchants/visa-merchant-data-standards-manual.pdf), merchant category codes such as 5411, 6513 and 4900

**In practice**

- [Stripe: Place a hold on a payment method](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method), authorization validity windows by brand and channel, and capture rules
