+++
title = "How Card Payments Work"
description = "The parties behind a card payment, why authorization, capture, clearing, settlement and funding are separate events, and the ISO 8583 underneath it all."
category = "Payments Industry"
order = 1401
part = "How Money Moves"
tags = ["payments", "cards", "iso-8583", "authorization", "settlement"]
+++

A card payment looks like one event: the customer taps, the screen says approved, the merchant has been paid. None of that is true. Approval moves no money, the merchant isn't paid for a day or more, and at least five companies touched the transaction, each with its own system, its own clock and its own rules. Almost every hard problem in a payments platform (holds that expire, funding that doesn't match sales, reversals after a timeout, disputes months later) is one of those companies doing exactly what it's supposed to. You can't build reliably on the system until you can draw it.

This chapter is the map the rest of the volume uses. The engineering of money itself (amounts, idempotency, state machines, ledgers) lives in [Payments](/docs/payments/money); this volume is about the industry those systems plug into. It's about accepting payments and moving money for merchants; issuing cards is its own subject and isn't covered. Stablecoins settle on blockchains under their own issuer rules rather than on the card and bank rails, so they get a chapter of their own, [Stablecoins & Crypto Rails](/books/payments/stablecoins). Terms are defined where they first appear, and all of them are collected in the [Glossary](/books/payments/glossary).

## How to Read This Volume

The chapters follow the money, in six parts:

