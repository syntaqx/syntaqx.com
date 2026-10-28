+++
title = "Kubernetes Architecture"
description = "The control loop, API server and etcd, the scheduler, controllers, kubelet and CRI, CRDs and operators, release cadence, support windows and version skew."
category = "Hosting & Cloud Industry"
order = 2126
part = "Kubernetes"
tags = ["kubernetes", "control-plane", "etcd", "scheduler", "operators", "release-cadence"]
+++

Kubernetes is a database with an API in front of it and a crowd of programs watching it. A customer writes a description of what should exist (three replicas of this image, a load balancer on port 443, a 50 GB volume) into the API server, which validates it and stores it in etcd. Nothing happens at that moment. Controllers, each watching one kind of object, notice the difference between what was asked for and what exists and act to close it: one creates pods, the scheduler assigns them to nodes, the kubelet on each node starts their containers, a cloud controller asks the provider's API for the load balancer. Each reports what it saw back into the API, and the loop runs again. Everything else in this part of the book, networking, storage, packaging, tenancy, autoscaling, is more controllers and more object kinds on the same machinery.

For a provider the machinery is a product with a clock on it. Selling managed Kubernetes means running a control plane per customer cluster: an API server that must stay reachable, an etcd that must stay under its size limits, be backed up and be encrypted, and a version that expires. Upstream ships three minor releases a year and patches each for about fourteen months, so every cluster the provider runs is on a schedule toward an upgrade the customer may not want, through API removals that can break the customer's manifests, under a skew policy that fixes the order in which components may move. The provider's support windows, upgrade channels and paid extended support are all answers to that clock.

