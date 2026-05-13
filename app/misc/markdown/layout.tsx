import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Tools",
  description:
    "HTML to Markdown (with rich-text paste support), Markdown to HTML, and a live preview.",
};

export default function MarkdownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
