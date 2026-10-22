+++
title = "Load & Performance Testing"
description = "Performance budgets tied to SLOs, the test types and when to run each, realistic traffic, capacity headroom, and the measurement trap that hides slow responses."
category = "Operations"
order = 5.98
tags = ["operations", "performance", "load-testing", "reliability"]
+++

"It's fast on my machine" is a measurement of one user. Load testing is how you learn what happens with ten thousand, before they arrive on launch day and teach you in production.

## Start From a Budget

A load test without a target just produces graphs. Set the target first, from the [SLOs](/docs/operations/slos):

- **Latency at percentiles, not averages.** "p95 under 300ms and p99 under 1s at 500 requests per second." An average hides the users having the worst time.
- **An error budget under load.** "Fewer than 0.1% errors at peak."
- **A throughput target with headroom.** Expected peak, times a safety factor (2x is a reasonable default), because launches and incidents both arrive as spikes.

The test passes or fails against those numbers, in CI where possible, and regressions block the merge like any failing test.

## Test Types

Different questions need different shapes of load, and running only one shape leaves the others to production. The names below are [k6's](https://grafana.com/docs/k6/latest/testing-guides/test-types/), and they're a useful vocabulary whatever tool you use:

| Type | Load | Answers |
| --- | --- | --- |
| **Smoke** | Minimal | Does the script and the system work at all? |
| **Average-load** | Normal traffic | Do we meet the budget on an ordinary day? |
| **Stress** | Above normal | How does it degrade, and does it recover? |
| **Soak** | Normal, for hours | Leaks, connection exhaustion, queues that slowly grow |
| **Spike** | A sudden surge | Does autoscaling keep up, or does everything fall over first? |
| **Breakpoint** | Rising until failure | Where is the actual limit, and what breaks first? |

Run smoke tests on every change. Run average-load before every launch and after architecture changes. Run stress, soak and spike on a schedule and before events you can see coming.

## Make the Traffic Real

A test that hammers one endpoint with one payload measures your cache.

- **Model real traffic:** the mix of endpoints, read/write ratio and payload sizes from production [metrics](/docs/operations/observability).
- **Realistic data volumes.** Queries that are instant on 1,000 rows fall over on 100 million. Seed synthetic data at production scale, never a copy of production (see [Environments](/docs/operations/environments)).
- **Open, not closed, load models.** Real users don't wait for your slow response before the next one arrives. Generate load at an arrival rate, not a fixed number of looping users, or you'll undercount exactly the slow periods you're looking for.
- **Test somewhere production-like:** same instance sizes, same database tier, same limits. Results from a smaller environment don't scale linearly.

## Coordinated Omission

The trap that makes most homemade benchmarks lie: when the system stalls, a closed-loop load generator stalls with it and stops sending requests, so the slowest moments are barely recorded. Gil Tene named it [coordinated omission](https://www.scylladb.com/2021/04/22/on-coordinated-omission/). Use tools that schedule requests at a fixed rate and measure from when the request *should* have been sent.

## Tools

- [k6](https://k6.io/): scripts in JavaScript, arrival-rate executors, thresholds that fail the run. My default.
- [Gatling](https://gatling.io/): mature, strong reporting, scenarios as code.
- [Locust](https://locust.io/): scripts in Python, easy to model complex user behavior.

Whichever you use, keep the scripts in the repository, reviewed and versioned with the code they test.

## Capacity Planning

- **Find the bottleneck, then the next one.** Load tests end at the first thing that saturates: connection pools, a lock, a downstream rate limit. Fix it and test again.
- **Know your headroom:** current peak versus the breakpoint. Revisit it as traffic grows, not after an outage.
- **Test the limits you don't control,** like provider quotas and third-party rate limits. Your capacity is the smallest of them.

## Profile, Don't Guess

Load tests say *that* it's slow; profiles say *why*. Capture CPU and allocation profiles and database query plans during the test, and optimize what the profile shows, not what you suspect.

## References

**Reference**

- [Grafana k6: Test types](https://grafana.com/docs/k6/latest/testing-guides/test-types/), smoke, average-load, stress, soak, spike and breakpoint
- [k6](https://k6.io/), load tests as JavaScript with pass/fail thresholds
- [Gatling](https://gatling.io/), load testing with scenarios as code
- [Locust](https://locust.io/), load tests written in Python

**In practice**

- [ScyllaDB: On coordinated omission](https://www.scylladb.com/2021/04/22/on-coordinated-omission/), why closed-loop benchmarks hide slow responses
- [AWS Well-Architected: Reliability pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html), testing for capacity and recovery before production does
