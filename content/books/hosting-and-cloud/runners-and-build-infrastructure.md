+++
title = "Runners & Build Infrastructure"
description = "Hosted, hybrid and self-hosted runners, ephemeral VMs and microVMs, autoscaling, macOS fleets, caches, remote execution and the faster-runner vendors."
category = "Hosting & Cloud Industry"
order = 2144
part = "CI/CD Platforms"
tags = ["ci", "runners", "build-infrastructure", "microvms", "macos", "caching"]
+++

A runner is a machine that accepts a stranger's script, runs it with the repository's secrets in its environment, and reports back. That makes CI infrastructure one of the hardest multi-tenant workloads a provider runs: arbitrary code, often as root, needing Docker, a network and credentials, starting thousands of times a minute, finishing in seconds, and expected to leave nothing behind. Every design choice in this chapter is a tradeoff between how fast a job starts, how isolated it is from the last job, and what the machine costs while it waits.

This chapter covers the runner side of CI: hosted, hybrid and self-hosted models; ephemeral runners and why reuse is dangerous; autoscaling on Kubernetes and on VM groups; macOS fleets and Apple's 24-hour lease; containers versus microVMs for isolation; caches; remote build execution; and the vendors selling faster or cheaper runners. It adds `runners` and `ci_runs` to the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Pricing and multipliers are [The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business); pipeline rules (caching keys, least privilege, fork secrets) are the playbook's [CI & Continuous Deployment](/docs/delivery/ci-pipelines#fast); attacks through runners are [Pipeline Supply-Chain Security](/books/hosting-and-cloud/pipeline-supply-chain-security); microVMs as a compute layer are [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms).

## How the Providers Do It

| Provider | Hosted runners | Self-hosted model | Autoscaling | Isolation of hosted jobs |
| --- | --- | --- | --- | --- |
| **GitHub Actions** | Linux, Windows, macOS, arm64, GPU and larger sizes | Runner agent registered to a repository, organization or enterprise, selected by labels; free as of October 2026 | Actions Runner Controller (ARC) on Kubernetes with runner scale sets | A fresh VM per job (Linux, macOS and Windows runners, containers or VMs) |
| **GitLab** | Instance runners on Linux, Windows and macOS | GitLab Runner, an open-source Go agent, with executors | Fleeting plugins over AWS, Google and Azure instance groups for the Docker Autoscaler and Instance executors | Vendor-managed |
| **CircleCI** | Resource classes priced in credits, including Linux, Arm and Docker | Self-hosted runners, no per-minute charge, concurrency capped by plan | The customer's, for self-hosted runners | Vendor-managed |
| **Buildkite** | The hybrid model is the product | Customer-run agents against a SaaS control plane: "source code and secrets, stays in your environment" | Customer's autoscaling (cloud stacks, Kubernetes) | The customer's choice |
| **Azure Pipelines** | Microsoft-hosted agents on Linux, macOS and Windows | Self-hosted agents, priced per parallel job | The customer's, for self-hosted agents | Vendor-managed |
| **AWS CodeBuild** | Container-based build environments, Lambda compute, reserved capacity, Mac reserved capacity | Not applicable | Managed by the service | "A fresh, isolated, container-based environment" per build at launch |
| **Third-party runner vendors** (Depot, Blacksmith, Namespace, Ubicloud, WarpBuild, Actuated) | Faster or cheaper machines registered to GitHub as self-hosted runners | Some offer bring-your-own-cloud | Warm pools | VMs or microVMs |

Four patterns run through the table. **The control plane is SaaS even when the machine isn't:** every vendor separates orchestration, logs, status and secrets from the compute that runs the job, which is the hybrid model Buildkite sells explicitly. **Ephemeral is the default for hosted:** a job gets a machine nobody used before and nobody uses after. **Labels are the scheduler's interface:** jobs ask for `linux`, `arm64`, `gpu`, and the control plane matches them to runners that advertise them. **Third-party runners plug in as self-hosted,** which ties their business to the code host's terms for self-hosted runners.

## Hosted, Hybrid and Self-Hosted

**Hosted** runners are the vendor's machines, metered per minute, with images maintained by the vendor (toolchains, browsers, Docker). The customer gets zero operations and the vendor's network position; the cost is price per minute, the vendor's choice of hardware, and no access to private networks without extra plumbing.

**Self-hosted** runners are the customer's machines running the vendor's agent, which polls the control plane for jobs. The customer gets its own hardware (GPUs, large memory, Apple silicon), its own network (private databases, on-premises systems) and its own cost; the cost is operations and isolation, which are now the customer's problem, and a runner that persists between jobs is a place one job can leave something for the next. Hosted revenue pays for the control plane both kinds use, which is why GitHub announced, then postponed, a per-minute fee on self-hosted use ([The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#github-s-2026-change-and-the-self-hosted-fee)).

**Hybrid** is the self-hosted model sold as the product: Buildkite runs orchestration, the UI, APIs and webhooks, and customers run agents that do the work, so source code and secrets stay in the customer's environment.

## Ephemeral Runners and Autoscaling

A persistent runner is a shared machine between jobs from different branches, pull requests and sometimes repositories. Anything a job writes (a modified toolchain, a poisoned cache, a credential in a file, a background process) is there for the next job. Ephemeral runners remove the problem by construction: one job per runner, then the runner is destroyed.

**Actions Runner Controller** is the Kubernetes version. Started as a community project under Apache-2.0 in 2019, it became a GitHub project in December 2022; GitHub's runner scale sets mode entered public beta on May 10, 2023, and GitHub now supports only that Autoscaling Runner Sets version. A runner scale set is scoped to a repository, organization or enterprise; a listener pod long-polls GitHub for jobs and asks Kubernetes to create runner pods to match; each runner is ephemeral, starting clean and deleted after its job. The legacy `actions.summerwind.net` API is still listed for older installations.

**GitLab Runner autoscaling** uses Fleeting, "a plugin-based abstraction for a cloud provider's instance groups" (AWS Auto Scaling groups, Google instance groups, Azure uniform VM scale sets), driven by the Docker Autoscaler and Instance executors. It replaces the Docker Machine executor, deprecated in GitLab 17.5 with removal planned for GitLab 20.0 in May 2027.

The provider-side tradeoff is warm capacity. A runner that boots on demand costs nothing while idle and adds its boot time to every job; a warm pool starts jobs in seconds and bills for the idle machines. Every fast-start claim in this market is a warm pool somebody pays for.

## Containers or MicroVMs

Many self-hosted fleets run jobs in containers on shared hosts, and CI jobs want Docker. The two usual answers are both bad for isolation: mounting the host's Docker socket makes it easy to become root on the host, and Docker-in-Docker needs a privileged container, which is root on the host. Actuated (November 10, 2022) made that case for running each job in a Firecracker microVM instead; Hostinger's open-source Fireactions runs GitHub runners in Firecracker microVMs on bring-your-own metal, each "created from scratch and destroyed after the job"; BuildBuddy runs remote actions inside Firecracker microVMs so they can use Docker; Ubicloud's runners use KVM virtual machines. The isolation hierarchy and its density costs are [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms#the-isolation-ladder); for CI the rule is that a job that can run Docker needs a VM boundary, not a container one, if the next job belongs to someone else. The playbook's [Running Them Safely](/docs/delivery/containers#running-them-safely) applies to the jobs' own containers.

## macOS Fleets

Apple builds are the expensive corner. Since macOS Big Sur (November 2020), Apple's license allows leasing Apple hardware for developer services only for a minimum of 24 consecutive hours, the whole machine to one lessee, with virtual machines permitted and the lessor responsible for compliance. AWS's Mac instances implement it: bare metal on Dedicated Hosts with a 24-hour minimum allocation before release, one instance per host, On-Demand only (Savings Plans allowed, no Spot or Reserved Instances), launch in about 6 to 20 minutes, and the host scrubbed on stop or terminate; hardware runs from 2018 Intel minis to M4 Pro. GitHub's self-hosted runners have supported Apple silicon since August 9, 2022.

The economics follow. A Mac is held for at least a day, runs one or a few VMs, and is idle whenever no Apple job is waiting, so a provider's macOS minute carries the cost of its idle hours. That is why hosted macOS is priced at six to twelve times Linux across vendors, and why the efficient fleet sizes Macs to the daily peak and keeps them busy with queue discipline rather than scaling to zero.

## Caches

Caches make CI fast and are a shared-state problem on a provider's storage. GitHub's dependency cache is 10 GB per repository free, retained seven days after last access with least-recently-used eviction, larger on paid plans since November 20, 2025 at $0.07 per GB-month beyond the 10 GB, and read-only when a budget is hit. Third parties price it as storage: Namespace bills Bazel cache hits at $0.10 per 1,000 and content-addressed storage at $0.20 per GB-month, and Depot's cache and registry storage is $0.20 per GB-month (as of October 2026). The playbook's [Fast](/docs/delivery/ci-pipelines#fast) section owns cache keys; the provider's concerns are scope (a pull request from a fork must not write a cache the main branch reads), eviction, and metering by peak or average size.

## Remote Build Execution

Bazel's remote execution distributes build and test actions across many machines over an open gRPC protocol (the Remote Execution API) used for both remote execution and remote caching: an action is hashed with its inputs, a cache hit returns the outputs without running anything, and a miss runs on a worker. It turns a CI job from "one big machine for twenty minutes" into "thousands of small actions, mostly cached." Commercial services listed by the Bazel project include Aspect Build, Bitrise, BuildBuddy, EngFlow, Hermetiq and NativeLink; self-hosted options include Buildbarn, Buildfarm, BuildGrid and NativeLink. It needs a hermetic build to be correct, which is also what supply-chain provenance wants.

## The Faster-Runner Vendors

A category of vendors sells GitHub-compatible runners on faster or cheaper hardware. Prices as of October 2026; every speed or savings claim is the vendor's own marketing:

| Vendor | Pricing | Notes |
| --- | --- | --- |
| **Depot** | Plans from $20 a month; Actions runners $0.006 a minute for 2 vCPU; container builds $0.04 a minute (16 vCPU); storage $0.20 per GB-month | Business tier can deploy in the customer's AWS account |
| **Blacksmith** | Ubuntu x64 $0.004 a minute, Arm $0.0025, Windows $0.008, macOS M4 $0.08; 3,000 free minutes a month | Claims about 2x faster hardware |
| **Namespace** | Unit minute of 1 vCPU and 2 GB; multipliers Linux 1x, Windows 2x, Linux on Apple silicon 7x, macOS 10x; Team $100 a month for 100,000 unit minutes | Also Docker builds and Bazel cache |
| **Ubicloud** | Roughly $0.0010 to $0.0020 a minute by tier; 1,250 free minutes a month | Open-source cloud; KVM isolation |
| **WarpBuild** | Linux x64 from $0.004 a minute (2 vCPU), arm64 $0.003, macOS M4 Pro $0.08; bring-your-own-cloud $0.002 a minute | Claims warm pools starting in under 10 seconds |

Two facts bound the category. GitHub's 2026 price cut, to $0.006 for a 2-core Linux minute, narrowed the gap many of these vendors' savings tables still quote against the old $0.008. And because these runners register as self-hosted, the postponed $0.002 self-hosted fee would have applied to them on private repositories too.

## The Alternatives

| Option | Model | Strengths | Failure modes | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Code host's hosted runners** | Fresh vendor VM per job | No operations; strong isolation | Per-minute price; no private network by default | Per minute | Most teams |
| **Self-hosted, persistent** | Long-lived machines running the agent | Warm caches; private network; cheap | Cross-job contamination; patching | Hardware | Small fleets, internal repositories |
| **Self-hosted, ephemeral on Kubernetes** (ARC, GitLab Kubernetes executor) | A pod per job on a cluster | Autoscaling, clean start | Container isolation only; Docker needs privilege | Cluster cost | Teams already running Kubernetes |
| **Self-hosted, ephemeral VMs or microVMs** (GitLab Fleeting, Fireactions, Actuated) | A VM per job | VM boundary; Docker safely | Boot time unless warm pools | Hardware or cloud VMs | Security-sensitive fleets |
| **Third-party runners** | Vendor machines registered as self-hosted | Cheaper or faster minutes | Another vendor with your secrets; code host's self-hosted terms | Per minute | Cost-sensitive teams on GitHub |
| **Remote execution** (Bazel REAPI services) | Actions distributed and cached | Massive parallelism; cache hits skip work | Needs hermetic builds; migration cost | Per action or capacity | Large monorepos |

## My Default

My default destination is my own ephemeral runners: one job per VM or microVM, autoscaled from a small warm pool, in a network segment that can reach only what builds need. I start on GitHub's hosted runners and move when private-repository minutes cost too much ([The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#my-default)); on GitHub the move changes only `runs-on`, which selects self-hosted runners by the default `self-hosted` label plus OS and architecture labels, all of which a runner must carry. The safety rules don't move: anything that touches untrusted code (every public repository and every pull request from a fork) stays on hosted runners, ephemeral by construction, and I wouldn't run persistent self-hosted runners for public repositories at all. A [third-party runner vendor](#the-faster-runner-vendors) is the option when I want cheaper minutes without operating machines; it keeps GitHub as the orchestrator, self-hosted terms included. For macOS I'd size a fleet to the daily peak and accept the 24-hour floor rather than fight it.

The next step is an orchestrator that reads the same workflow files: Gitea Actions with `act_runner`, or Forgejo Actions with Forgejo Runner, with nektos/act (MIT) running the same workflows locally in Docker containers. Both forges document the gaps, as of October 2026. Gitea ignores `jobs.<job_id>.environment`, problem matchers and error annotations, doesn't support GitHub-only token scopes such as `id-token`, and its job token can't publish to the repository's package registry. Forgejo calls its Actions "designed to be familiar to users of GitHub Actions, but it is not designed to be compatible": a different default environment (most runners use a Debian image with just Node.js), missing `github` context keys, ignored job keys such as `permissions` and `continue-on-error`, and `enable-openid-connect` in place of `permissions: id-token: write`. So I keep workflows to the common subset, keep environment protections from being the only gate, and run them under the target orchestrator before I need to move.

What would change this: a monorepo where remote execution and a shared cache dominate build time, which moves the investment from runners to a hermetic build; or a regulated boundary that keeps source on owned hardware.

## How to Build It

Runners and runs extend [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model): a run belongs to a `ci_pipeline` resource ([The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#how-to-build-it)), executes on a runner, and emits the usage event that rating prices. A hosted runner's VM is a provider-internal `virtual_machine` resource owned by the provider's own account, not the customer's.

```sql
CREATE TABLE runners (                   -- an agent that can take jobs
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),   -- the provider's own account for hosted
  scope_kind      TEXT NOT NULL CHECK (scope_kind IN ('hosted_pool', 'account', 'project',
                    'pipeline')),
  scope_id        UUID,                  -- the project or pipeline resource; null for a hosted pool
  hosting         TEXT NOT NULL CHECK (hosting IN ('hosted', 'self_hosted', 'third_party')),
  machine_type    TEXT REFERENCES ci_machine_types (code),  -- hosted only
  os              TEXT NOT NULL CHECK (os IN ('linux', 'windows', 'macos')),
  arch            TEXT NOT NULL CHECK (arch IN ('x64', 'arm64')),
  labels          TEXT[] NOT NULL,
  isolation       TEXT NOT NULL CHECK (isolation IN ('vm', 'microvm', 'container', 'bare_host')),
  ephemeral       BOOLEAN NOT NULL,      -- destroyed after one job
  registration_credential_id UUID REFERENCES api_credentials (id),  -- short-lived, for self-hosted
  agent_version   TEXT,
  state           TEXT NOT NULL CHECK (state IN ('registering', 'idle', 'busy', 'offline',
                    'draining', 'removed')),
  last_seen_at    TIMESTAMPTZ,
  registered_during TSTZRANGE NOT NULL,
  CHECK (hosting <> 'hosted' OR (machine_type IS NOT NULL AND ephemeral))
);

CREATE TABLE ci_runs (                   -- one job attempt on one runner
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),   -- the customer
  pipeline_id     UUID NOT NULL REFERENCES resources (id),  -- kind = 'ci_pipeline'
  workflow_run_ref TEXT NOT NULL,        -- the pipeline run this job belongs to
  job_name        TEXT NOT NULL,
  attempt         SMALLINT NOT NULL DEFAULT 1,
  trigger         TEXT NOT NULL CHECK (trigger IN ('push', 'pull_request', 'pull_request_fork',
                    'schedule', 'manual', 'api', 'tag')),
  commit_sha      TEXT NOT NULL,
  git_ref         TEXT NOT NULL,
  requested_labels TEXT[] NOT NULL,
  runner_id       UUID REFERENCES runners (id),             -- null while queued
  secrets_exposed BOOLEAN NOT NULL,      -- false for fork pull requests
  queued_at       TIMESTAMPTZ NOT NULL,
  run_during      TSTZRANGE,             -- from start to finish on the runner
  conclusion      TEXT CHECK (conclusion IN ('success', 'failure', 'canceled', 'timed_out',
                    'skipped', 'infrastructure_error')),
  billable_seconds INT,                  -- rounding and factors applied in rating, not here
  usage_event_id  UUID REFERENCES usage_events (id),
  UNIQUE (pipeline_id, workflow_run_ref, job_name, attempt),
  CHECK (trigger <> 'pull_request_fork' OR NOT secrets_exposed)
);
```

`deployments.ci_run_id` in [Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#how-to-build-it) points here, so a production deployment traces to the job that built it, the runner it ran on and that runner's isolation. Queue time is the metric customers feel and providers size warm pools by:

```sql
-- p95 queue time by requested label set and hour, for warm pool sizing.
SELECT requested_labels, date_trunc('hour', queued_at) AS hour,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY lower(run_during) - queued_at) AS p95_wait
FROM ci_runs
WHERE run_during IS NOT NULL AND queued_at >= NOW() - INTERVAL '7 days'
GROUP BY 1, 2
ORDER BY 2, 1;
```

## Auditing

- **Every run with its runner, isolation level and whether secrets were exposed,** so a leaked secret can be traced to the jobs that could have read it.
- **Runner registrations and removals,** with the credential used, because a rogue self-hosted runner registered to a repository is an attack (Shai-Hulud 2.0 registered one; [Pipeline Supply-Chain Security](/books/hosting-and-cloud/pipeline-supply-chain-security#how-the-providers-do-it)).
- **Persistent runners that took jobs from more than one trust level** (forks and the main branch), as a finding to fix.
- **Cache writes by ref,** so a poisoned cache can be found and purged.

## What This Means for the System You Build

- **Destroy runners after one job** whenever the code is untrusted.
- **Give Docker a VM boundary,** never the host's socket or a privileged container, on shared hosts.
- **Keep the control plane separate from compute,** and meter it, since self-hosted jobs use it too.
- **Size warm pools from queue time,** and say that fast starts are paid-for idle capacity.
- **Plan macOS around the 24-hour lease:** fleet to the daily peak, not to zero.
- **Scope caches by trust:** fork pull requests read, never write, what the main branch uses.
- **Treat runner registration as a privileged act** with short-lived credentials and an audit trail.

## References

**Documentation**

- [Buildkite: Architecture](https://buildkite.com/docs/pipelines/architecture), the SaaS control plane and customer-run agents
- [GitHub Docs: Actions Runner Controller](https://docs.github.com/en/actions/concepts/runners/actions-runner-controller), scale sets, the listener, ephemeral runners and the upstream credit
- [GitHub Docs: Support for Actions Runner Controller](https://docs.github.com/en/enterprise-cloud@latest/actions/concepts/runners/support-for-actions-runner-controller), only the Autoscaling Runner Sets version supported
- [GitHub Changelog: Actions Runner Controller public beta](https://github.blog/changelog/2023-05-10-github-actions-actions-runner-controller-public-beta/), May 10, 2023
- [GitHub Sponsors: actions-runner-controller](https://github.com/sponsors/actions-runner-controller), becoming a GitHub project in December 2022
- [GitHub Docs: Using self-hosted runners in a workflow](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/use-in-a-workflow), the `self-hosted` default label and cumulative label matching in `runs-on`
- [Gitea Docs: Compared to GitHub Actions](https://docs.gitea.com/usage/actions/comparison), ignored keys, unsupported token scopes and the package registry limit
- [Forgejo Docs: GitHub Actions](https://forgejo.org/docs/latest/user/actions/github-actions/), the known list of differences from GitHub Actions
- [Forgejo Docs: Forgejo Actions administrator guide](https://forgejo.org/docs/latest/admin/actions/), Forgejo Runner as the agent
- [GitHub: nektos/act](https://github.com/nektos/act), running GitHub Actions workflows locally in Docker, MIT license
- [GitHub Changelog: Self-hosted runners support Apple silicon](https://github.blog/changelog/2022-08-09-github-actions-self-hosted-runners-now-support-apple-m1-hardware), August 9, 2022
- [GitHub Changelog: Cache size can now exceed 10 GB](https://github.blog/changelog/2025-11-20-github-actions-cache-size-can-now-exceed-10-gb-per-repository/), November 20, 2025
- [GitHub Docs source: GitHub Actions billing](https://github.com/github/docs/blob/main/content/billing/concepts/product-billing/github-actions.md), $0.07 per GB-month for Actions cache beyond the included 10 GB
- [GitLab Docs: Fleeting](https://docs.gitlab.com/runner/fleet_scaling/fleeting/), the plugin abstraction over instance groups
- [GitLab: Docker Machine executor deprecation](https://gitlab.com/gitlab-org/gitlab/-/issues/498268), deprecated in 17.5, removal planned for 20.0
- [AWS: Amazon EC2 Mac instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-mac-instances.html), Dedicated Hosts, the 24-hour minimum, purchase options, launch time, scrubbing and hardware
- [AWS News Blog: AWS CodeBuild](https://aws.amazon.com/blogs/aws/aws-codebuild-fully-managed-build-service/), fresh container per build at launch
- [Bazel: Remote execution](https://bazel.build/remote/rbe), distributing actions over the Remote Execution API
- [Bazel: Remote execution services](https://bazel.build/community/remote-execution-services), commercial and self-service implementations
- [BuildBuddy: Firecracker microVMs for remote execution](https://www.buildbuddy.io/docs/rbe-microvms), Docker inside microVM actions

**Vendors and pricing** (as of October 2026; speed claims are the vendors')

- [Alex Ellis: Blazing fast CI with microVMs](https://blog.alexellis.io/blazing-fast-ci-with-microvms/), November 10, 2022, the Docker socket and Docker-in-Docker problems
- [Hostinger: Fireactions](https://www.hostinger.com/blog/fireactions/), Firecracker runners on bring-your-own metal
- [GitHub: hostinger/fireactions](https://github.com/hostinger/fireactions), Apache-2.0 source
- [Depot: Pricing](https://depot.dev/pricing)
- [Blacksmith: Pricing](https://www.blacksmith.sh/pricing)
- [Namespace: Pricing](https://namespace.so/pricing)
- [Ubicloud: GitHub Actions](https://www.ubicloud.com/use-cases/github-actions)
- [WarpBuild: Pricing](https://www.warpbuild.com/pricing)

**Licensing**

- [9to5Mac: macOS Big Sur adds leasing terms](https://9to5mac.com/2020/11/11/macos-big-sur-adds-leasing-terms-that-pull-hosting-services-like-macstadium-out-of-a-legal-gray-area/), the 24-hour minimum lease, whole-machine leasing and lessor responsibility
