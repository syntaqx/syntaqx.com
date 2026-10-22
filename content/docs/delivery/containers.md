+++
title = "Containers & Immutable Infrastructure"
description = "Why you rebuild and redeploy the whole artifact instead of maintaining servers, and how to build container images that are small, patched, signed and safe."
category = "Delivery"
order = 11.2
tags = ["containers", "docker", "delivery", "security"]
+++

The most important idea in modern operations isn't containers. It's that you never change a running system: you build a new one and replace the old one. Containers are just the most common way to do it.

## Rebuild, Don't Repair

The old model was the long-lived server. It was installed once, then patched, tweaked and hotfixed in place for years until nobody knew exactly what was on it. The industry calls these **pets**: named, nursed back to health when sick, irreplaceable. The alternative is **cattle**: identical, numbered, replaced rather than repaired. ([Randy Bias](https://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/) popularized the analogy for cloud, crediting Bill Baker.)

An [immutable server](https://martinfowler.com/bliki/ImmutableServer.html) is never modified after it's deployed. Every change, whether code, config, dependency or OS patch, produces a new artifact, and that artifact replaces the running one. What that buys you:

- **Patching is a rebuild.** A vulnerable OpenSSL isn't an SSH-and-apt-get emergency across forty servers; it's a new base image, a rebuild, and a normal deploy.
- **Drift is impossible.** Nothing was changed by hand, so production is exactly what the repository says. "Works in staging" means something.
- **Rollback is redeploying the previous artifact.** Seconds, not a reverse-engineered undo.
- **Every environment runs the same thing.** The image that passed CI is the image in production, byte for byte. See [Environments](/docs/operations/environments).
- **Recovery is redeployment.** Lose a host, a cluster or a region, and you run the same artifacts somewhere else. See [Disaster Recovery](/docs/operations/disaster-recovery).

## Building Images

- **Multi-stage builds.** Compile in a stage with the full toolchain, then copy only the output into a minimal final stage. Build tools never ship. See [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/).
- **Minimal base images.** [Distroless](https://github.com/GoogleContainerTools/distroless) or slim images contain the runtime and nothing else: no shell, no package manager. Every tool you leave out is one an attacker can't use and one more CVE you don't have to patch.
- **Pin base images by digest** (`node:24-slim@sha256:...`), not just a tag, so a build is reproducible, and let Dependabot or Renovate bump the digest in a reviewable pull request.
- **Rebuild on a schedule,** even when the code hasn't changed. Base images get security patches weekly; an image built six months ago is six months of unpatched. A nightly or weekly rebuild-and-deploy keeps you current for free.
- **Order layers for caching:** dependency manifests and install first, source code last, so a code change doesn't reinstall everything.

## Running Them Safely

- **Run as a non-root user,** set with `USER` in the Dockerfile. A container escape from root is a host compromise.
- **Read-only root filesystem,** with explicit writable volumes only where needed. Malware that can't write can't persist.
- **One process per container,** logging to stdout and stderr for the platform to collect. See [The Twelve-Factor App: Logs](https://12factor.net/logs).
- **Config from the environment,** never baked into the image, so one image serves every environment. See [Configuration & Secrets](/docs/operations/configuration).
- **Health checks:** liveness to restart a stuck process, readiness to keep traffic away until it can serve, startup for slow boots. See [Kubernetes probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).
- **Disposable processes:** fast startup, graceful shutdown on `SIGTERM`, no local state worth keeping. See [The Twelve-Factor App: Disposability](https://12factor.net/disposability).

## Trusting What You Run

- **Scan images in CI** for known vulnerabilities, with a tool like [Trivy](https://trivy.dev/), and fail on fixable criticals. See [Vulnerability Management](/docs/security/vulnerability-management).
- **Generate provenance:** a signed record of what source, builder and dependencies produced the image. [SLSA](https://slsa.dev/spec/v1.0/levels) Build L2 means a hosted build platform signs it.
- **Sign images** with [Sigstore cosign](https://docs.sigstore.dev/cosign/signing/signing_with_containers/), keyless from CI, and verify signatures before deploy. An unsigned image doesn't run.

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
- [Randy Bias: The history of pets vs cattle](https://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/), disposable infrastructure
- [The Twelve-Factor App: Disposability](https://12factor.net/disposability), fast startup and graceful shutdown
- [The Twelve-Factor App: Logs](https://12factor.net/logs), logs as event streams to stdout
