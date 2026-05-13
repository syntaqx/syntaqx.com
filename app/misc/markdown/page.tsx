"use client";

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  type ClipboardEvent,
  type DragEvent,
} from "react";
import {
  Trash2,
  Upload,
  FileText,
  Info,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { PasteButton } from "@/components/paste-button";
import { CopyButton } from "@/components/copy-button";
import { Checkbox } from "@/components/checkbox";

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
    const [td, gfm] = await Promise.all([
      import("turndown"),
      import("turndown-plugin-gfm"),
    ]);
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
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Turndown options
  const [headingStyle, setHeadingStyle] = useState<"atx" | "setext">("atx");
  const [bulletMarker, setBulletMarker] = useState<"-" | "*" | "+">("-");
  const [codeBlockStyle, setCodeBlockStyle] = useState<"fenced" | "indented">(
    "fenced",
  );
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

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
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
    const {
      remark,
      remarkGfm,
      remarkRehype,
      rehypeSanitize,
      defaultSchema,
      rehypeStringify,
    } = await loadRemark();

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
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          Markdown Tools
        </h1>
        <p className="text-sm text-muted">
          Convert HTML or pasted rich text to clean Markdown, render Markdown to
          HTML, or preview it live. Everything runs in your browser.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: tool */}
        <div className="flex-1 min-w-0">
          {/* Segmented control */}
          <div className="mb-5 inline-flex rounded-lg border border-border p-0.5 bg-surface/50">
            <button
              onClick={() => switchMode("html-to-md")}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                mode === "html-to-md"
                  ? "bg-accent text-background"
                  : "text-dim hover:text-foreground"
              }`}
            >
              HTML to Markdown
            </button>
            <button
              onClick={() => switchMode("md-to-html")}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                mode === "md-to-html"
                  ? "bg-accent text-background"
                  : "text-dim hover:text-foreground"
              }`}
            >
              Markdown to HTML
            </button>
            <button
              onClick={() => switchMode("preview")}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                mode === "preview"
                  ? "bg-accent text-background"
                  : "text-dim hover:text-foreground"
              }`}
            >
              Preview
            </button>
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
                  {inputLabel}
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
                      if (mode === "html-to-md") convertHtmlToMd(text);
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
                    accept=".md,.markdown,.txt,.html,.htm,text/markdown,text/html,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        loadFile(file);
                        if (mode === "html-to-md") {
                          const reader = new FileReader();
                          reader.onload = () =>
                            convertHtmlToMd(reader.result as string);
                          reader.readAsText(file);
                        }
                      }
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
                  if (mode === "html-to-md") convertHtmlToMd(e.target.value);
                }}
                onPaste={handleRichPaste}
                placeholder={placeholder}
                rows={mode === "preview" ? 8 : 10}
                spellCheck={false}
                className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-dim/50 focus:outline-none resize-y font-mono"
              />

              {/* Options (html-to-md only) */}
              {mode === "html-to-md" && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-dim">Headings</label>
                    <select
                      value={headingStyle}
                      onChange={(e) =>
                        setHeadingStyle(e.target.value as "atx" | "setext")
                      }
                      className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent/50 cursor-pointer"
                    >
                      <option value="atx"># Heading</option>
                      <option value="setext">Setext (===)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-dim">Bullets</label>
                    <select
                      value={bulletMarker}
                      onChange={(e) =>
                        setBulletMarker(e.target.value as "-" | "*" | "+")
                      }
                      className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent/50 cursor-pointer"
                    >
                      <option value="-">-</option>
                      <option value="*">*</option>
                      <option value="+">+</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-dim">Code blocks</label>
                    <select
                      value={codeBlockStyle}
                      onChange={(e) =>
                        setCodeBlockStyle(
                          e.target.value as "fenced" | "indented",
                        )
                      }
                      className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent/50 cursor-pointer"
                    >
                      <option value="fenced">Fenced ```</option>
                      <option value="indented">Indented</option>
                    </select>
                  </div>
                  <Checkbox
                    checked={useGfm}
                    onChange={() => setUseGfm((v) => !v)}
                    label="GFM extensions"
                    tooltip="Tables, strikethrough, and task lists."
                  />
                </div>
              )}
            </div>

            {error && (
              <pre className="text-xs text-pink whitespace-pre-wrap font-mono rounded-lg border border-pink/30 bg-pink/5 px-3 py-2">
                {error}
              </pre>
            )}

            {/* Output */}
            {mode === "preview" ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-dim flex items-center gap-1.5">
                    Rendered preview
                    {running && (
                      <Loader2 size={10} className="animate-spin text-dim" />
                    )}
                  </label>
                </div>
                <div
                  className="rounded-lg border border-border bg-surface/50 px-4 py-3 min-h-45 prose prose-invert prose-sm max-w-none"
                  // We trust this output because we generated it locally from
                  // the user's own Markdown via remark-rehype.
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-dim flex items-center gap-1.5">
                    {mode === "html-to-md" ? "Markdown output" : "HTML output"}
                    {running && (
                      <Loader2 size={10} className="animate-spin text-dim" />
                    )}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {output && (
                      <span className="text-[10px] text-dim tabular-nums">
                        {output.length.toLocaleString()} chars &middot;{" "}
                        {byteSize(output)}
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
            )}
          </div>
        </div>

        {/* Right: info & stats */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border">
              Stats
            </h3>
            <dl className="px-4 py-3 text-[11px] text-dim leading-relaxed grid grid-cols-2 gap-y-1.5">
              <dt>Characters</dt>
              <dd className="text-right tabular-nums text-muted">
                {stats.chars.toLocaleString()}
              </dd>
              <dt>Words</dt>
              <dd className="text-right tabular-nums text-muted">
                {stats.words.toLocaleString()}
              </dd>
              <dt>Headings</dt>
              <dd className="text-right tabular-nums text-muted">
                {stats.headings}
              </dd>
              <dt>Reading time</dt>
              <dd className="text-right tabular-nums text-muted">
                {stats.reading}
              </dd>
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-accent" />
              About
            </h3>
            <div className="px-4 py-3 text-[11px] text-dim leading-relaxed space-y-2.5">
              <p>
                <span className="text-muted">HTML to Markdown</span> accepts raw
                HTML you type or paste. It also intercepts the{" "}
                <span className="text-muted">text/html</span> entry from your
                clipboard, so copying from a styled source (a web page, a Google
                Doc, Notion) preserves headings, links, lists, and tables.
                Pasting plain text just keeps it as text.
              </p>
              <p>
                <span className="text-muted">Markdown to HTML</span> and{" "}
                <span className="text-muted">Preview</span> use{" "}
                <span className="text-muted">remark</span> with GFM extensions
                (tables, task lists, strikethrough). Output is passed through{" "}
                <span className="text-muted">rehype-sanitize</span> before
                rendering, so script tags, event handlers, and{" "}
                <span className="text-muted">javascript:</span> URLs are
                stripped.
              </p>
              <p>
                If you paste the converted Markdown or HTML into a downstream
                system that renders it for other users, sanitize it again there.
                The sanitizer here only protects this page.
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
                  href="https://github.com/mixmark-io/turndown"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  Turndown - HTML to Markdown
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/remarkjs/remark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  remark - Markdown processor
                </a>
              </li>
              <li>
                <a
                  href="https://github.github.com/gfm/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
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
