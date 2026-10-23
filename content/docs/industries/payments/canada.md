+++
title = "Payments in Canada"
nav_title = "Canada"
description = "Extending a US payments platform to Canada: ACSS and Standard 005 files, pre-authorized debits under Rule H1, Interac, card rules, RPAA and FINTRAC."
category = "Payments Industry"
order = 1410
part = "The Rules"
tags = ["payments", "canada", "pad", "interac", "eft", "compliance"]
+++

Canada is the first country most US platforms add, and it looks close enough to home to be dangerous. The cards are Visa and Mastercard, the bank transfers are batch files, and rent is paid by debit. Then the details diverge: a different file format and holiday calendar, debit rules written by Payments Canada instead of Nacha, a 90-day consumer claim window, a domestic debit network, a federal code of conduct for card fees, a payments regulator that's only been supervising since 2025, and a province whose consumer contracts must be in French first. This chapter is what changes, with [ACH & Bank Transfers](/docs/industries/payments/ach) as the US baseline it's compared against.

## The Rails

Payments Canada runs the clearing systems; the Bank of Canada settles them and, since 2025, supervises the payment providers that use them.

| System | What moves on it | Timing | Final? |
| --- | --- | --- | --- |
| **ACSS** | EFT credits, pre-authorized debits, cheques, point-of-sale debit | Batch; settled the next business day | No: returns and claims follow |
| **Lynx** | High-value transfers between institutions | Real-time gross settlement, business days | Yes, immediately |
| **Interac e-Transfer** | Person-to-person and business push payments, by email or phone | Minutes | Yes, once deposited |
| **Real-Time Rail** | Account-to-account instant payments | Not live: launch targeted for late 2026 | Yes |

The **ACSS** is the workhorse: 10.6 billion items in 2025, about 42 million a day, including every direct deposit and pre-authorized debit. US-dollar items between Canadian institutions clear separately, through a parallel system that settles through New York correspondents, so a Canadian customer's USD account is its own integration. **Lynx** finished moving to ISO 20022 messages in November 2025. The **Real-Time Rail** has been promised since 2019; Payments Canada's current plan is a launch with its first participants in the fourth quarter of 2026, then moving Interac e-Transfer's clearing onto it through 2027. It's built with confirmation of payee and shared fraud services from the start, which will matter for payouts once it's real. Until then, plan around ACSS and e-Transfer.

## EFT Files: Standard 005

An EFT file in Canada is a **CPA Standard 005** file, and it shares nothing with NACHA's but the idea:

- **1,464-character records.** An `A` header, then `C` credits, `D` debits, `E` and `F` reversals of each, `I` and `J` returned credits and debits, and a `Z` trailer with control totals. Each detail record carries up to six 240-character transaction segments after a 24-character prefix, so one record holds six payments. Notices of change travel separately, as 208-character `S`, `U` and `V` records.
- **Banks vary.** That's the interbank format; what your bank accepts from you may be a 1,464- or 264-byte variant with its own restrictions (some allow only credits in a file). Build a writer per bank, the same way [Treasury](/docs/industries/payments/treasury) builds a parser per bank.
- **The file creation number is your idempotency key.** Four digits, in the header beside your 10-character originator ID, and the bank rejects a repeat. Allocate it from the database, never from a counter in memory, and record which entries went into which file so a rebuild can't double them.
- **Dates are Julian** (`0YYDDD`), institutions are nine digits (`0IIITTTTT`: institution number and branch transit), account numbers are up to 12 characters, and a 19-character cross-reference field carries your own entry ID for reconciliation.
- **The header names the currency,** CAD or USD, and anything else rejects the whole file.

Each payment carries a **transaction code** from Payments Canada's Standard 007, and like a US SEC code it's a statement about what the payment is: 401 for residential rent, 715 for commercial rent, the 430s for bill payments, 700 to 749 for business debits, 450 for anything miscellaneous. The code also decides which debit rules apply, below.

Files are exchanged between institutions three times a business day, at 9:30, 16:30 and 21:00 ET, and settle the next business day. Credits to most branches must be available within two hours of the exchange deadline, which makes a Canadian direct deposit faster in practice than its batch design suggests.

**Returns come back fast, and claims come back slow.** A bank dishonouring a debit (901 insufficient funds, 902 account not found, 905 closed, 907 no debits allowed, 911 frozen, 912 invalid account number) must return it by the next business day after the branch can decide, quicker than the US two-day window. Customer claims are a separate set of codes (915 no agreement, 916 not according to the agreement, 917 revoked, 918 no confirmation or pre-notification) with much longer windows, set by Rule H1. And an originator's own mistakes are reversed with `E` and `F` records within three business days of settlement, for a duplicate, a wrong amount, a wrong account, a cancelled agreement, or a debit not according to the agreement: the same idea as a Nacha reversal, on a shorter clock.

