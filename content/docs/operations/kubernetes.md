+++
title = "Kubernetes Operations"
nav_title = "Kubernetes"
description = "Running services on Kubernetes without the classic outages: requests and limits, probes, disruption budgets, graceful shutdown, secrets, GitOps and upgrades."
category = "Operations"
order = 5.995
tags = ["kubernetes", "operations", "reliability", "security", "gitops"]
+++

Kubernetes is a good platform with sharp defaults. Most of the outages I've seen on it weren't exotic: a liveness probe that restarted every pod when the database slowed down, a deploy that dropped requests because nothing waited for the load balancer, a node drain that took down every replica at once. Each one has a well-known fix. This page is those fixes, in the order you'll need them.

## When Not to Run It

Start with the question most teams skip. Kubernetes is an operating system for a fleet: you get scheduling, self-healing, service discovery and a uniform deploy API, and you pay with a control plane to upgrade every few months, a networking and security model to learn, and at least one person who understands it deeply.

That trade is worth it when you have many services, long-running workloads, specific hardware or network needs, or a platform team that can make it a product for everyone else. It's not worth it for a handful of stateless web services, where a managed container platform or serverless functions give you the same immutable deploys with none of the cluster. If you do adopt it, use a managed control plane (EKS, GKE, AKS); running your own etcd is rarely where your advantage is.

The [container practices](/docs/delivery/containers) apply either way. Kubernetes is one place to run good images, not a substitute for them.

## Requests and Limits

Every container should declare what it needs. These two numbers do different jobs, and confusing them causes most resource problems.

- **Requests** are a reservation. The scheduler places a pod only on a node with that much unreserved capacity, and the kubelet guarantees it. A container can use more than its request when the node has room.
- **Limits** are a ceiling. Exceed the memory limit and the kernel OOM-kills the container. Exceed the CPU limit and the container is throttled: not killed, just slowed.

My defaults:

- **Always set requests**, for CPU and memory, based on measured usage (p95 under normal load is a good start). Without them, the scheduler packs blind, autoscaling by utilization doesn't work, and noisy neighbors win.
- **Set the memory limit equal to the memory request.** Memory isn't compressible: a container that bursts above its request can be killed when the node runs short, at a time you didn't choose. Equal values make memory behavior predictable, and an OOM kill points at your process rather than its neighbors.
- **Be careful with CPU limits.** CPU limits are enforced as a quota per scheduling period, so a latency-sensitive service can be throttled in bursts even when its average usage is well under the limit and the node has idle cores. That shows up as unexplained p99 latency. Many teams set CPU requests and no CPU limits for latency-critical services, relying on requests for fair sharing. Keep limits where you need hard isolation (multi-tenant clusters, batch jobs that would otherwise starve everything else), and watch the throttling metric (`container_cpu_cfs_throttled_periods_total`) wherever you set them.
- **Enforce defaults per namespace** with a LimitRange and ResourceQuota, so a manifest that forgets requests gets sane ones instead of none.

## Probes, and the Classic Mistakes

Kubernetes has three probes, and each failure does something different:

| Probe | On failure | Use it for |
|---|---|---|
| Startup | Container is killed and restarted; the other probes wait until it passes | Slow boots: cache warming, migrations, JIT |
| Readiness | Pod is removed from Service endpoints; no restart | "Can I take traffic right now?" |
| Liveness | Container is restarted | "Am I stuck in a way only a restart fixes?" |

The mistakes are almost always in liveness:

- **Checking dependencies in a liveness probe.** The probe calls the database; the database has a slow minute; every pod fails liveness and restarts at once; the restart storm reconnects to an already struggling database. You turned a slow dependency into a full outage. Liveness should check only the process itself: is the event loop responding, is a worker thread deadlocked. The Kubernetes docs say it plainly: liveness probes should indicate unrecoverable application failure, and getting them wrong leads to cascading failures.
- **Using the same endpoint for liveness and readiness.** They answer different questions. Readiness can reasonably include "my critical dependency is reachable" (stop sending me traffic); liveness shouldn't (don't kill me for it).
- **Aggressive timing on a slow starter.** A liveness probe with a 10-second budget on an app that takes 40 seconds to boot restarts it forever. Use a startup probe instead of inflating `initialDelaySeconds`.
- **No readiness probe.** The pod gets traffic the moment the container starts, before it has loaded config or opened connections. Every deploy produces a burst of errors.

If you're unsure whether a liveness probe helps, leave it out. A missing liveness probe costs you a stuck pod that someone has to notice; a bad one costs you the fleet.

## Graceful Shutdown

Pods are terminated all the time: deploys, scale-downs, node drains, rebalancing. Each termination is a chance to drop in-flight requests, and the default setup does.

What happens on deletion: the kubelet runs the `preStop` hook, sends `SIGTERM`, and after `terminationGracePeriodSeconds` (30 seconds by default) sends `SIGKILL`. At the same time, not before, the control plane starts removing the pod from Service endpoints, and every kube-proxy, ingress controller and load balancer picks that change up on its own schedule. So for a few seconds after `SIGTERM`, new requests still arrive.

