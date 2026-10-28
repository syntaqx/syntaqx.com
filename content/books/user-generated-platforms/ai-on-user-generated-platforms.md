+++
title = "AI on User-Generated Platforms"
description = "AI moderation and its error budgets, labels for AI-generated uploads, C2PA and IPTC provenance, EU AI Act disclosure, AI answers and training opt-outs."
category = "User-Generated Platforms Industry"
order = 1851
part = "Running the Platform"
tags = ["user-generated-content", "ai", "moderation", "provenance", "c2pa"]
+++

AI arrives on a user-generated platform from three directions at once. **The platform uses it** to moderate: classifiers score every upload, message and report, and at the scale of hundreds of millions of items a half-year most first decisions are made or shaped by a model. **Users bring it:** uploads made or altered by generative tools, accounts run by bots and agents, comments drafted by a chatbot. **AI companies want the platform's content** as training data and as answers, licensed or scraped, and the platform increasingly answers questions over its own corpus with a model of its own. Each direction has its own law and its own failure mode: a moderation model's errors are wrongful removals at scale, an unlabeled deepfake is a deception and in the EU a disclosure breach, and a user's posts used for training without a choice is a trust problem with litigation behind it.

This chapter covers the industry detail: AI moderation as thresholds and error budgets per category, labeling AI-generated content (what YouTube, Meta and others require and detect), provenance metadata (C2PA content credentials and IPTC's digital source type) and what survives a media pipeline, the EU AI Act's transparency duties in force since August 2026, AI answers over community content, training-data licensing and user opt-outs, and bots posting as users. The general rules are the playbook's: decisions recorded with model and threshold ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)), scores in bands with a human middle ([Scores, Bands and the Human Middle](/docs/architecture/risk-scoring#scores-bands-and-the-human-middle)), AI features built on tools rather than database access ([AI Agents in the Product](/docs/architecture/ai-agents)), and [AI Security](/docs/security/ai-security) for prompt injection. The Gaming volume covers player-facing generative AI and its disclosure ([AI in Games](/books/gaming/ai-in-games)). The chapter extends `content_items` and `media_assets` from [The Core Data Model](/books/user-generated-platforms/platform-business#the-core-data-model) with labels and provenance, and adds classifier policies and training preferences. Data licensing deals are covered in [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#data-licensing-as-revenue), and API access and scraping suits in [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#scraping-and-the-courts).

## How the Platforms Do It

| Platform | AI in moderation | Labels on AI-generated content | Provenance signals read | Training and answers |
| --- | --- | --- | --- | --- |
| **Bluesky** | 16.49 million labels in 2025, 95.34% applied automatically | Labels from Bluesky and user-chosen labelers | Not covered here | Not covered here |
| **Meta** | Not covered here | "AI info" (renamed from "Made with AI" on July 1, 2024); a more prominent label for high-risk deceptive media; labels instead of removal under the manipulated media policy from July 2024 | "Industry standard AI image indicators" plus self-disclosure | Not covered here |
| **Pinterest** | Most policies enforced by "hybrid" means: a human decision expanded by machine | Not covered here | Not covered here | Not covered here |
| **Reddit** | 68.6% of moderator removals automated (AutoModerator and Devvit apps); admin enforcement scaled with automated detection | Not covered here | Not covered here | Reddit Answers integrated into search; licensing revenue with API performance requirements; litigation against unlicensed use |
| **Tumblr and WordPress.com** | Not covered here | Not covered here | Not covered here | A setting to opt out of sharing public content with third parties, including AI companies (February 2024) |
| **YouTube** | Not covered here | Creators must disclose realistic AI-generated or altered content at upload; label in the player for photorealistic content and AI music, in the description otherwise; YouTube may add labels itself | C2PA metadata can trigger an automatic label that the creator can't remove | Not covered here |

The patterns: **automation decides most volume and humans decide the contested middle;** **labels come from two sources,** what the uploader declares and what the platform detects, and a detected label from a signed manifest overrides the uploader; **removal gives way to labeling** for synthetic media that isn't otherwise violating; and **the corpus is now an asset** with licensing revenue, an opt-out, and lawsuits against those who take it without paying.

## AI Moderation and Error Budgets

Classifiers are prioritizers before they're judges: the playbook's detection bands send high-confidence matches to automatic action, the uncertain middle to people, and the rest through ([Automated Detection, Human Review](/docs/security/trust-and-safety#automated-detection-human-review)); [Moderation at Scale](/books/user-generated-platforms/moderation-at-scale#vendors) covers the vendors and the review operation. What changes when general-purpose models do the classifying:

- **Off-the-shelf scores are signals, not policies.** OpenAI's moderation endpoint (free, `omni-moderation-latest`, text and images) returns a boolean `flagged` and per-category scores across 13 categories, and its documentation says to treat scores as signals for your own policy, notes that refusals and safety discussions can be flagged, and warns that the model is updated over time so thresholds based on scores "may need periodic recalibration." A platform's policy categories, versions and thresholds have to be its own, mapped from the vendor's.
- **Child safety isn't a general model's job.** The same documentation says not to send known or suspected child sexual abuse material to the endpoint; hash matching and dedicated classifiers do that job on a restricted path ([Child Safety: Detection & Reporting](/books/user-generated-platforms/child-safety#hash-matching)).
- **Thresholds are per category and per action.** The precision a platform needs before auto-removing spam is lower than before auto-removing a news photo for graphic violence, and much lower than before suspending an account. Each (category, action) pair gets a threshold and a target precision, which is the error budget: the share of automated actions allowed to be wrong.
- **Measure the budget with independent labels.** Precision and recall come from labeled samples that the classifier didn't choose, the prevalence samples in [Operating Metrics](/books/user-generated-platforms/operating-metrics#how-to-build-it), and from appeal outcomes. Reddit attributed a 66.6% fall in granted appeals to improved precision in its automated enforcement, noting that "appeals are always human-reviewed"; appeal overturn rates by model version are a lagging measure of the same budget ([Appeals](/docs/security/trust-and-safety#appeals)).
- **Regulators ask for the numbers.** The DSA requires a qualitative description of automated moderation with "indicators of the accuracy and the possible rate of error," per official language for very large platforms ([The DSA Reports](/books/user-generated-platforms/transparency-reporting#the-dsa-reports)), and the AliExpress decision found a platform that overestimated its detection system's effectiveness ([Fines, Commitments and Findings](/books/user-generated-platforms/regulators-and-enforcement#fines-commitments-and-findings)).
- **Volunteer moderators use automation too.** Most of Reddit's moderator removals are automated by rules engines and apps the moderators configure. Those are automated decisions on the platform, recorded and counted like the platform's own ([Volunteer Moderation & Community Governance](/books/user-generated-platforms/volunteer-moderation#automod-rules-engines-for-volunteers)).

My rule: **no model changes a threshold or ships a new version without a recorded evaluation against the current labeled set and a staged rollout,** the playbook's [Changing Rules and Models Safely](/docs/architecture/risk-scoring#changing-rules-and-models-safely), and every automated decision stores the model version, score and threshold that made it. A rising overturn rate for one model version is an incident.

## Labeling AI-Generated Content

The platforms converge on three sources of a label:

1. **Declaration.** YouTube requires creators to disclose content that "seems realistic" and was AI-generated or meaningfully altered: a real person appearing to say or do something they didn't, altered footage of a real event or place, a realistic scene that didn't happen, AI music as the video's focus. It exempts clearly unrealistic content and aesthetic edits (filters, background blur, upscaling, captions, script help, cloning your own voice for narration). The answer is a field at upload ("AI use" under Attributes).
2. **Detection.** YouTube may label content made with its own generative tools, content carrying C2PA metadata, and content its systems detect; Meta labels from "industry standard AI image indicators." A label from YouTube's tools, from C2PA metadata or after manual review can't be removed by the creator.
3. **Review.** Repeated failure to disclose leads YouTube to apply labels manually and to penalties up to removal or suspension from the Partner Program; disclosure alone doesn't reduce reach or monetization.

Two details matter for design. **Where the label shows depends on risk:** YouTube puts it on the player for photorealistic content and AI music and in the description otherwise; Meta added a more prominent label for media with a "particularly high risk of materially deceiving the public" and moved the label for content only edited with AI tools into the post's menu in September 2024 after users objected that minor edits were labeled "Made with AI." **Labels replace some removals:** Meta stopped removing content solely under its manipulated video policy in July 2024 and labels it instead unless it breaks other rules. A label is therefore a moderation outcome with its own decision record, notice and appeal path, not a cosmetic tag.

Generative camera effects and content credentials signed at capture are in [Camera & Effects](/books/user-generated-platforms/camera-and-effects#generative-effects).

## Provenance: C2PA and IPTC

Detection is easier when the file says where it came from. Two standards carry that:

- **IPTC Digital Source Type** is a controlled vocabulary for how media was made. `trainedAlgorithmicMedia` is media generated by a model trained on captured content; `compositeWithTrainedAlgorithmicMedia` is media edited with generative AI (inpainting, outpainting); `compositeSynthetic` is a mix in which at least one element is generative; `digitalCapture` is recorded from real life with a camera; `computationalCapture` covers frames merged by signal processing or non-generative AI, such as smartphone HDR.
- **C2PA content credentials** are signed manifests: assertions about the asset (actions taken, metadata, thumbnails, hashes binding the manifest to the content), a claim listing them, and a claim signature tying the claim to the signer's credential, collected in a manifest store whose last manifest is active. A manifest can be embedded in the file or held externally and referenced by URI. Editing creates a derived asset whose manifest lists the source as an ingredient and copies its manifests in, so the chain survives edits by tools that support it. "Soft bindings" (a fingerprint or invisible watermark derived from the content) let a stripped asset be matched back to its manifest in a repository, and a credential with at least one soft binding is a "durable" one.

The problem for a user-generated platform is its own pipeline. Image services strip metadata by design, for privacy (location) and size: Cloudflare Images by default "discards all metadata except EXIF copyright tag" and always discards all metadata for WebP and PNG output; Cloudinary strips metadata on transformation except a few resolution fields and `DigitalSourceType`, which it keeps by default for JPG, PNG, TIFF, AVIF and HEIC originals delivered as JPG or PNG, but not for video, and not after some generative transformations. So a platform that serves only processed variants will usually have thrown away the provenance before any viewer sees it (the [life of a post](/books/user-generated-platforms/platform-business#the-life-of-a-post) strips GPS on purpose; [Images at Scale](/books/user-generated-platforms/images-at-scale#provenance-that-must-survive) owns the variant pipeline).

The design that holds up:

- **Read provenance at ingest, before processing.** Validate any C2PA manifest on the original upload, record the digital source type and the validation result on the asset, and keep the original's manifest with the original.
- **Store provenance as data, not just as bytes in the file.** A `media_provenance` row survives every variant, every format conversion and every CDN, and drives the label.
- **Strip location, keep provenance.** Removing GPS and device data is a privacy rule; removing the source type and manifest is an accident. Configure the transformer to keep what it can, and re-attach or reference the manifest where the format allows.
- **A valid manifest overrides a declaration;** an invalid or missing one proves nothing. Most real camera uploads carry no credentials, so absence can't mean "authentic."

## The EU AI Act's Transparency Duties

Article 50 of the AI Act has applied since August 2, 2026, and reaches user-generated platforms in two roles:

- **As a deployer** of AI that generates or manipulates content, a platform must disclose deepfakes ("image, audio or video content constituting a deep fake") as artificially generated or manipulated, with a lighter duty for evidently artistic, satirical or fictional work, and disclose AI-generated text published to inform the public on matters of public interest unless a person with editorial responsibility reviewed it. A platform's own generative features (an image generator in the post composer, AI-written summaries) put it in this role.
- **As a provider** of a generative system, it must mark outputs "in a machine-readable format and detectable as artificially generated or manipulated" (Article 50(2)); under the Digital Omnibus on AI (Regulation (EU) 2026/1744), systems already on the market before August 2, 2026 have until December 2, 2026 to comply, while new systems had to mark from the start. The Commission published a final, voluntary Code of Practice on marking and labelling AI-generated content on June 9, 2026, setting out how providers make outputs machine-readable and detectable.
- **Chatbots** must tell people they're talking to an AI unless it's obvious (Article 50(1)), which reaches AI assistants and AI accounts that converse with users.

For uploads by users, the platform isn't the deployer of the user's tool, but the DSA's systemic risk duties and the platforms' own policies push the same way: detect, label and let users declare. The practical overlap is that a platform which marks its own generated outputs with C2PA and IPTC metadata can also read the same marks from others' tools.

## AI Answers Over Community Content

Platforms now answer questions with a model over their own corpus. Reddit's 10-K describes Reddit Answers, its AI conversational search, as integrated into core search in 2025. The design questions are the community's, not just the model's:

- **Cite the threads.** An answer built from posts is a derivative of users' content; linking each claim to its source keeps the authors' work visible and lets readers judge it.
- **Respect removal and visibility.** A removed, deleted or restricted post, a private community, or a post geoblocked in the reader's country must not reach the answer. The retrieval index consumes `content.removed` and visibility changes from the event spine like search does ([The Event Spine](/books/user-generated-platforms/platform-architecture#the-event-spine)), and answers are generated at request time from what the reader may see.
- **Moderate the output.** The answer is the platform's speech, not a user's: Section 230 protects information provided by another content provider, and text the platform's own model wrote may not get the protection users' posts do ([The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability#section-230)). Run the answer through the same safety classifiers as user posts, and log prompts, retrieved items and outputs as the playbook's [Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions) describes.
- **Treat retrieved posts as untrusted input.** User posts can carry instructions aimed at the model; the playbook's [Prompt Injection Is Unsolved](/docs/security/ai-security#prompt-injection-is-unsolved) applies to every retrieval-augmented feature over user content.

## Training Data, Licensing and Opt-Outs

User content became a licensed asset in 2023 and 2024. Reddit's 10-K reports content licensing revenue in which substantially all contract value came from two partners, with API performance requirements, and litigation against companies that used its content without a license; the deals and their economics are covered in [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#what-the-deals-look-like), and API access and scraping suits in [Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#data-licensing-as-an-engineering-obligation). What the platform has to build regardless of which deals it signs:

- **A user-level preference.** Automattic added a setting in February 2024 to opt out of sharing public Tumblr and WordPress.com content with third parties including AI companies, and said it would "regularly update any partners about people who newly opt out" and ask them to remove those users' content from past and future training. A preference only works if exports read it at export time and partners are told about changes after the fact, so it's a dated record, not a checkbox.
- **Exports that respect deletion and visibility.** A licensed feed of posts must drop deleted, removed and private content, and propagate later deletions to the licensee under the contract, or the platform's erasure promises stop at its own walls ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-requests)).
- **Crawler policy at the edge.** Unlicensed collection arrives as crawlers. Cloudflare changed its default on July 1, 2025 to block AI crawlers unless they pay, which made crawler blocking a CDN setting; the platform's robots rules, rate limits and bot detection decide who reads the corpus without a contract ([Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#rate-limits-as-abuse-control)).
- **Minors' content is different.** Content from accounts in a minor age band, or in communities restricted by age, shouldn't enter training exports at all; COPPA's separate consent for disclosure and the Children's Code's data sharing standard both point that way ([Children's Privacy & Age Assurance](/docs/compliance/childrens-privacy#data-minimization-for-minors)).

## Bots and Agents as Users

Automated accounts have always posted (spam), and developer platforms have always hosted bots ([Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#bots-and-apps)). Generative models make a third kind: accounts that converse like people. The rules a platform can enforce:

- **Declared automation is an account type.** An app, bot or AI agent account is labeled as such in every surface where it speaks, which also meets the AI Act's chatbot disclosure where it converses with EU users.
- **Undeclared automation is inauthentic behavior,** detected and penalized as in [Spam, Bots & Inauthentic Behavior](/books/user-generated-platforms/spam-and-bots#coordinated-inauthentic-behavior); Bluesky reported removing 3,619 accounts for influence operations in 2025.
- **Rate limits and permissions fit automation,** not people: a bot doesn't need direct messages to strangers, and an agent acting for a user acts with that user's scopes, never more ([Tools, Not Database Access](/docs/architecture/ai-agents#tools-not-database-access)).

## How to Build It

The chapter adds AI labels on content items and extends three tables other chapters own: provenance on media assets ([Images at Scale](/books/user-generated-platforms/images-at-scale#how-to-build-it)), classifier bands ([Moderation at Scale](/books/user-generated-platforms/moderation-at-scale#how-to-build-it)) and opt-outs ([Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#how-to-build-it)).

```sql
ALTER TABLE content_items
  ADD COLUMN ai_label        TEXT NOT NULL DEFAULT 'none' CHECK (ai_label IN ('none',
                               'declared', 'detected', 'provenance', 'reviewed')),
  ADD COLUMN ai_label_prominence TEXT CHECK (ai_label_prominence IN ('menu', 'description',
                               'on_media')),     -- where the label shows, by risk
  ADD COLUMN ai_declared_at  TIMESTAMPTZ,        -- the uploader's answer
  ADD COLUMN ai_label_decision_id UUID REFERENCES moderation_decisions (id);  -- detected or reviewed

-- media_provenance (C2PA state, signer, claim generator, IPTC source type) belongs to
-- Images at Scale; this chapter adds the soft binding and whether variants carry it.
ALTER TABLE media_provenance
  ADD COLUMN soft_binding          TEXT,  -- watermark or fingerprint id, when present
  ADD COLUMN preserved_in_variants BOOLEAN NOT NULL DEFAULT FALSE;  -- re-attached or referenced

-- classifier_bands (thresholds and error budget per vendor, model, category and action,
-- effective-dated and approved) belongs to Moderation at Scale; this chapter adds the
-- evidence that justified each band and the error rate measured against its budget.
ALTER TABLE classifier_bands
  ADD COLUMN vendor_category_map JSONB,          -- vendor categories feeding this one
  ADD COLUMN evaluation_ref      TEXT,           -- the labeled set and run that justified it
  ADD COLUMN measured_error_rate NUMERIC(6, 5),  -- latest evaluation, against error_budget
  ADD COLUMN measured_at         TIMESTAMPTZ;

-- Training and AI-use preferences are Ads, Brand Safety & Data Licensing's
-- data_license_opt_outs rows (account or community, dated, by purpose). Purposes used
-- here: 'model_training' (licensees), 'platform_training' (the platform's own models)
-- and 'ai_answers' (the platform's answer features).
```

Notes on the sketch:

- **A label is a decision.** A detected or reviewed AI label points at a `moderation_decisions` row with the model, score and threshold, so it gets a notice and an appeal and counts in transparency reports; a declared label records when the uploader answered. A valid C2PA manifest from a known generator sets `ai_label = 'provenance'`, which the uploader can't clear.
- **Provenance outlives the file format.** `media_provenance` is read from the original at ingest and joined at serving time to label every variant, whatever the transformer stripped; `preserved_in_variants` records whether the bytes also carry it.
- **Thresholds are effective-dated rows.** Each (vendor, model, category, action) has one band in force at a time, with the evaluation that justified it and its approver; a candidate threshold runs in shadow mode beside it. Every automated decision stores the band id, so a precision problem can be traced to the threshold in force ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Error budgets are watched.** A job computes `measured_error_rate` from fresh labeled samples and overturn rates, compares it with the band's `error_budget`, and pages when a budget is breached; the fix is a new band version with no `act_at`, so the model only queues until it's recalibrated.
- **Training preferences are dated opt-outs.** A user's or community's choice is a `data_license_opt_outs` row with its purposes, so licensed exports filter on the opt-outs in force at export time and on content state, and a new opt-out becomes an `opt_out_notice` delivery to every licensee that received the subject ([Developer Platforms, APIs & Data Access](/books/user-generated-platforms/developer-platforms-and-apis#how-to-build-it)). Minor-band accounts are excluded by rule, not by preference.
- **Events:** `content.ai_labeled`, `media.provenance_checked` (from Images at Scale), `classifier.band_changed`, `classifier.budget_breached` and `ai_preference.changed` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every automated decision** with model, version, score, threshold and the policy row in force ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Every threshold change** with its evaluation, approver and rollout, and every budget breach with what was done.
- **Every AI label** with its source (declared, detected, provenance, reviewed), and every label appeal.
- **Provenance as read at ingest,** including validation results and signer, kept with the original.
- **AI answers:** the query, the retrieved items and the output, for the retention period the playbook sets for AI actions.
- **Training exports** with the preference and content state filters applied, and every opt-out propagation to partners.

## What This Means for the System You Build

- **Own your policy categories and thresholds;** map vendor model scores into them and recalibrate when the vendor's model changes.
- **Set an error budget per category and action,** measure it from independent labels and appeals, and pull automation back when it's breached.
- **Keep child-safety detection on its dedicated path,** never a general model.
- **Ask uploaders to declare realistic AI content,** detect what they don't, and let signed provenance override the declaration.
- **Read C2PA and IPTC source type at ingest** and store them as data, because your image pipeline will strip them.
- **Treat AI labels as moderation decisions** with prominence by risk, notices and appeals.
- **Mark and disclose your own generated content** under Article 50, and label declared bots and agents everywhere they speak.
- **Build AI answers on what the reader may see,** cite the threads, moderate the output and treat retrieved posts as untrusted.
- **Record users' training preferences over time** and propagate opt-outs and deletions to licensees.
- **Exclude minors' content from training exports** by rule.

## References

**Law and standards**

- [Regulation (EU) 2024/1689 (AI Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1689), Article 50 (chatbot disclosure, machine-readable marking of generated outputs, deepfake disclosure with the lighter duty for artistic, satirical or fictional work, public-interest text disclosure and the editorial review exception) and Article 113 (application from 2 August 2026)
- [Regulation (EU) 2026/1744 (Digital Omnibus on AI)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32026R1744), the new Article 111(4): generative systems placed on the market before 2 August 2026 must comply with Article 50(2) by 2 December 2026
- [European Commission: Commission publishes Code of Practice on marking and labelling AI-generated content](https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1328), June 9, 2026, the final, voluntary code and its provider section on machine-readable marking and detection
- [C2PA: Technical specification 2.2](https://spec.c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html), manifests, claims, signatures, ingredients, embedded and external manifests, soft bindings, validation
- [IPTC: Digital Source Type vocabulary](https://cv.iptc.org/newscodes/digitalsourcetype/), the source type codes and definitions

**Platform documentation**

- [YouTube: Disclosing altered or synthetic content](https://support.google.com/youtube/answer/14328491?hl=en), what requires disclosure, label placement, automatic labels including from C2PA, consequences
- [Meta: Our approach to labeling AI-generated content and manipulated media](https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/), "AI info," prominent labels, labeling instead of removal, the 2024 changes
- [OpenAI: Moderation](https://developers.openai.com/api/docs/guides/moderation), the free endpoint, categories, scores as signals, recalibration, not for child sexual abuse material
- [Cloudinary: Image optimization](https://cloudinary.com/documentation/image_optimization), metadata stripping and the retained `DigitalSourceType`
- [Cloudflare Images: Features](https://developers.cloudflare.com/images/optimization/features/), metadata defaults and discarding for non-JPEG output
- [Cloudflare: Content Independence Day](https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/), blocking AI crawlers by default from July 1, 2025

**Filings and transparency reports**

- [Reddit: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm), Reddit Answers, licensing concentration and API requirements, litigation over unlicensed use
- [Reddit: Transparency Report, July to December 2025 (PDF)](https://torrentfreak.com/images/Reddit-Transparency-Report-H2-2025.pdf), automated share of moderator removals, the fall in granted appeals (Reddit's own PDF; copy hosted by TorrentFreak, as redditinc.com blocks automated access)
- [Bluesky: 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025), automatic labels and influence operation removals
- [Pinterest: Transparency report, July to December 2025](https://policy.pinterest.com/en/transparency-report), hybrid enforcement

**In practice**

- [Automattic: Protecting User Choice](https://automattic.com/2024/02/27/protecting-user-choice/), 27 February 2024, the opt-out settings, sharing only public content from sites that haven't opted out, updating partners about new opt-outs and asking them to remove that content from past sources and future training
