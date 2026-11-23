+++
title = "Children, Teens & Advertising"
nav_title = "Children and Teens"
description = "Ads to children and teens: COPPA for ad tech, child-directed and mixed audiences, FTC ad cases, DSA Article 28, state teen rules, app stores and kids CTV."
category = "Advertising Industry"
order = 2958
part = "Privacy and Law"
tags = ["advertising", "privacy", "coppa", "children", "teens", "data-model"]
+++

Advertising to children is lawful; profiling them for it mostly isn't. A cereal brand can buy a pre-roll on a cartoon channel, a toy company can sponsor a kids' game, and a streaming service can sell ads in its kids' profiles, as long as the ad is chosen by the content and not by a record of the child. What changes for an ad system is everything downstream of the request: no persistent identifier used to build a profile, no retargeting, no data passed to third parties for their own advertising, ad content rated for the audience, and, in more and more places, the same rules for teenagers. The legal triggers are a property's audience (child-directed, mixed, general) and a user's age (known, inferred, or unknown), and the ad system has to carry both on every request.

It is hard because most of the cases are about systems that knew and didn't act. The FTC's 2019 order against YouTube was about collecting cookies from viewers of channels the company knew were child-directed and using them for targeted ads; its 2021 order against OpenX was about an ad exchange that had reviewed hundreds of apps described as "for toddlers" and "preschool learning" and let them into the auction unflagged; its 2025 order against Disney was about a content owner that labeled whole channels instead of individual videos. Meanwhile the obligations have spread: the amended COPPA Rule (compliance from April 22, 2026) requires separate parental consent before disclosing a child's data for targeted advertising, the EU's Digital Services Act bars profiling-based ads to minors on online platforms, California makes sale and sharing of under-16s' data opt-in, Maryland bans targeted ads to anyone a business knew or should have known is under 18, and the app stores have their own rules that apply before any law does.

