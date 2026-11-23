+++
title = "Measurement Standards & the MRC"
nav_title = "Standards & the MRC"
description = "What the Media Rating Council accredits, the standards and guidelines list, how audits work, Open Measurement, and how a platform records whose count it trusts."
category = "Advertising Industry"
order = 2933
part = "Measurement"
tags = ["advertising", "ad-tech", "measurement", "mrc", "accreditation", "data-model"]
+++

Advertising is bought on counts that someone else produced: impressions from an ad server, viewable impressions from a verification vendor, clicks from a platform, ratings from a panel, conversions from an attribution system. A buyer can't watch every impression, so the industry built a way to trust a count without re-deriving it: published standards that say what an impression, a viewable impression, a click or an audience is, and an audit that checks a measurement product follows them. In the US the auditor is the Media Rating Council (MRC), a not-for-profit industry self-regulatory body "established in 1963 at the request of US Congress," which "audits and accredits media measurement products and data sources" across digital, out-of-home, print, radio, television and cross-media.

It is hard for engineers because accreditation is scoped, dated and conditional, and none of that fits in a boolean. A vendor is accredited for one metric, in some environments (desktop, mobile web, mobile in-app, CTV), for one product, from one audit cycle to the next; an accreditation can be suspended while the product keeps selling; a walled garden can be accredited for rendered video and SIVT but not for viewable display; and "MRC-accredited" in a sales deck may refer to a metric the line item never used. A platform that bills on counts, or that lets buyers pick a measurement vendor as the controlling count, needs to know which accreditation applied to which number on which day.

This chapter covers what the MRC is and does, the standards and guidelines it publishes with the IAB, how an audit and accreditation work, what is accredited as of November 2026 across verification vendors and platforms, how measurement reaches an impression (tags, the Open Measurement SDK, server-to-server integrations with walled gardens), the Outcomes and Data Quality Standard, and how to model accreditations and measurement integrations. It extends `organizations` and `delivery_daily` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The counting rules themselves are Counting Impressions & Clicks; viewability and attention in depth are [Viewability & Attention](/books/advertising/viewability-and-attention); invalid traffic detection is Invalid Traffic & Ad Fraud; TV and cross-media audiences are [Audience & Cross-Media Measurement](/books/advertising/audience-measurement); and which count an invoice uses, and what happens when two disagree, are Insertion Orders & Standard Terms and Reconciliation & Discrepancies.

## How the Platforms Do It

As of November 2026, from the MRC's digital accreditation list (the scope letters govern; the MRC's accreditation page warns that "the most recent letter may present a slightly different accreditation scope than the one listed"). Environments: D desktop, MW mobile web, MA mobile in-app, CTV connected TV.

| Company and service | Accredited (selected) | Not listed or limited |
| --- | --- | --- |
| **Amazon** (Ads Sponsored Products; Amazon DSP) | Sponsored Products clicks and SIVT, "Total only"; DSP rendered display and display clicks in D, MW, MA, CTV, rendered and viewable video and viewable display in D, MW, MA | Scope varies by supply source; the letter governs |
| **DoubleVerify** (Quality Analytics Platform) | Rendered display and video, viewable display (D, MW, MA) and video (CTV for certified apps only), property-level verification, attention metrics (D, MW, MA), SIVT, pre-bid IVT; independent reporting of YouTube Ads Data Hub data and Facebook Newsfeed placements | TikTok appears only in DoubleVerify's footnotes (mobile in-app video) |
| **Google** (Ad Manager, Google Ads, Ads Data Hub, CM360, DV360, YouTube Brand Safety) | Each product separately: rendered and viewable display and video, clicks, SIVT, TrueView views; ADH device ID matching (MW, MA, excluding cookie matching); YouTube content-level brand safety processes | Accreditation is per product, not for "Google" |
| **HUMAN** | Tracked and rendered display and video, SIVT, pre-bid IVT (D, MW, MA, CTV); viewable display and video (D, MW, MA) | |
| **Integral Ad Science** (Core) | Rendered, tracked and viewable display and video, SIVT, SSAI video metrics, pre-bid viewability and IVT; integrated Facebook and YouTube ADH reporting; server-to-server Amazon DSP reporting | Property-level verification D and MW only |
| **Meta** (Facebook and Instagram ads) | SIVT, rendered display and video (D, MW, MA), viewable video (MA only) | Viewable display not listed |
| **Netflix** | Rendered video (D, MA, CTV) | |
| **Pixalate** | Tracked and rendered display and video, viewable display, SSAI video metrics and SIVT | Video viewability and pre-bid SIVT listed as audit in process (as of September 2025) |
| **Snap** | Mobile in-app only: rendered and viewable display and video, clicks, reach metrics, video duration | |
| **Walmart Connect** (Sponsored Search) | Rendered display and video, search clicks and CTR (D, MW, MA) | Onsite display listed as audit in process (as of November 2025) |

