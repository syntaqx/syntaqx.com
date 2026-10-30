+++
title = "AI Agents, Connectors & MCP"
description = "Agents acting in workspaces, vendor MCP servers, MCP authorization, agent identity in Entra, consent and scopes, prompt injection via shared content, and audit."
category = "Workplace & Collaboration Industry"
order = 2045
part = "Search, Integrations and AI"
tags = ["ai-agents", "mcp", "oauth", "prompt-injection", "agent-identity"]
+++

An assistant answers; an agent acts. It files the Jira issue, updates the Confluence page, posts the status in the channel, moves the ticket to "waiting on customer", schedules the follow-up. In 2026 agents reach a workspace by two roads. The suite's own agents run inside it: Copilot Studio agents and built-in Teams agents in Microsoft 365, Rovo agents in Atlassian, agents added to Slack as teammates, Agentforce agents built in Salesforce and brought into Slack. Outside agents connect through the Model Context Protocol: a person's Claude, Cursor, Codex or Perplexity calls an MCP server that Atlassian, Notion, Linear, Asana or Slack now hosts, and acts in the workspace with that person's permissions.

Everything hard about apps ([Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces)) applies, with two additions. The agent decides at runtime which tools to call, so what it will do isn't fixed at install time the way an app's code is. And it reads content written by other people, any of which can carry instructions; an agent that can read a public channel, a private document and send a message has everything an attacker needs. The customer's admin holds the controls that matter: which agents and MCP clients are allowed, whose identity each one acts under, which tools need a human's confirmation, and what the audit log says afterward. This chapter covers the agents on each platform, the vendors' MCP servers, MCP's authorization model, agent identity, consent and scopes, prompt injection through shared content, and auditing agent actions. Assistants that only answer are [AI Assistants Over Company Data](/books/workplace-and-collaboration/ai-assistants); the generic rules for agents are the playbook's [AI Agents](/docs/architecture/ai-agents) and [Agents, Tools and MCP](/docs/security/ai-security#agents-tools-and-mcp).

## How the Platforms Do It

As of October 2026:

| Platform | Its own agents | MCP server | Admin control over outside clients |
| --- | --- | --- | --- |
| **Microsoft 365** | Copilot Studio agents (each gets an Entra agent identity, creator recorded as sponsor); built-in Teams agents such as Facilitator, managed on their own admin page | Microsoft MCP Server for Enterprise (preview): read-only Entra directory queries, 100 calls per minute per user | Integrated apps page allows or blocks agents; Entra consent policy governs the client |
| **Atlassian** | Rovo agents in chat, automation and editors; custom agents in Rovo Studio | `mcp.atlassian.com/v2/mcp` over Jira, Jira Service Management, Confluence, Bitbucket, Goals, Projects and Loom; OAuth 2.1 or API token; calls consume Rovo credits | Admins verify agents and enable third-party MCP agents in Admin Hub |
| **Slack** | Agents as teammates in DMs and channels; Agentforce agents from Salesforce | `mcp.slack.com/mcp`; only directory-published or internal apps; confidential OAuth with user tokens, no dynamic client registration | Workspace admins approve and manage every MCP client integration |
| **Notion** | Notion Agent (Business and Enterprise) | Hosted remote server with OAuth, acting within the user's access | Owners manage clients in settings; restricting which clients members may connect requires Enterprise; the Admin API lists and revokes connections |
| **Linear** | (Not covered by the sources cited here) | `mcp.linear.app/mcp` over Streamable HTTP; OAuth 2.1 with dynamic client registration, or API keys; a read-only endpoint | API keys and OAuth scopes limit access |
| **Asana** | (Not covered by the sources cited here) | `mcp.asana.com/v2/mcp`; OAuth; the v1 beta server deprecated | Enterprise+ admins allow or block each client through app management |

