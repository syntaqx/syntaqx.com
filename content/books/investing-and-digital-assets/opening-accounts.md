+++
title = "Opening Accounts"
description = "Opening a brokerage or crypto account: account types and titling, broker CIP, the investment profile, options and margin approvals, trusted contacts, W-9s."
category = "Investing & Digital Assets Industry"
order = 2506
part = "Accounts and Positions"
tags = ["investing", "brokerage", "crypto", "account-opening", "cip", "kyc", "options", "margin"]
+++

A brokerage account looks like a bank account with a ticker search, and the opening flow looks like the same identity check. It isn't. A broker-dealer opens an account under a different CIP rule (31 CFR 1023.220, not the bank's 1020.220), a recordkeeping rule that wants the customer's income, net worth and investment objectives on file and sent back to them every 36 months (Rule 17a-3(a)(17)), and a FINRA rulebook that asks for a trusted contact person, approves options in writing by a principal, and hands a margin disclosure statement to every margin customer before the account opens. A crypto platform opens its account under neither the bank nor the broker rule: as a money services business, its AML program must include "verifying customer identification", with no CIP rule of its own spelling out how. And a single customer at a modern app may hold all of these at once, a cash account and a margin account at a broker-dealer, a crypto account at a sister company, a futures and event contracts account at an FCM, each carried by a different legal entity with its own agreement.

So account opening in this industry is less one decision than a bundle of them: who the customer is, what kind of account they are opening and how it is titled, which entity carries it, what the customer told you about their finances and experience, and which **capabilities** (margin, options at a given level, crypto, futures, event contracts) each of those facts unlocks. Each capability has its own disclosure, agreement, approval and record, and each can be granted, restricted or withdrawn later without closing the account.

This chapter covers the broker's and crypto platform's side of that flow, as of November 2026. The general CIP and beneficial ownership rules, identity vendors and synthetic identities are in [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening), which this chapter does not repeat; what follows is what changes when the account holds securities and crypto. Money coming into the new account is the next part of this book's story, in [Funding & Account Transfers](/books/investing-and-digital-assets/funding-and-transfers).

## How the Platforms Do It

What platforms document publicly about opening and configuring accounts, as of November 2026:

| Platform | Account types and structure | Capabilities and approvals | What stands out |
| --- | --- | --- | --- |
| **Alpaca** (Broker API) | Individual taxable and business accounts; cash and IRA accounts "on the roadmap". Three partner setups: trading app or RIA (Alpaca runs KYC), fully disclosed broker-dealer (the partner runs KYC and posts results to a CIP API), omnibus (no end-customer accounts at Alpaca) | "All accounts are margin accounts"; a cash account is a margin account configured to 1x buying power. Options levels 0 (disabled) to 3 (spreads and straddles); a separate `crypto_status` on the account | Account statuses `SUBMITTED`, `APPROVAL_PENDING`, `APPROVED`, `ACTIVE`, `ACTION_REQUIRED` (with a reason, such as a utility bill for an unverified address), `REJECTED`, delivered on an event stream |
| **Fidelity** | Opening "automatically establishes a core position, used for processing cash transactions": a money market fund or FCASH in taxable accounts, a money market fund or an FDIC-insured deposit sweep in retirement accounts | Margin and options by separate application | The cash vehicle is chosen at opening, which [Cash, Sweeps & Yield](/books/investing-and-digital-assets/cash-and-sweeps) shows is an economic decision |
| **Kraken** | Individual and corporate accounts at verification levels | Cash limits for a standard verified individual of $100,000 a day and $500,000 per 30 days for deposits and withdrawals; crypto deposits uncapped; per-asset limits (Monero, from August 15, 2026: $3,500 deposit and $1,500 withdrawal per rolling 30 days for individuals) | Limits are a function of verification level and account type, not one switch |
| **Robinhood** | Up to 10 self-directed individual accounts, plus joint, IRA, custodial, trust and managed accounts; Trust Accounts held over $300 million at Q3 2026, and Trump Accounts had been established for nearly 70 million children through automatic enrollment | Only one individual account can be a margin account; Level 2 options in several accounts, Level 3 only in the margin account; crypto trading only in self-directed individual accounts, external crypto transfers and staking only in the primary one | Capabilities are per account, not per customer, and some are allowed in only one account of a kind |

Three things stand out. **Capabilities are the real product surface.** Every platform turns the same rules into a grid of account types against capabilities, and the grid differs: Alpaca makes every account a margin account and narrows it, Robinhood allows one margin account and many cash accounts, Kraken gates money movement by verification level. **The entity is part of the account.** Robinhood's crypto runs in a different company from its broker-dealer and its event contracts in a third (Regulators & Licenses, earlier in this book, maps the entities), so "turn on crypto" is opening an account at another entity under another agreement, even when the app shows one account. **Who runs the CIP depends on the structure.** Alpaca runs KYC for app partners, accepts a fully disclosed broker-dealer partner's own results, and sees no end customers at all in the omnibus setup; the same three choices recur in Brokerage as a Service later in this book.

