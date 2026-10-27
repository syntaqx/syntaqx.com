+++
title = "Minors, Age Assurance & US State Law"
nav_title = "Minors & Age Assurance"
description = "Age checks on user-generated platforms: methods and vendor risk, teen-by-default, family tools, minimum ages, US state laws in court, KOSA, COPPA, design suits."
category = "User-Generated Platforms Industry"
order = 1842
part = "The Rules"
tags = ["user-generated-content", "age-assurance", "children", "coppa", "online-safety"]
+++

For most of their history, user-generated platforms knew one thing about a user's age: the birthday typed at sign-up, if they asked. Terms said 13 and older, and everyone knew that wasn't true. Between 2023 and 2026 that stopped being acceptable in every market these platforms serve. The UK requires "highly effective" age assurance before children can reach the most harmful content; Australia requires reasonable steps to keep under-16s off social media entirely; the EU's very large platforms are being investigated for under-13 access; US states pass a new law every session requiring age verification, parental consent or feed limits for minors, and the courts strike down, enjoin or uphold them one by one; and juries have started finding that the design of a feed, not just its content, can make a platform liable to a young user.

On a user-generated platform the problem is harder than on a game or an app built for children, for three reasons. **Strangers can reach the user,** so contact settings (who can message, friend, find or follow a minor) matter more than content ratings. **The content is uploaded by users,** so "is this suitable?" is a moderation output with error rates, not a rating set by a publisher. **The platform is general-audience,** so it must decide how hard to look for the minors it has, and every way of looking (a selfie, an ID, an inference from behavior) collects data from adults too.

