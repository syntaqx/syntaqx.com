+++
title = "Securing Software Updates"
description = "An updater that survives a hostile network: TUF's threat model, keys split by role, signed monotonic manifests, verified chunks and deltas, and staged rollout."
category = "Security"
order = 712
tags = ["security", "updates", "signing", "supply-chain", "tuf"]
+++

An updater is code that downloads files from the network and runs them with the user's privileges, on every machine you ship to, on a schedule nobody watches. That makes it the most valuable thing an attacker can take over: one compromised update channel reaches every install at once. Whether you ship a desktop client, a game launcher, a device fleet, a mobile app's downloadable content or an agent that runs on customers' servers, the updater is part of your attack surface, and "we serve it over HTTPS" is not a design.

My rule: **the client trusts signatures, never servers.** Every byte it installs is named by a hash in a manifest signed with a key the CDN never holds, the manifest only ever moves forward, and the keys are split so that losing any one of them is recoverable. The Update Framework (TUF), a graduated CNCF project built for exactly this problem, is the reference for how; this doc is the working version of it.

## What an Updater Must Resist

TUF's security page lists the attacks a software updater has to withstand. Most of them assume the attacker controls the network or a mirror, not your signing keys, which is the common case:

| Attack | What the attacker does | The defense |
| ------ | ---------------------- | ----------- |
| **Arbitrary installation** | Serves any file in response to a download request | Install only files whose hash is listed in a signed manifest |
| **Rollback** | Serves files "older than those the client has already seen," to reinstall a vulnerable version | Monotonic version numbers; refuse anything lower than the last accepted |
| **Indefinite freeze** | Keeps serving the same old, validly signed metadata, so the client never learns an update exists | Short expiry on the "what's current" pointer |
| **Mix-and-match** | Combines files "that did not exist there together at the same time" | One signed snapshot naming every file of a release |
| **Endless data** | Answers a download with an endless stream, exhausting disk or memory | An expected size for every object; stop at the limit |
| **Fast-forward** | Inflates version numbers so later legitimate updates look like rollbacks | Recovery procedure that resets trusted versions after a key rotation |
| **Malicious mirrors** | One compromised mirror blocks updates from the good ones | Fail over across mirrors; trust content, not the mirror |
| **Key compromise** | A stolen signing key makes malicious content verify | Keys split by role, thresholds, offline root, rehearsed rotation |

TUF's design principles follow from the table: trust is compartmentalized so no party is trusted for more than it needs, the most powerful keys need a threshold of signatures, "trust should expire if it is not renewed," and the client verifies the repository as a whole, never one file at a time.

## Separate Keys by Role

A single signing key is a single point of failure: whoever has it can ship anything, and if it lives on the build server, so does the attacker who owns that server. TUF splits signing into four top-level roles, each with its own keys and its own threshold of signatures:

| Role | Signs | Where its keys live | Changes |
| ---- | ----- | ------------------- | ------- |
| **Root** | The list of keys trusted for every other role, including itself | Offline, several holders, threshold above one | Rarely, in a ceremony |
| **Targets** | The release: each file's hash and length (not the files themselves) | Release pipeline or an HSM-backed signing service | Every release |
| **Snapshot** | The current version of every targets file, so a release is one consistent set | Online, automated | Every release |
| **Timestamp** | A short-lived statement pointing at the current snapshot | Online, automated | Every few minutes to hours |

- **The root is the trust anchor,** shipped in the client and kept offline. It's needed only to rotate other keys, so an attacker who takes over your online infrastructure gets nothing that can rewrite trust.
- **The online keys are the weak ones by design.** The timestamp key has to sign on a schedule, so it sits on a server; its power is limited to saying "this snapshot is current," which can't introduce a file that the targets key never signed.
- **Thresholds for anything powerful.** Each key counts once toward a threshold, so a root with a threshold of three of five survives one or two lost or stolen keys. For a small team, two of three hardware keys held by different people is a reasonable floor.
- **Delegate rather than share.** A targets role can delegate a subset of files (one game's content, one plugin's packages) to a team's own keys, and revoke that delegation later by publishing metadata without it. Nobody needs the main release key to ship their part.

You don't have to run TUF's reference implementation to use its model; the point is the separation. A homegrown updater still needs an offline root key that signs the release key, a release key that never touches the CDN, and a pointer to "current" that expires.

## Manifests That Only Move Forward

The client downloads a manifest before anything else, and the manifest decides what's true:

```json
{
  "signed": {
    "type": "release",
    "channel": "live",
    "version": 4182,
    "expires": "2026-11-02T00:00:00Z",
    "files": {
      "chunks/3f9a...c1": { "length": 1048576, "sha256": "3f9a...c1" },
      "chunks/a07e...9d": { "length": 524288,  "sha256": "a07e...9d" }
    },
    "minimum_client": "11.08.0"
  },
  "signatures": [{ "keyid": "release-2026a", "sig": "..." }]
}
```

