+++
title = "Digital & Mobile Banking"
description = "The digital banking layer over the core: Q2, Alkami and peers, enrollment, FFIEC authentication, alerts, bill pay, Zelle and accessibility, as of October 2026."
category = "Banking & Lending Industry"
order = 2471
part = "Running the Platform"
tags = ["banking", "digital-banking", "mobile", "authentication", "bill-pay", "zelle", "accessibility"]
+++

For most customers the app is the bank. They open accounts in it, check balances in it a dozen times a week, move money, pay bills, send Zelle payments, deposit checks, dispute charges and read their statements in it, and they never see the core that holds the account. At a neobank the app and the ledger are one company's software. At most of the country's banks and credit unions the app is a separate product bought from a digital banking vendor, sitting on top of a core bought from another, joined by integrations that decide what the customer sees and how quickly it changes. The digital layer adds its own records (who enrolled and how they proved it, which factors they hold, which alerts they asked for, which payees they added) and its own regulators' expectations, chiefly the FFIEC's on authentication.

This chapter covers the digital banking vendors, what the layer does and doesn't own, enrollment, authentication as the FFIEC expects it, alerts and the balance they show, bill pay, Zelle integration and accessibility. Account takeover and scams on these channels are [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams); opening the account itself is [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening); third parties reading the account are [Open Banking in the US](/books/banking-and-lending/open-banking). The general engineering is the playbook's [Authentication](/docs/security/authentication), [Notifications](/docs/architecture/notifications) and [Accessibility](/docs/frontend/accessibility). The chapter extends `parties`, `accounts` and `disclosures`, and adds `digital_enrollments`, `authenticators`, `step_up_rules`, `alert_subscriptions`, `alert_deliveries`, `bill_payees` and `bill_payments`.

## How the Platforms Do It

As of October 2026, from filings and company pages:

| Vendor | Platform | Scale (as filed or published) | Commercial shape |
| --- | --- | --- | --- |
| **Alkami** | Alkami Digital Banking Platform; onboarding and account opening from MANTL, acquired March 2025 | 301 financial institutions on the platform and 22.4 million live registered users at December 31, 2025; 2025 revenue $443.6 million | "Predominantly" per-registered-user pricing above contractual minimums; average contract life about 70 months; "more than 300 real-time integrations" with cores and fintechs |
| **Candescent** | Digital banking from Digital Insight, D3 Banking Technology and Terafina, sold by NCR Voyix to Veritas Capital for $2.45 billion in cash (closed September 30, 2024) | More than 1,300 financial institutions and 30 million customers and members (company page) | Private company |
| **Fiserv** | Experience Digital (XD), "a cloud-based platform"; CheckFree RXP for bill payment and presentment; a "turnkey implementation" of Zelle | Not broken out | One line within Fiserv's Financial segment, sold with its cores |
| **Jack Henry** | Banno Digital Platform, "cloud-native," anchoring Jack Henry Digital | Not broken out; about 1,670 core clients | Sold to Jack Henry core clients and to institutions on other cores |
| **Q2** | Digital Banking Platform for retail, small business and commercial; Innovation Studio for APIs and an SDK; Helix for core processing and BaaS | 457 installed digital banking platform customers and about 27.3 million registered account holders at December 31, 2025; more than 1,200 financial institution customers overall; 2025 revenue $794.8 million | Initial terms average over five years; revenue grows with solutions and registered users |

Three things the table says about the market:

- **Digital banking is bought separately from the core.** Q2's filing says its platform "integrates deeply with our customers' core systems" and works "without requiring customers to replace their existing core banking systems"; Alkami lists hundreds of integrations. A bank on one vendor's core often runs another vendor's app, and switching apps is a smaller project than switching cores.
- **Priced by the user, contracted for years.** Per-registered-user pricing and five- to six-year terms mean the vendor's revenue rises with adoption, and the bank's exit is a migration of every customer's enrollment, payees and alerts.
- **The core vendors sell digital too.** Fiserv and Jack Henry bundle their own digital platforms, bill pay and Zelle connections with their cores, which is the alternative an independent vendor competes against ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-the-platforms-do-it)).