## Account Types and Titling

The account type is not a label; it decides who the owner is, who can give instructions, how taxes are reported, which capabilities are possible and what happens at death or majority. The core model's `accounts.account_type` takes these values, each with its parties in `account_parties`:

| Type | Owner and who instructs | Tax reporting | Capability limits in practice |
| --- | --- | --- | --- |
| `individual` | One natural person | Owner's TIN, W-9 or W-8BEN | Everything the customer qualifies for |
| `joint` | Two or more people, with a titling (rights of survivorship, tenants in common) chosen at opening | One TIN reports, usually the first-named | Robinhood excludes crypto from joint accounts |
| `ira_traditional`, `ira_roth` | The individual is the owner; a custodian or trustee holds the account | The custodian's forms (5498, 1099-R), covered in [IRAs & Retirement Accounts](/books/investing-and-digital-assets/retirement-accounts#forms-5498-and-1099-r) | No margin borrowing; Robinhood excludes crypto and Gold-level instant deposits |
| `custodial` | A minor owns; an adult custodian instructs until the minor reaches the age set by state law | The minor's TIN | Robinhood excludes crypto |
| `trust` | The trust owns; trustees instruct under the trust instrument | The trust's or grantor's TIN | Depends on the instrument's powers |
| `entity` | A corporation, LLC or partnership; authorized persons instruct | The entity's EIN | Beneficial owners identified as for any legal entity customer |
| `institutional` | A bank, insurer, registered fund, registered adviser or any person with total assets of at least $50 million (FINRA Rule 4512(c)) | Varies | Several retail rules (trusted contact, margin disclosure statement) don't apply |

Two consequences for the model. **The person opening is not always the owner.** For CIP, a broker-dealer's customer is "a person that opens a new account", and where an individual opens an account for someone "who lacks legal capacity" (a minor) or for "an entity that is not a legal person", that individual is the customer (31 CFR 1023.100(d)). The custodian of a UTMA account is verified as the CIP customer; the minor is the owner whose TIN reports the income. Both are parties with roles, and neither is a field on the account. **The type is fixed; the titling is a fact with history.** A joint account becomes an individual account at a death by transfer to a new account, not by editing the old one, because the tax reporting, the statements already sent and the 17a-3 records all belong to the account as it was.

## CIP for Broker-Dealers

The broker-dealer rule (31 CFR 1023.220) has the bank rule's shape: a written program inside the firm's AML program; four elements before opening (name, date of birth for an individual, an address, and a TIN for a US person or a passport number and country or similar for a non-US person); verification "within a reasonable time before or after the customer's account is opened" by documents, non-documentary methods or both; procedures for when the firm can't form a reasonable belief (when not to open, what the customer may do meanwhile, when to close, when to file a SAR); comparison with designated terrorist lists; and a notice before opening. A customer who has applied for a TIN can open if the firm confirms the application was filed and obtains the number "within a reasonable period of time after the account is opened."

Where it differs, the differences are the industry's:

