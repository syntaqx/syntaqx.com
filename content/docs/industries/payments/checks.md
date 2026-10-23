+++
title = "Accepting Checks"
description = "Taking checks as payment: image clearing under Check 21, remote deposit capture, Reg CC holds, returns and late claims, conversion to ACH, lockbox and fraud."
category = "Payments Industry"
order = 1405
part = "How Money Moves"
tags = ["payments", "checks", "check-21", "remote-deposit", "reg-cc", "ach"]
+++

Checks share ACH's central problem, that money available isn't money final, on an older and slower clock. They keep shrinking and refuse to disappear. Americans wrote 9.2 billion of them in 2024, worth $24.45 trillion: 4% of noncash payments by number and 17% by value, because the ones that remain are big. Rent, invoices, insurance premiums, and every payment from a payer who won't hand over bank details still arrive on paper. A platform that collects for businesses gets them by mail, at a front desk, or through a lockbox, and has to turn them into money and ledger entries. This chapter is about receiving checks; issuing them, with positive pay and escheatment, is in [Vendor Payouts](/docs/industries/payments/vendor-payouts).

## How a Check Clears Now

Four parties: the **drawer** who writes the check, the **payee** it's written to, the **depositary bank** the payee deposits it at, and the **paying bank** that holds the drawer's account. The paper itself barely travels anymore.

The **Check 21 Act**, in force since October 2004, made that possible. A bank can **truncate** a check, capturing its image and data and taking the paper out of the process, and send it onward as an **electronic check** under agreements with the banks downstream. If someone downstream still needs paper, the image is printed as a **substitute check**, which the industry calls an image replacement document: a reproduction of front and back, with the MICR line and the legend "This is a legal copy of your check", and it's the legal equivalent of the original. Every bank that passes one on warrants that it's accurate and that nobody will be asked to pay the same check twice. Since 2018 Regulation CC applies the same warranties to electronic checks.

Banks exchange images directly, through clearing houses, or through the Federal Reserve's FedForward and FedReturn services. The Fed's future in check is an open question: in December 2025 its Board asked for comment on whether to keep investing in check services, maintain them as they are, or significantly reduce or wind them down. Comments closed in March 2026, no strategy had been announced by October 2026, and the Board has said any proposal will go out for comment again. Its separate foreign and Canadian check service ends with 2026. Nothing about that changes your integration soon, but it's one more reason not to build a business that depends on checks growing.

## The Image and the MICR Line

Everything downstream reads two things: the image and the line of magnetic ink characters along the bottom.

**The MICR line** carries, from right to left, an on-us field (the account number, and the serial number on personal checks), the nine-digit routing number between transit symbols, and on business checks an auxiliary on-us field holding the serial number. The amount field is blank when the check is printed; the first bank to process it encodes the amount. That auxiliary field matters later: its presence is how a system tells a business check from a consumer one.

