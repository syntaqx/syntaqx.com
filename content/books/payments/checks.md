+++
title = "Accepting Checks"
description = "Taking checks as payment: image clearing under Check 21, remote deposit capture, Reg CC holds, returns and late claims, conversion to ACH, lockbox and fraud."
category = "Payments Industry"
order = 1406
part = "How Money Moves"
tags = ["payments", "checks", "check-21", "remote-deposit", "reg-cc", "ach"]
+++

Checks have ACH's central problem (money available isn't money final) on an older, slower clock. They keep shrinking and refuse to disappear. Americans wrote 9.2 billion of them in 2024, worth $24.45 trillion: 4% of noncash payments by number and 17% by value, because the ones that remain are big. Business invoices, insurance premiums, medical bills, tuition, rent, and every payment from a payer who won't hand over bank details still arrive on paper. A platform that collects for businesses gets them by mail, at a front desk, or through a lockbox, and has to turn them into money and ledger entries. This chapter is about receiving checks; issuing them, with positive pay and escheatment, is in [Vendor Payouts](/books/payments/vendor-payouts).

## How a Check Clears Now

Four parties: the **drawer** who writes the check, the **payee** it's written to, the **depositary bank** the payee deposits it at, and the **paying bank** that holds the drawer's account. The paper itself barely travels anymore.

The **Check 21 Act**, in force since October 2004, made that possible. A bank can **truncate** a check, capturing its image and data and taking the paper out of the process, and send it onward as an **electronic check** under agreements with the banks downstream. If someone downstream still needs paper, the image is printed as a **substitute check**, which the industry calls an image replacement document: a reproduction of front and back, with the MICR line and the legend "This is a legal copy of your check", and it's the legal equivalent of the original. Every bank that passes one on warrants that it's accurate and that nobody will be asked to pay the same check twice. Since July 1, 2018 Regulation CC applies the same warranties to electronic checks.

Banks exchange images directly, through clearing houses, or through the Federal Reserve's FedForward and FedReturn services. The Fed's future in check is an open question: in December 2025 its Board asked for comment on whether to keep investing in check services, maintain them as they are, or significantly reduce or wind them down. Comments closed in March 2026, no strategy had been announced by October 2026, and the Board has said any proposal will go out for comment again. Its separate Foreign and Canadian Check Service is being discontinued at the end of 2026, taking its last deposits on December 4. Nothing about that changes your integration soon, but it's one more reason not to build a business that depends on checks growing.

## The Image and the MICR Line

Everything downstream reads two things: the image and the line of magnetic ink characters along the bottom.

**The MICR line** carries, from right to left, an amount field, an on-us field (the account number, and the serial number on personal checks), the nine-digit routing number between transit symbols, and on business checks an auxiliary on-us field holding the serial number. The amount field is blank when the check is printed; the first bank to process it encodes the amount. That auxiliary field matters later: its presence is how a system tells a business check from a consumer one.

