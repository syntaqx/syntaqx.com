+++
title = "Instrumenting with OpenTelemetry"
nav_title = "OpenTelemetry"
description = "API and SDK, zero-code agents per language and the Kubernetes Operator, resources, semantic conventions, OTLP, propagation, signal status and GenAI spans."
category = "Observability"
order = 1232
tags = ["observability", "opentelemetry", "instrumentation", "tracing", "kubernetes"]
+++

OpenTelemetry is the standard way to get traces, metrics and logs out of a service. It defines an API to record telemetry, SDKs that implement it in each language, instrumentation for the common libraries and frameworks, a wire protocol (OTLP), and a [Collector](/docs/observability/collector) to receive, process and forward it. It is "not an observability backend itself": "the backend (storage) and the frontend (visualization) of telemetry data are intentionally left to other tools," open source or commercial.

That split is why I default to it. Instrumentation is the expensive part to write and the hardest to change, and with OpenTelemetry it's written once against a vendor-neutral API; where the data goes is configuration. This page is the instrumentation side: how a service produces telemetry, with agents or with code, and what every service has to configure. What to put in spans is [Tracing & Sampling](/docs/observability/tracing), and what to put in log records is [Logs](/docs/observability/logs).

## API and SDK

The [specification overview](https://opentelemetry.io/docs/specs/otel/overview/) separates two things that are easy to conflate:

- **The API** "consist[s] of the cross-cutting public interfaces used for instrumentation": get a tracer, start a span, record a metric, emit a log record.
- **The SDK** "is the implementation of the API provided by the OpenTelemetry project": samplers, processors, exporters, resource detection.

The rule that follows: "Instrumentation authors MUST NOT directly reference any SDK package of any kind, only the API." A library depends on the API alone, and "when the SDK is not installed, the API calls should be no-ops which generate minimal overhead" ([library guidelines](https://opentelemetry.io/docs/specs/otel/library-guidelines/)). So a shared library can be instrumented without forcing a telemetry pipeline on every application that uses it, and the application decides once, at startup, whether and where telemetry goes.

My rules for a codebase: shared libraries import only the API; each deployable service configures the SDK in one place (its entry point, or an agent); nobody constructs exporters in business code.

## Zero-Code and Code-Based Instrumentation

There are two ways in, and OpenTelemetry says plainly that "you can use both solutions simultaneously":

- **Zero-code** instrumentation "adds the OpenTelemetry API and SDK capabilities to your application," typically "as an agent or agent-like installation," using "bytecode manipulation, monkey patching, or eBPF." It captures what crosses the edges of the application: "requests and responses, database calls, message queue calls."
- **Code-based** instrumentation uses the API directly and gives "deeper insight and rich telemetry from your application itself": the business decisions, the IDs, the steps that matter.

"Zero-code solutions are great for getting started, or when you can't modify the application." My default for a new service is the agent for the edges plus a handful of manual spans and attributes for what only the code knows.

### Zero-Code Agents by Language

Each language's agent is a different mechanism with the same result: the service starts with the SDK configured and the common libraries instrumented. These are the documented starts, configured through the standard environment variables below:

```bash tab="Java"
# Download opentelemetry-javaagent.jar from the opentelemetry-java-instrumentation releases
java -javaagent:path/to/opentelemetry-javaagent.jar \
  -Dotel.service.name=your-service-name \
  -jar myapp.jar
```

```bash tab=".NET"
# After running the release's verified otel-dotnet-auto-install.sh
chmod +x $HOME/.otel-dotnet-auto/instrument.sh
. $HOME/.otel-dotnet-auto/instrument.sh
OTEL_SERVICE_NAME=your-service-name dotnet run
```

```bash tab="Python"
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
OTEL_SERVICE_NAME=your-service-name opentelemetry-instrument python myapp.py
```

```bash tab="Node.js"
npm install --save @opentelemetry/api @opentelemetry/auto-instrumentations-node
OTEL_SERVICE_NAME=your-service-name \
  node --require @opentelemetry/auto-instrumentations-node/register app.js
```

```bash tab="PHP"
pecl install opentelemetry   # then extension=opentelemetry.so in php.ini (PHP 8.0+)
composer require open-telemetry/sdk open-telemetry/exporter-otlp \
  open-telemetry/opentelemetry-auto-slim open-telemetry/opentelemetry-auto-psr18
OTEL_PHP_AUTOLOAD_ENABLED=true OTEL_SERVICE_NAME=your-service-name php myapp.php
```

What each one needs to know:

- **Java.** The agent rewrites bytecode at class load. Settings are system properties (`-Dotel.service.name`) or the equivalent environment variables, and the agent docs show both. [Extensions](https://opentelemetry.io/docs/zero-code/java/agent/extensions/) "add capabilities to the agent without having to create a separate distribution," loaded with `-Dotel.javaagent.extensions=/path/to/my-extension.jar`: custom samplers, span processors that redact, instrumentation for an in-house library. Individual instrumentations are switched off with `otel.instrumentation.[name].enabled=false`, and `otel.instrumentation.common.default-enabled=false` flips the default so you enable only what you list.
- **.NET.** An install script puts the runtime in `$HOME/.otel-dotnet-auto`, and `instrument.sh` sets the environment the .NET runtime needs to load it; a PowerShell module does the same on Windows, and the `OpenTelemetry.AutoInstrumentation` NuGet package ships it inside the application instead. The [.NET docs](https://opentelemetry.io/docs/zero-code/dotnet/) verify the installer's release attestation before running it, which is the step worth copying.
- **Python.** `opentelemetry-bootstrap -a install` inspects the installed packages and installs the matching instrumentation libraries, and `opentelemetry-instrument` wraps the process.
- **Node.js.** `--require` loads the instrumentation before the application's own modules, which is what lets it patch them; `NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"` does the same without changing the start command. `OTEL_NODE_ENABLED_INSTRUMENTATIONS="http,express"` limits it to what you use, which matters for startup time.
- **PHP.** Auto-instrumentation needs the `opentelemetry` PHP extension, which provides the hooks, plus a Composer package per framework or library.
- **Go.** Go compiles to a static binary with no runtime to hook, so the [Go zero-code options](https://opentelemetry.io/docs/zero-code/go/) are different in kind: eBPF from outside the process (OBI, below), compile-time instrumentation, and an "Auto SDK" to "integrate manual spans with zero-code eBPF spans." The page describes the project as "currently work in progress." For Go, I instrument in code with the instrumentation libraries for `net/http`, gRPC and the database driver.

### The Kubernetes Operator

On Kubernetes, the [OpenTelemetry Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/automatic/) injects the agents for you. An `Instrumentation` resource says where telemetry goes and how to sample; an annotation on a workload says which language agent to inject:

```yaml tab="Kubernetes"
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: default
spec:
  exporter:
    endpoint: http://otel-collector:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "0.25"
---
# On the Deployment's pod template:
spec:
  template:
    metadata:
      annotations:
        instrumentation.opentelemetry.io/inject-java: "true"
```

The annotations are `inject-java`, `inject-python`, `inject-nodejs` and `inject-dotnet`, set on a pod template or on a namespace to cover everything in it. Go injection runs the eBPF instrumentation as a privileged sidecar, needs the `otel-go-auto-target-exe` annotation naming the binary, is behind a feature gate that is off by default, and doesn't support multi-container pods. The Operator's docs note that "in most cases, you will need to install cert-manager" for its admission webhook. Watch the ports in the docs: the Node.js agent is documented with gRPC on 4317 and the others with HTTP on 4318.

The same Operator manages Collectors through an `OpenTelemetryCollector` resource (`opentelemetry.io/v1beta1`) whose mode is a Deployment (the default), a DaemonSet, a StatefulSet or a sidecar, and a pod annotated `sidecar.opentelemetry.io/inject: "true"` gets a sidecar Collector. Choosing between those is [Running the OpenTelemetry Collector](/docs/observability/collector#deployment-patterns).

### eBPF Instrumentation (OBI)

[OpenTelemetry eBPF Instrumentation](https://opentelemetry.io/docs/zero-code/obi/) (OBI) watches processes from the kernel and produces spans and RED metrics (rate, errors, duration) without touching the application, in any language. Grafana Labs donated its Beyla project to OpenTelemetry in 2025 to start it. It understands protocols on the wire rather than code: HTTP and HTTP/2, gRPC, Kafka, NATS, MQTT, PostgreSQL, MySQL, MSSQL and Redis on both sides, and several more as a client only. It needs Linux 5.8 or later with BTF (or a RHEL-family 4.18 kernel with the backports), and either root or a set of capabilities including `CAP_BPF`, `CAP_PERFMON` and `CAP_SYS_PTRACE`.

As of October 2026 the project says "OBI is currently in Development" and is still on 0.x versions, with breaking changes possible between minor releases. I use it for what has no agent (a Go or Rust service nobody can change this quarter, a third-party binary) and to see the whole cluster's traffic on day one; its docs themselves send you to "language agents or manual instrumentation when you need custom spans." The privilege it needs is a security decision, made like any other privileged DaemonSet ([Kubernetes](/docs/operations/kubernetes)).

### When an Agent Isn't Enough

An agent sees calls, not meaning. It knows a `POST` took 2 seconds and the database was queried 40 times; it doesn't know which customer, which payment, which feature flag or why. It also can't:

- Name the business operation inside a generic handler (one RPC endpoint that dispatches twenty commands).
- Propagate context through anything it doesn't recognize: a custom queue, a job table, a homegrown RPC.
- Decide what's sensitive. Agents capture what their instrumentation captures; redaction is yours ([Logs](/docs/observability/logs#what-not-to-log), and the Collector's [redaction](/docs/observability/collector#redacting-and-filtering)).
- Avoid cost you didn't want. An agent instruments every library it finds, including the chatty ones; enable explicitly in production.

### Mixing Agents and Manual Spans

The agent registers the global SDK, so manual code uses the API and its spans join the agent's trace with no extra setup. The two operations I use most are enriching the span the agent already created and wrapping a business step in a span of its own:

```java tab="Java"
// The agent's server span is current inside the handler
Span.current().setAttribute("app.payment.id", paymentId);

// opentelemetry-instrumentation-annotations: a span per call
@WithSpan
public Decision chooseProcessor(@SpanAttribute("app.payment.id") String paymentId) { ... }
```

```python tab="Python"
from opentelemetry import trace

tracer = trace.get_tracer("payments")

trace.get_current_span().set_attribute("app.payment.id", payment_id)

with tracer.start_as_current_span("choose_processor") as span:
    span.set_attribute("app.processor", processor)
```

```ts tab="Node.js"
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("payments", "1.4.0");

tracer.startActiveSpan("choose_processor", (span) => {
  span.setAttribute("app.payment.id", paymentId);
  // ...
  span.end();
});
```

The Java agent's [API page](https://opentelemetry.io/docs/zero-code/java/agent/api/) recommends the `@WithSpan` annotation for most cases over hand-built spans. Whatever the language, a manual span must end on every path, including exceptions; the context-manager and callback forms do that for you.

## Resources Say Who Sent It

Every span, metric point and log record carries a **resource**: attributes describing the entity that produced it. They are what let you filter all three signals to one service, one version and one environment, and they're the most important configuration a service has. From the [service conventions](https://opentelemetry.io/docs/specs/semconv/resource/service/) and the [deployment attribute registry](https://opentelemetry.io/docs/specs/semconv/registry/attributes/deployment/):

| Attribute | Status | Value |
| --------- | ------ | ----- |
| `service.name` | Stable, required | The logical service: `payments-api` |
| `service.version` | Stable | The build: a version or commit SHA |
| `service.namespace` | Stable | A group of services owned together: `payments` |
| `service.instance.id` | Stable | This process or pod, unique |
| `deployment.environment.name` | Stable | `production`, `staging`; it replaced `deployment.environment`, now deprecated |

Without `service.name`, SDKs "MUST fallback to `unknown_service:` concatenated with the process executable name," which is how dashboards fill up with `unknown_service:java`. Set it explicitly, everywhere. Resource detectors add the host, container, cloud and Kubernetes attributes; in a cluster, the Collector's `k8sattributes` processor adds pod, namespace and workload names ([Running the OpenTelemetry Collector](/docs/observability/collector)).

## Configuring with Environment Variables

The SDKs and agents read the same [environment variables](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/), so one deployment template configures a service in any language:

```bash tab="Shell"
OTEL_SERVICE_NAME=payments-api
OTEL_RESOURCE_ATTRIBUTES=service.version=2026.10.28,deployment.environment.name=production
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.25
```

- `OTEL_SERVICE_NAME` "takes precedence" over a `service.name` in `OTEL_RESOURCE_ATTRIBUTES`.
- `OTEL_EXPORTER_OTLP_ENDPOINT` defaults to `http://localhost:4318` for HTTP and `http://localhost:4317` for gRPC, and the [exporter spec](https://opentelemetry.io/docs/specs/otel/protocol/exporter/) says the default protocol "SHOULD be `http/protobuf`" unless an SDK has strong reasons such as backward compatibility to keep another, so set the protocol explicitly. With this general variable, the SDK appends `/v1/traces`, `/v1/metrics` and `/v1/logs` itself; the per-signal variables take the full URL.
- `OTEL_TRACES_SAMPLER` defaults to `parentbased_always_on`; `OTEL_TRACES_SAMPLER_ARG` is the ratio for the ratio samplers ([Head or Tail Sampling](/docs/observability/tracing#head-or-tail-sampling)).
- `OTEL_EXPORTER_OTLP_HEADERS` (`key1=value1,key2=value2`) carries a backend's API key when exporting directly. It is a secret; it comes from the secret store, never from a committed file ([Environments & Configuration](/docs/operations/environments)).
- `OTEL_PROPAGATORS` defaults to `tracecontext,baggage`.

### Declarative Configuration

Environment variables run out of expressiveness quickly: you can't describe two exporters, a redacting processor or a per-route sampler in them. The [declarative configuration](https://opentelemetry.io/docs/languages/sdk-configuration/declarative-configuration/) is a YAML file, pointed to by `OTEL_CONFIG_FILE`, that describes the whole SDK:

```yaml
file_format: "1.2"
resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
propagator:
  composite:
    - tracecontext:
    - baggage:
tracer_provider:
  sampler:
    parent_based:
      root:
        always_on:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/traces
```

Its [data model](https://opentelemetry.io/docs/specs/otel/configuration/data-model/) is Stable, and the docs say "the declarative configuration schema is stable," with anything still experimental carrying a `/development` suffix; but "support for declarative configuration in various implementations is still experimental," and Java is the one SDK the page lists. When the file is set, the SDK ignores the other `OTEL_*` variables except those substituted into the file with `${...}`. My default as of October 2026: environment variables everywhere, and the file only where an SDK supports it and the variables can't express what I need.

## Semantic Conventions

[Semantic conventions](https://opentelemetry.io/docs/specs/semconv/) are the agreed names: `http.request.method`, `http.route`, `db.system.name`, `messaging.operation.type`. They're what let one dashboard, one alert or one vendor feature work across services written by different teams in different languages. Use them before inventing names, and put your own attributes in your own namespace (`app.` or a company prefix).

Each area has a stability status, and it matters because unstable names change:

| Area | Status |
| ---- | ------ |
| HTTP spans | Stable |
| Database spans | Stable, except where marked |
| RPC | Release Candidate |
| Messaging | Development |
| GenAI | Development, in its own repository (below) |

When an area stabilizes, instrumentations move with an opt-in: `OTEL_SEMCONV_STABILITY_OPT_IN` takes values such as `http` ("emit the new, stable HTTP and networking conventions") or `http/dup` ("emit both the old and the stable"), and the same pattern for `database` and `messaging`. The `/dup` mode is the migration path: emit both, move dashboards and alerts to the new names, then switch to the stable set. Nothing breaks silently if you treat a convention upgrade like a schema migration ([Zero-Downtime Migrations](/docs/database/zero-downtime-migrations) is the same expand-and-contract idea).

## OTLP

[OTLP](https://opentelemetry.io/docs/specs/otlp/) is the protocol between SDKs, Collectors and backends. It is "Stable for the trace, metric and log signals" and "Development for the profiles signal," over gRPC or HTTP, where "OTLP/HTTP uses Protobuf payloads encoded either in binary format or in JSON format." The default ports are 4317 for gRPC and 4318 for HTTP, and the HTTP paths are `/v1/traces`, `/v1/metrics` and `/v1/logs`. Most backends now accept OTLP directly, which is what makes switching them a configuration change. I use HTTP/protobuf unless there's a reason not to: it passes through every proxy and load balancer that understands HTTP.

## Vendor Neutrality, and What It Doesn't Buy

OpenTelemetry is "vendor- and tool-agnostic," and the instrumentation you write against it is portable. It doesn't make everything portable:

- **Dashboards, alerts and queries** are written in each backend's own language. Moving backends means rewriting them, and they're often most of the work.
- **Vendor features** built on top (automatic service maps, AI-assisted root cause, profiling views) are each vendor's own.
- **Vendor distributions** of agents and Collectors add components and defaults; using their extras ties you to them the same way a proprietary agent would ([distributions](/docs/observability/collector#distributions-and-building-your-own)).
- **Cost** is still metered by each vendor in its own units: hosts, gigabytes, spans, active series. The vendor side, and how each one meters, is the Hosting & Cloud book's [Observability Platforms](/books/hosting-and-cloud/observability-platforms).

What it does buy is the expensive part: the instrumentation in every service, and the option to send the same data to two backends during a migration from a Collector.

## Context Propagation

Propagation is how one service's span becomes the next service's parent. The default propagators are [W3C Trace Context](https://www.w3.org/TR/trace-context/) and [W3C Baggage](https://www.w3.org/TR/baggage/).

**Trace Context** has been a W3C Recommendation since 23 November 2021. Its `traceparent` header is `version-traceid-parentid-flags`, with a 16-byte trace ID and an 8-byte parent ID in hex:

```http
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
tracestate: ot=th:c
```

The last field's low bit says whether the caller sampled the trace, which is how `ParentBased` samplers agree. `tracestate` carries vendor-specific values, at most 32 list members; OpenTelemetry's own entry (`ot=`) carries the sampling threshold.

**Baggage** carries application key-value pairs alongside the trace: a tenant ID, a feature flag, a synthetic-traffic marker. The [specification](https://www.w3.org/TR/baggage/) is a Candidate Recommendation (snapshot of 30 May 2024), with minimum limits of 64 list members and 8,192 bytes. It comes with real risks:

- **It leaves your system.** The spec warns that "the baggage header can contain user-identifiable data" and "keys and values can be propagated to other systems"; OpenTelemetry's [baggage docs](https://opentelemetry.io/docs/concepts/signals/baggage/) say "sensitive Baggage items can be shared with unintended resources, like third-party APIs." Every instrumented HTTP client sends it to every host it calls.
- **It isn't on your spans.** Baggage is "unassociated with attributes on spans, metrics, or logs without explicitly adding them," so putting a value in baggage doesn't make it searchable.
- **It's caller-controlled input.** A request from outside can arrive with any baggage it likes.

My rules: no personal data, secrets or authorization decisions in baggage, ever; strip inbound `baggage` (and decide deliberately whether to trust inbound `traceparent`) at the edge from the internet; don't propagate either to third parties; and copy the few values worth searching onto spans explicitly.

## Signal Status in October 2026

The [specification status](https://opentelemetry.io/docs/specs/status/) and the [per-language status](https://opentelemetry.io/status/) pages, as read on 28 October 2026:

| Signal | Specification | Languages |
| ------ | ------------- | --------- |
| Traces | API, SDK and protocol stable | Stable in most languages; Rust beta, Kotlin in development |
| Metrics | API and protocol stable, SDK mixed | Stable in C++, .NET, Go, Java, JavaScript, PHP, Python and Rust; in development elsewhere |
| Logs | Bridge API, SDK and protocol stable | Stable in C++, .NET, Java, PHP and Rust; Go a release candidate; JavaScript, Python, Ruby and others in development |
| Profiles | Protocol in development | Java only, in development |

Profiles entered public alpha in 2026, and OpenTelemetry's announcement says "the signal should not be used for critical production workloads" ([Errors & Profiling](/docs/observability/errors-and-profiling)). The practical reading: traces are safe everywhere, metrics nearly everywhere, and logs depend on the language, which is one more reason to keep your existing logging library and add the OpenTelemetry bridge ([Logs](/docs/observability/logs#the-opentelemetry-logs-model-and-bridges)) rather than rewrite logging around a development-status API.

## GenAI Calls

LLM calls are outbound calls with unusual cost and latency, and they deserve the same instrumentation as a payment processor call. OpenTelemetry's GenAI conventions cover them, but in October 2026 they are in flux: they "have moved to the OpenTelemetry GenAI semantic conventions repository" ([semantic-conventions-genai](https://github.com/open-telemetry/semantic-conventions-genai)), and the client inference spans are "Development."

The attributes that matter, as that repository defines them:

| Attribute | What it records |
| --------- | --------------- |
| `gen_ai.operation.name` | `chat`, `embeddings`, and so on |
| `gen_ai.provider.name` | The provider; it replaced `gen_ai.system` |
| `gen_ai.request.model` / `gen_ai.response.model` | The model asked for, and the model that answered |
| `gen_ai.usage.input_tokens` / `gen_ai.usage.output_tokens` | Tokens consumed, which is the cost |

Span names "SHOULD be `{gen_ai.operation.name} {gen_ai.request.model}`," and the conventions define duration and token-usage metrics beside the spans. The metric names changed during the move to the new repository and the repository has no tagged release yet, so I pin the instrumentation version and treat the names as unstable.<!-- source-gap: otel-genai-token-metric-rename | status | GenAI token usage metric renamed from gen_ai.client.token.usage to gen_ai.client.inference.* counters and histograms | closes with: a release or changelog of semantic-conventions-genai that records the rename | checked: 2026-10-28 --> Latency of the full response and time to first token both matter for streaming responses; record both.

**Prompts and completions are opt-in.** The conventions say instrumentations "SHOULD NOT capture them by default, but SHOULD provide an option for users to opt in," because message content "is likely to contain sensitive information including user/PII data," and they recommend storing content externally with a reference on the span. My default is off, with token counts, model and outcome always on; content capture is a reviewed decision with its own retention, the same as any other personal data ([AI & LLM Security](/docs/security/ai-security), [AI Agents in the Product](/docs/architecture/ai-agents)).

## Checklist

- Libraries depend on the API only; each service configures the SDK in one place.
- Agents cover the edges; manual spans and attributes cover business decisions.
- Production agents enable only the instrumentations the service uses.
- `service.name`, `service.version` and `deployment.environment.name` are set on every service.
- Configuration comes from the standard `OTEL_*` variables, with exporter headers from the secret store.
- Semantic conventions before custom names; custom names in your own namespace; stability opt-ins migrated deliberately.
- Services export OTLP to a local Collector, not straight to a vendor.
- Baggage carries no personal data or secrets, and is stripped at the edge and never sent to third parties.
- GenAI spans record model, provider and tokens; prompt and completion capture is off unless reviewed.

## References

**Specifications**

- [OpenTelemetry: Specification overview](https://opentelemetry.io/docs/specs/otel/overview/), API and SDK and the rule that instrumentation depends on the API only
- [OpenTelemetry: Library guidelines](https://opentelemetry.io/docs/specs/otel/library-guidelines/), no-op API without an SDK
- [OpenTelemetry: SDK environment variables](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/), `OTEL_SERVICE_NAME`, sampler and propagator defaults
- [OpenTelemetry: OTLP exporter configuration](https://opentelemetry.io/docs/specs/otel/protocol/exporter/), default endpoints, protocols and per-signal paths
- [OpenTelemetry: Configuration data model](https://opentelemetry.io/docs/specs/otel/configuration/data-model/), the declarative configuration file and `OTEL_CONFIG_FILE`
- [OpenTelemetry: OTLP](https://opentelemetry.io/docs/specs/otlp/), transports, ports and per-signal status
- [OpenTelemetry: Service resource conventions](https://opentelemetry.io/docs/specs/semconv/resource/service/), `service.*` attributes and the `unknown_service` fallback
- [OpenTelemetry: Deployment attributes](https://opentelemetry.io/docs/specs/semconv/registry/attributes/deployment/), `deployment.environment.name` replacing `deployment.environment`
- [OpenTelemetry: Semantic conventions](https://opentelemetry.io/docs/specs/semconv/), per-area status and `OTEL_SEMCONV_STABILITY_OPT_IN`
- [OpenTelemetry: GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai), spans, attributes, metrics and content capture
- [OpenTelemetry: Specification status](https://opentelemetry.io/docs/specs/status/), API, SDK and protocol status per signal
- [W3C: Trace Context](https://www.w3.org/TR/trace-context/), `traceparent` and `tracestate`
- [W3C: Baggage](https://www.w3.org/TR/baggage/), limits and privacy considerations

**In practice**

- [OpenTelemetry: What is OpenTelemetry?](https://opentelemetry.io/docs/what-is-opentelemetry/), not a backend, vendor- and tool-agnostic
- [OpenTelemetry: Instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/) and [zero-code instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/zero-code/), the two approaches and using both
- [OpenTelemetry: Java agent](https://opentelemetry.io/docs/zero-code/java/agent/getting-started/), [extensions](https://opentelemetry.io/docs/zero-code/java/agent/extensions/), [disabling instrumentation](https://opentelemetry.io/docs/zero-code/java/agent/disable/) and [using the API with the agent](https://opentelemetry.io/docs/zero-code/java/agent/api/)
- [OpenTelemetry: .NET zero-code](https://opentelemetry.io/docs/zero-code/dotnet/), [Python zero-code](https://opentelemetry.io/docs/zero-code/python/), [JavaScript zero-code](https://opentelemetry.io/docs/zero-code/js/), [PHP zero-code](https://opentelemetry.io/docs/zero-code/php/auto/) and [Go zero-code](https://opentelemetry.io/docs/zero-code/go/)
- [OpenTelemetry: Python instrumentation](https://opentelemetry.io/docs/languages/python/instrumentation/) and [JavaScript instrumentation](https://opentelemetry.io/docs/languages/js/instrumentation/), manual spans
- [OpenTelemetry: Declarative configuration](https://opentelemetry.io/docs/languages/sdk-configuration/declarative-configuration/), the getting-started file and implementation status
- [OpenTelemetry Operator: Auto-instrumentation](https://opentelemetry.io/docs/platforms/kubernetes/operator/automatic/), the `Instrumentation` resource and inject annotations
- [OpenTelemetry Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/), the `OpenTelemetryCollector` resource
- [OpenTelemetry: eBPF Instrumentation (OBI)](https://opentelemetry.io/docs/zero-code/obi/), protocols, kernel requirements and [capabilities](https://opentelemetry.io/docs/zero-code/obi/security/)
- [OpenTelemetry eBPF Instrumentation repository](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation), development status
- [Grafana: Beyla 2.5 and OpenTelemetry eBPF Instrumentation](https://grafana.com/blog/2025/08/04/building-on-the-foundation-of-opentelemetry-ebpf-instrumentation-what-s-new-in-grafana-beyla-2-5/), the donation of Beyla to OpenTelemetry
- [OpenTelemetry: Baggage](https://opentelemetry.io/docs/concepts/signals/baggage/), the risk of sharing baggage with third parties
- [OpenTelemetry: Profiles enter public alpha](https://opentelemetry.io/blog/2026/profiles-alpha/), not for critical production workloads
- [OpenTelemetry: Language status](https://opentelemetry.io/status/), per-language signal status