The pattern: **the MCP server is the vendor's new API, and the client allowlist is the admin's new app approval.** Every vendor in the table hosts its own server rather than leaving it to the community, authenticates users with OAuth so the agent inherits the person's permissions, and has added (or is adding) a per-client admin control. The vendors differ on how open registration is: Linear accepts dynamic registration from any client, Slack accepts only registered apps and refuses dynamic registration outright.

## Agents Inside the Suite

The suites' own agents differ in where they live and whose permissions they use.

- **Microsoft.** Agents built in Copilot Studio each receive an agent identity in the customer's Entra tenant, with the user who created the agent recorded as its sponsor; their authentications are logged in Entra as AI agents. Built-in Teams agents such as Channel Agent and Facilitator aren't installed from the store and are managed on a dedicated "Built-in Teams agents" page, available to everyone, to chosen users or groups, or to no one. Agents generally are allowed or blocked in the Microsoft 365 admin center, where admins see each agent's permissions, terms and privacy statement, and users can use only agents their admin allows. Agent 365, licensed per user, is Microsoft's layer for running agents across Microsoft 365 and extending Entra's security features to them; it's included in Microsoft 365 E7.
- **Atlassian.** Rovo agents work in chat, in automation rules and in the Jira and Confluence editors, and can draw on Atlassian and connected third-party apps depending on their knowledge sources. They create or edit work items and pages "with your permission", and tools that act outside chat require the user's confirmation. Custom agents are built in Rovo Studio. Admins control who creates agents, verify agents, and decide whether third-party MCP agents are enabled.
- **Slack.** Agents behave like teammates: members message them directly or add them to channels. An agent's access depends on its app scopes; by default it sees its conversations with the user, and adding it to a channel extends access to that channel. Guests can't use AI apps or agents, and owners and admins control agents through app approval and Enterprise app management policies ([Admin Approval and Consent](/books/workplace-and-collaboration/apps-and-marketplaces#admin-approval-and-consent)).

An in-suite agent's advantage is that it's inside the suite's identity, audit and retention: its actions show in the same logs as everyone else's, under a typed identity. An outside agent through MCP shows up as the user, through a client the admin may never have reviewed, unless the platform does the work below.

## The Model Context Protocol

MCP is an open protocol for connecting a model-driven client (an assistant, an IDE, an agent framework) to servers that expose **tools** the model can call, **resources** it can read and **prompts** it can use. Anthropic created it; on December 9, 2025 the Linux Foundation formed the Agentic AI Foundation with MCP, Block's goose and OpenAI's AGENTS.md as founding projects and AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft and OpenAI as platinum members.

Versions are dates, marking the last backward-incompatible change. Two revisions matter for workplace servers:

- **2025-11-25** added OpenID Connect discovery for authorization servers, incremental scope consent through `WWW-Authenticate` challenges, OAuth Client ID Metadata Documents as the recommended way for clients to register, URL-mode elicitation (sending the user to a page to complete something out of band), and experimental tasks for long-running work.
- **2026-07-28**, the current revision as of October 2026, made the protocol stateless: the `initialize` handshake and protocol-level sessions are gone, every request carries its protocol version and client capabilities, and servers must implement `server/discover`. Server-initiated requests (elicitation, sampling, roots) became a multi-round-trip pattern in which the server returns an `input_required` result and the client retries with answers. Tasks moved to an official extension, list results carry cache lifetimes, Dynamic Client Registration was deprecated in favor of Client ID Metadata Documents, and clients must validate the authorization server's `iss` parameter per RFC 9207 when present.

Statelessness is what a large multi-tenant SaaS wanted: any server instance can handle any request, with no session to pin or hijack, and per-request identity is the only identity. The deprecation of dynamic registration is what workplace admins wanted: a client is identified by an HTTPS URL that publishes its name and redirect URIs, which an authorization server can show on a consent screen and put on an allowlist.

## MCP Authorization

MCP's authorization rules are OAuth 2.1 with the gaps closed. A protected MCP server is an OAuth resource server; the client is an OAuth client acting for a user; the authorization server can be the vendor's own identity system.

- **Discovery.** The server must publish OAuth Protected Resource Metadata (RFC 9728) naming its authorization servers, pointed to from a `401` response's `WWW-Authenticate` header or a well-known URI; the authorization server publishes RFC 8414 or OpenID Connect discovery metadata.
- **Registration.** Clients use, in order of preference, pre-registered credentials, a Client ID Metadata Document (the `client_id` is an HTTPS URL to a JSON document with the client's name and redirect URIs), or Dynamic Client Registration where still supported.
- **Audience.** Clients must send the RFC 8707 `resource` parameter naming the MCP server's canonical URI in authorization and token requests; servers must validate that each token was issued for them and reject any other.
- **No passthrough.** A server that calls an upstream API is a separate OAuth client to it and must not forward the token it received. The specification's security guidance lists why: passthrough bypasses the server's own controls, makes the downstream log show the wrong actor, and turns a stolen token into a proxy for exfiltration.
- **PKCE with S256** is mandatory for clients, which must refuse authorization servers that don't advertise it.
- **Least privilege by step-up.** Servers should challenge with the narrowest scope a request needs and ask for more with a `403 insufficient_scope` when a privileged tool is first used, instead of granting everything up front; publishing every scope as supported, or wildcard scopes, is listed as a common mistake.
- **Confused deputy.** An MCP server that fronts a third-party API with one static client ID must obtain the user's consent for each client before forwarding to the third party, or an attacker can register a client and ride the consent cookie from an earlier legitimate grant.

The workplace twist is who the consent screen is for. On the open web a user deciding whether a client may read their files is the whole decision. In a tenant, the user's grant is also the organization's data leaving through a client nobody reviewed, so the vendors put the admin back in front: Slack approves every MCP client, Notion Enterprise and Asana Enterprise+ let admins allow or block clients, Atlassian has admins enable third-party MCP agents, and Microsoft's consent policies govern which apps users may consent to at all. Client ID Metadata Documents make the allowlist practical: an admin can approve `https://claude.ai/...` or a vendor's client URL rather than an opaque, per-user registration.

## Agent Identity

The question an auditor asks of an agent's action is "who did this", and "the user's OAuth token" is an unsatisfying answer when no human chose that action. Microsoft Entra Agent ID is the most developed public answer. It gives agents their own identity type, distinct from both users and applications:

- **Not an app registration.** Service principals assume long-lived, known ownership and a managed lifecycle; agents may be created dynamically, live for minutes, or be created and destroyed thousands of times a day. Agent identities are built for bulk creation, uniform policy and retirement without orphaned credentials.
- **Not a person.** Agent identities don't use passwords or MFA. Where a system needs a user-shaped principal (a mailbox, a place in the org chart), an agent identity can be paired one-to-one with an agent user account, keeping the separation visible.
- **Autonomous or delegated.** An agent can act with rights granted directly to its identity (Graph permissions, directory roles, app roles) or on behalf of a user with the rights the user delegates.
- **Logged as an agent.** Microsoft's own conditional access optimization agent and every Copilot Studio agent authenticate with agent identities, and their activity is recorded as performed by an AI agent.

Agent ID is available to all Entra customers; extending Entra security features (conditional access, governance) to agents requires Agent 365.

The pattern generalizes: **an agent is a principal with a sponsor.** Its own identity makes its actions attributable and its access revocable without touching any human's account; its sponsor (the person or team accountable for it) is who gets asked when it misbehaves and who must re-justify it periodically. Delegated access is bounded by the user's own rights and ends with the user's session; autonomous access needs its own grants, its own review and an owner, like a service account ([Typed Actors](/docs/architecture/audit-trails#typed-actors)). Platforms without a separate agent identity can approximate it with a bot member per agent plus an "on behalf of" field on every action, which is what the [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model)'s `members.kind = 'bot'` and the sketch below do.

## Consent, Scopes and Confirmation

An agent's permission has three layers, and a workplace product needs all three:

- **The grant.** What the agent's token may do: OAuth scopes for MCP clients, app scopes for Slack agents, Graph permissions for Copilot Studio agents. Read-only variants are the cheapest control there is: Linear offers a read-only endpoint and a `read` scope, and Microsoft's MCP Server for Enterprise exposes only read tools (`microsoft_graph_get`, plus query suggestion and schema lookup) that honor the user's roles, the client's scopes and Graph throttling.
- **The tool policy.** Which tools the agent may call without asking. Rovo requires confirmation for tools that act outside chat; the MCP specification's step-up model asks for broader scopes only when a privileged tool is first used.
- **The human in the loop.** Confirmation dialogs work only while people read them. Invariant Labs' analysis of a GitHub MCP attack noted that tool-call confirmations were a weak safeguard because many users choose "Always Allow".

The rules that follow:

- **Default to read.** Grant write scopes per task or per tool, not per agent.
- **Separate drafting from sending.** An agent that writes a message for a person to send is a much smaller risk than one that sends; the confirmation is the human's own send button.
- **Bound the blast radius per session.** One repository, one project, one channel at a time, which is what Invariant recommended and what a scoped token enforces.
- **Never let "always allow" cover a new tool.** A tool added to a server after approval goes through confirmation again, the same rule as an app adding scopes ([How to Build It](/books/workplace-and-collaboration/apps-and-marketplaces#how-to-build-it)).

## Prompt Injection Through Shared Content

Collaboration tools are built on content written by many people, and every piece of it is input to an agent that reads it. The playbook's description of the problem applies exactly: an agent with access to private data, exposure to untrusted content and a way to communicate externally can be made to exfiltrate ([The Lethal Trifecta](/docs/security/ai-security#the-lethal-trifecta)), and no filter reliably stops it ([Prompt Injection Is Unsolved](/docs/security/ai-security#prompt-injection-is-unsolved)). In a workspace all three are present by default: public channels, shared documents, inbound email and issue trackers are untrusted content; the user's private channels and files are the data; and rendered links, messages, comments and pull requests are the way out. Three public cases:

- **Slack AI, August 2024.** PromptArmor showed that an attacker could create a public channel with only themselves in it and post an instruction there. When a victim asked Slack AI about a secret in their own private channel, retrieval pulled both messages into one context, the model followed the instruction and rendered a "click here to reauthenticate" link with the secret in the URL, and the answer's citations pointed only to the private channel. PromptArmor reported it on August 14, the same day Slack AI began ingesting uploaded files and connected drives, which widened the surface to documents. Slack's August 19 response was that public channel messages are visible to all members by design.
- **Microsoft 365 Copilot, June 2025.** CVE-2025-32711, published June 11, 2025 and scored 9.3 (critical) under CVSS 3.1, is described as "AI command injection in M365 Copilot" allowing an unauthorized attacker to disclose information over a network. Microsoft's own Copilot documentation now describes jailbreak and cross-prompt injection (XPIA) classifiers that try to block such inputs, and Copilot's audit records flag resources where an XPIA was detected.
- **GitHub MCP server, May 2025.** Invariant Labs showed an agent asked to review open issues on a public repository reading a planted issue, pulling data from the user's private repositories into context, and publishing it in a pull request on the public repository. Their point was that the flaw is architectural: the server did what the token allowed.

What follows for a workplace platform:

- **Break the trifecta per request.** When an agent's context includes content from outside the user's trust boundary (public channels with outside members, inbound email, external-organization channels, public repositories), restrict what it can write or where it can link in that turn.
- **Control egress from responses.** Rendering arbitrary links and images in an agent's output is an exfiltration channel; allowlist domains or show links as text in contexts that mixed untrusted content.
- **Label the provenance of retrieved text.** Retrieval knows which source each passage came from, and who could write to it; pass that to the model and to the policy layer, and log it.
- **Detection is a signal, not a defense.** Classifiers and flags like `XPIADetected` belong in the audit trail and in incident triage; the permission and egress limits are what actually contain an attack.
- **The admin needs a kill switch per agent and per client** that takes effect on the next request, not at token expiry.

Attacks on collaboration tools generally (consent phishing, token theft, external-access phishing) are [Threats & Incidents](/books/workplace-and-collaboration/threats-and-incidents).

## Auditing Agent Actions

The record of an agent's action needs more than a user's: which agent, which version, whose behalf, through which client, calling which tool with which arguments, approved by whom, reading which sources. The public implementations show the pieces:

- **Microsoft Purview** audit records for Copilot and agent interactions carry `AgentId`, `AgentName` and `AgentVersion`, distinguishing declarative from custom-engine Copilot Studio agents, alongside the resources accessed and the model used. Entra logs agent authentications as AI agents.
- **Microsoft MCP Server for Enterprise** requests run as Graph calls, so they appear in Microsoft Graph activity logs, filterable by the server's application ID.
- **Atlassian** meters every MCP call against Rovo credits, which makes per-call usage visible to the organization.
- **The MCP specification** names the audit failure to avoid: a server that passes a client's token through to an upstream API leaves the upstream log showing the wrong source and identity.

The record design itself is the playbook's ([Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions), [Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)); the workplace additions are the client and the sponsor. An action taken by "Alice via an MCP client" is a different event from "Alice", and the customer's security team will need to answer "which outside AI clients did our people connect, and what did they do through them" after the first incident.

## How to Build It

The [core model](/books/workplace-and-collaboration/workplace-business#the-core-data-model) supplies `members` (an agent can be a member with `kind = 'bot'`), `apps`, `app_installations`, `api_tokens` and `audit_events`. Agents add a registry with sponsors, tool grants, registered MCP clients with an admin decision, and a per-call action log:

```sql
CREATE TABLE agents (                          -- an agent as a principal with a sponsor
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  member_id        UUID UNIQUE REFERENCES members (id),  -- its own identity (kind 'bot')
  app_id           UUID REFERENCES apps (id),            -- built by a third party
  name             TEXT NOT NULL,
  version          TEXT NOT NULL,
  origin           TEXT NOT NULL CHECK (origin IN ('built_in', 'tenant_built',
                     'third_party', 'external_client')),
  access_mode      TEXT NOT NULL CHECK (access_mode IN ('delegated', 'autonomous')),
  sponsor_id       UUID NOT NULL REFERENCES members (id), -- accountable human
  status           TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused',
                     'retired', 'blocked')),
  review_by        DATE NOT NULL,              -- sponsors re-justify on a schedule
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agent_tool_grants (               -- which tools, and whether to ask first
  agent_id         UUID NOT NULL REFERENCES agents (id),
  tool             TEXT NOT NULL,              -- 'work_items.create', 'messages.send'
  effect           TEXT NOT NULL CHECK (effect IN ('read', 'write', 'send', 'admin')),
  confirmation     TEXT NOT NULL CHECK (confirmation IN ('never', 'always',
                     'when_untrusted_context')),
  container_ids    UUID[],                     -- null = wherever the principal can act
  granted_by       UUID NOT NULL REFERENCES members (id),
  granted_at       TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (agent_id, tool)
);

CREATE TABLE mcp_clients (                     -- outside clients, as the admin sees them
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  client_id        TEXT NOT NULL UNIQUE,       -- a metadata document URL, or issued ID
  registration     TEXT NOT NULL CHECK (registration IN ('metadata_document',
                     'preregistered', 'dynamic')),
  client_name      TEXT NOT NULL,              -- from the metadata document
  redirect_uris    TEXT[] NOT NULL,
  metadata_fetched_at TIMESTAMPTZ
);

CREATE TABLE mcp_client_policies (             -- the admin's allowlist, per workspace
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  mcp_client_id    UUID REFERENCES mcp_clients (id),  -- null: default for unlisted clients
  decision         TEXT NOT NULL CHECK (decision IN ('allowed', 'blocked',
                     'requires_approval', 'read_only')),
  max_scopes       TEXT[],
  decided_by       UUID NOT NULL REFERENCES members (id),
  valid_during     TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (workspace_id WITH =, mcp_client_id WITH =, valid_during WITH &&)
);

ALTER TABLE api_tokens                         -- tokens know their client and audience
  ADD COLUMN mcp_client_id UUID REFERENCES mcp_clients (id),
  ADD COLUMN audience      TEXT,               -- the RFC 8707 resource it was issued for
  ADD COLUMN agent_id      UUID REFERENCES agents (id);

CREATE TABLE agent_actions (                   -- every tool call, allowed or not
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  workspace_id     UUID NOT NULL REFERENCES workspaces (id),
  agent_id         UUID REFERENCES agents (id),
  on_behalf_of     UUID REFERENCES members (id),  -- null for autonomous actions
  mcp_client_id    UUID REFERENCES mcp_clients (id),
  tool             TEXT NOT NULL,
  arguments_hash   BYTEA NOT NULL,             -- full arguments in the content store
  untrusted_context BOOLEAN NOT NULL,          -- context mixed outside-written content
  decision         TEXT NOT NULL CHECK (decision IN ('executed', 'confirmed',
                     'declined', 'blocked_policy', 'blocked_scope')),
  confirmed_by     UUID REFERENCES members (id),
  result_item_ids  UUID[] NOT NULL DEFAULT '{}', -- what it created or changed
  audit_event_id   UUID REFERENCES audit_events (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX agent_actions_agent_idx ON agent_actions (agent_id, created_at);
CREATE INDEX agent_actions_client_idx ON agent_actions (mcp_client_id, created_at);
```

Notes on the sketch:

- **Token validation checks audience and client.** A request to the MCP endpoint is accepted only if `api_tokens.audience` matches the server's canonical URI, the token's `mcp_client_id` is allowed by the workspace's `mcp_client_policies`, and the scope covers the tool; a `read_only` decision strips write tools from `tools/list` for that client.
- **Untrusted context changes the policy.** Retrieval sets `untrusted_context` when any source in the request came from outside the user's organization or from a container open to everyone; tool grants with `when_untrusted_context` then require confirmation, and response rendering drops external links.
- **Every call is logged before it runs.** `agent_actions` is written with the decision, so blocked and declined calls are as visible as executed ones; executed calls link to the `audit_events` row the action produced on the item.
- **Sponsorship expires.** A job pauses agents past `review_by` until the sponsor renews them, and deactivating a sponsor (SCIM, offboarding) pauses their agents pending reassignment.
- **One switch per agent and per client.** Setting `agents.status = 'blocked'` or a client policy to `blocked` is checked on every request, so revocation doesn't wait for tokens to expire.

## Auditing

- **Every agent and client the workspace has allowed,** with sponsor, version, access mode and review date; agents with no active sponsor are a finding.
- **Every tool call,** with agent, client, the person on whose behalf, whether the context was untrusted, the decision and the confirmer; reported to the tenant by client so admins can see what each outside AI product did.
- **Consents and policy changes for MCP clients,** including scope step-ups and who approved them.
- **Injection signals:** detections, blocked egress in responses and declined confirmations, triaged like any other security event.
- **Agent authentications,** kept with the identity system's sign-in logs so an agent's access can be reviewed the way a service account's is.

## What This Means for the System You Build

- **Host your own MCP server** and treat it as a public API: OAuth 2.1, protected resource metadata, audience-bound tokens, no passthrough.
- **Give admins a client allowlist,** keyed on Client ID Metadata Document URLs, with a read-only option and a default for unlisted clients.
- **Give every agent an identity and a sponsor,** distinguish delegated from autonomous access, and log both the agent and the human.
- **Default agents to read, confirm writes,** and re-confirm any tool added after approval.
- **Assume shared content carries instructions:** track provenance in retrieval, restrict writes and links when untrusted content is in context, and keep injection detections in the audit trail.
- **Make revocation immediate** per agent and per client, independent of token lifetime.
- **Track the protocol's dated revisions;** the 2026 move to stateless requests and metadata-document registration changes both scaling and consent.

## References

**Specifications**

- [Model Context Protocol: Versioning](https://modelcontextprotocol.io/specification/versioning), date-based versions and 2026-07-28 as the current revision
- [Model Context Protocol: Key changes in 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/changelog), OpenID Connect discovery, incremental scope consent, URL elicitation, Client ID Metadata Documents and experimental tasks
- [Model Context Protocol: Key changes in 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/changelog), statelessness, `server/discover`, multi-round-trip requests, tasks as an extension, cache fields, deprecated Dynamic Client Registration and `iss` validation
- [Model Context Protocol: Authorization (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization), resource server role, RFC 9728 discovery, registration order, RFC 8707 audience binding, no passthrough, PKCE and step-up authorization
- [Model Context Protocol: Security best practices](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices), confused deputy, token passthrough risks, SSRF, session hijacking, local server compromise and scope minimization

**Vendor documentation**

- [Microsoft Learn: What are agent identities?](https://learn.microsoft.com/en-us/entra/agent-id/what-are-agent-identities), agent identities versus app and user identities, agent users, autonomous and delegated access, Copilot Studio sponsors and Agent 365
- [Microsoft Learn: Overview of Microsoft MCP Server for Enterprise](https://learn.microsoft.com/en-us/graph/mcp-server/overview), preview status, read-only tools, permission enforcement, the 100-calls-per-minute limit and Graph activity logs
- [Microsoft Learn: Manage your apps in the Microsoft Teams admin center](https://learn.microsoft.com/en-us/microsoftteams/manage-apps), built-in Teams agents and their availability controls
- [Microsoft Learn: Data, privacy, and security for Microsoft Copilot](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy), agent allow and block in Integrated apps and the jailbreak and XPIA classifiers
- [Microsoft Learn: Audit logs for Copilot and AI applications](https://learn.microsoft.com/en-us/purview/audit-copilot), agent fields and XPIA flags in audit records
- [Atlassian Support: Atlassian MCP server](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/), endpoint, products, OAuth 2.1 and API tokens, permissions and Rovo credits per call
- [Atlassian Support: Rovo agents](https://support.atlassian.com/rovo/docs/agents/), where agents run, confirmations, Rovo Studio and admin governance
- [Slack: MCP server](https://docs.slack.dev/ai/mcp-server), endpoint, eligible apps, confidential OAuth, no dynamic registration, scopes, tools and admin approval
- [Slack Help: AI agents and Agentforce in Slack](https://slack.com/help/articles/33076000248851-Agentforce-in-Slack), agents as teammates, scope-based access, admin controls and guest restriction
- [Notion Developers: Notion MCP](https://developers.notion.com/docs/mcp), hosted server, OAuth, user permissions and Enterprise client controls
- [Notion: Pricing](https://www.notion.com/pricing), Notion Agent on Business and Enterprise
- [Linear Docs: MCP server](https://linear.app/docs/mcp), endpoint, transport, OAuth 2.1 with dynamic registration, API keys and the read-only endpoint
- [Asana Developers: Using Asana's MCP server](https://developers.asana.com/docs/using-asanas-mcp-server), the v2 endpoint, OAuth, per-client admin controls and the v1 deprecation

**Research and advisories**

- [PromptArmor: Data exfiltration from Slack AI via indirect prompt injection](https://www.promptarmor.com/resources/data-exfiltration-from-slack-ai-via-indirect-prompt-injection), the attack, the August 14 file-ingestion change and Slack's response
- [CVE-2025-32711 record](https://cveawg.mitre.org/api/cve/CVE-2025-32711), the Microsoft 365 Copilot AI command injection, its 9.3 score and June 11, 2025 publication
- [Invariant Labs: GitHub MCP exploited](https://invariantlabs.ai/blog/mcp-github-vulnerability), the toxic agent flow, "Always Allow" confirmations and per-session limits

**Governance**

- [Linux Foundation: Formation of the Agentic AI Foundation (December 9, 2025)](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation), MCP's contribution and the founding members
