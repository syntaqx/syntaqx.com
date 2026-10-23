import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/misc/convert/favicon",
  "Favicon Generator",
  "Convert SVG, PNG, JPG, GIF, WebP, and other images into ICO favicon files, multi-size and ready to drop in, running entirely in your browser.",
);

export default function FaviconLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
