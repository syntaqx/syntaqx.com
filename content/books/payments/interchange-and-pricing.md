+++
title = "Interchange & Pricing"
description = "What a card payment costs and why: interchange, regulated debit, network fees, downgrades, Level 3 data, pricing models, and how platforms earn on payments."
category = "Payments Industry"
order = 1404
part = "How Money Moves"
tags = ["payments", "interchange", "pricing", "durbin", "level-3"]
+++

Accepting a card costs money, and how much is decided by rules most engineers never see: tables of interchange categories, a federal cap on debit, data requirements for business cards, and a markup set in a contract. For a merchant it's a cost on every sale. For a software platform that offers payments, the gap between what acceptance costs and what it charges is the business model. Either way, the cost of every transaction is computed somewhere, and a payments system that doesn't record it can't tell anyone whether a merchant is profitable, why last month's fees jumped, or what a pricing change will do.

[How Card Payments Work](/books/payments/card-payments) showed where in the flow the money moves, and [Card-Present Payments](/books/payments/card-present) why a chip read costs less than a typed number. This chapter is about how much of the money each party keeps.

## Three Layers of Cost

What the merchant pays, usually quoted as one **merchant discount rate**, is three different things stacked together:

| Layer | Paid to | Set by | Negotiable? |
| ----- | ------- | ------ | ----------- |
| **Interchange** | The issuer | The network's published tables, or law for regulated debit | No |
| **Network fees** | Visa, Mastercard and the others | Each network's fee schedule, billed to the acquirer | No |
| **Markup** | The acquirer, processor, and anyone reselling them | The merchant's contract | Yes |

Interchange is the largest layer on most consumer credit transactions, and it isn't the acquirer's to give away: the network deducts it at settlement. Network fees are smaller and arrive as a long list of line items on the acquirer's bill. Only the markup is a price anyone in the merchant's chain actually sets, which is why every pricing model below is really a statement about how the first two layers are passed through.

![A dimensioned drawing of one 100 dollar card-not-present payment on an exempt debit card under a 2.9% plus $0.30 blended rate: the merchant receives 96.80, and a detail view splits the 3.20 merchant discount into 1.80 of interchange, 0.14 of network fees (illustrative) and 1.26 of markup.](/diagrams/pm-interchange-fee-stack.svg "Where $100 goes: $1.80 to the issuer, $0.14 to the network, $1.26 of markup. On a blended rate the merchant pays the same $3.20 whatever the card, so the markup is whatever's left.")

