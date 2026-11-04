"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, ImageIcon, Download, Info, ExternalLink } from "lucide-react";
import {
  ClearButton,
  FileName,
  OptionCheckbox,
  PanelHeader,
  Stat,
  codeArea,
  dropTarget,
} from "@/components/tool-controls";
import { cn } from "@/lib/cn";
import { Button } from "@/registry/syntaqx/ui/button";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Field, FieldError, FieldLabel } from "@/registry/syntaqx/ui/field";
import { FileDrop, FileDropArea, FileDropTrigger } from "@/registry/syntaqx/ui/file-drop";
import { InputGroup, InputGroupTextarea } from "@/registry/syntaqx/ui/input-group";
import { PasteButton } from "@/registry/syntaqx/ui/paste-button";
import { Textarea } from "@/registry/syntaqx/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/registry/syntaqx/ui/toggle-group";

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
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
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
  if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) {
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
  const [asDataUri, setAsDataUri] = useState(true);

  // Decode (base64 -> image)
  const [decInput, setDecInput] = useState("");
  const [decUrl, setDecUrl] = useState<string | null>(null);
  const [decMime, setDecMime] = useState("");
  const [decBytes, setDecBytes] = useState(0);
  const [decError, setDecError] = useState<string | null>(null);

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

  const encodeOutput = encDataUri ? (asDataUri ? encDataUri : stripDataUri(encDataUri).base64) : "";

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

  const decodeFile = async (file: File) => {
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
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">Image / Base64 Converter</h1>
        <p className="max-w-2xl text-muted-foreground">
          Convert images to Base64 data URIs and decode Base64 back into images. Everything runs in
          your browser, nothing is sent to a server.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: tool */}
        <div className="flex-1 min-w-0">
          {/* Mode */}
          <ToggleGroup
            type="single"
            variant="outline"
            aria-label="Mode"
            value={mode}
            onValueChange={(v) => v && switchMode(v as "encode" | "decode")}
            className="mb-5"
          >
            <ToggleGroupItem value="encode">Image to Base64</ToggleGroupItem>
            <ToggleGroupItem value="decode">Base64 to Image</ToggleGroupItem>
          </ToggleGroup>

          {mode === "encode" ? (
            <div className="flex flex-col gap-4">
              {/* Drop zone / preview */}
              <FileDrop accept="image/*" onFiles={([file]) => loadEncodeFile(file)}>
                <div
                  className={cn(
                    "rounded-md border border-input shadow-xs transition-colors dark:bg-input/30",
                    dropTarget,
                  )}
                >
                  <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                      Image
                      {encFileName && <FileName name={encFileName} icon={<ImageIcon />} />}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {encBytes > 0 && (
                        <Stat>
                          {encMime || "unknown"} &middot; {byteSize(encBytes)}
                        </Stat>
                      )}
                      <FileDropTrigger>
                        <Upload />
                        File
                      </FileDropTrigger>
                      {encDataUri && <ClearButton onClick={clearEncode} />}
                    </div>
                  </div>
                  {encDataUri ? (
                    <div className="flex min-h-45 items-center justify-center px-3 py-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={encDataUri}
                        alt={encFileName ?? "preview"}
                        className="max-h-64 max-w-full border bg-background object-contain"
                      />
                    </div>
                  ) : (
                    <FileDropArea className="min-h-45 rounded-none border-0">
                      <ImageIcon />
                      Drop an image here, or click to choose one.
                    </FileDropArea>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t px-3 py-2">
                    <OptionCheckbox
                      checked={asDataUri}
                      onCheckedChange={setAsDataUri}
                      label="Include data URI prefix"
                      hint="Prepend data:<mime>;base64, so the output can be used directly in src/href attributes."
                    />
                  </div>
                </div>
              </FileDrop>

              {/* Output */}
              <Field>
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel>Base64 output</FieldLabel>
                  <div className="flex items-center gap-1.5">
                    {encodeOutput && <Stat>{encodeOutput.length.toLocaleString()} chars</Stat>}
                    {encodeOutput && (
                      <CopyButton value={encodeOutput} variant="outline" size="sm" />
                    )}
                  </div>
                </div>
                <Textarea
                  value={encodeOutput}
                  readOnly
                  rows={8}
                  placeholder="Encoded Base64 will appear here..."
                  className={cn(codeArea, "break-all")}
                />
              </Field>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Input */}
              <FileDrop onFiles={([file]) => void decodeFile(file)}>
                <Field invalid={!!decError}>
                  <InputGroup className={dropTarget}>
                    <PanelHeader>
                      <FieldLabel>Base64 or data URI</FieldLabel>
                      <div className="flex items-center gap-1.5">
                        {decInput && <Stat>{decInput.length.toLocaleString()} chars</Stat>}
                        <PasteButton
                          variant="outline"
                          size="sm"
                          onPaste={(text) => runDecode(text)}
                        />
                        {decInput && <ClearButton onClick={clearDecode} />}
                      </div>
                    </PanelHeader>
                    <InputGroupTextarea
                      value={decInput}
                      onChange={(e) => runDecode(e.target.value)}
                      placeholder="Paste a Base64 string or a data:image/...;base64,... URI..."
                      rows={8}
                      spellCheck={false}
                      className={cn(codeArea, "break-all")}
                    />
                  </InputGroup>
                  <FieldError>{decError}</FieldError>
                </Field>
              </FileDrop>

              {/* Preview */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Image preview</span>
                  <div className="flex items-center gap-1.5">
                    {decBytes > 0 && (
                      <Stat>
                        {decMime} &middot; {byteSize(decBytes)}
                      </Stat>
                    )}
                    {decUrl && (
                      <Button variant="outline" size="sm" onClick={downloadDecoded}>
                        <Download />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex min-h-45 items-center justify-center rounded-md border px-3 py-4">
                  {decUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={decUrl}
                      alt="decoded"
                      className="max-h-64 max-w-full border bg-background object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                      <ImageIcon className="size-6" />
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
          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-primary" />
              About data URIs
            </h3>
            <div className="px-4 py-3 text-[11px] text-muted-foreground leading-relaxed space-y-2.5">
              <p>
                A data URI embeds a file directly into a URL using the form{" "}
                <span className="text-foreground">data:&lt;mime&gt;;base64,&lt;data&gt;</span>. It
                can be used anywhere a URL is accepted &mdash; including
                <span className="text-foreground"> img src</span>, CSS{" "}
                <span className="text-foreground">background-image</span>, and SVG.
              </p>
              <p>
                Base64 encoding increases payload size by roughly{" "}
                <span className="text-foreground">33%</span>. It is most useful for small,
                inlineable assets like icons; large images are usually better served as separate
                files.
              </p>
              <p>
                This page accepts plain Base64, padded or unpadded, and both standard and URL-safe
                alphabets. The format is auto-detected from the data when no MIME type is provided.
              </p>
              <p>
                Files are processed locally with the{" "}
                <span className="text-foreground">FileReader</span> and{" "}
                <span className="text-foreground">Blob</span> APIs. Nothing is uploaded.
              </p>
            </div>
          </div>

          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border flex items-center gap-1.5">
              <ExternalLink size={12} className="text-primary" />
              References
            </h3>
            <ul className="px-4 py-3 text-[11px] leading-relaxed space-y-1.5">
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc2397"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  RFC 2397 - The &quot;data&quot; URL scheme
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc4648"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  RFC 4648 - Base Encodings
                </a>
              </li>
              <li>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
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
