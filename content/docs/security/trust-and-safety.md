+++
title = "Trust & Safety"
description = "Moderation for any product where people post, chat or trade: policies, report queues, automated detection with review, penalties, appeals and reporting duties."
category = "Security"
order = 711
tags = ["security", "trust-and-safety", "moderation", "abuse", "child-safety", "audit"]
+++

Any product where one user can reach another needs moderation: a game with chat, a social app, a marketplace with listings and messages, a review site, a SaaS tool with shared workspaces. The other chapters in this section defend the system from attackers. This one defends users from each other, and it has a different shape: the "attack" is often legal speech in the wrong place, the attacker is often a customer you want to keep, and the evidence is a message, an image or a voice clip that someone has to judge.

Trust and safety is a system, not a team's inbox. It has a specification (the policy), an intake (reports and detection), a decision engine (automation and people), outputs (penalties and notices), a correction loop (appeals), a record (the audit trail) and a public account of itself (transparency reports). Each part is ordinary engineering; the failures come from building one part well and leaving out the others. A good classifier with no appeals path bans innocent people at scale. A good report button with no queue behind it teaches users that reporting is pointless.

The Fair Play Alliance and the ADL's Center for Technology and Society put the same idea in three words when they describe penalty and reporting systems: **policy** (rules of conduct), **procedure** (formal courses of action for infractions and for telling the people affected) and **product** (the reporting, assessment, penalty, measurement and feedback systems that enforce the policy) ([FPA and ADL: Planning a Penalty and Reporting System](https://thrivingingames.org/wp-content/uploads/2020/12/FPA-Framework-Planning-Penalty-Reporting-System.pdf)). The guide is written for games, and nothing in those three words is specific to them.

## Policy Is the Specification

Moderation decisions are only as consistent as the rules they apply, so the policy comes first and lives in two layers:

- **Public rules** (community standards, a code of conduct, prohibited listings) that users can read and that a notice can cite.
- **Enforcement guidelines** for moderators and models: definitions, examples on both sides of each line, the evidence a decision needs, and the penalty each violation earns at each step of the ladder.

Make the categories data. A violation category is an enum shared by the report form, the classifiers, the moderator console, the penalty ladder, the notice templates and the transparency report: `harassment`, `hate`, `sexual_content`, `child_safety`, `violent_extremism`, `self_harm`, `spam`, `fraud`, `impersonation`, `personal_information`, `illegal_goods`. If the report form says "abusive" and the penalty table says "harassment", someone writes a mapping, and the mapping is where your numbers stop adding up.

Version the policy the way [Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions) versions any rule: effective-dated, with every decision recording the version it applied. When the rule on a slur changes, last month's decisions were still right under last month's rule, and an appeal reviews them under the version that was in force.

The same FPA guide warns against the most common shortcut: staff who apply penalties ad hoc as they encounter bad behavior. Its advice is to be clear on who can issue, modify or revoke penalties, keep track of every penalty issued or modified and why, and send even a staff member's complaint through the reporting system. That's [least privilege](/docs/security/authorization#least-privilege) applied to enforcement.

## Reports and Queues

A report is a signal, not a verdict. Users report things that break no rule (an opponent who beat them, a seller with a slow reply), coordinate false reports against people they dislike, and report real abuse with the wrong category. Design for all three.

**Capture context at report time.** The report names the reporter, the subject (an account, a message, a listing, a match), the category, an optional comment and, crucially, a pointer to the evidence as it was when reported: the message ID and its text, the image hash, the audio clip, the listing version. Content gets edited and deleted; the snapshot is what the moderator judges ([Audit Trails](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you) makes the same point about records).

**Group reports into cases.** Fifty reports about one message are one decision, not fifty. Group by subject and time window, keep every report linked to its case, and let the count and diversity of reporters raise the case's priority.

**Prioritize by harm, then by age.** A queue sorted by arrival time buries a threat of violence behind ten thousand spam reports. Priority comes from the category's severity first, then from signals (reporter credibility, number of distinct reporters, the subject's history, classifier scores), then from age. Child safety and threats to life go to a separate, staffed queue with its own response target, never behind the general backlog.

**Weigh reporters.** A reporter whose reports are usually upheld is a better signal than one whose reports never are. Track each reporter's upheld rate and feed it into priority; repeated bad-faith reporting is itself a violation (abuse of the reporting system) with its own penalty.

**Close the loop with the reporter.** Tell reporters that action was taken, without naming the penalty or the person. Silence teaches users that reporting is pointless, and they stop.

