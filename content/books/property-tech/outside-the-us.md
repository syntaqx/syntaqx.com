+++
title = "Outside the US"
description = "How a rental platform changes in Canada, the UK, Australia and the EU: tenancy law, third-party deposit custody, rent rules, privacy, tax and payment rails."
category = "Property Tech Industry"
order = 1735
part = "The Rules"
tags = ["property-tech", "international", "canada", "united-kingdom", "australia", "european-union"]
+++

The data model in this volume travels well. A unit is a unit in Toronto, Manchester, Sydney and Berlin; a lease is a contract for a term with a landlord of record; a ledger is a ledger. What doesn't travel is the set of assumptions a US platform bakes in without noticing: that the landlord holds the security deposit, that a lease has a fixed end date, that rent can be repriced at renewal subject only to local caps, that a federal consumer reporting law governs screening, that ACH is how rent moves, that the currency is dollars and sales tax doesn't touch rent. Each of those is false somewhere a US vendor might expand, and several are false everywhere outside the US.

This chapter is a map of what changes, country by country, at the level a platform needs: who holds the deposit, how rent may change, what form the tenancy takes, who regulates landlords, which privacy law applies, and how money moves. It isn't a legal guide to any of them; the rules here are inputs to [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law), which stores them like any state's, and local counsel decides what they mean. Status is as of October 2026.

## How the Platforms Do It

The large US suites sell abroad unevenly, and the products show where the assumptions break:

- **Payments terms stop at the border.** Yardi's RentCafe terms of service include a clause under which Yardi acts "as a payment collection agent of the Payee, solely for the limited purpose of accepting and processing such payments," under a heading that reads "Applicable only in the United States (and not applicable in Canada)." The legal structure that lets a US platform hold rent in transit (Collecting Rent covers it) doesn't carry over by default.
- **UK product lines are different products.** MRI Software's UK site lists Social Housing, Block Management, Build-to-Rent, Lease Accounting, Revenues & Benefits and Social Housing Support Portals alongside Property Management and Commercial Property. Social housing and leasehold block management are large markets with their own regulation and no close US equivalent.
- **Regional editions exist because rules differ.** Where vendors sell in several countries, they generally do it with country editions on a shared core rather than one product with switches, which is the right instinct: the shared core is the data model; the country edition is rules, documents, rails and tax.

My rule: treat a new country as a new set of jurisdictions in the same rules model, plus a short list of structural changes (deposit custody, tenancy form, rails, tax, privacy) that need code. Everything else should be rows.

## Canada

Residential tenancy in Canada is provincial law with a tribunal in each province, and the provinces differ more from each other than US states do on rent regulation.

**Ontario** runs a rent increase guideline set by the province: 2.5% for 2024 and 2025, 2.1% for 2026 and 1.9% for 2027. It's calculated from the Ontario Consumer Price Index (June to May data sets the next year's guideline) and capped at 2.5%. A landlord must give written notice on the Landlord and Tenant Board's form at least 90 days before an increase, and generally at least 12 months must have passed since the last increase or the start of the tenancy. Units first occupied for residential purposes after November 15, 2018 are exempt from the guideline, as are categories such as community housing and long-term care homes; landlords must prove an exemption if it's disputed. Most private residential landlords must use the province's **standard lease** template for new leases, and a tenant who asks in writing for one and doesn't get it within 21 days may withhold one month's rent. The Landlord and Tenant Board is "the tribunal with the authority to resolve disagreements between landlords and tenants."

For a platform, Ontario changes three things. The rent cap is a published annual figure with a building-age exemption keyed to a fixed date, which is the same shape as Oregon's ([Rules as Effective-Dated Data](/books/property-tech/landlord-tenant-law#rules-as-effective-dated-data)). The lease document is a government form, so the platform fills a prescribed template instead of generating its own and keeps the prescribed version as of signing. Notices are prescribed forms too, and serving the wrong form version is a defect.

