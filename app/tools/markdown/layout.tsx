import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/tools/markdown",
  "Markdown Tools",
  "Convert HTML to Markdown with rich-text paste support, turn Markdown back into HTML, and preview it live, all running entirely in your browser.",
);

export default function MarkdownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
