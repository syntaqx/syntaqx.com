import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JavaScript Beautify / Minify / Obfuscate",
  description:
    "Format, minify, or obfuscate JavaScript and JSON entirely in your browser: nothing is uploaded, everything runs locally on your own machine.",
};

export default function JsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
