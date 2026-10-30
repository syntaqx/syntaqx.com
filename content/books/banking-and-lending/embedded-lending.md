+++
title = "Embedded Lending"
description = "Financing inside payment platforms: offers from processing data, repayment withheld from payouts, partner banks, MCAs versus loans, and state disclosure laws."
category = "Banking & Lending Industry"
order = 2440
part = "Business Lending"
tags = ["banking", "lending", "embedded-finance", "merchant-cash-advance", "platforms", "disclosure"]
+++

A payment processor knows more about a small merchant's business than any bank the merchant has ever applied to: every sale, every refund, every chargeback, how many customers come back, and whether this month is better than last. It also controls the merchant's money on its way out, because sales settle into the processor's books before they're paid out. Put those two facts together and lending becomes a feature: offer a sum sized to the merchant's sales, collect by keeping a percentage of each day's payout, and never send a bill. Shopify, Stripe, Square, PayPal and the software platforms behind restaurants, salons and delivery couriers all do some version of it. Few of them are the lender. A bank partner (or, for Square, its own industrial bank) makes the loan, a specialist may buy receivables instead of lending, and the platform's role is the offer, the data and the withholding.

This chapter covers who does what in an embedded lending program, how offers come from processing data, withholding from payouts and the minimums and milestones behind it, loans and merchant cash advances on one engine, the state commercial financing disclosure laws, and how a platform or provider records it. The products themselves (term loans, lines, MCAs, the purchase-or-loan question) are in [Small Business Lending](/books/banking-and-lending/small-business-lending); the payout mechanics it rides on are the Payments volume's [Payouts & Settlement](/books/payments/payouts-and-settlement); the platform structure is [Software Platforms](/books/payments/software-platforms).

## How the Platforms Do It

As of October 2026, from each program's own documentation:

| Program | Lender or buyer | Product | Repayment | Floor or milestone | Notes |
| --- | --- | --- | --- | --- | --- |
| **Stripe Capital** (US) | Loans issued by Celtic Bank or Lead Bank; MCAs provided by YouLend | Flex loan, MCA, fixed-term loan for imported non-Stripe sales, line of credit in preview | Amount plus one flat fee, withheld as a fixed percentage of each transaction | Loans: a minimum per payment period (typically 30 or 60 days), shortfall debited; MCAs: none | Offers usually valid 30 days; at least 3 months of processing, $5,000 a year and $1,000 a month average |
| **Shopify Capital** (US) | Issued by WebBank | Secured loan | A daily percentage of sales; nothing on days without sales | 30% of the total by month 6, 60% by month 12, all within 18 months | Fixed fee (13% of $100,000 is $13,000 in its example) or a monthly fee; repayments fall back to the business's bank account |
| **Square Loans** | Square Financial Services, Block's Utah industrial bank | Loans by invitation, $100 to $500,000 | A percentage of daily card sales, with a minimum payment | | Most loans sold to investors through forward flow; personal guarantee above $250,000 |
| **PayPal Working Capital** | WebBank | Loans of $1,000 to $250,000 ($400,000 for repeat borrowers) | A share of each PayPal sale, chosen before funding, with one fixed fee | At least 5% (expected to take 12 months or more) or 10% of loan plus fee every 90 days | Requires 90 days on PayPal and $15,000 to $20,000 of annual PayPal sales |
| **Parafin** (white label for platforms) | Loans and lines issued by Celtic Bank | Working capital, a spend card and cash account, pay over time | A share of daily sales (its example: 13%) | | Names DoorDash, Gusto, Mindbody, Jobber, Worldpay and others as platforms; says it has extended more than $35 billion in offers (its claim) |
| **American Express Business Line of Credit** | American Express | Business line of credit, the former Kabbage product | | | Amex agreed in August 2020 to acquire substantially all of Kabbage, excluding its pre-existing loan portfolio |

