+++
title = "File Uploads"
description = "Uploads straight to storage on a scoped credential, resumable protocols, checks on what arrived, hostile files, and a gate before a file is usable."
category = "Architecture"
order = 423
tags = ["architecture", "uploads", "storage", "security", "mobile"]
+++

An upload is the largest untrusted input most systems take. A phone on a train sends a 2 GB video over a connection that drops every few minutes; a script sends ten thousand files an hour; a 50 KB image declares itself 100,000 pixels square and takes down the worker that decodes it. Users want uploads to be fast and to survive a dropped connection. The system wants its application servers out of the byte path, its storage bill free of abandoned half-uploads, its decoders isolated from hostile files, and a hard line between "received" and "usable" that no code path can skip.

## Keep Bytes Off the Application

The application server should never carry the bytes. Proxying an upload through it ties up a request worker for minutes, doubles the transfer (client to app, app to storage), and puts the most exposed code, request parsing, on the biggest inputs. The pattern that replaced it has four steps:

1. **Ask.** The client tells the API what it intends to upload: the purpose (an avatar, a document, a video), the declared type and size, and an idempotency key. The API checks what only it can check: permission, quotas and rate limits ([Rate Limiting](/docs/requests/rate-limiting)), and whether the declared size and type fit the purpose.
2. **Grant.** The API creates the file record in `uploading` with an upload session, generates the storage key itself, and returns a scoped credential for exactly that key: a presigned URL, a one-time vendor URL or a resumable session.
3. **Send.** The client sends the bytes straight to storage or the vendor.
4. **Confirm.** The storage notification, or the client's "done" once verified, moves the record on. The server checks that the object exists, that its size is within the grant and that its checksum matches, and never takes the client's word for any of it.

## The Upload Credential

The credential is the security boundary, so its shape matters:

- **A presigned URL is a bearer token.** Amazon's documentation says so in those words: anyone holding it can use it, and it "can be used multiple times, up to the expiration date and time," which the S3 SDKs allow to be as long as 7 days. It also dies early if the temporary credentials that signed it expire. My default is minutes, not days: S3 checks expiry when a request starts, so a long upload that began in time still finishes, and a leaked URL is useless by the time anyone finds it.
- **The server names the key.** An upload to an existing key replaces the object, so a key built from the user's filename lets one user overwrite another's file. Generate the key from the record's ID; keep the original filename, if at all, as a display field, because it often carries personal data.
- **Bound the size at the storage layer.** A declared size in the API means nothing if storage accepts whatever arrives. Google Cloud Storage accepts an `x-goog-content-length-range` header and rejects a body outside it with `400 Bad Request`; vendor upload URLs carry their own caps. Whatever the provider, the confirm step compares the stored size with the grant.
- **One-time and short-lived where the vendor allows it.** Cloudflare's Direct Creator Upload URL expires after 30 minutes unused by default, configurable from two minutes to six hours. Mux ties its direct upload URL to a CORS origin, set to the application's own.
- **Uploads land somewhere nobody reads.** The original goes to a private bucket or prefix that no CDN serves and no public URL reaches; only processed output is ever served. OWASP's guidance says the same in general terms: store uploads on a separate host, or at least outside the web root. Serving originals from the main origin is one content-sniffing mistake away from serving an attacker's HTML as your own ([Security Headers](/docs/security/security-headers#the-baseline)).

A resumable session URI is a credential too: Google's Cloud Storage docs warn that it "acts as an authentication token," and anyone holding it can finish the upload.

## Resumable Uploads

A single `PUT` works for a photo on a good connection. A multi-gigabyte file from a phone on cellular needs a protocol that survives the connection dropping, the app being backgrounded, and the user coming back an hour later. Three families cover almost every system:

**tus** is an open protocol several vendors speak. The client creates an upload with a `POST` carrying `Upload-Length` and gets back a `Location`. To resume, it asks with `HEAD` and the server returns `Upload-Offset`; the client then `PATCH`es from exactly that offset. A `PATCH` whose offset doesn't match the server's gets `409 Conflict` and changes nothing. Extensions add an `Upload-Expires` time, a per-request `Upload-Checksum`, termination with `DELETE`, and concatenation of partial uploads sent in parallel.

**Google-style resumable sessions** are used by Google Cloud Storage and the YouTube Data API. The first request describes the file and returns a session URI. The client `PUT`s bytes to it; after a failure it sends an empty `PUT` with `Content-Range: bytes */TOTAL`, and a `308 Resume Incomplete` response carries a `Range` header with the bytes confirmed so far. The next chunk starts exactly one byte past that range. Chunks are multiples of 256 KB (only the last may be smaller); `500` to `504` are retried with backoff; an expired session returns `404` and the upload starts over. Cloud Storage sessions last up to a week.

**S3 multipart** is the object store's own answer. The client initiates an upload, sends parts numbered 1 to 10,000 in any order and in parallel, records each part's ETag, and completes with the list; a failed part is retried alone. Amazon recommends it for objects of 100 MB or more. Unlike the other two, a multipart upload never expires: parts are stored and billed until the upload is completed or aborted.

Choosing between them:

| Need | Pick |
| --- | --- |
| Files under a few tens of MB on decent connections | One presigned `PUT` |
| Large files straight into S3 or an S3-compatible store, parallel parts | S3 multipart |
| Large files into Google Cloud Storage | Resumable sessions |
| A vendor or server you control, one protocol across clients | tus, which has client libraries for the browser, iOS and Android |

## Rules for Every Resumable Upload

- **The server's offset is the truth.** Resume from what the server says it has, never from the client's count; both tus and the Google protocol exist to make that question cheap.
- **Every session expires, and expiry cleans up.** An abandoned upload is storage you pay for and nobody will ever use. The session row carries an expiry, a sweeper aborts or deletes what didn't finish, and the record moves to a terminal state ([Background Jobs](/docs/architecture/background-jobs#scheduling)). On S3, add a lifecycle rule with `AbortIncompleteMultipartUpload` as the backstop.
- **Checksum the whole file, not just the parts.** Part checksums catch transmission errors; a whole-file hash is what deduplication and matching need. S3 can validate a full-object checksum at completion and fails with `BadDigest` on a mismatch.
- **Make "create upload" idempotent.** A mobile client that retries the create call after a timeout must get the same session back, not a second record ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)).
- **Reserve, then reconcile.** Cloudflare Stream makes the uploader declare `maxDurationSeconds` and holds that much of the account's storage until the file arrives, then charges only the real duration. A system with quotas can do the same: reserve the declared size against the quota at grant time, release the rest at confirm, and release everything when the session expires.

