+++
title = "Billing & Premium Finance"
description = "Direct bill plans and installments, nonpayment and cancellation, premium finance companies and their power-of-attorney cancellations, refunds, and escrow."
category = "Insurance Industry"
order = 2728
part = "Policy Administration"
tags = ["insurance", "policy-administration", "billing", "premium-finance", "installments", "escrow"]
+++

Insurance is sold for a term and paid for over time. A six-month auto policy is usually paid monthly; a homeowners policy with a mortgage is paid once a year from the servicer's escrow account; a commercial package may be paid in full, in quarterly installments billed by the insurer, through the agency, or with a loan from a premium finance company that pays the insurer up front and collects from the insured in installments, holding a power of attorney to cancel the policy if they stop. Each of these produces a different billing record, but they share a constraint the policy system imposes: coverage is earned day by day, and the money collected has to stay ahead of it, or the insurer is covering someone who hasn't paid and will struggle to recover it after cancellation.

Billing is also where policy administration meets payments, and the boundary matters. The billing system decides what is owed, when, by whom and what happens when it isn't paid (invoices, installments, nonpayment notices, cancellations, refunds); the payments system moves the money (card, ACH, check, wallet) and reports what happened. This chapter covers billing accounts and plans, installments, nonpayment notices and cancellation, premium finance companies and their cancellation flow, return premiums and refunds, and escrowed premiums from mortgage servicers. The rails are in [Payments](/books/payments/ach#returns-when-money-is-really-yours); commission on agency-billed business is [Commissions & Agency Accounting](/books/insurance/commissions-and-agency-accounting); the notice law is [Cancellation, Nonrenewal & Notice Law](/books/insurance/cancellation-and-nonrenewal#notice-periods-by-state-and-reason).

## How the Platforms Do It

As of November 2026:

| Platform or party | Billing role |
| --- | --- |
| **Guidewire BillingCenter** | One of the five InsuranceSuite applications in Guidewire's fiscal 2026 10-K, alongside PolicyCenter, ClaimCenter, PricingCenter and UnderwritingCenter: billing is a separate application from the policy system |
| **Socotra** | Pricing stored on each transaction as premium and other charges, which billing consumes |
| **Premium finance companies** | State-licensed lenders that pay the premium and hold a power of attorney to cancel (New York Banking Law 576, Texas Ins. Code ch. 651, Fla. Stat. 627.840 and 627.848, Cal. Ins. Code 673) |
| **Mortgage servicers** | Pay homeowners premiums from escrow under RESPA's Regulation X, and force-place coverage when it lapses |

The industry's split is structural: policy systems produce premium and fee charges per transaction, billing systems turn charges into invoices on a plan and track what is paid, and the payment rails are a third system. A cancellation for nonpayment crosses all three: billing detects the missed installment, the policy system issues the notice and the pending cancellation, and a payment that arrives in time rescinds both.

## Billing Accounts and Plans

