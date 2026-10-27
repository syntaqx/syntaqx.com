+++
title = "Landlord-Tenant Law as Data"
description = "State and city landlord-tenant rules as effective-dated data: resolving jurisdictions, sourcing and review, preemption, and a matrix of who owns each rule."
category = "Property Tech Industry"
order = 1733
part = "The Rules"
tags = ["property-tech", "landlord-tenant-law", "rules-as-data", "compliance", "preemption"]
+++

Landlord-tenant law in the United States is fifty state codes, the District of Columbia, and a growing layer of county and city ordinances, each amended on its own calendar and some of them suspended by courts. A deposit cap changes in one state on July 1, a rent cap is recalculated every September in another, a city adds a notice requirement on top of its state's, and a state legislature then forbids its cities from doing so. A platform that runs properties in more than one place can't keep that in templates and staff memory. It has to know, for a given property on a given date, which rules apply, what they say, where they came from, and who checked them, and it has to record which rule decided every deadline, cap and notice it computed.

This chapter is the modelling chapter for the volume's legal rules. Topic chapters own what each rule means for their workflow: the deposit rule belongs to the deposit chapter ([Insurance, Deposits & Guarantees](/books/property-tech/insurance-deposits-and-guarantees#security-deposits)), the entry rule to [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders#entry-notice), the towing rule to [Access, Smart Buildings & Parking](/books/property-tech/access-and-smart-buildings#parking-and-towing). This chapter owns how all of them are stored, resolved, sourced, reviewed and reconciled when they conflict, and [The Rules Matrix](#the-rules-matrix) maps every rule type to the chapter that owns it. The general engineering is in [Rules as Data](/docs/architecture/rules-as-data) and [Effective Dating & History](/docs/database/temporal-data); this chapter covers what landlord-tenant law adds. None of it is legal advice: the point is a system in which counsel's conclusions are recorded, applied consistently, and provable later.

## How the Platforms Do It

Property management platforms carry legal rules in three ways, and most carry all three:

- **Rules inside a product feature.** Pricing and renewal tools apply rent caps when they generate offers. Entrata describes a Rent Control solution that "simplifies compliance" as regulations "grow more complex" and a renewals tool with "rent regulation visibility." Yardi's Breeze Premier release notes for fall 2024 list "New York rent control (where applicable)" as "Updated for the New York Good Cause Eviction Law," with revised lease renewal forms and new regulatory agreement fields. The rule lives with the feature that uses it, which keeps it close to the workflow and makes it hard to see across features.
- **Rules inside documents.** State apartment associations publish lease forms that carry the state's law into the contract; the Texas Apartment Association describes its forms as "trusted industry-standard lease agreements and forms." Platforms integrate the forms rather than write their own, so the lease text follows the association's legal updates while the platform's computed dates and amounts must agree with it.
- **Rules as operator settings.** Late fee amounts, grace periods, notice periods and deposit amounts are configured per property, and the operator is responsible for setting them lawfully.

The weakness of the third way is that a setting has no source and no history: nobody can say which statute a grace period of five days came from, or whether it was lawful on the date a fee was charged. My rule: settings the operator chooses are policy, and they're checked against law that the platform stores separately, with sources, dates and a review record. The operator's choices live in `tenant_policies`; the law lives in `legal_rules`; and an evaluation records both.

## Rules as Effective-Dated Data

Every landlord-tenant rule this volume uses has the same parts as the playbook's [shape of a rule](/docs/architecture/rules-as-data#the-shape-of-a-rule): a jurisdiction, a rule type, typed parameters, a period it applies to, and a source. Property law adds three things.

**Applicability conditions are facts about the property, the landlord and the tenancy.** Rent caps and deposit limits exempt categories of housing, and the categories are defined by facts the platform has to hold. California's statewide cap (Civil Code § 1947.12) exempts housing with a certificate of occupancy issued within the previous 15 years, deed-restricted affordable housing, dormitories, housing under a stricter local rent control, separately alienable homes whose owner isn't a REIT, a corporation or an LLC with a corporate member (if the tenant received the statutory exemption notice), and an owner-occupied duplex. California's deposit limit (Civil Code § 1950.5(c)) allows two months instead of one when the landlord is a natural person or an LLC whose members are all natural persons and owns no more than two residential rental properties with no more than four units offered for rent, unless the tenant is a service member. Each condition is a column somewhere: the building's certificate of occupancy date, the owning entity's type and members ([`legal_entities`](/books/property-tech/property-business#the-core-data-model)), the landlord's portfolio size, the tenant's service-member status, whether an exemption notice was served. A rule's `applies_when` names the facts it needs; if a fact is missing, the evaluation fails closed (the stricter outcome) and asks for it, rather than assuming the exemption.

