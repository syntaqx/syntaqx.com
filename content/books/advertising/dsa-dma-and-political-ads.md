+++
title = "DSA, DMA & Political Ads"
nav_title = "DSA, DMA & Political Ads"
description = "DSA ad labels, the profiling bans and ad repositories, the DMA consent rule and Meta's fine, the EU political ads regulation, and US political ad law."
category = "Advertising Industry"
order = 2960
part = "Privacy and Law"
tags = ["advertising", "dsa", "dma", "political-ads", "transparency", "regulation", "data-model"]
+++

Three bodies of law reach the ad itself rather than the data behind it. The EU's Digital Services Act (DSA) tells every online platform what a person must be able to see about each ad they are shown (that it is an ad, who it is for, who paid, why they were chosen), forbids ads based on profiling with special categories of data or aimed at minors, and makes the largest platforms keep a public repository of every ad they ran. The Digital Markets Act (DMA) tells the handful of designated gatekeepers that they may not combine personal data across their services for advertising without a specific choice and consent, which is what the Commission fined Meta €200 million for. And political advertising carries its own law on both sides of the Atlantic: the EU's regulation on the transparency and targeting of political advertising (Regulation 2024/900), and in the US a patchwork of FEC disclaimer rules, FCC broadcast rules, state disclosure and recordkeeping laws, and the platforms' own verification and library programs, which in the EU now end in the platforms refusing political ads altogether.

The engineering is hard because every one of these rules asks a question about a past impression that the delivery system only answers if it wrote the answer down at the time. "Why was I shown this?" needs the parameters that matched, not the line item's configuration today. A repository entry needs the ad's content, the payer and the targeting and exclusion parameters as they stood, and must outlive the campaign by a year. A political ad needs a sponsor declaration before it serves, a label that survives resharing, a transparency notice, and records kept for seven years in the EU or five in Washington State. The definitions are not shared: "political" means a candidate ad to the FEC, an issue ad to Meta, and almost anything liable to influence a vote to the EU regulation. And the jurisdictions overlap on the same request, so the rule set is data, versioned, with every decision recording which version it ran under.

