+++
title = "Platforms Take Over the Deploy"
description = "Git push and buildpacks, twelve-factor, releases and rollback, previews, immutable URLs and aliases, GitOps and edge deploys: the deploy as a platform object."
category = "Hosting & Cloud Industry"
order = 2132
part = "Deployment"
tags = ["deployment", "paas", "preview-deployments", "rollback", "history"]
+++

Between 2009 and 2020 the deploy moved from the customer's laptop into the provider's control plane. On a host, a deploy was whatever the customer copied onto the server ([How Code Got to Servers](/books/hosting-and-cloud/how-code-got-to-servers)); on a platform, it became an object the provider builds, stores, numbers, routes to and can roll back. That change is what made the platform business possible: once the provider builds the code, it knows the runtime, the dependencies, the commit and the configuration of every release, and it can sell previews, rollbacks and per-request scaling on top of that knowledge.

This chapter tells that move and how the resulting objects work: Heroku's `git push` and process model, buildpacks, the twelve-factor contract, releases and rollback, blue/green and canary as platform features, the image as the artifact, GitOps as a pull-based deploy, preview deployments, immutable deployment URLs with aliases, and function and edge deploys. It adds `deployments` and `deployment_aliases` to the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The strategies themselves are the playbook's [Deployment Strategies](/docs/delivery/deployment-strategies); environments, configuration and secrets are [Environments](/docs/operations/environments); the business of the platforms, how they meter and what they resell is [PaaS & Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds); the CI side is the [CI/CD Platforms](/books/hosting-and-cloud/ci-history) part; Argo CD and Flux as Kubernetes products are Packaging & GitOps.

## How the Providers Do It

Every platform that takes code converges on the same objects under different names:

| Platform | How a deploy starts | What it produces | Rollback | Preview |
| --- | --- | --- | --- | --- |
| **Heroku** | `git push heroku main`, a connected GitHub repo, or a container push | A numbered release (`v10`): a compiled slug or OCI image plus config vars | `heroku rollback v40` creates a new release copying an old slug and config | Review apps per pull request |
| **Vercel** | A push to any branch, a pull request, or the CLI (`vercel`, `vercel --prod`) | An immutable deployment with its own generated URL | Instant Rollback points the production domains back at an earlier deployment without rebuilding | Every non-production push and pull request, with branch and commit URLs |
| **Netlify** | A push or pull request on a linked repo, or a CLI deploy | An atomic deploy with a unique permalink | Publish an earlier deploy | Deploy Previews per pull request since July 20, 2016 |
| **Cloudflare Workers and Pages** | `wrangler deploy` or a push | A version of a Worker or a Pages deployment | Roll back to an earlier version | Preview URLs per branch |
| **Render, Railway, Fly.io** | A push, an image, or a CLI deploy | A deploy built from a buildpack, Dockerfile or image | Redeploy an earlier deploy or image | Per-pull-request environments on some of them |
| **AWS Elastic Beanstalk, App Runner, Amplify; Google App Engine and Cloud Run; Azure App Service** | A CLI upload, an image, or a connected repo | An application version, revision or slot | Redeploy a version, shift traffic to an earlier revision, or swap slots | Varies: branch deployments, tagged revisions, deployment slots |
| **Kubernetes with a GitOps agent** | A commit to the desired-state repository | The reconciled state of the cluster | `git revert` | Per-branch namespaces where teams build them |

Four patterns run through the table. **The deploy is a record, not an action:** each one has an identifier, a source commit, a build log and a state, kept after it stops serving. **Builds are immutable and routing is mutable:** the provider builds once, and promotion, rollback and previews are changes to which deployment a name points at. **Configuration rides with the release or beside it,** and the platforms disagree on which, which is where rollback surprises come from. **The database never rolls back:** every platform's documentation says so in its own words.

## Git Push and the Process Model

