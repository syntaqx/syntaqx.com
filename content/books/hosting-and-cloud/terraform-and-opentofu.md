+++
title = "Provisioning: Terraform, OpenTofu & the Alternatives"
nav_title = "Terraform & OpenTofu"
description = "CloudFormation to Terraform and OpenTofu: providers, state as data, import and refactoring, the BSL and IBM, CDK, Pulumi, Bicep, Crossplane, and provider APIs."
category = "Hosting & Cloud Industry"
order = 2144
part = "Infrastructure as Code"
tags = ["infrastructure-as-code", "terraform", "opentofu", "provisioning", "licensing"]
+++

Configuration management converges a server that already exists. Provisioning creates the server, and the network, bucket, DNS record and database around it, by calling the provider's API. Before declarative provisioning, that meant scripts: call the function that creates an account, then the one that adds a domain, then the one that sets a quota, and hope nothing failed in the middle. A provisioning tool turns those calls into a desired state, compares it with what exists, shows the difference as a plan, and calls the API only for the difference. Doing that needs three things the scripts never had: a record of which real object each declaration owns (state), an adapter per vendor API that knows how to read, create, update and delete each kind of object (a provider), and a dependency graph that orders the calls.

That is the whole business model of this chapter's tools, and why it matters to a company that rents out infrastructure. For a cloud or a host, a provider for the dominant tool is now a distribution channel: customers choose vendors partly by whether their whole estate can be declared in one place, and a vendor whose API can't be imported, refreshed or identified stably is one customers can't manage in code. For the tool makers, the same position turned into a license fight: HashiCorp moved Terraform to a source-available license in 2023, the community forked it as OpenTofu, IBM bought HashiCorp in 2025, and the licensor line in Terraform's license file now reads IBM. The playbook's [Infrastructure as Code](/docs/delivery/infrastructure-as-code) owns the rules ([declarative beats imperative](/docs/delivery/infrastructure-as-code#declarative-beats-imperative), [state remote, locked and never edited by hand](/docs/delivery/infrastructure-as-code#state-remote-locked-never-edited-by-hand), [plan in CI, apply from CI](/docs/delivery/infrastructure-as-code#plan-in-ci-apply-from-ci), [drift](/docs/delivery/infrastructure-as-code#detect-drift), [versioned modules](/docs/delivery/infrastructure-as-code#modules-versioned), [environments](/docs/delivery/infrastructure-as-code#environments-as-code), [what isn't IaC](/docs/delivery/infrastructure-as-code#what-isn-t-infrastructure-as-code)); this chapter owns the history, how the tools work inside, the alternatives, the licensing and ownership churn, and the provider side: what a vendor's API has to expose for any of it to work.

Convergence tools are [Convergence: CFEngine to Puppet](/books/hosting-and-cloud/cfengine-and-puppet), [Chef](/books/hosting-and-cloud/chef) and [Push & Events: Ansible and Salt](/books/hosting-and-cloud/ansible-and-salt); images are [Baking Images: Packer](/books/hosting-and-cloud/packer-and-images); testing, policy, secrets and the hosted plan-and-apply platforms are [Testing, Policy, Secrets & IaC Platforms](/books/hosting-and-cloud/iac-testing-policy-and-secrets). The wider license wars between vendors and clouds are [Open Source & the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds).

## How the Providers Do It

Every vendor offers a declarative path; they differ in where the state lives and who writes the adapter:

| Vendor or tool | Native declarative path | Where state lives | What's public |
| --- | --- | --- | --- |
| **AWS** | CloudFormation (February 25, 2011); CDK synthesizes CloudFormation (GA July 11, 2019); ACK controllers run in Kubernetes | In the CloudFormation service, per stack | Templates provision "in the right sequence" at no additional charge; change sets preview updates before execution |
| **Microsoft Azure** | ARM templates; Bicep transpiles to ARM JSON | In Azure Resource Manager | "No state or state files to manage: Azure stores all states"; `what-if` previews create, modify and delete |
| **HashiCorp (IBM)** | Terraform, with providers per vendor API | A backend the customer chooses, or HCP Terraform | Over 3,000 providers and 250 partners in the registry by March 2023; Terraform 1.17.0 is current (October 2026) |
| **OpenTofu (CNCF)** | The MPL-2.0 fork of Terraform | Same backends; client-side encrypted if configured | 1.13.2 is current, 1.12.9 maintained (October 2026); state encryption since 1.7.0 |
| **Pulumi** | General-purpose languages (TypeScript, Python, Go and others) | Pulumi Cloud by default, or S3, Azure Blob, GCS, PostgreSQL or local files | Apache-2.0; secrets in state encrypted per stack |
| **Crossplane (CNCF)** | Kubernetes custom resources reconciled by providers | In the Kubernetes API | Graduated October 28, 2025; managed resources found by `crossplane.io/external-name` |
| **Cloudflare** | A Terraform provider, generated from its OpenAPI schemas since v5 (February 3, 2025) | Wherever the customer's Terraform state is | v5 was a ground-up rewrite; by v5.4.0 issues affected "about 15% of resources" |
| **cPanel & WHM** | None: WHM API 1 and UAPI are function calls | Nowhere outside the server itself | `whmapi1` and `json-api` functions; "do not attempt to use cPanel or WHM interface URLs" in custom code |

Three patterns run through the table. **The clouds keep state themselves when they own the tool** (CloudFormation, ARM), and leave it to the customer when a third party does (Terraform, Pulumi), which is why a hosted state store became a product. **The adapter moved to the vendor:** a Partner provider is written and maintained by the company whose API it wraps, and the largest ones are now generated from the vendor's own API description. **The dominant tool's license and owner both changed within eighteen months,** from MPL to BSL in August 2023 and from HashiCorp to IBM in February 2025, and customers who could not accept that had an MPL fork under a foundation to move to.

## Before Plans: Scripts Against a Panel API

A shared hosting server running cPanel & WHM is automated through its APIs: WHM API 1 for the server and its accounts, UAPI for what happens inside one cPanel account (domains, mail, databases, FTP). A call is a function name and its arguments over HTTPS, `https://host:2087/cpsess<token>/json-api/accountsummary?api.version=1&user=username`, or the same function from the shell as `whmapi1 accountsummary user=username`, with YAML output by default and `applist` listing every function. The older cPanel API 2 is deprecated, and cPanel recommends the newer UAPI function wherever one exists. The documentation is blunt about the alternative people reached for when a function was missing: don't use interface URLs in custom code, because they aren't guaranteed to keep working.

That is an imperative contract, and it shows exactly what declarative provisioning added:

- **No plan.** Each call acts immediately. A script can't show a reviewer what it will change before it changes it; the only preview is reading the script.
- **No state.** Nothing outside the server records that the script created this account for that order. If the script dies after the account and before the DNS zone, the next run has to discover what exists by listing and comparing, or it creates a second account or fails on a name collision.
- **No graph.** Ordering lives in the script's line order. Parallelism, retries and partial failure are the script author's problem every time.
- **Drift is invisible.** A change made in the WHM interface is just the new truth; there is no definition to compare it against.

Hosting automation was, and on many panel servers still is, this: billing systems and provisioning modules calling panel functions in sequence. The cPanel & WHM chapter covers the APIs themselves. The tools below exist because, at cloud scale, the list-compare-call loop every script reinvented turned out to be the product.

## CloudFormation and the Template

AWS announced CloudFormation on February 25, 2011: describe the AWS resources an application needs in a text file called a template, and the service provisions them "in the right sequence and taking into account any dependencies between resources," with no additional charge beyond the resources. The unit is the stack, and the state is the service's: CloudFormation knows which physical resources belong to which stack because it created them. Updates go through change sets, which compare the stack with a modified template or parameters, show which resources will be added, modified or deleted with a before-and-after view of their properties, and change nothing until someone executes the set. Executing one discards the stack's other change sets, since they no longer apply.

The model's strength is that the customer never handles state: there's no file to lock, leak or corrupt. Its limits are the reason Terraform found room: one vendor's resources only, a template language with no general programming constructs, and features that arrive when AWS adds them to CloudFormation rather than when the service ships.

## Terraform: 2014 to 1.17

Mitchell Hashimoto's account of Terraform starts with a 2011 blog post written after CloudFormation launched, asking for an "open source, cloud-agnostic solution" with the same workflow on any cloud. Nobody built it, so HashiCorp did. The repository's first commit is dated May 21, 2014, and the `v0.1.0` tag ("Set version 0.1") July 28, 2014, with two providers, AWS and DigitalOcean. Hashimoto's own telling is that downloads were "mostly stagnant for the first 18 months" and the team discussed shutting it down; they bet instead that success depended on the provider ecosystem and made providers easier to write. By 2016 the project had over 750 contributors and providers for Azure, Google Cloud and OpenStack; in 2017 Microsoft committed to a full Azure provider, the first major cloud to back Terraform publicly, and the Terraform Registry launched for sharing modules. At 1.0 in 2021, HashiCorp cited over 100 million downloads, more than 1,000 providers and about 5,500 modules (vendor figures).

The releases since 1.0 mostly moved state operations from commands into configuration, so they could be planned and reviewed like everything else:

| Version | Released | What it added |
| --- | --- | --- |
| 1.1.0 | December 8, 2021 | `moved` blocks: record an address change so existing state objects migrate during planning |
| 1.5.0 | June 12, 2023 | `import` blocks ("Import is now a configuration-driven, plannable action"), `plan -generate-config-out`, `check` blocks |
| 1.6.0 | October 4, 2023 | The `terraform test` framework; the first release under the BSL |
| 1.7.0 | January 17, 2024 | `removed` blocks, test mocking (`mock_provider`, overrides), `for_each` in `import` |
| 1.10.0 | November 27, 2024 | Ephemeral resources and ephemeral input variables and outputs, kept out of state and plan files |
| 1.11.0 | February 27, 2025 | Write-only attributes (`_wo`, with a `_wo_version` to signal updates); S3-native state locking generally available |
| 1.12.0 | May 14, 2025 | Import by resource `identity` instead of `id` |
| 1.17.0 | October 21, 2026 | Current release; 1.16.7 shipped as a patch on October 22, 2026 |

At HashiConf on September 25, 2025, HashiCorp made Stacks generally available for HCP Terraform plans priced on resources under management, opened Terraform search (bulk discovery and import built on 1.12's resource identity, for the AWS and Azure providers first) and actions (Day 2 operations around resource events) as public betas, and made hold-your-own-key encryption of state and plan files generally available in HCP Terraform.

## How Terraform Works: Core, Providers and the Graph

Terraform is two kinds of program. **Core** is the `terraform` binary: it reads and interpolates configuration and modules, manages state, builds the resource graph and executes plans. **Providers** are separate executables that Core starts and talks to over RPC; each one initializes the vendor's API client, handles authentication and defines the managed resources and data sources that map onto the vendor's services. The interface between them is the plugin protocol, defined in Protocol Buffers over gRPC: version 5 works with Terraform 0.12 and later, version 6 with 1.0 and later (adding nested attributes). Core never knows how to create a bucket; it knows how to ask a provider to plan and apply a change to an object whose schema the provider declared.

`terraform init` finds the providers a configuration needs, prefers an installed version that meets the constraints, and otherwise downloads from the registry into `.terraform/providers/`. It also writes the **dependency lock file**, `.terraform.lock.hcl`, which records for each provider the exact version selected, the constraints considered, and checksums of valid packages: `h1:` hashes of the package contents (preferred, independent of archive format) and legacy `zh:` hashes of the registry's zip. Later runs reuse the recorded version unless `init -upgrade` is passed, and `terraform providers lock -platform=...` pre-records hashes for every platform CI and developers use. The lock file pins providers only; modules are pinned by exact version constraints. It belongs in version control so that a provider upgrade is a reviewed change, the same rule the playbook's [Lockfiles](/docs/engineering/dependencies#lockfiles) applies to application dependencies.

The **graph** is built from configuration and state together: a node per resource (or per instance with `count`), a node per provider configuration, edges from `depends_on` and from every attribute reference, and orphan nodes for objects in state that are no longer in configuration. When a plan replaces a resource, its node splits into a destroy node and a create node, because the order of destruction differs from the order of creation. Core checks the graph for cycles and walks it depth-first in parallel, a node starting as soon as its dependencies finish, ten at a time by default (`-parallelism` changes it). Rate limiting is left to providers, which back off and retry in their own API clients. That division matters to a vendor: Terraform will send a burst of concurrent calls, and the provider, not Core, has to absorb the vendor's own rate limits gracefully.

A **plan** is that walk with every provider asked "what would you do?" The JSON form (`terraform show -json` on a plan file) lists `resource_changes`, each with an address, a `previous_address` when a `moved` block applied, and actions of `["no-op"]`, `["create"]`, `["read"]`, `["update"]`, `["delete"]`, or a replacement as `["delete", "create"]` or `["create", "delete"]`, plus `resource_drift` for differences found during refresh. Every tool in [Testing, Policy, Secrets & IaC Platforms](/books/hosting-and-cloud/iac-testing-policy-and-secrets#policy-as-code-at-plan-time) reads this document.

## State as a Data Model

Terraform's docs put the purpose plainly: it "requires some sort of database to map Terraform config to the real world," because tags can't do the job when not every resource or provider supports them. State is that database, a JSON document per workspace (`terraform.tfstate` by default, with a backup of the previous copy), and its format is internal: the docs say not to edit it, and to read it through `terraform show -json` rather than parse the file. Read as data, it has a small schema:

- **Lineage and serial.** A state has a lineage, an identifier fixed when the state is created, and a serial that increases with every write. They are the state's optimistic concurrency control: `terraform state push` refuses a state whose lineage differs from the destination's, and refuses one whose serial is lower than the destination's, unless `-force` is passed, which the docs warn will overwrite the destination. A different lineage means a different state that happens to share a name; a lower serial means a stale copy.
- **Resource addresses.** Each object is keyed by its address in configuration: module path, `mode` (managed or data), `type`, `name`, and an `index` when the resource uses `count` or `for_each`. The address is the configuration's name for the object, and it is what `moved` blocks rewrite.
- **Provider identity of the object.** Each instance records the provider that manages it and the attribute values the provider last returned, including the vendor's identifier (`id`) and, since 1.12, a provider-defined `identity` object. The docs require the binding to be one-to-one: "Terraform expects that each remote object is bound to only one resource instance in the configuration." Two addresses pointing at the same remote object make the mapping ambiguous, and two states managing it are worse: each will undo the other's changes.
- **Dependencies.** State keeps the most recent dependency set of every object, so Terraform can delete something correctly after its configuration is gone.
- **Cached attributes.** The values are a cache. Every plan normally **refreshes**: it asks each provider to read the real object and compares. Large estates skip the refresh with `-refresh=false` and narrow with `-target`, and then "the cached state is treated as the record of truth," which is exactly how drift goes unseen ([Detect Drift](/docs/delivery/infrastructure-as-code#detect-drift)).

The cached attributes are also why state is secret. Whatever the provider returns, a generated database password included, is stored in plain text, and `sensitive` only redacts it from output. Ephemeral values (1.10) and write-only arguments (1.11) keep secrets out of state and plan files entirely; [Secrets: Out of Code, Out of State](/books/hosting-and-cloud/iac-testing-policy-and-secrets#secrets-out-of-code-out-of-state) covers them, and the incidents that followed from leaked state files.

**Backends** store the document and lock it. The S3 backend shows the current shape: `encrypt` turns on server-side encryption of state and lock files, `kms_key_id` names the key, bucket versioning is "strongly" recommended so a bad write can be recovered, and `use_lockfile` writes a `<key>.tflock` object next to the state for S3-native locking, while the older DynamoDB-table locking is deprecated. Terraform made S3-native locking generally available in 1.11.0 (February 27, 2025), and OpenTofu shipped it through S3 conditional writes in 1.10.0 on June 24, 2025. A hosted backend such as HCP Terraform keeps every state version per workspace, links each to the run and commit that produced it, creates intermediate versions during a run as recovery points, and offers rollback, which it warns "can result in orphaned or duplicated infrastructure resources" because the real world doesn't roll back with the file.

## Import, Moved and Removed

Three operations that used to be hand-run state commands are now configuration, so they appear in the plan and go through review:

- **Import** adopts an existing object. An `import` block names the address (`to`) and the vendor's identifier (`id`), or since 1.12 the provider-defined `identity` (the two are mutually exclusive). Writing only the `import` block and running `plan -generate-config-out=PATH` generates the matching resource configuration for review. Identity is the provider's structured answer to "which object is this": the AWS provider's S3 bucket identity is `account_id`, `bucket` and `region`, while an EC2 instance still imports by `id`. Bulk discovery queries (Terraform search) build on the same identity.
- **Moved** renames. `moved { from = ..., to = ... }` rewrites the state address before planning, so renaming a resource, switching from `count` to `for_each` or moving resources into a module plans as no change instead of destroy-and-create. Shared module authors ship `moved` blocks so every consumer migrates on their next plan.
- **Removed** forgets. A `removed` block with `lifecycle { destroy = false }` drops an object from state and leaves it running, the declarative replacement for `terraform state rm` and the way to hand an object to another team or tool. With the default `destroy = true` it is destroyed.

OpenTofu shipped the same `removed` block and loopable `import` blocks in 1.7.0, which is where the licensing dispute below became concrete.

## Workspaces and Stacks

CLI **workspaces** are several named states for one configuration in one backend (the S3 backend stores them under `env:/<workspace>/<key>` by default). The docs warn they "are not appropriate for system decomposition or deployments requiring separate credentials and access controls," and HCP Terraform's workspaces are a different thing: a hosted unit with its own state, its version history and its runs. **Stacks** (generally available in HCP Terraform since September 25, 2025) are a layer above, declaring several components and their deployments across environments or regions in one configuration. My rule: one state per unit that is changed, permissioned and recovered together, which is usually per environment and per system, never one state for everything and never CLI workspaces standing in for environments with different credentials.

## Providers, the Registry and Who Maintains What

The registry sorts providers into tiers by who stands behind them:

| Tier | Who maintains it | Namespace |
| --- | --- | --- |
| **Official** | HashiCorp | `hashicorp`, `IBM`, `IBM-Cloud`, `ansible` |
| **Partner Premier** | A technology partner meeting the premier requirements | The partner's organization |
| **Partner** | A company in the HashiCorp Technology Partner Program, for its own API | The partner's organization |
| **Community** | Individuals or groups | The maintainer's account |
| **Archived** | No longer maintained, often because an API was deprecated | `hashicorp` or the third party |

The tier list carries the ownership history: the Official namespaces now include IBM's own clouds and Ansible, products of the company that bought HashiCorp. The tier that matters to a provider business is Partner. A cloud, CDN, DNS host or database vendor writes and maintains the provider for its own API, gets the badge, and in exchange gets distribution: every customer who manages infrastructure in Terraform or OpenTofu can add the vendor in one block. HashiCorp counted over 3,000 providers and over 250 partners on March 29, 2023, with over 12,000 public modules and over 20 run-task partners (vendor figures). For the vendor, the provider is a product with its own release train, support load and breaking changes, and its quality is judged as the vendor's quality.

## Generated Providers and What a Provider API Must Expose

The largest providers are increasingly generated rather than written. Cloudflare's v5 provider, released February 3, 2025, is a ground-up rewrite whose resources are "automatically generated based on OpenAPI Schemas," with breaking changes for some resource types; by v5.4.0 on May 6, 2025, Cloudflare said customers had reported "an unexpectedly high number of issues" affecting about 15% of resources. Stainless, which sells a Terraform provider generator, lists `cloudflare/terraform-provider-cloudflare` among its example repositories, and states the conditions under which generation "works best": uniform create, read, update and list shapes, a full set of CRUD endpoints per resource, and an identifiable ID (an `id_property` on create, an `id_path_param` on read, update and delete). The lesson for a provider is that generation moves the quality bar onto the API description: an inconsistent spec produces an inconsistent provider for every customer at once.

Read together with Terraform's identity rules and Crossplane's external names, those conditions are the contract a vendor's API has to meet to be managed as code at all:

- **A stable identifier, returned on create.** The create response carries the ID immediately, even while the object is still provisioning, so the tool can record it before anything can fail. Terraform's identity must map to at most one remote object and "must not change" from creation to deletion; the plugin framework raises an "Unexpected Identity Change" error when it does.
- **Read by that identifier, with every attribute the create accepted.** Refresh, drift detection and import all depend on reading the object back. An attribute that can be set but not read can't be detected as drifted or imported, and becomes permanent noise in every plan.
- **Import by what the customer can see.** The identifier or identity attributes must be discoverable in the vendor's console and API, and the identity should carry everything needed to locate the object (region and account where the ID alone isn't unique), which is what the S3 bucket identity does.
- **Idempotent create.** A retried apply after a timeout must not produce a twin. A client-supplied idempotency key, the playbook's [Idempotency](/docs/payments/idempotency) pattern, or a unique name the API enforces, does it.
- **List and filter.** Bulk discovery (Terraform search, Crossplane observe-only adoption) needs to enumerate a customer's objects by type and tag.
- **Honest deletes and long operations.** Deletion either completes or reports an operation that can be polled, and a deleted object's read returns not-found rather than a stale copy, so the tool can tell "gone" from "failed."

The cPanel functions above meet some of these (accounts have stable usernames, and `accountsummary` reads one back) and miss the rest, which is why provisioning on panel servers stayed scripted.

## The License Change and IBM

On August 10, 2023, HashiCorp announced that all future releases of its products would move from the Mozilla Public License 2.0 to the Business Source License 1.1, keeping "HashiCorp APIs, SDKs, and almost all other libraries" under MPL 2.0. End users could still copy, modify and redistribute the code, but "vendors who provide competitive services built on our community products" could no longer incorporate future releases, bug fixes or security patches. Terraform 1.6.0 (October 4, 2023) was the first BSL release.

The license file is the operative text, and as of October 2026 it reads: Licensor "International Business Machines Corporation (IBM)"; Licensed Work "Terraform Version 1.6.0 or later"; an Additional Use Grant allowing production use provided it "does not include offering the Licensed Work to third parties on a hosted or embedded basis" in competition with IBM's paid versions, with internal hosting expressly not competitive; a Change Date "four years from the date the Licensed Work is published," after which each version converts to the Change License, MPL 2.0. Every Terraform release therefore becomes MPL four years after it ships, and a hosted plan-and-apply platform or a product embedding Terraform is exactly the use the grant excludes.

The money explains the timing. HashiCorp's last annual report (fiscal year ended January 31, 2024) shows revenue of $583.1 million, up from $475.9 million and $320.8 million in the two years before, and a net loss of $190.7 million; 897 customers paying $100,000 or more a year produced 89% of revenue, out of 4,423 customers in all. HashiCorp entered a merger agreement with IBM on April 24, 2024, and IBM completed the acquisition on February 27, 2025 at $35 a share in cash, an enterprise value of $6.4 billion, positioning Terraform as provisioning and Red Hat's Ansible as the configuration layer on top. The vendor-against-cloud license pattern this belongs to, and how foundations settled it elsewhere, is [Open Source & the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds#foundations-as-the-settlement).

## OpenTofu

The OpenTofu manifesto asked HashiCorp to return Terraform to an open-source license, calling the BSL "a poison pill for Terraform" and its use grant vague enough that a company couldn't be confident its use would stay permitted. HashiCorp didn't respond by August 25, 2023, and the signatories forked the last MPL release. The Linux Foundation announced OpenTofu on September 20, 2023 in Bilbao, with more than 140 organizations and 600 individuals pledged and a starting commitment of at least 18 full-time developers for five years; the named supporters (Harness, Gruntwork, Spacelift, env0, Scalr, Digger, Terrateam, Massdriver, Terramate) were largely the platform vendors the use grant excluded.

| Date | Event |
| --- | --- |
| January 10, 2024 | 1.6.0, the first stable release: a "drop-in replacement for Terraform," testing, an updated S3 backend, and a new registry built on a git repository with publishing by pull request |
| April 3 and 11, 2024 | HashiCorp sent a cease and desist alleging that OpenTofu's `removed` block copied BSL code; OpenTofu published the letter and a source-origin analysis concluding "the code in question can be clearly shown to have been copied from older code under the MPL-2.0 license," and kept shipping |
| April 30, 2024 | 1.7.0: client-side state and plan encryption, provider-defined functions, `removed`, loopable `import` |
| March 12, 2025 | The CNCF Governing Board voted an exception to its IP policy so OpenTofu could join under MPL-2.0, relicensing to Apache 2.0 not being an option |
| April 23, 2025 | Accepted into the CNCF at Sandbox level |
| June 24, 2025 | 1.10.0: modules and providers from OCI registries, S3-native locking, experimental OpenTelemetry tracing |
| December 9, 2025 | 1.11.0: ephemeral values and write-only attributes, and an `enabled` meta-argument replacing the `count = var.x ? 1 : 0` idiom |
| October 21, 2026 | 1.13.2 current, 1.12.9 maintained (as of October 2026) |

**State encryption** is OpenTofu's clearest divergence. An `encryption` block (or the `TF_ENCRYPTION` environment variable) encrypts state and plan files before they reach any backend, with key providers for a PBKDF2 passphrase, AWS KMS, GCP KMS, Azure Key Vault, OpenBao's transit engine or an external program, and AES-GCM as the built-in method. `enforced = true` refuses to write plaintext; a `fallback` block lets a project migrate from unencrypted state or roll keys, since reads try the fallback and writes always use the primary method. The docs are precise about what it doesn't do: it protects a stolen file, not against data loss, replay of an older state, or whoever runs `tofu`. HCP Terraform's answer, hold-your-own-key (generally available September 25, 2025), encrypts state and plan files with customer-controlled keys before upload. The two differ in who runs the encryption: the client, against any backend, or the hosted platform's agent, against that platform.

The forks now diverge feature by feature. OpenTofu follows Terraform's language where it can (it describes itself as a drop-in for Terraform 1.5, with migration guides from later versions), loads `.tofutest.hcl` in preference to `.tftest.hcl` so modules can carry tests for both, and adds features Terraform lacks. My rule is to treat a move between them as a migration, done with each project's guide and a fresh plan that shows no changes, never as a file copy, and especially not once client-side encryption is on.

## General-Purpose Languages: CDK, CDKTF and Pulumi

A second line of tools replaced the configuration language with a programming language and kept a declarative engine underneath:

- **AWS CDK** reached general availability on July 11, 2019 for TypeScript and Python, with Java and C# in preview. A CDK program synthesizes CloudFormation templates, so CloudFormation's stack state and change sets still do the provisioning; the CDK itself costs nothing.
- **CDKTF**, HashiCorp's equivalent synthesizing Terraform configuration, was sunset and archived on December 10, 2025 because it "did not find product-market fit at scale." HashiCorp's migration advice: `cdktf synth --hcl` to generate Terraform files, or move to the AWS CDK if already in that ecosystem. Customers who built on it were left owning generated HCL.
- **Pulumi** launched on June 18, 2018 for "cloud programs" in JavaScript, TypeScript, Python and Go against AWS, Azure, Google Cloud and Kubernetes; the engine is Apache-2.0. Each stack has its own state, saved as transactional checkpoints during an update. Pulumi Cloud is the default backend; the self-managed alternatives are S3, Azure Blob Storage, GCS, S3-compatible servers, PostgreSQL or the local filesystem, and Pulumi warns that blob storage isn't transactional, so those backends can't recover from some partial failures. Secrets in state are encrypted with the stack's encryption provider, an HSM key in Pulumi Cloud by default, and cloud credentials are never written to state.

The program is not the plan. All three still produce a desired state and a diff, and the reviewable artifact is that diff, not the code that generated it; a loop in a program can plan a hundred deletions from a one-line change just as a module input can.

## Cloud-Held State: ARM, Bicep and What-If

Azure took CloudFormation's route. Bicep is a domain-specific language that the Bicep CLI converts to an ARM JSON template at deployment; it supports every resource type and API version the day a resource provider publishes them, orders dependencies from symbolic references, and needs "no state or state files to manage: Azure stores all states." Bicep is free, open source and supported by Microsoft (experimental features excepted).

The preview is `what-if`, available for resource group, subscription, management group and tenant deployments. It predicts changes as Create, Delete (only in complete mode, where resources missing from the template are removed), Ignore, NoChange, NoEffect, Modify and Deploy. Its documented limits are the price of a preview the tool doesn't fully control: it can't resolve the `reference` function, so any property set from one always shows as changing; properties the service fills with defaults show as deleted ("noise"); and expansion stops at 500 nested templates, 800 resource groups or five minutes, after which the remaining resources are marked Ignore. A Terraform plan has its own blind spots (values known only after apply), but it is computed from state the customer can inspect; `what-if` is the service's prediction.

## Kubernetes as the Control Plane: Crossplane and ACK

The third model puts desired state in the Kubernetes API and lets controllers reconcile it continuously instead of on each apply. **Crossplane** (accepted into the CNCF June 25, 2020, incubating September 14, 2021, graduated October 28, 2025; v2.4 current as of October 2026) installs providers whose managed resources are custom resources for external objects, such as an RDS instance, and lets platform teams build their own APIs through compositions, pipelines of functions written in YAML, KCL, Python or Go. A provider finds the external object by the `crossplane.io/external-name` annotation, "the name of the managed resource inside the Provider," and management policies decide what Crossplane may do: `Observe` alone watches without changing anything, the first step in adopting an existing object, and without `Delete` removing the custom resource leaves the external object in place. **AWS Controllers for Kubernetes** ships one controller image per AWS service in ECR Public, with explicit version tags and no `:latest`, and runs on any cluster, not only EKS.

The trade is continuous reconciliation against a second control plane. Drift is corrected within a reconcile interval instead of waiting for someone to run a plan, but there's no plan to review before a change in the cluster reaches the vendor, and the Kubernetes cluster itself becomes infrastructure whose loss stops all management. Kubernetes Architecture covers custom resources and controllers; the playbook's [GitOps](/docs/operations/kubernetes#gitops) covers driving them from a repository.

## The Alternatives

| Tool | Model | Strengths | Failure modes | License and owner | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Terraform** | HCL, providers over gRPC, customer-held state, plan then apply | The largest provider and module ecosystem; most vendors' first-class integration | State to secure and lock; BSL use grant excludes hosted or embedded competing offerings | BSL 1.1 (each version converts to MPL 2.0 after four years); IBM | CLI free under the grant; HCP Terraform priced per managed resource | The default for multi-vendor estates |
| **OpenTofu** | Same model, MPL-2.0 fork | Open license and foundation governance; client-side state encryption; OCI registries | Feature divergence from Terraform after 1.5; some providers and modules tested against Terraform first | MPL-2.0; CNCF Sandbox (Linux Foundation) | Free | Platform vendors excluded by the BSL, and users who require an OSI license |
| **CloudFormation** | JSON or YAML templates, service-held stack state, change sets | No state to manage; no charge | AWS only; coverage follows AWS's schedule | Proprietary service; AWS | No additional charge | AWS-only estates |
| **AWS CDK** | Program synthesizes CloudFormation | Real languages over CloudFormation's state | Inherits CloudFormation's limits; synthesized templates hard to review | Apache-2.0 library over a proprietary service; AWS | No additional charge | AWS application teams |
| **Pulumi** | Program in a general-purpose language, its own engine and state | Languages, testing in the host language, encrypted secrets in state | Programs can hide large plans; non-transactional DIY backends | Apache-2.0 engine; Pulumi Corporation | Engine free; Pulumi Cloud per resource-hour | Teams who want one language for app and infrastructure |
| **Bicep / ARM** | DSL to ARM JSON, service-held state, `what-if` | No state; new Azure resource types on day one | Azure only; `what-if` noise and limits | Open source (Microsoft); ARM proprietary | Free | Azure estates |
| **Crossplane** | Kubernetes custom resources, continuous reconciliation | Self-service APIs for platform teams; drift corrected continuously | No reviewable plan; the cluster is a dependency | Apache-2.0; CNCF Graduated | Free; the cluster's cost | Platform teams already on Kubernetes |
| **CDKTF** | Program synthesizes Terraform | (archived) | Sunset December 10, 2025; migrate to HCL or AWS CDK | MPL-2.0; archived by HashiCorp | n/a | Nobody new |
| **Scripts against a panel API** | Imperative calls | Simple for one server; no extra tooling | No plan, no state, no drift detection, partial failure by hand | Per panel vendor | Panel licensing | Shared hosting provisioning |

## My Default

My default is OpenTofu for any new estate that spans more than one vendor, with remote state in a backend I control, client-side state encryption enforced with a KMS key per state, S3-native locking, and the lock file committed. The reasons are in the tables: the language and provider ecosystem are the same as Terraform's for everything I'd write today, the license can't be changed under me by a new owner, and encryption of state is something the tool does rather than something I trust a backend to do. I keep modules within the language both tools share and test them with both until a feature I need exists only in one.

I'd pick Terraform with HCP Terraform when the organization wants a vendor to run state, runs, policy and identity as one supported product and accepts IBM's terms; the per-resource price in [Testing, Policy, Secrets & IaC Platforms](/books/hosting-and-cloud/iac-testing-policy-and-secrets#the-plan-and-apply-platforms) is the number to weigh. I'd pick CloudFormation or Bicep for an estate that lives entirely in one cloud and wants no state file at all, Crossplane only when a platform team is offering self-service infrastructure through Kubernetes already, and Pulumi when the team's strongest skill is a general-purpose language and it will still review the diff rather than the program. I wouldn't start anything new on CDKTF or on scripts against a panel API.

For a company that rents out infrastructure, the default is different and not optional: publish a Partner provider for both Terraform and OpenTofu, generated from an API description that meets the contract above, and test it against the API on every release, because customers judge the API by the provider.

## How to Build It

Two things land in [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model): conventions for `resources.external_ref`, which every provider's customers will import and refresh by, and, for a provider that hosts state as a product (an HCP Terraform-style service, or object storage offered as an S3-compatible backend), the state store itself. Runs and policy results are [Testing, Policy, Secrets & IaC Platforms](/books/hosting-and-cloud/iac-testing-policy-and-secrets#how-to-build-it)'s `iac_runs` and `policy_evaluations`.

```sql
-- The identifier a provider and its customers' IaC tools hold on to ------------

-- external_ref is generated by the provider, returned in the create response,
-- immutable for the resource's life and never reused, even after deletion.
CREATE UNIQUE INDEX resources_external_ref_key
  ON resources (kind, external_ref) WHERE external_ref IS NOT NULL;

ALTER TABLE resources
  ADD COLUMN create_idempotency_key TEXT,     -- the client's key; a retried create returns
                                              -- the same resource, not a twin
  ADD CONSTRAINT resources_create_idempotency_key
    UNIQUE (account_id, create_idempotency_key);

-- Hosted state ---------------------------------------------------------------

CREATE TABLE iac_states (                    -- one state: a workspace or a stack deployment
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id             UUID NOT NULL REFERENCES accounts (id),
  project_id             UUID NOT NULL REFERENCES projects (id),
  name                   TEXT NOT NULL,      -- 'network-prod', 'app/eu-west'
  unit                   TEXT NOT NULL CHECK (unit IN ('workspace', 'stack_deployment')),
  tool                   TEXT NOT NULL CHECK (tool IN ('terraform', 'opentofu', 'pulumi')),
  backend                TEXT NOT NULL CHECK (backend IN ('platform', 'http', 's3_compatible')),
  lineage                TEXT NOT NULL,      -- fixed at creation; a push with another is refused
  current_serial         BIGINT NOT NULL DEFAULT 0,
  current_version_id     UUID,               -- iac_state_versions (id), set on each accepted write
  encryption             TEXT NOT NULL CHECK (encryption IN ('none', 'provider_kms',
                           'client_side', 'hyok')),
  kms_key_ref            TEXT,               -- the provider's key; null when the client holds it
  locked_by              TEXT,               -- typed actor or run id holding the lock
  lock_id                TEXT,               -- the client's lock id; force-unlock must name it
  lock_acquired_at       TIMESTAMPTZ,
  managed_resource_count INT NOT NULL DEFAULT 0,  -- mode = 'managed' instances; feeds the meter
  status                 TEXT NOT NULL CHECK (status IN ('active', 'archived', 'deleted')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, name),
  CHECK ((locked_by IS NULL) = (lock_acquired_at IS NULL)),
  CHECK ((locked_by IS NULL) = (lock_id IS NULL)),
  CHECK ((encryption = 'provider_kms') = (kms_key_ref IS NOT NULL))
);

CREATE TABLE iac_state_versions (            -- every accepted write; never updated
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  state_id               UUID NOT NULL REFERENCES iac_states (id),
  serial                 BIGINT NOT NULL,
  lineage                TEXT NOT NULL,
  tool_version           TEXT NOT NULL,      -- '1.13.2'
  content_ref            TEXT NOT NULL,      -- object storage key of the (possibly encrypted) body
  content_sha256         BYTEA NOT NULL,
  byte_size              BIGINT NOT NULL CHECK (byte_size >= 0),
  encryption             TEXT NOT NULL CHECK (encryption IN ('none', 'provider_kms',
                           'client_side', 'hyok')),
  managed_resource_count INT NOT NULL CHECK (managed_resource_count >= 0),
  count_source           TEXT NOT NULL CHECK (count_source IN ('parsed', 'reported')),
                                             -- 'reported' when the body is opaque to the provider
  run_id                 UUID,               -- iac_runs (id) in the IaC platforms chapter
  created_by             TEXT NOT NULL,      -- typed actor
  intermediate           BOOLEAN NOT NULL DEFAULT false,  -- a mid-run recovery point
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (state_id, serial)
);

ALTER TABLE iac_states
  ADD FOREIGN KEY (current_version_id) REFERENCES iac_state_versions (id);
```

The write path applies the same checks `terraform state push` does, in one statement, so two writers can't both win:

```sql
-- Accept a new version only from the lock holder, with the same lineage and a
-- higher serial; otherwise zero rows update and the API returns 409.
UPDATE iac_states s
   SET current_serial = v.serial, current_version_id = v.id,
       managed_resource_count = v.managed_resource_count
  FROM iac_state_versions v
 WHERE v.id = $new_version_id
   AND s.id = v.state_id
   AND s.locked_by = $caller
   AND s.lineage = v.lineage
   AND v.serial > s.current_serial;
```

Design decisions behind it:

- **The identifier contract is in the schema.** A unique `external_ref` per kind that is never reused means an import, a refresh and an abuse report all resolve to one resource forever; the create idempotency key means a timed-out apply that retries gets the original resource back. Identity attributes beyond the ID (region, account) are already columns on `resources`, so an identity object is a projection of the row, not a second source of truth.
- **State versions are append-only.** A rollback is a new version copied from an old one, never an edit, and keeps the warning in front of the person doing it: the real world didn't roll back. Intermediate versions written during a run are kept as recovery points and pruned when the lock is released, as hosted backends do.
- **Locks carry their id.** A force-unlock has to name the lock id it is breaking, is allowed only to the project's administrators, and is written to the audit trail as its own action, because unlocking someone else's run is the one state operation that can corrupt state with nobody editing it.
- **Encryption decides what the provider can know.** With `none` or `provider_kms` the provider parses the body and counts managed instances itself (`count_source = 'parsed'`); with `client_side` or `hyok` the body is opaque, and the count comes from the run's own report. Billing on a reported number is a policy choice the price list should state.
- **Managed resources are a meter.** A rating job writes one `usage_events` row per state per hour, meter `iac.managed_resource_hours`, quantity the `managed_resource_count` in force during that hour, idempotency key `state_id` plus the hour, rated against a per-resource-hour SKU. Data sources and, following HCP Terraform's definition, null resources don't count; the definition is part of the SKU, and a change to it is a new price version.
- **Events:** `iac_state.created`, `iac_state.locked`, `iac_state.unlocked`, `iac_state.force_unlocked`, `iac_state.version_written`, `iac_state.rolled_back` and `iac_state.archived` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the run engine, metering, notifications and the audit store.

## Auditing

- **Every state version,** with its serial, lineage, checksum, tool version, the run and commit that wrote it and the actor, for as long as the resources it describes exist and the audit retention after that. It is the record of what the tool believed it managed at any instant.
- **Every lock, unlock and force-unlock,** with the lock id and who broke it ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Every rollback and every `removed` or `import` that changed ownership,** because they change which objects the provider will touch next, without any real-world change at the moment they happen.
- **Every read of a state body,** since the body may hold secrets in plain text ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)), and every key used to decrypt one ([Logging Key Use](/docs/security/encryption-at-rest#logging-key-use)).
- **The managed-resource meter, hour by hour,** with the count source, so a disputed bill can be rebuilt from state versions.

## What This Means for the System You Build

- **Ship a provider for both Terraform and OpenTofu,** generated from an API description that meets the contract: stable IDs on create, full reads, import by visible identity, idempotent create, list and filter, honest deletes.
- **Never reuse an external identifier,** and never change one in place; identity that changes breaks every customer's state at once.
- **Treat state as secret and versioned,** with lineage and serial checks on every write, a lock that carries its id, and append-only versions.
- **Encrypt state where the tool can,** and decide in advance what you can bill and support when you can't read the body.
- **Meter managed resources from state versions,** hourly and idempotently, with the definition of "managed" written into the SKU.
- **Make import, move and remove reviewable,** in configuration and in the plan, never as hand-run state commands.
- **Plan for the tool's owner to change:** know which license each version is under, when it converts, and which fork you'd move to.

## References

**Release notes and repositories**

- [GitHub: hashicorp/terraform v0.1.0](https://github.com/hashicorp/terraform/releases/tag/v0.1.0), the "Set version 0.1" tag of July 28, 2014 and the May 21, 2014 initial commit
- [GitHub: Terraform releases](https://github.com/hashicorp/terraform/releases), 1.17.0 marked latest on October 21, 2026 and the 1.16.7 patch on October 22, 2026
- [Terraform v1.1 changelog](https://github.com/hashicorp/terraform/blob/v1.1/CHANGELOG.md), 1.1.0 on December 8, 2021 with `moved` blocks
- [Terraform v1.5 changelog](https://github.com/hashicorp/terraform/blob/v1.5/CHANGELOG.md), 1.5.0 on June 12, 2023: `import` blocks, `-generate-config-out`, `check` blocks
- [Terraform v1.12 changelog](https://github.com/hashicorp/terraform/blob/v1.12/CHANGELOG.md), 1.12.0 on May 14, 2025: import by identity
- [InfoQ: Terraform 1.6 adds a test framework](https://www.infoq.com/news/2023/10/terraform-test-framework), the 1.6 release of October 2023
- [GitHub: Terraform license](https://github.com/hashicorp/terraform/blob/main/LICENSE), IBM as licensor, 1.6.0 or later, the Additional Use Grant, the four-year Change Date and MPL 2.0 as Change License
- [GitHub: Terraform v1.10.0](https://github.com/hashicorp/terraform/releases/tag/v1.10.0), November 27, 2024: ephemeral resources and values
- [GitHub: Terraform v1.11.0](https://github.com/hashicorp/terraform/releases/tag/v1.11.0), February 27, 2025: write-only attributes and S3-native locking generally available
- [GitHub: OpenTofu releases](https://github.com/opentofu/opentofu/releases), 1.13.2 latest and 1.12.9 maintained on October 21, 2026
- [GitHub: OpenTofu v1.10.0](https://github.com/opentofu/opentofu/releases/tag/v1.10.0), June 24, 2025: OCI registries, S3-native locking, OpenTelemetry tracing, target files
- [GitHub: OpenTofu v1.11.0](https://github.com/opentofu/opentofu/releases/tag/v1.11.0), December 9, 2025: ephemeral values, write-only attributes, `enabled`
- [GitHub: hashicorp/terraform-cdk](https://github.com/hashicorp/terraform-cdk), the December 10, 2025 sunset, the product-market fit reason and the migration paths
- [GitHub: pulumi/pulumi](https://github.com/pulumi/pulumi), Apache-2.0
- [Cloudflare changelog: Terraform v5 provider](https://developers.cloudflare.com/changelog/2025-02-03-terraform-v5-provider), February 3, 2025: resources generated from OpenAPI schemas, ground-up rewrite, breaking changes
- [Cloudflare changelog: Terraform v5.4.0](https://developers.cloudflare.com/changelog/post/2025-05-06-terraform-v5.4.0-provider/), May 6, 2025: issues affecting about 15% of resources

**Documentation**

- [Terraform: How Terraform works with plugins](https://developer.hashicorp.com/terraform/plugin/how-terraform-works), Core's and providers' responsibilities, plugins as separate executables over RPC, installation into `.terraform/providers/`
- [Terraform: Plugin protocol](https://developer.hashicorp.com/terraform/plugin/terraform-plugin-protocol), Protocol Buffers and gRPC, versions 5 (0.12+) and 6 (1.0+)
- [Terraform: Resource graph](https://developer.hashicorp.com/terraform/internals/graph), node types, edges, orphans, destroy and create nodes, parallel walk of 10 by default, rate limiting left to providers
- [Terraform: JSON output format](https://developer.hashicorp.com/terraform/internals/json-format), resource addresses, `resource_changes` actions, `previous_address`, `resource_drift`
- [Terraform: State](https://developer.hashicorp.com/terraform/language/state), `terraform.tfstate`, JSON, don't edit, `show -json`
- [Terraform: Purpose of state](https://developer.hashicorp.com/terraform/language/state/purpose), mapping to the real world, one-to-one binding, dependencies, cached attributes and `-refresh=false`
- [Terraform: state push](https://developer.hashicorp.com/terraform/cli/commands/state/push), the lineage and serial checks and `-force`
- [Terraform: S3 backend](https://developer.hashicorp.com/terraform/language/backend/s3), `use_lockfile`, deprecated DynamoDB locking, `encrypt`, `kms_key_id`, versioning, `workspace_key_prefix`
- [Terraform: Dependency lock file](https://developer.hashicorp.com/terraform/language/files/dependency-lock), versions, constraints, `h1:` and `zh:` hashes, `providers lock`, committing it
- [Terraform: Import](https://developer.hashicorp.com/terraform/language/import), `import` blocks, `-generate-config-out`, identity and the S3 bucket example, bulk import
- [Terraform plugin framework: Resource identity](https://developer.hashicorp.com/terraform/plugin/framework/resources/identity), identity schemas, `RequiredForImport`, the no-change rule, import by `id` or identity
- [Terraform: moved block](https://developer.hashicorp.com/terraform/language/moved), renaming without destroying
- [Terraform: removed block](https://developer.hashicorp.com/terraform/language/block/removed), `lifecycle { destroy = false }`
- [Terraform: Workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces), multiple states per backend, the system-decomposition warning, the difference from HCP Terraform workspaces
- [Terraform: Sensitive data](https://developer.hashicorp.com/terraform/language/manage-sensitive-data), `sensitive`, ephemeral values (1.10) and write-only arguments (1.11)
- [HCP Terraform: State](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/state), state versions, intermediate versions, sharing, rollback and its warning
- [Terraform Registry: Providers](https://developer.hashicorp.com/terraform/registry/providers), the Official, Partner Premier, Partner, Community and Archived tiers and the Official namespaces
- [OpenTofu: State and plan encryption](https://opentofu.org/docs/language/state/encryption/), key providers, AES-GCM, `enforced`, fallback migration, what encryption doesn't protect
- [OpenTofu: test command](https://opentofu.org/docs/cli/commands/test/), `.tofutest.hcl` taking precedence over `.tftest.hcl`
- [AWS CloudFormation: Change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html), previewing and executing stack updates
- [Microsoft Learn: What is Bicep?](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview), transpiling to ARM JSON, "Azure stores all states," `what-if`, free and supported
- [Microsoft Learn: ARM what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-what-if), change types, the `reference` limitation, noise and expansion limits
- [Pulumi: State and backends](https://www.pulumi.com/docs/iac/concepts/state-and-backends/), per-stack state, checkpoints, the backends and their durability, secrets encryption
- [Crossplane: What's Crossplane](https://docs.crossplane.io/latest/whats-crossplane/), managed resources, compositions, functions, v2.4
- [Crossplane: Managed resources](https://docs.crossplane.io/latest/managed-resources/managed-resources/), `crossplane.io/external-name` and management policies
- [AWS Controllers for Kubernetes: Overview](https://aws-controllers-k8s.github.io/community/docs/community/overview/), one controller per service, ECR Public, version tags, any cluster
- [Stainless: Terraform provider generator](https://www.stainless.com/docs/terraform/index.md), the CRUD and ID conditions and Cloudflare's provider listed as an example
- [cPanel: WHM API 1 introduction](https://api.docs.cpanel.net/whm/introduction/), the `json-api` URL, `whmapi1`, `applist` and the warning against interface URLs
- [cPanel: cPanel API 2](https://api.docs.cpanel.net/cpanel-api-2), deprecated in favour of UAPI

**Announcements**

- [AWS: Introducing AWS CloudFormation](https://aws.amazon.com/about-aws/whats-new/2011/02/25/introducing-aws-cloudformation/), February 25, 2011: templates, dependency order, no additional charge
- [AWS: The AWS CDK is now generally available](https://aws.amazon.com/about-aws/whats-new/2019/07/the-aws-cloud-development-kit-aws-cdk-is-now-generally-available/), July 11, 2019: TypeScript and Python, synthesizing CloudFormation
- [HashiCorp: The story of Terraform with Mitchell Hashimoto](https://www.hashicorp.com/en/resources/the-story-of-hashicorp-terraform-with-mitchell-hashimoto), the 2011 post, 0.1 with AWS and DigitalOcean, the flat 18 months, 2016 and 2017 growth, 1.0 figures (vendor)
- [HashiCorp: Terraform ecosystem passes 3,000 providers](https://www.hashicorp.com/blog/hashicorp-terraform-ecosystem-passes-3-000-providers-with-over-250-partners), March 29, 2023: providers, partners, modules, run-task partners (vendor figures)
- [HashiCorp: Terraform 1.7 adds test mocking and config-driven remove](https://www.hashicorp.com/en/blog/terraform-1-7-adds-test-mocking-and-config-driven-remove), January 17, 2024
- [HashiCorp: HashiConf 2025 Terraform and Packer features](https://www.hashicorp.com/en/blog/scale-infrastructure-with-new-terraform-and-packer-features-at-hashiconf-2025), September 25, 2025: Stacks GA, search, actions, HYOK GA
- [HashiCorp: HashiCorp adopts the Business Source License](https://www.hashicorp.com/en/blog/hashicorp-adopts-business-source-license), August 10, 2023: BSL 1.1, libraries staying MPL, the effect on competing vendors
- [OpenTofu: Manifesto](https://opentofu.org/manifesto/), the request to return to open source, "poison pill," the August 25, 2023 deadline
- [Linux Foundation: Announcing OpenTofu](https://www.linuxfoundation.org/press/announcing-opentofu), September 20, 2023 in Bilbao: pledges and named supporters
- [OpenTofu: OpenTofu is going GA](https://opentofu.org/blog/opentofu-is-going-ga/), 1.6.0 on January 10, 2024: drop-in replacement, testing, the registry
- [OpenTofu: Response to HashiCorp's cease and desist](https://opentofu.org/blog/our-response-to-hashicorps-cease-and-desist/), the April 3, 2024 letter and the April 11, 2024 response
- [OpenTofu: 1.7.0](https://opentofu.org/blog/opentofu-1-7-0/), April 30, 2024: state encryption, provider-defined functions, `removed`, loopable `import`
- [CNCF: OpenTofu](https://www.cncf.io/projects/opentofu/), accepted April 23, 2025 at Sandbox
- [CNCF: Governing Board minutes, March 12, 2025 (PDF)](https://www.cncf.io/wp-content/uploads/2025/04/CNCF-Governing-Board-Meeting-Minutes-2025-03-12.pdf), the IP policy exception for MPL-2.0
- [CNCF: Crossplane](https://www.cncf.io/projects/crossplane/), accepted June 25, 2020, incubating September 14, 2021, graduated October 28, 2025
- [Joe Duffy: Hello, Pulumi!](https://joeduffyblog.com/2018/06/18/hello-pulumi/), June 18, 2018: languages and clouds at launch

**Filings**

- [HashiCorp: Form 10-K for fiscal 2024](https://www.sec.gov/Archives/edgar/data/1720671/000162828024012350/hcp-20240131.htm), revenue, net loss, customers and the $100,000 cohort's share
- [HashiCorp: Form 8-K, April 24, 2024](https://www.sec.gov/Archives/edgar/data/1720671/000119312524114310/d804229d8k.htm), the merger agreement with IBM
- [IBM: IBM completes acquisition of HashiCorp](https://newsroom.ibm.com/2025-02-27-ibm-completes-acquisition-of-hashicorp,-creates-comprehensive,-end-to-end-hybrid-cloud-platform), February 27, 2025: $35 a share, $6.4 billion enterprise value, Terraform with Ansible