A companion page lists digital services under review, which are not accredited, and it shows how long the pipeline is: IAS's YouTube brand safety classification has been "audit in process" since April 2023, Ogury's audience reporting since December 2024, and Adform's rendered and viewable impressions are listed as "Accreditation suspended, audit in process 11/26," with a footnote reading "Accreditation suspended effective November 10, 2026, due to a cybersecurity incident impacting in-scope systems." Retail networks are entering the queue: Kroger is in pre-audit (as of June 2026) for impressions, clicks, viewable impressions, attributed and incremental sales and iROAS on onsite formats.

The MRC also publishes a digital platforms status chart for the large social and retail platforms its members asked about, updated quarterly (the version opened was dated October 22, 2026), with columns for first- and third-party viewability, SIVT, digital audience, first- and third-party content-level brand safety, outcomes, and auctions under the January 2026 Auction Transparency Standards. The chart "is not reflective of each digital platforms' full accreditation scope," so it is a map, not a source of record.

## What the MRC Is

The MRC's objectives, from its bylaws: "To secure for the industry and related users measurement services that are valid, reliable and effective," "To evolve and determine minimum disclosure and ethical criteria for measurement services," and "To provide and administer an audit system designed to inform users." Its members are media companies, advertisers, agencies and trade associations, and it describes itself as auditing "approximately 110 research products" (as of May 2026).

Three things the MRC is not, which matter when reading a contract or a sales claim:

- **It isn't a measurement vendor.** It doesn't count anything. It audits whether a service counts the way its disclosures and the applicable standards say.
- **It isn't a currency body.** Which measurement a buy transacts on is decided by buyer and seller. In US national TV, the Joint Industry Committee certifies currencies on a separate track ([Audience & Cross-Media Measurement](/books/advertising/audience-measurement)); MRC accreditation and JIC certification are different things.
- **It isn't global.** The MRC is a US body; its accreditation pages list services outside the US separately, and other countries' industry bodies run their own systems.

The IAB, the IAB Tech Lab and, for mobile, the MMA write most of the digital guidelines jointly with the MRC; the MRC's role is to audit against them.

## The Standards and Guidelines

The MRC's standards page lists 29 documents as of November 2026. The ones digital systems are built against, with issue and last-update dates as the page gives them:

| Document | Issued | Last updated | What it governs |
| --- | --- | --- | --- |
| Minimum Standards for Media Rating Research | Jan 1964 | Dec 2011 | Every accredited service: ethics, disclosure, data quality |
| Desktop Display Impression Measurement Guidelines | Sep 2004 | Oct 2017 | The served (rendered) impression: begin to render, client-initiated counting |
| Digital Video Impression Measurement Guidelines | May 2006 | Jun 2018 | Video impressions and playback events |
| Click Measurement Guidelines | May 2009 | | Click stages, valid clicks, filtration |
| Conduct of Ad Verification Guidelines | Feb 2012 | | How verification vendors operate; the brand safety supplement (Sep 2018) extends it to content-level context |
| Mobile Web Advertising Measurement Guidelines; Mobile Application (In-App) Advertising Measurement Guidelines | Jul 2013 | Oct 2017 | Mobile counting; SDK-based measurement |
| Audience Reach Measurement Guidelines | Aug 2013 | | Unique users, browsers, sessions |
| Viewable Ad Impression Measurement Guidelines | Jun 2014 | Aug 2015 | The viewable impression for display and video |
| Invalid Traffic Detection and Filtration Guidelines, IVT 2.0 Addendum | Oct 2015 | Jun 2020 | GIVT and SIVT; an interim update memo followed in April 2024 |
| Mobile Viewable Ad Impression Measurement Guidelines | Jun 2016 | | Viewability in apps and mobile web |
| Digital Place-based Advertising Measurement Standards | Mar 2017 | | Screens in venues; in-store screens under the retail guidelines |
| Digital Audience-Based Measurement Standard | Dec 2017 | | Assigning impressions to people and demographics |
| Digital Audio Measurement Standards (includes podcasting) | Jan 2018 | | Audio delivery and audibility |
| Cross-Media Measurement Standard, Phase I: Video | Sep 2019 | | Deduplicated TV plus digital video reach, frequency and GRPs |
| OTT/CTV and SSAI Digital Video Measurement Guidelines | Aug 2021 | | Stitched and connected TV ads |
| Intrinsic In-Game Advertising Measurement Guidelines | Sep 2009 | Aug 2022 | Ads inside game worlds |
| Outcomes and Data Quality Standards | Sep 2022 | | Attribution, lift, MMM and the data feeding them |
| Retail Media Measurement Guidelines | Jan 2024 | | Onsite, offsite and in-store retail media |
| Augmented Reality Advertising Measurement Guidelines | Apr 2024 | Apr 2024 | AR ad exposure |
| Attention Measurement Guidelines | Nov 2025 | Nov 2025 | Attention methods, minimums and validation |
| Out-of-Home Measurement Standards (Phases 1 and 2) | Dec 2025 | Dec 2025 | OOH audiences |
| Digital Advertising Auction Transparency Standards | Jan 2026 | Jan 2026 | Auction type, reserves, fees in closed-loop and OpenRTB auctions |

