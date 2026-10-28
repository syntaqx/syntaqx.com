+++
title = "Packaging & GitOps"
description = "Helm from Tiller to Helm 4, Kustomize, OCI artifacts, Argo CD and Flux, the Weaveworks collapse, progressive delivery, and GitOps sold as an add-on."
category = "Hosting & Cloud Industry"
order = 2130
part = "Kubernetes"
tags = ["kubernetes", "helm", "kustomize", "gitops", "argo-cd", "flux"]
+++

A Kubernetes cluster accepts objects, not applications. A web service is a Deployment, a Service, a ConfigMap, a Secret reference, a HorizontalPodAutoscaler, a PodDisruptionBudget, a NetworkPolicy and a route, each a YAML document, each different between staging and production, and each needing to be created in an order the API server will accept. Two problems follow. The first is **packaging**: how to describe that set of objects once, parameterize it for each environment, version it, and hand it to someone else to install. The second is **delivery**: how the objects get from a repository into a running cluster, who is allowed to change them, and what notices when the cluster no longer matches what was approved. Helm and Kustomize answer the first; Argo CD and Flux, the GitOps controllers, answer the second.

For a provider, both are product surfaces as much as tools. Providers publish their own add-ons as Helm charts, so a chart's upgrade behavior becomes the provider's support burden; the GitOps controller is now something AWS, Google and Microsoft each run or install for the customer, priced or bundled, with its own support window; and the controller is the component holding credentials that can change every workload in a cluster, which makes its tenancy model a security decision. The ecosystem has also shown what happens when the company behind a tool fails: Weaveworks, which built Flux, shut down in February 2024, and the project survived because its maintainers found new employers and the CNCF found new backers.

This chapter covers Helm's four versions at operator depth (charts, values, releases and hooks), Kustomize, charts and manifests as OCI artifacts, Argo CD and Flux, Weaveworks and Flux's continuity, progressive delivery with Argo Rollouts and Flagger, and GitOps sold as a managed add-on. The principles of GitOps (declarative, versioned and immutable, pulled automatically, continuously reconciled) belong to the playbook's [GitOps](/docs/operations/kubernetes#gitops) section; canary and blue-green as strategies belong to [Deployment Strategies](/docs/delivery/deployment-strategies#the-strategies). It adds cluster-workload columns to the `deployments` table that [Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys) defines, and a `gitops_sources` table. The CD platforms outside the cluster (Spinnaker, Harness and their peers) are [Continuous Delivery Platforms](/books/hosting-and-cloud/continuous-delivery-platforms); the registries that store charts are [Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries); signing the artifacts is [Pipeline Supply-Chain Security](/books/hosting-and-cloud/pipeline-supply-chain-security).

## How the Providers Do It

| Provider | Managed GitOps offering, as of October 2026 | Where the controller runs | Sources it reads | Price |
| --- | --- | --- | --- | --- |
| **Amazon EKS** | EKS Capability for Argo CD, "fully managed by AWS," with `Application`, `ApplicationSet` and `AppProject`; Identity Center groups map to Argo CD RBAC roles | "in the AWS control plane, not on your worker nodes," so nodes don't need access to Git or Helm registries | Git, Helm registries (HTTP and OCI), OCI images | $0.03 per capability-hour plus $0.0015 per Application-hour (US East); an Application deployed to five clusters counts five times |
| **Google GKE** | Config Sync, "included with Google Kubernetes Engine," driven by `RootSync` and `RepoSync` objects; Policy Controller beside it | In the cluster, on fleet-registered clusters | `git` (the default), `oci`, `helm` | Fleets, Teams, Config Management and Policy Controller are "available with GKE Standard at no additional cost" since the September 2025 pricing change |
| **Azure AKS** | The `microsoft.flux` cluster extension: upstream Flux's source, kustomize, helm and notification controllers plus Azure's `fluxconfig-agent` and `fluxconfig-controller`, configured as `fluxConfigurations` ARM resources | In the cluster, `flux-system` namespace, cluster-wide scope only | Git, Helm repositories, Buckets, Azure Blob Storage | No charge on AKS; on other Arc-connected clusters, free for the first six vCPUs per subscription, then per vCPU |
| **DigitalOcean DOKS** | An Argo CD 1-Click app in the Marketplace (`doctl kubernetes clusters create --1-clicks argocd`), listed at version 2.4.0 with the upstream GitHub issues as its support URL | In the cluster | Whatever Argo CD supports | No add-on fee |
| **Oracle OKE** | No GitOps add-on in the optional add-on list; the list does still include "Tiller (not recommended)" | n/a | n/a | n/a |
| **Akuity** (independent) | Managed Argo CD and Kargo from a company co-founded by Argo's co-creator | Hosted by Akuity; self-hosted and on-premises on Enterprise | Argo CD's | Pro from $495 per month for 50 Applications and 50 Kargo stages |

Four patterns run through the table:

- **The hyperscalers each adopted a different controller.** AWS manages Argo CD, Microsoft packages Flux, and Google built Config Sync, its own reconciler. None of them sell Helm as a service: Helm is the format the controllers read.
- **Where the controller runs decides who holds the credentials.** EKS runs Argo CD outside the cluster, so the provider's control plane holds repository and cluster credentials; Flux and Config Sync run inside each cluster and pull, so no central system can write to every cluster. Azure's documentation states the Flux model plainly: "No access to clusters is needed by the source repo or by any other cluster."
- **The meter is the Application.** AWS bills each Argo CD Application per target cluster per hour, and Akuity sells Applications in packs; Azure and Google bundle the controller into the cluster price. A provider that sells GitOps has to decide whether a customer with 300 microservices on 4 clusters pays for 1,200 things.
- **Defaults outlive their software.** OKE's add-on catalog still offers Tiller, the in-cluster Helm 2 server removed in 2019, and DigitalOcean's 1-Click lists Argo CD 2.4.0, older than features Argo CD's own docs now describe (`PostDelete` hooks arrived in v2.10). A packaged add-on needs a version policy, or it becomes the oldest software in the customer's cluster.

