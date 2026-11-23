+++
title = "Sensitive Data & Discriminatory Targeting"
nav_title = "Sensitive Data Targeting"
description = "Health data and geofence bans, sensitive places, GDPR special categories in ads, HUD v. Facebook, the Meta settlement and VRS, and special ad categories."
category = "Advertising Industry"
order = 2961
part = "Privacy and Law"
tags = ["advertising", "sensitive-data", "fair-housing", "discrimination", "targeting", "health-data", "data-model"]
+++

Two kinds of targeting law have nothing to do with consent strings. The first says some facts about a person may not be used to pick the ads they see, or may be used only with a separate, explicit permission: health conditions, sexual orientation, religion, political views, precise location, and in the US a growing list of state "sensitive data". The second says some ads may not be shown to some people and withheld from others because of who they are: housing, jobs and credit, under the Fair Housing Act, the employment statutes and the Equal Credit Opportunity Act. Both reach the ad system in the same places, the targeting options a platform offers, the audiences an advertiser builds, the inferences a model draws and the delivery decisions an optimizer makes, and the second reaches one place the first does not: whom the optimizer chose to show an ad to when the advertiser chose no one in particular.

It is hard because the categories are everywhere and rarely labeled. A health condition is implied by a pharmacy visit, a page read, a search, an app installed or a location ping near a clinic; a protected class is implied by a ZIP code, an interest, a name or a lookalike's seed. Removing the obvious targeting options doesn't remove the signal, and research published in 2019 found that ads delivered with neutral targeting still reached audiences skewed by gender and race because the delivery system optimized for who it predicted would respond. So the controls run at three layers (what can be targeted, what can be inferred and stored, and what delivery actually did) and the third is a measurement with thresholds, not a rule.

