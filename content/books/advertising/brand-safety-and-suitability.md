+++
title = "Brand Safety & Suitability"
nav_title = "Brand Safety"
description = "Where an ad may appear: safety floors and suitability tiers, GARM's end, the FTC agency orders, pre-bid and post-bid controls, taxonomies and blocklists."
category = "Advertising Industry"
order = 2941
part = "Fraud and Brand Safety"
tags = ["advertising", "brand-safety", "brand-suitability", "verification", "content-taxonomy", "ftc", "data-model"]
+++

Brand safety is the question of where an ad may appear. An airline doesn't want its ad beside a crash report, a family brand doesn't want it on pornography, and nobody wants to fund terrorism or child abuse. The industry separates two layers: **brand safety**, a floor of content no advertiser should fund, and **brand suitability**, the band above the floor where each advertiser chooses what risk it accepts (news about a war, a film with violence, a podcast with profanity). The controls are lists (sites, apps, channels and keywords to block or allow), classifications (what a page, video or app is about, and how risky), and verification (an independent vendor measuring where the ads actually ran).

It is hard for reasons that have nothing to do with the code. Classifying content is error-prone and the error costs someone: a false block takes revenue from a legitimate publisher (news is the usual casualty), a false pass puts a brand beside something it pays to avoid. Classification has to be fast enough for the bid path but accurate enough for an advertiser's lawyers, and content changes after it is classified. And since 2024 the shared standards have become a legal question: the industry body that maintained the common framework shut down, and the FTC has ordered the largest agencies not to coordinate on brand-safety standards or to steer spend by viewpoint. A system now has to support each advertiser's own choices, recorded as that advertiser's, rather than one industry floor applied to everyone.

This chapter covers the floor and suitability tiers, GARM's rise and end, the FTC orders against the holding companies, the MRC's content-level verification guidelines, pre-bid and post-bid controls, the IAB Tech Lab Content Taxonomy, blocklists, inclusion lists and keyword blocking, and the contract clause that remedies a bad placement. It extends `properties`, `line_items` and `ad_events` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and `content_classifications` and the taxonomy tables from [Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies) (in Identity and Audiences). User-Generated Platforms owns labeling user content, the GARM category list in detail and demonetization from the creator's side ([Brand Safety and Suitability](/books/user-generated-platforms/ads-and-data-licensing#brand-safety-and-suitability), [Demonetization: The Creator Side](/books/user-generated-platforms/ads-and-data-licensing#demonetization-the-creator-side)); this chapter owns the frameworks, the verification vendors and the buy-side and sell-side controls. [Measurement Standards & the MRC](/books/advertising/measurement-standards-and-the-mrc), in Measurement, owns vendor accreditation.

## How the Platforms Do It

As of November 2026:

| Platform or vendor | Controls offered | Where they run | Notes |
| --- | --- | --- | --- |
| **Display & Video 360** (Google) | Inventory modes Maximum, Moderate and Limited; content category exclusions (profanity, sexualized content, violence, drugs, hurtful language); content theme exclusions (politics, religion, sensitive news, mature games); digital content labels; app and URL exclusions; advertiser-level keyword targeting, which also applies to programmatic guaranteed deals | At the advertiser level, applying to all its campaigns, insertion orders and line items (not editable below it), and pre-bid through third-party verification | Third-party pre-bid from Integral Ad Science, DoubleVerify and Scope3 (formerly Adloox); selected deals can bypass the advertiser-level settings, but Google's automatic protections still apply |
| **Integral Ad Science** | "Pre-bid filtering and post bid blocking"; "100+ industry-specific and topical segments for content avoidance"; Total Media Quality reporting with viewability and invalid traffic | Open web and direct buys, social platforms such as YouTube and Facebook, "40+ languages" | Vendor's own description |
| **IAB Tech Lab** | Content Taxonomy 3.1, the shared vocabulary for "contextual targeting and brand safety" | In bid requests (`cattax`, category IDs) and in vendor classifications | 3.0 (June 2022) expanded about 400 categories to more than 1,500 and is not backward compatible |
| **MRC** | Brand Safety Ad Verification Guidelines (September 2018), a supplement for content-level context and brand safety | Applies to verification vendors seeking accreditation | Requires disclosure of property-level versus content-level granularity and an "unknown" class buyers can avoid |
| **YouTube** | Inventory types Maximum, Moderate and Limited for advertisers; advertiser-friendly guidelines for creators | On the platform | UGP's [How Platforms Sell It](/books/user-generated-platforms/ads-and-data-licensing#how-platforms-sell-it) covers the tiers |