How they nest is what an implementation needs:

- **A viewable impression is a served impression first.** The viewability guideline says "In all cases a viewable impression must also meet pre-existing criteria for a served impression, for example, counted on the client side, filtered for non-human activity," and "In no case should viewable impressions exceed rendered served impressions." So viewability sits on top of the counting rules, and both sit on top of invalid-traffic filtration.
- **Audience sits on top of viewability.** The cross-media standard makes viewable impressions "the minimum required qualifying measurement unit" for reach, frequency and GRPs, and the attention guidelines treat attention as "a measure of audience (a measure of persons, not devices, as persons generate attention)," requiring viewability, full SIVT filtration and a confirmed user presence underneath.
- **Outcomes sit on top of everything.** The Outcomes and Data Quality Standard requires SIVT filtration of the exposures feeding outcomes, and allows outcomes not limited to viewable impressions only when users can filter them to outcomes downstream of viewable impressions.

The guidelines repeat one structural rule worth adopting everywhere: anything measured differently from the standard (a custom viewability threshold, a projected rather than observed count, a diagnostic attention metric) may be reported **in addition to** the standard metric, segregated and labeled, never instead of it. The retail media guidelines state it for custom viewability ("in addition to standard viewability reporting, not in lieu of it"), the viewability guideline for extrapolated counts ("metrics originating from each method should be segregated"), and the attention guidelines for attention measured without viewability ("separately presented and distinguished in reporting as non-standard and diagnostic").

## How an Audit Works

The MRC's description of its process: audits are an annual external process performed by "a specialized team of independent CPA auditors." A service seeking accreditation must supply complete information to the MRC, comply with its minimum standards, submit to annual audits, and "Pay for the Audit Costs (internal & external)." Accredited services "have undergone successful completion of an audit including review by an audit committee," the MRC Board of Directors decides whether to grant accreditation, and services "must renew MRC accreditation every year through the completion of recurring annual MRC audits."

The audit scope listed on the process page is broad: sample design and recruitment, demographic composition, data collection, metering or survey accuracy, IT general controls, client onboarding, invalid traffic filtration, editing and tabulation, data processing, and the service's disclosures of methodology and performance. Audit reports are "confidential among the MRC members, independent CPA firm, and the service," but the methodology and performance disclosures the MRC mandates must be available to all of the service's customers. An accredited service may display the MRC logo on the audited product.

For an engineer at a measured company, an audit is a controls review of the pipeline:

- **Every count reproducible from raw data.** Auditors trace a reported number back through processing to the events; a roll-up that can't be rebuilt from its inputs (the core's rule that `delivery_daily` is a replayable aggregate of `ad_events`) is a finding.
- **Every filter documented and versioned.** IVT rules, bot and spider lists, viewability logic and data-center IP lists change; the audit needs to know which version applied to which period.
- **Disclosure matches code.** The methodology document a service publishes to customers is audited against what the system does, so a silent change to counting logic is a disclosure failure even if the new logic is better.
- **Change control.** Material methodology changes are notified to customers and reviewed by the MRC; for Nielsen's 2026 Big Data + Panel changes, covered in [Audience & Cross-Media Measurement](/books/advertising/audience-measurement), the MRC said it was reviewing the methodology updates and related impact data and planned to conclude that review prior to implementation.

