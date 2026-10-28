+++
title = "Convergence: CFEngine to Puppet"
nav_title = "CFEngine to Puppet"
description = "Desired state and convergence: CFEngine's promises and pull agents, Puppet's facts, catalogs, RAL and PuppetDB, and the Perforce and OpenVox split."
category = "Hosting & Cloud Industry"
order = 2140
part = "Infrastructure as Code"
tags = ["infrastructure-as-code", "configuration-management", "cfengine", "puppet", "openvox", "convergence"]
+++

A server that is set up by hand starts drifting the day after it's built. A package is upgraded to fix one bug, a config file is edited during an incident, a cron job is added for a vendor, and after a year nobody can say what's on the machine or build another like it. A provider with ten thousand servers, or a customer with three hundred VMs, can't fix that one login at a time. Configuration management was the first answer: write down what every machine should look like, put an agent on each one, and let the agent compare the machine to the description and repair the difference, over and over, forever. The machine **converges** on the declared state, and an agent that finds nothing to fix does nothing.

This chapter owns that idea and the vocabulary the rest of the part reuses: desired state, idempotence, convergence, the pull agent and its interval, fact gathering, and where the desired state is compiled. It tells the story through the two tools that defined the pull model, CFEngine (begun in 1993) and Puppet (2005), and through what happened when Puppet's owner moved its binaries behind a license in 2025. [Chef](/books/hosting-and-cloud/chef) and [Push & Events: Ansible and Salt](/books/hosting-and-cloud/ansible-and-salt) build on it; [Baking Images: Packer](/books/hosting-and-cloud/packer-and-images) and [Provisioning: Terraform, OpenTofu & the Alternatives](/books/hosting-and-cloud/terraform-and-opentofu) cover the approaches that shrank its job. The general rules (declare instead of scripting, review the plan, rebuild rather than repair) are the playbook's [Infrastructure as Code](/docs/delivery/infrastructure-as-code#declarative-beats-imperative) and [Rebuild, Don't Repair](/docs/delivery/containers#rebuild-don-t-repair); this chapter covers how convergence tools work and what a provider builds around them.

## How the Providers Do It

Convergence is sold three ways: as software a customer runs (open source or licensed per node), as a managed configuration server a cloud runs for the customer, and as an agent on the VM that the cloud's own control plane drives. The clouds have tried and retired the second model. As of October 2026:

| Offering | Owner | Model | Cadence | Status |
| --- | --- | --- | --- | --- |
| **CFEngine** (Community, Enterprise) | Northern.tech | Agent on every host pulls policy from a policy server and converges itself | Every 5 minutes in the default policy | Community edition GPLv3; 3.28.0 tagged July 9, 2026, 3.27.3 October 16, 2026 |
| **Puppet Core, Puppet Enterprise** | Perforce | Agent sends facts, server compiles a catalog, agent applies it | Every 30 minutes by default | Source Apache 2.0; new binaries under a commercial license, free up to 25 nodes; Puppet Core 9.1.0 current |
| **OpenVox** | Vox Pupuli (community) | Soft fork of Puppet, same model | Same as Puppet | Apache 2.0; 9.2.1 released October 23, 2026, 8.31.1 October 21, 2026 |
| **Chef Infra** | Progress | Agent pulls cookbooks and compiles on the node | See [the Chef run](/books/hosting-and-cloud/chef#the-chef-run) | See [Chef](/books/hosting-and-cloud/chef#licensing-chef-360-and-cinc) |
| **Ansible, Salt** | Red Hat (IBM); Broadcom | Push over SSH; master and minions on an event bus | On demand, scheduled or on events | See [Ansible and Salt](/books/hosting-and-cloud/ansible-and-salt#how-the-providers-do-it) |
| **AWS OpsWorks for Puppet Enterprise, OpsWorks Stacks** | AWS | A managed Puppet Enterprise server; managed application stacks | The tool's own | Ended: Puppet Enterprise after March 31, 2024; Stacks on May 26, 2024 |
| **AWS Systems Manager State Manager** | AWS | An association applies an SSM document (for example `AWS-ApplyAnsiblePlaybooks`) to tagged nodes on a schedule | A cron or rate expression per association | Available; reports association compliance |
| **Azure Automation State Configuration** | Microsoft | Built-in PowerShell DSC pull server; nodes pull configurations and report compliance | The node's DSC settings | Retiring September 30, 2027; Linux DSC already retired September 30, 2023 |
| **Azure Machine Configuration** | Microsoft | Configurations assigned through Azure Policy to Azure and Arc-enabled machines | Evaluated by the machine's agent | Modes: Audit, Apply and Monitor, Apply and Autocorrect |
| **Google Cloud VM Manager OS policies** | Google | OS policy assignments target VMs by labels, OS and zone; the OS Config agent enforces | "The time interval between each enforcement check is 60 minutes" | Available; rollouts paced by wave size and wait time |

Two patterns stand out. The managed configuration server didn't last: AWS ended OpsWorks for Puppet Enterprise and OpsWorks Stacks in 2024, and Microsoft is retiring its hosted DSC pull server in favor of policy-driven Machine Configuration. What survives at the clouds is an agent on the VM, a desired state held in the cloud's control plane (an association, a policy assignment, an OS policy), and a compliance report per machine. And the cadence is always the same shape: a fixed interval, a splay or wave so a fleet doesn't all run at once, and a report of what was already right, what was repaired and what failed. That report is the record this chapter's [How to Build It](#how-to-build-it) stores.

## The Convergence Vocabulary

Every tool in this part uses its own nouns. These are the book's:

- **Desired state.** A description of what a machine should be (packages installed, files with given content and modes, services running, users present), not the steps to get there. CFEngine calls the statements promises, Puppet calls them resources in a catalog, Chef resources in a run list, Salt states, Ansible tasks in a play.
- **Resource.** One managed thing on one machine: a file, a package, a service, a user. Each has a type, an identity unique on the host, and the properties that matter.
- **Idempotence.** Applying the same desired state twice changes nothing the second time. It is a property each resource implementation has to earn: it must read the current state, compare it with the desired state, and act only on the difference.
- **Convergence.** Repeated runs move a machine toward the desired state and then hold it there. A run that finds every resource correct reports **unchanged**; one that repairs something reports **changed**; one that can't reports **failed**. A changed run with no change to the desired state is **drift**, corrected.
- **Pull agent and run interval.** A daemon on each machine that fetches its desired state and applies it on a timer (five minutes for CFEngine's default policy, thirty for Puppet), with **splay**, a per-host delay, so a fleet doesn't hit the server in the same second.
- **Fact gathering.** Before deciding anything, the agent inventories the machine: OS, kernel, addresses, hardware, custom values. Puppet's facts come from Facter, Ansible gathers facts, Salt has grains, CFEngine has classes. Facts select which desired state applies.
- **Compile versus converge.** Desired state is written in a language with variables, conditionals and lookups, then compiled into a concrete list of resources for one machine, then converged. Where the compile happens is the biggest architectural difference between the tools: Puppet compiles on the server, Chef and CFEngine evaluate on the node, Ansible on the control node that pushes.
- **Dry run.** A run that reports what it would change and changes nothing: Puppet's noop, Ansible's check mode, Salt's `test=True`.
- **Report.** What a run did: per resource, the previous and new values, success or failure, and timing. Reports are the evidence of convergence and the input to compliance.

The [playbook's argument](/docs/delivery/infrastructure-as-code#declarative-beats-imperative) for declarative over imperative applies here, with one difference from provisioning tools: a convergence tool has no plan and no state file. It compares desired state with the live machine on every run, so the machine itself is the state, and the report is the closest thing to a plan.

## CFEngine: Convergence Begins

CFEngine began as "a continuing research project, started in 1993, to help solve the problems of system administration in a big network," in the words of its GNU project page. Mark Burgess wrote it to replace the growing pile of shell scripts that configured heterogeneous Unix workstations: "a declarative language, so that the transparency of a configuration program is optimal and management and implementation are kept separate." Each host runs CFEngine, parses one policy describing the setup of every host on the network, and "the configuration of the host is checked against this model and, if necessary, any deviations are fixed." Hosts are grouped into classes, so one policy can describe many kinds of machine without the `if...then...else` clutter the page complains about in scripts.

Burgess's "Computer Immunology" paper at USENIX LISA '98 (Boston, December 1998), written while he was associate professor of physics and computer science at Oslo College, framed the idea as an immune system for computers. It described CFEngine as a "much higher level descriptive language" that examines the system and switches on predefined responses to correct problems, and said that once the system reaches the described state, CFEngine "becomes inert." That is convergence in its first public statement: a tool that does nothing when nothing is wrong, and so can be run as often as you like.

Burgess then formalized the model. Promise theory, which Network World dates to Burgess in 2004, describes systems as autonomous agents that can only promise their own behavior, cooperating voluntarily rather than obeying commands. CFEngine 3 incorporates it; its `3.0.0` tag in the `cfengine/core` repository is dated December 31, 2008. CFEngine is written in C, licensed to the community under the GPLv3 (with an option of the Commercial Open Source License for the enterprise product), and made by Northern.tech, which also makes the Mender over-the-air update system.

### How CFEngine Works

"Everything in CFEngine 3 can be interpreted as a promise." A **promise** has a **promiser**, the object it affects ("a file, a port on a network"), and optionally **promisees**, the stakeholders it is made to. Promises are grouped into **bundles**, reusable sub-sets of promises, and their complex attribute sets live in **bodies**, reusable blocks. When a promise is evaluated and found **kept** or **repaired**, it is locked for a period so repeated runs don't re-evaluate it; the agent's `ifelapsed` setting (default 1) sets that period.

The daemons divide the loop:

| Component | Role |
| --- | --- |
| `cf-agent` | "Evaluates policy code and makes changes to the system"; promise types run in a preset order "to ensure fast system convergence to policy" |
| `cf-execd` | The scheduler: runs `cf-agent` locally on the executor schedule, collects its output, and emails it only when it differs from the previous run; full transcripts are kept under `WORKDIR/outputs/` |
| `cf-serverd` | A listening daemon with two services: serving files for remote copy (agents connect to it for updated policy) and letting an authorized `cf-runagent` trigger a run; "the default server behavior is to grant no access to anything" |
| `cf-runagent` | Asks remote hosts' `cf-serverd` to start a run now |
| `cf-hub` | Enterprise only; host licenses are counted by when each host was last seen |

The **Masterfiles Policy Framework** (MPF), the default policy CFEngine ships, sets the executor schedule to twelve classes, `Min00` through `Min55`: an agent run every five minutes. `cf-execd` delays each run by a splay derived from a hash of the host name, so the fleet spreads out, and the docs advise keeping splay plus run time under the interval. The documented `exec_command` runs the `update.cf` policy first, which fetches new policy from the server, and then the main policy. Because policy is a set of local files, a host that can't reach the server keeps converging on the last copy it has.

Note what `cf-runagent` is not. It doesn't push configuration; it asks a host's `cf-serverd` to run its own agent, which still pulls policy and decides for itself. That is promise theory in the protocol: a server can't impose state on an autonomous host, only offer policy the host has promised to fetch.

## Puppet: Catalogs and the Resource Abstraction Layer

Luke Kanies wrote Puppet's first prototype in the summer of 2004 and made it a full-time focus in February 2005. His chapter in *The Architecture of Open Source Applications* says it was "most influenced by CFEngine," took its focus on explicit dependencies from ISconf (which used `make` for all its work), and was a response to BladeLogic and Opsware, commercial tools sold to executives rather than system administrators. Its first commit in the public repository, imported from Reductive Labs' Subversion, is dated April 13, 2005; by July 2010 the company was "Puppet Labs, formerly known as Reductive Labs." PuppetDB followed, its `0.9.0` tag dated May 16, 2012. Perforce agreed to buy Puppet on April 11, 2022, with terms undisclosed, and completed the acquisition on May 18, 2022.

### The Puppet Run

A Puppet run separates deciding from doing, across two machines:

1. **Facts.** The agent runs Facter, "a very simple tool used to discover information about the host it is running on," extensible with custom facts, and sends the facts to the server. At the start of each run the agent also downloads the plugins the server has: resource types, providers, custom facts.
2. **Classification.** The server decides which classes the node gets: from node definitions in Puppet code or from an **External Node Classifier**, a program that "accepts the host name and returns a simple data structure" of classes and parameters (Foreman and Puppet Dashboard are examples). The AOSA authors recommend the ENC, because classifying hosts is a different job from configuring them.
3. **Compilation.** The server compiles the node's manifests, with data from Hiera, into a **catalog**: a graph of resources and their relationships, "plain data" that serializes to JSON. Agents receive their own catalog, not the code that produced it, so "each host only knows exactly what it needs to know," and the right to compile can be separated from the right to apply.
4. **The transaction.** The agent converts the catalog into a dependency graph, sorts it topologically, and for each resource retrieves its current state, compares it with the desired state, and has the provider fix the difference. Transactions aren't atomic: a failure halfway leaves the resources before it changed.
5. **The report.** Every change becomes an event with the time, the previous value, the new value, and whether it succeeded or was simulated; the report goes back to the server, and to PuppetDB.

The agent's defaults, from Puppet's settings source: `runinterval` is `30m` ("How often puppet agent applies the catalog"; 0 means run continuously), `splay` is false and `splaylimit` defaults to the run interval, `usecacheonfailure` is true (apply the cached catalog when the new one won't compile), `runtimeout` is `1h`, `report` is true, and the default environment is `production`. The cached catalog is what makes a Puppet fleet survive a server outage: agents keep converging on what they last received.

Ordering is explicit. Without relationships, resources apply in manifest order; four metaparameters change that: `before` and `require` order two resources, `notify` and `subscribe` also make the later one **refresh** when the earlier one changes (the classic case is a service restarting when its config file changes). The chaining arrows `->` and `~>` say the same in code. A resource "refreshes only once" per run however many events it receives.

### The Resource Abstraction Layer

The **Resource Abstraction Layer** splits each resource into a **type**, which names the resource and its properties, and **providers**, which implement getters and setters for one platform. Puppet supports "more than 30 kinds of package management" behind the one `package` type, and "the providers are the only part of Puppet that actually touch the system." Types carry three kinds of attribute: metaparameters (ordering and the like, on every type), parameters (not reflected on disk) and properties (reflected on disk, and compared on every run).

Because "the Transaction owns the decisions, and the provider does the work," Puppet can run a whole catalog without touching anything: **noop**, which the settings describe as a mode that "allows Puppet to partially simulate a normal run." In noop, a resource that would refresh only logs that it would have. `puppet apply`, "the standalone puppet execution tool," compiles and applies manifests locally with no server, which is how Puppet runs inside an image build or a masterless fleet. Its `--detailed-exitcodes` give the run outcomes as numbers: 0 for no changes ("the system was already in the desired state"), 2 for changes, 4 for failures, 6 for both, and 1 when the run itself failed.

### Hiera, Modules and the Forge

**Hiera** stores configuration data as key-value pairs and looks up "data a module needs" during compilation, either by automatic class parameter lookup or explicit lookup calls, following a "defaults, with overrides" hierarchy usually keyed on facts. It reads three layers in order: global (`$confdir/hiera.yaml`, for temporary overrides and legacy backends), environment (each environment's own hierarchy, where most data lives) and module (a module author's defaults, searched last so the environment wins). Data files are YAML, JSON or EYAML, the encrypted variant.

Code is packaged as modules and shared on the **Puppet Forge**, installed with `puppet module install`; sites that deploy code with r10k or Code Manager pin modules in a **Puppetfile** instead, and code management purges anything installed by hand.

### PuppetDB and Exported Resources

**PuppetDB** keeps the latest facts and the latest catalog for every node, and optionally each node's reports for a configurable period, 14 days by default. It runs on PostgreSQL (11 or later; 14 or later recommended for PuppetDB 8) and answers queries across the fleet, which gives a provider an inventory of every node and every resource managed on it.

It also enables **exported resources**, Puppet's answer to cross-node configuration. A node declares a resource with `@@` to "publish the resource for use by other nodes" without managing it itself; another node collects matching exports with `<<| |>>` and manages its copy. The docs' examples are the two every operator writes: every host exports its SSH host key with `@@sshkey` and collects everyone else's, and web servers export `nagios_host` and `nagios_service` resources that the monitoring server collects, so a new server is monitored without anyone editing the monitoring config. The cost is time: a new node appears on the monitor only after its own run publishes the export and the monitor's next run collects it, up to two run intervals later.

## Perforce, Puppet Core and OpenVox

On November 7, 2024 Puppet announced that "in early 2025" new binaries and packages would ship from "a private, hardened, and controlled location." A developer license would give free access "up to 25 nodes," above which a commercial license is required; the source would stay Apache 2.0 "in the same location," but commits to public repositories would slow. The post cited a summer 2024 misconfiguration of some of its GitHub repositories and growing open-source security risk as the reasons. Puppet Core 8.11.0, "Released February 2025," "introduces a new proprietary product, Perforce Puppet Core." Its product page commits to remediating critical vulnerabilities (CVSS 9 to 10) within 14 days and high ones (7 to 8.9) within 30, in Puppet and its third-party dependencies. As of October 2026 the release notes list Puppet Core 9.1.0.

The community forked. By December 2024 contributors were preparing a fork; Perforce "refused to let us use the name quite explicitly," and Antoine Beaupré put the community's view as "We're not forking Puppet; Perforce is forking Puppet." Vox Pupuli, a Puppet community organization, released **OpenVox** 8.11 on January 21, 2025, "functionally equivalent" to Puppet and intended as "a drop-in replacement," a soft fork that would keep downstream compatibility as long as it could, with a proposed standards steering committee alongside Perforce. Two days later Choria, an orchestration system that ships as Puppet modules, said it "will not continue to support the rogue fork of Puppet that Perforce maintains" and would require OpenVox from release 0.31.0. As of October 2026 OpenVox publishes 9.x and 8.x releases under Apache 2.0.

The shape is the one [Chef](/books/hosting-and-cloud/chef#licensing-chef-360-and-cinc) took in 2019: source stays open, the vendor's built binaries need a license, and a community rebuild appears under another name because the trademark stays with the vendor. The wider license wars belong to Open Source & the Clouds; for a convergence fleet the practical question is whose packages the agents install, because that decides who you depend on for security fixes.

## The Alternatives

| Approach | Model | Strengths | Failure modes | License and owner | Cost | Who it suits |
| --- | --- | --- | --- | --- | --- | --- |
| **CFEngine** | Pull; node evaluates its own policy every 5 minutes | Small C agent, short interval, keeps converging when the server is gone | Smaller module ecosystem; promise language is unfamiliar | GPLv3 community, commercial enterprise; Northern.tech | Community free; enterprise licensed per host | Large fleets of long-lived hosts that need tight drift correction |
| **Puppet Core / Enterprise** | Pull; server compiles catalogs every 30 minutes | Catalogs keep code off nodes; RAL; PuppetDB and exported resources; vendor CVE commitments | Compile server is a bottleneck and a single point of control; ordering bugs; dynamic data in Hiera grows opaque | Apache source, commercial binaries; Perforce | Free to 25 nodes, licensed above | Regulated fleets that want a supported vendor |
| **OpenVox** | Same as Puppet | Drop-in for open-source Puppet users; Apache packages | Community-funded security response; fork may diverge | Apache 2.0; Vox Pupuli | Free | Existing Puppet fleets that won't take the EULA |
| **Chef Infra** | Pull; node compiles and converges | Ruby recipes; strong testing tools | Two-phase run surprises; licensing churn | See [Chef](/books/hosting-and-cloud/chef#the-alternatives) | Licensed distributions; Cinc free | Teams that want code over data |
| **Ansible, Salt** | Push over SSH; event bus | No agent (Ansible); reacts in seconds (Salt) | No continuous correction without a scheduler | See [Ansible and Salt](/books/hosting-and-cloud/ansible-and-salt#the-alternatives) | Free core; subscriptions for platforms | Orchestration and changes in order |
| **Cloud-native agents** (State Manager, Machine Configuration, OS policies) | Agent driven by the cloud's control plane | Nothing to host; compliance in the cloud console; tied to cloud identity | One cloud only; thinner resource models; services get retired | Proprietary; the cloud | Mostly included with the VM | Fleets inside one cloud |
| **Baked images, no convergence** | Rebuild and replace | No drift by construction; fast boots | Every change is a rebuild and a rollout; needs replaceable machines | Packer and image builders | Build minutes and image storage | Stateless fleets behind load balancers ([Baking Images](/books/hosting-and-cloud/packer-and-images#baking-vs-frying)) |

## My Default

My default for a new fleet is not to start with a pull agent. Build the machine from a baked image, declare the infrastructure around it with a provisioning tool, and replace machines rather than repair them, so drift has nowhere to accumulate ([Rebuild, Don't Repair](/docs/delivery/containers#rebuild-don-t-repair)). Convergence earns its place for the machines that can't be replaced on every change: bare-metal hosts, hypervisors, stateful database servers, a shared hosting fleet with customer data on local disks, and customer-owned machines a provider manages but doesn't own.

For those, I'd pick OpenVox for a fleet that already speaks Puppet and doesn't want a per-node license, Puppet Core where an auditor wants a vendor's vulnerability commitments in writing, and CFEngine where a five-minute correction window and a small agent matter more than the module ecosystem. Inside a single cloud, I'd use its agent (State Manager, Machine Configuration or OS policies) before running my own server, accepting that the cloud may retire it as it retired OpsWorks. Whatever runs, every run's report goes into one table, so drift and failures are visible across tools.

What would change this: a fleet that can't tolerate any machine replacement (I'd lean harder on convergence and shorten the interval), or one that is fully stateless (I'd drop convergence entirely and spend the effort on the image pipeline).

## How to Build It

A provider meets convergence in two places: in its own fleet (hypervisors, storage nodes, hosting servers), and as a product, a managed configuration service or a compliance view over customers' VMs. Both need the same record: one row per run against one machine. This chapter owns `convergence_runs`; [Chef](/books/hosting-and-cloud/chef#how-to-build-it) and [Ansible and Salt](/books/hosting-and-cloud/ansible-and-salt#how-to-build-it) write to it. The machine is a row in [the core data model's](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) `resources` table, of kind `server` or `virtual_machine`.

```sql
CREATE TABLE convergence_runs (          -- one agent or push run against one machine
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),   -- the tenant, as everywhere
  resource_id        UUID NOT NULL REFERENCES resources (id),  -- kind 'server' or 'virtual_machine'
  tool               TEXT NOT NULL CHECK (tool IN ('cfengine', 'puppet', 'chef', 'ansible',
                       'salt', 'dsc')),
  trigger            TEXT NOT NULL CHECK (trigger IN ('interval', 'push', 'event', 'manual',
                       'boot')),
  triggered_by       TEXT NOT NULL,      -- typed actor: 'schedule:cf-execd', 'user:<id>',
                                         -- 'event:<tag>', 'pipeline:<run id>'
  config_revision    TEXT NOT NULL,      -- catalog version, Policyfile revision, playbook
                                         -- commit, state tree commit, policy release
  noop               BOOLEAN NOT NULL DEFAULT FALSE,  -- a dry run: counts are "would change"
  started_at         TIMESTAMPTZ NOT NULL,
  finished_at        TIMESTAMPTZ,        -- null while running
  status             TEXT CHECK (status IN ('unchanged', 'changed', 'failed', 'noop')),
  resources_total    INT CHECK (resources_total >= 0),
  resources_changed  INT CHECK (resources_changed >= 0),
  resources_failed   INT CHECK (resources_failed >= 0),
  report_ref         TEXT,               -- where the full report lives: object store, PuppetDB
  external_ref       TEXT,               -- the tool's run or job id; shared by a push to many hosts
  CHECK ((finished_at IS NULL) = (status IS NULL)),
  CHECK (finished_at IS NULL OR finished_at >= started_at),
  CHECK (status IS DISTINCT FROM 'noop' OR noop),       -- 'noop': a dry run that would change
  CHECK (NOT noop OR status IS DISTINCT FROM 'changed'), -- a dry run never changes anything
  CHECK (resources_changed + resources_failed <= resources_total)
);

CREATE INDEX convergence_runs_latest
  ON convergence_runs (resource_id, started_at DESC);
CREATE INDEX convergence_runs_job
  ON convergence_runs (tool, external_ref) WHERE external_ref IS NOT NULL;
```

Notes on the sketch:

- **Status is normalized from each tool's own outcome.** Puppet's detailed exit codes map directly: 0 is `unchanged`, 2 `changed`, 4 and 6 `failed` (with the counts telling partial from total), 1 `failed` with no counts. CFEngine's kept and repaired promises become `unchanged` and `changed`; a promise not kept is a failure. A dry run that would change something is `noop`, with `resources_changed` counting what it would have done; one that finds nothing to do is `unchanged` with `noop` set. [Ansible and Salt](/books/hosting-and-cloud/ansible-and-salt#how-to-build-it) give their mappings.
- **The full report stays outside.** Per-resource events (the file, its old and new checksum, the error) belong in the tool's own store or an object store; the row keeps counts and a pointer. PuppetDB's default keeps reports 14 days, so if the report is evidence, copy it out before it expires.
- **Drift is a query, not a column.** A `changed` run on `trigger = 'interval'` whose `config_revision` equals the previous run's means something other than the configuration changed the machine: a hand edit, a package's own updater, an attacker. That is the signal worth alerting on:

```sql
SELECT r.resource_id, r.started_at, r.resources_changed, r.report_ref
FROM convergence_runs r
JOIN LATERAL (
  SELECT config_revision FROM convergence_runs p
  WHERE p.resource_id = r.resource_id AND p.started_at < r.started_at
    AND p.status IN ('unchanged', 'changed') AND NOT p.noop
  ORDER BY p.started_at DESC LIMIT 1
) prev ON prev.config_revision = r.config_revision
WHERE r.status = 'changed' AND r.trigger = 'interval'
  AND r.started_at >= NOW() - INTERVAL '1 day';
```

- **Staleness is the other alert.** A machine whose latest run is older than two intervals has stopped converging (agent dead, server unreachable, catalog failing on the cache). The `convergence_runs_latest` index answers "last run per machine" cheaply.
- **A managed convergence service meters nodes, not runs.** Vendors license by node, and CFEngine's hub counts a host from when it was last seen. A provider selling convergence emits a `usage_events` row per managed node per period, `meter = 'convergence.managed_node'`, derived from distinct `resource_id` values with a run in the window, so a machine that stopped reporting stops billing after the window closes.
- **Events:** `convergence_run.failed` and `convergence_run.drift_corrected` go through the outbox ([Events & Async Messaging](/docs/architecture/events#the-transactional-outbox)) to alerting and, for a managed service, to the customer's notification preferences.

## Auditing

- **Every change to every machine, with its cause.** Which run changed which resource, under which `config_revision`, triggered by whom; the commit behind the revision is the change-management record ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Dry runs before risky changes.** A noop run's report, kept with the change request, shows what reviewers expected the change to do; comparing it with the real run's report shows whether it did.
- **Drift corrections.** Changed runs with no new revision are unrecorded changes the tool undid; each is worth a look, and some are incidents.
- **Coverage.** Which machines ran in the last interval, which didn't, and which are outside convergence entirely, so "all servers are hardened" can be shown rather than asserted.
- **License counts.** Node counts per vendor over time, against what the license or the developer EULA allows.

Reports are amended by later runs, never edited ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)), and kept as long as the compliance program that relies on them requires.

## What This Means for the System You Build

- **Prefer replacement to convergence,** and keep convergence for machines that can't be rebuilt on every change.
- **Make every resource idempotent:** read, compare, act on the difference, report changed only when something changed.
- **Pull on an interval with splay,** and make agents keep converging on their last good configuration when the server is unreachable.
- **Compile where secrets and code should live:** server-side catalogs keep code and other nodes' data off each machine.
- **Run a dry run before a fleet-wide change,** and keep its report with the change.
- **Store one row per run per machine,** with a normalized status, counts, the revision and a pointer to the full report.
- **Alert on drift and on silence:** a changed run without a new revision, and a machine with no recent run.
- **Know whose binaries your agents install,** because a license change upstream becomes your security dependency.
- **Expect cloud-hosted configuration servers to be retired,** and keep the desired state in a repository you can point at another tool.

## References

**Papers and project history**

- [GNU: cfengine overview](https://www.gnu.org/software/cfengine/cfdetails.html), the research project "started in 1993", declarative language, classes, deviations fixed against the model
- [Mark Burgess: Computer Immunology (USENIX LISA '98)](https://www.usenix.org/legacy/event/lisa98/full_papers/burgess/burgess_html/burgess.html), December 1998, Oslo College, cfengine as a descriptive language that "becomes inert" once the desired state is reached
- [Network World: Promise theory, Mark Burgess and CFEngine](https://www.networkworld.com/article/926422/sdn-promise-theory-mark-burgess-cfengine-sdn-cisco-aci-apic-opflex.html), promise theory first proposed by Burgess in 2004, voluntary cooperation between autonomous agents, incorporated in CFEngine 3
- [The Architecture of Open Source Applications: Puppet](https://aosabook.org/en/v2/puppet.html), the 2004 prototype and February 2005 start, CFEngine and ISconf influences, facts, ENC, catalogs, the transaction, the RAL, simulation mode, reports
- [TechCrunch: Puppet Labs](https://techcrunch.com/2010/07/19/puppet-labs/), "Puppet Labs, formerly known as Reductive Labs" (July 19, 2010)

**Release notes and repositories**

- [GitHub: cfengine/core](https://github.com/cfengine/core), C implementation, GPLv3 and COSL license file, the `3.0.0` tag (December 31, 2008), the 3.28.0 (July 9, 2026) and 3.27.3 (October 16, 2026) tags
- [GitHub: cfengine/masterfiles, controls/def.cf](https://github.com/cfengine/masterfiles/blob/master/controls/def.cf), the default executor schedule `Min00` to `Min55`
- [GitHub: puppetlabs/puppet](https://github.com/puppetlabs/puppet), first imported commit (April 13, 2005), Apache 2.0
- [GitHub: puppetlabs/puppet, lib/puppet/defaults.rb](https://github.com/puppetlabs/puppet/blob/main/lib/puppet/defaults.rb), `runinterval` 30m, `splay`, `splaylimit`, `noop`, `report`, `usecacheonfailure`, `runtimeout` 1h, default environment
- [GitHub: puppetlabs/puppetdb 0.9.0](https://github.com/puppetlabs/puppetdb/releases/tag/0.9.0), the first public PuppetDB tag (May 16, 2012)
- [Puppet Core 8.11.0 release notes](https://help.puppet.com/osp/8/content/puppetcore/PuppetReleaseNotes/release_notes_puppet_x-8-11-0.htm), "Released February 2025", the new proprietary Perforce Puppet Core
- [Puppet Core release notes](https://help.puppet.com/core/current/Content/PuppetCore/PuppetReleaseNotes/release_notes_puppet.htm), Puppet Core 9.1.0 (as of October 2026)
- [GitHub: OpenVoxProject/openvox releases](https://github.com/OpenVoxProject/openvox/releases), 9.2.1 (October 23, 2026) and 8.31.1 (October 21, 2026), Apache 2.0

**Documentation**

- [CFEngine: language concepts, promises](https://github.com/cfengine/documentation/blob/master/content/reference/language-concepts/promises.markdown), promiser, promisees, bundles, bodies, kept and repaired outcomes and locking
- [CFEngine: cf-agent](https://github.com/cfengine/documentation/blob/master/content/reference/components/cf-agent.markdown), evaluates policy and makes changes, preset order for convergence, `ifelapsed` default
- [CFEngine: cf-execd](https://github.com/cfengine/documentation/blob/master/content/reference/components/cf-execd.markdown), schedules `cf-agent`, five-minute default, splaytime by host-name hash, email on changed output, transcripts in `outputs/`
- [CFEngine: cf-serverd](https://github.com/cfengine/documentation/blob/master/content/reference/components/cf-serverd.markdown), file serving for policy updates, `cf-runagent` triggers, default deny, `allowconnects`
- [CFEngine: components and common control](https://github.com/cfengine/documentation/blob/master/content/reference/components/_index.markdown), `cf-hub` license counting by last-seen hosts
- [Puppet: relationships and ordering](https://help.puppet.com/core/current/Content/PuppetCore/lang_relationships.htm), manifest order, `before`, `require`, `notify`, `subscribe`, chaining arrows, one refresh per run, noop suppression
- [Puppet: puppet apply](https://help.puppet.com/core/current/Content/PuppetCore/Markdown/apply.htm), the standalone tool, `--noop`, detailed exit codes 0, 1, 2, 4, 6
- [Puppet: Hiera](https://help.puppet.com/core/current/Content/PuppetCore/hiera_intro.htm), key-value data, automatic parameter lookup, "defaults, with overrides", YAML, JSON and EYAML
- [Puppet: Hiera configuration layers](https://help.puppet.com/core/current/Content/PuppetCore/hiera_config_layers.htm), global, environment and module layers and their order
- [Puppet: exported resources](https://help.puppet.com/core/8/Content/PuppetCore/lang_exported.htm), `@@`, collectors, PuppetDB requirement, SSH key and Nagios examples
- [Puppet: installing and managing modules](https://help.puppet.com/core/current/Content/PuppetCore/modules_installing.htm), the Forge, `puppet module`, Puppetfile with r10k or Code Manager
- [PuppetDB overview](https://github.com/puppetlabs/puppetdb/blob/main/documentation/overview.markdown), latest facts and catalogs, reports for 14 days by default, PostgreSQL 11 or later, exported resources, inventory
- [AWS Systems Manager: associations that run Ansible playbooks](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-state-manager-ansible.html), State Manager associations, `AWS-ApplyAnsiblePlaybooks`, cron or rate schedules, compliance severity
- [Microsoft: Azure Automation State Configuration overview](https://learn.microsoft.com/en-us/azure/automation/automation-dsc-overview), retirement on September 30, 2027, Linux DSC retired September 30, 2023, built-in pull server, no extra charge for Azure VMs
- [Microsoft: What is Azure Machine Configuration?](https://learn.microsoft.com/en-us/azure/governance/machine-configuration/overview), configurations through Azure Policy, Arc-enabled machines, Audit, Apply and Monitor, Apply and Autocorrect
- [Google Cloud: OS configuration management](https://docs.cloud.google.com/compute/docs/os-configuration-management), OS policies and assignments, OS Config agent, 60-minute enforcement check, rollouts

**Announcements**

- [Perforce completes acquisition of Puppet](https://www.perforce.com/press-releases/perforce-completes-acquisition-puppet), completion on May 18, 2022
- [Clearlake: Perforce to acquire DevOps pioneer Puppet](https://clearlake.com/news/perforce-to-acquire-devops-pioneer-puppet/), the April 11, 2022 agreement, terms undisclosed
- [Puppet: Open source Puppet updates in 2025](https://puppet.com/blog/open-source-puppet-updates-2025), November 7, 2024: private binaries from early 2025, 25-node developer license, Apache source, the 2024 GitHub misconfiguration
- [Puppet Core](https://puppet.com/products/puppet-core), CVE remediation in 14 days (CVSS 9 to 10) and 30 days (7 to 8.9)
- [Puppet: AWS OpsWorks end of life](https://www.puppet.com/blog/puppet-aws-opsworks), OpsWorks for Puppet Enterprise ended after March 31, 2024; OpsWorks Stacks access ended May 26, 2024
- [Vox Pupuli: OpenVox release](https://voxpupuli.org/blog/2025/01/21/openvox-release/), OpenVox 8.11 on January 21, 2025, "functionally equivalent", soft fork, steering committee proposal
- [Choria: Puppet support](https://choria.io/blog/post/2025/01/23/puppet_support/), January 23, 2025, no support for Perforce's builds, OpenVox required from 0.31.0
- [Choria](https://choria.io/), an orchestration system on the NATS-based Choria Broker
- [Northern.tech: products](https://northern.tech/products), CFEngine and Mender

**In practice**

- [DevClass: Community plans to fork Puppet](https://devclass.com/2024/12/18/community-plans-to-fork-puppet-unhappy-with-perforce-changes-to-open-source-project/), December 18, 2024, Perforce refusing the name, candidate names, Beaupré's quote
