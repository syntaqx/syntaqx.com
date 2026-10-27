+++
title = "Payments by Vertical"
nav_title = "Payments by Vertical"
description = "What changes by industry: healthcare, government, schools, nonprofits, utilities, B2B, gyms and restaurants, with their codes, programs, laws and features."
category = "Payments Industry"
order = 1430
part = "Running a Provider"
tags = ["payments", "verticals", "healthcare", "government", "nonprofits", "merchant-category-codes"]
+++

A provider that serves vertical software doesn't serve "merchants". It serves clinics, county treasurers, school districts, food banks, water utilities, parts distributors, gyms and restaurants, through the software each of them runs on. The card and bank rails are the same for all of them. What changes is everything layered on top: which merchant category code (MCC) a merchant account carries, which network programs and interchange categories that code opens, which fees the payer may be charged, which laws attach to the money, and which product features the vertical can't live without, from eligible-item flags on a pharmacy basket to a tip added after the card has left the table.

None of that can be bolted on per customer. A provider that onboards a dental group on Monday and a city's parking authority on Tuesday needs the vertical's rules as configuration on the merchant account, checked at the moment of payment, with the evidence kept. This chapter goes vertical by vertical through what's different and what the system must do about it, then turns the differences into one data model. It builds on [Payments for Software Platforms](/books/payments/software-platforms), which gives each line of business its own merchant account with its own code, and on [Surcharging & Fees](/books/payments/surcharging-and-fees), which owns the general rules for fees the payer pays. Property management and field services have their own volumes on this site, so their sections here are short and point there. None of it is legal advice.

## The Verticals at a Glance

The table is the map; each row's section has the detail and the sources. Codes are from Visa's merchant data standards; a merchant with several lines of business has several codes, one per merchant account.