This chapter covers the sensitive categories and how laws and platforms define them, health data (Washington's My Health My Data Act, Nevada and Connecticut, the FTC's health cases and the Health Breach Notification Rule), location and sensitive places, the GDPR's special categories in ads, discriminatory targeting (the Fair Housing Act, HUD's charge against Facebook, the 2019 settlements, *United States v. Meta* and the Variance Reduction System, employment and credit), the platforms' special ad categories, and the difference between targeting and delivery, then the records. It extends `campaigns` and the validator over `line_items.targeting` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and reuses the flags other chapters added: `taxonomy_nodes.sensitive` and `geo_regions` ([Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies)), `targeting_keys.sensitive` ([Campaigns & Line Items](/books/advertising/campaigns-and-line-items)), `audiences.sensitive_review` ([First-Party Data & Audiences](/books/advertising/first-party-data-and-audiences)) and it defines the special ad categories on `campaigns` that [Social Advertising](/books/advertising/social-advertising) reads. Health privacy in depth is the Health Tech volume's ([Consumer Health Data Laws](/books/health-tech/state-health-privacy#consumer-health-data-laws), [Advertising and Privacy Enforcement](/books/health-tech/telehealth#advertising-and-privacy-enforcement)); fair housing for property operators is Property Tech's [Fair Housing](/books/property-tech/fair-housing#advertising); fair lending is Banking & Lending's [Fair Lending](/books/banking-and-lending/fair-lending#the-two-statutes); the FTC's location data orders and broker law are [Data Brokers & Third-Party Data](/books/advertising/data-brokers); state sensitive data definitions are [US State Privacy Law for Advertising](/books/advertising/us-state-privacy-law#sensitive-data-under-state-law).

## How the Platforms Do It

As of November 2026, how three large self-serve platforms restrict sensitive and protected-class targeting:

| Platform | Special categories (US) | Targeting removed | Sensitive interests | Delivery correction |
| --- | --- | --- | --- | --- |
| **Google** | "Access to opportunities": housing, employment, consumer finance, in the US and Canada | Gender, age, parental status, marital status and ZIP code; radius (1 km minimum), city and country allowed; Canadian postal FSA allowed | 21 restricted categories (health, sexual orientation, religious beliefs, race and ethnicity, political affiliation, negative financial status, trade union membership and others) for which advertiser-curated audiences can't be used | Not published |
| **Meta** | Housing, employment, financial products and services (replaced credit from January 2025), and issues, elections or politics; self-declared, in the US, Canada and parts of Europe | Age fixed at 18 to 65+, all genders, no ZIP codes or other small areas, at least a 15-mile (25 km) radius in the US and Canada, no demographic or behavior targeting, no exclusions, no lookalikes, no bid multipliers | Detailed targeting limited to an approved interest list for these campaigns | Variance Reduction System for US housing, then employment and credit |
| **TikTok** | Housing, employment and credit, self-declared with a toggle for the US and Canada | Age, gender, ZIP code, marital or parental status, and options "describing or appearing to relate to protected characteristics" | Anti-discrimination ad policy across custom audiences and other tools | Not published |

Three conclusions:

- **The category is declared, then enforced.** Every platform makes the advertiser declare the category and removes options in response, which means a misdeclared campaign gets the full targeting set. Review (or a classifier on the ad and landing page) catches the misdeclarations.
- **The removed options converge.** Age, gender, ZIP code and family status are gone on all three; small geography is gone or bounded; lookalikes and exclusions go on Meta, which was the subject of the government's case.
- **Only the platform sued publishes delivery correction.** Targeting restrictions don't control delivery skew; Meta's VRS exists because a settlement requires it, and nothing comparable is public elsewhere.

## Sensitive Categories

There is no one list. The categories that matter to an ad system come from four sources, and a platform serving several jurisdictions carries all four as tags on the same taxonomy nodes:

- **GDPR Article 9(1) special categories,** which DSA Article 26(3) and the EU political ads regulation make off-limits for profiling-based ads: racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data used to identify a person, health, and sex life or sexual orientation. In the EU, consent does not make profiling-based ads on these lawful on platforms.
- **US state sensitive data,** which varies by state (health, precise geolocation, children's data, sexual orientation, citizenship and immigration status, genetic and biometric data, and more) and in many states requires opt-in consent to process, with Maryland banning its sale outright. The definitions per state are [Sensitive Data Under State Law](/books/advertising/us-state-privacy-law#sensitive-data-under-state-law).
- **Consumer health data laws** (Washington, Nevada, Connecticut), which reach inferences and location as well as diagnoses (below).
- **Platform policy,** which is broader than either and is what most advertisers actually meet: Google's restricted categories add things no statute lists, such as relationship hardships, abuse and trauma, and negative financial status.

The working distinction, in every one of these regimes, is between **content that is about a subject** and **a person who is in a category**. An ad for a migraine treatment next to an article about migraines is contextual; an ad for the same treatment shown to a person because the system recorded that they read three migraine articles last week is profiling with health data, and in Washington that inference is itself consumer health data. [Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies) draws the same line for contextual targeting, and the UGP volume's [Contextual Targeting and the Law](/books/user-generated-platforms/ads-and-data-licensing#contextual-targeting-and-the-law) applies it to communities that reveal a category.

## Health Data

Consumer health data law starts where HIPAA stops, and ad systems are what it was written for.

**Washington's My Health My Data Act** (RCW 19.373) applies from March 31, 2024 (June 30, 2024 for small businesses), and its geofence ban from July 23, 2023. Consumer health data covers inferences and location data that could indicate an attempt to obtain health services, not only diagnoses. Collection needs consent for a specified purpose unless necessary for a product the consumer asked for; sharing needs a consent "separate and distinct from the consent obtained to collect"; selling needs a signed "valid authorization"; and a geofence is banned around an entity that provides in-person health care services (RCW 19.373.080) when it is used to identify or track consumers seeking care, collect consumer health data, or send notifications, messages or ads related to health data or health care services, where a geofence is a virtual boundary "2,000 feet or less from the perimeter" of the location. Violations are Consumer Protection Act violations, enforced by the attorney general and by private suits. **Nevada** (NRS 603A) bans a geofence "within 1,750 feet" of medical facilities and other in-person health care providers for the same purposes, including sending advertisements, and requires a written authorization to sell that expires after one year. **Connecticut** bans a geofence within 1,750 feet of a mental health facility or a reproductive or sexual health facility (defined as one where at least 70% of services are of that kind), and makes consumer health data sensitive data under its privacy law. The Health Tech volume covers all three in depth ([Consumer Health Data Laws](/books/health-tech/state-health-privacy#consumer-health-data-laws)); for an ad system the operative facts are three:

- **A health-related audience is consumer health data.** "Visited a fertility clinic's site," "searched for depression symptoms," "bought a pregnancy test" are inferences about health status. Building one needs collection consent, sending it to an ad platform needs a separate sharing consent, and selling it needs an authorization. Platform policy often forbids such audiences anyway: Google's bars advertiser-curated audiences for health ads.
- **The pixel is the disclosure.** The FTC's GoodRx case (a proposed court order filed by the Justice Department and announced February 1, 2023: a $1.5 million civil penalty, the FTC's first action under the Health Breach Notification Rule, and a permanent ban on sharing health data with third parties for advertising) and its BetterHelp case (a proposed administrative consent order announced March 2, 2023: $7.8 million for consumer refunds and a ban on disclosing health data for advertising) were both about tracking pixels and SDKs sending health information to ad platforms. The Health Breach Notification Rule amendments (finalized April 26, 2024) make explicit that health apps are covered and that a "breach of security" includes an unauthorized disclosure, so a health event sent to an ad platform without authorization can be a reportable breach ([The FTC Health Breach Notification Rule](/books/health-tech/digital-health-and-devices#the-ftc-health-breach-notification-rule)). HIPAA's own position on tracking technologies is [Texting, Email and Tracking](/books/health-tech/hipaa-in-practice#texting-email-and-tracking).
- **The geofence is the conduct.** A location audience drawn around a clinic, built from bid request locations or an SDK, is banned outright in these states whatever the consent, and the FTC's location orders treat health care facilities as sensitive locations to be excluded ([Data Brokers & Third-Party Data](/books/advertising/data-brokers) has the orders).

On the receiving side, an ad platform sees these risks as event names and parameters arriving through conversion APIs and pixels. The platform's defensive job is to detect it: event names like "condition_selected", URL paths with diagnoses, and custom parameters that carry medications. A conversion pipeline that strips or rejects such fields, and records that it did, is the platform's half of the GoodRx lesson.

## Location and Sensitive Places

Precise location is sensitive data in many US state privacy laws, defined by a radius: Connecticut's "precise geolocation data" is information identifying a person's location "within a radius of one thousand seven hundred fifty feet." Several states go further for specific places, and the bans attach to the ad product itself (the geofence), not to the data's sale:

| Jurisdiction | Places | Buffer | What is banned | Source |
| --- | --- | --- | --- | --- |
| **Connecticut** | Mental health facilities; reproductive or sexual health facilities | 1,750 feet | A geofence to identify, track, collect data from or send notifications to consumers about their health data | Conn. Gen. Stat. 42-526 |
| **Nevada** | Medical facilities, facilities for the dependent, and any other provider of in-person health care services or products | 1,750 feet | A geofence to identify or track people seeking care, collect consumer health data, or send notifications, messages or advertisements | NRS 603A.540 |
| **Washington** | Entities providing in-person health care services | 2,000 feet from the perimeter | A geofence to identify or track people seeking care, collect consumer health data, or send notifications, messages or ads related to health data or health care services | RCW 19.373.080 |

Other states' sensitive-location and precise-geolocation sale rules (several enacted in 2025 and 2026 and not yet in force) are in [US State Privacy Law for Advertising](/books/advertising/us-state-privacy-law); I've listed only buffers I could read in the statute.

For an ad platform, a sensitive-place rule turns into three checks:

1. **At setup.** A radius or polygon target is checked against a catalog of sensitive places. A target that comes within the buffer of a covered facility in a covered state is refused, whoever the advertiser is: the statutes ban the geofence by its purpose (identifying or tracking people seeking care, collecting their data), which any advertiser's clinic-area radius can serve, not by the advertiser's industry. That reading is my default, more conservative than the text strictly requires.
2. **At audience build.** A "visited" audience built from location history excludes visits to sensitive places, as the FTC orders require of brokers, and the exclusion is recorded.
3. **At serving.** A request whose precise location falls inside a sensitive-place buffer is served without precise-location targeting (the line item's geo dimension evaluates on coarse location only), so no impression is selected *because* the person was at a clinic.

The catalog is the hard part. Facility lists come from public registries (state health facility licenses, the federal provider registries), commercial points-of-interest data and the platform's own business listings, and none is complete; a mental health practice in an office building is not on most maps. The check is only as good as the catalog's coverage, which is why the catalog carries its source and refresh date, and why a coarse rule ("no radius under the largest buffer in a covered state") is a reasonable backstop.

## The EU Special Categories in Ads

In the EU the line is drawn by three instruments:

- **GDPR Article 9** prohibits processing special category data unless an exception applies, of which explicit consent is the only one an advertiser can usually use; the lawful bases for advertising generally are [GDPR & ePrivacy for Ads](/books/advertising/gdpr-and-eprivacy-for-ads#special-categories) and the playbook's [Lawful Bases](/docs/compliance/gdpr#lawful-bases).
- **The CJEU's** *Meta v Bundeskartellamt* **(C-252/21, July 4, 2023)** held that a user who visits websites or apps that reveal sensitive information, or enters data or clicks buttons on them, does not thereby "manifestly make public" that data, so the Article 9(2)(e) exception does not cover it. The consequence for ad systems: the browsing and app data an ad platform collects through pixels and SDKs can be special category data when the site reveals it (a health forum, a religious app, a dating app for a particular orientation), and it needs a valid exception before it is processed at all.
- **The DSA (Article 26(3))** forbids online platforms from presenting ads based on profiling with special categories, consent or not, and **the political ads regulation (Article 18)** forbids it for political targeting. [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads) covers both at the ad.

What that means in practice is that an EU ad stack does not store "interested in" segments on special category topics for people at all, and a classifier that infers them is switched off for ad use. Content classification of pages remains, because contextual targeting doesn't build a profile.

## Discriminatory Targeting

The US law is older than online advertising and written in terms of "publishing" ads, which is how it reached targeting.

**Housing.** The Fair Housing Act makes it unlawful "to make, print, or publish, or cause to be made, printed, or published any notice, statement, or advertisement" about the sale or rental of a dwelling that indicates a preference, limitation or discrimination on a protected basis (race, color, religion, sex, handicap, familial status, national origin; 42 U.S.C. 3604(c)), and HUD's regulation extends it to "selecting media or locations for advertising" that deny particular segments of the housing market information about housing opportunities on those bases (24 CFR 100.75(c)(3)) ([Advertising](/books/property-tech/fair-housing#advertising) in the Property Tech volume). On March 28, 2019, HUD charged Facebook with housing discrimination, alleging that advertisers could exclude users classified as parents, non-American-born, non-Christian, interested in accessibility or in Hispanic culture, draw boundaries on a map to exclude neighborhoods, and choose only men or only women; and that Facebook's own delivery used protected characteristics, combining data to group users and predict responses in ways that "may recreate groupings defined by their protected class."

**The 2019 settlements.** Days earlier (March 19, 2019) Facebook had settled with the National Fair Housing Alliance, the ACLU, the Communications Workers of America and others: housing, employment and credit advertisers could no longer target by age, gender or ZIP code, multicultural affinity and detailed options relating to protected classes were removed for those ads, and Facebook committed to building a tool to search all current US housing ads.

**United States v. Meta (2022).** The Justice Department sued on June 21, 2022 in the Southern District of New York (No. 22-cv-5187), and the court approved the settlement and entered judgment on June 27, 2022; Meta denied liability. Meta agreed to stop delivering housing ads targeted with its "Special Ad Audience" tool (a lookalike for housing ads) by December 31, 2022 and to remove that tool and Lookalike Audiences from housing ad flows, agreed not to offer housing advertisers targeting options that describe or relate to protected characteristics, agreed to build a Variance Reduction System for delivery, and paid $115,054, the maximum civil penalty then available under the Act. The settlement also had Meta keep requiring housing advertisers to certify compliance with anti-discrimination policies and law, and prepare a compliance report every four months for an independent reviewer (Guidehouse). Its extended term ran to June 27, 2026; whether the government sought to extend oversight past that date is not on the Justice Department's case page as of November 2026. <!-- source-gap: adv-meta-vrs-after-2026 | status | Status of US v. Meta oversight and VRS reporting after the Extended Term ended June 27, 2026 | closes with: a DOJ case page update, a court filing or a Meta statement on VRS after June 2026 | checked: 2026-11-22 -->

**Employment.** Title VII makes it unlawful for an employer, labor organization or employment agency to publish a job notice or advertisement "indicating any preference, limitation, specification, or discrimination" based on race, color, religion, sex or national origin, except where one is a bona fide occupational qualification (42 U.S.C. 2000e-3(b)); the Age Discrimination in Employment Act says the same of age (29 U.S.C. 623(e)). The statutes bind the employer and the agency, not obviously the platform, which is why the best-known challenge to age-restricted job ads on Facebook, *Bradley v. T-Mobile US* (N.D. Cal. No. 5:17-cv-07232, filed in December 2017 by the Communications Workers of America and individual job seekers), named employers rather than Facebook; press reports say the court dismissed the first complaint with leave to amend in 2020 and that the case later settled, but I could not open the court record. <!-- source-gap: adv-bradley-tmobile | secondary | Bradley v. T-Mobile US: dismissal with leave to amend (2020) and later settlement, reported only by secondary sources | closes with: the N.D. Cal. docket or orders in 5:17-cv-07232 | checked: 2026-11-22 --> For a platform the rule is the same either way: job ads are a special category, with no age or gender targeting.

**Credit.** ECOA and Regulation B prohibit discrimination in any aspect of a credit transaction, including discouraging applicants on a prohibited basis; since the CFPB's 2026 amendment, Regulation B's discouragement provision reaches statements, and it excludes advertising footprint as a general business decision ([Disparate Impact and the 2026 Reg B Rule](/books/banking-and-lending/fair-lending#disparate-impact-and-the-2026-reg-b-rule) and [Discouragement and Special Purpose Credit Programs](/books/banking-and-lending/fair-lending#discouragement-and-special-purpose-credit-programs)). The CFPB's August 2022 interpretive rule on when digital marketers fall outside the Consumer Financial Protection Act's "time or space" exception (87 FR 50556) was one of the 67 guidance documents the Bureau withdrew as of May 12, 2025. Dwelling-secured credit stays under the Fair Housing Act, and state fair lending laws remain; my default for a platform is to treat every credit and financial product ad as a special category, as Meta now does.

Federal guidance on all three is thinner than it was: HUD's 2024 guidance on applying the Fair Housing Act to digital advertising platforms was withdrawn effective September 2025 ([Advertising](/books/property-tech/fair-housing#advertising) has the status), and the CFPB's digital marketer rule is gone. The statutes, the HUD regulation and the 2022 judgment are unchanged, and private suits, state attorneys general and state civil rights laws enforce them.

## Special Ad Categories

A special ad category is a campaign-level declaration that switches the platform into a restricted mode. Meta's implementation, as its Marketing API documents it, is the most specific public one and the template others resemble:

- **Values:** `HOUSING`, `EMPLOYMENT`, `FINANCIAL_PRODUCTS_SERVICES` (replacing `CREDIT` from January 2025) and `ISSUES_ELECTIONS_POLITICS`, with `special_ad_category_country` naming the countries (ISO alpha-2) the declaration applies to; the issues category requires the user and Page to be authorized in that country.
- **Age:** fixed at 18 to 65+ for housing, employment and financial products.
- **Gender:** all genders.
- **Location:** no location exclusions; any selected place must include at least a 15-mile (25 km) radius in the US and Canada or 15 km in Europe; ZIP codes, neighborhoods, sub-city areas, metro areas, small geographic areas and electoral districts are unsupported.
- **Detailed targeting:** no demographic or behavior targeting and no exclusions; interests only from an approved list.
- **Audiences:** no lookalikes and no lookalike exclusions; saved audiences are removed when a campaign is tuned for the category.
- **Bids:** no bid multipliers.

Meta's anti-discrimination policy requires US advertisers, and advertisers targeting the US, Canada or parts of Europe, to declare these categories. Google's and TikTok's equivalents are in the table above.

The engineering consequence is that the special category is read in three places: the targeting validator (which options exist), the audience builder (which audiences can be attached) and the delivery system (which correction applies). Because Meta's API takes a list and a campaign can be both housing and financial (a mortgage ad), the field on `campaigns` is an array with the countries it applies in (below), and [Social Advertising](/books/advertising/social-advertising)'s delivery system reads it rather than keeping its own.

## Targeting Versus Delivery

Removing targeting options addresses what the advertiser chose. It does not address what the optimizer chose. Ali, Sapiezynski, Bogen, Korolova, Mislove and Rieke ("Discrimination through optimization", 2019) ran real employment and housing ads on Facebook with inclusive targeting and observed "significant skew in delivery along gender and racial lines," driven by market effects (some audiences cost more to reach), the advertiser's budget and the ad's content, and the platform's own predictions of relevance. HUD's charge made the same kind of delivery allegation, and the finding generalizes: any system that maximizes predicted response will concentrate delivery on whoever the model predicts responds, and for a job or apartment ad that concentration can track a protected class.

**The Variance Reduction System** is Meta's answer as the settlement defines it, verified by Guidehouse. Its measurements, from the reviewer's first report:

- **What is compared.** For each housing ad, the demographic distribution of the *eligible audience* (everyone the ad's targeting allows, each person weighted by the housing ad impressions they saw on Meta in the previous 30 days) against the *actual audience* (who got the impressions).
- **Which attributes.** Sex from what users report in their profiles, and estimated race and ethnicity from a privacy-enhanced Bayesian Improved Surname Geocoding (BISG) with differential privacy added, built so no durable per-person race record is created.
- **The distance.** Earth Mover's Distance (the Wasserstein metric) between the two distributions, called the variance.
- **The compliance metric.** Coverage: the share of housing ads whose variance is at or below a threshold (10% and 5%), computed separately for ads with at least 300 impressions and ads with more than 1,000, per four-month reporting period.

The agreed targets for ads with more than 1,000 impressions:

| Attribute | Variance threshold | By April 30, 2023 | By August 31, 2023 | By December 31, 2023 and after |
| --- | --- | --- | --- | --- |
| Sex | 10% | 82.6% | 87.2% | 91.7% |
| Sex | 5% | 73.2% | 79.1% | 84.5% |
| Estimated race or ethnicity | 10% | 72.2% | 76.1% | 81.0% |
| Estimated race or ethnicity | 5% | 54.3% | 57.5% | 61.0% |

For ads with at least 300 impressions the December 2023 targets were 90.2% and 78.3% for sex and 80.1% and 56.8% for estimated race or ethnicity. In the first reporting period (January 10 to April 30, 2023) Guidehouse calculated the same coverage Meta reported, above the targets: for ads over 1,000 impressions, 89.7% at the 10% threshold for sex and 77.2% for estimated race or ethnicity. Meta said in an October 2023 update that it had launched VRS for US employment and credit ads as well.

Three design lessons from it apply to any platform with special categories, whether or not it is under a decree:

- **Measure against the eligible audience, not the population.** The question is whether delivery narrowed a lawful audience along a protected line; the comparison base is who could have seen the ad.
- **Estimate protected attributes in aggregate and forget them.** A platform that doesn't collect race can't measure race skew without estimating it, and estimating it per person creates exactly the sensitive record the rest of this chapter avoids. Aggregate-only estimation with noise added, run in an isolated job, is the pattern.
- **Correct delivery, then report coverage.** VRS adjusts pacing toward the eligible distribution while the ad runs; the coverage metric is the after-the-fact proof. Both are needed: a report without correction is a record of the problem.

## How to Build It

The records: the special categories on the campaign, which sensitive categories a taxonomy node belongs to, the catalog of sensitive places and the geofence rules that apply to them, and the delivery fairness measurements. The targeting validator reads all of them, and the existing flags (`taxonomy_nodes.sensitive`, `targeting_keys.sensitive`, `audiences.sensitive_review`) stay as the quick filter.

```sql
-- Special ad categories: a list, with the countries the declaration applies in.
ALTER TABLE campaigns
  ADD COLUMN special_ad_categories TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN special_ad_countries CHAR(2)[] NOT NULL DEFAULT '{}',
  ADD COLUMN special_ad_declared_by TEXT,          -- 'advertiser' or a classifier or reviewer
  ADD COLUMN special_ad_declared_at TIMESTAMPTZ;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_special_ad_categories_check
  CHECK (special_ad_categories <@ ARRAY['housing', 'employment', 'financial_products',
         'issues_elections_politics']::TEXT[]) NOT VALID;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_special_ad_countries_check
  CHECK (cardinality(special_ad_categories) = 0 OR cardinality(special_ad_countries) > 0) NOT VALID;

-- After filling in existing campaigns' declarations:
ALTER TABLE campaigns VALIDATE CONSTRAINT campaigns_special_ad_categories_check;

-- Which sensitive categories a node belongs to, per regime, beyond the boolean.
ALTER TABLE taxonomy_nodes
  ADD COLUMN sensitive_categories TEXT[] NOT NULL DEFAULT '{}';
  -- e.g. {'gdpr_art9:health', 'us_state:health', 'platform:negative_financial_status'}
ALTER TABLE taxonomy_nodes ADD CONSTRAINT taxonomy_nodes_sensitive_consistent_check
  CHECK (sensitive OR cardinality(sensitive_categories) = 0) NOT VALID;

-- Places around which targeting and location audiences are restricted.
CREATE TABLE sensitive_places (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  kind            TEXT NOT NULL CHECK (kind IN ('health_care', 'mental_health',
                    'reproductive_sexual_health', 'dependent_care', 'place_of_worship',
                    'shelter', 'school', 'military', 'correctional', 'other')),
  name            TEXT NOT NULL,
  country         CHAR(2) NOT NULL,
  region          TEXT NOT NULL,          -- ISO 3166-2 subdivision, e.g. 'US-WA'
  lat_e7          INT NOT NULL,           -- degrees x 1e7, the facility's reference point
  lon_e7          INT NOT NULL,
  perimeter       JSONB,                  -- GeoJSON polygon where known; buffers run from it
  source          TEXT NOT NULL,          -- 'state_license_registry', 'poi_vendor', 'own_listing', ...
  source_ref      TEXT,
  verified_at     TIMESTAMPTZ NOT NULL,   -- last refresh from the source
  status          TEXT NOT NULL CHECK (status IN ('active', 'closed', 'disputed'))
);
CREATE INDEX sensitive_places_region_idx ON sensitive_places (region, kind) WHERE status = 'active';

-- The geofence rules: which place kinds, what buffer, which purposes, from when.
CREATE TABLE geofence_restrictions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction        TEXT NOT NULL,      -- 'US-WA', 'US-NV', 'US-CT', or a platform policy key
  place_kinds         TEXT[] NOT NULL,
  buffer_ft           INT NOT NULL CHECK (buffer_ft > 0),  -- 2000, 1750
  banned_purposes     TEXT[] NOT NULL,    -- {'identify', 'track', 'collect', 'notify', 'advertise'}
  applies_to          TEXT NOT NULL CHECK (applies_to IN ('everyone', 'health_data_only')),
  authority           TEXT NOT NULL,      -- 'RCW 19.373', 'NRS 603A.540', 'Conn. Gen. Stat. 42-526'
  effective           DATERANGE NOT NULL,
  privacy_jurisdiction_id UUID,           -- the state law version, where US State Privacy Law has one
  UNIQUE (jurisdiction, authority, effective)
);

-- Delivery fairness: one measurement per campaign (or line item), attribute and period.
CREATE TABLE delivery_fairness_measurements (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  campaign_id           UUID NOT NULL REFERENCES campaigns (id),
  line_item_id          UUID REFERENCES line_items (id),  -- null: the whole campaign
  special_ad_category   TEXT NOT NULL,
  period                DATERANGE NOT NULL,  -- the reporting period it belongs to
  attribute             TEXT NOT NULL CHECK (attribute IN ('sex', 'estimated_race_ethnicity',
                          'age_band')),
  estimator_version     TEXT NOT NULL,     -- e.g. 'self_reported', 'bisg-dp-2023-01'
  impressions           BIGINT NOT NULL,
  eligible_distribution JSONB NOT NULL,    -- aggregate shares, noised; never per person
  actual_distribution   JSONB NOT NULL,
  variance_bp           INT NOT NULL CHECK (variance_bp BETWEEN 0 AND 10000),  -- EMD, basis points
  method                TEXT NOT NULL DEFAULT 'emd',
  correction_active     BOOLEAN NOT NULL,  -- was delivery being adjusted during the period
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (campaign_id, line_item_id, attribute, period)
);
```

Coverage for a reporting period is then a query, and the targets are rows of rule data rather than constants:

```sql
-- Share of housing campaigns with more than 1,000 impressions whose variance is within 10%.
SELECT attribute,
       count(*) FILTER (WHERE variance_bp <= 1000) * 10000 / count(*) AS coverage_bp,
       count(*) AS campaigns
FROM delivery_fairness_measurements
WHERE special_ad_category = 'housing'
  AND period = daterange('2026-01-01', '2026-05-01')
  AND impressions > 1000
  AND line_item_id IS NULL
GROUP BY attribute;
```

The setup check for a radius target, in the validator, measures from the target's center to each sensitive place in the covered regions and refuses the target if its edge comes within the buffer of any covered place:

```go tab="Go"
package geofence

import "math"

const earthRadiusFt = 20_902_231.0 // mean Earth radius in feet

type Place struct {
	Kind     string
	Lat, Lon float64 // degrees
}

type Restriction struct {
	Authority  string
	PlaceKinds map[string]bool
	BufferFt   float64
}

// distanceFt is the great-circle (haversine) distance between two points.
func distanceFt(lat1, lon1, lat2, lon2 float64) float64 {
	toRad := math.Pi / 180
	dLat := (lat2 - lat1) * toRad
	dLon := (lon2 - lon1) * toRad
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*toRad)*math.Cos(lat2*toRad)*math.Sin(dLon/2)*math.Sin(dLon/2)
	return 2 * earthRadiusFt * math.Asin(math.Sqrt(a))
}

// Violation is one place a radius target comes too close to, and the rule it breaks.
type Violation struct {
	Authority string
	Place     Place
	GapFt     float64 // how far inside the buffer the target's edge reaches
}

// Check returns every restricted place whose buffer the circle (lat, lon, radiusFt) enters.
func Check(lat, lon, radiusFt float64, places []Place, rules []Restriction) []Violation {
	var out []Violation
	for _, r := range rules {
		for _, p := range places {
			if !r.PlaceKinds[p.Kind] {
				continue
			}
			edge := distanceFt(lat, lon, p.Lat, p.Lon) - radiusFt // nearest point of the circle
			if edge <= r.BufferFt {
				out = append(out, Violation{r.Authority, p, r.BufferFt - edge})
			}
		}
	}
	return out
}
```

```rust tab="Rust"
use std::collections::HashSet;

const EARTH_RADIUS_FT: f64 = 20_902_231.0; // mean Earth radius in feet

pub struct Place {
    pub kind: String,
    pub lat: f64, // degrees
    pub lon: f64,
}

pub struct Restriction {
    pub authority: String,
    pub place_kinds: HashSet<String>,
    pub buffer_ft: f64,
}

/// One place a radius target comes too close to, and the rule it breaks.
pub struct Violation<'a> {
    pub authority: &'a str,
    pub place: &'a Place,
    pub gap_ft: f64, // how far inside the buffer the target's edge reaches
}

/// Great-circle (haversine) distance between two points, in feet.
fn distance_ft(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let (p1, p2) = (lat1.to_radians(), lat2.to_radians());
    let d_lat = (lat2 - lat1).to_radians();
    let d_lon = (lon2 - lon1).to_radians();
    let a = (d_lat / 2.0).sin().powi(2) + p1.cos() * p2.cos() * (d_lon / 2.0).sin().powi(2);
    2.0 * EARTH_RADIUS_FT * a.sqrt().asin()
}

/// Every restricted place whose buffer the circle (lat, lon, radius_ft) enters.
pub fn check<'a>(lat: f64, lon: f64, radius_ft: f64, places: &'a [Place],
                 rules: &'a [Restriction]) -> Vec<Violation<'a>> {
    let mut out = Vec::new();
    for r in rules {
        for p in places.iter().filter(|p| r.place_kinds.contains(&p.kind)) {
            let edge = distance_ft(lat, lon, p.lat, p.lon) - radius_ft; // nearest point of the circle
            if edge <= r.buffer_ft {
                out.push(Violation { authority: &r.authority, place: p, gap_ft: r.buffer_ft - edge });
            }
        }
    }
    out
}
```

A 1 km (3,281 ft) radius centered 4,500 feet from a Washington clinic has its edge 1,219 feet from the clinic, inside the 2,000-foot buffer by 781 feet, so it is refused; the same target 6,000 feet away passes Washington's rule. In production the places come from a spatial index over the regions the target touches, not a full scan, and a polygon target uses the polygon's nearest edge.

Design notes:

- **One flag to filter, a list to decide.** `taxonomy_nodes.sensitive` is the fast check every path uses; `sensitive_categories` says which regime makes it sensitive, because political affiliation is targetable for a US election ad on some platforms and never under DSA Article 26(3). The validator evaluates the request's jurisdiction against the list.
- **The category drives three systems from one field.** The targeting validator, the audience builder and the delivery corrector read `special_ad_categories`; none keeps its own copy. A change to the field is a new line item version (`line_item_versions`, in [Campaigns & Line Items](/books/advertising/campaigns-and-line-items)) so the audit shows which restrictions applied when each impression served.
- **Misdeclaration is a classifier's job.** A campaign declared as nothing that links to a rental listing or a job application form is reclassified by review, the reclassification recorded with `special_ad_declared_by`, and its targeting re-validated before it serves again.
- **Geofence rules ban the product, so check everyone.** `applies_to = 'everyone'` for Washington, Nevada and Connecticut means the check runs on every advertiser's radius targets, not only health advertisers'.
- **Coarsen before logging.** A request inside a sensitive-place buffer keeps only coarse location in `ad_requests` and in any audience event, and the decision records that precise location was suppressed, which is what makes "no impression was chosen because someone was at a clinic" provable.
- **Protected attributes stay aggregate.** The fairness job reads delivery logs and an estimator's aggregate output in an isolated environment, writes only distributions with noise to `delivery_fairness_measurements`, and never writes a per-person race or sex estimate anywhere the ad system can read ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).
- **Targets are rule data.** Thresholds, impression floors and coverage targets per category and period are versioned rows the reporting query joins, as [Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions) describes, so a renegotiated target doesn't rewrite last year's report.

## Auditing

What a regulator, a court-appointed reviewer, a fair housing organization or a state attorney general asks for:

- **Special category declarations and reclassifications,** with who declared, who changed them, and the targeting options available at each version.
- **Every targeting expression refused or limited** because it touched a sensitive node, a protected characteristic or a sensitive place, with the rule and its authority, and every exception approved and by whom.
- **Sensitive-place catalog coverage,** with sources and refresh dates, and the geofence restrictions in force on each date.
- **Location suppression on requests** inside buffers, counted per day and region.
- **Audiences reviewed for sensitive content** (`audiences.sensitive_review`), with the decision and reviewer.
- **Events and parameters rejected at the conversion API** for carrying health or other sensitive information, by advertiser.
- **Delivery fairness measurements and coverage per period,** the estimator version, and whether correction was active.

Typed actors and append-only history are in [Audit Trails](/docs/building-blocks/audit-trails); automated decisions with their inputs are [Automated and AI Decisions](/docs/building-blocks/audit-trails#automated-and-ai-decisions).

## What This Means for the System You Build

- **Tag sensitive taxonomy nodes with the regimes that make them sensitive,** and evaluate the request's jurisdiction against the tags in one validator.
- **Separate content about a subject from a person in a category,** and allow the first where the second is banned.
- **Treat health inferences as health data,** and refuse health-related audiences and health parameters at the conversion API.
- **Check every radius and polygon target against a sensitive-place catalog** with buffers from the statutes, for every advertiser.
- **Store special ad categories as a list with countries on the campaign,** read by targeting, audiences and delivery.
- **Remove age, gender, small geography, family status, lookalikes and exclusions** for housing, employment and financial products.
- **Measure delivery against the eligible audience** for special categories, estimate protected attributes only in aggregate, and correct delivery while the ad runs.
- **Keep the rules, thresholds and targets as versioned data,** and record which version applied to each decision.

## References

**Regulation**

- [Washington RCW 19.373.010, definitions](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.010), consumer health data and the 2,000-foot geofence definition
- [Washington RCW 19.373.030](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.030), the separate and distinct consent to share
- [Washington RCW 19.373, full chapter](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373&full=true), the geofence ban and its purposes (19.373.080), the authorization to sell (19.373.070) and Consumer Protection Act enforcement (19.373.090)
- [Nevada NRS Chapter 603A](https://www.leg.state.nv.us/nrs/nrs-603a.html), the 1,750-foot geofence ban (603A.540) and the written sale authorization that expires after a year (603A.535)
- [Connecticut General Statutes Chapter 743jj](https://www.cga.ct.gov/current/pub/chap_743jj.htm), the 1,750-foot geofence ban (42-526), the 70% facility definitions, the 1,750-foot precise geolocation radius and the sensitive data list (42-515)
- [Regulation (EU) 2022/2065, Digital Services Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2065), Art. 26(3) and its reference to GDPR Art. 9(1)
- [42 U.S.C. 3604 (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/3604), the Fair Housing Act's prohibition on discriminatory housing notices and advertisements
- [24 CFR 100.75 (Cornell LII)](https://www.law.cornell.edu/cfr/text/24/100.75), HUD's regulation on discriminatory advertising, including selecting media or locations
- [42 U.S.C. 2000e-3 (Cornell LII)](https://www.law.cornell.edu/uscode/text/42/2000e-3), Title VII's prohibition on discriminatory job notices and advertisements and the BFOQ exception
- [29 U.S.C. 623 (Cornell LII)](https://www.law.cornell.edu/uscode/text/29/623), the ADEA's prohibition on job ads indicating an age preference
- [Maryland: Chapter 455 of 2024, enrolled text](https://mgaleg.maryland.gov/2024RS/Chapters_noln/CH_455_sb0541e.pdf), the Maryland Online Data Privacy Act's ban on selling sensitive data
- [Federal Register: Equal Credit Opportunity Act (Regulation B), final rule, 91 FR 21620 (April 22, 2026)](https://www.federalregister.gov/documents/2026/04/22/2026-07804/equal-credit-opportunity-act-regulation-b), discouragement limited to statements, and decisions about where to advertise not discouragement in themselves
- [Federal Register: Notification of Withdrawal of Fair Housing and Equal Opportunity Guidance Documents (91 FR 17291)](https://www.federalregister.gov/documents/2026/04/06/2026-06624/notification-of-withdrawal-of-fair-housing-and-equal-opportunity-guidance-documents), the April 29, 2024 digital platforms advertising guidance withdrawn effective September 17, 2025
- [Federal Register: Withdrawal of Regulatory Guidance (90 FR 20084, May 12, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-05-12/html/2025-08286.htm), the CFPB's withdrawal of the digital marketers "time or space" interpretive rule (87 FR 50556)

**Regulators**

- [Washington Attorney General: Protecting Washingtonians' personal health data and privacy](https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy), compliance dates (the geofence section from July 23, 2023), valid authorization to sell and Consumer Protection Act enforcement
- [FTC: Enforcement action to bar GoodRx from sharing health information for advertising (February 1, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising), the $1.5 million penalty, the first Health Breach Notification Rule action and the advertising ban
- [FTC: Ban on BetterHelp revealing consumers' data (March 2, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-ban-betterhelp-revealing-consumers-data-including-sensitive-mental-health-information-facebook), the $7.8 million and the advertising ban
- [FTC: FTC finalizes changes to the Health Breach Notification Rule (April 26, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/04/ftc-finalizes-changes-health-breach-notification-rule), health apps covered and unauthorized disclosure as a breach
- [HUD: HUD charges Facebook with housing discrimination (March 28, 2019)](https://archives.hud.gov/news/2019/pr19-035.cfm), the targeting and delivery allegations

**Court records**

- [CJEU press release 113/23: Meta Platforms v Bundeskartellamt, C-252/21 (July 4, 2023)](https://curia.europa.eu/jcms/upload/docs/application/pdf/2023-07/cp230113en.pdf), visiting sites that reveal sensitive data does not make it manifestly public
- [US Department of Justice: United States v. Meta Platforms, Inc. (S.D.N.Y.)](https://www.justice.gov/crt/case/united-states-v-meta-platforms-inc-fka-facebook-inc-sdny), the complaint, the June 27, 2022 judgment, the $115,054 penalty and the Guidehouse reports
- [US Department of Justice: Justice Department secures groundbreaking settlement agreement with Meta (June 21, 2022)](https://www.justice.gov/opa/pr/justice-department-secures-groundbreaking-settlement-agreement-meta-platforms-formerly-known), Special Ad Audience ended for housing ads by December 31, 2022 and the Variance Reduction System
- [Guidehouse: VRS Compliance Metrics Verification (June 29, 2023)](https://www.justice.gov/crt/media/1306541/dl), the EMD variance, privacy-enhanced BISG, the eligible audience weighting, the coverage targets for 300 and 1,000 impressions, the first period's results and the Extended Term to June 27, 2026

**Research**

- [Ali et al.: Discrimination through optimization: How Facebook's ad delivery can lead to skewed outcomes (2019)](https://arxiv.org/abs/1904.02095), delivery skew by gender and race under inclusive targeting, from budget, content and relevance predictions

**In practice**

- [Google: Personalized advertising policy](https://support.google.com/adspolicy/answer/143465), housing, employment and consumer finance restrictions in the US and Canada and the restricted sensitive interest categories
- [Meta: Marketing API, Special Ad Categories](https://developers.facebook.com/docs/marketing-api/audiences/special-ad-category), the category values, the January 2025 financial products change, country scope and the targeting restrictions
- [Meta: Discriminatory practices ad policy](https://transparency.meta.com/policies/ad-standards/unacceptable-content/discriminatory-practices/), the declaration requirement for housing, employment and financial products and its geography
- [Meta: Doing more to protect against discrimination in housing, employment and credit advertising (March 19, 2019)](https://about.fb.com/news/2019/03/protecting-against-discrimination-in-ads/), the settlements with NFHA, the ACLU and CWA and the targeting removed
- [Meta: An update on our ads fairness efforts (January 9, 2023, updated October 26, 2023)](https://about.fb.com/news/2023/01/an-update-on-our-ads-fairness-efforts/), how VRS measures delivery and its extension to US employment and credit ads
- [TikTok: Housing, Employment, and Credit ad policy (April 2026)](https://ads.tiktok.com/help/article/housing-employment-credit-hec-ad-policy), the self-declaration toggle and the targeting removed in the US and Canada