**The image cash letter** is how deposits travel between banks, in the ANSI X9.100-187 format. Like a [NACHA file](/docs/industries/payments/ach#anatomy-of-a-nacha-file) it's a set of typed records: a file header (01), cash letter header (10), bundle header (20), a check detail record (25) with its addenda (26 to 28) and image view records (50, 52) for the front and back images, then bundle (70), cash letter (90) and file (99) controls. Returns use their own detail records (31 to 35). Images are typically black-and-white TIFFs. Your bank's remote deposit system usually builds the file for you; if you integrate with a bank's deposit API or run your own scanning, it's the format the bank will ask for.

## Remote Deposit Capture

Remote deposit capture (RDC) is scanning checks instead of carrying them to a bank: a desktop scanner at a front desk or back office, or a phone camera in an app. Each deposit is an image pair plus the MICR data, sent to the depositary bank, and the paper stays with you.

![A check's life after deposit: scanned and deposited on day 0; funds available by the second business day under Reg CC; returned items like insufficient funds, stop payment or a closed account come back within about two business days of presentment; after that, warranty claims for alteration or a duplicate can arrive within 30 days of discovery, and a drawer's claim of forgery or alteration up to a year after their statement.](/diagrams/check-returns.svg "A check fails in two waves. The ordinary returns come within days, often just after the bank has released the funds; the claims that a check was altered, forged or deposited twice can come months later.")

What the capture side owes the bank, and itself:

- **Image quality checks before submission.** Skew, a missing corner, two checks overlapped, too dark or too light, an image file too small to hold a real check. A check the paying bank can't read comes back as an unusable image (X9 return reason U), days later; catching it at the scanner costs a retake.
- **Both sides, read back.** The amount from the image (courtesy and legal amount) compared with what the user keyed, the MICR line parsed and validated, the payee checked against the account the deposit goes to, and the back checked for an endorsement.
- **The bank's endorsement travels in the file.** Reg CC 229.35 requires each bank that handles a check to endorse it, and for an electronic check that endorsement is data, not ink: the bank of first deposit's routing number, endorsement date and item sequence ride in the check detail addendum records, and the official commentary says a bank that captures an image before spraying an endorsement should apply it electronically. Your bank adds its own; what it needs from you is an image with the customer's endorsement visible on the back.
- **A restrictive endorsement.** "For mobile deposit only at [bank]", or whatever the bank's agreement specifies. Under Reg CC 229.34(f), a bank that takes a remote deposit and gets paid indemnifies a later bank that accepted the same paper check, unless the paper carried a restrictive endorsement inconsistent with how it was deposited. The endorsement is what puts the loss on whoever deposited it twice, not on you.
- **Duplicate detection across every deposit you've ever taken.** The same check scanned twice, by two employees, or by one customer at two properties, is the most common RDC loss. Key on routing number, account number, serial number and amount, and keep the keys forever, not for a rolling window. Duplicates at other institutions you can't see; that's what the indemnity and return reason Y (duplicate presentment) are for.
- **The paper has a lifecycle.** Mark it as processed when scanned so it can't be scanned again, keep it securely for the period your bank agreement requires, then destroy it. A drawer of uncashed originals in an office is a second deposit waiting to happen.

The bank side is set out in the Federal Financial Institutions Examination Council's (FFIEC) guidance on RDC risk, issued in 2009: customer suitability reviews, deposit limits, multi-factor authentication, and monitoring for duplicates, velocity and limit breaches. Expect your bank to impose all of it on you, and build the limits and reports into the product so its review is a formality.

## When the Money Is Available

**Regulation CC** governs how long a bank may hold deposited checks, and its dollar amounts were adjusted for inflation on July 1, 2025. Your bank applies it to your deposits; you should apply the same thinking to the merchants or landlords you credit.

- **Next business day:** cash deposited in person, electronic payments, US Treasury checks, on-us checks (drawn on the same bank they're deposited at; the MICR line's "on-us field" is a different use of the word), and in-person deposits of cashier's, certified and government checks and USPS money orders. Deposited remotely, those official checks wait until the second business day.
- **The first $275** of other check deposits on a day, by the next business day.
- **Everything else by the second business day.**
- **Exception holds** for new accounts in their first 30 days, deposits over $6,725 in a day, redeposited checks, accounts repeatedly overdrawn, and reasonable doubt that a check will be paid, each requiring a written notice with the reason and the release date, and generally limited to about five extra business days.

Availability is not finality. Funds become available on a legal schedule, while returns arrive on the paying bank's, and the two overlap. A platform that releases a merchant's or landlord's funds the moment the bank does is extending credit on every check, which [Payouts & Settlement](/docs/industries/payments/payouts-and-settlement) turns into a policy: a hold for new payers, a limit per payer, and a reserve sized to return rates.

## Returns, Fast and Slow

The ordinary return is fast. The paying bank must act by its **midnight deadline**, midnight of the banking day after it receives the check (Uniform Commercial Code 4-104, 4-301), or it's accountable for the amount (4-302). Reg CC adds that the return must reach the depositary bank by 2:00 p.m. on the second business day after presentment, and for a check of $5,000 or more, the paying bank must also send notice of nonpayment on the same clock. The reasons are coded:

| Code | Reason | Code | Reason |
| --- | --- | --- | --- |
| A | Insufficient funds | I | Endorsement missing |
| B | Uncollected funds hold | L | Signature irregular, suspected forgery |
| C | Stop payment | N | Altered or fictitious |
| D | Account closed | U | Unusable image |
| E | Unable to locate account | Y | Duplicate presentment |
| F | Frozen or blocked | Z | Forgery, affidavit available |

The slow returns are the dangerous ones. After the ordinary window, a bank that finds a check was altered or deposited twice makes a **warranty claim**, with notice within 30 days of having reason to know (Reg CC 229.34, UCC 4-208), and the drawer has a year from their statement to tell their bank a signature was forged or the check altered (UCC 4-406). The general limitation period on these claims is three years. So a check's states don't end at "cleared": it's **probably good** once the ordinary return window passes, and **final** only as a matter of policy, chosen with that tail in mind. Each claim is a reversing [ledger entry](/docs/payments/payment-states) against whatever balance the check funded, never an edit.

**Re-depositing a returned check** is allowed for insufficient or uncollected funds, but it's a new deposit, subject to a redeposit hold, and it gets one more chance at most before you ask for another way to pay. Converting it to an ACH entry (RCK, below) is the other route.

## Turning Checks Into ACH

Nacha's check conversion codes let you take the routing, account and serial number off a consumer's check and collect it as an [ACH debit](/docs/industries/payments/ach) instead of clearing the paper:

| SEC | Where the check is received | What the payer is told |
| --- | --- | --- |
| **ARC** | By mail, at a lockbox or drop box, or in person at a manned bill-payment location | Notice that the check will be converted |
| **BOC** | At a point of purchase or manned location, converted later in the back office | Notice at the counter, and a copy |
| **POP** | At the point of purchase, converted on the spot | Notice, a copy, written authorization and the voided check back |
| **RCK** | A check already returned for insufficient or uncollected funds, re-presented as ACH | Notice of the policy before the check was received |

Eligibility is narrow. A check converted under ARC or BOC must be a completed, signed consumer check for $25,000 or less, with a pre-printed serial number and a MICR line captured by a reader. Business checks, which carry the auxiliary on-us field, are out; so are third-party checks, credit card and home equity checks, money orders, cashier's checks and Treasury checks. Nacha has floated widening conversion to business checks and larger amounts, but its stated aim is to eliminate checks, not extend them.

The conversion makes the payment an electronic fund transfer, which brings [Regulation E](/docs/industries/payments/ach#consumer-law-regulation-e) and its consumer rights with it, and the notice must say the check "will or may be processed as an electronic fund transfer". You keep an image of the check's front for two years and must produce it within ten banking days of a request.

**RCK** is the conversion that matters after a bounce: a consumer check under $2,500, dated within 180 days, re-presented as an ACH entry. The total presentments are capped at three, either the check twice and one RCK, or the check once and two RCKs. The amount is the check's amount; a returned-check fee is collected separately, as [ACH & Bank Transfers](/docs/industries/payments/ach#after-a-return-fees-and-blocks) describes.

## Lockbox

A **lockbox** is a bank (or a vendor) opening your mail: payments go to a post office box the bank empties, the bank deposits the checks, and you receive a file. A **retail lockbox** handles high volumes of consumer payments with a standard coupon whose scan line holds the account number and amount; a **wholesale lockbox** handles business payments without a standard coupon, with more keying of invoice numbers. Eligible consumer checks are often converted to ARC entries on the way.

The integration is a file per deposit, as BAI2 or an X12 823 remittance, plus images of each check and its remittance slip. Match each item to an open invoice or account by the coupon's scan line first, then by amount and payer, and send everything else to an exceptions queue a person works, with the images attached. The deposit totals reconcile to the bank statement the same way [Treasury](/docs/industries/payments/treasury) reconciles everything else.

## Check Fraud

Check fraud grew while check volume fell. FinCEN, the Treasury bureau that enforces anti-money-laundering law, in its February 2023 alert on mail theft counted more than 680,000 suspicious activity reports about check fraud in 2022, nearly double the year before; its 2024 analysis found $688 million in reports over six months of 2023, with 44% of stolen checks altered and deposited. In the AFP's 2025 survey, 63% of organizations reported check fraud in 2024, more than any other payment method. The patterns a receiving platform sees:

- **Deposit and run.** Checks deposited remotely into a new account, followed by rapid withdrawal, FinCEN's first red flag. On a platform it's a new payee receiving check deposits and asking for an instant payout.
- **Altered and counterfeit checks,** harder to spot from an image than from paper.
- **Duplicate deposits** across institutions, where the indemnity above decides who pays.

**Remotely created checks** deserve their own line. A remotely created check, or demand draft, is a check created by the payee from the payer's account number, with no signature. Since 2006, Reg CC makes the depositary bank warrant that the account holder authorized it, which pushes the loss onto whoever deposited it, and the FTC's Telemarketing Sales Rule has banned them in telemarketing since 2016 ([Phone Payments](/docs/industries/payments/phone-payments)). ACH debits do the same job with clearer rules; don't offer demand drafts as a product.

## Rent and Paper

Some payers can't be moved off checks, and in rent the law sometimes protects them. In California, Civil Code 1947.3 requires a landlord to accept at least one form of payment that is neither cash nor electronic, and forbids charging extra for paying by check: a rent platform there can't go electronic-only. The same statute lets a landlord demand cash for up to three months after a check bounces, with written notice, which a platform has to model as a temporary restriction on a payer's allowed methods. Returned-check fees are capped state by state; [ACH & Bank Transfers](/docs/industries/payments/ach#after-a-return-fees-and-blocks) collects those rules, since most apply to bounced electronic payments too.

## What This Means for the System You Build

- **Validate at capture:** image quality, MICR, amount read back, endorsement present, before anything goes to the bank.
- **Detect duplicates forever,** keyed on routing, account, serial and amount, and track the paper from scanned to destroyed.
- **Model availability and finality separately,** with holds and limits sized to return rates, and late warranty claims as reversing entries.
- **Convert eligible consumer checks to ARC or BOC** where it pays, with notices and image retention, and use RCK for bounced consumer checks.
- **Lockbox files matched by scan line,** with an exceptions queue and images for everything else.
- **Payment method restrictions as data,** so a payer can be moved to certified funds or cash for a period without code changes.

## References

**Specifications**

- [12 CFR 229.2: Definitions](https://www.law.cornell.edu/cfr/text/12/229.2), substitute, electronic and remotely created checks
- [12 CFR 229.10: Next-day availability](https://www.law.cornell.edu/cfr/text/12/229.10), the $275 amount and next-day items
- [12 CFR 229.13: Exceptions](https://www.law.cornell.edu/cfr/text/12/229.13), new accounts, large deposits and the $6,725 threshold
- [12 CFR 229.31: Paying bank's responsibility for return of checks](https://www.law.cornell.edu/cfr/text/12/229.31), expeditious return and notice of nonpayment
- [12 CFR 229.34: Warranties and indemnities](https://www.law.cornell.edu/cfr/text/12/229.34), electronic check warranties, remotely created checks and the remote deposit indemnity
- [12 CFR 229.51: Substitute checks](https://www.law.cornell.edu/cfr/text/12/229.51), legal equivalence and the required legend
- [UCC 4-301](https://www.law.cornell.edu/ucc/4/4-301) and [UCC 4-406](https://www.law.cornell.edu/ucc/4/4-406), the midnight deadline and the drawer's one year to report forgery or alteration
- [12 CFR 1005.3](https://www.law.cornell.edu/cfr/text/12/1005.3), check conversion as an electronic fund transfer and the required notice
- [12 CFR 229.35: Indorsements](https://www.law.cornell.edu/cfr/text/12/229.35), bank indorsement standards for paper, substitute and electronic checks

**Reference**

- [Federal Reserve: Check 21 FAQ](https://www.federalreserve.gov/paymentsystems/regcc-faq-check21.htm), truncation, substitute checks and consumer disclosures
- [Federal Reserve: Reg CC amounts adjusted for inflation](https://www.federalreserve.gov/newsevents/pressreleases/bcreg20240513a.htm), the July 1, 2025 amounts
- [Federal Reserve: Payments study topline, 2015 to 2024](https://www.federalreserve.gov/paymentsystems/frps_cy2015_24_topline.htm), check volume and value
- [Federal Register: Fed fee schedules for 2026](https://www.govinfo.gov/content/pkg/FR-2025-12-09/html/2025-22268.htm), check service prices and the end of the foreign and Canadian check service
- [FFIEC: Risk Management of Remote Deposit Capture](https://fdic.gov/news/news/financial/2009/fil09004a.pdf), RDC risks and expected controls
- [Nacha: ACH file details](https://achdevguide.nacha.org/ach-file-details), SEC codes including ARC, BOC, POP and RCK
- [FinCEN: Alert on mail theft-related check fraud](https://www.fincen.gov/sites/default/files/shared/FinCEN%20Alert%20Mail%20Theft-Related%20Check%20Fraud%20FINAL%20508.pdf), SAR counts and red flags, February 2023
- [FinCEN: Analysis of check fraud related to mail theft](https://www.fincen.gov/news/news-releases/fincen-issues-depth-analysis-check-fraud-related-mail-theft), $688 million in six months and how stolen checks are used
- [Nacha: AFP survey on check fraud](https://www.nacha.org/news/afp-survey-businesses-may-be-misled-risks-check-fraud), 63% of organizations hit in 2024
- [California Civil Code 1947.3](https://california.public.law/codes/ca_civ_code_section_1947.3), landlords must accept a non-cash, non-electronic payment
- [Federal Reserve: Request for comment on the future of check services](https://www.federalreserve.gov/newsevents/pressreleases/other20251204b.htm), the December 2025 options, from investing to winding down

**In practice**

- [moov-io: Image cash letter file structure](https://github.com/moov-io/imagecashletter/blob/master/docs/file-structure.md), X9.100-187 record types in an open-source implementation
- [EPCOR: Check conversion quick reference](https://epcor.org/Portals/0/docs/Document-Resource.pdf), ARC, BOC, POP and RCK eligibility, notices and retention
- [Q2 Helix: Check return codes](https://docs.helix.q2.com/docs/check-return-codes), the X9 return reason codes
- [ABA Banking Journal: Restrictive endorsements on remote deposits](https://bankingjournal.aba.com/2019/04/should-we-require-restrictive-endorsements-on-remote-business-deposits/), why banks require them
