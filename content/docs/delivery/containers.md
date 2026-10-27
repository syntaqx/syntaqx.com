+++
title = "Containers & Immutable Infrastructure"
nav_title = "Containers"
description = "Why you rebuild and redeploy the whole artifact instead of maintaining servers, and how to build container images that are small, patched, signed and safe."
category = "Delivery"
order = 1104
tags = ["containers", "docker", "delivery", "security"]
+++

The most important idea in modern operations isn't containers. It's that you never change a running system: you build a new one and replace the old one. Containers are just the most common way to do it, and every rollback in [Deployment Strategies](/docs/delivery/deployment-strategies) depends on it.

## Rebuild, Don't Repair

The old model was the long-lived server, installed once, then patched, tweaked and hotfixed in place for years. Each change was reasonable on its own: a package upgraded to fix a bug, a config edited during an incident. After a few years nobody can say exactly what's on the machine, and nobody can build another one like it: **the running system stops matching anything you can reproduce.** The industry calls these machines **pets**: named, nursed back to health when sick, irreplaceable. The alternative is **cattle**: identical, numbered, replaced rather than repaired. ([Randy Bias](https://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/) popularized the analogy for cloud, crediting Bill Baker.)

An [immutable server](https://martinfowler.com/bliki/ImmutableServer.html) is never modified after it's deployed. Every change, whether code, config, dependency or OS patch, produces a new artifact, and that artifact replaces the running one.

### What It Looks Like Under Pressure

In December 2021, [Log4Shell](https://www.cisa.gov/news-events/news/apache-log4j-vulnerability-guidance) (CVE-2021-44228) turned a logging library into remote code execution, and it was everywhere. A team running long-lived servers first had to find which machines had the library, by logging in or scripting searches, because no record said what was installed where. Then it patched each one, hoping they were similar enough for the script to work, and wondered which were missed and which were compromised first.

A team building every service as an image from a Dockerfile searched its image manifests or [SBOMs](/docs/security/vulnerability-management), bumped one version, and deployed the way it deploys every day. Every running instance was replaced, so none were missed, and anything an attacker planted was thrown away with them. The second team isn't smarter; its system just doesn't allow the state the first team had to dig through.

### What You Get

| | Long-lived servers | Immutable artifacts |
| --- | --- | --- |
| Patching | Log in and change each machine | Rebuild once, redeploy everywhere |
| What's running | Whatever accumulated, known roughly | Exactly what the repository built |
| Configuration drift | Inevitable | Impossible: nothing is changed by hand |
| Rollback | Reverse-engineer an undo | Redeploy the previous artifact |
| Staging vs production | Similar machines, hopefully | The same artifact, byte for byte |
| A compromised host | Clean it and hope | Replace it; the next deploy erases it anyway |
| Losing a host or region | Rebuild it from memory and runbooks | Run the same artifacts somewhere else |

The last row is the one teams undervalue until they need it. If the only definition of a server is the server itself, [disaster recovery](/docs/operations/disaster-recovery) means recreating years of manual changes. If it's a Dockerfile and a pipeline, recovery is a redeploy. And because every [environment](/docs/operations/environments) runs the same artifact, "it worked in staging" finally means something.

### What It Costs

Immutability isn't free:

- **State has to live elsewhere.** A container you'll throw away can't hold the database, uploads or sessions, which forces managed databases, object storage and external caches: the right design anyway, but work.
- **Every change is a build.** A config typo means a rebuild and a deploy, painless only with a fast [pipeline](/docs/delivery/ci-pipelines).
- **Debugging changes.** You can't SSH into a box that will be replaced in an hour, so [logs, metrics and traces](/docs/operations/observability) have to carry what you used to learn by looking.

Each cost pushes you toward a practice you want anyway, which is the strongest argument for the model: it's hard to do immutable infrastructure badly for long.

## Building Images

- **Multi-stage builds.** Compile in a stage with the full toolchain, then copy only the output into a minimal final stage. Build tools never ship. See [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/).
- **Minimal base images.** [Distroless](https://github.com/GoogleContainerTools/distroless) or slim images contain the runtime and nothing else: no shell, no package manager. Every tool you leave out is one an attacker can't use and one more CVE you don't have to patch.
- **Pin base images by digest** (`node:24-slim@sha256:...`), not just a tag, so a build is reproducible, and let Dependabot or Renovate bump the digest in a reviewable pull request.
- **Rebuild on a schedule,** even when the code hasn't changed. Base images are republished with security fixes, but your image only picks them up when it's rebuilt; one built six months ago carries six months of unpatched packages. A weekly rebuild-and-deploy keeps you current without anyone remembering to.
- **Order layers for caching:** dependency manifests and install first, source code last, so a code change doesn't reinstall everything.

## Running Them Safely

- **Run as a non-root user,** set with `USER` in the Dockerfile. Containers share the host's kernel, so a process running as root is one kernel or runtime bug away from root on the host.
- **Read-only root filesystem,** with explicit writable volumes only where needed. Malware that can't write can't persist.
- **One process per container,** logging to stdout and stderr for the platform to collect. See [The Twelve-Factor App: Logs](https://12factor.net/logs).
- **Config from the environment,** never baked into the image, so one image serves every environment. See [Environments & Configuration](/docs/operations/environments).
- **Health checks:** liveness to restart a stuck process, readiness to keep traffic away until it can serve, startup for slow boots. [Kubernetes Operations](/docs/operations/kubernetes) covers getting them right.
- **Disposable processes:** fast startup, graceful shutdown on `SIGTERM`, no local state worth keeping. See [The Twelve-Factor App: Disposability](https://12factor.net/disposability).

## Trusting What You Run

- **Scan images in CI** for known vulnerabilities, with a tool like [Trivy](https://trivy.dev/), and fail on fixable criticals. See [Vulnerability Management](/docs/security/vulnerability-management).
- **Generate provenance:** a signed record of what source, builder and dependencies produced the image. [SLSA](https://slsa.dev/spec/v1.0/levels) Build L2 means a hosted build platform signs it.
- **Sign images** with [Sigstore cosign](https://docs.sigstore.dev/cosign/signing/signing_with_containers/), keyless from CI, and verify before deploy. An unsigned image doesn't run, so an attacker with write access to your registry still can't get theirs into production.

## Serverless Is the Same Idea

Serverless platforms take immutability to its conclusion: there's no server for you to patch at all. Every deploy is a fresh build that the platform runs, scales to zero and patches underneath. Containers are the right tool when you need control over the runtime, long-running processes or portability between providers; serverless when you don't.

## References

**Specifications**

- [SLSA: Security levels](https://slsa.dev/spec/v1.0/levels), build provenance from L1 to L3

**Reference**

- [Docker: Multi-stage builds](https://docs.docker.com/build/building/multi-stage/), keeping build tools out of the final image
- [Docker: Building best practices](https://docs.docker.com/build/building/best-practices/), pinning base images, layer caching, minimal images
- [Docker: Dockerfile USER](https://docs.docker.com/reference/dockerfile/#user), running as a non-root user
- [Kubernetes: Liveness, readiness and startup probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/), health checks
- [Sigstore: Signing containers](https://docs.sigstore.dev/cosign/signing/signing_with_containers/), keyless image signing with cosign
- [Distroless images](https://github.com/GoogleContainerTools/distroless), runtime only, no shell or package manager
- [Trivy](https://trivy.dev/), scanning images for vulnerabilities and misconfigurations

**In practice**

- [Martin Fowler: Immutable Server](https://martinfowler.com/bliki/ImmutableServer.html), never modifying a deployed server
- [CISA: Apache Log4j vulnerability guidance](https://www.cisa.gov/news-events/news/apache-log4j-vulnerability-guidance), Log4Shell (CVE-2021-44228)
- [Randy Bias: The history of pets vs cattle](https://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/), disposable infrastructure
- [The Twelve-Factor App: Disposability](https://12factor.net/disposability), fast startup and graceful shutdown
- [The Twelve-Factor App: Logs](https://12factor.net/logs), logs as event streams to stdout
