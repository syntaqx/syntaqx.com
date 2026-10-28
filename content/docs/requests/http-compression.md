+++
title = "HTTP Compression"
description = "Accept-Encoding and Vary, gzip, Brotli and zstd trade-offs, precompressed static assets, dictionaries, BREACH, and capping decompressed request bodies."
category = "Requests & Responses"
order = 310
tags = ["api", "http", "compression", "performance", "security"]
+++

Text compresses well and the network is the slow part, so most text responses should cross it compressed. HTTP does this through content codings: the client lists what it can decode in `Accept-Encoding`, the server picks one and labels the body with `Content-Encoding`, and every cache in between has to keep the variants apart. The mechanism is defined in [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110). The decisions that matter are which algorithm, at what level, for which responses, in which layer, and which responses must never be compressed at all.

## Content Negotiation

```http
GET /app.js HTTP/2
Accept-Encoding: gzip, deflate, br, zstd
```

```http
HTTP/2 200
Content-Type: text/javascript
Content-Encoding: br
Vary: Accept-Encoding
```

`Accept-Encoding: gzip, deflate, br, zstd` is what MDN shows a browser sending on navigation. The rules from RFC 9110:

- **q-values rank the choices.** `br;q=1.0, gzip;q=0.8, *;q=0.1` prefers Brotli, then gzip, then anything. A coding with no `q` weighs 1; `q=0` means "not acceptable".
- **`identity` (no coding) is always acceptable** unless the client excludes it with `identity;q=0` or `*;q=0`. An empty `Accept-Encoding` means the client wants no coding at all; a request with no `Accept-Encoding` header accepts any coding.
- **When nothing matches,** the server sends the response uncompressed, unless the client has ruled out identity too. Not compressing is always a valid answer.
- **`Content-Encoding` describes the representation,** not the transfer. Headers about the body (`Content-Length`, `ETag`, `Content-Range`) describe the encoded bytes. Hop-by-hop compression through `TE` and `Transfer-Encoding` exists, but MDN notes it is rarely used, and those headers mostly carry chunked framing.
- **`deflate` is a trap.** The coding means a zlib wrapper (RFC 1950) around a deflate stream (RFC 1951), and RFC 9110 notes that some non-conformant implementations send raw deflate without the wrapper. gzip (RFC 1952) uses the same algorithm with a CRC-32 and no ambiguity, so my default is never to produce `deflate` and to offer gzip in its place.

## Vary and the Cache Key

