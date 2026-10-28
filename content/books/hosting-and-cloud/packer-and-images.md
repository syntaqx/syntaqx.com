+++
title = "Baking Images: Packer"
description = "Golden images and immutable servers: Aminator, Packer's sources, provisioners and post-processors, HCL2, HCP Packer channels and revocation, baking vs frying."
category = "Hosting & Cloud Industry"
order = 2151
part = "Infrastructure as Code"
tags = ["infrastructure-as-code", "packer", "machine-images", "immutable-infrastructure", "golden-images"]
+++

Configuration management repairs machines; image building makes repair unnecessary. Instead of booting a generic operating system and converging it into a web server every time a machine starts, a team builds the web server once, captures its disk as an image, and starts every new machine from that image. The machine boots already configured, an autoscaling group can add capacity in the time it takes to boot, and nothing about a running server changes until it is thrown away and replaced by one built from a newer image. The idea has two names that arrived in the same month of 2013: the **golden image** (the approved, built, tested image everything launches from) and the **immutable server** (a server that, once deployed, is never modified, only replaced).

The tool that made the practice portable is Packer, which Mitchell Hashimoto announced on June 28, 2013 to build images for several platforms from one template. This chapter tells the history (the immutable server, Netflix's Aminator, Packer), Packer in depth (the template, sources and builders, communicators, provisioners, post-processors, the move from JSON to HCL2, plugins and their unbundling), HCP Packer's registry of image metadata with channels, ancestry and revocation, the clouds' own image builders, and the long argument between baking configuration into the image and frying it on at boot. The playbook owns the general rule, [Rebuild, Don't Repair](/docs/delivery/containers#rebuild-don-t-repair), and the container side ([Building Images](/docs/delivery/containers#building-images)); this chapter covers virtual machine images, the tools that build them, and what a provider stores about them.

## How the Providers Do It

Every cloud has an image object, and every one of them is regional, owned by an account, shareable, and expensive to forget. The names differ:

| Provider | Image object | Versioning and pointers | Sharing and distribution | Retirement |
| --- | --- | --- | --- | --- |
| **AWS** | AMI (EBS-backed, built from snapshots; or instance-store) | None built in; an AMI id is immutable, consumers look up the newest by name or tag, or through a registry | Per region (copied with `ami_regions` in Packer); launch permission by account, organization or organizational unit | **Deprecate** (hidden from other accounts' listings and the console, still launchable by id; public AMIs deprecate two years after creation by default), then **deregister**; the owner pays for the snapshots until it does |
| **Google Cloud** | Custom image | **Image families**: "The image family points to the most recent image that you used to create the image family" | By permission on the image | Deprecating the newest image rolls the family back to the previous one |
| **Azure** | Image version in an Azure Compute Gallery, or a managed image or VHD | Versions in the gallery | Gallery, managed image or VHD as distribution targets | Delete per version |
| **AWS EC2 Image Builder** | Managed pipeline producing AMIs and container images | Recipe versions | Distribution configurations to regions and accounts | "Approved AMIs only" enforcement through AWS Organizations |
| **Azure VM Image Builder** | Managed service "built on HashiCorp Packer" | Image templates | Distribution to Compute Gallery, managed image or VHD | Per version |
| **HCP Packer** | A registry of image metadata, not images | Buckets of versions with **channels** as named pointers | References the cloud's own images | **Revocation**, immediate or scheduled, cascading to descendants |

Three things follow for anyone building on these. An image is regional, so one logical image is many provider ids (an AMI per region), and something has to map the logical version to the ids. An image id doesn't say which one is current, so every serious image pipeline adds a pointer (an image family, a gallery version, an HCP Packer channel, a parameter in a config store). And images cost storage until someone deregisters them, so retirement is part of the pipeline, not an afterthought: AWS's own deprecation default for public AMIs (two years) is a hint at how long they otherwise live.

## Golden Images and Immutable Servers

The problem images solved was drift, the same one configuration management attacked from the other side. A server patched in place for years accumulates hand edits, half-applied upgrades and packages nobody remembers installing. Convergence tools fix the parts they know about and leave everything else.

The 2013 answer was to stop changing servers at all:

| Date | Milestone | What it solved, and what it cost |
| --- | --- | --- |
| 2013 (Netflix, copyright 2013) | **Aminator**, Netflix's open-source AMI baker: create a volume from a base AMI's snapshot, attach it to a running instance, mount it, chroot in, install the application's rpm or deb package, snapshot the volume and register a new AMI | A full EC2 image per application build without booting a new instance per build; it was CentOS/RHEL, Python 2.7 and AWS only, and "must bake per region" |
| June 13, 2013 | Kief Morris, **ImmutableServer**, on martinfowler.com: a server "once deployed, is never modified, merely replaced," crediting Ben Butler-Cole for the term, with the phoenix server as its predecessor | The vocabulary: drift is the reason, replacement is the cure |
| June 23, 2013 | Chad Fowler, **"Trash Your Servers and Burn Your Code"**: old servers accumulate changes, so "Build a new, upgraded system and throw the old one away" | The argument for disposability, from an operator |
| June 28, 2013 | Mitchell Hashimoto announces **Packer**: "the existing tooling around them hasn't caught up to the agile workflow that modern cloud infrastructures enable," with AMIs, VirtualBox, VMware and Vagrant boxes as examples | One template, many platforms, built in parallel |
| November 17, 2014 | Netflix's "Zero to the cloud with NetflixOSS" deck: the "unit of deployment = AMI" | The image as the deploy artifact at a large cloud customer |
| March 31, 2016 | InfoQ reports Netflix's **Bakery** API driving Aminator in its build pipeline | Baking as a service inside the delivery pipeline |

What the immutable server cost was time and volume. Every change, a one-line config fix included, became a build, a test and a rollout of new machines, so a team needed fast image builds and machines that could be replaced without ceremony: stateless, behind load balancers, with data elsewhere. Images multiplied (one per build per region per platform), and each needed a name, a record of what was in it, and an end of life. Configuration management didn't disappear; it moved into the image build, where it ran once instead of every half hour. Containers later applied the same idea one layer up, with the image as the unit of deployment and the registry as its store ([From chroot to Containers](/books/hosting-and-cloud/containers) and [Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries) tell that history), and the playbook's [Rebuild, Don't Repair](/docs/delivery/containers#rebuild-don-t-repair) is the rule both arrived at.

## How Packer Works

Packer builds images by starting a temporary machine, configuring it, capturing it, and cleaning up. Its terms, from its own documentation:

- **Template:** the configuration, in HCL2 or legacy JSON.
- **Source** (in HCL2) or **builder** (the plugin component behind it): how to create a machine on one platform and turn it into an image: `amazon-ebs`, `azure-arm`, `googlecompute`, `vsphere-iso`, `qemu`, `docker` and many more.
- **Build:** one source run with its provisioners and post-processors. "The various builds specified within a template are executed in parallel, unless otherwise specified."
- **Communicator:** "the mechanism Packer uses to upload files, execute scripts, etc. with the machine being created": `ssh` (usually the default), `winrm`, or `none`, with which most provisioners can't run. Builders set it up.
- **Provisioner:** software that installs and configures the running machine before it is captured.
- **Post-processor:** runs after the build and provisioners, on the result: compress it, checksum it, import it, record it.
- **Artifact:** the output of one build, for example the AMI ids in each region.
- **Data source:** a lookup at build time, such as the newest AMI matching a filter or a secret from AWS Secrets Manager.

A build with the `amazon-ebs` source, the most common Packer build, goes through these steps:

1. Resolve data sources (the base AMI by filter, secrets).
2. Create temporary access: a key pair and security group rules, named with a `packer` prefix by default so IAM policy can confine what Packer may touch.
3. Launch an EC2 instance from the source AMI with the given instance type.
4. Connect with the communicator and run each provisioner in order.
5. Stop the instance (unless `disable_stop_instance` is set) and create an AMI from its root volume, with the given `ami_name`, which must be unique.
6. Copy the AMI to every region in `ami_regions`, share it with `ami_users`, `ami_org_arns` or `ami_ou_arns`, and set `deprecate_at` if given (at most ten years out).
7. Terminate the instance and delete the temporary resources, then run post-processors.

The Amazon plugin offers other sources for other trade-offs: `amazon-chroot` builds from an existing instance by mounting a volume (Aminator's technique, no new instance per build), `amazon-ebssurrogate` builds an AMI from scratch on an attached volume, `amazon-ebs-volume` produces prepopulated EBS volumes rather than AMIs, and `amazon-instance` builds instance-store AMIs uploaded to S3. Packer doesn't manage AMIs after it creates them: deleting old ones is the pipeline's job.

Failure handling is a flag. `-on-error` defaults to `cleanup` (remove the temporary machine and resources); `abort` leaves everything for inspection (and a later build may need `-force`); `ask` prompts; `run-cleanup-provisioner` stops but runs the template's error-cleanup provisioner. Other build flags: `-only` and `-except` to pick builds, `-parallel-builds=N` to cap concurrency (0, the default, means no limit), `-debug` to disable parallelism and step through, `-var` and `-var-file` for inputs, `-timestamp-ui` for timestamped output.

### Templates: From JSON to HCL2

Packer's templates were JSON for its first six years: a `builders` array, a `provisioners` array, `post-processors`, and string interpolation inside values. JSON was easy to generate and painful to write: no comments, no reuse, no expressions.

Packer 1.5 added HCL2 templates in beta, with builders sharing data such as the instance's IP and port with provisioners; the `v1.5.0` tag is dated December 18, 2019 and HashiCorp's announcement February 3, 2020. Packer 1.7.0 (tagged February 17, 2021) made it final: "Since v1.7.0, HCL2 is the official format for Packer configurations," with JSON still supported as legacy templates. `packer hcl2_upgrade` converts a JSON template to HCL2 (variables files from 1.7.1) and is still marked beta.

An HCL2 template is a set of blocks: `packer` (required versions and plugins), `variable` and `locals` (inputs and computed values), `data` (lookups), `source` (reusable builder configuration) and `build` (which sources to run, with provisioners and post-processors):

```hcl
packer {
  required_version = ">= 1.16.0"
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = "~> 1.8"
    }
  }
}

variable "app_version" { type = string }
variable "regions"     { type = list(string) }

locals {
  stamp = formatdate("YYYYMMDDhhmm", timestamp())
}

data "amazon-ami" "base" {
  region      = var.regions[0]
  owners      = ["099720109477"]               # the base image publisher's account
  most_recent = true
  filters = {
    name                = "ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"
    virtualization-type = "hvm"
  }
}

source "amazon-ebs" "web" {
  region        = var.regions[0]
  ami_regions   = slice(var.regions, 1, length(var.regions))
  source_ami    = data.amazon-ami.base.id
  instance_type = "c7i.large"
  ssh_username  = "ubuntu"
  ami_name      = "web-${var.app_version}-${local.stamp}"
  deprecate_at  = timeadd(timestamp(), "8760h")  # deprecate a year after the build
  tags = { app = "web", version = var.app_version }
}

build {
  name    = "web"
  sources = ["source.amazon-ebs.web"]

  hcp_packer_registry {
    bucket_name = "web"
    bucket_labels = { os = "ubuntu-24.04" }
    build_labels  = { app_version = var.app_version }
  }

  provisioner "file" {
    source      = "dist/web.deb"
    destination = "/tmp/web.deb"
  }

  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y /tmp/web.deb",
      "sudo cloud-init clean --logs",
    ]
    max_retries = 1
  }

  post-processor "manifest" {
    output = "packer-manifest.json"
  }
}
```

A source can be reused across builds and overridden inside one: a `source "source.amazon-ebs.web" { name = "web-arm" ... }` block inside `build` sets the fields that differ (fields set at the top level can't be overwritten there), and named builds prefix their log lines with the build name.

### Builders and Plugins

Packer 0.1.0, tagged June 28, 2013, shipped four builders (`amazonebs`, `digitalocean`, `virtualbox`, `vmware`), one provisioner (`shell`) and one post-processor (`vagrant`), all compiled into the binary. As builders multiplied, the binary grew with them, and a fix to one cloud's builder had to wait for a Packer release.

The fix came in stages. Packer 1.7.0 introduced the `required_plugins` block and `packer init`, with plugins as separate multi-component binaries addressed like `github.com/hashicorp/amazon` (the `packer-plugin-` repository prefix is omitted), pinned with version constraints (`~> 0.9` means at least 0.9 and below 1.0; prereleases only by exact version). Packer 1.9 "shipped with no community plugins bundled into Packer"; 1.9.2 (July 19, 2023) warned templates that relied on bundled plugins; and 1.10 removed the HashiCorp-maintained bundled plugins (amazon, ansible, azure, docker, googlecompute, qemu, vagrant, vmware, vsphere). HashiCorp's reasons: bundling "prevented releasing plugins separately from Packer," it inflated binary size and memory use, and it made community plugins harder to find. `packer init` installs what HCL2 templates declare; `packer plugins install` works for any template, including JSON.

Unbundling made the plugin, not the core, the unit that ships per platform, the same split Terraform made with providers ([Provisioning: Terraform, OpenTofu & the Alternatives](/books/hosting-and-cloud/terraform-and-opentofu)). It also split the licenses: Packer's core moved to the Business Source License from 1.10.0 ([Licensing](#licensing-and-ownership)), while HashiCorp's plugins, such as the Amazon and Ansible plugins and the plugin SDK, remain MPL-2.0 as of October 2026. The Amazon plugin's latest release, as of October 2026, is v1.8.3 (October 7, 2026).

### Provisioners

"Provisioners use built-in and third-party software to install and configure the machine image after booting." The built-ins as of October 2026 are `file` (upload files), `shell` (scripts on the machine), `shell-local` (scripts on the host running Packer), `powershell`, `windows-shell` (cmd), `windows-restart` (reboot mid-build and wait), `breakpoint` (pause for a person), and `hcp-sbom` (upload a software bill of materials to the HCP Packer registry for the build). Everything else is a plugin, Ansible's included.

Each provisioner block takes `only` and `except` to apply to some sources, `pause_before`, `max_retries` (default zero), `timeout` (none by default) and `override` for per-source settings. One optional **error-cleanup-provisioner** "will not run unless the normal provisioning run fails," before the machine shuts down, for cleanup Packer can't do itself, such as releasing a license or unregistering from a subscription service.

Configuration management tools used to have their own Packer provisioners. On November 5, 2021 HashiCorp announced it would archive the Chef, Converge, InSpec, Puppet and Salt provisioner plugins, because users had "widely adopted" running those tools through `shell` and `shell-local`; 1.7.9 bundled their final versions and 1.8.0 stopped bundling them, and `packer-plugin-chef` was archived on November 11, 2021. The recommended pattern since is to install and run the tool directly. For Chef that is an exported Policyfile run in local mode ([chef-solo and Local Mode](/books/hosting-and-cloud/chef#chef-solo-and-local-mode)):

```hcl
provisioner "file" {
  source      = "export/web/"                  # chef export output for the 'web' policy
  destination = "/tmp/chef"
}
provisioner "shell" {
  inline = [
    "curl -fsSL https://omnitruck.cinc.sh/install.sh | sudo bash",
    "cd /tmp/chef && sudo cinc-client -z",
  ]
}
```

My rule for what provisioners do last: remove what makes the image specific to the build machine before capture. That means cloud-init's per-instance state (`cloud-init clean`), SSH host keys, machine ids, package caches and any build-time credentials, so the hundredth machine from the image doesn't share the first one's identity or the builder's secrets.

### Post-Processors

"Post-processors run after builders and provisioners." The built-ins are `artifice` (declare files as the new artifact), `compress`, `checksum`, `manifest` (write the build's artifacts, ids and regions to a JSON file a pipeline can read), `provenance`, and `shell-local`; plugins add the rest, such as `amazon-import` ("takes an OVA artifact from various builders and imports it to an AMI"), Vagrant box packaging and Docker tagging and pushing. A `post-processors` block chains several in sequence, each taking the previous one's artifact, and `keep_input_artifact` keeps the intermediate output instead of deleting it. The `manifest` post-processor matters most in a pipeline: it is the machine-readable record of which ids a build produced, which the next stage (a test, a registry update, a Terraform variable) consumes.

## HCP Packer: Channels and Revocation

The gap Packer left was everything after the build: which image is current, what it was built from, and how to stop people using a bad one. HCP Packer, HashiCorp's registry, fills it, and it "stores the metadata associated with the artifacts you build but not the artifact." The images stay in the clouds.

- **Buckets and versions.** A template with an `hcp_packer_registry` block (with `bucket_name`, `description`, `bucket_labels` for the image as a whole and `build_labels` per build) pushes metadata for every build; HCP Packer "creates this bucket if it does not already exist," and each completed build creates a **version**, starting at `v1`. A build fails fast if HCP credentials (`HCP_CLIENT_ID`, `HCP_CLIENT_SECRET`) are missing, to avoid images that exist but aren't registered.
- **Fingerprints and resuming.** Each `packer build` run gets a version fingerprint; before Packer 1.9.0 it was the Git SHA of `HEAD`, and since 1.9.0 it is a ULID. "The build fails when the fingerprint matches an existing, complete version." When a multi-region build fails partway, Packer prints the fingerprint, and setting `HCP_PACKER_BUILD_FINGERPRINT` to it resumes the incomplete version instead of starting a new one.
- **Channels.** "Channels are human-readable names that artifact creators can assign base artifacts to." Consumers ask for `production`, not `v42`. Every bucket has a managed `latest` channel "automatically updated to the newest unrevoked version," restricted by default; **restricted** channels are hidden from viewers, so a team can assign a version to a restricted `candidate` channel, test it, then assign it to an unrestricted one. Assignment history is kept for up to a year. Updating a channel triggers nothing: consumers pick up the new version on their next build or Terraform run.
- **Consumption.** The `hcp-packer-artifact` data source takes a bucket, a channel (or a version fingerprint), a platform and a region and returns the `external_identifier`, the AMI id for that region. A child image's template uses it for its `source_ami`, which is how a base image feeds application images, and Terraform uses the same lookup to launch machines.
- **Ancestry.** HCP Packer records each image's parent and warns when a child is built on an outdated parent.
- **Revocation.** Revoking a version stops new use: "Packer cannot build artifacts from templates that reference a revoked version," and the data source lookup fails the build. Terraform configurations still read the metadata but get a `revoke_at` timestamp to check, and the HCP Terraform artifact validation run task flags planned resources that use revoked images. Revocation can cascade to all descendants; a child inherits revocation from any revoked parent, an explicit revocation overrides an inherited one, and among inherited dates the earliest wins. A version revoked while assigned to a channel can roll the channel back to the last valid version. Restoring removes the revoked tag but doesn't reassign channels, and a child can't be restored while an ancestor is revoked. Scheduled revocation, which lets consumers keep using a version until a date, needs the paid Standard edition; the free tier is Essentials, and HCP Packer's prices beyond the tier names aren't published.

At HashiConf on September 25, 2025, HashiCorp made SBOM storage on HCP Packer generally available (the `hcp-sbom` provisioner uploads one per build) and put package visibility in public beta.

The model (immutable versions, mutable named pointers, lineage, revocation that cascades) is the right shape for any image registry, whether or not it is HashiCorp's. The [How to Build It](#how-to-build-it) section builds the same shape in a provider's own tables.

## Cloud Image Builders

Two clouds sell the pipeline itself:

- **EC2 Image Builder** runs managed pipelines from an **image recipe** (a base image plus components) or a container recipe. **Components** are YAML or JSON documents run by AWS Task Orchestrator and Executor (AWSTOE) in build, validate and test phases. An **infrastructure configuration** sets the instance type, subnet and IAM role for the build; a **distribution configuration** sets regions, KMS keys, cross-account sharing and launch template updates; workflows cover build, test and distribution. It ships STIG hardening components, works with AWS Organizations to allow only approved AMIs, and has no charge beyond the underlying resources.
- **Azure VM Image Builder** is "built on HashiCorp Packer." An image template resource defines the source, customizations and distribution targets (an Azure Compute Gallery, a managed image or a VHD); each build runs in a staging resource group named `IT_<resource group>_<template>_<guid>` with a build VM (Standard_D1_v2 for Gen1 images, Standard_D2ds_v4 for Gen2 by default); the portal has supported it since March 2023, and builds can reach Chef, Puppet or DSC servers on a private virtual network.

A managed builder trades portability for less to run. It knows its cloud's identity, regions and sharing model natively, but its recipes don't build an image for another cloud or a local hypervisor, which is the job Packer was written for.

## Baking vs Frying

A **baked** image has the software and its configuration in it; a **fried** image is generic and is configured at boot, or continuously, by configuration management. The terms are industry shorthand, and nobody has published who coined them. A 2015 HashiConf talk from Pinterest put the conclusion plainly: "The 'Bake vs Fry' debate is moot. Most environments do both." Baking gives fewer runtime dependencies and faster boots (the reason autoscaling pushed teams toward it) at the cost of less reusable images.

The middle path runs through **cloud-init**, the boot-time agent most Linux cloud images carry. It runs in stages: **Detect** (`ds-identify` finds the platform), **Local** (before networking: find a local datasource, render network configuration), **Network** (after networking: fetch and process user data, run `cloud_init_modules`, disks and mounts), **Config** (`cloud_config_modules`, including `runcmd`) and **Final** (`cloud_final_modules`: packages, configuration management tools such as Ansible, Puppet, Chef or salt-minion, and user scripts; other tools can wait with `cloud-init status --wait`). Whatever user data a launch passes is fried on at those stages.

How the split usually falls, and the cost of each side:

| Configuration | Bake it | Fry it | Why |
| --- | --- | --- | --- |
| OS packages, security patches, agents, the runtime | Yes | | Slow to install, identical everywhere, and a boot-time repository outage shouldn't stop a scale-out |
| The application build | Yes, for VM fleets | Or pull a container image at boot | The image is the deploy artifact, or the VM is a host for containers |
| Environment (staging or production), region, cluster name | | Yes, from user data or instance metadata | One image for every environment ([Environments as Code](/docs/delivery/infrastructure-as-code#environments-as-code)) |
| Secrets | Never | Yes, fetched at boot from a secrets manager with the instance's identity | A secret baked into an image is in every copy, every snapshot and every account it's shared with |
| Hostname, keys, machine id | Never | Yes, generated per instance | Identity must be unique |
| Continuous drift correction | | Configuration management on a timer, if at all | Only for machines that live long enough to drift ([Convergence](/books/hosting-and-cloud/cfengine-and-puppet#my-default)) |

The rule underneath: bake what is the same on every machine and slow to install; fry what differs per environment or per instance; never bake a secret.

## Licensing and Ownership

Packer was MPL 2.0 until HashiCorp moved its products to the Business Source License on August 10, 2023. Packer's license file now names "International Business Machines Corporation (IBM)" as licensor, covering "Packer Version 1.10.0 or later" (1.10.0 was published December 5, 2023). Its Additional Use Grant allows production use as long as it doesn't include "offering the Licensed Work to third parties on a hosted or embedded basis in order to compete with IBM Corp's paid version(s)," and internal use within an organization "is not considered a competitive offering." Each version converts to MPL 2.0 on its Change Date, four years after it is published. IBM completed its acquisition of HashiCorp on February 27, 2025; the license change and the acquisition are told in full in [Provisioning: Terraform, OpenTofu & the Alternatives](/books/hosting-and-cloud/terraform-and-opentofu#the-license-change-and-ibm).

For a team building its own images, nothing changes: internal use is allowed. For a provider, it matters if the product is image building: a managed image service built on Packer and sold to customers is the case the grant excludes when it competes with IBM's paid versions (HCP Packer). The plugins, which do most of the platform-specific work, stay MPL-2.0. Packer 1.16.2, released October 22, 2026, is current as of October 2026.

## The Alternatives

| Approach | Model | Strengths | Failure modes | License and owner (October 2026) | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Packer** | Temporary machine per source, provisioners, capture, post-processors | Multi-cloud and local hypervisors from one template; parallel builds; huge plugin set; any CM tool via shell | Builds are slow (a full VM boot each); no registry or retirement without HCP Packer or your own; BSL core | BSL 1.1 core (IBM), MPL plugins | Free to use internally; build-machine time | Teams building for more than one platform |
| **HCP Packer** (with Packer) | Metadata registry: versions, channels, ancestry, revocation | Pointers, lineage and revocation that Terraform honors | Metadata only; tied to HashiCorp's platform | Proprietary SaaS (IBM) | Essentials free; Standard paid, prices not published | Packer users with many image consumers |
| **EC2 Image Builder** | Managed pipeline of recipes and components | No servers to run; STIG components; Organizations enforcement; no extra charge | AWS only | Proprietary (AWS) | Underlying resources only | AWS-only fleets |
| **Azure VM Image Builder** | Managed Packer behind an ARM resource | Native gallery distribution, private networking | Azure only; staging resource groups to manage | Proprietary (Microsoft), Packer inside | Underlying resources | Azure-only fleets |
| **Aminator** | Chroot into a volume from a base snapshot | Fast, no instance boot per build | AWS and RPM/DEB only; Python 2.7; quiet since 2023 | Apache 2.0 (Netflix) | Free | Historical; its technique lives on in `amazon-chroot` |
| **Snapshot a hand-built machine** | Configure by hand, capture | Fast the first time | Unreproducible; the drift problem baked in | Any | Free | Nobody, deliberately |
| **Fry everything** (generic image, cloud-init plus CM) | Configure at boot | One image; changes without rebuilds | Slow, fragile boots; repository and server outages block scale-out; drift | Varies | Boot time on every launch | Long-lived machines; small fleets |
| **Container images** | Build an OCI image; the VM is a generic host | Fast builds and pulls; one artifact everywhere | Needs a scheduler; doesn't cover the host image itself | Varies | Registry storage and pulls | Most new application deployment ([Building Images](/docs/delivery/containers#building-images)) |

## My Default

My default is to bake: an image pipeline in CI that builds the host image with Packer on every merge and on a schedule (weekly at least, so patches land even when nothing else changed), runs the build's own tests against a machine launched from the result, records the version, and only then moves a channel. On top of that, the application ships as a container image or a package baked into an application image built from the base, and per-environment values and secrets are fried on at boot from instance metadata and a secrets manager.

The specifics:

- **Packer with pinned plugins** (`required_plugins` with `~>` constraints, and the plugin versions in the lock of the CI image), one template per image family, HCL2 only.
- **Two layers:** a base image (OS, patches, agents, hardening) and application images built `FROM` it through the registry lookup, so a base patch rebuilds every child and ancestry says which children are stale.
- **A registry with channels and revocation,** HCP Packer if the estate is on HashiCorp's platform, or the tables below if not, with Terraform resolving `production` to an id at plan time instead of hard-coding AMIs.
- **Retirement in the pipeline:** deprecate on build (`deprecate_at`), deregister after the last instance using an image is gone.
- **The cloud's builder** when the estate lives on one cloud and the team would rather not run build infrastructure; EC2 Image Builder's AWS Organizations enforcement is worth having there.

What would change this: machines that can't be replaced on every change (bare metal, hypervisors, stateful hosts), where I'd still bake the base and converge on top ([Convergence](/books/hosting-and-cloud/cfengine-and-puppet#my-default)); or a platform that is all containers on a managed node image the provider maintains, where the VM image is someone else's problem and the work moves to [Building Images](/docs/delivery/containers#building-images).

## How to Build It

A provider meets images twice: the images its customers build and launch (resources of kind `image` in [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#one-resource-table)), and, if it sells an image pipeline or registry, the builds and pointers behind them. The `images` side table, with each image's format, architecture and source, belongs to [From chroot to Containers](/books/hosting-and-cloud/containers); this chapter adds the build that produced an image, the logical version it belongs to, and the named pointers consumers follow. It owns `image_versions`, `image_builds`, `image_build_artifacts`, `image_channels` and `image_channel_assignments`.

```sql
CREATE TABLE image_versions (            -- one logical, immutable version of an image family
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  project_id       UUID REFERENCES projects (id),
  family           TEXT NOT NULL,        -- the bucket or image family: 'web', 'base-ubuntu'
  version          INT NOT NULL,         -- v1, v2, ... per family
  fingerprint      TEXT NOT NULL,        -- the build run's id (a ULID, or a commit)
  template_commit  TEXT,                 -- the template's source revision
  parent_version_id UUID REFERENCES image_versions (id),  -- ancestry: built FROM this
  sbom_ref         TEXT,                 -- where the SBOM for this version lives
  labels           JSONB NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL CHECK (status IN ('building', 'complete', 'failed')),
  revoke_at        TIMESTAMPTZ,          -- set when revoked, now or scheduled
  revoked_reason   TEXT,
  revoked_by       TEXT,                 -- typed actor
  revocation_inherited_from UUID REFERENCES image_versions (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, family, version),
  UNIQUE (account_id, family, fingerprint),          -- a rerun with the same fingerprint resumes
  CHECK ((revoke_at IS NULL) = (revoked_by IS NULL))
);

CREATE TABLE image_builds (              -- one platform build inside a version
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  image_version_id  UUID NOT NULL REFERENCES image_versions (id),
  builder           TEXT NOT NULL,       -- 'amazon-ebs', 'azure-arm', 'googlecompute', 'qemu'
  platform          TEXT NOT NULL,       -- 'aws', 'azure', 'gce', the provider itself
  source_external_ref TEXT,              -- the base image id the build started from
  status            TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed',
                      'cancelled')),
  started_at        TIMESTAMPTZ NOT NULL,
  finished_at       TIMESTAMPTZ,
  tool_version      TEXT,                -- 'packer 1.16.2' with the plugin versions in labels
  manifest_ref      TEXT,                -- the manifest post-processor's output
  labels            JSONB NOT NULL DEFAULT '{}',
  CHECK ((finished_at IS NULL) = (status = 'running'))
);

CREATE TABLE image_build_artifacts (     -- what a build produced, per region
  image_build_id  UUID NOT NULL REFERENCES image_builds (id),
  region_id       TEXT NOT NULL REFERENCES regions (id),
  resource_id     UUID NOT NULL REFERENCES resources (id),  -- kind = 'image'
  PRIMARY KEY (image_build_id, region_id)
);

CREATE TABLE image_channels (            -- named, mutable pointers: 'production', 'candidate'
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id  UUID NOT NULL REFERENCES accounts (id),
  family      TEXT NOT NULL,
  name        TEXT NOT NULL,
  managed     BOOLEAN NOT NULL DEFAULT FALSE,   -- 'latest': moved by the system, never by hand
  restricted  BOOLEAN NOT NULL DEFAULT TRUE,    -- hidden from read-only consumers
  UNIQUE (account_id, family, name)
);

CREATE TABLE image_channel_assignments ( -- which version a channel pointed at, over time
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  channel_id        UUID NOT NULL REFERENCES image_channels (id),
  image_version_id  UUID NOT NULL REFERENCES image_versions (id),
  assigned_by       TEXT NOT NULL,       -- typed actor: 'pipeline:<run>', 'system:rollback'
  reason            TEXT CHECK (reason IN ('promotion', 'rollback', 'revocation_rollback',
                      'managed_latest')),
  valid_during      TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (channel_id WITH =, valid_during WITH &&)  -- one version at a time
);
```

`image_versions` is the logical version (HCP Packer's version in a bucket), which builds, ancestry and channels all hang off. Resolving a channel to the id a launch needs is one query, and it refuses revoked versions:

```sql
SELECT r.external_ref                    -- the AMI id or image id in that region
FROM image_channels c
JOIN image_channel_assignments a ON a.channel_id = c.id AND a.valid_during @> NOW()
JOIN image_versions v ON v.id = a.image_version_id
JOIN image_builds b ON b.image_version_id = v.id AND b.status = 'succeeded'
JOIN image_build_artifacts x ON x.image_build_id = b.id AND x.region_id = $3
JOIN resources r ON r.id = x.resource_id AND r.state = 'active'
WHERE c.account_id = $1 AND c.family = $2 AND c.name = 'production'
  AND (v.revoke_at IS NULL OR v.revoke_at > NOW())
  AND b.platform = $4;
```

Design notes:

- **Versions are immutable; channels move.** A promotion or rollback is a new `image_channel_assignments` row that closes the previous range, so "which image was production at 14:02" is a range lookup, as everywhere in [the core model](/books/hosting-and-cloud/hosting-and-cloud-business#tenancy-money-and-time). Only the system moves a `managed` channel.
- **Revocation cascades by ancestry.** Revoking a version sets `revoke_at` on it and, if the revoker chooses, on every descendant reachable through `parent_version_id`, recording `revocation_inherited_from`; the earliest inherited date wins and an explicit revocation overrides an inherited one, HCP Packer's rules. A channel pointing at a newly revoked version rolls back to the last unrevoked version with reason `revocation_rollback`, or alerts when there is none.
- **The provider id is the `external_ref`.** Each regional image is a `resources` row of kind `image` whose `external_ref` is the cloud's id (`ami-...`, an image self-link, a gallery version id), and `resource_identifiers` isn't needed: image ids are never reused. The logical name (`web` v42) lives in these tables, never in the id.
- **Retirement is a state change, then a deletion.** Deprecation maps to a hold on new launches; deregistration moves the resource to `deleted` and ends its `exists_during`. A query for images no `virtual_machines.image_id` references and no channel has pointed at for the retention period finds what to deregister, and stops snapshot storage billing that otherwise runs forever.
- **Meters.** A provider selling an image pipeline meters build time (`image_build.seconds` from `image_builds`, or simply the build VM's own `vm.seconds`) and image storage (snapshot gigabyte-months, the storage chapter's meter); a registry meters versions or managed images. EC2 Image Builder charges only for the underlying resources, which sets the price expectation.
- **Events:** `image_version.completed`, `image_channel.assigned`, `image_version.revoked` and `image.deprecated` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to deploy pipelines, the HCP Terraform-style plan check, and owners of instances still running a revoked image.

## Auditing

- **What is in every image.** The template commit, the base image it was built from, the tool and plugin versions, the SBOM and the manifest, per version, so a CVE in a package resolves to the images, and then the instances, that carry it.
- **Which image was in production, when.** Every channel assignment with its actor and reason, including automatic rollbacks.
- **Every revocation.** Who revoked which version, why, when it took effect, which descendants inherited it, and which running instances still used it at the time.
- **Sharing.** Every account, organization or public grant on an image, because a shared image is a copy of its contents in someone else's hands.
- **Retirement.** Deprecation and deregistration dates, against the instances still running each image.

Image metadata is kept for as long as any instance launched from the image might be investigated, which outlives the image itself ([Data Retention & Deletion](/docs/architecture/data-retention)).

## What This Means for the System You Build

- **Bake what's identical and slow; fry what differs; never bake a secret.**
- **Rebuild on a schedule,** not only on change, so patches land in images nobody touched.
- **Separate immutable versions from mutable channels,** and resolve channels to ids at plan or launch time.
- **Track ancestry,** so a base image fix finds every child to rebuild and every instance to replace.
- **Make revocation stop new launches,** cascade to descendants, and roll channels back automatically.
- **Pin builders and plugins** and record their versions with every build.
- **Map one logical version to many regional ids** with the cloud's id as `external_ref`, never the other way around.
- **Clean per-instance identity before capture:** cloud-init state, host keys, machine ids, build credentials.
- **Deprecate and deregister in the pipeline,** or pay for snapshots forever.
- **Read the license before selling image building:** Packer's core is BSL with a competing-offering exclusion; its plugins are MPL.

## References

**Documentation**

- [Packer: Terminology](https://developer.hashicorp.com/packer/docs/terminology), artifacts, builds, builders, data sources, post-processors, provisioners and templates
- [Packer: Templates](https://developer.hashicorp.com/packer/docs/templates), HCL2 as the official format since v1.7.0 and JSON as legacy
- [Packer: packer block](https://developer.hashicorp.com/packer/docs/templates/hcl_templates/blocks/packer), `required_version`, `required_plugins`, source addresses and version constraints from v1.7.0
- [Packer: build block](https://developer.hashicorp.com/packer/docs/templates/hcl_templates/blocks/build), `sources`, build-level `source` overrides, names, provisioners and post-processors
- [Packer: source block](https://developer.hashicorp.com/packer/docs/templates/hcl_templates/blocks/source), reusable builder configuration
- [Packer: provisioner block](https://developer.hashicorp.com/packer/docs/templates/hcl_templates/blocks/build/provisioner), `only`, `except`, `pause_before`, `max_retries`, `timeout`, `override` and the error-cleanup provisioner
- [Packer: post-processors block](https://developer.hashicorp.com/packer/docs/templates/hcl_templates/blocks/build/post-processors), chained post-processors and `keep_input_artifact`
- [Packer: hcp_packer_registry block](https://developer.hashicorp.com/packer/docs/templates/hcl_templates/blocks/build/hcp_packer_registry), bucket and build labels and the credential check
- [Packer: Provisioners](https://developer.hashicorp.com/packer/docs/provisioners), the built-in provisioners
- [Packer: Post-processors](https://developer.hashicorp.com/packer/docs/post-processors), the built-in post-processors
- [Packer: Communicators](https://developer.hashicorp.com/packer/docs/communicators), ssh, winrm and none
- [Packer: build command](https://developer.hashicorp.com/packer/docs/commands/build), parallel builds, `-on-error` and the other flags
- [Packer: hcl2_upgrade command](https://developer.hashicorp.com/packer/docs/commands/hcl2_upgrade), converting JSON templates
- [Packer: HCP Packer and version fingerprinting](https://developer.hashicorp.com/packer/docs/hcp), fingerprints before and after 1.9.0 and resuming incomplete versions
- [Packer: hcp-packer-artifact data source](https://developer.hashicorp.com/packer/docs/datasources/hcp/hcp-packer-artifact), channel lookups, `external_identifier` and parent images
- [Packer: Amazon plugin](https://developer.hashicorp.com/packer/integrations/hashicorp/amazon), the Amazon builders, data sources and the import post-processor
- [Packer: amazon-ebs builder](https://developer.hashicorp.com/packer/integrations/hashicorp/amazon/latest/components/builder/ebs), the build steps, temporary resources, region copies, sharing and `deprecate_at`
- [HCP Packer overview](https://developer.hashicorp.com/hcp/docs/packer), metadata not images, ancestry, channels, revocation and the Essentials and Standard editions
- [HCP Packer: Push metadata](https://developer.hashicorp.com/hcp/docs/packer/store/push-metadata), buckets, versions and fingerprints
- [HCP Packer: Channels](https://developer.hashicorp.com/hcp/docs/packer/manage/channel), the managed latest channel, restricted channels and assignment history
- [HCP Packer: Revoke and restore](https://developer.hashicorp.com/hcp/docs/packer/manage/revoke-restore), immediate and scheduled revocation, descendants, channels and `revoke_at`
- [AWS: Deprecate an AMI](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ami-deprecate.html), what deprecation hides, the two-year default for public AMIs and snapshot costs
- [AWS: What is EC2 Image Builder?](https://docs.aws.amazon.com/imagebuilder/latest/userguide/what-is-image-builder.html), recipes, components, configurations, workflows and pricing
- [Microsoft Learn: Azure VM Image Builder overview](https://learn.microsoft.com/en-us/azure/virtual-machines/image-builder-overview), built on Packer, staging resource groups, build VM sizes and distribution targets
- [Google Cloud: Image families best practices](https://docs.cloud.google.com/compute/docs/images/image-families-best-practices), what a family points to and rolling back by deprecation
- [cloud-init: Boot stages](https://docs.cloud-init.io/en/latest/explanation/boot.html), the Detect, Local, Network, Config and Final stages

**Release notes and repositories**

- [GitHub: hashicorp/packer at v0.1.0](https://github.com/hashicorp/packer/tree/v0.1.0/builder), the first builders, provisioner and post-processor, June 28, 2013
- [GitHub: hashicorp/packer v1.5.0](https://github.com/hashicorp/packer/releases/tag/v1.5.0), tagged December 18, 2019
- [GitHub: hashicorp/packer releases](https://github.com/hashicorp/packer/releases), 1.7.0 (February 17, 2021), 1.10.0 (December 5, 2023) and 1.16.2 (October 22, 2026)
- [GitHub: hashicorp/packer LICENSE](https://github.com/hashicorp/packer/blob/main/LICENSE), BSL 1.1 for 1.10.0 and later, IBM as licensor, the Additional Use Grant and the Change Date
- [GitHub: hashicorp/packer-plugin-amazon](https://github.com/hashicorp/packer-plugin-amazon), MPL-2.0 and v1.8.3 of October 7, 2026
- [GitHub: hashicorp/packer-plugin-chef](https://github.com/hashicorp/packer-plugin-chef), archived on November 11, 2021
- [GitHub: Netflix/aminator](https://github.com/Netflix/aminator), the bake process, platforms and Apache 2.0 license

**Announcements**

- [Mitchell Hashimoto: Packer](https://mitchellh.com/writing/packer), the announcement on June 28, 2013
- [HashiCorp: Announcing Packer 1.5 with HCL2 support](https://www.hashicorp.com/en/blog/announcing-hashicorp-packer-1-5-with-hcl2-support), HCL2 in beta and data shared between builders and provisioners
- [HashiCorp: Plans to archive unmaintained Packer provisioner plugins](https://www.hashicorp.com/blog/plans-to-archive-unmaintained-packer-provisioner-plugins), the Chef, Converge, InSpec, Puppet and Salt provisioners, November 5, 2021
- [HashiCorp: Announcing the removal of bundled plugins in HashiCorp Packer](https://www.hashicorp.com/blog/announcing-the-removal-of-bundled-plugins-in-hashicorp-packer), 1.9, 1.9.2 and 1.10 and the reasons, September 19, 2023
- [HashiCorp: HashiCorp adopts the Business Source License](https://www.hashicorp.com/en/blog/hashicorp-adopts-business-source-license), August 10, 2023
- [HashiCorp: New Terraform and Packer features at HashiConf 2025](https://www.hashicorp.com/en/blog/scale-infrastructure-with-new-terraform-and-packer-features-at-hashiconf-2025), HCP Packer SBOM storage and package visibility, September 25, 2025

**In practice**

- [Kief Morris: ImmutableServer](https://martinfowler.com/bliki/ImmutableServer.html), June 13, 2013
- [Chad Fowler: Trash Your Servers and Burn Your Code](https://chadfowler.com/articles/trash-your-servers-and-burn-your-code.html), June 23, 2013
- [Netflix: Zero to the cloud with NetflixOSS](https://www.slideshare.net/slideshow/zero-to-the-cloud-with-netflixoss/41684570), the AMI as the unit of deployment and per-region baking, November 17, 2014
- [InfoQ: How Netflix builds code](https://www.infoq.com/news/2016/03/How-Netflix-Builds-Code/), the Bakery API and Aminator, March 31, 2016
- [Pinterest: HashiConf 2015](https://speakerdeck.com/phobos182/hashiconf-2015), "The 'Bake vs Fry' debate is moot. Most environments do both"
- [F5: Use infrastructure as code to deploy NGINX Management Suite](https://www.f5.com/company/blog/nginx/use-infrastructure-as-code-to-deploy-f5-nginx-management-suite), baked and fried images defined