The fix has three parts:

1. **A short `preStop` sleep** (5 to 10 seconds) so the process keeps serving while the endpoint removal propagates.
2. **Handle `SIGTERM` in the app:** stop accepting new connections, finish in-flight requests, close pools, exit. Many frameworks don't do this by default.
3. **Size the grace period to cover both.** The countdown starts before `preStop` and includes it. A 10-second sleep plus 25 seconds of draining needs more than the 30-second default.

Workers need the same care: stop pulling new jobs, finish or release the current one. [Background Jobs](/docs/architecture/background-jobs) covers why a job interrupted mid-way must be safe to run again, because eventually one will be killed without warning.

## Rollouts and Disruptions

A Deployment's rolling update replaces pods gradually, controlled by `maxSurge` and `maxUnavailable`. For a service with real traffic, `maxUnavailable: 0` with a surge of one or more keeps full capacity during the deploy, at the cost of temporary extra pods. Readiness probes are what make this safe: a new pod that never becomes ready stops the rollout instead of replacing healthy ones. The broader choice between rolling, blue-green and canary is in [Deployment Strategies](/docs/delivery/deployment-strategies).

**PodDisruptionBudgets** protect you from the other kind of termination: voluntary disruptions like node drains during cluster upgrades. A PDB says "at most one of these may be down at a time," and drains respect it by evicting slowly. Without one, a drain can evict every replica of a service at once, because they happened to be on the same node or the drain moved faster than the replacements started.

Two things PDBs don't do: they don't protect against involuntary failures (a node dying), and they don't limit rolling updates, which are governed by the Deployment's own strategy. Pair PDBs with **topology spread constraints** so replicas land on different nodes and zones in the first place.

Every service with more than one replica gets a PDB. Never set one that allows zero disruptions (`maxUnavailable: 0` on a PDB); it blocks node drains forever, and cluster upgrades stall until someone deletes it.

## Autoscaling

The HorizontalPodAutoscaler adds and removes replicas based on a metric. For CPU or memory, it computes utilization as a percentage of the pod's **request**, which is one more reason requests must be set and honest: with no request, the HPA can't compute anything and does nothing.

CPU is a decent default signal for stateless services. Better signals are the ones tied to the work: requests per second per pod, queue depth for workers, or concurrency. Scale on what saturates first.

Set `minReplicas` high enough to survive losing a zone and to absorb a burst while new pods start. Scaling up takes the time to schedule, pull and pass readiness, so a service that needs 60 seconds to become ready can't autoscale its way out of a spike that peaks in 30. Keep the scale-down stabilization window long enough that replicas don't flap.

## Namespaces and RBAC

Use namespaces as the unit of ownership: one per team or per service, each with its own quotas, network policies and access rules. A namespace is not a strong security boundary by itself, but it's where all the other boundaries attach.

RBAC follows [least privilege](/docs/security/authorization):

- **Humans read; pipelines write.** Engineers get read access to their namespaces in production, and changes flow through Git and CI (below). Write access for humans is break-glass, time-limited and audited.
- **No `cluster-admin` for applications**, and no wildcards in roles. Service accounts get the specific verbs on the specific resources they need, usually none.
- **Disable service account token automounting** for pods that don't call the Kubernetes API, which is most of them. A token mounted into a compromised pod is a foothold into the cluster.
- **Apply the restricted Pod Security Standard** to application namespaces: non-root, no privilege escalation, no host namespaces, dropped capabilities. The built-in Pod Security Admission enforces it per namespace.

## Network Policies

By default, every pod can talk to every other pod in the cluster, in every namespace. A compromised pod in a low-value service can reach your payments database directly.

NetworkPolicies fix that, with two caveats: they only take effect if your network plugin implements them (most do, but check, because a policy without an implementing plugin silently does nothing), and they're allow-lists, so the first policy selecting a pod is what isolates it.

The approach: a **default-deny** policy in every namespace for ingress (and egress, if you can manage it), then explicit allows for each real path. Remember DNS when you deny egress, or nothing resolves. Test policies the way you test firewall rules: try the connection that should fail and confirm it does.

## Secrets

A Kubernetes Secret is base64-encoded, which is an encoding, not encryption. By default, Secrets are stored unencrypted in etcd, and anyone who can create a pod in a namespace can mount and read every Secret in it. So:

- **Enable encryption at rest** for Secrets in etcd. Managed providers support this with a KMS key; turn it on.
- **Don't commit Secret manifests to Git**, even in a private repo. Keep the values in a real secret manager (Vault, AWS Secrets Manager, GCP Secret Manager) and sync them in with the External Secrets Operator or the Secrets Store CSI driver. The manifest in Git references the secret; it never contains it.
- **Restrict who can read Secrets** with RBAC, and remember that "create pods" implies "read secrets" in that namespace.
- **Rotate** as described in [Configuration & Secrets](/docs/operations/configuration). External stores make rotation a change in one place instead of a redeploy of every manifest.

## Image Policy

