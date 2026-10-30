+++
title = "Design Systems & Handoff"
description = "Components, variables and W3C design tokens, library publishing and versions, Dev Mode, Code Connect and MCP, and accessibility annotations from design to code."
category = "Workplace & Collaboration Industry"
order = 2039
part = "Design and Visual Collaboration"
tags = ["design-systems", "design-tokens", "handoff", "dev-mode", "accessibility"]
+++

A design system is a company's shared vocabulary for interfaces: the components (buttons, inputs, dialogs), the decisions underneath them (colors, type, spacing, radii, motion) and the rules for combining them, kept in two places at once. One copy lives in the design tool as a published library; the other lives in code as a component package and a set of generated token files. Handoff is the moment a design crosses from one copy to the other: an engineer opens a frame, reads what it is made of, and builds it.

The hard part is that the two copies drift. A designer renames a color, a developer hard-codes a hex value, a component gains a variant in Figma that doesn't exist in React, and within a quarter the library and the code describe two different products. Every feature in this chapter is an answer to drift: tokens in a standard format so one source can generate both sides; libraries with explicit publishing so changes arrive as reviewable releases; Dev Mode and code connections so an engineer sees the real component, not a picture of it; annotations so intent that isn't visible (focus order, headings, what a screen reader says) survives the crossing. The general case for tokens (semantic names, themes as redefinitions, contrast per pair) is the playbook's [Design Tokens & Theming](/docs/frontend/design-tokens); this chapter is the industry and the tools. The design tools themselves are [Design Tools](/books/workplace-and-collaboration/design-tools).

## How the Platforms Do It

As of October 2026, from vendor documentation:

| Tool | Components | Tokens | Library publishing | Handoff to code |
| --- | --- | --- | --- | --- |
| **Figma** | Components and variants with five property types (boolean, instance swap, text, variant, slot) | Variables: color, number, string, boolean, timing, easing; modes per collection by plan; import and export as W3C-format JSON | Explicit publish with a description; consumers accept updates; analytics on Organization and Enterprise | Dev Mode, annotations, Code Connect, MCP server, Variables REST API on Enterprise |
| **Sketch** | Symbols | Color variables, text and layer styles | Libraries with update notifications | Web app inspect; color tokens as CSS or JSON in Style Dictionary format |
| **Penpot** | Components | Native tokens (since 2.7) with sets and themes, exported in the W3C draft format | Shared libraries, which can also be the tokens source | Inspect tab with SVG, CSS and HTML |
| **Tokens Studio** | (Figma plugin) | Tokens in JSON synced with Git providers; W3C format option | Through the Git provider | Tokens in the repository |
| **Style Dictionary** | (Build tool) | W3C format since v4; 2025.10 support in progress in v5 | Not applicable | Generates platform files (CSS, iOS, Android) |
| **Storybook and Chromatic** | Code components documented from their stories | Not applicable | Not applicable | Autodocs, visual tests and UI review on pull requests |
| **Supernova** | Documentation platform | Token pipelines | Version releases trigger exports | Pull requests to Git providers from exporter pipelines |

The pattern across the table: **the design tool owns intent, the repository owns truth, and a pipeline connects them.** Every serious setup ends with tokens and component mappings in Git, reviewed in pull requests, with the design tool either the source (export) or a consumer (import) of the same files.

## Components, Variants and Properties

