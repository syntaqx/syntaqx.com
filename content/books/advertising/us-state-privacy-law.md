+++
title = "US State Privacy Law for Advertising"
nav_title = "US State Privacy Law"
description = "State privacy law for ad systems: sale, sharing and targeted ads, the laws in force, Maryland, sensitive data, contracts, risk assessments, enforcement."
category = "Advertising Industry"
order = 2957
part = "Privacy and Law"
tags = ["advertising", "privacy", "ccpa", "state-law", "enforcement", "data-model"]
+++

The United States has no federal privacy law for advertising. It has state laws, nineteen comprehensive ones in force as of November 2026 and four more enacted in 2026 that take effect from 2027, and nearly every one of them was written with advertising in mind. California's defines "sharing" as disclosure "for cross-context behavioral advertising"; the others give a right to opt out of "targeted advertising" by name; all of them define "sale" broadly enough that a pixel or a bid request can be one. A publisher, an ad network, an SSP, a DSP and an advertiser each have to decide, for each state, which of their data flows is a sale, a share, targeted advertising or a service provided under contract, and build the system so that an opt-out turns off exactly the flows it should.

It is hard because the categories are legal ones and the data flows are technical ones, and they don't line up. The same bid request is a sale to one bidder (a third party that may use the data for its own purposes), not a sale to another (a service provider bound by contract), and targeted advertising or not depending on whether the bidder's targeting draws on activity from other sites. Maryland's law, in force since October 2025, bans the sale of sensitive data even with consent. California's regulator now requires risk assessments before selling or sharing. And enforcement, which was one California case a year in 2022, is now a steady sequence of orders against publishers, retailers, apps, automakers and streaming services, nearly all of them about advertising technology.

