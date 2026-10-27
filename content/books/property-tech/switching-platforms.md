+++
title = "Switching Platforms & Acquisitions"
nav_title = "Switching & Acquisitions"
description = "Moving properties between platforms and owners: cohorts, opening balances, trust cutover, deposit transfer, payment methods, licenses and lease audits."
category = "Property Tech Industry"
order = 1739
part = "Running the Platform"
tags = ["property-tech", "migration", "acquisitions", "trust-accounting", "payments", "implementation"]
+++

Properties move. A manager replaces its platform; an owner fires one manager and hires another; a fund buys a portfolio and hands it to its own operator; a vendor that holds residents' money is itself bought. Each move carries a live ledger: residents mid-lease with balances and deposits, autopay scheduled for the first, security deposits that state law says follow the property, trust accounts that must reconcile on both sides of the cutover date, a rent roll a buyer relied on, and owners expecting a statement for a month that two systems shared. Getting it wrong shows up as residents charged twice, deposits nobody can find at move-out, an owner's books that don't tie, or a late fee posted on a balance that was paid in the old system.

The general practice for replacing a system (strangle or cut over, crosswalks, loading with side effects off, reconciliation, the rollback window, the read-only archive, and planning the exit before entering) is in [Replacing a System](/docs/architecture/replacing-systems); moving card and bank credentials between processors is in the Payments volume's [Switching Processors](/books/payments/switching-processors). This chapter covers what property adds: migrations property by property, opening balances that preserve the ledger's meaning, trust and deposit cutover, residents' payment methods, licenses that change hands with a vendor, onboarding acquired properties with a lease audit, and the implementation work around all of it.

## How the Platforms Do It

The vendors describe migration as a service they run:

- **AppFolio** promises "A dedicated onboarding manager" and "A data migration specialist" who will migrate data "accurately into AppFolio from your existing system"; its guide to switching describes a data-mapping document showing "where each field in your old system lands in the new one," and says historical accounting ledgers migrate with opening balances to reconcile. It reports that users "report an average go-live time of 1.6 months," citing G2.
- **Entrata's** S-1 says "The average time to implement a new customer onto the Operating System is less than six months" and "All Operating System implementations are completed by our professional services team," and that each new customer among its largest 2025 deals "replaced approximately eight systems on average."
- **ResMan** assigns "a dedicated project manager," runs a "settings workshop" and weekly status calls, and lists certified implementation partners for "data export," "data migration," and "data validation."
- **Rent Manager** describes implementation consultants who "input your data properties, units, residents, vendors, owners, payments, etc."
- **Buildium** asks a new customer for "balances for your accounts, your rental owners, your residents and your association owners" before choosing an accounting start date, which "separates your Buildium accounting information from your previous accounting and reporting methods."
- **Rentec Direct's** import "Includes tenant current balance," with property balances entered manually, and "does not include past transaction history."

The pattern: **balances move, history mostly doesn't.** The new platform starts from an accounting start date with opening balances, and the old system becomes the record for everything before it. Entrata's "eight systems" figure is the other half of the story: at the large end a migration is often a consolidation, with the old PMS, a CRM, a payments provider, a screening vendor and spreadsheets all ending on the same date.

## Kinds of Move

The work differs by what changes hands:

| Move | What changes | What stays | Hard parts |
| --- | --- | --- | --- |
| **Platform switch** | The software; usually the payment provider | The owner, the manager, the leases, the bank accounts | Opening balances, autopay, residents' payment methods, staff retraining |
| **Manager change** | The manager (a different tenant on the same or another platform) | The owner, the leases | Trust and deposit transfer between managers, records handover, the owner's partial-year 1099, approvals for affordable properties |
| **Property sale** | The owner and landlord of record; often the manager | The residents and their leases | Deposit transfer and tenant notices under state law, the rent roll the buyer relied on, prorations at closing, new payees for rent |
| **Vendor acquisition** | Who owns the platform or payment provider | Everything the operator sees | Money transmitter change-of-control approvals, contract assignment, data terms |

