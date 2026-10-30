+++
title = "Enterprise Search"
description = "Permission-trimmed search across company tools: connectors, indexing versus federation, ACL sync and its lag, identity mapping, oversharing and ranking."
category = "Workplace & Collaboration Industry"
order = 2040
part = "Search, Integrations and AI"
tags = ["enterprise-search", "permissions", "connectors", "acl", "ranking"]
+++

Enterprise search is one search box over everything a company's people have written down: chat, mail, documents, wikis, tickets, designs, code, CRM records, in dozens of systems from different vendors. Consumer search and in-product search have one corpus with one permission model; enterprise search has many corpora, each with its own permission model, and a single rule that can't be broken: **a person sees a result only if the source system would let them open it, right now.** A search box that shows a salary spreadsheet's title to the wrong person has leaked the spreadsheet, whatever happens on click.

That rule makes the problem hard in ways relevance alone never is. Every source has to be crawled or queried; every source's permissions (users, groups, nested groups, links, inheritance, denies) have to be copied or checked; every source's user ids have to be mapped to one corporate identity; and all of it drifts, because people change teams and documents get reshared every minute while a crawler visits each system on a schedule. Ranking is harder too: there are few clicks per query, documents rarely link to each other the way web pages do, and the best signals (who wrote it, who reads it, who works with whom) are facts about employees. The same index has also become the retrieval layer for AI assistants, so a permission error that once surfaced one stale document now surfaces it inside a confident answer. This chapter covers the architectures, permission trimming, identity mapping, ACL latency, oversharing, and ranking. AI on top of the index is the AI Assistants Over Company Data chapter; search inside a single chat product is [Chat Search](/books/user-generated-platforms/real-time-chat#chat-search) in the User-Generated Platforms volume; the general request-level search contract is the playbook's [Search](/docs/requests/filtering-and-sorting#search).

## How the Platforms Do It

As of October 2026, from vendor documentation:

| Product | Indexing model | Permission model | Where it is sold |
| --- | --- | --- | --- |
| **Microsoft Search and Copilot connectors** (formerly Graph connectors) | Synced connectors index external items on a schedule or by events; federated connectors query the source at runtime | Each external item carries an ACL of grants and denies for users, Entra groups, external groups, everyone or everyone except guests; deny wins | Synced connectors with any Microsoft 365 plan; federated connectors need a Copilot license |
| **Gemini Enterprise** (formerly Agentspace) | Connectors into data stores, with ingestion (indexed copy) or federation (live query) per connector | Source ACLs enforced through the customer's identity provider; "never bypasses source system access controls" | Google Cloud |
| **Google Cloud Search** | Indexing API with connectors | Item readers and denied readers with inheritance; external ids mapped to Google accounts | Google Workspace |
| **Glean** | Indexed connectors with incremental crawls and webhooks where available | Permissions synced from each source; users, groups and memberships pushed separately; group intersections | Standalone |
| **Atlassian Rovo** | Teamwork Graph connectors (Forge modules) that push objects with permissions | Connector content visible only to people with access in the third-party app | On by default for Atlassian Cloud Standard, Premium and Enterprise |
| **Slack enterprise search** | Federated: real-time queries to connected apps | Permissions of the source "at that exact time" | Enterprise+ plan |
| **Notion Enterprise Search** | Indexed connectors (Slack, Google Drive, Teams, Jira and more) | Only what the user can access in the source | Business and Enterprise, with Notion AI |
| **ServiceNow AI Search** | Index with security filters | Early binding in the query by default; late binding as a fallback | ServiceNow platforms |
| **Elastic** | Search connectors with document-level security (beta) | Access-control documents and API keys with role queries | Enterprise Search (Workplace Search) not available in Elastic 9.0 or later |

Two things stand out. First, **every major vendor now offers both architectures**, index and federate, because each fails where the other works. Second, **every vendor states the same permission rule in nearly the same words**: Google's "never bypasses", Glean's "inherited and strictly enforced", Atlassian's "only by those users who already have access", Notion's "only surface a file to someone who already has access to it". The differences are all in how fresh "already" is.

## Index or Federate

An **indexed** system copies content and permissions into its own index on a schedule. Microsoft's Copilot connectors offer incremental crawls (additions and changes) and full crawls (a re-crawl that also catches deletions), on a schedule or driven by events, with event-based sync recommended for "dynamic or sensitive data such as item status". Glean's connectors run incremental crawls and, where sources allow, webhooks or push APIs "so the index approaches real time". Gemini Enterprise's connectors sync full and incremental on schedules into data stores, one per entity type.

A **federated** system sends the query to each source's own search API at query time and merges the answers. Microsoft's federated connectors "query the external data source at runtime without indexing". Slack's enterprise search "uses the federated method to retrieve information in real-time", so results reflect permissions "at that exact time". Gemini Enterprise offers federation for some connectors, noting it "retrieves information directly from the source" without an index, at possibly lower quality.

The trade-off, which I'd put in every architecture review:

| | Indexed | Federated |
| --- | --- | --- |
| **Permission freshness** | As fresh as the last ACL sync | Exact: the source checks at query time |
| **Ranking** | One ranker over all content, with cross-source signals | Merge of independently ranked lists, each source's relevance its own |
| **Latency** | One index query | Slowest source sets the latency; timeouts drop sources |
| **Coverage** | Anything crawlable, including sources with poor search | Only sources with a usable search API |
| **Data held by the search vendor** | A copy of everything | Query and results in transit |
| **Source API load** | Crawl traffic, rate-limited | Query traffic, per user query |
| **Contractual fit** | Blocked where the source forbids storing its data | Required where it does |

The contractual row is now decisive for some sources. Slack's Real-time Search API, which searches "on behalf of the authenticated user", says "you must not store or copy any of the data retrieved from this API", and is open only to directory-published and internal apps. A search vendor that wants Slack content in its product must federate; it can't index. Data-use restrictions on platform APIs in general are the APIs, Events & Rate Limits chapter.

My default: index what you're allowed to index and what changes slowly enough (documents, wiki pages, tickets), federate what you must (sources whose terms forbid copies, or whose permissions change too fast to replicate), and tell the user which results came from which path.

## Permission Trimming

There are two places to apply permissions, and the industry has names for both. ServiceNow's AI Search calls them **early binding**, its default, which "incorporates security filters into the search query", and **late binding**, which "post-filters search query results", is "more computationally expensive", and serves as the fallback for scripted access rules that can't be expressed as a filter. SharePoint's search exposes the same split as two extension points: a pre-trimmer that rewrites the query "before the search query is matched to the search index", and a post-trimmer that prunes results "before they are returned to the user", both using security information captured by the crawler.

Early binding is the default everywhere for good reasons. It returns correct result counts and facets (a post-filter that drops 9 of 10 results leaves a page of one and a facet count of ten, which itself leaks); it pages correctly; and it is fast if the index stores principals as filterable terms. Azure AI Search's documented pattern is the canonical one: a `group_ids` string collection on each document, filterable and not retrievable, queried as `group_ids/any(g: search.in(g, 'group_id1, group_id2'))`; Microsoft notes that `search.in` gives "subsecond response times" where chains of OR clauses slow queries down "by many seconds", and that "the principal is just a string". Elastic's connectors keep access-control documents in a hidden index and restrict queries through API keys whose role descriptors match a document's `_allow_access_control` field; a missing field leaves a document open and an empty one hides it from everyone. OpenSearch attaches a query to a role with substitutions such as `${user.name}` and `${user.roles}`, combines multiple roles with OR, and warns that document-level security restricts reads only, so a DLS-limited user must not hold write permissions.

Late binding remains necessary for rules an index can't express: a source that computes access in code, a document with too many principals, a per-click check by the source. Glean notes that opening a result goes to the source, which "may enforce access again at click time"; that second check is defense in depth, not a substitute for trimming the result list.

**Vector search changes nothing about the rule and something about the mechanics.** An approximate nearest-neighbor index returns the top k by similarity; filtering those k afterwards by permission can leave too few results or none. Vespa's documentation describes the choice: by default it pre-filters (applies the filter during the search) and falls back to exact search when the filter is very selective, while forced post-filtering without raising the target hit count means "we end up with fewer hits". Hybrid search (keyword and vector) has to apply the same permission filter on both legs before fusion.

### The ACL Model

Copying permissions means choosing a model rich enough for every source. The vendors' models converge:

- **Grants and denies.** Microsoft's external item ACL entries have an access type of grant or deny, and "the accessType value deny takes precedence over grant". Google Cloud Search items carry readers and denied readers.
- **Principal types.** Microsoft's are user, group, everyone, everyone except guests, and external group. The guest distinction matters in workplace products, where guests are members of the tenant who must not see "everyone" content (guest models are the Guests & Cross-Org Collaboration chapter).
- **Groups by reference, not by expansion.** Microsoft tells connector authors not to expand group membership into item ACLs because "each group membership can lead to a high volume of item updates"; groups that aren't in Entra become external groups synced through their own API (up to 100,000 external groups per tenant). Glean's indexing SDK says the same more bluntly: "a flattened ACL is stale the moment someone joins a team", so users, groups and memberships are pushed separately.
- **Intersections.** Some sources grant access only to people in several groups at once (a channel restricted to a team inside a division). Glean's SDK supports `allowed_group_intersections`, where a user "must belong to every group within one entry".
- **Inheritance.** Google Cloud Search models parent-child inheritance with three types (both permit, child override, parent override) evaluated "from leaf to root", so a folder's ACL change doesn't require rewriting every file.
- **Link sharing.** "Anyone with the link" is the hardest case, because the set of people who have the link is unknowable. Notion's Google Drive connector requires such a file to have been opened once by a user before it can be found by them; that is the safe interpretation, and the one I'd copy.

## Identity Mapping

Every source names people differently: an email in one, an internal numeric id in another, a username in a third, a personal account in a fourth. Search needs one identity per person to evaluate an ACL, and the vendors are explicit that an unmapped identity sees nothing. Google Cloud Search: "Users don't see items in search results until their external ID syncs", and items must be reindexed after a remap; cross-domain ACLs aren't supported. Microsoft: users who aren't in Entra must be translated to Entra users. Gemini Enterprise uses the customer's identity provider "to identify the end user performing a search" and "determine if they have access to the documents", with third-party providers connected through Workforce Identity Federation, and requires Entra ID groups for Microsoft 365 ingestion. Glean's knowledge graph consolidates one identity per person across sources.

The rules I apply:

- **Map to the directory identity** (the `members` row backed by the corporate IdP), never to email strings alone; emails get reused and renamed.
- **Unmapped means invisible.** A source principal with no mapping matches no one; never fall back to "everyone in the domain".
- **Deactivation is a permission change.** When a member is deactivated, they lose all results at once, independent of any source sync. Notion's Slack connector reflects Slack deactivations in about 30 minutes; the search system's own deactivation should be immediate.
- **Guests and external accounts stay distinct** from full members even when the source treats them alike.

## ACL Sync and Its Latency

An indexed system is always somewhat behind its sources, and published numbers show how far. Notion's Google Drive connector syncs new content about once an hour, with a first sync of about 36 hours; its Slack connector takes up to 3 hours for new messages, indexes a year of history, and covers public channels by default (users can connect their own private channels and DMs). Microsoft's Restricted Content Discovery warns that on a site with more than 500,000 items an update "could take more than a week" to take effect. Azure AI Search's native document-level access says source permission changes show up "only ... after that metadata is synchronized to the index". Rovo's documentation says creations and removals in the source are synced without stating an interval.

Lag in the wrong direction is a breach; lag in the other is an inconvenience. A newly shared document that takes an hour to appear is annoying; a revoked document that stays findable for an hour is the incident. So:

- **Prioritize revocations.** Process removals (from groups, from shares, deletions) ahead of additions, on their own queue with their own alert.
- **Prefer events to schedules** for permissions; where a source offers only polling, poll its permission changes more often than its content.
- **Re-check high-risk results at query time.** For sources flagged sensitive, or results above a sensitivity label, call the source's permission check before returning them (late binding as a backstop).
- **Expose sync age.** Admins should see, per source, when ACLs last synced and how many changes are pending; users should be able to see why a result appears (which grant matched).
- **Fail closed on sync errors.** A source whose ACL sync has failed past a threshold drops out of results rather than serving stale permissions.

## Oversharing: Search Makes Permissions Visible

The most common enterprise search incident isn't a bug in trimming. It is trimming working perfectly on permissions that were wrong all along: a folder shared with "everyone in the company" years ago, a site with broken inheritance, a spreadsheet of salaries shared by link. Before search, obscurity hid these; search, and then AI assistants built on search, removed the obscurity. The admin's tools are therefore as much about curbing discovery as about permissions:

- **Excluding sites from search.** In SharePoint, setting "Allow this site to appear in search results" to No removes it from Microsoft Search and from Copilot's semantic index together. The semantic index itself "can't be disabled", only surfaces content to users who already have access, and is built from SharePoint content and Copilot connector data.
- **Restricted SharePoint Search** limited org-wide search and Copilot to an allow list of up to 100 sites (a hub counted as one) plus content users own, accessed or had shared with them. Microsoft is retiring it: from July 31, 2026, new enablement is blocked, and it points customers to Restricted Content Discovery. It "isn't a security boundary and doesn't change any permissions".
- **Restricted Content Discovery** flags a site so its content stays out of org-wide search and Copilot without changing its permissions or removing it from the index; it needs a Copilot license and SharePoint Advanced Management.

These are discovery controls, not access controls, and Microsoft says so; a person with access can still open the file directly. The durable fix is permission hygiene: reports of content shared with everyone or by anonymous link, owners asked to confirm, defaults that don't overshare. Oversharing remediation for AI is the AI Assistants Over Company Data chapter; sharing defaults are the Permissions & Sharing chapter.

## Ranking with Organizational Signals

Enterprise ranking starts where all search ranking starts: lexical relevance (BM25, which Azure AI Search uses for full text) and vector similarity, combined by **reciprocal rank fusion**. Azure's and Elastic's documentation give the same formula: each list contributes 1/(k + rank) for each document, with k a small constant (60 in both), so a document near the top of either list rises without the two scores needing a common scale. Azure applies semantic re-ranking after fusion. General ranking machinery is shared with [Relevance and Ranking](/books/commerce/site-search-and-merchandising#relevance-and-ranking) in the Commerce volume; this section covers what the workplace adds.

What the workplace adds is **who**. Glean's knowledge graph models content (with permissions and metadata), people (one identity, with roles, teams, tenure and location) and activity (from chat, email and a browser extension), and says activity and graph signals "customize outputs and improve search"; its connectors can supply views, edits and shares that "Glean can use ... in ranking". Microsoft describes its semantic index as ranking with "keyword matching, personalization, and social matching". The signals the vendors describe, and the ones I'd build:

- **Authorship and closeness.** Documents written or edited by people the searcher works with rank higher; the org chart and collaboration graph supply "works with".
- **Activity.** Recently and widely viewed documents beat abandoned ones; a document viewed by the searcher's team beats one viewed by the whole company.
- **Freshness by type.** A ticket from yesterday matters; a policy from three years ago may still be the policy. Decay rates belong per source type.
- **Authority.** Verified or owned pages, official spaces and the canonical copy of a duplicated document outrank drafts and copies.
- **Query understanding from the org's vocabulary:** project code names, team names, acronyms and people's names, learned from the corpus.

The catch: every one of those signals is data about employees. Activity logs that say who read what are exactly what monitoring laws and works councils care about, and query logs are personal data ([Query Logs Are Personal Data](/books/user-generated-platforms/search-and-discovery#query-logs-are-personal-data)). Aggregate them for ranking, keep raw per-person activity short-lived, never expose "who viewed this" through search features without the source's own consent model, and let the customer's admin turn signal families off. The legal frame is the Employee Monitoring & Privacy chapter.

## The Vendors' Arc

The category's history explains its current shape. Elastic's Workplace Search, part of its Enterprise Search product, is "not available in Elastic 9.0+"; existing subscribers can keep running 8.x, and Elastic's connectors with document-level security (in beta since 8.9) carry the function forward on plain Elasticsearch. Google announced Agentspace on December 13, 2024 as search and agents over enterprise data, and an editor's note on that announcement dated October 9, 2025 says Agentspace "is now part of Gemini Enterprise". Google Cloud Search, Workspace's older enterprise search product with its own indexing API and ACL model, still has current developer documentation (updated September 2026), and I found no published end date for it. <!-- source-gap: google-cloud-search-status | status | Whether Google has announced an end of sale or shutdown for Google Cloud Search in favor of Gemini Enterprise | closes with: a Google Workspace Updates post or Cloud Search help page stating its status or end date | checked: 2026-10-29 --> Microsoft renamed Graph connectors to Copilot connectors, and Atlassian made Rovo, with its connectors to Google Drive, SharePoint and other sources, default-on for paid Cloud plans. Slack and Notion moved from searching their own content to searching other vendors'. The common move is that enterprise search stopped being a product and became the retrieval layer of each suite's AI assistant, which is why the AI chapters that follow this one depend on everything above.

## Where the Admin Decides

As everywhere in this book, the customer holds the decisions:

- **Which sources are connected,** with which crawl scope (all of Drive, or selected shared drives; public Slack channels only, or users' own private channels by opt-in, as Notion's connector does).
- **Index or federate per source,** where the product offers both, and therefore whether the search vendor holds a copy.
- **Which sites and containers are discoverable** (site exclusion, Restricted Content Discovery), separately from who can open them.
- **Which identity provider defines people,** and how external and guest accounts map.
- **Which signals feed ranking,** and how long activity data is kept.
- **Retention of the index:** deleting a source's content in the source must delete it from the index; a legal hold on the source doesn't oblige the search vendor to keep a copy, and the index should never become a shadow archive.

## How to Build It

The search system extends the core model with sources (connector instances), indexed documents and their ACLs, external identities and groups, and sync runs. Native content (the product's own `items`) is indexed through the same tables with `source_id` pointing at a built-in source, so trimming has one path.

```sql
-- A connected source: one connector instance in one workspace.
CREATE TABLE search_sources (
  id              UUID PRIMARY KEY,
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  connector       TEXT NOT NULL,             -- 'native', 'google_drive', 'jira', 'slack', ...
  mode            TEXT NOT NULL CHECK (mode IN ('indexed', 'federated')),
  app_installation_id UUID REFERENCES app_installations (id),  -- credentials live there
  scope           JSONB NOT NULL DEFAULT '{}',  -- which drives, sites, channels
  sensitivity     TEXT NOT NULL DEFAULT 'normal' CHECK (sensitivity IN ('normal', 'high')),
  status          TEXT NOT NULL CHECK (status IN ('active', 'paused', 'acl_stale', 'error', 'removed')),
  acl_synced_at   TIMESTAMPTZ,               -- last complete ACL sync
  content_synced_at TIMESTAMPTZ,
  stale_after     INTERVAL NOT NULL DEFAULT '6 hours'  -- past this, drop from results
);

-- People and groups as each source names them, mapped to directory members.
CREATE TABLE search_identities (
  source_id       UUID NOT NULL REFERENCES search_sources (id),
  external_id     TEXT NOT NULL,
  member_id       UUID REFERENCES members (id),  -- NULL = unmapped, matches nothing
  kind            TEXT NOT NULL CHECK (kind IN ('user', 'guest', 'external', 'service')),
  PRIMARY KEY (source_id, external_id)
);

CREATE TABLE search_external_groups (
  source_id       UUID NOT NULL REFERENCES search_sources (id),
  external_group_id TEXT NOT NULL,
  group_id        UUID REFERENCES groups (id),   -- when it is a directory group
  name            TEXT,
  PRIMARY KEY (source_id, external_group_id)
);

CREATE TABLE search_external_group_members (
  source_id       UUID NOT NULL,
  external_group_id TEXT NOT NULL,
  member_kind     TEXT NOT NULL CHECK (member_kind IN ('identity', 'group')),  -- nesting
  member_ref      TEXT NOT NULL,                 -- external_id or external_group_id
  PRIMARY KEY (source_id, external_group_id, member_kind, member_ref),
  FOREIGN KEY (source_id, external_group_id)
    REFERENCES search_external_groups (source_id, external_group_id)
);

-- Indexed documents. Body and vectors live in the search engine; this is the ledger.
CREATE TABLE search_documents (
  id              UUID PRIMARY KEY,
  source_id       UUID NOT NULL REFERENCES search_sources (id),
  external_id     TEXT NOT NULL,             -- the source's id
  item_id         UUID REFERENCES items (id),  -- native content
  parent_external_id TEXT,                   -- folder or space, for inherited ACLs
  inherit         TEXT NOT NULL DEFAULT 'none' CHECK (inherit IN
                    ('none', 'both_permit', 'child_override', 'parent_override')),
  title           TEXT,
  url             TEXT NOT NULL,             -- opens in the source, which checks again
  sensitivity_label TEXT,
  source_updated_at TIMESTAMPTZ,
  indexed_at      TIMESTAMPTZ NOT NULL,
  acl_version     BIGINT NOT NULL,           -- bumps on every ACL change
  deleted_at      TIMESTAMPTZ,
  UNIQUE (source_id, external_id)
);

-- The document's ACL, by reference: groups are never expanded here.
CREATE TABLE search_document_principals (
  document_id     UUID NOT NULL REFERENCES search_documents (id),
  access          TEXT NOT NULL CHECK (access IN ('grant', 'deny')),
  principal_type  TEXT NOT NULL CHECK (principal_type IN
                    ('identity', 'external_group', 'everyone', 'everyone_except_guests', 'link_viewers')),
  principal_ref   TEXT NOT NULL DEFAULT '',  -- empty for the everyone types
  intersection_id SMALLINT,                  -- rows sharing an id must all match
  PRIMARY KEY (document_id, access, principal_type, principal_ref)
);

-- Sync runs, with revocations counted separately.
CREATE TABLE search_sync_runs (
  id              UUID PRIMARY KEY,
  source_id       UUID NOT NULL REFERENCES search_sources (id),
  kind            TEXT NOT NULL CHECK (kind IN ('full', 'incremental', 'acl', 'identity', 'event')),
  started_at      TIMESTAMPTZ NOT NULL,
  finished_at     TIMESTAMPTZ,
  documents_upserted INT NOT NULL DEFAULT 0,
  documents_deleted  INT NOT NULL DEFAULT 0,
  acl_grants_added   INT NOT NULL DEFAULT 0,
  acl_revocations    INT NOT NULL DEFAULT 0,
  error           TEXT
);
```

At query time the service computes the searcher's **principal set** once and passes it to the engine as a filter (early binding):

```sql
-- Principal set for one member in one source: their identity, every external group
-- that contains them (transitively), and the everyone principals that apply.
WITH RECURSIVE me AS (
  SELECT si.source_id, si.external_id, m.kind
  FROM search_identities si
  JOIN members m ON m.id = si.member_id
  WHERE si.member_id = $1 AND si.source_id = $2 AND m.status = 'active'
),
my_groups AS (
  SELECT gm.source_id, gm.external_group_id
  FROM search_external_group_members gm
  JOIN me ON gm.source_id = me.source_id
         AND gm.member_kind = 'identity' AND gm.member_ref = me.external_id
  UNION
  SELECT gm.source_id, gm.external_group_id
  FROM search_external_group_members gm
  JOIN my_groups g ON gm.source_id = g.source_id
                  AND gm.member_kind = 'group' AND gm.member_ref = g.external_group_id
)
SELECT 'identity:' || external_id FROM me
UNION SELECT 'external_group:' || external_group_id FROM my_groups
UNION SELECT 'everyone' FROM me
UNION SELECT 'everyone_except_guests' FROM me WHERE kind = 'full';
```

The engine stores each document's grant and deny principals as two keyword fields of those same strings (intersections as one combined term per intersection) and the query filters `grants ∩ principal_set ≠ ∅ AND denies ∩ principal_set = ∅`, on both the keyword and the vector leg, before fusion. The rules around it:

- **Cache principal sets briefly** and invalidate on any membership event for the member ([Caching Decisions Safely](/docs/security/authorization#caching-decisions-safely)); a deactivated member's set is empty immediately.
- **Drop stale sources.** A source whose `acl_synced_at` is older than `stale_after` is excluded from results (status `acl_stale`) and an admin is alerted.
- **Revocations first:** the ACL queue orders removals ahead of additions, and `acl_revocations` per run is the metric that pages someone when it stalls.
- **Federated sources skip the tables:** the query fans out with the member's own delegated token, results are merged by rank fusion, and nothing is stored, including in logs beyond what the source's terms permit.
- **Late-bind high sensitivity:** for `sensitivity = 'high'` sources or labeled documents, check the source's permission API for each result on the page before returning it.
- **Deletes propagate:** a source deletion sets `deleted_at` and removes the document from the engine in the same job; the index is purged on the source's schedule, not kept as an archive ([Retention and Deletion Through the Warehouse](/docs/data/data-governance#retention-and-deletion-through-the-warehouse) is the same principle for analytics copies).
- **Tenant isolation is absolute:** one engine index or index partition per workspace, with the workspace in every query path ([`tenant_id` Everywhere](/docs/architecture/multi-tenancy#tenant-id-everywhere)).

## Auditing

- **Source changes:** connections, scope changes, mode changes (index or federate), pauses and removals, with the admin who made them.
- **ACL sync health:** each run's counts, failures and the age of the last complete ACL sync per source, kept long enough to answer "was this document findable by that person on that day".
- **Discoverability controls:** site exclusions and restricted-discovery flags, set and cleared.
- **Queries and result access** under the customer's retention settings, because an investigation of a leak starts with who searched for what and which results they opened ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)); keep them out of ranking pipelines beyond aggregate signals.
- **Why a result matched:** the principal that granted access, recorded for sampled queries and on demand, so a bad grant can be traced to its source permission.
- **Identity mapping changes,** since a wrong mapping gives one person another's access.

## What This Means for the System You Build

- **Trim before ranking, not after:** principals as filterable terms, one filter on keyword and vector legs, correct counts and facets.
- **Store groups by reference** with memberships synced separately; never flatten.
- **Model grants, denies, everyone-except-guests, intersections and inheritance;** deny wins.
- **Map every source identity to the directory member;** unmapped matches nothing, and deactivation empties results at once.
- **Treat ACL lag as a security metric:** revocations first, events over polling, stale sources dropped, late binding for sensitive content.
- **Offer both index and federation,** and federate where a source's terms forbid copies.
- **Give admins discovery controls distinct from access controls,** and reports that find overshared content before search does.
- **Use org signals for ranking with restraint:** aggregated, short-lived, switchable by the customer.
- **Never let the index become an archive;** deletes in the source delete from the index.

## References

**Vendor documentation**
- [Microsoft Learn: Manage items for Copilot connectors](https://learn.microsoft.com/en-us/graph/connecting-external-content-manage-items), the rename from Graph connectors, item ACL, properties and content, deny precedence, external groups instead of expanded memberships, mapping non-Entra users, incremental and full crawls, event-based and scheduled sync
- [Microsoft Graph: externalConnectors acl resource](https://learn.microsoft.com/en-us/graph/api/resources/externalconnectors-acl), grant and deny, principal types including everyone except guests
- [Microsoft Learn: Copilot connectors API limits](https://learn.microsoft.com/en-us/graph/connecting-external-content-api-limits), 100,000 external groups per tenant and other limits
- [Microsoft Learn: Copilot connectors prerequisites](https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/prerequisites), synced versus federated connectors and their licensing
- [Microsoft Learn: Semantic index for Copilot](https://learn.microsoft.com/en-us/microsoftsearch/semantic-index-for-copilot), access-trimmed results, cannot be disabled, site exclusion, ranking with keyword, personalization and social matching
- [Microsoft Learn: Search in SharePoint](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/search-in-sharepoint), query-time security trimming, pre-trimmers and post-trimmers
- [Microsoft Learn: Restricted SharePoint Search](https://learn.microsoft.com/en-us/sharepoint/restricted-sharepoint-search), the 100-site allow list, not a security boundary, new enablement blocked from July 31, 2026
- [Microsoft Learn: Restricted Content Discovery](https://learn.microsoft.com/en-us/sharepoint/restricted-content-discovery), discovery without permission changes, licensing, more than a week on sites over 500,000 items
- [Microsoft Learn: Security filters for trimming results in Azure AI Search](https://learn.microsoft.com/en-us/azure/search/search-security-trimming-for-azure-search), the group_ids field and `search.in` filter, performance versus OR chains
- [Microsoft Learn: Document-level access in Azure AI Search](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview), native ACL options and sync-dependent freshness
- [Microsoft Learn: Hybrid search ranking with RRF](https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking), the RRF formula and k, BM25, semantic ranking after fusion
- [Google Cloud: Gemini Enterprise connectors and data stores](https://docs.cloud.google.com/gemini/enterprise/docs/connectors/introduction-to-connectors-and-data-stores), data stores, full and incremental sync, federation versus ingestion, identity syncs
- [Google Cloud: Configure an identity provider for Gemini Enterprise](https://docs.cloud.google.com/gemini/enterprise/docs/configure-identity-provider), identity for access checks, Workforce Identity Federation, no bypass of source controls, Entra groups for Microsoft 365
- [Google Workspace: Cloud Search ACLs](https://developers.google.com/workspace/cloud-search/docs/guides/acls), readers and denied readers, inheritance types, external id mapping, reindexing, no cross-domain ACLs
- [Google: Introducing Google Agentspace](https://blog.google/feed/google-agentspace/), the December 13, 2024 announcement and the October 9, 2025 note on Gemini Enterprise
- [Glean: Connectors](https://www.glean.com/platform/connectors), connector count claim and permission enforcement statement
- [Glean Docs: How connectors power Glean](https://docs.glean.com/connectors/connectors-power-glean), permission sync, incremental crawls and webhooks, click-time enforcement, activity signals in ranking
- [Glean Docs: Knowledge Graph](https://docs.glean.com/security/knowledge-graph), content, people and activity, signals in search
- [Glean Developers: Indexing SDK permissions](https://developers.glean.com/libraries/indexing-sdk/permissions), allowed users, groups and group intersections, no flattening
- [Atlassian: Rovo activation](https://www.atlassian.com/software/rovo/guides/admin-guide/rovo-activation), on by default for Standard, Premium and Enterprise
- [Atlassian Support: How connector permissions are kept in sync](https://support.atlassian.com/organization-administration/docs/how-connector-permissions-are-kept-in-sync/), visibility limited to source access, synced creations and removals
- [Atlassian Developer: Build a Teamwork Graph connector](https://developer.atlassian.com/platform/teamwork-graph/build-a-teamwork-graph-connector/), Forge connectors pushing objects with permissions
- [Slack: Enterprise search](https://slack.com/features/enterprise-search), connected sources, federated real-time retrieval, permissions at query time, Enterprise+ plan
- [Slack: Real-time Search API](https://docs.slack.dev/apis/web-api/real-time-search-api/), searching on behalf of the user, no storing or copying, eligible apps
- [Notion Help: Enterprise Search](https://www.notion.com/help/enterprise-search), plans and connectors
- [Notion Help: Notion AI connector for Google Drive](https://www.notion.com/help/notion-ai-connectors-for-google-drive), access-limited results, hourly sync, 36-hour first sync, anyone-with-link files
- [Notion Help: Notion AI connector for Slack](https://www.notion.com/help/notion-ai-connectors-for-slack), public channels by default, user-connected private content, deactivation and message latency, one year of history
- [ServiceNow: AI Search security](https://www.servicenow.com/docs/r/VbEA8DxUy61CFZ25mbYrcQ/HsRM67afacEpCXm6SLUXpg), early and late binding
- [Elastic: Enterprise Search 8.19.17 release notes](https://www.elastic.co/guide/en/enterprise-search/current/release-notes-8.19.17.html), Enterprise Search including Workplace Search not available in 9.0 and later
- [Elastic: Document-level security for connectors](https://www.elastic.co/docs/reference/search-connectors/document-level-security), beta since 8.9, supported connectors
- [Elastic: DLS overview](https://www.elastic.co/docs/reference/search-connectors/es-dls-overview), access-control index, `_allow_access_control`, API keys with role descriptors
- [Elastic: Reciprocal rank fusion](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion), the RRF formula and default rank constant
- [OpenSearch: Document-level security](https://docs.opensearch.org/latest/security/access-control/document-level-security/), role queries with substitutions, OR across roles, no write restriction
- [Vespa: Nearest neighbor search guide](https://docs.vespa.ai/en/querying/nearest-neighbor-search-guide.html), pre-filtering by default, exact fallback, fewer hits with post-filtering
