+++
title = "Cross-Border Payments & FX"
description = "Presentment, settlement and funding currencies, cross-border card fees, local acquiring, DCC rules, FX quotes, wires and correspondents, and FX on refunds."
category = "Payments Industry"
order = 1409
part = "How Money Moves"
tags = ["payments", "cross-border", "fx", "currency", "swift", "dcc"]
+++

A payment crosses a border whenever two of its parties sit in different countries, and the card networks, the banks and the regulators each charge for it in their own way. A US merchant's sale to a German cardholder costs more than the same sale to a Texan, declines more often, may convert currency twice, and refunds to a different number of dollars than it collected. A provider paying a French seller in euros from a dollar balance runs a currency trade and a bank transfer that may pass through two or three banks on the way. None of that is visible in a checkout that just shows a price. The mechanics of storing amounts in two currencies, locking a rate and booking the difference are in [Multi-Currency & FX](/docs/payments/multi-currency); this chapter is what the industry around those mechanics does, what it costs, and what a provider has to build. [Payments in Canada](/books/payments/canada) and [Payments in the EU & UK](/books/payments/eu-and-uk) cover the rules of specific destinations.

## How the Platforms Do It

The large providers sell the same three things, priced differently: acceptance of foreign cards, conversion between currencies, and settlement or payout in more than one currency.

**Stripe** prices foreign cards and conversion as add-ons to its domestic rate: as of October 2026 its US pricing adds 1.5% for international cards and 1% more if currency conversion is required. It charges in over 135 currencies, converts incoming funds to the account's default currency unless the account settles in additional currencies, and pays out a currency only to a bank account in that currency. Two products move the conversion risk around. **Adaptive Pricing** shows customers local prices in more than 150 countries with an exchange rate guaranteed for 24 hours, the customer paying a 2 to 4% conversion fee rather than the merchant. Its **FX Quotes API** (in preview) locks a rate for five minutes, an hour or a day, for a premium that rises with the lock's length and the currency's group (0.07% to 0.20% for its first group, 0.12% to 0.30% for its second), and attaches a rate threshold to each lock.

**Adyen** argues for **local acquiring**: using local entities or partners with domestic licenses in each market, which in its words "results in higher approval rates, fewer declines, and significantly lower interchange fees", where cross-border acquiring "frequently results in lower authorization rates". **Checkout.com** publishes plain explanations of the network fees cross-border transactions attract, Visa's ISA and IAF among them. **Airwallex** sells conversion as either the market rate at the moment of conversion or "a guaranteed rate with a validity period", and lets a booked conversion be cancelled before settlement.

| | Foreign card surcharge | Who pays conversion | Rate held for | Settlement currencies |
| --- | --- | --- | --- | --- |
| Adyen | Depends on acquiring entity | Merchant | Per contract | Multiple, via local entities |
| Airwallex | n/a | Account holder | A validity period per quote | Multi-currency wallets |
| Stripe Adaptive Pricing | Same card fees | Customer, 2 to 4% | 24 hours | As above |
| Stripe FX Quotes | n/a | Whoever the integrator chooses | 5 minutes, 1 hour or 1 day | As above |
| Stripe standard | 1.5% international, +1% conversion (US) | Merchant | Converted at processing | Default currency, more on request |

## Three Currencies, Not Two