Only run images you built, from registries you control, by digest. An admission policy (Kyverno, OPA Gatekeeper, or the built-in ValidatingAdmissionPolicy) can enforce it: reject `:latest`, reject images from public registries, require a signature from your CI's signing identity, and reject pods that violate the security standard above.

The build side, minimal base images, scanning, signing and SBOMs, is in [Containers](/docs/delivery/containers). Admission control is what makes those practices mandatory instead of conventional.

## GitOps

Don't `kubectl apply` to production. Keep the desired state of every cluster in Git, and let an agent in the cluster (Argo CD or Flux) pull it and continuously reconcile the cluster to match. OpenGitOps names the four principles: declarative, versioned and immutable, pulled automatically, continuously reconciled.

What you get:

- **Every change is a commit**, reviewed and auditable, which is also the change-management evidence an auditor will ask for. [Infrastructure as Code](/docs/delivery/infrastructure-as-code) makes the same argument for the cloud resources around the cluster.
- **Drift is detected and reverted.** A manual hotfix in the cluster shows up as out-of-sync, then gets overwritten by what Git says, which is exactly the pressure you want against unrecorded changes.
- **Rollback is `git revert`.**
- **CI doesn't need cluster credentials.** The pipeline builds an image and updates a manifest; the agent inside the cluster applies it. A compromised CI system can't write to production directly.

Keep the application's source repo and the deployment config separate, or at least keep image tags updated by automation, so a deploy is a small, machine-made commit.

## Upgrades and Version Skew

Kubernetes ships a minor release roughly three times a year and patches each for about a year, so you upgrade at least once a year, more realistically every release or two. Falling behind is the most common way clusters become unmaintainable: each skipped version adds removed APIs to deal with, and eventually the managed provider forces the upgrade on its schedule.

The constraints:

- **The control plane goes first, one minor version at a time.** The API server can't skip minors.
- **Nodes can lag the control plane** by up to three minor versions, and must never be newer than it.
- **Deprecated APIs get removed.** Before each upgrade, scan manifests and Helm charts for APIs removed in the target version (tools like Pluto or kubent do this), and fix them first.

Treat upgrades as routine, scheduled work, the same posture as [Staying Current](/docs/delivery/staying-current): upgrade a non-production cluster first, run the workload's tests against it, then roll node pools with surge capacity and PDBs in place. Clusters you're afraid to upgrade are clusters you'll be forced to upgrade at a bad time.

## Observability and Cost

Beyond your application's own [telemetry](/docs/operations/observability), watch the platform signals that predict outages: OOM kills and restart counts per container, CPU throttling, pods pending for lack of capacity, readiness failures during deploys, and node pressure conditions. Alert on symptoms tied to your [SLOs](/docs/operations/slos), and keep these as dashboards for diagnosis.

For [cost](/docs/operations/cost-and-finops), the waste is almost always the gap between requests and usage: every pod reserving twice what it uses means half your nodes are paid for and idle. Compare requests to actual usage per workload regularly, right-size, and let the cluster autoscaler remove the nodes that frees up. Label every workload with its owning team so the bill can be split.

## This Site

This site doesn't run on Kubernetes. It's a handful of stateless functions and static pages on Vercel, which is exactly the case where a cluster costs more than it returns. The practices that carry over are the platform-independent ones: immutable deploys, health that reflects real readiness, and configuration outside the code.

## References

**Reference**

- [Kubernetes: Resource management for pods and containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/), requests for scheduling, CPU throttling, memory OOM kills
- [Kubernetes: Liveness, readiness and startup probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/), what each probe does on failure, and the cascading-failure warning
- [Kubernetes: Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/), termination flow, the 30-second default grace period, endpoint removal during shutdown
- [Kubernetes: Container lifecycle hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/), `preStop` counts against the grace period
- [Kubernetes: Disruptions](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/), what PodDisruptionBudgets do and don't limit
- [Kubernetes: Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/), utilization as a percentage of requests
- [Kubernetes: Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/), non-isolated by default, and the plugin requirement
- [Kubernetes: Secrets](https://kubernetes.io/docs/concepts/configuration/secret/), unencrypted in etcd by default, and the recommended mitigations
- [Kubernetes: RBAC good practices](https://kubernetes.io/docs/concepts/security/rbac-good-practices/), least privilege and dangerous permissions
- [Kubernetes: Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/), the privileged, baseline and restricted profiles
- [Kubernetes: Releases](https://kubernetes.io/releases/), three maintained minor releases and about a year of patch support
- [Kubernetes: Release cycle](https://kubernetes.io/releases/release/), roughly three releases per year
- [Kubernetes: Version skew policy](https://kubernetes.io/releases/version-skew-policy/), control plane first, no skipped minors, kubelet up to three minors behind
- [External Secrets Operator](https://external-secrets.io/latest/), syncing secrets from an external manager

**In practice**

- [OpenGitOps: Principles](https://opengitops.dev/), declarative, versioned, pulled and continuously reconciled
- [Argo CD](https://argo-cd.readthedocs.io/en/stable/), Git as the source of truth for cluster state
- [Flux](https://fluxcd.io/flux/), GitOps reconciliation for Kubernetes
