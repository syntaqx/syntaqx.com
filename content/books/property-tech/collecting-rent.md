+++
title = "Collecting Rent"
description = "Rent by every channel, convenience fees under landlord law, blocking payments after a filing, partial and split rent, and who holds the money in transit."
category = "Property Tech Industry"
order = 1715
part = "Rent and Resident Money"
tags = ["property-tech", "rent-payments", "ach", "money-transmission", "flexible-rent", "payments"]
+++

Rent is the largest recurring payment most households make, and it's collected for someone else. The resident pays a lease's landlord of record, usually an LLC that owns one property, through a manager that runs it, on a platform the manager licenses, over rails a processor operates. Each of those parties may touch the money, and the law cares which one holds it on the way. Rent also comes with rules no other bill has: some states forbid a landlord to charge a fee for paying by check or to refuse every non-cash method, a partial payment accepted at the wrong moment can waive an eviction, and a judgment for possession can be undone by a full payment the landlord is required to accept. This chapter covers the property side of money in: the channels residents pay through, convenience fees, payment blocking and partial payments, split and flexible rent, and who holds rent in transit. The rails themselves (ACH, cards, checks, cash networks) are the [Payments](/books/payments/card-payments) volume's; this chapter links to them and writes only what rent changes.

## How the Platforms Do It

Every suite sells resident payments, and for most of them it's a large share of revenue. AppFolio's 10-K for 2025 counts electronic payments among the Value Added Services that were most of its revenue; Entrata's S-1 says "all subscribers of our Operating System are required to use our payment solution", with a monthly subscription fee for it plus payment processing revenue ([The Property Business](/books/property-tech/property-business#the-software-s-money)). The channels have converged:

- **Entrata** lists card, eCheck, cash at over 35,000 MoneyGram locations, money orders, check scanning, Apple Pay and Pay-by-Text, with recurring payments in its app; payments post to the ledger instantly and funds "settle within 72 hours".
- **RealPage** lists ACH and card (with automatic payments), cash at retail locations posting to the ledger automatically, a lockbox where mailed checks and money orders are scanned at a remote facility, check scanning one at a time or in batches of up to 50, and flexible rent through Livble. It claims 2,500+ management companies and 6 million+ units on its payments product.
- **Yardi Breeze** lists debit card, credit card and ACH, cash at participating retailers through PayNearMe, and CHECKscan for batch scanning of personal, corporate, bill pay and cashier's checks and money orders with next-day transfers.

Behind the channels, the platforms are payment providers. Entrata's S-1 says it holds money transmitter licenses "in several jurisdictions", keeps an MSB registration with FinCEN, uses Worldpay as its only card processor in the US and Canada under an agreement expiring in December 2026 that renews automatically for three-year periods, has its bill pay sponsored by one regional bank, and is "subject to a consent order with the state of Oregon ordering the payment of civil penalties". RealPage's 10-K for 2020 says it held money transmitter licenses in several states, the District of Columbia and Puerto Rico, subject to restrictions on investing customer funds, bonding and inspection, recorded renter payments in transit as restricted cash against a liability to clients, and bore the loss on returns and chargebacks it couldn't recover from clients; Thoma Bravo's acquisition of RealPage was conditioned on consents to the change of control of those licenses. Yardi's RentCafe terms take the other route: in the US, payments are submitted to Yardi "as a payment collection agent of the Payee", and receipt by Yardi "shall satisfy your payment obligation".

