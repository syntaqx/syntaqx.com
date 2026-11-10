+++
title = "Generated Documents"
description = "Receipts, invoices, statements and contracts as PDFs: renderers compared, templates as code, background rendering, numbering, PDF/A, PDF/UA and delivery."
category = "Building Blocks"
order = 463
tags = ["architecture", "pdf", "documents", "invoices", "accessibility"]
+++

Sooner or later the product has to produce a document someone keeps: a receipt, an invoice, a monthly statement, a signed service agreement, a year-end tax summary, a compliance report. It starts as a "Download PDF" button that renders the current record through a template on request. That works until a customer disputes an invoice from last March and the PDF you produce today shows this year's address, the new tax wording and a total recomputed by code that changed twice since.

The shape that holds up: **a document is issued once, from a frozen snapshot of its inputs and a pinned template version, rendered in the background, and the bytes are kept.** After that, every download is the same file. This chapter covers the mechanics. What an invoice must say is in [Sales Tax](/docs/money/sales-tax) and [Accounting](/docs/money/accounting), and how long it's kept is in [Data Retention](/docs/building-blocks/data-retention).

## What Was Sent Is What You Keep

A generated document is evidence. The customer has a copy, and yours has to match it.

- **Keep the rendered bytes.** Store the PDF in object storage with its SHA-256, size and storage key on the document row. Downloads serve those bytes; nothing re-renders an issued document.
- **Keep the inputs too.** The exact data the template saw (as a JSON snapshot), the template version, the locale, and the renderer version. The bytes prove what was sent; the inputs explain why it said that, and let you produce a corrected document that differs only where it should.
- **Don't render from live records.** A snapshot taken in the transaction that issues the document, not a query at render time. Customers move, prices change, and a product renamed next year must not rename it on last year's invoice. [Audit Trails](/docs/building-blocks/audit-trails#snapshot-what-changes-underneath-you) makes the same point about what an audit record captures.
- **Corrections are new documents.** An invoice with a mistake is credited or voided and reissued; the original stays, with its number, linked to what replaced it. Overwriting the PDF is rewriting history.

For invoices this is also the law in places. The EU VAT Directive requires that "the authenticity of the origin, the integrity of the content and the legibility of an invoice, whether on paper or in electronic form," be ensured "from the point in time of issue until the end of the period for storage of the invoice." A stored file with a recorded hash, in storage that doesn't allow overwrites, is the simplest way to show integrity.

```sql
CREATE TABLE documents (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL REFERENCES tenants (id),
  kind              TEXT NOT NULL,          -- 'invoice', 'credit_note', 'statement', 'agreement'
  subject_type      TEXT NOT NULL,          -- what it's about: 'invoice', 'account', 'contract'
  subject_id        UUID NOT NULL,
  series            TEXT,                   -- numbering series, when the kind is numbered
  number            TEXT,                   -- assigned at issue, never reused
  template_version  TEXT NOT NULL,          -- pinned at issue
  locale            TEXT NOT NULL,          -- BCP 47, e.g. 'de-DE'
  data              JSONB NOT NULL,         -- the frozen input snapshot
  renderer_version  TEXT,
  artifact_key      TEXT,                   -- object storage key, set once rendered
  artifact_sha256   TEXT,
  artifact_bytes    INTEGER,
  replaces_id       UUID REFERENCES documents (id),
  issued_at         TIMESTAMPTZ NOT NULL,
  rendered_at       TIMESTAMPTZ,
  UNIQUE (tenant_id, kind, series, number)
);
```

## Choosing a Renderer

There are three families, and the choice is mostly about what the output must conform to.

**HTML and CSS through headless Chromium.** Templates are web pages, so the team already knows how to write and preview them, and a print stylesheet controls page size, margins and breaks. Puppeteer's `page.pdf()` drives it. Its defaults are worth knowing: `printBackground` is `false` (background colors and table stripes vanish until you turn it on), `format` is `letter` (set `preferCSSPageSize` so the template's `@page` size wins), and `waitForFonts` is `true`. Since Chrome 131, "you can use CSS to add content to the margins of pages when they are printed," so running headers and page numbers can come from CSS `@page` margin boxes instead of Puppeteer's separate header template. The CSS Paged Media module behind all this is still a W3C Working Draft, and Chromium implements part of it: Chrome's own announcement lists cross-references and footnotes as future possibilities, not features. `tagged` defaults to `true`, so you get a tagged PDF, but Puppeteer's options offer no PDF/A or PDF/UA conformance profile.

