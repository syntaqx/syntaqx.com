+++
title = "Business Accounts & Startup Banking"
nav_title = "Business Accounts"
description = "Business deposit accounts on sponsor banks: Mercury, Rho, Relay, Bluevine, Novo and Found, KYB, sub-accounts, user roles, wire law and not-a-bank disclosures."
category = "Banking & Lending Industry"
order = 2459
part = "Business Banking"
tags = ["banking", "business-banking", "startups", "sponsor-banks", "kyb", "ucc-4a"]
+++

A business account is a deposit account whose owner is an entity, and that one fact moves it onto different law. The consumer statutes that shape a personal checking account mostly fall away: Regulation E's error resolution and liability limits apply only to accounts "established primarily for personal, family, or household purposes", and Regulation DD's disclosures only to consumers. What replaces them is older and harsher. A wire from a business account is governed by Article 4A of the Uniform Commercial Code, under which a bank that followed an agreed, commercially reasonable security procedure in good faith can charge the customer for an order the customer never sent. Deposit insurance is one $250,000 per entity per bank, however many owners the company has. And the account has many hands on it: owners, officers, an outside bookkeeper, employees with cards, each needing a different slice of authority.

Startups and small businesses increasingly open these accounts with fintechs rather than banks. Mercury, Rho, Relay, Bluevine, Novo and Found each sell a business account under their own brand on one or more sponsor banks' charters, the arrangement [Banking as a Service](/books/banking-and-lending/banking-as-a-service) describes from the bank's side. This chapter is the product: who holds the money, what the law changes for a business, verifying the business at opening, sub-accounts, users, roles and approvals, and the "not a bank" disclosures every one of them carries. Multiplying the insurance limit across banks and earning yield on idle cash are the subject of [Sweeps, Reciprocal Deposits & Yield](/books/banking-and-lending/sweeps-and-yield); the bank services a larger company buys (positive pay, lockbox, ZBAs, account analysis) are in [Treasury Management](/books/banking-and-lending/treasury-management).

## How the Platforms Do It

What the business banking fintechs publish, as of October 2026:

| Platform | Bank(s) | Insurance claim | Accounts and plans | Not-a-bank statement |
| --- | --- | --- | --- | --- |
| **Bluevine** | Coastal Community Bank, plus program banks in its sweep network | "FDIC insured up to $3,000,000 per depositor", by "multiplying the standard $250,000 FDIC coverage across multiple banks" | Standard free, Plus $30 a month, Premier $95 a month; "up to 50 sub-accounts" with transfer rules and their own debit cards; APY 1.3% to $250,000 on Standard with a monthly activity goal, 3.0% on all balances on Premier | Neither Bluevine nor its affiliates is a bank; treasury services are not a deposit of Coastal Community Bank |
| **Found** | Lead Bank | "FDIC-insured up to $250,000 per depositor for each account ownership category" | Free, Plus $35 a month, Pro $80 a month; "Up to 20 sub-accounts called Pockets", a Taxes Pocket on every plan, in-app quarterly federal tax payments for Schedule C filers | "Found is a financial technology company, not a bank" |
| **Mercury** | Choice Financial Group and Column N.A. | "Up to $5M in FDIC insurance" through partner banks and sweep networks | Mercury free, Plus $29.90 a month, Pro $299 a month; "Preset or customizable roles and permissions"; ACH and domestic wires free, 1% on non-USD wires, 3% on non-USD card transactions | "Mercury is a fintech company, not an FDIC-insured bank" |
| **Novo** | Middlesex Federal Savings, F.A. for deposits and debit card; Continental Bank for the credit card and loan; Novo Funding LLC for a merchant cash advance | "Eligible deposits are insured up to $5,000,000 per depositor" through Middlesex and its sweep network | A free checking account; "250,000+ independent businesses" (company figure) | "Novo is a fintech, not a bank" |
| **Relay** | Thread Bank, which places deposits at program banks | "up to $3,000,000 in FDIC insurance coverage when Thread Bank places them at program banks", $250,000 per program bank "inclusive of any other deposits you may already hold" | Starter free, Grow $30, Scale $90 a month (regularly $120); 20 checking accounts per business, 50 on Scale; unlimited users; savings APY 1.19% to 3.21% by plan (as of September 17, 2026) | "Relay is a financial technology company and is not an FDIC-insured bank" |
| **Rho** | Lead Bank and Webster Bank (a division of Santander Bank, N.A.) for checking and cards; American Deposit Management Co. and its partner banks for savings | Checking eligible for pass-through insurance; savings "Up to $75M in FDIC insurance" | No subscription; 1% FX fee, $30 international wire recall, optional $15 SWIFT fee | "Rho is a fintech company, not a bank or an FDIC-insured depository institution" |

