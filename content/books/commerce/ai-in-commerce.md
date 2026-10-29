+++
title = "AI in Commerce"
description = "AI inside the store as of October 2026: generated product content and its disclosure, AI search, support agents, forecasting, pricing limits, images and evals."
category = "Commerce Industry"
order = 2362
part = "Running the Platform"
tags = ["commerce", "ai", "generative-ai", "search", "customer-service", "governance"]
+++

By 2026 most of the AI a shopper meets in commerce is the store's own: a product description a merchant generated from five bullet points, a "Customers say" paragraph summarizing reviews, a search box that understands "something waterproof for a toddler," a chat assistant that answers whether a case fits a phone, a support agent that cancels an order, a lifestyle photo of a product in a kitchen it was never in. Behind the store the same models forecast demand, suggest reorder quantities and draft promotions. Each of these is a statement the business makes or a decision it takes, and the law treats it that way: the merchant is responsible for what its generated content says, for what its assistant promises and for how its prices are set, whichever model produced them.

This chapter covers AI used inside a store or a seller's business as of October 2026: product content generation and its disclosure, AI search and conversational shopping on the store's own site, support agents, forecasting, pricing models and their legal limits, image generation for catalogs, and governance and evaluation. AI shopping agents that buy on a shopper's behalf, and how a store sells to them, are [Agentic & AI Shopping](/books/commerce/agentic-commerce); AI in fraud, authorization and disputes is the Payments volume's [AI in Payments](/books/payments/ai-in-payments). The general engineering for agents with tools is the playbook's [AI Agents](/docs/architecture/ai-agents), security is [AI Security](/docs/security/ai-security), and model delivery is [Data Science Platforms](/docs/data/data-science-platforms). The chapter extends `products`, `attribute_values`, `localized_content` and `media_assets` from earlier chapters and adds `ai_generations` and `ai_evaluations`.

## How the Platforms Do It

As of October 2026, from the vendors' own pages and announcements:

| Vendor | Feature | What it does | What the vendor says about responsibility or limits |
| --- | --- | --- | --- |
| **Shopify** | Sidekick (formerly Shopify Magic for text) | Generates product descriptions from a title and features; in the Winter '26 Edition also builds Flow automations, reports in ShopifyQL, theme edits and custom apps, and "can plan, write to-do lists, and take on multiple actions"; app developers can extend it since June 17, 2026 | "You're responsible for the accuracy of all of the content that you publish to your store, even when you use automatic text generation to create it" |
| **Shopify** | Media generation and Semantic Search | Background generation and image edits; semantic search for English storefronts on Shopify and Advanced plans since June 24, 2024 | "An invisible watermark is applied to all generated images" |
| **Amazon (sellers)** | Generative listing tools, Enhance My Listing, Seller Assistant | Listings from a few words, an image or a URL; "more than 900,000" selling partners using them by May 2025; over 12 million sales-ready listings created with them in 2025; Seller Assistant had over 230,000 monthly users | Sellers accepted generated content "with little to no edits approximately 90% of the time" |
| **Amazon (shoppers)** | Rufus, renamed Alexa for Shopping on May 13, 2026; review highlights | Conversational shopping in the search bar, price history and alerts; "Customers say" summaries from verified-purchase reviews | Used by over 300 million customers in 2025 and credited with "nearly $12 billion in incremental annualized sales" |
| **Walmart** | Sparky | Search, review synthesis and occasion planning in the app (June 2025) | The CEO's September 2026 letter: "We won't use the information you share with us on Sparky or otherwise to raise your price" |
| **Google** | Product Studio in Merchant Center | Generates scenes, changes or removes backgrounds, upscales and makes product videos | "still experimental" and "may generate unexpected images and videos"; generated images and text must be labeled in the feed |
| **Salesforce** | Agentforce Merchant Agent | Site setup, promotions, product descriptions and insights for merchandisers | Not covered here |
| **Gorgias, Zendesk** | Support AI agents | Answer and act across email, chat and SMS; Gorgias actions such as cancelling an order are "opt-in and configurable"; Zendesk bills per automated resolution | Gorgias hands over "when it can't confidently respond" |

Three patterns run through the table:

- **Generation is a draft, and the vendor says so.** Shopify puts accuracy on the merchant in plain words, Google calls its tool experimental, and Amazon's own adoption figure (90% accepted with little or no editing) is the reason the warning matters: a draft accepted unread is published content.
- **The assistant sells, so it is measured in sales.** Amazon reports Rufus in incremental revenue; that framing is also why its answers are statements by the seller about the product, held to the same rules as the product page.
- **Disclosure is moving into feeds and metadata.** Google requires machine-readable labels on generated images and text in Merchant Center; a store that syndicates generated content has to carry the label from the place it was generated to every channel it reaches.

