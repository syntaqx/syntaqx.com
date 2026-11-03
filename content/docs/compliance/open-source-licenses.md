+++
title = "Open-Source Licenses"
description = "License families and what triggers them in SaaS and shipped software, SPDX, scanning in CI, an allow and deny policy, attribution, CLAs, and deal diligence."
category = "Compliance"
order = 909
tags = ["compliance", "licensing", "open-source", "spdx", "supply-chain", "legal"]
+++

Almost every product is mostly other people's code, and every piece of it arrived with a license: a set of conditions under which you may copy, change and ship it. Most of those conditions are easy (keep a copyright notice), a few are expensive (publish your source), and some aren't open source at all (don't offer it as a service). None of them are visible in a lockfile. The engineering job is knowing which licenses are in what you ship, knowing which ones your way of shipping triggers, and catching the expensive ones in review instead of in an acquirer's audit.

This isn't legal advice. Licenses are contracts and copyright grants, and how they apply to your product depends on facts and jurisdiction; the last section says when a lawyer needs to be in the room. What follows is how an engineering organization makes their decisions cheap to enforce. Vetting a dependency's health and security is [Dependencies & Upgrades](/docs/development/dependencies); SBOMs as a vulnerability tool are in [Vulnerability Management](/docs/security/vulnerability-management#finding-them).

## The Families

Licenses sort into five families by what they ask of you:

| Family | Examples | What it asks | Triggered by |
| --- | --- | --- | --- |
| **Permissive** | MIT, BSD-2-Clause, BSD-3-Clause, Apache-2.0 | Keep the notices; Apache-2.0 also has a patent clause and NOTICE file | Distribution |
| **Weak copyleft** | LGPL-2.1, LGPL-3.0, MPL-2.0 | Share changes to the licensed component itself; your own code can stay closed | Distribution |
| **Strong copyleft** | GPL-2.0, GPL-3.0 | Release the whole combined work's source under the GPL | Distribution |
| **Network copyleft** | AGPL-3.0 | The GPL's terms, plus source for users who interact with a modified version over a network | Distribution, or network use of a modified version |
| **Source-available** | BUSL-1.1, SSPL-1.0, Elastic-2.0 | Varies; typically no competing hosted service | Use, as the license defines it |

The first four are open source: they meet the Open Source Definition, whose sixth criterion says a license "must not restrict anyone from making use of the program in a specific field of endeavor". The fifth family fails exactly that test, which is why it gets its own row and its own review.

### Permissive

**MIT and BSD** ask for the copyright and license text to travel with copies. That's it, and that's why they're the default for libraries.

**Apache-2.0** adds two things worth knowing. Section 3 grants a patent license from every contributor, and terminates it for anyone who sues: if you institute patent litigation "alleging that the Work or a Contribution incorporated within the Work constitutes direct or contributory patent infringement", your patent licenses for that work end "as of the date such litigation is filed". Section 4(d) says that if the work ships a `NOTICE` file, derivative works you distribute "must include a readable copy of the attribution notices contained within such NOTICE file". The patent grant is why many companies prefer Apache-2.0 over MIT for what they publish.

Compatibility matters when permissive code flows into copyleft code. The Apache Software Foundation says Apache-2.0 code can be included in GPLv3 projects, but that the FSF "has never considered the Apache License to be compatible with GPL version 2", citing the patent termination and indemnification provisions.

### Weak Copyleft

Weak copyleft draws the line around the licensed component, not your program.

- **MPL-2.0** is file-level. Mozilla's FAQ: modifications to MPL-licensed files "must be licensed under the MPL and made available to anyone to whom you distribute the Source Code", while new files with no MPL code aren't modifications, which lets MPL code be "statically linked to and distributed as part of a larger proprietary piece of software". Change an MPL file, publish that file; your other files are yours.
- **LGPL** is library-level, with a condition on how you combine. LGPL-3.0 section 4(d) requires that you either "Use a suitable shared library mechanism for linking with the Library" or convey the material needed for users to relink against a modified version. In practice: dynamic linking is the comfortable path, and static linking (common in Go and Rust binaries, and in mobile apps) needs care and usually counsel.

### Strong Copyleft

The **GPL** asks that a work based on GPL code, when distributed, be distributed under the GPL with its complete source. Two boundaries decide most cases:

- **Distribution is the trigger.** The FSF's own FAQ is plain: "The GPL permits anyone to make a modified version and use it without ever distributing it to others." Running GPL software on your servers, or modifying it for internal use, triggers nothing. This is the SaaS gap the AGPL was written to close.
- **Combination, not proximity.** Separate programs shipped side by side are an "aggregate", in the FAQ's word, and each keeps its own license: a GPL command-line tool in your container image doesn't relicense your service. Linking GPL code into your program is the case that does. Where exactly that line falls (plugins, shared memory, RPC) is the most argued question in open-source licensing, and the place to stop and ask counsel.

**Versions matter.** Asked whether GPLv3 is compatible with GPLv2, the FSF's FAQ answers "No. Many requirements have changed from GPLv2 to GPLv3", with an exception for code released under "version 2 or later". That difference is why the SPDX identifiers distinguish `GPL-2.0-only` from `GPL-2.0-or-later`.

### Network Copyleft

The **AGPL-3.0** is the GPLv3 plus section 13, "Remote Network Interaction": if you modify the program, users interacting with your modified version remotely over a network must be offered its source code at no charge. Three consequences:

- **Unmodified use** of an AGPL server (running a stock AGPL database or service) doesn't trigger section 13, but any patch does, including a one-line fix you never meant as a fork.
- **Embedding an AGPL library** in your service makes your service the modified program. That's the case many companies' policies deny outright.
- **Distribution still triggers it** like the GPL, if you ship the software to customers.

### Source-Available

These licenses publish the code and restrict its use, usually against competitors offering it as a service:

- **Business Source License 1.1 (BUSL-1.1).** Non-production use is free; production use is allowed only as the licensor's "Additional Use Grant" says. Each version converts to an open-source "Change License" on its Change Date or "the fourth anniversary of the first publicly available distribution", whichever comes first, and the Change License must be GPL-2.0-or-later or compatible with it.
- **Server Side Public License (SSPL-1.0).** Offering the software as a service requires releasing the source of the whole service stack. The OSI calls it "fauxpen source", and it was withdrawn from OSI review once it was clear it wouldn't be approved.
- **Elastic License 2.0.** Its first limitation: "You may not provide the software to third parties as a hosted or managed service", where the service gives access to a substantial set of the software's features. It also forbids circumventing license keys.

For most companies using these products internally, the restrictions never bite. For a company whose product is a hosted platform, they may bite exactly there, so they go to review every time (below).

## Relicensing Is a Property of Versions

Licenses change, and the change applies to new versions only: the version you already have keeps the license it shipped with. Recent changes, from the vendors' own announcements:

- **HashiCorp** moved "all future releases" of its products from MPL-2.0 to BUSL-1.1 on August 10, 2023, restricting competitive offerings. The Linux Foundation announced OpenTofu, "an open source alternative to Terraform", on September 20, 2023.
- **Redis** moved to source-available licensing, including the SSPL, in March 2024. The Linux Foundation announced Valkey on March 28, 2024, continuing development from Redis 7.2.4 under the BSD 3-clause license. On May 1, 2025, Redis added the OSI-approved AGPL as an option, starting with Redis 8.
- **Elastic** moved Elasticsearch to SSPL and the Elastic License in 2021, and announced on August 29, 2024 that it was adding the AGPL as a third option.

What engineering takes from this:

- **Pin and scan versions, not package names.** The scanner must report the license of the exact version in the lockfile, and an upgrade across a relicensing is a license change that goes to review, even when the semver bump is a minor.
- **Know which dependencies a single company controls.** Projects owned by one company with a contributor agreement can relicense; projects with many copyright holders and no CLA effectively can't. That's a risk signal like a single maintainer.
- **Forks are an exit, not a plan.** OpenTofu and Valkey exist because foundations and large vendors backed them; most relicensed projects don't get one.

## SPDX Identifiers and Expressions

License names in prose are ambiguous ("BSD", "GPL"). **SPDX** fixes that: a standard list of identifiers (`MIT`, `Apache-2.0`, `GPL-2.0-only`, `GPL-2.0-or-later`, `LGPL-3.0-only`) and an expression syntax, published as ISO/IEC 5962:2021. The expression rules:

- `OR` is a choice: `MIT OR Apache-2.0` lets you take either; it's the license the Rust API guidelines recommend in `Cargo.toml`.
- `AND` is a conjunction: a package with files under two licenses is `MIT AND BSD-3-Clause`, and you comply with both.
- `WITH` attaches an exception: `GPL-2.0-or-later WITH Bison-exception-2.2`.
- `LicenseRef-` names a license not on the list, such as a vendor's own.
- Precedence runs `+`, `WITH`, `AND`, `OR`, so `LGPL-2.1-only OR BSD-3-Clause AND MIT` means the AND binds first; write the parentheses anyway.

Use SPDX everywhere a license is recorded: package manifests (`"license": "Apache-2.0"`), per-file headers in your own code (`// SPDX-License-Identifier: Apache-2.0`), SBOMs and policy files. A policy keyed on identifiers can be enforced by a machine; one keyed on names needs a person reading text.

## Scanning in CI

License compliance has the same shape as vulnerability management: an inventory of every component in every build, checked against a policy, with exceptions recorded.

- **The inventory is the SBOM.** The same per-build SBOM that answers "are we affected?" for a CVE carries each component's license; CycloneDX (published as Ecma standard ECMA-424) and SPDX both record it. Generate it from the built artifact (container image, app bundle), not just the manifest, so vendored code and OS packages show up.
- **Check pull requests.** A license problem is cheapest the moment a dependency is added. GitHub's dependency review action fails a pull request that introduces a dependency whose license isn't on an allow list of "SPDX-compliant identifier(s)":

```yaml
# .github/workflows/dependency-review.yml
name: Dependency review
on: pull_request
permissions:
  contents: read
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/dependency-review-action@v5
        with:
          allow-licenses: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, MPL-2.0, Unicode-3.0
```

  Prefer the allow list: the action's `deny-licenses` option is deprecated "for possible removal in the next major release", and an allow list fails closed on a license nobody has seen before.
- **Scan the whole tree on a schedule,** because a transitive dependency's new version can change license without a direct change in your manifest.
- **Detect, then verify.** Scanners read declared licenses and match license text; they miss code copied into files, misread custom licenses, and report "unknown" for packages with none. Unknowns are findings, not noise: code with no license grants no rights at all.

## An Allow, Review, Deny Policy

A written policy turns most decisions into lookups and sends the rest to the right person. Mine has three lists, decided per way of shipping:

| | SaaS backend | Shipped to customers (apps, on-prem, devices) |
| --- | --- | --- |
| **Allow** | MIT, BSD, ISC, Apache-2.0, Zlib, Unicode, MPL-2.0, LGPL, GPL (unmodified tools, separate processes) | MIT, BSD, ISC, Apache-2.0, Zlib, Unicode |
| **Review** | GPL linked into the service, BUSL, Elastic-2.0, any `LicenseRef-`, no license | MPL-2.0, LGPL (check linking), any `LicenseRef-`, no license |
| **Deny** | AGPL in the service's own code, SSPL | GPL and AGPL linked into the product, SSPL, BUSL and Elastic-2.0 without a commercial license |

- **Allow** merges without a human.
- **Review** goes to a named owner (an engineering lead with legal on call), who decides and records the decision as an exception with the package, version range, use and reason. Exceptions expire, like [vulnerability exceptions](/docs/security/vulnerability-management#exceptions), so they're reread when the use changes.
- **Deny** fails the build. A denied license can still be used with a commercial license from the vendor, recorded the same way.

The columns differ because the triggers differ: a GPL tool in a SaaS backend is never distributed, while the same code in an on-premises installer is. A product that's both (a cloud service with a self-hosted edition) uses the stricter column for everything that ships. ISO/IEC 5230, the OpenChain standard, "defines the key requirements of a quality open source license compliance program" if you need a formal frame for this; most teams need the table, an owner and the CI check.

### What Counts as Shipping

The trigger question, by deployment:

- **SaaS backend.** Not distributed. Permissive and copyleft obligations are dormant; the AGPL and source-available licenses are the ones to check.
- **Web frontend.** JavaScript, CSS and fonts sent to the browser are copies delivered to users, so I treat them as distribution: permissive notices go in the bundle or a linked notices page, and copyleft libraries in the bundle get the shipped column.
- **Mobile apps.** Distributed ([Mobile Apps](/docs/frontend/mobile-apps)), through stores whose terms add their own restrictions. The FSF has argued that App Store terms conflict with the GPL's ban on "further restrictions on the recipients' exercise of the rights granted herein", so GPL code in an app store build is a review item at minimum.
- **On-premises and self-hosted software.** Distributed, in full: every obligation applies, including source offers for copyleft components.
- **Firmware and devices.** Distributed, with extra GPLv3 terms: for a "User Product" (a consumer product, or something designed for a dwelling), the source must come with "Installation Information", the keys and procedures needed to install a modified version. A locked bootloader and GPLv3 code don't mix.
- **Internal tools.** Not distributed outside the company; record them anyway, because internal tools have a way of becoming products.

## Attribution and NOTICE Files

Nearly every license, permissive ones included, requires the copyright notice and license text to travel with copies. For anything distributed:

- **Generate a third-party notices file** from the SBOM at build time: each component, version, license identifier, copyright lines and full license text, with Apache-2.0 `NOTICE` contents included as section 4(d) requires.
- **Ship it where users can find it:** an "Open-source licenses" screen in the app's settings, a `THIRD_PARTY_NOTICES` file in the installer and container image, a notices page linked from the web app's footer.
- **Fail the build on a component with no license text found,** rather than shipping an incomplete file.
- **Offer source where copyleft requires it,** as the license specifies (with the binary, or a written offer), from an archive of the exact versions shipped. That archive is easiest to produce at build time and nearly impossible to reconstruct three years later.

## Contributing Upstream

Fixing a bug in a dependency upstream is cheaper than carrying a patch forever, and it's the default. Two things need a policy:

- **Permission to contribute.** Employees' code usually belongs to the employer, so engineers need a standing approval to contribute to open-source projects on company time, with a short list of what needs review (new projects, anything touching security, anything the company competes with).
- **Contributor agreements.** Projects ask for one of two things. A **Contributor License Agreement (CLA)** is a signed agreement granting the project rights to your contribution; the Apache Software Foundation's ICLA exists to "clearly define the terms under which intellectual property has been contributed", and contributors "retain full rights to use their original contributions for any other purpose". Corporate CLAs need someone authorized to sign for the company, so route them to legal once per project. The **Developer Certificate of Origin (DCO)** is lighter: a `Signed-off-by:` line on each commit (`git commit -s`), certifying, in the DCO 1.1's words, that "The contribution was created in whole or in part by me and I have the right to submit it under the open source license". The Linux kernel uses it and requires "a known identity".

A CLA that assigns copyright or grants broad relicensing rights is what lets a company relicense a project later, which is worth knowing both when you sign one and when you choose what to depend on.

## Publishing Your Own Code

A repository without a license isn't open source. As choosealicense.com puts it, without one "the work is under exclusive copyright by default" and "nobody else can copy, distribute, or modify your work". Publishing code means choosing:

- **Apache-2.0** is my default for libraries and tools a company publishes: permissive, with the explicit patent grant and termination.
- **MIT** for small libraries where brevity matters and patents don't.
- **MPL-2.0** when you want changes to your files shared back but don't want to restrict how others combine them.
- **AGPL-3.0** for a server product where you want hosted forks to share their changes; know that many companies' policies deny it, which limits adoption.
- **Source-available** only as a deliberate business decision, with the understanding that it isn't open source and that some users and distributions will treat it accordingly.

Then: a `LICENSE` file at the root, SPDX headers on source files, the identifier in package manifests, a contributing guide stating CLA or DCO, and a check that nothing confidential or third-party-licensed is in the history before the repository goes public.

## Diligence in Deals

Acquirers and large customers ask about licenses because problems are common. Black Duck's 2026 Open Source Security and Risk Analysis, based on 947 codebases audited between November 2024 and October 2025 (for M&A transactions, regulatory compliance and internal risk assessments), found license conflicts in 68% of codebases, 8% of components with no detected license, and 11% with custom or modified licenses that "require individual legal review".

The questions arrive as a list. Being able to answer them from the build is the point of everything above:

- **An inventory** of open-source components per product and version, with licenses: the SBOM.
- **Copyleft in distributed products,** with how each component is combined, and the source offers made.
- **AGPL and source-available components** in hosted products, with whether any are modified.
- **The policy** and its exception log, showing decisions were made, not stumbled into.
- **Contribution and publication records:** what the company has open-sourced, under which license, and which CLAs it has signed.
- **Code with unclear provenance:** copied snippets, vendored code with headers stripped, and, increasingly, AI-generated code, which buyers ask about by name.

Enterprise customers buying on-premises or embedded software ask a shorter version of the same list, often as a contract clause requiring a notices file and an SBOM with each release.

## When to Involve Counsel

Engineering can run the allow list alone. Bring in a lawyer for:

- **Any deny-list or unknown license** in something you distribute, before it ships.
- **Linking questions** with GPL or LGPL code (static linking, plugins, combined processes).
- **Modifying AGPL software** you run as a service, or embedding AGPL code at all.
- **Source-available licenses** in a hosted product, especially one that could be read as competing with the licensor.
- **Signing a corporate CLA,** publishing a company project, or relicensing your own code.
- **A license claim or compliance request** from a copyright holder: answer through counsel, and fix the problem first.
- **Acquisitions and enterprise contracts** with license representations and warranties.

## References

**Specifications**

- [OSI: The Open Source Definition](https://opensource.org/osd), the criteria a license must meet, including no discrimination against fields of endeavor
- [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), the patent grant and its termination on litigation, and NOTICE file requirements
- [GNU AGPL-3.0 (SPDX text)](https://spdx.org/licenses/AGPL-3.0-only.html), section 13 on remote network interaction and section 6 on User Products and Installation Information
- [GNU LGPL-3.0 (SPDX text)](https://spdx.org/licenses/LGPL-3.0-only.html), section 4(d) on relinking combined works
- [Business Source License 1.1](https://mariadb.com/bsl11/), the Additional Use Grant, Change Date and Change License
- [Elastic License 2.0](https://www.elastic.co/licensing/elastic-license), the hosted-service and license-key limitations
- [SPDX License Expressions](https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/), AND, OR, WITH, LicenseRef- and operator precedence
- [Developer Certificate of Origin 1.1](https://developercertificate.org/), the certification behind a Signed-off-by line

**Reference**

- [GNU: Frequently Asked Questions about the GPL](https://www.gnu.org/licenses/gpl-faq.html), private modification without distribution and mere aggregation
- [Mozilla: MPL 2.0 FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/), file-level copyleft and combining MPL code with proprietary code
- [Apache: GPL compatibility](https://www.apache.org/licenses/GPL-compatibility.html), Apache-2.0 into GPLv3 and the FSF's view on GPLv2
- [Apache: Contributor License Agreements](https://www.apache.org/licenses/contributor-agreements.html), what the ICLA is for and what contributors keep
- [Rust API Guidelines: Necessities](https://rust-lang.github.io/api-guidelines/necessities.html), dual licensing as `MIT OR Apache-2.0`
- [Linux kernel: Submitting patches](https://docs.kernel.org/process/submitting-patches.html), the DCO sign-off and `git commit -s`
- [SPDX: Overview](https://spdx.dev/about/overview/), the specification as ISO/IEC 5962:2021 and the SPDX License List
- [CycloneDX: Specification overview](https://cyclonedx.org/specification/overview/), the SBOM standard published as ECMA-424
- [GitHub: dependency-review-action](https://github.com/actions/dependency-review-action), allow-licenses, the deprecated deny-licenses and their mutual exclusion
- [OpenChain: License compliance (ISO/IEC 5230)](https://openchainproject.org/license-compliance), the requirements of a compliance program
- [choosealicense.com: No license](https://choosealicense.com/no-permission/), code without a license is under exclusive copyright

**In practice**

- [HashiCorp adopts the Business Source License](https://www.hashicorp.com/blog/hashicorp-adopts-business-source-license), the August 2023 change from MPL-2.0 to BUSL-1.1
- [Linux Foundation: Announcing OpenTofu](https://www.linuxfoundation.org/press/announcing-opentofu), the open-source alternative to Terraform
- [Redis is now available under the AGPLv3](https://redis.io/blog/agplv3/), the March 2024 change to SSPL and the May 2025 addition of AGPL with Redis 8
- [Linux Foundation: Valkey](https://www.linuxfoundation.org/press/linux-foundation-launches-open-source-valkey-community), continuing Redis 7.2.4 under BSD 3-clause
- [Elastic: Elasticsearch is open source again](https://www.elastic.co/blog/elasticsearch-is-open-source-again), adding AGPL next to ELv2 and SSPL in 2024
- [OSI: The SSPL is not an open source license](https://opensource.org/blog/the-sspl-is-not-an-open-source-license), why SSPL fails the definition
- [FSF: More about the App Store GPL enforcement](https://www.fsf.org/blogs/licensing/more-about-the-app-store-gpl-enforcement), App Store usage rules as further restrictions under the GPL
- [Black Duck: Open Source Security and Risk Analysis](https://www.blackduck.com/resources/analyst-reports/open-source-security-risk-analysis.html), license conflicts and unlicensed components in audited codebases
