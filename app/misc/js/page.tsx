"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import {
  Trash2,
  Upload,
  FileText,
  Info,
  ExternalLink,
  Play,
  Loader2,
} from "lucide-react";
import { PasteButton } from "@/components/paste-button";
import { Checkbox } from "@/components/checkbox";
import { CopyButton } from "@/components/copy-button";

// --- Types ------------------------------------------------------------------

type Mode = "beautify" | "minify" | "obfuscate";

// --- Helpers ----------------------------------------------------------------

function byteSize(str: string): string {
  const bytes = new TextEncoder().encode(str).length;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pctDelta(before: number, after: number): string {
  if (before === 0) return "";
  const delta = ((after - before) / before) * 100;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

// --- Lazy loaders ---------------------------------------------------------

// Cache so we don't reload on every run.
type PrettierMod = typeof import("prettier/standalone");
let prettierMod: PrettierMod | null = null;
let prettierBabel: unknown = null;
let prettierEstree: unknown = null;
async function loadPrettier() {
  if (!prettierMod) {
    const [standalone, babel, estree] = await Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/babel"),
      import("prettier/plugins/estree"),
    ]);
    prettierMod = standalone;
    prettierBabel = babel.default ?? babel;
    prettierEstree = estree.default ?? estree;
  }
  return {
    prettier: prettierMod,
    babel: prettierBabel,
    estree: prettierEstree,
  };
}

type TerserMod = typeof import("terser");
let terserMod: TerserMod | null = null;
async function loadTerser() {
  if (!terserMod) terserMod = await import("terser");
  return terserMod;
}

type ObfuscatorMod = typeof import("javascript-obfuscator");
let obfuscatorMod: ObfuscatorMod | null = null;
async function loadObfuscator(): Promise<ObfuscatorMod> {
  if (!obfuscatorMod) {
    const mod = await import("javascript-obfuscator");
    // The package is CJS; interop puts the namespace on default in some setups.
    const candidate = (mod as unknown as { default?: ObfuscatorMod }).default;
    obfuscatorMod = candidate ?? (mod as unknown as ObfuscatorMod);
  }
  return obfuscatorMod;
}

// --- Page -------------------------------------------------------------------

