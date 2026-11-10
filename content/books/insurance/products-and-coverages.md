+++
title = "Products, Coverages & Forms"
nav_title = "Products & Forms"
description = "How a product is modeled: coverages, terms, limits, deductibles and options, ISO and bureau forms, state amendatory endorsements, declarations, versions."
category = "Insurance Industry"
order = 2724
part = "Policy Administration"
tags = ["insurance", "policy-administration", "product-configuration", "policy-forms", "endorsements", "iso"]
+++

An insurance product is a contract template plus a price. The contract is a set of filed forms: a policy form that defines the insuring agreements, exclusions and conditions, endorsements that add, remove or change coverage, and state amendatory endorsements that rewrite parts of the policy to comply with one state's law. The price is the rating plan of [How a Rate Is Built](/books/insurance/how-a-rate-is-built). A policy is the declarations page (who, what, where, when, which coverages at which limits and deductibles, for how much) plus the forms listed on it, and the declarations page is what ties a specific risk to the generic contract. Get the forms wrong and the insurer is bound by a contract it didn't file or didn't mean to issue.

For software, the product is configuration with three layers: a catalog of coverages and their terms (what can be bought), rules for which forms attach (what the contract says), and versions by state and date (which catalog and forms apply to this policy). This chapter covers the product model, forms and their numbering, state amendatory endorsements, declarations, how core platforms represent products, and versions and state variations. The filing of forms (prior approval, readability, SERFF) is [Filing Rates & Forms](/books/insurance/rate-and-form-filing); the rating plan is [How a Rate Is Built](/books/insurance/how-a-rate-is-built).

## How the Platforms Do It

As of November 2026, from public documentation:

| Platform or source | Product model | Forms |
| --- | --- | --- |
| **Socotra** | A hierarchy of policy elements under an implicit product: categories `product`, `policyLine`, `exposureGroup`, `exposure` and `coverage`, with type names unique across categories; named coverage terms with allowed options; quantifiers on sub-elements that drive draft-quote validation; data extensions per element | Documents generated from configuration |
| **Guidewire PolicyCenter** | A policy whose contents are set only inside a job (submission, renewal, policy change, cancellation, reinstatement, rewrite) | Form patterns identify each form (form number, edition, jurisdiction availability with start dates); "Forms cannot be assigned directly to policies": they are inferred at a stage such as quote or bind, and the list "can change between quoting and binding" |
| **Verisk ISO Electronic Rating Content** | Advisory rating data and rules per ISO rule | Includes "forms attachment logic" as machine-readable rules |
| **North Carolina Rate Bureau** | A bureau Personal Auto Policy program | Bureau forms that include ISO material with permission, revised by circular with a rule of application |
| **NFIP** | One federal product | The Standard Flood Insurance Policy forms are federal regulation (44 CFR part 61, appendix A) |

The agreement across vendors is that coverages and their options are configuration, and forms are attached by rules, not chosen by hand. Guidewire is explicit that a form can't be added to a policy directly; it is inferred. That is the right default: a hand-picked form list is how a policy ends up missing the state's amendatory endorsement.

## The Product Model

A product, in the vocabulary most platforms converge on:

- **Line of business** (personal auto, homeowners, commercial general liability) and, for packages, **policy lines** inside one policy (a businessowners policy with property and liability lines).
- **Risks** (Socotra's exposures, Guidewire's coverables): the vehicle, the driver, the dwelling, the location, the class code exposure. Each has a typed set of attributes.
- **Coverages** attached at the policy, line or risk level: bodily injury liability per policy, collision per vehicle, Coverage A per dwelling.
- **Coverage terms**: the parameters of a coverage, each with allowed values: limits (a split limit like 50/100, a single limit, an aggregate), deductibles (a dollar amount, a percentage of Coverage A for a hurricane deductible), options (replacement cost versus actual cash value, a waiting period), and dependencies between terms and coverages (a coverage that requires another, a deductible only allowed with a minimum limit).
- **Packages and options**: bundles that set several terms at once ("standard" and "premium" tiers), which are presentation over the same coverage terms.
- **Conditions and exclusions** as clauses, which in a contract live in the forms but in the product model often appear as selectable or required items so they can drive both forms and rating.
- **Questions**: application and underwriting questions tied to the product version ([Underwriting Rules, Referrals & Models](/books/insurance/underwriting)).

North Carolina's 2026 program changes show the model in motion: the bureau "added new Collision and Comprehensive deductible options with rating factors," eliminated the $15 a day ($450 maximum) transportation expenses option, and raised theft transportation expenses to $30 a day ($900 maximum), effective for new and renewal policies on or after October 1, 2026. Each is a configuration change in a coverage term's allowed values, a rating table change, and a form change at once, which is why they ship together under one version and one effective date.