Three things stand out. **The bank's name is on the note, not the platform's:** Celtic, Lead and WebBank appear again and again, the platform's terms say so, and the bank's charter is what lets one product run in every state ([The Banking Landscape](/books/banking-and-lending/banking-landscape#sponsor-banks-and-baas) lists the banks; [Lender Licensing & Bank Partnerships](/books/banking-and-lending/lender-licensing) covers the arrangement). **The repayment rule is the product:** a period minimum (Stripe, PayPal), cumulative milestones (Shopify) and no floor at all (an MCA) are three different scheduler designs on the same withholding. **Platforms can distribute without lending:** Stripe says its financial partners "manage eligibility, underwriting, pricing, funding, servicing, and collections" and that a platform "isn't liable for credit losses"; Parafin runs the whole program under the platform's brand. The platform earns from the program and owns the experience; the credit risk sits with the lender or its investors.

## Who Does What

An embedded lending program splits one loan across four parties, and each owns different obligations:

- **The lender of record** (a bank partner, or the provider's own bank): approves the credit under its policy, is the creditor for Regulation B and state law, and holds or sells the loan. Its criteria bind every decision ([The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it) records them on each pricing grid as `partner_criteria_ref`).
- **The program manager or provider** (Stripe, Shopify, PayPal, Parafin): builds the models, generates offers, services the loan, collects by withholding, and buys or arranges funding for the loans. YouLend plays this role as the buyer of receivables in an MCA, where there is no lender at all.
- **The platform** (the software company whose merchants borrow): distributes offers inside its product, shares data, and may earn a referral fee or revenue share. Stripe's options run from offers it presents itself in its dashboard, to co-branded emails, to embedded components, to an API where the platform builds its own notifications but acceptance still happens on a Stripe-hosted page or component.
- **The merchant:** the borrower, or the seller of receivables.

Outside the US the platform's role can itself be regulated: Stripe tells platforms that introducing German merchants to financing may need a credit broker license under section 34c of the German Trade Ordinance, and French ones a registration as an IOBSP with ORIAS. In the US the platform's marketing still carries the lender's compliance: offer copy, eligibility banners ("on track for a future offer" is "not a guarantee," in Stripe's words) and adverse action notices are the lender's, reviewed by the lender. How the bank oversees a program built this way is [Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight#compliance-management-across-a-program).

## Offers From Processing Data

The underwriting input is the merchant's history on the platform. Stripe's published criteria are representative: at least three months of processing, $5,000 of volume a year and $1,000 a month on average over the last three months, good standing (a declined business waits 30 days before a new offer), and a US business. Above the floor, its models weigh growth, consistency (few periods of low or zero volume), the size of the customer base and the dispute rate, and the merchant can add a linked bank account or import sales processed elsewhere to improve the picture. Square sizes loans to less than 20% of expected annual Square volume.

Three properties make these offers different from an application a bank receives:

- **They're computed continuously.** Stripe prequalifies connected accounts daily, Square reviews accounts daily, and an offer is a snapshot that expires (typically 30 days at Stripe), after which the merchant is reevaluated. An offer is a record with a validity period and the data it was computed from, not a standing approval.
- **They're unsolicited.** Square's loans are by invitation only; Stripe says it has no manual review or on-demand access. The merchant didn't apply, so the first credit event is the acceptance, and an acceptance that turns into a decline still needs an adverse action notice: Stripe says its "Notice of Adverse Action provides the most detailed explanation available."
- **They refill.** Stripe sends a refill offer when a merchant is about 80% through repayment; how a refill treats the existing balance varies by country (in Australia and Canada the refill pays off the current financing; in the UK, Germany and France the original stays active and its withholding rate changes to the new one).

Business credit offered this way is credit under the Equal Credit Opportunity Act, with the business credit notice rules from [Small Business Lending](/books/banking-and-lending/small-business-lending#term-loans-and-lines). Merchant cash advances are excluded from the revised section 1071 small business data collection rule, which [Fair Lending, HMDA & 1071](/books/banking-and-lending/fair-lending) covers.

## Withholding From Payouts

The processor withholds a fixed percentage of each transaction (Stripe calls it the **repayment rate**) before the merchant's share is paid out, and applies it to the loan. Mechanically, this is a deduction on the payout, posted as its own ledger entry against the merchant's balance, exactly as the platform's own fees are ([Fees Are Separate Entries](/books/payments/payouts-and-settlement#fees-are-separate-entries)). In the lender's books, each withholding on a loan is a `loan_payments` row with `method = 'payout_withholding'`, allocated like any other payment; on an MCA it's a remittance `transactions` row against the purchase account.

The design questions are about what a withholding competes with:

- **Reserves and holds come first.** A rolling reserve or a new-merchant hold on the same balance ([Payout Schedules, Holds and Reserves](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)) protects the processor against disputes; withholding for a loan should apply to what's left. My rule: compute the withholding on settled sales as they become available, after reserves, so a dispute that arrives later reduces the merchant's balance, not the lender's collections.
- **Refunds and disputes don't reverse a repayment.** A refund on a sale that was 15% withheld has already paid the loan; reversing that payment would make the loan's balance depend on the merchant's customers. The refund comes out of the merchant's balance like any other.
- **A negative balance stops the withholding.** If refunds and lost disputes take the balance below zero, there is no payout to withhold from and the processor is collecting its own loss first ([Negative Balances](/books/payments/payouts-and-settlement#negative-balances)). Which claim has priority (the processor's negative balance or the lender's repayment) is a contract term between them, and the system has to implement exactly that order.
- **Stopped processing is the credit event.** A merchant who moves to another processor stops generating withholdings. For a loan, the period minimum or milestone catches it, and the shortfall is debited from the merchant's bank account. For an MCA there is nothing to catch: the purchased receivables just stop arriving, which is either the provider's risk or a breach, depending on why.

### Minimums, milestones and shortfalls

Withholding alone makes a loan with no maturity; the floor is what makes it a loan. The programs publish three designs:

- **A period minimum.** Stripe's loans require a minimum each payment period; withholdings count toward it, and if they fall short, "Stripe automatically debits the balance needed to meet your minimum from your bank account or account balance." Its example: a $2,000 minimum for the 60-day period ending March 1; $2,500 withheld meets it, $1,500 withheld leaves $500 debited on March 1. A **fixed payment** variant stops withholding once the period's payment is met. PayPal's floor is 5% or 10% of the loan plus fee every 90 days, set by whether repayment is expected to take more or less than 12 months.
- **Cumulative milestones.** Shopify checks progress at 6 and 12 months against 30% of the total by month 6 and 60% by month 12, with full repayment within 18 months; Shopify says a missed milestone may be an event of default under the loan agreement. Repayments that fail from the Shopify Payments balance can fall back to the business's bank account (loans accepted before March 9, 2026 aren't retried after a failed daily repayment).
- **No floor.** An MCA has no fixed payment schedule and no periodic debits; what it collects moves with sales.

A shortfall debit is an ACH debit on a business account, which can be returned as unauthorized within two banking days ([Clawbacks](/books/payments/payouts-and-settlement#clawbacks) covers the CCD return window and what happens after a return). The debit authorization collected at onboarding is part of the loan file.

### Worked numbers: a flex loan through a slow season

A merchant accepts $20,000 with a $2,000 flat fee: $22,000 to repay at a 15% repayment rate, with a $3,000 minimum per 60-day period. Its sales have averaged $30,000 a month, so the provider expects $4,500 a month of withholdings. Then two months come in at $8,000:

| Days | Sales | Withheld | Period minimum | Shortfall debited | Balance after |
| --- | --- | --- | --- | --- | --- |
| 1 to 60 | $60,000 | $9,000 | $3,000 | $0 | $13,000 |
| 61 to 120 | $16,000 | $2,400 | $3,000 | $600 | $10,000 |
| 121 to 180 | $60,000 | $9,000 | $3,000 | $0 | $1,000 |
| 181 to 187 | about $7,000 | $1,000 | | | $0 |

Projected from its history, the loan would have been repaid in 147 days, an estimated APR of 47.9%; it was actually repaid in 187 days, a realized APR of 37.1%. Both APRs discount daily payments to the $20,000 advanced on a 365-day year; the figures are my arithmetic and the terms illustrative. The flat fee is fixed in dollars, so a slower repayment costs the merchant less per year, and the provider's yield falls with it. That gap between estimated and realized APR is why New York's disclosure law makes a provider that projects its own sales volume (rather than using the merchant's history) report estimated APRs against the actual ones every year.

## Loans and Advances on One Engine

Stripe's US program shows the pattern: a flex loan from a bank and an MCA from YouLend, chosen by the offer and not by the merchant ("You can't request a particular financing type"), both repaid by a percentage withheld from the same transactions. In the UK the merchant's legal form decides: sole proprietors and unincorporated entities get a cash advance, incorporated companies a loan. One withholding engine, two legal objects:

| | Loan | Merchant cash advance |
| --- | --- | --- |
| What the merchant owes | Principal plus a fee, unconditionally | Delivery of purchased receivables as they arise |
| Account kind | `loan` (or `line` with each draw a loan) | `purchase` ([Small Business Lending](/books/banking-and-lending/small-business-lending#how-to-build-it)) |
| Schedule | Minimums, milestones or a fixed term | None |
| When sales stop | Shortfall debit, then default | The provider waits; a breach only if the merchant diverts sales |
| Credit check | A personal credit check in some cases | Soft only, in Stripe's description for platforms |
| Law that applies | Lending law of the lender's charter and the borrower's state | Contract law, the state commercial financing laws, and recharacterization risk |

My rule: the engine that computes and posts withholdings knows nothing about the legal object. It reads a withholding instruction (account, rate, priority, validity), posts each withholding, and hands it to the account's servicing rules. Minimums, milestones, reconciliation and default live in the servicing rules for that account kind. A provider that puts "if MCA then skip the minimum" inside the withholding engine will eventually ship an MCA with a minimum, which is a loan.

## State Commercial Financing Disclosure Laws

Business credit has no Truth in Lending Act, and since 2022 a growing set of states has written their own disclosure rules for commercial financing, aimed first at MCAs. They differ on the point that matters most to a provider: whether the disclosure must include an annual percentage rate.

| State | Law | In effect | Covers | Ceiling | APR | Registration | Notable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **California** | Fin. Code §§ 22800 et seq.; 10 CCR 900 et seq. | December 9, 2022 | Loans, open-end credit, factoring, MCAs | Recipients offered $500,000 or less | Yes | Licensing for small business financing from 2028 (AB 2116) | Annual commercial financing report to DFPI under 10 CCR 1062 |
| **New York** | Fin. Serv. Law Art. 8; 23 NYCRR 600 | August 1, 2023 | Sales-based financing, closed-end, open-end, factoring, other | Exempt over $2.5 million | Yes, estimated, by the historical or opt-in method | No | Superintendent enforces; up to $2,000 per violation, $10,000 if willful |
| **Utah** | Utah Code 7-27 | January 1, 2023 | Loans, open-end credit, receivables purchases | Exempt over $1 million | No | Yes, with DFI through NMLS, annually | Contract stays enforceable |
| **Virginia** | Va. Code §§ 6.2-2228 to 2238 | 2022 | Sales-based financing to Virginia businesses | Exempt over $500,000 | No | Yes, with the SCC, providers and brokers | Confessions of judgment banned; Virginia venue; noncompliant terms unenforceable |
| **Florida** | Fla. Stat. §§ 559.961 to 559.9615 | January 1, 2024 | Commercial financing | Exempt over $500,000 | No | No | Broker rules; Attorney General enforces; no private right |
| **Georgia** | O.C.G.A. § 10-1-393.18 | January 1, 2024 | Commercial financing | Exempt over $500,000 | No | No | Attorney General enforces |
| **Connecticut** | Conn. Gen. Stat. §§ 36a-861 to 872 | July 1, 2024 | Sales-based financing | $250,000 or less | No | Yes, by October 1, 2024 | Offer can't be revoked before midnight of the third day; prejudgment-remedy waivers unenforceable |
| **Kansas** | Commercial Financing Disclosure Act (SB 345, 2024) | July 1, 2024 | Loans, open-end credit, receivables purchases | Exempt over $500,000 | No | No | A provider's "purchase" characterization is conclusive that it isn't a loan |
| **Missouri** | Mo. Rev. Stat. § 427.300 | 2025 | Commercial financing | Exempt over $500,000 | No | Brokers only, with a $10,000 bond | |
| **Texas** | Fin. Code ch. 398 (HB 700, 2025); 7 TAC §§ 86.301 to 86.322 | September 1, 2025; rules July 9, 2026 | Commercial sales-based financing | Disclosures under $1 million | No | Yes, with the OCCC; existing businesses by December 31, 2026 | No automatic debits without a perfected first-priority security interest in the account; confessions of judgment void; no rate cap may be set |
| **Louisiana** | R.S. 9:3137.10 (Act 198, 2025) | August 1, 2025 | Revenue-based financing | | No | No | Charges "are not interest" |
| **Vermont** | 8 V.S.A. § 2247 (Act 142, 2026) | July 1, 2027 | Sales-based financing and factoring | Exempt at $1 million or more | Yes | A lender license | Automatic debits need a first-priority security interest; confessions of judgment void |

<!-- source-gap: georgia-commercial-financing | secondary | Georgia's commercial financing disclosure law (O.C.G.A. 10-1-393.18, SB 90): effective for transactions on or after January 1, 2024, the $500,000 ceiling and Attorney General enforcement | closes with: the statute text from legis.ga.gov, whose PDFs were unreadable | checked: 2026-10-29 -->
Georgia's row rests on a practitioner summary; the statute text wasn't readable. The disclosure items themselves converge. Utah, Florida, Kansas and Missouri require six: the total amount of funds provided, the amount disbursed, the total to be paid, the total dollar cost, the manner, frequency and amount of payments (an estimate if they vary), and the cost or discount of prepayment. Virginia, Connecticut and Texas add the estimated number of payments, collateral and broker compensation. New York requires the estimated APR, the finance charge, the estimated term and the average projected monthly payment, among others (§ 803).

Three requirements drive engineering more than the disclosure form:

- **The estimated APR needs a sales projection.** New York lets a provider use the **historical method** (the recipient's average sales over a fixed look-back of one to twelve months, applied the same way to every offer) or the **opt-in method** (the provider's own projection per offer, with an annual report to DFS of estimated APRs against retrospective ones and the risk of being forced back to the historical method). Either way, the inputs to every disclosed APR are a stored record, and the opt-in method makes the realized APR at payoff a reported number too.
- **Automatic debits need a perfected security interest.** Texas forbids a provider to "establish a mechanism for automatically debiting a recipient's deposit account" without a perfected, first-priority security interest in that account; its rules read prewritten checks as such a mechanism and require a first-priority interest in all accounts receivable. Vermont follows from 2027. For a shortfall debit, the UCC filing and the debit authorization are now one compliance question ([UCC Filings](/books/banking-and-lending/small-business-lending#ucc-filings)).
- **Registration and renewal are calendars.** Utah registrations expire each December 31; Virginia renews each September 15; Texas each January 31. A provider that lends in every state carries a registration matrix by state, role (provider or broker) and renewal date.

California's 2026 law goes further than disclosure. AB 2116 (signed September 30, 2026) brings providers and brokers of MCAs, factoring and other receivables purchases to small businesses (offers of $500,000 or less, to businesses with gross receipts up to $16 million) under the California Financing Law's licensing; most provisions are operative January 1, 2028 and the licensing prohibition July 1, 2028, after which an agreement from an unlicensed provider is unenforceable.

The disclosure laws mostly exempt banks (California, Florida, Utah, Texas and Connecticut list depository institutions), which is one more reason the bank partner's name is on the loan. They don't exempt the platform or program manager when the program is an MCA bought by a nonbank, and Utah's statute counts a platform that offers a bank's products online among its providers.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model) and the Payments volume's. A loan made through a platform is an `accounts` row under a `programs` row (the provider's program at the lender), with a `loans` row whose `amortization` is `fixed_fee` or `percent_of_sales`; an MCA is a `purchase` account with `receivable_purchases` terms from [Small Business Lending](/books/banking-and-lending/small-business-lending#how-to-build-it). Repayments on loans are `loan_payments` with `method = 'payout_withholding'`; remittances on an MCA are `transactions` rows on the purchase account. On the processor's side, the merchant is a Payments `merchants` row, each payout a `payouts` row, and each withholding a ledger transaction against the merchant's balance ([Payouts & Settlement](/books/payments/payouts-and-settlement#how-to-build-it)). This chapter adds distribution, offers, withholding, repayment floors, the state disclosure rules and registrations.

```sql
CREATE TABLE distribution_partners (         -- the platform that shows a program's offers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  platform_name       TEXT NOT NULL,
  integration         TEXT NOT NULL CHECK (integration IN ('provider_branded', 'co_branded_email',
                        'embedded_component', 'api')),
  revenue_share_bps   INT,
  bears_credit_loss   BOOLEAN NOT NULL DEFAULT false,
  marketing_approval_ref TEXT NOT NULL,      -- the lender's review of offer copy and banners
  broker_license_refs TEXT[] NOT NULL DEFAULT '{}',  -- where introducing is regulated
  valid_during        TSTZRANGE NOT NULL
);

CREATE TABLE financing_offers (              -- a snapshot with an expiry, not a standing approval
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  distribution_partner_id UUID REFERENCES distribution_partners (id),
  party_id            UUID NOT NULL REFERENCES parties (id),   -- the business
  merchant_ref        TEXT NOT NULL,         -- the Payments merchants.id it was computed for
  product_id          UUID NOT NULL REFERENCES products (id),
  offer_kind          TEXT NOT NULL CHECK (offer_kind IN ('flex_loan', 'fixed_term_loan',
                        'line', 'merchant_cash_advance', 'refill')),
  max_amount          BIGINT NOT NULL,
  pricing             JSONB NOT NULL,        -- fee by amount: the slider's curve, as offered
  repayment_rate_bps  INT NOT NULL,
  floor_terms         JSONB,                 -- period minimum, milestones, or null for an MCA
  features_ref        TEXT NOT NULL,         -- frozen processing history the model read
  model_version       TEXT NOT NULL,
  offered_at          TIMESTAMPTZ NOT NULL,
  expires_at          TIMESTAMPTZ NOT NULL,  -- typically 30 days
  status              TEXT NOT NULL CHECK (status IN ('open', 'accepted', 'expired',
                        'withdrawn', 'superseded')),
  application_id      UUID REFERENCES applications (id)  -- created on acceptance
);

CREATE TABLE withholding_instructions (      -- what the payout engine reads; knows no legal object
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),  -- loan or purchase
  merchant_ref        TEXT NOT NULL,
  rate_bps            INT NOT NULL CHECK (rate_bps BETWEEN 1 AND 10000),
  basis               TEXT NOT NULL CHECK (basis IN ('settled_gross', 'settled_after_reserves')),
  priority            SMALLINT NOT NULL,     -- against reserves, negative balance recovery, other loans
  valid_during        TSTZRANGE NOT NULL,    -- a refill or rate change is a new row
  stop_reason         TEXT CHECK (stop_reason IN ('paid_off', 'replaced', 'default',
                        'merchant_closed', 'charged_off'))
);

CREATE TABLE withholdings (                  -- one per payout per instruction
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  instruction_id      UUID NOT NULL REFERENCES withholding_instructions (id),
  payout_ref          TEXT NOT NULL,         -- the Payments payouts.id it was deducted from
  ledger_transaction_ref TEXT NOT NULL,      -- the processor-side entry
  basis_amount        BIGINT NOT NULL,       -- the sales it was computed on
  amount              BIGINT NOT NULL CHECK (amount > 0),
  transaction_id      UUID NOT NULL REFERENCES transactions (id),   -- the lender-side activity row
  loan_payment_id     UUID REFERENCES loan_payments (id),  -- loans only; null for an MCA remittance
  withheld_at         TIMESTAMPTZ NOT NULL,
  UNIQUE (instruction_id, payout_ref)        -- a retried payout can't withhold twice
);

CREATE TABLE repayment_floors (              -- each period minimum or milestone, and how it was met
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES loans (account_id),
  kind                TEXT NOT NULL CHECK (kind IN ('period_minimum', 'fixed_payment',
                        'cumulative_milestone')),
  sequence            SMALLINT NOT NULL,
  window              DATERANGE NOT NULL,    -- the period, or origination to the milestone date
  required            BIGINT NOT NULL,       -- an amount, or the milestone's share of the total
  withheld            BIGINT NOT NULL DEFAULT 0,
  manual_paid         BIGINT NOT NULL DEFAULT 0,
  shortfall_debited   BIGINT NOT NULL DEFAULT 0,
  debit_ref           TEXT,                  -- the ACH debit, and its return if any
  outcome             TEXT CHECK (outcome IN ('met', 'met_by_debit', 'debit_returned',
                        'missed', 'waived')),
  case_id             UUID REFERENCES cases (id),   -- hardship or default handling
  UNIQUE (account_id, kind, sequence)
);

CREATE TABLE commercial_disclosure_rules (   -- versioned state law, like rate_cap_rules
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction        CHAR(2) NOT NULL,
  product_scope       TEXT[] NOT NULL,       -- 'closed_end', 'open_end', 'sales_based', 'factoring', ...
  amount_ceiling      BIGINT,                -- above this, exempt
  ceiling_inclusive   BOOLEAN NOT NULL,
  exempt_lender_types TEXT[] NOT NULL DEFAULT '{}',  -- 'depository_institution', ...
  apr_required        BOOLEAN NOT NULL,
  apr_methods         TEXT[],                -- New York: {'historical', 'opt_in'}
  required_items      TEXT[] NOT NULL,       -- the disclosure's fields, by name
  signature_required  BOOLEAN NOT NULL,
  autodebit_requires_perfected_interest BOOLEAN NOT NULL DEFAULT false,
  confession_of_judgment_void BOOLEAN NOT NULL DEFAULT false,
  effective_from      DATE NOT NULL,
  effective_to        DATE,
  source_citation     TEXT NOT NULL
);

CREATE TABLE commercial_disclosures (        -- the figures behind a 'commercial_financing' disclosures row
  disclosure_id       UUID PRIMARY KEY REFERENCES disclosures (id),
  offer_id            UUID NOT NULL REFERENCES financing_offers (id),
  rule_id             UUID NOT NULL REFERENCES commercial_disclosure_rules (id),
  amount_provided     BIGINT NOT NULL,
  amount_disbursed    BIGINT NOT NULL,
  total_repayment     BIGINT NOT NULL,
  finance_charge      BIGINT NOT NULL,
  estimated_apr_bps   INT,                   -- where the rule requires one
  apr_method          TEXT CHECK (apr_method IN ('historical', 'opt_in')),
  projection_ref      TEXT,                  -- look-back window and sales used
  estimated_term_days INT,
  avg_monthly_payment BIGINT,
  retrospective_apr_bps INT,                 -- filled at payoff: what it really cost
  retrospective_term_days INT
);

CREATE TABLE provider_registrations (        -- the state matrix: who may offer where
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction        CHAR(2) NOT NULL,
  regulator           TEXT NOT NULL,         -- 'UT-DFI', 'VA-SCC', 'TX-OCCC', 'CA-DFPI', ...
  role                TEXT NOT NULL CHECK (role IN ('provider', 'broker', 'licensed_lender')),
  registration_number TEXT,
  nmls_id             TEXT,
  bond_ref            TEXT,
  valid_during        DATERANGE NOT NULL,
  renew_by            DATE NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('pending', 'active', 'lapsed', 'surrendered'))
);
```

Design notes:

- **One payout, two ledgers, one key.** The processor posts the withholding against the merchant's balance; the lender or buyer posts a `transactions` row with its journal entry, and for a loan a `loan_payments` row. `withholdings` links the two, and its unique key on the instruction and the payout means a retried payout run can't collect twice ([Idempotency](/docs/payments/idempotency)). The daily reconciliation is the sum of withholdings against the sum of the lender-side rows, per lender or buyer, which is the same two-books matching as [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation).
- **The engine reads instructions, not products.** `withholding_instructions` carries a rate, a basis and a priority; everything that differs between a loan and an MCA lives in `repayment_floors` (which only loans have) and in the account's servicing rules. A refill or a country's rate-standardization is a new instruction row with a new validity period, never an update.
- **Offers are frozen.** The pricing curve, floor terms, model version and the processing history behind each offer are stored, because the lender has to show what each merchant was offered and why, and because an accepted offer's terms are the contract's.
- **Disclosure rules are data.** `commercial_disclosure_rules` is evaluated on the recipient's state at offer time, like `rate_cap_rules`, and its result decides the disclosure template, whether an APR is computed, whether a signature is collected and whether an automatic debit is allowed at all. The disclosure itself is a `disclosures` row with `kind = 'commercial_financing'`, and `commercial_disclosures` holds the figures and their inputs ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Realized APR is a reportable number.** Filling `retrospective_apr_bps` at payoff costs one job and answers New York's opt-in report and every "were our estimates honest?" question a regulator or a court asks.

## Auditing

An embedded program is examined by the bank partner, its regulator, state regulators and the platform's own auditors, each holding a different piece. The general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **Every offer as made:** amount, curve, floor terms, model version, the history it was computed from, where it was shown, and when it expired.
- **Who the lender or buyer was** for each account, under which program and distribution partner, and what the partner bank approved.
- **Every withholding** tied to the payout it came from and the loan payment it became, reconciling daily between the two ledgers.
- **Every floor:** each period or milestone, what was withheld, paid manually and debited, the debit's authorization and any return.
- **Every state disclosure:** the rule version, the figures, the APR method and its inputs, the delivery, the signature where required, and the realized APR at payoff.
- **The registration matrix** by state and role, with renewals, and the security interest behind every automatic debit where the state requires one.

## What This Means for the System You Build

- **Name the lender of record on every account** and keep the platform, the program manager and the bank as separate parties with separate obligations.
- **Treat offers as expiring snapshots** with their inputs frozen; an acceptance is the application.
- **Withhold from settled funds after reserves,** with an explicit priority against negative balances and other claims, and an idempotency key per payout.
- **Keep the withholding engine ignorant of the legal object;** floors, reconciliation and default belong to the account's servicing rules.
- **Schedule floors as records:** period minimums, milestones, the shortfall debit and its return.
- **Evaluate state disclosure rules as versioned data** on the recipient's state, and store the APR inputs and the realized APR.
- **Check the security interest before any automatic debit** in states that require one, and track registrations as a calendar.

## References

**Law and regulation**

- [New York Senate: Financial Services Law § 803, sales-based financing disclosures](https://www.nysenate.gov/legislation/laws/FIS/803), the required items, the estimated APR under 12 CFR 1026.22, and the historical and opt-in methods
- [New York Senate: Financial Services Law § 802, exemptions](https://www.nysenate.gov/legislation/laws/FIS/802), financial institutions, the five-transaction threshold and the $2.5 million ceiling
- [New York Senate: Financial Services Law § 812, enforcement](https://www.nysenate.gov/legislation/laws/FIS/812), penalties of $2,000 per violation and $10,000 if willful, by the superintendent
- [New York Senate: Financial Services Law Article 8](https://www.nysenate.gov/legislation/laws/FIS/A8), the sections for closed-end, open-end, factoring and other financing
- [FindLaw: California Financial Code § 22800](https://codes.findlaw.com/ca/financial-code/fin-sect-22800/), the recipient defined by an offer of $500,000 or less
- [FindLaw: California Financial Code § 22801](https://codes.findlaw.com/ca/financial-code/fin-sect-22801/), exemptions for depository institutions, real-estate-secured financing, dealers and low-volume providers
- [Utah Code Title 7, Chapter 27, Commercial Financing Registration and Disclosure Act](https://le.utah.gov/xcode/Title7/Chapter27/C7-27_2022050420220504.pdf), providers including online platforms for banks, exemptions and the $1 million ceiling, registration through NMLS expiring each December 31, the six disclosure items, and penalties
- [Code of Virginia: Chapter 22.1, Sales-Based Financing Providers](https://law.lis.virginia.gov/vacodefull/title6.2/chapter22.1/), scope, the $500,000 exemption, registration with the Commission, disclosures, the confession of judgment ban, venue and enforcement
- [Florida Statutes § 559.9612](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0500-0599/0559/Sections/0559.9612.html), scope from January 1, 2024 and exemptions including the $500,000 ceiling
- [Florida Statutes § 559.9613](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0500-0599/0559/Sections/0559.9613.html), the six disclosure items at or before consummation
- [Florida Statutes § 559.9615](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0500-0599/0559/Sections/0559.9615.html), Attorney General enforcement, penalties and no private right of action
- [Connecticut General Statutes, Chapter 669](https://www.cga.ct.gov/current/pub/chap_669.htm), sections 36a-861 to 36a-872 on sales-based financing of $250,000 or less, the three-day offer rule, prejudgment-remedy waivers and registration
- [Kansas Legislative Research: Supplemental note on SB 345 (2024)](https://kslegislature.gov/li_2024/b2023_24/measures/documents/supp_note_sb345_00_0000.pdf), the Commercial Financing Disclosure Act's scope, exemptions, disclosures, the conclusive "purchase" characterization and enforcement
- [Missouri Revisor of Statutes: § 427.300](https://revisor.mo.gov/main/OneSection.aspx?section=427.300), provider disclosures, broker registration and bond, exemptions and enforcement
- [Texas Legislature: HB 700, 89th Legislature (enrolled)](https://capitol.texas.gov/tlodocs/89R/billtext/html/HB00700F.htm), Finance Code chapter 398: disclosures under $1 million, OCCC registration by December 31, 2026, void confessions of judgment, the automatic debit restriction and no rate or fee cap, effective September 1, 2025
- [Texas Register: Adopted rules, 7 TAC §§ 86.301 to 86.322 (July 3, 2026)](https://www.sos.state.tx.us/texreg/archive/July32026/Adopted+Rules/7.BANKING+AND+SECURITIES.html), the OCCC's commercial sales-based financing rules, effective July 9, 2026, including the automatic debit and prewritten check provisions
- [Louisiana Legislature: Résumé digest of Act 198 (HB 470) of 2025](https://legis.la.gov/Legis/ViewDocument.aspx?d=1430174), revenue-based financing disclosures, charges that are not interest, effective August 1, 2025
- [Vermont Legislature: H.648 of 2026 (Act 142)](https://legislature.vermont.gov/bill/status/2026/H.648), the bill's status and enactment

**Regulators and guidance**

- [California DFPI: Commercial financing disclosure regulations effective December 9, 2022](https://dfpi.ca.gov/press_release/dfpis-commercial-financing-disclosure-regulations-approved-to-become-effective-as-of-december-9-2022/), the required items including APR, and coverage of installment loans, open-end credit, factoring and MCAs
- [California DFPI: Commercial financing annual report information](https://dfpi.ca.gov/rules-enforcement/laws-and-regulations/california-consumer-financial-protection-law/ccfpl-commercial-financing-annual-report-information), the annual report under 10 CCR 1062
- [Mayer Brown: CFPB issues final section 1071 rule (May 2026)](https://www.mayerbrown.com/en/insights/publications/2026/05/cfpb-issues-final-section-1071-rule-on-small-business-lending-data-collection), the revised rule's exclusion of merchant cash advances

**Law firm analysis**

- [Morrison Foerster: California expands the California Financing Law (October 2026)](https://www.mofo.com/resources/insights/261015-california-expands-california-financing-law), AB 2116: scope, thresholds, operative dates and unenforceability of unlicensed agreements
- [Husch Blackwell: Vermont folds sales-based financing and factoring into its licensing regime](https://www.huschblackwell.com/newsandinsights/vermont-folds-sales-based-financing-and-factoring-into-its-licensing-regime), Act 142's licensing, $1 million exclusion, estimated APR, automatic debit and confession of judgment provisions, effective July 1, 2027
- [Buchalter: Georgia enacts commercial financing disclosure law](https://www.buchalter.com/insights/georgia-enacts-commercial-financing-disclosure-law-mandatory-compliance-date-january-1-2024/), SB 90's compliance date, ceiling, exemptions and enforcement (secondary)

**Vendor documentation**

- [Stripe: How Stripe Capital works](https://docs.stripe.com/capital), US loans from Celtic Bank or Lead Bank and MCAs from YouLend, the flat fee, the repayment rate, minimums and the shortfall example, fixed payment loans, eligibility criteria, 30-day offers, and adverse action notices
- [Stripe: How Capital for platforms works](https://docs.stripe.com/capital/how-capital-for-platforms-works), daily prequalification, the four US offer types, integration options, hosted acceptance, no platform liability for credit losses, refills at about 80%, refill behavior by country, and broker licensing in Germany and France
- [Shopify Help Center: Shopify Capital in the United States](https://help.shopify.com/en/manual/finance/shopify-capital/united-states), WebBank as issuer, daily percentage repayment, fixed and monthly fees, the 6- and 12-month milestones, the 18-month maximum, failed repayment fallback and UCC-1 filings
- [Square: Square Loans FAQs](https://squareup.com/help/us/en/article/6531-square-loans-faqs), Square Financial Services as issuer, offers by invitation, daily review, repayment from card sales and the personal guarantee threshold
- [PayPal: PayPal Working Capital](https://www.paypal.com/webapps/mpp/paypal-working-capital), WebBank as lender, loan amounts, the fixed fee, the chosen repayment percentage, the 90-day minimum and eligibility
- [Parafin](https://www.parafin.com/), white-label financing for platforms, Celtic Bank as issuer, named platforms and offers extended (company claims)

**Filings and announcements**

- [Block: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1512673/000162828026012254/xyz-20251231.htm), Square Loans sizing and forward flow funding
- [American Express: American Express to acquire Kabbage (August 17, 2020)](https://ir.americanexpress.com/news/investor-relations-news/investor-relations-news-details/2020/American-Express-to-Acquire-Kabbage/default.aspx), substantially all of Kabbage, excluding its pre-existing loan portfolio
