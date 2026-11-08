"use client";

import { useState, useCallback, useMemo, useEffect, type ClipboardEvent } from "react";
import { Upload, Info, ExternalLink, CircleAlert } from "lucide-react";
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
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { FileDrop, FileDropTrigger } from "@/registry/syntaqx/ui/file-drop";
import { InputGroup, InputGroupTextarea } from "@/registry/syntaqx/ui/input-group";
import { PasteButton } from "@/registry/syntaqx/ui/paste-button";
import { Spinner } from "@/registry/syntaqx/ui/spinner";
import { Textarea } from "@/registry/syntaqx/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/registry/syntaqx/ui/toggle-group";
import { ToolHeader } from "@/components/tool-header";

// --- Types ------------------------------------------------------------------

type Mode = "html-to-md" | "md-to-html" | "preview";

// --- Helpers ----------------------------------------------------------------

function byteSize(str: string): string {
  const bytes = new TextEncoder().encode(str).length;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function countWords(s: string): number {
  const trimmed = s.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function readingTime(words: number): string {
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min`;
}

function countHeadings(md: string): number {
  let count = 0;
  let inFence = false;
  for (const line of md.split("\n")) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^#{1,6}\s+\S/.test(line)) count++;
  }
  return count;
}

// --- Lazy loaders -----------------------------------------------------------

// turndown ships `export = TurndownService`, so the module's type *is* the
// class. With esModuleInterop the runtime `default` interop wrapper is what
// we actually want to construct.
type TurndownCtor = typeof import("turndown");
type TurndownInstance = InstanceType<TurndownCtor>;
type TurndownPlugin = Parameters<TurndownInstance["use"]>[0];

let turndownCtor: TurndownCtor | null = null;
let gfmPlugin: TurndownPlugin | null = null;

async function loadTurndown() {
  if (!turndownCtor) {
    const [td, gfm] = await Promise.all([import("turndown"), import("turndown-plugin-gfm")]);
    const mod = td as unknown as { default?: TurndownCtor } & TurndownCtor;
    turndownCtor = mod.default ?? mod;
    gfmPlugin = gfm.gfm;
  }
  return { Turndown: turndownCtor!, gfm: gfmPlugin };
}

type RemarkBundle = {
  remark: typeof import("remark").remark;
  remarkGfm: typeof import("remark-gfm").default;
  remarkRehype: typeof import("remark-rehype").default;
  rehypeSanitize: typeof import("rehype-sanitize").default;
  defaultSchema: typeof import("rehype-sanitize").defaultSchema;
  rehypeStringify: typeof import("rehype-stringify").default;
};
let remarkBundle: RemarkBundle | null = null;
async function loadRemark(): Promise<RemarkBundle> {
  if (!remarkBundle) {
    const [r, gfm, rh, sanitize, rs] = await Promise.all([
      import("remark"),
      import("remark-gfm"),
      import("remark-rehype"),
      import("rehype-sanitize"),
      import("rehype-stringify"),
    ]);
    remarkBundle = {
      remark: r.remark,
      remarkGfm: gfm.default,
      remarkRehype: rh.default,
      rehypeSanitize: sanitize.default,
      defaultSchema: sanitize.defaultSchema,
      rehypeStringify: rs.default,
    };
  }
  return remarkBundle;
}

// --- Page -------------------------------------------------------------------

export default function MarkdownToolPage() {
  const [mode, setMode] = useState<Mode>("html-to-md");

  // Shared input (Markdown for md-to-html and preview; HTML for html-to-md)
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Turndown options
  const [headingStyle, setHeadingStyle] = useState<"atx" | "setext">("atx");
  const [bulletMarker, setBulletMarker] = useState<"-" | "*" | "+">("-");
  const [codeBlockStyle, setCodeBlockStyle] = useState<"fenced" | "indented">("fenced");
  const [useGfm, setUseGfm] = useState(true);

  // --- Mode switching --------------------------------------------------------

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setOutput("");
    setPreviewHtml("");
    setError(null);
    // Input is intentionally preserved when switching between md-to-html and
    // preview, since both consume Markdown.
    if (next === "html-to-md" || mode === "html-to-md") {
      setInput("");
      setFileName(null);
    }
  };

  // --- File handlers --------------------------------------------------------

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

  const clear = () => {
    setInput("");
    setOutput("");
    setPreviewHtml("");
    setError(null);
    setFileName(null);
  };

  // --- HTML → Markdown ------------------------------------------------------

  const convertHtmlToMd = useCallback(
    async (html: string) => {
      if (!html.trim()) {
        setOutput("");
        setError(null);
        return;
      }
      setRunning(true);
      setError(null);
      try {
        const { Turndown, gfm } = await loadTurndown();
        const td = new Turndown({
          headingStyle,
          bulletListMarker: bulletMarker,
          codeBlockStyle,
          emDelimiter: "_",
        });
        if (useGfm && gfm) {
          // turndown-plugin-gfm exports a `gfm` aggregate plugin.
          td.use(gfm as Parameters<typeof td.use>[0]);
        }
        setOutput(td.turndown(html));
      } catch (err) {
        setOutput("");
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setRunning(false);
      }
    },
    [headingStyle, bulletMarker, codeBlockStyle, useGfm],
  );

  // Capture rich HTML from a paste event so we get the styled clipboard
  // contents rather than the flattened plain-text form.
  const handleRichPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (mode !== "html-to-md") return;
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      setFileName(null);
      setInput(html);
      convertHtmlToMd(html);
    }
    // else fall through to default plain-text paste, which we'll convert below
  };

  // --- Markdown → HTML / Preview -------------------------------------------

  const convertMdToHtml = useCallback(async (md: string): Promise<string> => {
    if (!md.trim()) return "";
    const { remark, remarkGfm, remarkRehype, rehypeSanitize, defaultSchema, rehypeStringify } =
      await loadRemark();

    // Security: allow raw HTML through remark-rehype so the input is parsed,
    // then sanitize against the GFM-aware default schema. rehype-stringify is
    // intentionally called without `allowDangerousHtml`, so any node the
    // sanitizer left flagged as raw is dropped instead of emitted. This is
    // what prevents <script>, javascript: URLs, on* handlers, etc. from
    // reaching the DOM via dangerouslySetInnerHTML.
    const file = await remark()
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSanitize, defaultSchema)
      .use(rehypeStringify)
      .process(md);
    return String(file);
  }, []);

  // Re-run html-to-md when its options change and we already have input.
  // convertHtmlToMd is async and calls setState internally; the effect is
  // the right place for that side-effect since we're reacting to option
  // changes rather than deriving from props.
  useEffect(() => {
    if (mode === "html-to-md" && input) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      convertHtmlToMd(input);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headingStyle, bulletMarker, codeBlockStyle, useGfm]);

  // Re-run md-to-html / preview whenever input changes in those modes.
  // This effect orchestrates an async pipeline (remark/rehype) and resets
  // output state when input clears — both legitimate setState-in-effect
  // cases, not derived values we could compute inline.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;
    if (mode === "html-to-md") return;
    if (!input.trim()) {
      setOutput("");
      setPreviewHtml("");
      setError(null);
      return;
    }
    setRunning(true);
    setError(null);
    convertMdToHtml(input)
      .then((html) => {
        if (cancelled) return;
        if (mode === "md-to-html") setOutput(html);
        if (mode === "preview") setPreviewHtml(html);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setRunning(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, input, convertMdToHtml]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // --- Stats ----------------------------------------------------------------

  const sourceForStats = mode === "html-to-md" ? output : input; // markdown text we're measuring
  const stats = useMemo(() => {
    const words = countWords(sourceForStats);
    return {
      chars: sourceForStats.length,
      words,
      headings: countHeadings(sourceForStats),
      reading: readingTime(words),
    };
  }, [sourceForStats]);

  // --- Render ---------------------------------------------------------------

  const inputLabel = mode === "html-to-md" ? "Rich text / HTML" : "Markdown";
  const placeholder =
    mode === "html-to-md"
      ? "Paste content here. Copy from a webpage, doc, or any rich-text source for best results."
      : "Type or paste Markdown here...";

  return (
    <div>
      <ToolHeader title="Markdown Tools">
        <p className="max-w-2xl text-muted-foreground">
          Convert HTML or pasted rich text to clean Markdown, render Markdown to HTML, or preview it
          live. Everything runs in your browser.
        </p>
      </ToolHeader>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: tool */}
        <div className="flex-1 min-w-0">
          {/* Mode */}
          <ToggleGroup
            spacing={0}
            type="single"
            variant="outline"
            aria-label="Mode"
            value={mode}
            onValueChange={(v) => v && switchMode(v as Mode)}
            className="mb-5"
          >
            {/* Short labels on a phone, so the three stay one row. */}
            <ToggleGroupItem value="html-to-md">
              <span className="sm:hidden">HTML → MD</span>
              <span className="max-sm:hidden">HTML to Markdown</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="md-to-html">
              <span className="sm:hidden">MD → HTML</span>
              <span className="max-sm:hidden">Markdown to HTML</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
          </ToggleGroup>

          <div className="flex flex-col gap-4">
            {/* Input */}
            <FileDrop
              accept=".md,.markdown,.txt,.html,.htm,text/markdown,text/html,text/plain"
              onFiles={([file]) => {
                loadFile(file);
                if (mode === "html-to-md") {
                  const reader = new FileReader();
                  reader.onload = () => convertHtmlToMd(reader.result as string);
                  reader.readAsText(file);
                }
              }}
            >
              <Field>
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
                          setInput(text);
                          if (mode === "html-to-md") convertHtmlToMd(text);
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
                      if (mode === "html-to-md") convertHtmlToMd(e.target.value);
                    }}
                    onPaste={handleRichPaste}
                    placeholder={placeholder}
                    rows={mode === "preview" ? 8 : 10}
                    spellCheck={false}
                    className={codeArea}
                  />

                  {/* Options (html-to-md only) */}
                  {mode === "html-to-md" && (
                    <PanelFooter>
                      <OptionSelect
                        label="Headings"
                        value={headingStyle}
                        onValueChange={setHeadingStyle}
                        options={[
                          { value: "atx", label: "# Heading" },
                          { value: "setext", label: "Setext (===)" },
                        ]}
                      />
                      <OptionSelect
                        label="Bullets"
                        value={bulletMarker}
                        onValueChange={setBulletMarker}
                        options={[
                          { value: "-", label: "-" },
                          { value: "*", label: "*" },
                          { value: "+", label: "+" },
                        ]}
                      />
                      <OptionSelect
                        label="Code blocks"
                        value={codeBlockStyle}
                        onValueChange={setCodeBlockStyle}
                        options={[
                          { value: "fenced", label: "Fenced ```" },
                          { value: "indented", label: "Indented" },
                        ]}
                      />
                      <OptionCheckbox
                        checked={useGfm}
                        onCheckedChange={setUseGfm}
                        label="GFM extensions"
                        hint="Tables, strikethrough, and task lists."
                      />
                    </PanelFooter>
                  )}
                </InputGroup>
              </Field>
            </FileDrop>

            {error && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Output */}
            {mode === "preview" ? (
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  Rendered preview
                  {running && <Spinner className="size-3.5 text-muted-foreground" />}
                </span>
                <div
                  className="prose prose-sm prose-invert max-w-none min-h-45 rounded-md border px-4 py-3"
                  // We trust this output because we generated it locally from
                  // the user's own Markdown via remark-rehype.
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            ) : (
              <Field>
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel className="gap-1.5">
                    {mode === "html-to-md" ? "Markdown output" : "HTML output"}
                    {running && <Spinner className="size-3.5 text-muted-foreground" />}
                  </FieldLabel>
                  <div className="flex items-center gap-1.5">
                    {output && (
                      <Stat>
                        {output.length.toLocaleString()} chars &middot; {byteSize(output)}
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
            )}
          </div>
        </div>

        {/* Right: info & stats */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border">
              Stats
            </h3>
            <dl className="px-4 py-3 text-[11px] text-muted-foreground leading-relaxed grid grid-cols-2 gap-y-1.5">
              <dt>Characters</dt>
              <dd className="text-right tabular-nums text-foreground">
                {stats.chars.toLocaleString()}
              </dd>
              <dt>Words</dt>
              <dd className="text-right tabular-nums text-foreground">
                {stats.words.toLocaleString()}
              </dd>
              <dt>Headings</dt>
              <dd className="text-right tabular-nums text-foreground">{stats.headings}</dd>
              <dt>Reading time</dt>
              <dd className="text-right tabular-nums text-foreground">{stats.reading}</dd>
            </dl>
          </div>

          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-primary" />
              About
            </h3>
            <div className="px-4 py-3 text-[11px] text-muted-foreground leading-relaxed space-y-2.5">
              <p>
                <span className="text-foreground">HTML to Markdown</span> accepts raw HTML you type
                or paste. It also intercepts the <span className="text-foreground">text/html</span>{" "}
                entry from your clipboard, so copying from a styled source (a web page, a Google
                Doc, Notion) preserves headings, links, lists, and tables. Pasting plain text just
                keeps it as text.
              </p>
              <p>
                <span className="text-foreground">Markdown to HTML</span> and{" "}
                <span className="text-foreground">Preview</span> use{" "}
                <span className="text-foreground">remark</span> with GFM extensions (tables, task
                lists, strikethrough). Output is passed through{" "}
                <span className="text-foreground">rehype-sanitize</span> before rendering, so script
                tags, event handlers, and <span className="text-foreground">javascript:</span> URLs
                are stripped.
              </p>
              <p>
                If you paste the converted Markdown or HTML into a downstream system that renders it
                for other users, sanitize it again there. The sanitizer here only protects this
                page.
              </p>
            </div>
          </div>

          <div className="border border-border bg-card">
            <h3 className="text-xs font-medium text-foreground px-4 py-3 border-b border-border flex items-center gap-1.5">
              <ExternalLink size={12} className="text-primary" />
              References
            </h3>
            <ul className="px-4 py-3 text-[13px] leading-relaxed lg:text-[11px] space-y-2">
              <li>
                <a
                  href="https://github.com/mixmark-io/turndown"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Turndown - HTML to Markdown
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/remarkjs/remark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  remark - Markdown processor
                </a>
              </li>
              <li>
                <a
                  href="https://github.github.com/gfm/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  GitHub Flavored Markdown spec
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