ISO 20022 is arriving here too: Rule F4 defines the ISO version of the exchange between banks. Whether your bank takes `pain.001` and `pain.008` from you instead of Standard 005 is a question for its cash management team, and the answer varies.

## Pre-Authorized Debits: Rule H1

A pre-authorized debit (PAD) is Canada's ACH debit, governed by Payments Canada's **Rule H1**, overhauled in October 2022. Where the US rules hinge on the SEC code, H1 hinges on the **category** and the frequency:

- **Personal** PADs pay a consumer's bills: rent, utilities, mortgage, insurance, property tax. **Business** PADs pay for commercial activity. **Cash Management** moves funds between related businesses, and **Funds Transfer** between a person's own accounts.
- Each is **one-time**, at **set intervals**, or **sporadic**. A sporadic PAD needs the payor's authorization for each debit, and the payor can't waive that; a one-time PAD needs a new agreement for any later debit.

**The agreement** must be dated and signed or otherwise authorized, and state the account, the category, the amount and timing (or what triggers a debit, or that it's sporadic), the cancellation terms, the payee's contact details, and H1's recourse statement word for word. When a payment provider collects on a merchant's behalf, the agreement says so. The payor's identity is verified by "commercially reasonable methods", and the whole audit trail is kept at least 12 months after the last debit.

**Two notices, ten days each.** A **confirmation** of the agreement goes to the payor at least 10 calendar days before the first debit, though the payor may waive or shorten that, in which case it's due within five days after the first debit (that's how a provider can debit right after signup). A **pre-notification** goes 10 calendar days before every variable-amount debit after the first, and before any change to a fixed amount or the dates. Fixed monthly rent needs no pre-notice until the rent changes; a utility bill that varies needs one every cycle, unless the agreement prominently waives or shortens it.

**Cancellation** is the payor's right at any time, and the payee must stop within 30 days, making best efforts to stop at the next cycle. A dishonoured PAD may be re-presented, but for the same amount, with no fee added: Canada has no equivalent of a Nacha return fee entry.

**Claims last 90 days.** A payor can claim reimbursement of a personal PAD for up to 90 calendar days after the debit, if it wasn't according to the agreement, the agreement was revoked, or the confirmation or pre-notification wasn't given; a claim that no agreement existed also has 90 days. Business PADs have 10 business days. Like an unauthorized ACH return, the claim isn't contested inside the system, so the payee's remedy is outside it.

![A personal pre-authorized debit's timeline: the agreement is confirmed at least 10 calendar days before the first debit; the debit settles the next business day after exchange; a bank dishonour such as insufficient funds comes back by the next business day; a business PAD can be claimed for 10 business days; a personal PAD can be claimed for 90 calendar days, after which it's final.](/diagrams/pad-states.svg "A Canadian debit fails fast and can be claimed back slowly. Dishonours arrive the next business day; personal debits stay claimable for 90 calendar days, half again longer than a US consumer's 60.")

So the [ledger states](/docs/payments/payment-states) are the ACH ones with Canadian numbers: probably good after the next business day passes without a dishonour, and final for a personal PAD only after 90 days. Size holds and reserves to that tail, exactly as [ACH & Bank Transfers](/docs/industries/payments/ach) does for the US 60 days.

The rules are still moving. Paper PADs leave clearing on December 1, 2028, and a new Rule H6 adds bill-payment notification duties from December 1, 2026; check Payments Canada's rule changes before building against any number here.

## Interac

Interac is the domestic debit network, and it's three different products:

- **Interac Debit** is how Canadians pay with a bank card in person, including Interac Flash contactless, with per-tap limits set by each institution. Online and in-app it's reachable through wallets and payment providers; Stripe added it in February 2026.
- **Interac e-Transfer** is a push payment to an email address or phone number, irrevocable once deposited. It's how many tenants pay rent. **Request Money** lets a payee send the request, which carries your reference and makes reconciliation possible; e-Transfer for Business raises limits to as much as $25,000 a transaction, depending on the institution, and supports bulk files and ISO 20022 remittance data.
- **Interac Online**, the old bank-redirect checkout, has been discontinued. Its successor is Interac Direct, an account-based online payment launched in November 2025 under the Konek brand.

## Cards

The networks are familiar, but the rules around them aren't.

**The Code of Conduct for the Payment Card Industry in Canada** binds networks, acquirers and their "downstream participants", which includes payment facilitators and platforms. Its current version took effect between October 2024 and April 2025, and much of it is engineering:

- Monthly statements show the **effective rate** for each card type, plus a summary box and a cost-per-transaction disclosure.
- A fee increase needs 30 to 60 days' notice to the merchant, who may then cancel without penalty within 70 days of it taking effect.
- Complaints are acknowledged within 5 business days and resolved within 20.
- Merchants may accept a network's credit cards without its debit cards or the reverse, and may discount by payment method or network.