Two modeling rules save pain later. **Coverage codes are stable across versions** (collision is `coll` in every version and state), because statistical reporting, reinsurance, claims and analytics all key on the coverage. **Terms are typed and unit-bearing:** a limit is an amount in minor units with a currency, a per-person and per-accident pair is two fields, and a percentage deductible stores the percentage and the base it applies to, so the claims system can compute the deductible on a loss without parsing a string.

## Forms

A form is a filed document with an identity: a form number and an edition date. Bureau and ISO-style numbering packs both into one string. North Carolina's amendatory endorsement is `NC 00 12 10 26`: a prefix for the program (NC), a form series and number (00 12), and an edition of October 2026 (10 26); the circular that introduced it marks the prior edition, `NC 00 12 10 23`, as replaced and withdraws `NC 03 02 01 99` entirely. The forms carry the bureau's copyright and "Includes copyrighted material of Insurance Services Office, Inc., with its permission," because they are built on ISO's personal auto forms. Insurers that write their own forms use their own prefixes, but the number-plus-edition identity is universal, and Guidewire's form pattern model encodes it the same way: a `formNumber` and an edition that together say two patterns are editions of the same form, with availability dates that must be set explicitly ("merely setting the edition is not sufficient").

Kinds of forms a product attaches:

- **Policy forms** (the coverage form or jacket): the full contract for a line.
- **Endorsements**: changes to the policy form, mandatory (attached to every policy in a state), optional (attached when a coverage or option is chosen) or conditional (attached when a risk characteristic is present, such as a low speed vehicle).
- **State amendatory endorsements**: a mandatory endorsement that rewrites the policy to the state's law.
- **Notices and disclosures** that must accompany the policy but aren't part of the contract (privacy notices, a state's consumer notice).
- **Declarations**: the policy-specific schedule.

**Forms attach by rule, at a defined point.** The rule reads the state, product version, effective date, coverages and risk attributes, and the result is a list of form editions. Guidewire infers forms at a configured inference time (quote or bind), noting that some forms can only be determined at binding or issuance. ISO's ERC ships forms attachment logic as data for the same reason. The form list is part of the policy version: an endorsement that adds a coverage adds its forms, and a renewal re-infers the list on the renewal's version, picking up new editions.

**Form editions are selected by the policy's effective date,** like rate tables: North Carolina's revisions apply to new and renewal policies effective on or after October 1, 2026, so a policy effective September 30, 2026 keeps the 2023 edition through its term, and its renewal gets the 2026 one. The system has to keep issuing old editions as long as policies on them are in force and endorsed.

## State Amendatory Endorsements

