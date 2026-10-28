+++
title = "Errors & Profiling"
description = "Error tracking with grouping, releases, symbols and PII scrubbing, and continuous profiling from pprof to eBPF and OpenTelemetry's profiles signal."
category = "Observability"
order = 1237
tags = ["observability", "errors", "crash-reporting", "profiling", "ebpf", "opentelemetry"]
+++

Two signals sit beside metrics, traces and logs, and both answer questions the others answer badly. **Error tracking** answers "what broke, how often, since which release, for how many users?" without anyone searching logs. **Continuous profiling** answers "which lines of code are spending the CPU and the memory?" in production, where the real load is, without anyone reproducing it on a laptop.

Both are older than the [OpenTelemetry](/docs/observability/opentelemetry) project and mostly live in dedicated tools today. Profiling is now becoming an OpenTelemetry signal of its own; error tracking is still the vendors' SDKs. The vendor landscape is in [Observability Platforms](/books/hosting-and-cloud/observability-platforms); this page is about using them well.

## Error Tracking

An error tracker receives an exception with its stack trace and context, and folds it into an **issue**: one row per distinct bug, with a count, the first and last time it was seen, the releases it appeared in and the users it hit. The value is the folding. A thousand identical `NullPointerException`s are one problem with a count, not a thousand log lines.

### Grouping and Fingerprints

Everything depends on grouping the right events together. Sentry's model is representative: "A fingerprint is a way to uniquely identify an event, and all events have one," and "Events with the same fingerprint are grouped together into an issue." By default the fingerprint comes from the stack trace, and "Sentry only groups by stack trace frames that the SDK reports and associates with your application," falling back to the exception's type and value, then to the message. BugSnag groups by "the same error class, file and line number of the top in-project stack frame."

Default grouping fails in two directions, and both need fixing:

- **Too many issues for one bug.** A message that embeds an ID (`order 4821 not found`) or a stack that runs through generated code splits one problem into thousands. Fix the message first ([Logs](/docs/observability/logs) has the same rule: constant messages, data in fields), then override the fingerprint.
- **One issue for many bugs.** Every failure behind a shared HTTP client helper lands in one issue named after the helper. Mark helper frames as not part of the application (Sentry's stack trace rules, BugSnag's custom grouping) so the caller decides the group.

Sentry fingerprints can be set in the SDK or by server-side rules, such as `error.type:DatabaseUnavailable -> system-down`, where the assigned fingerprint "overrides the default grouping entirely." I use server-side rules for infrastructure failures (every "database unavailable" is one incident, not fifty issues) and leave application bugs to the default.

### Releases and Regressions

