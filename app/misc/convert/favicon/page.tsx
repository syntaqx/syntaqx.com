"use client";

import { useState, useRef, useCallback } from "react";
import NextImage from "next/image";
import { Upload, Download, Trash2, ImageIcon, Archive } from "lucide-react";
import { zipSync } from "fflate";

// --- ICO Encoder (client-side) ----------------------------------------------

const DEFAULT_SIZES = [16, 32, 48, 64, 128, 256];

async function renderToCanvas(
  src: string,
  size: number,
  isSvg: boolean,
): Promise<HTMLCanvasElement> {
  // For SVGs, re-create the blob URL with explicit dimensions so
  // the browser rasterizes at the target resolution instead of using
  // the (often tiny or undefined) intrinsic size.
  let imgSrc = src;
  if (isSvg) {
    const resp = await fetch(src);
    let svgText = await resp.text();

    // Strip existing width/height from the root <svg> so our overrides win
    svgText = svgText.replace(
      /(<svg[^>]*?)(\s+width\s*=\s*["'][^"']*["'])/gi,
      "$1",
    );
    svgText = svgText.replace(
      /(<svg[^>]*?)(\s+height\s*=\s*["'][^"']*["'])/gi,
      "$1",
    );

    // Inject explicit width/height
    svgText = svgText.replace(/(<svg)/i, `$1 width="${size}" height="${size}"`);

    const blob = new Blob([svgText], { type: "image/svg+xml" });
    imgSrc = URL.createObjectURL(blob);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, size, size);

      if (isSvg) {
        // SVG already sized to target, draw 1:1
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(imgSrc);
      } else {
        // Raster: center-crop the largest square from the source
        const srcSize = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - srcSize) / 2;
        const sy = (img.naturalHeight - srcSize) / 2;
        ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, size, size);
      }

      resolve(canvas);
    };
    img.onerror = () => {
      if (isSvg) URL.revokeObjectURL(imgSrc);
      reject(new Error(`Failed to render at ${size}x${size}`));
    };
    img.src = imgSrc;
  });
}

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Failed to encode PNG"));
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
    }, "image/png");
  });
}

function buildIco(images: { size: number; png: Uint8Array }[]): Blob {
  // ICO header: 6 bytes
  // Directory entries: 16 bytes each
  // Then PNG data

  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * images.length;
  let dataOffset = headerSize + dirSize;

  const totalSize =
    headerSize + dirSize + images.reduce((s, img) => s + img.png.byteLength, 0);
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // Header
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: 1 = ICO
  view.setUint16(4, images.length, true); // count

  // Directory entries + data
  for (let i = 0; i < images.length; i++) {
    const { size, png } = images[i];
    const entryOffset = headerSize + i * dirEntrySize;

    view.setUint8(entryOffset, size >= 256 ? 0 : size); // width (0 = 256)
    view.setUint8(entryOffset + 1, size >= 256 ? 0 : size); // height
    view.setUint8(entryOffset + 2, 0); // color palette
    view.setUint8(entryOffset + 3, 0); // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bits per pixel
    view.setUint32(entryOffset + 8, png.byteLength, true); // data size
    view.setUint32(entryOffset + 12, dataOffset, true); // data offset

    // Write PNG data
    const dataView = new Uint8Array(buffer, dataOffset, png.byteLength);
    dataView.set(png);
    dataOffset += png.byteLength;
  }

  return new Blob([buffer], { type: "image/x-icon" });
}

// --- Accepted formats -------------------------------------------------------

const ACCEPTED_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/avif",
  "image/tiff",
];

const ACCEPTED_EXTENSIONS =
  ".svg,.png,.jpg,.jpeg,.gif,.webp,.bmp,.avif,.tiff,.tif";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// --- Component --------------------------------------------------------------

