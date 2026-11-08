"use client";

import { useState, useCallback } from "react";
import { Upload, Info, ExternalLink, Play, CircleAlert } from "lucide-react";
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
import { Alert, AlertDescription } from "@/registry/syntaqx/ui/alert";
import { Button } from "@/registry/syntaqx/ui/button";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { FileDrop, FileDropTrigger } from "@/registry/syntaqx/ui/file-drop";
import { InputGroup, InputGroupTextarea } from "@/registry/syntaqx/ui/input-group";
import { PasteButton } from "@/registry/syntaqx/ui/paste-button";
import { Spinner } from "@/registry/syntaqx/ui/spinner";
import { Textarea } from "@/registry/syntaqx/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/registry/syntaqx/ui/toggle-group";

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
  const [obfPreset, setObfPreset] = useState<"low" | "medium" | "high">("medium");
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
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">
          JavaScript Beautify / Minify / Obfuscate
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Format, compress, or obfuscate JavaScript and JSON. Everything runs in your browser,
          nothing is sent to a server.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: tool */}
        <div className="flex-1 min-w-0">
          <ToggleGroup
            spacing={0}
            type="single"
            variant="outline"
            aria-label="Mode"
            value={mode}
            onValueChange={(v) => v && switchMode(v as Mode)}
            className="mb-5"
          >
            <ToggleGroupItem value="beautify">Beautify</ToggleGroupItem>
            <ToggleGroupItem value="minify">Minify</ToggleGroupItem>
            <ToggleGroupItem value="obfuscate">Obfuscate</ToggleGroupItem>
          </ToggleGroup>

          <div className="flex flex-col gap-4">
            {/* Input */}
            <FileDrop
              accept=".js,.mjs,.cjs,.json,.jsx,.ts,.tsx,text/javascript,application/json"
              onFiles={([file]) => loadFile(file)}
            >
              <Field>
                <InputGroup className={dropTarget}>
                  <PanelHeader>
                    <FieldLabel className="gap-1.5">
                      Source
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
                          setInput(text);
                          setOutput("");
                          setError(null);
                        }}
                      />
                      {input && <ClearButton onClick={clear} />}
                    </div>
                  </PanelHeader>
                  <InputGroupTextarea
                    value={input}
                    onChange={(e) => {
                      setFileName(null);
                      setInput(e.target.value);
                    }}
                    placeholder="Paste, drop a file, or type code here..."
                    rows={10}
                    spellCheck={false}
                    className={codeArea}
                  />
                  <PanelFooter>
                    {mode === "beautify" && (
                      <>
                        <OptionSelect
                          label="Parser"
                          value={parser}
                          onValueChange={setParser}
                          options={[
                            { value: "babel", label: "JavaScript" },
                            { value: "json", label: "JSON" },
                          ]}
                        />
                        <OptionSelect
                          label="Indent"
                          value={String(tabWidth)}
                          onValueChange={(v) => setTabWidth(Number(v))}
                          options={[
                            { value: "2", label: "2 spaces" },
                            { value: "4", label: "4 spaces" },
                            { value: "8", label: "8 spaces" },
                          ]}
                        />
                        <OptionCheckbox
                          checked={singleQuote}
                          onCheckedChange={setSingleQuote}
                          label="Single quotes"
                        />
                        <OptionCheckbox
                          checked={semi}
                          onCheckedChange={setSemi}
                          label="Semicolons"
                        />
                      </>
                    )}
                    {mode === "minify" && (
                      <>
                        <OptionCheckbox
                          checked={compress}
                          onCheckedChange={setCompress}
                          label="Compress"
                          hint="Apply Terser's compression passes (dead code removal, constant folding, etc.)."
                        />
                        <OptionCheckbox
                          checked={mangle}
                          onCheckedChange={setMangle}
                          label="Mangle names"
                          hint="Rename local variables and functions to shorter identifiers."
                        />
                        <OptionCheckbox
                          checked={minifyKeepClassnames}
                          onCheckedChange={setMinifyKeepClassnames}
                          label="Keep class/function names"
                          hint="Useful when code relies on Function.name or class names at runtime."
                        />
                      </>
                    )}
                    {mode === "obfuscate" && (
                      <>
                        <OptionSelect
                          label="Preset"
                          value={obfPreset}
                          onValueChange={setObfPreset}
                          options={[
                            { value: "low", label: "Low" },
                            { value: "medium", label: "Medium" },
                            { value: "high", label: "High" },
                          ]}
                        />
                        <OptionCheckbox
                          checked={obfStringArray}
                          onCheckedChange={setObfStringArray}
                          label="String array"
                          hint="Extract string literals into an array and reference them indirectly."
                        />
                        <OptionCheckbox
                          checked={obfControlFlow}
                          onCheckedChange={setObfControlFlow}
                          label="Control flow flattening"
                          hint="Rewrites control flow as a switch-based state machine. Significant runtime cost."
                        />
                        <OptionCheckbox
                          checked={obfDeadCode}
                          onCheckedChange={setObfDeadCode}
                          label="Dead code injection"
                          hint="Inject unreachable code to make analysis harder. Increases output size."
                        />
                      </>
                    )}
                  </PanelFooter>
                </InputGroup>
              </Field>
            </FileDrop>

            {/* Run */}
            <div>
              <Button size="sm" onClick={run} disabled={running || !input.trim()}>
                {running ? <Spinner /> : <Play />}
                {running
                  ? "Running..."
                  : mode === "beautify"
                    ? "Beautify"
                    : mode === "minify"
                      ? "Minify"
                      : "Obfuscate"}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Output */}
            <Field>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel>Output</FieldLabel>
                <div className="flex items-center gap-1.5">
                  {output && (
                    <Stat>
                      {output.length.toLocaleString()} chars &middot; {byteSize(output)}
                      {beforeBytes > 0 && (
                        <>
                          {" "}
                          &middot;{" "}
                          <span
                            className={
                              afterBytes < beforeBytes
                                ? "text-primary"
                                : afterBytes > beforeBytes
                                  ? "text-destructive"
                                  : ""
                            }
                          >
                            {pctDelta(beforeBytes, afterBytes)}
                          </span>
                        </>
                      )}
                    </Stat>
                  )}
                  {output && <CopyButton value={output} variant="outline" size="sm" />}
                </div>
              </div>
              <Textarea
                value={output}
                readOnly
                rows={10}
                placeholder="Output will appear here..."
                className={codeArea}
              />
            </Field>
          </div>
        </div>

        {/* Right: info */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-primary" />
              About this tool
            </h3>
            <div className="px-4 py-3 text-[11px] text-muted-foreground leading-relaxed space-y-2.5">
              <p>
                <span className="text-foreground">Beautify</span> uses{" "}
                <span className="text-foreground">Prettier</span> to reformat source with consistent
                indentation, quoting, and line breaks. Choose the{" "}
                <span className="text-foreground">JSON</span> parser for strict JSON input.
              </p>
              <p>
                <span className="text-foreground">Minify</span> uses{" "}
                <span className="text-foreground">Terser</span> to compress and mangle JavaScript.
                Output is functionally equivalent but significantly smaller. Mangling can break code
                that introspects
                <span className="text-foreground"> Function.name</span> or relies on exact
                identifier names.
              </p>
              <p>
                <span className="text-foreground">Obfuscate</span> uses{" "}
                <span className="text-foreground">javascript-obfuscator</span> to make code harder
                to read. This is not encryption and can be reversed with effort. Higher presets add
                significant runtime overhead.
              </p>
              <p>
                All three libraries run entirely in your browser. Source code never leaves your
                machine.
              </p>
            </div>
          </div>

          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border flex items-center gap-1.5">
              <ExternalLink size={12} className="text-primary" />
              References
            </h3>
            <ul className="px-4 py-3 text-[11px] leading-relaxed space-y-2">
              <li>
                <a
                  href="https://prettier.io/docs/options"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Prettier - Options
                </a>
              </li>
              <li>
                <a
                  href="https://terser.org/docs/options/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Terser - Options
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/javascript-obfuscator/javascript-obfuscator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
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
