+++
title = "Children's Privacy & Age Assurance"
nav_title = "Children's Privacy"
description = "Building for children: COPPA and its 2025 amendments, parental consent, the UK Children's Code, age assurance, state app-store laws and data minimization."
category = "Compliance"
order = 908
tags = ["compliance", "coppa", "children", "age-assurance", "privacy", "consent"]
+++

Most products that children can reach never set out to serve them. A game is rated for teens and twelve-year-olds play it anyway; a streaming app is built for families; an edtech tool is bought by a school; a social app says 13+ in its terms and has no way of knowing. The law doesn't care much what you intended. It asks who actually uses the product, what you know about them, and what you did once you knew.

Three ideas run through every regime in this chapter. **Know enough about age to apply the right rules,** and no more. **Get a parent involved before the risky things happen,** not after. **Collect and keep less from children** than you would from adults, with protective settings on by default. The rest is detail, and the detail changes: the US children's privacy rule was amended in 2025, the UK's age-check duties came into force in 2025, and US states began imposing age checks on app stores in 2026. Dates below are as of October 2026.

This describes how the rules shape a system. It isn't legal advice; which rules reach your product depends on its audience, features and markets, which is a question for counsel. The general privacy machinery (lawful bases, data subject rights, erasure) is in [GDPR & Privacy](/docs/compliance/gdpr) and [Data Retention & Deletion](/docs/architecture/data-retention); this chapter covers what changes when the person is a child.

## Which Rules Apply

| Regime | Who counts as a child | What it turns on | Applies when |
| --- | --- | --- | --- |
| **COPPA** (US federal) | Under 13 | Verifiable parental consent before collecting personal information; notice, parental review, security, retention | The service is directed to children, or the operator has actual knowledge it is collecting from a child |
| **GDPR Article 8** (EU) | Under 16 by default; member states may set 13 to 15 | Parental consent where consent is the lawful basis for an online service offered directly to a child | Consent-based processing for information society services |
| **UK GDPR Article 8** | Under 13 | The same, with the UK's age fixed at 13 | As above, in the UK |
| **UK Age Appropriate Design Code** | Under 18 | Fifteen standards: best interests, high-privacy defaults, minimization, no nudges, geolocation off | The service is likely to be accessed by children in the UK |
| **UK Online Safety Act** | Under 18 | Risk assessments; highly effective age assurance for the most harmful content | User-to-user and search services |
| **EU Digital Services Act, Article 28** | Minors | Privacy, safety and security for minors; no profiling-based ads to known minors | Online platforms accessible to minors |
| **US state app-store laws** (Utah, Texas, Louisiana) | Under 18, in bands | Age verification by the app store; parental consent for downloads, purchases and significant changes; developers consume the signals | The user is in the state; dates per state |

Two things stand out. The age that matters ranges from 13 to 18 depending on the regime, so a system that stores "is a child: yes or no" can't answer the questions it will be asked. And almost every regime reaches products that aren't aimed at children, through "actual knowledge", "likely to be accessed" or "accessible to minors". If children can get in, plan for them.

## COPPA

The Children's Online Privacy Protection Rule (16 CFR Part 312) is the US baseline. A **child** is "an individual under the age of 13." The rule reaches operators of a website or online service **directed to children**, and any operator with **actual knowledge** that it is collecting personal information from a child. Whether a service is directed to children is judged on its subject matter, visual content, animated characters, child-oriented activities and incentives, music, the age of models, celebrities who appeal to children, the ads on it, and evidence of who actually uses it, including "the age of users on similar websites or services."

### The 2025 Amendments

The FTC finalized changes to the rule in January 2025 by a 5-0 vote. They were published in the Federal Register on April 22, 2025: "The amended Rule is effective June 23, 2025," and regulated entities had **until April 22, 2026 to comply**, except for three safe-harbor reporting provisions (312.11(d)(1), (d)(4) and (g)) that ran on their own schedule. As of October 2026, the amended rule is fully in force. What changed for builders:

