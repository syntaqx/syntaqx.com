+++
title = "Push & Events: Ansible and Salt"
nav_title = "Ansible and Salt"
description = "Ansible's agentless push over SSH and Salt's master, minions and event bus: how each runs, AWX and event-driven Ansible, Red Hat, Broadcom, push versus pull."
category = "Hosting & Cloud Industry"
order = 2142
part = "Infrastructure as Code"
tags = ["infrastructure-as-code", "configuration-management", "ansible", "salt", "event-driven", "convergence"]
+++

The pull agents of [Convergence: CFEngine to Puppet](/books/hosting-and-cloud/cfengine-and-puppet) and [Chef](/books/hosting-and-cloud/chef) put a daemon on every machine and let each one fix itself on a timer. That is the right shape for holding a fleet steady and the wrong shape for doing something in order: drain this load balancer, upgrade these three database replicas one at a time, then restart the application tier, now. Two tools that arrived in 2011 and 2012 started from that second job. Ansible pushes from a control node over SSH, with no Ansible installed on the targets. Salt keeps a persistent connection from every minion to a master, so the master can send a command to ten thousand machines at once and the machines can send events back, which turns configuration management into something that reacts.

This chapter covers both tools in enough depth to run them, the platforms built on top (AWX, Red Hat's Automation Platform, event-driven Ansible), their ownership under Red Hat and IBM and under VMware and Broadcom, and the comparison the part needs: pull on an interval, push on demand, or react to events. The vocabulary (desired state, idempotence, facts, compile versus converge, dry run) is defined in [the convergence vocabulary](/books/hosting-and-cloud/cfengine-and-puppet#the-convergence-vocabulary), and runs are recorded in the `convergence_runs` table that chapter owns.

## How the Providers Do It

As of October 2026:

| Offering | Owner | What it is | Status |
| --- | --- | --- | --- |
| **ansible-core** and the **ansible** package | Red Hat (IBM), community | The runtime and CLI (`ansible`, `ansible-playbook`); the `ansible` package adds curated community collections | GPLv3; ansible-core 2.21.5 released October 5, 2026, 2.22 in release candidates; `ansible` 14.5.0 released October 6, 2026 |
| **Red Hat Ansible Automation Platform** | Red Hat | Commercial platform: a job server with RBAC and an API, execution environments, event-driven Ansible | Subscription; event-driven Ansible generally available since version 2.4 (June 2023) |
| **AWX** | Red Hat, community | The upstream of the controller: web UI, REST API and task engine | Apache 2.0; releases paused during a refactoring, last release July 2, 2024 |
| **Salt** | Broadcom (Salt Project) | Master and minions on an event bus; also agentless over SSH | Apache 2.0; 3008.5 released October 26, 2026, 3007.17 and 3006.30 on October 27, 2026; packages from `packages.broadcom.com` |
| **AWS Systems Manager** | AWS | `AWS-ApplyAnsiblePlaybooks` runs playbooks from GitHub or S3 on tagged nodes through State Manager associations, on a cron or rate schedule, with an optional check mode | Available; the older `AWS-RunAnsiblePlaybook` is deprecated |
| **Terraform registry** | HashiCorp (IBM) | `ansible` is one of the "official" provider namespaces; Terraform actions announced at HashiConf 2025 can invoke event-driven Ansible | Available |

The common thread is that push tools became platforms. The command line is free and agentless; what organizations buy is the server around it, which holds inventories and credentials, schedules jobs, records every run, and exposes an API that other systems (a ticketing system, a monitoring alert, a Terraform apply) can call. The clouds don't host Ansible or Salt servers; AWS runs playbooks through its own agent instead, the same pattern [the convergence chapter](/books/hosting-and-cloud/cfengine-and-puppet#how-the-providers-do-it) found for managed configuration servers.

## Pull, Push and Events

Three loop shapes run configuration management. They differ in who starts a run, what each machine must have, and what happens when the server is gone:

| | Pull on an interval | Push on demand | Event bus |
| --- | --- | --- | --- |
| **Who starts a run** | The agent's timer | An operator, a pipeline or a schedule on the control node | An event: a minion starting, a file changing, an alert firing |
| **Tools** | CFEngine, Puppet, [Chef](/books/hosting-and-cloud/chef#the-chef-run), `ansible-pull` | Ansible, `salt-ssh` | Salt reactor and beacons, event-driven Ansible |
| **What the machine needs** | An agent, credentials to the server, outbound access | SSH (WinRM on Windows) and Python; inbound access from the control node | A minion with a persistent connection to the master, or a webhook or queue the rulebook watches |
| **Time from change to machine** | Up to one interval plus splay | As soon as the run reaches the host | Seconds after the event |
| **Drift correction** | Automatic every interval | Only when someone runs it again | When a beacon notices, if a reaction is wired |
| **Server down** | Agents keep converging on their last configuration | Nothing runs | Nothing reacts; minions keep running |
| **Ordering across machines** | None: each machine converges alone | Built in: plays run in order, in batches | Orchestration on the master |
| **Blast radius of a bad change** | The whole fleet, within one interval | The hosts in the play, in the batch size chosen | Whatever the reaction targets |

The trade is control against coverage. Pull covers every machine eventually and keeps covering it, but can't sequence work across machines. Push sequences anything and covers only what it is pointed at, when it is pointed at it. The event bus reacts fastest and is the hardest to reason about, because a reaction can trigger the change that triggers the next event. Most fleets end up combining them: a pull agent or scheduled push for steady state, push for orchestrated changes, events for the handful of things that must be fixed in seconds.

## Ansible: Agentless Push

Michael DeHaan's first commit to Ansible, "Genesis.," is dated February 23, 2012. Red Hat announced a definitive agreement to acquire Ansible, Inc. on October 16, 2015, describing Ansible's "simple and agentless approach" and an upstream project of "nearly 1,200 contributors," and expected the deal to close that month; terms weren't disclosed in the release. Ansible Tower, the commercial server, came with it. On September 7, 2017 Red Hat open-sourced Tower's upstream as **AWX**, the fast-moving project from which Tower releases are hardened, Fedora to Tower's RHEL. IBM closed its acquisition of Red Hat on July 9, 2019, at $190 per share, about $34 billion, with Red Hat as "a distinct unit within IBM."

The codebase split in 2020. `ansible-base` 2.10.0 was tagged on August 13, 2020, and the `ansible` 2.10.0 package, the engine plus community collections, went to PyPI on September 22, 2020; from 2.11, tagged April 26, 2021, the engine is **ansible-core**. Since then the two version lines move separately: as of October 2026, ansible-core 2.21.5 and the `ansible` 14.5.0 package, which "pulls in ansible-core" plus "a set of independent Ansible collections that are curated by the community." ansible-core is GPLv3.

### How an Ansible Run Works

The **control node** is "the machine from which you run the Ansible CLI tools"; the **managed nodes** are the servers and devices it targets, and Ansible is normally not installed on them. The **inventory** lists managed nodes from one or more inventory sources, with groups for targeting and assigning variables. A **playbook** is a YAML file of **plays**; each play maps a set of hosts to an ordered list of **tasks**, and each task calls a **module**, "the code or binaries that Ansible copies to and executes on each managed node."

The connection is SSH: "by default, Ansible uses native OpenSSH," for ControlPersist, Kerberos and `~/.ssh/config` support, falling back to the Python implementation paramiko on old OpenSSH, with keys assumed. Windows hosts use WinRM. Within a play:

1. **Facts.** "By default, Ansible gathers facts at the beginning of each play" with the `setup` module. `gather_facts: false` skips it, which the docs recommend for scale in push mode; a fact cache plugin keeps facts between runs. Custom facts are files in `facts.d` on the managed node, returned under `ansible_local`.
2. **Tasks across hosts.** The default **linear** strategy "runs each task on all hosts affected by a play before starting the next task," five hosts at a time by default (forks); the **free** strategy lets each host run to the end as fast as it can. `serial` makes a play finish on one batch of hosts before starting the next, which is how a rolling change limits its blast radius.
3. **Handlers.** A handler is a task that runs only when a task reporting "changed" notifies it, once "regardless of how many tasks notify it," after the play's `pre_tasks`, `roles` and `tasks`, and `post_tasks` sections. `listen` lets several handlers answer one topic; `meta: flush_handlers` runs notified handlers mid-play.
4. **Dry runs.** `--check` runs "without making any changes on remote systems," and `--diff` shows before-and-after comparisons. The caveat matters: "Modules that do not support check mode report nothing and do nothing," so a check run is only as complete as its modules.

Idempotence is per module. A module that reads current state and reports "changed" only when it acts gives Ansible convergence; a task that runs an arbitrary command gives it a script. Ansible has no run interval and no agent, so a machine converges only when a play reaches it.

### Variables, Roles and Collections

Ansible resolves a variable from **22 levels of precedence**, from command-line values (lowest, and not variables) and role defaults, through inventory group and host variables, facts, play and role variables, block and task variables, `include_vars`, registered variables and `set_fact`, role and include parameters, up to **extra vars** passed with `-e`, which "always win precedence." The docs' own advice is to define each variable in one place: geography and behavior in inventory groups, shared defaults in `group_vars/all`, exceptions in `host_vars`, overridable defaults in a role's `defaults`, and values inventory must not override in a role's `vars`.

A **role** is "a limited distribution of reusable Ansible content" (tasks, handlers, variables, templates, files) imported into a play. A **collection** is the distribution format for playbooks, roles, modules and plugins together, installed from **Ansible Galaxy** or a private Galaxy-compatible server. An **execution environment** is a container image that acts as the control node: ansible-core, ansible-runner, Python and the dependencies the content needs, plus chosen collections, so the same automation runs the same way from a laptop, a CI job or the platform.

### ansible-pull

`ansible-pull` "pulls playbooks from a VCS repo and executes them on target host," each managed node running its own copy of Ansible from cron, which "inverts the default push architecture of ansible into a pull architecture." With no playbook named it looks for one matching the host's FQDN, then its hostname, then `local.yml`; `--only-if-changed` skips the run when the repository hasn't moved. It gives Ansible a pull loop without a server, at the cost of Ansible and the repository's credentials on every machine, and the docs warn that none of the CLI tools are designed to run concurrently with themselves.

### AWX, the Platform and Event-Driven Ansible

AWX describes itself as "a web-based user interface, REST API, and task engine built on top of Ansible": the server that holds inventories, credentials and job templates, runs playbooks in execution environments, schedules them and keeps every job's output. As of October 2026 its repository says "Releases of this project are now paused during a large scale refactoring," the last release dated July 2, 2024; the supported path is Red Hat's **Ansible Automation Platform**.

**Event-driven Ansible**, shown as a developer preview at AnsibleFest 2022, became generally available with Automation Platform 2.4 (June 2023). Its unit is a **rulebook** of **rulesets**; each ruleset has one or more **sources** (plugins such as `eda.builtin.webhook` that generate events into a queue) and **rules** whose **conditions** are evaluated against incoming events, such as `event.payload.status == "OK"`. A matching rule runs an **action**: `run_playbook`, `run_module`, `run_job_template`, `run_workflow_template`, `debug`, posting an event or fact to a ruleset, or shutting the ruleset down. Each ruleset runs as its own session with its own events and facts. HashiCorp's Terraform actions (HashiConf 2025) can call it, the pairing IBM's portfolio is built around: Terraform creates the machine, Ansible configures it.

## Salt: The Event Bus

Thomas Hatch's initial commit to Salt is dated February 20, 2011, and `v0.9.3` was tagged on November 6, 2011. Salt is remote execution first: a master sends a command to many minions at once over ZeroMQ and collects the results, and configuration management (states) runs on that transport. VMware announced it would acquire SaltStack on September 29, 2020, during VMworld, terms undisclosed, to combine Salt with its vRealize cloud management suite for "end-to-end automation solution with integrated configuration management"; Hatch later wrote that "SaltStack leadership, myself included, made a choice to be acquired by VMware."

Broadcom's acquisition of VMware brought the cuts. At a Salt Open Hour on December 21, 2023, Hatch said Broadcom had finalized the acquisition "a month ago," that "there have been no discussions in Broadcom about changing Salt's license," and that the layoffs included many of the Salt core maintainers. He left Broadcom (his post was last updated May 16, 2024), saying he would stay involved in the community. At the end of October 2024 the project moved packages from `repo.saltproject.io` to `packages.broadcom.com`, a public Artifactory endpoint, dropped every package older than 3006 (so 3005 and earlier can no longer be installed from the project), moved documentation, the website and `salt-bootstrap` to GitHub Pages, and left AWS to "integrate with Broadcom infrastructure and policies," which also broke self-hosted CI runners. The follow-up FAQ noted that the new endpoint "only supports IPv4 at the moment" and that the old bootstrap endpoints would be dropped by the end of November 2024. Its support policy: 3006 LTS is supported until the 3008 LTS release, then gets a year of CVE fixes. As of October 2026 all three of the 3006, 3007 and 3008 lines published releases in the same week, and Salt remains Apache 2.0.

### How Salt Works

A **master** runs `salt-master` and orchestrates; a **minion** is "any system or device managed by Salt," usually running `salt-minion`. Devices that can't run a minion are managed through a **proxy minion**, and **Salt SSH** runs commands and states over SSH "without installing a salt-minion." The default transport is ZeroMQ, "an asynchronous network topology"; a Tornado TCP transport is the alternative. Minions see jobs "by subscribing to events published on the event system," and results come back the same way, so one command reaches every matching minion at once instead of host by host.

- **Grains** are facts about the minion: "the operating system, domain name, IP address, kernel," and custom grains from the minion config, `/etc/salt/grains` or `_grains` modules. They are "relatively static" and good for targeting. They are also set on the minion, and "can be set by users that have access to the minion configuration files," so a grain is a claim, not proof.
- **Pillar** is data "compiled on the master" and mapped to minions by a top file; "pillar data for a given minion is only accessible by the minion for which it is targeted," which makes it the place for per-minion secrets. Pillar passed on the command line is the exception: that publication "will be received by all minions." Pillar is generated at minion start and refreshed with `saltutil.refresh_pillar`, not by running states.
- **States** are the desired state, written in SLS files (YAML with Jinja), with requisites such as `require` and `watch` that build the dependency tree. The **top file**, `top.sls`, maps "groups of machines on a network" to the states they get, per environment (most deployments have one, `base`), matching by glob, grain, pillar, IP range, list, nodegroup and others, with the compound matcher as the top file's default.
- **Highstate** is everything the top file assigns: "To apply all configured states, simply run `state.apply` with no SLS targets"; `state.apply web,pkgs` applies named SLS files only. `test=True` is the dry run, reporting would-be changes with a result of `None`.

Salt SSH packages Salt into a thin tarball, copies it to the target and runs it there, with targets listed in a **roster** (`/etc/salt/roster` by default). It needs Python on the target and "is substantially slower than standard Salt with ZeroMQ," which is the cost of agentless in Salt's own words.

### Reactor and Beacons

Every master has an event bus: "a local ZeroMQ PUB" where each event carries a **tag** for filtering and a dictionary of data. Minion starts, key authentication, job returns and custom events all appear on it.

The **reactor** maps event tags, globs allowed, to reactor SLS files in the master config. A reaction can be `local` (run an execution function on targeted minions), `runner` or `wheel` (run a function on the master), or `caller` (run on a masterless minion). The docs' examples are the standard ones: on `salt/minion/*/start`, tell the new minion to sync custom grains before its first highstate; on `salt/auth`, accept pending keys for minions whose IDs start with a given prefix. Reactions run asynchronously without requisites or ordering, rendering is sequential so slow Jinja delays every other reaction, and "Complex Master-side operations are best performed by Salt's Orchestrate system."

**Beacons** let "the Salt event system ... monitor non-Salt processes." A minion runs each beacon, every second by default or on its own `interval`, and fires an event when it sees something: `inotify` on a file, `load` over a threshold, disk usage, a service's status. The docs' worked example closes the loop: a beacon sees `/etc/important_file` modified, the event's tag matches a reactor, and the reaction runs `state.apply` on that minion to restore the file. That is drift correction in seconds instead of at the next interval, and it carries its own hazard: the state that restores the file also modifies it, so the docs recommend `disable_during_state_run` and an idempotent state to keep the loop from feeding itself.

My rule for reactors: never let one grant trust on data the minion controls. A minion picks its own ID and sets its own grains, so a reactor that auto-accepts keys by ID prefix accepts any machine that names itself correctly. Accept keys from a provisioning system that created the machine, and keep reactors to small, idempotent, reversible actions.

## The Alternatives

| Approach | Model | Strengths | Failure modes | License and owner | Cost | Who it suits |
| --- | --- | --- | --- | --- | --- | --- |
| **Ansible (core)** | Push over SSH from a control node | No agent; readable YAML; orders work across hosts; huge module set | No continuous correction; slow at very large fleet sizes; 22 precedence levels; command tasks that aren't idempotent | GPLv3; Red Hat (IBM) | Free | Orchestrated changes, network devices, small and medium fleets |
| **Ansible Automation Platform** | Push, scheduled and event-driven, from a controller | RBAC, credentials, job history, API, event-driven Ansible, support | Subscription cost; another platform to run | Commercial; Red Hat | Subscription | Organizations that need audit and self-service |
| **AWX** | The controller's upstream | Free UI and API over Ansible | Releases paused since July 2024 | Apache 2.0; Red Hat | Free | Labs and evaluation |
| **ansible-pull** | Pull from Git on cron | No server; Ansible content reused | Credentials and Ansible on every node; no central record | GPLv3 | Free | Small fleets and edge devices |
| **Salt** | Master and minions on an event bus | Fast parallel execution; reactor and beacons; pillar for per-minion secrets | Master is a target and a bottleneck; event loops; maintainer cuts after Broadcom | Apache 2.0; Broadcom | Free | Large fleets needing fast remote execution and reactions |
| **salt-ssh** | Agentless push | Salt states without minions | "Substantially slower"; Python required | Apache 2.0 | Free | Bootstrapping, hosts that can't run a minion |
| **Pull agents** (Puppet, OpenVox, CFEngine, Chef) | Pull on an interval | Continuous drift correction | No cross-host ordering | See [the alternatives](/books/hosting-and-cloud/cfengine-and-puppet#the-alternatives) | Varies | Long-lived fleets |
| **AWS Systems Manager** | Cloud agent runs playbooks on a schedule | No control node; IAM; compliance reporting | AWS only; playbooks fetched per run | Proprietary; AWS | Included with the agent | Fleets inside AWS |

## My Default

My default is Ansible for anything that must happen in order across machines: rolling upgrades, failovers, bootstrapping a host before a pull agent or an image takes over, and network gear that can't run an agent. I'd run it from CI or a controller, never from a laptop, for the same reason the playbook gives for [applying infrastructure from CI](/docs/delivery/infrastructure-as-code#plan-in-ci-apply-from-ci): one record, one set of versions, credentials that belong to the pipeline. For steady state on long-lived machines I'd still rather have a pull agent or a scheduled run than trust that someone remembers to push, and for stateless machines I'd bake the image and skip both ([Baking Images: Packer](/books/hosting-and-cloud/packer-and-images#baking-vs-frying)).

I'd pick Salt where the event bus is the point: very large fleets that need a command on every host in seconds, or a small set of beacons that must correct drift faster than any interval. The tradeoff is ownership as much as design. Salt's core team was cut after Broadcom's acquisition and its packages now come from Broadcom's endpoint, so a fleet that depends on it should mirror packages and plan for the project's direction to change. If that risk is unacceptable, event-driven Ansible covers the "react to an alert" case with a vendor behind it.

## How to Build It

Ansible and Salt write to [`convergence_runs`](/books/hosting-and-cloud/cfengine-and-puppet#how-to-build-it), one row per host per run, so drift, failures and coverage read the same across every tool. No new table: the differences are in how rows are produced.

- **One job, many rows.** A push targets many hosts at once. Each host gets its own row with `trigger = 'push'` (or `'event'` for a reactor or rulebook, `'interval'` for a schedule or `ansible-pull` from cron), and every row from one job shares `external_ref`: the AWX or controller job ID, or the Salt job ID. `triggered_by` names who or what started it: `user:<id>`, `pipeline:<run id>`, `rulebook:<name>`, or `event:salt/beacon/<minion>/inotify`.
- **The revision is a commit.** `config_revision` is the playbook or state tree commit, plus the execution environment image digest for Ansible, because the same playbook in a different environment is a different run.
- **Status from the tool's own result.** For Ansible, a host with any failed task or that was unreachable is `failed`; one with changed tasks is `changed`; otherwise `unchanged`; a `--check` run sets `noop`, with "would change" counts. For Salt, each state's result maps the same way: a failed state makes the run `failed`, a state that reports changes makes it `changed`, and under `test=True` a `None` result is a would-be change. Unreachable hosts are failures, not absences: a host that wasn't reached has not converged.
- **Coverage is the gap push creates.** Pull agents produce a row per interval whether or not anything changed; push produces rows only where it was pointed. A query for machines of kind `server` or `virtual_machine` with no `convergence_runs` row in the last N days finds the machines nobody is managing.

```sql
SELECT res.id, res.external_ref, MAX(cr.started_at) AS last_run
FROM resources res
LEFT JOIN convergence_runs cr
  ON cr.resource_id = res.id AND cr.status IN ('unchanged', 'changed') AND NOT cr.noop
WHERE res.kind IN ('server', 'virtual_machine') AND res.state = 'active'
GROUP BY res.id, res.external_ref
HAVING MAX(cr.started_at) IS NULL OR MAX(cr.started_at) < NOW() - INTERVAL '7 days';
```

- **Events triggered by events are traceable.** A beacon event, the reactor that matched it, and the `state.apply` it caused share the triggering tag in `triggered_by`, so a reaction loop shows up as a burst of event-triggered rows on one machine with the same tag.
- **Credentials stay in the platform.** SSH keys, WinRM credentials and vault passwords live in the controller's credential store or a secrets manager and are injected per job; the run row records which credential was used, never its value ([Environments: Secrets](/docs/operations/environments#secrets)).

## Auditing

- **Who ran what against which machines.** Every job with its actor, playbook or state commit, execution environment, inventory and target pattern, and every host's result; for event-driven runs, the event that triggered it ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Ad hoc commands.** `ansible` and `salt` one-liners change machines as surely as playbooks do; run them through the platform so they are recorded, or treat a host touched outside it as drifted.
- **Check-mode evidence.** A check run's output before a change, and the real run's after, kept with the change request.
- **Key acceptance.** Every Salt minion key accepted, by whom or by which reactor, and when; a key accepted by a rule is a machine trusted by a rule.
- **Rulebook changes.** Rulebooks and reactor maps are code that decides when production changes itself; review and version them like playbooks.

## What This Means for the System You Build

- **Choose the loop for the job:** pull for steady state, push for ordered changes, events for the few things that must be fixed in seconds.
- **Run pushes from a platform or CI, never a laptop,** so every run has an actor, a commit and a record.
- **Batch rolling changes** with `serial` and a failure threshold, so a bad change stops at the first batch.
- **Trust check mode only as far as its modules,** and treat non-idempotent tasks as scripts that need guards.
- **Keep secrets in pillar or a secrets manager,** never in grains, inventory files or command-line variables.
- **Never let a reactor grant trust on data the minion controls,** and keep reactions small and idempotent.
- **Record one row per host per run,** with the job ID shared across hosts and unreachable hosts counted as failures.
- **Query for machines nobody is managing,** because push only covers what it is pointed at.
- **Plan for owner changes:** mirror packages and pin versions, as Salt's 2024 repository move showed.

## References

**Release notes and repositories**

- [GitHub: ansible/ansible](https://github.com/ansible/ansible), the first commit "Genesis." (February 23, 2012), GPLv3, releases including ansible-core 2.21.5 (October 5, 2026) and 2.22 release candidates
- [GitHub: ansible/ansible v2.10.0](https://github.com/ansible/ansible/releases/tag/v2.10.0), ansible-base 2.10.0 tagged August 13, 2020
- [GitHub: ansible/ansible v2.11.0](https://github.com/ansible/ansible/releases/tag/v2.11.0), the first ansible-core tag (April 26, 2021)
- [PyPI: ansible 2.10.0](https://pypi.org/project/ansible/2.10.0/), the collections-based package uploaded September 22, 2020
- [PyPI: ansible](https://pypi.org/project/ansible/), version 14.5.0 (October 6, 2026), ansible-core plus curated community collections
- [GitHub: ansible/awx](https://github.com/ansible/awx), web UI, REST API and task engine, releases paused, last release July 2, 2024, Apache 2.0
- [GitHub: saltstack/salt](https://github.com/saltstack/salt), the initial commit (February 20, 2011), Apache 2.0, releases 3008.5, 3007.17 and 3006.30 (October 26 and 27, 2026)
- [GitHub: saltstack/salt v0.9.3](https://github.com/saltstack/salt/releases/tag/v0.9.3), tagged November 6, 2011

**Documentation**

- [Ansible: basic concepts](https://docs.ansible.com/ansible/latest/getting_started/basic_concepts.html), control node, managed nodes, inventory, playbooks, plays, roles, tasks, handlers, modules, plugins, collections
- [Ansible: connection methods and details](https://docs.ansible.com/ansible/latest/inventory_guide/connection_details.html), native OpenSSH by default, paramiko fallback, key-based authentication
- [Ansible: Windows remote management](https://docs.ansible.com/ansible/latest/os_guide/windows_winrm.html), WinRM for Windows hosts
- [Ansible: discovering variables, facts](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_vars_facts.html), facts gathered at the start of each play, `gather_facts`, fact caching, `facts.d` and `ansible_local`
- [Ansible: controlling playbook execution, strategies](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_strategies.html), linear and free strategies, five forks by default, `serial`
- [Ansible: handlers](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_handlers.html), run on "changed", once per play, `listen`, `meta: flush_handlers`
- [Ansible: check mode and diff mode](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_checkmode.html), `--check`, `--diff`, modules without check mode "report nothing and do nothing"
- [Ansible: using variables](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html), the 22-level variable precedence and where to set variables
- [Ansible: using collections](https://docs.ansible.com/ansible/latest/collections_guide/index.html), collections as the distribution format, Galaxy and Galaxy-compatible servers
- [Ansible: getting started with execution environments](https://docs.ansible.com/ansible/latest/getting_started_ee/index.html), container images that act as control nodes
- [Ansible: ansible-pull](https://docs.ansible.com/ansible/latest/cli/ansible-pull.html), pull from VCS on cron, inverted architecture, `local.yml`, `--only-if-changed`
- [Ansible Rulebook: rulebooks](https://docs.ansible.com/projects/rulebook/en/latest/rulebooks.html), rulesets, sources, rules, conditions and actions
- [Salt: overview](https://docs.saltproject.io/salt/user-guide/en/latest/topics/overview.html), master, minion, proxy, Salt SSH, ZeroMQ and TCP transports, the event system
- [Salt: grains](https://docs.saltproject.io/en/latest/topics/grains/index.html), collected facts, custom grains, set by local users, not for secrets
- [Salt: pillar](https://docs.saltproject.io/en/latest/topics/pillar/index.html), compiled on the master, accessible only to the targeted minion, command-line pillar caveat, refresh
- [Salt: the top file](https://docs.saltproject.io/en/latest/ref/states/top.html), `top.sls`, environments and `base`, match types, compound matcher default
- [Salt: highstate data structure](https://docs.saltproject.io/en/latest/ref/states/highstate.html), requisite declarations building the dependency tree
- [Salt: state execution module](https://docs.saltproject.io/en/latest/ref/modules/all/salt.modules.state.html), `state.apply` with no targets applies all configured states, `test`
- [Salt: state testing](https://docs.saltproject.io/en/latest/ref/states/testing.html), `test=True` and `None` results
- [Salt: Salt SSH](https://docs.saltproject.io/en/latest/topics/ssh/index.html), roster, thin deployment, Python requirement, "substantially slower"
- [Salt: reactor system](https://docs.saltproject.io/en/latest/topics/reactor/index.html), the event bus, tags, reactor SLS, local, runner, wheel and caller reactions, examples and cautions
- [Salt: beacons](https://docs.saltproject.io/en/latest/topics/beacons/index.html), monitoring non-Salt processes, one-second default interval, inotify and load, `disable_during_state_run`
- [AWS Systems Manager: associations that run Ansible playbooks](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-state-manager-ansible.html), `AWS-ApplyAnsiblePlaybooks`, GitHub and S3 sources, check option, schedules, deprecated `AWS-RunAnsiblePlaybook`
- [HashiCorp: Terraform registry providers](https://developer.hashicorp.com/terraform/registry/providers), `ansible` among the official namespaces

**Announcements**

- [Red Hat to acquire IT automation and DevOps leader Ansible (Wayback)](http://web.archive.org/web/20151018224043/http://www.redhat.com:80/en/about/press-releases/red-hat-acquire-it-automation-and-devops-leader-ansible), October 16, 2015, agentless approach, nearly 1,200 contributors, Tower, expected close in October 2015
- [Red Hat Developer: What's new in Ansible Automation Platform 2.4](https://developers.redhat.com/articles/2023/06/27/ansible-automation-platform-whats-new), June 27, 2023, Event-Driven Ansible available with 2.4 after the AnsibleFest 2022 preview
- [HashiCorp: new Terraform and Packer features at HashiConf 2025](https://www.hashicorp.com/en/blog/scale-infrastructure-with-new-terraform-and-packer-features-at-hashiconf-2025), Terraform actions invoking event-driven Ansible
- [Salt Project: package repo migration and guidance](https://saltproject.io/blog/salt-project-package-repo-migration-and-guidance/), the October 2024 move to `packages.broadcom.com`, packages before 3006 dropped, GitHub Pages, leaving AWS
- [Salt Project: post-migration FAQs](https://saltproject.io/blog/post-migration-salt-project-faqs/), IPv4 only, bootstrap endpoints dropped by end of November 2024, 3006 LTS and 3007 STS support policy
- [Salt Project: Open Hour, December 2023](https://saltproject.io/blog/open-hour-2023-dec-12/), Broadcom's completed acquisition, no license change discussed, layoffs including core maintainers
- [Salt Project: Tom exits Broadcom, stays with Salt](https://saltproject.io/blog/tom-exits-broadcom-stays-with-salt/), the choice to be acquired by VMware, Hatch's exit (updated May 16, 2024)

**Filings**

- [IBM: Form 8-K exhibit, IBM closes acquisition of Red Hat](https://www.sec.gov/Archives/edgar/data/51143/000095014219001515/eh1900893_ex9901.htm), July 9, 2019, $190.00 per share, about $34 billion, a distinct unit within IBM

**In practice**

- [Jeff Geerling: Ansible open sources Ansible Tower with AWX](https://www.jeffgeerling.com/blog/2017/ansible-open-sources-ansible-tower-awx/), September 7, 2017, AWX as Tower's upstream, the Fedora and RHEL analogy
- [SiliconANGLE: VMware picks infrastructure automation provider SaltStack](https://siliconangle.com/2020/09/29/vmware-picks-infrastructure-automation-provider-saltstack/), September 29, 2020, VMworld, terms undisclosed, vRealize integration