Accreditation can also be lost. The MRC suspended Nielsen's National TV accreditation in September 2021 and reinstated it on April 17, 2023, 19 months later, with several components still excluded; on its list of digital services under review, Adform's impressions show "Accreditation suspended effective November 10, 2026." A suspended service keeps operating and selling, so a contract that requires "MRC-accredited measurement" needs a rule for what happens mid-flight.

## How Measurement Reaches an Impression

A verification vendor or an advertiser's ad server can only measure what it can observe. There are four integration shapes, and accreditation scopes differ by shape:

- **A tag in the creative.** The open web's default: the advertiser's ad server wraps the creative with the vendor's JavaScript, which runs in the ad's frame and measures geometry, visibility and the environment. Cross-domain iframes and SafeFrame limit what it can see ([Viewability & Attention](/books/advertising/viewability-and-attention) covers the techniques), and some publishers and retailers don't allow third-party tags at all; the retail media guidelines note that onsite viewability tagging by every advertiser partner "is generally not possible."
- **The Open Measurement SDK.** In apps and some video players, scripts can't inspect native views, so the IAB Tech Lab's OM SDK provides "common code and libraries for facilitating third-party access to measurement data": the app or player integrates the SDK once, exposes signals through the Open Measurement Interface Definition (OMID) API, and each verification vendor's script receives them. Current API docs are OMID 1.6; the OM Web Video SDK was released in December 2020; Samsung and LG TVs were added in 1.5 through the web video SDK; Android TV and tvOS are supported in native builds; and the November 2026 release adds the CTV Ad Portfolio formats (menu and homescreen, pause, screensaver, overlay). The IAB Tech Lab certifies integrations through a compliance program with test cases and a Compliance API listing certified partners. Its Device Attestation work, adapted from the IETF's Privacy Pass, lets apps and players assert a device is genuine, aimed at device spoofing.
- **Server-to-server reporting from a walled garden.** Platforms that don't allow third-party tags on their own surfaces expose event data to accredited vendors through an integration instead. The MRC list shows the shape: DoubleVerify's "Independent Reporting of Google YouTube ADH Data," IAS's "Integrated Third-party Facebook reporting" (limited to placements audited for first-party measurement) and IAS's "Server to Server (S2S) Integrated Third-party Amazon DSP Reporting." The vendor measures what the platform's data shows it, under the vendor's accreditation for that integration specifically.
- **First-party measurement by the platform.** The garden counts and reports its own impressions, clicks and viewability, accredited (or not) on its own audit: Meta's, Snap's, Netflix's and Google's entries above.

The consequence for a platform's data model is that "vendor X measured line item Y" is incomplete without the integration method and the accreditation that covered that method for that metric and environment on that date. IAS's Facebook entry covers integrated reporting of Facebook placements, not a tag on them; a DoubleVerify CTV viewability count is accredited "for certified applications only"; Google's Ads Data Hub device ID matching excludes cookie matching.

## When Vendors Disagree

Two accredited vendors can report different viewable rates for the same campaign and both be compliant, because the guidelines leave room for measurement technique and because each measures only what it can see. The viewability guideline names the main causes and the obligations they create:

- **Undetermined impressions.** Viewable impressions are reported in three mutually exclusive buckets ("Viewable Impressions, Non-Viewable Served Impressions, and Impressions with Viewable Status Undetermined"), with a Measured Rate and a Viewable Rate over measured impressions only. Two vendors with different measured rates will differ on everything computed from them.
- **Multiple tags.** When several measurement tags are present, a vendor may decline to measure ads tagged or served by another entity, but "its treatment of such ads should be fully disclosed," because "this practice often can confound the viewability measurement reconciliation process."
- **Early review.** For campaigns with third-party verification, early review of results is required, "prior to twenty percent (20%) of expected campaign volume, or as soon as possible and within no more than five business days from the initiation of the campaign."

The practical rule is the core's: keep each source's count as its own `delivery_daily` row, never overwrite one with another, let the insertion order name the controlling one, and record which method and accreditation produced it. The tolerance and the dispute process are Reconciliation & Discrepancies.

## Outcomes and Data Quality

