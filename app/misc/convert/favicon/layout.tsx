import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon Generator",
  description:
    "Convert SVG, PNG, JPG, GIF, WebP, and other images into ICO favicon files, multi-size and ready to drop in, running entirely in your browser.",
};

export default function FaviconLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
