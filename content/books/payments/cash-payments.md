+++
title = "Cash Payments"
description = "Letting customers pay in cash: retail bill-pay networks, real-time validation and posting, money orders, money transmitter rules, BSA reporting and vouchers."
category = "Payments Industry"
order = 1407
part = "How Money Moves"
tags = ["payments", "cash", "bill-pay", "money-orders", "aml", "vouchers"]
+++

Cash looks like the payment method software doesn't need to think about, until the customers who rely on it show up. The FDIC's 2023 survey found 4.2% of US households unbanked, about 5.6 million, two thirds of them using cash only, and another 14.2% underbanked. They pay phone bills, loans, insurance, online orders, rent and child support, and the businesses collecting from them still need those payments posted to the right account the same day. A platform reaches them through retail cash networks, where a customer pays at a store counter and the money arrives electronically, and through money orders. Outside the US, cash vouchers do the same job at much larger scale.

## How a Retail Cash Payment Works

Four parties: the **payer**, the **retailer** whose cashier takes the money (a pharmacy, a convenience store, Walmart), the **network** that connects thousands of retailers to thousands of billers (Fiserv's CheckFreePay, InComm's VanillaDirect, MoneyGram, PayNearMe, Western Union), and the **biller**, which is you or the merchant you collect for.

![A retail cash payment: the payer shows a barcode at the store; the store's register asks the network, which calls the platform in real time to validate the account and authorize the amount; the cashier takes the cash; the network confirms the payment to the platform within seconds, and the platform posts it; days later, the network settles the funds, net of fees, to the biller's bank account.](/diagrams/cash-payment.svg "The payment is known in seconds and the money arrives days later. Post on the network's confirmation, not on the settlement; the cash is already gone from the payer's hand.")

The payer identifies the bill one of two ways: a **barcode** tied to their account (printed on a statement, or shown on a phone), or a **biller code plus account number** given at the customer service desk. The register asks the network, the network asks the biller whether the account exists and can take this amount, the cashier takes the cash and a fee, and a receipt is the payer's proof.

## Integrating a Network

**Payment references.** Each payer gets a barcode or reference tied to their account. Make it reusable for recurring bills like a phone plan or a loan installment, or one-time with a fixed amount and an expiry for a specific invoice; VanillaDirect, for one, lets the biller set the amount, expiry and whether a barcode is single-use. Show the nearest locations, from the network's store locator data, wherever you show the barcode.

**Real-time validation at the counter.** The better networks call the biller before taking the cash. PayNearMe documents an order validation callback that checks the account and an authorization callback that accepts or declines the payment, with a 10-second default deadline; it doesn't retry, and a timeout declines the payment. That endpoint is now in the checkout path of a store you've never seen, so it's fast, highly available and decisive:

- Decline an account that's closed, evicted or sent to collections, and an amount over what the account allows.
- Enforce the payer's allowed methods, the restrictions [ACH & Bank Transfers](/books/payments/ach#after-a-return-fees-and-blocks) defines. An account restricted to certified funds after a bounced check may still be allowed cash; one barred from cash shouldn't be accepted at the counter.
- Never decline because the endpoint was slow. Timeouts are lost payments and a customer standing at a register with cash in hand.

**The confirmation is what counts.** The network's confirmation callback is authoritative; the authorization callback isn't. Retries come every minute, and PayNearMe suspends a callback after 40 consecutive failures, so the handler is idempotent on the network's payment identifier and always answers quickly ([Webhooks](/docs/api-design/webhooks) has the consumer side). Networks without callbacks send a nightly file instead (CheckFreePay delivers to some billers that way); reconcile it like any other bank file.

**Post the payment on confirmation.** Many billers notify in seconds and post days later; the DC child support agency tells payers to allow three to four business days. There's no reason for the gap. Cash, once handed over, doesn't bounce or get charged back, so the payer's balance should drop when the confirmation arrives, and the late fee shouldn't be charged to someone whose cash was taken on the due date.

