import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Format Converter",
  description:
    "Convert between JSON, YAML, TOML, and more in real time. Edit any format and the others update instantly.",
};

export default function TextConvertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
