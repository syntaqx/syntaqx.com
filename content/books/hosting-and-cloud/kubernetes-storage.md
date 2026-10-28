+++
title = "Storage & Stateful Workloads"
description = "In-tree plugins to CSI, claims and classes, topology and attach limits, StatefulSets, database operators, Velero, and when state belongs outside."
category = "Hosting & Cloud Industry"
order = 2121
part = "Kubernetes"
tags = ["kubernetes", "storage", "csi", "statefulsets", "operators", "backup"]
+++

Kubernetes was designed around workloads that can die and be replaced anywhere, and storage is the one thing that can't follow them. A pod rescheduled to another node arrives in seconds; the disk it was writing to is a block volume attached to one virtual machine in one zone, which has to be detached from the old node, attached to the new one, and mounted before the pod can start, and which can't move to another zone at all. Everything Kubernetes added for state (persistent volumes and claims, storage classes, StatefulSets, snapshots, the Container Storage Interface) exists to make that physical fact look like a declarative API, and every part of the abstraction leaks somewhere: in a pod stuck `Pending` because its volume is in the wrong zone, in a node that can't take another pod because it has run out of disk attachment slots, in a reclaim policy that deleted the data along with the claim.

For a provider the stakes are larger than for its customers. A claim in a customer's cluster creates a billable volume in the provider's block storage, through a driver the provider writes and ships as a managed add-on; the provider's per-instance attachment limits become the customer's scheduling limits; and a volume orphaned by a deleted cluster is the provider's to find, bill or credit. Providers that run customer workloads on Kubernetes themselves meet the hardest version of the problem: Gitpod, which ran developer environments on Kubernetes for six years, identified storage as "the crucial element" in why it left.

This chapter covers the move from in-tree volume plugins to CSI, the claim, volume and class objects, binding and topology, provider CSI drivers and their per-node limits, StatefulSets, database and storage operators, backup and restore with Velero, and when state belongs outside the cluster. It links claims in [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture)'s `clusters` to the `volumes` side table of Storage: Block, File & Object, which owns volume types, snapshots and their billing. Backup policies and restores are Backups, Restores & Migrations; managed databases as a product are [Managed Databases](/books/hosting-and-cloud/managed-databases); the playbook's [Disaster Recovery](/docs/operations/disaster-recovery) owns backup rules in general.

## How the Providers Do It

| Provider | Block storage driver | Default classes and binding | Per-node attach limit, as of October 2026 | Notes |
| --- | --- | --- | --- | --- |
| **Amazon EKS** | Amazon EBS CSI driver (`ebs.csi.aws.com`) as an EKS add-on, with IAM through EKS Pod Identity or IRSA; Auto Mode includes block storage and uses its own provisioner, `ebs.csi.eks.amazonaws.com` | Customer-defined; snapshots need the CSI snapshot controller installed | Kubernetes documents 25 volumes for M5, C5, R5, T3 and Z1D and 39 for other types; ENIs and other non-CSI devices consume the same slots, so the driver offers `--volume-attach-limit` and `--reserved-volume-attachments` | Fargate pods can't mount EBS volumes; existing volumes move to Auto Mode through snapshots |
| **Google GKE** | Compute Engine persistent disk CSI driver, "always enabled in Autopilot clusters"; enabled by the customer on Standard | `standard-rwo` (balanced PD, `WaitForFirstConsumer`) and `premium-rwo` (SSD PD) | Up to 127 volumes per node, depending on node type | Newer machine series such as C3 and E4 need Hyperdisk; a pod pinned to one with an older disk type stays `Pending` |
| **Azure AKS** | Azure Disk CSI driver (`disk.csi.azure.com`) | `default` (Standard SSD), `managed-csi`, `managed-csi-premium`, and from 1.35 `managed-csi-premium-v2`; all `WaitForFirstConsumer`; zone-redundant disks in zonal clusters from 1.29 | Varies by VM size, up to 64 disks; read from the node's `CSINode` object | Online expansion up to 4 TiB on Standard and Premium SSD; shrinking is refused |
| **DigitalOcean DOKS** | DigitalOcean Volumes through the `do-block-storage` class | `ReadWriteOnce` only; 1 GB to 10,000 GB; volumes only grow | 15 volumes per Droplet, one Droplet per volume at a time | Billing runs until the volume is deleted, and deleting a deployment doesn't delete its claims |
| **Akamai (Linode) LKE** | Linode Block Storage CSI driver | Customer-visible classes on the cluster | Between 8 and 64 volumes per Linode, scaling with plan memory | Volume and Linode must be in the same data center |
| **Oracle OKE** | Block Volume through CSI (recommended) or FlexVolume; File Storage and Lustre through CSI | Customer-visible classes on the cluster | By compute shape | Virtual nodes can use File Storage only; data at rest encrypted by default |

Three patterns run through the table:

- **The driver is a managed add-on, not part of the control plane.** Every provider ships its block storage as a CSI driver that runs in the customer's cluster, with its own version, its own IAM, and its own support window (EKS supports the latest add-on version and one prior).
- **The attach limit is the provider's instance shape showing through.** The number of volumes a node can hold comes from the VM or Droplet type, not from Kubernetes, and on AWS it is shared with the network interfaces the pod network uses, so storage density and pod networking compete for the same slots ([Cluster Networking](/books/hosting-and-cloud/cluster-networking)).
- **Zone-bound disks force late binding.** Every provider that documents a default class sets `WaitForFirstConsumer`, because a disk created before the scheduler has picked a node is a disk in a zone the pod may not be able to run in.

## From In-Tree Plugins to CSI

The first Kubernetes storage plugins were compiled into the core binaries: one per cloud disk and network file system, released with Kubernetes. The CSI GA post gave the two costs plainly: vendors "were forced to align with the Kubernetes release process" even to fix a bug, and "third-party storage code caused reliability and security issues in core Kubernetes binaries" that maintainers could barely test.

The Container Storage Interface took storage out of the tree. Its objective is for a vendor to "develop a plugin once and have it work across a number of container orchestration (CO) systems," and it defines three gRPC services:

| Service | Implemented by | What it does |
| --- | --- | --- |
| **Identity** | Every plugin | Names the driver and its capabilities |
| **Controller** | The controller plugin, run anywhere | `CreateVolume`, `DeleteVolume`, `ControllerPublishVolume` (attach to a node, which "MUST NOT assume" it runs on that node), `ControllerUnpublishVolume`, `CreateSnapshot`, `ControllerExpandVolume` |
| **Node** | The node plugin, a DaemonSet on every node | `NodeStageVolume` (format and mount once per node), `NodePublishVolume` (bind-mount into the pod), `NodeGetInfo` (the node's topology and how many volumes it can hold) |

A volume moves through `CREATED` (after `CreateVolume`), `NODE_READY` (after `ControllerPublishVolume`), `VOL_READY` (after `NodeStageVolume`) and `PUBLISHED` (after `NodePublishVolume`), and back out in reverse. Kubernetes connects the API to these calls with sidecar containers that run beside the driver: the external-provisioner "watches the Kubernetes API server for `PersistentVolumeClaim` objects" and calls `CreateVolume`, or `DeleteVolume` when a claim with a delete policy goes; the external-attacher watches `VolumeAttachment` objects and calls `ControllerPublishVolume` and `ControllerUnpublishVolume`; the external-resizer, external-snapshotter, node-driver-registrar and livenessprobe cover expansion, snapshots, registration with the kubelet and health.

The dated path:

| Step | When | What it solved | What it cost |
| --- | --- | --- | --- |
| CSI alpha, beta, GA | 1.9, 1.10, then GA in 1.13 (December 2018; post January 15, 2019) | Drivers ship on the vendor's schedule, outside the core binaries | A driver, its sidecars and their versions to operate in every cluster |
| Volume snapshots | Alpha 1.12, beta 1.17, GA 1.20 (December 10, 2020) | `VolumeSnapshot`, `VolumeSnapshotContent` and `VolumeSnapshotClass` as a portable API | Not in core: CRDs, a snapshot controller and a validation webhook that the distribution must install; CSI only; no application consistency |
| Dynamic volume limits | Stable 1.17 | The scheduler honors the per-node limit a driver reports | Limits read once at startup went stale as other devices consumed slots |
| CSI migration (KEP-625) | Alpha 1.14, beta 1.17, stable 1.25 | A translation layer turns in-tree volume API calls into CSI calls, so the in-tree code could go without breaking existing objects | Every cluster had to install the provider's driver before upgrading |
| In-tree cloud providers removed | 1.31 | About 1.5 million lines out of core; "over 100 CSI drivers" available | The cloud driver is now always a separate add-on |
| Mutable CSI node allocatable count | Stable 1.36 | The kubelet refreshes the driver's attach limit periodically (minimum 10 seconds) and immediately on a `ResourceExhausted` attach error | Drivers must implement it; the EBS driver needs v1.46.0 or later |

## Claims, Volumes and Classes

Three objects split the problem between the customer and the platform:

- **PersistentVolumeClaim (PVC):** the workload's request, in its namespace: a size, access modes, a volume mode and a class. It is "a claim check" on a volume.
- **PersistentVolume (PV):** a piece of storage in the cluster, cluster-scoped, created statically by an administrator or dynamically by a driver. Binding is one-to-one through a `claimRef`, and a claim stays unbound if nothing matches (a 100Gi claim won't bind to 50Gi volumes).
- **StorageClass:** how to make volumes: a `provisioner` (the CSI driver's name), opaque `parameters` for it (disk type, IOPS, encryption key), a `reclaimPolicy` that defaults to `Delete`, `allowVolumeExpansion`, `mountOptions` that Kubernetes doesn't validate, a `volumeBindingMode`, and optionally `allowedTopologies`. The class annotated `storageclass.kubernetes.io/is-default-class: "true"` serves claims that name none; with several defaults, the newest wins; `storageClassName: ""` opts out.

The fields with consequences:

| Field | Values | What goes wrong |
| --- | --- | --- |
| Access modes | `ReadWriteOnce` (one node), `ReadOnlyMany`, `ReadWriteMany`, `ReadWriteOncePod` (one pod cluster-wide, stable in 1.29, CSI only) | Modes "do **not** enforce write protection once the storage has been mounted," and `ReadWriteOnce` still lets several pods on the same node write; only `ReadWriteOncePod` is a constraint. A block volume is `ReadWriteOnce`: DOKS accepts nothing else, and `ReadWriteMany` means a file service |
| Reclaim policy | `Delete`, `Retain`; `Recycle` deprecated (in 1.37 only `nfs` and `hostPath` support it) | `Delete` removes "the associated storage asset in the external infrastructure" when the claim goes, so a deleted namespace is deleted data; `Retain` leaves a `Released` volume that bills until someone cleans it up |
| Volume mode | `Filesystem` (default), `Block` | Raw block uses `volumeDevices` instead of `volumeMounts` |
| Expansion | Stable 1.24, including in-use claims | Only up: no driver shrinks; AKS needs the disk detached to grow Standard and Premium SSD past 4 TiB |
| Phases | `Available`, `Bound`, `Released`, `Failed` | A finalizer (storage object in use protection) keeps a claim used by a pod, and a volume bound to a claim, from being deleted |

Snapshots follow the same split: a `VolumeSnapshotClass` names a driver and a `deletionPolicy`, a `VolumeSnapshot` in the namespace points at a claim, and a `VolumeSnapshotContent` is the provider snapshot. A snapshot can only seed a new claim; the API can't revert a claim in place, and it promises nothing about application consistency, so a database must be quiesced or its own backup used. On AKS, a snapshot class parameter chooses full or incremental Azure snapshots; on EKS, snapshots need the snapshot controller installed first. The provider snapshot itself, its storage and its bill are Storage: Block, File & Object's.

## Binding, Topology and Attach Limits

A zonal disk can only attach to a node in its zone. With `volumeBindingMode: Immediate`, the default when the field is unset, the volume is provisioned when the claim is created, "without knowledge of the Pod's scheduling requirements," which "may result in unschedulable Pods": the disk lands in one zone and the pod's affinity, taints or resources put it in another. `WaitForFirstConsumer` delays binding and provisioning until a pod using the claim is scheduled, so the volume is created where the scheduler put the pod, honoring its node selectors, affinity and tolerations. Two rules follow from the docs: don't set `nodeName` on such a pod, because it bypasses the scheduler and leaves the claim `Pending` (use a `kubernetes.io/hostname` node selector), and use `allowedTopologies` with `topology.kubernetes.io/zone` only to restrict classes to zones, as the replacement for the old `zone` and `zones` parameters.

Late binding fixes creation, not movement. Once created, the volume stays in its zone, so the pod that owns it can only ever be rescheduled into that zone; a zone outage strands it, and a cluster autoscaler has to add a node in that particular zone to run it. Zone-redundant disks, which AKS uses for its built-in classes in zonal clusters from 1.29, replicate synchronously across zones at a higher price.

The attach limit is the other constraint the scheduler has to know. Every provider caps the volumes one machine can hold, and the cap is a property of its instance types:

- Kubernetes' scheduler defaults were 39 for EBS, 16 for Persistent Disk and 16 for Azure Disk, refined by node type to 25 or 39 on EBS, up to 127 on Compute Engine and up to 64 on Azure. For CSI volumes the scheduler uses whatever the driver reports through `NodeGetInfo`.
- On AWS the number moves: ENIs and other non-CSI devices consume attachment slots after the driver has reported its limit, so the EBS driver's FAQ lists static overrides, instance types with dedicated EBS limits, VPC CNI prefix delegation (fewer ENIs) and the 1.34+ dynamic refresh as mitigations.
- DigitalOcean allows 15 volumes per Droplet; Akamai between 8 and 64 per Linode, by memory.
- From 1.37, a driver can set `preventPodSchedulingIfMissing` (beta, behind `VolumeLimitScaling`) so pods aren't placed on nodes where it isn't running yet; the default is off because Cluster Autoscaler may not account for CSI limits unless run with `--enable-csi-node-aware-scheduling=true`.

Detach is the slowest step and the least visible. When a node dies or a volume is unmounted uncleanly, the attach/detach controller waits six minutes before force-detaching, which is why the EBS driver enables a PreStop hook by default to unmount cleanly during drains. Gitpod's list of reasons for leaving Kubernetes starts here: "unpredictable attachment and detachment timing, leading to unpredictable workspace startup times," reliability problems "especially noticeable on Google Cloud (in 2022)," limits on disks per instance that capped workspaces per node, and zone locality that made balancing across zones harder. Its other options were no better for its workload: local SSDs in RAID 0 were fast but tied data to one node and lost it with one disk, and backing up local disks to S3 as tar archives took most of a node's CPU to compress.

## StatefulSets

A Deployment's pods are interchangeable; a StatefulSet's are not. The Workloads API, the `apps` group StatefulSet belongs to, became GA in 1.9 (December 2017), and a StatefulSet gives each pod three things a database needs:

- **A stable identity.** Pods are named `$(statefulset name)-$(ordinal)` and get DNS names under a headless Service the customer must create (`serviceName`), so `db-0` is always `db-0.db.<namespace>.svc.cluster.local`. `.spec.ordinals.start` (stable in 1.31) shifts the numbering, which helps when moving a set between clusters.
- **Stable storage.** `volumeClaimTemplates` create one claim per pod (`www-web-0`, `www-web-1`), and a rescheduled pod reattaches the same claim. The docs' own example recommends `ReadWriteOncePod` for production.
- **Ordering.** With the default `podManagementPolicy: OrderedReady`, pods are created, scaled and terminated one at a time, each waiting for its predecessor to be ready; `Parallel` drops the ordering but keeps identity.

Updates use `RollingUpdate`, with a `partition` that updates only ordinals at or above it (a canary for a replicated database) and `maxUnavailable` (beta in 1.35, default 1). Two behaviors bite operators. Deleting or scaling down a StatefulSet doesn't delete its claims, "to protect data," unless `persistentVolumeClaimRetentionPolicy` (`whenDeleted`, `whenScaled`, each `Retain` by default or `Delete`; stable in 1.32) says otherwise; the retained claims are retained volumes on the customer's bill. And with `OrderedReady`, a bad template that never becomes ready stalls the rollout in a state reverting the template doesn't fix: because of a known issue, the controller keeps waiting for the broken pod, and someone must delete it by hand.

A StatefulSet gives identity and storage, not replication, failover or backup. It doesn't know which pod is the primary, how to promote a replica, or how to restore one. That knowledge is what operators add.

## Operators for Databases and Storage

An operator is a CRD plus a controller that encodes how to run one piece of software, the pattern CoreOS introduced in 2016 and Red Hat's Operator Framework packaged in May 2018 ([Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture#the-control-loop) covers the control loop it builds on). Storage and databases are where the pattern earns its keep, because their failure handling is too specific for generic controllers:

- **CloudNativePG** is a Postgres operator. EDB released it as open source and applied to the CNCF Sandbox on May 12, 2022 (first release v1.15.0, April 21, 2022); the CNCF accepted it on January 21, 2025. Apache 2.0. A `Cluster` resource declares "one primary, with optional multiple hot standby replicas," kept current by Postgres streaming replication; the operator creates `-rw` (primary only), `-ro` (standbys only) and `-r` (any instance) Services, and on failover "automatically updates the `-rw` service to point to the promoted primary." Its storage advice inverts the block-storage default: instances "should not share the storage and preferably use local volumes attached to the node they run on," and the project recommends "against storage-level replication with PostgreSQL," because Postgres replicates itself.
- **Rook** is the "open source cloud native storage orchestrator for Kubernetes," and in practice the Ceph operator: it deploys, configures, scales, upgrades and monitors Ceph clusters that provide block, file and object storage to the cluster, through Ceph's CSI drivers. The Ceph operator was declared stable with v0.9 in December 2018; the CNCF accepted Rook on January 29, 2018, moved it to incubating on September 25, 2018, and graduated it on October 7, 2020.

The provider's choice is whether to let customers bring operators for state or to sell the database. An operator in the customer's cluster is the customer's to upgrade and the customer's data to lose; it consumes the provider's block storage, attach limits and zones like any other workload; and, for CloudNativePG's local-volume advice, it wants node-local disks that the provider's managed node pools may not offer.

## Backup and Restore

Cluster backup has two halves: the Kubernetes objects (the StatefulSet, its Services, Secrets, claims) and the data in the volumes. A volume snapshot alone restores a disk with no workload to mount it; a manifest export alone restores a workload with empty disks.

Velero does both at the Kubernetes API layer. It began at Heptio as Ark; the v0.11.0 release notes say "Heptio Ark is now Velero! This release is the first one to use the new name." Heptio went to VMware, VMware to Broadcom, and Broadcom contributed Velero to the CNCF, which lists it as accepted to the Sandbox on March 11, 2026; the project's announcement is dated July 30, 2026, with maintainers from Broadcom, Red Hat and Microsoft and consensus governance with supermajority votes. How it works:

- The client creates a `Backup` object; the BackupController queries the API server for the selected resources and uploads them as a tarball to object storage at a backup storage location, then snapshots persistent volumes unless told not to (`--snapshot-volumes=false`).
- For CSI volumes, a plugin picks a `VolumeSnapshotClass` by driver and the `velero.io/csi-volumesnapshot-class` label and creates a `VolumeSnapshot` in the claim's namespace. Only the snapshot objects go into the tarball; "only Kubernetes objects are uploaded to the object storage, not the data in snapshots," which stays in the provider's snapshot store, in that provider and usually that region. Moving snapshot data out is a separate data mover; the CSI plugin has been part of Velero since 1.14.
- Schedules run backups on a cron expression, named `<schedule>-<timestamp>`; backups expire after a default TTL of 30 days, with garbage collection hourly.
- A `Restore` fetches the backup, preprocesses resources for the target cluster and restores them one at a time, skipping objects that already exist unless `--existing-resource-policy=update`. A backup storage location can be made read-only during a restore so nothing is created or deleted.
- Backups "are not strictly atomic": objects changed during a backup can be missed.

For a provider the second bullet is the one to explain to customers. A snapshot-based cluster backup sits in the same provider as the cluster, so it survives a deleted namespace but not a closed account or a lost region; the playbook's [3-2-1 and immutable copy](/docs/operations/disaster-recovery#backups) rules need the data moved elsewhere, and [restores are what matter](/docs/operations/disaster-recovery#restores-are-what-matter). Database operators bring their own backups (WAL archiving to object storage for Postgres), which are usually better than a volume snapshot of a running database, because the API's snapshots make no consistency promise. Backup records, policies and restore drills as a provider product are Backups, Restores & Migrations.

## When State Belongs Outside the Cluster

Everything above works, and every part of it is something the customer or the provider has to operate: the driver and its sidecars, the zone a volume is stuck in, the attach slots, the operator's upgrades, the snapshot controller, the backups and their restores. A managed database moves all of it to a service whose provider runs replication, failover, backups and point-in-time recovery as a product, priced and supported (Managed Databases). The rule I'd apply is the playbook's [When Not to Run It](/docs/operations/kubernetes#when-not-to-run-it) with storage as the deciding factor: state goes in the cluster when the team needs something the managed service won't give (an extension, a version, a topology, local NVMe, a price at scale) and has the people to run it; otherwise the cluster holds the stateless tier and connects to managed state.

The signals that state has outgrown the cluster are the ones Gitpod listed: attach and detach timing showing up in startup latency, attachment limits deciding pods per node, zone locality fighting the scheduler, and shared IO bandwidth starving neighbors until a per-workload IO limiter was needed. Gitpod's answer was to leave Kubernetes for its own control plane; most customers' answer is a managed database and object storage for everything that isn't a database.

## The Alternatives

| Choice | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Provider block storage via CSI** (EBS, Persistent Disk, Azure Disk, DO Volumes, Linode Block Storage, OCI Block Volume) | Network-attached disk per claim, one node at a time | Managed durability, snapshots, expansion, the default class | Zonal; attach and detach latency; per-node attach limits; `Delete` reclaim deletes data | Provider-maintained drivers | The provider's volume pricing | The default on every managed cluster |
| **Provider file storage via CSI** | Shared file system mounted on many nodes | `ReadWriteMany`, not zone-pinned | Throughput limits and file semantics databases don't want | Provider | The provider's file storage pricing | Workloads that need `ReadWriteMany` |
| **Local volumes and node-local disks** | Disk on the node | Lowest latency, no attach step | Data dies with the node; pods pinned to nodes | Kubernetes `local` volumes | Included in the instance | CloudNativePG's recommendation, Gitpod's RAID 0 |
| **Rook and Ceph** | Software-defined storage on the cluster's own nodes | Block, file and object without a cloud dependency | Ceph is a distributed system to run; recovery traffic competes with workloads | Apache 2.0; CNCF graduated | Nodes and disks | Self-managed and on-premises clusters |
| **Database operator** (CloudNativePG) | CRD and controller per database | Replication, failover and backups encoded in software, portable | The customer operates it; storage and zone limits still apply | Apache 2.0; CNCF Sandbox; EDB originated | Free; nodes and disks | Teams running Postgres in clusters |
| **Plain StatefulSet** | Identity and storage, no domain logic | Simple, built in | No failover or backup; a stuck rollout needs manual deletion | Kubernetes | Free | Simple replicated services |
| **Velero** | API objects to object storage, volumes by snapshot or file copy | Cluster-level backup, restore and migration | Snapshot data stays with the provider unless moved; not atomic | Apache 2.0; CNCF Sandbox from March 2026; Broadcom contributed | Free; object storage and snapshots | Cluster backup and migration |
| **Managed database outside the cluster** | Provider service | Replication, backups and point-in-time recovery as a product | Less control over version, extensions and topology; another bill | Provider | The provider's database pricing | Teams that would rather not operate replication and backups |

## My Default

For a provider, my default managed cluster ships its own CSI driver as a supported add-on with default classes that use `WaitForFirstConsumer`, `allowVolumeExpansion: true` and a `Retain` class beside the default `Delete` one, the snapshot CRDs and controller installed, and the attach limit reported dynamically, because each of those is a support ticket the provider otherwise receives. I'd show customers the per-node attach limit of every node type next to its CPU and memory, and record every claim, volume and attachment so a deleted cluster's volumes are found and either billed with notice or deleted, never silently left running.

For customers, my default is stateless clusters with state in managed services: managed databases, object storage and a managed cache, reached over the VPC. I'd put a database in a cluster only behind an operator such as CloudNativePG, on node-local or dedicated disks, with the operator's own backups to object storage in another account or provider, and never as a bare StatefulSet whose failover is a person. Velero is my default for backing up the cluster's objects and for migrations between clusters, with snapshot data moved off the provider for anything that needs to survive an account or region loss. The tradeoff that would change this is cost and control at scale: a team running many large Postgres instances with in-house expertise can beat managed pricing in a cluster, and should then treat the operator, the disks and the restore drills as a product of its own.

## How to Build It

The chapter adds the link from a cluster to the volumes its claims use. Volumes are resources of kind `volume` with the `volumes` side table defined by Storage: Block, File & Object, referenced here as `volumes (resource_id)`; snapshots are that chapter's `snapshots`; nodes are resources of kind `virtual_machine` in [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes)'s node pools; backups belong to Backups, Restores & Migrations.

```sql
CREATE TABLE persistent_volume_claims (  -- a claim in a cluster, and the volume behind it
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  cluster_id        UUID NOT NULL REFERENCES clusters (resource_id),
  namespace         TEXT NOT NULL,
  name              TEXT NOT NULL,
  uid               UUID NOT NULL,       -- the claim's Kubernetes uid
  storage_class     TEXT,                -- null: the cluster default at creation
  csi_driver        TEXT NOT NULL,       -- 'ebs.csi.aws.com', 'disk.csi.azure.com', ...
  access_mode       TEXT NOT NULL CHECK (access_mode IN ('read_write_once', 'read_only_many',
                      'read_write_many', 'read_write_once_pod')),
  volume_mode       TEXT NOT NULL CHECK (volume_mode IN ('filesystem', 'block')),
  requested_bytes   BIGINT NOT NULL CHECK (requested_bytes > 0),
  reclaim_policy    TEXT NOT NULL CHECK (reclaim_policy IN ('delete', 'retain')),
  binding_mode      TEXT NOT NULL CHECK (binding_mode IN ('immediate',
                      'wait_for_first_consumer')),
  owner_kind        TEXT,                -- 'StatefulSet' for a volumeClaimTemplate claim
  owner_name        TEXT,
  owner_ordinal     INT,                 -- the pod's ordinal: www-web-2 is 2
  volume_id         UUID REFERENCES volumes (resource_id),  -- null until bound
  bound_during      TSTZRANGE,           -- null until bound; closes when released
  state             TEXT NOT NULL CHECK (state IN ('pending', 'bound', 'lost', 'released',
                      'deleted')),
  exists_during     TSTZRANGE NOT NULL,
  UNIQUE (cluster_id, uid),
  CHECK ((volume_id IS NULL) = (bound_during IS NULL)),
  CHECK (owner_ordinal IS NULL OR owner_kind = 'StatefulSet'),
  EXCLUDE USING GIST (volume_id WITH =, bound_during WITH &&)  -- one claim per volume at a time
);

CREATE TABLE volume_attachments (        -- a volume attached to a node: CSI ControllerPublish
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  volume_id         UUID NOT NULL REFERENCES volumes (resource_id),
  node_id           UUID NOT NULL REFERENCES resources (id),  -- kind = 'virtual_machine'
  cluster_id        UUID NOT NULL REFERENCES clusters (resource_id),
  multi_attach      BOOLEAN NOT NULL DEFAULT FALSE,  -- a volume type that allows it
  attached_during   TSTZRANGE NOT NULL,
  requested_at      TIMESTAMPTZ NOT NULL,  -- when the VolumeAttachment was created
  detach_reason     TEXT CHECK (detach_reason IN ('pod_moved', 'node_drained', 'node_deleted',
                      'force_detach_timeout', 'cluster_deleted', 'manual')),
  EXCLUDE USING GIST (volume_id WITH =, attached_during WITH &&) WHERE (NOT multi_attach)
                                         -- one node at a time unless the volume allows more
);

ALTER TABLE snapshots                    -- Storage: Block, File & Object's side table
  ADD COLUMN source_claim_id UUID REFERENCES persistent_volume_claims (id),
  ADD COLUMN k8s_snapshot_uid UUID;      -- the VolumeSnapshotContent that asked for it
```

Notes on the sketch:

- **The volume is the billed resource; the claim is why it exists.** Usage, quotas and holds stay on `resources`; the claim records the cluster, namespace, class and owner that caused the volume, so a storage line on an invoice traces to a StatefulSet pod, and a deleted cluster's volumes can be listed by `cluster_id`.
- **Binding and attachment are ranges with exclusion constraints.** A volume backs one claim at a time and attaches to one node at a time unless it is a multi-attach type; both are histories, so "which node had this disk at 03:10" and "how long did that attach take" (`lower(attached_during) - requested_at`) are queries.
- **Reclaim policy is copied onto the claim.** The class can change later; what decided whether the data survived is the policy in force when the claim was released.
- **Released and retained volumes are a billing state to surface.** A claim in `released` with a `retain` policy is a volume the customer pays for and may have forgotten; the provider notifies, and a cluster deletion lists every retained volume it leaves behind instead of deleting or keeping them silently.
- **Attach latency is a product metric.** The gap between `requested_at` and attachment, and every `force_detach_timeout`, measured per provider region and instance type, is the number Gitpod's write-up says decided its architecture.
- **Events:** `claim.bound`, `claim.released`, `volume.attached`, `volume.detached`, `volume.force_detached`, `volume.orphaned` (a volume whose cluster or claim is gone) and `snapshot.created` go through the outbox to billing, notifications and support.

## Auditing

- **Every claim and the volume behind it.** Which cluster, namespace and owner created each volume, with which class and reclaim policy, so a lost-data complaint can be answered with whether `Delete` or a person removed it.
- **Every attachment and detach reason.** The node history of each volume, including forced detaches, because a corrupted file system after a node failure starts with where the disk was mounted and how it left.
- **Retained and orphaned volumes.** What a deleted cluster left behind, what the customer was told, and when each was deleted or kept, since these are charges a customer may dispute.
- **Snapshots and their source claims.** Which snapshot came from which claim and Kubernetes object, so a restore can be tied to the workload it restored.
- **Driver versions per cluster.** The CSI driver and snapshot controller versions in each cluster, so a driver bug becomes a list of affected clusters.

## What This Means for the System You Build

- **Ship the CSI driver as a supported add-on,** with default classes that bind late, expand online, and offer a `Retain` option.
- **Publish attach limits per node type** and report them dynamically, because they decide pods per node as much as CPU and memory do.
- **Record claims, bindings and attachments over time,** so every volume traces to a cluster, a namespace and an owner, and every node it touched.
- **Treat reclaim policy as a data-loss setting,** copied onto the claim and shown to the customer before a namespace or cluster is deleted.
- **List what a deleted cluster leaves behind,** and never leave retained volumes billing in silence.
- **Use an operator for databases in clusters,** with the database's own backups, not bare StatefulSets and volume snapshots.
- **Back up cluster objects and data together,** and move snapshot data out of the provider for anything that must survive an account or region loss.
- **Default customers to managed state** and keep the cluster for the stateless tier unless they need what the managed service can't give.

## References

**Specifications**

- [Container Storage Interface specification](https://raw.githubusercontent.com/container-storage-interface/spec/master/spec.md), the objective, Identity, Controller and Node services, RPCs and volume lifecycle states
- [KEP-625: In-tree Storage Plugin to CSI Migration](https://raw.githubusercontent.com/kubernetes/enhancements/master/keps/sig-storage/625-csi-migration/kep.yaml), alpha 1.14, beta 1.17, stable 1.25

**Reference**

- [Kubernetes: Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), lifecycle, binding, reclaim policies, access modes and ReadWriteOncePod stable in 1.29, expansion stable in 1.24, phases, volume modes
- [Kubernetes: Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/), fields, the default class, `Immediate` and `WaitForFirstConsumer`, `allowedTopologies`
- [Kubernetes: Node-specific Volume Limits](https://kubernetes.io/docs/concepts/storage/storage-limits/), scheduler defaults and per-type limits, dynamic limits, mutable allocatable count stable in 1.36, `preventPodSchedulingIfMissing` in 1.37
- [Kubernetes: StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/), identity, volume claim templates, pod management, partitions, `maxUnavailable`, forced rollback, PVC retention policy stable in 1.32, start ordinal
- [Kubernetes CSI: Sidecar containers](https://kubernetes-csi.github.io/docs/sidecar-containers.html), the maintained sidecars
- [Kubernetes CSI: external-provisioner](https://kubernetes-csi.github.io/docs/external-provisioner.html), watching claims and calling CreateVolume and DeleteVolume
- [Kubernetes CSI: external-attacher](https://kubernetes-csi.github.io/docs/external-attacher.html), watching VolumeAttachment objects and calling ControllerPublishVolume

**Provider documentation**

- [Amazon EKS: Use Kubernetes volume storage with Amazon EBS](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html), the EBS CSI add-on, IAM, Auto Mode's provisioner, Fargate and hybrid node limits, the snapshot controller
- [Amazon EBS CSI driver FAQ](https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/faq.md), stale attach limits, overrides, dynamic refresh, the six-minute force detach and the PreStop hook
- [Google Cloud: Using the Compute Engine persistent disk CSI driver](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/persistent-volumes/gce-pd-csi-driver), Autopilot enablement, default classes, binding mode, Hyperdisk on newer machine series
- [Microsoft Learn: Persistent volumes with Azure Disks in AKS](https://learn.microsoft.com/en-us/azure/aks/azure-csi-disk-storage-provision), built-in classes, ZRS from 1.29, binding mode, per-node limits, snapshot parameters, expansion limits
- [DigitalOcean: Add volumes to Kubernetes clusters](https://docs.digitalocean.com/products/kubernetes/how-to/add-volumes/), `do-block-storage`, ReadWriteOnce only, sizes, billing and deletion warnings
- [DigitalOcean: Volumes limits](https://docs.digitalocean.com/products/volumes/details/limits/), 15 volumes per Droplet, one Droplet at a time
- [Akamai: Block Storage](https://techdocs.akamai.com/cloud-computing/docs/block-storage), 8 to 64 volumes per Linode and the same data center rule
- [Oracle: Creating persistent volume claims](https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengcreatingpersistentvolumeclaim.htm), Block Volume through CSI or FlexVolume, File Storage and Lustre, virtual node limits, encryption at rest

**Projects**

- [CloudNativePG: Architecture](https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/main/docs/src/architecture.md), primary and hot standbys, streaming replication, `-rw`, `-ro` and `-r` Services, failover, local volumes and no storage-level replication
- [CloudNativePG repository](https://github.com/cloudnative-pg/cloudnative-pg), the `Cluster` resource, Apache 2.0, CNCF Sandbox
- [Rook: Introduction](https://rook.io/docs/rook/latest/Getting-Started/intro/), the Ceph orchestrator and the Ceph operator stable in v0.9, December 2018
- [Velero documentation](https://velero.io/docs/main/), backup, restore and migration of cluster resources and persistent volumes
- [Velero: How Velero works](https://velero.io/docs/v1.18/how-velero-works/), backups, storage locations, schedules, restores, the 30-day TTL and non-atomic backups
- [Velero: Container Storage Interface snapshot support](https://velero.io/docs/v1.18/csi/), snapshot class selection, snapshot data staying out of object storage, the CSI plugin merged in 1.14
- [Velero v0.11.0 release](https://github.com/vmware-tanzu/velero/releases/tag/v0.11.0), the rename from Heptio Ark

**Announcements and history**

- [Kubernetes blog: Container Storage Interface for Kubernetes GA](https://kubernetes.io/blog/2019/01/15/container-storage-interface-ga/), January 15, 2019, the in-tree problems, alpha 1.9, beta 1.10, GA 1.13
- [Kubernetes blog: Kubernetes 1.20 volume snapshot moves to GA](https://kubernetes.io/blog/2020/12/10/kubernetes-1.20-volume-snapshot-moves-to-ga/), December 10, 2020, the snapshot objects, components and limitations
- [Kubernetes blog: Completing the largest migration in Kubernetes history](https://kubernetes.io/blog/2024/05/20/completing-cloud-provider-migration/), the CSI translation layer, removal in 1.31, over 100 CSI drivers
- [Kubernetes blog: 10 years of Kubernetes](https://kubernetes.io/blog/2024/06/06/10-years-of-kubernetes/), the Workloads API GA in 1.9 and CSI GA in 1.13
- [Red Hat: Introducing the Operator Framework](https://www.redhat.com/en/blog/introducing-operator-framework-building-apps-kubernetes), the operator concept from 2016 and the framework on May 1, 2018
- [EDB: World's first openly governed Postgres operator](https://www.enterprisedb.com/press-releases/edb-accelerates-innovation-worlds-first-openly-governed-postgres-operator-kubernetes), CloudNativePG released and submitted to the CNCF Sandbox, May 12, 2022
- [CloudNativePG v1.15.0 release](https://github.com/cloudnative-pg/cloudnative-pg/releases/tag/v1.15.0), April 21, 2022
- [CNCF: CloudNativePG project page](https://www.cncf.io/projects/cloudnativepg/), accepted to the Sandbox January 21, 2025
- [CNCF: Rook graduation](https://www.cncf.io/announcements/2020/10/07/cloud-native-computing-foundation-announces-rook-graduation/), October 7, 2020
- [CNCF: Rook project page](https://www.cncf.io/projects/rook/), accepted January 29, 2018 and incubating September 25, 2018
- [Velero: Velero joins the CNCF Sandbox](https://velero.io/blog/Velero-Joins-CNCF-Sandbox/), July 30, 2026, Heptio origin, Broadcom's contribution and governance
- [CNCF: Velero project page](https://www.cncf.io/projects/velero/), accepted to the Sandbox March 11, 2026

**In practice**

- [Ona (Gitpod): We are leaving Kubernetes](https://ona.com/stories/we-are-leaving-kubernetes), October 31, 2024, PVC attach and detach timing, disk limits, zone locality, IO bandwidth, local SSDs and S3 backups
