+++
title = "AI in Investing"
description = "AI research assistants, AI advice, AI-washing enforcement, the withdrawn analytics rule, AI in surveillance and support, and agents that trade or hold wallets."
category = "Investing & Digital Assets Industry"
order = 2579
part = "Running the Platform"
tags = ["investing", "crypto", "ai", "agents", "advice", "compliance"]
+++

AI reached investing products from three directions at once. Brokers put assistants in the app that summarize why a stock moved, explain a filing or answer questions about a portfolio. Advisers and robo-advisers describe their models as AI, sometimes accurately. And agents, programs that act on a customer's behalf, started placing orders through broker accounts made for them and holding crypto in wallets of their own. None of it arrived with a new rulebook. The SEC proposed one in 2023 for predictive analytics in investor interactions and withdrew it in June 2025, so as of November 2026 the rules that apply are the ones that applied before: communications standards, Regulation Best Interest, the adviser's fiduciary duty, the Marketing Rule, supervision, recordkeeping and market access controls. FINRA said so in two sentences: it intends its rules and guidance "to be technologically neutral," and "the rules apply when member firms use AI, including Gen AI."

The chapter covers where models decide in a broker or exchange, how the platforms describe their AI products, research assistants and when their output becomes a recommendation, AI advice, the withdrawn predictive data analytics proposal, AI-washing enforcement, AI in surveillance and support, and agents that trade or hold wallets, with an agent's limits in worked numbers. Model risk management as banks practice it is the Banking & Lending volume's [Model Risk Management](/books/banking-and-lending/model-risk); agents that pay for things are the Payments volume's [Agentic Commerce](/books/payments/ai-in-payments#agentic-commerce); AI-driven investment scams on social platforms are the User-Generated Platforms volume's [Crypto Investment Scams](/books/user-generated-platforms/crypto-investment-scams). The general engineering is the playbook's ([LLM Features](/docs/building-blocks/llm-features), [AI Agents](/docs/building-blocks/ai-agents), [AI Security](/docs/security/ai-security)). The chapter adds `ai_use_cases`, `agent_accounts` and `agent_actions` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model).

## Where Models Decide

| Use | What can go wrong | The rule that already applies |
| --- | --- | --- |
| A research assistant summarizing a stock's move, a filing or an earnings call | A wrong number, a stale fact, a summary that reads as advice | FINRA 2210 content standards; Reg BI if it recommends ([Recommendations in an App](/books/investing-and-digital-assets/advice-and-conduct#recommendations-in-an-app)) |
| Portfolio digests and alerts | A nudge to trade optimized for engagement | Reg BI, 2210; the conflict question the withdrawn proposal asked |
| AI or robo advice | Advice that doesn't fit the client, a conflict hidden in the model | The adviser's fiduciary duty, Form ADV disclosure ([Robo-Advisors & Model Portfolios](/books/investing-and-digital-assets/robo-advisors)) |
| Marketing that says "AI" | A claim the firm can't support | The Marketing Rule and 2210 (AI washing, below) |
| Surveillance and AML triage | Missed manipulation, alerts closed by a model nobody can explain | FINRA 3110 supervision, AML program rules ([Market Surveillance & Manipulation](/books/investing-and-digital-assets/market-surveillance)) |
| Support chat | A promise the firm must keep, an account change the model shouldn't make | Communications and recordkeeping rules; the firm's own terms |
| Fraud and takeover detection | Holds on the wrong customers, takeovers released | The firm's policies; complaint and case clocks ([Account Security & Fraud](/books/investing-and-digital-assets/account-security)) |
| Agents that place orders or move crypto | Orders the customer didn't intend, a drained wallet, prompt injection | Market access controls, the account's authorizations, the customer agreement |