The Outcomes and Data Quality Standard (September 2022, with the ANA, the 4A's and the ACA) is the one that reaches past delivery into results, and [Attribution](/books/advertising/attribution), [Incrementality & Lift](/books/advertising/incrementality-and-lift) and [Marketing Mix Modeling](/books/advertising/marketing-mix-modeling) each lean on it. The rules that shape systems:

- **Direct and indirect outcomes are labeled.** It classifies leads, inquiries, search, purchase intent, interaction and traffic as "Not a Direct Measure of Sales," and conversions, CRM and sales data, ROI and ROAS as direct measures.
- **Experiments and observational methods are distinguished.** "An experiment (RCT) uses randomization"; a method that doesn't randomly control treatment "would be considered an observational approach."
- **Arithmetic ROAS is disclosed as such.** A ratio of sales to spend must be differentiated from attribution or MMM that isolates incremental return.
- **Method parameters are disclosed.** The standard covers single-touch and multi-touch attribution, lookback windows, and MMM granularity, history and Bayesian priors, all as disclosures a buyer can read before trusting the number.

For a platform, the standard implies every reported outcome carries its method (attributed, experimental, modeled), its window and model version, and whether it is a direct sales measure, the same metadata the How to Build It sections of the following chapters attach to `conversions`.

## How to Build It

Measurement standards add three things to the core model: the accreditations that cover a vendor's metrics (sourced from the MRC's lists and letters, dated, never inferred), the measurement integrations that tie a vendor and a method to a buy, and the link from each billable count to the integration that produced it. Vendors are `organizations` with `'measurement'` in `kinds`.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- for the exclusion constraints below

CREATE TABLE accreditations (            -- one body's decision on one product, metric and environment set
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  body             TEXT NOT NULL CHECK (body IN ('mrc', 'jic', 'tag', 'iab_tech_lab', 'other')),
  vendor_org_id    UUID NOT NULL REFERENCES organizations (id),
  product_name     TEXT NOT NULL,         -- as the body lists it: 'Quality Analytics Platform', 'DV360'
  metric           TEXT NOT NULL CHECK (metric IN ('rendered_display', 'rendered_video',
                     'tracked_ads', 'viewable_display', 'viewable_video', 'clicks', 'givt', 'sivt',
                     'prebid_ivt', 'ssai_video', 'property_verification', 'brand_safety',
                     'attention', 'audience', 'reach', 'outcomes', 'auction_transparency',
                     'om_sdk_integration', 'currency')),
  environments     TEXT[] NOT NULL CHECK (environments <@ ARRAY['desktop', 'mobile_web',
                     'mobile_app', 'ctv', 'linear_tv', 'audio', 'ooh', 'total']::TEXT[]
                     AND cardinality(environments) > 0),
  integration      TEXT CHECK (integration IN ('tag', 'om_sdk', 's2s', 'first_party', 'panel')),
                                          -- null: not limited to one integration shape
  status           TEXT NOT NULL CHECK (status IN ('accredited', 'suspended', 'audit_in_process',
                     'pre_audit', 'audit_reviewed', 'withdrawn', 'certified')),
  scope_notes      TEXT,                  -- 'certified applications only', 'excludes cookie matching'
  valid_during     DATERANGE NOT NULL,    -- from the letter or listing; open-ended while current
  letter_url       TEXT,
  source_url       TEXT NOT NULL,         -- the list or letter this row was read from
  checked_on       DATE NOT NULL,         -- when someone last confirmed it against the source
  EXCLUDE USING gist (body WITH =, vendor_org_id WITH =, product_name WITH =, metric WITH =,
    (COALESCE(integration, 'any')) WITH =, valid_during WITH &&)  -- one status at a time; NULL
                                          -- never equals NULL, so COALESCE makes it compare
);

CREATE TABLE measurement_integrations (  -- a vendor measuring a buy, by one method
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor_org_id       UUID NOT NULL REFERENCES organizations (id),
  insertion_order_id  UUID REFERENCES insertion_orders (id),
  line_item_id        UUID REFERENCES line_items (id),
  deal_id             UUID REFERENCES deals (id),
  metrics             TEXT[] NOT NULL,    -- what this integration reports, in accreditations.metric terms
  method              TEXT NOT NULL CHECK (method IN ('tag', 'om_sdk', 'vast_verification',
                        's2s', 'first_party', 'panel', 'log_file')),
  environment         TEXT NOT NULL CHECK (environment IN ('desktop', 'mobile_web', 'mobile_app',
                        'ctv', 'linear_tv', 'audio', 'ooh')),
  vendor_campaign_ref TEXT,               -- the vendor's own campaign or placement ID
  is_controlling      BOOLEAN NOT NULL DEFAULT FALSE,  -- the IO names this one for billing
  active              TSTZRANGE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(insertion_order_id, line_item_id, deal_id) = 1)
);

