+++
title = "Employee Monitoring & Privacy"
description = "What admins can see in workplace tools, US notice laws, ECPA and the NLRB, GDPR, German works councils, CNIL fines on monitoring, and bossware's limits."
category = "Workplace & Collaboration Industry"
order = 2053
part = "Security and Compliance"
tags = ["privacy", "employee-monitoring", "gdpr", "works-councils", "labor-law", "compliance"]
+++

The employer owns the workspace, so the employer's admins can see a great deal: who signed in from where, who was active when, how many messages each person sent, which files they opened, and, with the right plan and the right role, the content of private channels and direct messages. That is the [inversion](/books/workplace-and-collaboration/workplace-business#the-inversion) this volume is built on, and it is also the privacy problem. In a consumer chat app the person is the user and the platform owes them privacy; in a workplace tool the person is an employee, the organization is the controller, and the question is what the law lets the employer do with what its tools can show.

The answer differs sharply by jurisdiction. In most of the United States an employer may read business systems it provides, subject to notice laws in a few states and to labor law's ban on spying on organizing. In the European Union the employer needs a lawful basis, has to be proportionate, usually needs an impact assessment, and in Germany cannot even introduce a tool that is able to monitor behavior or performance without its works council's agreement. A single product sold in both places has to support both: a US admin who may export every DM and a German admin who may not switch on a usage report until a works agreement exists.