This chapter covers COPPA as it applies to ad tech (the internal operations exception, the 2025 amendments, child-directed and mixed-audience properties), the FTC's advertising cases, the signals that mark a request (`regs.coppa`, Google's age treatment, app store rules), teens under EU and state law, ad content for young audiences, and kids' apps and CTV. It extends `properties`, `ad_requests` and `creatives` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and the consent signal model in [Consent Management & the TCF](/books/advertising/consent-and-the-tcf#the-consent-signal-model). The playbook owns children's privacy in general: who counts as a child in each regime, verifiable parental consent methods, the UK Age Appropriate Design Code and age assurance design ([Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy)), and restricted mode in telemetry ([Minors](/docs/telemetry/consent-and-privacy#minors)). User-Generated Platforms owns minors' platform law: age checks, teen defaults, state social media laws and their court status ([Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance)). Advertising content rules for children's ads in general (CARU, the FTC Act) are [Advertising Content Law](/books/advertising/advertising-content-law).

## How the Platforms Do It

As of November 2026, from each platform's documentation:

| Platform | How a child or teen is signaled | What changes for ads |
| --- | --- | --- |
| **Apple App Store** | The app's Kids Category listing; apps "intended primarily for kids" under guideline 5.1.4 | Kids Category apps "should not include third-party analytics or third-party advertising"; third-party contextual ads only in limited cases, from services with documented Kids practices "that include human review of ad creatives for age appropriateness" |
| **Google AdMob and Ad Manager** | **Age treatment** (child, teen or unspecified), which "replaces the deprecated" tag for child-directed treatment (TFCD) and tag for users under the age of consent (TFUA); a maximum ad content rating (G, PG, T, MA) | Child-directed treatment disables "IBA and remarketing ads on that ad request" and stops transmission of the Android advertising ID; ads are returned at or below the content rating set |
| **Google Play Families policy** | The app's target audience declaration (children only, or children and older users) | Ads to children or users of unknown age only through "Google Play Families Self-Certified Ads SDKs", no interest-based advertising or remarketing, child-appropriate content, no ads that are "not closeable after 5 seconds" and no interstitials immediately on app launch; apps that target children "must not transmit" the advertising ID |
| **IAB Tech Lab OpenRTB** | `regs.coppa`: "Flag indicating if this request is subject to the COPPA regulations" | A signal every bidder receives; what each does with it is its own obligation |
| **YouTube** | Creators label each video "Made for Kids" or "Not Made for Kids" (required since the 2019 FTC settlement) | The label decides whether a video's viewers are treated as children for data collection and ads; it is the creator's legal determination, as the Disney order shows |

Three patterns:

- **The audience is declared by the supply side.** The app developer, the publisher or the creator says whether content is for children; the platform applies the restrictions. The FTC holds the declarer responsible for getting it right (Disney) and the platform responsible for acting on what it knows (OpenX, YouTube).
- **Child means contextual.** Every platform's child mode is the same shape: no profile-based targeting, no remarketing, no advertising ID leaving the device, and ad content rated for the audience. In this volume's model that is `ads_mode = 'non_personalized'` with a `coppa` or `known_minor` reason, plus restrictions on what the request may carry.
- **Teen is a third state.** Google's age treatment now has `TEEN` beside `CHILD` and `UNSPECIFIED`, with no equivalent in the old tags. The law has moved the same way, and a boolean `coppa` flag can't express it.

## COPPA for Ad Systems

The COPPA Rule (16 CFR Part 312) applies to operators of services directed to children under 13 and to operators with actual knowledge that they collect from a child; the playbook's [COPPA](/docs/compliance/childrens-privacy#coppa) has the definitions and duties. Three parts of it decide what an ad system may do.

**A persistent identifier is personal information.** The rule's list includes "a persistent identifier that can be used to recognize a user over time and across different websites or online services": a cookie ID, an IP address, a device's advertising ID ([What Counts as Personal Information](/docs/compliance/childrens-privacy#what-counts-as-personal-information)). Every ad request carries at least one.

**Internal operations allow contextual ads and frequency capping, not profiles.** An identifier collected only to support the service's internal operations needs no parental consent if no other personal information is collected, and the list of internal operations includes serving contextual ads and capping ad frequency. But it "cannot be used or disclosed to contact a specific individual, including through behavioral advertising, to amass a profile on a specific individual, or for any other purpose." An ad server on a child-directed app may use a device ID to cap a creative at three views a day and to detect fraud; it may not add the device to an interest segment, and neither may any bidder.

**Ad tech intermediaries are within reach.** The FTC has brought COPPA cases against an ad exchange that collected through child-directed apps it had reviewed (the OpenX case below), not only against the apps. That is why an exchange has to act on the flag and on what it knows about its supply, not just forward `regs.coppa`.

### The 2025 Amendments

The FTC finalized the amendments on January 16, 2025, published them April 22, 2025, made them effective June 23, 2025, and required compliance by April 22, 2026 ([The 2025 Amendments](/docs/compliance/childrens-privacy#the-2025-amendments)). For advertising, one change matters most: operators must give parents the option to consent to collection without consenting to disclosure to third parties and obtain **separate verifiable parental consent** to the disclosure, "unless such disclosure is integral to the website or online service" (312.5(a)(2)); the FTC describes it as "opt-in consent for targeted advertising and other disclosures to third parties." A parent can now agree to a game collecting their child's data to save progress and refuse to let it be shared with ad networks, and the operator has to build both choices.

The consequences for an ad stack in a child-directed or mixed-audience product:

- **Default to no disclosure.** Without the separate consent, the request leaves the app or site with no persistent identifier usable for anything but internal operations, which in practice means contextual-only demand and frequency capping by the publisher's own ad server.
- **Consent is a record per child and purpose,** collection and disclosure separately, and the disclosure consent travels with the request as a reason code; a request with disclosure consent may carry identifiers only to the third parties the notice named.
- **Retention is written down.** The amended rule requires a written retention policy and forbids keeping children's data indefinitely, so an ad server's logs from child-directed properties need their own, shorter retention.

### Child-Directed and Mixed-Audience Properties

Whether a service is directed to children is a judgment on its subject matter, visual content, animated characters, activities and incentives, music, models, celebrities, the ads on it and evidence about its actual audience. The amended rule defines a **mixed audience** service: directed to children but not primarily, and not collecting personal information "prior to collecting age information or using another means that is reasonably calculated... to determine whether the visitor is a child." That gives three classes of property with different ad behavior:

| Class | Who is treated as a child | Ad behavior |
| --- | --- | --- |
| **Child-directed** (primary audience children) | Everyone | Every request flagged; contextual and frequency capping only; no third-party disclosure without separate consent |
| **Mixed audience** | Users who state an age under 13, or are otherwise determined to be children | A neutral age screen before any collection; children's requests flagged, others treated as general |
| **General audience** | Users the operator has actual knowledge are under 13 | Flag those users' requests once known |

The determination is a record, not a checkbox. The YouTube and Disney orders are both about where the determination was made: YouTube had to build a system for channel owners to identify child-directed content; Disney labeled at the channel level when individual videos needed their own labels. An ad platform with child-directed supply keeps the determination at the level the content varies (an app, a channel, a show, a video) with the factors and who decided it.

## The FTC's Advertising Cases

The COPPA cases against ad systems, from the FTC's announcements:

- **Google and YouTube (September 4, 2019).** $170 million, $136 million to the FTC and $34 million to New York, for collecting persistent identifiers (cookies) from viewers of child-directed channels without parental consent and using them to serve targeted ads. The order required a system for channel owners to identify child-directed content, notice to channel owners that such content may be subject to COPPA, and annual COPPA training for employees who deal with channel owners.
- **OpenX (December 15, 2021).** $2 million. The FTC alleged that OpenX, an ad exchange, "collected personal information from children under 13 without parental consent" and passed it to third parties that targeted ads at users of child-directed apps; it had reviewed hundreds of apps whose listings said "for toddlers," "for kids," "kids games," or "preschool learning" and didn't flag them. It also alleged that OpenX falsely claimed it didn't collect geolocation from users who had opted out. The order required deleting "all ad request data it collected to serve targeted ads," a privacy program, periodic re-review of apps to find and ban child-directed ones, and tracking of banned apps and sites.
- **Disney (September 2, 2025; court approval announced December 31, 2025).** $10 million. Disney designated its YouTube videos as Made for Kids or not at the channel level rather than per video, so child-directed videos on general channels collected data for targeted ads; YouTube had told Disney in mid-2020 that it changed "more than 300 Disney videos" to Made for Kids, and Disney kept its approach. The order requires a program to review whether videos "should be designated as MFK," which ends if YouTube adopts "age assurance technologies that can determine the age, age range, or age category of all YouTube users" or stops letting creators label.

What they mean for an ad platform:

- **An exchange is responsible for its supply's audience.** OpenX had the evidence (the app store descriptions) and didn't act on it. A supply review that reads store categories, descriptions and content ratings, and flags child-directed apps, is the control the order required.
- **The flag must stop the data, not just ride along.** In OpenX the data went to third parties for targeting; the fix is to strip identifiers from child-flagged requests before any bidder sees them.
- **Labels are owned and audited.** A content owner's label is its legal determination; a platform's job is to make labeling granular (per video, per show) and to check it.

## Signals on the Request

A request can say a user is a child, or the property is child-directed, in several ways, and the edge has to combine them:

- **`regs.coppa = 1`** in OpenRTB, set by the publisher or the exchange from the property's classification. The core's `ad_requests.coppa` and `properties.child_directed` carry it.
- **Google's age treatment** in the SDK or tag: child, teen or unspecified, replacing the deprecated TFCD and TFUA settings, with "the most conservative treatment" applied when both are set. Ad Manager's request parameter is the tag for age treatment (TFAT), whose "child" value is "functionally equivalent" to the old tags and whose teen treatment is the value 2.
- **App store declarations:** Apple's Kids Category, Google Play's target audience for Families. An app in either is a child-directed property for ad purposes whatever its own flag says.
- **The platform's own knowledge:** an account with a birth date, a kids' profile on a streaming service, an age signal from an app store API (the playbook's [US State App-Store Laws](/docs/compliance/childrens-privacy#us-state-app-store-laws) covers Apple's Declared Age Range and Google's Play Age Signals). Google's terms for Play Age Signals forbid using it for "advertising, marketing, user profiling, or analytics," so the signal can restrict ads but can't be a targeting input.
- **GPP's known-child fields:** California's section carries `KnownChildSensitiveDataConsents` for selling and sharing data of consumers under 16, and Virginia's a single known-child consent ([The State Sections](/books/advertising/gpp-gpc-and-us-opt-outs#the-state-sections)).

The edge resolves them into an **age band** for the request (under 13, 13 to 15, 16 to 17, adult, unknown) and the source of the band, and the band drives the mode. My rule is that the most restrictive signal wins, the same as Google's: a child-directed property makes every request a child's request, whatever the user's account says; an unknown age on a mixed-audience property before the age screen is treated as a child.

## Teens

Below 13 the rules are COPPA's; between 13 and 18 they depend on where the user is, and they are converging on "no profiling-based ads to known minors":

- **EU, DSA Article 28(2).** An online platform may not present ads based on profiling "when they are aware with reasonable certainty that the recipient of the service is a minor," and the recital adds that this is not a reason to collect more data to determine age ([The EU: DSA Article 28 and GDPR Article 8](/docs/compliance/childrens-privacy#the-eu-dsa-article-28-and-gdpr-article-8)). It applies to online platforms (services that host and disseminate user content), not to every website; for a publisher's own site the GDPR's rules on consent and minors apply instead. The Commission's guidelines under Article 28, launched July 14, 2025, add protection from commercial risks. [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads) covers the DSA's other advertising rules.
- **California, under 16.** Sale or sharing of a consumer's data requires affirmative authorization where the business has actual knowledge the consumer is under 16 (from the consumer at 13 to 15, from a parent under 13), and willful disregard of age counts as knowledge (Civil Code 1798.120(c)). Jam City's November 2025 settlement, $1.4 million, included sharing data of users aged 13 to 15 without opt-in consent.
- **Maryland, under 18.** No targeted advertising, and no sale of personal data without consent, where the controller "knew or should have known" the consumer is 13 to under 18, since October 1, 2025 ([Maryland](/books/advertising/us-state-privacy-law#maryland)). The knowledge standard is the strictest in force: an ad platform whose own models infer an interest profile typical of a teenager arguably "should have known."
- **New York, under 18.** The Child Data Protection Act, effective June 20, 2025, follows COPPA under 13; for 13 to 17 it requires consent unless processing is "strictly necessary" for listed purposes, and the Attorney General's guidance says internal operations exclude marketing and advertising and behavioral advertising can't be framed as a core service.
- **Other states.** Oregon bans the sale of data of consumers under 16 and Vermont's 2026 law bans sale and targeted ads for ages 13 to 17 from January 1, 2028, both by secondary accounts. <!-- source-gap: adv-oregon-vermont-teen-rules | secondary | Oregon HB 2008 ban on selling under-16 data; Vermont S.71 ban on sale and targeted ads for 13 to 17 from 2028 | closes with: the enrolled Oregon HB 2008 and Vermont Act 145 texts | checked: 2026-11-22 --> State laws aimed at social media platforms (age verification, parental consent, feed limits) are UGP's [US State Laws and Their Court Status](/books/user-generated-platforms/minors-and-age-assurance#us-state-laws-and-their-court-status); several are enjoined, and their status changes by the month.

The practical result is a teen mode beside the child mode: profiling-based ads off where the jurisdiction says so, sale and sharing off without the required consent, and ad content limited to what suits the age, with the jurisdiction rules (`privacy_jurisdictions`, in US State Privacy Law for Advertising) carrying each state's age and knowledge standard.

## Ad Content for Young Audiences

Data rules decide how an ad is chosen; content rules decide which ads may be chosen at all. The platforms enforce ratings (Google's G, PG, T and MA content ratings for ads; Google Play's requirement that ads to children be "appropriate for children"; Apple's human review of creatives for Kids Category ads), and products that may not be advertised to minors (alcohol, tobacco, gambling, some financial products) are excluded by category. The self-regulatory guidelines for children's advertising (CARU's) and the age-composition standards for alcohol ads are [Advertising Content Law](/books/advertising/advertising-content-law); selling age-restricted goods is Commerce's [Age-Restricted Goods](/books/commerce/age-restricted-goods).

For the ad system, the content check is a rating on the creative compared with a ceiling on the request: a property sets its maximum rating, a child or teen age band lowers it, and creatives above the ceiling or in excluded categories are filtered before the auction. That filter has to run on every demand source, including programmatic bids, where the creative is known only at bid time: the exchange checks the bid's declared category and creative attributes against the ceiling and drops what doesn't fit.

## Kids' Apps, Games and CTV

The channels where children are the audience each add a rule:

- **Apps.** The app stores' kids programs are stricter than COPPA: Apple's Kids Category generally bars third-party advertising and analytics, and Google Play's Families policy restricts ads to certified SDKs with no interest-based ads, no remarketing and no advertising ID transmission for child-directed apps. An ad SDK that wants to serve kids' apps on Android needs to be in Google's self-certified program.
- **Games.** A game with a child audience is child-directed for its ads even when the publisher's terms say 13+; Tilting Point's 2024 California settlement ($500,000) was about children's data collected and shared through misconfigured SDKs in games. Rewarded ads in games follow the same rules as any other ad request; the Gaming volume's [Ads in Mobile Games](/books/gaming/monetization#ads-in-mobile-games) covers the formats from the studio's side.
- **CTV and streaming.** Kids' profiles on streaming services are mixed-audience properties inside one app: the profile sets the age band on every request from it. Sling TV's 2025 settlement noted the absence of a "kid's profile" option among its failings. Server-side ad insertion carries the flag from the player to the ad decision server, and the SSAI chapter's beacons must not attach a persistent device ID to a child profile's impressions beyond internal operations.

## How to Build It

The core gives `properties.child_directed` and `ad_requests.coppa`. The chapter replaces the property boolean's meaning with a class, adds the age band and its source to the request, records how each audience determination was made, and puts content ratings on properties and creatives.

```sql
ALTER TABLE properties
  ADD COLUMN audience_class TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN max_ad_content_rating TEXT;            -- 'G', 'PG', 'T', 'MA'; null: no ceiling
ALTER TABLE properties ADD CONSTRAINT properties_audience_class_check
  CHECK (audience_class IN ('general', 'mixed_audience', 'child_directed')) NOT VALID;
ALTER TABLE properties ADD CONSTRAINT properties_child_directed_consistent_check
  CHECK (child_directed = (audience_class = 'child_directed')) NOT VALID;
ALTER TABLE properties ADD CONSTRAINT properties_max_rating_check
  CHECK (max_ad_content_rating IN ('G', 'PG', 'T', 'MA')) NOT VALID;

ALTER TABLE ad_requests
  ADD COLUMN age_band   TEXT,
  ADD COLUMN age_source TEXT;
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_age_band_check
  CHECK (age_band IN ('under_13', '13_15', '16_17', 'adult', 'unknown')) NOT VALID;
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_age_source_check
  CHECK (age_source IN ('property_class', 'age_treatment_tag', 'app_store_category',
    'account', 'profile', 'platform_api', 'age_screen', 'gpp_known_child')) NOT VALID;
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_child_mode_check
  CHECK (NOT coppa OR ads_mode IS DISTINCT FROM 'personalized') NOT VALID;

ALTER TABLE creatives ADD COLUMN content_rating TEXT;  -- set at review
ALTER TABLE creatives ADD CONSTRAINT creatives_content_rating_check
  CHECK (content_rating IN ('G', 'PG', 'T', 'MA')) NOT VALID;

CREATE TABLE audience_determinations (     -- how a property, channel or item was classified
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id        UUID NOT NULL REFERENCES properties (id),
  scope              TEXT NOT NULL CHECK (scope IN ('property', 'channel', 'show', 'item')),
  scope_ref          TEXT,                 -- channel ID, show ID or video ID; null for the property
  audience_class     TEXT NOT NULL CHECK (audience_class IN ('general', 'mixed_audience',
                       'child_directed')),
  method             TEXT NOT NULL CHECK (method IN ('owner_declaration', 'store_category',
                       'classifier', 'human_review', 'platform_override')),
  factors            JSONB NOT NULL DEFAULT '{}',  -- subject matter, characters, store text...
  decided_by         TEXT NOT NULL,        -- typed actor: owner, reviewer, model version
  decided_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  supersedes_id      UUID REFERENCES audience_determinations (id),
  CHECK ((scope = 'property') = (scope_ref IS NULL))
);
CREATE INDEX audience_determinations_current_idx
  ON audience_determinations (property_id, scope, scope_ref, decided_at DESC);
```

The edge's decision, from the property's class, the signals on the request and the jurisdiction's teen rule:

```go tab="Go"
type AgeInput struct {
	PropertyClass   string // "general", "mixed_audience", "child_directed"
	ItemChild       bool   // the channel, show or item is child-directed
	AgeTreatment    string // "child", "teen", "unspecified"
	AccountAgeBand  string // from an account or profile, "" if none
	AgeScreenPassed bool   // mixed audience: the neutral age screen has run
	TeenBanBelowAge int    // from privacy_jurisdictions; 0 if none
}

type AgeDecision struct {
	Band        string
	COPPA       bool
	NoProfiling bool // ads_mode at most non_personalized
	StripIDs    bool // no identifiers to third parties
	Reasons     []string
}

func DecideAge(in AgeInput) AgeDecision {
	child := func(src string) AgeDecision {
		return AgeDecision{Band: "under_13", COPPA: true, NoProfiling: true, StripIDs: true,
			Reasons: []string{"coppa", src}}
	}
	switch {
	case in.PropertyClass == "child_directed", in.ItemChild:
		return child("child_directed_supply")
	case in.AgeTreatment == "child", in.AccountAgeBand == "under_13":
		return child("known_child")
	case in.PropertyClass == "mixed_audience" && !in.AgeScreenPassed:
		return child("mixed_audience_unscreened")
	}
	band := in.AccountAgeBand
	if band == "" {
		band = "unknown"
		if in.AgeTreatment == "teen" {
			band = "13_15" // the conservative teen band when only "teen" is known
		}
	}
	d := AgeDecision{Band: band}
	teen := band == "13_15" || band == "16_17"
	if teen && in.TeenBanBelowAge >= 16 && (band == "13_15" || in.TeenBanBelowAge >= 18) {
		d.NoProfiling, d.StripIDs = true, true
		d.Reasons = append(d.Reasons, "teen_ban")
	}
	if teen {
		d.Reasons = append(d.Reasons, "known_minor")
		d.NoProfiling = true // DSA Art. 28(2) and platform teen modes; jurisdiction may relax
	}
	return d
}
```

```rust tab="Rust"
pub struct AgeInput<'a> {
    pub property_class: &'a str,   // "general", "mixed_audience", "child_directed"
    pub item_child: bool,          // the channel, show or item is child-directed
    pub age_treatment: &'a str,    // "child", "teen", "unspecified"
    pub account_age_band: Option<&'a str>,
    pub age_screen_passed: bool,   // mixed audience: the neutral age screen has run
    pub teen_ban_below_age: u8,    // from privacy_jurisdictions; 0 if none
}

#[derive(Default)]
pub struct AgeDecision {
    pub band: &'static str,
    pub coppa: bool,
    pub no_profiling: bool, // ads_mode at most non_personalized
    pub strip_ids: bool,    // no identifiers to third parties
    pub reasons: Vec<&'static str>,
}

fn child(src: &'static str) -> AgeDecision {
    AgeDecision { band: "under_13", coppa: true, no_profiling: true, strip_ids: true,
                  reasons: vec!["coppa", src] }
}

pub fn decide_age(i: &AgeInput) -> AgeDecision {
    if i.property_class == "child_directed" || i.item_child { return child("child_directed_supply"); }
    if i.age_treatment == "child" || i.account_age_band == Some("under_13") { return child("known_child"); }
    if i.property_class == "mixed_audience" && !i.age_screen_passed {
        return child("mixed_audience_unscreened");
    }
    let band: &'static str = match i.account_age_band {
        Some("13_15") => "13_15",
        Some("16_17") => "16_17",
        Some("adult") => "adult",
        _ if i.age_treatment == "teen" => "13_15", // conservative when only "teen" is known
        _ => "unknown",
    };
    let mut d = AgeDecision { band, ..Default::default() };
    let teen = band == "13_15" || band == "16_17";
    if teen && i.teen_ban_below_age >= 16 && (band == "13_15" || i.teen_ban_below_age >= 18) {
        d.no_profiling = true;
        d.strip_ids = true;
        d.reasons.push("teen_ban");
    }
    if teen {
        d.reasons.push("known_minor");
        d.no_profiling = true; // DSA Art. 28(2) and platform teen modes; jurisdiction may relax
    }
    d
}
```

With a Maryland request (`TeenBanBelowAge` 18) from a 16-year-old's account on a general site, the decision is band `16_17`, no profiling and stripped identifiers, reasons `teen_ban` and `known_minor`; with the same account in a state with no teen rule, profiling is still off by the code's default (the conservative choice for a platform covered by DSA Article 28 or a platform teen mode) but identifiers may go to service providers. A child-directed property returns the COPPA decision before any account is consulted.

Design notes:

- **The class is the rule; the boolean is derived.** `properties.child_directed` stays for compatibility and is constrained to match `audience_class`, so nothing reads a stale flag.
- **Determinations live at the level content varies.** A general-audience CTV app with a kids' section has a `property` determination of `mixed_audience` and `show` or `item` determinations of `child_directed`; the ad request carries the item, and the edge looks up its determination. That is the Disney order's channel-versus-video lesson in a schema.
- **Supply review writes determinations.** A job that reads app store categories and descriptions for every app in the exchange writes `store_category` or `classifier` determinations for review, and a human decision supersedes them: OpenX's order required exactly this re-review.
- **Most restrictive wins, and says why.** The age band and its source are on every request; the reasons array says which signal set COPPA, which matters when a parent, a regulator or a publisher asks why a request was treated as a child's.
- **Separate consent to disclose is a reason, not a mode.** Where a parent gave the amended rule's separate disclosure consent, the request carries a reason code allowing identifiers to the named third parties; without it, `StripIDs` holds.
- **Ratings filter every source.** `creatives.content_rating` is set at review ([Creative Production, Review & DCO](/books/advertising/creative-production-and-dco)'s `creative_reviews` records the decision), and the auction drops creatives and bids above the request's ceiling.
- **Logs from children's requests expire sooner.** Requests with `coppa` true go to partitions with the retention the written policy states, separately from general traffic.

Child-flagged requests where an identifier still left in a callout, the OpenX failure as a monitor:

```sql
SELECT b.bidder_org_id, count(*) AS callouts
FROM bid_requests b
JOIN auctions a    ON a.started_at = b.auction_started_at AND a.id = b.auction_id
JOIN ad_requests r ON r.id = a.ad_request_id
                  AND r.received_at BETWEEN a.started_at - interval '1 minute' AND a.started_at
WHERE (r.coppa OR r.age_band = 'under_13')
  AND b.personal_data_sent
  AND b.sent_at >= now() - interval '1 day'
GROUP BY b.bidder_org_id;
```

The expected result is empty; any row is an incident.

## Auditing

- **Every audience determination,** with its scope, method, factors and decider, and its history, so the question "when did you know this app was for children?" has a dated answer.
- **The age decision on every request:** the band, its source, the reasons and whether COPPA applied, retained under the children's retention policy.
- **What left for each child-flagged request:** per callout, whether personal data was sent and which fields were stripped; for an SSAI or SDK integration, which beacons carried identifiers.
- **Parental consents for disclosure,** per child and third party, with the notice version, when the property relies on them.
- **Supply reviews:** each periodic review of apps and sites, what it flagged and what was banned or reclassified, as the OpenX order requires of an exchange.
- **Creative ratings and filters:** each creative's rating and who set it, and the share of child and teen requests where a creative was filtered for rating.

## What This Means for the System You Build

- **Classify supply as child-directed, mixed or general** at the level the content varies, and keep each determination as a dated record.
- **Resolve an age band on every request** from the property, the item, the tags, the account and the app store, with the most restrictive signal winning.
- **Make child requests contextual by construction:** no profiling, no remarketing, no identifiers to third parties, frequency capping and fraud detection only.
- **Build a teen mode** driven by each jurisdiction's age and knowledge standard, not a single COPPA flag.
- **Review your supply for children's apps** the way the OpenX order requires, and act on what the store listings say.
- **Rate creatives and filter them** against each request's ceiling, for every demand source.
- **Keep children's logs separately** under a written, shorter retention.

## References

**Regulation**

- [Federal Register: Children's Online Privacy Protection Rule (April 22, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm), the amended rule, its effective and compliance dates and the mixed audience definition
- [FTC: Changes to the children's privacy rule (January 16, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data), separate parental consent for disclosure, including for targeted advertising
- [FTC: Google and YouTube will pay record $170 million (September 4, 2019)](https://www.ftc.gov/news-events/news/press-releases/2019/09/google-youtube-will-pay-record-170-million-alleged-violations-childrens-privacy-law), the split, the conduct and the order's requirements
- [FTC: Advertising platform OpenX will pay $2 million (December 15, 2021)](https://www.ftc.gov/news-events/news/press-releases/2021/12/advertising-platform-openx-will-pay-2-million-collecting-personal-information-children-violation), the child-directed apps, the geolocation claim and the order
- [FTC: Disney to pay $10 million (September 2, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/09/disney-pay-10-million-settle-ftc-allegations-company-enabled-unlawful-collection-childrens-personal), channel-level designation, the 300 videos and the review program
- [FTC: Court approves order requiring Disney to pay $10 million (December 31, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/12/court-approves-order-requiring-disney-pay-10-million-settle-ftc-allegations-firm-enabled-unlawful), court approval
- [Regulation (EU) 2022/2065, the Digital Services Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2065), Article 28(2) and its recital on not collecting more data to determine age
- [European Commission: Guidelines on the protection of minors under the DSA](https://ec.europa.eu/newsroom/betterinternet/items/895787/en), the July 14, 2025 launch and commercial risks
- [CPPA: California Consumer Privacy Act (effective January 1, 2026)](https://cppa.ca.gov/pdf/20260101_ccpa_statute.pdf), 1798.120(c) on consumers under 16 and willful disregard
- [Maryland: Chapter 455 of 2024, enrolled text](https://mgaleg.maryland.gov/2024RS/Chapters_noln/CH_455_sb0541e.pdf), the "knew or should have known" teen targeting ban
- [New York Attorney General: Child Data Protection Act guidance](https://ag.ny.gov/child-data-protection-act-guidance), the effective date, the 13 to 17 rules and advertising outside internal operations
- [California Attorney General: Privacy enforcement actions](https://oag.ca.gov/privacy/privacy-enforcement-actions), Jam City, Tilting Point and Sling TV

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), `regs.coppa`
- [IAB Tech Lab: GPP Extension, California Privacy Technical Specification](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Sections/US-States/CA/GPP%20Extension:%20California%20Privacy%20Technical%20Specification.md), the known-child consent fields for consumers under 16

**Reference**

- [Multistate: Comprehensive privacy laws that take effect in 2026](https://multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026), Oregon's under-16 sale ban (secondary)
- [Hunton: Vermont becomes 23rd state with a comprehensive privacy law](https://www.hunton.com/privacy-and-cybersecurity-law-blog/vermont-becomes-23rd-state-with-comprehensive-consumer-privacy-law), Vermont's teen sale and targeting ban (secondary)

**In practice**

- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), guidelines 1.3 and 5.1.4 on third-party advertising and analytics in kids' apps
- [Google Play Console Help: Families policy, ads and monetization](https://support.google.com/googleplay/android-developer/answer/9893335), certified ads SDKs, no interest-based ads or remarketing, ad formats and the advertising ID
- [Google Ad Manager Help: Age treatment for ad requests](https://support.google.com/admanager/answer/3671211?hl=en), TFAT replacing the deprecated TFCD and TFUA, the child and teen values
- [Android Developers: Play Age Signals overview](https://developer.android.com/google/play/age-signals/overview), the terms barring use for advertising, marketing, user profiling or analytics
- [Google for Developers: AdMob targeting (Android)](https://developers.google.com/admob/android/targeting), age treatment, the deprecated TFCD and TFUA, what child-directed treatment disables, maximum ad content rating