export default function JsToolPage() {
  const [mode, setMode] = useState<Mode>("beautify");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Beautify options
  const [parser, setParser] = useState<"babel" | "json">("babel");
  const [tabWidth, setTabWidth] = useState(2);
  const [singleQuote, setSingleQuote] = useState(false);
  const [semi, setSemi] = useState(true);

  // Minify options
  const [mangle, setMangle] = useState(true);
  const [compress, setCompress] = useState(true);
  const [minifyKeepClassnames, setMinifyKeepClassnames] = useState(false);

  // Obfuscate options
  const [obfPreset, setObfPreset] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [obfStringArray, setObfStringArray] = useState(true);
  const [obfControlFlow, setObfControlFlow] = useState(false);
  const [obfDeadCode, setObfDeadCode] = useState(false);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setOutput("");
    setError(null);
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
      setInput(reader.result as string);
      setOutput("");
      setError(null);
    };
    reader.readAsText(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const run = useCallback(async () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    setRunning(true);
    setError(null);
    try {
      if (mode === "beautify") {
        const { prettier, babel, estree } = await loadPrettier();
        const result = await prettier.format(input, {
          parser,
          plugins: [babel, estree] as never[],
          tabWidth,
          singleQuote,
          semi,
        });
        setOutput(result);
      } else if (mode === "minify") {
        const terser = await loadTerser();
        const result = await terser.minify(input, {
          compress,
          mangle,
          keep_classnames: minifyKeepClassnames,
          keep_fnames: minifyKeepClassnames,
        });
        setOutput(result.code ?? "");
      } else {
        const Obfuscator = await loadObfuscator();
        const presetMap = {
          low: "low-obfuscation",
          medium: "medium-obfuscation",
          high: "high-obfuscation",
        } as const;
        const result = Obfuscator.obfuscate(input, {
          optionsPreset: presetMap[obfPreset],
          stringArray: obfStringArray,
          controlFlowFlattening: obfControlFlow,
          deadCodeInjection: obfDeadCode,
        });
        setOutput(result.getObfuscatedCode());
      }
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }, [
    mode,
    input,
    parser,
    tabWidth,
    singleQuote,
    semi,
    compress,
    mangle,
    minifyKeepClassnames,
    obfPreset,
    obfStringArray,
    obfControlFlow,
    obfDeadCode,
  ]);

  const beforeBytes = new TextEncoder().encode(input).length;
  const afterBytes = new TextEncoder().encode(output).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          JavaScript Beautify / Minify / Obfuscate
        </h1>
        <p className="text-sm text-muted">
          Format, compress, or obfuscate JavaScript and JSON. Everything runs in
          your browser, nothing is sent to a server.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: tool */}
        <div className="flex-1 min-w-0">
          {/* Segmented control */}
          <div className="mb-5 inline-flex rounded-lg border border-border p-0.5 bg-surface/50">
            {(["beautify", "minify", "obfuscate"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer capitalize ${
                  mode === m
                    ? "bg-accent text-background"
                    : "text-dim hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {/* Input card */}
            <div
              onDrop={onDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              className={`rounded-lg border bg-surface/50 transition-colors ${
                dragging ? "border-accent border-dashed" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <label className="text-xs text-dim flex items-center gap-1.5">
                  Source
                  {fileName && (
                    <span className="inline-flex items-center gap-1 text-accent">
                      <FileText size={10} />
                      {fileName}
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-1.5">
                  {input && (
                    <span className="text-[10px] text-dim tabular-nums">
                      {input.length.toLocaleString()} chars &middot;{" "}
                      {byteSize(input)}
                    </span>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer"
                  >
                    <Upload size={12} />
                    File
                  </button>
                  <PasteButton
                    onPaste={(text) => {
                      setFileName(null);
                      setInput(text);
                      setOutput("");
                      setError(null);
                    }}
                    label
                  />
                  {input && (
                    <button
                      onClick={clear}
                      className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-pink hover:border-pink/30 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".js,.mjs,.cjs,.json,.jsx,.ts,.tsx,text/javascript,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) loadFile(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => {
                  setFileName(null);
                  setInput(e.target.value);
                }}
                placeholder="Paste, drop a file, or type code here..."
                rows={10}
                spellCheck={false}
                className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-dim/50 focus:outline-none resize-y font-mono"
              />

              {/* Options */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-3 py-2">
                {mode === "beautify" && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-dim">Parser</label>
                      <select
                        value={parser}
                        onChange={(e) =>
                          setParser(e.target.value as "babel" | "json")
                        }
                        className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent/50 cursor-pointer"
                      >
                        <option value="babel">JavaScript</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-dim">Indent</label>
                      <select
                        value={tabWidth}
                        onChange={(e) => setTabWidth(Number(e.target.value))}
                        className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent/50 cursor-pointer"
                      >
                        <option value={2}>2 spaces</option>
                        <option value={4}>4 spaces</option>
                        <option value={8}>8 spaces</option>
                      </select>
                    </div>
                    <Checkbox
                      checked={singleQuote}
                      onChange={() => setSingleQuote((v) => !v)}
                      label="Single quotes"
                    />
                    <Checkbox
                      checked={semi}
                      onChange={() => setSemi((v) => !v)}
                      label="Semicolons"
                    />
                  </>
                )}
                {mode === "minify" && (
                  <>
                    <Checkbox
                      checked={compress}
                      onChange={() => setCompress((v) => !v)}
                      label="Compress"
                      tooltip="Apply Terser's compression passes (dead code removal, constant folding, etc.)."
                    />
                    <Checkbox
                      checked={mangle}
                      onChange={() => setMangle((v) => !v)}
                      label="Mangle names"
                      tooltip="Rename local variables and functions to shorter identifiers."
                    />
                    <Checkbox
                      checked={minifyKeepClassnames}
                      onChange={() => setMinifyKeepClassnames((v) => !v)}
                      label="Keep class/function names"
                      tooltip="Useful when code relies on Function.name or class names at runtime."
                    />
                  </>
                )}
                {mode === "obfuscate" && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-dim">Preset</label>
                      <select
                        value={obfPreset}
                        onChange={(e) =>
                          setObfPreset(
                            e.target.value as "low" | "medium" | "high",
                          )
                        }
                        className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent/50 cursor-pointer"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <Checkbox
                      checked={obfStringArray}
                      onChange={() => setObfStringArray((v) => !v)}
                      label="String array"
                      tooltip="Extract string literals into an array and reference them indirectly."
                    />
                    <Checkbox
                      checked={obfControlFlow}
                      onChange={() => setObfControlFlow((v) => !v)}
                      label="Control flow flattening"
                      tooltip="Rewrites control flow as a switch-based state machine. Significant runtime cost."
                    />
                    <Checkbox
                      checked={obfDeadCode}
                      onChange={() => setObfDeadCode((v) => !v)}
                      label="Dead code injection"
                      tooltip="Inject unreachable code to make analysis harder. Increases output size."
                    />
                  </>
                )}
              </div>
            </div>

            {/* Run */}
            <div>
              <button
                onClick={run}
                disabled={running || !input.trim()}
                className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Play size={12} />
                )}
                {running
                  ? "Running..."
                  : mode === "beautify"
                    ? "Beautify"
                    : mode === "minify"
                      ? "Minify"
                      : "Obfuscate"}
              </button>
            </div>

            {error && (
              <pre className="text-xs text-pink whitespace-pre-wrap font-mono rounded-lg border border-pink/30 bg-pink/5 px-3 py-2">
                {error}
              </pre>
            )}

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-dim">Output</label>
                <div className="flex items-center gap-1.5">
                  {output && (
                    <span className="text-[10px] text-dim tabular-nums">
                      {output.length.toLocaleString()} chars &middot;{" "}
                      {byteSize(output)}
                      {beforeBytes > 0 && (
                        <>
                          {" "}
                          &middot;{" "}
                          <span
                            className={
                              afterBytes < beforeBytes
                                ? "text-green"
                                : afterBytes > beforeBytes
                                  ? "text-pink"
                                  : ""
                            }
                          >
                            {pctDelta(beforeBytes, afterBytes)}
                          </span>
                        </>
                      )}
                    </span>
                  )}
                  {output && <CopyButton text={output} label />}
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                rows={10}
                placeholder="Output will appear here..."
                className="w-full rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-foreground placeholder:text-dim/50 focus:outline-none resize-y font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right: info */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-accent" />
              About this tool
            </h3>
            <div className="px-4 py-3 text-[11px] text-dim leading-relaxed space-y-2.5">
              <p>
                <span className="text-muted">Beautify</span> uses{" "}
                <span className="text-muted">Prettier</span> to reformat source
                with consistent indentation, quoting, and line breaks. Choose
                the <span className="text-muted">JSON</span> parser for strict
                JSON input.
              </p>
              <p>
                <span className="text-muted">Minify</span> uses{" "}
                <span className="text-muted">Terser</span> to compress and
                mangle JavaScript. Output is functionally equivalent but
                significantly smaller. Mangling can break code that introspects
                <span className="text-muted"> Function.name</span> or relies on
                exact identifier names.
              </p>
              <p>
                <span className="text-muted">Obfuscate</span> uses{" "}
                <span className="text-muted">javascript-obfuscator</span> to
                make code harder to read. This is not encryption and can be
                reversed with effort. Higher presets add significant runtime
                overhead.
              </p>
              <p>
                All three libraries run entirely in your browser. Source code
                never leaves your machine.
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
                  href="https://prettier.io/docs/options"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  Prettier - Options
                </a>
              </li>
              <li>
                <a
                  href="https://terser.org/docs/options/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  Terser - Options
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/javascript-obfuscator/javascript-obfuscator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  javascript-obfuscator
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
