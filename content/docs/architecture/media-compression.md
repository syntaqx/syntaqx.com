+++
title = "Media Compression"
description = "Lossless and lossy coding, the pipeline image and video codecs share, generation loss, formats by content class, perceptual metrics, and what encoding costs."
category = "Architecture"
order = 424
tags = ["architecture", "images", "video", "compression", "performance"]
+++

Images and video are most of the bytes a typical product serves, and the encoder settings behind them are usually a default nobody chose. The choices that matter are few: which content may lose information and which must not, which format suits which kind of picture, what quality target to hold, which file every output is derived from, and when the encoding work happens. Each one is cheap to get right at the start and expensive to fix across a catalog later.

## Lossless and Lossy

**Lossless** compression guarantees the decoder reproduces the input bit for bit. The PNG specification defines it that way ("reconstruction of the original data exactly, bit-for-bit"), as JPEG's does ("the output of the decoding procedure(s) is identical to the input"). It wins by removing redundancy, never information, so its gains depend on how predictable the content is: large on screenshots and flat graphics, small on camera noise.

**Lossy** compression guarantees only that the result looks close to the input. It discards what a viewer is unlikely to notice and then removes redundancy from what's left, which is why it reaches ratios lossless coding can't: the JPEG XL committee gives 20:1 to 50:1 as typical for its lossy mode. A lossy file can't be turned back into the original, and the loss isn't a fixed amount: it depends on the encoder, its settings and the content.

## How Lossless Coding Works

Lossless codecs are built from two stages.

- **Prediction.** The encoder guesses each value from neighbors already coded and stores only the error, which on real images clusters around zero. PNG filters each scanline with one of five predictors (None, Sub, Up, Average, Paeth), chosen per line; JPEG's lossless mode predicts each sample from up to three reconstructed neighbors; lossless WebP chooses among 13 predictor modes per block and adds a cache of recently used colors.
- **Entropy coding.** The prediction errors are then coded so common values take fewer bits. **Huffman coding** assigns each symbol a whole number of bits, which approximates probabilities with powers of two; **arithmetic coding** codes a whole sequence as one number and gets closer to the theoretical limit at more compute; **asymmetric numeral systems (ANS)**, introduced by Jarek Duda in 2013, aim for arithmetic coding's compression at speeds close to Huffman's. All three appear in shipping formats: PNG uses Deflate (LZ77 matching plus Huffman codes, in a window of at most 32,768 bytes), JPEG allows Huffman or arithmetic coding, WebP's lossy mode uses boolean arithmetic coding, which Google credits with a 5% to 10% gain over Huffman, and Zstandard pairs Huffman for literals with FSE, an ANS-based coder, for everything else.

Entropy coding is lossless in every codec, lossy ones included. It's the last stage of the lossy pipeline too.

## The Lossy Pipeline

JPEG, WebP, AVIF and the video codecs differ in detail, but they share one pipeline:

1. **Color transform.** RGB is converted to a luma channel (Y) and two chroma channels (Cb, Cr), because vision is more sensitive to brightness detail than to color detail. MDN describes JPEG's compression as first converting the image to Y'UV.
2. **Chroma subsampling.** The chroma channels are stored at lower resolution. In **4:4:4** every pixel keeps its own color; in **4:2:2** chroma is halved horizontally; in **4:2:0** it's halved in both directions, so one color sample serves four pixels. Lossy WebP is 8-bit 4:2:0, per MDN. Subsampling is invisible on most photographs and visible as smeared color on red text, thin colored lines and UI screenshots.
3. **Prediction and block transform.** The image is split into blocks, optionally predicted from neighboring blocks, and each block (or prediction residual) is transformed into frequency coefficients. JPEG transforms 8x8 blocks with the discrete cosine transform (DCT) into 64 coefficients, one DC and 63 AC; WebP's lossy mode, based on VP8 intra coding, predicts 4x4 and 16x16 luma blocks and 8x8 chroma blocks before a DCT. The transform itself loses nothing (apart from rounding); it concentrates the energy of smooth areas into a few low-frequency coefficients.
4. **Quantization.** Each coefficient is divided by a step size and rounded. **This is where information is discarded**, and it's the step a quality setting controls. Google's WebP documentation calls quantization the only lossy step; JPEG uses a table of 64 step sizes, one per coefficient, which encoders choose because the standard specifies no default. Larger steps for high frequencies remove fine detail first; too large a step anywhere produces blocking, banding and ringing.
5. **Entropy coding.** The quantized coefficients, mostly zeros after quantization, are coded losslessly as above.

