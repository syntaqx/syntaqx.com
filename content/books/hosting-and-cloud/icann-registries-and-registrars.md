+++
title = "ICANN, Registries & Registrars"
description = "Who does what in a domain sale: ICANN, registries, registrars and resellers, the contracts that bind them, the per-name fee stack, and how ICANN enforces."
category = "Hosting & Cloud Industry"
order = 2161
part = "Domains and DNS"
tags = ["domains", "icann", "registrars", "registries", "contracts", "compliance"]
+++

A domain name is the one product in this volume that nobody sells outright. The registry operator for a top-level domain keeps the authoritative list of names in it and the zone that makes them resolve; an accredited registrar is the only party allowed to create, renew, transfer or delete a name in that registry on a customer's behalf; a reseller sells the registrar's service under its own brand; and the customer, the registrant, holds the name for a term it renews or loses. ICANN sits above all of them for the generic top-level domains: it accredits registrars, contracts with registries, makes the consensus policies that every contract incorporates, and enforces them. Country-code domains have their own registries and rules, covered in [New gTLDs & ccTLDs](/books/hosting-and-cloud/new-gtlds-and-cctlds#cctlds).

The structure decides the software. Every registration is a row the registrar keeps and a different row the registry keeps, linked by a protocol ([The Domain Data Model & EPP](/books/hosting-and-cloud/epp-and-domain-data)); every name-year carries a registry fee and an ICANN fee the registrar owes whether or not its customer pays; every contract term the registrar signed reaches into its checkout, renewal notices, transfer flow, abuse desk and records. This chapter covers the parties and how they divide the work, how the shared registry came to be, the contracts that bind a registrar, the fee stack under every price, the registrar's responsibility for its resellers, and how ICANN enforces all of it. It extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with registries, their wholesale prices and the pass-through SKUs.

## How the Providers Do It

The same chain of registry, registrar and reseller sits under every provider; what differs is where each one sits in it and what it charges on top. As of October 2026:

| Provider | Where it sits | How it prices | What it shows |
| --- | --- | --- | --- |
| **GoDaddy** | Retail registrar, registry back end (GoDaddy Registry operates or provides the back end for about 170 TLDs) and an aftermarket with its own portfolio of about 1.0 million names | Retail prices over the registry and ICANN fees, which its 10-K discloses as Verisign's $10.26 for .com and ICANN's $0.20 for most gTLD registrations | About 81 million domains under management at the end of 2025, roughly 21% of the 387 million registered worldwide. "We have no control over ICANN, VeriSign or other domain name registries" |
| **Tucows** (OpenSRS, Enom, EPAG, Ascio; Hover retail) | Wholesale registrar for resellers, plus a retail brand | Wholesale prices to resellers, who set their own retail prices | More than 32,000 resellers in about 200 countries; 21.5 million names under management, down 3.0 million (12.3%) during 2025; names a .com fee rise as a direct hit to cost of revenue |
| **Cloudflare Registrar** | Retail registrar for its own customers | At cost: "at or below what registries and ICANN charge us"; renewals only at the registry's list price | Over 430 TLDs, locked by default, auto-renew on by default |
| **Porkbun** | Retail registrar | $11.08 for a .com registration, renewal or transfer; "All prices include ICANN and any other fees" | WHOIS privacy and Let's Encrypt certificates bundled free |
| **Namecheap** | Retail registrar | Lists the ICANN fee as its own line: restoring a generic TLD costs the redemption price "plus a $0.20 ICANN fee" | The pass-through shown to the customer rather than folded in |
| **Squarespace** | Retail registrar, largely by acquisition | Bundled with its website plans | Bought Google Domains' assets: announced 15 June 2023, closed 7 September 2023, $180.7 million total consideration |
| **Network Solutions** (Newfold Digital) | Retail registrar; the original .com registrar | Retail list prices with reinstatement and redemption fees for late renewals | Newfold folding brands into it: Register.com "is becoming Network Solutions" |
| **IONOS** | Registrar inside a hosting group | Domains sold mainly with hosting and productivity bundles | Reported its Sedo aftermarket business as held for sale and discontinued in its 2025 results |
| **Verisign** | Registry operator for .com and .net | A regulated wholesale price to every registrar: $10.26 for .com, rising to $10.97 on 1 November 2026 | 176.1 million .com and .net registrations at the end of March 2026 |

Three patterns run through the table. **The registry fee is the floor and nobody controls it but the registry:** GoDaddy and Tucows both say so in their filings, and Cloudflare's whole offer is to charge nothing above it. **The registrar's margin is small on the name and large around it:** the price gap between Cloudflare's at-cost renewal and Porkbun's $11.08 is cents, so the money is in bundles, privacy, hosting, email, premium names and the aftermarket. **Scale comes from consolidation and wholesale:** Squarespace bought Google Domains' customers (about ten million names, as reported at the time), Newfold merges brands into one registrar, and Tucows sells through tens of thousands of resellers who never sign anything with ICANN. Registry economics, the .com price rules and the new TLD round are [Registry Economics](/books/hosting-and-cloud/new-gtlds-and-cctlds#registry-economics).

## How We Got Here

**One company, then a shared registry (to 1999).** Network Solutions (NSI) was the sole registrar and registry administrator for .com, .net and .org under a cooperative agreement with the US Department of Commerce. In October 1998, Amendment 11 to that agreement required a Shared Registration System: "an unlimited number" of competing registrars using one registry, with NSI staying on as registry administrator. In November 1998 Commerce identified ICANN to oversee the transition. ICANN's Board adopted its Statement of Registrar Accreditation Policy on 4 March 1999, took applications for five testbed registrars from 11 March to 8 April 1999, and ran the testbed until 30 November 1999 after several extensions. The problem it solved was a monopoly on retail registration. The cost was a split record: the registry kept names and nameservers, the registrar kept the customer, and the two had to agree in real time over a protocol.

**A protocol for a thin registry (2000).** That protocol was the Registry Registrar Protocol, published as RFC 2832 in May 2000 by two NSI Registry engineers: a text protocol over SSL on TCP port 648 whose registry stored "information about registered domain names and associated name servers" and no contacts at all. It said plainly that it "does not provide any registrant services." Contacts stayed with registrars, which is where the long argument about thin and thick registries, and later about personal data, started ([Registration Data & RDAP](/books/hosting-and-cloud/registration-data-and-rdap#how-we-got-here)). EPP replaced RRP ([The Domain Data Model & EPP](/books/hosting-and-cloud/epp-and-domain-data#how-we-got-here)).

**Contracts tighten in rounds (2001 to 2013).** A new Registrar Accreditation Agreement took effect on 17 May 2001 and stayed until the Board approved 17 amendments as the 2009 RAA on 21 May 2009. The 2013 RAA, approved by the Board on 27 June 2013 after more than a year of negotiation with the registrars, added the things this part of the volume keeps returning to: an abuse point of contact, verification and validation of registrant data, and registrars' clear responsibility for their resellers. The Board's timing followed the GAC's Beijing advice that the new RAA be finalized before any new gTLD registry contracts were approved, which tied the 2013 RAA to the 2012 round of new TLDs.

**Amendments by vote (2023 and 2024).** The 2013 contracts change through global amendments negotiated with the contracted parties and approved by them: the 2023 amendment that replaced WHOIS with RDAP ([Registration Data & RDAP](/books/hosting-and-cloud/registration-data-and-rdap#rdap)), and the 2024 DNS abuse amendment, effective 5 April 2024 ([What the Amendments Require](/books/hosting-and-cloud/dns-abuse#what-the-amendments-require)). The base registry agreement in force is the version approved on 21 January 2024.

## The Contracts

A registrar operates inside five layers of contract, and each one lands somewhere in its system:

| Contract | Between | What it means for the registrar's system |
| --- | --- | --- |
| **Registrar Accreditation Agreement (2013)** | ICANN and the registrar | Accreditation itself, fees, the terms every registration agreement must carry, data retention, escrow, abuse handling, reseller duties, notices to ICANN, and termination |
| **Registry agreement** | ICANN and the registry operator | Who may register (only ICANN-accredited registrars), equal access, price-change notice, grace periods and the registry's own abuse duties |
| **Registry-Registrar Agreement** | The registry and each registrar | The protocol, the payment security that sets the registrar's credit, billing and suspension when the credit runs out |
| **Consensus policies** | Bind registries and registrars through their contracts | The Transfer Policy, the Expired Registration Recovery Policy, the Add Grace Period Limits Policy, the UDRP, the Registration Data Policy and others, each with its own clocks |
| **Registration agreement and reseller agreements** | The registrar and its registrant; the registrar and each reseller | The terms the RAA requires the registrar to pass down, and the obligations it must enforce on resellers |

**The RAA.** The 2013 agreement renews for successive five-year periods unless, among other conditions, the registrar has received three or more material breach notices in the prior two years (section 5.2). The parts with the most operational weight:

- **Fees (3.9).** A yearly accreditation fee that "shall not exceed US$4,000", payable quarterly, plus variable fees the Board sets but that registrars paying two-thirds of registrar-level fees must approve; late payments accrue 1.5% a month.
- **The registration agreement (3.7.7).** Every registrant must agree, among other terms, to provide accurate contact data and update it within seven days of a change, to the use of their data, and that the name can be suspended, cancelled or transferred under ICANN policy.
- **Renewal and deletion (3.7.5).** A registrant who doesn't consent to renewal within the time stated in a second notice loses the name by the end of the registry's auto-renew grace period, absent extenuating circumstances such as a UDRP action or court order, and the registrar must delete a name within 45 days of either side terminating the registration agreement; it must publish its deletion and auto-renewal policies and its redemption fee ([The Domain Lifecycle](/books/hosting-and-cloud/domain-lifecycle#grace-periods)).
- **Records (3.4 and 3.6).** Registration and transaction records kept "During the Term of this Agreement and for two (2) years thereafter", and an escrow deposit of registration data with ICANN or an approved agent "on a schedule, under the terms, and in the format specified by ICANN."
- **Abuse (3.18).** An abuse contact, a 24/7 law enforcement contact whose well-founded reports of illegal activity are reviewed within 24 hours, and, since April 2024, the DNS abuse mitigation duty ([DNS Abuse at the Registrar](/books/hosting-and-cloud/dns-abuse#what-the-amendments-require)).
- **Notices to ICANN (3.20).** Within seven days of a bankruptcy proceeding, certain convictions, or any unauthorized access to or disclosure of registrant account or registration data.
- **Termination (5.5).** Grounds include failing to cure a breach within 21 days of notice (5.5.4), being in fundamental and material breach "at least three (3) times within a twelve (12) month period" (5.5.6), and insolvency events.

Twelve specifications travel with it, including the Whois Accuracy Program, Registration Data Directory Service, Consensus and Temporary Policy, Privacy and Proxy Registrations, Data Retention, and Registrants' Benefits and Responsibilities. Amendments take a "Registrar Approval": registrars accounting for 90% of names under management, or a majority of voting registrars plus registrars holding two-thirds of the names (1.18).

**The registry agreement.** Under the base agreement every registration in the TLD "must be registered through an ICANN accredited registrar", the registry must offer "non-discriminatory access to Registry Services to all ICANN accredited registrars" that meet its criteria, and a registry that becomes affiliated with a registrar must tell ICANN, which may refer the arrangement to competition authorities (section 2.9). Section 2.10 is the one a registrar's billing system feels: at least 30 days' notice of a price increase for new registrations and generally 180 days for renewals, registrations and renewals of one to ten years at the current price, uniform renewal pricing unless the registrant expressly agreed to something else after clear disclosure, and discount programs capped at 180 days. The base agreement runs ten years and renews for ten-year periods absent uncured breaches (4.1, 4.2). .com and .net have their own agreements with Verisign, including the maximum-price rules in [Registry Economics](/books/hosting-and-cloud/new-gtlds-and-cctlds#registry-economics) and the functional specification whose grace periods [The Domain Lifecycle](/books/hosting-and-cloud/domain-lifecycle#grace-periods) tabulates.

**The registry-registrar agreement.** This is where a registrar's money meets the registry's system. The .com version requires "a payment security comprised of an irrevocable letter of credit or cash deposit"; "the amount of the Payment Security establishes Registrar's credit limit in the Verisign System", sized to expected monthly volume and raised as volume grows; Verisign draws on it for unpaid balances, and "if Registrar's Payment Security is depleted, registration of domain names for the Registrar will be suspended" (section 5.1(c)). A registrar's treasury function is therefore part of its availability: a holiday sale that outruns the credit limit fails at the registry with a billing error, not at the checkout.

## The Fee Stack

Every price a registrar shows is built on fees it must pay whether or not the customer does. For a .com name-year, as of October 2026:

| Layer | Amount | Paid by whom, to whom | Notes |
| --- | --- | --- | --- |
| **Registry fee** | $10.26, rising to $10.97 on 1 November 2026 | Registrar to Verisign, drawn from the payment security at the transaction | Verisign's own fee to ICANN is inside this price ([Registry Economics](/books/hosting-and-cloud/new-gtlds-and-cctlds#registry-economics)) |
| **ICANN transaction fee** | $0.20 per transaction-year for fiscal year 2027 | Registrar to ICANN, quarterly | Applies to each new registration, renewal or transfer year; ICANN's guide says the registrar "may bill it separately to registrants" |
| **ICANN variable shared fee** | $3.8 million a year divided among all registrars, with forgiveness for qualified registrars | Registrar to ICANN | A per-registrar charge that falls hardest on small registrars |
| **ICANN accreditation fee** | $4,000 a year per accreditation, after a $3,500 application fee | Registrar to ICANN | Fixed per accreditation, not per name |
| **Payment and fraud costs** | The card network's and processor's | Registrar to its processor | Chargebacks on a name already paid to the registry are a pure loss |
| **Margin and bundle** | What the market bears | Customer to registrar | Cents at an at-cost registrar; more where privacy, hosting or email ride along |

The stack has four consequences for the system:

- **The pass-through is owed at the transaction, not at the invoice.** The registry debits the registrar's credit the moment a create or renew succeeds. A customer whose card fails after the EPP command succeeded has cost the registrar a name-year; the order of operations (authorize, create, capture) and the Add Grace Period refund ([Grace Periods](/books/hosting-and-cloud/domain-lifecycle#grace-periods)) are how registrars limit that exposure.
- **Price changes arrive with notice the registrar must pass on.** A registry gives 180 days for renewals under the base agreement; Verisign announced the November 2026 .com rise in April 2026. A registrar that prepaid nothing and sells multi-year terms has to decide whether to honor old prices on renewals already sold, and its notices to customers are subject to automatic renewal law (the playbook's [The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal); Subscriptions, Renewals & Cancellation Law).
- **Premium names break the flat price.** Registries price some names in premium tiers, often with premium renewals, and registrars learn the price per name through the EPP fee extension ([Extensions](/books/hosting-and-cloud/epp-and-domain-data#extensions)). The base agreement's uniform-renewal rule allows a higher renewal only where the registrant agreed after clear disclosure, which makes the renewal price something the checkout must show and the record must keep.
- **Showing the fee or folding it in is a product choice, not a legal one.** Porkbun folds the ICANN fee into one price; Namecheap shows it as a line; Cloudflare charges exactly the registry's price. All three owe the same amounts to ICANN and the registry.

My rule, the one [the core model](/books/hosting-and-cloud/hosting-and-cloud-business#tenancy-money-and-time) sets: each layer is its own SKU, the registry fee and the ICANN fee marked `pass_through`, with effective-dated price versions, so a margin report, a tax engine and a reconciliation against the registry's invoice can each see what was the registrar's revenue and what was collected for someone else.

## Registrar Resellers

Resellers are where most of the registrar business actually meets customers: Tucows alone sells through more than 32,000 of them. The general reseller model, its data and its holds are [Resellers and White Label](/books/hosting-and-cloud/accounts-and-resellers#resellers-and-white-label); the registrar's twist is that the reseller has no contract with ICANN and the registrar has all the obligations. Under section 3.12 the registrar must have written agreements with every reseller that enable its own compliance, resellers must identify the sponsoring registrar when a customer asks, may not use ICANN's logo without permission, and the registrar stays responsible for their compliance.

In practice that means every duty in the RAA and the consensus policies reaches through the reseller to the end customer: the expiry notices, the auth code within five days, the registrant-data verification within 15 days, the abuse mitigation, the UDRP lock. A reseller that sends its own renewal notices still has to send them on ERRP's schedule; a reseller that runs its own support still can't sit on an auth code request. The registrar's system has to be able to perform each duty itself when the reseller doesn't, which is why the core model keeps `domains.reseller_account_id` and the registrant data of every sub-account's names on the registrar's side, not the reseller's ([How to Build It](#how-to-build-it)).

## Compliance and Enforcement

ICANN Contractual Compliance enforces the RAA and the policies through complaints from the public, its own monitoring and audits. Its published notices show the escalation shape:

1. **Informal resolution.** A first, second and third compliance notice, each with a deadline of about a week, plus phone calls to the registrar's contacts. A case closes here when the registrar sends evidence of compliance.
2. **Escalated notice and remediation plan.** Where a registrar has repeated a violation, Compliance escalates and can require a remediation plan with implementation dates.
3. **Notice of Breach.** A formal breach notice with a cure deadline; the Trustname.com notice of 10 June 2026 set 1 July 2026, the 21 days section 5.5.4 allows before termination.
4. **Termination.** ICANN terminates the RAA, revokes the logo license, and moves the registrar's names to another accredited registrar under the De-Accredited Registrar Transition Procedure. Fees and record-retention duties survive termination.

Two 2026 terminations show both ends of what Compliance enforces:

- **OPENNAME, LLC (1 April 2026).** Terminated under section 5.5.4 for failing to cure an unpaid accreditation fee breach by 4 March 2026, after compliance notices that had gone unanswered since September 2024; effective 17 April 2026. It sponsored no gTLD names, so the transition procedure didn't apply, and ICANN invoiced the remainder of its yearly fee anyway.
- **Fewmoretaps OU d/b/a Trustname.com (27 August 2026).** Terminated under 5.5.4 and 5.5.6 for failing to investigate abuse reports (3.18.1) and to mitigate DNS Abuse promptly (3.18.2): four Notices of Breach in 78 days, an admission that its investigations had wrongly required proof that credentials were actually collected rather than weighing "the totality of the available evidence", and ICANN's reputation data showing the median share of its names reported for phishing rising from about 0.7% in January 2026 to about 10% in August 2026. Termination took effect on 11 September 2026, and its names moved under the transition procedure.

Compliance asks for evidence, not assurances: each step in those chronologies is a request for records showing what the registrar did and when. ICANN's aggregate DNS abuse enforcement numbers are in [ICANN Enforcement](/books/hosting-and-cloud/dns-abuse#icann-enforcement). The practical point for a registrar is that its own records are its defense, and a registrar that can answer a compliance notice with a query rather than a ticket search answers on time.

## The Alternatives

A company that wants to sell domains has three ways in, and they differ in who holds the contracts:

| Route | What it holds | Fixed cost and work | Control | Who answers to ICANN |
| --- | --- | --- | --- | --- |
| **Reseller of a wholesale registrar** (OpenSRS and its peers) | A reseller agreement | No ICANN fees; the wholesaler's platform, storefront or API | The wholesaler's TLD list, lifecycle timings, transfer and abuse handling; prices and brand are the reseller's | The wholesale registrar |
| **Accredited registrar** | The RAA, plus an RRA and payment security with each registry it connects to | $3,500 to apply, $4,000 a year, working capital of US$70,000 "or more" deemed adequate, ICANN's per-transaction and variable fees, an EPP integration per registry back end, a compliance function | Full: lifecycle, transfers, abuse decisions, data, aftermarket | The registrar |
| **Registrar platform behind your brand** (an accredited registrar operating the names for a platform's customers) | A commercial agreement; the platform is a reseller under 3.12 | Integration with the registrar's API | Product experience; policy stays with the registrar | The registrar |

A ccTLD adds its own accreditation or membership per registry, outside ICANN ([ccTLDs](/books/hosting-and-cloud/new-gtlds-and-cctlds#cctlds)).

## My Default

My default for a host or platform that sells domains as part of something else is to resell through a wholesale registrar and to build the data model as if it were accredited. Accreditation buys control over the lifecycle, transfers, abuse decisions and the aftermarket, and it costs a compliance function that has to answer ICANN in days, a payment security per registry, an EPP integration per back end, and fees that are trivial per name but not per accreditation. Below a few hundred thousand names, or where domains are an attachment to hosting rather than the product, that trade rarely pays. I'd accredit when the wholesaler's timings or policies start to cost customers (an expiry or transfer flow I can't change, an abuse response I can't speed up), when the margin on the wholesale price matters at the volume sold, or when registry relationships are the business.

Either way the system should hold the registrant data, the expiry, the statuses, the reseller relationship and every customer-facing notice itself, so that moving from reseller to registrar, or from one wholesaler to another, is a bulk transfer and not a rebuild.

## How to Build It

The core model already has the `domains` side table, `resources` of kind `domain`, and SKUs that can be marked `pass_through` as `registry` or `icann`. This chapter adds the registries a registrar connects to, what each charges, and the sponsorship facts on each name.

```sql
CREATE TABLE registries (                -- one row per TLD the registrar can sell
  tld               TEXT PRIMARY KEY,    -- A-label without the dot: 'com', 'xn--p1ai'
  operator          TEXT NOT NULL,       -- the Registry Operator under contract
  backend_operator  TEXT,                -- the technical back end, when different
  tld_type          TEXT NOT NULL CHECK (tld_type IN ('gtld', 'sponsored_gtld',
                      'brand_gtld', 'cctld')),
  agreement         TEXT NOT NULL CHECK (agreement IN ('base_ra', 'com_ra', 'net_ra',
                      'legacy_ra', 'cctld_local')),
  access_via        TEXT NOT NULL CHECK (access_via IN ('epp_direct', 'wholesale_registrar')),
  epp_host          TEXT,                -- null when sold through a wholesaler
  rra_effective_at  TIMESTAMPTZ,         -- the registrar's Registry-Registrar Agreement
  credit_currency   CHAR(3),
  payment_security  BIGINT,              -- minor units; the credit limit at this registry
  min_term_years    SMALLINT NOT NULL DEFAULT 1,
  max_term_years    SMALLINT NOT NULL DEFAULT 10,
  status            TEXT NOT NULL CHECK (status IN ('onboarding', 'live', 'sales_paused',
                      'retired')),
  CHECK ((access_via = 'epp_direct') = (epp_host IS NOT NULL)),
  CHECK (max_term_years <= 10)
);

CREATE TABLE tld_pricing (               -- what the registry charges the registrar, over time
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tld            TEXT NOT NULL REFERENCES registries (tld),
  operation      TEXT NOT NULL CHECK (operation IN ('create', 'renew', 'auto_renew',
                   'transfer', 'restore')),
  price_tier     TEXT NOT NULL DEFAULT 'standard',  -- or the registry's premium tier code
  currency       CHAR(3) NOT NULL,
  amount         NUMERIC(14,4) NOT NULL CHECK (amount >= 0),  -- minor units per name-year
                                         -- (per restore for 'restore')
  sku_id         UUID NOT NULL REFERENCES skus (id),  -- pass_through = 'registry'
  valid_during   TSTZRANGE NOT NULL,
  announced_at   TIMESTAMPTZ NOT NULL,   -- the registry's notice; renewal notice runs from here
  source_ref     TEXT,                   -- the registry notice or contract appendix
  EXCLUDE USING GIST (tld WITH =, operation WITH =, price_tier WITH =, currency WITH =,
    valid_during WITH &&)
);

ALTER TABLE domains
  ADD COLUMN sponsoring_registrar_iana_id INT,   -- the registrar's own, or the wholesaler's
  ADD COLUMN reseller_account_id  UUID REFERENCES accounts (id),  -- kind = 'reseller'
  ADD COLUMN price_tier           TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN renewal_price_disclosed BIGINT,     -- a premium renewal the registrant agreed to
  ADD CONSTRAINT domains_tld_fk FOREIGN KEY (tld) REFERENCES registries (tld);

-- The pass-through SKUs: one per TLD for the registry, one for ICANN.
INSERT INTO skus (product_id, code, meter, unit, charge_kind, pass_through)
SELECT p.id, v.code, 'domain.name_years', 'name_year', 'one_time', v.pass_through
FROM products p,
     (VALUES ('domain.com.registry_fee', 'registry'),
             ('domain.icann_fee',        'icann')) AS v (code, pass_through)
WHERE p.code = 'domains';

-- Per-name-year cost and margin for a renewal today.
CREATE VIEW renewal_margin AS
SELECT d.resource_id, d.name, r.tld,
       tp.amount                       AS registry_minor,
       icann.unit_price                AS icann_minor,
       retail.unit_price               AS retail_minor,
       retail.unit_price - tp.amount - icann.unit_price AS margin_minor
FROM domains d
JOIN registries r      ON r.tld = d.tld
JOIN tld_pricing tp    ON tp.tld = d.tld AND tp.operation = 'renew'
                      AND tp.price_tier = d.price_tier AND tp.valid_during @> NOW()
JOIN skus icann_sku    ON icann_sku.code = 'domain.icann_fee'
JOIN price_versions icann  ON icann.sku_id = icann_sku.id AND icann.price_book = 'list'
                          AND icann.valid_during @> NOW()
JOIN skus retail_sku   ON retail_sku.code = 'domain.' || d.tld || '.renew'
JOIN price_versions retail ON retail.sku_id = retail_sku.id AND retail.price_book = 'list'
                          AND retail.valid_during @> NOW()
WHERE d.role = 'registered_here';
```

Notes on the sketch:

- **A registry is a row per TLD, with its operator and back end as columns.** Contracts, prices, grace periods and policies are per TLD, while integrations are per back end, so `backend_operator` lets the EPP layer share a client across the TLDs one provider runs. [The Domain Lifecycle](/books/hosting-and-cloud/domain-lifecycle#how-to-build-it) adds the grace-period columns and [New gTLDs & ccTLDs](/books/hosting-and-cloud/new-gtlds-and-cctlds#how-to-build-it) the eligibility and launch-phase columns.
- **Wholesale and direct are the same model.** A TLD reached through a wholesale registrar is `access_via = 'wholesale_registrar'` and the sponsoring registrar is the wholesaler's IANA ID; the rest of the system doesn't change, which is what makes the later move to accreditation a data migration.
- **Cost and price are different tables.** `tld_pricing` is the registry's price to the registrar, effective-dated with the registry's announcement; the customer's price is a `price_versions` row on the retail SKU. The renewal notice system reads `announced_at` to know how much notice it can give, and the margin view shows what a price rise does to every renewal before it happens.
- **The ICANN fee is a SKU with a price, not a constant.** Registrars vote on it each fiscal year under section 3.9.2; a price version per ICANN fiscal year keeps every past invoice reproducible.
- **The payment security is a limit to monitor.** A job compares the registry's reported balance against `payment_security` and alerts before the credit runs out, because the failure mode is every create and renew at that registry returning a billing error at once.
- **Resellers are a column, not a separate registry of names.** `reseller_account_id` ties each name to the reseller that sold it, so the registrar can perform any RAA duty directly, cascade a reseller's non-payment hold ([Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing)) and answer Compliance about a reseller's customer.
- **Events:** `registry.price_announced`, `registry.credit_low`, `registry.status_changed` and `domain.sponsor_changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing, the renewal-notice scheduler, finance and support.

## Auditing

- **Every pass-through, reconciled.** Registry and ICANN fees charged per name-year against the registry's monthly invoice and ICANN's quarterly bill, per TLD, so a mismatch is found before a registry draws on the payment security.
- **Every price and its notice.** Registry announcements with their dates, the retail price versions derived from them, and the customer notices sent, because notice is measured from the announcement.
- **What the registrant agreed to.** The registration agreement version, the renewal price shown (including any premium renewal), and the deletion and auto-renewal policy displayed at the time ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data)).
- **Records for the RAA's retention period.** Registration and transaction records for the term of the agreement plus two years, and the escrow deposits ICANN specifies, kept so they survive a migration or a wholesaler change.
- **Compliance correspondence as cases.** Each ICANN notice with its deadline, the evidence sent and the outcome, so a pattern of repeated notices (the 5.2 and 5.5.6 thresholds) is visible to the registrar before it is visible to ICANN.
- **Reseller responsibility.** Which reseller sold each name, the agreement in force, and every duty the registrar performed directly because the reseller didn't.

## What This Means for the System You Build

- **Model the chain explicitly:** registry, registrar (yours or a wholesaler's), reseller and registrant on every name.
- **Make each fee its own SKU,** registry and ICANN marked pass-through, with effective-dated prices and the registry's announcement date.
- **Watch the registry credit limit** like an availability metric, and order authorize, create and capture so a failed payment costs an Add Grace Period delete, not a name-year.
- **Carry the RAA's required terms into the registration agreement** and keep the version each registrant accepted.
- **Perform every registrar duty yourself when a reseller doesn't,** and keep the data that lets you.
- **Answer compliance with queries:** receipts, timestamps and actions as records, organized by the clause they satisfy.
- **Resell until accreditation pays,** but build as if accredited so the switch is a migration.

## References

**Contracts and policies**

- [ICANN: 2013 Registrar Accreditation Agreement](https://www.icann.org/resources/pages/approved-with-specs-2013-09-17-en), accreditation fee and variable fees (3.9), registration agreement terms (3.7.7), renewal and deletion (3.7.5), records (3.4), escrow (3.6), resellers (3.12), abuse (3.18), notices (3.20), renewal (5.2), termination (5.5), specifications, Registrar Approval (1.18)
- [ICANN: Base gTLD Registry Agreement (21 January 2024)](https://itp.cdn.icann.org/en/files/registry-agreements/base-registry-agreement-21-01-2024-en.html), registration only through accredited registrars and non-discriminatory access (2.9), price-change notice, terms and uniform renewal pricing (2.10), term and renewal (4.1, 4.2)
- [ICANN: Base Registry Agreement versions](https://www.icann.org/en/registry-agreements/base-agreement), the 21 January 2024 approval and earlier versions
- [SEC: Third Amendment to the .com Registry Agreement (27 March 2020)](https://www.sec.gov/Archives/edgar/data/1014473/000101447320000010/vrsn8-k32720xex101.htm), the Maximum Price clause and the Registry-Registrar Agreement's payment security, credit limit and suspension (Appendix 8A, 5.1(c))

**ICANN**

- [ICANN: History of the Shared Registry System](https://www.icann.org/en/contracted-parties/accredited-registrars/resources/history), Amendment 11 (October 1998), the accreditation policy (4 March 1999), the testbed dates, the 2001 and 2009 RAAs
- [ICANN: 2013 RAA approved by the Board (28 June 2013)](https://www.icann.org/en/blogs/details/2013-raa-approved-by-icann-board-of-directors-28-6-2013-en), the approval announcement
- [ICANN: Historical resolution tracking, approval of the 2013 RAA](https://archive.icann.org/historical-resolution-tracking-feature/approval-2013-raa.html), resolution 2013.06.27.07, the GAC Beijing advice, the abuse contact, verification and reseller changes
- [ICANN: Registrar accreditation financials](https://www.icann.org/en/resources/registrars/accreditation/financials), the $3,500 application fee, $4,000 yearly fee, transaction fee billing and US$70,000 working capital
- [ICANN: FY27 registrar fees approved](https://itp.cdn.icann.org/en/files/communications/registrar-fee-approved-fy27-30-07-2026-en.pdf), USD 0.20 per transaction-year and the USD 3.8 million variable shared fee
- [ICANN: Notice of termination, OPENNAME, LLC (1 April 2026)](https://www.icann.org/uploads/compliance_notice/attachment/1319/hedlund-to-gromov-01apr26.pdf), unpaid fees under 3.9, the cure deadline, effective date and transition procedure
- [ICANN: Notice of termination, Fewmoretaps OU d/b/a Trustname.com (27 August 2026)](https://www.icann.org/uploads/compliance_notice/attachment/1367/hedlund-to-nestsiarovich-27aug26.pdf), sections 3.18.1, 3.18.2, 5.5.4 and 5.5.6, four Notices of Breach in 78 days, phishing share, compliance chronologies, De-Accredited Registrar Transition Procedure

**Specifications**

- [RFC 2832: NSI Registry Registrar Protocol (RRP) Version 1.1.0](https://www.rfc-editor.org/rfc/rfc2832), domain and nameserver objects only, SSL on TCP port 648, no registrant services (May 2000)

**Providers**

- [SEC: GoDaddy Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), domains under management and share, GoDaddy Registry's TLDs, the aftermarket portfolio, Verisign and ICANN fees, dependence on registries
- [SEC: Tucows Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/909494/000143774926008009/tcx20251231_10k.htm), wholesale brands, more than 32,000 resellers, 21.5 million names and the 2025 decline, .com and ICANN fee exposure
- [Cloudflare: Registrar](https://www.cloudflare.com/products/registrar/), at-cost pricing and over 430 TLDs
- [Cloudflare: Renew domains](https://developers.cloudflare.com/registrar/account-options/renew-domains/), renewal at the registry's list price, auto-renew on by default
- [Porkbun: Domains](https://porkbun.com/products/domains), the .com price with ICANN fees included and bundled privacy and certificates
- [Namecheap: Generic TLDs' grace periods](https://www.namecheap.com/support/knowledgebase/article.aspx/9916/2207/tlds-grace-periods), the ICANN fee shown as a separate charge
- [Droid Life: Alphabet sells Google Domains business to Squarespace (16 June 2023)](https://www.droid-life.com/2023/06/16/alphabet-sells-google-domains-business-to-squarespace-for-180m/), about 10 million domains
- [SEC: Squarespace Form 10-Q for Q3 2023](https://www.sec.gov/Archives/edgar/data/1496963/000149696323000073/sqsp-20230930.htm), the Google Domains asset purchase, closing date and $180.7 million consideration
- [Network Solutions: Register.com is becoming Network Solutions](https://www.networksolutions.com/help/article/ns-faqs-registerdotcom-becoming-network-solutions), brand consolidation
- [IONOS Group: FY2025 results (19 March 2026)](https://www.ionos-group.com/fileadmin/Publications/Pressemitteilungen/20260319_IONOS_FY_2025_Results_EN.pdf), the AdTech (Sedo) business reported as discontinued
- [SEC: Verisign first quarter 2026 results (23 April 2026)](https://www.sec.gov/Archives/edgar/data/0001014473/000101447326000019/q12026earningsrelease.htm), the .com fee rise to $10.97 on 1 November 2026 and 176.1 million .com and .net names
