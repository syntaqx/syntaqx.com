import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal",
  description:
    "Legal information for syntaqx.com — the Terms of Service that govern using the site, and the Privacy policy covering how your data is handled.",
};

const pages = [
  {
    href: "/legal/terms",
    title: "Terms of Service",
    description:
      "What you can expect from the site and what I expect from visitors. Plain language, no surprises.",
  },
  {
    href: "/legal/privacy",
    title: "Privacy",
    description:
      "What's collected, what isn't, and the choices you have. I try to collect as little as possible.",
  },
];

export default function LegalPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          Legal
        </h1>
        <p className="text-sm text-muted">
          The terms and privacy policy for syntaqx.com.
        </p>
      </div>

      <div className="grid gap-3">
        {pages.map((page) => (
          <Link key={page.href} href={page.href} className="group flex flex-col">
            <Card hover className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-accent">
                  {page.title}
                </h2>
                <ArrowRight
                  size={12}
                  className="text-dim group-hover:text-accent transition-colors"
                />
              </div>
              <p className="text-xs text-dim leading-relaxed">
                {page.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
