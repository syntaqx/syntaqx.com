+++
title = "AI in Payments"
description = "Models in payments: fraud scoring, authorization optimization, disputes, onboarding and support, agentic commerce mandates, model risk and adverse action."
category = "Payments Industry"
order = 1434
part = "Running a Provider"
aliases = []
tags = ["payments", "ai", "fraud", "agentic-commerce", "model-risk", "compliance"]
+++

Payments ran on machine learning long before the word AI was on every product page. An online card authorization is typically scored more than once before the issuer answers: by the merchant's provider, and by the network on the issuer's behalf. What changed recently is reach. Models now rewrite authorization messages to win approvals, assemble dispute evidence, read onboarding documents, answer merchants' support questions and, newest of all, act for consumers as **agents** that find a product and pay for it. Each of those moves a model closer to deciding who gets money and who doesn't, which is the part of payments the law watches most closely.

The general engineering of an agent that acts (narrow tools, typed results, decisions in code, identity before account actions, evals, an audit trail) is in [AI Agents in the Product](/docs/architecture/ai-agents), and defending one against manipulation is in [AI & LLM Security](/docs/security/ai-security). Scoring, thresholds and feedback loops in general are in [Risk Scoring](/docs/architecture/risk-scoring), and the payments decisions they feed are in [Fraud & Risk](/books/payments/fraud-and-risk). This chapter is what payments adds: which models already decide, what the vendors and networks ship, how an agent may be allowed to pay, and the model risk, fair lending and explanation rules that apply when a model says no.

## Where Models Decide

| Use | Who runs the model | What it decides or proposes | What stays deterministic |
| --- | --- | --- | --- |
| **Fraud scoring** | Networks for issuers, providers for merchants, merchants' own vendors | A risk score per payment, account or merchant | The action taken at each score, rules on top, blocklists |
| **Authorization optimization** | Providers | How the authorization is formatted, routed and retried | Network retry limits, never retrying a hard decline |
| **Disputes** | Providers and networks | Which evidence to submit, whether to fight | Deadlines, reason code requirements, Compelling Evidence eligibility |
| **Onboarding and monitoring** | Providers and verification vendors | Whether documents and screening hits look right | Sanctions decisions, required checks, approval authority |
| **Support** | Providers and platforms | Answers and summaries | Refunds, payout changes and anything that moves money |
| **Agentic commerce** | Consumers' agents, with network credentials | What to buy and when to pay | The mandate: merchant, amount, expiry, revocation |

