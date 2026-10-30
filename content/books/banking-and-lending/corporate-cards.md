+++
title = "Corporate Cards & Underwriting"
description = "Underwriting a corporate charge card: limits from cash, payment cycles, security interests, liability models, commercial card types and receivable funding."
category = "Banking & Lending Industry"
order = 2463
part = "Spend Management"
tags = ["banking", "spend-management", "corporate-cards", "underwriting", "commercial-cards", "charge-cards"]
+++

A corporate card is credit to a business that may be a year old, has no financial statements worth spreading, and is spending venture money at a known monthly rate. Bank issuers underwrite the company's credit and, under some liability models, make the employee jointly liable too. The startup card programs underwrite something simpler and faster to observe: the cash in the company's bank accounts. The limit follows the balance, the payment cycle shortens when the balance falls, and the deposit account is collateral in all but name, or in name. That design is why a card can be approved in minutes for a company no bureau has heard of, and it's also why the limit can fall without warning.

This chapter covers the card as credit to a business: how limits are set from cash, revenue and history, daily to monthly payment cycles, security interests, setoff and guarantees, the liability and billing models (corporate, combined and individual liability; central and individual billing), the commercial card family (purchasing, fleet, travel and lodge, virtual, government SmartPay), and who ends up owning the receivable and funding it. The revolving card's law (balance segments, grace, interest, the CARD Act) is [Credit Cards as Credit](/books/banking-and-lending/credit-cards); most of it doesn't apply here, because the card is a charge card for business purposes. The economics are [The Spend Management Business](/books/banking-and-lending/spend-management), and the issuing stack is the Payments volume's [Card Issuing](/books/payments/card-issuing#commercial-and-virtual-cards).

## How the Platforms Do It

What card agreements, help centers and filings say about each program's credit terms, as of October 2026:

| Program | Issuer | Limit basis | Payment cycle | Liability and collateral | Receivable |
| --- | --- | --- | --- | --- | --- |
| **Mercury IO** | Patriot Bank, N.A.; serviced by Mercury Servicing LLC | Spending limits "dynamic and may be modified at any time with or without notice," including to $0 | Daily, weekly, monthly, semi-monthly or another period at the issuer's discretion; all charges due at cycle end; autopay from the designated account, then a secondary account, then a linked account | The company is responsible for all card activity; security interest in all funding accounts, extending to Mercury Advisory investment accounts; setoff against any deposit account; no late fee, but collection costs and interest up to the legal maximum | Not stated in the agreement |
| **Ramp** | Not named on the help pages I opened | On 1-day terms, "generally equal to 100% of the available balance in your Ramp Checking Account" | Full statement balance due each period; 1-day terms pull daily from Ramp Checking at 4 p.m. ET; one payment configuration per business; multi-entity companies can't use 1-day terms | Not stated on the pages I opened | Not stated |
| **BILL Divvy** | Cross River Bank, WEX Bank, WebBank | BILL underwrites for the banks under its own credit policies | Charge card; cycle terms not stated in the 10-K | BILL doesn't file UCC liens or take other security interests on card balances | Banks sell BILL a 100% participation in each receivable, which BILL must buy; funded from cash and $600.0 million of revolving facilities |
| **Expensify Card** | The Bancorp Bank, N.A. | "Smart Limits": the company sets each employee's maximum exposure | Daily settlement ("employees never overspend what a company is able to pay") or monthly | Not stated in the 10-K | Not stated |
| **American Express Corporate** | American Express | Spending limits at the company's request "or at the discretion of American Express" | Statements about monthly; payment "due immediately upon receipt of the billing statement" | Full Corporate Liability or Combined Liability (company and employee jointly and severally liable, except personal charges) | American Express |
| **GSA SmartPay** (US government) | Not named on the pages cited | Dollar limits the account holder must observe | Purchase and fleet centrally billed; travel individually or centrally billed | Agency rules and procedures | Not stated |

<!-- source-gap: ramp-issuing-bank | secondary | the bank that issues the Ramp card and Ramp's guarantee and underwriting terms | closes with: a Ramp page or agreement naming the issuing bank and the card terms (ramp.com/legal renders without text to the fetcher) | checked: 2026-10-29 -->

