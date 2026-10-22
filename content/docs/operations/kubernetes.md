+++
title = "Kubernetes Operations"
nav_title = "Kubernetes"
description = "Running services on Kubernetes without the classic outages: requests and limits, probes, disruption budgets, graceful shutdown, secrets, GitOps and upgrades."
category = "Operations"
order = 1208
tags = ["kubernetes", "operations", "reliability", "security", "gitops"]
+++

Kubernetes is a good platform with sharp defaults. Most of the outages I've seen on it weren't exotic: a liveness probe that restarted every pod when the database slowed down, a deploy that dropped requests because nothing waited for the load balancer, a node drain that took down every replica at once. Each has a well-known fix, and these are those fixes, in the order you'll need them.

## When Not to Run It

Kubernetes is an operating system for a fleet: scheduling, self-healing, service discovery and a uniform deploy API, paid for with a control plane to upgrade every few months, a networking and security model to learn, and at least one person who understands it deeply. That's worth it for many services, long-running workloads, specific hardware or network needs, or a platform team that runs it as a product for everyone else. It isn't for a handful of stateless web services, where a managed container platform or serverless functions give the same immutable deploys with none of the cluster. If you adopt it, use a managed control plane (EKS, GKE, AKS); running your own etcd is rarely where your advantage is. Either way, it's one place to run good [container images](/docs/delivery/containers), not a substitute for them.

## Requests and Limits

The two numbers do different jobs, and confusing them causes most resource problems. **Requests** are a reservation: the scheduler places a pod only where that much capacity is unreserved, and the container can use more when the node has room. **Limits** are a ceiling: exceed the memory limit and the kernel OOM-kills the container; exceed the CPU limit and it's throttled, not killed, just slowed.

- **Always set requests** for CPU and memory, from measured usage (p95 under normal load is a good start). Without them the scheduler packs blind, utilization autoscaling doesn't work, and noisy neighbors win.
- **Memory limit equals memory request.** Memory isn't compressible: a container bursting above its request can be killed when the node runs short, at a time you didn't choose. Equal values make OOM kills predictable and point them at your own process.
- **Be careful with CPU limits.** They're enforced as a quota per scheduling period, so a latency-sensitive service can be throttled in bursts while its average is well under the limit and the node has idle cores, which shows up as unexplained p99 latency. Many teams set CPU requests and no CPU limit for latency-critical services. Keep limits where you need hard isolation (multi-tenant clusters, batch jobs that would starve everything else) and watch `container_cpu_cfs_throttled_periods_total` wherever you set them.
- **Enforce defaults per namespace** with a LimitRange and ResourceQuota, so a manifest that forgets requests gets sane ones.

## Probes, and the Classic Mistakes

Kubernetes has three probes, and each failure does something different:

| Probe | On failure | Use it for |
|---|---|---|
| Startup | Container is killed and restarted; the other probes wait until it passes | Slow boots: cache warming, migrations, JIT |
| Readiness | Pod is removed from Service endpoints; no restart | "Can I take traffic right now?" |
| Liveness | Container is restarted | "Am I stuck in a way only a restart fixes?" |

The mistakes are almost always in liveness:

- **Checking dependencies in a liveness probe.** The database has a slow minute, every pod fails liveness and restarts at once, and the restart storm reconnects to an already struggling database: a slow dependency became a full outage. Liveness checks only the process itself (is the event loop responding, is a worker deadlocked). The Kubernetes docs say liveness probes should indicate unrecoverable application failure, and that getting them wrong leads to cascading failures.
- **One endpoint for liveness and readiness.** Readiness can reasonably include "my critical dependency is reachable" (stop sending me traffic); liveness shouldn't (don't kill me for it).
- **Aggressive timing on a slow starter.** A 10-second liveness budget on an app that takes 40 seconds to boot restarts it forever. Use a startup probe, not a bigger `initialDelaySeconds`.
- **No readiness probe.** The pod gets traffic before it has loaded config or opened connections, and every deploy produces a burst of errors.

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

