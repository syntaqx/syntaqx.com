import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon Generator",
  description:
    "Convert SVG, PNG, JPG, GIF, WebP, and other images to ICO favicon files. Runs entirely in your browser.",
};

export default function FaviconLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