Heroku's first platform ran Rails apps on a fixed stack; the one that defined the category was Cedar. On June 20, 2011, Adam Wiggins's "The New Heroku (Part 1 of 4): The Process Model & Procfile" introduced the **Procfile**, a file in the repository naming process types (`web`, `worker`, `clock`) and the command for each; `heroku scale web=3 worker=2` to run more of any type; `heroku run` for one-off admin processes; and deploy as `git push heroku master`, with the language detected at push time. The platform built the code into a slug, combined it with configuration into a release, and started processes from it.

What it solved: the customer no longer needed a server, a build toolchain, a deploy script or a process supervisor; scaling was a number. What it cost: the application had to fit a contract (stateless processes, config in the environment, logs to stdout, a port to bind), and everything outside the contract, from a local disk to a long-running connection to a cron daemon, needed an add-on or a redesign.

**Buildpacks** are how the platform turns source into a runnable artifact without a Dockerfile: detect the language from files in the repository, install the runtime and dependencies, compile, and produce an artifact the platform can start. The idea outlived Heroku's implementation: Cloud Native Buildpacks, which produce OCI images instead of slugs, was accepted into the CNCF on October 3, 2018 and moved to incubating on November 18, 2020, and Heroku's releases on its newer Fir generation carry an OCI image where Cedar releases carry a slug.

## The Twelve-Factor Contract