## Uploads From a Phone

On mobile, the upload outlives the screen that started it. Hand it to the platform's background transfer service: on iOS a background `URLSession` keeps transfers running while the app is suspended, but only uploads from a file survive the app exiting, so write the file to disk first; on Android, WorkManager persists work across restarts with constraints and backoff. Key the upload by content hash so a retry continues instead of duplicating, and let the record that references the file sync before the file does, marked pending until it arrives ([Attachments on a Separate Lane](/docs/architecture/offline-sync#attachments-on-a-separate-lane)).

## Uploads by URL

"Import from a link" inverts the flow: your server fetches the bytes, which makes it a server-side request forgery target. Run the fetcher outside your network, refuse private and link-local addresses after DNS resolution, follow a bounded number of redirects, and enforce the same size cap while streaming ([API7:2023 Server Side Request Forgery](/docs/security/api-security#api7-2023-server-side-request-forgery)).

## Checking What Arrived

Validation answers one question: is this a file of an allowed kind, within limits, that your own decoders can safely read? Each layer is cheap to fool on its own.

- **Don't trust the name or the declared type.** OWASP treats the client's `Content-Type` as a hint, not a control, and magic-byte checks as easy to bypass on their own. Keep both the declared type and the type detected from the bytes; a mismatch is worth logging. The real test is decoding the file with your own decoder, under limits.
- **Allowlist formats per purpose.** An avatar needs JPEG, PNG, WebP and HEIC; it doesn't need SVG, TIFF or PDF. Every format accepted is a decoder kept patched.
- **Cap bytes, pixels and time separately.** A file's size says little about what it costs to process. A decompression bomb is a small file that decodes into an enormous image; Pillow's `MAX_IMAGE_PIXELS` defaults to 89,478,485 pixels and raises `DecompressionBombError` above twice that. Set your own cap below the library's and check the declared dimensions before allocating anything. Cap animation by total pixels across frames, video by duration, resolution and frame rate, and archives by decompressed size, if you accept archives at all (OWASP recommends not accepting ZIP files).
- **Decode in a sandbox.** No network, a read-only filesystem, and CPU, memory and wall-clock limits per file. A worker that crashes or times out rejects the file and never takes the queue down. Decoders are internet-facing code even in a queue worker, so patch them on the vulnerability clock ([Remediation Targets](/docs/security/vulnerability-management#remediation-targets)).
- **Re-encode, don't pass through.** Serving pixels you decoded and re-encoded removes most of what a crafted file carries and strips metadata on the way. OWASP's caveat stands: rewriting "does not guarantee that all malicious content is removed," so the decoder doing it still needs the sandbox.
- **Treat SVG as active content.** It's XML that can carry scripts and external references. Rasterize it, or serve it only from a separate cookieless origin with a strict content security policy.
- **Files that are only files** (documents, archives, binaries) can't be re-encoded. Scan them with antivirus where available and serve them with `Content-Disposition: attachment` from a separate domain, so a browser never renders them in your origin.

## Received Is Not Usable

Every vendor returns something that exists but isn't ready: a draft record, a `202 Accepted`, an asset waiting for a webhook. Model it the same way. A file record moves `uploading → processing → ready`, or to `rejected` with a reason, and nothing else in the system may reference a file that isn't `ready`. Any check the business needs before a file is shown to anyone (malware scanning, content moderation, hash matching) is a step in `processing`, so it can't be skipped by a code path that forgot to call it. The client shows "processing" until the record says otherwise, by webhook, polling or a realtime event.

## Checklist

- Bytes go straight to storage on a scoped, short-lived credential; the application only grants and confirms.
- The server generates storage keys and bounds the size at the storage layer.
- Originals land in private storage; only processed output is served.
- Large files use a resumable protocol, resume from the server's offset, and checksum the whole file.
- Every session expires and a sweeper cleans up, including abandoned multipart parts.
- "Create upload" is idempotent, and quota is reserved at grant and reconciled at confirm.
- Mobile uploads run on the background transfer service from a file on disk.
- URL imports are fetched outside the network with SSRF protections.
- Formats are allowlisted per purpose; bytes, pixels and duration are capped separately; decoding runs sandboxed; images are re-encoded.
- Nothing references a file until it's `ready`, and every required check is a step on the way there.

## References

**Specifications**

- [tus: Resumable upload protocol 1.0](https://tus.io/protocols/resumable-upload), `HEAD` and `Upload-Offset`, `PATCH`, `409 Conflict` on offset mismatch, the creation, expiration, checksum, termination and concatenation extensions
- [tus: Implementations](https://tus.io/implementations), the official clients for the browser (tus-js-client), iOS (TUSKit) and Android

**Reference**

- [Amazon S3: Download and upload objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html), presigned URLs as bearer tokens, reuse until expiry, the 7-day limit, expiry with temporary credentials, expiry checked at request start
- [Amazon S3: Uploading objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html), uploads replacing an existing object at the same key
- [Amazon S3: Uploading and copying objects using multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html), parts 1 to 10,000, the 100 MB recommendation, no expiry, parts billed until completed or aborted, `AbortIncompleteMultipartUpload`, full-object checksums and `BadDigest`
- [Google Cloud Storage: Resumable uploads](https://docs.cloud.google.com/storage/docs/resumable-uploads), session URIs as authentication tokens, one-week sessions, 256 KiB buffer multiples
- [Google Cloud Storage: HTTP headers and query string parameters](https://docs.cloud.google.com/storage/docs/xml-api/reference-headers), `x-goog-content-length-range` and the `400` it returns
- [YouTube Data API: Resumable uploads](https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol), the empty `PUT` status check, `308 Resume Incomplete` and `Range`, 256 KB chunks, backoff on `500` to `504`, `404` for expired sessions
- [Cloudflare Images: Direct Creator Upload](https://developers.cloudflare.com/images/upload-images/direct-creator-upload/), one-time upload URLs, the 30-minute default expiry and the two-minute to six-hour range
- [Cloudflare Stream: Direct creator uploads](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/), `maxDurationSeconds` reservations
- [Mux: Upload files directly](https://www.mux.com/docs/guides/upload-files-directly), authenticated resumable URLs and their CORS origin
- [Pillow: Image module](https://pillow.readthedocs.io/en/stable/reference/Image.html), `MAX_IMAGE_PIXELS` of 89,478,485 and `DecompressionBombError` at twice the limit
- [Apple: Downloading files in the background](https://developer.apple.com/documentation/foundation/downloading-files-in-the-background), background sessions continuing while suspended, and file-only uploads after the app exits
- [Android Developers: Persistent work](https://developer.android.com/develop/background-work/background-tasks/persistent), WorkManager persistence across restarts, constraints and backoff

**Security**

- [OWASP: File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), extension allowlists, untrusted content types, limits of signature checks, generated names, separate hosts, image rewriting and its limits, antivirus, ZIP files and decompressed size
