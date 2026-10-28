+++
title = "Testing, Policy, Secrets & IaC Platforms"
nav_title = "Testing, Policy & Secrets"
description = "Testing IaC with mocks and real deploys, policy at plan time, secrets kept out of state, state-leak incidents, and plan-and-apply platforms and prices."
category = "Hosting & Cloud Industry"
order = 2153
part = "Infrastructure as Code"
tags = ["infrastructure-as-code", "testing", "policy-as-code", "secrets", "pricing"]
+++

A provisioning tool will do exactly what the configuration says, to production, with credentials that can delete everything. Everything in this chapter exists to put checks between a pull request and that apply: tests that prove a module does what it claims before anyone depends on it, policies that fail a plan before a public bucket exists, secrets that never land in the repository or the state file, and a platform that runs the plan, records who approved it, and applies exactly what was reviewed with credentials that live for one run. The playbook's [Infrastructure as Code](/docs/delivery/infrastructure-as-code) states the rules ([plan in CI, apply from CI](/docs/delivery/infrastructure-as-code#plan-in-ci-apply-from-ci), [policy as code](/docs/delivery/infrastructure-as-code#policy-as-code), [state treated as secret](/docs/delivery/infrastructure-as-code#state-remote-locked-never-edited-by-hand), [detect drift](/docs/delivery/infrastructure-as-code#detect-drift)); this chapter covers the tools that implement them, the incidents that showed why, and the market that sells the loop as a service.

That market matters to a hosting or cloud company twice. As a customer, it runs its own estate through one of these platforms. As a vendor, the plan-and-apply platform is a product shape it may sell or partner with, and each vendor's pricing axis (resources under management, workers, successful applies, seats) is a choice about what to meter, with the same consequences as any other meter in this volume. How the tools work inside (state, providers, the plan document) is [Provisioning: Terraform, OpenTofu & the Alternatives](/books/hosting-and-cloud/terraform-and-opentofu); attacks on the pipeline that runs them, and OIDC federation in general, are [Pipeline Supply-Chain Security](/books/hosting-and-cloud/pipeline-supply-chain-security).

## How the Providers Do It

The hosted plan-and-apply platforms, often called TACOS, price on different axes. As of October 2026:

| Platform | Model | What it charges for | Published figures |
| --- | --- | --- | --- |
| **HCP Terraform** (IBM) | Hosted state, runs, policy, registry; self-managed as Terraform Enterprise | Managed resources, billed hourly | Essentials from $0.10 per resource a month ($0.00013 an hour), Standard $0.47 ($0.00064), Premium $0.99 ($0.00135); Enterprise and Europe custom; $500 trial credit. Free tier: up to 500 managed resources, unlimited users |
| **Spacelift** | Hosted orchestration for OpenTofu, Terraform, Terragrunt, Pulumi and Kubernetes; private workers are hosted in the customer's own cloud | Plan tier, differentiated mainly by private workers | No list prices; annual subscriptions by quote. Free: 2 users, 1 public worker. Starter+ 1 private worker (up to 2); Business 3; Enterprise 5 to 30; Enterprise+ 12 to 30 (100+ on request) |
| **env zero** | Hosted environments and runs | Successful applies and active environments | Free: up to 250 runs a month, 30 environments, 1 concurrent run, 20 minutes a run, 1 self-hosted runner. Paid plans by quote, "Priced Per Successful Apply or Environment"; PR plans, drift detections and destroys don't count as deployments on paid plans |
| **Atlantis** | Self-hosted pull-request automation for GitHub, GitLab, Bitbucket and Azure DevOps | Nothing; the operator pays for the server | Open source, "in production since 2017," a Series of LF Projects |
| **Pulumi Cloud** | Hosted state, deployments and secrets (ESC) for Pulumi | Credits ($1 each) drawn by resource-hours | Free: 1 user, 1 concurrent update, 500 workflow minutes, 25 secrets. Essentials $40 a month (40 credits, up to 500 resources, $0.00025 a resource-hour); Pro $400 (400 credits, up to 2,000, from $0.0005); Enterprise $2,000 (2,000 credits, up to 4,750, from $0.00075) |

Three patterns run through the table. **The meter is a product decision with a behavior attached:** per-resource pricing taxes large estates and rewards consolidating many small resources into fewer; per-apply pricing taxes frequent deploys and makes plans free, which encourages the review step; per-worker pricing is a concurrency cap, so queues grow before the bill does. **Free tiers moved from users to resources:** HCP Terraform retired its user-based legacy Free plan on March 31, 2026 in favor of 500 managed resources with unlimited users, in a migration HashiCorp says is "not reversible." **The self-hosted floor is free,** and Atlantis sets the price every hosted platform has to justify: state, policy, approvals, audit and identity, run for the customer.

## Testing Infrastructure Code

Infrastructure tests come in the same layers as application tests, with one difference: the expensive layer creates real resources and costs real money.

