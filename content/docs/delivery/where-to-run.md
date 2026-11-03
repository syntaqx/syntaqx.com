+++
title = "Where to Run It"
description = "Choosing compute: a platform first, managed containers next, Kubernetes only with a platform team, and what functions, VMs and metal cost to own in people."
category = "Delivery"
order = 1104
tags = ["delivery", "infrastructure", "containers", "kubernetes", "serverless"]
+++

Where code runs is the infrastructure decision teams revisit most, and usually for the wrong reasons: a conference talk, a résumé, a bill that looked high one month. The choice is less about technology than about ownership. Every option runs a container or a function well enough. What differs is how much of the machinery around it becomes your job: upgrades, patching, scaling, logs, the pager at 3 a.m. That work is paid in engineers, and engineers are the scarcest thing most teams have.

So this chapter makes one argument and defends it: **climb a ladder, one rung at a time, and only when the rung you're on stops fitting.** Start on a platform. Move to a managed container service when the platform's limits bind. Run Kubernetes only when there's a platform team to own it.

![A three-rung ladder from left to right. The first rung, platform, is accented and marked start here: you own code and config, and move on when limits, the bill or compliance bind. The second, managed containers, is marked next: you own the image, service, network and IAM, and move on when a platform team exists to own more. The third, Kubernetes, is marked with a platform team: you own upgrades, add-ons, observability, policy and the cluster's on-call. A line under all three says one OCI image runs on every rung, and that is the exit path.](/diagrams/where-to-run-ladder.svg "The compute ladder. Each rung hands you more of the machinery to own; the container image is what lets you climb, or come back down, without a rewrite.")

## Rung One: A Platform

A platform (Vercel, Render, Fly.io, Heroku, Railway and their peers) takes a repository or an image and returns a URL. Builds, TLS, routing, scaling, rollbacks, preview environments, logs and the hosts underneath are the provider's problem. You own the code and its configuration.

**This is my default for every new product,** and for most products long after launch. The reasons:

- **The scarce resource is attention.** A team of five shipping a product has no spare person for infrastructure, and a platform means it doesn't need one. Every hour not spent on node pools is an hour on the product.
- **Platforms already do the practices this playbook asks for.** Immutable deploys from a build, [preview environments](/docs/operations/environments) per pull request, instant rollback to a previous release, health-checked rollouts. Rebuilding those yourself is months of work that ends where the platform started.
- **The bill is honest at small scale.** The platform's margin on compute is real, but at a few services it's smaller than one engineer's time spent replacing it.

The costs are real too, and they're the signals to move:

- **Limits.** Request timeouts, function durations, memory ceilings, no long-running background workers, no GPUs, a fixed set of regions. When the workload's shape no longer fits, workarounds pile up fast.
- **Unit price at scale.** A platform resells someone's cloud with a margin, and at steady, high utilization that margin becomes the biggest line on the bill ([PaaS & Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds) breaks down how the meters work).
- **Compliance and networking.** Private connectivity to a database in your own cloud account, data residency, a regulator's control list. Some platforms offer these on enterprise plans; some don't at all.
- **The platform's own lifecycle.** Platforms get repriced, sold and wound down. AWS closed App Runner to new customers; existing customers keep using it, AWS says it does "not plan to introduce new features," and it recommends moving to ECS Express Mode ([AWS: App Runner availability change](https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html)). That's why the exit path, below, is part of the default, not an afterthought.

## Rung Two: Managed Containers

When a platform stops fitting, the next step is the cloud provider's own container service: **Google Cloud Run, AWS ECS on Fargate, Azure Container Apps.** You hand over an OCI image, a size and a scaling rule; the provider runs it with no cluster, nodes or control plane in sight. You now own more (the service definition, networking, IAM roles, the load balancer settings, often in [Terraform](/docs/delivery/infrastructure-as-code)), but not the orchestrator.

What each offers, from its own documentation:

- **Cloud Run** runs containers per request or as jobs, with a request timeout of 5 minutes by default and up to 60 ([Cloud Run: Request timeout](https://docs.cloud.google.com/run/docs/configuring/request-timeout)), and is "automatically integrated with Cloud Monitoring with no setup or configuration required," with no charge for its metrics ([Cloud Run: Monitoring](https://docs.cloud.google.com/run/docs/monitoring)).
- **ECS Express Mode** takes a container image and two IAM roles and provisions "a Fargate-based ECS service with a unique accessible URL, load balancer with SSL/TLS, auto scaling policies, monitoring, and networking components," all created in your own account and visible there, at no charge beyond the resources ([Amazon ECS Express Mode](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-overview.html)). Underneath is plain ECS on Fargate, so you can take over any piece later.
- **Azure Container Apps** is "a serverless platform for running containerized applications without managing the underlying infrastructure," scaling on HTTP traffic, events or any KEDA-supported scaler, and to zero for most apps ([Azure Container Apps overview](https://learn.microsoft.com/en-us/azure/container-apps/overview)).

This rung is where I'd expect most companies to spend most of their life. It runs long-lived services, workers and scheduled jobs; it sits inside your own cloud account with private networking and your IAM; it bills at the provider's own prices; and the provider still patches the hosts, runs the orchestrator and collects the basic logs and metrics. A team of a few engineers can run dozens of services here with nobody whose job is infrastructure.

## Rung Three: Kubernetes, With a Platform Team

Kubernetes is a good platform for building platforms: a uniform API for scheduling, service discovery, configuration and rollout across a fleet, and an ecosystem for everything else. It's the right answer for many services with varied needs, specific hardware or network requirements, workloads that don't fit the managed services' limits, or an organization where a platform team runs it as an internal product for everyone else. [Kubernetes Operations](/docs/operations/kubernetes) covers running it well.

**My rule: Kubernetes only when there's a platform team to own it,** and that holds for managed Kubernetes too. EKS, GKE and AKS take the control plane and etcd off your hands, which is real, but it's the smallest part of the job. What stays with you:

- **The upgrade treadmill.** The project maintains release branches for the three most recent minor releases, each with "approximately 1 year of patch support" ([Kubernetes: Releases](https://kubernetes.io/releases/)). So every cluster is upgraded at least yearly, in practice more often, with removed APIs cleared from every manifest and chart first. Managed providers add their own calendars and, at the end, upgrade for you on their schedule.
- **Add-ons.** Ingress or Gateway controller, cert-manager, DNS automation, the node autoscaler, the CSI drivers, the secrets operator, the policy engine. Each has its own releases, its own compatibility matrix against the cluster version, and its own way of breaking.
- **Observability, which isn't built in.** The project says it directly: "Kubernetes does not provide a native storage solution for log data," and cluster-level logging "require[s] a separate backend to store, analyze, and query logs" ([Kubernetes: Logging architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/)). Metrics are the same: something must scrape, store, graph and alert. You either assemble and upgrade that stack or turn on the provider's paid telemetry. Compare Cloud Run's line above: on a managed container service the baseline arrives with the first deploy.
- **Security and policy.** RBAC, network policies, pod security, image admission, secrets handling, all yours to configure and keep current.
- **The pager.** When a node pool won't drain or DNS inside the cluster fails, the provider isn't paged; you are.

The Hosting & Cloud book lays the provider-by-provider split side by side in [What You Still Own on a Managed Cluster](/books/hosting-and-cloud/managed-kubernetes#what-you-still-own-on-a-managed-cluster), and it's a platform team's backlog. A team that adopts Kubernetes without that team doesn't avoid the work; it spreads it across product engineers, who learn it during incidents.

The pager is also where the people math gets hard. Google's SRE book puts the minimum for a single-site team carrying a 24-hour on-call rotation at eight engineers, so that nobody spends more than a quarter of their time on call ([Google SRE: Being On-Call](https://sre.google/sre-book/being-on-call/)). Infrastructure that can page you at night needs that many people able to answer, whether or not the work fills their week. Below that size, the honest options are business-hours infrastructure or infrastructure whose failures page the provider. Rungs one and two buy the second.

## Serverless Functions

Functions (AWS Lambda, Cloud Run functions, Azure Functions, and the edge runtimes of the frontend clouds) run code per event with no server and no idle cost. They're a different shape, not a rung, and they fit specific work:

- **Event glue:** a file lands in storage, a message arrives on a queue, a webhook comes in, a schedule fires. Short, stateless, bursty work that would otherwise keep a service idling.
- **Spiky or low traffic:** an internal tool used twice a day, an API that sees a hundred requests one hour and none the next.
- **Edge logic:** redirects, header rewrites, auth checks close to the user.

The limits are built into the model. Lambda "is designed for short-lived compute tasks that do not retain or rely upon state between invocations"; a function runs for up to 15 minutes, with up to 10,240 MB of memory, and synchronous requests and responses up to 6 MB each ([AWS Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)). Cold starts add latency to the first request on a new instance. Connection-heavy work (a database with a connection limit, WebSockets) needs a pooler or a different home. And a system of hundreds of functions wired by events is a distributed system whose behavior lives in configuration, hard to run locally and hard to trace without deliberate [tracing](/docs/observability/tracing).

My default: functions for glue and spiky edges, a container for the core service. When a team finds itself building a web application out of dozens of functions, a single container on rung two is usually simpler, cheaper and faster to debug. [Functions, Isolates & Edge Compute](/books/hosting-and-cloud/functions-and-edge-compute) covers how the runtimes and their meters compare.

## VMs and Bare Metal

Virtual machines and dedicated servers are the floor under every other rung, and occasionally the right place to stand:

- **Software that needs a whole machine:** a licensed product that runs on a VM, a database you operate yourself, kernel modules, specific hardware.
- **Steady, heavy, predictable load** where owning or renting the machine is much cheaper than any managed markup and the team can run it. That trade is real, and [Repatriation](/books/hosting-and-cloud/repatriation) has the cost model; it's also the trade that most often forgets the people.
- **GPUs and specialized hardware,** where availability and price on managed services may not fit.

Everything a platform did is now yours: the OS and its patches, images, configuration management, scaling, load balancing, failover, monitoring agents, and the hardware lifecycle on metal. If you go here, go immutable: build machine images in a pipeline and replace hosts instead of patching them, as [Containers & Immutable Infrastructure](/docs/delivery/containers) argues. A hand-tended server is the most expensive option on the list once you count the people.

## What It Costs to Own

Cloud bills compare easily and mislead badly, because the largest cost of an option is rarely on the bill. Count the recurring work instead: who upgrades, who patches, who builds and runs the observability stack, who is on call when the infrastructure (not the application) fails.

| | Platform | Managed containers | Managed Kubernetes | VMs | Bare metal |
| --- | --- | --- | --- | --- | --- |
| **Orchestrator upgrades** | Provider | Provider | You, on the provider's calendar | None | None |
| **OS and host patching** | Provider | Provider | Shared (node images) | You | You |
| **Add-ons and ingress** | Provider | Mostly provider | You | You | You |
| **Logs and metrics baseline** | Provider | Provider | You, or paid add-ons | You | You |
| **Scaling** | Provider | Provider, by your rule | You (pods and nodes) | You | You, plus buying hardware |
| **Infrastructure on-call** | Provider | Mostly provider | You | You | You |
| **Hardware** | Provider | Provider | Provider | Provider | You or a remote-hands contract |

No standards body or neutral survey publishes a headcount per platform, and I won't invent one. [Staffing by Platform](/books/hosting-and-cloud/total-cost-of-ownership#staffing-by-platform) builds estimates from the task list above, with its assumptions shown, and is the place to start if you need a number for a budget. The shape is what matters for the decision: per-cluster work grows with clusters, per-host work grows with hosts until it's automated, and per-service work (alerts, dashboards, policy) grows on every rung. That's why Kubernetes looks expensive small and reasonable large, and why a managed container service stays cheapest in people at every size it fits. [Cost & FinOps](/docs/operations/cost-and-finops) covers watching the dollars once you've chosen.

## Lock-In and the Exit Path

Every option locks you in somewhere; the question is how much it costs to leave. The defense is to choose a portable unit and keep everything that isn't portable thin.

- **The container image is the portable unit.** The Open Container Initiative maintains open specifications for the image format, the runtime and image distribution ([OCI: About](https://opencontainers.org/about/overview/)), and every rung on the ladder runs an OCI image: platforms that build from source can build from a Dockerfile, Cloud Run and ECS and Container Apps run images, Kubernetes runs images, and a VM can run one with a single command. Build one image per service in your own pipeline, push it to a registry you control, and the compute underneath becomes replaceable.
- **Configuration from the environment,** never baked in, and a twelve-factor shape: stateless processes, logs to stdout, state in backing services. An app that meets [Environments & Configuration](/docs/operations/environments) runs on any rung without code changes.
- **Infrastructure in code.** The service definitions, networking and IAM around the container live in [Terraform or OpenTofu](/docs/delivery/infrastructure-as-code), so moving rungs is a reviewed change you can read, not an archaeology project.
- **Proprietary services where they earn it.** A platform's KV store, a cloud's queue or a function trigger is fine when it saves real work; wrap it behind your own interface so the call sites don't care, and write down what replaces it.
- **The exit written before you need it.** For each service: which rung it would move to, what changes (DNS, secrets, networking, the data), and roughly how long it would take. App Runner's customers got a migration guide; customers of a smaller platform might get a notice period. Data is the hard part of any exit, and egress fees are part of it ([Egress & Switching](/books/hosting-and-cloud/egress-and-switching)).

Portability isn't a reason to avoid the managed rungs. It's what makes them safe to choose.

## Choosing

| Situation | Where it runs | Why |
| --- | --- | --- |
| New product, small team, web app and API | A platform | Nothing to operate; previews and rollback included |
| Front end with server rendering | A frontend platform | Built for the framework; CDN and functions included |
| Services need private networking, your cloud's IAM, workers, or long requests | Managed containers | Your account, the provider's operations |
| Platform bill dominated by steady compute | Managed containers on the same cloud | Provider prices without the reseller margin |
| Event glue, webhooks, schedules, spiky internal tools | Functions | No idle cost; fits short stateless work |
| Many services, varied needs, and a platform team that owns a cluster | Managed Kubernetes | A uniform platform, staffed |
| Licensed software, self-run databases, special kernels or hardware | VMs, built as images | Needs a whole machine |
| Large steady load, GPUs, or owning hardware beats renting, with people to run it | Dedicated servers or colocation | Unit cost, after counting the team |
| Kubernetes without anyone who owns it | Move down a rung | The work doesn't go away; it lands on the pager |

## Moving Between Rungs

Move up when a concrete limit binds, not when the next rung looks more serious: a timeout you're working around, a compliance control the platform can't meet, a monthly bill where the markup clearly exceeds an engineer's time, a workload shape (GPUs, long jobs) the rung can't run. Write the reason down in a [design doc](/docs/development/design-docs), with what the move will cost in ongoing work.

Move down when you've been carrying more than you need. A team running a cluster for six stateless services, with one person who understands it, is paying platform-team costs for managed-container needs. Moving down is the same migration as moving up, because the image doesn't change: deploy the service on the new rung, shift traffic gradually, keep the old one until the new one has been boring for a while ([Deployment Strategies](/docs/delivery/deployment-strategies)).

Mixed is normal. A frontend on a platform, the core services on managed containers, a few functions for glue and a GPU box for one model is a sensible estate, as long as each piece sits on the lowest rung that fits it.

## Checklist

- **Start on a platform** and stay while it fits.
- **Managed containers next,** in your own cloud account, when a limit, the bill or compliance binds.
- **Kubernetes only with a platform team** that owns upgrades, add-ons, observability, policy and the cluster's on-call.
- **Functions for glue and spiky work,** a container for the core service.
- **VMs and metal for what needs a machine,** built as images and replaced, never tended.
- **Cost counted in people,** not just the bill.
- **One OCI image per service,** config from the environment, infrastructure in code.
- **A written exit** per service, and a written reason for every move between rungs.

## References

**Specifications**

- [Open Container Initiative: About](https://opencontainers.org/about/overview/), the open image, runtime and distribution specifications

**Reference**

- [AWS: App Runner availability change](https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html), closed to new customers, no new features, ECS Express Mode as the recommended move
- [Amazon ECS Express Mode](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-overview.html), a Fargate service, load balancer, scaling and monitoring from an image, in your own account
- [AWS Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html), the 15-minute timeout, 10,240 MB memory and 6 MB synchronous payloads
- [Cloud Run: Request timeout](https://docs.cloud.google.com/run/docs/configuring/request-timeout), 5 minutes by default, up to 60
- [Cloud Run: Monitoring](https://docs.cloud.google.com/run/docs/monitoring), built-in metrics with no setup and no charge
- [Azure Container Apps overview](https://learn.microsoft.com/en-us/azure/container-apps/overview), serverless containers, KEDA scaling and scale to zero
- [Kubernetes: Releases](https://kubernetes.io/releases/), three maintained minor releases with about a year of patch support each
- [Kubernetes: Logging architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/), no native log storage; cluster logging needs a separate backend

**In practice**

- [Google SRE: Being On-Call](https://sre.google/sre-book/being-on-call/), eight engineers as the minimum for a single-site 24-hour rotation
- [The Twelve-Factor App](https://12factor.net/), the stateless, config-from-environment shape that runs on any rung