On the scaling path this book follows, from a homelab to a cloud and back, Kubernetes is a strong stop, not the destination. It earns its cost where there are many services, a team to own the cluster, and a need for its portable API and its extension points; below that, the products that hide the cluster ([PaaS & Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds), [Functions, Isolates & Edge Compute](/books/hosting-and-cloud/functions-and-edge-compute)) do the same job with less to own, and the same API on one small machine is k3s in a homelab ([Kubernetes and GitOps at Home](/books/hosting-and-cloud/self-hosted-apps#kubernetes-and-gitops-at-home)).

This chapter covers Kubernetes from its 2014 launch: the declarative API and the control loop, the API server and its request path, etcd and its limits, the scheduler, the controller managers, the kubelet and the container runtime interface, extension through CRDs, aggregated APIs and operators, API versioning and deprecation, the release cadence and support windows, version skew, the scale envelope, and what a provider runs when it runs control planes for customers. Scheduler history before Kubernetes (Borg, Omega, Mesos) is [Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers). The operating rules are the playbook's [Kubernetes](/docs/operations/kubernetes) doc; fees, channels and extended support as products are [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes); conformance and distributions are [Distributions & Alternatives](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives). It defines the `clusters` side table that every other chapter in this part extends, and `kubernetes_versions`, the provider's catalog of minors and their support clocks.

## How the Providers Do It

| Provider | Control plane, as documented | API endpoint | Versions and support, as of October 2026 |
| --- | --- | --- | --- |
| **Amazon EKS** | "Every cluster has its own unique Kubernetes control plane," with "at least two API server instances and three etcd instances across three AWS Availability Zones"; failed instances are replaced, in another zone if needed | Public by default, secured by IAM and RBAC; private access through the VPC, public access limited by CIDR lists, or private only | 14 months of standard support plus 12 of extended support per minor, extended on by default; the control plane is auto-upgraded at the end of extended support |
| **Google GKE** | "Managed by GKE"; cluster state in "etcd instances that run on every control plane virtual machine"; zonal or regional control planes (99.5% and 99.95% SLAs) | Not covered here | Release channels (Rapid, Regular, Stable, Extended), up to 24 months on Extended; GKE upgrades "automatically, or manually at your request" |
| **Azure AKS** | Azure operates `kube-apiserver`, etcd, `kube-scheduler`, `kube-controller-manager` and `cloud-controller-manager` in both Automatic and Standard modes | Not covered here | Free tier up to 1,000 nodes with no financially backed SLA; Standard up to 5,000 nodes with an uptime SLA; Premium adds long-term support beyond community support |
| **DigitalOcean DOKS** | "A fully managed control plane"; a high-availability control plane is a $40 monthly add-on | Not covered here | "The latest version of Kubernetes as well as earlier patch levels" |
| **Akamai (Linode) LKE** | Standard control plane free; the HA add-on takes "etcd and kube-apiserver ... from one to three replicas" and other components from one to two, is "an irreversible change," and starts at $60 a month; LKE Enterprise has a dedicated HA control plane at $300 a month | Not covered here | Not covered here |
| **Oracle OKE** | Basic clusters with no control plane fee and a service level objective; enhanced clusters at $0.10 per cluster-hour with a financially backed SLA; basic can become enhanced, not back | Not covered here | Not covered here |

Three patterns run through the table:

- **One control plane per cluster, never shared.** AWS states it most plainly: no overlaps "between clusters or AWS accounts." Every provider sells the same unit, a dedicated API server and etcd per customer cluster, which is why the control plane has a fee or an HA add-on and why its size is a provider cost per cluster, not per node.
- **High availability is the product line.** The hyperscalers spread the control plane across zones by default or by cluster type; the developer clouds start with a single replica and sell three as an add-on, which LKE says can't be undone. The difference is the difference between a stacked etcd of one member and one of three.
- **The version is the provider's clock as much as upstream's.** Every provider decides how long it keeps a minor, whether staying longer costs extra, and when it upgrades clusters that didn't move. The prices and channels are [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#how-the-providers-do-it)'s; this chapter covers the upstream clock they are built on.

## How It Got Here

| When | Event | What it solved | What it cost |
| --- | --- | --- | --- |
| June 6, 2014 | First commit to GitHub: 250 files, 47,501 lines | An open container manager outside Google | n/a |
| June 10, 2014 | Eric Brewer announces Kubernetes in a DockerCon 2014 keynote | n/a | n/a |
| April 2015 | "Borg: The Predecessor to Kubernetes" names the ideas carried over | Pods, Services, labels and IP-per-pod as the core model | n/a |
| July 21, 2015 | Kubernetes 1.0, with Google donating the project to the new Cloud Native Computing Foundation | A stable API and neutral governance | n/a |
| March 10, 2016 | Accepted to the CNCF at the incubating level | n/a | n/a |
| 2016 | CoreOS introduces the operator pattern | Application knowledge as a controller | One more controller per application to trust |
| December 2016 | 1.5: initial Container Runtime Interface, alpha Windows nodes | Runtimes pluggable through a gRPC contract | Docker, which didn't implement it, needed a shim |
| April 2017 | Role-based access control introduced | Namespaced, reviewable permissions | n/a |
| June 2017 | 1.7 replaces ThirdPartyResources with CustomResourceDefinitions | Extension without forking the API server | Every TPR user migrated |
| March 6, 2018 | Graduated in the CNCF | n/a | n/a |
| May 1, 2018 | Red Hat launches the Operator Framework | A toolkit for writing operators | n/a |
| September 2019 | 1.16: CRDs GA; `extensions/v1beta1` Deployments, DaemonSets and ReplicaSets no longer served | A stable extension API | The first mass break of old manifests |
| August 2020 | 1.19 extends patch support to about a year (from about nine months) | Room to upgrade yearly | Longer branches for the release team to maintain |
| December 2020 | 1.20 deprecates dockershim | A CRI-only kubelet | Every Docker-runtime node had to move |
| April 2021 | Release cadence cut from four releases a year to three, starting with 1.22 | Fewer upgrades a year | Longer cycles, bigger releases |
| 2021 | 1.22 stops serving widely used beta APIs (CRDs, webhooks, Ingress, RBAC at `v1beta1`) | API surface converged on GA versions | Charts and operators broke on upgrade |
| May 2022 | 1.24: dockershim removed; new beta APIs off by default | Betas stop becoming dependencies by accident | "Widespread user confusion" over the removal |
| 1.25 | PodSecurityPolicy removed | A simpler built-in replacement | Every PSP user migrated |
| 1.29 | API Priority and Fairness and the KMS v2 encryption provider stable | Fair API server sharing; envelope encryption | n/a |
| 1.31 (2024) | In-tree cloud providers removed: about 1.5 million lines, core binaries about 40% smaller | Provider code out of the core release | Every provider had to ship its own controller |

The Borg post explains which ideas came from Google's internal system and which were fixes. A pod descends from Borg's alloc, "a resource envelope in which one or more containers run," made the unit of scheduling; a Service gives "a name and maps to a dynamic set of pods defined by a label selector," Borg's naming and load balancing made general; labels replaced Borg's rigid jobs as the way to group things; and IP-per-pod replaced Borg's shared host port space, so applications stopped negotiating ports. Everything in the table after 1.0 is the project moving pieces out of the core (runtimes through CRI, storage through CSI, cloud providers through the cloud-controller-manager, policy through admission) and tightening its promises about how long anything stays.

The project's size is part of the architecture's cost. At its tenth anniversary in June 2024 it counted 88,474 contributors, 15,121 code committers, 4,228,347 contributions and 311,787 pull requests, from more than 8,000 companies across 44 countries, and the CNCF around it held close to 200 projects. As of October 2026 the CNCF lists 39 graduated and 38 incubating projects. A provider that runs Kubernetes is downstream of all of it.

## The Control Loop

The docs define a controller with a thermostat: the setting is the desired state, the room is the current state, and "each controller tries to move the current cluster state closer to the desired state." Kubernetes runs "lots of controllers that each manage a particular aspect of cluster state," usually one kind as input and another as output, because "controllers can fail, so Kubernetes is designed to allow for that." Most never touch the world directly. The Job controller "does not run any Pods or containers itself. Instead, the Job controller tells the API server to create or remove Pods," and other components act on those objects in turn. Controllers that do reach outside the cluster (a cloud load balancer, a disk) read their desired state from the API, change the external system, and report back.

Every object carries the two halves of that loop. In the API conventions, `spec` "is a complete description of the desired state" and `status` "summarizes the current state of the object in the system," as "the most recent observations of actual state." Three fields make the loop observable:

| Field | Set by | What it says |
| --- | --- | --- |
| `metadata.generation` | The API server, on every spec change | "Monotonically increasing, per-resource" |
| `status.observedGeneration` | The controller | "The generation most recently observed by the component responsible for acting upon changes" |
| `status.conditions` | The controller | A list keyed by `type`, each `True`, `False` or `Unknown`, "the absence of a condition" read as `Unknown` |

When `observedGeneration` equals `generation` and the conditions are true, the controller has caught up. That comparison is how a provider's console, or a customer's pipeline, knows a change has taken effect rather than merely been accepted.

The design rule underneath is that "the system is level-based rather than edge-triggered." A controller reacts to the state it reads, not to the event that told it something changed, so a missed event, a restart or a duplicated notification costs a delay, never a wrong result: the next pass reads the same level and does the same thing. The docs draw the consequence: a cluster "never reaches a stable state," and "it doesn't matter if the overall state is stable or not" as long as the controllers keep running.

Three API mechanisms make that cheap enough to run thousands of controllers against one database:

- **Optimistic concurrency.** Every object has a `resourceVersion`, a string that "must be passed unmodified back to the server." An update carries the version it was based on, and if the object has changed since, "the API server returns a `409 Conflict`." Two controllers editing the same object don't lock; the loser rereads and retries.
- **List, then watch.** A client lists a kind, then watches from the returned `resourceVersion`, which "allows a client to fetch the current state and then subscribe to subsequent changes, without missing any events." History is short: "clusters using etcd 3 preserve changes in the last 5 minutes by default," and a watch that asks for older history gets `410 Gone` and must clear its cache and list again. `BOOKMARK` events, requested with `allowWatchBookmarks=true`, advance a client's version without data, but clients can't assume when, or whether, they arrive. Lists and watches are served from the API server's **watch cache**, "an internal, in-memory store within the API server that caches and mirrors the state of data persisted into etcd," which is what keeps thousands of watchers off etcd.
- **Informers.** The client library packages the pattern. A Reflector "watches the Kubernetes API for the specified resource type"; an Informer pops changes from a queue, stores them and calls the controller's handlers; an Indexer keeps a local, indexed copy; and the handlers put only object keys on a work queue, to "decouple delivery of an object from its processing." Workers take a key, read the current object from the local cache and reconcile it. Because only keys are queued, ten changes to one object before a worker gets to it are one reconcile.

Deletion is part of the loop too. **Owner references** "tell the control plane which objects are dependent on others": a ReplicaSet owns its pods, a Deployment its ReplicaSets. Deleting an owner cascades to its dependents in the background by default; foreground deletion keeps the owner until dependents with `ownerReference.blockOwnerDeletion=true` are gone; orphaning leaves them. Cross-namespace owner references "are disallowed by design," so a namespaced object can't be owned by one in another namespace. **Finalizers** are "namespaced keys that tell Kubernetes to wait until specific conditions are met": deleting an object that has them sets `metadata.deletionTimestamp`, returns `202`, and leaves the object terminating until every finalizer is removed. `kubernetes.io/pv-protection` is the built-in example: a PersistentVolume in use can't disappear from under its pod.

For a provider, finalizers are where its controllers and the customer's deletes meet. A controller that creates a provider resource (a load balancer, a disk, a DNS record) for an object puts a finalizer on that object, deletes the provider resource when the object is deleted, then removes the finalizer. If the controller is broken, the object hangs in `Terminating`; if someone removes the finalizer by hand, the object goes and the provider resource stays, billed and orphaned. The docs say to "avoid manually removing finalizers" unless their purpose "is accomplished in another way," which for a provider means its own sweep for resources whose source object is gone, the orphan checks [Cluster Networking](/books/hosting-and-cloud/cluster-networking#how-to-build-it) and [Storage & Stateful Workloads](/books/hosting-and-cloud/kubernetes-storage#how-to-build-it) build.

## The API Server

`kube-apiserver` is "the core component server that exposes the Kubernetes HTTP API," and the only component that talks to etcd. Every request, from a person, a controller or a kubelet, takes the same path:

1. **Transport.** It listens "on port 6443 on the first non-localhost network interface, protected by TLS" by default.
2. **Authentication.** Client certificates, bearer tokens, bootstrap tokens and service account JWTs; "multiple authentication modules can be specified, in which case each one is tried in sequence, until one of them succeeds." Kubernetes "does not have a `User` object nor does it store usernames," so human identity always comes from outside: a certificate authority, an OIDC issuer, or a provider's identity system mapped to Kubernetes users, as EKS secures its endpoint with "a combination of AWS Identity and Access Management (IAM) and native Kubernetes ... RBAC."
3. **Authorization.** Modules such as Node, RBAC, ABAC and Webhook decide whether the user may perform the verb on the resource. The Node authorizer with the NodeRestriction admission plugin means "kubelets are only authorized to create/modify their own Node resource."
4. **Admission.** Mutating admission then validating admission, through built-in plugins, webhooks and in-process CEL policies; the chain and its failure modes are [Multi-Tenancy, Policy & Security](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy#admission-control)'s.
5. **Validation and storage.** The object is validated against its schema and "written to the object store."

The API server protects itself with **API Priority and Fairness**, stable since 1.29. Without it, concurrency is two flags, `--max-requests-inflight` and `--max-mutating-requests-inflight`; with it, their sum is "divided up among a configurable set of priority levels." **FlowSchemas** classify each request by its attributes into a **priority level** with its own concurrency limit, so "requests assigned to different priority levels cannot starve each other," and within a level "a fair-queuing algorithm prevents requests from different flows from starving each other," with a little queuing so brief bursts aren't rejected. On a provider's managed control plane, APF is what stops one customer's runaway controller from starving the kubelets' heartbeats and the provider's own system components, and its rejection counts are the first metric to check when a customer reports a slow API.

Since 1.26 each API server also publishes its identity as a Lease. The API server is stateless apart from its caches, so it scales by replicas behind a load balancer: that load balancer's address is the cluster's API endpoint, the one thing a customer's kubeconfig names.

## etcd

etcd is the "consistent and highly-available key value store for all API server data," and the part of a control plane that decides its availability, its size limits and its recovery story.

**Consensus.** etcd uses Raft: "the leader handles all client requests which need cluster consensus," and "an etcd cluster needs a majority of nodes, a quorum, to agree on updates." Members come in odd numbers because an even member adds no fault tolerance: three members tolerate one failure, five tolerate two, and "an etcd cluster probably should have no more than seven nodes." The Kubernetes docs recommend "a five-member cluster ... in production," on "dedicated machines or isolated environments," because "keeping etcd clusters stable is critical to the stability of Kubernetes clusters," and performance "strongly depends on disk performance": a leader that loses its position to slow fsyncs is usually fixed with a dedicated or faster disk. If a majority of members is lost permanently, "Kubernetes cannot make any changes to its current state": running pods continue, but nothing new is scheduled.

**Topology.** kubeadm's two HA layouts are the provider's two choices. A **stacked** control plane runs an etcd member on each control plane node, needs "a minimum of three stacked control plane nodes," and "runs the risk of failed coupling": one node lost is an etcd member and an API server lost together. An **external** etcd separates them at the cost of "twice the number of hosts." EKS's two API servers and three etcd instances across three zones are the external shape; LKE's HA add-on, three replicas of each, is the stacked shape.

**Limits.** These are why Kubernetes objects are small and why the scale envelope exists:

| Limit | Default | What happens at it |
| --- | --- | --- |
| Request size | "The maximum size of any request is 1.5 MiB" (`--max-request-bytes`) | Larger writes are rejected, so a ConfigMap, Secret or CRD object can't hold a large payload |
| Storage quota | "The default storage size limit is 2 GiB" (`--quota-backend-bytes`) | etcd "raises a cluster-wide alarm that puts the cluster into a maintenance mode which only accepts key reads and deletes" |
| Suggested maximum | "8 GiB is a suggested maximum size for normal environments," with a warning at startup above it | Larger databases are outside the tested envelope |

**Compaction and defragmentation.** etcd keeps every revision until compacted, and history "should be periodically compacted to avoid performance degradation and eventual storage space exhaustion," periodically by time window or by revision count (`--auto-compaction-mode`, `--auto-compaction-retention`). Compaction frees space inside the database file; only defragmentation "releases this storage space back to the file system," and defragmenting "a live member blocks the system from reading and writing data while rebuilding its states," so it runs one member at a time. Recovering from the space alarm takes all three steps in order: free space, defragment, clear the alarm. For a provider this is routine maintenance across every customer's etcd, scheduled per member, and the space alarm is an outage the customer caused (often with a controller that writes too many objects or events) on infrastructure the provider runs. Large clusters can move Events to "a separate dedicated etcd instance" so their churn doesn't share a quota with everything else.

**Backups.** "Access to etcd is equivalent to root permission in the cluster," so backups are as sensitive as the cluster. A snapshot comes from `etcdctl snapshot save` on a live member, without affecting its performance, or from a volume snapshot of the disk etcd runs on; the docs say to "encrypt the snapshot files." Restoring is all or nothing: "stop all API server instances," "restore state in all etcd instances," "restart all API server instances," and restart the scheduler, controller manager and kubelets so they don't act on stale data. A restore rewinds the cluster's desired state while the world it describes (provider resources, running pods) has moved on, which is why the playbook's rule that [restores are what matter](/docs/operations/disaster-recovery#restores-are-what-matter) applies with extra force: a restored cluster's controllers will reconcile toward an hour-old spec. Backup policies and records are [Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations)'.

**Encryption at rest.** "By default, the API server stores plain-text representations of resources into etcd, with no at-rest encryption." `--encryption-provider-config` points at an `EncryptionConfiguration` listing resources (Secrets at minimum) and an ordered list of providers: the first encrypts, all are tried to decrypt. `identity` is no encryption; `aescbc`, `aesgcm` and `secretbox` use keys stored in the configuration file, which "protects against an etcd compromise, but it fails to protect against a host compromise"; `kms` v2, stable since 1.29, envelope-encrypts with a key held in an external key manager, and `kms` v1 is deprecated since 1.28. The playbook's [Secrets](/docs/operations/kubernetes#secrets) rule is to turn it on with a KMS key. For a provider, the question is whose key: its own, which protects etcd disks and backups, or the customer's, which lets the customer revoke the provider's ability to read its Secrets.

## The Scheduler

`kube-scheduler` "looks for Pods not yet bound to a node, and assigns each Pod to a suitable node." It works in two steps. **Filtering** "finds the set of Nodes where it's feasible to schedule the Pod"; if none is feasible the pod stays `Pending` "until the scheduler is able to place it." **Scoring** "ranks the remaining nodes," and the scheduler picks the highest, choosing at random among ties, then tells the API server in a step called **binding**. The scheduler places pods by what they **request**, not by what they use, the root of the [request gap](/books/hosting-and-cloud/autoscaling-and-cost#bin-packing-and-the-request-gap) and of the playbook's [requests and limits](/docs/operations/kubernetes#requests-and-limits) rules.

The placement controls a customer writes, and what each costs:

| Control | What it does | What to know |
| --- | --- | --- |
| `nodeSelector` | Only nodes with every listed label | "The simplest recommended form"; node labels for zones and instance types are "cloud provider specific" |
| Node affinity | `requiredDuringSchedulingIgnoredDuringExecution` (a hard rule) or `preferredDuringSchedulingIgnoredDuringExecution` (a preference) | Both ignore changes after the pod is placed |
| Inter-pod affinity and anti-affinity | Place pods relative to labels on other pods | "We do not recommend using them in clusters larger than several hundred nodes" |
| Topology spread constraints | Spread pods across "regions, zones, nodes, or among any other topology domains" | The way to survive a zone without anti-affinity's cost |
| Taints and tolerations | A taint lets a node "repel a set of pods"; `NoSchedule`, `PreferNoSchedule` or `NoExecute`, which evicts running pods without a toleration, after `tolerationSeconds` if one is set | Kubernetes adds tolerations for `node.kubernetes.io/not-ready` and `unreachable` with `tolerationSeconds=300`, so pods stay bound to a failed node for 5 minutes |
| `nodeName` | Bypasses the scheduler entirely | For custom schedulers; can oversubscribe a node |

The scheduler is itself built from plugins. The **scheduling framework** exposes extension points in order: `PreEnqueue`, `QueueSort`, `PreFilter`, `Filter`, `PostFilter`, `PreScore`, `Score`, `NormalizeScore`, `Reserve`, `Permit`, `PreBind`, `Bind` and `PostBind`. "The scheduling cycle selects a node for the Pod, and the binding cycle applies that decision," and "scheduling cycles are run serially, while binding cycles may run concurrently," so one slow bind (a volume to attach) doesn't stall placement for everyone. Placement can therefore be changed by adding plugins at these points rather than by forking the scheduler.

**Priority and preemption** decide who loses when the cluster is full. A **PriorityClass** has a 32-bit value up to 1,000,000,000; larger values are reserved for the built-in `system-cluster-critical` (2,000,000,000 in 1.37) and `system-node-critical` (2,000,001,000). One class may be `globalDefault`; without one, pods default to priority zero. When no node fits a pending pod, the `PostFilter` step tries preemption: it evicts lower-priority pods from a node, records the node in the preemptor's `status.nominatedNodeName`, gives the victims "their graceful termination period," and respects PodDisruptionBudgets only on a best-effort basis. `preemptionPolicy: Never` queues a pod ahead of lower priorities without letting it evict anyone. The docs' warning is the provider's tenancy rule: in a cluster "where not all users are trusted, a malicious user could create Pods at the highest possible priorities," and ResourceQuota scoped by PriorityClass is the fix ([Multi-Tenancy, Policy & Security](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy#rbac-quotas-and-limits)).

The scheduler only places pods on nodes that exist. Adding nodes when pods can't be placed is the node autoscaler's job, [Autoscaling & Cost](/books/hosting-and-cloud/autoscaling-and-cost#node-autoscaling-cluster-autoscaler-and-karpenter)'s subject.

## The Controller Managers

`kube-controller-manager` "runs controllers to implement Kubernetes API behavior": the Deployment, ReplicaSet, Job, EndpointSlice, namespace, service account, garbage collector and node lifecycle controllers, among others, compiled into one binary. In an HA control plane, it and the scheduler use Lease objects for leader election, "where only one instance of the component should be actively running while the other instances are on stand-by," so adding replicas adds failover, not throughput.

The **node controller** is the one that decides what happens when a provider's machine fails, and its defaults are worth knowing by number. It assigns pod CIDRs to nodes where configured, reconciles its node list with the cloud's machines, and monitors health: kubelets heartbeat by updating their node's Lease in the `kube-node-lease` namespace and its status; the controller checks every node every 5 seconds (`--node-monitor-period`), marks a silent node's `Ready` condition `Unknown`, and "waits 5 minutes between marking the node as `Unknown` and submitting the first eviction request." Evictions are rate limited to `--node-eviction-rate` (0.1 per second, one node every 10 seconds); when at least `--unhealthy-zone-threshold` (0.55) of a zone's nodes are unhealthy the rate drops to `--secondary-node-eviction-rate` (0.01), or stops entirely in clusters of up to `--large-cluster-size-threshold` (50) nodes; and if every zone is unhealthy the controller "assumes that there is some problem with connectivity between the control plane and the nodes, and doesn't perform any evictions." Those rules exist so that a control plane network partition, the provider's failure, doesn't make Kubernetes evict every customer pod at once.

The **cloud-controller-manager** "integrates with underlying cloud provider(s)." Its node, route and service controllers are what turn Node objects into the provider's machines and `type: LoadBalancer` Services into its load balancers; the move of that code out of the core, ending with the removal of in-tree providers in 1.31, is covered in [Cluster Networking](/books/hosting-and-cloud/cluster-networking#from-service-to-provider-load-balancer). For a provider it is the component that makes a cluster theirs: it runs the provider's code with the provider's credentials, and on a managed service it runs in the provider's control plane, where AKS lists it among the components Azure operates.

## The Node: kubelet and the Container Runtime

The kubelet "ensures that Pods are running, including their containers." With `--register-node` (the default) it registers its own Node object, reports status every `--node-status-update-frequency`, renews its Lease as a heartbeat, and runs the pods bound to it through the container runtime. A node isn't used "until it becomes healthy," and in-place minor upgrades of a kubelet aren't supported: a node is drained and its kubelet upgraded, or replaced, which is why node upgrades are node pool rollouts in [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#how-to-build-it).

The **Container Runtime Interface**, introduced in 1.5 in December 2016, is the gRPC protocol between the kubelet and the runtime. Docker didn't implement it, so the kubelet carried an adapter, dockershim. The December 2, 2020 "Don't Panic" post announced "Kubernetes is deprecating Docker as a container runtime after v1.20," explaining that "Docker isn't compliant with CRI" and that "Docker-produced images will continue to work in your cluster with all runtimes," because they are OCI images. The removal, first planned for 1.22 and then 1.23, landed in 1.24 in May 2022: "Dockershim has been removed from the Kubernetes project as of release 1.24." The runtimes the docs list today are containerd, CRI-O, Docker Engine and Mirantis Container Runtime; since 1.26 the kubelet "only works with v1 of the CRI API," and the kubelet and runtime must use the same cgroup driver, `systemd` where systemd is init. AKS shows the outcome: containerd on Linux node pools from 1.19, and the only Windows option from 1.23.

`kube-proxy`, "optional" in the component list, "maintains network rules on nodes to implement Services"; its modes and the eBPF data planes that replace it are [Cluster Networking](/books/hosting-and-cloud/cluster-networking#services-and-kube-proxy)'s.

## Extending the API

Kubernetes is extended by adding kinds to the API and controllers that reconcile them. "When you combine a custom resource with a custom controller, custom resources provide a true declarative API." There are two ways to add the kinds:

| | CustomResourceDefinition | Aggregated API server |
| --- | --- | --- |
| Model | A schema registered with the main API server, which stores and serves the objects | A separate API server registered with an `APIService`, which the main API server proxies to |
| Programming | "Do not require programming. Users can choose any language for a CRD controller" | "Requires programming and building binary and image" |
| Storage | etcd, through the main API server | Its own choice: "a time-series database instead of key-value store," or the main etcd |
| Validation | "Most validation can be specified in the CRD using OpenAPI v3.0 validation," the rest by webhook | "Arbitrary validation checks" |
| Protocol Buffers | No | Yes |
| Custom business logic | "Yes, using Webhooks" | Yes |
| The docs' summary | "CRDs are easier to use" | "Aggregated APIs are more flexible" |

CRDs arrived in 1.7 to replace ThirdPartyResources and went GA in 1.16; whole features now ship that way, the Gateway API among them. The **operator pattern** "combines custom resources and custom controllers" to "encode domain knowledge for specific applications into an extension of the Kubernetes API." CoreOS introduced the concept in 2016; Red Hat launched the Operator Framework, "an open source toolkit designed to manage Kubernetes native applications, called Operators," on May 1, 2018, with the operator-sdk's first release, v0.0.1, on March 12, 2018. Database and storage operators are [Storage & Stateful Workloads](/books/hosting-and-cloud/kubernetes-storage#operators-for-databases-and-storage)'s; admission webhooks and CEL policies, the third extension point, are [Multi-Tenancy, Policy & Security](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy#admission-control)'s.

For a provider, CRDs are how it sells services inside the customer's API. EKS's "capabilities" install Kubernetes APIs "with Kubernetes Custom Resource Definitions" in the customer's cluster "while operating controllers and other components in AWS-owned infrastructure": AWS Controllers for Kubernetes for S3 buckets, RDS databases and IAM roles as custom resources, Argo CD, and kro for composing resources. The pattern is the control loop extended across the provider boundary: the customer writes a spec into its own cluster, and a controller the provider runs reconciles the provider's real resources against it. The cost is that every CRD is cluster-scoped and shared by every tenant of the cluster, and every object lives in the same etcd with the same limits.

## API Versions and Deprecation

Every API is served at a version that says how long it will last. The deprecation policy's rules are the contract a provider passes on to its customers:

- **Rule #1:** "Once an API element has been added to an API group at a particular version, it can not be removed from that version or have its behavior significantly changed." Change means a new version.
- **Rule #2:** objects "must be able to round-trip between API versions in a given release without information loss," so the same object can be read at `v1beta1` and `v1` while both are served.
- **Rule #4a:** GA versions "may be marked as deprecated, but must not be removed within a major version"; beta versions are deprecated "no more than 9 months or 3 minor releases after introduction (whichever is longer)" and "no longer served 9 months or 3 minor releases after deprecation"; alpha versions "may be removed in any release without prior deprecation notice."

The removals that hurt were betas everyone had come to depend on:

| Release | Stopped serving | Replaced by |
| --- | --- | --- |
| 1.16 | `extensions/v1beta1` and `apps/v1beta1`/`v1beta2` Deployments, DaemonSets, ReplicaSets, StatefulSets; `extensions/v1beta1` NetworkPolicy and PodSecurityPolicy | `apps/v1`, `networking.k8s.io/v1`, `policy/v1beta1` |
| 1.22 | `v1beta1` of CustomResourceDefinition, Mutating and Validating webhook configurations, APIService, TokenReview, SubjectAccessReviews, CertificateSigningRequest, Lease, Ingress (also `extensions/v1beta1`), IngressClass, RBAC, PriorityClass, and CSIDriver, CSINode, StorageClass and VolumeAttachment | The `v1` of each |
| 1.25 | PodSecurityPolicy (`policy/v1beta1`, with its admission controller), CronJob `batch/v1beta1`, EndpointSlice and Event `v1beta1`, HPA `autoscaling/v2beta1`, PodDisruptionBudget `policy/v1beta1` | Pod Security Admission; the `v1` or `v2` of the rest |

The 1.22 list is why that release is remembered: the extension machinery itself (CRDs, webhooks, APIService) moved, so operators and charts broke, not just applications. The project's response was KEP-3136, implemented in 1.24: "beta APIs will not be enabled in clusters by default," while "existing beta APIs and new versions of existing beta APIs, will continue to be enabled." A new beta now has to be turned on deliberately, so it can't become a dependency by accident.

For a provider, an upgrade that crosses a removal is the most common way a managed upgrade breaks a customer. The playbook's [Upgrades and Version Skew](/docs/operations/kubernetes#upgrades-and-version-skew) gives the customer's rule (scan manifests and charts before each upgrade); the provider's part is to know, for every minor it offers, what that minor stops serving, and to tell each customer whose cluster still uses it before the upgrade, not after.

## Release Cadence and Support Windows

Kubernetes ships three minor releases a year. KEP-2572, "Defining the Kubernetes Release Cadence," changed the cadence "from 4 down to 3 releases per year," in cycles of about 15 weeks, starting with 1.22; the release team merged it on April 23, 2021. The 1.37 cycle ran 15 weeks, from May 18, 2026 to a scheduled release on August 26, 2026; 1.38's cycle began August 31, 2026, with release planned for December 16, 2026.

Support is per minor. "Kubernetes 1.19 and newer receive approximately 1 year of patch support. Kubernetes 1.18 and older received approximately 9 months." The patch release policy spells it out as "roughly fourteen (14) months": twelve months of standard support, then two of maintenance mode, when patches are cut only for CVEs, dependency issues and critical core bugs. Patches ship roughly monthly, faster right after a minor. The project maintains release branches for "the most recent three minor releases."

As of October 2026 (the releases and patch-releases pages):

| Minor | Latest patch on the releases page | Maintenance mode | End of life |
| --- | --- | --- | --- |
| 1.37 | 1.37.1 | August 28, 2027 | October 28, 2027 |
| 1.36 | 1.36.5 | April 28, 2027 | June 28, 2027 |
| 1.35 | 1.35.9 | December 28, 2026 | February 28, 2027 |
| 1.34 | 1.34.12 | Since August 27, 2026 | October 27, 2026 |

1.34 reaches end of life on October 27, 2026, which is why, as of that date, the page's prose names only 1.37, 1.36 and 1.35 while its table still lists 1.34.

Fourteen months is shorter than most customers' appetite for change, and the gap between it and what customers want is a product. The providers add months beyond upstream end of life and charge for them: EKS gives 14 months of standard support and 12 of extended, 26 in all, with extended support on by default; GKE's Extended channel reaches up to 24 months from 1.27; AKS's Premium tier offers 24-month long-term support. Those offers mean the provider backports fixes to minors the community no longer patches, a real engineering cost, and their prices and terms are [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#extended-support)'s. Every provider ends the same way: EKS upgrades the control plane "at any time" once extended support ends, without upgrading nodes; GKE upgrades at the end of extended support regardless of blockers. The clock can be extended and priced; it can't be stopped.

## Version Skew and Upgrade Order

The version skew policy says which components may differ, by how much, and so the order in which a cluster must upgrade:

| Component | Allowed skew relative to `kube-apiserver` |
| --- | --- |
| `kube-apiserver` (HA) | "The newest and oldest `kube-apiserver` instances must be within one minor version" |
| `kube-controller-manager`, `kube-scheduler`, `cloud-controller-manager` | Never newer; "expected to match ... but may be up to one minor version older (to allow live upgrades)" |
| `kubelet` | Never newer; up to three minors older (two for kubelets before 1.25) |
| `kube-proxy` | Never newer; up to three minors older (two before 1.25), and within three of its node's kubelet |
| `kubectl` | "Within one minor version (older or newer)" |

The order follows: the API servers first, one minor at a time ("must not skip minor versions when upgrading, even in single-instance clusters"); then the controller managers and scheduler, "in any order, or even simultaneously"; then kubelets and kube-proxy, each node drained first. The trap is the three-minor allowance. Nodes left three minors behind are legal, but "they must be upgraded before the control plane can be upgraded," so a customer who skips node upgrades turns the provider's next control-plane upgrade into a blocked one. A provider's upgrade system checks skew before it starts and either upgrades the nodes too or refuses; the records of each upgrade are [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#how-to-build-it)'s `cluster_upgrades`.

## The Scale Envelope

Kubernetes 1.37 "supports clusters" with "no more than 110 pods per node," "no more than 5,000 nodes," "no more than 150,000 total pods" and "no more than 300,000 total containers." These are tested limits, not hard ones, and they follow from the control plane above: every pod, endpoint and event is an etcd object under a 2 GiB default quota and an 8 GiB suggested ceiling, every node heartbeats into the API server, and every watcher is fed from its cache. The docs' advice for large clusters is "one or two control plane instances per failure zone," scaled vertically first, Events in their own etcd, and cloud quotas raised in advance (IP addresses, load balancers), with nodes added "in batches, with a pause between batches, because some cloud providers rate limit the creation of new instances."

Providers sell the envelope in tiers. AKS's Free tier supports up to 1,000 nodes and Standard up to 5,000, the upstream figure; the larger, provisioned control planes some providers sell for big clusters are [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes)'s. A provider that needs more than one cluster's worth of a single customer runs more clusters, which is why fleets and multi-cluster networking exist ([Cluster Networking](/books/hosting-and-cloud/cluster-networking#multi-cluster)).

## Running Control Planes for Customers

A provider that sells Kubernetes runs, for every customer cluster, the components above, and owns everything customers never see:

- **One control plane per cluster, isolated.** The control plane is the cluster's security boundary; sharing one between customers would make the API server, etcd and every cluster-scoped object common property. EKS keeps each cluster's control plane separate and uses VPC controls so components "can't view or receive communication from other clusters or AWS accounts."
- **High availability across zones.** API servers behind a load balancer, etcd at three or five members, in different zones where the region has them, scheduler and controller managers with leader election. Single-replica control planes are cheaper and are what free tiers and developer clouds sell; the step to three replicas is an add-on precisely because it triples the etcd and API server footprint.
- **etcd as a fleet.** Snapshots on a schedule, encrypted, stored outside the cluster's failure domain; compaction and per-member defragmentation; database size tracked against the quota, with the customer told before the space alarm, not after.
- **Encryption at rest** with a KMS v2 provider, and a decision about whose key it is.
- **Upgrades on the project's clock.** A new minor qualified and offered within weeks of release, patch releases rolled monthly, deprecated APIs reported to the customers using them, skew checked before each upgrade, and every cluster on a minor nearing its end upgraded or moved into paid extended support.
- **The endpoint.** A stable hostname, public or private, with client CIDR restrictions, identity mapped from the provider's IAM, and APF tuned so the provider's own components keep their share.
- **Conformance.** The managed service stays a Certified Kubernetes offering, the check that lets customers move manifests in and out ([Distributions & Alternatives](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#certified-kubernetes)).

There are two ways to house all those control planes. The first gives each its own machines (VMs or dedicated hosts for API servers and etcd), which is the isolation the hyperscalers describe. The second runs control planes as workloads on a management cluster: Kamaji, "the Hosted Control Plane Manager for Kubernetes" (Apache 2.0), runs "the Kubernetes Control Plane components in Pods instead of dedicated machines," declared as namespace-scoped `TenantControlPlane` objects, with state in a cluster-scoped `Datastore` that "can hold the data of one or more Kubernetes clusters," etcd or, through Kine, MySQL, PostgreSQL or NATS. Hosted control planes trade some isolation (a shared management cluster and possibly a shared datastore) for density: a control plane costs pods, not machines, and starts in the time a pod does. The virtual clusters in [Multi-Tenancy, Policy & Security](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy#the-official-tenancy-models) are the same idea one level down, a control plane per tenant inside a customer's cluster.

## The Alternatives

The architectural choices a provider actually makes are where cluster state lives and how its products extend the API. For the datastore:

| Choice | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Stacked etcd** | One etcd member per control plane node, three or more | Fewest machines for HA; kubeadm's default HA shape | "Failed coupling": a lost node is an API server and a member together | etcd project | Three control plane nodes per cluster | LKE's HA add-on; kubeadm's stacked topology |
| **External etcd** | A dedicated etcd cluster per control plane | Failure domains separated; etcd sized and tuned on its own | "Twice the number of hosts" | etcd project | The most machines per cluster | EKS (three etcd instances, two or more API servers) |
| **Kine over SQL** | "An etcdshim that provides an etcd-compatible API on top of various backend datastores" (MySQL, MariaDB, PostgreSQL, NATS) | Reuses a managed database the provider already runs; many clusters per datastore | Implements only "the subset of the etcd V3 API required by the Kubernetes API server"; the database's limits and failovers become the cluster's | k3s-io project | One database for many clusters | k3s external datastores; Kamaji `Datastore`s |
| **Kine over SQLite** | Embedded single-file datastore | Zero dependencies; the smallest control plane | "SQLite cannot be used on clusters with multiple servers" | k3s default | Nothing extra | Edge, homelab and CI clusters |

For extending the API with a provider's own products:

| Choice | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **CRD with a controller** | Schema in the main API server, a controller reconciling it | No API server to write; kubectl, RBAC, watch and GitOps work unchanged | Cluster-scoped and shared by all tenants; objects count against etcd; OpenAPI validation only, plus webhooks | Kubernetes API; the controller is the provider's | A controller per product | EKS capabilities (ACK, Argo CD, kro), operators everywhere |
| **Aggregated API server** | A separate API server proxied through `APIService` | Own storage, protobuf, arbitrary validation | A server to write, run and keep available, in the request path of its group | Kubernetes API; the server is the provider's | An API server per extension | APIs whose data isn't a key-value document |
| **Admission webhook** | A remote call on every matching write | Any logic, any external data | A network service in the request path; `Fail` makes it a dependency of every write | Kubernetes API | A service per policy | Policy engines, provider defaults injection |
| **In-process CEL admission** | `ValidatingAdmissionPolicy` and `MutatingAdmissionPolicy` evaluated in the API server | No process to secure, no network hop | Only the request, object, parameters and namespace as inputs | Kubernetes API | Free | Provider guardrails on shared clusters |

## My Default

Everything in this chapter is machinery someone keeps running: a control plane on a clock of three minors a year, etcd under its quota, a skew policy that orders every upgrade, and the CRDs and webhooks each add-on brings. That is the ownership cost behind my default for a team building on a cloud, which this part closes on in [Distributions & Alternatives](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#my-default): a managed container service or a PaaS first, and a cluster once there is a platform team to own this machinery and a reason the API earns its keep, with what a managed cluster still leaves to the customer set out in [What You Still Own on a Managed Cluster](/books/hosting-and-cloud/managed-kubernetes#what-you-still-own-on-a-managed-cluster). From this chapter's side, the reasons that move a team onto a cluster are more services than a container service manages comfortably, hardware or networking it doesn't offer, or a product that is itself a set of controllers.

For a provider selling managed Kubernetes, my default is a dedicated control plane per customer cluster, with three API servers and a three-member external etcd spread across three zones for any cluster that carries an SLA, because etcd quorum is the cluster's availability and stacking ties every node failure to a quorum member. I'd offer a single-replica control plane only as an explicitly non-HA tier, as the developer clouds do, and make the step up an upgrade path rather than a rebuild. I'd encrypt every cluster's etcd with KMS v2 under a provider key by default and let customers bring their own key, snapshot etcd on a schedule into storage outside the region's failure domain, and alert the customer when the database passes three quarters of its quota rather than letting the space alarm make the cluster read-only.

For the clock, I'd offer every minor upstream maintains, qualify each new minor within weeks, roll patches monthly, and publish each minor's standard end, extended end and auto-upgrade date in the API and on the console the day it's offered, with the API removals it brings, matched against what each customer's cluster still uses. Extended support is worth selling because customers genuinely need the months, but I'd price it so staying is a choice and moving is the default, and I'd refuse a control-plane upgrade that the skew policy would break rather than break the nodes. For extension, I'd ship provider products as CRDs with controllers run outside the customer's cluster, the EKS capabilities shape, and use CEL admission before webhooks for guardrails. What would change this: density as the business. A provider selling many small or short-lived clusters (CI, previews, per-tenant clusters for a SaaS) gets more from hosted control planes as pods on a management cluster with Kine or a shared etcd, accepting a shared failure domain for control planes that cost pods instead of machines.

## How to Build It

The chapter defines the `clusters` side table for resources of kind `cluster` in [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), the provider's catalog of offered minors in `kubernetes_versions`, and the API removals each minor brings. The cluster's owner, project, region and lifecycle are `resources` columns as for any kind; its API endpoint hostname is a `resource_identifiers` row, held over time. Other chapters extend `clusters` with `ALTER TABLE`: [Cluster Networking](/books/hosting-and-cloud/cluster-networking#how-to-build-it) adds the pod network and data plane, [Multi-Tenancy, Policy & Security](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy) the tenancy mode. [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#how-to-build-it) owns `node_pools`, `cluster_upgrades` and the control-plane and extended-support SKUs this schema references; etcd snapshots are [Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations)' backup records with the cluster as their resource.

```sql
CREATE TABLE kubernetes_versions (       -- the minors a provider offers, and their clocks
  distribution              TEXT NOT NULL,   -- 'upstream', 'k3s', or the provider's own build
  minor                     TEXT NOT NULL CHECK (minor ~ '^1\.[0-9]+$'),  -- '1.37'
  latest_patch              TEXT,            -- the newest patch offered: '1.37.1'
  upstream_released_on      DATE NOT NULL,   -- the x.y.0 release
  upstream_maintenance_on   DATE NOT NULL,   -- maintenance mode begins
  upstream_end_of_life      DATE NOT NULL,   -- the releases page's End of Life
  offered_during            TSTZRANGE NOT NULL,  -- when new clusters may choose it
  default_during            TSTZRANGE,       -- when it is the default for new clusters
  standard_support_ends_at  TIMESTAMPTZ NOT NULL,  -- the provider's standard window ends
  standard_auto_upgrade_at  TIMESTAMPTZ NOT NULL,  -- 'standard' plan clusters upgraded from here
  extended_support_ends_at  TIMESTAMPTZ,     -- the paid tail (extended or LTS); null: none
  extended_auto_upgrade_at  TIMESTAMPTZ,     -- 'extended' and 'lts' clusters upgraded from here
  PRIMARY KEY (distribution, minor),
  CHECK (upstream_released_on < upstream_maintenance_on
         AND upstream_maintenance_on < upstream_end_of_life),
  CHECK (standard_auto_upgrade_at >= standard_support_ends_at),
  CHECK (extended_support_ends_at IS NULL OR extended_support_ends_at > standard_support_ends_at),
  CHECK ((extended_support_ends_at IS NULL) = (extended_auto_upgrade_at IS NULL)),
  CHECK (extended_auto_upgrade_at IS NULL OR extended_auto_upgrade_at >= extended_support_ends_at),
  EXCLUDE USING GIST (distribution WITH =, default_during WITH &&)  -- one default at a time
);

CREATE TABLE kubernetes_api_removals (   -- what each minor stops serving: the upgrade checklist
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  distribution      TEXT NOT NULL,
  removed_in_minor  TEXT NOT NULL,
  api_group         TEXT NOT NULL,         -- '' for the core group
  api_version       TEXT NOT NULL,         -- 'v1beta1'
  kind              TEXT NOT NULL,         -- 'Ingress', 'PodSecurityPolicy'
  replacement       TEXT,                  -- 'networking.k8s.io/v1'; null: removed outright
  FOREIGN KEY (distribution, removed_in_minor)
    REFERENCES kubernetes_versions (distribution, minor),
  UNIQUE (distribution, removed_in_minor, api_group, api_version, kind)
);

CREATE TABLE clusters (                  -- side table: kind = 'cluster'
  resource_id                UUID PRIMARY KEY REFERENCES resources (id),
  control_plane_mode         TEXT NOT NULL CHECK (control_plane_mode IN (
                               'managed',        -- the provider runs it on dedicated machines
                               'hosted',         -- the provider runs it as pods elsewhere
                               'self_managed')), -- the customer runs it on provider machines
  management_cluster_id      UUID REFERENCES clusters (resource_id),  -- where 'hosted' runs
  distribution               TEXT NOT NULL,
  version_minor              TEXT NOT NULL,
  patch_version              TEXT NOT NULL,      -- the control plane's: '1.37.1'
  release_channel            TEXT NOT NULL CHECK (release_channel IN ('rapid', 'regular',
                               'stable', 'extended', 'manual')),  -- semantics per provider
  support_plan               TEXT NOT NULL CHECK (support_plan IN ('standard', 'extended',
                               'lts')),            -- upgrade at standard's end, or stay and pay
  api_endpoint               TEXT NOT NULL,      -- hostname; held in resource_identifiers
  api_endpoint_access        TEXT NOT NULL CHECK (api_endpoint_access IN ('public',
                               'public_and_private', 'private')),
  public_access_cidrs        CIDR[],             -- null: any address, when public
  control_plane_availability TEXT NOT NULL CHECK (control_plane_availability IN ('single',
                               'multi_replica', 'multi_zone')),
  apiserver_replicas         SMALLINT NOT NULL CHECK (apiserver_replicas >= 1),
  datastore                  TEXT NOT NULL CHECK (datastore IN ('etcd_stacked',
                               'etcd_external', 'kine_sql', 'kine_sqlite')),
  etcd_members               SMALLINT CHECK (etcd_members IN (1, 3, 5, 7)),
  datastore_resource_id      UUID REFERENCES resources (id),  -- kind = 'database' behind Kine
  datastore_quota_bytes      BIGINT CHECK (datastore_quota_bytes > 0),  -- as configured
  encryption_at_rest         TEXT NOT NULL CHECK (encryption_at_rest IN ('none', 'local_key',
                               'kms_v2')),
  encryption_key_owner       TEXT CHECK (encryption_key_owner IN ('provider', 'customer')),
  encryption_key_ref         TEXT,               -- the KMS key's identifier
  upgraded_at                TIMESTAMPTZ,        -- last minor upgrade; cache of cluster_upgrades
  FOREIGN KEY (distribution, version_minor)
    REFERENCES kubernetes_versions (distribution, minor),
  CHECK (patch_version LIKE version_minor || '.%'),
  CHECK ((control_plane_mode = 'hosted') = (management_cluster_id IS NOT NULL)),
  CHECK ((datastore IN ('etcd_stacked', 'etcd_external')) = (etcd_members IS NOT NULL)),
  CHECK (datastore <> 'kine_sql' OR datastore_resource_id IS NOT NULL),
  CHECK (datastore <> 'kine_sqlite'
         OR (apiserver_replicas = 1 AND control_plane_availability = 'single')),
  CHECK (control_plane_availability = 'single' OR apiserver_replicas >= 2),
  CHECK (control_plane_availability = 'single' OR etcd_members IS NULL OR etcd_members >= 3),
  CHECK ((encryption_at_rest = 'kms_v2') = (encryption_key_ref IS NOT NULL)),
  CHECK ((encryption_key_ref IS NULL) = (encryption_key_owner IS NULL)),
  CHECK (api_endpoint_access <> 'private' OR public_access_cidrs IS NULL)
);

CREATE VIEW cluster_support AS           -- where each cluster stands on its version's clock
SELECT c.resource_id,
       c.distribution,
       c.version_minor,
       c.support_plan,
       CASE
         WHEN NOW() < v.standard_support_ends_at THEN 'standard'
         WHEN c.support_plan IN ('extended', 'lts')
              AND NOW() < v.extended_support_ends_at THEN 'extended'
         ELSE 'past_support'
       END AS support_phase,
       CASE
         WHEN c.support_plan IN ('extended', 'lts') AND v.extended_support_ends_at IS NOT NULL
           THEN v.extended_auto_upgrade_at
         ELSE v.standard_auto_upgrade_at
       END AS auto_upgrade_at,
       CURRENT_DATE >= v.upstream_end_of_life AS past_upstream_eol
FROM clusters c
JOIN kubernetes_versions v
  ON v.distribution = c.distribution AND v.minor = c.version_minor;
```

Notes on the sketch:

- **The version is a foreign key, not a string.** A cluster can only be on a minor the provider has a row for, and that row carries every date the customer will be told: upstream end of life, the provider's standard and extended ends, and the two auto-upgrade dates. A provider that changes a window changes one row, and every affected cluster and notice follows from it.
- **Support phase is derived, never stored.** `cluster_support` computes it from the current time, the cluster's `support_plan` and its version's row, so no job has to flip a status at midnight and no cluster can be "standard" on a version whose window closed. [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#how-to-build-it) rates control plane hours from the same two columns, copying `distribution`, `version_minor` and `support_plan` into each usage event, so the bill and the console can't disagree about the phase. The window ends are timestamps, not dates, because billing turns over at an instant, which Managed Kubernetes pins to the provider's published boundary.
- **Upstream and provider clocks are separate columns.** `upstream_end_of_life` is the project's (1.34's was October 27, 2026); `standard_support_ends_at` and `extended_support_ends_at` are the provider's promises, the second covering whichever paid tail it sells, extended support or a long-term-support tier. `past_upstream_eol` marks the clusters where the provider is patching code the community no longer does, which is the engineering cost extended support pays for.
- **Removals are data.** `kubernetes_api_removals` holds, per minor, the group, version and kind it stops serving (the 1.16, 1.22 and 1.25 tables above are rows), so a pre-upgrade check is a join between that list and whatever inventory the provider collects of each cluster's objects, and the notice names the API, the cluster and the replacement.
- **The control plane's shape is recorded because the SLA depends on it.** `control_plane_availability`, `apiserver_replicas`, `datastore` and `etcd_members` let the provider prove what it ran when a customer claims an SLA credit, and the checks encode the documented rules: SQLite only on a single server, multi-replica control planes with at least three etcd members, hosted control planes pointing at the management cluster they run on.
- **Kine clusters point at their database.** `datastore_resource_id` makes the database behind a Kine control plane a resource of kind `database` ([Managed Databases](/books/hosting-and-cloud/managed-databases)' side table), so a database incident lists the clusters it takes down, and many hosted clusters sharing one datastore is a query.
- **Encryption names whose key.** `encryption_key_owner` separates a provider-held key (protecting disks and backups) from a customer-held one (which the customer can revoke), the distinction an auditor and a customer's security review both ask about.
- **Endpoint addresses are identifiers.** The API hostname and its addresses live in `resource_identifiers` with their ranges, like any other name the provider hands out; `api_endpoint` is the current value for convenience.
- **Events:** `version.default_changed`, `cluster.upgrade_blocked` (skew or a removed API in use), `cluster.datastore_near_quota`, `cluster.datastore_alarm` and `cluster.encryption_changed` go through the outbox to notifications, support and the upgrade system; the version and upgrade lifecycle events (`cluster.version_offered`, `cluster.standard_support_ending`, `cluster.extended_support_started` and the upgrade events) are Managed Kubernetes'.

## Auditing

- **Every version promise and when it was made.** The rows of `kubernetes_versions` over time, with the dates each window was announced, because a customer billed for extended support or upgraded automatically will ask what the provider said and when.
- **What each cluster ran.** Minor, patch, channel and upgrade policy over time (with `cluster_upgrades` from [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes)), so an incident or an SLA claim can be placed against the exact control plane version and shape in force.
- **Every upgrade notice and its basis.** Which removals and which skew problems a notice named, sent to whom, before which upgrade, so "you broke my cluster" is answered with the notice and the date.
- **Control plane shape and changes.** Replicas, etcd membership, availability and endpoint access over time, for SLA credits and security reviews.
- **Encryption and key ownership.** When encryption was enabled, with which provider and whose key, and every key change, because a customer's compliance evidence depends on it.
- **etcd maintenance.** Snapshots taken and restored, compactions, defragmentations and space alarms per cluster, since a restore or an alarm is an event that rewrote or froze the customer's desired state.

## What This Means for the System You Build

- **Build on the control loop:** write desired state into the API, reconcile from what you read, and report status with `observedGeneration` and conditions, so a missed event costs a delay, not a wrong result.
- **Put a finalizer on every object that creates a provider resource,** and sweep for provider resources whose source object is gone, because finalizers do get removed by hand.
- **Run a dedicated, zone-spread control plane per customer cluster** wherever an SLA is sold, with etcd at three or five members.
- **Operate etcd as a fleet:** scheduled encrypted snapshots, compaction, per-member defragmentation, and a warning to the customer well before the space quota.
- **Encrypt etcd with KMS v2** by default and record whose key it is.
- **Keep a catalog of offered minors with every date in it,** upstream and the provider's own, and derive each cluster's support phase from it rather than storing one.
- **Treat API removals as data,** matched against each cluster before every upgrade and sent as notices that name the object and its replacement.
- **Enforce the skew policy in the upgrade system,** API servers first and one minor at a time, and refuse an upgrade the policy would break.
- **Ship provider products as CRDs with controllers,** in-process CEL for guardrails, and aggregated API servers only where storage or protocol demand it.
- **Plan capacity against the envelope:** 5,000 nodes, 150,000 pods and an 8 GiB etcd are the tested ceiling, and a customer who needs more needs more clusters.

## References

**Specifications**

- [Kubernetes API conventions](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md), spec and status, level-based design, `generation` and `observedGeneration`, conditions
- [Kubernetes deprecation policy](https://kubernetes.io/docs/reference/using-api/deprecation-policy/), rules #1, #2 and #4a, GA, beta and alpha lifetimes
- [Kubernetes deprecated API migration guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide/), the APIs no longer served in 1.16, 1.22 and 1.25
- [KEP-3136: Beta APIs off by default (README)](https://github.com/kubernetes/enhancements/blob/master/keps/sig-architecture/3136-beta-apis-off-by-default/README.md), new betas off by default, existing betas unchanged
- [KEP-3136 (kep.yaml)](https://raw.githubusercontent.com/kubernetes/enhancements/master/keps/sig-architecture/3136-beta-apis-off-by-default/kep.yaml), stable and implemented in 1.24
- [Kubernetes blog: New Kubernetes release cadence](https://kubernetes.io/blog/2021/07/20/new-kubernetes-release-cadence/), July 20, 2021, the change merged April 23, 2021, three releases a year from 1.22
- [KEP-2572: Defining the Kubernetes Release Cadence](https://github.com/kubernetes/enhancements/blob/master/keps/sig-release/2572-release-cadence/README.md), four releases a year to three, about 15-week cycles, from 1.22
- [Kubernetes version skew policy](https://kubernetes.io/releases/version-skew-policy/), skew per component, the three-minor kubelet allowance since 1.25, upgrade order

**Reference**

- [Kubernetes: Components](https://kubernetes.io/docs/concepts/overview/components/), control plane and node components and their roles
- [Kubernetes: Controllers](https://kubernetes.io/docs/concepts/architecture/controller/), the thermostat, the Job controller, direct control, many simple controllers, kube-controller-manager
- [Kubernetes API concepts](https://kubernetes.io/docs/reference/using-api/api-concepts/), resource versions, 409 Conflict, list and watch, the 5-minute history, 410 Gone, bookmarks, the watch cache
- [client-go under the hood (sample-controller)](https://github.com/kubernetes/sample-controller/blob/master/docs/controller-client-go.md), Reflector, Informer, Indexer and work queue
- [Kubernetes: Garbage collection](https://kubernetes.io/docs/concepts/architecture/garbage-collection/), owner references, cascading deletion modes, `blockOwnerDeletion`, no cross-namespace owners
- [Kubernetes: Finalizers](https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/), `deletionTimestamp`, 202, `pv-protection`, the warning against removing them by hand
- [Kubernetes: Controlling access to the Kubernetes API](https://kubernetes.io/docs/concepts/security/controlling-access/), port 6443 and TLS, authentication modules in sequence, no User object, authorization modules, admission, storage
- [Kubernetes: API Priority and Fairness](https://kubernetes.io/docs/concepts/cluster-administration/flow-control/), stable in 1.29, FlowSchemas, priority levels, fair queuing, the inflight flags
- [Kubernetes: Leases](https://kubernetes.io/docs/concepts/architecture/leases/), leader election for the controller manager and scheduler, node heartbeats, API server identity from 1.26
- [Kubernetes: Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/), self-registration, Node authorization, heartbeats, node controller defaults and eviction rates
- [etcd: FAQ](https://etcd.io/docs/v3.5/faq/), Raft, quorum, odd member counts, fault tolerance, seven-member ceiling, disk performance
- [etcd: System limits](https://etcd.io/docs/v3.5/dev-guide/limit/), 1.5 MiB requests, 2 GiB default quota, 8 GiB suggested maximum
- [etcd: Maintenance](https://etcd.io/docs/v3.5/op-guide/maintenance/), compaction modes, defragmentation per member, the space alarm and recovery
- [Kubernetes: Operating etcd clusters for Kubernetes](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/), five members in production, dedicated machines, root-equivalent access, snapshots, encrypted backups, restore procedure
- [Kubernetes: Options for highly available topology](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/ha-topology/), stacked and external etcd, failed coupling, twice the hosts
- [Kubernetes: Encrypting confidential data at rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/), plain text by default, `EncryptionConfiguration`, providers, KMS v2 stable in 1.29, KMS v1 deprecated in 1.28, local keys and host compromise
- [Kubernetes: kube-scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/), feasible nodes, filtering, scoring, binding, random tie-break
- [Kubernetes: Scheduling framework](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/), extension points, scheduling and binding cycles, preemption at PostFilter
- [Kubernetes: Assigning pods to nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/), nodeSelector, node affinity, inter-pod affinity and its cluster-size warning, topology spread, nodeName
- [Kubernetes: Taints and tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/), effects, `tolerationSeconds`, the automatic 300-second tolerations
- [Kubernetes: Pod priority and preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/), PriorityClass values, system classes, `globalDefault`, `preemptionPolicy`, nominated nodes, best-effort PDBs, the untrusted-users warning
- [Kubernetes: Container runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/), dockershim removed in 1.24, containerd, CRI-O, Docker Engine, Mirantis Container Runtime, CRI v1 only from 1.26, cgroup drivers
- [Kubernetes: Custom resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/), declarative APIs, the operator pattern, CRDs versus aggregated APIs
- [Kubernetes: Considerations for large clusters](https://kubernetes.io/docs/setup/best-practices/cluster-large/), the 1.37 envelope, control plane instances per zone, Events in a separate etcd, cloud quotas and batching
- [Kubernetes releases](https://kubernetes.io/releases/), three maintained branches, about a year of patch support from 1.19 and nine months before, the maintained releases and their end-of-life dates
- [Kubernetes patch releases](https://kubernetes.io/releases/patch-releases/), fourteen months of support, twelve standard and two in maintenance mode, monthly cadence, maintenance and end-of-life dates per branch
- [SIG Release: Kubernetes 1.37 release schedule](https://github.com/kubernetes/sig-release/blob/master/releases/release-1.37/README.md), cycle from May 18, 2026, release scheduled August 26, 2026, 15 weeks
- [SIG Release: Kubernetes 1.38 release schedule](https://github.com/kubernetes/sig-release/blob/master/releases/release-1.38/README.md), cycle from August 31, 2026, release planned December 16, 2026
- [k3s: Cluster datastore](https://docs.k3s.io/datastore), SQLite default and single-server only, embedded etcd, external etcd, MySQL, MariaDB and PostgreSQL
- [Kine repository](https://github.com/k3s-io/kine), an etcdshim over SQL and other backends implementing the etcd subset Kubernetes uses
- [Kamaji repository](https://github.com/clastix/kamaji), hosted control planes as pods, `TenantControlPlane`, shared `Datastore`s, Kine backends, Apache 2.0

**Provider documentation**

- [Amazon EKS architecture](https://docs.aws.amazon.com/eks/latest/userguide/eks-architecture.html), a control plane per cluster, two or more API servers and three etcd instances across three zones, isolation, EKS capabilities as CRDs with controllers in AWS infrastructure
- [Amazon EKS: Cluster API server endpoint](https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html), public by default, IAM and RBAC, private access, public access CIDRs
- [Amazon EKS: Kubernetes versions](https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html), 14 months standard and 12 extended, extended on by default, control plane auto-upgrade at the end of extended support
- [Google Cloud: GKE cluster architecture](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture), control plane managed by GKE, etcd on every control plane VM, automatic or requested upgrades
- [Google Cloud: GKE release channels](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/release-channels), Rapid, Regular, Stable and Extended, up to 24 months, upgrades at the end of extended support
- [Google Cloud: GKE SLA](https://cloud.google.com/kubernetes-engine/sla), 99.5% zonal and 99.95% regional control planes
- [Microsoft Learn: AKS core concepts](https://learn.microsoft.com/en-us/azure/aks/core-aks-concepts), Azure-managed control plane components in both modes, containerd on Linux from 1.19 and on Windows from 1.23, pricing tiers and node limits
- [Microsoft Learn: AKS pricing tiers](https://learn.microsoft.com/en-us/azure/aks/free-standard-pricing-tiers), Free, Standard and Premium, node limits and long-term support
- [DigitalOcean: Kubernetes features](https://docs.digitalocean.com/products/kubernetes/details/features/), a fully managed control plane, versions offered
- [DigitalOcean: Kubernetes pricing](https://www.digitalocean.com/pricing/kubernetes), free control plane, HA control plane at $40 a month
- [Akamai: High availability control plane on LKE](https://techdocs.akamai.com/cloud-computing/docs/high-availability-ha-control-plane-on-lke), one to three replicas of etcd and the API server, irreversible, from $60 a month, 99.9% uptime
- [Akamai: Kubernetes pricing](https://www.akamai.com/cloud/pricing/kubernetes), LKE Enterprise at $300 per cluster-month with a dedicated HA control plane
- [Oracle: Comparing enhanced clusters with basic clusters](https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengcomparingenhancedwithbasicclusters_topic.htm), SLA for enhanced, SLO for basic, one-way upgrade
- [Oracle price list API](https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/?currencyCode=USD), OKE enhanced clusters at $0.10 per cluster-hour

**Announcements and history**

- [Kubernetes blog: 10 years of Kubernetes](https://kubernetes.io/blog/2024/06/06/10-years-of-kubernetes/), June 6, 2024, first commit, DockerCon announcement, 1.0 and the CNCF, CRI, RBAC, CRDs, one-year support, the cadence change, dockershim, in-tree provider removal, contributor statistics
- [Kubernetes blog: Borg, the predecessor to Kubernetes](https://kubernetes.io/blog/2015/04/borg-predecessor-to-kubernetes/), April 2015, allocs to pods, Services, labels, IP-per-pod
- [Kubernetes blog: Don't Panic, Kubernetes and Docker](https://kubernetes.io/blog/2020/12/02/dont-panic-kubernetes-and-docker/), December 2, 2020, Docker deprecated as a runtime after 1.20, CRI compliance, OCI images keep working, the planned removal
- [Kubernetes blog: Completing the largest migration in Kubernetes history](https://kubernetes.io/blog/2024/05/20/completing-cloud-provider-migration/), in-tree cloud providers removed in 1.31
- [Kubernetes blog: Gateway API v1.0](https://kubernetes.io/blog/2023/10/31/gateway-api-ga/), October 31, 2023, the Gateway API shipped as CRDs
- [CNCF: Kubernetes project page](https://www.cncf.io/projects/kubernetes/), accepted March 10, 2016 at incubating, graduated March 6, 2018
- [CNCF: Projects](https://www.cncf.io/projects/), 39 graduated and 38 incubating projects as of October 2026
- [Red Hat: Introducing the Operator Framework](https://www.redhat.com/en/blog/introducing-operator-framework-building-apps-kubernetes), May 1, 2018, the toolkit and the operator concept's 2016 introduction by CoreOS
- [operator-sdk repository](https://github.com/operator-framework/operator-sdk), v0.0.1 on March 12, 2018