**Each rule type has its own as-of date.** Whether a rule applied depends on when something happened, and the something differs by rule type: the date a deposit was collected (California's one-month limit "shall not apply to a security collected or demanded by the landlord before July 1, 2024"), the date a rent increase notice was served or takes effect, the date a tenant vacated for a deposit return deadline, the date a fee was charged. The registry of rule types records which event's date selects the rule version, and the evaluation stores that date ([As-Of Queries](/docs/database/temporal-data#as-of-queries)).

**Rules combine by type, decided once.** The playbook's three [combinations](/docs/architecture/rules-as-data#when-rules-overlap) all occur. Caps and limits (deposit maximums, late fee caps, rent caps) combine as strictest wins, unless a higher law preempts the lower one, which [Conflicts and Preemption](#conflicts-and-preemption) covers. Notice periods combine as longest wins. Protected classes and required disclosures combine as all apply: [Fair Housing](/books/property-tech/fair-housing#protected-classes) takes the union across jurisdictions. A small number of rules replace rather than limit, and those are the ones that need explicit precedence.

Parameters are typed per rule type with a schema checked on write. A rent cap needs a formula (a fixed percentage, an index-linked one, or a published annual figure), a base (California measures from "the lowest gross rental rate charged for that dwelling or unit at any time during the 12 months prior," with accepted concessions excluded), a frequency (no more than two increases in 12 months in California; once in 12 months in Oregon), and a notice period. A late fee cap needs an amount or a percentage, a base, and a grace period. Encoding them as parameters rather than prose is what lets the pricing engine, the ledger and the notice generator all apply the same rule.

## Resolving a Property's Jurisdictions

A property's `subdivision` in [the core model](/books/property-tech/property-business#the-core-data-model) says which state it's in. Most rules need more: the county, the city if it's incorporated, and sometimes a district that matches neither, such as a rent stabilization area, a mobile home park ordinance's coverage, or a housing code enforcement zone. `property_jurisdictions` holds that resolved set, effective-dated, one row per jurisdiction the property sits in.

Resolution starts from the property's location, never its mailing address. A postal city is a delivery route, and a property with a city's name in its address can sit in unincorporated county land where the city's ordinance doesn't reach; the playbook's [Postal City, Service Point, Jurisdiction](/docs/fundamentals/addresses#postal-city-service-point-jurisdiction) explains why legal boundaries come from point-in-polygon on a parcel or rooftop coordinate. For property, the parcel is the best key: a parcel number ties the property to the county's records and to the boundaries the county and city publish, and [Portfolios, Properties & Units](/books/property-tech/portfolios-properties-and-units#addresses-parcels-and-jurisdictions) owns the parcel crosswalk.

Three things make resolution a process rather than a lookup:

- **Boundaries change.** Annexations move land into cities, and new rent control ordinances create districts. A change closes one `property_jurisdictions` row and opens another on the effective date, so evaluations of past dates still find the old set.
- **Scattered sites span lines.** A scattered-site portfolio of houses can cross city and county boundaries. A property has one jurisdiction set, so houses on different sides of a line are separate properties ([Properties](/books/property-tech/portfolios-properties-and-units#properties)), and resolution flags a property whose buildings resolve differently instead of storing a set per building.
- **Someone confirms it.** Automated resolution proposes; a user confirms on onboarding and on every change, with the evidence (the parcel record, the boundary file and its date). A property with an unconfirmed jurisdiction set is a property whose computed deadlines are unverified, and the platform says so on the screens that use them.

## Sourcing and Keeping Rules Current

A rule is only as good as its source and the last time someone checked it. The sources are:

| Source | Example | What changes it |
| --- | --- | --- |
| **State statute** | California Civil Code § 1950.5 (deposits); Oregon ORS 90.323 (rent increases) | Legislative sessions; effective dates usually set in the bill |
| **Published annual figure** | Oregon's maximum annual rent increase, calculated by the Department of Administrative Services "no later than September 30th of each year" for the following calendar year (ORS 90.324) | The agency's annual publication |
| **Index-linked formula** | California's cap, 5% plus the change in the regional CPI from April data, or 10%, whichever is lower | Each index release |
| **Local ordinance** | City rent stabilization, relocation assistance, local notice rules | City council action; ballot measures |
| **Regulation and agency guidance** | Rent board regulations; housing code enforcement classes | Agency rulemaking |
| **Court decision or order** | An injunction suspending a statute or ordinance; a ruling on preemption | Litigation, including appeals that revive or suspend a rule |
| **Lease forms** | State apartment association forms | The association's legal updates |

Keeping current is a monitoring job with a schedule, not a hope:

- **Calendar the known changes.** Annual figures arrive on known dates: Oregon's 2026 maximum was 9.5% and its 2027 maximum is 10%, published by the September 30 deadline, so a rule row for each calendar year is entered when the figure is published and takes effect January 1 on its own ([Scheduling Future Changes](/docs/database/temporal-data#scheduling-future-changes)). Index-linked caps are recomputed when the index publishes. Legislative sessions have end dates and bills have effective dates; enacted bills that touch a tracked rule type become review tasks.
- **Watch the sources.** Each `legal_sources` row stores the URL, the date it was retrieved and a hash of its content. A scheduled job re-fetches and flags any change for review. Many official sites block automated retrieval, so for those the watch is a commercial legal research or legislative tracking service, or a person with a monthly checklist; the method is recorded with the source.
- **Track litigation as a source.** A rule suspended by an injunction is a rule whose status changed on the date of the order, and one revived on appeal changes again. Court orders get `legal_sources` rows like statutes do, and the affected rules get new versions whose `valid_during` follows the orders.
- **Never let a rule go stale silently.** Each approved rule has a `review_by` date. A rule past it still applies (silence isn't repeal), but the properties it governs show a warning, and the operator's compliance owner sees a queue.

The cost of this work is why vendors centralize it. My rule: whoever maintains the rule content (the platform vendor, a content provider or the operator's counsel) is named on the rule, and the contract says who is responsible for its accuracy. The data model is the same in all three cases; the `approved_by` is different.

## Legal Review

A rule enters the system as a draft and applies only once approved. The workflow is the playbook's reviewed change, with property specifics:

1. **Draft from the source.** Someone reads the statute or ordinance and encodes it: rule type, jurisdiction, parameters, applicability conditions, effective dates, and a plain-language summary. Ambiguities are written down as open questions on the draft, not resolved silently in the parameters.
2. **Test cases with the rule.** Every rule ships with fixtures: a property, a tenancy and an event, and the result counsel expects. California's deposit rule needs at least a one-month case, a two-month small-landlord case, a service-member case and a case for a deposit collected before July 1, 2024. The fixtures run in CI against the engine ([Testing Rules](/docs/architecture/rules-as-data#testing-rules)).
3. **Review by someone else.** A second person, and for new rule types or contested readings a lawyer, approves. The approval records who, when, and the interpretation they relied on.
4. **Impact before activation.** Before an approved change takes effect, a query lists the properties, leases and scheduled actions it affects: renewal offers already generated above a new cap, late fees scheduled above a new limit, deposits on file above a new maximum. Changes that only apply going forward still need that list, because offers and notices are generated in advance.
5. **Notify operators.** Each affected tenant gets the change, its effective date, the properties affected and what the platform will do differently. Settings in `tenant_policies` that are now unlawful are flagged, not silently overridden, because the operator may have a reason the platform doesn't know (an exemption it holds, for example).

Operators can be stricter than the law, never looser. `tenant_policies` hold the operator's own choices (a three-day grace period where law requires none, a lower late fee than the cap), and the engine checks each one against the applicable `legal_rules` on write and on every rule change. Where a policy would be looser than the law, the law applies and the evaluation records that the policy was overridden.

## Conflicts and Preemption

Most conflicts are resolved by the combination rule: a city's longer notice period wins over a state's shorter one. Preemption is different: a higher law removes the lower law's force, so the city rule doesn't apply at all, however strict. Platforms get this wrong in both directions, applying preempted local rules (and refusing lawful actions) or ignoring valid ones.

Preemption comes in a few shapes, and each is modelled differently:

- **Field preemption by statute.** Florida's Statutes § 83.425 preempts to the state "the regulation of residential tenancies, the landlord-tenant relationship, and all other matters covered" by its residential landlord-tenant part, naming tenant screening, security deposits, rental application fees, rental agreement terms, required disclosures, landlord fees and notice requirements, and "supersedes any local government regulations on matters covered." Texas's HB 2127, signed June 14, 2023 and effective September 1, 2023, added field preemption to eight codes, including Property Code § 1.004: "unless expressly authorized by another statute, a municipality or county may not adopt, enforce" ordinances in the field, which "includes regulating evictions or otherwise prohibiting, restricting, or delaying delivery of a notice to vacate," and it gave injured persons and trade associations a cause of action against the city or county. Cities challenged the act in court; its status is a court-dependent fact recorded through `legal_sources`, not assumed. In the model, a preemption is a row that says jurisdiction X, for rule types Y, during period Z, displaces rules from its subordinate jurisdictions. Local rules in a preempted field are retired, or never approved, with the preemption as the reason.
- **Partial preemption that limits local scope.** California's Costa-Hawkins Act lets an owner "establish the initial and all subsequent rental rates" for a unit with a certificate of occupancy issued after February 1, 1995, or one that is alienable separate from the title to any other dwelling unit, notwithstanding a local rent control ordinance (Civil Code § 1954.52). A city's rent stabilization rule is valid, but its `applies_when` must exclude what the state carved out. The carve-out lives on the state's preemption row and is applied to every local rule of the type, so each city's encoding doesn't have to repeat it.
- **A state floor with stricter local rules allowed.** California's statewide cap expressly doesn't limit local rent control consistent with state law, and housing under a local ordinance that restricts increases more tightly than the state cap is exempt from it, so the stricter local limit governs (Civil Code § 1947.12). Here the combination is "local if it exists and is stricter, else state," which is strictest-wins with the state rule as the default.
- **Federal law that stacks.** The Fair Housing Act sets a floor that state and local protected classes add to, so protected classes combine as all apply ([Fair Housing](/books/property-tech/fair-housing#protected-classes)). Federal program rules for subsidized housing apply alongside state law and usually add requirements.
- **Sunset clauses.** California's § 1947.12 "remains in effect until January 1, 2030." The rule row's `valid_during` ends there, and the review queue raises it a year ahead so a successor statute, if one passes, is encoded in time.

Preemption itself is litigated, so a preemption row is versioned like any rule and follows the court record. When status is unsettled, my rule is to apply the reading that exposes residents and operators to the least harm if it later proves wrong, which usually means honoring the local protection until counsel decides otherwise, and recording that decision.

### A worked example: an Oregon rent increase

Oregon's rent increase rule shows most of the moving parts in one decision. ORS 90.323 forbids an increase in the first year of a tenancy, allows no more than one increase in any 12-month period, requires written notice at least 90 days before the increase for tenancies other than week-to-week (7 days for week-to-week), requires the notice to state the amount, the new rent, the effective date and, for an increase above the cap, the facts supporting an exemption, and caps the increase at the percentage calculated under ORS 90.324: the lesser of 10% or 7% plus the September 12-month average change in the West Region CPI-U. The cap doesn't apply where the first certificate of occupancy was issued less than 15 years before the notice date, or to regulated affordable housing on the conditions the statute sets. A landlord who violates the cap owes the tenant three months' rent plus actual damages.

For a renewal offer generated in October 2026 for a lease ending January 31, 2027:

1. **Resolve jurisdictions** for the property on the effective date: US, US-OR, the county and the city.
2. **Select rule versions** by the rule type's as-of date. The cap is selected by the increase's effective date (February 1, 2027), which picks the 2027 figure of 10%, not 2026's 9.5%; the notice rule is selected by the date the notice is served.
3. **Check applicability.** Is the tenancy past its first year? When was the last increase? When was the building's certificate of occupancy issued, and is it within 15 years of the notice date? Is the unit regulated affordable housing? Missing facts block the offer.
4. **Compute the limits.** Maximum new rent from the current rent and the cap; latest notice date, 90 days before February 1, 2027; required notice contents.
5. **Constrain the pricing engine's output** to the maximum, and schedule the notice so it's served in time. [Revenue Management & Pricing](/books/property-tech/revenue-management#rent-limits-in-the-engine) owns the offer; [The Lease](/books/property-tech/the-lease#notices) owns the notice document.
6. **Store the evaluation** with the rule versions, inputs and results ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)), linked from the offer and the notice.

If the 2027 figure had not yet been published when the offer was generated, the evaluation would have used the latest approved figure and flagged itself for re-evaluation when the new row arrived; offers generated in advance of a known publication date are provisional until then.

## The Rules Matrix

Each rule type, how it combines across jurisdictions, which event's date selects the version, and the chapter that owns what it means.

| Rule type | Rule | Combines as | As of | Owning chapter |
| --- | --- | --- | --- | --- |
| `security_deposit_limit` | Maximum deposit, exceptions, what counts as a deposit | Strictest wins | Date collected | [Security Deposits](/books/property-tech/insurance-deposits-and-guarantees#security-deposits); [The Lease](/books/property-tech/the-lease#addenda-and-required-disclosures) |
| `deposit_return_deadline` | Days to return the deposit and itemize deductions; evidence required | Strictest wins | Date vacated | [Deposit Deadlines as Rules Data](/books/property-tech/move-in-and-move-out#deposit-deadlines-as-rules-data); [Resident Chargebacks](/books/property-tech/maintenance-and-work-orders#resident-chargebacks) |
| `late_fee_cap` | Maximum late fee, its base, grace period | Strictest wins | Date charged | [Late Fees](/books/property-tech/charges-and-resident-ledgers#late-fees) |
| `payment_application_order` | The order a payment must be applied in (rent before fees) | Most specific wins | Date received | [Payment Application Order](/books/property-tech/charges-and-resident-ledgers#payment-application-order) |
| `rent_increase_notice` | Notice period, form and contents for an increase | Longest wins | Date served | [Renewals](/books/property-tech/the-lease#renewals); [Renewals and Retention](/books/property-tech/resident-experience#renewals-and-retention) |
| `rent_cap` | Maximum increase, base, frequency, exemptions | Strictest wins, after preemption | Effective date of the increase | [Rent Limits in the Engine](/books/property-tech/revenue-management#rent-limits-in-the-engine) |
| `pricing_tool_restriction` | Which pricing tools and competitor data a landlord may use, and their status (in force, enjoined) | All apply | Date of the recommendation | [State and City Laws](/books/property-tech/revenue-management#state-and-city-laws) |
| `entry_notice` | Notice before entry, hours, form, consent | Longest notice wins | Date served | [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders#entry-notice) |
| `repair_deadline` | Time to begin or complete repairs by condition | Shortest wins | Trigger (notice, violation, inspection) | [Habitability and Repair Deadlines](/books/property-tech/maintenance-and-work-orders#habitability-and-repair-deadlines) |
| `rekey_deadline` | Rekeying or credential change after turnover | Shortest wins | Turnover date | [Smart Locks and Access Control](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control) |
| `lock_change_request` | Lock change on a protected tenant's request | Shortest wins | Date of request | [Smart Locks and Access Control](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control) |
| `towing_notice` | Signage, notice periods, authorization, police notice | All apply | Date first observed | [Parking and Towing](/books/property-tech/access-and-smart-buildings#parking-and-towing) |
| `fee_disclosure` | Which fees must be in advertised prices and leases | All apply | Date advertised or signed | [Fee Transparency and All-In Pricing](/books/property-tech/listings-and-marketing#fee-transparency-and-all-in-pricing); [The Charge Catalog](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog) |
| `application_fee_cap` | Maximum application or screening fee, refund duties | Strictest wins | Date of application | [Application Fees and Portable Reports](/books/property-tech/applications-and-screening#application-fees-and-portable-reports) |
| `screening_restriction` | Fair chance and look-back limits, criteria and notice duties | All apply | Date of decision | [Criminal History and Fair-Chance Laws](/books/property-tech/applications-and-screening#criminal-history-and-fair-chance-laws) |
| `source_of_income` | Income as protected; what the income test may require | All apply | Date of decision | [Fair Housing](/books/property-tech/fair-housing#protected-classes); [Source of Income](/books/property-tech/applications-and-screening#source-of-income) |
| `protected_classes` | Classes protected from discrimination | All apply (union) | Date of the act | [Fair Housing](/books/property-tech/fair-housing#protected-classes) |
| `eviction_notice` | Notices to pay or quit, cure or vacate, and their periods | Longest wins; all content applies | Date served | [Notices](/books/property-tech/delinquency-and-eviction#notices) |
| `storage_lien` | Self-storage lien steps: denial of access, notices and channels, advertisement, earliest sale, surplus | Most specific wins | Date the lien case opens | [Lien Sales and State Lien Law](/books/property-tech/self-storage#lien-sales-and-state-lien-law) |
| `short_term_rental` | Registration, primary-residence and hosted-only rules, night caps, the stay length that becomes a tenancy | All apply | Night of the stay | [Registration, Permits and Caps](/books/property-tech/short-term-rentals#registration-permits-and-caps); [Stays Are Not Leases](/books/property-tech/short-term-rentals#stays-are-not-leases) |
| `lodging_tax` | Lodging taxes: rate or flat amount, base, exemptions, who files | All apply | Night of the stay | [Lodging Taxes](/books/property-tech/short-term-rentals#lodging-taxes) |
| `record_retention` | Minimum periods to keep records | Longest wins | Trigger event | [Retention and Legal Holds](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds) |
| `deposit_protection` | Third-party protection of deposits (outside the US) | All apply | Date received | [The United Kingdom](/books/property-tech/outside-the-us#the-united-kingdom) |
| `mandatory_lease_form` | A government-prescribed lease or notice form (outside the US) | Most specific wins | Date signed or served | [Outside the US](/books/property-tech/outside-the-us#canada); [Templates and Clause Libraries](/books/property-tech/the-lease#templates-and-clause-libraries) |
| `landlord_registration` | Landlord or property registration duties | All apply | Date let or advertised | [The United Kingdom](/books/property-tech/outside-the-us#the-united-kingdom) |
| `indirect_tax` | VAT or GST on rent and charges, by charge code | Most specific wins | Date charged | [What a US Platform Must Re-Plan](/books/property-tech/outside-the-us#what-a-us-platform-must-re-plan) |

The registry behind the matrix is data too: a new rule type is a code change (the engine needs to know its parameter schema, combination and as-of event), and a new jurisdiction's version of an existing type is a row.

Every jurisdiction rule in the book lives in this one catalog. The matrix lists the types that cross chapters; an owning chapter registers its narrower types in the same `rule_types` registry, with itself as `owner_chapter`, and resolves them the same way: SCRA terminations and waitlist waterfalls in [Military & Specialty Housing](/books/property-tech/military-and-specialty-housing#deployment-pcs-orders-and-the-scra), election, violation hearing and resale certificate deadlines in [Community Associations](/books/property-tech/community-associations#state-acts-as-data), reassessment intervals and entrance-fee refunds in [Senior Living](/books/property-tech/senior-living#state-licensing), trust account and deposit-interest rules in [Trust Accounting](/books/property-tech/trust-accounting#state-trust-account-rules), unclaimed property dormancy in [Unclaimed Property](/books/property-tech/trust-accounting#unclaimed-property), resident utility billing in [Submetering Law and Licensing](/books/property-tech/utilities-and-energy#submetering-law-and-licensing), Good Cause coverage and nonrenewal notices in [Good Cause Laws](/books/property-tech/the-lease#good-cause-laws), and privacy request deadlines in [State Privacy Laws](/books/property-tech/records-privacy-and-audits#state-privacy-laws). Deposit deadlines and late fee caps are `legal_rules` rows with no table of their own; where a chapter needs typed columns its engine and constraints read (`rent_limits` and `pricing_restrictions` in Revenue Management, `short_term_rules` and `lodging_tax_rules` in Short-Term Rentals), that table is a slice: each row references the approved `legal_rules` row it was derived from, and the source, review and versions stay here. Every computed deadline, cap and notice elsewhere records the `rule_evaluations` row that produced it.

## How to Build It

The schema below extends [the core data model](/books/property-tech/property-business#the-core-data-model). Jurisdictions, sources and legal rules are platform-wide content with no `tenant_id`: one copy of California's deposit statute serves every operator. Everything an operator chooses or the platform computed for an operator carries `tenant_id` under row-level security.

```sql
CREATE TABLE jurisdictions (               -- platform-wide
  id        UUID PRIMARY KEY DEFAULT uuidv7(),
  code      TEXT NOT NULL UNIQUE,          -- 'US', 'US-CA', 'US-CA-LOS_ANGELES_CITY', 'GB-ENG', 'CA-ON'
  kind      TEXT NOT NULL CHECK (kind IN ('country', 'state', 'province', 'county', 'city',
              'district')),
  parent_id UUID REFERENCES jurisdictions (id),
  name      TEXT NOT NULL,
  time_zone TEXT                           -- IANA; laws take effect on this zone's calendar
);

-- One set per property: buildings in different jurisdictions are split into
-- separate properties, as Portfolios, Properties & Units defines a property.
CREATE TABLE property_jurisdictions (      -- the resolved set
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  property_id   UUID NOT NULL REFERENCES properties (id),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions (id),
  valid_during  DATERANGE NOT NULL,
  resolved_by   TEXT NOT NULL CHECK (resolved_by IN ('parcel', 'geocode', 'manual')),
  evidence      TEXT,                      -- boundary file and date, parcel record
  confirmed_by  UUID REFERENCES users (id), -- a user; null until confirmed
  confirmed_at  TIMESTAMPTZ,
  EXCLUDE USING GIST (property_id WITH =, jurisdiction_id WITH =, valid_during WITH &&)
);

CREATE TABLE legal_sources (               -- platform-wide
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions (id),
  kind            TEXT NOT NULL CHECK (kind IN ('statute', 'ordinance', 'regulation',
                    'court_order', 'agency_guidance', 'ballot_measure', 'published_figure')),
  citation        TEXT NOT NULL,           -- 'Cal. Civ. Code § 1950.5(c)', 'ORS 90.324'
  url             TEXT NOT NULL,
  watch_method    TEXT NOT NULL CHECK (watch_method IN ('fetch', 'service', 'manual')),
  retrieved_at    TIMESTAMPTZ NOT NULL,
  content_hash    TEXT,                    -- change detection for fetched sources
  effective_on    DATE,                    -- for orders and enactments
  notes           TEXT
);

CREATE TABLE rule_types (                  -- the registry; a new row needs code
  rule_type     TEXT PRIMARY KEY,          -- 'security_deposit_limit', 'entry_notice', ...
  params_schema JSONB NOT NULL,            -- JSON Schema checked on write
  combination   TEXT NOT NULL CHECK (combination IN ('strictest', 'longest', 'shortest',
                  'all', 'most_specific')),
  as_of_event   TEXT NOT NULL,             -- 'collected', 'served', 'vacated', 'effective', ...
  owner_chapter TEXT NOT NULL              -- the chapter that defines what it means
);

CREATE TABLE legal_rules (                 -- platform-wide; never edited once approved
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id    UUID NOT NULL REFERENCES jurisdictions (id),
  rule_type          TEXT NOT NULL REFERENCES rule_types (rule_type),
  params             JSONB NOT NULL,       -- {"max_months": 1, "small_landlord_max_months": 2}
  applies_when       JSONB NOT NULL DEFAULT '{}',  -- {"building_co_age_years": {"gte": 15}}
  summary            TEXT NOT NULL,        -- plain language, shown to users
  valid_during       DATERANGE NOT NULL,
  source_id          UUID NOT NULL REFERENCES legal_sources (id),
  status             TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'approved',
                       'retired')),
  maintained_by      TEXT NOT NULL,        -- 'platform', a content provider, or a tenant's counsel
  drafted_by         UUID NOT NULL REFERENCES users (id),
  approved_by        UUID REFERENCES users (id),
  approved_at        TIMESTAMPTZ,
  interpretation     TEXT,                 -- the reading relied on, and open questions
  review_by          DATE NOT NULL,        -- stale after this; still applies, with a warning
  supersedes_rule_id UUID REFERENCES legal_rules (id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status <> 'approved' OR (approved_by IS NOT NULL AND approved_by <> drafted_by))
);

ALTER TABLE legal_rules ADD CONSTRAINT legal_rules_no_overlap  -- one approved version per date
  EXCLUDE USING GIST (jurisdiction_id WITH =, rule_type WITH =, valid_during WITH &&)
  WHERE (status = 'approved');

CREATE TABLE rule_preemptions (            -- a higher law displacing lower ones
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  preempting_jurisdiction_id UUID NOT NULL REFERENCES jurisdictions (id),
  rule_types            TEXT[] NOT NULL,   -- the field displaced
  scope                 TEXT NOT NULL CHECK (scope IN ('field', 'carve_out')),
  carve_out             JSONB,             -- for 'carve_out': the cases local rules can't reach
  valid_during          DATERANGE NOT NULL,
  source_id             UUID NOT NULL REFERENCES legal_sources (id),
  status                TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'approved',
                          'retired')),
  approved_by           UUID REFERENCES users (id)
);

CREATE TABLE rule_test_cases (             -- fixtures counsel signed off, run in CI
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  rule_id     UUID NOT NULL REFERENCES legal_rules (id),
  description TEXT NOT NULL,
  inputs      JSONB NOT NULL,
  expected    JSONB NOT NULL
);

CREATE TABLE tenant_policies (             -- the operator's own choices, never looser than law
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL REFERENCES tenants (id),
  portfolio_id  UUID REFERENCES portfolios (id),
  property_id   UUID REFERENCES properties (id),
  rule_type     TEXT NOT NULL REFERENCES rule_types (rule_type),
  params        JSONB NOT NULL,
  valid_during  DATERANGE NOT NULL,
  set_by        UUID NOT NULL REFERENCES users (id),
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (portfolio_id IS NULL OR property_id IS NULL)
);

CREATE TABLE rule_evaluations (            -- which rule decided, for every computed result
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  rule_type      TEXT NOT NULL REFERENCES rule_types (rule_type),
  subject_type   TEXT NOT NULL,            -- 'lease', 'work_order', 'charge', 'tow_action', ...
  subject_id     UUID NOT NULL,
  as_of          DATE NOT NULL,            -- the date that selected the rule versions
  rule_ids       UUID[] NOT NULL,          -- every legal_rules row considered
  preemption_ids UUID[] NOT NULL DEFAULT '{}',
  policy_id      UUID REFERENCES tenant_policies (id),
  inputs         JSONB NOT NULL,           -- the facts used, including missing ones
  result         JSONB NOT NULL,           -- {"max_rent": 231000, "notice_by": "2026-11-03"}
  outcome        TEXT NOT NULL CHECK (outcome IN ('allowed', 'limited', 'blocked',
                   'needs_facts', 'policy_overridden')),
  provisional    BOOLEAN NOT NULL DEFAULT FALSE,  -- re-evaluate when a pending figure lands
  engine_version TEXT NOT NULL,
  evaluated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Resolution is one query shape for every rule type: the property's jurisdictions on the as-of date, the approved rules of the type in force on that date in those jurisdictions, minus anything displaced by an approved preemption, combined by the type's registered combination:

```sql
-- Candidate rules for a property, a rule type and an as-of date.
SELECT r.*
FROM property_jurisdictions pj
JOIN legal_rules r
  ON r.jurisdiction_id = pj.jurisdiction_id
 AND r.rule_type = $2
 AND r.status = 'approved'
 AND r.valid_during @> $3::date
WHERE pj.property_id = $1
  AND pj.valid_during @> $3::date
  AND NOT EXISTS (                         -- drop rules in a preempted field
    SELECT 1
    FROM rule_preemptions p
    JOIN property_jurisdictions ppj
      ON ppj.property_id = pj.property_id
     AND ppj.jurisdiction_id = p.preempting_jurisdiction_id
     AND ppj.valid_during @> $3::date
    JOIN jurisdictions jr ON jr.id = r.jurisdiction_id
    WHERE p.status = 'approved'
      AND p.scope = 'field'
      AND $2 = ANY (p.rule_types)
      AND p.valid_during @> $3::date
      AND jr.kind IN ('county', 'city', 'district'));  -- local rules under that state
```

Design decisions behind it:

- **Law is shared content; policy and results are tenant data.** Keeping `legal_rules` platform-wide means one review per statute, not one per customer; keeping `tenant_policies` and `rule_evaluations` per tenant keeps each operator's choices and results inside its isolation boundary ([Multi-Tenancy](/docs/architecture/multi-tenancy)).
- **Approved rules are immutable.** A change is a new version that supersedes the old one, with the old one's range closed on the effective date ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)). A correction to a rule that was wrong for a period is a new version marked retroactive, and the impact query re-runs evaluations made under the wrong one.
- **Two people per approval,** enforced by a check, and test cases attached to every rule.
- **Missing facts fail closed.** An evaluation that can't establish an exemption applies the rule; `needs_facts` blocks actions where the stricter result would change what's sent or charged.
- **Evaluations are stored, not recomputed,** and every deadline, cap and notice in other chapters references one: `entry_notices.rule_evaluation_id`, `tow_actions.rule_evaluation_id`, `work_orders.deadline_evaluation_id` ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). A later rule change never rewrites a past decision; it raises a review of open ones.
- **Jurisdiction resolution is confirmed by a person** and versioned, because every rule downstream inherits its errors.

## Auditing

Legal rules are audited from two sides: whether the content was right, and whether it was applied.

- **Content provenance.** For every approved rule: its source as retrieved, the drafter, the approver, the interpretation, the test cases and their last passing run, and the versions it superseded. A regulator or a court asking "what did your system think the deposit limit was in March" gets the row in force on that date and who approved it.
- **Application.** For every computed result in the volume (a cap on a renewal offer, a notice deadline, a late fee, a deposit return date, a tow authorization): the `rule_evaluations` row with the inputs, the rule versions, the preemptions applied and any operator policy, as of the decision. That's what turns "the software said so" into evidence.
- **Policy overrides.** Every case where an operator's setting was looser than the law and the law applied instead, and every case where an operator overrode a computed result, with the user and reason ([Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Staleness.** Rules past their `review_by` date, sources whose content hash changed without a review, jurisdictions resolved but not confirmed, provisional evaluations not re-run. These are the queue a compliance owner works every week.

Retention of evaluations follows the longest-lived record they support: a lease, a deposit accounting or an eviction file ([Retention and Legal Holds](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds)).

## What This Means for the System You Build

- **Store law separately from operator settings,** with sources, effective dates and approvals, and check every setting against it.
- **Resolve each property's jurisdictions from its location,** including county, city and special districts, versioned and confirmed by a person.
- **Give each rule type a parameter schema, a combination and an as-of event,** decided once in a registry.
- **Model applicability as facts** (building age, owner type, portfolio size, tenant status) and fail closed when a fact is missing.
- **Encode preemption explicitly,** as field displacement or carve-outs, and track the court record that can change it.
- **Calendar known changes** (annual figures, index releases, effective dates, sunsets) and watch sources for unknown ones.
- **Require review by a second person** and test cases signed off by counsel before a rule applies.
- **Run an impact query before every change** takes effect, and notify operators of affected properties and actions.
- **Record which rule decided** every deadline, cap and notice, and never recompute history.
- **Keep the matrix current:** every rule type has an owning chapter that defines what it means in its workflow.

## References

**Statutes and published figures**

- [California Civil Code § 1950.5](https://california.public.law/codes/civil_code_section_1950.5), one month's rent as the maximum deposit, the two-month small-landlord exception and its ownership tests, the service-member exception, the July 1, 2024 applicability date, the 21-day return deadline
- [California Civil Code § 1947.12](https://california.public.law/codes/civil_code_section_1947.12), the statewide cap (5% plus regional CPI or 10%), the 12-month base and concession rule, two increases in 12 months, exemptions, stricter local rent control, remedies, repeal on January 1, 2030
- [California Civil Code § 1954.52](https://california.public.law/codes/civil_code_section_1954.52), the owner's right to set initial and subsequent rents for units with a certificate of occupancy after February 1, 1995 and separately alienable units
- [Oregon ORS 90.323](https://oregon.public.law/statutes/ors_90.323), no increase in the first year, one increase in 12 months, 90 days' notice (7 for week-to-week), notice contents, exemptions, three months' rent plus damages
- [Oregon ORS 90.324](https://oregon.public.law/statutes/ors_90.324), the lesser of 10% or 7% plus the West Region CPI-U, calculated by September 30
- [Oregon Office of Economic Analysis: Rent stabilization](https://www.oregon.gov/das/oea/pages/rent-stabilization.aspx), the 2027 maximum of 10% and 2026's 9.5%
- [Florida Statutes § 83.425](https://www.flsenate.gov/Laws/Statutes/2024/83.425), state preemption of residential tenancy regulation and the matters it covers
- [Texas Legislature: HB 2127 (88R) history](https://capitol.texas.gov/BillLookup/History.aspx?LegSess=88R&Bill=HB2127), caption, June 14, 2023 signature, September 1, 2023 effective date
- [Texas HB 2127, enrolled text](https://capitol.texas.gov/tlodocs/88R/billtext/html/HB02127F.htm), field preemption across eight codes, Property Code § 1.004 and evictions, the cause of action in Civil Practice and Remedies Code § 102A.002

**In practice**

- [Entrata: Revenue Intelligence](https://www.entrata.com/products/revenue-intelligence), a Rent Control solution for compliance and rent regulation visibility in renewals
- [Yardi Breeze: Fall 2024 updates](https://www.yardibreeze.com/blog/2024/12/fall-2024-updates), New York rent control updated for the Good Cause Eviction Law, revised renewal forms, regulatory agreement fields
- [Texas Apartment Association: Lease](https://www.taa.org/lease/), industry-standard lease agreements and forms from a state apartment association