```sql
CREATE TABLE moderation_cases (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL REFERENCES tenants (id),
  subject_type     TEXT NOT NULL CHECK (subject_type IN ('account', 'message', 'media', 'listing', 'profile')),
  subject_id       UUID NOT NULL,
  category         TEXT NOT NULL,
  priority         SMALLINT NOT NULL,
  source           TEXT NOT NULL CHECK (source IN ('user_report', 'proactive', 'trusted_flagger', 'legal_request')),
  state            TEXT NOT NULL DEFAULT 'open'
                     CHECK (state IN ('open', 'in_review', 'decided', 'escalated', 'closed')),
  evidence_ref     TEXT NOT NULL,
  report_count     INTEGER NOT NULL DEFAULT 0,
  opened_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at       TIMESTAMPTZ
);

CREATE TABLE reports (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL REFERENCES tenants (id),
  case_id          UUID NOT NULL REFERENCES moderation_cases (id),
  reporter_id      UUID NOT NULL REFERENCES users (id),
  category         TEXT NOT NULL,
  comment          TEXT,
  reported_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The `evidence_ref` points into an evidence store with its own access controls and retention, not into the live content table. Evidence for child-safety cases has stricter rules still (below).

## Automated Detection, Human Review

At any real scale most moderation is automated, and the published numbers say so. Xbox's transparency report for 2025 says 14.8 billion pieces of content were proactively scanned, 2.5% of it was identified as harmful or policy-violating, and "65% of user reports and 97% of total reports were processed using automated systems" ([Xbox Transparency Report 2025](https://cms-assets.xboxservices.com/assets/8b/d9/8bd9775f-8742-4f12-ae2f-b296307316e7.pdf?n=2834905.pdf)). Automation isn't the question; where the humans sit is.

Detection comes in three kinds, and they fail differently:

- **Hash matching** finds copies of content already judged: known child sexual abuse imagery, known terrorist content, your own previously removed images. It's precise and finds nothing new.
- **Rules and lists** (blocked terms, link and phone-number patterns, velocity limits on new accounts) are cheap, explainable and easy to evade with spacing, look-alike characters and slang. Commercial text filters advertise handling exactly those evasions; Microsoft's Community Sift lists "subversions, acronyms, l33T speak, emojis" ([Microsoft: Community Sift](https://developer.microsoft.com/en-us/games/products/community-sift/)).
- **Classifiers** (text, image, audio and behavior models) find new content and new patterns, produce scores rather than answers, and drift as language and abuse change.

Turn a score into a decision with bands, the same shape [Matching & Merging](/docs/architecture/record-linkage#review-bands) uses for record links: above an upper threshold the system acts on its own, between the thresholds it queues the case for a person, below the lower threshold it does nothing. Set the bands per category, because the costs differ. Auto-removing spam with a 2% false positive rate is fine; auto-banning for harassment at that rate means thousands of wrongful bans a week, each one a support ticket and an appeal.

Keep the automation honest:

- **Act on content before accounts.** Hiding a message is cheap to undo; suspending an account is not. Let automation remove, blur or hold content freely and require higher confidence, or a person, for account penalties.
- **Sample automated decisions** into a human QA queue every day, by category, and measure precision from the samples. Xbox names "a robust quality assurance program, moderator reviews, a suite of player reporting tools, and an appeals process" as its safeguards on automation.
- **Watch the appeal reversal rate** of automated decisions as a first-class model metric.
- **Record the model and threshold** on every automated decision (below).

Anything built on a language model inherits the issues in [AI & LLM Security](/docs/security/ai-security): the content under review is attacker-controlled input, so a moderation prompt can be injected by the very message it's judging. A model that classifies is safer than one that acts; keep the action in code.

## Penalties and Escalation Ladders

A penalty system answers two questions for every violation: how severe was it, and has this person done it before? Write the answer down as a ladder per category, not as moderator discretion.

| Step | Typical penalty | Applies to |
| --- | --- | --- |
| 1 | Warning with the content shown and the rule cited | First minor violation |
| 2 | Feature restriction (chat, posting, messaging, listing) for a short period | Repeat minor, first moderate |
| 3 | Longer feature restriction or temporary suspension | Continued violations |
| 4 | Long suspension | Severe, or a long pattern |
| 5 | Permanent ban, with device or payment-instrument bans where evasion is likely | Zero-tolerance categories, any step |

Three rules make ladders work:

- **Severity can skip steps.** Some categories go straight to the top on a first offense. Xbox's report says that at Xbox Game Studios, violations of its child sexual exploitation, grooming and violent extremism policies result in removal and a permanent suspension "even if it is a first offense".
- **Strikes expire.** A violation two years ago shouldn't weigh like one yesterday. Each strike carries a `valid_during` range, and the ladder counts strikes in force, which also gives reformed users a path back.
- **Restrict the feature that was abused.** Someone who harasses in chat can lose chat and keep everything else, which protects others without taking away a product they paid for. Xbox describes its own ladder this way: repeated violations lead to longer suspensions and "can culminate in a 12-month suspension of social features", with permanent account suspensions or device bans for particularly egregious violations.

```sql
CREATE TABLE penalties (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL REFERENCES tenants (id),
  account_id         UUID NOT NULL REFERENCES users (id),
  decision_id        UUID NOT NULL REFERENCES moderation_decisions (id),
  kind               TEXT NOT NULL CHECK (kind IN
                       ('warning', 'feature_restriction', 'suspension', 'permanent_ban')),
  restricted_feature TEXT,
  ladder_step        SMALLINT NOT NULL,
  valid_during       TSTZRANGE NOT NULL,
  revoked_at         TIMESTAMPTZ,
  revoked_reason     TEXT
);
```

Enforcement reads penalties at the points that matter (sign-in, posting, sending a message, joining a session), not just in the moderation console, and caches them briefly with explicit invalidation when a penalty starts or is revoked.

Ban evasion is the cost of every ban. People create new accounts, so an account ban without links to devices, payment instruments and other signals is a speed bump. Linking accounts to one person is a [Matching & Merging](/docs/architecture/record-linkage) problem with the same rule as everywhere else: link with evidence, review the uncertain middle, never merge two people because they share a household router.

## Notices and Statements of Reasons

A penalty nobody explains is one the user can't learn from and can't contest. Every decision against a user gets a notice: what was actioned, which rule it broke, how it was detected (a report, automation, a person), how long the penalty lasts and how to appeal. The Santa Clara Principles, a civil-society standard for moderation, ask for exactly this: notice to "each user whose content is removed, whose account is suspended", naming the specific guideline, how the content was detected, and how to appeal including any time limits ([Santa Clara Principles 2.0](https://santaclaraprinciples.org/)).

In the EU this is law. The Digital Services Act requires hosting providers to give affected users a statement of reasons, and the Commission's documentation for its transparency database lists what Article 17(3) requires in one: the type of restriction with its duration and territorial scope, the facts and circumstances relied on, information on the use of automated means, and the legal or contractual ground with an explanation ([DSA Transparency Database: Documentation](https://transparency.dsa.ec.europa.eu/page/documentation)). Online platforms must also submit their statements of reasons to that public database without personal data (Article 24(5)), and the database's front page counted more than 4.5 billion statements submitted in the last 180 days as of October 26, 2026 ([DSA Transparency Database](https://transparency.dsa.ec.europa.eu/)). The database fields record whether automated means detected the content and whether the decision was fully automated, partially automated or not automated, which is a good reason to store exactly that on every decision whether or not you operate in the EU.

Build notices from the decision record, not from free text: the category, policy version, evidence excerpt, automation level and penalty all come from the data, and a template per locale turns them into words. Send them through the normal [notification](/docs/architecture/notifications) path, and keep them visible in the user's account (a "your standing" page) so they aren't lost in an inbox.

## Appeals

Automated or not, moderation makes mistakes, and appeals are how you find them. Xbox handled over 332,000 appeals ("case reviews") in 2025 and reinstated 26% of them ([Xbox Transparency Report 2025](https://cms-assets.xboxservices.com/assets/8b/d9/8bd9775f-8742-4f12-ae2f-b296307316e7.pdf?n=2834905.pdf)). A quarter of appealed decisions were overturned; any system that doesn't offer appeals is making those mistakes silently.

- **A different reviewer.** Santa Clara asks for review by a person or panel not involved in the original decision, who understands the language and cultural context, with a chance for the user to add information and a result with reasoning they can understand. Enforce "not the original reviewer" in data, the way [Support Access](/docs/security/support-access#approvals-and-nobody-approves-their-own) enforces separate approvers.
- **Proportionate.** Not every warning needs an appeal; Xbox offers case reviews when an enforcement exceeds a certain length. Every suspension and ban does.
- **Outcomes are decisions too.** An appeal upholds, modifies or reverses, and each outcome is a new decision record that points at the one it reviewed, never an edit to it ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Reversals feed back.** A reversal tells you which reviewer, rule or model was wrong. Report reversal rates by category, by detection source and by model version, and treat a rising rate as an incident.
- **Restore everything.** A reversed ban restores the account, its content and its purchases and removes the strike from the ladder, and the notice says so.

## Child Safety

Child safety is the one area where the law gives you obligations with deadlines and the response can't be improvised.

**Reporting in the United States.** Under 18 U.S.C. § 2258A, a provider that obtains actual knowledge of facts or circumstances indicating an apparent violation of the federal child sexual exploitation statutes must report to the CyberTipline of the National Center for Missing & Exploited Children (NCMEC) "as soon as reasonably possible" ([18 U.S.C. § 2258A](https://www.law.cornell.edu/uscode/text/18/2258A)). A completed report is treated as a request to preserve the reported contents for one year. Knowing and willful failure to report carries fines that, as of October 2026, run up to $850,000 for a first failure and $1,000,000 for later ones for providers with at least 100 million monthly active users, and up to $600,000 and $850,000 for smaller providers. The statute says it doesn't require providers to monitor users or to "affirmatively search, screen, or scan", but once you know, you must report. Xbox's report notes that Microsoft reports all apparent child sexual exploitation imagery and grooming to NCMEC "as required by US law", and that 1,254 of Microsoft's reports in 2025 came from Xbox. Other countries have their own regimes; legal counsel maps them, and the system supports a report per jurisdiction.

**Hash matching for known imagery.** PhotoDNA computes a hash of an image and compares it against databases of hashes of previously identified illegal images; it "cannot be used to identify a person or object in an image", the hash is not reversible, and Microsoft provides it free to qualified organizations, including as a cloud service ([Microsoft: PhotoDNA](https://www.microsoft.com/en-us/photodna)). Any service that accepts user images should match uploads against known hashes before they're visible.

**Build the path before you need it:**

- **A dedicated category and queue** with trained, designated reviewers, its own response target and an escalation to whoever files the report.
- **Restricted evidence.** The evidence store for these cases is separate, access is limited to the people who must see it, every view is logged ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)), and nothing can be downloaded or forwarded through ordinary tools. Preservation overrides normal [retention](/docs/architecture/data-retention#retention-windows) for exactly the period the law requires.
- **Immediate account action** (the zero-tolerance step of the ladder) without notice text that would tip off an investigation where counsel says not to.
- **Grooming signals, not just imagery.** Adults contacting many minors, moving conversations off-platform, requests for images: behavior detection belongs here as much as content detection. Default settings that limit who can contact young users are a moderation feature; [Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy) covers age assurance and the defaults the law expects for minors.

The same staffed path handles threats to life. Xbox's report describes threats of self-harm as the most common real-world concern on its platform and says it sent 10,051 referral messages to players for counseling services through the Crisis Text Line or international partners in 2025.

## Auditing Moderation Decisions

Every decision, automated or human, is an [audit record](/docs/architecture/audit-trails#automated-and-ai-decisions): who or what decided, on what evidence, under which rule, with which result. A moderation decision is the evidence in an appeal, a regulator's inquiry, a press story and sometimes a lawsuit, and "the model did it" is not an answer anyone accepts.

```sql
CREATE TABLE moderation_decisions (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL REFERENCES tenants (id),
  case_id              UUID NOT NULL REFERENCES moderation_cases (id),
  reviews_decision_id  UUID REFERENCES moderation_decisions (id),
  actor_type           TEXT NOT NULL CHECK (actor_type IN ('system', 'moderator', 'appeal_reviewer')),
  actor_id             UUID,
  automation_level     TEXT NOT NULL CHECK (automation_level IN ('full', 'partial', 'none')),
  is_detected_automatically BOOLEAN NOT NULL,
  model_version        TEXT,
  score                NUMERIC(5, 4),
  threshold            NUMERIC(5, 4),
  policy_version       TEXT NOT NULL,
  category             TEXT NOT NULL,
  outcome              TEXT NOT NULL CHECK (outcome IN
                         ('no_violation', 'content_removed', 'penalty_applied', 'upheld', 'modified', 'reversed')),
  rationale            TEXT,
  decided_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT moderation_decisions_reviewer_check
    CHECK (reviews_decision_id IS NULL OR actor_type = 'appeal_reviewer')
);
```

Moderators are privileged users with access to other people's private messages, so their own work is audited the way [Support Access](/docs/security/support-access#logging-support-access) audits support: every case opened, every piece of evidence viewed, every decision made. Then look at it: decision rates per moderator against peers, decisions on accounts the moderator is connected to, a reviewer whose reversal rate is far above the team's.

## Transparency Reporting

A transparency report is the system describing itself in public, and if decisions are recorded as above, it's a query. Santa Clara's "Numbers" principle asks for the actions taken against content and accounts by rule category and by country or region, appeals and their outcomes, and regular, machine-readable reporting. Xbox's report is a good model of the parts worth publishing: proactive volume and the share found violating, reports received and the share actioned, restrictions by category, the split between automated and manual processing, appeals and reinstatement rates, and child-safety referrals.

Two rules keep it honest. Define every number once, in the same code that produces internal dashboards, so the public figure and the internal one can't drift. And publish the denominators: "we removed 2 million posts" means nothing next to how many were reviewed, reported and appealed.

## Moderator Wellbeing

The people who review the worst content carry its cost. The FPA guide is direct about it: exposure to negativity in complaints and appeals "can take its toll", even a single occurrence can be damaging, and it asks whether staff have access to counseling, whether roles rotate to avoid prolonged exposure, whether paid time off is supported and whether the team knows the signs of desensitization. It also notes that "passing judgment on behavior is more taxing than almost any other support request yet lumped together as part of day-to-day support", which is an argument for a separate team with its own staffing model rather than a tab in the support tool.

Tooling helps. Xbox credits automation with reducing "human exposure to sensitive content" and focusing human moderators on nuanced cases, and Community Sift offers optional image blurring to shield moderators from disturbing visuals. Build those in: blurred media by default with a deliberate reveal, the least content needed for the decision, and routing that spreads the most harmful categories across trained people instead of whoever is next in the queue.

## Checklist

- **A versioned policy** with public rules, internal guidelines and one category enum used by reports, models, penalties, notices and reports to the public.
- **Reports grouped into cases** with evidence snapshots, priority by severity then signals then age, reporter credibility, and outcomes sent back to reporters.
- **Detection in bands per category,** content actions before account actions, daily QA samples and the reversal rate tracked per model version.
- **A penalty ladder per category,** with zero-tolerance skips, expiring strikes, feature restrictions, and enforcement at every entry point.
- **A notice for every action** naming the rule, the detection method, the duration and the appeal path; statements of reasons and database submissions where the DSA applies.
- **Appeals reviewed by someone else,** recorded as new decisions, with reversals restoring everything and feeding back into models and guidelines.
- **A child-safety path** with designated reviewers, hash matching, restricted and preserved evidence, and reporting to NCMEC and other required authorities.
- **Every decision audited** with actor, automation level, model and threshold, policy version and evidence, and moderators' own access logged and reviewed.
- **A transparency report** computed from decision records, with denominators.
- **Wellbeing designed in:** blurred media, minimal exposure, rotation, counseling and a staffing model of its own.

## References

**Specifications**

- [18 U.S.C. § 2258A](https://www.law.cornell.edu/uscode/text/18/2258A), providers' duty to report apparent child sexual exploitation to NCMEC's CyberTipline, one-year preservation, fines for knowing failures, and no duty to monitor
- [European Commission: DSA Transparency Database](https://transparency.dsa.ec.europa.eu/), statements of reasons submitted by online platforms and the running count
- [European Commission: DSA Transparency Database documentation](https://transparency.dsa.ec.europa.eu/page/documentation), what Article 17(3) requires in a statement of reasons, automation fields, and no personal data under Article 24(5)

**Reference**

- [Santa Clara Principles 2.0](https://santaclaraprinciples.org/), numbers, notice and appeal principles for content moderation
- [Fair Play Alliance and ADL: Planning a Penalty and Reporting System](https://thrivingingames.org/wp-content/uploads/2020/12/FPA-Framework-Planning-Penalty-Reporting-System.pdf), policy, procedure and product, consistent penalties, and the toll on staff
- [Microsoft: PhotoDNA](https://www.microsoft.com/en-us/photodna), hash matching of known illegal images, non-reversible hashes, and free access for qualified organizations

**In practice**

- [Xbox Transparency Report 2025](https://cms-assets.xboxservices.com/assets/8b/d9/8bd9775f-8742-4f12-ae2f-b296307316e7.pdf?n=2834905.pdf), proactive and reactive volumes, automation share and safeguards, enforcement ladder, appeals, NCMEC and Crisis Text Line figures
- [Microsoft: Community Sift](https://developer.microsoft.com/en-us/games/products/community-sift/), text, image, video and username classification, evasion handling, escalation to humans and image blurring for moderators
