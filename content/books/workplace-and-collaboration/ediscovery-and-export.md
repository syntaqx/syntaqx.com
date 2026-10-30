+++
title = "eDiscovery & Export"
description = "EDRM, Slack exports and the Discovery API, Purview and Vault eDiscovery, chat review with RSMF, form of production, privilege, and cross-border discovery."
category = "Workplace & Collaboration Industry"
order = 2048
part = "Security and Compliance"
tags = ["workplace", "ediscovery", "export", "litigation", "privilege", "gdpr"]
+++

eDiscovery is how electronically stored information gets from the systems where people work into the hands of lawyers: identified, preserved, collected, processed, reviewed and produced to the other side or a regulator. Workplace software is now where most of that information lives. A dispute that would once have turned on email turns on Slack channels, Teams chats, Google Docs comment threads, Jira tickets and meeting transcripts, and every one of those has to come out of the vendor's product in a form a review platform can read and a court will accept.

The inversion is complete here. A litigant asks the employer for its employees' messages, not the vendor; the employer's legal team runs the search, decides what is responsive and privileged, and produces it; the vendor supplies the tools and, when someone tries to go around the employer with a subpoena, tells them to ask the customer ([Workplace Chat Inverts the Duties](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties)). What makes it hard:

- **Chat isn't a document.** A message makes sense only with the messages around it, its thread, its edits, its reactions and its attachments. Review tools were built for email, one item at a time.
- **Links aren't attachments.** A Slack message that points to a Google Doc refers to a file that has changed since; which version was "attached"?
- **The plan decides what can be collected.** Free and lower tiers export little; the tools that make collection defensible are enterprise features.
- **Data crosses borders.** A US case asking for messages written by employees in France meets GDPR's transfer rules and a French blocking statute.

Preservation, holds and the spoliation case law are [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold); this chapter starts when preserved data has to come out. A customer leaving a vendor with all its data, and the EU Data Act's switching rules, is Migrations, Imports & Switching in the Running the Platform part. This isn't legal advice.

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Vendor | Self-service export | eDiscovery tooling | Formats and limits |
| --- | --- | --- | --- |
| **Slack** | Public channel exports on every plan; private channels and DMs on Business+ and Enterprise after the owner applies; scheduled weekly or monthly exports on Business+ | The Discovery API on Enterprise, enabled at the Primary Org Owner's or an Org Owner's request, for eDiscovery partners (Everlaw, Relativity, Global Relay) and DLP partners | JSON (Enterprise custom exports also TXT); exports carry file links, not files; Discovery API returns messages, files, canvases, lists, reactions and Slackbot conversations, plus edits and deletions if preserved |
| **Microsoft Purview** | Content search, now a system-generated case | Unified eDiscovery: cases, searches, holds; Premium (E5) adds review sets, conversation threading for Teams and Viva Engage, OCR and analytics. Classic eDiscovery experiences retired August 31, 2025 | Search exports: messages as PST or .msg, SharePoint and OneDrive as native files with a chosen number of versions, Teams optionally as HTML transcripts with a context window; packages expire after 14 days; exports running over 7 days are cancelled. Review set exports must be downloaded within 30 days |
| **Google Vault** | Matters, searches and exports | Holds, saved queries and exports through the Vault API (not retention rules or audit) | Gmail, Groups and Chat as PST or mbox; exports available for 15 days, at most 20 running at once per organization, stopped if unfinished after 24 hours |
| **Notion** | Workspace export | Legal hold exports of held pages | Hold exports as PDF (links valid 30 days) plus CSV metadata |
| **Zoom** | Chat legal hold exports | Archiving to third-party archivers (Regulated Communications & Archiving) | CSV, split into files of at most 1 GB, generated weekly after the hold starts |
| **Relativity** | Not a source; the review platform many exports land in | Publishes the Relativity Short Message Format (RSMF) for chat | An RFC 5322 email wrapping a zip with `rsmf_manifest.json` |

Two observations before the details:

- **Collection is a premium feature everywhere.** Slack's private-channel exports require an application and a paid plan, its Discovery API requires Enterprise; Purview's threading and review sets require E5; Vault is in the higher Workspace editions. Courts have taken notice of what the plan permits (Laub, below).
- **Exports expire fast.** Fourteen days in Purview, 15 in Vault, 30 for Notion's PDFs. Collection is a job whose output the customer must move into its own controlled store immediately, with hashes, or redo.

## The EDRM

The Electronic Discovery Reference Model is the industry's shared vocabulary for the work. Its classic stages run from information governance through identification, preservation, collection, processing, review, analysis, production and presentation. EDRM 2.0, released September 1, 2026, is the first substantive update: it describes the diagram as conceptual rather than linear, anchors the model on the Information Governance Reference Model, groups identification, preservation, collection and processing as "Data Acquisition," treats analysis as continuous across every phase, and adds **Disposition** as a core phase ("A systematic, defensible process to retain, delete, transfer or return data after use").

Mapped onto workplace products:

| Stage | Workplace version | Owner |
| --- | --- | --- |
| **Identification** | Which workspaces, channels, DMs, sites, drives, projects and meeting recordings hold relevant data; which custodians | Customer's legal team, using admin inventory and audit logs |
| **Preservation** | Legal holds, retention suspensions, ephemeral settings suppressed | Customer, in the vendor's hold tooling ([Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold)) |
| **Collection** | Export, Discovery API pull, eDiscovery search export | Customer or its eDiscovery vendor, through the vendor's APIs |
| **Processing** | Turning JSON, PST and native files into reviewable units: threading chat, extracting text, deduplicating, resolving links | Review platform or processing vendor |
| **Review** | Responsiveness, privilege and confidentiality calls | Customer's counsel |
| **Production** | Delivery to the other side in an agreed form | Customer's counsel |
| **Disposition** | Releasing holds, deleting collected copies after the matter | Customer, and every vendor that held a copy |

The vendor's surface is preservation and collection; everything after is in tools the customer chose. The vendor's design job is to make collection complete, provable and in a shape the rest of the chain can process.

## Form, Proportionality and the Chat Cases

Federal Rule 26(b)(1) limits discovery to nonprivileged matter "relevant to any party's claim or defense and proportional to the needs of the case," weighing the importance of the issues, the amount in controversy, the parties' relative access to information and their resources, the importance of the discovery, and whether its burden or expense outweighs its likely benefit. Rule 26(f)(3)(C) requires the parties' discovery plan to address "any issues about disclosure, discovery, or preservation of electronically stored information, including the form or forms in which it should be produced." Rule 34 lets a request specify the form for ESI; if it doesn't, a party "must produce it in a form or forms in which it is ordinarily maintained or in a reasonably usable form or forms," and "need not produce the same electronically stored information in more than one form." The Sedona Principles add that responding parties "are best situated to evaluate the procedures, methodologies, and technologies appropriate for preserving and producing their own electronically stored information" (Principle 6).

Two magistrate judges' rulings in the Central District of California show how this plays out for Slack:

- ***Benebone LLC v. Pet Qwerks, Inc.*** (No. 8:20-cv-00850, February 18, 2021) granted a motion to compel Slack messages. The plaintiff had about 30,000 messages and estimated review at $110,000 to $255,000; a defense vendor estimated $22,000. The court called the vendor figure "on the low side" and the plaintiff's "substantially inflated," and held that "requiring review and production of Slack messages ... is generally comparable to requiring search and production of emails and is not unduly burdensome or disproportional." It noted review could be narrowed "based on the channels or users" and ordered the plaintiff to provide a list of its Slack channels, with title, description, message count and users, before meeting and conferring.
- ***Laub v. Horbaczewski*** (No. CV 17-6210, November 17, 2020) went the other way. In 2018 the court had held that data housed at Slack "was not within the possession, custody, and control" of the defendant under its Slack plan; the plaintiffs subpoenaed Slack, which objected under the Stored Communications Act. In 2020 the court denied a motion to compel private-channel messages: they "may be relevant," but production "would impose an undue burden," and the plaintiffs "merely speculate" that an upgraded plan would give access.

