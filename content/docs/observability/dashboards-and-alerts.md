+++
title = "Dashboards & Alerts"
description = "Service dashboards as code with deploy markers, alerts on symptoms and burn rates, routing, runbooks, alert fatigue, silences and testing alerts."
category = "Observability"
order = 1239
tags = ["observability", "dashboards", "alerting", "grafana", "prometheus", "on-call"]
+++

Telemetry is only useful when someone looks at it at the right moment. Alerts decide the moment; dashboards decide what the person sees when they arrive. Both rot by default: dashboards accumulate panels nobody understands, and alert rules accumulate pages nobody acts on, until the one page that matters is ignored with the rest.

This page is the design of both. The signals come from [Metrics](/docs/observability/metrics), the objectives from [SLOs & Error Budgets](/docs/operations/slos), and what happens after a page from [On-Call & Runbooks](/docs/operations/on-call).

## Dashboard Design

A dashboard answers one question for one audience. The one every service needs answers "is this service healthy, and if not, where's the problem?" for the person who just got paged. It has a fixed shape, top to bottom:

1. **Golden signals for the service's own requests:** traffic, error ratio, latency (p50, p95, p99, as histograms, never averages), saturation. The [SLO](/docs/operations/slos) and remaining error budget sit beside them.
2. **Dependencies:** the same signals for each thing the service calls, one row per database, queue and downstream service, split by dependency. "The service is slow" becomes "the service is waiting on the payments processor" in one glance.
3. **Resources:** utilization and saturation for pools, workers, queues and the containers themselves (the [USE method](/docs/observability/metrics#what-to-measure-golden-signals-red-and-use)).
4. **Business signals:** orders per minute, authorization rate, jobs completed, compared to the same time last week.

Rules that keep it readable at 3am:

- **Consistent units.** Seconds for durations, bytes for sizes, ratios as percentages, everywhere. A panel in milliseconds next to one in seconds gets misread.
- **Consistent time.** Every panel follows the dashboard's time range, in UTC ([Time & Date Formats](/docs/fundamentals/time)); no panel with its own hard-coded "last 24 hours."
- **Rates, not counters.** A raw counter climbing forever says nothing; its rate does.
- **Thresholds drawn on the chart** where they exist: the SLO's latency target as a line, the pool's maximum as a line.
- **Template variables** for environment, region and version, so one dashboard serves staging and production without copies.
- **Links out:** from a latency panel to traces for that service and window ([Tracing](/docs/observability/tracing)), from the error panel to logs ([Logs](/docs/observability/logs)), from the dashboard to its runbook.

Beyond the per-service dashboard I keep very few: one overview with each service's SLO status, and short-lived dashboards made during an investigation and deleted after. A dashboard per incident that outlives the incident is how a folder reaches five hundred entries.

## Dashboards as Code

A dashboard edited by hand in the UI has no review, no history and no way to rebuild after someone deletes a panel. Dashboards are code, reviewed and deployed like any other ([Infrastructure as Code](/docs/delivery/infrastructure-as-code)).

```yaml tab="Grafana"
# /etc/grafana/provisioning/dashboards/services.yaml
apiVersion: 1
providers:
  - name: services
    folder: Services
    type: file
    disableDeletion: true
    allowUiUpdates: false
    updateIntervalSeconds: 30
    options:
      path: /var/lib/grafana/dashboards
```

```hcl tab="Terraform"
resource "grafana_dashboard" "checkout" {
  folder      = grafana_folder.services.uid
  config_json = file("${path.module}/dashboards/checkout.json")
}
```

```jsonnet tab="Jsonnet"
local g = import 'github.com/grafana/grafonnet/gen/grafonnet-latest/main.libsonnet';

g.dashboard.new('Checkout')
+ g.dashboard.withUid('checkout')
+ g.dashboard.withPanels([
  g.panel.timeSeries.new('Requests per second')
  + g.panel.timeSeries.queryOptions.withTargets([
    g.query.prometheus.new('$datasource', 'sum(job:http_requests:rate5m{job="checkout"})'),
  ])
  + g.panel.timeSeries.standardOptions.withUnit('reqps'),
])
```

- **Grafana file provisioning** reads dashboard JSON from disk, and "Grafana always overwrites the database dashboard with the one from the provisioning file," so the repository wins. `allowUiUpdates: false` makes that explicit.
- **The Terraform provider's `grafana_dashboard`** takes "The complete dashboard model JSON," which fits teams that already manage folders, data sources and permissions in Terraform.
- **Generating dashboards** from code removes the copy-paste between services. Grafana's [Foundation SDK](https://grafana.com/docs/grafana/latest/observability-as-code/foundation-sdk/) covers Go, TypeScript, Python, PHP and Java; [Grafonnet](https://github.com/grafana/grafonnet) does the same in Jsonnet and describes itself as "experimental."

My default: a shared library function that renders the standard service dashboard from a service name and its dependency list, so every service gets the same layout and a new dependency is one line. Service-specific business panels are added in the same file, in the service's repository.

## Deploy and Change Markers

Most incidents start with a change, and a dashboard that doesn't show changes makes everyone guess. Draw every deploy, feature flag change, config push and scaling event as an annotation, a vertical line across every panel.

```bash tab="Shell"
curl -sS -X POST "$GRAFANA_URL/api/annotations" \
  -H "Authorization: Bearer $GRAFANA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tags":["deploy","checkout"],"text":"checkout 1.42.0 (3f9c2e1) to production"}'
```

The [annotations API](https://grafana.com/docs/grafana/latest/developers/http_api/annotations/) needs only `text`; without a dashboard it creates "an organization annotation," which any dashboard can show by tag. Post it from the deploy pipeline and from the [feature flag](/docs/delivery/feature-flags) service, never by hand. The release version also belongs on the telemetry itself (a `service.version` resource attribute), so a chart can split by version during a [canary](/docs/delivery/deployment-strategies#canary).

## Alert Design

The SRE Book's rules for pages still hold: "Every page should be actionable," "Every page response should require intelligence," and "Pages should be about a novel problem or an event that hasn't been seen before." Its test for a new rule is the one I apply in review: "Does this rule detect an otherwise undetected condition that is urgent, actionable, and actively or imminently user-visible?"

### Symptoms, Not Causes

Page on what users feel: errors, latency, a journey that fails. Don't page on causes: CPU at 90%, a pod restarting, a disk at 80%. A cause either produces a symptom (and the symptom alert fires) or it doesn't (and nobody needed waking). Causes are still worth knowing; they go on the dashboard and, when they predict trouble a human must prevent, into a ticket. The exception is a cause with a deadline: a certificate expiring in 7 days or a disk that fills in 4 hours at the current rate gets an alert, because waiting for the symptom means an outage.

### Burn Rates

For anything with an SLO, the page is a burn-rate alert, not a threshold. The [SRE Workbook](https://sre.google/workbook/alerting-on-slos/) recommends multi-window, multi-burn-rate alerts: for a 99.9% SLO, page when both 1 hour and 5 minutes burn faster than 14.4, or 6 hours and 30 minutes faster than 6, and ticket at 3 days and 6 hours over 1. The math, the table and why both windows are needed are in [SLOs & Error Budgets](/docs/operations/slos#alerting-on-burn-rate); here's the rule, reading the [recording rules](/docs/observability/metrics#recording-rules-and-pre-aggregation) that make it cheap:

```yaml tab="Prometheus"
groups:
  - name: checkout-slo
    rules:
      - alert: CheckoutErrorBudgetBurnFast
        expr: |
          job:slo_errors:ratio_rate1h{job="checkout"} > (14.4 * 0.001)
          and
          job:slo_errors:ratio_rate5m{job="checkout"} > (14.4 * 0.001)
        labels:
          severity: page
          team: payments
        annotations:
          summary: "Checkout is spending its 30-day error budget 14x too fast"
          runbook_url: "https://runbooks.example.com/checkout/error-budget-burn"
          dashboard_url: "https://grafana.example.com/d/checkout"
```

- **`for` is for noisy expressions, not burn rates.** Prometheus's `for` waits before firing; the short window already filters blips, and a long `for` only delays the page.
- **`keep_firing_for`** keeps an alert firing "for the specified duration after the firing condition was last met," which stops a flapping condition from resolving and re-paging every few minutes.
- **Every alert links its runbook and its dashboard,** in the alert itself, so the first click lands somewhere useful.

## Routing and Severities

Two severities cover most needs, and more tend to blur into each other:

| Severity | Means | Delivery |
| --- | --- | --- |
| Page | User-visible now, or will be before business hours | Phone or push to the on-call engineer, escalates if not acknowledged |
| Ticket | Needs a human within days | A ticket in the owning team's queue, no notification at night |

Everything else (informational, "warning") goes on a dashboard, not a notification channel. A Slack channel full of warnings is a log nobody reads.

Alertmanager routes through "a routing tree in the configuration file" whose top-level route "must match all alerts," then branches on labels such as `team` and `severity`. It also does the two things that keep a large outage to one page: **grouping**, which "categorizes alerts of similar nature into a single notification," and **inhibition**, "suppressing notifications for certain alerts if certain other alerts are already firing" (a datacenter-down alert inhibiting every per-service alert inside it). Its defaults wait 30 seconds to group, 5 minutes between updates to a group, and 4 hours before repeating.

Paging tools add their own mapping. In PagerDuty, `critical` and `error` events use "high-urgency notification rules" and escalate, `warning` and `info` use low urgency and "cannot escalate," and "Any incoming event without a severity defaults to high urgency," so set the severity on every event or everything pages.

Route by **ownership**: the `team` label comes from the service's catalog entry, not the alert author's memory, and an alert with no owner fails review.

## Actionable Pages and Runbooks

Every paging alert has a runbook that says what the alert means, the impact, how to confirm it, how to mitigate it and when to escalate. The format and an example are in [On-Call & Runbooks](/docs/operations/on-call#runbooks). Two rules from there matter for alert design:

- **If the runbook's answer is always the same command, automate it** and delete the page.
- **If nobody can say what to do when it fires,** it isn't a page yet. Make it a ticket until someone can.

## Alert Fatigue

Alert fatigue is measurable, and measuring it is the only way it gets fixed. The [SRE Book](https://sre.google/sre-book/being-on-call/) sets a ceiling of "2 per 12-hour on-call shift" for incidents, because each one takes hours to handle well. PagerDuty's responder analytics count "interruptions," a push, call or SMS, with notifications "within 60 seconds of each other" counted as one, and report them separately for sleep hours.

What I review weekly with the on-call handoff:

| Measure | Healthy | Smell |
| --- | --- | --- |
| Pages per shift | Under the SRE Book's two | A daily page that "always resolves itself" |
| Off-hours interruptions | Rare, each one discussed | Any recurring night page |
| Pages that led to action | Nearly all | Acknowledged and closed with no change |
| Pages per alert rule | Spread thin | One rule producing most of the volume |
| Time to acknowledge | Steady | Rising, which means people have stopped trusting pages |

Every page that needed no action gets a decision in the review: fix the cause, retune the rule, demote it to a ticket, or delete it. Deleting is allowed; an alert nobody acts on is worse than no alert, because it trains people to ignore the next one.

## Silences and Maintenance Windows

Planned work shouldn't page. Alertmanager's silences "mute alerts for a given time," matched on labels.

- **Every silence has an expiry and a comment** naming the change or incident. A silence without an end time is a deleted alert nobody reviewed.
- **Scope it narrowly:** one service, one environment, the alerts the work will trip. Silencing a whole cluster during a node upgrade hides the unrelated outage that happens in the same hour.
- **Create it from the tooling that does the work** (the migration job, the maintenance runbook) and remove it when the work finishes, not when the timer runs out.
- **Keep paging on user-visible symptoms** during maintenance when users are still being served. A maintenance window is permission for expected noise, not for an outage nobody notices.

## Testing Alerts

The SRE Workbook's point is uncomfortable: "It's very likely that your alerting rules will not fire for months or years after you configure them," and "monitoring and alerting code should be subject to the same testing standards as code development." An alert first exercised during a real outage is an alert that might not fire.

```yaml tab="Prometheus"
# promtool test rules checkout_test.yml
rule_files: [checkout_rules.yml]
evaluation_interval: 1m
tests:
  - interval: 1m
    input_series:
      - series: 'job:slo_errors:ratio_rate1h{job="checkout"}'
        values: '0.02x10'
      - series: 'job:slo_errors:ratio_rate5m{job="checkout"}'
        values: '0.02x10'
    alert_rule_test:
      - eval_time: 5m
        alertname: CheckoutErrorBudgetBurnFast
        exp_alerts:
          - exp_labels: { job: checkout, severity: page, team: payments }
            exp_annotations:
              summary: "Checkout is spending its 30-day error budget 14x too fast"
              runbook_url: "https://runbooks.example.com/checkout/error-budget-burn"
              dashboard_url: "https://grafana.example.com/d/checkout"
```

- **Unit-test the rules** with `promtool test rules` in CI: synthetic series in, expected alerts out, for both the case that should fire and the one that shouldn't.
- **Lint for the required labels and annotations:** `severity`, `team`, `runbook_url`. A rule without an owner or runbook doesn't merge.
- **Test the delivery path end to end** on a schedule: a synthetic alert that routes to the on-call tool and is acknowledged, so a broken integration or an expired token is found on a Tuesday afternoon.
- **Exercise them in game days.** Inject the failure ([Disaster Recovery](/docs/operations/disaster-recovery)) and check that the right alert fired, at the right severity, to the right team, with a runbook that worked.

## Checklist

- Each service has one dashboard: golden signals and SLO first, then dependencies, resources and business signals.
- Units, time ranges and time zones are consistent across panels.
- Dashboards are provisioned from code, and the UI can't drift from the repository.
- Deploys, flag changes and config pushes appear as annotations, and telemetry carries the release version.
- Pages fire on symptoms and SLO burn rates; causes go to dashboards or tickets.
- Two severities, page and ticket, routed by an owner label from the service catalog.
- Every page links a runbook and a dashboard.
- Alert volume and actionability are reviewed every week, and alerts that led to no action are changed or removed.
- Silences are narrow, commented and expire.
- Alert rules have unit tests in CI, and the delivery path is tested on a schedule.

## References

**Specifications**

- [Prometheus: Alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/), `for` and `keep_firing_for`
- [Prometheus: Unit testing for rules](https://prometheus.io/docs/prometheus/latest/configuration/unit_testing_rules/), `promtool test rules`
- [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/), grouping, inhibition and silences
- [Alertmanager: Configuration](https://prometheus.io/docs/alerting/latest/configuration/), the routing tree and its timing defaults
- [Grafana: Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/), dashboards from files
- [Grafana: Annotations API](https://grafana.com/docs/grafana/latest/developers/http_api/annotations/), creating deploy markers
- [Grafana Terraform provider: grafana_dashboard](https://github.com/grafana/terraform-provider-grafana/blob/main/docs/resources/dashboard.md), dashboards in Terraform

**In practice**

- [Google SRE Book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/), symptoms, actionable pages and the test for a new rule
- [Google SRE Workbook: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/), multi-window, multi-burn-rate alerts
- [Google SRE Workbook: Monitoring](https://sre.google/workbook/monitoring/), testing monitoring and alerting like code
- [Google SRE Book: Being On-Call](https://sre.google/sre-book/being-on-call/), the incidents-per-shift ceiling
- [Grafana: Foundation SDK](https://grafana.com/docs/grafana/latest/observability-as-code/foundation-sdk/), dashboards from Go, TypeScript, Python, PHP and Java
- [Grafonnet](https://github.com/grafana/grafonnet), dashboards in Jsonnet
- [PagerDuty: Dynamic notifications](https://docs.pagerduty.com/incident-management/incidents/dynamic-notifications), severity and urgency
- [PagerDuty: Responder insights](https://docs.pagerduty.com/incident-management/analytics/insights/responder), counting interruptions
