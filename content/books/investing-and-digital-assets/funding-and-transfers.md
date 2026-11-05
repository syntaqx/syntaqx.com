+++
title = "Funding & Account Transfers"
nav_title = "Funding & Transfers"
description = "Money and assets in and out of an account: ACH and instant deposits as credit, wires, debit cards, ACATS timelines and rejects, crypto transfers, fraud."
category = "Investing & Digital Assets Industry"
order = 2508
part = "Accounts and Positions"
tags = ["investing", "brokerage", "ach", "instant-deposits", "acats", "transfers", "crypto", "fraud"]
+++

An account is empty until something moves into it, and every way in has a different answer to the question that matters to the firm: when is this really ours? A wire is final when it arrives. An ACH debit pulled from the customer's bank settles in a day or two and can still come back as unauthorized for 60 days. A debit card deposit arrives in minutes and can be disputed for months. An ACATS transfer brings a whole account's securities from another broker in about a week, under a FINRA rule with one-business-day and three-business-day clocks. A crypto deposit is final when the chain says so, and nothing about it can be reversed. And the product teams want all of them usable immediately, because a customer who deposits $5,000 at 9:25 am wants to buy at 9:30.

So funding is credit. Every time a platform lets a customer trade money that hasn't irrevocably arrived, it is lending against the deposit, and every time it lets money or assets leave, it is betting that what funded the account won't be clawed back afterward. This chapter covers how that bet is made for each method, as of November 2026: ACH funding and instant deposits with worked exposure numbers, wires, debit cards and withdrawals, ACATS full and partial transfers with their timelines and exceptions, transfers outside ACATS, crypto in and out at the account level, and the transfer fraud each creates. The rails themselves are Payments' subject ([ACH](/books/payments/ach), [Card Payments](/books/payments/card-payments)); the ledger entries these transfers post are in [Pending Deposits](/books/investing-and-digital-assets/ledgers-and-positions#pending-deposits); the chain side of crypto deposits and withdrawals is in Deposits & Withdrawals, later in this book.

## How the Platforms Do It

Funding terms platforms publish, as of November 2026:

| Platform | Bank funding | Holds and early access | Other methods and fees | Account transfers |
| --- | --- | --- | --- | --- |
| **Fidelity** | Electronic funds transfer | A hold "to help reduce the risk of fraud" whose length varies, "including the amount you are transferring"; trading allowed "up to $25,000 on day of deposit", excluding penny stocks and options; no withdrawal or transfer out until the hold ends | Not stated on the page cited | Not stated on the page cited |
| **Kraken** | ACH via Plaid, with deposit limits "on a weekly rolling basis" that "cannot be increased manually or upon request" | Deposits "available to withdraw after seven days"; the hold covers "any assets in cash or cryptocurrency, equal to the deposited amount"; it "does not apply to trading" | Not stated on the page cited | Crypto in and out by chain |
| **Robinhood** | Standard ACH, free, "up to 5 business days" | Instant Deposits: up to $1,000, or 2x portfolio value rounded down to the thousand if greater, without Gold; up to $5,000 or 3x with Gold; $1,000 for IRAs; overage "made available within 5 business days" | Debit card deposits free, withdrawals 1.75% (min $1, max $150), up to 30 minutes; wire deposits free, withdrawals $25 | ACATS in "typically takes 5-7 business days"; reimburses "up to $75" of the other broker's fee for transfers of $7,500 or more; $100 for partial and full ACATS out |
| **Schwab** | Electronic funding | Not stated in the guide cited | Not stated in the guide cited | Transfer out: full $50 per account, partial $0 (pricing guide dated April 2026) |

Three things stand out. **Early access is a loan with a limit, and the limit is a formula.** Robinhood's is a multiple of portfolio value capped by tier, Fidelity's a fixed $25,000 of day-one trading, Kraken's the whole deposit for trading but none of it for withdrawal for a week. Each is the same decision (how much of a reversible deposit to advance) with a different risk appetite. **Withdrawal holds attach to value, not to the dollars.** Kraken holds "cash or cryptocurrency, equal to the deposited amount": a customer who deposits $10,000 by ACH and buys bitcoin can't send that bitcoin off the platform for seven days, because bitcoin is irreversible and the ACH isn't. **Transfers out are priced to discourage leaving,** and transfers in are subsidized to encourage arriving: Robinhood charges $100 to leave and pays up to $75 of the other broker's fee to arrive.