[Software Platforms](/docs/industries/payments/software-platforms) covers per-merchant pricing; in Canada the notice periods are part of the pricing system.

**Interchange** is lower for small merchants by government agreement: from October 19, 2024, Visa and Mastercard cut rates for businesses under $300,000 of annual Visa volume or $175,000 of Mastercard volume, to a weighted average of 0.95% in store. The thresholds are already moving (the Canadian Federation of Independent Business reports Visa raising its threshold to $750,000 from October 2026), so treat them as data with an effective date, as [Interchange & Pricing](/docs/industries/payments/interchange-and-pricing) recommends for every rate.

**Surcharging** has been allowed since October 2022, within limits the [Surcharging & Fees](/docs/industries/payments/surcharging-and-fees) engine has to encode per country: credit cards only, at most 2.4% and no more than the merchant's actual cost, disclosed before the payment, with notice to the acquirer, never combined with a convenience fee, and never in Quebec, whose consumer protection law prohibits it. Debit and prepaid cards can't be surcharged.

**Acquiring is local.** Canadian interchange rates and Interac need a Canadian acquirer and a Canadian merchant location; a Canadian card run through a US merchant account is an international transaction, with cross-border fees on top (Stripe, for one, adds 1.5% for international cards and 1% more for currency conversion). Going to Canada properly means a Canadian entity and acquiring relationship, which is a [processor routing](/docs/industries/payments/processor-routing) decision as much as a legal one.

## Who Regulates You

**The Retail Payment Activities Act** brought payment providers under Bank of Canada supervision. If you hold funds for end users, initiate or authorize transfers at their request, or clear and settle, you're a payment service provider in scope, whether you're in Canada or outside it directing services at Canadians. Banks and other prudentially regulated institutions are excluded, as are agents of a registered provider. Since September 8, 2025:

- **Register before operating,** with the Bank of Canada.
- **An operational risk framework** with incident response, and notice to the Bank "without delay" when an incident hits.
- **Safeguard end-user funds** in a trust account, or a segregated account backed by insurance or a guarantee: Canada's version of [Treasury](/docs/industries/payments/treasury)'s FBO and safeguarding problem.
- **Notify significant changes** and new activities at least five business days ahead, and file an annual report by March 31.

**FINTRAC** registers money services businesses, and its definition explicitly includes services that pay invoices for others: rent, utilities, payroll, tuition. Payment providers have had to register since 2022, foreign ones included. The obligations are anti-money-laundering ones: records of electronic funds transfers of $1,000 or more, large cash records at $10,000, reports of international transfers of $10,000 or more, travel-rule information on transfers, and five years of retention. The [Payments Rulebook](/docs/industries/payments/payments-rulebook) covers the US equivalents.

**Open banking** is coming but not here: the Consumer-Driven Banking Act received Royal Assent in March 2026, draft regulations followed in June, and data sharing phases in from the final regulations, with payment initiation further out still.

**Privacy and language** are provincial as well as federal. PIPEDA governs personal data federally; Quebec's Law 25, fully in force since September 2024, is stricter and carries penalties up to $25 million or 4% of turnover. Quebec's Charter of the French Language requires contracts of adhesion, the kind every payment terms page and PAD agreement is, to be given in French first. Build the French version into the product, not a translation step afterward; [Internationalization](/docs/frontend/internationalization) covers the mechanics.

## Calendar and Account Formats

