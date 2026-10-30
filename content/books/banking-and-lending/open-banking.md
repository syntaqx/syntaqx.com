+++
title = "Open Banking in the US"
description = "US open banking: aggregators, screen scraping to APIs, FDX and Akoya, tokenized account numbers, consent, the 1033 rule and its injunction, and access fees."
category = "Banking & Lending Industry"
order = 2430
part = "Fintech and BaaS"
tags = ["banking", "fintech", "open-banking", "section-1033", "fdx", "data-access", "aggregators"]
+++

Open banking in the US is a consumer telling their bank to give their account data to someone else, and the bank doing it. Most of the fintech economy runs on it: account verification before an ACH debit, cash-flow underwriting, income checks for EWA and lending, budgeting apps, and the account linking every neobank uses to fund a new account. For two decades it worked by **screen scraping**: the consumer handed their online banking username and password to an aggregator, which logged in as them and read the pages. It is moving, bank by bank, to **APIs**: the consumer authenticates at their own bank, grants a scoped permission, and the aggregator receives a token instead of a password. Unlike the UK and EU, the US has no law in force requiring any of this. Congress wrote the right into section 1033 of the Dodd-Frank Act in 2010, the CFPB finalized a rule implementing it in November 2024, and a federal court has barred the CFPB from enforcing that rule since October 29, 2025 while the agency rewrites it.

