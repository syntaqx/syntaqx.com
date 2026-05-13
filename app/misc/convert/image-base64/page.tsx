"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type DragEvent,
} from "react";
import {
  Trash2,
  Upload,
  ImageIcon,
  Download,
  Info,
  ExternalLink,
} from "lucide-react";
import { PasteButton } from "@/components/paste-button";
import { Checkbox } from "@/components/checkbox";
import { CopyButton } from "@/components/copy-button";

// --- Helpers ----------------------------------------------------------------

const IMAGE_MIME_RE = /^image\/[a-z0-9.+-]+$/i;
const DATA_URI_RE = /^data:(image\/[a-z0-9.+-]+)(?:;[^,]*)?,([\s\S]*)$/i;

function byteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function stripDataUri(dataUri: string): { mime: string; base64: string } {
  const match = DATA_URI_RE.exec(dataUri.trim());
  if (match) return { mime: match[1], base64: match[2].replace(/\s+/g, "") };
  return { mime: "", base64: dataUri };
}

function extFromMime(mime: string): string {
  if (!mime) return "bin";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/svg+xml") return "svg";
  const part = mime.split("/")[1] || "bin";
  return part.replace(/\+.*$/, "");
}

function decodeBase64ToBlob(input: string): {
  blob: Blob;
  mime: string;
  size: number;
} {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Empty input");

  let mime = "";
  let b64 = trimmed;

  const match = DATA_URI_RE.exec(trimmed);
  if (match) {
    mime = match[1];
    b64 = match[2];
  }
  b64 = b64.replace(/\s+/g, "");

  // URL-safe variant
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  // Pad
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);

  let binary: string;
  try {
    binary = atob(b64);
  } catch {
    throw new Error("Invalid Base64 string");
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  if (!mime) mime = sniffImageMime(bytes) || "application/octet-stream";

  if (!IMAGE_MIME_RE.test(mime)) {
    throw new Error("Decoded data is not a recognized image format");
  }

  const blob = new Blob([bytes], { type: mime });
  return { blob, mime, size: bytes.byteLength };
}

function sniffImageMime(bytes: Uint8Array): string | null {
  // PNG: 89 50 4E 47
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // GIF: 47 49 46 38
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return "image/gif";
  }
  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  // BMP: 42 4D
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return "image/bmp";
  // ICO: 00 00 01 00
  if (
    bytes[0] === 0x00 &&
    bytes[1] === 0x00 &&
    bytes[2] === 0x01 &&
    bytes[3] === 0x00
  ) {
    return "image/x-icon";
  }
  // SVG: leading "<svg" or "<?xml"
  const head = new TextDecoder("utf-8").decode(bytes.slice(0, 256)).trim();
  if (/^<\?xml/i.test(head) || /^<svg\b/i.test(head)) return "image/svg+xml";
  return null;
}

// --- Page -------------------------------------------------------------------