**Settlement is a separate, slower event.** The network holds the funds and settles them later, net of its fees, to the biller's bank account. Few networks publish the timing, so measure it, and reconcile in two steps: confirmations against your postings, then confirmations net of fees against the settlement deposits ([Treasury](/books/payments/treasury)). The confirmation payload usually tells you the gross amount, the fee, the net and the store, which is everything the reconciliation needs.

**Fees and limits are per biller and per store.** The payer typically pays a fee of roughly $2 to $6 unless the biller absorbs it: one utility's retail partners charge $1.95, and Walmart's bill payment runs from $2.99 to $5.99. Limits vary: some retailers cap a payment at $500, others allow $1,500 a day; the IRS's retail cash program allows $500 a payment and $1,000 a day. A bill above the cap means more than one payment or another method, so the product should say so before the payer is at the counter.

**Reversals and refunds.** A cash payment has no chargeback, but networks still send reversal events for voids at the counter and corrections, so handle them as reversing ledger entries. Refunds can't go back to someone's cash: refund by check, card or bank transfer, and collect the details when you need them.

## Money Orders

Money orders are the cash customer's check, and they're deposited like checks ([Accepting Checks](/books/payments/checks)).

- **USPS money orders** max out at $1,000, so a $1,600 payment comes as two. As of October 2026 they cost $2.65 up to $500 and $3.75 up to $1,000, never expire, and since 2025 carry a QR code for verification alongside the watermark and security thread.
- **Availability depends on the issuer.** Under Regulation CC, a USPS money order deposited in person is available the next business day, otherwise the second; other issuers' money orders are ordinary checks.
- **Counterfeits are the risk.** The FTC warns fake money orders can take weeks to be discovered, and the depositor repays the bank. Verify USPS orders with the Postal Service's tool, other issuers with theirs, and treat a money order like any check until its return window passes.
- **They can't be converted to ACH.** Money orders are excluded from check conversion.

## Who's a Money Transmitter

Taking someone's money and passing it to someone else is money transmission, which is licensed in nearly every state and registered federally. Bill payment avoids that through two exemptions, and the integration has to fit them.

