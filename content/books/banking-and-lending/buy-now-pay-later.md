+++
title = "Buy Now, Pay Later"
description = "BNPL as credit: pay-in-4 and monthly loans, merchant-funded economics, Regulation Z's four-installment line, the withdrawn CFPB rule, state and UK law."
category = "Banking & Lending Industry"
order = 2438
part = "Lending Products"
tags = ["banking", "lending", "bnpl", "point-of-sale-financing", "regulation-z", "uk-fca"]
+++

Buy now, pay later is a consumer loan sold as a payment method. At checkout the shopper picks it beside cards, a lender approves them in seconds on a soft credit check, the merchant is paid the order total less a fee that's several times card pricing, and the shopper repays the lender in installments, often four payments two weeks apart at no interest. US BNPL lenders originated about $156.7 billion in 2025, half of it in that interest-free pay-in-4 form and the rest in longer installment loans, many of them interest-bearing. The industry grew up largely outside Regulation Z because of one line in the definition of a creditor, the CFPB's 2024 attempt to bring it inside was withdrawn in 2025, New York has passed its own licensing law, and the UK brought interest-free BNPL into regulation on July 15, 2026.

This chapter covers the credit product and its law: the products and the lenders, the merchant-funded economics with worked numbers, why pay-in-4 sat outside Regulation Z and what the withdrawn interpretive rule would have required, the state laws, and the UK's Deferred Payment Credit regime. How a store offers BNPL beside cards, its authorization and capture windows and refunds through the lender are the Commerce volume's [BNPL at Checkout](/books/commerce/taking-payment#bnpl-at-checkout), and the payment method's place among the others is the Payments volume's [Buy Now, Pay Later](/books/payments/wallets-and-local-methods#buy-now-pay-later). The same pay-in-4 and installment products offered at a medical practice are in Health Tech's [Patient Financing](/books/health-tech/patient-payments#patient-financing), and the statements and collections around the bill in its [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience). Longer installment loans use the arithmetic in [Personal & Installment Loans](/books/banking-and-lending/installment-loans#worked-numbers-an-amortization-schedule), and the revenue mix of the largest lender is in [The Lending Business](/books/banking-and-lending/lending-business#three-ways-to-earn-from-a-loan).

## How the Platforms Do It

As of October 2026, from the Federal Reserve's estimates of 2025 US issuance and the lenders' filings and terms:

| Lender | 2025 US issuance | Products | Lender of record and terms |
| --- | --- | --- | --- |
| **Afterpay (Block)** | $53.7 billion ($30.0 billion pay-in-4) | Pay in 4, Pay Monthly (3, 6, 12 or 24 months), post-purchase installments | Pays merchants upfront less a percentage fee and bears the non-payment risk; no fees on Pay in 4 if paid on time; Pay Monthly has no late fees, no compounding and a cap on total interest |
| **Affirm** | $41.3 billion ($6.3 billion pay-in-4) | Pay-in-X, 0% APR monthly, interest-bearing monthly (70% of fiscal 2026 GMV) | Celtic Bank and Lead Bank originate substantially all US loans, at rates up to 36%; simple interest only; $0 late fees since founding |
| **PayPal** | $26.5 billion ($25.2 billion pay-in-4) | Pay in 4 ($10 to $2,000), Pay Monthly ($49 to $10,000) | Pay in 4 by PayPal, no interest or late fees, not offered in Missouri; Pay Monthly by WebBank at 0% to 35.99% APR over 3 to 24 months |
| **Klarna** | $23.9 billion ($7.0 billion pay-in-4) | Pay in 4, Pay in 30, Fair Financing (longer interest-bearing loans) | About 90% of funding from consumer deposits, plus forward flow; Q2 2026 GMV of $36.6 billion worldwide, provisions 0.52% of GMV |
| **Zip** | $7.3 billion ($5.9 billion pay-in-4) | Pay in 4, longer installments | |
| **Sezzle** | $3.9 billion, all pay-in-4 | Pay in 4 | |

Three things stand out. **Pay-in-4 is concentrated:** Afterpay and PayPal hold about 70% of US pay-in-4 volume. **The biggest lenders are mostly installment lenders:** Affirm and Block account for over 90% of the interest-bearing BNPL loans, and Affirm's interest-bearing loans are 70% of its volume, so "BNPL" at the largest firm is largely a point-of-sale personal loan. **The lender of record varies by product at the same brand:** PayPal lends Pay in 4 itself and Pay Monthly through WebBank, and Affirm's loans are made by partner banks, which decides which state rate and licensing laws apply ([Banks, Nonbanks and Partners](/books/banking-and-lending/lending-business#banks-nonbanks-and-partners)).

## The Products

The Federal Reserve's 2026 survey of the market sorts BNPL into three products by term:

- **Pay-in-4:** interest-free, split into up to four payments, the first at checkout and the rest every two weeks. $78.3 billion in 2025, half of US issuance. The CFPB's six-lender sample averaged $135 a loan in 2023 (in 2024 dollars), with users taking 6.3 loans a year from each lender.
- **Other short-term loans:** a single payment or installments due within about 30 days, like Klarna's Pay in 30. $31.2 billion in 2025.
- **Longer-term installment loans:** over 30 days, monthly payments, the first usually due 30 days after purchase, at 0% APR or interest-bearing. $47.1 billion in 2025. Affirm's go up to $30,000, at APRs up to 36%, for up to five years.

About 63% of 2025 issuance ($98.7 billion) carried a 0% APR, down from a peak of 83% in 2020 and 2021 as the longer interest-bearing products grew. Most approvals use a soft inquiry. Lenders are also moving off the single purchase: Afterpay's post-purchase installments convert a completed purchase into installments for a flat finance fee that depends on the borrower's state, and BNPL cards and memberships put the product in a wallet rather than a checkout.

For the system, each product is a separate `products` row with its own schedule rule, fee rules and legal regime, even when the brand and the checkout button are the same: a pay-in-4 loan and a 12-month interest-bearing loan at one lender differ in disclosures, rate caps, state licensing and, in the UK, whether they're regulated at all.

## The Merchant-Funded Model

A card issuer earns interchange from the merchant and interest from the cardholder; a pay-in-4 lender earns almost everything from the merchant. BNPL merchant fees run about 5% to 8% of the purchase against 2% to 3% for cards, and lenders justify them as a conversion and basket-size tool: Affirm's 10-K says it earns a fee "when we help them convert a sale," that it earns larger merchant fees on 0% APR products, and that merchants can choose to subsidize the rates their customers pay. The lender pays the merchant upfront (Afterpay pays the full order less its fee) and owns the credit risk from then on.

What the lender earns from the borrower is small on pay-in-4. In the CFPB's sample, four of six lenders charged late fees; 4.1% of 2023 loans were assessed one, the average late fee assessed was $9.99 and the average collected $5.87, and late fees collected were 0.18% of volume. Charge-offs were 1.83% of loans and 0.92% of volume in 2023. Affirm, PayPal and Afterpay's Pay Monthly charge no late fees at all.

The 0% monthly loan is where the merchant pays for credit directly: the merchant gives up a larger discount so the borrower pays no interest, which makes 0% financing the merchant's marketing expense rather than the lender's lost yield.

## Worked Numbers: Two Loans

**A $400 pay-in-4 order at a 6% merchant fee.** The shopper pays $100 at checkout and $100 on days 14, 28 and 42. The lender pays the merchant $376 ($400 less the $24 fee) and collects the first $100 at once, so it has $276 outstanding for two weeks, $176 for the next two and $76 for the last two: an average of $176 over 42 days.

- **Gross yield:** $24 on an average $176 for 42 days is 13.6% for the period, or about **118% annualized**. That's why a 0% loan can be a good business.
- **Expected loss:** at the CFPB sample's 0.92% of volume, $3.68 of the $400 order charges off on average, about 15% of the fee.
- **What's left** pays for processing the four payments, collections, funding the $176 for six weeks, customer service and fraud. Late fees add little: at 0.18% of volume, about 72 cents per $400 order.
- **A partial refund:** if the shopper returns a $100 item after the first payment, the merchant refunds the lender (whether its fee on the refunded part comes back depends on its agreement), and the lender reduces the remaining $300 to $200, either by shrinking the three remaining installments to $66.67, $66.67 and $66.66 or by cancelling the last one. The rule is the lender's terms, and the schedule engine applies it as a new schedule version, not an edit ([BNPL at Checkout](/books/commerce/taking-payment#bnpl-at-checkout) covers the merchant side).

**A $1,200 purchase at 0% APR over 12 months.** The borrower pays $100 a month. Suppose the lender needs a 15% annual return on this credit tier. Twelve payments of $100 discounted at 1.25% a month are worth **$1,107.93** today, so the lender can pay the merchant at most $1,107.93 and earn its 15%: the merchant's subsidy is **$92.07**, 7.7% of the sale, on top of any standard fee. A 24-month 0% plan would cost the merchant much more. The pricing engine computes the merchant's discount from the lender's required yield, the term and the funding cost on the day of the offer, so a merchant's 0% promotion is priced like a loan and the discount is stored with the loan.

Klarna's change of accounting shows where the economics land in the books: from the second half of 2026, it measures new US and German Fair Financing loans at fair value, which moves income from interest over the loan's life to an upfront gain and takes provisions out of transaction costs, lowering reported revenue by about 10 bps of volume with an offsetting cost reduction ([Amortized Cost or Fair Value](/books/banking-and-lending/lending-business#amortized-cost-or-fair-value)).

## Why Pay-in-4 Sat Outside Regulation Z

Regulation Z's disclosures, billing error rights and most of its other protections apply to a "creditor," defined as a person who regularly extends consumer credit that "is subject to a finance charge or is payable by written agreement in more than four installments (not including a down payment)," where regularly means more than 25 times in the preceding calendar year (12 CFR 1026.2(a)(17)). A pay-in-4 loan has no finance charge and four installments, the first of which can be treated as a down payment. So a lender with no interest, no fees treated as finance charges and no more than four payments falls outside the closed-end TILA rules, and the product's shape (four, not five, and no interest) is partly a legal design. A monthly installment loan with interest is ordinary closed-end credit and gets the full federal box ([The Product and Its Disclosures](/books/banking-and-lending/installment-loans#the-product-and-its-disclosures)).

**The 2024 interpretive rule.** On May 31, 2024 the CFPB published an interpretive rule, applicable July 30, 2024, concluding that the digital user accounts BNPL lenders give consumers to obtain repeated loans (through apps, websites, browser extensions and merchant integrations) are "credit cards" under Regulation Z, that the lenders issuing them are card issuers, and that they're creditors for subpart B's open-end rules under a separate prong of the definition (1026.2(a)(17)(iii)), which reaches card issuers whose credit has no finance charge and isn't payable in more than four installments (89 FR 47068). The practical consequences would have been:

- **Billing error resolution** under 1026.13: a borrower disputing a charge or a non-delivery could have the lender investigate on the Regulation Z clock, with the disputed amount suspended meanwhile.
- **Unauthorized use** limits under 1026.12.
- **Subpart B's refund provisions and its account disclosures** (1026.6 to 1026.9), which the CFPB described, with billing disputes, as the most important consequences.

**The withdrawal.** On May 12, 2025 the CFPB withdrew 67 guidance documents, the BNPL interpretive rule first among the interpretive rules, saying the withdrawal "is not necessarily final" and that withdrawn guidance won't be enforced or relied on while it reviews them (90 FR 20084). As of October 2026 I found no replacement rulemaking. Federal law therefore treats pay-in-4 as it did before 2024: outside Regulation Z's closed-end disclosures and with no federal billing error rights, though still subject to the Equal Credit Opportunity Act, the Fair Credit Reporting Act when a report is used, federal unfair, deceptive or abusive practices law, and the Electronic Fund Transfer Act for the autopay debits.

For the system, the line is checked per loan, not per brand: an installment count above four, a fee that's a finance charge, or a product change that adds interest moves a loan into Regulation Z, and the product definition has to fail validation if a configuration crosses it without its disclosures.

## State Laws

With the federal rule gone, states regulate BNPL through their lending and licensing laws and, increasingly, BNPL-specific statutes:

- **New York's Buy-Now-Pay-Later Act** (Banking Law Article 14-B, sections 735 to 749, enacted in the state's fiscal 2026 budget in 2025) requires a license from the Department of Financial Services and directs it to set maximum interest, charges and fees; the law takes effect 180 days after DFS adopts its rules. DFS proposed those rules (a new 3 NYCRR Part 423) on July 15, 2026, with comments due September 14, 2026: a license plus a "category permission" for interest-free loans, interest-bearing loans or both; capital and a surety bond; penalty fees capped at $8 unless DFS approves a higher cost-based fee, cumulative fees no more than the amount financed, and no prepayment fees; interest capped at New York's General Obligations Law rate; disclosures before the transaction, a confirmation within one business day and periodic statements; billing error procedures and a $50 limit on liability for unauthorized use; risk-based underwriting of income and debts; and separate, revocable consent for each use of the consumer's data. Existing lenders would have 45 days after the effective date to apply. As of October 2026 the rule hasn't been adopted.
- **Illinois** enacted a Buy-Now-Pay-Later Loan Consumer Protection Act (SB 3561), which Affirm's fiscal 2026 10-K lists among the laws it's monitoring. <!-- source-gap: illinois-bnpl-act | secondary | the Illinois BNPL Loan Consumer Protection Act (SB 3561): public act number, effective date and main requirements | closes with: the Illinois General Assembly bill status page or the IDFPR's implementation notice | checked: 2026-10-29 --> I haven't read the Illinois act itself, so its terms aren't summarized here.
- **Elsewhere**, a BNPL loan is consumer credit under each state's lending law: a nonbank lender holds consumer lending licenses where they're required, or a partner bank makes the loan and exports its home-state rate, as Affirm's Celtic Bank and Lead Bank do at up to 36%. [APR, Finance Charges & Rate Caps](/books/banking-and-lending/apr-and-rate-caps) and [Lender Licensing & Bank Partnerships](/books/banking-and-lending/lender-licensing) cover both.

The New York proposal is close to the 2024 federal interpretive rule in effect (statements, billing errors, unauthorized use limits) plus things the federal rule never had (a fee cap, underwriting and data consent), so a lender that builds for New York builds most of what a federal rule would have required.

## The UK: Deferred Payment Credit

The UK brought interest-free BNPL into regulation on **July 15, 2026** ("Regulation Day"). Deferred Payment Credit is interest-free credit to buy goods or services, repayable in 12 or fewer instalments within 12 months, offered by a third-party lender; the government's legislation (the Financial Services and Markets Act 2000 (Regulated Activities etc.) (Amendment) Order 2025, made July 14, 2025) brought it into the FCA's remit, and a second order kept every merchant that brokers DPC agreements exempt. Merchants that lend their own DPC stay outside the regime. The FCA's final rules are in PS26/1 (February 2026):

- **Creditworthiness:** lenders apply the existing principles-based rules in CONC 5.2A to every DPC agreement, proportionately.
- **Key product information** given prominently before the agreement, including the cash price, what happens and what it costs if a payment is missed, the risk to the borrower's credit rating, and whether the lender will (or, where it doesn't know, may) check a credit reference agency.
- **Arrears and forbearance:** support for borrowers approaching or in financial difficulty, with notices when a payment is missed or before certain actions.
- **Complaints:** the FCA's complaints rules apply and the Financial Ombudsman Service has compulsory jurisdiction; the Financial Services Compensation Scheme does not cover DPC.
- **Authorisation:** the notification window for the temporary permissions regime opened on May 15, 2026; a firm without permission that didn't register can't enter new DPC agreements after Regulation Day, and doing so is a criminal offence. Agreements made before Regulation Day stay unregulated and can still be serviced.
- **Credit reporting:** where DPC is reported to credit reference agencies it's recorded under a separate account type, so lenders and scores can treat it differently from other credit.

For the system, the UK regime is a property of each agreement fixed at its creation: a loan entered on July 14, 2026 is unregulated for life, and one entered on July 15 carries a creditworthiness record, key product information as delivered, forbearance obligations and an ombudsman-ready complaint file.

US furnishing of BNPL loans to the bureaus, and how scoring models treat them, is covered in [Furnishing Credit Data](/books/banking-and-lending/credit-reporting).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). A BNPL loan is an `accounts` row (`account_kind = 'loan'`, `institution_id` the lender of record, which may be a partner bank) with a `loans` row (`amortization = 'level_payment'`, `annual_rate` zero for 0% products), a `payment_schedules` version whose `schedule_installments` carry the biweekly or monthly due dates, `loan_payments` from autopay, `credit_decisions` for each approval, and `disclosures` for whatever the product's regime requires. The Commerce volume's `order_payments` row with `method = 'bnpl'` is the merchant's side of the same transaction: its authorization maps to this book's approved application, its capture to the loan's funding, and its refunds to plan adjustments here. This chapter adds the point-of-sale terms, merchant agreements, merchant settlements, plan adjustments and the per-agreement regime.

```sql
CREATE TABLE bnpl_merchant_agreements (       -- versioned: what a merchant pays and what it promotes
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_party_id    UUID NOT NULL REFERENCES parties (id),
  version              INT NOT NULL,
  fee_bps              INT NOT NULL,           -- the standard merchant discount
  fee_fixed            BIGINT NOT NULL DEFAULT 0,
  fee_refundable_on_return BOOLEAN NOT NULL,
  promotions           JSONB NOT NULL DEFAULT '[]',  -- 0% terms the merchant funds, by term and amount band
  effective_from       DATE NOT NULL,
  effective_to         DATE,
  UNIQUE (merchant_party_id, version)
);

CREATE TABLE pos_financing_terms (            -- the point-of-sale facts of one BNPL loan
  account_id           UUID PRIMARY KEY REFERENCES accounts (id),
  merchant_party_id    UUID NOT NULL REFERENCES parties (id),
  agreement_id         UUID NOT NULL REFERENCES bnpl_merchant_agreements (id),
  order_ref            TEXT NOT NULL,          -- the merchant's order or the Commerce order_payments ID
  product_kind         TEXT NOT NULL CHECK (product_kind IN ('pay_in_4', 'short_term',
                         'monthly_zero_apr', 'monthly_interest', 'post_purchase')),
  purchase_amount      BIGINT NOT NULL,
  down_payment         BIGINT NOT NULL DEFAULT 0,  -- the installment due at checkout
  installment_count    SMALLINT NOT NULL,
  frequency            TEXT NOT NULL CHECK (frequency IN ('biweekly', 'monthly', 'single')),
  finance_charge       BIGINT NOT NULL DEFAULT 0,
  merchant_fee         BIGINT NOT NULL,
  merchant_subsidy     BIGINT NOT NULL DEFAULT 0,  -- the extra discount funding a 0% promotion
  required_yield_bps   INT,                    -- the yield the subsidy was priced to
  authorized_amount    BIGINT NOT NULL,
  authorization_expires_at TIMESTAMPTZ NOT NULL,
  captured_amount      BIGINT NOT NULL DEFAULT 0,
  CHECK (product_kind NOT IN ('pay_in_4', 'short_term')
         OR (finance_charge = 0 AND installment_count <= 4))   -- outside Reg Z only inside this line
);

CREATE TABLE merchant_settlements (           -- what the lender paid the merchant, net of fees
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('capture', 'refund', 'fee_return', 'chargeback')),
  gross_amount         BIGINT NOT NULL,        -- positive to the merchant, negative from it
  fee_amount           BIGINT NOT NULL,
  net_amount           BIGINT NOT NULL,
  payout_ref           TEXT,                   -- the Payments volume's payout, if batched
  journal_entry_id     UUID NOT NULL REFERENCES journal_entries (id),
  settled_at           TIMESTAMPTZ NOT NULL
);

CREATE TABLE plan_adjustments (               -- returns, cancellations and price changes after purchase
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('partial_refund', 'full_refund', 'cancellation',
                         'price_adjustment', 'dispute_credit')),
  amount               BIGINT NOT NULL,
  method               TEXT NOT NULL CHECK (method IN ('reduce_remaining_evenly', 'cancel_last',
                         'refund_paid', 'credit_balance')),
  prior_schedule_id    UUID NOT NULL REFERENCES payment_schedules (id),
  new_schedule_id      UUID REFERENCES payment_schedules (id),
  refund_to_borrower   BIGINT NOT NULL DEFAULT 0,  -- when paid installments exceed the new total
  merchant_settlement_id UUID REFERENCES merchant_settlements (id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credit_regimes (                 -- the legal regime of each agreement, fixed at creation
  account_id           UUID PRIMARY KEY REFERENCES accounts (id),
  jurisdiction         TEXT NOT NULL,          -- 'US-NY', 'US-CA', 'GB', ...
  regime               TEXT NOT NULL CHECK (regime IN ('us_reg_z_closed_end', 'us_outside_reg_z',
                         'ny_article_14b', 'uk_dpc_regulated', 'uk_dpc_pre_regulation',
                         'uk_regulated_credit', 'other')),
  license_ref          TEXT,                   -- the license or partner bank it was made under
  creditworthiness_ref TEXT,                   -- UK CONC 5.2A or NY underwriting record
  key_information_disclosure_id UUID REFERENCES disclosures (id),
  entered_at           TIMESTAMPTZ NOT NULL,
  rule_version         TEXT NOT NULL
);
```

The checkout approval and the loan are separate records: the approval is an `applications` row and a `credit_decisions` row with the amount, valid until the authorization expires; the loan is created at capture, for the captured amount, so a partial shipment funds a smaller loan and an expired authorization never becomes debt. The `pos_financing_terms` check is the four-installment line written into the schema: a pay-in-4 or short-term loan with a finance charge or more than four installments can't be inserted, and the product configuration has to declare it as closed-end credit with its disclosures. A return writes a `plan_adjustments` row and a new `payment_schedules` version, and the payment allocations already made stay as they were ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)). The merchant's fee, subsidy and settlement post as journal entries at capture, and `merchant_settlements` reconciles to the merchant payouts in [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation). `credit_regimes` is written once, in the same transaction that creates the loan, from the borrower's jurisdiction, the lender of record and the time of entry, because July 14 and July 15, 2026 are different products in the UK and every later rule (forbearance, complaints, fee caps) reads it.

## Auditing

BNPL lenders are examined as consumer lenders by states, partner banks and, in the UK, the FCA; the general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **The approval and the loan separately:** what was approved, for how much and until when, and what was captured.
- **The product's regime per agreement,** with the license or partner bank, and the evidence that a pay-in-4 product stayed within four installments and no finance charge.
- **Every schedule version** with the refund, cancellation or adjustment that created it.
- **The merchant's agreement version, fee, subsidy and settlement** for every loan.
- **Every fee assessed, waived and collected,** tested against the caps of the borrower's state.
- **For UK DPC from July 15, 2026:** the creditworthiness assessment, the key product information as delivered, arrears notices and forbearance offered, and complaints.

## What This Means for the System You Build

- **Model each BNPL product separately,** with its own schedule rule, fees and legal regime, even under one brand.
- **Write the four-installment line into the product configuration and the schema,** so no configuration slips into Regulation Z without its disclosures.
- **Create the loan at capture, not at approval,** for the captured amount.
- **Price merchant-funded 0% promotions as loans** and store the subsidy and the yield it was priced to.
- **Treat refunds as plan adjustments with new schedule versions,** never edits to the old one.
- **Fix the regime on each agreement at creation** and let every later rule read it.
- **Build for New York's proposed rule and the UK regime now:** statements, billing errors, unauthorized use limits, underwriting records and fee caps cover most of what any future US rule would ask.

## References

**Law and regulation**

- [CFPB: Regulation Z § 1026.2, definitions](https://www.consumerfinance.gov/rules-policy/regulations/1026/2/), the creditor definition's finance charge and more-than-four-installments tests and the 25-transaction "regularly" threshold
- [Federal Register: Truth in Lending (Regulation Z); Use of Digital User Accounts To Access Buy Now, Pay Later Loans, 89 FR 47068 (May 31, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-05-31/html/2024-11800.htm), digital user accounts as credit cards, BNPL lenders as card issuers and creditors under 1026.2(a)(17)(iii), billing errors and unauthorized use, applicable July 30, 2024
- [Federal Register: Interpretive Rules, Policy Statements, and Advisory Opinions; Withdrawal, 90 FR 20084 (May 12, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-05-12/html/2025-08286.htm), the 67 withdrawn documents including the BNPL interpretive rule, and the non-enforcement statement
- [CFPB: Buy now, pay later products](https://www.consumerfinance.gov/compliance/compliance-resources/consumer-cards-resources/buy-now-pay-later-bnpl-products/), the CFPB's confirmation of the May 12, 2025 withdrawal
- [FCA: PS26/1, Regulation of Deferred Payment Credit (February 2026)](https://www.fca.org.uk/publication/policy/ps26-1.pdf), the DPC definition, Regulation Day, the merchant exemption, CONC 5.2A creditworthiness, key product information, forbearance, complaints and the Financial Ombudsman, the temporary permissions regime and the separate credit reference account type

**State law**

- [Greenberg Traurig: New York enacts landmark buy now, pay later regulation (June 5, 2025)](https://www.gtlaw.com/en/insights/2025/6/new-york-enacts-landmark-buy-now-pay-later-regulation-amid-federal-regulatory-recalibration), Article 14-B of the Banking Law, the licensing requirement, rulemaking on maximum charges and the effective date 180 days after the rules
- [Orrick InfoBytes: NYDFS proposes rule to implement state BNPL licensing and consumer protection framework (July 24, 2026)](https://infobytes.orrick.com/2026-07-24/nydfs-proposes-rule-to-implement-state-bnpl-licensing-and-consumer-protection-framework/), the proposed 3 NYCRR Part 423: category permissions, capital and bonds, the $8 penalty fee cap, disclosures, billing errors, unauthorized use, underwriting, data consent and timing

**Regulators and research**

- [Federal Reserve: "Buy Now, Pay Later" Beyond "Pay in 4", a comprehensive product overview (FEDS Notes, June 5, 2026)](https://www.federalreserve.gov/econres/notes/feds-notes/buy-now-pay-later-beyond-pay-in-4-a-comprehensive-product-overview-20260605.html), 2025 US issuance by product and firm, the 0% APR share, the product taxonomy, merchant fee levels and soft inquiries
- [CFPB: The Buy Now, Pay Later Market, data spotlight (December 2025)](https://files.consumerfinance.gov/f/documents/cfpb_bnpl-market-report_2025-12.pdf), 2023 loan counts, volume and average size, loans per user, late fee incidence and amounts, and charge-off rates

**Filings**

- [Affirm: Annual report on Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0001820953/000162828026059279/afrm-20260630.htm), product mix, $0 late fees, simple interest, merchant fees and subsidies, Celtic Bank and Lead Bank at up to 36%, and the New York and Illinois laws
- [Block: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1512673/000162828026012254/xyz-20251231.htm), Afterpay Pay in 4, Pay Monthly and post-purchase installments, upfront merchant payment and the non-payment risk
- [Klarna Group: Second quarter 2026 results (August 18, 2026)](https://s205.q4cdn.com/644747736/files/doc_earnings/2026/q2/earnings-result/Q2-26-Klarna-Group-plc-Press-Release.pdf), GMV, provisions as a share of GMV, deposit funding and the move of Fair Financing to fair value

**In practice**

- [PayPal: Buy now, pay later](https://www.paypal.com/us/digital-wallet/ways-to-pay/buy-now-pay-later), Pay in 4 and Pay Monthly amounts, terms, APRs, lenders and state exclusions