Every implementation separates the same four things: **the advertiser's policy** (what it wants to avoid, at what risk level), **the classification** of each property or piece of content (by a vendor or the platform, with a version and a date), **the enforcement point** (pre-bid, at serve, post-bid blocking, or reporting only), and **the evidence** (what verification measured afterward). Storing them as separate records is what lets an advertiser change its policy without reclassifying the web, a vendor update its classifier without touching anyone's policy, and a dispute about a placement be answered with what was known at the time.

## Safety, Suitability and the Floor

The vocabulary came from the 4A's and then GARM. The MRC's 2018 supplement describes the idea of a floor as "a minimum level of content established and maintained by industry groups that excludes certain baseline categories," offered "as a default control for platform monetization or as elected by advertisers," and cites the 4A's Advertising Assurance Brand Safety Floor Framework of September 2018, with "baseline definitions of a floor within 13 categories," rooted in what the supplement calls the industry's "dirty dozen" category list. GARM, launched by the World Federation of Advertisers in 2019 after the livestreamed Christchurch attack, built on it with a Brand Safety Floor and a suitability framework of high, medium and low risk tiers across categories such as adult content, arms, crime, death and military conflict, hate speech, obscenity, illegal drugs, spam, terrorism, debated social issues and, later, misinformation. UGP's [The Shared Framework](/books/user-generated-platforms/ads-and-data-licensing#the-shared-framework) lists the categories and tiers.

The split is still how vendors and platforms structure controls:

- **The floor** is content no advertiser should fund: what is illegal or near it (child sexual abuse material, terrorist promotion, piracy, malware). Platforms generally don't monetize it at all, and verification vendors block it by default. On a platform it is usually the monetization policy, not an advertiser setting.
- **Suitability** is risk above the floor, chosen per advertiser and often per campaign: a news publisher's war coverage is suitable for some brands and not others, and a horror film's trailer is suitable beside violent fiction. The control is a tier per category (avoid high risk, avoid medium and high, avoid all), plus explicit lists.

What changed after 2024 is who decides what is in the floor. The MRC supplement "strongly encourages and supports mechanisms and efforts to promote consistent Brand Safety definitions and minimum baselines such as that proposed by the 4A's Advertising Protection Bureau"; the FTC's 2026 complaint against three holding companies names exactly that coordination as the alleged violation. A system built today should therefore treat even the floor as a policy someone chose and is accountable for (the platform for its monetization policy, the advertiser for its avoidance settings), not as an industry constant baked into the code.

## GARM's End and the FTC Orders

**GARM.** The WFA discontinued GARM on August 9, 2024, saying "GARM will discontinue its activities" because recent allegations misrepresenting its purpose had drained its resources and finances. The allegations were X's antitrust suit, filed days earlier, claiming GARM's members had organized an illegal advertiser boycott. GARM had reported that ads appearing beside illegal or harmful content on social media fell from 6.1% in 2020 to 1.7% in 2023 (its own figures). As reported, a federal judge dismissed X's suit in 2026, finding X could not show harm under competition law, and X and the WFA announced a settlement on July 29, 2026: X dismissed its remaining claims and appeal, and the WFA agreed not to revive GARM or start a similar initiative. <!-- source-gap: adv-x-wfa-dismissal | secondary | the 2026 dismissal of X Corp v. WFA and the July 29, 2026 settlement terms | closes with: the N.D. Tex. order and the Fifth Circuit dismissal (No. 26-10394) opened directly | checked: 2026-11-22 -->

**Omnicom and Interpublic.** The FTC's consent order clearing Omnicom's acquisition of Interpublic, finalized on September 26, 2025, bars Omnicom from withholding ad dollars from media publishers because of their political or ideological viewpoints, except where an advertiser gives "express and individualized direction" to do so, and imposes a compliance monitor. The Commission added the monitor and clarified the scope after public comment; the vote was 2-0-1.

