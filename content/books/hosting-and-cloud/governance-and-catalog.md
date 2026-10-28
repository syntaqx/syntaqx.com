+++
title = "Governance, Guardrails & the Resource Catalog"
nav_title = "Governance & Catalog"
description = "Landing zones and account vending, guardrails from organization policy to runtime, tags and owners, exceptions that expire, and the catalog of what runs."
category = "Hosting & Cloud Industry"
order = 2145.5
part = "Infrastructure as Code"
tags = ["governance", "policy-as-code", "landing-zones", "tagging", "inventory"]
+++

A company with three cloud accounts governs them by knowing them. A company with sixty can't: accounts are created by whoever needs one, nobody can say which team owns the database that just paged, a public bucket appears in an account no policy covers, and the security team learns about a new region from the bill. The answer every provider now sells is the same shape. A **landing zone** decides where new accounts go and what they inherit; **guardrails** at several layers stop, catch or fix configurations the organization never allows; **tags and owners** make every resource answerable to a team; and a **catalog** says what exists, who owns it and how fresh that knowledge is. Without the catalog, none of the rest can be checked.

This chapter is the organization-wide layer. The account tree, service control policies and the `permission_ceilings` they become are [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it); policy against a single plan, run tasks and the plan-and-apply platforms are [Testing, Policy, Secrets & IaC Platforms](/books/hosting-and-cloud/iac-testing-policy-and-secrets#policy-as-code-at-plan-time); admission policy inside a cluster is [Multi-Tenancy, Policy & Security](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy#admission-control); the audit programs that consume the evidence are [Compliance Programs](/books/hosting-and-cloud/compliance-programs); cost tags in billing data are [Cost Data, FinOps & Surprise Bills](/books/hosting-and-cloud/finops-and-surprise-bills#cost-exports-cur-and-focus). The playbook's rules are [Policy as Code](/docs/delivery/infrastructure-as-code#policy-as-code), [Detect Drift](/docs/delivery/infrastructure-as-code#detect-drift), [Every Dollar Has an Owner](/docs/operations/cost-and-finops#every-dollar-has-an-owner) and [The Service Catalog](/docs/engineering/code-ownership#the-service-catalog). What follows is how the providers implement them, how the pieces fit, and the schema that ties guardrails, owners, exceptions and inventory to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Product status and prices are as of October 2026.

## How the Providers Do It

| Provider | Landing zone and vending | Grouping | Organization guardrails | Detective and posture | Inventory |
| --- | --- | --- | --- | --- | --- |
| **AWS** | Control Tower builds a landing zone with an Account Factory built on Service Catalog provisioned products; Account Factory for Terraform (AFT) vends accounts from a `git push`; Landing Zone Accelerator (v1.16.3, September 2026) for regulated estates | Organizational units in AWS Organizations | Service control policies (identities) and resource control policies (resources); tag policies | Control Tower detective controls on AWS Config rules; conformance packs; Security Hub CSPM | AWS Config with organization aggregators; Resource Explorer |
| **Azure** | Azure landing zones in the Cloud Adoption Framework: one platform landing zone per Entra tenant, workload landing zones distributed by subscription vending | Management groups, up to six levels, 10,000 per directory | Azure Policy with `deny`, `modify`, `deployIfNotExists` and eight other effects, assigned at management groups | Azure Policy compliance; Defender for Cloud (Foundational CSPM free, Defender CSPM paid) | Azure Resource Graph (KQL), 14 days of change history |
| **Google Cloud** | Enterprise foundations blueprint and its Apache-2.0 `terraform-example-foundation` repository, deployed in numbered stages | Folders under an organization | Organization Policy: managed constraints and CEL custom constraints, with dry run | Security Command Center (Standard, Premium; Enterprise deprecated) | Cloud Asset Inventory, 35 days of history, BigQuery export |
| **HashiCorp (HCP Terraform)** | Projects, the private registry and no-code provisioning vend workspaces rather than accounts | Organization, projects, workspaces and Stacks | Policy sets in Sentinel, OPA or Terraform policy, scoped to the organization, projects, workspaces or tags | Health assessments: drift detection and continuous validation (Standard and Premium) | Explorer over workspaces, modules, providers and Terraform versions |

Three patterns run through the table:

- **Every cloud ships the same four parts and names them differently.** A tree of scopes, a way to stamp out a new scope with a baseline, rules attached high in the tree that every child inherits, and a queryable inventory. The vendors' frameworks (Control Tower, the Azure landing zone, Google's foundation blueprint) are opinions about how to assemble the parts, packaged as code.
- **Prevention lives at the organization; detection lives with the inventory.** The rules that refuse an API call (SCPs, RCPs, `deny`, Organization Policy) evaluate at request time and need nothing stored. The rules that report on what already exists (AWS Config, Azure Policy audit, Security Command Center) are only as good as the inventory under them, which is why each cloud's posture product sits on its inventory service.
- **None of them governs the others.** Each cloud's guardrails and inventory stop at its own boundary, and HCP Terraform governs only what passes through its runs. An estate across two clouds and a Kubernetes fleet needs a layer above all of them, which is what the cross-cloud query tools and service catalogs below exist to fill.

## How We Got Here

| When | What happened | Problem it solved | What it cost |
| --- | --- | --- | --- |
| February 27, 2017 | AWS Organizations generally available, with service control policies to "centrally control AWS service use across multiple AWS accounts" and accounts created by API | One payer for many accounts; one place to deny whole services | Accounts became cheap to create, so their number grew faster than anyone's knowledge of them |
| June 24, 2019 | AWS Control Tower generally available: a landing zone with "pre-configured guardrails," at no extra charge beyond the services it enables | A prescribed multi-account baseline instead of each company designing its own | An opinionated structure that later customizations have to fit around |
| March 16, 2020 | Spotify open-sources Backstage; CNCF accepts it on September 8, 2020 and moves it to Incubating on March 15, 2022 | A software catalog with an owner on every entity, kept as files next to the code | Someone has to run it, and its entries are only as current as the files |
| April 3, 2023 | AWS Service Catalog adds Terraform products; after Terraform's license change, AWS renamed the product type from Terraform Open Source to External and stopped accepting the old type for new products | Approved infrastructure as a self-service menu in tools teams already use | One more catalog of templates to keep in step with the modules it wraps |
| November 14, 2023 | AWS Resource Explorer adds multi-account search across an organization, at no additional charge; it became enabled by default on October 6, 2025 | Find a resource by name, tag or ID without knowing which account holds it | Eventually consistent, with no published lag |
| November 13, 2024 | Resource control policies: maximum permissions on resources, at launch for S3, STS, KMS, SQS and Secrets Manager | A data perimeter that holds even when a bucket policy grants an outsider access | A second policy type to test before attaching at the root |
| November 20, 2025 | Tag policies gain required-tag reporting (`report_required_tag_for`) and a managed CloudFormation hook that warns or fails deployments missing required tags | Untagged resources had never been evaluated by tag policies at all | Enforcement lives in each IaC tool's integration, not in the API |
| July 16, 2026 | HashiCorp makes Terraform policy (tfpolicy), an HCL policy framework, generally available in HCP Terraform, evaluating "before and after deployment" | Policy in the language the infrastructure is written in, checked against real state | A third policy language beside Sentinel and OPA |
| July 31, 2026 to January 31, 2027 | Azure Blueprints (Preview) retires in phases; Microsoft points customers to Deployment Stacks and Template Specs | Blueprints never left preview; environment setup moved to plain infrastructure as code | A migration for every estate that built on it |