Tag every event with the release (the build's version or commit) and the environment. That turns the tracker into a release-quality tool:

- **New in this release** is the first thing to check after a deploy, beside the [canary](/docs/delivery/deployment-strategies#canary) metrics.
- **Regressions are automatic.** In Sentry, a resolved issue that comes back "in a newer release than the one you resolved it in" moves to `Regressed`. Resolving "in the next release" means the fix isn't judged until the fix ships; a plain resolve "treats any later event as a regression," which is noisy when old versions are still running.
- **Mobile and desktop releases live for months,** so a crash rate per release (crash-free sessions or users) matters more than a global count. An old build's crash is fixed by an upgrade prompt, not a deploy.

```go tab="Go"
err := sentry.Init(sentry.ClientOptions{
    Dsn:         os.Getenv("SENTRY_DSN"),
    Release:     os.Getenv("GIT_SHA"),
    Environment: os.Getenv("DEPLOY_ENV"),
    BeforeSend:  scrub, // drop or redact before it leaves the process
})
```

```rust tab="Rust"
// Hold the guard for the life of the process: dropping it flushes and stops sending.
let _guard = sentry::init(
    sentry::ClientOptions::new()
        .dsn(&env::var("SENTRY_DSN")?)
        .release(env::var("GIT_SHA")?)
        .environment(env::var("DEPLOY_ENV")?)
        .before_send(scrub), // drop or redact before it leaves the process
);
```

```python tab="Python"
import sentry_sdk

sentry_sdk.init(
    dsn=os.environ["SENTRY_DSN"],
    release=os.environ["GIT_SHA"],
    environment=os.environ["DEPLOY_ENV"],
    before_send=scrub,  # drop or redact before it leaves the process
)
```

```ts tab="Node.js"
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.GIT_SHA,
  environment: process.env.DEPLOY_ENV,
  beforeSend: scrub, // drop or redact before it leaves the process
});
```

### Readable Stack Traces: Source Maps and Symbols

Production code isn't the code you wrote. JavaScript is bundled and minified, Android code is shrunk and obfuscated by R8 ("`com.example.MyActivity` could become `a.b.a`"), and native iOS crashes arrive as bare addresses. Apple's documentation is blunt: "an unsymbolicated crash report is rarely useful." Every platform needs its mapping file uploaded for **each build**:

| Platform | Artifact | Uploaded by |
| --- | --- | --- |
| Browser JavaScript | Source maps, matched by debug IDs Sentry injects into the build | Bundler plugin (webpack, Vite, Rollup, esbuild) or `sentry-cli` |
| iOS and macOS | dSYM files | Build phase script, `sentry-cli debug-files upload`, or App Store Connect |
| Android | R8/ProGuard `mapping.txt` | Gradle plugin (Sentry, Crashlytics), or Play Console per version |
| Native (NDK, C++) | Debug symbols | Same tools, per architecture |

- **Upload from CI, in the same job that builds the release,** so the symbols and the binary can never drift. Android's docs warn the mapping file "is overwritten every time you build your project, so you must save a copy each time you publish a new release"; Google Play asks for a file "for each new version of your app."
- **Don't serve source maps publicly** unless you mean to publish your source. Upload them to the tracker and leave them out of the deployed assets.
- **Alert on symbolication failures.** A release whose crashes all show as addresses is a broken pipeline, discovered at the worst moment otherwise.

### PII and Scrubbing

Error events carry whatever was in scope: request bodies, headers, local variables, the user. That makes the tracker a store of personal data unless it's designed not to be ([Sensitive Data](/docs/payments/sensitive-data), [Consent & Privacy in Telemetry](/docs/telemetry/consent-and-privacy)).

- **Scrub in the process first.** A `before_send` hook (or `beforeSend`) "can return a modified event object or `null`," so card numbers, tokens and free-text fields never leave the machine.
- **Keep the SDK's PII collection off** unless a specific field is needed. Sentry's flag for this is moving from `sendDefaultPii` to a `data_collection` option whose defaults Sentry describes as "more permissive," so read the defaults when upgrading.
- **Keep server-side scrubbing on as a second net.** Sentry's documentation says "Data scrubbing is enabled by default and we highly recommend you keep it that way"; it catches values that look like card numbers and keys named like secrets, which is a backstop, not a design.
- **Identify users by an opaque ID,** never an email, so an erasure request is one lookup ([Data Retention & Deletion](/docs/architecture/data-retention)).

### Volume

A bad deploy can send millions of identical events in minutes. Sentry's spike protection "begins discarding events to keep your quota from being consumed too quickly," and every SDK has a client-side `sampleRate` for errors (default `1.0`). I keep errors unsampled and rely on grouping plus a quota, because the rare error is the one that matters and sampling loses it first. High-volume, known errors are better fixed or filtered at the source than sampled.

### Errors or Logs

The two overlap, and the boundary I draw:

| Goes to the error tracker | Stays in logs |
| --- | --- |
| Unhandled exceptions and crashes | Expected failures: a declined card, a validation `422` |
| Handled errors that mean a bug or a broken dependency | Retries that succeeded |
| Anything a developer should fix | Anything an operator needs to reconstruct a timeline |

Every error event carries the trace ID and request ID, and the error is also logged with them, so the tracker links to the [trace](/docs/observability/tracing) and the [log lines](/docs/observability/logs) around it. Paging happens on the error _rate_ from metrics against an [SLO](/docs/operations/slos), not on individual issues; the tracker's alerts are for "new issue in this release" and "regression," routed to the owning team as tickets.

## Continuous Profiling

A profiler samples where a program is spending its time or memory and attributes it to stack traces, usually drawn as a flame graph. Continuous profiling does that all the time, in production, at low enough overhead to leave on, and keeps the history. Then "what got slower in Tuesday's release?" and "which function costs the most CPU across the fleet?" are queries, not projects.

### Profile Types

| Profile | Shows | Notes |
| --- | --- | --- |
| CPU | Where on-CPU time goes | The default everywhere; misses time spent waiting |
| Wall clock | Where elapsed time goes, including waiting on I/O and locks | What a slow request feels like; not in every runtime |
| Allocations | Which code allocates, and how much | Drives GC pressure |
| Heap (in use) | Which code holds live memory | For leaks and memory limits |
| Lock and contention | Where threads wait on mutexes | Often off by default |
| Goroutines and threads | What every thread is doing right now | For deadlocks and leaks |

The CPU profile's blind spot is the one that bites: Datadog's documentation notes that Go's CPU profile doesn't capture "Off-CPU time such as waiting for Networking, Channels, Mutexes, and Sleep." A request that's slow because it waits on a lock looks idle in a CPU profile. Use wall-clock where the runtime has it (Java, .NET and Node.js in Pyroscope's matrix), and block and mutex profiles in Go.

### Sampling and Overhead

Profilers sample stacks on a timer instead of tracing every call, which is what makes them affordable. Go's CPU profiler hard-codes 100 Hz, chosen, per the comment in its source, as "frequent enough to produce useful data, rare enough not to bog down the system." Parca's eBPF agent samples stacks "19 times per second per logical CPU."

Overhead claims vary in how specific they are, and I only quote the specific ones:

- **Google Cloud Profiler** states its CPU and heap profiling overhead is "less than 5 percent" while collecting, and "commonly less than 0.5 percent" amortized, because it profiles one instance at a time for short periods.
- **The OpenTelemetry eBPF profiler** states "1% CPU and 250MB memory are our upper limits in testing."
- **Go's own diagnostics guide** says it "is safe to profile programs in production, but enabling some profiles (e.g. the CPU profile) adds cost," and recommends collecting one profile at a time.
- **Grafana**, which makes Pyroscope, gives a range rather than a figure: "CPU and latency overhead for typical configurations lands in the low single-digit percentages," and sampling profilers' memory overhead is "usually less than 50 MB per pod."
- **Datadog and Parca** describe their overhead as low or very low without publishing a figure, so measure it on your own service before and after enabling it. <!-- source-gap: profiling-vendor-overhead | missing | Datadog and Parca publish no numeric overhead figure for their continuous profilers | closes with: a vendor-published overhead percentage or benchmark | checked: 2026-10-28 -->

Block and mutex profiles are the expensive ones: Go leaves both off by default, and Datadog warns that "The block profiler can cause noticeable overhead for production workloads." Turn them on with a sampling rate, not at full fidelity.

### pprof, the Common Format

Most tools read and write [pprof](https://github.com/google/pprof/blob/main/proto/README.md): "a gzip-compressed protocol buffer" in which "A sample associates a set of measurement values with a list of locations." Go exposes it natively through `net/http/pprof`, and the same file opens in `go tool pprof`, Pyroscope, Parca and most vendors. That makes a profile portable, which matters when the question is "send me what you're seeing."

```go tab="Go"
import _ "net/http/pprof" // registers /debug/pprof/ on the default mux

// Serve it on an internal port only, never the public listener.
go http.ListenAndServe("127.0.0.1:6060", nil)
```

```rust tab="Rust"
// pprof crate (Unix only), "prost-codec" feature: sample stacks 100 times a second
let guard = pprof::ProfilerGuardBuilder::default().frequency(100).build()?;
std::thread::sleep(Duration::from_secs(30));
let profile = guard.report().build()?.pprof()?;
std::fs::write("cpu.pb", profile.encode_to_vec())?; // opens in go tool pprof
```

```bash tab="Shell"
# 30 seconds of CPU from a running service, opened as a flame graph
go tool pprof -http=:8080 "http://127.0.0.1:6060/debug/pprof/profile?seconds=30"
```

The pprof endpoints reveal internals and cost CPU on demand, so they live on a private port or behind authentication, never on the public listener.

### eBPF Profilers

An eBPF profiler runs in the kernel and walks stacks of every process on the host, with nothing added to the application. The OpenTelemetry eBPF profiler, donated by Elastic, calls itself "100% non-intrusive: there's no need to load agents or libraries into the processes that are being profiled," and unwinds from the kernel "all the way into high-level languages" including the JVM, Python, Ruby, PHP, Node.js and .NET.

The trade is depth for coverage. One DaemonSet profiles every workload on a node, including the ones nobody instrumented, but Grafana's documentation notes its eBPF profiler "collects CPU profiles" and "doesn't support all profile types such as memory and contention/lock profiling." My default is both: eBPF for fleet-wide CPU everywhere, and the language SDK on the services where memory or lock profiles earn their cost.

### The OpenTelemetry Profiles Signal

OpenTelemetry announced profiling as a fourth signal in March 2024, and on 26 March 2026 the Profiles signal "officially entered public Alpha," with the eBPF agent running as a Collector receiver and pprof data that "can be round-trip converted to/from OTLP Profiles with no loss of information." As of October 2026 the specification is marked Alpha, the OTLP profiles protocol is still labeled Development, and the project says the signal "should not be used for critical production workloads."

The design point worth knowing now: a profile sample "MAY include a `Link` (span ID and trace ID)," which ties a flame graph to the exact [trace](/docs/observability/tracing) whose CPU it measured, the same bridge [exemplars](/docs/observability/metrics#exemplars) build for metrics. Until the signal is stable, I collect pprof with a profiler that can later export OTLP, and run the Collector receiver in non-critical environments to learn it.

### Profiles in Incidents and Cost Work

- **During an incident,** compare the profile from the last hour to the same service yesterday or to the previous release. A new wide frame in the diff is usually the change. It answers "CPU is at 90%, doing what?" faster than any log.
- **After a deploy,** compare release to release as part of the [canary](/docs/delivery/deployment-strategies#canary) check; a regression in allocation rate shows up before it shows up in latency.
- **For cost,** sum CPU by function across the fleet. The top few frames are where optimization pays, and the profile says how many cores a fix would save, which is the number [Cost & FinOps](/docs/operations/cost-and-finops) work needs.
- **For memory limits,** in-use heap by function says what to fix before raising a container's limit ([Kubernetes Operations](/docs/operations/kubernetes#requests-and-limits)).

## Checklist

- Every error event carries release, environment, trace ID and request ID.
- Grouping is reviewed: messages are constant, helper frames are excluded, infrastructure failures have server-side fingerprints.
- Source maps, dSYMs and mapping files upload from CI for every build, and symbolication failures alert.
- PII is scrubbed in the SDK, the tracker's scrubbing stays on, and users are opaque IDs.
- Error trackers alert on new issues and regressions as tickets; pages come from SLO burn rates.
- CPU profiling runs continuously in production, with wall-clock or off-CPU profiles where the runtime supports them.
- Profiling endpoints are private, and the overhead was measured on your own service.
- Profiles are compared release to release and used in incident and cost reviews.

## References

**Specifications**

- [OpenTelemetry: Profiles](https://opentelemetry.io/docs/specs/otel/profiles/), the Alpha profiles specification and links from samples to spans
- [OpenTelemetry protocol](https://github.com/open-telemetry/opentelemetry-proto), maturity of the profiles protocol
- [pprof: profile.proto](https://github.com/google/pprof/blob/main/proto/README.md), the profile format

**In practice**

- [Sentry: Event grouping](https://docs.sentry.io/concepts/data-management/event-grouping/), fingerprints and stack-trace grouping
- [Sentry: Fingerprint rules](https://docs.sentry.io/concepts/data-management/event-grouping/fingerprint-rules/), server-side grouping overrides
- [Sentry: Issue states and triage](https://docs.sentry.io/product/issues/states-triage/), resolving in a release and regressions
- [Sentry: Source maps](https://docs.sentry.io/platforms/javascript/sourcemaps/), debug IDs and bundler plugins
- [Sentry: Uploading dSYMs](https://docs.sentry.io/platforms/apple/dsym/), symbolicating Apple crashes
- [Sentry: ProGuard and R8](https://docs.sentry.io/platforms/android/enhance-errors/proguard/), deobfuscating Android stack traces
- [Sentry: Server-side data scrubbing](https://docs.sentry.io/security-legal-pii/scrubbing/server-side-scrubbing/), default scrubbing and advanced rules
- [Sentry: Python SDK options](https://docs.sentry.io/platforms/python/configuration/options/), `send_default_pii`, `data_collection`, `sample_rate` and `before_send`
- [Sentry: Spike protection](https://docs.sentry.io/pricing/quotas/spike-protection/), discarding events during a spike
- [BugSnag: Error grouping](https://docs.bugsnag.com/product/error-grouping/), default and custom grouping
- [Firebase Crashlytics: Deobfuscated reports on Android](https://firebase.google.com/docs/crashlytics/android/get-deobfuscated-reports) and [on iOS](https://firebase.google.com/docs/crashlytics/ios/get-deobfuscated-reports), mapping file and dSYM upload
- [Apple: Adding identifiable symbol names to a crash report](https://developer.apple.com/documentation/xcode/adding-identifiable-symbol-names-to-a-crash-report), symbolication
- [Android: Troubleshoot app optimization](https://developer.android.com/topic/performance/app-optimization/test-and-troubleshoot-the-optimization), `retrace` and keeping `mapping.txt` per release
- [Google Play Console: Deobfuscate or symbolicate crash stack traces](https://support.google.com/googleplay/android-developer/answer/9848633), a mapping file per version
- [Go: Diagnostics](https://go.dev/doc/diagnostics), profiling in production
- [Go: runtime/pprof](https://pkg.go.dev/runtime/pprof), profile types, and the [source](https://github.com/golang/go/blob/master/src/runtime/pprof/pprof.go) behind the 100 Hz CPU rate
- [Grafana Pyroscope: Profile types](https://grafana.com/docs/pyroscope/latest/configure-client/profile-types/) and [eBPF with Grafana Alloy](https://grafana.com/docs/pyroscope/latest/configure-client/grafana-alloy/ebpf/), what each language and the eBPF profiler support
- [Grafana Labs: Continuous profiling in production, a real-world example to measure benefits and costs (February 9, 2026)](https://grafana.com/blog/continuous-profiling-in-production-a-real-world-example-to-measure-benefits-and-costs/), CPU and latency overhead in the low single-digit percentages, memory usually under 50 MB per pod
- [Parca Agent](https://www.parca.dev/docs/parca-agent/), eBPF sampling at 19 Hz per CPU
- [Datadog: Continuous Profiler](https://docs.datadoghq.com/profiler/) and [profile types](https://docs.datadoghq.com/profiler/profile_types/), wall time, off-CPU blind spots and block profiler overhead
- [Google Cloud Profiler](https://docs.cloud.google.com/profiler/docs/about-profiler), overhead during collection and amortized
- [OpenTelemetry eBPF profiler](https://github.com/open-telemetry/opentelemetry-ebpf-profiler), non-intrusive whole-system profiling and its tested limits
- [OpenTelemetry: Profiles enters public Alpha](https://opentelemetry.io/blog/2026/profiles-alpha/), status, the Collector receiver and pprof conversion
- [OpenTelemetry: Announcing support for profiling](https://opentelemetry.io/blog/2024/profiling/), the 2024 announcement and Elastic's donation