## How It Got Here

Packaging and delivery tools arrived in the order the problems did: first a way to install other people's software (Helm), then a way to vary your own without templates (Kustomize), then controllers to keep clusters matching a repository (Argo CD, Flux), then artifact formats that let all of them read from a registry instead of Git.

| Date | Event | What it solved | What it cost |
| --- | --- | --- | --- |
| November 2015 | Helm 1 ("Helm Classic") released at the first KubeCon, by Deis, modeled on Homebrew | One command to install a packaged set of objects | Designed for "individual developers," not shared clusters |
| January 2016 | Deis' Helm team joined Google, Skippbox and then Bitnami on Helm 2 | Tiller, an in-cluster server so several operators could manage the same releases | Tiller's permissive default "could grant a user a broad range of permissions" |
| 2017 | Applatix created and open sourced Argo; Intuit acquired Applatix in its fiscal Q2 2018 (November 2017 to January 2018) | Workflow and, later, delivery tooling under one project | n/a |
| March 13, 2018 | Argo CD v0.1.0 | A controller that compares a cluster to Git and syncs it | n/a |
| June 2018 | Helm joined the CNCF | Neutral governance | n/a |
| kubectl 1.14 | Kustomize built into kubectl (`kubectl apply -k`) | Template-free overlays with no extra binary | The embedded copy stayed frozen at Kustomize v2.0.3 until kubectl 1.21 |
| July 15, 2019 | Flux accepted into the CNCF Sandbox | n/a | n/a |
| November 13, 2019 | Helm 3.0.0: Tiller removed | Permissions checked against the user's own kubeconfig; three-way merge; release data in Secrets | Breaking chart and CLI changes; OCI only experimental |
| March 26, 2020 | Argo accepted into the CNCF at incubating | n/a | n/a |
| April 30, 2020 | Helm graduation announced, "the tenth project to graduate," with "close to 2 million downloads a month" | n/a | n/a |
| March 12, 2021 | Flux moved to incubating | n/a | n/a |
| January 24, 2022 | Helm 3.8.0: "OCI registry support for charts is now generally available" | Charts in the same registries as images | Chart repositories and OCI registries now coexist |
| November 30, 2022 | Flux graduated, the CNCF's 18th graduated project | n/a | n/a |
| December 6, 2022 | Argo graduated: over 350 organizations in production, 2,300 companies and 8,000 individuals contributing | n/a | n/a |
| February 2024 | Weaveworks, Flux's creator, shut down (reported February 6) | n/a | The main employer of Flux's maintainers was gone |
| February 15, 2024 | OCI Image and Distribution specs 1.1.0: `subject`, `artifactType`, the referrers API | Signatures and attestations attached to an artifact by a standard link | Registries that lack the API need a fallback tag scheme |
| February 15 and March 19, 2024 | ControlPlane hired Flux maintainers; the CNCF announced 15 new corporate backers for Flux | Flux's continuity | n/a |
| November 12, 2025 | Helm 4.0.0 at KubeCon, "the first new major version of Helm in 6 years" | Server-side apply, WebAssembly plugins, kstatus-based waiting | Another migration for every chart consumer |
| July 8 and November 11, 2026 | Helm 3 bug fixes end, then security fixes end | n/a | Any tool still embedding Helm 3 is unsupported from mid-November 2026 |

Two things in the table matter more than the rest. Tiller's removal is the clearest case of the ecosystem trading convenience for a smaller permission surface, and every later controller had to answer the same question: whose credentials apply the objects. And Weaveworks' collapse, a year after Flux graduated, is a reminder that a provider's packaging story rests on projects whose funding it doesn't control.

## Helm: Charts, Values, Releases and Hooks

A **chart** is a directory with a required `Chart.yaml` and reserved subdirectories: `templates/` (Go templates that render to manifests), `charts/` (dependencies), `crds/` (CustomResourceDefinitions), and optional `values.yaml`, `values.schema.json` and `templates/NOTES.txt`. `Chart.yaml` with `apiVersion: v2` requires Helm 3 or later, moves dependencies from the old `requirements.yaml` into a `dependencies` list (with `condition`, `tags`, `alias` and `import-values`, locked in `Chart.lock`), and adds a `type`: `application`, the installable default, or `library`, a chart that "does not create any release artifacts of its own" and only exports `define` blocks for other charts. `helm package` produces a versioned `.tgz`.

**Values** are the chart's interface. `values.yaml` holds defaults; user-supplied files and `--set` flags (which are "simply converted to YAML on the client side") merge over them field by field; a parent chart can set its subcharts' values, but a subchart can't read its parent's; a `global:` section is visible to every chart as `.Values.global`. Since Helm 3, `values.schema.json` validates the merged values with JSON Schema on install, upgrade, template and lint, which is the only thing between a typo in a values file and a rendered manifest that does something else.

A **release** is one installation of a chart in a namespace under a name, with a numbered history of revisions. Helm 3 changed three things about releases that still define how they behave:

