+++
title = "Ad Review, Policies & Malvertising"
nav_title = "Ad Review & Malvertising"
description = "Ad policy systems, advertiser verification and strikes, scams and impersonation, malvertising and redirect chains, transparency centers and the law."
category = "Advertising Industry"
order = 2942
part = "Fraud and Brand Safety"
tags = ["advertising", "ad-review", "ad-policy", "malvertising", "scams", "trust-and-safety", "data-model"]
+++

Every ad platform runs a moderation system for ads. Before an ad serves, something decides whether it is allowed: whether the product may be advertised at all, whether the claims and the landing page comply, whether this advertiser may run this kind of ad in this country, and whether the creative or its destination will hurt the person who sees it. After it serves, the same system keeps checking, because advertisers change landing pages, third-party tags change what they return, and some advertisers are criminals who designed the ad to pass review and then do something else.

It is hard because the adversary is paying. An ordinary content moderation system sees users who mostly aren't trying to defeat it; an ad review system sees scammers with stolen cards, compromised accounts and budgets for testing which variations get through. They cloak (show the reviewer a clean page and the user a scam), rotate domains, impersonate brands and public figures, and buy search ads on a bank's name. Malvertising goes further: the ad itself, or the chain of redirects behind it, delivers malware or a phishing page, sometimes on reputable publishers' sites through a legitimate exchange. At the same time, a false rejection costs a legitimate advertiser money and a publisher revenue, and regulators increasingly ask platforms to prove what they checked.

