+++
title = "Where AI Runs: Home, Colo, Cloud or Frontier"
nav_title = "Where AI Runs"
description = "Where inference runs: frontier APIs, hosted open models, rented GPUs, colocation or home; prices, data terms, breakeven, the quality gap and routing."
category = "Hosting & Cloud Industry"
order = 2208
part = "Running the Provider"
tags = ["ai", "inference", "llm", "pricing", "routing"]
+++

The same model request can be served from five places. A frontier lab's API answers it with a model nobody else can run, billed per token. A hosted inference provider (a cloud's model catalog, Together, Fireworks, Groq, Cerebras) answers it with an open-weight model on its GPUs, also billed per token. A rented GPU in a cloud or neocloud runs the customer's own copy of an open model, billed per GPU-hour whether it is busy or not. GPUs the customer owns in colocation run it for the price of power, space and depreciation. And a machine at home runs it for the price of the hardware and the electricity. Each step down that list moves a layer from rented to owned, trades a per-token price for a fixed cost, and changes who sees the data.

The decision is unusual because every input moves monthly. Frontier prices fall for equivalent capability and rise for new tiers; open-weight models trail the frontier by months, not years; GPU rental prices fell in 2025 and rose in 2026; colocation for high-density racks is scarce; and the data terms (training, retention, residency, health data) differ by vendor, endpoint and tier. A provider's customers are making this decision now, and providers at every tier are building products to win it: frontier labs add batch, caching, residency and fast tiers; clouds resell both frontier and open models; neoclouds sell GPUs and token APIs side by side; routers sit between all of them.