- **Federally, the payment processor exemption,** whose conditions are in [The Financial Crime Layer](/books/payments/payments-rulebook#the-financial-crime-layer). The cash-specific precedent is a 2008 FinCEN ruling that a gift shop collecting cash as a utility's authorized agent wasn't a money transmitter, because it took payments only for the billers it contracted with: the shape of every retail counter in a bill-pay network.
- **In the states, the agent-of-payee exemption.** The Money Transmission Modernization Act, enacted in full or in part by 31 states by September 2026, exempts an agent collecting for a payee when there's a written agreement directing the agent to collect, the payee holds the agent out as accepting payments on its behalf, and the payer's obligation is extinguished when the agent receives the money. That last condition is a product requirement: the moment the network confirms a cash payment, the payer has paid, whether or not the money has reached the biller.

[Becoming a Payment Provider](/books/payments/becoming-a-payment-provider) covers the licensing question in general; for cash, the network usually holds the licenses and the biller's contract with the network carries the exemption.

**Bank Secrecy Act reporting** follows the cash, and some of it reaches the biller directly:

- **Form 8300.** Any trade or business that receives more than $10,000 in cash in one transaction, or in related transactions, must report it to the IRS within 15 days. Rental of property is a listed example, and payments within 24 hours are related. A platform that lets a payer pay a year's rent or a semester's tuition in cash at a counter is within reach of this rule.
- **Structuring,** splitting cash to stay under $10,000, is a federal crime regardless of whether the money is clean. A payer making repeated $9,500 cash payments is a pattern to flag, not a convenience to offer.
- **Networks and banks file the rest:** currency transaction reports for cash over $10,000, records of money order sales for cash between $3,000 and $10,000, and suspicious activity reports. [OFAC screening](/books/payments/payments-rulebook#the-financial-crime-layer) applies to everyone, at any amount.

## Where Cash Is Required

Some places require businesses to take cash. Philadelphia (from July 1, 2019), New Jersey (2019), New York City (Local Law 34 of 2020, with rules effective October 8, 2020), Colorado (2021) and, since March 21, 2026, New York State require in-person retail businesses to accept it, with exceptions that vary. None targets bill payment, but a platform serving retail can't go cashless there.

Some kinds of payment have their own rules, like California's for rent ([Accepting Checks](/books/payments/checks#who-still-pays-by-paper)). Rules like these are why a payer's allowed payment methods belong in data, per account and with an expiry, not in code.

## Cash Around the World

In much of the world, cash vouchers are a mainstream way to pay online. The customer gets a reference or barcode at checkout and pays it at a store, bank or ATM, and the merchant learns the result asynchronously, which is the same asynchronous shape as the bank redirects in the [next chapter](/books/payments/wallets-and-local-methods#bank-push-and-bank-pull).

| Method | Where | Payer pays at | Expires | Confirmed | Refunds |
| --- | --- | --- | --- | --- | --- |
| **Boleto** | Brazil | Bank, ATM, agent or online banking | 3 days by default | Next business day | Not through the boleto |
| **Konbini** | Japan | Convenience stores | 1 to 60 days | Immediately | To bank details collected afterward |
| **Multibanco** | Portugal | ATM or online banking | Set by the merchant | Can take days | Up to 365 days |
| **OXXO** | Mexico | An OXXO store, in cash | 1 to 7 days | Next business day | Separate process |
| **Paysafecash** | Europe | Partner stores, by barcode | 72 hours by default | Minutes | Only to a Paysafecash account |

They share a design: the payment is **pending with an expiry**, most customers who abandon it simply never pay, and the order can't ship until the confirmation arrives. They also shift: in Brazil, Pix has become the dominant way to pay, and Pix Automático, launched in June 2025, goes after boleto's recurring bills ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods)). Offer vouchers where customers expect them, and expect the instant rails to take their place.

## What This Means for the System You Build

- **A real-time validation endpoint** that answers in well under the network's deadline and declines only for a reason.
- **Post on confirmation,** idempotently, and reconcile confirmations against settlements net of fees.
- **Payment references per account or per invoice,** with limits and fees shown before the payer is at the counter.
- **Refunds by another rail,** and reversals as reversing entries.
- **Money orders handled as checks,** with their own verification.
- **Contracts that extinguish the payer's obligation on payment,** and monitoring for Form 8300 thresholds and structuring.
- **Allowed payment methods as data,** per account, because laws sometimes require cash and sometimes let it be required.

## References

**Specifications**

- [FinCEN: Authorized agent for receipt of utility payments](https://www.fincen.gov/resources/statutes-regulations/administrative-rulings/whether-authorized-agent-receipt-utility), a retail agent of billers that isn't a money transmitter
- [CSBS: Money Transmission Modernization Act](https://mortgage.nationwidelicensingsystem.org/about/Documents/CSBS%20Money%20Transmission%20Modernization%20Act.pdf), the agent-of-payee exemption in section 3.01(b)
- [31 U.S.C. 5324](https://www.law.cornell.edu/uscode/text/31/5324), structuring
- [12 CFR 229.10](https://www.law.cornell.edu/cfr/text/12/229.10), availability of USPS money orders
- [31 CFR 1010.311](https://www.law.cornell.edu/cfr/text/31/1010.311), currency transaction reports for cash over $10,000
- [31 CFR 1010.415](https://www.law.cornell.edu/cfr/text/31/1010.415), records of money orders and other instruments sold for cash from $3,000 to $10,000

**Reference**

- [FDIC: 2023 National Survey of Unbanked and Underbanked Households](https://fdic.gov/household-survey/2023-fdic-national-survey-unbanked-and-underbanked-households-report), unbanked rates, cash-only households and money order use
- [CSBS: Money Transmission Modernization Act adoption](https://www.csbs.org/node/231461), states that have enacted it
- [IRS: Form 8300 reference guide](https://www.irs.gov/businesses/small-businesses-self-employed/irs-form-8300-reference-guide), cash over $10,000 received in a trade or business, including rent
- [IRS: Pay with cash at a retail partner](https://www.irs.gov/payments/pay-with-cash-at-a-retail-partner), a government biller's limits, fees and barcode expiry
- [USPS: Money orders](https://www.usps.com/shop/money-orders.htm), limits, fees ($2.65 and $3.75 as of October 2026), the QR code on 2025 designs, and verification
- [FTC: Fake check scams](https://consumer.ftc.gov/articles/how-spot-avoid-and-report-fake-check-scams), counterfeit money orders discovered weeks later
- [Philadelphia: Regulations on cash payments in retail establishments](https://phila.gov/documents/regulations-on-cash-payments-in-retail-establishments), the city's ban on refusing cash, Chapter 9-1132 of the Philadelphia Code
- [Local 21 News: Philadelphia mayor signs bill banning cashless stores](https://www.local21news.com/news/local/philadelphia-mayor-signs-bill-banning-cashless-stores), the 2019 signing and the July 1 effective date
- [NYC Rules: Prohibition of Cashless Establishments](https://rules.cityofnewyork.us/rule/31891/), the rules implementing Local Law 34 of 2020, effective October 8, 2020
- [New Jersey P.L.2019 c.50](https://pub.njleg.gov/Bills/2018/AL19/50_.HTM), requiring retail establishments to accept cash
- [Colorado HB21-1048](https://leg.colorado.gov/bills/hb21-1048), retail businesses must accept cash
- [California Civil Code 1947.3](https://california.public.law/codes/ca_civ_code_section_1947.3), how landlords may and may not restrict payment methods
- [New York Senate: S4153A](https://www.nysenate.gov/legislation/bills/2025/S4153/amendment/A), the state law requiring retail businesses to accept cash, Chapter 548 of 2025

**In practice**

- [PayNearMe: Callbacks](https://apidocs.paynearme.com/devdocs/docs/callbacks-overview), validation, authorization, confirmation and reversal callbacks with their timeouts and retries
- [PayNearMe: Confirmation callbacks](https://apidocs.paynearme.com/devdocs/docs/using-confirmation-callbacks), gross, fee and net amounts and deduplication
- [VanillaDirect Pay](https://vanilladirect.com/vdp.html), barcode controls, real-time validation and store locator
- [CheckFreePay](https://www.checkfreepay.com/), a walk-in bill payment network
- [Stripe: Boleto](https://docs.stripe.com/payments/boleto), [OXXO](https://docs.stripe.com/payments/oxxo), [Konbini](https://docs.stripe.com/payments/konbini) and [Multibanco](https://docs.stripe.com/payments/multibanco), voucher expiry, confirmation, settlement and refunds
- [Paysafe: Paysafecash](https://developer.paysafe.com/en/api-docs/payments-api/add-payment-methods/paysafecash/), barcode validity and limits
- [DC Office of the Attorney General: PayNearMe FAQ (PDF)](https://oag.dc.gov/sites/default/files/2022-09/CSSD%20PayNearMe%20FAQs.pdf), a biller's cash fee, limit and three-to-four-day posting
- [Payments Dive: Walmart makes cash payment options more efficient](https://www.paymentsdive.com/news/walmart-makes-cash-payment-options-more-efficient/601406/), retail cash bill payment fees from $2.99 up to $5.99
- [LG&E and KU: Want to pay cash?](https://lge-ku.com/newsroom/articles/2023/09/21/want-pay-cash), barcode and desk payments, a $1.95 fee, and retailers capping payments at $500
- [EWEB: Walmart bill pay FAQ (PDF)](https://www.eweb.org/documents/walmart_pay_customer_faq.pdf), a $1,500 daily limit per customer
