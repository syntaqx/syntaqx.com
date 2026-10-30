+++
title = "Regulated Communications & Archiving"
nav_title = "Regulated Communications"
description = "SEC 17a-4, FINRA 4511 and 3110, the off-channel fines, CFTC and MiFID II recording, and how archivers capture and supervise chat and meetings."
category = "Workplace & Collaboration Industry"
order = 2052
part = "Security and Compliance"
tags = ["compliance", "finra", "sec", "archiving", "supervision", "recordkeeping"]
+++

A broker-dealer that lets its staff talk business in Slack, Teams or Zoom has to keep every one of those messages for years, in a form a regulator will accept, and has to have a principal review them. An investment adviser has a similar duty; a swap dealer has to keep its oral communications too; a European investment firm has to record the phone calls and keep the chats that lead to a trade. None of this is new for email, which firms have journaled into archives for decades. What changed is that business moved into chat apps, meeting tools and, above all, personal phones, and between December 2021 and January 2025 US regulators fined dozens of firms for the messages they didn't keep.

For a workplace vendor this is the inversion at its sharpest. The vendor doesn't keep the firm's books and can't supervise its brokers; the firm does, usually through a specialist archiver (Smarsh, Global Relay, Proofpoint and others) that pulls every message out of the collaboration tool as it happens. The vendor's job is to make capture complete: an export API that misses edits, deletions, reactions, meeting chat or an AI summary leaves the firm with a books-and-records gap it can't see. The firm's admin decides which channels are approved, which users are registered persons, which retention applies, and what the reviewers look at.