The shape is illustrative; TUF's own metadata splits it across the roles above. The rules aren't:

- **The version only goes up.** TUF says clients "MUST NOT replace a metadata file with a version number less than the one currently trusted." The client stores the highest version it has accepted and refuses anything lower, which closes rollback.
- **Expiry is enforced.** "Clients MUST NOT trust an expired file." The pointer to the current release expires in hours or days, so a mirror serving yesterday's signed metadata forever is detected rather than believed. Expiry is checked against a time captured once at the start of the update, so one update can't see two different "nows".
- **Rolling back is publishing forward.** When a release is bad, publish a new manifest with a higher version that references the previous release's files. The client accepts it, because the number went up, and gets the old content. A rollback that lowers the version is indistinguishable from an attack, and a well-built client will refuse it.
- **Signature before parse.** Verify the signature over the canonical bytes before trusting any field in them. A parser bug reached by unsigned input is an exploit on every client.

## Content-Addressed Chunks

Name every file by the hash of its content, list the hashes in the signed manifest, and the transport stops mattering: a chunk is correct if its hash matches, whichever CDN, mirror or peer served it.

- **Verify each object as it arrives,** and discard any that doesn't match before it touches the install.
- **Every object has an expected length.** Download stops at the length the manifest promised, which closes endless data. For metadata whose size isn't known in advance, the client caps it at a fixed byte limit.
- **Chunks deduplicate across releases.** A release that changes 2% of the content changes about 2% of the chunks, and the client downloads only what it doesn't have. That makes publishing cheap and rollback free: the old release's chunks are still on the CDN and often still on disk.
- **The CDN is untrusted storage.** Its credentials can upload files, never sign them. An attacker with CDN access can deny service, which mirrors and failover handle, but can't get a byte installed.

## Delta Updates

A delta is a patch from the version the client has to the version it needs, and it's the difference between an update that lands in minutes and one that waits for Wi-Fi. Chromium's Courgette write-up gives one update three ways: 10,385,920 bytes as a full download, 704,512 bytes as a bsdiff patch, 78,848 bytes with Courgette's disassemble-and-diff approach. Google's stated reason wasn't bandwidth for its own sake: smaller updates narrow "the window of vulnerability," because they reach everyone sooner.

Deltas add a step that's easy to get wrong:

- **Sign the patch and verify the result.** The patch is listed in the manifest with its own hash, and the reconstructed file is checked against the target hash too. A patch applied to a locally corrupted or modified base produces a wrong file with no error; only the final hash catches it.
- **Know the base.** A delta is only valid from one exact source version. The client reports the hash of what it has, or verifies the base before patching.
- **Fall back to full.** If the base doesn't match or the result fails verification, download the whole file. A failed delta must never leave a half-patched install.
- **Bound the patch chain.** Serve deltas from the last few versions and full files for anything older, or the build matrix grows with every release.

## Installing Without Bricking

Verification decides what's safe to install; the install itself decides whether a failure leaves the machine working. Android's A/B (seamless) updates are the reference design: the device has two slots, the update is written to the one not in use while the device keeps running, the whole written partition is "re-read and verified against the expected hash," and the bootloader switches over on reboot. If the new slot fails to boot, "the device will reboot back into the old partition and remains usable."

- **Stage beside, switch atomically.** Write the new version next to the old one (a second directory, slot or image) and flip a pointer once everything has verified. Never overwrite the running install in place.
- **Health-check after switching,** and switch back automatically if the new version doesn't report healthy.
- **Keep the previous version** until the new one has proven itself, so recovery doesn't depend on the network.

## Key Rotation and Compromise Recovery

Assume a key will be lost or stolen eventually, and design so that either is a procedure, not an emergency.

- **Root rotation is a chain.** TUF clients walk root versions one at a time (N+1, then N+2) until none is newer, and each new root must carry a threshold of signatures from the previous root's keys and a threshold from its own. A client offline for a year still reaches the current keys by following the chain, and an attacker can't skip it without the old keys.
- **Rotating any other key is a root update.** Publish new root metadata that lists the new key and drops the old one; the old key stops being trusted the moment clients see it.
- **After a compromise, reset what the attacker could have inflated.** If the timestamp or snapshot keys were rotated after a compromise, TUF clients discard their trusted timestamp and snapshot metadata, so version numbers an attacker pushed sky-high can't block every future legitimate update (the fast-forward attack).
- **Keys in hardware.** Release and root keys live in an HSM, a cloud KMS signing key, or hardware tokens, so they can be used but not copied. [HSMs & Key Management](/books/payments/key-management) covers ceremonies and split knowledge for keys that warrant them.
- **Rehearse it.** Rotate the release key on a schedule, and run a compromise drill on a staging channel. A rotation path that has never run is a hypothesis ([Threat Modeling](/docs/security/threat-modeling)).

