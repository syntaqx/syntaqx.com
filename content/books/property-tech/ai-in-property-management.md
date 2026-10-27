+++
title = "AI in Property Management"
description = "AI agents for leasing, residents, maintenance, accounting and collections: builders, automation levels, audit trails, owner cost allocation and the law."
category = "Property Tech Industry"
order = 1737
part = "Running the Platform"
tags = ["property-tech", "ai", "agents", "governance", "fair-housing", "compliance"]
+++

Every suite now sells AI agents that do property management work: answering prospects at midnight, chasing a missing pay stub, triaging a leak, keying an invoice, reminding a resident about rent, drafting a renewal. The vendors package them as tiers, marketplaces and builders, and describe them in levels of autonomy. What makes property different from other industries' agents is the record they act on. An agent's answer to a prospect is a fair housing statement, its collections text is a debt collection communication, its screening summary feeds a consumer report decision, its price quote is evidence in a rent cap or antitrust case, and its cost lands on an owner's statement under a management agreement that probably doesn't mention it. This chapter covers what the platforms ship, how to govern agents across a portfolio, how to allocate their cost, and the law that reaches them, as of October 2026.

The engineering of an agent (tools rather than database access, decisions in code, identity before account actions, emergencies that skip the model, handoff, evals, audit) is in [AI Agents in the Product](/docs/architecture/ai-agents), and scored decisions are in [Automated Risk Decisions](/docs/architecture/risk-scoring). Agents for single functions are described where the function lives: leasing in [Leasing Contact Centers and AI Leasing Agents](/books/property-tech/leads-crm-and-tours#leasing-contact-centers-and-ai-leasing-agents), residents in [AI Resident Agents](/books/property-tech/resident-experience#ai-resident-agents), screening in [AI Scores: Decision Support, Not Decision-Maker](/books/property-tech/applications-and-screening#ai-scores-decision-support-not-decision-maker). This chapter is the layer across them.

## How the Platforms Do It

| Vendor | Agents | Builder and marketplace | Governance as described |
| --- | --- | --- | --- |
| **AppFolio** | "Realm-X Performers are AI agents that take action, own outcomes, and drive results" | Not published | Not published |
| **EliseAI** (specialist) | Leasing, resident management, maintenance, renewals and delinquency | Not published | Not published |
| **Entrata** | Leasing, renewals, payments and maintenance agents; "100+ Native Agents" on its homepage; Autonomous Lease Progression moves prospects "from guest card to signed lease" | OXP Studio ("Upload company documents into the system to train your AI agents"; "Your SOPs become the AI's operating manual"); Agent Studio in Entrata Pro | AI Admin: "an exportable audit trail of AI interactions, including the model used, the sources cited, and the reasoning," model policies, approvals, and AI costs "by group, property, and owner" |
| **MRI Software** | Agora Intelligence and Agora Orchestrator (June 2026) | Agents "from a pre-built catalog refined across the MRI client base" | Agent actions "fully logged and traceable" |
| **RealPage** | Lumina agents for leasing, residents, operations, facilities, finance, analytics and spend, "co-developed with OpenAI" | Not published | "Five Principles of Trusted AI for Rental Housing," including that "every recommendation is designed to show its work" and "a person is always accountable for the decisions AI supports" |
| **Rent Manager** | Orion AI, "a set of tools designed to help you and your team be more agile and productive" | Not published | Not published |
| **ResMan** | An AI resident assistant; "Urgent issues can be escalated to the appropriate on-call staff based on property rules" | Not published | Not published |
| **Yardi** | "AI agents across leasing, resident services, maintenance and accounting through Virtuoso Enterprise for multifamily" (June 2026) | Virtuoso Marketplace, "a curated library of expert-built agents," and Virtuoso Composer, "a no-code builder that allows clients to design and test their own agents" (September 2025) | MCP connectors whose access "follows existing user permissions" |

Three patterns stand out. **Agents follow the org chart:** every suite sells agents named after roles (leasing agent, resident services, maintenance coordinator, accountant), because operators buy them to absorb work, and the governance question is the same as for any new hire: what may it do alone, and who checks it. **Builders turn SOPs into agents:** Entrata's Agent Studio "lets operators set up agents using their own standard operating procedures, voice, and approval rules," and Yardi's Composer and MRI's catalog do similar work, which moves agent design from the vendor to the operator and makes the operator responsible for what its agents say. **Governance is the product:** audit trails, model choice, approvals and cost reporting are what the premium tiers sell, and RealPage's principles and Entrata's AI Admin are the closest thing the industry has to a published standard.

## Agents by Function

Each function has a different failure mode, and each has an owning chapter for its rules:

| Function | What agents do | What can go wrong | Rules in |
| --- | --- | --- | --- |
| **Leasing** | Answer leads on every channel, quote, schedule tours, take applications, chase documents, progress the lease | Steering, inconsistent answers, stale prices, undisclosed bots, unconsented texts and AI voice calls | [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours), [Fair Housing](/books/property-tech/fair-housing) |
| **Screening support** | Collect application data, explain criteria, summarize documents, flag fraud | A model deciding; unexplainable adverse action | [Applications & Screening](/books/property-tech/applications-and-screening) |
| **Pricing** | Recommend rents and renewal offers, explain drivers | Competitors' nonpublic data, asymmetric bounds, offers above a cap | [Revenue Management & Pricing](/books/property-tech/revenue-management) |
| **Resident services** | Answer questions, take requests, book amenities, send reminders | Acting without verifying identity, waiving fees, missing an accommodation request | [Resident Experience](/books/property-tech/resident-experience) |
| **Maintenance** | Intake, triage, troubleshooting, scheduling, vendor dispatch | Treating an emergency as routine; entering without notice | [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders) |
| **Accounting** | Extract invoices, code to GL, match, reconcile, flag exceptions | Paying a changed bank account; coding to the wrong owner | [Vendors, Procurement & Payables](/books/property-tech/vendors-and-payables), [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting) |
| **Collections** | Balance inquiries, late notices, payment plans | Debt collection law, collection-agency licensing, notices that are legal steps | [Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction) |
| **Analytics** | Answer questions about the portfolio in plain language, summarize performance, rank the signals most likely to move NOI | Answers from a different definition than the owner's report; data outside the user's grants | [Operating Metrics](/books/property-tech/operating-metrics), [Platform Architecture](/books/property-tech/platform-architecture#users-roles-and-grants) |
| **Renewals** | Forecast intent, send offers, negotiate terms | Offers outside the cap or notice window; inconsistent concessions | [The Lease](/books/property-tech/the-lease), [Revenue Management & Pricing](/books/property-tech/revenue-management#renewal-pricing) |

Collections deserves a closer look, because the actor matters in law. Entrata's Payments AI "handles balance inquiries, late notices, and payment plans," and its 2024 acquisition of Colleen AI brought "AI-powered collections and renewal modules." Who counts as a debt collector under federal and state law turns on who is collecting and for whom ([Collections After Move-Out](/books/property-tech/delinquency-and-eviction#collections-after-move-out)), and state collection-agency licensing laws can reach software vendors: Entrata's S-1 discloses a putative class action in Maryland alleging that it lacks a license under the Maryland Collection Agency Licensing Act. My rule: an agent that sends collection messages runs under the collection rules for whoever the law says is collecting, which [Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction) resolves per property, and a notice that starts a legal clock (a pay-or-quit, a CARES Act notice) is generated by the rules engine and approved by a person, never written by a model.

## Marketplaces and Builders

When the operator builds the agent, the operator owns its behavior. An agent assembled in a no-code builder from a property's SOPs is configuration: a prompt, a set of tools, a knowledge base, approval rules and a channel, and it should be managed like any other configuration that can cost money or break the law.

- **Versions and owners.** Every agent has a named owner at the operator, a version for each change to its instructions, tools or knowledge, and a changelog. A behavior change traced to "someone edited the SOP" needs the edit.
- **Tools are the permission boundary.** What an agent can do is the list of tools it's given, each with its own validation and limits ([Tools, Not Database Access](/docs/architecture/ai-agents#tools-not-database-access)). An agent built from an SOP that says "waive the late fee for good residents" can't waive anything unless it has a fee-waiver tool, and that tool enforces the policy in code.
- **Evals before publish.** A new version runs against the operator's test conversations and the platform's fair housing and legal test set (paired prompts that differ only in a protected characteristic or its signal, accommodation requests phrased indirectly, emergencies described in a resident's words) before it reaches a property ([Evals](/docs/architecture/ai-agents#evals)).
- **Marketplace agents are vendors.** An agent from a marketplace, whether the platform vendor's or a third party's, comes with its publisher, version and terms, and the operator decides which properties run it, the same way it consents to an integration ([Platform Architecture](/books/property-tech/platform-architecture#integration-models)).
- **Knowledge has provenance.** A knowledge base built from uploaded documents can include an old fee schedule, a superseded pet policy or another property's rules. Each source document carries its property scope and effective dates, and the agent answers fees, prices and policies from tools that read live data, never from uploaded text.

## Automation Levels

Entrata's homepage describes five levels of autonomy, "L1-Generative assistance," "L2-Rules-based orchestration," "L3-Scalable processing," "L4-Interactive agents" and "L5-Adaptive self-improvement," with "L1–L3 augmentation · L4–L5 autonomous," and promises that every workflow "runs at the level of autonomy you choose." That's a vendor's scale, and the useful idea in it is that autonomy is a setting per workflow, not a property of the product.

My scale is about who decides, because that's what law and owners ask:

| Level | The agent | A person | Fits |
| --- | --- | --- | --- |
| **Suggest** | Drafts or recommends | Decides and acts | Screening summaries, adverse action drafts, accommodation responses, eviction steps |
| **Draft for approval** | Prepares the action | Approves, edits or rejects | Notices, fee waivers above a limit, vendor bank changes, payment plans outside policy |
| **Act within limits** | Acts when every policy check passes, escalates otherwise | Reviews samples and exceptions | Tour scheduling, routine work orders, invoice coding below a threshold, standard reminders |
| **Act and report** | Acts and records | Reviews reports | Answering availability and fee questions from live data, status updates |

Three rules sit on top. **Some actions have a ceiling.** Anything that denies housing, starts a legal clock, decides an accommodation, moves money to a new destination or changes a lease is never above "draft for approval," whatever the operator configures, because each is a decision the law assigns to the operator with a record behind it. **Levels are per workflow and per property.** A property in a jurisdiction with an ADMT law (below) may run a workflow at a lower level than its neighbor, and the setting is data with an owner and a date. **"Adaptive self-improvement" is a change, not a level.** An agent that changes its own behavior from outcomes changes what it says to protected classes; my rule is that learning produces a candidate version that goes through the same evals and approval as a human edit.

![How an agent's proposed action is gated. Agent proposes an action; a decision asks whether it is a ceiling action, listed at the left as deny housing, start a legal clock, decide an accommodation, move money to a new destination, or change a lease. Yes takes the accented path to draft for approval, where a person approves, edits or rejects. No goes to the level set per workflow and property, then a decision, checks pass?; yes leads to act within limits, and a dashed no leads to escalate, a review queue of exceptions. All three outcomes feed one audit record holding the agent, model, prompt version, data read and approver.](/diagrams/pt-ai-gate.svg "The ceiling is checked before the configured level, so no setting can lift those actions above draft for approval. Whatever happens, including refusals and escalations, lands in the same audit record.")

## Governance and the AI Audit Trail

The playbook's [Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions) defines the record: the agent as its own actor type with model and prompt version, every tool call including refusals, who approved, the transcript, and before and after. Entrata's AI Admin keeps "an exportable audit trail of AI interactions, including the model used, the sources cited, and the reasoning," and RealPage commits that "every recommendation is designed to show its work, including the inputs, guardrails, and confidence behind it" and that actions are "logged and auditable." Property adds:

- **The property and the owner on every record,** because the questions arrive by property (a fair housing complaint, a city's rent cap enforcement) and by owner (an audit of reimbursed costs).
- **Whom the agent acted for.** An agent answering a prospect acts for the operator; one answering a resident's question about their balance acts with that resident's verified identity; one used by a regional manager through an AI client acts with the manager's grants. The record names both identities ([Users, Roles and Grants](/books/property-tech/platform-architecture#users-roles-and-grants)).
- **The live data it read.** The price, availability, fee schedule and policy versions an answer came from, so "what was this prospect told about fees" is answered from the snapshot, not reconstructed ([The snapshot](/books/property-tech/listings-and-marketing#the-snapshot)).
- **Disclosure and language.** Whether the AI disclosure was given, in which version, and the conversation's language, because both are compliance facts.
- **Model routing.** Entrata says "Operators decide which models handle which work" and that "each job is matched to the model best suited to it," and its September 2026 announcement describes "requiring specific models for sensitive topics." Which model handled each step, under which routing policy version, is part of the record.

**Who watches.** An operator needs a named owner for AI governance, a review queue of escalations and refusals, sampled reviews of autonomous actions by workflow and property, and the fairness tests from [Disparate Impact and Algorithms](/books/property-tech/fair-housing#disparate-impact-and-algorithms) run on agent conversations with paired prompts. Entrata's ELI Console "surfaces items requiring human attention" in a daily queue; the design point is the same everywhere: autonomy without a queue of exceptions isn't governed.

**Measuring agents against staff.** Vendors sell the comparison as a feature: Entrata's 2025 "AI Control Center & Mission Control" promised "transparency into AI vs. human performance, enabling managers to measure ROI," and RealPage reports that its leasing agent resolves "roughly nine in ten routine prospect inquiries" for some customers. A comparison is only fair when both sides are measured on the same workload with the same definitions: response time, resolution, escalation rate, tours and leases per conversation, by property and channel ([The Leasing Funnel](/books/property-tech/operating-metrics#the-leasing-funnel)). My rule is that "resolved" counts only conversations nobody reopened within a set window, and that escalations the agent should have made and didn't (an emergency, an accommodation request) are counted as failures, not as resolutions.

## AI Cost Allocation to Owners

A third-party manager pays for AI tiers, usage and agents, and the properties it manages for owners use them. Whether that cost is the manager's overhead or an owner's expense depends on the management agreement, which [Reimbursements and Allocated Costs](/books/property-tech/owners-and-management-agreements#reimbursements-and-allocated-costs) models as `cost_allocations` with the agreement term that permits each one. The vendors expect the question: Entrata's AI Admin "tracks AI costs by group and model and, for third-party operators, by property and owner."

The mechanics:

- **Meter by property at the source.** Every agent interaction, tool call and model call records the property it served (or "corporate" when it served none) and its cost, so allocation is a sum, not an estimate. A conversation with a prospect who looked at three properties is split by the rule the operator chose and wrote down.
- **Allocate only what the agreement allows.** An AI leasing agent that replaces on-site leasing hours may be reimbursable where on-site payroll is; a corporate analytics agent usually isn't. The allocation row cites the term, and costs without one stay with the manager ([The Management Agreement](/books/property-tech/owners-and-management-agreements#the-management-agreement)).
- **Show it on the statement.** An owner sees AI cost as its own line with the basis (interactions, units, a flat tier share), not buried in "software" or "payroll," because an owner's auditor will ask, and a surprise line is a dispute.
- **Fees by results need definitions.** Vendors that price per lease, per resolved conversation or per collected dollar make the definition of "resolved" and "collected" a billing term, which the platform has to measure the same way the vendor does.

## Disclosure to Renters

The industry's own marketing shows the tension: Entrata's Leasing AI page says "Renters often mistake ELI for a real person." The law is moving the other way, and the single behavior that satisfies all of it is an agent that says it's an AI at the start, answers honestly when asked, and logs that it did ([Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai)). The rules that reach property, as of October 2026:

- **California** makes it unlawful to use a bot "with the intent to mislead the other person about its artificial identity" to incentivize a sale of goods or services, and a person isn't liable if they disclose that it's a bot, in a disclosure that is "clear, conspicuous, and reasonably designed to inform persons" (Business and Professions Code 17941). A leasing agent persuading a prospect to rent is the case it describes.
- **Utah** requires a supplier using generative AI to disclose that a person is "interacting with generative artificial intelligence and not a human" when asked in "a clear and unambiguous request," and regulated occupations to disclose up front in high-risk interactions; the act is repealed July 1, 2027 unless extended.
- **Colorado's** reenacted law requires notice at the point of interaction with automated decision-making technology used in consequential decisions, including housing, from January 1, 2027 (below).
- **The EU AI Act** requires providers to design systems so that "the natural persons concerned are informed that they are interacting with an AI system," from August 2, 2026 (Article 50).
- **AI voice is an artificial voice.** The FCC ruled in February 2024 that "calls made with AI-generated voices are 'artificial'" under the TCPA, so an agent placing outbound calls to prospects or residents needs the consent the TCPA requires ([Artificial and AI Voices](/docs/compliance/consumer-contact#artificial-and-ai-voices)). Recording and transcription settings belong to the operator; Entrata's ELI+ Orchestrator lets operators "control voice, language, recording, transcription, and handoffs at the company, property, or individual-agent level," and the recording announcement follows [Recording Calls](/docs/compliance/consumer-contact#recording-calls).

## Language Access

Agents made multilingual service cheap: Entrata's Leasing AI "can translate 30+ languages." Two property rules follow. **Same facts in every language:** fees, availability, criteria and policies come from the same structured data whatever the language, because a prospect told something different in Spanish than in English has a national origin claim, and the fair housing chapter's rule for translated content applies to agents ([Advertising](/books/property-tech/fair-housing#advertising)). **The language can create duties:** California requires a translation of a lease negotiated primarily in Spanish, Chinese, Tagalog, Vietnamese or Korean ([Translations](/books/property-tech/the-lease#translations)), and a lease negotiated in Spanish with an AI agent was negotiated in Spanish. The agent records the conversation's language on the guest card, and the lease packet rules read it.

For federally assisted housing, Title VI still requires meaningful access for people with limited English proficiency, but HUD's 2007 guidance on how to provide it was among the guidance documents HUD withdrew effective September 17, 2025 (notice published April 6, 2026). My default doesn't change with the guidance: offer the languages the property's residents speak, keep translations generated from the same facts, and offer a person in the resident's language for anything with legal effect ([Subsidized & Affordable Housing](/books/property-tech/affordable-housing)).

## Fair Housing, Screening and Pricing Risk

The owning chapters set the rules; the agent layer adds a few of its own:

- **Fair housing.** An agent that steers, answers differently by name or language, or treats an accommodation request as a pet question creates intent-based exposure, not only effects; agents are tested with paired prompts like human testers ([Disparate Impact and Algorithms](/books/property-tech/fair-housing#disparate-impact-and-algorithms)). HUD's May 2024 guidance said the Fair Housing Act applies to tenant screening and housing advertising when AI and algorithms are used. HUD withdrew its guidance on advertising through digital platforms effective September 17, 2025; the screening guidance doesn't appear on that withdrawal list, and HUD says it is "continuing to review its need for existing guidance." The statute applies either way.
- **Screening.** Language models don't decide. RealPage describes its AI screening as "a decision-support tool rather than an automated decision-maker," used with "processes for individualized review and reasonable accommodations"; that's the posture for every agent near an application ([AI Scores: Decision Support, Not Decision-Maker](/books/property-tech/applications-and-screening#ai-scores-decision-support-not-decision-maker)). An agent may collect, explain and chase; the decision is made in code against the criteria version, and the adverse action notice comes from the decision record.
- **Pricing.** An agent that quotes, negotiates or explains price reads the property's current quote and never invents a concession; an AI analytics agent asked "what are competitors charging" must not reach competitors' nonpublic data through a benchmark or a data share, which is the information exchange the antitrust cases are about ([The Antitrust Record, as of October 2026](/books/property-tech/revenue-management#the-antitrust-record-as-of-october-2026)). RealPage's principle that AI reasons "from industry-specific data and workflows rather than the open internet" is a sourcing promise; for pricing the sourcing has to be narrower still.

## State AI Laws and the EU AI Act, as of October 2026

General AI laws are arriving, and housing is named in most of them as a consequential or significant decision:

- **Colorado.** The 2024 Colorado AI Act (SB 24-205), with its developer and deployer risk management and impact assessment duties, was delayed to June 30, 2026 by SB25B-004 and then repealed and reenacted by SB26-189, signed May 14, 2026. The new law covers automated decision-making technology used to "make, guide, or assist" consequential decisions, housing included. From January 1, 2027, developers give deployers documentation; deployers give "clear and conspicuous notice" at the point of interaction; after an adverse consequential decision, the deployer explains the technology's role within 30 days; consumers may correct their data and request "meaningful human review and reconsideration"; records are kept three years. The attorney general enforces, with a cure period, and there is no new private right of action.
- **California.** The California Privacy Protection Agency's regulations on automated decisionmaking technology took effect January 1, 2026, and businesses using ADMT for significant decisions must comply from January 1, 2027. A "significant decision" includes one that results in "the provision or denial of... housing," but technology that provides or denies housing "based solely on the availability or vacancy of the housing or the successful receipt of payment for housing from the consumer is not making a significant decision." Covered businesses give a pre-use notice and honor opt-out and access requests. Screening and pricing tools that decide who gets a unit are in scope; an availability check isn't.
- **Federal preemption, attempted.** Executive Order 14365 (December 11, 2025) directs the Attorney General to establish an AI Litigation Task Force to challenge state AI laws, directs Commerce to identify "onerous" state laws, conditions certain federal funds, and asks for a legislative recommendation for a preemptive federal framework. An executive order doesn't itself preempt state law; as of October 2026 the state laws above stand, and a platform plans to them.
- **The EU AI Act.** Article 50's transparency duties apply from August 2, 2026. Annex III lists AI that evaluates "the creditworthiness of natural persons or establish[es] their credit score" as high-risk, with an exception for fraud detection; tenant screening isn't named in Annex III, but recital 58 describes AI deciding access to "essential services such as housing" as high-risk, and a screening model that scores credit is in point 5(b) on its own terms. The Digital Omnibus (Regulation (EU) 2026/1744, in force July 27, 2026) moved stand-alone Annex III obligations to December 2, 2027. [Outside the US](/books/property-tech/outside-the-us) covers the rest of the EU picture.

What these laws ask a platform to produce is the same set of records in every jurisdiction: which decisions an automated system made or assisted, the notice given before, the explanation after an adverse decision, the human review and its outcome, and the documentation the vendor gave the operator. Building those once, per decision type and property, is cheaper than building them per law.

## How to Build It

This chapter adds agents, their versions, their deployment per property and workflow, conversations, actions, usage metering and automated-decision notices to the model, on top of [Platform Architecture](/books/property-tech/platform-architecture#how-to-build-it): every agent acts as a `users` row with `actor_type = 'ai_agent'`, and usage feeds `cost_allocations` from [Owners & Management Agreements](/books/property-tech/owners-and-management-agreements#how-to-build-it).

```sql
CREATE TABLE ai_agents (                 -- an agent, whoever built it
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  agent_user_id    UUID NOT NULL REFERENCES users (id),  -- the identity it acts as
  function         TEXT NOT NULL CHECK (function IN ('leasing', 'screening_support',
                     'pricing', 'resident', 'maintenance', 'accounting', 'collections',
                     'renewals', 'analytics', 'other')),
  publisher        TEXT NOT NULL CHECK (publisher IN ('platform', 'operator', 'marketplace')),
  owner_user_id    UUID NOT NULL REFERENCES users (id),  -- the person accountable for it
  name             TEXT NOT NULL
);

CREATE TABLE ai_agent_versions (         -- every change to instructions, tools or knowledge
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  agent_id         UUID NOT NULL REFERENCES ai_agents (id),
  version          INT NOT NULL,
  instructions_ref TEXT NOT NULL,        -- the prompt and SOPs, stored and hashed
  tools            TEXT[] NOT NULL,      -- 'quote_price', 'schedule_tour', 'create_work_order'
  knowledge_refs   JSONB NOT NULL,       -- documents with property scope and effective dates
  model_policy     JSONB NOT NULL,       -- which model for which task; sensitive topics pinned
  eval_run_ref     TEXT,                 -- the eval results this version passed
  approved_by      UUID REFERENCES users (id),
  published_at     TIMESTAMPTZ,
  UNIQUE (agent_id, version)
);

CREATE TABLE ai_deployments (            -- which version runs where, at what level
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  agent_version_id UUID NOT NULL REFERENCES ai_agent_versions (id),
  property_id      UUID NOT NULL REFERENCES properties (id),
  workflow         TEXT NOT NULL,        -- 'tour_scheduling', 'invoice_coding', 'late_notice'
  automation_level TEXT NOT NULL CHECK (automation_level IN ('suggest', 'draft_for_approval',
                     'act_within_limits', 'act_and_report')),
  channels         TEXT[] NOT NULL,      -- 'sms', 'email', 'voice', 'chat', 'portal'
  languages        TEXT[] NOT NULL,      -- BCP 47
  valid_during     TSTZRANGE NOT NULL,
  set_by           UUID NOT NULL REFERENCES users (id),
  EXCLUDE USING GIST (property_id WITH =, workflow WITH =, valid_during WITH &&)
);

CREATE TABLE workflow_level_ceilings (   -- platform-wide: the most any deployment may do
  workflow         TEXT PRIMARY KEY,     -- 'adverse_action', 'accommodation_decision',
                                         -- 'legal_notice', 'vendor_bank_change', 'lease_change'
  max_level        TEXT NOT NULL CHECK (max_level IN ('suggest', 'draft_for_approval',
                     'act_within_limits', 'act_and_report'))
);

CREATE TABLE ai_conversations (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  agent_version_id UUID NOT NULL REFERENCES ai_agent_versions (id),
  property_id      UUID REFERENCES properties (id),     -- null for corporate work
  on_behalf_of_user_id UUID REFERENCES users (id),      -- the user it acted for, if any
  counterpart_person_id UUID REFERENCES people (id),    -- prospect, resident, guarantor
  guest_card_id    UUID REFERENCES guest_cards (id),
  lease_id         UUID REFERENCES leases (id),
  channel          TEXT NOT NULL,
  language         TEXT NOT NULL,
  disclosed_at     TIMESTAMPTZ,          -- when the AI disclosure was given
  disclosure_version TEXT,
  identity_verification TEXT,            -- 'none', 'session', 'otp', 'staff_confirmed'
  transcript_ref   TEXT NOT NULL,
  recording_ref    TEXT,
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  handed_off_to    UUID REFERENCES users (id)
);

CREATE TABLE ai_actions (                -- every tool call, including refusals
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  conversation_id  UUID REFERENCES ai_conversations (id),
  deployment_id    UUID NOT NULL REFERENCES ai_deployments (id),
  property_id      UUID REFERENCES properties (id),
  tool             TEXT NOT NULL,
  input            JSONB NOT NULL,
  result           TEXT NOT NULL CHECK (result IN ('done', 'drafted', 'refused',
                     'escalated', 'failed')),
  policy_checks    JSONB NOT NULL,       -- each rule and whether it passed
  data_snapshot_refs JSONB,              -- price quote, fee terms, policy versions read
  model            TEXT NOT NULL,
  approved_by      UUID REFERENCES users (id),          -- for drafted actions
  approved_with_edits BOOLEAN,
  subject_type     TEXT,
  subject_id       UUID,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_usage (                  -- metered cost, by property, for allocation
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  agent_id         UUID NOT NULL REFERENCES ai_agents (id),
  property_id      UUID REFERENCES properties (id),     -- null: corporate
  business_date    DATE NOT NULL,
  unit             TEXT NOT NULL,        -- 'conversation', 'model_tokens', 'tier_share'
  quantity         NUMERIC NOT NULL,
  cost             BIGINT NOT NULL,      -- minor units
  currency         CHAR(3) NOT NULL,
  UNIQUE NULLS NOT DISTINCT (tenant_id, agent_id, property_id, business_date, unit)
);

CREATE TABLE automated_decision_notices ( -- pre-use notices, adverse explanations, reviews
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID NOT NULL REFERENCES properties (id),
  person_id        UUID NOT NULL REFERENCES people (id),
  decision_type    TEXT NOT NULL,        -- 'screening', 'pricing', 'renewal'
  decision_ref     UUID NOT NULL,        -- screening_decisions, renewal_offers, ...
  kind             TEXT NOT NULL CHECK (kind IN ('pre_use', 'adverse_explanation',
                     'opt_out_request', 'access_request', 'human_review_request',
                     'human_review_result')),
  rule_evaluation_id UUID REFERENCES rule_evaluations (id),  -- which law required it
  due_by           DATE,
  sent_at          TIMESTAMPTZ,
  reviewed_by      UUID REFERENCES users (id),
  content_ref      TEXT NOT NULL
);
```

Design decisions behind it:

- **An agent is a user,** so every write it makes passes through the same authorization, validation and audit as a person's, and its access is the intersection of its own grants and the user it acts for.
- **Versions are immutable and published with evals,** and deployments point at a version, so "which instructions were live at this property on this date" is a lookup.
- **Automation level is per property and workflow,** effective-dated with who set it, and a platform-wide ceiling per workflow that no deployment can exceed (`workflow_level_ceilings`, checked when a deployment is saved).
- **Actions keep refusals and drafts.** Refused and escalated tool calls are how bad instructions and missing permissions are found; drafted actions record the approver and whether they edited it.
- **Usage is metered by property at the source,** in the property's business date, so `cost_allocations` can bill an owner only what its properties used, under the agreement term that allows it.
- **Automated-decision notices are rows,** tied to the decision and to the rule evaluation that required them, so Colorado's 30-day explanation and California's access request are deadlines the platform tracks.

## Auditing

The records that answer complaints, owners, auditors and regulators:

- **What the agent said and did.** Conversations with transcripts, the disclosure given, the language, every tool call with inputs, results and policy checks, and the data snapshots behind prices and fees.
- **Which version, where, at what level.** Agent versions with instructions, tools, knowledge sources, model policy, eval results and approver; deployments by property and workflow with their automation level over time.
- **Who approved.** Drafted actions with their approver and edits; escalations and handoffs with the person who took them.
- **Fairness testing.** Paired-prompt tests of agents by version, with results and actions taken, next to the fairness tests of screening and pricing models ([Fair Housing](/books/property-tech/fair-housing#auditing)).
- **Cost to owners.** Metered usage by property and agent, the allocation run, the agreement term cited, and the owner statement line.
- **Automated-decision duties.** Notices, explanations, opt-outs, access requests and human reviews with their deadlines and outcomes.

Retention follows the record the conversation touched: a leasing conversation that ended in a denial is part of the application file; a maintenance conversation is part of the work order ([Retention and Legal Holds](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds), [Recordings and Transcripts Are Personal Data](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data)).

## What This Means for the System You Build

- **Make every agent a user** with its own identity, acting with the intersection of its grants and the user it serves.
- **Treat operator-built agents as versioned configuration** with an owner, tools as the permission boundary, knowledge with property scope and dates, and evals before publish.
- **Set automation levels per workflow and property,** under platform ceilings that keep denials, legal notices, accommodations, payment destinations and lease changes at draft-for-approval or below.
- **Record every action with its property, owner, model, data snapshot and approver,** refusals included.
- **Meter AI cost by property at the source** and allocate to owners only under an agreement term, as its own statement line.
- **Disclose that it's an AI, every time,** log the disclosure, and get TCPA consent before AI voice calls.
- **Answer the same facts in every language** and let the conversation's language drive lease translation duties.
- **Keep models out of decisions:** screening, pricing and collections rules decide in code; agents collect, explain and draft.
- **Build ADMT notices, explanations and human review once,** per decision type and property, for Colorado, California and the EU.

## References

**Statutes and regulations**

- [Colorado SB26-189: Automated Decision-Making Technology](https://leg.colorado.gov/bills/sb26-189), repeal and reenactment of SB 24-205, housing as a consequential decision, notices, explanations, human review and the January 1, 2027 start (signed May 14, 2026)
- [Colorado SB25B-004](https://leg.colorado.gov/bills/sb25b-004), delay of SB 24-205's requirements to June 30, 2026 (signed August 28, 2025)
- [California Privacy Protection Agency: Regulations approved (September 23, 2025)](https://cppa.ca.gov/announcements/2025/20250923.html), effect January 1, 2026 and ADMT compliance from January 1, 2027
- [California Privacy Protection Agency: Approved regulation text (PDF)](https://cppa.ca.gov/regulations/pdf/ccpa_updates_cyber_risk_admt_appr_text.pdf), significant decisions including housing, the availability and payment exclusion, pre-use notice, opt-out and access
- [California Business and Professions Code 17941](https://california.public.law/codes/ca_bus_and_prof_code_section_17941), bots that mislead about their artificial identity and the disclosure safe harbor
- [Utah SB 226 (2025), enrolled (PDF)](https://le.utah.gov/Session/2025/bills/enrolled/SB0226.pdf), disclosure of generative AI on a clear request, regulated occupations, repeal July 1, 2027
- [The White House: Ensuring a National Policy Framework for Artificial Intelligence](https://www.whitehouse.gov/presidential-actions/2025/12/eliminating-state-law-obstruction-of-national-artificial-intelligence-policy/), Executive Order 14365: the AI Litigation Task Force, the Commerce evaluation, funding conditions and a federal framework (December 11, 2025)
- [EU AI Act: Article 50](https://artificialintelligenceact.eu/article/50/), informing people they're interacting with an AI system, from August 2, 2026
- [EU AI Act: Annex III](https://artificialintelligenceact.eu/annex/3/), creditworthiness and credit scoring of natural persons as high-risk, with the fraud detection exception
- [EU AI Act: Recital 58](https://artificialintelligenceact.eu/recital/58/), essential services such as housing
- [National Law Review: EU Digital Omnibus on AI enters into force](https://natlawreview.com/article/eu-digital-omnibus-ai-enters-force), Regulation (EU) 2026/1744 in force July 27, 2026 and Annex III obligations moved to December 2, 2027 (July 31, 2026)
- [FCC: AI-generated voices in robocalls are artificial under the TCPA](https://docs.fcc.gov/public/attachments/DOC-400393A1.txt), the declaratory ruling (February 8, 2024)

**Agencies**

- [HUD: Guidance on the Fair Housing Act and AI in tenant screening and advertising](https://archives.hud.gov/news/2024/pr24-098.cfm), the May 2, 2024 announcement
- [Federal Register: HUD withdrawal of guidance documents (PDF)](https://public-inspection.federalregister.gov/2026-06624.pdf), withdrawal effective September 17, 2025, including the digital platform advertising guidance and the 2007 LEP guidance, and FHEO's continuing review (published April 6, 2026)
- [Federal Register: HUD Final Guidance on Limited English Proficient Persons (2007)](https://www.govinfo.gov/content/pkg/FR-2007-01-22/html/07-217.htm), reasonable steps to ensure meaningful access, since withdrawn

**Filings**

- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), the Maryland collection agency licensing class action

**Platforms**

- [Entrata](https://www.entrata.com/), automation levels L1 to L5 and 100+ native agents
- [Entrata: Entrata introduces Entrata Pro at Summit 2026](https://www.entrata.com/press/entrata-introduces-entrata-pro-at-summit-2026-giving-new-ai-capability-across-the-entrata-os), ELI Console, Agent Studio, AI Admin with model policies, approvals and cost by property and owner, Forge (September 15, 2026)
- [Entrata: Entrata Pro puts AI to work without leaving the operating system](https://www.entrata.com/press/entrata-pro-puts-ai-to-work-without-leaving-the-operating-system), the exportable audit trail, model routing, cost by group, property and owner, Agent Studio and ELI+ Orchestrator controls (October 6, 2026)
- [Entrata: OXP Studio](https://www.entrata.com/products/oxp-studio), no-code automation, SOPs as the agents' operating manual, over 100 embedded agents
- [Entrata: Autonomous Lease Progression](https://www.entrata.com/products/autonomous-lease-progression), guest card to signed lease with tasks for staff
- [Entrata: Leasing AI](https://www.entrata.com/products/leasing-ai), 30+ languages and renters mistaking ELI for a person
- [Entrata: Payments AI](https://www.entrata.com/products/payments-ai), balance inquiries, late notices and payment plans
- [Entrata: Entrata acquires Colleen AI](https://www.entrata.com/press/entrata-acquires-colleen-ai), AI collections and renewal modules (June 20, 2024)
- [PR Newswire: Yardi launches Virtuoso AI Agents](https://www.prnewswire.com/news-releases/yardi-launches-virtuoso-ai-agents-to-deploy-ai-powered-workflows-302553702.html), Virtuoso Marketplace and Composer (September 11, 2025)
- [PR Newswire: Yardi delivers AI agents for every multifamily role and workflow](https://www.prnewswire.com/news-releases/yardi-delivers-ai-agents-for-every-multifamily-role-and-workflow-302799786.html), leasing, resident services, maintenance and accounting agents (June 15, 2026)
- [Mann Report: Yardi brings Yardi Matrix data to Claude](https://www.mannpublications.com/mannreport/2026/06/17/yardi-brings-yardi-matrix-data-to-claude/), connector access following user permissions (June 17, 2026)
- [RealPage: Lumina AI](https://www.realpage.com/platforms/lumina-ai/), the agent workforce co-developed with OpenAI
- [RealPage: RealPage introduces Lumina AI Suite](https://www.realpage.com/news/realpage-introduces-lumina-ai-suite/), the Five Principles of Trusted AI for Rental Housing, the AI Analytics Agent and Lumina Ascent's NOI signals, and the leasing agent resolving "roughly nine in ten routine prospect inquiries" (August 10, 2026)
- [Entrata: Entrata unveils AI-powered platforms at Summit 2025](https://www.entrata.com/press/entrata-unveils-ai-powered-platforms-at-summit-2025-bringing-autonomous-property-management-tm-closer-to-reality), AI Control Center & Mission Control comparing AI and human performance (October 3, 2025)
- [RealPage: Resident screening](https://www.realpage.com/apartment-marketing/resident-screening/), AI screening as decision support with individualized review
- [AppFolio: Realm-X Performers](https://www.appfolio.com/articles/performers), AI agents that take action
- [MRI Software: Agora Intelligence and Agora Orchestrator](https://www.mrisoftware.com/ca/news/mri-software-launches-agora-intelligence-and-agora-orchestrator-delivering-ai-powered-recommendations-and-workflow-execution-for-real-estate/), a pre-built agent catalog with logged, traceable actions (June 25, 2026)
- [ResMan: AI Resident Assistant](https://www.myresman.com/solutions/ai-resident-assistant/), escalation of urgent issues to on-call staff by property rules
- [Rent Manager: Orion AI](https://www.rentmanager.com/orion-ai-powering-the-next-generation-of-rent-manager/), AI tools for property teams (November 17, 2025)
- [EliseAI](https://www.eliseai.com/), leasing, maintenance, renewals and delinquency products