- **Release data lives in Secrets in the release's namespace.** "Secrets are now used as the default storage driver," replacing ConfigMaps, so release history benefits from encryption at rest, and release names are scoped to namespaces, so `web` can exist in two of them.
- **Upgrades are three-way merges.** "Helm considers the old manifest, its live state, and the new manifest when generating a patch," so a rollback restores fields someone changed by hand, while additions made by other controllers, such as an injected sidecar, survive.
- **Permissions are the caller's.** With Tiller gone, Helm acts with the user's kubeconfig, so a release can do only what its operator can.

**Hooks** run objects at points in the release lifecycle, set by the `helm.sh/hook` annotation: `pre-install`, `post-install`, `pre-upgrade`, `post-upgrade`, `pre-rollback`, `post-rollback`, `pre-delete`, `post-delete` and `test`. `helm.sh/hook-weight` orders them (strings, ascending, negatives allowed), then kind, then name; Helm waits for each to be ready (a Job or Pod must run to completion) and fails the release if one fails. `helm.sh/hook-delete-policy` is `before-hook-creation` by default, or `hook-succeeded` or `hook-failed`. The operational trap is in one sentence of the docs: "The resources that a hook creates are currently not tracked or managed as part of the release," so `helm uninstall` leaves them behind. A migration Job written as a hook is invisible to the release that ran it.

**CRDs** are the other trap. Files in `crds/` are installed before the rest of the chart, can't be templated, and are then "never reinstalled," "never installed on upgrade or rollback," and "never deleted." A chart that ships an operator and its CRDs can upgrade the operator to a version the cluster's CRDs don't describe. Every provider add-on built as a chart has to handle CRD upgrades some other way, usually a separate chart or a controller that applies them.

**Helm 4** (November 12, 2025) kept the chart format and changed the machinery: server-side apply "is now supported," waiting uses kstatus, plugins were redesigned to support WebAssembly (post-renderers became plugins), charts are cached by content, the SDK logs through `slog`, archives build reproducibly, and the SDK supports multiple chart API versions ahead of an experimental v3 chart format. Helm 3 received bug fixes until July 8, 2026 and receives security fixes until November 11, 2026, with no feature backports. For a provider, that date is an inventory question: every add-on installer, CI image, console integration and GitOps controller that embeds the Helm 3 SDK needs a Helm 4 path, and as of October 2026 there are two weeks left.

## Kustomize

Kustomize takes the opposite position from Helm: no templates. A **base** is "a directory with a `kustomization.yaml`, which contains a set of resources and associated customization"; an **overlay** is a directory whose `kustomization.yaml` refers to other kustomization directories, and "a base has no knowledge of an overlay and can be used in multiple overlays." Overlays change the base with transformers: `namePrefix` and `nameSuffix`, `labels` and `commonAnnotations`, `images` (to change "the name, tags and/or digest for one image without creating patches"), and `patches` in strategic merge or JSON 6902 form. `configMapGenerator` and `secretGenerator` produce ConfigMaps and Secrets whose names carry a content hash (`example-configmap-1-8mbdf7882g`), and Kustomize rewrites every reference to the generated name, so changing a config value changes the name and rolls the Deployment that uses it.

Kubernetes has supported `kubectl apply -k` and `kubectl kustomize` "since 1.14." The embedded copy is the cautionary detail: "the kustomize flow in kubectl remained frozen at v2.0.3 until kubectl v1.21," then jumped two major versions to v4.0.5, so for seven kubectl minor releases the Kustomize built into kubectl lagged the standalone tool, and an overlay that worked with one could fail with the other. kubectl 1.27 embedded v5.0.1 and 1.31 v5.4.2. The lesson generalizes to every tool a provider embeds: record which version actually rendered a deployment, not which version the docs describe.

