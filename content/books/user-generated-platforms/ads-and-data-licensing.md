+++
title = "Ads, Brand Safety & Data Licensing"
nav_title = "Ads & Data Licensing"
description = "Selling ads beside content nobody reviewed: inventory, regional ARPU, suitability tiers, demonetization, ad law, and licensing the corpus to AI companies."
category = "User-Generated Platforms Industry"
order = 1826
part = "Creators and Money"
aliases = []
tags = ["user-generated-content", "advertising", "brand-safety", "data-licensing", "dsa"]
+++

A user-generated platform that sells ads sells something odd: attention next to content nobody on its payroll wrote or reviewed before it went live. A publisher knows what its next article says; a forum, an image host or a streaming site learns what its next post says when someone reports it. Advertisers buy that inventory anyway, because it's large, cheap and full of people talking about what they want to buy, but they buy it with conditions: no ads beside the worst content at all, and controls over how close to the merely sensitive content their brand appears. Those conditions turn every content item into a labeled ad slot, every community into a targeting and exclusion unit, and every creator into someone whose income depends on a suitability decision. Ads retailers sell against their own product pages, the other large ad business built on someone else's listings, are the Commerce volume's [Retail Media & Marketplace Ads](/books/commerce/retail-media), and the advertiser's side of measuring any of it is its [Acquisition & Attribution](/books/commerce/acquisition-and-attribution).