**WPP, Publicis and Dentsu.** On April 15, 2026, the FTC and eight states (Florida, Indiana, Iowa, Montana, Nebraska, Texas, Utah and West Virginia) took action in the Northern District of Texas against WPP, Publicis and Dentsu, alleging that from 2018 the agencies colluded through GARM and the 4A's Advertiser Protection Bureau to impose common brand-safety standards, including a "Brand Safety Floor" that treated sites with "misinformation" as below standard, and that NewsGuard and the Global Disinformation Index used that designation to promote demonetizing disfavored viewpoints. The court approved and finalized the three orders, which bar each agency from agreeing with others on common brand-safety standards or restricting advertising on biased, politically motivated criteria. The vote was 1-0-1. The orders' monitoring and duration terms aren't in the press release, and I haven't opened the orders themselves. <!-- source-gap: adv-ftc-agency-orders-terms | missing | the compliance, monitoring and duration terms of the April 2026 WPP, Publicis and Dentsu orders | closes with: the filed orders in the N.D. Tex. docket or on ftc.gov | checked: 2026-11-22 -->

What the orders mean for a system that sells or buys with brand-safety controls:

- **Every avoidance setting needs an owner and a reason.** "Express and individualized direction" from an advertiser is the line in the Omnicom order. A blocklist an agency applies across all its clients by default is the pattern the orders target; a blocklist an advertiser chose for its own campaigns, recorded with who chose it and when, is the pattern they permit. The record of who directed each exclusion is the evidence.
- **Shared lists become per-advertiser copies.** An agency or platform can still offer templates (a starter list, a vendor's segment), but an advertiser adopting one is an advertiser decision, recorded on the advertiser's profile, with the template and its version.
- **Viewpoint is not a category to infer silently.** Classifiers that label sites as "misinformation" or by political lean, applied by default to many advertisers' buys, are exactly what the FTC complaint describes. If a platform offers such a category at all, it should be opt-in per advertiser, disclosed, and logged.

## Content-Level Verification: The MRC Supplement

The MRC's Brand Safety Ad Verification Guidelines, a September 2018 supplement to its Conduct of Ad Verification guidelines, are what accredited verification vendors are audited against. The requirements that shape a system:

- **Property level versus content level.** Brand safety "historically" was decided at the property level (a whole site or app) with "ad alerting or blocking based on avoidance or target categories"; the supplement defines content-level measurement (the specific page, video, post) as a separate, higher grade, and requires vendors to "clearly disclose specific capabilities and limitations" so a property-level classification isn't sold as content-level. Avoidance and verification "at the property level with proper disclosure" is allowed, but it is distinguished from content-level accreditation.
- **Unknown is a class.** A vendor that can't measure some content "may list the property or portions of the property as uncategorized or unknown with clear disclosure ... to enable avoidance if a user so chooses"; properties with user-generated content may be "generically classified as such (and be distinguished as unknown with regard to Brand Safety)." Content that doesn't meet the vendor's minimum guardrails "must be classified as unknown or not yet classified and buyers should have the ability to prevent ad serving to unknown or unclassified content."
- **Freshness is part of the classification.** Because content changes, "the timing of the verification service and underlying data assumptions must be disclosed and ad verification services must have stated data refresh policies," including "maximum data life or 'time to live' policies" adapted to each platform. A classification has an expiry.
- **Minimum evidence before a verdict.** Vendors are "encouraged to establish minimum reporting thresholds (a required minimum number of data points or observations before reporting Context and Brand Safety determinations)."
- **DSPs are in scope where they shape the decision.** "In certain pre-bid situations, Demand Side Platforms (DSPs) may have a material impact on Context and Brand Safety data and determinations," and the data-quality guidance applies to them.
- **User-generated content pages differ in the contract too.** The IAB/4A's standard terms (below) carve out pages "that primarily consist of user-generated content" from the adjacency remedy.

## Pre-Bid, Post-Bid and Reporting

There are three places to enforce a brand-safety policy, and most buys use all three:

| Point | How it works | Strength | Weakness |
| --- | --- | --- | --- |
| **Pre-bid** | The DSP checks the request's domain, app, URL or content ID against lists and against a vendor's pre-bid segment (a classification cached or looked up in the bid path); unsafe requests get no bid | Nothing unsafe is bought; no money to recover | Only as good as the declared URL or app (spoofing defeats it), the classification's coverage, and the latency budget |
| **Post-bid blocking** | The bid wins, and the verification vendor's tag wrapped around the creative checks the actual page at render and, if unsafe, serves a blank or a house ad instead | Sees the real page, not the declared one | The impression was bought; the advertiser usually pays for it (vendors' terms vary) and the publisher sees a blank |
| **Reporting** | Post-serve measurement of where impressions ran, by category and risk tier, against the advertiser's policy | Evidence for make-goods, credits, list updates and agency reviews | Nothing is prevented; the remedy is contractual |

