import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getDocsByCategory } from "@/lib/docs";
import { INDUSTRIES, formatMinutes, industryParts, industrySection } from "@/lib/industries";

interface Props {
  params: Promise<{ industry: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).industry;
  const industry = INDUSTRIES.find((i) => i.slug === slug);
  if (!industry) return {};
  const title = `${industry.name} Industry`;
  return {
    title,
    description: industry.summary,
    openGraph: { title, description: industry.summary, url: `/docs/industries/${industry.slug}` },
  };
}

/** An industry volume's cover: what it covers, how it reads, every chapter. */
export default async function IndustryCover({ params }: Props) {
  const slug = (await params).industry;
  const industry = INDUSTRIES.find((i) => i.slug === slug);
  const volume = getDocsByCategory().find((c) => c.section === industrySection(slug));
  if (!industry || !volume) notFound();

  const minutes = volume.docs.reduce((sum, d) => sum + d.readingMinutes, 0);

  return (
    <article>
      <header className="border-b border-border pb-10">
        <p className="inst mb-4 text-dim">
          <Link href="/docs/industries" className="text-accent transition-colors hover:text-foreground">
            Industries
          </Link>
          <span aria-hidden> · </span>
          {volume.docs.length} chapters
          <span aria-hidden> · </span>
          {formatMinutes(minutes)} read
        </p>
        <h1 className="mb-6 text-4xl leading-[0.95] sm:text-5xl">{industry.name}</h1>
        <div className="max-w-3xl space-y-4 text-muted">
          {industry.intro.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
        <Link
          href={`/docs/${volume.docs[0].slug}`}
          className="inst group mt-8 inline-flex items-center gap-2 border border-accent px-4 py-2.5 text-accent transition-colors hover:bg-accent hover:text-background"
        >
          Start reading
          <ArrowRight size={13} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      {industryParts(volume.docs).map((part) => (
        <section key={part.title || "chapters"}>
          {part.title && <h2 className="inst border-b border-border pt-10 pb-3 text-[0.6rem] text-dim">{part.title}</h2>}
          <ol className="divide-y divide-border border-b border-border">
            {part.docs.map((doc) => {
              const i = volume.docs.indexOf(doc);
              return (
                <li key={doc.slug}>
                  <Link
                    href={`/docs/${doc.slug}`}
                    className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto]"
                  >
                    <span className="inst pt-1 text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-semibold text-foreground transition-colors group-hover:text-accent">
                        {doc.title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-dim">{doc.description}</span>
                    </span>
                    <span className="inst col-start-2 mt-2 text-dim sm:col-start-3 sm:mt-0 sm:pt-1">
                      {doc.readingMinutes} min
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </article>
  );
}