A manager change and a sale both move a property between tenants. On a multi-tenant platform that means new records in the receiving tenant, not a transfer of rows: the departing manager keeps its history read-only because it remains answerable for the period it managed ([Tenancy: The Management Company](/books/property-tech/platform-architecture#tenancy-the-management-company)).

## Property by Property

Large migrations go in cohorts of properties, not in one weekend. My default for a platform switch:

- **Cut over at a month boundary, after close.** The old system closes the last month (statements, fee run, trust reconciliation), and the new one opens the next day with balances as of the close. Rent posts once, in the new system, on the first.
- **Cohorts by risk.** A pilot of a few properties with ordinary leases first; affordable, student and commercial properties in their own cohorts, after the program rules and segment settings have been proven; properties in strict jurisdictions (rent control, deposit interest) with the rules engine verified for them ([Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law)).
- **One system of record per property per day.** For every property and date there is exactly one platform that holds the lease and the ledger, recorded as data, so a dispute about a past balance goes to the right system ([Auditing](/books/property-tech/software-landscape#auditing)).
- **Crosswalk every identifier.** Properties, units, leases, people, vendors, owners and GL accounts get an external id row pointing at the old system's key, and nothing is matched twice ([Crosswalks and ID Mapping](/docs/architecture/replacing-systems#crosswalks-and-id-mapping), [Identity Across Sources](/books/property-tech/portfolios-properties-and-units#identity-across-sources)).
- **Load with side effects off.** Importing a lease must not send a welcome email, post a move-in charge, issue an access credential, schedule a renewal offer or start a late fee clock. Imports run as a migration actor with notifications, postings and integrations suppressed, and turned on per property at cutover ([Load With Side Effects Off](/docs/architecture/replacing-systems#load-with-side-effects-off)).

## What Moves and What Doesn't

| Moves as live data | Moves as documents or archive | Doesn't move |
| --- | --- | --- |
| Properties, buildings, units and status | Signed lease PDFs, addenda, guaranties and signature certificates | Old system's audit logs (exported and archived instead) |
| Current and future leases, members, guarantors | Inspection reports and photos | Card numbers outside a PCI-compliant transfer |
| Recurring charge schedules from the cutover date | Screening reports, retained per the disposal rule | Passwords |
| Open receivables by charge, deposits, prepaid rent | Closed ledgers and statements before cutover | Integrations' consents (re-granted per property) |
| Open work orders, PM schedules, asset register | Correspondence and notices served | |
| Vendors with compliance documents, open bills | Accommodation and VAWA files, into restricted stores | |
| Owners, agreements, reserves, GL opening trial balances | | |

Three items in the table cause most of the trouble. **Future leases and renewals in flight** (a signed renewal starting next month, a renewal offer sent last week with a deadline running) must arrive with their notice deadlines and rent cap evaluations, or the new system will send a second offer. **Documents are evidence,** so a lease migrated as data must keep a link to the signed PDF and its certificate; a lease that exists only as fields in the new system can't prove its terms ([Signing the Lease](/books/property-tech/the-lease#signing-the-lease)). **Restricted files** (screening reports, VAWA documentation, accommodation records) move into the new system's restricted stores with their retention dates, or stay in the old system's archive under the same access rules ([Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits)). Field Operations has the same split for its industry in [What Moves and What Doesn't](/books/field-operations/switching-platforms#what-moves-and-what-doesn-t).

## Opening Balances

An opening balance is not one number per resident. The resident ledger's meaning depends on what each open amount is, because rules read it: only rent supports a nonpayment eviction in many states, late fees may only be charged on rent, payments apply in a set order, and the subsidy portion of an assisted household's balance is owed by the agency, not the household ([The Charge Catalog](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog), [Payment Application Order](/books/property-tech/charges-and-resident-ledgers#payment-application-order)). So the import carries open items, not balances:

- **Open charges** by charge code, original due date, service period and ledger party (resident or agency), each with its unpaid amount, so aging, late fees and eviction notices compute the same way they would have.
- **Unapplied credits and prepaid rent** as their own items, applied by the new system's rules after cutover.
- **Deposits held,** per lease, with interest accrued to date and the account they sit in ([Security Deposits](/books/property-tech/insurance-deposits-and-guarantees#security-deposits)).
- **Payment plans and holds** (a plan in progress, rental assistance pending, a bankruptcy or SCRA hold) as records, because a plan's installments and a hold's effect on collection steps must survive ([Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction)).
- **Each entity's trial balance** as of the cutover date, mapped from the old chart to the new master chart, with owner funds held, deposits held, prepaid rent and due-to and due-from balances by entity ([The General Ledger by Entity](/books/property-tech/trust-accounting#the-general-ledger-by-entity)).

Then the tie-outs, every one of which must hold before a property goes live:

```text
sum of resident open items              = accounts receivable control, per entity
sum of deposits held by lease            = security deposit liability, per entity
                                         = deposit bank balance, where deposits are segregated
sum of prepaid and unapplied credits     = prepaid rent liability, per entity
owner funds held + deposits + prepaid    = trust bank balance (three-way, at cutover)
old system's closing trial balance       = new system's opening trial balance, after mapping
```

A difference isn't plugged to suspense and forgotten. It's a reconciling item with an owner and a deadline, because a deposit nobody can find at move-out is still owed to the resident.

## Trust Cutover and Deposit Transfer

Money held for others has to be accounted for on the cutover date by both sides. For a platform switch with the same bank accounts, that's a three-way reconciliation at the close of the last old-system month, reproduced as the opening position in the new system ([Three-Way Reconciliation](/books/property-tech/trust-accounting#three-way-reconciliation)). For a manager change or a sale, money actually moves, and state law sets the steps for deposits:

- **California.** When the landlord's interest terminates, the landlord must within a reasonable time either transfer the deposit "to the landlord's successor in interest" and notify the tenant "of the transfer, of any claims made against the security, of the amount of the security deposited, and of the names of the successors in interest," or return it to the tenant "together with an accounting"; before a voluntary transfer the landlord must give the successor a written statement (Civil Code 1950.5(i) and (j)). Separately, a successor owner or manager must post or deliver the owner's and manager's names and addresses "within 15 days of succeeding the previous owner or manager" (Civil Code 1962).
- **New York.** The deposit is turned over to the grantee or assignee, the tenant is notified "by registered or certified mail," the transferor is relieved of liability, and "the transferee of such security deposit is hereby made responsible for the return thereof" (General Obligations Law 7-105).
- **Texas.** The new owner "is liable for the return of security deposits... from the date title to the premises is acquired," and must give each tenant "a signed statement acknowledging that the new owner has acquired the property and is responsible for the tenant's security deposit and specifying the exact dollar amount of the deposit" (Property Code 92.105).
- **Florida.** On a sale "or upon a change in the designated rental agent," deposits and advance rents are transferred to the new owner or agent "together with any earned interest and with an accurate accounting," and there's "a rebuttable presumption that any new owner or agent received the security deposit from the previous owner or agent," limited to one month's rent (Statutes 83.49(7)).

Florida's rule reaches a manager change, not only a sale, which is why deposit transfer is a manager-change workflow too. The design: each deposit transfer is a row per lease with the amount, interest, from and to parties, the statute's notice requirement and when the notice went out, generated from the rules engine for the property's jurisdiction ([Deposit Deadlines as Rules Data](/books/property-tech/move-in-and-move-out#deposit-deadlines-as-rules-data)). The transfer schedule from the old manager or seller is reconciled to the leases before closing, and a deposit missing from it is still owed to the resident at move-out, by whoever the statute makes responsible ([Onboarding and Offboarding an Owner](/books/property-tech/owners-and-management-agreements#onboarding-and-offboarding-an-owner)).

**Bank accounts follow the structure.** Where deposits and operating funds sit in accounts per property in the owner's name, a manager change replaces signatories and the accounts stay; where they sit in the departing manager's pooled trust account, the money moves to the new manager's account, and both managers' reconciliations show the transfer ([Bank Accounts](/books/property-tech/trust-accounting#bank-accounts)). Unclaimed items (uncashed refund checks from old move-outs) are either transferred with an accounting or remain the departing holder's escheat obligation; the agreement says which ([Unclaimed Property](/books/property-tech/trust-accounting#unclaimed-property)).

## Residents' Payment Methods and Autopay

Residents notice a migration through their payments. The mechanics of moving stored credentials are the Payments volume's ([Moving Card Numbers](/books/payments/switching-processors#moving-card-numbers), [Bank Mandates](/books/payments/switching-processors#bank-mandates)); what rent adds:

- **Cards move only processor to processor.** Stripe's import requires data "encrypted with the Stripe public PGP key," can't include card security codes because "PCI DSS rules prohibit storing the security code after a transaction is authorized," and warns that "Processors can take anywhere from a few days to several months to produce a final export." Request the export early, and expect a "temporary increase in declined payments" after the move.
- **Bank authorizations name a payee.** An ACH authorization runs to the originator the resident authorized. When a platform switch keeps the landlord as payee, the authorization may carry over if its text names the landlord or property and the new provider accepts the mandates; when it names the old platform or processor, or when a sale changes the landlord, the resident authorizes again. Read the authorization text before promising residents nothing changes ([The Rules You Inherit](/books/payments/ach#the-rules-you-inherit)).
- **Autopay is a schedule, not a card.** Each enrollment's amount rule (full balance, fixed amount, rent only), day and payment method moves together, and the first new-system run is verified against the old system's last one. A resident who autopays on the first and was migrated without enrollment pays late through no fault of their own; the late fee rules should exempt the first cycle after cutover for migrated enrollments that failed.
- **Payment blocking moves.** A household whose payments are blocked (certified funds only after returns, or no partial payments after an eviction filing where acceptance would waive it) must carry the block across, or the new system will accept a payment that undoes a legal step ([Payment Blocking](/books/property-tech/collecting-rent#payment-blocking)).
- **The old rails wind down.** Returns and chargebacks on payments taken in the old system arrive for weeks after cutover; they post against the migrated open items, and the old provider's settlement account stays open until they stop ([Reconciling the Overlap](/books/payments/switching-processors#reconciling-the-overlap)).
- **Tell residents once, early, specifically.** Which date, what they need to do (re-enter a card, re-authorize a bank account, re-download an app), and what doesn't change (rent, due date, lease). Notices go through the consent ledger and the property's languages ([Communications and Consent](/books/property-tech/resident-experience#communications-and-consent)).

## Money Transmitter Change of Control

When the company that holds residents' money in transit is itself acquired, its licenses don't simply follow. Under the Conference of State Bank Supervisors' model Money Transmission Modernization Act, control means the power to vote "at least 25 percent of the outstanding voting shares," and anyone "seeking to acquire control of a licensee shall obtain the written approval of the [Commissioner] prior to acquiring control," with a decision due within 60 days of a complete application and the application deemed approved if none is made (Section 6.01); states adopt the model with their own values.

The public record shows it binding a property platform deal. RealPage's 2021 merger proxy disclosed that a subsidiary held money transmitter licenses, that "the money transmission laws and regulations of certain of these jurisdictions require" notice, filings or approval for a change of control, and made "the receipt of Licensee Consents in the Material Jurisdictions," jurisdictions covering "at least 80% of the fee revenue received by Licensee in the United States," a condition of closing. Entrata's S-1 lists "requirements for regulatory approval of controlling stockholders" among the obligations of its licenses.

For the platform, three consequences ([Who Holds the Money](/books/property-tech/collecting-rent#who-holds-the-money)):

- **Keep a licensing inventory as data:** which entity holds which license or registration in which state, the control persons, and the change-of-control rule for each, because a deal team will ask for it on day one.
- **Model the collection arrangement per property.** Where the platform collects as the landlord's agent rather than as a licensed transmitter, a sale changes the landlord, and the agency arrangement must be papered with the new owner before the first rent day ([Collecting Rent](/books/property-tech/collecting-rent#how-to-build-it)).
- **Operators read their vendor's deal.** A pending acquisition of a payments vendor can delay approvals, change terms or force a processor change; the operator's contract should say what notice it gets.

## Onboarding Acquired Properties

A buyer inherits leases it didn't write, deposits it didn't collect and a rent roll it relied on. Diligence and onboarding are one workflow:

- **Audit the rent roll against the leases.** A multifamily diligence checklist from a law firm says to "Ensure that the rent roll matches the lease agreements in terms of rent amounts, lease durations, and tenant names" and to "Review tenant security deposits and prepaid rent." Add concessions, recurring fees, guarantors, renewal options, and any rent above a legal cap. AI abstraction makes this tractable at portfolio scale: Entrata's Lease File Audit turns "lease documents into structured, reviewable terms" and compares "lease terms with billing data to identify potential discrepancies." Each finding is a row with its evidence and a resolution, not a note in a spreadsheet.
- **Verify legal rent where rents are regulated.** Under rent stabilization or a statewide cap, the legal rent depends on the lease history, so the buyer needs the prior rents and increase dates, imported as history the rules engine can read ([Rent Limits in the Engine](/books/property-tech/revenue-management#rent-limits-in-the-engine)).
- **Check program compliance before closing.** Affordable properties come with certifications, set-asides and use agreements the buyer must honor; for HUD-insured and HUD-assisted properties a new management agent needs approval: HUD's handbook says the agent may assume responsibility only after HUD "has issued a letter approving the agent" and the management certification is executed, with submissions "at least 60 days before" the new agent is to take over ([Subsidized & Affordable Housing](/books/property-tech/affordable-housing)).
- **Prorate at closing, then cut the ledger.** Rent collected for the closing month, deposits, prepaid rent and delinquent balances are allocated by the purchase agreement; the seller's ledger closes at closing and the buyer's opens with the transferred items, with the landlord of record on every lease changed from the closing date ([The Core Data Model](/books/property-tech/property-business#the-core-data-model)). Leases aren't rewritten; the landlord entity changes by date.
- **Notify residents with what the law requires:** the new owner and manager, where to pay, where to serve notices and who holds the deposit, from the deposit statutes above and California's 15-day disclosure rule.
- **Commercial adds estoppels and abstracts.** Long leases with options and critical dates are abstracted and confirmed with tenants before closing ([Abstracts and Clause Tracking](/books/property-tech/commercial-property#abstracts-and-clause-tracking)).

## Implementation Services and Training

Migration is a project with people in it. The vendor pages above describe its parts: a project manager, a settings workshop, data mapping, validation, training and a go-live. Entrata sells settings audits and "hands-on support with system configuration and optimization" through business consulting, and training through Entrata Academy with "daily product-focused webinars." What the platform has to support:

- **Settings before data.** Thousands of settings (late fee policies, payment application order, charge codes, approval limits, notice templates) are decided per tenant, portfolio and property before the first lease loads, because imported records are validated against them ([Tenancy: The Management Company](/books/property-tech/platform-architecture#tenancy-the-management-company)).
- **Dry runs.** Each cohort loads into a staging copy at least once, with the tie-outs run and the first rent posting and autopay run simulated, before the real cutover.
- **Training by role before cutover,** with sandbox data that looks like the property's, and a hypercare period after it with named owners for each property's open issues.
- **Who pays.** Migration and training costs are a management agreement question like any other: some agreements allow a setup fee or a technology transition charge to owners, most don't ([Management Fees](/books/property-tech/owners-and-management-agreements#management-fees)).

## Owners, Statements and 1099s in a Split Year

A property that changes manager or platform mid-year has two sources for its year. The IRS instructions say a real estate agent or property manager "must use Form 1099-MISC to report the rent paid over to the property owner." My rule: each manager reports what it paid over during its own period, from its own records, and the owner's statements for the year say which manager covered which months. The departing manager's final statement and final fee run follow the agreement's termination terms ([Owner Taxes: 1099s and Foreign Owners](/books/property-tech/owners-and-management-agreements#owner-taxes-1099s-and-foreign-owners)), and the receiving manager's first statement opens from the transferred balances, never from a restated history.

## Exit Rights

Every migration in is someone's migration out. Before signing, an operator reads the contract for what it gets on leaving: a full export in documented formats, documents and audit logs, payment credentials transferred to a PCI-compliant processor of its choice, and a read-only period ([Vendor Exports and Lock-In](/docs/architecture/replacing-systems#vendor-exports-and-lock-in), [Plan the Exit Before You Enter](/docs/architecture/replacing-systems#plan-the-exit-before-you-enter)). Stripe's documentation says "You can export your data to any PCI-compliant processor"; not every provider says so, and the [Build, Buy or Extend](/books/property-tech/software-landscape#build-buy-or-extend) test includes it.

## How to Build It

This chapter extends `tenants` and `portfolios` from [The Core Data Model](/books/property-tech/property-business#the-core-data-model) with migration runs and property cutovers, opening balance items and tie-outs, property transfers, deposit transfers, payment method migrations, lease audit findings and a licensing inventory. It reuses `external_ids` from [Portfolios, Properties & Units](/books/property-tech/portfolios-properties-and-units#how-to-build-it), widened to every migrated record type.

```sql
ALTER TABLE external_ids
  DROP CONSTRAINT external_ids_record_type_check,
  ADD CONSTRAINT external_ids_record_type_check CHECK (record_type IN ('property', 'building',
    'unit', 'parcel', 'lease', 'person', 'household', 'vendor', 'legal_entity', 'gl_account',
    'charge_code', 'work_order'));

CREATE TABLE migration_runs (            -- one cohort's load
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  source_system  TEXT NOT NULL,          -- 'prior_pms:acme', 'seller:xyz_mgmt'
  kind           TEXT NOT NULL CHECK (kind IN ('platform_switch', 'manager_change',
                   'acquisition')),
  mode           TEXT NOT NULL CHECK (mode IN ('dry_run', 'cutover')),
  as_of          DATE NOT NULL,          -- balances as of the close of this day
  migration_user_id UUID NOT NULL REFERENCES users (id),  -- the actor; side effects off
  status         TEXT NOT NULL CHECK (status IN ('loading', 'loaded', 'tied_out',
                   'live', 'rolled_back')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE property_cutovers (         -- which system is the record, when
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID NOT NULL REFERENCES properties (id),
  migration_run_id UUID REFERENCES migration_runs (id),
  system_of_record TEXT NOT NULL,        -- 'this_platform', 'prior_pms:acme'
  valid_during     DATERANGE NOT NULL,
  side_effects_on_at TIMESTAMPTZ,        -- notifications, postings, integrations enabled
  EXCLUDE USING GIST (property_id WITH =, valid_during WITH &&)
);

CREATE TABLE opening_items (             -- open receivables, credits, deposits, plans
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  migration_run_id UUID NOT NULL REFERENCES migration_runs (id),
  property_id      UUID NOT NULL REFERENCES properties (id),
  lease_id         UUID REFERENCES leases (id),
  kind             TEXT NOT NULL CHECK (kind IN ('open_charge', 'unapplied_credit',
                     'prepaid_rent', 'deposit_held', 'deposit_interest', 'payment_plan',
                     'gl_balance')),
  charge_code_id   UUID REFERENCES charge_codes (id),
  ledger_party     TEXT,                 -- 'resident', 'agency'
  original_due_on  DATE,
  service_period   DATERANGE,
  amount           BIGINT NOT NULL,
  currency         CHAR(3) NOT NULL,
  legal_entity_id  UUID REFERENCES legal_entities (id),
  gl_account_id    UUID REFERENCES gl_accounts (id),
  source_ref       TEXT NOT NULL,        -- the old system's key and export file hash
  posted_charge_id UUID REFERENCES charges (id),  -- the charge it became, posted as of as_of
  CHECK (kind <> 'open_charge' OR (lease_id IS NOT NULL AND charge_code_id IS NOT NULL))
);

CREATE TABLE migration_tie_outs (        -- every check, with its result
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  migration_run_id UUID NOT NULL REFERENCES migration_runs (id),
  legal_entity_id  UUID REFERENCES legal_entities (id),
  property_id      UUID REFERENCES properties (id),
  check_key        TEXT NOT NULL,        -- 'ar_control', 'deposit_liability', 'three_way',
                                         -- 'trial_balance', 'autopay_first_run'
  expected         BIGINT NOT NULL,
  actual           BIGINT NOT NULL,
  difference       BIGINT GENERATED ALWAYS AS (actual - expected) STORED,
  resolution       TEXT,                 -- required when difference <> 0
  resolved_by      UUID REFERENCES users (id)
);

CREATE TABLE property_transfers (        -- a sale or a manager change
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID NOT NULL REFERENCES properties (id),
  kind             TEXT NOT NULL CHECK (kind IN ('sale_in', 'sale_out', 'manager_in',
                     'manager_out')),
  counterparty     TEXT NOT NULL,        -- the seller, buyer or other manager
  from_entity_id   UUID REFERENCES legal_entities (id),
  to_entity_id     UUID REFERENCES legal_entities (id),
  effective_on     DATE NOT NULL,        -- closing or handover date
  agency_approval_ref TEXT,              -- e.g. HUD approval of a new management agent
  status           TEXT NOT NULL CHECK (status IN ('planned', 'closed', 'cancelled'))
);

CREATE TABLE deposit_transfers (         -- one per lease, with the statute's notice
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  property_transfer_id UUID NOT NULL REFERENCES property_transfers (id),
  lease_id            UUID NOT NULL REFERENCES leases (id),
  deposit_amount      BIGINT NOT NULL,
  interest_amount     BIGINT NOT NULL DEFAULT 0,
  currency            CHAR(3) NOT NULL,
  claims_disclosed    TEXT,              -- claims against the deposit, where the law requires
  rule_evaluation_id  UUID REFERENCES rule_evaluations (id),  -- notice method and deadline
  notice_due_by       DATE,
  notice_sent_at      TIMESTAMPTZ,
  notice_method       TEXT,              -- 'first_class_mail', 'certified_mail', 'personal'
  ledger_transaction_id UUID REFERENCES ledger_transactions (id),
  status              TEXT NOT NULL CHECK (status IN ('scheduled', 'received', 'missing',
                        'returned_to_tenant'))
);

CREATE TABLE payment_method_migrations ( -- per stored method and autopay enrollment
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  migration_run_id   UUID NOT NULL REFERENCES migration_runs (id),
  lease_id           UUID NOT NULL REFERENCES leases (id),
  person_id          UUID NOT NULL REFERENCES people (id),
  method_kind        TEXT NOT NULL CHECK (method_kind IN ('card', 'bank_account')),
  source_ref         TEXT NOT NULL,      -- the old provider's token, never a raw number
  new_payment_method_ref TEXT,
  authorization_carries BOOLEAN,         -- false: the resident must authorize again
  autopay_enrollment_id UUID REFERENCES autopay_enrollments (id),
  status             TEXT NOT NULL CHECK (status IN ('pending', 'migrated', 'reauthorization_sent',
                       'reauthorized', 'failed', 'abandoned')),
  resident_notified_at TIMESTAMPTZ
);

CREATE TABLE lease_audit_findings (      -- diligence and onboarding, with evidence
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID NOT NULL REFERENCES properties (id),
  lease_id         UUID REFERENCES leases (id),
  source_ref       TEXT NOT NULL,        -- the document and page the term came from
  field            TEXT NOT NULL,        -- 'rent', 'deposit', 'concession', 'fee', 'term_end'
  document_value   TEXT,
  system_value     TEXT,
  found_by         UUID NOT NULL REFERENCES users (id),  -- staff, or an AI agent's user
  resolution       TEXT CHECK (resolution IN ('system_corrected', 'document_controls',
                     'seller_credit', 'accepted', 'open')),
  resolved_by      UUID REFERENCES users (id)
);

CREATE TABLE license_holdings (          -- the platform's own licensing inventory
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  holder_entity    TEXT NOT NULL,        -- the platform's licensed subsidiary
  jurisdiction     TEXT NOT NULL,        -- ISO 3166-2
  kind             TEXT NOT NULL,        -- 'money_transmitter', 'collection_agency', 'msb'
  license_number   TEXT,
  control_threshold NUMERIC(5, 4),       -- e.g. 0.25 under the model act
  change_of_control_rule TEXT NOT NULL,  -- 'prior_approval', 'notice', 'none'
  valid_during     DATERANGE NOT NULL
);
```

Design decisions behind it:

- **The system of record per property per day is data,** with an exclusion constraint, so every disputed past balance has one place to be answered.
- **Open items keep their meaning.** Each opening charge carries its code, due date, service period and ledger party, and becomes a real `charges` row posted as of the run's date by the migration user, so aging, late fees, application order and eviction rules work on it unchanged.
- **Tie-outs are rows,** with a required resolution for any difference, and a property doesn't go live while one is open.
- **Side effects turn on per property** at cutover, recorded on `property_cutovers`, so a migration never emails, posts or grants access by accident.
- **Deposit transfers carry their statute.** The notice method and deadline come from a rule evaluation for the property's jurisdiction, and a missing deposit is a status, not an absence.
- **Payment method migrations never hold raw credentials** and record whether the authorization carries, which decides whether the resident is asked to re-authorize.
- **Licensing is an inventory,** with each jurisdiction's change-of-control rule, ready for a deal.

## Auditing

- **What the old system said.** Export files, hashed and retained, with the mapping version that loaded them, so any migrated balance can be traced to its source row.
- **Tie-outs and their resolutions,** per entity and property, with who resolved each difference and how.
- **Cutover dates and the system of record,** per property, and when side effects were turned on.
- **Deposit transfers and notices,** per lease, with amounts, interest, claims disclosed, notice method and date: the evidence when a resident asks at move-out who holds the deposit.
- **Payment method outcomes,** per resident: migrated, re-authorized, failed, and the notices sent.
- **Lease audit findings** with their evidence and resolutions, which the buyer's lender, the seller and a resident in a rent dispute may all ask for.
- **Approvals and consents** that a transfer required: HUD approval of a new agent, money transmitter change-of-control approvals, owners' consent to assignment.

## What This Means for the System You Build

- **Migrate property by property in cohorts,** cutting over at a month boundary after close, with one system of record per property per day as data.
- **Load with side effects off** and turn them on per property at cutover.
- **Import open items, not balances,** with charge code, due date, service period and ledger party, and tie out receivables, deposits, prepaid and trust before going live.
- **Treat deposit transfer as a statutory workflow** for sales and manager changes, with notices generated from the property's jurisdiction.
- **Move payment methods processor to processor,** check whether each authorization names a payee that survives, and carry autopay and payment blocks across.
- **Keep a licensing inventory** with change-of-control rules, and re-paper collection arrangements when a landlord changes.
- **Audit acquired leases against the rent roll** with findings as rows, verify legal rents where regulated, and get program approvals before the new agent takes over.
- **Decide settings before data,** dry-run each cohort, and train by role before cutover.
- **Split the year cleanly** for owners and 1099s, each manager reporting its own period.
- **Read the exit terms before you sign.**

## References

**Statutes and regulations**

- [California Civil Code 1950.5](https://california.public.law/codes/civil_code_section_1950.5), transfer of the deposit to the successor or return with an accounting, notice contents, and the statement to the successor before a voluntary transfer
- [California Civil Code 1962](https://california.public.law/codes/civil_code_section_1962), owner and manager disclosure and the successor's 15 days
- [New York General Obligations Law 7-105](https://www.nysenate.gov/legislation/laws/GOB/7-105), turning over deposits to a grantee, certified or registered mail notice, and transferee responsibility
- [Texas Property Code 92.105](https://texas.public.law/statutes/tex._prop._code_section_92.105), the new owner's liability from acquisition of title and the signed statement to tenants
- [Florida Statutes 83.49](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0000-0099/0083/Sections/0083.49.html), transfer of deposits and advance rents on a sale or change of rental agent, and the one-month presumption
- [CSBS: Money Transmission Modernization Act (PDF)](https://www.csbs.org/sites/default/files/2023-02/CSBS%20Money%20Transmission%20Modernization%20Act.pdf), the 25 percent control definition, prior approval of a change of control, and the 60-day decision (Section 6.01)
- [IRS: Instructions for Forms 1099-MISC and 1099-NEC](https://www.irs.gov/instructions/i1099mec), property managers reporting rent paid over to owners
- [HUD: Handbook 4381.5, chapter 2 (PDF)](https://www.hud.gov/sites/documents/43815c2hsgh.pdf), HUD approval of management agents, the management certification, and submission 60 days ahead

**Filings**

- [RealPage: Definitive merger proxy (2021)](https://www.sec.gov/Archives/edgar/data/1286225/000119312521029970/d52613ddefm14a.htm), money transmitter licenses, change-of-control requirements and Licensee Consents in Material Jurisdictions as a closing condition
- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), implementation in under six months by professional services, about eight systems replaced, and regulatory approval of controlling stockholders

**Platforms**

- [AppFolio: Time to switch](https://www.appfolio.com/time-to-switch), an onboarding manager and a data migration specialist
- [AppFolio: Property management onboarding, how to switch platforms](https://www.appfolio.com/blog/property-management-onboarding-how-to-switch-platforms), the data-mapping document, opening balances and reported go-live time (October 16, 2026)
- [ResMan: Implementation, training and support](https://www.myresman.com/?p=2845), project manager, settings workshop and certified implementation partners
- [Rent Manager: Implementation](https://www.rentmanager.com/?p=13548), consultants inputting properties, units, residents, vendors, owners and payments (2015)
- [Buildium: Onboarding steps](https://www.buildium.com/onboarding-steps/), balances and the accounting start date
- [Rentec Direct: Data import](https://help.rentecdirect.com/article/120-data-import), current balances without transaction history (March 31, 2026)
- [Entrata: Training](https://www.entrata.com/products/training), Entrata Academy and onboarding
- [Entrata: Business Consulting](https://www.entrata.com/products/business-consulting), settings audits and configuration support
- [Entrata: Lease File Audit](https://www.entrata.com/products/lease-file-audit), lease abstraction compared with billing data
- [Stripe: Import card data](https://docs.stripe.com/get-started/data-migrations/pan-import), PGP-encrypted transfers, no security codes, export times, declines after the move, and exports to PCI-compliant processors

**In practice**

- [Holmquist + Gardiner: Due diligence guide for multifamily property investments](https://lawhg.net/news-and-insights/2024/9/16/due-diligence-guide-for-multifamily-property-investments), rent roll against leases, deposits and prepaid rent (September 16, 2024)
