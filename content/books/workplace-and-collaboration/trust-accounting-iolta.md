+++
title = "Trust Accounting & IOLTA"
description = "Client trust accounts under Rule 1.15, IOLTA programs, earned and unearned fees, three-way reconciliation, card payments into trust, and bar audits."
category = "Workplace & Collaboration Industry"
order = 2057
part = "Law Firms and Professional Services"
tags = ["legal-tech", "trust-accounting", "iolta", "reconciliation", "law-firms"]
+++

When a client pays a retainer before any work is done, the money isn't the firm's yet. It belongs to the client until the firm earns it, and the rules of professional conduct require the firm to keep it in a separate client trust account, to know at every moment how much of the balance belongs to each client, and to prove it on demand. The same goes for settlement proceeds the firm receives for a client, filing fees advanced for costs, and money held in escrow for a deal. Lawyers who get this wrong are disciplined more harshly than for almost anything else, because a trust shortage means one client's money was spent on another client or on the firm.

For software, trust accounting is the place where a legal product stops being a collaboration tool and becomes a fiduciary ledger. It is the same problem Property Tech's brokers have with owner and resident money ([Trust Accounting & the General Ledger](/books/property-tech/trust-accounting)), regulated by a different body (the state's highest court and its bar, not a real estate commission) and keyed by client and matter instead of owner and property. This chapter covers the rules (Model Rule 1.15 and the states' versions), IOLTA, earned and unearned fees, reconciliation, card payments into trust and the bar's audits, and how the trust ledger maps onto the book's core model. The double-entry mechanics and bank matching come from the Payments volume and the playbook and aren't repeated: [Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger), [A Matching Engine](/books/payments/ledger-and-reconciliation#a-matching-engine), [Breaks](/books/payments/ledger-and-reconciliation#breaks). This isn't legal advice.

## How the Platforms Do It

As of October 2026, from vendor documentation:

- **Trust ledgers per client and matter inside practice management.** Clio Manage, PracticePanther, Smokeball and CosmoLex each advertise trust accounting in the same product as matters and billing; PracticePanther promises "three-way trust reconciliations in minutes," and CosmoLex "three-way reconciliation and detailed audit trails."
- **Reconciliation as a matching screen that won't finish until it balances.** Clio's trust reconciliation matches ledger transactions against the bank statement, shows the difference as items are matched, and lets the user finish only "when the difference is $0," with an adjustment option it says "should not be used to force a difference of 0." The completed report shows transactions for the period and client ledger details and exports to PDF. Only administrators can reconcile. Firms on Clio Accounting reconcile there instead.
- **Payment processors built around trust.** LawPay says it "debits your operating account, never your trust account, once a month for all fees" and allows no trust debits "at any time for any reason, including client disputes and chargebacks." Clio Payments says "trust payments are always deposited in full" and transaction fees "are deducted from the operating account in compliance with IOLTA (US) and trust (Canada) rules." When 8am moved MyCase Payments customers to LawPay, the notice gave card pricing of 2.99% plus $0.30 per transaction with fees batched once a month.
- **The payment and the ledger are the same vendor.** In small-firm products the processor, the trust ledger and the invoice share a database, so a client payment against an invoice can land in the right bank account, post to the right client ledger and mark the right invoice paid in one step. That integration is most of the compliance value.

## Whose Money It Is

ABA Model Rule 1.15 ("Safekeeping Property") sets the frame most states follow:

- **Separate.** Client and third-party property must be held "separate from the lawyer's own property," with funds "kept in a separate account maintained in the state where the lawyer's office is situated, or elsewhere with the consent of the client or third person" (1.15(a)).
- **Recorded.** "Complete records of such account funds and other property shall be kept by the lawyer and shall be preserved for a period of [five years] after termination of the representation" (1.15(a)); the bracket marks a number each state chooses.
- **No commingling, with one exception.** A lawyer may put the lawyer's own money in trust "for the sole purpose of paying bank service charges on that account, but only in an amount necessary for that purpose" (1.15(b)).
- **Advances stay in trust until earned.** "A lawyer shall deposit into a client trust account legal fees and expenses that have been paid in advance, to be withdrawn by the lawyer only as fees are earned or expenses incurred" (1.15(c)).
- **Prompt notice, delivery and accounting** to the client or third person who has an interest (1.15(d)).
- **Disputed money stays put.** When two or more persons (one of whom may be the lawyer) claim an interest, the property "shall be kept separate by the lawyer until the dispute is resolved," and undisputed portions are distributed promptly (1.15(e)).

Every dollar in a trust account therefore has a **beneficiary** (a client, a third person such as a medical lienholder, or, for the bank-charge cushion only, the firm), usually tied to a **matter**:

| Money | Belongs to | Leaves trust when |
| --- | --- | --- |
| Advance fee (retainer) | The client | Earned and billed, then transferred to operating; or refunded |
| Advance for costs | The client | The cost is incurred and paid from trust, or refunded |
| Settlement or judgment proceeds | The client, and any third person with a claim (lienholders) | Distributed per a settlement statement; disputed portions held |
| Escrow for a transaction | The parties, per the escrow terms | The escrow conditions are met |
| Bank-charge cushion | The firm | Used for bank charges only |
| Earned fees not yet withdrawn | The firm | Must be withdrawn promptly; leaving them is commingling |

The last row is the one software forgets. Earned money left in trust is the firm's money in a client account, which is commingling just as much as depositing operating funds there. A system that bills against trust should prompt the transfer to operating at the same time, not leave it for a monthly sweep.

## IOLTA

Most client money held by a firm is too small or held too briefly to earn the client any net interest. **IOLTA** (Interest on Lawyers' Trust Accounts) programs pool such funds in one interest-bearing trust account per firm, and the interest goes to a state foundation that funds civil legal aid. Larger or longer-held funds go into a separate interest-bearing trust account for the client, whose interest the client keeps.

As the ABA Commission on IOLTA tallies it, IOLTA programs are created by a jurisdiction's highest court or by statute, and come in three types: **mandatory** (every lawyer who keeps client trust accounts must participate), **opt-out** and **voluntary**. Its status page counts 47 mandatory jurisdictions, 5 opt-out and 1 voluntary (the Virgin Islands), with the year each converted to mandatory; California, Connecticut, Maryland, New York and Ohio are marked as created by the legislature. Texas is typical of the history: its supreme court created IOLTA in 1984 as a voluntary program, and participation "became mandatory for Texas attorneys" in 1989; "only client funds that are nominal or held for a short period of time may be deposited into IOLTA accounts."

The test for which account a deposit belongs in is the lawyer's judgment, with factors. Florida's rule is a clean statement: "nominal or short term" describes funds that "cannot earn income for the client or third person in excess of the costs to secure the income," judged by the amount, how long it will be held, the likelihood of delay, the cost of a separate interest-bearing account, and the bank's minimum balances and service charges; the determination "rests in the sound judgment of the lawyer," and good-faith judgment isn't an ethics violation.

IOLTA survived two Supreme Court cases. In *Phillips v. Washington Legal Foundation* (1998), the Court held that interest earned on client funds in IOLTA accounts is the "private property" of the client for Takings Clause purposes. In *Brown v. Legal Foundation of Washington* (2003), it held that even if transferring the interest is a taking, just compensation "is measured by the property owner's loss rather than the government's gain," and that loss "is zero whenever the Washington law is obeyed," because the funds couldn't have earned the client net interest.

For a system:

- **Each trust bank account has a type:** IOLTA (pooled, interest to the foundation) or a separate interest-bearing client trust account (interest to the client, credited to that client's ledger).
- **The deposit decision is recorded** with the factors the lawyer considered, because the rule makes it a judgment call, and a later reviewer will ask why a large settlement sat in IOLTA for months.
- **IOLTA interest never touches a client ledger,** and the bank remits it; a separate account's interest posts to the client.

## State Rules

Every state has its own version of Rule 1.15 and its own recordkeeping rules, often modeled on the ABA's Model Rules on Client Trust Account Records. Those model records rules list what to keep for the bracketed [five years]: receipt and disbursement journals with the date, source and description of each deposit and the date, payee and purpose of each disbursement; a ledger for each client or beneficiary; retainer and fee agreements; accountings to clients; bills; bank statements and deposit records; records of electronic transfers including who authorized them; "[monthly] trial balances and [quarterly] reconciliations"; and the parts of client files related to trust transactions. Their safeguards rule adds that only a lawyer admitted in the jurisdiction or someone under the lawyer's direct supervision may sign or authorize transfers, that "receipts shall be deposited intact," and that withdrawals go by check to a named payee, "not to cash," or by authorized electronic transfer.

Three states as examples, from their own rules and handbooks:

| Rule | Florida | California | Illinois |
| --- | --- | --- | --- |
| Account | Separate federally insured account, labeled a trust account; advances for fees, costs and expenses included | Client trust account | Client trust account at a bank that agrees to report overdrafts to the ARDC |
| Lawyer's own funds | Only enough for bank charges; may replenish a shortage and must notify the bar immediately | Not covered here | Not covered here |
| Reconciliation | Monthly bank reconciliation and a monthly comparison of reconciled balances to the total of client ledgers, with differences explained | Monthly reconciliation of client ledgers, account journal and bank statements | Three-way reconciliation at least quarterly (monthly preferred) |
| Records kept | 6 years after the final conclusion of each representation | 5 years after final distribution | 7 years after the end of the representation |
| Firm-level duties | Written trust account plan for any firm with more than one lawyer; annual detailed listing of balances per client | Annual CTAPP registration of every trust account, certification and self-assessment | Disclosure of trust accounts at annual registration (Supreme Court Rule 756(d)) |
| Annual filing | Trust accounting certificate between June 1 and August 15; delinquent if not filed by September 30 | Due with license fees | With annual registration |

Details worth modeling:

- **Florida limits electronic transfers out of trust** to payments to or for clients and third parties, properly incurred expenses, earned undisputed fees, and transfers between trust accounts. It also requires the bank to be authorized to report overdrafts and dishonored trust checks to the bar.
- **California's Client Trust Account Protection Program** (CTAPP, Rule 2.5 of the Rules of the State Bar, effective January 1, 2023) requires each licensee every year to certify whether they were responsible for client funds and, if so, that they are "knowledgeable about, and in compliance with" the rules; to register "each and every trust account" (bank, routing and account numbers, account name, dates opened and closed, the balance on a specified date, and, from January 1, 2026, the designated licensee's name and license number); and to complete a self-assessment, by the licensee's license fee due date. California's handbook adds that a lawyer who uses software or a bookkeeper "is still personally responsible."
- **Illinois reorganized its rule** into Rules 1.15, 1.15A, 1.15B and 1.15C effective July 1, 2023, and allows electronic records if printed copies can be produced and the records are readily accessible.

The rule set is per jurisdiction and per date, and a firm with offices in several states has accounts under different rules. The platform stores rules as dated rows (reconciliation frequency, retention period, filing window, overdraft reporting), not as code paths ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## Earned and Unearned Fees

The transfer from trust to operating is where most trust problems start, because it's the moment client money becomes firm money.

- **Hourly work against a retainer:** the fee is earned as the work is done, but most firms transfer only after billing the client, so the client sees what was taken and why. The transfer amount must equal the billed and earned amount, and the client's ledger shows both the invoice and the transfer.
- **Advances for costs:** paid out of trust to the vendor (the court, the court reporter) when incurred, or reimbursed to operating if the firm paid first, with the receipt.
- **Flat fees:** states differ on whether an advance flat fee is earned on receipt. California's Rule 1.15(b) lets a flat fee paid in advance go into the operating account with written disclosure to the client, and if the fee "exceeds $1,000.00" the client's agreement must be in a writing signed by the client. The engagement letter's terms decide which account the payment goes to ([Engagement Letters](/books/workplace-and-collaboration/matters-intake-and-conflicts#engagement-letters)).
- **Disputed fees:** if the client disputes an invoice, the disputed portion stays in trust (Rule 1.15(e)) and only the undisputed portion moves.
- **Contingent fees:** settlement proceeds go into trust; the firm's percentage, the expenses and any liens come out per a written closing statement (Rule 1.5(c) requires one showing "the remittance to the client and the method of its determination").

In the ledger, a fee transfer is one transaction with four legs: debit the client's trust liability, credit trust cash; debit operating cash, credit the client's receivable (or fee income). It references the invoice it pays and is blocked if it would take the client's matter balance below zero.

## Three-Way Reconciliation

The proof that a trust account is right is a reconciliation of three numbers on the same date: the adjusted bank balance (statement balance plus deposits in transit, minus outstanding checks), the trust account's book balance, and the total of every client ledger. All three must agree, and no client ledger may be negative. Property Tech's chapter walks through the mechanics, the formula and the reasons the third leg exists ([Three-Way Reconciliation](/books/property-tech/trust-accounting#three-way-reconciliation)), and its section on negative balances shows how shortages arise and how software stops them ([Negative Balances and Conversion](/books/property-tech/trust-accounting#negative-balances-and-conversion)). The law-firm versions differ in vocabulary and frequency:

- **The beneficiary is the client and matter,** and a single client with three matters has three ledgers. One matter's negative balance covered by another matter's surplus for the same client is still a problem where the money was advanced for a specific matter (Florida's rule says money entrusted "for a specific purpose" must be applied "only to that purpose").
- **Frequency is set by the state:** Florida and California monthly, Illinois at least quarterly, and the ABA's model records rule brackets monthly trial balances and quarterly reconciliations. My default is to reconcile monthly everywhere and match bank lines daily, because a bank feed makes it cheap and the strictest state sets the floor for a multistate firm anyway.
- **Bank and book alone is not enough.** Clio's reconciliation in Clio Manage matches the trust ledger to the bank statement until the difference is zero and includes client ledger details in the report; the client-ledger total is the third leg a reviewer must see tie out on the same page. A two-way reconciliation that balances while one client's ledger is negative hides exactly the error the rules care about.
- **Adjustments are explained, never plugs.** Clio's own help warns against using adjustments to force a zero difference. Every adjustment has a reason, an approver, and a link to the underlying error.

## Cards and Trust Money

Taking a card payment into a trust account has two problems that ordinary merchants don't, and the Payments volume's account of fees and who bears them is the background ([Four Ways to Pass On the Cost](/books/payments/surcharging-and-fees#four-ways-to-pass-on-the-cost), [What State Law Allows](/books/payments/surcharging-and-fees#what-state-law-allows)).

**Fees can't come out of the client's money.** A typical processor nets its fee out of each deposit, so a $1,000 retainer arrives as $970. In a trust account that's a $30 shortage on that client's ledger, and paying it from the trust account's other money takes it from other clients. The ABA safeguards rule's "receipts shall be deposited intact" points the same way. The law-firm processors' answer is the one LawPay and Clio Payments describe: deposit trust payments in full and debit fees from the operating account. Virginia's ethics opinion LEO 1848 (2009) calls it best practice that "all associated costs and fees be deducted from the lawyer's operating account so as not to allow the financial institution potential access to funds not belonging to the lawyer."

**Chargebacks can reach other clients' money.** If a client disputes a card payment after the firm has spent or transferred the funds, the processor claws back from the account it deposited to. State opinions agree on the duty:

- **North Carolina** (97 Formal Ethics Opinion 9, 1998) allows a merchant agreement that lets the bank debit trust for chargebacks only if the lawyer protects other clients' funds, says the lawyer should first try to have debits taken from a non-trust account, and requires the lawyer "under all circumstances" to cover a chargeback that endangers other clients' funds.
- **Virginia** (LEO 1848) says chargebacks that jeopardize other clients' funds must be "promptly if not immediately covered with the lawyer's own funds" and that, advisably, "all chargebacks should be from the lawyer's operating account."
- **Michigan** (RI-344, 2008) prefers advance fees into trust with fees and chargebacks from the business account, and says fees paid into trust "should not be considered fully earned until the credit card dispute period has expired."
- **California** (Formal Opinion 2007-172) goes further for one kind of payment: a lawyer "may not ethically accept a deposit for advances for costs and expenses from a client by credit card," because such an advance must go into trust and the account it's paid through is subject to invasion through chargebacks.

The ABA's own Formal Opinion 00-419 (July 7, 2000) covers the use of credit cards for payment of legal fees. Passing card fees on to the client is a separate question of disclosure and state surcharging law; Virginia's opinion allows it with disclosure and consent and notes the state attorney general's view that the fee is a finance charge to be disclosed in advance.

For a system:

- **Route each payment to the right account at checkout:** an invoice for earned fees goes to operating; a retainer or cost advance goes to trust; California cost advances by card are refused.
- **Deposit trust payments gross,** and bill processing fees, refunds and chargebacks to an operating account by contract with the processor.
- **Hold card-funded trust money as not yet available** for transfer to operating until a dispute window the firm sets has passed, following Michigan's reasoning.
- **When a chargeback hits trust anyway,** open a break on the client's ledger and require the firm to deposit its own funds to cover it the same day, with the deposit recorded as a firm advance.

## Overdrafts, Certifications and Audits

States build a tripwire into the bank: Florida requires the firm to authorize its bank to notify the bar of overdrafts and dishonored trust checks, and Illinois allows trust accounts only at banks that agree to report overdrafts to the ARDC. An overdraft on a trust account usually reaches the regulator before the firm's monthly reconciliation would.

The annual cycle adds certifications: Florida's trust accounting certificate, California's CTAPP registration and self-assessment, Illinois's disclosure at registration. When a bar examines an account, the records it works from are the ones the model rules list: journals, client ledgers, monthly reconciliations with their supporting statements, transfer authorizations and the fee agreements behind each withdrawal.

A platform that holds the trust ledger should be able to produce, for any account and date range, the auditor's package without a person assembling it: every reconciliation as frozen at the time, every client ledger, every transfer with the invoice and authorization behind it, and the account's registration details as filed.

## Closing a Matter's Trust Balance

A matter can't close with money in trust ([Matter Closing and File Retention](/books/workplace-and-collaboration/matters-intake-and-conflicts#matter-closing-and-file-retention)). Rule 1.16(d) requires refunding "any advance payment of fee or expense that has not been earned or incurred." The closing workflow bills any remaining earned time, transfers the earned amount, refunds the rest with a final accounting, and confirms the matter's trust ledger is zero.

When the client can't be found, the balance is unclaimed property under the state's escheat law; Property Tech covers the mechanics of dormancy periods and reporting ([Unclaimed Property](/books/property-tech/trust-accounting#unclaimed-property)). The ledger needs a holding beneficiary for unidentified and unclaimed money with an aging clock, never a plug to zero.

## How to Build It

Deltas against the book's core data model and the matter tables in [How to Build It](/books/workplace-and-collaboration/law-firms-and-professional-services#how-to-build-it). The double-entry tables (`ledger_accounts`, `ledger_transactions`, `ledger_entries`) and `bank_accounts` are the Payments volume's ([The Core Data Model](/books/payments/card-payments#the-core-data-model)), with its matching and break tables for the bank leg; the reconciliation record follows Property Tech's shape. This chapter keys them to the firm and matter:

```sql
-- The firm's books live in the firm's workspace.
ALTER TABLE ledger_accounts
  ADD COLUMN workspace_id  UUID REFERENCES workspaces (id),
  ADD COLUMN client_id     UUID REFERENCES clients (id),
  ADD COLUMN matter_id     UUID REFERENCES matters (container_id),
  ADD COLUMN third_party_id UUID REFERENCES parties (id),       -- lienholders, escrow parties
  ADD COLUMN trust_role    TEXT CHECK (trust_role IN ('trust_cash', 'client_funds', 'third_party_funds',
                             'firm_cushion', 'unidentified', 'unclaimed', 'operating_cash',
                             'fees_receivable', 'fee_income'));

ALTER TABLE bank_accounts
  ADD COLUMN workspace_id     UUID REFERENCES workspaces (id),
  ADD COLUMN trust_type       TEXT CHECK (trust_type IN ('iolta', 'client_interest_bearing', 'operating')),
  ADD COLUMN jurisdiction     TEXT,                  -- ISO 3166-2 whose rules govern it
  ADD COLUMN overdraft_reporting_authorized BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN registered_at    DATE;                  -- e.g. California CTAPP registration

CREATE TABLE trust_rules (                           -- per jurisdiction, dated
  jurisdiction       TEXT NOT NULL,
  reconcile_every    INTERVAL NOT NULL,              -- '1 month', '3 months'
  records_years      SMALLINT NOT NULL,              -- 5, 6, 7
  retention_anchor   TEXT NOT NULL CHECK (retention_anchor IN ('end_of_representation',
                       'final_distribution')),
  card_cost_advances BOOLEAN NOT NULL,               -- false in California
  annual_filing      TEXT,                           -- 'fl_certificate', 'ca_ctapp', 'il_756d'
  source_ref         TEXT NOT NULL,
  valid_during       DATERANGE NOT NULL,
  PRIMARY KEY (jurisdiction, valid_during)
);

CREATE TABLE trust_deposit_decisions (               -- IOLTA or a separate account, and why
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  matter_id          UUID NOT NULL REFERENCES matters (container_id),
  amount             BIGINT NOT NULL,
  expected_hold_days INT NOT NULL,
  chosen_account_id  UUID NOT NULL REFERENCES bank_accounts (id),
  decided_by         UUID NOT NULL REFERENCES members (id),   -- a lawyer
  decided_at         TIMESTAMPTZ NOT NULL
);

CREATE TABLE trust_transfers (                       -- every movement out of a client's trust balance
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  matter_id          UUID NOT NULL REFERENCES matters (container_id),
  kind               TEXT NOT NULL CHECK (kind IN ('earned_fee', 'cost_paid', 'cost_reimbursed',
                       'client_refund', 'settlement_distribution', 'third_party_payment',
                       'trust_to_trust', 'chargeback_cover')),
  amount             BIGINT NOT NULL CHECK (amount > 0),
  legal_invoice_id   UUID,                           -- the invoice an earned_fee pays
  payee_party_id     UUID REFERENCES parties (id),
  available_after    TIMESTAMPTZ,                    -- card-funded money not yet transferable
  requested_by       UUID NOT NULL REFERENCES members (id),
  approved_by        UUID REFERENCES members (id),   -- an admitted lawyer, or under their supervision
  ledger_transaction_id UUID REFERENCES ledger_transactions (id),
  status             TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'posted', 'rejected')),
  CHECK (approved_by IS NULL OR approved_by <> requested_by)
);

CREATE TABLE trust_reconciliations (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  bank_account_id        UUID NOT NULL REFERENCES bank_accounts (id),
  as_of                  DATE NOT NULL,
  statement_balance      BIGINT NOT NULL,
  deposits_in_transit    BIGINT NOT NULL,
  outstanding_payments   BIGINT NOT NULL,
  adjusted_bank_balance  BIGINT NOT NULL,
  book_balance           BIGINT NOT NULL,
  client_ledger_total    BIGINT NOT NULL,
  negative_ledgers       INT NOT NULL,              -- expected: zero
  prepared_by            UUID NOT NULL REFERENCES members (id),
  reviewed_by            UUID REFERENCES members (id),
  evidence_item_id       UUID REFERENCES items (id), -- the frozen report, filed to a firm container
  CHECK (adjusted_bank_balance = statement_balance + deposits_in_transit - outstanding_payments),
  CHECK (reviewed_by IS NULL OR reviewed_by <> prepared_by),
  UNIQUE (bank_account_id, as_of)
);
```

The client-ledger leg is a query over the ledger, per matter, as of the date:

```sql
SELECT la.matter_id, SUM(e.amount) AS balance
FROM ledger_accounts la
JOIN ledger_entries e      ON e.ledger_account_id = la.id
JOIN ledger_transactions t ON t.id = e.ledger_transaction_id AND t.status = 'posted'
WHERE la.workspace_id = :workspace_id
  AND la.trust_role IN ('client_funds', 'third_party_funds', 'unidentified', 'unclaimed', 'firm_cushion')
  AND t.effective_at < (:as_of::date + 1)
  AND EXISTS (SELECT 1 FROM ledger_entries e2
              JOIN ledger_accounts c ON c.id = e2.ledger_account_id
              WHERE e2.ledger_transaction_id = t.id
                AND c.trust_role = 'trust_cash'
                AND c.id = :trust_cash_account_id)
GROUP BY la.matter_id;
```

How it runs:

1. **Every trust posting names a matter** (or a third party, the cushion, or suspense), and a constraint trigger rejects a trust cash entry without a liability-side entry for a beneficiary.
2. **Transfers check the matter's available balance** (excluding card-funded money still inside the dispute window) at approval and again at posting, in the same transaction as the ledger write.
3. **Earned-fee transfers require an invoice** and can't exceed its unpaid amount or the undisputed part of it; posting the invoice payment prompts the transfer so earned money doesn't sit in trust.
4. **Payments route by purpose:** the checkout knows whether a payment is for an invoice (operating) or an advance (trust), deposits trust payments gross and posts processor fees to operating ([Applying Money to Invoices](/books/payments/checkout-and-invoicing#applying-money-to-invoices)).
5. **Bank lines import daily** and match; the reconciliation is assembled from matched items and the client-ledger query on the state's schedule, frozen with the report filed as an item, and reviewed by someone other than the preparer.
6. **An unbalanced or unreviewed reconciliation blocks fee transfers** from that account until resolved, the trust version of the Payments volume's rule that cash breaks hold payouts.

## Auditing

- **Every deposit:** source, client and matter, the account chosen and the IOLTA decision behind it, whether deposited intact, and the bank's record.
- **Every transfer out:** kind, amount, matter, invoice or settlement statement behind it, who requested, who approved (an admitted lawyer or under one's supervision), and the ledger transaction.
- **Every reconciliation:** the three numbers, outstanding items with ages, negative ledgers (expected none), adjustments with reasons, preparer, reviewer, and the frozen report, kept for the longest retention period among the firm's jurisdictions.
- **Card events touching trust:** fees billed to operating, chargebacks, and the firm's covering deposits with timestamps.
- **Annual filings:** what was certified or registered, when, and by whom, per account and jurisdiction ([Audit Trails](/docs/architecture/audit-trails#what-a-record-holds)).

## What This Means for the System You Build

- **Treat trust as a fiduciary ledger,** with a beneficiary (client and matter, or third party) on every dollar and no negative ledger ever allowed.
- **Type each bank account** as IOLTA, separate interest-bearing trust or operating, and record the lawyer's deposit decision.
- **Store state trust rules as dated rows:** reconciliation frequency, retention period and anchor, filing windows, card restrictions.
- **Move earned fees promptly and only against an invoice,** keeping disputed amounts in trust.
- **Reconcile three ways on the strictest schedule,** with adjustments explained, never plugged, and fee transfers blocked while an account is out of balance.
- **Deposit card payments to trust in full,** charge fees and chargebacks to operating, and hold card-funded trust money until the dispute window passes.
- **Produce the auditor's package on demand** from frozen records, not from a report someone reruns.

## References

**ABA Model Rules and IOLTA**

- [ABA Model Rule 1.15: Safekeeping Property](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_15_safekeeping_property/), separate accounts, records, bank charges, advances and disputed funds
- [ABA Model Rule 1.5: Fees](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_5_fees/), the contingent-fee closing statement
- [ABA Model Rule 1.16: Declining or Terminating Representation](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_16_declining_or_terminating_representation/), refunding unearned advances on termination
- [ABA Model Rules on Client Trust Account Records, Rule 1](https://www.americanbar.org/groups/professional_responsibility/resources/client_protection/aba-model-rules-on-client-trust-account-records---rule-1/), the records list and bracketed reconciliation frequencies
- [ABA Model Rules on Client Trust Account Records, Rule 2](https://www.americanbar.org/groups/professional_responsibility/resources/client_protection/aba-model-rules-on-client-trust-account-records---rule-2/), signatories, receipts deposited intact and withdrawals
- [ABA Commission on IOLTA: Status of IOLTA Programs](https://www.americanbar.org/groups/interest_lawyers_trust_accounts/resources/status_of_iolta_programs/), program types, counts and how programs were created
- [ABA Formal Ethics Opinions: Index by Issue Dates](https://www.americanbar.org/groups/professional_responsibility/publications/ethics_opinions/index_by_issue_dates/), Opinion 00-419 on credit cards for legal fees
- [Texas Access to Justice Foundation: What is IOLTA](https://teajf.org/attorneys/what_is_iolta.aspx), the 1984 start, mandatory participation from 1989 and the nominal or short-term rule

**Court decisions**

- [Phillips v. Washington Legal Foundation, 524 U.S. 156 (1998)](https://www.law.cornell.edu/supct/html/96-1578.ZS.html), IOLTA interest as the client's private property
- [Brown v. Legal Foundation of Washington, 538 U.S. 216 (2003)](https://www.law.cornell.edu/supct/html/01-1325.ZS.html), just compensation measured by the owner's loss, which is zero

**State rules and opinions**

- [The Florida Bar: Rules Regulating The Florida Bar, Chapter 5 (June 2026)](https://www-media.floridabar.org/uploads/2026/06/2026_12-JUNE-Chapter-5-RRTFB-1.pdf), trust accounts, nominal or short-term funds, reconciliation, trust plans, retention, overdraft reporting, electronic transfers and the annual certificate
- [State Bar of California: Rule 1.15 executive summary and redline](https://www.calbar.ca.gov/Portals/0/documents/rules/Rule_1.15-Exec_Summary-Redline.pdf), flat fees over $1,000 and five-year records
- [State Bar of California: CTAPP rules](https://www.calbar.ca.gov/Portals/0/documents/rules/Rules_Title2_Div.1.5-CTAPP.pdf), Rule 2.5's certification, registration, self-assessment and deadline
- [State Bar of California: CTAPP FAQ](https://www.calbar.ca.gov/Portals/0/documents/ctapp/CTAPP-FAQ.pdf), the deadline tied to license fees
- [State Bar of California: Handbook on Client Trust Accounting (2023)](https://www.calbar.ca.gov/Portals/0/documents/ethics/Publications/2023_CTA_Handbook.pdf), monthly reconciliation, personal responsibility and Formal Opinion 2007-172 on card advances for costs
- [Illinois ARDC: Client Trust Account Handbook (January 2026)](https://iardc.org/Files/ClientTrustAccountHandbook.pdf), Rules 1.15A to 1.15C, quarterly three-way reconciliation, seven-year records, overdraft-reporting banks and Rule 756(d)
- [North Carolina State Bar: 97 Formal Ethics Opinion 9](https://www.ncbar.gov/for-lawyers/ethics/adopted-opinions/97-formal-ethics-opinion-9/), chargebacks and protecting other clients' funds
- [Virginia State Bar: LEO 1848](https://vsb.org/common/Uploaded%20files/LEOs/1848.pdf), fees and chargebacks from the operating account and passing on fees
- [State Bar of Michigan: RI-344](https://www.michbar.org/opinions/ethics/numbered_opinions/RI-344), two-account setup and fees not earned until the dispute period ends

**Vendor documentation**

- [Clio Help: Trust Reconciliation in Clio](https://help.clio.com/hc/en-us/articles/9290138047899-Trust-Reconciliation-in-Clio), matching to a zero difference, adjustments, reports and admin-only reconciliation
- [Clio Help: Set Transaction Fee Schedule](https://help.clio.com/hc/en-us/articles/9285813698075-Set-Transaction-Fee-Schedule), trust payments deposited in full and fees from operating
- [LawPay: Compliance](https://www.lawpay.com/compliance), fees from operating and no trust debits including chargebacks
- [MyCase: MyCase Payments migration](https://supportcenter.mycase.com/en/articles/10371719-mycase-payments-migration-2025), LawPay pricing and monthly fee batching
- [PracticePanther](https://www.practicepanther.com/), three-way trust reconciliation
- [CosmoLex](https://www.cosmolex.com/), trust and business accounting and three-way reconciliation
- [Smokeball](https://www.smokeball.com/), trust accounting
