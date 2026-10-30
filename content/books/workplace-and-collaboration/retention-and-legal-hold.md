+++
title = "Retention & Legal Hold"
description = "Retention policies in Slack, Purview, Vault, Box and Notion, how holds override deletion, FRCP 37(e), and the Google Chat and Signal spoliation cases."
category = "Workplace & Collaboration Industry"
order = 2047
part = "Security and Compliance"
tags = ["workplace", "retention", "legal-hold", "ediscovery", "spoliation", "compliance"]
+++

A retention policy is a rule the customer sets for how long content is kept and what happens when the time is up: keep it, delete it, or keep it and then delete it. A legal hold is the opposite instruction, scoped to people or places: whatever the retention policy says, don't let this content be destroyed until the hold is released. Every workplace product that stores messages, files, pages or recordings eventually has to offer both, because its customers are subject to litigation, regulators and their own records schedules, and because courts sanction companies whose chat tools deleted evidence on a timer.

The duties are inverted from a consumer platform. The vendor doesn't decide how long a customer's Slack messages or Teams chats live; the customer's admin does, within the plan's options, and the vendor's job is to execute that choice exactly: delete when told, preserve when told, and make the two never conflict silently. What makes it hard:

- **Precedence.** Several policies, labels and holds can cover the same item; each vendor publishes its rules for which wins, and they differ.
- **Deletion is a pipeline, not a statement.** A policy that says "delete after one day" can take Microsoft 16 days to finish; the app's view of a message is not its compliance state.
- **Users can delete and edit.** A hold that preserves the current message but not the version before an edit, or the message a user deleted, preserves the wrong thing.
- **Ephemeral modes.** Chat history off, disappearing messages, encrypted chat: features users like and courts have punished companies for leaving on under a hold.

The generic machinery (soft and hard delete, windows, schedules, erasure) is the playbook's [Data Retention](/docs/architecture/data-retention). This chapter is what retention and hold mean in collaboration products and in US litigation. Getting the preserved content out (collection, review, export) is [eDiscovery & Export](/books/workplace-and-collaboration/ediscovery-and-export); broker-dealer and other regulated recordkeeping is [Regulated Communications & Archiving](/books/workplace-and-collaboration/regulated-communications#the-us-recordkeeping-rules), later in this part. This isn't legal advice.

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Vendor | Retention | Legal hold | Notable rules |
| --- | --- | --- | --- |
| **Slack** | Workspace Owners set message and file retention; Org Owners set org-wide policy through Support; paid plans keep data "for the lifetime of your workspace" by default; the Free plan offers keep one year without tracking edits or deletions, or delete after 90 days | Enterprise only, by members with the Legal Holds Admin role; up to 1,000 custodians per hold, unlimited holds | Deletion runs once a day and "is permanent"; owners may let members set retention for private channels and DMs; holds preserve "regardless of" retention, through edits and deletions; Slack Connect conversations, emoji reactions and snippet history aren't held; a deleted channel in a hold isn't saved |
| **Microsoft Purview** | Retention policies by location (Exchange, SharePoint, OneDrive, Teams chats, channel messages, call logs, Viva Engage, Copilot interactions and others) and retention labels on items | eDiscovery holds, Litigation Hold and delay holds on mailboxes and sites | Four published principles of precedence; Teams copies live in hidden mailbox folders and a `SubstrateHolds` folder; Preservation Lock makes a policy impossible to disable or weaken, even by global admins |
| **Google Vault** | One default rule per service plus custom rules; custom rules win even when shorter | Holds on accounts, groups or organizational units, per service | Holds override retention; Chat holds cover only messages sent with history on; shared drives are held through members; about 30 days of purge after expiry |
| **Atlassian Cloud** | No native retention rules in Confluence Cloud (Data Center has them for page history, attachment versions and trash) | No native legal hold found in Atlassian's cloud documentation <!-- source-gap: atlassian-cloud-legal-hold | status | Atlassian Cloud has no native legal hold for Jira or Confluence | closes with: an Atlassian page stating legal hold availability or its absence | checked: 2026-10-29 --> | Customers rely on Marketplace apps or exports; a page version deleted is gone |
| **Zoom** | Cloud storage retention set by the account's owner or admins | Chat legal hold on paid accounts, up to 20 custodians | Requires cloud storage retention of at least 7 days and Advanced Chat Encryption disabled; held data exports in files of at most 1 GB, generated weekly after the hold starts |
| **Box** | Retention policies under Box Governance (included in Enterprise Plus and Enterprise Advanced, an add-on otherwise); modifiable or non-modifiable for SEC Rule 17a-4 | Ownership, Interaction (reaching back up to seven years) and legacy Access holds, plus folder holds | Multiple policies: the one with the latest end date wins; a hold blocks a policy's deletion until lifted |
| **Notion** | Enterprise owners set trash and retention periods, each 30 days by default, from one day to 10 years | Enterprise owners create holds over pages a user created, edited or viewed | Holds reach back only to the Enterprise upgrade or May 2022, because they rely on the audit log; releasing a hold re-enables retention |

