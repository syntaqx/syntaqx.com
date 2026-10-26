import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/tools/convert",
  "Converters",
  "Browser-based conversion tools for text formats, images, and data: Base64, favicons, and JSON/YAML/TOML, all running locally in your browser.",
);

export default function ConvertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