**Video adds inter-frame prediction.** Consecutive frames are mostly the same picture, so most frames are coded as differences from others. AWS's MediaConvert documentation sets out the frame types: **I-frames** (intra-coded) decode on their own and take the most bits; **IDR frames** are I-frames that nothing after them may reference across; **P-frames** code differences from earlier frames; **B-frames** code differences from frames before and after and take the fewest bits. A **group of pictures (GOP)** runs from one IDR frame to the next, typically 1 to 2 seconds, and streaming formats require the segment length to be a multiple of the GOP, because a player can only start or switch renditions at an IDR frame. Longer GOPs compress better and seek worse.

## Generation Loss

Every lossy encode adds its own error to whatever error the input already had, and the next encoder can't tell an earlier artifact from detail it should preserve. Re-encoding a lossy file therefore compounds the loss, worse when the second encode uses a different codec, scale or quality, and a resize or crop between encodes moves the block grid, so the old artifacts get coded again as detail.

My rules:

- **Keep the original (the mezzanine) and derive every output from it,** never from a previous output. A thumbnail comes from the original, not from the large variant; a new format added next year is encoded from the original, not transcoded from today's WebP.
- **Transcode once per output.** Do every resize, crop, rotation and color conversion on decoded pixels, then encode once at the end.
- **Store the mezzanine at the quality you received it,** or losslessly if you must normalize it. The original is also the file you go back to when an encoder improves, a format arrives, or a bug in a variant needs regenerating ([Checking What Arrived](/docs/architecture/file-uploads#checking-what-arrived) covers keeping it private).
- **Treat lossless-to-lossless as free and lossy-to-lossy as a cost.** One exception is worth knowing: JPEG XL can recompress an existing JPEG losslessly and restore the exact original JPEG, so it doesn't count as a generation.

## Choosing a Format by Content Class

A format is a choice per kind of picture, not per site. MDN's guidance and the format specifications line up on the classes:

| Content | Default | Why |
| --- | --- | --- |
| **Photographs** and other continuous tone | AVIF or WebP, JPEG as the fallback | Lossy coding is invisible on camera noise and texture; MDN recommends WebP or AVIF with JPEG behind them |
| **Screenshots, text, line art, UI** | PNG or lossless WebP; near-lossless WebP where the bytes matter | MDN: blurring and colored fringes around text and sharp edges are very visible under lossy coding, and 4:2:0 smears colored text |
| **Transparency** | PNG, WebP, AVIF or JPEG XL | JPEG has no alpha channel; AVIF stores alpha as an auxiliary image at the main image's bit depth |
| **Animation** | Video (MP4 or WebM), or animated AVIF or WebP | GIF is 8-bit indexed color and compresses animation poorly; web.dev's example turns a 3.7 MB GIF into a 551 KB MP4 and a 341 KB WebM |
| **Diagrams and icons that must scale** | SVG | Vector content is drawn exactly at any size; but SVG is active content: rasterize user-supplied SVG or serve it from a separate cookieless origin ([Checking What Arrived](/docs/architecture/file-uploads#checking-what-arrived)) |
| **HDR and wide gamut** | AVIF (8, 10 or 12 bits, HDR and wide color gamut), JPEG XL, or PNG with a `cICP` chunk | JPEG is 8 bits per component; lossy WebP is 8-bit only |

Notes on the edges of the table:

- **Near-lossless** is a middle path for graphics: cwebp's `-near_lossless` adjusts pixel values slightly to make them more predictable, then codes them losslessly, so edges stay sharp and the file shrinks. Its default of 100 means no preprocessing; lower values trade more change for fewer bytes.
- **Detect the class, don't ask for it.** Few colors and hard edges suggest a screenshot; an alpha channel that's fully opaque isn't transparency and can be dropped. Record the detected class with the output so a later re-encode makes the same choice.
- **HDR is a pipeline, not a format.** The PNG Third Edition (a W3C Recommendation since 24 June 2025) and AVIF both signal HDR transfer functions and mastering metadata, but every step that touches the pixels has to carry the color space through; a resize in 8-bit sRGB in the middle clips the highlights the format was chosen to keep.
- **JPEG XL, as of October 2026,** is newly broad but not universal: caniuse shows support from Chrome 155 and Firefox 158 (both behind a flag in earlier versions), partial support in Safari from 17, and Edge as not supported, for global support of about 60%. MDN lists Edge 155 and still advises an AVIF, WebP or JPEG alternative in a `<picture>` element. It's the strongest format on paper (lossy and lossless, HDR, progressive decoding, lossless JPEG recompression; ISO/IEC 18181), and the one where a fallback is mandatory.

Serving more than one format per image is content negotiation, by `<picture>` markup or by the `Accept` header with `Vary: Accept` on the response ([Vary](/docs/requests/caching#vary)). The page-level rules (explicit dimensions, responsive sizes) are in [Web Performance](/docs/frontend/web-performance#images).

## Quality Settings and Metrics

**Quality numbers are not comparable across encoders.** A "quality 80" is an encoder's private scale: cwebp's `-q` defaults to 75, Cloudflare's image service defaults to 85, and libjxl prefers `--distance`, in units of just-noticeable difference, where 0 is lossless and 0.5 to 3.0 is the useful lossy range. The number isn't even the only knob: the SSIMULACRA 2 project's calibration reaches its "very high quality" score with libjpeg-turbo at quality 85 and 4:2:2 chroma, and "visually lossless" only at quality 95 with 4:4:4. A quality setting copied from one encoder to another, or used without its subsampling, is a guess. Even within one encoder, a fixed number spends too many bytes on easy images and damages hard ones, which is why vendors expose perceptual targets ("high", "medium") that choose a number per image.

Metrics turn the comparison into numbers:

| Metric | Measures | Use it for |
| --- | --- | --- |
| **PSNR** | Pixel error (mean squared error) in decibels | Regression tests, codec bugs; it correlates poorly with what viewers see |
| **SSIM** | Structural similarity between a reference and a distorted image (Wang et al., 2004) | A better proxy than PSNR; its authors showed images with equal MSE and very different perceived quality |
| **VMAF** | Netflix's fusion of several elementary metrics by a trained model, Emmy-winning | Video; the default model predicts quality on a 1080p TV viewed at three times the screen height, so other viewing conditions are outside what it was trained on |
| **SSIMULACRA 2** | A perceptual image metric scored up to 100 (90 is visually lossless in a flicker test, 70 high, 50 medium, 30 low) | Still images, tuning quality targets per format |
| **Butteraugli** | Google's estimate of perceived difference near the visibility threshold, with a per-pixel difference map | Research and high-quality tuning; the standalone repository was archived in November 2023 |

My rule: **metrics guide, eyes decide.** Build a test set that represents the catalog (faces, skies and gradients, foliage, text over images, screenshots, dark scenes), pick the perceptual target by looking at it side by side and at 1:1, then let a metric hold that target per image and catch regressions when an encoder or setting changes. A metric that was never checked against people looking at your own content is measuring something, just not necessarily your users' experience.

## Rate Control for Video

A video encoder spends bits either to hold a quality or to hit a size. **Constant quality** (CRF in x264, x265 and the AV1 encoders) keeps the quantizer roughly steady and lets the bitrate follow the content: static scenes are cheap, action is expensive, and file size is unknown until the encode ends. libaom's CRF runs 0 to 63, higher being lower quality and smaller files; combined with a bitrate target it becomes constrained quality, which caps the peaks. **Target bitrate** (constant or variable, often two-pass) hits a known size or a delivery cap and lets quality float, wasting bits on easy content and starving hard content. Streaming needs both properties at once (a quality goal and a ceiling a connection can sustain), which is why capped constant-quality modes exist and why a fixed bitrate ladder for every video is wasteful: a cartoon and a football match need very different bitrates for the same quality. Per-title encoding computes the ladder per video from trial encodes and a perceptual metric ([Encoding Ladders and Per-Title Encoding](/books/user-generated-platforms/video-on-demand#encoding-ladders-and-per-title-encoding)).

## Metadata and Orientation

Camera files carry EXIF and XMP metadata the uploader rarely sees, including GPS coordinates (the `GPSInfo` block, tag 0x8825) and device serial numbers. Served output should carry none of it by default: cwebp's `-metadata` defaults to `none`, and Cloudflare's default keeps only the EXIF copyright tag. Keep an allowlist (a copyright notice, provenance fields if you support them) rather than a denylist, and keep the full metadata only on the private original.

**Apply orientation before stripping.** Phones often store the sensor's frame and record rotation in the EXIF `Orientation` tag (0x0112, values 1 to 8: normal, mirrored, rotated 180 degrees, rotated 90 degrees clockwise, and the mirrored rotations). An output that drops the tag without rotating the pixels first comes out sideways. The order is: read orientation, rotate or mirror the pixels, convert the color profile into the output's color space, then strip. Cloudflare applies EXIF rotation and color profiles even when it discards metadata, for this reason. Privacy obligations on location data are in [Privacy by Design and by Default](/docs/compliance/gdpr#privacy-by-design-and-by-default).

## Encode Cost, Decode Cost and Bytes Saved

Compression moves cost between three parties: the encoder (CPU once, or once per variant), every viewer's decoder (CPU and battery, every view), and the network (bytes, every view). The newer formats save bytes by spending encode time: Cloudflare warns that AVIF encoding "can be an order of magnitude slower" than other formats and falls back to WebP or JPEG for images too large to encode quickly. Encoder effort settings make the same trade inside one format: cwebp's `-m` runs 0 to 6 (default 4), SVT-AV1's preset 0 to 13, with slower settings producing smaller files.

The arithmetic is per asset: encode cost is paid once per output, bytes saved are earned per view. That decides when to do the work:

- **Precompute** the outputs for assets that will be viewed many times (a feed image, a product photo, a published video), at the slow settings and the expensive formats, in a background job ([Background Jobs](/docs/architecture/background-jobs)).
- **Encode on demand** for the long tail, at fast settings, with the result cached; a cold-cache miss on a slow encoder is user-visible latency, so on-demand paths fall back to a cheaper format rather than waiting.
- **Re-encode the hot set** later when the economics change: a new format, a better encoder, a cheaper effort level. That's only possible because the original was kept.
- **Count decode cost on the weakest device you support.** A format that saves bytes but drains a low-end phone or lacks hardware video decoding there isn't a saving for that viewer.

The vendor patterns for eager versus on-demand variants are in [Variants: Eager or On Demand](/books/user-generated-platforms/images-at-scale#variants-eager-or-on-demand).

## Checklist

- Decide per content class whether loss is acceptable; screenshots, text and line art get a lossless or near-lossless path.
- Keep the original privately, derive every output from it, and encode each output exactly once after all pixel operations.
- Default to AVIF or WebP for photographs with JPEG as the fallback, video instead of GIF, and SVG only from trusted or sanitized sources.
- Serve newer formats (JPEG XL as of October 2026) only with a negotiated fallback, and `Vary` on whatever chose the format.
- Set quality per encoder against a perceptual target, never by copying a number between encoders.
- Pick the target by eye on a representative test set; use SSIMULACRA 2, VMAF or SSIM to hold it and catch regressions.
- Use constant quality with a bitrate cap for video, and per-title ladders where watch time pays for them.
- Apply orientation and color conversion, then strip metadata from every output by allowlist.
- Precompute expensive encodes for hot assets, encode the long tail on demand at fast settings, and re-encode from the original when formats or encoders improve.

## References

**Specifications**

- [ITU-T T.81: Digital compression and coding of continuous-tone still images (JPEG, PDF)](https://www.w3.org/Graphics/JPEG/itu-t81.pdf), lossy and lossless definitions, 8x8 blocks and the FDCT into 64 coefficients, quantization tables with no defaults, Huffman or arithmetic entropy coding, lossless prediction from three neighbors
- [W3C: Portable Network Graphics (PNG) Specification, Third Edition](https://www.w3.org/TR/png-3/), the bit-for-bit lossless definition, the five filter types, Deflate and its 32,768-byte window, `cICP` and HDR, APNG, Recommendation of 24 June 2025
- [AOMedia: AV1 Image File Format (AVIF) v1.2.0](https://aomediacodec.github.io/av1-avif/), AV1 images in HEIF, alpha as an auxiliary image at the same bit depth, 8, 10 and 12 bits, HDR and wide color gamut, image sequences
- [JPEG: JPEG XL overview](https://jpeg.org/jpegxl/), ISO/IEC 18181, lossy and lossless coding, lossless JPEG recompression, HDR and wide gamut, the 20:1 to 50:1 typical ratio
- [RFC 8878: Zstandard Compression and the application/zstd Media Type](https://www.rfc-editor.org/rfc/rfc8878.html), Huffman for literals and FSE, based on ANS, for other symbols

**Reference**

- [Google: WebP compression techniques](https://developers.google.com/speed/webp/docs/compression), VP8 intra prediction and block sizes, the DCT, quantization as the only lossy step, boolean arithmetic coding and its 5% to 10% gain over Huffman, lossless predictor modes, color cache and LZ77
- [Google: cwebp](https://developers.google.com/speed/webp/docs/cwebp), `-q` default 75, `-near_lossless` default 100, `-m` 0 to 6 default 4, `-metadata` default `none`
- [MDN: Image file type and format guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types), format capabilities, lossy WebP as 8-bit 4:2:0, JPEG's 8 bits and no alpha, recommendations by content class, JPEG XL browser versions and the fallback advice
- [MDN: Digital video concepts](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_concepts), Y'UV and YCbCr, JPEG converting to Y'UV, chroma subsampling 4:4:4, 4:2:2 and 4:2:0
- [Can I use: JPEG XL image format](https://caniuse.com/jpegxl), Chrome 155, Firefox 158, Safari partial from 17, Edge not supported, global share (October 2026)
- [libjxl](https://github.com/libjxl/libjxl), default lossless recompression of JPEG input, `--distance` in just-noticeable-difference units with 0 lossless and 0.5 to 3.0 useful
- [FFmpeg: Codecs documentation](https://ffmpeg.org/ffmpeg-codecs.html), libaom CRF 0 to 63 and constrained quality with a bitrate target, SVT-AV1 presets 0 to 13
- [AWS Elemental MediaConvert: Recommended encoding settings for video quality](https://docs.aws.amazon.com/mediaconvert/latest/ug/video-quality.html), I, IDR, P and B frames, GOP size of 1 to 2 seconds, segment length as a multiple of the GOP
- [ExifTool: EXIF tags](https://exiftool.org/TagNames/EXIF.html), `Orientation` (0x0112) and its eight values, `GPSInfo` (0x8825)
- [Cloudflare Images: Features](https://developers.cloudflare.com/images/optimization/features/), AVIF an order of magnitude slower to encode and its fallback, quality default 85 and perceptual levels, copyright-only metadata default, rotation and color applied when metadata is discarded
- [web.dev: Replace animated GIFs with video](https://web.dev/articles/replace-gifs-with-videos), the 3.7 MB GIF, 551 KB MP4 and 341 KB WebM

**Papers and metrics**

- [Duda: Asymmetric numeral systems (arXiv:1311.2540)](https://arxiv.org/abs/1311.2540), ANS combining Huffman-like speed with arithmetic coding's compression rate, November 2013
- [Wang, Bovik, Sheikh and Simoncelli: The SSIM index for image quality assessment](https://www.cns.nyu.edu/~lcv/ssim/), the IEEE Transactions on Image Processing paper (April 2004), equal-MSE images of very different quality, SSIM against PSNR
- [Netflix: VMAF](https://github.com/Netflix/vmaf), perceptual video quality by multi-method fusion, Emmy-winning
- [Netflix: VMAF FAQ](https://github.com/Netflix/vmaf/blob/master/resource/doc/faq.md), the default model's 1080p HDTV and 3H viewing conditions, design for adaptive streaming
- [Cloudinary: SSIMULACRA 2](https://github.com/cloudinary/ssimulacra2), the score scale and its meanings, encoder settings per score for libjpeg-turbo and cjxl
- [Google: Butteraugli](https://github.com/google/butteraugli), perceived difference near the visibility threshold, the difference map, tuning around JPEG quality 90 to 95, archived November 14, 2023
