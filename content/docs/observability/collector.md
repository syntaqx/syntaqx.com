+++
title = "Running the OpenTelemetry Collector"
nav_title = "The Collector"
description = "Deployment patterns, an annotated agent and gateway config, distributions and ocb, queues and retries, monitoring, securing, and managing a fleet with OpAMP."
category = "Observability"
order = 1233
tags = ["observability", "opentelemetry", "collector", "kubernetes", "operations"]
+++

The OpenTelemetry Collector is the process between your services and wherever telemetry is stored. It receives traces, metrics and logs, processes them (adds Kubernetes metadata, redacts, samples, batches) and exports them to one or more backends. Putting one in the path is what makes [instrumentation](/docs/observability/opentelemetry) portable in practice: services always send OTLP to a nearby Collector, and the choice of backend, the credentials, the sampling and the redaction live in the Collector's configuration instead of in every service.

This page is the operating manual: where Collectors run, a working configuration with every line explained, which build to run, how to keep it from losing data, how to watch it, how to secure it and how to manage many of them.

## The Pipeline Model

A Collector configuration declares components and then wires them into pipelines, one per signal ([configuration](https://opentelemetry.io/docs/collector/configuration/)):

| Component | Job |
| --------- | --- |
| **Receivers** | "Collect telemetry from one or more sources": OTLP from SDKs, files, Prometheus endpoints, the host |
| **Processors** | "Take the data collected by receivers and modify or transform it before sending it to the exporters" |
| **Exporters** | "Send data to one or more backends or destinations" |
| **Connectors** | "Join two pipelines, acting as both exporter and receiver": spans in, metrics out |
| **Extensions** | Capabilities outside the data path: health checks, authentication, storage |

"If a component is configured, but not defined within the `service` section, then it's not enabled." Processors run in the order the pipeline lists them, and that order is a design decision (below).

## Deployment Patterns

The [deployment docs](https://opentelemetry.io/docs/collector/deploy/) describe the patterns, each with its own tradeoffs:

| Pattern | Shape | When I use it |
| ------- | ----- | ------------- |
| No Collector | SDKs export straight to a backend | Local development and tests. OpenTelemetry lists the cost: it "requires code changes if collection, processing, or ingestion needs change" and couples code to the backend |
| Agent | A Collector "alongside the application or on the same host, such as a sidecar or DaemonSet" | Small systems: one hop, host metrics and files collected locally |
| Gateway | Services or agents send to a central, load-balanced Collector tier | When credentials, redaction and policy must be in one place |
| Agent and gateway | Agents on each host forward to a gateway tier | My default for anything in production on more than a couple of hosts |

The agent-to-gateway page gives the reasoning: "agent configurations stay small and focused, while central processors handle the heavier collection tasks"; "gateways can see the full picture, including complete traces, and can be independently scaled"; and "gateways become a stable egress point that can handle retries and manage credentials." The gateway docs are as clear about the cost: "one more thing to maintain and that can fail," "added latency in case of cascaded collectors" and "higher overall resource usage."

**DaemonSet or sidecar.** On Kubernetes the agent is usually a DaemonSet: one per node, reading node and pod metrics and container log files, receiving OTLP from every pod on the node. A sidecar (one Collector per pod) costs a Collector per replica and is for the exceptions: a workload that needs its own pipeline or credentials, or a platform like a serverless container service with no node to run a DaemonSet on. The [Operator](/docs/observability/opentelemetry#the-kubernetes-operator) manages either through its `OpenTelemetryCollector` resource and `mode` field.

## An Agent Configuration

A DaemonSet agent that receives OTLP from pods, collects host and kubelet metrics and container logs, adds Kubernetes metadata, and forwards everything to the gateway. Component stability is from each component's README as of October 2026:

```yaml
receivers:
  otlp:                         # stable for traces, metrics, logs
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:4317   # default is localhost:4317 since v0.110.0
      http:
        endpoint: ${env:MY_POD_IP}:4318
  hostmetrics:                  # beta: CPU, memory, disk, network of the node
    collection_interval: 30s
    scrapers:
      cpu:
      memory:
      filesystem:
      network:
  kubeletstats:                 # beta: node, pod, container and volume metrics
    auth_type: serviceAccount
    endpoint: https://${env:K8S_NODE_NAME}:10250
  filelog:                      # beta: tails container log files
    include: [/var/log/pods/*/*/*.log]
    operators:
      - type: container         # parses the container runtime's log format

processors:
  memory_limiter:               # always first
    check_interval: 1s
    limit_percentage: 80
    spike_limit_percentage: 15
  resourcedetection:            # host, OS and cloud attributes
    detectors: [env, system]
  k8sattributes: {}             # pod, namespace, deployment names on every signal
  batch: {}                     # after memory_limiter and any sampling

exporters:
  otlp/gateway:
    endpoint: otel-gateway.observability.svc:4317
    tls:
      ca_file: /etc/otel/ca.crt

extensions:
  health_check:                 # localhost:13133 by default
    endpoint: ${env:MY_POD_IP}:13133

service:
  extensions: [health_check]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, resourcedetection, k8sattributes, batch]
      exporters: [otlp/gateway]
    metrics:
      receivers: [otlp, hostmetrics, kubeletstats]
      processors: [memory_limiter, resourcedetection, k8sattributes, batch]
      exporters: [otlp/gateway]
    logs:
      receivers: [otlp, filelog]
      processors: [memory_limiter, resourcedetection, k8sattributes, batch]
      exporters: [otlp/gateway]
```

The lines that matter most:

- **`memory_limiter` first.** Its README says "the best practice is to add it as the first processor in a pipeline," and recommends a `check_interval` of 1 second. Above its soft limit it starts "refusing the data," which pushes back on the receiver (and on the SDK, which retries); above the hard limit it also forces garbage collection. Without it, a traffic spike becomes an out-of-memory kill and everything in memory is lost. Percentages track the container's memory limit; `limit_mib` and `spike_limit_mib` are the fixed alternative.
- **`batch` after it.** The batch processor "should be defined in the pipeline after the `memory_limiter` as well as any sampling processors," so it batches only what survives. Its defaults are a `send_batch_size` of 8,192 and a `timeout` of 200ms. Exporters can also batch inside their sending queue (`sending_queue` with a `batch` block); a 2026 proposal to deprecate the batch processor in favor of that was closed without merging, so both are supported and I use the processor until the project decides.
- **Endpoints bound explicitly.** "From Collector v0.110.0, the default host for all servers in Collector components is localhost," which is safe and also means a containerized Collector receives nothing from other pods until you bind it to the pod IP.
- **`k8sattributes` needs RBAC** to read pods and namespaces from the API server. Without it the processor runs and adds nothing.
- **Logs from files and OTLP.** Applications that log JSON to stdout are collected by `filelog`; applications using the OpenTelemetry log bridge send OTLP. Don't do both for the same lines ([Logs](/docs/observability/logs)).

For services that already expose Prometheus metrics, the `prometheus` receiver scrapes them. It is "meant to minimally be a drop-in replacement for Prometheus" scraping (not its alerting or recording rules), and "when running multiple replicas of the collector with the same config, it will scrape the targets multiple times," so scrape from one place or shard the targets.

## A Gateway Configuration

The gateway tier authenticates agents, redacts and filters, samples, and exports to the backend with a durable queue:

```yaml
extensions:
  health_check:
    endpoint: ${env:MY_POD_IP}:13133
  bearertokenauth:              # beta: agents present a token
    token: ${env:AGENT_TOKEN}
  file_storage:                 # disk for the persistent queue
    directory: /var/lib/otelcol/queue

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:4317
        tls:
          cert_file: /etc/otel/tls.crt
          key_file: /etc/otel/tls.key
        auth:
          authenticator: bearertokenauth

processors:
  memory_limiter:
    check_interval: 1s
    limit_percentage: 80
    spike_limit_percentage: 15
  filter/health:                # alpha: drop health-check spans
    error_mode: ignore
    trace_conditions:
      - span.attributes["http.route"] == "/healthz"
  transform/scrub:              # beta: OTTL statements
    error_mode: ignore
    trace_statements:
      - replace_pattern(span.attributes["url.query"], "token=[^&]*", "token=***")
  redaction:                    # beta for traces: drop values that look like card numbers
    allow_all_keys: true
    blocked_values:
      - "4[0-9]{12}(?:[0-9]{3})?"
  batch: {}

exporters:
  otlphttp/backend:
    endpoint: https://otlp.example-backend.com
    headers:
      authorization: ${env:BACKEND_API_KEY}
    sending_queue:
      storage: file_storage     # survive restarts
    retry_on_failure:
      max_elapsed_time: 300s

service:
  extensions: [health_check, bearertokenauth, file_storage]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, filter/health, transform/scrub, redaction, batch]
      exporters: [otlphttp/backend]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlphttp/backend]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, transform/scrub, batch]
      exporters: [otlphttp/backend]
```

### Redacting and Filtering

Four processors change or drop data, and they suit different jobs:

- **`filter`** drops whole spans, metrics, data points or log records that match an OTTL condition. The `trace_conditions`, `metric_conditions` and `log_conditions` keys are the current form; the older `traces.span` style is deprecated. Health checks, readiness probes and noisy debug logs from one library are the usual targets.
- **`transform`** "modifies telemetry based on configuration using the OpenTelemetry Transformation Language (OTTL)": set, rename, delete or pattern-replace any field. Its README warns about unsound transformations, identity conflicts and orphaned telemetry: "understand your data before using the Transform Processor." The older `attributes` processor (delete, hash, insert) "has been superseded by the transform processor."
- **`redaction`** "deletes span, log, and metric datapoint attributes that don't match a list of allowed attributes," and its `allowed_keys` list "is designed to fail closed." It can also mask values matching `blocked_values` patterns. An allow-list is the stronger control for regulated data; a block-list catches what slipped through.
- **`tail_sampling`** keeps or drops whole traces ([below](#tail-sampling-needs-two-layers)).

The Collector is the last place to catch sensitive data before it leaves your network, not the first: redaction belongs at the logger and in the instrumentation ([Logs](/docs/observability/logs#what-not-to-log), [Sensitive Data](/docs/payments/sensitive-data)), and the gateway's rules are the backstop that holds when a new attribute shows up.

### Tail Sampling Needs Two Layers

The tail sampling processor needs every span of a trace on one instance ("all spans for a given trace MUST be received by the same collector instance"), but a load-balanced gateway spreads them. The fix is a routing layer with the [load-balancing exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/loadbalancingexporter/README.md), which routes traces by trace ID by default and is beta for traces:

```yaml
exporters:
  loadbalancing:
    routing_key: traceID
    protocol:
      otlp:
        tls:
          insecure: false
    resolver:
      k8s:
        service: otel-sampler.observability
```

The routing layer is stateless and scales freely; the sampling layer (a StatefulSet behind a headless Service) holds traces for the `decision_wait` window. When sampler pods are added or removed, some traces are split during the change, so scale it deliberately. The policies themselves are in [Head or Tail Sampling](/docs/observability/tracing#head-or-tail-sampling).

## Distributions and Building Your Own

The project ships several [distributions](https://opentelemetry.io/docs/collector/distributions/): `otelcol` (core), `otelcol-contrib` (nearly every component), `otelcol-k8s`, `otelcol-otlp` and an eBPF profiler build. Contrib is convenient and large: hundreds of components you'll never use, each one attack surface and binary size. OpenTelemetry's security guidance recommends "limiting the set of components in your Collector configuration to only those you need," and the contrib README encourages users "to build their own custom distributions" with only "the components they need."

The [OpenTelemetry Collector Builder](https://opentelemetry.io/docs/collector/extend/ocb/) (`ocb`) does that from a manifest:

```yaml
dist:
  name: otelcol-acme
  description: Acme's OpenTelemetry Collector
  output_path: ./otelcol-acme
receivers:
  - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver v0.159.0
processors:
  - gomod: go.opentelemetry.io/collector/processor/memorylimiterprocessor v0.159.0
  - gomod: go.opentelemetry.io/collector/processor/batchprocessor v0.159.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/processor/k8sattributesprocessor v0.159.0
exporters:
  - gomod: go.opentelemetry.io/collector/exporter/otlpexporter v0.159.0
```

```bash tab="Shell"
./ocb --config builder-config.yaml
```

My default is a minimal build per role (one for agents, one for gateways), rebuilt in CI on each Collector release like any other dependency ([Dependencies & Upgrades](/docs/engineering/dependencies)), with every component version pinned to the same release.

Vendors ship their own distributions, each documented as a Collector with their components and support added:

| Distribution | As its vendor describes it |
| ------------ | -------------------------- |
| [AWS Distro for OpenTelemetry](https://aws-otel.github.io/docs/introduction) (ADOT) | "A secure, production-ready, AWS-supported distribution" |
| [Grafana Alloy](https://grafana.com/docs/alloy/latest/introduction/) | "An OpenTelemetry Collector distribution with built-in Prometheus pipelines" |
| [Splunk OpenTelemetry Collector](https://github.com/signalfx/splunk-otel-collector) | "A distribution of the OpenTelemetry Collector" |
| [Elastic EDOT Collector](https://www.elastic.co/docs/reference/edot-collector) | Built into Elastic Agent as "an open-source distribution of the OpenTelemetry Collector" |
| [Datadog DDOT Collector](https://docs.datadoghq.com/opentelemetry/setup/ddot_collector/) | A Collector embedded in the Datadog Agent |

A vendor distribution is the easy path to that vendor and a reasonable choice when you've committed to it. The neutrality you keep is in the services' instrumentation and the OTLP between them; the more vendor-specific components and configuration the Collector uses, the more of the migration cost moves into it ([Vendor Neutrality](/docs/observability/opentelemetry#vendor-neutrality-and-what-it-doesn-t-buy)).

## Not Losing Data

Every exporter has a sending queue and retries ([exporter helper](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md)), and their defaults are worth knowing:

| Setting | Default |
| ------- | ------- |
| `sending_queue.enabled` | `true` |
| `sending_queue.queue_size` | 1,000 |
| `sending_queue.block_on_overflow` | `false` |
| `retry_on_failure.initial_interval` | 5s, multiplied by 1.5 each retry |
| `retry_on_failure.max_interval` | 30s |
| `retry_on_failure.max_elapsed_time` | 300s |

The [resiliency guide](https://opentelemetry.io/docs/collector/resiliency/) spells out the consequences: the queue is in memory, so a restart loses it, and "once the queue is full, incoming data is dropped to prevent the Collector from running out of memory." Retries stop after five minutes. For a backend outage longer than that, or a gateway restart, the persistent queue writes to "a Write-Ahead Log (WAL) on disk before attempting to export it" through the `file_storage` extension. "Data loss can still occur if the disk fails or runs out of space," so size the volume for the outage you want to ride out.

Backpressure is the other half. When the memory limiter refuses data, receivers return an error and SDKs retry with backoff; when the SDK's own queue fills, it drops. A healthy pipeline is one where each stage either holds data or says no, and where every drop is counted. None of it may reach back into the application: what bounds the SDK, the sidecar and the Operator's webhook when a Collector is down is [Failing Open](/docs/observability/opentelemetry#failing-open).

## Monitoring the Collector

A Collector that silently drops data looks exactly like a quiet system. Its [internal telemetry](https://opentelemetry.io/docs/collector/internal-telemetry/) is a Prometheus endpoint on port 8888 (`/metrics`), configured under `service::telemetry`, at the `normal` level by default. The metrics I alert on:

| Metric | Means |
| ------ | ----- |
| `otelcol_receiver_refused_*` (spans, metric points, log records) | The memory limiter or a receiver is pushing back |
| `otelcol_exporter_send_failed_*` | The backend is rejecting or unreachable; retries are running |
| `otelcol_exporter_enqueue_failed_*` | The sending queue is full: this is data loss |
| `otelcol_exporter_queue_size` against `otelcol_exporter_queue_capacity` | How close the queue is to full |
| `otelcol_processor_incoming_items` against `otelcol_processor_outgoing_items` | What a processor (filter, sampler) is dropping, intended or not |

The docs note send failures "do not inherently imply data loss since there could be retries," and to check the logs for "Dropping data because sending_queue is full." Collector metrics go to a different place than the data they describe (or at least through a separate pipeline), so an outage of the main pipeline doesn't hide itself. The `pprof` (localhost:1777) and `zpages` (localhost:55679) extensions are for debugging a live Collector; they stay on localhost.

## Securing the Collector

A Collector holds backend credentials and sees every attribute your services emit. OpenTelemetry's [configuration best practices](https://opentelemetry.io/docs/security/config-best-practices/):

- **Bind narrowly.** "Try to always use specific interfaces, such as a pod's IP, or localhost instead of 0.0.0.0."
- **Encrypt and authenticate.** "Your OTel Collector configuration should include encryption and authentication." TLS on receivers and exporters; authenticator extensions (`bearertokenauth`, `basicauth`, `oidc`, all beta) on receivers that accept data from other hosts.
- **Keep secrets out of the file.** "Store sensitive information securely such as on an encrypted filesystem or secret store," and reference it with `${env:...}`.
- **Fewer components.** The minimal build above is a security control.

And from how it fails: an OTLP receiver must never be reachable from the internet. Browser and mobile telemetry go to a dedicated, authenticated, rate-limited intake that forwards to the Collector ([Frontend & Synthetic Monitoring](/docs/observability/frontend-and-synthetic)), not to the gateway's port. Debug extensions stay on localhost, and the Collector runs as a non-root user except where a receiver (host metrics, log files) needs a specific read permission, granted narrowly.

## Managing a Fleet with OpAMP

Hundreds of agents with hand-deployed configs drift. [OpAMP](https://opentelemetry.io/docs/specs/opamp/) (Open Agent Management Protocol) "is a network protocol for remote management of large fleets" of telemetry agents: they report status and health, receive configuration from a server and take package updates. The specification is Beta, with some features in Development. On the Collector side, the [OpAMP supervisor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/opampsupervisor) "runs a Collector instance using configuration provided from an OpAMP server" and the OpAMP extension reports to it; both are alpha in October 2026.

My default until those mature: Collector configuration in Git, rolled out by the same pipeline as everything else ([Infrastructure as Code](/docs/delivery/infrastructure-as-code)), with the Operator on Kubernetes. OpAMP, or a vendor's fleet manager built on it, earns its place when the fleet spans many environments that a single deploy pipeline can't reach, such as customer-hosted agents.

## Checklist

- Services send OTLP to a local agent; agents forward to a gateway tier; only gateways hold backend credentials.
- `memory_limiter` is first in every pipeline; `batch` comes after it and after sampling.
- Receivers bind to the pod IP or localhost, never `0.0.0.0` without a reason.
- Redaction and filtering run in the gateway as a backstop to redaction at the source.
- Tail sampling runs behind a trace-ID routing layer.
- Exporters to a remote backend use a persistent queue sized for the outage you accept.
- Every queue drops when full (`block_on_overflow: false`), so a Collector outage costs telemetry, never requests.
- Refused, failed and dropped counts from the Collector's own metrics are alerted on, through a separate path.
- A minimal custom build per role, pinned and upgraded in CI.
- TLS and authentication on every receiver that accepts traffic from another host; no OTLP port on the internet.

## References

**Specifications**

- [OpenTelemetry: OpAMP](https://opentelemetry.io/docs/specs/opamp/), the agent management protocol and its status
- [OpenTelemetry: OTLP](https://opentelemetry.io/docs/specs/otlp/), the protocol between SDKs, Collectors and backends

**In practice**

- [OpenTelemetry Collector: Configuration](https://opentelemetry.io/docs/collector/configuration/), receivers, processors, exporters, connectors, extensions and pipelines
- [OpenTelemetry Collector: Deployment](https://opentelemetry.io/docs/collector/deploy/), [agent](https://opentelemetry.io/docs/collector/deploy/agent/), [gateway](https://opentelemetry.io/docs/collector/deploy/gateway/), [no Collector](https://opentelemetry.io/docs/collector/deploy/other/no-collector/) and [agent to gateway](https://opentelemetry.io/docs/collector/deploy/other/agent-to-gateway/)
- [OpenTelemetry Collector: Memory limiter processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md), first in the pipeline, soft and hard limits
- [OpenTelemetry Collector: Batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), defaults and placement after the memory limiter
- [OpenTelemetry Collector: Exporter helper](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md), sending queue, retry and persistent storage defaults
- [OpenTelemetry Collector: Deprecate the batch processor (closed)](https://github.com/open-telemetry/opentelemetry-collector/pull/15046), the proposal to move batching into exporters
- [OpenTelemetry Collector: Resiliency](https://opentelemetry.io/docs/collector/resiliency/), queue overflow, retries and the write-ahead log
- [OpenTelemetry Collector: Internal telemetry](https://opentelemetry.io/docs/collector/internal-telemetry/), the Collector's own metrics and port 8888
- [OpenTelemetry: Configuration best practices](https://opentelemetry.io/docs/security/config-best-practices/), binding, encryption, authentication and minimal components
- [OpenTelemetry Collector: Distributions](https://opentelemetry.io/docs/collector/distributions/) and [Collector Builder](https://opentelemetry.io/docs/collector/extend/ocb/), the project's builds and building your own
- [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib), the contrib components and custom distributions
- [Collector Contrib: k8sattributes](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/k8sattributesprocessor/README.md), [transform](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md), [filter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/filterprocessor/README.md), [redaction](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/redactionprocessor/README.md) and [attributes](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/attributesprocessor/README.md) processors
- [Collector Contrib: prometheus](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/README.md), [filelog](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md), [hostmetrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/hostmetricsreceiver/README.md) and [kubeletstats](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kubeletstatsreceiver/README.md) receivers
- [Collector Contrib: Load-balancing exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/loadbalancingexporter/README.md), routing by trace ID
- [Collector Contrib: bearertokenauth](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/bearertokenauthextension/README.md) and [file_storage](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/storage/filestorage/README.md) extensions
- [OpenTelemetry Collector Contrib: OpAMP supervisor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/opampsupervisor), running a Collector from an OpAMP server
- [AWS Distro for OpenTelemetry](https://aws-otel.github.io/docs/introduction), [Grafana Alloy](https://grafana.com/docs/alloy/latest/introduction/), [Splunk OpenTelemetry Collector](https://github.com/signalfx/splunk-otel-collector), [Elastic EDOT Collector](https://www.elastic.co/docs/reference/edot-collector) and [Datadog DDOT Collector](https://docs.datadoghq.com/opentelemetry/setup/ddot_collector/), vendor distributions
