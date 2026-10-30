+++
title = "AI Assistants Over Company Data"
nav_title = "AI Assistants"
description = "Copilot, Gemini, Slack AI, Rovo, Notion AI and Glean: permission-aware grounding, oversharing fixes, data-use commitments, admin controls, records and pricing."
category = "Workplace & Collaboration Industry"
order = 2044
part = "Search, Integrations and AI"
tags = ["ai", "copilot", "retrieval", "oversharing", "data-governance"]
+++

An assistant over company data is a language model handed a question, a retrieval step over the tenant's content, and the asking person's permissions. "Summarize what the customer escalations channel decided this week", "draft a reply using the pricing doc", "what's the status of the migration project": each answer is assembled from messages, files, pages and tickets the assistant fetched at that moment, as that user, and written into a response that cites them. Microsoft 365 Copilot, Gemini in Google Workspace, Slack's AI features, Atlassian Rovo, Notion AI and Glean all work this way.

The model is the easy part to buy. What's hard is that the assistant is only as safe as the tenant's permissions, and most tenants' permissions were never meant to be read by something this thorough. A spreadsheet of salaries shared with "everyone in the company" in 2019 was protected by nobody knowing where it was; an assistant that finds it on request removes that protection without changing a single grant. The vendor can promise not to train on the data and to respect permissions exactly; only the customer's admins can fix what the permissions say. This chapter covers how grounding works, oversharing and its remediation tools, the vendors' data-use commitments and the 2024 dispute that tested them, admin controls, the records an assistant creates, and how pricing moved from add-ons into bundles. Agents that take actions, and the MCP connectors that give outside assistants the same access, are [AI Agents, Connectors & MCP](/books/workplace-and-collaboration/ai-agents-and-mcp); the index that retrieval reads from is Enterprise Search; the generic rules for AI features are the playbook's [AI Agents](/docs/architecture/ai-agents) and [AI Security](/docs/security/ai-security).

## How the Platforms Do It

As of October 2026:

| Assistant | Grounded in | Permission model | Training commitment | How it's sold |
| --- | --- | --- | --- | --- |
| **Microsoft Copilot** (Microsoft 365) | Microsoft Graph: mail, chats, files, meetings, calendar; Graph connectors for outside content; optional web search through Bing | Only content the user has at least view permission to; honors sensitivity label usage rights | Prompts, responses and Graph data aren't used to train foundation models | Add-on to eligible Microsoft 365 and Office 365 plans; Copilot Business for organizations up to 300 users; included in Microsoft 365 E7 |
| **Gemini in Google Workspace** | Gmail, Drive, Docs and other Workspace content | Won't retrieve a document or email the user can't access | Customer data isn't used to train models without permission; not human reviewed | Included in Business and Enterprise plans since January 2025 |
| **Slack AI features** | Messages, files and connected sources in the workspace | Reads only what the requesting user can see; output visible only to that user | Customer data isn't used to train generative models without opt-in | Advanced AI in Business+ ($15 per user a month billed annually) and Enterprise+; basic AI on lower plans |
| **Atlassian Rovo** | Jira, Confluence and connected third-party apps through the Teamwork Graph | Respects existing access controls | (Not covered by the sources cited here) | Included in Standard, Premium and Enterprise cloud plans, with monthly AI credits per user |
| **Notion AI** | The workspace, plus connections such as Slack and Google Drive | Uses only content the user can access | Neither Notion nor its AI providers train on customer data; zero data retention for most models on Enterprise | Full AI in Business ($20 per member a month) and Enterprise; trial on Free and Plus |
| **Glean** | Connectors to many workplace systems | Checks source-system permissions on every read and write | (Not covered by the sources cited here) | Sold to enterprises; no public price cited here |

