+++
title = "Invalid Traffic & Ad Fraud"
nav_title = "Invalid Traffic & Fraud"
description = "GIVT and SIVT under the MRC, the fraud schemes from Methbot and 3ve to SDK and SSAI spoofing, TAG certification, and refunds and clawbacks as records."
category = "Advertising Industry"
order = 2940
part = "Fraud and Brand Safety"
tags = ["advertising", "ad-fraud", "invalid-traffic", "ivt", "tag", "mrc", "data-model"]
+++

Invalid traffic is any impression, click or conversion that doesn't come from a real person with a real chance of seeing the ad: a search engine crawler, a data-center browser, a phone app firing impressions nobody sees, a botnet on hijacked home computers, a click farm, a server pretending to be a TV. Some of it is innocent (crawlers, prefetches, monitoring tools), and some of it is fraud: someone selling impressions that were never shown, on sites that never existed, and keeping the money. Every party in the chain pays for it until somebody detects it, and the detection usually happens after the money has already moved.

The engineering is hard for three reasons. Detection runs at two speeds: list-based filtering of known bad sources can happen in the bid path or the event stream, but sophisticated invalid traffic is found by analysis that takes hours, days or months, long after the impression was billed and the publisher was paid. Detection is probabilistic and adversarial: a fraud operation that sees which signals get it caught changes them, so the rules can't be published in full, and a false positive takes money from a legitimate publisher. And the money has to be unwound across every hop: the advertiser's credit, the DSP's credit from the exchange, the exchange's deduction from the publisher, each on its own invoice or statement, each in its own period.