**Quebec** works differently: there's no fixed cap. At renewal a lessor "is free to ask a rent increase that he deems just and reasonable"; the lessee may accept or refuse within one month of the notice, and if they refuse, the lessor must apply to the Tribunal administratif du logement (TAL) within one month to fix the rent. The TAL publishes a calculation tool that applies the Regulation respecting the criteria for the fixing of rent, and a lessor who goes to a hearing must document the building's revenue and expenses. Significant regulatory changes took effect on January 1, 2026, covering the mandatory content of a rent increase notice, mandatory lease forms and the criteria for fixing rent. Quebec's Bill 31, "An Act to amend various legislative provisions with respect to housing," was assented to on February 21, 2024. For a platform, Quebec means a renewal workflow with a refusal branch and a tribunal filing deadline, a rent calculation that needs the building's operating data rather than a percentage, mandatory forms, and French as a first-class language.

**British Columbia** has its own Residential Tenancy Branch for "information, education, resources and dispute resolution services for tenants and landlords," and every province follows the same pattern: a provincial act, a tribunal or branch, prescribed forms and provincial rules on increases and deposits. The model is one `jurisdictions` row per province (`CA-ON`, `CA-QC`, `CA-BC`) with its rules; city-level rules are rarer than in the US.

**Privacy.** PIPEDA applies to private-sector organizations handling personal information in commercial activity across Canada, but Alberta, British Columbia and Quebec have private-sector privacy laws deemed substantially similar, and organizations under them are generally exempt from PIPEDA for information collected, used or disclosed within the province; PIPEDA still applies to information that crosses provincial or national borders. A platform with tenants in several provinces handles at least two privacy regimes ([GDPR & Privacy Law](/docs/compliance/gdpr) describes the shared concepts).

## The United Kingdom

The UK is four tenancy systems. England and Wales share deposit protection law but now have different tenancy statutes; Scotland and Northern Ireland have their own law and their own deposit schemes.

**Deposits are held or insured by a government-backed scheme, not just by the landlord.** In England and Wales, a landlord or letting agent must put a tenant's deposit in a government-backed scheme within 30 days of receiving it. Section 213 of the Housing Act 2004 requires the scheme's initial requirements to be met, and the prescribed information given to the tenant, within 30 days of receipt. There are three schemes (the Deposit Protection Service, MyDeposits and the Tenancy Deposit Scheme) in two types: **custodial**, where the scheme holds the money free, and **insured**, where the landlord or agent holds it and pays the scheme to insure it. The deposit must be returned within 10 days of the parties agreeing how much the tenant gets back. The Tenant Fees Act 2019 caps the deposit itself at five weeks' rent where annual rent is under £50,000 and six weeks' otherwise, and caps a holding deposit at one week's rent; anything above is a prohibited payment.

For a platform, deposit protection is a workflow with a deadline and a third party: register with a scheme (or transfer the money to it), receive a scheme reference, serve the prescribed information to every tenant, and record all three inside 30 days. At the end of the tenancy the return runs through the scheme, including its dispute process. Deposit accounting, which in the US is a ledger the landlord controls, becomes a reconciliation against a scheme's records. The `deposit_protections` table in [How to Build It](#how-to-build-it) holds it.

**The Renters' Rights Act 2025 has changed English tenancies.** The Act (2025 c. 26), which received Royal Assent on 27 October 2025, has five parts: tenancy reform, residential landlords, the decent homes standard, enforcement, and general provisions. Its main tenancy reforms commenced on 1 May 2026 under the Renters' Rights Act 2025 (Commencement No. 2 and Transitional and Saving Provisions) Regulations 2026, and the government's guide for landlords lists what changed that day:

- **Section 21 "no fault" evictions are abolished;** landlords can only evict with a specific, legally valid reason under the possession grounds.
- **Fixed terms are gone.** Most tenancies are assured periodic tenancies that continue until a party ends them.
- **Rent increases are limited to once a year,** through the statutory process, with at least two months' notice.
- **Rental bidding is banned.** A written advertisement must state a specific price, and a landlord can't ask for, encourage or accept higher offers.
- **Rent in advance is capped** at one month's rent between signing and the start of the tenancy.
- **Pet requests** must be considered and answered within a set time, and refusals need valid reasons.
- **Discrimination against renters with children or on benefits** is unlawful.

Later phases have dates or are pending as of October 2026. The government's "register your rental property" service begins a regional rollout across England on 15 December 2026, starting in the West Midlands. The private rented sector ombudsman, Awaab's Law and the Decent Homes Standard for private renting are to follow, with no dates published on the landlord guide. Section 213's wording was amended for the new tenancy types from 1 May 2026; its 30-day deposit requirements are unchanged.