This chapter is the decision across the tiers: what each tier costs and promises, the frontier APIs' prices and terms, hosted open-model inference, renting versus paying per token, GPUs in colocation, the home tier, the economics and breakeven, latency, the measured quality gap between open and frontier models, privacy and compliance, routing and fallbacks between tiers, and my default by workload. GPU hourly prices, reservations, neocloud finance, rack power and export controls are [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds); running models on home hardware (runtimes, quantization, memory math, model licenses) is [AI at Home](/books/hosting-and-cloud/ai-at-home); the residence-to-colocation step is [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation). Agent design is the playbook's [AI Agents](/docs/architecture/ai-agents), prompt injection and tool risk are [AI Security](/docs/security/ai-security), and batch versus online inference is [Data Science Platforms](/docs/data/data-science-platforms#batch-or-online-inference).

## How the Providers Do It

| Tier | What you own | What you rent | Billing unit | Who sees the data | Examples, as of October 2026 |
| --- | --- | --- | --- | --- | --- |
| **Frontier API** | Nothing | The model, the GPUs, the serving stack | Tokens: input, cached input, cache writes, output | The lab, under its API terms | Anthropic, OpenAI, Google Gemini API; the same models resold by AWS Bedrock, Azure AI Foundry and Vertex AI |
| **Hosted open model** | The choice of open-weight model | The GPUs and serving stack | Tokens, sometimes per model-size tier | The inference provider | Together, Fireworks, Groq, Cerebras, SambaNova, DeepInfra, Bedrock, Vertex AI, Azure AI Foundry; OpenRouter routes among them |
| **Rented GPU** | The model weights and serving stack | GPUs by the second, hour, block or contract | GPU-hours | The customer, inside its cloud account | Hyperscaler GPU instances, neoclouds, serverless GPU ([GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#buying-capacity)) |
| **GPUs in colocation** | GPUs, servers, network | Space, power, cooling, cross-connects | Kilowatts and racks per month, plus capital | The customer | Equinix, Digital Realty and other colocation providers with liquid-cooled space |
| **Home** | Everything | The residential power and internet line | Electricity | The customer | Consumer GPUs, unified-memory desktops, workstations ([AI at Home](/books/hosting-and-cloud/ai-at-home#hardware-tiers)) |

Three patterns run through the table:

- **The frontier labs set the price floor for quality, and the clouds resell it.** Anthropic's prices state a 1.1x multiplier for US-only inference, and Azure's "US Data Zone Standard" carries the same 1.1x; Bedrock's US cross-region profiles sit about 10% above its global ones. A customer buying a frontier model through a cloud pays roughly the lab's price for the cloud's contract, billing and region controls.
- **Hosted open models now price near frontier small models.** gpt-oss-120b at $0.15 input and $0.60 output per million tokens on Together, Fireworks and Groq sits next to Claude Haiku 5.5 and gpt-6-luna at $0.10 and $0.50. The argument for hosted open models in October 2026 is control, portability and a path to self-hosting, not price.
- **Fixed cost wins only at utilization.** Every tier below the APIs swaps a per-token price for a cost that runs whether the GPU is busy or not, so the cheaper tier depends on how steadily the workload fills the hardware.

## How It Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 24 Feb 2023 | Meta announces LLaMA under a noncommercial research license | A capable model whose weights researchers could run | Access case by case; the weights leaked within about a week |
| 1 Mar 2023 | OpenAI stops using API data for training unless the customer opts in | Businesses' reason not to send data to an API | |
| 10 Mar 2023 | First commit of llama.cpp | Running a large model on a laptop's CPU and GPU | Quantized weights, single-user speed |
| 20 Jun 2023 | vLLM's public launch, built on PagedAttention | Serving many users from one GPU's memory | |
| 18 Jul 2023 | Llama 2, the first Llama with a commercial-use license | Open weights a business could deploy | A custom license, not an open source one |
| 8 Feb 2024 | Ollama ships an OpenAI-compatible endpoint | One client API for local and hosted models | |
| 26 Jun 2024 | RouteLLM: learned routers between a strong and a weak model | Paying frontier prices only for hard prompts | A router to train and evaluate |
| 20 Jan 2025 | DeepSeek R1 under MIT | An open reasoning model near the frontier | |
| 12 Mar 2025 | Epoch AI measures the price of a fixed benchmark score falling 9x to 900x a year | (Evidence that waiting is a cost strategy) | |
| 5 Aug 2025 | OpenAI's gpt-oss-120b and gpt-oss-20b under Apache 2.0 | A frontier lab's open weights, served by every host | |
| 8 Apr 2026 | Meta's Muse Spark ships without weights | (Meta's first frontier model kept closed) | Open-weight users lose a frontier source |
| Sep to Oct 2026 | Claude Fable 5.1 (15 Sep), gpt-6-astra (3 Sep), Claude Opus 5.5 (22 Sep), Gemini 4 Argon generally available (13 Oct); Muse Spark Open weights (15 Oct) | The current frontier and open generations | |

Release dates here are the labs' own (announcement pages, changelogs and model cards), not the date a router first listed the model. [AI at Home](/books/hosting-and-cloud/ai-at-home#how-it-got-here) tells the home side of this history in full.

## Frontier APIs

The three frontier labs price the same way: separate prices for input, cached input and output tokens, a batch tier at half price, a cache that makes repeated prefixes cheap, and premiums for speed and for keeping processing in one region. Prices per million tokens, as of 27 October 2026:

| Model | Input | Cached input | Output | Notes |
| --- | --- | --- | --- | --- |
| Claude Fable 5.1 | $10.00 | $0.25 | $50.00 | Cache writes $12.50 (5 minutes) or $20 (1 hour) |
| Claude Opus 5.5 | $4.00 | $0.20 | $20.00 | Fast mode $8 input, $40 output |
| Claude Sonnet 5.5 | $2.00 | $0.10 | $10.00 | |
| Claude Haiku 5.5 | $0.10 | $0.01 | $0.50 | Prompts up to 100k tokens; $0.50 and $2.50 above |
| gpt-6-astra | $10.00 | $1.00 | $50.00 | Standard tier, 272K context or less |
| gpt-6.1-sol | $2.00 | $0.10 | $10.00 | Fast tier $4, $0.20, $20 |
| gpt-6.1-terra | $1.00 | $0.05 | $5.00 | |
| gpt-6-luna | $0.10 | $0.01 | $0.50 | |
| Gemini 4 Argon | $2.00 | $0.10 | $10.00 | Listed through 30 Nov 2026; $4, $0.20 and $20 from 1 Dec 2026; no free tier |
| Gemini 3.8 Flash and 3.6 Flash | $0.75 | $0.075 | $3.75 | Listed through 31 Dec 2026; $1.50, $0.15 and $7.50 from 1 Jan 2027 |
| Gemini 3.1 Flash-Lite | $0.25 | $0.025 | $1.50 | Free tier exists |

The constants worth remembering, all on the labs' own pages:

- **Batch is half price.** Anthropic's Batch API takes 50% off input and output and stacks with caching; OpenAI's Batch and Flex tiers are about half of Standard; Gemini's batch rates are half.
- **Cached input costs 0.025x to 0.1x.** Anthropic's cache reads also don't count toward its input-tokens-per-minute limit on most models: its own example is that a 2M ITPM limit with an 80% cache hit rate processes 10M input tokens a minute.
- **Residency costs about 10%.** Anthropic's `inference_geo: "us"` multiplies every token category by 1.1 for Claude 4.6 and later; OpenAI's regional processing and FedRAMP endpoints carry a 10% uplift for models released on or after 5 March 2026.
- **Speed is a priced tier.** Anthropic's fast mode on Opus 5.5 and OpenAI's Fast tier (which replaced Priority Processing on 30 July 2026) cost about twice Standard.
- **Gemini's dated doublings are launch pricing ending.** Google's page lists each price "through" a date and a higher one after it, for Argon and the 3.6 and 3.8 Flash models, batch included; the changelog shows no separate price increase. Anthropic went the other way with Sonnet 5: its $2 and $10 introductory price became the standard price, and the increase to $3 and $15 scheduled for 1 September 2026 did not happen. A price version with an end date is as normal in this market as one without.

### Rate limits and spend caps

Every lab starts a new organization on a low tier and raises limits with payment history, which is fraud control as much as capacity planning ([Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys#stolen-keys) covers why):

| Lab | Tiers and monthly caps | Example limits |
| --- | --- | --- |
| Anthropic | Evaluation; Start ($500); Build ($1,000); Scale ($200,000); Custom (no cap) | Opus 5.5: 1,000 RPM, 2M ITPM, 400k OTPM at Start; 10,000 RPM, 10M ITPM, 2M OTPM at Scale; token bucket |
| OpenAI | Free ($100, allowed geographies); Build ($5 paid, $500); Launch ($100 paid, $5,000); Grow ($500 paid, $200,000) | Astra, Sol and Terra group: 5,000 RPM and 1M TPM at Build; 15,000 RPM and 40M TPM at Grow |
| Google | Free; Tier 1 (billing linked, $250 cap); Tier 2 ($100 paid and 3 days, $2,000); Tier 3 ($1,000 paid and 30 days, $20,000 to $100,000+) | Per-model limits shown in AI Studio |

Anthropic documents its limits as a token bucket (the playbook's [Admission Control](/docs/architecture/admission-control#admitting-a-rate-or-a-line) pattern), and its spend-cap 429 carries no `retry-after` header, so a retry loop will never recover from it. A system that depends on one API needs a second route, not a longer backoff ([Retries & Timeouts](/docs/architecture/retries-and-timeouts#circuit-breakers)).

### Data terms

| Term | Anthropic | OpenAI | Google Gemini API |
| --- | --- | --- | --- |
| Training on API data | Never without express permission | Not unless the customer opts in, since 1 March 2023 | Paid services: not used to improve products; unpaid services may be used for training and human review |
| Default retention | Not retained by default, except Covered Models (Fable 5.1, Mythos 5.1, Fable 5, Mythos 5), which require 30-day retention | Abuse-monitoring logs up to 30 days | Logs "for a limited period" for abuse detection; no period stated |
| Zero data retention | Per organization by request; covers Messages and Token Counting; Covered Models excluded unless authorized | Zero Data Retention and Modified Abuse Monitoring by approval; eligible endpoints include `/v1/responses` and `/v1/chat/completions`, not batches, files, assistants or fine-tuning | Not stated on the API terms page |
| Residency | US-only inference at 1.1x | Storage in ten regions; in-region processing only in the US, Europe and the UAE, at 10% | EEA, Swiss and UK users must be served from paid services |
| Health data | BAA self-serve in the Console for eligible organizations; ineligible features return 400 | BAA-eligible endpoints under a signed addendum | Not detailed here |

The pattern: by October 2026 no frontier lab trains on paid API data by default, so the remaining privacy questions are retention (and which models force it), residency (and which regions actually process in-region), and which endpoints a health-data agreement covers. A provider using an LLM for health data is making a HIPAA disclosure ([HIPAA](/docs/compliance/hipaa#the-business-associate-agreement)); for personal data the lab is a processor under a DPA ([GDPR](/docs/compliance/gdpr#controllers-processors-and-the-dpa)).

## Hosted Open Models

Open-weight models are served by many hosts at different prices, speeds and precisions. Prices per million tokens for two common reference models, 27 October 2026:

| Provider | gpt-oss-120b (input / output) | Llama 3.3 70B | Notes |
| --- | --- | --- | --- |
| Together | $0.15 / $0.60 | Not in the serverless table | Dedicated endpoints H100 $5.49/h, B200 $8.99/h |
| Fireworks | $0.15 / $0.60 (cached $0.015); Priority $0.18 / $0.72 | Size tier above 16B: $0.90 flat | Batch 50% off; region-restricted 1.5x |
| Groq | $0.15 / $0.60 at 500 tokens/s | "Contact Sales", 280 tokens/s | gpt-oss-20b $0.075 / $0.30 at 1,000 tokens/s |
| Cerebras | $0.35 / $0.75 (Developer tier) at about 3,000 tokens/s | Not listed | Lists only gpt-oss-120b and Qwen 3.8 27B |
| SambaNova | $0.14 / $0.95 (via OpenRouter) | $0.45 / $0.90 | |
| DeepInfra | $0.037 / $0.17, bf16 (via OpenRouter) | $0.10 / $0.32, fp8 | |
| AWS Bedrock | $0.15 / $0.60 (via OpenRouter) | | Priority +75%; Flex and Batch 50% off; Provisioned Throughput per model unit-hour |
| Google Vertex AI | $0.09 / $0.36 | $0.72 / $0.72 | |
| Azure AI Foundry | $0.15 / $0.60 global; $0.165 / $0.66 Data Zone | | The Data Zone 10% again |
| OpenRouter (router) | 24 endpoints from $0.03 / $0.15 to $0.35 / $0.75 | 10 endpoints from $0.10 / $0.32 to $0.72 / $0.72 | No markup on provider prices; 5.5% fee on credit purchases (8% Business) |

Two things make "the same model" not the same:

- **Precision varies by host.** OpenRouter labels each gpt-oss-120b endpoint's precision (fp4, int4, fp8, bf16, fp16 or unknown), and the cheapest endpoints are the most quantized. A price comparison that ignores precision compares different models.
- **Speed is the product for specialist hardware.** Groq and Cerebras sell throughput per user (500 and about 3,000 tokens a second for gpt-oss-120b) rather than the lowest price.

Large open models cost more and sit closer to frontier mid-tier prices: on Together and Fireworks, Kimi K3 lists at $3.00 and $15.00, Qwen3.8 Max at $2.00 and $6.00, GLM-5.3 at $1.40 and $4.40, DeepSeek V4 Pro at $1.32 and $3.96, with US-region variants on Fireworks at 1.5x.

## Renting GPUs Versus Paying per Token

Running your own copy of an open model on rented GPUs beats per-token pricing only when the GPUs stay busy. A worked example from public figures (my arithmetic):

- MLPerf Inference v6.1 (September 2026), Closed division, gpt-oss-120b, Server scenario: an 8x B200 system (CoreWeave's submission) served 90,205 tokens a second, about 11,276 per GPU, or 40.6 million tokens per GPU-hour.
- At Lambda's B200 on-demand price of $6.69 per GPU-hour ([GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#gpu-prices-dated)), that is $0.165 per million tokens at 100% utilization, $0.33 at 50% and $0.82 at 20%.
- Hosted gpt-oss-120b lists $0.15 input and $0.60 output.

At full, steady load with MLPerf-class tuning, the rented GPU roughly matches the hosted price; at anything like a normal day's traffic curve it costs more, and MLPerf figures are tuned benchmark results that real deployments land below. Renting GPUs for inference earns its place for reasons other than price per token: a fine-tuned or private model, a model no host serves, latency or residency the hosts can't meet, or steady volume high enough to keep a [reserved block](/books/hosting-and-cloud/commitments-and-marketplaces#gpu-capacity-reservations) full. The playbook's [Compute Isolation and Cost](/docs/data/data-science-platforms#compute-isolation-and-cost) has the general rule about idle accelerators.

## GPUs in Colocation

Owning GPUs in someone else's building is the step that hits the physical limits first. A GB200 NVL72 rack draws 120 to 132 kW and needs liquid cooling ([GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#power-cooling-and-the-rack)); the industry's installed base is nowhere near that:

- **Density.** The Uptime Institute's 2025 survey found average rack density rising slowly, driven by 10 to 30 kW racks: "Few facilities exceed 30 kW, and extreme densities remain rare." Its 2026 survey release reports "a growing number of operators now reporting peak rack densities of 30 kW or higher," with averages still rising slowly. CBRE describes CPU racks at "roughly 3-10 kW" and says "100-kW GPU servers can only be cooled by a closed-loop liquid-cooling system."
- **Liquid cooling is offered, at named sites.** Equinix said in December 2023 it was extending liquid cooling, including direct-to-chip, to more than 100 data centers in over 45 metros; Digital Realty said in May 2024 it offered direct liquid cooling in 170 data centers, at 30 kW to above 150 kW per rack. Neither publishes per-kW prices for small high-density deployments: they are quoted.
- **Space is scarce.** CBRE's first-half 2026 report puts primary-market vacancy at a record 1.4%, with 80.4% of capacity under construction already pre-leased and asking rates up 4.3% to 8.3% depending on size; Northern Virginia vacancy was 0.2%.
- **Financing replaces cash.** Lessors offer fair-market-value leases of 24 to 36 months that leave residual value risk with the lessor and match a two-to-three-year accelerator refresh, or $1 buyout leases that move obsolescence to the buyer (CHG-MERIDIAN); single GPU financings above $65 million have been publicly announced (Wingspire, June 2025). Renting GPUs as a service leaves the obsolescence with the provider, which is part of what the neocloud price buys.

Colocation for GPUs is a decision for steady, large workloads with an operations team: it is the cheapest per token at high utilization and the slowest to start, and its constraint is a liquid-cooled cabinet with power available, not the GPUs. The facility side is [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation); the path from a closet to a cage is [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation#when-the-house-isn-t-enough).

## The Home Tier

At home the economics are hardware plus electricity, and the constraint is memory. Launch prices give the scale: an RTX 5090 (32 GB, 575 W) launched at $1,999 in January 2025; NVIDIA raised the DGX Spark Founders Edition (128 GB unified memory at 273 GB/s, a 240 W supply) from $3,999 to $4,699 in February 2026 "due to memory supply constraints"; Apple's Mac Studio with M5 Ultra (up to 512 GB at 1.2 TB/s) starts at $5,499, with the 512 GB configuration arriving in late October 2026. Used cards are a market, not a price list: eBay asking prices for a 24 GB RTX 3090 averaged $1,554 on 27 October 2026, up 24% in 90 days, per the ResalePrices aggregator. Meta says its Muse Spark Open (816B total parameters, 42B active) is optimized to run on two M5 Ultra Mac Studios.

The home tier wins on privacy, offline use and marginal cost for development and personal use, and loses on throughput per user and on the largest models. Everything about running it (runtimes, quantization, the memory arithmetic for weights and KV cache, multi-GPU without NVLink, model licenses) is [AI at Home](/books/hosting-and-cloud/ai-at-home#the-memory-math).

## The Economics

Three facts shape every comparison:

- **Prices for a fixed capability fall fast.** Epoch AI (12 March 2025) measured the price of reaching a fixed benchmark score falling 9x to 900x a year depending on the milestone (about 40x a year for GPT-4-level GPQA Diamond), with the fastest declines the most recent. a16z's "LLMflation" analysis (November 2024, investor analysis) put the decline at about 10x a year. Hardware bought today competes with API prices a year from now.
- **Utilization decides the fixed-cost tiers.** Rented, colocated and home GPUs all cost the same whether busy or idle; per-token APIs cost nothing when idle. The worked example above moves from parity to five times the hosted price between 100% and 20% utilization.
- **Breakeven studies leave out most of the cost.** The most-cited on-premise breakeven study (Pan, Chodnekar, Roy and Wang, arXiv 2509.18101, an unreviewed preprint, v3 of 11 November 2025) counts hardware and electricity only, at 8 hours a day, 20 days a month and $0.15 per kWh, with no staff, cooling or networking. On those assumptions it finds small models on one RTX 5090 breaking even in 0.3 to 3.0 months, Llama 3.3 70B on one A100 in 17.8 months against GPT-5 (2.3 against Claude 4 Opus), gpt-oss-120b on two A100s in 30.9 months, and Kimi K2 on sixteen A100s in 69.3 months, and it calls self-hosting viable "primarily" at 50 million tokens a month or more, or under strict residency. It compares against late-2025 list prices (GPT-5 at $1.25 and $10, Claude 4 Opus at $15 and $75); October 2026 prices (Opus 5.5 at $4 and $20, Haiku 5.5 at $0.10 and $0.50) lengthen every one of those breakevens.

> [!WARNING]
> A breakeven computed against today's API price is computed against the most expensive that capability will ever be. With equivalent-capability prices falling an order of magnitude or more a year, hardware has to pay for itself within months, or be justified by something other than price per token.

## Latency and Throughput

Speed is sold three ways. Specialist inference hardware sells tokens per second per user (Groq at 500 and Cerebras at about 3,000 for gpt-oss-120b). Frontier labs sell a fast tier at about twice the standard price. And local or dedicated serving removes network round trips and queueing, at the cost of lower aggregate throughput unless the serving stack batches requests continuously. MLPerf's Interactive scenario targets a 2-second time to first token and 20 ms per output token, about 50 tokens a second per user, which is a reasonable bar for a chat product. Batch work is the opposite: it tolerates hours, which is what the 50% batch discounts buy.

## The Quality Gap, Measured

Open-weight models trail the frontier by months, measured three independent ways:

| Measure | Publisher, date | Finding |
| --- | --- | --- |
| Epoch Capabilities Index | Epoch AI, 29 May 2026 | Open-weight models "have lagged frontier closed models by an average of four months" since January 2026, an average gap of 8 ECI points |
| Same index, earlier | Epoch AI, 30 October 2025 | An average lag of 3.5 months (90% interval 1.1 to 5.3) |
| Arena text leaderboard | arena.ai, updated 22 October 2026 | First: Gemini 4 Argon (High) at 1517; second: Claude Opus 5.5 (High) at 1509; Kimi K3 (Max), open weights under a custom license, 18th at 1487; the highest MIT-licensed model, GLM-5.3 (Max), 26th at 1481 |
| Artificial Analysis Intelligence Index | artificialanalysis.ai, changelog to 26 October 2026 | Top overall: Claude Opus 5.5 (max) at 58; top open-weights entries in the mid-40s (MiMo-V2.6-Pro 46; DeepSeek V4.1 Flash and GLM-5.3 at 45) |

Press reading Arena's data put the open-to-closed gap at zero in January 2025 and 29 Elo in September 2026. Moonshot launched Kimi K3.1 Pro in its API on 23 October 2026 with weights promised for 4 November, according to press; as of 27 October 2026 there is no Kimi K3.1 repository on Hugging Face, so its open-weight status is pending. Leaderboards move weekly; what has been stable since 2025 is the size of the lag, a few months, which means an open model is a reasonable choice for any task last season's frontier model handled well.

## Privacy and Compliance

The reasons to move a workload down the tiers are mostly about data, not price:

- **Retention.** Abuse-monitoring logs (30 days by default at OpenAI) and models with mandatory retention (Anthropic's Covered Models) mean data persists at the lab unless the customer has a zero-retention agreement that covers the model and endpoint in use.
- **Residency.** In-region processing exists only in some regions and costs about 10%; OpenAI stores data in ten regions but processes in-region only in three.
- **Health and regulated data.** Agreements cover named endpoints, not a lab's whole API; a feature outside them (Anthropic returns 400 for ineligible features) is not covered.
- **Free tiers.** Google's unpaid Gemini services may use prompts for training and human review, and developers serving the EEA, Switzerland or the UK must use paid services.

A cloud-hosted open model inside the customer's own account, or self-hosting, removes the third-party processor entirely, which is the cleanest answer to all four. It is also more work than signing an agreement, and for most workloads a zero-retention or in-region contract with a frontier lab or a cloud is enough.

## Routing and Fallbacks

Because every tier fails differently (rate limits, spend caps, outages, context limits, moderation), production systems route across tiers and providers:

- **Router-level fallback.** OpenRouter's `models` array tries models in order and falls back on any error, billing at the model that served. Its provider routing takes `order`, `allow_fallbacks` (on by default), `only` and `ignore`, `quantizations`, `sort` by price, throughput or latency, `max_price`, and the data filters `data_collection: "deny"` and `zdr: true`. By default it skips providers with an outage in the last 30 seconds and picks among the cheapest weighted by the inverse square of price, so a $1 provider is about nine times likelier than a $3 one.
- **Cloud-level routing.** Bedrock's cross-region inference profiles (Global versus US, about 10% apart) and Anthropic's `inference_geo` move traffic between regions inside one vendor; Anthropic's rate limits are shared across geos.
- **Learned routing.** RouteLLM (June 2024) trains a router on preference data to send easy prompts to a weak model and hard ones to a strong model, and reports cutting costs "by over 2 times in certain cases" without losing response quality.

My rule for any route: the data terms are part of the route, not a property of the application. A fallback from a zero-retention endpoint to one that retains for 30 days is a privacy change, so the route carries its allowed data classes and refuses a fallback that would widen them. Untrusted content that reaches a model through any route is a prompt-injection surface ([AI Security](/docs/security/ai-security#design-rules)).

## The Alternatives

| Tier | Best for | Strengths | Failure modes | Cost shape |
| --- | --- | --- | --- | --- |
| **Frontier API** | Hard reasoning, agents, coding, anything where quality decides | Best models; no capacity planning; batch and cache discounts | Rate limits and spend caps; retention and residency terms; price changes on the lab's schedule | Per token, zero when idle |
| **Frontier small model** | Bulk classification, extraction, summarization | Very cheap per token; same API and terms | Weaker on hard tasks | Per token, cents per million |
| **Hosted open model** | Workloads that want portability or a specific open model | Many hosts for one model; specialist speed; a path to self-hosting | Precision varies by host; quality months behind | Per token, near frontier small models |
| **Rented GPU** | Fine-tuned or private models; steady high volume; residency inside an account | Control of weights and stack; data stays in the customer's account | Idle cost; serving engineering; capacity scarcity | Per GPU-hour, used or not |
| **GPUs in colocation** | Large, steady, long-lived workloads | Lowest cost at high utilization; full control | Liquid-cooled space is scarce; refresh cycles; financing; staff | Capital plus kW per month |
| **Home** | Development, personal and privacy-sensitive use, offline | No per-use cost; data never leaves | Memory limits; single-user throughput; power and noise | Hardware plus electricity |

## My Default by Workload

- **Hard reasoning, agents and coding:** a frontier API, with a second frontier vendor as the fallback route. Quality is the product, and the lab is months ahead of anything I can host.
- **Bulk extraction, classification and summarization:** a frontier small model or a hosted open model on the batch tier, with prompt caching for shared prefixes. At $0.10 to $0.15 per million input tokens and half that in batch, nothing I can run myself is cheaper per useful token.
- **Regulated or residency-bound data:** a zero-retention, in-region frontier endpoint under a signed agreement first; a cloud-hosted open model inside my own account when the agreement can't cover the endpoint I need.
- **Fine-tuned or private models, or steady volume that keeps GPUs above roughly two thirds busy:** rented GPUs, moving to a reserved block or colocation only after the utilization is proven on rented capacity.
- **Development, personal use and offline:** home hardware, with the same client code pointed at a hosted endpoint for overflow.

The tradeoff that would change it is the gap. If open weights caught the frontier for a workload and stayed there, I'd move that workload down a tier for control; if a workload's data could not leave my account at all, I'd start at rented GPUs regardless of price.

## How to Build It

The core model meters tokens like any other usage (`usage_events.meter` values `'model.input_tokens'` and `'model.output_tokens'`, SKUs with unit `'token'`) and already has `resources` of kind `'model_endpoint'`. This chapter adds the endpoint side table, routes with ordered fallbacks and their allowed data classes, and a view that compares the cost per million tokens a workload actually paid on each tier. GPU-hour usage for self-hosted serving is [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#how-to-build-it)'s.

```sql
CREATE TABLE model_endpoints (           -- side table: kind = 'model_endpoint'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  tier             TEXT NOT NULL CHECK (tier IN ('frontier_api', 'hosted_open',
                     'rented_gpu', 'colocation', 'home')),
  vendor           TEXT NOT NULL,         -- the lab or host serving it
  model            TEXT NOT NULL,         -- the vendor's model id, as billed
  precision        TEXT,                  -- 'bf16', 'fp8', 'fp4', 'int4'; null if not disclosed
  processing_geo   TEXT,                  -- 'global', 'us', 'eu': where inference runs
  retention        TEXT NOT NULL CHECK (retention IN ('none', 'abuse_logs', 'mandatory',
                     'customer_controlled')),
  retention_days   SMALLINT,              -- null when 'none' or unstated
  baa_covered      BOOLEAN NOT NULL DEFAULT FALSE,  -- under a signed health-data agreement
  gpu_resource_id  UUID REFERENCES resources (id),  -- the VM or reservation, for self-hosted tiers
  terms_version    TEXT NOT NULL,         -- the vendor terms and agreement in force
  CHECK (tier NOT IN ('rented_gpu', 'colocation') OR gpu_resource_id IS NOT NULL),
  CHECK (tier NOT IN ('frontier_api', 'hosted_open') OR gpu_resource_id IS NULL)
);

CREATE TABLE model_routes (              -- a named route a workload calls
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  project_id       UUID REFERENCES projects (id),
  name             TEXT NOT NULL,         -- 'support-summaries', 'agent-planner'
  allowed_data     TEXT[] NOT NULL,       -- data classes the route may carry: 'public', 'pii', 'phi'
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (account_id, name, valid_during)
);

CREATE TABLE model_route_steps (         -- ordered endpoints; later steps are fallbacks
  route_id         UUID NOT NULL REFERENCES model_routes (id),
  position         SMALLINT NOT NULL CHECK (position >= 1),
  endpoint_id      UUID NOT NULL REFERENCES resources (id),  -- kind = 'model_endpoint'
  fallback_on      TEXT[] NOT NULL DEFAULT '{rate_limited,unavailable,timeout}',
  PRIMARY KEY (route_id, position)
);
```

A step whose endpoint retains data the route doesn't allow should never be added, and the check belongs in the database, not a review:

```sql
-- Routes carrying personal or health data with a step that would widen retention or
-- leave a health-data agreement. Run on every change to a route or an endpoint.
SELECT r.name, s.position, e.vendor, e.model, e.retention, e.baa_covered
FROM model_routes r
JOIN model_route_steps s ON s.route_id = r.id
JOIN model_endpoints e ON e.resource_id = s.endpoint_id
WHERE upper_inf(r.valid_during)
  AND (('phi' = ANY (r.allowed_data) AND NOT e.baa_covered)
    OR ('pii' = ANY (r.allowed_data) AND e.retention = 'mandatory'));
```

The placement comparison is a view over `rated_usage`. Per-token tiers are priced directly; self-hosted tiers bring their GPU-hours, rated by the GPU SKUs, and divide by the tokens they served (a self-hosted endpoint records its served tokens as zero-priced token usage, the same way [AI at Home](/books/hosting-and-cloud/ai-at-home#how-to-build-it) meters tokens at a cost of zero). It is per endpoint, so a GPU shared by two endpoints needs its cost split before it is joined:

```sql
CREATE VIEW placement_costs AS           -- cost per million tokens each endpoint actually cost
SELECT e.resource_id AS endpoint_id,
       e.tier,
       date_trunc('month', lower(ru.rated_during)) AS month,
       SUM(ru.amount) FILTER (WHERE k.unit = 'token')     AS token_cost,
       SUM(ru.amount) FILTER (WHERE k.unit = 'gpu_hour')  AS gpu_cost,
       SUM(ru.quantity) FILTER (WHERE k.unit = 'token')   AS tokens,
       (COALESCE(SUM(ru.amount), 0) * 1e6)
         / NULLIF(SUM(ru.quantity) FILTER (WHERE k.unit = 'token'), 0) AS cost_per_million
FROM model_endpoints e
JOIN rated_usage ru ON ru.resource_id IN (e.resource_id, e.gpu_resource_id)
JOIN skus k ON k.id = ru.sku_id
GROUP BY e.resource_id, e.tier, date_trunc('month', lower(ru.rated_during));
```

The meters, as core `usage_events.meter` values:

| Meter | Unit | SKU example | Notes |
| --- | --- | --- | --- |
| `model.input_tokens` | token | `model.opus-5-5.input.us` | Dimensions: tier (standard, batch, fast), geo; the 1.1x geo price is its own price version |
| `model.cached_input_tokens` | token | `model.opus-5-5.cache_hit` | Billed at the cache price; excluded from input rate limits where the vendor says so |
| `model.cache_write_tokens` | token | `model.opus-5-5.cache_write.1h` | Two durations, two SKUs |
| `model.output_tokens` | token | `model.gpt-oss-120b.output.together` | One SKU per vendor endpoint; the same model has several prices |
| `model.requests` | request | `model.route.request` | For routing analytics and per-request fees |

Notes on the sketch:

- **The endpoint, not the model, is the unit.** The same model at two hosts differs in price, precision, geo and retention, so each is its own `model_endpoint` resource and its own SKUs.
- **Data terms are columns.** Retention, processing geo, health-data coverage and the terms version sit on the endpoint, so a route's privacy can be checked by a query and an auditor can see which terms applied to a request on a date.
- **Fallbacks are rows.** The order and the errors that trigger each step are data; a spend-cap 429 that has no `retry-after` is a `rate_limited` fallback, not a retry.
- **Self-hosted tiers bring their GPUs.** A rented-GPU endpoint points at its VM or reservation, so the view divides real GPU-hour cost by real tokens served, idle hours included, which is the number the breakeven question needs.
- **Price versions with end dates are normal.** Gemini's dated prices and Anthropic's cancelled increase are two `price_versions` rows each, announced in advance, under the core model's effective dating.
- **Events:** `model_route.changed`, `model_endpoint.terms_changed` and `model_route.fallback_used` go through the [outbox](/docs/architecture/events#the-transactional-outbox), because a fallback that fires for hours is both an incident and a bill.

## Auditing

- **Which endpoint served each request.** The route, the step that served it and why earlier steps were skipped, so a cost spike, a quality complaint or a privacy question can be traced to the model and host that answered.
- **The data terms in force.** For every endpoint, its retention, geo, health-data coverage and terms version over time, so "was this request covered by our zero-retention agreement" has an answer for any date.
- **What each tier cost per token.** Monthly cost per million tokens by endpoint and tier from `placement_costs`, so a decision to move a workload up or down a tier rests on what it actually paid, idle GPUs included.

## What This Means for the System You Build

- **Treat placement as a per-workload decision** across five tiers, revisited as prices and the quality gap move.
- **Price the endpoint, not the model:** the same open model has many prices, precisions and data terms.
- **Use batch and caching first;** they halve or better the bill before any change of tier.
- **Carry data terms on every route,** and refuse fallbacks that widen retention or leave a health-data agreement.
- **Route across vendors for availability,** because spend caps and rate limits don't recover with retries.
- **Prove utilization on rented capacity** before buying GPUs or colocation, and count idle hours in the comparison.
- **Discount breakeven studies** for falling API prices and for the staff, cooling and networking they leave out.

## References

**Frontier APIs**

- [Anthropic: Pricing](https://platform.claude.com/docs/en/about-claude/pricing), model prices, cache writes and hits, batch discount, fast mode, the 1.1x US inference multiplier, the Sonnet 5 introductory price becoming standard
- [Anthropic: Rate limits](https://platform.claude.com/docs/en/api/rate-limits), tiers and spend caps, per-tier limits, the token bucket, cache reads and ITPM, the spend-cap 429 without retry-after
- [Anthropic: API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention), training, default retention, Covered Models, zero data retention scope, the BAA
- [Anthropic: News](https://www.anthropic.com/news), release dates for Opus 5.5, Sonnet 5.5 and Haiku 5.5
- [Anthropic: Claude Fable and Mythos 5.1](https://www.anthropic.com/claude-fable-and-mythos-5-1), the September 2026 release
- [OpenAI: Pricing](https://developers.openai.com/api/docs/pricing), Standard and Fast prices, batch and Flex, the 10% regional and FedRAMP uplift
- [OpenAI: Changelog](https://developers.openai.com/api/docs/changelog), release dates for the gpt-6 models and the Fast tier
- [OpenAI: Rate limits](https://developers.openai.com/api/docs/guides/rate-limits), usage tiers, caps and limits
- [OpenAI: Your data](https://developers.openai.com/api/docs/guides/your-data), training since March 2023, abuse logs, ZDR and MAM, residency regions, BAA and ZDR-eligible endpoints
- [Google: Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), prices and their dated changes, batch, free tier, product-improvement use
- [Google: Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog), release dates for Argon and the Flash models
- [Google: Build with Gemini 4 Argon](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-4-argon/), the general availability announcement
- [Google: Introducing Gemini 4 Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/), October 13, 2026, global availability and the introductory $2 and $10 prices with cached input at 95% off, through November 30, 2026
- [Google: Gemini API additional terms](https://ai.google.dev/gemini-api/terms), paid and unpaid data use, abuse logs, the EEA, Swiss and UK paid-services rule
- [Google: Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), tiers and their qualification

**Hosted open models and routing**

- [Together AI: Pricing](https://www.together.ai/pricing), serverless token prices and dedicated endpoints
- [Fireworks: Serverless pricing](https://docs.fireworks.ai/serverless/pricing), token prices, size tiers, batch, region-restricted multiplier
- [Fireworks: Pricing](https://fireworks.ai/pricing), large open model prices and on-demand GPUs
- [Groq: Models](https://console.groq.com/docs/models), token prices and speeds
- [Cerebras: Models overview](https://inference-docs.cerebras.ai/models/overview), models served and speeds
- [Cerebras: Pricing](https://www.cerebras.ai/pricing), Developer tier gpt-oss-120b at $0.35 input and $0.75 output, October 2026
- [Google Cloud: Generative AI pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing), model-as-a-service gpt-oss-120b at $0.09 and $0.36 and Llama 3.3 70B at $0.72, October 2026
- [AWS: Bedrock pricing](https://aws.amazon.com/bedrock/pricing/), Priority, Flex and Batch, cross-region inference, Provisioned Throughput
- [Azure Retail Prices API: gpt-oss models](https://prices.azure.com/api/retail/prices?$filter=contains(productName,'gpt-oss')), global and Data Zone prices
- [OpenRouter: gpt-oss-120b endpoints](https://openrouter.ai/api/v1/models/openai/gpt-oss-120b/endpoints), endpoint count, prices and precision by host
- [OpenRouter: Pricing](https://openrouter.ai/pricing), no markup, credit purchase fees, BYOK
- [OpenRouter: Model fallbacks](https://openrouter.ai/docs/guides/routing/model-fallbacks), the models array and billing at the serving model
- [OpenRouter: Provider selection](https://openrouter.ai/docs/guides/routing/provider-selection), routing parameters, data filters, default load balancing
- [Ong et al., RouteLLM (arXiv 2406.18665)](https://arxiv.org/abs/2406.18665), learned routing and its cost reduction

**Economics, hardware and colocation**

- [NVIDIA: AI inference performance](https://developer.nvidia.com/deep-learning-performance-training-inference/ai-inference), MLPerf Inference v6.1 gpt-oss-120b results and scenarios
- [MLCommons: Inference datacenter benchmarks](https://mlcommons.org/benchmarks/inference-datacenter/), v6.1 as the latest round
- [Lambda: MLPerf Inference v6.1](https://lambda.ai/blog/mlperf-inference-v6.1), the September 2026 round date
- [Epoch AI: LLM inference price trends](https://epoch.ai/data-insights/llm-inference-price-trends), price declines for fixed capability
- [a16z: LLMflation](https://a16z.com/llmflation-llm-inference-cost/), the about 10x a year decline (investor analysis)
- [Pan et al., A Cost-Benefit Analysis of On-Premise LLM Deployment (arXiv 2509.18101)](https://arxiv.org/abs/2509.18101), versions, authors and status
- [Same paper, v3 full text](https://arxiv.org/html/2509.18101v3), assumptions, breakeven figures, the 50 million tokens a month threshold
- [Uptime Institute: Global Data Center Survey 2025](https://intelligence.uptimeinstitute.com/resource/uptime-institute-global-data-center-survey-2025), average densities and few facilities above 30 kW
- [Uptime Institute: 2026 survey release (republished)](https://www.01net.it/uptime-institute-16th-annual-2026-global-data-center-survey-deployment-of-high-density-racks-rising-fast-operators-face-continued-recruiting-and-retention-pressures/), more operators reporting 30 kW peaks
- [CBRE: North America Data Center Trends H1 2026](https://www.cbre.com/insights/books/north-america-data-center-trends-h1-2026), rack densities, liquid cooling, vacancy, pre-leasing, rate growth, Northern Virginia
- [Equinix: Liquid cooling expansion](https://newsroom.equinix.com/2023-12-14-Equinix-to-Accelerate-and-Simplify-Liquid-Cooling-Deployments-to-Power-Enterprise-AI-Workloads), sites and metros with liquid cooling
- [Data Center Frontier: Digital Realty direct liquid cooling](https://www.datacenterfrontier.com/cooling/article/55040948/digital-realty-adds-direct-liquid-cooling-for-high-density-colocation-in-170-data-centers-globally), 170 data centers and density range
- [CHG-MERIDIAN: AI infrastructure financing](https://www.chg-meridian.com/us-en/insights/blog/ai-infrastructure-financing/), lease structures and residual risk
- [ELFA: Wingspire GPU financing](https://legacy.elfaonline.org/news-and-publications/industry-news/read/2025/06/18/wingspire-equipment-finance-powers-next-gen-gpu-deployment-for-ai-infrastructure-platform-with-a-capital-injection-of-over--65-million), a single financing above $65 million
- [NVIDIA: RTX 50 Series launch](https://nvidianews.nvidia.com/news/nvidia-blackwell-geforce-rtx-50-series-opens-new-world-of-ai-computer-graphics), RTX 5090 price and date
- [NVIDIA: RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/), memory and power
- [NVIDIA Developer Forums: DGX Spark price change](https://forums.developer.nvidia.com/t/2-23-2026-price-change-announcement/361713), $3,999 to $4,699
- [NVIDIA: DGX Spark](https://www.nvidia.com/en-us/products/workstations/dgx-spark/), memory, bandwidth and power supply
- [Apple: Mac Studio with M5 Max and M5 Ultra](https://www.apple.com/newsroom/2026/08/apple-introduces-new-mac-studio-with-m5-max-and-m5-ultra/), memory, bandwidth, prices, availability
- [ResalePrices: RTX 3090](https://resaleprices.com/gpu/nvidia-rtx-3090), eBay asking prices on 27 October 2026 (aggregator)
- [Hugging Face: Muse Spark Open](https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B), size, release date and the two-Mac Studio target

**History and quality**

- [Meta: Introducing LLaMA](https://ai.meta.com/blog/large-language-model-llama-meta-ai/), the February 2023 announcement and license
- [The Batch: How Meta's LLaMA leaked](https://www.deeplearning.ai/the-batch/how-metas-llama-nlp-model-leaked/), the leak about a week later
- [llama.cpp: first commit](https://github.com/ggml-org/llama.cpp/commit/26c084662903ddaca19bef982831bfb0856e8257), 10 March 2023
- [vLLM: launch post](https://vllm.ai/blog/2023-06-20-vllm), June 2023
- [Kwon et al., PagedAttention (arXiv 2309.06180)](https://arxiv.org/abs/2309.06180), the serving technique under vLLM
- [Touvron et al., Llama 2 (arXiv 2307.09288)](https://arxiv.org/abs/2307.09288), July 2023
- [Ollama: OpenAI compatibility](https://ollama.com/blog/openai-compatibility), February 2024
- [Hugging Face: DeepSeek R1](https://huggingface.co/deepseek-ai/DeepSeek-R1), January 2025 and MIT license
- [Hugging Face: gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b), August 2025 and Apache 2.0
- [Meta: Introducing Muse Spark](https://about.fb.com/news/2026/04/introducing-muse-spark-meta-superintelligence-labs/), April 2026, no weights
- [Epoch AI: Open-closed ECI gap](https://epoch.ai/data-insights/open-closed-eci-gap), the four-month lag in 2026
- [Epoch AI: Open weights versus closed weights](https://epoch.ai/data-insights/open-weights-vs-closed-weights-models), the 3.5-month lag in October 2025
- [Arena: Text leaderboard](https://arena.ai/leaderboard/text), ranks and scores on 22 October 2026
- [Artificial Analysis: Leaderboards](https://artificialanalysis.ai/leaderboards/models), Intelligence Index scores
- [Artificial Analysis: Open-weights models](https://artificialanalysis.ai/models/open-source), top open-weights scores
- [Crypto Briefing: Arena frontier and open-weight gap](https://cryptobriefing.com/arena-ai-frontier-open-weight-model-gap-widens/), the gap in January 2025 and September 2026 (press)
- [Let's Data Science: Kimi K3.1 Pro](https://letsdatascience.com/news/moonshot-releases-kimi-k31-pro-api-open-weights-due-nov-4-786e160c), API launch and promised weights (press)