This chapter covers DSA Articles 26, 28 and 39 from the ad system's side, the DMA's Article 5(2) and the Meta decision and commitments, the EU political advertising regulation, US political ad law (FEC, FCC, the states) and the platform programs built on it, then the records: repository entries, per-impression explanations, political ad declarations and cross-service consent. It extends `advertisers`, `creatives` and `line_items` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and reuses the consent model of [The Consent Signal Model](/books/advertising/consent-and-the-tcf#the-consent-signal-model): `ad_requests.ads_mode` and its reason codes, including `political_no_consent`, are defined there and only read here. The DSA's enforcement record (the X fine over its ad repository, TikTok's repository commitments, VLOP designation) is the User-Generated Platforms volume's [Fines, Commitments and Findings](/books/user-generated-platforms/regulators-and-enforcement#fines-commitments-and-findings); the DSA's transparency reports are its [The DSA Reports](/books/user-generated-platforms/transparency-reporting#the-dsa-reports); sensitive categories in depth are [Sensitive Data and Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting); advertiser verification as an onboarding flow is [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms), and ad libraries as products are [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising).

## How the Platforms Do It

As of November 2026, how the largest platforms handle ad transparency and political ads. A blank or "not found" is an honest one:

| Platform | Ad transparency | Political ads in the US | Political ads in the EU | AI disclosure in political ads |
| --- | --- | --- | --- | --- |
| **Google** | Ads Transparency Center, a searchable hub of ads from verified advertisers | Election ads only from verified advertisers (also Argentina, Australia, Chile, India, Israel, Mexico, New Zealand, South Africa, the UK); "Paid for by" disclosure, generated for most formats; US election ads may target only geography (no radius around a location), age, gender and contextual signals | Stopped serving political ads in the EU before the regulation applied (announced November 14, 2024) | Advertisers tick "Altered or synthetic content"; Google generates the disclosure for some formats, the advertiser supplies it for others |
| **Meta** | Ad Library; social issue, electoral and political ads kept "for seven years" | Authorization plus a verified "Paid for by" disclaimer; no new political ads in the final week of a US campaign (from October 27, 2026 for the midterms); no ads about Washington state or local officials, candidates, elections or ballot initiatives, or about Seattle legislation, may run in or target Washington | No political, electoral or social issue ads in the EU since early October 2025, except election authorities' voting logistics ads (policy version of July 1, 2026) | Advertisers must disclose photorealistic or realistic-sounding media made or edited with generative AI; from June 1, 2026 Meta also detects it and adds "AI Info" to "About this ad" |
| **TikTok** | Not covered here | "We do not allow paid political advertising," across ads, paid branded content and promotion tools; political figures and entities may not advertise at all | Same global ban | Not applicable |

Patterns worth taking from the table:

- **Verification is the gate, the disclaimer is the output.** Every platform that accepts political ads verifies the advertiser first and builds the "Paid for by" line from the verified record, not from free text in the creative. That is the same `advertiser_verifications` row [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms) adds, with `program = 'election'` and a `jurisdiction`.
- **Targeting is narrower for political ads.** Google's US rule is a whitelist; the EU regulation is stricter still (below). The targeting validator needs the political flag at setup, not after serving.
- **Exiting is a compliance strategy.** Two of the three largest ad platforms answered the EU regulation by leaving the market for political ads, which moves the burden to classifying what counts as political, since the ban only works if issue ads are caught.

## The DSA at the Ad

The DSA applies to intermediary services offered in the EU, in tiers; the ad rules sit on the "online platform" tier and above, and the repository duty on very large online platforms and search engines (designation and its clocks are UGP's [Very Large Online Platforms](/books/user-generated-platforms/regulators-and-enforcement#very-large-online-platforms)). For an ad system on a platform, three articles bind every impression.

**Article 26(1): what the person sees.** For each ad, the recipient must be able to identify, "in real time": that it is an advertisement, including through prominent markings; the natural or legal person on whose behalf it is presented; the person who paid, if different; and "meaningful information" about the main parameters used to determine the recipient and, where applicable, how to change them. Four engineering consequences:

- **The label is part of the rendered ad,** not a setting a publisher may omit. Native formats, promoted posts and shopping units all carry it.
- **"On whose behalf" and "who paid" are two fields.** An agency or a parent company often pays for a brand's ads. The advertiser comes from `advertisers`; the payer is the `campaigns.payer_name` [Social Advertising](/books/advertising/social-advertising) adds for exactly this, filled from the billing or verification record.
- **The explanation is generated from the decision.** "Main parameters" means the reasons this impression was eligible and won: the location, age band, interests or audience that matched, contextual signals, and whether the advertiser uploaded a list. It must be computed from what the decision recorded, which is why the feed decision log in Social Advertising keeps `matched_targeting`, and why this chapter adds the same column to the ad server's `ad_decisions`.
- **Lookalike and modeled audiences need an honest sentence.** "You're similar to people who visited the advertiser's site" is a parameter; a model's embedding is not something a person can be shown, so the explanation describes the audience type and source.

**Article 26(2): commercial content by users.** Platforms must let users declare that content they post is a commercial communication and then label it; creators' sponsored posts are content, not ads in the ad system, and the UGP volume's [Contextual Targeting and the Law](/books/user-generated-platforms/ads-and-data-licensing#contextual-targeting-and-the-law) covers the declaration. The disclosure duties of the influencer and the brand are Commerce's [The Endorsement Guides](/books/commerce/acquisition-and-attribution#the-endorsement-guides).

**Article 26(3): no profiling on special categories.** Platforms may not present ads "based on profiling" using the special categories of personal data in GDPR Article 9(1): racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic and biometric data, health, sex life or sexual orientation. Consent does not unlock it. Contextual ads on content about those subjects are not profiling; targeting a person because the system inferred they are in a category is. The line, the CJEU's reading of inferred sensitive data and the state-law equivalents are [Sensitive Data and Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting#the-eu-special-categories-in-ads).

**Article 28(2): no profiling ads to minors.** A platform may not present profiling-based ads when it is "aware with reasonable certainty" that the recipient is a minor, and Article 28(3) and recital 71 say this is not a reason to process more personal data to establish age. The age band on the request and what it switches off are [Children, Teens & Advertising](/books/advertising/children-and-teens).

On the request, all three resolve into the one field every consumer reads: `ad_requests.ads_mode`, with reason codes such as `known_minor` and `sensitive_context` ([The Consent Signal Model](/books/advertising/consent-and-the-tcf#the-consent-signal-model)). A ranking stage that reads its own copy of the age or the consent string, rather than the mode, is how a minor ends up in a lookalike.

## Ad Repositories

Article 39 requires a very large online platform or search engine that presents ads to keep a searchable repository "until one year after the advertisement was presented for the last time." For each ad it holds:

- the content of the ad;
- the person on whose behalf it was presented, and who paid if different;
- the period during which it was presented;
- whether it was intended to be presented specifically to one or more groups, and if so the main parameters used, including those used to exclude;
- commercial communications declared under Article 26(2);
- the total number of recipients reached, with numbers per member state for the groups targeted.

The repository may not contain personal data of the recipients the ad was shown to. When the platform removed or disabled an ad as illegal or against its terms, the entry leaves out the content, the advertiser and the payer and carries the statement-of-reasons information instead (Article 39(3)).

Four things make the repository hard in practice, and the Commission's fine on X (December 5, 2025, in part for an ad repository that was neither transparent nor reliably accessible) and TikTok's repository commitments show they are enforced ([Fines, Commitments and Findings](/books/user-generated-platforms/regulators-and-enforcement#fines-commitments-and-findings)):

- **The unit is the ad as shown, not the campaign.** A dynamic creative that assembles headlines and images produces many ads from one creative; a repository entry per `creative_versions` row, with the assembled variants listed, is the defensible grain.
- **The clock runs from the last impression.** Retention is computed, not configured: `retain_until` moves every day the ad serves, and the purge job reads it.
- **Targeting is as configured and as matched.** The configured parameters come from `line_item_versions` (the version in force when the ad served, not today's); the reach per member state comes from impressions, which means a daily roll-up by country that survives the impression logs' own retention.
- **Search is a product.** Researchers and regulators query by advertiser, payer, period, country and keyword; a repository that isn't reliably accessible is one of the defects the X decision named.

Platforms keep broader libraries than the law asks: Meta's Ad Library keeps social issue, electoral and political ads for seven years, and Google's Ads Transparency Center covers verified advertisers' ads. A system that serves several regimes (DSA, the EU political ads repository, a platform library, a state's political record) keeps one repository model with a `regime` per entry, because the content, payer and targeting are the same facts with different retention and audiences.

## The DMA and Cross-Service Data

The DMA applies to gatekeepers the Commission designates and to their designated core platform services. Article 5(2) says a gatekeeper shall not, unless the end user "has been presented with the specific choice and has given consent" within the meaning of the GDPR:

- (a) process, for providing online advertising services, the personal data of end users using third-party services that use the gatekeeper's core platform services;
- (b) combine personal data from a core platform service with personal data from its other services or from third-party services;
- (c) cross-use personal data from a core platform service in its other separately provided services;
- (d) sign users in to other services of the gatekeeper in order to combine personal data.

After a refusal or withdrawal, the gatekeeper may not repeat the request for the same purpose more than once within a year. Recital 37 adds that not giving consent "should not be more difficult than giving consent", and that the less personalized alternative should not be of lower quality except where that is a direct consequence of using less data.

On April 23, 2025, the Commission found that Meta breached Article 5(2) with its "consent or pay" model, which gave EU users of Facebook and Instagram no equivalent option using less of their personal data, and fined it €200 million (the same day it fined Apple €500 million under the anti-steering rules). On December 8, 2025, Meta committed to give EU users a choice of a less personalized ads option, presented from January 2026. As of November 2026 I have not found a Commission decision on whether the January 2026 design complies; the consumer organization BEUC argued in March 2026 that the less personalized option still was not offered upfront on an equal footing. <!-- source-gap: adv-dma-meta-2026-compliance | status | Whether the Commission has accepted or rejected Meta's January 2026 less-personalized-ads design under DMA Art. 5(2), and any periodic penalty decision | closes with: a Commission DMA decision or press release after January 2026 on Meta's compliance | checked: 2026-11-22 -->

For a gatekeeper's ad system the rule turns into three requirements:

- **Consent per combination, not per platform.** The four prohibitions are separate purposes; a user can agree to their Instagram activity informing Facebook ads and refuse third-party site data. Each is its own record with its own refusal clock.
- **The less-personal option is an ads mode.** It is `ads_mode = 'non_personalized'` on every request from that user (not `limited`, which means no device storage at all), read by retrieval, ranking and frequency capping alike, with the reason recorded. Contextual signals and the current session remain available; cross-service history does not.
- **The re-ask clock is enforced in code.** The law allows one repeat request for a refused purpose within a year; a second is a violation. My default is to spend none of it: no prompt for a purpose the user refused less than a year ago, so the prompt service reads the refusal date before rendering.

How "pay or consent" plays out under the GDPR, and the EDPB's opinion on large platforms, is [Pay or Consent](/books/advertising/gdpr-and-eprivacy-for-ads#pay-or-consent) in GDPR & ePrivacy for Ads.

## EU Political Advertising

Regulation (EU) 2024/900 on the transparency and targeting of political advertising applies from October 10, 2025 (its definitions and the non-discrimination rule for providers applied from entry into force in 2024). It is two regulations in one: transparency duties for everyone in the chain, and limits on targeting for anyone using personal data.

**Identifying political advertising.** Providers must ask sponsors to declare whether a service is a political advertising service (Article 7), and whether a message is a political advertisement turns on all its features: the content, the sponsor, the language, the context, the means of dissemination, the target audience and the objective (Article 8). Issue ads can qualify on those features, which is why a platform's classifier, not only the sponsor's declaration, decides what gets the treatment.

**Records and labels.** Providers keep records of each political advertising service, including the sponsor's identity and whether funds came from inside or outside the Union, in machine-readable form for seven years (Article 9). Each ad carries a label: a clear statement that it is political advertising, the sponsor's identity and related details, prominent and staying with the ad when it is redistributed (Article 11). The transparency notice (Article 12) states, among other things, the sponsor and any entity controlling it, the amounts paid and other benefits, the period of publication, aggregated amounts for the campaign and the methodology used to calculate them, and must be kept for seven years after the last publication.

**The European repository.** The Commission runs a public repository for all online political ads published in the Union (Article 13), into which publishers make their ads and transparency notices available: publishers other than very large online platforms and search engines no later than 72 hours after first publication, while those platforms make them available through their DSA repositories.

**Third-country sponsors.** In the three months before an election or referendum, political advertising services may be provided only to sponsors who declare they are EU citizens, third-country nationals permanently resident in the Union and entitled to vote in that election, or legal persons established in the Union and not ultimately controlled by third-country persons (Article 5(2)).

**Targeting (Article 18).** Targeting and ad-delivery techniques that process personal data for online political ads are allowed only when the data was collected from the data subject, the data subject gave explicit consent "separately for the purpose of political advertising", and the technique does not involve profiling with special categories of data. They are banned outright for people known with reasonable certainty to be at least one year under the voting age. Controllers using targeting must publish an internal policy on the techniques, keep records of their use, and provide each ad with information on the logic and parameters (Article 19), the policy kept for seven years after last use. Recital 78 gives, as an example of limiting targeting options, allowing only combinations of up to five categories.

**Penalties.** Member states set them, with maximum fines of 6% of the provider's annual income or budget, or 6% of annual worldwide turnover (Article 25); breaches of the targeting rules in Articles 18 and 19 are fined under the GDPR's regime instead.

What it means for an ad platform is a choice. Either build the declaration, the classifier, the label, the notice, the seven-year records, the repository feed, the separate explicit consent and the targeting limits, or stop selling political ads in the EU and build the classifier anyway, because an issue ad that slips through a ban still breaks the law. Google announced on November 14, 2024 that it would stop serving political ads in the EU, including qualifying paid promotions on YouTube, before the regulation applied; Meta stopped political, electoral and social issue ads in the EU from early October 2025. On the request, a political line item in the EU with no separate political consent resolves to `ads_mode` with reason `political_no_consent`, and delivery falls back to contextual serving or none.

## US Political Ad Law

The US regulates political ads by medium, and the medium that carries the most spend online has the least federal law.

**FEC disclaimers.** Federal campaign law requires a disclaimer saying who paid on many public communications about federal elections; who must include one is set out in 11 CFR 110.11. The FEC's rule on internet communication disclaimers, approved December 1, 2022 and effective March 1, 2023, redefined "public communication" to include communications "placed for a fee on another person's website, digital device, application, or advertising platform", the definition that brings paid social, search and display ads in. The disclaimer rules for internet ads, as the FEC states them:

- **Text or graphics** need a written disclaimer viewable without taking any action, large enough to read and with reasonable color contrast.
- **Audio** carries the disclaimer in the audio; **video** shows it for at least four seconds.
- **Adapted disclaimers** (11 CFR 110.11(g)) are allowed where a full disclaimer can't fit or would take up more than 25% of the communication: a short statement that the ad was paid for and by whom, an indicator that more is available, and a mechanism (hover text, a pop-up, a link to a landing page) that shows the full disclaimer with no more than one action.

The platform's job is mechanical: let the advertiser supply the disclaimer, render it to the format's rule, and keep the version that ran. Who must disclaim, and what counts as express advocacy, is the advertiser's legal question.

**FCC broadcast rules.** Broadcast licensees have duties no digital platform has. In the 45 days before a primary and 60 days before a general or special election, a station may charge a legally qualified candidate no more than its lowest unit charge for the same class and amount of time for the same period, and outside those windows no more than comparable commercial advertisers (47 CFR 73.1942). Stations keep a political file of every request to buy time by or for a candidate or about a political matter of national importance, placed in the online file "as soon as possible" (immediately absent unusual circumstances) and kept two years; for an issue ad the record includes whether the request was accepted, the rate, the air time and class, the issue, the purchaser and its officers or board (47 CFR 73.1943). These rules attach to the license. A streaming service or CTV app sells video ads next to programming that looks like television, but it holds no broadcast license, and I have found no FCC rule that extends the political file or lowest unit charge to it. <!-- source-gap: adv-fcc-streaming-political-file | missing | No FCC rule or order found extending lowest unit charge or the political file to streaming or CTV ad sales | closes with: an FCC order, rule or public notice addressing political advertising on streaming services | checked: 2026-11-22 --> What reaches CTV political ads is the FEC disclaimer rule, state law and the seller's own policy.

**States.** States regulate the ads for their own elections, and two show the range:

- **Washington** requires commercial advertisers that accept political advertising or electioneering communications to keep books of account open for public inspection during the campaign and for at least five years after the election: who bought the ad, the exact nature and extent of the services, and the total cost and manner of payment (RCW 29B.30.090, recodified from 42.17A.345 on January 1, 2026). The commission's rule adds, for digital platforms, a description of the demographic information of the audiences targeted and reached (to the extent the advertiser collects it in its regular course of business), the total number of impressions, and any use of synthetic media, updated within 24 hours of first distribution (WAC 390-18-050). The attorney general has enforced it repeatedly against ad platforms: Google paid $217,000 under a 2018 consent decree ($200,000 plus $17,000 in fees) and $423,659.76 under a stipulated judgment announced June 17, 2021; a King County court imposed $24,660,000, the maximum, on Meta for 822 intentional violations (October 26, 2022). In *State v. Meta Platforms*, No. 103748-1 (June 18, 2026), the Washington Supreme Court affirmed liability, six justices rejecting Meta's as-applied First Amendment challenge to the disclosure law, and with no majority either way on the penalty, the judgment stood. Meta petitioned the US Supreme Court for review on November 13, 2026 (No. 26-649), asking whether the First Amendment permits such disclosure duties on third-party platforms. Both companies' response is visible in their policies: Google announced a moratorium on Washington state and local political ads in 2018, and Meta's policy forbids ads about Washington elections from running in or targeting the state.
- **Maryland** required online platforms to publish, within 48 hours of an ad's purchase, the purchaser's identity and the amount paid, keep it on the site for a year after the election, and keep records for inspection by the state. In *Washington Post v. McManus* (December 6, 2019), the Fourth Circuit affirmed a preliminary injunction against the publication and inspection requirements as applied to the newspaper plaintiffs, holding that the law likely failed even exacting scrutiny because it burdened neutral third-party platforms, and limited its holding to those plaintiffs.

The two cases mark the edge: a records duty aimed at those who sell political ads has survived in Washington's courts, while a duty on neutral publishers to publish fell, as applied to newspapers, in the Fourth Circuit.

**AI in political ads.** States have moved faster than the federal government. A California Fair Political Practices Commission staff memo of August 10, 2026 counts "slightly more than half of U.S. states" with statutes on AI in campaign ads, most requiring disclosure. California's own: AB 2355 (Government Code 84514, approved September 17, 2024) requires a committee's qualified political advertisement generated or substantially altered with AI to say so, and FPPC staff presented Regulation 18450.12 (when disclosure is required) for adoption in August 2026, with an amendment to Regulation 18401 requiring committees to keep the source media they gave the AI system; two companion laws, AB 2655 (platform removal duties) and AB 2839 (a ban on deceptive altered election content), were struck down in federal district court, the first as preempted by federal law and the second under the First Amendment. Washington's rule above already asks platforms to record synthetic media use. The platforms' own rules (Google's altered or synthetic content checkbox, Meta's disclosure and its detection from June 1, 2026) are the floor across states; AI disclosure in ads generally is [AI in Advertising](/books/advertising/ai-in-advertising), in Running the Platform.

## Political Ads as a Pipeline

Taken together, the rules make political advertising a pipeline with a gate at each stage:

1. **Verify the advertiser** for the program and the jurisdiction (`advertiser_verifications`, `program = 'election'`), before the first ad, and re-verify on expiry.
2. **Declare and classify.** The sponsor declares political status per campaign or creative; a classifier checks the declaration against the content and catches undeclared issue ads; a reviewer settles disagreements. The result is the political flag and kind, per jurisdiction.
3. **Constrain targeting at setup** to the platform's and the law's whitelist (US election ads on Google: geography, age, gender, context; EU: separate explicit consent and no special categories).
4. **Render the disclaimer** from the verified record and the format's rule (FEC adapted disclaimers, the EU label and notice link), and refuse to serve without it.
5. **Record every impression's parameters** and roll up reach and spend by country and day.
6. **Publish** to the platform library, the DSA repository, the EU repository where it applies, and produce state records on request within the state's clock.
7. **Freeze** in blackout periods (Meta's final-week restriction) and enforce third-country sponsor bans in the EU's three-month window.

## How to Build It

Four records carry the chapter: a repository entry per ad and regime, the matched parameters on every decision, a political declaration per campaign or creative, and a gatekeeper's cross-service consent. Verification reuses `advertiser_verifications`; the payer reuses `campaigns.payer_name`; the ads mode and its reasons are on `ad_requests` already.

```sql
-- The ad server's decisions keep the parameters that matched, as the feed log does.
ALTER TABLE ad_decisions
  ADD COLUMN matched_targeting JSONB,     -- e.g. {"geo.country": "DE", "age_band": "25_34", "audience": "customer_list"}
  ADD COLUMN explanation_version SMALLINT; -- the template set that turned it into "why this ad"

-- One ad as shown, per regime that requires it to be published or kept.
CREATE TABLE ad_repository_entries (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  regime                TEXT NOT NULL CHECK (regime IN ('dsa_art39', 'eu_political_repository',
                          'platform_library', 'state_political_record')),
  jurisdiction          TEXT NOT NULL,     -- 'EU', 'US-WA', ...
  creative_version_id   UUID NOT NULL REFERENCES creative_versions (id),
  campaign_id           UUID NOT NULL REFERENCES campaigns (id),
  advertiser_id         UUID NOT NULL REFERENCES advertisers (id),  -- on whose behalf
  payer_name            TEXT NOT NULL,     -- who paid, as shown; from the verified record
  subject               TEXT,              -- the product or subject of the ad
  political_declaration_id UUID,           -- FK below; set for political entries
  commercial_communication BOOLEAN NOT NULL DEFAULT FALSE,  -- DSA Art. 26(2) declarations
  targeted              BOOLEAN NOT NULL,  -- presented specifically to groups?
  targeting_parameters  JSONB NOT NULL DEFAULT '{}',  -- main parameters, as configured when served
  exclusion_parameters  JSONB NOT NULL DEFAULT '{}',
  line_item_versions    JSONB NOT NULL DEFAULT '[]',  -- [{"line_item_id": "...", "version": 7}]
  first_shown_at        TIMESTAMPTZ,
  last_shown_at         TIMESTAMPTZ,
  reach_total           BIGINT NOT NULL DEFAULT 0,
  reach_by_country      JSONB NOT NULL DEFAULT '{}',  -- {"DE": 120400, "FR": 88000}
  spend_minor           BIGINT,            -- political regimes; in the campaign currency
  impressions           BIGINT NOT NULL DEFAULT 0,
  retention_years       SMALLINT NOT NULL, -- 1 for Art. 39, 7 for EU political, 5 for Washington
  retain_until          DATE,              -- last_shown_at plus retention; recomputed daily
  removed_reason        TEXT,              -- the ad was taken down: policy or illegal content
  published_at          TIMESTAMPTZ,       -- first visible in the public tool
  UNIQUE (regime, jurisdiction, creative_version_id, campaign_id)
);
CREATE INDEX ad_repository_entries_search_idx
  ON ad_repository_entries (regime, jurisdiction, advertiser_id, last_shown_at DESC);
CREATE INDEX ad_repository_entries_purge_idx ON ad_repository_entries (retain_until);

-- The sponsor's declaration and the platform's classification, per campaign (or creative).
CREATE TABLE political_ad_declarations (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  campaign_id           UUID NOT NULL REFERENCES campaigns (id),
  creative_id           UUID REFERENCES creatives (id),  -- null: the whole campaign
  jurisdiction          TEXT NOT NULL,     -- 'US', 'US-WA', 'EU', 'GB', ...
  declared_political    BOOLEAN NOT NULL,  -- the sponsor's answer (TTPA Art. 7, platform forms)
  classified_political  BOOLEAN,           -- the classifier's or reviewer's answer
  final_political       BOOLEAN,           -- what governs delivery; null until decided
  kind                  TEXT CHECK (kind IN ('candidate', 'party', 'ballot_measure',
                          'issue', 'electioneering', 'referendum', 'legislative')),
  election_ref          TEXT,              -- the election or referendum, with its date
  sponsor_name          TEXT NOT NULL,
  sponsor_controller    TEXT,              -- the entity ultimately controlling the sponsor
  sponsor_established   TEXT CHECK (sponsor_established IN ('eu', 'third_country')),
  funds_origin          TEXT CHECK (funds_origin IN ('eu', 'non_eu', 'mixed', 'not_applicable')),
  verification_id       UUID NOT NULL REFERENCES advertiser_verifications (id),  -- program 'election'
  disclaimer_text       TEXT,              -- the "Paid for by" line as rendered
  disclaimer_kind       TEXT CHECK (disclaimer_kind IN ('full', 'adapted', 'platform_generated')),
  transparency_notice_url TEXT,            -- EU Art. 12 notice
  uses_synthetic_media  BOOLEAN NOT NULL DEFAULT FALSE,
  synthetic_source_ref  TEXT,              -- where the source media is kept (California's rule)
  targeting_consent_required BOOLEAN NOT NULL DEFAULT FALSE,  -- EU Art. 18 explicit political consent
  decided_by            TEXT,              -- typed actor: model version or reviewer
  decided_at            TIMESTAMPTZ,
  rule_version_id       UUID,              -- the privacy_rule_versions row that applied
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((final_political IS NULL) = (decided_at IS NULL))
);
ALTER TABLE ad_repository_entries ADD CONSTRAINT ad_repository_entries_declaration_fk
  FOREIGN KEY (political_declaration_id) REFERENCES political_ad_declarations (id);

-- A gatekeeper's DMA Art. 5(2) choices: one row per user, service pair and purpose, append-only.
CREATE TABLE cross_service_consents (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_key           BYTEA NOT NULL,    -- keyed HMAC of the account ID, as audience_members uses
  source_service        TEXT NOT NULL,     -- the core platform service the data comes from
  target_service        TEXT,              -- the service it would feed; null for 5(2)(a)
  purpose               TEXT NOT NULL CHECK (purpose IN ('third_party_data_for_ads',  -- 5(2)(a)
                          'combine', 'cross_use', 'sign_in_combination')),        -- (b), (c), (d)
  decision              TEXT NOT NULL CHECK (decision IN ('granted', 'refused', 'withdrawn')),
  choice_surface_version TEXT NOT NULL,    -- the prompt and its alternative as shown
  less_personal_option  BOOLEAN NOT NULL,  -- was the equivalent less-personal option offered
  decided_at            TIMESTAMPTZ NOT NULL,
  reask_not_before      TIMESTAMPTZ,       -- refusal or withdrawal plus one year
  CHECK (decision = 'granted' OR reask_not_before >= decided_at + INTERVAL '1 year')
);
CREATE INDEX cross_service_consents_current_idx
  ON cross_service_consents (subject_key, source_service, purpose, decided_at DESC);
```

A repository entry's reach and dates are maintained from delivery. Per-member-state reach needs the country on the impression itself, since the request logs are sampled and dropped long before the repository's retention ends, so the event carries the coarse country it was served in. The daily roll-up groups by `ad_events.creative_version_id`, which [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco) adds:

```sql fragment
-- The country an impression served in, copied from the request; coarse only.
ALTER TABLE ad_events ADD COLUMN country CHAR(2);

-- Daily: extend each DSA entry's period and impressions from one day's events.
-- $1 is the day's start (UTC); $2 the member state codes.
UPDATE ad_repository_entries a
SET first_shown_at = LEAST(coalesce(a.first_shown_at, s.first_at), s.first_at),
    last_shown_at  = GREATEST(coalesce(a.last_shown_at, s.last_at), s.last_at),
    impressions    = a.impressions + s.impressions,
    retain_until   = (GREATEST(coalesce(a.last_shown_at, s.last_at), s.last_at)
                       + make_interval(years => a.retention_years))::DATE
FROM (
  SELECT e.creative_version_id, li.campaign_id,
         count(*) AS impressions, min(e.occurred_at) AS first_at, max(e.occurred_at) AS last_at
  FROM ad_events e
  JOIN line_items li ON li.id = e.line_item_id
  WHERE e.kind = 'impression' AND e.ivt = 'none'
    AND e.occurred_at >= $1 AND e.occurred_at < $1 + INTERVAL '1 day'
    AND e.country = ANY ($2)
  GROUP BY 1, 2
) s
WHERE a.regime = 'dsa_art39' AND a.jurisdiction = 'EU'
  AND a.creative_version_id = s.creative_version_id AND a.campaign_id = s.campaign_id;
```

Reach is distinct recipients, not impressions. A platform that can't count distinct people per country from its logs keeps a distinct-count sketch per entry, country and day and merges it into `reach_by_country`, which is also how the count survives the deletion of the identifiers it was computed from.

Design notes:

- **The explanation is a projection of the decision.** "Why am I seeing this ad" reads `matched_targeting` from the decision row (feed or ad server) plus the campaign's advertiser and payer, through a versioned template set; it never re-evaluates today's targeting, which may have changed. `explanation_version` lets a regulator's question about a past impression be answered with the words the person saw.
- **Keep matched parameters coarse.** The explanation needs "people aged 25 to 34 in Germany interested in cycling", not the person's identifiers, so the column holds dimension values the line item targeted, never a user ID, and its retention follows the decision log's ([Retention](/docs/telemetry/consent-and-privacy#retention)).
- **One repository, several regimes.** The same ad can be a DSA entry kept a year after its last impression, a Meta-style library entry kept seven years, an EU political entry kept seven years and a Washington record kept five; a `regime` per row keeps one copy of the facts with a retention each. A takedown (`removed_reason`) changes what the DSA entry shows (Article 39(3) swaps the content, advertiser and payer for the statement-of-reasons information) without deleting what another regime says to keep.
- **The political flag has three answers.** The sponsor declares; the classifier decides; a human settles disagreements. Delivery reads only `final_political`, and an ad with no decision yet doesn't serve in a jurisdiction that requires one. Each decision records the rule version that applied ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **The disclaimer is generated, then frozen.** The "Paid for by" text comes from the verified record and is stored on the declaration and in the creative version that served, so a renamed committee doesn't rewrite last month's ads.
- **Blackouts and sponsor windows are dated rules.** The EU's three-month third-country window and a platform's final-week freeze are effective-dated rows in the rule set, evaluated at serving time ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Cross-service consent is read like ads mode.** A gatekeeper's request path resolves the user's current Article 5(2) decisions into `ads_mode` and the set of data sources allowed for that request; downstream stages never read `cross_service_consents` directly.
- **Emit the events.** `political_declaration.decided`, `repository_entry.published` and `cross_service_consent.changed` go through the outbox ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)); the repository API, the state-records exporter and the consent cache subscribe.

## Auditing

These are the records a Digital Services Coordinator, the Commission, an election regulator or a state attorney general asks for:

- **Every ad's label, advertiser and payer as rendered,** and the explanation shown, reproducible from the decision and the template version.
- **The repository's completeness.** For each day, impressions served in the EU by creative version against repository entries present and searchable; an ad that served without an entry is a finding.
- **Political classification decisions,** with the declaration, the classifier's answer, the reviewer's and the rule version, and every ad that served before a decision existed.
- **Disclaimers and transparency notices** as they ran, per creative version, with the verification record behind each.
- **State political records produced on request,** with the request time and the response time against the state's clock.
- **Targeting refused or limited** because an ad was political, a recipient was a minor or a parameter was a special category, and who approved any exception.
- **Cross-service consent prompts shown,** refusals, and the date of the next permitted prompt, so more than one re-ask inside a year can be ruled out.

Typed actors and append-only history are in [Audit Trails](/docs/building-blocks/audit-trails); keeping what a record pointed to at the time is [Snapshot What Changes Underneath You](/docs/building-blocks/audit-trails#snapshot-what-changes-underneath-you).

## What This Means for the System You Build

- **Record the matched parameters on every decision,** and build "why this ad" from them, never from today's configuration.
- **Keep the advertiser and the payer as separate fields** from verified records, and render both.
- **Resolve minors, special categories, consent and political status into one ads mode** on the request, and make every stage read it.
- **Model the repository as entries per creative version and regime,** with retention computed from the last impression.
- **Treat political status as a decision with three inputs** (declaration, classifier, reviewer) and serve nothing political without it.
- **Generate disclaimers from the verification record** and freeze them with the version that ran.
- **Put election windows, blackouts and sponsor rules in versioned rule data,** evaluated at serving time.
- **For a gatekeeper, store cross-service consent per purpose** with its refusal clock, and offer the less-personal mode as a first-class ads mode.
- **Decide market by market whether to sell political ads at all,** and build the classifier either way.

## References

**Regulation**

- [Regulation (EU) 2022/2065, Digital Services Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2065), Art. 26(1) ad disclosures, Art. 26(2) commercial communications, Art. 26(3) special categories, Art. 28(2) and (3) minors and recital 71, Art. 39 repository contents, the one-year retention and removed ads
- [Regulation (EU) 2022/1925, Digital Markets Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1925), Art. 5(2)(a) to (d), the one-year limit on repeated requests and recital 37
- [Regulation (EU) 2024/900 on the transparency and targeting of political advertising](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0900), Arts. 5(2), 7, 8, 9, 11, 12, 13, 18, 19, 25 and 30 and recital 78, the seven-year retention, the 72-hour repository upload and the application date
- [FEC: Advertising and disclaimers](https://www.fec.gov/help-candidates-and-committees/advertising-and-disclaimers/), internet disclaimers for text, audio and video, the four-second rule and adapted disclaimers
- [FEC: Commission adopts final rule on internet communications disclaimers and the definition of public communication](https://www.fec.gov/updates/commission-adopts-final-rule-internet-communications-disclaimers-and-definition-public-communication), approval December 1, 2022, effective March 1, 2023, "placed for a fee" and 11 CFR 110.11(g)
- [47 CFR 73.1942, Candidate rates (Cornell LII)](https://www.law.cornell.edu/cfr/text/47/73.1942), lowest unit charge windows of 45 and 60 days
- [47 CFR 73.1943, Political file (Cornell LII)](https://www.law.cornell.edu/cfr/text/47/73.1943), contents, "as soon as possible" placement, two-year retention and issue ad records
- [Washington RCW 29B.30.090](https://app.leg.wa.gov/RCW/default.aspx?cite=29B.30.090), commercial advertiser records, public inspection and five-year retention
- [Washington RCW 42.17A.345](https://app.leg.wa.gov/RCW/default.aspx?cite=42.17A.345), the former section and its recodification effective January 1, 2026
- [Washington WAC 390-18-050](https://app.leg.wa.gov/WAC/default.aspx?cite=390-18-050), digital platform records: audience demographics, impressions, synthetic media and the 24-hour update

**Regulators**

- [European Commission: Commission finds Apple and Meta in breach of the Digital Markets Act (April 23, 2025)](https://digital-markets-act.ec.europa.eu/commission-finds-apple-and-meta-breach-digital-markets-act-2025-04-23_en), the €200 million and €500 million fines and the consent or pay finding
- [European Commission: Meta commits to give EU users choice on personalised ads (December 8, 2025)](https://digital-markets-act.ec.europa.eu/meta-commits-give-eu-users-choice-personalised-ads-under-digital-markets-act-2025-12-08_en), the less personalised ads option from January 2026
- [Washington Attorney General: Google will pay more than $423,000 (June 17, 2021)](https://www.atg.wa.gov/news/news-releases/ag-ferguson-google-will-pay-more-423000-over-repeated-violations-washington), the second settlement, the 2018 judgment and Google's announced moratorium
- [Washington Attorney General: Judge grants maximum $24.6M penalty against Meta (October 26, 2022)](https://www.atg.wa.gov/news/news-releases/judge-grants-ag-ferguson-s-request-maximum-246m-penalty-against-facebook-parent), $24,660,000 for 822 intentional violations
- [Washington Public Disclosure Commission: Supreme Court affirms judgment against Facebook (June 18, 2026)](https://www.pdc.wa.gov/node/44359), the affirmance and the commercial advertiser records duty
- [California FPPC: Adoption of Regulation 18450.12 and amendments to Regulation 18401 (August 10, 2026)](https://www.fppc.ca.gov/siteassets/documents/agendadocuments/general-items/2026/aug/Staff_Memo_18450.12_18401_adopt.pdf), AB 2355 and Government Code 84514, source media retention, AB 2655 and AB 2839 struck down, and the count of states with AI campaign ad statutes

**Reference**

- [BEUC: Analysis of Meta's 2026 changes to its consent for ads mechanism (March 2026)](https://storage02.forbrukerradet.no/media/2026/03/beuc-x-2026-021-analysis-of-meta-2026-changes-to-its-consent-for-ads-mechanism-against-eu-law.pdf), the consumer organization's critique that the less personalised option is still not offered upfront and on the same level

**Court records**

- [Washington Post v. McManus, No. 19-1132 (4th Cir. December 6, 2019)](https://www.ca4.uscourts.gov/opinions/191132.P.pdf), Maryland's publication and inspection requirements, the 48-hour and one-year terms, and the as-applied holding
- [State of Washington v. Meta Platforms, Inc., No. 103748-1 (Wash. June 18, 2026)](https://www.courts.wa.gov/opinions/pdf/1037481.pdf), the per curiam vote summary: liability affirmed, the First Amendment challenge rejected by six justices, no majority on the penalty
- [Meta Platforms, Inc. v. Washington, No. 26-649, petition for a writ of certiorari (November 13, 2026)](https://www.supremecourt.gov/DocketPDF/26/26-649/432737/20261113164035174_26-%20Petition.pdf), the filing date and the question presented

**In practice**

- [Google: Political content policy](https://support.google.com/adspolicy/answer/6014595), election ad verification countries, "Paid for by" disclosures, US election ad targeting and altered or synthetic content
- [Google: Announcing the launch of the new Ads Transparency Center (March 29, 2023)](https://blog.google/innovation-and-ai/technology/ads/announcing-the-launch-of-the-new-ads-transparency-center/), the searchable hub of verified advertisers' ads
- [Google: An update on political advertising in the EU (November 14, 2024)](https://blog.google/around-the-globe/google-europe/political-advertising-in-eu/), stopping EU political ads before the regulation applied
- [Meta: Ads about social issues, elections or politics](https://transparency.meta.com/en-us/policies/ad-standards/SIEP-advertising/SIEP), authorization, "Paid for by", AI disclosure and detection from June 1, 2026, the EU ban and the Washington restriction
- [Meta: Ending political, electoral and social issue advertising in the EU (July 25, 2025)](https://about.fb.com/news/2025/07/ending-political-electoral-and-social-issue-advertising-in-the-eu/), the October 2025 end of EU political ads
- [Meta: How Meta is preparing for the 2026 US midterms](https://about.fb.com/news/2026/02/meta-prepares-for-2026-us-midterms/), seven-year Ad Library storage, AI disclosure and the restriction period from October 27, 2026
- [TikTok: Politics, governments, and elections ad policy (July 2026)](https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-politics-government-and-elections?lang=en), the ban on paid political advertising and the government advertiser exceptions