The lesson for a vendor is that the plan is evidence. Whether a customer can export private channels and DMs, and at what cost, decides whether a court treats that data as in the customer's control and what discovery of it is proportionate. A plan matrix that hides DMs from export is a legal fact about every customer on that plan.

## Collecting Chat

### Exports and APIs

There are three ways to get chat out, in rising order of fidelity:

- **Admin exports.** Slack's workspace exports are JSON, include file links rather than files, and on the Free plan link only files from the last 90 days. They are a snapshot of current state: no deleted messages, and edits only as they now read.
- **Compliance APIs.** Slack's Discovery API returns edits and deletions preserved by retention or holds, and is built for eDiscovery and DLP partners rather than ad hoc scripts. Microsoft Graph's Teams export APIs and Purview's searches over the hidden mailbox folders return the compliance copies, including originals of edited messages.
- **eDiscovery suites.** Purview and Vault search across workloads by custodian, date, keyword, sensitivity label and condition, put results on hold, and export them with load files. Purview's search export can organize Teams messages into HTML transcripts with surrounding context (a window of hours either side) so a reviewer sees the conversation, not a pile of fragments.

A collection is defensible when it records what was asked (custodians, containers, dates, queries), what came back (counts, sizes, hashes), from which source and API version, by whom and when. Exports expire in days, so that record and the hashed copy are made at download.

### Threading chat for review: RSMF

Chat needs a container format that keeps conversation structure. Relativity publishes the Relativity Short Message Format: an RFC 5322-compliant file that is "essentially a .zip, which is wrapped in a traditional .eml file." The email-style header must include `X-RSMF-Version` and may include a generator, begin and end dates and an event count; the body carries extracted text for search; the attached zip holds the attachments and `rsmf_manifest.json` at its root. The manifest's root has `version`, `participants`, `conversations` and `events`, and event types include `message`, `disclaimer`, `join` and `leave`. Version 2.0 adds read receipts, message direction, history events and optional fields such as an event collection ID.

The design choices a producer of RSMF (or any review format) has to make:

- **The unit of review.** A channel-day, a thread, or a window around each hit. Too small loses context; too large buries the relevant message in a day of chatter and produces irrelevant, possibly confidential, material. Purview's context window is one answer; a channel-day file is another.
- **Edits and deletions as events,** with the original text and the time of change, so the reviewer sees what was said and what the record now says.
- **Participants as of the message.** Channel membership changes; who could read a message when it was sent matters for knowledge and for privilege.
- **Reactions and read state** where available. Slack's holds don't cover emoji reactions; an export that silently drops them should say so in its manifest.

### Links and modern attachments

Email attachments are copies frozen at send time. A chat message, a Jira comment or a Teams post usually links to a file in Drive, SharePoint, Box or Confluence, and the linked file keeps changing. Slack exports carry only the link. Purview lets the exporter choose how many versions of SharePoint and OneDrive files to include. Courts and parties argue about whether a hyperlinked file is an attachment that must be produced with its message and, if so, which version; I haven't sourced the rulings on that question and leave the case law to the litigators.

The technical answer a vendor can give is to make the link resolvable to a version: record, with each message, the target item and its `item_versions` id at the time the link was shared (or the first time it was rendered), and let collection pull that version alongside the current one. A product that can answer "what did this link point to on March 3" turns a discovery fight into a lookup.

## Privilege and Clawback

Rule 26(b)(5)(A) requires a party withholding information as privileged to "expressly make the claim" and describe what it withholds in a way that, without revealing the privileged content, "will enable other parties to assess the claim": the privilege log. Federal Rule of Evidence 502 limits the damage of mistakes. Under 502(b), an inadvertent disclosure doesn't waive privilege if the holder took reasonable steps to prevent it and promptly took reasonable steps to rectify it. Under 502(d), a federal court "may order that the privilege or protection is not waived by disclosure connected with the litigation pending before the court," which then binds other federal and state proceedings; under 502(e), the parties' own agreement binds only them unless the court incorporates it in an order. Rule 26(f)(3)(D) puts clawback procedures in the discovery plan.

Chat makes privilege review harder than email. Lawyers are members of the same channels as everyone else, legal advice appears as one message in a business thread, and a channel named for a deal may hold both. What a product can do:

- **Mark counsel.** A member attribute for in-house and outside counsel, carried into exports, lets review tools flag every message a lawyer sent or received.
- **Let customers designate privileged containers** (a legal team's channel, a matter workspace) whose exports are tagged, so they are reviewed first and logged consistently.
- **Keep message-level granularity** in exports, so one privileged message can be withheld and logged without withholding a whole day file.

## Who Answers the Subpoena

When a third party wants a customer's data, it should ask the customer. Slack's data request policy says that third parties "should contact the Customer," that the customer controls customer data, and that content requires a warrant or equivalent ([Workplace Chat Inverts the Duties](/books/user-generated-platforms/real-time-chat#workplace-chat-inverts-the-duties)). *Laub* shows the civil version: subpoenaed directly, Slack objected under the Stored Communications Act, which bars providers from disclosing content to private civil litigants ([The US Framework](/books/user-generated-platforms/law-enforcement-requests#the-us-framework)). Government demands under warrant are the law enforcement chapters' subject ([Customers Who Are Companies](/books/hosting-and-cloud/law-enforcement-at-providers#customers-who-are-companies)).

The product consequence: the customer must be able to do everything a requester could ask the vendor to do (search, preserve, export every data type), or the vendor ends up pressed to do it on the customer's behalf. Gaps in self-service collection become vendor support tickets with legal deadlines.

## Cross-Border Discovery

US discovery reaches documents a party controls wherever they are stored; European law restricts sending personal data out of the EU for that purpose. The pieces:

- **GDPR Article 48.** A third-country court judgment or authority decision requiring transfer may only be recognized or enforced if based on an international agreement such as a mutual legal assistance treaty. The European Data Protection Board's Guidelines 2/2018 say such decisions "are not in themselves legitimate grounds for data transfers," and that where an agreement exists, companies "should generally refuse direct requests and refer the requesting third country authority" to it.
- **GDPR Article 49(1)(e).** The derogation for transfers "necessary for the establishment, exercise or defence of legal claims." The EDPB says "formal pre-trial discovery procedures in civil litigation may fall under this derogation," but not on "the mere possibility" of future proceedings; it requires "a close link" to a specific procedure, a necessity test, data minimization (not "all possibly relevant personal data"), and occasional transfers.
- **The Hague Evidence Convention** (March 18, 1970). Article 23 lets a state declare that it won't execute letters of request "for the purpose of obtaining pre-trial discovery of documents as known in Common Law countries."
- ***Société Nationale Industrielle Aérospatiale v. U.S. District Court*** (482 U.S. 522, June 15, 1987). The Supreme Court held the Convention's procedures optional, rejected a rule requiring them first, called for case-by-case comity analysis, and held that blocking statutes "do not deprive an American court of the power to order a party subject to its jurisdiction to produce evidence even though the act of production may violate that statute."
- **France's blocking statute** (Law No. 68-678 of July 26, 1968, article 1 bis) prohibits requesting, seeking or communicating economic, commercial, industrial, financial or technical documents or information toward evidence for foreign judicial or administrative proceedings, subject to treaties; article 3 sets penalties of six months' imprisonment and an €18,000 fine.

The data protection basics are the playbook's [International Transfers](/docs/compliance/gdpr#international-transfers); where data sits and why is Data Residency & Sovereignty in the Tenancy and Identity part. For the product, cross-border discovery means three capabilities: collect in place (search and review inside the data's region before anything leaves), minimize at collection (custodian, date and query filters applied before export, with pseudonymization of non-custodians where the review allows), and record each export's destination and legal basis on the export record, because the customer's DPO will ask.

## Investigations Inside the Company

Not every collection is for litigation. HR investigations, insider-risk cases and regulatory inquiries use the same tools on a smaller scale, and Purview's Insider Risk Management can escalate a case into eDiscovery (Premium) to "preserve, collect, review, analyze, and export." Two rules differ from litigation. The population is employees who haven't been sued, so access to the case should be narrow and logged ([Audit Logs](/books/workplace-and-collaboration/audit-logs)); and works councils and employee-privacy law may limit what an employer may search and when (Employee Monitoring & Privacy, later in this part).

## How to Build It

[Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold#how-to-build-it) gave the core model's `legal_holds` an `ediscovery_case_id`; this chapter makes it a foreign key. This chapter adds cases, searches, exports and the link-version record that makes modern attachments resolvable:

```sql
CREATE TABLE ediscovery_cases (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  name            TEXT NOT NULL,
  matter_ref      TEXT,                     -- the customer's matter number
  kind            TEXT NOT NULL CHECK (kind IN ('litigation', 'regulatory', 'internal', 'dsar')),
  status          TEXT NOT NULL CHECK (status IN ('open', 'closed')),
  created_by      UUID NOT NULL REFERENCES members (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at       TIMESTAMPTZ
);

CREATE TABLE ediscovery_case_members (      -- who may see this case; nobody else can
  case_id    UUID NOT NULL REFERENCES ediscovery_cases (id),
  member_id  UUID NOT NULL REFERENCES members (id),
  role       TEXT NOT NULL CHECK (role IN ('manager', 'reviewer', 'viewer')),
  PRIMARY KEY (case_id, member_id)
);

ALTER TABLE legal_holds
  ADD CONSTRAINT legal_holds_case_fk FOREIGN KEY (ediscovery_case_id) REFERENCES ediscovery_cases (id);

CREATE TABLE ediscovery_searches (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id         UUID NOT NULL REFERENCES ediscovery_cases (id),
  custodians      UUID[] NOT NULL DEFAULT '{}',          -- members
  container_ids   UUID[] NOT NULL DEFAULT '{}',
  item_kinds      TEXT[] NOT NULL,                       -- 'message', 'file', 'page', 'work_item', 'recording'
  date_range      TSTZRANGE,
  query           JSONB,                                 -- keywords, labels, conditions
  include_versions TEXT NOT NULL DEFAULT 'at_time' CHECK (include_versions IN ('current', 'at_time', 'all')),
  run_at          TIMESTAMPTZ,
  hit_count       BIGINT,
  hit_bytes       BIGINT,
  index_version   TEXT                                   -- which search index answered
);

CREATE TABLE ediscovery_exports (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  search_id       UUID NOT NULL REFERENCES ediscovery_searches (id),
  format          TEXT NOT NULL CHECK (format IN ('json', 'rsmf', 'pst', 'mbox', 'native', 'html_transcript', 'pdf')),
  unit            TEXT NOT NULL CHECK (unit IN ('message', 'thread', 'channel_day', 'context_window')),
  context_window  INTERVAL,                              -- for 'context_window'
  region          TEXT NOT NULL,                         -- where the package was built and stored
  destination     TEXT,                                  -- customer-declared recipient or system
  legal_basis     TEXT,                                  -- e.g. 'gdpr_49_1_e' for EU data
  status          TEXT NOT NULL CHECK (status IN ('queued', 'running', 'ready', 'expired', 'failed', 'cancelled')),
  item_count      BIGINT,
  manifest_sha256 BYTEA,                                 -- hash of the manifest listing every item hash
  expires_at      TIMESTAMPTZ,
  requested_by    UUID NOT NULL REFERENCES members (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ediscovery_export_items (
  export_id       UUID NOT NULL REFERENCES ediscovery_exports (id),
  item_id         UUID NOT NULL REFERENCES items (id),
  item_version_id UUID NOT NULL REFERENCES item_versions (id),
  sha256          BYTEA NOT NULL,
  privileged_hint BOOLEAN NOT NULL DEFAULT FALSE,        -- counsel participant or privileged container
  PRIMARY KEY (export_id, item_id, item_version_id)
);

CREATE TABLE item_link_versions (           -- what a link in one item pointed to, when shared
  source_item_id    UUID NOT NULL REFERENCES items (id),
  target_item_id    UUID NOT NULL REFERENCES items (id),
  target_version_id UUID NOT NULL REFERENCES item_versions (id),
  captured_at       TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (source_item_id, target_item_id)
);

ALTER TABLE members ADD COLUMN is_counsel BOOLEAN NOT NULL DEFAULT FALSE;
```

Notes on the sketch:

- **Searches run against the compliance store,** not the app's view: deleted and edited originals preserved under [Retention & Legal Hold](/books/workplace-and-collaboration/retention-and-legal-hold) are included, with their reason codes, and the `index_version` is recorded so a re-run can be explained if counts differ.
- **The search is permission-free; the case is not.** A case search ignores channel membership (it must find everything a custodian sent), so access to the case itself is the control: only `ediscovery_case_members` see results, and every search and export is an audit event.
- **`at_time` versions by default.** For each hit that links to another item, `item_link_versions` adds the linked version as it was when shared; `all` adds the full history; `current` reproduces today's state. Capture happens at share time, cheaply, because reconstructing it later means walking version history for every link.
- **Exports are content-addressed.** Each item is hashed, the manifest lists every hash, and the manifest's own hash is stored, so the customer and the other side can verify the production years later. Packages expire (Purview, Vault and Notion all do this); the record doesn't.
- **Region and legal basis live on the export.** A package for EU data is built in the region, and the customer declares destination and basis before download; the vendor doesn't judge the basis, it records it.
- **Formats are pluggable writers** over one internal conversation model (participants, events, edits, attachments, link versions), so RSMF, HTML transcripts and JSON stay consistent.

## Auditing

- **Every case action:** case creation, membership, searches (with the full query), holds created from the case, exports requested and downloaded, as audit events visible to the organization's audit readers and to nobody outside the case's members.
- **Export integrity:** manifest hashes kept for the life of the organization and verifiable on request.
- **Completeness reconciliation:** for each export, counts by custodian, container and item kind, compared with the search's hit counts; a gap is investigated before the production goes out.
- **Coverage disclosures:** every export manifest lists what the source can't provide (reactions not held, external organization's side of shared channels, encrypted content searchable only by metadata), so counsel can disclose limits instead of discovering them in a deposition.
- **Disposition:** when a case closes, holds released through the two-person flow, and collected copies inside the product deleted on a recorded run.

## What This Means for the System You Build

- **Make every data type exportable by the customer,** including private channels, DMs, edits and deletions, on the plans whose customers face litigation; the export matrix is a legal fact.
- **Export conversations, not fragments:** threads or context windows with participants as of the message, edits as events, and a manifest of what's missing.
- **Record link targets at share time** so a production can include the version a message pointed to.
- **Hash every exported item and the manifest,** and keep the record after the package expires.
- **Restrict cases to named members,** log every search and download, and keep internal investigations narrower than litigation.
- **Collect in region and record destination and legal basis** for cross-border exports.
- **Send third-party requests back to the customer,** and make self-service collection complete enough that they never need the vendor.

## References

**Vendor documentation**

- [Slack: Export your workspace data](https://slack.com/help/articles/201658943), export types by plan, applications for private channels and DMs, scheduled exports, JSON and TXT formats and file links
- [Slack: Discovery API](https://slack.com/help/articles/360002079527), Enterprise availability, who enables it, eDiscovery and DLP partners, data returned including preserved edits and deletions
- [Slack: Create and manage legal holds](https://slack.com/help/articles/4401830811795-Create-and-manage-legal-holds), held data exported as JSON or through the Discovery API, and exclusions such as emoji reactions
- [Microsoft Learn: Microsoft Purview eDiscovery](https://learn.microsoft.com/en-us/purview/ediscovery), the retirement of classic eDiscovery experiences on August 31, 2025
- [Microsoft Learn: Learn about eDiscovery](https://learn.microsoft.com/en-us/purview/edisc), unified cases, content search as a system case and Premium features including review sets and Teams threading
- [Microsoft Learn: Export search results](https://learn.microsoft.com/en-us/purview/edisc-search-export), PST and .msg, native files and versions, Teams HTML transcripts, 14-day expiry, 7-day cancellation
- [Microsoft Learn: Export documents from a review set](https://learn.microsoft.com/en-us/purview/edisc-review-set-export), export options and the 30-day download window
- [Microsoft Learn: Learn about retention for Teams](https://learn.microsoft.com/en-us/purview/retention-policies-teams), hidden mailbox folders searchable by eDiscovery
- [Microsoft Learn: Learn about Insider Risk Management](https://learn.microsoft.com/en-us/purview/insider-risk-management), escalation of cases to eDiscovery (Premium)
- [Microsoft Learn: Learn about sensitivity labels](https://learn.microsoft.com/en-us/purview/sensitivity-labels), sensitivity labels as eDiscovery search conditions
- [Google Vault Help: Export data from Vault](https://knowledge.workspace.google.com/vault/exports/export-data-from-vault), PST or mbox for Gmail, Groups and Chat, 15-day availability, 20 simultaneous exports and the 24-hour stop
- [Notion Help Center: Legal holds](https://www.notion.com/help/legal-holds), hold export as PDF and CSV and the 30-day link validity
- [Zoom Support: Chat legal hold (KB0057908)](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057908), CSV exports, 1 GB files and weekly generation
- [Relativity: Relativity Short Message Format](https://help.relativity.com/RelativityOne/Content/System_Guides/Relativity_Short_Message_Format/Relativity_Short_Message_Format.htm), the EML and zip structure, headers, manifest fields, event types and version 2.0 additions

**Standards and frameworks**

- [EDRM: The EDRM Model](https://edrm.net/resources/frameworks-and-standards/edrm-model/), the stages, EDRM 2.0's September 1, 2026 release, Data Acquisition, continuous analysis and Disposition
- [The Sedona Conference: The Sedona Principles, Third Edition](https://thesedonaconference.org/publication/The_Sedona_Principles), the publication
- [The Sedona Conference: The Sedona Principles, Third Edition, principles](https://www.thesedonaconference.org/file-download/download/public/5140), Principles 6 and 12 on the responding party's methods and form of production

**Law and courts**

- [Fed. R. Civ. P. 26 (LII)](https://www.law.cornell.edu/rules/frcp/rule_26), proportionality in 26(b)(1), the privilege log in 26(b)(5)(A) and the discovery plan in 26(f)(3)
- [Fed. R. Civ. P. 34 (LII)](https://www.law.cornell.edu/rules/frcp/rule_34), the form of producing electronically stored information
- [Fed. R. Evid. 502 (LII)](https://www.law.cornell.edu/rules/fre/rule_502), inadvertent disclosure, court orders and party agreements
- [Benebone LLC v. Pet Qwerks, Inc., No. 8:20-cv-00850, Dkt. 127 (C.D. Cal. Feb. 18, 2021)](https://www.ediscoverylaw.com/wp-content/uploads/2022/06/Benebone-LLC-v.-Pet-Qwerks-Inc.-202102-Case-Opinion.pdf), Slack production compared with email, cost estimates and the channel list order
- [Laub v. Horbaczewski, No. CV 17-6210, Dkt. 538 (C.D. Cal. Nov. 17, 2020)](https://www.ediscoverylaw.com/wp-content/uploads/2022/08/Laub-v.-Horbaczewski-202011-Case-Opinion.pdf), control under a Slack plan, the Stored Communications Act objection and denial on proportionality
- [Société Nationale Industrielle Aérospatiale v. U.S. District Court, 482 U.S. 522 (1987) (LII)](https://www.law.cornell.edu/supremecourt/text/482/522), the Hague Convention as optional, comity analysis and blocking statutes
- [HCCH: Convention of 18 March 1970 on the Taking of Evidence Abroad](https://www.hcch.net/en/instruments/conventions/full-text/?cid=82), Article 23 on pre-trial discovery of documents
- [EDPB: Guidelines 2/2018 on derogations of Article 49](https://www.edpb.europa.eu/system/files/documents/files/file1/edpb_guidelines_2_2018_derogations_en.pdf), Article 48, the legal claims derogation, pre-trial discovery, close link, necessity and minimization
- [GDPR Article 48 (gdpr-info.eu)](https://gdpr-info.eu/art-48-gdpr/), the text on transfers not authorized by Union law (secondary copy)
- [Légifrance: Loi n° 68-678 du 26 juillet 1968](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000501326), the French blocking statute's article 1 bis and penalties