- **Separate consent for third-party disclosure.** An operator must let the parent consent to collection and use without consenting to disclosure to third parties, "unless such disclosure is integral to the website or online service," and must "obtain separate verifiable parental consent to such disclosure." The FTC's announcement names targeted advertising as the main target.
- **A broader definition of personal information.** It now includes "a government-issued identifier" and "a biometric identifier that can be used for the automated or semi-automated recognition of an individual," such as fingerprints, voiceprints, gait patterns, facial templates or faceprints.
- **A written information security program,** sized to the sensitivity of the data, with a named coordinator, annual risk assessments, testing and an annual review (312.8).
- **A written data retention policy,** published in the privacy notice, stating why children's data is collected, the business need to keep it, and when it is deleted. Children's personal information "may not be retained indefinitely" (312.10).
- **Mixed audience services** get a definition: directed to children but not primarily, and not collecting personal information "prior to collecting age information or using another means that is reasonably calculated... to determine whether the visitor is a child." The age screen "must be done in a neutral manner that does not default to a set age or encourage visitors to falsify age information."
- **New consent methods,** covered below.

The FTC dropped a proposal to restrict push notifications to children, and declined to require age verification beyond self-declaration.

### What Counts as Personal Information

The list is longer than most teams expect: name, address, online contact information, a screen or user name "where it functions in the same manner as online contact information", phone number, government identifier, a **persistent identifier** that can recognize a user over time and across services (a cookie ID, an IP address, a device serial or unique device identifier), a photo, video or audio file with the child's image or voice, geolocation precise enough to identify a street and city, biometric identifiers, and anything collected from the child and combined with one of those.

The persistent identifier is the one that catches products: any analytics SDK, crash reporter or ad network collects one. COPPA's way out is **support for the internal operations** of the service: maintaining and analyzing how it functions, network communications, authentication, personalizing content, serving contextual ads or capping ad frequency, security and integrity, legal compliance, and fulfilling a child's request. An identifier collected only for those purposes needs no parental consent (312.5(c)(7)), but it "cannot be used or disclosed to contact a specific individual, including through behavioral advertising, to amass a profile on a specific individual, or for any other purpose," and the privacy notice must say which internal operations it serves. Analytics that build a per-child profile for marketing are outside the exception.

### What the Operator Owes

- **Notice:** a direct notice to the parent before collection, stating what will be collected, how it's used, which third parties receive it and why, and that the parent can consent to collection without consenting to disclosure; plus an online notice linked from the home screen and every place data is collected (312.4).
- **Consent before collection,** and again before any material change in practices (312.5(a)).
- **Parental review:** on request, a description of what was collected, the chance to refuse further collection and have the data deleted, and a way to review it, after verifying the requester is the parent (312.6).
- **No conditioning:** a child's participation "in a game, the offering of a prize, or another activity" may not depend on disclosing more than is reasonably necessary (312.7).
- **Security and retention** as above.

Violations are treated as unfair or deceptive practices under the FTC Act, with civil penalties per violation. The largest to date, by the FTC's own description, is the $275 million civil penalty against Epic Games in December 2022 for COPPA violations in Fortnite ([Ratings, Age & Children](/books/gaming/ratings-and-age) covers the gaming orders).

## Verifiable Parental Consent

Consent must be obtained by a method "reasonably calculated, in light of available technology, to ensure that the person providing consent is the child's parent." The rule lists methods that qualify (312.5(b)(2)):

| Method | Notes |
| --- | --- |
| Signed consent form returned by mail, fax or electronic scan | Slow; high drop-off |
| Credit card, debit card or other online payment system, **in connection with a transaction** | The system must notify the account holder of each discrete transaction |
| Toll-free call to trained personnel | Staffing cost |
| Video conference with trained personnel | Staffing cost |
| Government ID checked against databases | The ID must be deleted promptly after verification |
| Knowledge-based authentication (new in 2025) | Dynamic multiple-choice questions a child "age 12 or younger in the parent's household could not reasonably ascertain" |
| Government photo ID matched to a live photo of the parent by facial recognition, confirmed by trained personnel (new in 2025) | ID and images deleted promptly after the match |
| **Email plus** | Only if the operator does not disclose children's data; a confirmatory email, letter or call follows, and the parent is told consent can be revoked |
| **Text plus** (new in 2025) | The same, by text message |

A safe harbor program approved by the FTC may also approve other methods for its members (312.5(b)(3)).

The choice is a product decision with legal limits. Email plus and text plus are the lowest-friction methods and are only available if you don't disclose children's data, which is one more reason not to: an ad network or data broker in the pipeline forces a stronger, costlier method on every family. Platform consent changes the picture too: where an app store or console has already verified a parent account and offers consent through its APIs (below), the store's flow can carry the consent, but it's still your obligation to check it.