Helm and Kustomize compose: Helm's post-renderers (plugins since Helm 4) can patch a chart's rendered output before it is applied. The common split is Helm for software someone else publishes (the provider's add-ons, an ingress controller, a database operator) and Kustomize overlays for the customer's own services.

## Charts and Manifests as OCI Artifacts

Helm charts first lived in chart repositories: an `index.yaml` and tarballs on any web server, a separate system from the image registry. Helm 3 added experimental OCI support behind `HELM_EXPERIMENTAL_OCI=1`, and Helm 3.8.0 made it GA on January 24, 2022. `helm push mychart-0.1.0.tgz oci://registry/helm-charts` publishes `registry/helm-charts/mychart:0.1.0`, with the tag "inferred from the chart's semantic version" as "a strict requirement"; `helm install myrelease oci://registry/helm-charts/mychart --version 0.1.0`, or a pinned `@sha256:` digest, installs it. A `.prov` provenance file is pushed as an extra layer.

The OCI 1.1 specifications (released February 15, 2024) turned the registry into a general artifact store. The image manifest gained `artifactType`, which "enables use cases without a dedicated `config.mediaType`," and `subject`, which links one manifest to another so tools can "associate signatures, attestations, and other metadata with images with a common specification." The distribution spec gained the referrers API: `GET /v2/<name>/referrers/<digest>` returns an index of every manifest whose `subject` is that digest. Registries without the API get a fallback tag named after the digest (`sha256-<hex>`) that clients maintain themselves. The effect is that a chart, its signature, its SBOM and its attestations can sit in one repository, discoverable from the chart's digest, without a naming convention.

The GitOps controllers followed. Flux's `OCIRepository` pulls an artifact by `.spec.ref.tag`, `.semver` or `.digest` (digest overriding the others), verifies it with `.spec.verify.provider` set to `cosign` or `notation`, picks a layer with `layerSelector`, and records `.status.artifact.revision` as `<tag>@<digest>`. Config Sync's `sourceType` accepts `oci` and `helm` beside `git`. EKS's Argo CD capability reads "OCI images" and OCI Helm registries. A provider that runs a registry is now also the store its customers' delivery pipeline reads from at every reconcile interval, which is a load and availability commitment ([Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries) covers the registry side).

## Argo CD

Argo CD's central object is the **Application** (`argoproj.io/v1alpha1`). `spec.source` names a `repoURL`, a `targetRevision` and a `path` (or a `chart` for a Helm repository), with `helm` and `kustomize` blocks for rendering options; `spec.destination` names one cluster by `server` or `name` ("one of server or name can be used, but not both") and a `namespace`; `spec.project` names the AppProject; `spec.syncPolicy.automated` with `prune: true` deletes objects removed from Git and `selfHeal: true` reverts live changes. Without the `resources-finalizer.argocd.argoproj.io` finalizer, "deleting an application will not delete the resources it manages."

An Application has two statuses. **Sync status** says whether the live objects match the rendered source. **Health** says whether they work: `Healthy`, `Progressing` ("not healthy yet but still making progress"), `Degraded`, `Suspended` ("waiting for some external event to resume"), `Missing` and `Unknown`, with the application's health being "the worst health of its immediate child resources." Custom health checks for CRDs are Lua scripts in `argocd-cm`, which is how a provider teaches Argo CD that its own custom resources are ready.

**Sync phases and waves** order a sync. Hooks annotated `argocd.argoproj.io/hook` run in `PreSync` (before manifests are applied; failure stops the sync), `Sync`, `PostSync` (after every resource is healthy), `SyncFail` and, since v2.10, `PostDelete`. Within a phase, `argocd.argoproj.io/sync-wave` (an integer, default 0, negatives allowed) orders resources, then kind (namespaces first, custom resources last), then name. Argo CD applies the first wave with anything out of sync or unhealthy and "repeats this process until all phases and waves are in-sync and healthy," with a 2-second delay between waves (`ARGOCD_SYNC_WAVE_DELAY`). A CRD in wave -1 and the custom resources that need it in wave 0 is the standard fix for the ordering problem Helm's `crds/` directory only half solves.

The **AppProject** is the tenancy boundary. `sourceRepos` limits where an application may pull from, `destinations` which cluster and namespace pairs it may deploy to, `clusterResourceWhitelist` which cluster-scoped kinds it may create, `namespaceResourceWhitelist` and `namespaceResourceBlacklist` which namespaced kinds (the docs' example denies `ResourceQuota`, `LimitRange` and `NetworkPolicy`, so a tenant can't lift its own limits), and `roles` grant access. The docs carry one warning a provider must treat as a rule: if a project's destinations include the Argo CD namespace, "Applications under that project have admin-level access."

**ApplicationSet**, bundled with Argo CD since v2.3, generates Applications from a `template:` and generators: List, Cluster (from clusters registered in Argo CD), Git (from files or directories), Matrix and others. It is how one manifest deploys to every cluster in a fleet, and how "multitenant self-service" works, letting tenants deploy without an administrator enabling each destination first. The docs say only: "Be aware of the security implications of ApplicationSets before using them." An ApplicationSet that reads a tenant-writable Git directory lets that tenant create Applications, so the project it stamps into the template is the real permission.

Argo CD is a hub. Clusters are registered as Secrets labelled `argocd.argoproj.io/secret-type: cluster` holding a `server` URL and a `config` with a `bearerToken`, cloud auth or TLS client certificates; repository credentials are Secrets labelled `repository` or `repo-creds` (a URL-prefix template, "the longest (best) match will take precedence"). One Argo CD instance can manage applications "across multiple clusters," as the EKS docs put it, which is its operational appeal and its risk: the namespace it runs in holds working credentials for all of them.

## Flux

Flux is a set of controllers, each owning custom resources: the **source controller** (`GitRepository`, `OCIRepository`, `HelmRepository`, `HelmChart`, `Bucket`, `ExternalArtifact`, `ArtifactGenerator`), the **kustomize controller** (`Kustomization`), the **helm controller** (`HelmRelease`), the **notification controller** (`Provider`, `Alert`, `Receiver`), and the image automation controllers (`ImageRepository`, `ImagePolicy`, `ImageUpdateAutomation`). Sources fetch and package artifacts; appliers apply them; nothing applies directly from Git.

A Flux **Kustomization** (not to be confused with Kustomize's file) applies a path from a source:

- `interval` (the docs suggest at least 60 seconds) is how often it fetches, builds and applies; `retryInterval` is for failures only.
- `sourceRef` and `path` select the manifests; `targetNamespace` forces every object into one namespace.
- `prune: true` deletes objects that left the source, tracked in `.status.inventory`; an object can opt out with `kustomize.toolkit.fluxcd.io/prune: disabled`.
- `wait` or `healthChecks` gate readiness, and `dependsOn` orders Kustomizations (with an optional CEL `readyExpr`).
- `serviceAccountName` makes the controller **impersonate** that service account, which "limits what the Kustomization can change."
- Every interval, a server-side apply dry run detects drift; the default `Override` policy reverts manual edits, `Merge` keeps non-overlapping fields others added.
- `suspend` pauses applying and drift correction; `force` recreates objects whose immutable fields changed.

A **HelmRelease** installs a chart through Helm actions, from `.spec.chart` (which creates a source) or `.spec.chartRef` to an existing `OCIRepository` or `HelmChart`. Values merge from `valuesFrom` ConfigMaps and Secrets in order, then inline `values`, and any change to the result is a new Helm release. `install.remediation.retries` and `upgrade.remediation` (strategy `rollback` or `uninstall`) handle failures; `driftDetection.mode` set to `warn` or `enabled` compares Helm's stored manifest with the cluster, and `enabled` corrects it, closing the gap where a Helm release stays "deployed" while someone edits its objects by hand.

The design difference from Argo CD is where it runs. Flux runs inside each cluster and pulls, so each cluster's credentials stay in that cluster, and multi-tenancy is impersonation plus namespace-local sources. Azure's extension shows the provider version of that model: multi-tenancy is enforced by default, the extension deploys by impersonating a `flux-applier` service account in the configuration's namespace, and a `HelmRelease` that references a `HelmRepository` in another namespace is blocked until the manifests are moved into one namespace or the customer opts out with `multiTenancy.enforce=false`. Azure supports the latest extension version and the two before it.

## Weaveworks and Flux's Continuity

Weaveworks built Flux and took it to graduation. In early February 2024 Alexis Richardson announced the company was shutting down: an acquisition fell through at the last minute, cash was "volatile," and revenue was in the double-digit millions with "lumpy" growth, after about $61.6 million raised. The company said it was "working with several large organizations to make sure CNCF Flux is in the healthiest state."

What happened next is the template for a graduated project losing its sponsor. On February 15, 2024, ControlPlane announced it had hired Flux maintainers Stefan Prodan (also Flagger's creator) and Soule Ba and would sell an annual "ControlPlane Enterprise for Flux CD" subscription; its Flux Operator repository is licensed AGPL-3.0. GitLab, which had made Flux its recommended GitOps tool in early 2023, reaffirmed its support on March 5. On March 19 the CNCF announced new corporate support from Aenix, Aviator, Azure, ControlPlane, Edgecell, Fairwinds, Giant Swarm, Gimlet, GitLab, Nearform, OpsMx, OpsWorks, OSO, Teracloud and TNG. The code was Apache-licensed and under CNCF governance, so what had to be replaced was the payroll, not the code.

For a provider, the episode is the argument for shipping only CNCF-governed controllers in a managed add-on and for watching their maintainer base, not just their release notes. Azure, whose extension packages upstream Flux, was on the list of new backers.

## Progressive Delivery

GitOps decides what should run; progressive delivery decides how fast a new version takes traffic. The two controllers differ in one structural choice. Argo Rollouts "replaces the standard K8s Deployment with a custom CRD" that manages two ReplicaSets itself; Flagger's `Canary` "only references an existing K8s Deployment object" and "doesn't modify your application Deployments."

| | Argo Rollouts | Flagger |
| --- | --- | --- |
| Object | `Rollout` in place of a Deployment | `Canary` pointing at an existing Deployment |
| Strategies | Blue-green (active and preview Services) and canary with weighted steps and pauses; a canary with no steps behaves like a rolling update | Canary, A/B testing, blue/green and mirroring |
| Analysis | Prometheus, Wavefront, Kayenta, Web, Kubernetes Jobs, Datadog, New Relic, Graphite, InfluxDB | Prometheus, InfluxDB, Datadog, New Relic, CloudWatch, Stackdriver, Graphite |
| Traffic | NGINX, ALB and Apache APISIX ingress; Istio, Linkerd and SMI meshes; several at once | Gateway API, Istio, Linkerd and Kuma; Contour, Gloo, NGINX, Skipper, Traefik and APISIX |
| Project | Argo, CNCF graduated | Part of the Flux family, CNCF graduated |

Both automate what the playbook's [canary](/docs/delivery/deployment-strategies#canary) and [blue-green](/docs/delivery/deployment-strategies#blue-green) sections describe, and both depend on the traffic layer to split requests by weight: a provider's L7 load balancer driven by Gateway API classes ([Ingress to Gateway API](/books/hosting-and-cloud/cluster-networking#ingress-to-gateway-api)) or a mesh ([Service Meshes](/books/hosting-and-cloud/cluster-networking#service-meshes)). The judgment is the metric query, as [Let the Canary Be Judged Automatically](/docs/delivery/deployment-strategies#let-the-canary-be-judged-automatically) argues; neither tool makes a bad query safe.

## The Alternatives

| Choice | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Helm** | Go templates plus values, releases with history | The distribution format for third-party software; hooks, dependencies, rollback | Templates hide what is applied; hooks untracked by the release; CRDs never upgraded; Helm 3 security support ends November 11, 2026 | Apache 2.0; CNCF graduated | Free | Nearly every published add-on, including providers' own |
| **Kustomize** | Base and overlays, no templates | Plain YAML, hash-suffixed config, built into kubectl | Verbose for many variants; the embedded kubectl copy can lag | Apache 2.0; Kubernetes SIG project | Free | Teams' own services, often over a rendered chart |
| **Plain manifests** | Rendered YAML in Git or an OCI artifact | Exactly what is applied is what was reviewed | No parameterization; duplication across environments | n/a | Free | Rendered-manifest pipelines |
| **Argo CD** | Hub controller with UI, Applications and AppProjects | UI and RBAC, sync waves, ApplicationSet fleets, the managed market (EKS, Akuity) | The hub holds credentials for every cluster; ApplicationSet and project scoping mistakes grant admin | Apache 2.0; CNCF graduated; Applatix and Intuit origin | Free; EKS from $0.03 per hour plus $0.0015 per Application-hour | Large fleets, teams that want a UI |
| **Flux** | Per-cluster controllers, pull and impersonate | No central credentials, OCI-native with signature verification, Helm drift correction | No built-in UI; its original company is gone | Apache 2.0; CNCF graduated; ControlPlane, Azure, GitLab among backers | Free; free on AKS | AKS GitOps, GitLab, provider fleets |
| **Config Sync** | Google's in-cluster reconciler, `RootSync` and `RepoSync` | Bundled with GKE and fleets; Git, OCI and Helm sources | Google-specific | Google | Included with GKE | GKE fleets |
| **Push from CI** (`helm upgrade` or `kubectl apply` in a pipeline) | Pipeline holds cluster credentials | Simple; no controller to run | CI becomes a path to production; no drift detection | n/a | Free | Small teams, early stages |
| **Argo Rollouts** | Replaces Deployments with Rollouts | Rich steps and analysis, blue-green and canary | Every workload changes kind | Apache 2.0; CNCF graduated (Argo) | Free | Argo CD users |
| **Flagger** | Wraps existing Deployments | No change to workload manifests; many routing options | Generated objects to understand | Apache 2.0; CNCF graduated (Flux) | Free | Flux users, mesh users |

## My Default

For a provider's own fleet, my default is Flux in every cluster, reading signed OCI artifacts by digest: CI renders the chart or overlay, pushes the result and its signature to the registry, and each cluster's source controller verifies with `cosign` before the kustomize or helm controller applies it, impersonating a service account scoped to what that add-on needs. Pull keeps the fleet's credentials in each cluster, so no single system can write to all of them, and verification at the source makes the registry, not Git, the thing an attacker would have to beat. Add-ons ship as Helm charts because that is what customers and other tools consume, with CRDs applied by a separate step and `driftDetection` enabled, and every installer on the Helm 4 SDK before Helm 3's security support ends.

For a managed GitOps product, I'd offer Argo CD, because its UI, AppProjects and ApplicationSets are what customers ask for and what the market (AWS, Akuity, DigitalOcean's 1-Click) has standardized on. I'd run the hub per customer account, never shared across accounts, with each AppProject's destinations excluding the Argo CD namespace, cluster-scoped kinds denied by default, and quotas and network policies kept out of tenants' reach. I'd meter Applications per target cluster, as AWS does, because that is the unit that drives the controller's work. For progressive delivery I'd recommend Flagger to customers who want to keep plain Deployments and Argo Rollouts to those already in Argo CD. What would change this: a customer whose security team forbids any in-cluster component with egress to a registry (the EKS model of a provider-hosted controller then wins), or a fleet small enough that push from CI with a drift check is honestly enough.

## How to Build It

The chapter adds cluster-workload columns to the `deployments` table owned by [Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#how-to-build-it), whose `resource_id` already admits a cluster and whose `source` already includes `'gitops'`, so a Helm release or a GitOps sync in a cluster is a deployment like any other, and adds `gitops_sources` for the controllers' source objects. Clusters are [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture)'s `clusters (resource_id)`; the artifacts referenced by digest are [Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries)' concern.

```sql
CREATE TABLE gitops_sources (            -- an Application, Kustomization, HelmRelease or RootSync
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  cluster_id        UUID REFERENCES clusters (resource_id),  -- the cluster the object lives in;
                                         -- null for a provider-hosted controller
  controller        TEXT NOT NULL CHECK (controller IN ('argocd', 'flux', 'config_sync')),
  hosting           TEXT NOT NULL CHECK (hosting IN ('in_cluster', 'provider_hosted',
                      'third_party_hosted')),
  managed_by        TEXT NOT NULL CHECK (managed_by IN ('provider', 'customer')),
  object_kind       TEXT NOT NULL CHECK (object_kind IN ('Application', 'ApplicationSet',
                      'Kustomization', 'HelmRelease', 'RootSync', 'RepoSync')),
  object_namespace  TEXT NOT NULL,
  object_name       TEXT NOT NULL,
  object_uid        UUID NOT NULL,       -- survives renames; a recreated object is a new uid
  project           TEXT,                -- Argo CD AppProject, when there is one
  source_type       TEXT NOT NULL CHECK (source_type IN ('git', 'oci', 'helm_repository',
                      'bucket')),
  source_url        TEXT NOT NULL,       -- repo URL or oci:// reference, no credentials
  target_ref        TEXT NOT NULL,       -- branch, tag, semver range or digest it follows
  verify_provider   TEXT CHECK (verify_provider IN ('cosign', 'notation')),  -- null: unverified
  apply_identity    TEXT,                -- impersonated service account, or project role
  destinations      TEXT[],              -- target clusters/namespaces it may write to
  prune             BOOLEAN NOT NULL,
  self_heal         BOOLEAN NOT NULL,    -- Argo CD selfHeal, Flux drift correction
  exists_during     TSTZRANGE NOT NULL,
  UNIQUE (cluster_id, object_uid)
);

ALTER TABLE deployments                  -- Platforms Take Over the Deploy's table; for a cluster
                                         -- workload resource_id is the cluster, source is 'gitops'
                                         -- for a controller sync or 'cli', 'ci' or 'api' for a
                                         -- push, and commit_sha or artifact_digest is the exact
                                         -- revision applied
  ADD COLUMN namespace         TEXT,
  ADD COLUMN source_kind       TEXT CHECK (source_kind IN ('helm', 'kustomize', 'manifests')),
  ADD COLUMN gitops_source_id  UUID REFERENCES gitops_sources (id),  -- null: pushed by a person
                                         -- or a pipeline
  ADD COLUMN chart_ref         TEXT,     -- 'oci://registry/charts/web' or repo/chart
  ADD COLUMN chart_version     TEXT,
  ADD COLUMN release_name      TEXT,     -- Helm release, when source_kind = 'helm'
  ADD COLUMN release_revision  INT,      -- Helm's revision number for that release
  ADD COLUMN tool_version      TEXT,     -- what rendered it: 'helm 4.0.0', 'kustomize 5.4.2'
  ADD COLUMN sync_status       TEXT CHECK (sync_status IN ('synced', 'out_of_sync',
                                 'unknown')),
  ADD COLUMN health_status     TEXT CHECK (health_status IN ('healthy', 'progressing',
                                 'degraded', 'suspended', 'missing', 'unknown')),
  ADD CONSTRAINT deployments_cluster_shape CHECK (
    (namespace IS NULL) = (source_kind IS NULL) AND
    (source_kind = 'helm') = (release_name IS NOT NULL)),
  ADD CONSTRAINT deployments_gitops_source CHECK (
    gitops_source_id IS NULL OR source = 'gitops');
```

Notes on the sketch:

- **A sync that changes the cluster is a deployment.** Each new revision a controller applies, or each `helm upgrade`, is one `deployments` row; reconciles that change nothing are not, so the table stays a history of changes, not of loops.
- **Revisions are immutable references.** The row's `commit_sha` or `artifact_digest` is a commit SHA or an OCI digest, never a branch or tag, so "what was running at 14:02" resolves to bytes; `target_ref` on the source records what it was following.
- **`tool_version` is the deprecation inventory.** Helm 3's end of security support on November 11, 2026, or a Kustomize version gap like kubectl's v2.0.3 years, becomes a query over `tool_version` by account and cluster.
- **Verification is a column, not a promise.** `verify_provider` null means the source is applied without signature checks; a provider can require it for its own add-ons and report it for customers'.
- **The controller's reach is recorded.** `apply_identity` and `destinations` say what each source could change, which is what an incident review needs when a repository is compromised.
- **Billing a managed controller.** A provider-hosted Argo CD meters Application-hours per target cluster from `gitops_sources` into `usage_events`, the AWS unit; in-cluster controllers bundled with the cluster emit nothing.
- **Events:** `deployment.applied`, `deployment.failed`, `deployment.drift_detected` (sync status moved to `out_of_sync` without a new revision), `deployment.health_degraded` and `gitops_source.unverified` go through the outbox to notifications, support and the audit store.

## Auditing

- **Every change and its approval.** For each deployment, the revision applied, the source it came from, the controller and identity that applied it, and when, so the Git history and the cluster history can be joined (the evidence the playbook's [GitOps](/docs/operations/kubernetes#gitops) section promises auditors).
- **Drift and who caused it.** Out-of-sync periods without a new revision are changes made outside the pipeline; the cluster audit log names the actor, and the record links the two.
- **What each controller could touch.** Sources, their destinations and impersonated identities over time, so a compromised repository's blast radius is a query.
- **Unverified and unpinned sources.** Sources following a branch or an unsigned artifact, reported to the account, because those are the ones a supply-chain incident goes through.
- **Tool versions behind add-ons.** Which Helm, Kustomize and controller versions rendered and applied each provider add-on, so an end-of-support date or a CVE becomes a list of clusters.

## What This Means for the System You Build

- **Ship add-ons as Helm charts, but handle CRDs separately,** because Helm never upgrades or deletes them.
- **Treat hooks as unmanaged objects,** with delete policies or TTLs, since a release doesn't track them.
- **Move every Helm 3 consumer to Helm 4 now;** Helm 3 security fixes end November 11, 2026.
- **Publish charts and rendered manifests to OCI by digest, with signatures as referrers,** and verify them where they are applied.
- **Prefer pull over push,** so CI and central hubs don't hold credentials that can write to every cluster.
- **Scope every controller,** with AppProjects or impersonated service accounts, and never let a tenant's project reach the controller's namespace.
- **Record what was applied, by whom and with which tool version,** so drift, rollbacks and deprecations are queries.
- **Ship only governed controllers in managed products,** and watch the maintainer base, as Weaveworks showed.
- **Decide the meter before selling GitOps;** the Application per target cluster is the industry's unit.

## References

**Reference**

- [Helm: Charts](https://helm.sh/docs/topics/charts/), chart layout, `apiVersion: v2`, chart types, dependencies, CRD handling, values and globals
- [Helm: Chart hooks](https://helm.sh/docs/topics/charts_hooks/), hook types, weights, delete policies, untracked hook resources and waiting
- [Helm: Changes since Helm 2](https://helm.sh/docs/faq/changes_since_helm2/), Tiller's removal and reasons, three-way merge, namespaced releases, Secrets storage, library charts, JSON Schema, experimental OCI
- [Helm: Use OCI-based registries](https://helm.sh/docs/topics/registries/), `helm push` and `helm install` with `oci://`, tags from chart versions, provenance layers
- [Kubernetes: Declarative management using Kustomize](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/), kubectl support since 1.14, generators and hash suffixes, bases and overlays, feature list
- [kubernetes-sigs/kustomize](https://github.com/kubernetes-sigs/kustomize), the kubectl version table and the v2.0.3 freeze until kubectl 1.21, Apache 2.0
- [Argo CD: Declarative setup](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/), Application and AppProject fields, the finalizer, cluster and repository Secrets, the Argo CD namespace warning
- [Argo CD: Sync phases and waves](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/), phases, wave annotation, ordering rules, 2-second delay
- [Argo CD: Resource health](https://argo-cd.readthedocs.io/en/stable/operator-manual/health/), health statuses, application health as the worst child, Lua checks
- [Argo CD: ApplicationSet controller](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/), bundled since v2.3, generators, templates, multitenant self-service and the security warning
- [Argo Rollouts](https://argoproj.github.io/argo-rollouts/), strategies, metric providers and traffic integrations
- [Flagger](https://docs.flagger.app/), strategies, routing and metric providers, part of the Flux family
- [Flux: Components](https://fluxcd.io/flux/components/), controllers and the custom resources each owns
- [Flux: Kustomizations](https://fluxcd.io/flux/components/kustomize/kustomizations/), interval, prune and inventory, health checks, dependencies, impersonation, server-side apply drift correction
- [Flux: HelmReleases](https://fluxcd.io/flux/components/helm/helmreleases/), chart and chartRef, values merging, remediation, drift detection, impersonation, storage namespace
- [Flux: OCIRepositories](https://fluxcd.io/flux/components/source/ocirepositories/), references and precedence, cosign and notation verification, layer selection, revision format

**Specifications**

- [OCI: Image and Distribution Specs v1.1](https://opencontainers.org/posts/blog/2024-03-13-image-and-distribution-1-1/), released February 15, 2024, `subject`, `artifactType`, the referrers API and its fallback tag

**Provider documentation and pricing**

- [Amazon EKS: Continuous Deployment with Argo CD](https://docs.aws.amazon.com/eks/latest/userguide/argocd.html), the EKS Capability for Argo CD, running in the AWS control plane, sources and Identity Center
- [Amazon EKS pricing](https://aws.amazon.com/eks/pricing/), EKS Capabilities base and per-Application hourly rates and how Applications are counted
- [Google Cloud: Config Sync overview](https://docs.cloud.google.com/kubernetes-engine/enterprise/config-sync/docs/overview), included with GKE, Git, OCI and Helm sources
- [Google Cloud: RootSync and RepoSync fields](https://docs.cloud.google.com/kubernetes-engine/enterprise/config-sync/docs/reference/rootsync-reposync-fields), `sourceType` values and source fields
- [Google Cloud blog: GKE gets new pricing and capabilities on its 10th birthday](https://cloud.google.com/blog/products/containers-kubernetes/gke-gets-new-pricing-and-capabilities-on-10th-birthday/), Config Management and Policy Controller at no additional cost from September 2025
- [Microsoft Learn: GitOps with Flux v2](https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-gitops-flux2), the `microsoft.flux` extension, controllers, `fluxConfigurations`, pricing, N-2 support and multi-tenancy enforcement
- [DigitalOcean Marketplace: Argo CD](https://marketplace.digitalocean.com/apps/argocd), the Kubernetes 1-Click app, version and support URL
- [Oracle: Overview of cluster add-ons](https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengintroducingclusteraddons.htm), the optional add-on list including Tiller
- [Akuity pricing](https://akuity.io/pricing), managed Argo CD and Kargo tiers and the $495 Pro starting price

**Announcements and history**

- [Helm: Helm 3.0.0 has been released](https://helm.sh/blog/helm-3-released/), November 13, 2019, Helm Classic at the first KubeCon, the January 2016 merger, CNCF in June 2018, Tiller removed
- [Helm v3.8.0 release](https://github.com/helm/helm/releases/tag/v3.8.0), January 24, 2022, OCI support generally available
- [Helm: Helm 4 released](https://helm.sh/blog/helm-4-released/), November 12, 2025, features and Helm 3 bug-fix and security-fix end dates
- [CNCF: Helm graduation](https://www.cncf.io/announcements/2020/04/30/cloud-native-computing-foundation-announces-helm-graduation/), April 30, 2020, tenth graduated project, download figures
- [CNCF: Helm project page](https://www.cncf.io/projects/helm/), accepted June 1, 2018
- [CNCF: Argo has graduated](https://www.cncf.io/announcements/2022/12/06/the-cloud-native-computing-foundation-announces-argo-has-graduated/), December 6, 2022, Applatix and Intuit origin, sub-projects, adoption and contributor figures, Akuity co-founder
- [CNCF: Argo project page](https://www.cncf.io/projects/argo/), accepted at incubating March 26, 2020
- [Intuit Form 10-Q, fiscal Q2 2018](https://www.sec.gov/Archives/edgar/data/0000896878/000089687818000036/fy18q210-qdocument.htm), the Applatix acquisition
- [Argo CD v0.1.0 release](https://github.com/argoproj/argo-cd/releases/tag/v0.1.0), March 13, 2018
- [CNCF: Flux graduates](https://www.cncf.io/announcements/2022/11/30/flux-graduates-from-cncf-incubator/), the 18th graduated project, Flagger as a subproject
- [CNCF: Flux project page](https://www.cncf.io/projects/flux/), Sandbox July 15, 2019, incubating March 12, 2021, graduated November 30, 2022
- [The Register: Weaveworks folds](https://www.theregister.com/2024/02/06/weaveworks_folds/), February 6, 2024, the failed deal, revenue description, funding and Flux statement
- [ControlPlane: ControlPlane backs the CNCF Flux project by employing maintainers](https://control-plane.io/posts/controlplane-backs-the-cncf-flux-project-by-employing-maintainers/), February 15, 2024, maintainers hired and the enterprise subscription
- [controlplaneio-fluxcd/flux-operator](https://github.com/controlplaneio-fluxcd/flux-operator), AGPL-3.0
- [CNCF: FluxCD project gains new corporate support](https://www.cncf.io/announcements/2024/03/19/cloud-native-computing-foundations-fluxcd-project-gains-new-corporate-support/), March 19, 2024, the list of backers
- [GitLab: The continued support of FluxCD at GitLab](https://about.gitlab.com/blog/the-continued-support-of-fluxcd-at-gitlab/), March 5, 2024, Flux as GitLab's recommended GitOps tool since early 2023
- [CNCF blog: Flagger vs Argo Rollouts vs service meshes](https://www.cncf.io/blog/2024/02/27/flagger-vs-argo-rollouts-vs-service-meshes-a-guide-to-progressive-delivery-in-kubernetes/), February 27, 2024, Rollout replacing Deployments versus Flagger referencing them
