+++
title = "Commissions & Agency Accounting"
nav_title = "Commissions"
description = "Commission schedules, new and renewal rates, contingent commissions and disclosure, agency bill and direct bill, premium trust accounts, statements, clawbacks."
category = "Insurance Industry"
order = 2716
part = "Distribution"
tags = ["insurance", "distribution", "commissions", "accounting", "fiduciary-funds"]
+++

A producer is paid a percentage of the premium on the business it places, and almost everything else about insurance compensation is a refinement of that sentence. The percentage depends on the carrier, the product, the state, whether the policy is new or renewing, and the agency's contract. It is earned when the policy is written, and partly given back when the policy cancels. On top of it sit contingent commissions, paid a year later if the agency's book was profitable or grew, which New York's attorney general made the center of a national scandal in 2004 and which brokers now report as a line in their earnings. Whether the money flows from the insured to the agency to the carrier (agency bill) or from the insured to the carrier, which sends the agency a statement (direct bill), decides who holds premium, and premium held by an agent is a trust fund under state law, not the agent's money.

This chapter covers commission schedules, new and renewal commissions, contingent and profit-sharing commissions and their disclosure, revenue recognition, agency bill and direct bill, premium trust accounts, commission statements and downloads, and clawbacks, with a policy worked from new business through cancellation. It extends `policy_transactions` and `producers` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `commission_schedules`, `commissions` and `commission_statements`. The ledger mechanics are general ([The Commission Ledger](/books/field-operations/sales-teams-and-commissions#the-commission-ledger) and [The Residual Engine](/books/payments/partners-and-residuals#the-residual-engine) solve the same shape in other industries); this chapter covers what insurance adds.

## How the Platforms Do It

What carriers and brokers publish about how commissions work, as of November 2026:

| Company | What it discloses | Source |
| --- | --- | --- |
| **Allstate** | Exclusive agents: a monthly base commission on eligible written premium, variable pay for new customers and bundling, monthly and annual bonuses tied to profitable growth. Independent agents: a monthly base commission plus an annual profit share on growth and profit targets | 2025 10-K |
| **Travelers** | A fixed base commission as a percentage of premium; contingent pay for meeting "pre-set goals," usually annual, on profitability (a "pre-set ratio of losses to premium"), volume, growth or retention and tactical goals such as EFT enrollment; fixed value-based compensation; production incentives such as book rolls, new business overrides and contests | Producer compensation disclosure page |
| **Brown & Brown** | Revenue recognized at the policy effective date, with a cancellation reserve from historical experience; "profit-sharing contingent commissions" of $255M in 2025, based primarily on underwriting results, accrued during the year and trued up mainly in the first and second quarters of the next | 2025 10-K and fourth quarter release |
| **Arthur J. Gallagher** | Base commissions $8,024M, fees $2,646M, supplemental revenues $466M and contingent revenues $324M in brokerage for 2025 | Fourth quarter 2025 release |
| **Goosehead** | Contingent commissions of $38.4M in 2025, $29.1M still receivable at year end; contingents estimated over the period they are earned | 2025 10-K |
| **Ivans** | Direct Bill Commission Statement (DBCS) downloads from carriers into the agency management system, reconciled monthly | Ivans Download product page |

The table already shows the three kinds of producer pay a system has to model: a **base commission** on each transaction, a **contingent** or profit-sharing payment computed on a whole book after the year ends, and **supplemental** or other incentive pay based on volume, plus fees the client pays directly for a broker's service.

## Commission Schedules

A commission schedule is a rate table in the agency contract: a percentage of written premium by insurer, product (or line), state, new or renewal, and sometimes by program, tier or policy size. It is versioned like a rate table, because carriers change schedules on a date and the rate that applies is the one in force when the transaction was written, usually keyed to the policy term's effective date so a whole term earns on one schedule.

Commission is computed per policy transaction, on the written premium that transaction produced, never on the policy's current premium. A worked homeowners policy (my example, at a 15% new business rate):

| Transaction | Effective | Written premium | Commission at 15% |
| --- | --- | --- | --- |
| New business, annual term, 365 days | April 1, 2026 | $2,400.00 | $360.00 |
| Endorsement adding $500.00 of annual premium, 274 days left | July 1, 2026 | 500 × 274 / 365 = $375.34 | $56.30 |
| Cancellation at the insured's request, 182 days left, pro rata | October 1, 2026 | 2,400 × 182 / 365 + 500 × 182 / 365 = $1,196.71 + $249.32 = ($1,446.03) | ($216.90) |
| **Net for the term** | | **$1,329.31** | **$199.40** |

The net commission is 15% of the net written premium (1,329.31 × 0.15 = $199.40), which is the check every commission ledger should pass: commission on a policy equals the rate times the sum of its transactions' written premium, within a cent of rounding per transaction. If the cancellation had been short rate, the return premium would be smaller and so would the clawback; the rate applies to whatever the transaction wrote. The contract defines the base; keeping taxes and fees as separate kinds of `premium_entries` lets the system compute it either way.

## New Versus Renewal

Schedules can pay different rates on new business and renewals, and incentives often favor new customers (Allstate's exclusive agents get variable pay for new customers and bundling on top of base commission). Two system consequences:

- **What counts as new is a rule.** A rewrite (a policy cancelled and reissued on a new policy number to change product or company) may be paid as new or as renewal depending on the contract; a policy moved to the agency by a producer of record change may earn renewal rates from the next term ([Who the Agent Works For](/books/insurance/agents-brokers-and-channels#who-the-agent-works-for)). Store the rule and the classification on the transaction.
- **The renewal is the agency's asset.** Goosehead's franchise agreement charges a 20% royalty on first-term commissions and 50% on renewal commissions, including renewals moved to a different carrier, and its 2025 revenue shows renewal royalties of $170.8 million against $30.2 million of new business royalties. Who keeps the renewal commission when an agent leaves is a contract term, and the system follows the contract, not the agent.

Life and annuity commissions run on a different shape, with first-year commissions, renewal commissions over a set number of years and chargebacks if a policy lapses early; [In-Force Administration](/books/insurance/in-force-administration) covers them.

## Contingent and Profit-Sharing Commissions

A contingent commission is paid on a producer's whole book with a carrier, after a measurement period, if the book met targets: usually a loss ratio below a threshold, often combined with premium volume, growth or retention. Travelers describes its contingent pay as rewards for "pre-set goals" on profitability, measured as a "pre-set ratio of losses to premium," and on volume, growth, retention and tactical goals.

**The history.** On October 14, 2004 New York's attorney general sued Marsh over its contingent commission practices, and the Insurance Department followed with a citation on October 21; Marsh stopped accepting contingent compensation effective October 1, 2004. On January 31, 2005 it settled with the attorney general and the New York Insurance Superintendent, creating an $850 million fund for US clients whose 2001-2004 placements generated contingent commissions, paid in four installments from June 2005 to June 2008 ($255 million, $255 million, $170 million, $170 million), with "no portion" of it a fine or penalty, and committed to "comprehensive disclosure of all forms of compensation." The large brokers' later settlements and the state disclosure rules that followed let contingent pay return with disclosure. <!-- source-gap: contingent-commission-2010 | missing | the 2010 amendments to the 2005 broker settlements that allowed contingent commissions to resume | closes with: a New York Attorney General or DFS release on the amended Marsh, Aon and Willis agreements | checked: 2026-11-09 --> Today Brown & Brown reported $255 million of profit-sharing contingent commissions for 2025, Gallagher $324 million of contingent revenues and $466 million of supplemental revenues, and Goosehead $38.4 million.

**The disclosure.** Under the NAIC model act's compensation disclosure section, a producer paid by the customer must disclose insurer compensation, including the method when the amount isn't known ([Who the Agent Works For](/books/insurance/agents-brokers-and-channels#who-the-agent-works-for)); New York's Regulation 194 requires every producer to tell the buyer that compensation "may vary" by insurer, contract, volume or profitability, and to describe it on request. A contingent agreement is a document the system must be able to produce for a disclosure.

**The computation.** No carrier publishes a full grid, so here is an illustrative profit-sharing formula, mine: the agency earns 20% of the difference between a 60% target loss ratio and its actual loss ratio, times earned premium, capped at 5% of earned premium, if earned premium is at least $1 million. An agency with $4,800,000 of earned premium and $2,016,000 of incurred losses has a 42% loss ratio: (0.60 - 0.42) × 4,800,000 × 0.20 = **$172,800**, under the $240,000 cap. Every input is defined in the agreement and each is a query: which lines are included, earned or written premium, incurred losses as of which date (twelve months after year end, typically, so reserves have developed), whether large losses are capped, whether the result is netted against a prior year's deficit.

```go tab="Go"
type ProfitShare struct {
	TargetLossRatioBP int   // 6000 = 60%
	ShareBP           int   // 2000 = 20%
	CapBP             int   // 500 = 5% of earned premium
	MinEarned         int64 // minor units
}

// Contingent returns the profit-sharing commission in minor units.
func (p ProfitShare) Contingent(earned, incurred int64) int64 {
	if earned < p.MinEarned || earned == 0 {
		return 0
	}
	// margin = target*earned - incurred, in minor units
	margin := earned*int64(p.TargetLossRatioBP)/10000 - incurred
	if margin <= 0 {
		return 0
	}
	amount := margin * int64(p.ShareBP) / 10000
	if capAmt := earned * int64(p.CapBP) / 10000; amount > capAmt {
		amount = capAmt
	}
	return amount
}
```

```rust tab="Rust"
pub struct ProfitShare {
    pub target_loss_ratio_bp: i64, // 6000 = 60%
    pub share_bp: i64,             // 2000 = 20%
    pub cap_bp: i64,               // 500 = 5% of earned premium
    pub min_earned: i64,           // minor units
}

impl ProfitShare {
    /// Profit-sharing commission in minor units.
    pub fn contingent(&self, earned: i64, incurred: i64) -> i64 {
        if earned == 0 || earned < self.min_earned {
            return 0;
        }
        let margin = earned * self.target_loss_ratio_bp / 10_000 - incurred;
        if margin <= 0 {
            return 0;
        }
        (margin * self.share_bp / 10_000).min(earned * self.cap_bp / 10_000)
    }
}
```

With the worked figures in cents (earned 480,000,000, incurred 201,600,000): margin is 288,000,000 - 201,600,000 = 86,400,000; 20% is 17,280,000 cents, $172,800.00.

## Recognizing Commission Revenue

For an agency or broker, commission is revenue under [ASC 606](/docs/money/accounting#asc-606-and-ifrs-15-in-five-steps), and the brokers' 10-Ks describe the same treatment. Brown & Brown says its "performance obligation is complete upon the effective date of the bound policy," so commission is recognized then, with any separately performed services allocated part of the commission by relative value; it estimates the variable parts, and "management determines a cancellation reserve based upon historical cancellation experience." Contingent commissions are variable consideration: Brown & Brown accrues them through the year from premiums written and known losses and trues them up mainly in the next year's first two quarters, and Goosehead "estimates the amount to be received during the period over which the Contingent Commissions are earned."

Three numbers, then, for every agency period: commission recognized on transactions effective in the period, a cancellation reserve against it, and accrued contingents. A carrier's side is the mirror: commission expense is incurred as premium is written, part of the expense ratio on written premium ([The Ratios That Run the Business](/books/insurance/how-insurers-make-money#the-ratios-that-run-the-business)), and contingents are accrued as a liability through the year.

## Agency Bill and Direct Bill

Who bills the insured decides where the money flows:

- **Agency bill.** The agency invoices the insured, collects the gross premium and remits the premium net of its commission to the carrier, on an account current (a periodic statement of every transaction and the net due). California's statute lists remitting "net of commissions" as one of the ways a licensee may handle premium it receives (Cal. Ins. Code 1734). The agency holds premium between collection and remittance and does the collection work.
- **Direct bill.** The carrier bills and collects from the insured ([Billing & Premium Finance](/books/insurance/billing-and-premium-finance)) and pays the agency its commission, with a commission statement listing every transaction it was paid on. Ivans downloads Direct Bill Commission Statements from carriers into agency systems for monthly reconciliation.

A worked agency-bill month, mine: the agency collected $48,000.00 of gross premium on transactions with $6,480.00 of commission, and refunded $2,000.00 of return premium on cancellations whose commission was $270.00. The account current shows net due to the carrier of (48,000.00 - 2,000.00) - (6,480.00 - 270.00) = 46,000.00 - 6,210.00 = **$39,790.00**. The agency's earned commission for the month is $6,210.00, which it may move from its premium account to its operating account; the $39,790.00 stays in trust until remitted.

Agency bill also creates **receivables on both sides**: where the agency contract makes the agency responsible for premium it billed, its books carry what insureds owe it, what it owes carriers and the timing between them, and the carrier carries agents' balances as an asset; NAIC's IRIS ratios include agents' balances to surplus ([Solvency & Capital](/books/insurance/solvency-and-capital)).

## Trust Accounts and Fiduciary Funds

Premium an agent receives belongs to the insurer (and return premium to the insured), and state law makes the agent a fiduciary for it:

- **Florida** (Fla. Stat. 626.561, 2026): premiums and return premiums received by a licensee are "trust funds received by the licensee in a fiduciary capacity"; funds of an insurer the agent is not appointed with (other than surplus lines) go in a separate account; premium records are kept three years; and diverting the funds is a crime graded by amount, a first-degree misdemeanor up to $300, a third-degree felony under $20,000, second-degree from $20,000 to under $100,000, and first-degree at $100,000 or more.
- **California** (Cal. Ins. Code 1733 and 1734): premium and return premium funds are held "in that person's fiduciary capacity," and diversion is theft. The licensee must remit net of commissions, or keep the funds in an FDIC-insured trust account separate from its other accounts, with a balance at least equal to unpaid net premiums, or follow the alternative in 1734.5; it may add its own funds "for the purpose of advancing premiums, establishing reserves for the paying of return commissions, or for those contingencies."
- **New York** (11 NYCRR 20.3, Regulation 29): funds not remitted immediately go into identified premium accounts at a bank authorized in New York; the producer may deposit extra funds for a minimum balance or to cover uncollected premiums, but may not commingle its own funds without written consent; withdrawals are only to pay insurers, refund insureds, transfer earned commission and compensation, or return voluntary deposits; and the balance may never fall below the net premiums received but not yet remitted.

The rules share one invariant, which is a reconciliation: **the trust account balance is at least the net premium and return premium the agency holds for others.** In the worked month, the account must hold at least $39,790.00 for the carrier until it is remitted, plus any return premium owed to insureds and not yet paid; the $6,210.00 of earned commission may leave. MGAs hold the same kind of account under the MGA Act ([What the Law Calls an MGA](/books/insurance/mgas-programs-and-fronting#what-the-law-calls-an-mga)), and the interest these accounts earn is real revenue for large brokers: Marsh reported $403 million of fiduciary interest income for 2025 and Aon $271 million ([Brokers by Revenue](/books/insurance/insurance-landscape#brokers-by-revenue)). Whether a producer may keep the interest is a state law and contract question; New York's rule lets the producer move "consented interest." The daily reconciliation pattern is the same as a sponsor bank's for a program's for-benefit-of account ([Daily Reconciliation](/books/banking-and-lending/program-ledgers#daily-reconciliation)).

## Commission Statements and Downloads

A carrier's commission statement is the agency's revenue record and its reconciliation input. Ivans moves direct bill commission statements, policy data, claims and documents from carriers and MGAs into agency management systems, and its developer portal lists a Direct Bill Commission Statement download and a commission download translation API among its services ([Downloads](/books/insurance/comparative-raters-and-agency-systems#downloads)). Each statement line is a transaction the carrier paid on: policy number, transaction type and effective date, premium, rate and commission.

Reconciling a statement is matching each line to the agency's own record of the transaction and expected commission:

- **Matched**: same policy, transaction and amount, within rounding.
- **Rate differences**: the carrier paid a different rate than the agency's copy of the schedule, often a new schedule version or a program rate.
- **Missing lines**: a transaction the agency booked that the carrier hasn't paid (timing, or a transaction the carrier never processed), or one the carrier paid that the agency never booked (an endorsement made at the carrier).
- **Chargebacks**: negative lines for cancellations and reductions, matched to the transactions that caused them.

Unmatched lines carry over to the next statement with an age, and a break older than a threshold is worked by a person. The agency's revenue is what it can prove from statements and its own transactions, so neither side is overwritten by the other.

## Clawbacks and Chargebacks

When premium comes back, commission comes back with it. The worked policy above returned $1,446.03 of premium on cancellation and with it $216.90 of commission, leaving the agency $199.40 on $1,329.31 of earned premium. In direct bill the carrier deducts the chargeback from the next statement; in agency bill the agency refunds the insured and nets the returned commission against the account current. The amount is the commission rate times the returned premium, at the rate the original transaction used, not today's schedule.

Three cases need explicit rules:

- **Cancellation after the producer is terminated.** The chargeback is still owed, and the carrier offsets it against any remaining commission or bills the former producer.
- **Commission paid after termination.** Under the model act, renewal and deferred commissions may be paid to a producer who was licensed at the time of the sale ([Checking Before You Bind and Pay](/books/insurance/producer-licensing#checking-before-you-bind-and-pay)); whether they are owed is the agency contract's question, and the system needs both answers on the record.
- **Audits and premium adjustments.** A workers' compensation or general liability audit that adds or returns premium months after expiration adds or returns commission too, at the original term's rate ([Rating Workers' Comp & Premium Audit](/books/insurance/rating-workers-comp)).

## How to Build It

Schedules are versioned rate tables; commissions are rows per transaction and producer, offset rather than edited; statements are batches of lines matched to them:

```sql
CREATE TABLE commission_schedules (        -- an agency contract's rates, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  producer_id        UUID REFERENCES producers (id),  -- null for the carrier's standard schedule
  product_line       TEXT NOT NULL,         -- 'homeowners', 'personal_auto', 'bop', ...
  state              TEXT,                  -- null for all states
  program_id         UUID,                  -- programs (MGAs, Programs & Fronting)
  business_type      TEXT NOT NULL CHECK (business_type IN ('new', 'renewal', 'any')),
  rate_bp            INT NOT NULL,          -- 1500 = 15%
  valid_during       DATERANGE NOT NULL,    -- keyed to term effective date
  contract_doc_id    UUID NOT NULL
);

CREATE TABLE commissions (                 -- one row per transaction, producer and kind
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_transaction_id UUID REFERENCES policy_transactions (id),  -- null for contingents
  producer_id        UUID NOT NULL REFERENCES producers (id),
  kind               TEXT NOT NULL CHECK (kind IN ('base', 'chargeback', 'contingent',
                       'supplemental', 'override', 'fee')),
  schedule_id        UUID REFERENCES commission_schedules (id),
  basis_premium      BIGINT NOT NULL,       -- the written premium it was computed on
  rate_bp            INT,
  amount             BIGINT NOT NULL,       -- signed, minor units
  reverses_id        UUID REFERENCES commissions (id),
  license_check_id   UUID NOT NULL,         -- license_checks (Producer Licensing & Appointments)
  status             TEXT NOT NULL CHECK (status IN ('accrued', 'held', 'payable', 'paid',
                       'offset')),
  accounting_date    DATE NOT NULL,
  paid_at            TIMESTAMPTZ,
  idempotency_key    TEXT NOT NULL UNIQUE
);

CREATE TABLE contingent_agreements (       -- profit-sharing and growth terms
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  producer_id        UUID NOT NULL REFERENCES producers (id),
  measurement_year   INT NOT NULL,
  terms              JSONB NOT NULL,        -- target loss ratio, share, cap, minimum, lines
  losses_valued_as_of DATE NOT NULL,        -- when incurred losses are measured
  document_id        UUID NOT NULL,
  UNIQUE (insurer_id, producer_id, measurement_year)
);

CREATE TABLE commission_statements (       -- a carrier's statement, received or sent
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  producer_id        UUID NOT NULL REFERENCES producers (id),
  billing_method     TEXT NOT NULL CHECK (billing_method IN ('direct_bill', 'agency_bill')),
  period_start       DATE NOT NULL,
  period_end         DATE NOT NULL,
  source             TEXT NOT NULL,         -- 'ivans_dbcs', 'carrier_portal', 'generated'
  total              BIGINT NOT NULL,
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (insurer_id, producer_id, billing_method, period_start, period_end, source)
);

CREATE TABLE commission_statement_lines (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  statement_id       UUID NOT NULL REFERENCES commission_statements (id),
  policy_number      TEXT NOT NULL,
  transaction_type   TEXT NOT NULL,
  effective_date     DATE NOT NULL,
  premium            BIGINT NOT NULL,
  rate_bp            INT,
  amount             BIGINT NOT NULL,
  commission_id      UUID REFERENCES commissions (id),  -- once matched
  match_status       TEXT NOT NULL CHECK (match_status IN ('unmatched', 'matched',
                       'rate_difference', 'unknown_transaction')),
  carried_from_id    UUID REFERENCES commission_statement_lines (id)
);

CREATE TABLE fiduciary_entries (           -- the premium trust ledger
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  producer_id        UUID NOT NULL REFERENCES producers (id),
  bank_account_ref   TEXT NOT NULL,         -- the trust account
  kind               TEXT NOT NULL CHECK (kind IN ('premium_received', 'return_premium_paid',
                       'remitted_to_insurer', 'commission_transferred', 'own_funds_deposit',
                       'interest')),
  insurer_id         UUID REFERENCES insurers (id),
  policy_transaction_id UUID REFERENCES policy_transactions (id),
  amount             BIGINT NOT NULL,       -- signed: in positive, out negative
  booked_on          DATE NOT NULL
);

-- The trust invariant: balance >= held_for_others, checked daily.
SELECT f.producer_id, f.bank_account_ref,
       SUM(f.amount) AS balance,
       SUM(f.amount) FILTER (WHERE f.kind IN ('premium_received', 'return_premium_paid',
             'remitted_to_insurer'))
         - (SELECT COALESCE(SUM(c.amount), 0)
            FROM commissions c
            WHERE c.producer_id = f.producer_id
              AND c.kind IN ('base', 'chargeback')
              AND c.policy_transaction_id IN (
                SELECT f2.policy_transaction_id FROM fiduciary_entries f2
                WHERE f2.producer_id = f.producer_id
                  AND f2.kind IN ('premium_received', 'return_premium_paid')))
           AS held_for_others
FROM fiduciary_entries f
GROUP BY f.producer_id, f.bank_account_ref;
```

Design notes:

- **Commission is computed from the transaction, never the policy.** The basis premium and rate are stored on the row, so a schedule change or a later endorsement never alters a commission already computed; a chargeback is a new row that `reverses_id` the original in part.
- **Every commission carries its license check.** The row can't become payable without a passing check for the producer on the sale date ([Checking Before You Bind and Pay](/books/insurance/producer-licensing#checking-before-you-bind-and-pay)).
- **Statements are matched, not imported.** The carrier's statement lines stay as received; matching links them to commissions, and differences are typed and carried forward.
- **The trust account is a ledger.** Every deposit, refund, remittance and commission transfer is an entry, and the invariant is checked daily against the bank balance; an agency that can't show it is in a state examiner's report ([Payment States & Ledgers](/docs/money/payment-states)).

## Auditing

- **Every commission traceable.** Each commission row with its transaction, basis premium, schedule version, rate, license check and payment, so a producer's statement and the carrier's expense tie to the penny.
- **Contingents reproducible.** The agreement, the earned premium and incurred losses as valued on the agreed date, the computation and the payment, retained for disclosure and for the next year's netting.
- **Trust funds intact.** Daily balances of every premium account against the net premium and return premium held, with every withdrawal of a permitted kind, kept at least as long as state law requires (three years in Florida).
- **Disclosures to buyers.** For brokers and New York business, the compensation disclosure given, including contingent and supplemental arrangements.

## What This Means for the System You Build

- **Compute commission per policy transaction at the schedule version in force,** and offset with chargebacks; never recompute paid rows.
- **Check that commission on a policy equals rate times net written premium,** as a standing reconciliation.
- **Model contingent agreements as data** with their measurement dates, and accrue them through the year with a true-up.
- **Support agency bill and direct bill on the same policy model,** with the account current and the commission statement as two views of the same transactions.
- **Run the premium trust account as a ledger** with a daily invariant: balance at least what is held for insurers and insureds.
- **Match carrier statements to your own records** and carry typed breaks forward until they're resolved.

## References

**Law and regulation**

- [Fla. Stat. 626.561](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.561.html), premiums as trust funds held in a fiduciary capacity, separate accounts, three-year records and the graded penalties for diversion
- [Cal. Ins. Code 1733](https://california.public.law/codes/insurance_code_section_1733), premium and return premium held in a fiduciary capacity; diversion as theft
- [Cal. Ins. Code 1734](https://california.public.law/codes/insurance_code_section_1734), remit net of commissions or hold in a separate FDIC-insured trust account at least equal to unpaid net premiums, and permitted additional funds
- [11 NYCRR 20.3](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-20.3), New York premium accounts: identified accounts, no commingling without consent, permitted withdrawals and the minimum balance
- [11 NYCRR 30.3](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-30.3), compensation that may vary by volume or profitability disclosed to buyers

**NAIC**

- [NAIC: Producer Licensing Model Act (Model 218) (PDF)](https://content.naic.org/sites/default/files/model-law-218.pdf), commissions only to licensed persons, deferred commissions to those licensed at the sale, and compensation disclosure
- [NAIC: IRIS ratios, means and medians for 2025 (PDF)](https://content.naic.org/sites/default/files/publication-iris-means-median-2025.pdf), agents' balances to surplus among the P&C IRIS ratios

**Filings**

- [Marsh & McLennan: Form 8-K, Exhibit 99.1 (January 31, 2005)](https://www.sec.gov/Archives/edgar/data/0000062709/000006270905000015/exhibit991-2005.txt), the settlement with the New York Attorney General and Superintendent, the $850 million fund and its installments, the end of contingent compensation from October 1, 2004 and the disclosure commitment
- [Allstate: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/899051/000089905126000031/all-20251231.htm), exclusive and independent agent compensation
- [Brown & Brown: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/79282/000119312526046984/bro-20251231.htm), revenue at the policy effective date, the cancellation reserve, variable consideration and contingent commission accrual and true-up
- [Brown & Brown: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/79282/000119312526022760/bro-ex99_1.htm), profit-sharing contingent commissions of $255 million
- [Arthur J. Gallagher: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/354190/000119312526029407/d38405dex991.htm), base commissions, fees, supplemental and contingent revenues
- [Goosehead Insurance: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1726978/000172697826000010/gshd-20251231.htm), royalty rates, renewal and new business royalties, contingent commissions and their estimation
- [Marsh McLennan: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/62709/000006270926000014/mmc4q2025ex991newsrelease.htm), fiduciary interest income
- [Aon: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/315293/000162828026004273/ex991prq42025.htm), fiduciary investment income

**Vendor documentation**

- [Travelers: Producer compensation disclosure](https://www.travelers.com/w3c/legal/Producer_Compensation_Disclosure.html), base commission, contingent pay on pre-set profitability, volume, growth and tactical goals, and other incentives
- [Ivans: Ivans Download](https://www.ivans.com/for-agents/products/ivans-download/), Direct Bill Commission Statement downloads and monthly reconciliation
- [Ivans: Developer portal](https://api.ivans.com/), the Direct Bill Commission Statement download and commission download translation APIs