[Two Currencies, Two Names](/docs/payments/multi-currency#two-currencies-two-names) separates **presentment** (what the customer sees and is charged) from **settlement** (what lands with the merchant's provider). A provider sees a third: the **funding currency**, the currency of the bank account the merchant's payout actually goes to. And the card adds a fourth outside your control: the cardholder's **billing currency**, which the issuer converts into if it differs from the presentment currency.

| Currency | Chosen by | Example | Where it lives in your system |
| --- | --- | --- | --- |
| Presentment | The merchant, at checkout | €49.00 | The payment's amount |
| Billing | The issuer | CHF on a Swiss card | Not yours to record, but it drives disputes |
| Settlement | The acquirer and the merchant's contract | USD from the processor | The settlement amount and rate on the payment |
| Funding | The merchant's payout account | EUR to a French IBAN | The payout's currency, and a conversion if it differs from the balance |

Each pair that differs is a conversion, and each conversion has a rate, a source, a time and someone who bears the difference. A US merchant charging a Swiss card in euros and settling in dollars has two conversions in one sale: the issuer's (euros to francs, the cardholder's problem) and the acquirer's or provider's (euros to dollars, yours or the merchant's). The ledger stores every amount in its own currency and every conversion as a linked pair of balanced legs ([Storing Both Amounts](/docs/payments/multi-currency#storing-both-amounts)).

## What Makes a Card Payment Cross-Border

To a card network, a transaction is cross-border when the merchant's country differs from the country that issued the card. The merchant's country isn't where its servers are or where its customers live; it's the **merchant outlet location** the acquirer assigns, and Visa's rules define it:

- **Card-present** at a fixed place: where the transaction happens.
- **Card-absent:** the country of the merchant's principal place of business, with narrow exceptions (an airline may use the country where the first leg of travel starts).
- **The acquirer must assign it correctly and must not misrepresent it,** must check before signing a merchant that it isn't misrepresenting its location, and Visa can decide the correct location itself if it disputes the acquirer's.

So routing a foreign customer's payment through a local merchant account in their country only makes it domestic if the merchant really has a business there. That's the rule the next sections turn on.

## What Cross-Border Costs

Cross-border card payments cost more at two of the three layers of [Interchange & Pricing](/books/payments/interchange-and-pricing#three-layers-of-cost).

**Interchange** runs on international and inter-regional tables, higher than domestic ones. Regulators cap some of it. Under commitments the European Commission accepted in 2019, Visa and Mastercard cap interchange on payments in the European Economic Area with cards issued outside it at 0.2% (debit) and 0.3% (credit) for card-present payments, and 1.15% and 1.50% for card-not-present ones. Brexit put UK cards on the wrong side of that line: Visa set its default fees for UK-EEA card-not-present payments at 1.15% and 1.5% in October 2021, Mastercard followed in April 2022, and the UK's regulator has spent the years since working on a cap ([Payments in the EU & UK](/books/payments/eu-and-uk) has where that stands).

**Network assessments** are the second layer, charged by the network to the acquirer on top of interchange and passed through to the merchant. A US acquirer's pass-through schedule (Fiserv's, from 2023, published as part of a state contract) shows their shape:

| Fee | Charged when | Rate |
| --- | --- | --- |
| Visa International Service Assessment (ISA), base | Merchant's country differs from the issuer's; settled in USD | 1.00% |
| Visa ISA, enhanced | Same, not settled in USD | 1.40% |
| Visa International Acquirer Fee (IAF) | Non-US card acquired by a US merchant | 0.45% (0.90% for MCCs 5962, 5966, 5967) |
| Mastercard US Cross Border | Merchant's country differs from the issuer's; settled in USD | 0.60% |
| Mastercard US Cross Border, non-USD | Same, not settled in USD | 1.00% |
| Mastercard Global Acquirer Support Fee | Card issued outside the US, acquired in the US | 0.85% |

These are one acquirer's pass-through rates at one point in time; networks revise them and each acquirer publishes its own schedule, so they belong in effective-dated reference data per acquirer, the same way interchange does ([A Pricing Engine](/books/payments/interchange-and-pricing#a-pricing-engine)). A provider on blended pricing collects them back with a flat surcharge for foreign cards and another for conversion, which is what Stripe's 1.5% and 1% are.

**Approval rates** are the hidden third cost. Issuers decline foreign card-not-present transactions more readily, because foreign merchants are where stolen cards get used. The lost sale doesn't appear on any fee schedule.

## Local Acquiring and Local Entities

**Local acquiring** means the merchant outlet, the acquirer and the issuer are in the same country, so the payment is domestic: domestic interchange, no cross-border assessments, no inter-regional table, and the issuer sees a merchant in its own country. Since the outlet location must be where the merchant really does business, getting there means having a business there.

That's why merchants selling seriously into a country open a local entity. The entity gets its own merchant account with an acquirer licensed in that country, its own settlement in local currency, and often the local payment methods that only a domestic merchant can accept ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods)). It also brings a local tax registration, local consumer law, local data and privacy rules, and books to reconcile in another currency. For a provider the model is one merchant (the business) with several merchant accounts (one per entity and country), the hierarchy [Payments for Software Platforms](/books/payments/software-platforms#one-merchant-several-merchant-accounts) describes, and routing that sends each payment to the account in the card's country when the merchant has one ([Processor Routing](/books/payments/processor-routing)).

The break-even is a calculation, not a principle: the fee and approval-rate difference on the volume in that country against the cost of the entity and its compliance. My default is to start cross-border, measure the foreign-card share, approval rate and fee drag per country, and open an entity where the numbers say so. [Payments in Canada](/books/payments/canada) works through the nearest case.

## Dynamic Currency Conversion

[Dynamic Currency Conversion](/docs/payments/multi-currency#dynamic-currency-conversion) offers a foreign cardholder the price in their own currency, converted at a rate the merchant's provider sets. The networks permit it under rules strict enough to read as warnings. Visa's require the merchant to:

- tell the cardholder DCC is optional, and not use language or procedures, such as pre-selecting the DCC option, that make it the default;
- get the cardholder's express agreement;
- offer it only in the cardholder's billing currency, and never on cards enabled for Visa's multi-currency solution or on travel prepaid cards;
- show on the receipt the amount in the merchant's local currency and in the transaction currency, the conversion rate, and the commission, fees or markup over a wholesale or government-mandated rate, and state that the merchant or acquirer is conducting the conversion.

An e-commerce merchant that uses the card number to decide whether to offer conversion is doing DCC and is held to the same rules. Acquirers register and certify DCC with Visa, Visa levies non-compliance assessments, and a cardholder who didn't expressly agree, or wasn't given the choice of the merchant's currency, has a dispute right. Mastercard's 2025 merchant guide says the same in its own words: DCC "is not a Mastercard product or service", the terminal "must not highlight or preselect" it, automatic DCC isn't permitted, an online checkout may preselect only if the cardholder can clearly opt out, and refunds go back in the currency of the original transaction. The EU adds its own disclosure of the markup over the ECB reference rate, covered in the doc.

For a provider, DCC is a product with its own certification, its own dispute exposure and a revenue line that depends on customers not reading carefully. If you offer it, build the disclosure into the payment record (both amounts, the rate, the markup, and the evidence of the cardholder's choice), because that record is your only defense to the dispute.

## Multi-Currency Pricing Versus Conversion at Checkout

**Multi-currency pricing** (MCP) is the alternative that regulators and networks are comfortable with. Visa defines it as the merchant displaying prices in a currency other than its local one and charging in that currency, with no DCC: the customer is charged in their currency and the conversion happens between the acquirer and the merchant, at settlement. Visa's rules still forbid steering by default (no pre-selected currency the cardholder didn't choose), but the price shown is the price charged.

The two differ in who sets the rate and when:

| | DCC | Multi-currency pricing | Provider-run local pricing |
| --- | --- | --- | --- |
| Price set in | Merchant's currency, converted at the terminal | Customer's currency, by the merchant | Customer's currency, converted by the provider |
| Conversion happens | At the point of sale, for the customer | At settlement, for the merchant | At checkout, rate guaranteed for a window |
| Who pays the spread | The customer, visibly | The merchant | Usually the customer, as a fee |
| Network rules | DCC rules, certification, disputes | MCP rules | MCP rules |

Stripe's Adaptive Pricing is the third column: a mid-market rate plus a fee the customer pays, guaranteed through settlement, with refunds at the original rate. My default for a provider is to support MCP well (any presentment currency the processor accepts, with settlement conversion at a recorded rate) before offering checkout conversion, and to offer DCC last, if at all.

## FX Rates, Providers and Quotes

A rate needs a source, and the sources differ in whether anyone will trade at them.

- **Reference rates aren't tradeable.** The ECB publishes euro reference rates around 16:00 CET "for information purposes only"; the Federal Reserve publishes daily bilateral rates in its H.10 release weekly. Both are good for reporting and disclosure, and neither is a price anyone will deal at.
- **Network rates are what card conversions use.** Visa's currency conversion rate is "a rate set by Visa from the range of rates available (not necessarily executed) in wholesale currency markets", or a government-mandated one. An issuer may add an optional issuer fee as a percentage on top, which is the cardholder's foreign transaction fee; when VisaNet converts into the acquirer's settlement currency, Visa's rate applies unadjusted.
- **Provider rates are what you'll actually get.** A payment provider or FX provider quotes a rate it will execute, usually a mid-market rate plus a spread, and the spread is its revenue.

A provider that converts for merchants is an FX intermediary: it gets rates from one or more liquidity providers or banks, adds a markup, quotes it with an expiry, and executes and settles the conversion later. [Locking a Quoted Rate](/docs/payments/multi-currency#locking-a-quoted-rate) covers the quote object. The provider-scale additions:

- **The quote's lifetime is a priced option.** Stripe charges more for a day's lock than for five minutes, and sets a rate threshold on extended locks (3.5% for payments, 1% for transfers, in its preview). Price each lock duration, cap exposure per merchant and currency pair, and expire quotes on time.
- **Quotes reference the upstream quote.** When your quote is backed by a liquidity provider's, store both, so the spread you earned on each conversion is a fact rather than an estimate.
- **Net before you trade.** Converting each payment individually pays the spread every time. Aggregate a day's flows by currency pair, offset opposite flows, and trade the net, while every merchant still gets the rate they were quoted. The difference between quoted and executed rates is your FX position, and it posts to its own account.
- **Mark the markup on every conversion.** Regulators increasingly require it to be disclosed, and a merchant disputing a payout amount will ask.

## Settling and Paying Out in Many Currencies

A merchant selling in euros, sterling and dollars can be paid three ways: converted into one home currency at settlement, held in balances per currency and paid out per currency, or a mix. Stripe converts to the default currency unless the account settles in additional ones, charges fees in the settlement currency, and pays a currency out only to a bank account in that currency.

- **A balance per currency,** each with its own pending and available amounts, reserves and payout schedule. Negative-balance recovery has to say whether a negative euro balance can be offset from a positive dollar one, and at what rate.
- **Payout rails are local where they can be.** A euro payout to an IBAN goes by SEPA Credit Transfer and a sterling one by Faster Payments ([Payments in the EU & UK](/books/payments/eu-and-uk)); both are cheap and reach the beneficiary the same or the next day. Only currencies without a local rail you can reach go by international wire, below.
- **Holding currencies is treasury work.** Paying local means holding local balances at banks in each currency's country, funding them ahead of payouts, and reconciling each separately ([Treasury & Bank Operations](/books/payments/treasury), [Multi-Currency Ledgers](/books/payments/ledger-and-reconciliation#multi-currency-ledgers)). A cross-border payout needs both countries' banking calendars open ([The Banking Calendar](/books/payments/treasury#the-banking-calendar)).
- **Conversion at payout is a quote too,** with the rate and markup shown on the payout, not discovered on the bank statement.

## Wires: Swift, Correspondents and ISO 20022

Where no local rail reaches, money moves by international wire, which is a chain of banks passing messages over Swift and settling between accounts they hold with each other.

**Correspondent banking.** A bank that doesn't hold an account in the destination currency's country sends through one that does: its **correspondent**, where it keeps a **nostro** account (ours, held with you), which the correspondent sees as a **vostro** (yours, held with us). A payment from a US provider to a supplier in Vietnam may pass from the provider's bank to a correspondent with a dong account, and then to the beneficiary's bank, with each hop taking a fee, a cutoff and a compliance check. Correspondent relationships have been shrinking as banks exit riskier corridors: the BIS counted a decline of about 25% between 2011 and 2020, which means fewer routes and longer chains in exactly the corridors that most need them.

**Who pays the fees** is part of the instruction: the sender pays all charges (`OUR`), each side pays its own bank's (`SHA`), or the beneficiary bears them all (`BEN`), and under the last two, intermediaries deduct their fees from the amount in flight, so the beneficiary receives less than was sent. Within the UK, and for euro payments under schemes spanning the UK and EEA, the payment services rules require shared charges: each side pays its own provider. For a payout, short arrival is a support ticket and a reconciliation break; send `OUR` when the recipient must receive an exact amount, and record each wire's expected deductions as a named tolerance ([A Matching Engine](/books/payments/ledger-and-reconciliation#a-matching-engine)).

**Tracking and data.** Swift's gpi service added end-to-end tracking of a payment across the chain and a commitment that the amount stays visible from start to end. Cross-border messaging is moving from Swift's legacy MT formats to ISO 20022, as domestic high-value systems like CHAPS already have (June 2023), and ISO 20022 carries structured names, addresses and remittance information that sanctions screening and reconciliation can use, and which is the same family as the `pain` and `camt` messages banks exchange with you ([Bank Files](/books/payments/treasury#bank-files)).

**Cost and time.** The G20's roadmap, run by the Financial Stability Board, set targets for end-2027: 75% of cross-border payments credited within an hour, the rest within a business day, and an average retail payment cost of no more than 1%. In October 2025 the FSB said satisfactory improvement at the global level was unlikely on that timetable. Treat wires as final, slow in some corridors, of unknown landed cost unless sent `OUR`, and the payout method of last resort.

## FX Risk on Refunds and Disputes

A refund weeks after the sale, or a dispute months after it, converts at a different rate than the sale did, and someone carries the difference. [Refunds and FX Gains and Losses](/docs/payments/multi-currency#refunds-and-fx-gains-and-losses) sets the rule (refund the customer exactly what they paid, in their currency, and book the difference explicitly). The industry's behavior is what makes it necessary:

- **Standard conversion uses the rate at refund time.** Stripe's documented example: a 60 USD payment converted at 0.88 settles 52.80 EUR to the merchant; refunded when the rate is 0.86, Stripe deducts 51.60 EUR. The customer gets 60 USD back either way. The merchant gained 1.20 EUR here, and loses when the rate moves the other way.
- **Some products hold the original rate.** Stripe's Adaptive Pricing refunds at the same exchange rate as the original transaction, because the customer paid for the guarantee.
- **Disputes put the gap on the loser.** Under Visa's rules, the party assigned or accepting final liability for a dispute "is responsible for the difference between the original Transaction amount and the final Dispute amount that may be caused by a change to the Currency Conversion Rate"; reversals of duplicate or erroneous transactions use the rate on the reversal's processing date.
- **DCC refunds stay in the DCC currency,** per Mastercard's guide, so a DCC sale refunded in the merchant's currency is a rules violation as well as a reconciliation break.

Decide who carries refund and dispute FX (provider or merchant), write it in the merchant agreement, and post it to `fx_gain_loss` or to the merchant's balance accordingly. Exposure scales with dispute windows: a [card dispute](/books/payments/disputes-and-chargebacks#disputes-in-the-ledger) up to 120 days out converts at a rate four months stale.

## Sanctions and Data on Cross-Border Flows

Cross-border payments are where sanctions screening does its real work, because both ends are rarely under the same regime. [The Financial Crime Layer](/books/payments/payments-rulebook#the-financial-crime-layer) covers the US obligations; the cross-border additions:

- **US sanctions follow US persons everywhere.** OFAC's rules bind US citizens and permanent residents wherever they are, everyone in the US, and US companies with their foreign branches, so a US provider screens a payout to Vietnam as carefully as one to Virginia. The EU and UK run their own lists and regimes, and a provider with entities there screens against each.
- **Screen both parties and the route.** The payer, the payee, the beneficiary bank and the destination country, at onboarding and on each payment or payout, against the lists as of that moment. A cross-border payout to a new account is the highest-risk thing most providers do.
- **The data has to travel.** US funds-transfer rules require nonbank financial institutions to keep records of transmittals of $3,000 or more and to pass the originator's and beneficiary's details to the next institution in the chain (the "travel rule"); Canada's version is in [Payments in Canada](/books/payments/canada#who-regulates-you). ISO 20022's structured fields are where it goes, and a payment with a truncated name or an unstructured address is one a correspondent may hold.
- **A hold is a state, not a failure.** A payment stopped for a possible match sits in review, with its own owner and deadline, and a true match is blocked or rejected as the regime requires, never quietly returned.

## How to Build It

The changes below extend the core `payments`, `refunds`, `payouts` and `merchants` tables from [the core data model](/books/payments/card-payments#the-core-data-model), the `merchant_accounts` of [Payments for Software Platforms](/books/payments/software-platforms#how-to-build-it) (one per MID, with its country and processor), the payout columns of [Payouts & Settlement](/books/payments/payouts-and-settlement#how-to-build-it), and the amount fields of [Multi-Currency & FX](/docs/payments/multi-currency#storing-both-amounts).

```sql
-- A merchant has one account per entity and country it acquires in;
-- the account's country is the merchant outlet location.
ALTER TABLE merchant_accounts
  ADD COLUMN legal_entity          TEXT NOT NULL,
  ADD COLUMN acquirer              TEXT NOT NULL,   -- the licensed acquirer behind the processor
  ADD COLUMN settlement_currencies TEXT[] NOT NULL;

CREATE TABLE fx_quotes (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  from_currency    CHAR(3) NOT NULL,
  to_currency      CHAR(3) NOT NULL,
  rate             NUMERIC(20, 10) NOT NULL,   -- what we quoted, markup included
  mid_rate         NUMERIC(20, 10) NOT NULL,   -- the reference we marked up
  markup_bps       INTEGER NOT NULL,
  rate_source      TEXT NOT NULL,              -- liquidity provider and its quote ID
  upstream_quote   TEXT,
  lock_duration    INTERVAL NOT NULL,
  rate_threshold_bps INTEGER,                  -- market move the lock tolerates
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL
);

-- Where each party is, decided once and kept with the payment.
ALTER TABLE payments
  ADD COLUMN issuer_country           TEXT,          -- from BIN data, with its version
  ADD COLUMN merchant_outlet_country  TEXT NOT NULL, -- merchant_accounts.country of the account used
  ADD COLUMN is_cross_border          BOOLEAN GENERATED ALWAYS AS
                                        (issuer_country IS DISTINCT FROM merchant_outlet_country) STORED,
  ADD COLUMN pricing_mode             TEXT NOT NULL DEFAULT 'domestic'
                                        CHECK (pricing_mode IN ('domestic', 'mcp', 'provider_fx', 'dcc')),
  ADD COLUMN fx_quote_id              UUID REFERENCES fx_quotes (id);

-- Each conversion actually executed, linked to the ledger's two legs.
CREATE TABLE fx_conversions (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  fx_quote_id      UUID REFERENCES fx_quotes (id),
  purpose          TEXT NOT NULL CHECK (purpose IN ('settlement', 'refund', 'dispute', 'payout', 'treasury')),
  sell_amount      BIGINT NOT NULL,
  sell_currency    CHAR(3) NOT NULL,
  buy_amount       BIGINT NOT NULL,
  buy_currency     CHAR(3) NOT NULL,
  executed_rate    NUMERIC(20, 10) NOT NULL,
  counterparty     TEXT NOT NULL,              -- processor, bank or FX provider
  counterparty_ref TEXT,
  ledger_transaction_id UUID NOT NULL REFERENCES ledger_transactions (id)
);

-- Network assessments as effective-dated reference data, per acquirer.
CREATE TABLE network_fee_rates (
  acquirer         TEXT NOT NULL,
  network          TEXT NOT NULL,
  fee_code         TEXT NOT NULL,              -- 'visa_isa_base', 'mc_cross_border_usd', ...
  applies_when     JSONB NOT NULL,             -- cross_border, settlement currency, MCC list
  rate_bps         INTEGER NOT NULL,
  valid_during     DATERANGE NOT NULL,
  PRIMARY KEY (acquirer, network, fee_code, valid_during)
);

-- Disclosure evidence for DCC, kept with the payment.
CREATE TABLE dcc_offers (
  payment_id       UUID PRIMARY KEY REFERENCES payments (id),
  local_amount     BIGINT NOT NULL,
  local_currency   CHAR(3) NOT NULL,
  offered_amount   BIGINT NOT NULL,
  offered_currency CHAR(3) NOT NULL,            -- must be the card's billing currency
  rate             NUMERIC(20, 10) NOT NULL,
  markup_bps       INTEGER NOT NULL,
  cardholder_choice TEXT NOT NULL CHECK (cardholder_choice IN ('accepted', 'declined')),
  shown_at         TIMESTAMPTZ NOT NULL
);

ALTER TABLE payouts
  ADD COLUMN funding_currency CHAR(3) NOT NULL,
  ADD COLUMN fx_conversion_id UUID REFERENCES fx_conversions (id),
  -- rail (from Payouts & Settlement) gains 'sepa_ct', 'faster_payments', 'swift'
  ADD COLUMN charge_bearer    TEXT CHECK (charge_bearer IN ('OUR', 'SHA', 'BEN')),
  ADD COLUMN screening_status TEXT NOT NULL DEFAULT 'pending'
                                CHECK (screening_status IN ('pending', 'clear', 'review', 'blocked'));
```

How it runs:

1. **Country first.** At authorization the router knows the card's country from BIN data and picks the merchant account in that country if the merchant has one; the payment records the outlet country of the account actually used.
2. **Quote before showing a converted price,** execute against the quote at capture or settlement, and expire it on time.
3. **Price cross-border fees from the rate table** at the payment's effective date, estimate at capture, true up from the processor's file.
4. **Refunds and disputes** record their own conversion and post the difference to `fx_gain_loss` or the merchant's balance, by the agreement.
5. **Payouts screen, then convert, then send,** in that order, and a payout in `review` holds without converting.

## Auditing

Cross-border payments are where examiners, network auditors and merchants with a currency complaint all look. The general design is in [Audit Trails](/docs/architecture/audit-trails); keep, for every cross-border payment and payout:

- **The country determination:** issuer country with the BIN table version, the merchant account and outlet country used, and why the router chose it.
- **Every conversion:** quoted rate, reference rate and source, markup, quote creation and expiry, executed rate and counterparty, so the spread on any conversion can be recomputed.
- **DCC evidence:** both amounts, rate, markup, and the cardholder's recorded choice, kept as long as a dispute can arrive.
- **Network fee rates applied,** by table version, and the true-up from the processor's file.
- **Sanctions screening:** the parties screened, the list versions, any potential match and who cleared or blocked it, kept for the retention your regulators require ([Operating the Platform](/books/payments/operating-the-platform#how-long-to-keep-what)).

## What This Means for the System You Build

- **Four currencies modeled,** presentment, settlement and funding in your records and billing as a dispute input, with every conversion a linked pair of ledger legs.
- **Country as data on every payment:** issuer country, outlet country, cross-border flag, and the merchant account per country that local acquiring needs.
- **Network assessments as effective-dated rates per acquirer,** estimated at capture and trued up from files.
- **MCP before DCC,** and if DCC, its disclosure and the cardholder's choice stored as evidence.
- **Quotes with expiry, lock pricing and upstream references,** netted flows, and the FX position in its own account.
- **Balances and payouts per currency** on local rails where they exist, wires as the last resort with the charge bearer chosen deliberately.
- **A written policy on refund and dispute FX,** posted explicitly, never absorbed into a merchant's balance by accident.
- **Sanctions screening on both ends of every cross-border movement,** and travel-rule data carried in structured fields.

## References

**Specifications**

- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), merchant outlet location (1.5.1.2), DCC requirements (5.8.9), multi-currency pricing (5.8.22.1), the currency conversion rate and optional issuer fee, and FX on reversals and disputes (18 April 2026 edition)
- [Mastercard: DCC Guide 2025, Merchant Version (PDF)](https://www.dm.mastercard.us/content/dam/public/mastercardcom/na/global-site/documents/DCC-Guide-2025-Merchant-Version.pdf), no preselection or automatic DCC, the online opt-out, and refunds in the original currency
- [Cornell LII: 31 CFR 1010.410](https://www.law.cornell.edu/cfr/text/31/1010.410), funds-transfer records and the travel rule at $3,000 for nonbank institutions
- [legislation.gov.uk: Payment Services Regulations 2017, regulation 66](https://www.legislation.gov.uk/uksi/2017/752/regulation/66), payer and payee each paying their own provider's charges

**Reference**

- [European Commission: Commitments by Visa and Mastercard on inter-regional interchange fees (IP/19/2311)](https://ec.europa.eu/commission/presscorner/api/documents?reference=IP/19/2311&language=en), the 0.2%, 0.3%, 1.15% and 1.50% caps on cards issued outside the EEA
- [High Court: Mastercard Europe SA v Payment Systems Regulator [2026] EWHC 64 (Admin)](https://www.judiciary.uk/wp-content/uploads/2026/01/Mastercard-Europe-SA-v-Payment-Systems-Regulator.pdf), Visa's October 2021 and Mastercard's April 2022 UK-EEA card-not-present fees
- [NC Office of the State Controller: Fiserv pass-through fee schedule, Appendix G (PDF)](https://www.ncosc.gov/sites/default/files/2025-04/Appendix%20G%20Pass%20Through%20Fee%20Schedule_0.pdf), Visa ISA and IAF, Mastercard cross-border and Global Acquirer Support Fee rates
- [ECB: Euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html), published around 16:00 CET for information purposes only
- [Federal Reserve: H.10 Foreign Exchange Rates](https://www.federalreserve.gov/releases/h10/), daily bilateral rates released weekly
- [OFAC: FAQ 11, who must comply](https://ofac.treasury.gov/faqs/topic/1501), US persons wherever located and US companies' foreign branches
- [BIS: Correspondent banking trends persisted in 2020](https://www.bis.org/media-releases/20211213-correspondent-banking-trends-persisted-2020-even-payment-landscape-changed-new-data-show), the contraction of about 25% between 2011 and 2020
- [FSB: Targets for the G20 cross-border payments roadmap (PDF)](https://www.fsb.org/uploads/P131021-1.pdf), the end-2027 speed and cost targets
- [FSB: Call for enhanced policy implementation (October 2025)](https://www.fsb.org/2025/10/fsb-calls-for-enhanced-policy-implementation-to-achieve-tangible-improvements-in-cross-border-payments/), improvement unlikely on the 2027 timetable
- [Wikipedia: SWIFT](https://en.wikipedia.org/wiki/SWIFT), the gpi service and its end-to-end tracking
- [Bank of England: ISO 20022](https://www.bankofengland.co.uk/payments/rtgs-renewal-programme/iso-20022), CHAPS and RTGS migrating to ISO 20022 on 19 June 2023

**In practice**

- [Stripe: Pricing](https://stripe.com/pricing), the 1.5% international card and 1% currency conversion add-ons
- [Stripe: Adaptive Pricing](https://docs.stripe.com/payments/currencies/localize-prices/adaptive-pricing.md?payment-ui=stripe-hosted), local prices in more than 150 countries, a 24-hour rate guarantee, the customer's 2 to 4% fee, and refunds at the original rate
- [Stripe: FX Quotes API](https://docs.stripe.com/payments/currencies/localize-prices/fx-quotes-api), lock durations, premiums by currency group and rate thresholds on extended locks
- [Stripe: Localize prices](https://docs.stripe.com/payments/currencies/localize-prices), mid-market rates and the worked refund conversion example
- [Stripe: Settle in additional currencies](https://docs.stripe.com/payments/currencies/settlement-payouts), conversion to the default currency, fees in the settlement currency, and payout accounts per currency
- [Stripe: Currency conversions](https://docs.stripe.com/currencies/conversions), charging in over 135 currencies
- [Adyen: Cross-border payments](https://www.adyen.com/knowledge-hub/cross-border-payments), local acquiring through local entities and its effect on approval rates and interchange
- [Checkout.com: What is the Visa ISA fee?](https://www.checkout.com/blog/isa-fee), the ISA range and the International Acquirer Fee
- [CardFellow: Mastercard cross-border fee](https://www.cardfellow.com/blog/mastercard-cross-border-fee), the 0.60% and 1.00% rates
- [Airwallex: Transactional FX](https://www.airwallex.com/docs/transactional-fx/overview), market or guaranteed rates with a validity period, and cancelling before settlement