Network fees deserve a closer look than they usually get, because they're where cross-border costs live. They include assessments charged as a percentage of volume, per-transaction access and processing fees, and extra fees when the card was issued in a different country from the merchant's acquirer, or when a currency conversion happens (who carries the conversion itself is in [Multi-Currency](/docs/payments/multi-currency#who-takes-the-exchange-risk)). A platform that adds international customers or merchants sees its effective rate rise even though interchange tables didn't change; [Payments in Canada](/books/payments/canada) shows the effect at the nearest border. Model each line from the acquirer's bill, not one blended number; the cross-border assessments themselves (Visa's ISA and IAF, Mastercard's cross-border fees) are in [What Cross-Border Costs](/books/payments/cross-border-and-fx#what-cross-border-costs).

## What Sets Interchange

Visa and Mastercard publish their US interchange tables, and Visa's latest schedule took effect on October 24, 2026. A transaction's rate depends on which category it qualifies for, and the category depends on:

- **Card type.** Regulated debit, exempt debit, prepaid, consumer credit (with higher rates for premium rewards products), and commercial cards each have their own tables.
- **Channel.** Card-present beats card-not-present, and a key-entered card-present payment is priced closer to online. Visa's exempt debit table charges 0.80% + $0.15 for card-present retail and 1.65% + $0.15 for basic e-commerce, both qualified categories; the downgrades below are what happens when a transaction misses them.
- **Merchant category.** Some industries get their own rates, often flat ([Payments by Vertical](/books/payments/payments-by-vertical)): Visa prices exempt debit for utility bill payment at $0.65, and for recurring utility payments at $0.45.
- **Data and timing.** Each category has qualification rules: authorization and settlement within time limits, matching amounts, address verification, and for business cards, line-item data. Miss one and the transaction falls to a costlier category.
- **Merchant size.** Visa's credit tables have performance tiers for the largest retail and supermarket merchants, with volume and dispute-ratio thresholds updated on their own schedule (the current ones took effect April 18, 2026).

The tables change. Visa publishes revisions with effective dates, so interchange belongs in effective-dated reference data, never in constants ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).

### Regulated Debit

In the US, debit interchange from large issuers is capped by law. The Durbin Amendment directed the Federal Reserve to set the cap, and Regulation II has held it at **21 cents plus 5 basis points (hundredths of a percent)** of the transaction, plus a **1-cent fraud-prevention adjustment** for issuers that meet the Fed's fraud standards. It applies to issuers that, with their affiliates, have **$10 billion or more** in assets; smaller issuers are exempt and earn the network's ordinary debit rates, which is why the same $100 online purchase can carry $0.27 or $1.80 of interchange depending on which bank issued the card.

The cap itself is unsettled. The Fed proposed lowering it in November 2023 to 14.4 cents, 4.0 basis points and a 1.3-cent fraud adjustment, recalculated every two years; no final rule had been adopted as of October 2026. Separately, on August 6, 2025, a federal court in North Dakota (*Corner Post v. Board of Governors*) held Regulation II contrary to the statute and vacated it, then stayed its own ruling pending appeal. The Fed appealed to the Eighth Circuit on October 6, 2025, the court heard argument in May 2026, and on October 26, 2026 it agreed: the Fed had counted costs the statute doesn't allow, and must rewrite the rule. The ruling doesn't change the cap yet. An appeals court's judgment takes effect when its mandate issues, which by default is 7 days after the time to seek rehearing expires, and that time is 45 days when a federal agency is a party (FRAP 40(d)(1) and 41(b)): mid-December 2026 at the earliest, later if the Fed seeks rehearing or a stay pending a Supreme Court petition. Until then the 2011 numbers are still the ones in the networks' tables, and what applies between the mandate and a rewritten rule wasn't settled as of October 2026. A pricing system that hard-codes them is now a rulemaking away from wrong.

Regulation II also governs **routing**: every debit card must be able to run over at least two unaffiliated networks (the card brand's own and a PIN debit network such as Accel, NYCE, Pulse or Star), and since July 1, 2023, that includes card-not-present payments. The merchant, not the issuer, chooses among them. That choice is money, and [Processor Routing](/books/payments/processor-routing) covers how to make it.

### Credit and the Merchant Settlement

Credit interchange has no federal cap, but the merchants' antitrust class action against Visa and Mastercard may produce something like one. On November 10, 2025, the networks announced a revised settlement, after the court rejected an earlier version in 2024. Its terms: the combined average effective credit interchange rate drops by 10 basis points for five years; posted rates on standard consumer credit cards are capped at 1.25% for eight years; merchants may choose whether to accept US credit cards in each of three categories (commercial, premium consumer and standard consumer), a break from "honor all cards"; and surcharging gets more room, at brand or product level, capped at the lower of 3% or the card's cost of acceptance. Judge Brian Cogan granted preliminary approval on June 9, 2026. As of October 2026 it isn't final: merchants get notice and another round of comment before final approval, and none of its rates are in effect.

If it's approved, two things change for a system: which card categories a merchant accepts becomes merchant configuration checked at authorization, and the rate changes arrive as ordinary table revisions with effective dates. The surcharging side is in [Surcharging & Fees](/books/payments/surcharging-and-fees).

### Downgrades

A transaction that misses its category's requirements doesn't fail; it **downgrades** to a costlier one, silently, and the merchant finds out on the statement. On Visa's exempt debit table, the same online purchase costs 1.60% + $0.15 if it qualifies for the preferred e-commerce rate, 1.75% + $0.20 at the electronic fallback (EIRF, the electronic interchange reimbursement fee), and 1.90% + $0.25 at the standard rate.

Most downgrades are engineering failures:

- **Late capture or settlement,** past the category's time limit, often from a batch job that runs late or a capture queue that backs up.
- **Amounts that don't match** between authorization and settlement, outside what the category allows.
- **Missing data:** address verification not requested, or business-card fields not sent.
- **Wrong indicators:** a recurring payment flagged as one-off, an online payment flagged as card-present.

The fix is to treat the qualification rate as a production metric: compute it from the processor's interchange detail, by merchant and by category, and alert when it moves.

## Level 2 and Level 3 Data

Commercial cards carry the highest interchange, and they're also where data earns the most back. **Level 2** data historically added the tax amount, a customer reference such as a purchase order number, and the merchant's tax ID. **Level 3** (no relation to the EMV Level 3 terminal certification in [Card-Present Payments](/books/payments/card-present#running-a-fleet)) adds line items: product codes, descriptions, quantities, unit prices, freight and duty. Business card issuers want it because their customers reconcile purchases against it, and the networks reward merchants who send it.

Visa reorganized this in 2025 as its **Commercial Enhanced Data Program**. Its current schedule prices the top commercial category, "Commercial Product 3", at 1.75% + $0.10, against 2.70% + $0.10 for an ordinary card-not-present commercial payment and 2.95% + $0.10 when a transaction doesn't qualify at all. Processors describe the program's terms: from October 17, 2025, the line items must add up exactly to the authorized amount (quantity times unit price, plus tax and shipping), Visa charges a 5-basis-point participation fee on enhanced-data volume, and Level 2 rates were retired in April 2026 except for fleet fuel. Mastercard runs its own enhanced-data programs with their own tables.

![A dimensioned drawing of interchange on a 100 dollar card-not-present payment by card type (Visa's schedule), bars drawn to scale: 0.27 dollars on regulated debit, 1.80 on exempt e-commerce debit, 1.85 on a commercial card with Level 3 data, 2.80 on a commercial card without it, and 3.05 on a non-qualified commercial transaction. The accented dimension between the two commercial card-not-present bars, 0.95 dollars, is what complete Level 3 data saves; a table gives each rate's formula.](/diagrams/interchange-ladder.svg "The same $100 can cost $0.27 or $3.05 to accept. Card type sets the range, and on business cards, complete Level 3 data is worth about a dollar per hundred.")

For a B2B platform this is real money, and almost all of it is engineering: [capturing line items at invoice time](/books/payments/checkout-and-invoicing#b2b-receivables), carrying them through to settlement, and validating the arithmetic before the processor does.

## Pricing Models

How the merchant is charged decides who carries the variability of interchange.

| Model | How it works | Who carries interchange risk | My view |
| ----- | ------------ | ---------------------------- | ------- |
| **Interchange-plus** | Interchange and network fees passed through at cost, plus a fixed markup | The merchant | The honest default for any merchant big enough to read a statement; the markup is visible and comparable |
| **Blended (flat)** | One rate for everything, like Stripe's published 2.9% + $0.30 for US domestic cards | The provider | Right for small merchants who value predictability; the provider earns more on cheap debit and less on premium credit |
| **Tiered** | Transactions sorted into "qualified", "mid-qualified" and "non-qualified" buckets by the provider's own rules | The merchant, opaquely | Avoid: the provider decides which bucket you're in, and the buckets aren't the networks' categories |
| **Subscription** | A monthly fee, with interchange and network fees at cost | The merchant | Good for high-volume merchants; the provider's revenue no longer scales with the merchant's |

Large providers usually offer more than one, and they start from different defaults. Adyen's published pricing is interchange-plus ("Interchange++", interchange and scheme fees passed through) for Visa and Mastercard, with a fixed processing fee per transaction and a percentage on top, while it prices American Express at a flat rate; Stripe publishes the flat rate and lists interchange-plus among its custom pricing options. A platform should be able to represent every model, because it will end up selling different ones to different merchants.

American Express and Discover price on their own terms, as three-party networks. Discover has belonged to a card issuer since Capital One completed its acquisition on May 18, 2025, bringing the Discover, Pulse and Diners Club networks with it. Capital One has since moved its own debit cards to the Discover network (about 25 million by July 2026) and begun testing credit cards on it, so a payment's network is no longer a stable fact about an issuer: read it from the BIN data at the time of the payment, not from a table of banks. Most small merchants now accept American Express and Discover through their ordinary acquirer, which contracts with each network (American Express's OptBlue program is the arrangement for smaller merchants), and see them on the same statement, priced by the acquirer rather than by an interchange table.

Passing some of this cost on to the payer is a separate question, with its own rules: [Surcharging & Fees](/books/payments/surcharging-and-fees).

## A Pricing Engine

Every model above is a rule over the same inputs, and a provider needs an engine that can express all of them, per merchant, with history:

- **Plans are rules, versioned with effective dates.** A rate is selected by card brand, card type (credit, regulated or exempt debit, prepaid, commercial), channel (card-present, online, keyed), region (domestic or cross-border), merchant category and currency, then applied as a percentage, a fixed amount, or both. A merchant's price on any date is whatever plan was in force that day, which is an as-of query over [effective-dated rows](/docs/database/temporal-data#effective-dated-rows), and each fee records which version priced it ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). A price increase is a new version dated no earlier than the notice period in the merchant agreement allows, and the engine enforces that.
- **Two passes for interchange-plus.** At capture the engine estimates the fee from the BIN and the expected category; when the processor's settlement and fee files arrive, the actual interchange and network fees replace the estimate, and the difference posts as an adjustment. Networks can bill fees up to two months after a transaction ([Inside a Processor](/books/payments/inside-a-processor#billing-merchants)), so the true-up isn't a one-day job.
- **Daily or monthly collection.** Fees are taken from each day's funding (net) or billed monthly and debited (gross); the engine computes the same numbers either way, and the payout instruction decides when they're collected ([Payouts & Settlement](/books/payments/payouts-and-settlement#collecting-your-own-fees)).
- **Payer fees are a separate calculation,** with their own legal limits by state and network ([Surcharging & Fees](/books/payments/surcharging-and-fees)), never mixed into what the merchant pays.
- **Every fee keeps its inputs:** plan version, category, rates and amounts, so a merchant can reproduce any line of their statement.

## How a Platform Earns

A software company that embeds payments earns on the spread. An ISO or referral partner usually receives [**residuals**](/books/payments/partners-and-residuals#the-economics): a share of the markup on its merchants' volume, paid monthly from the processor's reports. A [payment facilitator](/books/payments/becoming-a-payment-provider), which signs merchants as its own sub-merchants, sets their price itself and keeps the difference between that and its own cost. Either way, revenue is a function of interchange the platform doesn't control, so its margin per merchant swings with that merchant's card mix: a flat-rate merchant whose customers move from debit to rewards credit can go from profitable to loss-making without changing anything. [Payments for Software Platforms](/books/payments/software-platforms) covers the platform model; the point here is that the platform can't see its margin without the cost data below. How net revenue, take rate, effective rate and pass-through margin are computed from that data is in [Revenue and Cost](/books/payments/payments-metrics#revenue-and-cost).

## What This Means for the System You Build

- **Store the cost of every transaction, by layer.** From the processor's interchange and fee detail: the interchange category and amount, each network fee, and the markup, linked to the payment they belong to.
- **Money in minor units, rates as exact decimals.** Basis points or decimal strings, never floats, with the rounding rule written down ([Money & Amounts](/docs/payments/money)). A fraction of a cent per transaction is a reconciliation break at scale.
- **Rate tables as effective-dated data.** Interchange schedules, fee schedules and each merchant's contracted price all change on known dates, and a transaction is priced by the version in force when it happened.
- **Estimate at capture, true up at settlement.** Show the expected cost when the payment is captured, then replace the estimate with the actual from the processor's files, and report on the difference.
- **Tie the processor's statement to your recorded costs.** The pricing-specific break is a fee line you never modeled (a new network fee, a late-billed assessment); the monthly invoice check is in [Closing the Day and the Month](/books/payments/ledger-and-reconciliation#closing-the-day-and-the-month).
- **Watch qualification and margin.** Downgrade rate by merchant and category, and margin by merchant, as dashboards someone owns.

## References

**Specifications**

- [Visa: Visa USA Interchange Reimbursement Fees (PDF)](https://usa.visa.com/content/dam/VCOM/download/merchants/visa-usa-interchange-reimbursement-fees.pdf), the debit, prepaid and commercial rates and performance thresholds cited here, effective October 24, 2026
- [Cornell LII: 12 CFR § 235.3](https://www.law.cornell.edu/cfr/text/12/235.3), Regulation II's 21-cent and 5-basis-point standard
- [Cornell LII: 12 CFR § 235.4](https://www.law.cornell.edu/cfr/text/12/235.4), the 1-cent fraud-prevention adjustment
- [Cornell LII: Federal Rules of Appellate Procedure, Rule 40](https://www.law.cornell.edu/rules/frap/rule_40), 45 days to petition for rehearing when a United States agency is a party (40(d)(1))
- [Cornell LII: Federal Rules of Appellate Procedure, Rule 41](https://www.law.cornell.edu/rules/frap/rule_41), the mandate issuing 7 days after the rehearing period expires, effective when issued, and stays pending certiorari
- [Cornell LII: 12 CFR § 235.5](https://www.law.cornell.edu/cfr/text/12/235.5), the exemption for issuers under $10 billion in assets

**Reference**

- [Federal Reserve: Regulation II](https://www.federalreserve.gov/paymentsystems/regii-about.htm), the interchange standard and the two-network routing requirement
- [Federal Register: Debit Card Interchange Fees and Routing (2023 proposal)](https://www.federalregister.gov/documents/2023/11/14/2023-24034/debit-card-interchange-fees-and-routing), the proposed 14.4-cent, 4.0-basis-point and 1.3-cent components
- [Federal Register: Debit Card Interchange Fees and Routing (2022 rule)](https://www.federalregister.gov/documents/2022/10/11/2022-21838/debit-card-interchange-fees-and-routing), card-not-present routing over two unaffiliated networks from July 1, 2023
- [Cooley: District Court Vacates Regulation II's Debit Card Interchange Fee Standard](https://www.cooley.com/news/insight/2025/2025-08-15-district-court-vacates-regulation-iis-debit-card-interchange-fee-standard), the August 6, 2025 ruling and its stay pending appeal
- [ABA Banking Journal: Federal Reserve appeals Reg II interchange fee ruling](https://bankingjournal.aba.com/2025/10/federal-reserve-appeals-reg-ii-interchange-fee-court-ruling/), the appeal to the Eighth Circuit, filed October 6, 2025
- [America's Credit Unions: Fed interchange rule challenge heard by appeals court](https://www.americascreditunions.org/news-media/news/fed-interchange-rule-challenge-heard-appeals-court), oral argument in May 2026
- [ABA Banking Journal: Federal appeals court strikes down the Fed's debit card fee cap](http://bankingjournal.aba.com/2026/10/federal-appeals-court-strikes-down-the-feds-debit-card-fee-cap/), the Eighth Circuit's October 26, 2026 ruling that the Fed exceeded its authority in the costs it counted
- [America's Credit Unions: Court rules Fed must re-write debit interchange fee cap](https://www.americascreditunions.org/news-media/news/court-rules-fed-must-re-write-debit-interchange-fee-cap), the regulation vacated and remanded for the Fed to rewrite
- [Optimized Payments: What merchants need to know about the new Visa/Mastercard interchange settlement](https://optimizedpayments.com/insights/industry-news/what-merchants-need-to-know-about-the-new-visa-mastercard-interchange-settlement/), the November 10, 2025 announcement after the 2024 version was rejected, the 10-basis-point cut for five years and the 1.25% cap for eight, the three acceptance categories and the surcharging limits
- [PYMNTS: Judge signals approval for Visa and Mastercard swipe fee settlement](https://www.pymnts.com/credit-cards/2026/judge-signals-approval-for-visa-and-mastercard-swipe-fee-settlement/), preliminary approval on June 9, 2026
- [Payments Dive: 4 reasons the Visa-Mastercard pact survived](https://www.paymentsdive.com/news/4-reasons-the-visa-mastercard-pact-survived/822503/), Judge Cogan's preliminary approval, the end of honor-all-cards, and the notice and comment still to come
- [Capital One: Capital One completes acquisition of Discover](https://capitalone.com/about/newsroom/capital-one-completes-acquisition-of-discover/), the May 18, 2025 closing and the Discover, Pulse and Diners Club networks
- [PaymentsJournal: After moving debit cards to Discover, Capital One turns to credit card migration](https://www.paymentsjournal.com/after-moving-debit-cards-to-discover-capital-one-turns-to-credit-card-migration/), about 25 million debit cards moved and credit testing, July 2026

**In practice**

- [Rainforest: Visa Commercial Enhanced Data Program requirements](https://docs.rainforestpay.com/docs/visa-commercial-enhanced-data-program-cedp-requirements), a processor's summary of the October 17, 2025 Product 3 date, arithmetic validation, the 5-basis-point fee and the Level 2 sunset
- [Adyen: Pricing](https://www.adyen.com/pricing), Interchange++ for Visa and Mastercard with a fixed processing fee, and a flat rate for American Express
- [Stripe: Pricing](https://stripe.com/pricing), a published blended rate and interchange-plus as a custom option