export default function ImageBase64Page() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  // Encode (image -> base64)
  const [encDataUri, setEncDataUri] = useState("");
  const [encMime, setEncMime] = useState("");
  const [encBytes, setEncBytes] = useState(0);
  const [encFileName, setEncFileName] = useState<string | null>(null);
  const [encDragging, setEncDragging] = useState(false);
  const [asDataUri, setAsDataUri] = useState(true);
  const encFileRef = useRef<HTMLInputElement>(null);

  // Decode (base64 -> image)
  const [decInput, setDecInput] = useState("");
  const [decUrl, setDecUrl] = useState<string | null>(null);
  const [decMime, setDecMime] = useState("");
  const [decBytes, setDecBytes] = useState(0);
  const [decError, setDecError] = useState<string | null>(null);
  const [decDragging, setDecDragging] = useState(false);

  // Revoke object URL when it changes or component unmounts
  useEffect(() => {
    return () => {
      if (decUrl) URL.revokeObjectURL(decUrl);
    };
  }, [decUrl]);

  const switchMode = (next: "encode" | "decode") => {
    if (next === mode) return;
    setMode(next);
  };

  // --- Encode handlers ------------------------------------------------------

  const loadEncodeFile = useCallback(async (file: File) => {
    if (!IMAGE_MIME_RE.test(file.type)) {
      setEncDataUri("");
      setEncMime("");
      setEncBytes(0);
      setEncFileName(file.name);
      return;
    }
    const dataUri = await fileToBase64(file);
    setEncDataUri(dataUri);
    setEncMime(file.type);
    setEncBytes(file.size);
    setEncFileName(file.name);
  }, []);

  const clearEncode = () => {
    setEncDataUri("");
    setEncMime("");
    setEncBytes(0);
    setEncFileName(null);
  };

  const onEncodeDrop = (e: DragEvent) => {
    e.preventDefault();
    setEncDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadEncodeFile(file);
  };

  const encodeOutput = encDataUri
    ? asDataUri
      ? encDataUri
      : stripDataUri(encDataUri).base64
    : "";

  // --- Decode handlers ------------------------------------------------------

  const runDecode = useCallback((value: string) => {
    setDecInput(value);
    if (!value.trim()) {
      setDecUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setDecMime("");
      setDecBytes(0);
      setDecError(null);
      return;
    }
    try {
      const { blob, mime, size } = decodeBase64ToBlob(value);
      const url = URL.createObjectURL(blob);
      setDecUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setDecMime(mime);
      setDecBytes(size);
      setDecError(null);
    } catch (err) {
      setDecUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setDecMime("");
      setDecBytes(0);
      setDecError(err instanceof Error ? err.message : "Failed to decode");
    }
  }, []);

  const clearDecode = () => {
    setDecInput("");
    setDecUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setDecMime("");
    setDecBytes(0);
    setDecError(null);
  };

  const onDecodeDrop = async (e: DragEvent) => {
    e.preventDefault();
    setDecDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    // If a text file is dropped, read as text; otherwise treat as image
    if (file.type.startsWith("text/") || /\.(txt|b64)$/i.test(file.name)) {
      const text = await file.text();
      runDecode(text);
      return;
    }
    if (IMAGE_MIME_RE.test(file.type)) {
      const dataUri = await fileToBase64(file);
      runDecode(dataUri);
    }
  };

  const downloadDecoded = () => {
    if (!decUrl) return;
    const a = document.createElement("a");
    a.href = decUrl;
    a.download = `image.${extFromMime(decMime)}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          Image / Base64 Converter
        </h1>
        <p className="text-sm text-muted">
          Convert images to Base64 data URIs and decode Base64 back into images.
          Everything runs in your browser, nothing is sent to a server.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: tool */}
        <div className="flex-1 min-w-0">
          {/* Segmented control */}
          <div className="mb-5 inline-flex rounded-lg border border-border p-0.5 bg-surface/50">
            <button
              onClick={() => switchMode("encode")}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                mode === "encode"
                  ? "bg-accent text-background"
                  : "text-dim hover:text-foreground"
              }`}
            >
              Image to Base64
            </button>
            <button
              onClick={() => switchMode("decode")}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                mode === "decode"
                  ? "bg-accent text-background"
                  : "text-dim hover:text-foreground"
              }`}
            >
              Base64 to Image
            </button>
          </div>

          {mode === "encode" ? (
            <div className="flex flex-col gap-4">
              {/* Drop zone / preview */}
              <div
                onDrop={onEncodeDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setEncDragging(true);
                }}
                onDragLeave={() => setEncDragging(false)}
                className={`rounded-lg border bg-surface/50 transition-colors ${
                  encDragging ? "border-accent border-dashed" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <label className="text-xs text-dim flex items-center gap-1.5">
                    Image
                    {encFileName && (
                      <span className="inline-flex items-center gap-1 text-accent">
                        <ImageIcon size={10} />
                        {encFileName}
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {encBytes > 0 && (
                      <span className="text-[10px] text-dim tabular-nums">
                        {encMime || "unknown"} &middot; {byteSize(encBytes)}
                      </span>
                    )}
                    <button
                      onClick={() => encFileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer"
                    >
                      <Upload size={12} />
                      File
                    </button>
                    {encDataUri && (
                      <button
                        onClick={clearEncode}
                        className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-pink hover:border-pink/30 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    <input
                      ref={encFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) loadEncodeFile(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
                <div className="px-3 py-4 flex items-center justify-center min-h-45">
                  {encDataUri ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={encDataUri}
                      alt={encFileName ?? "preview"}
                      className="max-h-64 max-w-full rounded border border-border bg-background object-contain"
                    />
                  ) : (
                    <div className="text-center text-xs text-dim">
                      <ImageIcon
                        size={24}
                        className="mx-auto mb-2 text-dim/60"
                      />
                      Drop an image here, or click{" "}
                      <span className="text-muted">File</span> to choose one.
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-3 py-2">
                  <Checkbox
                    checked={asDataUri}
                    onChange={() => setAsDataUri((v) => !v)}
                    label="Include data URI prefix"
                    tooltip="Prepend data:<mime>;base64, so the output can be used directly in src/href attributes."
                  />
                </div>
              </div>

              {/* Output */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-dim">Base64 output</label>
                  <div className="flex items-center gap-1.5">
                    {encodeOutput && (
                      <span className="text-[10px] text-dim tabular-nums">
                        {encodeOutput.length.toLocaleString()} chars
                      </span>
                    )}
                    {encodeOutput && <CopyButton text={encodeOutput} label />}
                  </div>
                </div>
                <textarea
                  value={encodeOutput}
                  readOnly
                  rows={8}
                  placeholder="Encoded Base64 will appear here..."
                  className="w-full rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-foreground placeholder:text-dim/50 focus:outline-none resize-y font-mono break-all"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Input card */}
              <div
                onDrop={onDecodeDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDecDragging(true);
                }}
                onDragLeave={() => setDecDragging(false)}
                className={`rounded-lg border bg-surface/50 transition-colors ${
                  decDragging ? "border-accent border-dashed" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <label className="text-xs text-dim">Base64 or data URI</label>
                  <div className="flex items-center gap-1.5">
                    {decInput && (
                      <span className="text-[10px] text-dim tabular-nums">
                        {decInput.length.toLocaleString()} chars
                      </span>
                    )}
                    <PasteButton onPaste={(text) => runDecode(text)} label />
                    {decInput && (
                      <button
                        onClick={clearDecode}
                        className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-pink hover:border-pink/30 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={decInput}
                  onChange={(e) => runDecode(e.target.value)}
                  placeholder="Paste a Base64 string or a data:image/...;base64,... URI..."
                  rows={8}
                  spellCheck={false}
                  className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-dim/50 focus:outline-none resize-y font-mono break-all"
                />
              </div>

              {decError && <p className="text-xs text-pink">{decError}</p>}

              {/* Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-dim">Image preview</label>
                  <div className="flex items-center gap-1.5">
                    {decBytes > 0 && (
                      <span className="text-[10px] text-dim tabular-nums">
                        {decMime} &middot; {byteSize(decBytes)}
                      </span>
                    )}
                    {decUrl && (
                      <button
                        onClick={downloadDecoded}
                        className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-surface/50 px-3 py-4 flex items-center justify-center min-h-45">
                  {decUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={decUrl}
                      alt="decoded"
                      className="max-h-64 max-w-full rounded border border-border bg-background object-contain"
                    />
                  ) : (
                    <div className="text-center text-xs text-dim">
                      <ImageIcon
                        size={24}
                        className="mx-auto mb-2 text-dim/60"
                      />
                      Decoded image will appear here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: info & references */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-accent" />
              About data URIs
            </h3>
            <div className="px-4 py-3 text-[11px] text-dim leading-relaxed space-y-2.5">
              <p>
                A data URI embeds a file directly into a URL using the form{" "}
                <span className="text-muted">
                  data:&lt;mime&gt;;base64,&lt;data&gt;
                </span>
                . It can be used anywhere a URL is accepted &mdash; including
                <span className="text-muted"> img src</span>, CSS{" "}
                <span className="text-muted">background-image</span>, and SVG.
              </p>
              <p>
                Base64 encoding increases payload size by roughly{" "}
                <span className="text-muted">33%</span>. It is most useful for
                small, inlineable assets like icons; large images are usually
                better served as separate files.
              </p>
              <p>
                This page accepts plain Base64, padded or unpadded, and both
                standard and URL-safe alphabets. The format is auto-detected
                from the data when no MIME type is provided.
              </p>
              <p>
                Files are processed locally with the{" "}
                <span className="text-muted">FileReader</span> and{" "}
                <span className="text-muted">Blob</span> APIs. Nothing is
                uploaded.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <ExternalLink size={12} className="text-accent" />
              References
            </h3>
            <ul className="px-4 py-3 text-[11px] leading-relaxed space-y-1.5">
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc2397"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 2397 - The &quot;data&quot; URL scheme
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc4648"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 4648 - Base Encodings
                </a>
              </li>
              <li>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  MDN - Data URLs
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