- **How Money Moves.** This chapter, then [The Payments Landscape](/books/payments/payments-landscape) (who's who, and what to buy or build), [Card-Present Payments](/books/payments/card-present), [Interchange & Pricing](/books/payments/interchange-and-pricing) (what card acceptance costs), [ACH & Bank Transfers](/books/payments/ach), [Accepting Checks](/books/payments/checks), [Cash Payments](/books/payments/cash-payments), [Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods), [Stablecoins & Crypto Rails](/books/payments/stablecoins) (tokens on blockchains, and the law around them), [Cross-Border Payments & FX](/books/payments/cross-border-and-fx) (what changes between countries and currencies), and [Comparing the Rails](/books/payments/comparing-the-rails) to put them side by side.
- **The Rules.** [The Payments Rulebook](/books/payments/payments-rulebook) (who sets them), [Surcharging & Fees](/books/payments/surcharging-and-fees) (what you may pass on to the payer), and how they change across a border in [Payments in Canada](/books/payments/canada) and [Payments in the EU & UK](/books/payments/eu-and-uk).
- **Taking Payments.** [Merchant Onboarding](/books/payments/merchant-onboarding), [Designing the Payments API](/books/payments/payments-api), [Checkout, Invoices & Payment Links](/books/payments/checkout-and-invoicing) (the hosted pages, links, invoices and virtual terminals built on it), [SCA & 3-D Secure](/books/payments/strong-customer-authentication), [Stored Cards & Recurring Billing](/books/payments/stored-credentials), [Phone Payments](/books/payments/phone-payments), [Fraud & Risk](/books/payments/fraud-and-risk) and [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks).
- **Paying Out.** [Payouts & Settlement](/books/payments/payouts-and-settlement), [Treasury & Bank Operations](/books/payments/treasury), [Ledger & Reconciliation at Provider Scale](/books/payments/ledger-and-reconciliation) (proving every balance against the processors and the banks) and [Vendor Payouts](/books/payments/vendor-payouts).
- **Running a Provider.** [Payments for Software Platforms](/books/payments/software-platforms), [Partners, ISOs & Residuals](/books/payments/partners-and-residuals) (selling through others, and paying them), [Payments by Vertical](/books/payments/payments-by-vertical) (what changes from clinics to restaurants), [Processor Routing](/books/payments/processor-routing), [Switching Processors](/books/payments/switching-processors), [Running a Card Vault](/books/payments/card-vault), [HSMs & Key Management](/books/payments/key-management), [Inside a Processor](/books/payments/inside-a-processor), [Network Certification](/books/payments/network-certification), [Payments Architecture at Scale](/books/payments/architecture-at-scale) (how the pieces fit at millions of payments a day), [Operating the Platform](/books/payments/operating-the-platform), [AI in Payments](/books/payments/ai-in-payments), [Payments Metrics](/books/payments/payments-metrics) and [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider).
- **Reference.** The [Glossary](/books/payments/glossary).

## The System You're Building

Read end to end, the volume describes the components of a payment provider. Each has a chapter:

| Component | What it does | Where |
| --- | --- | --- |
| Merchant onboarding | Knows who each merchant is and what it may do | [Merchant Onboarding](/books/payments/merchant-onboarding) |
| Public API, SDKs, test mode | The surface merchants integrate with | [Designing the Payments API](/books/payments/payments-api) |
| Checkout and invoicing | Hosted pages, payment links, invoices and virtual terminals for merchants who don't write payment code | [Checkout, Invoices & Payment Links](/books/payments/checkout-and-invoicing) |
| Payment orchestration | One state machine per payment, per rail | [Payment States & Ledgers](/docs/payments/payment-states) |
| Card vault and keys | Holds card and bank numbers, hands out tokens | [Running a Card Vault](/books/payments/card-vault), [HSMs & Key Management](/books/payments/key-management) |
| Authentication | 3-D Secure, and when it's required | [SCA & 3-D Secure](/books/payments/strong-customer-authentication) |
| Risk engine | Decides which payments to allow | [Fraud & Risk](/books/payments/fraud-and-risk) |
| Processor adapters and router | Talk to acquirers and networks, choose between them, and move between them | [Processor Routing](/books/payments/processor-routing), [Inside a Processor](/books/payments/inside-a-processor), [Switching Processors](/books/payments/switching-processors) |
| Ledger and reconciliation | Every balance explainable, and matched daily to processor files and bank statements | [Payment States & Ledgers](/docs/payments/payment-states#double-entry-ledger), [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation) |
| Currencies and borders | Where each party is, what crossing costs, conversion and multi-currency payouts | [Cross-Border Payments & FX](/books/payments/cross-border-and-fx) |
| Pricing engine | What each payment costs and earns | [Interchange & Pricing](/books/payments/interchange-and-pricing) |
| Disputes | Chargebacks, evidence, prevention | [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks) |
| Payouts | Paying merchants and their vendors | [Payouts & Settlement](/books/payments/payouts-and-settlement), [Vendor Payouts](/books/payments/vendor-payouts) |
| Treasury and bank files | The bank accounts, files and calendar behind it | [Treasury & Bank Operations](/books/payments/treasury) |
| Events | Telling merchants what happened | [Webhooks](/docs/api-design/webhooks) |
| Platform features | Serving software companies and their merchants, and each industry's rules | [Payments for Software Platforms](/books/payments/software-platforms), [Payments by Vertical](/books/payments/payments-by-vertical) |
| Partner channels | Registering ISOs and agents, and paying their residuals | [Partners, ISOs & Residuals](/books/payments/partners-and-residuals) |
| Architecture | Service boundaries, idempotency end to end, and the ledger under load | [Payments Architecture at Scale](/books/payments/architecture-at-scale) |
| Operations | Support console, monitoring, statements, incidents | [Operating the Platform](/books/payments/operating-the-platform) |
| Metrics | One definition per number, and the network's where a threshold applies | [Payments Metrics](/books/payments/payments-metrics) |
| Models and agents | Scores, drafts and agent mandates, with code deciding | [AI in Payments](/books/payments/ai-in-payments) |
| Licenses, bank and compliance | What lets you do any of it | [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider), [The Payments Rulebook](/books/payments/payments-rulebook), [Payments in Canada](/books/payments/canada), [Payments in the EU & UK](/books/payments/eu-and-uk) |
| Vendors | Which layers to buy, extend or build | [The Payments Landscape](/books/payments/payments-landscape#build-buy-or-extend) |

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
| **ISO or payment facilitator (payfac)** | Sells acquiring on an acquirer's behalf. (ISO here is an independent sales organization, not the standards body behind ISO 8583.) An ISO signs merchants to the acquirer; a payfac signs them as its own sub-merchants under one master account ([Becoming a Payment Provider](/books/payments/becoming-a-payment-provider)) |
| **Payment provider** | What this volume calls any company that bundles gateway, processing and often acquiring or payfac services behind one API: Adyen, Checkout.com, Fiserv's Clover, Square, Stripe, Worldpay and many smaller ones |

[The Payments Landscape](/books/payments/payments-landscape) puts company names on each of these roles, and on the layers that have grown around them (embedded payments, bank-rail APIs, orchestration, vaults, fraud vendors).

Visa and Mastercard are **four-party** networks: the network sits between issuers and acquirers it doesn't own. American Express and Discover grew up as **three-party** networks that largely issue and acquire themselves, which is why their pricing and rules differ from Visa's and Mastercard's, as later chapters on pricing, surcharging and disputes show. Since May 18, 2025, Discover has belonged to Capital One, which completed its acquisition that day, so a large card issuer now also owns a network ([Interchange & Pricing](/books/payments/interchange-and-pricing#pricing-models) covers what that changes).

Where you sit among these parties is a choice with a price. A software company can refer merchants to a provider, resell one, embed one through a managed payfac program, become a registered payfac, or go further and become a processor or acquirer itself. Each step takes on more of the risk and more of the work; [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider#pick-a-model-pick-a-risk) lays out the whole ladder, and [Payments for Software Platforms](/books/payments/software-platforms#four-ways-in) what each rung means for a software company.

![The four parties and the network: cardholder, merchant, acquirer, network and issuer in a row. Authorization runs from the merchant to the issuer and back in seconds; capture and clearing run toward the issuer in batches; settlement and funding run back toward the merchant later, less interchange and fees.](/diagrams/card-flow.svg "Messages go first and money goes last. Authorization asks and answers in seconds without moving anything; clearing tells the network what really happened; only settlement moves money, the other way, net of fees.")

## Five Events, Not One Payment

What a checkout calls "a payment" is five separate events, each owned by a different party, each with its own timing and failure modes.

1. **Authorization.** The merchant asks the issuer, through the acquirer and the network, whether this card is good for this amount. The issuer checks the account, its fraud models and any authentication, then approves with an authorization code or declines with a reason. An approval is a **hold**: it reduces the cardholder's available credit and moves no money. Holds expire, on windows the networks set and processors may shorten (below).
2. **Capture.** The merchant confirms the final amount it will collect: the full amount, less (a partial capture, when an item is out of stock), or occasionally more (a tip, where the rules allow). An authorization that's never captured simply lapses.
3. **Clearing.** The acquirer sends captured transactions to the network in batches. The network matches each one to its authorization, works out which **interchange** category (the fee the acquirer pays the issuer on every transaction, the largest part of what acceptance costs) it qualifies for from the data it carries ([Interchange & Pricing](/books/payments/interchange-and-pricing)), and passes it to the issuer, which posts it to the cardholder's statement.
4. **Settlement.** The network nets every issuer's and acquirer's position for the day and moves money between them: issuers pay, acquirers receive, less interchange.
5. **Funding.** The acquirer pays the merchant, less its own fees and anything it's holding back (a **reserve**). This is the deposit the merchant actually sees, usually a day or more after the sale, and it's where [Payouts & Settlement](/books/payments/payouts-and-settlement) picks up.

Hold windows depend on the brand, the channel and who started the payment: a **customer-initiated** transaction (CIT) has the cardholder present, a **merchant-initiated** one (MIT) charges a saved card later ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)).

| Brand | Authorization | Must be captured within |
| --- | --- | --- |
| Mastercard | Final authorization | 7 days |
| Mastercard | Pre-authorization | 30 days |
| Visa | Card-not-present, customer-initiated | 10 days |
| Visa | Card-not-present, customer-initiated, flagged as an extended authorization | 30 days |
| Visa | Card-present, or merchant-initiated | 5 days |
| Visa | Estimated, at hotels, car rentals and cruise lines | 30 days |
| Visa | Automated fuel pump | 2 hours |

The table is the networks' limits, and Mastercard's are about fees rather than expiry: its Transaction Processing Excellence program charges an integrity fee on a final authorization not cleared or fully reversed within 7 calendar days, and on a pre-authorization not cleared or reversed within 30, with no separate card-present window. A processor can enforce shorter windows of its own. Stripe, as of October 2026, holds a standard Visa authorization for 7 days online when the customer initiated it, a shorter policy of its own than the 10 days Visa allows, and 5 days in person or merchant-initiated (exactly 4 days and 18 hours, to leave time for clearing), and a standard Mastercard authorization for 7 days online (customer- or merchant-initiated) and 2 days in person; only its extended authorization feature holds longer. Payabli voids any authorization not captured within 10 days and limits partial capture too: a capture can't be for less than 85% of the authorized amount, so a smaller final total means voiding and charging again. The window your system tracks is the shorter of the two: the network's rule, or your processor's.

Not every authorization is a purchase for a final amount. A **zero-amount verification** checks a card is valid without holding money, when a card is saved; a **partial approval** approves less than requested (common on prepaid cards) and leaves the merchant to collect the rest another way; **estimated** and **incremental** authorizations hold an amount that may change ([Payment States & Ledgers](/docs/payments/payment-states#holds-that-change-size); [tips and lodging holds](/books/payments/payments-by-vertical#restaurants-and-hospitality)); and a refund can itself be authorized before it's sent.

The engineering consequence is that each event is a state, not a log line. `authorized` and `captured` are different states with different rules ([Payment States & Ledgers](/docs/payments/payment-states)), "approved" never means "paid", and capture has a deadline the system must track rather than hope for. A platform that books revenue at authorization will one day explain to finance why a week of sales evaporated when the holds expired.

## ISO 8583: What's on the Wire

Between the acquirer's processor and the issuer, most card traffic still travels as **ISO 8583** messages. Modern APIs wrap it in JSON, but its vocabulary leaks through every one of them: decline codes, trace numbers, reversals. An engineer who can read it debugs in minutes what others escalate for days. [Inside a Processor](/books/payments/inside-a-processor) follows one authorization through every system end to end; this section is the vocabulary.

Every message starts with a four-digit **message type indicator** (MTI): the version of the standard, the message class, its function, and who sent it. The ones that matter most:

| MTI | Meaning |
| --- | ------- |
| `0100` / `0110` | Authorization request and response |
| `0200` / `0210` | Financial request and response: authorization and capture in one, typical of PIN debit and ATMs |
| `0400` / `0410` | Reversal request and response: undo an earlier authorization |
| `0420` | Reversal advice: a notice that a transaction was undone, which the receiver acknowledges rather than approves |
| `0800` / `0810` | Network management: sign-on, echo tests, key exchange |

After the MTI, a **bitmap** says which numbered **data elements** follow. A handful do most of the work: `2` the card number, `3` the processing code (purchase, refund, balance inquiry), `4` the amount, `11` the **STAN** (system trace audit number), `37` the **RRN** (retrieval reference number), `38` the authorization code, `39` the response code, `41` and `42` the terminal and merchant IDs.

Response codes are the part you'll live with. In the 1987 table that most networks still echo, `00` is approved, `05` is "do not honor", `51` insufficient funds, `54` expired card, and `91` means the issuer couldn't be reached. Networks extend these and the 1993 revision moved to three digits, so treat the processor's documented mapping as the truth and keep the raw code next to your own classification. The distinction your system needs is between a **soft decline** (try again later, or with authentication) and a **hard decline** (don't retry this card), because retrying a hard decline is how merchants end up flagged for excessive retries ([Stored Cards & Recurring Billing](/books/payments/stored-credentials) covers retries properly).

### Timeouts Are Unknowns, and Reversals Fix Them

The most important behavior in the protocol is what happens when a response doesn't arrive. The issuer may have approved and placed a hold; the acquirer can't know. So the acquirer sends a reversal for the original (matched by its STAN, RRN and amount), which tells the issuer to release any hold it placed. Without that, the customer sees a pending charge for a purchase that "failed", tries again, and is held twice.

Your system has the same problem one layer up. A timeout from your processor is an unknown outcome, not a failure. The safe responses are to query the processor for the result or void what you sent, using the processor idempotency key derived from yours ([Idempotency](/docs/payments/idempotency)) so a retry can never become a second authorization. Treating a timeout as a decline and charging again is the most common double-charge bug in payments.

## Card-Present and Card-Not-Present

The same card behaves differently depending on whether it was physically there.

- **Card-present** payments read the chip, which generates a one-time cryptogram the issuer verifies, so a copied card number alone is useless. Fraud and interchange are both lower.
- **Card-not-present** payments (online, in-app, by phone) carry only what the customer typed. The issuer leans on the card verification code (CVV2 on Visa, CVC2 on Mastercard, CID on Amex), address verification (AVS, a match result returned in the authorization) and [3-D Secure](/books/payments/strong-customer-authentication) instead. Fraud is higher, interchange is higher, and the merchant carries the fraud loss unless authentication shifted it. There are two **liability shifts**, and they're different: the chip shift moves counterfeit fraud in person onto whoever didn't support chip ([Card-Present Payments](/books/payments/card-present#the-liability-shift)), and the 3-D Secure shift moves fraud online onto the issuer when the cardholder was authenticated.
- **Key-entered** card-present payments, where the clerk types the number, get the worst of both: present in name, priced and risked like an online payment.

A platform has to record which one each payment was, because interchange, dispute rights and fraud screening all depend on it.

## Credit, Debit, Prepaid and Commercial

The card's type decides who funds the purchase and what it costs to accept.

- **Credit** draws on a line of credit. The issuer earns interchange and interest, and funds rewards from both.
- **Debit** draws on the cardholder's bank account. In the US, debit from large issuers is **regulated**: its interchange is capped by law, and every debit card must be routable over two unaffiliated networks, online included since July 1, 2023 ([Interchange & Pricing](/books/payments/interchange-and-pricing), [Processor Routing](/books/payments/processor-routing)).
- **Prepaid** is funded in advance, and the network rules mostly treat it like debit.
- **Commercial** cards (corporate, purchasing, fleet) carry the highest interchange, which detailed transaction data can bring down.

The type also decides what you may charge on top: in the US the networks allow a surcharge on credit, subject to state law, and never on debit or prepaid, so [Surcharging & Fees](/books/payments/surcharging-and-fees) starts with knowing which one you're holding.

## BINs

The first digits of the card number, the **BIN** (bank identification number, formally the IIN), identify the brand, the issuer, the product, the card type and the country. ISO/IEC 7812-1 moved issuer BINs from six digits to eight, and Visa required acquirers and processors to support eight-digit BINs from April 2022, after which it assigns only eight-digit ones. Existing six-digit BINs still circulate, so both lengths are live.

BIN data drives real decisions: debit or credit for surcharging, regulated or exempt for pricing, domestic or cross-border for fees and fraud, commercial or consumer for data requirements. So it belongs in versioned reference data from your processor or a BIN provider, refreshed on a schedule, with the version recorded on every decision it fed. Store eight digits where the masking rules of [PCI DSS](/docs/compliance/pci-dss) allow, and never assume six identify the issuer. [Running a Card Vault](/books/payments/card-vault#bin-data) covers keeping that table current.

## Merchant Identity

The network knows a merchant by a handful of identifiers the acquirer assigns, and every authorization carries them:

- **Merchant ID (MID)** and **terminal ID (TID):** which merchant account and which point of sale. One business can have many MIDs ([Payments for Software Platforms](/books/payments/software-platforms#one-merchant-several-merchant-accounts)).
- **Merchant category code (MCC):** four digits from the networks' list describing what the merchant sells (5411 grocery, 5812 restaurants, 8011 doctors). It decides the interchange category, eligibility for fee programs, and how risky the networks consider the merchant.
- **Statement descriptor:** the name, city or phone number the cardholder sees on their statement, and the most common reason a legitimate charge gets disputed when it's unrecognizable ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks#prevention-beats-winning)).

## Card Numbers and Tokens

The card number is the **PAN**, the primary account number, and almost everything in payments security is about keeping it out of places it doesn't need to be. Two very different things are both called tokens:

- **A vault token** stands in for a PAN inside one provider's or platform's systems. It's random, means nothing outside that vault, and is what keeps everything else out of [PCI scope](/docs/compliance/pci-dss) ([Running a Card Vault](/books/payments/card-vault)).
- **A network token** is issued by the card network's token service for a specific card and merchant or device, and travels in the authorization in place of the PAN, with a one-time cryptogram. It works at the issuer and survives a card being reissued ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#keeping-the-card-alive)). A **DPAN** is a network token bound to one phone, which is what Apple Pay and Google Pay send ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods)).

## The Core Data Model

Every provider converges on the same handful of objects under different names. Stripe keeps a PaymentIntent for the whole attempt to collect and creates a charge each time it actually tries the card; Adyen gives the payment one reference and every capture, refund or cancel its own, with the outcome arriving later by webhook. This volume uses one set, and every later chapter's "How to Build It" adds tables and columns to it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **merchant** | `merchants` | A business that accepts payments; on a platform, a sub-merchant whose parent is the platform ([Merchant Onboarding](/books/payments/merchant-onboarding), [Payments for Software Platforms](/books/payments/software-platforms#the-hierarchy)) |
| **customer** | `customers` | The payer, when the merchant knows who they are |
| **payment method** | `payment_methods` | A tokenized card or bank account; never the number itself ([Running a Card Vault](/books/payments/card-vault)) |
| **payment** | `payments` | The merchant's intent to collect an amount, and its state machine ([Designing the Payments API](/books/payments/payments-api#the-objects)) |
| **attempt** | `payment_attempts` | One try at a processor: the authorization, its raw response, and what happened to it |
| **refund** | `refunds` | Money going back, its own object against a payment |
| **dispute** | `disputes` | A chargeback against a payment, with its deadlines ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)) |
| **payout** | `payouts` | Money leaving a merchant's balance for their bank ([Payouts & Settlement](/books/payments/payouts-and-settlement)) |
| **ledger** | `ledger_accounts`, `ledger_transactions`, `ledger_entries` | Every balance as the sum of balanced entries ([Payment States & Ledgers](/docs/payments/payment-states#double-entry-ledger), [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation)) |

The split that matters most is **payment versus attempt**. The payment is what the merchant asked for and what its customer sees; the attempt is one conversation with one processor. A payment declined on one card and approved on another, retried after a timeout, sent through 3-D Secure, or failed over to a second processor ([Processor Routing](/books/payments/processor-routing)) has several attempts, and each keeps its own raw response code, network transaction ID and BIN data version, because disputes, retries and pricing all look at the attempt that actually went through.

Two more rules recur in every chapter. **Refunds and disputes are their own records,** never a status on the payment ([Payment States & Ledgers](/docs/payments/payment-states#refunds-and-disputes-are-their-own-objects)), because each has its own lifecycle and can fail. **Amounts on the payment are a convenience; the ledger is the truth.** `amount_captured` and `amount_refunded` make queries cheap, but every movement of money posts a balanced ledger transaction keyed to the event that caused it, and balances are sums of entries.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with amounts in integer minor units ([Money & Amounts](/docs/payments/money)):

```sql
CREATE TABLE merchants (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  parent_id   UUID REFERENCES merchants (id),   -- the platform, for a sub-merchant
  legal_name  TEXT NOT NULL,
  country     CHAR(2) NOT NULL,
  mcc         CHAR(4),
  status      TEXT NOT NULL,                    -- Merchant Onboarding owns the states
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id UUID NOT NULL REFERENCES merchants (id),
  email       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_methods (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id UUID REFERENCES customers (id),
  type        TEXT NOT NULL,                    -- 'card', 'us_bank_account', ...
  vault_token TEXT NOT NULL,                    -- never the PAN or account number
  fingerprint TEXT,                             -- same card, same value, across customers
  brand       TEXT,
  last4       CHAR(4),
  exp_month   SMALLINT,
  exp_year    SMALLINT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id       UUID NOT NULL REFERENCES merchants (id),
  customer_id       UUID REFERENCES customers (id),
  payment_method_id UUID REFERENCES payment_methods (id),
  amount            BIGINT NOT NULL CHECK (amount > 0),
  currency          CHAR(3) NOT NULL,
  amount_captured   BIGINT NOT NULL DEFAULT 0,
  amount_refunded   BIGINT NOT NULL DEFAULT 0,
  status            TEXT NOT NULL CHECK (status IN ('requires_payment_method', 'requires_confirmation',
                      'requires_action', 'processing', 'requires_capture', 'succeeded', 'canceled')),
  channel           TEXT NOT NULL CHECK (channel IN ('ecommerce', 'card_present', 'moto')),
  initiator         TEXT NOT NULL CHECK (initiator IN ('customer', 'merchant')),
  idempotency_key   TEXT NOT NULL,
  capture_before    TIMESTAMPTZ,                -- the shorter of the network's and the processor's window
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payments_merchant_id_idempotency_key_key UNIQUE (merchant_id, idempotency_key)
);

CREATE TABLE payment_attempts (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  payment_id             UUID NOT NULL REFERENCES payments (id),
  payment_method_id      UUID REFERENCES payment_methods (id),  -- the card this try used
  processor              TEXT NOT NULL,
  processor_reference    TEXT,
  amount                 BIGINT NOT NULL,
  status                 TEXT NOT NULL CHECK (status IN ('pending', 'authorized', 'declined',
                           'unknown', 'reversed', 'captured')),    -- 'unknown' is a timeout
  response_code          TEXT,                  -- raw, as the processor sent it
  decline_class          TEXT,                  -- 'soft' or 'hard', the platform's classification
  authorization_code     TEXT,
  network_transaction_id TEXT,
  bin_data_version       TEXT,
  requested_at           TIMESTAMPTZ NOT NULL,
  responded_at           TIMESTAMPTZ
);

CREATE TABLE refunds (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  payment_id      UUID NOT NULL REFERENCES payments (id),
  amount          BIGINT NOT NULL CHECK (amount > 0),
  status          TEXT NOT NULL,                -- 'pending', 'succeeded', 'failed'
  reason          TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE disputes (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  payment_id      UUID NOT NULL REFERENCES payments (id),
  network         TEXT NOT NULL,
  reason_code     TEXT NOT NULL,                -- raw network code
  amount          BIGINT NOT NULL,
  currency        CHAR(3) NOT NULL,
  status          TEXT NOT NULL,
  evidence_due_by TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payouts (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id       UUID NOT NULL REFERENCES merchants (id),
  amount            BIGINT NOT NULL,
  currency          CHAR(3) NOT NULL,
  status            TEXT NOT NULL,
  destination_token TEXT NOT NULL,              -- the vaulted bank account or card
  arrival_date      DATE,
  idempotency_key   TEXT NOT NULL UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ledger_accounts (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id UUID REFERENCES merchants (id),   -- null for the platform's own accounts
  name        TEXT NOT NULL,                    -- from the chart of accounts
  currency    CHAR(3) NOT NULL,
  UNIQUE NULLS NOT DISTINCT (merchant_id, name, currency)
);

CREATE TABLE ledger_transactions (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  source_type  TEXT NOT NULL,                   -- 'capture', 'refund', 'dispute', 'payout', ...
  source_id    UUID NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('pending', 'posted', 'archived')),
  effective_at TIMESTAMPTZ NOT NULL,
  UNIQUE (source_type, source_id)               -- an event posts once
);

CREATE TABLE ledger_entries (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  ledger_transaction_id UUID NOT NULL REFERENCES ledger_transactions (id),
  ledger_account_id     UUID NOT NULL REFERENCES ledger_accounts (id),
  amount                BIGINT NOT NULL,        -- signed; entries per transaction and currency sum to zero
  currency              CHAR(3) NOT NULL
);
```

The accounts are the [chart of accounts](/docs/payments/payment-states#a-chart-of-accounts) the playbook names, and the sum-to-zero rule is enforced by a deferred constraint trigger, not trusted to application code. What's deliberately missing is anything a chapter owns: onboarding requirements, stored-credential agreements, risk decisions, settlement files, bank accounts and routing rules all arrive as deltas in their chapters.

## What This Means for the System You Build

- **Keep payments and attempts apart,** with refunds, disputes and payouts as their own records and the ledger as the only source of balances.
- **Model the five events as states,** with timestamps and the party that reported each, and never treat authorization as revenue.
- **Track hold expiry per payment,** from the card brand and channel, and capture or release before it lapses.
- **Treat timeouts as unknowns:** query or reverse, with the processor key derived from yours, and never re-authorize blind.
- **Keep the raw response code** beside your soft or hard classification, so the mapping can be fixed later without losing history.
- **Record channel, card type and BIN data version** on every payment; pricing, disputes and fraud all depend on them.
- **Reconcile funding to captures,** since the deposit is captures minus refunds, disputes, fees and reserves, and only the ledger can explain the difference ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#three-sources-of-truth)).

## References

**Specifications**

- [ISO 8583 (Wikipedia)](https://en.wikipedia.org/wiki/ISO_8583), the message type indicator, bitmaps, data elements and the 1987 response code table
- [Visa: Numerics Initiative, Eight-Digit Issuing BIN Adoption (PDF)](https://usa.visa.com/content/dam/VCOM/global/support-legal/documents/numerics-initiative-simplified-requirements-for-eight-digit-issuing-bin-adoption.pdf), ISO/IEC 7812-1's move to eight-digit BINs and the April 2022 requirement for acquirers and processors

**Reference**

- [Cornell LII: 15 U.S.C. § 1693o-2](https://www.law.cornell.edu/uscode/text/15/1693o-2), the Durbin Amendment behind regulated debit
- [Federal Register: Debit Card Interchange Fees and Routing (2022)](https://www.federalregister.gov/documents/2022/10/11/2022-21838/debit-card-interchange-fees-and-routing), card-not-present debit routable over two unaffiliated networks from July 1, 2023
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), authorization types, approval validity windows (5.7.3.5, Table 5-12, 18 April 2026 edition) and the reversal requirement (5.7.3.6)
- [Visa: Merchant Data Standards Manual](https://usa.visa.com/dam/VCOM/download/merchants/visa-merchant-data-standards-manual.pdf), merchant category codes such as 5411, 5812 and 8011
- [Capital One: Capital One Completes Acquisition of Discover](https://capitalone.com/about/newsroom/capital-one-completes-acquisition-of-discover/), the acquisition completed May 18, 2025
- [Covington: The GENIUS Act Becomes Law](https://www.cov.com/en/news-and-insights/insights/2025/07/the-genius-act-becomes-law-key-provisions-from-the-federal-stablecoin-regulatory-framework), the federal payment stablecoin framework signed July 18, 2025

**In practice**

- [Stripe: How Payment Intents and Setup Intents work](https://docs.stripe.com/payments/paymentintents/lifecycle), one PaymentIntent for the whole attempt to collect, creating charges as it tries, and its statuses
- [Adyen: Capture](https://docs.adyen.com/online-payments/capture), a capture with its own PSP reference distinct from the authorization's, its result delivered by webhook
- [Stripe: Place a hold on a payment method](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method), authorization validity windows by brand and channel (Visa 7 days card-not-present customer-initiated, 5 days merchant-initiated or card-present; Mastercard 7 days card-not-present, 2 days card-present), and capture rules
- [Payabli: Authorize and capture transactions](https://docs.payabli.com/guides/pay-in-developer-transactions-auth-capture), captures no lower than 85% of the authorized amount, and uncaptured authorizations voided after 10 days
- [Evolve: Mastercard Transaction Processing Excellence Program](https://developers.getevolved.com/enterprise/docs/mastercard-transaction-processing-excellence-program), Mastercard's integrity fee thresholds: 7 calendar days for final and undefined authorizations, 30 for pre-authorizations
- [PayPal: Navigating Mastercard's New Mandate](https://www.paypal.com/us/brc/article/navigating-mastercards-new-mandate), final authorization captured within 7 days and the July 2025 fee on undefined authorizations (March 27, 2025)
