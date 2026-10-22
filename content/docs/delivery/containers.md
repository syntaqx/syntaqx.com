+++
title = "Containers & Immutable Infrastructure"
nav_title = "Containers"
description = "Why you rebuild and redeploy the whole artifact instead of maintaining servers, and how to build container images that are small, patched, signed and safe."
category = "Delivery"
order = 1104
tags = ["containers", "docker", "delivery", "security"]
+++

The most important idea in modern operations isn't containers. It's that you never change a running system: you build a new one and replace the old one. Containers are just the most common way to do it.

## Rebuild, Don't Repair

The old model was the long-lived server. It was installed once, then patched, tweaked and hotfixed in place for years. Each change was reasonable on its own: a package upgraded to fix a bug, a config edited during an incident, a library installed for a one-off script. After a few years, nobody can say exactly what's on the machine, and nobody can build another one like it.

That's the real problem with servers you maintain: **the running system stops matching anything you can reproduce.** The industry calls these machines **pets**: named, nursed back to health when sick, irreplaceable. The alternative is **cattle**: identical, numbered, replaced rather than repaired. ([Randy Bias](https://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/) popularized the analogy for cloud, crediting Bill Baker.)

An [immutable server](https://martinfowler.com/bliki/ImmutableServer.html) is never modified after it's deployed. Every change, whether code, config, dependency or OS patch, produces a new artifact, and that artifact replaces the running one.

### What It Looks Like Under Pressure

In December 2021, [Log4Shell](https://www.cisa.gov/news-events/news/apache-log4j-vulnerability-guidance) (CVE-2021-44228) turned a logging library into remote code execution, and it was everywhere. Consider two teams responding to it.

The first team runs long-lived servers. Step one is finding out which of them have the library, which means logging into machines or writing scripts to search them, because no record says what's installed where. Step two is patching each one by hand or by script, hoping the servers are similar enough for the script to work everywhere. Step three is wondering which machines were missed, and whether any were compromised before the patch landed.

The second team builds every service as an image from a Dockerfile in its repository. Finding affected services is a search of the image manifests or [SBOMs](/docs/security/vulnerability-management). Fixing them is bumping one version, letting CI rebuild, and deploying the way they deploy every day. Every running instance is replaced, so none are missed, and anything an attacker may have planted on the old instances is thrown away with them.

The second team isn't smarter. Their system just doesn't allow the state the first team has to dig through.

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

The last row is the one teams undervalue until they need it. If the only definition of a server is the server itself, [disaster recovery](/docs/operations/disaster-recovery) means recreating years of manual changes. If the definition is a Dockerfile and a pipeline, recovery is a redeploy. And because every environment runs the same artifact, "it worked in staging" finally means something. See [Environments](/docs/operations/environments).

### What It Costs

Immutability isn't free, and the costs are worth naming:

- **State has to live elsewhere.** A container you'll throw away can't hold the database, uploaded files or sessions. That forces managed databases, object storage and external caches, which is the right design anyway, but it's work.
- **Every change is a build.** Fixing a typo in config means a rebuild and a deploy, not a quick edit. That's only painless when the pipeline is fast, which is why this depends on [CI](/docs/delivery/ci-pipelines) and [continuous deployment](/docs/delivery/ci-pipelines).
- **Debugging changes.** You can't SSH in and poke at a production box that will be replaced in an hour, so logs, metrics and traces have to carry what you used to learn by looking. See [Observability](/docs/operations/observability).

Each cost pushes you toward a practice you want anyway. That's the strongest argument for the model: it's hard to do immutable infrastructure badly for long.

## Building Images

- **Multi-stage builds.** Compile in a stage with the full toolchain, then copy only the output into a minimal final stage. Build tools never ship. See [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/).
- **Minimal base images.** [Distroless](https://github.com/GoogleContainerTools/distroless) or slim images contain the runtime and nothing else: no shell, no package manager. Every tool you leave out is one an attacker can't use and one more CVE you don't have to patch.
- **Pin base images by digest** (`node:24-slim@sha256:...`), not just a tag, so a build is reproducible, and let Dependabot or Renovate bump the digest in a reviewable pull request.
- **Rebuild on a schedule,** even when the code hasn't changed. Base images are republished as the packages in them get security fixes, but your image only picks those up when it's rebuilt. An image built six months ago carries six months of unpatched packages, even if nobody has touched the service. A weekly rebuild-and-deploy keeps you current without anyone remembering to.
- **Order layers for caching:** dependency manifests and install first, source code last, so a code change doesn't reinstall everything.

## Running Them Safely

- **Run as a non-root user,** set with `USER` in the Dockerfile. Containers share the host's kernel, so a process running as root is one kernel or runtime bug away from root on the host.
- **Read-only root filesystem,** with explicit writable volumes only where needed. Malware that can't write can't persist.
- **One process per container,** logging to stdout and stderr for the platform to collect. See [The Twelve-Factor App: Logs](https://12factor.net/logs).
- **Config from the environment,** never baked into the image, so one image serves every environment. See [Configuration & Secrets](/docs/operations/environments).
- **Health checks:** liveness to restart a stuck process, readiness to keep traffic away until it can serve, startup for slow boots. See [Kubernetes probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).
- **Disposable processes:** fast startup, graceful shutdown on `SIGTERM`, no local state worth keeping. See [The Twelve-Factor App: Disposability](https://12factor.net/disposability).

## Trusting What You Run

- **Scan images in CI** for known vulnerabilities, with a tool like [Trivy](https://trivy.dev/), and fail on fixable criticals. See [Vulnerability Management](/docs/security/vulnerability-management).
- **Generate provenance:** a signed record of what source, builder and dependencies produced the image. [SLSA](https://slsa.dev/spec/v1.0/levels) Build L2 means a hosted build platform signs it.
- **Sign images** with [Sigstore cosign](https://docs.sigstore.dev/cosign/signing/signing_with_containers/), keyless from CI, and verify signatures before deploy. An unsigned image doesn't run, so an attacker who gets write access to your registry still can't get their image into production.

## Serverless Is the Same Idea

Serverless platforms take immutability to its conclusion: there's no server for you to patch at all. Every deploy is a fresh, immutable build; the platform runs it, scales it to zero and patches what's underneath. Containers are the right tool when you need control over the runtime, long-running processes or portability between providers. Serverless is the right tool when you don't.

## This Site

This site runs on Vercel: every push builds a new immutable deployment, previews and production run the same build, and rolling back is pointing production at the previous deployment. There are no servers here to patch. Locally, `compose.yml` runs Redis 8 and its REST proxy from images, the same ones CI starts as service containers.

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
