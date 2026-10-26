import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/tools/convert/text",
  "Text Format Converter",
  "Convert between JSON, YAML, TOML, and more in real time: edit any format and the others update instantly, all locally in your browser.",
);

export default function TextConvertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
