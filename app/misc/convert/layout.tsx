import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Format Converter",
  description:
    "Convert between JSON, YAML, and TOML in real time. Edit any format and the others update instantly.",
};

export default function ConvertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
