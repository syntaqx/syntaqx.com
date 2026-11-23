+++
title = "AI in Advertising"
description = "Generative creative, automated campaign types, agentic buying protocols (AdCP, ARTF), AI disclosure rules for ads, and governing what the machines do."
category = "Advertising Industry"
order = 2973
part = "Running the Platform"
tags = ["advertising", "ai", "generative-ai", "agents", "regulation", "data-model"]
+++

Machine learning has priced ads for twenty years; what changed in 2023-2026 is that models now write them, assemble the campaigns that run them, and increasingly buy them. A platform's creative tools generate backgrounds, images, headlines, video and translated voiceovers from an advertiser's product; its automated campaign types decide the audience, the placements, the bids and which generated asset serves where, with the advertiser supplying a goal, a budget and some assets; and agents speaking new protocols discover inventory, negotiate and book media buys on behalf of buyers and sellers. Each of these moves a decision that a person used to make, and sign for, into software.

That is what makes the topic an engineering problem and not only a product one. A generated image is still the advertiser's ad, subject to the same deception law, platform policy and brand rules, and now possibly to a disclosure law of its own. An automated campaign still spends the advertiser's money, and the advertiser still needs to know where it went and why. An agent that books a media buy is acting under someone's authority, and the record has to show whose, within what limits, and who approved. This chapter covers generative creative and its controls, automated campaign types and what they delegate, agentic buying protocols (the Ad Context Protocol and IAB Tech Lab's Agentic Real Time Framework), the disclosure rules that apply to AI in ads, and governance; it extends `creatives` and `campaigns` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and the creative, review and change records other parts add. The models that price impressions are the previous chapter's, [Machine Learning for Ads](/books/advertising/machine-learning-for-ads).