## What the Digital Layer Owns

A digital banking platform is a channel, not a system of record. The core (or the program's ledger) owns accounts, balances, transactions and holds; the digital layer owns the customer's digital identity and preferences, and it calls the core for everything else:

| Digital layer owns | Core owns | Where they meet |
| --- | --- | --- |
| Enrollment, credentials, devices, sessions | Parties, accounts, account parties | Linking a login to the accounts its user may see and act on |
| Alert subscriptions and delivery | Transactions, holds, balances | Events or polling that trigger alerts |
| Bill pay payees and schedules (often a third vendor's) | The debit and its journal entry | A posting request with a key |
| Transfer and Zelle requests | The ledger and available balance | A posting request, checked against the position |
| E-statement consent and document delivery | Statements as issued | A document reference |

The integration is where most customer-visible bugs live:

- **Cached balances go stale.** A digital platform that caches balances to spare a batch core shows yesterday's number after today's payroll. My rule is to read the available balance from the core or the real-time position for anything the customer will act on, and to label anything older with its as-of time ([Balances: Derived, Then Held](/books/banking-and-lending/banking-architecture#balances-derived-then-held)).
- **The balance shown is regulated.** Regulation DD says a balance disclosed through an automated system such as a website "may not include additional amounts that the institution may provide to cover an item"; a second balance including overdraft coverage is allowed only if it says so prominently, and the commentary says a label like "available balance" isn't enough ([Disclosure and the Balance Shown](/books/banking-and-lending/overdraft-and-fees#disclosure-and-the-balance-shown)).
- **Writes go through the core's rules.** A transfer from the app is a posting request with an idempotency key, accepted or rejected by the posting engine; the app never decides on its own that money moved ([Idempotency at Every Rail](/books/banking-and-lending/banking-architecture#idempotency-at-every-rail)).
- **Core hours leak into the app.** A batch core's end of day, maintenance windows and conversion weekends are the app's outages unless the platform queues requests and says so ([Conversion Weekends](/books/banking-and-lending/core-modernization#conversion-weekends)).

## Enrollment

Opening an account and enrolling in online banking are separate events at most institutions. A customer who opened an account at a branch years ago enrolls by proving they are that customer; one who opens an account in the app is enrolled as part of opening. Either way, the enrollment links a digital identity to a party and, through `account_parties`, to the accounts and roles it may act on.

What a sound enrollment does:

- **Proves the person is the party, not just that they know the account number.** Account number plus SSN plus date of birth is knowledge an attacker with a data breach has. The FFIEC's authentication guidance says "reliable verification methods generally do not depend solely on knowledge-based questions to verify identity"; pair what the person knows with something they possess that the bank already had on file (a one-time code to the phone or email of record, a card's chip or PIN, a mailed code), or with document and selfie verification ([Verifying Identity in Software](/books/banking-and-lending/kyc-and-account-opening#verifying-identity-in-software)).
- **Takes role from the account, not from the login.** A joint owner, an authorized signer on a business account and a power of attorney see different things and may do different things; the enrollment's entitlements come from the `account_parties` roles in force, so removing a signer removes their access ([Users, Roles and Approvals](/books/banking-and-lending/business-accounts#users-roles-and-approvals) covers business users).
- **Captures E-SIGN consent before electronic disclosures.** A consumer must have "affirmatively consented," after a clear statement of the right to paper, how to withdraw and the hardware and software required, and must consent "in a manner that reasonably demonstrates that the consumer can access information in the electronic form that will be used." A material change to those requirements needs a new statement and a fee-free right to withdraw. E-statements and electronic Reg E, Reg DD and privacy notices all rest on that consent, which is a `disclosures` row with its own version ([Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first)).
- **Notifies the old contact points.** An enrollment, a new device or a changed phone number sends a notice to the contact points already on file, which is how a customer learns someone else enrolled in their name ([Account Takeover](/books/banking-and-lending/account-takeover-and-scams#account-takeover)).

## Authentication and the FFIEC Guidance

The supervisory baseline is the FFIEC's **Authentication and Access to Financial Institution Services and Systems** (August 11, 2021), issued by the OCC as Bulletin 2021-36, which replaced the 2005 internet banking guidance and its 2011 supplement. [Account Takeover](/books/banking-and-lending/account-takeover-and-scams#account-takeover) covers it as a defense; the digital platform's side is how it becomes policy:

- **Scope is everyone.** The guidance addresses "business and consumer customers, employees, and third parties that access digital banking services," and system-to-system connections, so the bank's own staff consoles and the vendor's support access are in scope with the customer app.
- **Risk assessment decides the factor.** "When a risk assessment indicates that single-factor authentication with layered security is inadequate, multi-factor authentication (MFA) or controls of equivalent strength, combined with other layered security controls, can more effectively mitigate risks." Single-factor with layered security "has shown to be inadequate for customers engaged in high-risk transactions and for high-risk users."
- **High risk is defined by the transaction.** The factors are "the dollar amount and volume of transactions, the sensitivity and amount of information accessed, the irrevocability of the transaction, and the likelihood and impact of fraud," and the guidance names digital payment services with "shorter processing windows" and push payments. A Zelle send, an outgoing wire, a new external account and an RTP or FedNow credit are irrevocable; a balance inquiry is not.
- **Some factors are weaker than others.** The guidance warns that "certain MFA factors may be susceptible to MIM attacks, such as when a hacker intercepts a one-time security code sent to a customer." New York's DFS went further in an October 16, 2024 industry letter on AI-enabled attacks, advising regulated entities to avoid authentication by SMS, voice or video because deepfakes can impersonate them, in favor of digital certificates and physical security keys ([Security, Resilience & Incident Notice](/books/banking-and-lending/security-and-resilience) covers the letter).
- **Layered security is a list, not a slogan:** the guidance names "MFA, user time-out, system hardening, network segmentation, monitoring processes, and transaction amount limits," and it endorses no specific framework.

In software that becomes three things:

- **Factors by strength.** Passkeys and device-bound keys first, an authenticator app or push to an enrolled device next, SMS and voice codes as a fallback the bank is trying to retire, knowledge questions never alone ([Passkeys First](/docs/security/authentication#passkeys-first)). Each factor a customer holds is a row with its kind, its device and when it was enrolled.
- **Step-up as data.** Which actions need which assurance (a new payee, a first Zelle send to a new recipient, a wire, a limit increase, a phone or email change, an alert being turned off) is a table the platform reads, versioned and approved like any other rule, so the security team changes a threshold without a release ([Step-Up for Sensitive Actions](/docs/security/authentication#step-up-for-sensitive-actions); [Rules as Data](/docs/architecture/rules-as-data)).
- **Every authentication is an event.** Logins, failures, factor changes and step-ups are written to `account_security_events` with the factors used, so a Reg E unauthorized-transfer claim can be answered with what the session actually proved ([Unauthorized or Authorized](/books/banking-and-lending/account-takeover-and-scams#unauthorized-or-authorized)).

## Alerts

Alerts are the cheapest fraud control a bank has and the most used feature of its app after the balance. They come in three kinds, and each has a different consent and delivery rule:

| Kind | Examples | Can the customer turn it off? | Channel |
| --- | --- | --- | --- |
| **Security** | New device or login, password, phone or email changed, payee added, alerts changed | No, or only with step-up | Push and email, and SMS to the old number for contact changes |
| **Transaction** | Card purchase over an amount, deposit received, low balance, overdraft, payment due | Yes; the customer sets them | Push, SMS or email, as chosen |
| **Service** | Statement ready, CD maturing, rate change, change-in-terms notice | Some are required notices, not alerts | Email or in-app, under E-SIGN consent |

Rules that hold across them:

- **Required notices aren't alerts.** A change-in-terms notice, a CD maturity notice or an adverse action notice is a disclosure with a deadline, delivered under E-SIGN consent and recorded in `disclosures`; an app notification can point to it but doesn't replace it ([Change in Terms](/books/banking-and-lending/deposit-accounts#change-in-terms)).
- **Texts need the right consent.** Account alerts by SMS rest on the customer's consent to texts at that number; the TCPA, carrier registration and reassigned-number rules apply to a bank like anyone else ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent)).
- **Alerts read the same balance the app shows.** A low-balance alert computed from a different balance than the screen is a complaint waiting to happen.
- **Re-check at send time.** An alert queued for "deposit received" that fires after the deposit was returned misleads; the sender re-reads the state before delivering ([Event-Triggered, Re-Checked at Send Time](/docs/architecture/notifications#event-triggered-re-checked-at-send-time)).
- **Turning off security alerts is itself an alert.** It's step 3 of a takeover, and the platform treats it that way.

## Bill Pay

Online bill pay is the oldest digital banking payment and still runs largely on vendor platforms (Fiserv's CheckFree RXP among them). The customer adds a payee, schedules a payment, and the service pays electronically where the payee accepts it and by check where it doesn't. Bank help pages describe the same split: Regions sends payments "either electronically or by check," debiting electronic payments on the date chosen and check payments "before, on or after the estimated delivery date"; Ally sends "electronically whenever possible" and otherwise mails a check, with a laser draft check debited "whenever the payee cashes the check."

Those two debit timings are the two funding models:

- **Debit on send (good funds).** The service debits the customer when it initiates the payment, then pays the biller from its own funds electronically or by a check drawn on the service's account. The service carries no credit risk; the customer loses use of the money a few days earlier.
- **Debit on presentment (draft).** The service mails a check drawn on the customer's own account, and the money leaves when the payee deposits it. No float risk for the service, but a payment can bounce, and the customer can't know when it will clear.

What the system records and why:

- **It's an electronic fund transfer unless the terms say otherwise.** Reg E's commentary treats a payment under a bill-payment service as an EFT "unless the terms of the bill-payment service explicitly state that all payments, or all payments to a particular payee or payees, will be solely by check, draft, or similar paper instrument drawn on the consumer's account," with those payees identified. So the error resolution clocks apply to electronic bill payments, and the method per payee is a fact the system stores ([Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#what-counts-as-an-error)).
- **Delivery dates are promises.** The app shows a deliver-by date computed from the payee's method and the business calendar; services commonly back it with late-fee help when the payment was scheduled by the due date with funds available (Ally offers this), so the computed date and the funds check at send are both kept.
- **Statements show it.** A bill payment debit appears on the periodic statement like any EFT, and Reg E requires a statement "for each monthly cycle in which an EFT occurs."
- **Payee changes are a takeover signal.** A new payee, a changed payee account or a first payment to a new payee is a step-up and a security alert.

## Zelle Integration

Zelle is a bank-owned P2P network run by Early Warning Services. Its 2025 figures: "more than $1.2 trillion" sent, about 4.2 billion transactions, and "more than 2,300 financial institutions" in the network; 2024's were "over $1 trillion," 3.6 billion transactions and "more than 2,200." The network has lived inside banks' own apps since the standalone Zelle app stopped enrolling and transacting; Zelle said in October 2024 that users had until March 2025 to re-enroll through a bank and that the app carried "~2%" of transactions.

How a bank or credit union joins:

- **Directly or through a processor.** An institution either connects to the network itself or gets Zelle from its core or digital vendor, as with Fiserv's "turnkey implementation of Zelle." Either way the institution owns the customer, the debit, the fraud decision and the Reg E duties.
- **Enrollment is a token.** A customer's email or US mobile number is registered to their account in the network's directory; a recipient's token resolves to an account at their bank. Directory changes (a token moved to a new account or bank) are high-risk events, logged and alerted like a phone change.
- **Payments are push credits, fast and final.** A send between enrolled users is a credit push the sender can't recall, which is exactly the "irrevocability" the FFIEC guidance tells the bank to weigh. The send debits through the posting engine with a key; the receiving bank credits its customer and can't simply be asked to return it.
- **Fraud and scam controls live here.** Limits per customer and per new recipient, cool-downs after security changes, warnings and payment interventions before a first send to a new recipient, and the receiving bank's mule detection are [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams#interventions-before-the-money-moves), which also covers the CFPB's 2024 suit against Early Warning and three banks and its dismissal ([P2P Scams and the Zelle Suits](/books/banking-and-lending/account-takeover-and-scams#p2p-scams-and-the-zelle-suits)).

## Accessibility

A bank's website and app are where most customers do business with it, and inaccessible ones exclude customers with disabilities from their own money. The obligations differ by jurisdiction, and in the US they are less specific than engineers expect:

- **United States.** The Department of Justice's March 18, 2022 guidance on web accessibility under the ADA says businesses open to the public must make their websites accessible to people with disabilities, points to WCAG as helpful technical standards rather than a mandate, and lists Title III settlements (H&R Block's online tax service among them). As of October 2026 the page carries no rescission notice, but it says it "may be rescinded or modified," and there is no federal web accessibility regulation for private businesses; obligations come from the statute, settlements and private suits.
- **European Union.** The European Accessibility Act applies to consumer banking services from June 28, 2025: the EU's accessibility centre said that from that date "banks, public transport and other products and services must be accessible," including "the online operations associated with the management of financial services."
- **My baseline is WCAG 2.2 AA everywhere,** tested with assistive technology, because the settlements and the EU's standards build on the WCAG family and the playbook sets 2.2 AA as the floor ([The Baseline: WCAG 2.2 AA](/docs/frontend/accessibility#the-baseline-wcag-2-2-aa)).

Banking adds specific places accessibility fails: one-time codes that expire before a screen reader user can enter them, CAPTCHAs on login, step-up challenges that need a camera or color vision, statements and disclosures delivered as image-only PDFs, check deposit capture with no guidance for low-vision users, and session time-outs (a layered security control in the FFIEC's list) with no warning or extension. Each is a case where a security or compliance control needs an accessible alternative of equal strength, not an exemption.

## How to Build It

The chapter's records sit beside the core model: the digital identity and its factors, the step-up rules, alerts and bill pay. `account_security_events` from [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams#how-to-build-it) records every authentication and change; `disclosures` records E-SIGN consent and every electronic notice.

```sql
CREATE TABLE digital_enrollments (         -- a login linked to a party, and how it was proven
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  program_id          UUID REFERENCES programs (id),
  username_ref        TEXT NOT NULL,         -- the identity provider's subject, never a password
  proofing_methods    TEXT[] NOT NULL,       -- 'otp_to_phone_on_file', 'card_pin', 'document_selfie', ...
  esign_disclosure_id UUID REFERENCES disclosures (id),  -- the consent electronic notices rely on
  enrolled_via        TEXT NOT NULL CHECK (enrolled_via IN ('account_opening', 'self_enroll',
                        'branch', 'call_center', 'conversion')),
  enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status              TEXT NOT NULL CHECK (status IN ('active', 'locked', 'suspended', 'closed')),
  UNIQUE (institution_id, username_ref)
);

CREATE TABLE authenticators (              -- each factor a customer holds
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  enrollment_id       UUID NOT NULL REFERENCES digital_enrollments (id),
  kind                TEXT NOT NULL CHECK (kind IN ('passkey', 'security_key', 'app_push',
                        'totp', 'sms_otp', 'voice_otp', 'password')),
  strength            TEXT NOT NULL CHECK (strength IN ('phishing_resistant', 'possession',
                        'interceptable', 'knowledge')),
  device_ref          TEXT,                  -- the enrolled device, for push and passkeys
  party_identity_id   UUID REFERENCES party_identities (id),  -- the phone for SMS and voice
  enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at        TIMESTAMPTZ,
  revoked_at          TIMESTAMPTZ
);

CREATE TABLE step_up_rules (               -- which actions need which assurance, as data
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  program_id          UUID REFERENCES programs (id),
  action              TEXT NOT NULL,         -- 'payee_add', 'p2p_first_send', 'wire_out', 'phone_change',
                                             -- 'limit_increase', 'alerts_disable', 'login_new_device'
  min_amount          BIGINT,                -- applies at or above, minor units; null: any amount
  required_strength   TEXT NOT NULL,         -- the weakest factor strength that satisfies it
  cooldown_hours      INT,                   -- after a security change, before this action is allowed
  version             INT NOT NULL,
  approved_by         TEXT NOT NULL,
  valid_during        TSTZRANGE NOT NULL
);

CREATE TABLE alert_subscriptions (         -- what the customer asked to hear about
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  enrollment_id       UUID NOT NULL REFERENCES digital_enrollments (id),
  account_id          UUID REFERENCES accounts (id),   -- null: alerts about the login itself
  kind                TEXT NOT NULL,         -- 'card_purchase_over', 'low_balance', 'deposit', 'security'
  threshold           BIGINT,
  channels            TEXT[] NOT NULL,       -- 'push', 'sms', 'email'
  mandatory           BOOLEAN NOT NULL DEFAULT FALSE,  -- security alerts can't be removed
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at            TIMESTAMPTZ
);

CREATE TABLE alert_deliveries (            -- each alert sent, with the state it was based on
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id     UUID NOT NULL REFERENCES alert_subscriptions (id),
  trigger_event_id    UUID NOT NULL,         -- the outbox event that caused it; unique per channel
  channel             TEXT NOT NULL,
  balance_shown       BIGINT,                -- the balance in the message, as read at send time
  rechecked_at        TIMESTAMPTZ NOT NULL,  -- state re-read before sending
  provider_ref        TEXT,
  status              TEXT NOT NULL CHECK (status IN ('sent', 'suppressed', 'failed', 'delivered')),
  sent_at             TIMESTAMPTZ,
  UNIQUE (subscription_id, trigger_event_id, channel)
);

CREATE TABLE bill_payees (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  enrollment_id       UUID NOT NULL REFERENCES digital_enrollments (id),
  name                TEXT NOT NULL,
  payee_account_token TEXT,                  -- the customer's account number at the biller, vaulted
  method              TEXT NOT NULL CHECK (method IN ('electronic', 'service_check', 'draft_check')),
  lead_days           INT NOT NULL,          -- business days from send to delivery for this method
  added_auth_event_id UUID REFERENCES account_security_events (id),  -- the step-up that added it
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE TABLE bill_payments (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  payee_id            UUID NOT NULL REFERENCES bill_payees (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),   -- the funding account
  amount              BIGINT NOT NULL CHECK (amount > 0),
  send_on             DATE NOT NULL,         -- a business date
  deliver_by          DATE NOT NULL,         -- computed from method, lead days and the calendar
  funding_model       TEXT NOT NULL CHECK (funding_model IN ('debit_on_send', 'debit_on_presentment')),
  idempotency_key     TEXT NOT NULL UNIQUE,
  transaction_id      UUID REFERENCES transactions (id),  -- the debit, when posted
  is_eft              BOOLEAN NOT NULL,      -- false only when terms say check-only for this payee
  status              TEXT NOT NULL CHECK (status IN ('scheduled', 'sent', 'delivered', 'returned',
                        'cancelled', 'failed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The step-up decision for an action, with the cooldown after the most recent security change:

```sql
SELECT r.required_strength,
       r.cooldown_hours,
       (SELECT MAX(e.occurred_at)
        FROM account_security_events e
        WHERE e.party_id = :party_id
          AND e.kind IN ('phone_changed', 'email_changed', 'device_enrolled',
                         'password_reset', 'mfa_changed'))         AS last_security_change
FROM step_up_rules r
WHERE r.institution_id = :institution_id
  AND (r.program_id = :program_id OR r.program_id IS NULL)
  AND r.action = :action
  AND (r.min_amount IS NULL OR :amount >= r.min_amount)
  AND r.valid_during @> NOW()
ORDER BY r.program_id NULLS LAST, r.min_amount DESC NULLS LAST
LIMIT 1;
```

Design notes:

- **Entitlements are computed from roles.** What an enrollment may see and do is a query over `account_parties` in force, never a copy stored on the login, so a removed signer loses access the moment the role ends.
- **The authenticator's strength is stored, not inferred.** A policy that requires "phishing_resistant" for a wire can be enforced and audited, and the bank can count how many customers still rely on SMS.
- **Alerts are idempotent by trigger.** The unique key on `alert_deliveries` means a redelivered event sends nothing twice; `balance_shown` and `rechecked_at` answer "why did the alert say that."
- **Bill pay stores the EFT decision per payment.** Whether Reg E applies is decided by the payee's method under the service terms, and the answer is kept with the payment, not recomputed when a claim arrives.
- **Emit events:** `enrollment.created`, `authenticator.added`, `authenticator.revoked`, `step_up.required`, `alert.sent`, `bill_payee.added`, `bill_payment.sent`.

## Auditing

- **How each customer enrolled.** The proofing methods, the E-SIGN consent and its version, and every later factor change, so an enrollment in someone else's name can be traced.
- **What each session proved.** The factors used for each login and step-up, beside the transfer or change it authorized, which is the evidence for an unauthorized-transfer claim ([Unauthorized or Authorized](/books/banking-and-lending/account-takeover-and-scams#unauthorized-or-authorized)).
- **Which rules were in force.** Every step-up rule version with its approver and dates, so "was a first Zelle send of $2,000 stepped up on May 3" is answerable.
- **What the customer was told.** Every alert sent, with the balance it showed and when it was checked, and every electronic notice as a `disclosures` row.
- **Every bill payment's path.** Method, funding model, send and delivery dates, the debit and any return.

## What This Means for the System You Build

- **Keep the digital layer a channel:** it owns identity, preferences and requests, and the core or ledger owns money and balances.
- **Read the balance the customer acts on from the source,** label any cached figure with its time, and exclude overdraft coverage from the balance shown as Reg DD requires.
- **Prove enrollment with possession, not knowledge,** take entitlements from account roles, and capture E-SIGN consent before any electronic notice.
- **Rank factors by strength,** put passkeys first, treat SMS as interceptable, and keep step-up rules as versioned data.
- **Separate security alerts, transaction alerts and required notices,** and re-check state before every alert.
- **Store each bill payment's method, funding model and EFT status,** and compute delivery dates from the calendar.
- **Treat Zelle sends and token changes as irrevocable, high-risk events,** with limits, cool-downs and interventions.
- **Build to WCAG 2.2 AA** and give every security control an accessible alternative of equal strength.

## References

**Law and regulation**

- [15 U.S.C. 7001 (E-SIGN)](https://www.law.cornell.edu/uscode/text/15/7001), consumer consent, the required statements and the reasonable-demonstration requirement
- [12 CFR 1030.11 (Regulation DD)](https://www.consumerfinance.gov/rules-policy/regulations/1030/11/), balances disclosed through automated systems may not include overdraft coverage
- [Official interpretation of 12 CFR 1005.3 (Regulation E)](https://www.consumerfinance.gov/rules-policy/regulations/1005/interp-3/), bill-payment services as electronic fund transfers unless check-only by their terms
- [Official interpretation of 12 CFR 1005.9 (Regulation E)](https://www.consumerfinance.gov/rules-policy/regulations/1005/interp-9/), periodic statements for each monthly cycle with an EFT

**Regulators and guidance**

- [OCC Bulletin 2021-36: Authentication and Access to Financial Institution Services and Systems](https://www.occ.gov/news-issuances/bulletins/2021/bulletin-2021-36.html), the FFIEC guidance of August 11, 2021 and the rescinded 2005 and 2011 issuances
- [FFIEC: Authentication and Access to Financial Institution Services and Systems (full text)](https://www.occ.gov/news-issuances/bulletins/2021/bulletin-2021-36a.pdf), scope, risk assessment, MFA, high-risk transactions and users, interception of one-time codes, knowledge-based questions and layered security
- [NYDFS: Cybersecurity Risks Arising from Artificial Intelligence (October 16, 2024)](https://www.dfs.ny.gov/industry-guidance/industry-letters/il20241016-cyber-risks-ai-and-strategies-combat-related-risks), avoiding SMS, voice and video authentication, digital certificates and security keys
- [U.S. Department of Justice: Guidance on Web Accessibility and the ADA (March 18, 2022)](https://www.ada.gov/resources/web-guidance/), WCAG as helpful standards, Title III examples and the page's status
- [AccessibleEU: A new era of inclusion begins as the EAA enters into force (June 27, 2025)](https://accessible-eu-centre.ec.europa.eu/content-corner/news/new-era-inclusion-begins-eaa-enters-force-2025-06-27_en), banking services and online financial operations accessible from June 28, 2025

**Filings**

- [Q2 Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1410384/000141038426000006/qtwo-20251231.htm), installed digital banking customers, registered account holders, revenue, products, core integration and contract terms
- [Alkami Technology: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1529274/000152927426000009/alk-20251231.htm), institutions on the platform, live registered users, revenue, pricing, contract life, MANTL and integrations
- [Fiserv: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/798354/000079835426000009/fi-20251231.htm), Experience Digital, CheckFree RXP and the turnkey Zelle implementation
- [Jack Henry & Associates: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/779152/000077915225000055/jkhy-20250630.htm), the Banno Digital Platform and core client counts
- [NCR Voyix: Completion of the sale of its digital banking business (Exhibit 99.1, September 30, 2024)](https://www.sec.gov/Archives/edgar/data/70866/000119312524229015/d835311dex991.htm), the $2.45 billion sale to Veritas Capital and the Candescent name

**Vendor documentation**

- [Candescent: About](https://www.candescent.com/about), the businesses combined and the institutions and users served
- [Zelle: 2025 results (February 11, 2026)](https://www.zelle.com/press-releases/zelle-posts-20-growth-12-trillion-sent-far-outpacing-consumer-spending-and-cementing), dollars and transactions sent and participating institutions
- [Zelle: 2024 results (February 12, 2025)](https://www.zelle.com/press-releases/zelle-shatters-records-1-trillion-sent-single-year), dollars, transactions and institutions in 2024
- [Zelle: We're evolving how consumers send money (October 31, 2024)](https://www.zelle.com/blog/were-evolving-how-consumers-send-money-zelle), phasing out the standalone app and its share of transactions

**In practice**

- [Regions: How are my payments sent to billers?](https://www.regions.com/help/online-banking-help/make-payments/paying-bills-online/how-are-my-payments-sent-to-billers), electronic and check payments and when each is debited
- [Ally: Bill Pay help](https://www.ally.com/help/bank/bill-pay/), electronic first, check otherwise, laser draft checks debited when cashed, and late-fee help