The pattern: **every vendor promises the same two things (no training on your data, nothing you couldn't already see) and none of them can promise the third (that what you can already see is what you should see).** That third promise belongs to the customer, which is why the most consequential AI-era admin tooling is permission reporting, not AI configuration.

## How Grounding Works

The vendors' public descriptions agree on the mechanism, retrieval-augmented generation run per request as the user:

1. **The prompt arrives with the user's identity and context**: the document open, the meeting in progress, the channel being read.
2. **Retrieval runs as the user.** Microsoft's Semantic Index "honors the user identity-based access boundary so that the grounding process only accesses content that the current user is authorized to access"; Slack AI uses the requesting user's access controls and Slack's existing data-fetching libraries; Google says that if a user can't open a document or email, Gemini won't retrieve it.
3. **The model writes from the retrieved context,** citing the sources it used.
4. **The answer goes to the asker only.** Slack shows generated output only to the user who invoked it; a Copilot response appears in that user's activity history.

Slack's engineering write-up adds the details that matter for compliance. Slack hosts the models in an escrow VPC on AWS so the model provider has no access to customer data; it uses off-the-shelf models without training or fine-tuning them; each request carries only the context needed, so the model retains nothing; summaries and answers are generated on demand and, where possible, not stored; and when a source message is removed (by a data loss prevention action, for example) the summaries derived from it are invalidated. Microsoft adds the edges: Copilot honors the usage rights of content encrypted with Purview sensitivity labels or rights management, so a file whose label withholds extraction can't be quoted; web search is an optional connected experience in which Copilot sends a generated query, not the user's documents, to Bing; and admins can choose whether Copilot uses third-party models from Anthropic and OpenAI, which run as subprocessors, with Anthropic's models excluded from the EU Data Boundary as of October 2026.

Three consequences for anyone building this:

- **Permission checks happen at retrieval time, against live grants.** An index that caches documents must also cache, and invalidate, who can read them; the latency between a permission change in the source and in the index is a disclosure window (Enterprise Search covers ACL sync; [Caching Decisions Safely](/docs/security/authorization#caching-decisions-safely)).
- **Derived content inherits its sources' fate.** A summary of a deleted or held message is either deleted with it or retained with it; Slack's invalidation rule is the clean version.
- **Labels must travel into the prompt path.** A sensitivity label that blocks download but not quoting by the assistant is not a control.

## Oversharing

An assistant changes nothing about permissions and everything about their consequences. Before it, a file shared with the whole company through an "Everyone except external users" group, an "anyone in the organization" link or a public channel was reachable but obscure. After it, any employee who asks the right question gets it summarized with a citation. The permission model's failures (inheritance nobody audited, sharing links nobody expired, sites nobody owns) become the assistant's failures in the user's eyes, though the assistant behaved exactly as designed.

Microsoft's response is the clearest public catalog of remediation tools. SharePoint Advanced Management, which Microsoft positions as preparation for Copilot and agents, is available to an organization's SharePoint admins once at least one user holds a Copilot license (or through a standalone add-on, or Microsoft 365 E7). Its oversharing features:

- **Data access governance reports**: permission state across sites, OneDrive accounts and files; every site a given user can reach and how; sensitivity label distribution; where users created the most sharing links in the last 28 days; and what was shared with "Everyone except external users" in the last 28 days.
- **Site access reviews**, which hand an overshared site's report to its owners to fix.
- **Restricted access control**, limiting a site to named groups regardless of its sharing.
- **Restricted content discovery**, which keeps high-risk sites and files out of Copilot and agent responses without changing their permissions.
- **Ownership and lifecycle**: site ownership policies with minimum owner counts, inactive site detection, site attestations by owners, and change history reports covering 180 days.
- **Agent insights**: which agents were created on which sites, and how agents access SharePoint and OneDrive content.

The rules generalize past Microsoft:

- **Fix grants, then exclusions.** Restricted discovery is a stopgap that hides content from the assistant while leaving it reachable by search and by link; the durable fix is changing who can read it. A vendor that offers only the stopgap is offering a way to postpone the fix.
- **Report broad grants by audience size.** The useful report isn't "sites with sharing links" but "content readable by more than N people that holds labeled or sensitive data", which requires the permission system to answer audience-size questions efficiently (Permissions & Sharing covers the model).
- **Give owners the work.** Central IT can't review a million sites; access reviews and attestations push decisions to the people who know whether a site's audience is right.
- **Roll out behind the remediation.** Microsoft positions these tools as preparation for Copilot, which puts the oversharing assessment before licensing users; the first weeks of assistant use are when overshared content gets found.

## Data-Use Commitments

Customers ask the vendor two separate questions, and the commitments answer them separately.

**Will you train models on our data?** As of October 2026:

- **Microsoft**: prompts, responses and data accessed through Microsoft Graph aren't used to train foundation models, including those Copilot uses; Copilot has opted out of Azure OpenAI's abuse monitoring with human review; optional user feedback may be used to improve the product but not to train foundation models.
- **Google**: Workspace doesn't use customer data to train models without the customer's prior permission or instruction, prompts count as customer data, and content isn't human reviewed.
- **Slack**: customer data isn't used to train generative AI models unless the customer opts in. Separately, Slack's non-generative models (channel recommendations, emoji suggestions) learn from aggregated, disassociated customer data, and opting a workspace out of those "global models" is done by an owner emailing Slack, not by an admin setting.
- **Notion**: by default neither Notion nor its AI providers train on customer data, and the provider contracts prohibit it.
- **Anthropic** (for Claude used under its commercial terms): Anthropic may not train models on customer content from its services.

**Will the model provider keep our data?** This is where plans differ. Notion's AI providers retain data for 30 days or less on Free, Plus and Business, while most models on Enterprise have zero data retention and the few that don't are off until the workspace owner opts in. Slack's architecture keeps models inside its own AWS boundary. Microsoft processes Copilot data under the same contractual commitments as the rest of Microsoft 365 and routes EU traffic within the EU Data Boundary, with the third-party model exception above.

The dispute that taught the industry to separate the questions came in May 2024. A Hacker News post pointed to Slack's privacy principles, which said customer data was used to develop machine learning models and that opting out required an email; readers took it to mean Slack AI was trained on their messages. Slack's response was that its platform-level models for recommendations and search can't memorize or reproduce customer data, that Slack AI's language models were hosted in Slack's AWS infrastructure and not trained on customer data, and that the principles predated Slack AI and needed updating. The current principles draw the line the dispute demanded: generative models are not trained on customer data without opt-in; aggregated non-generative models are described separately; the opt-out path is stated.

For a builder, the lesson is about precision, not reassurance. "We use your data to improve our services" covers ranking models, spam filters, generative fine-tuning and human review alike, and a workplace customer's procurement team will read it as the broadest. Name each model class, what data trains it, whether that's aggregated, who can see raw data, and how a customer opts out, by setting rather than by email. Where an assistant is built on outside APIs, the source platforms' data-use terms bind it too ([Data-Use Terms](/books/workplace-and-collaboration/apis-webhooks-and-rate-limits#data-use-terms)).

## Admin Controls

The customer admin's levers, across vendors:

- **Who gets the assistant.** License assignment where it's an add-on; where it's bundled, a per-unit switch. Rovo activates automatically on eligible plans; Copilot is assigned per user.
- **What it can reach.** Microsoft's agents and connectors are allowed or blocked in the Microsoft 365 admin center's Integrated apps page, where admins see each agent's permissions and terms, and users can use only agents their admin allows. Turning off Microsoft 365's "connected experiences that analyze your content" privacy control removes Copilot from Word, Excel, PowerPoint, Outlook and OneNote. Web search can be turned off as an optional connected experience. Notion admins decide whether features that need data-retaining models are on.
- **Which models.** Microsoft lets admins decide whether Anthropic and OpenAI models power Copilot experiences, with their subprocessor terms.
- **How much it may cost.** Rovo's included credits are pooled per organization; usage beyond them is billed at $0.01 per credit up to an admin-set spending cap, and admins can turn overage off so credit-consuming features pause until the monthly reset.
- **What it may surface.** Restricted content discovery and its equivalents, above.

Admin consoles generally are Admin Consoles & Policies; the point here is that an assistant adds controls in four places at once (licensing, data sources, model choice, spend) and an admin needs to see them on one page to answer "what can the assistant do in our tenant".

## The Records an Assistant Creates

An assistant interaction is a new kind of business record: a prompt that may contain confidential facts, a response that may be relied on, and a list of sources it drew on. The vendors disagree on whether to keep it.

**Microsoft keeps it.** Copilot stores each prompt and response, with citations, as the user's Copilot activity history, processed under the same commitments as other Microsoft 365 content and not used for training. Admins search it with Content search and eDiscovery and set retention policies on Copilot interactions in Purview; users can delete their own history from their account portal. Purview Audit records a `CopilotInteraction` event for each use, with:

- the host app (Teams, Word, Copilot Chat) and the app identity, including custom agents built in Copilot Studio;
- `AccessedResources`: every file, message or email Copilot read, with its sensitivity label ID, the action (read, create, modify), any policy that blocked access, and whether a cross-prompt injection attack was detected in that resource;
- message IDs for the prompt and response pair, with a flag when a jailbreak attempt was detected;
- the model provider, and when the user picked a model, the model name;
- whether web search was used.

Interactions with Microsoft's own Copilots are in Audit (Standard); audit of non-Microsoft AI apps is billed pay-as-you-go and retained 180 days.

**Slack minimizes it.** Its stated design generates summaries on demand and avoids storing them where possible, keeps any stored data only as long as needed, and invalidates derived content when sources are removed.

Both choices are defensible and both have costs. A kept interaction history is discoverable in litigation, subject to legal holds and a retention schedule, and a privacy liability if prompts contain personal data; an ephemeral one can't answer "what did the assistant tell this employee before they sent that email". My default for a workplace product is the Microsoft shape with the Slack discipline: keep the interaction record and its source list under the customer's retention policies, never keep derived content longer than its sources, and let the customer, not the vendor, set the period. Retention & Legal Hold covers holds; Audit Logs covers what the event must contain; the playbook's [Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions) covers the generic record.

## Pricing: From Add-On to Bundle

The first generation of workplace assistants was priced as a per-seat add-on. By October 2026 most vendors had folded at least part of it into their plans:

- **Google** put Gemini and NotebookLM Plus into Workspace Business and Enterprise plans on January 15, 2025, ending the need for a separate add-on. Its example: a Business Standard customer who had paid $32 per user a month with the Gemini Business add-on would pay $14, $2 more than Workspace without Gemini had cost.
- **Slack** now lists advanced AI (summaries, AI search, recaps, file summaries) as part of Business+ at $15 per user a month billed annually ($18 monthly), with basic AI on Free and Pro and Flex Credits to raise limits.
- **Atlassian** includes Rovo in Standard, Premium and Enterprise cloud plans of Jira, Confluence and Jira Service Management, with 25, 70 and 150 credits per user a month respectively (250, 700 and 1,500 in the Teamwork and Service Collections) and metered overage.
- **Notion** puts full AI (agents, meeting notes, enterprise search) in Business at $20 per member a month and in Enterprise.
- **Microsoft** keeps Copilot as a separately licensed add-on to eligible plans, with Copilot Business for organizations of up to 300 users on Business plans, and includes it in Microsoft 365 E7 alongside Agent 365.

The shape that emerged is a bundled baseline plus metered usage: AI in the plan price, with credits, message limits or capacity packs above it. That moves the engineering problem from license assignment to metering, per user and pooled per organization, with caps the customer sets ([Metering & Rating](/books/hosting-and-cloud/metering-and-rating)). Seat and tier economics are Plans, Pricing & Seats.

## How to Build It

The core model supplies `members`, `items`, `grants` and `audit_events`. An assistant adds the interaction record with its sources, the workspace's AI policy, and discovery exclusions that keep content out of retrieval without changing grants:

```sql
CREATE TABLE ai_policies (                    -- the admin's assistant settings, dated
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id       UUID NOT NULL REFERENCES workspaces (id),
  enabled_for_group  UUID REFERENCES groups (id),  -- null: everyone licensed
  sources_allowed    TEXT[] NOT NULL,         -- 'messages', 'files', 'pages', 'web', connector keys
  models_allowed     TEXT[] NOT NULL,         -- 'first_party', 'provider_a', ...
  retention_days     INT,                     -- interaction records; null = follow workspace
  store_derived      BOOLEAN NOT NULL DEFAULT FALSE,  -- may summaries be persisted
  monthly_credit_cap BIGINT,
  set_by             UUID NOT NULL REFERENCES members (id),
  valid_during       TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (workspace_id WITH =, enabled_for_group WITH =, valid_during WITH &&)
);

CREATE TABLE discovery_exclusions (           -- hidden from retrieval, grants unchanged
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  container_id   UUID REFERENCES containers (id),
  item_id        UUID REFERENCES items (id),
  reason         TEXT NOT NULL,               -- 'overshared_pending_review', 'legal', ...
  set_by         UUID NOT NULL REFERENCES members (id),
  review_by      DATE NOT NULL,               -- exclusions are temporary by design
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((container_id IS NULL) <> (item_id IS NULL))
);

CREATE TABLE ai_interactions (                -- one prompt and its response(s)
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  member_id       UUID NOT NULL REFERENCES members (id),
  surface         TEXT NOT NULL,              -- 'chat', 'doc_editor', 'meeting', 'search'
  context_item_id UUID REFERENCES items (id), -- the document or channel in focus
  model_provider  TEXT NOT NULL,
  model_name      TEXT,
  prompt_ref      TEXT,                       -- content store key; null if not retained
  response_ref    TEXT,
  web_used        BOOLEAN NOT NULL DEFAULT FALSE,
  injection_flag  BOOLEAN NOT NULL DEFAULT FALSE,  -- detected in prompt or a source
  credits         INT NOT NULL DEFAULT 0,
  policy_id       UUID NOT NULL REFERENCES ai_policies (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delete_after    TIMESTAMPTZ                 -- from the policy, unless held
);

CREATE TABLE ai_interaction_sources (         -- what retrieval read, as the user
  interaction_id  UUID NOT NULL REFERENCES ai_interactions (id),
  item_id         UUID NOT NULL REFERENCES items (id),
  item_version_id UUID REFERENCES item_versions (id),
  grant_id        UUID REFERENCES grants (id),  -- the grant that allowed the read
  label           TEXT,                       -- sensitivity label at read time
  action          TEXT NOT NULL CHECK (action IN ('read', 'cited', 'blocked')),
  blocked_by      TEXT,                       -- policy or exclusion that blocked it
  PRIMARY KEY (interaction_id, item_id)
);
CREATE INDEX ai_interaction_sources_item_idx ON ai_interaction_sources (item_id);
```

Notes on the sketch:

- **Retrieval filters in this order:** the user's grants (from the permission service, never the index's cached copy alone), then `discovery_exclusions`, then label rules that forbid extraction; a candidate removed at any step can be logged as `blocked` without its content.
- **The grant that allowed each read is recorded.** `grant_id` turns "why did the assistant show her this" into a query whose answer is a specific share link or group membership, which is the evidence an oversharing review needs.
- **Derived content follows its sources.** When an item is deleted, the index of `ai_interaction_sources` by `item_id` finds every stored summary that used it; with `store_derived` off there's nothing to find, and that's the point.
- **Holds beat deletion.** `delete_after` comes from the policy, and a legal hold on the member (`hold_custodians`) suspends it, the same as for messages (Retention & Legal Hold).
- **Oversharing reports read the same tables.** Items frequently cited to members outside their owning team, through broad grants, are the ranked list a remediation project starts from.

## Auditing

- **Every interaction:** who asked, where, which model, whether web content or a detected injection was involved, and the list of sources with the grant behind each; the playbook's record shape ([Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions)) plus the source list.
- **Policy and exclusion changes,** with who made them; exclusions past their `review_by` date are a finding.
- **Label-protected content in responses:** any `cited` source whose label forbids extraction is an incident, not a statistic.
- **Credit consumption by user and organization,** against caps.
- **Retention and deletion of interaction records,** including holds applied, so the customer can show its assistant history follows its schedule.

## What This Means for the System You Build

- **Retrieve as the user, against live permissions,** and treat index permission lag as a disclosure window with a number on it.
- **Ship oversharing reports before the assistant:** audience-size views of broad grants, owner-run access reviews, and temporary exclusions with review dates.
- **State data use per model class:** what trains on what, whether aggregated, who sees raw data, how to opt out by setting.
- **Pass labels into the prompt path** so a label that forbids extraction stops quotation too.
- **Make derived content die with its sources,** and decide, per customer policy, whether interactions are kept as records.
- **Record which grant allowed each read;** it's the cheapest explanation you'll ever store.
- **Price a baseline in the plan and meter above it,** with organization-level caps the customer controls.

## References

**Vendor documentation**

- [Microsoft Learn: Data, privacy, and security for Microsoft Copilot](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy), Graph grounding at view permission, no foundation-model training, Semantic Index access boundary, sensitivity label usage rights, web search via Bing, third-party models, abuse-monitoring opt-out, stored interactions and retention, EU Data Boundary and the Anthropic exception, agent management and connected-experience controls
- [Microsoft Learn: License options for Microsoft Copilot](https://learn.microsoft.com/en-us/microsoft-365/copilot/copilot-license-options), eligible plans, Copilot Business up to 300 users and Microsoft 365 E7
- [Microsoft Learn: SharePoint Advanced Management overview](https://learn.microsoft.com/en-us/sharepoint/advanced-management), data access governance reports, site access reviews, restricted access control, restricted content discovery, ownership, change history and agent insights
- [Microsoft Learn: Prerequisites for SharePoint Advanced Management](https://learn.microsoft.com/en-us/sharepoint/sharepoint-advanced-management-prerequisites), availability with one Copilot license, the standalone add-on and E7
- [Microsoft Learn: Audit logs for Copilot and AI applications](https://learn.microsoft.com/en-us/purview/audit-copilot), `CopilotInteraction` records, `AccessedResources`, injection and jailbreak flags, model details, web search and pay-as-you-go audit of non-Microsoft AI apps
- [Google Workspace Admin Help: Generative AI in Google Workspace Privacy Hub](https://knowledge.workspace.google.com/admin/gemini/generative-ai-in-google-workspace-privacy-hub), no training without permission, no human review and permission-respecting retrieval
- [Slack: Privacy principles](https://slack.com/trust/data-management/privacy-principles), generative models not trained without opt-in, non-generative global models and the email opt-out
- [Slack: Pricing](https://slack.com/pricing), plan prices and AI features by plan
- [Atlassian: Rovo pricing](https://www.atlassian.com/software/rovo/pricing), inclusion in cloud plans, credits per user and overage billing
- [Atlassian Support: Atlassian MCP server](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/), Rovo's Teamwork Graph and permission-respecting access
- [Notion: Pricing](https://www.notion.com/pricing), plan prices, AI features and connectors by plan
- [Notion Help: Notion AI security practices](https://www.notion.com/help/notion-ai-security-practices), no training, provider retention by plan and zero data retention on Enterprise
- [Glean: Security](https://www.glean.com/security), permission checks on every read and write
- [Anthropic: Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms), no training on customer content

**Engineering write-ups**

- [Slack Engineering: How we built Slack AI to be secure and private](https://slack.engineering/how-we-built-slack-ai-to-be-secure-and-private/), escrow VPC hosting, no fine-tuning, stateless retrieval, user permissions, ephemeral outputs and derived-content invalidation

**Announcements and reporting**

- [Google Workspace blog: The best of Google AI, now included in Workspace Business and Enterprise plans (January 15, 2025)](https://workspace.google.com/blog/product-announcements/empowering-businesses-with-AI), Gemini included in plans and the $32 to $14 example
- [TechCrunch: Slack under attack over sneaky AI training policy (May 17, 2024)](https://techcrunch.com/2024/05/17/slack-under-attack-over-sneaky-ai-training-policy/), the privacy principles dispute and Slack's response
