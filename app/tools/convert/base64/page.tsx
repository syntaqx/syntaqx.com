"use client";

import { useState, useCallback } from "react";
import { Upload, Info, ExternalLink } from "lucide-react";
import {
  ClearButton,
  FileName,
  OptionCheckbox,
  OptionSelect,
  PanelFooter,
  PanelHeader,
  Stat,
  codeArea,
  dropTarget,
} from "@/components/tool-controls";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Field, FieldError, FieldLabel } from "@/registry/syntaqx/ui/field";
import { FileDrop, FileDropTrigger } from "@/registry/syntaqx/ui/file-drop";
import { InputGroup, InputGroupTextarea } from "@/registry/syntaqx/ui/input-group";
import { PasteButton } from "@/registry/syntaqx/ui/paste-button";
import { Textarea } from "@/registry/syntaqx/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/registry/syntaqx/ui/toggle-group";

// --- Helpers ----------------------------------------------------------------

function toBase64(input: string, charset: string): string {
  if (charset === "utf-8") {
    return btoa(new TextEncoder().encode(input).reduce((s, b) => s + String.fromCharCode(b), ""));
  }
  return btoa(input); // ascii / latin1
}

function fromBase64(input: string, charset: string): string {
  const raw = atob(input);
  if (charset === "utf-8") {
    return new TextDecoder("utf-8").decode(Uint8Array.from(raw, (c) => c.charCodeAt(0)));
  }
  return raw;
}

function processValue(
  value: string,
  dir: "encode" | "decode",
  charset: string,
  perLine: boolean,
): { output: string; error: string | null } {
  if (!value) return { output: "", error: null };

  if (perLine) {
    const lines = value.split("\n");
    const results: string[] = [];
    for (const line of lines) {
      if (!line) {
        results.push("");
        continue;
      }
      try {
        results.push(dir === "encode" ? toBase64(line, charset) : fromBase64(line, charset));
      } catch {
        return {
          output: "",
          error:
            dir === "decode"
              ? "Invalid Base64 on one or more lines"
              : "Input contains characters that cannot be encoded",
        };
      }
    }
    return { output: results.join("\n"), error: null };
  }

  try {
    return {
      output: dir === "encode" ? toBase64(value, charset) : fromBase64(value, charset),
      error: null,
    };
  } catch {
    return {
      output: "",
      error:
        dir === "decode"
          ? "Invalid Base64 string"
          : "Input contains characters that cannot be encoded",
    };
  }
}

