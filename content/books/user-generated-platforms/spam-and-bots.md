+++
title = "Spam, Bots & Inauthentic Behavior"
nav_title = "Spam, Bots & Inauthenticity"
description = "Account farms, vote rings, CAPTCHAs and proof of work, SMS pumping, coordinated inauthentic behavior, bot labels and crowd context notes with bridging ranking."
category = "User-Generated Platforms Industry"
order = 1840
part = "Trust and Safety"
tags = ["trust-and-safety", "spam", "bots", "inauthentic-behavior", "captcha", "community-notes"]
+++

Spam is the largest category of abuse on every open platform, and it isn't close. More than half of what Reddit's admins removed in the second half of 2025 was spam; Discord disabled almost 48 million spam accounts in a year, against about 3.2 million accounts disabled for everything else. Spam is also the category where the adversary is most purely economic: an operator who registers thousands of accounts, ages them, votes them into credibility and then sells links, scams or attention will stop exactly when the cost of an account that survives exceeds what it earns. Everything in this chapter is a way to move that cost: friction at sign-up, proof of work, phone checks, rate limits, linkage between accounts, and detection of networks rather than single posts.

The same machinery catches something more serious than spam: coordinated networks of fake or deceptive accounts run to manipulate opinion, sometimes by states. And one countermeasure isn't about removal at all: crowd-written context notes, ranked by an algorithm that only shows notes people who usually disagree both find helpful. This chapter covers sign-up abuse and account farms, vote rings, CAPTCHAs and proof of work, phone verification and SMS pumping, rate limits as abuse control, coordinated inauthentic behavior, bot labeling and crowd context. It extends `accounts` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) and the moderation tables from the playbook's [Trust & Safety](/docs/security/trust-and-safety). Votes and ranking belong to [Posts, Comments & Voting](/books/user-generated-platforms/posts-comments-and-voting#votes-and-karma); spam and fake listings on marketplaces belong to [Marketplace Fraud & Risk](/books/user-generated-platforms/marketplace-fraud#fake-listings-and-payment-diversion); relationship investment scams and crypto impersonation, which run on these same account farms, to [Crypto Investment Scams & Impersonation](/books/user-generated-platforms/crypto-investment-scams); bot APIs and developer rate limits to [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#rate-limits).

## How the Platforms Do It

| Platform | Scale of spam reported | What it describes |
| --- | --- | --- |
| **Bluesky** (2025) | 2.49 million spam reports; 370.14K accounts given a temporary "needs review" label; 3,619 accounts removed for influence operations | Detection by "heuristics, pattern matching, hash databases, and machine learning models," with lower-confidence flags sent to people |
| **Discord** (Mar 2025 to Mar 2026) | 47,832,832 accounts disabled for spam; 1,457,752 disabled under Platform Manipulation | Spam counted separately from all other enforcement; servers can require a verified phone to participate; AutoMod has spam and mention-spam rules |
| **Meta** | Blocks "millions of attempts to create fake accounts every day" before they count | Fake accounts and coordinated inauthentic behavior as separate policies; periodic adversarial threat reports |
| **Pinterest** (Jul to Dec 2025) | 5,877,185 (Q3) and 5,516,053 (Q4) spam accounts deactivated | Spam Pins deactivated by automation (100% and over 99% automated) |
| **Reddit** (Jul to Dec 2025) | 54% of 54,399,238 admin removals of posts and comments were spam; 76.7% of 605,570 community bans were for spam | Automated permanent bans for "repeated evasion of community or sitewide bans, persistent vote manipulation" and severe content; spam sanctions rose with "adversarial spam attacks" late in the year |

What these have in common is that the unit of enforcement is the account and the network, not the post. A spam post is removed by the thousand; the account that posted it, the accounts it shares a device or payment instrument with, and the community created to host it are what stop the next thousand. The platforms also report spam separately from everything else, because counting it in would swamp every other number.

## Account Farms

OWASP's catalog of automated threats names the pattern **Account Creation** (OAT-019): "Bulk account creation, and sometimes profile population, by using the application's account sign-up processes," with the accounts then used for content spam, laundering, malware and distorting reviews and surveys. The supply side is a market. Thomas, McCoy, Grier, Kolcz and Paxson (USENIX Security 2013) tracked the prices, availability and fraud of 27 merchants selling fraudulent Twitter accounts over ten months and found that in their active months these merchants "appeared responsible for registering 10–20% of all accounts later flagged for spam by Twitter," earning $127,000 to $459,000; a classifier the researchers built retroactively detected several million accounts sold through the market, 95% of which were disabled with Twitter's help.

Three things make an account worth more to an operator, and each is a detection signal:

- **Age.** Many defenses gate on account age (Discord's server verification levels include "must be registered on Discord for longer than 5 minutes"; Meta's Community Notes sets an account-age requirement for contributors), so farms register in bulk and let accounts sit. An old account with no history that suddenly becomes active is a different thing from an old account with a life.
- **Standing and karma.** Reputation from votes or past posts unlocks posting in stricter communities, so farms build it with low-effort posts and mutual voting before the account is used (below).
- **Verified contact points.** An email or phone check raises the price of an account, so farms buy verified ones, and a verification is worth only what the verifier checked ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#verification-and-badges)).

The defense is mostly at sign-up and in the first hours. Meta says its detection blocks millions of fake-account attempts a day and catches millions more, often within minutes of creation; blocked attempts never appear in its fake-account counts. My defaults:

- **Score every sign-up** on device, network, email domain and pattern, sign-up velocity from the same signals, and similarity to recent banned accounts, then allow, challenge or hold ([More Outcomes Than Yes and No](/docs/architecture/risk-scoring#more-outcomes-than-yes-and-no)). The challenge can be a CAPTCHA, proof of work or phone check (below), chosen by risk.
- **Hold new accounts' reach, not their sign-up.** New accounts can post, but links, mentions, direct messages to strangers, community creation and votes that count toward ranking unlock with age and good behavior. Reddit's 605,570 community bans, mostly spam and unmoderated communities, show why community creation is itself a gated privilege.
- **Link accounts, then act on the cluster.** Devices, payment instruments, phone numbers, sign-up networks and behavior link accounts to one operator ([Probabilistic Linkage](/docs/architecture/record-linkage#probabilistic-linkage)). A ban on one account in a confirmed link set is a decision about all of them; ban evasion is the same problem ([Account Standing](/books/user-generated-platforms/accounts-and-identity#account-standing)).
- **Hold, don't ban, when unsure.** Bluesky's "needs review" label is a temporary measure applied automatically to accounts that look like large-scale spam, as a holding measure that "minimizes user impact" while moderators decide. A hold that limits reach, reviewed within hours, costs a real person little and a spam run its timing.

## Vote Rings and Manipulation

Votes decide what's visible, so they're the target of every operator who wants reach. OWASP calls the general pattern **Skewing** (OAT-016): "Repeated link clicks, page requests or form submissions intended to alter some metric," whether the metric is public (likes, poll results) or internal. On a voting platform it takes three forms: one person voting from many accounts, a group coordinating votes (a vote ring), and paid voting services selling either.

Reddit treats it as sitewide enforcement: its H2 2025 transparency report lists "persistent vote manipulation" among the reasons for automated permanent bans. It also shows the old defense against operators learning what works. In 2014, when Reddit stopped showing separate upvote and downvote counts, the Daily Dot reported that admins had "manipulated the visible totals" as "an anti-spam measure," a practice users called **vote fuzzing**; a Reddit staff member said showing accurate counts would expose "our anti-cheating mechanisms." The principle outlives the feature: a voter whose votes have been discounted shouldn't be able to tell, or the operator tunes until they count.

How the counting works is [Posts, Comments & Voting](/books/user-generated-platforms/posts-comments-and-voting#how-to-build-it)'s (the votes table, scores, ranking); what this chapter adds is the detection and the effect:

- **Votes are kept, counting is a decision.** A suspect vote stays in the votes table with the voter and time; whether it counts toward ranking and karma is derived, so a cluster confirmed later can be discounted retroactively and a false positive restored.
- **Look at voters together, not votes alone.** Rings show up as accounts that vote on the same items within seconds of each other, vote on each other's posts far more than chance, share devices or networks, or arrive from the same external link. The unit is a cluster (below), not a vote.
- **Discount silently, act loudly on operators.** Discount suspect votes without telling the voter; ban the accounts and communities that run a ring once confirmed, with a notice like any other penalty ([Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons)).
- **Votes can carry their own warnings.** Reddit says it introduced a feature in 2025 to warn users who upvoted content later found to violate its violence policy, and saw warnings drop off quickly as users learned. A vote is an act a policy can address.

## CAPTCHAs and Proof of Work

A challenge is a moment of friction for an uncertain request: most people pass, most automation doesn't, or pays to. The current products differ in what they ask of the person:

| Product | How it challenges | What the server does |
| --- | --- | --- |
| **Anubis** (open source) | A SHA-256 proof-of-work challenge for browser-like clients, default difficulty five leading zeroes, then a signed cookie | Built to shield small sites from AI scrapers; its authors call it "a bit of a nuclear response" that can block good bots like the Internet Archive |
| **Cloudflare Turnstile** | "Non-interactive JavaScript challenges" including proof of work, proof of space and browser API probes; managed mode shows a checkbox only to riskier visitors | Siteverify required; each token valid 300 seconds and validated once (`timeout-or-duplicate` on replay); stated WCAG 2.2 AA conformance |
| **Friendly Captcha** | A proof-of-work puzzle solved in the background while the user fills the form, plus risk signals | Verify server-side; no image tasks, no cookies, WCAG 2.2 AA claimed |
| **hCaptcha** | Interactive challenges when needed; enterprise customers get a risk score | POST the token to `siteverify`; tokens are single-use and expire after 120 seconds by default |
| **Private Access Tokens** | No challenge: the device vendor (Apple, from iOS 16 and macOS 13) attests a real device and a token issuer signs a Privacy Pass token | The site learns only that a valid token was presented, not who or which device |
| **reCAPTCHA v3** (Google) | No interaction; returns a score from 0.0 ("very likely a bot") to 1.0 per named action | Verify the token server-side, check the action name, choose your own threshold (Google suggests 0.5 to start); tokens expire after two minutes |

**Proof of work** changes the economics without asking anything of a person: each request costs the client CPU time, trivial for one sign-up and expensive for a hundred thousand. It doesn't distinguish people from machines, only cheap from expensive, so it's the right tool for floods (sign-ups, scraping) and the wrong one for low-volume, high-value abuse. **Attestation** (Private Access Tokens) moves trust to the device vendor and leaves out people on unsupported devices, so it's a way to skip a challenge, never a requirement.

**Accessibility is the cost.** The W3C's note on CAPTCHA accessibility says traditional character-based CAPTCHAs "are largely inaccessible and insecure": screen readers can't process the image, distortion defeats people with low vision, and audio alternatives "impose a cognitive overload to all human users." Its advice: offer alternatives whenever an interactive challenge is used, prefer non-interactive methods, minimize how often anyone sees one, and "if a honeypot suffices, use a honeypot."

My rules:

- **Challenge by risk, verify on the server.** Most requests should never see a challenge; a token that isn't verified server-side, with its action, hostname and single-use check, protects nothing ([Card Testing](/books/payments/fraud-and-risk#card-testing) makes the same point for payment forms).
- **Challenge at the entrance.** Put the challenge on sign-up, first post, first link, first message to a stranger and burst voting, not on every page and not after a long form ([Fairness and Bots](/docs/architecture/admission-control#fairness-and-bots)).
- **Always offer a non-visual path,** and treat challenge failure rates by locale, device and assistive technology as a defect metric.
- **Record every challenge** issued and its outcome (below): a challenge is a decision with a false-positive rate like any other.

## Phone Verification and SMS Pumping

A verified phone number is the most common way to raise an account's price: Discord servers can require "a verified phone number" to participate, and Meta requires a verified phone or two-factor authentication to write Community Notes. Numbers cost money, are tied to a carrier and are scarcer than emails, which is the point. Virtual and recycled numbers weaken it, and line-type data (mobile, landline, VoIP) from the messaging provider helps decide which numbers count.

The phone field is also an attack surface. **SMS pumping** (artificially inflated traffic) is fraud where attackers "take advantage of a phone number input field" to trigger one-time codes or download links to blocks of numbers on a carrier that shares the termination revenue with them, knowingly or not. Twilio lists the signs: a spike of messages to "a block of adjacent numbers" on one carrier and verifications that never complete. Its mitigations are product features worth copying in any provider: blocking country prefixes you don't serve (geo permissions), sending only to mobile line types, and a fraud filter (Verify Fraud Guard) that blocks suspected destination prefixes, with levels that trade false positives (Twilio says under 1% at its default level and under 2% at its most aggressive) for coverage.

My defaults: put the phone step behind the sign-up risk score and a challenge, never on an anonymous endpoint; rate-limit code sends per number, per prefix, per account and per network; allow-list the countries you serve; alert on conversion rate by country and prefix; and budget SMS spend so a pumping attack hits a ceiling, not the invoice. Carrier registration and consent rules for texting are in [Texting: The Carrier Layer](/docs/compliance/consumer-contact#texting-the-carrier-layer).

## Rate Limits as Abuse Control

Rate limits are usually framed as capacity protection; on a user-generated platform they're also policy. OWASP's API6 risk, [Unrestricted Access to Sensitive Business Flows](/docs/security/api-security#api6-2023-unrestricted-access-to-sensitive-business-flows), is exactly sign-ups, posts, votes, follows and messages at machine speed. Limits keyed on the account, the device, the payment instrument and the community, not just the IP, are what make a farm slow ([What to Key On](/docs/requests/rate-limiting#what-to-key-on)).

Discord's public limits show both kinds. Every bot can make "up to 50 requests per second," with per-route buckets reported in headers that clients must read rather than hard-code. And it punishes probing: an IP that makes too many invalid requests (responses of 401, 403 or 429), "currently, this limit is 10,000 per 10 minutes," is "automatically and temporarily restricted from accessing the Discord API." That second rule is abuse control: a client hammering endpoints it isn't allowed to use is either broken or enumerating, and either way it should stop. For user actions the useful limits are behavioral (new accounts' links per hour, messages to non-contacts per day, mentions per message: Discord AutoMod caps unique mentions at a configurable limit up to 50 and can detect mention raids), and exceeding them should hold or challenge, not just return 429.

## Coordinated Inauthentic Behavior

Some networks aren't selling anything. Meta's Community Standards define **inauthentic behavior** as deception "performed by a network of inauthentic assets," and **coordinated inauthentic behavior (CIB)** as "particularly sophisticated forms of Inauthentic Behavior where false identities are central to the operation"; when the operators are outside the country they target, it's **foreign interference**. Enforcement is against the network, not the content: Meta removes "the fake accounts, Pages, Groups, or other Meta assets directly involved in the operation," whatever they posted, and publishes semiannual adversarial threat reports describing each network it took down. Bluesky removed 3,619 accounts in 2025 for involvement in suspected influence operations, most linked to foreign state-aligned actors, including likely Russia-based ones; Discord disabled 1,457,752 accounts under its Platform Manipulation category in its latest annual report.

What makes CIB different from spam is that the content can be indistinguishable from real speech, so the evidence is behavioral: accounts created together, shared infrastructure, synchronized posting, recycled personas, coordination with off-platform assets, and deception about who is behind them. That changes the workflow:

- **The cluster is the case.** An investigation collects accounts, communities, domains and content into one cluster with evidence per member, and the decision (remove all, remove operators and monitor amplifiers, take no action) is made once for the cluster ([Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible) for the linkage discipline).
- **Attribution is a separate, cautious claim.** Removing a network for deceptive behavior doesn't require knowing who ran it; publishing "likely Russia-based" does, and the evidence and confidence behind any attribution belong in the record.
- **Disclosure is part of the work.** Threat reports, researcher access and regulators' questions all draw on the cluster records. For the largest platforms in the EU this is law: DSA Article 34(2) requires very large platforms' systemic risk assessments to consider "intentional manipulation of their service, including by inauthentic use or automated exploitation of the service." [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#very-large-online-platforms) covers the risk assessment duty.

**Signals cross platforms.** A network removed on one service usually has accounts on others. The Tech Coalition's **Lantern** program is the established model for sharing: participating companies (41 as of October 2026) share content signals (hashes, URLs, keywords and codewords) and incident signals about child sexual exploitation and abuse, each company reviews what it receives against its own policies ("Lantern does not facilitate automated enforcement actions"), and the program reports 2,047,982 signals shared and 353,806 enforcement actions from 2023 through 2025. Lantern is scoped to child safety ([Child Safety](/books/user-generated-platforms/child-safety#how-the-platforms-do-it)), but its design (vetted members, typed signals, review before action, human rights safeguards) is the template for any cross-platform signal exchange, including spam and influence operations.

## Bot Labeling

Not every bot is abuse. Platforms run on helpful automation (moderation bots, alert accounts, feeds), and the problem is the bot that pretends to be a person. The fix is a label the platform controls:

- **Discord** marks every account that belongs to an OAuth2 application with a `bot` flag on the user object and gives reviewed bots a `VERIFIED_BOT` flag, so clients render the bot tag; a bot can't hide it.
- **Twitter** began testing an "Automated" profile label in September 2021, MediaNama reported, with over 500 developer accounts, aimed at "good bots" such as vaccine-appointment finders; it was explicitly not a way to flag malicious bots pretending to be people.

The law now asks for disclosure in some cases. California's bot disclosure law (Business and Professions Code 17940 to 17943, from SB 1001, operative 1 July 2019) makes it unlawful to use a bot to communicate with a person in California "with the intent to mislead the other person about its artificial identity" in order to sell goods or services or "to influence a vote in an election"; disclosure must be "clear, conspicuous, and reasonably designed" to inform people they're talking to a bot. It defines a bot as "an automated online account where all or substantially all of the actions or posts" "are not the result of a person," and it expressly "does not impose a duty on service providers of online platforms." The duty sits on the bot's operator; the platform's role is to make honest disclosure easy. In the EU, AI Act Article 50(1), applicable from August 2, 2026, requires providers to ensure that AI systems "intended to interact directly with natural persons" are designed so people are informed they're dealing with an AI, which reaches AI-driven accounts and chat features; [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#labeling-ai-generated-content) covers AI-generated content labels.

My default: an `automated` declaration on the account, set by the operator or by the platform, rendered by every client, tied to the human account responsible for it; undeclared automation found by detection is a violation in itself (inauthentic behavior), declared automation is just an account with different rate limits ([Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#verification-and-badges) for badges and what backs them).

## Crowd Context

Removal isn't the only answer to misleading content. **Community Notes** (launched on Twitter as Birdwatch) lets contributors attach context to a post and rate each other's notes, and shows a note only when people who usually disagree both rate it helpful. Wojcik and colleagues describe the algorithm (arXiv:2210.15723):

- **The model.** Each rating (helpful 1, not helpful 0) is predicted as a global intercept plus a rater intercept (how lenient the rater is) plus a note intercept plus the dot product of a rater factor and a note factor. The factors absorb viewpoint: a note liked by one side only is explained by its factor. The **note intercept** is the helpfulness left over that viewpoint doesn't explain, and it's the note's score.
- **Bridging by regularization.** Intercepts are regularized five times more heavily than factors (0.15 against 0.03), so the model explains as much as it can with viewpoint before crediting a note's intercept; a note earns a high intercept only by being rated helpful by raters with diverse factors. The paper used one-dimensional factors.
- **Thresholds.** A note was "currently rated helpful" with an intercept of at least 0.40, "not helpful" at or below -0.08, and "needs more ratings" between; notes needed at least 5 ratings and raters at least 10 to be scored.
- **Rater quality.** A first pass assigns provisional labels; each rater gets a helpfulness score from ratings made before a note's status was published, measured against those labels; low-scoring raters are filtered out and the factorization runs again. Counting only early ratings stops raters from copying published outcomes to build a score.
- **Evidence.** In survey experiments, notes selected this way reduced agreement with misleading claims and were rated helpful across party lines better than a supermajority vote (the earlier Birdwatch rule needed 84% helpful ratings), and on Twitter people who saw bridging-selected notes were "significantly less likely to reshare" the post.

Others have adopted it. **Meta** ended US third-party fact-checking on April 7, 2025 and began Community Notes on Facebook, Instagram and Threads, saying "Initially we will use X's open source algorithm"; contributors must be over 18 with an account in good standing, meeting account-age requirements and with a verified phone or two-factor authentication; notes are capped at 500 characters with a supporting link, aren't allowed on ads at launch, and don't reduce distribution. **YouTube** began piloting notes in June 2024 on mobile, in the US and in English, with invited contributors in good standing and a bridging-based algorithm, initially with third-party evaluators rating helpfulness.

Crowd context sits next to spam in this chapter for a reason: it's a voting system, and every vote-ring defense above applies to it. Contributor gates (account age, a verified phone, good standing), rater quality filters, and detection of rating clusters are what keep a bridging algorithm from being captured by a coordinated group that simulates disagreement.

## How to Build It

The chapter adds linked accounts, challenges, clusters of coordinated accounts and crowd context notes to the core model; votes stay in [Posts, Comments & Voting](/books/user-generated-platforms/posts-comments-and-voting#how-to-build-it)'s votes table, and sign-up and account scoring use the playbook's [decision record](/docs/architecture/risk-scoring#the-decision-record):

```sql
ALTER TABLE accounts
  ADD COLUMN automated             BOOLEAN NOT NULL DEFAULT FALSE,  -- declared or found bot
  ADD COLUMN automation_operator_id UUID REFERENCES accounts (id),   -- the human responsible
  ADD COLUMN automation_declared_by TEXT CHECK (automation_declared_by IN ('operator',
                                      'platform')),
  ADD CONSTRAINT accounts_automation_check
    CHECK (automated = (automation_declared_by IS NOT NULL));

CREATE TABLE account_links (             -- evidence that two accounts share an operator
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  account_a_id UUID NOT NULL REFERENCES accounts (id),
  account_b_id UUID NOT NULL REFERENCES accounts (id),
  signal       TEXT NOT NULL CHECK (signal IN ('device', 'payment_instrument', 'phone',
                 'email_pattern', 'network', 'identity_document', 'behavior',
                 'admitted')),
  strength     NUMERIC(4, 3) NOT NULL CHECK (strength BETWEEN 0 AND 1),
  evidence_ref TEXT NOT NULL,            -- the evidence store, not the raw identifier
  source       TEXT NOT NULL CHECK (source IN ('rule', 'model', 'investigator')),
  status       TEXT NOT NULL CHECK (status IN ('suspected', 'confirmed', 'dismissed')),
  reviewed_by  UUID REFERENCES accounts (id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (account_a_id < account_b_id),   -- one row per pair and signal
  UNIQUE (account_a_id, account_b_id, signal)
);

CREATE TABLE challenges (                -- every CAPTCHA, proof of work and phone check
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID REFERENCES accounts (id),  -- null before the account exists
  session_ref     TEXT NOT NULL,
  trigger         TEXT NOT NULL CHECK (trigger IN ('signup', 'login', 'first_post',
                    'link', 'message', 'vote_burst', 'community_create', 'api')),
  kind            TEXT NOT NULL CHECK (kind IN ('captcha', 'proof_of_work',
                    'private_access_token', 'phone_sms', 'phone_voice', 'email')),
  provider        TEXT NOT NULL,         -- 'recaptcha', 'hcaptcha', 'turnstile', 'own', ...
  risk_score      NUMERIC(6, 5),         -- why it was issued
  provider_score  NUMERIC(6, 5),         -- what the provider returned, if a score
  phone_country   CHAR(2),               -- phone checks: never the number itself
  phone_line_type TEXT CHECK (phone_line_type IN ('mobile', 'landline', 'voip',
                    'unknown')),
  cost_minor      BIGINT,                -- SMS or voice cost, in minor units
  currency        CHAR(3),
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  result          TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('pending', 'passed',
                    'failed', 'abandoned', 'expired', 'replayed', 'blocked')),
  assistive_path  BOOLEAN NOT NULL DEFAULT FALSE,  -- the non-visual alternative was used
  CHECK ((kind LIKE 'phone%') = (phone_country IS NOT NULL))
);

CREATE TABLE inauthentic_clusters (      -- a network investigated and decided as one
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  kind             TEXT NOT NULL CHECK (kind IN ('spam_farm', 'vote_ring',
                     'ban_evasion', 'coordinated_inauthentic_behavior',
                     'note_rating_ring')),
  detected_by      TEXT NOT NULL CHECK (detected_by IN ('rule', 'model', 'investigator',
                     'external_signal', 'user_reports')),
  status           TEXT NOT NULL CHECK (status IN ('investigating', 'actioned',
                     'monitoring', 'dismissed')),
  attribution      TEXT,                 -- who is believed to run it, if stated at all
  attribution_confidence TEXT CHECK (attribution_confidence IN ('low', 'medium', 'high')),
  case_id          UUID REFERENCES moderation_cases (id),  -- the decision for the cluster
  first_seen_at    TIMESTAMPTZ NOT NULL,
  actioned_at      TIMESTAMPTZ,
  disclosed_in     TEXT,                 -- the threat or transparency report that named it
  CHECK ((attribution IS NULL) = (attribution_confidence IS NULL))
);

CREATE TABLE cluster_members (
  cluster_id   UUID NOT NULL REFERENCES inauthentic_clusters (id),
  subject_type TEXT NOT NULL CHECK (subject_type IN ('account', 'community',
                 'content_item', 'domain')),
  subject_id   UUID NOT NULL,            -- domains get an id in the evidence store
  role         TEXT NOT NULL CHECK (role IN ('operator', 'amplifier', 'asset')),
  evidence_ref TEXT NOT NULL,
  added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at   TIMESTAMPTZ,              -- found not to belong
  PRIMARY KEY (cluster_id, subject_type, subject_id)
);

CREATE TABLE context_notes (             -- crowd context attached to a content item
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  content_item_id     UUID NOT NULL REFERENCES content_items (id),
  content_revision_id UUID NOT NULL REFERENCES content_revisions (id),  -- what it annotates
  author_account_id   UUID NOT NULL REFERENCES accounts (id),
  body                TEXT NOT NULL CHECK (char_length(body) <= 500),
  source_urls         TEXT[] NOT NULL CHECK (cardinality(source_urls) >= 1),
  language            TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'needs_more_ratings' CHECK (status IN
                        ('needs_more_ratings', 'helpful', 'not_helpful', 'withdrawn')),
  intercept           NUMERIC(6, 4),     -- the note's bridging score, last run
  factor              NUMERIC(6, 4),     -- its viewpoint factor, last run
  scoring_version     TEXT,              -- algorithm and thresholds that set the status
  scored_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE note_ratings (
  note_id          UUID NOT NULL REFERENCES context_notes (id),
  rater_account_id UUID NOT NULL REFERENCES accounts (id),
  rating           TEXT NOT NULL CHECK (rating IN ('helpful', 'somewhat_helpful',
                     'not_helpful')),
  reasons          TEXT[],               -- the multiple-choice reasons, if given
  rated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rated_before_status BOOLEAN NOT NULL,  -- made before the note's status was public
  PRIMARY KEY (note_id, rater_account_id)
);
```

Notes on the sketch:

- **Links are evidence, not merges.** `account_links` records why two accounts look like one operator, with strength and status; nothing is merged, and a dismissed link stays as a record that someone looked. Raw device IDs, phone numbers and card fingerprints live in the evidence store under their own retention and access rules; the link holds a reference. The sign-up and account risk scores themselves are decision records from [Automated Risk Decisions](/docs/architecture/risk-scoring#the-decision-record).
- **Challenges are measured like models.** Pass, fail, abandon and assistive-path rates by trigger, provider, country and device show both what the challenge stops and whom it wrongly stops; `cost_minor` on phone checks feeds the SMS budget and pumping alerts. The phone number itself isn't stored here, only its country and line type.
- **A cluster is decided once.** `inauthentic_clusters.case_id` points at one moderation case whose decision applies to every current member; penalties for each account are still rows in `penalties` linked to that decision, so each account gets a notice and an appeal, and a member removed from the cluster has its penalty reviewed.
- **Votes are discounted by query.** [Posts, Comments & Voting](/books/user-generated-platforms/posts-comments-and-voting#how-to-build-it)'s score computation excludes votes from accounts that are members of an actioned `vote_ring` or `spam_farm` cluster, from the moment of the action backwards; removing a member restores its votes on the next recompute. The votes table itself isn't changed.
- **Automation is an account property.** `accounts.automated` with an operator and who declared it drives the bot label in every client, separate rate limits, and exclusion from Community Notes contribution; undeclared automation found by detection sets it with `automation_declared_by = 'platform'` and opens a case.
- **Notes score in batches.** A scoring job runs the bridging factorization over `note_ratings` (filtered to eligible raters), writes each note's `intercept`, `factor`, `status` and `scoring_version`, and publishes status changes. Contributor eligibility (account age, verified phone or second factor, standing) is checked at write time from `verifications` and the standing query.
- **Events:** `signup.challenged`, `challenge.completed`, `account_link.confirmed`, `cluster.actioned`, `cluster.disclosed`, `account.automation_set`, `note.status_changed` and `note.rated` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to ranking, notifications, transparency counts and the trust and safety data warehouse.

## Auditing

- **Every challenge and its outcome,** so a complaint that "I can't sign up" or an accessibility audit can see what was asked, of whom, and how often it failed for people using the alternative path.
- **Every link and cluster decision,** with the evidence references, who reviewed it, and what happened to each member; a cluster action affects many accounts at once and is the decision most likely to be challenged.
- **Attribution claims,** with the evidence and confidence behind anything published about who ran a network.
- **Discounted votes,** reproducible from cluster membership and action times, so a creator who asks why a post lost score can be answered.
- **Note scoring runs:** algorithm version, thresholds, eligible raters and every status change, so a published note's status can be explained and a manipulation attempt traced.
- **SMS spend and blocks** by country and prefix, which is both a fraud record and the evidence for a dispute with a messaging provider.

## What This Means for the System You Build

- **Price accounts, don't just block them:** score sign-ups, challenge by risk, and unlock reach (links, messages, votes that count, community creation) with age and behavior.
- **Hold when unsure,** with a temporary label that limits reach and a fast review, rather than banning on a weak signal.
- **Link accounts with recorded evidence** and decide networks as clusters, with a notice and appeal for every member.
- **Keep votes, decide whether they count,** and discount suspect votes silently and reversibly.
- **Verify every challenge on the server,** offer a non-visual path, and measure challenge failure as a defect rate.
- **Guard the phone field** against SMS pumping with country allow-lists, line-type checks, per-prefix limits and a spend ceiling.
- **Key rate limits on accounts, devices and communities,** and treat floods of invalid requests as probing.
- **Label automation as an account property,** tied to a responsible human, and treat undeclared automation as inauthentic behavior.
- **Use bridging ranking for crowd context,** and protect the raters with the same anti-manipulation defenses as votes.
- **Share signals across platforms** the way Lantern does: typed, vetted, reviewed before action.

## References

**Statutes and regulations**

- [California Business and Professions Code 17940](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=17940), definitions of bot and online platform, the 10 million monthly US visitor threshold
- [California Business and Professions Code 17941](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=17941), unlawful undisclosed bots for sales or votes, clear and conspicuous disclosure
- [California Business and Professions Code 17942](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=17942), no duty on online platform service providers
- [Regulation (EU) 2024/1689 (AI Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1689), Article 50(1), disclosure for AI systems intended to interact directly with natural persons, and Article 113, application from 2 August 2026
- [Regulation (EU) 2022/2065 (Digital Services Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065), Article 34(2), intentional manipulation by inauthentic use or automated exploitation

**Platforms**

- [Reddit: Transparency Report, July to December 2025](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), spam share of admin removals, community bans for spam, automated bans for vote manipulation, the upvote warning feature (Reddit's own PDF; copy hosted by TorrentFreak, as redditinc.com blocks automated access)
- [Discord: Transparency Report, March 2025 to March 2026](https://cdn.discordapp.com/assets/transparency-reports/Discord-Transparency-Report-2026-Updated.pdf), spam accounts disabled, Platform Manipulation disables
- [Discord: Rate Limits](https://docs.discord.com/developers/topics/rate-limits), 50 requests per second per bot, headers, the invalid request limit and temporary restriction
- [Discord: Guild resource](https://docs.discord.com/developers/resources/guild), server verification levels including account age and verified phone
- [Discord: Auto Moderation](https://docs.discord.com/developers/resources/auto-moderation), spam and mention-spam triggers, mention raid protection, the 50-mention ceiling
- [Discord: User resource](https://docs.discord.com/developers/resources/user), the bot field and the verified bot flag
- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), spam reports, "needs review" labels, detection methods, influence-operation removals
- [Pinterest: Transparency Report](https://policy.pinterest.com/en/transparency-report), spam account deactivations and automated spam enforcement for H2 2025
- [Meta: Inauthentic Behavior](https://transparency.meta.com/policies/community-standards/inauthentic-behavior/), definitions of inauthentic behavior, coordinated inauthentic behavior and foreign interference, removal of network assets
- [Meta: Threat reporting](https://transparency.meta.com/metasecurity/threat-reporting), the index of adversarial threat reports
- [Meta: Fake accounts](https://transparency.meta.com/reports/community-standards-enforcement/fake-accounts/facebook/), the fake account definition and creation attempts blocked daily
- [Meta: Testing begins for Community Notes](https://about.fb.com/news/2025/03/testing-begins-community-notes-facebook-instagram-threads/), the end of US fact-checking, X's algorithm, contributor requirements, limits and no distribution penalty
- [YouTube: New ways to offer viewers more context](https://blog.youtube/news-and-events/new-ways-to-offer-viewers-more-context/), the June 2024 notes pilot, eligibility and bridging
- [MediaNama: Twitter tests labels for automated accounts](https://www.medianama.com/2021/09/223-twitter-bot-account-label/), the September 2021 "Automated" label test, over 500 developer accounts, good bots only (reported; the announcement was on X, which blocks automated access)
- [Daily Dot: Reddit hides vote counts](https://dailydot.com/news/reddit-vote-count-percent-like/), vote fuzzing as an anti-spam measure and the June 2014 change (reported, 19 June 2014)

**Vendors and programs**

- [Google: reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3), scores, actions, the 0.5 starting threshold, two-minute token expiry
- [hCaptcha: Developer guide](https://docs.hcaptcha.com/), siteverify, single-use tokens, 120-second expiry, enterprise risk scores
- [Cloudflare: Turnstile](https://developers.cloudflare.com/turnstile/), non-interactive challenges, widget modes, WCAG 2.2 AA
- [Cloudflare: Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), 300-second validity, single validation, replay errors
- [Cloudflare: Eliminating CAPTCHAs on iPhones and Macs](https://blog.cloudflare.com/eliminating-captchas-on-iphones-and-macs-using-new-standard/), Private Access Tokens, Apple as attester, Privacy Pass
- [Friendly Captcha](https://friendlycaptcha.com/), background proof of work, no image tasks, privacy and accessibility claims
- [Anubis: How Anubis works](https://github.com/TecharoHQ/anubis/blob/main/docs/docs/design/how-anubis-works.mdx), SHA-256 proof of work and default difficulty
- [Anubis](https://github.com/TecharoHQ/anubis), purpose against AI scrapers and the good-bot trade-off
- [Twilio: What is SMS pumping fraud](https://www.twilio.com/docs/glossary/what-is-sms-pumping-fraud), the mechanism, warning signs and mitigations
- [Twilio: Verify Fraud Guard](https://www.twilio.com/docs/verify/preventing-toll-fraud/sms-fraud-guard), prefix blocking, protection levels and false positive rates
- [Tech Coalition: Lantern](https://www.technologycoalition.org/lantern), signal types, participants, review before action, signals and actions through 2025

**Reference**

- [OWASP: OAT-019 Account Creation](https://owasp.github.io/www-project-automated-threats-to-web-applications/assets/oats/EN/OAT-019_Account_Creation), bulk account creation and its uses
- [OWASP: OAT-016 Skewing](https://owasp.github.io/www-project-automated-threats-to-web-applications/assets/oats/EN/OAT-016_Skewing), automated actions to alter a metric
- [Thomas, McCoy, Grier, Kolcz and Paxson: Trafficking Fraudulent Accounts](https://research.google/pubs/trafficking-fraudulent-accounts-the-role-of-the-underground-market-in-twitter-spam-and-abuse/), USENIX Security 2013, account merchants, share of spam accounts, revenue, 95% disabled
- [W3C: Inaccessibility of CAPTCHA](https://www.w3.org/TR/turingtest/), who CAPTCHAs exclude, audio problems, recommended alternatives
- [Wojcik et al.: Birdwatch: Crowd Wisdom and Bridging Algorithms](https://arxiv.org/abs/2210.15723), the matrix factorization model, regularization, thresholds, rater filtering and effects on understanding and resharing