The same corpus has a second buyer. Search engines and AI companies pay for structured, fresh, licensed access to what users wrote, because scraping it is slower, legally exposed and missing the deletions. A data license is a contract with obligations running in both directions: the platform delivers content on time and within scope; the licensee honors removals, deletions and opt-outs it learns about later. This chapter covers both businesses: ads on user content and why the same post earns different amounts by region, brand safety and suitability frameworks and the vendors that measure them, demonetization as the creator-facing side of suitability, the ad rules in the DSA, GDPR and COPPA, moderation of the ads themselves, and data licensing as revenue. Where each model sits among the others, and how they conflict when mixed, is in [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#advertising); the API pricing, rate limits, export mechanics and scraping suits behind licensing are in [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#data-licensing-as-an-engineering-obligation).

## How the Platforms Do It

As of October 2026, from filings, help centers and announcements:

| Platform | How ads appear | Suitability controls | Corpus licensing |
| --- | --- | --- | --- |
| **Pinterest** | Standard, video, shopping, carousel, collection and other formats in home feed, search and related Pins | Platform policy and advertiser controls | None disclosed |
| **Reddit** | Feed and conversation-page ads; Dynamic Product Ads from catalogs; ads that incorporate "real, positive community conversations"; logged-out visitors monetized "mainly through conversation pages and feed ads" | Inventory tiers since 2020 (expanded, standard, limited); ads shown "in communities and alongside content that has been reviewed and deemed appropriate for advertising"; IAS and DoubleVerify measurement since June 2024; Zefr measurement announced September 2026 | Medium-term agreements; "substantially all" contract value from two partners; API performance requirements; Google (February 2024) and OpenAI (May 2024) announced |
| **Shutterstock** | Not ad-funded | Not applicable | Datasets licensed for machine learning; contributors paid from a Contributor Fund |
| **Stack Overflow** | Site ads | Platform policy | OverflowAPI with Google Cloud (February 2024), non-exclusive |
| **Tumblr** | Dashboard ads; Blaze, which lets a user pay to push a post to more dashboards | Platform policy | Automattic's third-party sharing opt-out (February 2024) |
| **Twitch** | Pre-roll and mid-roll ad breaks scheduled by the streamer in Ads Manager | Platform policy; Turbo and subscriber ad-free viewing | None |
| **YouTube** | Ads on the watch page and in the player on other sites; a pooled Shorts feed allocation | Advertiser-friendly guidelines with three earning outcomes per video; advertiser inventory types (Maximum, Moderate, Limited) | Not a licensing business |

The split is between **platforms whose revenue is ads** (Reddit at about 94% of 2025 revenue, Pinterest, YouTube's ad business), which invest in inventory tiers, third-party measurement and creator-facing suitability rules because advertiser confidence is the revenue line, and **platforms whose corpus is the asset** (Reddit again, Stack Overflow, Shutterstock, Automattic's sites), which sell structured access to what users wrote and carry the duties that come with it. Reddit runs both at once, which is why its 10-K treats moderators, brand safety and licensing concentration as risk factors side by side.

## Ads on User Content

### Where the Inventory Comes From

On a user-generated platform the ad slot is defined by the content around it. The common surfaces:

- **Feed ads.** A sponsored item in a home feed, a community feed or a dashboard, styled like the posts around it. The surrounding posts change on every refresh, so suitability is judged per position, not per page.
- **Conversation-page ads.** An ad on a post's own page, above or among the comments. This is where logged-out search traffic lands: Reddit's 10-K says search-engine visitors "are generally not logged in" and their monetization "is mainly through conversation pages and feed ads." The post that drew the visitor is the context, so it's the suitability label that matters.
- **Search ads.** A sponsored result for a query. Pinterest says "over 90% of our searches are unbranded," which makes the query itself the signal of what the user wants.
- **Video ads.** Pre-roll and mid-roll in uploaded video and live streams. YouTube pays creators 55% of net revenue from ads on public videos on the watch page, including its player embedded elsewhere, and 45% of a pooled allocation for Shorts. Twitch pays Partners in its Ads Incentive Program 55% of net ad revenue for running the recommended ad load (three minutes an hour to start), and 30% if they run less; Affiliates reach 55% by running more than three minutes an hour. Streamers schedule breaks, and running mid-rolls buys a period with no pre-rolls for new viewers.
- **Catalog ads.** Ads generated from an advertiser's product feed. Reddit's Dynamic Product Ads "allows advertisers to create ads directly from their product catalog"; Pinterest sells shopping and collection formats on the same principle.
- **Paid promotion of a user's own post.** Tumblr's Blaze, launched in April 2022 (as TechCrunch reported) and open to users over 18, charges a set fee between $10 and $150 for an estimated audience of 2,500 to 50,000 for a post. The advertiser is a user, the creative is a post, and the ad review is a moderation review.

Two choices about these surfaces shape everything downstream. **Ads are content items.** Where an ad is a post (a promoted post, a blazed post, a sponsored Pin), it has replies, reports and a moderation state like any other, and it needs the same pipeline plus the ad review in front of it. **The creator share is a program, not a constant.** YouTube's 55% and Twitch's 55% or 30% depend on the format, the program and the ad load the creator chose, and they change; each is a versioned term in the revenue program that earns from that slot ([Monetization Strategies](/books/user-generated-platforms/monetization-strategies#advertising); [Creator Monetization](/books/user-generated-platforms/creator-monetization#ad-revenue-share)).

### Why the Same Post Earns Different Amounts

Ad revenue per user varies by more than an order of magnitude with where the user is. Pinterest's 2025 10-K reports average revenue per user of $30.84 in the US and Canada, $5.12 in Europe and $0.83 in the rest of the world, against $7.21 globally, and attributes the gap to "the relative size and maturity of the digital advertising markets in these geographies." Revenue followed: $3,173.1 million of Pinterest's $4,221.8 million came from US and Canadian users. Reddit's 10-K, with about 57% of its visitors outside the US, lists the "inability to increase ARPU" in markets "that do not generate as much revenue as the United States" among its risks.

Three consequences for the system:

- **Growth and revenue point in different directions.** Pinterest's international ARPU grew fastest in 2025 (Europe up 21%, rest of world up 40%), from a low base; a platform that grows users abroad grows its cost of serving them (storage, egress, moderation in more languages) faster than its revenue from them.
- **Volume and price move separately.** Pinterest reported that ads served rose 49% in 2025 while the average price per ad fell 22%. More ad slots, in more countries and more formats, earn less each, so ad load is a lever with diminishing returns and a cost in user experience ([Monetization Strategies](/books/user-generated-platforms/monetization-strategies#when-models-collide)).
- **Advertiser concentration is a risk on its own.** Reddit's top ten advertisers were about 21% of its 2025 revenue (25% in 2024). A suitability failure that one large advertiser notices can move a quarter.

The data model consequence was set in [The User-Generated Platform Business](/books/user-generated-platforms/platform-business#how-big-it-is): country and language on accounts and content from day one, because ad revenue is computed by geography, creator ad shares are paid by geography (YouTube's Shorts pool is shared by views per country), and a request's country decides which ad rules apply.

## Brand Safety and Suitability

Advertisers separate two questions. **Brand safety** is the floor: content no advertiser should fund at all, whatever its controls. **Brand suitability** is the band above the floor: sensitive content some brands accept and others don't, chosen per brand or per campaign. A platform that sells ads beside user content has to answer both for every content item, community and channel before the ad is served, and prove it afterwards to a verification vendor the advertiser hired.

### The Shared Framework

The industry vocabulary comes from the Global Alliance for Responsible Media (GARM), started in 2019 under the World Federation of Advertisers. Its Brand Safety Floor and Suitability Framework defined a common set of content categories, "a common understanding of where ads should not appear, as expressed in a Brand Safety Floor," and "a common way of delineating different risk levels for sensitive content":

- **Categories.** Adult and explicit sexual content; arms and ammunition; crime and harmful acts, including human rights violations; death, injury or military conflict; online piracy; hate speech and acts of aggression; obscenity and profanity; illegal drugs, tobacco, vaping and alcohol; spam or harmful content; terrorism; debated sensitive social issues; and, added later, misinformation.
- **The floor.** Per category, what no ad should fund: child sexual abuse material, explicit depiction of sexual acts, instructions for obtaining illegal arms, graphic promotion of terrorism, piracy, malware and phishing.
- **Suitability tiers.** High, medium and low risk per category. The pattern repeats across categories: glamorized or gratuitous depiction is high risk; dramatic depiction in entertainment and breaking news or opinion coverage are medium; educational, informative or scientific treatment and news features are low.

GARM's framework expected each party to do its part: platforms "leverage their community standards and monetization policies to uphold the GARM brand safety floor," ad technology providers map their targeting and reporting to the definitions, and marketers set their risk thresholds against them. IAB Tech Lab worked with GARM on its Content Taxonomy 2.2 (October 2020), "a common language to help third-party verification vendors and publishers identify content."

GARM itself ended in August 2024. As Silicon Republic reported, X sued the World Federation of Advertisers, GARM and several of its members on 6 August 2024, alleging an illegal advertiser boycott, and the WFA discontinued GARM on 9 August, saying the allegations had "significantly drained its resources and finances." As of October 2026 the categories and tiers are still the language vendors and platforms map to (IAS's Reddit announcement in June 2024 described its measurement as "consistent with" GARM standards), but no industry body maintains them as GARM did. My rule: store suitability labels against a **named framework version**, map the platform's own policy categories to it, and expect to remap when the industry vocabulary moves.

### How Platforms Sell It

Platforms turn the framework into a small number of inventory choices an advertiser can understand:

- **YouTube** offers three inventory types as of October 2026: Maximum (all available inventory, though it "automatically excludes highly sensitive content"), Moderate (excludes strong profanity, dramatized violence and sexually suggestive themes) and Limited ("intended to exclude as much sensitive content as possible"). Some content is excluded at every level, including profanity in titles or thumbnails and content about terrorism or sensitive events such as war or tragedy. The defaults have moved toward caution before: in March 2017 Google changed "the default settings for ads so that they show on content that meets a higher level of brand safety," let advertisers opt into broader content, and said ads would run only "against legitimate creators in our YouTube Partner Program."
- **Reddit** introduced expanded, standard and limited inventory tiers in September 2020, as AdExchanger reported. Expanded opened "up to 20% more communities" and was the self-serve default; limited applied the strictest filtering with third-party contextual classification and was available only through managed sales.

The labels advertisers buy against are the platform's own; the evidence that the labels are right comes from outside. Reddit announced brand safety and suitability measurement with IAS and DoubleVerify in June 2024 (Marketing Brew reported both analyze written and visual content); IAS's announcement also covers viewability and invalid traffic, alongside Reddit's own "human moderators and AI-driven moderation tools, brand safety content detection, and customizable brand suitability controls." Zefr announced content-level brand safety and suitability measurement on Reddit on 30 September 2026; as PPC Land noted, the announcement didn't say whether it blocks placements before purchase or reports after the fact. The distinction matters to the build: **pre-bid** controls need the platform's labels available at auction time, while **post-bid** measurement needs an impression log that records which content item and revision sat next to each ad, so a vendor can score it later.

Advertisers with strict standards narrow further. The UK Government Communication Service's assessment of Reddit (conducted in 2022, published 2026) rated the platform's "Safety" principle high risk, then ran government advertising only on limited-mode inventory and "exclusively on a further list of pre-approved, brand-safe subreddits," with every other community excluded, and concluded Reddit "could be safely used for government communications when platform-specific controls were properly implemented." On a community platform the **community is the unit of allowlists and exclusions**, the same scope [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) uses for rules and moderation.

### Three Levels of Label

Suitability is decided at three levels, and the system needs all three:

| Level | What's labeled | Who decides | Example |
| --- | --- | --- | --- |
| **Content** | A content item at a specific revision: a post, a video, a stream segment, an image | Classifiers first, human review for disputes and high-value inventory, creator self-certification where offered | A video with limited ads; a post excluded from conversation-page ads |
| **Community or channel** | A community's or channel's default for everything in it | Staff, using the community's content rating, rules and history | A community marked not advertiser-friendly; a channel with ads disabled after repeated violations |
| **Account** | A creator's or poster's eligibility to earn from ads at all | Program rules and penalties | A channel outside the partner program; a creator suspended from monetization |

The effective label for an impression is the most restrictive of the three in force when the ad was served. Two details make it workable. **Labels pin to revisions.** An edit can turn a low-risk post into a high-risk one; the label belongs to the revision that was judged, and a new revision is unlabeled (and therefore served conservatively) until classified. **Live content is labeled as it runs.** A stream's suitability can change mid-broadcast, so its label is a time series with ranges, and ad breaks read the current one.

### Demonetization: The Creator Side

For a creator, suitability is income. YouTube's advertiser-friendly guidelines give each video one of three outcomes: it "can earn ad revenue," "will receive limited ad earnings," or "will receive no ad earnings." The guidelines cover fourteen topic areas, from inappropriate language and violence through controversial issues, sensitive events and tobacco, and they apply to "all portions of your content," including thumbnails, titles and descriptions. Creators answer a self-certification questionnaire about what their video contains at upload (a content rating, unrelated to the DSA's trader self-certification in [Supply Onboarding & Verification](/books/user-generated-platforms/supply-onboarding#dsa-trader-traceability)); YouTube says "our systems don't always get it right" and offers human review of automated decisions; and if most of a channel's content is unsuitable, or violations repeat, ads may be disabled on the whole channel.

Eligibility gates sit above the per-video label. In January 2018 YouTube moved partner program eligibility from 10,000 lifetime views to 4,000 hours of watch time in 12 months and 1,000 subscribers, saying 99% of the channels affected were making "less than $100 per year in the last year." The threshold is a suitability control expressed as a program rule: fewer, larger, reviewed channels carry ads. Eligibility gates in general are in [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#eligibility-gates).

The design consequences:

- **A demonetization is a decision with a notice and an appeal,** the same machinery as a removal ([Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons); [Appeals](/docs/security/trust-and-safety#appeals)), even though nothing was taken down. It records the label, the rule, the model and threshold or the reviewer, and the creator sees the reason.
- **A creator's self-certification is a signal, not a verdict.** A creator's accurate answers can speed eligibility; inaccurate ones are a reason to discount the creator's future answers, which the platform can only do if it stores them beside the decision.
- **The earnings consequence is computed, not edited.** A video's earnings for a period follow from the label in force when each impression was served; a reversed label on appeal restores earnings for impressions that would have earned, by recomputation, which is why impressions carry the eligibility row they were served under ([Creator Monetization](/books/user-generated-platforms/creator-monetization#ad-revenue-share)).

## Contextual Targeting and the Law

User-generated platforms have an advantage when behavioral targeting gets harder: the content is the context. A community about trail running, a search for a specific power tool, a thread comparing strollers each say what the reader wants without a profile of who they are. Privacy law has been pushing ad systems toward that signal.

- **Consent for profiling.** In the EU and UK, targeting based on tracking needs a lawful basis, usually consent, gathered before collection ([GDPR: Lawful Bases](/docs/compliance/gdpr#lawful-bases); [Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection)). Contextual targeting on the content being viewed, without a per-person profile, avoids the consent dependency for the targeting itself, though measurement and frequency capping still touch identifiers.
- **Ad transparency (DSA Article 26).** An online platform that presents ads must let each recipient identify, in real time, "that the information is an advertisement, including through prominent markings," on whose behalf it is presented, who paid if different, and "meaningful information directly and easily accessible from the advertisement about the main parameters used to determine the recipient." Article 26(3) bars ads "based on profiling using special categories of personal data" under GDPR Article 9 (health, religion, sexual orientation, political opinions and the like), which on a community platform rules out targeting by membership in communities that reveal them.
- **Creators' own commercial content (DSA Article 26(2)).** Platforms must give users "a functionality to declare whether the content they provide is or contains commercial communications," and then label it so others can identify it "in a clear and unambiguous manner and in real time." Sponsored posts by creators are content items with a declared commercial flag, not ads in the platform's ad system, and the label must show either way.
- **Minors (DSA Article 28(2)).** Platforms "shall not present advertisements on their interface based on profiling" using a recipient's personal data "when they are aware with reasonable certainty that the recipient of the service is a minor" ([The EU: DSA Article 28 and GDPR Article 8](/docs/compliance/childrens-privacy#the-eu-dsa-article-28-and-gdpr-article-8)). In the US, COPPA lets a child-directed service serve contextual ads under its support-for-internal-operations exception, but not behavioral ones without verifiable parental consent ([What Counts as Personal Information](/docs/compliance/childrens-privacy#what-counts-as-personal-information)). The ad request needs the viewer's age band (owned by [Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#age-assurance-on-a-general-audience-platform)) to choose between profiled and contextual serving.
- **Ad repositories for very large platforms (DSA Article 39).** A very large online platform must publish a searchable repository of the ads it served, kept "until one year after the advertisement was presented for the last time," with each ad's content, the advertiser and payer, the period shown, whether it was targeted and the main targeting and exclusion parameters, and the number of recipients reached, broken down by member state for targeted groups. The repository is a query over the ad system's records, so those records have to keep the targeting parameters as they were at serving time.

My default: target by community and content first, add profile signals only where consent and age allow, and record for each impression which basis was used, so a regulator's question about a minor or a special category has an answer per impression rather than per policy.

## Moderating the Ads

Ads are user-supplied content with money behind them, and they draw the same abuse as posts plus fraud. Google's 2024 Ads Safety Report counts 5.1 billion ads stopped, 9.1 billion restricted and more than 39.2 million advertiser accounts suspended in one year. The platform's ad review is a moderation pipeline with three differences:

- **Review before serving.** An ad is checked against ad policy (prohibited and restricted categories, claims, landing pages, targeting rules for regulated products) before its first impression, not after a report. Self-serve promotion of posts, like Blaze, runs the post through the same review as any other ad.
- **The advertiser is an account with standing.** Ad policy violations accrue to the advertiser account and can suspend it, and advertiser fraud (stolen cards, cloaked landing pages, impersonation) is a payments risk as much as a content one ([Fraud & Risk](/books/payments/fraud-and-risk)). Financial advertisers are verified against regulators' registers and celebrity-bait ads matched against enrolled public figures ([Crypto Investment Scams & Impersonation](/books/user-generated-platforms/crypto-investment-scams#verifying-financial-advertisers)).
- **Promoted posts keep their threads.** Where an ad is a post, replies arrive and get moderated like any comment, and the advertiser often has fewer controls over the thread than a community moderator does. The thread is in the moderation queue and in the ad repository's context.

Ad review decisions go through the playbook's case and decision model ([Trust & Safety](/docs/security/trust-and-safety#automated-detection-human-review)); this chapter adds only the ad-specific label and the advertiser as the subject.

## Data Licensing as Revenue

A user-generated corpus is valuable to search and AI companies for the reasons it is valuable to advertisers: it's large, current and written by people asking and answering real questions. Licensing it turns the corpus into contracted revenue and turns API access into a product with service levels. The API pricing changes that preceded it, rate limits, the licensed export pipeline and the anti-scraping suits are in [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#api-pricing-what-changed-and-why); this section covers the revenue and the contract.

### What the Deals Look Like

The public record, as of October 2026:

- **Reddit.** Its 10-K describes content licensing agreements "medium-term in length," says "substantially all of the contract value associated with our licensing revenue is derived from two of our partners," and says the agreements carry "API performance requirements." With advertising at about 94% of 2025 revenue, licensing and Reddit's direct-to-user products together were the remaining 6% or so. The two announced partners: Google, which on 22 February 2024 gained Reddit Data API access "for efficient and structured access to fresher information" (9to5Google, citing Bloomberg, reported the contract at about $60 million a year; neither company confirmed it); and OpenAI, announced in May 2024, which gets Data API access and became a Reddit advertising partner, with no disclosed terms. Reddit's 10-K also says it has "commenced litigation" against companies using its content without a license.
- **Stack Overflow.** On 29 February 2024 it announced a partnership under which Gemini for Google Cloud draws on Stack Overflow knowledge "utilizing the new OverflowAPI," with Stack Overflow moving its public platform to Google Cloud. The program was described as non-exclusive and financial terms were not disclosed.
- **Shutterstock.** Its 2024 10-K reports $175.3 million of data, distribution and services revenue (up from $137.3 million), a line that includes metadata licensing, and says accepted contributor content "is also made available for delivery to our data offering partners for machine learning purposes." Contributors earn "a share of the entire contract value paid by customers licensing datasets," at a "20% average corporate royalty rate," allocated in proportion to "the volume of their content and metadata that is included," paid from a pooled Contributor Fund "periodically as the fund accumulates significant revenue," with an opt-out from future datasets.
- **Tumblr and WordPress.com.** In February 2024 reporting said Automattic was preparing to supply content to AI companies and launching a setting to opt out of third-party sharing. Automattic said "we will only share public content that's hosted on WordPress.com and Tumblr, and only from sites that haven't opted out," and that its partnerships "will respect all opt-out settings." The same reporting described an internal post saying a first batch may have included content that should have been excluded: private posts on public blogs, content from deleted or suspended blogs, posts marked explicit and content from premium partner blogs.

Two lessons sit in that record. **Licensing revenue is concentrated and contractual.** Two partners and medium-term terms make it lumpy and renewal-dependent, and the API performance requirements make the platform's API an obligation with penalties, not a courtesy to developers. **The hard part is exclusion.** What goes out has to leave out what was private, deleted, removed, explicit or opted out at the time of each delivery, and keep leaving it out after the fact; an export built from "all public posts" gets it wrong in exactly the ways the Automattic reporting described.

### What a License Specifies

A corpus license has the same parts whoever the licensee is, and each becomes a field the export reads:

- **Scope.** Which content kinds (posts, comments, media, metadata), which communities, which languages and countries, and which purposes (search indexing, model training, retrieval and display, research). Shutterstock's contributor terms tie compensation to what was included; scope defines what that is.
- **Exclusions.** Private and members-only content, removed and deleted content, adult-rated content where the license excludes it, content by accounts known to be minors, communities that opted out, and accounts that opted out. Exclusions are evaluated per delivery, not once.
- **Freshness.** How soon new content must reach the licensee ("fresher information" was the stated point of Reddit's Google deal). Freshness targets turn into the API performance requirements the 10-K mentions.
- **Deletion propagation.** How soon a deletion, removal, account closure or new opt-out must be passed to the licensee, and what the licensee must do with it (stop displaying, exclude from future training, purge from retrieval indexes). Automattic said it would ask partners to remove later opt-outs from past sources and future training; a contract should say it, with a deadline.
- **Attribution and display.** Whether the licensee must link back to the source thread or community when it shows the content, which matters to the platform's search traffic and to its users.
- **Fees and term.** Fixed fees, usage fees, minimums, the term and renewal, and whether any share flows to contributors (Shutterstock's 20% average royalty is the public example of a pass-through). Fees are the terms of a revenue program ([Monetization Strategies](/books/user-generated-platforms/monetization-strategies#api-access-and-data-licensing)).
- **Audit.** The platform's right to verify use, and the licensee's right to verify delivery against the service levels.

### Opt-Outs and the Law

In the EU, the text and data mining exception in the Copyright in the Digital Single Market Directive (Article 4) allows reproductions "for the purposes of text and data mining" of lawfully accessible works, but only where use "has not been expressly reserved by their rightholders in an appropriate manner, such as machine-readable means in the case of content made publicly available online." On a platform the rightholders are mostly the users. A platform's licensing position therefore rests on its terms of service (the license users grant it) and its own reservations against third-party mining, while its users' opt-outs determine what it can include in a license in practice. How opt-outs, provenance and training-data duties work for AI uses in depth is in [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#training-data-licensing-and-opt-outs).

My rule: **every opt-out is a dated row with a scope and a subject** (an account or a community), honored by every export and by the deletion feed to each licensee. The export query reads the opt-outs in force at delivery time, the deletion feed carries opt-outs that arrived after content was delivered, and both are recorded so the platform can show what each licensee received and was told to remove.

## How to Build It

These are deltas against [the core data model](/books/user-generated-platforms/platform-business#the-core-data-model), using `content_items`, `content_revisions`, `communities` and `accounts` from there, and the `revenue_programs` and `revenue_program_terms` tables from [Monetization Strategies](/books/user-generated-platforms/monetization-strategies#how-to-build-it), which record who pays, who earns and the shares in basis points under each dated version of a program. The ad server, auction and impression pipeline are generic ad technology; what's specific to user content is the suitability label, its scope and the license with its exclusions.

```sql
-- Suitability per content item, pinned to the revision that was judged.
-- One label in force per item at a time; a new revision or a review adds a row.
CREATE TABLE content_ad_eligibility (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  content_item_id     UUID NOT NULL REFERENCES content_items (id),
  content_revision_id UUID NOT NULL REFERENCES content_revisions (id),
  framework           TEXT NOT NULL,       -- 'garm-2022', 'platform-2026-03': the vocabulary
  tier                TEXT NOT NULL CHECK (tier IN ('floor', 'high', 'medium', 'low',
                        'minimal')),
  categories          TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {'profanity','debated_issue'}
  ad_state            TEXT NOT NULL CHECK (ad_state IN ('full', 'limited', 'none')),
  decided_by_kind     TEXT NOT NULL CHECK (decided_by_kind IN ('model', 'human',
                        'self_certification', 'inherited')),
  model_version       TEXT,                -- classifier and threshold, when a model decided
  decided_by          UUID REFERENCES accounts (id),  -- the reviewer, when a human decided
  reason              TEXT NOT NULL,       -- the policy section, shown to the creator
  appeal_case_id      UUID REFERENCES moderation_cases (id),
  valid_during        TSTZRANGE NOT NULL,
  CHECK (tier <> 'floor' OR ad_state = 'none'),   -- the floor never earns
  CHECK ((decided_by_kind = 'model') = (model_version IS NOT NULL)),
  EXCLUDE USING GIST (content_item_id WITH =, valid_during WITH &&)
);

-- Community and channel defaults, with history.
CREATE TABLE community_ad_settings (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  community_id UUID NOT NULL REFERENCES communities (id),
  ad_state     TEXT NOT NULL CHECK (ad_state IN ('full', 'limited', 'none')),
  max_tier     TEXT CHECK (max_tier IN ('high', 'medium', 'low', 'minimal')),
                                           -- the riskiest tier any item may carry ads at
  reason       TEXT NOT NULL,
  set_by       UUID NOT NULL REFERENCES accounts (id),
  valid_during TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (community_id WITH =, valid_during WITH &&)
);

-- A corpus license: the contract's operational terms. Money terms live in the
-- revenue program's versioned terms; this row is what exports and SLAs read.
-- Developer Platforms, APIs & Data Access adds the licensee's app_id and the
-- license_deliveries log; opt-outs below feed its opt-out notices.
CREATE TABLE data_licenses (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  licensee              TEXT NOT NULL,     -- the counterparty's legal name
  contract_ref          TEXT NOT NULL UNIQUE,
  revenue_program_id    UUID NOT NULL REFERENCES revenue_programs (id),
  purposes              TEXT[] NOT NULL CHECK (purposes <@ ARRAY['search_indexing',
                          'model_training', 'retrieval', 'display', 'research']
                          AND cardinality(purposes) > 0),
  content_kinds         TEXT[] NOT NULL CHECK (content_kinds <@ ARRAY['post', 'comment',
                          'media_post', 'stream'] AND cardinality(content_kinds) > 0),
  include_media         BOOLEAN NOT NULL DEFAULT FALSE,
  max_content_rating    TEXT NOT NULL DEFAULT 'general' CHECK (max_content_rating IN
                          ('general', 'mature', 'adult')),
  countries             CHAR(2)[],         -- null: all
  freshness_target      INTERVAL NOT NULL, -- new content delivered within
  deletion_propagation  INTERVAL NOT NULL, -- removals, deletions, opt-outs passed on within
  attribution_required  BOOLEAN NOT NULL,
  availability_bps      INT CHECK (availability_bps BETWEEN 0 AND 10000),  -- 9990 = 99.9%
  term                  TSTZRANGE NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('draft', 'active', 'suspended',
                          'expired', 'terminated')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Opt-outs by an account or a whole community, scoped by purpose.
CREATE TABLE data_license_opt_outs (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id   UUID REFERENCES accounts (id),
  community_id UUID REFERENCES communities (id),
  purposes     TEXT[],                     -- null: every purpose
  source       TEXT NOT NULL CHECK (source IN ('user_setting', 'community_setting',
                 'minor_default', 'legal_request')),
  valid_during TSTZRANGE NOT NULL,
  CHECK ((account_id IS NULL) <> (community_id IS NULL))
);
```

What a license may deliver is a query, run per delivery, with every exclusion evaluated at delivery time. A sketch for one license's eligible posts and comments:

```sql
SELECT ci.id, ci.current_revision_id
FROM content_items ci
JOIN data_licenses dl ON dl.id = $1 AND dl.status = 'active' AND dl.term @> NOW()
JOIN accounts a ON a.id = ci.author_account_id AND a.status = 'active'
LEFT JOIN communities c ON c.id = ci.community_id
WHERE ci.state = 'published'
  AND ci.visibility = 'public'
  AND ci.kind = ANY (dl.content_kinds)
  AND (c.id IS NULL OR c.visibility = 'public')
  AND ci.content_rating <= dl.max_content_rating   -- ordered enum in practice
  AND NOT EXISTS (                                 -- author or community opted out
    SELECT 1 FROM data_license_opt_outs o
    WHERE o.valid_during @> NOW()
      AND (o.purposes IS NULL OR o.purposes && dl.purposes)
      AND (o.account_id = ci.author_account_id OR o.community_id = ci.community_id))
  -- and: author not known to be a minor (age band owned by Minors, Age Assurance),
  -- no open legal hold or removal case, community not banned
;
```

Design notes:

- **The effective ad label is computed at serving time** as the most restrictive of the content row, the community row and the author's monetization standing, and the impression records the `content_ad_eligibility` and `community_ad_settings` rows it used. Post-bid vendors, creator earnings and appeals all read that pairing.
- **An unlabeled revision serves conservatively.** A new post or an edited one gets `limited` or none until a label exists for its revision; publishing never waits for the ad classifier.
- **Labels and penalties are separate.** A demonetized channel is a penalty on the account ([Penalties and Escalation Ladders](/docs/security/trust-and-safety#penalties-and-escalation-ladders)); a limited video is a label. Lifting one doesn't touch the other.
- **Ads and declared commercial content get flags, not new kinds.** A promoted post or a sponsored Pin is a content item with an ad campaign pointing at it; a creator's sponsored post is a content item with a declared commercial-communication flag (DSA Article 26(2)), labeled in the client from that flag.
- **Deletion propagation is an event consumer.** `content.removed`, `account.closed` and new opt-out rows feed a per-license tombstone stream with a deadline computed from `deletion_propagation` ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored); [Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)); [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#how-to-build-it) owns the delivery mechanics.
- **License revenue is a revenue program.** Fees post to the ledger under the program's terms, and a contributor pass-through like Shutterstock's is a second share in the same terms, paid as earnings ([Creator Monetization](/books/user-generated-platforms/creator-monetization#how-to-build-it); [Paying Creators & Sellers](/books/user-generated-platforms/paying-creators-and-sellers#how-to-build-it)).

## Auditing

Advertisers, creators, regulators and licensees each ask for proof later:

- **The label behind every impression.** Which content revision, which suitability row and community row, which framework version, and whether the decision was a model (with version and threshold), a human or a creator's self-certification ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)). That's what answers a verification vendor's report, an advertiser's complaint and a creator's appeal.
- **Every demonetization and its outcome,** with the notice sent, the review requested and the recomputed earnings if it was reversed.
- **The targeting basis per impression,** contextual or profiled, the consent state and the viewer's age band as known, and for very large platforms the Article 39 repository fields kept until a year after the ad last ran.
- **Ad review decisions and advertiser penalties,** in the same case model as content decisions.
- **Every license delivery:** what was sent, under which license version, with which exclusions applied, and every deletion or opt-out notice sent to the licensee with its deadline and acknowledgment.
- **Every opt-out** as dated rows, so the platform can show which opt-outs were in force when each delivery was built.

The mechanics are in [Audit Trails](/docs/architecture/audit-trails); the ad repository and transparency counts are queries over these records ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#the-dsa-reports)).

## What This Means for the System You Build

- **Treat every content item as an ad slot with a label,** pinned to the revision that was judged, and serve unlabeled revisions conservatively.
- **Decide suitability at three levels,** content, community or channel, and account, and serve on the most restrictive one in force.
- **Store labels against a named framework version** and map your own policy categories to it, because the industry vocabulary changes.
- **Log the label rows behind each impression** so post-bid measurement, creator earnings and appeals agree.
- **Make demonetization a decision with a notice and an appeal,** and recompute earnings rather than edit them.
- **Carry country, language and age band into the ad request,** choose contextual or profiled serving per impression, and record which.
- **Review ads before they serve,** and keep advertisers as accounts with standing and penalties.
- **Model each data license as a contract with scope, exclusions, freshness, deletion propagation and service levels,** and its money as a revenue program.
- **Build license exports as a query evaluated at delivery time,** never from a one-time snapshot of "public posts."
- **Keep opt-outs as dated rows** for accounts and communities, honored by exports and pushed to licensees with a deadline.

## References

**Filings**

- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), about 94% of 2025 revenue from advertising, top ten advertisers at about 21%, logged-out monetization through conversation pages and feed ads, ads on reviewed content, Dynamic Product Ads, conversation summaries in ads, 57% of visitors outside the US, licensing agreements that are medium-term with substantially all value from two partners and API performance requirements, litigation against unlicensed users
- [Pinterest: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1506293/000150629326000021/pins-20251231.htm), ARPU and revenue by geography and why they differ, ads served up 49% and price per ad down 22% in 2025, over 90% of searches unbranded, ad formats
- [Shutterstock: Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/1549346/000154934625000011/sstk-20241231.htm), data, distribution and services revenue of $175.3 million and $137.3 million, content delivered to data partners for machine learning

**Regulation**

- [Regulation (EU) 2022/2065 (Digital Services Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065), Article 26 (ad labels, advertiser and payer, main parameters, the special-category profiling ban and users' declarations of commercial communications), Article 28 (no profiling-based ads to recipients known with reasonable certainty to be minors) and Article 39 (ad repositories for very large platforms, the one-year retention and required fields)
- [Directive (EU) 2019/790 (Copyright in the Digital Single Market)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790), Article 4, the text and data mining exception and the machine-readable reservation

**Platform terms**

- [YouTube: Advertiser-friendly content guidelines](https://support.google.com/youtube/answer/6162278?hl=en), the three earning outcomes, fourteen topic areas, self-certification, human review and channel-level disabling
- [YouTube: YouTube Partner Program revenue shares](https://support.google.com/youtube/answer/72902?hl=en), 55% of watch-page ad revenue, 45% of the Shorts allocation
- [Google Ads Help: About content suitability](https://support.google.com/google-ads/answer/12764663?hl=en), Maximum, Moderate and Limited inventory and content excluded at every level
- [Twitch: A more flexible Ads Incentive Program (March 2023)](https://blog.twitch.tv/en/2023/03/09/a-more-flexible-ads-incentive-program-coming-in-april), 55% and 30% net ad revenue shares, the three-minute starting ad load, Affiliates at 55%
- [Twitch Creator Camp: Running ads](https://www.twitch.tv/creatorcamp/en/level1/monetization/running-ads), Ads Manager scheduling, mid-rolls buying pre-roll-free time, Turbo ad-free viewing
- [Tumblr Help: Blaze](https://help.tumblr.com/blaze/), promotion of your own or others' posts for users over 18, $10 to $150 for estimated audiences of 2,500 to 50,000
- [Shutterstock: Data licensing and the Contributor Fund](https://submit.shutterstock.com/help/en/articles/10594694-shutterstock-data-licensing-and-the-contributor-fund), the 20% average royalty, allocation by included content and the opt-out
- [Shutterstock: AI-generated content on Shutterstock](https://submit.shutterstock.com/help/en/articles/10594676-ai-generated-content-on-shutterstock-contributor), Contributor Fund purpose and first payments in Q4 2022

**Industry frameworks**

- [GARM: Brand Safety Floor + Suitability Framework (PDF, copy hosted by ISBA)](https://www.isba.org.uk/media/1074), categories, the floor, high, medium and low risk tiers, and each party's role
- [IAB: Content Taxonomy 2.2 released for comment](https://www.iab.com/news/iab-tech-lab-releases-for-comment-content-taxonomy-2-2-to-improve-brand-safety-and-support-brand-suitability), October 2020, built with GARM as a common language for verification vendors

**In practice**

- [Google: Expanded safeguards for advertisers](https://blog.google/products/ads/expanded-safeguards-for-advertisers), 21 March 2017, safer default settings and ads only on YouTube Partner Program creators
- [YouTube: Additional changes to the YouTube Partner Program](https://blog.youtube/news-and-events/additional-changes-to-youtube-partner/), January 2018, the 4,000-hour and 1,000-subscriber threshold and the 99% under $100 figure
- [Google: 2024 Ads Safety Report (PDF)](https://services.google.com/fh/files/misc/ads_safety_report_2024.pdf), 5.1 billion ads stopped, 9.1 billion restricted, more than 39.2 million advertiser accounts suspended
- [IAS: IAS partners with Reddit](https://integralads.com/news/ias-partners-reddit-ai-driven-measurement-to-advertisers), 13 June 2024, brand safety and suitability, viewability and invalid traffic measurement, Reddit's own controls, GARM consistency
- [UK Government Communication Service: Brand safety in action, Reddit](https://www.communications.gov.uk/case-study/brand-safety-in-action-reddit/), the risk ratings, limited inventory, subreddit allowlist and conclusion
- [Google: An expanded partnership with Reddit](https://blog.google/inside-google/company-announcements/expanded-reddit-partnership/), 22 February 2024, Data API access for fresher information
- [OpenAI: OpenAI and Reddit Partnership](https://openai.com/index/openai-and-reddit-partnership/), 16 May 2024, Data API access and OpenAI as a Reddit advertising partner
- [Stack Overflow: Strategic partnership with Google Cloud](https://stackoverflow.co/company/press/archive/google-cloud-strategic-gen-ai-partnership/), 29 February 2024, OverflowAPI and Gemini for Google Cloud
- [Automattic: Protecting User Choice](https://automattic.com/2024/02/27/protecting-user-choice/), 27 February 2024, sharing only public content from sites that haven't opted out, respecting opt-outs and asking partners to remove later opt-outs
- [AdExchanger: Reddit rolls out three flavors of brand safety inventory controls](https://adexchanger.com/platforms/reddit-rolls-out-three-flavors-of-brand-safety-inventory-controls), September 2020, the expanded, standard and limited tiers (reported)
- [Marketing Brew: Reddit partners with IAS and DoubleVerify on brand safety](https://www.marketingbrew.com/stories/2024/06/14/reddit-partners-with-ias-and-doubleverify-on-brand-safety), June 2024, both vendors analyzing written and visual content (reported)
- [PPC Land: Reddit advertisers gain Zefr's brand suitability controls](https://ppc.land/reddit-advertisers-gain-zefrs-ai-brand-suitability-controls/), the 30 September 2026 announcement and its unstated pre-bid or post-bid scope (reported)
- [Silicon Republic: GARM shuts down after X lawsuit](https://siliconrepublic.com/?p=1089642), the 6 August 2024 suit, the 9 August discontinuation and the WFA's statement (reported)
- [TechCrunch: Tumblr Blaze](https://techcrunch.com/2022/04/20/tumblr-blaze-420/), the April 2022 launch (reported)
- [9to5Google: Google and Reddit expand partnership](https://9to5google.com/2024/02/22/google-reddit/), the contract value reported by Bloomberg at $60 million a year (reported)
- [Engadget: Tumblr and WordPress posts will reportedly be used for OpenAI and Midjourney training](https://www.engadget.com/tumblr-and-wordpress-posts-will-reportedly-be-used-for-openai-and-midjourney-training-204425798.html), 27 February 2024, the internal post on content included in error (reported)
