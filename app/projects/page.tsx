import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Open-source projects, tools, and experiments I've built and maintain, from static servers and developer utilities to the occasional community effort.",
};

interface Project {
  title: string;
  description: string;
  tags: string[];
  url: string;
  /** Short instrument line above the title on cards. */
  kicker?: string;
}

const launched: (Project & { lead?: boolean })[] = [
  {
    title: "Flagon, Inc.",
    kicker: "founder · company",
    description:
      "The company I wish existed, so I made it real. A small, independent software company making good software, in the open: the handbook, the pay, and the way we decide are all public. The products can speak for themselves.",
    tags: ["company", "in the open", "cost + 20%"],
    url: "https://flagon.io",
    lead: true,
  },
  {
    title: "yourpasswordsucks.com",
    kicker: "site",
    description:
      "A tongue-in-cheek single-page site that checks your password and tells you, honestly, how much it sucks.",
    tags: ["html", "security", "passwords", "open source"],
    url: "https://yourpasswordsucks.com",
  },
];

const community: Project[] = [
  {
    title: "Salt Lake City Developers",
    kicker: "founder · meetup",
    description:
      "A meetup community for developers in Salt Lake City to connect, share ideas, and talk shop.",
    tags: ["community", "meetup", "slc"],
    url: "https://slcdevs.com",
  },
];

const projects: Project[] = [
  {
    title: "serve",
    description: "A static http server anywhere you need one.",
    tags: ["cli", "http", "static-site"],
    url: "https://github.com/syntaqx/serve",
  },
  {
    title: "cookie",
    description:
      "A Go package that provides a simple and helpful way to populate structs from Cookies.",
    tags: ["go", "cookie"],
    url: "https://github.com/syntaqx/cookie",
  },
  {
    title: "env",
    description:
      "A simple and helpful way to interact with environment variables in Go.",
    tags: ["go", "env", "dotenv"],
    url: "https://github.com/syntaqx/env",
  },
  {
    title: "setup-kustomize",
    description:
      "A GitHub Action to download and install kustomize, and add it to your $PATH.",
    tags: ["github-action", "kustomize"],
    url: "https://github.com/syntaqx/setup-kustomize",
  },
  {
    title: "capacitor",
    description:
      "An adaptive HTTP client for Go that automatically adjusts concurrency based on rate limiting and capacity signaling headers.",
    tags: ["go", "http", "rate-limiting"],
    url: "https://github.com/syntaqx/capacitor",
  },
  {
    title: "nullable",
    description:
      "A single generic type for values that may be null in Go, with first-class support for JSON and database/sql.",
    tags: ["go", "generics", "json"],
    url: "https://github.com/syntaqx/nullable",
  },
];

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {tags.map((tag) => (
        <li key={tag} className="inst text-dim">
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** A slanted card: the face leans, the content stays upright. */
function SlantCard({ item, lead = false }: { item: Project; lead?: boolean }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative isolate flex h-full min-w-0 flex-col px-8 py-9 sm:px-12"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 -z-10 border md:slant transition-colors ${
          lead
            ? "beams border-accent/60 bg-surface group-hover:border-accent"
            : "border-border bg-surface group-hover:border-border-hover"
        }`}
      />
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 -z-10 h-0.5 md:slant w-16 bg-accent transition-[width] duration-300 ease-out group-hover:w-full"
      />
      <span className="mb-6 flex items-center justify-between gap-4">
        <span className={`inst ${lead ? "text-accent" : "text-dim"}`}>
          {item.kicker}
        </span>
        <ArrowUpRight
          size={16}
          className="text-dim transition-[color,translate] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        />
      </span>
      <h3
        className={`mb-4 leading-[0.9] wrap-break-word text-foreground transition-colors group-hover:text-accent ${
          lead ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl"
        }`}
      >
        {item.title}
      </h3>
      <p
        className={`mb-8 leading-relaxed text-muted ${lead ? "max-w-xl text-lg" : ""}`}
      >
        {item.description}
      </p>
      <div className="mt-auto">
        <Tags tags={item.tags} />
      </div>
    </a>
  );
}

function SectionHead({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <h2 className="eyebrow">{label}</h2>
      <span className="h-px flex-1 bg-border" />
      <span className="inst text-dim tabular-nums">
        {String(count).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className="overflow-x-clip">
      <PageHeader
        label="projects"
        title="Things I've built"
        scene="modules"
        sceneLabel="Modules on a grid, with a teal block being lowered into an empty slot"
      >
        <p>
          Companies, open-source projects, tools, and experiments I&apos;ve
          built and maintain, from static servers and developer utilities to the
          occasional community effort.
        </p>
      </PageHeader>

      <section className="mb-20">
        <SectionHead label="launched" count={launched.length} />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 px-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {launched.map((item) => (
            <SlantCard key={item.title} item={item} lead={item.lead} />
          ))}
        </div>
      </section>

      <section className="mb-20">
        <SectionHead label="open source" count={projects.length} />
        <ol className="border-t border-border">
          {projects.map((p, i) => (
            <li key={p.title} className="border-b border-border">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative isolate grid gap-x-8 gap-y-2 overflow-hidden px-3 py-6 sm:grid-cols-[3rem_minmax(10rem,14rem)_minmax(0,1fr)_auto] sm:items-baseline"
              >
                {/* Diagonal wipe on hover */}
                <span
                  aria-hidden="true"
                  className="slant absolute inset-y-0 -left-8 -z-10 w-0 bg-surface transition-[width] duration-300 ease-out group-hover:w-[calc(100%+4rem)]"
                />
                <span className="font-voice text-xl leading-none font-bold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-3xl leading-none text-foreground transition-colors group-hover:text-accent">
                  {p.title}
                </h3>
                <div className="grid gap-3">
                  <p className="leading-snug text-muted">{p.description}</p>
                  <Tags tags={p.tags} />
                </div>
                <ArrowUpRight
                  size={16}
                  className="hidden text-dim transition-[color,translate] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent sm:block"
                />
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHead label="community" count={community.length} />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 px-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          {community.map((item) => (
            <SlantCard key={item.title} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
