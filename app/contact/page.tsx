import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { contactChannels, contactIntro } from "@/lib/contact";
import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/page-header";

export const metadata = pageMetadata(
  "/contact",
  "Contact",
  "How to reach Chase Pierce (syntaqx): book time, connect on LinkedIn, or open an issue on GitHub for problems with syntaqx.com or its public API.",
);

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        label="contact"
        title={
          <>
            Get in <span className="text-accent">touch</span>.
          </>
        }
        scene="plug"
        sceneLabel="A plug lowering into a socket, its light coming on as they connect"
        hideSceneOnMobile
      >
        <p>{contactIntro}</p>
      </PageHeader>
      <div className="max-w-3xl">
        <ul className="mb-12 border-t border-border">
          {contactChannels.map((c) => (
            <li
              key={c.href}
              className="grid gap-2 border-b border-border py-5 sm:grid-cols-[10rem_1fr] sm:gap-6"
            >
              <a
                href={c.href}
                {...(c.href.startsWith("http") && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                className="inline-flex items-center gap-1.5 self-start font-semibold text-foreground transition-colors hover:text-accent"
              >
                {c.label}
                <ArrowUpRight size={13} />
              </a>
              <p className="leading-relaxed text-muted">{c.description}</p>
            </li>
          ))}
        </ul>

        <p className="max-w-2xl leading-relaxed text-muted">
          Building against the public API? Start with the{" "}
          <Link
            href="/docs/api"
            className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent"
          >
            API reference
          </Link>{" "}
          and the{" "}
          <a
            href="/openapi.json"
            className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent"
          >
            OpenAPI spec
          </a>
          . Want new posts without asking? Subscribe to the{" "}
          <a
            href="/feed.xml"
            className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent"
          >
            RSS feed
          </a>
          . For how this site handles your data, see the{" "}
          <Link
            href="/legal/privacy"
            className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent"
          >
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