CREATE UNIQUE INDEX measurement_integrations_one_controlling_idx
  ON measurement_integrations (insertion_order_id)
  WHERE is_controlling AND insertion_order_id IS NOT NULL;

-- each billable count points at the integration that produced it
ALTER TABLE delivery_daily ADD COLUMN measurement_integration_id UUID;
ALTER TABLE delivery_daily ADD CONSTRAINT delivery_daily_measurement_integration_fk
  FOREIGN KEY (measurement_integration_id) REFERENCES measurement_integrations (id) NOT VALID;
ALTER TABLE delivery_daily ADD COLUMN accreditation_ids UUID[] NOT NULL DEFAULT '{}';
                                          -- the accreditations in force for these metrics on this day
```

The check a billing run makes before pricing a line on a vendor's count: was each metric on the line covered by an accreditation in force on the day, for that environment and integration?

```sql
-- Delivery days priced on a measurement vendor's viewable count with no accreditation in force.
SELECT d.line_item_id, d.day, mi.vendor_org_id, mi.method, mi.environment
FROM delivery_daily d
JOIN measurement_integrations mi ON mi.id = d.measurement_integration_id
WHERE d.source = 'measurement_vendor'
  AND d.day >= $1 AND d.day < $2
  AND d.viewable_impressions > 0
  AND NOT EXISTS (
    SELECT 1 FROM accreditations a
    WHERE a.vendor_org_id = mi.vendor_org_id
      AND a.body = 'mrc'
      AND a.status = 'accredited'
      AND a.metric IN ('viewable_display', 'viewable_video')
      AND mi.environment = ANY (a.environments)
      AND (a.integration IS NULL OR a.integration = CASE mi.method
             WHEN 'vast_verification' THEN 'om_sdk'  -- VAST <AdVerifications> loads OMID scripts
             ELSE mi.method END)
      AND a.valid_during @> d.day
  );