The pattern across all of them is the one in [Decide in Code](/docs/architecture/ai-agents#decide-in-code): the model scores, drafts or proposes, and code that the business can read and change decides what happens. In payments the line is drawn by money: a model may recommend a refund, never issue one on its own judgment.

## How the Platforms Do It

What the networks and providers publish, as of October 2026. Performance figures are the vendors' own and labeled as such.

| Vendor | Product | What its documentation says |
| --- | --- | --- |
| **Adyen** | Adyen Protect (risk management) | Enabled by default; every payment gets a risk evaluation ending in "block, allow, or review", with machine learning trained on "global transaction data" and custom rules on top |
| **Adyen** | Uplift | Modules for personalizing checkout, tokenizing, protecting, authenticating and optimizing; vendor-reported up to 6% higher conversion and up to 5% lower payment costs |
| **Mastercard** | Decision Intelligence | A network risk score for issuers at authorization |
| **Stripe** | Radar | Evaluates "transactions, accounts, and customers in real time, using AI algorithms"; a payments foundation model trained on "tens of billions of transactions" was announced in May 2025 |
| **Stripe** | Authorization Boost | Bundles Adaptive Acceptance ("machine learning to increase acceptance rates"), network tokens, card account updater and retry controls, priced at 0.2% per successful online card transaction |
| **Stripe** | Smart Disputes | "Uses an AI rules engine" to compile evidence from Stripe, transaction and cardholder data, and submits it "just before the dispute times out", for a fee only if the dispute is won |
| **Visa** | Visa Advanced Authorization | A "network-agnostic risk score" that helps issuers detect fraud at authorization, analyzing "400 risk attributes"; Visa credits its fraud tools with $30 billion of fraud prevented annually (VisaNet data, July 2023 to June 2024) |
| **Visa** | Dispute services (April 2026) | Dispute Intelligence "powered by predictive AI models", a document analyzer for acquirers and issuers, and a recovery manager that drafts responses and predicts win likelihood |

Read the table for what it implies. **Networks score for issuers, providers score for merchants,** and a payment passes through both, so a merchant's own fraud model is the third opinion, not the first. **Optimization is sold as a bundle** of model-driven retries and formatting with network services (tokens, updater) that aren't models at all; measure the bundle against a holdout, not against the vendor's average. And **dispute automation is arriving on both sides:** providers assemble merchants' evidence, and Visa sells acquirers and issuers tools to read and judge it.

## Fraud Scoring

A card-not-present payment is scored by the merchant's provider before it's sent, and by the network for the issuer while it's in flight; the issuer decides with both. The merchant or platform adds its own layer where it knows something the others don't: account history, order contents, delivery address, device. How the layers combine, and the rules that act on a score, are in [Fraud & Risk](/books/payments/fraud-and-risk#rules-models-and-decisions); thresholds, calibration and the cost of each error are in [Risk Scoring](/docs/architecture/risk-scoring).

Three things are specific to payments.

**The provider's model sees across merchants.** Stripe's description of its payments foundation model is the clearest public statement of why that matters: each payment becomes an embedding learned from tens of billions of transactions, and Stripe reported its card-testing detection on large users rising "from 59% to 97%" overnight. Those are the vendor's figures, and the point holds without them: a single merchant's history can't learn what an attack across thousands of merchants looks like. Use the provider's score as an input, and keep your own decision on top of it.

**Labels arrive late and from outside.** A payment is labeled fraud by an issuer's fraud report or a dispute, weeks after the decision, and the networks count those reports toward monitoring ratios whether or not a dispute follows ([Monitoring Programs](/books/payments/disputes-and-chargebacks#monitoring-programs-the-threshold-that-ends-accounts)). A model retrained on disputes alone learns only from what it let through; hold out a sample of borderline traffic, as [Feedback Loops](/books/payments/fraud-and-risk#labels-and-outages) describes.

**Fraud models aren't credit models, in law.** The EU AI Act lists AI systems used to evaluate creditworthiness as high-risk, "with the exception of AI systems used for the purpose of detecting financial fraud" (Annex III, point 5(b)). A fraud score that blocks a payment is outside that category; the same kind of model deciding whether a merchant gets a cash advance is inside it. Keep the two uses separate in your model inventory, because the obligations differ.

## Authorization Optimization

Optimization models change how an authorization is sent rather than whether it's allowed: which fields to include, how to format them for a given issuer, whether to send a network token or the card number, which route to use, and when to retry a soft decline. Stripe's Adaptive Acceptance "optimizes messaging, formatting and retries"; Adyen's Uplift spans tokenizing, authenticating and routing.

The rules around a model like that are fixed by the networks, not learned:

- **Never retry a hard decline,** and stay under each network's retry limits per card ([Declines, and the Rules on Retrying](/books/payments/stored-credentials#declines-and-the-rules-on-retrying)). A model that finds a retry pattern issuers approve is still bound by the count.
- **Never change data to get a different answer.** Reformatting a field the issuer reads differently is optimization; changing the merchant category, the amount or the initiation type to slip past a decline is misrepresentation.
- **Keep the raw response.** The model's classification sits beside the issuer's code and Mastercard's merchant advice code, so a wrong classification can be found and fixed ([One Response Model](/books/payments/processor-routing#one-response-model)).

Vendor uplift figures (Stripe reports an average 3.8% revenue increase from Authorization Boost; Adyen up to 6% higher conversion from Uplift) are averages over their customers. Measure your own with a randomized holdout and the authorization rate defined as in [Payments Metrics](/books/payments/payments-metrics#acceptance), deduplicated, or a feature that adds retries will look like it raised approvals while it only raised attempts.

## Disputes: Compiling Evidence

A dispute response is a document assembled from what was captured at payment time: the order, delivery, device and IP data, login history, prior undisputed payments on the same card, and the terms the customer accepted ([Reason Codes Decide the Evidence](/books/payments/disputes-and-chargebacks#reason-codes-decide-the-evidence)). That's a retrieval and drafting job, which is why it's an early target for models. Stripe's Smart Disputes picks evidence by reason code and submits it automatically; Visa's April 2026 dispute services put models on the other side, with a document analyzer generally available to acquirers and a recovery manager that drafts responses and scores the likelihood of winning, in pilot.

What a model may do here, and what it may not:

- **Retrieve and draft.** Pull the records each reason code asks for, and draft the narrative. The records come from your systems by ID, never from the model's memory, so every fact in the packet traces to a stored record.
- **Never invent evidence.** A packet with a fabricated delivery confirmation is fraud against the issuer. The model selects and summarizes; it doesn't create documents.
- **Eligibility is deterministic.** Whether a dispute qualifies for Compelling Evidence 3.0 (two prior undisputed payments on the card between 120 and 365 days earlier, with matching device or IP plus one more element) is a query, not a judgment ([Prevention Beats Winning](/books/payments/disputes-and-chargebacks#prevention-beats-winning)).
- **The deadline is code.** Submission before the network's deadline is a scheduled job with an alert, whatever the model is doing.

## Onboarding, Monitoring and Support

**Business verification.** Know-your-business review is document-heavy: articles of incorporation, ownership records, bank letters, websites, adverse media and sanctions screening hits ([Merchant Onboarding](/books/payments/merchant-onboarding)). Verification vendors now sell agents for the reading: Middesk describes agents "specialized in research and interpretation of business data and risks" that dismiss "clear false positive screening hits" and weigh how material a lawsuit is. Use models to extract, compare and triage; keep the decisions that carry legal weight (a sanctions match, approval of a high-risk merchant, a beneficial ownership determination) with a named person and recorded reasons, because a sponsor bank's examiner will ask who decided ([Gatekeeping](/books/payments/becoming-a-payment-provider#gatekeeping-sanctions-aml-and-losses)).

**Ongoing monitoring.** The same models read what merchants actually sell (descriptors, websites, ticket sizes) against what was underwritten, the transaction laundering check in [Merchant Fraud](/books/payments/fraud-and-risk#merchant-fraud). A model alert opens a case; it doesn't close an account.

**Support.** Merchants and payers ask where a payout is, why a payment declined and what a fee was. A support model can answer from the ledger, the payment's history and the decline code, through tools that return exact records. The CFPB's 2023 review of chatbots in consumer finance named the risks: noncompliance with consumer financial law, "doom loops" with no path to a human, and harm when the bot gets it wrong. Its spotlight estimated that about 37% of the US population interacted with a bank's chatbot in 2022. The payments-specific rules:

- **Identity before account actions,** proportional to what the action moves ([Identity Before Account Actions](/docs/architecture/ai-agents#identity-before-account-actions)).
- **Money moves only through the console's named actions,** with the same approvals a person would need ([The Internal Console](/books/payments/operating-the-platform#the-internal-console)).
- **Error claims start a clock.** A consumer reporting an unauthorized bank debit to a chatbot may well have given notice under Regulation E, so my rule is that the bot's intake creates the error case with its deadlines ([Complaints and Error Resolution](/books/payments/operating-the-platform#complaints-and-error-resolution)).
- **The model never hears a card number.** Payment collection goes through a link or a secure field, as in [Speech, Transcripts and AI](/books/payments/phone-payments#speech-transcripts-and-ai).

## Agentic Commerce

The newest use turns the model into the payer's representative: an agent that searches, compares, fills a cart and pays. The networks and large providers have each published a way to let it pay without handing it a card number. As of October 2026:

- **Visa Intelligent Commerce** gives agents tokenized credentials in place of card details, with consumer-set spending limits and conditions. On December 18, 2025 Visa reported "hundreds" of agent-initiated transactions completed in live production, more than 100 partners, and pilots in Asia-Pacific and Europe for early 2026. On April 8, 2026 it announced Intelligent Commerce Connect, an "on ramp" that is "network, protocol, and token vault-agnostic", in pilot with a set of partners, supporting its own Trusted Agent Protocol alongside other protocols. Visa's Trusted Agent Protocol lets merchants verify an agent by cryptographic signature; Visa's developer page describes it as in development and deployment.
- **Mastercard Agent Pay** issues agentic tokens to registered agents. On September 10, 2025 Mastercard said all US cardholders would be enabled for the program by the holiday season, with Citi and U.S. Bank cardholders first and global rollout after.
- **The Agentic Commerce Protocol,** published by OpenAI and Stripe as founding maintainers under Apache 2.0, defines how an agent and a seller exchange carts and orders; its README calls the spec "beta", with date-based versions from 2025-09-29 to 2026-04-17. Payment travels as a **shared payment token** in Stripe's implementation: scoped to one seller, with usage limits for currency, a maximum amount and an expiry, revocable by the agent, and possibly backed by a Visa or Mastercard agentic token. Stripe documents it as available in the US, Canada and selected European countries on a preview API version.
- **The Agent Payments Protocol (AP2)** was launched by Google on September 16, 2025 with signed **mandates**, "tamper-proof, cryptographically-signed digital contracts" recording what the user authorized. On April 28, 2026 Google donated AP2 to the FIDO Alliance, with version 0.2 adding "Human Not Present" payments; the current specification names a Checkout Mandate and a Payment Mandate, signed as verifiable digital credentials.
- **Others:** American Express announced a developer kit and Agent Purchase Protection for erroneous purchases by registered agents on April 14, 2026, and Cloudflare and Coinbase formed the x402 Foundation in September 2025 for pay-per-request payments over HTTP 402.

Two things are true at once. The plumbing is real: tokens scoped to an agent and a merchant, signed records of what the user asked for, and live transactions. And volume and rules are early: protocols are versioned as beta or donated to standards bodies mid-flight, and the liability questions below are open. Build so the protocol is an adapter and the mandate is yours.

## What an Agent May Initiate

Every scheme above converges on the same authorization model: the user grants an agent a **mandate**, a scoped, expiring, revocable permission to pay, and every payment the agent makes is checked against it. Model it before choosing a protocol.

- **Scope.** Which merchants (one seller, as Stripe's shared payment token is scoped; or a category), what the purchase is (a specific cart, or a description of acceptable items), and a maximum amount per payment and in total.
- **Time.** An expiry, and for recurring needs, a frequency, the way a standing instruction carries one ([Stored Cards & Recurring Billing](/books/payments/stored-credentials#who-started-the-payment)).
- **Presence.** Whether the user approves each payment (human present, often with authentication on the user's device) or delegated it in advance (AP2's "Human Not Present"). The first looks like a customer-initiated payment; the second is closer to a merchant-initiated one under an agreement, and the evidence you keep should match whichever it is.
- **Revocation.** The user can revoke at any time, and revocation takes effect before the next attempt, not at the next sync.
- **Evidence.** The signed mandate, the exact terms shown, the agent's identity and the user's authentication, kept like the consent record of a stored credential ([The Credential Record](/books/payments/stored-credentials#the-credential-record)), because it's what answers a dispute.

Who carries the loss when an agent buys the wrong thing is not settled. A law firm's April 2026 analysis noted that "it is currently unresolved whether a consumer granting an AI agent access" to an account satisfies Regulation E's authorization concept, and that Regulation E "leaves open what happens if an AI agent violates the consumer's instructions." Amex's Agent Purchase Protection is one issuer's answer for its cards. Until rules settle, my default is to treat any payment outside the mandate's scope as unauthorized: refuse it in code before it's sent, and if one gets through, refund it rather than litigate whether the agent's mistake bound the user. [AI Agents in the Product](/docs/architecture/ai-agents#the-ai-s-promises-are-the-business-s-promises) covers what an agent's promises commit the business to in general.

On the merchant side, an agent is a new kind of customer to verify. Visa's Trusted Agent Protocol relies on agents signing their requests so a merchant can tell a registered agent from a bot. Treat a verified agent as a signal in the risk check, not a pass: the card-testing defenses in [Fraud & Risk](/books/payments/fraud-and-risk#card-testing) still apply to traffic that arrives with a signature.

## Model Risk, Fair Lending and UDAAP

Payments providers often sit inside a bank's oversight through their sponsor bank, and the banking agencies' view of models tends to reach them through that relationship even where it doesn't apply to them directly ([The Sponsor Bank](/books/payments/becoming-a-payment-provider#the-sponsor-bank)).

**Model risk guidance changed in 2026.** On April 17, 2026 the Federal Reserve, OCC and FDIC issued new model risk management guidance (SR 26-2, OCC Bulletin 2026-13) that supersedes SR 11-7, the 2011 guidance most bank model governance was built on. The new definition of a model is "a complex quantitative method, system, or approach that applies statistical, economic, or financial theories" to produce estimates, which excludes simple arithmetic and deterministic rule-based processes. The guidance says it is "most relevant to banking organizations with over $30 billion in total assets," that it "does not set forth enforceable standards," and that "generative AI and agentic AI models... are not within the scope of this guidance," with a request for information planned. So a fraud or credit model is squarely a model; an LLM support agent sits outside the new guidance, and its governance comes from the sponsor bank's own policy. Expect the bank to ask for an inventory, validation before use, ongoing monitoring and a named owner for every model that touches its customers.

**Fair lending.** Where a provider extends credit (merchant cash advances, working capital, pay-later at checkout), the Equal Credit Opportunity Act and Regulation B apply, including to business credit. An applicant who is denied gets a notice within 30 days of a completed application, and the reasons "must be specific and indicate the principal reason(s)"; citing "the creditor's internal standards or policies" or that the applicant "failed to achieve a qualifying score" is insufficient (12 CFR 1002.9). The CFPB's 2022 circular saying that this applies just the same to complex algorithms was among the guidance documents it withdrew on May 12, 2025, but the regulation it interpreted didn't change: the notice still has to state specific reasons, so a model that can't produce them can't be used to deny credit.

**UDAAP.** Unfair, deceptive or abusive acts and practices cover what a model says to consumers as much as what a person says. A support bot that misstates a fee, a dispute right or a refund timeline, or that traps a consumer without a path to a person, is the conduct the CFPB's chatbot review warned about ([The Consumer Protection Layer](/books/payments/payments-rulebook#the-consumer-protection-layer)).

**Outside the US.** The EU AI Act's obligations for high-risk systems listed in Annex III, creditworthiness among them, were due from August 2, 2026; the Digital Omnibus (Regulation (EU) 2026/1744, in force July 27, 2026) moved them to December 2, 2027. Fraud detection is outside that category, as above.

## Explaining a Decision

"The model said so" isn't an answer to a merchant whose application was declined, a customer whose payment was blocked, or an examiner. What each needs:

- **A declined credit applicant** gets specific principal reasons under Regulation B. Map model features to a fixed list of reason statements, versioned with the model, and generate the notice from the features that drove the decision, not from a model's free-text summary.
- **A declined merchant application** isn't a credit decision in most cases, but the sponsor bank expects the reasons on file, and a merchant who asks deserves a category (identity not verified, prohibited business, risk) without the detail that would help a fraudster reapply.
- **A blocked payment** gets a generic decline to the payer (never "our fraud model flagged you"), and the full record (score, model version, matched rules) for support and review ([Auditable Decisions](/books/payments/fraud-and-risk#auditable-decisions)).
- **An agent's payment** carries the mandate it was checked against and the result of each check, so "why did my agent buy this" is answered from the record.

## How to Build It

The [core data model](/books/payments/card-payments#the-core-data-model) holds merchants, customers, payments and their attempts, and [Fraud & Risk](/books/payments/fraud-and-risk#how-to-build-it) already records every fraud decision in `risk_decisions`, with score, model version and rule set. AI adds two records: every other model decision that touched money (and a link from a fraud decision to the model output behind it), and every mandate an agent pays under.

```sql
-- One row per model decision that affected a payment, merchant or dispute
CREATE TABLE model_decisions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_type    TEXT NOT NULL,        -- payment_attempt | merchant_application | dispute | support_case
  subject_id      UUID NOT NULL,
  use             TEXT NOT NULL,        -- fraud_score | auth_optimization | dispute_evidence | kyb_review | credit
  risk_decision_id UUID REFERENCES risk_decisions (id),  -- for fraud_score: the decision it fed
  provider        TEXT NOT NULL,        -- own | vendor name
  model_version   TEXT NOT NULL,        -- as the provider reports it, or our registry version
  score           NUMERIC,
  reason_codes    TEXT[],               -- fixed, versioned reason statements, for notices
  output          JSONB,                -- the proposal: retry plan, evidence list, draft
  action          TEXT NOT NULL,        -- what code did: allow | review | challenge | block | submitted | escalated
  rule_version    TEXT NOT NULL,        -- the deterministic policy that turned output into action
  decided_at      TIMESTAMPTZ NOT NULL
);

-- What a user authorized an agent to pay for
CREATE TABLE agent_mandates (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id         UUID NOT NULL REFERENCES customers (id),
  agent_id            TEXT NOT NULL,     -- the agent's verified identity
  protocol            TEXT NOT NULL,     -- acp | ap2 | network program
  merchant_scope      TEXT[] NOT NULL,   -- seller IDs or categories
  max_amount          BIGINT NOT NULL,   -- minor units, per payment
  total_limit         BIGINT,            -- minor units, over the mandate's life
  currency            CHAR(3) NOT NULL,
  presence            TEXT NOT NULL,     -- human_present | human_not_present
  expires_at          TIMESTAMPTZ NOT NULL,
  revoked_at          TIMESTAMPTZ,
  signed_mandate      BYTEA NOT NULL,    -- the credential as received, for disputes
  terms_version       TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL
);

ALTER TABLE payment_attempts
  ADD COLUMN agent_mandate_id UUID REFERENCES agent_mandates (id);
```

- **A fraud score keeps one decision record.** The action lives in `risk_decisions` as it always has; the `model_decisions` row holds what the model itself returned, so the two can be compared when either changes.
- **The model's output and the code's action are separate columns.** A review asks both "what did the model propose" and "what did the policy do with it", and they change on different schedules.
- **`reason_codes` come from a fixed list,** so a credit notice or a support answer can be generated from them without asking a model to explain itself after the fact.
- **A payment under a mandate references it,** and the check (merchant in scope, amount under both limits, not expired, not revoked) runs in the payment path, in code, before the authorization is sent.

## Auditing

Record each model and agent as its own actor, with its version, every tool call including the ones it was refused, and the person who approved anything above its authority, as [Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions) describes. What payments adds:

- **A model inventory the sponsor bank can read.** Every model that touches payments, merchants or credit: use, owner, vendor or in-house, version history, validation results and monitoring metrics.
- **Vendor scores kept as received.** The provider's or network's score and the version it reports, beside your own decision, so a change in a vendor model is visible in your data.
- **Holdouts and backtests on file.** The experiment design and results behind every threshold change and every claimed uplift.
- **Dispute packets traceable to records.** Each item in a submitted packet points to the stored record it came from, and the model's draft is kept beside the submitted version.
- **Mandates and their checks.** For every agent payment, the mandate, the checks run and their results, and any revocation with its time.
- **Adverse action notices as sent,** with the reason codes and model version behind them, for the retention period Regulation B requires.

## What This Means for the System You Build

- **Models propose, code decides,** and anything that moves money goes through the same named actions and approvals a person would use.
- **Use vendor and network scores as inputs,** keep them as received, and put your own versioned policy on top.
- **Measure optimization with a holdout,** on a deduplicated authorization rate, and keep network retry limits as hard rules.
- **Draft dispute packets from stored records only,** with eligibility and deadlines in code.
- **Model the agent mandate yourself:** scope, limits, presence, expiry, revocation and the signed evidence, with protocols as adapters.
- **Treat payments outside a mandate as unauthorized,** refused before they're sent.
- **Keep a model inventory** for the sponsor bank, with fraud and credit uses separated, and reason codes that can produce specific adverse action reasons.
- **Give support bots a path to a person,** identity checks before account actions, and error intake that starts the legal clock.

## References

**Specifications**

- [12 CFR 1002.9: Notifications (Regulation B)](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/), adverse action notice timing and the requirement for specific principal reasons
- [EU AI Act: Annex III](https://artificialintelligenceact.eu/annex/3/), creditworthiness as high-risk with the exception for detecting financial fraud (point 5(b))
- [EU AI Act: Digital Omnibus](https://artificialintelligenceact.eu/ai-act-explorer/digital-omnibus/), Regulation (EU) 2026/1744 moving Annex III obligations to December 2, 2027
- [Federal Reserve: SR 26-2, Model risk management](https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm), the April 17, 2026 guidance superseding SR 11-7, and its $30 billion relevance threshold
- [OCC: Bulletin 2026-13, Model risk management](https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-13.html), the new model definition, non-enforceable status and the exclusion of generative and agentic AI
- [Agentic Commerce Protocol (GitHub)](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol), the beta specification, founding maintainers and dated versions
- [AP2: Agent Payments Protocol](https://ap2-protocol.org/), Checkout and Payment Mandates as verifiable digital credentials, and standardization at FIDO

**Reference**

- [Federal Register: Withdrawal of CFPB guidance documents (May 12, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-05-12/html/2025-08286.htm), withdrawal of Circulars 2022-03 and 2023-03 among 67 documents
- [CFPB: Chatbots in consumer finance](https://www.consumerfinance.gov/about-us/newsroom/cfpb-issue-spotlight-analyzes-artificial-intelligence-chatbots-in-banking), the 2023 issue spotlight on chatbot risks and the 37% estimate
- [Fenwick: Is 2026 the year of agentic payments?](https://www.fenwick.com/insights/publications/is-2026-the-year-of-agentic-payments), the unresolved Regulation E questions for agent-initiated payments
- [Visa: Secure card payments](https://www.visa.com/en-us/solutions/secure-card-payments), Visa Advanced Authorization, its risk attributes and the annual fraud prevented figure
- [Visa: Intelligent Commerce momentum (December 18, 2025)](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21961.html), live agent-initiated transactions, partners and 2026 pilots
- [Visa: Intelligent Commerce Connect (April 8, 2026)](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.22276.html), the network-, protocol- and vault-agnostic on ramp and supported protocols
- [Visa Developer: Trusted Agent Protocol](https://developer.visa.com/capabilities/trusted-agent-protocol), agent verification by signature, in development and deployment
- [Visa: Dispute services (April 1, 2026)](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.22261.html), Dispute Intelligence, the document analyzer and the recovery manager
- [Mastercard: Agentic commerce tools and collaborations (September 10, 2025)](https://investor.mastercard.com/investor-news/investor-news-details/2025/Mastercard-Unveils-New-Tools-and-Collaborations-to-Power-Smarter-Safer-Agentic-Commerce/default.aspx), Agent Pay enablement for US cardholders
- [Google Cloud: Announcing the Agent Payments Protocol](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol), the September 16, 2025 launch and signed mandates
- [Google: AP2 donated to the FIDO Alliance](https://blog.google/products-and-platforms/platforms/google-pay/agent-payments-protocol-fido-alliance/), April 28, 2026, and version 0.2 with Human Not Present payments
- [Cloudflare: x402](https://blog.cloudflare.com/x402/), the x402 Foundation with Coinbase and pay-per-request over HTTP 402

**In practice**

- [Stripe: Radar](https://docs.stripe.com/radar), real-time AI evaluation of transactions, accounts and customers
- [Stripe: Using AI to optimize payments performance](https://stripe.com/blog/using-ai-optimize-payments-performance-payments-intelligence-suite), the payments foundation model, its training data and the card-testing detection figures (May 15, 2025)
- [Stripe: Authorization Boost](https://stripe.com/authorization-boost), Adaptive Acceptance and the bundled services, vendor-reported uplift and pricing
- [Stripe: Smart Disputes](https://docs.stripe.com/disputes/smart-disputes), automated evidence by reason code and submission before the deadline
- [Stripe: Shared payment tokens](https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens.md?agent-seller=agent), seller scope, usage limits, expiry, revocation and availability
- [Adyen: Risk management](https://docs.adyen.com/risk-management/), default risk evaluation, machine learning on global transaction data and custom rules
- [Adyen: Uplift](https://www.adyen.com/uplift), the modules and vendor-reported conversion and cost figures
- [Middesk: The new era of Middesk](https://middesk.com/blog/the-new-era-of-middesk), agents for business verification research and screening triage
- [Fortune: American Express AI payments and purchase protection (April 14, 2026)](https://www.fortune.com/2026/04/14/american-express-ai-payments-developers-purchase-protection/), the developer kit and Agent Purchase Protection for registered agents