A **billing account** is who pays and how: the named insured, an employer for a group, a mortgage servicer, an agency, or a premium finance company. One account can pay for several policies (a household's auto and home, a business's package), and one policy can move between accounts (the insured buys a house and the homeowners policy moves to the servicer's escrow). The **bill type** decides who invoices the insured:

- **Direct bill.** The insurer invoices the insured and collects; the agent is paid commission by the insurer ([Commissions & Agency Accounting](/books/insurance/commissions-and-agency-accounting)).
- **Agency bill.** The agency invoices and collects, keeps its commission and remits the net to the insurer on a schedule; the insurer's receivable is the agency, not the insured.
- **Mortgagee bill.** The renewal invoice goes to the mortgage servicer, which pays from escrow.
- **List bill.** One invoice for many policies, common for employer-sponsored programs.

A **pay plan** is the schedule: paid in full, two-pay, quarterly, monthly, monthly by automatic draft, with a down payment percentage, installment due dates, an installment fee where the filing provides one, and rules for what happens on a midterm change (spread over the remaining installments, or billed at once). State law reaches into plans: Maryland prohibits requiring "a particular payment plan" for private passenger auto or homeowners coverage "based on the credit history of the insured" (Md. Ins. 27-501(e-1)), which makes plan eligibility a rule with the same legality checks as a rating factor ([What You May Rate On](/books/insurance/rating-factors-and-limits)).

## Installments, Worked

A worked plan, mine, on the $1,444 annual policy effective January 1, 2027: 25% down and nine monthly installments. Down payment $361.00; the balance of $1,083.00 over nine is $120.333..., so eight installments of $120.33 and a final one of $120.36 absorb the rounding. Installments fall due February 1 through October 1. Any filed installment fee is its own fee entry on each invoice, earned when charged, not part of premium.

The plan keeps collections ahead of earned premium. On March 1 (59 days in), before that day's installment, earned premium is $1,444 × 59 / 365 = $233.42 and collections are $361.00 + $120.33 = $481.33. Suppose the insured pays the March installment and misses April's, and a Florida nonpayment notice mailed April 5 cancels the policy effective April 15 (104 days in). Earned premium is $1,444 × 104 / 365 = $411.44; collections are $601.66 (down payment plus February and March); pro rata return premium is $1,444 × 261 / 365 = $1,032.56; the unpaid balance is $1,444.00 - $601.66 = $842.34; and the net refund is $1,032.56 - $842.34 = **$190.22**, which equals collections minus earned premium. The identity is the check a billing system should run on every cancellation: refund = collected - earned (pro rata cancellations) after fees, and any difference is a defect.

For pay-per-mile and audited policies the schedule is not fixed: variable charges arrive monthly in arrears ([Telematics & Usage-Based Insurance](/books/insurance/telematics)) and audit adjustments after the term ([Rating Workers' Comp & Premium Audit](/books/insurance/rating-workers-comp)), so the plan has to accept charges that the original schedule didn't contain.

## Nonpayment

A missed installment starts a sequence the state's law and the policy's form fix:

1. **Grace and reminders.** Carrier practice: a reminder or retry before anything legal happens; for card and ACH payments the retry rules are the rail's ([Dunning](/books/payments/stored-credentials#dunning)).
2. **Notice of cancellation for nonpayment,** with the state's minimum days: at least 10 in Florida (auto and residential property) and California (auto), effective no earlier than the 10th day after mailing in Texas, at least 15 in North Carolina for liability coverages; in New York a payment "made within fifteen days after the mailing to the insured of a notice of cancellation for nonpayment of premium" is timely (N.Y. Ins. Law 3425(a)(10)), and a commercial nonpayment notice must "inform the insured of the amount due" (3426(c)(1)(A)).
3. **Cure or cancel.** A payment before the effective date rescinds the pending cancellation; after it, reinstatement rules apply ([Cancellation, Nonrenewal & Notice Law](/books/insurance/cancellation-and-nonrenewal)).
4. **Final bill or refund.** Earned premium minus collections is either owed (sent to collections, within the rules for consumer debt) or refunded.

Two failure modes are common enough to design against. **The returned payment after the notice window**: an ACH payment that settles and then returns after the cancellation would have taken effect; whether the policy is cancelled depends on the state and the form, but the system must know the payment was provisional ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)). **The partial payment**: whether a short payment cures the default is a configured tolerance, recorded on the notice.

## Premium Finance

A premium finance company (PFC) lends the insured the premium: the insured signs a finance agreement, pays a down payment to the PFC or agent, and the PFC pays the insurer the rest of the premium. The insured repays the PFC in installments with a finance charge. The agreement assigns the policy's unearned premium to the PFC as security and gives it a power of attorney to cancel the policy in the insured's name on default. PFCs are licensed and regulated by the states, and the cancellation flow is statutory.

**Finance charges** are capped. Florida allows a service charge of "a maximum of $12 per $100 per year plus an additional charge not exceeding $20," the $20 no more than once per 12 months per customer (with an exception after a nonpayment cancellation), refunds of unearned charges on prepayment by the Rule of 78s or a method at least as favorable, and one minimum service charge per agreement (Fla. Stat. 627.840(3)). Texas caps charges by reference to the consumer loan limits in Finance Code chapter 342, with the charge beginning on the earlier of the date the insurer requires payment or the policy's effective date, computed on the balance after the down payment (Tex. Ins. Code 651.109). A worked Florida ceiling, mine, treating the service charge as an add-on to the amount financed for a 12-month agreement: a $1,800 premium with $360 down finances $1,440; $12 per $100 per year is $172.80, and with the $20 additional charge the maximum is $192.80.

**The cancellation flow**, state by state:

| Step | New York (Banking Law 576) | Texas (Ins. Code 651.161, 651.162) | Florida (Fla. Stat. 627.848) | California (Ins. Code 673) |
| --- | --- | --- | --- | --- |
| Notice of intent to the insured | At least 10 days, plus 3 days for mailing; copy to agent or broker | Cure by a stated time "not earlier than the 10th day after the date the notice is mailed"; copy to agent or broker | Not less than 10 days' written notice; copy to agent | Lender's notice of its exercise of the right to cancel, effective 5 or more days after mailing; industrial loan companies give 10 days' intent notice |
| Cancellation | Agency mails the insurer a notice of cancellation in the insured's name, stating when it is effective; copy to the insured | Company mails the insurer a cancellation notice; the policy is cancelled as if the insured cancelled it; copy to the insured and agent | Company mails the insurer a request for cancellation | Lender confirms the effective date to the insurer within 5 days after it |
| Effective date | Computed from the day the insurer receives the notice, honoring longer third-party notice periods, and not earlier than the date in the notice | Insurer gives third-party notices by the 2nd business day after receipt and sets the date accordingly | Computed from the day the insurer receives the copy of the notice | The confirmed date; insurer notifies third parties by the 5th business day |
| Return premium | Gross unearned premium, pro rata, to the agency within 60 days; insurer may keep a minimum earned premium of 10% or $60, whichever is greater | All unearned premium within 60 days after cancellation; unearned agent commission may be withheld if the agent was notified, but must be remitted before the 121st day | Unpaid balance due the finance company within 30 days; the company refunds an overpaid account within 15 days | Pro rata, not short rate, with exceptions; based on the confirmed date |

A worked timeline, mine, in New York: an installment is missed and the PFC mails its notice of intent on Monday, May 3, 2027. Ten days plus three for mailing make May 16 the earliest the PFC may cancel; it mails the insurer a cancellation notice in the insured's name; the insurer receives it May 19 and computes the effective date from that day, honoring any longer notice owed to a mortgagee or other third party and never earlier than the date stated in the PFC's notice (576(1)(e)), then must return the pro rata unearned premium to the PFC within 60 days after the effective date. In Florida the same default would let the company request cancellation after a 10-day notice, the insurer would compute the cancellation from the day it receives the notice, and the unpaid balance would be due the finance company within 30 days of the cancellation date.

For the insurer's system, a financed policy has three distinctive needs: **the PFC is a party with an interest** (a `party_roles` row on the policy and a billing account that receives refunds first), **a PFC cancellation arrives as an external instruction** with its own validation (is the agreement on file, is the notice of intent proven, does a third party need longer notice), and **the refund routes to the PFC**, computed by the state's rule, not to the insured's payment method. The NC bureau's amendatory endorsement treats a finance company's cancellation like the insured's (short rate), while New York, Texas and California compute the return pro rata; the source of the cancellation (`finance_company`) must therefore be its own value, not folded into "insured."

## Refunds

Return premium becomes money in four steps: compute the return (pro rata or short rate, from premium entries, with fees by their earning rule), apply it to any outstanding balance on the billing account, route the remainder to the right payee (a PFC first if financed, a mortgage servicer if the premium came from escrow, otherwise the insured), and pay it by a method that returns money to where it came from where possible. The commission on the returned premium is clawed back from the producer ([Commissions & Agency Accounting](/books/insurance/commissions-and-agency-accounting)). Refunds that go uncashed become unclaimed property under state law after the dormancy period, with due diligence before reporting ([Dormancy & Escheat](/books/banking-and-lending/dormancy-and-escheat#due-diligence-and-reporting)).

## Escrowed Premiums

When a homeowners premium is paid from a mortgage escrow account, the servicer is the payer and RESPA's Regulation X sets its duties. A servicer administering escrow "must pay the disbursements in a timely manner, that is, on or before the deadline to avoid a penalty, as long as the borrower's payment is not more than 30 days overdue," and must advance its own funds if the escrow balance is short (12 CFR 1024.17(k)(1), (2)). A servicer of an escrowed loan generally may not force-place hazard insurance unless it can't disburse from escrow to pay the borrower's premium (1024.17(k)(5)). When coverage does lapse, force-placement requires an initial notice at least 45 days before charging and a reminder at least 15 days before, no earlier than 30 days after the first, and cancellation with a refund of overlapping charges within 15 days of receiving evidence of coverage (1024.37). The servicer's side is in [Mortgage Servicing](/books/banking-and-lending/mortgage-servicing#escrow).

For the insurer, mortgagee billing means: the renewal invoice goes to the servicer named on the policy (from the mortgagee `party_roles` row), well ahead of the renewal so the servicer's escrow analysis and payment run in time; the servicer's payment arrives in bulk with remittance data that has to be matched to policies; a nonrenewal or cancellation notice goes to the mortgagee as well as the insured; and a refund of escrowed premium goes back to the servicer, not the borrower.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `policies`, `premium_entries` (premium, taxes and fees per transaction), and `party_roles`. This chapter defines `billing_accounts`, `invoices`, `installments`, `payments` and `premium_finance_agreements`. The Payments volume's own `payments` table models money movement on a rail; here `payments` records what the billing account received and how it was applied, and references the rail's payment by id ([The Core Data Model](/books/payments/card-payments#the-core-data-model) for the rail side).

```sql
CREATE TABLE billing_accounts (            -- who pays, how, for which policies
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  payer_party_id     UUID NOT NULL REFERENCES parties (id),
  bill_type          TEXT NOT NULL CHECK (bill_type IN ('direct', 'agency', 'mortgagee',
                       'list', 'premium_finance')),
  agency_producer_id UUID REFERENCES producers (id),   -- for agency bill
  delivery_consent_id UUID,                 -- delivery_consents (Quote, Bind & Issue)
  status             TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'closed'))
);

CREATE TABLE billing_account_policies (    -- a policy term billed on an account and plan
  billing_account_id UUID NOT NULL REFERENCES billing_accounts (id),
  policy_term_id     UUID NOT NULL REFERENCES policy_terms (id),
  pay_plan           TEXT NOT NULL,         -- 'full', 'two_pay', 'quarterly', 'monthly_eft'
  pay_plan_version   INT NOT NULL,
  down_payment_bp    INT NOT NULL,          -- 2500 = 25%
  installment_fee    BIGINT NOT NULL DEFAULT 0,  -- as filed, per installment
  midterm_change     TEXT NOT NULL CHECK (midterm_change IN ('spread', 'bill_now')),
  effective          TSTZRANGE NOT NULL,    -- a policy can move accounts midterm
  PRIMARY KEY (billing_account_id, policy_term_id, effective)
);

CREATE TABLE installments (                -- the schedule, regenerated on change, never edited
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_term_id     UUID NOT NULL REFERENCES policy_terms (id),
  schedule_version   INT NOT NULL,
  seq                INT NOT NULL,
  due_on             DATE NOT NULL,
  premium_amount     BIGINT NOT NULL,
  fee_amount         BIGINT NOT NULL DEFAULT 0,
  tax_amount         BIGINT NOT NULL DEFAULT 0,
  superseded         BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (policy_term_id, schedule_version, seq)
);

CREATE TABLE invoices (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  billing_account_id UUID NOT NULL REFERENCES billing_accounts (id),
  invoice_number     TEXT NOT NULL UNIQUE,
  installment_ids    UUID[] NOT NULL,
  amount_due         BIGINT NOT NULL,
  issued_on          DATE NOT NULL,
  due_on             DATE NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('open', 'paid', 'partially_paid',
                       'past_due', 'cancelled_policy', 'written_off')),
  nonpay_notice_id   UUID,                  -- notices (Cancellation, Nonrenewal & Notice Law)
  document_id        UUID                   -- documents
);

CREATE TABLE payments (                    -- money received and applied, not the rail itself
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  billing_account_id UUID NOT NULL REFERENCES billing_accounts (id),
  amount             BIGINT NOT NULL,       -- negative for refunds out
  direction          TEXT NOT NULL CHECK (direction IN ('received', 'refund')),
  method             TEXT NOT NULL,         -- 'card', 'ach', 'check', 'escrow_bulk', 'pfc'
  rail_payment_ref   TEXT,                  -- the Payments system's id
  status             TEXT NOT NULL CHECK (status IN ('pending', 'settled', 'returned',
                       'reversed', 'escheat_pending', 'escheated')),
  received_at        TIMESTAMPTZ NOT NULL,
  final_at           TIMESTAMPTZ,           -- when a return can no longer happen
  applied_to         JSONB NOT NULL,        -- [{invoice_id, amount}...]
  payee_party_id     UUID REFERENCES parties (id),  -- refunds: PFC, servicer or insured
  idempotency_key    TEXT NOT NULL UNIQUE
);

CREATE TABLE premium_finance_agreements (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  finance_company_party_id UUID NOT NULL REFERENCES parties (id),
  agreement_number   TEXT NOT NULL,
  amount_financed    BIGINT NOT NULL,
  down_payment       BIGINT NOT NULL,
  received_on        DATE NOT NULL,         -- the insurer's notice of the agreement
  state              TEXT NOT NULL,         -- governs the cancellation and refund rules
  intent_notice_mailed_on DATE,             -- as represented by the PFC
  cancel_request_received_at TIMESTAMPTZ,
  cancellation_transaction_id UUID REFERENCES policy_transactions (id),
  refund_due_by      DATE,                  -- NY and TX: 60 days; FL: 30 days
  refund_payment_id  UUID REFERENCES payments (id),
  minimum_earned     BIGINT,                -- NY: greater of 10% of gross or $60
  status             TEXT NOT NULL CHECK (status IN ('active', 'paid_off', 'cancel_requested',
                       'cancelled', 'refunded', 'reinstated'))
);
```

The refund check on any pro rata cancellation, as a query over the term's entries and payments:

```sql
SELECT
  (SELECT COALESCE(SUM(amount), 0) FROM payments p
    WHERE p.billing_account_id = :account_id AND p.direction = 'received'
      AND p.status = 'settled')                                       AS collected,
  (SELECT COALESCE(SUM(pe.amount), 0) FROM premium_entries pe
    JOIN policy_transactions t ON t.id = pe.transaction_id
    WHERE t.policy_term_id = :term_id AND pe.kind = 'premium')        AS net_written;
-- refund owed = collected - net_written (after the cancellation's negative entries) - unpaid fees
```

Design choices:

- **Billing reads premium entries; it never computes premium.** Installments are a schedule over the entries, regenerated as a new version when a transaction changes the total.
- **Payments are provisional until final.** Cancellation rescission on a payment records the payment's status, and a later return reopens the nonpayment process under the state's rules.
- **The cancellation source `finance_company` is first-class,** with its own validation and refund routing.
- **Refunds route by interest:** PFC, servicer or insured, from party roles as of the cancellation date.

## Auditing

- **Every installment schedule version** with the transaction that caused it.
- **Every nonpayment cancellation tied to the invoice, the notice and its proof,** and every rescission to the payment that cured it.
- **Every PFC cancellation with the agreement, the represented intent notice, the receipt time, the computed effective date and the refund deadline met.**
- **Every refund with its computation, payee and method,** and its unclaimed property path if uncashed.
- **The refund identity** (collected minus earned, after fees) holds for every pro rata cancellation; exceptions are investigated.

## What This Means for the System You Build

- **Separate billing from policy and from payments:** policy writes entries, billing schedules and collects, the rail moves money.
- **Keep collections ahead of earned premium** with down payments and due dates, and check the refund identity on every cancellation.
- **Model premium finance companies as parties with statutory powers,** and implement each state's cancellation and refund clock.
- **Route refunds by interest** and pay them where the money came from.
- **Bill mortgage servicers early enough for escrow,** and notify them on any cancellation.
- **Apply state limits to pay plans** like any other rule.

## References

**Law and regulation**

- [N.Y. Banking Law 576](https://www.nysenate.gov/legislation/laws/BNK/576), the premium finance agency's 10-day plus 3-day notice, cancellation in the insured's name, the insurer's effective date, the 60-day pro rata return and the minimum earned premium
- [Tex. Ins. Code 651.161](https://texas.public.law/statutes/tex._ins._code_section_651.161), premium finance cancellation for default, the 10-day cure notice, notices to the insurer, insured and agent, and third-party notices by the 2nd business day
- [Tex. Ins. Code 651.162](https://texas.public.law/statutes/tex._ins._code_section_651.162), return of unearned premium within 60 days and the commission remittance deadline
- [Tex. Ins. Code 651.109](https://texas.public.law/statutes/tex._ins._code_section_651.109), finance charge limits by reference to Finance Code chapter 342
- [Fla. Stat. 627.840](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.840.html), the $12 per $100 per year service charge cap, the $20 additional charge and refund methods
- [Fla. Stat. 627.848](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.848.html), the 10-day notice, cancellation requests, the insurer's computation from receipt and the 30-day return
- [Cal. Ins. Code 673 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-673/), the lender's 5-day cancellation, confirmation, third-party notice, pro rata return and reinstatement replies
- [N.Y. Ins. Law 3425](https://www.nysenate.gov/legislation/laws/ISC/3425), payment within 15 days after a nonpayment notice is timely
- [N.Y. Ins. Law 3426](https://www.nysenate.gov/legislation/laws/ISC/3426), commercial nonpayment notices stating the amount due
- [Md. Code, Ins. 27-501 (PDF)](https://mgaleg.maryland.gov/2025RS/Statute_Web/gin/27-501.pdf), no payment plan required on the basis of credit history
- [12 CFR 1024.17](https://www.law.cornell.edu/cfr/text/12/1024.17), timely escrow disbursement of insurance premiums, advances, and the limit on force-placing for escrowed loans
- [12 CFR 1024.37](https://www.law.cornell.edu/cfr/text/12/1024.37), force-placed insurance notices, timing, cancellation and refunds

**Filings**

- [Guidewire Software: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1528396/000152839626000046/gwre-20260731.htm), InsuranceSuite's five core applications including BillingCenter
- [North Carolina Rate Bureau: Circular A-26-2 (PDF)](https://www.ncrb.org/Portals/0/ncrb/circular%20letters/automobile/2026/A-26-2%202026%20NC%20Personal%20Auto%20Rate%20Review%20and%20Program%20Changes.pdf?ver=8EeBogwTkuRGXminwAqqlw%3d%3d), short rate refunds when a premium finance company cancels

**Regulators and guidance**

- [North Carolina Department of Insurance: FAQs About Auto Insurance](https://www.ncdoi.gov/consumers/auto-and-vehicle-insurance/faqs-about-auto-insurance), 15 days' notice for nonpayment on liability coverages

**Vendor documentation**

- [Socotra: Policy transactions](https://docs.socotra.com/features/policy-management/policy-transactions), premium and other charges stored on each transaction
