+++
title = "Transparency Reporting"
description = "What Reddit, Discord, Pinterest, Snap, Bluesky and others count, the DSA templates, OSA notices and state filings, and how to make the report a query."
category = "User-Generated Platforms Industry"
order = 1852
part = "The Rules"
tags = ["user-generated-content", "transparency", "trust-and-safety", "digital-services-act", "metrics"]
+++

A transparency report is a platform describing its own moderation in public: how much it removed, why, how it found it, how many people appealed and how many won, how many reports it sent to child-safety hotlines, and how many times governments asked for data or removals. For a decade these reports were voluntary, published on each platform's own schedule in its own categories, and impossible to compare. They're now also regulated. The EU's Digital Services Act fixes the content, the periods and, since July 2025, the file format; the UK's Online Safety Act has Ofcom specify what each categorised service publishes; Australia's eSafety Commissioner compels answers and publishes summaries; and New York's Stop Hiding Hate Act requires semiannual filings from large social media companies.

The difficulty is that the same platform now publishes several reports that must agree. A voluntary half-yearly report, a DSA report in the Commission's template, an Ofcom notice response and a state filing are cut differently (by policy, by member state, by legal ground, by quarter) from the same decisions. If each is assembled by hand from dashboards, they drift, and a regulator who compares them finds the drift. The fix is the one the playbook states for any report: decisions recorded with enough detail that every report is a query, with definitions as code ([Transparency Reporting](/docs/security/trust-and-safety#transparency-reporting)).

