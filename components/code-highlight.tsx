"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeHighlightProps {
  code: string;
  lang: string;
  className?: string;
}

export function CodeHighlight({
  code,
  lang,
  className = "",
}: CodeHighlightProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (!code.trim()) {
      setHtml("");
      return;
    }

    let cancelled = false;

    codeToHtml(code, {
      lang,
      themes: { dark: "vitesse-dark", light: "vitesse-light" },
      defaultColor: false,
    })
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        // Unsupported language or shiki error — fallback to plain text
        if (!cancelled) setHtml("");
      });

    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (!html) {
    return (
      <pre
        className={`text-sm font-mono whitespace-pre-wrap text-foreground ${className}`}
      >
        {code}
      </pre>
    );
  }

  return (
    <div
      className={`[&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:text-sm [&_pre]:font-mono [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:!text-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
