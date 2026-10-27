+++
title = "Moderation at Scale"
description = "How platforms review billions of items: classifiers as prioritizers, vendors, outsourced review, reviewer wellbeing, prevalence sampling and language coverage."
category = "User-Generated Platforms Industry"
order = 1834
part = "Trust and Safety"
tags = ["trust-and-safety", "content-moderation", "classifiers", "vendors", "wellbeing", "metrics"]
+++

A platform with millions of users publishes more in an hour than any team could read in a year, and every one of those items can be reported, matched, scored, queued, judged, appealed and counted. Moderation at that scale is an operations business inside a software business: a pipeline of machines that sort and people who decide, run partly by the platform's own staff, partly by vendors and outsourcing firms in other countries, and partly by volunteers who never signed an employment contract. Its outputs are decisions; its costs are compute, labor and the mental health of the people who look at the worst of it; and its quality shows up in two numbers the public sees, how often a decision is reversed on appeal and how often a user still runs into something that should have been removed.

The general machinery (policy as a specification, reports grouped into cases, priority by harm, detection bands, penalty ladders, notices, appeals and the decision audit) is the playbook's [Trust & Safety](/docs/security/trust-and-safety), and this chapter doesn't repeat it. What it adds is the industry layer on top: the scale the platforms report, how classifiers are used to order work rather than to decide it, who sells the detection and the review labor, what the settlements and studies say about protecting reviewers, how prevalence is measured by sampling, and how far language coverage reaches. The tables extend the moderation model in [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model). Spam and inauthentic accounts are [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots); hash lists are [Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#hash-matching); deeper material on AI models and their error budgets is [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#ai-moderation-and-error-budgets).

## How the Platforms Do It

The transparency reports are the only public view of moderation at scale, and each platform counts differently. Read side by side, they show the same shape:

| Platform, period | Volume | Who acts | Automation | Appeals |
| --- | --- | --- | --- | --- |
| **Reddit**, Jul to Dec 2025 | 2.2 billion posts and comments created; 154,198,211 removed | 52.7% of removals by community moderators, 44.7% by Reddit admins | 68.6% of moderator removals handled by automated systems such as AutoModerator; admin figures include internal automated tooling | 481,416 appeals of content sanctions (20% of them) and 499,515 of account sanctions (4.4%); granted appeals down 66.6%; "appeals are always human-reviewed" |
| **Pinterest**, Jul to Dec 2025 | 134.9 million (Q3) and 157.5 million (Q4) Pins deactivated for adult sexual content | Staff reviewers and automation | Each policy split into manual, hybrid and automated; adult content over 99% hybrid, spam Pins about 100% automated | Reported per policy as upheld and reversed |
| **Bluesky**, 2025 | 9.97 million user reports from 1.24 million users; 2,446,334 takedowns; 16.49 million labels | Bluesky's moderation service, 24/7, plus independent labelers users choose | 95.34% of labels from automated systems; 2.54 million automated flags | Human reviewers handle all appeals |
| **Discord**, Mar 2025 to Mar 2026 | 6,315,202 actions taken on accounts and 3,243,494 accounts disabled, excluding spam; 47,832,832 spam accounts disabled | Discord's safety team, plus server moderators with AutoMod | Not split in the report | Reported per category with grant rates |

Three patterns hold across them:

- **Most of the work is automated and most removals aren't sitewide.** Over half of Reddit's removals are by community moderators, two-thirds of those by automation the moderators configured; Bluesky's labels are 95% automatic. The platform's own staff see a minority of decisions, chosen by priority. [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation) covers the community side; this chapter covers the platform's.
- **"Automated" hides a hybrid.** Pinterest defines a hybrid action as one where a reviewer decides a Pin violates policy and automated systems then extend that decision to matching Pins, which is how 157 million Pins can be deactivated in a quarter with a human behind each decision. A report that says "automated" without that split overstates what the machines decided alone. The [Gaming](/books/gaming/player-behavior#automation-at-scale) volume walks through Xbox's numbers, where the same pattern holds.
- **Actions are not accounts.** Discord reports actions taken and accounts disabled separately because a warning, a temporary restriction and a ban are all actions, and one account can collect several. Any count needs its unit stated; [Transparency Reporting](/books/user-generated-platforms/transparency-reporting#what-the-voluntary-reports-count) covers what each platform counts.

Bluesky also shows a different architecture: every user subscribes by default to Bluesky's own moderation service, can add independent labelers like following an account, and configures how each label hides, blurs or filters content. Moderation becomes a set of signal providers whose outputs the client combines, which [Federation & Open Protocols](/books/user-generated-platforms/federation#labels-and-stackable-moderation) covers in depth.

## Classifiers as Prioritizers

A classifier answers "how likely is this to violate policy X," never "does it." The most explicit public statement of the right use comes from Google's Content Safety API, which classifies previously unseen images and video for child sexual abuse material: it "issues a prioritization recommendation," partners use the priority to order manual review, and "Partners must conduct their own review in order to determine whether they should take action on the content." Google recommends placing it immediately before manual review, alongside hash matching. That's the general design: hashes find copies of what's already judged and can act alone ([Hash Matching](/books/user-generated-platforms/child-safety#hash-matching)); classifiers find new things and order the queue.

The playbook's [Automated Detection, Human Review](/docs/security/trust-and-safety#automated-detection-human-review) sets the band structure: above an upper threshold the system acts, between the thresholds a person reviews, below the lower one nothing happens, with bands set per category. At platform scale three refinements matter:

- **Bands per category, per surface, per action.** The same spam score can hide a comment automatically and still need a person before it suspends an account. A threshold belongs to a (model, category, action) triple, and it changes over time, so it's versioned data with an effective date, not a constant in code ([Rules as Data](/docs/architecture/rules-as-data)).
- **Rank the middle band by expected harm, not score alone.** A 0.7 on a child-safety model outranks a 0.95 on a profanity model. Priority is severity times probability times reach (how many people will see it in the next hour), then age, which is the [Reports and Queues](/docs/security/trust-and-safety#reports-and-queues) priority with the classifier as one input.
- **Log every score, not just the ones that acted.** Below-threshold scores are the denominator for precision and recall, the population for threshold changes, and evidence when a regulator asks why something stayed up.

![Classifier bands for one model, category and action. A classifier result, with every score logged as acted, queued or passed, enters a stack of three bands per category. Scores at or above act_at go to automated action (remove, hide, label or hold), and with no act threshold the model never acts alone; scores from review_at up to act_at, the accented band, go to a person, from a queue ranked by severity times probability times reach, then age; scores below review_at are passed and logged as the denominator. From automated action, a daily sample of automated decisions reviewed by people feeds a check of false positives against the error budget, and a dashed arrow back to the bands narrows the band or sends the category back to review. A legend marks the band a person sees and a band change, reviewed and dated.](/diagrams/ugp-moderation-at-scale-bands.svg "A classifier sets the order of work, not the verdict: the middle band goes to people, ranked by expected harm. The error budget, measured from daily samples, decides how wide the band that acts alone may be.")

**Error budgets.** Every auto-action band produces wrongful removals at some rate. My rule: set, per category, the false-positive rate the platform accepts for automated action (an error budget), measure it from daily samples of automated decisions reviewed by people, and narrow the band or send the category back to human review when the measured rate exceeds the budget. The appeal reversal rate is a lagging second signal: Reddit attributes a 66.6% fall in granted appeals to improved precision of its automated systems, which is the right reading only because every appeal is reviewed by a person. Regulation now asks for the same numbers: DSA Article 15(1)(e) requires transparency reports to describe "any use made of automated means for the purpose of content moderation" with "indicators of the accuracy and the possible rate of error," and very large platforms must break those indicators down by official language (Article 42(2)(c)). How models are evaluated, drift and fail in more depth is [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#ai-moderation-and-error-budgets); the decision record each automated action needs is [The Decision Record](/docs/architecture/risk-scoring#the-decision-record).

**People decide what reaches accounts.** DSA Article 20(6) requires complaint decisions to be "taken under the supervision of appropriately qualified staff, and not solely on the basis of automated means." My default goes further than appeals: automation may remove, blur, label or hold content, and may restrict an account only for categories (spam, known-hash matches) where the measured error rate supports it; everything else that touches an account goes through a person.

## Vendors

Detection and workflow are bought as often as built. The suppliers, as their own pages describe them (the [Platform Landscape](/books/user-generated-platforms/platform-landscape#trust-and-safety) table lists the hash programs and the history of each company):

| Vendor | What it sells | How it describes the approach |
| --- | --- | --- |
| **Hive** | Visual, text and audio moderation models, CSAM detection, a vision language model | Categories including NSFW, hate, violence and CSAM; "Human level accuracy, machine level efficiency"; its site now says "Hive is now Deploy" |
| **Alice (formerly ActiveFence)** | Trust and safety for user-generated and AI-generated content, adversarial intelligence, AI safety | An in-house research network ("Hundreds of researchers, billions of examples") collecting real attacks |
| **Community Sift** (Microsoft) | Text, image and video classification for chat and user content | "Custom risk sliders" over curated topics, escalation of "the toughest cases to moderators," 22 premium languages, optional image blurring that "protects moderators' wellbeing" |
| **Safer** (Thorn) | Hashing and classifiers for child sexual abuse material and exploitation text | Models trained on abuse data from trusted sources; covered in [Child Safety](/books/user-generated-platforms/child-safety#hash-matching) |
| **Google Content Safety API** | A priority score for unseen abuse imagery | Free to approved partners; review required before action |
| **Checkstep** | A moderation platform: policy management, scanning, queues, appeals, transparency | An "AI marketplace" to test and switch between models (it names AWS, OpenAI, Amazon Rekognition and Modulate), automatic filing of statements of reasons to the DSA database, human-in-the-loop review |
| **Cinder** | A trust and safety operations platform | Policies turned into "agentic workflows," edge cases escalated to people with a suggested action, and the ability to "benchmark human reviewers and agents against the same labeled data" |

Two kinds of product sit in that table, and they're bought for different reasons. **Signal vendors** (Hive, Community Sift, Safer, Google) return scores or matches; changing one changes a signal. **Workflow vendors** (Checkstep, Cinder) hold the queues, policies, decisions and regulatory filings; changing one is a migration of the moderation system of record. My default: buy signals freely, and keep the system of record (cases, decisions, thresholds, penalties) in your own database even when a workflow vendor runs the screens, so the audit trail and the transparency report survive a vendor change ([Build, Buy or Rent](/books/user-generated-platforms/platform-landscape#build-buy-or-rent)).

**Evaluate in shadow mode.** Vendor accuracy claims describe the vendor's data, not yours. Run a candidate on live traffic with its outputs logged and ignored, compare against a labeled sample of your own decisions per category and per language for a few weeks, then let it act in one category at a time ([Changing Rules and Models Safely](/docs/architecture/risk-scoring#changing-rules-and-models-safely)). The [Gaming](/books/gaming/player-behavior#automation-at-scale) volume makes the same point for game studios. Check what the vendor keeps: a moderation vendor receives users' private content, so retention, training rights on your data, sub-processors and breach notice belong in the contract.

## Outsourced Review

Most human review at the largest platforms is done by outsourcing firms (business process outsourcing, BPO), not by the platform's employees. Public filings and court records show the model:

- **TaskUs** reports Trust & Safety as 26% of its 2025 service revenue of $1,183.5 million, split into content moderation (reviewing user and advertiser content against guidelines, laws and policies) and financial crime and compliance. Meta was 26% of its revenue. It had about 65,500 people across 31 sites in 13 countries, 58% of them in the Philippines, delivering in more than 30 languages, and it warns investors that the long-term mental health effects of the work are unknown and that it "may lead to stress disorders and may create liabilities for us."
- **Teleperformance** finalized its acquisition of Majorel in late 2023 (Majorel was delisted on December 11, 2023), and named content moderation among the sectors with robust momentum in its 2023 results.
- **Accenture, Cognizant, Genpact and ProUnlimited** were the contractors named in coverage of the Scola settlement below, whose class covered moderators employed by Facebook's vendors.
- **Sama** ran Meta's content review hub in Nairobi and announced in January 2023 that it would end content moderation in March 2023 and focus on data labeling, cutting about 200 staff and offering 12 months of mental health support. Former moderators sued Meta, Sama and Majorel in Kenya over dismissals and working conditions, seeking $1.6 billion. On September 20, 2024 Kenya's Court of Appeal dismissed Meta's appeals and upheld the labor court's rulings that Meta can be sued in Kenya; the merits were left for trial. I found no reported judgment on the merits as of October 2026.

What the model means for the platform:

- **The platform still owns the decision.** The policy, the internal guidelines, the queue routing, the decision record and the notice are the platform's; the vendor supplies reviewers. Reviewers act in the platform's tool under the platform's policy version, and each decision records the reviewer, their employer and site (below), because a regulator, a court or an appeal will ask who decided.
- **Labor practice is a platform risk.** The Kenyan rulings that Meta can be sued over a contractor's employment show the liability doesn't stop at the contract. Wellbeing terms (exposure limits, counseling, opt-outs, tooling) belong in the outsourcing contract and in audits of the vendor, not only in the vendor's own policy.
- **Access is privileged access.** Outsourced reviewers see private messages and reported media. They get least-privilege queues by category and region, no export, session logging and sampled audit, the same rules as [Support Access](/docs/security/support-access#logging-support-access).
- **Quality is measured the same way for everyone.** Staff, vendor reviewers, volunteers escalated to staff and models are scored against the same gold-labeled samples, so a site, a vendor or a model that drifts shows up in the same report.

## Reviewer Wellbeing

The best-documented terms for protecting reviewers come from litigation. **Scola v. Facebook** (Superior Court of California, County of San Mateo, No. 18-civ-05135) was filed in September 2018 by moderators who alleged psychological harm from viewing graphic content; the court granted final approval of the settlement on July 14, 2021. Its terms, from the settlement notice and press coverage of the filing:

- **Money:** a $52 million fund; at least $1,000 for each class member, more for a qualifying diagnosis (press reported an extra $1,500 for one diagnosis and up to $6,000 for several), up to $50,000 in total per person. The class was current and former moderators for Facebook in California, Arizona, Texas and Florida from September 15, 2015 to August 14, 2020, including those employed by vendors; the final count was over 14,000 people. Facebook denied liability.
- **Tooling:** review tools changed so graphic video plays with audio muted and in black and white by default, reported as reaching about 80% of moderators by the end of 2020 and all by the end of 2021.
- **Support:** weekly one-on-one sessions with a licensed mental health professional for moderators who view graphic content daily, monthly group sessions, and access to a counselor within 24 hours in a crisis.
- **Vendor duties:** screening candidates for emotional resilience, posting mental health resources at workstations, and telling moderators how to report breaches of the workplace standards.

**Interactive blurring works.** Das, Dang and Lease (AAAI HCOMP 2020) tested six blur-based moderation interfaces with Mechanical Turk workers and found that "interactive blurring designs can reduce emotional impact" "without sacrificing moderation accuracy and speed." Community Sift sells optional blurring for the same reason. The design: media starts blurred (and grayscale, and muted); the reviewer reveals a region, unblurs fully, restores color or turns on audio only when the decision needs it; every reveal is logged with its duration.

**Limit exposure time.** The Technology Coalition's 2015 Employee Resilience Guidebook, written around child exploitation material but applicable to other distressing imagery, recommends limiting exposure to disturbing material to four hours a day, rotating people to other work and giving time off to recover. I haven't been able to open the guidebook itself; the figure comes from published commentary on it. My default treats it as a ceiling, not a target: a per-reviewer daily cap on seconds of exposure to the most severe categories, enforced by the router, with the cap and the categories as data.

What the tooling and routing should do, built from these sources:

| Control | What it does | Where it comes from |
| --- | --- | --- |
| Blurred, grayscale, muted by default | Reveal only what the decision needs | Scola settlement; Das, Dang and Lease; Community Sift |
| Least content | Show the hash-match label, the classifier category and text context first; open media last | Hash-first design ([Hash Matching](/books/user-generated-platforms/child-safety#hash-matching)) |
| Exposure caps | Daily seconds of severe-category exposure per reviewer; router stops assigning at the cap | Technology Coalition guidance |
| Category clearance | Only trained, consenting reviewers get the most severe queues; opting out has no penalty | Technology Coalition guidance; the playbook's [Moderator Wellbeing](/docs/security/trust-and-safety#moderator-wellbeing) |
| Rotation | Mix severe and benign queues within a shift | Technology Coalition guidance |
| Counseling | Scheduled sessions and crisis access, including for vendor staff | Scola settlement |
| No-view action | Exact hash matches to known abuse material actioned without a person viewing it | [Reviewing Child Safety Cases](/books/user-generated-platforms/child-safety#reviewing-child-safety-cases) |

The law reaches the same place from another direction. DSA Article 20(6) requires appeal decisions under "appropriately qualified staff," and Article 15(1)(c) asks providers to report "the measures taken to provide training and assistance to persons in charge of content moderation." Child sexual abuse material review has further rules of its own, in [Reviewing Child Safety Cases](/books/user-generated-platforms/child-safety#reviewing-child-safety-cases); graphic violence, in [Graphic Content](/books/user-generated-platforms/violent-extremism-and-graphic-content#graphic-content).

## Measuring Prevalence

Removal counts measure effort. **Prevalence** measures outcome: of everything users actually saw, how much violated policy. It's the only number that captures what moderation missed.

- **Meta** defines prevalence as the estimated share of views of violating content among all views on Facebook or Instagram, reported per 10,000 views. A view is logged when content appears on screen. Meta samples views, has reviewers label the whole sampled item (with a second review and a third to break ties on some labels), uses stratified sampling that oversamples higher-risk contexts for some violation types, reports a 95% confidence range, and for rare violations reports only an upper bound. Its measurement covers surfaces with over 90% of views and excludes private messaging.
- **YouTube** calls its version the **violative view rate (VVR)**: the share of views on videos that violate its Community Guidelines, estimated by sending a sample of videos to reviewers. When YouTube introduced the metric in April 2021, the VVR was 0.16% to 0.18% (16 to 18 views in every 10,000), which YouTube said was down by over 70% from the same quarter of 2017. A statistician retained by Google reviewed the method and called it "thoroughly sensible and statistically sound."

Designing the sample:

- **Sample views, not items.** An item seen a million times matters a million times more than one seen once. Draw from the impression log (the events the feed and player emit), so selection probability is proportional to exposure.
- **Stratify, and weight back.** Oversample surfaces, languages and communities where violations concentrate, record each sample's weight, and weight the estimate back to the population. Without stratification a rare category produces almost no positives.
- **Label against the policy version in force,** blind to whether the item was already actioned, by reviewers held to the same gold standard as production review, with double labeling and adjudication on disagreement.
- **Report the interval.** For a rare category the honest number is an upper bound: with zero violations in n sampled views, the 95% upper bound on prevalence is about 3/n, so 30,000 clean samples bound it near 1 in 10,000.
- **Sample what moderation did, too.** A separate daily sample of automated and human decisions, labeled the same way, gives precision per category, which is the error budget's measurement. Prevalence says what was missed; decision samples say what was wrongly removed.

Prevalence moves with policy changes (new rules make previously allowed content violating, as YouTube notes), so each estimate carries its policy version. [Operating Metrics](/books/user-generated-platforms/operating-metrics#trust-and-safety-metrics) covers where prevalence sits among the platform's health measures.

## Language Coverage

Moderation is only as good as its weakest language. Classifiers are trained mostly on a few languages; reviewers come from the labor markets outsourcing firms operate in; slang and coded terms shift faster than either. The DSA makes the gap visible for very large platforms: their transparency reports must state "the human resources that the provider of very large online platforms dedicates to content moderation" "broken down by each applicable official language of the Member States," with "the qualifications and linguistic expertise" of those people and accuracy indicators broken down by language (Article 42(2)). Vendors publish coverage as a selling point (Community Sift's 22 premium languages; TaskUs's delivery in more than 30), and Meta launched Community Notes in six languages common in the US.

My rules for coverage:

- **Detect language on every item** (`content_items.language` in the core model) and route by it; a case in a language no available reviewer reads waits for one, it doesn't go to whoever is next.
- **Measure per language.** Prevalence, precision and appeal reversal per language, not just overall; a classifier that's precise in English and noisy in Tagalog has two error rates.
- **Don't auto-act where you can't measure.** If there's no labeled sample for a language, the classifier can prioritize but not act.
- **Machine translation is a reviewer aid, not a reviewer.** Show the original beside the translation, and record that the decision was made through translation.

## How to Build It

The chapter adds detection records, reviewers, assignments and prevalence samples to the moderation tables from [Trust & Safety](/docs/security/trust-and-safety) as widened in [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model):

```sql
CREATE TABLE classifier_bands (          -- per model, category and action: when to act, queue, pass
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor         TEXT NOT NULL,          -- 'internal', 'hive', 'community_sift', 'google_csapi', ...
  model          TEXT NOT NULL,
  category       TEXT NOT NULL,          -- the policy's category enum
  action         TEXT NOT NULL CHECK (action IN ('hide_content', 'label', 'hold_for_review',
                   'remove_content', 'restrict_account')),
  act_at         NUMERIC(6, 5),          -- null: never acts alone in this category
  review_at      NUMERIC(6, 5) NOT NULL, -- below this, nothing happens
  error_budget   NUMERIC(6, 5),          -- accepted false-positive rate for automated action
  valid_during   TSTZRANGE NOT NULL,
  approved_by    UUID NOT NULL REFERENCES accounts (id),
  CHECK (act_at IS NULL OR act_at >= review_at),
  EXCLUDE USING GIST (vendor WITH =, model WITH =, category WITH =, action WITH =,
    valid_during WITH &&)
);

CREATE TABLE classifier_results (        -- every score, acted on or not
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_type        TEXT NOT NULL CHECK (subject_type IN ('content_item', 'media_asset',
                        'account', 'profile', 'message', 'stream')),
  subject_id          UUID NOT NULL,
  content_revision_id UUID REFERENCES content_revisions (id),  -- the version scored
  vendor              TEXT NOT NULL,
  model               TEXT NOT NULL,
  model_version       TEXT NOT NULL,
  category            TEXT NOT NULL,
  score               NUMERIC(6, 5),     -- probability-like score, when the model gives one
  priority            SMALLINT,          -- for priority-only APIs
  language            TEXT,              -- BCP 47, as detected
  mode                TEXT NOT NULL CHECK (mode IN ('live', 'shadow')),
  band_id             UUID REFERENCES classifier_bands (id),  -- the band in force
  outcome             TEXT NOT NULL CHECK (outcome IN ('acted', 'queued', 'passed',
                        'shadow')),
  case_id             UUID REFERENCES moderation_cases (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (score IS NOT NULL OR priority IS NOT NULL),
  CHECK ((mode = 'shadow') = (outcome = 'shadow'))
);

CREATE TABLE reviewers (                 -- everyone who decides cases, whoever employs them
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL UNIQUE REFERENCES accounts (id),  -- their tool login
  employer            TEXT NOT NULL CHECK (employer IN ('staff', 'vendor', 'volunteer')),
  vendor              TEXT,              -- the outsourcing firm, when employer = 'vendor'
  site                TEXT,              -- delivery site, e.g. 'PH-Manila'
  languages           TEXT[] NOT NULL,   -- BCP 47 tags they review in
  cleared_categories  TEXT[] NOT NULL,   -- trained for and consented to
  daily_exposure_cap_s INT,              -- severe-category seconds per day; null: no severe work
  status              TEXT NOT NULL CHECK (status IN ('training', 'active', 'paused',
                        'offboarded')),
  valid_during        TSTZRANGE NOT NULL,
  CHECK ((employer = 'vendor') = (vendor IS NOT NULL))
);

CREATE TABLE review_assignments (        -- one reviewer working one case
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id             UUID NOT NULL REFERENCES moderation_cases (id),
  reviewer_id         UUID NOT NULL REFERENCES reviewers (id),
  queue               TEXT NOT NULL,     -- 'csam', 'graphic_violence', 'spam', 'appeals', ...
  purpose             TEXT NOT NULL CHECK (purpose IN ('decide', 'qa_sample', 'appeal',
                        'prevalence_label', 'gold_label')),
  assigned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at          TIMESTAMPTZ,
  finished_at         TIMESTAMPTZ,
  decision_id         UUID REFERENCES moderation_decisions (id),
  translated          BOOLEAN NOT NULL DEFAULT FALSE,  -- decided through machine translation
  exposure_seconds    INT NOT NULL DEFAULT 0,  -- sum of reveal durations below
  released_reason     TEXT CHECK (released_reason IN ('opt_out', 'exposure_cap',
                        'language', 'conflict_of_interest', 'shift_end'))
);

CREATE TABLE review_reveals (            -- each step away from the safe default view
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  assignment_id  UUID NOT NULL REFERENCES review_assignments (id),
  media_asset_id UUID NOT NULL REFERENCES media_assets (id),
  kind           TEXT NOT NULL CHECK (kind IN ('unblur_region', 'unblur_full', 'color',
                   'audio')),
  revealed_at    TIMESTAMPTZ NOT NULL,
  concealed_at   TIMESTAMPTZ             -- null while still revealed
);

CREATE TABLE prevalence_samples (        -- sampled views, labeled blind
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  period              DATERANGE NOT NULL,  -- the measurement window
  surface             TEXT NOT NULL,     -- 'home_feed', 'search', 'community', 'player', ...
  stratum             TEXT NOT NULL,     -- the sampling stratum, e.g. surface plus language
  weight              NUMERIC NOT NULL CHECK (weight > 0),  -- inverse selection probability
  viewed_at           TIMESTAMPTZ NOT NULL,
  content_item_id     UUID NOT NULL REFERENCES content_items (id),
  content_revision_id UUID NOT NULL REFERENCES content_revisions (id),  -- as seen
  language            TEXT,
  policy_version      TEXT NOT NULL,
  violating           BOOLEAN,           -- null until labeled
  category            TEXT,              -- set when violating
  label_count         SMALLINT NOT NULL DEFAULT 0,
  adjudicated         BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK (violating IS NOT TRUE OR category IS NOT NULL)
);
```

Notes on the sketch:

- **A band is policy, with an owner.** `classifier_bands` holds the thresholds and error budget per (vendor, model, category, action) with validity ranges, approved by a named person; the exclusion constraint keeps one band in force at a time. A `null` `act_at` means the model may only queue in that category. Changing a band is a reviewed change, and every decision that used it points at it; [AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#how-to-build-it) adds the evaluation behind each band and the error rate measured against its budget.
- **Results are separate from decisions.** A `classifier_results` row is a signal; the decision, with its `model_version`, `score` and `threshold`, is the playbook's `moderation_decisions` row. Shadow results never touch a case and carry `outcome = 'shadow'`, so a vendor trial is a query over the same table.
- **Every reviewer is a row, including vendors' and volunteers'.** Decisions already record `actor_id`; joining it to `reviewers` gives employer, vendor and site for every decision, which is what quality reports per vendor, wellbeing audits and the DSA's per-language staffing figures are computed from. Volunteers appear only when they work in the platform's tools (escalation queues, labeling); community moderation lives in [Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#how-to-build-it).
- **The router reads the reviewer.** Assignment filters on `languages`, `cleared_categories` and today's `exposure_seconds` against `daily_exposure_cap_s`; an assignment released for opt-out or the cap records why, and an opt-out never counts against the reviewer.
- **Exposure is measured, not estimated.** The review tool writes `review_reveals` as the reviewer unblurs, restores color or turns on audio, and the assignment's `exposure_seconds` sums them. Child-safety evidence access is additionally logged in [Child Safety](/books/user-generated-platforms/child-safety#how-to-build-it)'s evidence access log.
- **Prevalence samples are their own population.** They're drawn from impressions with a weight, labeled under `purpose = 'prevalence_label'` assignments blind to existing decisions, and estimated as the weighted share violating with an interval. A violating sample that no one had actioned also opens a case, so measurement feeds enforcement. [Operating Metrics](/books/user-generated-platforms/operating-metrics#how-to-build-it) adds the viewer's country and a blindness check, and publishes the estimate as a metric value.
- **Events:** `classifier.scored` (high volume, to the analytics store), `classifier.band_changed`, `review.assigned`, `review.released`, `review.exposure_cap_reached`, `prevalence.sample_labeled` and `prevalence.estimate_published` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every band in force,** with who approved it and when, so any automated decision can be traced to the threshold and error budget that allowed it.
- **Every score that led to an action,** and the population of scores that didn't, kept long enough to recompute precision and recall after a policy or model change.
- **Who decided, and for whom they worked.** Reviewer, employer, vendor, site and language for each human decision, joined from `reviewers`; this is the evidence for DSA Article 20(6) supervision by qualified staff and for the per-language staffing figures in Article 42.
- **Exposure and wellbeing records,** per reviewer per day: severe-category seconds, caps reached, opt-outs, released assignments. These are personal data of the reviewers, retained and accessed under the platform's employment and privacy rules, and aggregated for vendor audits.
- **Prevalence estimates with their method:** the sample frame, strata, weights, labels, policy version and interval behind each published number, so it can be reproduced.
- **Reviewer quality:** agreement with gold labels and appeal reversals per reviewer, site and vendor, the same way the playbook's [Auditing Moderation Decisions](/docs/security/trust-and-safety#auditing-moderation-decisions) audits moderators.

## What This Means for the System You Build

- **Use classifiers to order the queue,** and let them act alone only in categories where you've measured their precision.
- **Version thresholds as data** per model, category and action, with an error budget and an owner.
- **Log every score,** including the ones below threshold and the shadow runs.
- **Buy signals freely, keep the system of record,** and trial every vendor in shadow mode on your own labeled traffic.
- **Treat outsourced reviewers as your reviewers:** your tool, your policy version, your quality bar, your wellbeing terms in the contract.
- **Default media to blurred, grayscale and muted,** log every reveal, and cap daily exposure to the worst categories.
- **Measure prevalence from sampled views,** stratified and weighted, with an interval and a policy version.
- **Measure per language,** route by language, and don't auto-act where you can't measure.
- **Count actions and accounts separately,** and say which one every number is.

## References

**Statutes and regulations**

- [DSA Article 15: Transparency reporting obligations](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_15.html), automated means, accuracy and error indicators, training and assistance for moderators
- [DSA Article 20: Internal complaint-handling system](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_20.html), decisions under qualified staff and not solely automated
- [DSA Article 42: Transparency reporting obligations for very large platforms](https://www.eu-digital-services-act.com/Digital_Services_Act_Article_42.html), moderation staff, qualifications and accuracy by official language

**Regulators and courts**

- [Top Class Actions: Facebook moderators $52M class action settlement](https://topclassactions.com/lawsuit-settlements/open-lawsuit-settlements/facebook-moderators-52m-class-action-settlement/), Scola v. Facebook case number and court, class definition, final approval on July 14, 2021, $1,000 minimum and $50,000 maximum
- [Impact Fund: Scola v. Facebook](https://www.impactfund.org/social-justice-blog/scola-v-facebook), over 14,000 class members at Facebook vendors in four states
- [Tubefilter: Facebook agrees to pay $52 million to content moderators](https://tubefilter.com/2020/05/12/facebook-scola-lawsuit-settlement-content-moderators-ptsd/), muted and black-and-white video, the 80% and 100% rollout, weekly and monthly sessions, vendor screening and postings, diagnosis payments
- [Silicon UK: Facebook moderators agree $52 million settlement](https://www.silicon.co.uk/e-regulation/facebook-moderators-52-million-settlement-343740), 11,250 moderators at filing, crisis counselor within 24 hours, the named contractors
- [Tech-ish: Kenya Court of Appeal rules Meta can be sued](https://tech-ish.com/2024/09/20/meta-facebook-sama-court-of-appeal/), the September 20, 2024 ruling, the claims and the $1.6 billion sought
- [StratNews Global: Meta can be sued for sacking of content moderators](https://stratnewsglobal.com/africa/meta-can-be-sued-for-sacking-of-content-moderators-rules-kenya-court/), the earlier labor court rulings and the merits left for trial

**Platforms**

- [Reddit: Transparency Report, July to December 2025](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), removals by moderators and admins, automated share of moderator removals, admin spam share, appeals and the fall in granted appeals (copy hosted by TorrentFreak)
- [Pinterest: Transparency Report](https://policy.pinterest.com/en/transparency-report), manual, hybrid and automated definitions, adult content and spam deactivations for H2 2025
- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), reports, takedowns, labels and the automated share, human review of appeals
- [Bluesky: Stackable moderation](https://bsky.social/about/blog/03-12-2024-stackable-moderation), the default moderation service, independent labelers, Ozone, user-configurable labels
- [Discord: Transparency Report, March 2025 to March 2026](https://cdn.discordapp.com/assets/transparency-reports/Discord-Transparency-Report-2026-Updated.pdf), actions taken versus accounts disabled, spam account disables
- [Meta: Prevalence](https://transparency.meta.com/policies/improving/prevalence-metric/), views-based prevalence, sampling, labeling, stratification, upper bounds and confidence ranges
- [YouTube: Building greater transparency and accountability with the violative view rate](https://blog.youtube/inside-youtube/building-greater-transparency-and-accountability/), the VVR definition, sampling to reviewers, the 0.16% to 0.18% figure and the 70% decline
- [Meta: Testing begins for Community Notes](https://about.fb.com/news/2025/03/testing-begins-community-notes-facebook-instagram-threads/), the six launch languages

**Vendors and programs**

- [Google: Child safety toolkit for partners](https://protectingchildren.google/tools-for-partners/), Content Safety API priority recommendations, review required, placement before manual review
- [Hive](https://thehive.ai/), moderation models and categories, the Deploy notice
- [Alice](https://alice.io/), trust and safety for user-generated and AI-generated content, the research network
- [Microsoft: Community Sift](https://developer.microsoft.com/en-us/games/products/community-sift/), risk sliders, escalation, 22 premium languages, optional blurring for moderators
- [Safer by Thorn](https://safer.io/), classifiers trained on abuse data from trusted sources
- [Checkstep](https://www.checkstep.com/), model marketplace and named integrations, automatic DSA statement-of-reasons filing, human-in-the-loop appeals
- [Cinder](https://cinder.ai/), agentic workflows, escalation with suggested actions, benchmarking humans and agents on the same labeled data
- [TaskUs: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1829864/000182986426000012/task-20251231.htm), Trust & Safety share of revenue, content moderation scope, Meta concentration, headcount, sites, languages, wellbeing risk factor
- [Teleperformance: Shareholders' newsletter, December 2023](https://www.tp.com/media/o0nphrjf/teleperformance-shareholders-newsletter-december-2023.pdf), the Majorel acquisition and delisting, content moderation momentum
- [Business & Human Rights Resource Centre: Meta closes east African content moderation hub run by Sama](https://business-humanrights.org/en/latest-news/kenya-meta-closes-east-african-content-moderation-hub-run-by-sama), Sama's exit, staff cuts and mental health support

**Reference**

- [Das, Dang and Lease: Fast, Accurate, and Healthier: Interactive Blurring Helps Moderators Reduce Exposure to Harmful Content](https://ojs.aaai.org/index.php/HCOMP/article/view/7461), AAAI HCOMP 2020, six blur designs, emotional impact reduced without loss of accuracy or speed
- [The Conversation: We need to talk about the mental health of content moderators](https://theconversation.com/we-need-to-talk-about-the-mental-health-of-content-moderators-103830), the Technology Coalition's 2015 Employee Resilience Guidebook and its four-hour exposure recommendation
- [Analysis Group: YouTube's violative view rate methodology, a statistical assessment](https://www.analysisgroup.com/Insights/publishing/youtubes-violative-view-rate-methodology-a-statistical-assessment/), the November 2021 review of the VVR method