A component is a reusable master; instances are its uses. What makes a component library usable at scale is how much an instance can vary without detaching from its master, because a detached instance no longer receives updates. Figma's answer is **component properties**, in five types: boolean (show or hide a layer), instance swap (replace a nested component, with a list of preferred swaps), text, variant (choose among a component set's variants, such as size or state) and slot (offered in early access at Figma's Schema 2025 event in October 2025, in open beta from March 2026 and generally available by June 10, 2026, when the Plugin API added a `SLOT` property type for the GA launch). Variant properties apply only to component sets.

Figma's 2025 post on its "two parameter architectures" explains why this matters internally: component properties (2022, scoped to a component) and variables (2023, global) were built separately, then unified into one type space and one binding model in which "each layer property should be bound to at most one parameter", with shared usage tracking, property-level invalidation and resolution. The lesson for anyone building a design tool is that **parameters are one system**: a fill bound to a variable, a text layer bound to a property and a visibility toggle are all bindings from a layer property to a named value, and the engine should treat them uniformly.

Sketch's equivalent is the symbol, distributed in libraries along with text styles, color variables, layer styles and frame templates. Penpot has components too. The vocabulary differs; the model (master, instances, overrides, update propagation) does not.

## Variables and Tokens

**Figma variables** are the design-tool side of tokens. As of October 2026, a variable is one of six types (color, number, string, boolean, timing, easing), a collection can hold up to 5,000 of them, and a variable can alias another of the same type. **Modes** give one variable several values for contexts such as light and dark, language or device; Professional allows up to 10 modes per collection, Organization up to 20, and Enterprise unlimited modes with extended collections. Variables can be **scoped** to the properties they may apply to (gap, padding, radius, fills, stroke, text), which keeps a spacing token out of a color picker, and given a **code syntax** per platform (web, Android, iOS) so Dev Mode shows the token's code name instead of its value. Variables can also be hidden from publishing.

**The W3C Design Tokens Community Group format** is the interchange standard. Its first stable version, 2025.10, was announced on October 28, 2025, as "a production-ready, vendor-neutral format", with Style Dictionary, Tokens Studio and Terrazzo as reference implementations and Penpot, Figma, Sketch, Framer, Knapsack, Supernova and zeroheight named as supporting or implementing it. The Format Module's essentials:

- **A token is an object with `$value`.** `$type` is optional and inherits from the nearest parent group; tools "MUST NOT attempt to guess the type". `$description` is plain text; `$deprecated` (true, false or an explanation string) marks tokens and groups on the way out.
- **Groups are objects without `$value`,** nesting tokens by name (`color.text.primary`).
- **Aliases** use curly braces (`{color.blue.500}`), which can only target complete tokens; JSON Pointer `$ref` must also be supported and can reach into a composite value. Circular references are errors.
- **Types:** color, dimension, fontFamily, fontWeight, duration, cubicBezier and number, plus composites: strokeStyle, border, transition, shadow, gradient and typography.
- **Extensions** go under `$extensions` with reverse-domain keys, and tools must preserve extension data they don't understand.
- **Files** should use the media type `application/design-tokens+json` and the extension `.tokens` or `.tokens.json`.

A companion **Resolver Module** 2025.10 handles theming: one set of token files describes several contexts (light and dark, brands), with **sets** (later ones override earlier), **modifiers** with named contexts and a default, and an ordered resolution, so a build asks for `{ "theme": "dark" }` and gets a resolved token set.

Support is real but uneven, and the details matter:

- **Figma** announced native variable import and export following the format at Schema 2025, available from November 2025, replacing its earlier open-source plugin. Its help center says imported tokens "must be in a JSON file and follow the Design Tokens Community Group (DTCG) format", with each imported file becoming a mode (variables are created only for tokens present in every file), nested groups normalized to slash names, and Figma-specific data (booleans, cross-collection aliases) carried in `$extensions` under `com.figma` keys. Its import accepts only some units (dimensions in px, durations in seconds) and accepts `string`, which the format doesn't define. Export runs the other way per mode: export one mode, or all of a collection's modes, as JSON. A round trip is lossless only within those limits, which is one more reason the repository, not the design file, should hold the canonical tokens.
- **Style Dictionary** has had "first-class support for the DTCG format" since version 4, and its documentation says full 2025.10 support is a work in progress in version 5, which fixes the reference syntax to the format's braces.
- **Tokens Studio** syncs tokens between Figma and GitHub, GitLab, Bitbucket, Azure DevOps and other storage, can push to and pull from Figma variables, and offers a W3C format setting that writes `$value`, `$type` and `$description`.
- **Penpot** shipped initial native token support in 2.7 (May 12, 2025) and now has sets and multidimensional themes, and its documentation says tokens export "without conversion" per the W3C draft format.
- **Sketch** exports color tokens as CSS or JSON and layer and text styles as JSON, in "the Amazon Style Dictionary format", from its web app.

My default for a new system: tokens in the W3C format in the repository, three tiers deep (raw palette, semantic names, component tokens), generated into each platform by Style Dictionary or similar, with the design tool importing the same files. The design tool can be the editing surface; it should not be the only copy.

## Libraries and Publishing

A library is a file whose components, styles and variables are published for other files to use, and publishing is a deliberate act. In Figma, anyone with edit access to a library file on Professional and above can publish; the publish dialog asks for "a description of the library's purpose, or a summary of any decisions or changes", which then appears in version history and to people reviewing updates. Assets can be hidden from publishing (work in progress, internal building blocks). Changes to a component in a library file affect only that file until they are published.

**Consuming files decide when to update.** A badge signals that a library has updates; anyone with edit access to the consuming file reviews them and accepts all, accepts per asset, or updates a single instance. There is no automatic update. Sketch works the same way: documents using a library get an update notification and confirm it. This is the most important property of a design library and the one most often missed by teams that build their own: **a library update is a pull, not a push.** A product team mid-release can defer a breaking button change; a design system team can see who has not taken an update yet.

**Admins and plans gate access.** Figma admins set default libraries for a team or the organization (enabled in every file automatically), and on Organization and Enterprise plans control who can use each library. **Library analytics** (Organization and Enterprise, plus Education and Government) count inserts, detaches and usage across instances, teams and files, refreshed daily with a year of history, with style and variable usage tracked since October 10, 2024; the analytics API is Enterprise-only. The **detach** count is the design system team's best single health signal: every detach is a place where the library failed someone.

**Branching protects the library.** On plans with branching, changes to a library happen on a branch, go through review and merge to main, and publishing is allowed only from the main file ([Design Tools](/books/workplace-and-collaboration/design-tools#files-versions-and-branches)).

## Versioning

Design tools version libraries as a timeline of publishes with descriptions, not as numbered releases; Figma's publishes land in version history with their descriptions and no version numbers. The code side versions packages, usually with Semantic Versioning: a major version for "incompatible API changes", a minor for functionality added "in a backward compatible manner", a patch for "backward compatible bug fixes", against a declared public API, and the SemVer FAQ recommends at least one minor release containing a deprecation before the removal ships in a major.

Two rules close the gap between the timelines:

- **Treat names as the public API.** A token's name and a component's properties are what consumers bind to; renaming either is a breaking change on both sides, while changing a value is not. The format's `$deprecated` field and Figma's hidden-from-publishing setting are how a name retires gracefully.
- **Release once, in both places.** A design system release is a library publish and a package version that describe the same change, linked by the publish description and the changelog. Supernova's delivery pipelines show the automation pattern: triggers on source updates, version releases or head changes produce pull requests on a `supernova/[exporter-name]` branch in GitHub, GitLab, Bitbucket or Azure, and never commit directly to production branches.

## Dev Mode and Handoff

Handoff used to mean exported red-line specs. Now it means the engineer opens the same file in an inspection mode with the right seat. Figma's **Dev Mode** (Professional and above) shows code snippets or a list of properties for any layer, the variables and styles applied, measurements, exports and annotations; it marks frames, sections and components **ready for dev**, with a **completed** status on Organization and Enterprise; it can compare a frame's changes since it was marked ready, show a focused view, link out to GitHub, Jira or Storybook, and let the engineer explore a component's properties in a playground. A VS Code extension brings it into the editor. Dev seats get "full access to Dev Mode", while Collab seats get "only basic inspection", which makes handoff a line item in the seat plan ([Design Tools](/books/workplace-and-collaboration/design-tools#seats-admins-and-who-decides)).

**Annotations** carry what the canvas can't show. In Figma, adding annotations and measurements takes a Full seat and edit access, and anyone with view access sees them; annotations come in preset categories (development, interaction, accessibility, content) and annotated properties stay current as the design changes.

**Code Connect** links a design component to the real code component so Dev Mode shows the import and usage from the codebase instead of generated CSS. Its recommended template files are framework-agnostic, alongside older framework-specific integrations for React and React Native, HTML (Web Components, Angular, Vue), SwiftUI and Jetpack Compose; mappings are authored either in a CLI with template files kept in the repository, or in an in-app UI connected to GitHub, and CLI-created mappings can only be edited in the CLI. It is available on Dev or Full seats on Professional, Organization and Enterprise, with Professional limited to one active library and one active framework (connections for a replaced framework are kept but deactivated, and the MCP server stops returning them).

**The MCP server** brings the same context to AI coding tools. Figma announced it in beta on June 4, 2025 with tools for code, images and variable definitions, added remote access and in-app Code Connect mapping in beta on September 23, 2025, and called it generally available at Schema 2025 on October 28, 2025. As of October 2026 its help center lists the server on every plan from Starter up, recommends the remote server (the desktop server is for specific organization needs and needs a Dev or Full seat on a paid plan), requires a Full seat to write outside one's drafts, and says writing to the canvas is free during its beta and will become a usage-based paid feature. When a coding agent asks the design file what a button is, the right answer is the Code Connect mapping and the token names, not pixels; Code Connect is what makes the MCP answer useful. Agent access to workplace content in general is the [AI Agents, Connectors & MCP](/books/workplace-and-collaboration/ai-agents-and-mcp) chapter.

**The Variables REST API** reads and writes variables programmatically for token pipelines, and it is Enterprise-only: reading requires the `file_variables:read` scope, writing requires `file_variables:write` and "a Full seat in an Enterprise org", and guests can't use it. A team on a lower plan syncs tokens through import and export files or a plugin such as Tokens Studio instead. The pattern recurs across the industry: automation of the design system is sold to the customers large enough to need it.

**On the code side,** Storybook's Autodocs builds a documentation page per component from its stories, inferring args and argTypes into an interactive controls table. Chromatic captures each story in cloud browsers and pixel-diffs it against the baseline; its TurboSnap snapshots only stories affected by a change (cutting costs "by up to 80%", by Chromatic's account), it runs axe accessibility checks per component, and its UI Review asks a reviewer to approve the visual changeset between a pull request's head and base. Visual review on the pull request is where the design system team finally sees drift before it ships.

## Accessibility Annotations

Most accessibility defects are decided in design and discovered in code. GitHub's open-source Annotation Toolkit, published November 18, 2025, reports that 48% of the issues in GitHub's accessibility audits "could have been prevented" had design intent been documented. The toolkit covers landmarks and heading levels, focus order and reading order, buttons versus links, forms, media and alt text, lists and tables, live regions and feedback, and page title and language, as a Figma Community file and a repository. CVS Health publishes web and iOS annotation kits for Figma under CC BY 4.0. Figma's own annotations include an accessibility category.

The criteria the annotations serve are WCAG 2.2's, a W3C Recommendation as of December 12, 2024, and several are decided in the design file:

- **Contrast (1.4.3 and 1.4.11, AA):** 4.5:1 for normal text, 3:1 for large text and for UI components and graphics. With tokens, contrast is a property of a foreground and background pair in each mode, so check the pairs, not the screens ([Check Contrast in Every Theme](/docs/frontend/design-tokens#check-contrast-in-every-theme)).
- **Target size (2.5.8, AA):** at least 24 by 24 CSS pixels, with exceptions for spacing, equivalents, inline targets, user-agent controls and essential cases. A component library that fixes minimum sizes in its tokens passes this everywhere at once.
- **Focus (2.4.3 Focus Order, A; 2.4.7 Focus Visible, AA; 2.4.11 Focus Not Obscured, AA):** the order and visibility of focus are design decisions; 2.4.13 Focus Appearance (AAA) adds a 2 CSS pixel perimeter and 3:1 change in contrast.
- **Structure (1.3.1 Info and Relationships, A):** headings, landmarks, lists and tables must be programmatically determinable, which is exactly what heading and landmark annotations tell an engineer.

My rule: accessibility annotations are part of ready for dev. A frame without focus order, heading levels and landmark annotations isn't ready, and the component library should carry the defaults (focus styles, target sizes, roles) so most screens need annotations only where they differ. The baseline and testing are the playbook's [Accessibility](/docs/frontend/accessibility#the-baseline-wcag-2-2-aa); procurement documents (VPATs, the European Accessibility Act) are the [Accessibility & Localization](/books/workplace-and-collaboration/accessibility-and-localization) chapter.

## Who Decides

The customer's people make every decision here; the vendor supplies switches. A central design system team owns the library files, publishes releases and watches detach rates. The customer's admin sets default libraries, restricts who can use which library, assigns Dev and Full seats (and therefore who can annotate, connect code, or call the Variables API), and decides whether AI tools may read files through the MCP server. Product teams decide when to accept library updates. Engineering owns the token files and the component packages in the repository, and the pipeline's pull requests are where design and engineering agree. A design tool built for this market should make each of those decisions an explicit, logged setting.

## How to Build It

The library is an `items` row of kind `design` with a `design_files` row ([Design Tools](/books/workplace-and-collaboration/design-tools#how-to-build-it)); what it publishes and who consumes which release are new tables. Tokens are stored in the W3C format's shape so import and export are lossless.

```sql
-- A design file published as a library.
CREATE TABLE design_libraries (
  item_id        UUID PRIMARY KEY REFERENCES design_files (item_id),
  workspace_id   UUID NOT NULL REFERENCES workspaces (id),
  is_default     BOOLEAN NOT NULL DEFAULT false,   -- enabled in every file by an admin
  default_scope_group_id UUID REFERENCES groups (id), -- NULL = whole workspace
  owner_group_id UUID REFERENCES groups (id)          -- the design system team
);
-- Who may use a library is a grants row (resource_type 'design_library').

-- Each publish is an immutable release, frozen at a checkpoint.
CREATE TABLE library_releases (
  id             UUID PRIMARY KEY,
  library_item_id UUID NOT NULL REFERENCES design_libraries (item_id),
  version_id     UUID NOT NULL REFERENCES item_versions (id), -- checkpoint_kind 'publish'
  description    TEXT NOT NULL,                  -- required, shown to consumers
  package_version TEXT,                          -- the code release it pairs with, e.g. 4.2.0
  published_by   UUID NOT NULL REFERENCES members (id),
  published_at   TIMESTAMPTZ NOT NULL
);

-- The assets a release contains, keyed by a stable id that survives renames.
CREATE TABLE library_assets (
  release_id     UUID NOT NULL REFERENCES library_releases (id),
  asset_key      TEXT NOT NULL,                  -- stable across releases
  kind           TEXT NOT NULL CHECK (kind IN ('component', 'component_set', 'style', 'variable')),
  name           TEXT NOT NULL,
  change         TEXT NOT NULL CHECK (change IN ('added', 'changed', 'renamed', 'deprecated', 'removed', 'unchanged')),
  PRIMARY KEY (release_id, asset_key)
);

-- Consumers pin a release and pull updates; nothing auto-updates.
CREATE TABLE library_subscriptions (
  consumer_item_id UUID NOT NULL REFERENCES design_files (item_id),
  library_item_id  UUID NOT NULL REFERENCES design_libraries (item_id),
  release_id       UUID NOT NULL REFERENCES library_releases (id),
  accepted_by      UUID REFERENCES members (id),
  accepted_at      TIMESTAMPTZ,
  PRIMARY KEY (consumer_item_id, library_item_id)
);

-- Usage events for analytics: inserts, detaches, instance counts by day.
CREATE TABLE library_usage_daily (
  library_item_id UUID NOT NULL REFERENCES design_libraries (item_id),
  asset_key      TEXT NOT NULL,
  day            DATE NOT NULL,
  inserts        INT NOT NULL DEFAULT 0,
  detaches       INT NOT NULL DEFAULT 0,
  instances      INT NOT NULL DEFAULT 0,
  consuming_files INT NOT NULL DEFAULT 0,
  PRIMARY KEY (library_item_id, asset_key, day)
);

-- Tokens in the W3C Design Tokens Format shape.
CREATE TABLE design_tokens (
  id             UUID PRIMARY KEY,
  library_item_id UUID NOT NULL REFERENCES design_libraries (item_id),
  collection     TEXT NOT NULL,                  -- Figma collection or token set
  path           TEXT NOT NULL,                  -- dot path, e.g. color.text.primary
  type           TEXT NOT NULL CHECK (type IN ('color', 'dimension', 'fontFamily', 'fontWeight',
                   'duration', 'cubicBezier', 'number', 'strokeStyle', 'border', 'transition',
                   'shadow', 'gradient', 'typography', 'string', 'boolean')),
  description    TEXT,
  scopes         TEXT[] NOT NULL DEFAULT '{}',   -- where it may be applied
  code_syntax    JSONB NOT NULL DEFAULT '{}',    -- {"web": "--color-text-primary", "ios": ...}
  deprecated     TEXT,                           -- NULL, or the reason
  hidden_from_publish BOOLEAN NOT NULL DEFAULT false,
  extensions     JSONB NOT NULL DEFAULT '{}',    -- preserved verbatim on round trips
  UNIQUE (library_item_id, collection, path)
);

-- One value per mode; an alias points at another token instead of a literal.
CREATE TABLE design_token_values (
  token_id       UUID NOT NULL REFERENCES design_tokens (id),
  mode           TEXT NOT NULL,                  -- light, dark, compact, brand-b
  value          JSONB,                          -- literal per the token's type
  alias_token_id UUID REFERENCES design_tokens (id),
  PRIMARY KEY (token_id, mode),
  CHECK ((value IS NULL) <> (alias_token_id IS NULL))
);

-- Design component to code component.
CREATE TABLE code_connections (
  library_item_id UUID NOT NULL REFERENCES design_libraries (item_id),
  asset_key      TEXT NOT NULL,
  framework      TEXT NOT NULL,                  -- react, swiftui, compose, web-components
  source         TEXT NOT NULL CHECK (source IN ('cli', 'ui')),  -- CLI mappings edit only via CLI
  repository_url TEXT,
  import_snippet TEXT NOT NULL,
  property_map   JSONB NOT NULL DEFAULT '{}',    -- design property to code prop
  PRIMARY KEY (library_item_id, asset_key, framework)
);

-- Dev status and annotations on frames and layers.
CREATE TABLE design_annotations (
  id             UUID PRIMARY KEY,
  item_id        UUID NOT NULL REFERENCES design_files (item_id),
  node_id        TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('development', 'interaction', 'accessibility', 'content')),
  a11y_kind      TEXT CHECK (a11y_kind IN ('heading', 'landmark', 'focus_order', 'reading_order',
                   'alt_text', 'role', 'live_region', 'target_size', 'other')),
  body           TEXT NOT NULL,
  pinned_properties TEXT[] NOT NULL DEFAULT '{}', -- properties shown live from the node
  author_id      UUID NOT NULL REFERENCES members (id),
  created_at     TIMESTAMPTZ NOT NULL,
  resolved_at    TIMESTAMPTZ
);

CREATE TABLE design_dev_status (
  item_id        UUID NOT NULL REFERENCES design_files (item_id),
  node_id        TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('ready_for_dev', 'completed')),
  version_id     UUID NOT NULL REFERENCES item_versions (id),  -- for "changes since ready"
  set_by         UUID NOT NULL REFERENCES members (id),
  set_at         TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (item_id, node_id)
);
```

The rules:

- **Releases are immutable** and point at a checkpoint; a consumer pins a release and updates by choice. Breaking changes are visible before acceptance because `library_assets.change` says what each asset did.
- **Stable asset keys survive renames,** so a renamed token is `renamed`, not `removed` plus `added`, and consumers' bindings keep working.
- **Aliases resolve at read time** with cycle detection, mode by mode; export writes `{path}` references and import refuses cycles, per the format.
- **Round trips preserve `$extensions`** verbatim, including data from other tools.
- **"Changes since ready for dev"** is a diff between the checkpoint in `design_dev_status.version_id` and now, scoped to the node.
- **Ready for dev can require annotations:** a workspace setting refuses the status on a frame without focus-order and heading annotations.
- **Token export writes a pull request,** never a direct commit, and pairs the library release with a package version.
- **Plan gates are checks against the subscription** (modes per collection, branching, analytics, Variables API), enforced on the server, with the limit named in the error.

## Auditing

- **Library releases** with publisher, description, assets changed and the paired package version.
- **Update acceptance and deferral** per consuming file, so a design system team can show who is on which release.
- **Library access changes** and default-library settings, with the admin who made them.
- **Token changes:** renames, deprecations, removals and value changes per mode, because a contrast regression is a value change in one mode.
- **Code connection edits** with source (CLI or UI) and repository.
- **API and MCP access:** which app or agent read or wrote variables or files, on whose token, with scopes ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **Dev status changes,** since "it was marked ready on this version" is often the question in a dispute about what was built.

## What This Means for the System You Build

- **Keep tokens in the W3C format in the repository,** generated to every platform, with the design tool importing the same files.
- **Make library updates a pull:** immutable releases, required descriptions, per-file acceptance, no auto-update.
- **Treat names as the public API:** stable keys, deprecation before removal, renames tracked as renames.
- **Measure detaches;** they are where the system is failing its users.
- **Map design components to code components** so handoff and AI agents get real imports, not generated CSS.
- **Pair every library publish with a package release** and ship token changes as pull requests.
- **Put accessibility intent in the file:** annotation kits, a11y annotations required for ready for dev, and defaults (focus, target size, roles) in the components.
- **Check contrast per token pair per mode,** in CI, not by eye.
- **Give admins the switches** (default libraries, library access, seats, AI access) and log every change.

## References

**Standards**
- [W3C Design Tokens Community Group: specification reaches first stable version](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/), October 28, 2025, reference implementations and supporting tools
- [Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/), `$value`, `$type` inheritance, aliases and `$ref`, types, `$extensions`, `$deprecated`, media type and file extensions
- [Design Tokens Resolver Module 2025.10](https://www.designtokens.org/TR/2025.10/resolver/), sets, modifiers, contexts and resolution order
- [Semantic Versioning 2.0.0](https://semver.org/), major, minor and patch rules, the public API, deprecation before removal
- [W3C: Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), Recommendation date and success criteria 1.3.1, 1.4.3, 1.4.11, 2.4.3, 2.4.7, 2.4.11 and 2.4.13
- [W3C: Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), 24 by 24 CSS pixels and its exceptions

**Vendor documentation**
- [Figma Help: Compare plans and features](https://help.figma.com/hc/en-us/articles/360040328273-Compare-Figma-plans-and-features), modes per collection by plan, branching, analytics, Dev Mode and Variables API availability
- [Figma Help: Guide to variables](https://help.figma.com/hc/en-us/articles/14506821864087), variable types, 5,000 per collection, aliasing, modes
- [Figma Help: Variable scoping and code syntax](https://help.figma.com/hc/en-us/articles/15145852043927), scopes, per-platform code syntax, hiding from publishing, same-type aliases
- [Figma Help: Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables), DTCG import, per-mode files, name normalization, supported units and types, `com.figma` extensions, per-mode JSON export
- [Figma Help: Component properties](https://help.figma.com/hc/en-us/articles/5579474826519), the five property types and variant scope
- [Figma Plugin API: Updates for 2026-06-10](https://developers.figma.com/docs/plugins/updates/2026/06/10/update/), slots GA and the `SLOT` property type
- [Figma Help: Publish a library](https://help.figma.com/hc/en-us/articles/360025508373-Publish-a-library), who can publish, publish descriptions, hiding assets
- [Figma Help: Review and accept library updates](https://help.figma.com/hc/en-us/articles/360039234193), update badge, accept all, per asset or per instance
- [Figma Help: Guide to libraries](https://help.figma.com/hc/en-us/articles/360041051154-Guide-to-files-in-Figma), default libraries and access control by plan
- [Figma Help: Library analytics](https://help.figma.com/hc/en-us/articles/360039238353-View-and-explore-library-analytics), plans, inserts, detaches, daily refresh, one year of history, October 10, 2024 tracking start, Enterprise-only API
- [Figma Help: Guide to branching](https://help.figma.com/hc/en-us/articles/360063144053), publishing only from main
- [Figma Help: Guide to Dev Mode](https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode), ready for dev, completed status, compare changes, links, playground, VS Code
- [Figma Help: Annotations and measurements](https://help.figma.com/hc/en-us/articles/20774752502935), seat and access requirements, categories, live properties
- [Figma Help: Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559), plans, remote versus desktop server, seat requirements, canvas writing pricing
- [Figma: Pricing](https://www.figma.com/pricing/), Dev and Collab seat access to Dev Mode
- [Figma Developers: Code Connect](https://developers.figma.com/docs/code-connect/), template files and framework integrations, CLI and UI, seats, Professional's one library and framework
- [Figma Developers: Variables REST API](https://developers.figma.com/docs/rest-api/variables/), Enterprise-only, scopes, Full seat for writes, no guests
- [Sketch: Libraries](https://www.sketch.com/docs/libraries/), library contents and update notifications
- [Sketch: Export design tokens](https://www.sketch.com/docs/developer-handoff/export/), CSS and JSON exports in Style Dictionary format
- [Penpot: Design tokens](https://help.penpot.app/user-guide/design-tokens/), sets, themes, types, import formats, export per the W3C draft, shared libraries as a tokens source
- [Penpot 2.7 release notes](https://penpot.app/release-notes/2-7-all-the-small-things), initial design token support, May 12, 2025
- [Style Dictionary: DTCG support](https://styledictionary.com/info/dtcg/), first-class support since v4, 2025.10 in progress
- [Style Dictionary: v5 migration](https://styledictionary.com/versions/v5/migration/), reference syntax and requirements
- [Tokens Studio documentation](https://docs.tokens.studio/), Git sync providers and Figma variables
- [Tokens Studio: Token format](https://docs.tokens.studio/manage-settings/token-format), the W3C format setting
- [Storybook: Autodocs](https://storybook.js.org/docs/writing-docs/autodocs), generated docs pages and controls
- [Chromatic documentation](https://www.chromatic.com/docs/), visual snapshots, TurboSnap savings, accessibility checks
- [Chromatic: UI Review](https://www.chromatic.com/docs/review/), changeset approval between head and base
- [Supernova: Delivery pipelines](https://developers.supernova.io/latest/using-exporters/using-delivery-pipelines-BlKUaNI9), triggers, pull requests, never committing to production branches
- [Primer: Annotation Toolkit](https://primer.style/accessibility/tools-and-resources/annotation-toolkit), what the toolkit annotates
- [CVS Health: Annotations](https://github.com/cvs-health/annotations), web and iOS annotation kits under CC BY 4.0

**Engineering write-ups**
- [Figma: A tale of two parameter architectures (2025)](https://www.figma.com/blog/a-tale-of-two-parameter-architectures/), unifying component properties and variables into one binding model
- [Figma: Schema 2025 design systems recap](https://www.figma.com/blog/schema-2025-design-systems-recap/), native DTCG import and export in November 2025 replacing a plugin, extended collections, slots in early access, MCP server general availability
- [Figma: Introducing the Figma MCP server (2025)](https://www.figma.com/blog/introducing-figma-mcp-server/), June 4, 2025 beta and its tools
- [Figma: Design context everywhere you build (2025)](https://www.figma.com/blog/design-context-everywhere-you-build/), remote MCP access and in-app Code Connect, September 23, 2025
- [GitHub: Level up design-to-code collaboration with the open-source Annotation Toolkit (2025)](https://github.blog/enterprise-software/collaboration/level-up-design-to-code-collaboration-with-githubs-open-source-annotation-toolkit/), November 18, 2025, the 48% figure
