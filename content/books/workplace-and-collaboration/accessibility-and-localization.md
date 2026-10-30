+++
title = "Accessibility & Localization"
description = "Accessibility and language in workplace software: Section 508, EN 301 549, the EAA, ADA Title II, ACRs, editors and canvases, captions, right-to-left."
category = "Workplace & Collaboration Industry"
order = 2066
part = "Running the Platform"
tags = ["accessibility", "wcag", "procurement", "captions", "localization"]
nav_title = "Accessibility & Localization"
+++

An employee can't choose their employer's chat tool. A consumer who finds an app unusable with a screen reader installs another one; an employee whose company standardized on a collaboration suite that doesn't work with their screen reader, magnifier, switch device or captions can't do their job. That's why accessibility in workplace software is enforced through procurement rather than app store reviews. Governments and large employers require a conformance report before they buy, write accessibility into the contract, and hold the vendor to it. The customer's admin also holds several accessibility decisions directly: whether captions and transcripts are enabled in meetings, which caption language options are licensed, whether third-party captioners can join, and which apps are allowed into the workspace.

The engineering is harder than for most web products, because collaboration products are made of the hardest interface patterns: rich-text editors, real-time updates to content the user is reading, drag-and-drop boards, [infinite canvases](/books/workplace-and-collaboration/whiteboards-and-diagrams#the-infinite-canvas), live video. And they are used across languages by global companies, including right-to-left scripts, where some major vendors still have gaps. This chapter covers the US and EU rules that apply to workplace software, the conformance reports that carry them into procurement, the patterns that are hard to make accessible and how vendors approach them, captions in meetings, and localization including right-to-left. It adds conformance reports and workspace language settings to the [core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model). The general practice is the playbook's [Accessibility](/docs/frontend/accessibility) and [Internationalization](/docs/frontend/internationalization).

## How the Platforms Do It

| Vendor | Conformance reports, as of October 2026 | Meetings | Languages |
| --- | --- | --- | --- |
| **Microsoft** | ACRs per product, searchable by name, assessing Section 508, WCAG A and AA, and EN 301 549; most on the VPAT template | Teams live captions in dozens of spoken languages; translated captions with Teams Premium or Copilot (the organizer's license covers all participants); CART captioner support; admins can disable captions; Teams doesn't store captions | Not covered here |
| **Slack** | Not covered here | Huddles | Nine display languages (Chinese, English, French, German, Italian, Japanese, Korean, Portuguese, Spanish, with regional variants); "Slack does not support right-to-left languages" |
| **Google Workspace** | Not covered here | Not covered here | Docs moved to canvas rendering in 2021 with screen reader, braille and magnification support stated as unaffected |

Three patterns:

- **Conformance reports are per product and per standard.** Microsoft's reports each cover Section 508, WCAG and EN 301 549 at once, which is the VPAT INT edition's purpose; a buyer in either market reads the same document.
- **Captions are a licensed, admin-controlled feature.** Base captions come with the meeting product; translated captions are a premium add-on in Teams, licensed through the organizer. The customer's admin decides whether captions are available at all.
- **Right-to-left is not a given.** One of the largest chat products states plainly that it doesn't support right-to-left languages. For a company with staff writing Arabic, Hebrew, Persian or Urdu, that's a procurement fact, not a detail.

## The Rules That Apply

**United States, federal procurement: Section 508.** The Access Board's revised standards (final rule January 18, 2017) apply to information and communication technology federal agencies procure, maintain or use, with January 18, 2018 as the line after which new or altered ICT must meet them. Electronic content "shall conform to Level A and Level AA Success Criteria and Conformance Requirements in WCAG 2.0," incorporated by reference, and the same criteria apply to non-web documents and software with "document" or "software" in place of "Web page" (four success criteria are excluded for non-web). Functions the technical chapters don't address must meet the functional performance criteria. Section 508 binds the agency, not the vendor, which is why it reaches vendors through procurement.

**United States, state and local government: ADA Title II.** The Department of Justice's 2024 rule sets WCAG 2.1 Level AA as the technical standard for state and local government web content and mobile apps. After an April 2026 interim final rule extended the original dates, governments serving 50,000 or more people must comply by April 26, 2027, and smaller governments and special districts by April 26, 2028. The rule reaches vendors: it "applies to web content that a state or local government provides or makes available," including content from contractors and vendors (calendars, maps, payment systems). A collaboration product that a city uses to publish to the public, or a portal a county gives residents, is in scope through the government that uses it.

**European Union: EN 301 549 and the European Accessibility Act.** EN 301 549 is the European standard for ICT accessibility used in public procurement; the VPAT's EU edition reports against it. The European Accessibility Act covers products and services the Commission identifies as most important for persons with disabilities: computers, operating systems and smartphones, self-service terminals, digital TV equipment, telephony services and audiovisual media access, passenger transport services, banking services, e-books and e-commerce. Its list is consumer-facing; whether a given B2B collaboration product is in scope depends on the service (telephony and e-commerce features are the likeliest hooks), and I couldn't confirm the directive's application date and microenterprise rule from the directive text itself, which didn't load. <!-- source-gap: eaa-application-and-scope | missing | European Accessibility Act application date (June 28, 2025) and microenterprise exemption for services | closes with: Directive (EU) 2019/882 text, Articles 4 and 31, opened | checked: 2026-10-29 --> [It's the Law, Too](/docs/frontend/accessibility#it-s-the-law-too) covers the consumer-facing side.

**The baseline.** WCAG 2.2, current as a W3C Recommendation dated December 12, 2024, adds nine success criteria to 2.1 and removes 4.1.1 Parsing. Several of the nine land squarely on collaboration UIs: Dragging Movements (2.5.7) for boards and canvases, Target Size (Minimum) (2.5.8) for dense toolbars and reaction pickers, Focus Not Obscured (2.4.11, 2.4.12) for sticky composers and floating panels, and Accessible Authentication (3.3.8, 3.3.9) for sign-in. Procurement rules still cite WCAG 2.0 (Section 508) and 2.1 (ADA Title II); building to 2.2 AA meets both.

## VPATs and Conformance Reports

The Information Technology Industry Council's Voluntary Product Accessibility Template is the industry's reporting format. As of October 2026 the current version is VPAT 2.5Rev (April 2025), in four editions: 508, EU (EN 301 549), WCAG, and INT combining all three. A completed template "with documented testing results is referred to as an Accessibility Conformance Report (ACR)." Each criterion is rated Supports, Partially Supports, Does Not Support or Not Applicable, with remarks.

For a workplace vendor, the ACR is a sales document with legal weight:

- **One report per product and platform.** Desktop, web, iOS and Android clients behave differently; a single report for "the product" hides the platform where it fails. Microsoft publishes reports per product.
- **Partially Supports needs specifics.** A buyer's accessibility reviewer reads the remarks; "some components" is a reason to reject. Name the component, the failure and the workaround.
- **Dated and versioned.** A report describes a version. Clients that update twice a month ([Desktop & Mobile Clients](/books/workplace-and-collaboration/desktop-and-mobile-clients#auto-update-and-version-floors)) need a cadence for re-testing and re-publishing, and the report should state the version tested.
- **Backed by a roadmap.** Contracts increasingly require the vendor to fix reported gaps by a date. Every "Does Not Support" should map to a tracked defect.
- **Third-party testing helps.** Buyers trust reports from independent testers more than self-assessments.

The ACR is one of the artifacts procurement asks for alongside security and privacy reviews ([What Procurement Asks For](/books/workplace-and-collaboration/selling-to-enterprises#what-procurement-asks-for)).

## The Hard Patterns

Collaboration products concentrate the patterns that defeat assistive technology. What the accessible versions have in common is that the visual surface and the accessible surface are designed together, not retrofitted.

- **Message lists and live updates.** A channel receives new messages while the user reads. Announcing every message through an ARIA live region floods a screen reader; announcing none hides the conversation. The workable pattern is a polite announcement of new activity with a count, keyboard commands to jump to the newest message and back, and a message list that is a real list with each message as an item containing author, time and content in a predictable order.
- **Rich-text editors and composers.** Formatting must be reachable by keyboard and announced; mentions, emoji and slash-command pickers are comboboxes with active-descendant focus; the composer's state (editing, replying in thread, uploading) is announced when it changes.
- **Canvas-rendered documents.** When Google moved Docs from HTML to canvas rendering in 2021, it stated that support for screen readers, braille devices and screen magnification "will not be impacted." A canvas has no DOM text for assistive technology to read, so canvas-rendered products maintain a parallel accessible document model (hidden but structured text, selections and cursor positions mapped to it) and keep the two synchronized on every edit. The same change broke browser extensions that read the document's HTML, which is the cost of the choice.
- **Boards and drag-and-drop.** Every drag must have a non-drag alternative (WCAG 2.2's Dragging Movements): a "move to" menu on a card, keyboard reordering, column selection by list.
- **Infinite canvases and whiteboards.** Objects need an order a screen reader can traverse (reading order by frame or position), names and descriptions for shapes and connectors, and a way to navigate by connection. This remains the weakest area across the industry; [Whiteboards & Diagrams](/books/workplace-and-collaboration/whiteboards-and-diagrams) covers the products.
- **Real-time co-editing.** Other people's cursors and edits must not move the user's focus or reading position, and collaborators' presence should be available on demand rather than announced continuously.
- **Notifications.** Toasts that disappear before a screen reader reads them, and badges conveyed by color alone, both fail. Notifications need a persistent, navigable activity list.

The playbook's [Keyboard and Focus](/docs/frontend/accessibility#keyboard-and-focus) and [Testing](/docs/frontend/accessibility#testing) cover the general techniques.

## Captions, Transcripts and Interpreters in Meetings

Meetings are where workplace accessibility is most visible. The features, using Teams as the documented example:

- **Live captions** generated automatically, in dozens of spoken languages, which participants turn on for themselves. People can choose not to be identified in captions.
- **Translated captions** into a separate list of target languages, requiring Teams Premium or Copilot; if the organizer has the license, every participant can use them. In town halls and live events organizers preselect languages for attendees (six, or ten with Premium).
- **Human captioning (CART).** A Communication Access Real-time Translation captioner can provide captions into the meeting, for accuracy that automatic captions don't guarantee.
- **Admin control.** "Your admin can also disable the feature altogether." Teams doesn't store captions; transcripts are a separate feature with their own retention.

Two decisions here belong to the customer's admin, and both have accessibility consequences: whether captions are enabled tenant-wide (disabling them for privacy or compliance reasons removes an accommodation), and whether transcripts are recorded and retained (they help deaf and hard-of-hearing employees review meetings, and they are also records subject to retention, holds and consent law). [Recordings, Transcripts & AI Notes](/books/workplace-and-collaboration/recordings-transcripts-and-ai-notes#transcripts-captions-and-speaker-identification) covers the recording side.

For a vendor, the design points: captions should be available to every participant regardless of their own license; caption text should be exposed to assistive technology, not only drawn on the video; third-party captioners and sign language interpreters need a supported way in (a CART input, a pinned interpreter video that stays visible); and the admin setting that disables captions should warn that it removes an accommodation.

## Localization and Right-to-Left

A global company runs one tenant for staff who work in dozens of languages, which splits localization into three layers:

- **Interface language,** per user. Slack offers nine display languages, several with regional variants. The tenant may set a default; each person chooses their own.
- **Content language.** Messages and documents are written in whatever languages people use, often mixed within one conversation. Search must tokenize and stem per language, and AI features must answer in the language asked.
- **Administrative language.** Admin consoles, policy text shown to users (acceptable use, retention notices, DLP warnings), and custom terms the organization adds. These are written by the customer's admin, often in one language, and shown to everyone; supporting translated variants of admin-authored text is a feature large customers ask for.

Right-to-left scripts touch every layer. The interface must mirror (navigation, icons with direction, progress, swipe gestures); content must render bidirectionally, with Arabic or Hebrew text and embedded English names, numbers, URLs and code in one line; and editors must handle cursor movement and selection across direction changes. Slack's help center states that "Slack does not support right-to-left languages," which shows how deep the change is for a product not built for it: every message, every composer, every list and every layout needs bidirectional handling. [Right-to-Left Layouts](/docs/frontend/internationalization#right-to-left-layouts) and [Unicode Traps](/docs/frontend/internationalization#unicode-traps) cover the mechanics.

Other workplace specifics:

- **Time zones and calendars** are per user, and shared views (a meeting time in a channel, a due date on a task) render in the viewer's zone with the author's zone available ([Time](/docs/fundamentals/time)).
- **Names** come from the directory, in the formats people use; sorting and search must handle non-Latin names and transliteration.
- **Machine translation of service text.** Microsoft machine-translates its service health posts into the admin's preferred language, keeping English as the source; it's a reasonable pattern for any operational message written under time pressure ([Status, Service Health and the Admin](/books/workplace-and-collaboration/reliability-and-outages#status-service-health-and-the-admin)).

## How to Build It

The core tables (`workspaces`, `members`, `audit_events`) are fixed. This chapter adds published conformance reports, their per-criterion results tied to defects, and language settings for a workspace and its admin-authored text.

```sql
CREATE TABLE conformance_reports (          -- one published ACR
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  product         TEXT NOT NULL,            -- 'chat', 'meetings', 'docs'
  platform        TEXT NOT NULL CHECK (platform IN ('web', 'windows', 'macos', 'ios',
                    'android')),
  client_version  TEXT NOT NULL,            -- the version tested
  template        TEXT NOT NULL,            -- 'VPAT 2.5Rev INT'
  standards       TEXT[] NOT NULL,          -- 'wcag22_aa', 'section508', 'en301549'
  tested_by       TEXT NOT NULL,            -- 'internal' or the independent tester
  tested_on       DATE NOT NULL,
  published_at    TIMESTAMPTZ,
  document_ref    TEXT NOT NULL,
  supersedes_id   UUID REFERENCES conformance_reports (id)
);

CREATE TABLE conformance_results (
  report_id       UUID NOT NULL REFERENCES conformance_reports (id),
  criterion       TEXT NOT NULL,            -- '2.5.7', '502.3.1'
  level           TEXT NOT NULL CHECK (level IN ('supports', 'partially_supports',
                    'does_not_support', 'not_applicable')),
  remarks         TEXT NOT NULL DEFAULT '',
  defect_refs     TEXT[] NOT NULL DEFAULT '{}',  -- tracked fixes
  target_fix_date DATE,
  PRIMARY KEY (report_id, criterion),
  CHECK (level IN ('supports', 'not_applicable')
         OR (remarks <> '' AND cardinality(defect_refs) > 0))
);

CREATE TABLE workspace_language_settings (
  workspace_id        UUID PRIMARY KEY REFERENCES workspaces (id),
  default_locale      TEXT NOT NULL DEFAULT 'en-US',   -- BCP 47
  allowed_locales     TEXT[],                          -- null means all supported
  captions_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  translated_captions BOOLEAN NOT NULL DEFAULT FALSE,  -- licensed add-on
  cart_allowed        BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by          UUID NOT NULL REFERENCES members (id),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_text_translations (      -- policy text the customer's admin writes
  workspace_id    UUID NOT NULL REFERENCES workspaces (id),
  text_key        TEXT NOT NULL,            -- 'custom_terms', 'dlp_block_notice'
  locale          TEXT NOT NULL,
  body            TEXT NOT NULL,
  source          TEXT NOT NULL CHECK (source IN ('admin', 'machine')),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, text_key, locale)
);

ALTER TABLE members
  ADD COLUMN locale    TEXT,               -- the person's interface language
  ADD COLUMN time_zone TEXT;               -- IANA zone
```

The open gaps across published reports, for the roadmap:

```sql
SELECT r.product, r.platform, c.criterion, c.level, c.target_fix_date, c.defect_refs
FROM conformance_results c
JOIN conformance_reports r ON r.id = c.report_id
WHERE r.published_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM conformance_reports n WHERE n.supersedes_id = r.id)
  AND c.level IN ('partially_supports', 'does_not_support')
ORDER BY c.target_fix_date NULLS FIRST;
```

Notes on the sketch:

- **Every gap has a defect.** The `CHECK` makes it impossible to publish "Partially Supports" without remarks and a tracked fix, which is what a buyer's reviewer and a contract's remediation clause need.
- **Reports are per platform and version.** A new major client version, or a material UI change, creates a new report that supersedes the old; the query reads only current reports.
- **Caption settings are tenant policy.** Turning `captions_enabled` off writes an `audit_events` row and shows the admin a warning that captions are an accommodation; meeting clients read the setting at join.
- **Admin-authored text has locales.** When a user's locale has a translation of a policy notice, they see it; otherwise they see the admin's original. Machine translations are marked as such.
- **Locale and zone come from the person.** Directory sync can supply defaults; the user's choice wins.

## What This Means for the System You Build

- **Build to WCAG 2.2 AA,** which covers Section 508's 2.0 and ADA Title II's 2.1 requirements.
- **Publish ACRs per product and platform,** on the VPAT INT edition, dated, versioned, with specific remarks and a tracked fix for every gap.
- **Design the accessible model with the visual one** for live message lists, editors, canvases and boards; give every drag a non-drag alternative.
- **Keep a parallel accessible document** if you render to canvas, synchronized on every edit.
- **Make captions available to every participant,** expose them to assistive technology, support CART and interpreters, and warn admins who disable them.
- **Support right-to-left from the start;** retrofitting bidirectional text into every surface is a rewrite.
- **Separate interface, content and admin-authored languages,** and let admins provide translations of the policy text everyone sees.

## References

**Law and regulation**

- [U.S. Access Board: ICT Standards and Guidelines (Section 508)](https://www.access-board.gov/ict/), the January 18, 2017 final rule, the January 18, 2018 line, WCAG 2.0 A and AA by reference, non-web documents and software, functional performance criteria
- [ADA.gov: Fact sheet on the Title II web and mobile app rule](https://www.ada.gov/resources/2024-03-08-web-rule/), WCAG 2.1 AA, compliance dates of April 26, 2027 and April 26, 2028 after the April 2026 extension, and coverage of vendor content
- [European Commission: European Accessibility Act](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en), the products and services covered

**Standards**

- [W3C: Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), the December 12, 2024 Recommendation, the nine new criteria and the removal of 4.1.1
- [ITI: Voluntary Product Accessibility Template](https://www.itic.org/policy/accessibility/vpat), VPAT 2.5Rev (April 2025), the four editions, ACRs and conformance levels

**Vendor documentation**

- [Microsoft: Accessibility Conformance Reports](https://www.microsoft.com/en-us/accessibility/conformance-reports), per-product ACRs against Section 508, WCAG and EN 301 549
- [Microsoft Support: Use live captions in Microsoft Teams meetings](https://support.microsoft.com/en-us/office/use-live-captions-in-microsoft-teams-meetings-4be2d304-f675-4b57-8347-cbd000a21260), languages, translated captions licensing, CART, opting out of identification, admin disablement, captions not stored
- [Google Workspace Updates: Canvas-based rendering in Google Docs (May 11, 2021)](https://workspaceupdates.googleblog.com/2021/05/Google-Docs-Canvas-Based-Rendering-Update.html), the move to canvas, the extension impact and the statement on screen readers, braille and magnification
- [Slack Help Center: Manage your language preferences](https://slack.com/help/articles/215058658-Manage-your-language-preferences), the nine display languages and no right-to-left support
- [Microsoft Learn: How to check Microsoft 365 service health](https://learn.microsoft.com/en-us/microsoft-365/enterprise/view-service-health), machine translation of service health posts
