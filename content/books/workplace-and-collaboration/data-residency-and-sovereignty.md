+++
title = "Data Residency & Sovereignty"
description = "What residency covers and leaves out, the EU Data Boundary and Multi-Geo, moving regions, Schrems II, the Data Privacy Framework and the CLOUD Act."
category = "Workplace & Collaboration Industry"
order = 2012
part = "Tenancy and Identity"
tags = ["workplace", "data-residency", "sovereignty", "gdpr", "cloud-act"]
+++

Large customers ask where their data is, and they mean three different questions. The first is location: in which country are the messages, files and pages stored at rest? The second is transfer: under which legal mechanism does personal data cross a border, for example from an EU employer to a US vendor's support engineers? The third is sovereignty: whose government can compel the vendor to hand the data over, or switch the service off? A vendor can answer the first with a region picker, the second with contracts and certifications, and the third only with corporate structure, keys the vendor doesn't hold, or both.

The trouble is that a collaboration product is not one dataset. The content (messages, files, pages) can be pinned to a region; the directory that lets a person sign in from anywhere, the telemetry that runs the service, the abuse reports, the billing records and the AI subprocessors usually can't, or not as easily. Every vendor's residency page is therefore mostly a list of what is covered and what isn't, and the excluded list is where a customer's lawyers spend their time. This chapter covers what residency includes and excludes across the major vendors as of October 2026, Microsoft's EU Data Boundary and its regional add-ons, moving a tenant between regions, sovereignty commitments, and the transfer law (Schrems II, the EU-US Data Privacy Framework and its 2025 court test, and the US CLOUD Act). The infrastructure side of sovereign clouds is the Hosting & Cloud volume's [Sovereign Cloud](/books/hosting-and-cloud/compliance-programs#sovereign-cloud); the GDPR mechanics of transfers are the playbook's [International Transfers](/docs/compliance/gdpr#international-transfers).

## How the Platforms Do It

As of October 2026, from each vendor's documentation:

| Vendor | Regions | Plan | Covered at rest in the region | Explicitly not covered |
| --- | --- | --- | --- | --- |
| **Slack** | Frankfurt, Paris, Stockholm, Zurich, Tokyo, Mumbai, Singapore, Seoul, Sydney, London, Montreal and São Paulo, each with a named backup region | Business+ or Enterprise | Messages, canvases and snippets; uploaded files; the search index; app- and bot-generated messages and files; data of apps on Slack's managed infrastructure | Member profiles; workspace and channel membership; seat, usage and revenue data; analytics and service-quality data; Slack-generated ids. Flagged or reported data may be stored in the US |
| **Atlassian** | Global (default), Australia, Canada, EU, Germany, India, Japan, Singapore, South Korea, Switzerland, UK, USA | Standard, Premium and Enterprise, for Jira, Jira Service Management, Jira Product Discovery, Loom and Confluence | Issues, comments, attachments, board and sprint data, search data, project configuration; Confluence pages, blogs, whiteboards, databases and search data; Loom videos and transcripts; Rovo chat session logs | User account information in the central identity service; Confluence permission and restriction configuration and space keys; data in transit (up to 30 days); caches; most app, audit and operational logs |
| **Notion** | US, EU, Japan and Korea (Japan and Korea through the account team) | Enterprise, at no extra charge | Page content, uploaded files, the search index, third-party and bot content stored in Notion; backups in the same region | Notion Calendar and Notion Mail; integrations' data; account information and usage data; subprocessors including LLM providers; processing such as content duplicated across workspaces in different regions |
| **Google Workspace** | United States, Europe, or no preference | Frontline Starter and up, Business Standard and Plus, Enterprise Standard and Plus, Education Standard and Plus, Enterprise Essentials Plus; per-OU or group regions and processing on higher editions | Data at rest, per a separate list of covered data; optional in-region processing on Enterprise Plus and Frontline Plus | Users without a supported edition, even in a covered OU; DMs between users in different regions are stored in both |
| **Microsoft 365** | Tenant geography by sign-up country; Multi-Geo satellite geographies; Advanced Data Residency local region geographies | Product Terms commitments for core services; Multi-Geo and Advanced Data Residency as paid add-ons | Exchange Online, SharePoint and OneDrive, Teams, and Microsoft 365 Copilot and Copilot Chat as core services; more services under Advanced Data Residency | Customers who bought Multi-Geo are outside the EU Data Boundary |

Three patterns:

- **Content yes, identity no.** Every vendor pins the content and its search index and leaves the directory global: Slack's profiles and memberships, Atlassian's user accounts, Notion's account information. A person must be able to sign in from anywhere, and identity systems are global services.
- **Operations data stays home.** Usage, analytics, billing and most logs run in the vendor's home region. Atlassian states that the audit log isn't covered by data residency, which matters because the audit log records page titles and work item identifiers unless the admin turns that off ([Change History](/books/workplace-and-collaboration/admin-consoles-and-policies#change-history)).
- **New features arrive outside the boundary first.** Notion excludes Calendar, Mail and beta services; Slack's list covers apps only when they run on Slack's managed infrastructure; Atlassian notes Switzerland lacks its Data Lake, so some analytics are unavailable for data pinned there. Residency is a property of each feature, not of the product.

## What Residency Covers

Reading the vendors' lists side by side gives a taxonomy that any builder can reuse:

1. **Customer content at rest:** messages, pages, files, attachments, recordings. Covered by everyone.
2. **Derived content:** search indexes, previews, thumbnails, transcripts, AI embeddings. Slack and Notion name the search index explicitly; Atlassian names search data. Derived data is customer content and has to follow it, or the residency claim is hollow.
3. **Backups.** Notion keeps backups in the same region as production. Slack names a backup region for each data region (Frankfurt to Paris, Tokyo to Osaka, Montreal to Calgary), and in Singapore, Seoul, London and São Paulo replicates within the same region. Atlassian stores backups created after April 28, 2026 in the pinned region, doesn't move older ones, and requires a restore destination that is unpinned or pinned to the backup's region.
4. **Identity and directory:** profiles, account information, memberships. Usually not covered.
5. **Configuration:** permissions, restrictions, space keys, channel names. Atlassian excludes Confluence permission configuration; Microsoft's EU Data Boundary definition of customer data excludes "information used to configure resources in the Online Services, such as technical settings and resource names."
6. **Service operations data:** logs, telemetry, usage and billing. Usually not covered, sometimes pseudonymized (below).
7. **Trust and safety data:** Slack may store flagged or reported data in the US to enforce its acceptable use policy.
8. **Data in transit and caches:** Atlassian excludes data in transit for up to 30 days and cached content.
9. **Subprocessors:** Notion excludes data processed by subprocessors, including LLM providers, which it says use zero data retention for Enterprise workspaces.

### Processing versus storage

Storage at rest and processing are separate promises. Google Workspace makes the distinction explicit: data regions apply to data at rest, and in-region processing is a separate setting available on Enterprise Plus and Frontline Plus that may make some advanced features unavailable. A message stored in Frankfurt but rendered, indexed or summarized by a service in Iowa has crossed a border every time it is used. Customers who need processing in region (public sector, some regulated industries) need it asked for and answered separately, per feature.

### Cross-region conversations

A message between two people in different regions has to be stored somewhere. Google's answer is both: when users in different data regions send direct messages, the messages are stored in both regions. Notion's answer is that processing such as duplicating content between workspaces, or synced blocks sourced from a workspace in another region, falls outside its residency commitment. Shared channels between organizations in different regions raise the same question at larger scale ([Who Owns Shared Content](/books/workplace-and-collaboration/guests-and-external-collaboration#who-owns-shared-content)).

## Microsoft's EU Data Boundary, Multi-Geo and Advanced Data Residency

Microsoft has the most layered public model, because its customers range from a five-person firm to a multinational with a tenant spanning thirty countries.

**The EU Data Boundary.** Microsoft committed to store and process customer data and personal data for its enterprise online services (Azure, Dynamics 365, Power Platform and Microsoft 365) within the EU and EFTA, subject to documented limited transfers. On February 26, 2025 it announced the boundary complete: phase 1 (January 2023) covered customer data for core services, phase 2 (January 2024) extended it to pseudonymized personal data, and phase 3 (February 2025) added professional services data from technical support interactions, such as customer-provided logs and support case notes. Microsoft requires personal data in system-generated logs to be pseudonymized (by encryption, masking, tokenization or blurring) so its operations staff can work with logs without identifying users. For Microsoft 365, customers whose sign-up location is in an EU or EFTA country are in scope, except that customers who have purchased Multi-Geo are not, even if their tenant is in the EU.

**Multi-Geo.** The Multi-Geo add-on lets one Microsoft 365 tenant store data in several geographies: a primary provisioned geography where the subscription started, and satellite geographies, with geography, group and user information mastered centrally in Microsoft Entra ID and synchronized to each. Data location is set per user (the preferred data location, with values such as `EUR`, `DEU`, `GBR` and `NAM`) and extends to shared resources such as SharePoint sites, Microsoft 365 Groups, shared mailboxes and Teams teams, covering Exchange Online, SharePoint and OneDrive, Teams, and Microsoft 365 Copilot and Copilot Chat. Licenses are per user hosted in a satellite geography, with a minimum of 5% of eligible users for Enterprise Agreement and CSP customers; small business and education subscriptions don't qualify. Microsoft configures the tenant after the licenses arrive, which most tenants complete within a month.

**Advanced Data Residency.** The Advanced Data Residency add-on commits customer data at rest to a local region geography (a single country, such as Germany, France, the UK, Japan or Australia, among 27 listed), extends commitments beyond the core services to Defender for Office P1, Exchange Online Protection, Office for the web, Viva Connections and select Purview services (Audit, Data Lifecycle Management, DLP, Information Barriers and Information Protection), and includes prioritized migration of existing data. It must cover 100% of paid licenses in the tenant, and the EU isn't available as a single Advanced Data Residency geography; Microsoft points EU customers to the Product Terms or the EU Data Boundary instead.

The three products answer three different customers: the EU Data Boundary answers "keep it in Europe," Advanced Data Residency answers "keep it in my country," and Multi-Geo answers "keep each employee's data in their own country, in one tenant."

## Choosing and Moving a Region

Region choice is cheapest at creation and expensive afterward, and every vendor's documentation shows it:

- **Slack.** Only the Primary Owner can enable data residency, through sales. New workspaces or organizations created in a region store data there from creation; for existing customers, newly generated data goes to the selected region, and existing data stays in the US unless the customer asks for it to be migrated. Without data residency, data is stored in the US. Customers using Enterprise Key Management can keep their keys in the residency region.
- **Atlassian.** Moving an app's data causes downtime that "may last up to 24 hours, depending on data size," search may be disabled for up to three days while it re-indexes, the move is scheduled in a time zone the customer chooses, and Marketplace apps that support residency move right after the Atlassian app.
- **Notion.** Existing workspaces migrate through the account team or support; data stays in the US until Notion confirms completion, and covered data is deleted from the US 30 days after migration. Enterprise organizations can set a default region so new workspaces don't need migrating.
- **Google Workspace.** Data region policies are set per organizational unit or configuration group on the higher editions, with group settings overriding OUs, and status reports on Frontline Plus and Enterprise Plus show where data is.

The lesson for a builder: assign the region when the workspace is created (the default from the organization, or the sign-up country), make it an attribute of the workspace that every storage write reads, and build migration as a long-running, resumable job with a source-deletion step that runs only after verification, and a published downtime estimate.

## Sovereignty Beyond Location

Location doesn't answer the third question. The US CLOUD Act requires a provider to preserve, back up or disclose communications and records in its "possession, custody, or control," "regardless of whether such communication, record, or other information is located within or outside of the United States" (18 U.S.C. 2713). A US vendor's Frankfurt region is still within reach of a US warrant; the User-Generated Platforms volume's [International Requests](/books/user-generated-platforms/law-enforcement-requests#international-requests) covers the legal process. Vendors answer with three kinds of measure:

- **Commitments.** Microsoft's European digital commitments of April 30, 2025 include that if any government orders Microsoft to suspend or cease European cloud operations, "Microsoft will promptly and vigorously contest such a measure" using all legal avenues including litigation; that its European datacenter operations will be overseen by a European board "that consists exclusively of European nationals"; and that this Digital Resilience Commitment goes into contracts with European governments and the European Commission, legally binding on Microsoft Corporation and its subsidiaries.
- **Keys the vendor doesn't hold.** Google describes its Sovereign Cloud portfolio (February 6, 2026) as extending to Google Workspace through client-side encryption, which makes collaboration data "indecipherable to Google." A vendor that can't decrypt content can't produce it in readable form, at the cost of the features that need to read it (search, previews, AI); [Encryption & Customer-Managed Keys](/books/workplace-and-collaboration/encryption-and-customer-keys) covers what each scheme gives up.
- **Separate structures.** Sovereign clouds with local entities, local staff and partner operators are infrastructure offerings; the Hosting & Cloud volume's [Sovereign Cloud](/books/hosting-and-cloud/compliance-programs#sovereign-cloud) and [Sovereign partitions](/books/hosting-and-cloud/regions-zones-and-cells#sovereign-partitions-2026) cover how AWS, Microsoft and Google built them. For collaboration software the practical result is that the suites can offer sovereign variants on top of those clouds, and best-of-breed vendors mostly offer region choice and customer-managed keys.

## The Transfer Law

Storage location and transfer law are linked: even with data at rest in Europe, support access, subprocessors and global services transfer personal data to the US, and the transfer needs a legal basis under the GDPR ([International Transfers](/docs/compliance/gdpr#international-transfers)). The history that shapes every vendor's data processing agreement:

- **Schrems II (July 16, 2020).** In Case C-311/18, the Court of Justice invalidated Decision 2016/1250 on the adequacy of the EU-US Privacy Shield, and held that Decision 2010/87 on standard contractual clauses remained valid. Data transferred under the clauses must get protection "essentially equivalent" to the GDPR's, assessed against both the contract and the destination country's rules on public authority access; the exporter and recipient must verify that level of protection before any transfer, and supervisory authorities must suspend or prohibit transfers where the clauses can't be complied with. That is the origin of the transfer impact assessments every enterprise customer now asks for.
- **New standard contractual clauses (June 4, 2021).** The Commission issued modernized clauses under the GDPR, Implementing Decision (EU) 2021/914, which every vendor's DPA now incorporates.
- **The Data Privacy Framework (July 10, 2023).** After a US Executive Order of October 7, 2022 strengthened safeguards on US intelligence activities, supplemented by an Attorney General regulation establishing the Data Protection Review Court, the Commission adopted Implementing Decision (EU) 2023/1795, the adequacy decision for the EU-US Data Privacy Framework, under which personal data can flow from the EU to organizations in the US without further authorization.
- **Latombe v Commission (September 3, 2025).** In Case T-553/23, the General Court dismissed an action to annul the 2023 decision, confirming that on the date of adoption the US ensured an adequate level of protection. It rejected the arguments that the Data Protection Review Court isn't independent (its judges can be dismissed only by the Attorney General and only for cause) and that bulk collection must be authorized in advance by an independent authority (Schrems II requires, at a minimum, ex post judicial review, which the court found US law provides). It also noted that the Commission must monitor the US framework continuously and may suspend, amend or repeal the decision if it changes. Whether the judgment was appealed to the Court of Justice wasn't confirmed for this chapter. <!-- source-gap: latombe-appeal | status | whether Latombe v Commission (T-553/23) was appealed to the Court of Justice, and the appeal's status | closes with: a CJEU case record for an appeal of T-553/23, or confirmation the appeal period lapsed | checked: 2026-10-29 -->

What this means for a collaboration vendor: an EU customer's DPA names the transfer mechanism (DPF certification where the vendor participates, contractual clauses as the fallback), lists subprocessors with their locations, and describes the residency and support-access commitments. Two invalidated frameworks in five years have taught customers to ask for residency as insurance against a third, which is part of why residency became a standard enterprise ask rather than a niche one.

## My Default

For a collaboration product selling to enterprises: offer region choice at workspace creation for content, derived content and backups together; publish the covered and excluded categories as a list as specific as Slack's and Atlassian's; keep identity global but minimal; pseudonymize personal data in operational logs as Microsoft does; make support access to in-region data come from in-region staff or go through the customer's approval ([Delegation, Not Impersonation](/docs/security/support-access#delegation-not-impersonation)); and offer customer-managed keys as the sovereignty answer before building a separate sovereign stack. A separate stack is worth it only when a regulated market requires local operation by a local entity.

## How to Build It

The [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) puts region and residency on `workspaces`. This chapter adds the region assignment and its state, the published catalog of what residency covers, region moves, and the location of items that are stored in more than one region.

```sql
ALTER TABLE workspaces
  ADD COLUMN data_region      TEXT NOT NULL DEFAULT 'us',     -- 'eu-central', 'jp', 'au', ...
  ADD COLUMN backup_region    TEXT NOT NULL DEFAULT 'us',
  ADD COLUMN processing_in_region BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN residency_state  TEXT NOT NULL DEFAULT 'pinned'
    CHECK (residency_state IN ('unpinned', 'pinned', 'moving'));

CREATE TABLE residency_categories (       -- the published list of what residency covers
  key          TEXT PRIMARY KEY,          -- 'messages', 'files', 'search_index', 'profiles', 'audit_log'
  description  TEXT NOT NULL,
  covered      BOOLEAN NOT NULL,          -- stored at rest in the workspace's region
  note         TEXT,                      -- 'pseudonymized in global logs', 'may be stored in the US
                                          --  for acceptable use enforcement'
  effective_from DATE NOT NULL            -- when this promise started, for contracts
);

CREATE TABLE region_moves (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  from_region    TEXT NOT NULL,
  to_region      TEXT NOT NULL,
  requested_by   UUID NOT NULL REFERENCES accounts (id),
  window_start   TIMESTAMPTZ NOT NULL,    -- scheduled in the customer's chosen time zone
  state          TEXT NOT NULL DEFAULT 'scheduled' CHECK (state IN ('scheduled', 'copying',
                   'read_only', 'reindexing', 'verified', 'source_deletion_pending', 'completed',
                   'failed', 'rolled_back')),
  copied_bytes   BIGINT NOT NULL DEFAULT 0,
  verified_at    TIMESTAMPTZ,
  source_delete_after TIMESTAMPTZ,        -- e.g. 30 days after verification
  completed_at   TIMESTAMPTZ
);

ALTER TABLE items
  ADD COLUMN stored_regions TEXT[];       -- set when an item lives in more than one region,
                                          -- such as a DM between users in two regions
```

Notes on the sketch:

- **The region is read on every write.** Storage clients resolve the bucket, database cell and index from `workspaces.data_region`; nothing writes customer content without it, and a test suite asserts that every storage path takes the workspace as input.
- **The catalog is the contract.** `residency_categories` is published on the trust page and referenced by the DPA, so engineering can't add a new data category without deciding whether it is covered, and a change has an effective date.
- **Moves verify before deleting.** The source copy is kept until `verified_at` and then for a grace period; search is rebuilt in the target during `reindexing`; the workspace is read-only only during the cut-over.
- **Multi-region items are explicit.** A conversation spanning regions records where it is stored, so a deletion, a hold or an export reaches every copy.
- **Events:** `workspace.region_assigned`, `region_move.state_changed`, `region_move.completed` and `residency_category.changed` go to the audit log and to the organization's admins, because location changes are contractual events.

## Auditing

- **Region assignments and moves,** with who requested them, the window, bytes copied and verified, and when the source was deleted.
- **Catalog changes,** with effective dates, kept as long as the contracts that cite them.
- **Access to in-region data from outside the region,** by support staff or global services, logged as access.
- **Subprocessor changes** (new processors, new locations) with the notice sent to customers.

## What This Means for the System You Build

- **Answer location, transfer and sovereignty as three separate questions.**
- **Pin content, derived content and backups together;** a search index or embedding outside the region breaks the promise.
- **Publish a covered and not-covered list** as precise as the vendors above, with effective dates.
- **Keep identity global but minimal,** and pseudonymize personal data in operational logs.
- **Set the region at creation** and treat moves as resumable, verified, scheduled jobs with source deletion last.
- **Decide where cross-region conversations live** and record it per item.
- **Offer customer-managed keys as the first sovereignty answer;** build separate sovereign operations only where a market requires it.
- **Name the transfer mechanism in the DPA,** with contractual clauses as the fallback if adequacy falls again.

## References

**Vendor documentation**

- [Slack: Data residency for Slack](https://slack.com/help/articles/360035633934-Data-residency-for-Slack), regions and backup regions, Business+ and Enterprise, covered and not covered data, flagged data in the US, migration of existing data, EKM keys in region
- [Atlassian: Understand data residency](https://support.atlassian.com/security-and-access-policies/docs/understand-data-residency/), locations, plans and apps, in-scope and out-of-scope data, move downtime and re-indexing, backups after April 28, 2026, the Switzerland caveat
- [Atlassian: Track organization activities from the audit log](https://support.atlassian.com/security-and-access-policies/docs/track-organization-activities-from-the-audit-log/), the audit log outside data residency
- [Notion: Data residency](https://www.notion.com/help/data-residency), regions and backups, Enterprise at no charge, covered and not covered data, LLM subprocessors, migration and 30-day US deletion, default region for new workspaces
- [Google Workspace: Choose a geographic location for your data](https://knowledge.workspace.google.com/admin/compliance/choose-a-geographic-location-for-your-data), editions, region options, data at rest, in-region processing, OU and group scope, DMs stored in both regions
- [Microsoft: What is the EU Data Boundary?](https://learn.microsoft.com/en-us/privacy/eudb/eu-data-boundary-learn), customer data, pseudonymized personal data and professional services data, configuration data excluded, countries and datacenters, Microsoft 365 scope and the Multi-Geo exclusion
- [Microsoft 365: Multi-Geo overview and requirements](https://learn.microsoft.com/en-us/microsoft-365/enterprise/microsoft-365-multi-geo), primary and satellite geographies, workloads, licensing and the 5% minimum, preferred data location values, configuration time, EU Data Boundary exclusion
- [Microsoft 365: Advanced Data Residency overview](https://learn.microsoft.com/en-us/microsoft-365/enterprise/advanced-data-residency), local region geographies, services covered, 100% license coverage, the EU not available as one geography

**Announcements**

- [Microsoft On the Issues: Microsoft completes landmark EU Data Boundary (February 26, 2025)](https://blogs.microsoft.com/on-the-issues/2025/02/26/microsoft-completes-landmark-eu-data-boundary-offering-enhanced-data-residency-and-transparency/), completion and the three phases
- [Microsoft On the Issues: European digital commitments (April 30, 2025)](https://blogs.microsoft.com/on-the-issues/2025/04/30/european-digital-commitments/), contesting suspension orders, the European board, the contractual Digital Resilience Commitment
- [Google Cloud: Delivering a secure, open, sovereign digital world (February 6, 2026)](https://cloud.google.com/blog/products/identity-security/delivering-a-secure-open-sovereign-digital-world), Sovereign Cloud extending to Google Workspace through client-side encryption

**Law and regulation**

- [18 U.S.C. 2713: Required preservation and disclosure of communications and records](https://www.law.cornell.edu/uscode/text/18/2713), the CLOUD Act's reach to data in a provider's possession, custody or control wherever stored
- [CJEU: Press release No 91/20, Judgment in Case C-311/18 (PDF)](https://curia.europa.eu/jcms/upload/docs/application/pdf/2020-07/cp200091en.pdf), July 16, 2020, Privacy Shield invalidated, standard contractual clauses decision valid, essential equivalence, verification before transfer, suspension by supervisory authorities
- [European Commission: Standard contractual clauses](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en), modernized clauses issued June 4, 2021 (Implementing Decision 2021/914)
- [CJEU: Press release No 106/25, Judgment in Case T-553/23, Latombe v Commission (PDF)](https://curia.europa.eu/jcms/upload/docs/application/pdf/2025-09/cp250106en.pdf), September 3, 2025, dismissal, the July 10, 2023 adequacy decision, the October 7, 2022 Executive Order and the Data Protection Review Court, independence and bulk collection holdings, continuous monitoring