Those are the three ways to hold rent in transit, and [Who Holds the Money](#who-holds-the-money) compares them.

## Payment Channels

Each channel is a Payments volume rail with a property twist:

| Channel | Rail | What rent adds |
| --- | --- | --- |
| **Portal and app, one-time** | ACH debit or card ([ACH & Bank Transfers](/books/payments/ach), [Card Payments](/books/payments/card-payments)) | The payment is for a lease, not a customer: show the ledger balance, let roommates each pay, and apply by the lease's [application rule](/books/property-tech/charges-and-resident-ledgers#payment-application-order) |
| **Autopay** | Recurring ACH debits or stored-card payments | The amount changes when charges change, so the authorization covers "the balance due", with notice of varying amounts; it stops on move-out and on a block |
| **Text to pay** | A stored method charged by a reply | Texts are [TCPA-regulated](/docs/compliance/consumer-contact#tcpa-consent); a payment by keyword needs identity, a balance check and a confirmation |
| **Cash network** | Retail bill pay ([Cash Payments](/books/payments/cash-payments)) | The validation callback checks the lease's payment acceptance before the cashier takes the money |
| **Lockbox** | Mailed checks scanned at a bank or vendor facility ([Lockbox](/books/payments/checks#lockbox)) | Matching a check to a lease by remittance coupon, payer name or unit; unmatched items wait in suspense |
| **Office check scanning** | Remote deposit capture ([Remote Deposit Capture](/books/payments/checks#remote-deposit-capture)) | Batches scanned at the leasing office deposit to the property's own bank account, so the deposit account is per property or entity |
| **Third-party payers** | Any rail | Agencies, employers, charities and relatives pay rent; [Subsidized & Affordable Housing](/books/property-tech/affordable-housing#the-owner-side) covers subsidy payments, which land on the subsidy ledger party |

Two things decide whether the channels work. First, **every channel posts through one path**: a payment arrives, it's matched to a lease, the lease's acceptance is checked, it's applied, and `payment.applied` fires. A channel that posts on its own (a lockbox file imported by a script, cash posted by hand) is where duplicate postings and payments accepted against a block come from. Second, **post on confirmation, not settlement**. A cash payment is final when the network confirms it, and an ACH debit is posted when it's submitted and reversed if it returns; the resident's balance should drop when they pay, and the late fee engine should see the payment date, not the date the money reached the bank.

Landlord law also limits what a property may require. California requires a landlord to allow at least one method that is "neither cash nor electronic funds transfer", allows a cash-only demand only for up to three months after a dishonored check or a stop payment, with written notice and a copy of the dishonored instrument, and requires accepting rent from a third party who signs an acknowledgment that they're not a tenant and payment doesn't create a tenancy ([Who Still Pays by Paper](/books/payments/checks#who-still-pays-by-paper)). A property that goes "online payments only" can be breaking a statute in such a state. So the methods a property accepts, and the methods a given lease is restricted to, are data with a jurisdiction and an expiry.

## Convenience Fees

Rent platforms charge for convenience in three ways, and they're regulated by different layers:

- **Card network rules.** A card fee on rent is a convenience fee, a program fee under Visa's US Rent Payment Program (a flat fee of up to $10 on debit cards for registered merchants coded as real estate agents and managers, card-not-present only), or a surcharge on credit cards under the surcharge rules ([Convenience and Service Fees](/books/payments/surcharging-and-fees#convenience-and-service-fees)). The fee engine needs the merchant category code as an input.
- **General surcharge law.** Some states prohibit or limit surcharging and some require the total price ([What State Law Allows](/books/payments/surcharging-and-fees#what-state-law-allows)).
- **Landlord law.** California bars a landlord or its agent from charging "any fee" for paying rent or a security deposit by check. Fee transparency rules may treat a mandatory payment fee as part of the price: if the only practical way to pay carries a fee, it's a mandatory fee, which is the territory of the FTC's December 2025 Greystar order and state laws like Colorado's HB25-1090 ([The Charge Catalog](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog)).

The design follows from who charges the fee. A fee the **platform** collects for itself (the vendor's processing fee) is never on the resident ledger: it's a separate amount in the payment, disclosed before confirmation, and it belongs to the vendor. A fee the **landlord** charges is a charge on the ledger, governed by the lease and landlord law. Mixing them (a "convenience fee" posted to the ledger and remitted to the vendor) makes the landlord the one charging it, in the eyes of the law and the resident. My rule: keep a free method visible at every point a resident pays, and model each fee as who charges it, on which method, at what amount, under which rule, effective-dated ([Rules as Data](/docs/architecture/rules-as-data)).

## Payment Blocking

Some payments must be refused. The Payments volume already blocks payment methods after returns: an account that returned R01 is moved to certified funds, one that returned R10 is never debited again without a new authorization ([After a Return: Fees and Blocks](/books/payments/ach#after-a-return-fees-and-blocks)). Rent adds a second kind of block, on the **lease**, because accepting money can change the legal position.

- **After a nonpayment notice or eviction filing,** accepting rent can waive the landlord's right to proceed. Oregon states it outright: accepting partial rent after a nonpayment termination notice waives the termination unless the parties sign a written agreement that the acceptance "does not constitute waiver" (ORS 90.417). Many operators therefore stop accepting payments online once a case is filed, and route any payment through a person who can document the terms.
- **But some payments must be accepted.** Washington lets a tenant reinstate the tenancy by paying the rent, court costs, limited late fees and awarded attorneys' fees before or shortly after judgment, and requires a landlord to accept a pledge of emergency rental assistance covering the full rent owed before the pay-or-vacate notice expires (RCW 59.18.410). A block that refuses a reinstatement payment or an assistance pledge breaks the law the other way.

So a lease's payment acceptance isn't on or off. It's a state with a reason, set by the delinquency workflow and checked by every channel:

| Acceptance | Meaning | Typical reason |
| --- | --- | --- |
| `all` | Any method, any amount | Normal |
| `certified_funds_only` | Cashier's check, money order, or cash where allowed | Returned payment history, within the period the lease and law allow |
| `full_balance_only` | Only a payment that clears the balance (or the court's reinstatement amount) | Notice served or case filed, where partial acceptance risks waiver |
| `none` | No resident payments through self-service channels | Judgment for possession; legal hold pending counsel |

Each row is effective-dated, carries who set it and why, and is lifted explicitly. The portal says why a resident can't pay and how they can; the cash network's validation callback declines with a reason the cashier can read; a lockbox check against a blocked lease goes to an exception queue rather than the bank. [Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction#eviction-filings) decides when acceptance changes; this chapter enforces it. Assistance payments from an agency are not resident payments and follow their own rule, because refusing them can violate the program and the state.

## Partial Payments

Outside a legal process, partial payments are ordinary: a resident pays half on the 1st and half on the 15th, or pays what they can. The platform's choices are whether to accept them by default, how to apply them, and what they mean for late fees and notices.

- **Accept by default, unless the lease's acceptance says otherwise.** Refusing partial rent before any notice usually just makes the delinquency worse.
- **Apply by the rule,** rent first by default ([Payment Application Order](/books/property-tech/charges-and-resident-ledgers#payment-application-order)).
- **Late fees use the right base.** In states that charge a percentage of past-due rent, a partial payment lowers the fee; in states that use the full month's rent, it doesn't ([Late Fees](/books/property-tech/charges-and-resident-ledgers#late-fees)).
- **Notices state the right amount.** A pay-or-quit notice demands what's owed after every payment, and some jurisdictions void a notice that demands more than rent. The notice generator reads the ledger at service time ([Notices](/books/property-tech/delinquency-and-eviction#notices)).
- **Agreements are documents.** When a manager accepts partial payment on the promise of the rest by a date, the agreement is what preserves the landlord's rights in states like Oregon. It's a [payment plan](/books/property-tech/delinquency-and-eviction#payment-plans) with a signature, not a note in a comment field.

## Split and Flexible Rent

Two different products share the name.

**Split payments between roommates** are a portal feature: each leaseholder pays a share, each has their own autopay, and the ledger shows the lease's balance going down as each pays. The obligation is usually joint and several (each owes the whole), so splitting is a convenience, not a change to who owes what, unless the lease bills individually ([The Resident Ledger and the General Ledger](/books/property-tech/charges-and-resident-ledgers#the-resident-ledger-and-the-general-ledger)).

**Flexible rent** is credit. A third party pays the property the full rent on time and the resident repays in installments. The public terms show the shape:

- **Flex** sends the full bill to the landlord up front and the resident pays in two parts (the first when the bill is due, the second on a chosen date later in the month), for a membership of up to $5.99 a month, a 0.5% processing fee, a split fee of up to 3% of the amount split, and 2.5% if paying by card. The lines of credit and payment services come from FDIC-member banks (Lead Bank and Column N.A.); Flex says it doesn't charge late fees, and on-time payments are reported to the three bureaus if the resident opts in.
- **Livble** lets a resident pay in up to four installments, or link rent to payroll, for a finance charge of $30 to $60 depending on when rent is submitted; loans are originated by Lead Bank.

For the platform, flexible rent is an integration with three consequences. **The property is paid in full by a third party,** so the payment's payer is the provider, the lease is current, and the resident's debt is to the provider, not the landlord; a resident who defaults on the installment isn't delinquent on rent. **The landlord's ledger mustn't show the installments** as rent owed. **The offer is a consumer credit product shown in the landlord's portal,** with the provider's disclosures and the provider's fees, which makes its presentation a disclosure question for the operator, and any revenue share a [Disclosure and Revenue Share](/books/property-tech/resident-financial-products#disclosure-and-revenue-share) question. My rule: present it as a third party's product with its full cost shown before enrollment, never as the property's payment plan, and never as the only way to avoid a late fee.

## Who Holds the Money

Between the resident's bank and the owner's operating or trust account, rent sits somewhere for one to several days. Where it sits decides who needs a license, who bears returns, and what happens if the platform fails.

| Model | Where funds sit | Who's regulated | Example in public filings or terms |
| --- | --- | --- | --- |
| **Direct to the owner's account** | Settled by the processor straight to the property's bank account | The processor; the platform is a software provider | Office check scanning (RDC) deposits to the property's own account |
| **Platform as licensed transmitter** | The platform's custodial accounts, recorded as restricted cash owed to clients | The platform, state by state, with bonds, permissible-investment rules and exams | RealPage's 10-K for 2020; Entrata's S-1 (licenses "in several jurisdictions", FinCEN MSB registration, an Oregon consent order) |
| **Platform as the payee's collection agent** | The platform's accounts, with the resident's obligation extinguished on receipt | Relies on the agent-of-payee exemption where a state recognizes it | Yardi's RentCafe terms (US only) |
| **Funds in a for-benefit-of account at a sponsor bank** | An FBO account the bank controls, with the platform's ledger allocating it to owners | The bank, with the platform under its program | The common payfac structure ([FBO Accounts](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)) |

The licensing analysis is the Payments volume's ([Holding Other People's Money](/books/payments/becoming-a-payment-provider#holding-other-people-s-money), [Who's a Money Transmitter](/books/payments/cash-payments#who-s-a-money-transmitter)). What rent adds:

- **The payee is the landlord of record, not the manager.** A collection-agent arrangement only works if the agent is the landlord's agent under a written agreement, the landlord holds the agent out as accepting rent, and the resident's obligation ends when the agent receives the money. The management agreement and the platform agreement both have to say so, per owning entity.
- **Rent may be trust money.** In many states a manager's collections for owners must sit in trust accounts, and security deposits in separate accounts. The settlement destination for each property is therefore an account belonging to (or held in trust for) a specific owner, which Trust Accounting & the General Ledger owns. A platform that pools settlements across owners has to be able to say, for every dollar in transit, which owner it belongs to.
- **Returns come back to someone.** An ACH return weeks after settlement is either debited from the owner's account, netted from the next settlement, or absorbed by the platform, which RealPage's 10-K describes as bearing losses it can't recover from clients. The agreement says which, and the ledger reverses the payment on the resident's account either way.
- **Licenses travel with the company.** Change-of-control consents from money transmitter regulators were a closing condition of RealPage's acquisition, and Switching Platforms & Acquisitions covers what changing payments providers means for stored payment methods and autopay ([Switching Processors](/books/payments/switching-processors)).
- **Processor concentration is a property risk.** A platform with a single card processor (Entrata's S-1 names one) puts every property's card rent behind one agreement. That's a vendor risk the operator should know about, not one it can fix.

My rule for a platform: decide the model per flow with counsel, write it into the contracts, and record it as data per property (`collection_arrangements`), so that every payment can answer "whose money was this, where was it, and who was allowed to hold it" on any day.

## How to Build It

Money in is a row in the Payments volume's `payments` table, already extended with `lease_id` and `payer_person_id` in [The Core Data Model](/books/property-tech/property-business#the-core-data-model). Rent adds the channel, the lease's acceptance state, autopay, fees and the collection arrangement:

```sql
ALTER TABLE payments
  ADD COLUMN rent_channel TEXT CHECK (rent_channel IN ('portal', 'autopay', 'text_to_pay',
               'cash_network', 'lockbox', 'check_scan', 'office', 'third_party')),
               -- payments.channel already holds the card channel; this is how rent arrived
  ADD COLUMN payer_kind   TEXT NOT NULL DEFAULT 'resident' CHECK (payer_kind IN ('resident',
               'guarantor', 'agency', 'flexible_rent_provider', 'other_third_party')),
  ADD COLUMN acceptance_id UUID,         -- the lease_payment_acceptance row checked
  ADD COLUMN collection_arrangement_id UUID;

CREATE TABLE lease_payment_acceptance (  -- what a lease may pay with, and why
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  lease_id     UUID NOT NULL REFERENCES leases (id),
  acceptance   TEXT NOT NULL CHECK (acceptance IN ('all', 'certified_funds_only',
                 'full_balance_only', 'none')),
  reason       TEXT NOT NULL CHECK (reason IN ('normal', 'nsf_history', 'notice_served',
                 'eviction_filed', 'judgment', 'court_order', 'legal_hold')),
  required_amount BIGINT,                -- the reinstatement or full balance, when set
  set_by       TEXT NOT NULL,            -- user or workflow, as a typed actor
  valid_during TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (lease_id WITH =, valid_during WITH &&)
);

CREATE TABLE autopay_enrollments (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  lease_id          UUID NOT NULL REFERENCES leases (id),
  person_id         UUID NOT NULL REFERENCES people (id),
  payment_method_id UUID NOT NULL REFERENCES payment_methods (id),
  amount_rule       TEXT NOT NULL CHECK (amount_rule IN ('balance_due', 'fixed', 'share')),
  fixed_amount      BIGINT,              -- for 'fixed' and 'share'
  run_day           SMALLINT NOT NULL CHECK (run_day BETWEEN 1 AND 28),
  authorization_id  UUID,                -- the ACH or card authorization on file
  status            TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled')),
  ended_reason      TEXT,                -- 'move_out', 'blocked', 'resident', 'return_r10'
  valid_during      DATERANGE NOT NULL
);

CREATE TABLE convenience_fee_schedules ( -- who charges what, on which method, under which rule
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  property_id     UUID REFERENCES properties (id),  -- null: tenant-wide
  method          TEXT NOT NULL CHECK (method IN ('ach', 'credit_card', 'debit_card',
                    'cash_network', 'check', 'wallet')),
  charged_by      TEXT NOT NULL CHECK (charged_by IN ('platform', 'landlord', 'network')),
  fee_type        TEXT NOT NULL CHECK (fee_type IN ('flat', 'percent')),
  amount          BIGINT,
  percent         NUMERIC(6, 4),
  program         TEXT,                  -- 'visa_rent_program', 'surcharge', 'convenience'
  rule_citation   TEXT,                  -- the network rule or statute that allows it
  valid_during    DATERANGE NOT NULL
);

CREATE TABLE flexible_rent_arrangements (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  lease_id       UUID NOT NULL REFERENCES leases (id),
  person_id      UUID NOT NULL REFERENCES people (id),
  provider       TEXT NOT NULL,          -- the lender or servicer, from ancillary_agreements
  agreement_id   UUID,                   -- ancillary_agreements, in Resident Financial Products
  status         TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'provider_terminated')),
  valid_during   DATERANGE NOT NULL
);

CREATE TABLE collection_arrangements (   -- where rent sits in transit, and on what authority
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  property_id          UUID NOT NULL REFERENCES properties (id),
  payee_entity_id      UUID NOT NULL REFERENCES legal_entities (id),  -- landlord of record
  model                TEXT NOT NULL CHECK (model IN ('direct_settlement', 'licensed_transmitter',
                         'agent_of_payee', 'sponsor_bank_fbo')),
  settlement_account   TEXT NOT NULL,     -- the bank account reference; Trust Accounting owns it
  is_trust_account     BOOLEAN NOT NULL,
  returns_borne_by     TEXT NOT NULL CHECK (returns_borne_by IN ('owner', 'manager', 'platform')),
  agreement_reference  TEXT NOT NULL,     -- the contract that grants the authority
  valid_during         DATERANGE NOT NULL,
  EXCLUDE USING GIST (property_id WITH =, valid_during WITH &&)
);
```

Decisions behind it:

- **Two blocks, checked together.** The Payments volume's `payment_method_restrictions` blocks a method or an account; `lease_payment_acceptance` blocks a lease. Authorization checks both, records which rows it checked on the payment, and declines with the more specific reason.
- **One acceptance state at a time per lease,** enforced by the exclusion constraint, with the delinquency workflow as its usual writer. A manager's override is a new row with a reason, not an update.
- **Autopay respects the block.** The autopay job checks acceptance before each run and pauses enrollment rather than failing silently; a resident on `full_balance_only` gets a message, not a returned debit.
- **Fees record who charges them.** A platform fee never becomes a ledger charge; a landlord fee always does.
- **The collection arrangement is per property and period,** so the settlement for a payment is reproducible and a change of model (a new processor, a new trust account, an acquisition) is an effective-dated change rather than a rewrite.
- **Every channel uses the same matching and posting path,** idempotent on the source's reference ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)), with unmatched items in a suspense queue that is worked daily.

## Auditing

- **Every payment's path.** Channel, payer kind, the acceptance and restriction rows checked, the application rule used, the collection arrangement and the settlement it landed in.
- **Every block.** Who set it, why, when it started and ended, and every payment declined because of it, since a resident's lawyer and the court will ask whether a payment was refused, and whether that refusal was lawful.
- **Every fee.** The schedule row and rule that allowed it, the disclosure shown before the resident confirmed, and who received it.
- **Funds in transit by owner.** A daily report of what's in flight per payee entity, tied to the platform's custodial or FBO balances, which is the record a regulator examining a licensed transmitter or an owner auditing a manager asks for ([Ledger & Reconciliation at Provider Scale](/books/payments/ledger-and-reconciliation)).

## What This Means for the System You Build

- **Route every channel through one matching, acceptance and posting path,** and post on confirmation.
- **Keep the jurisdiction's payment method rules as data:** a non-cash, non-EFT option where required, cash-only demands limited and expiring, third-party payers accepted with their acknowledgment.
- **Separate platform fees from landlord fees,** disclose both before confirmation, and keep a free method visible.
- **Model lease payment acceptance as an effective-dated state with a reason,** set by the delinquency workflow, honored by every channel, and never blocking a payment the law requires accepting.
- **Treat flexible rent as a third party's credit product:** the provider pays the rent, the resident owes the provider, and its costs are shown up front.
- **Decide and record who holds rent in transit** per property, with the contract that authorizes it, the account it settles to and who bears returns.

## References

**Statutes**

- [California Civil Code 1947.3](https://california.public.law/codes/ca_civ_code_section_1947.3), a non-cash, non-EFT method required; cash-only demands limited to three months after a dishonored check; third-party payments; no fee for paying by check
- [Oregon ORS 90.417](https://oregon.public.law/statutes/ors_90.417), accepting partial rent after a nonpayment notice waives termination unless a written agreement says otherwise
- [Washington RCW 59.18.410](https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.410), reinstatement by payment before or shortly after judgment; pledges of emergency rental assistance the landlord must accept

**Filings and terms**

- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), required use of its payment solution, money transmitter licenses, FinCEN MSB registration, the Worldpay agreement, a single sponsor bank for bill pay, the Oregon consent order
- [RealPage: Form 10-K for 2020](https://www.sec.gov/Archives/edgar/data/1286225/000128622521000007/rp-20201231.htm), money transmitter licenses in several states, DC and Puerto Rico; restricted cash for renter payments in transit; losses on returns; change-of-control consents as a merger condition
- [Yardi: RentCafe Terms of Service](https://resources.yardi.com/legal/rentcafe-terms-of-service/), Yardi as the payee's payment collection agent in the US, with the renter's obligation satisfied on receipt

**In practice**

- [Entrata: ResidentPay](https://www.entrata.com/products/residentpay), card, eCheck, MoneyGram cash, money orders, check scanning, Apple Pay, Pay-by-Text, settlement within 72 hours
- [RealPage: Online payments](https://www.realpage.com/online-payments/), ACH, card, retail cash, lockbox, batch check scanning, Livble flexible rent, scale claims
- [Yardi Breeze: Residential features](https://www.yardibreeze.com/residential-features/), ACH and card, PayNearMe cash, CHECKscan batch scanning with next-day transfer
- [Flex](https://getflex.com/), split rent paid to the landlord up front, membership, processing and split fees, bank partners, optional credit reporting
- [Livble](https://www.livble.com/), rent in up to four installments for a finance charge, loans originated by Lead Bank