export default function FaviconPage() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [sizes, setSizes] = useState<number[]>([...DEFAULT_SIZES]);
  const [previews, setPreviews] = useState<{ size: number; dataUrl: string }[]>(
    [],
  );
  const [pngData, setPngData] = useState<{ size: number; png: Uint8Array }[]>(
    [],
  );
  const [icoBlob, setIcoBlob] = useState<Blob | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(
        `Unsupported format: ${file.type || file.name.split(".").pop()}. Use SVG, PNG, JPG, GIF, WebP, BMP, AVIF, or TIFF.`,
      );
      return;
    }

    setError(null);
    setPreviews([]);
    setPngData([]);
    setIcoBlob(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => setSourceUrl(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const toggleSize = (size: number) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size].sort((a, b) => a - b),
    );
    // Clear previous output when sizes change
    setPreviews([]);
    setPngData([]);
    setIcoBlob(null);
  };

  const generate = useCallback(async () => {
    if (!sourceUrl || sizes.length === 0) return;

    setGenerating(true);
    setError(null);
    setPreviews([]);
    setPngData([]);
    setIcoBlob(null);

    try {
      const results: { size: number; png: Uint8Array; dataUrl: string }[] = [];

      const isSvg = fileName.toLowerCase().endsWith(".svg");

      for (const size of sizes) {
        const canvas = await renderToCanvas(sourceUrl, size, isSvg);
        const png = await canvasToPngBlob(canvas);
        const dataUrl = canvas.toDataURL("image/png");
        results.push({ size, png, dataUrl });
      }

      setPreviews(results.map((r) => ({ size: r.size, dataUrl: r.dataUrl })));
      setPngData(results.map((r) => ({ size: r.size, png: r.png })));
      const ico = buildIco(results.map((r) => ({ size: r.size, png: r.png })));
      setIcoBlob(ico);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [sourceUrl, sizes, fileName]);

  const downloadIco = useCallback(() => {
    if (!icoBlob) return;
    const url = URL.createObjectURL(icoBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicon.ico";
    a.click();
    URL.revokeObjectURL(url);
  }, [icoBlob]);

  const downloadZip = useCallback(async () => {
    if (!icoBlob || pngData.length === 0) return;

    const icoBuf = await icoBlob.arrayBuffer();
    const files: Record<string, Uint8Array> = {
      "favicon.ico": new Uint8Array(icoBuf),
    };
    for (const { size, png } of pngData) {
      files[`favicon-${size}x${size}.png`] = png;
    }

    const zipped = zipSync(files, { level: 0 }); // PNGs are already compressed
    const blob = new Blob([zipped.buffer as ArrayBuffer], {
      type: "application/zip",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicons.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [icoBlob, pngData]);

  const clear = () => {
    setSourceUrl(null);
    setFileName("");
    setPreviews([]);
    setPngData([]);
    setIcoBlob(null);
    setError(null);
    setSizes([...DEFAULT_SIZES]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          Favicon Generator
        </h1>
        <p className="text-sm text-muted">
          Drop an image and get an ICO with multiple sizes. Everything runs in
          your browser.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: main area */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Drop zone */}
          <div
            ref={dropRef}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-lg border-2 border-dashed bg-surface/50 flex flex-col items-center justify-center py-16 cursor-pointer transition-colors ${
              dragOver
                ? "border-accent/60 bg-accent/5"
                : sourceUrl
                  ? "border-accent/30"
                  : "border-border hover:border-accent/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="hidden"
            />
            {sourceUrl ? (
              <div className="flex flex-col items-center gap-3">
                <NextImage
                  src={sourceUrl}
                  alt="Source"
                  width={128}
                  height={128}
                  unoptimized
                  className="max-h-32 max-w-32 object-contain rounded h-auto w-auto"
                />
                <span className="text-xs text-dim">{fileName}</span>
                <span className="text-[10px] text-dim">
                  Click or drop to replace
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={24} className="text-dim" />
                <span className="text-sm text-muted">
                  Drop an image or click to upload
                </span>
                <span className="text-[10px] text-dim">
                  SVG, PNG, JPG, GIF, WebP, BMP, AVIF, TIFF
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={clear}
              disabled={!sourceUrl}
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-dim hover:text-pink hover:border-pink/30 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <Trash2 size={12} />
              Clear
            </button>
            <button
              onClick={generate}
              disabled={!sourceUrl || sizes.length === 0 || generating}
              className="inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-accent hover:bg-accent/20 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <ImageIcon size={12} />
              {generating ? "Generating..." : "Generate ICO"}
            </button>
            <button
              onClick={downloadIco}
              disabled={!icoBlob}
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <Download size={12} />
              ICO
              {icoBlob && (
                <span className="text-[10px] text-dim tabular-nums">
                  ({formatFileSize(icoBlob.size)})
                </span>
              )}
            </button>
            <button
              onClick={downloadZip}
              disabled={!icoBlob}
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <Archive size={12} />
              ZIP
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-pink/40 bg-pink/5 px-3 py-2 text-xs text-pink font-mono">
              {error}
            </div>
          )}

          {/* Previews */}
          {previews.length > 0 && (
            <div className="rounded-lg border border-border bg-surface/50">
              <div className="px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-foreground">
                  Preview
                </span>
              </div>
              <div className="p-4 flex flex-wrap gap-6">
                {previews.map((p) => (
                  <div
                    key={p.size}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="border border-border rounded bg-[repeating-conic-gradient(var(--color-border)_0%_25%,transparent_0%_50%)] bg-[length:8px_8px] flex items-center justify-center"
                      style={{
                        width: Math.max(p.size, 32) + 16,
                        height: Math.max(p.size, 32) + 16,
                      }}
                    >
                      <NextImage
                        src={p.dataUrl}
                        alt={`${p.size}x${p.size}`}
                        width={p.size}
                        height={p.size}
                        unoptimized
                        className="image-rendering-pixelated"
                        style={{
                          imageRendering: p.size <= 32 ? "pixelated" : "auto",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-dim tabular-nums">
                      {p.size}x{p.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: sidebar */}
        <div className="lg:w-64 shrink-0 flex flex-col gap-6">
          {/* Size toggles */}
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border">
              Sizes (px)
            </h3>
            <div className="px-4 py-3 flex flex-wrap gap-1.5">
              {DEFAULT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`rounded border px-2.5 py-1 text-[11px] font-medium tabular-nums transition-colors cursor-pointer ${
                    sizes.includes(size)
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border text-dim hover:text-foreground hover:border-border"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border">
              About
            </h3>
            <div className="px-4 py-3 text-[11px] text-dim leading-relaxed space-y-2.5">
              <p>
                ICO files bundle multiple icon sizes into a single file.
                Browsers pick the best match for the context: 16px for tabs,
                32px for bookmarks, larger for shortcuts and app icons.
              </p>
              <p>
                Common sizes: 16, 32, and 48 for browser favicons. 64 and above
                for desktop shortcuts and high-DPI displays.
              </p>
              <p>
                For best results, start with an SVG or a large PNG (512px+).
                Smaller sources may look blurry when scaled up.
              </p>
              <p>
                The generated ICO uses embedded PNG data, which is supported by
                all modern browsers and Windows Vista+.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
