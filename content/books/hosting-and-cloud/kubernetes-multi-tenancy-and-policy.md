+++
title = "Multi-Tenancy, Policy & Security"
nav_title = "Tenancy, Policy & Security"
description = "Kubernetes tenancy models, RBAC and quotas, PSP to Pod Security Admission, CEL admission, Kyverno and Gatekeeper, signed images, Falco, sandboxes."
category = "Hosting & Cloud Industry"
order = 2123
part = "Kubernetes"
tags = ["kubernetes", "multi-tenancy", "admission-control", "policy", "security"]
+++

Kubernetes was not built to be shared by parties who don't trust each other. AWS's EKS guide says it directly: "Kubernetes is a *single tenant orchestrator*," one control plane shared by everything in the cluster, and "the cluster is the only construct that provides a strong security boundary." Everything the project offers for sharing (namespaces, RBAC, quotas, Pod Security Admission, admission policies, network policies, sandboxed runtimes, virtual control planes) is a layer that narrows what one tenant can do to another. None of it is complete alone, and most of it is off or permissive by default.

For a provider the question comes in two forms. The first is the customer's: a customer running many teams or many of its own customers on one cluster wants the provider's managed product to make that safe, and the providers now sell pieces of the answer (managed policy engines, sandboxed node pools, VM-isolated pods). The second is the provider's own: a provider that runs customer code on Kubernetes, a platform-as-a-service, a notebook or CI service, a developer environment, has the "multi-customer" case the Kubernetes docs describe, where the customer never sees the cluster and every isolation failure is the provider's incident. Gitpod ran developer environments that way for six years and then left Kubernetes, and its reasons are the clearest public list of what that case demands.