This chapter covers what workplace tools expose to admins, the laws that limit employers, how regulators have treated monitoring software, and the product patterns (aggregation, pseudonymization, notice, controlled access) that vendors use. Supervision of regulated communications is [Supervision and Lexicon Review](/books/workplace-and-collaboration/regulated-communications#supervision-and-lexicon-review); exports for litigation are [eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export); audit logs themselves are [Audit Logs](/books/workplace-and-collaboration/audit-logs); occupancy sensors and badge data are [Rooms, Devices & the Hybrid Office](/books/workplace-and-collaboration/rooms-and-the-hybrid-office#occupancy-data-and-its-limits); the right-to-disconnect laws are [Notifications, Presence & Attention](/books/workplace-and-collaboration/notifications-and-attention#the-right-to-disconnect). Algorithmic management of platform workers, as opposed to employees, is the User-Generated Platforms volume's [Algorithmic Management Under the EU Directive](/books/user-generated-platforms/gig-work-and-worker-law#algorithmic-management-under-the-eu-directive). The playbook's [GDPR](/docs/compliance/gdpr) covers the regulation in general. This is a description of the rules as they shape software, not legal advice.

## How the Platforms Do It

What the vendors' own documentation says admins can see, and what they hide by default, as of October 2026:

| Platform | Usage and analytics | Content access | Defaults that protect employees |
| --- | --- | --- | --- |
| **Microsoft 365** | Usage reports for the last 7, 30, 90 and 180 days per service; Productivity Score aggregated to the organization since December 2020 | eDiscovery and Purview tools for authorized roles | Reports hide user names, groups and sites by default; showing them is an org setting and "a logged event in the Microsoft Purview portal audit log" |
| **Microsoft Purview Communication Compliance** | Policy matches for reviewers | Message review for designated reviewers | User names pseudonymized by default; Global Administrators have no access unless granted; reviewer activity audited |
| **Slack** | Workspace analytics | Free and Pro: owners and admins export public channels only; Business+: owners can apply for an export of all channels and conversations; Enterprise: self-serve exports including single-user exports, enabled on request | Private channels and DMs are outside standard exports; the full export is described as for "legal and regulatory compliance" |

The pattern is that **vendors make the identifiable view a deliberate act.** Aggregates and pseudonymous views are the default; naming individuals or reading content requires a specific role, a setting change or an application to the vendor, and the act is logged. None of that is required by US law. It is the vendors designing for their strictest customers (European employers, works councils, unions) and for the reputational risk Microsoft learned about in 2020.

## What an Admin Can See

Workplace tools expose four tiers of information about people, each with a different legal weight:

1. **Account and security data.** Sign-ins, IP addresses, devices, admin actions: the audit log. Every security program needs it, and it's the tier regulators accept most readily, because security is a legitimate purpose and the data is usually reviewed only on an alert.
2. **Usage and activity metrics.** Messages sent, meetings attended, files edited, last active date, per person per day. Useful for licensing ("who barely uses it and might not need a Microsoft 365 license," as Microsoft's report documentation puts it) and dangerous as a performance measure.
3. **Content.** The messages, files and recordings themselves, reached through exports, eDiscovery, legal holds or supervision tools.
4. **Endpoint activity.** Keystrokes, mouse movement, screenshots, application and website time, webcam captures. Collaboration suites mostly don't do this; dedicated monitoring software ("bossware") does, often integrated with the collaboration tools for context.

**Productivity Score, 2020.** Microsoft's Productivity Score, in preview, briefly showed end-user names alongside their actions over a 28-day period. On December 1, 2020, after public criticism, Microsoft removed the user names and said the communications, meetings, content collaboration, teamwork and mobility measures would "only aggregate data at the organization level," and changed the interface to say that the score measures organizational adoption of technology. The post's own line was that the product "was never designed to score individual users." The lesson every vendor took: a per-person activity metric, presented under the word "productivity," reads as surveillance no matter what it was built for. Microsoft's [usage reports](/books/workplace-and-collaboration/workplace-metrics#adoption-reports-for-the-customer) now conceal names by default, and revealing them is audited.

Two observations shape everything below:

- **The same data has different uses.** A per-person activity count is a license-reclaim tool to IT, a performance metric to a manager and an organizing-detection tool to a hostile employer. The law mostly regulates the use and the notice, so the product has to record who looked at what and why.
- **Content access is the line.** Every regime treats reading content as more serious than counting activity, and every vendor gates it harder.

## United States

US law gives employers wide room over systems they provide, with three kinds of limit.

**Federal wiretap and stored communications law.** The Stored Communications Act makes it an offense to access stored communications without authorization, but the offense "does not apply" to conduct "authorized by the person or entity providing a wire or electronic communications service" (18 U.S.C. 2701(c)(1)). An employer that provides the workspace is, for its own system, that entity. This is why US employers can generally read their own Slack or Teams content, and why the hard questions arise at the edges: personal accounts, personal devices and messages the employer's tool happens to capture from outside parties.

**State notice laws.** Three states require employers to tell employees about electronic monitoring:

| State | Law | What it requires | Penalty |
| --- | --- | --- | --- |
| **New York** | Civil Rights Law 52-c | Written or electronic notice upon hiring to employees subject to monitoring of telephone, email and internet access or usage "at any and all times and by any lawful means"; the employee acknowledges it; the notice is posted conspicuously. Processes that manage email, voicemail or internet volume, not targeted at individuals and used solely for system maintenance or protection, are exempt | Enforced by the attorney general; up to $500 for a first offense, $1,000 for a second and $3,000 for each later one |
| **Connecticut** | Gen. Stat. 31-48d | Prior written notice to all employees who may be affected, describing the types of monitoring; a conspicuous posting counts as that notice. No notice is needed where the employer reasonably believes an employee is breaking the law, violating others' rights or creating a hostile environment and the monitoring may produce evidence | Up to $500 for a first offense, $1,000 for a second and $3,000 for a third or later, levied by the Labor Commissioner |
| **Delaware** | 19 Del. C. 705 | Before monitoring telephone, email or internet use, either an electronic notice at least once each day the employee uses the employer's email or internet, or a one-time written or electronic notice the employee acknowledges; the same system-maintenance exemption | $100 per violation |

None of these limits what an employer may monitor; they require that employees be told, and New York and Delaware require that the employee acknowledge it. For a product, that is a notice and an acknowledgment record per employee per jurisdiction, and New York's "upon hiring" timing ties it to onboarding ([Provisioning, SCIM & Offboarding](/books/workplace-and-collaboration/provisioning-and-scim)).

**Labor law.** The National Labor Relations Act protects employees' concerted activity, including organizing, and the NLRB lists among unlawful employer conduct to "spy on employees' union activities," meaning "doing something out of the ordinary to observe the activity," and to "create the impression that you are spying" on them. A union drive in a Slack channel or Teams chat is concerted activity on the employer's own system. Ordinary retention, security monitoring and eDiscovery are not spying; pulling an export of the organizing channel during a campaign, or telling employees that management is reading it, is the kind of out-of-the-ordinary observation the rule describes.

The NLRB's General Counsel went further in an October 2022 memo, GC 23-02, which urged the Board to treat electronic monitoring and algorithmic management that would tend to interfere with protected activity as presumptively unlawful <!-- source-gap: nlrb-gc-23-02 | secondary | GC 23-02's date and its proposed presumption against intrusive monitoring | closes with: the memo's text opened on nlrb.gov | checked: 2026-10-29 -->(the memo's description here comes from law-firm summaries; the NLRB's own page confirms only its subject). On February 14, 2025, Acting General Counsel William Cowen rescinded GC 23-02 in GC 25-05, so as of October 2026 the Board's prosecutors aren't pursuing that theory; the statute and the rule against spying on union activity are unchanged.

**Consumer reporting.** The CFPB's Circular 2024-06 said employers using third-party background dossiers and algorithmic scores about workers must follow the Fair Credit Reporting Act; the CFPB withdrew it on May 12, 2025. The statute it interpreted remains, but the agency guidance pointed at monitoring vendors is gone.

## Europe

### GDPR and the employer as controller

Under the GDPR the employer is the controller of employees' data in its workspace and the vendor is its processor ([Controllers, Processors and the DPA](/docs/compliance/gdpr#controllers-processors-and-the-dpa)). Article 88 lets member states "by law or by collective agreements" provide more specific rules for employee data, which "shall include suitable and specific measures to safeguard the data subject's human dignity," with attention to transparency and transfers within a group. Many have, and collective agreements with works councils are one of the instruments the article names.

The practical rules regulators apply are consistent: monitoring needs a lawful basis (consent rarely works in employment, so it's usually legitimate interest or a legal obligation), must be necessary and proportionate, must be explained to employees in writing beforehand, and usually needs a data protection impact assessment. The UK regulator's guidance on monitoring workers says employers considering monitoring emails and messages "must complete a DPIA," that "it would be difficult to justify monitoring the content of emails and messages" where traffic data would serve, that content should be accessed only under a clear policy and in exceptional cases, and that covert monitoring is unlikely to be justified "in usual circumstances." As of October 2026 the ICO marks that guidance as under review after the Data (Use and Access) Act.

### Works councils and Microsoft 365

Germany adds a co-determination right that reaches the tool itself. Section 87(1) no. 6 of the Works Constitution Act gives the works council a say over "the introduction and use of technical devices designed to monitor the behaviour or performance of the employees," and if employer and council can't agree, a conciliation committee decides and its award "takes the place of an agreement" (section 87(2)).

The Federal Labour Court applied this to Microsoft 365 on March 8, 2022 (1 ABR 20/21). The employer planned to roll out Office 365 across its sites in one tenant. The court held that the suite is a technical device under section 87(1) no. 6, because a device is "designed" to monitor if it is objectively suitable to collect behavior or performance information about employees; the employer's intent doesn't matter. Because the central administrator could see user data across all sites, the general works council (not each site's council) was competent, and module-level settings didn't change that since the monitoring functions couldn't be limited to particular people.

What that means for a vendor selling into Germany:

- **The customer can't deploy before agreeing.** Introduction itself requires co-determination, so the sale is followed by a works agreement negotiation that names which modules, reports and logs may be used, by whom and for what. Vendors that publish what each module records, and which settings switch which data off, make that negotiation possible.
- **Capability counts, not configuration.** Objective suitability is the test, so "we don't use that report" isn't a defense; the works agreement has to restrict its use, and the product has to make the restriction enforceable (a role nobody holds, a report switched off, access logged).
- **Every new feature reopens it.** A new analytics dashboard or AI feature that can show per-person behavior is a change to the device, and German customers will ask before turning it on. A changelog that flags features which add per-person data serves them directly.

### CNIL and monitoring software

The French regulator has fined employers for exactly the software categories a workplace stack can include:

- **Inactivity tracking and screenshots, €40,000 (decision of December 19, 2024, published February 4, 2025, SAN-2024-021).** A small real-estate company used software that counted "inactivity" after 3 to 15 minutes without keyboard or mouse input (unjustified periods could lead to pay deductions), measured time on sites and programs labeled non-productive, and took screenshots every 3 to 15 minutes; it also recorded images and sound continuously in offices used as break areas. The CNIL found no lawful basis for the workstation monitoring (Article 6), a breach of data minimization for the video (5.1.c), insufficient written information to employees (12 and 13), a shared administrator account that prevented tracing access (32), and no impact assessment (35).
- **Warehouse scanner indicators, Amazon France Logistique (CNIL decision of December 2023).** The CNIL fined the company €32 million over indicators computed from handheld scanners, including a "stow machine gun" indicator for items scanned too quickly and idle-time and latency indicators, and over keeping all of it for 31 days. On December 23, 2025 the Conseil d'État cut the fine to €15 million: it held that the CNIL had erred in finding no lawful basis for the real-time indicators, which it found limited in scope, but upheld the finding that keeping all the indicators for 31 days breached data minimization; the transparency and security findings, including those on video surveillance, weren't contested and stand.

In its review of 2025, the CNIL reported 16 organizations sanctioned that year for breaking the rules on video surveillance of employees and said that "permanent video surveillance of employees" infringes data protection except in exceptional circumstances.

The two cases mark the edges. Real-time operational indicators with a narrow purpose can rest on legitimate interest; keeping a month of per-person granular history "in case," taking screenshots, and docking pay for idle time cannot. Retention is where even a lawful monitoring design failed.

## Bossware

Dedicated employee monitoring products sit beside the collaboration suite, sometimes reading its APIs: activity scores from keyboard and mouse input, website and app timing, periodic screenshots, webcam captures, and "productivity" rankings. The regulators' positions above converge on these features:

- **Keystroke logging** is behavioral biometric data where a worker can be identified by typing rhythm, in the ICO's words, and device activity monitoring "is likely to capture excessive amounts of workers' personal information."
- **Webcam capture** is something an employer is "particularly unlikely to be able to justify," per the ICO.
- **Inactivity scoring and screenshots** had no lawful basis in the CNIL's December 2024 decision.

My rule for a collaboration product that integrates with such tools: expose aggregate signals through the same concealment and audit controls as first-party reports, never give a third-party monitoring app more than the per-person data a first-party report would show, and treat an app that requests organization-wide read access to messages as an archive or DLP connection subject to the controls in [How to Build It](/books/workplace-and-collaboration/regulated-communications#how-to-build-it).

## Product Patterns That Hold Up

Across the vendors and regulators, five patterns let one product serve a US employer, a German works council and an employee reading a privacy notice:

- **Aggregate by default, identify on purpose.** Microsoft's concealed-by-default reports and pseudonymized compliance reviews are the model: identifiable views exist, are switched on deliberately, and the switch is audited.
- **Separate the roles.** The IT admin who configures the tool isn't automatically able to read content; Purview's rule that Global Administrators have no Communication Compliance access by default is the pattern. Content access is a role of its own, ideally requiring a second approver.
- **Record a reason for content access.** Each export of a person's messages or a private channel carries a purpose (investigation, legal hold, regulatory request), a requester, an approver and an expiry, which is what a works agreement, a DPIA or an NLRB charge will ask about.
- **Notice as data.** Notices and acknowledgments per employee per jurisdiction, versioned, with New York's hiring timing and Delaware's daily or acknowledged options.
- **Minimize retention of activity data.** The Amazon decision turned on 31 days of granular indicators; per-person activity metrics should roll up into aggregates quickly, and the raw rows should expire on a stated schedule ([Retention Windows](/docs/architecture/data-retention#retention-windows)).

## How to Build It

The vendor builds controls the customer's admins operate: concealment and minimum group sizes on analytics, gated and reasoned content access, and notices. Additions to the core data model in [The Workplace Software Business](/books/workplace-and-collaboration/workplace-business#the-core-data-model):

```sql
ALTER TABLE workspaces
  ADD COLUMN analytics_identifiable   BOOLEAN NOT NULL DEFAULT FALSE,  -- names shown in usage reports
  ADD COLUMN analytics_min_group_size SMALLINT NOT NULL DEFAULT 5,     -- smallest group a report may show
  ADD COLUMN activity_detail_ttl      INTERVAL NOT NULL DEFAULT '30 days'; -- raw per-person rows, then aggregates

CREATE TABLE monitoring_notices (        -- what employees are told, per jurisdiction and version
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  jurisdiction    TEXT NOT NULL,         -- 'US-NY', 'US-CT', 'US-DE', 'DE', 'FR', 'GB'
  version         INT NOT NULL,
  body            TEXT NOT NULL,
  delivery        TEXT NOT NULL CHECK (delivery IN ('on_hire', 'daily_banner', 'posted', 'on_change')),
  requires_ack    BOOLEAN NOT NULL,
  valid_during    TSTZRANGE NOT NULL,
  UNIQUE (organization_id, jurisdiction, version)
);

CREATE TABLE monitoring_acknowledgments (
  notice_id       UUID NOT NULL REFERENCES monitoring_notices (id),
  member_id       UUID NOT NULL REFERENCES members (id),
  acknowledged_at TIMESTAMPTZ NOT NULL,
  channel         TEXT NOT NULL,         -- 'onboarding_flow', 'client_banner', 'esign'
  PRIMARY KEY (notice_id, member_id)
);

CREATE TABLE monitoring_agreements (     -- a works agreement or DPIA that allows specific features
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  kind            TEXT NOT NULL CHECK (kind IN ('works_agreement', 'dpia', 'policy')),
  reference       TEXT NOT NULL,         -- the customer's document id
  allowed_features TEXT[] NOT NULL,      -- 'usage_reports.identifiable', 'export.single_user'
  scope_group_id  UUID REFERENCES groups (id),  -- the employees it covers, null for all
  valid_during    TSTZRANGE NOT NULL
);

CREATE TABLE content_access_requests (   -- every reach into a person's or a private container's content
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  requested_by    UUID NOT NULL REFERENCES members (id),
  subject_member_ids UUID[] NOT NULL DEFAULT '{}',
  container_ids   UUID[] NOT NULL DEFAULT '{}',
  purpose         TEXT NOT NULL CHECK (purpose IN ('investigation', 'legal_hold', 'regulatory',
                    'security_incident', 'offboarding', 'other')),
  justification   TEXT NOT NULL,
  date_range      TSTZRANGE NOT NULL,
  agreement_id    UUID REFERENCES monitoring_agreements (id),
  approved_by     UUID REFERENCES members (id),
  status          TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'denied', 'fulfilled',
                    'expired')),
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (approved_by IS NULL OR approved_by <> requested_by)
);
```

Notes on the sketch:

- **Concealment is the default and the switch is audited.** Turning `analytics_identifiable` on writes an `audit_events` row with the actor; in a workspace whose organization has a `works_agreement` row, the console refuses unless the agreement lists `usage_reports.identifiable`.
- **Minimum group size applies everywhere.** Every report and API that returns analytics suppresses groups smaller than `analytics_min_group_size`, so filtering a team report down to one person returns nothing rather than that person.
- **Exports go through a request.** A single-user or private-channel export, a legal hold on a named custodian and a supervision reviewer's access all create a `content_access_requests` row; the export job refuses to run without an approved, unexpired request, and the approver must be someone else.
- **Notices follow provisioning.** A SCIM create for a member in a New York or Delaware location schedules the notice and blocks nothing; the missing acknowledgment is a report for the customer's HR, not a lockout.
- **Raw activity expires.** Per-person activity rows older than `activity_detail_ttl` are rolled into aggregates and deleted, with the job's runs audited.
- **Events:** `analytics.identifiable_enabled`, `content_access.requested`, `content_access.approved`, `content_access.fulfilled` and `monitoring_notice.published` go to the customer's admins and, where configured, to a works council or privacy office mailbox.

## Auditing

- **Every identifiable view switched on,** by whom, under which agreement, and every report run while it was on.
- **Every content access request,** its purpose, subjects, containers, date range, approver, fulfillment and expiry, retained longer than the content it reached ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Notice coverage:** employees in each jurisdiction without a current notice or required acknowledgment.
- **Agreement drift:** features in use that no current works agreement or DPIA lists, per organization.
- **Activity data age:** the oldest raw per-person activity row per workspace against its stated retention.
- **Third-party apps with organization-wide read access,** their purpose and their approval.

## What This Means for the System You Build

- **Ship aggregate, concealed analytics by default,** with minimum group sizes, and audit every switch to identifiable views.
- **Separate configuration from content access,** and require a reason, a second approver and an expiry for every reach into a person's messages.
- **Store notices and acknowledgments per jurisdiction,** tied to onboarding for New York and Delaware.
- **Publish what each module records** so German customers can negotiate a works agreement, and flag new features that add per-person data.
- **Expire raw activity data quickly;** keep aggregates.
- **Don't build inactivity scores, screenshots or keystroke capture** into a collaboration product, and don't hand third-party monitoring apps more than first-party reports show.
- **Keep organizing out of reach of ordinary admin tooling,** by making out-of-the-ordinary content access a reasoned, logged request.

## References

**Vendor documentation**

- [Microsoft 365 blog: Our commitment to privacy in Microsoft Productivity Score (December 1, 2020)](https://www.microsoft.com/en-us/microsoft-365/blog/2020/12/01/our-commitment-to-privacy-in-microsoft-productivity-score/), the removal of user names, organization-level aggregation and the interface change
- [Microsoft Learn: Microsoft 365 admin center usage reports](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/activity-reports), reporting periods, license use, concealed names by default, the org setting and its audit event
- [Microsoft Learn: Communication Compliance](https://learn.microsoft.com/en-us/purview/communication-compliance), pseudonymization by default, opt-in investigators and Global Administrator access
- [Slack: Export your workspace data](https://slack.com/help/articles/201658943-Export-your-workspace-data), what each plan can export and the application process

**Law and regulation**

- [18 U.S.C. 2701](https://www.law.cornell.edu/uscode/text/18/2701), the stored communications offense and the service provider exception in (c)(1)
- [New York Civil Rights Law 52-c](https://www.nysenate.gov/legislation/laws/CVR/52-C*2), notice upon hiring, acknowledgment, posting, covered monitoring, the exemption and penalties
- [Connecticut General Statutes chapter 557](https://www.cga.ct.gov/current/pub/chap_557.htm), section 31-48d's definition, prior written notice, posting, exception and penalties
- [Delaware Code title 19, chapter 7, subchapter I](https://delcode.delaware.gov/title19/c007/sc01/index.html), section 705's daily or acknowledged notice, exemptions and the $100 penalty
- [NLRB: Interfering with employee rights](https://www.nlrb.gov/about-nlrb/rights-we-protect/the-law/interfering-with-employee-rights-section-7-8a1), spying on union activities and creating the impression of spying
- [NLRB: GC 25-05, Rescission of certain General Counsel memoranda](https://www.nlrb.gov/news-outreach/news-story/gc-25-05-rescission-of-certain-general-counsel-memoranda), February 14, 2025, the rescission of GC 23-02 on electronic monitoring
- [CFPB: Withdrawn guidance](https://www.consumerfinance.gov/compliance/guidance/withdrawn-guidance/), Circular 2024-06 withdrawn on May 12, 2025
- [GDPR Article 88](https://gdpr-info.eu/art-88-gdpr/), more specific rules for employment by law or collective agreement and the dignity safeguards
- [Works Constitution Act (English translation)](https://www.gesetze-im-internet.de/englisch_betrvg/englisch_betrvg.html), section 87(1) no. 6 and section 87(2), and section 77 on works agreements
- [Federal Labour Court: 1 ABR 20/21 (March 8, 2022)](https://www.bundesarbeitsgericht.de/en/entscheidung/1-abr-20-21), Office 365 as a technical device, objective suitability and the general works council's competence

**Regulators**

- [CNIL: Excessive employee monitoring, €40,000 sanction](https://www.cnil.fr/fr/surveillance-excessive-des-salaries-sanction-de-40-000-euros-entreprise-secteur-immobilier), decision and publication dates, the software, the video system and the articles breached
- [Légifrance: Conseil d'État, 492830 (December 23, 2025)](https://www.legifrance.gouv.fr/ceta/id/CETATEXT000053163189), the CNIL's December 2023 decision and €32 million fine, the indicators, the reduction to €15 million, the lawful basis finding annulled and minimization upheld
- [CNIL: Sanctions and corrective measures, 2025 review](https://www.cnil.fr/fr/bilan-sanctions-2025), 16 organizations sanctioned for employee video surveillance and the position on permanent video surveillance
- [ICO: Monitoring workers](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/), the guidance and its review after the Data (Use and Access) Act
- [ICO: Specific considerations for different ways of monitoring workers](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/specific-data-protection-considerations-for-different-ways-or-methods-of-monitoring-workers/), DPIAs for message monitoring, content versus traffic data, keystrokes as biometric data, webcams and covert monitoring