This chapter covers the MRC's definitions of general and sophisticated invalid traffic, the schemes (data-center bots, botnets, domain and app spoofing, ad stacking, SDK spoofing and click injection, SSAI and CTV spoofing, made-for-advertising sites), how platforms filter before billing and credit after it, TAG's Certified Against Fraud program, and how refunds and clawbacks travel through the chain. It extends `ad_events` (the `ivt` flag), `delivery_daily` (the removed counts) and `invoice_lines` (the `ivt_credit` kind) from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) (in Ad Serving and Creative) owns where IVT filtering sits in the counting pipeline and click validation; [Measurement Standards & the MRC](/books/advertising/measurement-standards-and-the-mrc) (in Measurement) owns accreditation of the vendors that detect it; [Mobile Measurement Partners](/books/advertising/mobile-measurement-partners) owns install fraud rejected at attribution; [Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies) and [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts), in this volume, own how a credit lands on a reconciliation and a payout. Made-for-advertising sites are covered in [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#made-for-advertising-sites). The generic engine for scoring and deciding is the playbook's [Risk Scoring](/docs/building-blocks/risk-scoring).

## How the Platforms Do It

As of November 2026:

| Platform or body | Before billing | After billing | What the buyer sees |
| --- | --- | --- | --- |
| **Amazon Ads** | Traffic quality systems filter invalid traffic on Sponsored Products, Sponsored Brands and Sponsored Display | Not stated on the page opened | A gross and invalid traffic report (since September 30, 2022): gross and invalid impressions and clicks, and the invalid rates |
| **Display & Video 360** (Google) | Invalid traffic removed "before inventory is bid on" is "never bought" | Post-serve removals are credited back; all exchange partners "have agreed to provide refunds" for traffic Google considers invalid | Invalid traffic metrics in reporting; adjustment credits per advertiser on the invoice, usable for future advertising only |
| **Google Ads** | Most invalid traffic is caught "shortly after the ad interaction" and never charged | Invalid activity found later comes back as an "Invalid activity" credit that doesn't change campaign metrics | An "Invalid clicks" column; an invalid activity credit report |
| **Google AdSense** (the publisher side) | Invalid clicks and impressions excluded from finalized earnings | High invalid traffic can limit or disable ad serving, or suspend or close the account | The difference between estimated and finalized earnings |
| **MRC** | Defines GIVT and SIVT and requires both to be filtered and reported by environment | Requires discrepancy resolution processes for IVT reporting | Accredited vendors report GIVT and SIVT separately |
| **TAG** (Certified Against Fraud) | Certified companies must filter "100% of the monetizable transactions" for GIVT and SIVT | Not a refund scheme | The certification seal; TAG's benchmark reports |

The pattern holds across platforms: **filter what you can before the money is committed, credit what you find afterward, and never rewrite the history of what happened.** Google Ads states the last part outright: credits do not retroactively change campaign metrics. The rule the rest of this chapter builds on is the same one the core model uses: the `ivt` class is a flag on an event, the billable count is the event count minus what was flagged, and invalid traffic found after an invoice is a credit line, not an edit.

## GIVT and SIVT

The MRC's Invalid Traffic Detection and Filtration Guidelines were issued in October 2015 and replaced in June 2020 by the IVT 2.0 Standards Addendum, with an interim update memo published in April 2024. They split invalid traffic into two categories by how hard it is to find, not by intent:

**General invalid traffic (GIVT)** is "traffic identified through routine means of filtration executed through application of lists or with other standardized parameter checks." The examples: known invalid data-center traffic, bots and spiders that declare themselves and other crawlers, activity-based filtration (impossibly frequent events from one source), non-browser user agents, pre-fetch and pre-rendered traffic, invalid placements such as 0x0 and 1x1 ad slots, and non-rendering devices such as headless browsers. Data-center filtering uses industry lists like TAG's Data Center IP List, which covers data-center addresses "where human traffic is not expected to originate" and excludes mixed addresses; where the lists fall short, the 2024 memo restates the requirement to filter invalid data-center traffic "originating from IPs associated to the three largest known hosting entities: Amazon AWS, Google and Microsoft."

**Sophisticated invalid traffic (SIVT)** "require[s] advanced analytics, multi-point corroboration/coordination, significant human intervention, etc., to analyze and identify." The categories include automated browsing from hijacked devices and emulators; incentivized human activity (click farms, paid-to-browse traffic); manipulated activity ("forced clicking behavior, tricking users to click / accidental clicks, clickjacking"); falsified impression, viewability, location or consent-string events; SSAI spoofing; app ID spoofing and domain laundering (the MRC files domain spoofing under "domain and app misrepresentation"); hidden, stacked or covered ads ("Z-order stacking, banner stuffing, transparent ads"); invalid proxy traffic; adware and malware that inject ads; and cookie stuffing.

Three rules in the standards shape the data:

- **Report GIVT and SIVT separately, by environment.** IVT reporting is split into desktop and mobile web, in-app and OTT (CTV), because the methods differ and so do the false positive rates: IP-only methods miss "mobile and OTT proxy routing", and OTT and SSAI can carry a disproportionate share of proxy and data-center traffic that is legitimate, which risks false positives.
- **Missing data is unmeasurable, not invalid.** The 2024 memo tells vendors to "take care to not erroneously invalidate traffic with missing information due to privacy constraints without direct IVT signals and instead consider this unmeasurable for IVT (not valid by default)." A request with a truncated IP and a reduced user agent is a third state, neither clean nor flagged.
- **Categories move.** Sources first found by sophisticated means are reported to industry list maintainers so they can "migrate this to GIVT where possible" as lists mature. A classification is therefore always "GIVT under this definition version", and a stored flag carries the rule version that set it.

The 2024 memo added two SIVT requirements that matter for CTV and for property-level decisions. For **domain, inventory and bundle ID mismatch**, an SIVT vendor that receives a declared property ID pre-bid must compare it with where the ad actually served, treat "illegitimate mismatch or situations where there is evidence of falsified property ID" as SIVT, and do the same for inventory or placement type (display declared as video, interstitial declared as in-stream); "Non-CTV Apps misrepresented as CTV should be considered SIVT." For **property-level** reporting, it notes that some sources have "a high degree of IVT, with some legitimate traffic making up the minority of traffic", citing made-for-advertising and made-for-arbitrage sites, and asks for property-level IVT reporting while keeping the rule that valid traffic can't be labeled invalid "solely based on the inventory source."

The MRC's GIVT list is not TAG's taxonomy; the addendum says its categories "should not be confused with" TAG's IVT Taxonomy v2.0. A system that ingests both vendors' and TAG's vocabularies maps them to one internal category list and keeps the source vocabulary on each record.

## The Schemes

Fraud follows the money and the weakest verification. The public record has a few large, well-documented operations, and the MRC's SIVT categories describe the rest.

**Data-center bots and spoofed domains (Methbot).** The operation behind Methbot ran through a company, Media Methane, that took on clients to place their ads on websites and never did, and, as TechTarget reported from the Eastern District of New York sentencing in November 2021, rented more than 2,000 servers in Dallas and Amsterdam data centers and 765,000 IP addresses, and ran bots that loaded real ads onto blank pages while "spoofing" the domains of more than 6,000 publishers. The bots faked screens, mice, operating systems and mainstream browsers, made random clicks and accepted cookies. The scheme took about $7 million from clients; its operator, Aleksandr Zhukov, was sentenced to 10 years and ordered to forfeit $3,827,493. <!-- source-gap: adv-methbot-doj-primary | secondary | Methbot servers, IPs, domains, $7M and the Zhukov sentence | closes with: the EDNY press release or the indictment opened directly (justice.gov returned empty bodies to WebFetch) | checked: 2026-11-22 --> The DOJ's own releases could not be opened; the figures here are from the trade press report of them.

**Botnets on real computers (3ve).** Google and White Ops (now HUMAN) published their investigation of 3ve in November 2018. At its peak it "controlled over 1 million IPs from both residential botnet infections and corporate IP spaces", produced "more than 10,000 counterfeit domains", generated "over 3 billion daily bid requests" (the report's range was 3 to 12 billion or more), and spanned over 1,000 data-center servers. It ran three sub-operations: 3ve.1, data-center browsers hiding behind residential IPs acquired through the Boaxxe/Miuref malware and hijacked IP ranges; 3ve.2, the Kovter botnet with "up to 700,000 active desktop infections at any given time" running a hidden browsing engine on victims' machines; and 3ve.3, data-center bots hiding behind other data centers' addresses. Its malware used anti-forensics, scanning a machine's processes, hardware, username and IP address for security software before running. The prosecution covered December 2015 to October 2018, more than 1.7 million infected computers and about $29 million in ad spend; in May 2022 the US recovered $15,111,453.84 from Swiss accounts, as The Record reported. <!-- source-gap: adv-3ve-doj-primary | secondary | 3ve's prosecution period, 1.7 million computers, $29 million and the $15.1 million recovery | closes with: the EDNY indictment or forfeiture release opened directly | checked: 2026-11-22 -->

The 3ve report's most useful number for an engineer is about the supply chain: "more than 80% of the incoming ad bid requests that 3ve generated in early 2018 were unauthorized," meaning the seller was not listed in the domain's ads.txt (80.3% unauthorized, 11% authorized indirect, 8.6% authorized direct). Domain spoofing at scale depends on buyers that don't check authorization, which is why ads.txt, sellers.json and the SupplyChain object exist; [ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain), in Programmatic, covers them.

**App spoofing and SDK spoofing.** In apps the equivalent of domain spoofing is declaring a valuable app's bundle ID in a bid request from a different app, or from a server. SDK spoofing goes further and fakes the events themselves: AppsFlyer describes it as fake installs and in-app events sent to attribution providers from real devices, typically through malicious code in another app, with signs such as installs reported from SDK versions nobody uses. **Click injection** is Android-specific: a junk app listens for install broadcasts and fires "a click ... just before an app is fully installed," stealing the attribution for an organic install. The defenses are signed SDK traffic, app-ads.txt, and the MMP's rejection rules, covered in [Mobile Measurement Partners](/books/advertising/mobile-measurement-partners).

**Hidden and stacked ads.** Ads stacked in one slot (only the top one visible), ads in 1x1 frames ("pixel stuffing", which the MRC lists under hidden or stacked serving as "banner stuffing"), auto-refreshing slots on pages nobody looks at, and video players hidden behind content. Each counts real renders that nobody can see; viewability measurement catches some of it, and the MRC classes it as SIVT when intentional.

**SSAI and CTV spoofing.** Server-side ad insertion makes every tracking call come from the stitcher's data center, so a fraudster with a server can pretend to be thousands of TVs. IAB Tech Lab's CTV guidance and TAG's certification both require stitchers to send the device's IP and user agent (`X-Device-IP`, `X-Device-User-Agent`, or `X-Forwarded-For`) on server-side tracking requests, and the MRC lists SSAI spoofing as SIVT; the 2024 memo adds that non-CTV apps declared as CTV are SIVT. [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) and [Server-Side Ad Insertion & Ad Pods](/books/advertising/server-side-ad-insertion) cover the headers and counting; TAG's July 2026 guidelines add device attestation (below).

**Made-for-advertising sites.** Not always invalid traffic: an MFA site can have real visitors bought through cheap arbitrage traffic and shown more ads than content. The ANA, 4A's, WFA and ISBA definition of September 2023 and the ANA benchmarks are in [Made-for-Advertising Sites](/books/advertising/take-rates-and-supply-quality#made-for-advertising-sites); the MRC's 2024 memo is the bridge, asking SIVT vendors for property-level reporting where invalid traffic dominates a property.

**Click and engagement fraud on self-serve platforms.** Competitors clicking a rival's search ads, publishers clicking their own ads, incentivized clicks. AdSense lists "publishers clicking their own live ads", "repeated ad clicks or impressions generated by one or more users", encouraging clicks, and "automated clicking tools or traffic sources, robots, or other deceptive software", and says "it is your responsibility as the publisher to ensure that the traffic on your ads is valid" even when a third party generated it without the publisher's knowledge.

## Detection in the Pipeline

Detection is a set of stages at different latencies, each producing a decision that later stages can override:

| Stage | When | What it catches | Decision it records |
| --- | --- | --- | --- |
| **Pre-bid** | In the bid path, under the request timeout | Known data-center IPs, declared bots, blocked domains and apps, unauthorized sellers (ads.txt), mismatched schain, vendor pre-bid segments | No bid, with a reason; the impression is never bought |
| **Serve time** | At the ad server or exchange decision | Invalid placements (0x0, 1x1), malformed requests, frequency anomalies per source | No serve, or serve and flag |
| **Event stream** | Seconds to minutes after the beacon | GIVT lists applied to impressions and clicks, unsigned or replayed beacons, duplicate events, impossible timing | `ad_events.ivt = 'givt'` before the daily roll-up |
| **Batch analysis** | Hours to days | SIVT: botnet patterns, proxy and residential-IP abuse, click farms, stacked ads, property-level anomalies | `ad_events.ivt = 'sivt'`, a restated `delivery_daily` row |
| **Investigation** | Weeks to months | Schemes: a seller laundering inventory, a spoofed bundle ID, a botnet like 3ve | A finding with evidence and an affected period, and credits and clawbacks across closed invoices |

My rules for the pipeline:

- **Every no-bid and every flag has a reason code and a rule version.** A publisher disputing a deduction, an auditor checking accreditation and an engineer chasing a false positive all need to know which list or model, at which version, made the call. The MRC's discrepancy resolution requirements apply "to customers and non-customers", so reasons must be explainable without revealing the detection method in full.
- **Flag, don't delete.** A later classification moves counts out of billing without losing what happened, and a reversed classification (a false positive confirmed on appeal) moves them back.
- **Keep unmeasurable as its own state.** Following the MRC's 2024 memo, an event missing the signals needed for IVT detection is reported as unmeasured, not as valid and not as invalid.
- **Filter before the money where you can.** DV360's distinction is the one to copy: pre-bid removal is "never bought (because it wasn't bid on)", post-serve removal is "not paid for (because it is credited back to your account)". The first is cheap; the second is an accounting event in three companies.

Signals for detection are personal data in most privacy regimes (IP addresses, device characteristics), and the MRC is explicit that "privacy regulations are not a barrier to be engineered around." Whatever the legal basis for collecting them, the data collected for fraud detection stays in the fraud system: device signals for invalid traffic detection, never for targeting ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)). [Third-Party Cookies & Browser Privacy](/books/advertising/cookies-and-browser-privacy), in Identity and Audiences, covers why fingerprinting for advertising is off-limits while the same signals remain usable for IVT.