The arc is from **ceilings to baselines to catalogs.** The first tools could only say no to whole services; the landing zone tools added a baseline every new account starts from; the newest work (required tags, policy after deployment, organization-wide search) is about knowing and checking what already exists, because most violations in a large estate are not new requests but old resources nobody looks at.

## Landing Zones and Account Vending

A landing zone is the structure plus the process. AWS defines it as "a well-architected, multi-account environment" that is "the enterprise-wide container that holds all of your organizational units (OUs), accounts, users, and other resources"; Microsoft splits it into a **platform landing zone** (governance, security and shared resources, "only one platform landing zone per Microsoft Entra tenant" for most organizations) and **workload landing zones**, one per workload, holding every environment that workload needs. The vending process is what keeps the structure honest as it grows: Microsoft says that "as the number of workload landing zone requests grows, automation becomes increasingly important," and AWS calls Account Factory a "vending machine."

What a vended account or subscription arrives with is the same everywhere:

- **A place in the tree.** Azure's baseline puts platform subscriptions under Security, Management, Identity and Connectivity management groups, workload subscriptions under Online, Internal ("Corp") or Local under a Landing zones group, plus Sandbox and Decommissioned. Google's foundation repository creates bootstrap, common and network folders, then development, nonproduction and production folders with business-unit subfolders. Placement is the decision that matters most, because every inherited policy and role follows from it, and Azure puts every new subscription under the tenant root group by default until something moves it.
- **Shared accounts it reports into.** Control Tower and Landing Zone Accelerator centralize logs in a log archive account, with an audit account beside it; Google's 1-org stage builds shared logging, Security Command Center, KMS and secrets projects. The workload account can't turn its own logging off, because the rules that prevent it are attached above it.
- **A baseline of controls and networking.** Control Tower's controls are mandatory (always applied), strongly recommended or elective. Google's stages build a Shared VPC or hub-and-spoke network per environment before any business-unit project exists.
- **An owner.** AFT stores "account metadata and audit history" and applies account-level tags. The request that creates the account is the natural moment to name the team that owns it, and the last moment it is cheap to ask.

The frameworks are code. AFT supports HCP Terraform, Terraform Enterprise and the community edition, takes an account request file through a pipeline, and applies customizations to all accounts, a set of accounts or individual accounts; AWS says its pipeline is "solely for automated provisioning and customizing" of accounts, not for application resources. Landing Zone Accelerator is installed from a CloudFormation template that deploys a CodePipeline, reads its configuration files from an `aws-accelerator-config` bucket, can include a manual review stage, and "will not, by itself, make you compliant." Google's foundation is seven Terraform stages, from `0-bootstrap` (state bucket, service accounts, CI/CD project) to `5-app-infra`. Two traps recur. Control Tower's controls don't bind the management account, by design ("this exception is intentional"), so nothing runs there except the organization itself. And Azure Resource Manager caches the management group hierarchy for up to 30 minutes, so a vending pipeline that moves a subscription and immediately checks its policies can see the old ones.

The **Well-Architected** frameworks are the review half of the same idea: AWS's framework (current revision November 6, 2024) and its free Well-Architected Tool, and Azure's five pillars (reliability, security, cost optimization, operational excellence, performance efficiency) with an assessment tool. AWS is explicit that a review "is a constructive conversation about architectural decisions, and is not an audit mechanism." They are what a workload is checked against when it moves into its landing zone, not guardrails.

## Guardrails by Layer

A guardrail is one rule, written in plain words, enforced or checked by some engine. Control Tower's definition fits all of them: "a high-level rule that provides ongoing governance for your overall AWS environment," of three kinds. **Preventive** controls stop the action (SCPs and RCPs). **Detective** controls find what exists out of policy (AWS Config rules). **Proactive** controls check a resource "before the resources are provisioned" and refuse it (CloudFormation hooks). A fourth behavior is **corrective**: fix the resource after the fact, which Azure Policy does with `modify` and `deployIfNotExists` remediation and AWS Config does with Systems Manager Automation documents. The same rule usually needs more than one layer:

| Layer | When it acts | AWS | Azure | Google Cloud | Elsewhere |
| --- | --- | --- | --- | --- | --- |
| **Organization** | On every API request, in every account below the attachment | SCPs, RCPs, tag policies | Azure Policy `deny`, `denyAction`, `modify`, `append` at management groups | Organization Policy constraints, custom constraints | Provider-level ceilings ([`permission_ceilings`](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it)) |
| **Plan time** | Before an apply, on the plan document | CloudFormation hooks (Control Tower proactive controls; the tag policy hook) | What-if, plus pipeline checks | Pipeline checks | Sentinel, OPA, Terraform policy, Checkov, run tasks ([plan-time policy](/books/hosting-and-cloud/iac-testing-policy-and-secrets#policy-as-code-at-plan-time)) |
| **Admission** | When a Kubernetes object is created or changed | EKS with Kyverno or Gatekeeper | Azure Policy for AKS, which extends Gatekeeper | GKE Policy Controller | ValidatingAdmissionPolicy, Kyverno, Gatekeeper ([policy engines](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy#policy-engines-kyverno-and-gatekeeper)) |
| **Runtime and detective** | Continuously, against what exists | AWS Config rules and conformance packs, Security Hub CSPM | Azure Policy `audit` and `auditIfNotExists`, Defender for Cloud | Security Command Center | Steampipe and Powerpipe controls, CMDB reconciliation |

### Organization policy

**AWS.** SCPs limit what principals in member accounts can do; RCPs, since November 13, 2024, set "the maximum available permissions for resources," so an RCP on an S3 bucket in an organization account applies "even when accessed by users from Account B" outside the organization. Neither grants anything: "No permissions are granted by an RCP." RCPs don't affect resources in the management account, don't restrict service-linked roles, and don't apply to AWS managed KMS keys. AWS "strongly recommends" not attaching them at the root before testing on single accounts and working upward, watching CloudTrail for denials. The SCP evaluation model, deny at any level wins, is covered in [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#how-the-providers-do-it).

**Azure Policy** puts one `effect` in each definition and evaluates them in a fixed order: `disabled`, then `append` and `modify` (which can change the request), then `deny`, `audit`, `manual`, `auditIfNotExists`, and `denyAction` last; after the resource provider succeeds, `auditIfNotExists` and `deployIfNotExists` run. Assignments at different scopes are evaluated independently, and the result is "cumulative most restrictive," so a resource can't slip through a gap between a subscription's rule and a resource group's. Existing resources are evaluated but not changed: `modify` and `deployIfNotExists` fix them only through **remediation tasks**, which run as the assignment's managed identity (one per assignment), remediate 500 resources by default and up to 50,000 per task, 10 in parallel by default.

**Google Cloud Organization Policy** governs what configurations are allowed, where IAM governs who can act. Each policy enforces exactly one constraint, in active mode, dry-run mode (violations audit-logged, not denied) or both. Managed constraints have list or boolean parameters set by the service; custom constraints name a resource type, method types (`CREATE`, `UPDATE`), a CEL condition up to 1,000 characters and an `ALLOW` or `DENY` action, and most resource types support up to 20 of them. Policies set on an organization or folder apply to descendants unless overridden, and they usually don't apply retroactively: an existing resource that violates a new policy keeps working and has to be fixed by hand. The Policy Simulator tests a change before it is enforced.

### Plan time and admission

Plan-time policy is the cheapest place to catch a mistake, because the pull request is still open and the author is still looking; [Testing, Policy, Secrets & IaC Platforms](/books/hosting-and-cloud/iac-testing-policy-and-secrets#policy-as-code-at-plan-time) covers the engines. What the organization layer adds is that the same rule must exist where plans don't reach: a console change, a script, a vendor's integration, or a provider API called directly never produce a plan. AWS's answer is to run the rule in CloudFormation hooks and organization policy as well, and Azure's is to evaluate at the Resource Manager request whatever tool sent it. Admission control is the same idea for Kubernetes objects, owned by the Kubernetes part of this volume.

### Runtime and detective controls

Detective controls answer "what exists that shouldn't?" AWS Config rules evaluate recorded configuration items; a **conformance pack** is "a collection of AWS Config rules and remediation actions" deployed as one YAML template to an account and region or across an organization, and remediation runs Systems Manager Automation documents, manually or automatically. Security Hub CSPM (the name AWS's documentation now uses for the posture product) runs the AWS Foundational Security Best Practices, CIS, PCI DSS and NIST standards as controls, mostly through service-linked Config rules, so Config must be recording first; it sees only findings generated after it is enabled, only in regions where it is enabled, and CIS compliance needs it in every supported region. Microsoft's Defender for Cloud includes free Foundational CSPM (the Microsoft cloud security benchmark, secure score and agentless AWS and Google Cloud connectors) and a paid Defender CSPM plan whose **governance rules** assign recommendations to resource owners and track them. Google's Security Command Center has Standard and Premium tiers; its Enterprise tier is deprecated, shutting down May 21, 2027, and with it the AWS and Azure connectors listed under that tier.

My rule for which layer gets a rule: **preventive where the rule has no legitimate exception, detective everywhere, corrective only where the fix can't break a running workload.** Denying public storage at the organization layer is cheap and absolute; detecting it anyway catches what was created before the policy existed, which Organization Policy and tag policies won't touch; auto-remediating it is safe for a tag and dangerous for a security group a production service depends on.

## Tags and Ownership

Tags are how a guardrail, a bill and a runbook find the team behind a resource, and each cloud implements them differently:

- **AWS** tags are key-value pairs, case-sensitive on both sides, with an omitted value equal to an empty string. **Tag policies** standardize keys, case and allowed values and can block noncompliant tagging operations on named resource types, but "untagged resources or tags that aren't defined in the tag policy aren't evaluated." Required tags arrived separately on November 20, 2025: `report_required_tag_for` marks keys "mandatory for resource creation," enforced for CloudFormation by the managed `AWS::TagPolicies::TaggingComplianceValidator` hook in `WARN` or `FAIL` mode, with Terraform users pointed to the AWS provider's own tag policy compliance guide. Cost allocation tags must be activated from the management account; a new key can take up to 24 hours to appear for activation and up to 24 hours more to activate.
- **Azure** tags don't inherit by default. Microsoft's own tag governance pattern is two policies: `deny` resource groups created without the `CostCenter` tag, and `modify` resources to `add` it from the resource group when missing (`addOrReplace` when the value may not differ from the group's). Existing resources change only through remediation tasks.
- **Google Cloud** has two mechanisms. **Labels** are per-resource metadata, not inherited, usable to filter billing. **Tags** are separate resources (keys and values defined at the organization or project, bindings granted by IAM), inherited by descendants, and usable in IAM allow and deny conditions and Organization Policy conditions. A label describes a resource; a tag can decide what happens to it.

Of all the tags, the owner is the one that matters most. Every runbook starts with "who owns this," every finding needs someone to route to, every budget needs a person to alert, and every orphaned resource is one whose owner left. My rule is that ownership is not a free-text tag: it is a reference to a team that exists, assigned at vending time on the account or project and inherited down, overridden on a resource only when a different team really runs it, with the tag on the cloud resource generated from that record rather than typed by hand. A tag value can be anything; a team reference can be checked, and when a team is disbanded every resource it owned shows up in one query.

## The Resource Catalog

The catalog is the list of what exists, who owns it and how sure the organization can be. Each cloud keeps its own, and they differ most in freshness and history:

| Inventory | What it catalogs | Freshness | History | Scope and query | Cost (October 2026) | Gaps |
| --- | --- | --- | --- | --- | --- | --- |
| **AWS Config** | Configuration items for supported resource types | Continuous or daily recording | Retention from 30 days to 7 years (2,557 days, the default) | Organization aggregators, a read-only replicated view; advanced query is a subset of SQL `SELECT` with no `JOIN`, `DISTINCT` or `HAVING` and no deleted resources | $0.003 per continuous and $0.012 per periodic configuration item, first 100,000 rule evaluations $0.001 each (US East); aggregators free | Unrecorded types get only create and delete; global types added after February 2022 recorded in their home region only |
| **AWS Resource Explorer** | Resources by name, tag and ID | Eventually consistent, from CloudTrail events; no published lag | None | Aggregator index per organization | No charge to search | Search, not configuration detail |
| **Azure Resource Graph** | Resources, policy states, changes | Indexed "with a short latency" on change notifications plus regular full scans; not strongly consistent | 14 days of configuration changes, available in under five minutes | Subscriptions, management groups or tenant; KQL | Free, throttled (15 queries per 5 seconds per user, 1,000 rows per response) | No snapshots of deleted resources |
| **Google Cloud Asset Inventory** | Resource metadata, IAM and organization policies, OS inventory; relationships with SCC Premium | "Periodic data synchronization," not built for real-time queries; Pub/Sub feeds for changes | 35 days of create, update and delete history | Project, folder or organization; export to BigQuery or Cloud Storage | Free; storage of exports billed | Relationships need a paid tier |
| **Steampipe** | Any API with a plugin (150+), as Postgres foreign tables | Live at query time | None unless exported | SQL across clouds and SaaS; Powerpipe adds 5,000+ open controls | AGPL-3.0 CLI, Apache-2.0 plugin SDK | Query cost and rate limits land on the source APIs; no history |
| **CloudQuery** | Cloud and SaaS APIs extracted to a destination (Postgres, BigQuery, Snowflake) | As often as syncs run | Whatever the destination keeps | SQL in the destination | Priced on rows synced per year, counted on every sync; free to 1 million rows | Official integrations moved from free to paid on April 22, 2024; SDKs remain MPL |

Two kinds of catalog sit above inventories. **Service catalogs** list what may be created: AWS Service Catalog organizes CloudFormation or External (Terraform) products into portfolios shared with accounts, with launch constraints (the role it provisions as), template constraints and notification constraints, and a provisioned product "is a stack"; HCP Terraform's no-code modules are the same idea for Terraform. **Software catalogs** list what runs and who owns it: Backstage's entities (Component, API, Resource, System, Domain, Group, User, Template, Location) live in `catalog-info.yaml` files beside the code, `spec.owner` is required on a Component, and relations such as `ownedBy`, `dependsOn` and `partOf` connect a service to the databases it uses and the team that runs it; Backstage notes that `ownedBy` is for display, not runtime authorization. A **CMDB** is the older form of the same record, configuration items and their relationships kept for IT service management; ServiceNow's Discovery fills one from cloud APIs on schedules and can take change events from AWS Config, and Microsoft suggests Resource Graph's change feed to "keep an up-to-date Configuration Management Database."

The catalogs fail in the same ways. **Freshness differs by source,** so the catalog has to record when each fact was last confirmed and by what; a Resource Graph row and a nightly CloudQuery sync can disagree for a day and both be right. **Declared and discovered don't match:** a Backstage Resource that names a database that no longer exists, and a database no catalog file mentions, are both findings. **Coverage is partial:** every inventory lists types it doesn't record, and the gap is where the unmanaged resources live. The useful catalog joins the three views (what the IaC state says, what the cloud inventory says, what the software catalog claims), and its most valuable output is the list of disagreements.

## HashiCorp's Governance Layer

HCP Terraform is the one product in the table that governs through the provisioning tool rather than the cloud, so its reach is exactly what its runs touch.

- **Structure.** Every workspace and Stack belongs to exactly one **project**; every organization has an undeletable Default Project, where new workspaces land unless placed elsewhere. Project permissions (Essentials, Standard and Premium) let a team create and manage workspaces in its own project without seeing others.
- **Policy sets.** A collection of policies checked against every run's plan, applied globally, to projects, workspaces or Stacks, or to workspaces with given tags, with exclusions. Versions come from a connected repository, the Policy Sets API or the `tfe_policy_set` resource. Enforcement levels depend on the engine: OPA is advisory or mandatory; Sentinel is advisory, soft mandatory or hard mandatory; Terraform policy is advisory, mandatory overridable or mandatory. Overrides are narrower than they look: OPA mandatory failures can be overridden by users with the Manage Policy Overrides permission, and a Sentinel hard-mandatory policy can be overridden only if its policy set allows policy-level overrides. The Free tier allows one policy set of up to five policies; evaluations on self-managed agents need Premium.
- **Terraform policy.** Generally available on July 16, 2026, tfpolicy writes policy in HCL and lets teams enforce requirements "based on actual infrastructure state" as well as planned changes. It is HashiCorp's first policy engine aimed at what exists as well as what is proposed.
- **Vending through modules.** A module version marked No-code Ready in the private registry lets a user create a workspace and start its first run "without writing any Terraform configuration" (Standard and Premium). The workspace is placed in a project at creation, and module upgrades are offered, never applied: "HCP Terraform does not automatically update workspaces."
- **Drift and validation.** Health assessments (Standard and Premium) run **drift detection** and **continuous validation** of preconditions, postconditions and `check` blocks on a schedule after the last apply or assessment; they need remote or agent execution and a successful apply, never change infrastructure, and cover configuration drift only. An organization owner can enforce them on every eligible workspace. **Explorer** queries workspaces, modules, providers and Terraform versions, with built-in views such as drifted workspaces and workspaces with failed checks; it doesn't save query results.

Prices per managed resource are in [The Plan-and-Apply Platforms](/books/hosting-and-cloud/iac-testing-policy-and-secrets#the-plan-and-apply-platforms). The strength is one place for policy, modules, drift and approvals; the limit is that a resource created outside HCP Terraform is invisible to all of it, which is why it complements a cloud's own guardrails and inventory and doesn't replace them.

## Exceptions, Drift and Evidence

Every guardrail program grows exceptions, and the programs that work treat them as first-class records with an end date. Azure's exemption object is the model the others approximate: it names an assignment (and optionally which definitions in an initiative), a category of **waiver** ("the non-compliance state of the resource is temporarily accepted") or **mitigated** ("the policy intent is met through another method"), free-form metadata such as `requestedBy`, `approvedBy` and `ticketRef`, and an optional `expiresOn`. When it expires, the exemption isn't deleted: "The object is preserved for record-keeping, but the exemption is no longer honored." Creating one needs the `exempt/Action` verb on the assignment, not just write access to the resource, and exempt resources report a compliance substate showing what they would be without it. Elsewhere the exception is weaker: a Checkov skip is a comment, a Sentinel soft-mandatory override is a one-run decision, an InSpec waiver carries its own expiry ([Chef](/books/hosting-and-cloud/chef#how-to-build-it)'s `compliance_control_results` records it as `waived`). My rule: every exception has a category, a named approver who isn't the requester, a reason, a compensating control if it claims to be mitigated, and an expiry no longer than the rule allows; an expired exception reopens its findings automatically, and the owner hears about it two weeks before.

Drift needs the same discipline. A drift finding from a health assessment, a scheduled plan or a Config rule has three honest outcomes: the change was wrong and gets reverted, the change was right and gets written into code, or the resource shouldn't be managed by that state at all and gets moved out on purpose. Auto-reverting is tempting and wrong as a default, because drift is often an incident responder's fix; detection opens a finding with an owner, and the owner decides.

**Evidence** is what auditors sample. The records above (which guardrails were in force, at which scope, in which mode, with what results, which exceptions were granted by whom and for how long, and how each finding was resolved) are the control evidence [Compliance Programs](/books/hosting-and-cloud/compliance-programs#how-to-build-it) points to, and they are only evidence if they are append-only and kept for the audit period plus the auditor's sampling window.

## The Alternatives

| Approach | Model | Strengths | Failure modes | License and owner | Cost (October 2026) | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **The cloud's landing zone service** (Control Tower, Azure landing zone accelerators, Google foundation blueprint) | Prescribed structure, vending and controls from the provider | Fast to a known-good baseline; provider-maintained controls; native evidence | One cloud each; customizations fight the opinions; Azure Blueprints shows a provider's governance product can retire | Proprietary services; accelerators and the Google foundation are open code | Control Tower no extra charge beyond the services it enables | Most single-cloud enterprises |
| **Landing zone as your own code** (AFT customizations, Landing Zone Accelerator, a forked foundation repository) | Your pipeline deploys the tree, accounts and baseline | Reviewable, versioned, matches the rest of your IaC | You own upgrades of a large codebase; drift between the code and the console | Apache-2.0 repositories (AWS, Google) | The pipelines and services they deploy | Regulated estates, platform teams |
| **HCP Terraform as the governance layer** | Projects, policy sets, private registry, no-code, health assessments | One place for modules, policy, drift and approvals across clouds | Sees only what its runs touch; per-resource pricing; IBM's roadmap | Proprietary SaaS; IBM | Essentials from $0.10 per managed resource a month, rated hourly | Enterprises standardized on Terraform |
| **CSPM products** (Security Hub CSPM, Defender for Cloud, Security Command Center, third parties) | Detective controls and posture scores over inventory | Large built-in benchmarks; multicloud connectors in some | Detect, don't prevent; alert volume; connectors tied to paid tiers | Proprietary | Free foundational tier in Defender for Cloud; paid tiers above it | Security teams |
| **Cross-cloud SQL** (Steampipe and Powerpipe, CloudQuery) | Query or sync every API into SQL, controls as queries | One language over every cloud and SaaS; open controls | Freshness is the sync or the query; API rate limits; CloudQuery's integrations are paid | AGPL-3.0 (Steampipe); paid integrations, MPL SDKs (CloudQuery) | Free CLI; CloudQuery by rows synced | Platform and security engineers |
| **Software catalog plus CMDB** (Backstage, ServiceNow) | Declared ownership and relationships, reconciled with discovery | Owners and dependencies, not just resources | Declared entries rot; a CMDB nobody trusts is worse than none | Apache-2.0, CNCF Incubating (Backstage); proprietary (ServiceNow) | Self-hosted (Backstage); licensed (ServiceNow) | Engineering orgs at scale; ITSM-driven enterprises |

## My Default

My default for a company past a handful of accounts on one cloud is that cloud's landing zone framework deployed as code (AFT or Landing Zone Accelerator on AWS, an Azure landing zone accelerator, Google's foundation repository), with every account or subscription vended by a pipeline that refuses a request without an owning team. Guardrails go in three layers: a short list of organization-level denies for what is never acceptable (regions outside the allowed set, disabling logging, public storage, leaving the organization), the same rules plus the rest at plan time where authors see them, and detective rules over the cloud's own inventory for everything, including what predates the policies. Corrective automation is reserved for tags and logging settings. Exceptions are records with an expiry, granted by someone other than the requester. The catalog joins the cloud inventory, the IaC state and a Backstage-style catalog file per service, and its daily report is the list of resources with no owner, no state, or a stale sighting.

I'd change it in three cases. With two or more clouds and a Terraform-standard organization, I'd make HCP Terraform (or a peer platform) the place for modules, policy and drift, and add a cross-cloud SQL tool for the detective layer, because no cloud's posture product sees the others well. In a regulated estate I'd start from Landing Zone Accelerator or the provider's compliance-specific baseline instead of a lighter one, because the evidence it produces is the point. And for a small company I'd skip the frameworks entirely: two or three accounts, a few organization denies, required owner tags at plan time, and the cloud's inventory are enough until the account count makes a vending pipeline cheaper than remembering.

## How to Build It

The chapter adds teams and ownership, observed tags and tag rules, guardrails with their findings and exceptions, and inventory sources to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). It builds on `organization_units` and `account_members` from [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it), `iac_states` from [Provisioning](/books/hosting-and-cloud/terraform-and-opentofu#how-to-build-it), `policy_evaluations` from [Testing, Policy, Secrets & IaC Platforms](/books/hosting-and-cloud/iac-testing-policy-and-secrets#how-to-build-it) and `cluster_policies` from [Multi-Tenancy, Policy & Security](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy#how-to-build-it). The same schema serves a provider offering governance to its customers and a platform team governing its own estate, where projects are the cloud accounts, subscriptions or projects it runs and `resources` holds what the inventories discover.

```sql
-- Owners ------------------------------------------------------------------------

CREATE TABLE teams (                     -- who answers for things; the root of every runbook
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  parent_team_id  UUID REFERENCES teams (id),
  slug            TEXT NOT NULL,         -- 'payments-platform'; the value owner tags carry
  name            TEXT NOT NULL,
  oncall_ref      TEXT,                  -- the paging service's schedule or escalation policy
  channel_ref     TEXT,                  -- where findings and notices go
  catalog_ref     TEXT,                  -- 'group:default/payments-platform' in the software catalog
  status          TEXT NOT NULL CHECK (status IN ('active', 'disbanded')),
  disbanded_at    TIMESTAMPTZ,
  UNIQUE (account_id, slug),
  CHECK ((status = 'disbanded') = (disbanded_at IS NOT NULL))
);

CREATE TABLE team_members (
  team_id       UUID NOT NULL REFERENCES teams (id),
  member_id     UUID NOT NULL REFERENCES account_members (id),
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (team_id WITH =, member_id WITH =, valid_during WITH &&)
);

CREATE TABLE ownership_assignments (     -- who owns a unit, project or resource, over time
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  scope_kind    TEXT NOT NULL CHECK (scope_kind IN ('organization_unit', 'project',
                  'resource')),
  scope_id      UUID NOT NULL,           -- the unit, project or resource
  team_id       UUID NOT NULL REFERENCES teams (id),
  source        TEXT NOT NULL CHECK (source IN ('vending', 'catalog', 'tag', 'manual')),
  valid_during  TSTZRANGE NOT NULL,
  assigned_by   TEXT NOT NULL,           -- typed actor
  EXCLUDE USING GIST (scope_kind WITH =, scope_id WITH =, valid_during WITH &&)
                                         -- one owner per scope at a time
);

-- Tags --------------------------------------------------------------------------

CREATE TABLE resource_tags (             -- tags and labels as observed, over time
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  resource_id      UUID NOT NULL REFERENCES resources (id),
  key              TEXT NOT NULL,        -- as written; AWS keys and values are case-sensitive
  value            TEXT NOT NULL DEFAULT '',  -- an omitted value is the empty string
  origin           TEXT NOT NULL CHECK (origin IN ('direct', 'inherited', 'policy_modify',
                     'provider')),       -- 'inherited': a Google tag from an ancestor
  observed_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (resource_id WITH =, key WITH =, observed_during WITH &&)
);

CREATE TABLE tag_rules (                 -- the tag policy: required keys, values, inheritance
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  organization_unit_id  UUID REFERENCES organization_units (id),  -- null: whole account
  key                   TEXT NOT NULL,   -- the canonical spelling: 'CostCenter', 'owner'
  allowed_values        TEXT[],          -- null: any value; for 'owner', checked against teams
  required_for          TEXT[] NOT NULL DEFAULT '{}',  -- resources.kind values that must carry it
  inherit_from          TEXT CHECK (inherit_from IN ('project', 'organization_unit')),
  cost_allocation       BOOLEAN NOT NULL DEFAULT FALSE, -- activated as a billing dimension
  enforcement           TEXT NOT NULL CHECK (enforcement IN ('report', 'deny_noncompliant',
                          'deny_missing')),
  valid_during          TSTZRANGE NOT NULL
);

-- Guardrails ----------------------------------------------------------------------

CREATE TABLE guardrails (                -- one rule in plain words, at one layer, at one scope
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  code                  TEXT NOT NULL,   -- 'storage.no_public_buckets'
  statement             TEXT NOT NULL,   -- the rule as a person would say it
  layer                 TEXT NOT NULL CHECK (layer IN ('organization', 'plan', 'admission',
                          'runtime')),
  behavior              TEXT NOT NULL CHECK (behavior IN ('preventive', 'proactive',
                          'detective', 'corrective')),
  engine                TEXT NOT NULL CHECK (engine IN ('scp', 'rcp', 'tag_policy',
                          'azure_policy', 'gcp_org_policy', 'cloudformation_hook', 'sentinel',
                          'opa', 'tfpolicy', 'checkov', 'kyverno', 'gatekeeper',
                          'validating_admission_policy', 'aws_config', 'security_hub',
                          'defender_for_cloud', 'security_command_center', 'sql_control',
                          'custom')),
  native_ref            TEXT,            -- the SCP id, policy definition id, constraint name
  content_digest        TEXT NOT NULL,   -- sha256 of the policy as deployed
  mode                  TEXT NOT NULL CHECK (mode IN ('enforced', 'dry_run', 'audit',
                          'disabled')),
  severity              TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  owner_team_id         UUID NOT NULL REFERENCES teams (id),  -- who maintains the rule
  control_ids           TEXT[] NOT NULL DEFAULT '{}',  -- compliance controls it evidences
  organization_unit_id  UUID REFERENCES organization_units (id),  -- attachment; null: account
  max_exception         INTERVAL NOT NULL DEFAULT INTERVAL '90 days',
  valid_during          TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (account_id WITH =, code WITH =,
    (COALESCE(organization_unit_id, '00000000-0000-0000-0000-000000000000'::uuid)) WITH =,
    valid_during WITH &&)
);

ALTER TABLE policy_evaluations           -- plan-time results roll up to the rule they enforce
  ADD COLUMN guardrail_id UUID REFERENCES guardrails (id);

ALTER TABLE cluster_policies             -- so do admission policies
  ADD COLUMN guardrail_id UUID REFERENCES guardrails (id);

CREATE TABLE guardrail_exceptions (      -- a waiver or a mitigation, always with an end
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  guardrail_id          UUID NOT NULL REFERENCES guardrails (id),
  scope_kind            TEXT NOT NULL CHECK (scope_kind IN ('organization_unit', 'project',
                          'resource')),
  scope_id              UUID NOT NULL,
  category              TEXT NOT NULL CHECK (category IN ('waiver', 'mitigated')),
  reason                TEXT NOT NULL,
  compensating_control  TEXT,            -- how the intent is met, for 'mitigated'
  requested_by          TEXT NOT NULL,   -- typed actor
  approved_by           TEXT NOT NULL,   -- typed actor
  ticket_ref            TEXT,
  native_ref            TEXT,            -- the Azure exemption, Checkov skip or override it mirrors
  valid_during          TSTZRANGE NOT NULL,
  revoked_at            TIMESTAMPTZ,
  revoked_by            TEXT,
  CHECK (NOT upper_inf(valid_during)),   -- no exception without an end
  CHECK (approved_by <> requested_by),
  CHECK (category <> 'mitigated' OR compensating_control IS NOT NULL),
  CHECK ((revoked_at IS NULL) = (revoked_by IS NULL))
);

CREATE TABLE guardrail_findings (        -- a detective result: one rule, one target, open to closed
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  guardrail_id     UUID NOT NULL REFERENCES guardrails (id),
  resource_id      UUID REFERENCES resources (id),  -- null until the target is catalogued
  target_ref       TEXT NOT NULL,        -- the native id evaluated: an ARN, an Azure resource ID
  status           TEXT NOT NULL CHECK (status IN ('open', 'exempt', 'resolved')),
  exception_id     UUID REFERENCES guardrail_exceptions (id),
  first_seen_at    TIMESTAMPTZ NOT NULL,
  last_seen_at     TIMESTAMPTZ NOT NULL,
  resolved_at      TIMESTAMPTZ,
  resolution       TEXT CHECK (resolution IN ('auto_remediated', 'fixed_in_code',
                     'fixed_by_hand', 'resource_deleted', 'rule_changed')),
  remediation_ref  TEXT,                 -- the remediation task, automation run or pull request
  source_ref       TEXT NOT NULL,        -- the engine's finding id; collectors resend
  UNIQUE (guardrail_id, source_ref),
  CHECK (last_seen_at >= first_seen_at),
  CHECK ((status = 'exempt') = (exception_id IS NOT NULL)),
  CHECK ((status = 'resolved') = (resolved_at IS NOT NULL)),
  CHECK ((resolved_at IS NULL) = (resolution IS NULL))
);

-- Inventory -----------------------------------------------------------------------

CREATE TABLE inventory_sources (         -- where the catalog learns what exists, and how fresh
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  kind             TEXT NOT NULL CHECK (kind IN ('provider_control_plane', 'aws_config',
                     'aws_resource_explorer', 'azure_resource_graph', 'gcp_asset_inventory',
                     'steampipe', 'cloudquery', 'iac_state', 'kubernetes_api',
                     'cmdb_import')),
  scope_ref        TEXT NOT NULL,        -- the aggregator, management group, organization or state
  delivery         TEXT NOT NULL CHECK (delivery IN ('push', 'poll', 'export')),
  expected_lag     INTERVAL NOT NULL,    -- how stale this source may be and still be trusted
  last_success_at  TIMESTAMPTZ,
  last_error       TEXT,
  status           TEXT NOT NULL CHECK (status IN ('active', 'paused', 'retired'))
);

ALTER TABLE resources
  ADD COLUMN inventory_source_id  UUID REFERENCES inventory_sources (id),
  ADD COLUMN last_seen_at         TIMESTAMPTZ,  -- the last time a source confirmed it exists
  ADD COLUMN managed_by_state_id  UUID REFERENCES iac_states (id),  -- null: in no IaC state
  ADD COLUMN catalog_ref          TEXT;         -- 'resource:default/orders-db'
```

The question every governance review starts with is a query, not a spreadsheet:

```sql
-- Live resources with no active owning team, or missing a required tag, right now.
-- Ownership resolves resource, then project, then the project's unit; a recursive CTE
-- over organization_units.parent_id extends the last step to ancestors.
WITH live AS (
  SELECT r.*, p.organization_unit_id
  FROM resources r
  LEFT JOIN projects p ON p.id = r.project_id
  WHERE r.account_id = $1
    AND r.state NOT IN ('deleting', 'deleted')
),
owner AS (
  SELECT l.id AS resource_id,
         COALESCE(ro.team_id, po.team_id, uo.team_id) AS team_id
  FROM live l
  LEFT JOIN ownership_assignments ro ON ro.scope_kind = 'resource'
       AND ro.scope_id = l.id AND ro.valid_during @> now()
  LEFT JOIN ownership_assignments po ON po.scope_kind = 'project'
       AND po.scope_id = l.project_id AND po.valid_during @> now()
  LEFT JOIN ownership_assignments uo ON uo.scope_kind = 'organization_unit'
       AND uo.scope_id = l.organization_unit_id AND uo.valid_during @> now()
),
missing AS (
  SELECT l.id AS resource_id, array_agg(tr.key ORDER BY tr.key) AS keys
  FROM live l
  JOIN tag_rules tr ON tr.account_id = l.account_id
       AND tr.valid_during @> now()
       AND l.kind = ANY (tr.required_for)
       AND (tr.organization_unit_id IS NULL
            OR tr.organization_unit_id = l.organization_unit_id)
  WHERE NOT EXISTS (
    SELECT 1 FROM resource_tags t
     WHERE t.resource_id = l.id
       AND t.key = tr.key
       AND t.observed_during @> now()
       AND (tr.allowed_values IS NULL OR t.value = ANY (tr.allowed_values)))
  GROUP BY l.id
)
SELECT l.id, l.kind, l.external_ref, l.project_id,
       t.id IS NULL AS unowned,          -- no assignment, or its team was disbanded
       m.keys AS missing_tags,
       l.managed_by_state_id IS NULL AS unmanaged
FROM live l
JOIN owner o        ON o.resource_id = l.id
LEFT JOIN teams t   ON t.id = o.team_id AND t.status = 'active'
LEFT JOIN missing m ON m.resource_id = l.id
WHERE t.id IS NULL OR m.keys IS NOT NULL
ORDER BY unowned DESC, l.kind;
```

And the expiry job's worklist, which should be empty a day after it runs:

```sql
-- Exceptions that have ended or been revoked while findings still lean on them.
-- Each row reopens its findings (status 'open', exception_id null) and notifies the owner.
SELECT e.id AS exception_id, g.code, e.scope_kind, e.scope_id, e.category,
       upper(e.valid_during) AS ended_at, e.revoked_at, e.approved_by,
       count(*) AS findings_still_exempt
FROM guardrail_exceptions e
JOIN guardrails g         ON g.id = e.guardrail_id
JOIN guardrail_findings f ON f.exception_id = e.id AND f.status = 'exempt'
WHERE e.account_id = $1
  AND (upper(e.valid_during) <= now() OR e.revoked_at IS NOT NULL)
GROUP BY e.id, g.code
ORDER BY ended_at;
```

Design decisions behind it:

- **Ownership is a reference, effective-dated, inherited.** An owner tag on a cloud resource is generated from `ownership_assignments`, never the other way round; the `tag` source exists only to import an estate that started with tags. Disbanding a team surfaces everything it owned in the first query, which is the point of making the owner a row with a status.
- **Tags are observations.** `resource_tags` records what the inventory saw and when, with its origin, so "this resource lost its cost center last Tuesday" is answerable and an inherited Google tag isn't mistaken for one someone wrote. The rule (`tag_rules`) and the observation are separate tables, because AWS evaluates neither untagged resources nor undefined keys against a tag policy, and the gap is exactly what the query reports.
- **A guardrail is the rule; engines are its implementations.** One `guardrails` row per rule per attachment, with the plain statement, layer, behavior and the compliance controls it evidences. Plan-time `policy_evaluations` and admission `cluster_policies` point back to it, so "how is `storage.no_public_buckets` enforced, and where has it failed" spans the SCP, the Sentinel policy, the Kyverno rule and the Config rule in one join.
- **Exceptions end, and the database says so.** A finite range, a requester who isn't the approver and a compensating control for mitigations are constraints. The cap (`guardrails.max_exception`) is checked by the approval API because it crosses tables. Expiry never deletes: like an expired Azure exemption, the row stays for the record and stops being honored.
- **Findings have a lifecycle and an idempotency key.** CSPM tools and collectors resend; `(guardrail_id, source_ref)` makes a resend an update to `last_seen_at`. A resolution names how it was fixed, because "fixed by hand" on a resource in an IaC state is a drift finding waiting to happen.
- **Freshness is data.** Each inventory source declares how stale it may be; a resource whose `last_seen_at` is older than its source's `expected_lag` is unconfirmed, not present, and a source past its lag is an incident for the catalog itself. `managed_by_state_id` null on a production resource is a finding by itself.
- **Events:** `guardrail.deployed`, `guardrail.mode_changed`, `guardrail_finding.opened`, `guardrail_finding.resolved`, `guardrail_exception.granted`, `guardrail_exception.expiring` (14 days ahead), `guardrail_exception.expired`, `ownership.assigned`, `team.disbanded` and `inventory_source.stale` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications (routed by `teams.channel_ref`), the ticketing integration, the compliance evidence store and the audit trail.

## Auditing

- **Which rules were in force, where, in which mode.** Every guardrail version with its digest, attachment and mode over time, so the control that applied to a given account on a given day can be shown, including when a rule ran in dry run before enforcement ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Every finding from first sighting to resolution,** with the evidence the engine produced and how it was fixed, kept for the audit period plus the sampling window.
- **Every exception's life:** who asked, who approved, the reason, the compensating control, the range, and whether it was revoked or expired, with the findings it covered. "Who accepted this risk, and until when" is the question an auditor and an incident review both ask.
- **Ownership history.** Who owned a resource on the day it failed, from `ownership_assignments`, because the owner then and the owner now are different questions ([Typed Actors](/docs/architecture/audit-trails#typed-actors)).
- **Every exemption-granting and policy-changing action,** separately from resource changes, since changing or exempting a rule changes what every account below it may do.

## What This Means for the System You Build

- **Vend every account, subscription or project through one pipeline,** that places it in the tree, attaches the baseline and refuses a request without an owning team.
- **Put each rule at every layer it needs:** organization denies for the absolute rules, plan-time checks where authors see them, admission for clusters, and detection over inventory for what already exists.
- **Make ownership a team reference, inherited down the tree,** with owner tags generated from it, and report every resource whose team is gone.
- **Enforce required tags where they are created,** because tag policies and Organization Policy don't look back at old resources; detection covers the past.
- **Give every exception a category, an approver, a reason and an end,** and reopen its findings automatically when it expires.
- **Treat drift as a finding with an owner,** resolved by reverting or codifying, not by silent automatic reverts.
- **Build the catalog from three views,** IaC state, the cloud inventory and the software catalog, record how fresh each fact is, and publish the disagreements.
- **Keep the evidence append-only,** so the guardrails, findings and exceptions are the control evidence auditors sample.

## References

**Landing zones and frameworks**

- [AWS: What is AWS Control Tower?](https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html), landing zone definition, controls and guidance categories, Account Factory on Service Catalog, SCPs and RCPs through Organizations
- [AWS: About controls in AWS Control Tower](https://docs.aws.amazon.com/controltower/latest/userguide/controls.html), controls applied per OU, the guardrail and control terms, the management account exception
- [AWS: How controls work](https://docs.aws.amazon.com/controltower/latest/userguide/how-controls-work.html), preventive (SCPs and RCPs), detective (Config rules) and proactive (CloudFormation hooks) controls, mandatory controls
- [AWS: Account Factory for Terraform overview](https://docs.aws.amazon.com/controltower/latest/userguide/aft-overview.html), account request files, GitOps, supported Terraform distributions, metadata and tags, not for application resources
- [AWS: Landing Zone Accelerator on AWS](https://docs.aws.amazon.com/solutions/landing-zone-accelerator-on-aws/), version 1.16.3 of September 2026, installer and core pipelines, `aws-accelerator-config`, review stage, log archive and audit accounts, compliance caveat
- [Microsoft Learn: What is an Azure landing zone?](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/), platform and workload landing zones, one platform per tenant, subscription vending, the baseline management group hierarchy
- [Microsoft Learn: Management groups](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview), 10,000 per directory, six levels, one parent, the tenant root group, new subscriptions at the root, 30-minute hierarchy cache
- [Microsoft Learn: Azure Blueprints overview](https://learn.microsoft.com/en-us/azure/governance/blueprints/overview), retirement on January 31, 2027 with phases from July 31, 2026, Deployment Stacks and Template Specs
- [Google Cloud: Enterprise foundations blueprint](https://docs.cloud.google.com/architecture/blueprints/security-foundations), the renamed security foundations blueprint, Terraform assets and guide, last updated May 15, 2025
- [GitHub: terraform-example-foundation](https://github.com/terraform-google-modules/terraform-example-foundation), stages 0-bootstrap to 5-app-infra, folder layout, Apache-2.0
- [AWS: Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), November 6, 2024 revision, the free Well-Architected Tool, a review "is not an audit mechanism"
- [Microsoft Learn: Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/), the five pillars and the assessment tool

**Guardrails**

- [AWS: Resource control policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html), maximum permissions on resources, no grants, supported services, management account and service-linked role exclusions, testing before attaching at the root
- [AWS: Tag policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_tag-policies.html), case-sensitive keys and values, enforcement on tagging operations, untagged resources not evaluated
- [Microsoft Learn: Azure Policy effect basics](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-basics), the effects, order of evaluation, layering and "cumulative most restrictive"
- [Microsoft Learn: Remediate non-compliant resources](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/remediate-resources), remediation tasks for `modify` and `deployIfNotExists`, managed identities, resource counts and parallelism
- [Microsoft Learn: Azure Policy exemption structure](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/exemption-structure), waiver and mitigated categories, metadata, `expiresOn` and expired exemptions kept, `exempt/Action`, compliance substate
- [Google Cloud: Organization Policy overview](https://docs.cloud.google.com/resource-manager/docs/organization-policy/overview), managed, custom and legacy constraints, dry run, inheritance, no general retroactivity, Policy Simulator
- [Google Cloud: Creating custom constraints](https://docs.cloud.google.com/resource-manager/docs/organization-policy/creating-managing-custom-constraints), resource types, method types, CEL conditions up to 1,000 characters, `ALLOW` and `DENY`, 20 per resource type
- [AWS: Conformance packs](https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html), Config rules and remediation actions as one template, organization deployment
- [AWS: Remediating noncompliant resources with AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/remediation.html), Systems Manager Automation documents, manual and automatic remediation
- [AWS: Introduction to Security Hub CSPM](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html), standards, ASFF, service-linked Config rules, no retroactive findings, per-region enablement, CIS across all regions
- [Microsoft Learn: Microsoft Defender for Cloud overview](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction), Foundational CSPM free, Defender CSPM governance rules, the Microsoft cloud security benchmark, AWS and Google Cloud connectors
- [Google Cloud: Security Command Center overview](https://docs.cloud.google.com/security-command-center/docs/security-command-center-overview), Standard, Premium and Enterprise tiers, Enterprise shutdown on May 21, 2027, security postures

**Tags and ownership**

- [AWS Cloud Operations Blog: Enforce consistent tagging across IaC deployments with tag policies](https://aws.amazon.com/blogs/mt/enforce-consistent-tagging-across-iac-deployments-with-aws-organizations-tag-policies), November 20, 2025: `report_required_tag_for`, the `AWS::TagPolicies::TaggingComplianceValidator` hook, `WARN` and `FAIL`
- [AWS: Activating user-defined cost allocation tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/activating-tags.html), activation by key, up to 24 hours to appear and up to 24 hours to activate
- [Microsoft Learn: Manage tag governance with Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/tutorials/govern-tags), `deny` on resource groups, `modify` with `add` and `addOrReplace`, remediation for existing resources
- [Google Cloud: Tags overview](https://docs.cloud.google.com/resource-manager/docs/tags/tags-overview), tags as resources with IAM, inheritance, use in IAM and Organization Policy conditions, labels compared

**Inventory and catalogs**

- [AWS: Recording AWS resources with AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/select-resources.html), continuous and daily recording, unrecorded types, global resource types after February 2022
- [AWS: AWS Config pricing](https://aws.amazon.com/config/pricing/), continuous and periodic configuration items, rule and conformance pack evaluations
- [AWS: Data retention in AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/delete-config-data-with-retention-period.html), 30 days to 7 years, the 2,557-day default
- [AWS: Querying with AWS Config advanced query](https://docs.aws.amazon.com/config/latest/developerguide/querying-AWS-resources.html), the SQL subset and what it excludes, aggregator queries
- [AWS: Multi-account multi-Region data aggregation](https://docs.aws.amazon.com/config/latest/developerguide/aggregate-data.html), organization aggregators, read-only replicated view, no additional cost
- [AWS: What is AWS Resource Explorer?](https://docs.aws.amazon.com/resource-explorer/latest/userguide/welcome.html), indexes, CloudTrail-fed updates, eventual consistency, enabled by default from October 6, 2025, no charge to search
- [Microsoft Learn: Azure Resource Graph overview](https://learn.microsoft.com/en-us/azure/governance/resource-graph/overview), KQL, change notifications and full scans, consistency, 14 days of changes, scopes, free with throttling
- [Microsoft Learn: Guidance for throttled requests in Resource Graph](https://learn.microsoft.com/en-us/azure/governance/resource-graph/concepts/guidance-for-throttled-requests), 15 queries per 5 seconds, 1,000 rows per response
- [Microsoft Learn: Get resource changes](https://learn.microsoft.com/en-us/azure/governance/resource-graph/how-to/get-resource-changes), changes within five minutes, deleted-resource gaps, keeping a CMDB current
- [Google Cloud: Cloud Asset Inventory overview](https://docs.cloud.google.com/asset-inventory/docs/overview), assets and policies, scopes, 35 days of history, periodic synchronization, exports
- [Google Cloud: Monitor asset changes](https://docs.cloud.google.com/asset-inventory/docs/monitor-asset-changes), Pub/Sub feeds, 200 per parent, 10 minutes for feed changes
- [Google Cloud: Cloud Asset Inventory pricing](https://cloud.google.com/asset-inventory/pricing), free use, storage billed
- [GitHub: Steampipe](https://github.com/turbot/steampipe), Postgres foreign data wrappers, the bundled Postgres, AGPL-3.0
- [Steampipe](https://steampipe.io/), 150+ plugins, FDW and SQLite extension forms
- [Powerpipe](https://powerpipe.io/), dashboards and 5,000+ open controls
- [CloudQuery: Official free plugins moving to paid](https://cloudquery.io/blog/cloudquery-official-free-plugins-moving-to-paid), April 22, 2024: integrations from free to paid, MPL SDKs
- [CloudQuery: Pricing](https://www.cloudquery.io/pricing), rows synced per year counted on every sync, free to 1 million rows, destinations
- [AWS: Service Catalog concepts](https://docs.aws.amazon.com/servicecatalog/latest/adminguide/what-is_concepts.html), portfolios, products, provisioned products as stacks, launch, notification and template constraints
- [AWS: Service Catalog announces support for Terraform open source](https://aws.amazon.com/about-aws/whats-new/2023/04/aws-service-catalog-terraform-open-source), April 3, 2023
- [AWS: Updating Terraform Open Source products to External](https://docs.aws.amazon.com/servicecatalog/latest/adminguide/update_terraform_open_source_to_external.html), the rename after Terraform's license change, no new Terraform Open Source products
- [Backstage: Descriptor format of catalog entities](https://backstage.io/docs/features/software-catalog/descriptor-format), entity kinds, `catalog-info.yaml`, required `spec.owner`, Resource entities
- [Backstage: Well-known relations](https://backstage.io/docs/features/software-catalog/well-known-relations), `ownedBy`, `dependsOn`, `partOf` and the rest, ownership not used for authorization
- [CNCF: Backstage](https://www.cncf.io/projects/backstage/), accepted September 8, 2020, Incubating March 15, 2022
- [Spotify Engineering: What the heck is Backstage anyway?](https://engineering.atspotify.com/2020/3/what-the-heck-is-backstage-anyway), March 17, 2020: the open source release the day before
- [ServiceNow: Discovery for cloud resources](https://www.servicenow.com/docs/r/Tm19yM2Ui3~uN9XFBacppg/iVBgRQWY87aZN_47FUMl3A), service accounts, schedules, MID Servers, AWS Config event notifications

**HCP Terraform**

- [HCP Terraform: Manage policy sets](https://developer.hashicorp.com/terraform/cloud-docs/policy-enforcement/manage-policy-sets), scopes and exclusions, VCS and API versions, enforcement levels per engine, overrides, Free-tier limit, agent evaluations on Premium
- [HashiCorp: Introducing tfpolicy](https://www.hashicorp.com/en/blog/introducing-tfpolicy-a-declarative-policy-workflow-built-for-terraform), July 16, 2026: general availability, HCL policies, evaluation before and after deployment
- [HCP Terraform: Projects](https://developer.hashicorp.com/terraform/cloud-docs/projects), one project per workspace and Stack, the Default Project, project permissions by edition
- [HCP Terraform: No-code provisioning](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/no-code-provisioning/provisioning), No-code Ready modules, Standard and Premium, project placement, no automatic upgrades
- [HCP Terraform: Health assessments](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/health), drift detection and continuous validation, editions, requirements, enforcement by the organization owner, limitations
- [HashiCorp: HCP Terraform pricing](https://www.hashicorp.com/en/products/terraform/pricing), Essentials from $0.10 per resource a month, rated hourly at $0.00013
- [HCP Terraform: Explorer](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/explorer), types, built-in queries, results not saved

**Announcements**

- [AWS: AWS Organizations now generally available](https://aws.amazon.com/about-aws/whats-new/2017/02/aws-organizations-now-generally-available/), February 27, 2017: SCPs and account creation by API
- [AWS: AWS Control Tower is now generally available](https://aws.amazon.com/about-aws/whats-new/2019/06/aws-control-tower-is-now-generally-available), June 24, 2019: pre-configured guardrails, no additional charge
- [AWS: Resource Explorer multi-account resource search](https://aws.amazon.com/about-aws/whats-new/2023/11/aws-resource-explorer-multi-account-resource-search/), November 14, 2023: organization-wide search at no additional charge
- [AWS: Introducing resource control policies](https://aws.amazon.com/about-aws/whats-new/2024/11/resource-control-policies-restrict-access-aws-resources), November 13, 2024: launch services
