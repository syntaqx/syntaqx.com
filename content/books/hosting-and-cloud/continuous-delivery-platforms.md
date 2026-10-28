+++
title = "Continuous Delivery Platforms"
description = "CodeDeploy, Spinnaker, Argo, Harness and Octopus; progressive delivery and feature flags as products; and how approvals and protection gate a deploy."
category = "Hosting & Cloud Industry"
order = 2145
part = "CI/CD Platforms"
tags = ["continuous-delivery", "deployment", "approvals", "feature-flags", "spinnaker"]
+++

Continuous integration ends with an artifact; continuous delivery is everything between that artifact and the users. A delivery platform knows the targets (servers, clusters, functions, regions), the order to reach them, the checks a release must pass at each step, who must approve it, and how to undo it. Most code hosts and PaaS products now include a thin version of this, and a separate market sells the thick version to organizations with many services, many targets and rules about who may change production.

This chapter covers that market: AWS CodeDeploy and the internal tool behind it, Netflix's Spinnaker, Argo CD and Argo Rollouts as delivery products, Harness, Octopus Deploy, feature-flag services and OpenFeature, and the approval and environment-protection mechanisms of the code hosts and CI products. It adds `release_approvals` to the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The strategies themselves (rolling, blue/green, canary, automated verdicts) are the playbook's [Deployment Strategies](/docs/delivery/deployment-strategies#comparing-them); when a human gate belongs in the path is [Deploy Is Not Release](/docs/delivery/ci-pipelines#deploy-is-not-release); flags as practice are [Feature Flags](/docs/delivery/feature-flags#progressive-rollout); GitOps reconcilers in depth, Flux, Flagger and Argo Rollouts' Kubernetes mechanics are [Packaging & GitOps](/books/hosting-and-cloud/packaging-and-gitops#progressive-delivery); the deploy record and aliases are [Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#how-to-build-it).

## How the Providers Do It

| Product | Origin | Targets | Strategies | Gates | Model |
| --- | --- | --- | --- | --- | --- |
| **AWS CodeDeploy** | Announced November 12, 2014, based on Amazon's internal Apollo | Amazon EC2 instances at launch | Rolling updates with health checks and automatic rollback | Through CodePipeline stages | Free for EC2 at launch (pay for resources) |
| **Spinnaker** | Netflix, open-sourced November 16, 2015 with Google, Microsoft and Pivotal | AWS and Google Cloud at launch, Cloud Foundry supported | Pipelines of deployment stages | Stages in the pipeline | Open source, Continuous Delivery Foundation |
| **Argo CD and Argo Rollouts** | Applatix 2017, then Intuit; CNCF graduated December 6, 2022 | Kubernetes | Blue/green and canary with metric analysis and automatic promotion or rollback | Sync policies, analysis | Open source, CNCF |
| **Harness** | CD vendor that added CI through Drone (2020) | Several targets (not detailed in the sources cited here) | Pipeline-defined | Pipeline-defined | Commercial SaaS; $5.5 billion valuation (December 2025) |
| **Octopus Deploy** | Started 2011, a business from 2012 | Servers and other targets (not detailed in the sources cited here) | Process-defined | Process-defined | Commercial; Insight Partners minority investment of $172.5 million (April 2021) |
| **GitHub environments** | Part of Actions | Whatever the workflow deploys | Whatever the workflow scripts | Required reviewers, wait timer, branch rules, custom protection rules | Included in GitHub plans |
| **Azure Pipelines environments** | Part of Azure DevOps | Whatever the stage deploys | Deployment strategies in YAML | Approvals and checks on resources | Included in Azure DevOps |
| **GitLab protected environments** | Part of GitLab | Whatever the job deploys | Scripted | Deployment approvals (Premium and Ultimate) | Included in GitLab tiers |

Three patterns run through the table. **The thick platforms came from operators with many targets:** Amazon and Netflix built theirs internally before anyone sold one. **Strategies are commodity; verdicts are the product:** every platform offers canaries, and the differentiation is the analysis that decides promotion and the integration with the metrics that feed it. **Gates moved into the code host:** for most teams the approval now lives on the environment in the same product as the code, not in a separate release tool.

## CodeDeploy and Apollo

When AWS announced CodeDeploy, CodePipeline and CodeCommit at re:Invent on November 12, 2014, it said Amazon's developers had used the technology behind CodeDeploy to push an average of 95 deployments a minute over the prior year. The Register reported that CodeDeploy is based on an internal Amazon deployment tool called Apollo. CodeDeploy was available that day, free for deployments to EC2 (customers paid for the resources), with rolling updates, health checks and rollback; CodePipeline became available to all customers on July 9, 2015.

What it solved was fleet deployment without a script per team: an application revision, a deployment group of instances, a deployment configuration that says how many at a time, and lifecycle hooks on each instance. What it cost was the AWS shape: the model is an AWS resource model, and moving the deploys elsewhere means moving the vocabulary.

## Spinnaker

Netflix described moving from Asgard, its earlier deployment console, to Spinnaker on September 30, 2015, and open-sourced it on November 16, 2015 "after over a year of development and production use at Netflix," built with Google, Microsoft and Pivotal: deploying to AWS and Google Cloud "with full feature compatibility," Cloud Foundry supported and Azure under way, and "the replacement for Asgard," with changes made through either tool compatible. It became a founding project of the Continuous Delivery Foundation on March 12, 2019.

Spinnaker's contribution was making Netflix's multi-cloud delivery tooling available outside Netflix. Its cost is operating it: a set of services to run, upgrade and secure, which is what pushed many adopters toward hosted platforms or toward Kubernetes-native reconcilers.

## Argo CD and Argo Rollouts

On Kubernetes, the reconciler became the delivery platform. Argo CD applies desired state from Git ([Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#gitops-the-deploy-as-a-pull)); Argo Rollouts describes itself as "a Kubernetes controller and set of CRDs which provide advanced deployment capabilities": blue/green and canary, analysis against Prometheus, Datadog, New Relic and other providers with automatic promotion or rollback, and traffic shaping through NGINX, AWS load balancers, Istio, Linkerd and others. Argo graduated in the CNCF on December 6, 2022. As products they matter here because they removed the separate CD server for Kubernetes estates; how they work inside a cluster, and Flux and Flagger beside them, is [Packaging & GitOps](/books/hosting-and-cloud/packaging-and-gitops#argo-cd).

## Harness and Octopus

Harness started as a CD vendor and bought CI by acquiring Drone.io on August 5, 2020, selling Drone's open-source edition as Harness CI Community Edition; its December 11, 2025 Series E valued it at $5.5 billion, with its CEO saying it was on track to exceed $250 million of annual recurring revenue in 2025 ([The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#the-private-vendors)).

Octopus Deploy is the release manager for estates that aren't all containers. Paul Stovell started writing it in 2011 and turned it from a nights-and-weekends project into a business with Sonia in 2012; it was bootstrapped and, in his words, "highly profitable along the way (30%+)" before Insight Partners invested $172.5 million for a minority stake, announced April 20, 2021. Its place in the market is the estate a GitOps reconciler doesn't reach: servers and on-premises machines whose releases move through a sequence of environments under a recorded process.

## Feature Flags as a Product

Progressive delivery moved part of the release out of the deploy and into a flag service. LaunchDarkly was founded in Oakland in 2014 by Edith Harbaugh and John Kodumal, and raised a $200 million Series D led by Lead Edge Capital on August 10, 2021 at a $3 billion post-money valuation. The vendor-neutral answer is OpenFeature, a common API and SDK model for flag evaluation, accepted into the CNCF on June 17, 2022 and moved to incubating on November 21, 2023. The playbook's [OpenFeature](/docs/delivery/feature-flags#openfeature) and [Kill Switches](/docs/delivery/feature-flags#kill-switches) sections own the practice; for a delivery platform, the flag service is a second release path that needs the same audit and approval treatment as a deploy, because flipping a flag can change production behavior as much as shipping code.

## Approvals and Environment Protection

The code hosts implement the human gate on the environment, not the pipeline, and their documentation shows the shared model:

| Control | GitHub environments | Azure Pipelines | GitLab |
| --- | --- | --- | --- |
| **Who approves** | Up to six users or teams as required reviewers | Users or groups on an Approvals check; one member of a group suffices | Approval rules on a protected environment, with a required count |
| **Self-approval** | Can be prevented: the initiator can't approve even if listed | The check can permit or restrict approving your own run | Not allowed by default; a project setting can allow the triggering user to approve |
| **Waiting** | Wait timer of 1 to 43,200 minutes (30 days) | Business hours check; deferred approvals that take effect at a set time | All jobs deploying to the environment are blocked until approved; the job then has to be run |
| **Where it lives** | Environment settings, outside the workflow file | On the resource (environments, service connections, repositories, variable groups, secure files, agent pools), outside the YAML, so pipeline authors can't remove them | Protected environment settings or the API |
| **Branch rules** | No restriction, protected branches only, or selected branches and tags | Branch control check, requiring allowed and protected branches | Protected environments limit who may deploy |
| **External checks** | Custom deployment protection rules with third-party services (public preview) | Invoke REST API, Azure Function, Azure Monitor alerts, evaluate artifact policy, required template, exclusive lock | Not covered in the documentation cited here |
| **Timeouts and failure** | Not covered in the documentation cited here | A check not passed within its timeout skips or fails the stage; a rejection is final | Rejections recorded with optional comments |
| **Bypass** | Not covered in the documentation cited here | Resource administrators can bypass, and the bypass is shown | GitLab administrators can approve or reject any deployment |

Three design rules follow from the overlap. **Put the gate on the target, not in the pipeline,** because whoever can edit the pipeline file shouldn't be able to edit the gate; Azure states it outright, and GitHub and GitLab both keep the settings outside the workflow. **Separate requester and approver** by default, with an explicit, logged exception. **Make the decision a record:** who approved which run for which environment, when, with what comment, and whether anyone bypassed it, because the approval is the evidence a regulated release process exists. GitHub gates environment secrets and branch rules on private repositories behind paid plans, which makes the gate itself a priced feature.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Code host environments** | Gates on environments in the CI product | No extra product; gates beside the code | Thin strategy support; analysis is scripts | Included in plans | Most teams |
| **Cloud deploy service** (CodeDeploy) | The cloud's deployment groups and configurations | Integrated with the cloud's IAM and health checks | One cloud's model | Pay for resources | Single-cloud fleets |
| **Self-run multi-cloud CD** (Spinnaker) | Pipelines of stages against cloud accounts | Multi-cloud pipelines in one tool | Heavy to operate | Open source | Large multi-cloud operators |
| **Kubernetes reconciler** (Argo CD and Rollouts) | Git as desired state, controllers for strategies | No CD server; drift correction; analysis built in | Kubernetes only; reconciler is critical infrastructure | Open source | Kubernetes estates |
| **Commercial CD platform** (Harness, Octopus) | Hosted or licensed release orchestration | Verification, approvals, mixed targets, support | Cost; another system of record for releases | Commercial | Enterprises, mixed estates |
| **Flag service** (LaunchDarkly, OpenFeature providers) | Release by flag, not deploy | Per-user rollout, instant kill switch | Flags become unmanaged config; flag outage risk | Commercial or open source | Product teams |

## My Default

My default is continuous deployment with no human gate for services I run ([Delivery vs. Deployment](/docs/delivery/ci-pipelines#delivery-vs-deployment)), an automated canary verdict where traffic allows, and flags for releases. Where a gate is genuinely required (regulated changes, customer-installed software), I'd put it on the environment in the code host, with requester and approver separated, a timeout, and every decision recorded; I'd adopt Argo CD and Rollouts for Kubernetes estates and a commercial platform only for mixed estates that a reconciler can't reach. What would change this: an audit regime that requires a release record in a separate system, which is the case for Octopus- or Harness-style platforms.

## How to Build It

An approval is a decision about one deployment to one environment. It references the `deployments` row from [Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#how-to-build-it), and the rule that required it is versioned on the environment, so a later change to the rule doesn't rewrite what was required at the time.

```sql
CREATE TABLE environment_protection_rules (  -- what a deploy to an environment must pass
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  resource_id       UUID NOT NULL REFERENCES resources (id),  -- the site, service or pipeline
  environment       TEXT NOT NULL,
  version           INT NOT NULL,
  required_approvals SMALLINT NOT NULL DEFAULT 0 CHECK (required_approvals BETWEEN 0 AND 6),
  approver_role_ids UUID[] NOT NULL DEFAULT '{}',   -- roles from Accounts, Organizations & Resellers
  allow_self_approval BOOLEAN NOT NULL DEFAULT FALSE,
  wait_timer        INTERVAL CHECK (wait_timer <= INTERVAL '30 days'),
  allowed_refs      TEXT[],                          -- null: any branch or tag
  external_checks   JSONB NOT NULL DEFAULT '[]',     -- webhook or policy checks, by name
  approval_timeout  INTERVAL NOT NULL DEFAULT INTERVAL '30 days',
  valid_during      TSTZRANGE NOT NULL,
  set_by            TEXT NOT NULL,                   -- typed actor
  UNIQUE (resource_id, environment, version)
);

CREATE TABLE release_approvals (         -- one decision on one deployment
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  deployment_id    UUID NOT NULL REFERENCES deployments (id),
  rule_id          UUID NOT NULL REFERENCES environment_protection_rules (id),  -- the version in force
  kind             TEXT NOT NULL CHECK (kind IN ('approval', 'rejection', 'bypass',
                     'external_check_pass', 'external_check_fail', 'timeout')),
  decided_by       TEXT NOT NULL,        -- typed actor: 'member:<id>', 'check:<name>', 'system'
  requester        TEXT NOT NULL,        -- who triggered the deployment
  comment          TEXT,
  effective_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- later than decided_at for a deferred approval
  decided_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind <> 'bypass' OR comment IS NOT NULL),
  CHECK (decided_by <> requester OR kind IN ('external_check_pass', 'external_check_fail',
         'timeout'))   -- self-approval is checked against the rule in application code
);
```

The `CHECK` blocks the common case of self-approval; the rule's `allow_self_approval` exception is enforced where the decision is made and recorded in the row. A deployment may proceed when the count of approvals at or before now, excluding the requester unless allowed, meets the rule, there is no rejection, the wait timer has elapsed and every external check has passed:

```sql
SELECT d.id,
       COUNT(*) FILTER (WHERE a.kind = 'approval' AND a.effective_at <= NOW()) AS approvals,
       BOOL_OR(a.kind = 'rejection') AS rejected,
       r.required_approvals,
       d.created_at + COALESCE(r.wait_timer, INTERVAL '0') <= NOW() AS timer_elapsed
FROM deployments d
JOIN environment_protection_rules r
  ON r.resource_id = d.resource_id AND r.environment = d.environment
 AND r.valid_during @> d.created_at
LEFT JOIN release_approvals a ON a.deployment_id = d.id
WHERE d.id = $1
GROUP BY d.id, r.required_approvals, r.wait_timer, d.created_at;
```

## Auditing

- **Every approval, rejection, bypass and timeout,** with actor, requester, comment and the rule version in force, as the evidence of separation of duties.
- **Every change to protection rules,** as staff or customer actions with [typed actors](/docs/architecture/audit-trails#typed-actors), because weakening a gate before a deploy is the move an auditor looks for.
- **Flag changes in production,** with the same actor and reason fields as deployments, since a flag is a release.
- **Automated verdicts,** with the metrics and thresholds the analysis used, so "why did this canary promote" has an answer.

## What This Means for the System You Build

- **Put gates on the environment,** outside anything a pipeline author can edit.
- **Separate requester and approver** by default, and log every exception and bypass.
- **Version the protection rule** and record which version each decision met.
- **Prefer automated verdicts to human gates** where the change can be undone quickly.
- **Treat a flag flip as a release,** with its own record and approvals where the environment requires them.
- **Choose a CD platform by targets,** not strategies: Kubernetes-only, single cloud, or mixed estates each have a different answer.

## References

**Announcements and history**

- [Amazon: AWS announces application lifecycle management services](https://press.aboutamazon.com/2014/11/amazon-web-services-announces-new-application-lifecycle-management-services), November 12, 2014, CodeDeploy, the 95 deployments a minute, free for EC2
- [The Register: Amazon spins up lifecycle management services](https://www.theregister.com/2014/11/13/amazon_spins_up_ifecycle_management_services_for_cloudy_apps/), CodeDeploy based on Apollo
- [AWS: CodePipeline now available](https://aws.amazon.com/about-aws/whats-new/2015/07/aws-codepipeline-now-available/), July 9, 2015
- [Netflix: Moving from Asgard to Spinnaker (archived)](http://web.archive.org/web/20151003022624/http://techblog.netflix.com:80/2015/09/moving-from-asgard-to-spinnaker.html), September 30, 2015
- [Netflix: Global Continuous Delivery with Spinnaker (archived)](http://web.archive.org/web/20151130054615/http://techblog.netflix.com:80/2015/11/global-continuous-delivery-with.html), November 16, 2015, partners, clouds and the Asgard replacement
- [Linux Foundation: Continuous Delivery Foundation launch](https://www.linuxfoundation.org/press-release/the-linux-foundation-announces-new-foundation-to-support-continuous-delivery-collaboration/), March 12, 2019, Spinnaker as a founding project
- [Argo Rollouts](https://argoproj.github.io/argo-rollouts/), strategies, analysis providers and traffic routers
- [CNCF: Argo has graduated](https://www.cncf.io/announcements/2022/12/06/the-cloud-native-computing-foundation-announces-argo-has-graduated/), December 6, 2022
- [Harness: Harness acquires Drone.io](https://harness.io/press-and-news/harness-acquires-drone-io-for-open-source-containerized-continuous-integration), August 5, 2020
- [TechCrunch: Harness hits $5.5B valuation](https://techcrunch.com/2025/12/11/harness-hits-5-5b-valuation-with-240m-to-automate-ais-after-code-gap/), December 11, 2025
- [Octopus Deploy: Insight Partners investment](https://octopus.com/blog/insight-investment), April 20, 2021, the 2011 start, 2012 business, profitability and the $172.5 million minority stake
- [LaunchDarkly: About us](https://launchdarkly.com/about-us/), founded in Oakland in 2014 by Harbaugh and Kodumal
- [SD Times: LaunchDarkly Series D](https://sdtimes.com/?p=44986), August 10, 2021, $200 million at $3 billion
- [CNCF: OpenFeature](https://www.cncf.io/projects/openfeature/), accepted June 17, 2022, incubating November 21, 2023

**Documentation**

- [GitHub Docs: Deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments), required reviewers, self-review prevention, wait timer, branch and tag rules, custom protection rules, plan availability
- [Microsoft Learn: Pipeline deployment approvals](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/approvals), checks on resources, check order, approvals, deferred approvals, branch control, business hours, bypass and exclusive lock
- [GitLab Docs: Deployment approvals](https://docs.gitlab.com/ci/environments/deployment_approvals/), tiers, approval rules, self-approval setting, blocked jobs and comments
