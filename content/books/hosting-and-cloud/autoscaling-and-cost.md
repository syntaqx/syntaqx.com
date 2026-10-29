+++
title = "Autoscaling & Cost"
description = "HPA, KEDA and VPA, Cluster Autoscaler versus Karpenter, bin packing and the request gap, spot in clusters, provider billing shapes, and cost allocation."
category = "Hosting & Cloud Industry"
order = 2132
part = "Kubernetes"
tags = ["kubernetes", "autoscaling", "karpenter", "spot", "cost-allocation", "finops"]
+++

A Kubernetes cluster scales on two levels that know almost nothing about each other. Pods are added and removed by controllers that read a metric and change a replica count or a container's resources; nodes are added and removed by a different controller that reads pods the scheduler couldn't place and buys or returns machines. Neither looks at the bill. Both decide on **requests**, the CPU and memory a pod reserves, not on what it uses, so a cluster can be fully booked and mostly idle at the same time, and the money spent on that idle capacity shows up on an invoice for virtual machines that never mentions a namespace. A store's version of the problem is a sale with a start time, where the capacity has to be there before the traffic arrives ([Capacity Planning for a Sale](/books/commerce/peak-season#capacity-planning-for-a-sale)).

For a provider the stakes run in both directions. The node autoscaler buys the provider's instances, so its choice of instance type, zone and purchase option is the customer's largest line item and the provider's capacity planning problem. The billing shape the provider picks decides who pays for the gap between requests and usage: on a node-billed cluster the customer pays for every idle core, on a pod-billed mode the customer pays for what pods request and the provider owns the packing. And customers who share a cluster across teams need the cost of a node split back to the workloads that used it, which no cloud invoice does unless the provider builds it.