A national form says what an insurer would write everywhere; an amendatory endorsement says what one state's law requires instead. North Carolina's personal auto amendatory endorsements, as the 2026 redlines show, change definitions (adding "transportation network platform" and "delivery network platform" and the treatment of newly acquired autos), physical damage terms (transportation expenses of up to $30 a day to $900), exclusions (the delivery-of-goods exclusion now applying only above the state's minimum financial responsibility limits, while the exclusion for public or livery conveyance, including transportation or delivery network platforms, is unchanged), and the termination provisions:

- **Cancellation refunds**: "If the named insured or a premium finance company cancels this policy, the premium owed or premium refund due will be calculated according to the short rate provisions contained in our manuals. If we cancel this policy, any premium owed or premium refund will be calculated on a pro-rata basis."
- **Nonrenewal notice**: for liability, medical payments and uninsured and underinsured motorists coverages, notice mailed "at least 60 days before the end of the policy period," and for other coverages "at least 10 days."
- **Added cancellation grounds**: the named insured is no longer an eligible risk under the state's reinsurance facility statute, and any other reason state law permits.

This is why cancellation and notice behavior is product configuration as much as law: the contract issued to the insured repeats the state's rule, and the system that computes a refund or a notice date must agree with the form it issued ([Cancellation, Nonrenewal & Notice Law](/books/insurance/cancellation-and-nonrenewal)). Rideshare and delivery definitions in the same endorsement are where personal auto meets platform coverage, which [User-Generated Platforms](/books/user-generated-platforms/gig-work-and-worker-law#rideshare-insurance-periods) covers from the platform's side.

## Declarations

The declarations page is the policy's schedule: policy number, named insured and address, policy period with effective and expiration times, producer, each risk (vehicles with VIN, the dwelling address), each coverage with its limits, deductibles and premium, discounts and surcharges, fees, total premium, lienholders and mortgagees, and the list of forms and endorsements by number and edition. It is generated from the policy version and reissued whenever a transaction changes something it shows ([Endorsements, Renewals & the Policy Transaction Model](/books/insurance/endorsements-and-renewals)). Two rules:

- **The declarations are rendered from the policy version, not the other way around,** and the rendered document is kept exactly as sent ([What Was Sent Is What You Keep](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep)).
- **The forms list on the declarations is the contract.** Rendering the list from the attachment rules at issue, storing it with the version, and printing exactly that list keeps the declarations and the forms in agreement.

## Versions and State Variations

A product exists per line and per state, and each has versions over time. A national carrier's personal auto program is dozens of products: the same coverage catalog in principle, but with state-mandated coverages (North Carolina's manual requires uninsured and underinsured motorists coverage "under every auto liability policy insuring the owner of a motor vehicle registered or principally garaged in North Carolina"), state limits (minimum financial responsibility, which North Carolina's rate pages show at 50/100 bodily injury and $50,000 property damage), state forms, state rating plans and state rules. The workable structure:

- **A base product definition** shared across states (coverage codes, terms, the general form set).
- **State overlays** that add, remove or constrain coverages and terms, add amendatory endorsements and point to the state's rate tables, each with its own filing and effective dates.
- **A published product version** per state that is the merged result, frozen and referenced by every quote and policy term (`policy_terms.product_id` in the foundation model).

Renewals move policies onto the current version for the renewal effective date; midterm transactions stay on the term's version (with the inception-or-current rate election from [How a Rate Is Built](/books/insurance/how-a-rate-is-built)). Retiring a product version is a business decision with a long tail: the version stays live for endorsements and cancellations until its last term expires, and for claims well after.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `products` (per line and state, versioned) and `coverages` (per policy version and risk, with `form_ids`). This chapter defines `forms`, the coverage catalog in `coverage_definitions` and `coverage_terms`, and `form_attachments`, the rules that infer forms.

```sql
CREATE TABLE forms (                       -- a filed document edition
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  form_number        TEXT NOT NULL,         -- 'NC 00 12'
  edition            TEXT NOT NULL,         -- '10 26' (MM YY)
  title              TEXT NOT NULL,         -- 'Amendatory Endorsement'
  kind               TEXT NOT NULL CHECK (kind IN ('policy', 'endorsement', 'amendatory',
                       'declarations', 'notice', 'application')),
  owner              TEXT NOT NULL,         -- 'insurer', 'iso', 'ncrb', 'aais', 'fema'
  states             TEXT[] NOT NULL,
  form_filing_id     UUID,                  -- regulatory_filings (Filing Rates & Forms)
  template_ref       TEXT NOT NULL,         -- the renderable source, versioned
  available_from     DATE NOT NULL,         -- new and renewal policies on or after
  available_to       DATE,                  -- withdrawn; still used by terms already on it
  replaces_form_id   UUID REFERENCES forms (id),
  UNIQUE (form_number, edition)
);

CREATE TABLE coverage_definitions (        -- the catalog a product version offers
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id         UUID NOT NULL REFERENCES products (id),
  code               TEXT NOT NULL,         -- stable across versions: 'bi', 'coll', 'cov_a'
  level              TEXT NOT NULL CHECK (level IN ('policy', 'line', 'risk')),
  risk_kind          TEXT,                  -- 'vehicle', 'dwelling', ...
  requirement        TEXT NOT NULL CHECK (requirement IN ('required', 'optional',
                       'required_unless_rejected', 'conditional')),
  rejection_form_id  UUID REFERENCES forms (id),  -- signed rejection where a state needs one
  statistical_code   TEXT,                  -- for the stat plan (Regulatory & Statistical Reporting)
  UNIQUE (product_id, code)
);

CREATE TABLE coverage_terms (              -- limits, deductibles and options, typed
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  coverage_definition_id UUID NOT NULL REFERENCES coverage_definitions (id),
  code               TEXT NOT NULL,         -- 'per_person', 'per_accident', 'deductible',
                                            -- 'valuation', 'daily_limit', 'max_limit'
  value_type         TEXT NOT NULL CHECK (value_type IN ('amount', 'percent', 'choice',
                       'count')),
  allowed_values     JSONB NOT NULL,        -- [5000000, 10000000] minor units, or choices
  default_value      JSONB,
  min_value          JSONB,                 -- e.g. the state's financial responsibility minimum
  depends_on         JSONB,                 -- term dependencies and exclusions
  UNIQUE (coverage_definition_id, code)
);

CREATE TABLE form_attachments (            -- rules that infer the form list
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id         UUID NOT NULL REFERENCES products (id),
  form_id            UUID NOT NULL REFERENCES forms (id),
  attach             TEXT NOT NULL CHECK (attach IN ('mandatory', 'with_coverage',
                       'with_condition')),
  coverage_code      TEXT,                  -- for 'with_coverage'
  condition          JSONB,                 -- for 'with_condition': risk attributes
  inference_point    TEXT NOT NULL CHECK (inference_point IN ('quote', 'bind', 'issue')),
  print_order        INT NOT NULL
);

CREATE TABLE policy_version_forms (        -- the contract as issued, per version
  policy_version_id  UUID NOT NULL REFERENCES policy_versions (id),
  form_id            UUID NOT NULL REFERENCES forms (id),
  attachment_id      UUID REFERENCES form_attachments (id),  -- the rule that put it there
  print_order        INT NOT NULL,
  PRIMARY KEY (policy_version_id, form_id)
);
```

The form list for a new version, selected by the policy term's effective date:

```sql
SELECT f.id, f.form_number, f.edition, fa.print_order
FROM form_attachments fa
JOIN forms f ON f.id = fa.form_id
WHERE fa.product_id = :product_id
  AND f.available_from <= :term_effective_date
  AND (f.available_to IS NULL OR f.available_to > :term_effective_date
       OR :is_existing_term)            -- a withdrawn edition stays on terms already issued
  AND (fa.attach = 'mandatory'
       OR (fa.attach = 'with_coverage' AND fa.coverage_code = ANY (:coverage_codes))
       OR (fa.attach = 'with_condition' AND :risk_attributes @> fa.condition))
ORDER BY fa.print_order;
```

Design choices:

- **Products are published, then frozen.** A product version is assembled from the base and state overlay, validated (every required coverage has terms, every coverage has its forms, every form has a filing in a state that requires one) and locked; quotes reference the locked version.
- **Forms are never hand-attached.** A manuscript endorsement for one commercial account is a form with its own number and an attachment rule scoped to that policy, recorded like any other.
- **The issued form list is stored per policy version** with the rule that attached each form, so the contract in force on any date can be reproduced.

## Auditing

- **Every form edition links to its filing** where the state requires form filing, with its availability dates.
- **Every policy version stores its exact form list** and the declarations as rendered; the forms printed match the forms listed.
- **Every product version records its validation run:** coverages, terms, attachment rules and filings checked, and who published it.
- **Amendatory behavior matches the system's behavior:** a test suite asserts that refund methods and notice days computed by the system equal what the state's amendatory endorsement says.

## What This Means for the System You Build

- **Model coverages, terms and options as typed configuration** with stable coverage codes across versions and states.
- **Attach forms by rule at a defined inference point,** never by hand, and store the issued list per policy version.
- **Identify forms by number and edition,** select editions by the policy's effective date, and keep withdrawn editions alive for terms already on them.
- **Build state products as base plus overlay, published and frozen,** referenced by every quote and term.
- **Keep the system's cancellation and notice behavior in agreement with the amendatory endorsements it issues.**

## References

**Law and regulation**

- [44 CFR Appendix A(1) to Part 61: Standard Flood Insurance Policy, Dwelling Form](https://www.law.cornell.edu/cfr/text/44/appendix-A(1)_to_part_61), a policy form published as federal regulation, including its definition of the policy and its expiration at 12:01 a.m. on the last day of the term

**Filings**

- [North Carolina Rate Bureau: Circular A-26-2, 2026 NC Personal Auto Rate Review and Program Changes (PDF)](https://www.ncrb.org/Portals/0/ncrb/circular%20letters/automobile/2026/A-26-2%202026%20NC%20Personal%20Auto%20Rate%20Review%20and%20Program%20Changes.pdf?ver=8EeBogwTkuRGXminwAqqlw%3d%3d), revised and withdrawn forms with edition dates, the October 1, 2026 rule of application, new deductible options and transportation expense limits, and the amendatory endorsements' definitions, exclusions, refund methods and nonrenewal notice periods
- [North Carolina Rate Bureau: Private Passenger Revised Rates Effective 10/1/25 (XLSX)](https://www.ncrb.org/Portals/0/ncrb/personal%20lines%20services/Rate%20Filings/2025/Voluntary%20Rates%20Effective%2010-1-25.xlsx?ver=uT7dll2lEgosKbpiwo_3uA%3d%3d), base rates at 50/100 bodily injury and $50,000 property damage

**Vendor documentation**

- [Socotra: Policy elements](https://docs.socotra.com/features/policy-management/policy-elements), element categories and hierarchy, coverage terms, quantifiers and data extensions
- [Guidewire: Form patterns (PolicyCenter Cloud API)](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/124-PCsupport/00-form-patterns/c_form-patterns.html), form patterns versus forms, inference at quote or bind, form number and edition, and jurisdiction availability with start dates
- [Guidewire: Overview of modifying jobs (PolicyCenter Cloud API)](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/123-PCpolicies/00-overview-of-modifying-jobs/c_overview_of_modifying_jobs.html), policies created and modified only through policy transactions
- [Verisk: ISO Electronic Rating Content (PDF)](https://www.verisk.com/494a3b/siteassets/media/downloads/iso/iso-electronic-rating-content-suite.pdf), forms attachment logic delivered as machine-readable rules
