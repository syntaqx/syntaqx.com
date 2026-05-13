import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JavaScript Beautify / Minify / Obfuscate",
  description:
    "Format, compress, or obfuscate JavaScript and JSON, entirely in your browser.",
};

export default function JsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