**The image cash letter** is how deposits travel between banks, in the ANSI X9.100-187 format. Like a [Nacha file](/books/payments/ach#anatomy-of-a-nacha-file) it's a set of typed records: a file header (01), cash letter header (10), bundle header (20), a check detail record (25) with its addenda (26 to 28) and image view records (50, 52) for the front and back images, then bundle (70), cash letter (90) and file (99) controls. Returns use their own detail records (31 to 35). Images are typically black-and-white TIFFs. Your bank's remote deposit system usually builds the file for you; if you integrate with a bank's deposit API or run your own scanning, it's the format the bank will ask for.

## Remote Deposit Capture

Remote deposit capture (RDC) is scanning checks instead of carrying them to a bank: a desktop scanner at a front desk or back office, or a phone camera in an app. Each deposit is an image pair plus the MICR data, sent to the depositary bank, and the paper stays with you.

![A check's life after deposit: scanned and deposited on day 0; funds available by the second business day under Reg CC; returned items like insufficient funds, stop payment or a closed account come back within about two business days of presentment; after that, warranty claims for alteration or a duplicate can arrive within 30 days of discovery, and a drawer's claim of forgery or alteration up to a year after their statement.](/diagrams/check-returns.svg "A check fails in two waves. The ordinary returns come within days, often just after the bank has released the funds; the claims that a check was altered, forged or deposited twice can come months later.")

What the capture side owes the bank, and itself:

- **Image quality checks before submission.** Skew, a missing corner, two checks overlapped, too dark or too light, an image file too small to hold a real check. A check the paying bank can't read comes back as an unusable image (X9 return reason U), days later; catching it at the scanner costs a retake.
- **Both sides, read back.** The amount from the image (courtesy and legal amount) compared with what the user keyed, the MICR line parsed and validated, the payee checked against the account the deposit goes to, and the back checked for an endorsement.
- **The bank's endorsement travels in the file.** Reg CC 229.35 requires each bank that handles a check to endorse it, and for an electronic check that endorsement is data, not ink: the bank of first deposit's routing number, endorsement date and item sequence ride in the check detail addendum records, and the official commentary says a bank that captures an image before spraying an endorsement should apply it electronically. Your bank adds its own; what it needs from you is an image with the customer's endorsement visible on the back.
- **A restrictive endorsement.** "For mobile deposit only at [bank]", or whatever the bank's agreement specifies. Under Reg CC 229.34(f), a bank that takes a remote deposit and gets paid indemnifies a later bank that accepted the same paper check, unless the paper carried a restrictive endorsement inconsistent with how it was deposited. The endorsement is what puts the loss on whoever deposited it twice, not on you.
- **Duplicate detection across every deposit you've ever taken.** The same check scanned twice, by two employees, or by one customer at two locations, is the most common RDC loss. Key on routing number, account number, serial number and amount, and keep the keys forever, not for a rolling window. Duplicates at other institutions you can't see; that's what the indemnity and return reason Y (duplicate presentment) are for.
- **The paper has a lifecycle.** Mark it as processed when scanned so it can't be scanned again, keep it securely for the period your bank agreement requires, then destroy it. A drawer of uncashed originals in an office is a second deposit waiting to happen.

### Capture That Converts

Not every capture product deposits the image. A platform can also scan the check and turn it into an ACH debit, the back office conversion (BOC) [below](#turning-checks-into-ach), so the image is evidence and the payment is an ACH entry. Payabli's remote deposit capture works that way, and its documentation shows what the conversion rules do to the product:

- **Eligibility narrows to the counter.** Only consumer checks received in person at a point of sale or staffed payment location qualify. Mailed checks, drop-box checks and checks from unstaffed locations are out, and so are business, cashier's, government and insurance checks, so a platform taking mailed rent or invoice checks needs image clearing or a lockbox instead.
- **OCR, then payment, as two calls.** The front and back images go to a check processing endpoint as JPEG or PNG files under 1 MB each; it reads the MICR line, compares the courtesy and legal amounts with each other and with the amount the user entered, and fails the scan on a mismatch by default. A second call makes the payment from what it extracted.
- **Notice is part of the flow.** A posted sign at the counter and a take-away copy tell the payer the check may be converted, give a customer service number and offer a way to opt out, and the payer going ahead after notice is the authorization. Payabli tells merchants to keep the paper for a period (typically 14 days, in its words), then destroy it, and never deposit it as well.
- **The phone is a camera, not a deposit app.** In its virtual terminal, a desktop session shows a QR code, valid for about 10 minutes, that pairs one phone; the phone photographs both sides in its browser, the images never go to the photo library, and the desktop picks them up once they pass validation and finishes the payment.
- **It's switched on per merchant.** The feature needs configuration by Payabli before a merchant can use it.

The bank side is set out in the Federal Financial Institutions Examination Council's (FFIEC) guidance on RDC risk, issued in 2009: customer suitability reviews, deposit limits, multi-factor authentication, and monitoring for duplicates, velocity and limit breaches. Expect your bank to impose all of it on you, and build the limits and reports into the product so its review is a formality.

## When the Money Is Available

**Regulation CC** governs how long a bank may hold deposited checks, and its dollar amounts were adjusted for inflation on July 1, 2025. Your bank applies it to your deposits; you should apply the same thinking to the merchants you credit. The bank's side, with the full exception rules, notices and a worked timeline, is in [Funds Availability](/books/banking-and-lending/funds-availability).

- **Next business day:** cash deposited in person, electronic payments, US Treasury checks, on-us checks (drawn on the same bank they're deposited at; the MICR line's "on-us field" is a different use of the word), and in-person deposits of cashier's, certified and government checks and USPS money orders. Deposited remotely, those official checks wait until the second business day.
- **The first $275** of other check deposits on a day, by the next business day.
- **Everything else by the second business day.**
- **Exception holds** for new accounts in their first 30 days, deposits over $6,725 in a day, redeposited checks, accounts repeatedly overdrawn, and reasonable doubt that a check will be paid, each requiring a written notice with the reason and the release date, and generally limited to about five extra business days.

Availability is not finality. Funds become available on a legal schedule, while returns arrive on the paying bank's, and the two overlap. A platform that releases a merchant's funds the moment the bank does is extending credit on every check, which [Payouts & Settlement](/books/payments/payouts-and-settlement) turns into a policy: a hold for new payers, a limit per payer, and a reserve sized to return rates.

## Returns, Fast and Slow

The ordinary return is fast. The paying bank must act by its **midnight deadline**, midnight of the banking day after it receives the check (Uniform Commercial Code 4-104, 4-301), or it's accountable for the amount (4-302). Reg CC adds that the return must reach the depositary bank by 2:00 p.m. on the second business day after presentment (delivery of the check to the paying bank), and for a check of $5,000 or more, the paying bank must also send notice of nonpayment on the same clock. The reasons are coded:

| Code | Reason | Code | Reason |
| --- | --- | --- | --- |
| A | Insufficient funds | I | Endorsement missing |
| B | Uncollected funds hold | L | Signature irregular, suspected forgery |
| C | Stop payment | N | Altered or fictitious |
| D | Account closed | U | Unusable image |
| E | Unable to locate account | Y | Duplicate presentment |
| F | Frozen or blocked | Z | Forgery, affidavit available |

The slow returns are the dangerous ones. After the ordinary window, a bank that finds a check was altered or deposited twice makes a **warranty claim**, with notice within 30 days of having reason to know (Reg CC 229.34, UCC 4-208), and the drawer has a year from their statement to tell their bank a signature was forged or the check altered (UCC 4-406). The general limitation period on these claims is three years (UCC 4-111). So a check's states don't end at "cleared": it's **probably good** once the ordinary return window passes, and **final** only as a matter of policy, chosen with that tail in mind. Each claim is a reversing [ledger entry](/docs/payments/payment-states) against whatever balance the check funded, never an edit.

**Re-depositing a returned check** is allowed for insufficient or uncollected funds, but it's a new deposit, subject to a redeposit hold, and it gets one more chance at most before you ask for another way to pay. Converting it to an ACH entry (RCK, below) is the other route.

## Turning Checks Into ACH

Nacha's check conversion codes let you take the routing, account and serial number off a consumer's check and collect it as an [ACH debit](/books/payments/ach) instead of clearing the paper:

| SEC | Where the check is received | What the payer is told |
| --- | --- | --- |
| **ARC** | By mail, at a lockbox or drop box, or in person at a manned bill-payment location | Notice that the check will be converted |
| **BOC** | At a point of purchase or manned location, converted later in the back office | Notice at the counter, and a copy |
| **POP** | At the point of purchase, converted on the spot | Notice, a copy, written authorization and the voided check back |
| **RCK** | A check already returned for insufficient or uncollected funds, re-presented as ACH | Notice of the policy before the check was received |

Eligibility is narrow. A check converted under ARC or BOC must be a completed, signed consumer check for $25,000 or less, with a pre-printed serial number and a MICR line captured by a reader. Business checks, which carry the auxiliary on-us field, are out; so are third-party checks, credit card and home equity checks, money orders, cashier's checks and Treasury checks. Nacha's March 2026 comments on the Fed's check services argue that good alternatives to checks exist for almost every use, and suggest clearing the remaining volume over ACH by check truncation rather than growing check use.

The conversion makes the payment an electronic fund transfer, which brings [Regulation E](/books/payments/ach#consumer-law-regulation-e) and its consumer rights with it, and the notice must say the check "will or may be processed as an electronic fund transfer". You keep an image of the check's front for two years and must produce it within ten banking days of a request.

**RCK** is the conversion that matters after a bounce: a consumer check under $2,500, dated within 180 days, re-presented as an ACH entry. The total presentments are capped at three, either the check twice and one RCK, or the check once and two RCKs. The amount is the check's amount; a returned-check fee is collected separately, as [ACH & Bank Transfers](/books/payments/ach#after-a-return-fees-and-blocks) describes.

## Lockbox

A **lockbox** is a bank (or a vendor) opening your mail: payments go to a post office box the bank empties, the bank deposits the checks, and you receive a file. A **retail lockbox** handles high volumes of consumer payments with a standard coupon whose scan line holds the account number and amount; a **wholesale lockbox** handles business payments without a standard coupon, with more keying of invoice numbers. Eligible consumer checks are often converted to ARC entries on the way.

The integration is a file per deposit, as BAI2 (the common bank reporting format, see [Treasury & Bank Operations](/books/payments/treasury)) or an X12 823 remittance, plus images of each check and its remittance slip. Match each item to an open invoice or account by the coupon's scan line first, then by amount and payer, and send everything else to an exceptions queue a person works, with the images attached. The deposit totals reconcile to the bank statement the same way [Treasury](/books/payments/treasury) reconciles everything else.

## Check Fraud

Check fraud grew while check volume fell. FinCEN, the Treasury bureau that enforces anti-money-laundering law, in its February 2023 alert on mail theft counted more than 680,000 suspicious activity reports about check fraud in 2022, nearly double the year before; its 2024 analysis found $688 million in reports over six months of 2023, with 44% of stolen checks altered and deposited. In the AFP's 2025 survey, 63% of organizations reported check fraud in 2024, more than any other payment method. The patterns a receiving platform sees:

- **Deposit and run.** Checks deposited remotely into a new account, followed by rapid withdrawal, FinCEN's first red flag. On a platform it's a new payee receiving check deposits and asking for an instant payout.
- **Altered and counterfeit checks,** harder to spot from an image than from paper.
- **Duplicate deposits** across institutions, where the indemnity above decides who pays.

**Remotely created checks** deserve their own line. A remotely created check, or demand draft, is a check created by the payee from the payer's account number, with no signature. Since 2006, Reg CC makes the depositary bank warrant that the account holder authorized it, which pushes the loss onto whoever deposited it, and the FTC's Telemarketing Sales Rule has banned them in telemarketing since June 13, 2016 ([Phone Payments](/books/payments/phone-payments)). ACH debits do the same job with clearer rules; don't offer demand drafts as a product.

## Who Still Pays by Paper

Some payers can't be moved off checks: businesses whose accounts payable still runs on check runs, people mailing insurance premiums, medical bills or tuition from a bank account they won't share, and payers the law protects. Rent is the clearest example of the last. In California, Civil Code 1947.3 requires a landlord to accept at least one form of payment that is neither cash nor electronic, and forbids charging extra for paying by check: a rent platform there can't go electronic-only. The same statute lets a landlord demand cash for up to three months after a check bounces, with written notice, which a platform has to model as a temporary restriction on a payer's allowed methods. Returned-check fees are capped state by state; [ACH & Bank Transfers](/books/payments/ach#after-a-return-fees-and-blocks) collects those rules, since some caps cover bounced electronic payments too.

## How to Build It

A deposited check is a payment like any other in the [core data model](/books/payments/card-payments#the-core-data-model); what checks add is the item itself, with its images, its permanent duplicate key and the paper's lifecycle.

```sql
CREATE TABLE check_items (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  payment_id       UUID NOT NULL REFERENCES payments (id),
  routing_number   TEXT NOT NULL,
  account_hash     TEXT NOT NULL,          -- keyed hash of the MICR account number
  serial_number    TEXT,
  amount           BIGINT NOT NULL,
  is_business      BOOLEAN NOT NULL,       -- auxiliary on-us field present
  front_image_ref  TEXT NOT NULL,
  back_image_ref   TEXT NOT NULL,
  capture_channel  TEXT NOT NULL CHECK (capture_channel IN ('scanner', 'mobile', 'lockbox')),
  converted_as     TEXT CHECK (converted_as IN ('ARC', 'BOC', 'POP', 'RCK')),
  paper_status     TEXT NOT NULL CHECK (paper_status IN ('held', 'destroyed', 'none')),
  deposited_at     TIMESTAMPTZ NOT NULL,
  UNIQUE NULLS NOT DISTINCT (routing_number, account_hash, serial_number, amount)  -- forever
);

CREATE TABLE check_returns (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  check_item_id    UUID NOT NULL REFERENCES check_items (id),
  kind             TEXT NOT NULL CHECK (kind IN ('return', 'warranty_claim')),
  reason_code      TEXT NOT NULL,          -- X9 reason (A, C, Y ...) or the claim's basis
  amount           BIGINT NOT NULL,
  received_at      TIMESTAMPTZ NOT NULL
);
```

Each return or claim posts a reversing `ledger_transactions` row with `source_type = 'check_return'`; there can be more than one per item, because a late warranty claim can follow an ordinary return that was redeposited.

## Auditing

Checks are audited by your bank against its RDC agreement and the FFIEC's expectations, by Nacha's rules for anything converted, and by the payer who says a check was cashed twice. The general design is in [Audit Trails](/docs/architecture/audit-trails); keep:

- **Every capture attempt, not just the deposits:** who scanned, on which device and location, the image quality result, the amounts read and keyed, and any rejection, so velocity and limit reviews have the raw events.
- **Duplicate detection hits and how each was resolved,** since the permanent duplicate key is a control the bank will ask you to demonstrate, and an override is the event most worth reviewing.
- **The paper's custody:** when each item was marked processed, where it was held, and when and how it was destroyed, against the retention period your bank agreement sets.
- **Conversion evidence for ARC, BOC and RCK:** the notice version in force at the location and date, the image of the check's front for the two years the rules require, and the eligibility checks applied (consumer check, amount, serial number).
- **Holds, releases and limits:** each hold on a merchant's check funds with its reason and release date, the deposit limits in force, and every breach or override, so availability decisions can be explained to the merchant and the bank.
- **Returns and late claims** with the reason code or warranty basis, the date received and the ledger reversal they posted.

## What This Means for the System You Build

- **Validate at capture:** image quality, MICR, amount read back, endorsement present, before anything goes to the bank.
- **Detect duplicates forever,** keyed on routing, account, serial and amount, and track the paper from scanned to destroyed.
- **Model availability and finality separately,** with holds and limits sized to return rates, and late warranty claims as reversing entries.
- **Convert eligible consumer checks to ARC or BOC** where it pays, with notices and image retention, and use RCK for bounced consumer checks.
- **Lockbox files matched by scan line,** with an exceptions queue and images for everything else.
- **Payment method restrictions as data,** so a payer can be moved to certified funds or cash for a period without code changes, and the payers who must be allowed to pay by check still can.

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
- [UCC 4-111](https://www.law.cornell.edu/ucc/4/4-111), the three-year limitation period
- [12 CFR 229.35: Indorsements](https://www.law.cornell.edu/cfr/text/12/229.35), bank indorsement standards for paper, substitute and electronic checks

**Reference**

- [Federal Register: Availability of Funds and Collection of Checks (2017 final rule)](https://www.federalregister.gov/documents/2017/06/15/2017-11379/availability-of-funds-and-collection-of-checks), warranties and indemnities for electronic checks, effective July 1, 2018
- [Federal Register: Telemarketing Sales Rule (2015 final rule)](https://www.federalregister.gov/documents/2015/12/14/2015-30761/telemarketing-sales-rule), the ban on remotely created checks in telemarketing, effective June 13, 2016
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
- [Federal Reserve: Request for comment on the future of check services](https://www.federalreserve.gov/newsevents/pressreleases/other20251204b.htm), the December 2025 options, from investing to winding down, comments due 90 days after Federal Register publication on December 9, 2025, and further comment before any significant change
- [Federal Reserve Financial Services: Discontinuation of FedGlobal ACH and the Foreign and Canadian Check Services](https://frbservices.org/news/communications/112525-ach-discontinuation-fedglobal-ach-payments-foreign-canadian-check-services), the service ending by year-end 2026, with deposits accepted until December 4, 2026
- [Nacha: Comments on the future of Federal Reserve check services (PDF)](https://www.nacha.org/sites/default/files/2026-03/Nacha%20Comments%20to%20Federal%20Reserve%20on%20Future%20of%20Check%20Services%20RFI%20-%20FINAL%20-%20March%204%2C%202026.pdf), alternatives to checks and clearing the remaining volume over ACH by check truncation, March 4, 2026

**In practice**

- [Payabli: Capturing in-person checks](https://docs.payabli.com/guides/pay-in-checks-rdc-overview), remote deposit capture by back office conversion: eligible checks, image requirements, amount matching, notices and paper retention
- [Payabli: Use Remote Deposit Capture (API)](https://docs.payabli.com/guides/pay-in-developer-checks-rdc), the image processing call followed by the payment, and configuration by Payabli
- [Payabli: Capture a check with your phone](https://docs.payabli.com/guides/pay-in-portal-rdc-cross-device-capture), cross-device capture through a QR code valid for about 10 minutes
- [moov-io: Image cash letter file structure](https://github.com/moov-io/imagecashletter/blob/master/docs/file-structure.md), X9.100-187 record types in an open-source implementation
- [EPCOR: Check conversion quick reference](https://epcor.org/Portals/0/docs/Document-Resource.pdf), ARC, BOC, POP and RCK eligibility, notices and retention
- [Q2 Helix: Check return codes](https://docs.helix.q2.com/docs/check-return-codes), the X9 return reason codes
- [ABA Banking Journal: Restrictive endorsements on remote deposits](https://bankingjournal.aba.com/2019/04/should-we-require-restrictive-endorsements-on-remote-business-deposits/), why banks require them