Three things stand out. **The limit is a live number:** Mercury's agreement says so outright, and Ramp's 1-day terms make the limit the balance. **The cycle is a risk control, not a billing preference:** Mercury reserves the right to set it by applicant, and Ramp allows one configuration per business, because the cycle decides how much unpaid spend can pile up before money moves. **Collateral without a filing:** Mercury takes a security interest in the funding accounts it debits, while BILL says it files no UCC liens and takes no security interests on card balances, so two programs with the same product carry their losses very differently. Brex's terms couldn't be retrieved for this chapter ([How the Platforms Do It](/books/banking-and-lending/spend-management#how-the-platforms-do-it)).

## Why a Charge Card

A charge card is paid in full each cycle, so it has no revolving balance, no interest calculation, no minimum payment and no grace period to manage ([Credit Cards as Credit](/books/banking-and-lending/credit-cards#how-the-platforms-do-it)). For a business card the law adds little: Regulation Z exempts business-purpose credit except its rules on issuance and unauthorized use, and when an issuer gives 10 or more cards to one organization's employees, the issuer and the organization may agree liability for unauthorized use between themselves; liability may be imposed on an employee only under the rule's $50 cap (12 CFR 1026.12(b)(5)). Mercury's agreement makes the same point from the other side: each use represents that the transaction "was not for personal, family, or household use." The payments side of that exemption is in [Commercial and Virtual Cards](/books/payments/card-issuing#commercial-and-virtual-cards).

What does apply is the Equal Credit Opportunity Act. Regulation B covers business credit, so the underwriting can't use a prohibited basis, guarantees are limited by 12 CFR 1002.7(d) ([Personal Guarantees and Who Else Is Liable](/books/banking-and-lending/small-business-lending#personal-guarantees-and-who-else-is-liable)), and adverse action needs a notice, on business credit's own terms (below).

## Underwriting a Business With No History

A startup has a legal entity, a few owners, a bank account and a burn rate. The underwriting inputs follow:

- **Who the business is.** KYB first: the entity, its beneficial owners and control person, its industry, as in [KYB: Business Accounts](/books/banking-and-lending/kyc-and-account-opening#kyb-business-accounts). A card program inherits the bank's CIP and BSA program, and a business that can't be verified can't be underwritten.
- **Cash.** Balances in the business's accounts, read through linked account connections ([Open Banking in the US](/books/banking-and-lending/open-banking#how-to-build-it)) or directly when the platform also holds the deposit account. Mercury's agreement lists "linked account information" among what it uses; Ramp's 1-day limit is the balance of the account it holds.
- **Burn and runway.** Net outflow per month from the same transaction data, and the months of cash it implies. A company with $2 million and six months of runway is a different risk from one with $2 million and three years.
- **Revenue,** for businesses that have it, from connected accounting, payment processors or bank inflows, and the same data an embedded lender reads ([Offers From Processing Data](/books/banking-and-lending/embedded-lending#offers-from-processing-data)).
- **Funding.** Equity raised and from whom; some programs ask for it at application.
- **The owners,** for programs that take guarantees or pull personal credit, which is where Regulation B's guarantee rule and the owner's consent to a bureau pull come in.

**Adverse action on business credit has its own notice rules.** For a business with gross revenues of $1 million or less, the creditor follows the consumer timing and content rules with relaxations (the action may be stated orally or in writing, and the right to a statement of reasons may be disclosed at application); above $1 million, notice within a reasonable time, orally or in writing, with written reasons only if the applicant asks within 60 days (12 CFR 1002.9(a)(3)). The decision record has to know the applicant's revenue band to know which rule applies; [Business Credit](/books/banking-and-lending/adverse-action#business-credit) in Adverse Action & Explaining Decisions covers the notices.

## Limits From Cash

Three bases, often combined:

- **Cash-based.** The limit is a share of observed balances: 100% of the balance in the issuer's own account on daily terms (Ramp), or a smaller share of linked balances on monthly terms, because a month of spend can run before any money moves.
- **Revenue-based.** For businesses with steady receipts, a multiple of monthly revenue or card spend, closer to how a bank sizes a line.
- **History-based.** As the business pays on time, the program raises the limit or lengthens the cycle.

**Dynamic limits are recalculated, not reviewed.** A cash-based limit is recomputed as balances change, daily or on every data refresh, and applied without a request. That's the product's advantage and its legal edge. Under Regulation B, an "unfavorable change in the terms of an account" that "does not affect all or substantially all of a class of the creditor's accounts" is adverse action, excluding actions taken "in connection with inactivity, default, or delinquency" and point-of-sale declines; a declined purchase because it would exceed the limit isn't adverse action, but cutting one company's limit because its cash fell is an unfavorable change to that account (12 CFR 1002.2(c)). A program that lowers limits automatically therefore needs a notice path for each decrease it makes on credit grounds, sized to the revenue band above, and the reason the engine used.

## Worked Numbers: A Limit From Linked Balances

An illustrative policy (my assumptions, not any program's):

- On monthly terms, the limit is a share of the lower of the 30-day average balance and today's balance across linked accounts: **10%** if runway is 12 months or more, **5%** if it's 6 to 12 months.
- Below 6 months of runway, the business moves to daily terms, with the limit equal to the balance in the platform's own account.

**Day 0.** A company has linked balances of $2,400,000 on 30-day average and $1,800,000 today, and net burn of $300,000 a month over the last three months.

- Basis: the lower balance, $1,800,000.
- Runway: $1,800,000 / $300,000 = **6.0 months**, so the 5% tier.
- Limit: 5% × $1,800,000 = **$90,000**, on monthly terms.

**Day 35.** Balances are $1,500,000 today ($1,650,000 on 30-day average), burn unchanged, and $70,000 of card spend is unpaid.

- Runway: $1,500,000 / $300,000 = **5.0 months**, below 6.
- The business moves to daily terms. It keeps $400,000 in the platform's account, so the limit becomes **$400,000**, and each day's settled spend is pulled that afternoon.
- The $70,000 on the monthly cycle is due on its original date or accelerated per the agreement; either way, the change of terms is a record with a notice, because moving one company to daily payment is an unfavorable change for that account.

Exposure is the point. On monthly terms with a $90,000 limit, the program can be owed up to $90,000 for as long as a cycle plus its payment window. On daily terms with a $400,000 limit, the program is owed about one day of spend, and if the company's account empties, the next pull fails within a day. A higher limit on shorter terms is less risk than a lower limit on longer ones, which is the trade the [worked numbers on funding](/books/banking-and-lending/spend-management#worked-numbers-where-a-month-of-interchange-goes) price.

## Daily, Weekly or Monthly

The cycle decides how much unpaid spend accumulates, so programs set it per customer and change it with risk:

- **Mercury** reserves daily, weekly, monthly, semi-monthly "or another billing period," with all charges due at cycle end and autopay from a designated account, then a secondary, then a linked account.
- **Ramp's** 1-day terms pull every day at 4 p.m. ET for charges that cleared before then, against its checking account; its other configuration is 30-day terms, and a business can't mix them across cards.
- **Expensify** offers daily settlement or monthly.
- **American Express** issues statements at intervals of about one month, with payment due on receipt.

Building it means a cycle engine that can run a cycle of one day as easily as one month, an autopay waterfall with its order and its failure handling, and a cutoff time that's part of the terms. Each autopay pull is an ACH debit or a book transfer with its own return risk ([Returns](/books/payments/ach#returns-when-money-is-really-yours)), so a failed pull on daily terms is the earliest delinquency signal the program gets.

## Security Interests, Setoff and Guarantees

A cash-underwritten card is secured by the cash, one way or another:

- **A security interest in deposit accounts** is perfected only by control (UCC 9-312(b)(1)). A secured party has control if it is the bank where the account is held, if the debtor, the secured party and the bank agree in an authenticated record that the bank will follow the secured party's instructions without further consent from the debtor (a deposit account control agreement), or if the secured party becomes the bank's customer on the account (UCC 9-104(a)). An issuer whose card is paid from accounts at another bank needs a control agreement to be perfected; a security interest granted in the card agreement alone isn't.
- **Setoff.** Mercury's agreement lets the issuer "set off, debit, or collect any amounts you owe from amounts in any Deposit Account," including after the card account closes.
- **Investment accounts.** Mercury's security interest extends to investment accounts held through its advisory affiliate, which matters when most of a startup's cash sits in a Treasury fund rather than a deposit account ([Sweeps, Reciprocal Deposits & Yield](/books/banking-and-lending/sweeps-and-yield) covers those products).
- **No security at all.** BILL takes no security interests on Divvy card balances and files no UCC liens, so its recovery after a default is an unsecured claim.
- **Personal guarantees.** The Mercury IO agreement I read contains no personal guarantee and makes the company responsible for every user's transactions. Where a program does take one, it's a `guarantees` record with its scope and the Regulation B basis for asking ([Personal Guarantees and Who Else Is Liable](/books/banking-and-lending/small-business-lending#personal-guarantees-and-who-else-is-liable)). A company guaranteeing employees' cards is a third model, below.

## Liability and Billing Models

Who owes the issuer depends on two choices made at setup:

- **Corporate liability.** The company owes everything. American Express's US corporate card agreement: under "Full Corporate Liability," "the Company is fully liable to us for all Charges."
- **Combined (joint and several) liability.** The company and the employee are both liable, except that "the Company shall not be liable for Charges you incur that are personal in nature or not for business purposes." In Amex's agreement the billing model decides which applies: if a billing statement is made available to the employee, the account is Combined Liability; if not, it's Full Corporate Liability, billed to the company.
- **Company guarantee with limits.** Amex's guaranty for Basic Control Accounts (version July 2026) has the company guarantee designated employees' charges "as a primary obligor and not merely as a surety," capped per employee at a limit and in total at the sum of the limits.
- **Individual liability,** where the employee alone owes and is reimbursed by the employer, is the other end of the range; I found no current US agreement to cite for it.

**Billing** is the other axis. A **centrally billed account (CBA)** sends one statement to the company for all cards; an **individually billed account (IBA)** bills each cardholder, who is reimbursed through expense reports. The US government's SmartPay program uses both: purchase and fleet accounts are centrally billed, travel accounts are individually or centrally billed, and an integrated account combining lines is "most times considered to be a CBA." Individual billing ties the card to [reimbursement](/books/banking-and-lending/expense-management#approvals) and makes the employee's payment behavior part of the program's risk; central billing makes it one company receivable.

## Commercial Card Types

The corporate card is one product in a family the networks and issuers have sold for decades:

| Type | What it pays for | How it's billed and controlled | Sourced example |
| --- | --- | --- | --- |
| **Corporate (T&E) card** | Employee travel and expenses | Per-employee card, central or individual billing | Amex Corporate Green, Gold and Platinum agreements |
| **Purchasing card (P-card)** | Goods and services the company buys often | Central billing; merchant category controls; Level 3 line items earn lower interchange for merchants that send them ([Level 2 and Level 3 Data](/books/payments/interchange-and-pricing#level-2-and-level-3-data)) | Amex's Corporate Purchasing Card: "a procurement and payment vehicle for goods and services frequently used by the Company" (Australian agreement) |
| **Fleet card** | Fuel and vehicle maintenance | Captures driver, vehicle and odometer at the pump; often a closed network | WEX: a closed-loop network at more than 90% of US fuel locations |
| **Travel or lodge account** | Travel booked through a travel management company | A card number held by the agency, no plastic, billed to the company monthly | Amex Business Travel Account: centralizes charges "booked through its designated TMC," with no plastic cards issued (Australian agreement) |
| **Virtual payment account** | Supplier payments | A number per payment or per vendor, no named employee | Amex vPayment, payments "via specific use Virtual Account Numbers"; payables in [Vendor Payouts](/books/payments/vendor-payouts#single-use-and-multi-use-cards) |
| **Government (GSA SmartPay)** | Federal purchase, travel and fleet | Purchase and fleet CBA, travel IBA or CBA; travel is the way to buy City Pair fares | $39.4 billion of spend and $471 million of refunds to agencies in fiscal 2025, an average transaction of $480 |

The SmartPay refunds are about 1.2% of spend (my arithmetic), a public benchmark for what a large buyer recovers from its card program. Under Amex's Australian agreement, the company is liable for all charges on the travel account, purchasing card and virtual accounts, which is the usual pattern: products without a named cardholder are corporate liability by design.

## Who Owns the Receivable

The bank issues, so the bank creates the receivable. What happens next is the program's funding structure ([Credit](/books/payments/card-issuing#credit)):

- **The bank keeps it.** An issuer running its own program, as American Express does under its corporate card agreements, is the creditor and holds the receivable.
- **The bank sells a participation.** BILL's issuing banks sell it "a 100% participation interest in the receivable," BILL is "obligated to purchase the participation interests in all of the receivables originated through our platform" at the outstanding principal, the obligation is secured by cash deposits, and BILL bears "the entire credit risk." The bank keeps the customer relationship and the legal title; the program owns the economics.
- **The program funds it with debt.** BILL funds the purchases from its cash and revolving facilities secured by the card receivables ($600.0 million of capacity, $330.0 million drawn at June 30, 2026). Facilities like these, and forward flow and securitization, are [Funding the Book](/books/banking-and-lending/funding-the-book#warehouse-lines), whose [Participations](/books/banking-and-lending/funding-the-book#participations) section describes the 100% case from the funding side.

For the system, the participation is two records. Ownership is per account: when a card account opens, a `loan_transfers` row of kind `participation_sale` at 10,000 basis points moves its receivable to the program ([Funding the Book](/books/banking-and-lending/funding-the-book#how-to-build-it)), and `loans.owner` names the program. Money is a daily settlement: each business day the bank's new receivables are summed, the program pays for them from its collateral account or facility, and payments received reduce what it owns. Payments' `card_accounts.receivable_owner` says the same thing from the issuing side; this chapter adds the daily purchase record and the funding vehicle it drew on. Whether a bank that sells 100% of its receivables is still the true lender is a regulatory question with a history in consumer lending, covered in [True Lender Exposure](/books/banking-and-lending/lender-licensing#true-lender-exposure).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model) and [Credit Cards as Credit](/books/banking-and-lending/credit-cards#how-to-build-it). A corporate card account is an `accounts` row with `account_kind = 'line'`, a `loans` row with `amortization = 'revolving'`, and a `credit_lines` row with `is_charge_card = true`, linked one to one to the Payments volume's `card_accounts`. The business is the owner in `account_parties`; employees are cardholders on the issuing side, not account parties, unless liability makes them one (combined liability adds them as `co_borrower`). Origination is a `credit_decisions` row; every limit change is a `credit_limit_changes` row, and a credit-based decrease owes a `decision_notices` row from [Adverse Action & Explaining Decisions](/books/banking-and-lending/adverse-action#how-to-build-it); guarantees and filings reuse [Small Business Lending](/books/banking-and-lending/small-business-lending#how-to-build-it)'s `guarantees` and `ucc_filings`, and linked balances come from [Open Banking in the US](/books/banking-and-lending/open-banking#how-to-build-it)'s `data_connections`.

```sql
ALTER TABLE credit_limit_changes DROP CONSTRAINT credit_limit_changes_reason_check,
  ADD CONSTRAINT credit_limit_changes_reason_check CHECK (reason IN ('origination',
    'consumer_request', 'proactive', 'risk_decrease', 'delinquency', 'restore',
    'cash_recalculation'));

CREATE TABLE corporate_card_terms (          -- the business terms on a charge line
  account_id          UUID PRIMARY KEY REFERENCES credit_lines (account_id),
  liability_model     TEXT NOT NULL CHECK (liability_model IN ('corporate', 'combined',
                        'company_guaranteed', 'individual')),
  billing_model       TEXT NOT NULL CHECK (billing_model IN ('central', 'individual')),
  payment_cadence     TEXT NOT NULL CHECK (payment_cadence IN ('daily', 'weekly',
                        'semi_monthly', 'monthly')),
  daily_cutoff_local  TIME,                  -- daily terms: spend cleared before this is pulled today
  limit_basis         TEXT NOT NULL CHECK (limit_basis IN ('cash', 'revenue', 'history',
                        'company_set', 'manual')),
  limit_policy_version TEXT NOT NULL,        -- the policy that computes the limit
  revenue_band        TEXT CHECK (revenue_band IN ('le_1m', 'gt_1m')),  -- picks the Reg B notice rule
  secured_by_control  BOOLEAN NOT NULL,      -- perfected over a deposit account under UCC 9-104
  agreement_version   TEXT NOT NULL,
  valid_during        TSTZRANGE NOT NULL     -- a cadence or liability change is a new row
);

CREATE TABLE card_funding_sources (          -- the autopay waterfall, in order
  account_id          UUID NOT NULL REFERENCES credit_lines (account_id),
  priority            SMALLINT NOT NULL,     -- 1 = designated, 2 = secondary, 3 = linked
  deposit_account_id  UUID REFERENCES accounts (id),           -- an account the platform holds
  data_connection_id  UUID REFERENCES data_connections (id),   -- an external account
  control_basis       TEXT NOT NULL CHECK (control_basis IN ('none', 'depositary_bank',
                        'control_agreement', 'secured_party_customer')),
  control_agreement_ref TEXT,                -- the signed agreement, when one exists
  valid_during        TSTZRANGE NOT NULL,
  PRIMARY KEY (account_id, priority, valid_during),
  CHECK ((deposit_account_id IS NULL) <> (data_connection_id IS NULL))
);

CREATE TABLE limit_evaluations (             -- every recalculation, including the ones that changed nothing
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES credit_lines (account_id),
  policy_version      TEXT NOT NULL,
  balance_basis       BIGINT NOT NULL,       -- the balance the policy used (lower of average and current)
  average_balance_30d BIGINT NOT NULL,
  current_balance     BIGINT NOT NULL,
  monthly_net_burn    BIGINT,
  runway_months       NUMERIC(6, 2),
  monthly_revenue     BIGINT,
  inputs_ref          TEXT NOT NULL,         -- the frozen data pulls behind the figures
  computed_limit      BIGINT NOT NULL,
  computed_cadence    TEXT NOT NULL,
  applied             BOOLEAN NOT NULL,      -- false: within tolerance, or held for review
  credit_limit_change_id UUID REFERENCES credit_limit_changes (id),
  adverse_action      BOOLEAN NOT NULL,      -- an unfavorable change to this account on credit grounds
  decision_notice_id  UUID REFERENCES decision_notices (id),  -- rule_ref '1002.9(a)(3)(i)' or '(ii)' by revenue band
  evaluated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (NOT adverse_action OR applied)
);

CREATE TABLE card_receivable_participations (  -- the daily purchase from the issuing bank
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  business_date       DATE NOT NULL,
  participation_bps   INT NOT NULL CHECK (participation_bps BETWEEN 1 AND 10000),
  new_receivables     BIGINT NOT NULL,       -- principal originated that day
  collections         BIGINT NOT NULL,       -- payments received that reduce what the program owns
  purchase_amount     BIGINT NOT NULL,       -- participation_bps of new_receivables
  funded_from         TEXT NOT NULL CHECK (funded_from IN ('corporate_cash', 'facility',
                        'collateral_account')),
  funding_vehicle_id  UUID REFERENCES funding_vehicles (id),  -- the facility drawn, from Funding the Book
  journal_entry_id    UUID NOT NULL REFERENCES journal_entries (id),
  bank_report_ref     TEXT NOT NULL,         -- the bank's daily file it settles
  UNIQUE (program_id, business_date)
);
```

Design notes:

- **Terms are effective-dated.** Moving a company from monthly to daily, or from combined to corporate liability, closes one `corporate_card_terms` row and opens another, so a statement, a failed pull or a default is judged under the terms in force that day.
- **Every evaluation is kept.** `limit_evaluations` stores the inputs and the computed result even when nothing changes, so the program can show why a limit held or moved, and a recalculation that cuts a limit on credit grounds can't be applied without its notice decision (`adverse_action`, `decision_notice_id`). Model and policy changes are tested by rerunning stored inputs ([Testing Rules](/docs/architecture/rules-as-data#testing-rules)).
- **The waterfall is data.** Autopay tries funding sources in priority order; each has a `control_basis`, so the collections team knows which balances it can take and which it can only ask for.
- **Participations reconcile daily.** The sum of a program's `purchase_amount` less collections equals the program's share of the bank's receivable balance on that date, matched to the bank's file the way a program ledger is matched to the omnibus account ([Daily Reconciliation](/books/banking-and-lending/program-ledgers#daily-reconciliation)).

## Auditing

The issuing bank, its examiners, the facility lenders and fair lending reviewers each read a corporate card program's credit records. The general design is in [Audit Trails](/docs/architecture/audit-trails) and [Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions). Make sure the record shows:

- **Each origination decision** with its KYB results, the data pulled, the policy and model versions, and the limit and cadence granted.
- **Every limit evaluation,** applied or not, with its inputs, and for every credit-based decrease the adverse action determination and the notice sent under the right revenue band.
- **The terms in force on any date:** cadence, liability model, billing model and agreement version.
- **Every autopay attempt** against the waterfall, with its result and return code.
- **Collateral and control:** each funding source's control basis and the signed control agreement where one exists, and every setoff with its authority.
- **Guarantees,** with who signed, the cap and the reason for asking.
- **Participations and funding:** each day's purchase, collections, the facility draw and the reconciliation to the bank's file.

## What This Means for the System You Build

- **Underwrite on observed cash,** read through linked connections or the platform's own accounts, and keep each pull as the evidence.
- **Recompute limits continuously,** store every evaluation, and treat a credit-based cut to one account as adverse action with its notice.
- **Make the payment cycle a risk control:** a cycle engine that runs daily as easily as monthly, with an ordered autopay waterfall.
- **Know what you can take:** a security interest in deposit accounts is perfected only by control, so record each funding source's control basis.
- **Model liability and billing separately:** corporate, combined, guaranteed or individual liability; central or individual billing.
- **Support the commercial family** (purchasing, fleet, travel, virtual) as products on the same account model with their own controls.
- **Record who owns each receivable each day,** and reconcile participations and facility draws to the bank's file.

## References

**Law and regulation**

- [Cornell LII: 12 CFR 1026.12, special credit card provisions](https://www.law.cornell.edu/cfr/text/12/1026.12), the $50 cap, unsolicited issuance, and liability by agreement for 10 or more cards issued to an organization's employees
- [CFPB: Regulation B § 1002.2, definitions](https://www.consumerfinance.gov/rules-policy/regulations/1002/2/), adverse action as an unfavorable change in terms not affecting all or substantially all of a class, the delinquency exclusion, and point-of-sale declines over a limit
- [CFPB: Regulation B § 1002.9, notifications](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/), business credit notices for applicants with revenues of $1 million or less and above, and written reasons on request within 60 days
- [Cornell LII: UCC § 9-312](https://www.law.cornell.edu/ucc/9/9-312), perfection of a security interest in a deposit account only by control
- [Cornell LII: UCC § 9-104](https://www.law.cornell.edu/ucc/9/9-104), control of a deposit account by the depositary bank, a control agreement, or becoming the bank's customer

**Agreements and program documents**

- [Mercury: IO Charge Card Agreement (last updated August 10, 2026)](https://mercury.com/legal/io-charge-card-agreement), Patriot Bank as issuer, billing cycles from daily to monthly, the autopay order, dynamic limits, the security interest in funding and investment accounts, setoff, no late fee, collection costs, and the business-purpose representation
- [American Express: Corporate Card Member Agreement (US)](https://secure.cmax.americanexpress.com/Internet/US/Corporate/AtWork/Files/Forms/CorpCard_Cardmember_Agreement.pdf), Full Corporate and Combined Liability, the billing statement deciding which applies, spending limits, monthly statements and payment due on receipt
- [American Express: Guaranty of Payment Agreement for Basic Control Accounts with Limits (version July 2026)](https://www.americanexpress.com/content/dam/amex/en-us/business/resource-center/card-management/forms/Basic-Control-Account-with-Limits.pdf), the company as primary obligor with per-employee and total limits
- [American Express: Global Corporate Payments Agreement (Australia)](https://www.americanexpress.com/content/dam/amex/au/staticassets/corporate/Corporate-Account-Agreement.pdf), definitions of the Business Travel Account, Corporate Purchasing Card and vPayment, and company liability for them
- [GSA SmartPay: Business lines](https://smartpay.gsa.gov/about/business-lines/), purchase, travel, fleet and integrated accounts and their CBA or IBA billing, and City Pair fares
- [GSA SmartPay: Statistics](https://smartpay.gsa.gov/about/statistics/), fiscal 2025 spend of $39.4 billion, $471 million of refunds and a $480 average transaction

**Vendor documentation**

- [Ramp: 1-day payment terms](https://support.ramp.com/1-day-payment-terms), daily pulls at 4 p.m. ET, a limit of about 100% of the Ramp Checking balance, one configuration per business, and no multi-entity companies
- [Ramp: Card statements and payments overview](https://support.ramp.com/hc/en-us/articles/6169690785043-Ramp-card-statements-and-payments-overview), full statement payment each period and cadence by card terms
- [Ramp: Ramp corporate cards](https://support.ramp.com/ramp-corporate-cards), a corporate charge card on Visa, not reported to personal credit bureaus

**Filings**

- [BILL Holdings: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/0001786352/000162828026058238/bill-20260630.htm), underwriting for the issuing banks, the 100% participation and purchase obligation secured by cash deposits, no UCC liens or security interests on card balances, and the revolving facilities
- [Expensify: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1476840/000147684026000009/exfy-20251231.htm), Smart Limits and daily or monthly settlement on the Expensify Card
- [WEX: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1309108/000130910826000010/wex-20251231.htm), the closed-loop fleet network and driver, vehicle and odometer data at the point of sale
