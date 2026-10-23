import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/misc/jwt",
  "JWT Debugger",
  "Decode, encode, and verify JSON Web Tokens entirely in your browser: inspect headers, payloads, and signatures without your tokens ever leaving the page.",
);

export default function JwtLayout({ children }: { children: React.ReactNode }) {
  return children;
}