There are exceptions to prior consent (312.5(c)), and they are narrow on purpose: collecting a parent's contact details only to ask for consent (deleted if no consent arrives in a reasonable time); answering a child's one-time request and then deleting the contact details; a child's safety; security, liability and legal process; a persistent identifier used only for internal operations; and a child's voice recording used only to answer the child's request and deleted immediately after.

## The UK Age Appropriate Design Code

The ICO's Children's Code is a statutory code of practice under UK data protection law. It was issued on August 12, 2020, took effect on September 2, 2020, and services were expected to conform by September 2, 2021. It applies to information society services "likely to be accessed by children," where a child is "a person under 18," and the ICO lists online games among the services covered, including free games funded by advertising. "Likely" means more probable than not; a service not aimed at children can still be in scope.

It sets fifteen standards: best interests of the child, data protection impact assessments, age appropriate application, transparency, detrimental use of data, policies and community standards, default settings, data minimisation, data sharing, geolocation, parental controls, profiling, nudge techniques, connected toys and devices, and online tools. The ones that change a build:

- **Default settings:** high privacy by default, unless there's a compelling reason otherwise.
- **Data minimisation:** collect and keep only the minimum personal data needed.
- **Data sharing:** children's data generally isn't shared.
- **Geolocation:** off by default.
- **Nudge techniques:** don't use them to lead children to provide unnecessary data or to weaken or turn off privacy settings.
- **Profiling and parental controls** have standards of their own; read them before building recommendation, ad or monitoring features for child users.