Other chapters and volumes own adjacent ground. [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco) (in Ad Serving and Creative) owns creative versions, assets and dynamic creative; [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising) owns policy systems and enforcement; [Automated Bidding](/books/advertising/automated-bidding) owns the bid strategies inside automated campaigns; [Advertising Content Law](/books/advertising/advertising-content-law) owns deception, substantiation and regulated categories; [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads) owns political ad declarations. Commerce owns the advertiser's seat in automated campaigns ([Google: Shopping and Performance Max](/books/commerce/acquisition-and-attribution#google-shopping-and-performance-max), [Meta: Advantage+ Sales Campaigns](/books/commerce/acquisition-and-attribution#meta-advantage-sales-campaigns)), AI-generated product content ([AI in Commerce](/books/commerce/ai-in-commerce#disclosure-and-labeling)) and agents that shop ([Agentic & AI Shopping](/books/commerce/agentic-commerce)). User-Generated Platforms owns content provenance and the EU AI Act's transparency duties for platforms ([Provenance: C2PA and IPTC](/books/user-generated-platforms/ai-on-user-generated-platforms#provenance-c2pa-and-iptc), [The EU AI Act's Transparency Duties](/books/user-generated-platforms/ai-on-user-generated-platforms#the-eu-ai-act-s-transparency-duties)). The generic engineering of LLM features and agents is the playbook's [LLM Features](/docs/building-blocks/llm-features) and [AI Agents](/docs/building-blocks/ai-agents).

## How the Platforms Do It

As of November 2026, from the platforms' and standards bodies' own pages:

| Platform or body | Generative creative | Automation | Agents and protocols |
| --- | --- | --- | --- |
| **AgenticAdvertising.org** | | | Publishes the Ad Context Protocol: "the open protocol that lets AI agents discover, plan, buy, sell, and measure media across every channel"; "AdCP 3.2 is now generally available" |
| **Amazon Ads** | An image generator (October 25, 2023) that creates lifestyle images from a product's details; Amazon says that for a product shown in a lifestyle setting in a mobile Sponsored Brands ad, "click-through rates can be 40% higher compared to ads with standard product images" | | |
| **Google** | Performance Max: "Generative AI tools combine your assets and creatives to help generate engaging images and videos" | Performance Max, "a goal-based campaign type that allows you to access all Google Ads inventory" from one campaign; AI Max for Search "moving out of beta" (April 15, 2026), with automatically created assets and campaign-level broad match auto-upgraded "starting in September 2026" and Dynamic Search Ads from February 2027 | |
| **IAB Tech Lab** | | | Agentic Real Time Framework (ARTF) v1.0 final, v2.0 in discussion: agent services deployed as containers inside a host platform, with "an API which enables reliable, protected and private bidstream mutation" |
| **Meta** | Advantage+ creative features opted in or out one by one through `creative_features_spec` (`image_background_gen`, `image_uncrop`, `text_optimizations`, `translate_voiceover`, `video_auto_crop` and others); ads with AI-generated features are created `PAUSED` and previewed before activation | Advantage+ campaigns ([Social Advertising](/books/advertising/social-advertising) and Commerce cover them) | |
| **The Trade Desk** | | Kokai, "our most recent and major upgrade to our platform" | "Kokai Zuma, the latest release of Kokai", "bringing new agentic AI capabilities" (Q3 2026) |

Three things are common across them. Generation is a feature of the buying platform, applied to the advertiser's assets, usually with per-feature opt-in or opt-out. Automation consolidates channels and controls into fewer, goal-based campaigns, and the platforms move existing campaigns into them on a schedule. And agentic buying is arriving as protocols for agents to call platforms, not as a new auction.

## Generative Creative

What the platforms generate, by kind:

- **Variations of the advertiser's assets.** Backgrounds, crops and expansions to fit placements (Meta's `image_background_gen`, `image_uncrop`, `video_auto_crop`, `adapt_to_placement`), brightness and touch-ups, text overlays and animations.
- **New copy.** Headlines and descriptions written from the advertiser's text, landing page or product data, and "text optimizations" that choose among them per impression.
- **New imagery and video.** Lifestyle scenes from a product image (Amazon's generator), images and videos assembled from asset groups (Performance Max), short videos from still images.
- **Translation and voice.** `text_translation`, `image_text_translation` and `translate_voiceover` in Meta's feature list; dubbing by the platform rather than the advertiser's agency.

Each generated asset is a creative decision the advertiser didn't make, at the moment it serves, and possibly a different one for every impression. Four controls make that acceptable to a careful advertiser, and they are what the platform's system has to implement:

- **Per-feature consent, recorded.** Meta exposes each feature with an `enroll_status` of `OPT_IN` or `OPT_OUT`, notes that some are on by default ("Default is opt-in" for placement adaptation), and is retiring the bundled "standard enhancements" in favor of individual features. The record is per creative and feature, with who opted in and when.
- **Preview before serving.** Meta's API asks that ads with AI-generated features be created `PAUSED` and previewed before activation. A system that generates per impression can't show every variant, so the preview is a sample plus the rules the generator operates under (allowed claims, brand terms, forbidden subjects).
- **Generated assets are marked.** [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco#how-to-build-it)'s `creative_assets.origin` distinguishes `uploaded` from `platform_generated` and `platform_modified`, so the creative the advertiser approved and the one that served can be told apart. Provenance metadata goes with the file: Google said in September 2024 that its ad systems were "starting to integrate C2PA metadata", with the goal to "use C2PA signals to inform how we enforce key policies" over time, and the C2PA and IPTC mechanics are User-Generated Platforms' [Provenance: C2PA and IPTC](/books/user-generated-platforms/ai-on-user-generated-platforms#provenance-c2pa-and-iptc).
- **Generated creative goes through review like any other.** Policy review, regulated-category checks and claim substantiation apply to the output, not the input. A generator that writes "clinically proven" for a supplement has made a claim the advertiser must substantiate ([Advertising Content Law](/books/advertising/advertising-content-law)), and the review pipeline (`creative_reviews`) runs on each generated version before it serves, with automated checks for forbidden terms and numbers absent from the inputs. The playbook's rule is [Human Review Where Errors Are Costly](/docs/building-blocks/llm-features#human-review-where-errors-are-costly).

My rule: a platform may generate variations, but the claims, prices, offers, legal text and anything a law fixes come from the advertiser's records verbatim, never from the model. A generated headline may rephrase "free shipping on orders over $50"; it may not invent the threshold. Commerce applies the same rule to product content ([Product Content Generation](/books/commerce/ai-in-commerce#product-content-generation)).

## Automated Campaigns

An automated campaign type delegates most of a campaign's configuration to the platform in exchange for a goal. Performance Max is the clearest published example: one campaign serving across "YouTube, Display, Search, Discover, Gmail, and Maps", with "Smart Bidding" that bids "based on your conversion probability", audience signals that accelerate learning, and generated assets combined with the advertiser's. AI Max does the same within Search: "search term matching, text customization and final URL expansion". Meta's Advantage+ campaigns follow the same pattern, and The Trade Desk's Kokai brings the same direction to the open web.

What is delegated and what remains, as a system design:

| Decision | Delegated to the platform | What the advertiser keeps |
| --- | --- | --- |
| Audience | Targeting from signals and the platform's models | Audience signals as hints, exclusions, special-category restrictions |
| Placement and channel | All inventory the campaign type covers | Exclusions (brand exclusions, negative keywords, placement and content exclusions), channel reporting |
| Bids | The bid strategy, from conversion predictions | The goal (tCPA, tROAS), the budget, bid caps where offered |
| Creative | Assembly and generation from assets | Which assets, per-feature opt-outs, brand guidelines, asset approval |
| Measurement | Platform attribution | Conversion definitions and values, lift tests |

Two things follow for the platform building such a campaign type. **Controls must still be expressible as data.** Brand exclusions, negative keywords and placement exclusions are rows the delivery system enforces ([Search Advertising](/books/advertising/search-advertising), [Brand Safety & Suitability](/books/advertising/brand-safety-and-suitability)), and Google describes them as controls that "Prevent overlaps and block unwanted queries". An automated campaign that can't honor an exclusion isn't one an agency can put a regulated brand into. **Reporting has to explain what was delegated.** Advertisers lose line-level control and so need channel, placement, asset and search-term reporting to see where money went; Performance Max's reporting options include "Channel performance" for this purpose.

**Auto-upgrades are platform-initiated changes.** Google's schedule moves Dynamic Search Ads, automatically created assets and campaign-level broad match into AI Max, with the DSA date pushed to February 2027 in a June 11, 2026 update; Meta's Marketing API stopped allowing new campaigns through the legacy Advantage+ Shopping and App campaign APIs from v24.0 (October 8, 2025), and v25.0 (February 18, 2026) stopped allowing creation, duplication and updates of those campaigns, for every API version from May 19, 2026, in favor of the unified Advantage+ structure. Each such migration changes campaigns the advertiser configured, and [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms)' `change_events` records them with `actor_kind = 'platform'`, the job and its version, beside the advertiser's own edits. A migration that isn't in the change history is a performance change nobody can explain.

## Agentic Buying

An **agent** in advertising is software that takes actions in buying or selling systems on someone's behalf, using a model to decide what to do: find inventory that fits a brief, propose a media plan, book it, adjust it during flight, report. Until 2025 such automation went through each platform's own API; the new work is protocols that let any agent talk to any platform in one vocabulary. Two are public.

**The Ad Context Protocol (AdCP)** launched on October 15, 2025, with more than 20 companies signed on, including PubMatic, Optable, Scope3, Swivel, Triton Digital, Magnite, Kargo and Yahoo, "built on Anthropic's Model Context Protocol" and overseen by "a neutral working group rather than a single vendor"; the launch covered an Audience Activation Protocol and a Media Buy Protocol. It is now published by AgenticAdvertising.org, which states that "AdCP 3.2 is now generally available" (as of November 2026; the page gives no release date). Its documentation describes agents that "communicate over two transport protocols", MCP for AI assistants that invoke tools and A2A for direct agent-to-agent collaboration, with domain protocols for media buying, signals, creative, governance, accounts and brand identity. Its task names read like the core model of this volume: `get_products`, `create_media_buy`, `update_media_buy`, `sync_creatives`, `get_media_buy_delivery`, `get_signals`, `activate_signal`, `check_governance`, `get_plan_audit_logs`. On authority, it says that when a request "exceeds the agent's authority", the governance agent escalates it to a person: "your team approves, not the AI".

**IAB Tech Lab's Agentic Real Time Framework (ARTF)** works at a different layer. Its v1.0 is final and v2.0 is under discussion in Tech Lab's Agentic Task Force. ARTF defines agent services that run as containers inside a host platform (an exchange or a DSP) and are called by it during the auction, with "an API which enables reliable, protected and private bidstream mutation": identity resolution, deal or segment activation and pre-impression fraud detection are its example uses, each expressed as an "intent". The host keeps control of its data and service levels, and a provider can package an offering once for any compliant host. Where AdCP is an agent buying media over days, ARTF is a vendor's logic inside the bidstream in milliseconds.

The Trade Desk's Q3 2026 release describes "new agentic AI capabilities" in Kokai Zuma and notes that "Olyzon launched an agentic orchestration platform, with agents live across DSPs including The Trade Desk". As of November 2026 the protocols are new, adoption is uneven, and which will become the industry's standard is not settled; what is settled is the shape of the records any of them needs.

What an agent-facing platform has to build, whichever protocol it speaks:

- **Agent identity separate from user identity.** An agent acts for a principal (an advertiser, an agency, a publisher) and is authenticated as itself, with the principal's grant attached. Commerce's [Agent Identity and Access](/books/commerce/agentic-commerce#agent-identity-and-access) covers the store-side version; the playbook's [Identity Before Account Actions](/docs/building-blocks/ai-agents#identity-before-account-actions) is the rule.
- **A mandate with limits, as data.** What the agent may do (create buys, change budgets, upload creatives), for which accounts, up to what spend per buy and in total, within what flight dates and products, until when. Actions outside the mandate are rejected or escalated, never executed.
- **Propose, approve, execute.** Buys and budget increases above a threshold are proposals until a person with the right grant approves them; small adjustments within the mandate execute directly. The decision of what is allowed is made in code from the mandate, not by the model ([Decide in Code](/docs/building-blocks/ai-agents#decide-in-code)).
- **Idempotent, attributable actions.** Each action carries the agent's request ID as an idempotency key ([Idempotency](/docs/requests/idempotency)), and every change it makes lands in `change_events` with the agent and mandate as the actor, so the advertiser's history shows what the agent did beside what people did.
- **Contracts are still contracts.** A media buy an agent books is an insertion order or a deal like any other, with its terms version and controlling measurement ([Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms)); the agent's involvement doesn't change who is liable for paying for it.

## Disclosure Rules

Whether an ad must say it uses AI depends on what the AI produced, who the advertiser is and where the ad runs. As of November 2026:

| Rule | Who | What triggers it | What it requires |
| --- | --- | --- | --- |
| **EU AI Act, Article 50** (applies from August 2, 2026) | Providers of generative systems; deployers | Synthetic audio, image, video or text; deepfakes; AI text published to inform the public | Providers mark outputs "in a machine-readable format"; deployers "disclose that the content has been artificially generated or manipulated" for deepfakes, limited for evidently artistic or creative work |
| **New York General Business Law 396-b** (in force June 9, 2026) | A person creating an ad for a commercial purpose "where such person has actual knowledge" | A "synthetic performer": a digital asset meant to look like a human performer "who is not recognizable as any identifiable natural performer" | "conspicuously disclose in such advertisement that a synthetic performer is in such advertisement"; civil penalties of $1,000 for a first violation and $5,000 for each later one; audio ads, translation-only uses and ads for expressive works consistent with the work are excluded |
| **California Government Code 84514** | Committees that create, publish or distribute a qualified political ad | Image, audio or video generated or substantially altered using AI, beyond minor edits | The disclosure "Ad generated or substantially altered using artificial intelligence." in a clear and conspicuous manner |
| **FEC interpretive rule** (September 2024) | Federal campaigns | Fraudulent misrepresentation of campaign authority by any means | No new AI rule: the Commission "voted not to open a rulemaking", stating that the statute and regulation are "technology neutral" and reach "AI-assisted media" |
| **Google political content policy** (mid-November 2023) | "all verified election advertisers in regions where verification is required" | "synthetic content that inauthentically depicts real or realistic-looking people or events" | A "clear and conspicuous" disclosure; inconsequential edits exempt |
| **Meta political and social issue ads** (from 2024) | Advertisers running ads about social issues, elections or politics | A "photorealistic image or video, or realistic sounding audio" digitally created or altered, including "a realistic-looking person that does not exist" | Advertisers must disclose; such ads are kept in the Ad Library "for seven years" |
| **IAB AI Transparency and Disclosure Framework** (v1 January 2026, v2 August 18, 2026; industry self-regulation) | Advertisers, agencies, publishers, platforms | AI use that "materially affects authenticity, identity or representation" | A label (in the US, "a standardized sparkle icon or a clear text label"), with guidance on uses that don't need one |

Beyond these, many US states have enacted laws on deceptive AI-generated media in election communications, with differing triggers, windows before an election and safe harbors for disclosed content; the count changes each session and is not reproduced here.
<!-- source-gap: adv-state-ai-political-ad-laws | missing | number of US states with laws on AI-generated media in political ads, and their common terms | closes with: a maintained tracker from NCSL or a state-law database opened and dated | checked: 2026-11-22 -->
The general deception rules apply to AI-made ads as to any other: the FTC's position, which Commerce's [Disclosure and Labeling](/books/commerce/ai-in-commerce#disclosure-and-labeling) and [Advertising Content Law](/books/advertising/advertising-content-law) cover, is that there is no AI exemption from the FTC Act. Article 50's details for platforms, including the Digital Omnibus's deferral of the marking duty for systems already on the market, are in User-Generated Platforms' [The EU AI Act's Transparency Duties](/books/user-generated-platforms/ai-on-user-generated-platforms#the-eu-ai-act-s-transparency-duties).

What the rules have in common, for a system: the trigger is a property of the creative (synthetic person, realistic depiction of an event, AI-altered media), not of the tool; knowledge matters (New York's "actual knowledge"); the advertiser category matters (political, election); and the disclosure must reach the ad as served, through every format and syndication. A platform that generates the asset knows the trigger better than the advertiser does and should set the flag itself; a platform that receives a finished creative depends on the advertiser's declaration and its own detection (C2PA and IPTC metadata where present). Political ads add the declaration [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads) models (`political_ad_declarations.uses_synthetic_media`).

## Governance

The governance of AI in ads is the governance of any delegated decision: who may delegate what, under which limits, with what review, and with what record. In practice:

- **Tiers by consequence.** Low-risk generation (crops, brightness, placement adaptation) runs on opt-in without per-variant review; generated copy and imagery run through automated policy and claim checks with sampled human review; anything depicting people, health, finance, politics or children requires human approval before serving. The playbook's [Choose Features by the Cost of Being Wrong](/docs/building-blocks/llm-features#choose-features-by-the-cost-of-being-wrong) is the frame.
- **Evals before rollout.** A creative generator is tested on a fixed set of products and briefs with checks for forbidden claims, brand violations, likeness of real people and bias in depictions, and a new model version ships only if it passes ([Evals Are Tests](/docs/building-blocks/llm-features#evals-are-tests)).
- **Versioned prompts and models.** The generator's prompt templates and model versions are recorded on every generated asset, so a bad output can be traced and every asset from a bad version found ([Prompts Are Versioned Code](/docs/building-blocks/llm-features#prompts-are-versioned-code)).
- **Responsibility stays with the advertiser and the platform.** The IAB framework lets advertisers choose how to label; platform policies make the advertiser responsible for its ads; neither shifts to the model. What an AI system promised is what the business promised ([The AI's Promises Are the Business's Promises](/docs/building-blocks/ai-agents#the-ai-s-promises-are-the-business-s-promises)).
- **Audit every AI action.** Generated assets, automated changes and agent actions each have an actor, a version, an input reference and an approval where one was required ([Auditing AI Actions](/docs/building-blocks/ai-agents#auditing-ai-actions)).

## How to Build It

[Creative Production, Review & DCO](/books/advertising/creative-production-and-dco#how-to-build-it) defines `creative_assets` (with `origin` for platform-generated and platform-modified assets), `creative_versions` and `creative_reviews`; [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms) defines `change_events`, `account_grants` and `api_clients`; [Social Advertising](/books/advertising/social-advertising) adds `campaigns.campaign_type`; [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads) defines `political_ad_declarations` with `uses_synthetic_media`. This chapter adds the generation record behind each generated asset, the advertiser's per-feature consent, the disclosure state on each served version, and the agent's mandate and actions.

```sql
CREATE TABLE creative_ai_settings (      -- which generative features an advertiser allowed, per creative
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  creative_id         UUID NOT NULL REFERENCES creatives (id),
  feature             TEXT NOT NULL,      -- 'background_generation', 'text_variations', 'uncrop',
                                          -- 'translation', 'voiceover', 'video_from_images', ...
  enrollment          TEXT NOT NULL CHECK (enrollment IN ('opt_in', 'opt_out', 'platform_default')),
  set_by              TEXT NOT NULL,      -- typed actor: user, API client, platform default and version
  effective           TSTZRANGE NOT NULL,
  EXCLUDE USING gist (creative_id WITH =, feature WITH =, effective WITH &&)  -- needs btree_gist
);

CREATE TABLE asset_generations (         -- how a platform-generated or modified asset was made
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  creative_asset_id   UUID NOT NULL REFERENCES creative_assets (id),
  feature             TEXT NOT NULL,      -- as in creative_ai_settings
  source_asset_ids    UUID[] NOT NULL DEFAULT '{}',  -- the advertiser's inputs
  model_ref           TEXT NOT NULL,      -- model and version
  prompt_template_ref TEXT NOT NULL,      -- the versioned template, never free text alone
  locked_fields       TEXT[] NOT NULL DEFAULT '{}',  -- claims, prices, legal text copied verbatim
  digital_source_type TEXT NOT NULL CHECK (digital_source_type IN ('trained_algorithmic_media',
                        'composite_with_trained_algorithmic_media', 'algorithmically_enhanced')),
  c2pa_manifest_ref   TEXT,               -- the manifest embedded in or stored beside the file
  depicts_person      BOOLEAN NOT NULL,   -- a realistic human, real or synthetic
  synthetic_performer BOOLEAN NOT NULL,   -- a realistic human who is no identifiable person
  checks              JSONB NOT NULL DEFAULT '[]',  -- [{"check":"forbidden_claims","result":"pass"}]
  generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (NOT synthetic_performer OR depicts_person)
);

-- What the served version disclosed, and why.
ALTER TABLE creative_versions
  ADD COLUMN ai_disclosure TEXT,          -- 'none', 'label', 'label_and_metadata'
  ADD COLUMN ai_disclosure_basis TEXT[] NOT NULL DEFAULT '{}',
                                          -- e.g. {'ny_gbl_396b','eu_ai_act_50_4','platform_political'}
  ADD COLUMN ai_disclosure_text TEXT;     -- the label as rendered, frozen with the version
ALTER TABLE creative_versions ADD CONSTRAINT creative_versions_ai_disclosure_check
  CHECK (ai_disclosure IN ('none', 'label', 'label_and_metadata')) NOT VALID;

CREATE TABLE agent_mandates (            -- what an agent may do for a principal, and the limits
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  api_client_id       UUID NOT NULL REFERENCES api_clients (id),  -- the agent, authenticated as itself
  principal_org_id    UUID NOT NULL REFERENCES organizations (id),
  ad_account_ids      UUID[] NOT NULL,    -- accounts it may act on
  protocol            TEXT NOT NULL CHECK (protocol IN ('adcp', 'platform_api', 'other')),
  allowed_operations  TEXT[] NOT NULL,    -- e.g. {'get_products','create_media_buy','sync_creatives'}
  max_buy_micros      BIGINT CHECK (max_buy_micros > 0),    -- per media buy, account currency
  max_total_micros    BIGINT CHECK (max_total_micros > 0),  -- across the mandate's life
  approval_above_micros BIGINT,           -- buys above this are proposals until a person approves
  granted_by_grant_id UUID NOT NULL REFERENCES account_grants (id),  -- the person's grant behind it
  active              TSTZRANGE NOT NULL,
  revoked_at          TIMESTAMPTZ,
  CHECK (approval_above_micros IS NULL OR max_buy_micros IS NULL
         OR approval_above_micros <= max_buy_micros)
);

CREATE TABLE agent_actions (             -- every operation an agent requested, and what happened
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  agent_mandate_id    UUID NOT NULL REFERENCES agent_mandates (id),
  operation           TEXT NOT NULL,      -- the protocol task, e.g. 'create_media_buy'
  request_id          TEXT NOT NULL,      -- the agent's idempotency key
  request_sha256      BYTEA NOT NULL,     -- the payload as received
  amount_micros       BIGINT,             -- spend the action commits, if any
  outcome             TEXT NOT NULL CHECK (outcome IN ('executed', 'proposed', 'approved',
                        'rejected_by_person', 'rejected_out_of_mandate', 'failed')),
  decided_by          TEXT,               -- the approving user, or the mandate rule that decided
  resource_kind       TEXT,               -- what it created or changed: 'insertion_order', 'line_item'
  resource_id         UUID,
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at          TIMESTAMPTZ,
  UNIQUE (agent_mandate_id, request_id)
);

-- Agents are their own actor kind in the change history.
ALTER TABLE change_events DROP CONSTRAINT change_events_actor_kind_check,
  ADD CONSTRAINT change_events_actor_kind_check
  CHECK (actor_kind IN ('user', 'api_client', 'platform', 'agent')) NOT VALID;
ALTER TABLE change_events ADD COLUMN agent_action_id UUID;  -- no FK across the partitioned log
```

The check before an agent's media buy executes is ordinary code over the mandate, never the model's judgment:

```sql
-- Would this buy fit the mandate, and does it need a person?
SELECT m.id,
       $2 = ANY (m.allowed_operations)                                  AS operation_allowed,
       $3::uuid = ANY (m.ad_account_ids)                                AS account_allowed,
       m.max_buy_micros IS NULL OR $4 <= m.max_buy_micros               AS within_buy_limit,
       m.max_total_micros IS NULL OR
         coalesce((SELECT sum(a.amount_micros) FROM agent_actions a
                   WHERE a.agent_mandate_id = m.id
                     AND a.outcome IN ('executed', 'approved')), 0) + $4
         <= m.max_total_micros                                          AS within_total,
       m.approval_above_micros IS NOT NULL AND $4 > m.approval_above_micros AS needs_approval
FROM agent_mandates m
WHERE m.id = $1
  AND m.active @> now()
  AND m.revoked_at IS NULL;
-- $2 operation, $3 ad account, $4 the buy's amount in micros
```

The total is read without a lock in this sketch; two concurrent buys under one mandate can both pass it. A production version takes a row lock on the mandate (or a reservation against it, like a budget) in the same transaction that records the action.

Served creatives that depicted a synthetic performer without a disclosure, for New York-targeted delivery in a period:

```sql
SELECT DISTINCT cv.creative_id, cv.version, cv.first_served_at
FROM creative_versions cv
JOIN creative_assets ca ON ca.id = ANY (cv.asset_ids)
JOIN asset_generations g ON g.creative_asset_id = ca.id
WHERE g.synthetic_performer
  AND coalesce(cv.ai_disclosure, 'none') = 'none'
  AND cv.first_served_at < $2
  AND EXISTS (                            -- served in the period to New York, by the delivery logs
    SELECT 1 FROM ad_events e
    JOIN auctions a    ON a.id = e.auction_id
                      AND a.started_at > e.occurred_at - interval '1 hour'
                      AND a.started_at <= e.occurred_at
    JOIN ad_requests r ON r.id = a.ad_request_id
                      AND r.received_at BETWEEN a.started_at - interval '1 minute' AND a.started_at
    WHERE e.creative_id = cv.creative_id AND e.kind = 'impression'
      AND e.occurred_at >= $1 AND e.occurred_at < $2
      AND r.country = 'US' AND r.region = 'NY');
```

Direct serves with no auction row reach the request through `ad_decisions` instead, with the same time-bounded join. New York's rule binds the advertiser with actual knowledge, so for a platform this is an advisory check on its advertisers' behalf, and an obligation where the platform made the asset.

Design notes:

- **Consent per feature, with history.** `creative_ai_settings` is effective-dated, so the question "had the advertiser allowed background generation when this impression served" has one answer; platform defaults are recorded as such, not as the advertiser's choice.
- **Generation is provenance, not a log line.** `asset_generations` ties each generated asset to its inputs, model, template, the fields copied verbatim and the checks it passed, and carries the IPTC source type and C2PA manifest that leave with the file.
- **Disclosure is frozen with the version.** The label, its legal basis and its rendered text are on `creative_versions`, which never changes after first serve, so the record of what a person saw doesn't depend on today's rules.
- **The trigger is a fact about the creative.** `depicts_person` and `synthetic_performer` are set where the asset is made (by the generator) or declared (by the advertiser on upload) and read by every disclosure rule; rules are added by jurisdiction without new columns.
- **Agents act under a person's grant.** A mandate points at the `account_grants` row of the person who created it; revoking the grant revokes what the agent may do, and every action records the mandate.
- **Proposals are actions too.** A buy the agent proposed and a person rejected is a row, so an agent's judgment can be evaluated against its principal's.

## Auditing

- **Every generated asset,** with its inputs, model and template versions, locked fields, checks, source type and manifest, and the advertiser's feature consent in force when it served.
- **What each served ad disclosed,** with the label text and the rule it was meant to satisfy, by version.
- **Every platform-initiated change** to a campaign (auto-upgrades, migrations, recommendations applied), with the job and version, in the advertiser's change history.
- **Every agent action:** the mandate and the person's grant behind it, the request, whether it executed, was proposed, approved or rejected, by whom, and what it changed.
- **Political and regulated ads** with their synthetic media declarations and the approvals required before serving.

## What This Means for the System You Build

- **Record per-feature consent for generative creative,** effective-dated, with platform defaults labeled as defaults.
- **Copy claims, prices, offers and legal text verbatim;** let models generate variations, never facts.
- **Review generated output like any creative,** with automated claim and policy checks and human approval for people, health, finance, politics and children.
- **Keep provenance with the asset:** model, template, inputs, IPTC source type and C2PA manifest.
- **Set disclosure triggers as facts about the creative** and freeze the rendered disclosure with each served version.
- **Express every control in an automated campaign as data the delivery system enforces,** and report where delegated money went.
- **Record auto-upgrades and migrations in the advertiser's change history** as platform actions.
- **Give agents their own identity, a mandate with limits, and a propose-approve-execute flow** decided in code, with every action idempotent and attributable.

## References

**Regulation**

- [EU Artificial Intelligence Act: Article 50](https://artificialintelligenceact.eu/article/50/), transparency obligations for providers and deployers, machine-readable marking, deepfake disclosure and the application date
- [New York General Business Law 396-b](https://www.nysenate.gov/legislation/laws/GBS/396-B), the synthetic performer definition, disclosure duty, actual knowledge, exclusions and penalties
- [Cooley: New York enacts synthetic performer disclosure law (January 29, 2026)](https://www.cooley.com/news/insight/2026/2026-01-29-new-york-enacts-synthetic-performer-disclosure-law-for-advertisements-including-those-using-generative-ai), the December 11, 2025 signing, S.8420-A/A.8887-B and the June 9, 2026 effective date
- [California Government Code 84514](https://california.public.law/codes/government_code_section_84514), the disclosure text for political ads generated or substantially altered using AI
- [FEC: Interpretive rule on artificial intelligence in campaign ads](https://www.fec.gov/updates/commission-approves-notification-of-disposition-interpretive-rule-on-artificial-intelligence-in-campaign-ads), the September 19, 2024 vote not to open a rulemaking and the technology-neutral interpretation

**Specifications**

- [AgenticAdvertising.org: Ad Context Protocol](https://adcontextprotocol.org/), the protocol's purpose, publisher and AdCP 3.2 general availability
- [AdCP documentation: Introduction](https://docs.adcontextprotocol.org/docs/intro), MCP and A2A transports, the domain protocols, task names and governance escalation
- [IAB Tech Lab: Agentic Real Time Framework](https://iabtechlab.com/standards/artf/), v1.0 final, v2.0 in discussion, containerized agent services and bidstream mutation
- [IAB: AI Transparency and Disclosure Framework v2 (August 18, 2026)](https://iab.com/news/updates-industry-framework-ai-transparency-disclosure-advertising), the January 2026 first version, the materiality trigger and the US label options

**Reference**

- [Google Ads Help: About Performance Max campaigns](https://support.google.com/google-ads/answer/10724817?hl=en), inventory, Smart Bidding, audience signals, generative asset tools, brand exclusions and channel reporting
- [Google: AI Max and the Dynamic Search Ads upgrade (2026)](https://blog.google/products/ads-commerce/dsa-upgrade-to-ai-max-2026/), AI Max out of beta, its features and the auto-upgrade dates with the June 11, 2026 update
- [Google Ads policy: Political content, synthetic content disclosure](https://support.google.com/adspolicy/answer/13755910), who must disclose, what triggers it and the exemption for inconsequential edits
- [Google: Gen AI content transparency and C2PA (September 17, 2024)](https://blog.google/technology/ai/google-gen-ai-content-transparency-c2pa/), C2PA signals in Google's ad systems
- [Meta for Developers: Get started with Advantage+ creative](https://developers.facebook.com/docs/marketing-api/creative/advantage-creative/get-started), per-feature opt-in and opt-out, feature names, defaults and the paused preview for AI-generated features
- [Meta: How Meta is planning for elections in 2024 (November 2023)](https://about.fb.com/news/2023/11/how-meta-is-planning-for-elections-in-2024/), disclosure of digitally created or altered political and social issue ads and Ad Library retention
- [Meta for Developers: Upcoming ASC and AAC Marketing API deprecation (October 8, 2025)](https://developers.facebook.com/blog/post/2025/10/08/upcoming-asc-and-aac-mapi-deprecation-migration-options-to-advantage-plus/), no new legacy Advantage+ Shopping and App campaigns from v24.0
- [Meta for Developers: Graph API v25.0 changelog (February 18, 2026)](https://developers.facebook.com/docs/graph-api/changelog/version25.0), no creation, duplication or updates of Advantage+ shopping and app campaigns from v25.0, and in all versions from May 19, 2026
- [Amazon: Amazon Ads AI-powered image generator (October 25, 2023)](https://www.aboutamazon.com/news/innovation-at-amazon/amazon-ads-ai-powered-image-generator), lifestyle image generation and the click-through comparison

**In practice**

- [Triton Digital: Yahoo, PubMatic and others launch new standard for agentic advertising (October 15, 2025)](https://tritondigital.com/news-item/October-15-2025/yahoo-pubmatic-and-others-launch-new-standardfor-agentic-advertising), AdCP's launch, participants, MCP foundation, initial protocols and neutral governance

**Filings**

- [The Trade Desk: Third quarter 2026 results, Exhibit 99.1](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000115/ttd-20261109x8kexx991.htm), Kokai Zuma's agentic capabilities and Olyzon's agents across DSPs
- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), Kokai as the platform's major upgrade