## Signing in the Build

The manifest proves a release came from your release process; it doesn't prove the release process built what's in your repository. Close that gap in the pipeline:

- **Sign from CI, never a laptop,** with keys only the release job can use ([CI Pipelines](/docs/delivery/ci-pipelines#secure)).
- **Keyless signing with a transparency log** fits build artifacts well. Sigstore's Fulcio "issues a short-lived certificate bound to the provided identity and public key," using the CI workflow's OIDC identity, and Rekor records the signature in "an immutable, append-only ledger," so a signature made by a stolen identity is at least publicly visible. [Containers](/docs/delivery/containers#trusting-what-you-run) uses the same tools for images.
- **Provenance and reproducible builds,** so a release can be traced to source and rebuilt to the same bytes ([Mobile Releases](/docs/delivery/mobile-releases#signing-and-reproducible-builds)).

Build signing and update signing are layers, not alternatives: the build signature says what the pipeline produced, and the update manifest says which of those artifacts is the current release for this channel.

## Staged Rollout and the Kill Switch

Publishing is cheap with chunks; exposure should still be slow.

- **Channels.** A channel (live, beta, internal, one per platform or region if you need them) points at exactly one signed release at a time. Moving a release between channels is a new signed pointer, not a file copy.
- **Stage by percentage or cohort.** Assign each install a stable bucket and expose a release to 1%, 10%, 50%, then everyone, watching update failure rate, crash rate and the health signals that matter for the product before each step ([Deployment Strategies](/docs/delivery/deployment-strategies#canary); [Mobile Releases](/docs/delivery/mobile-releases#phased-rollouts) when a store controls the rollout).
- **A halt that works in seconds.** Halting a rollout means the "current" pointer for unexposed buckets stays where it was. Pulling a bad release from everyone means publishing forward to a version with the old content, as above.
- **A server-side kill switch** for the feature, not the binary, where the code allows it ([Feature Flags](/docs/delivery/feature-flags#kill-switches)). It's faster than any update, and it's the only lever for clients that already installed the bad version.
- **A minimum supported version,** carried in signed metadata, that the client checks at startup and before doing anything that needs the server, so a release with a security fix can be made mandatory ([Mobile Releases](/docs/delivery/mobile-releases#minimum-supported-versions-and-forced-upgrades)).

## When One Repository Is Not Enough

Uptane, "a secure software update framework for ground vehicles," extends TUF for fleets where different devices need different images. It uses two repositories: an **Image repository** "primarily controlled by human actors, and updated relatively infrequently," holding the signed images, and a **Director repository** "mostly controlled by automated, online processes" that tells each vehicle's controllers which images to install. A device installs an image only when both agree, so an attacker has to compromise both to push a malicious update. The same split works for any fleet where per-device targeting is automated: keep the decision of *what is a valid release* offline and human, and let the online service only choose *which valid release* a device gets.

## Checklist

- **Every installed byte named by hash** in a manifest signed with a key the CDN never holds; signature checked before parsing.
- **Keys separated by role:** an offline root with a threshold, a release key in hardware, short-lived online keys for freshness.
- **Monotonic versions and enforced expiry;** rollback by publishing forward with a higher version.
- **Expected length on every object,** and a byte cap on metadata.
- **Deltas verified on the result,** with a fallback to full files.
- **Install beside the running version** and switch atomically, with an automatic fallback.
- **Rotation and compromise recovery written, automated and rehearsed.**
- **Build artifacts signed from CI,** with provenance.
- **Channels, staged exposure, a halt, a feature kill switch and a signed minimum version.**

## References

**Specifications**

- [The Update Framework: Specification](https://theupdateframework.github.io/specification/latest/), top-level roles, thresholds, expiry, version rules, root rotation, fast-forward recovery and download limits
- [Uptane Standard](https://uptane.org/docs/latest/standard/uptane-standard), Image and Director repositories, and full versus partial verification

**Reference**

- [The Update Framework](https://theupdateframework.io/), a graduated CNCF project
- [The Update Framework: Security](https://theupdateframework.io/docs/security/), the attacks an updater must resist and the design principles behind TUF
- [Sigstore: Overview](https://docs.sigstore.dev/about/overview/), Cosign, Fulcio's short-lived certificates, Rekor's transparency log and keyless signing
- [Android: A/B (seamless) system updates](https://source.android.com/docs/core/ota/ab), two slots, post-write hash verification and fallback when the new slot fails to boot

**In practice**

- [Chromium: Software Updates: Courgette](https://www.chromium.org/developers/design-documents/software-updates-courgette/), full, bsdiff and Courgette update sizes, and smaller updates narrowing the window of vulnerability
- [Riot Games: Supercharging Data Delivery: The New League Patcher](https://www.riotgames.com/en/news/supercharging-data-delivery-new-league-patcher), content-defined chunks listed in a signed manifest
