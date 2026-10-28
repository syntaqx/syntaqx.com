+++
title = "Cluster Networking"
description = "CNI and provider pod networks, kube-proxy to nftables and eBPF, Service load balancers, Ingress to Gateway API, ingress-nginx, meshes, multi-cluster."
category = "Hosting & Cloud Industry"
order = 2128
part = "Kubernetes"
tags = ["kubernetes", "networking", "cni", "ebpf", "gateway-api", "load-balancing"]
+++

Kubernetes makes a promise about the network and leaves every part of keeping it to someone else. The promise is short: every pod gets its own cluster-wide IP address, every pod can reach every other pod without NAT, a Service gives a changing set of pods one stable address, and Ingress or its successor, the Gateway API, lets clients outside reach them. Kubernetes itself implements none of the data path. A plugin chosen by whoever built the cluster gives pods their addresses, a proxy on every node turns Service addresses into pod addresses, a controller talks to a cloud API to create the load balancer a `type: LoadBalancer` Service asks for, and a separate controller, often third-party software in the customer's cluster, terminates HTTP for everything behind it.

For a provider, each of those pieces is a product decision with a bill attached. Whether pods take addresses from the customer's VPC or from an overlay decides how big a cluster can grow before it runs out of IPs, whether a firewall rule can name a pod, and whether an abuse report naming a source IP resolves to a pod or to a node. The proxy decides how the data path scales past a few thousand Services. The load balancer controller decides which of the provider's load balancer SKUs a one-line manifest creates, and so what the customer pays for every Service they expose. The HTTP layer is where the ecosystem's worst recent security incident happened, and where the most widely deployed controller was retired in March 2026 with no successor of its own.