- **A different set of holidays.** Payments Canada closes on New Year's Day, Good Friday, Victoria Day, Canada Day, Labour Day, the National Day for Truth and Reconciliation (September 30), Thanksgiving (the second Monday in October), Remembrance Day, Christmas and Boxing Day. Several of those are US business days, and US holidays like Juneteenth, July 4 and US Thanksgiving are Canadian ones. Provincial holidays like Family Day and the Civic Holiday aren't system closures. A platform that settles in both countries needs both calendars as data, as [Treasury](/docs/industries/payments/treasury#the-banking-calendar) describes.
- **Account numbers have three parts.** A three-digit institution number and five-digit branch transit, written `0IIITTTTT` in files and `TTTTT-III` on a cheque, plus an account number of up to 12 digits whose length varies by bank. Validate the institution and transit against Payments Canada's directory, not a regex.
- **Currency is explicit.** CAD has two decimal places, as [Money](/docs/payments/money) expects. USD accounts at Canadian banks are common, and a debit in the wrong currency for the account fails, days later; capture the account's currency at enrollment.

## What This Means for the System You Build

- **A Standard 005 writer per bank,** with file creation numbers allocated durably and Canadian transaction codes chosen from the payment's purpose.
- **PAD agreements as records,** with category and frequency, confirmation and pre-notification scheduled 10 days out, cancellation honoured within 30 days, and the audit trail kept a year past the last debit.
- **A 90-day tail** in the ledger and risk limits for personal PADs, and no fees on re-presented debits.
- **Interac e-Transfer Request Money** for tenants who push payments, with your reference in it.
- **Code of Conduct notices and statements** built into merchant pricing, and surcharging rules that know about Quebec.
- **RPAA registration and FINTRAC registration** before launch, safeguarding in the treasury design, and French-first terms for Quebec.
- **The Canadian holiday calendar** and account format as data, beside the US ones.

## References

**Specifications**

- [Payments Canada: Rule H1, Pre-Authorized Debits](https://www.payments.ca/sites/default/files/h1eng.pdf), categories, agreement contents, confirmation, pre-notification, cancellation and reimbursement claims
- [Payments Canada: Standard 005, AFT file format](https://www.payments.ca/sites/default/files/standard005eng.pdf), record types, segments and field layouts
- [Payments Canada: Standard 007, transaction and return codes](https://www.payments.ca/sites/default/files/standard007eng.pdf), transaction codes by purpose and the dishonour and claim return reasons
- [Payments Canada: Rule F1, Automated Funds Transfer](https://www.payments.ca/sites/default/files/f1eng.pdf), exchange deadlines, settlement, availability and error corrections
- [Retail Payment Activities Act](https://laws-lois.justice.gc.ca/eng/acts/R-7.36/page-1.html), payment functions, scope and exclusions
- [FCAC: Code of Conduct for the Payment Card Industry in Canada](https://www.canada.ca/en/financial-consumer-agency/services/industry/laws-regulations/credit-debit-code-conduct.html), disclosures, notice periods, cancellation and complaints

**Reference**

- [Payments Canada: ACSS](https://www.payments.ca/systems-services/payment-systems/retail-batch-payment-system), what clears in the batch system and 2025 volumes
- [Payments Canada: Lynx fully adopts ISO 20022](https://www.payments.ca/bringing-data-rich-high-value-payments-canada-lynx-fully-adopts-iso-20022-standard), the end of MT messages in November 2025
- [Payments Canada: Real-Time Rail testing and launch](https://www.payments.ca/systems-services/payment-systems/real-time-rail-payment-system/testing-and-launch), the phased plan from late 2026
- [Payments Canada: ACSS rule changes](https://www.payments.ca/acss-rule-changes-enhance-payment-system-processes), paper PADs removed in 2028 and Rule H6 from December 2026
- [Payments Canada: System closure schedule](https://www.payments.ca/system-closure-schedule), the holidays when nothing clears
- [Bank of Canada: Retail payments supervisory framework](https://www.bankofcanada.ca/regulatory-oversight/retail-payments/supervisory-framework/), operational risk, safeguarding, incident and annual reporting requirements
- [FINTRAC: Money services businesses](https://fintrac-canafe.canada.ca/msb-esm/msb-eng), invoice payment services as MSBs
- [FINTRAC: Record keeping for MSBs](https://fintrac-canafe.canada.ca/guidance-directives/recordkeeping-document/record/msb-eng), the $1,000 and $10,000 thresholds and retention
- [FCAC: Surcharging by merchants](https://www.canada.ca/en/financial-consumer-agency/services/merchants/credit-fees-merchant.html), credit only, the 2.4% cap and Quebec
- [Department of Finance: Credit card fees reduced for small businesses](https://www.canada.ca/en/department-finance/news/2024/10/government-reduces-credit-card-fees-by-27-per-cent-for-small-business-owners.html), the October 2024 reductions and eligibility thresholds
- [Canada Gazette: Consumer-driven banking regulations](https://gazette.gc.ca/rp-pr/p1/2026/2026-06-27/html/reg3-eng.html), the draft regulations of June 2026
- [Interac: e-Transfer for Business](https://www.interac.ca/en/payments/business/send-receive-money-with-interac-e-transfer-for-business/), limits, bulk payments and remittance data
- [Interac: Interac Direct](https://www.interac.ca/en/payments/personal/interac-direct/), the account-based online payment that replaced Interac Online

**In practice**

- [Stripe: Canadian pre-authorized debits](https://docs.stripe.com/payments/acss-debit), mandates, waived confirmation and timing as a provider implements them
- [CFIB: Visa lowers interchange fees for small businesses](https://www.cfib-fcei.ca/en/media/visa-lowers-interchange-fees-for-tens-of-thousands-of-small-businesses-but-new-credit-card-fees-are-on-the-horizon), the October 2026 threshold change and new network fees
- [Chase Canada: Surcharging](https://www.chase.ca/en/help/surcharge), an acquirer's statement of which cards can be surcharged