Pre-bid uses the bid request's declared signals: the site's domain and page URL, the app's bundle, the content object's categories (`content.cat` with `cattax` naming the taxonomy), and the seller's own category blocks in the other direction (`bcat` for advertiser categories the publisher blocks, `badv` for advertiser domains). Pre-bid brand safety is only as good as the signals' truth, which is why it depends on supply-chain authorization and invalid traffic detection: a spoofed domain carries the spoofed site's classification ([Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud)).

Post-bid blocking replaces the creative with something else after the impression was won. Its cost depends on the vendor's and the platform's terms, and the blocked impression is still a counted, billed impression to the exchange unless the contract says otherwise; buyers who block heavily post-bid pay for blanks. My default is pre-bid avoidance first, post-bid blocking only where the pre-bid signal is weak (open-web display on long-tail domains), and reporting everywhere.

On walled gardens the buyer can't run its own pre-bid or wrap a creative in a vendor's tag. The controls are the platform's own (inventory tiers, exclusions), and the evidence comes from vendors with platform integrations measuring after the fact. UGP's [How Platforms Sell It](/books/user-generated-platforms/ads-and-data-licensing#how-platforms-sell-it) covers that model from the platform's side.

## The Content Taxonomy

IAB Tech Lab's Content Taxonomy is the shared vocabulary for what content is about. Version 3.0 (June 2022) expanded the taxonomy from about 400 categories to more than 1,500 and was "non-backwards compatible" with 2.x; 3.1 is current, and Tech Lab describes it as used for "contextual targeting and brand safety." A bid request names the taxonomy it uses (`cattax`) and the category IDs, so a buyer can map a seller's categories to its own avoidance rules. [Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies), in Identity and Audiences, covers the taxonomy's structure, versions and crosswalks; this chapter uses it as the subject of avoidance.

Two facts about the taxonomy matter for brand safety. **Topic is not risk.** "News and Politics" or "Crime" says what the content is about, not whether it is graphic, glamorizing or educational, which is what suitability tiers are about; a suitability decision needs both a topic and a risk tier, and the taxonomy supplies only the first. **Versions don't line up.** Mapping a policy written against one version (or GARM's categories, or a vendor's) onto another is a crosswalk with "broader", "narrower" and "related" relations, not a rename; a policy should be stored against the version it was written for and evaluated through the crosswalk.

## Blocklists, Inclusion Lists and Keywords

Lists are the oldest control and still the most used:

- **Blocklists** (exclusion lists) name domains, apps, channels or URLs not to buy. They are cheap to check in the bid path and easy to explain. Their failure mode is growth: lists accumulate thousands of entries nobody reviews, and a list copied across advertisers turns one brand's choice into an industry-wide exclusion, the coordination the FTC orders target.
- **Inclusion lists** (allowlists) name the only places to buy. They give the most control and the least scale: the UK government's Reddit campaign described in UGP's [How Platforms Sell It](/books/user-generated-platforms/ads-and-data-licensing#how-platforms-sell-it) ran only on "a further list of pre-approved, brand-safe subreddits." A large inclusion list is effectively a private marketplace without the deal.
- **Keyword blocking** avoids pages whose URL, title or text contains listed terms. It is the bluntest control: a keyword list containing "shooting" blocks basketball coverage and a list containing "attack" blocks the sports pages and the medical ones. I could not find a primary-source measurement of how much news inventory keyword lists block, though the concern is widely reported. <!-- source-gap: adv-keyword-blocklist-news-impact | missing | how much legitimate news inventory keyword blocklists exclude | closes with: a published study by a verification vendor, publisher group or researcher with its method | checked: 2026-11-22 --> My rule: keywords only as a complement to category and risk-tier avoidance, never as the main control, and every keyword list reviewed on a schedule with its block volume reported.

Every list is a versioned object with an owner (an advertiser, an agency acting on an advertiser's direction, a platform's monetization policy), and every line item points at the lists it uses. When an advertiser changes a list, the change is effective from a time; impressions served before it were served under the old list, and a dispute is judged against what was in force.

## The Contract Remedy

Under the IAB/4A's Standard Terms and Conditions version 3.0, a publisher acknowledges that an advertiser may not want its ads "adjacent to content that promotes pornography, violence, or the use of firearms, contains obscene language, or falls within another category stated on the IO" (the "Editorial Adjacency Guidelines") and uses "commercially reasonable efforts" to comply on its own properties while keeping "editorial control." The remedy is narrow:

- The advertiser's "sole and exclusive remedy is to request in writing that Media Company remove the Ads and provide makegoods or, if no makegood can be agreed upon, issue a credit to Advertiser equal to the value of such Ads, or not bill Agency for such Ads."
- After notice, the publisher makes "commercially reasonable efforts to correct such violation within 24 hours."
- For network properties the publisher's only obligation is to obtain the same representations from network publishers and provide the remedy.
- For pages that "primarily consist of user-generated content" the obligation is only to keep ads away from content that violates the site's terms of use, and the remedy is a written complaint.

The remedy maps onto records the volume already has: a make-good is a `make_goods` row ([Pacing & Frequency Capping](/books/advertising/pacing-and-frequency), in Ad Serving and Creative) and a credit is an `invoice_lines` row. What a system adds is the evidence: which impressions ran beside which content, under which classification, at what time, so the "value of such Ads" can be computed from delivery rather than argued. The new IAB terms and how they handle adjacency are in [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms).

## How to Build It

Brand safety adds four records to the core model and the taxonomy tables: the advertiser's suitability policy as a versioned profile, lists and their entries, which lists each line item uses, and the daily verification outcome per line item and source. Classifications reuse `content_classifications` and `taxonomy_nodes` from [Targeting & Taxonomies](/books/advertising/targeting-and-taxonomies), with a risk tier and the framework version added.

```sql
CREATE TABLE suitability_profiles (        -- an advertiser's avoidance policy, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id       UUID NOT NULL REFERENCES advertisers (id),
  name                TEXT NOT NULL,
  version             INT NOT NULL,
  framework_ref       TEXT NOT NULL,       -- the vocabulary the rules are written in, e.g. 'iab-content-3.1'
  avoid               JSONB NOT NULL,      -- [{"node": "...", "max_risk": "low"}, ...]
  avoid_unknown       BOOLEAN NOT NULL DEFAULT FALSE,  -- MRC: buyers may avoid unclassified content
  avoid_ugc_generic   BOOLEAN NOT NULL DEFAULT FALSE,
  directed_by         TEXT NOT NULL,       -- the advertiser's approver: the "express direction"
  operator_org_id     UUID REFERENCES organizations (id),  -- the agency applying it, if any
  template_ref        TEXT,                -- a vendor or agency template it was adopted from
  effective           TSTZRANGE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (advertiser_id, name, version),
  EXCLUDE USING gist (advertiser_id WITH =, name WITH =, effective WITH &&)
);

CREATE TABLE site_lists (                  -- a block or inclusion list, with an owner
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_kind          TEXT NOT NULL CHECK (owner_kind IN ('advertiser', 'platform_policy',
                        'publisher')),
  advertiser_id       UUID REFERENCES advertisers (id),
  owner_org_id        UUID NOT NULL REFERENCES organizations (id),
  kind                TEXT NOT NULL CHECK (kind IN ('block', 'include')),
  subject_kind        TEXT NOT NULL CHECK (subject_kind IN ('domain', 'url', 'app_bundle',
                        'channel', 'keyword', 'advertiser_domain')),
  name                TEXT NOT NULL,
  version             INT NOT NULL DEFAULT 1,
  directed_by         TEXT NOT NULL,       -- who chose it, for the advertiser or the policy
  template_ref        TEXT,
  reviewed_at         TIMESTAMPTZ,         -- last review of its entries
  status              TEXT NOT NULL CHECK (status IN ('active', 'archived')),
  CHECK ((owner_kind = 'advertiser') = (advertiser_id IS NOT NULL)),
  UNIQUE (owner_org_id, name, version)
);

CREATE TABLE site_list_entries (
  site_list_id        UUID NOT NULL REFERENCES site_lists (id),
  entry               TEXT NOT NULL,       -- normalized domain, URL prefix, bundle, channel ID or term
  added_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by            TEXT NOT NULL,
  reason              TEXT,                -- an incident, a policy, a vendor flag
  PRIMARY KEY (site_list_id, entry)
);

CREATE TABLE line_item_site_lists (        -- which lists a line item enforces, and where
  line_item_id        UUID NOT NULL REFERENCES line_items (id),
  site_list_id        UUID NOT NULL REFERENCES site_lists (id),
  enforcement         TEXT NOT NULL CHECK (enforcement IN ('pre_bid', 'post_bid_block',
                        'report_only')),
  effective           TSTZRANGE NOT NULL,
  PRIMARY KEY (line_item_id, site_list_id, effective)
);

ALTER TABLE line_items ADD COLUMN suitability_profile_id UUID;
ALTER TABLE line_items ADD CONSTRAINT line_items_suitability_profile_fk
  FOREIGN KEY (suitability_profile_id) REFERENCES suitability_profiles (id) NOT VALID;

-- Risk on top of topic: the classification says what and how risky, under which framework.
ALTER TABLE content_classifications
  ADD COLUMN risk_tier TEXT,
  ADD COLUMN framework_ref TEXT,          -- the suitability framework the tier comes from
  ADD COLUMN granularity TEXT NOT NULL DEFAULT 'property';
ALTER TABLE content_classifications ADD CONSTRAINT content_classifications_risk_check
  CHECK (risk_tier IS NULL OR risk_tier IN ('floor', 'high', 'medium', 'low', 'unknown'))
  NOT VALID;
ALTER TABLE content_classifications ADD CONSTRAINT content_classifications_granularity_check
  CHECK (granularity IN ('property', 'content')) NOT VALID;

CREATE TABLE brand_safety_daily (          -- verification outcome per line item, day and source
  line_item_id        UUID NOT NULL REFERENCES line_items (id),
  day                 DATE NOT NULL,
  source_org_id       UUID NOT NULL REFERENCES organizations (id),  -- the verification vendor or platform
  granularity         TEXT NOT NULL CHECK (granularity IN ('property', 'content')),
  measured_impressions BIGINT NOT NULL DEFAULT 0,
  unknown_impressions BIGINT NOT NULL DEFAULT 0,   -- not classifiable; reported, not judged
  in_policy_impressions BIGINT NOT NULL DEFAULT 0,
  out_of_policy_impressions BIGINT NOT NULL DEFAULT 0,
  blocked_impressions BIGINT NOT NULL DEFAULT 0,   -- post-bid blocks: bought, replaced
  by_category         JSONB NOT NULL DEFAULT '{}', -- {"node": {"high": n, "medium": n}}
  suitability_profile_id UUID REFERENCES suitability_profiles (id),
  PRIMARY KEY (line_item_id, day, source_org_id),
  CHECK (in_policy_impressions + out_of_policy_impressions + unknown_impressions
         <= measured_impressions)
);

-- after backfilling profiles and tiers
ALTER TABLE line_items VALIDATE CONSTRAINT line_items_suitability_profile_fk;
ALTER TABLE content_classifications VALIDATE CONSTRAINT content_classifications_risk_check;
ALTER TABLE content_classifications VALIDATE CONSTRAINT content_classifications_granularity_check;
```

The pre-bid decision reads the line item's lists and profile and the freshest unexpired classification for the request's subject, and returns a decision with a reason. Unknown content follows the profile's `avoid_unknown`, as the MRC asks; an expired classification is treated as unknown:

```go tab="Go"
type Classification struct {
	Node      string
	Risk      string // floor, high, medium, low, unknown
	ExpiresAt time.Time
}

type Profile struct {
	MaxRisk      map[string]string // taxonomy node -> highest acceptable tier
	AvoidUnknown bool
}

var riskRank = map[string]int{"low": 1, "medium": 2, "high": 3, "floor": 4}

// Decide returns whether to bid and the reason, given the request's classifications.
// Blocklists and inclusion lists are checked before this, on the request's domain or bundle.
func Decide(p Profile, cs []Classification, now time.Time) (bool, string) {
	known := 0
	for _, c := range cs {
		if c.Risk == "unknown" || now.After(c.ExpiresAt) {
			continue
		}
		known++
		if c.Risk == "floor" {
			return false, "floor:" + c.Node
		}
		if limit, ok := p.MaxRisk[c.Node]; ok && riskRank[c.Risk] > riskRank[limit] {
			return false, "risk:" + c.Node + ":" + c.Risk
		}
	}
	if known == 0 && p.AvoidUnknown {
		return false, "unknown"
	}
	return true, ""
}
```

```rust tab="Rust"
use std::collections::HashMap;
use std::time::SystemTime;

pub struct Classification {
    pub node: String,
    pub risk: String, // floor, high, medium, low, unknown
    pub expires_at: SystemTime,
}

pub struct Profile {
    pub max_risk: HashMap<String, String>, // taxonomy node -> highest acceptable tier
    pub avoid_unknown: bool,
}

fn rank(risk: &str) -> u8 {
    match risk {
        "low" => 1,
        "medium" => 2,
        "high" => 3,
        "floor" => 4,
        _ => 0,
    }
}

/// Whether to bid, and the reason when not. Lists are checked before this.
pub fn decide(p: &Profile, cs: &[Classification], now: SystemTime) -> (bool, String) {
    let mut known = 0;
    for c in cs {
        if c.risk == "unknown" || now > c.expires_at {
            continue;
        }
        known += 1;
        if c.risk == "floor" {
            return (false, format!("floor:{}", c.node));
        }
        if let Some(limit) = p.max_risk.get(&c.node) {
            if rank(&c.risk) > rank(limit) {
                return (false, format!("risk:{}:{}", c.node, c.risk));
            }
        }
    }
    if known == 0 && p.avoid_unknown {
        return (false, "unknown".to_string());
    }
    (true, String::new())
}
```

Design notes:

- **Policy, classification, enforcement and evidence are separate rows.** The profile is the advertiser's, the classification the vendor's or platform's, the line item's list links say where each is enforced, and `brand_safety_daily` records what verification measured. None overwrites another.
- **Direction is recorded on the policy.** `directed_by` on profiles and lists is the advertiser's approval, the evidence the FTC orders' "express and individualized direction" exception turns on; a template adopted from an agency or vendor keeps its `template_ref` but becomes the advertiser's list.
- **Classifications expire.** The MRC asks vendors for stated refresh and time-to-live policies; `content_classifications.expires_at` (from Targeting & Taxonomies) makes an expired verdict unknown in the bid path, not stale-but-trusted.
- **Granularity is labeled.** Property-level and content-level classifications and outcomes are stored as such, because the MRC treats them as different grades and buyers pay differently for them.
- **Unknown is counted, not hidden.** `unknown_impressions` sits beside in-policy and out-of-policy, so a report can't present unclassifiable inventory as safe.
- **Post-bid blocks are bought impressions.** `blocked_impressions` is reported separately because, unlike pre-bid no-bids, they were won and usually paid for; their cost is a number the buyer should see.
- **Keyword lists are lists with a review clock.** `site_lists.reviewed_at` and the block volume from reporting let a scheduled review find keywords that block far more than intended.

## Auditing

- **Every policy and list as it stood at each impression,** with who directed it and when it changed, so a placement complaint, a make-good claim or a regulator's question about viewpoint-based exclusion is judged against what was in force.
- **Every pre-bid no-bid with its reason,** including the classification, its source, version and age, kept for the dispute window.
- **Every classification with its source, granularity, framework version and expiry,** so a vendor's restatement or a publisher's challenge to a label can be traced.
- **Verification outcomes per line item, day and source,** with unknown and blocked impressions shown, and the profile they were measured against.
- **Adjacency remedies,** make-goods and credits for placements outside the IO's adjacency guidelines, tied to the impressions and the evidence.

## What This Means for the System You Build

- **Keep the advertiser's policy, the content's classification, the enforcement point and the verification evidence as separate records.**
- **Record who directed every exclusion,** and make shared templates per-advertiser copies, so avoidance is each advertiser's choice and not an industry-wide default.
- **Store suitability as topic plus risk tier,** against a named framework version, and evaluate policies through taxonomy crosswalks rather than renames.
- **Treat unknown and expired classifications as their own state,** let advertisers avoid them, and count them in reports.
- **Enforce pre-bid first,** use post-bid blocking only where pre-bid signals are weak, and report the cost of blocked impressions.
- **Use keywords sparingly and review them,** because they block legitimate news and sports along with what they target.
- **Tie adjacency remedies to delivery,** so a make-good or credit for a bad placement is computed from the impressions that ran there.

## References

**Specifications**

- [MRC: Brand Safety Ad Verification Guidelines, Enhanced Content Level Context and Brand Safety (September 2018)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC%20Ad%20Verification%20Supplement-%20Enhanced%20Content%20Level%20Context%20and%20Brand%20Safety%20%28Final%29.pdf), property and content level, unknown and uncategorized content, refresh and time-to-live, minimum thresholds, DSPs in pre-bid, the floor and the 4A's framework of September 2018
- [MRC: Standards and guidelines](https://mediaratingcouncil.org/standards-and-guidelines), the supplement's title and issue date
- [IAB Tech Lab: Content Taxonomy](https://iabtechlab.com/standards/content-taxonomy/), version 3.1 as current, 3.0's expansion from about 400 to more than 1,500 categories and its break with 2.x, use for contextual targeting and brand safety
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), cattax, content categories, bcat and badv
- [IAB/4A's: Standard Terms and Conditions for Internet Advertising, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), the Editorial Adjacency Guidelines, the make-good or credit remedy, the 24-hour correction and the user-generated content carve-out

**Regulation**

- [FTC: Final consent order preventing coordination in global advertising (September 26, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-alters-final-consent-order-response-public-comments-preventing-coordination-global-advertising), the Omnicom bar on viewpoint-based withholding, the express and individualized direction exception, the monitor and the vote
- [FTC: Action to restore competition in the digital advertising ecosystem (April 15, 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/04/ftc-takes-action-restore-competition-digital-advertising-ecosystem), allegations against WPP, Publicis and Dentsu, GARM and the APB, the Brand Safety Floor and misinformation, the eight states, the finalized orders and the vote

**Reference**

- [WFA: About GARM](https://wfanet.org/leadership/garm/about-garm), GARM's 2019 launch, the Brand Safety Floor and Adjacency Standards Framework, the August 9, 2024 discontinuation and its self-reported 6.1% to 1.7% figures
- [Engadget: X and an advertising trade group settle a legal dispute over an alleged boycott (July 2026)](https://www.engadget.com/2226171/x-and-an-advertising-trade-group-settle-a-legal-dispute-over-an-alleged-boycott), the July 29, 2026 settlement, the WFA's agreement not to revive GARM, the earlier dismissal (secondary)

**In practice**

- [Display & Video 360 Help: Brand suitability](https://support.google.com/displayvideo/answer/3032915?hl=en), advertiser-level controls, inventory modes, content categories, content themes, app and URL exclusions, keyword targeting that applies to programmatic guaranteed deals, third-party pre-bid vendors, deal bypass
- [Integral Ad Science: Brand safety and suitability](https://integralads.com/solutions/brand-safety-suitability/), pre-bid filtering and post-bid blocking, more than 100 avoidance segments, 40+ languages, Total Media Quality
