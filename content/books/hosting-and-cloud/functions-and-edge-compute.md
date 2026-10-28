+++
title = "Functions, Isolates & Edge Compute"
nav_title = "Functions & Edge Compute"
description = "Function platforms from Lambda's 2014 preview to isolates, Wasm and CDN functions: how they run, cold starts, WASI, and limits and pricing compared."
category = "Hosting & Cloud Industry"
order = 2122
part = "The Stack, Bottom to Top"
tags = ["serverless", "functions", "edge-compute", "webassembly", "pricing"]
+++

A function platform sells compute by the event. The customer uploads code, names a trigger (an HTTP request, a queue message, a file landing in a bucket, a timer), and pays for each invocation and for how long or how hard it ran, with nothing billed while nothing happens. The provider owns everything a VM customer would: the runtime, the operating system, the placement, the scaling from zero to thousands of concurrent copies and back, and the wall between one customer's function and the next. In exchange, the provider gets to pack the code of millions of customers onto shared fleets and to charge per millisecond for capacity a VM customer would have rented by the hour and left idle.

Three families now share the name. **Regional functions** (AWS Lambda, Cloud Run functions, Azure Functions) run in a cloud region in a microVM or container, take minutes of wall time and gigabytes of memory, and bill memory multiplied by duration. **Isolates and Wasm at the edge** (Cloudflare Workers, Fastly Compute) run in hundreds of locations inside a language runtime, start in milliseconds or microseconds, cap memory near 128 MB, and bill CPU time or requests. **CDN functions** (CloudFront Functions and Lambda@Edge) run on a CDN's request path with tight limits and a per-invocation price. Platforms like Vercel and Netlify sell functions on top of one of these underlays ([PaaS & Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds)). This chapter tells how the model arrived, how a function actually runs and why cold starts happen, how isolates and Wasm work, what WASI and the component model add, and compares limits and prices across providers as of October 2026. The walls underneath are [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms); deploying functions is [Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys); data stores built for functions are [Serverless & Edge Databases](/books/hosting-and-cloud/serverless-and-edge-databases); and free function tiers used for cryptomining are [Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys#cryptomining).

## How the Providers Do It

