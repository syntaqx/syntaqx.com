+++
title = "Surcharging & Fees"
description = "Passing card costs to the payer: surcharges, convenience and service fees, cash discounts, the network caps and state laws behind them, and safe fee math."
category = "Payments Industry"
order = 1409
tags = ["payments", "surcharging", "convenience-fees", "compliance", "pricing"]
+++

Every card payment costs the merchant something ([Interchange & Pricing](/docs/industries/payments/interchange-and-pricing)), and more merchants now pass that cost to the payer. For a county collecting property tax, a university collecting tuition, a utility or a property manager collecting rent, it's often the deciding factor in whether they take cards at all: their margins can't absorb 2 or 3 percent of a large payment. So a platform serving those verticals will be asked for fees on day one.

The trouble is that "a card fee" is four different things, each allowed under different conditions by different rulebooks: the card networks' rules, which bind through the merchant's contract, and state law, which binds regardless. Get the category wrong and a merchant is charging an illegal fee on every payment your system processes. This chapter is the map, and the engineering that keeps a platform inside it. None of it is legal advice; the specifics change, and a merchant's counsel and acquirer have the last word.

## Four Ways to Pass On the Cost

| | Surcharge | Convenience fee | Service fee | Cash discount |
| --- | --- | --- | --- | --- |
| **What it is** | A percentage added for paying by credit card | A flat fee for using a channel outside the merchant's usual ones | A fee for government and education payments, under a network program | A lower price for paying another way |
| **Cards** | Credit only | Any card in that channel | Any, at the same fee for every brand | Not a card fee at all |
| **Amount** | Up to the merchant's cost, capped | Flat, whatever the amount | Flat, percentage or tiered | The merchant's choice |
| **Where** | Where state law allows | Not face-to-face, not on recurring payments | In person, online and recurring, for eligible merchants | Anywhere |
| **Gate** | 30 days' notice; disclosure | The channel must be a real convenience | Network registration; eligible merchant categories | Clear disclosure |

The difference that trips people up: a **surcharge** is charged for the card, a **convenience fee** for the channel. A utility that takes payments in person and by mail may add a flat fee for paying online, charged to every payment method in that channel. It may not add a percentage to card payments and call it a convenience fee.

## What the Networks Allow

Surcharging on Visa and Mastercard credit cards has been allowed in the US since January 27, 2013, under the settlement of the merchant class action. The rules have converged, with differences that matter.

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

Mastercard's rules add that a merchant accepting other networks, such as American Express or Discover, may face further conditions depending on those networks' costs and restrictions; both publish their own terms. In practice a platform applies the strictest rule that covers every card the merchant accepts, which today usually means **3%**, credit only, notice to everyone.

Two federal rules frame all of this. The Durbin Amendment forbids networks from stopping merchants offering a **discount** for paying by cash, check, debit or credit, as long as it doesn't vary by issuer or network, and lets merchants set a **minimum** for credit card purchases of up to **$10**.

### Convenience and Service Fees

Visa's own rules describe a convenience fee as a flat fee, clearly disclosed, for the convenience of paying through an alternate channel. Processors summarize the conditions in more detail: never in a face-to-face environment, never on recurring or installment payments, the same fee for every payment type in that channel, charged only by the merchant that provides the goods or services, and included in the payment's total.

**Service fees** are the exception for the public sector. Visa allows certain merchants, government and education among them, to assess fixed or variable service fees, under a program that requires registration and is limited to specific merchant category codes: taxes, courts and fines, government services, colleges and schools. A service fee can be a percentage, can apply in person and on recurring payments, must be the same for every card brand, and must be disclosed before the payment completes so the payer can cancel. When a third party charges it on a card-not-present payment, processors describe it going through as a separate transaction from the payment itself.

## What State Law Allows

Network rules are a contract; state law overrides them, and it varies more than the rules do. Visa's merchant guidance names **Connecticut, Maine, Massachusetts and Oklahoma** as states that prohibit or limit surcharging. Some examples of what the statutes actually say:

- **Connecticut** prohibits surcharges for any payment method, but allows a business to offer a cash discount, posted as a discount or as two prices.
- **Massachusetts** prohibits a seller from surcharging a customer who pays by credit card instead of cash or check.
- **Colorado** allows a surcharge of up to **2%** of the transaction, or up to the merchant's actual processing fee, at the merchant's choice, with prescribed disclosure, and never on cash, check, debit cards or gift cards.
- **New York** has required since **February 11, 2024** that a seller who surcharges post the **total** credit card price, inclusive of the surcharge, and the surcharge may not exceed what the card company charges the seller.

Those examples will age. The durable lesson is structural: the rules are per jurisdiction, they change by statute and court ruling, and they sometimes apply only to some merchant types, so they belong in data a compliance owner maintains, not in code.

## Who Relies on This

- **Government** collects taxes, fines and permits: amounts set by statute, with no margin to absorb a card fee. Service fee programs exist for exactly this.
- **Education** collects tuition in large amounts where a percentage fee is significant, again under service fee programs.
- **Utilities** take many payments online and on autopay, where convenience fees don't apply to the recurring ones; Visa prices exempt utility debit at a low flat interchange of its own.
- **Property management** collects rent, a large recurring payment, where surcharges, convenience fees and steering payers to [ACH](/docs/industries/payments/ach) all compete.

A platform serving these verticals sells fee handling as a feature. It's only a feature if it's right.

## The Engineering

- **Decide the fee on the server, from the card.** Look up the BIN before authorization and classify credit, debit or prepaid. Never surcharge debit or prepaid, even when the customer picked "credit" or the card network is ambiguous; when classification fails, charge no surcharge. Record the BIN data version used ([How Card Payments Work](/docs/industries/payments/card-payments)).
- **Make eligibility configuration, per merchant.** Fee type, rate or flat amount, which channels and card types, the merchant's category, its jurisdiction, and dates: when it notified its acquirer and the networks, and when it may start. A surcharge can't switch on before its notice period has passed.
- **Keep jurisdiction rules as effective-dated data.** Caps, prohibitions and disclosure requirements by state, owned by someone accountable for them, and versioned, so every historical fee can be explained by the rule that was in force.
- **Show it before the payer commits.** The fee and the total, before authorization, with a way to cancel or pay another way. Then authorize the total, and itemize the fee on the receipt and in the API.
- **Compute in minor units with a written rounding rule.** A percentage of an amount produces fractions of a cent; decide which way they round, once ([Money & Amounts](/docs/payments/money)).
- **Refund the fee with the payment.** A full refund returns the fee; a partial refund returns a proportional share. Keeping a fee on money you've given back is indefensible, whatever a rule allows.
- **Keep an audit trail.** For every fee: the inputs (card classification, merchant configuration, jurisdiction rule version) and the result. When an acquirer or a state asks why a fee was charged, the answer is a query, not an investigation.

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

**In practice**

- [ArentFox Schiff: Visa Reduces Its Merchant Surcharge Cap to 3%](https://www.afslaw.com/perspectives/alerts/visa-reduces-its-merchant-surcharge-cap-3-effective-april-15-2023-merchants), the April 15, 2023 change from 4%
- [Fiserv: Understanding Surcharging, Convenience and Service Fees (PDF)](https://www.carat.fiserv.com/content/dam/firstdata/us/en/documents/pdf/Understanding_Surcharging_Convenience_Service_Fees_Whitepaper.pdf), a processor's summary of convenience and service fee conditions as of January 2023