This chapter covers the industry detail: how the platforms assure age and what it costs in data and risk, teen-by-default and the settings that change by age, family supervision tools, minimum ages as an engineering problem, the US state laws and their court status, federal bills, COPPA as it lands on a user-generated platform, the design-liability suits, and the Imgur case. The general law and design (COPPA and its 2025 amendments, verifiable parental consent, the UK Children's Code, the Online Safety Act's age-check duty, DSA Article 28, app-store laws, age as a record) are the playbook's [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy), and this chapter adopts its `age_signals` and `parental_consents` tables as-is. It owns `accounts.age_band`, reserved in [Accounts, Identity & Standing](/books/user-generated-platforms/accounts-and-identity#minors), and adds age checks, feature rules by age, guardian links and age restrictions. The regulators' enforcement records are in [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#the-enforcement-ledger). Statuses are as of October 2026, and none of it is legal advice.

## How the Platforms Do It

| Platform | Default for unknown or teen users | Age assurance | Family tools | Published figures |
| --- | --- | --- | --- | --- |
| **Discord** | Global teen-by-default from early March 2026: sensitive content blurred, age-restricted spaces closed, messages from people the user may not know routed to a separate inbox, no speaking on Stage until verified as an adult | Facial age estimation on the device, ID through vendor partners, and an age inference model using tenure, device and activity data (not message content) | Family Center: opt-in by the teen; the parent sees recent friends, servers, and who the teen messaged or called, not message content | Users prompted, completed and passed per month, by method |
| **Pinterest** | Under 16s private with boards and Pins visible only to themselves (April 2023); 13 to 15 private with no option to go public, 16 to 17 private by default globally (April 2025) | Birthdate required for every account; a user who entered an age under 18 must verify through a third party to change it | Parent passcode for certain settings (announced 2023) | Not covered here |
| **Bluesky** | Not covered here | Kids Web Services for UK users | Not covered here | 364,960 accounts age-assured in 2025 (UK 274,163, US 52,924, Australia 37,873) |
| **Reddit** | Not covered here | Persona for UK users viewing adult content from July 2025 | Not covered here | Not covered here |
| **Roblox** | Covered in the Gaming volume: chat by age group after a facial age check | Facial estimation with an ID fallback | Parental controls | 1.4-year mean absolute error under 18, per its vendor testing |

The patterns: **unknown age is treated as young** (Discord's teen-by-default; the playbook's "unknown is the youngest band"); **age assurance is layered** (inference for most, estimation for many, ID for the contested); **the riskiest defaults are about contact,** not content (who can message, friend, find); and **family tools show activity, not content,** because teens are users with privacy of their own. Roblox's design is the Gaming volume's [User-Generated Content and Young Players](/books/gaming/player-behavior#user-generated-content-and-young-players).

## Age Assurance on a General-Audience Platform

The playbook's [Designing Age Assurance](/docs/compliance/childrens-privacy#designing-age-assurance) sets out the methods (self-declaration, platform signals, inference, facial estimation, document checks) and the rule of picking the method per feature. On a user-generated platform the feature that forces the question is usually one of four: unblurring sensitive or adult content, entering an age-restricted community, receiving messages from strangers, and broadcasting (speaking on a stage, going live). Discord's March 2026 rollout gates exactly those behind "verified adult."

What the funnel looks like at scale is now public. Discord prompted 1,460,513 users to complete age assurance in March 2026; 426,953 completed and 417,869 passed, and across the monthly figures from July 2025 between about a fifth and two-fifths of prompted users completed, with facial estimation used more often than an ID every month. Two things follow:

- **Most people prompted don't complete.** A gate that most prompted users abandon removes them from the gated feature, which is the point for minors and a cost for adults. Discord's inference model, which it says means "most adults won't need to verify," is the response: verify the people the platform can't already place.
- **Methods must be counted.** The funnel by method is a transparency figure Discord now publishes ([Transparency Reporting](/books/user-generated-platforms/transparency-reporting#what-the-voluntary-reports-count)), and it's also the data that shows whether a method's error rate is acceptable.

Estimation error is largest near the threshold. Roblox's vendor reported a 1.4-year mean absolute error for users under 18 ([Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy#designing-age-assurance)), which at a 16 or 18 line means a buffer zone (estimated 16 to 20 for an 18 gate, say) that goes to a stronger method. Every rejection needs a path: Discord lets users re-verify if they were placed in the teen group wrongly, and ID is the usual appeal for an estimate. The appeal path is where the most sensitive data accumulates.

![Age assurance in layers, then one platform's funnel. A pipeline runs from a gated feature (unblurring, restricted spaces, strangers' messages, going live) to inference, which places most adults without a prompt, to a prompt where the rest are asked to verify, to estimation, where the vendor returns a result and not the image, to a document check, used near the line and on appeal. Below, bars for March 2026 on a scale to 1.5 million users: 1,460,513 prompted, 426,953 completed (accented) and 417,869 passed. A footnote says these are users as one platform published them, and most people prompted don't complete and stay out of the gated feature.](/diagrams/ugp-minors-age-assurance-funnel.svg "Discord's March 2026 figures show why inference comes first: most of the people it prompted never completed a check. Estimation covers most of the rest, and a document is the fallback near the line and on appeal.")

### Vendor Risk

Age assurance concentrates identity documents in a few places, and those places get breached. Discord disclosed in October 2025 that a breach at a third-party vendor may have exposed sensitive data of about 70,000 users, including government ID photos that the vendor used to review age-related appeals. The images existed because of the appeals path, not the primary check: Discord says the video selfie for facial estimation never leaves the device and that ID images are deleted after the age group is confirmed, but appeals were handled through a support vendor.

My rules for vendors:

- **The vendor returns a result, not a document.** The platform stores the age band, the method, the vendor's reference and the time; never the image ([Data Minimization for Minors](/docs/compliance/childrens-privacy#data-minimization-for-minors)). Discord's on-device estimation is the strongest version: the image doesn't leave the phone.
- **Appeals and support are part of the age assurance system.** Every path that can receive an ID (a support ticket, an email attachment, a contractor's queue) gets the same deletion rule and the same contract terms as the primary check.
- **Contract for deletion and audit it.** Ofcom expects providers using a third-party age assurance vendor to do regular due diligence and published a "vet your vendor" resource in 2026; the FTC's February 2026 COPPA policy statement conditions its forbearance on written assurances of safeguards, limited use and prompt deletion from third parties.
- **Record which vendor checked whom.** When a vendor is breached, the first question is which users it held data for, and [The Platform Landscape](/books/user-generated-platforms/platform-landscape#auditing) makes "what left the platform" an audit record for this reason.

### COPPA and Age Checks

The amended COPPA Rule has been fully in force since April 22, 2026 ([The 2025 Amendments](/docs/compliance/childrens-privacy#the-2025-amendments)). For a general-audience platform the awkward part was that checking age collects personal information, possibly from a child, before consent. The FTC addressed it on February 25, 2026 with a policy statement: it won't bring COPPA enforcement against general or mixed audience operators that collect, use or disclose personal information "solely to determine a user's age" without prior parental consent, if they don't use the data for anything else, share it only with third parties under written assurances of confidentiality, security, limited use and prompt deletion, keep it no longer than necessary, say so in the privacy policy, secure it, and take reasonable steps to make sure the method produces reasonably accurate results. That's a set of requirements for the `age_checks` record below: purpose limited, retention limited, vendor documented, accuracy evidenced.

## Defaults by Age

The settings that change for minors on these platforms cluster into five groups, and each has a regulatory anchor:

| Setting | Teen default on the platforms | Where it comes from |
| --- | --- | --- |
| **Who can contact** | Messages from non-friends to a request inbox; alerts on friend requests from unfamiliar users | Discord's UK changes from July 21, 2025 and global teen default; Ofcom's codes on direct messages from non-connected accounts |
| **Who can find and see** | Private accounts; not discoverable; activity status hidden in large communities | Pinterest's private-by-default; the Commission's DSA Article 28 guidelines (private by default) |
| **What they see** | Sensitive media blurred; age-restricted spaces closed | Discord's sensitive content filter; the Online Safety Act's primary priority content duty |
| **What they can do** | No broadcasting or stage speaking; no purchases or earnings without consent | Discord's Stage rule; app-store and COPPA consent scopes |
| **How they're kept** | No infinite scroll, autoplay or night notifications by default; feeds not personalized without consent | California SB 976's parental consent for "addictive feeds"; the House KIDS Act; the design suits |

Discord's UK implementation shows how specific these get. Friend request alerts apply when there are no mutual friends or the only shared server has under 200 members; DMs from non-friends who share only servers of more than 200 members go to a Message Request inbox; activity status isn't shared to servers of 200 or more; turning off the filter or the inbox requires age verification as an adult. Every number in that list is a rule parameter that will differ by jurisdiction and change over time, which is why the rules belong in data ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)) and why `feature_age_rules` below carries a jurisdiction and an effective range.

A design decision that saves a great deal of work: **apply the teen defaults to everyone whose age is unknown, and to everyone in a market with an age rule, and let verified adults opt out.** The UK Children's Code says applying its standards to all users is a legitimate alternative to knowing ages ([The UK Age Appropriate Design Code](/docs/compliance/childrens-privacy#the-uk-age-appropriate-design-code)), and Discord's global teen-by-default is that choice at platform scale.

## Family Supervision

Discord's Family Center is opt-in for the teen, connected by scanning a QR code on both phones, and can be disconnected at any time. A connected parent sees recently added friends, servers joined or participated in (with member counts), and who the teen messaged or called with the time of the last message, but "connected accounts will not have access to the contents of your messages." Pinterest announced a parent passcode for certain settings. The design rules common to them:

- **The link is consented and reversible,** and the teen sees exactly what's shared. A covert monitoring feature is a different product with different law.
- **Metadata, not content.** Who and when, not what.
- **Supervision isn't consent.** A guardian link that shows activity is not COPPA consent for a child or app-store consent for a significant change; those are `parental_consents` rows with their own scopes ([Verifiable Parental Consent](/docs/compliance/childrens-privacy#verifiable-parental-consent)).
- **Some guardians are adversaries.** Abusive households exist; a link the teen can't end, or that reveals location, is a safety risk.

## Minimum Ages

Australia made a minimum age an enforceable platform duty. From December 10, 2025, age-restricted social media platforms must take reasonable steps to prevent Australians under 16 from creating or keeping accounts, with court-imposed penalties up to A$109.2 million; eSafety names Facebook, Instagram, Snapchat, Threads, TikTok, Twitch, X, YouTube, Kick and Reddit among them ([Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#australia-s-esafety-regime)). Platforms removed access to 4.7 million under-16 accounts by mid-December 2025. The UK announced on June 15, 2026 that it plans age-based restrictions including for social media under 16, and Ofcom was asked to assess what highly effective age assurance looks like at 16.

As engineering, a minimum age is four operations:

1. **Find existing underage accounts.** Inference over tenure, declared birthdays, behavior and reports, then a check for those flagged. Removing 4.7 million accounts in a week means most were found by inference, not checks.
2. **Restrict, with an appeal.** Removing access isn't deleting the account: Meta offered users 16 and older removed by mistake the chance to verify through Yoti with an ID or a video selfie, and a minor who turns 16 should be able to come back. So an underage restriction is its own record with a jurisdiction and an end condition, not a penalty (it's not misconduct) and not the user's own deactivation.
3. **Stop new underage sign-ups,** including the second attempt with a different birthday ([The Age Screen](/docs/compliance/childrens-privacy#the-age-screen)).
4. **Keep the evidence of reasonable steps.** eSafety's compliance update relied on compulsory notices to the platforms for removal figures, and its September 2026 powers reach age assurance vendors and app stores. What the platform did, when, by which method and with what result is the defense.

## US State Laws and Their Court Status

States have passed three kinds of law aimed at minors on social platforms: **access laws** (age verification for all users and parental consent for minors' accounts), **design laws** (limits on "addictive" feeds, notifications and time of use, and age-appropriate design codes), and **app-store laws** that move the check to Apple and Google ([US State App-Store Laws](/docs/compliance/childrens-privacy#us-state-app-store-laws)). NetChoice and CCIA have challenged most of the first two. The Supreme Court's *Free Speech Coalition v. Paxton* (June 27, 2025, 6 to 3) upheld Texas's age verification law for sites where more than one-third of the material is sexual material harmful to minors, applying intermediate scrutiny because the law only incidentally burdens adults' protected speech; challenges to general social media laws have continued under *Moody v. NetChoice*, which requires a facial challenger to show the law's unconstitutional applications substantially outweigh its constitutional ones.

| State and law | Effective | Status as of October 2026 |
| --- | --- | --- |
| **Georgia SB 351** (age verification for all users, parental consent under 16, no targeted ads to under-16s using personal data) | July 1, 2025 | Preliminary injunction June 26, 2025; **reversed by the Eleventh Circuit on October 15, 2026**: NetChoice's facial challenge failed under *Moody*, the vagueness ruling was improper, and Section 230 doesn't preempt the ad provision |
| **Florida HB 3** | January 1, 2025 | Preliminary injunction June 3, 2025, stayed by the Eleventh Circuit; being enforced |
| **California SB 976** (addictive feeds) | January 1, 2025 | Partly in effect: parental consent for addictive feeds and private-mode defaults; rehearing en banc denied November 6, 2025 |
| **California AB 2273** (Age-Appropriate Design Code) | July 1, 2024 | Ninth Circuit (March 12, 2026) let coverage, age estimation and data-use provisions proceed; dark patterns provision still enjoined |
| **Mississippi HB 1126** | July 1, 2024 | Injunction June 18, 2025, stayed by the Fifth Circuit; Supreme Court declined to lift the stay; Fifth Circuit argued February 2, 2026 |
| **Tennessee** Protecting Children from Social Media Act | January 1, 2025 | Preliminary injunction denied; Sixth Circuit argued February 4, 2026 |
| **Ohio HB 33** (parental notification) | October 3, 2023 | Permanent injunction vacated by the Sixth Circuit June 18, 2026 for lack of standing; mandate stayed pending Supreme Court review |
| **Texas SCOPE Act (HB 18)** | September 1, 2024 | Preliminary injunctions; Fifth Circuit affirmed an injunction against a central provision |
| **Utah SB 194 and HB 464** | October 1, 2024 | Enjoined; Tenth Circuit argued November 20, 2025 |
| **Arkansas** SB 396, Act 900, Act 901 | Various | Permanent injunction on appeal; preliminary injunctions April 20, 2026 and December 15, 2025 |
| **Colorado HB 24-1136** | August 8, 2024 | Preliminary injunction November 6, 2025; Tenth Circuit appeal |
| **Louisiana SB 162** | July 1, 2025 | Blocked on summary judgment December 15, 2025 |
| **Virginia SB 854** (one hour a day for under-16s) | January 1, 2026 | Enjoined February 27, 2026; on appeal |
| **Nebraska LB 383** | July 1, 2026 | Challenged May 14, 2026 |
| **New York SAFE for Kids Act** | 190 days after final rules | Proposed rules September 15, 2025 |

Three lessons for the system:

- **Status is data with a date.** A law can be enforceable on Monday and enjoined on Friday, and Georgia's flipped back after 15 months. Store each law as a rule with its effective range and its source, and switch it on or off by changing data, the same discipline Apple's Texas announcements forced on app developers ([US State App-Store Laws](/docs/compliance/childrens-privacy#us-state-app-store-laws)).
- **Section 230 doesn't cover the platform's own conduct.** The Eleventh Circuit held that a rule about how platforms target ads to minors regulates "how social-media platforms themselves act," not third-party content. Ad targeting, feed design, notification timing and default settings are first-party choices, and laws about them survive 230 even where they fall to the First Amendment.
- **Location is the key.** Every one of these laws applies to users in the state. The account's home jurisdiction from sign-up isn't enough; the rules resolve against the jurisdiction where the user is, with a policy for travelers and VPNs, recorded on each age signal as the playbook's `jurisdiction` column does.

## Federal Bills

As of October 2026 no new federal minors' online safety law has passed. The House passed H.R. 7757, the Kids Internet and Digital Safety Act (KIDS Act), on June 29, 2026: it consolidates provisions from 14 proposals, would default platforms to their most protective settings for children and teens, restrict push notifications, autoplay and infinite scroll, regulate AI chatbots, ban targeted advertising to minors, extend privacy protections to teens, incentivize age verification and preempt weaker state laws, but omits the Kids Online Safety Act's duty of care, which Senate sponsors call essential. A platform that builds the defaults table above can absorb whichever version passes.

## Design Liability

The newest pressure comes from juries, not regulators. On March 25, 2026 a Los Angeles jury found Meta and YouTube liable to a 20-year-old plaintiff who said she became addicted as a child, awarding $3 million in compensatory damages (70% Meta, 30% YouTube) and $3 million in punitive damages; TikTok and Snap settled before trial. The claims were about design (infinite scroll, autoplay, notifications), and jurors were told not to consider the content of the posts and videos because of Section 230 ([The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#the-addiction-cases)). A New Mexico jury found against Meta the same week under state law.

For builders, the consequence is evidentiary. A design-defect claim asks what the platform knew about a feature's effect on young users and what it chose. The records that answer are the experiment that launched the feature, the metrics it optimized, the age segments it measured, and the defaults it chose for minors and when. Keep feature launches, experiment results and default changes as dated records with owners ([Experimentation](/docs/telemetry/experimentation)), and assume they'll be read by a jury.

## The Imgur Case

The UK's first fine under its children's data rules for a user-generated platform shows what "no age assurance" costs. The ICO investigated how Imgur used children's information and its approach to age assurance, issued a notice of intent to fine on September 10, 2025, and on February 5, 2026 fined MediaLab.AI, Imgur's owner, £247,590 for the period September 2021 to September 2025: no age checks, under-13s' data processed without parental consent or another lawful basis, and no data protection impact assessment. Imgur blocked UK users from September 30, 2025, and the ICO said leaving "does not allow an organisation to avoid responsibility" ([Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#withdrawals)).

Nothing in the findings required age verification for every user. They required knowing that children used the service, assessing the risk (the DPIA), and having a lawful basis for under-13s' data. A platform that can't show those three things for its own audience is exposed the same way, whatever its size.

## How to Build It

The chapter adopts `age_signals` and `parental_consents` from [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy#how-to-build-it), owns the `accounts.age_band` cache, and adds checks, rules, guardian links and restrictions.

```sql
ALTER TABLE accounts                     -- age_band from Accounts, Identity & Standing
  ADD CONSTRAINT accounts_age_band_check CHECK (age_band IN ('under_13', '13_15', '16_17',
    'adult', 'unknown'));                -- a cache of effective_band(); 'unknown' gates as youngest

CREATE TABLE age_checks (                -- one attempt to establish age, from prompt to result
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  trigger          TEXT NOT NULL CHECK (trigger IN ('sign_up', 'feature_gate',
                     'jurisdiction_rule', 'inference_flag', 'report', 'appeal')),
  feature          TEXT,                 -- what the user tried to do, for feature gates
  jurisdiction     TEXT NOT NULL,        -- 'GB', 'AU', 'US-GA'
  method           TEXT CHECK (method IN ('inference', 'facial_estimation', 'document',
                     'platform_signal', 'parent_confirmation')),
  vendor           TEXT,                 -- null when on-device or in-house
  vendor_ref       TEXT,                 -- the vendor's session id, never the image
  prompted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,          -- null: abandoned
  outcome          TEXT CHECK (outcome IN ('passed_adult', 'placed_minor', 'inconclusive',
                     'failed', 'escalated')),
  estimated_age    NUMERIC(4, 1),        -- estimation only
  buffer_applied   BOOLEAN NOT NULL DEFAULT FALSE,  -- near the line: send to a stronger method
  evidence_deleted_at TIMESTAMPTZ,       -- images and documents, at the vendor and here
  age_signal_id    UUID REFERENCES age_signals (id)  -- the signal this check produced
);

CREATE TABLE feature_age_rules (         -- what each band may do, per jurisdiction, dated
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  feature          TEXT NOT NULL,        -- 'dm_from_non_friend', 'unblur_sensitive', 'go_live',
                                         -- 'public_profile', 'personalized_feed', 'night_push'
  jurisdiction     TEXT NOT NULL,        -- '*' for the default
  age_band         TEXT NOT NULL,
  mode             TEXT NOT NULL CHECK (mode IN ('off', 'on', 'default_off',
                     'needs_consent', 'needs_verified_adult')),
  params           JSONB,                -- e.g. {"large_server_members": 200}
  consent_scope    TEXT,                 -- parental_consents.scope, for 'needs_consent'
  effective        TSTZRANGE NOT NULL,
  source_url       TEXT NOT NULL         -- the law, code or ruling that set it
);

CREATE TABLE guardian_links (            -- consented supervision, not consent
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  guardian_account_id UUID NOT NULL REFERENCES accounts (id),
  teen_account_id  UUID NOT NULL REFERENCES accounts (id),
  visibility       TEXT[] NOT NULL,      -- 'new_friends', 'communities', 'contacts', 'purchases'
  controls         TEXT[] NOT NULL DEFAULT '{}',  -- settings the guardian may lock
  accepted_by_teen_at TIMESTAMPTZ NOT NULL,
  valid_during     TSTZRANGE NOT NULL,   -- either side ends it
  ended_by         TEXT CHECK (ended_by IN ('teen', 'guardian', 'platform', 'aged_out')),
  CHECK (guardian_account_id <> teen_account_id)
);

CREATE TABLE age_restrictions (          -- below a minimum age, or limited by age: not a penalty
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  kind             TEXT NOT NULL CHECK (kind IN ('below_minimum_age', 'feature_limited',
                     'pending_age_check')),
  jurisdiction     TEXT NOT NULL,        -- 'AU' for the under-16 rule
  rule_ref         TEXT NOT NULL,        -- the law or feature rule applied
  age_check_id     UUID REFERENCES age_checks (id),
  valid_during     TSTZRANGE NOT NULL,   -- ends on a passed check, an appeal or a birthday
  ended_reason     TEXT CHECK (ended_reason IN ('verified_older', 'appeal_upheld',
                     'aged_in', 'rule_lifted'))
);
```

Notes on the sketch:

- **The band is derived and cached.** `effective_band(account)` is the playbook's lowest-wins over current `age_signals`; a trigger or job writes it to `accounts.age_band` whenever a signal arrives or a birthday crosses a line, and every gate reads the cache only as a hint, re-evaluating at the moment of a sensitive action. Unknown gates as youngest.
- **Checks are the funnel.** Each prompt is an `age_checks` row whether or not the user finishes, so prompted, completed, passed and method (Discord's published figures) are a group-by. A completed check writes an `age_signals` row with the method and jurisdiction.
- **Evidence has a deletion time.** `evidence_deleted_at` records when the image or document was deleted at the vendor and locally, which is what the FTC's policy statement and the Children's Code ask for, and what a breach inquiry asks first. A check with a vendor and no deletion time after a short window is an alert.
- **Rules are data with sources.** `feature_age_rules` maps feature, jurisdiction and band to a mode with parameters (Discord's 200-member threshold is a `params` value), effective-dated, citing the law or ruling. An injunction is a new row closing the old one, not a deploy. The evaluation is the playbook's `can_use()` with `needs_verified_adult` added.
- **Supervision is separate from consent.** `guardian_links` records what a teen agreed to share and who can end it; consent for collection, disclosure or purchases stays in `parental_consents`.
- **Restrictions aren't penalties.** An underage account under Australia's rule gets an `age_restrictions` row, not a `penalties` row and not `status = 'deactivated'`: it isn't misconduct, it doesn't count toward standing ([Account Standing](/books/user-generated-platforms/accounts-and-identity#account-standing)), and it ends on proof of age or a birthday, so the account can come back.
- **Events:** `age_check.prompted`, `age_check.completed`, `age_band.changed`, `age_restriction.applied`, `age_restriction.ended` and `guardian_link.changed` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to feeds, messaging, search and notifications, which re-apply defaults.

## Auditing

- **Every age decision** with the signals it used, the method, the vendor and the jurisdiction, so "why could this 14-year-old receive messages from strangers?" has an answer.
- **Every check's evidence deletion,** at the vendor and locally, with the time.
- **Every rule version** with the law or ruling behind it and the dates it was in force; court-driven switches recorded as changes to data.
- **Every default change and feature launch** affecting minors, with the experiment and metrics behind it, kept for the design-liability era.
- **Minimum age operations:** accounts found, restricted, appealed and restored, by method and date, as the evidence of reasonable steps.
- **Guardian links:** who saw what about whom, and when the link ended.

## What This Means for the System You Build

- **Treat unknown age as young** and let verified adults unlock, rather than the reverse.
- **Gate by feature:** contact from strangers, sensitive content, age-restricted communities and broadcasting need the strongest signal.
- **Layer the methods:** inference for most, on-device estimation next, ID for disputes, with a buffer near each threshold.
- **Keep the result, delete the evidence,** including in the appeals and support paths, and record when it was deleted at the vendor.
- **Publish and watch the funnel:** prompted, completed, passed, by method.
- **Put age rules in data** by feature, jurisdiction and band, with sources and effective dates, and expect courts to flip them.
- **Make supervision consented, visible and reversible,** showing activity, not content, and separate from parental consent.
- **Model underage removal as a restriction** that ends on proof of age or a birthday, not a penalty.
- **Keep design decisions as evidence:** launches, experiments and minors' defaults, dated and owned.
- **Know your audience:** a DPIA and a lawful basis for the children who use the service, whatever the terms say.

## References

**Law and regulation**

- [Cornell LII: Free Speech Coalition v. Paxton](https://www.law.cornell.edu/supremecourt/text/23-1122), the June 27, 2025 decision, intermediate scrutiny and the one-third threshold
- [Reason (Volokh Conspiracy): Eleventh Circuit rejects NetChoice's challenge to Georgia law](https://reason.com/volokh/2026/10/15/eleventh-circuit-rejects-netchoices-challenge-to-georgia-law-restricting-under-16-year-old-social-media-access/), the October 15, 2026 ruling, SB 351's requirements, *Moody*, Section 230 and the ad provision
- [Loeb & Loeb: Children's online privacy in 2026](https://www.loeb.com/en/insights/publications/2026/06/childrens-online-privacy-2026-state-app-store-design-code-and-social-media-laws), the state law status table as of June 2026
- [NetChoice: Litigation](https://www.netchoice.org/litigation/), the Ohio mandate stay and the Texas SCOPE Act injunction
- [Crowell: House advances bipartisan kids online safety bill](https://www.crowell.com/en/insights/client-alerts/house-advances-bipartisan-kids-online-safety-bill-but-senate-showdown-looms), H.R. 7757's passage, contents and the missing duty of care
- [Mayer Brown: FTC issues policy statement on age verification technologies under COPPA](https://www.mayerbrown.com/en/insights/publications/2026/02/ftc-issues-policy-statement-on-age-verification-technologies-under-coppa), the February 25, 2026 statement and its conditions

**Regulators**

- [eSafety Commissioner: Social media age restrictions](https://www.esafety.gov.au/about-us/industry-regulation/social-media-age-restrictions), the under-16 rule, named platforms, penalties, 4.7 million accounts, the 2026 powers
- [Ofcom: Online Safety industry bulletin, October 2026](https://www.ofcom.org.uk/online-safety/protecting-children/online-safety-industry-bulletin-october-2026), vendor due diligence, the "vet your vendor" resource, the June 15 age restrictions announcement and the assessment at 16
- [ICO: Statement on the Imgur investigation (September 30, 2025)](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/09/statement-update-on-imgur-investigation/), the notice of intent and the investigation's subject
- [ICO: ICO fines Imgur owner MediaLab over children's privacy failures](https://ico-newsroom.prgloo.com/news/ico-finesimgurownermedialabover-childrens-privacy-failures), the £247,590 fine and findings
- [ABC: Australia to enforce social media age limit of 16](https://abc13.com/post/australia-enforce-social-media-age-limit-16-week-fines-33-million/18251734/), Meta's Yoti appeal path for wrongly removed users

**Platform documentation**

- [Discord: Adapting Discord for the UK Online Safety Act](https://discord.com/safety/adapting-discord-for-the-uk-online-safety-act), the July 21, 2025 defaults, the 200-member thresholds, k-ID, on-device estimation and ID deletion
- [Discord: What is Family Center?](https://support.discord.com/hc/en-us/articles/14155039712407-What-is-Family-Center), opt-in connection, what parents see and don't
- [TechCrunch: Discord to roll out age verification next month](https://techcrunch.com/2026/02/09/discord-to-roll-out-age-verification-next-month-for-full-access-to-its-platform/), the March 2026 teen-by-default, methods, inference model and the October 2025 vendor breach
- [Pinterest: Teen safety on Pinterest](https://newsroom.pinterest.com/en-ca/news/teen-safety-on-pinterest/), private defaults by age and birthdate change verification

**Transparency reports**

- [Discord: Transparency Report, March 2025 to March 2026 (PDF)](https://cdn.discordapp.com/assets/transparency-reports/Discord-Transparency-Report-2026-Updated.pdf), the age assurance funnel by month and method
- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), accounts age-assured by country
- [Wikipedia: Online Safety Act 2023](https://en.wikipedia.org/wiki/Online_Safety_Act_2023), Bluesky's and Reddit's age assurance vendors for the July 2025 deadline

**In practice**

- [ABC7: Jury awards $6 million in landmark social media addiction trial](https://abc7news.com/post/los-angeles-social-media-addiction-trial-jury-finds-instagram-youtube-liable-landmark-court-case/18771272/), the March 25, 2026 verdict, damages split, design features, settlements and the Section 230 instruction