```

Design notes:

- **Accreditation is data you import, not a flag you set.** Each row records where it was read (`source_url`, `letter_url`) and when it was last checked (`checked_on`); a job re-reads the MRC lists on a schedule and opens a new row when a status changes, so a suspension like Adform's on November 10, 2026 becomes a dated row and every delivery day after it can be found.
- **Scope is part of the key.** Metric, environment set and integration shape are columns because the accreditations differ on exactly those: viewable video in CTV for certified apps only, device ID matching excluding cookies, Facebook reporting through an integration rather than a tag. `scope_notes` keeps the letter's wording for the cases a column can't hold.
- **One status at a time.** The exclusion constraint keeps a product's metric from being both accredited and suspended on the same day; history is a sequence of rows, as in [Amend, Don't Overwrite](/docs/building-blocks/audit-trails#amend-don-t-overwrite).
- **The controlling count is configuration.** The insertion order's `controlling_measurement` says which kind of source bills; `is_controlling` on the integration says which vendor and method, with at most one per IO. Pricing reads it; nothing else does.
- **Freeze what applied.** `delivery_daily.accreditation_ids` snapshots the accreditations in force when the day was computed, so a later suspension, or a list that changes its wording, doesn't rewrite what an invoice relied on.
- **Disclosures are versioned artifacts.** If this system is itself a measured service (an ad server, a retail network seeking accreditation), its methodology disclosure belongs in version control next to the counting code, with the counting policy versions from Counting Impressions & Clicks referencing it, because the audit compares the two.

## Auditing

- **Every accreditation as it was,** with its source, scope notes and the day it was checked, so "was this vendor accredited for CTV viewability in March" has an answer that doesn't depend on today's web page.
- **Every measurement integration on every buy,** with its method, environment, active period and whether it controlled billing.
- **Which accreditations each billable day relied on,** frozen at computation, and the restatements when they changed.
- **This system's own methodology,** if it is audited: disclosure versions, counting and filtration rule versions, and the change notices sent to customers, because the MRC audit includes "Assessment of measurement service disclosures of methodology and performance."

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Treat accreditation as scoped and dated:** product, metric, environment and integration, imported from the MRC's lists and letters with a checked date.
- **Record how each vendor measured each buy,** tag, OM SDK, server to server or first party, because accreditation follows the method.
- **Price only on a count whose accreditation was in force that day,** and freeze which accreditations a billed day relied on.
- **Report custom and diagnostic metrics beside the standard ones,** segregated and labeled, never instead of them.
- **Keep every vendor's count as its own row** and let the contract name the one that bills.
- **Integrate the OM SDK in apps and players** you control, so verification vendors measure through one certified integration.
- **Label every outcome with its method** (attributed, experimental, modeled) and whether it measures sales directly.
- **If your own counts are audited, version the disclosure with the code** and give customers impact data before a methodology change.

## References

**Specifications**

- [MRC: Standards and guidelines](https://mediaratingcouncil.org/standards-and-guidelines), the 29 standards and guidelines with issue and update dates
- [MRC: Viewable Ad Impression Measurement Guidelines v2.0 (PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/081815%20Viewable%20Ad%20Impression%20Guideline_v2.0_Final.pdf), viewable impressions as served impressions first, the three reporting buckets, multiple tags, segregating extrapolated counts and early review
- [IAB and MRC: Attention Measurement Guidelines v1.0 (November 2025, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/IAB_MRC_Attention_Measurement_Guidelines_November_2025.pdf), attention as a measure of persons, its viewability, SIVT and presence minimums, and diagnostic reporting
- [MRC: Cross-Media Audience Measurement Standards, Phase I Video (PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC%20Cross-Media%20Audience%20Measurement%20Standards%20%28Phase%20I%20Video%29%20Final.pdf), viewable impressions as the minimum unit for reach, frequency and GRPs
- [MRC: Outcomes and Data Quality Standards (PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC%20Outcomes%20and%20Data%20Quality%20Standards%20%28Final%29.pdf), direct and indirect outcome measures, experiments versus observational methods, arithmetic ROAS disclosure and attribution and MMM parameters
- [IAB and MRC: Retail Media Measurement Guidelines (January 2024, PDF)](https://mediaratingcouncil.org/sites/default/files/Standards/IAB_Retail_Media_Measurement_Guidelines_January2024.pdf), custom viewability in addition to the standard and the limits on onsite third-party tagging
- [IAB Tech Lab: Open Measurement SDK](https://iabtechlab.com/standards/open-measurement-sdk/), OMID, supported platforms and versions, the compliance program, Device Attestation and the November 2026 CTV formats

**Reference**

- [MRC: Home](https://mediaratingcouncil.org/), established in 1963 at the request of Congress, a self-regulatory body that audits and accredits measurement products
- [MRC: Mission](https://mediaratingcouncil.org/about-mrc/mission), the bylaws objectives
- [MRC: Audit and accreditation process](https://mediaratingcouncil.org/about-mrc/audit-and-accreditation-process), annual audits by independent CPA auditors, service obligations including audit costs, audit scope, confidentiality and the logo
- [MRC: Accreditation](https://mediaratingcouncil.org/accreditation), audit committee review, the Board's decision, annual renewal, letters as the authoritative scope and the quarterly digital platforms chart
- [MRC: Digital accreditation](https://mediaratingcouncil.org/accreditation/digital), accredited services, metrics, environments and footnotes
- [MRC: Digital services under review](https://mediaratingcouncil.org/accreditation/services-under-review/digital), in-process and pre-audit services and the Adform suspension
- [MRC: Digital platforms accreditation status chart (October 22, 2026, PDF)](https://mediaratingcouncil.org/sites/default/files/Digital%20Platforms%20Chart/Digital%20Platforms%20Accreditation%20Status_10.22.26.xlsx.pdf), the columns tracked for large social and retail platforms
- [MRC: Nielsen National Big Data + Panel status update (May 27, 2026, PDF)](https://www.mediaratingcouncil.org/sites/default/files/News/GI052726%20-%20MRC%20Releases%20Nielsen%20National%20Big%20Data%20%2B%20Panel%20Status%20Update%20.pdf), impact data reviewed before methodology changes, the member types and the count of about 110 audited products
- [MRC: Statement on Nielsen National TV reinstatement (April 17, 2023, PDF)](https://mediaratingcouncil.org/sites/default/files/News/Accreditation-Matters/041723_Nielsen_Natl_Statement_Final.pdf), the September 2021 suspension and April 2023 reinstatement with exclusions