**Age appropriate application** is the code's age assurance standard: "Take a risk-based approach to recognising the age of individual users," establishing age "with a level of certainty that is appropriate to the risks," or applying the code's standards to all users instead. It names the approaches: self-declaration (for low-risk processing or alongside other methods), artificial intelligence that estimates age from how users interact (with users told up front and minimal data collected), third-party age verification returning a yes or no on an age attribute, account holder confirmation (an adult account confirming a child's age range), technical measures such as neutral age screens and stopping a user from immediately resubmitting a different age after a denial, and hard identifiers such as a passport, which the code says to avoid unless the risks clearly justify them. It describes development in five bands: 0-5, 6-9, 10-12, 13-15 and 16-17.

That last point is the design lever. Applying child-appropriate defaults to everyone is a legitimate way to comply, and for many products it's cheaper than knowing ages precisely.

## The UK Online Safety Act

The Online Safety Act became law on October 26, 2023. Its duties apply to search services and to services "that allow users to post content online or to interact with each other," which covers chat, user-generated content and most multiplayer games. The illegal content duties became enforceable on March 17, 2025; services likely to be accessed by children had to complete a children's risk assessment by July 24, 2025, and the government's explainer says the child safety regime was to be "fully in effect by Summer 2025." Fines run up to £18 million or 10 percent of qualifying worldwide revenue, "whichever is greater." Ofcom is the regulator, and publishes the codes and guidance that say what compliance looks like.

The age check is in section 12. A service must prevent children "of any age from encountering" **primary priority content** (pornography, and content encouraging, promoting or instructing self-harm, eating disorders or suicide), and that duty "requires a provider to use age verification or age estimation (or both)" unless its terms prohibit that kind of content for all users. The method "must be of such a kind, and used in such a way, that it is highly effective at correctly determining whether or not a particular user is a child." A self-declared birthday is not age verification or estimation. Which methods qualify as highly effective is set out in Ofcom's guidance; read it directly before choosing a vendor.

## The EU: DSA Article 28 and GDPR Article 8

The Digital Services Act requires providers of online platforms accessible to minors to take "appropriate and proportionate measures" for a high level of privacy, safety and security of minors, and bars advertising "based on profiling" when the provider is aware with reasonable certainty that the user is a minor. It doesn't oblige a provider to process extra personal data to determine age. The Commission's guidelines under it, launched on July 14, 2025, recommend accounts private by default for minors, the ability to "block and mute any user", "effective age assurance methods", and protection from commercial risks.

Separately, GDPR Article 8 makes consent-based processing for an online service offered directly to a child lawful from 16, or a lower age a member state sets "not below 13"; below that, a parent must give or authorize consent, and the controller "shall make reasonable efforts to verify" it. The UK version fixes the age at 13. Article 8 matters only where consent is your lawful basis; processing needed to run the service usually rests on contract instead ([GDPR & Privacy](/docs/compliance/gdpr#lawful-bases)).

## US State App-Store Laws

Since 2026, several US states have moved age checks to the app store, with duties for developers that consume the result.

**Utah's App Store Accountability Act** (S.B. 142, 2025) is the template. From its enrolled text:

- **Age categories:** "child" (under 13), "younger teenager" (13 to under 16), "older teenager" (16 to under 18) and "adult."
- **App store duties** (13-75-201, effective May 6, 2026): at account creation, request age information and verify the age category; for a minor, require affiliation with a parent account and obtain verifiable parental consent before the minor downloads an app, purchases an app or makes an **in-app purchase**; notify users and parents of a developer's significant change and obtain renewed consent for minors; share age category data and consent status with developers.
- **Developer duties** (13-75-202, effective May 6, 2026): verify age category and consent status through the store's data sharing; notify the store of a **significant change**; use the age data to enforce the developer's own age restrictions, comply with law and apply safety features and defaults; request age data or consent at download, purchase or a significant change. Developers may re-request no more than once in 12 months, on reasonable suspicion of account transfer or misuse, or at new account creation. When applying safety defaults, a developer "shall use the lowest age category" from the store's data or its own. A developer may not enforce its terms against a minor without verified parental consent, and may not "share age category data with any person."
- **Significant change** is defined: a material change to terms or privacy policy that changes the data collected, alters the app's age rating or content descriptions, "adds new monetization features," including in-app purchases or advertisements, or materially changes functionality or user experience.
- **Enforcement** (13-75-401) takes effect **December 31, 2026**: a harmed minor or parent can sue for the greater of actual damages or $1,000 per violation, plus attorney fees. A developer that relied in good faith on the store's age and consent data and met its own duties has a safe harbor (13-75-402).

**Texas SB 2420** imposes similar duties. Its history is a lesson in why dates belong in data: Apple announced Texas implementation for January 1, 2026; on December 23, 2025 it paused after "a recent injunction issued by a district court suspended enforcement"; and on June 3, 2026 it announced that "a recent court ruling" had lifted the injunction, with the law applying to new Apple Accounts in Texas from June 4, 2026. Google's Play Age Signals API returns signals for eligible Texas users who created accounts after May 28, 2026. **Louisiana** applies to new Apple Accounts from July 1, 2026, per Apple. Other states have passed or are considering similar laws; check counsel for the current list.

### What the Platforms Give You

- **Apple** shares age categories through the **Declared Age Range API**, available worldwide on iOS 26 and later, which returns the age band or the category the law defines, with the verification method and whether parental controls are on. The **Significant Change API** in PermissionKit asks a parent for renewed consent; until the parent consents, "the child must be prevented from accessing the significant update." When a parent revokes consent, Apple stops the app launching and sends a `RESCIND_CONSENT` App Store Server Notification. Apple is explicit that "developers are responsible for their own age restrictions" and that deciding what counts as a significant change is the developer's call. Since February 24, 2026, Apple also blocks downloads of 18+ apps in Australia, Brazil and Singapore unless the user is confirmed as an adult.
- **Google** offers the **Play Age Signals API** (beta as of its July 2026 documentation), returning signals in Brazil since March 17, 2026 and in Texas as above. Its terms limit use to providing "age-appropriate content and experiences in compliance with laws" and prohibit using it for "advertising, marketing, user profiling, or analytics."

Both are signals you consume, not compliance you inherit. Build to read them, store what they said and when, and act on them.

## Designing Age Assurance

Age assurance is the umbrella for every way of establishing age, with different certainty, cost and intrusion:

| Method | Certainty | Cost to the user | Data it creates |
| --- | --- | --- | --- |
| Self-declaration (an age screen) | Low; easily falsified | Seconds | A claimed birth date or band |
| Platform or account-holder signal (store, console, parent account) | Whatever the platform established | None, if already set up | A band and a method from the platform |
| Inference from behavior | Varies; probabilistic | None | Model output on behavioral data |
| Facial age estimation | Moderate to high; error grows near the threshold | A selfie or short video | An estimate; the image should be deleted |
| Document or database verification | High | An ID and often a selfie | Identity data, which should be deleted |

Vendors publish error figures for estimation, and they're worth reading closely. Roblox, which requires a facial age check before chat, reported in January 2026 that its vendor's models reached a "Mean Absolute Error of 1.4 years for users younger than 18" in testing under the UK's Age Check Certification Scheme, that images and video are deleted immediately after processing, and that users who dispute the result can verify by ID or have a parent set their age. An average error of 1.4 years means a check at 13 or 16 can't rely on estimation alone close to the line: build a buffer, or a fallback to a stronger method for anyone estimated near the threshold.

My rule: **pick the method per feature, not per product.** A neutral age screen is enough to route a new user to the right consent flow. Open chat with strangers, purchases, or adult content need a stronger signal. Nothing at all is needed for features you've made safe for everyone.

### The Age Screen

The neutral age screen is the most common gate and the easiest to get wrong. COPPA and the ICO agree on its shape:

- **Ask neutrally.** Ask for a birth date or year with no default value and no hint about which answers unlock the product. "You must be 13 or older" next to the field invites a lie, and COPPA's mixed-audience definition requires a screen that doesn't "encourage visitors to falsify age information."
- **Don't allow an immediate retry.** If a user enters an age under the threshold, don't let them go back and enter a different one (the ICO names this as a technical measure). A cookie or device flag works; it doesn't have to be perfect.
- **Route, don't reject.** An under-13 answer should lead to a child experience or a parental consent flow, not a dead end that teaches the child to lie next time.
- **Collect nothing first.** On a mixed-audience service, no personal information beyond the 312.5(c) exceptions before the age is known.

### Age as a Record, Not a Field

Age assurance produces signals over time: a self-declared birth year at sign-up, a band from the app store in Utah, an estimate from a check before chat, a parent's correction, a behavioral flag that suggests the user is younger than they said. Store them as records with their method and time, and derive the age band the rules use from the strongest current signal, applying Utah's rule as a general one: when signals disagree, **protect to the lowest**.

## Data Minimization for Minors

Children's data is a liability with a clock on it. The rules converge on the same practice:

- **Collect for a feature, not in case.** A child account needs a credential and settings; it rarely needs a real name, an email (a parent's is enough), a precise location or a photo. Display names should be chosen from safe lists or filtered, because a screen name that works as contact information is personal information under COPPA.
- **Defaults off.** Profiling, precise geolocation, public profiles and open chat with strangers start off for children (the Children's Code; the DSA guidelines' "private by default"). The FTC's orders in games went further and required chat to be off by default for children and teens ([Ratings, Age & Children](/books/gaming/ratings-and-age)).
- **No behavioral ads.** Contextual ads and frequency capping fall within COPPA's internal operations; behavioral ads to a known child need separate consent, and the DSA bars profiling-based ads to known minors. In practice, ad stacks for child users should be contextual only, configured per user, not per app.
- **Keep the outcome, delete the evidence.** COPPA's ID and photo-ID consent methods require deleting the ID and images promptly after verification. Apply that to every age check: keep the band, method, vendor reference and date; delete the selfie, the document image and the raw birth date if you only need a band.
- **A retention schedule per data type,** published, with automatic deletion ([Data Retention & Deletion](/docs/architecture/data-retention#retention-schedules-by-record-type)). "Until the account is closed" is not a schedule for a child who stops playing at nine and never closes the account; inactive child accounts need their own clock.
- **Third parties under contract.** COPPA requires written assurances from service providers that receive children's data (312.8(c)); an SDK you embed is a service provider or a third party, and you need to know which.

## How to Build It

The parts: age signals, a derived age band, consents by scope, and a policy that maps band, consent and jurisdiction to what each feature may do. Tables follow the playbook's [naming conventions](/docs/database/naming-conventions); `accounts` is your product's account table.

```sql
CREATE TABLE age_signals (                  -- every observation of age, append-only
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id   UUID NOT NULL REFERENCES accounts (id),
  age_band     TEXT NOT NULL CHECK (age_band IN ('under_13', '13_15', '16_17',
                 'adult', 'unknown')),      -- add bands if a market draws a line at 14 or 15
  method       TEXT NOT NULL CHECK (method IN ('self_declared', 'parent_declared',
                 'platform_signal', 'estimation', 'document', 'inferred')),
  source       TEXT,                        -- 'apple_declared_age_range', vendor name, ...
  source_ref   TEXT,                        -- the vendor's or platform's reference, never the image
  jurisdiction TEXT NOT NULL,               -- where the user was when observed: 'US-UT', 'GB', 'DE'
  observed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parental_consents (            -- one row per scope; revocation ends the range
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  child_account_id UUID NOT NULL REFERENCES accounts (id),
  parent_ref       TEXT NOT NULL,           -- parent account id or verified contact
  scope            TEXT NOT NULL CHECK (scope IN ('collection', 'third_party_disclosure',
                     'chat', 'purchases', 'significant_change')),
  method           TEXT NOT NULL CHECK (method IN ('signed_form', 'card_transaction',
                     'toll_free_call', 'video_call', 'government_id', 'knowledge_based',
                     'photo_id_match', 'email_plus', 'text_plus', 'platform')),
  notice_version   TEXT NOT NULL,           -- the direct notice the parent saw
  evidence_ref     TEXT,                    -- transaction id, call record, platform receipt
  valid_during     TSTZRANGE NOT NULL,
  revoked_by       TEXT CHECK (revoked_by IN ('parent', 'platform', 'operator')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Decisions behind it:

- **Consent is per scope.** COPPA separates collection from third-party disclosure; Utah separates downloads and purchases from significant changes; products separate chat. A single "parent approved" flag can't express "yes to the account, no to advertisers," and that's the combination the 2025 amendments are built around.
- **The method is recorded** so you can show the consent was verifiable, and so a method that loses its eligibility (email plus, once you start disclosing data) can be found and re-consented.
- **Revocation ends the range, it doesn't delete the row.** Apple's `RESCIND_CONSENT`, a parent's request through support and an operator's own decision all close `valid_during` with who did it. The consent record itself is evidence you'll need later ([Audit Trails](/docs/architecture/audit-trails)).
- **The band is derived, not stored on the account.** A view or service computes the effective band from the latest signals with the lowest-wins rule, and every decision records which signals it used.

The policy is data, not code: a table of rules keyed by jurisdiction and band, effective-dated, that say what each feature does (off, on with consent, on), because the dates in this chapter will keep moving ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)). A sketch of the evaluation:

```text
can_use(account, feature, now):
  band     = effective_band(account)              -- lowest of current signals; 'unknown' -> treat as child
  rules    = feature_rules(feature, jurisdiction(account), band, now)
  if rules.mode == 'off':                return deny
  if rules.mode == 'on':                 return allow
  if rules.mode == 'needs_consent':
    if consent(account, rules.consent_scope, now): return allow
    return ask_parent(rules.consent_scope)        -- the flow, not a dead end
```

Treating "unknown" as the youngest band is what makes the gate fail safe: a missing signal never unlocks a feature.

Three flows need care:

1. **Significant changes.** Adding purchases, ads, chat or new data collection is a significant change under Utah's definition, and a material change requiring fresh consent under COPPA. Make it a release checklist item that creates a consent requirement, so the feature stays off for child accounts until consent arrives, rather than a legal review after launch.
2. **Revocation and deletion.** When consent is revoked, stop the processing it covered, and if the parent asks, delete the child's data, including in analytics, backups on their schedule and any third party you disclosed to ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-requests)).
3. **Aging up.** A child turns 13, 16 or 18. Re-evaluate on the date, offer the new choices to the user (and in some regimes the parent), and don't silently switch on what was off: the defaults that protected them are now their own settings to change.

## Checklist

| Obligation | Engineering practice |
| --- | --- |
| Know which rules apply | A per-market table of regimes, age thresholds and effective dates, kept as dated rules with sources |
| Neutral age screen | No default value, no hints, no immediate retry, routes under-age answers to a child flow; collects nothing first |
| Age signals | Every observation stored with method, source and jurisdiction; effective band derived with lowest-wins; unknown treated as a child |
| Platform age laws | Store signals and consent status read from app-store APIs; significant changes notified; `RESCIND_CONSENT` handled |
| Verifiable parental consent | Consent per scope with method, notice version and evidence; email or text plus only while no data is disclosed |
| Separate consent for disclosure | Third-party SDKs and ad stacks off for child accounts until that scope is consented |
| Protective defaults | Profiling, precise location, public profiles and open chat off by default for minors |
| Minimization | Age-check images and IDs deleted after verification; only band, method and reference kept |
| Retention | A written, published schedule per data type, with deletion jobs and an inactivity clock for child accounts |
| Security | A written security program with an owner, annual risk assessment and testing for children's data |
| Parental rights | Review, refusal and deletion requests verified and honored across systems and processors |
| Proof | An audit record of every age decision, consent, revocation and deletion |

## References

**Specifications**

- [Federal Register: Children's Online Privacy Protection Rule (April 22, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm), the amended rule's text, effective date of June 23, 2025, compliance date of April 22, 2026, consent methods, definitions and retention
- [Utah S.B. 142: App Store Accountability Act (enrolled, PDF)](https://le.utah.gov/Session/2025/bills/enrolled/SB0142.pdf), age categories, app store and developer duties, significant change, safe harbor and effective dates
- [Online Safety Act 2023, section 12](https://www.legislation.gov.uk/ukpga/2023/50/section/12), the duty to use highly effective age verification or estimation for primary priority content
- [UK GDPR Article 8](https://www.legislation.gov.uk/eur/2016/679/article/8), the UK's age of 13 for consent-based online services
- [GDPR Article 8 as adopted](https://www.legislation.gov.uk/eur/2016/679/article/8/adopted), age 16 by default, member states may lower it to no less than 13

**Reference**

- [FTC: Changes to the children's privacy rule (January 16, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data), the 5-0 vote, opt-in consent for targeted advertising, retention limits and the dropped push notification proposal
- [FTC: Complying with COPPA, frequently asked questions](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions), the FTC's guidance, which notes it predates parts of the 2025 amendments
- [ICO: Age appropriate design, a code of practice for online services](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/), the fifteen standards
- [ICO: Services covered by this code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/services-covered-by-this-code/), under-18s, "likely to be accessed" and online games in scope
- [ICO: Age appropriate application](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/3-age-appropriate-application/), the risk-based standard, age assurance approaches and the five age bands
- [ICO: Transitional arrangements](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/transitional-arrangements/), issued August 12, 2020, in effect September 2, 2020, conformance by September 2, 2021
- [GOV.UK: Online Safety Act explainer](https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer), scope, primary priority content, dates and fines
- [Springlex: DSA Article 28](https://www.springlex.eu/en/packages/dsa/dsa-regulation/article-28/), a reproduction of the article's text: measures for minors, no profiling-based ads to known minors, no duty to process extra data to determine age
- [European Commission: Guidelines on the protection of minors under the DSA](https://ec.europa.eu/newsroom/betterinternet/items/895787/en), launched July 14, 2025; private-by-default accounts, blocking and muting, effective age assurance

**In practice**

- [Apple: Age assurance frameworks](https://developer.apple.com/support/age-assurance/), the Declared Age Range API, PermissionKit significant changes, `RESCIND_CONSENT` and developer responsibility
- [Apple: Next steps for apps distributed in Texas (November 4, 2025)](https://developer.apple.com/news/?id=2ezb6jhj), the planned January 1, 2026 start and Texas age categories
- [Apple: Update on age requirements for apps distributed in Texas (December 23, 2025)](https://developer.apple.com/news/?id=8jzbigf4), the injunction against SB 2420 and the paused implementation
- [Apple: Update for apps distributed in Texas (June 3, 2026)](https://developer.apple.com/news/?id=sg176nne), the injunction lifted and the law applying to new Texas accounts from June 4, 2026
- [Apple: Age requirements for apps distributed in Brazil, Australia, Singapore, Utah, and Louisiana (February 24, 2026)](https://developer.apple.com/news/?id=f5zj08ey), Utah from May 6, 2026, Louisiana from July 1, 2026, and 18+ download blocking
- [Android Developers: Play Age Signals API](https://developer.android.com/google/play/age-signals/overview), signals in Brazil and Texas, and the prohibition on advertising, profiling and analytics use
- [Roblox: Age checks required to chat (January 7, 2026)](https://about.roblox.com/newsroom/2026/01/roblox-age-checks-required-to-chat), facial age estimation with a 1.4-year mean absolute error under 18, image deletion and ID fallback