Read across the table and three facts stand out:

- **Every vendor agrees a hold beats a deletion.** Slack, Microsoft, Google, Box and Notion all document it. The disagreements are about which retention rule wins among several, and about what a hold covers.
- **Coverage gaps are listed, not hidden.** Slack excludes Slack Connect and reactions from holds; Microsoft doesn't retain code snippets, voice memos from mobile, thumbnails or reactions under Teams policies; Google holds Chat only with history on; Zoom requires its advanced chat encryption off. A customer's records schedule has to be written against those lists.
- **The tier decides whether the duty can be met in the product.** Slack's holds are Enterprise-only; Box's are part of Governance; Notion's are Enterprise. A customer on a lower plan with a preservation duty has to export and preserve outside the product.

## Which Rule Wins

Microsoft publishes the clearest statement of precedence, its four principles of retention: retention wins over deletion; the longest retention period wins; explicit inclusion wins over implicit for deletions; the shortest deletion period wins. Google Vault's rules differ in one important way: a custom rule always takes precedence over the service's default rule, "even if the default expires later," and among several custom rules data is kept under the one with the latest expiration. Box applies the latest end date among its policies, and ranks a legal hold above all of them.

The consequences for a customer configuring them:

- **A short custom rule in Vault can delete what the default would have kept.** In Purview, a longer retention policy elsewhere would keep the item regardless. The same intent produces different results in the two suites.
- **A hold is not a retention policy.** In every product it suspends deletion without changing the policy; when the hold is released, deletion resumes on the policy's schedule, immediately in Vault's words ("the data immediately becomes subject to any applicable retention rules").
- **Labels move with items; policies attach to locations.** Purview retention labels travel with a document and can be applied automatically; policies apply to a whole location. A label on a Teams message isn't possible (labels don't work for Teams, Viva Engage, Skype or public folders), so chat retention is policy-only.

My rule for a builder: there is one precedence function, written once, shared by the deletion job, the hold UI and the export, and its output for any item ("kept until X because of Y") is visible to the admin. Two code paths that each compute "is this deletable" will disagree.

## Deletion Is a Pipeline

Microsoft's Teams documentation is unusually candid about time. A retention policy takes up to seven days to apply. A timer job evaluates the [hidden mailbox folders](/books/workplace-and-collaboration/chat-architecture#teams-a-chat-service-and-a-record-in-every-mailbox) where Teams messages are copied for compliance, typically every one to seven days; an expired message moves to `SubstrateHolds`, stays there at least one day, and is permanently deleted the next time the job runs. A message a user deletes disappears from the app but doesn't reach `SubstrateHolds` for 21 days. Microsoft's own example: a delete-only policy of one day "could take 16 days before the message is permanently deleted." And: "Messages visible in the Teams app are not an accurate reflection of whether they're retained or permanently deleted for compliance requirements."

The other vendors have their own clocks: Slack deletes once a day; Google keeps Gmail messages searchable by Vault admins for about 30 days after coverage expires, may take up to 15 days to remove Drive items, and begins purging Chat messages on day 30; Notion holds deleted pages for its retention period before permanent deletion.

What a builder takes from this:

- **Separate the user's view from the compliance store.** Teams removes a message from the app while a copy waits in a hidden folder; that separation is what lets a hold work without users noticing. A product with one copy of each message can't both honor a user's delete and preserve under a hold.
- **Publish the timeline.** Customers write records schedules and answer regulators; "deleted within 16 days of expiry" is a commitment they can use, "deleted" isn't.
- **Backups are part of deletion.** A deleted message still sitting in last month's backup is not deleted for an erasure request and is still evidence for a hold ([Backups](/docs/architecture/data-retention#backups); the vendor's restore tools are in [Backups, Restores and Shared Responsibility](/books/workplace-and-collaboration/reliability-and-outages#backups-restores-and-shared-responsibility)).

## Edits and Deletions

Chat and documents change after they're written, and the original is often the evidence. The vendors preserve history in three ways:

- **A retention setting that tracks edits.** Slack's paid plans offer a never-delete setting in two variants: one in which "Slack will keep all messages and track message edits and deletions," and one that doesn't save edits; the Free plan's one-year option explicitly doesn't track them. The choice is the customer's, and the second option is a quiet loss of evidence.
- **Copy-on-edit into the compliance store.** Under a Teams retention policy, an edited message's original is copied to `SubstrateHolds` and a deleted one moved there, so eDiscovery finds both.
- **Holds that freeze history.** Slack's holds preserve messages and files even if members edit or delete them; the Discovery API returns "content that has been edited and deleted (if preserved by retention policies or legal holds)."

In the [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model), every edit is an `item_versions` row and every user delete is a state change on `items`, never a physical delete while any retention or hold covers the item.

## Legal Hold Mechanics

### When the duty starts

The duty to preserve is a common-law duty that federal Rule 37(e) builds on rather than creates ("it does not attempt to create a new duty to preserve," says the 2015 Committee Note). Its classic statement is Judge Scheindlin's in *Zubulake v. UBS Warburg* (Zubulake IV, 220 F.R.D. 212, S.D.N.Y. October 22, 2003): "Once a party reasonably anticipates litigation, it must suspend its routine document retention/destruction policy and put in place a 'litigation hold' to ensure the preservation of relevant documents." The duty extends to "the 'key players' in the case," not to every employee and every backup tape; the court called a rule requiring a company to keep every shred of paper and every email one that "would cripple large corporations." In that case the duty attached in April 2001, months before the plaintiff's EEOC charge, because that was when the relevant people anticipated litigation. A follow-on opinion (Zubulake V, 2004) is widely cited for counsel's continuing duties, including that "The litigation hold should be periodically re-issued" and that counsel must monitor compliance; I could read it only through a secondary summary <!-- source-gap: zubulake-v | secondary | Zubulake V (229 F.R.D. 422, 2004) holdings on re-issuing holds and monitoring compliance | closes with: the opinion text from a court or law-school copy | checked: 2026-10-29 -->.

For software this means a hold usually starts before any lawsuit exists, its scope is a list of people (custodians), and it has to be re-sent and checked, not set and forgotten.

### Scope: custodians, containers and queries

Vendors scope holds in three ways, often combined:

- **By custodian:** everything a person owns, sent, received, created, edited or viewed. Slack holds a custodian's conversations (all, or only their DMs) with an optional date range; Box's Ownership hold covers what a custodian owns and its Interaction hold what they touched, up to seven years back; Notion holds pages a user created, edited or viewed, choosing which; Vault holds accounts, groups or organizational units.
- **By container:** a channel, site, shared drive or folder regardless of who wrote in it. Box offers folder holds; Purview holds sites and group mailboxes; Vault can't hold shared drives directly and reaches them through held members with shared drives included.
- **By query:** content matching terms or dates, as in Purview eDiscovery holds built from searches.

Custodian scope is the default because the law's unit is the key player, but chat breaks it: a channel where twenty custodians and two hundred non-custodians talk is preserved only in the custodians' messages unless the channel itself is held. My default is to hold the custodians and the shared containers they worked in, because the other side of a conversation is usually the part that matters.

Some scope is fixed at creation. Slack doesn't allow a hold's date range or conversation scope to be edited afterward (custodians, name and description can change), so widening a hold means creating another.

### Notices, reminders and release

A hold in the product is half of a legal hold; the other half is telling custodians. The notice explains what to keep and that their normal deletion settings no longer protect them, and the custodian acknowledges it. Zubulake IV's court and Google's own hold practice (reminders about every six months, per the Google Play findings below) show reminders are expected. Purview's eDiscovery (Premium) includes a legal hold notification workflow; Box doesn't badge held files for end users, so the notice is the only way custodians learn they are on hold.

Release is the dangerous moment: Notion re-enables retention for the released pages and Vault applies retention immediately, so content that was safe a minute ago can be deleted by the next disposition run. A release needs a second approver and a check that no other hold or matter covers the same people.

### Preservation Lock

Some customers need a policy that even they can't undo. Microsoft's Preservation Lock, set only through PowerShell (`-RestrictiveRetention $true`), means that after locking nobody, global admins included, can disable the policy or make it less restrictive; adaptive scopes don't support it. Box's non-modifiable retention policies, designed for SEC Rule 17a-4, can't be shortened and retained content can't be removed. These exist for regulated recordkeeping ([Regulated Communications & Archiving](/books/workplace-and-collaboration/regulated-communications), later in this part); for litigation holds the ordinary, releasable hold is the right tool.

## Rule 37(e) and Spoliation

Rule 37(e) of the Federal Rules of Civil Procedure, rewritten in 2015, governs lost electronically stored information in federal court. If ESI "that should have been preserved in the anticipation or conduct of litigation is lost because a party failed to take reasonable steps to preserve it, and it cannot be restored or replaced through additional discovery," the court:

- **(e)(1)** on finding prejudice to another party, "may order measures no greater than necessary to cure the prejudice"; or
- **(e)(2)** "only upon finding that the party acted with the intent to deprive another party of the information's use in the litigation," may presume the information was unfavorable, instruct the jury that it "may or must presume" so, or dismiss the action or enter a default judgment.

The 2015 Committee Note matters to anyone designing preservation tools. "Reasonable steps" suffice; the rule "does not call for perfection." Proportionality is a factor, and "A party may act reasonably by choosing a less costly form of information preservation." Courts should be "sensitive to the party's sophistication with regard to litigation," and events outside a party's control count: "a 'cloud' service may fail." The note rejects cases that allowed adverse-inference instructions on negligence or gross negligence, and the rule "forecloses reliance on inherent authority or state law" for those measures. The Sedona Conference's Principle 5 says the same in practitioner terms: preservation requires "reasonable and good faith efforts," and "it is unreasonable to expect parties to take every conceivable step or disproportionate steps."

The design reading: the rule rewards a system that makes preservation the default once a hold exists, and punishes a system that leaves it to individuals. A large company is sophisticated by definition; what is reasonable for it includes using the hold features its own tools offer.

## The Ephemeral Messaging Cases

### Google Chat in the Google Play litigation

In *In re Google Play Store Antitrust Litigation* (No. 21-md-02981-JD, N.D. Cal.), Judge James Donato's findings of fact and conclusions of law on chat preservation (March 28, 2023) are the leading opinion on a workplace chat default. The court found:

- History was off by default for all Chats among Google employees except threaded rooms; one-on-one history-off chats were kept 24 hours, after which they were "deleted forever and cannot be recovered." History-on one-on-one chats were kept 30 days; history-on group chats and threaded rooms 18 months.
- Google issued its hold in September 2020 with reminders about every six months; about 360 people were on hold, about 40 of them custodians.
- "Google has the technical ability to set Chat history to 'on' as the default for all employees who are subject to a legal hold, but it chooses not to." Instead it told hold recipients not to use Chat for hold topics and to turn history on if a conversation strayed into one, and "did nothing in the way of auditing or monitoring Chat preservation."
- By contrast, "When a litigation hold is in place, Google automatically preserves all emails from relevant custodians without requiring any individual action." For Chat it "gave each employee carte blanche," which the court called a "don't ask, don't tell" policy.

The court concluded Google did not take reasonable steps, the chats could not be restored or replaced, and Google "intended to subvert the discovery process," satisfying Rule 37(e)(2). It had already declined terminating sanctions; it deferred the non-monetary remedy to the end of fact discovery and ordered Google to pay the plaintiffs' fees and costs of the motion. At the Epic Games trial the final jury instructions (December 6, 2023) included Instruction No. 13, "Permissive Inference": "You have seen evidence that Google Chat communications were deleted with the intent to prevent their use in litigation. You may infer that the deleted Chat messages contained evidence that would have been unfavorable to Google in this case."

### The same practice in the search case

In *United States v. Google* (No. 20-cv-3010, D.D.C.), Judge Amit Mehta's memorandum opinion of August 5, 2024 declined Rule 37(e) sanctions because an adverse inference would not change findings already in Google's favor, while describing Google's "long-time practice (since 2008) of deleting chat messages among Google employees after 24 hours," which continued after the hold until the plaintiffs moved for sanctions in February 2023, when Google changed its policy "to automatically save all chats of employees under a legal hold." The court's warning is the sentence to remember: "Any company that puts the onus on its employees to identify and preserve relevant evidence does so at its own peril. Google avoided sanctions in this case. It may not be so lucky in the next one."

### Signal at Amazon

In *FTC v. Amazon.com* (No. 2:23-cv-01495-JHC, W.D. Wash.), the FTC's April 25, 2024 motion to compel spoliation-related documents alleged that senior Amazon executives used Signal with disappearing messages manually enabled from April 2019 to at least May 2022; that the FTC's preservation letter was dated June 17, 2019 and Amazon's first hold notices July 2, 2019, but its founder received none until April 13, 2020; that Amazon issued secure-messaging guidance in October 2020 and a Legal Hold FAQ with Signal guidance in August 2021; that executives were told on March 2, 2022 to move to Wickr, which "allows Amazon to save messages centrally for individuals on legal hold"; and that Amazon did not instruct employees to preserve Signal messages "until over fifteen months" after it knew of the investigation. These are allegations. An April 29, 2026 order granted in part and denied in part the plaintiffs' sanctions-related motions; I could confirm only its disposition, not what it held about Signal <!-- source-gap: ftc-amazon-signal-ruling | secondary | the April 29, 2026 order's ruling on Signal spoliation in FTC v. Amazon (W.D. Wash. 2:23-cv-01495) | closes with: the order text from the court docket | checked: 2026-10-29 -->. The FTC's June 30, 2026 litigation status report lists trial for March 29, 2027.

### What prosecutors ask

The Justice Department's Criminal Division asks the same question of corporate compliance programs. Its Evaluation of Corporate Compliance Programs (updated September 2024) tells prosecutors to consider "policies and procedures governing the use of personal devices, communications platforms, and messaging applications, including ephemeral messaging applications," which should ensure that business communications "are accessible and amenable to preservation by the company." Among its questions: "What preservation or deletion settings are available to each employee under each communication channel, and what do the company's policies require with respect to each?" and how bring-your-own-device policies govern preservation of corporate data on personal devices, "including data contained within messaging platforms."

### The design lesson

Every one of these cases turns on a setting the employee controlled and the employer could have overridden. For a vendor, that defines the feature:

- **A hold overrides user-controlled ephemerality automatically.** History off, disappearing timers, member-set retention on DMs, [auto-delete on recordings](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes#expiry-retention-and-holds): for a custodian on hold, each is suppressed by the system, not by a notice asking the custodian to behave. Google's own email holds worked that way; its chat holds didn't.
- **Encryption modes that defeat holds must say so.** Zoom's chat legal hold requires Advanced Chat Encryption disabled; Google Vault can retain and export client-side encrypted files but can't search their content ([Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys)). The admin console should show, per custodian, which of their channels a hold can't reach.
- **The product reports preservation status.** "Custodian X: 14 channels held, 2 DMs with history off suppressed, 1 Slack Connect channel not covered" is what lets counsel call the steps reasonable.
- **Approved channels are part of the hold.** The Amazon allegations are about an app outside the company's systems; a workplace vendor can't fix that, but its customers' policies (and the DOJ's questions) push them toward tools with holds, which is a reason those features sell.

## Retention Against Privacy Law

Retention has a second master. GDPR's storage limitation pushes toward deleting personal data once its purpose is served, and employees, customers and guests in a workspace can ask for erasure. A hold and a retention requirement are reasons to keep data despite such a request, but they have to be specific (a matter, a regulation) and recorded, and the data must be deleted when they end ([Erasure Requests](/docs/architecture/data-retention#erasure-requests), [Data Subject Rights](/docs/compliance/gdpr#data-subject-rights)). In the customer-controlled model the employer is the controller and decides; the vendor executes and records which rule kept which item. Cross-border holds and the transfer of held data to US litigation are [Cross-Border Discovery](/books/workplace-and-collaboration/ediscovery-and-export#cross-border-discovery).

## How to Build It

The [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) owns `retention_policies`, `legal_holds` and `hold_custodians`. This chapter gives them their shape, adds container and query scopes, a compliance store for preserved versions, custodian notices and a record of every deletion run. The columns below are the full definitions: where one restates a core sketch column, this definition replaces it; `retention_policy_targets` replaces the sketch's `scope_type`/`scope_id`, and `hold_containers` takes the container custodians, so `hold_custodians` holds members only:

```sql
ALTER TABLE retention_policies
  ADD COLUMN organization_id  UUID NOT NULL REFERENCES organizations (id),
  ADD COLUMN workspace_id     UUID REFERENCES workspaces (id),    -- NULL: org-wide
  ADD COLUMN name             TEXT NOT NULL,
  ADD COLUMN item_kinds       TEXT[] NOT NULL,                     -- 'message', 'file', 'page', 'recording'
  ADD COLUMN container_kinds  TEXT[],                              -- 'channel', 'dm', 'space'; NULL: all
  ADD COLUMN scope            TEXT NOT NULL CHECK (scope IN ('all', 'include', 'exclude', 'adaptive')),
  ADD COLUMN scope_query      JSONB,                               -- adaptive: evaluated daily
  ADD COLUMN action           TEXT NOT NULL CHECK (action IN ('retain', 'delete', 'retain_then_delete')),
  ADD COLUMN duration         INTERVAL,                            -- NULL: forever
  ADD COLUMN measured_from    TEXT NOT NULL CHECK (measured_from IN ('created', 'modified', 'labeled')),
  ADD COLUMN track_edits      BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN member_override  BOOLEAN NOT NULL DEFAULT FALSE,      -- may members set shorter on DMs
  ADD COLUMN locked_at        TIMESTAMPTZ,                         -- preservation lock: no disable, no shortening
  ADD COLUMN priority         SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN status           TEXT NOT NULL CHECK (status IN ('draft', 'applying', 'active', 'disabled')),
  ADD COLUMN created_by       UUID NOT NULL REFERENCES members (id);

CREATE TABLE retention_policy_targets (      -- explicit includes and excludes
  policy_id     UUID NOT NULL REFERENCES retention_policies (id),
  target_type   TEXT NOT NULL CHECK (target_type IN ('workspace', 'container', 'member', 'group')),
  target_id     UUID NOT NULL,
  mode          TEXT NOT NULL CHECK (mode IN ('include', 'exclude')),
  PRIMARY KEY (policy_id, target_type, target_id)
);

ALTER TABLE legal_holds
  ADD COLUMN organization_id  UUID NOT NULL REFERENCES organizations (id),
  ADD COLUMN matter_ref       TEXT NOT NULL,                       -- the customer's matter name or number
  ADD COLUMN ediscovery_case_id UUID,                              -- set by eDiscovery & Export
  ADD COLUMN scope            TEXT NOT NULL CHECK (scope IN ('custodian_all', 'custodian_dms',
                                'containers', 'query')),
  ADD COLUMN date_range       TSTZRANGE,                           -- fixed at creation
  ADD COLUMN query            JSONB,
  ADD COLUMN suppress_ephemeral BOOLEAN NOT NULL DEFAULT TRUE,     -- force history on, timers off
  ADD COLUMN status           TEXT NOT NULL CHECK (status IN ('active', 'releasing', 'released')),
  ADD COLUMN created_by       UUID NOT NULL REFERENCES members (id),
  ADD COLUMN released_by      UUID REFERENCES members (id),
  ADD COLUMN release_approved_by UUID REFERENCES members (id),
  ADD COLUMN released_at      TIMESTAMPTZ,
  ADD CONSTRAINT legal_holds_two_person_release
    CHECK (released_by IS NULL OR release_approved_by IS DISTINCT FROM released_by);

ALTER TABLE hold_custodians
  ADD COLUMN member_id        UUID NOT NULL REFERENCES members (id),
  ADD COLUMN added_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN removed_at       TIMESTAMPTZ,
  ADD COLUMN coverage         JSONB NOT NULL DEFAULT '{}';         -- computed: held, suppressed, not covered

CREATE TABLE hold_containers (               -- shared places held regardless of author
  legal_hold_id UUID NOT NULL REFERENCES legal_holds (id),
  container_id  UUID NOT NULL REFERENCES containers (id),
  added_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (legal_hold_id, container_id)
);

CREATE TABLE hold_notices (                  -- what custodians were told, and when they acknowledged
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_hold_id   UUID NOT NULL REFERENCES legal_holds (id),
  member_id       UUID NOT NULL REFERENCES members (id),
  kind            TEXT NOT NULL CHECK (kind IN ('initial', 'reminder', 'scope_change', 'release')),
  body_version    TEXT NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  next_reminder_at TIMESTAMPTZ
);

CREATE TABLE preserved_versions (            -- the compliance store: originals of edits and deletes
  item_id         UUID NOT NULL REFERENCES items (id),
  item_version_id UUID NOT NULL REFERENCES item_versions (id),
  reason          TEXT NOT NULL CHECK (reason IN ('edited', 'deleted_by_user', 'deleted_by_admin',
                    'container_deleted', 'expired_retained')),
  preserved_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  keep_until      TIMESTAMPTZ,                -- NULL while any hold applies
  PRIMARY KEY (item_id, item_version_id)
);

CREATE TABLE disposition_runs (              -- every deletion pass, provable later
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  started_at      TIMESTAMPTZ NOT NULL,
  finished_at     TIMESTAMPTZ,
  evaluated       BIGINT NOT NULL DEFAULT 0,
  deleted         BIGINT NOT NULL DEFAULT 0,
  skipped_on_hold BIGINT NOT NULL DEFAULT 0,
  policy_versions JSONB NOT NULL               -- policy ids and versions in force for this run
);
```

Notes on the sketch:

- **One precedence function.** `effective_disposition(item)` returns `kept_until` and the reason: any active hold covering the item's custodians, containers or query returns "held"; otherwise apply the published principles (retention over deletion, longest retention, explicit over implicit, shortest deletion) across matching policies and labels. The deletion job, the admin's "why is this still here" view and the export all call it.
- **Users delete views, not records.** A user delete sets `items.deleted_at` and hides the item; a `preserved_versions` row keeps it if any policy retains or any hold applies, and the disposition job removes it only when the function says so. That is the `SubstrateHolds` pattern, generalized.
- **Holds suppress ephemerality at write time.** While a member is a custodian with `suppress_ephemeral`, DM history can't be turned off, disappearing timers are ignored for new messages, and member-set retention overrides are disabled; the client shows why. `hold_custodians.coverage` records the conversations a hold can't reach (an external organization's side of a shared channel, an encrypted mode) so counsel sees the gap.
- **Disposition is batched and recorded.** Each run writes its counts and the policy versions in force; a deletion can be explained later by the run that did it, and a run that deleted held content is detectable by joining back to the holds active at `started_at`.
- **Adaptive scopes are re-evaluated on a schedule** (Microsoft runs its queries daily); a member who moves into scope gets the policy from the evaluation time, recorded in the audit log, not from their join date.
- **Release is two-person and checked.** A release with another active hold over the same custodian leaves their content held; the UI says so before the approver signs.

## Auditing

- **Policy and hold changes:** every create, edit, lock, disable, release and custodian change as audit events with before and after, in the customer's log ([Audit Logs](/books/workplace-and-collaboration/audit-logs)), retained at least as long as the longest hold.
- **Preservation status per custodian:** a report of what is held, what is suppressed and what is not covered, regenerated daily during a hold; changes in coverage alert the hold's owner.
- **Disposition evidence:** run records with counts and policy versions, and a periodic sample proving deleted items are gone from primary storage, the compliance store, search indexes and, within the published backup window, backups.
- **Notices:** sent, acknowledged and reminded per custodian, with overdue acknowledgments escalated.
- **Ephemeral settings:** each change to history, timers or member retention, with the hold state at the time, so "history was off" can be proven or disproven for any conversation and date.

## What This Means for the System You Build

- **Separate the user's view from the compliance store** so deletes and edits never destroy what a policy or hold must keep.
- **Write one precedence function** with published rules, and show the admin why any item is kept or due for deletion.
- **Make a hold override every user-controlled deletion setting** for custodians, automatically; never rely on custodians to turn history on.
- **Hold containers as well as custodians** for shared channels, and report what a hold can't reach.
- **Publish the deletion timeline,** including compliance stores and backups, and record every disposition run.
- **Make release two-person** and check for overlapping holds.
- **Offer holds on the plans your customers' litigation needs,** or document clearly how a lower plan can preserve by export.

## References

**Vendor documentation**

- [Slack: Customize message and file retention policies](https://slack.com/help/articles/203457187-Customize-message-and-file-retention-policies), who sets retention, the paid default, Free plan options, member and admin overrides, edit tracking options, daily permanent deletion
- [Slack: Create and manage legal holds](https://slack.com/help/articles/4401830811795-Create-and-manage-legal-holds), Enterprise availability, the Legal Holds Admin role, 1,000 custodians, scope and date range fixed at creation, exclusions, deleted channels, export by JSON or Discovery API
- [Slack: Discovery API](https://slack.com/help/articles/360002079527), edited and deleted content returned when preserved by retention or holds
- [Microsoft Learn: Learn about retention policies and retention labels](https://learn.microsoft.com/en-us/purview/retention), locations, labels not supported for Teams, the four principles of retention and where retained copies are kept
- [Microsoft Learn: Learn about retention for Teams](https://learn.microsoft.com/en-us/purview/retention-policies-teams), hidden mailbox folders, `SubstrateHolds`, the 1-7 day timer job, the 21-day delay for user deletes, the 16-day example, items not retained, private channel migration and external users
- [Microsoft Learn: Use Preservation Lock to restrict changes to retention policies](https://learn.microsoft.com/en-us/purview/retention-preservation-lock), PowerShell-only locking, no disabling or weakening by any admin, no adaptive scopes
- [Microsoft Learn: Learn about Insider Risk Management](https://learn.microsoft.com/en-us/purview/insider-risk-management), eDiscovery (Premium)'s legal hold notification workflow
- [Google Vault Help: How retention works](https://knowledge.workspace.google.com/vault/retention/how-retention-works), default and custom rules, holds over retention, release behavior and purge timing for Gmail, Drive and Chat
- [Google Vault Help: Hold Google Chat messages](https://knowledge.workspace.google.com/vault/holds/place-google-chat-messages-on-hold), Chat holds and history-on messages
- [Google Vault Help: Get started with holds](https://knowledge.workspace.google.com/vault/holds/get-started-with-holds-in-google-vault), hold targets and shared drives through members
- [Google Workspace Admin Help: Client-side encryption FAQ](https://knowledge.workspace.google.com/admin/security/client-side-encryption-faq), Vault retention and export of encrypted files without content search
- [Atlassian Support: Differences administering Confluence Data Center and Cloud](https://support.atlassian.com/migration/docs/differences-administering-confluence-data-center-and-cloud/), retention rules on Data Center and "not available in Confluence Cloud"
- [Zoom Support: Chat legal hold (KB0057908)](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057908), paid accounts, 7-day cloud retention, Advanced Chat Encryption disabled, 20 custodians, 1 GB export files
- [Box Support: About Retention and Retention Policies](https://support.box.com/hc/en-us/articles/360043694374), Governance plans, non-modifiable policies for SEC Rule 17a-4, the latest end date wins, holds over deletion
- [Box Support: About Legal Hold Policies](https://support.box.com/hc/en-us/articles/360044193773), Ownership, Interaction (seven years back), Access and folder holds, no end-user badging
- [Notion Help Center: Custom data retention settings](https://www.notion.com/help/custom-data-retention-settings), Enterprise owners, 30-day defaults, one day to 10 years
- [Notion Help Center: Legal holds](https://www.notion.com/help/legal-holds), scope by created, edited or viewed, reach back to May 2022, PDF and CSV export, release re-enabling retention

**Law and courts**

- [Fed. R. Civ. P. 37 and Committee Notes (LII)](https://www.law.cornell.edu/rules/frcp/rule_37), Rule 37(e)'s text and the 2015 note on reasonable steps, proportionality, sophistication, cloud failures, rejecting negligence-based adverse inferences and foreclosing inherent authority
- [Fed. R. Civ. P. 26 (LII)](https://www.law.cornell.edu/rules/frcp/rule_26), amendment history including the December 1, 2015 effective date
- [Zubulake v. UBS Warburg LLC, 220 F.R.D. 212 (S.D.N.Y. 2003)](https://acc.com/sites/default/files/2022-11/19%20Ethics%20CLE%20Program%202022%20Zubulake%20v.%20UBS%20Warburg%20LLC%2C%20220%20F.R.D.%20212%2C%20218%20%28S.D.N.Y.%202003%29.pdf), the litigation hold standard, key players, backup tapes and the April 2001 trigger
- [In re Google Play Store Antitrust Litig., No. 21-md-02981-JD, Dkt. 469 (N.D. Cal. Mar. 28, 2023)](https://storage.courtlistener.com/recap/gov.uscourts.cand.373179/gov.uscourts.cand.373179.469.0.pdf), findings on Chat history defaults, retention periods, the hold, auditing, the email comparison, intent and remedies
- [Epic Games v. Google, No. 3:20-cv-05671-JD, Dkt. 592 (N.D. Cal. Dec. 6, 2023)](https://storage.courtlistener.com/recap/gov.uscourts.cand.364325/gov.uscourts.cand.364325.592.0.pdf), final jury instruction No. 13 on the permissive inference
- [United States v. Google LLC, No. 20-cv-3010, Dkt. 1033 (D.D.C. Aug. 5, 2024)](https://storage.courtlistener.com/recap/gov.uscourts.dcd.223205/gov.uscourts.dcd.223205.1033.0.pdf), declining Rule 37(e) sanctions, the 24-hour deletion practice since 2008, the February 2023 change and the "at its own peril" warning
- [FTC v. Amazon.com, No. 2:23-cv-01495-JHC, Dkt. 198 (W.D. Wash. Apr. 25, 2024)](https://appliedantitrust.com/16_foreclosure/cases_ftc/amazon_ftc2023/amazon_ftc_wdwash_spoliation_compel_motion2024_04_25.pdf), the FTC's allegations about Signal, hold dates, guidance and Wickr
- [vLex: FTC v. Amazon.com order of April 29, 2026](https://case-law.vlex.com/vid/fed-trade-comm-n-1119545399), the disposition of the sanctions-related motions (secondary)
- [FTC: Semiannual litigation status report (June 30, 2026)](https://www.ftc.gov/system/files/ftc_gov/pdf/litigation-status-report-june-2026.pdf), the Amazon trial date

**Guidance**

- [DOJ Criminal Division: Evaluation of Corporate Compliance Programs (updated September 2024)](https://www.justice.gov/criminal/criminal-fraud/page/file/937501/dl), messaging applications, ephemeral messaging, preservation settings and BYOD questions
- [The Sedona Conference: The Sedona Principles, Third Edition, principles](https://www.thesedonaconference.org/file-download/download/public/5140), Principle 5 on reasonable, good-faith and proportionate preservation