This chapter covers the official tenancy models and what a namespace can't isolate, RBAC and quotas at the depth a shared cluster needs, the move from PodSecurityPolicy to Pod Security Admission, admission control from webhooks to in-process CEL policies, Kyverno and Gatekeeper, signed-image admission, runtime detection with Falco, virtual clusters, sandboxed runtimes through RuntimeClass, and what running customer workloads on Kubernetes requires. The operating rules are the playbook's: [Namespaces and RBAC](/docs/operations/kubernetes#namespaces-and-rbac), [Network Policies](/docs/operations/kubernetes#network-policies), [Image Policy](/docs/operations/kubernetes#image-policy) and [Secrets](/docs/operations/kubernetes#secrets) for clusters, and [Multi-Tenancy](/docs/architecture/multi-tenancy#isolation-models) for applications. The sandboxes themselves (gVisor, Kata Containers, Firecracker) are Sandboxes & MicroVMs; this chapter covers only how Kubernetes selects them. It adds `cluster_tenants`, which records which account holds which namespace or virtual cluster on a shared cluster, and the policy records an audit needs.

## How the Providers Do It

| Provider | Managed policy engine, as of October 2026 | Stronger-than-container isolation | Default pod security | Tenancy guidance |
| --- | --- | --- | --- | --- |
| **Amazon EKS** | None in the docs opened; the best-practices guide gives Gatekeeper and Kyverno examples | Fargate: "Each Pod that runs on Fargate has its own compute boundary," a VM per pod with "a dedicated kernel," no privileged containers, DaemonSets, `HostPort` or `HostNetwork` | Kubernetes defaults | Soft multi-tenancy with namespaces, RBAC, quotas, network policies and sole-tenant nodes; hard multi-tenancy is a cluster per tenant |
| **Google GKE** | Policy Controller, "based on the open source Open Policy Agent Gatekeeper project," with a constraint template library, policy bundles and a fleet dashboard; at no additional cost on GKE Standard since September 2025 | GKE Sandbox: gVisor or microVM node pools, selected with RuntimeClass `gvisor` or `microvm`; gVisor "Enabled by default in Autopilot clusters" | Kubernetes defaults on Standard; Autopilot blocks adding `NET_RAW` | Sandbox for "untrusted or third-party workloads"; "generally no advantage" for trusted first-party code |
| **Azure AKS** | Azure Policy for Kubernetes, which "extends Gatekeeper v3"; the add-on syncs assignments and runs a full audit scan every 15 minutes; effects `audit`, `deny`, `disabled`, `mutate` | Pod Sandboxing: Kata Containers on Azure Linux node pools (`--workload-runtime KataVmIsolation`), RuntimeClass `kata-vm-isolation`, a VM with its own kernel per pod | Kubernetes defaults | Same Azure Policy add-on on Arc-connected clusters; Gatekeeper installed outside the add-on "aren't supported" |
| **Oracle OKE** | None: no policy add-on in the optional add-on list | Not offered as an add-on | Kubernetes defaults | Customer-installed engines |
| **vCluster** (Loft, independent) | n/a | A virtual control plane per tenant; private nodes give "its own CNI, CSI, and compute" | Host cluster's | "Shared nodes aren't a security boundary for untrusted tenants" |
| **Capsule** (Clastix, independent) | Its own policy engine for tenants | n/a | Inherited per Tenant | Namespaces grouped into a Tenant with inherited quotas, RBAC and policies |

Four patterns run through the table:

- **Every hyperscaler's policy product is Gatekeeper.** Google and Microsoft both chose OPA Gatekeeper as the engine and sell the catalog, the dashboard and the fleet-wide assignment, not the enforcement code.
- **Hard isolation is sold as a node or pod type, not a cluster setting.** AWS isolates per pod with Fargate, Google with sandboxed node pools, Microsoft with Kata node pools; each is a different SKU with its own limits (no DaemonSets on Fargate, no privileged containers in gVisor, Azure Linux only for Kata).
- **The defaults are the upstream defaults.** No provider in the table turns on a restricted Pod Security level for customer namespaces by default; Autopilot's restrictions are the exception that proves the point.
- **Everyone's guidance ends at the cluster.** AWS says it, Google says multi-tenant clusters are "more exposed to security vulnerabilities than other clusters," and vCluster's own docs say its shared-node mode is not a boundary for untrusted tenants.

## How We Got Here

Kubernetes' history of sharing is a history of moving controls from configurable but dangerous, to built in and narrow, to declarative and in-process. Earlier schedulers and their isolation models are Schedulers: Borg to Kubernetes.

| When | Event | What it solved | What it cost |
| --- | --- | --- | --- |
| 1.3 | PodSecurityPolicy built in as an admission controller | Cluster-wide limits on privileged pods, host namespaces, volumes | An authorization model "confusing to nearly everyone," no dry run, never safe to enable by default |
| 2016 | Sysdig created and open sourced Falco | Runtime detection from kernel events | Detection, not prevention |
| March 29, 2018 | OPA accepted into the CNCF Sandbox | A general policy engine (Rego) | A language to learn |
| October 10, 2018 | Falco accepted into the CNCF | n/a | n/a |
| August 6, 2019 | OPA Gatekeeper introduced on the Kubernetes blog | Policy as CRDs: ConstraintTemplates and Constraints, with audit | A webhook on the API server's request path |
| January 8, 2020 | Falco moved to incubating | n/a | n/a |
| November 10, 2020 | Kyverno accepted into the CNCF | Policies written as Kubernetes resources, no new language | Another webhook |
| 1.20 | RuntimeClass stable | Per-pod choice of runtime, so a sandbox can be selected | Nodes must carry the handler |
| January 29, 2021 | OPA graduated (announced February 4) | n/a | n/a |
| April 6, 2021 | PSP deprecation announced for 1.21, removal planned for 1.25 | A path to a simpler built-in replacement | Every PSP user had to migrate |
| April 19, 2021 | vCluster v0.1.0 | A virtual control plane per tenant on a shared cluster | A control plane per tenant to run |
| July 13, 2022 | Kyverno moved to incubating | n/a | n/a |
| 1.25 | PSP removed; Pod Security Admission stable | Three fixed levels per namespace, with audit and warn modes | No custom rules; anything finer needs a policy engine |
| December 13, 2022 | Capsule accepted into the CNCF Sandbox | Tenants as groups of namespaces with inherited policy | n/a |
| February 29, 2024 | Falco graduated | n/a | n/a |
| April 24, 2024 | ValidatingAdmissionPolicy GA in 1.30 | CEL validation inside the API server, no webhook process | Validation only, until MutatingAdmissionPolicy |
| October 31, 2024 | Gitpod published "We are leaving Kubernetes" after six years | n/a | The clearest public account of what multi-customer isolation costs |
| 1.32, 1.34, 1.36 | MutatingAdmissionPolicy alpha, beta, then stable and on by default | CEL mutation inside the API server | n/a |
| August 20, 2025 | OPA's creators and many Styra team members joined Apple; no change to OPA's governance or license | n/a | The commercial company behind OPA was no longer its main employer |
| March 16 and 24, 2026 | Kyverno graduated (CNCF page; announced at KubeCon Europe on March 24) | n/a | n/a |

The direction is consistent: each step removed a component a provider had to run and secure on the API server's request path, or replaced an unbounded mechanism with a bounded one. The cost of each was the same, a migration for everyone on the previous mechanism.

## The Official Tenancy Models

The Kubernetes docs separate two use cases. In the **multi-team** case a tenant "is typically a team," the teams use the Kubernetes API, and "RBAC, quotas, and network policies are essential." In the **multi-customer** case "the customers do not have access to the cluster; Kubernetes is invisible from their perspective," and a tenant "is simply a group of users who share a single workload." Isolation is a spectrum from "soft" to "hard," and hard multi-tenancy, "where the tenants do not trust each other," usually needs extra work on the data plane, which "typically" has "much larger attack surfaces" than the control plane.

| Model | What each tenant gets | Isolates | Doesn't isolate | Cost |
| --- | --- | --- | --- | --- |
| **Namespace per tenant** | Namespaces, with Roles, quotas and network policies | Object names, namespaced RBAC and policies | Cluster-scoped resources ("Custom Resource Definitions, Storage Classes, and Webhooks"), nodes and the kernel, the API server, DNS | "Negligible resource cost," but "can be difficult to configure" |
| **Virtual control plane per tenant** | Its own API server, controller manager and etcd, synced to a super-cluster's shared nodes | Control-plane noisy neighbors, CRD and webhook conflicts, policy blast radius | The data plane: "per-tenant control planes do not solve isolation problems in the data plane" | A control plane per tenant to run and maintain |
| **Cluster per tenant** | A whole cluster | Everything Kubernetes shares | Nothing inside Kubernetes; the provider's own infrastructure remains shared | A control plane fee and unshared capacity per tenant |

What a namespace can't isolate is the list a provider designs around:

- **Cluster-scoped objects.** CRDs, StorageClasses, webhooks, ClusterRoles, PersistentVolumes (which have "a lifecycle independent of workloads and namespaces") and Namespaces themselves. The EKS guide adds the visibility problem: a tenant that can view one Namespace "can view all Namespaces within the cluster."
- **Nodes.** Pods from different tenants share a kernel unless something prevents it; even with dedicated nodes, "the kubelet and (unless using virtual control planes) the API service are still shared services."
- **DNS.** "By default, the Kubernetes DNS service allows lookups across all namespaces"; CoreDNS can restrict it.
- **The network.** All pods can reach all pods until a [default-deny NetworkPolicy](/docs/operations/kubernetes#network-policies) exists and the CNI enforces it; "Quotas cannot protect against all kinds of resource sharing, such as network traffic."
- **The API server's capacity.** API Priority and Fairness can prioritize tenants' API calls; it matters when customers run controllers.

The docs' own recommendation for a multi-customer platform is to isolate every workload in its own namespace, use fleet-unique namespace names so a tenant can later move between shared and dedicated clusters, and, when namespaces aren't enough and dedicated clusters too expensive, use a virtual control plane. That move between clusters is the [tenant hierarchy](/docs/architecture/multi-tenancy#tenant-hierarchies) and isolation-model choice the playbook describes for databases, applied to compute.

## RBAC, Quotas and Limits

The playbook's [Namespaces and RBAC](/docs/operations/kubernetes#namespaces-and-rbac) rules (least privilege, humans read and pipelines write, no `cluster-admin` for applications, no token automount) apply unchanged. On a shared cluster four details of RBAC decide whether a tenant can escalate:

- **Escalation is blocked at the API.** A user can create or update a Role only if they already hold every permission in it or have the `escalate` verb on roles, and can create a RoleBinding only if they hold the role's permissions or have `bind` on it. Because this is enforced by the API, it "applies even when the RBAC authorizer is not in use." A tenant administrator can therefore be given `bind` on exactly the `admin`, `edit` and `view` ClusterRoles in its own namespace and nothing else.
- **The default roles are wider than their names.** `admin` can create roles and role bindings in its namespace but "does not allow write access to resource quota or to the namespace itself"; `edit` "allows accessing Secrets and running Pods as any ServiceAccount in the namespace," so it is effectively the namespace's service accounts' permissions too; `view` can't read Secrets.
- **Aggregation extends defaults silently.** Any ClusterRole labelled `rbac.authorization.k8s.io/aggregate-to-edit: "true"` adds its rules to `edit` in every namespace, which is how an operator's CRDs become editable by tenants, and how a careless chart grants more than intended.
- **Cluster-level objects are "less useful for multi-tenant clusters."** Tenant access should be RoleBindings in tenant namespaces, never ClusterRoleBindings.

**ResourceQuota** caps what a namespace can consume and create; a request that would exceed it is rejected with HTTP 403, and existing objects are never affected. The quota names a provider uses:

| Quota | Limits |
| --- | --- |
| `requests.cpu`, `requests.memory`, `limits.cpu`, `limits.memory` | Sums across non-terminal pods; once set, every new pod "**must** specify either `requests` or `limits` for that resource" or may be rejected |
| `requests.storage`, `persistentvolumeclaims`, `<class>.storageclass.storage.k8s.io/requests.storage` | Total claimed storage, claim count, and both per StorageClass, so a premium class can be capped separately |
| `services.loadbalancers`, `services.nodeports` | The number of `LoadBalancer` Services and node ports, which is the number of billed load balancers a tenant can create ([Cluster Networking](/books/hosting-and-cloud/cluster-networking)) |
| `count/<resource>.<group>` | Object counts (`count/secrets`, `count/deployments.apps`), protecting etcd; not enforced for aggregated APIs |
| Scopes: `BestEffort`, `NotBestEffort`, `Terminating`, `NotTerminating`, `PriorityClass`, `CrossNamespacePodAffinity`, `VolumeAttributesClass` | Which objects a quota counts; `pods: "0"` with `CrossNamespacePodAffinity` stops a tenant's pods using affinity terms that name other namespaces |

Two caveats matter for billing. A Deployment that exceeds quota is still created; its pods are what fail, so "the Deployment may not be able to get all of the Pods it manages to exist" and the error is in the ReplicaSet's events. And quotas count requests, not use, which is why the EKS guide recommends quotas "to force tenants to specify requests and limits" and to "apportion the cluster's resources to align with a tenant's spend."

**LimitRange** fills the gap quotas create: the LimitRanger admission plugin checks pods against a namespace's minimum and maximum and "can also be used to apply default resource requests to Pods that don't specify any," so a tenant's unannotated pod is admitted with defaults instead of rejected. **PriorityClasses** with preemption let a paid tier evict a free one when capacity is short, at the cost the EKS guide warns about: preempted pods' PodDisruptionBudgets are "not guaranteed." Noisy neighbors beyond the cluster are the playbook's [Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors).

## From PodSecurityPolicy to Pod Security Admission

PodSecurityPolicy was built in "since Kubernetes 1.3" and failed on usability. The deprecation post of April 6, 2021 lists why: the way PSPs applied to pods "has proven confusing to nearly everyone that has attempted to use them," it was "easy to accidentally grant broader permissions than intended, and difficult to inspect which PSP(s) apply," its mutation of pod defaults applied only to some fields, and without a dry run or audit mode "it's impossible for PSP to ever be enabled by default." It was deprecated in 1.21 and removed in 1.25. The replacement, KEP 2579, was designed "to be as simple as practically possible" and to coexist with external admission controllers; users with complex PSP setups were pointed at Kyverno, OPA Gatekeeper or K-Rail.

**Pod Security Admission**, stable since 1.25, enforces the three Pod Security Standards levels, `privileged`, `baseline` and `restricted`, per namespace, through labels:

```yaml
pod-security.kubernetes.io/enforce: restricted       # reject violating pods
pod-security.kubernetes.io/enforce-version: v1.37    # pin the rules, or "latest"
pod-security.kubernetes.io/warn: restricted          # user-facing warning only
pod-security.kubernetes.io/audit: restricted         # annotation in the audit log only
```

Three behaviors catch operators. Enforce applies only to pods, not to Deployments or Jobs, so a violating Deployment is accepted and only its pods are rejected; `warn` and `audit` do apply to workload resources, which is why setting all three is the safe rollout. Exemptions are by username, RuntimeClass name or namespace, configured on the API server, and an exempt request skips all three modes; the docs warn against exempting controller service accounts, because that would implicitly exempt anyone who can create the corresponding workload resource. And the levels are fixed: anything finer, such as allowed registries or required labels, needs an admission policy.

For a provider, the version label is the detail to own. A managed cluster that sets `enforce-version` on tenant namespaces controls when stricter rules arrive; one that leaves `latest` lets a control plane upgrade change what admits.

## Admission Control

Every write to the API server passes through admission after authentication and authorization. Mutating admission runs first and validating admission second, so validators see the final object. The default-enabled plugins in current Kubernetes include `NamespaceLifecycle`, `LimitRanger`, `ServiceAccount`, `ResourceQuota`, `PodSecurity`, `RuntimeClass`, `MutatingAdmissionWebhook`, `ValidatingAdmissionWebhook`, `ValidatingAdmissionPolicy` and `MutatingAdmissionPolicy`. Three mechanisms extend it.

**Webhooks.** A `MutatingWebhookConfiguration` or `ValidatingWebhookConfiguration` lists webhooks, each with `rules` (operations, API groups, versions, resources, scope), a `clientConfig` (a Service or an `https://` URL plus `caBundle`), and the fields that decide failure behavior:

| Field | Values and default | Why it matters on a shared cluster |
| --- | --- | --- |
| `failurePolicy` | `Fail` (default) or `Ignore` | `Fail` makes the webhook a dependency of every matching write; `Ignore` makes it bypassable by making it slow |
| `timeoutSeconds` | 1 to 30, default 10 | A slow webhook adds latency to every matching request |
| `namespaceSelector`, `objectSelector` | Label selectors | `objectSelector` should be opt-in only, "because end users may skip the admission webhook by setting the labels" |
| `matchConditions` | Up to 64 CEL expressions, all must be true | Skip the webhook for system requests without calling it |
| `sideEffects` | `None` or `NoneOnDryRun` | Without one, dry-run requests fail |
| `reinvocationPolicy` | `Never` (default) or `IfNeeded` | Mutating webhooks may run again after others change the object |

Mutating webhooks are called in serial and validating webhooks in parallel; an explicit `allowed: false` always denies. The response's only `patchType` is `JSONPatch`. Since 1.37, webhooks exclude virtual authorization resources such as TokenReviews and SubjectAccessReviews by default. The risk a webhook adds is that it is a network service in the request path with whatever permissions its pod holds, which is the lesson of [the ingress-nginx story](/books/hosting-and-cloud/cluster-networking#the-ingress-nginx-story): an admission webhook reachable from the pod network became cluster-wide code execution.

**ValidatingAdmissionPolicy**, GA in 1.30 (April 24, 2024), is "a declarative alternative to validating admission webhooks": CEL expressions evaluated inside the API server. A `ValidatingAdmissionPolicy` has `matchConstraints`, optional `matchConditions`, `variables`, and `validations` (each an `expression` with a `message` or `messageExpression` and a `reason`), a `failurePolicy` that defaults to `Fail`, `auditAnnotations`, and a `paramKind` naming a parameter resource. A `ValidatingAdmissionPolicyBinding` attaches it with `validationActions` (`Deny`, `Warn`, `Audit`), `matchResources` and a `paramRef` (by name or selector, with a required `parameterNotFoundAction`). Expressions are type-checked when the policy is written, with results in `status.typeChecking`. The parameter split is what makes it a tenancy tool: one policy, "replicas must not exceed `params.maxReplicas`," bound per tenant namespace with a different parameter object for each plan.

**MutatingAdmissionPolicy** (KEP-3962) is the mutating counterpart: alpha in 1.32, beta in 1.34, stable and on by default in 1.36. Its mutations are CEL expressions producing either an apply configuration merged with server-side apply or a JSON patch (`patchType: "JSONPatch"`, with `jsonpatch.escapeKey()` for keys containing `/` or `~`), with the same `paramKind`, `failurePolicy` and `reinvocationPolicy` concepts as webhooks, bound by a `MutatingAdmissionPolicyBinding`. Policies and bindings are themselves exempt from REST-created policies, so a policy can't block changes to the policies themselves.

The in-process policies remove the two things that made webhooks risky: a separate process to secure and a network hop to fail. Their documented inputs are the request, the object and its old version, parameters from in-cluster resources, the namespace and an authorizer; checks that need something outside the cluster, such as a registry lookup or a signature verification, are what policy engines still run webhooks for.

## Policy Engines: Kyverno and Gatekeeper

**OPA Gatekeeper** was introduced on the Kubernetes blog on August 6, 2019. A `ConstraintTemplate` holds "both the Rego logic that enforces the Constraint and the schema for the Constraint"; a Constraint instantiates it with parameters and match criteria; Constraints are ANDed; and an audit controller writes violations of existing objects to each Constraint's status. Gatekeeper also supports mutation (`Assign` and related kinds, which the EKS guide uses to stamp tenant node affinity and tolerations onto pods), and can enforce through ValidatingAdmissionPolicy: Azure Policy's add-on exposes `vap.k8s.io` as an enforcement point beside Gatekeeper's own webhook (`validation.gatekeeper.sh`) and audit (`audit.gatekeeper.sh`). OPA itself entered the CNCF Sandbox on March 29, 2018, moved to incubating on April 2, 2019 and graduated on January 29, 2021. On August 20, 2025 its creators "(along with many team members from Styra)" joined Apple; OPA stays CNCF-graduated with "no changes to the project governance or licensing," and Styra's EOPA distribution, OPA Control Plane, SDKs and the Regal linter were proposed for transfer into the CNCF OPA organization.

**Kyverno**, created by Nirmata, was accepted into the CNCF on November 10, 2020, moved to incubating on July 13, 2022, and graduated in March 2026, announced on March 24 at KubeCon Europe; a LinkedIn engineer quoted in the announcement described it enforcing policy across "230+ clusters with 500K+ nodes." Kyverno policies "validate, mutate, generate, or cleanup (remove) any Kubernetes resource," written in YAML and CEL as Kubernetes resources, with policy reports in the OpenReport format. Its latest release "fully adopted" CEL: the documentation lists ValidatingPolicy, MutatingPolicy, GeneratingPolicy, DeletingPolicy and ImageValidatingPolicy as the policy types, and marks the older `ClusterPolicy` and cleanup policy as deprecated. `generate` is the feature tenancy uses most: creating a default-deny NetworkPolicy, a ResourceQuota and a LimitRange whenever a tenant namespace appears.

| | Gatekeeper | Kyverno |
| --- | --- | --- |
| Language | Rego in ConstraintTemplates | YAML and CEL as Kubernetes resources |
| Validate, mutate | Yes | Yes |
| Existing objects | Audit controller, violations in Constraint status | Policy reports in the OpenReport format |
| Built-in CEL path | Can enforce through ValidatingAdmissionPolicy (Azure Policy's `vap.k8s.io` enforcement point) | CEL-native policy types |
| Signature verification | Not part of the ConstraintTemplate model described here | `verifyImages` and ImageValidatingPolicy |
| Governance | OPA, CNCF graduated; creators now at Apple | CNCF graduated March 2026; Nirmata origin |
| Provider products | GKE Policy Controller, Azure Policy for AKS | None in the table above |

## Admitting Only Signed Images

The playbook's [Image Policy](/docs/operations/kubernetes#image-policy) rule is to run only images built and signed by your own CI, by digest; [Trusting What You Run](/docs/delivery/containers#trusting-what-you-run) covers producing the signatures. Two admission tools enforce it.

- **Kyverno `verifyImages`** rules match `imageReferences` and check `attestors`: keys, certificates, or keyless identities by `subject` and `issuer` (or regex variants) against a Rekor transparency log. "Each `verifyImages` rule can be used to verify signatures or attestations, but not both." With `mutateDigest`, which "is set to `true` (which is the default)," Kyverno rewrites a tag to the verified digest, so the kubelet runs exactly what was checked. Setting the policy's `failurePolicy` to `Ignore` lets pods through when the registry is unreachable, which is the availability-versus-assurance choice every provider has to make explicit.
- **The sigstore policy-controller** validates namespaces labelled `policy.sigstore.dev/include: "true"` against `ClusterImagePolicy` objects: `images` globs, `authorities` (`key`, `keyless` or `static`), and attestations checked with CUE or Rego. Matching policies are ANDed and authorities within one are ORed; `spec.mode: warn` admits with a warning; with no `no-match-policy` set, "any image that does not match a policy is rejected"; and it "resolves the image tags to ensure the image being ran is not different from when it was admitted."

Verification at admission and verification at the GitOps source ([Flux's `OCIRepository` verify](/books/hosting-and-cloud/packaging-and-gitops#charts-and-manifests-as-oci-artifacts)) check different things: the source check protects the manifests, the admission check protects the images those manifests name. A provider that offers both lets a customer require signatures end to end.

## Runtime Detection: Falco

Admission decides what may start; nothing in it sees what a container does afterwards. Falco, created by Sysdig in 2016 and graduated from the CNCF on February 29, 2024, parses Linux syscalls through a modern eBPF probe (the default) or a kernel module, and plugins add other event sources such as Kubernetes audit logs and cloud audit trails. Rules in YAML define "the conditions under which an alert should be generated," with an output string; alerts go to stdout, files, syslog, programs or HTTP endpoints, and Falcosidekick fans them out to other systems. Falco detects and alerts; any response is a downstream action.

For a provider running customer code, runtime detection is where abuse shows up first: a shell spawned in a container that never runs one, a miner's connection pattern, a write to a binary directory. The alert is the input to an abuse case ([UGP abuse desks](/books/user-generated-platforms/abuse-desks#how-to-build-it)) as much as to a security team, and Abuse on Infrastructure covers the response.

## Virtual Clusters: vCluster and Capsule

Two projects fill the gap between a namespace and a cluster, from opposite ends.

**vCluster** gives each tenant a real control plane: the API server, controller manager, data store (embedded SQLite by default, or etcd, MySQL or PostgreSQL) and a syncer run in one StatefulSet pod in a namespace of the host cluster, with CoreDNS beside it. The tenant gets its own CRDs, webhooks and RBAC, so the cluster-scoped problems of namespace tenancy disappear inside it. What happens to workloads depends on the node model. With **shared nodes**, the open-source default, the syncer translates Pods, ConfigMaps, Secrets, Services and Ingresses into a hidden namespace on the host, and the docs say plainly that "shared nodes aren't a security boundary for untrusted tenants with cluster or scheduler access." With **private nodes**, "each tenant gets its own CNI, CSI, and compute." vCluster is Apache 2.0; v0.1.0 shipped on April 19, 2021.

**Capsule**, from Clastix and in the CNCF Sandbox since December 13, 2022 (Apache 2.0), stays with namespaces: a Tenant is "a grouping of Kubernetes Namespaces," tenant users can create namespaces inside it, and network and security policies, quotas, limit ranges and RBAC set at the tenant level are "automatically inherited by all the namespaces in the tenant." It solves the administration of namespace tenancy, not its limits; CRDs and nodes are still shared.

The Kubernetes docs' super-cluster model and vCluster are the same idea, and both carry the same caveat: a virtual control plane fixes the control plane, and the data plane still needs node isolation or sandboxes.

## Sandboxed Runtimes and RuntimeClass

Containers "offer a weaker isolation boundary than virtual machines," and the Kubernetes docs recommend sandboxing, running "each pod in a separate execution environment such as a virtual machine or a userspace kernel," for untrusted code. Kubernetes selects sandboxes through **RuntimeClass** (`node.k8s.io/v1`, stable since 1.20), a cluster-scoped object with a `handler` that names a CRI runtime configuration, an `overhead` that the scheduler and quotas add to every pod using it, and `scheduling` with a `nodeSelector` (intersected with the pod's) and `tolerations` (unioned with the pod's) so pods land only on nodes that have the runtime. A pod opts in with `spec.runtimeClassName`; if the class doesn't exist or the node can't run it, the pod enters `Failed`.

The providers' sandboxes are RuntimeClasses over node pools:

- **GKE Sandbox** enables gVisor or microVMs on node pools (`--sandbox=type=gvisor`) or through ComputeClasses, selected with RuntimeClass `gvisor` or `microvm`. gVisor pods can't run privileged containers, use hostPath or raw block volumes, `kubectl port-forward` or sysctls, and seccomp, AppArmor and SELinux don't apply inside; Standard clusters must keep at least one non-sandboxed pool.
- **AKS Pod Sandboxing** runs Kata Containers on Azure Linux node pools created with `--workload-runtime KataVmIsolation`, selected with `runtimeClassName: kata-vm-isolation`; each pod VM gets memory from the pod's limit (512Mi if none), CPU limits round up to whole vCPUs, and host networking isn't supported.
- **EKS on Fargate** needs no RuntimeClass: each pod is its own VM by construction, at the cost of the Fargate restrictions.

Two interactions with the rest of the chapter matter. A RuntimeClass's `overhead` is accounted for on top of each pod's own requests, so the same capacity holds fewer pods on a sandboxed class, which belongs in the plan's description. And Pod Security Admission can exempt by RuntimeClass name: a provider may relax pod security for sandboxed pods, since the kernel boundary is elsewhere, but that exemption must only ever be grantable on nodes that actually run the sandbox, which is what the RuntimeClass `scheduling` block enforces. The hypervisors and kernels underneath are Sandboxes & MicroVMs.

## Running Customer Workloads on Kubernetes

The multi-customer case is the provider's own. Gitpod's "We are leaving Kubernetes" (October 31, 2024, by Christian Weichel and Alejandro de Brito Fontes) reports six years of running cloud development environments on Kubernetes for about 1.5 million users with thousands of environments started a day. The problems were the tenancy problems of this chapter at full strength: bursty builds starving IDE servers on shared CPU, memory overbooking nearly impossible until swap arrived in 1.22, persistent volumes with unpredictable attach timing (see [Storage & Stateful Workloads](/books/hosting-and-cloud/kubernetes-storage)), images over 10 GB, per-port Services that didn't scale, and root access for users, which required user-namespace workarounds (shiftfs, a masked `/proc`, seccomp notify, custom eBPF device policies, nested network namespaces) that grew complex and hard to maintain. MicroVM experiments with Firecracker and Cloud Hypervisor ran into missing GPU and virtiofs support and slow snapshot restores. The conclusion: "Kubernetes is built to run well controlled application workloads, not unruly development environments."

The list generalizes into what multi-customer tenancy on Kubernetes requires, whatever the product:

- **No customer access to the Kubernetes API,** or a virtual control plane per customer if they need one; the multi-customer case in the docs assumes Kubernetes is invisible.
- **A namespace per customer workload,** fleet-unique, with default-deny network policy, quotas, limit ranges and a restricted Pod Security level, all created by the provider's control plane and not editable by the tenant.
- **A sandbox or a dedicated node for anything untrusted,** recorded per tenant, because running customer code on a shared kernel is the hard case every provider's guidance warns about.
- **Policy that tenants can't modify,** enforced in-process where possible (VAP, MAP, Pod Security Admission) and by a governed engine where not.
- **DNS, metadata and egress closed by default:** CoreDNS restricted to the namespace, the cloud metadata address blocked (GKE's docs say to block 169.254.169.254 with a NetworkPolicy when using Workload Identity), and egress limited.
- **Runtime detection wired to abuse handling,** because abuse such as cryptomining shows up as behavior, not configuration.
- **A record of which customer held which namespace when,** so an alert, a bill or a legal request names a tenant, not a namespace.

## The Alternatives

| Choice | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Namespace per tenant** | Namespaces, RBAC, quotas, policies | Cheap, built in, dense | Cluster-scoped objects, nodes, DNS and the API server are shared | Kubernetes | Negligible | Multi-team clusters, SaaS with provider-only API access |
| **Capsule** | Tenants as groups of namespaces with inherited policy | Self-service namespaces without per-namespace administration | Same data-plane and cluster-scope limits as namespaces | Apache 2.0; CNCF Sandbox; Clastix | Free | Platform teams offering namespaces as a service |
| **vCluster** | Virtual control plane per tenant | Own CRDs, webhooks, RBAC; fast to create | Shared nodes are not a boundary for untrusted tenants | Apache 2.0; Loft | Free; private nodes cost nodes | Dev, CI and preview environments; KaaS |
| **Cluster per tenant** | A cluster each | The only strong boundary in the guides | Fragmented capacity, a fleet to manage, slow to create | Provider | A control plane fee and unshared nodes per tenant | Regulated or high-value tenants |
| **Pod Security Admission** | Three fixed levels per namespace | Built in, no webhook, warn and audit modes | No custom rules; enforce ignores workload objects | Kubernetes | Free | Every cluster, as the floor |
| **ValidatingAdmissionPolicy / MutatingAdmissionPolicy** | CEL in the API server | No webhook process or network hop; parameters per tenant | No external calls or signature checks | Kubernetes | Free | Clusters on 1.30+ (VAP) and 1.36+ (MAP) |
| **Gatekeeper** | Rego ConstraintTemplates via webhook, plus audit | Mature audit, provider-managed (GKE, AKS), can enforce through VAP | Rego to learn; a webhook to run; its creators' company changed | Apache 2.0; OPA CNCF graduated | Free; bundled in GKE Standard and Azure Policy | GKE and AKS customers, enterprises with Rego |
| **Kyverno** | Kubernetes-resource and CEL policies via webhook | Generate and cleanup, image verification, no new language | Another webhook on the request path | Apache 2.0; CNCF graduated 2026; Nirmata | Free | Platform teams, multi-tenant clusters |
| **sigstore policy-controller** | Signature and attestation admission | Focused, namespace opt-in, tag-to-digest resolution | Image policy only | Apache 2.0; Sigstore | Free | Clusters enforcing signed images |
| **Falco** | Syscall and audit-log detection | Sees runtime behavior admission can't | Alerts only; rule tuning | Apache 2.0; CNCF graduated; Sysdig origin | Free; nodes' CPU | Runtime detection on shared and customer clusters |
| **Sandboxed RuntimeClass** (GKE Sandbox, AKS Kata, Fargate) | VM or userspace kernel per pod | A real boundary for untrusted code on shared nodes | Feature restrictions; per-pod overhead | Provider | The provider's sandbox SKU | Untrusted and third-party workloads |

## My Default

For customers sharing a managed cluster across their own teams, my default is a namespace per workload with the restricted Pod Security level enforced, pinned by `enforce-version`, and `warn` and `audit` set beside it; default-deny network policies and quotas created by the platform, not the tenant; and ValidatingAdmissionPolicy with per-plan parameters for anything the built-in levels don't cover. I'd add a webhook-based engine only for what CEL can't do, which is mostly signature verification and generating defaults, and I'd pick Kyverno for its `generate` rules and image verification unless the customer already writes Rego, in which case the provider-managed Gatekeeper (Policy Controller, Azure Policy) is the cheaper path. Every webhook gets `matchConditions` that skip system namespaces, a timeout of a few seconds, and network policy allowing only the API server to reach it.

For a provider running its own customers' code, my default is that the customer never touches the Kubernetes API, every workload runs in a sandboxed RuntimeClass on a node pool that only runs sandboxed pods, the provider's policies are enforced in-process and can't be bound or edited by anything in a tenant namespace, and Falco alerts feed the abuse desk. Customers who need the Kubernetes API get a vCluster on private nodes, never shared nodes; customers who need regulatory isolation get their own cluster. What would change this is the workload: if the product is developer environments with root access and multi-gigabyte images, Gitpod's six years are evidence that the right answer may be VMs scheduled by something other than Kubernetes, and Sandboxes & MicroVMs is where that design lives.

## How to Build It

The chapter adds a tenancy mode to [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture)'s `clusters`, the `cluster_tenants` table that records which account holds which namespace or virtual cluster on a shared cluster, and two tables for policy: the policies in force and the findings they produce. The cluster's own `resources.account_id` is the owner (often the provider itself, for a platform's shared cluster); `cluster_tenants.account_id` is the tenant. Node pools are [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes)'s `node_pools (resource_id)`.

```sql
ALTER TABLE clusters                     -- Kubernetes Architecture's side table
  ADD COLUMN tenancy_mode TEXT NOT NULL DEFAULT 'single_tenant'
    CHECK (tenancy_mode IN ('single_tenant', 'multi_team', 'multi_customer'));

CREATE TABLE cluster_tenants (           -- who holds which slice of a shared cluster, when
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),   -- the tenant
  project_id           UUID REFERENCES projects (id),
  cluster_id           UUID NOT NULL REFERENCES clusters (resource_id),
  isolation_model      TEXT NOT NULL CHECK (isolation_model IN ('namespace',
                         'namespace_group', 'virtual_cluster', 'dedicated_nodes',
                         'dedicated_cluster')),
  host_namespace       TEXT NOT NULL,    -- the namespace it occupies, or the one its vCluster runs in
  tenant_group         TEXT,             -- Capsule Tenant, when namespace_group
  virtual_cluster      TEXT,             -- vCluster name, when virtual_cluster
  node_pool_id         UUID REFERENCES node_pools (resource_id),  -- dedicated or private nodes
  runtime_class        TEXT,             -- 'gvisor', 'microvm', 'kata-vm-isolation'; null: runc
  trust                TEXT NOT NULL CHECK (trust IN ('trusted', 'untrusted')),
  api_access           TEXT NOT NULL CHECK (api_access IN ('none', 'namespaced',
                         'virtual_cluster_admin')),
  pod_security_level   TEXT NOT NULL CHECK (pod_security_level IN ('privileged', 'baseline',
                         'restricted')),
  pod_security_version TEXT NOT NULL,    -- the pinned enforce-version, never 'latest'
  network_default_deny BOOLEAN NOT NULL,
  valid_during         TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (cluster_id WITH =, host_namespace WITH =, valid_during WITH &&),
                                         -- one holder of a namespace at a time
  CHECK ((isolation_model = 'virtual_cluster') = (virtual_cluster IS NOT NULL)),
  CHECK ((isolation_model = 'namespace_group') = (tenant_group IS NOT NULL)),
  CHECK (isolation_model <> 'dedicated_nodes' OR node_pool_id IS NOT NULL),
  CHECK (trust = 'trusted' OR runtime_class IS NOT NULL OR node_pool_id IS NOT NULL
         OR isolation_model = 'dedicated_cluster'),  -- untrusted code never on shared runc nodes
  CHECK (api_access <> 'virtual_cluster_admin' OR isolation_model = 'virtual_cluster')
);

CREATE TABLE cluster_policies (          -- admission and runtime policies in force, versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  cluster_id       UUID NOT NULL REFERENCES clusters (resource_id),
  engine           TEXT NOT NULL CHECK (engine IN ('pod_security_admission',
                     'validating_admission_policy', 'mutating_admission_policy', 'webhook',
                     'gatekeeper', 'kyverno', 'sigstore_policy_controller', 'falco')),
  managed_by       TEXT NOT NULL CHECK (managed_by IN ('provider', 'customer')),
  product          TEXT,                 -- 'gke_policy_controller', 'azure_policy'; null: self-run
  kind             TEXT NOT NULL,        -- 'ValidatingAdmissionPolicy', 'ConstraintTemplate', ...
  name             TEXT NOT NULL,
  namespace        TEXT,                 -- null: cluster-scoped
  enforcement      TEXT NOT NULL CHECK (enforcement IN ('deny', 'warn', 'audit', 'mutate',
                     'generate', 'detect')),
  failure_policy   TEXT CHECK (failure_policy IN ('fail', 'ignore')),  -- null for runtime rules
  content_digest   TEXT NOT NULL,        -- sha256 of the policy as applied
  valid_during     TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (cluster_id WITH =, engine WITH =, kind WITH =, name WITH =,
    (COALESCE(namespace, '')) WITH =, valid_during WITH &&)
);

CREATE TABLE policy_findings (           -- denials, warnings, audit violations, runtime alerts
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  cluster_id       UUID NOT NULL REFERENCES clusters (resource_id),
  policy_id        UUID NOT NULL REFERENCES cluster_policies (id),
  cluster_tenant_id UUID REFERENCES cluster_tenants (id),  -- resolved at observed_at
  observed_at      TIMESTAMPTZ NOT NULL,
  source           TEXT NOT NULL CHECK (source IN ('admission', 'audit_scan', 'runtime')),
  outcome          TEXT NOT NULL CHECK (outcome IN ('denied', 'warned', 'audited', 'detected')),
  object_kind      TEXT,
  object_namespace TEXT,
  object_name      TEXT,
  object_uid       UUID,
  actor            TEXT,                 -- the request's user or service account
  detail           JSONB NOT NULL,       -- the engine's message, rule and fields
  case_id          UUID REFERENCES moderation_cases (id),  -- when it became an abuse case
  idempotency_key  TEXT NOT NULL UNIQUE  -- engines and collectors retry
);
```

Notes on the sketch:

- **A namespace has one holder at a time.** The exclusion constraint makes "which account held `t-4f2a` at 03:10" a single row, so a Falco alert, a usage record or a legal request about a pod in a shared cluster resolves to a tenant the way an IP address resolves to a resource.
- **Untrusted code can't be recorded on shared runc nodes.** The `trust` check encodes the rule this chapter's sources agree on: an untrusted tenant needs a sandboxed RuntimeClass, dedicated or private nodes, or its own cluster.
- **Pod security is pinned and stored.** `pod_security_version` is the label the provider set, so an upgrade that would change admission is a planned migration across tenants, not a side effect.
- **Policies are versioned by content.** `content_digest` and `valid_during` say exactly which rule denied a request last Tuesday, even after the policy changed, and whether the provider or the customer owned it.
- **Findings are sparse by design.** Allowed requests aren't recorded; denials, warnings, audit violations and runtime alerts are, with an idempotency key because audit scans and alert pipelines repeat themselves.
- **Billing follows the tenant.** Usage collected per namespace is attributed through `cluster_tenants` ([Autoscaling & Cost](/books/hosting-and-cloud/autoscaling-and-cost) owns the allocation dimensions); a sandboxed RuntimeClass's overhead is billable capacity the tenant consumed.
- **Events:** `tenant.namespace_assigned`, `tenant.namespace_released`, `tenant.isolation_changed`, `policy.changed`, `policy.denied` (rate-limited), `runtime.alert` and `runtime.alert_escalated` go through the outbox to the abuse desk, notifications and the audit store.

## Auditing

- **Who held each namespace and virtual cluster, when.** With isolation model, runtime class and node pool, so an incident or a legal request about a workload names an account and the isolation it had.
- **Which policies were in force, and their exact content.** Provider-managed and customer-managed, with versions and enforcement modes, so a denial or a missed denial can be explained.
- **Every denial, violation and runtime alert, with its actor.** Linked to the tenant at that instant and to an abuse case where one was opened.
- **Isolation changes.** Moving a tenant from shared nodes to a sandbox, relaxing a Pod Security level or granting API access are changes with an approver ([typed actors](/docs/architecture/audit-trails#typed-actors)).
- **Webhook configuration and failure policy.** Which webhooks could block or modify writes, with `failurePolicy` and timeout, because a webhook set to `Ignore` is a policy that can be bypassed by load.
- **Isolation tests.** The results of regularly trying cross-tenant access that must fail, as the playbook's [Testing Isolation](/docs/architecture/multi-tenancy#testing-isolation) asks of applications.

## What This Means for the System You Build

- **Treat the cluster as the only strong boundary,** and choose namespace, virtual cluster or dedicated cluster per tenant on purpose, by trust.
- **Keep customers off the Kubernetes API in multi-customer products,** or give them a virtual control plane on private nodes.
- **Create every tenant namespace with its guardrails already in place:** default-deny network policy, quotas, limit ranges and a pinned restricted Pod Security level.
- **Cap load balancers and storage classes in quotas,** because they are billed resources a tenant can create with one manifest.
- **Prefer in-process admission (Pod Security Admission, VAP, MAP),** and keep webhooks for signature checks and generation, scoped and reachable only from the API server.
- **Require signed images by digest at admission,** and decide explicitly what happens when the registry is down.
- **Run untrusted code only in a sandboxed RuntimeClass or on dedicated nodes,** and enforce that rule in the data model.
- **Wire runtime detection to the abuse desk,** not only to a security dashboard.
- **Record which account held which namespace over time,** so every alert, bill and request resolves to a tenant.

## References

**Reference**

- [Kubernetes: Multi-tenancy](https://kubernetes.io/docs/concepts/security/multi-tenancy/), multi-team and multi-customer cases, namespace, virtual control plane and cluster models, what namespaces don't isolate, network, storage, sandbox and node isolation, API Priority and Fairness, QoS, DNS, operators
- [Kubernetes: Using RBAC authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/), escalation prevention, `escalate` and `bind`, aggregated ClusterRoles, the default `admin`, `edit` and `view` roles
- [Kubernetes: Resource quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/), compute, storage and object-count quotas, `services.loadbalancers`, scopes, 403 rejections and Deployment behavior
- [Kubernetes: Admission control](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/), mutating and validating phases, default plugins, LimitRanger, ResourceQuota, PodSecurity, webhook and policy plugins
- [Kubernetes: Dynamic admission control](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/), webhook configuration fields and defaults, `matchConditions`, AdmissionReview
- [Kubernetes: Validating admission policy](https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/), policies, bindings, parameters, validations, failure policy, audit annotations, type checking
- [Kubernetes: Mutating admission policy](https://kubernetes.io/docs/reference/access-authn-authz/mutating-admission-policy/), JSON patch mutations, CEL variables, exempt kinds, webhook exclusions in 1.37
- [Kubernetes: Pod Security Admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/), stable since 1.25, levels, modes, labels, version pinning, exemptions
- [Kubernetes: Runtime Class](https://kubernetes.io/docs/concepts/containers/runtime-class/), stable since 1.20, handler, overhead, scheduling, `runtimeClassName`
- [Kyverno documentation](https://kyverno.io/docs/introduction/), policy actions, YAML and CEL, CEL-based policy types and deprecated ClusterPolicy, OpenReport
- [Kyverno: Verify images with Sigstore](https://kyverno.io/docs/policy-types/cluster-policy/verify-images/sigstore/), attestors, keyless identities, Rekor, `mutateDigest` default, signatures or attestations per rule, failure policy
- [Sigstore: Policy controller overview](https://docs.sigstore.dev/policy-controller/overview/), namespace opt-in, ClusterImagePolicy, authorities, attestations, warn mode, no-match policy, tag resolution
- [Falco documentation](https://falco.org/docs/), syscall drivers, plugins, rules, outputs and Falcosidekick
- [vCluster: Architecture](https://www.vcluster.com/docs/vcluster/introduction/architecture), control plane pod and data stores, syncer, shared, private and dedicated nodes
- [loft-sh/vcluster](https://github.com/loft-sh/vcluster), Apache 2.0
- [projectcapsule/capsule](https://github.com/projectcapsule/capsule), Tenants as groups of namespaces, inherited policies, Clastix, Apache 2.0

**Provider documentation**

- [Amazon EKS best practices: Tenant isolation](https://docs.aws.amazon.com/eks/latest/best-practices/tenant-isolation.html), single-tenant orchestrator, soft and hard multi-tenancy, KaaS and SaaS cases, Namespace visibility, DNS, quotas, priority, Gatekeeper and Kyverno mutation examples
- [Amazon EKS: AWS Fargate](https://docs.aws.amazon.com/eks/latest/userguide/fargate.html), a compute boundary and dedicated kernel per pod, restrictions
- [Google Cloud: GKE Sandbox](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/sandbox-pods), gVisor and microVM node pools, RuntimeClasses, limitations, Autopilot default, untrusted-workload guidance, metadata blocking
- [Google Cloud: Policy Controller overview](https://docs.cloud.google.com/kubernetes-engine/enterprise/policy-controller/docs/overview), based on Gatekeeper, template library, bundles, audit, fleet dashboard
- [Google Cloud blog: GKE gets new pricing and capabilities on its 10th birthday](https://cloud.google.com/blog/products/containers-kubernetes/gke-gets-new-pricing-and-capabilities-on-10th-birthday/), Policy Controller at no additional cost on GKE Standard from September 2025
- [Microsoft Learn: Azure Policy for Kubernetes](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/policy-for-kubernetes), extends Gatekeeper v3, AKS add-on and Arc extension, 15-minute sync and audit, effects, enforcement points including `vap.k8s.io`
- [Microsoft Learn: Pod sandboxing with AKS](https://learn.microsoft.com/en-us/azure/aks/use-pod-sandboxing), Kata Containers on Azure Linux, `KataVmIsolation`, `kata-vm-isolation`, sizing and limitations
- [Oracle: Overview of cluster add-ons](https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengintroducingclusteraddons.htm), the optional add-on list, with no policy add-on

**Specifications**

- [KEP-3962: Mutating admission policies (kep.yaml)](https://raw.githubusercontent.com/kubernetes/enhancements/master/keps/sig-api-machinery/3962-mutating-admission-policies/kep.yaml), alpha 1.32, beta 1.34, stable 1.36

**Announcements and history**

- [Kubernetes blog: PodSecurityPolicy deprecation: past, present, and future](https://kubernetes.io/blog/2021/04/06/podsecuritypolicy-deprecation-past-present-and-future/), April 6, 2021, PSP since 1.3, the reasons, deprecation in 1.21 and removal in 1.25, KEP 2579
- [Kubernetes blog: ValidatingAdmissionPolicy GA](https://kubernetes.io/blog/2024/04/24/validating-admission-policy-ga/), April 24, 2024, GA in 1.30, a declarative alternative to validating webhooks
- [Kubernetes blog: OPA Gatekeeper](https://kubernetes.io/blog/2019/08/06/opa-gatekeeper-policy-and-governance-for-kubernetes/), August 6, 2019, ConstraintTemplates, Constraints and audit
- [CNCF: Open Policy Agent graduation](https://www.cncf.io/announcements/2021/02/04/cloud-native-computing-foundation-announces-open-policy-agent-graduation/), announced February 4, 2021
- [CNCF: Open Policy Agent project page](https://www.cncf.io/projects/open-policy-agent-opa/), Sandbox March 29, 2018, incubating April 2, 2019, graduated January 29, 2021
- [Open Policy Agent blog: A note from Teemu, Tim and Torin](https://www.openpolicyagent.org/blog/note-from-teemu-tim-and-torin-to-the-open-policy-agent-community-2dbbfe494371), August 20, 2025, OPA's creators join Apple, governance and licensing unchanged, repositories proposed for transfer
- [CNCF: Kyverno graduation](https://www.cncf.io/announcements/2026/03/24/cloud-native-computing-foundation-announces-kyvernos-graduation/), March 24, 2026, Nirmata origin, CEL adoption, LinkedIn scale figures
- [CNCF: Kyverno project page](https://www.cncf.io/projects/kyverno/), accepted November 10, 2020, incubating July 13, 2022, graduated March 16, 2026
- [CNCF: Falco graduation](https://www.cncf.io/announcements/2024/02/29/cloud-native-computing-foundation-announces-falco-graduation/), February 29, 2024, created by Sysdig in 2016
- [CNCF: Falco project page](https://www.cncf.io/projects/falco/), accepted October 10, 2018, incubating January 8, 2020
- [vCluster v0.1.0 release](https://github.com/loft-sh/vcluster/releases/tag/v0.1.0), April 19, 2021
- [CNCF: Capsule project page](https://www.cncf.io/projects/capsule/), Sandbox December 13, 2022

**In practice**

- [Ona (Gitpod): We are leaving Kubernetes](https://ona.com/stories/we-are-leaving-kubernetes), October 31, 2024, six years of development environments on Kubernetes, scale, resource, storage, image, network and isolation problems, microVM experiments, conclusion
