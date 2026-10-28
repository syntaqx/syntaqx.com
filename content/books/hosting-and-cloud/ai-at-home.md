+++
title = "AI at Home"
description = "Open-weight models on home hardware: VRAM and bandwidth math, GPUs and unified memory, runtimes, quantization, model licenses, power and privacy."
category = "Hosting & Cloud Industry"
order = 2112
part = "Homelab"
tags = ["homelab", "local-ai", "llm-inference", "gpu", "quantization", "open-weights", "model-licenses"]
+++

Running a language model at home is the homelab's version of an inference provider: the same weights the hosted open-model APIs serve, the same OpenAI-shaped endpoint, the same token meters, on one machine whose owner is also its only customer. What makes it hard is not software. The runtimes install in minutes. It is that a model is a few tens or hundreds of gigabytes that must sit in fast memory, and every generated token reads most of it again, so the questions are how much memory, how fast, at what precision, under which license, and at what cost in watts.

This chapter covers the open-weight model families and their licenses, dated; the memory math (weights at each precision plus the KV cache) and why memory bandwidth sets decode speed; consumer GPUs, used datacenter cards, Apple Silicon, AMD Strix Halo and NVIDIA DGX Spark; the runtimes (llama.cpp, Ollama, LM Studio, vLLM, SGLang, ExLlama, MLX); quantization formats; front ends and the OpenAI-compatible API as the seam; local RAG and agents; image and speech models; power, heat and privacy. It adds no tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model): a home model is a `model_endpoint` resource, and its token meters are the same `usage_events` with a cost of zero. The wider homelab is [The Homelab](/books/hosting-and-cloud/homelab); giving a VM the GPU is [Hypervisors at Home](/books/hosting-and-cloud/hypervisors-at-home#pcie-and-gpu-passthrough); reaching the box from outside is [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services). The comparison of home, colocation, rented GPUs, hosted open models and frontier APIs on cost and breakeven belongs to [Where AI Runs: Home, Colo, Cloud or Frontier](/books/hosting-and-cloud/where-ai-runs#the-economics), and GPU rental prices to [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#gpu-prices-dated).

## How the Vendors Do It

No provider sells "AI at home"; hardware vendors sell memory and bandwidth, labs publish weights, and open-source runtimes connect the two. The hardware, as of October 2026, with launch prices as the vendors published them (street prices in the 2026 memory shortage sit above them, and NVIDIA raised DGX Spark's own price for that reason):

| Device | Memory | Bandwidth | Price as published | Power |
| --- | --- | --- | --- | --- |
| **NVIDIA RTX 5090** | 32 GB GDDR7, 512-bit | 1,792 GB/s | $1,999 (January 30, 2025) | 575 W TGP, 1,000 W system PSU recommended |
| **NVIDIA RTX 5080** | 16 GB GDDR7, 256-bit | 960 GB/s | $999 | |
| **NVIDIA RTX 5070 Ti / 5070** | 16 GB / 12 GB GDDR7 | 896 / 672 GB/s | $749 / $549 | |
| **NVIDIA RTX 3090** (used) | 24 GB GDDR6X, 384-bit | Not on NVIDIA's comparison page | eBay asking prices averaged $1,554 on October 27, 2026 (ResalePrices, a listings aggregator) | |
| **Intel Arc Pro B60** | 24 GB GDDR6, 192-bit | 456 GB/s | Set by board partners | 200 W TBP |
| **NVIDIA A100 80GB PCIe** (used datacenter) | 80 GB HBM2e | 1,935 GB/s | No reputable used price series | 300 W |
| **NVIDIA DGX Spark** | 128 GB LPDDR5X unified, 256-bit | 273 GB/s | $3,999 at launch; $4,699 since February 2026 | 240 W PSU |
| **AMD Ryzen AI Max+ 395** (Strix Halo) | Up to 128 GB unified, up to 96 GB as graphics memory | Platform-dependent | Set by system builders | |
| **AMD Ryzen AI Max+ PRO 495** | 192 GB unified, up to 160 GB as graphics memory | About 273 GB/s in Framework's LPDDR5X-8533, 256-bit build | Set by system builders | 45 to 120 W cTDP |
| **Apple Mac Studio, M5 Max** | Up to 128 GB unified | 614 GB/s | From $2,499 | 480 W maximum continuous (Mac Studio, M5) |
| **Apple Mac Studio, M5 Ultra** | Up to 512 GB unified | 1.2 TB/s | From $5,499 | |
| **NVIDIA DGX Station** (GB300) | 748 GB coherent: 252 GB HBM3e at 7.1 TB/s plus 496 GB LPDDR5X | | OEM only, no NVIDIA price; one reseller indicates about $100,000 ex VAT | 1,600 W, "a 20A circuit is required" |

Three patterns run through the table. **Discrete GPUs have the bandwidth and little capacity:** the fastest consumer card holds 32 GB, and no current GeForce card supports NVLink (the RTX 5090 lists it as "not supported"), so two cards share a model over PCIe. **Unified-memory machines have the capacity and less bandwidth:** DGX Spark and Strix Halo give 128 GB or more at roughly a sixth of an RTX 5090's bandwidth, and Apple sits between them. **Clustering is the vendors' answer to both:** DGX Spark links up to four units over its ConnectX-7 ports (two or three by direct cable, four through a 200 GbE switch), Apple pools M5 Mac Studios over Thunderbolt 5 with RDMA, and Intel's Project Battlematrix puts up to eight Arc Pro B60s, 192 GB in all, in one workstation.

## How It Got Here

Local inference started as an accident and became an industry in about two years:

| Date | Event | Problem it solved, and what it cost |
| --- | --- | --- |
| October 31, 2022 | GPTQ paper: post-training quantization to 3 or 4 bits | Large models in a fraction of their memory; a one-time calibration pass per model |
| February 24, 2023 | Meta announces LLaMA (7B to 65B) under a noncommercial research license, access by application | A strong base model outside a lab; gated to researchers |
| March 3, 2023 | The weights leak as a torrent posted on 4chan; Meta files takedowns | Anyone could run them; nobody had a license to |
| March 10, 2023 | First commit of llama.cpp ("Initial release"), on the `ggml` tensor library begun in September 2022 | LLaMA on a laptop CPU and Apple GPU, no Python or CUDA |
| June 1, 2023 | AWQ paper (activation-aware weight quantization) | Better 4-bit quality by protecting salient channels |
| June 20, 2023 | vLLM launches: "up to 24x higher throughput" than Hugging Face Transformers | Serving many users from one GPU; a server, not a desktop tool |
| June 22, 2023 | First commit of Ollama | Pull-and-run models with a local server; a second abstraction over llama.cpp |
| July 18, 2023 | Llama 2, the first Llama under a community license allowing commercial use | A usable license, with the 700 million monthly user clause |
| August 21, 2023 | GGUF merged into llama.cpp, replacing the GGML file format | One file carrying weights, tokenizer and architecture metadata |
| September 12, 2023 | PagedAttention paper: KV cache in fixed-size blocks, 2 to 4x throughput | Memory fragmentation that had wasted most of the KV cache |
| September 27, 2023 | Mistral 7B under Apache 2.0 | A permissive license from a commercial lab |
| October 6, 2023 | First commit of Open WebUI (then "Ollama WebUI") | A ChatGPT-style front end for local models |
| November 29, 2023 | Mozilla's llamafile: weights, llama.cpp and Cosmopolitan Libc in one executable | A model as a single file that runs on six operating systems |
| Early December 2023 | Apple releases MLX, "designed for Apple silicon" | Native use of unified memory on Macs |
| December 12, 2023 | SGLang paper (RadixAttention prefix caching) | Reusing KV cache across requests that share a prefix |
| February 8, 2024 | Ollama adds OpenAI Chat Completions compatibility at `/v1` | The same client code for local and hosted models |
| October 28, 2024 | OSI releases the Open Source AI Definition 1.0 | A test that "open weights" mostly fail |
| January 6, 2025 | NVIDIA announces RTX 50, "the first consumer GPUs to support FP4," and Project DIGITS at "starting at $3,000" | FP4 in hardware at home; a 128 GB desktop box |
| January 20, 2025 | DeepSeek R1 under MIT, with six distilled dense models | A frontier-class reasoning model with no license conditions |
| April 29, 2025 | Qwen3 under Apache 2.0, dense 0.6B to 32B and two MoE models | A permissive family covering every home size |
| May 15, 2025 | Ollama describes a new engine using GGML directly from Go | Less dependence on llama.cpp's release cycle |
| June 24, 2025 | NVIDIA introduces NVFP4 | 4-bit floats with finer scales on Blackwell |
| July 8, 2025 | LM Studio drops its separate license for work use | A free desktop runtime for employers too |
| August 5, 2025 | OpenAI's gpt-oss-120b and gpt-oss-20b under Apache 2.0, shipped in MXFP4 | A US lab's open weights sized for one 80 GB GPU and a 16 GB machine |
| October 15, 2025 | DGX Spark orders open; $3,999 for the Founders Edition | Grace Blackwell with 128 GB on a desk |
| February 2026 | DGX Spark Founders Edition rises to $4,699 "due to memory supply constraints" | The DRAM shortage reaches the hardware list price |
| April 2, 2026 | Gemma 4 under Apache 2.0, replacing the Gemma Terms of Use | Google's open models without a use policy |
| April 8, 2026 | Meta launches Muse Spark with no weights | The Llama line's successor closed, for now |
| July 27, 2026 | Kimi K3 weights (2.8T parameters) | The largest open release yet, under a revenue-clause license |
| August 25, 2026 | Mac Studio with M5 Ultra, up to 512 GB at 1.2 TB/s | Half a terabyte of fast memory on a desk |
| October 15, 2026 | Meta releases Muse Spark Open (816B total, 42B active) under the Muse Model License | Meta back in open weights, with a MaaS clause |

The through-line: each step moved a constraint. Quantization moved the memory floor, llama.cpp and GGUF moved the software floor, the OpenAI-compatible endpoint removed the integration cost, and the labs' licenses moved from research-only to Apache 2.0 for most mid-size models, while the largest releases picked up new conditions aimed at resellers.

## The Memory Math

A model needs three things resident: its weights, its KV cache, and the runtime's working buffers. The first two are arithmetic.

**Weights** take parameters x bits per weight / 8 bytes. llama.cpp's own table for Llama 3.1 8B gives the bits per weight of its formats: F16 16.0, Q8_0 8.50, Q4_K_M 4.89, IQ2_XXS 2.38, for files of 14.96, 7.95, 4.58 and 2.23 GiB. K-quants mix precisions across tensors, so 4.89 is that model's average, a good estimate for others.

**The KV cache** stores a key and a value vector per layer for every token in context: bytes per token = 2 x layers x KV heads x head dimension x bytes per element. Grouped-query attention is why this is affordable: Qwen3-32B has 64 query heads but 8 KV heads, so at FP16 it needs 2 x 64 x 8 x 128 x 2 = 256 KiB per token, and 8 GiB for a 32,768-token context. NVIDIA's older formula uses the full hidden size, which is right only for models without grouped-query attention (it gives about 2 GB for Llama 2 7B at 4,096 tokens).

Worked for four models whose configurations are published, in GiB, with the KV cache at FP16 for a 32,768-token context:

| Model | Parameters | Layers x KV heads x head dim | FP16 | FP8 | Q8_0 (8.5 bpw) | Q4_K_M (4.89 bpw) | KV per token | KV at 32k |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Qwen3-8B** | 8.2B | 36 x 8 x 128 | 15.3 | 7.6 | 8.1 | 4.7 | 144 KiB | 4.5 |
| **Qwen3-32B** | 32.8B | 64 x 8 x 128 | 61.1 | 30.5 | 32.5 | 18.7 | 256 KiB | 8.0 |
| **Qwen2.5-72B** | 72.7B | 80 x 8 x 128 | 135.4 | 67.7 | 71.9 | 41.4 | 320 KiB | 10.0 |
| **gpt-oss-120b** (MoE) | 117B total, 5.1B active | 36 x 8 x 64, alternate layers a 128-token window | 217.9 | 109.0 | 115.8 | 66.6 | 36 KiB on the 18 full-attention layers | 1.1 |

Reading the table:

- **Qwen3-32B at Q4_K_M with 32k of context** needs 18.7 + 8.0 = 26.7 GiB before runtime buffers: it does not fit a 24 GB card at FP16 KV, fits one with an 8-bit KV cache (4 GiB) or a 16k context, and fits a 32 GB RTX 5090 as is.
- **A 70B-class dense model at 4 bits** needs about 41 GiB of weights plus 10 GiB of cache: two 24 GB cards with a short context, or any 64 GB-plus unified-memory machine.
- **gpt-oss-120b** shows two design choices that cut memory: half its layers attend only to a 128-token window, so the cache is about a seventh of Qwen3-32B's per token, and OpenAI ships the MoE weights in MXFP4 so the model is "designed to run on a single 80GB GPU" while gpt-oss-20b "runs within 16GB."
- **Context is the hidden variable.** Runtimes default to small contexts because of this table. Ollama sizes its default by VRAM (4k below 24 GiB, 32k from 24 to 48 GiB, 256k at 48 GiB and above) and recommends at least 64,000 tokens for agents and coding tools; Aider's documentation warns that Ollama "silently discards context that exceeds the window" set. A coding assistant at a 4k context loses the file it is editing without an error.

## Bandwidth Sets the Speed

Generating a token reads every active weight once, so single-user decode is, in NVIDIA's words, "a memory-bound operation." An upper bound is bandwidth / bytes read per token. My arithmetic from the specifications, as ceilings that real runtimes land below:

| Model and precision | Bytes per token | RTX 5090 (1,792 GB/s) | DGX Spark (273 GB/s) | M5 Ultra (1.2 TB/s) |
| --- | --- | --- | --- | --- |
| Qwen3-32B Q4_K_M | About 20 GB | About 90 tokens/s | About 14 tokens/s | About 60 tokens/s |
| Qwen2.5-72B Q4_K_M | About 44 GB | Does not fit | About 6 tokens/s | About 27 tokens/s |
| gpt-oss-120b MXFP4 (5.1B active) | About 3 GB | Does not fit | Roughly 90 tokens/s | Roughly 400 tokens/s |

That is the case for mixture-of-experts models at home: capacity is set by total parameters, speed by active parameters. A 128 GB box with modest bandwidth runs a 117B MoE model at a usable speed and a 72B dense model slowly. Prompt processing (prefill) is the opposite: NVIDIA describes it as a matrix-matrix operation that "effectively saturates GPU utilization," which is where discrete GPUs keep a lead on long prompts. Throughput is a serving property, not a model property: vLLM's 24x came from batching many requests, and a home box with one user gets the single-stream ceiling above.

## Hardware Tiers

**One consumer GPU.** VRAM tiers are 12, 16, 24 and 32 GB. The RTX 50 series adds FP4 in hardware. A 16 GB card runs 8B to 14B models at 8 bits or gpt-oss-20b; 24 GB runs 27B to 32B models at 4 bits with a moderate context; 32 GB runs them with a long one.

**Two or more GPUs.** Without NVLink, runtimes split layers (pipeline) or tensors across cards over PCIe. ExLlamaV3 lists "tensor-parallel and expert-parallel inference for consumer multi-GPU setups," and llama.cpp splits layers across devices. Layer splits pass little data between cards per token; tensor parallelism passes more, so the PCIe link width each slot gets on the board matters for it.

**Used cards.** The RTX 3090 is the common used 24 GB card; as a dated market observation, eBay US asking prices averaged $1,554 on October 27, 2026, up 24.2% over 90 days, per ResalePrices. Used datacenter cards (A100, V100 and older) circulate without any audited price series. The A100 80GB comes as a dual-slot air-cooled PCIe card at 300 W or as an SXM module at 400 W that needs an HGX baseboard, not a PCIe slot; buy the PCIe form factor for a home machine.

**Unified memory.** DGX Spark (GB10, 128 GB at 273 GB/s, up to 1 PFLOP FP4 with sparsity, rated for models up to 200B parameters and 400B across two), Strix Halo machines (AMD says the Ryzen AI Max+ 395 with 96 GB of graphics memory runs "up to 128 billion parameter models"; the 2026 PRO 495 reaches 192 GB) and Mac Studio (up to 512 GB with M5 Ultra) trade bandwidth for capacity. They are quiet, draw a few hundred watts at most, and are the only home path to models above 100B parameters without a rack of GPUs. Meta says Muse Spark Open is optimized to run on two M5 Ultra Mac Studios with MLX.

**A GPU inside a hypervisor.** Running the model in a VM on a Proxmox host means PCI passthrough: IOMMU (VT-d or AMD-Vi) enabled in the CPU and firmware, interrupt remapping ("It is not possible to use PCI passthrough without interrupt remapping"), the GPU alone in its IOMMU group, host drivers blacklisted, and the device gone from the host. "VMs with passed-through devices cannot be migrated." The `pcie_acs_override` kernel option that splits groups is "a last option." Setup is [Hypervisors at Home](/books/hosting-and-cloud/hypervisors-at-home#pcie-and-gpu-passthrough); a container with the GPU exposed through the NVIDIA Container Toolkit avoids passthrough entirely.

## Runtimes

| Runtime | First public | License | Formats | Hardware | Serving model | API |
| --- | --- | --- | --- | --- | --- | --- |
| **llama.cpp** (`llama-server`) | March 10, 2023 | MIT | GGUF | CPU, CUDA, Metal, Vulkan, ROCm, SYCL | Slots per server, partial GPU offload with `-ngl` | OpenAI-compatible `/v1/chat/completions`, `/v1/completions`, `/v1/embeddings`, `/v1/models` |
| **Ollama** | June 2023 | MIT | GGUF from its own registry | NVIDIA, AMD (`rocm` image) | One server managing model load and unload; own GGML engine since May 2025 | Native API on port 11434 plus `/v1` since February 8, 2024 |
| **LM Studio** | 2023 (`lms` CLI April 2024) | Proprietary app, free for work since July 8, 2025; `lms` CLI MIT | GGUF; MLX on Apple Silicon | macOS, Windows, Linux | Desktop app, or the headless `llmster` daemon | OpenAI-style endpoints |
| **vLLM** | June 20, 2023 | Apache 2.0 | Hugging Face safetensors with AWQ, GPTQ, FP8 and others; GGUF | NVIDIA from Volta, AMD, Intel GPUs, x86 and Arm CPUs | PagedAttention, continuous batching | OpenAI-compatible server |
| **SGLang** | December 2023 paper, January 2024 repository | Apache 2.0 | Hugging Face formats | GPU servers | RadixAttention prefix cache, structured generation | OpenAI-compatible server |
| **ExLlamaV2 / ExLlamaV3** | August 2023 / April 2025 | MIT | EXL2 (2 to 8 bpw, mixed per layer); EXL3 ("a streamlined variant of QTIP") | NVIDIA CUDA | Single user, fast on consumer cards; V3 adds tensor and expert parallelism; V2 archived in favor of V3 | OpenAI API through TabbyAPI |
| **MLX** (`mlx-lm`) | Early December 2023 | MIT | MLX safetensors | Apple Silicon | Array framework on unified memory | Python API; LM Studio serves MLX models |

Two others fill niches: NVIDIA's TensorRT-LLM (open source since October 19, 2023) compiles models for NVIDIA GPUs with in-flight batching, and llamafile ships a model as one executable.

The choice falls out of the workload. One user on one machine wants llama.cpp or a wrapper around it (Ollama, LM Studio), because GGUF runs on every backend and partial offload lets a model spill into system RAM. Several users, or an agent firing parallel requests, want vLLM or SGLang, whose batching turns one GPU into a small inference service. A Mac wants MLX or a runtime that uses it.

## Quantization

| Format | Origin | Bits | Where it runs | What the evidence says |
| --- | --- | --- | --- | --- |
| **GGUF K-quants and I-quants** | llama.cpp, 2023 to 2024 | About 2 to 8.5 bpw (Q2_K to Q8_0, IQ2_XXS at 2.38) | Every llama.cpp backend, Ollama, LM Studio | An importance matrix (`imatrix`) from calibration text reduces loss; llama.cpp publishes size and speed, not accuracy |
| **GPTQ** | Paper, October 31, 2022 | 3 to 4 bits, weight-only | vLLM, Transformers | Second-order post-training quantization |
| **AWQ** | Paper, June 1, 2023 (MLSys 2024 best paper) | 4 bits, weight-only | vLLM, Transformers | Protects the weights that matter most to activations |
| **EXL2 / EXL3** | ExLlama | 2 to 8 bpw, any average | ExLlama, TabbyAPI | Mixed precision per layer to hit a target size |
| **FP8** (E4M3, E5M2) | NVIDIA, Arm and Intel paper, September 12, 2022 | 8 | Hopper and newer, RTX 40 and 50 | Red Hat's 500,000-evaluation study of Llama 3.1: "FP8 (W8A8-FP) is effectively lossless across all model scales"; well-tuned INT8 loses 1 to 3%; INT4 weight-only is "more competitive than expected" |
| **MXFP4** | OCP microscaling spec; shipped in gpt-oss | 4-bit E2M1 with one power-of-two scale per 32 values | Blackwell; runtimes that support gpt-oss | OpenAI ran all gpt-oss evaluations at MXFP4 |
| **NVFP4** | NVIDIA, June 24, 2025 | 4-bit E2M1 with an FP8 scale per 16 values, about 4.5 bits | Blackwell Tensor Cores, including RTX 50 | NVIDIA reports 1% or less degradation for DeepSeek-R1-0528 (vendor claim) |
| **QAT checkpoints** | Labs, 2025 to 2026 | Usually 4 | GGUF runtimes | Trained for the low precision rather than rounded after; Google publishes Gemma 4 QAT Q4_0 GGUFs |

The working rule: 8-bit (FP8 or Q8_0) when it fits, because the measured loss is near zero; 4 to 5 bits (Q4_K_M, AWQ, GPTQ, EXL3 around 4 bpw, NVFP4) as the normal home trade; below about 3 bits only to fit at all. The large-scale measurements are for Llama 3.1, so a new model's loss should be checked on its own task, not assumed. The KV cache quantizes separately: llama.cpp's `-ctk` and `-ctv` take 8-bit types, and ExLlamaV3 quantizes the cache to 2 to 8 bits, which is often the cheapest gigabytes on a tight card.

## Open-Weight Models and Their Licenses

"Open weights" is not "open source." OSI's Open Source AI Definition 1.0 requires the freedoms to use, study, modify and share, and the data information and code used to produce the parameters, so weights alone do not meet it. What a home user gets is a license on the weights, and those vary more than software licenses ([The License Spectrum](/books/hosting-and-cloud/open-source-and-the-clouds#the-license-spectrum) covers the software side). Release dates are the labs' own announcements or model cards, or the date the weights went public on Hugging Face where that is the release, as of October 2026:

| Family | Lab | Release | Sizes | License | Notable restrictions |
| --- | --- | --- | --- | --- | --- |
| **Llama 3.x** | Meta | 3: April 18, 2024; 3.1 405B and 3.3 70B later in 2024 | 8B, 70B, 405B | Llama 3.x Community Licenses | 700 million monthly active users needs a license from Meta; "Built with Llama"; Llama 3.2 multimodal rights not granted to people or companies based in the EU |
| **Llama 4** Scout, Maverick | Meta | April 5, 2025 | 109B and 402B total, MoE | Llama 4 Community License | Over 700 million monthly active users "must request a license from Meta"; "Built with Llama"; derivatives' names start with "Llama" |
| **Muse Glimmer** | Meta | August 2026 | 30B | Apache 2.0 | None beyond Apache |
| **Muse Spark Open** | Meta | October 15, 2026 | 816B total, 42B active | Muse Model License, with a usage policy | Model-as-a-service businesses over $20 million revenue in any 12 months must notify Meta and sign a separate agreement; "Built with Muse Spark Open"; NVFP4 needs at least 700 GB of VRAM |
| **Qwen3** | Alibaba Qwen | April 29, 2025 | Dense 0.6B to 32B; MoE 30B-A3B, 235B-A22B | Apache 2.0 | None |
| **Qwen3.8 27B** | Alibaba Qwen | August 2026 | 27B | Apache 2.0 | None |
| **Qwen3.8-Max** | Alibaba Qwen | August 2026 | 2.4T total, 95B active | Qwen3.8-Max License | Name display above 100 million monthly users or $20 million monthly revenue; MaaS or "AI Work Assistant" businesses over $50 million in 12 months need a separate license; internal use exempt |
| **DeepSeek R1** | DeepSeek | January 20, 2025 | Plus six distilled dense models | MIT | None |
| **DeepSeek V4** | DeepSeek | V4-Pro weights April 23, 2026; V4-Pro-0813 August 13, 2026; V4.1-Flash September 10, 2026 | 1.65T (V4-Pro-0813), 763B (V4.1-Flash) | MIT | None |
| **Mistral Small 3** | Mistral AI | January 2025 | 24B | Apache 2.0 | None |
| **Mistral Large 2** | Mistral AI | July 24, 2024 | 123B | Mistral Research License | Research and non-commercial; self-deployed commercial use needs a commercial license |
| **Mistral Medium 3.5** | Mistral AI | March 31, 2026 | 128B | "Modified MIT License" | No rights at all for a company whose global monthly revenue exceeded $20 million, for any use |
| **Gemma 1 to 3n** | Google | From February 2024 | Several sizes | Gemma Terms of Use (modified April 1, 2026) | Prohibited Use Policy flows down to users; Google may "restrict (remotely or otherwise) usage"; models distilled from Gemma outputs count as derivatives |
| **Gemma 4** | Google | April 2, 2026 | E2B, E4B, 26B MoE, 31B dense | Apache 2.0 | None |
| **gpt-oss** | OpenAI | August 5, 2025 | 117B total / 5.1B active; 21B / 3.6B | Apache 2.0 | The "harmony" response format (technical, not legal) |
| **Kimi K2** | Moonshot AI | July 11, 2025 | About 1T | Modified MIT | Display "Kimi K2" above 100 million monthly users or $20 million monthly revenue |
| **Kimi K3** | Moonshot AI | July 27, 2026 | 2.8T total, 104B active | Kimi K3 License | MaaS businesses over $20 million in 12 months need a separate agreement; name display as K2; internal use exempt |
| **GLM-5.3 / GLM-5.3-Flash** | Z.ai | August 28, 2026 / August 26, 2026 | Large MoE / Flash | GLM-5.3 License / MIT | GLM-5.3: MaaS businesses over $10 billion in 12 months must pass Z.ai's security review first |
| **Phi-4** | Microsoft | December 2024 | 14B | MIT | None |

The pattern as of October 2026: the mid-size models a home machine can run are mostly Apache 2.0 or MIT (Qwen, DeepSeek, Gemma 4, gpt-oss, Muse Glimmer, GLM Flash, Mistral Small). The largest releases (Kimi K3, Qwen3.8-Max, Muse Spark Open, GLM-5.3) use a newer "permissive plus model-as-a-service clause" pattern that targets API resellers and exempts home and internal use. Meta's own line went from noncommercial (2023) to community licenses (2023 to 2025) to closed (April 2026) and back to a custom license (October 2026).

> [!WARNING]
> "Modified MIT" is not MIT. Mistral Medium 3.5's license gives no rights at all to anyone whose company (or employer) had global consolidated monthly revenue above $20 million in the preceding month, so an employee of a large company cannot run it even internally, even at home for work, without a commercial license from Mistral. Read the license file of every model, not its tag.

## Front Ends and APIs

The OpenAI Chat Completions shape is the de facto local API: llama.cpp's `llama-server`, Ollama's `/v1`, vLLM, SGLang, TabbyAPI and LM Studio all expose it, so the same client code points at a home box, a hosted open-model provider or a frontier API by changing a base URL and a key. Not every tool takes that path: Continue talks to Ollama through its own `ollama` provider (`apiBase: http://localhost:11434`), and Aider uses `ollama_chat/<model>` and sizes the context itself.

**Open WebUI** is the common front end: chats, knowledge bases with hybrid search, web search, speech-to-text and text-to-speech, image generation through ComfyUI and others, Python tools and functions, and MCP over streamable HTTP, against Ollama or "any OpenAI-compatible provider." Its license changed: BSD-3 through v0.6.5, then from v0.6.6 (April 19, 2025) a custom license that forbids altering or removing "Open WebUI" branding unless the deployment has 50 or fewer users in 30 days, written permission, or an enterprise license; the project says it is "not OSI-approved." A household is well inside the exception; a company rolling it out to staff is not.

Any of these servers on a LAN is an unauthenticated model endpoint unless configured otherwise: `llama-server` takes `--api-key`, and Open WebUI needs a fixed `WEBUI_SECRET_KEY` or every recreated container logs everyone out. Reaching it from outside belongs behind a VPN or tunnel ([Exposing Home Services](/books/hosting-and-cloud/exposing-home-services)), never an open port.

## Local RAG and Agents

Retrieval at home is the same pipeline as anywhere: chunk documents, embed them, store vectors, retrieve on each question. The embedding models are small (Google's EmbeddingGemma-2 went up on Hugging Face on September 14, 2026 under Apache 2.0), llama.cpp serves them on `/v1/embeddings` with `--embeddings`, and Open WebUI's knowledge bases do the rest. Hosted embeddings are cheap (Fireworks lists $0.008 per million tokens for models up to 150M parameters), so the reason to embed locally is that the documents never leave, not cost. The corpus usually lives on the NAS ([NAS & Home Storage](/books/hosting-and-cloud/nas-and-home-storage)), and a local model plus an offline copy of reference content is one piece of [the offline internet](/books/hosting-and-cloud/self-hosted-apps#the-offline-internet).

Local agents and coding assistants inherit every risk of hosted ones and remove the vendor's guardrails. A model with file or shell access that reads untrusted content (a web page, an email, a repository's README) is the [lethal trifecta](/docs/security/ai-security#the-lethal-trifecta) whether it runs in a datacenter or under a desk; the rules are the playbook's [Agents, Tools and MCP](/docs/security/ai-security#agents-tools-and-mcp), [AI Agents](/docs/architecture/ai-agents) for agents in a product, and [Least Privilege for Agents](/docs/engineering/ai-assisted-development#least-privilege-for-agents) for coding agents. The hosting-side facts are the context window (64k or more for agents, per Ollama) and parallelism, since agents issue concurrent requests that a batching server handles and a single-slot desktop runtime queues.

## Image and Speech at Home

| Model | Release | License | Notes |
| --- | --- | --- | --- |
| **Stable Diffusion 1.x** | August 2022 | CreativeML OpenRAIL-M | Use-based restrictions |
| **SDXL 1.0** | July 2023 | OpenRAIL++ | |
| **Stable Diffusion 3.5 Large** | October 22, 2024 | Stability AI Community License | Ends once you or affiliates make more than $1,000,000 in annual revenue; then a separate license |
| **FLUX.1 [dev] / [schnell]** (12B) | August 1, 2024 | dev: non-commercial weights (outputs usable commercially); schnell: Apache 2.0 | |
| **Whisper large-v3 / large-v3-turbo** | November 2023 / October 2024 | Apache 2.0 tag / MIT; OpenAI's repository releases code and weights under MIT | Speech-to-text |
| **Kokoro-82M** | v1.0 January 27, 2025 | Apache 2.0 | Text-to-speech, 82M parameters |

Image and video run in ComfyUI (GPL-3.0), a node-graph GUI, API and backend that supports Stable Diffusion, SDXL, SD3.5, FLUX.1 and FLUX.2, video and audio models, and claims to run large models in as little as 4 GB of VRAM by offloading. Speech is light: whisper.cpp (MIT, in the `ggml-org` organization alongside llama.cpp) runs Whisper large in about 3.9 GB of memory on CPUs, Apple, CUDA, ROCm and Vulkan. Image licenses deserve the same reading as LLM licenses: FLUX.1 [dev]'s weights are non-commercial even though its outputs are not, and Stability's community license has a revenue ceiling.

## Power and Heat

At the US average residential price of 18.16 cents per kWh (EIA, August 2026, preliminary), 1 W drawn all year is 8.76 kWh, about $1.59. Worked from the vendors' ratings:

| Load | kWh per year | Cost per year at 18.16 cents |
| --- | --- | --- |
| A box that idles at 50 W, all year | 438 | About $80 |
| RTX 5090 at its 575 W TGP, 4 hours a day | 840 | About $152 |
| DGX Spark at its full 240 W PSU rating, all year (a ceiling) | 2,102 | About $382 |
| Mac Studio (M5) at its 480 W maximum continuous, all year (a ceiling) | 4,205 | About $764 |

Idle draw dominates a machine that waits for questions; generation dominates one that runs batch jobs. Every watt ends up as heat in the room, so a 575 W card under load is a space heater that needs a 1,000 W power supply, and a closet needs ventilation. A standard US 15 A, 120 V circuit is 1,800 W before any derating for continuous load, which is why NVIDIA requires a 20 A circuit for the 1,600 W DGX Station and why a second high-end GPU on the same circuit as the rest of a home office is a planning problem. Local tariffs vary widely; the EIA state tables are the input for a real budget. When the power, noise and circuits outgrow the house, the next step is [From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation).

## Privacy

Local inference sends nothing: prompts, documents and outputs stay on hardware the owner controls, which is the strongest reason to run it. The contrast is the unpaid tiers of hosted APIs; Google's Gemini API terms say unpaid services use submitted content "to provide, improve, and develop" products, that human reviewers "may read, annotate, and process your API input and output," and "Do not submit sensitive, confidential, or personal information to the Unpaid Services." Paid frontier APIs exclude training by default, and their retention and residency terms belong to Where AI Runs.

The residual risks at home are different, not absent. Model files come from strangers: prefer the lab's own repository or a well-known quantizer, and safetensors or GGUF over formats that execute code on load. An agent with tools can exfiltrate what a chat could not, which is the security doc's subject. And a front end exposed to the internet is a data store of every conversation.

## The Alternatives

| Option | Model | Strengths | Failure modes | Cost | Who it suits |
| --- | --- | --- | --- | --- | --- |
| **One 24 to 32 GB GPU** with llama.cpp or Ollama | Dense 8B to 32B at 4 to 8 bits | Fastest per dollar for models that fit; CUDA everywhere | Capacity cliff above 32 GB; 575 W under load | Card plus a desktop | Most home users |
| **Two or more consumer GPUs** | 70B dense, larger MoE | More VRAM per dollar | PCIe splits, lanes, power, heat, noise | Cards, PSU, circuit | Enthusiasts who want 70B dense |
| **Used datacenter cards** | 40 to 80 GB per card | High bandwidth and capacity | No price series, form factors, cooling, no warranty | Market price | Builders with server chassis |
| **128 GB unified memory** (DGX Spark, Strix Halo) | 100B-class MoE | Capacity, quiet, low power | Slow on large dense models; prefill slower than a discrete GPU | $4,699 for a Spark Founders Edition; Strix Halo set by builders | MoE models, development against NVIDIA's stack |
| **Mac Studio** | Up to 512 GB | Largest single-box memory; MLX | Bandwidth below the fastest discrete cards; no CUDA | From $2,499 / $5,499 | Very large models, Mac users |
| **Hosted open model or frontier API** | Any | No hardware, best models | Data leaves; metered | Per token | Where AI Runs covers it |

Licensing cuts across every row: the hardware decides what fits, the license decides what you may do with it.

## My Default

My default is one NVIDIA card with 24 to 32 GB (an RTX 5090 new, or a used RTX 3090 if price matters more than speed and FP4) in a Linux box, running llama.cpp's `llama-server` or Ollama in a container, with Open WebUI in front and the context set explicitly to what the work needs. The models I'd start with are Apache 2.0 or MIT ones that fit at 4 to 8 bits: a Qwen3 or Qwen3.8 27B-to-32B model, Gemma 4 31B, or gpt-oss-20b, with gpt-oss-120b only if the machine has the memory. I'd point every client at the OpenAI-compatible endpoint, so the same code can overflow to a hosted provider when a task needs a bigger model.

I'd pick a 128 GB unified-memory box instead when the goal is 100B-class MoE models (gpt-oss-120b, Qwen3 235B-A22B at about 3 bits) rather than speed on 30B dense ones, and a Mac Studio when the goal is the largest open models on one desk. I'd switch to vLLM when more than one person or an agent with parallel calls uses the box. And I'd read the license file before the model card: the permissive families are good enough that a revenue-clause or "Modified MIT" model has to earn its place.

What would change this is the work itself. Epoch's May 2026 measurement puts the best open weights about four months behind the closed frontier on average, so for tasks that need frontier quality I'd use a frontier API and keep the home box for private, offline and bulk work.

## How to Build It

A home inference stack is two containers. Ollama with an NVIDIA GPU (the NVIDIA Container Toolkit installed on the host), Open WebUI in front:

```yaml
# compose.yml: Ollama plus Open WebUI on one NVIDIA host.
services:
  ollama:
    image: ollama/ollama            # ollama/ollama:rocm for AMD, with /dev/kfd and /dev/dri
    volumes:
      - ollama:/root/.ollama        # models live here; size it like a NAS share
    environment:
      OLLAMA_CONTEXT_LENGTH: "32768"   # explicit, not the VRAM-tier default
    ports:
      - "127.0.0.1:11434:11434"     # loopback only; Open WebUI reaches it on the network
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    environment:
      OLLAMA_BASE_URL: http://ollama:11434
      WEBUI_SECRET_KEY: ${WEBUI_SECRET_KEY}   # openssl rand -hex 32, kept in .env
    volumes:
      - open-webui:/app/backend/data  # chats, users, knowledge bases: back this up
    ports:
      - "3000:8080"
    depends_on: [ollama]
    restart: unless-stopped

volumes:
  ollama:
  open-webui:
```

The llama.cpp variant swaps the first service for `ghcr.io/ggml-org/llama.cpp:server-cuda` with a command such as `-m /models/qwen3-32b-q4_k_m.gguf -c 32768 -ngl all -ctk q8_0 -ctv q8_0 --port 8080 --host 0.0.0.0 --api-key ${LLAMA_API_KEY}`, and Open WebUI adds it as an OpenAI-compatible connection. Compose, backups and the rest of the self-hosted stack are [Self-Hosted Apps](/books/hosting-and-cloud/self-hosted-apps).

Before pulling a model, budget the memory with the formula above. For a 24 GB card:

| Model | Precision | Weights (GiB) | Context | KV cache (GiB) | Total before buffers | Fits 24 GB |
| --- | --- | --- | --- | --- | --- | --- |
| Qwen3-8B | Q8_0 | 8.1 | 32k, FP16 KV | 4.5 | 12.6 | Yes, with room for an embedding model |
| Qwen3-32B | Q4_K_M | 18.7 | 32k, FP16 KV | 8.0 | 26.7 | No |
| Qwen3-32B | Q4_K_M | 18.7 | 32k, Q8_0 KV | 4.0 | 22.7 | Barely; leave 1 to 2 GiB for buffers |
| Qwen2.5-72B | Q4_K_M | 41.4 | 8k, FP16 KV | 2.5 | 43.9 | No: two cards or unified memory |

In the core model, the home box is a `model_endpoint` resource owned by the homelab's own account (the operator and the customer are one person, as in [The Homelab](/books/hosting-and-cloud/homelab)), and each loaded model and precision is recorded in the usage dimensions rather than a new table. Every response already reports its tokens: Ollama returns `prompt_eval_count`, `eval_count` and durations in nanoseconds, and OpenAI-compatible servers return a `usage` object. Logging them gives the same `usage_events` a provider meters, rated at a price of zero:

```sql
-- One local completion, metered like any provider's: input and output tokens as two events.
INSERT INTO usage_events (source, idempotency_key, account_id, resource_id, meter, quantity,
                          dimensions, occurred_during)
VALUES
  ('ollama@gpu-box', 'req-01J9Z…:in',  :home_account, :endpoint_id, 'model.input_tokens', 1843,
   '{"model": "qwen3:32b", "quant": "Q4_K_M", "ctx": 32768, "runtime": "ollama"}',
   tstzrange(:started_at, :finished_at)),
  ('ollama@gpu-box', 'req-01J9Z…:out', :home_account, :endpoint_id, 'model.output_tokens', 412,
   '{"model": "qwen3:32b", "quant": "Q4_K_M", "ctx": 32768, "runtime": "ollama",
     "eval_ns": 9150000000}',
   tstzrange(:started_at, :finished_at));

-- What the lab actually runs, and how fast: tokens and decode speed per model and day.
SELECT dimensions->>'model' AS model, dimensions->>'quant' AS quant,
       date_trunc('day', lower(occurred_during)) AS day,
       sum(quantity) FILTER (WHERE meter = 'model.output_tokens') AS output_tokens,
       sum(quantity) FILTER (WHERE meter = 'model.output_tokens')
         / NULLIF(sum((dimensions->>'eval_ns')::numeric) / 1e9, 0) AS tokens_per_second
FROM usage_events
WHERE resource_id = :endpoint_id
GROUP BY 1, 2, 3
ORDER BY 3, 1;
```

The zero price is the point: the same meters priced at a hosted provider's per-token rates show what the box saves, and against its electricity (the power table above) what it costs. That comparison, with hardware amortization and breakeven, is Where AI Runs.

## What This Means for the System You Build

- **Size memory before buying hardware:** weights at the chosen precision plus the KV cache at the context you will actually use.
- **Treat bandwidth as the speed limit** for one user, and prefer MoE models on high-capacity, low-bandwidth machines.
- **Set the context window explicitly;** runtime defaults are sized to VRAM and truncation can be silent.
- **Default to 8-bit when it fits and 4 to 5 bits when it doesn't,** and check quality on your own task.
- **Code against the OpenAI-compatible endpoint** so local, hosted open and frontier models are a base URL apart.
- **Read the license file, not the tag:** Apache 2.0 and MIT for most mid-size models, revenue clauses on the largest, and "Modified MIT" that can bar an employer outright.
- **Keep model servers off the internet,** with an API key on the LAN and a VPN or tunnel for remote use.
- **Budget watts as dollars and heat:** 1 W all year is about $1.59 at the US average rate.
- **Meter local tokens like a provider would,** at a price of zero, so the home box can be compared with what it replaces.

## References

**Hardware**

- [NVIDIA: GeForce RTX 50 Series announcement](https://nvidianews.nvidia.com/news/nvidia-blackwell-geforce-rtx-50-series-opens-new-world-of-ai-computer-graphics), launch prices and dates, first consumer GPUs with FP4
- [NVIDIA: GeForce RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/), 32 GB, 575 W TGP, PSU guidance, NVLink not supported
- [NVIDIA: Compare GeForce graphics cards](https://www.nvidia.com/en-us/geforce/graphics-cards/compare/), memory sizes, bus widths and bandwidth of RTX 50 cards, RTX 3090 and 4090 memory
- [NVIDIA: A100](https://www.nvidia.com/en-us/data-center/a100/), 80 GB HBM2e, bandwidth, TDP and form factors
- [ResalePrices: NVIDIA RTX 3090](https://resaleprices.com/gpu/nvidia-rtx-3090), eBay US asking prices on October 27, 2026 (a listings aggregator, not an audited series)
- [Intel: Arc Pro B60 specifications](https://www.intel.com/content/www/us/en/products/sku/243916/intel-arc-pro-b60-graphics/specifications.html), 24 GB, 456 GB/s, 200 W
- [Intel: Project Battlematrix](https://www.intel.com/content/www/us/en/developer/articles/technical/introduction-project-battlematrix.html), up to eight Arc Pro B60s and 192 GB
- [NVIDIA: Project DIGITS announcement](https://nvidianews.nvidia.com/news/nvidia-puts-grace-blackwell-on-every-desk-and-at-every-ai-developers-fingertips), January 6, 2025, 128 GB and "starting at $3,000"
- [NVIDIA: DGX Spark arrives](https://nvidianews.nvidia.com/news/nvidia-dgx-spark-arrives-for-worlds-ai-developers), orders from October 15, 2025
- [NVIDIA Developer Forums: 2/23/2026 Price Change Announcement](https://forums.developer.nvidia.com/t/2-23-2026-price-change-announcement/361713), Founders Edition from $3,999 to $4,699
- [NVIDIA: DGX Spark](https://www.nvidia.com/en-us/products/workstations/dgx-spark/), GB10, 128 GB at 273 GB/s, FP4 figure, 240 W PSU, ConnectX-7 clustering
- [NVIDIA: DGX Station](https://www.nvidia.com/en-us/products/workstations/dgx-station/), 748 GB coherent memory, 1,600 W and the 20 A circuit
- [pi3g: DGX Station prices](https://pi3g.com/?p=31780), reseller indicative price, October 2026
- [AMD: Variable Graphics Memory FAQ](https://www.amd.com/en/blogs/2025/faqs-amd-variable-graphics-memory-vram-ai-model-sizes-quantization-mcp-more.html), Ryzen AI Max+ 395 with 96 GB of graphics memory and model sizes
- [AMD: Ryzen AI Halo and Max PRO 400](https://www.amd.com/en/blogs/2026/amd-powers-next-generation-agent-computers-with-new-ryzen-ai-hal.html), May 20, 2026, the 495 with 192 GB and 160 GB as graphics memory, cTDP
- [Framework: Desktop](https://frame.work/desktop), Ryzen AI Max+ PRO 495 with LPDDR5X-8533 on a 256-bit bus
- [Apple: Mac Studio with M5 Max and M5 Ultra](https://www.apple.com/newsroom/2026/08/apple-introduces-new-mac-studio-with-m5-max-and-m5-ultra/), August 25, 2026, memory, bandwidth, prices and Thunderbolt 5 clustering
- [Apple: Mac Studio power consumption](https://support.apple.com/en-us/128107), 480 W maximum continuous
- [Apple: Mac Studio with M3 Ultra](https://www.apple.com/newsroom/2025/03/apple-unveils-new-mac-studio-the-most-powerful-mac-ever/), March 5, 2025, up to 512 GB
- [Proxmox VE wiki: PCI Passthrough](https://pve.proxmox.com/wiki/PCI_Passthrough), IOMMU, interrupt remapping, groups, driver blacklisting, no migration, ACS override

**Memory, bandwidth and serving**

- [NVIDIA: Mastering LLM techniques, inference optimization](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/), decode as memory-bound and the KV cache formula
- [Kwon et al.: Efficient Memory Management for LLM Serving with PagedAttention](https://arxiv.org/abs/2309.06180), September 12, 2023
- [vLLM: launch post](https://vllm.ai/blog/2023-06-20-vllm), June 20, 2023, throughput over Transformers and TGI
- [Qwen: Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) and [config](https://huggingface.co/Qwen/Qwen3-8B/raw/main/config.json), parameters, layers and KV heads
- [Qwen: Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B) and [config](https://huggingface.co/Qwen/Qwen3-32B/raw/main/config.json), 32.8B parameters, 64 layers, 8 KV heads, head dimension 128
- [Qwen: Qwen2.5-72B-Instruct](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct) and [config](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/raw/main/config.json), 72.7B parameters, 80 layers, 8 KV heads
- [OpenAI: gpt-oss-120b config](https://huggingface.co/openai/gpt-oss-120b/raw/main/config.json), layers, KV heads, head dimension, the 128-token sliding window on alternate layers, MXFP4
- [Ollama: Context length](https://docs.ollama.com/context-length), defaults by VRAM, `OLLAMA_CONTEXT_LENGTH` and the 64,000-token advice
- [Aider: Ollama](https://aider.chat/docs/llms/ollama.html), `ollama_chat/` models and silent truncation

**Runtimes**

- [llama.cpp: first commit](https://github.com/ggml-org/llama.cpp/commit/26c084662903ddaca19bef982831bfb0856e8257), March 10, 2023
- [llama.cpp](https://github.com/ggml-org/llama.cpp), MIT, backends
- [llama.cpp: server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md), endpoints, flags and the CUDA server image
- [llama.cpp: GGUF pull request #2398](https://github.com/ggml-org/llama.cpp/pull/2398), August 21, 2023
- [Ollama: first commit](https://github.com/ollama/ollama/commit/8fa91332fa942909fb9206876e41c64599fe33ca), June 22, 2023
- [Ollama: OpenAI compatibility](https://ollama.com/blog/openai-compatibility), February 8, 2024
- [Ollama: new multimodal engine](https://ollama.com/blog/multimodal-models), May 15, 2025, GGML used directly
- [Ollama: Docker](https://docs.ollama.com/docker), images, volume and port
- [Ollama: Usage](https://docs.ollama.com/api/usage), token counts and nanosecond timings
- [LM Studio: free for work](https://lmstudio.ai/blog/free-for-work), July 8, 2025
- [LM Studio: Docs](https://lmstudio.ai/docs/app), llama.cpp and MLX engines, platforms
- [LM Studio: Developer docs](https://lmstudio.ai/docs/developer), OpenAI-style endpoints and the `llmster` daemon
- [vLLM: Quantization](https://docs.vllm.ai/en/latest/features/quantization/), supported methods and hardware
- [Zheng et al.: SGLang](https://arxiv.org/abs/2312.07104), December 12, 2023, RadixAttention
- [ExLlamaV2](https://github.com/turboderp-org/exllamav2), MIT, EXL2 and the archive notice
- [ExLlamaV3](https://github.com/turboderp-org/exllamav3), EXL3, cache quantization, tensor and expert parallelism, TabbyAPI
- [MLX: first commit](https://github.com/ml-explore/mlx/commit/e411fcae68e8fe157f2cb505a2b5dda1a2b1b297) and [Computerworld: Apple launches MLX](https://www.computerworld.com/article/3711408/apple-launches-mlx-machine-learning-framework-for-apple-silicon.html), late November and early December 2023
- [MLX](https://github.com/ml-explore/mlx), MIT
- [NVIDIA: TensorRT-LLM](https://developer.nvidia.com/blog/nvidia-tensorrt-llm-supercharges-large-language-model-inference-on-nvidia-h100-gpus/), open source from October 19, 2023
- [Mozilla: Introducing llamafile](https://hacks.mozilla.org/2023/11/introducing-llamafile/), November 29, 2023

**Quantization**

- [llama.cpp: quantize README](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), bits per weight and sizes per format, imatrix
- [Frantar et al.: GPTQ](https://arxiv.org/abs/2210.17323), October 31, 2022
- [Lin et al.: AWQ](https://arxiv.org/abs/2306.00978), June 1, 2023
- [Micikevicius et al.: FP8 Formats for Deep Learning](https://arxiv.org/abs/2209.05433), September 12, 2022
- [Red Hat and Neural Magic: large-scale quantization evaluation (arXiv 2411.02355)](https://arxiv.org/abs/2411.02355), November 4, 2024, FP8, INT8 and INT4 on Llama 3.1
- [NVIDIA: Introducing NVFP4](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/), June 24, 2025, format and accuracy claim

**Models and licenses** (as of October 2026)

- [OSI: Open Source AI Definition 1.0](https://opensource.org/ai/open-source-ai-definition) and [release announcement](https://opensource.org/?p=77299), October 28, 2024
- [Meta: Introducing LLaMA](https://ai.meta.com/blog/large-language-model-llama-meta-ai/), February 24, 2023, noncommercial research license
- [GIGAZINE: LLaMA leak](https://www.gigazine.net/gsc_news/en/20230306-llama-65b-leaked) and [The Batch: How Meta's LLaMA leaked](https://www.deeplearning.ai/the-batch/how-metas-llama-nlp-model-leaked/), March 3, 2023 and the takedowns
- [Touvron et al.: Llama 2](https://arxiv.org/abs/2307.09288), July 18, 2023
- [Meta: Llama 3](https://ai.meta.com/blog/meta-llama-3/), April 18, 2024
- [Meta: Llama 3.2 Acceptable Use Policy](https://dev.meta.ai/llama/llama3_2/use-policy), the EU multimodal carve-out
- [Meta: Llama 4 Community License](https://dev.meta.ai/llama/llama4/license/), effective April 5, 2025, 700 million users, attribution and naming
- [Meta: Introducing Muse Spark](https://about.fb.com/news/2026/04/introducing-muse-spark-meta-superintelligence-labs/), April 8, 2026, no weights
- [Meta: Muse Glimmer 30B](https://huggingface.co/meta-models/Muse-Glimmer-30B), August 2026, Apache 2.0
- [Meta: Muse Spark Open](https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B), October 15, 2026, Muse Model License terms, sizes, VRAM, MLX on two Mac Studios
- [Qwen: Qwen3](https://qwenlm.github.io/blog/qwen3/), April 29, 2025, sizes and Apache 2.0
- [Qwen: Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B), Apache 2.0
- [Qwen: Qwen3.8-Max LICENSE](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B/raw/main/LICENSE), display and MaaS clauses
- [DeepSeek: R1](https://huggingface.co/deepseek-ai/DeepSeek-R1), January 20, 2025, MIT and distilled models
- [DeepSeek: V4-Pro](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro), weights and MIT
- [Mistral AI: Mistral Large 2](https://mistral.ai/news/mistral-large-2407), July 24, 2024, research license
- [Mistral AI: Mistral Medium 3.5 LICENSE](https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/raw/main/LICENSE), the $20 million monthly revenue exclusion
- [Mistral AI: Mistral 7B](https://huggingface.co/mistralai/Mistral-7B-v0.1), Apache 2.0
- [Google: Gemma Terms of Use](https://ai.google.dev/gemma/terms), flow-down, remote restriction and derivatives
- [Google: Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/), April 2, 2026, Apache 2.0
- [Google: Gemma 4 31B](https://huggingface.co/google/gemma-4-31B-it), license tag
- [Google: EmbeddingGemma models](https://huggingface.co/api/models?author=google&search=embeddinggemma), EmbeddingGemma-2 on September 14, 2026, Apache 2.0
- [OpenAI: gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b), sizes, active parameters, MXFP4, single 80 GB GPU and 16 GB claims
- [OpenAI: gpt-oss repository](https://github.com/openai/gpt-oss), Apache 2.0, August 5, 2025
- [Moonshot AI: Kimi K2 LICENSE](https://huggingface.co/moonshotai/Kimi-K2-Instruct/raw/main/LICENSE), the display clause
- [Moonshot AI: Kimi K3](https://www.kimi.com/blog/kimi-k3), the weights release by July 27, 2026
- [Moonshot AI: Kimi K3 LICENSE](https://huggingface.co/moonshotai/Kimi-K3/raw/main/LICENSE), MaaS and display clauses
- [Z.ai: GLM-5.3 LICENSE](https://huggingface.co/zai-org/GLM-5.3/raw/main/LICENSE), the security review clause
- [Z.ai: GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash), MIT
- [Epoch AI: Open-closed ECI gap](https://epoch.ai/data-insights/open-closed-eci-gap), May 29, 2026, the four-month lag

**Front ends, RAG and agents**

- [Open WebUI: first commit](https://github.com/open-webui/open-webui/commit/5cd4946df2f1da6caeb100f993add7b7e02343a5), October 6, 2023
- [Open WebUI: License](https://docs.openwebui.com/license), the v0.6.6 branding clause and the 50-user exception
- [Open WebUI: Features](https://docs.openwebui.com/features/), knowledge bases, voice, image generation, tools and MCP
- [Open WebUI: Quick start](https://docs.openwebui.com/getting-started/quick-start/), images, ports, volumes, `OLLAMA_BASE_URL` and `WEBUI_SECRET_KEY`
- [Continue: Ollama guide](https://docs.continue.dev/guides/ollama-guide), its own `ollama` provider
- [Fireworks: Pricing](https://fireworks.ai/pricing), hosted embedding prices

**Image and speech**

- [Stability AI: Community License](https://stability.ai/community-license-agreement), the $1,000,000 revenue threshold
- [Black Forest Labs: FLUX.1 announcement](https://bfl.ai/announcements/24-08-01-bfl), August 1, 2024, dev and schnell licenses
- [Black Forest Labs: FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev), non-commercial weights
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI), GPL-3.0, supported models and low-VRAM claim
- [OpenAI: Whisper](https://github.com/openai/whisper), code and weights under MIT
- [whisper.cpp](https://github.com/ggml-org/whisper.cpp), MIT, backends and memory per model
- [hexgrad: Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), 82M parameters, Apache 2.0, v1.0 January 27, 2025

**Power and privacy**

- [EIA: Average price of electricity to ultimate customers](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a), residential 18.16 cents per kWh, August 2026, preliminary
- [Google: Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms), unpaid-service use of content and human review