This chapter covers how the laws define sale, sharing and targeted advertising, which laws are in force and what differs between them for an ad system, Maryland, sensitive data, minors' data under state law, the contracts that turn a third party into a service provider, California's risk assessment and automated decision-making rules, and the enforcement record. It extends `organizations` and `ad_requests` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and the consent signal model in [Consent Management & the TCF](/books/advertising/consent-and-the-tcf#the-consent-signal-model). The signals that carry an opt-out (GPP, GPC, persistent opt-outs) and how they propagate are [GPP, GPC & US Opt-Outs](/books/advertising/gpp-gpc-and-us-opt-outs). The Commerce volume owns the state laws from a store's seat, with the full list of laws and dates, thresholds and the CCPA's request clocks ([The US State Laws](/books/commerce/customers-and-accounts#the-us-state-laws), [CCPA in Practice](/books/commerce/customers-and-accounts#ccpa-in-practice)); the playbook's [CCPA and CPRA](/docs/compliance/gdpr#ccpa-and-cpra) is the general summary. Data broker registration and California's DROP are Data Brokers & Third-Party Data; health data laws such as Washington's My Health My Data Act are [Sensitive Data & Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting); minors are [Children, Teens & Advertising](/books/advertising/children-and-teens).

## How the Platforms Do It

The rules are best read through the enforcement record, because the orders say what regulators think the words mean in an ad system. California's actions that turned on advertising technology, from the Attorney General's and the CPPA's announcements, as of November 2026:

| Company (regulator, date) | Amount | What the regulator alleged |
| --- | --- | --- |
| **Disney** (Attorney General, February 11, 2026) | $2.75 million | Opt-outs not applied across Disney+, Hulu and ESPN+ accounts and linked devices |
| **DoorDash** (Attorney General, February 21, 2024) | $375,000 | Customer data sold through marketing co-ops "without providing notice or the opportunity to opt-out" |
| **General Motors** (Attorney General, May 8, 2026) | $12.75 million | OnStar driving and location data sold to two data brokers without disclosure |
| **Healthline** (Attorney General, July 1, 2025) | $1.55 million | No working opt-out of targeted advertising; article titles suggesting diagnoses shared; contracts without the required terms |
| **Honda** (CPPA, March 12, 2025) | $632,500 | Excessive verification for opt-outs, a privacy choice tool that did not treat choices evenly, barriers for authorized agents, ad tech sharing without required contracts |
| **Jam City** (Attorney General, November 21, 2025) | $1.4 million | No compliant opt-out in any of its 21 mobile apps; data of users aged 13 to 15 shared without opt-in consent |
| **Sephora** (Attorney General, August 24, 2022) | $1.2 million | Third-party trackers were a sale; GPC not honored; not cured within 30 days |
| **Sling TV** (Attorney General, October 30, 2025) | $530,000 | No opt-out within its apps; no kids' profile option |
| **Tilting Point** (Attorney General, June 19, 2024) | $500,000 | Children's data collected and shared through misconfigured SDKs without parental consent |
| **Todd Snyder** (CPPA, May 6, 2025) | $345,178 | Opt-outs unprocessed for 40 days by a misconfigured portal |
| **Tractor Supply** (CPPA, September 30, 2025) | $1.35 million | No effective opt-out, including GPC; no contracts with recipients |

Three patterns:

- **Ad tech on a page is a sale until a contract says otherwise.** Sephora established it, and Honda, Healthline and Tractor Supply added that the contracts with ad tech recipients must contain the terms the law requires; a recipient without them is a third party, and every flow to it is a sale.
- **Every surface needs its own opt-out.** Web-only opt-outs failed in Sling TV and Lyft; device-only opt-outs failed in Disney; app SDKs failed in Jam City and Tilting Point. A connected TV app and a mobile game are as covered as a website.
- **The law reaches data the user didn't think of as advertising.** GM's driving data and DoorDash's co-op lists weren't ad tags, but selling them to data brokers and co-ops for marketing is the same right.

The other states enforce too, and the regulators coordinate: California's agency and others formed a bipartisan Consortium of Privacy Regulators in April 2025, and by October 8, 2025 "ten different privacy regulators" had joined. On September 9, 2025 the CPPA and the Attorneys General of California, Colorado and Connecticut announced a joint sweep of businesses not honoring GPC.

## Sale, Sharing and Targeted Advertising

California's statute has the three definitions an ad system needs, and the other states' laws use the same ideas with variations.

- **Sale.** "Selling, renting, releasing, disclosing, disseminating, making available, transferring, or otherwise communicating" personal information "to a third party for monetary or other valuable consideration" (Civil Code 1798.140(ad)). Valuable consideration doesn't have to be money, which is how the Attorney General treated Sephora's third-party trackers as a sale.
- **Sharing.** The same verbs, "to a third party for cross-context behavioral advertising, whether or not for monetary or other valuable consideration" (1798.140(ah)). Sharing exists so that a free ad tag is covered even if no one would call it a sale.
- **Cross-context behavioral advertising.** "The targeting of advertising to a consumer based on the consumer's personal information obtained from the consumer's activity across businesses, distinctly branded internet websites, applications, or services, other than the business... with which the consumer intentionally interacts" (1798.140(k)).

The other states give a right to opt out of **targeted advertising**, defined in each law along the same lines (ads based on activity over time and across unaffiliated sites or apps), with exclusions for ads based on the person's activity on the controller's own sites, contextual ads, and ads in response to the person's own request. The state-by-state text is the place to confirm a detail; the shape is the same everywhere. <!-- source-gap: adv-state-targeted-ad-definitions | missing | the targeted advertising definitions and exclusions in each non-California state law | closes with: the enacted texts (e.g. Va. Code 59.1-575, Colo. Rev. Stat. 6-1-1303, Conn. Gen. Stat. 42-515) | checked: 2026-11-22 -->

What follows for each kind of flow:

| Flow | Usually | What changes it |
| --- | --- | --- |
| A publisher's own first-party ads (its audiences, its site) | Not sale, not cross-context | Using the audience on another site, or letting a vendor use it for its own purposes |
| Contextual ads (by page, not person) | Not targeted advertising | Logging the person's visit into a cross-site profile |
| A bid request to a DSP that may use it to build profiles | Sale or sharing | The DSP being a service provider under a contract that forbids that use (and the exchange enforcing it) |
| An ad network's tag that retargets across sites | Sharing | Nothing: retargeting is cross-context by definition |
| A conversion pixel to an ad platform | Sharing, if the platform uses it for targeting beyond this advertiser | The platform's restricted mode (Google RDP, Meta LDU) under service provider terms |
| A measurement vendor counting impressions for the advertiser | Service provider, if contracted | The vendor using the data to build its own panel or graph |
| A list upload to a social platform for a custom audience | Sharing, unless the platform acts as service provider for that list | The platform's terms for that product in that state |

**The service provider exception is a contract, and the regulation says so.** CCPA regulation 7026(f)(1) puts it plainly: "Service providers or contractors collecting personal information pursuant to the written contract with the business required by the CCPA and these regulations does not constitute a sale or sharing". The written contract is the whole exception. A recipient without it is a third party; a recipient with it that uses the data for cross-context advertising for others is outside it. That is why the platforms' restricted modes exist: Meta says that under Limited Data Use it will "process that data in accordance with our role as a service provider or processor," and Google says RDP means it will "limit how it uses data and only serve non-personalized ads."

## The State Laws in Force

The full list with effective dates and thresholds is Commerce's [The US State Laws](/books/commerce/customers-and-accounts#the-us-state-laws); IAPP's overview (last updated October 27, 2025) counts "the 19 states that have passed comprehensive privacy laws," and the four 2026 enactments take effect between 2027 and 2028 (Louisiana and Oklahoma on January 1, 2027, Alabama on May 1, 2027, Vermont on January 1, 2028, by a law firm's October 2026 summary). <!-- source-gap: adv-2026-state-laws-dates | secondary | effective dates of the Louisiana, Oklahoma, Alabama and Vermont 2026 privacy laws | closes with: the enacted bills or AG pages | checked: 2026-11-22 --> For an ad system, the laws differ on the points that change the code, not on the rights, which are nearly uniform (access, deletion, correction, portability, and opt-outs of sale, targeted advertising and profiling for significant decisions):

- **Opt-out preference signals.** California requires GPC to be honored as an opt-out of sale and sharing, and other states' laws require honoring a universal opt-out mechanism from dates written into each statute. The `privacy_jurisdictions` table below carries the date per state rather than a list in prose, because the dates are what change. <!-- source-gap: adv-state-uoom-dates | missing | the date each state requires honoring universal opt-out mechanisms such as GPC | closes with: each state statute's UOOM provision or AG guidance (Colorado's AG page returned no content) | checked: 2026-11-22 -->
- **Sensitive data: opt-in, opt-out, or ban.** Virginia requires consent to process sensitive data (its GPP section encodes it as consent), as do other states whose laws use opt-in; California gives a right to limit its use instead; Maryland forbids selling it at all.
- **Minors.** California requires opt-in for sale or sharing of data of consumers known to be under 16; Maryland bans targeted advertising to known 13 to 17 year olds; others add their own teen rules. Children, Teens & Advertising has them.
- **Cure periods.** Several states gave businesses a period to cure a violation after notice, and some of those periods have ended (Oregon's expired January 1, 2026 by MultiState's account). The table records the end date. <!-- source-gap: adv-state-cure-periods | secondary | Oregon cure period expiry January 1, 2026 and other states' cure period ends | closes with: the statutes' cure provisions or AG guidance | checked: 2026-11-22 -->
- **Enforcer.** Every state's Attorney General; California also has the CPPA, an agency with its own administrative fines.

California's fines are set by statute and adjusted for inflation: "not more than two thousand five hundred dollars ($2,500)" per violation and "seven thousand five hundred dollars ($7,500)" for intentional violations or those involving consumers known to be under 16, before adjustment (1798.155); the Commerce chapter gives the current adjusted figures.

### Maryland

Maryland's Online Data Privacy Act (Chapter 455 of 2024, approved May 9, 2024) took effect October 1, 2025; its data protection assessment section applies only prospectively, not to processing activities "before April 1, 2026". It is the strictest state law for advertising:

- **Minimization, not notice.** Collection of personal data is limited to what is "reasonably necessary and proportionate" to provide or maintain the product or service the consumer requested. Most states allow any purpose disclosed in a notice; Maryland's test is necessity for what the person asked for, and ad targeting is rarely what they asked for.
- **Sensitive data only when strictly necessary.** A controller may not collect, process or share sensitive data unless "strictly necessary to provide or maintain a specific product or service requested." The enrolled text struck the consent alternative, so consent doesn't unlock it.
- **No sale of sensitive data.** "A controller may not sell sensitive data", with no consent exception.
- **No targeted advertising to teens.** No targeted advertising, and no sale of personal data without consent, where the controller "knew or should have known" the consumer is 13 to under 18. "Should have known" reaches an ad platform whose own signals (an interest graph, a teen-heavy app) suggest a minor.
- **Thresholds.** 35,000 consumers (excluding payment-only data), or 10,000 consumers and more than 20% of gross revenue from selling personal data: low enough to reach a mid-size publisher.

For an ad system, Maryland is where "sensitive" stops being a consent screen and becomes a targeting rule: a segment derived from sensitive data can't be built for Maryland residents, and can't be sold if it is.

## Sensitive Data Under State Law

California's list of **sensitive personal information** (1798.140(ae)) includes government identifiers, account credentials, a consumer's "precise geolocation", racial or ethnic origin, citizenship or immigration status, religious or philosophical beliefs, union membership, the contents of private communications, genetic data, "neural data", biometric processing for identification, and "personal information collected and analyzed concerning a consumer's health," sex life or sexual orientation. Precise geolocation is defined by radius: data "used or intended to be used to locate a consumer within a geographic area that is equal to or less than the area of a circle with a radius of 1,850 feet" (1798.140(w)).

The other states use similar lists with additions (Kentucky, for example, adds automated content recognition data from July 1, 2027, by one law firm's account), and the rule attached differs:

| Rule | Where | What the ad system does |
| --- | --- | --- |
| **Right to limit use** | California | Honor a limit request by stopping uses beyond those the regulations permit, including inferring characteristics for ads |
| **Opt-in consent** | Virginia and other opt-in states (Virginia's GPP section encodes it as consent) | No sensitive-data targeting without a recorded consent for that state |
| **Ban on sale** | Maryland; Oregon and Virginia for precise geolocation by 2025 and 2026 amendments (secondary sources) | No sensitive segments for sale, consent or not |

<!-- source-gap: adv-geo-sale-bans | secondary | Oregon HB 2008 and Virginia 2026 amendment banning the sale of precise geolocation data | closes with: the enrolled bills on oregonlegislature.gov and lis.virginia.gov | checked: 2026-11-22 -->

The engineering form is a flag on the data, not on the campaign. A taxonomy node, a targeting key or an audience built from sensitive data is marked sensitive where it's defined (Targeting & Taxonomies' `taxonomy_nodes.sensitive`, Campaigns & Line Items' `targeting_keys.sensitive`, First-Party Data & Audiences' sensitive review on `audiences`), and the jurisdiction rules decide what that flag means for a request from each state. [Sensitive Data & Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting) covers health and location data in depth.

## Minors Under State Law

California's statute flips the default for minors: a business "shall not sell or share the personal information of consumers if the business has actual knowledge that the consumer is less than 16 years of age," unless a consumer aged 13 to 15, or a parent for one under 13, "has affirmatively authorized" it, and "a business that willfully disregards the consumer's age shall be deemed to have had actual knowledge" (1798.120(c)). Jam City's order is that rule applied to a mobile game: data of users aged 13 to 15 shared without opt-in. Maryland's teen ban goes further. For an ad request, a known age band below the jurisdiction's threshold turns the US opt-out regime into an opt-in one, which is why the age band is part of the consent signal model; [Children, Teens & Advertising](/books/advertising/children-and-teens#teens) has the state rules.

## Contracts and Roles

Every recipient of personal data from an ad system has a role in each regime, and the role decides whether the flow is a sale:

- **Service provider** (California) or **processor** (most other states): processes on the business's behalf under a written contract with the required terms (purpose limited to the contracted services, no selling or sharing, no combining with other data except as permitted, compliance and audit rights). Flows to it are not sales.
- **Contractor** (California): a party the business makes data available to for a business purpose under a contract with similar terms.
- **Third party:** anyone else. Flows to it for consideration are sales; for cross-context advertising, sharing.
- **MSPA signatory:** a party that signed the Multi-State Privacy Agreement, which springs into force between signatories when personal information flows between them to deliver an ad, supplying the contract terms automatically ([The US National Section and the MSPA](/books/advertising/gpp-gpc-and-us-opt-outs#the-us-national-section-and-the-mspa)).

The enforcement point is that the role is a document, not a claim. Honda's order turned on sharing with ad tech companies without contracts containing the required terms; Healthline's on not verifying that advertising partners had agreed to the required protections; Tractor Supply's on disclosures without contracts. Each recipient in the system needs an agreement on file with its role per regime, the terms the law requires checked off, and dates. That record also answers the EU question for the same counterparty, controller, processor or joint controller under GDPR, which GDPR & ePrivacy for Ads covers; one table holds both.

## Risk Assessments and Automated Decisions

California's regulations on risk assessments, cybersecurity audits and automated decision-making technology (ADMT), approved by the Office of Administrative Law as the CPPA announced on September 23, 2025, took effect January 1, 2026. For advertising, the trigger is in the first line of the list: "Each of the following processing activities presents significant risk to consumers' privacy: (1) Selling or sharing personal information," followed by processing sensitive personal information (section 7150(b)). An ad-supported business that sells or shares must:

- **Assess before processing.** Conduct and document the assessment "before initiating" the activity (7155(a)(1)); for processing that began before January 1, 2026 and continues, by December 31, 2027 (7155(b)).
- **Review and update.** At least every three years, and within 45 calendar days of a material change, such as a change of purpose, of the minimum personal information needed, or new risks consumers raise (7155(a)(2) and (3)).
- **Retain.** Original and updated versions for as long as the processing continues or five years after completion, whichever is later (7155(c)).
- **Submit.** Attestations to the agency, with the first due April 1, 2028, by the CPPA's announcement.

Section 7150(b)(5) also lists using automated processing to infer a consumer's health, economic situation, preferences, interests, behavior or movements "based upon that consumer's presence in a sensitive location", which is a geofenced audience by another name. ADMT obligations attach to "significant decisions" (financial, housing, employment, education, health care), which ad delivery generally isn't, with compliance from January 1, 2027; ads for housing, employment and credit are where the two meet, covered in [Sensitive Data & Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting).

A risk assessment is a record per processing activity, not per company: "selling or sharing to programmatic demand partners", "custom audience uploads to social platforms", "precise location for store-visit measurement". Each one names the data, the purpose, the recipients, the safeguards and the residual risk, and changes to any of those reopen it.

## Enforcement

The California record, from the table above, shows how regulators find violations: by visiting the site or app with GPC on, opting out, and watching the network traffic. Sephora was found that way; the 2025 GPC sweep made it routine. The test is cheap for a regulator and should be cheaper for the business, which is why the Auditing section below includes it.

Three things recur in the orders and translate directly into requirements:

- **The opt-out must work on every surface and every identity.** Web, app, CTV, and across accounts and devices linked to the person (Disney, Sling TV, Lyft, Jam City).
- **The opt-out must not cost the person anything.** No verification for an opt-out (Honda, Todd Snyder), no asymmetric choice where accepting is one click and refusing is three (Honda), no barriers for authorized agents.
- **The contracts must exist.** Every recipient is either under a compliant contract or treated as a third party (Honda, Healthline, Tractor Supply).

## How to Build It

Three tables hold what this chapter adds: the jurisdiction rules as data, the role and terms for each counterparty, and the risk assessments for each processing activity. The request carries a pointer to the jurisdiction rule it was decided under through `privacy_rule_versions` (Consent Management & the TCF), which references a snapshot of `privacy_jurisdictions`.

```sql
CREATE TABLE privacy_jurisdictions (       -- one version of one state's (or country's) rules
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  code                     TEXT NOT NULL,          -- 'US-CA', 'US-MD', 'EU', 'GB', ...
  law_name                 TEXT NOT NULL,          -- e.g. 'Maryland Online Data Privacy Act'
  version                  INT NOT NULL,
  in_force_from            DATE NOT NULL,
  applies_to_processing_from DATE,                 -- e.g. Maryland's assessment section: April 1, 2026
  gpp_section_id           SMALLINT,               -- 8 for usca, 9 for usva, ...
  opt_out_scopes           TEXT[] NOT NULL,        -- {'sale','sharing','targeted_advertising'}
  honors_gpc_from          DATE,                   -- universal opt-out mechanism date; null: not required
  sensitive_rule           TEXT NOT NULL CHECK (sensitive_rule IN ('right_to_limit',
                             'opt_in', 'strictly_necessary_no_sale')),
  precise_geo_radius_ft    INT,                    -- 1,850 in California's definition
  precise_geo_sale_banned  BOOLEAN NOT NULL DEFAULT FALSE,
  minor_opt_in_below_age   SMALLINT,               -- California: 16
  teen_targeting_ban_below_age SMALLINT,           -- Maryland: 18
  teen_knowledge_standard  TEXT CHECK (teen_knowledge_standard IN ('actual', 'willful_disregard',
                             'knew_or_should_have_known')),
  cure_period_ends         DATE,
  thresholds               JSONB NOT NULL,         -- consumers, revenue share from sales, as enacted
  source_ref               TEXT NOT NULL,          -- statute citation or URL relied on
  approved_by              TEXT NOT NULL,          -- typed actor, counsel sign-off
  UNIQUE (code, version)
);

CREATE TABLE privacy_agreements (          -- a counterparty's role and terms under one regime
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  org_id                   UUID NOT NULL REFERENCES organizations (id),  -- this system's company
  counterparty_org_id      UUID NOT NULL REFERENCES organizations (id),
  regime                   TEXT NOT NULL CHECK (regime IN ('ccpa', 'us_state_other', 'mspa',
                             'gdpr', 'uk_gdpr')),
  direction                TEXT NOT NULL CHECK (direction IN ('we_disclose', 'we_receive')),
  role                     TEXT NOT NULL CHECK (role IN ('service_provider', 'contractor',
                             'processor', 'third_party', 'controller', 'joint_controller')),
  terms_present            TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {'purpose_limited','no_sale',
                                                          -- 'no_combination','audit','deletion_assist'}
  mspa_signatory_id        INT,                    -- when regime = 'mspa'
  document_ref             TEXT NOT NULL,          -- signed agreement, terms URL and version
  valid_during             DATERANGE NOT NULL,
  reviewed_at              TIMESTAMPTZ NOT NULL,
  EXCLUDE USING gist (org_id WITH =, counterparty_org_id WITH =, regime WITH =,
    direction WITH =, valid_during WITH &&),       -- needs btree_gist
  CHECK ((regime = 'mspa') = (mspa_signatory_id IS NOT NULL))
);

CREATE TABLE privacy_risk_assessments (    -- one documented assessment of one processing activity
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  org_id                   UUID NOT NULL REFERENCES organizations (id),
  activity                 TEXT NOT NULL,          -- e.g. 'sale_to_programmatic_demand'
  trigger                  TEXT NOT NULL CHECK (trigger IN ('selling_or_sharing',
                             'sensitive_personal_information', 'admt_significant_decision',
                             'sensitive_location_inference', 'other')),
  jurisdiction_code        TEXT NOT NULL,          -- 'US-CA'; other states' DPIAs reuse the table
  version                  INT NOT NULL,
  data_categories          TEXT[] NOT NULL,
  recipient_org_ids        UUID[] NOT NULL DEFAULT '{}',
  safeguards               TEXT NOT NULL,
  conclusion               TEXT NOT NULL CHECK (conclusion IN ('proceed', 'proceed_with_changes',
                             'do_not_proceed')),
  completed_at             TIMESTAMPTZ NOT NULL,
  next_review_due          DATE NOT NULL,          -- within three years
  material_change_ref      TEXT,                   -- what reopened it; update within 45 days
  supersedes_id            UUID REFERENCES privacy_risk_assessments (id),
  retain_until             DATE NOT NULL,          -- five years after completion, or longer
  UNIQUE (org_id, activity, jurisdiction_code, version)
);

ALTER TABLE ad_requests ADD COLUMN privacy_jurisdiction_id UUID;  -- the rule set applied
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_privacy_jurisdiction_fk
  FOREIGN KEY (privacy_jurisdiction_id) REFERENCES privacy_jurisdictions (id) NOT VALID;
```

Design notes:

- **Law is data with a source and an approver.** Every jurisdiction row cites what it relies on and who signed off, and a change is a new version effective from a date. When Oklahoma's law takes effect on January 1, 2027, the change is a row approved in advance, not a deploy on New Year's Eve.
- **The role decides the flow.** The per-callout decision in GPP, GPC & US Opt-Outs reads `privacy_agreements` for the bidder and the regime: `service_provider`, `contractor` or `processor` with the required terms present may receive data for delivery and measurement after an opt-out; anything else is a third party and gets the stripped request. A counterparty with no row is a third party.
- **Terms are checked, not assumed.** `terms_present` lists the clauses verified in the document, so a contract missing the no-combination clause can't quietly count as a service provider agreement; the enforcement orders turned on exactly that.
- **One table for every regime.** The same counterparty is a CCPA service provider, an MSPA signatory and a GDPR processor or joint controller; the regime column keeps them apart and GDPR & ePrivacy for Ads reuses the table.
- **Assessments are per activity and versioned.** A new recipient class, a new data category or a new purpose is a material change that creates a new version within 45 days; `next_review_due` drives a reminder; `retain_until` keeps the old versions as long as the regulation requires.
- **Sensitive rules come from the jurisdiction.** A request from Maryland with a sensitive targeting key fails the targeting check before the auction; the check reads `sensitive_rule` and the flags on taxonomy nodes and audiences.

Recipients that received personal data in California in the last week without a service provider, contractor or MSPA basis on file, the Honda and Tractor Supply question as a query:

```sql
SELECT b.bidder_org_id, count(*) AS callouts_with_personal_data
FROM bid_requests b
JOIN auctions a    ON a.started_at = b.auction_started_at AND a.id = b.auction_id
JOIN ad_requests r ON r.id = a.ad_request_id
                  AND r.received_at BETWEEN a.started_at - interval '1 minute' AND a.started_at
JOIN privacy_jurisdictions j ON j.id = r.privacy_jurisdiction_id AND j.code = 'US-CA'
LEFT JOIN privacy_agreements pa
       ON pa.counterparty_org_id = b.bidder_org_id
      AND pa.regime IN ('ccpa', 'mspa')
      AND pa.direction = 'we_disclose'
      AND pa.role IN ('service_provider', 'contractor')
      AND pa.valid_during @> r.received_at::DATE
WHERE b.personal_data_sent
  AND b.sent_at >= now() - interval '7 days'
  AND pa.id IS NULL
GROUP BY b.bidder_org_id;
```

The result is not by itself a violation: a bidder without a service provider agreement may lawfully receive data for a person who hasn't opted out, as a sale disclosed in the notice. It is the list of recipients that must be cut off the moment that person opts out, and the list a regulator will ask about.

## Auditing

- **Which rules decided each request.** The jurisdiction version and rule version on every request, so a decision in March is judged against March's rules.
- **Every counterparty's role.** The agreement, role, regime, verified terms and dates for every company the system discloses to or receives from, and when each was last reviewed.
- **Every risk assessment.** Each activity's assessment, versions, the material changes that reopened it, the review dates and the attestations submitted.
- **The opt-out test, run from outside.** Scheduled synthetic visits to each property and app from California and Maryland with GPC on and after opting out, capturing the outgoing requests and checking that no third party received identifiers. The regulators run the same test.
- **Requests for which the jurisdiction was inferred.** Where `gpp_sids` was missing and geolocation decided the state, so the share of guessed jurisdictions is visible and falling.

## What This Means for the System You Build

- **Classify every data flow** as first-party, contextual, service provider, contractor or third party, per state, and treat a flow to a recipient without a compliant contract as a sale.
- **Keep the contracts as records** with role, regime, verified terms and dates, and make the per-recipient decision read them.
- **Put the law in versioned data** (opt-out scopes, GPC dates, sensitive-data rules, minor ages, cure periods, thresholds) with sources and approvals.
- **Mark sensitive data where it's defined** and let each state's rule decide what the mark means, including Maryland's ban on sale with or without consent.
- **Treat a known minor as opted out by default** where the state requires opt-in, and record the age signal that decided it.
- **Assess before you sell or share,** per activity, and reopen the assessment when the recipients, data or purpose change.
- **Test opt-outs on every surface and identity** the way regulators do, from the outside, with GPC on.

## References

**Regulation**

- [CPPA: California Consumer Privacy Act (effective January 1, 2026)](https://cppa.ca.gov/pdf/20260101_ccpa_statute.pdf), definitions of sale, sharing, cross-context behavioral advertising, sensitive personal information and precise geolocation; 1798.120(c) on minors; 1798.155 fines
- [CPPA: CCPA Regulations (effective January 1, 2026)](https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf), 7026(f)(1) on service providers and opt-outs, 7150 risk assessment triggers, 7155 timing and retention
- [CPPA: California finalizes regulations (September 23, 2025)](https://cppa.ca.gov/announcements/2025/20250923.html), the ADMT, risk assessment and cybersecurity audit rules, effective dates and attestation deadlines
- [Maryland General Assembly: SB 541 (2024), Maryland Online Data Privacy Act](https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/sb0541?ys=2024RS), approval and effective date
- [Maryland: Chapter 455 of 2024, enrolled text](https://mgaleg.maryland.gov/2024RS/Chapters_noln/CH_455_sb0541e.pdf), minimization, sensitive data, the sale ban, the teen targeting ban, thresholds and the April 1, 2026 processing date
- [California Attorney General: Privacy enforcement actions](https://oag.ca.gov/privacy/privacy-enforcement-actions), the Disney, DoorDash, General Motors, Jam City, Lyft, Sling TV and Tilting Point settlements
- [California Attorney General: Sephora settlement (August 24, 2022)](https://oag.ca.gov/news/press-releases/attorney-general-bonta-announces-settlement-sephora-part-ongoing-enforcement), trackers as a sale, GPC and the cure period
- [California Attorney General: Healthline settlement (July 1, 2025)](https://oag.ca.gov/news/press-releases/attorney-general-bonta-announces-largest-ccpa-settlement-date-secures-155), targeted advertising opt-out, purpose limitation and contract terms
- [CPPA: Honda settlement (March 12, 2025)](https://cppa.ca.gov/announcements/2025/20250312.html), verification, asymmetric choices, agents and missing contracts
- [CPPA: Todd Snyder order (May 6, 2025)](https://cppa.ca.gov/announcements/2025/20250506.html), the unprocessed opt-outs
- [CPPA: Tractor Supply order (September 30, 2025)](https://cppa.ca.gov/announcements/2025/20250930.html), opt-outs, GPC and contracts
- [CPPA: Joint investigative privacy sweep (September 9, 2025)](https://cppa.ca.gov/announcements/2025/20250909.html), the GPC sweep
- [CPPA: Minnesota and New Hampshire join the Consortium of Privacy Regulators (October 8, 2025)](https://cppa.ca.gov/announcements/2025/20251008.html), ten regulators in the consortium

**Reference**

- [IAPP: US State Privacy Legislation overview](https://iapp.org/resources/article/us-state-privacy-laws-overview), the count of 19 states and the years each passed
- [MultiState: Comprehensive privacy laws that take effect in 2026](https://multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026), Oregon's cure period and geolocation rules (secondary)
- [Benesch: Alabama, Louisiana, Oklahoma and Vermont join the compliance landscape (October 12, 2026)](https://www.beneschlaw.com/insight/the-privacy-patchwork-grows-alabama-louisiana-oklahoma-and-vermont-join-the-compliance-landscape/), the four 2026 laws and their effective dates (secondary)
- [Moore & Van Allen: Privacy in bloom, four states reshape the landscape](https://www.mvalaw.com/data-points/privacy-in-bloom-four-states-reshape-the-data-protection-landscape-this-spring), Virginia's geolocation sale ban and Kentucky's ACR amendment (secondary)

**In practice**

- [Meta for Developers: Data Processing Options](https://developers.facebook.com/docs/marketing-apis/data-processing-options), Limited Data Use and Meta's service provider role
- [Google Ad Manager Help: Restricted data processing](https://support.google.com/admanager/answer/9598414?hl=en), what Google does under RDP
- [IAB Privacy: Multi-State Privacy Agreement](https://www.iabprivacy.com/), the springing contract among signatories
