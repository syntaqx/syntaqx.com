+++
title = "Vendor Payouts"
description = "Paying vendors and suppliers: ACH, virtual cards, checks and instant rails, vendor enrollment, stopping redirect fraud, funding, 1099s and reconciliation."
category = "Payments Industry"
order = 1412
tags = ["payments", "payouts", "accounts-payable", "fraud", "tax"]
+++

[Settlement](/docs/industries/payments/payouts-and-settlement) pays a merchant the money its own customers paid it. A vendor payout is the other direction: a business paying the people it owes, its suppliers, contractors and landlords, out of its own money. It looks like the same "send money to a bank account" problem, and the differences are where the work is. The payer chooses the recipient, so the main fraud is getting the payer to choose the wrong one. The vendor chooses how it wants to be paid, so one payable can leave by five different rails with five different timelines and failure modes. And the payer owes the IRS a record of who got paid what.

## The Methods

Every method trades cost, speed and finality differently, and the vendor's preferences count as much as the payer's:

| Method | Arrives | Final when | Costs the payer | Costs the vendor |
| --- | --- | --- | --- | --- |
| **ACH credit** | Next banking day, or same day | Settled, though it can still return as undeliverable | Cents | Nothing |
| **Virtual card** | When the vendor charges it | Card settlement | Nothing; often earns a rebate | Card acceptance fees |
| **Check** | Days, through the mail | Cleared, which can take weeks | Printing, postage, handling | Depositing it |
| **Wire** | Same day | Immediately; irrevocable | Bank wire fees | Sometimes an incoming fee |
| **RTP or FedNow** | Seconds | Immediately; irrevocable | Network and bank fees | Usually nothing |

My default is ACH: cheap, universal and carrying remittance data, with the mechanics in [ACH & Bank Transfers](/docs/industries/payments/ach). Virtual cards come next, where the vendor accepts them, then checks as the fallback for vendors who won't enroll, and instant rails for the payments where speed is worth paying for. Wires are for the rare large or urgent payment, and they get the strictest controls, because a wire sent to a fraudster is gone.