## ACH Funding

Almost every retail account is funded by an ACH debit: the customer links a bank account, and the broker originates a debit against it ([How It Moves](/books/payments/ach#how-it-moves)). That makes the broker the Originator, with an Originator's risk:

- **Administrative returns** (insufficient funds R01, account closed R02, no account R03, and others) come within two banking days of settlement.
- **Unauthorized returns** on a consumer account (R05, R07, R10, R11) can come for 60 calendar days, on the customer's written statement to their own bank ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)).
- **The customer's protection is their bank's Regulation E duty,** not the broker's ([Consumer Law: Regulation E](/books/payments/ach#consumer-law-regulation-e)), which is why a customer who claims they didn't authorize a debit their own brokerage pulled can get the money back from their bank after spending it at the broker.

A broker therefore treats an ACH deposit in three stages: **pending** from initiation to settlement, **available** after the two-day administrative window plus the platform's own hold, and **final** after 60 days. Only final money is beyond recall, and almost no platform makes customers wait for final. The gap between available and final is covered by limits, holds on withdrawal and the right to sell what the deposit bought.

**Instant funds attract abuse.** FINRA's Regulatory Notice 21-14 (March 25, 2021) warned of a rise in ACH "instant funds" abuse: bad actors open accounts, link bank accounts, trade on instant funds before the ACH settles, and when the bank returns the debit for insufficient funds or as unauthorized, the firm sells the positions, often at a loss. FINRA's suggested practices were the ones every platform now uses: limit instant funds, delay or restrict orders against unsettled funds, verify bank account ownership, and consider SARs.

## Instant Deposits Are Credit

When a platform lets a customer trade a deposit that hasn't settled, the platform's own money buys the securities; the deposit, if it settles, repays it. Robinhood says it plainly: "If you use Instant Deposit funds and your transfer is later reversed, your account may incur a deficit", "Deficits are due immediately", and failing to cover one "could result in losing Instant Deposit access permanently." In a cash account this is the Reg T arrangement of buying "in reliance upon an agreement accepted by the creditor in good faith that the customer will promptly make full cash payment" (12 CFR 220.8(a)): the firm extends credit for the payment period against the customer's promise, and the pending ACH is the evidence of good faith.

**Worked numbers: the limit.** Robinhood's published formula, for three customers:

| Customer | Portfolio value | Gold | Formula | Instant limit |
| --- | ---: | --- | --- | ---: |
| New, no holdings | $0 | No | Up to $1,000 | $1,000 |
| Small portfolio | $3,400 | No | Greater of $1,000 or 2 × $3,400 = $6,800, rounded down to the thousand | $6,000 |
| Gold | $12,500 | Yes | Greater of $5,000 or 3 × $12,500 = $37,500, rounded down | $37,000 |

The portfolio is the collateral: a customer with $12,500 of holdings who borrows $37,000 against a pending deposit has put up about a third of the advance, and the rest is secured by the securities the advance buys.

**Worked numbers: a reversal.** The small-portfolio customer deposits $10,000 on Monday. $6,000 is instant; $4,000 waits for settlement. They buy $6,000 of a volatile stock at once. On Wednesday the ACH comes back R01 (insufficient funds). The ledger:

| Step | Customer cash | Stock at market | Firm's exposure |
| --- | ---: | ---: | ---: |
| Monday: instant credit, purchase | $0 after the purchase | $6,000 | $6,000 advanced |
| Wednesday: return; pending $10,000 reversed | −$6,000 deficit | $5,100 after a 15% fall | $6,000 owed |
| Wednesday: customer doesn't cover; firm sells | −$900 | $0 | $900 unsecured |

The $4,000 that was never instant simply disappears from pending. The $6,000 that was becomes a deficit, the position covers $5,100 of it, and the firm has a $900 receivable from a customer whose bank account just bounced. Had the customer also owned the $3,400 portfolio that sized the limit, the firm could sell that too, which is why the limit is a multiple of holdings: it guarantees collateral beyond the purchase.

**Worked numbers: the book.** At the portfolio level the question is expected loss on advances outstanding. The figures below are illustrative assumptions, not any platform's: 400,000 instant deposits a month averaging $1,500 of advance each ($600 million advanced), 0.5% returned (2,000 returns), and an average shortfall after liquidation of 8% of the advance ($120 each). Expected monthly loss: 2,000 × $120 = **$240,000**, on $600 million advanced, or 0.04%. The tail is not the average: a market-wide fall of 20% in the days a cohort of returns arrives turns the shortfall per return from $120 into several hundred, and a fraud ring that learns the limit formula concentrates returns in the accounts that maximize it. The control loop is the one card issuers run: limits by tenure and history (Robinhood's limits "aren't guaranteed amounts" and shrink after "a deposit reversal or had a transfer issue"), velocity per bank account and device, and loss tracking by cohort ([Fraud & Risk](/books/payments/fraud-and-risk)).

## Wires, Cards and Withdrawals

**Wires** are pushed by the customer's bank and final on receipt: there is no return window to wait out, which is why platforms accept them without holds and why fraudsters prefer to receive them. The work is matching: a wire arrives with the sender's name, bank and a memo, and the broker has to credit the right account and refuse third-party wires (money from someone who isn't the account owner), since a broker that credits anyone's wire to anyone's account is a laundering channel. Robinhood takes wire deposits free and charges $25 to wire money out.

**Debit cards** fund in minutes, and the card network gives the cardholder dispute rights ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)), so a card deposit is reversible for longer than ACH and by a different process. Platforms that accept them cap amounts and charge for them, or accept them for deposits and charge for withdrawals (Robinhood: deposits free, withdrawals 1.75% with a $1 minimum and $150 maximum). For crypto purchases a card is a high-risk vertical for the card networks as well as for the platform ([Crypto Purchases](/books/payments/payments-by-vertical#crypto-purchases)).

**Withdrawals** go back to the customer's own linked bank account, by ACH, RTP or wire. The rules that matter:

- **First-party only.** Money leaves to an account in the customer's name, verified when linked (account ownership verification is one of FINRA 21-14's practices), never to a third party.
- **Withdrawable, not cash.** Only settled cash past its holds may leave ([Withdrawable Cash](/books/investing-and-digital-assets/ledgers-and-positions#withdrawable-cash)).
- **A new destination is a risk event.** A bank account linked yesterday and a withdrawal requested today is the pattern of account takeover; a cooling-off period on new links, step-up authentication and a notification to the old contact details are the standard controls ([Account Takeover](/books/banking-and-lending/account-takeover-and-scams#account-takeover)).
- **Last-in, first-out holds.** If an account was funded by ACH last week and by wire yesterday, the hold policy decides which money leaves first; holding by deposit, not by account, is how a platform stops a customer from withdrawing the irreversible money and leaving the reversible deposit behind.

## ACATS Transfers

When a customer moves an account from one broker to another, they don't sell and send cash; the securities move in kind through the **Automated Customer Account Transfer Service**, DTCC's service that "automates and standardizes asset transfers" between NSCC members, under FINRA Rule 11870. DTCC warns that ACATS "is a non-guaranteed service, and certain transactions may be subject to reversal." The **receiving** firm (where the customer is going) starts it with a transfer instruction (a TIF) signed by the customer; the **carrying** firm (where the assets are) must act on it:

- **Validate or take exception within one business day** of the instruction. On validation of a full transfer, the carrying firm "must 'freeze' the account": open orders "must be canceled and no new orders may be taken", with an exception for certain options expiring within seven business days.
- **Exceptions are limited** to the rule's list: missing documentation or authorization, a "flat" account with nothing to transfer, an invalid account number, a duplicate request, a mismatched tax ID or account title, and the rule's other enumerated grounds. A carrying firm "may not take exception to a transfer instruction" over a dispute about positions or the money balance; it transfers what its books show.
- **Complete within three business days after validation.** Positions that fail to deliver go to a fail file, and the member must act on the fail "not later than 10 business days following the date delivery was due" (30 business days for listed types such as municipal and foreign securities).
- **Nontransferable assets** (proprietary funds or products the receiving firm won't accept) need the customer's instructions, requested "in writing and prior to or at the time of validation": liquidate, retain or transfer in the customer's name. After a liquidation the carrying firm must "distribute the resulting money balance to the customer or initiate the transfer within five (5) business days."
- **Residuals keep flowing.** Dividends, interest and other credits that land after a full transfer move "within (10) ten business days after the credit balances accrue", for "a minimum period of six (6) months" after the transfer completes. Robinhood tells customers residuals may arrive for up to six months.

FINRA Rule 11870's last listed amendment took effect December 15, 2010; the clocks above are current as of November 2026.

**Worked numbers: a full transfer in.** A customer opens an account at a receiving broker and submits a TIF on Monday, November 16, 2026, to move a full account holding 120 shares of an ETF, 35.42 shares of a stock (35 whole and 0.42 fractional), 2 option contracts and $1,240 of cash, plus a proprietary money market fund the receiving firm doesn't carry.

| Date | Business day | Event |
| --- | --- | --- |
| Mon, Nov 16 | 0 | TIF submitted by the receiving firm |
| Tue, Nov 17 | 1 | Carrying firm validates (deadline); account frozen, open orders canceled; customer asked in writing about the proprietary fund |
| Wed, Nov 18 to Fri, Nov 20 | 1 to 3 after validation | Settlement through NSCC: the ETF, 35 whole shares, the options and the cash move; completion deadline Friday |
| By Fri, Nov 20 | | The 0.42 share can't move if the carrying firm treats fractions as Robinhood does (sold to cash on a full transfer out), so it is liquidated and the cash follows as a residual |
| Within 5 business days of liquidation | | Proprietary fund liquidated on the customer's instruction; proceeds sent |
| Within 15 days of settlement | | Cost basis transfer statements (Form 1099-B instructions: within 15 days after settlement) with each lot's adjusted basis and acquisition date |
| Through May 2027 | | Dividends and credits that arrive at the carrying firm forwarded within 10 business days each |

The receiving firm's ledger sees this as one `transfers` row with `method = 'acats'` and many asset lines, each with its own settlement status, and a tail of residual transfers linked to it for six months. Its cost basis engine is waiting on the 6045A statements: a lot that arrives without them may become noncovered (Cost Basis, Tax Lots & Wash Sales later in this book).

**Partial transfers** move named positions or amounts; the account isn't frozen and stays open at the carrying firm. Robinhood charges $100 for partial and full ACATS out; Schwab's April 2026 guide charges $50 for full and nothing for partial; the fee is debited from the leaving account's cash, which is why a full transfer's last residual can be the carrying firm's fee coming out of the customer's last dividend.

**Transfer promotions are liabilities with earn-outs.** Brokers pay customers to transfer in. Robinhood's March 2025 offer to Gold subscribers deposited "2% of the net transferred asset value" on condition of "maintaining an active Gold subscription for at least one year" and "a five-year earn-out", and if the assets leave early "Robinhood will chargeback a proportional amount of the Bonus amount, separate from and in addition to any ACATS out fee." A $200,000 transfer earns a $4,000 bonus; if the customer transfers out after two of the five years and the chargeback is proportional to the unexpired term, $2,400 comes back, plus the $100 out fee. On the books that is a contingent receivable that amortizes over five years, recorded with the transfer that earned it, and a debit on the next ACATS out.

## Transfers Outside ACATS

Not everything moves through ACATS: assets at a firm that isn't an NSCC member, mutual fund shares held directly with the fund company, shares registered in the customer's name on a transfer agent's books (the Direct Registration System), physical certificates, annuities, assets at a bank trust department and anything foreign. These move by letter of authorization, by the transfer agent's own process or by delivery between custodians, with no shared clock, and they settle by hand. In the model they are `transfers` rows with `method = 'journal'` or a manual method, a set of asset lines, a status the operations team moves, and, because nobody else enforces a deadline, an aging report.

**Journals between accounts at the same firm** (a customer's individual account to their IRA, one spouse to a joint account) are internal transfers: a single entry moving assets between owner accounts, with no settlement leg, subject to the receiving account's rules (an IRA contribution limit, a custodial account that can't send money to the custodian personally).

## Crypto In and Out

At the account level, a crypto transfer is a `transfers` row with `method = 'onchain'` linked to an `onchain_transactions` row; everything about chains, confirmations, addresses and fees is the subject of Deposits & Withdrawals later in this book. What the account layer decides:

- **Which accounts may move crypto at all.** Robinhood limits "external crypto transfers" to the customer's primary account; joint, custodial and IRA accounts don't support crypto.
- **When a deposit counts.** A deposit credits after the chain's confirmation rule for that asset network, and until then it is pending, as an ACH deposit is.
- **When a withdrawal may leave.** A crypto withdrawal is irreversible, so it is the point where every reversible funding source is checked: if the account was funded by ACH or card in the hold window, an equal value is held (Kraken's seven days apply to "cash or cryptocurrency"). Holds by value are the only defense against the ACH-funded bitcoin that leaves the platform the same day.
- **Who is on the other end.** A transmittal of $3,000 or more by a nonbank financial institution carries the Travel Rule's originator and beneficiary information (31 CFR 1010.410(f)), which for crypto means collecting the beneficiary's details and, for a transfer to another platform, exchanging them; AML & the Travel Rule for Crypto later in this book covers it, and [The Travel Rule](/books/payments/stablecoins#the-travel-rule) has the payments side.
- **The destination is part of the customer record.** Address allowlists with a delay before a new address can be used, as for a new bank link.

## Transfer Fraud

Every transfer method has its fraud, and each one exploits the same gap: something moved before the platform knew who it was moving for.

- **Instant funds abuse** (FINRA 21-14): open, link, trade on instant credit, let the ACH return. Controls are the limits and holds above.
- **ACATS takeover.** FINRA's Regulatory Notice 22-21 (October 6, 2022) described "a recent trend in fraudulent transfers of accounts": a bad actor uses a stolen identity to open an account at a receiving firm in the victim's name, submits a transfer instruction to pull the victim's real account from their carrying firm, and will then "attempt to move the ill-gotten assets to an external account at another financial institution." The carrying firm has one business day to validate, and the victim learns of it from a confirmation. Regulatory Notice 23-06 (March 28, 2023) collected effective practices: identity and likeness checks at the receiving firm, checking digital signatures and IP addresses on the instruction, reviewing rejection history, notifying the customer "through push notifications, email, or phone" when a transfer instruction is received, watching for many accounts moving to the same receiving firm, and escalating to AML and SARs, including for failed attempts.
- **Withdrawal after takeover.** An attacker who takes over an account changes the bank link or adds a crypto address and withdraws; the controls are cooling-off periods, step-up authentication and notices to the previous contact points ([Account Takeover](/books/banking-and-lending/account-takeover-and-scams#account-takeover)). Account Security & Fraud later in this book covers the exchange-specific playbook.
- **Exploitation of older customers,** where the customer is the one asking: FINRA Rule 2165 holds ([Trusted Contacts and Senior Holds](/books/investing-and-digital-assets/opening-accounts#trusted-contacts-and-senior-holds)) and, if adopted, the proposed Rule 2166 delay of up to five business days for any adult.

The ACATS case shows why the receiving and carrying firms both need controls: the receiving firm's CIP is the only identity check on the fraudulent account, and the carrying firm's notification is the only chance the victim gets to object in time.

## How to Build It

These are deltas against the core data model in The Investing & Digital Assets Business, at the start of this book: `transfers` (with `method` ach, wire, card, acats, onchain, internal, journal; direction; status; holds; linked `onchain_transactions`), `journal_entries`, `accounts` and `cases`, plus this part's `balance_holds` ([How to Build It](/books/investing-and-digital-assets/ledgers-and-positions#how-to-build-it)). Linked bank accounts reuse Payments' `bank_accounts` and ACH entries and returns reuse its `ach_entries` and `ach_returns` ([How to Build It](/books/payments/ach#how-to-build-it)); a brokerage deposit's `transfers` row points at the `ach_entries` row that carries it. What funding adds is the transfer's event history, instant credit as an advance with its limit, ACATS transfers with their clocks and asset lines, and funding limits.

```sql
CREATE TABLE transfer_events (               -- the state history of every transfer, append-only
  transfer_id        UUID NOT NULL REFERENCES transfers (id),
  seq                INT NOT NULL,
  status             TEXT NOT NULL,          -- per method, below
  reason             TEXT,                   -- return code, exception code, review outcome
  occurred_at        TIMESTAMPTZ NOT NULL,
  journal_entry_id   UUID REFERENCES journal_entries (id),
  PRIMARY KEY (transfer_id, seq)
);

CREATE TABLE instant_credit_advances (       -- the firm's money advanced against a pending deposit
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  transfer_id        UUID NOT NULL REFERENCES transfers (id),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  limit_at_grant     BIGINT NOT NULL,        -- minor units: the formula's result then
  limit_inputs       JSONB NOT NULL,         -- portfolio value, tier, multiplier, tenure, flags
  amount             BIGINT NOT NULL CHECK (amount > 0),
  used               BIGINT NOT NULL DEFAULT 0,
  status             TEXT NOT NULL CHECK (status IN ('outstanding', 'repaid', 'deficit', 'recovered', 'written_off')),
  deficit_amount     BIGINT,
  case_id            UUID REFERENCES cases (id),
  granted_at         TIMESTAMPTZ NOT NULL,
  closed_at          TIMESTAMPTZ
);

CREATE TABLE funding_limits (                -- per account and method, effective-dated
  account_id         UUID NOT NULL REFERENCES accounts (id),
  method             TEXT NOT NULL,
  per_day            BIGINT,
  per_rolling_7d     BIGINT,
  per_rolling_30d    BIGINT,
  instant_cap        BIGINT,
  reason             TEXT NOT NULL,          -- 'tier', 'tenure', 'after_return', 'verification_level'
  valid_during       TSTZRANGE NOT NULL,
  PRIMARY KEY (account_id, method, valid_during)
);

CREATE TABLE acats_transfers (               -- one TIF, either side
  transfer_id        UUID PRIMARY KEY REFERENCES transfers (id),
  our_role           TEXT NOT NULL CHECK (our_role IN ('receiving', 'carrying')),
  control_number     TEXT NOT NULL UNIQUE,   -- the ACATS control number
  transfer_type      TEXT NOT NULL CHECK (transfer_type IN ('full', 'partial', 'residual_credit', 'fail_reversal')),
  contra_firm        TEXT NOT NULL,          -- the other side's clearing number
  contra_account     TEXT NOT NULL,
  submitted_on       DATE NOT NULL,
  validation_due_on  DATE NOT NULL,          -- 1 business day
  validated_on       DATE,
  exception_code     TEXT,                   -- from Rule 11870's list
  settlement_due_on  DATE,                   -- 3 business days after validation
  completed_on       DATE,
  residual_window_ends_on DATE,              -- 6 months after a full transfer completes
  promotion_id       UUID,                   -- a transfer bonus and its earn-out, if any
  out_fee            BIGINT                  -- charged when we are carrying
);

CREATE TABLE acats_asset_lines (             -- each position or cash amount on the TIF
  transfer_id        UUID NOT NULL REFERENCES acats_transfers (transfer_id),
  line               INT NOT NULL,
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  quantity           NUMERIC(78,0) NOT NULL, -- base units
  status             TEXT NOT NULL CHECK (status IN ('pending', 'settled', 'failed', 'nontransferable',
                       'liquidated', 'retained', 'reversed')),
  customer_instruction TEXT,                 -- for nontransferable assets
  fail_action_due_on DATE,                   -- 10 or 30 business days after delivery was due
  basis_statement_received_on DATE,          -- 6045A, due within 15 days of settlement
  PRIMARY KEY (transfer_id, line)
);
```

Status sets in `transfer_events` by method:

An ACH deposit moves through the states Payments draws for a debit ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)): initiated, submitted, settled, available after the two-day window and the platform's hold, final after 60 days, with `returned` reachable from every state before final and carrying the return code. An ACATS transfer on the receiving side:

![ACATS states on the receiving side: submitted, validated, settling, completed, residuals_open and closed in a row, with that path accented and closed a terminal state. A dashed exit from submitted down to the terminal exception state when the carrying firm objects, and a dashed branch from settling to fails_open when lines fail, which returns to completed when the fails are resolved.](/diagrams/ida-acats-states.svg "A transfer validates within one business day and completes within three after that; an exception ends it, failed lines detour through fails_open, and residuals keep it open for six months after completion.")

A crypto withdrawal runs requested, held (value holds and review), approved, broadcast, confirmed and finalized, with `rejected` from review and `failed` or `replaced` after broadcast, as Deposits & Withdrawals later in this book details.

How it runs:

1. **On an ACH deposit,** post the pending entry, compute the instant limit from `funding_limits` and the formula, and if granted, record an `instant_credit_advances` row and its entry; place a `balance_holds` row against withdrawal of the deposit's value until the hold policy's date.
2. **At settlement,** post cash, reverse the pending entry and mark the advance `repaid`; at the end of the 60-day window, mark the transfer `final` (the hold usually lifted long before).
3. **On a return,** reverse the pending or settled entry, convert the used advance into a deficit, open a case, restrict instant access in `funding_limits` with reason `after_return`, and if the customer doesn't cover, liquidate under the account agreement and record recovery or write-off.
4. **On an ACATS instruction as carrying firm,** compute `validation_due_on` with the business-day calendar, run the fraud checks of Notice 23-06 and notify the customer, then validate or take a listed exception; on validation of a full transfer, freeze the account by capability, not by deleting anything.
5. **As receiving firm,** reconcile each settled asset line to the NSCC output, chase basis statements past 15 days, and keep the residual window open for six months.
6. **On a crypto withdrawal,** check every value hold against the account before approving; the order is irreversible, so the check is the control.

Design notes:

- **Advances are loans and are reported as loans.** The outstanding total, by cohort, against returns and losses, is a risk report the firm reviews daily; the formula and its inputs are stored with each grant so a loss can be traced to the policy that allowed it.
- **Holds attach to deposits, by value.** A hold remembers which transfer created it and is released by that transfer's clock, so a withdrawal checks the holds rather than guessing from balances.
- **ACATS clocks are on the business-day calendar** and are scheduled jobs with owners; a missed validation or residual deadline is a rule violation with a date.
- **One transfer, many lines, many entries.** An ACATS transfer posts per asset line as each settles; a fail is a line status, not a transfer status.

## Auditing

FINRA examines funding, ACATS processing and AML controls; state regulators and NYDFS examine crypto withdrawals. Keep:

- **Every transfer with its event history,** source account details as verified, holds placed and released, and the journal entries it posted.
- **Every instant credit advance** with the limit, inputs, use, outcome and recovery; returns by cohort and the policy changes they caused.
- **Every ACATS instruction** with validation or exception and its date against the deadline, the customer notification sent, asset lines and their settlement, nontransferable instructions, fails and their resolution, basis statements and residuals through the six-month window.
- **Every new bank link and crypto address** with verification, cooling-off and the notices sent.
- **Fraud cases and SAR referrals** tied to the transfers that triggered them, including failed attempts, as Notice 23-06 suggests.

## What This Means for the System You Build

- **Treat every early-access feature as credit,** with a stored limit formula, an advance per deposit and loss tracking by cohort.
- **Model ACH deposits through pending, available and final,** and never let withdrawable cash include money that can still return.
- **Hold by value on irreversible exits:** crypto withdrawals and wires out check every reversible deposit still in its window.
- **Run ACATS on a business-day calendar** with one-day validation, three-day completion, 10-day fail actions and six months of residuals as scheduled work.
- **Notify the customer on every inbound transfer instruction,** and treat new bank links and addresses as risk events.
- **Record transfer promotions** as contingent receivables with their earn-out, charged back on the way out.

## References

**Law and regulation**

- [12 CFR 220.8: Cash account](https://www.law.cornell.edu/cfr/text/12/220.8), purchases in reliance on the customer's agreement to make full cash payment
- [31 CFR 1010.410: Records to be made and retained by financial institutions](https://www.law.cornell.edu/cfr/text/31/1010.410), the $3,000 recordkeeping and travel rule for transmittals by nonbank financial institutions
- [IRS: Instructions for Form 1099-B](https://www.irs.gov/instructions/i1099b), transfer statements under section 6045A due within 15 days after settlement, with adjusted basis and acquisition dates

**Regulators and guidance**

- [FINRA Rule 11870: Customer Account Transfer Contracts](https://www.finra.org/rules-guidance/rulebooks/finra-rules/11870), validation within one business day, permitted exceptions, no exception for position disputes, the freeze, completion within three business days, nontransferable assets, fails, residual credits for six months, amendment history
- [FINRA Regulatory Notice 21-14 (March 25, 2021)](https://www.finra.org/rules-guidance/notices/21-14), ACH "instant funds" abuse and suggested practices
- [FINRA Regulatory Notice 22-21 (October 6, 2022)](https://www.finra.org/rules-guidance/notices/22-21), fraudulent transfers of accounts through ACATS using stolen identities
- [FINRA Regulatory Notice 23-06 (March 28, 2023)](https://www.finra.org/rules-guidance/notices/23-06), effective practices against fraudulent ACATS transfers, including customer notification
- [FINRA Regulatory Notice 26-02 (January 8, 2026)](https://www.finra.org/rules-guidance/notices/26-02), proposed Rule 2166 temporary delays for suspected fraud

**Standards and protocols**

- [DTCC: Automated Customer Account Transfer Service](https://www.dtcc.com/clearing-and-settlement-services/equities-clearing-services/acats), what ACATS automates and its non-guaranteed status

**Vendor documentation**

- [Fidelity: Processing and hold times](https://www.fidelity.com/customer-service/processing-and-hold-times), variable fraud holds, day-of-deposit trading up to $25,000, no withdrawal during the hold
- [Kraken: Fund your account with USD using ACH via Plaid](https://support.kraken.com/articles/8795459449492-how-do-i-fund-my-account-with-usd-using-ach-via-plaid-), seven-day withdrawal hold on an equal value of cash or crypto, no hold on trading, weekly rolling limits (last updated October 20, 2026)
- [Robinhood: Bigger Instant Deposits](https://robinhood.com/us/en/support/articles/bigger-instant-deposits/), the limit formula by tier and portfolio value, IRA limit, limits after reversals, overage within five business days
- [Robinhood: Instant Deposits](https://robinhood.com/us/en/support/articles/instant-deposits/), trading a portion of a pending deposit, up to five business days, transfer reversals
- [Robinhood: Why can't I use my Instant Deposit](https://robinhood.com/us/en/support/articles/why-cant-i-use-my-instant-deposit/), deficits after a reversal, due immediately, losing access
- [Robinhood: Transfer types](https://robinhood.com/us/en/support/articles/transfer-types/), ACH, debit card, RTP and wire timing and fees
- [Robinhood: Transfer your assets in](https://robinhood.com/us/en/support/articles/transfer-your-assets-in/), 5 to 7 business days, fee reimbursement up to $75 for $7,500 or more, residuals for up to six months
- [Robinhood: Transfer your assets out](https://robinhood.com/us/en/support/articles/transfer-your-assets-out/), the $100 partial and full ACATS out fee
- [Robinhood: Fractional shares](https://robinhood.com/us/en/support/articles/fractional-shares/), fractions sold to cash on a full transfer out
- [Robinhood: ACATS 2% bonus offer terms (March 2025)](https://cdn.robinhood.com/assets/robinhood/legal/acats_2percent_Bonus_Offer.pdf), 2% of net transferred value, one-year Gold condition, five-year earn-out, proportional chargeback in addition to the out fee, offer dates
- [Schwab: Pricing guide for individual investors (April 2026)](https://disclosures.schwab.com/SchwabDashboard/61330/REG23060.pdf), $50 full and $0 partial transfer out