Three things stand out. **One brand, several charters.** Mercury and Rho each name two banks, and Novo puts deposits, cards and loans at three different companies, one of them not a bank at all (a merchant cash advance is a purchase of receivables, the distinction in [Merchant Cash Advances](/books/banking-and-lending/small-business-lending#merchant-cash-advances)). A single customer relationship on the program's side is several accounts at several institutions on the regulators' side, and the records have to keep them apart. **Yield is a plan feature.** Bluevine, Found and Relay all set the savings or checking rate by subscription tier, so the price of the plan and the rate on the account are one product decision, versioned together. **Every page carries the same disclosure,** not by coincidence: it is the FDIC's rule, below.

## The Program Manager and Its Banks

Every platform above is a program manager in the first or second of the shapes in [Three Shapes](/books/banking-and-lending/banking-as-a-service#three-shapes): the bank holds the account, the fintech designs, sells and serves it, and either the bank's core or a subledger reconciled to it every night ([Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers#daily-reconciliation)) says whose money is whose. The bank owns CIP, beneficial ownership, sanctions, monitoring, the account agreement and the insurance records; the program performs most of the work under the bank's procedures and keeps the evidence the bank tests ([Who Owns Which Obligation](/books/banking-and-lending/banking-as-a-service#who-owns-which-obligation)).

Two things are sharper for business programs than for consumer ones. Balances are larger and concentrated, so a sponsor bank's liquidity can depend on a few programs' depositors, the exposure [When Banks Fail](/books/banking-and-lending/bank-failures#anatomy-of-a-run) traces through SVB. And business customers move money in amounts and patterns (payroll runs, vendor wires, international transfers) that make monitoring and sanctions screening heavier per account, which is part of why a program may route different products to different banks. In the data, each bank relationship is its own `programs` row with its own institution and agreement, and the platform's "one account" view is a query across them, never a single record that blurs which bank owes the money.

## What the Law Changes for a Business

The same deposit account carries different rules depending on who owns it:

| Rule | Consumer account | Business account |
| --- | --- | --- |
| **Regulation E** (error resolution, unauthorized-transfer liability, overdraft opt-in) | Applies to accounts held primarily for personal, family or household purposes | Doesn't apply: the account isn't a consumer asset account |
| **Regulation DD** (Truth in Savings disclosures, APY rules) | Applies | Doesn't apply ([Truth in Savings](/books/banking-and-lending/deposit-accounts#truth-in-savings)); the platform's rate disclosures are contract and advertising law |
| **Regulation CC** (funds availability) | Applies to transaction accounts | Applies the same way: "account" in subpart B is any transaction account, not a consumer one ([Funds Availability](/books/banking-and-lending/funds-availability)) |
| **Wires** | UCC Article 4A for the wire itself | UCC Article 4A, including its security procedure rule |
| **ACH** | Nacha consumer entries (PPD, WEB), Regulation E's protections, and 60 calendar days to return an unauthorized debit (R10) | Corporate entries (CCD, CTX), and 2 banking days to return an unauthorized debit (R29) ([Returns](/books/payments/ach#returns-when-money-is-really-yours)) |
| **Statement review** | Regulation E's 60-day notice for electronic transfers; UCC 4-406 for checks | UCC 4-406, whose terms the account agreement may vary within limits (UCC 4-103) |
| **Deposit insurance** | $250,000 per owner per category, multiplied by joint and trust structures | $250,000 per corporation, partnership or unincorporated association engaged in an independent activity, whatever the number of owners; a sole proprietor's business accounts are the owner's single accounts ([The Ownership Categories](/books/banking-and-lending/deposit-insurance#the-ownership-categories)) |
| **Cards** | Regulation E for debit, Regulation Z for credit | Commercial cards sit mostly outside both ([Commercial and Virtual Cards](/books/payments/card-issuing#commercial-and-virtual-cards)) |

The consequence for a product is that a business customer's protections are mostly the ones its contract and its controls give it. A fintech that runs Regulation E-style error handling for business customers is choosing to; a fintech that offers dual approval on wires is giving the customer the one thing Article 4A rewards.

### Wires and Security Procedures

Article 4A allocates the loss on an unauthorized wire by procedure, not by fault. If the bank and customer agreed that payment orders would be verified by a security procedure, an order the bank accepts is "effective as the order of the customer, whether or not authorized", provided the procedure is commercially reasonable and the bank "accepted the payment order in good faith" and in compliance with the procedure (UCC 4A-202(b)). Commercial reasonableness is a question of law, judged by the customer's wishes and circumstances and by common practice, and a procedure is presumed reasonable if the customer chose it "after the bank offered, and the customer refused", a reasonable alternative and agreed in writing to be bound (4A-202(c)).

That rule is a specification for the product. The offer of each security procedure (dual approval above a threshold, a second factor on payment release, IP or device restrictions, callback on new payees) and the customer's acceptance or refusal are evidence the bank will need if a compromised login sends a wire, so they are records with dates and versions, not settings that overwrite themselves. A business that turns off dual approval to move faster is, in Article 4A's terms, refusing an offered procedure, and the system should make that a deliberate, recorded act by someone with the authority to do it.

## Verifying the Business

Opening a business account is the person's CIP plus an entity, its owners and the people who will act for it, the flow in [KYB: Business Accounts](/books/banking-and-lending/kyc-and-account-opening#kyb-business-accounts): the entity verified against its formation records and EIN, each beneficial owner under the ownership and control prongs and each authorized signer verified as a person, and corporate parents followed until individuals appear. The 2026 change that lets a bank verify owners once and refresh them on a trigger is in [What changed in 2026](/books/banking-and-lending/kyc-and-account-opening#what-changed-in-2026).

Startup banking stresses that flow in predictable places. A company incorporated last week has thin public records, a new EIN and no operating history, so the evidence is formation documents and the founders rather than the entity's footprint. Ownership changes with every financing round, which is exactly the trigger for refreshing beneficial owners. And a sole proprietor isn't a legal entity customer at all but an individual with a trade name, which is why Found, built for people who file a Schedule C, is a person's account with business features: its insurance is the owner's single-account coverage, aggregated with the owner's personal accounts at the same bank.

## Sub-Accounts

Business platforms sell many accounts per customer: Relay 20 checking accounts per business (50 on Scale), Bluevine up to 50 sub-accounts with their own debit cards and automatic transfer rules, Found up to 20 Pockets including one for taxes. Businesses use them as envelopes: payroll, taxes, a reserve, one per client or project, one per card program.

Two designs sit behind the word. A sub-account can be a separate deposit account at the bank with its own number (Relay describes its sub-accounts as checking accounts), or a bucket inside one account that exists only in the program's ledger. The first gives each envelope routing and account numbers that can receive ACH and wires directly; the second is cheaper and invisible to the bank. Either way two rules hold:

- **Insurance doesn't multiply.** Every sub-account of the same company at the same bank is the same depositor in the same category, aggregated to one $250,000 ([How a Bank Computes Insured Amounts](/books/banking-and-lending/deposit-insurance#how-a-bank-computes-insured-amounts)). Twenty accounts at one bank are not $5 million of coverage; twenty banks are, which is what a sweep does.
- **Transfer rules are money movements.** "Move 30% of every deposit to Taxes" or "keep payroll at $80,000" is a scheduled or triggered book transfer, each one a journal entry with an idempotency key derived from its trigger, so a retried rule doesn't move the money twice ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).

## Users, Roles and Approvals

A business account has two populations that are easy to confuse. **Account parties** are legal: the business as owner, its beneficial owners, and the authorized signers the bank verified, all `account_parties` rows. **Platform users** are logins with roles: the founder, the controller, an outside bookkeeper, an employee with a card. Some users are authorized signers; many are not, and a bookkeeper who can view everything and move nothing doesn't need to be.

The role sets the platforms publish converge. Relay's six preset team roles are a fair outline: Admin ("full account access, including sending payments", plus cards, integrations and the team), Manager (team and card management "without permission to send payments"), Bill Payer (sending and editing ACH, wire and check payments), Cardholder (their own card only), Deposit Only (balances, check deposits and transfers into one assigned account) and Read Only; only Admin and Bill Payer can send payments, and Relay requires team members with transaction permissions to give a personal address before they can transact. Mercury lists preset or customizable roles and permissions, the option to limit employees to cards and reimbursements, and approval rules for bill pay. Bluevine puts the consequence in its terms: "Customers and Account Administrators are fully responsible for all activity and actions taken by any Additional User."

That sentence is the design constraint. Every permission a business grants is authority it answers for, so the model is least privilege by default ([Least Privilege](/docs/security/authorization#least-privilege)) with three properties the generic version doesn't need:

- **Permissions are scoped to accounts,** not just to the business: a Deposit Only user sees one account; a project lead pays from one sub-account.
- **Moving money is a separate permission from seeing it,** and moving money above a threshold or to a new payee goes through an approval rule (Relay lists multi-step bill approval rules from its free plan up). The approval is the security procedure Article 4A weighs.
- **Users who can move money are identified people.** A user with payment authority is acting for the business on the bank's account, which is why programs collect identity details for those users and why sanctions screening covers them.

## "Not a Bank" Disclosures

Every platform's page says it isn't a bank because 12 CFR 328.102 requires it. A non-bank that represents a product as FDIC-insured must "clearly and conspicuously identify the insured depository institution(s)" where the money may be placed, disclose that it isn't an insured institution and that insurance covers only an insured bank's failure (the rule's own example: "A statement that a person is not an FDIC-insured bank and deposit insurance covers the failure of an insured bank"), and, for pass-through coverage, that "certain conditions must be satisfied" for it to apply. Where deposit and non-deposit products appear close together on a website, the statement must "clearly and conspicuously differentiate" them and say the non-deposit products aren't insured, aren't deposits and may lose value, which matters to every platform above that sells a treasury or investment product next to its checking account. Leaving out the bank names is itself an omission under the rule.

Two things follow for the build. The disclosure is part of every surface that mentions insurance (app screens, marketing pages, emails, the sign-up flow), rendered from the same versioned source as the account's bank list, so a program that adds or changes a bank updates every statement at once. And it is a `disclosures` record like any other: which version was shown, where and when, because the FDIC and the sponsor bank both review it ([How the Platforms Do It](/books/banking-and-lending/deposit-insurance#how-the-platforms-do-it) in Deposit Insurance has the consumer neobanks' versions).

## Plans and Fees

Subscription plans replaced the monthly maintenance fee as the business account's price: Mercury from free to $299 a month, Relay to $90, Bluevine to $95, Found to $80, Rho with none. A plan changes several things at once (the deposit rate, how many sub-accounts or users, which payment types are free, access to bill pay, approval rules or accounting integrations), so it maps to product versions and entitlements rather than to a fee line. Plan-linked rates are why a downgrade is a terms change for the account, and why the rate in force on any day comes from the plan the business held that day ([Products & Product Configuration](/books/banking-and-lending/product-configuration#versions-not-edits)).

What remains as fees is mostly payments and foreign exchange: Mercury's 1% on non-USD wires and 3% on non-USD card transactions, Rho's 1% FX fee, $30 international wire recall and $15 optional SWIFT fee. Each is a `fee_assessments` row naming the product fee it came from, and the FX margin on a conversion is a fee whether or not it is labeled as one ([FX Rates, Providers and Quotes](/books/payments/cross-border-and-fx#fx-rates-providers-and-quotes)).

## How to Build It

These are deltas against `parties`, `account_parties` and `accounts` in [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). The business is a `parties` row of kind `business`; its owners and controllers are `party_relationships` from [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening#how-to-build-it); its legal roles on each account are `account_parties`. What business banking adds is sub-account structure, platform users with scoped grants, approval rules, and the record of security procedures offered and refused.

```sql
ALTER TABLE accounts                       -- a sub-account of a business's primary account
  ADD COLUMN primary_account_id UUID REFERENCES accounts (id),
  ADD COLUMN nickname           TEXT;      -- 'Payroll', 'Taxes', as the customer named it

CREATE TABLE platform_users (              -- a login acting for one or more businesses
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  person_party_id     UUID REFERENCES parties (id),  -- set once the person is identified
  login_ref           TEXT NOT NULL UNIQUE,  -- the identity provider's subject
  status              TEXT NOT NULL CHECK (status IN ('invited', 'active', 'suspended', 'removed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_grants (                 -- what a user may do for a business, on which accounts
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  business_party_id   UUID NOT NULL REFERENCES parties (id),
  user_id             UUID NOT NULL REFERENCES platform_users (id),
  role                TEXT NOT NULL,         -- 'admin', 'bill_payer', 'cardholder', 'read_only', or a custom role code
  permissions         TEXT[] NOT NULL,       -- {'view', 'deposit', 'pay', 'approve', 'manage_users', 'manage_cards'}
  account_ids         UUID[],                -- null: every account of the business
  granted_by          UUID NOT NULL REFERENCES platform_users (id),
  valid_during        TSTZRANGE NOT NULL,
  CHECK (granted_by <> user_id)
);

CREATE TABLE payment_approval_rules (      -- the business's approval policy, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  business_party_id   UUID NOT NULL REFERENCES parties (id),
  rail                TEXT,                  -- null: every rail
  min_amount          BIGINT NOT NULL DEFAULT 0,
  new_payee_only      BOOLEAN NOT NULL DEFAULT FALSE,
  approvals_required  SMALLINT NOT NULL CHECK (approvals_required BETWEEN 1 AND 5),
  approver_roles      TEXT[] NOT NULL,
  initiator_may_approve BOOLEAN NOT NULL DEFAULT FALSE,
  valid_during        TSTZRANGE NOT NULL
);

CREATE TABLE payment_approvals (           -- each approval or rejection of one payment
  transfer_ref        TEXT NOT NULL,         -- the outbound payment awaiting release
  rule_id             UUID NOT NULL REFERENCES payment_approval_rules (id),
  user_id             UUID NOT NULL REFERENCES platform_users (id),
  decision            TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  second_factor       TEXT NOT NULL,         -- how the approver authenticated at the moment of approval
  decided_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (transfer_ref, user_id)
);

CREATE TABLE security_procedure_elections ( -- UCC 4A-202 evidence: offered, accepted, refused
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  business_party_id   UUID NOT NULL REFERENCES parties (id),
  procedure           TEXT NOT NULL,         -- 'dual_approval_wires', 'callback_new_payee', 'ip_allowlist', ...
  procedure_version   TEXT NOT NULL,
  election            TEXT NOT NULL CHECK (election IN ('accepted', 'refused')),
  elected_by          UUID NOT NULL REFERENCES platform_users (id),
  agreement_disclosure_id UUID NOT NULL REFERENCES disclosures (id),  -- the written terms shown
  elected_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The release check an outbound payment passes before it reaches the rail, for one transfer:

```sql
SELECT r.id AS rule_id, r.approvals_required,
       COUNT(a.user_id) FILTER (WHERE a.decision = 'approved') AS approvals,
       BOOL_OR(a.decision = 'rejected')                         AS rejected
FROM payment_approval_rules r
LEFT JOIN payment_approvals a ON a.rule_id = r.id AND a.transfer_ref = :transfer_ref
WHERE r.business_party_id = :business_party_id
  AND r.valid_during @> :initiated_at
  AND (r.rail IS NULL OR r.rail = :rail)
  AND :amount >= r.min_amount
  AND (NOT r.new_payee_only OR :payee_is_new)
GROUP BY r.id, r.approvals_required;
```

Every rule returned must have `approvals >= approvals_required` and no rejection before the payment is released; an approval by the initiator counts only where the rule allows it.

Design notes:

- **Legal roles and logins never merge.** An authorized signer is an `account_parties` row the bank verified; a user is a `platform_users` row with grants. A user who is also a signer links through `person_party_id`, and removing the login doesn't remove the signer (or the reverse) without its own recorded action.
- **Grants are effective-dated and granted by someone else.** "Who could send a wire from this account on March 3" is a query over `user_grants` with `valid_during`, and nobody grants themselves authority ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **The approval rule in force is pinned to the payment.** Approvals reference the rule version that applied when the payment was initiated, so a rule relaxed afterwards can't retroactively approve it ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Sub-accounts are accounts.** `primary_account_id` groups them for the customer; each still has its own product version, balances and statements, and insurance aggregation ignores the grouping and goes by owner and bank.
- **Tenancy is institution, program, business.** A business with accounts at two of a program's banks has `accounts` rows at two institutions; the platform's combined view is a query, and each bank's records stay producible alone ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)).
- **Emit `user.granted`, `user.revoked`, `approval_rule.changed`, `security_procedure.elected` and `payment.approved`,** which alerts to the business's admins and the program's fraud monitoring subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

Business account records are reviewed by the sponsor bank's oversight of the program, in BSA/AML exams and, after a fraud loss, by the customer's lawyers. Keep:

- **The business's verification file:** the entity's documents and checks, each beneficial owner and control person with the certification and when it was refreshed, each authorized signer's CIP ([Auditing](/books/banking-and-lending/kyc-and-account-opening#auditing) in KYC & Account Opening).
- **Every user grant and its history,** who granted it, when, on which accounts, and every login and payment action under it ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Every approval rule version and every approval,** with how the approver authenticated, linked to the payment it released.
- **Security procedures offered, accepted and refused,** with the agreement text shown and who elected, the evidence an Article 4A dispute turns on.
- **Not-a-bank and insurance statements by version and surface,** with the bank list each one named.

## What This Means for the System You Build

- **A business account is a different legal object,** with Regulation E and DD mostly gone and UCC 4A in their place; build the protections the contract promises, and record the controls the law rewards.
- **Keep each bank relationship separate in the records** even when the product shows one account, because insurance, examination and failure all happen per institution.
- **Model account parties and platform users separately,** with grants scoped to accounts, effective-dated, and never self-granted.
- **Make payment approval rules versioned data** and pin each payment to the rule in force when it started.
- **Record security procedure elections** as dated, signed events, refusals included.
- **Treat sub-accounts as accounts for money and as one depositor for insurance.**
- **Render every insurance statement from the program's current bank list,** and record what was shown.

## References

**Law and regulation**

- [12 CFR 1005.2: Regulation E definitions](https://www.law.cornell.edu/cfr/text/12/1005.2), an account as a consumer asset account established primarily for personal, family or household purposes, and a consumer as a natural person
- [12 CFR 229.2: Regulation CC definitions](https://www.law.cornell.edu/cfr/text/12/229.2), an account for funds availability as any transaction account, not limited to consumers
- [UCC 4-103: Variation by agreement](https://www.law.cornell.edu/ucc/4/4-103), parties may set by agreement the standards by which a bank's responsibility is measured, but not disclaim good faith
- [UCC 4-406: Customer's duty to discover and report](https://www.law.cornell.edu/ucc/4/4-406), reasonable promptness in examining statements and the one-year bar
- [UCC 4A-202: Authorized and verified payment orders](https://www.law.cornell.edu/ucc/4A/4A-202), orders effective under a commercially reasonable security procedure accepted in good faith, and the presumption when a customer refuses an offered procedure
- [12 CFR 328.102: Misrepresentation of insured status](https://www.law.cornell.edu/cfr/text/12/328.102), identifying the insured banks, the not-an-insured-bank statement, the pass-through conditions and differentiating non-deposit products

**Vendor documentation**

- [Bluevine: Business checking](https://www.bluevine.com/business-checking), Coastal Community Bank, $3,000,000 through program banks, plans, APY conditions, 50 sub-accounts and responsibility for additional users
- [Found: Pricing](https://found.com/pricing), Lead Bank, coverage per ownership category, plans, APY, 20 Pockets, the Taxes Pocket and Schedule C tax payments
- [Mercury: Pricing](https://mercury.com/pricing), Choice Financial Group and Column N.A., up to $5M through partner banks and sweep networks, plans, roles and permissions, card-and-reimbursement-only employees, bill pay approval rules, wire and FX fees
- [Novo](https://www.novo.co/), Middlesex Federal Savings, Continental Bank, Novo Funding LLC's merchant cash advance, $5,000,000 through the sweep network, customer count
- [Relay: Pricing](https://www.relayfi.com/pricing), Thread Bank's sweep program and coverage inclusive of other deposits, plans, accounts per business, savings APY as of September 17, 2026, approval rules
- [Relay: Team member permissions](https://relayfi.com/hc/en-us/articles/360056193691-Team-member-permissions/), the six preset roles, who can send payments, and the personal address requirement
- [Rho: Pricing](https://www.rho.co/pricing), Lead Bank and Webster Bank, pass-through checking coverage, $75M savings coverage through American Deposit Management Co., fees