This chapter covers what the platforms count and how their choices differ, the mandated formats (DSA Articles 15, 24 and 42 and the harmonised templates, Online Safety Act section 77 notices, Australian notices, New York's filings), and how to build the reporting so the numbers can be defended. It reads the moderation tables from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) with the DSA columns from [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#how-to-build-it), the legal request tables from [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#how-to-build-it), and the metric definitions from [Operating Metrics](/books/user-generated-platforms/operating-metrics#how-to-build-it), and adds tables for the published reports themselves. Figures are as published by each platform, dated; none of it is legal advice.

## How the Platforms Do It

| Platform | Period | Unit of enforcement | How found and decided | Appeals | Child safety | Legal requests |
| --- | --- | --- | --- | --- | --- | --- |
| **Bluesky** (2025) | Year | Takedowns (2,446,334) and labels (16.49 million, 95.34% automatic) | Reports from 1.24 million users | Not covered here | Not covered here | Legal requests counted |
| **Discord** (March 2025 to March 2026) | Year | "Actions taken" on accounts (6,315,202) versus "accounts disabled" (3,243,494), plus 47,832,832 spam accounts | Per policy category | Appeals and overturn rate per category (8.47% for child sexualization content) | 518,399 reports to NCMEC | Requests, preservation and emergency requests by country |
| **Meta** | Not covered here | Not covered here | Prevalence: the share of views that were of violating content, estimated by sampling | Not covered here | Not covered here | Not covered here |
| **Pinterest** (H2 2025) | Quarters within a half-year | Distinct images, Pins, boards and accounts deactivated per policy | Manual, hybrid and automated split per policy; reach bands of unique viewers before deactivation | Upheld and reversed per policy | About 235,769 CyberTipline reports | Government information and removal requests, by region |
| **Reddit** (H2 2025) | Half-year | Posts and comments removed, split by moderators (52.7%) and admins (44.7%) | Automated share of moderator removals (68.6%); share of admin chat reviews surfaced proactively (99%); share of user reports actionable (6.9%) | 481,416 content and 499,515 account appeals, 20% and 4.4% of sanctions | 32,747 CyberTips | Information requests by country and process type, emergency requests, preservation requests, fraudulent requests, user notice |
| **Snap** (H2 2025) | Half-year | Enforcements and unique accounts enforced (10,468,568 and 6,324,545) | In-app reports versus proactive detection; median turnaround about one minute | 471,892 account lock appeals, 31,951 reinstatements | 397,402 NCMEC submissions | On a separate page |

Four choices make these reports incomparable, and each is a design decision for your own:

- **The unit.** A post, a distinct image, a Pin (one image saved many times), an account, a "unique account enforced", an action. Pinterest reports 13,519,577 child safety Pins deactivated in the third quarter of 2025 against 20,026 distinct images, a 675-to-1 ratio that comes entirely from counting saves of the same image. Discord separates actions (warnings and temporary restrictions included) from disabled accounts because it "expanded the use of warnings and temporary restrictions"; a report that counts only bans would have hidden the change.
- **Who decided.** Reddit splits removals by moderators and admins, and says both include automated removals (AutoModerator, Devvit apps, internal tooling) and moderators' removals for non-safety reasons such as keeping communities on topic. A platform with volunteer moderators that reports only staff actions undercounts its moderation by half; one that reports both as "violations" overstates its harm.
- **How it was found and decided.** Proactive versus reported, and manual versus hybrid versus automated. Pinterest's "hybrid" (a human decision expanded by machine to matching content) is a third category most reports lack, and the DSA's database separates automated detection from automated decision for the same reason.
- **Exposure, not just volume.** Removal counts rise when detection improves and when abuse rises, and the report can't tell which. Exposure metrics can: Meta's prevalence ("the estimated number of views that showed violating content, divided by the estimated number of total content views"), Snap's Violative View Rate (about 0.01% of Snap and Story views in the second half of 2025, 0.0003% for severe harms), and Pinterest's reach bands (75% of adult content Pins deactivated in the fourth quarter of 2025 had been seen by no one). [Operating Metrics](/books/user-generated-platforms/operating-metrics#trust-and-safety-metrics) covers how prevalence is sampled.

## What the Voluntary Reports Count

Read across the reports above, a complete report has these sections, and each section is a query with its own denominators:

| Section | What it counts | Denominator that makes it meaningful |
| --- | --- | --- |
| **Volume** | Content created, messages sent, active users | The base everything else is a share of: Reddit's 2.2 billion posts and comments and 3.9 billion chat messages in the half-year |
| **Enforcement by policy** | Content removed, accounts actioned, communities banned, per policy category | Content created, reports received |
| **Detection** | Proactive versus reported; automated versus manual versus hybrid | Total enforcements per policy |
| **Reports** | Reports received, share actionable | Reports received (Reddit's 6.9% actionable is a statement about report quality) |
| **Exposure** | Prevalence or violative view rate; reach before removal | Views |
| **Community moderation** | Volunteer moderators' removals and bans | Total removals |
| **Appeals** | Appeals filed, granted, overturn rate, per policy | Sanctions issued (Reddit gives both) |
| **Child safety** | CyberTip reports, accounts disabled, content reported | Child safety enforcements |
| **Legal requests** | Government removal requests, information requests, emergency and preservation requests, compliance rates, user notices, fraudulent requests | Requests received |
| **Intellectual property** | Copyright and trademark notices, counter-notices, content removed | Notices received |
| **Age assurance** | Users prompted, completed, passed, by method | Users prompted |

Two of these are newer and worth copying. **Fraudulent legal requests:** Reddit caught and rejected 26 fraudulent government and law enforcement requests in the second half of 2025, including nine fake emergency requests ([Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#fraud-and-verification)). **The age assurance funnel:** Discord reports, per month, the users prompted to verify age, those who completed, those who passed, and the method; in March 2026 it prompted 1,460,513 users, 426,953 completed and 417,869 passed, with face estimation used about twice as often as an ID ([Minors, Age Assurance & US State Law](/books/user-generated-platforms/minors-and-age-assurance#age-assurance-on-a-general-audience-platform)).

Reports also explain their own trends, and the explanation belongs in the data. Reddit attributes a 66.6% fall in granted appeals to more precise automated enforcement ("appeals are always human-reviewed, so a decrease in granted appeals indicates our automated tools are making the right call more often"); Pinterest says its child safety reinstatement rate is higher by design because it errs toward deactivation, and that an internal error in the first half of 2025 inflated its later CyberTipline count. A change in policy, tooling or an error that moves a number is an annotation recorded with the period, not a sentence written at publication time.

## The DSA Reports

The DSA requires three layers of reporting, and since July 1, 2025 they share a format:

- **Every intermediary service (Article 15),** at least once a year, machine-readable: orders from member state authorities by type of illegal content and issuing state, with the median time to confirm receipt and to act; Article 16 notices by type, the number from trusted flaggers, whether action was taken on legal or terms grounds, how many were processed by automated means, and the median time to act; own-initiative moderation, including automated tools, staff training, and restrictions by type of content, detection method and restriction; complaints through the internal system, their basis, decisions, median decision time and reversals; and a qualitative description of automated moderation with "indicators of the accuracy and the possible rate of error." Micro and small enterprises are exempt unless designated very large.
- **Online platforms (Article 24),** add out-of-court disputes (submitted, outcomes, median time, and the share of body decisions the platform implemented) and Article 23 suspensions for manifestly illegal content, manifestly unfounded notices and manifestly unfounded complaints, and must publish average monthly active recipients in the EU at least every six months.
- **Very large platforms (Article 42),** report every six months and add content moderation staff per official EU language, their qualifications and training, accuracy indicators per language, and average monthly recipients per member state; they also publish their risk assessments, mitigation measures and audit reports within three months of each audit report ([Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#very-large-online-platforms)).

Commission Implementing Regulation (EU) 2024/2835, adopted November 4, 2024, fixes the templates: providers "shall use the CSV- or XLSX-version of the templates set out under Annex I" for reporting under Articles 15, 24 and 42, filled in and published according to Annex II. The templates have a quantitative part (standardised tables for orders, notices, own-initiative moderation, complaints and the rest) and a qualitative part (free text, such as safeguards on automated means). Providers had to use them from July 1, 2025; very large platforms report on half-years (January to June, July to December) and everyone else on calendar years, publishing within two months of the period's end, after a transition that ran to December 31, 2025. Reports must stay public, every published version included, for at least five years (Article 3).

The statements of reasons each platform submits to the Commission's Transparency Database are a separate, per-decision stream; the playbook covers them in [Notices and Statements of Reasons](/docs/security/trust-and-safety#notices-and-statements-of-reasons). They should reconcile with the Article 15 counts, and the easiest way to make them reconcile is to generate both from the same decision rows.

What the templates demand that voluntary reports don't:

- **Member state on every order and recipient count,** so the issuing country and the viewer's country are recorded, not inferred at reporting time.
- **Legal ground versus terms ground,** per action, which is a column on the decision ([Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#how-to-build-it)).
- **Medians, not averages,** for time to act and time to decide, computed from timestamps on the notice and the decision.
- **Accuracy and error rates** for automated tools, which means the platform must measure them ([AI on User-Generated Platforms](/books/user-generated-platforms/ai-on-user-generated-platforms#ai-moderation-and-error-budgets)).
- **Moderation staff per language,** for very large platforms, which means the staffing system and the moderation system share a vocabulary.

## The UK and Australia

**The Online Safety Act** requires every categorised service (Category 1, 2A and 2B on the register Ofcom published on July 10, 2026) to publish an annual transparency report containing the information Ofcom specifies in a transparency notice issued to that provider each year (section 77 and Schedule 8). The first round started late in 2026: Ofcom planned to send draft notices to categorised services on November 25, 2026, with representations on the information, the format and the publication timeframe closing on January 20, 2027, alongside a consultation on its approach. So the UK report isn't a fixed template like the DSA's; it's a per-service specification that can differ between services and years, and the data model has to answer questions not yet asked. A platform that can only produce the DSA's cuts will have to rebuild for Ofcom's.

**Australia's** Basic Online Safety Expectations work the other way: eSafety issues periodic and non-periodic notices requiring a provider to report how it meets the Expectations on a topic (child sexual exploitation, terrorist content, hate, children's use of social media), and publishes its own summaries. The answer is a regulated deliverable with a specified manner and form, and X's penalty in Australia was for a response that didn't follow the form ([Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#australia-s-esafety-regime)).

## US State Filings

New York's Stop Hiding Hate Act requires social media companies with more than $100 million in annual gross revenue to file reports with the Attorney General twice a year: the current terms of service and changes since the last report, whether the terms define hate speech or racism, extremism or radicalization, disinformation or misinformation, harassment, and foreign political interference, how automated systems and human review are used, how user reports are handled, and enforcement data including the total number of flagged posts, posts actioned and posts where action was taken against the responsible user, with how each was flagged and what action followed (removal, demonetization, deprioritization). Penalties reach $15,000 per violation per day after a 30-day cure period. The Attorney General's public list of filings includes Reddit, Discord, Twitch (filed by Amazon), Kick, Snap, TikTok, X and Roblox.

The New York filing introduces a dimension the others don't: **the terms of service as a versioned document with defined categories.** If the policy is versioned data ([Policy Is the Specification](/docs/security/trust-and-safety#policy-is-the-specification)), "changes since the last report" is a diff and "does the policy define harassment?" is a lookup. If the policy is a web page edited in place, both are archaeology.

## Making the Report a Query

The playbook's rule is that a transparency report is a query over decision records, with every number defined once ([Transparency Reporting](/docs/security/trust-and-safety#transparency-reporting)). On a user-generated platform that rule meets four complications:

- **Volunteer decisions are decisions.** Community moderators' removals, bans and automod actions must be recorded as decisions with the actor type (volunteer, staff, automation acting for either), or the platform can't produce Reddit's split and can't tell a regulator how much of its moderation it controls. The core model's community-scoped cases and penalties exist for this ([The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model)).
- **Units must be explicit.** Store the item, the asset and the account on each decision, so the report can count items, distinct files (through `media_assets` hashes) and accounts without double counting, and say which it counted.
- **Periods close.** A report covers decisions made in the period, but appeals of those decisions keep arriving after it ends. Freeze the report from a snapshot, publish the snapshot's date, and restate in the next report when late appeals or corrections move a number by more than a stated tolerance, with the restatement visible ([Operating Metrics](/books/user-generated-platforms/operating-metrics#definitions-as-code-restatements-as-rows)).
- **One definition, many cuts.** "Content removed for hate speech" is one metric with dimensions (period, policy, member state, ground, detection, automation, actor); the DSA template, the voluntary report, Ofcom's notice and the New York filing select different dimensions of it. Store the values per report with their dimensions, so any published figure can be traced to its definition version and the query that produced it.

## How to Build It

The chapter adds the published reports and their values, and reads definitions from [Operating Metrics](/books/user-generated-platforms/operating-metrics#how-to-build-it).

```sql
CREATE TABLE transparency_reports (       -- one published report, in one regime's format
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  regime           TEXT NOT NULL CHECK (regime IN ('voluntary', 'eu_dsa_art15',
                     'eu_dsa_art24', 'eu_dsa_art42', 'uk_osa_s77', 'au_bose',
                     'ny_stop_hiding_hate')),
  period           DATERANGE NOT NULL,
  template_version TEXT,                  -- e.g. 'EU 2024/2835 Annex I', or the notice reference
  regulator_request_id UUID REFERENCES regulator_requests (id),  -- the notice it answers
  snapshot_at      TIMESTAMPTZ NOT NULL,  -- decisions as of this instant
  status           TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'published',
                     'superseded')),
  published_at     TIMESTAMPTZ,
  published_url    TEXT,
  supersedes_id    UUID REFERENCES transparency_reports (id),  -- a restated version
  retain_until     DATE                   -- DSA: at least five years after publication
);

CREATE TABLE transparency_report_values ( -- every number, with what it is and where it came from
  report_id        UUID NOT NULL REFERENCES transparency_reports (id),
  metric_key       TEXT NOT NULL,         -- 'content_removed', 'notices_received', 'appeals_granted'
  metric_version   INT NOT NULL,          -- metric_definitions(key, version)
  dimensions       JSONB NOT NULL,        -- {"policy": "hate", "member_state": "DE",
                                          --  "ground": "illegal_content", "detection": "proactive"}
  value            NUMERIC NOT NULL,
  unit             TEXT NOT NULL CHECK (unit IN ('count', 'percent', 'median_seconds',
                     'ratio')),
  annotation       TEXT,                  -- why it moved: a policy change, a tooling change, an error
  PRIMARY KEY (report_id, metric_key, dimensions),
  FOREIGN KEY (metric_key, metric_version) REFERENCES metric_definitions (key, version)
);
```

The queries read decisions, not dashboards. Article 15's notices section, as a sketch over the playbook's `reports` and `moderation_decisions` with this volume's columns:

```sql
-- Article 16 notices in the period: count, from trusted flaggers, ground, automation, median time
SELECT r.category                                               AS illegal_content_type,
       count(*)                                                  AS notices,
       count(*) FILTER (WHERE r.notifier_kind = 'trusted_flagger') AS from_trusted_flaggers,
       count(*) FILTER (WHERE d.legal_ground = 'illegal_content')   AS actioned_on_law,
       count(*) FILTER (WHERE d.legal_ground = 'terms_of_service')  AS actioned_on_terms,
       count(*) FILTER (WHERE d.automation_level = 'full')          AS processed_automatically,
       percentile_cont(0.5) WITHIN GROUP
         (ORDER BY extract(epoch FROM d.decided_at - r.reported_at)) AS median_seconds_to_act
FROM reports r
LEFT JOIN moderation_decisions d
       ON d.case_id = r.case_id AND d.reviews_decision_id IS NULL  -- the first decision
WHERE r.is_illegal_content_notice
  AND r.reported_at <@ tstzrange('2026-01-01', '2027-01-01')
GROUP BY r.category;
```

Notes on the sketch:

- **Every value names its definition and version.** `metric_definitions` ([Operating Metrics](/books/user-generated-platforms/operating-metrics#how-to-build-it)) holds what "content removed" means (which states, which actors, which units); a published figure keyed to a definition version can be reproduced years later, and a changed definition shows up as a new version, not a silent break in a trend.
- **Dimensions are open, values are typed.** The DSA template, Ofcom's notice and New York's filing ask for different cuts; a JSONB dimension set keyed in the primary key lets each report store exactly the cuts it published, while `unit` keeps medians and percentages from being summed.
- **Snapshots and restatements.** `snapshot_at` freezes the input; a corrected report is a new row that `supersedes_id` the old one, and both stay public for the DSA's five years. Never update a published value.
- **Regulator notices link to reports.** A UK or Australian notice is a `regulator_requests` row from [Regulators & Enforcement](/books/user-generated-platforms/regulators-and-enforcement#how-to-build-it); the report that answers it points back, so the response is traceable.
- **Legal request sections read the request tables.** Counts of information, emergency and preservation requests, compliance rates, notices to users and fraudulent requests come from [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests#how-to-build-it).
- **Generate the files, don't type them.** The DSA's CSV and XLSX templates are an export of `transparency_report_values` for one report; a validation step checks the export against the template's sections before approval.
- **Events:** `transparency_report.approved` and `transparency_report.published` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to the public site and to the archive that keeps every version.

## Auditing

- **Every published figure,** with its definition version, its dimensions, the snapshot it came from and the query that produced it.
- **Every version of every report,** including superseded ones, kept public for the retention period the regime sets (five years under the DSA templates).
- **Every annotation** that explains a movement, recorded with the period rather than written into prose at publication.
- **Approval:** who approved each report and each regulator response, and what changed between draft and published.
- **Reconciliation:** the DSA report against the Transparency Database submissions for the same period, and the voluntary report against the regulated ones, with differences explained.

## What This Means for the System You Build

- **Record volunteer, staff and automated decisions alike,** with the actor type, so the report can show who moderates the platform.
- **Store the unit on every decision** (item, file, account) and say in the report which one each number counts.
- **Record detection and decision automation separately,** with a hybrid category where humans decide and machines expand.
- **Measure exposure as well as volume:** prevalence or violative view rate, and reach before removal.
- **Keep the country, legal ground and timestamps** on notices and decisions so the DSA's member state cuts and medians are queries.
- **Version the policy and the metric definitions,** so "what changed in our terms" and "what this number means" have answers.
- **Snapshot, publish, restate:** never edit a published number, supersede it.
- **Count the newer things:** fraudulent legal requests, age assurance funnels, dispute body outcomes implemented.
- **Generate regulated files from stored values** and validate them against the template before approval.
- **Expect per-service specifications** from Ofcom, not a fixed template, and keep the data model open to new cuts.

## References

**Law and regulation**

- [Regulation (EU) 2022/2065 (Digital Services Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065), Article 15 (annual reports, orders, notices, own-initiative moderation, complaints, accuracy of automated means, the exemption), Article 24 (dispute and suspension counts, average monthly active recipients, database submission, templates) and Article 42 (six-monthly reports, staff per language, accuracy per language, recipients per member state)
- [Commission Implementing Regulation (EU) 2024/2835](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R2835), adopted November 4, 2024: CSV or XLSX templates for Articles 15, 24 and 42 (Article 1), the calendar-year and six-monthly reporting periods and the two-month publication deadline (Article 2), five-year retention and public availability of every version (Article 3), use from July 1, 2025 and the transition to December 31, 2025
- [New York Attorney General: Stop Hiding Hate Act](https://ag.ny.gov/resources/organizations/social-media-tos-reporting/stop-hiding-hate-act), coverage, report contents and penalties
- [New York Attorney General: Social media terms of service reports](https://ag.ny.gov/resources/organizations/social-media-tos-reporting/reports), the companies that have filed

**Regulators**

- [Ofcom: Online Safety industry bulletin, October 2026](https://www.ofcom.org.uk/online-safety/protecting-children/online-safety-industry-bulletin-october-2026), the July 10, 2026 register, annual transparency notices for categorised services and the November 2026 to January 2027 process
- [Ofcom: Register of categorised services and list of emerging Category 1 services](https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/register-of-categorised-services-and-list-emerging-category-1-services), Categories 1, 2A and 2B and the additional duties for categorised services
- [eSafety Commissioner: Basic Online Safety Expectations](https://www.esafety.gov.au/industry/basic-online-safety-expectations), periodic and non-periodic notices and published summaries

**Transparency reports**

- [Reddit: Transparency Report, July to December 2025 (PDF, copy hosted by TorrentFreak)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), volumes, moderator and admin removals, automation share, actionable reports, appeals, CyberTips, legal and fraudulent requests
- [Discord: Transparency Report, March 2025 to March 2026 (PDF)](https://cdn.discordapp.com/assets/transparency-reports/Discord-Transparency-Report-2026-Updated.pdf), actions taken versus accounts disabled, spam accounts, NCMEC reports, age assurance funnel, appeals by category
- [Pinterest: Transparency report, July to December 2025](https://policy.pinterest.com/en/transparency-report), units per policy, enforcement method, reach bands, child safety, appeals, government requests
- [Snap: Transparency report, H2 2025](https://values.snap.com/privacy/transparency-h2-2025), enforcements, turnaround, Violative View Rate, NCMEC submissions, appeals
- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), reports, takedowns, automatic labels
- [Meta: Prevalence](https://transparency.meta.com/policies/improving/prevalence-metric/), the definition, sampling and upper limits