Wiggins wrote the contract down as The Twelve-Factor App, from Heroku's experience running "hundreds of thousands" of apps: one codebase per app, explicitly declared dependencies, config in the environment, backing services as attached resources, strictly separated build, release and run stages, stateless processes, port binding, concurrency through the process model, disposability (fast start, graceful stop), dev/prod parity, logs as event streams, and admin processes as one-offs. The playbook's [Environments](/docs/operations/environments#configuration) and [Containers](/docs/delivery/containers#running-them-safely) docs carry its rules today; what matters for a provider is factor five. **Build, release, run** is the provider's data model: a build is the artifact from a commit, a release is that build plus a specific configuration, and run is processes started from a release. Once the three are separate, a configuration change is a new release without a new build, and a rollback is starting processes from an earlier release.

## Releases and Rollback

Heroku documents the model most explicitly. Whenever the customer deploys code, changes a config var or modifies add-on resources, Heroku creates a new numbered release and restarts the app. `heroku rollback v40` creates a new release that copies the slug (or OCI image) and config vars of v40, including add-on-related config vars, and Heroku is explicit about what it doesn't touch: add-ons stay provisioned or deprovisioned, the git repository doesn't move, and state in add-ons or elsewhere, a database included, is the customer's to reconcile. Heroku calls rollback a temporary fix and recommends `git revert` and a redeploy for code bugs. Its retention rule shows that releases cost the provider storage: slugs are destroyed for releases older than 30 days that are also beyond the 20 most recent, and those can't be rolled back to.

Vercel's Instant Rollback makes the opposite choice on configuration. It points the production domains back at an earlier deployment without rebuilding, and the rolled-back deployment keeps the build and environment variables it was built with, so configuration changed since may be stale; cron job definitions are restored from the target deployment. After a rollback, Vercel turns off automatic assignment of production domains, so new pushes to the production branch don't silently undo it, and "undo rollback" is promoting another deployment. On Pro and Enterprise any deployment previously aliased to production is eligible; Hobby can roll back to the immediately previous one.

The two designs encode the twelve-factor split differently: Heroku's release is build plus current configuration, Vercel's deployment is build plus the configuration it was built with. A provider building its own platform has to pick one and say so, because a customer rolling back after rotating a leaked secret needs to know which secret the old release will use.

## Blue/Green and Canary as Platform Features

The strategies predate the platforms. Martin Fowler's bliki entry on blue-green deployment (March 1, 2010) credits the name to "some foggy combination" of Daniel Terhorst-North and Jez Humble; canary releases and their automated verdicts are in the playbook's [Canary](/docs/delivery/deployment-strategies#canary) and [Let the Canary Be Judged Automatically](/docs/delivery/deployment-strategies#let-the-canary-be-judged-automatically). What platforms did was turn them from runbooks into switches. An immutable deployment with its own URL is a green environment that already exists, and promotion is the routing change the playbook's [Blue-Green](/docs/delivery/deployment-strategies#blue-green) section describes; deployment slots that swap, revisions that take a percentage of traffic, and rolling releases that step a new deployment through stages are canaries the provider runs. Heroku's preboot, which starts new dynos before the old ones stop and is part of its Standard tier's zero-downtime deploys, is a blue/green switch at the process level.

The cost moved onto the provider: two versions running at once is double capacity for the length of the overlap, and a provider that offers percentage routing has to run a router that can split traffic and a metrics pipeline that can tell the two populations apart. Products like this are why the deploy record needs a traffic weight and a state, not just a URL. Dedicated continuous delivery products that run the same strategies across platforms are [Continuous Delivery Platforms](/books/hosting-and-cloud/continuous-delivery-platforms#how-the-providers-do-it).

## The Image as the Artifact

Docker's image (from March 2013) gave platforms a second input besides source: a layered, content-addressed artifact the customer builds, pushes to a registry and names by digest. Platforms that accept images stopped needing to understand the language at all, and CI systems became the place images are built ([Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure#how-the-providers-do-it)). The registry became a deploy dependency, with its own pull limits and outages ([Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries#how-the-providers-do-it)). The playbook's [Building Images](/docs/delivery/containers#building-images) and [Trusting What You Run](/docs/delivery/containers#trusting-what-you-run) carry the rules; for the deploy record, the consequence is that a deployment should name its artifact by digest, so "what ran" is a hash, not a tag someone can move.

## GitOps: The Deploy as a Pull

Weaveworks named the practice in "GitOps: Operations by Pull Request" on August 7, 2017: desired state lives in Git, and an agent in the cluster pulls and reconciles it, so a deploy is a merged commit rather than a push from CI. The OpenGitOps principles say it in four words (declarative, versioned and immutable, pulled automatically, continuously reconciled), and Argo, one of the two reconcilers, graduated in the CNCF on December 6, 2022. The playbook's [GitOps](/docs/operations/kubernetes#gitops) section owns the practice, and Packaging & GitOps owns Argo CD, Flux and the Weaveworks shutdown. For the platform model, GitOps changes who creates the deploy record: not the CI system or the customer's CLI, but a reconciler that observed a new commit, which the `deployments` table records as its own source.

## Preview Deployments

Netlify introduced Deploy Previews on July 20, 2016: every pull request deployed to its own URL, linked from the pull request as a commit status, updated on each push, on every plan including free. It turned code review from reading a diff into using the change, and it made the playbook's rule that [anyone with a pull request gets a preview](/docs/operations/environments#who-deploys-where) cheap enough to be a default.

Vercel's current model shows the mature form. A push to any branch other than the production branch, a pull request, or a CLI deploy without `--prod` creates a preview deployment, and each has two kinds of URL: a branch URL that always points at the branch's latest deployment, and a commit URL that points at exactly one. Custom environments such as `staging` get their own branch tracking, domain and variables (one included per project on Pro, as of October 2026). A staged production deployment builds with production variables but waits for manual promotion, and promotion assigns the production domains without rebuilding.

What previews cost the provider is a build and a running deployment for every push of every branch, most of which nobody opens; this is why platforms meter build minutes and concurrent builds, and why previews get protection (a login wall, no search indexing) by default. What they cost the customer is a preview that talks to real services: a preview with production credentials is production. The playbook's [Secrets](/docs/operations/environments#secrets) section scopes credentials per environment for that reason.

## Immutable URLs and Aliases

ZEIT's Now, renamed with the company to Vercel on April 21, 2020, made the strongest version of the idea its product: every deploy is automatically assigned a unique, permanent URL, and an alias points a stable domain at one of them. A deploy becomes a pure function of the source; promotion, rollback and previews are alias moves; and an old deployment stays reachable at its own URL for debugging long after it stopped serving production. The playbook's [Immutable Deploys Make All of This Easier](/docs/delivery/deployment-strategies#immutable-deploys-make-all-of-this-easier) gives the reason it matters for every strategy.

The data model is two tables: deployments, immutable once built, and aliases, mutable pointers from a hostname to a deployment over time. The provider's routing layer reads the alias table on every request (from a cache), and the history of the alias table is the answer to "what was serving `example.com` at 14:02."

## Functions and Edge Deploys

Functions took the model one step further: the unit of deploy is a function, not a process. AWS Lambda, previewed on November 13, 2014, took a ZIP upload and ran it on events; Cloudflare Workers, announced September 29, 2017, deployed JavaScript to V8 isolates in every location at once. An edge deploy changes what "deployed" means: the new version propagates to hundreds of locations, so the deploy record needs a propagation state, and "rolled back" is true only when every location serves the old version. Functions, Isolates & Edge Compute covers the runtimes; the deploy record is the same `deployments` row with a different target kind.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Source push with buildpacks** | Platform detects, builds and runs | No build config; fast start | Opaque builds; stack upgrades break apps | Platform fee; CNB is Apache-2.0 | Heroku, Render, Railway, App Engine, App Platform |
| **Image push** | Customer builds an OCI image; platform runs it | Any language; same artifact everywhere | Customer owns base-image patching | Registry plus runtime fees | Cloud Run, App Runner, Fly.io, Kubernetes |
| **Immutable deployments with aliases** | Every build has a URL; domains are pointers | Instant promotion and rollback, previews by default | Config staleness on rollback; storage of many deployments | Platform fee; build minutes | Vercel, Netlify, Cloudflare Pages |
| **Slots and revisions** | Named or numbered versions with traffic weights | Percentage canaries inside one product | Shared resources across slots | Capacity for both versions | Azure App Service, Cloud Run, Lambda aliases |
| **GitOps reconciler** | Agent pulls desired state from Git | CI holds no production credentials; drift corrected | Reconciler is now production-critical; secrets need another tool | Open source (Argo CD, Flux) plus cluster cost | Kubernetes operators |
| **Scripted push from CI** | A pipeline runs deploy commands with credentials | Works anywhere | CI becomes a production credential holder | CI minutes | Everything without a platform |

## My Default

My default is immutable deployments named by artifact digest, with production as an alias that moves, previews for every pull request with non-production credentials, and rollback as an alias move that leaves auto-promotion off until someone deliberately resumes it. That gives the playbook's [continuous deployment](/docs/delivery/ci-pipelines#delivery-vs-deployment) a one-step undo. For configuration I'd follow the Heroku split: a release is a build plus a configuration version, both recorded, so a rollback states which configuration it will run with instead of surprising anyone. On Kubernetes, I'd use a GitOps reconciler so CI never holds cluster credentials.

What would change this: a workload whose versions can't coexist (a schema change that isn't backward compatible) needs the migration discipline in [The Database Is the Real Constraint](/docs/delivery/deployment-strategies#the-database-is-the-real-constraint) before any of this helps, and a long-lived stateful service may be better served by a rolling deploy than by keeping old deployments alive.

## How to Build It

The chapter adds the deployment record and the alias that routes to it. A deployment belongs to a resource (a `site`, `function` or `container_service`, or a `cluster` workload) in [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model); a GitOps reconciler applying a commit to a cluster writes the same row with `source = 'gitops'`, so Packaging & GitOps can use this table rather than define its own.

```sql
CREATE TABLE config_versions (           -- environment variables as a versioned set
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  resource_id   UUID NOT NULL REFERENCES resources (id),
  environment   TEXT NOT NULL,           -- 'production', 'preview', 'staging'
  version       INT NOT NULL,
  values_ref    TEXT NOT NULL,           -- pointer into the secret store; never values here
  created_by    TEXT NOT NULL,           -- typed actor
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (resource_id, environment, version)
);

CREATE TABLE deployments (               -- one immutable build of one revision, and its life
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  project_id       UUID NOT NULL REFERENCES projects (id),
  resource_id      UUID NOT NULL REFERENCES resources (id),  -- site, function, container_service, cluster
  number           BIGINT NOT NULL,      -- per resource, like a release number
  source           TEXT NOT NULL CHECK (source IN ('git_push', 'git_integration', 'cli', 'api',
                     'ci', 'image_push', 'gitops', 'ssh_release', 'rollback')),
  environment      TEXT NOT NULL,        -- 'production', 'preview', or a custom name
  git_ref          TEXT,                 -- branch or tag
  commit_sha       TEXT,
  pull_request_ref TEXT,                 -- for previews
  artifact_digest  TEXT,                 -- 'sha256:...' of the image or bundle once built
  config_version_id UUID REFERENCES config_versions (id),  -- the configuration it runs with
  rollback_of_id   UUID REFERENCES deployments (id),       -- for source = 'rollback'
  ci_run_id        UUID,                 -- the build job, when CI built it (Runners & Build Infrastructure)
  state            TEXT NOT NULL CHECK (state IN ('queued', 'building', 'ready', 'error',
                     'canceled', 'retired', 'purged')),
  propagation      TEXT CHECK (propagation IN ('pending', 'partial', 'complete')),  -- edge targets
  url              TEXT UNIQUE,          -- the immutable generated URL
  build_during     TSTZRANGE,
  purge_after      TIMESTAMPTZ,          -- retention: when the artifact may be deleted
  created_by       TEXT NOT NULL,        -- typed actor: 'member:<id>', 'service:ci', 'system:gitops'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (resource_id, number),
  CHECK ((source = 'rollback') = (rollback_of_id IS NOT NULL)),
  CHECK (state NOT IN ('ready', 'retired') OR artifact_digest IS NOT NULL)
);

CREATE TABLE deployment_aliases (        -- a stable name pointing at a deployment, over time
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  hostname        TEXT NOT NULL,         -- 'example.com', 'my-app-git-feature.example.app'
  deployment_id   UUID NOT NULL REFERENCES deployments (id),
  traffic_weight  SMALLINT NOT NULL DEFAULT 100 CHECK (traffic_weight BETWEEN 0 AND 100),
  kind            TEXT NOT NULL CHECK (kind IN ('production', 'branch', 'environment', 'custom')),
  assigned_during TSTZRANGE NOT NULL,
  assigned_by     TEXT NOT NULL,         -- typed actor; 'system:auto_promote' for a push
  reason          TEXT CHECK (reason IN ('auto_promote', 'promote', 'rollback', 'canary_step',
                    'branch_update', 'manual'))
);

-- Weights for one hostname at one instant must sum to 100: a deferred trigger checks it,
-- because a canary step changes two rows in one transaction.

CREATE TABLE auto_promotion_pauses (     -- rollback turns auto-promotion off until resumed
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id   UUID NOT NULL REFERENCES accounts (id),
  resource_id  UUID NOT NULL REFERENCES resources (id),
  environment  TEXT NOT NULL,
  paused_during TSTZRANGE NOT NULL,
  cause_deployment_id UUID REFERENCES deployments (id),
  EXCLUDE USING GIST (resource_id WITH =, environment WITH =, paused_during WITH &&)
);
```

The hostname an alias serves is also a `resource_identifiers` row (kind `hostname`) for the site, which is what abuse reports and law enforcement lookups resolve against; the alias table says which build served it. Build minutes and concurrent builds are usage events with meters defined in [The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#how-to-build-it).

What was serving a hostname at an instant, for an incident review or an abuse report:

```sql
SELECT a.hostname, d.number, d.commit_sha, d.artifact_digest, a.traffic_weight, a.reason
FROM deployment_aliases a
JOIN deployments d ON d.id = a.deployment_id
WHERE a.hostname = $1
  AND a.assigned_during @> $2::timestamptz;
```

## Auditing

- **Every deployment with its source, commit, artifact digest, configuration version and actor,** so "what code and which secrets ran in production at that time" is a query, not an investigation.
- **Every alias move with its reason** (auto-promotion, manual promotion, rollback, canary step), because the alias history is the production history.
- **Rollbacks and their pauses,** with who resumed auto-promotion and when, so an incident review can tell a deliberate freeze from a forgotten one.
- **Retention and purge of artifacts,** because a release that can no longer be rolled back to, or whose code can no longer be produced for an investigation, is a fact the customer should be able to see.

## What This Means for the System You Build

- **Make the deployment an immutable record** with an artifact digest, a commit, a configuration version and an actor.
- **Route by alias, rolled back by alias:** promotion and rollback move a pointer; nothing is rebuilt.
- **Say which configuration a rollback uses,** and record it on the deployment.
- **Pause auto-promotion after a rollback** until a person resumes it.
- **Build a preview for every pull request** with non-production credentials and no search indexing.
- **Record GitOps applies as deployments** with their own source, so one table holds every path to production.
- **Retain deployments on a stated rule,** and show customers which ones can still be rolled back to.

## References

**Announcements and history**

- [Heroku: The New Heroku (Part 1 of 4): The Process Model & Procfile](https://www.heroku.com/blog/the_new_heroku_1_process_model_procfile/), June 20, 2011, Cedar, the Procfile, `heroku scale`, `heroku run` and `git push` deploys
- [The Twelve-Factor App](https://12factor.net/), Adam Wiggins, the twelve factors and the "hundreds of thousands" of apps behind them
- [CNCF: Cloud Native Buildpacks](https://www.cncf.io/projects/buildpacks/), accepted October 3, 2018, incubating November 18, 2020
- [Martin Fowler: BlueGreenDeployment](https://martinfowler.com/bliki/BlueGreenDeployment.html), March 1, 2010, and the origin of the name
- [Weaveworks: GitOps, Operations by Pull Request](http://web.archive.org/web/20180107011605/https://www.weave.works/blog/gitops-operations-by-pull-request), August 7, 2017 (archived copy)
- [OpenGitOps](https://opengitops.dev/), the four principles
- [CNCF: Argo has graduated](https://www.cncf.io/announcements/2022/12/06/the-cloud-native-computing-foundation-announces-argo-has-graduated/), December 6, 2022
- [Netlify: Introducing Deploy Previews](https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/), July 20, 2016
- [Vercel: ZEIT is now Vercel](https://vercel.com/blog/zeit-is-now-vercel), April 21, 2020
- [Simon Willison: Deploying with ZEIT Now and Travis CI](https://simonwillison.net/2018/Jun/1/zeit-with-travis-ci), unique URLs per deployment and aliasing
- [AWS News Blog: AWS Lambda](https://aws.amazon.com/blogs/aws/run-code-cloud/), preview on November 13, 2014
- [Cloudflare: Introducing Cloudflare Workers](https://blog.cloudflare.com/introducing-cloudflare-workers/), September 29, 2017

**Documentation**

- [Heroku Dev Center: Releases](https://devcenter.heroku.com/articles/releases), what creates a release, rollback, what it doesn't roll back, and slug retention
- [Heroku: Pricing](https://www.heroku.com/pricing), preboot and zero-downtime deploys on Standard dynos
- [Vercel: Instant Rollback](https://vercel.com/docs/instant-rollback), alias reassignment without rebuild, stale configuration, cron restoration, auto-assignment turned off, eligibility by plan
- [Vercel: Environments](https://vercel.com/docs/deployments/environments), what creates a preview, branch and commit URLs, custom environments and their limits, staged production deployments