## Product Content Generation

The common uses: descriptions and titles from attributes, bullet points and SEO text per channel, translations ([Localization](/books/commerce/product-information#localization)), attribute extraction from supplier PDFs and images into the PIM (Akeneo's AI enrichment works from attribute values and from assets such as images and PDFs), alt text, and A+ or rich content. They are worth doing: a large catalog's content backlog is real and the alternative is often no description at all.

What goes wrong is predictable. A model asked for an appealing description adds what descriptions of similar products usually say. Shopify's help center names it: generated text "can include things such as product benefits even when you didn't list any explicitly, and facts based on other published content related to similar products." On a T-shirt that is a wrong fabric weight; on a regulated product it is a claim the law controls:

- **Health, safety and efficacy claims.** A pesticide's label claims are fixed by its registration, and a supplement or cosmetic can't claim to treat a disease ([Required Disclosures](/books/commerce/product-information#required-disclosures)); a generated "kills bed bugs" or "boosts immunity" is an unregistered claim or a drug claim.
- **Origin and environmental claims.** "Made in USA," "biodegradable" and "eco-friendly" have legal meanings ([Made in USA](/books/commerce/online-consumer-protection#made-in-usa)).
- **Compatibility and specifications.** "Fits iPhone 17" from a model that inferred it is a return and a review waiting to happen.

The FTC's position, in its September 2024 Operation AI Comply announcement, is that "there is no AI exemption from the laws on the books." It later set aside one of those orders: on December 22, 2025 it vacated the Rytr consent order, finding the complaint "failed to satisfy the legal requirements of the FTC Act." The retreat was about a tool vendor's liability for what its users might write; the seller who publishes a false claim is still the one making it.

My rules for generated product content:

- **Ground it in the record.** Generate from the product's typed attributes, compliance data and approved claims, and instruct the model to use nothing else; a fact not in the record isn't in the copy.
- **Lock what the law fixes.** Registered label claims, warnings, Prop 65 text, allergen statements and regulated disclaimers are never generated; they come from their owning records verbatim.
- **Check before publishing,** with automated checks for forbidden claim terms, numbers absent from the attributes and compatibility statements not backed by data, then human review for anything in a regulated category.
- **Record provenance per field.** `attribute_values.source = 'generated'` already requires an approver in [Product Information & Content](/books/commerce/product-information#how-to-build-it); the generation record below keeps the inputs, model and reviewer, so a complaint about a claim can be traced to who approved it.

## Disclosure and Labeling

Whether generated content must be labeled depends on what it is and where it goes, as of October 2026:

- **Google Merchant Center** requires that "All images created using generative AI must contain meta data indicating that the image was AI-generated" (the IPTC `DigitalSourceType` value `TrainedAlgorithmicMedia`), and says not to strip it. Generated descriptions go in the `structured_description` attribute and generated titles in `structured_title`, each with `digital_source_type` set to `trained_algorithmic_media`, which is "Required for content created using Generative AI."
- **Etsy** requires that "Seller-prompted AI creations must disclose the use of AI," and when it announced the policy in July 2024 it required the disclosure in the listing description and banned selling prompts.
- **The EU AI Act's Article 50** has applied since August 2, 2026: deployers must disclose deepfake images, audio and video, and providers of generative systems must mark outputs as machine-readable, with the marking duty for systems already on the market deferred to December 2, 2026 by the Digital Omnibus ([The EU AI Act's Transparency Duties](/books/user-generated-platforms/ai-on-user-generated-platforms#the-eu-ai-act-s-transparency-duties)). A realistic generated scene of a product in use is the kind of image the deepfake definition can reach; a background swap on a packshot is less likely to.
- **California's AI Transparency Act** (Business and Professions Code 22757 and following, operative August 2, 2026) puts its disclosure and detection duties on covered providers that produce generative AI systems, and later on large platforms and capture devices; a merchant using a provider's tool is not the covered provider.
- **Reviews.** The FTC's rule on consumer reviews makes it unlawful to write, create or sell a review that misrepresents "That the reviewer or testimonialist exists" or that they used the product, and the FTC said when adopting it that the rule addresses AI-generated fake reviews ([Fake Reviews and the FTC Rule](/books/commerce/reviews-and-ratings#fake-reviews-and-the-ftc-rule)). A generated summary of real reviews is lawful and is labeled as a summary, as Amazon's "Customers say" paragraph is; a generated review is not.

The provenance metadata itself (IPTC and C2PA) and why image pipelines strip it are the User-Generated Platforms volume's [Provenance: C2PA and IPTC](/books/user-generated-platforms/ai-on-user-generated-platforms#provenance-c2pa-and-iptc). The commerce point is syndication: a store's image service, its PIM's export and each feed must keep or re-attach the source type, because the channel that requires the label reads it from the file or the feed field, not from the store's database.

## AI Search and Conversational Shopping

On the store's own site, AI changes search in two steps. Semantic or hybrid retrieval matches meaning rather than words (Shopify's Semantic Search on its native search, Algolia's NeuralSearch launched in May 2023 as "vector and keyword search in a single API"); the ranking, merchandising rules and measurement that sit on top are [Site Search & Merchandising](/books/commerce/site-search-and-merchandising). A conversational assistant goes further: it answers questions, compares products and builds a cart. Amazon's Rufus, used by over 300 million customers in 2025 and renamed Alexa for Shopping in May 2026, and Walmart's Sparky are the large examples; Amazon describes Rufus as drawing on "sources it knows to be reliable" such as reviews, the catalog and community Q&A.

An assistant on a store is the store talking, which sets its requirements:

- **Answers come from the catalog, not the model's memory.** Retrieval over the store's own product records, policies and reviews, with the item IDs it used kept on the answer; a claim about a product with no record behind it is the hallucinated description problem at conversation speed.
- **It can't promise what the store won't honor.** In Moffatt v. Air Canada (2024 BCCRT 149) a tribunal rejected the argument that the airline's chatbot was "a separate legal entity that is responsible for its own actions," calling it "a remarkable submission," and held the airline liable for its bot's wrong statement of a refund policy. Policies (returns, price matching, shipping times) are answered from the policy records, and anything the assistant offers (a discount, an exception) goes through the same code that decides it elsewhere ([Decide in Code](/docs/architecture/ai-agents#decide-in-code), [The AI's Promises Are the Business's Promises](/docs/architecture/ai-agents#the-ai-s-promises-are-the-business-s-promises)).
- **It says it's a bot where the law asks.** California's B.O.T. Act makes it unlawful to use a bot to mislead a person about its artificial identity "to incentivize a purchase or sale of goods or services," with no liability if it discloses that it is a bot; Maine's 2025 law requires notice when a chatbot could mislead a consumer into thinking they are dealing with a human; Utah's law, narrowed in 2025, requires disclosure when a consumer clearly asks, and up front only for high-risk interactions in regulated occupations; and the EU AI Act's Article 50(1) requires AI systems that interact with people to tell them so unless it's obvious. A visible "AI assistant" label satisfies all of them.
- **Ranking is not pricing.** An assistant that learns a shopper's budget may reorder results; it may not raise the price, which is the personalized pricing the states now regulate ([Dynamic and Personalized Pricing](/books/commerce/pricing#dynamic-and-personalized-pricing)). Walmart's public commitment not to use what shoppers tell Sparky "to raise your price" is the line, stated by a retailer; keeping conversation data out of the pricing system is how a store keeps to it.
- **Conversations are personal data,** with the same retention and access rules as search history and support transcripts ([Recordings and Transcripts Are Personal Data](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data)).

Adobe measured traffic to US retail sites from generative AI tools up 693.4% year over year in the 2025 holiday season, from what it calls a modest base; most of that traffic is shoppers arriving from external assistants, which is [Agentic & AI Shopping](/books/commerce/agentic-commerce)'s subject and the reason product data has to be good enough for someone else's model to read.

## Support Agents

Support is where commerce AI acts rather than talks: it looks up an order, explains a delay, starts a return, cancels before shipment, updates an address, skips a subscription box. The vendors' framing is consistent: Gorgias's agent works across email, chat, SMS and social, its actions are "opt-in and configurable," and it hands over "when it can't confidently respond" or a shopper is frustrated; Zendesk bills AI agents per automated resolution, "only when a customer's issue is resolved without human help," with a model judging whether the issue was resolved.

The best-known result and its revision are both public. Klarna announced in February 2024 that its assistant handled 2.3 million conversations in its first month, two-thirds of its service chats, "the equivalent work of 700 full-time agents," with resolution in under two minutes against eleven before. In May 2025 its chief executive said in an interview that cost had been "a too predominant evaluation factor" and that the result was "lower quality," and Klarna began hiring human agents again, by press reports of the interview. <!-- source-gap: klarna-2025-quality | secondary | Klarna's May 2025 statements on AI support quality and rehiring human agents | closes with: a Klarna release, filing or the original Bloomberg interview transcript | checked: 2026-10-28 --> The lesson is about measurement: a resolution count and a handle time are cost metrics; whether the customer's problem was solved, and whether they bought again, are the quality metrics, and both belong on the dashboard.

The design is the playbook's [AI Agents](/docs/architecture/ai-agents), and the commerce specifics are the tools:

- **Order tools with the order's rules.** `cancel_order` succeeds only in states the OMS allows ([Order Management](/books/commerce/order-management)); `start_return` applies the return policy the order was placed under; a refund over a set amount or outside policy goes to a person. The model chooses a tool; the tool decides ([Tools, Not Database Access](/docs/architecture/ai-agents#tools-not-database-access)).
- **Identity before account actions.** Changing an address or cancelling a subscription requires the shopper be verified as the account holder, a known target for account takeover ([Identity Before Account Actions](/docs/architecture/ai-agents#identity-before-account-actions)).
- **Cancellation must stay easy.** An agent that answers "cancel my subscription" with retention offers until the shopper gives up is a dark pattern and, for subscriptions, a violation of cancellation law ([Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law)); the cancel tool is offered on the first request.
- **Handoff is a feature,** with the conversation and the order context passed to the human ([Human Handoff Is a Product Feature](/docs/architecture/ai-agents#human-handoff-is-a-product-feature)). The helpdesk side of this (WISMO, the order sidebar, order actions and how helpdesks deploy AI agents) is [Customer Service](/books/commerce/customer-service#chat-and-ai-agents).

## Forecasting

Demand forecasting was machine learning long before generative AI, and the commerce use is unchanged: forecast units by item, location and week to drive purchase orders, allocations and staffing ([Forecasting](/books/commerce/purchasing-and-replenishment#forecasting)). What changed is the vendor landscape (Amazon closed Amazon Forecast to new customers on July 29, 2024 and pointed them to SageMaker Canvas) and the interfaces, which now let a planner ask for a forecast in words. The rules that matter are the old ones:

- **Backtest before trusting.** A forecast is evaluated on held-out past periods against a naive baseline (last year's same week, a moving average), by item segment, with the error measure stated ([Monitoring and Drift](/docs/data/data-science-platforms#monitoring-and-drift)); a model that can't beat the baseline on slow movers shouldn't plan them.
- **Forecast demand, not sales.** Sales capped by stockouts understate demand; periods out of stock are flagged and excluded or adjusted, or the model learns that out-of-stock items don't sell.
- **The forecast is an input; the order is a decision.** A suggested purchase order carries the forecast version it came from and is approved by a buyer, with the override and its reason recorded ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).

## Pricing Models and Their Legal Limits

Models that set or suggest prices face two separate bodies of law, as of October 2026. **Personalized pricing** (a price for this shopper from their data) is regulated by New York's disclosure law and the newer state restrictions, covered in [Dynamic and Personalized Pricing](/books/commerce/pricing#dynamic-and-personalized-pricing). **Algorithmic coordination** (competitors using the same pricing software fed with nonpublic data) is an antitrust question, whose leading record is the rental housing cases in [Revenue Management & Pricing](/books/property-tech/revenue-management#the-antitrust-record-as-of-october-2026).

The coordination cases are moving in both directions. The Justice Department has filed statements of interest arguing that "An agreement to use shared pricing recommendations, list prices or pricing algorithms is still unlawful even when co-conspirators retain some pricing discretion." The Ninth Circuit, in Gibson v. Cendyn Group (August 15, 2025), affirmed dismissal of a case against hotels that each licensed the same pricing software, treating the licenses as ordinary contracts that didn't by themselves restrain trade, by law firm summaries of the opinion. California's AB 325, signed October 6, 2025, amends the Cartwright Act to make it unlawful to use or distribute a "common pricing algorithm" as part of a conspiracy or to coerce adoption of its recommendations, by secondary accounts. <!-- source-gap: ca-ab-325-text | secondary | the enacted text and effective date of California AB 325 (2025) on common pricing algorithms, and the Gibson v. Cendyn holding in the court's words | closes with: leginfo.legislature.ca.gov chaptered text and the Ninth Circuit opinion PDF (both blocked or unreadable to fetches) | checked: 2026-10-28 -->

For a retailer's repricer, the safe design follows from both: price from the merchant's own costs, inventory, demand and public competitor prices; never feed it competitors' nonpublic data, and never use a vendor that pools such data across competing clients to recommend prices; keep floors and ceilings as the merchant's rules ([The Featured Offer](/books/commerce/selling-on-amazon#the-featured-offer)); and record every price the model set with its inputs, so the question "what did this price depend on" has an answer ([Price History](/books/commerce/pricing#price-history)).

## Images for the Catalog

Image generation earns its place on lifestyle and advertising images: Amazon Ads' image generator produces lifestyle scenes from a product photo, and Amazon reported click-through rates "40% higher" for such ads in one example; Google's Product Studio and Shopify's media editor change backgrounds and extend canvases. The limits come from what a product image is for:

- **The product must be the product.** A main image shows the item as sold, accurately, and a generated image that changes the product's color, size, finish or contents is a misrepresentation whatever tool made it. Generate the setting, never the product.
- **Label and keep the metadata,** as Google requires, and keep generated images marked as such in `media_assets` so the label can be produced for any channel that asks.
- **Rights.** Shopify states it "doesn't claim ownership over images merchants create," and applies a watermark it says can't be removed; a merchant still records the tool and terms an image was made under, alongside the licensing fields media already carries ([Images and Media](/books/commerce/product-information#images-and-media)).

## Governance and Evaluation

There is no single AI law for a store as of October 2026; there are the general laws above (deception, claims, reviews, pricing, privacy, bot disclosure), the EU AI Act's transparency duties, and voluntary frameworks. NIST's Generative AI Profile (NIST AI 600-1, July 26, 2024) is "a cross-sectoral profile of and companion resource for the AI Risk Management Framework" and is the common vocabulary for a risk register. Colorado's AI Act was delayed to June 30, 2026, then repealed and reenacted by SB 26-189 (signed May 14, 2026, effective January 1, 2027) as notice, explanation, correction and human-review duties for automated decisions in consequential matters such as credit, employment and housing; a store's own pricing and recommendations generally aren't in that list, but in-house credit, financing or employment decisions are.

What makes a commerce AI feature governable is evaluation, done the way the platforms that publish theirs do it:

- **An evaluation set per feature, from real cases.** Shopify's engineering team moved from curated "golden" datasets to ground truth sets drawn from real merchant conversations, and measured its model judge against human reviewers, improving agreement from a Cohen's kappa of 0.02 to 0.61 against a human baseline of 0.69; Amazon evaluates Rufus with model judges and tracks latency, repeat engagement and turns per conversation. The pattern is the playbook's [Evals](/docs/architecture/ai-agents#evals): a fixed set, a judge checked against people, a threshold that blocks release.
- **Feature-specific checks.** For descriptions: claim accuracy against attributes and forbidden-term rates. For search and assistants: answer accuracy, grounded-in-catalog rate, add-to-cart and return rates of what it recommended. For support: resolution confirmed by the customer, reopen rate, escalation rate and refunds issued per conversation. For forecasts: backtest error against the baseline.
- **Production monitoring as well as release gates,** because catalogs, policies and models change: sample live outputs into review weekly, and re-run the evaluation set on every model or prompt change ([Shipping Models Into Products Safely](/docs/data/data-science-platforms#shipping-models-into-products-safely)).
- **A register of features,** each with an owner, its model and version, what it may do, its evaluation and its disclosure rule, so the question "where do we use AI and who approved it" has a list for an answer.

## How to Build It

Every generated artifact gets a record of how it was made and who accepted it, and every feature gets evaluation runs that gate its releases. The fields that hold content keep the provenance pointers:

```sql
CREATE TABLE ai_generations (            -- one model output, and what became of it
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  feature         TEXT NOT NULL,         -- 'product_description', 'alt_text', 'translation',
                                         -- 'review_summary', 'lifestyle_image', 'support_reply'
  subject_type    TEXT NOT NULL CHECK (subject_type IN ('product', 'item', 'media',
                    'category', 'conversation', 'purchase_order')),
  subject_id      UUID NOT NULL,
  vendor          TEXT NOT NULL,         -- the model provider or the platform tool
  model           TEXT NOT NULL,         -- the model and version as reported
  prompt_ref      TEXT NOT NULL,         -- the prompt template and version, in version control
  inputs          JSONB NOT NULL,        -- attribute IDs and versions, retrieved item IDs
  output_ref      TEXT NOT NULL,         -- the text, or the object storage key of the image
  checks          JSONB NOT NULL DEFAULT '{}',  -- automated claim and term checks, with results
  status          TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'edited', 'rejected',
                    'published', 'withdrawn')),
  reviewed_by     UUID,                  -- required before 'published' in regulated categories
  reviewed_at     TIMESTAMPTZ,
  digital_source_type TEXT CHECK (digital_source_type IN ('trainedAlgorithmicMedia',
                    'compositeWithTrainedAlgorithmicMedia', 'compositeSynthetic')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE attribute_values
  ADD COLUMN ai_generation_id UUID REFERENCES ai_generations (id);  -- set when source = 'generated'

ALTER TABLE localized_content
  ADD COLUMN ai_generation_id UUID REFERENCES ai_generations (id);  -- for method = 'machine*'

ALTER TABLE media_assets
  ADD COLUMN digital_source_type TEXT,   -- IPTC value read at ingest or set at generation
  ADD COLUMN ai_generation_id UUID REFERENCES ai_generations (id);

CREATE TABLE ai_evaluations (            -- one run of a feature's evaluation set
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  feature         TEXT NOT NULL,
  model           TEXT NOT NULL,
  prompt_ref      TEXT NOT NULL,
  eval_set_ref    TEXT NOT NULL,         -- the set and its version
  judge_ref       TEXT,                  -- the judge model and prompt, if one is used
  judge_agreement NUMERIC(4, 3),         -- kappa or agreement against human labels
  metrics         JSONB NOT NULL,        -- {"claim_accuracy": 0.991, "forbidden_terms": 0}
  thresholds      JSONB NOT NULL,        -- what the release required
  passed          BOOLEAN NOT NULL,
  run_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by     UUID                   -- who released on this run
);

-- Generated content live on the storefront without a recorded reviewer, for products in
-- categories that require a legal disclosure (the regulated ones).
SELECT g.id, g.feature, g.subject_id, g.model, g.created_at
FROM ai_generations g
JOIN products p ON g.subject_type = 'product' AND p.id = g.subject_id
WHERE g.status = 'published'
  AND g.reviewed_by IS NULL
  AND EXISTS (
    SELECT 1 FROM item_categories ic
    JOIN items i ON i.id = ic.item_id AND i.product_id = p.id
    JOIN attribute_requirements r ON r.category_id = ic.category_id
    JOIN attributes a ON a.id = r.attribute_id
    WHERE a.disclosure);
```

Design notes:

- **Output is a pointer, inputs are versions.** `inputs` names the attribute values and their versions the generation used, so when an attribute changes, every generated field built on the old value can be found and regenerated or reviewed.
- **Published content points back.** `attribute_values`, `localized_content` and `media_assets` keep `ai_generation_id`, so the storefront, the feed builder and an auditor can tell generated from written without a separate lookup, and the feed builder sets `structured_title`, `structured_description` and image metadata from it ([Multichannel Listing & Feeds](/books/commerce/multichannel-listing#how-to-build-it)).
- **Assistant and support outputs are logged with their tools.** For conversations the generation row holds the retrieved item IDs and the tool calls made, the audit trail the playbook describes in [Auditing AI Actions](/docs/architecture/ai-agents#auditing-ai-actions), with the transcript under its own retention rule.
- **Pricing and forecasting outputs aren't here.** A model-set price is a `price_history` row with its inputs ([Pricing & Price Lists](/books/commerce/pricing#how-to-build-it)); a suggested purchase order is a draft `purchase_orders` row with its forecast version ([Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#how-to-build-it)). Each domain keeps its own decision records; this table is for content.
- **Releases cite an evaluation.** A model or prompt change for a feature ships only with a passing `ai_evaluations` row, approved, the way a pricing rule ships with its test ([Rules as Data](/docs/architecture/rules-as-data)).

## Auditing

- **Who approved each generated claim.** For every generated field on a live product, the generation, its inputs, the checks it passed and the reviewer, kept for as long as the product is sold and its claims can be challenged.
- **Labels sent to channels.** Which images and texts went to each channel marked as generated, from which records.
- **What the assistant and support agent said and did.** Answers with the records they cited, tool calls with their results, refunds and cancellations they performed, and handoffs, under the transcript retention rule.
- **Evaluation history.** Every evaluation run, threshold and release decision per feature, so a regression can be dated to the change that caused it.
- **Price inputs.** For every model-set price, the inputs and whether any was personal or competitor nonpublic data.

## What This Means for the System You Build

- **Treat generated content as the merchant's statement:** ground it in records, lock regulated text, check it, and record who approved it.
- **Carry the AI label with the content** into feeds and image metadata, and don't let the image pipeline strip it.
- **Answer from the catalog and the policies,** keep the items cited on every answer, and let only code decide discounts, refunds and exceptions.
- **Say it's an AI** wherever a shopper talks to one.
- **Give support agents order tools with the order's rules,** verify identity before account actions, and keep cancellation one request away.
- **Backtest forecasts against a naive baseline** and keep the buyer's approval on every order a model suggests.
- **Keep pricing models on your own and public data,** with floors, ceilings and the inputs of every price recorded.
- **Generate the setting, never the product** in catalog images.
- **Evaluate every feature on real cases** before release and in production, and keep a register of where AI is used.

## References

**Platforms and tools**

- [Shopify Help Center: Generating product descriptions](https://help.shopify.com/en/manual/products/details/product-descriptions/shopify-magic), Sidekick descriptions, the inputs it needs and the merchant's responsibility for accuracy
- [Shopify Help Center: Tips for AI-powered tools](https://help.shopify.com/en/manual/ai-powered-tools/shopify-magic/tips), reviewing results before approving
- [Shopify: Winter '26 Edition](https://www.shopify.com/editions/winter2026), Sidekick's automations, reports, theme edits, apps and multi-step actions
- [Shopify Developers: Sidekick app extensions (June 17, 2026)](https://shopify.dev/changelog/sidekick-app-extensions-available-today.md), extensions for all app developers
- [Shopify Changelog: Semantic Search on more plans (June 24, 2024)](https://changelog.shopify.com/posts/semantic-search-is-now-available-on-more-plans), plan availability
- [Shopify Help Center: Media generation](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/shopify-magic/media-generation), the invisible watermark and image ownership
- [Amazon: Generative AI-powered product listings](https://aboutamazon.com/news/innovation-at-amazon/amazon-generative-ai-powered-product-listings), listings from a few words, an image or a URL
- [Amazon: Generative AI tools for seller growth (May 2025)](https://www.aboutamazon.com/news/innovation-at-amazon/amazon-generative-ai-seller-growth-shopping-experience), 900,000 selling partners, 90% accepted with little editing and Enhance My Listing
- [Amazon: 2025 Small Business Empowerment Report](https://www.aboutamazon.com/news/small-business/amazon-2025-small-business-empowerment-report), 12 million generated listings and Seller Assistant users
- [Amazon: Rufus](https://www.aboutamazon.com/news/retail/amazon-rufus), the May 13, 2026 rename to Alexa for Shopping
- [Amazon: Alexa for Shopping](https://www.aboutamazon.com/news/retail/alexa-for-shopping-ai-assistant), over 300 million customers helped in 2025, price history and alerts
- [Amazon: Fourth quarter 2025 results](https://www.aboutamazon.com/news/company-news/amazon-earnings-q4-2025-report), Rufus usage and nearly $12 billion in incremental annualized sales
- [Amazon: AI-generated review highlights](https://www.aboutamazon.com/news/amazon-ai/amazon-ai-generated-review-highlights), "Customers say" from verified-purchase reviews
- [Amazon Ads: AI-powered image generator](https://www.aboutamazon.com/news/innovation-at-amazon/amazon-ads-ai-powered-image-generator), lifestyle imagery and the 40% click-through example
- [Walmart: Meet Sparky (June 6, 2025)](https://corporate.walmart.com/news/2025/06/06/walmart-the-future-of-shopping-is-agentic-meet-sparky), search, review synthesis and occasion planning
- [Walmart: Letter from our CEO (September 25, 2026)](https://corporate.walmart.com/about/everyday-affordability/letter-from-our-ceo), not using Sparky information to raise prices
- [Google Merchant Center Help: Product Studio](https://support.google.com/merchants/answer/13708167?hl=en), capabilities, availability and its experimental status
- [Google Merchant Center Help: AI-generated content](https://support.google.com/merchants/answer/14743464?hl=en), image metadata, `structured_title`, `structured_description` and `digital_source_type`
- [Etsy Help: What can I sell on Etsy?](https://help.etsy.com/hc/en-us/articles/360024112614-What-Can-I-Sell-on-Etsy), disclosure of seller-prompted AI creations
- [TechCrunch: Etsy's new seller policy on generative AI (July 9, 2024)](https://techcrunch.com/2024/07/09/etsy-new-seller-policy-2024-generative-ai), disclosure in the listing description and the ban on selling prompts
- [Salesforce: Dreamforce 2024 media collection](https://www.salesforce.com/news/media-collection/dreamforce-2024/), Agentforce Merchant Agent
- [Akeneo Help: AI-enhanced enrichment](https://help.akeneo.com/ai-enhanced-enrichment-in-the-pim), generation from attribute values and assets
- [Algolia: Algolia launches NeuralSearch (May 2, 2023)](https://www.algolia.com/about/news/algolia-launches-ai-powered-algolia-neuralsearchtm-the-world-s-fastest-hyper-scalable-and-cost-effective-vector-and-keyword-search-api), vector and keyword search in one API
- [Gorgias: AI Agent explained](https://docs.gorgias.com/en-US/ai-agent-explained-497772), channels, opt-in actions and handover
- [Zendesk: About automated resolutions for AI agents](https://support.zendesk.com/hc/en-us/articles/5352026794010-About-automated-resolutions-for-AI-agents), billing per automated resolution and how resolution is judged
- [Klarna: AI assistant handles two-thirds of customer service chats (February 27, 2024)](https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/), conversations, equivalent agents and resolution time
- [Entrepreneur: Klarna CEO reverses course (May 2025)](https://www.entrepreneur.com/business-news/klarna-ceo-reverses-course-by-hiring-more-humans-not-ai/491396), the "lower quality" remarks and rehiring, reported from a Bloomberg interview
- [AWS: Transition your Amazon Forecast usage (July 29, 2024)](https://aws.amazon.com/blogs/machine-learning/transition-your-amazon-forecast-usage-to-amazon-sagemaker-canvas/), new customer access closed
- [Adobe: Holiday shopping season results (January 7, 2026)](https://news.adobe.com/news/2026/01/adobe-holiday-shopping-season), generative AI traffic to retail sites up 693.4%

**Evaluation**

- [Shopify Engineering: Building production-ready agentic systems (August 26, 2025)](https://shopify.engineering/building-production-ready-agentic-systems), ground truth sets, judge agreement and merchant simulation
- [AWS: How Rufus scales conversational shopping (November 20, 2025)](https://aws.amazon.com/blogs/machine-learning/how-rufus-scales-conversational-shopping-experiences-to-millions-of-amazon-customers-with-amazon-bedrock), model judges and the metrics tracked
- [Amazon Science: The technology behind Rufus (October 4, 2024)](https://amazon.science/blog/the-technology-behind-amazons-genai-powered-shopping-assistant-rufus), reliable sources and customer feedback
- [NIST: AI 600-1, Generative AI Profile (July 26, 2024)](https://www.nist.gov/node/1855536), the companion profile to the AI Risk Management Framework

**Law and regulators**

- [FTC: Crackdown on deceptive AI claims and schemes (September 25, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes), Operation AI Comply and "no AI exemption"
- [FTC: FTC reopens and sets aside Rytr final order (December 22, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-reopens-sets-aside-rytr-final-order-response-trump-administrations-ai-action-plan), the reasons given
- [FTC: Final rule banning fake reviews and testimonials (August 14, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), AI-generated fake reviews and civil penalties
- [16 CFR 465.2](https://www.law.cornell.edu/cfr/text/16/465.2), fake or false consumer reviews
- [California Business and Professions Code 17941](https://california.public.law/codes/business_and_professions_code_section_17941), the bot disclosure rule for commercial transactions
- [California Business and Professions Code 22757.1](https://california.public.law/codes/business_and_professions_code_section_22757.1), covered providers and large online platforms
- [California Business and Professions Code 22757.6](https://california.public.law/codes/business_and_professions_code_section_22757.6), operative August 2, 2026
- [Maine Revised Statutes, Title 10, section 1500-DD](https://legislature.maine.gov/statutes/10/title10sec1500-DD.html), chatbot notice in trade and commerce
- [Davis Polk: Utah scales back its generative AI consumer protection law](https://www.davispolk.com/insights/client-update/utah-scales-back-reach-generative-ai-consumer-protection-law), the 2025 amendment's disclosure triggers
- [Artificial Intelligence Act: Article 50](https://artificialintelligenceact.eu/article/50/), transparency obligations for providers and deployers
- [European Parliament: Procedure file 2025/0359(COD)](https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2025%2F0359%28COD%29), the Digital Omnibus on AI, Regulation (EU) 2026/1744
- [Holland & Knight: Colorado governor signs SB 26-189 (May 2026)](https://www.hklaw.com/en/insights/publications/2026/05/colorado-governor-signs-sb-189), the repeal and reenactment of the Colorado AI Act, effective January 1, 2027
- [McCarthy Tetrault: Moffatt v. Air Canada](https://www.mccarthy.ca/en/insights/blogs/techlex/moffatt-v-air-canada-misrepresentation-ai-chatbot), the tribunal's holding on chatbot statements, quoting the decision
- [Justice Department and FTC: Statement of interest on hotel room algorithmic pricing](https://www.justice.gov/archives/opa/pr/justice-department-and-federal-trade-commission-file-statement-interest-hotel-room), shared pricing algorithms and retained discretion
- [Baker McKenzie: Ninth Circuit on algorithmic pricing (August 2025)](https://www.bakermckenzie.com/en/insight/publications/alerts/2025/08/united-states-ninth-circuit-on-algorithmic-pricing), Gibson v. Cendyn Group