This chapter covers ad policy systems (prohibited and restricted categories, policy as data), review in the pipeline, advertiser verification and account-level enforcement, scams and impersonation, cloaking, malvertising and redirect chains, transparency centers and the laws that ask platforms to act (the FTC's impersonation rule and its 2026 advance notice on platforms, the UK Online Safety Act's fraudulent advertising duty). It extends `advertisers` and `creatives` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and `creative_reviews` from [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco) (in Ad Serving and Creative), which owns the review queue as a workflow. [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms), in Walled Gardens, owns onboarding and the advertiser verification state machine (`advertiser_verifications`); [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads), in Privacy and Law, owns the DSA's ad repositories and political ad rules; [Advertising Content Law](/books/advertising/advertising-content-law) owns the substantive law of claims. User-Generated Platforms owns moderating promoted posts and financial-advertiser verification against regulators' registers ([Moderating the Ads](/books/user-generated-platforms/ads-and-data-licensing#moderating-the-ads), [Verifying Financial Advertisers](/books/user-generated-platforms/crypto-investment-scams#verifying-financial-advertisers)). The case, decision, notice and appeal pattern is the playbook's [Trust & Safety](/docs/building-blocks/trust-and-safety).

## How the Platforms Do It

As of November 2026:

| Platform | Review before serving | After serving | Account-level enforcement | Transparency |
| --- | --- | --- | --- | --- |
| **Google Ads** | Automated and human review of ads and assets; Google says it caught "over 99% of policy-violating ads before they ever served" in 2025 | Re-review when an ad, its destination or its account is flagged | A warning, then strikes with 3-day and 7-day holds, then suspension, for a list of policies; immediate suspension for egregious ones such as circumventing systems | Advertiser verification with an ad disclosure of the advertiser's name and location; the Ads Transparency Center |
| **Meta** | Review "starts automatically before ads begin running," mostly automated with manual review in some cases, of images, video, text, targeting and the landing page; "typically completed within 24 hours" | "Ads remain subject to review and re-review at all times" | Advertiser accounts that don't follow the Advertising Standards may be restricted from advertising | The Ad Library |
| **Exchanges and SSPs** | Creative scanning of bid creatives (malware, redirects, prohibited content, misdeclared categories), with pending and disapproved states signaled as loss reasons | Rescanning; publisher-side blocks | Blocking buyer seats and advertiser domains | Publisher-facing ad review tools |

Google's 2025 Ads Safety Report counts more than 8.3 billion ads blocked or removed, 24.9 million accounts suspended, and 602 million ads and 4 million accounts "associated with scams" in 2025. Those numbers are the scale of the problem on one platform, and they explain the architecture: review has to be mostly automated, decisions have to be made about accounts and not only ads, and the signals that matter most (who the advertiser is, how it pays, what its landing page does) are not in the creative.

## Policy as Data

Ad policies have the same shape across platforms. Meta's Advertising Standards group them as unacceptable content (child exploitation, dangerous organizations, hateful conduct, locally illegal content and others), prohibited commercial practices (content "that may deceive or mislead people"; its principles bar "deceptive or misleading practices, including those meant to scam people"), restricted goods and services (alcohol, dating, drugs and pharmaceuticals, financial and insurance products, cryptocurrency, gambling, tobacco, weapons), objectionable content and intellectual property. Google's policies have prohibited content, prohibited practices, restricted content and features, and editorial and technical requirements; its "Abusing the ad network" policy covers malicious software, compromised sites, unwanted software, unfair advantage, "Evasive ad content" ("Manipulation of ad components like text, image, videos, domain, or subdomains in an attempt to bypass detection or enforcement action") and circumventing systems itself.

A policy system needs four things per policy, and they belong in data rather than in classifier code:

- **What it covers:** the category, the prohibited or restricted behavior, and examples.
- **Where it applies:** countries, platforms, placements and audiences (restricted categories often allow ads to adults in some countries only).
- **What is required to advertise in it:** nothing (prohibited means never), a certification or license (gambling, pharmaceuticals, financial services in many countries), or advertiser verification.
- **What a violation costs:** a disapproval, a limited approval, a strike, or immediate suspension.

Versions matter because policies change and decisions are judged against the policy in force. A disapproval under last year's rule, a strike that expired, an appeal decided under a clarified rule: each needs the version. [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms) covers category authorization (licenses and certifications) as part of onboarding; this chapter keeps the policy catalog those authorizations point to.

## Review in the Pipeline

Review is a set of checks at different points, each producing a decision with its own reviewer:

1. **At submission.** Text, images and video are classified against policy; the landing page is crawled; the advertiser's account signals (age, verification, payment history, prior violations) are scored. Most decisions are automated; ambiguous and high-risk ones go to human review. Google reviews new and edited ads with statuses Under review, Eligible, Eligible (Limited) and Disapproved, and most within one business day ([Creative Production, Review & DCO](/books/advertising/creative-production-and-dco)).
2. **At edit.** Any change to the ad, its assets or its destination restarts review. A dynamic creative's template and feed are reviewed as a template, and new combinations are sampled.
3. **After serving.** Landing pages are recrawled on a schedule and on signals (user reports, a spike in complaints, a domain newly flagged by threat intelligence). Meta's rule that ads "remain subject to review and re-review at all times" is universal.
4. **At other hops.** An exchange scans creatives in bids it hasn't seen; a publisher's ad quality tools block categories and creatives; a verification vendor scans creatives for malware. Each is a separate decision by a separate reviewer: the platform's approval doesn't bind the exchange, and the publisher's block doesn't change the platform's status.

The rules that hold across them are the playbook's ([Automated Detection, Human Review](/docs/building-blocks/trust-and-safety#automated-detection-human-review), [Notices and Statements of Reasons](/docs/building-blocks/trust-and-safety#notices-and-statements-of-reasons), [Appeals](/docs/building-blocks/trust-and-safety#appeals)): every decision records the policy and version, the reviewer (a model version or a person), the evidence, and the notice sent; every disapproval can be appealed; an appeal is decided by a different reviewer than the original. Two ad-specific rules sit on top:

- **The decision is about a version of the creative and a state of the destination.** A landing page approved on Monday is a different page on Friday. The record keeps the crawl that was reviewed (the final URL, the redirect chain, a content hash), so a later violation can be shown to be a change rather than a review error.
- **Account context is part of the decision.** The same ad text from a ten-year-old verified account and a two-day-old account paying with a new card is not the same risk. Review reads the account's risk score and verification state, and an account-level action (a hold, a suspension) overrides every ad-level approval.

## Advertiser Verification and Account Enforcement

**Verification.** Google's advertiser verification program says "all advertisers will eventually be required to complete advertiser verification," with accounts selected earlier for signals such as suspicious behavior, financial services ads, brand-related queries or features often misused. It verifies identity or business operations, some accounts must submit documents, and the deadline comes in an in-account notice or email. Until verification completes, "some of your ads may be restricted," and Google may pause the account. Verified information drives an ad disclosure with "your name or organization's name and location," and ad creatives and some organization information appear in the Ads Transparency Center. [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms) covers the verification state machine and when spend may run before verification completes.

**Strikes.** Google's strike system applies to a list of policies (among them enabling dishonest behavior, unapproved substances, weapons, tobacco, clickbait, misleading ad design, credit repair, binary options and personal loans). The first violation is "only a warning"; the first strike puts the account on a 3-day hold in which ads can't run; a second strike for the same policy within 90 days of the first is a 7-day hold and the final notice; a third within 90 days of the second suspends the account. A successful appeal removes the strike and lifts the hold immediately; for suspensions, Google says it reinstates "only ... under compelling circumstances." Egregious policies (malicious software and circumventing systems among them) skip the ladder: suspension "occurs upon detection and without prior warning."

Meta's published standards say only that it "may restrict advertiser accounts that don't follow our Advertising Standards." The general pattern is the playbook's [Penalties and Escalation Ladders](/docs/building-blocks/trust-and-safety#penalties-and-escalation-ladders): penalties attach to the account, count per policy within a window, escalate, and have explicit exceptions for conduct too serious for a ladder.

**Linked accounts.** A suspended advertiser opens a new account. Platforms link accounts by payment instrument, verified identity, domain, device and network signals, and apply a suspension to the cluster. The link is itself a decision with evidence and an appeal, because a shared agency payment method or a shared office network can link innocent accounts.

## Scams and Impersonation

The fastest-growing category of bad ads is impersonation: ads that pretend to be a bank, a software vendor, a government agency, a celebrity endorsing an investment. The FBI's Internet Crime Complaint Center warned in December 2022 that criminals buy search ads "using a domain that is similar to an actual business or service," leading to near-identical copies of real websites, offering malware disguised as the real software, and impersonating financial sites, "particularly cryptocurrency exchange platforms," to capture credentials. Its advice to users (type the address rather than search, check the URL) is advice about a failure of ad review.

The defenses that work across platforms:

- **Brand and trademark protection.** A registry of protected brands and their official domains; ads using a protected brand's name or likeness with a destination outside its domains go to review or are blocked. Search platforms already maintain trademark policies; impersonation adds the domain check.
- **Destination verification.** The ad's display URL, its final URL and the actual page after redirects must agree, and a newly registered or lookalike domain is a risk signal.
- **Public figure matching.** Celebrity-bait investment ads use real people's faces and names. UGP's [Impersonation](/books/user-generated-platforms/crypto-investment-scams#impersonation) covers enrollment and face matching from the platform side.
- **Verification for sensitive categories.** Financial services, software downloads, government services and technical support are categories where platforms increasingly require verification before ads run.

**The law.** The FTC's Rule on Impersonation of Government and Businesses (16 CFR Part 461) took effect on April 1, 2024 and lets the FTC seek money for consumers and civil penalties from impersonators. A proposed extension to impersonation of individuals (a 2024 supplemental notice, with an informal hearing in January 2025) shows no final action on the FTC's rule page as of November 2026. On September 24, 2026, the Commission voted 2-0 to publish an advance notice of proposed rulemaking asking whether to update the rule to address platforms' role in impersonation scams: whether platforms should vet advertisers before their ads run, monitor posted ads, investigate suspected impersonation ads, take down confirmed scam ads and act against offending advertisers. It is the earliest stage of rulemaking and imposes no obligation, but the list reads like an ad review system's requirements. In the UK, section 38 of the Online Safety Act 2023 requires Category 1 services to use "proportionate systems and processes designed to" prevent people "encountering content consisting of fraudulent advertisements," "minimise the length of time for which any such content is present," and "swiftly take down such content" once aware; section 39 sets the same three duties for Category 2A search services, plus a public statement on any proactive technology used. Ofcom consulted on draft fraudulent advertising codes of practice in 2026, and I could not open Ofcom's consultation pages to confirm the measures or the timetable for final codes. <!-- source-gap: adv-ofcom-fraud-ad-codes | status | the Ofcom draft fraudulent advertising codes (published July 2026, consultation closed October 2026) and when final codes take effect | closes with: Ofcom's consultation page or statement opened directly (ofcom.org.uk returned 403) | checked: 2026-11-22 -->

For a system the law points the same way as the risk: verify who advertisers are, review before serving, keep monitoring, act on reports quickly, and keep the records that show each of those happened.

## Cloaking and Evasion

Cloaking is showing a reviewer one thing and a user another. The usual techniques: serving the clean page to crawler IP ranges and user agents and the scam page to everyone else; geofencing (the scam only appears in the target country); time-based switching (clean during review, scam after approval); fingerprint checks for automation; and redirect chains where an intermediate hop decides where to send each visitor. Google treats it under evasive ad content and circumventing systems; circumventing systems is a suspension-on-detection policy.

The countermeasures are a crawler that doesn't look like a crawler and a comparison:

- **Crawl from many vantage points**: residential and mobile networks, the ad's target countries, real browser builds, at the times the ad serves, not only once at submission.
- **Record the full redirect chain** (every hop's URL, status and timing) and the final page's content hash and a rendering.
- **Compare across crawls.** A destination that returns different final pages to different vantage points, or different content after approval, is cloaking until shown otherwise.
- **Compare with what users report.** A user report describing a page the reviewer never saw is a cloaking signal, and the report's context (country, device, time) tells the crawler where to look.

## Malvertising

Malvertising is malware or phishing delivered through ads. Two shapes recur:

- **Malicious destinations.** The ad itself is ordinary, and the landing page or download is the payload: the IC3's fake software sites, phishing pages for banks and exchanges.
- **Malicious creatives and redirect chains.** The creative's code, or a tag in the chain that serves it, redirects the user or the page. Microsoft described a campaign it detected in December 2024 that affected "nearly one million devices globally": illegal streaming sites embedded malvertising redirectors in iframes inside movie frames, which sent traffic through one or two more redirectors to an intermediary site (a malware or tech support scam page) and then to payloads hosted mostly on GitHub, and also on Discord and Dropbox, in a chain of four to five layers.

The second shape is the ad tech problem. A third-party tag can serve a clean creative to the exchange's scanner and a malicious one later, or only to some users; a reseller several hops down the chain can inject the redirect. The defenses are layered across the chain:

- **At the buying platform:** review the creative and landing page, and refuse third-party tags from servers that aren't on an approved list.
- **At the exchange:** scan every new creative, rescan on a schedule and on reports, and block the buyer seat or advertiser domain that served a malicious one. An exchange's creative statuses (pending, approved, disapproved) and loss reasons are what the DSP sees; [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges), in Programmatic, covers them.
- **At the publisher:** render third-party ads in cross-origin, sandboxed iframes that can't navigate the top-level page without a user gesture, the default in [Ad Tags, Rendering & Page Performance](/books/advertising/ad-tags-and-rendering), in Ad Serving and Creative. A sandbox turns a forced redirect into a blocked one.
- **At the click endpoint:** redirect only to the landing URL that was signed at serve time, never to a URL in an unsigned parameter, so the platform's own click tracker can't become an open redirect ([Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks)).

When malvertising is found, the response is an incident: stop the creative everywhere it runs (across exchanges, which means notifying them), find every impression it served from the event log, identify the advertiser, account and payment method and act on all linked accounts, and preserve the scans and chains as evidence. The impression log is what tells a publisher which of its pages served the payload and when.

## Transparency Centers

Platforms publish what ran: Google's Ads Transparency Center shows ads from verified advertisers, Meta's Ad Library shows ads running across its apps, and very large online platforms under the EU's Digital Services Act must keep searchable ad repositories ([DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads) covers Article 39). For the review system the consequence is that a decision is public evidence: an ad approved and shown in the repository is the platform's statement that it passed review. The repository is a query over the review records and the creatives as served, so both must be kept for the repository's retention period, with the advertiser's verified name, the version that ran and the dates it served.

## How to Build It

The core `creatives.review_status` is a summary; [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco)'s `creative_reviews` holds each reviewer's decision on each version, with `reasons` as codes. This chapter adds the policy catalog those codes point to, the join from a decision to the policies it found, account-level enforcement with strikes and holds, and the scans (creative markup and landing page crawls) that evidence each decision.

```sql
CREATE TABLE ad_policies (                 -- the policy catalog, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  platform_org_id     UUID NOT NULL REFERENCES organizations (id),
  code                TEXT NOT NULL,       -- 'misleading_ad_design', 'unapproved_substances'
  version             INT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('prohibited_content', 'prohibited_practice',
                        'restricted', 'editorial', 'technical')),
  scope               JSONB NOT NULL DEFAULT '{}',  -- countries, placements, audiences where it applies
  requires            TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'advertiser_verification','license'}
  enforcement         TEXT NOT NULL CHECK (enforcement IN ('disapprove', 'limit', 'strike',
                        'suspend_on_detection')),
  effective           TSTZRANGE NOT NULL,
  text_ref            TEXT NOT NULL,       -- the published policy page and its revision
  UNIQUE (platform_org_id, code, version),
  EXCLUDE USING gist (platform_org_id WITH =, code WITH =, effective WITH &&)
);

CREATE TABLE creative_review_violations (  -- which policies a review decision found
  creative_review_id  UUID NOT NULL REFERENCES creative_reviews (id),
  ad_policy_id        UUID NOT NULL REFERENCES ad_policies (id),
  evidence            JSONB NOT NULL DEFAULT '{}',  -- the asset, text span, frame or page section
  PRIMARY KEY (creative_review_id, ad_policy_id)
);

CREATE TABLE ad_scans (                    -- a scan of a creative's markup or a crawl of its destination
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  creative_version_id UUID NOT NULL REFERENCES creative_versions (id),
  kind                TEXT NOT NULL CHECK (kind IN ('markup', 'landing_page', 'download')),
  vantage             JSONB NOT NULL,      -- country, network type, device and browser build
  scanned_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  redirect_chain      JSONB NOT NULL DEFAULT '[]',  -- [{"url": ..., "status": 302, "ms": 40}, ...]
  final_url           TEXT,
  content_sha256      BYTEA,               -- hash of the final rendered page or payload
  rendering_ref       TEXT,                -- stored screenshot or archive
  verdict             TEXT NOT NULL CHECK (verdict IN ('clean', 'malicious', 'phishing',
                        'unwanted_software', 'cloaking_suspected', 'unreachable', 'error')),
  scanner_version     TEXT NOT NULL
);
CREATE INDEX ad_scans_version_idx ON ad_scans (creative_version_id, scanned_at DESC);

CREATE TABLE policy_enforcements (         -- account-level actions: warnings, strikes, holds, suspensions
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id       UUID NOT NULL REFERENCES advertisers (id),
  ad_account_id       UUID REFERENCES ad_accounts (id),  -- null: every account of the advertiser
  ad_policy_id        UUID REFERENCES ad_policies (id),  -- null: linked-account or fraud action
  action              TEXT NOT NULL CHECK (action IN ('warning', 'strike', 'hold', 'suspension',
                        'restriction', 'reinstatement')),
  strike_number       SMALLINT CHECK (strike_number BETWEEN 1 AND 3),
  in_force            TSTZRANGE NOT NULL,  -- a hold's days; open-ended for a suspension
  cause_review_id     UUID REFERENCES creative_reviews (id),
  linked_from_id      UUID REFERENCES policy_enforcements (id),  -- a cluster action's origin
  decided_by          TEXT NOT NULL,       -- typed actor: model version or reviewer
  notice_sent_at      TIMESTAMPTZ,
  appeal_status       TEXT CHECK (appeal_status IN ('none', 'pending', 'upheld', 'overturned')),
  supersedes_id       UUID REFERENCES policy_enforcements (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((action = 'strike') = (strike_number IS NOT NULL))
);
CREATE INDEX policy_enforcements_advertiser_idx
  ON policy_enforcements (advertiser_id, ad_policy_id, created_at DESC);

ALTER TABLE creative_reviews ADD COLUMN ad_scan_id UUID;  -- the scan this decision read
ALTER TABLE creative_reviews ADD CONSTRAINT creative_reviews_ad_scan_fk
  FOREIGN KEY (ad_scan_id) REFERENCES ad_scans (id) NOT VALID;

ALTER TABLE advertisers ADD COLUMN serving_state TEXT NOT NULL DEFAULT 'eligible';
ALTER TABLE advertisers ADD CONSTRAINT advertisers_serving_state_check
  CHECK (serving_state IN ('eligible', 'restricted', 'on_hold', 'suspended')) NOT VALID;

-- after backfilling
ALTER TABLE creative_reviews VALIDATE CONSTRAINT creative_reviews_ad_scan_fk;
ALTER TABLE advertisers VALIDATE CONSTRAINT advertisers_serving_state_check;
```

`advertisers.serving_state` is a cache, recomputed from the enforcements in force, which is what the serving path reads; the history is in `policy_enforcements`. The strike ladder is a function of that history: given a new violation of a policy that uses strikes, the next action depends on the prior warning and on strikes for the same policy within the window. The sketch below follows Google's published ladder (warning, 3-day hold, 7-day hold, suspension, each repeat within 90 days of the previous strike); the window and holds come from the policy row, not constants:

```go tab="Go"
type Enforcement struct {
	Action       string // warning, strike
	StrikeNumber int
	At           time.Time
	Overturned   bool
}

type Ladder struct {
	Window time.Duration   // e.g. 90 days between strikes
	Holds  []time.Duration // hold length per strike: 3 days, 7 days; the last strike suspends
}

// Next decides the action for a new violation of one policy, given that policy's history.
func (l Ladder) Next(history []Enforcement, now time.Time) (action string, strike int, hold time.Duration) {
	warned := false
	var last *Enforcement
	for i := range history {
		e := &history[i]
		if e.Overturned {
			continue
		}
		if e.Action == "warning" {
			warned = true
		}
		if e.Action == "strike" && (last == nil || e.At.After(last.At)) {
			last = e
		}
	}
	if !warned && last == nil {
		return "warning", 0, 0
	}
	n := 1
	if last != nil && now.Sub(last.At) <= l.Window {
		n = last.StrikeNumber + 1
	}
	if n > len(l.Holds) {
		return "suspension", n, 0
	}
	return "strike", n, l.Holds[n-1]
}
```

```rust tab="Rust"
use std::time::{Duration, SystemTime};

pub struct Enforcement {
    pub action: &'static str, // "warning" or "strike"
    pub strike_number: usize,
    pub at: SystemTime,
    pub overturned: bool,
}

pub struct Ladder {
    pub window: Duration,     // e.g. 90 days between strikes
    pub holds: Vec<Duration>, // hold per strike; past the last, suspend
}

impl Ladder {
    /// The action for a new violation of one policy, given that policy's history.
    pub fn next(&self, history: &[Enforcement], now: SystemTime) -> (&'static str, usize, Duration) {
        let live = history.iter().filter(|e| !e.overturned);
        let warned = live.clone().any(|e| e.action == "warning");
        let last = live.filter(|e| e.action == "strike").max_by_key(|e| e.at);
        if !warned && last.is_none() {
            return ("warning", 0, Duration::ZERO);
        }
        let n = match last {
            Some(e) if now.duration_since(e.at).unwrap_or_default() <= self.window => e.strike_number + 1,
            _ => 1,
        };
        if n > self.holds.len() {
            return ("suspension", n, Duration::ZERO);
        }
        ("strike", n, self.holds[n - 1])
    }
}
```

With `Holds` of 3 and 7 days and a 90-day window: a first violation returns a warning; the next a first strike with a 3-day hold; another within 90 days a second strike with a 7-day hold; another within 90 days of that, a suspension. An overturned strike is skipped, which is how a successful appeal "removes" it without deleting the record.

Design notes:

- **Decisions point at policies by version.** `creative_review_violations` turns the review's reason codes into rows that can be counted per policy, appealed per policy and fed to the strike ladder, and the policy's `effective` range shows which text applied.
- **Every decision points at its evidence.** A review reads a scan; a scan stores the chain, the final URL, a hash and a rendering. A later finding that the destination changed is a new scan with a different hash, not a contradiction of the old review.
- **Scans come from many vantage points.** `vantage` records where each crawl ran from; cloaking is detected as disagreement between scans of the same version, and a single clean scan is weak evidence.
- **Enforcement is append-only and superseded, not edited.** Appeals and reinstatements are new rows that supersede; the serving state is recomputed from what is in force ([Auditing Moderation Decisions](/docs/building-blocks/trust-and-safety#auditing-moderation-decisions)).
- **Account actions override ad approvals.** The serving path checks the advertiser's serving state before any creative's review status; a hold stops every approved ad without touching their reviews.
- **Linked-account actions carry their link.** `linked_from_id` records which enforcement a cluster action came from, so an appeal by an innocent linked account can be decided on the link's evidence.
- **Malvertising incidents start from the event log.** Because `ad_events` carry the creative and ad unit, "every impression this creative version served, where and when" is one query, which is what the publishers and exchanges affected need.

## Auditing

- **Every review decision with its policy versions, reviewer, evidence and notice,** and every appeal and its outcome, for regulators asking what a platform checked (the FTC's 2026 advance notice and the UK's fraudulent advertising duty both ask exactly this) and for advertisers disputing a rejection.
- **Every scan of every version,** with vantage, chain and hash, kept for the life of the creative plus the dispute and repository retention periods.
- **Every account action,** with the policy, the strike number, the hold period, the linked accounts and the appeal, so a suspension can be justified and a reinstatement traced.
- **Time to action on reports and incidents,** from a user report or threat signal to takedown, because "minimise the length of time" is a measurable duty under the Online Safety Act.
- **What ran,** each creative version as served with its advertiser's verified identity and dates, for transparency centers and repositories.

## What This Means for the System You Build

- **Keep the policy catalog as versioned data** with scope, requirements and enforcement level, and link every decision to the policies and versions it applied.
- **Review the advertiser, not only the ad:** verification, payment history and linked accounts are part of every decision, and account actions override ad approvals.
- **Crawl destinations from many vantage points and keep the chain,** because cloaking shows the reviewer a different page than the user.
- **Treat any change to a creative or its destination as a new review,** and recrawl on a schedule and on reports.
- **Sandbox third-party ads and sign landing URLs,** so a malicious creative can't redirect the page and the click tracker can't be an open redirect.
- **Run malvertising as an incident** from the event log: stop the creative everywhere, find every impression, act on the account cluster, keep the evidence.
- **Make strikes, holds and suspensions a computed ladder over an append-only history,** with appeals that supersede rather than delete.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 3.0, List: Loss Reason Codes](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb/master/OpenRTB%20v3.0%20FINAL.md), creative filtered codes 201 (pending processing by exchange) and 202 (disapproved by exchange), the list OpenRTB 2.x loss notices refer to

**Regulation**

- [FTC: Impersonation of Government and Businesses Rule](https://www.ftc.gov/legal-library/browse/rules/impersonation-government-businesses-rule), 16 CFR Part 461, effective April 1, 2024, the pending extension to individuals and its January 2025 hearing, and the 2026 notice on platforms
- [FTC: Impersonation rule goes into effect (April 1, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/04/ftc-announces-impersonation-rule-goes-effect-today), money back for consumers and civil penalties, and the supplemental notice on impersonating individuals
- [FTC: Public comment on whether to update the impersonation rule to address platforms' role (September 24, 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/09/ftc-seeks-public-comment-whether-update-rule-impersonation-government-businesses-address-platforms), vetting advertisers, monitoring ads, investigating, taking down and acting against advertisers; the 2-0 vote
- [UK Online Safety Act 2023, section 38](https://www.legislation.gov.uk/ukpga/2023/50/section/38), the Category 1 fraudulent advertising duty to prevent, minimise and swiftly take down
- [UK Online Safety Act 2023, section 39](https://www.legislation.gov.uk/ukpga/2023/50/section/39), the corresponding Category 2A search duty and the public statement on proactive technology

**Reference**

- [FBI IC3: Cyber criminals impersonating brands using search engine advertisement services (December 21, 2022)](https://www.ic3.gov/PSA/2022/PSA221221), lookalike domains, cloned sites, malware downloads, cryptocurrency exchange impersonation and the advice to type the address
- [Microsoft Threat Intelligence: Malvertising campaign leads to info stealers hosted on GitHub (March 6, 2025)](https://www.microsoft.com/en-us/security/blog/2025/03/06/malvertising-campaign-leads-to-info-stealers-hosted-on-github/), nearly one million devices, iframe redirectors on streaming sites, the four-to-five-layer chain and the payload hosts

**In practice**

- [Google: 2025 Ads Safety Report (April 16, 2026)](https://blog.google/products/ads-commerce/2025-ads-safety-report/), ads blocked or removed, accounts suspended, scam ads and accounts, and the share caught before serving
- [Google Ads policy: Abusing the ad network](https://support.google.com/adspolicy/answer/6020954), malicious software, compromised sites, unwanted software, unfair advantage, evasive ad content and suspension on detection
- [Google Ads policy: Strike-based system](https://support.google.com/adspolicy/answer/10922738), the covered policies, the warning, 3-day and 7-day holds, suspension and appeals
- [Google Ads policy: Advertiser verification](https://support.google.com/adspolicy/answer/9703665), who is selected, what is verified, restrictions before completion, ad disclosures and the Ads Transparency Center
- [Meta: Advertising Standards](https://transparency.meta.com/policies/ad-standards/), the review process and its timing, re-review, requests for review, account restrictions and the policy sections
