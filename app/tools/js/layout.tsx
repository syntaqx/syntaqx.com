import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/tools/js",
  "JavaScript Beautify / Minify / Obfuscate",
  "Format, minify, or obfuscate JavaScript and JSON entirely in your browser: nothing is uploaded, everything runs locally on your own machine.",
);

export default function JsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