For a platform, the Act is the biggest structural change in this chapter. The lease state machine (The Lease owns it) loses its fixed end date for most English tenancies, so renewals become rent reviews on a periodic tenancy, and "lease expiring" stops being a trigger. Notices to end a tenancy need a ground, with ground-specific notice periods and evidence. Rent increases become a once-a-year rule with a statutory notice, which is a `rent_cap`-free version of the frequency and notice rules in [the matrix](/books/property-tech/landlord-tenant-law#the-rules-matrix). Listings need a stated price and no bidding flow. A landlord registration number becomes a property attribute the platform must hold and, likely, display.

**Scotland** has had open-ended tenancies since its Private Housing (Tenancies) (Scotland) Act 2016 created the private residential tenancy. A landlord increases rent by notice with a minimum notice period of three months (section 22). The Act's rules on the frequency of increases have been amended by a 2025 Act of the Scottish Parliament (asp 13), which also adds rent control areas, and those amendments are commencing in stages, so they are rules to track rather than assume.

**Wales** replaced tenancies with **occupation contracts** under the Renting Homes (Wales) Act 2016: tenants are "contract-holders," and contracts are secure or standard, with standard contracts periodic or fixed-term. A platform's vocabulary needs to bend: the Welsh contract types and terms are what the documents and notices must say.

**Social housing** is a separate regulated market. In England, the Regulator of Social Housing, "an executive non-departmental public body, sponsored by the Ministry of Housing, Communities and Local Government," keeps a register of social housing providers and sets regulatory standards that "set the outcomes that social landlords in England must deliver for tenants"; two standards are dated 1 October 2026, a Consumer Standards Code of Practice and a Competence and Conduct Standard. Housing associations and councils run on different rent-setting, allocation and reporting rules from private landlords, which is why UK software vendors sell social housing as its own product line. The nearest US analog is the agency side of Subsidized & Affordable Housing, and the same advice applies: it's an edition, not a setting.

**Privacy.** The UK GDPR applies, with the same concepts as the EU's. Tenant referencing and deposit scheme data are personal data with lawful bases to document ([Lawful Bases](/docs/compliance/gdpr#lawful-bases)).

## Australia

Residential tenancy is state and territory law in Australia, and the striking difference is the deposit: in most states the bond is lodged with a government authority, not held by the landlord.

In **New South Wales**, a bond "cannot be more than 4 weeks rent," and bonds are held by NSW Fair Trading. Rental Bonds Online is "a secure digital service to lodge, manage and refund rental bonds held by NSW Fair Trading": a registered agent or landlord invites the tenant by email, the tenant pays by Visa, Mastercard or BPAY, Fair Trading issues a receipt, and refunds are claimed through the service to an Australian bank account. Rent increases are limited: after an increase the landlord must wait at least 12 months before another, rent can't rise in the first 12 months of a tenancy, written notice of at least 60 days is required, and a tenant who considers an increase excessive can apply to the NSW Civil and Administrative Tribunal within 30 days of the notice (some fixed-term agreements of under two years entered before 13 December 2024 follow different rules).

For a platform, a state-held bond is the UK custodial scheme without the choice: the landlord never holds the money, so there's no deposit liability on the landlord's ledger, only a lodgement reference, a status and a claim at the end. Each state has its own authority and its own integration, so `deposit_protections` rows carry the scheme per state.

**Privacy.** The Privacy Act 1988 regulates Australian Government agencies, organisations with "an annual turnover of more than $3 million," and some other organisations, through 13 Australian Privacy Principles. Small landlords and agencies may sit below the threshold while the platform serving them does not, so the platform's own obligations don't shrink with its customer's size.

## The European Union

The EU harmonizes privacy and accounting standards; tenancy law stays national, and often regional within a country.

**Privacy is GDPR everywhere,** with the controller and processor split the playbook describes: the landlord or manager is the controller for tenant data, and the platform is a processor under a data processing agreement ([Controllers, Processors and the DPA](/docs/compliance/gdpr#controllers-processors-and-the-dpa)). Transfers of tenant data to a US-hosted platform need a transfer mechanism ([International Transfers](/docs/compliance/gdpr#international-transfers)), which is why EU customers often require EU hosting.

**Germany** shows how much rent and deposit law national codes carry:

- **Deposits** may not exceed three times the monthly rent, excluding operating costs charged as a flat fee or prepayment; the tenant may pay in three equal monthly instalments; and the landlord must deposit the money with a bank at the customary rate for savings with three months' notice, separate from the landlord's own assets, with the interest belonging to the tenant (BGB § 551). A deposit here is a segregated, interest-bearing account per tenancy, with instalment schedules, which is closer to US trust accounting than to the US habit of one pooled deposit account.
- **Rent at the start of a tenancy** is limited in areas designated by state ordinance as tight housing markets: it may exceed the local comparative rent by at most 10% (BGB § 556d, the *Mietpreisbremse*), and the designations must expire no later than 31 December 2029. The cap is relative to a local comparative rent, so the rule needs reference data (the comparative rent for the unit's location and type) as well as a percentage.

**Spain's** Ley 12/2023 on the right to housing, in force since 26 May 2023, lets the competent administrations declare *stressed residential market areas*. In those areas, the rent for a new contract on a previously rented home is generally limited to the previous contract's rent with its annual update, and *large holders* (owners of more than ten urban residential properties or more than 1,500 square meters of residential space, a threshold a regional declaration can lower to five properties in the area) may not exceed a reference price index. The law also makes property management and contract formalization costs payable by the landlord. For a platform, the landlord's whole portfolio size becomes an input to the rent rule, the same kind of owner fact California's deposit exception needs, and the declaration of each stressed area is a jurisdiction with its own `valid_during`.

**Tax and accounting.** Rent and service charges may or may not carry VAT depending on the country and what is supplied, so tax is a rule per charge code and jurisdiction rather than a column of zeros, decided with tax advisers. On the occupier side, IFRS 16 requires lessees to recognise assets and liabilities for leases with a term of more than 12 months unless the underlying asset is of low value, for annual periods beginning on or after 1 January 2019; Commercial Property covers what that means for lease administration software sold to corporate tenants.

## What a US Platform Must Re-Plan

The rows are the easy part. These are the structural changes that need code before a first property outside the US goes live:

| Area | US assumption | What changes | Where it lands |
| --- | --- | --- | --- |
| **Currency** | Dollars, two decimals | Each property's ledger has a currency; owners with properties in two countries get statements per currency | [Money & Amounts](/docs/payments/money#currency-is-always-explicit) |
| **Deposits** | The landlord holds the deposit | A scheme or authority holds or insures it (UK, Australia); a segregated interest-bearing account per tenancy (Germany) | `deposit_protections`; deposit accounting |
| **Tenancy form** | Fixed term with renewals | Periodic by default (England, Scotland); occupation contracts (Wales); prescribed lease forms (Ontario, Quebec) | The lease state machine and documents |
| **Rent changes** | Reprice at renewal, local caps | Annual guideline (Ontario), tribunal-fixed rent (Quebec), frequency limits (NSW, England), comparative rent (Germany), portfolio-size rules (Spain) | `legal_rules` types `rent_cap`, `rent_increase_notice` |
| **Ending tenancies** | Non-renewal is available | Grounds required (England after 1 May 2026, Scotland) | Delinquency, Collections & Eviction; The Lease |
| **Landlord registration** | Rare, local | National or regional registers (England from December 2026) | A property attribute and a `landlord_registration` rule |
| **Screening** | FCRA and US bureaus | Local credit agencies and referencing practices, without the FCRA's adverse action model | Applications & Screening |
| **Privacy** | State laws, sector carve-outs | GDPR or UK GDPR; PIPEDA and provincial laws; the Privacy Act 1988; data residency demands | [GDPR & Privacy Law](/docs/compliance/gdpr) |
| **Language** | English, some Spanish | French as a legal language in Quebec, Welsh documents, national languages across the EU | [Internationalization](/docs/frontend/internationalization) |
| **Tax** | Rent is outside sales tax | VAT or GST may apply to some charges; tax codes per charge code and jurisdiction | `charge_codes`, an `indirect_tax` rule type |
| **Payment rails** | ACH, cards, cash networks | Bacs Direct Debit in the UK, pre-authorized debits in Canada, BECS direct entry in Australia, SEPA Direct Debit in the EU | Collecting Rent; the [Payments](/books/payments/ach) volume |
| **Time and dates** | US time zones and holidays | Local business days for notice periods and debit dates | [Business Dates](/docs/fundamentals/time#business-dates-business-days-and-holidays) |

Two of the rails carry their own consumer rules the platform must honor. Under the UK's Direct Debit Guarantee, the payee normally notifies the payer 10 working days in advance of a change in amount, date or frequency, and the payer is "entitled to a full and immediate refund" of an amount taken in error. Australia's direct entry system, administered by AusPayNet as the Bulk Electronic Clearing System, is the batch rail for debits and credits "available for payments up to $100 million." Each rail has different return timing, mandate rules and failure codes, which the Payments volume's rail chapters describe for the US and which need equivalents per country.

My rule: build the first non-US country as if it were the second. Put currency, deposit custody, tenancy form, rails and tax behind the same interfaces the US uses, add the country's jurisdictions and rules as rows, and keep the US as one configuration among several. A platform that adds Canada by branching on `country = 'CA'` will add the UK by branching again, and the branches will meet in the ledger.

## How to Build It

These are deltas against [the core data model](/books/property-tech/property-business#the-core-data-model) and the rules model in [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#how-to-build-it). Jurisdictions outside the US are rows in `jurisdictions` (`CA-ON`, `CA-QC`, `GB-ENG`, `GB-SCT`, `GB-WLS`, `AU-NSW`, `DE`, `ES`), and `properties.subdivision` already holds an ISO 3166-2 code that can be any country's.

```sql
ALTER TABLE properties
  ADD COLUMN ledger_currency       CHAR(3) NOT NULL DEFAULT 'USD',  -- ISO 4217; set at creation
  ADD COLUMN landlord_registration TEXT;   -- e.g. a national register number, where required

ALTER TABLE leases
  ADD COLUMN tenancy_form TEXT NOT NULL DEFAULT 'fixed_term' CHECK (tenancy_form IN (
    'fixed_term', 'periodic', 'assured_periodic', 'private_residential',
    'occupation_secure', 'occupation_standard')),
  ADD COLUMN prescribed_form_version TEXT; -- the government lease form used, where one is mandatory

CREATE TABLE deposit_schemes (             -- platform-wide: schemes and bond authorities
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions (id),
  name            TEXT NOT NULL,           -- 'Deposit Protection Service', 'NSW Fair Trading'
  custody         TEXT NOT NULL CHECK (custody IN ('custodial', 'insured', 'authority')),
  integration     TEXT NOT NULL CHECK (integration IN ('api', 'file', 'portal_manual'))
);

CREATE TABLE deposit_protections (         -- one per deposit or bond protected
  id                        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                 UUID NOT NULL,
  lease_id                  UUID NOT NULL REFERENCES leases (id),
  scheme_id                 UUID NOT NULL REFERENCES deposit_schemes (id),
  amount                    BIGINT NOT NULL CHECK (amount > 0),
  currency                  CHAR(3) NOT NULL,
  received_on               DATE NOT NULL,          -- starts the protection clock
  protect_by                DATE NOT NULL,          -- computed from a deposit_protection rule
  rule_evaluation_id        UUID NOT NULL REFERENCES rule_evaluations (id),
  scheme_reference          TEXT,                   -- the scheme's or authority's id
  protected_on              DATE,
  prescribed_info_served_on DATE,                   -- per tenant in practice; see the events
  status                    TEXT NOT NULL CHECK (status IN ('pending', 'protected',
                              'release_requested', 'disputed', 'released', 'late')),
  released_on               DATE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (protected_on IS NULL OR scheme_reference IS NOT NULL)
);

CREATE TABLE deposit_protection_events (   -- append-only: lodged, info served, claim, award
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  deposit_protection_id UUID NOT NULL REFERENCES deposit_protections (id),
  event                 TEXT NOT NULL CHECK (event IN ('lodged', 'confirmed',
                          'prescribed_info_served', 'release_requested', 'dispute_opened',
                          'adjudicated', 'released', 'transferred')),
  person_id             UUID REFERENCES people (id),  -- the tenant served or paid
  amount                BIGINT,
  document_id           UUID,                         -- the certificate or notice served
  occurred_on           DATE NOT NULL,
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deposits nearing their protection deadline, across a tenant.
SELECT dp.id, dp.lease_id, dp.protect_by
FROM deposit_protections dp
WHERE dp.tenant_id = $1
  AND dp.status = 'pending'
  AND dp.protect_by <= CURRENT_DATE + 7
ORDER BY dp.protect_by;
```

Design decisions behind it:

- **New rule types, same registry.** `deposit_protection` (deadline, prescribed information, schemes allowed), `mandatory_lease_form`, `landlord_registration` and `indirect_tax` join the registry in Landlord-Tenant Law as Data; rent and notice rules outside the US reuse `rent_cap` and `rent_increase_notice` with richer parameters (a published figure, a comparative-rent reference, a tribunal process).
- **A protected deposit is not the landlord's balance.** When a scheme or authority holds the money, the landlord's ledger records a transfer out to the scheme and a claim back at the end, not a liability sitting in the landlord's bank account; the trust accounting for that is Trust Accounting & the General Ledger's.
- **Currency is per property ledger,** fixed at creation, and every amount carries its currency ([Currency Is Always Explicit](/docs/payments/money#currency-is-always-explicit)); cross-currency owner reporting converts at reporting time with a recorded rate, never in the ledger.
- **Tenancy form is a lease attribute,** because England, Scotland and Wales define different contracts and the lease state machine branches on it, not on country.
- **Prescribed forms are versioned documents** recorded on the lease as signed, the same discipline as any lease template.

## Auditing

What an auditor, tribunal or scheme adjudicator asks for outside the US:

- **Deposit protection proof.** For each deposit: when it was received, when it was protected and with which scheme, the scheme reference, and when prescribed information was served on each tenant, against the 30-day clock in England and Wales. A missing date here is the gap a tenant's claim exploits.
- **Prescribed forms and notices.** The form version used for each lease and each rent increase or termination notice, and the date served.
- **Rent changes against the rule in force.** For each increase, the `rule_evaluations` row with the guideline or frequency rule applied, as in the US.
- **Privacy records per regime.** Processing records, data processing agreements, transfer mechanisms and access request handling under GDPR, UK GDPR, PIPEDA or the provincial laws, and the Privacy Act 1988 ([Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits#state-privacy-laws) covers the US side).
- **Currency and rates.** For reports that convert, the rate, its source and its date.

## What This Means for the System You Build

- **Add countries as jurisdictions and rules,** not as branches in code; the rules model in Landlord-Tenant Law as Data holds them.
- **Model deposit custody explicitly:** landlord-held, scheme-held, scheme-insured or authority-held, with deadlines and third-party references.
- **Make tenancy form a lease attribute** and let the lease state machine work without a fixed end date.
- **Support prescribed lease and notice forms** as versioned documents filled by the platform.
- **Put currency on every property ledger** and never convert inside it.
- **Treat indirect tax as rule data** per charge code and jurisdiction.
- **Plan rails per country** (Bacs, pre-authorized debits, BECS, SEPA) behind the same payment interfaces, with their consumer guarantees.
- **Plan privacy per regime** and expect data residency requirements from EU and some Canadian customers.
- **Make language and local business days first-class,** because notice periods and legal documents depend on them.
- **Track the UK's staged reforms** as dated rules: the 1 May 2026 changes are in force, and registration, the ombudsman and housing standards follow.

## References

**Canada**

- [Ontario: Rent increase guideline](https://www.ontario.ca/page/rent-increase-guideline), the 2024 to 2027 guidelines, the Ontario CPI method and 2.5% cap, 90 days' notice on the LTB form, the 12-month rule, the November 15, 2018 exemption
- [Ontario: Renting in Ontario, your rights](https://www.ontario.ca/page/renting-ontario-your-rights), the mandatory standard lease, the 21-day remedy, the Landlord and Tenant Board
- [Tribunal administratif du logement: Rent increase](https://www.tal.gouv.qc.ca/en/renewal-of-the-lease-and-fixing-of-rent/rent-increase), increases the lessor deems just and reasonable, the one-month refusal and filing periods, the calculation regulation, the January 1, 2026 regulatory changes
- [National Assembly of Québec: Bill 31](https://www.assnat.qc.ca/en/travaux-parlementaires/projets-loi/projet-loi-31-43-1.html), An Act to amend various legislative provisions with respect to housing, assented February 21, 2024
- [British Columbia: Residential tenancies](https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/rent-increases), the Residential Tenancy Branch's information and dispute resolution role
- [Office of the Privacy Commissioner of Canada: PIPEDA requirements in brief](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda_brief/), commercial activity, substantially similar laws in Alberta, British Columbia and Quebec, cross-border information

**United Kingdom**

- [Housing Act 2004, section 213](https://www.legislation.gov.uk/ukpga/2004/34/section/213), scheme requirements and prescribed information within 30 days, amendments from 1 May 2026
- [GOV.UK: Deposit protection schemes and landlords](https://www.gov.uk/deposit-protection-schemes-and-landlords), the three schemes, custodial and insured types, the 30-day rule, return within 10 days of agreement, separate schemes in Scotland and Northern Ireland
- [Tenant Fees Act 2019, Schedule 1](https://www.legislation.gov.uk/ukpga/2019/4/schedule/1), deposit caps of five and six weeks' rent and the one-week holding deposit
- [Renters' Rights Act 2025](https://www.legislation.gov.uk/ukpga/2025/26/contents), chapter 26 of 2025 and its five parts
- [GOV.UK: Guide to the Renters' Rights Act](https://www.gov.uk/government/publications/guide-to-the-renters-rights-act), Royal Assent on 27 October 2025
- [The Renters' Rights Act 2025 (Commencement No. 2 and Transitional and Saving Provisions) Regulations 2026](https://www.legislation.gov.uk/uksi/2026/421/contents), commencement on 1 May 2026 and transitional provisions
- [GOV.UK Housing Hub: Renting is changing (landlords)](https://housinghub.campaign.gov.uk/renting-is-changing/), the 1 May 2026 changes and the 15 December 2026 registration rollout
- [Private Housing (Tenancies) (Scotland) Act 2016](https://www.legislation.gov.uk/asp/2016/19/contents), the private residential tenancy, frequency of increases amended by 2025 asp 13, rent control areas
- [Private Housing (Tenancies) (Scotland) Act 2016, section 22](https://www.legislation.gov.uk/asp/2016/19/section/22), rent increase notice with a three-month minimum period
- [Renting Homes (Wales) Act 2016](https://www.legislation.gov.uk/anaw/2016/1/contents), occupation contracts, contract-holders, secure and standard contracts
- [GOV.UK: Regulator of Social Housing](https://www.gov.uk/government/organisations/regulator-of-social-housing), status and sponsor, the register of providers, regulatory standards including those dated 1 October 2026

**Australia**

- [NSW Government: Rental Bonds Online for tenants](https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/residential-rental-bonds/rental-bonds-online-for-tenants), the four-week bond limit, bonds held by NSW Fair Trading, lodgement and refunds
- [NSW Government: Tenants and rent increases](https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/rent-increases), 12 months between increases, 60 days' notice, NCAT applications within 30 days
- [OAIC: The Privacy Act](https://www.oaic.gov.au/privacy/the-privacy-act), coverage of agencies and organisations with turnover over $3 million, the 13 Australian Privacy Principles

**European Union**

- [BGB § 551](https://www.gesetze-im-internet.de/bgb/__551.html), the three-month deposit cap, instalments, segregated interest-bearing investment
- [BGB § 556d](https://www.gesetze-im-internet.de/bgb/__556d.html), the 10% limit over local comparative rent in designated areas, designations ending by 31 December 2029
- [BOE: Ley 12/2023, por el derecho a la vivienda](https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203), stressed residential market areas, the large-holder definition, rent limits, landlord-paid management costs, in force May 26, 2023
- [IFRS Foundation: IFRS 16 Leases](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-16-leases/), lessee recognition for leases over 12 months, effective 1 January 2019

**Payments**

- [Direct Debit: The Direct Debit Guarantee](https://www.directdebit.co.uk/direct-debit-explained/direct-debit-guarantee/), advance notice of changes and immediate refunds for errors
- [AusPayNet: Direct entry](https://www.auspaynet.com.au/resources/direct-entry), BECS as the system for bulk debits and credits, payments up to $100 million

**In practice**

- [Yardi: RentCafe terms of service](https://resources.yardi.com/legal/rentcafe-terms-of-service/), the payment collection agent clause, applicable only in the United States
- [MRI Software UK](https://www.mrisoftware.com/uk/), UK product lines including social housing, block management, build-to-rent and lease accounting