**Typesetting engines and libraries.** WeasyPrint renders HTML and CSS without a browser and offers explicit output variants, from `pdf/a-1b` through `pdf/a-4f` and `pdf/ua-1` and `pdf/ua-2`, with tagging behind a `pdf_tags` option that defaults to `False`. It warns that PDF/A and PDF/UA output is not guaranteed valid and must be checked. Typst is a markup-based typesetter that "will always write Tagged PDF" by default and supports PDF/A profiles and PDF/UA-1, noting that "PDF/UA-1 and PDF/A-4 are mutually incompatible." Prince, a commercial CSS typesetter, supports PDF/A-1 through 3, PDF/UA-1 and combined profiles such as `PDF/A-3a+PDF/UA-1`. Lower-level libraries that place text at coordinates exist in every language; they make sense for a fixed form, and become a layout engine you maintain for anything else.

**Vendor document APIs.** You send HTML or a template ID and data, they send back a PDF. They remove the renderer from your infrastructure and put your customers' financial data in a processor's hands ([GDPR & Privacy](/docs/compliance/gdpr#controllers-processors-and-the-dpa)), with per-document pricing and their outage as yours.

My default: **HTML and CSS templates, rendered in a dedicated service you run.** Headless Chromium when the requirement is "looks right, prints right, has tags"; a typesetter with explicit PDF/A and PDF/UA profiles (WeasyPrint, Typst or Prince) when the documents are archival records or must meet an accessibility standard you'll be audited on, which for invoices and statements in regulated industries is usually the case. Keep the renderer behind one interface (`html in, PDF bytes out`), so switching engines is a deploy, not a rewrite.

## Templates Are Code

A template that decides what an invoice says is as consequential as the code that computes the total.

- **Templates live in the repository,** reviewed like code, and each release has a version ID. The document row pins the version at issue, and a re-render (for a corrected document, or a migration to a new storage format) uses the pinned one, never "latest."
- **Logic stays out.** The template formats data the snapshot already contains: line items, subtotals, tax lines, the amount due. It never computes a total, applies a discount or decides tax. If the PDF and the API disagree about the amount due, the PDF is wrong, and it's wrong because someone added arithmetic to a template.
- **Tenant branding is data,** not tenant-edited HTML: a logo, a color, an address block, a footer note from a bounded set of fields. Arbitrary customer-supplied markup in a document renderer is a stored cross-site scripting and server-side request forgery surface.
- **Preview and snapshot-test.** Fixture snapshots (long names, a hundred line items, a right-to-left locale, every tax case) render in CI to images, compared against approved baselines, so a CSS change that pushes the total onto a second page is caught in review.

## Render in the Background

Rendering is slow, memory-hungry and occasionally hangs, which makes it a [background job](/docs/architecture/background-jobs), never work done inside the request that issued the document.

- **Issue in the transaction, render after.** The business transaction (finalize the invoice, close the statement period) writes the document row with its number and snapshot and enqueues the render in the same transaction ([Enqueue Transactionally](/docs/architecture/background-jobs#enqueue-transactionally)). If rendering fails, the invoice is still issued, and the job retries.
- **The job is idempotent.** It renders once, writes the bytes only if the key is absent, and records the hash. A retry after a crash finds the work already done:

```go tab="Go"
// RenderDocument renders an issued document once, from its frozen snapshot and
// pinned template version. Safe to retry: a rendered document is never rendered again.
func RenderDocument(ctx context.Context, store Store, tpl Templates, r Renderer, blobs Blobs, id string) error {
	doc, err := store.Document(ctx, id)
	if err != nil {
		return err
	}
	if doc.ArtifactKey != "" {
		return nil // what was sent is what we keep
	}
	html, err := tpl.RenderHTML(ctx, doc.Kind, doc.TemplateVersion, doc.Locale, doc.Data)
	if err != nil {
		return err
	}
	pdf, err := r.PDF(ctx, html)
	if err != nil {
		return err
	}
	sum := sha256.Sum256(pdf)
	key := fmt.Sprintf("documents/%s/%s.pdf", doc.TenantID, doc.ID)
	if err := blobs.PutIfAbsent(ctx, key, pdf); err != nil {
		return err
	}
	return store.MarkRendered(ctx, doc.ID, key, hex.EncodeToString(sum[:]), len(pdf))
}
```

```rust tab="Rust"
/// Renders an issued document once, from its frozen snapshot and pinned
/// template version. Safe to retry: a rendered document is never rendered again.
pub async fn render_document(
    store: &impl Store, templates: &impl Templates, renderer: &impl Renderer, blobs: &impl Blobs, id: &str,
) -> Result<(), RenderError> {
    let doc = store.document(id).await?;
    if doc.artifact_key.is_some() {
        return Ok(()); // what was sent is what we keep
    }
    let html = templates.render_html(&doc.kind, &doc.template_version, &doc.locale, &doc.data).await?;
    let pdf = renderer.pdf(&html).await?;
    let sha256 = hex::encode(Sha256::digest(&pdf));
    let key = format!("documents/{}/{}.pdf", doc.tenant_id, doc.id);
    blobs.put_if_absent(&key, &pdf).await?;
    store.mark_rendered(&doc.id, &key, &sha256, pdf.len()).await
}
```

- **Isolate the renderer.** A browser that renders customer data is a browser an attacker can feed. Run it in its own service with no network access beyond what it needs (ideally none), inline every asset (fonts, logos, stylesheets) into the HTML so nothing is fetched at render time, and block requests from the page, so an image tag in a customer's company name can't reach your metadata endpoint.
- **Bound everything.** A timeout per render (Puppeteer's default is 30 seconds), a page-count ceiling, a concurrency limit per worker sized to memory, and a fresh browser context per document so one tenant's render never shares state with another's.
- **Batch runs are planned.** Month-end statements for every account are a burst of thousands of renders at once; schedule them, spread them, and watch the queue depth, not just the error rate.

## Fonts

Fonts are where documents quietly go wrong.

- **Embed every font.** A PDF that relies on fonts installed on the reader's machine renders differently everywhere. PDF/A requires that all fonts be embedded and "legally embeddable for unlimited, universal rendering," and so does PDF/UA, which is reason enough to make it your rule for every document.
- **License for embedding.** Not every font license permits embedding in distributed documents. Check before a brand font goes into an invoice template.
- **Pin the font files** in the renderer's image, versioned with the templates. A system font that changes with an OS update changes your line breaks.
- **Cover every script you print.** A customer name in Greek, Arabic or Chinese in a font without those glyphs renders as empty boxes. Choose a family with the coverage your customers need, or a defined fallback chain, and include those names in the fixture tests.

## Numbering

Many documents need a number, and invoices need a specific kind. The EU VAT Directive requires "a sequential number, based on one or more series, which uniquely identifies the invoice." Several series are allowed (per branch, per tenant, credit notes separately), but within a series the numbers run in order and are never reused.

Database sequences are the wrong tool for this. PostgreSQL's documentation is direct: values from `nextval` are not reclaimed when a transaction aborts, so "transaction aborts or database crashes can result in gaps," and "PostgreSQL sequence objects cannot be used to obtain 'gapless' sequences." For invoice numbers, use a counter row per series, incremented in the same transaction that issues the document:

```sql
CREATE TABLE document_series (
  tenant_id    UUID NOT NULL REFERENCES tenants (id),
  series       TEXT NOT NULL,                 -- 'INV-2026', 'CN-2026'
  next_number  BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, series)
);

-- Inside the transaction that issues the invoice: the row lock serializes
-- issuers in this series, and a rollback returns the number with everything else.
UPDATE document_series
SET next_number = next_number + 1
WHERE tenant_id = $1 AND series = $2
RETURNING next_number - 1 AS number;
```

- **Assign at issue, not at draft.** Drafts get an internal ID; the number appears when the document is finalized. Deleting drafts is then harmless.
- **The lock is the cost.** Issuers in one series wait for each other. That's fine for invoices, which are issued at human or batch speed; split the series (per branch, per tenant) if a single counter ever becomes the bottleneck.
- **Voided documents keep their numbers.** A cancelled invoice stays in the sequence with its status, and the correction is a credit note in its own series. A missing number is what an auditor asks about.

The Directive's text says sequential and unique; it doesn't use the word "gapless," and the Commission's explanatory notes on the invoicing rules only add that the series can be split (per branch, per type of supply, per customer) at the business's choice. National rules differ. France's tax doctrine requires "un numéro unique basé sur une séquence chronologique et continue," and each separate series must itself be continuous (BOFiP, BOI-TVA-DECLA-30-20-20-10). Spain's invoicing regulation says numbering "dentro de cada serie será correlativa" (Real Decreto 1619/2012, Article 6). Germany's VAT guidelines go the other way: "eine lückenlose Abfolge der ausgestellten Rechnungsnummern" is not mandatory (UStAE 14.5(10), as the Frankfurt chamber of commerce quotes it; I couldn't open the ministry's own copy). There is no single EU rule, so my default is the strictest reading: no gaps within a series, ever, and every void kept and explained. <!-- source-gap: invoice-gapless-national-rules | secondary | Germany's UStAE 14.5(10) wording comes via IHK Frankfurt, not the BMF text; other member states' treatment of gaps not checked | closes with: the BMF's consolidated UStAE, and national guidance from other member states (e.g. Italy's Agenzia delle Entrate) on gaps | checked: 2026-11-10 -->

## Localization and Money

A document is rendered for its recipient, not for whoever clicked the button.

- **The locale is part of the snapshot,** chosen from the recipient's account at issue (with the tenant's default as fallback), and it sets language, number format, date format and paper size (A4 or US Letter). An invoice reprinted by a support agent in another country is the same invoice.
- **Currency comes from the amount, not the locale.** A German customer billed in US dollars sees `1.234,56 $`, not euros. Format with CLDR data (`Intl.NumberFormat` with `style: "currency"` in JavaScript, which requires the currency code: "if the `style` is `"currency"`, the `currency` property must be provided"; the CLDR-backed libraries in Go and Rust work the same way) and never by concatenating a symbol. Amounts are integers in minor units until the moment of formatting ([Money & Amounts](/docs/money/amounts)).
- **Dates in the recipient's zone,** stored as instants and rendered in the zone the snapshot records. The invoice date is a legal date, and "issued at 23:30 UTC" is the next day in Berlin ([Time & Date Formats](/docs/fundamentals/time)).
- **Formatting data changes too.** CLDR releases can change separators and currency symbols, which is one more reason to keep the bytes rather than trusting a re-render to match.

String externalization, plurals and right-to-left layout work as they do anywhere else ([Internationalization](/docs/frontend/internationalization#formatting-use-intl-not-strings)); a right-to-left invoice needs its own fixture and baseline.

## Archival: PDF/A

PDF/A (ISO 19005) is the profile of PDF made for long-term preservation: self-contained, with nothing that depends on the outside world or on a particular viewer. The Library of Congress summarizes its rules: "PDF/A does not permit encryption," JavaScript and launching executables are prohibited (relaxed somewhat in PDF/A-4), and all fonts must be embedded. The parts build on each other:

| Part | Based on | Adds |
| --- | --- | --- |
| PDF/A-1 (2005) | PDF 1.4 | The original profile |
| PDF/A-2 (2011) | PDF 1.7 | Embedding PDF/A-compliant attachments |
| PDF/A-3 (2012) | PDF 1.7 | "Embedding of a file or files in any format" |
| PDF/A-4 (2020) | PDF 2.0 | Drops the A, B and U levels; adds the 4f and 4e profiles |

My default for invoices, statements and agreements is **PDF/A-3 or PDF/A-2 with accessibility (the "a" level)**, generated by a renderer that has the profile, and validated in CI. PDF/A-3's attachments let a document carry a machine-readable copy of its own data next to the pages. Note what a PDF isn't, though: the European Commission lists "unstructured invoice data issued in PDF or Word formats" among things that are *not* e-invoices, which it defines as invoices "issued, transmitted and received in a structured data format" under EN 16931. Where e-invoicing is mandatory, the structured file is the invoice and the PDF is a human-readable rendering of it.

Validate, don't trust. veraPDF, an open-source validator, checks "all PDF/A and PDF/UA parts and conformance levels"; run it on fixture output in CI and on a sample of production output, since a renderer upgrade can break conformance without changing how the page looks.

## Accessibility: Tagged PDF and PDF/UA

A PDF that looks right can still be unusable with a screen reader: no reading order, no headings, a table that reads as a stream of numbers. Customers have the same right to read their invoice as anyone else, and in many places the law agrees ([Accessibility](/docs/frontend/accessibility#it-s-the-law-too)).

PDF/UA (ISO 14289) is the standard for accessible PDF. From the Library of Congress's description of PDF/UA-1: meaningful content is tagged, decorative and layout-only content is marked as artifacts, tags follow a logical reading order with rules for headings, tables and lists, content images carry alternative text, the document declares its languages, and "fonts must be embedded." A PDF/UA-1 file can also be PDF/A, as long as it's unencrypted.

In practice, from HTML templates:

- **Semantic HTML in, tags out.** Headings as `h1` to `h3`, line items as a real `table` with `th` headers, lists as lists, the logo with `alt` text, decorative rules as CSS. The renderer derives tags from structure, so a template built from styled `div`s produces a tagged PDF with nothing useful in the tags.
- **Set the document title and language.** WCAG's PDF techniques cover both (PDF18 for the title, PDF16 for the default language), along with alt text (PDF1), headings (PDF9) and tables (PDF6).
- **Turn tagging on explicitly** where it isn't the default (WeasyPrint's `pdf_tags`), and validate PDF/UA conformance with veraPDF alongside PDF/A.
- **Test with a screen reader** on the fixtures once per template change: the amount due should be findable without reading the whole document.

## Delivery

Emailing a PDF as an attachment puts a copy of the customer's financial data in every mailbox it passes through, forever. My default is a link, with attachments only where the customer or the law asks for them.

- **Link to your app, not to storage.** The email links to a URL in your product that checks the session or a single-purpose token, records the access, and then redirects to a fresh, short-lived signed URL for the object. A link forwarded or found months later then still goes through your access check.
- **Signed URLs are bearer tokens.** AWS describes presigned URLs as "bearer tokens that grant access to those who possess them." With IAM user credentials they can be valid for up to 7 days; signed with temporary credentials, they expire when the credentials do, "even if the URL was created with a later expiration time." Mint them per download with an expiry of minutes, from the same tenant-scoped storage rules as [File Uploads](/docs/building-blocks/file-uploads#the-upload-credential).
- **Set the download name and type.** `Content-Disposition` with a readable filename (`invoice-INV-2026-000123.pdf`) and `application/pdf`, set on the object or the signed request, so the customer's downloads folder isn't full of UUIDs.
- **Agreements are signed bytes.** A contract or service agreement is rendered once, and the signature ceremony signs exactly that file; nothing re-renders it afterwards. Evidence, consent and storage of the signed result are in [Electronic Signatures](/docs/compliance/electronic-signatures#storage-and-retrieval).

## Retention

Each document kind gets a retention period from the record it belongs to: invoices for as long as tax law requires, statements for as long as the account's financial records, generated reports perhaps for days. Put them in the same schedule as everything else ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)).

- **Object lock or versioning** on the bucket that holds issued documents, so integrity doesn't depend on nobody running the wrong delete.
- **Delete the bytes, the snapshot and the row together** when the period ends, through the same job.
- **Erasure requests meet legal retention.** An invoice with a person's name and address is often a record you must keep despite a deletion request; the rules for what's kept, restricted or redacted are in [Erasure vs Append-Only Records](/docs/building-blocks/data-retention#erasure-vs-append-only-records). Ephemeral exports (a CSV report someone asked for) get a short expiry and are deleted automatically.

## Checklist

- **Issue once, from a snapshot,** in the business transaction; keep the bytes, the hash, the inputs and the template version.
- **Corrections are new documents** linked to what they replace; nothing re-renders an issued document.
- **HTML and CSS templates in a dedicated renderer;** a typesetter with explicit PDF/A and PDF/UA profiles for archival or audited documents.
- **Templates are versioned code** with no arithmetic, branding as data, and visual fixture tests.
- **Render in an idempotent background job,** isolated from the network, with timeouts and concurrency limits.
- **Embed licensed, pinned fonts** that cover every script you print.
- **Gapless numbers per series** from a counter row in the issuing transaction, never a sequence; voids keep their numbers.
- **Locale, currency and time zone from the recipient,** recorded in the snapshot, formatted with CLDR.
- **PDF/A for records, tagged PDF/UA for people,** both validated in CI.
- **Deliver through an access-checked link** that mints a short-lived signed URL.
- **Retention per document kind,** with object lock on issued documents.

## References

**Specifications**

- [Council Directive 2006/112/EC, Article 226](https://www.legislation.gov.uk/eudr/2006/112/article/226), invoice date and "a sequential number, based on one or more series"
- [Council Directive 2006/112/EC, Article 233](https://www.legislation.gov.uk/eudr/2006/112/article/233), authenticity of origin, integrity of content and legibility until the end of storage
- [European Commission: Explanatory notes on VAT invoicing rules (Council Directive 2010/45/EU)](https://taxation-customs.ec.europa.eu/system/files/2016-09/explanatory_notes_en.pdf), note C-2 on sequential numbering and separate series
- [BOFiP: BOI-TVA-DECLA-30-20-20-10 (in force since 18 October 2013)](https://bofip.impots.gouv.fr/bofip/140-PGP.html/identifiant=BOI-TVA-DECLA-30-20-20-10-20131018), France: a unique number in a chronological, continuous sequence, per series
- [Real Decreto 1619/2012, Reglamento de facturación](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696), Spain, Article 6: numbering within each series is correlative
- [IHK Frankfurt am Main: Pflichtangaben in der Rechnung](https://www.frankfurt-main.ihk.de/recht/uebersicht-alle-rechtsthemen/steuerrecht/umsatzsteuer-national/rechnungen-pflichtangaben-in-der-rechnung-5195692), Germany: quotes UStAE 14.5(10), a gapless sequence is not mandatory
- [W3C: CSS Paged Media Module Level 3](https://www.w3.org/TR/css-page-3/), `@page`, page size and page-margin boxes (Working Draft)
- [W3C: PDF Techniques for WCAG 2.2](https://www.w3.org/WAI/WCAG22/Techniques/#pdf), alt text, headings, tables, document title and language in PDF

**Reference**

- [Library of Congress: PDF/A family](https://www.loc.gov/preservation/digital/formats/fdd/fdd000318.shtml), PDF/A parts, prohibitions, embedded fonts and PDF/A-3 attachments
- [Library of Congress: PDF/UA-1](https://www.loc.gov/preservation/digital/formats/fdd/fdd000350.shtml), tagging, reading order, alternative text, language and compatibility with PDF/A
- [Puppeteer: PDFOptions](https://pptr.dev/api/puppeteer.pdfoptions), `printBackground`, `preferCSSPageSize`, `tagged`, `waitForFonts` and timeout defaults
- [Chrome for Developers: Add content to the margins of web pages when printed using CSS](https://developer.chrome.com/blog/print-margins), page margin boxes from Chrome 131 and what isn't supported yet
- [WeasyPrint: API reference](https://doc.courtbouillon.org/weasyprint/stable/api_reference.html), PDF/A and PDF/UA variants and the `pdf_tags` option
- [Typst: PDF](https://typst.app/docs/reference/pdf/), tagged PDF by default, PDF/A profiles and PDF/UA-1
- [Prince: PDF profiles](https://www.princexml.com/doc/pdf-profiles/), PDF/A, PDF/UA and combined profiles
- [veraPDF](https://verapdf.org/), open-source validation of PDF/A and PDF/UA
- [PostgreSQL: Sequence manipulation functions](https://www.postgresql.org/docs/current/functions-sequence.html), why sequences can't be gapless
- [MDN: Intl.NumberFormat() constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat), currency style and display options
- [AWS: Download and upload objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html), expiry limits, temporary credentials and presigned URLs as bearer tokens
- [European Commission: What is eInvoicing](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/What+is+eInvoicing), why a PDF is not an e-invoice, and EN 16931