Limits and list prices, as of October 2026. The `isolation` column uses the vocabulary from [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms#the-isolation-ladder); "not published" means the provider's pages opened for this chapter don't say.

| Product | `isolation` | Max memory | Max run time | What's metered | List price | Free allowance |
| --- | --- | --- | --- | --- | --- | --- |
| **AWS Lambda** | `microvm` (Firecracker) | 10,240 MB; one vCPU-equivalent at 1,769 MB | 900 seconds | Requests; GB-seconds rounded up to 1 ms; INIT billed since August 1, 2025 | $0.20 per million requests; $0.0000166667 per GB-second (x86, US East) | 1 million requests and 400,000 GB-seconds a month |
| **Lambda@Edge** | Not published | 128 MB (viewer events); 10,240 MB (origin events) | Up to 30 seconds | Requests; GB-seconds | $0.60 per million requests; $0.00005001 per GB-second | Not verified |
| **CloudFront Functions** | Not published | 2 MB; 10 KB of code | "Submillisecond" | Invocations | $0.10 per million | 2 million a month (Always Free) |
| **Cloudflare Workers** | `language_isolate` (V8) | 128 MB per isolate | CPU: 10 ms (Free), 30 seconds default and 5 minutes maximum (Paid); wall time unlimited for HTTP | Requests; CPU milliseconds; "no charge for duration" | $5 a month minimum, then $0.30 per million requests and $0.02 per million CPU-ms | 100,000 requests a day (Free); 10 million requests and 30 million CPU-ms a month (Paid) |
| **Fastly Compute** | `wasm_sandbox` (Wasmtime) | 128 MB heap per execution | 50 ms CPU and 2 minutes wall per execution (defaults) | Not on the pages opened | Not on the pages opened | Not on the pages opened |
| **Google Cloud Run functions** | `user_space_kernel` (first generation) or `microvm` (second) | 32 GiB per instance | 60 minutes per request | vCPU-seconds, GiB-seconds and requests | Rate card didn't render for this chapter | Not verified |
| **Azure Functions, Flex Consumption** | Not published | 4,096 MB (512, 2,048 or 4,096 MB instances) | Unbounded; HTTP responses within 230 seconds | Executions; GB-seconds while executing; always-ready instances | Rate card didn't render for this chapter | 250,000 executions and 100,000 GB-seconds a month |
| **Azure Functions, Consumption (legacy)** | Not published | 1.5 GB | 10 minutes | Executions; GB-seconds | Rate card didn't render for this chapter | 1 million executions and 400,000 GB-seconds a month |
| **Vercel Functions** | Not published; bundle limit "enforced by AWS" | 2 GB (Hobby), 4 GB (Pro) | 300 seconds (Hobby); 800 seconds (Pro, 1,800 in beta) | Active CPU hours; provisioned memory GB-hours; invocations | $0.128 per CPU-hour and $0.0106 per GB-hour (iad1); $0.60 per million invocations | 4 CPU-hours, 360 GB-hours, 1 million invocations (Hobby) |

Four patterns run through the table:

- **The meter follows the wall.** Products in microVMs and containers bill memory reserved multiplied by wall time, because the provider reserves that memory for the whole invocation. Products in isolates bill CPU time, because an isolate waiting on the network costs the provider almost nothing. Vercel splits the two (active CPU plus provisioned memory) and sits between.
- **Limits are where the products differ most.** Memory spans 2 MB to 32 GiB and run time from submillisecond to an hour. A provider's limits tell the customer which workloads it wants: CloudFront Functions wants header rewrites; Lambda wants anything that fits in 15 minutes.
- **Free allowances are large and per account.** Every regional product gives away hundreds of thousands of GB-seconds a month, which is acquisition for the provider and an attack surface for fraud.
- **The underlay shows through.** Vercel's function bundle limit is "enforced by AWS," and Netlify's Lambda compatibility mode inherits "AWS Lambda's environment variable size limit." A reseller's limits are its supplier's limits ([Who Resells Whom](/books/hosting-and-cloud/provider-landscape#who-resells-whom)).

## How It Got Here

### 2014 to 2016: functions as a product

AWS previewed Lambda on November 13, 2014: Node.js only, memory from 128 MB to 1 GB with CPU proportional to it, execution "up to 60 seconds," 25 concurrent invocations per account during the preview, and compute billed "in units of 100 milliseconds" plus a charge per request, with 1 million free requests a month. Underneath, functions from one customer shared a VM and were separated by containers ([Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms#2014-to-2018-containers-inside-a-vm-per-customer)). Microsoft previewed Azure Functions in March 2016 and made it generally available on November 15, 2016, with a monthly free grant of 400,000 GB-seconds and a million executions and billing per millisecond with a 100 ms minimum. Google's Cloud Functions became generally available at Next '18, announced August 13, 2018.

**What it solved:** code that runs on an event without a server to size, patch or pay for while idle. **What it cost:** a 100 ms minimum on every invocation, minute-scale limits, a programming model per provider, and cold starts.

### 2017 to 2019: isolates and Wasm at the edge

Cloudflare announced Workers on September 29, 2017, running JavaScript in V8 isolates instead of containers. Its 2018 explanation set out the economics: "Isolates start in 5 milliseconds," a basic Node Lambda used "35 MB of memory" against "around 3 MB" for an isolate sharing a runtime, and switching between OS processes can take "as much as 100 microseconds," a cost isolates in one process avoid. The price was languages: isolates can't run "arbitrary compiled code," only JavaScript and languages compiled to WebAssembly. Fastly announced the beta of Compute@Edge on November 6, 2019, powered by "Fastly's WebAssembly compiler and runtime," claiming 35.4 microseconds to start. Mozilla announced WASI, a system interface for WebAssembly outside the browser, on March 27, 2019. AWS added Provisioned Concurrency on December 3, 2019 so Lambda functions "execute with consistent start-up latency."

**What it solved:** code on the request path in hundreds of locations, starting fast enough to run per request. **What it cost:** a restricted language set, no native binaries, memory measured in megabytes, and a different API from every regional platform.

### 2020 to 2022: finer meters and faster starts

On December 1, 2020, AWS "reduced the billing granularity for Lambda function duration from 100ms down to 1ms" and raised memory to 10 GB with up to 6 vCPUs. CloudFront Functions arrived on May 3, 2021 at "$0.1 per million invocations" for lightweight JavaScript on the viewer side of the CDN. Lambda SnapStart launched for Java on November 28, 2022, promising Java functions that "start up to 10x faster, at no extra cost," by resuming from a snapshot of the initialized environment.

### 2024 to 2026: consolidation and the next interface

WASI 0.2 launched January 25, 2024, "officially based on the Wasm component model," with a CLI world and an HTTP proxy world. Google renamed Cloud Functions to Cloud Run functions on August 21, 2024, "We've unified the Cloud Functions infrastructure with Cloud Run." SnapStart reached Python and .NET on November 18, 2024 and container-image functions on September 2, 2026. AWS began billing the INIT phase for all Lambda configurations from August 1, 2025, ending the exception for managed runtimes packaged as ZIP files. WASI 0.3.0 was released June 11, 2026, moving asynchronous I/O into the component model itself. Deno Deploy Classic was shut down on July 20, 2026 in favor of a new Deno Deploy with "a full Deno 2.0 runtime." Azure plans to retire Linux hosting on its Consumption plan on September 30, 2028, steering new apps to Flex Consumption.

## How a Function Runs

### The execution environment

Lambda's lifecycle is the reference model. A request that finds no idle environment triggers **INIT**: Lambda creates an execution environment, starts extensions, bootstraps the runtime and runs the function's static code, with a 10-second limit. **INVOKE** runs the handler. After the handler returns, Lambda freezes the environment "and may keep it for an unspecified time"; a later request that lands on it is a warm start and skips INIT. **SHUTDOWN** ends it. Underneath, each environment is a Firecracker microVM in a slot used "for a single function, and a single concurrent invocation of that function," recycled within 12 hours.

Two things follow for the provider. First, a cold start is the INIT phase plus whatever it took to get a slot, and the provider controls only the second half; a function that loads a framework at startup is slow because of its own code. Second, idle environments are the provider's cost. The Firecracker paper's arithmetic is that idle slots should cost 40% of busy ones, since memory is about 40% of a server's capital cost and an idle slot holds memory but not CPU.

### Concurrency per environment

Products differ in how many requests one environment serves, and it changes what the customer pays for:

- **One request per environment** (Lambda functions): concurrency equals environments, each request pays for its own memory, and the account's default limit is 1,000 concurrent executions per Region, with each function able to add 1,000 environments every 10 seconds.
- **Many requests per instance** (Cloud Run, up to 1,000 concurrent requests per instance; Azure Flex Consumption with per-instance concurrency; Vercel's Fluid compute, where "each instance can handle multiple requests"): requests share an instance's memory, so I/O-bound work gets cheaper, and one request's crash or memory leak can affect its neighbors.
- **Many tenants per process** (Workers): "a single instance of the runtime can run hundreds or thousands of isolates," and the customer is billed only for its own CPU time.

### Cold starts and their remedies

| Remedy | How it works | Who pays | Examples |
| --- | --- | --- | --- |
| Warm pools | The provider keeps pre-booted environments ready | The provider | Lambda's MicroManager pool; Azure's prewarmed placeholders |
| Minimum or provisioned instances | The customer reserves initialized environments | The customer, for reserved time | Lambda Provisioned Concurrency; Azure always-ready instances |
| Snapshots | Initialize once at publish, resume new environments from a snapshot | The customer, for caching and restore (Python and .NET), free for Java | Lambda SnapStart |
| A lighter wall | Start an isolate or Wasm instance instead of a VM | Paid for in language restrictions | Workers, Fastly Compute |

SnapStart shows the trade in its documentation. Lambda "takes a Firecracker MicroVM snapshot of the memory and disk state of the initialized execution environment, encrypts the snapshot, and intelligently caches it," and resumes new environments from it, but because one snapshot seeds many environments, unique IDs, secrets and random seeds created during initialization aren't unique any more, and network connections opened then aren't guaranteed. SnapStart works only on published versions and not with provisioned concurrency or EFS. Caching is billed for at least 3 hours per active version and each restore is billed, for Python and .NET; for Java there's "no additional cost."

## Isolates, Wasm and CDN Functions

### V8 isolates

An isolate is a separate heap and execution context inside one V8 process. Cloudflare's documentation says an isolate "can start around a hundred times faster than a Node process on a container or virtual machine" and uses "an order of magnitude less memory" at startup, and that isolates can be "spun down and evicted" for resource pressure, limits or suspicious behavior, so code mustn't rely on global state. Because tenants share a process, the isolate alone isn't the wall. Workers' security model adds trust cordons (Free-plan tenants don't share processes with high-trust ones), a process sandbox using Linux namespaces and seccomp with no filesystem or network access, outbound traffic through a proxy that blocks internal addresses, a frozen `Date.now()` and no multithreading to frustrate timing attacks, moving suspicious or CPU-heavy Workers into their own process, and V8 patches deployed within 24 hours.

The limits follow from the model: 128 MB per isolate, a startup budget of 1 second, a CPU-time limit per invocation (10 ms on Free, configurable to 5 minutes on Paid) and no limit on wall time for HTTP requests. Billing CPU time rather than duration is the point: a Worker waiting on an upstream API isn't charged for the wait, because the isolate isn't holding a VM's worth of memory while it waits.

### Wasm per request

Fastly Compute runs request handlers in WebAssembly sandboxes on Wasmtime, compiled from Rust, JavaScript, Go or C++ with Fastly's SDKs. "In the default configuration, each request starts a new sandbox," so requests share no memory; an opt-in mode lets a sandbox serve several requests to skip repeated initialization, with the warning that requests then share in-memory state. Default limits are 1 MB of stack and 128 MB of heap per execution, 50 ms of CPU per request, 2 minutes of wall time and 32 backend requests, with a compiled package up to 100 MB. The start-time claims are Fastly's: 35.4 microseconds at the 2019 beta and "<40 microseconds" in the current datasheet, without an independent benchmark.

### CDN functions

AWS offers two function products on CloudFront, and the comparison is a clean statement of the trade between wall and capability:

| | CloudFront Functions | Lambda@Edge |
| --- | --- | --- |
| Language | JavaScript (ECMAScript 5.1 compliant) | Node.js and Python |
| Events | Viewer request and response | Viewer and origin, request and response |
| Scale | "Up to millions of requests per second" | "Up to 10,000 requests per second per Region" |
| Duration | Submillisecond | Up to 30 seconds |
| Memory | 2 MB | 128 MB (viewer) to 10,240 MB (origin) |
| Code size | 10 KB | 50 MB |
| Network, file system, request body | None | All three |
| Price | $0.10 per million invocations | $0.60 per million requests plus $0.00005001 per GB-second |

The first is for cache-key normalization, header changes, redirects and token checks on every request; the second is a Lambda function replicated near the CDN for work that needs a library, the network or the body. Caching itself and the CDN business are [Caching & Invalidation](/books/hosting-and-cloud/caching-and-invalidation) and [The Edge Business](/books/hosting-and-cloud/edge-business).

### WASI and the component model

WebAssembly gives a sandbox with no ambient access: a module can touch only memory it was given and functions it imports. WASI defines the imports for running outside a browser, and since WASI 0.2 (January 25, 2024) they are defined as component-model interfaces in WIT, grouped into worlds such as `wasi-cli` ("loosely analogous to POSIX") and `wasi-http`, "an HTTP proxy world, organized around requests and responses." WASI 0.3.0 (June 11, 2026) moved async into the component model with `async func`, `stream<T>` and `future<T>`, removed `wasi:io`, made HTTP handlers and clients async, and replaced the `proxy` world with `service` plus a new `middleware` world.

For a provider, the component model is the possibility of one deployable unit across edge platforms: a component targeting `wasi:http` could run on any runtime that hosts that world. As of October 2026 that's a direction rather than a fact, because platforms still ship their own SDKs and APIs, and 0.3's guest-language support is still arriving.

## The Meters Compared

The same request costs differently under each meter. Take one million requests that each use 10 ms of CPU but take 200 ms of wall time because they wait on a database, at list prices as of October 2026, ignoring free allowances and included usage:

| Platform and meter | Arithmetic | Cost per million requests |
| --- | --- | --- |
| AWS Lambda at 128 MB (GB-seconds plus requests) | 1,000,000 × 0.2 s × 0.125 GB = 25,000 GB-s × $0.0000166667 = $0.42, plus $0.20 | $0.62 |
| AWS Lambda at 1,024 MB | 200,000 GB-s × $0.0000166667 = $3.33, plus $0.20 | $3.53 |
| Cloudflare Workers Paid (CPU-ms plus requests) | 10,000,000 CPU-ms × $0.02 per million = $0.20, plus $0.30 | $0.50 |
| Vercel Pro, iad1 (active CPU only, before memory) | 10,000 CPU-seconds = 2.78 CPU-hours × $0.128 = $0.36, plus $0.60 in invocations | $0.96 plus provisioned memory, which depends on how many requests share an instance |

The wall-time meter charges the waiting; the CPU meter doesn't; the split meter charges memory for the wait but lets concurrent requests share it. That's why I/O-bound code (API glue, calls to model providers) moves toward CPU-metered or concurrency-sharing platforms, and CPU-bound code is priced similarly everywhere. INIT time is billed on Lambda since August 1, 2025 at the same duration rate, so a heavy initialization shows on the bill as well as in latency. These are list prices for one region; [Cost & FinOps](/docs/operations/cost-and-finops#free-tiers-and-their-cliffs) covers free tiers as a cost cliff.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Regional functions** (Lambda, Cloud Run functions, Azure Functions) | Event-driven code in a microVM or container in one region | Any language and native library; gigabytes of memory; deep integration with the cloud's events | Cold starts; GB-second billing charges waiting; per-cloud APIs | Proprietary; open-source runtimes and SDKs | Per request and GB-second | Event processing, APIs, glue code |
| **Edge isolates** (Workers) | Many tenants per V8 process in hundreds of locations | Millisecond starts; CPU-time billing; global by default | No native binaries; 128 MB per isolate | Proprietary service; runtime (workerd) Apache 2.0 | Per request and CPU-ms | Request-path logic, APIs near users |
| **Edge Wasm** (Fastly Compute) | A Wasm sandbox per request | Microsecond starts; no shared memory between requests | Languages with Wasm toolchains only; tight CPU defaults | Proprietary service; Wasmtime Apache 2.0 | By contract | CDN customers customizing delivery |
| **CDN functions** (CloudFront Functions) | Tiny JavaScript on the viewer path | Cheapest per invocation; millions of requests a second | No network, body or libraries; 10 KB of code | Proprietary | Per invocation | Rewrites, redirects, header and token checks |
| **Platform functions** (Vercel, Netlify) | A PaaS's functions on a hyperscaler underlay | Framework integration, preview deploys | Underlay limits; markup over the underlay | Proprietary | Platform meters | Frontend teams |
| **Serverless containers** (Cloud Run, Fargate) | A container image scaled by requests | Any image; longer runs; concurrency per instance | Slower cold starts than functions | Proprietary | Per vCPU and memory time | Services that outgrow function limits |

## My Default

My default for a provider building a function product is two products, not one. Regional functions in Firecracker microVMs, billed per request plus a split meter (active CPU plus memory held), with snapshots and a warm pool for cold starts; and an edge tier on isolates or Wasm for request-path code, billed on CPU time. The facts above support both halves. A microVM per slot is what lets arbitrary languages and binaries run safely (Lambda's own design), and the GB-second meter alone overcharges the I/O-bound work that dominates function traffic, which is why Cloudflare bills CPU and Vercel split its meter. Isolates and Wasm are the only walls that start fast enough to run per request at the edge, and they're safe to offer only with the language restrictions and the extra process layers Cloudflare documents.

As a customer, I'd put event glue and APIs on the regional functions of the cloud that holds the data, move I/O-heavy request handling to a CPU-metered edge runtime, and leave anything that runs longer than a few minutes or needs more than a few gigabytes to a serverless container.

What would change this: a provider without hardware of its own can't run Firecracker directly and would sell functions on gVisor or resell a hyperscaler's, inheriting its limits; and if WASI components become portable across platforms in practice, the edge tier stops being a lock-in decision and Wasm becomes the default unit for both tiers.

## How to Build It

The chapter adds the `functions` side table for resources of kind `function` (already in the core `resources` CHECK) to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), with the `isolation` vocabulary from [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms#how-to-build-it), and three meters.

```sql
CREATE TABLE functions (                 -- side table: kind = 'function'
  resource_id        UUID PRIMARY KEY REFERENCES resources (id),
  tier               TEXT NOT NULL CHECK (tier IN ('regional', 'edge', 'cdn')),
  isolation          TEXT NOT NULL CHECK (isolation IN ('bare_metal', 'hardware_vm',
                       'microvm', 'user_space_kernel', 'os_container', 'language_isolate',
                       'wasm_sandbox')),
  runtime            TEXT NOT NULL,      -- 'nodejs24', 'python3.13', 'wasi-http-0.2', 'js-es5'
  package_kind       TEXT NOT NULL CHECK (package_kind IN ('zip', 'container_image',
                       'wasm_component', 'script')),
  image_id           UUID REFERENCES resources (id),  -- kind = 'image', for container_image
  code_digest        TEXT NOT NULL,      -- what runs, as with container images
  memory_mb          INT NOT NULL CHECK (memory_mb > 0),
  timeout_ms         INT NOT NULL CHECK (timeout_ms > 0),       -- wall-clock limit
  cpu_limit_ms       INT,                -- per-invocation CPU limit, where the tier has one
  ephemeral_mb       INT NOT NULL DEFAULT 0,
  max_concurrency    INT,                -- reserved or capped concurrency; null: account pool
  per_instance_concurrency INT NOT NULL DEFAULT 1,  -- requests sharing one environment
  provisioned_instances INT NOT NULL DEFAULT 0,     -- kept initialized, billed while held
  snapshot_mode      TEXT NOT NULL DEFAULT 'none' CHECK (snapshot_mode IN ('none',
                       'on_publish')),
  triggers           TEXT[] NOT NULL,    -- 'http', 'queue', 'schedule', 'object_created'
  CHECK ((package_kind = 'container_image') = (image_id IS NOT NULL)),
  CHECK (tier <> 'edge' OR isolation IN ('language_isolate', 'wasm_sandbox', 'microvm')),
  CHECK (provisioned_instances = 0 OR snapshot_mode = 'none')  -- the two don't combine
);

-- resources.kind already includes 'function'.
-- usage_events.meter values added by this chapter:
--   'function.invocations'         one per request, success or failure
--   'function.cpu_ms'              CPU time consumed, per invocation
--   'function.duration_gb_seconds' memory held x wall time, rounded up to the
--                                  billing increment; INIT included where billed
-- dimensions: {"phase": "init" | "invoke", "region": ..., "arch": "x86_64" | "arm64",
--              "cold_start": true | false, "snapshot_restore": true | false}
```

Notes on the sketch:

- **Emit all three meters; rate only the ones the plan prices.** Every invocation reports invocations, CPU-ms and GB-seconds, and the SKU's `meter` (core `skus`) decides which are billed. A provider can then change its pricing model, or offer two, without changing the runtime, and the CPU-to-duration ratio per customer shows who would win or lose under a change.
- **INIT is a dimension, not a separate meter.** Tagging duration with `phase` lets the provider bill INIT, exempt it, or show it separately, and keeps the history straight across a change like AWS's on August 1, 2025.
- **Concurrency is configuration.** `per_instance_concurrency` above 1 means requests share memory; a provider billing provisioned memory per instance (the split meter) attributes it to the instance, not the request, and the meter's `resource_id` is the function with the instance in `dimensions`.
- **Snapshots are recorded on the VM.** Each environment restored from a snapshot is a microVM whose `snapshot_restored_from` ([Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms#how-to-build-it)) names it, which is what an investigation of duplicated tokens needs.
- **Edge functions need a wall that starts fast.** The tier check allows only isolates, Wasm or microVMs at the edge, so a configuration that would place a container or a full VM on the request path is rejected at write time.
- **Events:** `function.published`, `function.config_changed` (memory, timeout, concurrency), `function.throttled` and `function.disabled` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing, quotas and the abuse desk, which acts on functions by disabling triggers rather than deleting code.

## Auditing

- **What ran and how it was billed.** The code digest per version, and each invocation's meters with phase and cold-start flags, so a disputed bill can be traced to the INIT time or concurrency that produced it ([Audit Trails](/docs/architecture/audit-trails)).
- **Limit and price changes.** The limits and meters in force for each product over time, with notice dates, because a change like 1 ms billing or INIT billing changes every customer's invoice at once.
- **Throttling decisions.** When an account hit its concurrency limit or a risk quota, and who raised or lowered it, since throttles on free accounts are an anti-abuse control that customers also experience as an outage.
- **Snapshot use.** Which versions ran from snapshots, for the uniqueness failures that snapshotting can cause.

## What This Means for the System You Build

- **Match the meter to the wall:** GB-seconds where you reserve memory for the whole run, CPU time where waiting costs you little.
- **Measure every invocation three ways** and let the price book choose what to rate.
- **Treat cold starts as a product feature:** warm pools you pay for, provisioned instances the customer pays for, snapshots for heavy runtimes.
- **Publish limits and their history,** because they define what the product is for.
- **Keep edge code on fast walls:** isolates and Wasm for request-path work, with the language limits stated up front.
- **Expect your underlay's limits to become yours** if you resell another provider's functions.

## References

**Papers and standards**

- [Agache et al.: Firecracker: Lightweight Virtualization for Serverless Applications](https://www.usenix.org/conference/nsdi20/presentation/agache), NSDI 2020, Lambda slots, pools and the cost of idle slots
- [Bytecode Alliance: WASI 0.2 launched](https://bytecodealliance.org/articles/WASI-0.2), January 25, 2024, the component model and the CLI and HTTP worlds
- [WASI: WASI 0.3 release](https://wasi.dev/releases/wasi-p3), June 11, 2026, async in the component model and the interface changes

**Provider documentation**

- [AWS: Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html), memory, timeout, ephemeral storage, payload, package and concurrency limits
- [AWS: Lambda pricing](https://aws.amazon.com/lambda/pricing/), request and GB-second prices, the free tier, 1 ms rounding and SnapStart charges
- [AWS: Improving startup performance with Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html), snapshots, supported runtimes, uniqueness and pricing
- [AWS: Differences between CloudFront Functions and Lambda@Edge](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-choosing.html), the comparison table
- [AWS: CloudFront pay-as-you-go pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/), CloudFront Functions and Lambda@Edge prices and the Always Free allowance
- [Google Cloud: Cloud Run quotas and limits](https://docs.cloud.google.com/run/quotas), request timeout, memory, vCPU and concurrency
- [Google Cloud: Cloud Run execution environments](https://docs.cloud.google.com/run/docs/about-execution-environments), first and second generation
- [Microsoft Learn: Azure Functions hosting options](https://learn.microsoft.com/en-us/azure/azure-functions/functions-scale), plans, timeouts, memory, scale and the Linux Consumption retirement
- [Microsoft Azure: Azure Functions pricing](https://azure.microsoft.com/en-us/pricing/details/functions/), Consumption and Flex Consumption free grants
- [Cloudflare: Workers limits](https://developers.cloudflare.com/workers/platform/limits/), CPU time, duration, memory, size and startup limits
- [Cloudflare: Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), requests, CPU-ms, the $5 minimum and no charge for duration or egress
- [Cloudflare: How Workers works](https://developers.cloudflare.com/workers/reference/how-workers-works/), isolates, start time, memory and eviction
- [Cloudflare: Workers security model](https://developers.cloudflare.com/workers/reference/security-model/), cordons, the process sandbox, timing and Spectre defenses
- [Fastly: Getting started with Compute](https://www.fastly.com/documentation/guides/compute/getting-started-with-compute/), Wasmtime, WebAssembly and SDK languages
- [Fastly: Sandbox execution lifecycle](https://www.fastly.com/documentation/guides/compute/developer-guides/sandbox-lifecycle/), a new sandbox per request and reusable sandboxes
- [Fastly: Compute resource limits](https://docs.fastly.com/products/compute-resource-limits), heap, stack, CPU, wall-clock, backend and package limits
- [Fastly: Compute datasheet](https://www.fastly.com/resources/datasheets/fastly-compute), the "<40 microseconds" execution claim
- [Vercel: Functions limits](https://vercel.com/docs/functions/limitations), memory, duration, bundle size "enforced by AWS," and hidden AWS environment variables
- [Vercel: Fluid compute pricing](https://vercel.com/docs/fluid-compute/pricing), active CPU, provisioned memory and invocations with regional prices
- [Netlify: Lambda compatibility](https://docs.netlify.com/build/functions/lambda-compatibility/), the AWS Lambda environment variable limit in compatibility mode
- [Deno: Migration guide](https://docs.deno.com/deploy/migration_guide/), Deno Deploy Classic shut down July 20, 2026

**Announcements and release notes**

- [AWS News Blog: AWS Lambda](https://aws.amazon.com/blogs/aws/run-code-cloud/), preview on November 13, 2014, and its limits
- [Microsoft Azure: Announcing general availability of Azure Functions](https://azure.microsoft.com/en-us/blog/announcing-general-availability-of-azure-functions/), November 15, 2016
- [Cloudflare: Introducing Cloudflare Workers](https://blog.cloudflare.com/introducing-cloudflare-workers/), September 29, 2017
- [Google Cloud: Cloud Functions serverless platform is generally available](https://cloud.google.com/blog/products/gcp/cloud-functions-serverless-platform-is-generally-available), August 13, 2018
- [Cloudflare: Cloud computing without containers](https://blog.cloudflare.com/cloud-computing-without-containers/), November 9, 2018, isolate start time, memory and language limits
- [Mozilla Hacks: Standardizing WASI](https://hacks.mozilla.org/2019/03/standardizing-wasi-a-webassembly-system-interface/), March 27, 2019
- [Fastly: Launch of Compute@Edge](https://www.fastly.com/press/press-releases/fastly-expands-serverless-capabilities-launch-compute-edge), November 6, 2019
- [AWS: Lambda Provisioned Concurrency](https://aws.amazon.com/about-aws/whats-new/2019/12/aws-lambda-announces-provisioned-concurrency/), December 3, 2019
- [AWS: Lambda changes duration billing granularity to 1 ms](https://aws.amazon.com/about-aws/whats-new/2020/12/aws-lambda-changes-duration-billing-granularity-from-100ms-to-1ms/), December 1, 2020
- [AWS News Blog: Lambda functions with up to 10 GB of memory and 6 vCPUs](https://aws.amazon.com/blogs/aws/new-for-aws-lambda-functions-with-up-to-10-gb-of-memory-and-6-vcpus/), December 1, 2020
- [AWS: CloudFront Functions](https://aws.amazon.com/about-aws/whats-new/2021/05/cloudfront-functions/), May 3, 2021
- [AWS News Blog: Lambda SnapStart](https://aws.amazon.com/blogs/aws/new-accelerate-your-lambda-functions-with-lambda-snapstart/), November 28, 2022
- [Google Cloud: Cloud Functions is now Cloud Run functions](https://cloud.google.com/blog/products/serverless/google-cloud-functions-is-now-cloud-run-functions), August 21, 2024
- [AWS: SnapStart for Python and .NET](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-lambda-snapstart-python-net-functions/), November 18, 2024
- [AWS Compute Blog: Lambda standardizes billing for the INIT phase](https://aws.amazon.com/blogs/compute/aws-lambda-standardizes-billing-for-init-phase/), April 29, 2025, effective August 1, 2025, and the 10-second INIT limit
- [AWS: SnapStart for container image functions](https://aws.amazon.com/about-aws/whats-new/2026/07/aws-lambda-snapstart-container/), September 2, 2026