So the US system is private contracts and a common standard, built to the shape of a rule that isn't enforceable yet. Banks sign bilateral data access agreements with aggregators, most of them on the Financial Data Exchange (FDX) API; JPMorgan Chase started charging aggregators for access in 2025; and the revised rule, which may allow fees, was still under White House review as of October 2026. This chapter covers the players, the move from scraping to APIs, tokenized account numbers, consent and its life cycle, the 1033 rule as written, its litigation and reconsideration, data access fees, the developer interface a bank builds, and the data model on both sides. The ACH debit that usually follows a link is the Payments volume's ([Validating the Account](/books/payments/ach#validating-the-account)); the UK and EU regimes, where the law came first, are [Open Banking in the UK & EU](/books/banking-and-lending/open-banking-uk-and-eu).

## How the Platforms Do It

As of October 2026, from the companies' own pages and documentation:

| Company | Role | What it says about itself | Notes for builders |
| --- | --- | --- | --- |
| **Plaid** | Aggregator | "9,000+" fintechs built on it; supports "over 12,000 financial institutions" | Link flow with OAuth where banks offer it; Auth returns account and routing numbers (tokenized at three banks); `/transactions/sync` with up to 730 days of history; Plaid Check is a consumer reporting agency subsidiary selling reports and a 1 to 99 LendScore with adverse action reasons |
| **MX** | Aggregator and data enhancement | 90 days of account and transaction data; transactions cleansed into more than 100 categories | Background aggregation about every 24 hours, skipped within 20 hours of the last, and no new aggregation within 3 hours of a success |
| **Mastercard Open Finance** (Finicity) | Aggregator owned by Mastercard | Pay, Manage, Lend and Small Business products | Account ownership and balance checks for payments; credit decisioning reports for lenders |
| **Akoya** | Bank-side data access network, since 2020 | Works with more than 4,300 financial institutions; consumers "never share" credentials with apps | FDX-based APIs; issues tokenized account numbers with their own routing numbers |
| **JPMorgan Chase** | Data provider (a bank) | About 2 billion API data requests a month from 11,000 apps, per its statements reported in December 2025 | Charges aggregators per call since 2025; renewed its agreement with Plaid with a pricing structure on September 16, 2025 |
| **FDX** | Standard setter | 200+ members; about 114 million customer connections on FDX-aligned APIs in its spring 2025 survey; API v6.4 released spring 2025 | Recognized by the CFPB as a standard-setting body under the 1033 rule |

Three things stand out. **Aggregators are on both sides of the market:** they sell connectivity to fintechs and negotiate access with banks, and a fintech usually integrates one or two of them rather than thousands of banks. **The network is moving toward the bank:** Akoya was built so the bank, not the aggregator, holds the connection, and the largest banks now set terms by contract. **Data has become a credit product:** Plaid Check's reports and score make the aggregator a consumer reporting agency under the FCRA, which brings permissible purpose, disputes and adverse action reasons into what used to be a plumbing API ([Credit Data & Scores](/books/banking-and-lending/credit-data-and-scores#cash-flow-and-alternative-data)).

## From Screen Scraping to APIs

Screen scraping works everywhere and fails in every way that matters: the aggregator stores the consumer's banking password, sees everything the consumer can see, breaks whenever the bank redesigns a page, and looks to the bank like the consumer logging in from a data center at 3 a.m. Every connection is a credential the bank can't scope or revoke.

API access fixes each of those. The consumer is redirected to their bank, authenticates there (with the bank's own multi-factor), picks which accounts to share, and the bank issues a token to the aggregator; the bank can then see exactly which third party holds access to which accounts, limit what it receives, and revoke it. Plaid requires OAuth support for integrations with US, EU and UK institutions that offer it, and recommends against embedding the flow in an iframe because conversion on OAuth institutions runs up to 15 percentage points higher through its SDKs. The 1033 rule as written would end screen scraping of covered banks: a third party "may not access the developer interface" using the credentials the consumer uses for the bank's own site or app (12 CFR 1033.311(e)(1)).

**FDX** is the common API: an industry standards body with more than 200 members whose API specification banks and aggregators implement. The CFPB recognized it as a standard-setting body under the rule's process for consensus standards, and the rule treats conformance to a consensus standard as an indicium that an interface's format and performance are compliant. An aggregator integrated to FDX can reach any conforming bank with one integration, which is what makes the transition economically possible.

## Tokenized Account Numbers

An account and routing number shared with an app is a standing ability to debit the account. **Tokenized account numbers (TANs)** replace it with a number that works only for that app and only while consent lasts:

- **Unique per app.** "Each app a user connects to will receive a unique TAN" (Plaid). A leaked TAN identifies one app's access, not the account.
- **Rails.** TANs work for ACH and RTP, not wires or checks.
- **Format.** Akoya's TANs are no longer than 17 digits, always start with "00", and come with a TAN-specific routing number; the pair must be used together, and mixing a TAN with a standard routing number returns R04 (invalid account number). The bank resolves the token to the real account in a vault during payment processing. The Clearing House's Secure Token Exchange tokenizes account numbers for banks.
- **Revocation.** When consent is revoked, the TAN stops working and debits return R04, whether revoked yesterday or months ago. Plaid notes US Bank as an exception whose TANs remain valid after revocation. Updating the connection doesn't restore a revoked TAN; the app fetches a new one.
- **Deduplication.** Because the number differs per connection, a provider can't recognize the same account across two links by its number; Plaid exposes a `persistent_account_id` at TAN banks for that.

As of October 2026 Plaid lists only Chase, PNC and US Bank as issuing TANs. The 1033 rule allows a bank to provide a tokenized number instead of the real one, but not "as a pretext" to restrict competitive use of payment information (1033.211(c)). For the payee, a TAN changes the ACH design: the stored number is per connection, an R04 return after revocation means "re-link", not "bad account", and the [return codes](/books/payments/ach#returns-when-money-is-really-yours) need that mapping.

## Consent, Expiry and Revocation

A connection is a consent with a life cycle, and each layer sets its own clock:

- **The bank's consent.** Plaid reports that US OAuth consents generally must be refreshed every 12 months, with exceptions: some institutions every 3 months, USAA every 18, and Chase letting the user choose 6 months, a year or "always" for new connections. EU and UK consents typically last 180 days.
- **Warning.** Plaid sends `PENDING_DISCONNECT` (US) or `PENDING_EXPIRATION` (UK and EU) a week before consent expires.
- **Revocation at the bank.** If the consumer revokes access in their bank's app, the connection enters `ITEM_LOGIN_REQUIRED` in about 24 to 48 hours, and Plaid tells the app to delete the associated data.
- **The 1033 rule's clock.** A third party's collection may last at most one year after the most recent authorization, and to continue it must obtain a new authorization "no later than the anniversary" of the last one (1033.421(b)). Revocation must be at least as easy as the original authorization, with no cost or penalty, and the third party must notify the bank and any aggregator when it receives one (1033.421(h)).

The product consequence: every feature that depends on a connection (autopay from a linked account, cash-flow monitoring on a credit line, an EWA estimate) needs a degraded path for when the connection lapses, and a re-consent flow that starts before the deadline, not after the first failure.

## The 1033 Rule

**The statute.** Section 1033 (12 U.S.C. 5533) says a covered person "shall make available to a consumer, upon request," information about the product the consumer obtained, including transactions, costs, charges and usage, "in an electronic form usable by consumers", subject to CFPB rules. It excludes confidential commercial information such as scoring algorithms, information collected to prevent fraud or money laundering, information other law keeps confidential, and information not retrievable in the ordinary course.

**The rule.** "Required Rulemaking on Personal Financial Data Rights", 89 FR 90838 (November 18, 2024), effective January 17, 2025, docket CFPB-2023-0052, RIN 3170-AA78, at 12 CFR part 1033. As written:

- **Who must share.** Data providers: Regulation E financial institutions, Regulation Z card issuers, and others controlling information about covered accounts, such as digital wallet providers (1033.111(c)). Covered products are Regulation E accounts, Regulation Z credit cards, and services that facilitate payments from them. Depository institutions at or under the SBA size standard are excluded from the interface obligations.
- **What.** Transaction information, with 24 months of history deemed sufficient; balances; payment initiation information such as account and routing numbers, possibly tokenized; terms and conditions including pricing; upcoming bills; and basic account verification information (1033.211).
- **How.** A consumer interface and a developer interface, the latter standardized and machine-readable, with a **99.5%** monthly floor of proper responses, no unreasonable frequency limits, no credential-based access, and a GLBA-grade security program (1033.311). Access may be denied only for reasonable, specific, consistently applied risk management reasons (1033.321). **No fees** for the interfaces or for answering requests (1033.301(c)).
- **Third parties.** An authorization disclosure naming the third party, the bank and any aggregator, the product, the data categories, the duration and the revocation method, signed by the consumer; a certification to limit collection, use and retention to what is "reasonably necessary" for the product; targeted advertising, cross-selling and selling data excluded from that by definition; one-year maximum duration; onward recipients bound by contract (1033.401 to 1033.431). Records kept three years.

**When.** Compliance was tiered by size (1033.121), and the dates are still printed in the regulation:

| Tier | Data providers | First compliance date |
| --- | --- | --- |
| 1 | Depository institutions with at least $250 billion in assets; nondepositories with at least $10 billion in receipts in 2023 or 2024 | April 1, 2026 |
| 2 | Depository institutions with $10 billion to $250 billion; other nondepositories | April 1, 2027 |
| 3 | Depository institutions with $3 billion to $10 billion | April 1, 2028 |
| 4 | Depository institutions with $1.5 billion to $3 billion | April 1, 2029 |
| 5 | Depository institutions with $850 million to $1.5 billion | April 1, 2030 |

## The Injunction and the Rewrite

Status as of October 2026:

- **The lawsuit.** Forcht Bank, the Kentucky Bankers Association and the Bank Policy Institute sued: *Forcht Bank, N.A. v. CFPB*, No. 5:24-cv-00304-DCR (E.D. Ky.). After earlier stays, on **October 29, 2025** the court enjoined the CFPB from enforcing the rule "until it has completed its reconsideration of the Rule." The first compliance date, April 1, 2026, passed with nothing enforceable. The rule hasn't been vacated and remains in the CFR.
- **The appeal.** On March 30, 2026 the Sixth Circuit granted the banking plaintiffs' motion to hold the appeals in abeyance while the CFPB completes its rulemaking.
- **The reconsideration.** The CFPB published an advance notice of proposed rulemaking, "Personal Financial Data Rights Reconsideration", 90 FR 40986 (August 22, 2025), docket CFPB-2025-0037, comments closing October 21, 2025, asking about four things: who may act as the consumer's "representative", whether data providers may charge fees to cover their costs, data security, and privacy.
- **The proposal.** The CFPB sent a notice of proposed rulemaking to the Office of Information and Regulatory Affairs for review on August 6, 2026, as reported at the time. The Federal Register lists no CFPB proposed rule of any kind published between August 1 and October 30, 2026, so the proposal hasn't been published and its contents aren't public. <!-- source-gap: 1033-revised-proposal | status | the OIRA submission date (reported, not seen on reginfo.gov, which didn't load) and the proposal's contents; non-publication is sourced to the Federal Register | closes with: the reginfo.gov review record, or Federal Register publication of the NPRM | checked: 2026-10-30 -->

For a builder, the rule as written is still the best specification of the interface and consent model the market is converging on, and FDX is the format. The open questions the rewrite will settle are commercial (fees), legal (who counts as the consumer's agent, which decides whether aggregators and their clients qualify) and operational (compliance dates). Keep each as configuration: the authorization duration, the fee schedule per data recipient, and the compliance tier.

## Data Access Fees

The 2024 rule bans fees. The market moved anyway. JPMorgan Chase began charging data aggregators in 2025, per call rather than as a flat fee; it renewed its Plaid agreement with an undisclosed pricing structure on September 16, 2025; and by December 2025 it was the only bank reported to be charging, with PNC's head of retail banking urging the CFPB to allow fees. New York bills introduced in March 2026 (A.10640 and S.9483) would prohibit them, and were in committee as of October 2026. Whether the revised federal rule permits fees is the most consequential open question in it.

The cost lands on whoever is downstream. An aggregator that pays per call to a large bank either absorbs it or passes it to fintechs per connection or per refresh, and a fintech's unit economics then depend on how often it pulls: in a month, a lender that refreshes balances daily for cash-flow monitoring pays for 30 pulls where one that pulls once at application pays for one. My rule: record every data pull with its purpose, so the refresh schedule can be tuned to the price and every pull can be tied to the product the consumer authorized.

## Worked Numbers: The 99.5% Floor

The rule's performance floor is a ratio: proper responses over total requests, at least 99.5% "in each calendar month", excluding requests during scheduled downtime with reasonable notice (1033.311(c)). A proper response fulfills the request or explains why it wasn't, follows the provider's policies, and arrives in a commercially reasonable time.

At JPMorgan Chase's reported 2 billion requests a month, 99.5% leaves room for **10 million** improper responses in the month. A mid-sized bank with 3 million requests a month gets **15,000**. A one-hour unplanned outage at a steady rate (3 million over a 30-day month is about 4,200 an hour) fails about 4,200 requests, more than a quarter of the month's allowance; the same hour as noticed scheduled downtime doesn't count at all. Slow responses count against the floor too, because a response outside a commercially reasonable time isn't proper.

The bank must also publish, by the last day of each month, the previous month's rate, as a percentage rounded to four decimal places, with a rolling 13 months, in human- and machine-readable form (1033.341(d)). That turns an internal [SLO](/docs/operations/slos#setting-targets) into a public, monthly, regulator-readable number: a month at 99.4987% is a published miss.

## Building a Data Provider Interface

A bank's developer interface is an API product with regulatory acceptance criteria. Its parts, read from the rule and from how banks run their portals:

- **Third-party onboarding.** A registry of who may connect: legal name, website, LEI and security contact (the rule lets a bank deny a third party that won't publish these), security evidence, any data access agreement, and status. A denial records the specific risk, the policy it rests on and that it was applied consistently.
- **Authorization at the bank.** The consumer authenticates with the bank's own login, sees which third party and aggregator is asking, selects accounts, and confirms the data categories. The bank may confirm the scope with the consumer, but a confirmation process that unreasonably delays access is itself a violation.
- **A permissions page.** The consumer's view of every third party with access, with revocation by account or entirely; on revocation the bank stops access and notifies the third party.
- **The API.** FDX resources, versioned, with developer documentation describing every field, and request limits that are written down and non-discriminatory ([Rate Limiting](/docs/requests/rate-limiting#limits)). Tokens and scopes follow [OAuth 2.0 for Delegated Access](/docs/api-design/authentication#oauth-2-0-for-delegated-access).
- **Payment information.** Account and routing numbers or TANs, issued per third party, resolved at posting.
- **Measurement.** Every request logged with its third party, consumer, endpoint, response class and latency, so the monthly ratio is a query and the public disclosure is generated, not compiled.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model), for both sides. A fintech is a **data recipient**: it holds connections and authorizations. A bank is a **data provider**: it holds third-party registrations, grants and metrics. The consumer is a `parties` row on each side, the accounts shared are `accounts` rows at the provider, and the authorization disclosure the consumer signed is a `disclosures` row.

```sql
-- Data recipient side (a fintech, lender or app)
CREATE TABLE data_connections (              -- one link to one institution through one aggregator
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  institution_id      UUID REFERENCES institutions (id),   -- null for a nonbank data provider
  aggregator          TEXT,                   -- 'plaid', 'mx', 'mastercard', 'akoya', ... or null
  connection_ref      TEXT NOT NULL,          -- the aggregator's item or connection ID
  access_token_ref    TEXT NOT NULL,          -- vaulted; never in this table in clear
  method              TEXT NOT NULL CHECK (method IN ('api_oauth', 'credential', 'manual')),
  status              TEXT NOT NULL CHECK (status IN ('active', 'pending_expiration',
                        'login_required', 'revoked', 'expired', 'deleted')),
  consent_expires_at  TIMESTAMPTZ,            -- the bank's clock, as the aggregator reports it
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_deleted_at     TIMESTAMPTZ             -- set when revocation or expiry requires deletion
);

CREATE TABLE data_authorizations (           -- the consumer's authorization to this recipient
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  data_connection_id  UUID NOT NULL REFERENCES data_connections (id),
  regime              TEXT NOT NULL CHECK (regime IN ('us_1033', 'us_contract', 'uk_ais', 'eu_ais')),
  disclosure_id       UUID NOT NULL REFERENCES disclosures (id),  -- the signed authorization disclosure
  product_purpose     TEXT NOT NULL,          -- the product the data is reasonably necessary for
  data_categories     TEXT[] NOT NULL,        -- 'transactions', 'balances', 'payment_info', ...
  granted_at          TIMESTAMPTZ NOT NULL,
  reauthorize_by      TIMESTAMPTZ NOT NULL,   -- one year under 1033; the regime's clock otherwise
  revoked_at          TIMESTAMPTZ,
  revoked_via         TEXT CHECK (revoked_via IN ('recipient', 'data_provider', 'aggregator')),
  CHECK (regime <> 'us_1033' OR reauthorize_by <= granted_at + INTERVAL '1 year')
);

CREATE TABLE linked_payment_accounts (       -- what a connection returned for ACH or RTP
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  data_connection_id  UUID NOT NULL REFERENCES data_connections (id),
  persistent_ref      TEXT,                   -- stable across reconnections at TAN banks
  routing_number      TEXT NOT NULL,
  number_token        TEXT NOT NULL,          -- vaulted; a TAN or a real number
  is_tokenized        BOOLEAN NOT NULL,
  valid_until_revoked BOOLEAN NOT NULL,       -- a TAN dies with consent at most banks
  last_return_code    TEXT                    -- R04 after revocation means re-link
);

CREATE TABLE data_pulls (                    -- every fetch, for purpose, cost and minimization
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  data_authorization_id UUID NOT NULL REFERENCES data_authorizations (id),
  categories          TEXT[] NOT NULL,
  purpose             TEXT NOT NULL,          -- 'account_verification', 'underwriting', 'monitoring', ...
  pulled_at           TIMESTAMPTZ NOT NULL,
  cost_minor          BIGINT                  -- where the aggregator or bank charges per call
);

-- Data provider side (a bank)
CREATE TABLE third_party_registrations (     -- who may use the developer interface
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  legal_name          TEXT NOT NULL,
  lei                 TEXT,
  website             TEXT NOT NULL,
  security_contact    TEXT NOT NULL,
  role                TEXT NOT NULL CHECK (role IN ('third_party', 'aggregator')),
  agreement_ref       TEXT,                   -- a bilateral data access agreement, if any
  status              TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied', 'suspended')),
  denial_reason       TEXT,                   -- the specific risk and the policy it rests on
  decided_at          TIMESTAMPTZ
);

CREATE TABLE data_access_grants (            -- what the bank lets one third party see for one consumer
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  third_party_id      UUID NOT NULL REFERENCES third_party_registrations (id),
  aggregator_id       UUID REFERENCES third_party_registrations (id),
  account_ids         UUID[] NOT NULL,        -- accounts rows the consumer selected
  data_categories     TEXT[] NOT NULL,
  granted_at          TIMESTAMPTZ NOT NULL,
  expires_at          TIMESTAMPTZ,
  revoked_at          TIMESTAMPTZ,
  revoked_by          TEXT CHECK (revoked_by IN ('consumer', 'third_party', 'bank')),
  third_party_notified_at TIMESTAMPTZ
);

CREATE TABLE tokenized_account_numbers (     -- one per account per grant
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  data_access_grant_id UUID NOT NULL REFERENCES data_access_grants (id),
  tan_token           TEXT NOT NULL UNIQUE,   -- vault reference to the "00" number
  tan_routing_number  TEXT NOT NULL,
  disabled_at         TIMESTAMPTZ             -- set with the grant's revocation; posting returns R04
);

CREATE TABLE interface_performance_months (  -- the 1033.341(d) disclosure, generated
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  month               DATE NOT NULL,          -- first day of the month
  total_requests      BIGINT NOT NULL,        -- excluding noticed scheduled downtime
  proper_responses    BIGINT NOT NULL,
  response_rate       NUMERIC(7, 4) GENERATED ALWAYS AS
                        (ROUND(100.0 * proper_responses / NULLIF(total_requests, 0), 4)) STORED,
  published_at        TIMESTAMPTZ,
  PRIMARY KEY (institution_id, month)
);
```

On the recipient side, `data_authorizations` is the 1033 authorization and also the contract-era consent: the `regime` column lets one table serve both, and the UK and EU chapter adds its own clocks to the same rows. A revoked authorization fires deletion of the data that is no longer "reasonably necessary" and marks the connection; `data_pulls` makes the minimization and cost questions answerable. On the provider side, posting reads `tokenized_account_numbers` to resolve an incoming ACH or RTP entry to the real account and returns R04 when the token is disabled, so revocation and payment are the same event. `interface_performance_months` is computed from the request log, and the public page renders it. Connection status changes arrive as aggregator webhooks ([Webhooks: Consumer Expectations](/docs/api-design/webhooks#consumer-expectations)), and every access token is a secret held in a vault ([Secrets](/docs/payments/sensitive-data#secrets)).

## Auditing

Open banking is examined as information security (GLBA), as third-party risk on the bank's side, as consumer protection (UDAP, Regulation E for payments from linked accounts) and, where data feeds credit decisions, as FCRA. Under the 1033 rule as written, both sides keep records for three years. Keep:

- **Every authorization disclosure as signed,** its categories, purpose, duration and each reauthorization and revocation ([What a Record Holds](/docs/architecture/audit-trails#what-a-record-holds)).
- **Every pull, with its purpose,** tied to the authorization that allowed it.
- **Deletion on revocation or expiry,** with what was deleted and when.
- **Third-party decisions at the bank,** approvals and denials with reasons, showing consistent application.
- **Grants and revocations at the bank,** including the notice to the third party.
- **Monthly performance,** the request counts behind each published rate, and scheduled downtime with its notice.
- **TAN issuance and disabling,** tied to grants, so a payment returned R04 can be explained.

## What This Means for the System You Build

- **A connection is a consent with clocks:** the bank's expiry, the regime's reauthorization date, and revocation from any of three parties.
- **Plan for the lapse,** with re-consent flows before expiry and degraded behavior after it.
- **Store tokens, never credentials,** and treat a TAN as per-connection payment data that dies with consent.
- **Record purpose on every pull,** for minimization, fees and audit.
- **Build to the rule as written and FDX,** with duration, fees and compliance dates as configuration until the rewrite lands.
- **On the bank side, the interface is a measured product:** registration, consented grants, revocation, and a published monthly rate computed from the log.

## References

**Law and regulation**

- [12 U.S.C. 5533: Consumer rights to access information](https://www.law.cornell.edu/uscode/text/12/5533), the statutory right, its exceptions and standardized formats
- [Federal Register: Required Rulemaking on Personal Financial Data Rights (89 FR 90838, November 18, 2024)](https://www.federalregister.gov/documents/2024/11/18/2024-25079/required-rulemaking-on-personal-financial-data-rights), effective January 17, 2025, docket CFPB-2023-0052, RIN 3170-AA78
- [eCFR: 12 CFR part 1033, subpart A](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-12?part=1033&subpart=A), covered products, data providers, the small institution exclusion and definitions
- [eCFR: 12 CFR 1033.121](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-12?part=1033&section=1033.121), the compliance tiers and dates
- [eCFR: 12 CFR 1033.211](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-12?part=1033&section=1033.211), covered data, 24 months of history and tokenized account numbers
- [eCFR: 12 CFR part 1033, subpart C](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-12?part=1033&subpart=C), the developer interface, the 99.5% floor, credentials, denials, authorization handling, fees, the performance disclosure and record retention
- [eCFR: 12 CFR part 1033, subpart D](https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-12?part=1033&subpart=D), authorization disclosures, third-party obligations, the one-year limit, revocation and aggregators
- [Federal Register API: CFPB documents published from August 1, 2026](https://www.federalregister.gov/api/v1/documents.json?conditions[agencies][]=consumer-financial-protection-bureau&conditions[publication_date][gte]=2026-08-01&order=newest&per_page=40), checked October 30, 2026: notices only, no proposed rule
- [Federal Register: Personal Financial Data Rights Reconsideration (90 FR 40986, August 22, 2025)](https://www.federalregister.gov/documents/2025/08/22/2025-16139/personal-financial-data-rights-reconsideration), the advance notice, docket CFPB-2025-0037, comments closing October 21, 2025

**Courts**

- [ABA Banking Journal: Kentucky federal court enjoins CFPB from enforcing current 1033 final rule](https://bankingjournal.aba.com/2025/11/kentucky-federal-court-enjoins-cfpb-from-enforcing-current-1033-final-rule/), the October 29, 2025 injunction, the parties and the court's reasoning on compliance dates
- [Moore & Van Allen: CFPB enjoined from enforcing the Personal Financial Data Rights Rule](https://www.mvalaw.com/data-points/cfpb-enjoined-from-enforcing-personal-financial-data-rights-rule-1033), the order's wording and the case number

**Vendor documentation**

- [Plaid: Company](https://plaid.com/company/), its fintech and institution counts
- [Plaid: OAuth guide](https://plaid.com/docs/link/oauth/), OAuth requirements, consent lifetimes by institution and region, warning webhooks, revocation timing and iframe conversion
- [Plaid: Auth](https://plaid.com/docs/auth/), tokenized account numbers, the banks that issue them, rails, R04 after revocation and `persistent_account_id`
- [Plaid: Transactions](https://plaid.com/docs/transactions/), the sync cursor, 730 days of history and refresh frequency
- [Plaid: Check](https://plaid.com/docs/check/), the consumer reporting agency subsidiary, Base Report, Income Insights and LendScore
- [MX: Account aggregation](https://docs.mx.com/products/connectivity/account-aggregation/index.md), 90 days of data, categories and aggregation scheduling
- [Mastercard: Open Finance US documentation](https://developer.mastercard.com/open-finance-us/documentation/), Finicity's products
- [Akoya: About](https://akoya.com/about), its founding, institution count and the credential-free model
- [Akoya: Tokenized account numbers](https://docs.akoya.com/docs/tokenized-account-numbers-tan), format, routing numbers, vault resolution, Secure Token Exchange, Nacha pairing and revocation
- [FDX: Financial Data Exchange](https://financialdataexchange.org/), membership, API v6.4 and its standard-setter status
- [FDX: 114 million reasons to keep moving forward](https://financialdataexchange.org/fdx-feed/114-million-reasons-to-keep-moving-forward-on-industry-led-standard-for-secure-data-sharing/), the spring 2025 connection count

**In practice**

- [Consumer Finance Monitor: CFPB sends new Section 1033 proposal to OIRA (August 6, 2026)](https://www.consumerfinancemonitor.com/2026/08/06/cfpb-sends-new-section-1033-open-banking-proposal-to-oira-for-review/), the submission and the issues it reconsiders
- [Bloom Credit: Where Section 1033 actually stands (October 2026)](https://bloomcredit.io/blog/where-section-1033-actually-stands-a-plain-language-guide-for-financial-institutions/), the Sixth Circuit abeyance, OIRA status and the New York fee bills
- [Payments Dive: Open banking fees fuel debate](https://www.paymentsdive.com/news/open-banking-fees-fintechs-fuel-debate-cfpb-apps/808114), JPMorgan's per-call fees, its request volume and app count, and PNC's letter
- [Open Banking Expo: JPMorganChase and Plaid extend data access agreement](https://www.openbankingexpo.com/news/jpmorganchase-and-plaid-extend-data-access-agreement/), the September 16, 2025 renewal with pricing