function byteSize(str: string): string {
  const bytes = new TextEncoder().encode(str).length;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// --- Components -------------------------------------------------------------

// --- Page -------------------------------------------------------------------

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("decode");
  const [charset, setCharset] = useState("utf-8");
  const [perLine, setPerLine] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const run = useCallback((value: string, dir: "encode" | "decode", cs: string, pl: boolean) => {
    setInput(value);
    const { output: out, error: err } = processValue(value, dir, cs, pl);
    setOutput(out);
    setError(err);
  }, []);

  const switchMode = (next: "encode" | "decode") => {
    if (next === mode) return;
    setMode(next);
    setInput("");
    setOutput("");
    setError(null);
    setFileName(null);
  };

  const changeCharset = (cs: string) => {
    setCharset(cs);
    if (input) run(input, mode, cs, perLine);
  };

  const togglePerLine = () => {
    const next = !perLine;
    setPerLine(next);
    if (input) run(input, mode, charset, next);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError(null);
    setFileName(null);
  };

  const loadFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      run(text, mode, charset, perLine);
    };
    reader.readAsText(file);
  };

  const inputLabel = mode === "encode" ? "Plain text" : "Base64 string";
  const outputLabel = mode === "encode" ? "Base64 output" : "Decoded text";
  const placeholder =
    mode === "encode"
      ? "Paste, drop a file, or type text to encode..."
      : "Paste, drop a file, or type Base64 to decode...";

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">Base64 Decode / Encode</h1>
        <p className="max-w-2xl text-muted-foreground">
          Decode or encode Base64 strings. Everything runs in your browser, nothing is sent to a
          server.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: tool */}
        <div className="flex-1 min-w-0">
          {/* Mode: decode first */}
          <ToggleGroup
            spacing={0}
            type="single"
            variant="outline"
            aria-label="Mode"
            value={mode}
            onValueChange={(v) => v && switchMode(v as "encode" | "decode")}
            className="mb-5"
          >
            <ToggleGroupItem value="decode">Decode</ToggleGroupItem>
            <ToggleGroupItem value="encode">Encode</ToggleGroupItem>
          </ToggleGroup>

          <div className="flex flex-col gap-4">
            {/* Input */}
            <FileDrop onFiles={([file]) => loadFile(file)}>
              <Field invalid={!!error}>
                <InputGroup className={dropTarget}>
                  <PanelHeader>
                    <FieldLabel className="gap-1.5">
                      {inputLabel}
                      {fileName && <FileName name={fileName} />}
                    </FieldLabel>
                    <div className="flex items-center gap-1.5">
                      {input && (
                        <Stat>
                          {input.length.toLocaleString()} chars &middot; {byteSize(input)}
                        </Stat>
                      )}
                      <FileDropTrigger>
                        <Upload />
                        File
                      </FileDropTrigger>
                      <PasteButton
                        variant="outline"
                        size="sm"
                        onPaste={(text) => {
                          setFileName(null);
                          run(text, mode, charset, perLine);
                        }}
                      />
                      {input && <ClearButton onClick={clear} />}
                    </div>
                  </PanelHeader>
                  <InputGroupTextarea
                    value={input}
                    onChange={(e) => {
                      setFileName(null);
                      run(e.target.value, mode, charset, perLine);
                    }}
                    placeholder={placeholder}
                    rows={8}
                    spellCheck={false}
                    className={codeArea}
                  />
                  <PanelFooter>
                    <OptionSelect
                      label="Charset"
                      value={charset}
                      onValueChange={changeCharset}
                      options={[
                        { value: "utf-8", label: "UTF-8" },
                        { value: "ascii", label: "ASCII / Latin1" },
                      ]}
                    />
                    <OptionCheckbox
                      checked={perLine}
                      onCheckedChange={togglePerLine}
                      label="Each line separately"
                      hint="Treat each line as an independent value. Useful when you have multiple Base64 strings separated by newlines."
                    />
                  </PanelFooter>
                </InputGroup>
                <FieldError>{error}</FieldError>
              </Field>
            </FileDrop>

            {/* Output */}
            <Field>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel>{outputLabel}</FieldLabel>
                <div className="flex items-center gap-1.5">
                  {output && (
                    <Stat>
                      {output.length.toLocaleString()} chars &middot; {byteSize(output)}
                    </Stat>
                  )}
                  {output && <CopyButton value={output} variant="outline" size="sm" />}
                </div>
              </div>
              <Textarea value={output} readOnly rows={8} className={codeArea} />
            </Field>
          </div>
        </div>

        {/* Right: info & references */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          {/* Info */}
          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-primary" />
              About Base64
            </h3>
            <div className="px-4 py-3 text-[11px] text-muted-foreground leading-relaxed space-y-2.5">
              <p>
                Base64 is an encoding scheme that converts binary data into ASCII text using a
                64-character alphabet: <span className="text-foreground">A-Z</span>,{" "}
                <span className="text-foreground">a-z</span>,{" "}
                <span className="text-foreground">0-9</span>,{" "}
                <span className="text-foreground">+</span>, and{" "}
                <span className="text-foreground">/</span>, with{" "}
                <span className="text-foreground">=</span> for padding.
              </p>
              <p>
                Every 3 bytes of input produce 4 characters of output, increasing size by roughly
                33%.
              </p>
              <p>
                <span className="text-foreground">Common uses:</span> email attachments (MIME), data
                URIs, JSON Web Tokens (JWTs), embedding images in CSS/HTML, and transmitting binary
                data through text-only protocols.
              </p>
              <p>
                A URL-safe variant replaces <span className="text-foreground">+</span> and{" "}
                <span className="text-foreground">/</span> with{" "}
                <span className="text-foreground">-</span> and{" "}
                <span className="text-foreground">_</span> to avoid conflicts in URLs and filenames
                (RFC 4648 &sect;5).
              </p>
              <p>
                Base64 is <span className="text-foreground">not encryption</span>. It provides no
                security. Anyone can decode it.
              </p>
            </div>
          </div>

          {/* References */}
          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border flex items-center gap-1.5">
              <ExternalLink size={12} className="text-primary" />
              References
            </h3>
            <ul className="px-4 py-3 text-[11px] leading-relaxed space-y-1.5">
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
                  href="https://datatracker.ietf.org/doc/html/rfc2045#section-6.8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  RFC 2045 &sect;6.8 - MIME Base64
                </a>
              </li>
              <li>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Glossary/Base64"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  MDN - Base64 glossary
                </a>
              </li>
              <li>
                <a
                  href="https://en.wikipedia.org/wiki/Base64"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Wikipedia - Base64
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