A compressed response is a different representation of the same URL. Without `Vary: Accept-Encoding`, a shared cache can store the Brotli variant and hand it to a client that only decodes gzip. RFC 9110 defines `Vary` as expanding the cache key: a stored response can serve a later request only if that request has the same values for the listed headers. Every response that was negotiated on encoding carries `Vary: Accept-Encoding`, including the uncompressed one ([Caching & Conditional Requests](/docs/requests/caching#vary)).

Two consequences follow:

- **Raw `Accept-Encoding` values fragment the cache.** Clients send different strings, and a cache keyed on the literal header stores one copy per distinct string. A cache in front of the application should normalize the header into the few codings the origin actually produces before keying on it.
- **Validators differ per encoding.** RFC 9110's example of a weak validator is one an origin sends unchanged for the gzip and uncompressed representations: the bytes differ, so a strong `ETag` cannot be shared. Either each encoding gets its own strong `ETag`, or the shared one is weak ([weak ETags](/docs/requests/caching#validators-etag-and-last-modified)). Middleware that compresses on the fly typically weakens it for you, as Django's `GZipMiddleware` does. A weak `ETag` is fine for `If-None-Match`, but `If-Match` compares strongly, so an endpoint that takes conditional writes needs its strong validator computed on the uncompressed representation and carried through.

## Choosing an Algorithm

| Coding | Specification | Levels | Notes |
| ------ | ------------- | ------ | ----- |
| `gzip` | RFC 1952 (deflate, RFC 1951) | 1 to 9 | Universal; the fallback every client decodes |
| `br` | RFC 7932 | 0 to 11 | Built-in static dictionary; window up to 16 MiB |
| `zstd` | RFC 8878, RFC 9659 | up to 22; default 3 | Fast at moderate levels; 8 MB window for HTTP |

- **Brotli** ships a static dictionary of 122,784 bytes in the format itself, and each dictionary word has 121 transformed forms, so even a small text response finds matches before it has any history. Its sliding window runs from 1 KiB to 16 MiB (minus 16 bytes in each case). The highest qualities cost the most CPU to compress, which makes them right for anything compressed once and served many times.
- **Zstandard** is tuned for speed. [RFC 9659](https://www.rfc-editor.org/rfc/rfc9659) (September 2024) requires HTTP decoders to support a window of up to 8 MB and forbids encoders from needing more, because browsers cap decoder memory and larger frames would fail to decode.
- **Measured trade-off.** In Cloudflare's Q3 2024 production test at zstd's default level 3, average compression ratios were 2.56:1 for gzip, 2.86:1 for zstd and 3.08:1 for Brotli, and zstd compressed in an average 0.848 ms against Brotli's 1.544 ms. Brotli still produced the smaller output; zstd's advantage is CPU per request.
- **Support for `zstd`, as of October 2026,** per caniuse: Chrome and Edge from 123, Firefox from 126, Opera from 109; Safari 26 is marked as partial support, and Samsung Internet doesn't support it. Clients that don't advertise it get Brotli or gzip, so offering it costs nothing.

My default: precompressed Brotli at quality 11 for static assets, zstd or Brotli at a moderate level for dynamic responses, gzip for every client that advertises nothing better.

## Static and Dynamic Responses

**Static assets are compressed once, at build time, at the maximum level.** The cost is paid once in CI, never per request. The build writes `app.3f9a1c.js.br`, `.zst` and `.gz` beside the original, and the server picks the variant the client accepts: nginx's `gzip_static` and `brotli_static` serve `.gz` and `.br` files when they exist. nginx recommends giving the original and compressed files the same modification time, so validators derived from it agree. Content-hashed names plus `immutable` caching mean each variant is compressed once and downloaded once per client ([Web Performance](/docs/frontend/web-performance#caching)).

**Dynamic responses are compressed per request at a moderate level.** Whatever a higher level costs is paid again on every request. The defaults reflect that: nginx's `gzip_comp_level` is 1, ngx_brotli's `brotli_comp_level` is 6, and zstd's default level is 3. My default is the server's default level for dynamic responses, raised only when a measurement says the bytes saved are worth the CPU. Node's documentation adds a warning that applies everywhere: compression is expensive, so cache its results instead of compressing the same bytes repeatedly.

## Streaming Responses

A compressor buffers input to find matches, which is the opposite of what a streamed response wants. Server-sent events, streamed HTML, and an incremental model or log output can sit in the compressor's buffer while the client waits.

- **Flush after each meaningful chunk.** Node's `.flush()` on a compression stream returns as much output as possible "at the cost of degraded compression quality"; every compression library has an equivalent. A framework that compresses for you needs to flush when the application flushes.
- **Or don't compress the stream.** For a stream of small events where latency is the point, sending it uncompressed is a reasonable choice.
- **Errors after the first byte can't change the status.** Once a `200` has started, Node's guidance is to end the response and log the error; the client sees a truncated body, and Node's own decoders throw on truncated compressed input by default.

## What Not to Compress

- **Already-compressed formats.** JPEG, PNG, WebP, AVIF, video, audio, zip, gzip archives, and WOFF2 fonts are compressed by their format. MDN warns that compressing them again "can increase the file size." Compress by content-type allowlist (text, JSON, JavaScript, CSS, SVG, XML, WebAssembly), not by denylist.
- **Tiny responses.** Below a few hundred bytes the coding's framing and the CPU outweigh the saving. The thresholds vary: nginx's `gzip_min_length` defaults to 20 bytes, Cloudflare skips responses under 48 bytes for gzip and 50 for Brotli and zstd, and Django's `GZipMiddleware` skips bodies under 200 bytes. Note that nginx judges size only from `Content-Length`.
- **Responses that mix secrets with attacker input,** covered in the BREACH section below.

**Compression is CPU an attacker can spend.** Each request for a large dynamic response at a high level makes the server spend work the attacker doesn't. Keep dynamic levels moderate, put expensive endpoints behind [rate limits](/docs/requests/rate-limiting), and be ready to stop compressing under load: identity is always acceptable, and MDN cites Microsoft's guidance not to compress when the server is above 80% CPU.

## Compression Dictionaries

A shared dictionary lets a response be compressed against bytes the client already has, usually the previous version of the same file. [RFC 9842](https://www.rfc-editor.org/rfc/rfc9842), Compression Dictionary Transport, is a Proposed Standard published in September 2025.

```http
HTTP/2 200
Content-Type: text/javascript
Use-As-Dictionary: match="/js/app.*.js"
Cache-Control: public, max-age=31536000, immutable
```

```http
GET /js/app.7c2e10.js HTTP/2
Accept-Encoding: gzip, br, zstd, dcb, dcz
Available-Dictionary: :pZGm1Av0IEBKARczz7exkNYsZb8LzaMrV7J32a2fFG4=:
```

```http
HTTP/2 200
Content-Encoding: dcb
Vary: accept-encoding, available-dictionary
```

- **`Use-As-Dictionary`** on a response marks it as a dictionary for future requests whose URL matches the `match` pattern (a URL Pattern, no regular expressions), optionally narrowed by `match-dest`, with an optional `id` the client echoes back in `Dictionary-ID`.
- **`Available-Dictionary`** carries the SHA-256 hash of the single best-matching dictionary the client holds.
- **`dcb` and `dcz`** are dictionary-compressed Brotli and Zstandard. A `dcb` body starts with a 36-byte header (a 4-byte magic number and the 32-byte hash); a `dcz` body starts with a 40-byte header built as a zstd skippable frame. The server must only use the dictionary named by that hash.
- **Rules:** HTTPS only; the dictionary and the response must be same-origin, or readable through CORS; cacheable responses carry `Vary: accept-encoding, available-dictionary`; and clients treat stored dictionaries like cookies, clearing them together, because a dictionary's hash could otherwise be a tracking identifier. `Link: <...>; rel="compression-dictionary"` lets a page point the browser at a dictionary to fetch ahead of time.
- **Support:** Chrome shipped it in Chrome 130, and Chromium browsers including Edge follow. MDN marks it experimental and not Baseline as of October 2026, so it's an enhancement on top of Brotli and zstd, never a requirement. Google reports a 23% average reduction in Search's HTML payload against plain Brotli.

Dictionaries are worth it for large, frequently updated bundles fetched by repeat visitors, and for HTML that shares a template. A build can produce the delta files ahead of time, which keeps the per-request cost at zero.

## BREACH and Secrets in Compressed Responses

Compression leaks information through size. If a response contains a secret and also reflects input the attacker controls, a guess that matches part of the secret compresses better, and the attacker, watching encrypted response lengths, extracts the secret a character at a time. CRIME (2012) did this against TLS-level compression and ended it. BREACH, presented at Black Hat USA 2013, does the same against HTTP compression of the body, and [RFC 7457](https://www.rfc-editor.org/rfc/rfc7457) notes there is no TLS-level mitigation for it. A response is exposed when all three hold:

1. It is compressed.
2. It reflects user input (a query parameter, a form field, a search term).
3. It contains a secret (a CSRF token, an API key, personal data).

Mitigations, removing any one condition:

- **Keep secrets and reflected input out of the same compressed body.** Serve tokens and keys from their own uncompressed endpoint, not inline in a page that echoes the query.
- **Mask per response.** Django scrambles its CSRF form value with a fresh random mask on every render and compares only the underlying secret; the bytes differ every time, so there's nothing stable to guess ([CSRF](/docs/security/authentication#csrf)).
- **Don't compress sensitive endpoints:** pages that show an API key or a one-time secret, and endpoints that echo input next to account data.
- **Pad lengths** where the rest isn't possible. Django's `GZipMiddleware` implements Heal the BREACH, adding up to 100 random bytes per response. Padding raises the attacker's request count; it doesn't remove the leak.
- **Rate limit,** since the attack needs many requests.

## Compressed Request Bodies

Clients can send `Content-Encoding: gzip` on a request body, and a JSON upload of logs or events shrinks well. The danger is on the receiving side: a few kilobytes of gzip can expand to gigabytes. Body parsers often inflate by default (Express's body-parser inflates gzip, deflate and Brotli unless told not to), and Node's convenience decompression functions default their `maxOutputLength` to the largest buffer the runtime allows.

- **Cap the decompressed size,** not just the bytes on the wire, and stop inflating the moment the cap is crossed, answering `413 Content Too Large`.
- **Accept only the codings you need.** An unsupported coding gets `415 Unsupported Media Type` with an `Accept-Encoding` header listing the ones the server takes, as RFC 9110 specifies.
- **Inflate in a streaming fashion,** never buffering the whole decoded body before checking it.
- **Archives are uploads.** A zip or tarball is a file, not a content coding, and its decompressed size and entry count are checked as in [File Uploads](/docs/architecture/file-uploads#checking-what-arrived).

## Where Compression Runs

Compress in exactly one layer, as close to the client as possible: the CDN or reverse proxy for dynamic responses, the build for static ones. Running it in the application as well creates the familiar bugs:

- **Double compression.** The application gzips, the proxy gzips again, and the client decodes once and gets binary. A layer that compresses must skip any response that already has `Content-Encoding`, as Django's middleware does.
- **Lost headers.** An edge that compresses may drop `Content-Length`, since it no longer knows the final size; Cloudflare documents this, and `Cache-Control: no-transform` from the origin stops it re-encoding.
- **What the origin sees.** CDNs fetch from the origin with their own `Accept-Encoding` (Cloudflare sends `br, gzip`), keep the origin's compression when the client supports it, and otherwise decode and re-encode. Check what your CDN does with each coding, and which status codes it compresses: Cloudflare compresses only `200`, `403` and `404`.
- **`Content-Length` versus streaming.** A precompressed file has a known length. An on-the-fly compressed response usually doesn't, so HTTP/1.1 sends it chunked and HTTP/2 and HTTP/3 rely on their own framing. A client that needs the total size for a progress bar gets it only from precompressed or buffered responses.

## Measuring It

The question is always transfer size against resource size. Chrome DevTools' Network panel shows both: with big request rows enabled, the top of the Size column is the bytes transferred (headers plus encoded body) and the bottom is the decoded size, and the status bar totals each. In the field, the Resource Timing API exposes `encodedBodySize` (before decoding) and `decodedBodySize` (after); when they're equal and nonzero, the resource arrived uncompressed. `curl --compressed -v` shows the `Content-Encoding` a server chose. A JavaScript budget should be set on the compressed size, the one users pay for ([Budgets in CI](/docs/frontend/web-performance#budgets-in-ci)).

## APIs

JSON compresses well, and API responses are dynamic, so they take the moderate-level, per-request path. Compress list endpoints and large documents; leave small responses alone below the threshold. API clients have to ask: not every HTTP client sends `Accept-Encoding` or decodes the response by default, so an SDK sets `Accept-Encoding: br, gzip` (or `zstd`) and decodes for the caller ([SDK Design](/docs/api-design/sdk-design)). BREACH applies to APIs too, whenever a response echoes request input next to a token or key. gRPC compresses per message rather than per response: peers advertise what they accept in `grpc-accept-encoding`, compression can be turned off for an individual message, and an unsupported encoding fails the call with `UNIMPLEMENTED`.

## Checklist

- Text types are compressed by content-type allowlist; images, video, archives and fonts are not.
- Every negotiated response carries `Vary: Accept-Encoding`, and caches normalize the header.
- Strong ETags differ per encoding, or the shared one is weak; conditional writes use a strong validator.
- Static assets are precompressed at build time at maximum level, in Brotli, zstd and gzip.
- Dynamic responses use a moderate level; nobody raises it without a measurement.
- Streamed responses flush, or aren't compressed.
- Responses below a small threshold are sent uncompressed.
- Compression runs in one layer, which skips responses that already have `Content-Encoding`.
- No compressed response holds a secret next to reflected input; CSRF tokens are masked per response.
- Compressed request bodies are capped by decompressed size; unsupported codings get `415`.
- Dictionaries, if used, are an enhancement with Brotli and zstd as the fallback.
- Transfer size and decoded size are both measured, and budgets are set on the compressed one.

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110), `Content-Encoding`, `Accept-Encoding` q-values and identity, `415` with `Accept-Encoding`, `Vary` and the cache key, the gzip weak-validator example, non-conformant raw `deflate`
- [RFC 1951: DEFLATE Compressed Data Format](https://www.rfc-editor.org/rfc/rfc1951), the algorithm under gzip and deflate
- [RFC 1952: GZIP File Format](https://www.rfc-editor.org/rfc/rfc1952), the gzip container
- [RFC 7932: Brotli Compressed Data Format](https://www.rfc-editor.org/rfc/rfc7932), the 122,784-byte static dictionary, 121 word transforms, 1 KiB to 16 MiB windows, the `br` coding
- [RFC 8878: Zstandard Compression and the application/zstd Media Type](https://www.rfc-editor.org/rfc/rfc8878), the `zstd` coding
- [RFC 9659: Window Sizing for Zstandard Content Encoding](https://www.rfc-editor.org/rfc/rfc9659), the 8 MB window requirement for HTTP and why
- [RFC 9842: Compression Dictionary Transport](https://www.rfc-editor.org/rfc/rfc9842), `Use-As-Dictionary`, `Available-Dictionary`, `Dictionary-ID`, `dcb` and `dcz` headers, HTTPS and same-origin rules, `Vary`, `rel=compression-dictionary`, cookie-like clearing
- [RFC 7457: Summarizing Known Attacks on TLS](https://www.rfc-editor.org/rfc/rfc7457), CRIME, BREACH, and no TLS-level mitigation for BREACH

**Reference**

- [MDN: Compression in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression), not recompressing compressed formats, `Vary: Accept-Encoding`, end-to-end versus hop-by-hop
- [MDN: Accept-Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Encoding), the browser's header, q-value example, identity, skipping compression under load and the 80% CPU guidance
- [MDN: Content-Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding), the codings including `dcb` and `dcz`, compressed media growing
- [MDN: Compression Dictionary Transport](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression_dictionary_transport), experimental status, delta and common-strings dictionaries, building `dcb` and `dcz` files
- [MDN: PerformanceResourceTiming.encodedBodySize](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/encodedBodySize), encoded versus decoded body size in the field
- [caniuse: zstd](https://caniuse.com/zstd), `zstd` content-encoding support by browser as of October 2026
- [Chrome DevTools: Network features reference](https://developer.chrome.com/docs/devtools/network/reference), transferred versus uncompressed size in the Size column
- [Node.js: zlib](https://nodejs.org/api/zlib.html), zstd default level 3, `.flush()` and its cost, caching compression results, `maxOutputLength` default, errors after a `200` has started
- [nginx: ngx_http_gzip_module](https://nginx.org/en/docs/http/ngx_http_gzip_module.html), levels 1 to 9, default level 1, `gzip_min_length` 20 from `Content-Length`
- [nginx: ngx_http_gzip_static_module](https://nginx.org/en/docs/http/ngx_http_gzip_static_module.html), serving precompressed `.gz` files, matching modification times
- [Google: ngx_brotli](https://github.com/google/ngx_brotli), Brotli levels 0 to 11, default level 6, `brotli_static`
- [Express: body-parser](https://github.com/expressjs/body-parser), inflating compressed request bodies by default, `413` and `415` errors
- [gRPC: Compression](https://grpc.io/docs/guides/compression/), per-message compression, `grpc-accept-encoding`, `UNIMPLEMENTED` on unsupported encodings

**Security**

- [BREACH](https://www.breachattack.com/), the three conditions, mitigations in order of effectiveness, Black Hat USA 2013
- [Django: Cross Site Request Forgery protection](https://docs.djangoproject.com/en/stable/ref/csrf/), per-response masking of the CSRF token against BREACH
- [Django: Middleware](https://docs.djangoproject.com/en/stable/ref/middleware/), `GZipMiddleware` 200-byte minimum, skipping already-encoded responses, weak ETags, Heal the BREACH padding up to 100 bytes
- [OWASP: File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), checking decompressed size of archives

**In practice**

- [Cloudflare: Content compression](https://developers.cloudflare.com/speed/optimization/content/compression/), gzip, Brotli and zstd to visitors, 48 and 50 byte minimums, `br, gzip` to origins, status codes compressed, dropped `Content-Length` and `no-transform`
- [Cloudflare: New standards for a faster and more private Internet](https://blog.cloudflare.com/new-standards/), the Q3 2024 gzip, zstd and Brotli ratios and compression times at zstd level 3
- [Chrome for Developers: Improving Google Search with Compression Dictionaries](https://developer.chrome.com/blog/search-compression-dictionaries), shipping in Chrome 130, the 23% HTML reduction against Brotli