This chapter covers the CNI contract and how each provider puts pods on its network, Services and kube-proxy from iptables to nftables, eBPF data planes, how a Service becomes a provider load balancer, Ingress to the Gateway API, the ingress-nginx story end to end, service meshes and multi-cluster. It extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with the `load_balancers` side table and its listeners, and networking columns on [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture)'s `clusters`. The VPCs, subnets, overlays and offload cards underneath are [Data Center Networking](/books/hosting-and-cloud/data-center-networking); NetworkPolicy rules are the playbook's [Network Policies](/docs/operations/kubernetes#network-policies) and, for shared clusters, [Multi-Tenancy, Policy & Security](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy); certificates on listeners are the Certificates part.

## How the Providers Do It

| Provider | Default pod network | Service data plane | A `type: LoadBalancer` Service becomes | HTTP layer offered, as of October 2026 |
| --- | --- | --- | --- | --- |
| **Amazon EKS** | Amazon VPC CNI: each pod gets a private IPv4 or IPv6 address from the VPC, as secondary IPs (or /28 prefixes) on ENIs the plugin attaches to the node; "the only CNI plugin supported by Amazon EKS for nodes that run on AWS infrastructure" | kube-proxy add-on on every EC2 node (not on Fargate); built into Auto Mode | A Classic Load Balancer from the legacy cloud provider controller, which "is only receiving critical bug fixes"; a Network Load Balancer from the AWS Load Balancer Controller (annotation `aws-load-balancer-type: external`) or from Auto Mode | AWS Load Balancer Controller: Ingress becomes an ALB, Gateway resources an NLB or ALB |
| **Google GKE** | VPC-native, "the default network mode for all new clusters": pods use alias IPs from a subnet secondary range, a /24 per node for up to 110 pods by default | GKE Dataplane V2 (eBPF, built on Cilium, no kube-proxy), on by default for new Autopilot clusters and selectable only at cluster creation | From 1.37, a backend service-based passthrough Network Load Balancer with `GCE_VM_IP` NEG backends; internal with `networking.gke.io/load-balancer-type: "Internal"`; target pool-based for older defaults | GKE Gateway controller (GA) with GatewayClasses for global, regional, internal and multi-cluster Application Load Balancers; GKE Ingress makes an external Application Load Balancer |
| **Azure AKS** | Azure CNI Overlay, recommended "for most scenarios": pods get IPs from a private pod CIDR, SNAT to the node IP on egress, 250 pods per node; Azure CNI Pod Subnet for VNet-routable pods; kubenet retires March 31, 2028 | kube-proxy, or Azure CNI Powered by Cilium as the data plane with any IPAM option | A frontend IP on the cluster's Standard Load Balancer, one per Service; the Basic SKU was retired September 30, 2025 | Application Gateway for Containers, run by the in-cluster ALB Controller, implementing Gateway API v1.5 and Ingress, with the data plane outside the cluster |
| **DigitalOcean DOKS** | Cilium; VPC-native clusters route pods to Droplets and managed databases without translation, traditional clusters keep pods on a separate network | Cilium's eBPF kube-proxy replacement on VPC-native clusters from 1.31 | A DigitalOcean Load Balancer from the DigitalOcean Cloud Controller, configured by `service.beta.kubernetes.io/do-loadbalancer-*` annotations; billed from creation | Gateway API: creating a Gateway provisions a Load Balancer |
| **Akamai (Linode) LKE** | Per-cluster pod network 10.2.0.0/16 and Service network 10.128.0.0/16, private to the cluster; the firewall rules LKE requires are for Calico BGP and Typha | Not stated on LKE's networking pages | A NodeBalancer from the Linode Cloud Controller Manager, configured by `service.beta.kubernetes.io/linode-loadbalancer-*` annotations; a paid service | Customer-installed controllers |
| **Oracle OKE** | VCN-native pod networking by default in the console for 1.22 and later (flannel is still the API default and was the only option before July 2022); the plugin can't be changed after creation | Not stated; Oracle recommends the Cilium plugin's eBPF data plane above 5,000 nodes | An OCI load balancer (`oci.oraclecloud.com/load-balancer-type: "lb"` is the default); from 1.37 a flexible shape at 100 Mbps minimum and maximum | Customer-installed controllers |

Four patterns run through the table:

- **The hyperscalers put pods on the VPC; the overlay is the fallback for address space.** AWS gives every pod a VPC address and nothing else on its own infrastructure; Google made alias IPs the default; Azure went the other way and now recommends an overlay because flat VNet addressing needs "large, non-fragmented IP address space." The choice is the customer's IP plan, and it is permanent: GKE's Dataplane V2 and OKE's CNI can only be chosen at creation.
- **The data plane is moving to eBPF at the developer clouds and to nftables upstream.** DigitalOcean, Google and Azure all ship Cilium in some form; upstream kube-proxy has a new nftables backend and an IPVS backend on its way out.
- **A one-line manifest buys a provider SKU.** Every row turns `type: LoadBalancer` into a billed load balancer through a controller the provider writes, configured by provider-specific annotations, and every provider warns that the load balancer belongs to the cluster: DigitalOcean's can't be used if made in the control panel, and editing one there can make the reconciler create a replacement.
- **The HTTP layer is the provider's to sell or the customer's to run.** AWS, Google and Azure each sell a managed L7 load balancer driven by Gateway API resources; at LKE and OKE the customer installs a controller, and the most common one was ingress-nginx, which Wiz found on over 41% of internet-facing clusters in 2025.

## The Network Model and CNI

The network model is the docs' four rules: each pod "gets its own unique cluster-wide IP address," shared by its containers over `localhost`; pods reach each other "directly, without the use of proxies or address translation (NAT)"; agents on a node can reach its pods; and Services, the Gateway API and NetworkPolicy sit on top. The model is implemented by the container runtime, and the common runtimes do it through Container Network Interface plugins. Address ranges come from three places that must not overlap: the network plugin assigns pod IPs, the kube-apiserver assigns Service IPs, and the kubelet or cloud-controller-manager assigns node IPs.

The CNI contract (spec 1.1.0) is deliberately primitive: the runtime executes a plugin binary, passing the operation and the container in environment variables and the network configuration as JSON on stdin.

| Part | What the spec defines |
| --- | --- |
| Environment | `CNI_COMMAND` (the operation), `CNI_CONTAINERID`, `CNI_NETNS` (the network namespace path), `CNI_IFNAME` (the interface to create), `CNI_ARGS`, `CNI_PATH` (where to find plugin binaries) |
| Operations | `ADD`, `DEL`, `CHECK`, `GC`, `VERSION`, `STATUS` |
| Plugin kinds | **Interface plugins** create an interface in the container and give it connectivity; **chained plugins** adjust an existing interface |
| Ordering | `ADD` runs the list in order, each plugin receiving the previous result as `prevResult` and halting on error; `DEL` runs in reverse, is best-effort, and must run even if `ADD` failed; `GC` runs every plugin and reports all errors |
| Result | `interfaces`, `ips` (CIDR, gateway, interface index), `routes`, `dns` |

Everything else is the plugin's business, which is why provider CNIs differ so much underneath the same contract:

- **Pods as VPC addresses (AWS).** The Amazon VPC CNI runs a node-local IPAM daemon, ipamd, inside the `aws-node` DaemonSet. It attaches ENIs to the node and keeps a warm pool of free addresses (`WARM_ENI_TARGET`, default one spare ENI; `WARM_IP_TARGET`, which overrides it and can trigger EC2 API throttling in high-churn clusters; `MINIMUM_IP_TARGET`). `ENABLE_PREFIX_DELEGATION` allocates /28 prefixes instead of single addresses on Nitro instances; `AWS_VPC_K8S_CNI_CUSTOM_NETWORK_CFG` with an `ENIConfig` per subnet puts pods in different subnets and security groups from their node; `ENABLE_POD_ENI` attaches a trunk ENI so each pod can get a branch ENI and its own security group. The cost of the model is density: the project recommends setting kubelet `--max-pods` to ENIs per instance type times (IPs per ENI minus one) plus two, so a small instance runs few pods however much memory it has.
- **Pods as alias ranges (Google).** A VPC-native GKE cluster takes node addresses from a subnet's primary range and pod addresses from secondary ranges, reserved in the VPC before the pods exist. Pod IPs are "natively routable within the cluster's VPC network" and across peering, don't consume route quota, can be named in firewall rules and reached from on-premises over Cloud VPN or Interconnect, and are a prerequisite for NEG-based load balancing. Routes-based clusters, which used custom static routes, remain available but are the legacy mode.
- **Pods behind the node (Azure overlay).** Azure CNI Overlay assigns pods addresses from a CIDR that isn't in the VNet; pods talk to each other directly, but traffic leaving the cluster is SNAT'd to the node's IP and inbound traffic arrives through a load balancer. Pod Subnet instead takes pod IPs from a VNet subnet and preserves them across connected networks. AKS reserves 169.254.0.0/16, 192.0.2.0/24, 172.30.0.0/16 and 172.31.0.0/16 from every range, so a pod CIDR of 172.16.0.0/12 is rejected.
- **Pods on an overlay (developer clouds).** LKE gives every cluster the same private pod and Service ranges; DOKS traditional clusters keep pods off the VPC, and its VPC-native mode needs pod and Service subnets that overlap nothing, with a custom /15 pod subnet to reach 1,000 nodes.

The overlay encapsulations themselves (VXLAN, Geneve, IP-in-IP) and the virtual networks they ride on are [Data Center Networking](/books/hosting-and-cloud/data-center-networking)'s.

## Services and kube-proxy

A Service gives a selector of pods a stable virtual IP; the EndpointSlice controller keeps the list of ready pods behind it current; and on every node a proxy programs the kernel to rewrite traffic for that virtual IP to one of those pods. The Service types layer on each other: `ClusterIP` (the default) is reachable inside the cluster; `NodePort` also opens a port on every node from a range set by `--service-node-port-range` (default 30000-32767); `LoadBalancer` provisions an external load balancer that forwards to those node ports; `ExternalName` is a DNS alias. Two fields decide where traffic may go: `externalTrafficPolicy` and `internalTrafficPolicy`, each `Cluster` (any ready endpoint) or `Local` (only endpoints on the receiving node, dropping traffic if there are none, which is how a load balancer preserves the client's source IP). `sessionAffinity: ClientIP` pins a client to a pod for `timeoutSeconds`, default 10800.

The proxy's history is the history of the data path outgrowing its implementation:

| Mode | When | What it solved | What it cost |
| --- | --- | --- | --- |
| `userspace` | The original proxy | Worked anywhere | Every connection through a user-space process; deprecated, then removed in 1.26 |
| `iptables` | The default to this day | DNAT in the kernel "without rewriting the client IP address," a random backend per endpoint rule | Rules proportional to Services plus endpoints, so per-packet matching is O(n) in Services, and every sync rewrote the ruleset; 2,000 NodePort Services of 10 pods in a 5,000-node cluster meant at least 20,000 rules per node |
| `ipvs` | Added 2017, GA in 1.11 (June 2018) | Kernel load balancing on hash tables, schedulers selected with `--ipvs-scheduler` (`rr` default, `lc`, `dh`, `sh`, `sed`, `nq`) | Still leaned on iptables for parts of Service semantics, never fully matched iptables mode, and IPVS itself stopped being developed; deprecated in 1.35, disabled by default from 1.40 behind the `KubeProxyIPVS` gate, removed in 1.43 |
| `nftables` | Alpha 1.29, beta 1.31, stable 1.33 (KEP-3866) | One rule dispatching through a verdict map, roughly O(1) per packet; syncs proportional to what changed | Linux kernel 5.13 or later, and `nft` 1.0.0 or later on the host; not the default |

The nftables numbers are the reason the mode exists. In measurements published on the Kubernetes blog by Dan Winship of Red Hat, with 5,000 and 10,000 Services "the p50 (average) latency for nftables is about the same as the p01 (approximately best-case) latency for iptables," and at 30,000 Services nftables' p99 beat iptables' p01. The deeper reason is that iptables is a dead end: upstream development has largely stopped, most distributions had moved to the `iptables-nft` compatibility layer by 2022, and Red Hat deprecated iptables, including `iptables-nft`, in RHEL 9.

The default is the operational trap. Kubernetes 1.37 still defaults to iptables, and the docs say "a future version of Kubernetes will change the default to `nftables`," advising every cluster to set its mode explicitly so an upgrade doesn't change the backend underneath it. KEP-5343, which would make nftables the default, is provisional, targeting alpha in 1.37 and GA in 1.40, and doesn't affect clusters that set a mode. For a provider running many customer clusters, the proxy mode is a cluster property to record and pin, not a default to inherit: an IPVS cluster today is a migration to schedule before 1.40, and an unpinned iptables cluster is a behavior change waiting in a future upgrade. Converting is a configuration change and a kube-proxy restart; the nftables post notes that nodes don't need rebooting.

## eBPF Data Planes

The other answer to iptables was to stop using it. eBPF lets a data plane load verified programs into the kernel's networking hooks, so Service translation, policy and observability can run without per-Service rules at all.

- **Cilium** began as an eBPF implementation of CNI from Isovalent and grew into network policy, kube-proxy replacement, encryption, BGP, multi-cluster, sidecarless mesh, Hubble observability and Tetragon runtime security. It became a CNCF incubating project in October 2021 and graduated on October 11, 2023, second only to Kubernetes in commits, with over 800 contributors. Its user space is Apache 2.0 and its BPF code is dual GPL-2.0 and BSD-2-Clause. Cisco completed its acquisition of Isovalent on April 12, 2024, with a stated commitment to eBPF, Cilium and Tetragon.
- **Cilium's kube-proxy replacement** implements `ClusterIP`, `NodePort`, `LoadBalancer` and external IPs in eBPF. Socket-level load balancing checks the destination at `connect` or `sendmsg` and connects the socket straight to a backend, so there is no per-packet NAT; Maglev consistent hashing (`loadBalancer.algorithm=maglev`) applies to north-south traffic; direct server return (`loadBalancer.mode=dsr`) lets backends reply to the client without the extra hop; XDP acceleration (`loadBalancer.acceleration=native`) handles NodePort and LoadBalancer traffic at the driver. With `kubeProxyReplacement: true` the agent refuses to start on a kernel that lacks support; the Helm default handles only in-cluster ClusterIP.
- **Calico** (Tigera, Apache 2.0) added a full eBPF data plane in 3.13 in April 2020. Calico 3.30 (May 2025) added Whisker, a web tool for flow logs, and 3.31 (October 24, 2025) made a new install template that "defaults to the eBPF data plane" and disables kube-proxy automatically, alongside a nftables data plane at GA.
- **Provider builds.** GKE Dataplane V2 "uses cilium instead of kube-proxy to implement Kubernetes Services," enforces NetworkPolicy always, and replaced a legacy data plane that used Calico. Azure offers Cilium as a data plane on top of its own IPAM. DigitalOcean preconfigures Cilium. OKE recommends it above 5,000 nodes.

The cost of eBPF is a kernel dependency and a more opaque data path: features depend on kernel versions and driver support, and the familiar `iptables -L` debugging no longer shows what the node does. For a managed offering, the provider owns the kernel and the image, which is why the providers, not their customers, were the first to make eBPF the default.

## From Service to Provider Load Balancer

A `type: LoadBalancer` Service is a request to a cloud API. Kubernetes first makes the Service a NodePort; then "the cloud-controller-manager component then configures the external load balancer to forward traffic to that assigned node port," asynchronously, and publishes the result in `.status.loadBalancer.ingress`. The cloud-controller-manager is the component that "embeds cloud-specific control logic": its node controller labels nodes with region and zone and deletes Node objects whose servers are gone, its route controller programs routes between nodes where the provider needs them, and its service controller watches Services and creates, updates and deletes load balancers. Beta since 1.11, it was the first step in a migration that began around 1.7 (KEP-2395) and ended in 1.31, when in-tree cloud providers were removed from core Kubernetes, roughly 1.5 million lines of code and about 40% of the core binaries' size.

Moving the cloud code out of the tree did two things a provider cares about. It let each provider ship load balancer features on its own schedule, and it made the controller pluggable, so the same Service can be fulfilled by different implementations. `spec.loadBalancerClass` (stable in 1.24) names an implementation "other than the cloud provider default," can't be changed once set, and is how GKE selects its newer load balancer types (`networking.gke.io/l4-regional-external`); AWS uses an annotation instead, `aws-load-balancer-type: external`, to hand a Service to its newer controller. `spec.allocateLoadBalancerNodePorts: false` skips node ports for implementations that route straight to pods. `spec.loadBalancerIP` was deprecated in 1.24 as under-specified and unable to support dual-stack, in favor of provider annotations; AKS, for example, uses `service.beta.kubernetes.io/azure-pip-name`.

What a Service turns into is the provider's product line, and the details decide cost and failure modes:

- **AWS** has two controllers. The legacy one creates Classic Load Balancers by default and NLBs with instance targets only. The AWS Load Balancer Controller, which began as the AWS ALB Ingress Controller from Ticketmaster and CoreOS and was donated to SIG-AWS in June 2018, creates NLBs for Services (with `ip` targets straight to pod IPs or `instance` targets through node ports), ALBs for Ingress, and both for Gateway resources. EKS documents the sharp edges: annotations shouldn't be edited after creation (delete and recreate the Service instead), every NLB adds security group rules that can exhaust the rules-per-group quota, and an NLB can't be shared across Services while one ALB can front many Ingresses.
- **Google** creates one `GCE_VM_IP` NEG per zone per Service; with `externalTrafficPolicy: Local` only nodes with serving pods join, with `Cluster` a subset of up to 25 nodes for internal and 250 for external load balancers. GKE subsetting, on by default from 1.36 and irreversible, is what lifts the 250-node limit internal load balancers had with instance groups.
- **Azure** gives every Service a dedicated frontend IP on the cluster's Standard Load Balancer, which also provides the nodes' outbound connections unless the outbound type is user-defined routing.
- **DigitalOcean, Akamai and Oracle** create one product load balancer per Service (a Load Balancer, a NodeBalancer, an OCI load balancer), configured entirely by annotations under the provider's prefix, billed from creation.

The billing consequence is the one customers find on the invoice: a load balancer per Service means a load balancer bill per exposed port, and the cheapest way to expose many HTTP services is one L7 load balancer in front of a router, which is what Ingress and the Gateway API exist to configure.

## Ingress to Gateway API

Ingress was the first answer: a resource mapping hosts and paths to Services, satisfied by whichever controller the cluster ran. It reached `networking.k8s.io/v1`, stable in 1.19, with `ingressClassName` choosing the controller and `pathType` the matching rule. It was also too small. Everything beyond hosts and paths (timeouts, rewrites, header matching, canary weights, TLS to backends) became controller-specific annotations, so an Ingress written for one controller meant something else, or nothing, to another. The Kubernetes docs now say: "The Kubernetes project recommends using Gateway instead of Ingress. The Ingress API has been frozen." It stays GA and won't be removed, but will get "no further changes or updates."

The Gateway API was proposed at KubeCon San Diego as the next generation of Ingress and split the one resource into roles: a **GatewayClass** names an implementation (the provider's, or an in-cluster proxy's), a **Gateway** requests listeners on an address from that class, and **HTTPRoute**, `GRPCRoute`, `TLSRoute`, `TCPRoute` and `UDPRoute` attach routing rules to a Gateway from other namespaces, with **ReferenceGrant** authorizing cross-namespace references. The split is what makes it work for a provider: the infrastructure team owns the class and the Gateway, the application team owns its routes, and the load balancer's shape is chosen by the class instead of by annotations. It ships as CRDs outside the Kubernetes release, with CEL validation instead of a mandatory webhook, and supports the five most recent minors, so it upgrades without upgrading the cluster.

| Release | Date | What changed |
| --- | --- | --- |
| v1.0 | October 31, 2023 | Gateway, GatewayClass and HTTPRoute to v1 (GA); Standard and Experimental channels; webhook optional with CEL validation; Kubernetes 1.24+ |
| v1.4 | October 6, 2025 | BackendTLSPolicy, `supportedFeatures` in GatewayClass status and named route rules to Standard; experimental mesh support, default gateways and an `externalAuth` filter |
| v1.5 | February 27, 2026 | ListenerSet, the HTTPRoute CORS filter, TLSRoute v1 and Gateway client certificate validation to Standard; ReferenceGrant moving to v1 |
| v1.6 | June 29, 2026 | TCPRoute and UDPRoute to v1 (GA) |
| v1.6.3 | October 6, 2026 | The latest stable patch as of October 2026; v1.7 is in release candidates, with HTTPRoute retries graduating to Standard |

The providers map GatewayClasses onto their load balancer products. GKE ships classes for each of its Application Load Balancers (`gke-l7-global-external-managed`, `gke-l7-regional-external-managed`, `gke-l7-rilb`, the classic `gke-l7-gxlb`) and multi-cluster `-mc` variants, all GA. Azure's Application Gateway for Containers runs its data plane outside the cluster and is driven by an in-cluster ALB Controller that implements Gateway API v1.5 and Ingress; in its managed mode, each Gateway gets a Frontend whose lifecycle follows the Gateway's. The AWS Load Balancer Controller fulfils Gateways with NLBs and ALBs. DigitalOcean provisions a Load Balancer when a Gateway is created. Where the provider has no class, the customer installs one, an Envoy-, NGINX-, HAProxy- or Cilium-based implementation running in the cluster behind a single `LoadBalancer` Service.

## The ingress-nginx Story

ingress-nginx, the community controller under the `kubernetes` GitHub organization, was for years the common answer to "how do I serve HTTP from my cluster," on providers that sold no L7 product and on many that did. Its flexibility was the selling point: annotations, and "snippets" annotations that injected arbitrary NGINX configuration, could express anything NGINX could. Its admission webhook validated each Ingress by rendering the configuration and running `nginx -t`.

That design produced the incident. On March 24, 2025, Wiz Research published IngressNightmare: CVE-2025-1974, CVE-2025-1097, CVE-2025-1098 and CVE-2025-24514, each CVSS 9.8. The admission controller inside the controller pod had no authentication and was reachable over the pod network. A crafted AdmissionReview injected NGINX directives through annotations; the researchers loaded a shared library through the `ssl_engine` directive (valid anywhere in a configuration, unlike `load_module`), having delivered the library by abusing NGINX's request body buffering and reading the deleted temporary file through procfs. The result was code execution in a pod that, by design, can read Secrets in every namespace, so exploitation meant "unauthorized access to all secrets stored across all namespaces" and usually the cluster. Wiz counted about 43% of cloud environments vulnerable, over 6,500 clusters exposing vulnerable admission controllers to the internet, and over 41% of internet-facing clusters running ingress-nginx. The fixes were 1.12.1 and 1.11.5; the interim mitigations were network policy allowing only the API server to reach the webhook, or disabling it.

The vulnerability exposed the maintenance problem behind it. On November 12, 2025, SIG Network and the Security Response Committee announced the retirement: best-effort maintenance until March 2026, then no releases, no bug fixes and no security fixes, with the repositories read-only and existing images and charts left available. The reasons given were the ones the incident had made visible: the snippets annotations were now "serious security flaws," the project had run on one or two people working in their own time, a 2024 call for help found no new maintainers, and the planned replacement, InGate, never matured and was retired too. The advice was to begin migrating to the Gateway API or another Ingress controller "immediately." GitHub shows `kubernetes/ingress-nginx` archived on March 24, 2026, a year to the day after IngressNightmare.

The lessons for a provider are concrete. A component the customer installs from the project's own organization is still unmaintained software running with cluster-wide read on Secrets; an admission webhook is a network service and needs the same exposure review as any other; and "community default" is not a support commitment. A provider that recommended ingress-nginx in its docs, or shipped it as a marketplace add-on, had customers running an unpatched controller from April 2026 and had to find them. That inventory problem, which clusters run which controllers at which versions, is the case for recording what fronts each load balancer (see How to Build It).

## Service Meshes

A mesh moves mutual TLS, retries, traffic splitting and L7 authorization out of applications into proxies. Two projects dominate, and both changed shape in 2024.

- **Istio** came from Google and IBM on Lyft's Envoy proxy, was accepted into the CNCF on September 30, 2022 and graduated on July 12, 2023; the Open Service Mesh maintainers joined it in 2023. Its classic model put an Envoy sidecar in every pod. Ambient mode, introduced in September 2022 by a community including Solo.io and Google, reached GA in Istio 1.24 on November 7, 2024: a shared per-node L4 proxy, ztunnel ("zero-trust tunnel"), handles mTLS, L4 authorization and telemetry, and optional waypoint proxies handle L7 routing and authorization outside the application pods. Istio reports savings that "can exceed 90%" in some cases; sidecars "remain first-class citizens."
- **Linkerd** was created by Buoyant in 2016, joined the CNCF in January 2017 as its fifth project, and became the first mesh to graduate on July 28, 2021. On February 23, 2024 Buoyant clarified that from 2.15 it would no longer publish open source artifacts marked "stable": edge releases continue every week or two and the code stays Apache 2.0, but stable builds come from Buoyant Enterprise for Linkerd, free in production for companies under 50 employees, with a grace period for larger ones that ended May 21, 2024. TechTarget reported the original price as $2,000 per Kubernetes cluster per month for companies over 50 employees from May 21, and later that the pricing had been reworked into a three-tier scheme by the time the change took effect. A CNCF TOC issue on the "Health of Linkerd project" (cncf/toc#1262) was opened on February 22, 2024 and a governance review (#1594) on May 23, 2024; both are open as of October 2026.

Cilium's sidecarless mesh and the Gateway API's mesh work (the experimental `XMesh` resources in v1.4) are the third path: mesh features from the data plane or the routing API the cluster already runs. For a provider, a managed mesh is a control plane it upgrades (GKE lists a `gke-td` multi-cluster Cloud Service Mesh class in preview); an unmanaged one is one more component in the customer's cluster whose licensing can change under them, which is the lesson of Linkerd's 2024 change.

## Multi-Cluster

Customers run several clusters for regions, blast radius and upgrades, and want a Service to span them. The Multi-Cluster Services API (KEP-1645, beta) defines two CRDs in `multicluster.k8s.io`: a **ServiceExport** declares that a Service "should be exported to other clusters," and a **ServiceImport** describes a service imported from the clusterset. A ClusterSet is a concept, not a resource: a group of clusters "with a high degree of mutual trust and shared ownership," with namespace sameness (a namespace of a given name is the same namespace everywhere) and DNS at `<service>.<ns>.svc.clusterset.local`.

GKE's implementation shows what a provider adds. Clusters register to a fleet; the multi-cluster Service controller generates ServiceImports in every fleet cluster from the exports (the first one can take up to 20 minutes); one config cluster holds the Gateway and HTTPRoutes; and a `gke-l7-global-external-managed-mc` Gateway creates one global Application Load Balancer whose backend services are the imported Services in each cluster, so `/west` and `/east` can route to different regions behind one IP. The API is portable; the global load balancer behind it is the provider's product, which is why multi-cluster is where provider networking differentiates most.

## The Alternatives

| Choice | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Provider VPC CNI** (Amazon VPC CNI, GKE alias IPs, Azure Pod Subnet, OKE VCN-native) | Pods are VPC addresses | Routable, firewallable and attributable pod IPs; NEG and IP-target load balancing | Address exhaustion; pod density tied to ENIs or secondary ranges; locked at creation | Provider-maintained | No license; consumes VPC address space | EKS, GKE, AKS flat, OKE |
| **Overlay CNI** (Azure CNI Overlay, flannel, Calico IP-in-IP or VXLAN) | Pods on a private range, SNAT on egress | Conserves VPC space; maximum scale; simple | Pods hidden behind node IPs from outside; an extra encapsulation hop | Open source or provider | Free | AKS default, LKE, DOKS traditional |
| **kube-proxy iptables** | Per-Service rules | Default, universal, understood | O(n) matching and full-table syncs at scale; iptables deprecated in RHEL 9 | Kubernetes | Free | Most clusters, by default |
| **kube-proxy nftables** | Verdict maps | Constant-time dispatch, incremental syncs, the upstream future | Kernel 5.13+; not the default before KEP-5343 | Kubernetes | Free | Clusters that set it |
| **kube-proxy IPVS** | Kernel load balancer | Was the fast path | Deprecated 1.35, off by default 1.40, removed 1.43 | Kubernetes | Migration work | Clusters that adopted it for scale |
| **Cilium** | eBPF CNI and kube-proxy replacement | No per-Service rules, DSR, Maglev, policy, Hubble, mesh | Kernel feature dependencies; harder debugging | Apache 2.0 and GPL-2.0/BSD-2 BPF; CNCF graduated; Isovalent is Cisco's | Free | GKE Dataplane V2, DOKS, Azure, OKE at scale |
| **Calico** | iptables, nftables or eBPF data plane, BGP | Choice of data plane, mature policy | Several data planes to understand | Apache 2.0; Tigera | Free | LKE (per its firewall rules), GKE's legacy data plane |
| **Provider L7 via Gateway API** (GKE Gateway, Application Gateway for Containers, AWS Load Balancer Controller) | Managed load balancer driven by Gateway and routes | Data plane outside the cluster, provider WAF and certificates ([ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale)), role split | Provider-specific features and classes; not portable beyond the API | Provider | The provider's load balancer product | GKE, AKS, EKS customers |
| **In-cluster Gateway or Ingress controller** (Envoy-, NGINX- or HAProxy-based) | Proxies in the cluster behind one `LoadBalancer` Service | One cloud load balancer for many services, portable | The customer patches it; a controller can be retired, as ingress-nginx was | Varies by project | Nodes plus one load balancer | Clusters on providers with no L7 product |
| **Istio ambient** | ztunnel per node, optional waypoints | mTLS without sidecars, L7 where needed | Another control plane to upgrade | Apache 2.0; CNCF graduated | Free | Mesh adopters |
| **Linkerd** | Sidecar proxy per pod | The first CNCF-graduated mesh, one proxy per pod with no shared node component | Stable builds are Buoyant's since 2.15; open TOC health review | Apache 2.0 code, stable artifacts commercial | Free under 50 employees, otherwise priced by Buoyant | Existing Linkerd users |

## My Default

For a provider running customer clusters, my default is pods on the VPC wherever the address plan allows it, because a pod IP that is a VPC address can be firewalled, load balanced directly and, when an abuse report names it, attributed to a pod instead of to a node shared by fifty tenants. Where the customer can't spare the addresses, I'd use the overlay and record node SNAT as the attribution boundary. For the data plane, I'd ship an eBPF data plane in the managed product (the provider owns the kernel, which removes eBPF's main risk) and, wherever kube-proxy remains, set `mode: nftables` explicitly and record it per cluster, with IPVS clusters on a migration list ahead of 1.40.

For exposure, I'd fulfil `LoadBalancer` Services with a provider controller selected by `loadBalancerClass`, publish the annotations as a documented API, and sell L7 through Gateway API classes rather than through Ingress annotations, because the Gateway API's role split matches the provider-customer boundary and its classes map one-to-one onto SKUs. I wouldn't recommend or package any in-cluster controller without a named maintainer and a support window, after ingress-nginx; customers who bring their own get an inventory and a deprecation notice when their controller loses support. A mesh is something I'd add only when service-to-service mTLS is a requirement, and then Istio ambient, whose licensing and governance are the most settled. What would change this: a customer that needs every pod reachable from on-premises (flat VPC addressing becomes mandatory), or one whose node kernels the provider doesn't control (nftables kube-proxy over eBPF).

## How to Build It

The chapter adds the `load_balancers` side table for resources of kind `load_balancer`, its listeners, and networking columns on [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture#how-to-build-it)'s `clusters`. A Gateway does not get its own resource kind. What the provider holds, bills and attributes is the load balancer and its addresses; a Gateway is one of three Kubernetes objects that can ask for one, recorded as `provisioned_by`. A Gateway fulfilled by an in-cluster proxy isn't a provider resource at all: the provider sees only the `LoadBalancer` Service in front of the proxy, and records the proxy in `serving_proxy`. Networks and subnets are [Data Center Networking](/books/hosting-and-cloud/data-center-networking)'s tables, referenced here as resources of kind `subnet`.

```sql
ALTER TABLE clusters                     -- Kubernetes Architecture's side table
  ADD COLUMN pod_network_mode  TEXT CHECK (pod_network_mode IN ('vpc_native', 'overlay')),
  ADD COLUMN cni               TEXT,     -- 'aws-vpc-cni', 'cilium', 'calico', 'flannel', ...
  ADD COLUMN service_dataplane TEXT CHECK (service_dataplane IN ('iptables', 'nftables',
                                 'ipvs', 'ebpf', 'kernelspace')),  -- set explicitly, never inherited
  ADD COLUMN pod_cidrs         CIDR[],   -- overlay ranges, or the VPC ranges pods draw from
  ADD COLUMN service_cidr      CIDR,
  ADD COLUMN pod_subnet_id     UUID REFERENCES resources (id);    -- kind = 'subnet', when VPC-native

CREATE TABLE load_balancers (            -- side table: kind = 'load_balancer'
  resource_id         UUID PRIMARY KEY REFERENCES resources (id),
  product             TEXT NOT NULL,     -- the provider SKU family: 'nlb', 'alb', 'clb',
                                         -- 'passthrough_nlb', 'application_lb', 'nodebalancer'
  layer               TEXT NOT NULL CHECK (layer IN ('l4', 'l7')),
  scheme              TEXT NOT NULL CHECK (scheme IN ('external', 'internal')),
  cluster_id          UUID REFERENCES clusters (resource_id),  -- null: created through the API
  provisioned_by      TEXT NOT NULL CHECK (provisioned_by IN ('service', 'ingress', 'gateway',
                        'api', 'console')),
  controller          TEXT,              -- loadBalancerClass or GatewayClass controllerName
  source_namespace    TEXT,              -- the Kubernetes object that asked for it
  source_name         TEXT,
  source_uid          UUID,              -- survives renames; a recreated object is a new uid
  target_mode         TEXT CHECK (target_mode IN ('pod_ip', 'node_port', 'instance')),
  serving_proxy       TEXT,              -- what sits behind it in the cluster: 'ingress-nginx',
  serving_proxy_version TEXT,            -- 'envoy-gateway', 'istio-ingress'; null for direct
  CHECK ((provisioned_by IN ('service', 'ingress', 'gateway')) = (cluster_id IS NOT NULL)),
  CHECK ((cluster_id IS NULL) OR (source_uid IS NOT NULL))
);

CREATE UNIQUE INDEX load_balancers_one_per_source  -- one live load balancer per object
  ON load_balancers (cluster_id, source_uid) WHERE source_uid IS NOT NULL;

CREATE TABLE load_balancer_listeners (   -- Gateway listeners, Ingress hosts, Service ports
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  load_balancer_id    UUID NOT NULL REFERENCES load_balancers (resource_id),
  protocol            TEXT NOT NULL CHECK (protocol IN ('tcp', 'udp', 'tls', 'http', 'https',
                        'grpc')),
  port                INT NOT NULL CHECK (port BETWEEN 1 AND 65535),
  hostname            TEXT,              -- the listener's host, normalized A-label
  certificate_id      UUID REFERENCES resources (id),  -- kind = 'certificate'
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (load_balancer_id WITH =, protocol WITH =, port WITH =,
    (COALESCE(hostname, '')) WITH =, valid_during WITH &&)
);
```

Notes on the sketch:

- **The load balancer is the resource; the Kubernetes object is its provenance.** Usage, quotas, holds and abuse cases attach to `resources` as for any other kind; the source namespace, name and uid say which object created it, so deleting a Service and recreating it under the same name is visibly a new load balancer, which is what the providers' controllers actually do.
- **Addresses are identifiers, held over time.** A load balancer's public IPs and DNS names are `resource_identifiers` rows with their ranges, so "who had this IP at 14:02" resolves to the load balancer, its cluster, and through `source_uid` to the Service, exactly as it does for a VM.
- **Pod IPs are attributable only when VPC-native.** `pod_network_mode` tells the abuse desk where attribution stops: in an overlay cluster, an outbound connection carries the node's address and the investigation continues inside the customer's cluster; in a VPC-native cluster the pod address is in the provider's ranges and the CNI's allocation logs can name the pod.
- **The data plane is recorded, not assumed.** `service_dataplane` lets the provider find every IPVS cluster before 1.40 and every cluster still on an implicit iptables default before the default changes.
- **`serving_proxy` is the retirement inventory.** The ingress-nginx retirement would have been a query: every load balancer whose serving proxy is `ingress-nginx`, with its version, account and cluster. The provider learns it from its own add-on catalog, or from the controller's Service labels where the customer installed it.
- **Events:** `load_balancer.provisioned`, `load_balancer.deleted`, `load_balancer.orphaned` (the source object is gone but the cloud resource isn't), `listener.certificate_changed` and `cluster.dataplane_changed` go through the outbox to billing, the abuse desk and the notification service.

## Auditing

- **Which object created every load balancer.** The cluster, namespace, name and uid behind each one, so a customer disputing a load balancer charge sees which Service or Gateway created it, and when.
- **Who held each address.** Load balancer IPs and hostnames with their ranges, for abuse reports and legal requests, alongside the cluster's pod network mode so an investigator knows whether a pod or a node is the last provider-visible hop.
- **What each cluster's data plane was.** CNI, proxy mode and its changes over time, because a networking incident after an upgrade starts with "did the backend change."
- **Which controllers fronted which load balancers, at which version.** So a retirement or a critical CVE in a controller becomes a list of affected accounts and a notice, not a search.
- **Orphans.** Load balancers whose source object no longer exists, still billed, because a reconciler that failed to delete one is the provider's error to credit.

## What This Means for the System You Build

- **Choose VPC-native or overlay pod networking deliberately,** per cluster and at creation, and record it; it decides IP planning, density and abuse attribution.
- **Pin the kube-proxy mode explicitly,** prefer nftables or an eBPF data plane, and migrate IPVS clusters before 1.40.
- **Treat `type: LoadBalancer` as a billed API,** with a provider controller selected by `loadBalancerClass`, documented annotations, and a record linking each load balancer to the object that created it.
- **Sell L7 through Gateway API classes,** one class per load balancer product, and treat Ingress as frozen.
- **Inventory every controller that fronts customer traffic,** with its version and maintainer, so a retirement like ingress-nginx's is a query.
- **Review admission webhooks as network services,** reachable only by the API server.
- **Add a mesh for a stated requirement,** and weigh its governance and licensing as heavily as its features.
- **Record load balancer addresses as held identifiers,** so every IP resolves to a cluster and an object at any instant.

## References

**Specifications**

- [CNI Specification](https://github.com/containernetworking/cni/blob/main/SPEC.md), version 1.1.0, plugin environment variables, operations, interface and chained plugins, ordering and result
- [KEP-3866: nftables kube-proxy backend (kep.yaml)](https://raw.githubusercontent.com/kubernetes/enhancements/master/keps/sig-network/3866-nftables-proxy/kep.yaml), alpha 1.29, beta 1.31, stable 1.33
- [KEP-3866: nftables kube-proxy backend (README)](https://github.com/kubernetes/enhancements/blob/master/keps/sig-network/3866-nftables-proxy/README.md), userspace removal in 1.26, IPVS added in 2017, iptables deprecation in RHEL 9, why IPVS was no replacement
- [KEP-5495: Deprecate ipvs mode in kube-proxy](https://raw.githubusercontent.com/kubernetes/enhancements/master/keps/sig-network/5495-deprecate-ipvs-mode-in-kube-proxy/kep.yaml), deprecated in 1.35
- [KEP-5343: Make nftables the default kube-proxy backend](https://www.kubernetes.dev/resources/keps/5343/), provisional, alpha 1.37, GA 1.40 targeted
- [KEP-1645: Multi-Cluster Services API](https://www.kubernetes.dev/resources/keps/1645/), ServiceExport, ServiceImport, ClusterSet, namespace sameness and `clusterset.local`
- [Gateway API v1.5.0 release](https://github.com/kubernetes-sigs/gateway-api/releases/tag/v1.5.0), ListenerSet, CORS, TLSRoute v1 and client certificate validation to Standard, published February 27, 2026
- [Gateway API v1.6.0 release](https://github.com/kubernetes-sigs/gateway-api/releases/tag/v1.6.0), TCPRoute and UDPRoute to v1, published June 29, 2026
- [Gateway API releases](https://github.com/kubernetes-sigs/gateway-api/releases), v1.6.3 as latest on October 6, 2026 and v1.7 release candidates with HTTPRoute retries

**Reference**

- [Kubernetes: Services, Load Balancing, and Networking](https://kubernetes.io/docs/concepts/services-networking/), the network model
- [Kubernetes: Cluster Networking](https://kubernetes.io/docs/concepts/cluster-administration/networking/), CNI through the container runtime and the three address ranges
- [Kubernetes: Virtual IPs and Service Proxies](https://kubernetes.io/docs/reference/networking/virtual-ips/), proxy modes, the iptables default in 1.37, traffic policies, session affinity, IPVS deprecation and removal schedule, nftables kernel requirement
- [Kubernetes: Service](https://kubernetes.io/docs/concepts/services-networking/service/), Service types, the NodePort range, asynchronous load balancer provisioning, `loadBalancerClass`, `allocateLoadBalancerNodePorts`, `loadBalancerIP` deprecation
- [Kubernetes: Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/), stable in 1.19 and frozen, Gateway recommended
- [Kubernetes: Cloud Controller Manager](https://kubernetes.io/docs/concepts/architecture/cloud-controller/), node, route and service controllers, beta since 1.11
- [Cilium: Kubernetes without kube-proxy](https://docs.cilium.io/en/stable/network/kubernetes/kubeproxy-free/), Service types in eBPF, socket load balancing, Maglev, DSR, XDP, `kubeProxyReplacement`
- [Cilium repository](https://github.com/cilium/cilium), Apache 2.0 user space and GPL-2.0 or BSD-2-Clause BPF code
- [Calico repository](https://github.com/projectcalico/calico), Apache 2.0

**Provider documentation**

- [Amazon EKS: Assign IPs to Pods with the Amazon VPC CNI](https://docs.aws.amazon.com/eks/latest/userguide/managing-vpc-cni.html), VPC addresses for pods and the only supported CNI on AWS infrastructure
- [Amazon VPC CNI plugin for Kubernetes](https://github.com/aws/amazon-vpc-cni-k8s), ipamd, warm pool settings, prefix delegation, custom networking, security groups for pods, the max-pods formula
- [Amazon EKS: Route TCP and UDP traffic with Network Load Balancers](https://docs.aws.amazon.com/eks/latest/userguide/network-load-balancing.html), the legacy controller's Classic Load Balancers, AWS Load Balancer Controller NLBs, target types and caveats
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/), ALBs for Ingress, NLBs for Services, Gateway support, Ticketmaster and CoreOS origin
- [Google Cloud: VPC-native clusters](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/alias-ips), alias IPs as the default, /24 per node and 110 pods
- [Google Cloud: GKE Dataplane V2](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/dataplane-v2), eBPF and Cilium in place of kube-proxy, creation-time only
- [Google Cloud: LoadBalancer Service concepts](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/service-load-balancer), backend service-based load balancers in 1.37, NEGs, subsetting and node limits
- [Google Cloud: Gateway API in GKE](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/gateway-api), the GKE Gateway controllers and GatewayClasses
- [Google Cloud: Deploying multi-cluster Gateways](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/deploying-multi-cluster-gateways), fleets, ServiceExports, config cluster and the resulting load balancer
- [Microsoft Learn: CNI networking in AKS](https://learn.microsoft.com/en-us/azure/aks/concepts-network-cni-overview), overlay and flat models, 250 pods per node, kubenet retirement on March 31, 2028, reserved ranges
- [Microsoft Learn: Use a public Standard Load Balancer in AKS](https://learn.microsoft.com/en-us/azure/aks/load-balancer-standard), frontend IP per Service, Basic SKU retired September 30, 2025
- [Microsoft Learn: What is Application Gateway for Containers?](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/overview), ALB Controller, Gateway API v1.5 and Ingress, managed Frontends
- [DigitalOcean: Kubernetes features](https://docs.digitalocean.com/products/kubernetes/details/features/), Cilium, VPC-native clusters, kube-proxy replacement from 1.31, Gateway API load balancers
- [DigitalOcean: Add load balancers](https://docs.digitalocean.com/products/kubernetes/how-to/add-load-balancers/), the cloud controller, annotations, billing and control panel warnings
- [Akamai: LKE network and firewall details](https://techdocs.akamai.com/cloud-computing/docs/lke-network-firewall-details), pod and Service ranges and the Calico firewall rules
- [Akamai: Load balancing on an LKE cluster](https://techdocs.akamai.com/cloud-computing/docs/get-started-with-load-balancing-on-an-lke-cluster), NodeBalancers through the Linode CCM and their annotations
- [Oracle: Pod networking](https://docs.oracle.com/en-us/iaas/Content/ContEng/Concepts/contengpodnetworking.htm), VCN-native and flannel, defaults and Cilium above 5,000 nodes
- [Oracle: Provisioning load balancers for Services of type LoadBalancer](https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengcreatingloadbalancers-subtopic.htm), the default load balancer type and the 1.37 flexible shape

**Announcements and history**

- [Kubernetes blog: NFTables mode for kube-proxy](https://kubernetes.io/blog/2025/02/28/nftables-kube-proxy/), February 28, 2025, O(n) versus verdict maps, latency at 5,000 to 30,000 Services, enabling it
- [Kubernetes blog: IPVS-Based In-Cluster Load Balancing Deep Dive](https://kubernetes.io/blog/2018/07/09/ipvs-based-in-cluster-load-balancing-deep-dive/), GA in 1.11, the 20,000-rule example, schedulers
- [Kubernetes blog: Completing the largest migration in Kubernetes history](https://kubernetes.io/blog/2024/05/20/completing-cloud-provider-migration/), work since 1.7, removal in 1.31, 1.5 million lines and 40% smaller binaries
- [Kubernetes blog: Gateway API v1.0](https://kubernetes.io/blog/2023/10/31/gateway-api-ga/), October 31, 2023, GA resources, CEL validation, channels, ReferenceGrant, KubeCon San Diego origin
- [Kubernetes blog: Gateway API v1.4](https://kubernetes.io/blog/2025/11/06/gateway-api-v1-4/), released October 6, 2025, features to Standard and Experimental
- [CNCF: Cilium graduation](https://www.cncf.io/announcements/2023/10/11/cloud-native-computing-foundation-announces-cilium-graduation/), October 11, 2023, incubating October 2021, contributors and features
- [Cisco: Cisco completes acquisition of Isovalent](https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2024/m04/cisco-completes-acquisition-of-isovalent-to-define-the-future-of-multicloud-networking-and-security.html), April 12, 2024
- [Tigera: Introducing the Calico eBPF data plane](https://www.tigera.io/blog/introducing-the-calico-ebpf-dataplane-2/), eBPF data plane in 3.13
- [Tigera: Introducing Calico 3.30](https://www.tigera.io/blog/introducing-calico-3-30-a-new-era-of-open-source-network-security-and-observability-for-kubernetes/), Whisker flow logs
- [Calico v3.30.0 release](https://github.com/projectcalico/calico/releases/tag/v3.30.0), May 2025
- [Tigera: What's new in Calico v3.31](https://www.tigera.io/blog/whats-new-in-calico-v3-31-ebpf-nftables-and-more/), October 24, 2025, eBPF default in the new template and nftables GA
- [Istio: Ambient mode reaches GA](https://istio.io/latest/blog/2024/ambient-reaches-ga/), November 7, 2024, ztunnel and waypoints, history since September 2022, savings claims
- [CNCF: Istio graduation](https://www.cncf.io/announcements/2023/07/12/cloud-native-computing-foundation-reaffirms-istio-maturity-with-project-graduation/), July 12, 2023, Google and IBM origin, Open Service Mesh maintainers
- [CNCF: Istio project page](https://www.cncf.io/projects/istio/), accepted September 30, 2022
- [CNCF: Linkerd graduation](https://www.cncf.io/announcements/2021/07/28/cloud-native-computing-foundation-announces-linkerd-graduation/), July 28, 2021, created by Buoyant in 2016, fifth CNCF project
- [Buoyant: Clarifications on Linkerd 2.15 stable announcement](https://buoyant.io/blog/clarifications-on-linkerd-2-15-stable-announcement), February 23, 2024, stable artifacts, edge releases, the 50-employee threshold and May 21, 2024 grace period
- [TechTarget: Linkerd service mesh production users will soon have to pay (Wayback)](https://web.archive.org/web/20250113161713/https://www.techtarget.com/searchitoperations/news/366570820/Linkerd-service-mesh-production-users-will-soon-have-to-pay), February 21, 2024, $2,000 per Kubernetes cluster per month from May 21, 2024
- [TechTarget: Linkerd stable release paywall worked, Buoyant CEO says (Wayback)](https://web.archive.org/web/20251110114019/https://www.techtarget.com/searchitoperations/news/366614632/Linkerd-stable-release-paywall-worked-Buoyant-CEO-says), October 24, 2024, the pricing reworked into three tiers before the change took effect
- [CNCF TOC issue #1262: Health of Linkerd project](https://github.com/cncf/toc/issues/1262), opened February 22, 2024, open as of October 2026
- [CNCF TOC issue #1594](https://github.com/cncf/toc/issues/1594), Linkerd governance review opened May 23, 2024, open as of October 2026
- [Wiz: IngressNightmare](https://www.wiz.io/blog/ingress-nginx-kubernetes-vulnerabilities), March 24, 2025, the CVEs, attack chain, exposure figures, fixed versions and mitigations
- [Kubernetes: Ingress NGINX retirement](https://www.kubernetes.dev/blog/2025/11/12/ingress-nginx-retirement/), November 12, 2025, timeline, reasons, InGate and migration advice
- [kubernetes/ingress-nginx](https://github.com/kubernetes/ingress-nginx), archived on March 24, 2026