## TAG Certified Against Fraud

The Trustworthy Accountability Group runs the industry's anti-fraud certification. Its Certified Against Fraud Guidelines (version 11.0, July 2026) set requirements by role: direct buyers, direct sellers, intermediaries, and anti-fraud and measurement services. The requirements in the version opened:

- **Administrative:** TAG registration and membership in good standing, a designated TAG compliance officer, annual Certified Against Fraud training.
- **IVT detection and removal:** "100% of the monetizable transactions (including impressions, clicks, conversions, etc.)" filtered for both GIVT and SIVT under a TAG-recognized standard, either through in-house technology certified by an independent auditor or through accredited vendors.
- **Domain threat, data-center IP and app threat filtering,** with TAG's Data Center IP List as a shared input, applied "pre-bid or post-bid as long as all of the monetizable transactions ... are filtered"; using TAG's list as the only data-center filter does not comply.
- **Payment ID:** intermediaries must implement TAG's Payment ID System "for all transactions using the OpenRTB protocol"; version 11.0 made Payment ID the required follow-the-money mechanism for intermediaries. Its stated objective is to let buyers "avoid untrustworthy parties in the supply chain; and take effective remedial action if necessary."
- **ads.txt and app-ads.txt:** direct sellers publish them, with TAG IDs in the certification authority field for their intermediaries; buyers "honor" them, "buying only from entities identified within the published ads.txt file."
- **Device attestation:** direct sellers monetizing their own apps in Amazon's Fire TV App Store or Apple's App Store must support it, either through Open Measurement SDK version 1.6 or higher or an equivalent; verifiers operate a Privacy Pass origin service and issue attestation challenges. This is the 2026 answer to CTV spoofing: a cryptographic token that the impression came from a real app on a real device.
- **SSAI headers:** SSAI vendors firing server-side tracking must send the device headers called out in the VAST specification.

