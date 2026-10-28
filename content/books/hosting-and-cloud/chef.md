+++
title = "Chef"
description = "Chef from Opscode to Progress: the run's twelve stages, resources and guards, attribute precedence, Policyfiles, Test Kitchen, InSpec, licensing and Chef 360."
category = "Hosting & Cloud Industry"
order = 2141
part = "Infrastructure as Code"
tags = ["infrastructure-as-code", "configuration-management", "chef", "inspec", "test-kitchen", "cinc"]
+++

Chef made configuration management a programming job. Where CFEngine wrote promises in its own language and Puppet compiled a declarative catalog on a server, Chef gave operators Ruby: a recipe is a Ruby file, a resource is a Ruby block, and anything Ruby can compute (a loop over data from a search, a value read from the cloud's metadata, a template rendered with a helper library) can decide what the machine should look like. That was the attraction for the teams that built the first large cloud fleets, and it is also the source of most of Chef's sharp edges: a program that describes desired state runs twice, once to describe it and once to apply it, and code that forgets which of the two it's in breaks in ways that only show up on a real node.

This chapter tells Chef in full: where it came from, how one run of the agent works stage by stage, the resource model with its guards and notifications, the fifteen levels of attribute precedence, the move from roles and environments to Policyfiles, the cookbook ecosystem, local mode, the testing workflow (ChefSpec, Test Kitchen, InSpec) that was arguably Chef's best contribution to the field, Habitat and Automate, and the licensing and ownership changes that end, in November 2026, with the open-source Chef Infra Server reaching end of life. The convergence vocabulary (desired state, idempotence, pull agents, compile versus converge, drift) is defined in [Convergence: CFEngine to Puppet](/books/hosting-and-cloud/cfengine-and-puppet#the-convergence-vocabulary), and this chapter uses it without repeating it. The general rules for declaring infrastructure are the playbook's [Infrastructure as Code](/docs/delivery/infrastructure-as-code); the case for replacing machines rather than repairing them, which shrank Chef's job, is [Rebuild, Don't Repair](/docs/delivery/containers#rebuild-don-t-repair) and [Baking Images: Packer](/books/hosting-and-cloud/packer-and-images).

## How the Providers Do It

Chef has always been sold as software the customer runs, plus a server that holds the desired state. The server is the part whose ownership has moved most. As of October 2026:

| Offering | Owner | What runs where | Status (October 2026) |
| --- | --- | --- | --- |
| **Chef Infra Client** | Progress | The agent on every node: compiles and converges the node's run-list | Version 19 current; 18.x reaches end of life August 31, 2027. Official packages run without a key; the public gem needs a license key at runtime |
| **Chef Infra Server** (open source) | Progress | Stores cookbooks, node objects, roles, environments, policies; answers search | Deprecated; no new code or security fixes after the end of October 2026; 15.x end of life November 30, 2026; repositories go read-only |
| **Chef 360 Platform** | Progress | SaaS or self-managed: node enrollment and management, job orchestration (Courier), skills on each node, licensing and usage collection | The named successor for Infra Server, Automate and Supermarket |
| **Chef Automate** | Progress | Dashboards, compliance reporting, workflow | Deprecated November 1, 2026; end of life November 30, 2027 |
| **Chef Supermarket** (public and private) | Progress | Cookbook registry | 5.x deprecated August 1, 2026; end of life May 31, 2027 |
| **Cinc** (Client, Workstation, Auditor, Server) | Community, on Oregon State University Open Source Lab infrastructure | Rebuilds of Chef's open-source code without the EULA; Cinc Server forking to outlast the upstream end of life | Available |
| **AWS OpsWorks** | AWS | Managed Chef and Puppet servers | Retired; "AWS OpsWorks used to provide managed instances of Puppet and Chef" |

Two things stand out. First, the clouds stopped hosting Chef servers: the managed-server model ended at AWS in 2024 (its Puppet and Stacks dates are in [How the Providers Do It](/books/hosting-and-cloud/cfengine-and-puppet#how-the-providers-do-it) of the CFEngine and Puppet chapter), and what remains is the vendor's own platform or self-hosting. Second, the vendor's business moved from selling a server to selling distributions and a platform: the source stays Apache 2.0, but the binaries, the license keys and the successor to the server all come from Progress. Pricing for Chef 360 and the commercial distributions is not published.

## From Opscode to Progress

Chef began inside a consultancy. Jesse Robbins wrote that "Adam created Chef while we were still a consultancy called HJK Solutions", and that in June 2008 Adam Jacob, Barry Steinglass, Nathan Haneysmith and Robbins set out to "Bring Infrastructure Automation to the Masses." The first commit in the chef repository is Adam Jacob's, on March 6, 2008. "We finally incorporated Opscode on September 12, 2008," Robbins wrote. The commit "Chef Release 0.5.1" is dated January 15, 2009, the day the GitHub repository was created; a year later Jacob marked January 16, 2009 as the day "Chef saw its first public release" (the timeline chapter uses the same date: [Era 3](/books/hosting-and-cloud/bare-metal-to-cloud#era-3-machines-by-the-hour-2006-to-2012)). The earliest tag that survives in the repository is 0.5.2, from February 1, 2009.

The milestones after that, each dated to its primary source:

| Date | Event | What it solved, and what it cost |
| --- | --- | --- |
| September 8, 2012 | Chef 10.14 adds **why-run mode**: "run chef on a system without the providers modifying the system" | A dry run for a two-phase Ruby program; it can only guess at resources that depend on earlier ones, and the release notes said so |
| April 9, 2015 | First commit to **InSpec** (tag 0.3.3 on June 20, 2015; 1.0.0 on September 26, 2016) | Compliance checks as code, separate from the tool that converges |
| November 6, 2015 | **Custom resources** in Chef Client 12.5 replace the resource-plus-provider split (LWRPs) as the recommended way to write resources | One file per resource instead of two concepts; old cookbooks kept working because "there are so many cookbooks out there that already use it" |
| June 2016 | **Habitat** announced (first commit May 22, 2015): application packaging plus a runtime supervisor | Packaging the application rather than converging the host |
| July 2016 | **Chef Automate** launched at ChefConf, unifying Chef, InSpec and Habitat; Chef Compliance and Chef Delivery "phased out as stand-alone products" | One commercial product instead of three |
| April 2, 2019 | All software under Apache 2.0, developed in the open; production use of Chef's own distributions needs a subscription; existing releases usable "in perpetuity" with support ending after 12 months; Chef said "It is absolutely possible that there will be derivative branches" | Open source code with a paid binary: the model Cinc then filled |
| October 5, 2020 | **Progress** completes its acquisition of Chef Software for about $220.0 million in cash, with $12 million in escrow and $98.5 million drawn on its credit facility | Chef becomes a product line of a larger software company |
| InSpec 6 | "Chef InSpec now requires a license key to run": Free (10 targets, personal or non-commercial), Trial (unlimited targets, 30 days), Commercial; source builds and Cinc exempt | A key on the compliance tool |
| November 26, 2025 | "Chef Infra Server (Open Source) has been deprecated and will reach the end of its lifecycle in November 2026"; migrate to Chef 360 SaaS or Self-Managed | The server customers self-hosted for fifteen years gets an end date |
| February 3, 2026 | Chef Infra Client 19 installed from rubygems.org needs a license key at runtime (`CHEF_LICENSE_KEY` or `--license-key`); native packages don't | The last unlicensed path to the official client closes |
| August 20, 2026 | Deprecation and end-of-life table for the whole product line (Infra Server, Automate, Supermarket, Habitat below 2.0, InSpec 5 and 6, Workstation 25) | A dated migration map to Chef 360 and the current majors |

The pattern is the one Open Source & the Clouds tells for databases, told here for a configuration tool: the code stays under a permissive license, and the vendor captures value at the binary, the key and the hosted control plane. The community response, Cinc, is in [Licensing, Chef 360 and Cinc](#licensing-chef-360-and-cinc).

## The Chef Run

A Chef node runs `chef-client` (Chef Infra Client) on a timer or on demand. When it runs as a daemon, the client defaults to an interval of 1,800 seconds, half an hour, plus an optional random splay so a fleet doesn't hit the server at once; on Windows the client refuses to start with an interval at all. Each run goes through twelve stages, in order, as Chef Infra Client 19's documentation lists them:

1. **Get configuration data.** Read `client.rb` and get node data from **Ohai**, the system profiler (platform, kernel, network, memory, cloud metadata). The node name comes from `client.rb` or from Ohai.
2. **Authenticate to Chef Infra Server** with the node's RSA private key through the server API. On the first run there is no node key yet, and the chef-validator is used to generate one.
3. **Get and rebuild the node object** from the server. On later runs the rebuilt object includes the previous run-list.
4. **Expand the run-list** into a complete, ordered list of recipes, with roles replaced by their own run-lists.
5. **Synchronize cookbooks.** Download any cookbook files the expanded run-list needs that are new or changed.
6. **Reset node attributes** in the rebuilt node object, then load attributes from attribute files, Policyfiles and Ohai according to precedence.
7. **Compile the resource collection.** Load libraries, attributes, custom resources and recipes, in that order. Recipe code runs now, and each resource block it encounters is added to an ordered list, the resource collection. This is the **compile phase**.
8. **Converge the node.** Walk the resource collection in order and run each resource's action: read the current state, compare with the desired state, change only the difference. This is the **execution phase**.
9. **Update the node object and process handlers.** After a successful run, upload the node object (with its attributes, Ohai data and run-list) to the server, where other nodes' recipes can search it, and run report and exception handlers.
10. **Get and run InSpec compliance profiles.** The Compliance Phase runs InSpec against the node after the configuration run.
11. **Send or save the compliance report** through the reporting handlers.
12. **Stop and wait** for the next run.

Stages 7 and 8 are the heart of Chef and its most common source of bugs. Recipe code is ordinary Ruby that runs during compile; the resources it declares run later, during converge. Code that reads the system during compile sees the machine as it was before the run:

```ruby
execute 'generate-token' do
  command 'openssl rand -hex 16 > /etc/app/token'
  creates '/etc/app/token'
end

# Wrong: File.read runs at compile time, before the execute resource above has run.
template '/etc/app/config.yml' do
  source 'config.yml.erb'
  variables(token: File.read('/etc/app/token').strip)
end

# Right: lazy defers evaluation until this resource converges.
template '/etc/app/config.yml' do
  source 'config.yml.erb'
  variables(lazy { { token: ::File.read('/etc/app/token').strip } })
end
```

Chef offers three ways out: `lazy { }` to defer a property's value to converge time (the docs warn that overusing it makes recipes hard to read), `compile_time true` on a resource to run it during compile (which also sets its converge-phase action to `:nothing`), and, inside custom resources, **Unified Mode**, which compiles and converges each action block in one pass so resources run in the order they're written. Unified Mode is the default from Chef Infra Client 18; in 17 and some earlier versions it had to be enabled per resource.

The two-phase run also explains why-run. A dry run converges nothing, so a resource that depends on an earlier one (a service whose package isn't installed yet) can't be checked against the real system; Chef's 10.14 notes said why-run "will assume that the command would have been installed by a previous resource and the service would not be running. This of course isn't guaranteed to be the case." Why-run is accurate on a node that is already close to its desired state and noisy on a fresh one, which is exactly when it would be most useful.

The run's shape is also where Chef differs from the other pull tool. Puppet's server compiles the catalog and the agent only applies it ([The Puppet Run](/books/hosting-and-cloud/cfengine-and-puppet#the-puppet-run)); Chef ships the cookbooks to the node and compiles there. That puts the logic next to the facts it needs, and it means every node holds every cookbook in its run-list, including whatever secrets those cookbooks or their data carry, and every node needs the CPU and the Ruby runtime to compile them.

## Resources, Guards and Notifications

A resource is "a statement of configuration policy": a Ruby block with "a type, a name, one (or more) properties (with values), and one (or more) actions." Every action has a default; `package` defaults to installing. The common built-in types are `package`, `service`, `file`, `template`, `directory`, `user`, `execute` and platform variants such as `apt_package` and `windows_service`.

```ruby
package 'nginx'                          # action :install by default

template '/etc/nginx/nginx.conf' do
  source 'nginx.conf.erb'
  owner 'root'
  mode '0644'
  variables(workers: node['nginx']['workers'])
  notifies :reload, 'service[nginx]', :delayed
end

service 'nginx' do
  action [:enable, :start]
end

execute 'migrate-schema' do
  command '/opt/app/bin/migrate'
  not_if '/opt/app/bin/migrate --status | grep -q up-to-date'
  retries 2
  retry_delay 10
end
```

The pieces that make resources safe to run every thirty minutes:

- **Idempotence is built into the resource, and guards add it where it isn't.** `package`, `file`, `template` and `service` read current state and act only on a difference. `execute` and the script resources can't know what their command does, so they need a **guard**: `not_if` skips the resource when the condition is true, `only_if` runs it only when the condition is true. A string guard is a shell command where exit code 0 means true; a block guard is Ruby returning true or false. `guard_interpreter` runs string guards with a chosen interpreter (`:bash`, `:powershell_script` and others), and with a matching interpreter the guard inherits the resource's properties (user, environment, working directory). `creates` on `execute` is the shortest guard: skip if the file exists.
- **Notifications restart only on change.** `notifies :action, 'type[name]', timer` fires when the notifying resource actually changed something; "If the referenced resource doesn't exist, an error is raised." `subscribes` is the reverse, declared on the listener, and doesn't fail if the source is missing. Timers are `:delayed` (the default: queued and run once at the end of the run, so ten template changes cause one reload), `:immediately` (run now, once per notification) and `:before` (run before the notifying resource). A resource with `action :nothing` does nothing until something notifies it.
- **Common properties.** `ignore_failure` continues the run past a failure; `retries` and `retry_delay` retry a flaky resource; `sensitive` keeps the resource's data out of logs, which matters for templates holding credentials.

Writing new resource types is the other half of the model. Until Chef Client 12.5, a new type was two files: a resource (the interface and properties) and a provider (the implementation, per platform), the LWRP pattern. Since 12.5 the recommended form is a **custom resource**: one file in the cookbook's `resources/` directory with `property` declarations, `action` blocks (the first is the default), and `provides` to name it. Inside an action, `load_current_value` reads the system's current state and `converge_if_changed` wraps the code that should run only for properties whose current value differs, so a custom resource gets the same idempotence and the same "changed" reporting as a built-in one:

```ruby
# resources/app_site.rb
provides :app_site
unified_mode true                        # the default from Chef Infra Client 18

property :site_name, String, name_property: true
property :port, Integer, default: 8080

load_current_value do |new_resource|
  conf = "/etc/app/sites/#{new_resource.site_name}.conf"
  current_value_does_not_exist! unless ::File.exist?(conf)
  port ::File.read(conf)[/port=(\d+)/, 1].to_i
end

action :create do
  converge_if_changed :port do
    file "/etc/app/sites/#{new_resource.site_name}.conf" do
      content "port=#{new_resource.port}\n"
    end
  end
end
```

Ordering in Chef is the order of the resource collection: resources converge in the order the recipes declared them, and the run-list order decides recipe order. There is no dependency graph to sort, which makes Chef runs easy to predict and easy to break: a recipe that assumes another recipe has already run works until the run-list changes.

## Attributes and Precedence

Attributes are the node's data: values a recipe reads (`node['nginx']['workers']`) to decide what to configure. They come from cookbook attribute files, recipes, roles, environments, Policyfiles, JSON passed on the command line, the node object saved on the server from the last run, and Ohai. Because many sources can set the same key, Chef resolves them by **precedence**: six types, fifteen levels, applied from lowest to highest, with the last one winning.

| Type | Levels, lowest first | Notes |
| --- | --- | --- |
| `default` | 1 cookbook attribute file, 2 recipe, 3 environment, 4 role | Reset at the start of every run; where most cookbook defaults belong |
| `force_default` | 5 attribute file, 6 recipe | A default that roles and environments can't override |
| `normal` | 7 JSON from `chef-client -j`, 8 attribute file or recipe | Saved in the node object on the server, so it persists between runs: a value set once stays until removed |
| `override` | 9 attribute file, 10 recipe, 11 role, 12 environment | Reset every run |
| `force_override` | 13 attribute file, 14 recipe | Beats role and environment overrides |
| `automatic` | 15 Ohai | Discovered at the start of the run; highest, and can't be changed |

The detail that makes the table work for fleets is the asymmetry between roles and environments. At the default level, a role (4) beats an environment (3); at the override level, an environment (12) beats a role (11). Chef's documentation states the intent: applying the role override first "lets you use the same role in a set of environments," with the environment's override on top for environment-specific values. One `web` role carries the defaults for every web server, and the `production` environment overrides what production needs.

The levels that cause trouble are the persistent and the hidden ones. `normal` attributes survive in the node object, so a value written once by a recipe, or by a JSON file on the command line, keeps winning over every `default` long after the code that set it is gone. Removing a key needs `rm_default`, `rm_normal` or `rm_override` for one level, or `rm` for all levels; `node['foo'].delete('bar')` raises an exception that points to these methods. And because the effective value depends on every source at once, a reviewer can't tell from a cookbook diff what a node will actually get. Policyfiles narrow this by carrying their own default and override attributes in the locked bundle, but the precedence table still applies.

## Roles, Environments and Policyfiles

The original Chef model assigns configuration to nodes with three server-side objects:

- **Role:** a job function, with a run-list plus default and override attributes. A node can have several. Roles can carry `env_run_lists` (a different run-list per environment), and the docs say "Using env_run_lists with roles is discouraged as it can be difficult to maintain over time," recommending multiple roles instead.
- **Environment:** a stage of the workflow such as staging or production, with default and override attributes and **cookbook version constraints**, so a new cookbook version moves through test environments before production. Every organization has a `_default` environment that "can't be modified in any way."
- **Node object:** the node's run-list, its environment, its `normal` attributes and its last Ohai data, stored on the server.

The problem with this model is that it is mutable in three places. A role edited on the server changes every node with that role on their next run, across every environment at once, with no version and no review; cookbook constraints live in environments, but the run-list lives in roles and nodes; and the set of cookbook versions a node gets is whatever the dependency solver picks that day. The community answered with the "environment cookbook" pattern (a wrapper cookbook whose lockfile pins everything below it), and Chef answered with **Policyfiles**.

A Policyfile is "a way to create immutable collections of cookbooks, cookbook dependencies, and attributes," and Chef's docs say "Policyfile effectively replaces roles and environments." It is written as `Policyfile.rb`:

```ruby
name 'web'
default_source :supermarket
run_list 'base::default', 'nginx::default', 'app::deploy'
cookbook 'app', path: '../cookbooks/app'
cookbook 'nginx', '~> 12.0'

default['nginx']['workers'] = 4
default['staging']['app']['log_level'] = 'debug'   # hoisted: applies in policy group "staging"
override['app']['feature_flags'] = %w(new_checkout)
```

The workflow is a build, a lock and a promotion:

1. `chef install` resolves the run-list's dependencies from the declared sources (`:supermarket`, `:chef_server`, `:chef_repo`, `:artifactory`, or a per-cookbook path or git source), caches the cookbooks, and writes **`Policyfile.lock.json`**: the version of every cookbook, an identifier computed from each cookbook's content, its source, the attributes, and the policy's **`revision_id`**. `chef update` re-resolves and writes a new lock.
2. `chef push <group>` uploads the lock and its cookbooks to the server for a **policy group**: "a set of nodes that share the same run-list and cookbooks." Pushing the same lock to `staging`, then `production`, is the promotion.
3. Each node's `client.rb` names its `policy_name` and `policy_group`, and the node runs exactly the locked revision assigned to its group.
4. `chef show-policy` lists revisions and which group runs which; `chef diff` compares two locks (against git refs or groups); `chef clean-policy-revisions` deletes revisions no group uses; `chef export` writes a self-contained repository that runs with `chef-client -z`.

What Policyfiles fixed: the code a node runs is a content-addressed artifact with an id, the same id moves from staging to production unchanged, and the server objects that used to change silently (roles, environments) are gone from the path. Attribute hoisting (`default['staging'][...]`) lets one policy carry per-group values. `include_policy` merges another lock, so a base policy can be shared. What they cost: a change to a shared base cookbook now means a new lock and a push for every policy that uses it, and `named_run_list`, the escape hatch for running part of a policy, is documented as something that "should be used carefully and for specific use cases."

## Cookbooks, Berkshelf and Supermarket

A **cookbook** is Chef's unit of distribution: recipes, attribute files, templates, files, custom resources, libraries and `metadata.rb` with the cookbook's name, version and dependencies. A **run-list** names recipes as `cookbook::recipe`. **Data bags** hold global JSON data, each item a JSON document with an `id`, read by recipes; they were the original place for shared values.

Dependency management grew outside Chef first. **Berkshelf** managed cookbooks and their dependencies with a `Berksfile` and a lockfile, and became the default for a generation of cookbooks; its README now says "Berkshelf is effectively deprecated. There is no ongoing maintenance and triage of issues," and tells existing users to "strongly consider migrating to Policyfiles." Policyfiles replace the Berkshelf environment-cookbook pattern, though Chef's docs note "Policyfile doesn't replace all Berkshelf scenarios."

**Supermarket** is the cookbook registry: the public site and a Private Supermarket a company can run for its own cookbooks (installed and managed with `supermarket-ctl`, with an API). It is the Chef counterpart of the Puppet Forge and Ansible Galaxy, and, on the August 2026 table, it goes the way of the server: 5.x deprecated August 1, 2026, end of life May 31, 2027, with Chef 360 as the replacement.

The registry history carries a supply-chain lesson the other ecosystems repeat. A cookbook pulled by name and version range from a public registry is code that runs as root on every node; pinning it by content in a lock (Policyfiles' identifiers) is what makes it reviewable. The Terraform equivalent is the provider lock file, covered in [Provisioning: Terraform, OpenTofu & the Alternatives](/books/hosting-and-cloud/terraform-and-opentofu).

## chef-solo and Local Mode

Not every node needs a server. **chef-solo** "executes Chef Infra Client in a way that doesn't require Chef Infra Server to converge cookbooks": cookbooks come from a local directory or a tarball URL, node objects are JSON files on local disk, and data bags, roles and environments are read from local paths. What it gives up is exactly what the server provides: "Centralized distribution of cookbooks," "A centralized API that interacts with and integrates infrastructure components," and "Authentication or authorization." No search, no central record of nodes.

**Local mode** (`chef-client -z`) closes most of that gap. Chef's source starts an in-process **chef-zero** server, a lightweight implementation of the server API, backed by the local repository, and points the client at it, so recipes that use search and data bags run unchanged without a real server. `chef export` writes a Policyfile's lock and cookbooks into a repository built for exactly this. Local mode is how Chef runs inside an image build (a Packer shell provisioner runs `chef-client -z` against an exported policy: [Provisioners](/books/hosting-and-cloud/packer-and-images#provisioners)), in Test Kitchen, and on fleets that would rather ship policy as an artifact than run a server.

With the open-source server reaching end of life, local mode is also the exit that needs no new vendor: ship each policy's export as a versioned artifact, run `chef-client -z` on a timer, and send reports somewhere else. It costs search, the central node inventory and authenticated distribution, which have to be rebuilt from other parts of the platform (an inventory from the cloud's API, artifacts from a registry, reports into a table like the one in [How to Build It](#how-to-build-it)).

## Testing: ChefSpec, Test Kitchen and InSpec

Chef's community built the most complete testing workflow of any configuration tool, in three layers that later tools copied.

**ChefSpec** is "a unit testing framework for testing Chef cookbooks." It runs a converge in memory without changing the machine and lets tests assert what each resource would have done:

```ruby
describe 'app::default' do
  platform 'ubuntu', '24.04'
  it { is_expected.to install_package('nginx') }
  it { is_expected.to create_template('/etc/nginx/nginx.conf').with(mode: '0644') }
  it { expect(chef_run.template('/etc/nginx/nginx.conf')).to notify('service[nginx]').to(:reload).delayed }
end
```

It is fast and catches logic errors (the wrong attribute, a missing notification), and it cannot catch anything about a real system: whether the package exists in the repository, whether the service starts.

**Test Kitchen** is "a test harness to execute infrastructure code on one or more platforms in isolation." A `kitchen.yml` names a **driver** (Vagrant, EC2, Azure, Google Compute Engine, vSphere, Docker and others), a **provisioner** (the Chef provisioner, shown in current docs as `cinc_infra`, resolving cookbooks with Policyfiles or Berkshelf), **platforms** (the operating systems to test on), a **verifier** (InSpec, Cinc Auditor or Serverspec) and **suites** (run-lists with attributes):

```yaml
driver:
  name: ec2
provisioner:
  name: chef_infra
  policyfile: Policyfile.rb
verifier:
  name: inspec
platforms:
  - name: ubuntu-24.04
  - name: rockylinux-9
suites:
  - name: default
    verifier:
      inspec_tests:
        - test/integration/default
```

Its lifecycle is five commands: `create` (boot an instance per platform and suite), `converge` (install the client and run the policy), `setup` (prepare the verifier), `verify` (run the tests) and `destroy`. Converging twice and checking that the second run changes nothing is the idempotence test every cookbook should pass. Test Kitchen's driver model made "a real VM per test, thrown away after" normal for configuration code, and Terraform's test tooling later followed the same shape ([Testing Infrastructure Code](/books/hosting-and-cloud/iac-testing-policy-and-secrets#testing-infrastructure-code)). From Chef Infra Client 19, Chef's support moves to Chef Test Kitchen Enterprise with Workstation 26; the gem-installed `test-kitchen` itself doesn't depend on the chef gem.

**InSpec** is "an open-source framework for testing and auditing your applications and infrastructure." A **profile** "organizes multiple controls into a reusable artifact," versioned and with dependencies; a **control** "defines a regulatory recommendation or requirement for the state of a system," with an impact score; and resources test specific parts of the system, from files and packages to cloud APIs (AWS, Azure, Alibaba Cloud and Google Cloud resource packs):

```ruby
control 'ssh-01' do
  impact 0.7
  title 'SSH does not permit root login'
  describe sshd_config do
    its('PermitRootLogin') { should cmp 'no' }
  end
end
```

The same profile serves three uses: as Test Kitchen's verifier in development, as the Compliance Phase at the end of every Chef run in production (stages 10 and 11 of the run), and as a standalone audit against hosts or cloud accounts, with waivers recording accepted exceptions. That separation is the useful idea: the tool that changes the system is not the tool that proves its state, so a compliance check passes or fails regardless of which tool, or which person, made the change. As of October 2026 InSpec 7.x is current, InSpec 5 and 6 reach end of life August 31, 2027, and InSpec 6 and later need a license key unless built from source or taken from Cinc Auditor.

## Habitat and Automate

**Habitat** was Chef's bet that the application, not the host, should carry its own automation. A Habitat package is built from a plan, includes its dependencies, and runs under the **Supervisor**, a runtime with "deployment coordination and service discovery built in," producing apps that are "immutable and atomically deployed, with self-organizing peer relationships." It arrived in 2016, the same years as Docker's rise, and lost the packaging argument to OCI images and schedulers (From chroot to Containers tells that history). Habitat survives inside Chef's own platform: in Chef 360, **skills** (agents that act on a node) can be "canister" skills, "A Habitat package that's installed independently and in parallel with other canisters," and the Courier Runner skill invokes the Infra Client canister to run Chef. Habitat below 2.0 reaches end of life August 31, 2027.

**Chef Automate** was the commercial console: node and run visibility, compliance reporting from InSpec, and workflow, launched at ChefConf 2016 as "One platform that delivers DevOps workflow, automated compliance, and end-to-end pipeline visibility." It is deprecated November 1, 2026, with end of life November 30, 2027.

## Licensing, Chef 360 and Cinc

Chef's licensing, as of October 2026, is three layers:

- **Source:** Apache 2.0, in public repositories, since the April 2019 change. The chef repository's license is Apache-2.0.
- **Official distributions:** Progress's binaries are under its EULA. Chef Infra Client 19 from the official channels (customer portal, Habitat package, migration tool or native installer) runs without a key; from the public gem and other "runtime installations and workflows" it needs one. InSpec 6 and later needs a key on every path except source builds and Cinc. Gem-installed `knife` needs a key to bootstrap nodes.
- **The platform:** Chef 360, SaaS or self-managed, replaces the open-source Infra Server, Automate and Supermarket. Its architecture is "an integrated set of server services that provide DevSecOps, fleet management, job management": Node Management (enrollment, attributes, tags, check-ins, installed skills), **Courier** job orchestration (jobs as JSON documents split into steps per node, delivered by a pull model in which agents "pull from the channel"), and licensing services that collect consumption and audit license usage. A tenant is the security boundary. Chef 360 orchestrates jobs, including Chef runs, rather than serving cookbooks to agents on their own schedule.

For a team running the open-source server, the server's end of life leaves four paths: move to Chef 360 (a vendor platform and a subscription); keep Chef Infra Client and run it in local mode from exported policies (no server, as above); move to **Cinc**, "A community-built, free-as-in-freedom distribution of Chef's open source projects" with Cinc Client as a drop-in `chef-client`, Cinc Workstation, Cinc Auditor (InSpec) and Cinc Server, which "is becoming an independent fork" to "outlast the upstream EOL in late 2026"; or leave Chef for another tool. Cinc builds on OSU Open Source Lab infrastructure and works with Progress to stay consistent with the Chef trademark policy, which is why it isn't called Chef. Its server fork carries the risk every community fork carries: a small group now owns security response for a server that held every node's keys and cookbooks.

## The Alternatives

| Tool | Model | Strengths | Failure modes | License and owner (October 2026) | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Chef Infra** | Pull; node compiles Ruby recipes and converges in order | Full language; custom resources; Policyfile locks; the best testing chain (ChefSpec, Test Kitchen, InSpec) | Compile/converge bugs; every node holds its cookbooks; `normal` attributes persist; server end of life | Apache source; Progress EULA binaries with license keys | Subscription, prices not published | Teams with large Chef estates and Ruby skills |
| **Cinc** | Same as Chef | No EULA or keys; drop-in client | Community-funded; server fork is new | Apache 2.0; community | Free | Chef users who won't take the keys |
| **Puppet / OpenVox** | Pull; server compiles a catalog graph | Code stays on the server; dependency graph; PuppetDB | Compile servers; ordering by relationships; Puppet binaries licensed above 25 nodes | [Perforce, Puppet Core and OpenVox](/books/hosting-and-cloud/cfengine-and-puppet#perforce-puppet-core-and-openvox) | Free to 25 nodes or OpenVox; licensed above | Regulated fleets of long-lived hosts |
| **Ansible** | Push over SSH from a control node; YAML | No agent; easy to start; huge content library | No continuous correction without a scheduler; slow on big fleets | [Ansible and Salt](/books/hosting-and-cloud/ansible-and-salt#the-alternatives) | Free core; platform subscription | Orchestration, network devices, mixed fleets |
| **Salt** | Master and minions on an event bus | Fast fan-out; reacts to events | Single vendor's stewardship has shifted twice | [Ansible and Salt](/books/hosting-and-cloud/ansible-and-salt#salt-the-event-bus) | Free | Large fleets that need speed |
| **Bake the image instead** | Configure at build time, replace instead of converge | No drift by construction; fast boots | Every change is a rebuild and a rollout | Packer under BSL; cloud image builders | Build minutes and storage | Stateless fleets ([Baking vs Frying](/books/hosting-and-cloud/packer-and-images#baking-vs-frying)) |

Chef's distinctive bet, recipes as programs, is both its edge and its cost. It wins where configuration really is logic (generating per-tenant config from a search, platform-specific branches across Windows and Linux) and where a team will write tests. It loses to Ansible on the first day (no agent, no server, YAML) and to images on the thousandth (nothing to drift).

## My Default

My default for a new fleet is not to adopt Chef. For machines that can be replaced, I'd bake the configuration into images and replace them ([Baking Images: Packer](/books/hosting-and-cloud/packer-and-images#my-default)); for the ones that can't, I'd weigh OpenVox or Ansible first, because their licensing and server story is steadier as of October 2026 than Chef's.

For an existing Chef estate, which is where most Chef lives, my default is:

- **Policyfiles everywhere,** with roles and environments retired, every lock in version control, and promotion by pushing the same `revision_id` from group to group. A node's configuration is then an artifact with an id, which is what change management, rollback and audit all need.
- **Unified Mode and custom resources** for every new resource, `lazy` where a value truly isn't known until converge, and no `normal` attributes set from recipes.
- **The full test chain in CI:** ChefSpec for logic, Test Kitchen with two converges for idempotence on every supported platform, and the same InSpec profile as the verifier and as the production Compliance Phase.
- **Off the open-source server before it stops getting fixes.** I'd pick local mode from exported policies when the estate uses little search, Cinc Server when it depends on the server API and the team can carry a community fork, and Chef 360 when the company wants a vendor on the hook and will pay for one.

What would change this: a large estate of hosts that genuinely can't be rebuilt (hypervisors, stateful storage, customer-managed servers) with a team fluent in Ruby and an existing Chef 360 or Automate contract, where staying is cheaper than any migration; or a compliance program built on InSpec, which is worth keeping even if the converging tool changes.

## How to Build It

A provider meets Chef in its own fleet and, if it sells managed configuration or compliance, as a product. Either way the per-run record is [`convergence_runs`](/books/hosting-and-cloud/cfengine-and-puppet#how-to-build-it), owned by the CFEngine and Puppet chapter, with Chef's mapping:

- **`tool = 'chef'`** (Cinc runs are the same tool for this purpose); `trigger` is `interval` for the daemon or its scheduled task, `manual` for a run started by `knife` or a person, `event` for a Courier job raised by automation, `boot` for the first run from cloud-init.
- **`config_revision` is the Policyfile `revision_id`.** For nodes still on roles and environments there is no such id; store a hash of the expanded run-list and the resolved cookbook versions, which is the closest equivalent, and treat that gap as a reason to migrate.
- **Status from the run:** a successful run with resources updated is `changed`, with none updated `unchanged`, an exception `failed`; a why-run is `noop` or `unchanged` with `noop` set. Report handlers can post the counts; the full resource list stays in the report store.
- **`resource_id` comes from the node name.** Set `node_name` in `client.rb` to the provider's stable resource id (or record the mapping at bootstrap) rather than letting it default to a hostname, so a reimaged or renamed machine doesn't become a new node and a new machine with an old name doesn't inherit the old node's `normal` attributes.

Chef adds two records the generic table doesn't hold: which policy revision each group of nodes is meant to run, over time, and the InSpec results from the Compliance Phase.

```sql
CREATE TABLE policy_group_assignments (  -- which locked policy a group runs, over time
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id     UUID NOT NULL REFERENCES accounts (id),
  project_id     UUID REFERENCES projects (id),
  policy_name    TEXT NOT NULL,          -- Policyfile.rb name, e.g. 'web'
  policy_group   TEXT NOT NULL,          -- 'staging', 'production', 'canary'
  revision_id    TEXT NOT NULL,          -- from Policyfile.lock.json
  lock_ref       TEXT NOT NULL,          -- the lock file in an artifact store
  lock_sha256    TEXT NOT NULL,          -- what was pushed, so the record proves it
  vcs_commit     TEXT,                   -- the commit the lock came from
  pushed_by      TEXT NOT NULL,          -- typed actor: 'pipeline:<run id>', 'user:<id>'
  valid_during   TSTZRANGE NOT NULL,     -- from push until the next push to the group
  EXCLUDE USING GIST (account_id WITH =, policy_name WITH =, policy_group WITH =,
    valid_during WITH &&)                -- one revision per group at a time
);

CREATE TABLE compliance_control_results (  -- InSpec results from a run's Compliance Phase
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  convergence_run_id  UUID NOT NULL REFERENCES convergence_runs (id),
  resource_id         UUID NOT NULL REFERENCES resources (id),
  profile_name        TEXT NOT NULL,
  profile_version     TEXT NOT NULL,
  control_id          TEXT NOT NULL,
  impact              NUMERIC(2,1) NOT NULL CHECK (impact BETWEEN 0 AND 1),
  status              TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'skipped',
                        'waived', 'error')),
  waiver_ref          TEXT,              -- the waiver file entry and its expiry, if waived
  message             TEXT,
  CHECK ((status = 'waived') = (waiver_ref IS NOT NULL)),
  UNIQUE (convergence_run_id, profile_name, control_id)
);
```

Rollout progress is a join between what a group should run and what its nodes last ran:

```sql
SELECT a.policy_group, a.revision_id AS expected,
       count(*) FILTER (WHERE last.config_revision = a.revision_id) AS on_revision,
       count(*) FILTER (WHERE last.config_revision <> a.revision_id) AS behind,
       count(*) FILTER (WHERE last.status = 'failed') AS failing
FROM policy_group_assignments a
JOIN node_policy_groups n                -- resource_id, policy_name, policy_group
  ON n.policy_name = a.policy_name AND n.policy_group = a.policy_group
JOIN LATERAL (
  SELECT config_revision, status FROM convergence_runs r
  WHERE r.resource_id = n.resource_id AND r.tool = 'chef' AND NOT r.noop
  ORDER BY r.started_at DESC LIMIT 1
) last ON TRUE
WHERE a.policy_name = 'web' AND a.valid_during @> NOW()
GROUP BY a.policy_group, a.revision_id;
```

`node_policy_groups` is whatever records each node's `policy_name` and `policy_group` (the node object, or the provider's own inventory); it is a mapping, not new data. Design notes:

- **Promotion is a new row, never an edit.** Pushing a revision to `production` closes the previous row's range and opens a new one, so "which revision was production running at 14:02 on the day of the incident" is a range lookup, the same effective-dating rule as [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#tenancy-money-and-time). A rollback is a push of an older revision: a new row pointing at an old id.
- **Compliance results are rows, not a dashboard.** One row per control per run lets a provider show, for any customer VM or its own hypervisor, which controls passed at any past date, and lets waivers carry their own expiry. The Shared Responsibility & Compliance Programs chapter's attestations can cite these rows as evidence.
- **Meter managed nodes.** A provider selling managed configuration or compliance bills per managed node per period, the `convergence.managed_node` meter the CFEngine and Puppet chapter defines; InSpec's tiers count audit targets, and Chef 360 runs its own consumption collection for the same reason.
- **Events:** `policy.promoted`, `policy.rolled_back` and `compliance.control_failed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to alerting and the change log.

## Auditing

- **What each group ran, when.** Every policy push with its revision, lock hash, commit and actor, so the configuration in force at any moment is provable and a change can be traced to its review.
- **Every node's runs.** Per-run status, counts and report pointer in `convergence_runs`, so "this server was converged on the approved revision" is a query.
- **Compliance by control.** InSpec results per run, with waivers and their expiry, kept for as long as the compliance program that relies on them requires.
- **License position.** Nodes and audit targets per product over time, against the subscription or the free tier (InSpec Free stops at 10 targets).
- **Keys and validators.** When each node's client key was issued, and when the organization's validator key was last rotated, because a leaked validator lets anyone register a node and receive its cookbooks.

## What This Means for the System You Build

- **Know which phase your code runs in:** compile-time reads see the machine before the run; use `lazy`, Unified Mode or `compile_time` deliberately.
- **Make every resource idempotent,** with guards on `execute` and `converge_if_changed` in custom resources, and test it with a second converge.
- **Lock configuration as an artifact:** Policyfile locks with a `revision_id`, promoted unchanged from group to group.
- **Retire roles, environments and `normal` attributes** as sources of silent, unreviewed change.
- **Test in layers:** ChefSpec for logic, Test Kitchen on real platforms, InSpec as both verifier and production compliance.
- **Keep the proof separate from the change:** the compliance profile shouldn't care which tool converged the machine.
- **Name nodes by a stable resource id,** not a hostname.
- **Plan for the server's end of life now:** Chef 360, Cinc Server, or local mode from exported policies, chosen before fixes stop.
- **Know whose binaries you run:** the source is Apache 2.0, but the official client, InSpec and knife come with keys.

## References

**Documentation**

- [Chef: Chef Infra Client overview (19)](https://docs.chef.io/client/19/), the twelve stages of a run, the compile and execution phases, Ohai, handlers and the Compliance Phase
- [Chef: Resources (19)](https://docs.chef.io/client/19/resources/), a resource's type, name, properties and actions, and default actions
- [Chef: Common resource functionality (19)](https://docs.chef.io/client/19/resources/common_functionality/), guards, `guard_interpreter`, notifications and timers, `lazy`, `compile_time`, `ignore_failure`, `retries`, `sensitive` and the `:nothing` action
- [Chef: Custom resources (19)](https://docs.chef.io/client/19/resources/custom/), the `resources/` directory, `property`, `action`, `provides` and Unified Mode as the default from Chef Infra Client 18
- [Chef: Attribute precedence (18)](https://docs.chef.io/client/18/cookbooks/attributes/attribute_precedence/), the six types and fifteen levels, role and environment order, force levels and the `rm_*` methods
- [Chef: Roles (19)](https://docs.chef.io/client/19/policy/roles/), run-lists, default and override attributes, and the warning against `env_run_lists`
- [Chef: Environments (19)](https://docs.chef.io/client/19/policy/environments/), cookbook version constraints and the read-only `_default` environment
- [Chef: Policyfiles (19)](https://docs.chef.io/client/19/policy/policyfile/), immutable bundles, the lock file, policy groups, `client.rb` settings and the `chef` commands
- [Chef: chef-solo (19)](https://docs.chef.io/client/19/features/chef_solo/), running without a server and what that gives up
- [Chef: Supermarket](https://docs.chef.io/supermarket/), the public and private cookbook registry
- [Chef: Chef Infra Client 19 license](https://docs.chef.io/client/19/license/), which distributions run without a license key
- [Chef: InSpec 7.3](https://docs.chef.io/inspec/7.3/), profiles, controls, resources and cloud resource packs
- [Chef: Chef 360 Platform architecture](https://docs.chef.io/360/1.0/architecture), node management, Courier job orchestration, licensing services and tenants
- [Chef: Chef 360 skills](https://docs.chef.io/360/1.5/node_management/skills), skills, canister skills as Habitat packages, and the Courier Runner
- [Test Kitchen](https://kitchen.ci/), drivers, provisioners, verifiers and the five lifecycle commands
- [Chef: Licensing tiers FAQ](https://www.chef.io/licensing-tiers-faq), InSpec's Free, Trial and Commercial tiers and the source and Cinc exemptions

**Release notes and repositories**

- [GitHub: chef/chef](https://github.com/chef/chef), the first commit on March 6, 2008 and the Apache-2.0 license
- [GitHub: chef/chef at 0.5.2](https://github.com/chef/chef/tree/0.5.2), the "Chef Release 0.5.1" commit of January 15, 2009 and the earliest surviving tag
- [GitHub: chef/chef, lib/chef/application/client.rb](https://github.com/chef/chef/blob/main/lib/chef/application/client.rb), the 1,800-second default interval when daemonized and the Windows interval restriction
- [GitHub: chef/chef, lib/chef/local_mode.rb](https://github.com/chef/chef/blob/main/lib/chef/local_mode.rb), local mode starting a chef-zero server
- [GitHub: inspec/inspec](https://github.com/inspec/inspec), the first commit on April 9, 2015 and the 0.3.3 and 1.0.0 tags
- [GitHub: habitat-sh/habitat](https://github.com/habitat-sh/habitat), the first commit on May 22, 2015
- [GitHub: chefspec/chefspec](https://github.com/chefspec/chefspec), ChefSpec as a unit testing framework for cookbooks
- [GitHub: berkshelf/berkshelf](https://github.com/berkshelf/berkshelf), the deprecation notice and the advice to migrate to Policyfiles
- [Chef: InSpec 6.6.0 release notes](https://packages.chef.io/release-notes/inspec/6.6.0.md), "Chef InSpec now requires a license key to run"

**Announcements**

- [Jesse Robbins: Announcing Mitch Hill as new CEO of Opscode (archived)](http://web.archive.org/web/20190929000859/https://blog.chef.io/announcing-mitch-hill-as-new-ceo-of-opscode-jesse-robbins-role-as-chief-community-officer/), HJK Solutions, the four founders in June 2008 and incorporation on September 12, 2008
- [Adam Jacob: Happy birthday, Chef](https://www.chef.io/blog/happy-birthday-chef), the first public release on January 16, 2009
- [Chef: Chef 10.14.0 released](https://www.chef.io/blog/chef-10-14-0-released), why-run mode and its assumptions, September 8, 2012
- [Chef: Custom resources in Chef Client 12.5](https://www.chef.io/blog/custom-resources-in-chef-client-12-5), November 6, 2015
- [Chef: Chef Infra Server transitions to the Chef 360 platform](https://www.chef.io/blog/chef-infra-server-transitions-to-chef-360-platform), deprecation, the end of fixes after October 2026 and end of life in November 2026, November 26, 2025
- [Chef: Changes to runtime licensing for Chef gem users](https://www.chef.io/blog/changes-to-runtime-licensing-for-chef-gem-users), license keys for gem installs, `knife` and Test Kitchen, February 3, 2026
- [Chef: Upcoming deprecation and end-of-life updates for Progress Chef products](https://www.chef.io/blog/upcoming-deprecation-and-end-of-life-updates-for-progress-chef-products), the product-line table, August 20, 2026
- [Cinc](https://cinc.sh/), the community distribution, its components, the Cinc Server fork and OSU Open Source Lab hosting

**Filings**

- [Progress Software: Form 8-K (October 2020)](https://www.sec.gov/Archives/edgar/data/876167/000087616720000151/prgs-20201005.htm), completion of the Chef acquisition on October 5, 2020, the price, escrow and credit facility draw

**In practice**

- [DevClass: Chef says it's going 100% open source](https://devclass.com/2019/04/02/chef-says-its-going-100-open-source-forks-optional/), the April 2, 2019 licensing change and the comment on forks
- [Stelligent: ChefConf 2016](https://stelligent.com/2016/07/21/chefconf-2016/), Habitat's June 2016 announcement and Chef Automate's launch
- [Puppet: AWS OpsWorks end of life](https://www.puppet.com/blog/puppet-aws-opsworks), "AWS OpsWorks used to provide managed instances of Puppet and Chef", June 7, 2024