- **"Account" means securities.** It is "a formal relationship with a broker-dealer established to effect transactions in securities", excluding accounts acquired by merger and ERISA plan accounts (1023.100(a)). A crypto account at an affiliate is not an account under this rule, which is why the affiliate runs its own program.
- **The existing-customer exclusion is how one customer opens many accounts.** "A person that has an existing account with the broker-dealer" isn't a new customer if the firm "has a reasonable belief that it knows the true identity of the person" (1023.100(d)). Robinhood's tenth individual account doesn't repeat identity verification; it does repeat the investment profile, because Robinhood requires one per account.
- **Retention runs into the securities records rule.** Identifying information is kept "for five years after the account is closed"; descriptions of documents, non-documentary results and discrepancy resolutions five years after the record is made; and otherwise as 17 CFR 240.17a-4 requires (1023.220(a)(3)).
- **Reliance is how introducing and clearing firms split the work.** A firm may rely on another financial institution's CIP only if the reliance is reasonable, the other is subject to an AML program rule and "regulated by a Federal functional regulator", and it contracts "to certify annually to the broker-dealer" that it has implemented its program and performs the specified steps (1023.220(a)(6)). Two broker-dealers meet that test where a fintech program manager and a bank don't ([KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening#the-cip-rule) explains why the bank can't rely on its fintech). An introducing broker and its clearing firm allocate CIP in their clearing agreement, and the certification is a dated document the model should hold.

The beneficial ownership rule (31 CFR 1010.230) applies to broker-dealers' legal entity customers exactly as to banks', including FinCEN's February 2026 relief from re-identifying owners at every new account ([What changed in 2026](/books/banking-and-lending/kyc-and-account-opening#what-changed-in-2026)).

**Failure looks like volume.** FINRA's March 7, 2025 action against Robinhood Financial and Robinhood Securities ($26 million in fines, $3.75 million in restitution) found, among other things, that Robinhood Financial lacked a reasonable customer identification program, leading to "opening thousands of accounts" without reasonably verifying identities, and that both firms' AML programs missed suspicious money movements and accounts taken over by hackers. An app that opens accounts in seconds will open bad ones in thousands, so the CIP's discrepancy and failure paths need the same engineering as the happy path.

## Crypto Platforms

A US crypto exchange or wallet that holds customers' crypto is, in FinCEN's words, a hosted wallet provider: "account-based money transmitters that receive, store, and transmit CVCs on behalf of their accountholders" (FIN-2019-G001). As a money services business its AML program rule (31 CFR 1022.210) requires policies, procedures and internal controls for "verifying customer identification", and stops there: there is no MSB counterpart to 1023.220 listing the four elements, the verification timing and the retention periods. In practice platforms build to the bank and broker rules anyway, because state licenses (New York's BitLicense, California's DFAL), sponsor banks and the platform's own affiliates demand it, and because the same customer often also holds a brokerage account under 1023.220. Crypto-specific licensing is in [Licensing a Crypto Business](/books/investing-and-digital-assets/crypto-licensing) later in this book.

Two things differ in the flow:

- **Verification gates movement, not just opening.** Kraken's limits are a function of "your verification level and account type": cash deposits and withdrawals of $100,000 a day and $500,000 per 30 days for a standard verified individual, crypto deposits uncapped, crypto withdrawals "dynamic". A crypto account is often open and able to receive before it can send, which makes verification level a capability with limits, not a gate at the door.
- **The address book is part of the customer record.** Withdrawal destinations, allowlists and Travel Rule counterparty information attach to the customer and are reviewed at opening and after ([Crypto In and Out](/books/investing-and-digital-assets/funding-and-transfers#crypto-in-and-out) has the account-level view).

## The Investment Profile

A bank needs to know who you are. A broker needs to know that and what you can afford to lose. Three rules make the investment profile a record with fields:

- **FINRA Rule 2090 (know your customer):** "use reasonable diligence" at opening and throughout to "know (and retain) the essential facts concerning every customer" and the authority of everyone acting for them. Essential facts are those needed to service the account, follow special handling instructions, understand who may act, and comply with the rules.
- **FINRA Rule 4512:** for each account, the customer's name and residence and "whether the customer is of legal age", the associated persons responsible (not for institutional accounts), a principal's signature showing the account was accepted, the persons authorized to act for an entity, and a trusted contact (below). For non-institutional accounts the firm makes reasonable efforts, before settlement of the first trade, to obtain the TIN, occupation and employer, and whether the customer is associated with another FINRA member.
- **Rule 17a-3(a)(17):** for each account with a natural person owner, an account record including name, tax identification number, address, telephone number, date of birth, employment status, annual income, net worth and investment objectives, furnished to the customer for confirmation at intervals "no greater than thirty-six months", for accounts where a suitability determination was required in the past 36 months.

The profile feeds suitability and Reg BI when there is a recommendation ([Advice, Reg BI & Conduct](/books/investing-and-digital-assets/advice-and-conduct#regulation-best-interest)), every capability approval below, and the AML risk rating ([BSA/AML Programs](/books/banking-and-lending/bsa-aml#the-customer-risk-profile)). The engineering rule follows from the 36-month cycle: **the profile is versioned, dated and confirmed**, never a set of mutable columns, because an options approval made in 2024 was made against the 2024 profile, and that is the one an examiner will ask for.

The affiliation questions are not small talk. "Associated with another member" means the customer works at a broker-dealer, which brings duties for both firms; the 4512 question and its companion disclosures (control person of a public company, senior political figure) become flags that route the account to review and change what it may trade. Alpaca's account API carries them as boolean disclosures on the application, which is the right shape: answers with their timestamp, not derived attributes.

## Capabilities and Approvals

Each capability is its own decision, made against the profile, with its own disclosure and agreement:

| Capability | Rule | Disclosure or agreement | Who approves | Clock |
| --- | --- | --- | --- | --- |
| **Margin** | Reg T (12 CFR 220) and FINRA Rule 4210 (Margin & Short Selling, later in this book; [Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#buying-power) previews the math) | Margin agreement; margin disclosure statement (FINRA 2264) "prior to or at the opening", then annually | Firm policy | Before the first margin extension |
| **Options** | FINRA Rule 2360(b)(16) | Options Disclosure Document before approval or the first order; written options agreement | A branch manager, Registered Options Principal or Limited Principal (General Securities Sales Supervisor), in writing; a qualified principal within 10 business days if the branch manager isn't one | Background and financial information sent to the customer for verification within 15 days of approval; signed agreement within 15 days |
| **Uncovered options** | 2360(b)(16)(E) | Special written statement for uncovered option writers, at or before the first uncovered write | A Registered Options Principal, with minimum net equity criteria | Before the first uncovered write |
| **Crypto** | State money transmission and the platform's own program | A separate user agreement with the crypto entity, its risk disclosures and its custody terms | The crypto entity | Before the first crypto order |
| **Futures and event contracts** | CFTC Regulation 1.55 | Risk disclosure statement with a signed, dated acknowledgment before the account opens (institutional customers excepted), and the FCM's firm-specific Disclosure Document, updated at least annually | The FCM | Before the account opens |
| **Short selling** | Reg SHO and the margin agreement | Part of the margin agreement | Firm policy | Before the first short sale |

**Options levels are the firm's, not FINRA's.** Rule 2360 lists what to ask (investment objectives, employment status, estimated annual income, net worth excluding the family residence, liquid net worth, marital status and dependents, age, and experience in options, stocks, bonds and commodities, for every joint holder) and who approves, but defines no tiers. Firms invent them: Alpaca's run from 0 (disabled) through 1 (covered calls and cash-secured puts) and 2 (long calls and puts) to 3 (spreads and straddles), and it distinguishes the approved level from an effective level that a partner may cap lower; Robinhood calls its tiers Level 2 and Level 3 and allows Level 3 only in its one margin account. The options chapter, Options later in this book, covers trading at each level.

**Worked numbers: one application, four capabilities.** A 26-year-old applies with $48,000 annual income, $30,000 liquid net worth, one year of stock experience and none in options, objective "growth", asking for margin, options Level 3, crypto and event contracts. A plausible written policy (each firm writes its own) produces four decisions, each a row:

| Capability | Decision | Recorded reason |
| --- | --- | --- |
| Margin | Approved | Meets the firm's income and net worth floor; margin agreement and 2264 statement delivered and accepted before approval |
| Options | Level 1 approved, Level 3 declined | No options experience; ODD delivered first; Level 3 requires stated experience and a speculation objective under the policy; principal's approval recorded; verification letter due within 15 days |
| Crypto | Approved | Crypto entity's agreement accepted; verification level standard |
| Event contracts | Approved | FCM risk disclosure acknowledged with signature and date; FCM account opened |

A year later the customer updates the profile (two years of options experience, income $70,000) and requests Level 3 again. That is a new approval against the new profile version, not an edit to the old row, and the 15-day verification and agreement clocks start again for the new level.

## Trusted Contacts and Senior Holds

FINRA Rule 4512 requires the firm to ask for the name and contact information of a **trusted contact person**, someone "age 18 or older", for each non-institutional account. Not getting one doesn't block the account if the firm made reasonable efforts. At opening the firm must disclose in writing that it may contact that person to address possible financial exploitation, to confirm the customer's contact information or health status, to identify a guardian, executor, trustee or power of attorney, or as Rule 2165 permits. The trusted contact has no authority over the account; in the model it is an `account_parties` row with role `trusted_contact`, and its value comes when the customer stops answering.

FINRA Rule 2165 lets (never requires) a firm place a **temporary hold** on disbursements of funds or securities, or on securities transactions, in the account of a **specified adult** ("a natural person age 65 and older", or an adult 18 or older the firm reasonably believes has an impairment that prevents them protecting their own interests) when it reasonably believes financial exploitation has occurred, is occurring, has been attempted or will be attempted. The clocks:

- **Notice within two business days** to everyone authorized on the account and the trusted contact, unless the firm believes they are involved, and an internal review starting immediately.
- **The hold expires "not later than 15 business days"** after it is placed.
- **One extension of up to 10 business days** if the internal review supports the belief.
- **A further extension of up to 30 business days** if the review supports it and the firm has reported its belief to a state regulator, agency or court (added by SR-FINRA-2021-016, effective March 17, 2022). A regulator, agency or court can end or extend a hold at any time.
- **Written procedures name the titles** of the supervisory, compliance or legal staff who may place, extend or lift holds, and the firm keeps records of each decision, notice, review and extension.

**Worked numbers: the longest hold.** A 72-year-old customer asks on Tuesday, April 7, 2026 for a $180,000 wire to a new payee, after a caller claiming to be from a federal agency coached them through it. The firm places the hold that day and must notify the authorized parties and the trusted contact within two business days, by Thursday, April 9. The initial hold runs at most 15 business days, to Tuesday, April 28. The internal review supports the belief, so the firm extends 10 business days, to Tuesday, May 12. It reports to the state securities regulator and extends 30 more business days, which skip Memorial Day (May 25) and Juneteenth (June 19) and end on Thursday, June 25. Total: 55 business days, about eleven weeks, before a regulator or court has to act. Each boundary is a scheduled job on the firm's business-day calendar (a weekday count gets the last date wrong by two days here) that either lifts the hold or records the extension and its basis; a hold that silently outlives its clock is a violation of the rule, however well meant.

FINRA has asked for comment on going further: Regulatory Notice 26-02 (January 8, 2026) proposed a new Rule 2166, "Temporary Delays for Suspected Fraud", that would let a firm delay a transaction or disbursement for up to five business days for any customer 18 or older. As of November 2026 FINRA's page shows the comment period closed on March 9, 2026 and no adoption. The bank side of elder exploitation, and the reports it generates, is in [Elder Financial Exploitation](/books/banking-and-lending/account-takeover-and-scams#elder-financial-exploitation).

## Tax Status: W-9 and W-8BEN

Every account needs a tax certification before it pays income, because the broker withholds on what it can't document:

- **US persons certify on Form W-9:** TIN, that they are not subject to backup withholding, and US status. A payee who fails to provide a correct TIN, or who fails to certify that they aren't subject to backup withholding for underreporting, is backup withheld at **24%** on "most kinds of payments reported on Forms 1099", including interest (1099-INT), dividends (1099-DIV) and broker proceeds (1099-B).
- **Nonresident alien individuals certify on Form W-8BEN** to the broker, never to the IRS. Without it the broker withholds "at the foreign-person withholding rate of 30%" on US-source fixed or determinable income (dividends, most interest); a treaty claim on the form reduces the rate. The form generally stays valid from signing "through the last day of the third succeeding calendar year": one signed March 10, 2026 expires December 31, 2029. A change of circumstances must be reported "within 30 days".

The certification is a dated document with an expiry and a status, attached to the party (and to each account it covers). Two jobs come from it: an expiry sweep that requests a new W-8BEN before December 31 of the third year, and a withholding decision at every income event that reads the certification valid on the payment date, not the one on file today. Foreign accounts' year-end form (1042-S) is in Confirms, Statements & Tax Forms later in this book.

## Minors and Custodial Accounts

A custodial account under a state's Uniform Transfers (or Gifts) to Minors Act belongs to the minor from the first deposit: the gift is irrevocable, the minor's TIN reports the income, and the custodian manages the account for the minor's benefit until the age the state's act sets, when the custodian must hand it over. For the opening flow that means:

- **Two parties, two verifications.** The custodian is the CIP customer (1023.100(d)); the minor's identity and date of birth are collected because they drive tax reporting and the termination date.
- **The termination date is computed at opening** from the minor's date of birth and the governing state's age, stored, and turned into a scheduled transfer workflow, because the account doesn't convert itself.
- **Capabilities are narrow.** Margin and uncovered options are inconsistent with a custodian's duty, and Robinhood excludes crypto from custodial accounts.

Trusts are the other account where the opener isn't the owner: the trust instrument (or a certification of trust) establishes who the trustees are and what they may do, and the trust's beneficial owners for CDD purposes follow [Customer Due Diligence and Beneficial Owners](/books/banking-and-lending/kyc-and-account-opening#customer-due-diligence-and-beneficial-owners).

## Privacy Notices Under Regulation S-P

Regulation S-P (17 CFR part 248) is the securities regulators' version of the Gramm-Leach-Bliley privacy rules: a broker-dealer gives a privacy notice when the customer relationship begins and, unless it qualifies for the statutory exception, annually after that, and offers an opt-out before sharing nonpublic personal information with nonaffiliated third parties outside the exceptions. The notice is a `disclosures` row delivered at opening, with its version.

The SEC amended the rule on May 16, 2024 (89 FR 47688, published June 3, 2024, effective August 2, 2024). Covered institutions must keep written policies and procedures for an incident response program "reasonably designed to detect, respond to, and recover from unauthorized access to or use of customer information", including notice to individuals whose sensitive customer information was or is reasonably likely to have been accessed "as soon as practicable, but not later than 30 days" after the institution becomes aware of the incident. The amendments also extended the safeguards rule to transfer agents, broadened the information covered, added recordkeeping, and conformed the annual notice to the statutory exception. Compliance came 18 months after publication for larger entities (December 3, 2025) and 24 months for smaller ones (June 3, 2026), so both are in force as of November 2026. The incident side is in Books, Records & the Audit Trail later in this book; for opening, the amendments mean the application data (SSNs, ID images, bank account numbers) is "customer information" whose access the firm must be able to reconstruct ([Sensitive Data](/docs/security/sensitive-data)).

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `parties`, `party_identities`, `accounts` (with `account_type`, `legal_entity_id`, `capabilities`, `options_level` and `status`), `account_parties` (whose roles include `custodian`, `trustee` and `trusted_contact`), `legal_entities` and `disclosures`. What opening adds is the application that becomes an account, the versioned investment profile, each capability approval, tax certifications, reliance certifications between firms, and senior investor holds.

```sql
CREATE TABLE account_applications (          -- one request to open one account at one entity
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  applicant_party_id UUID NOT NULL REFERENCES parties (id),     -- the CIP customer (custodian, trustee, signer)
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  account_type       TEXT NOT NULL,          -- the accounts.account_type it will create
  titling            TEXT,                   -- 'jtwros', 'tenants_in_common', 'utma:<state>', ...
  requested_caps     TEXT[] NOT NULL DEFAULT '{}',              -- 'margin', 'options:3', 'crypto', ...
  cip_basis          TEXT NOT NULL CHECK (cip_basis IN ('verified_here', 'existing_customer',
                       'reliance', 'not_applicable')),
  reliance_id        UUID REFERENCES cip_reliance_agreements (id),
  status             TEXT NOT NULL CHECK (status IN ('submitted', 'verifying', 'action_required',
                       'approval_pending', 'approved', 'opened', 'rejected', 'withdrawn')),
  account_id         UUID REFERENCES accounts (id),             -- set when opened
  submitted_at       TIMESTAMPTZ NOT NULL,
  decided_at         TIMESTAMPTZ
);

CREATE TABLE cip_reliance_agreements (       -- 1023.220(a)(6): who relies on whom, certified yearly
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  relying_entity_id  UUID NOT NULL REFERENCES legal_entities (id),
  relied_on_name     TEXT NOT NULL,          -- the other broker-dealer or institution
  relied_on_regulator TEXT NOT NULL,         -- its federal functional regulator
  steps_covered      TEXT[] NOT NULL,        -- 'collect', 'verify', 'list_check', 'notice'
  contract_ref       TEXT NOT NULL,
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE reliance_certifications (       -- the annual certification itself
  reliance_id        UUID NOT NULL REFERENCES cip_reliance_agreements (id),
  certified_for_year SMALLINT NOT NULL,
  received_on        DATE NOT NULL,
  document_ref       TEXT NOT NULL,
  PRIMARY KEY (reliance_id, certified_for_year)
);

CREATE TABLE investment_profiles (           -- 2090, 4512, 17a-3(a)(17); a new row per change
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  version            INT NOT NULL,
  annual_income      INT8RANGE,              -- minor units, as the bands asked
  net_worth_ex_home  INT8RANGE,
  liquid_net_worth   INT8RANGE,
  employment_status  TEXT,
  employer           TEXT,
  objectives         TEXT[] NOT NULL,        -- 'income', 'growth', 'speculation', ...
  risk_tolerance     TEXT,
  experience         JSONB NOT NULL,         -- years by product: stocks, options, futures, crypto
  marital_status     TEXT,
  dependents         SMALLINT,
  affiliations       JSONB NOT NULL,         -- member firm, control person, political exposure, with answers as given
  source             TEXT NOT NULL CHECK (source IN ('application', 'customer_update', 'periodic_confirmation')),
  recorded_at        TIMESTAMPTZ NOT NULL,
  confirmation_sent_at TIMESTAMPTZ,          -- the account record sent back for review
  UNIQUE (account_id, version)
);

CREATE TABLE capability_approvals (          -- one decision on one capability
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  capability         TEXT NOT NULL,          -- 'margin', 'options', 'uncovered_options', 'crypto', 'futures', 'event_contracts', 'short_selling'
  level_requested    SMALLINT,
  level_granted      SMALLINT,               -- NULL when declined
  decision           TEXT NOT NULL CHECK (decision IN ('approved', 'declined', 'approved_lower', 'revoked')),
  profile_id         UUID NOT NULL REFERENCES investment_profiles (id),  -- what it was decided against
  policy_version     TEXT NOT NULL,
  reason_codes       TEXT[] NOT NULL,
  approver_id        UUID,                   -- the principal, for options
  approver_role      TEXT,                   -- 'rop', 'branch_manager', 'lp_gsss', 'system'
  disclosure_ids     UUID[] NOT NULL,        -- ODD, 2264 statement, 1.55 risk statement, delivered first
  agreement_due_on   DATE,                   -- 2360(b)(16)(D): 15 days after approval
  agreement_received_on DATE,
  verification_due_on DATE,                  -- 2360(b)(16)(C): 15 days after approval
  verification_sent_on DATE,
  decided_at         TIMESTAMPTZ NOT NULL
);

CREATE TABLE tax_certifications (            -- W-9, W-8BEN, W-8BEN-E
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id           UUID NOT NULL REFERENCES parties (id),
  form               TEXT NOT NULL CHECK (form IN ('w9', 'w8ben', 'w8bene')),
  signed_on          DATE NOT NULL,
  expires_on         DATE,                   -- W-8BEN: December 31 of the third succeeding year
  treaty_country     TEXT,
  treaty_rate_bps    INT,
  backup_withholding BOOLEAN NOT NULL DEFAULT false,
  status             TEXT NOT NULL CHECK (status IN ('valid', 'expired', 'superseded', 'invalid')),
  document_ref       TEXT NOT NULL
);

CREATE TABLE senior_investor_holds (         -- FINRA 2165
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  scope              TEXT NOT NULL CHECK (scope IN ('disbursement', 'transaction')),
  subject_ref        UUID,                   -- the transfer or order held
  placed_on          DATE NOT NULL,
  notice_due_on      DATE NOT NULL,          -- 2 business days
  notices_sent_at    TIMESTAMPTZ,
  expires_on         DATE NOT NULL,          -- moves with each extension
  stage              TEXT NOT NULL CHECK (stage IN ('initial', 'extended_10', 'extended_30',
                       'regulator_extended', 'lifted', 'expired')),
  reported_to        TEXT,                   -- regulator, agency or court, for the 30-day extension
  case_id            UUID REFERENCES cases (id),
  placed_by_role     TEXT NOT NULL
);
```

The application's state machine follows the vendors' and Alpaca's public statuses, with the CIP failure procedure as real states:

![Account application states: submitted, verifying, approval_pending, approved and opened in a row, with the path to opened accented and opened a terminal state. From verifying, a loop up to action_required and back down when documents are received. Dashed exits to the terminal rejected state from verifying when identity can't be verified and from approval_pending when declined.](/diagrams/ida-account-application.svg "An application reaches an account only through verification and an approval; missing documents loop back, and a failed verification or a declined approval ends it. Withdrawal, possible from any state before opened, is left out of the drawing.")

- `verifying` runs the identity checks of [Verifying Identity in Software](/books/banking-and-lending/kyc-and-account-opening#verifying-identity-in-software), skipped when `cip_basis` is `existing_customer` or `reliance`, which must point at the evidence (the existing verified identity or the reliance agreement in force that day).
- `action_required` carries a reason and a document request; it times out to `rejected` under the CIP's "when to close" rule.
- `approved` to `opened` creates the `accounts` row, its `account_parties`, the profile's version 1 and one `capability_approvals` row per requested capability, all in one transaction; the account's `capabilities` and `options_level` columns are a cache of the approvals in force, rebuilt from them, and its `status` is `pending` until then.

Design notes:

- **Capabilities derive from approvals.** A revocation (a margin account closed to new borrowing after a deficit, options downgraded after a complaint) is a new approval row with `decision = 'revoked'`, and the order path reads the cache that rebuilds from the rows. Never edit the cache directly.
- **Disclosures precede the decision they condition.** The approval references the delivered ODD, 2264 statement or 1.55 acknowledgment, and the database can enforce that each referenced disclosure's `delivered_at` is earlier than `decided_at`.
- **The 36-month confirmation is a job.** For each account whose profile wasn't sent in 36 months (and that had a suitability determination in that time), send the account record and record `confirmation_sent_at`; a customer's corrections create a new profile version.
- **Holds are clocks on a business-day calendar.** Compute `notice_due_on` and `expires_on` with the firm's calendar, schedule the lift, and require an extension row with its basis before the date passes.
- **One customer, many entities.** The same `parties` row has applications at the broker-dealer, the crypto entity and the FCM; identity verification can be shared within the group where each entity's program allows, but each application, agreement and approval belongs to its entity.

## Auditing

FINRA examiners sample new accounts, and state regulators and NYDFS examine crypto onboarding. Keep:

- **Every application with its CIP evidence:** identifying information for five years after the account closes, verification results and discrepancy resolutions for five years after they were made, and the reliance agreement and annual certification when the CIP was someone else's.
- **Every profile version** with how it was obtained and when the account record was sent for confirmation.
- **Every capability decision** with the profile it was made against, the policy version, the approver and the disclosures delivered before it; for options, the 15-day verification and agreement dates.
- **Trusted contact requests and answers,** including the reasonable-efforts record when the customer declined.
- **Every 2165 hold** with its notices, review, extensions, basis for each and lift, as the rule's records requirement lists.
- **Tax certifications** by version with the withholding applied at each payment.
- **Privacy notices delivered** by version and date, and access logs for application data under the amended Reg S-P.

## What This Means for the System You Build

- **Model capabilities as approvals,** each against a profile version, a policy version and the disclosures delivered first; the account's capability set is derived.
- **Keep the entity on every application and account,** and treat "turn on crypto" or "turn on event contracts" as opening an account at another entity.
- **Record the CIP basis** (verified here, existing customer, reliance) and make reliance a dated agreement with annual certifications.
- **Version the investment profile** and run the 36-month confirmation as a job.
- **Model parties by role:** the custodian, the minor, trustees, joint owners, the trusted contact, authorized traders.
- **Schedule every clock:** options verification and agreement at 15 days, 2165 notices at two business days and hold expiries at 15, 25 and 55, W-8BEN expiry at the end of the third year.
- **Treat application data as customer information** under Reg S-P, with access logged and incident notice within 30 days.

## References

**Law and regulation**

- [31 CFR 1023.220: Customer identification programs for broker-dealers](https://www.law.cornell.edu/cfr/text/31/1023.220), minimum information, TIN-pending accounts, verification timing and methods, lack of verification, retention, list comparison, notice and reliance conditions
- [31 CFR 1023.100: Definitions](https://www.law.cornell.edu/cfr/text/31/1023.100), "account" as a relationship to effect securities transactions and its exclusions, "customer" including an individual opening for a person lacking capacity or a non-legal-person entity, the existing-customer exclusion
- [31 CFR 1022.210: Anti-money laundering programs for money services businesses](https://www.law.cornell.edu/cfr/text/31/1022.210), "verifying customer identification" as a program element, with no separate CIP rule
- [17 CFR 240.17a-3: Records to be made by certain exchange members, brokers and dealers](https://www.law.cornell.edu/cfr/text/17/240.17a-3), the (a)(17) account record fields and the 36-month furnishing interval
- [12 CFR 220.8: Cash account](https://www.law.cornell.edu/cfr/text/12/220.8), the cash account rules that a cash-only configuration follows
- [17 CFR 1.55: Public disclosures by futures commission merchants](https://www.law.cornell.edu/cfr/text/17/1.55), the risk disclosure statement and signed acknowledgment before opening, the institutional exception and the firm-specific Disclosure Document
- [Federal Register: Regulation S-P amendments (89 FR 47688, June 3, 2024)](https://www.federalregister.gov/api/v1/documents/2024-11116.json), publication date, effective August 2, 2024, and the scope of the amendments

**Regulators and guidance**

- [FINRA Rule 2090: Know Your Customer](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2090), reasonable diligence and essential facts
- [FINRA Rule 4512: Customer Account Information](https://www.finra.org/rules-guidance/rulebooks/finra-rules/4512), required account information, the trusted contact person, reasonable efforts, the institutional account definition and its $50 million test
- [FINRA Rule 2165: Financial Exploitation of Specified Adults](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2165), specified adults, hold scope, two-business-day notice, the 15, 10 and 30 business day periods, procedures and records, amendment history
- [FINRA Rule 2360: Options](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2360), (b)(16) ODD delivery, due diligence items, principal approval, 15-day verification and agreement, uncovered writing procedures
- [FINRA Rule 2264: Margin Disclosure Statement](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2264), delivery at or before opening, annual delivery and the statement's key points
- [FINRA Regulatory Notice 26-02 (January 8, 2026)](https://www.finra.org/rules-guidance/notices/26-02), proposed Rule 2166 temporary delays of up to five business days for customers 18 or older, comments due March 9, 2026
- [SEC: Press release 2024-58 (May 16, 2024)](https://www.sec.gov/newsroom/press-releases/2024-58), Regulation S-P incident response program, 30-day notice and the 18 and 24 month compliance periods
- [FinCEN: Application of FinCEN's Regulations to Certain Business Models Involving Convertible Virtual Currencies (FIN-2019-G001, May 9, 2019)](https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf), hosted wallet providers as account-based money transmitters
- [IRS: Backup withholding](https://www.irs.gov/businesses/small-businesses-self-employed/backup-withholding), the 24% rate, its triggers and the 1099 payments it covers
- [IRS: Instructions for Form W-8BEN](https://www.irs.gov/instructions/iw8ben), who gives the form, validity through the third succeeding calendar year, 30-day change notice and 30% withholding

**Courts and enforcement**

- [FINRA: Robinhood Financial to pay $3.75 million in restitution, firms fined $26 million (March 7, 2025)](https://www.finra.org/media-center/newsreleases/2025/finra-orders-robinhood-financial-pay-375-million-restitution), the CIP finding of "thousands of accounts" opened without reasonable verification and the AML findings

**Filings**

- [Robinhood: Q3 2026 results (Exhibit 99.1, October 2026)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), Trust Accounts over $300 million and Trump Accounts for nearly 70 million children

**Vendor documentation**

- [Alpaca: Account opening](https://docs.alpaca.markets/docs/account-opening), the three partner setups, the CIP API, account statuses, all accounts as margin accounts and cash configuration
- [Alpaca: Account API](https://docs.alpaca.markets/reference/getaccount-1), `options_approved_level` and `options_trading_level` on a 0 to 3 scale and `crypto_status`
- [Fidelity: Account FAQs](https://www.fidelity.com/trading/faqs-about-account), the core position established at opening and its options for taxable and retirement accounts
- [Kraken: Deposit and withdrawal limits](https://support.kraken.com/hc/en-us/articles/360001449826-Verification-levels-explained), cash limits for a standard verified individual, dynamic crypto withdrawal limits and Monero limits from August 15, 2026 (last updated October 30, 2026)
- [Robinhood: Multiple investing accounts FAQ](https://robinhood.com/us/en/support/articles/multiple-investing-accounts-faq/), up to 10 individual accounts, one margin account, options levels by account, crypto only in self-directed individual accounts