This chapter covers horizontal scaling with the HorizontalPodAutoscaler and KEDA, vertical scaling and in-place resize, node autoscaling with Cluster Autoscaler and Karpenter and the providers' own modes, bin packing and the request gap, spot capacity in clusters, the providers' billing shapes, and cost allocation with OpenCost, Kubecost and the providers' split-cost features. It adds Kubernetes cost dimensions to `usage_events` in [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) and a `cluster_cost_allocations` table. The playbook's [Autoscaling](/docs/operations/kubernetes#autoscaling) and [Observability and Cost](/docs/operations/kubernetes#observability-and-cost) sections own the operating rules; [Cost & FinOps](/docs/operations/cost-and-finops) owns the practice; budgets, anomaly detection and cost exports are [Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills); node pools and control-plane SKUs are [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes)'s.

## How the Providers Do It

| Provider | Node autoscaling | Node-less or pod-billed mode | Spot in clusters | Cost allocation, as of October 2026 |
| --- | --- | --- | --- | --- |
| **Amazon EKS** | Customer-installed Cluster Autoscaler or Karpenter; EKS Auto Mode runs Karpenter-based autoscaling as a managed component | Fargate: one pod per Fargate node, billed per second for vCPU and memory with a one-minute minimum; Auto Mode adds a per-instance management fee to EC2 | EC2 Spot with a two-minute interruption notice; Auto Mode handles interruption notices itself; managed node groups don't need the Node Termination Handler | Split cost allocation data in the Cost and Usage Report: pod-level line items and `aws:eks:*` cost allocation tags, on by default |
| **Google GKE** | Cluster autoscaler per node pool with `balanced` and `optimize-utilization` profiles; node pool auto-creation (node auto-provisioning) on Standard | Autopilot, launched February 24, 2021: billed per second for pod vCPU, memory and disk requests; pod-based billing on the container-optimized compute platform, node-based billing plus a management premium for specific hardware | Spot VMs with a 30-second graceful termination by default, extendable to 120 seconds; PDBs don't apply | Cost allocation in the detailed BigQuery billing export by cluster, namespace, workload and label, based on requests |
| **Azure AKS** | Cluster autoscaler per node pool; node auto-provisioning (NAP) based on Karpenter and the AKS Karpenter provider, preconfigured in AKS Automatic | AKS Automatic manages nodes; no per-pod billing on the pages opened | Spot node pools, secondary pools only, with a taint, no SLA, and `Delete` or `Deallocate` eviction | Cost analysis add-on built on OpenCost, Standard and Premium tiers only |
| **DigitalOcean DOKS** | Cluster autoscaler per node pool, down to zero | None | None documented on the pages opened | None documented on the pages opened |
| **Akamai (Linode) LKE** | Built-in autoscaler per pool, 1 to 100 nodes; minimum 0 on LKE Enterprise | None | None documented on the pages opened | None documented on the pages opened |
| **Oracle OKE** | Cluster Autoscaler as an add-on or self-deployed, managed node pools only, with the `price` expander unsupported | Virtual nodes on enhanced clusters, $0.015 per virtual node-hour on Oracle's price list, with pods paying for the compute they consume | Not covered here | Not covered here |

Three patterns run through the table:

- **The hyperscalers moved from node groups to Karpenter-style provisioning.** AWS built Karpenter, runs it inside Auto Mode, and Microsoft built AKS node auto-provisioning on it; Google's equivalent is node pool auto-creation and Autopilot. The developer clouds autoscale fixed node pools.
- **Every node-less mode bills something other than the VM.** Autopilot bills pod requests, Fargate bills a pod-sized slice, OKE bills a virtual node-hour plus pod compute, and Auto Mode bills a fee per managed instance on top of EC2. Each is the provider selling bin packing as a product.
- **Cost allocation is a billing-export feature, not a cluster feature.** Where it exists, the provider writes namespace and workload into the billing data it already produces (AWS's Cost and Usage Report, Google's BigQuery export, Azure Cost Management); where it doesn't, customers install OpenCost or Kubecost and reconcile against the invoice themselves.

## How Autoscaling Got Here

| Step | When | What it solved | What it cost |
| --- | --- | --- | --- |
| Cluster Autoscaler 1.0.0 | September 28, 2017, alongside Kubernetes 1.8; GA tested at 1,000 nodes with 30 pods each | Nodes added for pending pods and removed when underused, per node group | Node groups must be predefined; the cloud's group API (an Auto Scaling group, a managed instance group) decides the shape |
| AWS Fargate | November 29, 2017 for ECS; EKS on Fargate GA December 3, 2019 | No nodes to scale: each pod gets its own right-sized compute | At EKS launch, 4 vCPU and 30 GB per pod, no persistent volumes, no DaemonSets, privileged pods or HostNetwork, ALB only |
| KEDA | Started by Microsoft and Red Hat in 2019; CNCF Sandbox March 12, 2020, incubating August 18, 2021, graduated August 22, 2023 with 60+ scalers and 45+ production users | Scaling on queue depth and other events, and scale to zero | Another operator and metrics server per cluster |
| GKE Autopilot | February 24, 2021 | Google SREs manage the nodes; billing per second on pod requests | Locked-down nodes; the customer can't tune the machines |
| Karpenter | Launched November 29, 2021 ("ready for production", Apache 2.0); beta v0.32 on October 31, 2023 with `NodePool`, `EC2NodeClass` and `NodeClaim`; core moved to `kubernetes-sigs/karpenter` under SIG Autoscaling (request opened May 31, 2023, closed December 4, 2023); 1.0 on August 14, 2024 | Instances chosen per pending pod from the whole catalog, without node groups, and consolidation of underused nodes | A second provisioning model; AWS warns against running it beside Cluster Autoscaler |
| OpenCost | CNCF Sandbox June 17, 2022; incubating October 25, 2024 | A vendor-neutral way to split cluster cost to workloads | Allocation rules are a choice each tool makes differently |
| In-place pod resize (KEP-1287) | Alpha 1.27, beta 1.33, stable 1.35 (post December 19, 2025) | CPU and memory changed on a running pod without recreating it | Not with swap or the static CPU and Memory Managers; Java and Python need a restart to use new memory |
| IBM buys Kubecost | Announced September 17, 2024, price undisclosed | Kubecost joins IBM's FinOps Suite with Cloudability and Turbonomic | The leading commercial allocation tool now belongs to a large vendor |
| EKS Auto Mode | December 1, 2024 | Karpenter-based compute, storage, load balancing and networking run by AWS | A per-instance fee independent of the EC2 purchase option |
| HPA tolerance and scale to zero | Configurable tolerance first available in 1.33, stable in 1.37; `HPAScaleToZero` beta and on by default in 1.37 | Per-direction thresholds; zero replicas on object or external metrics without an add-on | Scale to zero still can't use CPU or memory, which need a running pod to measure |

## Horizontal Scaling: HPA and KEDA

The HorizontalPodAutoscaler is a control loop in `kube-controller-manager` that runs every 15 seconds by default (`--horizontal-pod-autoscaler-sync-period`). For each target it computes:

```text
desiredReplicas = ceil[ currentReplicas * ( currentMetricValue / desiredMetricValue ) ]
```

and skips any change when the ratio is within the tolerance, 10% by default, cluster-wide through `--horizontal-pod-autoscaler-tolerance` and, since configurable tolerance went stable in 1.37, per direction through `behavior.scaleUp.tolerance` and `behavior.scaleDown.tolerance`. For resource metrics with a utilization target, utilization is a percentage of the containers' **requests**; if a container has no request, the HPA "will not take any action for that metric." That is the mechanical reason behind the playbook's rule that requests must be set and honest.

Metrics come from three aggregated APIs: `metrics.k8s.io` for CPU and memory, usually served by the separate Metrics Server add-on; `custom.metrics.k8s.io` for metrics about Kubernetes objects; and `external.metrics.k8s.io` for anything outside the cluster, such as a queue's depth. Pods that are not ready, or whose latest sample predates readiness, are set aside; pods with missing metrics are assumed to use 100% of the target on a scale-down and 0% on a scale-up, to damp the change. Two cluster-wide flags shape startup: `--horizontal-pod-autoscaler-cpu-initialization-period` (5 minutes) and `--horizontal-pod-autoscaler-initial-readiness-delay` (30 seconds).

The `behavior` field controls the speed. The defaults:

| Direction | Stabilization window | Policies | What it means |
| --- | --- | --- | --- |
| `scaleUp` | 0 seconds | 100% of current replicas or 4 pods per 15 seconds, `selectPolicy: Max` | Up as fast as the metric says, at least doubling or adding four per period |
| `scaleDown` | 300 seconds (`--horizontal-pod-autoscaler-downscale-stabilization`) | 100% per 15 seconds | The highest recommendation in the last five minutes wins, then down to `minReplicas` at once |

`selectPolicy: Min` picks the most conservative policy and `Disabled` turns a direction off. Since 1.37, with the `HPAScaleToZero` gate on by default, `minReplicas: 0` is accepted when at least one object or external metric is configured, and the HPA reports a `ScaledToZero` condition while it holds a workload at zero; resource metrics can't scale to zero because they are only measured on running pods.

**KEDA** fills the gaps the HPA left for years. It has three components: the `keda-operator`, which is "directly responsible for scaling a workload between zero and one replica"; the `keda-metrics-apiserver`, which serves event-source metrics (Kafka, RabbitMQ, SQS and others) as external metrics; and admission webhooks that reject conflicting objects, such as two `ScaledObject`s on one Deployment. "One-to-N and N-to-one scaling is delegated to the Horizontal Pod Autoscaler": a `ScaledObject` creates and owns an HPA. A `ScaledJob` creates Jobs for batch work instead of scaling a Deployment, and a `TriggerAuthentication` holds the credentials for an event source. KEDA's scale to zero also works only with event triggers, not CPU or memory. Azure Container Apps scales on "any KEDA-supported scale trigger," so on Azure KEDA's scaler list is also a product surface.

## Vertical Scaling and In-Place Resize

The VerticalPodAutoscaler lives outside core Kubernetes, in the `kubernetes/autoscaler` repository, and has three parts: a recommender that watches usage and computes requests, an updater that applies them to running pods, and an admission controller that sets them on new pods. Its update modes, as of October 2026:

| Mode | Behavior |
| --- | --- |
| `Off` | Recommendations only, readable on the VPA object |
| `Initial` | Requests set at pod creation, never changed |
| `Recreate` (default) | Evicts and recreates pods whose requests differ significantly from the recommendation, respecting PDBs |
| `InPlaceOrRecreate` | In-place resize first, eviction if it fails; alpha in VPA 1.4.0, beta in 1.5.0, GA in 1.6.0, on Kubernetes 1.33+ |
| `InPlace` | In-place only, never evicts, retries later; alpha in VPA 1.7.0 |
| `Auto` | Deprecated, currently the same as `Recreate` |

The known limitations decide where VPA belongs. It "should not be combined with HPA on the same resource metric"; an HPA on CPU and a VPA on memory, or an HPA on an external metric, can coexist. Recommendations can exceed the largest node's allocatable resources and leave pods pending, which a node autoscaler can't fix; `--container-recommendation-max-allowed-cpu` and `-memory` cap them. Pods without a controller aren't updated, multiple VPAs on one pod are undefined, and the project says VPA "has not been tested in large clusters."

In-place resize is what made the updater less disruptive. With KEP-1287 stable in 1.35, `spec.containers[*].resources` is the desired CPU and memory and is mutable through the `resize` subresource, while `status.containerStatuses[*].resources` is what is applied. Each container's `resizePolicy` says whether a change needs a restart (`NotRequired` or `RestartContainer`). The kubelet reports `PodResizePending` with reason `Infeasible` (more than the node has) or `Deferred` (possible later, retried by priority and QoS), and `PodResizeInProgress` while it applies the change. Memory-limit decreases became allowed at GA, but the kubelet's check that usage is below the new limit is "best-effort and not guaranteed." Resize is prohibited with swap, the static CPU Manager and the static Memory Manager, other resources stay immutable, and "Java and Python runtimes do not support resizing memory without restart."

GKE Autopilot enables vertical pod autoscaling by default, which fits its billing: on a pod-billed mode the VPA's recommendation is the customer's price.

## Node Autoscaling: Cluster Autoscaler and Karpenter

**Cluster Autoscaler** scales node groups it is told about: sets of machines "with identical capacity and labels," usually one cloud Auto Scaling group or managed instance group each. It never creates a group. Every 10 seconds (`--scan-interval`) it looks for unschedulable pods, simulates them against a template node for each group, and asks the expander to pick a group when several fit: `random`, `most-pods`, `least-waste` (the default: least idle CPU, then memory, after scale-up), `least-nodes`, `price` or `priority`, plus `grpc` for an external expander. Scale-down takes a node whose requested CPU and memory are below 50% of allocatable (`--scale-down-utilization-threshold`), whose pods can all move elsewhere, after it has been unneeded for 10 minutes (`--scale-down-unneeded-time`) and no scale-up has happened for 10 minutes (`--scale-down-delay-after-add`); it removes non-empty nodes one at a time and empty ones in bulk. A node stays when a restrictive PDB, a `kube-system` pod without a permissive PDB, a pod with local storage, a pod with no controller, or `cluster-autoscaler.kubernetes.io/safe-to-evict: "false"` stands in the way.

Every provider that offers Cluster Autoscaler wraps it differently. GKE runs it per node pool with a `balanced` profile that keeps headroom and an `optimize-utilization` profile that removes underused nodes faster, and states that decisions are based "on the resource requests (rather than actual resource utilization)." OKE runs it as an add-on or a standalone deployment, on managed node pools only, without `--expander=price` or node autoprovisioning, recommends one pool outside its control for critical add-ons, and leaves its upgrades to the customer. DOKS scales pools down to zero, capped by the account's Droplet limit (25 by default), and recommends keeping one fixed node; LKE has its own pool autoscaler from 1 to 100 nodes, with a minimum of 0 on LKE Enterprise.

**Karpenter** drops the node group. It watches pods with `Unschedulable=True`, checks their requirements (node affinity, selectors, requests, tolerations) against `NodePool` constraints, and "manages each instance directly, without use of additional orchestration mechanisms like node groups." Three objects carry it:

- **`NodePool`**: what Karpenter may launch (instance families, capacity types such as spot and on-demand, zones, architectures, limits, weights) and its `disruption` settings.
- **`EC2NodeClass`** (on AWS; `AKSNodeClass` on Azure): the provider-specific part, such as images, subnets and security groups.
- **`NodeClaim`**: one requested node, created and deleted by Karpenter, the record of what it launched.

Disruption is where Karpenter differs most, and its docs (v1.15 as of October 2026) name the methods. Graceful methods run one at a time, in order: node auto repair, drift (the node no longer matches its NodePool or NodeClass) and consolidation. Forceful methods start draining at once and ignore budgets: expiration and interruption. Consolidation follows `consolidationPolicy`: `WhenEmpty` removes only empty nodes, `WhenEmptyOrUnderutilized` deletes or replaces any node when that lowers cost, and a third value, `Balanced`, is also accepted; `consolidateAfter` sets how long a node must be stable first, or `Never`. It tries empty-node deletion, then multi-node and single-node consolidation. Spot nodes only get deletion consolidation by default; replacing one spot node with a cheaper one needs the `SpotToSpotConsolidation` flag and at least 15 candidate instance types. Disruption budgets default to `nodes: 10%`, can be a count or percentage per reason (`Drifted`, `Underutilized`, `Empty`, `Unhealthy`) and can apply on a cron `schedule` for a `duration`. Pods block voluntary disruption with `karpenter.sh/do-not-disrupt` (permanently or for a duration after start), and blocking PDBs stop evictions; a NodePool's `terminationGracePeriod` bounds how long a drain may wait before pods are force-deleted.

Karpenter now runs inside two providers' products. EKS Auto Mode is "relying on Karpenter auto scaling," with AWS-managed `NodePool`s and node classes beside any the customer adds, Bottlerocket-based nodes and a 21-day maximum node lifetime. AKS node auto-provisioning "automatically deploys, configures, and manages Karpenter" on the cluster from the open-source Karpenter and AKS Karpenter provider projects, with `NodePool` and `AKSNodeClass`, and is preconfigured in AKS Automatic; it doesn't support Windows pools or IPv6 clusters, and a NAP cluster can't be stopped. GKE's answer is its own: node pool auto-creation creates and deletes node pools for pending pods, cluster-wide within CPU and memory limits or per workload through a `ComputeClass`, and inherits "all of the limitations of the cluster autoscaler."

## Bin Packing and the Request Gap

The scheduler, every node autoscaler above and every provider's billing all read requests. A node is "full" when the requests on it reach its allocatable capacity, whatever the pods use. Three gaps open between what is paid for and what runs:

- **Requests above usage.** A pod that requests two cores and uses half of one holds a core and a half that no other pod can have. The node autoscaler buys nodes for the requests. This is the gap the playbook's [Observability and Cost](/docs/operations/kubernetes#observability-and-cost) section calls "almost always" the waste, and the VPA's recommender exists to close it.
- **Allocatable above requests.** Space left over when the remaining pods don't fit: half a node free in CPU but out of memory, or capacity held by a pod that Cluster Autoscaler can't move. Expanders such as `least-waste`, Karpenter's consolidation and GKE's `optimize-utilization` profile all attack this one.
- **Capacity above allocatable.** What the node reserves for the kubelet, the runtime and the operating system. GKE's cost allocation reports it as `kube:system-overhead`, AKS's as system charges.

The provider sees the same gaps from the other side. On node-billed clusters, all three are the customer's spend and the provider's revenue. On a pod-billed mode they reverse: the customer pays for requests, so the first gap stays the customer's, but the second and third become the provider's cost, and how well the provider packs pods onto its machines is its margin. That is why Fargate sells only supported vCPU and memory combinations (0.25 vCPU with 0.5 to 2 GB, 1 vCPU with 2 to 8 GB, and so on) and why Google keeps a pool of pre-provisioned capacity and nodes that resize while running on the container-optimized compute platform.

## Spot Capacity in Clusters

Spot and preemptible capacity is the provider's spare inventory at a discount, reclaimable at short notice, and a cluster is the natural place to use it: replicas can be spread across nodes and rescheduled when one goes. The notice and its delivery differ by provider:

- **AWS** sends an interruption notice "two minutes before Amazon EC2 stops or terminates your Spot Instance," as an EventBridge event (`EC2 Spot Instance Interruption Warning`) and as the `spot/instance-action` item in instance metadata, on a best-effort basis; AWS recommends checking every 5 seconds. Rebalance recommendations are earlier, weaker signals. Fargate Spot, for ECS only, runs interruption-tolerant tasks at "up to a 70% discount."
- **Google** gives GKE Spot VMs a 30-second graceful termination by default, about 15 seconds for regular pods and 15 for system pods, extendable to 120 seconds; Spot VMs "have no availability guarantees," and nodes carry `cloud.google.com/gke-spot=true`.
- **Azure** backs AKS Spot node pools with Spot scale sets that have no SLA. They can only be secondary pools, carry the `kubernetes.azure.com/scalesetpriority=spot:NoSchedule` taint so only tolerant pods land there, take a max price (`-1` means never evicted on price) and evict by `Delete` or `Deallocate`, where deallocated nodes still count against compute quota.

Someone must turn the notice into a cordon and drain before the machine goes. On AWS that is the Node Termination Handler, in IMDS mode as a DaemonSet polling metadata or in Queue Processor mode reading an SQS queue fed by EventBridge; AWS says managed node groups don't need it. Karpenter does the same from its own SQS queue (`--interruption-queue`) for spot warnings, scheduled maintenance, state changes and failed status checks, but treats rebalance recommendations as events only; EKS Auto Mode handles interruption notices for its nodes.

The trap is PodDisruptionBudgets. A PDB limits voluntary evictions (a drain, a consolidation, an upgrade), not a machine taken back: GKE states that Spot reclamation "is involuntary and is not covered by the guarantees" of PDBs, and Karpenter's interruption handling is a forceful method that budgets don't rate-limit. Two minutes, or thirty seconds, is the whole graceful shutdown, so the playbook's [graceful shutdown](/docs/operations/kubernetes#graceful-shutdown) and [rollouts and disruptions](/docs/operations/kubernetes#rollouts-and-disruptions) rules must already fit inside it. Spot in a cluster is for replicas spread across nodes and zones with an on-demand floor beneath them, not for the last replica of anything.

## How Providers Bill Clusters

The billing shape is the provider's decision about who owns the packing:

| Shape | Who pays for idle capacity | Examples, as of October 2026 |
| --- | --- | --- |
| **Nodes plus a control-plane fee** | The customer: every VM bills whether pods use it or not | EKS, GKE Standard and AKS node pools at VM prices; DOKS, LKE and OKE managed pools; control-plane fees are [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#how-the-providers-do-it)'s |
| **Nodes plus a management fee** | The customer, plus a fee per managed node | EKS Auto Mode: billed per second with a one-minute minimum, by instance type, "independent of the EC2 instance purchase option" (US West, Oregon: $0.03672 per hour on a c6a.2xlarge whose EC2 price is $0.306); GKE node-based billing for specific hardware adds "a node management premium"; ECS Managed Instances charges a similar per-instance fee |
| **Pod requests** | The provider, for everything outside the pods' requests | GKE Autopilot, "billed per second for vCPU, memory and disk resource requests" at launch, now pod-based billing on the container-optimized compute platform |
| **Pod-sized compute** | The provider | Fargate: per vCPU, memory and storage, per second with a one-minute minimum (five for Windows), "from when the container image download starts until the task or pod terminates"; in US East (N. Virginia), Linux on x86, $0.000011244 per vCPU-second and $0.000001235 per GB-second |
| **Virtual nodes** | The provider, with a per-node charge | OKE virtual nodes, $0.015 per virtual node-hour on enhanced clusters, pods paying for "the exact compute resources consumed" |

Commitments interact with each shape differently. A Compute Savings Plan applies across EC2 instance families, Fargate and Lambda, so a customer can commit before choosing between node and pod billing, but the Auto Mode fee is charged regardless of purchase option, and a spot node is discounted capacity with no commitment at all. Commitments come after rightsizing, as the playbook's [levers](/docs/operations/cost-and-finops#the-levers-that-actually-matter) order them; their mechanics are [Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#resource-and-spend-commitments)'s.

## Cost Allocation

A cluster's invoice lists nodes, disks, load balancers and a control plane. The playbook's rule that [every dollar has an owner](/docs/operations/cost-and-finops#every-dollar-has-an-owner) can't be met from that invoice alone: splitting it to namespaces and workloads takes three decisions that every tool makes, and makes differently:

- **The basis.** Requests, usage, or the larger of the two. The OpenCost specification says workload cost "should be understood as max(request, usage)" for CPU and memory, so a pod pays for what it reserved and for any burst above it. GKE's allocation is "based on resource requests, not resources consumed." AWS's split cost allocation data allocates each instance's amortized cost by "the percentage of CPU and memory resources consumed by the containers."
- **Idle.** Capacity no workload claimed. OpenCost defines cluster idle cost as asset costs minus workload costs and keeps it separate, to be distributed "optionally" among tenants, evenly, in proportion to consumption, or by a custom metric. GKE reports `kube:unallocated` and `kube:system-overhead`; AKS reports idle, system, service and unallocated charges.
- **Overhead.** Costs that belong to the cluster rather than a node: OpenCost's examples are cluster management fees and operator fees. A control-plane fee or an extended-support surcharge has no pod to land on.

The providers' features, as of October 2026:

- **AWS split cost allocation data** adds ECS task and EKS pod line items to the Cost and Usage Report: two usage records per pod per hour for CPU and memory, three on accelerated instances (NVIDIA and AMD GPUs, Trainium, Inferentia). It creates the cost allocation tags `aws:eks:cluster-name`, `aws:eks:namespace`, `aws:eks:node`, `aws:eks:workload-type`, `aws:eks:workload-name` and `aws:eks:deployment`, enabled by default.
- **GKE cost allocation** writes `goog-k8s-cluster-name`, `k8s-namespace`, `k8s-workload-type`, `k8s-workload-name` and `k8s-label/<key>` into the detailed BigQuery export. Data takes up to three days to appear, isn't backfilled, and a pod with more than 50 labels contributes none of them; persistent disk cost follows the pod that claims the volume, and a retained volume whose claim is gone is unallocated.
- **AKS cost analysis** is an add-on "built on top of OpenCost," reconciled with the Azure invoice, on Standard and Premium tiers only and for Enterprise Agreement and Microsoft Customer Agreement offers; it supports about 7,000 containers per cluster at its 4 GB memory limit, and data arrives in 8 to 24 hours.

The open-source and commercial layer is OpenCost and Kubecost. OpenCost "provides visibility into current and historical Kubernetes spend and resource allocation"; Kubecost launched it, its commercial product is built on it, the CNCF accepted it on June 17, 2022 and moved it to incubating on October 25, 2024. Kubecost raised a $5.5 million seed in 2021 and a $25 million Series A in 2022, and IBM announced its acquisition on September 17, 2024, without a price, to join Cloudability and Turbonomic in its FinOps Suite. A provider whose clusters lack allocation in its billing export sends its customers to these tools, which run in the customer's cluster and report the agent's view of cost unless it is reconciled with the invoice, as the AKS add-on does.

## The Alternatives

| Choice | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **HPA on CPU or memory** | Replicas from utilization of requests | Built in; no add-ons beyond Metrics Server | Lags the real bottleneck; no scale to zero; useless without requests | Kubernetes | Free | Stateless services by default |
| **HPA on custom or external metrics** | Replicas from object or external metrics | The signal tied to the work; scale to zero since 1.37 (beta) | Needs a metrics adapter per source | Kubernetes | Free; the adapter | Teams with a metrics pipeline |
| **KEDA** | Operator, metrics server and an HPA per `ScaledObject` | 60+ event scalers at graduation, scale to zero, Jobs per event | Another control plane component; credentials per source | CNCF graduated; started by Microsoft and Red Hat | Free | Queue and event workers; Azure Container Apps |
| **VPA** | Recommender, updater, admission controller | Closes the request gap; recommendations without action in `Off` | Can't share CPU or memory with an HPA; recommendations beyond node size; untested at large scale | Kubernetes SIG Autoscaling | Free | Right-sizing; on by default in Autopilot |
| **Cluster Autoscaler** | Scales predefined node groups | Works on every provider's node pools; well understood | Groups must be designed in advance; slow to change shape; one non-empty node removed at a time | Kubernetes SIG Autoscaling | Free | GKE, AKS, DOKS, OKE pools; self-managed clusters |
| **Karpenter** | `NodePool`s, provider node classes, `NodeClaim`s; no node groups | Picks instance types per demand; consolidation; budgets by reason and schedule | AWS and Azure providers only on the opened pages; consolidation churn without budgets | Apache 2.0; core under SIG Autoscaling; AWS originated | Free; the instances | EKS, EKS Auto Mode, AKS NAP |
| **Pod-billed modes** (Autopilot, Fargate, OKE virtual nodes) | The provider runs nodes; the customer pays for pod requests or slices | No node autoscaling to run; the packing gap is the provider's | Less control over hardware; restrictions on DaemonSets, privilege and storage | Provider | Pod requests or slices | Teams without a platform group |
| **Provider cost allocation** (AWS split cost data, GKE allocation, AKS cost analysis) | Kubernetes dimensions in the billing export | Reconciled with the invoice; no agent, or a managed one | Each uses a different basis; label limits; delays of hours to days | Provider | Free or included; BigQuery or storage costs | Customers of that provider |
| **OpenCost** | In-cluster agent and an allocation spec | Vendor-neutral; idle and overhead explicit | The agent's numbers, not the invoice's, unless reconciled; one more workload | CNCF incubating; Kubecost originated | Free | Self-managed clusters; the base of AKS cost analysis and Kubecost |
| **Kubecost** | Commercial product on OpenCost | Multi-cluster views, recommendations | Vendor product; now IBM's roadmap | IBM since 2024 | Commercial | Enterprises with many clusters |

## My Default

For a provider, my default managed cluster offers Karpenter-style provisioning as a managed component, the way Auto Mode and AKS node auto-provisioning do, with Cluster Autoscaler for customers who want fixed node pools, because node groups make the customer design the bin packing the provider's catalog could do better. I'd ship KEDA as a supported add-on, since event-driven scaling and scale to zero are what customers otherwise install themselves, and I'd put Kubernetes cost dimensions into the billing export from day one, with the basis stated (requests, usage or the larger) and idle, system overhead and cluster fees as their own rows, as GKE and AKS do. If I sold a pod-billed mode, I'd price it knowing the packing gap is mine and set minimum request sizes and a rounding rule that are published, not discovered.

For customers, the first question is whether to run the autoscalers at all. Most rows in the table above are components someone installs, tunes, upgrades and watches (the wider list is [What You Still Own on a Managed Cluster](/books/hosting-and-cloud/managed-kubernetes#what-you-still-own-on-a-managed-cluster)), and bin packing only pays once there are enough workloads to pack and someone to keep requests honest. Without a platform team, my default is a pod-billed mode or, a step further, a managed container service or PaaS that scales on requests and bills for what runs, where the packing gap is the provider's problem ([Distributions & Alternatives](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#my-default) has the wider stance).

With a platform team, and with enough services that packing them is worth money, my default on the cluster is an HPA on the metric that saturates first, KEDA for queue workers and anything that should reach zero, the VPA in `Off` or `Initial` mode to produce request recommendations people act on, and `InPlaceOrRecreate` only for workloads whose runtime can use resized memory. Nodes come from Karpenter or the provider's Karpenter-based mode where one exists, with disruption budgets set before consolidation is turned on, and from Cluster Autoscaler with the `least-waste` expander elsewhere. Spot carries stateless replicas spread across zones above an on-demand floor, with interruption handling in place and shutdown paths that fit in thirty seconds. Allocation uses max(request, usage) with idle shown, not hidden.

Two tradeoffs would change this. Steady load: a cluster whose size barely moves gets more from a commitment and fixed, right-sized pools than from any autoscaler, and the money is in the request gap, not the scaling. And scale in the other direction: a managed container service's per-unit price is a markup on the capacity underneath, so a fleet large and steady enough that the markup outgrows the cost of the people who'd run a cluster is the point where the cluster, and these autoscalers, start paying for themselves (the same turn [PaaS & Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds#my-default) describes for platforms).

## How to Build It

The chapter adds Kubernetes cost dimensions to `usage_events`, a list of which labels count as cost dimensions, and `cluster_cost_allocations`, a derived table that splits each rated node, volume or cluster fee to the workloads that used it. Clusters are [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture)'s `clusters (resource_id)`; nodes are resources of kind `virtual_machine` in [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes)'s node pools; claims are [Storage & Stateful Workloads](/books/hosting-and-cloud/kubernetes-storage)'s `persistent_volume_claims`; rating runs belong to [Metering & Rating](/books/hosting-and-cloud/metering-and-rating#rating-from-events-to-money); budgets and exports to [Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills).

The dimension convention: every event whose `meter` starts with `k8s.` describes one pod (or claim) over its window, and carries in `dimensions`:

| Key | Value |
| --- | --- |
| `cluster_id` | The cluster's resource id |
| `node_id` | The node's resource id (kind `virtual_machine`); absent on node-less modes |
| `namespace` | The pod's namespace |
| `pod_uid` | The pod's Kubernetes uid |
| `workload_kind`, `workload_name` | The top-level owner: a `Deployment` rather than its `ReplicaSet`, a `CronJob` rather than its `Job`; absent for bare pods |
| `capacity_type` | `on_demand`, `spot` or `reserved`, copied from the node |
| `pvc_id` | For claim meters, the `persistent_volume_claims` row |
| `labels` | Only the keys promoted in `cost_allocation_label_keys`, as an object |

The meters are pairs, so either basis can be computed later: `k8s.pod.cpu_request.core_seconds` and `k8s.pod.cpu_usage.core_seconds`, `k8s.pod.memory_request.byte_seconds` and `k8s.pod.memory_usage.byte_seconds`, `k8s.pod.gpu_request.device_seconds`, and `k8s.pvc.requested.byte_seconds`. On node-billed clusters they rate to nothing on their own; they are allocation inputs. On a pod-billed mode the request meters are what a SKU rates, with the mode's minimum and increment on `skus.min_billable` and `skus.billing_increment`.

```sql
ALTER TABLE usage_events                 -- the core table; the convention is enforced
  ADD CONSTRAINT usage_events_k8s_dimensions_check CHECK (
    meter NOT LIKE 'k8s.%' OR (
      dimensions ? 'cluster_id' AND dimensions ? 'namespace' AND
      (dimensions ? 'pod_uid' OR dimensions ? 'pvc_id')));

CREATE INDEX usage_events_k8s_allocation_idx ON usage_events
  (((dimensions ->> 'cluster_id')::uuid), (dimensions ->> 'namespace'),
   lower(occurred_during))
  WHERE meter LIKE 'k8s.%';              -- allocation reads one cluster and hour at a time

CREATE INDEX usage_events_k8s_labels_idx ON usage_events
  USING GIN ((dimensions -> 'labels') jsonb_path_ops)
  WHERE meter LIKE 'k8s.%';              -- "everything labelled team=payments"

CREATE TABLE cost_allocation_label_keys (  -- which Kubernetes labels are cost dimensions
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  cluster_id    UUID REFERENCES clusters (resource_id),  -- null: every cluster in the account
  label_key     TEXT NOT NULL,           -- 'team', 'app.kubernetes.io/part-of'
  valid_during  TSTZRANGE NOT NULL,      -- promoted from; never backfilled
  EXCLUDE USING GIST (account_id WITH =, (COALESCE(cluster_id::text, '')) WITH =,
    label_key WITH =, valid_during WITH &&)
);

CREATE TABLE cluster_cost_allocations (  -- rated cost split to workloads, idle and overhead
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  cluster_id         UUID NOT NULL REFERENCES clusters (resource_id),
  rated_usage_id     UUID NOT NULL REFERENCES rated_usage (id),  -- the node, volume or fee split
  allocated_during   TSTZRANGE NOT NULL,   -- the hour, inside the rated window
  cost_component     TEXT NOT NULL CHECK (cost_component IN ('cpu', 'memory', 'gpu',
                       'storage', 'node_fee', 'control_plane')),
  share_kind         TEXT NOT NULL CHECK (share_kind IN ('workload', 'idle',
                       'system_overhead', 'cluster_overhead', 'unallocated')),
  namespace          TEXT,                 -- null except for workload shares
  workload_kind      TEXT,
  workload_name      TEXT,
  labels             JSONB NOT NULL DEFAULT '{}',  -- promoted keys only
  basis              TEXT NOT NULL CHECK (basis IN ('request', 'usage', 'max_request_usage',
                       'capacity')),       -- 'capacity' for idle and overhead rows
  requested_quantity NUMERIC,              -- core-seconds, byte-seconds, from usage_events
  used_quantity      NUMERIC,
  allocated_quantity NUMERIC NOT NULL CHECK (allocated_quantity >= 0),
  currency           CHAR(3) NOT NULL,
  amount             NUMERIC(24,6) NOT NULL,  -- unrounded, like rated_usage
  method_version     TEXT NOT NULL,        -- the written allocation rule in force
  rating_run_id      UUID NOT NULL,        -- the run that rated and split it; reruns diff
  CHECK ((share_kind = 'workload') = (namespace IS NOT NULL)),
  CHECK (workload_name IS NULL OR workload_kind IS NOT NULL),
  CHECK (share_kind = 'workload' OR basis = 'capacity'),
  UNIQUE NULLS NOT DISTINCT (rated_usage_id, rating_run_id, allocated_during, cost_component,
    share_kind, namespace, workload_kind, workload_name)
);

CREATE INDEX cluster_cost_allocations_report_idx ON cluster_cost_allocations
  (account_id, cluster_id, lower(allocated_during));

-- The invariant every run must pass: a rated row is split exactly, no more, no less.
SELECT r.id, r.amount, SUM(a.amount) AS allocated
FROM rated_usage r
JOIN cluster_cost_allocations a
  ON a.rated_usage_id = r.id AND a.rating_run_id = r.rating_run_id
WHERE r.rating_run_id = :run
GROUP BY r.id, r.amount
HAVING SUM(a.amount) <> r.amount;
```

Notes on the sketch:

- **Allocation is derived, like rating.** Raw request and usage events stay as received; `cluster_cost_allocations` is a function of them, the rated rows and a versioned rule, produced in the same run as the `rated_usage` it splits. Fixing a rule is a rerun and a diff, never an edit, which is the foundation's rule for [usage](/books/hosting-and-cloud/hosting-and-cloud-business#tenancy-money-and-time) applied one level down.
- **Record both meters, choose the basis per run.** Because requests and usage are both kept, the same data serves a provider that allocates on requests like GKE, one that follows OpenCost's max(request, usage), and a customer who wants to compare them; `basis` and `method_version` say which rule produced each row.
- **Idle, overhead and unallocated are rows, not remainders.** A node's unclaimed capacity, its system reservation, the control-plane fee and a retained volume with no claim each get their own `share_kind`, so the split always sums to the bill (the invariant query) and "idle" is a number someone can be shown. Distributing them to tenants is a report over these rows, as OpenCost leaves it optional.
- **Labels are promoted, not harvested.** Only keys in `cost_allocation_label_keys` reach `dimensions.labels`, effective from when they were promoted, which bounds cardinality (GKE drops all labels on a pod with more than 50) and matches AWS's activated cost allocation tags. A key promoted today doesn't rewrite last month.
- **The workload is the top-level owner.** Pods are cattle and ReplicaSets are rollout artifacts; cost reported per `Deployment`, `StatefulSet` or `CronJob` survives a rollout, which is why AWS fills `aws:eks:deployment` only for ReplicaSets and GKE reports the workload type and name.
- **Capacity type travels with the event.** A spot node's discount should land on the workloads that ran there, so `capacity_type` is copied at measurement time; the node's purchase option is `virtual_machines.purchase_option` in the core model.
- **Events:** `allocation.completed` per cluster and run, `allocation.mismatch` when the invariant fails, and `node.interruption_notice` and `node.consolidated` from the node autoscaler go through the outbox to cost exports, notifications and support.

## Auditing

- **Every allocation run and its rule.** Which `method_version` produced which rows from which rating run, so a team disputing its share can be shown the rule and the inputs, and a changed rule shows as a diff.
- **The invariant, per run.** That allocations sum to rated cost for every rated row; a run that fails it is not published to customers.
- **Label promotions.** When each key became a cost dimension and who promoted it, since reports before that date can't group by it.
- **Node autoscaler decisions.** Which nodes were launched, consolidated, expired or interrupted, with the reason, because "why did my pod restart at 03:00" and "why did my bill double" are both answered there.
- **Spot interruptions and their notice.** When each notice arrived and when the node went, per provider region and instance type, to show whether shutdown paths fit inside the notice.

## What This Means for the System You Build

- **Treat requests as the price signal,** because the scheduler, every autoscaler and every pod-billed mode read them, and usage only matters through them.
- **Scale pods on the metric that saturates first,** with KEDA for events and scale to zero, and keep the VPA producing recommendations even where it can't apply them.
- **Prefer provisioning from the catalog over node groups,** with disruption budgets set before consolidation runs.
- **Use spot for spread replicas above an on-demand floor,** with interruption handling and shutdowns that fit the notice; PDBs don't protect against reclamation.
- **Choose the billing shape knowing who owns the packing,** and publish the minimums and rounding of any pod-billed mode.
- **Put Kubernetes dimensions in the billing export,** with the basis stated and idle, system overhead and cluster fees as their own lines.
- **Keep request and usage meters both,** so allocation can be rerun under a different rule.
- **Make allocations sum to the bill,** every run, and show customers the rule that split it.

## References

**Reference**

- [Kubernetes: Horizontal Pod Autoscaling](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/), the algorithm, 15-second sync, metrics APIs, missing and not-ready pods, initialization flags, tolerance stable in 1.37, behavior defaults, `selectPolicy`, `HPAScaleToZero` beta in 1.37
- [Kubernetes: Resize CPU and memory resources assigned to containers](https://kubernetes.io/docs/tasks/configure-pod-container/resize-container-resources/), the `resize` subresource, `resizePolicy`, `PodResizePending` and `PodResizeInProgress`
- [KEDA: Concepts](https://keda.sh/docs/latest/concepts/), the operator, metrics server and admission webhooks, `ScaledObject`, `ScaledJob`, `TriggerAuthentication`, zero-to-one scaling and HPA delegation
- [Vertical Pod Autoscaler README](https://github.com/kubernetes/autoscaler/blob/master/vertical-pod-autoscaler/README.md), recommender, updater and admission controller
- [VPA quick start](https://raw.githubusercontent.com/kubernetes/autoscaler/master/vertical-pod-autoscaler/docs/quickstart.md), update modes and `Auto` deprecated
- [VPA features](https://raw.githubusercontent.com/kubernetes/autoscaler/master/vertical-pod-autoscaler/docs/features.md), `InPlaceOrRecreate` alpha 1.4.0, beta 1.5.0, GA 1.6.0, `InPlace` alpha 1.7.0
- [VPA known limitations](https://raw.githubusercontent.com/kubernetes/autoscaler/master/vertical-pod-autoscaler/docs/known-limitations.md), HPA conflict, pending pods, max-allowed flags, scale
- [Cluster Autoscaler FAQ](https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/FAQ.md), node groups, scan interval, scale-down thresholds and delays, blockers, expanders and the `least-waste` default
- [Karpenter: Concepts](https://karpenter.sh/docs/concepts/), unschedulable pods, NodePool constraints, no node groups
- [Karpenter: Disruption](https://karpenter.sh/docs/concepts/disruption/), methods, consolidation policies, budgets, interruption queue, `do-not-disrupt`, `terminationGracePeriod`, PDBs
- [OpenCost specification](https://opencost.io/docs/specification), asset and workload costs, max(request, usage), idle, overhead and distribution

**Provider documentation**

- [Amazon EKS: Automate cluster infrastructure with EKS Auto Mode](https://docs.aws.amazon.com/eks/latest/userguide/automode.html), Karpenter-based autoscaling, NodePools and NodeClasses, 21-day node lifetime, Bottlerocket nodes, spot interruption handling
- [Amazon EKS pricing](https://aws.amazon.com/eks/pricing/), the Auto Mode fee per instance, per second with a one-minute minimum, the c6a.2xlarge example, independence from purchase option
- [AWS Fargate pricing](https://aws.amazon.com/fargate/pricing/), per-second billing from image download, one-minute minimum, five for Windows, US East rates, Fargate Spot up to 70% off
- [Amazon ECS pricing](https://aws.amazon.com/ecs/pricing/), the ECS Managed Instances per-instance fee
- [Amazon EC2: Spot Instance interruption notices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-instance-termination-notices.html), the two-minute notice, the EventBridge event, `spot/instance-action`, checking every 5 seconds
- [AWS Node Termination Handler](https://github.com/aws/aws-node-termination-handler), IMDS and Queue Processor modes, cordon and drain, not needed with managed node groups
- [AWS: Understanding split cost allocation data](https://docs.aws.amazon.com/cur/latest/userguide/split-cost-allocation-data.html), pod-level CUR records, accelerator records, the `aws:eks:*` tags
- [AWS Savings Plans: What is Savings Plans](https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html), Compute Savings Plans across EC2, Fargate and Lambda
- [Google Cloud: GKE Autopilot overview](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview), pod-based and node-based billing, the container-optimized compute platform, vertical pod autoscaling on by default
- [Google Cloud: About GKE cluster autoscaling](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler), per node pool, `balanced` and `optimize-utilization`, location policy, decisions on requests
- [Google Cloud: Node pool auto-creation](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/node-auto-provisioning), ComputeClasses, cluster-wide limits, the cluster autoscaler's limitations
- [Google Cloud: Spot VMs in GKE](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/spot-vms), 30-second termination, 120-second option, no availability guarantee, labels, PDBs
- [Google Cloud: GKE cost allocation](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/cost-allocations), request basis, export labels, overhead and unallocated values, limitations
- [Microsoft Learn: Node auto-provisioning in AKS](https://learn.microsoft.com/en-us/azure/aks/node-auto-provisioning), Karpenter and the AKS provider, `NodePool` and `AKSNodeClass`, AKS Automatic, limitations
- [Microsoft Learn: Azure Spot node pools in AKS](https://learn.microsoft.com/en-us/azure/aks/spot-node-pool), no SLA, secondary pools, taint, max price, eviction policies
- [Microsoft Learn: AKS cost analysis](https://learn.microsoft.com/en-us/azure/aks/cost-analysis), built on OpenCost, tiers, offers, charge types, container limit, data delay
- [Microsoft Learn: Azure Container Apps overview](https://learn.microsoft.com/en-us/azure/container-apps/overview), scaling on any KEDA-supported scaler
- [DigitalOcean: Autoscale a DOKS cluster](https://docs.digitalocean.com/products/kubernetes/how-to/autoscale/), node pools to zero, the Droplet limit, PDBs
- [Akamai: Manage nodes and node pools](https://techdocs.akamai.com/cloud-computing/docs/manage-nodes-and-node-pools), the LKE pool autoscaler bounds and behavior
- [Oracle: Using the Kubernetes Cluster Autoscaler](https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengusingclusterautoscaler.htm), add-on and standalone modes, managed node pools only, unsupported parameters, recommendations
- [Oracle: Working with virtual nodes](https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengworkingwithvirtualnodes.htm), serverless node pools and per-pod pricing

**Pricing**

- [Oracle Cloud price list API](https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/?currencyCode=USD), OKE virtual nodes at $0.015 per node-hour (part B96109)

**Announcements and history**

- [Cluster Autoscaler 1.0.0 release](https://github.com/kubernetes/autoscaler/releases/tag/cluster-autoscaler-1.0.0), September 28, 2017, GA at 1,000 nodes with 30 pods each
- [AWS News Blog: Introducing AWS Fargate](https://aws.amazon.com/blogs/aws/aws-fargate/), November 29, 2017
- [AWS News Blog: Amazon EKS on AWS Fargate now generally available](https://aws.amazon.com/blogs/aws/amazon-eks-on-aws-fargate-now-generally-available/), December 3, 2019, profiles, a node per pod, launch limits
- [CNCF: KEDA graduation](https://www.cncf.io/announcements/2023/08/22/cloud-native-computing-foundation-announces-graduation-of-kubernetes-autoscaler-keda/), August 22, 2023, Microsoft and Red Hat origin, 60+ scalers, 45+ production users
- [CNCF: KEDA project page](https://www.cncf.io/projects/keda/), Sandbox March 12, 2020 and incubating August 18, 2021
- [Google Cloud blog: Introducing GKE Autopilot](https://cloud.google.com/blog/products/containers-kubernetes/introducing-gke-autopilot/), February 24, 2021, per-second billing on pod requests, SRE-managed nodes
- [AWS News Blog: Introducing Karpenter](https://aws.amazon.com/blogs/aws/introducing-karpenter-an-open-source-high-performance-kubernetes-cluster-autoscaler/), November 29, 2021, ready for production, Apache 2.0, not alongside Cluster Autoscaler
- [AWS Containers blog: Karpenter graduates to beta](https://aws.amazon.com/blogs/containers/karpenter-graduates-to-beta/), October 31, 2023, v0.32, NodePool, EC2NodeClass, NodeClaim, the `disruption` block, donation to SIG Autoscaling
- [kubernetes/org#4258: Migrate aws/karpenter-core](https://github.com/kubernetes/org/issues/4258), opened May 31, 2023, closed December 4, 2023, to kubernetes-sigs/karpenter under SIG Autoscaling
- [AWS What's New: Karpenter 1.0](https://aws.amazon.com/about-aws/whats-new/2024/08/karpenter-1-0/), August 14, 2024, stable APIs and budgets by reason
- [AWS News Blog: Amazon EKS Auto Mode](https://aws.amazon.com/blogs/aws/streamline-kubernetes-cluster-management-with-new-amazon-eks-auto-mode/), December 1, 2024, the management fee on top of EC2
- [Kubernetes blog: In-place pod resize GA in 1.35](https://kubernetes.io/blog/2025/12/19/kubernetes-v1-35-in-place-pod-resize-ga/), December 19, 2025, alpha 1.27, beta 1.33, memory-limit decreases, limitations, VPA integration
- [KEP-1287: In-place update of pod resources](https://raw.githubusercontent.com/kubernetes/enhancements/master/keps/sig-node/1287-in-place-update-pod-resources/kep.yaml), stage history
- [CNCF: OpenCost project page](https://www.cncf.io/projects/opencost/), accepted June 17, 2022, incubating October 25, 2024
- [TechCrunch: IBM acquires Kubecost](https://techcrunch.com/2024/09/17/ibm-acquires-kubernetes-cost-optimization-startup-kubecost/), September 17, 2024, undisclosed price, FinOps Suite, funding rounds, OpenCost as Kubecost's core
