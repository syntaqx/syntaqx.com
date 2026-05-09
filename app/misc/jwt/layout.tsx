import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Debugger",
  description:
    "Decode, encode, and verify JSON Web Tokens entirely in your browser.",
};

export default function JwtLayout({ children }: { children: React.ReactNode }) {
  return children;
}