This chapter covers the financial recordkeeping rules, the off-channel enforcement wave, how capture and supervision work across the major tools, and what a vendor builds to be usable by regulated firms. Retention policies and legal holds in general are [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold); exports for litigation are [eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export); content inspection outside recordkeeping is [DLP & Information Protection](/books/workplace-and-collaboration/dlp-and-information-protection); HIPAA agreements are [HIPAA Agreements Are Scoped to Features](/books/workplace-and-collaboration/compliance-certifications#hipaa-agreements-are-scoped-to-features); consent to record a meeting is [Recordings, Transcripts & AI Notes](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes#convenience-and-compliance-recording). The engineering of a tamper-evident store is the playbook's [Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident), and WORM object storage is the Hosting & Cloud volume's [Object Storage Semantics](/books/hosting-and-cloud/storage#object-storage-semantics). This is what the rules say and how systems that follow them are built, not legal advice.

## How the Platforms Do It

How the collaboration tools hand regulated messages to an archive, as of October 2026:

| Platform | Capture path | What it reaches | Who can turn it on |
| --- | --- | --- | --- |
| **Slack** | Discovery API, for eDiscovery, DLP and archiving partners | Messages, files, canvases, lists, reactions and Slackbot conversations; edits and deletions where retention or legal holds preserved them | Enterprise plans only; requested by the Primary Org Owner or an Org Owner; "may only be used for security and compliance use cases" |
| **Microsoft Teams** | Teams Export APIs in Microsoft Graph (protected APIs, application permissions) | 1:1, group, meeting and channel messages, shared channels, reactions and their edit history, control messages, attachments, meeting recordings and transcripts, Copilot interactions; deleted messages for 21 days, retained versions beyond that | An admin consents to `Chat.Read.All`, `ChannelMessage.Read.All` and related permissions for the archiver's app |
| **Microsoft Purview** | Communication Compliance over Teams, Exchange, Viva Engage, Copilot and imported third-party data | Policy matches for reviewers, with pseudonymized names by default | Admins grant Communication Compliance roles; Global Administrators have no access by default |
| **Zoom** | Built-in chat archiving to Global Relay or Smarsh, sent once a day; meeting and webinar archiving through Marketplace archiving apps, whose agent joins the meeting and which fetch the files through Zoom's archiving APIs | Out-of-meeting chat messages and files (chat encryption must be off for the archive to read them); archived meeting files wait in Zoom's cloud for 1 to 30 days | Account owners or admins |
| **Archivers** | Smarsh, Global Relay, Proofpoint and others, through the platforms' APIs | Smarsh lists Teams chats, channels, meetings, files, reactions, Teams Phone, SMS and Copilot interactions; Global Relay lists Zoom meeting and webinar chat, recordings, transcripts, polls, Q&A and Zoom Phone SMS and calls, with meeting chat edits and deletions but not webinar ones | The firm, as the archiver's customer |

The shape is the same everywhere. **The collaboration tool is not the archive.** It exposes a complete, permissioned feed; the firm's archiver ingests it into storage that meets the recordkeeping rule, indexes it and runs supervision over it. Slack describes itself as "FINRA 17a-4 configurable," which is the honest phrasing: the platform can be configured so a compliant archive gets everything, not certified as the archive itself. Microsoft names Smarsh and Proofpoint as Teams export partners and Rubrik and Veeam as backup partners, and the distinction matters. Backup restores a tenant; an archive answers a regulator.

## The US Recordkeeping Rules

Three rules carry most of the weight for securities firms:

- **SEC Rule 17a-4 (broker-dealers).** Paragraph (b)(4) requires "originals of all communications received and copies of all communications sent" relating to the business as such, kept for three years, the first two in an easily accessible place. The content decides, not the channel: a business message in a chat app is as much a record as a business email.
- **FINRA Rule 4511.** Members make and preserve the books and records FINRA rules require, for at least six years where no other period is specified, "in a format and media that complies with SEA Rule 17a-4."
- **SEC Rule 204-2 (investment advisers).** Paragraph (a)(7) requires advisers to keep "originals of all written communications received and copies of all written communications sent" relating to recommendations, advice, fund transfers and orders, for not less than five years from the end of the fiscal year of the last entry, the first two in an appropriate office of the adviser.

FINRA's guidance applied these to new channels early. Regulatory Notice 17-18 (April 25, 2017) says a firm that permits business communication by "text messaging app or chat service" must "first ensure that it can retain records of those communications," because "the content of the communication determines what must be retained." A firm that can't capture a channel has to keep business off it.

### How the records must be kept

Rule 17a-4(f) sets the electronic recordkeeping requirements, and its two options are the design choice for any archive. The second option is the old one; the SEC added the audit-trail alternative in amendments adopted on October 12, 2022 (Release 34-96034, published at 87 FR 66412 on November 3, 2022 and effective January 3, 2023, with compliance for the 17a-4 changes due six months after publication), which also let a designated executive officer sign the undertaking described below in place of a third party:

- **Audit trail.** Keep the records with a complete, time-stamped audit trail that logs every modification and deletion, with the date, time and identity of whoever acted, and that allows the original record to be re-created.
- **Non-rewriteable, non-erasable.** "Preserve the records exclusively in a non-rewriteable, non-erasable format," the WORM option that [object locks in compliance mode](/books/workplace-and-collaboration/retention-and-legal-hold#preservation-lock) implement.

Either way the system must verify completeness and accuracy of storage automatically and keep a backup or other redundancy. The firm also files an undertaking with its designated examining authority, signed by a designated executive officer or a designated third party (a person not affiliated with the firm), promising to furnish records to the SEC promptly. That undertaking is why archivers matter beyond storage: the firm needs someone outside its own staff who can produce the records if the firm can't or won't.

For a collaboration tool, the audit-trail option maps onto what the product already has: `item_versions` and `audit_events` are a modification history. But the product's own retention settings can delete them, its admins can change them, and its edit and delete features change the original record, so the product alone rarely satisfies the rule. The archive downstream holds the copy that does.

### Supervision

Recordkeeping says keep it; supervision says read it. FINRA Rule 3110(b)(4) requires procedures for reviewing incoming and outgoing correspondence and internal communications, focused on customer complaints and communications FINRA rules require reviewed, "conducted by a registered principal" and "evidenced in writing." The supplementary material sets the shape of every supervision tool:

- **Risk-based review (.06).** A firm decides by risk-based principles how much beyond the required subjects to review; where not everything is reviewed before use, it provides training and "surveillance and follow-up."
- **Evidence of review (.07).** The evidence must identify the reviewer, the communication reviewed, the date and any action, and "merely opening a communication is not sufficient review."
- **Delegation (.08).** Reviews can be delegated to unregistered staff, but the principal "remains ultimately responsible."
- **Retention (.09).** Review records are kept for the 17a-4(b) period, with the preparer and reviewer of outgoing correspondence identifiable.

Rule .07 is a product requirement in plain words: a review tool must record a decision, not a page view.

## The Off-Channel Sweep

Between 2021 and 2025 the SEC and CFTC brought a series of cases against firms whose staff, including senior managers, conducted business by text and messaging apps on personal phones that the firms didn't capture. The SEC's own releases, round by round:

| Date | Firms | SEC penalties | Notes from the release |
| --- | --- | --- | --- |
| **December 17, 2021** | J.P. Morgan Securities | $125 million | Conduct from January 2018 to November 2020; JPMS admitted the findings and violations of Rules 17a-4(b)(4) and 17a-4(j); the CFTC announced a related settlement |
| **September 27, 2022** | 16 (15 broker-dealers and one affiliated adviser) | More than $1.1 billion combined | Off-channel business by supervisors and senior executives from January 2018 to September 2021; compliance consultants to review policies on personal devices |
| **August 8, 2023** | 11 | $289 million | The SEC counted "30 enforcement actions" and "over $1.5 billion in penalties" to date |
| **September 29, 2023** | 10 | $79 million | Reduced penalties for self-reporting and cooperation |
| **February 9, 2024** | 16 | More than $81 million | A reduced penalty for a self-reporting firm |
| **August 14, 2024** | 26 broker-dealers, advisers and dual registrants | $392.75 million | |
| **September 24, 2024** | 12 | $88.225 million | "Pervasive and longstanding use of unapproved communication methods"; one self-reporting firm paid no penalty |
| **January 13, 2025** | 12 (nine advisers, three broker-dealers) | $63.1 million | One self-reporting firm received a reduced penalty |

The CFTC ran its own cases in parallel. On September 27, 2022 it announced settlements with 11 financial institutions whose affiliates were swap dealers or futures commission merchants, with penalties its release totals at "over $710 million," for recordkeeping and supervision failures.

The SEC's last cumulative statement in the releases opened here is the August 2023 one (30 actions, over $1.5 billion); later releases give each round's total but no new running figure, so the table is the sourced record and I don't add a grand total of my own.

The last round changed the remedy, and earlier respondents asked for the same deal. In motions the Commission described in an April 14, 2025 order, firms under sixteen settled orders from September 2023 to September 2024 asked to replace their roughly two-year independent compliance consultant engagement with a one-time internal audit and to drop two years of reporting employee discipline to the SEC, matching the January 2025 settlements. The Commission denied them, holding that later parties negotiating better terms is not the "compelling" or "extraordinary" circumstance needed to modify a settled order, and denied five more such motions on June 26, 2025; Commissioner Peirce dissented both times. The earlier undertakings stand as written, so the same conduct carries different remediation depending on when a firm settled.

What the cases ask of the firm, and therefore of the tools it buys:

- **Approved channels are a list, and the list is enforced.** The firms had policies that banned off-channel business; the violations were staff using personal apps anyway. A firm needs approved channels good enough that staff use them, which is the argument for capturing Slack, Teams and Zoom completely rather than banning them.
- **Supervisors and executives are in scope.** The September 2022 release names supervisors and senior executives among those who used personal devices; a supervision policy that excludes the leadership chat is the gap the regulator found.
- **Self-reporting changes the penalty.** Later releases cut or waived penalties for firms that found and reported their own gaps, which rewards a firm that can measure its own capture coverage.

## CFTC and MiFID II: Recording Calls and Chats

The derivatives and European rules reach further than written messages.

**CFTC.** Regulation 23.202(a)(1) requires swap dealers and major swap participants to keep "records of all oral and written communications provided or received concerning quotes" and other pre-execution steps leading to a swap, "whether communicated by telephone, voicemail, facsimile, instant messaging, chat rooms, electronic mail, mobile device" or other digital or electronic media. For a meeting or phone product sold to a swap dealer, that means voice capture, not just chat capture.

**MiFID II.** Article 16(7) of Directive 2014/65/EU requires investment firms to record telephone conversations and electronic communications relating to transactions on own account and to client orders, to take reasonable steps to prevent employees and contractors from making or receiving those communications on private equipment the firm can't record, and to keep the records for five years, or up to seven where the competent authority asks. Article 76 of Commission Delegated Regulation (EU) 2017/565 fills in the operation:

- A written recording policy, overseen by the management body.
- A register of the individuals who have firm devices or privately owned devices approved for use.
- Clients told before services begin that conversations and communications are recorded, and that copies are available on request for five years (seven where the authority asks).
- Periodic, risk-based monitoring of the records, including the relevant conversations.
- Retention counted from the date the record is created.

The UK carried the same rules into the FCA Handbook as SYSC 10A: record calls and keep electronic communications on firm equipment or equipment the firm has accepted or permitted (10A.1.6R); take "all reasonable steps to prevent an employee or contractor" using private equipment the firm can't record or copy (10A.1.7R); notify clients (10A.1.11R); keep records five years and up to seven at the FCA's request (10A.1.14R); monitor compliance (10A.1.15R); and record relevant face-to-face client conversations in a durable medium (10A.1.16R).

The European rules make two product demands the US rules don't: voice and video of trading conversations are records, and the firm keeps a register of who may use which device. A meetings product sold to a European investment firm needs per-user recording policies (record every call for these traders, none for HR) and a capture feed that includes the recording; a chat product needs to know whether a session is on a firm device or a permitted personal one.

## Capture: What an Archive Needs From the Tool

An archiver pulls from the platform's export API, keeps its own copy and indexes it. The difficult parts are the same for every tool:

- **Every message type.** 1:1, group, channel, shared-channel and meeting chat, bot and app messages, and system messages ("User A added User B to the chat and shared all chat history"); Teams' export documents each of these, including control messages, because a reviewer needs them to read a conversation.
- **Edits, deletions and reactions.** A deleted message that the archive never saw is the gap 17a-4's audit-trail option exists to prevent. Teams' export returns user-deleted messages for 21 days and, with a retention policy, retained versions and earlier edits beyond that; Slack's Discovery API returns edits and deletions where retention or legal holds preserved them. The practical rule is that a regulated workspace's retention must be set to keep everything so the export can see it, and capture must poll faster than any deletion window.
- **Files and recordings.** Attachments as files, not just links in the body (Teams says to use the `attachments` collection because URLs in the body may not be accessible); meeting recordings and transcripts, which Teams exports by organizer for private scheduled meetings only.
- **Cross-organization conversations.** In a Slack Connect channel or a Teams shared channel, the other firm's messages are part of the conversation and of the record; each firm captures its own view.
- **AI output.** Copilot interactions are exportable from Microsoft Graph and appear in Smarsh's list of captured Teams content. A meeting summary written by an assistant and posted into a channel is a message like any other; my rule is that a regulated firm treats an AI summary that is shared as a communication and captures it, and treats the prompt history as at least supervisable, as Purview's Communication Compliance does.
- **Completeness checks.** The archive reconciles counts per conversation and per day against the source, because 17a-4(f) requires automatic verification of completeness, and a failed poll otherwise looks like a quiet day.

Permission is the other half. Teams' export uses protected APIs with application permissions that "only an administrator can approve"; Slack's Discovery API is enabled at the request of the org owner and limited by Slack to security and compliance uses. The firm's admin grants the archiver access to everything, which is exactly the kind of grant [Threats & Incidents](/books/workplace-and-collaboration/threats-and-incidents#oauth-consent-and-app-abuse) treats as a crown jewel.

The archive is a target in its own right. Capturing personal-device messaging, the off-channel answer, means a capture client or gateway between the messaging app and the archive, and that layer holds every message in a readable form. TeleMessage, which Smarsh acquired in February 2024, sold such clients; CISA added a TM SGNL flaw to its Known Exploited Vulnerabilities catalog on May 12, 2025 (CVE-2025-47729, a "hidden functionality" issue in which the archiving backend keeps unencrypted copies of users' messages) and two more TM SGNL flaws on July 1, 2025 (CVE-2025-48927 and CVE-2025-48928). For a vendor, the lesson is that end-to-end encryption claims stop at the capture point, so an archive feed has to be held to the same encryption, access control and logging as the product itself.

## Supervision and Lexicon Review

Supervision tools turn the archive into a review queue. Their mechanics, from the tools' own descriptions:

- **Policies scoped to people.** A policy applies to registered persons or a supervised group, a set of channels and a set of conditions. Purview requires individual users, groups or specific Teams channels to be added to a policy explicitly.
- **Lexicons and classifiers.** Keyword lists and patterns (guarantees, off-channel invitations like "text me," complaint language) remain the base; Smarsh describes "configurable policies, lexicons, and AI-driven surveillance," and Purview combines condition builders with machine-learning classifiers for threats, harassment and profanity and a template for financial regulatory compliance terms.
- **Sampling.** Rule 3110.06 lets a firm decide by risk how much to review beyond the required subjects, so a review program combines policy matches with samples of everything else.
- **Review workflow.** Alerts, conversation context around a match, tagging as compliant, non-compliant or questionable, escalation to another reviewer, notifying the user, removing a message from Teams, and escalation to an eDiscovery case, each recorded so the evidence names reviewer, item, date and action.
- **Privacy by design.** Purview pseudonymizes user names by default, keeps Global Administrators out unless granted, and logs reviewer activity, because supervision reads employees' messages and is itself an employee monitoring program ([Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy#product-patterns-that-hold-up) covers the limits).

Lexicons generate false positives at a scale that makes reviewers ignore them, which is the usual failure. My default is to tune per policy on measured hit rates (what fraction of flags reviewers mark non-compliant), retire terms that never produce a finding, and keep a random sample alongside lexicon hits so the firm can show its review would catch what the lexicon missed.

## HIPAA in Chat and Meetings

Health care organizations face a different regime with the same shape: the vendor signs a business associate agreement that covers specific features, and the organization's admin keeps protected health information inside them. Slack's agreement covers PHI in messages, files and certain names on Enterprise plans; Google's covers its Included Functionality; Microsoft's covers listed services including Teams. Meeting recordings and transcripts that contain PHI are records in the covered service only if that feature is on the in-scope list. HHS's cloud guidance is why the agreement can't be skipped: a cloud provider that stores ePHI is a business associate even when it holds only encrypted data and no key, and the conduit exception covers transmission alone, not storage, so a chat or meeting service that keeps messages is never a mere conduit. The vendor-by-vendor detail is in [HIPAA Agreements Are Scoped to Features](/books/workplace-and-collaboration/compliance-certifications#hipaa-agreements-are-scoped-to-features); the rules themselves are the playbook's [HIPAA](/docs/compliance/hipaa), and how they bind a product team is the Health Tech volume's [HIPAA in Practice](/books/health-tech/hipaa-in-practice).

## How to Build It

A vendor that wants regulated firms as customers builds the capture feed, the controls that keep it complete, and enough of the supervision surface that an archiver can work. The firm's archive itself is the archiver's product. This adds to the core data model in [The Workplace Software Business](/books/workplace-and-collaboration/workplace-business#the-core-data-model):

```sql
ALTER TABLE members
  ADD COLUMN regulatory_role   TEXT CHECK (regulatory_role IN ('registered_person', 'supervisor',
                                 'principal', 'trader', 'none')),
  ADD COLUMN recording_policy  TEXT NOT NULL DEFAULT 'none' CHECK (recording_policy IN ('none',
                                 'record_calls', 'record_calls_and_meetings'));

CREATE TABLE archive_connections (       -- an archiver's authorized feed from one workspace
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  app_installation_id UUID NOT NULL REFERENCES app_installations (id),
  purpose         TEXT NOT NULL CHECK (purpose IN ('archive', 'ediscovery', 'dlp', 'backup')),
  item_kinds      TEXT[] NOT NULL,        -- 'message', 'file', 'recording', 'transcript', 'ai_interaction'
  include_external BOOLEAN NOT NULL DEFAULT TRUE,  -- shared and Connect channels, as this side sees them
  approved_by     UUID NOT NULL REFERENCES members (id),
  approved_at     TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ
);

CREATE TABLE capture_cursors (           -- how far each connection has read, per stream
  connection_id   UUID NOT NULL REFERENCES archive_connections (id),
  stream          TEXT NOT NULL,          -- 'messages', 'edits', 'deletions', 'files', 'recordings'
  position        TEXT NOT NULL,          -- vendor cursor, or the high-water capture_events id
  read_at         TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (connection_id, stream)
);

CREATE TABLE capture_reconciliations (   -- daily counts the archive confirms against the source
  connection_id   UUID NOT NULL REFERENCES archive_connections (id),
  container_id    UUID NOT NULL REFERENCES containers (id),
  day             DATE NOT NULL,
  source_count    INT NOT NULL,           -- items and versions created that day, by the platform's count
  archived_count  INT,                    -- reported back by the archiver
  status          TEXT NOT NULL CHECK (status IN ('pending', 'matched', 'gap', 'resolved')),
  PRIMARY KEY (connection_id, container_id, day)
);

CREATE TABLE approved_channels (         -- the firm's register of channels and devices approved for business
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  channel         TEXT NOT NULL,          -- 'chat', 'meetings', 'phone', 'sms', 'whatsapp_captured'
  device_scope    TEXT NOT NULL CHECK (device_scope IN ('firm_device', 'approved_personal', 'any')),
  member_id       UUID REFERENCES members (id),   -- null: applies to everyone in scope
  captured_by_id  UUID REFERENCES archive_connections (id),
  valid_during    TSTZRANGE NOT NULL
);

CREATE TABLE supervision_reviews (       -- evidence of review, per FINRA 3110 .07
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  item_id         UUID NOT NULL REFERENCES items (id),
  item_version_id UUID REFERENCES item_versions (id),
  policy_ref      TEXT NOT NULL,          -- the supervision policy or lexicon that flagged it, or 'sample'
  reviewer_id     UUID NOT NULL REFERENCES members (id),
  decision        TEXT NOT NULL CHECK (decision IN ('compliant', 'non_compliant', 'questionable',
                    'escalated', 'misclassified')),
  action          TEXT,                   -- 'notified_user', 'removed_message', 'opened_case'
  decided_at      TIMESTAMPTZ NOT NULL
);
```

Notes on the sketch:

- **A regulated workspace keeps everything.** When `compliance_profile` includes `finra` (from [How to Build It](/books/workplace-and-collaboration/compliance-certifications#how-to-build-it)), the console requires a retention policy that preserves edits and deletions and refuses to let members delete messages beyond the capture window, and every change to that is an `audit_events` row.
- **Capture is a stream, not a nightly job.** Each connection reads every stream through its cursor; edits and deletions are their own streams so a delete is captured as an event, with the version it removed.
- **Gaps are visible to both sides.** `capture_reconciliations` holds the platform's count per container per day and the archive's count, so a missed poll shows up as a `gap` the next morning rather than at the next exam.
- **Connections are privileged apps.** An archive connection reads everything in the workspace; its approval, scope and revocation are audited like an admin role, and its token is the first thing rotated in an incident.
- **Recording follows the member.** `recording_policy` drives automatic recording for traders' calls and meetings and their delivery to the archive, with the client notice the European rules require shown in the meeting.
- **Events:** `archive_connection.approved`, `archive_connection.revoked`, `capture.gap_detected` and `retention.changed_in_regulated_workspace` go to the firm's admins and compliance team.

## Auditing

- **Coverage by day:** for each regulated workspace and container, source counts, archived counts and every gap with its resolution.
- **Every archive connection,** who approved it, its scope, and when its permissions changed or it was revoked.
- **Retention and deletion settings over time** in regulated workspaces, and every message deleted with whether the archive had captured it first.
- **The approved-channels register** as of any date, and members whose activity shows use of an unregistered channel where the firm has asked the product to detect it.
- **Every supervision decision** with reviewer, item, version, date, decision and action, retained for the 17a-4(b) period.
- **Reviewer access,** since reviewers read colleagues' messages ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Ship a complete export feed,** covering every message type, edits, deletions, reactions, files, recordings, transcripts and AI output, and document what it doesn't cover.
- **Let regulated workspaces keep everything,** and never let a message disappear before the archive has captured it.
- **Reconcile capture counts** with the archiver so gaps surface in a day.
- **Treat archive connections as the most privileged apps** in the tenant, approved, scoped and audited like admins.
- **Support per-member recording policies** for trading roles, with the notice European rules require.
- **Record review decisions, not page views,** if you build supervision; FINRA says opening isn't reviewing.
- **Make approved channels good enough to use.** The off-channel fines were about staff leaving the approved tools; a complete, low-friction approved channel is the product answer.

## References

**Law and regulation**

- [17 CFR 240.17a-4](https://www.law.cornell.edu/cfr/text/17/240.17a-4), communications under (b)(4), the three-year and two-year periods, the audit-trail and non-rewriteable options in (f)(2), verification and redundancy, the designated third party and the undertaking
- [SEC: Electronic Recordkeeping Requirements for Broker-Dealers, Release 34-96034 (October 12, 2022)](https://www.sec.gov/files/rules/final/2022/34-96034.pdf), the audit-trail alternative to WORM, the designated executive officer option and the compliance date
- [Federal Register: 87 FR 66412 (November 3, 2022)](https://www.federalregister.gov/documents/2022/11/03/2022-22670/electronic-recordkeeping-requirements-for-broker-dealers-security-based-swap-dealers-and-major), publication and the January 3, 2023 effective date
- [HHS: Guidance on HIPAA and cloud computing](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html), cloud providers as business associates without the key and the transmission-only conduit exception
- [17 CFR 275.204-2](https://www.law.cornell.edu/cfr/text/17/275.204-2), investment adviser written communications under (a)(7) and the five-year retention in (e)(1)
- [17 CFR 23.202](https://www.law.cornell.edu/cfr/text/17/23.202), swap dealers' records of oral and written communications concerning quotes and the media listed
- [FINRA Rule 4511](https://www.finra.org/rules-guidance/rulebooks/finra-rules/4511), the six-year default and the 17a-4 format requirement
- [FINRA Rule 3110](https://www.finra.org/rules-guidance/rulebooks/finra-rules/3110), review of correspondence and internal communications, risk-based review, evidence of review, delegation and retention
- [FINRA Regulatory Notice 17-18](https://www.finra.org/rules-guidance/notices/17-18), April 25, 2017, retaining text messaging and chat service communications and content determining retention
- [EUR-Lex: Directive 2014/65/EU (MiFID II)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0065), Article 16(7) recording, private equipment and five-to-seven-year retention
- [Commission Delegated Regulation (EU) 2017/565, Article 76 (as adopted)](https://www.legislation.gov.uk/eur/2017/565/article/76/adopted), the written policy, oversight, device register, client notice, monitoring and retention start
- [FCA Handbook: SYSC 10A.1](https://www.handbook.fca.org.uk/handbook/SYSC/10A/1.html), UK recording scope, private equipment, client notice, retention, monitoring and face-to-face conversations

**Enforcement**

- [SEC: JPMorgan admits to widespread recordkeeping failures (December 17, 2021)](https://www.sec.gov/newsroom/press-releases/2021-262), the $125 million penalty, period, admissions and rules
- [SEC: Sixteen firms to pay more than $1.1 billion (September 27, 2022)](https://www.sec.gov/newsroom/press-releases/2022-174), firms, penalties, period, personal devices and undertakings
- [CFTC: Release 8599-22 (September 27, 2022)](https://www.cftc.gov/PressRoom/PressReleases/8599-22), 11 institutions and over $710 million for recordkeeping and supervision failures
- [SEC: Eleven firms to pay $289 million (August 8, 2023)](https://www.sec.gov/newsroom/press-releases/2023-149), the round and the cumulative count of 30 actions and over $1.5 billion
- [SEC: Ten firms to pay $79 million (September 29, 2023)](https://www.sec.gov/newsroom/press-releases/2023-212), the round and self-reporting
- [SEC: Sixteen firms to pay more than $81 million (February 9, 2024)](https://www.sec.gov/newsroom/press-releases/2024-18), the round and a self-report
- [SEC: Twenty-six firms to pay more than $390 million (August 14, 2024)](https://www.sec.gov/newsroom/press-releases/2024-98), the round and $392.75 million
- [SEC: Twelve firms to pay more than $88 million (September 24, 2024)](https://www.sec.gov/newsroom/press-releases/2024-144), the round, the description of off-channel use and a self-reporting firm
- [SEC: Twelve firms to pay more than $63 million (January 13, 2025)](https://www.sec.gov/newsroom/press-releases/2025-6), the round and a self-reporting firm
- [SEC: Order denying motions to modify, Release 34-102860 (April 14, 2025)](https://www.sec.gov/files/litigation/opinions/2025/34-102860.pdf), sixteen settled orders, the requested internal-audit and reporting changes, the standard for modification and Commissioner Peirce's dissent
- [SEC: Order denying motions to modify, Release 34-103330 (June 26, 2025)](https://www.sec.gov/files/litigation/opinions/2025/34-103330.pdf), five more settled orders and the same result

**Security advisories**

- [CISA: Known Exploited Vulnerabilities, CVE-2025-47729](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2025-47729), the TM SGNL entry, its May 12, 2025 date and the plaintext archive copies
- [CISA: Adds two known exploited vulnerabilities (July 1, 2025)](https://www.cisa.gov/news-events/alerts/2025/07/01/cisa-adds-two-known-exploited-vulnerabilities-catalog), CVE-2025-48927 and CVE-2025-48928 in TM SGNL
- [Smarsh: Smarsh completes acquisition of TeleMessage (February 20, 2024)](https://www.smarsh.com/press-release/smarsh-completes-acquisition-of-telemessage-extends-communications-compliance-leadership), the acquisition and TeleMessage's mobile capture business

**Vendor documentation**

- [Slack: A guide to Slack's Discovery APIs](https://slack.com/help/articles/360002079527-A-guide-to-Slacks-Discovery-APIs), Enterprise eligibility, data reached, edits and deletions, partner categories and the security and compliance restriction
- [Slack: Compliance certifications and regulations](https://slack.com/trust/compliance), "FINRA 17a-4 configurable"
- [Microsoft Learn: Teams Export APIs](https://learn.microsoft.com/en-us/microsoftteams/export-teams-content), message types, deleted messages for 21 days, retained messages, attachments, recordings and transcripts, protected APIs and permissions, export and backup partners, Copilot interactions
- [Microsoft Learn: Communication Compliance](https://learn.microsoft.com/en-us/purview/communication-compliance), channels, templates, classifiers, remediation workflow, pseudonymization, Global Administrator access and FINRA 3110
- [Smarsh: Microsoft Teams archiving and compliance](https://www.smarsh.com/channel/microsoft-teams/), captured Teams content, the rules it targets and lexicon and AI surveillance
- [Zoom Support: Archiving messages with a third-party provider](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0062360), Global Relay and Smarsh, daily delivery, out-of-meeting chat only and the encryption requirement
- [Zoom: What you need to know about Zoom's archiving solution (March 2, 2022)](https://www.zoom.com/en/blog/zoom-archiving-solution/), Marketplace archiving apps, the archiving agent, 1 to 30 days in Zoom's cloud and the archiving APIs
- [Global Relay: Zoom connector](https://www.globalrelay.com/connector/zoom/), captured Zoom meeting, webinar and phone content and the edit and delete limits
