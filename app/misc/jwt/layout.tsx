import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Decoder",
  description:
    "Decode, inspect, and verify JSON Web Tokens entirely in your browser.",
};

export default function JwtLayout({ children }: { children: React.ReactNode }) {
  return children;
}