- **Static checks** cost nothing: `validate`, formatting, and the policy scanners below run against configuration without credentials.
- **Unit tests** run against a plan or mocked providers. They prove the module's logic (a variable validation fires, a count produces the right number of instances, an output is shaped right) without creating anything.
- **Integration tests** apply the module to a real account, check the result from outside (an HTTP request, an API call, an SSH login), and destroy it. They catch what mocks can't: a provider bug, an API default, an IAM permission missing.
- **Image and server tests** check what a machine looks like after it's built or converged. Test Kitchen and InSpec are the Chef ecosystem's harness for that ([Testing: ChefSpec, Test Kitchen and InSpec](/books/hosting-and-cloud/chef#testing-chefspec-test-kitchen-and-inspec)); for images, Packer's provisioners and HCP Packer's revocation are covered in [HCP Packer Channels and Revocation](/books/hosting-and-cloud/packer-and-images#hcp-packer-channels-and-revocation).

### terraform test and tofu test

Terraform 1.6.0 added a native framework, and 1.7.0 (January 17, 2024) added mocking. Tests live in `.tftest.hcl` (or `.tftest.json`) files: an optional `variables` block, `provider` blocks, and one or more `run` blocks. Each run has a `command` of `apply` (the default, which creates real infrastructure) or `plan` (unit-style, nothing created), `plan_options` for mode, refresh, replace and target, `assert` blocks with a `condition` and `error_message`, and `expect_failures` for custom conditions that should fail. Runs can read earlier runs' outputs, can share or separate internal state with `state_key`, and run sequentially unless `parallel = true`. At the end of the file Terraform destroys what it created, in reverse run order, so a bucket that must be emptied first needs its runs ordered with that in mind. `mock_provider` replaces a provider with one that returns fixed or generated values (the 1.7 announcement's example fixes an S3 bucket's `arn`), and `override_module` replaces a slow module's outputs, so a plan-only suite needs no credentials at all. `-junit-xml` output became generally available in 1.11.0 for CI test reports.

OpenTofu's `tofu test` reads the same files plus `.tofutest.hcl` and `.tofutest.json`, and when both exist with the same base name loads only the `.tofutest` file, so one module can carry tests for each tool. Its mocks generate type-based defaults for computed attributes (zero, false, empty collections), `override_resource` and `override_data` replace specific objects (and since 1.12 can target `count` and `for_each` instances, including wildcards), and run-level overrides beat file-level ones.

### Terratest

Gruntwork's Terratest is a Go library for the integration layer: write a `_test.go` file, deploy with the real tool (Terraform, Packer, Docker, Kubernetes and the clouds' APIs have first-class helpers), validate with HTTP requests, API calls or SSH, and undeploy when the test ends. It tests the thing customers will actually run, and it is slow and costs money in proportion. My rule: unit tests with mocks on every pull request, integration tests in an isolated account on merge to a module's main branch and before a release tag, and both destroying everything they create, with a sweeper job that deletes anything left behind by a crashed run.

## Policy as Code at Plan Time

The plan document (`terraform show -json`) is what policy engines read: every resource change with its address, actions and before-and-after values. A policy fails the run before the change exists, which is the point.

- **Open Policy Agent** (accepted into the CNCF March 29, 2018, incubating April 2, 2019, graduated January 29, 2021) evaluates Rego policies against JSON input. **Conftest** wraps it for configuration files: policies in a `policy` directory and the `main` namespace by default, rules named `deny`, `violation` (structured results) or `warn`, parsers for HCL2, JSON, YAML, Dockerfiles, CycloneDX and SPDX among many others, and `conftest verify` for unit-testing the policies themselves.
- **Sentinel** is HashiCorp's policy language in HCP Terraform and Terraform Enterprise, with three enforcement levels: **advisory** (the default; a failure is allowed and logged as a warning), **soft mandatory** (must pass unless an authorized operator overrides, which provides non-repudiation because someone explicitly overrode a failed policy), and **hard mandatory** (the language's own levels give it no override). HCP Terraform loosens the last one: as of October 2026 its docs say a hard-mandatory failure stops the run "unless the set containing the policy is configured to allow overrides," and that a Sentinel policy set's policy-level override setting "takes precedence over the individual policy's enforcement level." Its OPA policy sets have two levels, advisory and mandatory, and a mandatory failure can be overridden by "any user with Manage Policy Overrides permission." So hard mandatory means unoverridable only in a set that doesn't allow overrides. HashiCorp says it has delivered more than 350 prewritten policies, including an AWS set for NIST SP 800-53 Rev. 5 (September 25, 2025).
- **Checkov** (Apache-2.0, maintained by Prisma Cloud) ships over 1,000 built-in policies for AWS, Azure and Google Cloud and scans Terraform, Terraform plans, OpenTofu, CloudFormation, SAM, Kubernetes, Helm, Kustomize, Dockerfiles, Ansible, Bicep, ARM and CI workflow files, with graph-based checks across resources. Suppressions are inline comments, `checkov:skip=<check_id>:<reason>`, inside the resource.
- **tfsec** has been folded into **Trivy**: Aqua encourages the tfsec community "to transition over to Trivy," which carries the same Terraform scanning engine.
- **Run tasks** are HCP Terraform's integration point for everything else: an external service called at pre-plan, post-plan, pre-apply or post-apply, returning pass or fail to a callback URL, with an **advisory** or **mandatory** enforcement level (the most restrictive wins when several apply). HCP Packer's run task, which fails a run that references revoked images, is the documented example; cost tools use the same hook.