My rule for every row is the playbook's: choose the feature by the cost of being wrong ([Choose Features by the Cost of Being Wrong](/docs/building-blocks/llm-features#choose-features-by-the-cost-of-being-wrong)), keep the model's output as a proposal that code checks before anything happens to an account ([Decide in Code](/docs/building-blocks/ai-agents#decide-in-code)), and record what the model said as a communication the firm made.

## How the Platforms Do It

As of November 2026, from filings, company repositories and regulators:

| Who | What's public | Source |
| --- | --- | --- |
| **Robinhood** | Robinhood Cortex, "an AI investment tool designed to provide real-time analysis and insights," with Stock and Portfolio Digests summarizing market moves; AI used "to increase the efficiency of our in-app chat support, customer support workflows" and in fraud detection; plans for "building complex AI agents" and "our first AI-native advisory products"; in the third quarter of 2026, about 200,000 customers had opened Agentic Trading Accounts, which had driven over $1.6 billion of notional volume, and Robinhood Agents and Agent Apps were announced at its September summit | 2025 Form 10-K; Q3 2026 results |
| **Coinbase** | AgentKit, the Coinbase Developer Platform's open-source toolkit ("Every agent deserves a wallet"), framework-agnostic and wallet-agnostic (wallet providers for CDP, Privy and Viem; LangChain, Vercel AI SDK, OpenAI Agents SDK, Model Context Protocol and others); the project says it "does not gate transfers behind human approval, enforce spend caps, or allowlist destinations," and warns that text reaching the model can influence the agent's actions, including transfers | GitHub repository |
| **Delphia, Global Predictions** | Settled SEC charges in March 2024 for claims about AI they couldn't support (below) | SEC press release 2024-36 |
| **FINRA** | Rules are "technologically neutral"; Rule 3110 supervision and Rule 2210 communications apply to generative AI; listed uses include summarizing documents, investor education, querying policies, summarizing research, extracting issuer information from filings and transcripts, and summarizing potential evidence of market abuse for surveillance staff | Regulatory Notice 24-09 (June 27, 2024) |

Three patterns run through it:

- **Summaries came first.** Every public broker use starts with explaining: a stock's move, a portfolio's day, a filing. They are the lowest-risk uses because a person decides what to do next, and the highest-volume, because every customer sees them.
- **Agents got accounts, not credentials.** Robinhood's Agentic Trading Accounts and the agent wallet toolkits give an agent its own account or wallet with its own limits, rather than the customer's password. That is the right shape, and it puts the limits in the platform's hands.
- **The guardrails are the platform's job.** AgentKit says plainly that spend caps and allowlists are not built in. Whoever holds the account or the keys decides how much an agent can lose.

## Research Assistants and Summaries

An assistant that explains a stock's move is a communication from a broker-dealer to a retail investor, whatever produced the words. FINRA Notice 24-09 states that Rule 2210's content standards apply whether a person or a technology tool generates the communication, so the output must be fair and balanced, can't omit material facts that make it misleading, and can't promise or project performance ([FINRA Rule 2210 for Broker Communications](/books/investing-and-digital-assets/advice-and-conduct#finra-rule-2210-for-broker-communications)). What that means for a build:

- **Ground every claim in a source the firm holds.** A digest is built from the firm's own market data, the issuer's filings and licensed news, retrieved and cited, not from a model's memory ([Retrieval](/docs/building-blocks/llm-features#retrieval)). A number in the output that doesn't trace to a retrieved source is a defect the evaluation suite catches before release ([Evals Are Tests](/docs/building-blocks/llm-features#evals-are-tests)).
- **Watch the line into a recommendation.** "Shares fell 8% after the company cut guidance" explains. "This may be a buying opportunity," next to a buy button, is likely a recommendation to this customer under Reg BI, with the care, disclosure and conflict obligations that come with it ([Recommendations in an App](/books/investing-and-digital-assets/advice-and-conduct#recommendations-in-an-app)). The prompt, the output filter and the screen design each enforce the line, and each output that crosses it is a `recommendations` row or a blocked output.
- **Keep what was said.** Every output shown to a customer is a record: the text, the sources it cited, the model and prompt version, and the customer it was shown to. Broker-dealer communications are kept under Rule 17a-4 ([How Long and How: Rule 17a-4](/books/investing-and-digital-assets/books-records-and-cat#how-long-and-how-rule-17a-4)), and the Workplace & Collaboration volume's [Regulated Communications](/books/workplace-and-collaboration/regulated-communications) covers capture and supervision tooling.
- **Supervise by sampling and by lexicon.** Rule 3110 supervision of AI output looks like supervision of correspondence: risk-based review of a sample, plus every output that trips a filter (a price target, a guarantee, a named security in a push).

## AI and Robo Advice

A robo-adviser is an investment adviser registered with the SEC or a state, and the advice its algorithm produces is the adviser's advice under the fiduciary duty ([The Adviser's Fiduciary Duty](/books/investing-and-digital-assets/advice-and-conduct#the-adviser-s-fiduciary-duty)). An "AI-native advisory product" is the same: a model that proposes allocations or trades for a client's account is advice, and the adviser must be able to show it's in the client's best interest, disclose how it works and what it can't do in Form ADV, and supervise it. Two things change when the model is a generative one rather than a fixed allocation rule:

- **The same question can get different answers.** A questionnaire mapped to model portfolios by a table gives the same allocation for the same answers ([Questionnaires to Allocations](/books/investing-and-digital-assets/robo-advisors#questionnaires-to-allocations)); a language model asked to suggest a portfolio may not. Advice that must be explainable and repeatable is decided by code over the model's structured output, with the model choosing among allowed options rather than inventing them ([Structured Outputs, Then Validation](/docs/building-blocks/llm-features#structured-outputs-then-validation)).
- **Conflicts can live in the objective.** A model tuned for engagement, assets gathered or products with higher fees serves the firm. The fiduciary duty already requires the adviser to eliminate or disclose conflicts; the model's objective and training data are where to look.

## The Withdrawn Predictive Data Analytics Proposal

In August 2023 the SEC proposed rules (88 FR 53960) that would have required brokers and advisers to evaluate any "covered technology" used in investor interactions for conflicts that put the firm's interest ahead of investors' and to "eliminate, or neutralize the effect of," them. The definition reached any analytical function that "optimizes for, predicts, guides, forecasts, or directs investment-related behaviors or outcomes," which covered most AI in an investing app. On June 17, 2025 the SEC withdrew it with thirteen other proposals, stating that it "does not intend to issue final rules with respect to these proposals." The full history is in [Digital Engagement Practices and the Withdrawn Proposal](/books/investing-and-digital-assets/advice-and-conduct#digital-engagement-practices-and-the-withdrawn-proposal).

As of November 2026 there is no AI-specific conflicts rule. My default is to build as if the proposal's core duty applied anyway, because Reg BI and the fiduciary duty already ask the same question of a recommendation and an adviser: for each model that touches an investor, record what it optimizes, what conflicts that creates, and what the firm did about them. `ai_use_cases` (below) holds that record, and it is the first thing an examiner asks for.

## AI Washing

On March 18, 2024 the SEC settled charges against two investment advisers for claims about AI they couldn't support, actions its Enforcement Director tied to "AI washing":

- **Delphia (USA) Inc.** said from 2019 to 2023, in SEC filings, a press release and on its website, that it "put[s] collective data to work to make our artificial intelligence smarter," without the AI and machine learning capabilities it described. Penalty $225,000.
- **Global Predictions Inc.** called itself in 2023, on its website and social media, the "first regulated AI financial advisor" and advertised "[e]xpert AI-driven forecasts," and also falsely claimed to offer tax-loss harvesting. Penalty $175,000.

Both violated the Advisers Act, including the Marketing Rule's ban on untrue statements of material fact in advertisements ([The Marketing Rule](/books/investing-and-digital-assets/advice-and-conduct#the-marketing-rule)), and were censured without admitting or denying the findings. The SEC chair's statement: "Investment advisers should not mislead the public by saying they are using an AI model when they are not." The engineering reading: a claim about AI in marketing, a filing or a Form ADV is a statement of fact about a system, and the system's records have to support it. `ai_use_cases` is also the inventory marketing and legal check claims against: if the copy says "AI-driven," a row says which model does what.

## Surveillance and Support With AI

Two internal uses carry most of the operational value:

- **Surveillance triage.** FINRA's notice lists summarizing potential evidence of market abuse or insider trading for compliance staff as a use. A model that drafts the alert narrative, gathers the orders, communications and news around an alert, and suggests a disposition shortens review; it doesn't close the alert. Closing stays a person's decision with the model's draft attached, so the case record shows what the reviewer saw ([From Alerts to Cases](/books/investing-and-digital-assets/market-surveillance#from-alerts-to-cases)). A model that suppresses alerts before a person sees them is a change to the surveillance system and gets tested and approved like one.
- **Support.** Robinhood's 10-K describes AI in chat support and support workflows. The playbook's rules for support agents apply: tools, not database access; identity before any account action; human handoff as a product feature; and the agent's promises are the firm's ([Identity Before Account Actions](/docs/building-blocks/ai-agents#identity-before-account-actions), [The AI's Promises Are the Business's Promises](/docs/building-blocks/ai-agents#the-ai-s-promises-are-the-business-s-promises)). The investing-specific line is that a support model never takes the actions social engineers want from a human agent: no contact changes, no hold releases, no withdrawal address additions ([Social Engineering of Support](/books/investing-and-digital-assets/account-security#social-engineering-of-support)). A complaint made in a chat is a complaint, on its clock, whether a model or a person reads it first.

## Agents That Trade and Hold Wallets

An agent that places orders through a broker is a new kind of authorized trader: software acting under the customer's authority, with the customer bearing the result. The model already has the shape: `account_parties` carries an `authorized_trader` role, and a broker giving market access applies its pre-trade controls to every order, whoever or whatever sent it ([The Market Access Rule](/books/investing-and-digital-assets/pre-trade-risk-and-halts#the-market-access-rule)). Robinhood's Agentic Trading Accounts are separate accounts for agent trading, and that separation is the first control: whatever the agent does, it does inside an account the customer funded for it. What the platform enforces around it:

- **A mandate, stored.** What the customer authorized: instruments or asset classes, order types, maximum order size, maximum daily notional, maximum loss, allowed hours, whether it may short or use margin, and when the authority expires. The mandate is the customer's instruction, versioned and signed, like the mandates in [Agentic Commerce](/books/payments/ai-in-payments#agentic-commerce).
- **Limits checked in code at the broker, not in the agent.** The agent's own framework may have none (AgentKit says it doesn't); the platform checks every order against the mandate before its pre-trade risk checks, and rejects what's outside it.
- **A kill switch the customer can reach.** One control in the app stops the agent and cancels its open orders, the account-level version of the firm's own kill switch ([Kill Switches](/books/investing-and-digital-assets/pre-trade-risk-and-halts#kill-switches)).
- **Every action recorded with its reason.** The order, the agent's stated reason, the model and version, the input that led to it, and the mandate check's result (`agent_actions`, below).

Agents with their own crypto wallets carry a sharper risk: there's no broker in front of the keys. The AgentKit project's warning is the lesson in one line: text that reaches the model can influence which actions the agent takes, including transfers. An agent that reads untrusted content (web pages, token metadata, messages), holds keys and can send value outside has all three parts of the playbook's [Lethal Trifecta](/docs/security/ai-security#the-lethal-trifecta), and prompt injection is unsolved ([Prompt Injection Is Unsolved](/docs/security/ai-security#prompt-injection-is-unsolved)). For a platform offering agent wallets, the controls go in the signing path, not the prompt: a policy engine that limits value per transaction and per day, allowlists destinations and contracts, and denies operation types such as approvals and delegations the mandate doesn't cover ([Policy Engines and Quorum Approvals](/books/investing-and-digital-assets/keys-and-signing#policy-engines-and-quorum-approvals)).

### Worked numbers: an agent's limits

A hypothetical mandate of my own for an equity trading agent: US-listed stocks and ETFs only, limit orders only, at most $1,000 per order, $5,000 of buys a day, 20 orders a day, no margin, no shorting, regular hours only, kill switch in the app.

At 10:41 am a bug in the agent's loop starts submitting a $900 buy order every 200 milliseconds, 300 a minute.

| Check | Order 1 to 5 | Order 6 | Orders 7 to 20 | Order 21 onward |
| --- | --- | --- | --- | --- |
| Per-order cap ($1,000) | Pass | Pass | Pass | Pass |
| Daily buy notional ($5,000) | Pass: $900 to $4,500 | Reject: would reach $5,400 | Reject | Reject |
| Daily order count (20) | Counted | Counted (rejected orders count) | Counted | Reject: count reached |
| Result | 5 orders accepted, $4,500 | Rejected | Rejected | Rejected without evaluation |

The bug buys $4,500 of stock, inside what the customer agreed to risk, and the twentieth order (rejected orders count, so the agent can't probe the limits forever) is reached about four seconds after the first. The platform alerts the customer at the first rejection, and the 21st submission trips a rule that pauses the agent until the customer looks. Without the mandate, the broker's pre-trade checks would still stop orders beyond the account's buying power; the mandate keeps the loss at the size the customer chose rather than the size of the account.

## How to Build It

The volume already records disclosures, cases, orders and account parties. This chapter adds the AI inventory, the agent's authority, and the agent's actions:

```sql
CREATE TABLE ai_use_cases (                -- every model that touches an investor or a decision
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  name                TEXT NOT NULL,         -- 'stock_digest', 'support_chat', 'alert_triage', ...
  kind                TEXT NOT NULL CHECK (kind IN ('customer_communication', 'recommendation',
                        'advice', 'surveillance', 'aml', 'fraud', 'support', 'agent_execution',
                        'internal')),
  model_ref           TEXT NOT NULL,         -- provider, model and version
  prompt_version      TEXT,
  objective           TEXT NOT NULL,         -- what it optimizes, in plain words
  conflicts_assessed  TEXT NOT NULL,         -- conflicts the objective creates and what was done
  rules_applied       TEXT[] NOT NULL,       -- 'FINRA 2210', 'Reg BI', 'Advisers Act 206', 'FINRA 3110'
  human_review        TEXT NOT NULL,         -- who reviews what, before or after
  marketing_claims    TEXT[],                -- the public claims this row supports
  approved_by         TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  UNIQUE (legal_entity_id, name, valid_during)
);

CREATE TABLE agent_accounts (              -- an agent's authority over one account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  granted_by_party_id UUID NOT NULL REFERENCES parties (id),
  agent_ref           TEXT NOT NULL,         -- the agent's registered identity and its credential
  mandate             JSONB NOT NULL,        -- instruments, order types, per-order cap, daily notional,
                                             -- daily orders, max loss, hours, margin, short, wallets
  mandate_version     INT NOT NULL,
  disclosure_id       UUID NOT NULL REFERENCES disclosures (id),  -- what the customer agreed to
  status              TEXT NOT NULL CHECK (status IN ('active', 'paused', 'revoked', 'expired')),
  valid_during        TSTZRANGE NOT NULL,
  UNIQUE (account_id, agent_ref, mandate_version)
);

CREATE TABLE agent_actions (               -- every instruction an agent gave, allowed or not
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  agent_account_id    UUID NOT NULL REFERENCES agent_accounts (id),
  kind                TEXT NOT NULL CHECK (kind IN ('order_new', 'order_cancel', 'order_replace',
                        'transfer', 'onchain_sign', 'query')),
  order_id            UUID REFERENCES orders (id),
  transfer_id         UUID REFERENCES transfers (id),
  stated_reason       TEXT,                  -- the agent's explanation, as given
  model_ref           TEXT,
  input_ref           TEXT,                  -- what the agent was reacting to
  mandate_check       TEXT NOT NULL CHECK (mandate_check IN ('pass', 'reject')),
  reject_rule         TEXT,                  -- 'daily_notional', 'order_count', 'instrument', ...
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The mandate check before an agent's buy order reaches pre-trade risk; rejected actions count toward the daily order limit:

```sql
WITH m AS (
  SELECT id, mandate FROM agent_accounts
  WHERE id = :agent_account_id AND status = 'active' AND valid_during @> NOW()
), today AS (
  SELECT COUNT(*) AS orders,
         COALESCE(SUM(o.limit_price * o.quantity) FILTER (WHERE a.mandate_check = 'pass'
                    AND o.side = 'buy'), 0) AS buy_notional
  FROM agent_actions a LEFT JOIN orders o ON o.id = a.order_id
  WHERE a.agent_account_id = :agent_account_id
    AND a.kind = 'order_new'
    AND a.requested_at >= :session_start
)
SELECT CASE
  WHEN NOT EXISTS (SELECT 1 FROM m)                                   THEN 'reject:inactive'
  WHEN today.orders >= (m.mandate->>'daily_orders')::int              THEN 'reject:order_count'
  WHEN :notional > (m.mandate->>'per_order_cap')::numeric             THEN 'reject:per_order_cap'
  WHEN today.buy_notional + :notional
       > (m.mandate->>'daily_buy_notional')::numeric                  THEN 'reject:daily_notional'
  ELSE 'pass' END AS result
FROM today LEFT JOIN m ON TRUE;
```

The sketch values notional in the order's price units; a production check converts with the instrument's decimals as [Units and Decimals for Crypto](/books/investing-and-digital-assets/ledgers-and-positions#units-and-decimals-for-crypto) describes.

Design notes:

- **The agent is an account party.** Add an `account_parties` row with role `authorized_trader` pointing at a party for the agent's operator where the customer agreement treats it so, and keep the agent's own identity in `agent_accounts`.
- **Every AI output shown to a customer is a disclosure-grade record.** Store it with the `ai_use_cases` row, the sources cited and the customer, under the same retention as other communications.
- **Rejections are data.** `agent_actions` keeps rejected instructions, which is how a runaway agent is noticed and how a customer's complaint about "the agent did nothing" is answered.
- **Inventory before launch.** No model reaches customers without an `ai_use_cases` row approved for its kind; a marketing claim without a row is blocked in review.
- **Events:** `agent_action.rejected` notifies the customer on the first rejection of a session; a burst pauses the agent; `ai_use_case.changed` notifies compliance.

## Auditing

What an examiner, an arbitrator or a court asks for about AI at a broker, adviser or exchange:

- **The inventory.** Every AI use with its model, objective, conflicts assessment, applicable rules, reviewer and approval, over time, and the public claims each supports.
- **What customers were shown.** Every AI output delivered, with its sources, versions and recipient, and the supervision sample and filter hits ([Automated and AI Decisions](/docs/building-blocks/audit-trails#automated-and-ai-decisions)).
- **Which outputs were recommendations or advice,** with the Reg BI or fiduciary records that go with them.
- **Every agent's authority and actions.** The mandate versions, the disclosure the customer accepted, every instruction with its check result, and every pause and kill switch use.
- **Surveillance and support decisions** where a model drafted and a person decided, with both on the record.

## What This Means for the System You Build

- **Treat AI output as the firm's communication,** grounded in sources, filtered, kept and supervised like any other.
- **Hold the line between explaining and recommending** in prompts, filters and screen design, and record what crosses it.
- **Let code decide advice** over a model's structured choices, so the same client gets the same answer.
- **Keep an inventory of every model** with what it optimizes and the conflicts that creates, as if the withdrawn proposal applied.
- **Make every AI claim in marketing traceable** to a row; Delphia and Global Predictions are what happens otherwise.
- **Let models draft surveillance and support work, and people close it.**
- **Give agents their own accounts and mandates,** checked at the platform, with a kill switch the customer can reach.
- **Put agent wallet controls in the signing path,** because prompt injection can't be filtered out of the model.

## References

**Regulators and guidance**

- [FINRA: Regulatory Notice 24-09, FINRA reminds members of regulatory obligations when using generative artificial intelligence and large language models (June 27, 2024)](https://www.finra.org/rules-guidance/notices/24-09), technology neutrality, Rules 3110 and 2210, and the use cases listed
- [Federal Register: Conflicts of Interest Associated With the Use of Predictive Data Analytics by Broker-Dealers and Investment Advisers (proposed rule, August 9, 2023)](https://www.federalregister.gov/documents/2023/08/09/2023-16377/conflicts-of-interest-associated-with-the-use-of-predictive-data-analytics-by-broker-dealers-and), the proposal to eliminate or neutralize conflicts from covered technology
- [Federal Register: Withdrawal of Proposed Regulatory Actions (June 17, 2025)](https://www.federalregister.gov/documents/2025/06/17/2025-11110/withdrawal-of-proposed-regulatory-actions), the withdrawal of the predictive data analytics proposal (88 FR 53960) and the statement that no final rules will issue

**Courts and enforcement**

- [SEC: SEC charges two investment advisers with making false and misleading statements about their use of artificial intelligence (press release 2024-36, March 18, 2024)](https://www.sec.gov/newsroom/press-releases/2024-36), the Delphia and Global Predictions claims, penalties, the Marketing Rule and the chair's statement on AI washing

**Filings**

- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), Robinhood Cortex and its digests, AI in support and fraud detection, AI agents and AI-native advisory plans, and AI risk factors
- [Robinhood Markets: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), Agentic Trading Accounts opened and their notional volume, and Robinhood Agents announced at the September summit

**Vendor documentation**

- [Coinbase: AgentKit (GitHub repository)](https://github.com/coinbase/agentkit), the toolkit's purpose, wallet providers, frameworks, and the absence of built-in approvals, spend caps and allowlists