For a service with real traffic, a rolling update with `maxUnavailable: 0` and a surge of one or more keeps full capacity during the deploy. Readiness probes make it safe: a new pod that never becomes ready stops the rollout instead of replacing healthy ones. Rolling versus blue-green versus canary is [Deployment Strategies](/docs/delivery/deployment-strategies).

**PodDisruptionBudgets** cover voluntary disruptions like node drains during upgrades. A PDB says "at most one of these may be down at a time", and drains respect it. Without one, a drain can evict every replica at once. PDBs don't protect against a node dying and don't limit rolling updates, so pair them with **topology spread constraints** that put replicas on different nodes and zones in the first place. Every service with more than one replica gets a PDB, and never one that allows zero disruptions: that blocks node drains forever, and cluster upgrades stall until someone deletes it.

## Autoscaling

The HorizontalPodAutoscaler adds and removes replicas based on a metric. For CPU or memory, it computes utilization as a percentage of the pod's **request**, which is one more reason requests must be set and honest: with no request, the HPA can't compute anything and does nothing.

CPU is a decent default signal for stateless services. Better signals are the ones tied to the work: requests per second per pod, queue depth for workers, or concurrency. Scale on what saturates first.

Set `minReplicas` high enough to survive losing a zone and to absorb a burst while new pods start: a service that needs 60 seconds to become ready can't autoscale out of a spike that peaks in 30. Keep the scale-down stabilization window long enough that replicas don't flap.

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
- **Rotate** per [Environments & Configuration](/docs/operations/environments); an external store makes rotation one change instead of a redeploy of every manifest.

## Image Policy

Only run images you built, from registries you control, by digest. An admission policy (Kyverno, OPA Gatekeeper, or the built-in ValidatingAdmissionPolicy) can enforce it: reject `:latest`, reject images from public registries, require a signature from your CI's signing identity, and reject pods that violate the security standard above.

The build side, minimal base images, scanning, signing and SBOMs, is in [Containers](/docs/delivery/containers). Admission control is what makes those practices mandatory instead of conventional.

## GitOps

Don't `kubectl apply` to production. Keep the desired state of every cluster in Git, and let an agent in the cluster (Argo CD or Flux) pull it and continuously reconcile the cluster to match. OpenGitOps names the four principles: declarative, versioned and immutable, pulled automatically, continuously reconciled.

Every change is a reviewed, auditable commit, which is also the change-management evidence an auditor asks for ([Infrastructure as Code](/docs/delivery/infrastructure-as-code) makes the same argument for the resources around the cluster). Drift is detected and overwritten by what Git says, exactly the pressure you want against unrecorded hotfixes. Rollback is `git revert`. And CI never needs cluster credentials: the pipeline builds an image and updates a manifest, and the agent inside the cluster applies it, so a compromised CI system can't write to production directly.

## Upgrades and Version Skew

Kubernetes ships a minor release roughly three times a year and patches each for about a year, so you upgrade at least yearly. Falling behind is the most common way clusters become unmaintainable: each skipped version adds removed APIs, and eventually the managed provider forces the upgrade on its schedule. The control plane goes first, one minor at a time; nodes may lag it by up to three minors and must never be newer. Before each upgrade, scan manifests and Helm charts for APIs removed in the target version (Pluto or kubent do this).

Treat upgrades as routine work, the posture of [Dependencies & Upgrades](/docs/engineering/dependencies): a non-production cluster first, the workload's tests against it, then node pools rolled with surge capacity and PDBs in place. Clusters you're afraid to upgrade are clusters you'll be forced to upgrade at a bad time.

## Observability and Cost

Beyond your application's own [telemetry](/docs/operations/observability), dashboard the platform signals that predict outages: OOM kills and restarts per container, CPU throttling, pods pending for capacity, readiness failures during deploys, node pressure. Alert on [SLO](/docs/operations/slos) symptoms, not these.

The [cost](/docs/operations/cost-and-finops) waste is almost always the gap between requests and usage: pods reserving twice what they use means half your nodes are paid for and idle. Compare requests to usage regularly, right-size, let the cluster autoscaler remove the freed nodes, and label every workload with its owning team.

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
