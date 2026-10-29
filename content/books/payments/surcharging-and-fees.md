+++
title = "Surcharging & Fees"
description = "Passing card costs to the payer: surcharges, convenience and service fees, cash discounts, the network caps and state laws behind them, and safe fee math."
category = "Payments Industry"
order = 1413
part = "The Rules"
tags = ["payments", "surcharging", "convenience-fees", "compliance", "pricing"]
+++

Every card payment costs the merchant something ([Interchange & Pricing](/books/payments/interchange-and-pricing)), and more merchants now pass that cost to the payer. For a B2B distributor invoicing on thin margins, a restaurant group, a dental practice or a public agency collecting a fixed statutory amount, it's often the deciding factor in whether they take cards at all: their margins can't absorb 2 or 3 percent of a large payment. So a platform serving those verticals will be asked for fees on day one, and fee handling is only a feature if it's right. A restaurant's service charge is a different thing again, a charge on the check rather than a card fee ([Tips, Service Charges and the Law](/books/commerce/restaurants#tips-service-charges-and-the-law)). The verticals differ ([Payments by Vertical](/books/payments/payments-by-vertical)): government and education use service fee programs because statutory amounts leave no margin, a subscription business can't put a convenience fee on its recurring charges, and a B2B seller weighs a surcharge against steering buyers to [ACH](/books/payments/ach).

The trouble is that "a card fee" is four different things, each allowed under different conditions by different rulebooks: the card networks' rules, which bind through the merchant's contract, and state law, which binds regardless ([The Payments Rulebook](/books/payments/payments-rulebook) explains why the two differ). Get the category wrong and a merchant is charging an illegal fee on every payment your system processes. This chapter is the map, and the engineering that keeps a platform inside it. None of it is legal advice; the specifics change, and a merchant's counsel and acquirer have the last word.

## Four Ways to Pass On the Cost

| | Surcharge | Convenience fee | Service fee | Cash discount |
| --- | --- | --- | --- | --- |
| **What it is** | A percentage added for paying by credit card | A flat fee for using a channel outside the merchant's usual ones | A fee for government, education and utility payments, under a network program | A lower price for paying another way |
| **Cards** | Credit only | Any card in that channel | Any | Not a card fee at all |
| **Amount** | Up to the merchant's cost, capped | Flat, whatever the amount | Flat, percentage or tiered | The merchant's choice |
| **Where** | Where state law allows | Not face-to-face, not on recurring payments | In person, online and recurring, for eligible merchants | Anywhere |
| **Gate** | 30 days' notice; disclosure | The channel must be a real convenience | Eligible merchant categories; cards accepted in every channel | Clear disclosure |

The difference that trips people up: a **surcharge** is charged for the card, a **convenience fee** for the channel. A medical practice that takes payments at the front desk and by mail may add a flat fee for paying online, charged to every payment method in that channel. It may not add a percentage to card payments and call it a convenience fee.

## What the Networks Allow

Surcharging on Visa and Mastercard credit cards has been allowed in the US since January 27, 2013, under the 2012 settlement of the merchant class action. The rules have converged, with differences that matter.

**Visa:**

- Credit only. Debit and prepaid cards can never be surcharged.
- No more than the merchant's cost of accepting that card, and never above **3%**. Visa lowered the cap from 4% to 3% effective April 15, 2023.
- The merchant notifies its **acquirer** at least 30 days before it starts.
- Disclosure at the point of entry and the point of sale, and the surcharge itemized separately on the receipt.

**Mastercard:**

- Credit only. Not on Debit Mastercard or prepaid cards.
- A **brand-level** surcharge (one rate for all Mastercard credit) is capped at the lesser of the merchant's average effective discount rate for Mastercard credit and a maximum of **4%**. A **product-level** surcharge (one rate for a particular card product) is capped at the merchant's cost for that product, minus the Durbin cap on debit interchange.
- The merchant notifies both **Mastercard and its acquirer** at least 30 days before it starts.
- Disclosure at the point of interaction, with the surcharge amount on the receipt.

Mastercard's rules add that a merchant accepting other networks, such as American Express or Discover, may face further conditions depending on those networks' costs and restrictions; both publish their own terms (Discover's now under Capital One, which completed its acquisition of Discover Financial Services on May 18, 2025). In practice a platform applies the strictest rule that covers every card the merchant accepts, which today usually means **3%**, credit only, notice to everyone.

Federal law frames all of this. The Durbin Amendment forbids networks from stopping merchants offering a **discount** for paying by cash, check, debit or credit, as long as it doesn't vary by issuer or network, and lets merchants set a **minimum** for credit card purchases of up to **$10**.

### The Pending Settlement

These rules may loosen. On November 10, 2025, Visa and Mastercard announced a proposed settlement with the injunctive relief class in the interchange fee litigation (*In re Payment Card Interchange Fee and Merchant Discount Antitrust Litigation*, E.D.N.Y.). For surcharging it would let a merchant surcharge Visa credit without surcharging other credit networks, and it would replace honor-all-cards for US credit with a choice of which categories to accept: commercial, premium consumer and standard consumer. It also cuts the average effective credit interchange rate by 10 basis points for five years and caps standard consumer credit rates at 1.25%. Judge Brian Cogan granted **preliminary** approval on June 9, 2026. As of October 2026, final approval was still pending after the objection period, and a convenience-store trade group has said it will appeal if final approval is granted, so none of it governs a payment today. A fee engine built with per-brand and per-category rules as data absorbs the change when it comes; one with "3%, credit only" in code does not.

### Convenience and Service Fees

Visa's own rules describe a convenience fee as a flat fee, clearly disclosed, for the convenience of paying through an alternate channel. Processors summarize the conditions in more detail: never in a face-to-face environment, never on recurring or installment payments, the same fee for every payment type in that channel, charged only by the merchant that provides the goods or services, and included in the payment's total.

**Service fees** are the exception for the public sector and utilities. Visa lets a US government agency, utility or education merchant, or a third party acting for one, assess a service fee in specific merchant category codes: utilities (4900), schools and colleges (8211, 8220, 8244, 8249), court costs (9211), fines (9222), tax payments (9311) and government services (9399). The amount may be "flat, fixed, banded, or ad valorem," so it can be a percentage, and it must reasonably reflect the cost of acceptance and, where possible, be capped. The merchant must accept Visa in every channel where it takes payments, disclose the fee as a service fee before the payment completes so the payer can cancel, and never charge it on top of a surcharge or convenience fee. The program changed on October 18, 2025: utilities were added, registration with Visa and the Merchant Verification Value were dropped, and a third party's fee no longer has to go through as a separate transaction from the payment. Integrations built for the old program may still run two transactions; what each vertical does with the fee is in [Payments by Vertical](/books/payments/payments-by-vertical#government).

**Rent has its own program.** Visa's US Rent Payment Program is open only to merchants coded as real estate agents and managers (MCC 6513) and registered with Visa. It allows a flat fee of up to $10 on debit cards (a program fee, not a surcharge), card-not-present only, and treats a fee on credit cards as a surcharge, under the surcharge rules above. A rent platform's fee engine needs the merchant account's category code as an input, which is one reason [Software Platforms](/books/payments/software-platforms) gives each line of business its own merchant account.

## What State Law Allows

Network rules are a contract; state law overrides them, and it varies more than the rules do. Visa's merchant guidance names **Connecticut, Maine, Massachusetts and Oklahoma** as states that prohibit or limit surcharging. Some examples of what the statutes actually say:

- **Connecticut** prohibits surcharges for any payment method, but allows a business to offer a cash discount, posted as a discount or as two prices.
- **Massachusetts** prohibits a seller from surcharging a customer who pays by credit card instead of cash or check.
- **Colorado** allows a surcharge of up to **2%** of the transaction, or up to the merchant's actual processing fee, at the merchant's choice, with prescribed disclosure, and never on cash, check, debit cards or gift cards.
- **New York** has required since **February 11, 2024** that a seller who surcharges post the **total** credit card price, inclusive of the surcharge, and the surcharge may not exceed what the card company charges the seller.

Those examples will age. The durable lesson is structural: the rules are per jurisdiction, they change by statute and court ruling, and they sometimes apply only to some merchant types, so they belong in data a compliance owner maintains, not in code ([Rules as Data](/docs/architecture/rules-as-data)). Outside the US the same table carries national law: Canada allows credit card surcharges within a cap ([Payments in Canada](/books/payments/canada#cards)), and the EU and UK ban surcharges on consumer cards outright ([Card Rules](/books/payments/eu-and-uk#card-rules)).

## How the Platforms Do It

Providers differ less in what they allow than in how much of the checking they do. All of them leave the legal answer with the merchant; the useful difference is which mistakes the API refuses. The platform side, where a fee is configured and who absorbs it down a tree of merchants, is in [Who Pays the Fee](/books/payments/software-platforms#who-pays-the-fee); this is the payment side.

- **Moov** carries service and convenience fees as `lineItems` on a transfer or payment link, so the fee is disclosed as its own line. Its docs state that a surcharge can only be applied to credit card transactions, is percentage based and capped by the card brands, and needs 30 days' notice to Moov before it starts.
- **Payabli** carries every payer fee type (convenience, service, surcharge, platform) in one `serviceFee` dollar amount, with `totalAmount` including it, and validates it against the merchant's configured fee. Its surcharge errors name the checks it makes: the card isn't credit, the card isn't US-issued, the merchant's or the payer's state restricts surcharging, the merchant hasn't completed network registration such as the notice period, a surcharge and a service fee are on the same payment, or the amount doesn't match Payabli's own calculation. Its docs also state that fees are non-refundable.
- **Rainforest** documents its caps directly: a surcharge can't exceed 4%, Visa credit cards can't exceed 3%, and debit cards can't be surcharged. The integration calculates the fee, using BIN lookup in Rainforest's payment component to tell credit from debit.
- **Stripe** has surcharging in public preview (API version `2026-03-25.preview`). The surcharge goes in `amount_details[surcharge][amount]` and the top-level amount must already include it. Once a payment method is attached, the PaymentIntent returns whether surcharging is available for that card and a `maximum_amount`, which Stripe calls a technical restriction rather than a suggested amount, and validation against it can be turned off. Its docs state that card network rules and some laws require returning the whole surcharge on a full refund and a prorated share on a partial one.

Two things follow. A provider's ceiling isn't the merchant's ceiling: Stripe's maximum is technical, and Payabli by default accepts a fee above the configured one, so a cap from state law or the merchant's own cost still has to be enforced by your engine. And the refund rule isn't uniform across providers, so decide it in your engine and show it at checkout rather than inheriting whatever the provider does.

## What This Means for the System You Build

- **Decide the fee on the server, from the card.** Look up the BIN before authorization and classify credit, debit or prepaid. Never surcharge debit or prepaid, even when the payer picked "credit" or the card network is ambiguous; when classification fails, charge no surcharge. Record the BIN data version used ([How Card Payments Work](/books/payments/card-payments)).
- **Make eligibility configuration, per merchant.** Fee type, rate or flat amount, which channels and card types, the merchant's category, its jurisdiction, and dates: when it notified its acquirer and the networks, and when it may start. A surcharge can't switch on before its notice period has passed.
- **Keep jurisdiction rules as effective-dated data.** Caps, prohibitions and disclosure requirements by state, owned by someone accountable for them, and versioned, so every historical fee can be explained by the rule that was in force ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Show it before the payer commits.** The fee and the total, before authorization, with a way to cancel or pay another way. Then authorize the total, and itemize the fee on the receipt and in the API.
- **Compute in minor units with a written rounding rule.** A percentage of an amount produces fractions of a cent; decide which way they round, once ([Money & Amounts](/docs/payments/money)).
- **Refund the fee with the payment.** A full refund returns the fee; a partial refund returns a proportional share. Keeping a fee on money you've given back is indefensible, whatever a rule allows.
- **Keep an audit trail.** For every fee: the inputs (card classification, merchant configuration, jurisdiction rule version) and the result. When an acquirer or a state asks why a fee was charged, the answer is a query, not an investigation.

## Auditing

A fee is a charge the payer didn't choose, so the record has to answer a payer's complaint, an acquirer's review and a state attorney general's inquiry. The general design is in [Audit Trails](/docs/architecture/audit-trails); for fees, make sure the record shows:

- **The inputs and the rule behind every fee:** the BIN classification and its data version, the merchant's fee configuration version, the jurisdiction rule version, and the amount computed, stored on the payment ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **What the payer was shown and when,** the fee and total as displayed, before authorization, so disclosure is provable rather than assumed.
- **Who turned surcharging on for a merchant and on what evidence,** including the dates it notified its acquirer and the networks, since the notice period is the gate.
- **Every difference between the configured fee and the one charged,** the tolerance, absorbed difference or per-transaction override, with the caller that sent it.
- **Every fee refunded or kept,** linked to the refund, so the refund rule can be shown to have been applied every time.

## References

**Specifications**

- [Cornell LII: 15 U.S.C. § 1693o-2](https://www.law.cornell.edu/uscode/text/15/1693o-2), Durbin's protection for payment-method discounts and the $10 credit card minimum
- [Colorado Revised Statutes § 5-2-212](https://colorado.public.law/statutes/crs_5-2-212), the 2% or processing-fee surcharge cap and the excluded payment methods
- [Massachusetts General Laws c. 140D, § 28A](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXX/Chapter140D/Section28A), the prohibition on credit card surcharges
- [New York General Business Law § 518](https://newyork.public.law/laws/n.y._general_business_law_section_518), posting the total credit card price and the cap at the card company's charge

**Reference**

- [Visa: Merchant Surcharging Considerations and Requirements (PDF)](https://usa.visa.com/dam/VCOM/global/support-legal/documents/merchant-surcharging-considerations-and-requirements.pdf), credit only, the 3% ceiling, 30 days' notice to the acquirer, disclosure and the states Visa lists
- [Visa: Visa Rules](https://www.visa.com/en-us/support/visa-rules), convenience fees as flat fees for an alternate channel, and service fees for government and education
- [Mastercard: Merchant Surcharge Rules](https://www.mastercard.com/us/en/business/support/merchant-surcharge-rules.html), the 4% maximum, brand-level and product-level caps, notice to Mastercard and the acquirer, and disclosure
- [Connecticut Department of Consumer Protection: Credit Card Surcharge](https://portal.ct.gov/DCP/Legal/Credit-Card-Surcharge), the surcharge prohibition and the cash discount allowance
- [Erie County Consumer Protection: NYS General Business Law § 518 Changes](https://www3.erie.gov/consumerprotection/nys-general-business-law-ss518-changes-february-11-2024), the February 11, 2024 effective date
- [Visa Inc. Form 8-K, November 10, 2025](https://www.sec.gov/Archives/edgar/data/1403161/000140316125000093/v-20251110.htm), the proposed injunctive relief class settlement: brand-level surcharging, acceptance by credit category, the 10 basis point reduction for five years and the 125 bps standard consumer cap, subject to court approval
- [Capital One: Capital One Completes Acquisition of Discover](https://www.capitalone.com/about/newsroom/capital-one-completes-acquisition-of-discover/), May 18, 2025
- [Visa Core Rules and Visa Product and Service Rules, 18 April 2026 edition (PDF)](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), the US Rent Payment Program for MCC 6513 merchants and its debit fee limit, and the service fee requirements, permitted MCCs (Table 5-6) and US entities (Table 5-7) in 5.5.3.1
- [UNC School of Government: Local Governments Now Allowed to Charge Fees for Accepting Credit and Charge Card Payments](https://canons.sog.unc.edu/blog/2013/02/08/local-governments-now-allowed-to-charge-customers-fees-for-using-credit-and-charge-cards), February 2013: the settlement's surcharge permission effective January 27, 2013

**In practice**

- [ArentFox Schiff: Visa Reduces Its Merchant Surcharge Cap to 3%](https://www.afslaw.com/perspectives/alerts/visa-reduces-its-merchant-surcharge-cap-3-effective-april-15-2023-merchants), the April 15, 2023 change from 4%
- [Payments Dive: Court approves Visa-Mastercard settlement](https://www.paymentsdive.com/news/court-approves-visa-mastercard-settlement/822440/), June 9, 2026: Judge Cogan's preliminary approval, the right to decline premium and commercial credit cards, and NACS's stated appeal
- [American Banker: Judge approves card network-fee settlement with merchants](https://www.americanbanker.com/payments/news/judge-approves-card-network-fee-settlement-with-merchants), June 10, 2026: preliminary, not final, approval, with an objection period and a further hearing to come
- [Moov: Fee types](https://docs.moov.io/guides/money-movement/accept-payments/fee-types/), service and convenience fees as line items, the flat fee for alternative channels, and surcharges credit only, brand-capped, with 30 days' notice to Moov
- [Payabli: Payor fees](https://docs.payabli.com/guides/pay-in-payor-fees-overview), one `serviceFee` field for every fee type, validation against the configured fee, and fees as non-refundable
- [Payabli: Unified response codes](https://docs.payabli.com/guides/pay-in-unified-response-codes-reference), surcharge errors E5050 to E5056: card type, non-US card, merchant and payer state, network registration, combination with a service fee, and amount mismatch
- [Rainforest: Surcharging with BIN lookup](https://docs.rainforestpay.com/docs/surcharging-with-bin-lookup), the 4% cap, 3% for Visa credit, credit only, and BIN lookup in the payment component
- [Stripe: Collect surcharges](https://docs.stripe.com/payments/cards/surcharge), the public preview API version, `amount_details[surcharge]`, `maximum_amount` as a technical restriction, and full and prorated surcharge refunds
- [TSG: Visa expands service fee eligibility and simplifies rules](https://tsgpayments.com/visa-expands-service-fee-eligibility-and-simplifies-rules/), the October 18, 2025 change: utilities added, no registration, no Merchant Verification Value, no separate transaction
- [Fiserv: Understanding Surcharging, Convenience and Service Fees (PDF)](https://www.carat.fiserv.com/content/dam/firstdata/us/en/documents/pdf/Understanding_Surcharging_Convenience_Service_Fees_Whitepaper.pdf), a processor's summary of convenience and service fee conditions as of January 2023