The levels are what make policy usable. My default: hard mandatory, in a policy set that doesn't allow overrides, for the handful of rules that are never acceptable (public storage of anything not explicitly public, unencrypted databases, resources outside allowed regions), soft mandatory with a named approver and a recorded reason for rules that have legitimate exceptions, and advisory for new policies until their false-positive rate is known. Every override is a record ([How to Build It](#how-to-build-it)), and a policy whose overrides are routine gets rewritten, not overridden forever.

## Secrets: Out of Code, Out of State

Three separate problems hide under "secrets in IaC," and each has its own tool.

**Values in the state file.** Whatever a provider returns is stored in state and plan files in plain text, and `sensitive` (Terraform 0.15 and later) only redacts it from CLI output and the UI; `terraform output -json` still prints it. Ephemeral values (Terraform 1.10.0, November 27, 2024) are available during a run and "omitted from state and plan files entirely": ephemeral input variables and child-module outputs, and `ephemeral` blocks for short-lived objects such as a fetched secret or a temporary token. Write-only arguments (1.11.0, February 27, 2025) pass such a value into a managed resource without persisting it; they conventionally end in `_wo` with a `_wo_version` the author increments to push a new value. OpenTofu shipped the same pair in 1.11.0 (December 9, 2025). What remains in state still needs protecting: OpenTofu's client-side state encryption and HCP Terraform's hold-your-own-key encryption, compared in [Provisioning](/books/hosting-and-cloud/terraform-and-opentofu#opentofu), are the two ways to make a stolen state file useless.

**Secrets the infrastructure needs at runtime.** Infrastructure code creates the place a secret lives and the permission to read it, never the value ([Environments as Code](/docs/delivery/infrastructure-as-code#environments-as-code), [Secrets](/docs/operations/environments#secrets)). The stores:

- **Vault** moved to the BSL with the rest of HashiCorp's products; its license file names IBM as licensor for "Vault Version 1.15.0 or later," converting to MPL 2.0 four years after each release.
- **OpenBao** is the community fork of the last MPL Vault: a secrets manager with encrypted key-value storage, dynamic secrets for databases and Kubernetes, encryption as a service, leases and revocation, now a sandbox project under the Linux Foundation's OpenSSF. Its 2.0.0 general-availability release (July 2024) was "fully API compatible with Vault 1.14.9" without Vault Enterprise features, and OpenTofu's `openbao` key provider works with it and with Vault 1.14.
- **SOPS** encrypts values inside YAML, JSON, ENV, INI and binary files with AWS KMS, GCP KMS, Azure Key Vault, age or PGP, so an encrypted file can live in the repository and be decrypted only where the key is reachable; it was accepted into the CNCF Sandbox on May 17, 2023.

**Credentials the pipeline uses to apply.** The most powerful secret in the whole system is the cloud credential CI uses to run `apply`. The answer is not to store one. GitHub Actions' OIDC tokens (generally available November 23, 2021) let a workflow "request short-lived access tokens that are automatically rotated for each deployment"; HCP Terraform's dynamic provider credentials do the same per run, issuing an OIDC workload identity token naming the organization, workspace or Stack, and run phase, which AWS, Azure, Google Cloud, Vault or Kubernetes verify against a trust relationship before returning temporary credentials that are discarded when the run's environment is torn down. Separate roles for plan and apply, so a pull request's plan can read but never write, follow directly. The playbook's [Secure](/docs/delivery/ci-pipelines#secure) covers the pipeline rules around them, and [Pipeline Supply-Chain Security](/books/hosting-and-cloud/pipeline-supply-chain-security) covers federation and its failure modes in depth.

## When State and Signing Keys Leak

The incidents are few in public but each maps to a control:

| Incident | What happened | The control |
| --- | --- | --- |
| **SCARLETEEL** (Sysdig, February 28, 2023) | An attacker entered through an internet-exposed service in a self-managed Kubernetes cluster on AWS, took the node role's credentials from IMDSv1, found the role could read every bucket in the account, and read a `terraform.tfstate` holding a clear-text access key for a second account. The second account's user was tightly scoped, so every call but `GetCallerIdentity` failed; more than 1 TB of other data was taken and some CloudTrail logging disabled | State in a dedicated, tightly permissioned store, encrypted, with no long-lived keys inside it; least-privilege roles; IMDSv2. Sysdig's own summary: "Terraform state files contain all data in plain text, which may contain secrets" |
| **HCSEC-2021-12** (HashiCorp, April 22, 2021) | The Codecov Bash Uploader compromise (January 31 to April 1, 2021) exposed, through CI environment variables, the GPG key that signs the `SHA256SUMS` files for HashiCorp downloads. HashiCorp revoked it, published a new key, re-signed releases and shipped Terraform 0.11.15, 0.12.31, 0.13.7, 0.14.11 and 0.15.1 so provider verification would trust the new key; it found no evidence the key was misused | Signing keys never in a CI environment that runs third-party code; verify downloads by checksum and signature; the provider lock file's hashes pin what was verified once |
| **HCSEC-2026-23** (HashiCorp, July 28, 2026) | terraform-mcp-server 0.2.1 to 1.0.0, the server that lets AI assistants drive Terraform, had three flaws in its streamable-HTTP transport: an SSRF that could send the server's bearer token to an attacker (CVE-2026-14869), a session cache keyed on the MCP session ID alone so anyone with another user's session ID could act with that user's Terraform token (CVE-2026-16496), and cross-tenant credential reuse in stateless mode (CVE-2026-16498). All fixed in 1.1.0 | Treat an agent's tool server as a credential broker: bind cached clients to the token that created them, restrict the listener, and give agents plan-only credentials |

There are no public statistics on how many state files leak; what the cases show is that state is read by whoever can read its bucket, and that the tools' own supply chain (signing keys, plugins, agent servers) is part of the attack surface.

## The Plan-and-Apply Platforms

Every platform in the table at the top runs the same loop: a pull request triggers a plan, the plan is posted where the reviewer reads it, policy and cost checks run against it, an approver accepts it, and the apply executes that plan, not a fresh one, with credentials scoped to the run. They differ in what they host and what they charge for.

**HCP Terraform** (formerly Terraform Cloud) hosts state, runs, the private registry, Sentinel and OPA policy, run tasks, dynamic credentials and, since September 25, 2025, Stacks and hold-your-own-key encryption. It bills per **managed resource**: a resource with `mode = "managed"` in HCP-managed state, counted from its first plan or apply, null resources excluded, billed hourly. At list starting prices as of October 2026, an estate of 2,000 managed resources costs about $200 a month on Essentials, $940 on Standard and $1,980 on Premium; feature tiers differ in module deprecation and revocation, no-code provisioning and team notifications. The Free tier covers 500 managed resources.

**Spacelift** publishes tiers but no prices. What changes between them is the number of private workers, which Spacelift provides and manages but which run as a customer-managed asset in the customer's private cloud, so the effective meter is concurrency on infrastructure the customer runs.

**env zero** meters outcomes: successful applies and active environments on paid plans, with pull-request plans, drift detections and destroys free there, while its Free tier's 250 monthly runs count applies, destroys and drift detections. A team that plans often and applies rarely pays little; one that deploys every merge to many environments pays per deploy.

**Atlantis** runs in the customer's own cluster, VM or Fargate task, runs plan and apply from pull-request comments, and lets developers "submit Terraform pull requests without credentials" because the credentials live with the Atlantis server. It is free, and everything a hosted platform adds (state hosting, policy UI, approvals, audit, drift schedules, identity) is the operator's to build.

**Pulumi Cloud** sells credits drawn down by resource-hours, with each tier's monthly fee buying that many credits. Its page says Essentials' 40 credits cover "up to 500" resources, but at its own $0.00025 a resource-hour, 40 credits buy about 219 resource-months (40 / (0.00025 × 730)); the included counts don't follow from the list rates, so I read them as packaging and price from the rate.

The pricing axes, side by side:

| Axis | Who uses it | What it rewards | What it punishes |
| --- | --- | --- | --- |
| Resources under management | HCP Terraform, Pulumi Cloud | Small estates, coarse resources | Many small resources (DNS records, IAM attachments), however rarely changed |
| Workers and concurrency | Spacelift | Predictable spend | Queues at peak; parallel environments |
| Successful applies and environments | env zero | Planning and review (free) | Frequent deploys across many environments |
| Self-hosted | Atlantis | Teams that will run the platform | Teams that won't; every missing feature is built in-house |

## Cost in the Pull Request

The plan shows what will change; a cost estimate shows what it will cost. **Infracost** parses Terraform, CloudFormation and AWS CDK projects, or a Terraform plan JSON for values that resolve only at plan time, and posts the monthly cost difference on each pull request, alongside FinOps and tagging policy results; `infracost scan` gives the same in a terminal, and editor code lenses show cost above each resource block. It says no cloud credentials or secrets are sent to its pricing API. As of October 2026 its CI/CD product is free for 1,000 runs a month, Starter is $250 a month for 10,000 runs, Cloud is $1,000 a month with 10 seats and adds FinOps policies, custom price books and guardrails, and Enterprise is by quote. HCP Terraform added an IBM Cloudability run task (September 25, 2025) that shows estimates and cost quota violations in run details. Ownership tags, which every cost estimate and [Every Dollar Has an Owner](/docs/operations/cost-and-finops#every-dollar-has-an-owner) depend on, are a policy rule like any other: enforced at plan time, hard mandatory, against an owner that exists ([Tags and Ownership](/books/hosting-and-cloud/governance-and-catalog#tags-and-ownership)).

## The Alternatives

| Approach | Model | Strengths | Failure modes | License and owner | Cost (October 2026) | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Generic CI (GitHub Actions, GitLab CI)** | Pipeline jobs run plan and apply | No new vendor; OIDC to the cloud built in | State, locks, approvals, policy UI and drift schedules all assembled by hand; plan and apply drift apart if not pinned | The CI vendor's | CI minutes | Small estates, teams with strong CI |
| **Atlantis** | Self-hosted PR comments | Free; credentials stay in-house; mature | One more server to run and secure; limited audit and policy UI | Open source; LF Projects | Free plus hosting | Teams who want PR-driven applies without a vendor |
| **HCP Terraform** | Hosted state, runs, policy, registry | One product from the tool's owner; Sentinel and OPA; dynamic credentials; HYOK | Per-resource bill grows with estate size, not activity; Terraform only (BSL), IBM's roadmap | Proprietary SaaS; IBM | From $0.10 per managed resource a month; Free to 500 | Enterprises standardized on Terraform |
| **Spacelift** | Hosted orchestration, private workers | Many tools (OpenTofu, Terraform, Terragrunt, Pulumi, Kubernetes); runs in your network | Price by quote; concurrency set by worker count | Proprietary SaaS; Spacelift | Free tier; paid by quote | Multi-tool platform teams |
| **env zero** | Hosted environments, per-apply billing | Plans and drift free on paid plans; environment lifecycle | Cost scales with deploy frequency | Proprietary SaaS; env zero | Free to 250 runs a month; paid by quote | Teams with many short-lived environments |
| **Pulumi Cloud** | Hosted state, deployments and ESC secrets | Native to Pulumi; secrets and state in one place | Pulumi only; resource-hour credits | Proprietary SaaS over an Apache-2.0 engine; Pulumi | Free tier; from $40 a month | Pulumi users |

For policy engines: OPA and Conftest are open, portable and need a Rego skill; Sentinel is the native choice inside HCP Terraform with first-class enforcement levels; Checkov and Trivy bring large built-in rule libraries for known misconfigurations and need suppression discipline. Most estates use a scanner for the catalog of known mistakes and OPA or Sentinel for their own rules.

## My Default

My default is generic CI with OIDC federation to the cloud, plan-only credentials on pull requests and apply credentials on the main branch, the saved plan file from the reviewed run applied after merge (never a fresh plan), state in a backend I control with client-side encryption, Checkov or Trivy plus Conftest policies run against the plan JSON, Infracost on every pull request, a nightly drift plan per state, and Terratest-style integration tests on module releases. It costs CI minutes and some assembly, and every part is replaceable when a vendor's price or owner changes.

I'd move to a hosted platform when the assembly stops being cheap: more than a few dozen states, several teams needing per-state permissions and approvals, auditors asking for a single record of who approved what, or a need for soft-mandatory overrides with recorded reasons. Then I'd choose by the meter that fits the estate: per-apply pricing (env zero) for many environments changed rarely, worker-based pricing (Spacelift) for large estates changed often, per-resource pricing (HCP Terraform) when the organization is standardized on Terraform and its estate is small or its resources coarse. Atlantis is my choice when credentials must never leave the network and the team will run a server for it.

For secrets, my rule is the same everywhere: no long-lived cloud credential in any pipeline, ephemeral values and write-only arguments for anything a provider needs, OpenBao or the cloud's own secrets manager for runtime secrets, SOPS for the few secrets that must live in a repository, and no secret value in any state file I can avoid.

## How to Build It

A provider that runs plans and applies for its customers, or a platform team running its own, records runs against the states that [Provisioning](/books/hosting-and-cloud/terraform-and-opentofu#how-to-build-it) owns (`iac_states`, `iac_state_versions`), and policy results against runs:

```sql
CREATE TABLE iac_runs (                  -- one plan, apply, destroy plan or drift check
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  state_id             UUID NOT NULL REFERENCES iac_states (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('plan', 'apply', 'destroy',
                         'drift_check')),  -- 'destroy' is a destroy-mode plan; an
                                           -- 'apply' executes a plan or destroy run
  trigger              TEXT NOT NULL CHECK (trigger IN ('pull_request', 'merge', 'schedule',
                         'manual', 'api')),
  tool                 TEXT NOT NULL CHECK (tool IN ('terraform', 'opentofu', 'pulumi')),
  tool_version         TEXT NOT NULL,
  vcs_repo             TEXT,
  vcs_commit           TEXT,             -- the exact commit planned
  vcs_pull_request     TEXT,
  plan_run_id          UUID REFERENCES iac_runs (id),  -- the reviewed plan an apply executes
  plan_ref             TEXT,             -- stored plan file (encrypted: it can hold secrets)
  plan_sha256          BYTEA,
  plan_add             INT CHECK (plan_add >= 0),
  plan_change          INT CHECK (plan_change >= 0),
  plan_destroy         INT CHECK (plan_destroy >= 0),
  drift_detected       BOOLEAN,          -- drift_check: exit code 2, changes present
  cost_delta_monthly   NUMERIC(24,6),    -- the estimate's monthly difference, unrounded
  cost_currency        CHAR(3),
  worker               TEXT NOT NULL CHECK (worker IN ('hosted', 'self_hosted')),
  credential_kind      TEXT NOT NULL CHECK (credential_kind IN ('oidc', 'static', 'none')),
  status               TEXT NOT NULL CHECK (status IN ('queued', 'planning', 'planned',
                         'policy_failed', 'awaiting_approval', 'applying', 'applied',
                         'errored', 'canceled', 'discarded')),
  requested_by         TEXT NOT NULL,    -- typed actor: 'user:...', 'vcs:github:...'
  approved_by          TEXT,             -- typed actor; required before an apply
  applied_by           TEXT,             -- typed actor that executed the apply
  resulting_version_id UUID REFERENCES iac_state_versions (id),
  queued_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at           TIMESTAMPTZ,
  finished_at          TIMESTAMPTZ,
  CHECK ((kind = 'apply') = (plan_run_id IS NOT NULL)),
  CHECK (kind <> 'drift_check' OR resulting_version_id IS NULL),
  CHECK ((cost_delta_monthly IS NULL) = (cost_currency IS NULL))
);

CREATE TABLE policy_evaluations (        -- one policy's result against one run
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  run_id           UUID NOT NULL REFERENCES iac_runs (id),
  engine           TEXT NOT NULL CHECK (engine IN ('opa', 'sentinel', 'checkov', 'trivy',
                     'run_task')),
  policy           TEXT NOT NULL,        -- 'storage/no-public-buckets', 'CKV_AWS_20'
  policy_version   TEXT NOT NULL,        -- the policy set's commit or release
  enforcement      TEXT NOT NULL CHECK (enforcement IN ('advisory', 'soft_mandatory',
                     'hard_mandatory')),  -- OPA 'mandatory' (overridable with the
                                          -- permission) maps to soft_mandatory; run
                                          -- tasks map 'mandatory' to hard_mandatory
  set_overridable  BOOLEAN NOT NULL DEFAULT false,  -- the policy set allowed overrides
                                                     -- when this ran (copied, not joined)
  result           TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'errored')),
  message          TEXT,
  resource_address TEXT,                 -- the plan address it failed on, if one
  overridden_by    TEXT,                 -- typed actor
  override_reason  TEXT,
  overridden_at    TIMESTAMPTZ,
  evaluated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nulls(overridden_by, override_reason, overridden_at) IN (0, 3)),
  CHECK (overridden_by IS NULL OR (result IN ('failed', 'errored')
         AND (enforcement = 'soft_mandatory'
              OR (enforcement = 'hard_mandatory' AND set_overridable))))
);
```

The gate is a query, not a status someone sets:

```sql
-- A planned run may be approved only if every mandatory failure was overridden by
-- someone with the right to do it; the constraint above already refuses an
-- override of a hard-mandatory failure in a set that doesn't allow overrides.
SELECT NOT EXISTS (
  SELECT 1 FROM policy_evaluations
   WHERE run_id = $run_id
     AND result IN ('failed', 'errored')
     AND enforcement <> 'advisory'
     AND overridden_by IS NULL
) AS may_apply;
```

Design decisions behind it:

- **An apply points at its plan.** `plan_run_id` and `plan_sha256` make "CI applies exactly the reviewed plan" a constraint: the apply worker loads the stored plan file, checks its hash and the state's serial against what the plan was made from, and refuses if the state moved on. A stale plan is discarded, never re-planned silently.
- **Plans are secrets too.** A plan file holds the same attribute values as state, so `plan_ref` is encrypted like a state body, readable only by the apply worker and the run's reviewers, and pruned on the same schedule as intermediate state versions.
- **Overrides are rows on the result.** An override carries its actor, reason and time. A soft-mandatory failure can be overridden; a hard-mandatory one only when its policy set allowed overrides at evaluation time (`set_overridable`, copied onto the row so a later settings change doesn't rewrite history), and otherwise the constraint refuses it. "Which rules are overridden most" is a query, and the answer drives which policies get rewritten.
- **Credentials are recorded by kind.** `credential_kind = 'static'` on an apply is a finding by itself; the target is OIDC on every run.
- **Drift checks don't write state.** A scheduled `drift_check` refreshes and plans; a detected drift opens a notification and, if the change was right, a pull request, never an automatic apply.
- **Meters follow the axis the provider chooses.** A platform billed by managed resources rates the `iac.managed_resource_hours` meter from state versions ([Provisioning](/books/hosting-and-cloud/terraform-and-opentofu#how-to-build-it)); one billed by outcomes emits `usage_events` with meter `iac.successful_applies` (idempotency key: the run id) when an apply reaches `applied`; one billed by concurrency sells workers as a recurring SKU and meters `iac.run_minutes` for capacity planning. Pull-request plans and drift checks are free or not by the SKU's definition, written down, never by an exception in code.
- **Events:** `iac_run.queued`, `iac_run.planned`, `iac_run.policy_failed`, `iac_run.approved`, `iac_run.applied`, `iac_run.errored`, `iac_run.drift_detected` and `policy.overridden` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, the VCS integration (plan comments, commit statuses), metering and the audit store.

## Auditing

- **Every apply with its plan, approver and credentials:** the commit, the plan hash, who approved, who or what applied, how the cloud credentials were obtained, and the state version it produced. "Who changed production, from which reviewed plan" is the question every incident review starts with.
- **Every policy result and override,** with the policy version that ran, kept as long as the change it allowed exists ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions) for runs an agent requested).
- **Every drift detection and how it was resolved,** codified or reverted, so an emergency console change can be traced to the incident behind it.
- **Every read of a plan or state body and every key use,** because both may hold secrets ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **The meter behind every bill:** managed-resource hours, successful applies or worker subscriptions, rebuildable from runs and state versions.

## What This Means for the System You Build

- **Test modules in layers:** mocked plans on every pull request, real deploys in an isolated account before a release, and a sweeper for anything a crashed test leaves behind.
- **Run policy against the plan,** with hard-mandatory rules few and absolute (in sets that don't allow overrides), soft-mandatory overrides recorded with a reason, and new rules advisory until proven.
- **Keep secrets out of state:** ephemeral values and write-only arguments for providers, a secrets manager for runtime, SOPS for the rare repository secret, and client-side or customer-key encryption for what remains.
- **Federate CI to the cloud with OIDC,** with read-only credentials for plans and write credentials only for the reviewed apply.
- **Apply the reviewed plan, not a fresh one,** and refuse it if the state moved since.
- **Put cost on the pull request,** and enforce the ownership tags cost reporting depends on.
- **Pick a platform by its meter:** resources, workers or applies, against the shape of your own estate.
- **Treat the toolchain as attack surface:** signing keys out of CI, checksums pinned in lock files, and agent tool servers given plan-only credentials.

## References

**Documentation**

- [Terraform: Tests](https://developer.hashicorp.com/terraform/language/tests), `.tftest.hcl`, `run`, `command`, `assert`, `expect_failures`, `state_key`, parallel runs, destroy order, 1.6.0 and mocking in 1.7.0
- [OpenTofu: test command](https://opentofu.org/docs/cli/commands/test/), `.tofutest.hcl` precedence, `mock_provider`, overrides and their 1.12 instance targeting, type-based defaults
- [Terratest](https://terratest.gruntwork.io/), the Go library, supported tools, the deploy, validate and undeploy pattern
- [Sentinel: Enforcement levels](https://developer.hashicorp.com/sentinel/docs/concepts/enforcement-levels), advisory as default, soft mandatory and non-repudiation, hard mandatory
- [HCP Terraform: Manage policies and policy sets](https://developer.hashicorp.com/terraform/cloud-docs/policy-enforcement/manage-policy-sets), Sentinel and OPA enforcement levels in HCP Terraform, policy-level overrides on Sentinel policy sets taking precedence over hard mandatory, OPA mandatory overrides with Manage Policy Overrides permission
- [Conftest](https://www.conftest.dev/), Rego policies, `deny`, `violation` and `warn`, the `main` namespace, supported formats, `conftest verify`
- [HCP Terraform: Run tasks](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/settings/run-tasks), stages, advisory and mandatory enforcement, callbacks, the HCP Packer revoked-image example
- [HCP Terraform: Dynamic provider credentials](https://developer.hashicorp.com/terraform/cloud-docs/dynamic-provider-credentials), per-run OIDC workload identity tokens, claims, supported platforms, trust setup
- [Terraform: Sensitive data](https://developer.hashicorp.com/terraform/language/manage-sensitive-data), `sensitive` redaction, ephemeral values, write-only arguments and `_wo_version`
- [Infracost: Documentation](https://www.infracost.io/docs/), supported IaC, plan JSON, PR comments, `infracost scan`, no credentials sent

**Release notes and repositories**

- [GitHub: Terraform v1.10.0](https://github.com/hashicorp/terraform/releases/tag/v1.10.0), November 27, 2024: ephemeral resources and values
- [GitHub: Terraform v1.11.0](https://github.com/hashicorp/terraform/releases/tag/v1.11.0), February 27, 2025: write-only attributes and JUnit XML test reports
- [GitHub: OpenTofu v1.11.0](https://github.com/opentofu/opentofu/releases/tag/v1.11.0), December 9, 2025: ephemeral values and write-only attributes
- [GitHub: Checkov](https://github.com/bridgecrewio/checkov), Apache-2.0, maintained by Prisma Cloud, 1,000+ policies, frameworks scanned, graph checks, skip comments
- [GitHub: tfsec](https://github.com/aquasecurity/tfsec), the move to Trivy
- [GitHub: Vault license](https://github.com/hashicorp/vault/blob/main/LICENSE), IBM as licensor of Vault 1.15.0 or later, four-year change to MPL 2.0
- [GitHub: OpenBao v2.0.0](https://github.com/openbao/openbao/releases/tag/v2.0.0), API compatibility with Vault 1.14.9 and no Enterprise features

**Projects and foundations**

- [CNCF: Open Policy Agent](https://www.cncf.io/projects/open-policy-agent-opa/), accepted March 29, 2018, incubating April 2, 2019, graduated January 29, 2021
- [CNCF: SOPS](https://www.cncf.io/projects/sops/), Sandbox from May 17, 2023, formats and key backends
- [OpenBao](https://openbao.org/), the Vault fork under OpenSSF, its capabilities and governance
- [OpenBao blog](https://openbao.org/blog/page/4/), the 2.0.0 general availability post of July 2024
- [Atlantis](https://www.runatlantis.io/), self-hosted PR automation, supported VCS, credentials, "in production since 2017," LF Projects

**Pricing (as of October 2026)**

- [HashiCorp: HCP Terraform pricing](https://www.hashicorp.com/en/products/terraform/pricing), Essentials, Standard and Premium per-resource rates, Enterprise custom, $500 trial credit, tier features
- [HashiCorp: Continuing HCP Terraform's enhanced free tier](https://www.hashicorp.com/en/blog/continuing-hcp-terraform-s-enhanced-free-tier-experience), December 17, 2025: legacy Free ends March 31, 2026, 500 managed resources, the managed-resource definition, irreversible migration
- [Spacelift: Pricing](https://spacelift.io/pricing), tiers, users, public and private workers, quote-only paid plans
- [env zero: Pricing](https://www.envzero.com/pricing), Free limits, per successful apply or environment, what counts as a deployment
- [Pulumi: Pricing](https://www.pulumi.com/pricing), Free limits, Essentials, Pro and Enterprise fees, credits, included resources and resource-hour rates
- [Infracost: Pricing](https://www.infracost.io/pricing/), Free, Starter, Cloud and Enterprise

**Announcements and advisories**

- [HashiCorp: Terraform 1.7 adds test mocking and config-driven remove](https://www.hashicorp.com/en/blog/terraform-1-7-adds-test-mocking-and-config-driven-remove), January 17, 2024: `mock_provider` and `override_module`
- [HashiCorp: HashiConf 2025 Terraform and Packer features](https://www.hashicorp.com/en/blog/scale-infrastructure-with-new-terraform-and-packer-features-at-hashiconf-2025), September 25, 2025: Stacks, HYOK, 350+ Sentinel policies and the NIST 800-53 set, the Cloudability run task
- [GitHub: Secure cloud deployments with OIDC is now GA](https://github.blog/changelog/2021-11-23-secure-cloud-deployments-with-oidc-is-now-ga/), November 23, 2021: short-lived tokens per deployment
- [Sysdig: SCARLETEEL](https://sysdig.com/blog/cloud-breach-terraform-data-theft/), February 28, 2023: the attack chain, the state file's clear-text key, the scoped second account, the recommendations
- [HashiCorp: HCSEC-2021-12](https://discuss.hashicorp.com/t/hcsec-2021-12-codecov-security-event-and-hashicorp-gpg-key-exposure/23512), April 22, 2021: the exposed signing key, rotation, re-signing and the Terraform patch releases
- [HashiCorp: HCSEC-2026-23](https://discuss.hashicorp.com/t/hcsec-2026-23-multiple-vulnerabilities-impacting-hashicorp-terraform-mcp-server/77606), July 28, 2026: the three terraform-mcp-server CVEs, affected and fixed versions, remediation
- [SentinelOne: CVE-2026-16496](https://www.sentinelone.com/vulnerability-database/cve-2026-16496/), the NVD publication date of July 28, 2026