TAG's benchmark reports measure the effect. Its October 2024 US study (by The 614 Group, covering the first half of 2024) found invalid traffic under 1% in TAG Certified Channels for the fourth straight year, on 745 billion impressions; the release doesn't state the exact rate. These are rates in certified supply chains measured by certified vendors, not the rate across the open web, and a system should report its own IVT rate per channel rather than assume the benchmark.

## Refunds, Credits and Clawbacks

When invalid traffic is found after billing, money moves backward through every hop that took a share of it. The chain for one open-auction impression:

1. **The advertiser** is credited by its buying platform (a DSP, a self-serve platform), usually as a credit on a later invoice or against future spend. Google Ads credits "Invalid activity"; DV360 credits per advertiser and says an invalid traffic adjustment credit "is good for future advertising only and can't be refunded to you."
2. **The DSP** recovers from the exchange the media cost it paid for the invalid impressions, under the exchange's terms. DV360 says all of its exchange partners "have agreed to provide refunds for traffic that was considered invalid by Google," which is what lets DV360 credit its own advertisers without carrying the loss.
3. **The exchange or network** deducts from the publisher's earnings: AdSense's finalized earnings exclude invalid traffic, which shows up as "a difference between your estimated and finalized earnings." If the publisher was already paid, the deduction comes out of a later payment, which is a clawback ([Clawbacks](/books/payments/payouts-and-settlement#clawbacks)).
4. **Each intermediary's fee** on the invalid impressions is reversed with the media: a fee computed on gross spend that never should have been charged is credited with it, under each `fee_terms` row.

Three properties make this hard:

- **Different detectors, different verdicts.** The DSP's vendor, the exchange's own filters and the publisher's vendor may disagree. Which classification moves money is a contract term, like the controlling measurement for counts; DV360's terms make Google's classification the one exchanges refund on. Where no contract says so, credits are negotiated, and the record of each party's classification is what the negotiation is about.
- **Different periods.** The advertiser's credit lands on its next invoice; the exchange's refund on the DSP's next statement; the publisher's deduction in the earnings month the exchange closes next. One finding produces several adjustments, each dated in its own ledger, all pointing at the same finding.
- **Recoverability.** A publisher that has left the network, a fraudulent seller that was paid and vanished, an intermediary that went out of business: the money can't always be recovered upstream, and someone books the loss. Payment terms that pay publishers net 30 or later, and holds when a property is under investigation, exist partly for this reason; [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts) covers holds and thresholds.

The new IAB General Terms and Direct Buy Addendum (final May 2026, with the clause-level terms known only from trade press reports of the public comment draft) are reported to make IVT-driven impressions non-billable on direct buys and to trigger remedies above 2% GIVT or 0.1% SIVT; [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms) covers what is known of them.

### Worked example: one finding, four adjustments

An SIVT vendor finds that a seller account laundered spoofed CTV inventory through an exchange from March 1 to March 20. Inside one DSP, the affected impressions bought by one line item were 400,000 at a $25.00 CPM (an example price), so the media cost was 400,000 x 25,000,000 / 1,000 = 10,000,000,000 micros, $10,000.00. The DSP's platform fee on that line item is 15% of media (an example rate), $1,500.00. The exchange's sell-side fee is 20% (an example rate), so the publisher's share was $8,000.00 and the exchange kept $2,000.00. The adjustments:

| Party | Record | Amount |
| --- | --- | --- |
| Advertiser | Credit on the April invoice from the DSP: `ivt_credit` media line and the reversed DSP fee line | -$10,000.00 and -$1,500.00 |
| DSP | Refund on the exchange's April statement to the DSP | -$10,000.00 |
| Exchange | Deduction from the seller's March earnings (if still open) or a clawback from April's | -$8,000.00 |
| Exchange | Its own fee, reversed in its revenue | -$2,000.00 |

![An SIVT finding, 400,000 impressions from March 1 to 20, drawn dashed down to four parties in a row: advertiser, DSP, exchange and seller. Ink arrows run forward with what was paid: $11,500 from the advertiser to the DSP, $10,000 from the DSP to the exchange, $8,000 from the exchange to the seller. Accented arrows run back: an $8,000 clawback from the seller to the exchange, a $10,000 refund from the exchange to the DSP, and an $11,500 credit from the DSP to the advertiser. Under each party: credited on the April invoice from the DSP; its $1,500 fee reversed with the media; its own $2,000 fee reversed in revenue; deducted from March earnings, or clawed back from April's.](/diagrams/adv-ivt-adjustment-chain.svg "One finding, one adjustment in each ledger, all pointing back at the finding. If the seller was paid and is gone, the exchange books the $8,000 loss.")

The DSP is whole if the exchange refunds; the exchange is whole only if it recovers $8,000.00 from the seller. If the seller was paid and is gone, the exchange books an $8,000.00 loss. Every amount is computed from the finding's affected impressions and the fee terms in force, not typed.

## How to Build It

The core flags each event (`ad_events.ivt` in `none`, `givt`, `sivt`), counts what was removed (`delivery_daily.invalid_impressions`) and credits after billing (`invoice_lines.kind = 'ivt_credit'`). This chapter adds the reason and rule version on each flag, a split of the removed count, the lists filtering runs on, findings with their evidence and affected scope, and the adjustments each finding produces for each party. Delivery reaches these tables through `counting_policies` and `click_validations` ([Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks)) and the fee lines through `fee_terms` ([Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it)).

```sql
-- Why each event was flagged, by whom, under which rule; and the unmeasured state.
ALTER TABLE ad_events
  ADD COLUMN ivt_category TEXT,             -- internal category, mapped from the source vocabulary
  ADD COLUMN ivt_source_org_id UUID,        -- whose classification: this system or a vendor
  ADD COLUMN ivt_rule_version TEXT,         -- list or model version that set the flag
  ADD COLUMN ivt_classified_at TIMESTAMPTZ,
  ADD COLUMN ivt_measurable BOOLEAN NOT NULL DEFAULT TRUE;  -- false: signals missing, not judged
ALTER TABLE ad_events ADD CONSTRAINT ad_events_ivt_category_check
  CHECK (ivt_category IS NULL OR ivt_category IN ('data_center', 'declared_bot',
    'non_browser_ua', 'prefetch', 'invalid_placement', 'activity_based', 'hijacked_device',
    'emulator', 'incentivized_human', 'manipulated_activity', 'falsified_event',
    'domain_misrepresentation', 'app_misrepresentation', 'ssai_spoofing', 'hidden_or_stacked',
    'invalid_proxy', 'adware_injection', 'other')) NOT VALID;
ALTER TABLE ad_events ADD CONSTRAINT ad_events_ivt_flag_reason_check
  CHECK (ivt = 'none' OR (ivt_category IS NOT NULL AND ivt_rule_version IS NOT NULL)) NOT VALID;

-- The removed count split as the MRC reports it; givt = invalid - sivt.
ALTER TABLE delivery_daily
  ADD COLUMN sivt_impressions BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN invalid_clicks BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN ivt_unmeasured_impressions BIGINT NOT NULL DEFAULT 0;
ALTER TABLE delivery_daily ADD CONSTRAINT delivery_daily_sivt_check
  CHECK (sivt_impressions <= invalid_impressions) NOT VALID;

CREATE TABLE ivt_filter_lists (            -- a list filtering runs on, versioned
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_org_id  UUID NOT NULL REFERENCES organizations (id),  -- TAG, the IAB, a vendor, this system
  name              TEXT NOT NULL,          -- 'tag-dcip', 'iab-spiders-and-bots', 'internal-app-threat'
  kind              TEXT NOT NULL CHECK (kind IN ('ip_range', 'user_agent', 'domain', 'app_bundle',
                      'seller_account', 'device_id_hash', 'other')),
  ivt_class         TEXT NOT NULL CHECK (ivt_class IN ('givt', 'sivt')),
  version           TEXT NOT NULL,
  effective_at      TIMESTAMPTZ NOT NULL,
  license_ref       TEXT,                   -- many lists are licensed to members only
  UNIQUE (publisher_org_id, name, version)
);

CREATE TABLE ivt_filter_list_entries (
  list_id           UUID NOT NULL REFERENCES ivt_filter_lists (id),
  entry_key         TEXT NOT NULL,          -- CIDR, UA pattern, domain, bundle, seller ID
  ip_range          CIDR,                   -- set for kind 'ip_range', for range lookups
  ivt_category      TEXT NOT NULL,          -- as ad_events.ivt_category
  PRIMARY KEY (list_id, entry_key)
);
CREATE INDEX ivt_filter_list_entries_ip_idx
  ON ivt_filter_list_entries USING gist (ip_range inet_ops) WHERE ip_range IS NOT NULL;

CREATE TABLE ivt_findings (                -- a detected scheme or source, with its evidence and scope
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  detected_by_org_id UUID NOT NULL REFERENCES organizations (id),
  ivt_class         TEXT NOT NULL CHECK (ivt_class IN ('givt', 'sivt')),
  ivt_category      TEXT NOT NULL,
  subject_kind      TEXT NOT NULL CHECK (subject_kind IN ('seller_account', 'property', 'ad_unit',
                      'app_bundle', 'supply_path', 'ip_range', 'buyer_seat', 'other')),
  seller_account_id UUID REFERENCES seller_accounts (id),
  property_id       UUID REFERENCES properties (id),
  supply_path_id    UUID REFERENCES supply_paths (id),
  subject_key       TEXT,                   -- the bundle, range or other key when no row exists
  affected_period   TSTZRANGE NOT NULL,
  affected_impressions BIGINT NOT NULL CHECK (affected_impressions >= 0),
  affected_clicks   BIGINT NOT NULL DEFAULT 0,
  evidence_ref      TEXT NOT NULL,          -- the analysis, kept with restricted access
  rule_version      TEXT NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('suspected', 'confirmed', 'disputed',
                      'reversed', 'closed')),
  confirmed_at      TIMESTAMPTZ,
  confirmed_by      TEXT,                   -- typed actor: an analyst or a model version
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status NOT IN ('confirmed', 'closed') OR confirmed_at IS NOT NULL),
  CHECK (num_nonnulls(seller_account_id, property_id, supply_path_id, subject_key) >= 1)
);
CREATE INDEX ivt_findings_seller_idx ON ivt_findings (seller_account_id, affected_period);

CREATE TABLE ivt_adjustments (             -- the money a finding moves, per party and period
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  finding_id        UUID NOT NULL REFERENCES ivt_findings (id),
  direction         TEXT NOT NULL CHECK (direction IN ('credit_to_buyer', 'refund_from_seller',
                      'deduction_from_publisher', 'fee_reversal')),
  counterparty_org_id UUID NOT NULL REFERENCES organizations (id),
  line_item_id      UUID REFERENCES line_items (id),
  deal_id           UUID REFERENCES deals (id),
  fee_term_id       UUID REFERENCES fee_terms (id),  -- fee_reversal: the term that charged it
  impressions       BIGINT NOT NULL CHECK (impressions >= 0),
  amount_micros     BIGINT NOT NULL CHECK (amount_micros >= 0),  -- computed from delivery and terms
  currency          CHAR(3) NOT NULL,
  ledger_period     DATERANGE NOT NULL,     -- the invoice or earnings period it lands in
  invoice_line_id   UUID REFERENCES invoice_lines (id),  -- the ivt_credit line, once issued
  status            TEXT NOT NULL CHECK (status IN ('computed', 'issued', 'recovered',
                      'unrecoverable', 'reversed')),
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (direction <> 'fee_reversal' OR fee_term_id IS NOT NULL),
  CHECK (status <> 'issued' OR invoice_line_id IS NOT NULL OR direction = 'deduction_from_publisher')
);
CREATE UNIQUE INDEX ivt_adjustments_once_idx ON ivt_adjustments
  (finding_id, direction, counterparty_org_id,
   COALESCE(line_item_id, deal_id, fee_term_id)) WHERE status <> 'reversed';

-- after backfilling categories and rule versions on flagged events
ALTER TABLE ad_events VALIDATE CONSTRAINT ad_events_ivt_category_check;
ALTER TABLE ad_events VALIDATE CONSTRAINT ad_events_ivt_flag_reason_check;
ALTER TABLE delivery_daily VALIDATE CONSTRAINT delivery_daily_sivt_check;
```

The publisher side of a deduction is an entry in the publisher's earnings ledger (`publisher_earnings_entries`, [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts)) pointing back at the adjustment, so a publisher statement can show which finding took which amount. IVT rates per seller and day are a query, not a stored percentage:

```sql
-- GIVT and SIVT rates per seller account for a period, from the daily roll-up
SELECT a.seller_account_id,
       SUM(d.impressions + d.invalid_impressions) AS gross_impressions,
       ROUND(100.0 * SUM(d.invalid_impressions - d.sivt_impressions)
             / NULLIF(SUM(d.impressions + d.invalid_impressions), 0), 3) AS givt_pct,
       ROUND(100.0 * SUM(d.sivt_impressions)
             / NULLIF(SUM(d.impressions + d.invalid_impressions), 0), 3) AS sivt_pct
FROM delivery_daily d
JOIN deals a ON a.id = d.deal_id
WHERE d.day >= $1 AND d.day < $2
  AND d.source = 'first_party'  -- one source per row set, or sources double count
GROUP BY a.seller_account_id
```

Computing a finding's adjustments is the same chain as a fee chain, run backward: the affected impressions per line item, the cost at the price each was bought for, each fee term's share, and the publisher's share. The function below takes the affected delivery and the fee rates in basis points and returns the amounts in micros, rounding each share down so the parts never exceed the whole:

```go tab="Go"
// AffectedDelivery is one line item's invalid impressions inside a finding's scope.
type AffectedDelivery struct {
	LineItemID  string
	Impressions int64
	CPMMicros   int64 // the price these impressions were bought at
}

type Adjustment struct {
	Direction    string // credit_to_buyer, fee_reversal, refund_from_seller, deduction_from_publisher
	LineItemID   string
	AmountMicros int64
}

// Adjust computes the buyer credit, the buy-side fee reversal, the refund the buyer
// claims from the exchange and the deduction the exchange takes from the publisher.
// buyFeeBP is charged on media; sellFeeBP is the exchange's share of the clearing price.
func Adjust(rows []AffectedDelivery, buyFeeBP, sellFeeBP int64) []Adjustment {
	var out []Adjustment
	for _, r := range rows {
		media := r.Impressions * r.CPMMicros / 1000
		fee := media * buyFeeBP / 10000
		publisher := media - media*sellFeeBP/10000
		out = append(out,
			Adjustment{"credit_to_buyer", r.LineItemID, media},
			Adjustment{"fee_reversal", r.LineItemID, fee},
			Adjustment{"refund_from_seller", r.LineItemID, media},
			Adjustment{"deduction_from_publisher", r.LineItemID, publisher},
		)
	}
	return out
}
```

```rust tab="Rust"
/// One line item's invalid impressions inside a finding's scope.
pub struct AffectedDelivery {
    pub line_item_id: String,
    pub impressions: i64,
    pub cpm_micros: i64, // the price these impressions were bought at
}

pub struct Adjustment {
    pub direction: &'static str,
    pub line_item_id: String,
    pub amount_micros: i64,
}

/// Buyer credit, buy-side fee reversal, refund from the exchange and the
/// publisher deduction. `buy_fee_bp` is on media; `sell_fee_bp` is the exchange's share.
pub fn adjust(rows: &[AffectedDelivery], buy_fee_bp: i64, sell_fee_bp: i64) -> Vec<Adjustment> {
    let mut out = Vec::with_capacity(rows.len() * 4);
    for r in rows {
        let media = r.impressions * r.cpm_micros / 1000;
        let fee = media * buy_fee_bp / 10_000;
        let publisher = media - media * sell_fee_bp / 10_000;
        for (direction, amount) in [
            ("credit_to_buyer", media),
            ("fee_reversal", fee),
            ("refund_from_seller", media),
            ("deduction_from_publisher", publisher),
        ] {
            out.push(Adjustment {
                direction,
                line_item_id: r.line_item_id.clone(),
                amount_micros: amount,
            });
        }
    }
    out
}
```

With the worked example's 400,000 impressions at 25,000,000 CPM micros, a 1,500 bp buy-side fee and a 2,000 bp sell-side fee, the function returns 10,000,000,000 micros of buyer credit and refund, 1,500,000,000 of fee reversal and 8,000,000,000 of publisher deduction. A real system writes one function per side (the DSP never knows the publisher's share; the exchange never knows the DSP's fee) and reads the rates from `fee_terms` and `network_revenue_shares` in force on each impression's day.

Design notes:

- **One finding, many adjustments, each idempotent.** The partial unique index lets each finding produce one live adjustment per direction, party and line item or fee; recomputing after more impressions are found reverses the old row and writes a new one, like a restated roll-up ([Idempotency](/docs/requests/idempotency)).
- **Adjustments land in open periods.** A credit never edits an issued invoice; it is an `ivt_credit` line on the next one, and a deduction is an entry in the next open earnings month. `ledger_period` records where it landed, which is what a reconciliation reads.
- **Evidence is restricted.** Findings point at the analysis rather than storing it, because the method is the defense; access to `evidence_ref` is logged, and the reason codes shown to a publisher are coarser than the rule that fired.
- **Lists are licensed and versioned.** TAG's Data Center IP List is available to certified participants and members, not the public; `license_ref` records the terms, and every flag records the list version so a restatement after a list update can be explained.
- **Unrecoverable is a state, not a missing row.** When the publisher or seller can't be charged back, the adjustment stays with status `unrecoverable`, which is the number finance books as a loss and risk teams use to set holds.
- **Reversal restores money, never rewrites events.** A finding overturned on dispute sets its adjustments to `reversed` and writes opposite entries; the events keep their history, with a new classification row superseding the old.

## Auditing

- **Every flag with its reason, source and rule version,** so a credit, a deduction or a disputed classification can be explained event by event, and a list or model change can be shown to have changed only what it should.
- **GIVT and SIVT counts by environment and source,** per day and seller, as the MRC requires accredited vendors to report and as buyers ask for in a reconciliation.
- **Every finding with its evidence, scope and status history,** and every adjustment it produced, in whose ledger, in which period, and whether it was recovered.
- **What was bought pre-bid and why not.** No-bid reasons for authorization, lists and vendor segments, kept for the dispute window, so a seller asking why its traffic stopped can be answered.
- **Certification evidence.** For TAG Certified Against Fraud, the record that 100% of monetizable transactions passed GIVT and SIVT filtering, Payment ID on OpenRTB traffic, ads.txt honored, device headers on SSAI tracking, and device attestation where required.

## What This Means for the System You Build

- **Flag invalid traffic with a category, a source and a rule version,** and treat missing signals as unmeasured, not as clean or invalid.
- **Filter before the money where you can** (pre-bid, at serve, in the stream), and keep the later stages for what only analysis can find.
- **Split GIVT and SIVT and report them by environment,** the way the MRC asks accredited vendors to.
- **Check authorization on every request:** ads.txt, app-ads.txt, sellers.json and the supply chain, because spoofing at scale depends on buyers who don't.
- **Make a finding a record with an affected scope,** and compute every credit, refund, fee reversal and publisher deduction from it, in each party's next open period.
- **Never edit an issued invoice or a closed earnings month;** add credit lines and deductions, and keep unrecoverable amounts as their own state.
- **Keep detection data inside the fraud system,** under the privacy rules that apply to it, and never reuse it for targeting.

## References

**Specifications**

- [MRC: Invalid Traffic Detection and Filtration Standards Addendum (IVT 2.0)](https://mediaratingcouncil.org/sites/default/files/Standards/IVT%20Addendum%20Update%20062520.pdf), GIVT and SIVT definitions and examples, data-center lists, reporting by environment and by GIVT and SIVT, the note that MRC categories differ from TAG's taxonomy
- [MRC: 2024 IVT Interim Updates](https://mediaratingcouncil.org/sites/default/files/Standards/2024_IVT_Interim_Updates_FINAL.pdf), privacy and missing signals treated as unmeasurable, the three largest hosting entities, domain, inventory and CTV bundle ID mismatch as SIVT, property-level reporting and MFA
- [MRC: Standards and guidelines](https://mediaratingcouncil.org/standards-and-guidelines), issue and update dates of the IVT guidelines and the 2024 memo
- [TAG: Certified Against Fraud Guidelines](https://www.tagtoday.net/hubfs/CAF/TAG%20CAF%20Guidelines%20Final.pdf?hsLang=en-us), version 11.0 (July 2026), requirements by role, 100% GIVT and SIVT filtering, the Data Center IP List, Payment ID, ads.txt, device attestation and SSAI headers
- [IAB Tech Lab: CTV Programmatic Guide](https://iabtechlab.com/standards-old/ctv-programmatic-guide/), X-Device-IP and X-Device-User-Agent from stitchers

**Reference**

- [Google and White Ops: The Hunt for 3ve (November 2018)](https://services.google.com/fh/files/blogs/3ve_google_whiteops_whitepaper_final_nov_2018.pdf), peak IPs, counterfeit domains, daily bid requests, servers, the three sub-operations, Kovter's infections and the ads.txt status of 3ve's traffic
- [AppsFlyer: SDK spoofing](https://www.appsflyer.com/glossary/sdk-spoofing/), fake installs and events sent from real devices through malicious code
- [AppsFlyer: Click injection](https://www.appsflyer.com/glossary/click-injection/), Android install broadcasts and the injected click
- [TAG: Fourth straight year of sub-1% IVT in TAG Certified Channels (October 2024)](https://www.tagtoday.net/pressreleases/us-ad-industry-extends-success-in-fight-against-fraud-with-fourth-straight-year-of-sub-1-ivt-in-tag-certified-channels), the 2024 US benchmark and its 745 billion impressions
- [TechTarget: "King of Fraud" sentenced for Methbot botnet operation (November 2021)](https://www.techtarget.com/searchsecurity/news/252509387/King-of-Fraud-sentenced-for-Methbot-botnet-operation), the EDNY sentence and forfeiture, servers, IP addresses, spoofed domains and the $7 million taken (secondary)
- [The Record: US recovers $15 million in profits from 3ve ad fraud scheme (May 2022)](https://therecord.media/us-recovers-15-million-in-profits-from-3ve-ad-fraud-scheme/), the prosecution period, 1.7 million infected computers, about $29 million and the recovery (secondary)
- [IAB: Standard Advertising Services Terms and Conditions (May 20, 2026)](https://www.iab.com/guidelines/direct-buy-addendum-v1-0-final/), the final General Terms and Direct Buy Addendum, whose text sits behind an account login
- [PPC Land: IAB's new contract framework addresses 15 years of advertising chaos (February 15, 2026)](https://ppc.land/iabs-new-contract-framework-addresses-15-years-of-advertising-chaos/), the public comment draft's non-billable IVT clause and its 2% GIVT and 0.1% SIVT thresholds (secondary)

**In practice**

- [Google Ads Help: Invalid traffic](https://support.google.com/google-ads/answer/2549113), invalid traffic caught shortly after the interaction, pre-billing filtering, invalid activity credits that don't change campaign metrics
- [Display & Video 360 Help: Filtering invalid traffic to ensure quality](https://support.google.com/displayvideo/answer/6076504?hl=en), pre-bid removal never bought, post-serve removal credited, invalid traffic reporting metrics
- [Display & Video 360 Help: Invalid traffic refunds by exchanges](https://support.google.com/displayvideo/answer/7556661?hl=en), exchange partners' agreement to refund traffic Google considers invalid, adjustment credits per advertiser
- [Display & Video 360 Help: Invoices and adjustments to your account](https://support.google.com/displayvideo/answer/9373922?hl=en-GB), invalid traffic adjustments usable for future advertising only
- [Amazon Ads: Gross and invalid traffic report (September 30, 2022)](https://advertising.amazon.com/resources/whats-new/gross-and-invalid-traffic-report-in-advertising-console), gross and invalid impressions and clicks and their rates for sponsored ads
- [Google AdSense Help: Invalid traffic](https://support.google.com/adsense/answer/16737), examples, the publisher's responsibility, limited or disabled ad serving, account suspension, finalized earnings