Instant rails changed the calculation for urgent payouts. RTP and FedNow both allow up to $10 million per payment ([ACH & Bank Transfers](/docs/industries/payments/ach#the-alternatives) has the details), but they share the wire's property that matters most here: there's no return path. The speed that pays a contractor tonight also pays an impostor tonight.

## Virtual Cards: Who Pays for the Rebate

A virtual card for payables is a card number issued for one payment. Visa describes it as single-use, so each payment corresponds to a specific invoice, with controls on the amount, the dates it's valid and the merchant categories it can be used at. The payer gets reconciliation for free (one card, one invoice) and usually a rebate.

The rebate isn't free money. It comes out of [interchange](/docs/industries/payments/interchange-and-pricing), which the vendor pays as its card acceptance cost. That's the whole tension of card-based payables: the payer's incentive is the vendor's expense. Some vendors accept it for faster payment; some decline cards; some add a [surcharge or fee](/docs/industries/payments/surcharging-and-fees) to card payments, which can cancel the rebate. Product design follows from that:

- **Ask, don't assume.** Enrollment records whether a vendor accepts card, and at what price. Sending a card to a vendor that runs it with a 3% fee is worse for the payer than ACH.
- **Deliver the card number like the card number it is.** It's cardholder data. Either the vendor retrieves it from a portal run by the issuer, or the issuer charges the vendor's terminal directly, and your systems hold a token, never the number ([Sensitive Data](/docs/payments/sensitive-data)).
- **Expire and fall back.** A card the vendor never charges is an unpaid invoice. Track issued, authorized, settled and expired, and when it expires, pay by another method rather than letting the invoice age.

## Checks Are Still Here

Many vendors still get paid by check, often because nobody ever enrolled them in anything else. Checks are slow and expensive, and they fail in ways electronic payments don't:

- **Positive pay.** Send the bank a file of every check issued, with number and amount. The bank rejects any presented check that doesn't match, which stops altered and counterfeit checks. A check program without it is relying on the forger making a mistake.
- **Voids and reissues are a two-step state change.** A lost check is voided at the bank first, confirmed, and only then reissued. Reissuing before the void lands is how a vendor gets paid twice.
- **Uncashed checks become someone else's problem, then the state's.** After a dormancy period with no activity, unclaimed property must be turned over to the state, and uncashed checks are a classic form of it. The holder owes outreach to the payee and a report to each state on its schedule. An outstanding check is therefore a ledger state with an aging clock, not a dead record.

## Enrollment and Method Choice

Vendor onboarding is a small version of [merchant onboarding](/docs/industries/payments/merchant-onboarding): collect the legal name and taxpayer ID on a W-9, the payment method and its details, and a remittance contact. Screen vendors against sanctions lists like any other payee ([The Payments Rulebook](/docs/industries/payments/payments-rulebook)).

Let vendors choose their method in a portal, with the payer able to set defaults and restrictions. Each vendor has a primary method and a fallback, and a payable records which method actually paid it. The portal is also the most valuable thing an attacker can reach, which is the next section.

## Stopping the Changed Bank Account

The defining fraud in payables is business email compromise: an email, apparently from a vendor or an executive, asking to send the next payment somewhere new. The FBI's 2025 Internet Crime Report counts 24,768 BEC complaints and $3.05 billion in reported losses, second only to investment fraud. The attacker doesn't need to break anything. They only need the payer to update a bank account.

So bank detail changes are the most carefully controlled operation in the system:

- **Verify out of band.** Confirm any change of payment details by calling a contact already on file, never one supplied in the request. Email alone is never enough.
- **Validate the account.** Check that the account exists and belongs to the vendor, with an account validation service or a prenote. Nacha requires validation for consumer web debits, not for credits to vendors; do it anyway.
- **Hold the first payment.** The first payment to new details waits, or needs a second approval, and the old contact gets a notice that the details changed. A legitimate vendor shrugs at a short delay; a fraud gets caught while the money is still home.
- **Separate duties.** The person who changes vendor details can't approve payments to that vendor, and large payments need two approvers.

The ACH network now pushes the same way. Nacha's 2026 fraud monitoring rules require ODFIs and non-consumer originators to monitor their entries, credits included, for payments sent under false pretenses, which is exactly what a redirected vendor payment is. The largest came under the rule in March 2026 and everyone else in June ([ACH & Bank Transfers](/docs/industries/payments/ach#the-rules-you-inherit)).

## Funding: Whose Money, and When

Someone has to fund a payout before it leaves, and each model moves risk somewhere different:

- **Pull, then pay.** Debit the payer's account, then pay the vendor. The trap is timing: an ACH debit can come back as a [return](/docs/industries/payments/ach#returns-when-money-is-really-yours) after you've paid the vendor, and then you've funded the payable yourself. Wait for the return window, or limit how much you pay ahead of it based on the payer's history.
- **Pre-funded balance.** The payer funds a balance, and payouts draw it down. No timing risk, but you're now holding the payer's money until it's paid out.
- **Pay first, collect later.** Float or credit. That's lending, with credit risk and its own regulation.

Holding funds for others between payer and payee is where [money transmission](/docs/industries/payments/payments-rulebook) comes in. Whether a payables product needs licenses, or fits an exemption such as acting as the payer's agent with funds in accounts its bank controls, depends on the actual flow of funds and the state. That's a question for counsel, decided before the ledger is designed, because the answer decides which accounts the money sits in.

Whatever the model, the ledger enforces one rule: never disburse more than the payer has funded and you've reserved. A payable moves through **approved**, **funded** and **paid**, and the funding is a ledger entry, not an assumption.

## A Payout Is a State Machine

The payable is the business object; each attempt to pay it is a disbursement on one rail, with that rail's own states:

- **ACH:** submitted, settled, and possibly returned.
- **Check:** printed, mailed, cleared, voided, stale, escheated.
- **Virtual card:** issued, authorized, settled, expired.
- **Instant and wire:** sent, then accepted or rejected, with no later return.

The payable is paid when one disbursement succeeds and stays successful, and the rules from [Payment States & Ledgers](/docs/payments/payment-states) apply: explicit transitions, terminal states that don't move, corrections as new entries.

The rule that matters most is that **a payable is paid once**. Every disbursement is created with an [idempotency key](/docs/payments/idempotency) derived from the payable and the attempt, so a retry after a timeout finds the original instead of creating a second. A new attempt on a different method is allowed only after the previous one is definitively dead: the ACH returned, the card expired unused, the check void confirmed by the bank. "We haven't heard back" is not dead.

![One approved payable fans out to five payment methods: ACH credit arrives next day and can still return; a virtual card settles when the vendor charges it and expires if unused; a check takes days and must be voided before reissue; a wire and RTP or FedNow arrive the same day and are final with no return path.](/diagrams/vendor-payouts.svg "One payable, one successful disbursement. Each rail has its own timing and its own way to fail, and a new attempt starts only after the last one is definitively dead.")

## Remittance and Reconciliation

A vendor receiving $12,480 needs to know which invoices it covers, or its accounts receivable team calls yours. Send remittance data with the payment where the rail carries it: an ACH CCD entry carries one addenda record, and a CTX entry up to 9,999, enough for a full remittance document ([ACH & Bank Transfers](/docs/industries/payments/ach#files-batches-and-sec-codes)). Otherwise send a remittance advice by email or the portal, keyed to the payment's reference.

Reconcile every rail daily against its own source of truth: ACH settlement and return files, card settlement reports, the bank's paid-check file, wire and instant payment confirmations. Each disbursement in the ledger matches exactly one external record, and anything that doesn't match by the end of the day is a break someone owns. The approach is the same as for [payouts](/docs/industries/payments/payouts-and-settlement#reconciliation); only the files differ.

## Tax: W-9s, TIN Matching and 1099s

Paying vendors in the US makes the payer an information reporter, and the payment method decides which form:

- **Collect a W-9 at enrollment.** It gives you the legal name and taxpayer ID. The IRS TIN Matching service lets payers check name and TIN combinations before they file, which catches the typo now instead of as an IRS notice later.
- **Backup withholding.** If a vendor doesn't provide a correct TIN, the payer withholds 24% of payments and sends it to the IRS. The system has to support withholding as a ledger entry, not a manual adjustment.
- **1099-NEC and 1099-MISC.** Nonemployee compensation, rents and similar payments are reported by the payer. For tax years beginning after 2025, the threshold is $2,000, up from $600, and may be adjusted for inflation from 2027.
- **1099-K, not 1099-NEC, for card payments.** Payments made by credit or payment card, and third-party network transactions, are reported on Form 1099-K by the payment settlement entity, and not by the payer on 1099-NEC or 1099-MISC.

That last rule means the tax totals depend on the method, so track totals per vendor, per year, per method. A vendor paid partly by ACH and partly by virtual card gets a 1099-NEC for the ACH portion only.

## References

**Specifications**

- [IRS: Instructions for Forms 1099-MISC and 1099-NEC](https://www.irs.gov/instructions/i1099mec), the $2,000 threshold for tax years beginning after 2025, and card and third-party network payments reported on 1099-K instead
- [IRS: Instructions for Form 1099-K](https://www.irs.gov/instructions/i1099k), payment settlement entities and third-party network reporting

**Reference**

- [IRS: Backup Withholding](https://www.irs.gov/businesses/small-businesses-self-employed/backup-withholding), the 24% rate when a correct TIN isn't provided
- [IRS: Taxpayer Identification Number Matching](https://www.irs.gov/tax-professionals/taxpayer-identification-number-tin-matching), validating name and TIN before filing
- [Visa: Virtual Card for Business](https://www.visa.com/en-us/business/cards/virtual-card), single-use cards tied to an invoice, with controls on amount, time and merchant category
- [NAUPA: What Is Unclaimed Property](https://www.unclaimed.org/what-is-unclaimed-property/), dormancy periods, uncashed checks, and turning property over to the state
- [Nacha: Fraud Monitoring Phase 1](https://www.nacha.org/rules/risk-management-topics-fraud-monitoring-phase-1), monitoring credit entries for payments sent under false pretenses

**In practice**

- [FBI: 2025 Internet Crime Report (PDF)](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf), 24,768 business email compromise complaints and $3.05 billion in reported losses