| Vertical | Typical MCCs | Network programs and categories | Law that attaches | Features the vertical needs |
| --- | --- | --- | --- | --- |
| **Healthcare** | 8011 doctors, 8021 dentists, 8062 hospitals, 8099 medical services, 5912 pharmacies | SIGIS-certified IIAS for FSA and HRA cards; Visa preauthorized health care transactions; Visa Healthcare interchange category | IRS FSA and HRA debit card guidance; HIPAA, with the section 1179 payment exemption | Eligible-item and prescription amounts in authorization, partial approval, charging the balance after insurance, payment plans |
| **Government** | 9211 court costs, 9222 fines, 9311 tax payments, 9399 government services | Visa service fee; Visa Government interchange categories | State statutes authorizing agency fees, such as California Government Code 6159 | Service fee as data, statutory amounts, card and ACH for taxes, cash and lockbox |
| **Education** | 8211 schools, 8220 colleges, 8244 business schools, 8249 vocational schools | Visa service fee; Visa Education interchange category | Truth in Lending for some tuition plans; Title IV credit balance deadlines | Installment plans, international tuition and FX, refunds of credit balances |
| **Nonprofit** | 8398 charitable organizations, 8661 religious organizations | Visa Charity interchange category | IRS written acknowledgment for gifts of $250 or more; quid pro quo disclosure above $75 | Donor-covered fees, recurring gifts, receipts by tax year, peak capacity |
| **Utilities** | 4900 utilities | Visa CPS/Utility interchange; Visa service fee since October 18, 2025 | State limits on convenience fees; utility commission rules on disconnection | Autopay against a bill, flat fees, posting dates, retail cash |
| **B2B and distribution** | By what's sold, such as 5045 computers or 5047 medical supplies | Visa Commercial Enhanced Data Program ([Interchange & Pricing](/books/payments/interchange-and-pricing#level-2-and-level-3-data)) | Surcharge rules and state law ([Surcharging & Fees](/books/payments/surcharging-and-fees)); Nacha rules for CCD ([ACH](/books/payments/ach#files-batches-and-sec-codes)) | Level 2 and 3 data, virtual card acceptance, CCD+ remittance, net terms |
| **Membership and fitness** | 7997 membership clubs | Visa trial rules ([Trials and Cancellation](/books/payments/stored-credentials#trials-and-cancellation)) | ROSCA and state automatic renewal laws ([Subscriptions](/docs/payments/subscriptions#the-law-of-automatic-renewal)); health club laws such as California Civil Code 1812.84 | Recurring billing, contract terms, cancellation by several channels |
| **Restaurants and hospitality** | 5812 restaurants, 5814 fast food, 5811 caterers, 5813 bars, 7011 lodging | Visa amount tolerances; estimated and incremental authorization | Tip and wage law is the merchant's, not the provider's | Tip adjustment, pay at the table, incremental holds |
| **Property management** | 6513 real estate agents and managers | Visa US Rent Payment Program ([Surcharging & Fees](/books/payments/surcharging-and-fees#convenience-and-service-fees)) | Landlord-tenant and trust account law ([Trust Accounting](/books/property-tech/trust-accounting)) | See the Property Tech volume |
| **Field services** | By trade | None specific | Cooling-off and financing rules ([Financing](/books/field-operations/consumer-protection#financing)) | See the Field Operations volume |

## The Code Comes First

Every difference below hangs off the merchant category code, so the code is the first decision in onboarding and the one most often made carelessly. Visa's rules make the acquirer assign the code that "most accurately describes" the business, with separate codes for separate lines of business ([One Merchant, Several Merchant Accounts](/books/payments/software-platforms#one-merchant-several-merchant-accounts)). Providers collect what they need to pick it in different ways: Payabli's boarding asks for a description of what the business sells "detailed enough for Payabli to determine the merchant's Merchant Category Code (MCC)", while Stripe's account object carries `business_profile.mcc` among an account's requirements, next to a `business_type` that includes `government_entity` (US only) and `non_profit`.

My rule: the code is a decision with a record, not a field someone typed. Store who assigned it, from what evidence, and when it changed, because every program eligibility, fee and interchange category on that account's payments depends on it, and a wrong code is a finding in every review that follows ([Auditing](#auditing)).

## Healthcare

Healthcare is the vertical where the payer's card may know what it's allowed to buy, the patient's bill isn't final until an insurer decides, and the data next to the payment is regulated.

### FSA and HSA Cards at the Counter

Health flexible spending arrangements (FSAs) and health reimbursement arrangements (HRAs) give employees a debit card that may only pay for medical care, and the IRS requires those charges to be substantiated. At a pharmacy or a big-box store, a basket mixes eligible and ineligible items, so the IRS made the merchant's checkout part of the substantiation:

- **The inventory information approval system (IIAS).** IRS Notice 2007-2, as modified by Notice 2008-104, bars health FSA and HRA debit cards after June 30, 2009 at stores with the Drug Stores and Pharmacies code unless the store participates in an IIAS (described in Notice 2006-69) or meets the **90 percent rule**: on a store-by-store basis, 90 percent of the store's gross receipts in the prior taxable year came from items that qualify as medical care. At a 90 percent store, the employer must treat every card charge as conditional, pending independent substantiation, apart from copayment matches, recurring expenses and real-time substantiation.
- **SIGIS runs the standard.** The Special Interest Group for IIAS Standards, a nonprofit formed in 2007, manages the IIAS technical standard and certifies merchants and processors. Its **Eligible Product List** is updated monthly, generally available by the 15th, and merchants supporting a SIGIS IIAS must use it to flag nationally branded items; the IRS doesn't mandate the list itself. SIGIS strongly recommends supporting the prescription amount, partial authorization and non-eligible items, because a plan that reimburses only prescriptions declines a basket that doesn't separate them.
- **The network enforces it.** Visa's rules require an acquirer processing Healthcare Auto-Substantiation transactions to be licensed and certified by SIGIS, to give the FSA and HRA BIN list only to eligible merchants, to provide an IIAS **Merchant Verification Value** to the merchant and include it in the authorization request, and to keep receipt data under SIGIS requirements; the merchant must be SIGIS-certified too.

What the system does: the point of sale sends the total, the eligible subtotal and, within it, the prescription subtotal, with the merchant's verification value; the issuer approves up to the eligible amount, and the system takes a **partial approval** for what the card covers and collects the rest on another tender ([Five Events, Not One Payment](/books/payments/card-payments#five-events-not-one-payment)). A provider that doesn't carry those fields end to end can't serve pharmacies, and one that doesn't support partial approval can't serve them well. Doctors' and dentists' offices sell services under medical codes rather than mixed baskets, so the counter flags matter most to retail; the clinic's job is an itemized receipt the plan administrator can substantiate.

### HIPAA: When a Payments Provider Signs a BAA

A payment for care is health information: a patient's name next to a cardiology practice's descriptor says something. HIPAA's business associate rules would put every processor in the chain under a business associate agreement (BAA) ([HIPAA](/docs/compliance/hipaa#the-business-associate-agreement)), except that the statute carves payments out. Section 1179 exempts an entity engaged in the activities of a financial institution, or processing payments for one, when it authorizes, processes, clears, settles, bills, transfers, reconciles or collects payments for health care or health plan premiums.

HHS drew the line in the 2013 omnibus rule: the HIPAA rules, business associate provisions included, "do not apply to banking and financial institutions with respect to the payment processing activities identified in § 1179", but a financial institution "may be a business associate where the institution performs functions above and beyond the payment processing activities", such as accounts receivable for a provider, and a business associate "need not enter into a business associate agreement with a financial institution that is solely conducting payment activities".

So the question isn't whether you're a payments company; it's which of your products touch protected health information on the provider's behalf. Authorizing and settling a card payment is inside the exemption. Patient statements with visit details, a billing portal showing procedure codes, payment plans built from claim data, or an AI assistant reading the practice's accounts receivable are the "above and beyond". My default: keep the payment product inside section 1179 by design (descriptors that name the practice group rather than the specialty, no clinical fields in payment metadata), and sign a BAA for the specific products that carry clinical data, with the PHI inventory and logging rules a BAA demands.

### Balances After Insurance, Plans and Financing

A patient's bill is final only after the insurer adjudicates the claim, which is why clinics keep a card on file. Visa has a transaction type for it: a **Preauthorized Health Care Transaction**, for which the merchant gets an order form with a description of the services, permission to charge the balance due after the insurer pays, and a time period of no more than one year. The merchant must not request authorization until it has the insurer's notice of adjudication, and the transaction date is the date it received that notice. On a card that's a merchant-initiated charge on a stored credential ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#who-started-the-payment)); store the consent's expiry and the adjudication reference with it.

The other pattern is time. **Payment plans** run by the practice are recurring or installment charges against the balance, and the [autopay against a balance](/books/payments/stored-credentials#autopay-against-a-balance) rules apply: compute at run time, cap the amount, and stop when insurance or a payment by hand clears the balance. **Financing** by a lender is a different product with its own law. The CFPB's 2023 report on medical credit cards and financing plans found that specialty medical cards and loans with deferred interest paid for almost $23 billion of health care expenses from 2018 to 2020, that patients paid $1 billion in deferred interest, and that the products are marketed through providers. A platform that offers a lender's product at checkout should keep the practice's own interest-free plan at least as visible, and keep the two in separate ledgers: a plan is the practice's receivable, a loan is the lender's.

## Government

Public agencies collect amounts they can't discount: a property tax bill, a court fine and a permit fee are set by law, so a card's cost can't come out of the price. That's why government gets its own fee rules.

- **The service fee.** Visa's rules let US merchants in specific codes charge a service fee: 4900 (utilities), 8211, 8220, 8244 and 8249 (schools), 9211 (court costs), 9222 (fines), 9311 (tax payments) and 9399 (government services), assessed by a government agency, a utility, an education merchant or a third party for any of them. The merchant must accept Visa in every channel where it takes payments, disclose the fee as a service fee before the transaction completes with a chance to cancel without penalty, never present it as Visa's, keep it a reasonable reflection of acceptance costs and, where possible, capped, assess it on the final amount, and never combine it with a surcharge or convenience fee. The amount may be "flat, fixed, banded, or ad valorem", which is why a percentage is allowed here and not in a convenience fee.
- **The rules moved in October 2025.** As of the April 2026 edition the US entry no longer requires registration with Visa, and processors describe the October 18, 2025 change: utilities (4900) were added, registration and the Merchant Verification Value were dropped, and the fee no longer has to run as a separate transaction. Integrations built for the old program ran the fee as a second transaction; a new one can carry the fee in the payment.
- **The statute sets the ceiling.** State law decides whether and how much an agency may charge. California's Government Code 6159 lets a public agency or its agent impose a fee for card or electronic payment "not to exceed the costs incurred by the agency or agent" in providing it, approved by the governing body (or the Judicial Council, for courts). The fee engine needs the statute's rule per agency, next to the network's.
- **Interchange has its own lines.** Visa's US schedule has a Government 1 category for card-not-present consumer credit at 1.55% + $0.10 across products, and CPS/Government for exempt debit at 0.65% + $0.15 capped at $2.00.

**Taxes show the whole pattern.** The IRS accepts card payments only through approved processors who charge the payer and keep the fee ("No part of the fee goes to the IRS"): as of October 2026, ACI Payments charges $2.10 on debit and 1.85% on consumer credit, and Pay1040 $2.15 and 1.75% (minimum $2.50). Paying from a bank account through IRS Direct Pay is free. A provider building for state and local tax collectors builds the same two lanes: ACH without a fee, cards with a disclosed service fee, and enough capacity for the filing deadline.

**Agencies are merchants too.** A county that takes cards is in scope for PCI DSS like any merchant ([PCI DSS](/docs/compliance/pci-dss)), and most would rather not be, which is a reason the third-party service fee model exists: the vendor runs the payment page, charges the fee and carries the scope. Agencies also still collect paper and cash: checks through a [lockbox](/books/payments/checks#lockbox), and cash through retail networks or at the counter ([Cash Payments](/books/payments/cash-payments)).

## Education

Schools collect large, lumpy amounts on a calendar: tuition at the start of a term, fees through it, and refunds when aid arrives.

- **Codes and fees.** Colleges are 8220, and K-12 schools 8211; both, with 8244 and 8249, are in Visa's US service fee list, so a school can charge a service fee on tuition. The bookstore or café under 5942 or 5814 can't, which is why they need their own merchant accounts ([Software Platforms](/books/payments/software-platforms#one-merchant-several-merchant-accounts)). Visa's consumer credit schedule also has an Education category for card-not-present transactions of $500 or more.
- **Installment plans can be credit.** The CFPB's 2023 report on school-run tuition payment plans describes schools acting as lenders, with plans that lack the common disclosures private education loans carry. In its sample, 89 percent of schools charged an enrollment or setup fee and 44 percent charged late fees, and some withheld transcripts from students behind on payments, a practice the CFPB has found illegal and abusive in some cases. A plan that only splits tuition into scheduled charges is billing; one with fees, interest or collection leverage is closer to lending. Build the first; route the second through counsel.
- **International tuition.** A student abroad pays in their own currency, through their own payment methods, and the school wants its own currency, net and identified by student. That's the [cross-border problem](/books/payments/cross-border-and-fx) with a reconciliation twist: the payment must carry the student ID through the conversion. Specialists exist for exactly this; Flywire's 2025 annual report says it serves more than 3,200 education institutions and lets payers "choose the way they pay using local payment methods".
- **Refunds of credit balances.** When federal aid credited to a student's account exceeds the term's charges, the school owes the student the difference, as soon as possible and within 14 days (counted from the first day of class if the balance arose before it). That's a payout, not a card refund: the regulation lists an EFT to the student's account, a check, or cash against a signed receipt. Route it as a [payout](/books/payments/vendor-payouts) with its own deadline, separate from refunds of card payments, which go back to the card.

## Nonprofits

Charities take payments that aren't purchases, from donors who aren't customers, with the tax receipt as the product.

- **Code and rate.** Charities are 8398 (charitable and social service organizations); 8661 is religious organizations. Visa's US schedule prices **Charity 1** for card-not-present consumer credit at 1.35% + $0.05 on every product, rewards cards included. Mastercard publishes its own schedule; check its categories rather than assume Visa's carry over. Visa's rules also exclude charitable organizations, crowdfunding merchants included, from being marketplaces or retailers on one, which matters to a giving platform that thinks of itself as a marketplace of causes.
- **Donor-covered fees aren't a surcharge, if they're optional.** Visa defines a credit card surcharge as a fee added to a credit card transaction "for the acceptance of a Credit Card". A checkbox inviting the donor to add an amount covering the charity's costs, offered for every payment method, defaulted off and received by the charity as part of the gift, is an additional donation, not a fee for paying by card. Make it mandatory, apply it only to credit cards, or keep it as the platform's revenue, and it starts to look like a surcharge or a platform fee, with [their rules](/books/payments/surcharging-and-fees). My rule: record the covered amount as its own field on the payment and include it in the gift total on the receipt.
- **Recurring giving** is a subscription: the stored-credential flags, account updater and dunning in [Stored Cards & Recurring Billing](/books/payments/stored-credentials) apply unchanged, and a monthly donor lost to an expired card is the most expensive failure a charity has.
- **The receipt.** A donor can't deduct a single contribution of $250 or more without a contemporaneous written acknowledgment: the organization's name, the amount, and a statement that no goods or services were provided, or a description and good-faith estimate of what was. Contemporaneous means received by the earlier of the date the donor files and the return's due date. Separate gifts under $250 aren't aggregated, so the trigger is per gift, though one annual statement can cover several. A payment over $75 that buys something (a gala ticket) needs a quid pro quo disclosure. The system keeps the gift, the donor and the value of any benefit, and produces receipts by tax year.
- **Employer matching** is a second payment from a different payer: the employer's program pays the charity later, against the donor's gift. Store the match as its own expected receipt linked to the original gift, so the donor sees it and the charity can reconcile it.
- **Peaks.** Giving clusters at year end and on GivingTuesday, when the US gave $4.0 billion on December 2, 2025, up 13% on 2024. Capacity, fraud rules and support staffing are planned for that day, not the average one; card testing loves a donation form, so velocity limits and bot checks on small gifts belong in the plan ([Fraud & Risk](/books/payments/fraud-and-risk)).

## Utilities

Utilities bill everyone, every month, for an amount that changes, and they're regulated monopolies that answer to a commission.

- **Code and rates.** Utilities are 4900. Visa's schedule prices **CPS/Utility** at a flat $0.75 on consumer credit card-not-present, and on exempt debit at $0.65, or $0.45 for recurring bill payments ([Interchange & Pricing](/books/payments/interchange-and-pricing#what-sets-interchange)). A flat rate on a $300 bill is why card acceptance is affordable for utilities at all.
- **Fees.** Utilities joined Visa's service fee program on October 18, 2025, so a utility may now charge a percentage service fee under the rules in [Government](#government), including on autopay. Before that, and on other networks, the tool was a flat convenience fee, usually charged by a third-party biller payment service; several states restrict convenience fees, as the annual report of Paymentus, a bill-pay provider serving utilities and government, notes. The fee engine keeps network, state and commission rules as separate inputs.
- **Autopay against a bill.** The bill amount changes, so autopay charges the balance at run time, with the cap and notice rules in [Autopay Against a Balance](/books/payments/stored-credentials#autopay-against-a-balance). Payabli's balance-driven autopay is this shape: it charges the customer's open balance on the first, fifteenth or last day of the month and skips a zero balance.
- **Disconnection isn't payments' job, but timing is.** Commissions set the notice periods and protections before a shutoff; the utility's system decides who's past due. What the payment system owes it is an exact, trustworthy time for every payment (accepted, posted, returned), delivered fast, because a payment made at 4:55 p.m. and posted tomorrow can be the difference between a disconnection and none. A returned ACH payment that reverses a "paid" status needs the same speed in the other direction.
- **Cash.** Unbanked customers pay utilities in cash at retail locations, through networks that act as the utility's agent ([Cash Payments](/books/payments/cash-payments)).

## B2B and Distribution

A distributor's payments are invoices, paid late, often by card numbers its customers' accounts payable teams type in, and each one costs far more on a commercial card.

- **Send the data.** Commercial card interchange rewards line-item data ([Level 2 and Level 3 Data](/books/payments/interchange-and-pricing#level-2-and-level-3-data)), so a B2B integration sends tax, customer code, invoice and order numbers, and line items with product and commodity codes, quantities and units, freight and duty. Payabli's documentation lists the fields by level and puts the saving "often between .30% and 1.10%". The engineering is keeping the line items consistent with the amount: Visa's enhanced-data program requires them to add up exactly.
- **Accept virtual cards.** Many buyers pay suppliers with single-use virtual cards ([Virtual Cards: Who Pays for the Rebate](/books/payments/vendor-payouts#virtual-cards-who-pays-for-the-rebate)), which arrive as a card number in an email and get keyed into a virtual terminal. The acceptance side needs a terminal that takes the invoice reference with the card, matches the payment to the invoice, and expects the amount to be exact: Visa requires a Commercial Payables transaction on a Purchasing card to clear for the authorized amount.
- **Remittance on ACH.** Business customers who pay by ACH send CCD entries with one addenda record, or CTX for many invoices ([Files, Batches and SEC Codes](/books/payments/ach#files-batches-and-sec-codes)). Parse the addenda into invoice references before anyone matches by hand.
- **Net terms.** Invoices due in 30 or 60 days mean the card on file is charged later as a merchant-initiated payment against an invoice, or the customer pays by link at the due date. If someone other than the seller extends the terms and pays the seller up front, that's lending, with its own underwriting.
- **Surcharging is where B2B starts.** Thin margins on large tickets make a credit card surcharge tempting and ACH the better steer; the rules and the state map are in [Surcharging & Fees](/books/payments/surcharging-and-fees).

## Membership and Fitness

Gyms and clubs (7997, membership clubs) live on recurring dues and churn, and they're the vertical regulators think of first when they write cancellation law.

- **Recurring billing** is most of the volume, often on ACH as well as cards: the stored-credential rules, account updater and dunning in [Stored Cards & Recurring Billing](/books/payments/stored-credentials) carry the weight.
- **Cancellation law.** The card networks' trial rules and state automatic renewal laws apply ([Trials and Cancellation](/books/payments/stored-credentials#trials-and-cancellation), [The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal)), and many states also have health club statutes. California's is an example of the shape: a health studio contract may not require payments beyond its term, the term may not exceed three years (apart from a termination notice period of up to 30 days), and the buyer may cancel in person, by email from the address on file, or by first-class mail.
- **Contracts are data.** Term, minimum, notice period, freeze rules and the cancellation channels the law allows belong on the membership record, and the billing job reads them: a membership past its legal maximum term, or a charge after a cancellation received by email, is a defect the system should make impossible.

## Restaurants and Hospitality

Restaurants and hotels charge amounts that change after the card is authorized, and the networks write tolerances for exactly that.

- **Tips and tolerances.** At a restaurant the card is authorized for the bill and captured later for the bill plus tip. Visa's rules allow the clearing amount to exceed the authorization by a set margin by merchant type: from February 21, 2026, up to 30% in the US for caterers (5811), restaurants (5812) and fast food (5814); up to 20% for bars (5813), beauty and barber shops (7230), spas (7298) and taxis (4121); up to 15% for lodging and cruise lines. Mastercard sets its own tolerances, and has changed its card-not-present restaurant tolerance more than once, so tolerances are per network and per code, as data. A tip above the tolerance needs a new authorization, or it's a chargeback waiting to happen.
- **Tip adjustment is a state.** A payment is `authorized`, then `tip_adjusted`, then captured in the batch; the adjustment records who entered it and when, and the batch close is the deadline. Visa's rules say an estimated authorization must not include tips, so the tip never goes into the hold.
- **Pay at the table.** A handheld terminal brought to the table takes the tip before authorization, so the final amount is authorized and there's nothing to adjust, and the card never leaves the guest ([Card-Present Payments](/books/payments/card-present#terminals-and-where-the-pos-sits)). It's the design that removes the tolerance problem rather than managing it.
- **Incremental authorizations for lodging.** A hotel authorizes an estimate at check-in and adds to it as the stay grows. Visa lets a merchant send an incremental authorization after an approved estimated authorization, with the same transaction identifier, when the estimate no longer covers the expected or final amount, and never for potential damage, theft or insurance ([Holds That Change Size](/docs/payments/payment-states#holds-that-change-size)). Track the running total of the holds, reverse what isn't used at checkout, and remember an incremental doesn't extend the authorization's validity window.

## Property Management

Rent is its own vertical with its own volume. The Property Tech book covers how rent is collected by every channel and the fees allowed on it, including Visa's US Rent Payment Program ([Collecting Rent](/books/property-tech/collecting-rent#convenience-fees)), why some payments must be refused after a nonpayment notice ([Payment Blocking](/books/property-tech/collecting-rent#payment-blocking)), whose money rent is on the way and the trust accounts it lands in ([Trust Accounting](/books/property-tech/trust-accounting)), and payment plans for residents behind on rent ([Payment Plans](/books/property-tech/delinquency-and-eviction#payment-plans)). What it asks of a provider is in this chapter's terms: a 6513 merchant account per landlord entity, settlement into the right trust account, and a fee engine that knows the rent program and landlord law.

## Field Services

Lawn care, pest control, HVAC and other trades bill per visit, per plan and per project, often from a driveway. The Field Operations book covers taking payment when the agreement is signed ([Taking Payment at Signing](/books/field-operations/signing-the-agreement#taking-payment-at-signing)), payments on the technician's device, offline included ([Payments in the Field](/books/field-operations/technician-app#payments-in-the-field)), autopay for service plans ([Autopay](/books/field-operations/billing-recurring-service#autopay)), retries and holding service for non-payment ([Collections & Retention](/books/field-operations/collections-and-retention#holding-service-for-non-payment)), and the sequencing rules for financing a large job ([Financing](/books/field-operations/consumer-protection#financing)). The provider's part is card-present and stored credentials on one customer, and the B2B features above for commercial work.

## How to Build It

These are deltas against [the core data model](/books/payments/card-payments#the-core-data-model) and the `merchant_accounts` table from [Software Platforms](/books/payments/software-platforms#how-to-build-it). The vertical isn't a column that switches features on; it's three things: the code, with its history, the programs a merchant account is enrolled in, with the evidence, and the amount details a vertical's rules look at on each payment.

```sql
CREATE TABLE mcc_assignments (                 -- every code an account has carried; merchant_accounts.mcc is the current one
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts (id),
  mcc                 CHAR(4) NOT NULL,
  line_of_business    TEXT NOT NULL,           -- what the account sells, in the words that justified the code
  evidence_ref        TEXT NOT NULL,           -- application, website review, license
  assigned_by         TEXT NOT NULL,
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (merchant_account_id WITH =, valid_during WITH &&)
);

CREATE TABLE program_rules (                   -- what each program allows, as effective-dated data
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  program       TEXT NOT NULL,                 -- 'visa_service_fee', 'sigis_iias', 'visa_rent', 'surcharge', ...
  network       TEXT,                          -- null for programs that aren't a network's
  allowed_mccs  CHAR(4)[] NOT NULL,
  rule          JSONB NOT NULL,                -- fee shapes, channels, card types, disclosure, tolerance
  source        TEXT NOT NULL,                 -- rule book edition and section
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (program WITH =, valid_during WITH &&)
);

CREATE TABLE program_enrollments (             -- one merchant account in one program
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts (id),
  program             TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('applied', 'active', 'suspended', 'ended')),
  identifier          TEXT,                    -- a certification or verification value, as issued
  evidence_ref        TEXT NOT NULL,           -- certificate, acquirer notice, registration letter
  approved_by         TEXT NOT NULL,
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (merchant_account_id WITH =, program WITH =, valid_during WITH &&)
);

CREATE TABLE payment_amount_details (          -- the parts of an attempt's amount a vertical's rules read
  payment_attempt_id     UUID PRIMARY KEY REFERENCES payment_attempts (id),
  healthcare_eligible    BIGINT CHECK (healthcare_eligible >= 0),  -- IIAS: flagged items
  prescription           BIGINT CHECK (prescription >= 0),         -- a subset of healthcare_eligible
  service_fee            BIGINT CHECK (service_fee >= 0),
  donor_covered_fee      BIGINT CHECK (donor_covered_fee >= 0),    -- part of the gift, not a fee
  tax                    BIGINT CHECK (tax >= 0),
  line_items             JSONB,                                    -- Level 3, summing exactly to the amount
  program_enrollment_id  UUID REFERENCES program_enrollments (id), -- the program that allowed a fee or flag
  CHECK (prescription IS NULL OR prescription <= healthcare_eligible)
);

CREATE TABLE amount_adjustments (              -- tips after authorization and incremental holds
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  payment_id        UUID NOT NULL REFERENCES payments (id),
  kind              TEXT NOT NULL CHECK (kind IN ('tip', 'incremental', 'partial_reversal')),
  amount            BIGINT NOT NULL,           -- signed
  authorized_before BIGINT NOT NULL,
  program_rule_id   UUID NOT NULL REFERENCES program_rules (id),  -- the tolerance that allowed it
  entered_by        TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE donation_acknowledgments (        -- the written acknowledgment a donor deducts against
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id           UUID NOT NULL REFERENCES merchants (id),
  customer_id           UUID NOT NULL REFERENCES customers (id),
  tax_year              SMALLINT NOT NULL,
  payment_ids           UUID[] NOT NULL,
  goods_services_value  BIGINT NOT NULL DEFAULT 0 CHECK (goods_services_value >= 0),  -- 0 states none were provided
  sent_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Three rules make the tables work:

- **Check the program at authorization, not at onboarding.** A service fee, an IIAS flag or a tip adjustment is allowed only if the merchant account's code is in the rule's `allowed_mccs` and it has an active enrollment for that program at the payment's timestamp. The payment stores the enrollment and rule it used, the same way it stores its fee schedule ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Rule changes are versions.** Visa's service fee change in October 2025 and its restaurant tolerance in February 2026 are new `program_rules` rows with their effective dates, written ahead of time ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)), never edits to the old ones.
- **Codes change with a reason.** A new `mcc_assignments` row closes the old one, and a job lists every enrollment whose program no longer allows the new code, so a reclassified merchant doesn't keep charging a fee it's lost the right to.

## Auditing

Each vertical brings its own reviewer, and each review is a query over the records above:

- **The acquirer and the networks** ask whether each merchant account's code matches what it sells, with the evidence behind the assignment, and whether every program fee or category it used was open to that code. Sample payments with a service fee, IIAS flags or a tip adjustment and trace each to its enrollment and rule version; a fee on an account with no active enrollment is a finding.
- **SIGIS and the acquirer,** for healthcare merchants, ask for the certification and the receipt data SIGIS requires to be stored, and whether the Eligible Product List in use is current.
- **Covered entities and their auditors** ask which of your products touch protected health information, which are inside the section 1179 exemption, and where the BAA covers the rest. Keep the product inventory, the BAA list and the logging rules as one document.
- **Agencies and their auditors** ask whether service fees stayed within the statute and the governing body's approval, with the configured fee stored beside the charged one ([Surcharging & Fees](/books/payments/surcharging-and-fees#auditing)).
- **Schools** need proof that credit balance payouts met the 14-day deadline, from the date the balance arose to the payout's settlement.
- **Charities** need every acknowledgment reproducible: the gifts it covered, the benefit value and when it was sent.
- **Restaurants and hotels** need every adjustment explainable: authorized amount, final amount, the tolerance rule that allowed the difference, and who entered it.

## What This Means for the System You Build

- **Treat the MCC as the first decision in onboarding,** with its evidence and history, because every program, fee and interchange category on the account depends on it.
- **Keep network programs, statutes and tolerances as effective-dated data,** and check enrollment and code at authorization, storing the rule each payment used.
- **Carry vertical amounts end to end:** eligible and prescription subtotals for IIAS, service fees, donor-covered amounts, tips, tax and line items, with partial approval where the vertical needs it.
- **Keep the payment product inside HIPAA's payment exemption** by design, and sign BAAs only for the products that carry clinical data.
- **Give government, schools and utilities the service fee model** and the ACH lane beside it, and plan capacity for their deadlines.
- **Route education credit balances and similar obligations as payouts with deadlines,** not as card refunds.
- **Make donor-covered fees optional, method-neutral and part of the gift,** and produce tax-year acknowledgments from the ledger.
- **Model tips and incremental holds as adjustments with tolerances,** and prefer pay at the table where the vertical allows it.
- **Link to the vertical volumes instead of rebuilding them:** rent and field service payments carry their industries' law with them.

## References

**Specifications**

- [Visa Core Rules and Visa Product and Service Rules, 18 April 2026 (PDF)](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), service fee requirements and Table 5-6 permitted MCCs and Table 5-7 US entities (5.5.3.1), Healthcare Auto-Substantiation and SIGIS certification with the IIAS Merchant Verification Value (5.8.14.2, 5.8.14.3), Preauthorized Health Care Transactions and their transaction date (5.8.14.1, 7.6.1.1), estimated and incremental authorizations excluding tips, damage and insurance, and incrementals not extending the processing timeframes (5.7.2.4, 5.7.2.5), the US Rent Payment Program, Table 7-10 permitted variations between authorization and clearing amounts, the marketplace exclusion for charitable organizations, and the definitions of credit card surcharge, convenience fee and service fee
- [Visa: Visa USA Interchange Reimbursement Fees, 24 October 2026 (PDF)](https://usa.visa.com/content/dam/VCOM/download/merchants/visa-usa-interchange-reimbursement-fees.pdf), Charity 1 at 1.35% + $0.05, Government 1 at 1.55% + $0.10, CPS/Utility at $0.75, CPS/Utility debit at $0.65 and $0.45 recurring, CPS/Government debit at 0.65% + $0.15 capped at $2.00, Education and Healthcare categories for transactions of $500 or more, and the incentive exclusions
- [Visa: Merchant Data Standards Manual (PDF)](https://usa.visa.com/dam/VCOM/download/merchants/visa-merchant-data-standards-manual.pdf), the MCC definitions in the summary table
- [IRS: Notice 2008-104 (PDF)](https://www.irs.gov/pub/irs-drop/n-08-104.pdf), the IIAS and 90 percent rule from Notice 2007-2, conditional treatment of charges at 90 percent stores, and the June 30, 2009 deadline
- [Cornell LII: 42 U.S.C. § 1320d-8](https://www.law.cornell.edu/uscode/text/42/1320d-8), HIPAA section 1179's exemption for financial institutions processing payments for health care and premiums
- [HHS: Modifications to the HIPAA Privacy, Security, Enforcement, and Breach Notification Rules, 78 Fed. Reg. 5566 (January 25, 2013)](https://www.govinfo.gov/content/pkg/FR-2013-01-25/html/2013-01073.htm), financial institutions outside the business associate provisions for section 1179 activities, "above and beyond" functions such as accounts receivable, and no BAA needed for payment activities alone
- [California Government Code § 6159](https://california.public.law/codes/government_code_section_6159), agency fees for card and electronic payment capped at the costs incurred, and their approval
- [eCFR via Cornell LII: 34 CFR 668.164](https://www.law.cornell.edu/cfr/text/34/668.164), Title IV credit balances paid within 14 days and the direct payment methods
- [California Civil Code § 1812.84](https://california.public.law/codes/civil_code_section_1812.84), the three-year health studio term, payments within the term, the 30-day notice exception and cancellation channels

**Reference**

- [SIGIS: About us](https://sig-is.org/about-us), a nonprofit formed in 2007 to manage the IIAS standard, and certification of merchants, servicers and networks
- [SIGIS: Eligible Product List](https://sig-is.org/eligible-product-list), the list's purpose, mandatory use for SIGIS IIAS merchants, and monthly updates available by the 15th
- [SIGIS: Member FAQ](https://sig-is.org/resources/faq/members), the IRS not mandating the list, and the recommendation to support the prescription amount, partial authorization and non-eligible items
- [CFPB: Report highlights costly credit cards and loans pushed on patients](https://www.consumerfinance.gov/about-us/newsroom/cfpb-report-highlights-costly-credit-cards-and-loans-pushed-on-patients), May 4, 2023: almost $23 billion of health care expenses on deferred-interest products from 2018 to 2020, $1 billion in deferred interest, and marketing through providers
- [CFPB: Report finds college tuition payment plans can put student borrowers at risk](https://www.consumerfinance.gov/about-us/newsroom/cfpb-report-finds-college-tuition-payment-plans-can-put-student-borrowers-at-risk), September 14, 2023: schools as lenders without private education loans' common disclosures, enrollment fees at 89 percent and late fees at 44 percent of sampled schools, and transcript withholding
- [IRS: Pay your taxes by debit or credit card or digital wallet](https://www.irs.gov/payments/pay-your-taxes-by-debit-or-credit-card), the approved processors, their fees, and no part of the fee going to the IRS
- [IRS: Payments](https://www.irs.gov/payments), Direct Pay from a bank account, free
- [IRS: Publication 1771 (Rev. 11-2023, PDF)](https://www.irs.gov/pub/irs-pdf/p1771.pdf), the $250 written acknowledgment, its contents, the contemporaneous deadline, no aggregation of separate gifts, and the quid pro quo disclosure above $75
- [IRS: Charitable contributions, written acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments), the required statements
- [GivingTuesday: 2025 results](https://www.givingtuesday.org/blog/2025-results), $4.0 billion donated in the US, up 13% on 2024

**In practice**

- [ACI Worldwide: Visa service fee update for utilities](https://www.aciworldwide.com/blog/visa-service-fee-update-utilities), utilities in MCC 4900 in Visa's service fee program from October 18, 2025, with variable fees and autopay
- [TSG: Visa expands service fee eligibility and simplifies rules](https://tsgpayments.com/visa-expands-service-fee-eligibility-and-simplifies-rules/), the October 18, 2025 change: utilities added, no registration, no Merchant Verification Value, no separate transaction
- [Flywire: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1580560/000119312526067540/flyw-20251231.htm), more than 3,200 education institutions, more than 150 health systems, and local payment methods for international payers
- [Paymentus: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1841156/000119312526064510/pay-20251231.htm), billers in utilities, government and other non-discretionary services, and state guidance or prohibitions on convenience fees
- [Toast: Mastercard tip tolerance for card-not-present restaurants](https://support.toasttab.com/en/article/MasterCard-20-Tip-Tolerance-Reinstated-for-Card-not-present-Restaurants), Mastercard's reinstated restaurant tip tolerance for card-not-present orders at MCCs 5812 and 5814, with the excess chargeable for no authorization
- [Payabli: KYC fields](https://docs.payabli.com/guides/pay-ops-boarding-kyc-fields-overview), a business description detailed enough to determine the MCC
- [Payabli: Level II and level III processing](https://docs.payabli.com/guides/pay-in-transactions-l2-l3-overview), the fields by level and the stated saving of .30% to 1.10%
- [Payabli: Autopays overview](https://docs.payabli.com/guides/pay-in-autopays-overview), balance-driven autopay on the first, fifteenth or last day of the month, skipping a zero balance
- [Stripe: The Account object](https://docs.stripe.com/api/accounts/object), `business_profile.mcc` among an account's requirements, and `business_type` values including `government_entity` and `non_profit`
